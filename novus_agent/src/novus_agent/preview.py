"""Module 3 - premium preview generation (the crown jewel).

The three Novus skeletons carry structure + the mandatory footer; Fable 5
elevates each into a bespoke page per the design guidance in prompts.py.
Finished pages deploy to a live URL (deploy.py) as novusco-preview-<slug>.
"""
from __future__ import annotations

import json
import re
from pathlib import Path

from sqlalchemy import select

from . import deploy, media
from .claude_client import get_claude
from .db import Lead, db_session, log_event
from .prompts import BRIEF_SCHEMA, PAGE_SYSTEM, design_brief_prompt, page_prompt
from .settings import ROOT, get_settings
from .util import log, slugify, write_text

TEMPLATE_MAP = {
    "roofing": "template-bold-trade.html",
    "concrete": "template-bold-trade.html",
    "fencing": "template-bold-trade.html",
    "tree service": "template-bold-trade.html",
    "pressure washing": "template-bold-trade.html",
    "junk removal": "template-bold-trade.html",
    "HVAC": "template-clean-service.html",
    "plumbing": "template-clean-service.html",
    "electrician": "template-clean-service.html",
    "house cleaning": "template-clean-service.html",
    "painting": "template-clean-service.html",
    "pool service": "template-clean-service.html",
    "barbershop": "template-premium-local.html",
    "auto detailing": "template-premium-local.html",
    "landscaping": "template-premium-local.html",
}
DEFAULT_TEMPLATE = "template-clean-service.html"

# Where the brand skeletons may live: the installed skill, or ./templates
SKELETON_DIRS = [
    Path.home() / ".claude" / "skills" / "novus-preview-templates",
    ROOT / "skills" / "novus-preview-templates",
    ROOT / "templates",
]


def skeleton_for(trade: str) -> tuple[str, str]:
    """(template_name, skeleton_html)"""
    name = TEMPLATE_MAP.get(trade, TEMPLATE_MAP.get(trade.lower(), DEFAULT_TEMPLATE))
    for d in SKELETON_DIRS:
        p = d / name
        if p.exists():
            return name, p.read_text(encoding="utf-8")
    raise FileNotFoundError(
        f"skeleton {name} not found in any of: " + ", ".join(str(d) for d in SKELETON_DIRS))


def _place_details(lead: Lead) -> dict:
    if not lead.place_id:
        return {}
    s = get_settings()
    if s.novus_demo:
        from .demo import DemoPlaces
        return DemoPlaces().details(lead.place_id)
    from .providers.places import PlacesClient
    pc = PlacesClient()
    if not pc.available():
        return {}
    try:
        return pc.details(lead.place_id)
    except Exception as e:  # noqa: BLE001
        log.warning("place details refetch failed: %s", e)
        return {}


def _real_reviews(details: dict) -> list[dict]:
    s = get_settings()
    if s.novus_demo:
        from .demo import DemoPlaces
        return DemoPlaces.real_reviews(details)
    from .providers.places import PlacesClient
    return PlacesClient.real_reviews(details)


_FENCE_RE = re.compile(r"^```(?:html)?\s*|\s*```$", re.MULTILINE)


def build_for_lead(lead_id: int, fix_directives: list[str] | None = None) -> bool:
    """Generate (or regenerate) one preview. Returns True on success."""
    s = get_settings()
    claude = get_claude()

    with db_session() as sess:
        lead = sess.get(Lead, lead_id)
        if lead is None:
            return False
        lead_d = {"business_name": lead.business_name, "trade": lead.trade,
                  "city": lead.city, "instagram_handle": lead.instagram_handle}
        blob = json.loads(lead.audit_json) if lead.audit_json else {}

        details = _place_details(lead)
        phone = lead.phone or details.get("formatted_phone_number")
        reviews = _real_reviews(details)

        try:
            brief = claude.complete_json(
                design_brief_prompt(lead_d, blob.get("gbp")), schema=BRIEF_SCHEMA)
            template_name, skeleton = skeleton_for(lead.trade)
            media_urls = media.gather(lead_d, brief, details)

            html = claude.complete(
                page_prompt(lead_d, brief, skeleton,
                            {"hero": media_urls.get("hero"), "section": media_urls.get("section")},
                            reviews, phone, fixes=fix_directives),
                system=PAGE_SYSTEM,
                max_tokens=s.claude_page_max_tokens,
            )
            html = _FENCE_RE.sub("", html).strip()
            if "<!doctype" not in html.lower()[:200]:
                raise ValueError("generator did not return an HTML document")

            slug = slugify(f"{lead.business_name}-{lead.city.split(',')[0]}")
            path = write_text(s.path("previews", slug, "index.html"), html)
            url, backend = deploy.deploy(slug, path)

            lead.preview_path = str(path.relative_to(ROOT))
            lead.preview_url = url
            lead.template_used = template_name
            lead.status = "PREVIEW_BUILT"
            blob["brief"] = brief
            blob["media"] = media_urls
            blob["deploy_backend"] = backend
            lead.audit_json = json.dumps(blob, default=str)
            log_event(sess, "preview",
                      f"{lead.business_name}: {template_name} -> {url} [{backend}]", lead.id)
            sess.commit()
            log.info("preview built for %s -> %s", lead.business_name, url)
            return True
        except Exception as e:  # noqa: BLE001 - park failures, keep the run alive
            sess.rollback()
            log.error("preview build failed for %s: %s", lead.business_name, e)
            with db_session() as sess2:
                l2 = sess2.get(Lead, lead_id)
                if l2 is not None:
                    l2.qa_retries += 1
                    if l2.qa_retries > s.max_qa_retries:
                        l2.status = "PARKED"
                        l2.notes = (l2.notes or "") + f"\n[preview build failed: {e}]"
                    log_event(sess2, "preview", f"build error: {e}", lead_id)
                    sess2.commit()
            return False


def run(limit: int | None = None) -> int:
    """Build previews for the best SCORED leads: grade A first, then B."""
    s = get_settings()
    limit = limit or s.max_previews_per_day
    with db_session() as sess:
        leads = sess.scalars(
            select(Lead).where(Lead.status == "SCORED", Lead.grade.in_(["A", "B"]))
            .order_by(Lead.grade.asc(), Lead.novus_score.desc(), Lead.id)
        ).all()
    built = 0
    for lead in leads[:limit]:
        if build_for_lead(lead.id):
            built += 1
    log.info("preview stage complete: %d built", built)
    return built
