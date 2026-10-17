"""Google Places: website detection, GBP signals (rating/reviews/photos), and
the business's OWN photos for its preview (used only where API terms allow;
photo URLs are resolved to their public CDN target so no API key ships in a page)."""
from __future__ import annotations

from typing import Any

import httpx

from ..settings import get_settings
from ..util import log, polite_sleep, retry

TEXTSEARCH = "https://maps.googleapis.com/maps/api/place/textsearch/json"
DETAILS = "https://maps.googleapis.com/maps/api/place/details/json"
PHOTO = "https://maps.googleapis.com/maps/api/place/photo"

DETAIL_FIELDS = ",".join([
    "name", "website", "formatted_phone_number", "rating",
    "user_ratings_total", "photos", "reviews", "url", "business_status",
])


class PlacesClient:
    def __init__(self) -> None:
        self.key = get_settings().google_places_api_key

    def available(self) -> bool:
        return bool(self.key)

    def find_place(self, business_name: str, city: str) -> dict[str, Any] | None:
        """Best-match place for '<name> <city>' or None."""
        if not self.key:
            return None

        def _do() -> dict[str, Any] | None:
            r = httpx.get(TEXTSEARCH, params={
                "query": f"{business_name} {city}", "key": self.key,
            }, timeout=30)
            r.raise_for_status()
            data = r.json()
            status = data.get("status")
            if status == "ZERO_RESULTS":
                return None
            if status not in ("OK",):
                raise RuntimeError(f"Places textsearch: {status}")
            return (data.get("results") or [None])[0]

        res = retry(_do, attempts=3, label=f"places find {business_name!r}")
        polite_sleep()
        return res

    def details(self, place_id: str) -> dict[str, Any]:
        """GBP signals: website, phone, rating, review count, photos, real reviews."""
        def _do() -> dict[str, Any]:
            r = httpx.get(DETAILS, params={
                "place_id": place_id, "fields": DETAIL_FIELDS, "key": self.key,
            }, timeout=30)
            r.raise_for_status()
            data = r.json()
            if data.get("status") != "OK":
                raise RuntimeError(f"Places details: {data.get('status')}")
            return data.get("result", {})

        res = retry(_do, attempts=3, label="places details")
        polite_sleep()
        return res

    def photo_public_url(self, photo_reference: str, max_width: int = 1600) -> str | None:
        """Resolve a photo reference to its public googleusercontent CDN URL
        (the API endpoint 302s there; we never embed our key in a page)."""
        try:
            r = httpx.get(PHOTO, params={
                "photoreference": photo_reference, "maxwidth": max_width, "key": self.key,
            }, timeout=30, follow_redirects=False)
            if r.status_code in (302, 301):
                return r.headers.get("location")
            log.warning("place photo did not redirect (HTTP %s)", r.status_code)
        except httpx.HTTPError as e:
            log.warning("place photo fetch failed: %s", e)
        return None

    @staticmethod
    def gbp_summary(details: dict[str, Any]) -> dict[str, Any]:
        return {
            "rating": details.get("rating"),
            "review_count": details.get("user_ratings_total"),
            "photo_count": len(details.get("photos") or []),
            "has_website": bool(details.get("website")),
            "business_status": details.get("business_status"),
        }

    @staticmethod
    def real_reviews(details: dict[str, Any], limit: int = 3) -> list[dict[str, Any]]:
        """Top real Google reviews (first name + rating + trimmed text)."""
        out = []
        for rv in (details.get("reviews") or [])[:limit]:
            if not rv.get("text"):
                continue
            out.append({
                "author": (rv.get("author_name") or "A customer").split()[0],
                "rating": rv.get("rating"),
                "text": rv["text"][:280].strip(),
            })
        return out
