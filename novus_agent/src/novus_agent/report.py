"""Daily report + shared metrics (dashboard uses the same numbers)."""
from __future__ import annotations

from datetime import datetime

from sqlalchemy import func, select

from .db import Batch, EmailLog, EventLog, Lead, db_session
from .settings import get_settings
from .util import today, write_text


def metrics() -> dict:
    with db_session() as sess:
        by_status = dict(sess.execute(
            select(Lead.status, func.count()).group_by(Lead.status)).all())
        by_grade = dict(sess.execute(
            select(Lead.grade, func.count()).where(Lead.grade.is_not(None))
            .group_by(Lead.grade)).all())
        previews = sess.scalar(select(func.count()).select_from(Lead)
                               .where(Lead.preview_url.is_not(None))) or 0
        checked = sess.scalar(select(func.count()).select_from(Lead)
                              .where(Lead.selfcheck_passed.is_not(None))) or 0
        qa_passed = sess.scalar(select(func.count()).select_from(Lead)
                                .where(Lead.selfcheck_passed.is_(True))) or 0
        sent_total = sess.scalar(select(func.count()).select_from(EmailLog)) or 0
        sent_today = sess.scalar(select(func.count()).select_from(EmailLog)
                                 .where(EmailLog.sent_on == today())) or 0
        replies = sess.scalar(select(func.count()).select_from(Lead)
                              .where(Lead.reply_received.is_(True))) or 0
        calls = by_status.get("CALL_BOOKED", 0)
        pipeline_value = sess.scalar(
            select(func.coalesce(func.sum(Lead.deal_value), 0.0))
            .where(Lead.status.in_(["PROPOSAL", "CALL_BOOKED"]))) or 0.0
        won_value = sess.scalar(
            select(func.coalesce(func.sum(Lead.deal_value), 0.0))
            .where(Lead.status == "WON")) or 0.0
        return {
            "by_status": by_status, "by_grade": by_grade,
            "previews_built": previews,
            "qa_pass_rate": round(qa_passed / checked, 2) if checked else None,
            "emails_sent_total": sent_total, "emails_sent_today": sent_today,
            "replies": replies, "calls_booked": calls,
            "pipeline_value": pipeline_value, "won_value": won_value,
            "total_leads": sum(by_status.values()),
        }


def write_daily(stage_summary: dict) -> str:
    """Write reports/YYYY-MM-DD.md, return its path."""
    s = get_settings()
    m = metrics()
    d = today().isoformat()
    lines = [f"# Novus daily report — {d}", ""]
    lines.append(f"_Generated {datetime.now():%H:%M} · AUTO_SEND={'ON' if s.auto_send else 'off (queue for approval)'}_")
    lines.append("")

    lines.append("## Run summary")
    for k, v in stage_summary.items():
        lines.append(f"- **{k}**: {v}")
    lines.append("")

    with db_session() as sess:
        batch = sess.scalars(select(Batch).where(Batch.run_date == today())
                             .order_by(Batch.id.desc())).first()
        if batch:
            lines.append(f"Target batch: **{batch.city} / {batch.niche}** — {batch.leads_found} new leads")
            lines.append("")

        lines.append("## Pipeline")
        for status, n in sorted(m["by_status"].items()):
            lines.append(f"- {status}: {n}")
        lines.append("")
        lines.append(f"Grades: {m['by_grade']} · Previews built: {m['previews_built']} · "
                     f"QA pass rate: {m['qa_pass_rate']} · Sent today: {m['emails_sent_today']} "
                     f"(total {m['emails_sent_total']}) · Replies: {m['replies']} · "
                     f"Pipeline $: {m['pipeline_value']:.0f}")
        lines.append("")

        todays = sess.scalars(select(Lead).where(Lead.target_batch_date == today())
                              .order_by(Lead.novus_score.desc())).all()
        if todays:
            lines.append("## Today's leads")
            lines.append("| Business | Grade | Score | Status | Preview |")
            lines.append("|---|---|---|---|---|")
            for l in todays:
                url = l.preview_url or ""
                lines.append(f"| {l.business_name} | {l.grade or '-'} | {l.novus_score or '-'} "
                             f"| {l.status} | {url} |")
            lines.append("")

        parked = sess.scalars(select(Lead).where(
            Lead.status == "PARKED", Lead.updated_at >= datetime.combine(today(), datetime.min.time())
        )).all()
        if parked:
            lines.append("## Parked today (needs a human eye)")
            for l in parked:
                lines.append(f"- {l.business_name} ({l.grade}): {(l.notes or '').splitlines()[-1]}")
            lines.append("")

        events = sess.scalars(select(EventLog)
                              .where(EventLog.at >= datetime.combine(today(), datetime.min.time()))
                              .order_by(EventLog.at)).all()
        if events:
            lines.append("## Activity log")
            for e in events[-60:]:
                lines.append(f"- `{e.at:%H:%M}` [{e.stage}] {e.message}")

    path = write_text(s.path("reports", f"{d}.md"), "\n".join(lines) + "\n")
    return str(path)
