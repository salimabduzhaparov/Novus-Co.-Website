"""`novus` CLI - every stage standalone + the daily unattended entrypoint."""
from __future__ import annotations

import argparse
import json
import os
import sys


def _apply_demo_flag(demo: bool) -> None:
    if demo:
        os.environ["NOVUS_DEMO"] = "true"
    from .settings import reset_settings_cache
    reset_settings_cache()


def cmd_daily(args) -> int:
    from .orchestrator import run_daily
    summary = run_daily(city=args.city, niche=args.niche)
    print("\n=== DAILY SUMMARY ===")
    for k, v in summary.items():
        print(f"  {k:28} {v}")
    return 0 if not any(str(v).startswith("FAILED") for v in summary.values()) else 1


def cmd_cities(args) -> int:
    from sqlalchemy import select

    from . import cities
    from .db import City, db_session
    if args.rebuild:
        n = cities.rebuild(force=True)
        print(f"city list rebuilt: {n} cities")
    with db_session() as sess:
        rows = sess.scalars(select(City).order_by(City.rank)).all()
        if not rows:
            print("no cities yet - run: novus cities --rebuild")
            return 1
        print(f"{'#':>3} {'city':24} {'st':2} {'pay':>5} {'last targeted':13} hits")
        for c in rows[: args.limit]:
            print(f"{c.rank:>3} {c.name:24.24} {c.state:2.2} {c.pay_probability:5.2f} "
                  f"{str(c.last_targeted or '-'):13} {c.times_targeted}")
    return 0


def cmd_research(args) -> int:
    from . import research
    n = research.run(args.city, args.niche, args.limit)
    print(f"{n} new leads captured")
    return 0


def cmd_add_lead(args) -> int:
    """Drop a specific business into the pipeline by hand; the next
    grade -> preview -> selfcheck -> draft run tailors everything to it."""
    from .db import Lead, db_session, is_suppressed, log_event
    from .util import today
    with db_session() as sess:
        if args.email and is_suppressed(sess, args.email):
            print(f"refusing: {args.email} is on the suppression list")
            return 1
        lead = Lead(business_name=args.name, trade=args.niche, city=args.city,
                    email=args.email, phone=args.phone, instagram_handle=args.instagram,
                    website_url=args.website, status="NEW", target_batch_date=today(),
                    source_query="manual:add-lead")
        sess.add(lead)
        sess.flush()
        log_event(sess, "research", f"manually added: {args.name}", lead.id)
        sess.commit()
        print(f"lead #{lead.id} added: {args.name} ({args.niche}, {args.city})")
        print("next: novus grade && novus preview && novus selfcheck && novus draft")
    return 0


def cmd_grade(args) -> int:
    from . import grading
    print(f"{grading.run(args.limit)} leads graded")
    return 0


def cmd_preview(args) -> int:
    from . import preview
    print(f"{preview.run(args.limit)} previews built")
    return 0


def cmd_selfcheck(args) -> int:
    from . import selfcheck
    passed, parked = selfcheck.run(args.limit)
    print(f"self-check: {passed} passed, {parked} parked")
    return 0


def cmd_draft(args) -> int:
    from . import outreach
    print(f"{outreach.run(args.limit)} leads drafted + queued")
    return 0


def cmd_approve(args) -> int:
    from . import send
    queue = send.list_queue()
    if not queue:
        print("queue is empty - nothing awaiting approval")
        return 0
    print(f"\n{len(queue)} email(s) awaiting approval:\n")
    print(f"{'id':>4} {'grade':5} {'score':5} {'touch':5} {'QA':3} {'business':28} subject")
    for q in queue:
        print(f"{q['id']:>4} {q['grade'] or '-':5} {q['score'] or 0:<5} {q['touch']:<5} "
              f"{'ok' if q['selfcheck_passed'] else 'NO':3} {q['business']:28.28} {q['subject']}")
        print(f"     preview: {q['preview_url']}")
    ids = [int(x) for x in args.ids.split(",")] if args.ids else None
    if not args.yes:
        target = f"{len(ids)} selected" if ids else f"all {len(queue)}"
        answer = input(f"\nSend {target} now? [y/N] ").strip().lower()
        if answer != "y":
            print("nothing sent")
            return 0
    n = send.approve_and_send(ids)
    print(f"{n} email(s) sent")
    return 0


def cmd_followups(args) -> int:
    from . import followups
    print(json.dumps(followups.run(), indent=2))
    return 0


def cmd_report(args) -> int:
    from . import report
    path = report.write_daily({"manual": "regenerated via `novus report`"})
    print(f"report written: {path}")
    return 0


def cmd_dashboard(args) -> int:
    from .dashboard import serve
    serve(host=args.host, port=args.port)
    return 0


def cmd_gmail_auth(args) -> int:
    from .providers.gmail import GmailBackend
    GmailBackend().run_oauth_flow()
    return 0


def cmd_schedule(args) -> int:
    """Built-in scheduler (APScheduler) - alternative to cron/launchd."""
    from apscheduler.schedulers.blocking import BlockingScheduler
    from apscheduler.triggers.cron import CronTrigger

    from .orchestrator import run_daily
    from .settings import get_settings
    hh, mm = get_settings().daily_run_time.split(":")
    sched = BlockingScheduler()
    sched.add_job(run_daily, CronTrigger(hour=int(hh), minute=int(mm)),
                  id="novus-daily", misfire_grace_time=3600)
    print(f"scheduler running - `novus daily` fires every day at {hh}:{mm} (Ctrl-C to stop)")
    try:
        sched.start()
    except (KeyboardInterrupt, SystemExit):
        pass
    return 0


def cmd_kill(args) -> int:
    from .settings import get_settings
    p = get_settings().kill_switch_path
    if args.off:
        p.unlink(missing_ok=True)
        print(f"kill switch OFF ({p} removed) - sending re-enabled")
    else:
        p.touch()
        print(f"kill switch ON ({p} created) - ALL sending halted instantly")
    return 0


def cmd_doctor(args) -> int:
    from .settings import get_settings
    s = get_settings()
    rows: list[tuple[str, bool, str]] = []

    def check(name: str, ok: bool, note: str = "") -> None:
        rows.append((name, ok, note))

    check("demo mode", True, "ON - offline providers" if s.novus_demo else "off (live providers)")
    check("ANTHROPIC_API_KEY", bool(s.anthropic_api_key) or s.novus_demo,
          s.claude_model if s.anthropic_api_key else "missing (demo Claude will be used)")
    check("SERP_API_KEY", bool(s.serp_api_key) or s.novus_demo,
          "" if s.serp_api_key else "research disabled without it")
    check("GOOGLE_PLACES_API_KEY", bool(s.google_places_api_key) or s.novus_demo,
          "" if s.google_places_api_key else "website detection/GBP disabled")
    check("STOCK_API_KEY", bool(s.stock_api_key), "optional imagery fallback")
    check("NOVUS_MAILING_ADDRESS", bool(s.novus_mailing_address.strip()),
          "REQUIRED before drafting (CAN-SPAM)")
    try:
        from .db import db_session
        with db_session() as sess:
            sess.execute(__import__("sqlalchemy").text("select 1"))
        check("database", True, str(s.db_path))
    except Exception as e:  # noqa: BLE001
        check("database", False, str(e))
    try:
        from .preview import SKELETON_DIRS
        found = [d for d in SKELETON_DIRS if (d / "template-bold-trade.html").exists()]
        check("preview templates", bool(found), str(found[0]) if found else "not found")
    except Exception as e:  # noqa: BLE001
        check("preview templates", False, str(e))
    try:
        from .providers.gmail import GmailBackend
        check("gmail auth", GmailBackend().available(),
              "token.json ok" if GmailBackend().available()
              else "not authorized - drafts go to ./outbox (run `novus gmail-auth`)")
    except ImportError:
        check("gmail auth", False, "google libs not installed - outbox mode")
    try:
        import playwright  # noqa: F401
        check("playwright", True, "render self-checks enabled")
    except ImportError:
        check("playwright", False, "render checks will be skipped (pip install playwright)")
    if not s.novus_demo:
        if s.anthropic_api_key:
            from .claude_client import ClaudeClient
            try:
                check("claude ping", ClaudeClient().ping(), s.claude_model)
            except Exception as e:  # noqa: BLE001
                check("claude ping", False, str(e)[:80])
        if s.preview_deploy_backend in ("auto", "higgsfield"):
            try:
                from .providers.higgsfield import HiggsfieldClient
                check("higgsfield mcp", HiggsfieldClient().available(), s.higgsfield_mcp_url)
            except Exception as e:  # noqa: BLE001
                check("higgsfield mcp", False, str(e)[:80])
    check("kill switch", not s.kill_switch_path.exists(),
          "ENGAGED - sending halted" if s.kill_switch_path.exists() else "clear")
    check("AUTO_SEND", True, "ON - hands-off sending" if s.auto_send else "off - approval queue")

    width = max(len(r[0]) for r in rows) + 2
    bad = 0
    print()
    for name, ok, note in rows:
        mark = "\033[32m ok \033[0m" if ok else "\033[31mFAIL\033[0m"
        if not ok:
            bad += 1
        print(f"  [{mark}] {name:{width}} {note}")
    print()
    return 1 if bad else 0


def main(argv: list[str] | None = None) -> int:
    p = argparse.ArgumentParser(prog="novus",
                                description="Novus Pipeline Agent - self-running lead-gen for Novus Co.")
    p.add_argument("--demo", action="store_true",
                   help="deterministic offline providers (no keys, no network)")
    sub = p.add_subparsers(dest="cmd", required=True)

    d = sub.add_parser("daily", help="the full unattended run (what the scheduler calls)")
    d.add_argument("--city")
    d.add_argument("--niche")
    d.set_defaults(fn=cmd_daily)

    c = sub.add_parser("cities", help="show / rebuild the top-50 city list")
    c.add_argument("--rebuild", action="store_true")
    c.add_argument("--limit", type=int, default=50)
    c.set_defaults(fn=cmd_cities)

    r = sub.add_parser("research", help="research one city+niche batch")
    r.add_argument("--city", required=True)
    r.add_argument("--niche", required=True)
    r.add_argument("--limit", type=int, default=None)
    r.set_defaults(fn=cmd_research)

    al = sub.add_parser("add-lead", help="add one specific business to the pipeline by hand")
    al.add_argument("--name", required=True, help='business name, e.g. "Bayshore Roofing Co."')
    al.add_argument("--niche", required=True, help="trade, e.g. roofing")
    al.add_argument("--city", required=True, help='e.g. "Tampa, FL"')
    al.add_argument("--email", help="owner email (required before drafting can happen)")
    al.add_argument("--phone")
    al.add_argument("--instagram", help="IG handle without @")
    al.add_argument("--website", help="existing site URL if any")
    al.set_defaults(fn=cmd_add_lead)

    for name, fn, help_ in (("grade", cmd_grade, "audit + Novus Score for NEW leads"),
                            ("preview", cmd_preview, "build premium previews for A/B leads"),
                            ("selfcheck", cmd_selfcheck, "QA gate on built previews"),
                            ("draft", cmd_draft, "write + queue outreach for QA-passed leads")):
        sp = sub.add_parser(name, help=help_)
        sp.add_argument("--limit", type=int, default=None)
        sp.set_defaults(fn=fn)

    a = sub.add_parser("approve", help="review + send today's queue (AUTO_SEND=false path)")
    a.add_argument("--ids", help="comma-separated lead ids (default: whole queue)")
    a.add_argument("--yes", action="store_true", help="skip confirmation prompt")
    a.set_defaults(fn=cmd_approve)

    sub.add_parser("followups", help="poll replies + draft due follow-ups").set_defaults(fn=cmd_followups)
    sub.add_parser("report", help="regenerate today's report").set_defaults(fn=cmd_report)
    sub.add_parser("gmail-auth", help="one-time Gmail OAuth").set_defaults(fn=cmd_gmail_auth)
    sub.add_parser("doctor", help="check config, keys and integrations").set_defaults(fn=cmd_doctor)
    sub.add_parser("schedule", help="run the built-in daily scheduler (APScheduler)").set_defaults(fn=cmd_schedule)

    k = sub.add_parser("kill", help="engage the send kill switch (use --off to clear)")
    k.add_argument("--off", action="store_true")
    k.set_defaults(fn=cmd_kill)

    db = sub.add_parser("dashboard", help="serve the local dashboard")
    db.add_argument("--host", default=None)
    db.add_argument("--port", type=int, default=None)
    db.set_defaults(fn=cmd_dashboard)

    args = p.parse_args(argv)
    _apply_demo_flag(args.demo)
    return args.fn(args)


if __name__ == "__main__":
    sys.exit(main())
