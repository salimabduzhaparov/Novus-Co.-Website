"""Module 0 - city targeting engine.

Maintains a persisted top-50 ranked city list (rebuilt monthly by Fable 5,
grounded with free Census establishment counts where reachable), then rotates
one city + one niche per day, respecting the city+niche cooldown.
"""
from __future__ import annotations

from datetime import date, datetime, timedelta

import httpx
from sqlalchemy import select

from .claude_client import get_claude
from .db import Batch, City, db_session, log_event, state_get, state_set
from .prompts import CITY_SCHEMA, cities_prompt
from .settings import DEFAULT_NICHES, get_settings
from .util import log, today


def _census_enrichment() -> str:
    """Best-effort grounding: state-level construction-establishment counts from
    the free Census County Business Patterns API (no key). Empty string on any failure."""
    try:
        r = httpx.get(
            "https://api.census.gov/data/2022/cbp",
            params={"get": "ESTAB,NAME", "for": "state:*", "NAICS2017": "23"},
            timeout=20,
        )
        r.raise_for_status()
        rows = r.json()[1:]
        rows.sort(key=lambda x: -int(x[0]))
        top = ", ".join(f"{name}: {estab} construction firms" for estab, name, _ in rows[:15])
        return f"Census CBP 2022, NAICS 23 establishments by state (top 15): {top}"
    except Exception as e:  # noqa: BLE001 - enrichment is optional
        log.info("census enrichment unavailable (%s)", e)
        return ""


def rebuild(force: bool = False) -> int:
    """(Re)build the ranked list. Returns number of cities stored."""
    s = get_settings()
    with db_session() as sess:
        existing = sess.scalars(select(City)).all()
        if existing and not force:
            newest = max(c.built_at for c in existing)
            if datetime.now() - newest < timedelta(days=s.city_refresh_days):
                return len(existing)

        log.info("building top-50 city list with %s ...", s.claude_model)
        claude = get_claude()
        try:
            data = claude.complete_json(cities_prompt(_census_enrichment()),
                                        schema=CITY_SCHEMA, max_tokens=12000)
            rows = data["cities"][:50]
        except Exception as e:  # noqa: BLE001
            log.error("city build via Claude failed (%s); seeding fallback list", e)
            from .demo import DEMO_CITIES
            rows = [{"name": n, "state": st, "pay_probability": p, "biz_density": d,
                     "weak_web_share": w, "spending_power": sp, "competition": c,
                     "rationale": "fallback seed list"}
                    for (n, st, p, d, w, sp, c) in DEMO_CITIES]

        rows.sort(key=lambda r: -float(r.get("pay_probability", 0)))
        # Preserve rotation history for cities that survive the refresh.
        history = {(c.name.lower(), c.state.lower()): (c.last_targeted, c.times_targeted)
                   for c in existing}
        for c in existing:
            sess.delete(c)
        for i, r in enumerate(rows, start=1):
            last, times = history.get((r["name"].lower(), r["state"].lower()), (None, 0))
            sess.add(City(
                name=r["name"], state=r["state"], rank=i,
                pay_probability=float(r["pay_probability"]),
                biz_density=float(r["biz_density"]),
                weak_web_share=float(r["weak_web_share"]),
                spending_power=float(r["spending_power"]),
                competition=float(r["competition"]),
                rationale=r.get("rationale", ""),
                last_targeted=last, times_targeted=times,
            ))
        log_event(sess, "cities", f"rebuilt city list ({len(rows)} cities)")
        sess.commit()
        log.info("city list stored: %d cities", len(rows))
        return len(rows)


def _pick_niche(sess, city_name: str) -> str:
    """Rotate the niche pointer, skipping (city, niche) pairs inside the cooldown."""
    s = get_settings()
    ptr = int(state_get(sess, "niche_ptr", "0") or 0)
    cutoff = today() - timedelta(days=s.city_niche_cooldown_days)
    recent = {
        b.niche for b in sess.scalars(
            select(Batch).where(Batch.city == city_name, Batch.run_date >= cutoff))
    }
    for i in range(len(DEFAULT_NICHES)):
        niche = DEFAULT_NICHES[(ptr + i) % len(DEFAULT_NICHES)]
        if niche not in recent:
            state_set(sess, "niche_ptr", str((ptr + i + 1) % len(DEFAULT_NICHES)))
            return niche
    # Everything is inside cooldown (tiny niche list / heavy reuse): advance anyway.
    state_set(sess, "niche_ptr", str((ptr + 1) % len(DEFAULT_NICHES)))
    return DEFAULT_NICHES[ptr % len(DEFAULT_NICHES)]


def pick_today(city_override: str | None = None, niche_override: str | None = None
               ) -> tuple[str, str]:
    """Today's (city, niche). Round-robin in rank order: the never-targeted city
    with the best rank first; once all have been hit, the least-recently-targeted."""
    rebuild(force=False)
    with db_session() as sess:
        if city_override:
            city_name = city_override
        else:
            city = sess.scalars(
                select(City).order_by(
                    City.last_targeted.is_not(None),  # never-targeted first
                    City.last_targeted.asc(),
                    City.rank.asc(),
                )
            ).first()
            if city is None:
                raise RuntimeError("city list is empty - run `novus cities --rebuild`")
            city.last_targeted = today()
            city.times_targeted += 1
            city_name = f"{city.name}, {city.state}"
        niche = niche_override or _pick_niche(sess, city_name)
        log_event(sess, "cities", f"today's target: {city_name} / {niche}")
        sess.commit()
        log.info("today's target: %s / %s", city_name, niche)
        return city_name, niche
