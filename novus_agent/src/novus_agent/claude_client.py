"""Thin wrapper around the Anthropic API for claude-fable-5.

Fable 5 specifics honored here:
- thinking is always on: the `thinking` parameter is OMITTED entirely (explicit
  disabled/budget_tokens configs are rejected with 400 on this model).
- no temperature/top_p/top_k (rejected with 400); depth is controlled via
  output_config.effort.
- safety classifiers can decline a request (HTTP 200, stop_reason="refusal");
  we opt into the server-side fallback so a false positive is transparently
  re-served by CLAUDE_FALLBACK_MODEL inside the same call.
- long outputs are streamed to avoid HTTP timeouts.
"""
from __future__ import annotations

import json
import random
import time
from typing import Any, Callable

from .settings import get_settings
from .util import extract_json, log

FALLBACK_BETA = "server-side-fallback-2026-06-01"
STREAM_THRESHOLD = 16000  # stream any request whose max_tokens exceeds this


class ClaudeRefusal(RuntimeError):
    """Raised when the request (and its fallback chain) was declined."""


class ClaudeClient:
    """Retry/backoff + streaming + structured-JSON helper over the Messages API."""

    def __init__(self) -> None:
        import anthropic  # deferred so demo mode works without the package configured

        s = get_settings()
        self._anthropic = anthropic
        self.model = s.claude_model
        self.fallback_model = s.claude_fallback_model
        self.effort = s.claude_effort
        self.default_max_tokens = s.claude_max_tokens
        # SDK retries 429/5xx twice on its own; we add one outer layer below.
        self.client = anthropic.Anthropic(api_key=s.anthropic_api_key or None, max_retries=2)

    # ----- public API -----

    def complete(
        self,
        prompt: str,
        *,
        system: str | None = None,
        max_tokens: int | None = None,
        effort: str | None = None,
        on_delta: Callable[[str], None] | None = None,
    ) -> str:
        """One-shot text completion. Streams automatically for large budgets."""
        return self._call(prompt, system=system, max_tokens=max_tokens,
                          effort=effort, output_format=None, on_delta=on_delta)

    def complete_json(
        self,
        prompt: str,
        *,
        schema: dict[str, Any] | None = None,
        system: str | None = None,
        max_tokens: int | None = None,
        effort: str | None = None,
    ) -> Any:
        """Completion that must return JSON. Uses structured outputs when a
        schema is given; falls back to tolerant extraction otherwise."""
        fmt = {"type": "json_schema", "schema": schema} if schema else None
        text = self._call(prompt, system=system, max_tokens=max_tokens,
                          effort=effort, output_format=fmt, on_delta=None)
        try:
            return json.loads(text)
        except json.JSONDecodeError:
            return extract_json(text)

    def ping(self) -> bool:
        try:
            self._call("Reply with the single word: ok", max_tokens=1024, effort="low")
            return True
        except Exception as e:  # noqa: BLE001 - doctor-style probe
            log.warning("Claude ping failed: %s", e)
            return False

    # ----- internals -----

    def _params(self, prompt: str, system: str | None, max_tokens: int,
                effort: str, output_format: dict | None) -> dict[str, Any]:
        output_config: dict[str, Any] = {"effort": effort}
        if output_format:
            output_config["format"] = output_format
        params: dict[str, Any] = {
            "model": self.model,
            "max_tokens": max_tokens,
            "messages": [{"role": "user", "content": prompt}],
            "output_config": output_config,
            "betas": [FALLBACK_BETA],
            "fallbacks": [{"model": self.fallback_model}],
        }
        if system:
            params["system"] = system
        return params

    def _call(self, prompt: str, *, system: str | None, max_tokens: int | None,
              effort: str | None, output_format: dict | None,
              on_delta: Callable[[str], None] | None) -> str:
        a = self._anthropic
        max_tokens = max_tokens or self.default_max_tokens
        params = self._params(prompt, system, max_tokens, effort or self.effort, output_format)
        stream = max_tokens > STREAM_THRESHOLD or on_delta is not None

        attempts = 4
        for i in range(attempts):
            try:
                if stream:
                    with self.client.beta.messages.stream(**params) as st:
                        if on_delta is not None:
                            for text in st.text_stream:
                                on_delta(text)
                        msg = st.get_final_message()
                else:
                    msg = self.client.beta.messages.create(**params)
                return self._finish(msg)
            except (a.RateLimitError, a.InternalServerError, a.APIConnectionError) as e:
                if i == attempts - 1:
                    raise
                delay = 2.0 * (2 ** i) + random.uniform(0, 1)
                log.warning("Claude %s; retry %d/%d in %.1fs", type(e).__name__, i + 1, attempts - 1, delay)
                time.sleep(delay)
            except a.APIStatusError as e:
                if getattr(e, "type", "") == "overloaded_error" and i < attempts - 1:
                    time.sleep(2.0 * (2 ** i))
                    continue
                raise
        raise RuntimeError("unreachable")

    def _finish(self, msg: Any) -> str:
        if msg.stop_reason == "refusal":
            detail = ""
            if getattr(msg, "stop_details", None):
                detail = f" ({msg.stop_details.category}: {msg.stop_details.explanation})"
            raise ClaudeRefusal(f"request declined by safety classifiers{detail}")
        if msg.stop_reason == "max_tokens":
            log.warning("Claude hit max_tokens; output may be truncated")
        parts = [b.text for b in msg.content if getattr(b, "type", "") == "text"]
        usage = getattr(msg, "usage", None)
        if usage is not None:
            log.debug("claude usage in=%s out=%s", usage.input_tokens, usage.output_tokens)
        return "".join(parts)


def get_claude():
    """Factory: real Fable 5 client, or the deterministic demo stand-in."""
    s = get_settings()
    if s.novus_demo or not s.anthropic_api_key:
        if not s.novus_demo:
            log.warning("ANTHROPIC_API_KEY not set - using offline demo Claude provider")
        from .demo import DemoClaude
        return DemoClaude()
    return ClaudeClient()
