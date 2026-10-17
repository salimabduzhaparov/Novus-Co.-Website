"""Module 1 - daily lead research via the SERP API.

Query style: site:instagram.com "<niche>" "gmail.com" "<city>" plus variants.
Dedupes against the CRM and the suppression table; stops at DAILY_LEAD_TARGET.
"""
from __future__ import annotations

import re

from sqlalchemy import func, select

from .db import Batch, Lead, db_session, is_suppressed, log_event
from .settings import get_settings
from .util import EMAIL_RE, IG_HANDLE_RE, PHONE_RE, log, today


def _serp_client():
    s = get_settings()
    if s.novus_demo:
        from .demo import DemoSerp
        return DemoSerp()
    from .providers.serp import SerpClient
    return SerpClient()


def _queries(niche: str, city: str) -> list[str]:
    city_short = city.split(",")[0].strip()
    return [
        f'site:instagram.com "{niche}" "gmail.com" "{city_short}"',
        f'site:instagram.com "{niche}" "gmail.com" "{city_short}" "owner"',
        f'site:instagram.com "{niche}" "{city_short}" "call" "gmail.com"',
        f'site:instagram.com "{niche}" "{city_short}" "yahoo.com"',
        f'site:facebook.com "{niche}" "gmail.com" "{city_short}"',
    ]


_TITLE_JUNK = re.compile(
    r"\s*(?:\(@[\w.]+\))?\s*(?:•|\||-)?\s*(?:Instagram photos and videos|Instagram|Facebook)?\s*$",
    re.IGNORECASE,
)


def _parse_candidate(result: dict, niche: str, city: str) -> dict | None:
    title = result.get("title", "")
    snippet = result.get("snippet", "")
    link = result.get("link", "")
    blob = f"{title}\n{snippet}\n{link}"

    emails = [e.lower() for e in EMAIL_RE.findall(blob)
              if not e.lower().endswith((".png", ".jpg", ".webp"))]
    if not emails:
        return None  # outreach is email-first; no public email -> skip
    ig = IG_HANDLE_RE.search(link) or IG_HANDLE_RE.search(blob)
    handle = ig.group(1) if ig else None
    if handle and handle.lower() in {"p", "reel", "explore", "stories", "accounts"}:
        handle = None
    phone_m = PHONE_RE.search(blob)

    name = _TITLE_JUNK.sub("", title).strip(" -|•")
    name = name.split(" (@")[0].strip()
    if not name or len(name) < 3:
        name = (handle or emails[0].split("@")[0]).replace(".", " ").replace("_", " ").title()

    return {
        "business_name": name[:200],
        "instagram_handle": handle,
        "email": emails[0],
        "phone": phone_m.group(0) if phone_m else None,
        "trade": niche,
        "city": city,
    }


def run(city: str, niche: str, limit: int | None = None) -> int:
    """Research one city+niche batch. Returns number of NEW leads written."""
    s = get_settings()
    limit = limit or s.daily_lead_target
    serp = _serp_client()
    if not serp.available():
        log.error("no search backend available (set SERP_API_KEY) - skipping research")
        return 0

    captured = 0
    seen_emails: set[str] = set()
    with db_session() as sess:
        for q in _queries(niche, city):
            if captured >= limit:
                break
            try:
                results = serp.search(q, num=25)
            except Exception as e:  # noqa: BLE001 - a bad query must not kill the run
                log.warning("search failed for %r: %s", q, e)
                continue
            log.info("query %r -> %d results", q, len(results))
            for r in results:
                if captured >= limit:
                    break
                cand = _parse_candidate(r, niche, city)
                if not cand or cand["email"] in seen_emails:
                    continue
                seen_emails.add(cand["email"])

                if is_suppressed(sess, cand["email"]):
                    continue
                dup = sess.scalar(select(func.count()).select_from(Lead).where(
                    (func.lower(Lead.email) == cand["email"]) |
                    ((func.lower(Lead.business_name) == cand["business_name"].lower()) &
                     (Lead.city == city))
                ))
                if dup:
                    continue

                sess.add(Lead(**cand, status="NEW", target_batch_date=today(),
                              source_query=q))
                captured += 1

        sess.add(Batch(run_date=today(), city=city, niche=niche, leads_found=captured))
        log_event(sess, "research", f"{city} / {niche}: {captured} new leads")
        sess.commit()

    log.info("research complete: %d new leads for %s / %s", captured, city, niche)
    return captured
