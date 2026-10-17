"""Central configuration. Everything comes from .env / environment (never hardcode keys)."""
from __future__ import annotations

import json
from functools import lru_cache
from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

# Repo root = directory containing .env / pyproject (the novus_agent checkout)
ROOT = Path(__file__).resolve().parents[2]

DEFAULT_SCORE_WEIGHTS = {
    "no_site": 40,
    "not_mobile": 15,
    "no_https": 10,
    "slow_outdated": 10,
    "no_booking_cta": 8,
    "weak_gbp": 7,
    "public_contact": 5,
    "active_ig": 5,
}

DEFAULT_NICHES = [
    "roofing", "HVAC", "landscaping", "plumbing", "electrician",
    "barbershop", "auto detailing", "house cleaning", "painting",
    "tree service", "concrete", "fencing", "pool service",
    "pressure washing", "junk removal",
]

FREEMAIL_DOMAINS = {
    "gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "aol.com",
    "icloud.com", "live.com", "msn.com", "protonmail.com", "ymail.com",
}


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=str(ROOT / ".env"), env_file_encoding="utf-8", extra="ignore"
    )

    # AI
    anthropic_api_key: str = ""
    claude_model: str = "claude-fable-5"
    claude_fallback_model: str = "claude-opus-4-8"
    claude_max_tokens: int = 8192
    claude_page_max_tokens: int = 32000
    claude_effort: str = "high"

    # Search
    serp_api_key: str = ""
    search_headless_fallback: bool = False

    # Google Places
    google_places_api_key: str = ""

    # Imagery
    stock_api_key: str = ""
    stock_provider: str = "pexels"
    higgsfield_mcp_url: str = "https://mcp.higgsfield.ai/mcp"
    higgsfield_mcp_token: str = ""

    # Deploy
    preview_deploy_backend: str = "auto"  # auto | higgsfield | netlify | local
    netlify_auth_token: str = ""
    preview_base_url: str = "http://127.0.0.1:8787"

    # Identity & compliance
    novus_sender_email: str = "salim.novusco@gmail.com"
    novus_business_name: str = "Novus Co."
    novus_mailing_address: str = ""
    novus_optout_line: str = "Reply STOP and I won't contact you again."

    # Sending controls
    auto_send: bool = False
    daily_lead_target: int = 18
    daily_send_cap: int = 25
    warmup_start: int = 5
    warmup_weekly_step: int = 5
    min_autosend_grade: str = "A"
    per_domain_daily_limit: int = 3
    kill_switch_file: str = ".novus_kill"

    # Pipeline tuning
    max_qa_retries: int = 2
    max_previews_per_day: int = 8
    city_refresh_days: int = 30
    city_niche_cooldown_days: int = 90
    followup_2_days: int = 3
    followup_3_days: int = 7
    request_jitter_min: float = 1.0
    request_jitter_max: float = 3.0
    score_weights: str = ""  # optional JSON override

    # Runtime
    daily_run_time: str = "08:00"
    dashboard_host: str = "127.0.0.1"
    dashboard_port: int = 8787
    novus_db_path: str = "novus.db"
    novus_demo: bool = False
    log_level: str = "INFO"

    # Gmail OAuth file locations (created by `novus gmail-auth`)
    gmail_credentials_file: str = "credentials.json"
    gmail_token_file: str = "token.json"

    # ----- derived helpers -----
    @property
    def weights(self) -> dict[str, int]:
        w = dict(DEFAULT_SCORE_WEIGHTS)
        if self.score_weights.strip():
            try:
                w.update({k: int(v) for k, v in json.loads(self.score_weights).items()})
            except (ValueError, TypeError):
                pass  # keep defaults on malformed override
        return w

    @property
    def db_path(self) -> Path:
        p = Path(self.novus_db_path)
        return p if p.is_absolute() else ROOT / p

    @property
    def kill_switch_path(self) -> Path:
        p = Path(self.kill_switch_file)
        return p if p.is_absolute() else ROOT / p

    def path(self, *parts: str) -> Path:
        """Path under the project root (previews/, reports/, outbox/, logs/...)."""
        p = ROOT.joinpath(*parts)
        return p


@lru_cache
def get_settings() -> Settings:
    return Settings()


def reset_settings_cache() -> None:
    get_settings.cache_clear()
