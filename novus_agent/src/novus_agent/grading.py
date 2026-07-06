"""Module 2 - website detection + audit + Novus Score (0-100, A/B/C).

Scoring note: a business with NO website scores the site-quality flags
(not_mobile / no_https / no_booking_cta / slow_outdated) as true - their web
presence has none of those things - which is what makes no-site leads the
A-grade sweet spot the whole pipeline exists for.
"""
from __future__ import annotations

import json
import time

import httpx
from bs4 import BeautifulSoup
from sqlalchemy import select

from .claude_client import get_claude
from .db import Lead, db_session, log_event
from .prompts import why_note_prompt
from .settings import get_settings
from .util import log, polite_sleep, today

BOOKING_WORDS = ("book", "schedule", "appointment", "estimate", "quote",
                 "get started", "request service", "contact us")
DATED_MARKERS = ("<font", "<marquee", "<frameset", "flash", "swfobject",
                 "sites.google.com/", "tripod.com", "angelfire")


def _places_client():
    s = get_settings()
    if s.novus_demo:
        from .demo import DemoPlaces
        return DemoPlaces()
    from .providers.places import PlacesClient
    return PlacesClient()


def audit_site(url: str) -> dict:
    """Fetch + heuristically audit an existing site."""
    s = get_settings()
    if s.novus_demo:
        from .demo import demo_audit
        return demo_audit(url)

    audit: dict = {"url": url, "reachable": False, "https_valid": url.lower().startswith("https")}
    started = time.monotonic()
    try:
        r = httpx.get(url, timeout=20, follow_redirects=True,
                      headers={"User-Agent": "Mozilla/5.0 (compatible; NovusAudit/1.0)"})
        audit["status"] = r.status_code
        audit["reachable"] = r.status_code < 500
        html = r.text or ""
    except httpx.ConnectError as e:
        if "certificate" in str(e).lower() or "ssl" in str(e).lower():
            audit["https_valid"] = False
            try:  # still audit content over an insecure fetch
                r = httpx.get(url, timeout=20, follow_redirects=True, verify=False)
                audit["status"] = r.status_code
                audit["reachable"] = r.status_code < 500
                html = r.text or ""
            except httpx.HTTPError:
                return audit
        else:
            audit["error"] = str(e)
            return audit
    except httpx.HTTPError as e:
        audit["error"] = str(e)
        return audit

    elapsed = time.monotonic() - started
    audit["load_seconds"] = round(elapsed, 2)
    audit["page_weight_kb"] = round(len(html.encode(errors="ignore")) / 1024)
    audit["load_signal"] = "slow" if (elapsed > 4 or audit["page_weight_kb"] > 3000) else "ok"
    audit["https_valid"] = audit["https_valid"] and str(r.url).startswith("https")

    soup = BeautifulSoup(html, "html.parser")
    audit["title"] = (soup.title.get_text(strip=True) if soup.title else "")[:150]
    viewport = soup.find("meta", attrs={"name": "viewport"})
    audit["mobile_responsive"] = bool(viewport) and "width" in (viewport.get("content") or "")

    text = soup.get_text(" ", strip=True).lower()
    lower_html = html.lower()
    audit["has_booking_or_cta"] = any(w in text or w in lower_html for w in BOOKING_WORDS)

    dated = [m for m in DATED_MARKERS if m in lower_html]
    import re as _re
    years = [int(y) for y in _re.findall(r"(?:©|&copy;|copyright)\s*(\d{4})", lower_html)]
    if years and max(years) < today().year - 2:
        dated.append(f"copyright {max(years)}")
    audit["dated_design_signals"] = dated
    return audit


def score_lead(has_website: bool, audit: dict | None, gbp: dict | None,
               email: str | None, phone: str | None, ig: str | None) -> tuple[int, dict]:
    w = get_settings().weights
    parts: dict[str, int] = {}
    audit = audit or {}

    def add(key: str, cond: bool) -> None:
        if cond:
            parts[key] = w[key]

    add("no_site", not has_website)
    # No site at all => the presence also has no mobile view, no HTTPS, no CTA.
    add("not_mobile", (not has_website) or not audit.get("mobile_responsive", False))
    add("no_https", (not has_website) or not audit.get("https_valid", False))
    add("slow_outdated", (not has_website) or bool(audit.get("dated_design_signals"))
        or audit.get("load_signal") == "slow")
    add("no_booking_cta", (not has_website) or not audit.get("has_booking_or_cta", False))

    weak_gbp = True
    if gbp:
        weak_gbp = ((gbp.get("review_count") or 0) < 15 or (gbp.get("rating") or 0) < 4.0
                    or (gbp.get("photo_count") or 0) < 5)
    add("weak_gbp", weak_gbp)
    add("public_contact", bool(email or phone))
    add("active_ig", bool(ig))

    return min(100, sum(parts.values())), parts


def grade_for(score: int) -> str:
    return "A" if score >= 70 else ("B" if score >= 40 else "C")


def run(limit: int | None = None) -> int:
    """Grade every NEW lead. Returns count processed."""
    places = _places_client()
    claude = get_claude()
    processed = 0

    with db_session() as sess:
        leads = sess.scalars(select(Lead).where(Lead.status == "NEW")
                             .order_by(Lead.id)).all()
        if limit:
            leads = leads[:limit]
        for lead in leads:
            try:
                gbp = None
                details: dict = {}
                if places.available():
                    place = places.find_place(lead.business_name, lead.city)
                    if place and place.get("place_id"):
                        lead.place_id = place["place_id"]
                        details = places.details(lead.place_id)
                        gbp = places.gbp_summary(details)

                website = details.get("website")
                lead.has_website = bool(website)
                lead.website_url = website
                audit = audit_site(website) if website else None
                if website:
                    polite_sleep()

                score, parts = score_lead(lead.has_website, audit, gbp,
                                          lead.email, lead.phone, lead.instagram_handle)
                lead.novus_score = score
                lead.grade = grade_for(score)
                lead.audit_json = json.dumps(
                    {"audit": audit, "gbp": gbp, "score_parts": parts}, default=str)

                lead_d = {"business_name": lead.business_name, "trade": lead.trade,
                          "city": lead.city, "has_website": lead.has_website,
                          "website_url": lead.website_url}
                try:
                    lead.notes = claude.complete(
                        why_note_prompt(lead_d, {"audit": audit, "gbp": gbp}),
                        max_tokens=2048, effort="low").strip()
                except Exception as e:  # noqa: BLE001 - the note is nice-to-have
                    log.warning("why-note failed for %s: %s", lead.business_name, e)

                # C-grade goes straight to PARKED (spec: work A first, then B).
                lead.status = "PARKED" if lead.grade == "C" else "SCORED"
                log_event(sess, "grading",
                          f"{lead.business_name}: score={score} grade={lead.grade}",
                          lead.id)
                processed += 1
                sess.commit()
            except Exception as e:  # noqa: BLE001 - one bad lead must not stop the run
                sess.rollback()
                log.error("grading failed for lead %s (%s): %s", lead.id,
                          lead.business_name, e)
    log.info("grading complete: %d leads", processed)
    return processed
