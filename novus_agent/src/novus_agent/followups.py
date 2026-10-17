"""Module 6 - follow-up job.

Daily: (1) poll Gmail threads for replies - STOP/bounces go to suppression
forever, real replies stop the sequence; (2) for leads whose
next_follow_up_date is due (status SENT, <3 touches, not replied, not
suppressed), draft the next touch in-thread. AUTO_SEND=true sends it under the
same caps; otherwise it waits in the approval queue.
"""
from __future__ import annotations

import json

from sqlalchemy import select

from . import send as send_mod
from .db import Lead, db_session, is_suppressed, log_event, suppress
from .providers.gmail import classify_reply, get_mail_backend
from .settings import get_settings
from .util import log, today


def poll_replies() -> int:
    """Check threads of contacted leads. Returns number of replies found."""
    backend = get_mail_backend()
    if backend.name == "outbox":
        log.warning("outbox mode: no mailbox to poll for replies/STOP/bounces - "
                    "run `novus gmail-auth` to enable real reply detection")
        return 0

    found = 0
    with db_session() as sess:
        leads = sess.scalars(select(Lead).where(
            Lead.status == "SENT", Lead.reply_received.is_(False),
            Lead.gmail_thread_id.is_not(None))).all()
        for lead in leads:
            try:
                replies = backend.thread_replies(lead.gmail_thread_id)
            except Exception as e:  # noqa: BLE001
                log.warning("thread poll failed for %s: %s", lead.business_name, e)
                continue
            for r in replies:
                kind = classify_reply(r)
                if kind == "BOUNCE":
                    suppress(sess, lead.email, "BOUNCE", detail=r.get("snippet", ""))
                    lead.status = "PARKED"
                    lead.next_follow_up_date = None
                    lead.notes = (lead.notes or "") + "\n[bounced - suppressed]"
                    log_event(sess, "followups", f"{lead.email}: bounce -> suppressed", lead.id)
                elif kind == "STOP":
                    suppress(sess, lead.email, "STOP", detail=r.get("snippet", ""))
                    lead.status = "LOST"
                    lead.next_follow_up_date = None
                    lead.notes = (lead.notes or "") + "\n[STOP reply - suppressed forever]"
                    log_event(sess, "followups", f"{lead.email}: STOP -> suppressed", lead.id)
                else:
                    lead.reply_received = True
                    lead.status = "REPLIED"
                    lead.next_follow_up_date = None
                    found += 1
                    log_event(sess, "followups",
                              f"{lead.business_name} REPLIED: {r.get('snippet', '')[:120]}",
                              lead.id)
                break  # first non-self message decides the thread's fate
            sess.commit()
    if found:
        log.info("replies detected: %d", found)
    return found


def draft_due_followups() -> int:
    """Create the next touch for every due lead. Returns drafts created."""
    s = get_settings()
    backend = get_mail_backend()
    drafted = 0

    with db_session() as sess:
        due = sess.scalars(select(Lead).where(
            Lead.status == "SENT",
            Lead.reply_received.is_(False),
            Lead.touches_sent < 3,
            Lead.next_follow_up_date.is_not(None),
            Lead.next_follow_up_date <= today(),
        )).all()

        for lead in due:
            if is_suppressed(sess, lead.email or ""):
                lead.next_follow_up_date = None
                sess.commit()
                continue
            drafts = json.loads(lead.drafts_json or "{}")
            if drafts.get("pending"):
                continue  # already drafted, awaiting approval
            next_touch = lead.touches_sent + 1
            key = f"followup{next_touch}"
            if key not in drafts:
                lead.next_follow_up_date = None
                sess.commit()
                continue
            try:
                d = backend.create_draft(lead.email, drafts[key]["subject"],
                                         drafts[key]["body"],
                                         thread_id=lead.gmail_thread_id)
            except Exception as e:  # noqa: BLE001
                log.error("follow-up draft failed for %s: %s", lead.business_name, e)
                continue
            drafts["pending"] = {"touch": next_touch, "draft_id": d["draft_id"],
                                 "subject": drafts[key]["subject"]}
            lead.drafts_json = json.dumps(drafts)
            drafted += 1
            log_event(sess, "followups",
                      f"{lead.business_name}: touch {next_touch} drafted", lead.id)
            sess.commit()

    log.info("follow-ups drafted: %d", drafted)
    return drafted


def run() -> dict:
    """Daily follow-up job: poll replies, draft due touches, auto-send if enabled."""
    s = get_settings()
    replies = poll_replies()
    drafted = draft_due_followups()
    sent = send_mod.send_queued(auto=True) if (s.auto_send and drafted) else 0
    return {"replies": replies, "followups_drafted": drafted, "followups_sent": sent}
