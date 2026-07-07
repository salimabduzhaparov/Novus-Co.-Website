"""Licensed stock fallback (Pexels). License-clean photography when Higgsfield
generation is unavailable and the business has no usable Google photos."""
from __future__ import annotations

import httpx

from ..settings import get_settings
from ..util import log, polite_sleep


class StockClient:
    SEARCH = "https://api.pexels.com/v1/search"

    def __init__(self) -> None:
        s = get_settings()
        self.key = s.stock_api_key
        self.provider = s.stock_provider

    def available(self) -> bool:
        return bool(self.key)

    def photo_url(self, query: str, orientation: str = "landscape") -> str | None:
        """Best photo URL for the query, or None. Pexels license: free commercial
        use, no attribution required."""
        if not self.key:
            return None
        try:
            r = httpx.get(self.SEARCH, params={
                "query": query, "per_page": 5, "orientation": orientation, "size": "large",
            }, headers={"Authorization": self.key}, timeout=30)
            r.raise_for_status()
            photos = r.json().get("photos") or []
            polite_sleep()
            if not photos:
                return None
            src = photos[0].get("src") or {}
            return src.get("large2x") or src.get("landscape") or src.get("original")
        except httpx.HTTPError as e:
            log.warning("stock photo lookup failed for %r: %s", query, e)
            return None
