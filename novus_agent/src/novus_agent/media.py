"""Module 3 media pipeline - copyright-clean imagery only.

Priority: Higgsfield-generated bespoke visuals -> the business's own Google
photos (its own preview only) -> licensed stock (Pexels) -> None (the page
generator then builds a designed CSS/SVG treatment; never a broken image).
"""
from __future__ import annotations

from typing import Any

from .settings import get_settings
from .util import log


def _clients():
    s = get_settings()
    if s.novus_demo:
        from .demo import DemoHiggsfield, DemoPlaces, DemoStock
        return DemoHiggsfield(), DemoPlaces(), DemoStock()
    from .providers.higgsfield import HiggsfieldClient
    from .providers.places import PlacesClient
    from .providers.stock import StockClient
    return HiggsfieldClient(), PlacesClient(), StockClient()


def gather(lead: dict[str, Any], brief: dict[str, Any],
           place_details: dict[str, Any] | None) -> dict[str, Any]:
    """Returns {"hero": url|None, "section": url|None, "source": str}."""
    hf, places, stock = _clients()
    briefs = brief.get("image_briefs", {})
    style = ("Photorealistic, cinematic golden-hour light, editorial composition, "
             "no text, no watermarks, no logos.")

    # 1) Bespoke generated imagery (Higgsfield MCP)
    if hf.available():
        hero = hf.generate_image(f"{briefs.get('hero', '')} {style}", aspect_ratio="16:9")
        section = hf.generate_image(f"{briefs.get('section', '')} {style}", aspect_ratio="4:3")
        if hero or section:
            log.info("media: higgsfield generated (hero=%s section=%s)",
                     bool(hero), bool(section))
            return {"hero": hero, "section": section, "source": "higgsfield"}

    # 2) The business's own Google photos - only for its own preview
    photos = (place_details or {}).get("photos") or []
    if photos and places.available():
        refs = [p.get("photo_reference") for p in photos[:2] if p.get("photo_reference")]
        urls = [places.photo_public_url(ref) for ref in refs]
        urls = [u for u in urls if u]
        if urls:
            log.info("media: using the business's own Google photos (%d)", len(urls))
            return {"hero": urls[0], "section": urls[1] if len(urls) > 1 else None,
                    "source": "google_place_photos"}

    # 3) Licensed stock fallback
    if stock.available():
        q_hero = briefs.get("hero") or f"{lead['trade']} work site"
        q_section = briefs.get("section") or f"{lead['trade']} closeup"
        hero = stock.photo_url(q_hero)
        section = stock.photo_url(q_section)
        if hero or section:
            log.info("media: licensed stock fallback")
            return {"hero": hero, "section": section, "source": "stock"}

    # 4) Designed non-photo treatment (self-contained, always safe)
    log.info("media: no provider available - page will use a designed treatment")
    return {"hero": None, "section": None, "source": "designed"}
