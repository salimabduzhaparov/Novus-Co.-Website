"""Module 5 - sending, governed by AUTO_SEND.

AUTO_SEND=false: everything queues; `novus approve` / the dashboard button
sends only what you OK. AUTO_SEND=true: fully hands-off, bounded by ALL of:
warm-up ramp, MIN_AUTOSEND_GRADE + self-check pass, per-domain throttle, the
hard DAILY_SEND_CAP, the suppression table, and the kill-switch file. The
caps/suppression/kill-switch guards apply to manual approvals too.
"""
from __future__ import annotations

import json
from datetime import timedelta

from sqlalchemy import func, select

from .db import EmailLog, Lead, db_session, is_suppressed, log_event, state_get, state_set
from .providers.gmail import get_mail_backend
from .settings import FREEMAIL_DOMAINS, get_settings
from .util import email_domain, log, today

GRADE_RANK = {"A": 3, "B": 2, "C": 1}


def kill_switch_active() -> bool:
    p = get_settings().kill_switch_path
    if p.exists():
        log.warning("KILL SWITCH engaged (%s exists) - all sending halted", p)
        return True
    return False


def sends_today(sess) -> int:
    return sess.scalar(select(func.count()).select_from(EmailLog)
                       .where(EmailLog.sent_on == today())) or 0


def domain_sends_today(sess, domain: str) -> int:
    return sess.scalar(select(func.count()).select_from(EmailLog)
                       .where(EmailLog.sent_on == today(),
                              EmailLog.domain == domain)) or 0


def warmup_allowance(sess) -> int:
    """Today's auto-send allowance: WARMUP_START, +WARMUP_WEEKLY_STEP per full
    week since auto-send first ran, capped at DAILY_SEND_CAP."""
    s = get_settings()
    start = state_get(sess, "autosend_start_date")
    if start is None:
        state_set(sess, "autosend_start_date", today().isoformat())
        return min(s.warmup_start, s.daily_send_cap)
    from datetime import date as _date
    weeks = max(0, (today() - _date.fromisoformat(start)).days // 7)
    return min(s.daily_send_cap, s.warmup_start + s.warmup_weekly_step * weeks)


def _blocked_reason(sess, lead: Lead, auto: bool, allowance: int) -> str | None:
    s = get_settings()
    if kill_switch_active():
        return "kill switch engaged"
    if not lead.email:
        return "no email address"
    if is_suppressed(sess, lead.email):
        return "suppressed (STOP/bounce)"
    if sends_today(sess) >= s.daily_send_cap:
        return f"daily cap reached ({s.daily_send_cap})"
    if auto and sends_today(sess) >= allowance:
        return f"warm-up allowance reached ({allowance})"
    dom = email_domain(lead.email)
    if dom not in FREEMAIL_DOMAINS and domain_sends_today(sess, dom) >= s.per_domain_daily_limit:
        return f"per-domain throttle ({dom})"
    if auto:
        if GRADE_RANK.get(lead.grade or "C", 0) < GRADE_RANK.get(s.min_autosend_grade, 3):
            return f"grade {lead.grade} below MIN_AUTOSEND_GRADE={s.min_autosend_grade}"
        if not lead.selfcheck_passed:
            return "self-check not passed"
    return None


def _record_send(sess, lead: Lead, touch_no: int, subject: str, result: dict) -> None:
    s = get_settings()
    sess.add(EmailLog(
        lead_id=lead.id, touch_no=touch_no, to_email=lead.email,
        domain=email_domain(lead.email), subject=subject, sent_on=today(),
        message_id=result.get("message_id"), thread_id=result.get("thread_id"),
        mode=get_mail_backend().name,
    ))
    lead.touches_sent = touch_no
    lead.last_touch_date = today()
    if result.get("thread_id"):
        lead.gmail_thread_id = result["thread_id"]
    if touch_no == 1:
        lead.status = "SENT"
        lead.next_follow_up_date = today() + timedelta(days=s.followup_2_days)
    elif touch_no == 2:
        first = sess.scalar(select(EmailLog.sent_on).where(
            EmailLog.lead_id == lead.id, EmailLog.touch_no == 1))
        base = first or today()
        lead.next_follow_up_date = base + timedelta(days=s.followup_3_days)
    else:
        lead.next_follow_up_date = None


def _pending_followup(lead: Lead) -> tuple[int, str, str] | None:
    """(touch_no, draft_id, subject) for a drafted-but-unsent follow-up."""
    if not lead.drafts_json:
        return None
    d = json.loads(lead.drafts_json)
    p = d.get("pending")
    if p:
        return p["touch"], p["draft_id"], p["subject"]
    return None


def _clear_pending(lead: Lead) -> None:
    d = json.loads(lead.drafts_json or "{}")
    d.pop("pending", None)
    lead.drafts_json = json.dumps(d)


def list_queue() -> list[dict]:
    """Everything awaiting a send decision (for CLI + dashboard)."""
    out = []
    with db_session() as sess:
        for lead in sess.scalars(select(Lead).where(Lead.status == "QUEUED")
                                 .order_by(Lead.grade.asc(), Lead.novus_score.desc())):
            d = json.loads(lead.drafts_json or "{}")
            subj = d.get("initial", {}).get("subject", "")
            out.append({"id": lead.id, "business": lead.business_name, "city": lead.city,
                        "grade": lead.grade, "score": lead.novus_score, "email": lead.email,
                        "touch": 1, "subject": subj, "preview_url": lead.preview_url,
                        "selfcheck_passed": bool(lead.selfcheck_passed)})
        for lead in sess.scalars(select(Lead).where(Lead.status == "SENT")):
            p = _pending_followup(lead)
            if p:
                out.append({"id": lead.id, "business": lead.business_name, "city": lead.city,
                            "grade": lead.grade, "score": lead.novus_score, "email": lead.email,
                            "touch": p[0], "subject": p[2], "preview_url": lead.preview_url,
                            "selfcheck_passed": bool(lead.selfcheck_passed)})
    return out


def _send_one(sess, lead: Lead, auto: bool, allowance: int) -> bool:
    reason = _blocked_reason(sess, lead, auto, allowance)
    if reason:
        log.info("not sending to %s: %s", lead.business_name, reason)
        return False
    backend = get_mail_backend()

    pending = _pending_followup(lead)
    if lead.status == "QUEUED":
        touch, draft_id = 1, lead.email_draft_id
        subject = json.loads(lead.drafts_json or "{}").get("initial", {}).get("subject", "")
    elif pending:
        touch, draft_id, subject = pending
    else:
        return False

    result = backend.send_draft(draft_id)
    if pending:
        _clear_pending(lead)
    _record_send(sess, lead, touch, subject, result)
    log_event(sess, "send", f"touch {touch} -> {lead.email} ({'auto' if auto else 'approved'})",
              lead.id)
    log.info("SENT touch %d to %s <%s>", touch, lead.business_name, lead.email)
    return True


def send_queued(auto: bool = True) -> int:
    """AUTO_SEND path (called by the orchestrator when AUTO_SEND=true)."""
    s = get_settings()
    if auto and not s.auto_send:
        log.info("AUTO_SEND=false - leaving %d item(s) in the queue for approval",
                 len(list_queue()))
        return 0
    sent = 0
    with db_session() as sess:
        allowance = warmup_allowance(sess)
        sess.commit()
        leads = sess.scalars(select(Lead).where(Lead.status == "QUEUED")
                             .order_by(Lead.grade.asc(), Lead.novus_score.desc())).all()
        pending = [l for l in sess.scalars(select(Lead).where(Lead.status == "SENT")).all()
                   if _pending_followup(l)]
        for lead in leads + pending:
            if _send_one(sess, lead, auto=auto, allowance=allowance):
                sent += 1
                sess.commit()
    log.info("send stage: %d sent (auto=%s)", sent, auto)
    return sent


def approve_and_send(ids: list[int] | None = None) -> int:
    """Manual approval path (`novus approve` / dashboard). Caps, suppression,
    kill switch and throttles still apply; grade/self-check gates do not."""
    sent = 0
    with db_session() as sess:
        allowance = get_settings().daily_send_cap  # manual path: no warm-up gate
        q = select(Lead).where(Lead.status.in_(["QUEUED", "SENT"]))
        if ids:
            q = q.where(Lead.id.in_(ids))
        for lead in sess.scalars(q.order_by(Lead.grade.asc(), Lead.novus_score.desc())):
            if lead.status == "SENT" and not _pending_followup(lead):
                continue
            if _send_one(sess, lead, auto=False, allowance=allowance):
                sent += 1
                sess.commit()
    return sent
