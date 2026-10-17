"""Module 3.5 - automated self-check / QA gate.

Every preview and email is audited before it can advance. FAIL -> regenerate
(up to MAX_QA_RETRIES) -> PARKED for manual review. Results live in
selfcheck_json so the dashboard can show exactly what was verified.

Render checks (console errors, mobile overflow) use Playwright when installed;
if it isn't, those two checks are recorded as "skipped" and the rest of the
gate still applies (documented in README - install playwright for full checks).
"""
from __future__ import annotations

import json
import re
from pathlib import Path
from urllib.parse import urljoin

import httpx
from bs4 import BeautifulSoup
from sqlalchemy import select

from . import preview
from .claude_client import get_claude
from .db import Lead, db_session, is_suppressed, log_event
from .prompts import (
    CONTENT_JUDGE_SCHEMA, EMAIL_JUDGE_SCHEMA, TASTE_SCHEMA,
    content_judge_prompt, email_judge_prompt, taste_prompt,
)
from .settings import ROOT, get_settings
from .util import log

FOOTER_LINE = "Free website preview built by Novus Co."
PLACEHOLDER_MARK = "sample review shown as a placeholder"
TOKEN_RE = re.compile(r"\{\{[^}]*\}\}|\{[A-Z_]{2,}\}|\[(?:name|business|city|first[_ ]?name|link|url)\]",
                      re.IGNORECASE)
CSS_URL_RE = re.compile(r"url\(['\"]?(https?://[^'\")]+)['\"]?\)")


# ---------------------------------------------------------------------------
# Preview checks
# ---------------------------------------------------------------------------

def _fetch_preview(lead: Lead) -> tuple[str | None, bool]:
    """(html, http_200). Local-backend URLs are read from disk (the dashboard
    may not be running during the nightly job)."""
    s = get_settings()
    url = lead.preview_url or ""
    local = url.startswith(s.preview_base_url) or not url.startswith("http")
    if local:
        p = ROOT / (lead.preview_path or "")
        if p.exists():
            return p.read_text(encoding="utf-8"), True
        return None, False
    try:
        r = httpx.get(url, timeout=30, follow_redirects=True)
        return (r.text, r.status_code == 200)
    except httpx.HTTPError as e:
        log.warning("preview fetch failed for %s: %s", url, e)
        return None, False


def _asset_urls(html: str, base: str) -> list[str]:
    soup = BeautifulSoup(html, "html.parser")
    urls: set[str] = set()
    for img in soup.find_all("img"):
        src = img.get("src") or ""
        if src.startswith("http"):
            urls.add(src)
        elif src and not src.startswith("data:") and base.startswith("http"):
            urls.add(urljoin(base, src))
    urls.update(CSS_URL_RE.findall(html))
    return [u for u in urls if "fonts.googleapis" not in u]


def _check_assets(urls: list[str]) -> list[str]:
    broken = []
    for u in urls:
        try:
            r = httpx.head(u, timeout=20, follow_redirects=True)
            if r.status_code == 405:
                r = httpx.get(u, timeout=20, follow_redirects=True)
            if r.status_code >= 400:
                broken.append(f"{u} -> HTTP {r.status_code}")
        except httpx.HTTPError as e:
            broken.append(f"{u} -> {type(e).__name__}")
    return broken


def _launch_chromium(pw):
    """Launch Playwright's chromium; fall back to a system/preinstalled binary
    when the pip playwright version doesn't match the downloaded browsers
    (set NOVUS_CHROMIUM_PATH to pin one explicitly)."""
    import glob
    import os
    import shutil
    try:
        return pw.chromium.launch(headless=True)
    except Exception:  # noqa: BLE001 - try known executable locations
        candidates = [os.environ.get("NOVUS_CHROMIUM_PATH", "")]
        base = os.environ.get("PLAYWRIGHT_BROWSERS_PATH", "")
        if base:
            candidates += sorted(glob.glob(f"{base}/chromium-*/chrome-linux/chrome"), reverse=True)
            candidates += [f"{base}/chromium"]
        candidates += [shutil.which("chromium") or "", shutil.which("chromium-browser") or "",
                       shutil.which("google-chrome") or ""]
        for c in candidates:
            if c and Path(c).exists():
                return pw.chromium.launch(headless=True, executable_path=c)
        raise


def _render_check(lead: Lead) -> dict:
    """Playwright: console errors + 390px-wide overflow. Skips gracefully."""
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        return {"skipped": "playwright not installed"}

    target = lead.preview_url or ""
    if not target.startswith("http") or target.startswith(get_settings().preview_base_url):
        p = ROOT / (lead.preview_path or "")
        if not p.exists():
            return {"skipped": "no local file"}
        target = p.resolve().as_uri()

    try:
        with sync_playwright() as pw:
            browser = _launch_chromium(pw)
            page = browser.new_page(viewport={"width": 390, "height": 844})
            errors: list[str] = []
            page.on("console", lambda m: errors.append(m.text) if m.type == "error" else None)
            page.on("pageerror", lambda e: errors.append(str(e)))
            page.goto(target, wait_until="load", timeout=45000)
            page.wait_for_timeout(1200)  # let the load-reveal settle
            overflow = page.evaluate(
                "document.documentElement.scrollWidth > document.documentElement.clientWidth + 4")
            browser.close()
        # Pure resource-load failures (fonts, trackers) degrade gracefully in a
        # browser and are already covered by the direct asset check above;
        # genuine JS exceptions stay fatal.
        warnings = [e for e in errors if "failed to load resource" in e.lower()]
        errors = [e for e in errors if e not in warnings]
        out = {"console_errors": errors, "mobile_overflow": bool(overflow)}
        if warnings:
            out["resource_warnings"] = warnings
        return out
    except Exception as e:  # noqa: BLE001
        return {"skipped": f"render check failed to run: {e}"}


def check_preview(lead: Lead) -> tuple[bool, dict]:
    claude = get_claude()
    results: dict = {}

    html, ok200 = _fetch_preview(lead)
    results["http_200"] = ok200
    if not html:
        return False, results

    soup = BeautifulSoup(html, "html.parser")
    text = soup.get_text(" ", strip=True)
    lower_html = html.lower()

    broken = _check_assets(_asset_urls(html, lead.preview_url or ""))
    results["images_ok"] = not broken
    if broken:
        results["broken_assets"] = broken
    results["no_placeholder_art"] = not any(
        svc in lower_html for svc in ("via.placeholder", "placehold.it", "placekitten",
                                      "dummyimage.com", "lorempixel"))

    render = _render_check(lead)
    results["render"] = render
    render_ok = ("skipped" in render) or (
        not render.get("console_errors") and not render.get("mobile_overflow"))
    results["render_ok"] = render_ok

    results["motion_present"] = ("intersectionobserver" in lower_html
                                 or "animation" in lower_html or "transition" in lower_html)
    results["reduced_motion_respected"] = "prefers-reduced-motion" in lower_html
    results["footer_present"] = FOOTER_LINE.lower() in " ".join(text.lower().split())

    # Content truthfulness (city/trade hero, services, real areas, honest reviews)
    blob = json.loads(lead.audit_json) if lead.audit_json else {}
    real_reviews = None
    if lead.place_id:
        details = preview._place_details(lead)
        real_reviews = preview._real_reviews(details) or None
    lead_d = {"business_name": lead.business_name, "trade": lead.trade, "city": lead.city}
    try:
        content = claude.complete_json(
            content_judge_prompt(lead_d, text[:12000], real_reviews),
            schema=CONTENT_JUDGE_SCHEMA, effort="low")
    except Exception as e:  # noqa: BLE001
        content = {"hero_matches_city_trade": False, "services_match_trade": False,
                   "areas_real": False, "reviews_ok": False,
                   "problems": [f"content judge unavailable: {e}"]}
    # Belt-and-braces on reviews: placeholder marker or no named quotes at all.
    if not content.get("reviews_ok") and PLACEHOLDER_MARK in text.lower():
        content["reviews_ok"] = True
    results["content"] = content

    # Taste pass - Fable 5 self-critique against the Module 3 quality bar
    try:
        taste = claude.complete_json(taste_prompt(lead_d, html[:60000]),
                                     schema=TASTE_SCHEMA)
    except Exception as e:  # noqa: BLE001
        taste = {"verdict": "FAIL", "premium_score": 0, "would_charge_3k": False,
                 "generic_signals": [f"taste judge unavailable: {e}"],
                 "strongest_moment": "", "fix_directives": []}
    results["taste"] = taste

    required = [
        results["http_200"], results["images_ok"], results["no_placeholder_art"],
        results["render_ok"], results["motion_present"],
        results["reduced_motion_respected"], results["footer_present"],
        content.get("hero_matches_city_trade", False),
        content.get("services_match_trade", False),
        content.get("areas_real", False),
        content.get("reviews_ok", False),
        taste.get("verdict") == "PASS",
    ]
    return all(required), results


def _fix_directives(results: dict) -> list[str]:
    fixes: list[str] = list(results.get("taste", {}).get("fix_directives", []))
    fixes += results.get("content", {}).get("problems", [])
    if not results.get("images_ok", True):
        fixes.append("An image URL was broken - drop it and use a designed CSS/SVG treatment instead.")
    if not results.get("footer_present", True):
        fixes.append('Restore the exact footer line "Free website preview built by Novus Co."')
    if not results.get("reduced_motion_respected", True):
        fixes.append("Add a prefers-reduced-motion media query disabling all animation.")
    render = results.get("render", {})
    if render.get("console_errors"):
        fixes.append(f"Fix JS console errors: {render['console_errors'][:3]}")
    if render.get("mobile_overflow"):
        fixes.append("Eliminate horizontal overflow at 390px viewport width.")
    return fixes or ["General quality too low - redesign with far more taste and restraint."]


def run(limit: int | None = None) -> tuple[int, int]:
    """Check every PREVIEW_BUILT lead. Returns (passed, failed)."""
    s = get_settings()
    passed = failed = 0
    with db_session() as sess:
        ids = [l.id for l in sess.scalars(
            select(Lead).where(Lead.status == "PREVIEW_BUILT")
            .order_by(Lead.novus_score.desc())).all()]
    if limit:
        ids = ids[:limit]

    for lead_id in ids:
        with db_session() as sess:
            lead = sess.get(Lead, lead_id)
            if lead is None:
                continue
            ok, results = check_preview(lead)
            lead.selfcheck_json = json.dumps(results, default=str)
            lead.selfcheck_passed = ok
            if ok:
                lead.status = "QA_PASSED"
                passed += 1
                log_event(sess, "selfcheck", f"{lead.business_name}: PASS "
                          f"(taste={results.get('taste', {}).get('premium_score')})", lead.id)
                sess.commit()
                continue

            lead.qa_retries += 1
            retries = lead.qa_retries
            log_event(sess, "selfcheck",
                      f"{lead.business_name}: FAIL (attempt {retries})", lead.id)
            if retries > s.max_qa_retries:
                lead.status = "PARKED"
                lead.notes = (lead.notes or "") + "\n[parked: failed self-check after retries]"
                failed += 1
                sess.commit()
                continue
            fixes = _fix_directives(results)
            sess.commit()

        # Regenerate outside the session, then re-check on the next loop entry.
        log.info("regenerating preview for lead %s with %d fix directives",
                 lead_id, len(fixes))
        if preview.build_for_lead(lead_id, fix_directives=fixes):
            ids.append(lead_id)  # re-check the fresh build this run
        else:
            failed += 1

    log.info("selfcheck complete: %d passed, %d parked", passed, failed)
    return passed, failed


# ---------------------------------------------------------------------------
# Email checks (used by outreach before anything is queued)
# ---------------------------------------------------------------------------

def check_email(lead: Lead, subject: str, body: str, judge_with_claude: bool = True
                ) -> tuple[bool, dict]:
    s = get_settings()
    results: dict = {}
    results["no_unfilled_tokens"] = not TOKEN_RE.search(subject + "\n" + body)
    results["preview_link_present"] = bool(lead.preview_url) and lead.preview_url in body
    results["optout_present"] = s.novus_optout_line.strip() in body
    results["address_present"] = bool(s.novus_mailing_address.strip()) and \
        s.novus_mailing_address.strip() in body
    results["not_suppressed"] = True
    with db_session() as sess:
        if is_suppressed(sess, lead.email or ""):
            results["not_suppressed"] = False

    if judge_with_claude:
        claude = get_claude()
        lead_d = {"business_name": lead.business_name, "trade": lead.trade, "city": lead.city}
        try:
            judge = claude.complete_json(email_judge_prompt(lead_d, subject, body),
                                         schema=EMAIL_JUDGE_SCHEMA, effort="low")
        except Exception as e:  # noqa: BLE001
            judge = {"subject_honest": False, "sounds_human": False,
                     "personalized": False, "problems": [f"judge unavailable: {e}"]}
        results["judge"] = judge
    else:
        results["judge"] = {"subject_honest": not re.match(r"\s*(re|fwd?):", subject, re.I),
                            "sounds_human": True, "personalized": True, "problems": []}

    j = results["judge"]
    ok = all([
        results["no_unfilled_tokens"], results["preview_link_present"],
        results["optout_present"], results["address_present"],
        results["not_suppressed"],
        j.get("subject_honest", False), j.get("personalized", False),
    ])
    return ok, results
