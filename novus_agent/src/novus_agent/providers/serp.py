"""Search backend. Default: SerpApi (survives daily automation). A headless
Playwright fallback exists behind SEARCH_HEADLESS_FALLBACK=true only - scraping
Google directly gets CAPTCHA'd on a schedule and is NOT the supported path."""
from __future__ import annotations

from typing import TypedDict

import httpx

from ..settings import get_settings
from ..util import log, polite_sleep, retry


class SerpResult(TypedDict):
    title: str
    link: str
    snippet: str


class SerpClient:
    BASE = "https://serpapi.com/search.json"

    def __init__(self) -> None:
        self.key = get_settings().serp_api_key

    def available(self) -> bool:
        return bool(self.key)

    def search(self, query: str, num: int = 20) -> list[SerpResult]:
        if not self.key:
            raise RuntimeError("SERP_API_KEY not set")

        def _do() -> list[SerpResult]:
            r = httpx.get(self.BASE, params={
                "engine": "google", "q": query, "num": min(num, 30),
                "api_key": self.key, "hl": "en", "gl": "us",
            }, timeout=30)
            r.raise_for_status()
            data = r.json()
            if data.get("error"):
                raise RuntimeError(f"SerpApi: {data['error']}")
            out: list[SerpResult] = []
            for item in data.get("organic_results", []):
                out.append(SerpResult(
                    title=item.get("title", ""),
                    link=item.get("link", ""),
                    snippet=item.get("snippet", "") or " ".join(
                        item.get("snippet_highlighted_words", []) or []),
                ))
            return out

        results = retry(_do, attempts=3, label=f"serp {query[:40]!r}")
        polite_sleep()
        return results


def headless_google_search(query: str, num: int = 20) -> list[SerpResult]:
    """Discouraged fallback (config-gated). Best effort; expect CAPTCHAs."""
    s = get_settings()
    if not s.search_headless_fallback:
        raise RuntimeError("headless fallback disabled (SEARCH_HEADLESS_FALLBACK=false)")
    try:
        from playwright.sync_api import sync_playwright
    except ImportError as e:
        raise RuntimeError("playwright not installed") from e

    out: list[SerpResult] = []
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto(f"https://www.google.com/search?q={httpx.QueryParams({'q': query})['q']}&num={num}",
                  wait_until="domcontentloaded", timeout=30000)
        if "sorry" in page.url or page.locator("form#captcha-form").count():
            browser.close()
            raise RuntimeError("Google served a CAPTCHA - use SERP_API_KEY instead")
        for el in page.locator("div.g").all()[:num]:
            title = el.locator("h3").first
            link = el.locator("a").first
            out.append(SerpResult(
                title=title.inner_text() if title.count() else "",
                link=link.get_attribute("href") or "" if link.count() else "",
                snippet=el.inner_text()[:400],
            ))
        browser.close()
    log.warning("headless Google fallback used for %r - fragile, keep SERP_API_KEY funded", query)
    return out
