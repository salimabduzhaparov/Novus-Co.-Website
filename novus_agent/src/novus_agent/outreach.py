"""Module 4 - outreach drafting.

For each QA_PASSED lead, Fable 5 writes a personalized 3-touch sequence.
The compliance footer (business name + mailing address + opt-out) is appended
programmatically so it can never be forgotten, then the email self-check gate
runs before anything is queued. Initial touch becomes a Gmail draft; the two
follow-ups are stored on the lead for the follow-up job to thread later.
"""
from __future__ import annotations

import json

from sqlalchemy import select

from .claude_client import get_claude
from .db import Lead, db_session, log_event
from .prompts import EMAILS_SCHEMA, emails_prompt
from .providers.gmail import get_mail_backend
from .selfcheck import check_email
from .settings import get_settings
from .util import log


def compliance_footer() -> str:
    s = get_settings()
    return (f"\n\n--\n{s.novus_business_name} · {s.novus_mailing_address}\n"
            f"{s.novus_optout_line}")


def audit_hook(lead: Lead) -> str:
    """One honest, specific observation for the email opener."""
    blob = json.loads(lead.audit_json) if lead.audit_json else {}
    parts = blob.get("score_parts", {})
    city_short = lead.city.split(",")[0]
    if "no_site" in parts:
        return (f"I went looking for {lead.business_name} online and couldn't find a "
                f"website - just the Instagram - while your {city_short} competitors "
                f"show up with full sites.")
    audit = blob.get("audit") or {}
    if not audit.get("mobile_responsive", True):
        return (f"I checked {lead.website_url} on a phone and it doesn't adapt to the "
                f"screen - and most {city_short} customers will hit it from a phone.")
    if not audit.get("https_valid", True):
        return (f"Browsers currently flag {lead.website_url} as 'not secure' (no HTTPS), "
                f"which is a rough first impression for new customers.")
    if not audit.get("has_booking_or_cta", True):
        return (f"Your current site gives visitors no clear way to request a quote or "
                f"book - people have to hunt for how to hire you.")
    return (f"Your online presence undersells the reviews you've earned around "
            f"{city_short}.")


def run(limit: int | None = None) -> int:
    """Draft outreach for QA_PASSED leads. Returns number queued."""
    s = get_settings()
    if not s.novus_mailing_address.strip():
        log.error("NOVUS_MAILING_ADDRESS is empty - refusing to draft outreach "
                  "(CAN-SPAM requires a physical mailing address in every email). "
                  "Set it in .env and re-run `novus draft`.")
        return 0

    claude = get_claude()
    backend = get_mail_backend()
    queued = 0

    with db_session() as sess:
        leads = sess.scalars(
            select(Lead).where(Lead.status == "QA_PASSED", Lead.email.is_not(None))
            .order_by(Lead.grade.asc(), Lead.novus_score.desc())).all()
        if limit:
            leads = leads[:limit]

        for lead in leads:
            try:
                lead_d = {"business_name": lead.business_name, "trade": lead.trade,
                          "city": lead.city}
                drafts = None
                results: dict = {}
                for attempt in range(s.max_qa_retries + 1):
                    cand = claude.complete_json(
                        emails_prompt(lead_d, lead.preview_url or "", audit_hook(lead),
                                      sender_name="Salim",
                                      business_name=s.novus_business_name),
                        schema=EMAILS_SCHEMA)
                    for key in ("initial", "followup2", "followup3"):
                        cand[key]["body"] = cand[key]["body"].rstrip() + compliance_footer()

                    ok, results = check_email(lead, cand["initial"]["subject"],
                                              cand["initial"]["body"], judge_with_claude=True)
                    if ok:
                        for key in ("followup2", "followup3"):
                            ok2, r2 = check_email(lead, cand[key]["subject"],
                                                  cand[key]["body"], judge_with_claude=False)
                            results[f"{key}_check"] = r2
                            ok = ok and ok2
                    if ok:
                        drafts = cand
                        break
                    log.warning("email self-check FAILED for %s (attempt %d): %s",
                                lead.business_name, attempt + 1,
                                results.get("judge", {}).get("problems"))

                sc = json.loads(lead.selfcheck_json) if lead.selfcheck_json else {}
                sc["email"] = results
                lead.selfcheck_json = json.dumps(sc, default=str)

                if drafts is None:
                    lead.status = "PARKED"
                    lead.notes = (lead.notes or "") + "\n[parked: email failed self-check]"
                    log_event(sess, "outreach", f"{lead.business_name}: email QA fail -> PARKED",
                              lead.id)
                    sess.commit()
                    continue

                d = backend.create_draft(lead.email, drafts["initial"]["subject"],
                                         drafts["initial"]["body"])
                lead.email_draft_id = d["draft_id"]
                lead.gmail_thread_id = d.get("thread_id")
                lead.drafts_json = json.dumps(drafts)
                lead.status = "DRAFTED"
                log_event(sess, "outreach", f"{lead.business_name}: drafted "
                          f"({backend.name}: {d['draft_id']})", lead.id)
                lead.status = "QUEUED"
                queued += 1
                sess.commit()
            except Exception as e:  # noqa: BLE001 - keep the batch moving
                sess.rollback()
                log.error("outreach drafting failed for %s: %s", lead.business_name, e)

    log.info("outreach complete: %d leads queued (backend=%s)", queued, backend.name)
    return queued
