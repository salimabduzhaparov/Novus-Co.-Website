"""Module 7 - the one daily entrypoint.

cities.pick_today -> research -> grade -> preview -> selfcheck -> draft ->
(send if AUTO_SEND) -> followups -> daily report. Fully unattended: every
stage is fenced so one failure never kills the run, and nothing ever prompts.
"""
from __future__ import annotations

from . import cities, followups, grading, outreach, preview, report, research, selfcheck
from . import send as send_mod
from .settings import get_settings
from .util import log


def run_daily(city: str | None = None, niche: str | None = None) -> dict:
    s = get_settings()
    summary: dict = {}
    log.info("=== novus daily run starting (demo=%s, auto_send=%s) ===",
             s.novus_demo, s.auto_send)

    def stage(name: str, fn):
        try:
            summary[name] = fn()
        except Exception as e:  # noqa: BLE001 - unattended run must survive
            log.exception("stage %s failed", name)
            summary[name] = f"FAILED: {e}"

    target = {"city": None, "niche": None}

    def _pick():
        target["city"], target["niche"] = cities.pick_today(city, niche)
        return f"{target['city']} / {target['niche']}"

    stage("city", _pick)
    if target["city"]:
        stage("research", lambda: research.run(target["city"], target["niche"]))
    stage("graded", grading.run)
    stage("previews_built", preview.run)
    stage("selfcheck (passed, parked)", selfcheck.run)
    stage("drafted+queued", outreach.run)
    if s.auto_send:
        stage("sent", lambda: send_mod.send_queued(auto=True))
    else:
        summary["sent"] = f"AUTO_SEND=false -> {len(send_mod.list_queue())} in approval queue"
    stage("followups", followups.run)
    stage("report", lambda: report.write_daily(summary))

    log.info("=== daily run complete ===")
    for k, v in summary.items():
        log.info("  %-28s %s", k, v)
    return summary
