"""Small shared helpers: logging, slugs, polite pacing, retries, JSON extraction."""
from __future__ import annotations

import json
import logging
import random
import re
import time
import unicodedata
from datetime import date, datetime
from pathlib import Path
from typing import Any, Callable, TypeVar

from .settings import get_settings

T = TypeVar("T")

_LOG_CONFIGURED = False


def setup_logging() -> logging.Logger:
    global _LOG_CONFIGURED
    s = get_settings()
    log = logging.getLogger("novus")
    if not _LOG_CONFIGURED:
        log.setLevel(getattr(logging, s.log_level.upper(), logging.INFO))
        fmt = logging.Formatter("%(asctime)s %(levelname)-7s %(name)s: %(message)s")
        sh = logging.StreamHandler()
        sh.setFormatter(fmt)
        log.addHandler(sh)
        try:
            logdir = s.path("logs")
            logdir.mkdir(parents=True, exist_ok=True)
            fh = logging.FileHandler(logdir / "novus.log")
            fh.setFormatter(fmt)
            log.addHandler(fh)
        except OSError:
            pass
        _LOG_CONFIGURED = True
    return log


log = setup_logging()


def slugify(text: str, max_len: int = 48) -> str:
    text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode()
    text = re.sub(r"[^a-zA-Z0-9]+", "-", text).strip("-").lower()
    return text[:max_len].rstrip("-") or "business"


def today() -> date:
    return date.today()


def now_iso() -> str:
    return datetime.now().isoformat(timespec="seconds")


def polite_sleep() -> None:
    """Jittered delay between external calls; skipped in demo mode."""
    s = get_settings()
    if s.novus_demo:
        return
    time.sleep(random.uniform(s.request_jitter_min, s.request_jitter_max))


def retry(fn: Callable[[], T], attempts: int = 4, base_delay: float = 2.0,
          retriable: tuple[type[BaseException], ...] = (Exception,),
          label: str = "call") -> T:
    """Exponential backoff with jitter: 2s, 4s, 8s, 16s by default."""
    last: BaseException | None = None
    for i in range(attempts):
        try:
            return fn()
        except retriable as e:  # noqa: PERF203
            last = e
            if i == attempts - 1:
                break
            delay = base_delay * (2 ** i) + random.uniform(0, 0.5)
            log.warning("%s failed (%s); retry %d/%d in %.1fs", label, e, i + 1, attempts - 1, delay)
            time.sleep(delay)
    assert last is not None
    raise last


def extract_json(text: str) -> Any:
    """Parse JSON out of a model reply that may wrap it in prose or a code fence."""
    text = text.strip()
    fence = re.search(r"```(?:json)?\s*(.*?)```", text, re.DOTALL)
    if fence:
        text = fence.group(1).strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass
    # First balanced object or array
    for opener, closer in (("{", "}"), ("[", "]")):
        start = text.find(opener)
        if start == -1:
            continue
        depth = 0
        in_str = False
        esc = False
        for i in range(start, len(text)):
            ch = text[i]
            if in_str:
                if esc:
                    esc = False
                elif ch == "\\":
                    esc = True
                elif ch == '"':
                    in_str = False
                continue
            if ch == '"':
                in_str = True
            elif ch == opener:
                depth += 1
            elif ch == closer:
                depth -= 1
                if depth == 0:
                    try:
                        return json.loads(text[start:i + 1])
                    except json.JSONDecodeError:
                        break
    raise ValueError(f"no JSON found in model output: {text[:200]!r}")


EMAIL_RE = re.compile(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}")
PHONE_RE = re.compile(r"(?:\+1[\s.-]?)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}")
IG_HANDLE_RE = re.compile(r"instagram\.com/([A-Za-z0-9_.]{2,30})")

STOP_WORDS_RE = re.compile(r"\b(stop|unsubscribe|remove me|opt out|opt-out)\b", re.IGNORECASE)


def email_domain(email: str) -> str:
    return email.rsplit("@", 1)[-1].lower() if "@" in email else ""


def write_text(path: Path, content: str) -> Path:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")
    return path
