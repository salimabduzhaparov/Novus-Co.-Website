"""SQLite CRM (SQLAlchemy 2.0). Tables: leads, cities, batches, suppression, email_log, app_state, events."""
from __future__ import annotations

from datetime import date, datetime
from typing import Iterator

from sqlalchemy import (
    Boolean, Date, DateTime, Float, ForeignKey, Integer, String, Text,
    create_engine, event, func, select,
)
from sqlalchemy.orm import DeclarativeBase, Mapped, Session, mapped_column, sessionmaker

from .settings import get_settings

# Pipeline statuses, in order.
STATUSES = [
    "NEW", "SCORED", "PREVIEW_BUILT", "QA_PASSED", "DRAFTED", "QUEUED",
    "SENT", "REPLIED", "CALL_BOOKED", "PROPOSAL", "WON", "LOST", "PARKED",
]


class Base(DeclarativeBase):
    pass


class Lead(Base):
    __tablename__ = "leads"

    id: Mapped[int] = mapped_column(primary_key=True)
    business_name: Mapped[str] = mapped_column(String(200))
    trade: Mapped[str] = mapped_column(String(80))
    city: Mapped[str] = mapped_column(String(120))
    target_batch_date: Mapped[date | None] = mapped_column(Date)
    instagram_handle: Mapped[str | None] = mapped_column(String(120))
    email: Mapped[str | None] = mapped_column(String(200), index=True)
    phone: Mapped[str | None] = mapped_column(String(40))
    website_url: Mapped[str | None] = mapped_column(String(500))
    has_website: Mapped[bool | None] = mapped_column(Boolean)
    novus_score: Mapped[int | None] = mapped_column(Integer)
    grade: Mapped[str | None] = mapped_column(String(2))
    audit_json: Mapped[str | None] = mapped_column(Text)
    preview_path: Mapped[str | None] = mapped_column(String(500))
    preview_url: Mapped[str | None] = mapped_column(String(500))
    template_used: Mapped[str | None] = mapped_column(String(120))
    selfcheck_json: Mapped[str | None] = mapped_column(Text)
    selfcheck_passed: Mapped[bool | None] = mapped_column(Boolean)
    status: Mapped[str] = mapped_column(String(20), default="NEW", index=True)
    email_draft_id: Mapped[str | None] = mapped_column(String(300))
    touches_sent: Mapped[int] = mapped_column(Integer, default=0)
    last_touch_date: Mapped[date | None] = mapped_column(Date)
    next_follow_up_date: Mapped[date | None] = mapped_column(Date)
    reply_received: Mapped[bool] = mapped_column(Boolean, default=False)
    deal_value: Mapped[float | None] = mapped_column(Float)
    retainer_flag: Mapped[bool] = mapped_column(Boolean, default=False)
    notes: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now, onupdate=datetime.now)

    # Internal plumbing (not in the public CRM spec, needed for automation)
    place_id: Mapped[str | None] = mapped_column(String(200))       # Google Places id
    gmail_thread_id: Mapped[str | None] = mapped_column(String(200))
    qa_retries: Mapped[int] = mapped_column(Integer, default=0)
    source_query: Mapped[str | None] = mapped_column(Text)
    drafts_json: Mapped[str | None] = mapped_column(Text)           # {initial, followup2, followup3}


class City(Base):
    __tablename__ = "cities"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120))
    state: Mapped[str] = mapped_column(String(40))
    rank: Mapped[int] = mapped_column(Integer, index=True)
    pay_probability: Mapped[float] = mapped_column(Float, default=0.0)  # 0..1
    biz_density: Mapped[float] = mapped_column(Float, default=0.0)      # component scores 0..1
    weak_web_share: Mapped[float] = mapped_column(Float, default=0.0)
    spending_power: Mapped[float] = mapped_column(Float, default=0.0)
    competition: Mapped[float] = mapped_column(Float, default=0.0)      # lower = less saturated (better)
    rationale: Mapped[str | None] = mapped_column(Text)
    last_targeted: Mapped[date | None] = mapped_column(Date)
    times_targeted: Mapped[int] = mapped_column(Integer, default=0)
    built_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)


class Batch(Base):
    """One (date, city, niche) research run - powers city+niche cooldown."""
    __tablename__ = "batches"

    id: Mapped[int] = mapped_column(primary_key=True)
    run_date: Mapped[date] = mapped_column(Date, index=True)
    city: Mapped[str] = mapped_column(String(120))
    niche: Mapped[str] = mapped_column(String(80))
    leads_found: Mapped[int] = mapped_column(Integer, default=0)


class Suppression(Base):
    """STOP replies, bounces, manual blocks. Checked before every send, forever."""
    __tablename__ = "suppression"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str | None] = mapped_column(String(200), unique=True, index=True)
    domain: Mapped[str | None] = mapped_column(String(200), index=True)  # suppress whole domain
    reason: Mapped[str] = mapped_column(String(40))  # STOP | BOUNCE | MANUAL
    detail: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)


class EmailLog(Base):
    """Every outbound touch - powers daily caps, per-domain throttle, and metrics."""
    __tablename__ = "email_log"

    id: Mapped[int] = mapped_column(primary_key=True)
    lead_id: Mapped[int] = mapped_column(ForeignKey("leads.id"), index=True)
    touch_no: Mapped[int] = mapped_column(Integer)          # 1, 2, 3
    to_email: Mapped[str] = mapped_column(String(200))
    domain: Mapped[str] = mapped_column(String(200), index=True)
    subject: Mapped[str] = mapped_column(String(300))
    sent_on: Mapped[date] = mapped_column(Date, index=True)
    message_id: Mapped[str | None] = mapped_column(String(200))
    thread_id: Mapped[str | None] = mapped_column(String(200))
    mode: Mapped[str] = mapped_column(String(20), default="gmail")  # gmail | outbox


class AppState(Base):
    """Key/value store: rotation pointers, warm-up start date, etc."""
    __tablename__ = "app_state"

    key: Mapped[str] = mapped_column(String(80), primary_key=True)
    value: Mapped[str] = mapped_column(Text)


class EventLog(Base):
    """Audit trail for the daily report and dashboard."""
    __tablename__ = "events"

    id: Mapped[int] = mapped_column(primary_key=True)
    at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)
    stage: Mapped[str] = mapped_column(String(40))
    lead_id: Mapped[int | None] = mapped_column(Integer)
    message: Mapped[str] = mapped_column(Text)


_engine = None
_SessionLocal: sessionmaker[Session] | None = None


def get_engine():
    global _engine, _SessionLocal
    if _engine is None:
        s = get_settings()
        s.db_path.parent.mkdir(parents=True, exist_ok=True)
        _engine = create_engine(f"sqlite:///{s.db_path}", future=True)

        @event.listens_for(_engine, "connect")
        def _fk_on(dbapi_conn, _):  # noqa: ANN001
            dbapi_conn.execute("PRAGMA foreign_keys=ON")

        Base.metadata.create_all(_engine)
        _SessionLocal = sessionmaker(bind=_engine, expire_on_commit=False, future=True)
    return _engine


def db_session() -> Session:
    get_engine()
    assert _SessionLocal is not None
    return _SessionLocal()


# ----- app_state helpers -----

def state_get(sess: Session, key: str, default: str | None = None) -> str | None:
    row = sess.get(AppState, key)
    return row.value if row else default


def state_set(sess: Session, key: str, value: str) -> None:
    row = sess.get(AppState, key)
    if row:
        row.value = value
    else:
        sess.add(AppState(key=key, value=value))


def log_event(sess: Session, stage: str, message: str, lead_id: int | None = None) -> None:
    sess.add(EventLog(stage=stage, message=message, lead_id=lead_id))


# ----- suppression helpers -----

def is_suppressed(sess: Session, email: str) -> bool:
    from .settings import FREEMAIL_DOMAINS
    from .util import email_domain
    e = (email or "").strip().lower()
    if not e:
        return False
    if sess.scalar(select(func.count()).select_from(Suppression).where(Suppression.email == e)):
        return True
    dom = email_domain(e)
    if dom and dom not in FREEMAIL_DOMAINS:
        if sess.scalar(select(func.count()).select_from(Suppression).where(Suppression.domain == dom)):
            return True
    return False


def suppress(sess: Session, email: str | None, reason: str, detail: str = "",
             domain: str | None = None) -> None:
    e = (email or "").strip().lower() or None
    if e:
        existing = sess.scalar(select(Suppression).where(Suppression.email == e))
        if existing:
            return
    sess.add(Suppression(email=e, domain=domain, reason=reason, detail=detail))


def leads_by_status(sess: Session, *statuses: str) -> Iterator[Lead]:
    stmt = select(Lead).where(Lead.status.in_(statuses)).order_by(
        Lead.novus_score.desc().nulls_last(), Lead.id
    )
    return iter(sess.scalars(stmt).all())
