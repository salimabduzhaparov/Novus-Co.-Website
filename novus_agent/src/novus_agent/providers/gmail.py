"""Gmail integration: drafts, sends, reply/bounce polling.

Real mode needs a one-time `novus gmail-auth` (OAuth flow -> token.json).
Without Gmail credentials the agent degrades to an Outbox backend that writes
RFC-822 .eml files to ./outbox so the pipeline still runs end-to-end.
"""
from __future__ import annotations

import base64
import re
from datetime import datetime
from email.message import EmailMessage
from email.utils import formataddr
from pathlib import Path
from typing import Any

from ..settings import get_settings
from ..util import log, now_iso, slugify

SCOPES = ["https://www.googleapis.com/auth/gmail.modify"]
BOUNCE_SENDERS = ("mailer-daemon@", "postmaster@")


class DraftResult(dict):
    """{draft_id, message_id, thread_id}"""


def _build_mime(to: str, subject: str, body: str, sender_email: str,
                sender_name: str, thread_headers: dict[str, str] | None = None) -> EmailMessage:
    msg = EmailMessage()
    msg["To"] = to
    msg["From"] = formataddr((sender_name, sender_email))
    msg["Subject"] = subject
    if thread_headers:
        for k, v in thread_headers.items():
            msg[k] = v
    msg.set_content(body)
    return msg


class GmailBackend:
    """Real Gmail API backend (drafts from NOVUS_SENDER_EMAIL)."""

    name = "gmail"

    def __init__(self) -> None:
        s = get_settings()
        self.sender = s.novus_sender_email
        self.sender_name = s.novus_business_name
        self._service = None

    # -- auth --

    def _token_path(self) -> Path:
        s = get_settings()
        p = Path(s.gmail_token_file)
        return p if p.is_absolute() else s.path(s.gmail_token_file)

    def _creds_path(self) -> Path:
        s = get_settings()
        p = Path(s.gmail_credentials_file)
        return p if p.is_absolute() else s.path(s.gmail_credentials_file)

    def available(self) -> bool:
        return self._token_path().exists()

    def service(self):
        if self._service is None:
            from google.auth.transport.requests import Request
            from google.oauth2.credentials import Credentials
            from googleapiclient.discovery import build

            creds = Credentials.from_authorized_user_file(str(self._token_path()), SCOPES)
            if creds.expired and creds.refresh_token:
                creds.refresh(Request())
                self._token_path().write_text(creds.to_json())
            self._service = build("gmail", "v1", credentials=creds, cache_discovery=False)
        return self._service

    def run_oauth_flow(self) -> None:
        """One-time interactive OAuth (the ONLY interactive step in the system)."""
        from google_auth_oauthlib.flow import InstalledAppFlow

        creds_file = self._creds_path()
        if not creds_file.exists():
            raise SystemExit(
                f"Put your Google OAuth client file at {creds_file} first.\n"
                "Google Cloud Console -> APIs & Services -> Credentials -> "
                "OAuth client ID (Desktop app) -> download JSON. Enable the Gmail API."
            )
        flow = InstalledAppFlow.from_client_secrets_file(str(creds_file), SCOPES)
        creds = flow.run_local_server(port=0)
        self._token_path().write_text(creds.to_json())
        log.info("Gmail authorized; token saved to %s", self._token_path())

    # -- drafts / sends --

    def create_draft(self, to: str, subject: str, body: str,
                     thread_id: str | None = None) -> DraftResult:
        msg = _build_mime(to, subject, body, self.sender, self.sender_name)
        payload: dict[str, Any] = {"message": {
            "raw": base64.urlsafe_b64encode(msg.as_bytes()).decode()}}
        if thread_id:
            payload["message"]["threadId"] = thread_id
        d = self.service().users().drafts().create(userId="me", body=payload).execute()
        m = d.get("message", {})
        return DraftResult(draft_id=d["id"], message_id=m.get("id"), thread_id=m.get("threadId"))

    def send_draft(self, draft_id: str) -> DraftResult:
        m = self.service().users().drafts().send(userId="me", body={"id": draft_id}).execute()
        return DraftResult(draft_id=draft_id, message_id=m.get("id"), thread_id=m.get("threadId"))

    # -- replies / bounces --

    def thread_replies(self, thread_id: str) -> list[dict[str, Any]]:
        """Messages in the thread NOT sent by us: real replies and bounces."""
        t = self.service().users().threads().get(
            userId="me", id=thread_id, format="metadata",
            metadataHeaders=["From", "Subject"]).execute()
        out = []
        for m in t.get("messages", []):
            headers = {h["name"].lower(): h["value"]
                       for h in m.get("payload", {}).get("headers", [])}
            sender = headers.get("from", "")
            if self.sender.lower() in sender.lower():
                continue
            out.append({
                "from": sender,
                "subject": headers.get("subject", ""),
                "snippet": m.get("snippet", ""),
                "is_bounce": any(b in sender.lower() for b in BOUNCE_SENDERS),
            })
        return out


class OutboxBackend:
    """No-Gmail fallback: queue drafts as .eml files under ./outbox.

    'Sending' moves the file to ./outbox/sent. Reply polling is a no-op (there
    is no mailbox), which the follow-up job logs loudly.
    """

    name = "outbox"

    def __init__(self) -> None:
        s = get_settings()
        self.sender = s.novus_sender_email
        self.sender_name = s.novus_business_name
        self.dir = s.path("outbox")
        self.dir.mkdir(parents=True, exist_ok=True)

    def available(self) -> bool:
        return True

    def create_draft(self, to: str, subject: str, body: str,
                     thread_id: str | None = None) -> DraftResult:
        msg = _build_mime(to, subject, body, self.sender, self.sender_name)
        fname = f"{datetime.now():%Y%m%d-%H%M%S}-{slugify(to.split('@')[0])}-{slugify(subject)[:30]}.eml"
        path = self.dir / fname
        path.write_bytes(msg.as_bytes())
        return DraftResult(draft_id=f"outbox:{fname}", message_id=None,
                           thread_id=thread_id or f"outbox-thread:{slugify(to)}")

    def send_draft(self, draft_id: str) -> DraftResult:
        fname = draft_id.removeprefix("outbox:")
        src = self.dir / fname
        sent = self.dir / "sent"
        sent.mkdir(exist_ok=True)
        if src.exists():
            src.rename(sent / fname)
        return DraftResult(draft_id=draft_id, message_id=f"outbox-sent:{fname}",
                           thread_id=f"outbox-thread:{fname}")

    def thread_replies(self, thread_id: str) -> list[dict[str, Any]]:
        return []

    def run_oauth_flow(self) -> None:
        raise SystemExit("Outbox backend has no OAuth. Install google deps and add credentials.json.")


def get_mail_backend():
    """Gmail if authorized, else Outbox (with a loud warning)."""
    s = get_settings()
    if s.novus_demo:
        return OutboxBackend()
    try:
        g = GmailBackend()
        if g.available():
            return g
        log.warning("Gmail not authorized (run `novus gmail-auth`) - queuing drafts to ./outbox")
    except ImportError:
        log.warning("google-api-python-client not installed - queuing drafts to ./outbox")
    return OutboxBackend()


STOP_RE = re.compile(r"\b(stop|unsubscribe|remove me|opt.?out|do not (?:email|contact))\b", re.I)


def classify_reply(reply: dict[str, Any]) -> str:
    """'BOUNCE' | 'STOP' | 'REPLY'"""
    if reply.get("is_bounce"):
        return "BOUNCE"
    text = f"{reply.get('subject', '')} {reply.get('snippet', '')}"
    if STOP_RE.search(text):
        return "STOP"
    return "REPLY"
