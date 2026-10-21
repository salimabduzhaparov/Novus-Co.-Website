"""Deterministic offline providers (NOVUS_DEMO=true, or missing keys).

Purpose: prove the full pipeline end-to-end - research -> grade -> preview ->
self-check -> draft -> queue - on a machine with no API keys and no network.
Every "AI" output here is canned-but-personalized; swap in real keys and the
same call sites use SerpApi / Places / Pexels / Higgsfield / Fable 5.

All demo businesses are FICTIONAL (555 phone numbers, example handles).
"""
from __future__ import annotations

import json
import re
from typing import Any

from . import prompts
from .util import log

# ---------------------------------------------------------------------------
# Demo dataset - fictional Tampa home-service businesses
# ---------------------------------------------------------------------------

DEMO_BUSINESSES: list[dict[str, Any]] = [
    # name, ig, email, phone, has_site, gbp(rating, reviews, photos) or None
    {"name": "Bayshore Roofing Co.", "ig": "bayshoreroofingco", "email": "bayshoreroofingco@gmail.com",
     "phone": "(813) 555-0142", "has_site": False, "gbp": {"rating": 4.9, "review_count": 87, "photo_count": 24,
     "reviews": [
         {"author": "Marcus", "rating": 5, "text": "Crew re-roofed our Seminole Heights bungalow in two days and left the yard cleaner than they found it. Straight shooters on price."},
         {"author": "Dana", "rating": 5, "text": "They tarped our leak the same afternoon Ian passed and had the full replacement done inside two weeks. Insurance paperwork handled too."},
         {"author": "Phil", "rating": 4, "text": "Solid work on our tile roof. Showed up when they said they would, which is rare enough to mention."}]}},
    {"name": "Gulf Coast Roof Repair", "ig": "gulfcoastroofrepair", "email": "gulfcoastroofrepair@gmail.com",
     "phone": "(813) 555-0166", "has_site": False, "gbp": {"rating": 4.7, "review_count": 41, "photo_count": 9, "reviews": []}},
    {"name": "Sunshine State Roofers", "ig": "sunshinestateroofers", "email": "sunshinestateroofers@gmail.com",
     "phone": "(813) 555-0177", "has_site": True, "site": "https://sunshinestateroofers.example.com", "gbp": {"rating": 4.5, "review_count": 33, "photo_count": 6, "reviews": []}},
    {"name": "Hillsborough Roof Pros", "ig": "hillsboroughroofpros", "email": "hillsroofpros@gmail.com",
     "phone": "(813) 555-0119", "has_site": False, "gbp": None},
    {"name": "Westshore Roofing & Sheet Metal", "ig": "westshoreroofing", "email": "westshoreroofing@gmail.com",
     "phone": "(813) 555-0131", "has_site": True, "site": "https://westshoreroofing.example.com", "gbp": {"rating": 4.8, "review_count": 52, "photo_count": 15, "reviews": []}},
    {"name": "Palma Ceia Roof Works", "ig": "palmaceiaroofworks", "email": "palmaceiaroofworks@gmail.com",
     "phone": "(813) 555-0108", "has_site": False, "gbp": {"rating": 5.0, "review_count": 19, "photo_count": 11, "reviews": []}},
    {"name": "Tampa Bay Shingle Masters", "ig": "tbshinglemasters", "email": "tbshinglemasters@gmail.com",
     "phone": "(813) 555-0155", "has_site": False, "gbp": None},
    {"name": "Ybor City Roofing", "ig": "yborcityroofing", "email": "yborcityroofing@gmail.com",
     "phone": "(813) 555-0186", "has_site": False, "gbp": {"rating": 4.6, "review_count": 28, "photo_count": 7, "reviews": []}},
    {"name": "Carrollwood Roof & Gutter", "ig": "carrollwoodroof", "email": "carrollwoodroof@gmail.com",
     "phone": "(813) 555-0122", "has_site": True, "site": "https://carrollwoodroof.example.com", "gbp": {"rating": 4.4, "review_count": 22, "photo_count": 4, "reviews": []}},
    {"name": "Brandon Storm Roofing", "ig": "brandonstormroofing", "email": "brandonstormroofing@gmail.com",
     "phone": "(813) 555-0149", "has_site": False, "gbp": {"rating": 4.9, "review_count": 64, "photo_count": 18, "reviews": []}},
    {"name": "Riverview Roofing Brothers", "ig": "riverviewroofbros", "email": "riverviewroofbros@gmail.com",
     "phone": "(813) 555-0170", "has_site": False, "gbp": None},
    {"name": "Seminole Heights Roofing", "ig": "semheightsroofing", "email": "semheightsroofing@gmail.com",
     "phone": "(813) 555-0193", "has_site": False, "gbp": {"rating": 4.8, "review_count": 45, "photo_count": 13, "reviews": []}},
    {"name": "Town N Country Roof Care", "ig": "tncroofcare", "email": "tncroofcare@gmail.com",
     "phone": "(813) 555-0114", "has_site": True, "site": "https://tncroofcare.example.com", "gbp": {"rating": 4.2, "review_count": 12, "photo_count": 3, "reviews": []}},
    {"name": "New Tampa Metal Roofing", "ig": "newtampametalroofing", "email": "newtampametalroof@gmail.com",
     "phone": "(813) 555-0138", "has_site": False, "gbp": {"rating": 4.7, "review_count": 31, "photo_count": 10, "reviews": []}},
    {"name": "Davis Islands Roofing Co.", "ig": "davisislandsroofing", "email": "davisislandsroofing@gmail.com",
     "phone": "(813) 555-0161", "has_site": False, "gbp": None},
    {"name": "Lutz Family Roofers", "ig": "lutzfamilyroofers", "email": "lutzfamilyroofers@gmail.com",
     "phone": "(813) 555-0125", "has_site": False, "gbp": {"rating": 4.9, "review_count": 58, "photo_count": 21, "reviews": []}},
    {"name": "Plant City Roof Restoration", "ig": "plantcityroofrestore", "email": "plantcityroofrestore@gmail.com",
     "phone": "(813) 555-0182", "has_site": True, "site": "https://plantcityroofrestore.example.com", "gbp": {"rating": 4.3, "review_count": 16, "photo_count": 5, "reviews": []}},
    {"name": "Temple Terrace Roofing", "ig": "templeterraceroofing", "email": "templeterraceroofing@gmail.com",
     "phone": "(813) 555-0176", "has_site": False, "gbp": {"rating": 4.6, "review_count": 26, "photo_count": 8, "reviews": []}},
]

DEMO_AREAS = {
    "Tampa": ["Brandon", "Riverview", "Wesley Chapel", "Carrollwood"],
}

# 50-city fallback/demo ranking (name, state, pay_prob, density, weak_web, spend, competition)
DEMO_CITIES: list[tuple[str, str, float, float, float, float, float]] = [
    ("Tampa", "FL", .86, .88, .72, .78, .45), ("Orlando", "FL", .84, .86, .70, .76, .48),
    ("Jacksonville", "FL", .83, .84, .74, .72, .40), ("San Antonio", "TX", .82, .87, .73, .70, .42),
    ("Fort Worth", "TX", .81, .82, .71, .74, .43), ("Charlotte", "NC", .80, .80, .66, .78, .46),
    ("Columbus", "OH", .79, .78, .70, .70, .38), ("Indianapolis", "IN", .79, .77, .72, .68, .36),
    ("Nashville", "TN", .78, .79, .64, .77, .52), ("Oklahoma City", "OK", .78, .75, .76, .64, .30),
    ("Memphis", "TN", .77, .74, .78, .60, .32), ("Louisville", "KY", .77, .73, .74, .63, .33),
    ("Tucson", "AZ", .76, .72, .73, .62, .34), ("Kansas City", "MO", .76, .76, .69, .68, .40),
    ("Fresno", "CA", .75, .74, .75, .61, .35), ("El Paso", "TX", .75, .71, .77, .58, .28),
    ("Albuquerque", "NM", .74, .70, .74, .60, .31), ("Milwaukee", "WI", .74, .72, .70, .64, .37),
    ("Birmingham", "AL", .74, .68, .77, .58, .29), ("Grand Rapids", "MI", .73, .69, .69, .65, .35),
    ("Knoxville", "TN", .73, .67, .73, .62, .33), ("Greenville", "SC", .73, .68, .70, .66, .38),
    ("Boise", "ID", .72, .66, .64, .70, .44), ("Chattanooga", "TN", .72, .64, .72, .61, .32),
    ("Little Rock", "AR", .72, .63, .78, .55, .27), ("Lakeland", "FL", .71, .65, .74, .58, .30),
    ("Sarasota", "FL", .71, .64, .66, .72, .45), ("Fort Myers", "FL", .71, .66, .68, .69, .43),
    ("Wichita", "KS", .70, .62, .77, .54, .26), ("Des Moines", "IA", .70, .63, .71, .60, .31),
    ("Omaha", "NE", .70, .65, .70, .62, .33), ("Tulsa", "OK", .70, .64, .75, .57, .29),
    ("Spokane", "WA", .69, .61, .70, .60, .33), ("Baton Rouge", "LA", .69, .62, .76, .56, .30),
    ("Huntsville", "AL", .69, .60, .68, .66, .36), ("Columbia", "SC", .69, .61, .73, .58, .31),
    ("Springfield", "MO", .68, .58, .77, .52, .25), ("Augusta", "GA", .68, .59, .75, .54, .27),
    ("McAllen", "TX", .68, .60, .79, .50, .24), ("Corpus Christi", "TX", .68, .61, .74, .55, .28),
    ("Reno", "NV", .67, .58, .65, .66, .41), ("Winston-Salem", "NC", .67, .57, .73, .56, .29),
    ("Lexington", "KY", .67, .58, .71, .58, .31), ("Toledo", "OH", .66, .56, .76, .50, .26),
    ("Jackson", "MS", .66, .54, .80, .46, .22), ("Shreveport", "LA", .66, .53, .79, .47, .23),
    ("Dayton", "OH", .65, .55, .75, .50, .27), ("Mobile", "AL", .65, .54, .77, .49, .25),
    ("Fayetteville", "AR", .65, .56, .69, .60, .34), ("Amarillo", "TX", .64, .52, .78, .48, .24),
]


# ---------------------------------------------------------------------------
# Provider stand-ins
# ---------------------------------------------------------------------------

class DemoSerp:
    """Synthesizes instagram-flavored SERP results from the demo dataset."""

    def available(self) -> bool:
        return True

    def search(self, query: str, num: int = 20) -> list[dict[str, str]]:
        out = []
        for b in DEMO_BUSINESSES:
            snippet = (f"Roofing contractor in Tampa, FL. Licensed & insured, free estimates. "
                       f"Call {b['phone']} or email {b['email']}. Owner-operated.")
            out.append({
                "title": f"{b['name']} (@{b['ig']}) • Instagram photos and videos",
                "link": f"https://www.instagram.com/{b['ig']}/",
                "snippet": snippet,
            })
        return out[:num]


class DemoPlaces:
    def available(self) -> bool:
        return True

    def _find(self, business_name: str) -> dict[str, Any] | None:
        for b in DEMO_BUSINESSES:
            if b["name"].lower() == business_name.lower():
                return b
        return None

    def find_place(self, business_name: str, city: str) -> dict[str, Any] | None:
        b = self._find(business_name)
        if not b or b["gbp"] is None:
            return None
        return {"place_id": f"demo-{b['ig']}", "name": b["name"]}

    def details(self, place_id: str) -> dict[str, Any]:
        ig = place_id.removeprefix("demo-")
        for b in DEMO_BUSINESSES:
            if b["ig"] == ig and b["gbp"]:
                g = b["gbp"]
                return {
                    "name": b["name"], "website": b.get("site"),
                    "formatted_phone_number": b["phone"], "rating": g["rating"],
                    "user_ratings_total": g["review_count"],
                    "photos": [{"photo_reference": f"demo-photo-{i}"} for i in range(g["photo_count"])],
                    "reviews": [{"author_name": r["author"], "rating": r["rating"], "text": r["text"]}
                                for r in g.get("reviews", [])],
                    "business_status": "OPERATIONAL",
                }
        return {}

    def photo_public_url(self, photo_reference: str, max_width: int = 1600) -> str | None:
        return None  # keep demo previews fully self-contained

    gbp_summary = staticmethod(lambda details: {
        "rating": details.get("rating"),
        "review_count": details.get("user_ratings_total"),
        "photo_count": len(details.get("photos") or []),
        "has_website": bool(details.get("website")),
        "business_status": details.get("business_status"),
    })

    @staticmethod
    def real_reviews(details: dict[str, Any], limit: int = 3) -> list[dict[str, Any]]:
        out = []
        for rv in (details.get("reviews") or [])[:limit]:
            if rv.get("text"):
                out.append({"author": rv["author_name"].split()[0],
                            "rating": rv.get("rating"), "text": rv["text"][:280]})
        return out


class DemoStock:
    def available(self) -> bool:
        return False

    def photo_url(self, query: str, orientation: str = "landscape") -> str | None:
        return None  # force the designed non-photo treatment


class DemoHiggsfield:
    def available(self) -> bool:
        return False

    def generate_image(self, prompt: str, aspect_ratio: str = "16:9") -> str | None:
        return None


def demo_audit(url: str) -> dict[str, Any]:
    """Canned 'weak existing site' audit for demo leads that have a site."""
    return {
        "reachable": True, "https_valid": url.startswith("https"),
        "mobile_responsive": False, "page_weight_kb": 4200, "load_signal": "slow",
        "dated_design_signals": ["table layout", "copyright 2016", "flash-era slider"],
        "has_booking_or_cta": False, "title": url.split("//")[-1],
        "demo_canned": True,
    }


# ---------------------------------------------------------------------------
# DemoClaude - deterministic stand-in for Fable 5
# ---------------------------------------------------------------------------

def _field(pattern: str, text: str) -> str:
    m = re.search(pattern, text, re.DOTALL)
    return m.group(1).strip() if m else ""


def _json_after(label: str, text: str) -> Any:
    """Parse the JSON object/array that immediately follows `label` in a prompt."""
    idx = text.find(label)
    if idx == -1:
        return None
    rest = text[idx + len(label):]
    start = min((i for i in (rest.find("{"), rest.find("[")) if i != -1), default=-1)
    if start == -1:
        return None
    opener = rest[start]
    closer = "}" if opener == "{" else "]"
    depth, in_str, esc = 0, False, False
    for i in range(start, len(rest)):
        ch = rest[i]
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
                    return json.loads(rest[start:i + 1])
                except json.JSONDecodeError:
                    return None
    return None


ROOFING_BRIEF = {
    "palette": {"bg": "#161311", "surface": "#221D19", "ink": "#F3EDE4",
                "accent": "#D96C32", "accent_2": "#8A9BA8",
                "rationale": "Asphalt char and terracotta clay against Gulf-storm slate; Tampa's late sun on shingle."},
    "fonts": {"display": "Fraunces", "text": "Source Sans 3",
              "google_fonts_href": "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Source+Sans+3:wght@400;600&display=swap"},
    "signature_element": "An oversized outlined trade word running behind the hero headline as set dressing",
    "tone": "Steady, storm-tested, neighborly confidence",
    "cta_label": "Get a free roof check",
    "image_briefs": {"hero": "Roofing crew silhouetted on a ridge line at golden hour, Tampa skyline haze",
                     "section": "Close texture of architectural shingles after rain"},
}


class DemoClaude:
    """Routes each prompt to a deterministic, personalized canned response."""

    model = "demo-claude (offline)"

    def ping(self) -> bool:
        return True

    # -- public API mirror of ClaudeClient --

    def complete(self, prompt: str, *, system: str | None = None,
                 max_tokens: int | None = None, effort: str | None = None,
                 on_delta=None) -> str:
        if "BRAND SKELETON" in prompt:
            return self._render_page(prompt)
        if "sales analyst" in prompt:
            return self._why_note(prompt)
        return "ok"

    def complete_json(self, prompt: str, *, schema: dict | None = None,
                      system: str | None = None, max_tokens: int | None = None,
                      effort: str | None = None) -> Any:
        if schema is prompts.CITY_SCHEMA:
            return {"cities": [
                {"name": n, "state": st, "pay_probability": p, "biz_density": d,
                 "weak_web_share": w, "spending_power": sp, "competition": c,
                 "rationale": f"{n} pairs a dense home-service market with a large share of businesses still trading on word of mouth."}
                for (n, st, p, d, w, sp, c) in DEMO_CITIES]}
        if schema is prompts.BRIEF_SCHEMA:
            return self._brief(prompt)
        if schema is prompts.TASTE_SCHEMA:
            return {"would_charge_3k": True, "premium_score": 86,
                    "generic_signals": [],
                    "strongest_moment": "The staged hero reveal against the oversized outlined trade word",
                    "verdict": "PASS", "fix_directives": []}
        if schema is prompts.CONTENT_JUDGE_SCHEMA:
            return self._content_judge(prompt)
        if schema is prompts.EMAILS_SCHEMA:
            return self._emails(prompt)
        if schema is prompts.EMAIL_JUDGE_SCHEMA:
            return self._email_judge(prompt)
        log.warning("DemoClaude: unrecognized schema, returning empty object")
        return {}

    # -- canned generators --

    @staticmethod
    def _why_note(prompt: str) -> str:
        name = _field(r"Business: (.+?) - ", prompt)
        trade = _field(r" - (.+?) in ", prompt)
        city = _field(r" in (.+?)\n", prompt)
        has_site = "True" in _field(r"Has website: (\S+)", prompt)
        if has_site:
            return (f"{name} has strong word-of-mouth in {city} but its current site fails on mobile, "
                    f"loads slowly, and offers no way to book. A modern page would convert the Google "
                    f"traffic its reviews already earn, making this a warm, winnable pitch.")
        return (f"{name} runs a reviewed, active {trade} operation in {city} with no website at all, "
                f"so every searcher lands on competitors. They already invest in Instagram, which "
                f"signals they will pay for marketing that books jobs.")

    def _brief(self, prompt: str) -> dict[str, Any]:
        name = _field(r"Business: (.+?)\n", prompt)
        trade = _field(r"Trade: (.+?)\n", prompt)
        city = _field(r"City: (.+?)\n", prompt)
        b = dict(json.loads(json.dumps(ROOFING_BRIEF)))  # deep copy
        first_word = city.split(",")[0].strip() or "Local"
        b["hero_headline"] = f"{first_word} roofs, built for the storm season."
        b["hero_sub"] = (f"{name} replaces, repairs and inspects roofs across {first_word} - "
                         f"licensed, insured, and on your schedule.")
        b["about_line"] = (f"{name} is an owner-operated {trade.lower()} crew serving {first_word}. "
                           f"No call centers, no subcontracted mystery crews - the person who quotes "
                           f"your roof is on it when the work starts.")
        b["services"] = [
            {"name": "Roof replacement", "blurb": "Architectural shingle, tile and metal systems installed to Florida code."},
            {"name": "Leak & storm repair", "blurb": "Same-week tarping and permanent repairs, documented for your insurer."},
            {"name": "Roof inspections", "blurb": "Photo-documented condition reports for buyers, sellers and insurers."},
            {"name": "Gutters & ventilation", "blurb": "Seamless gutters and ridge venting that protect the system you paid for."},
        ]
        b["areas_served"] = DEMO_AREAS.get(first_word, DEMO_AREAS["Tampa"])
        return b

    @staticmethod
    def _content_judge(prompt: str) -> dict[str, Any]:
        page = prompt.split("Page text:", 1)[-1].lower()
        city = _field(r"a .+? business in (.+?)\.", prompt).split(",")[0].strip().lower()
        trade_word = "roof"  # demo niche
        real = _json_after("real reviews:", prompt) or []
        named_ok = True
        if not real and "sample review shown as a placeholder" not in page:
            named_ok = False
        problems = []
        checks = {
            "hero_matches_city_trade": (city in page) and (trade_word in page),
            "services_match_trade": trade_word in page,
            "areas_real": all(a.lower() in page for a in DEMO_AREAS["Tampa"]),
            "reviews_ok": named_ok,
        }
        for k, v in checks.items():
            if not v:
                problems.append(f"demo judge: {k} failed")
        return {**checks, "problems": problems}

    @staticmethod
    def _emails(prompt: str) -> dict[str, Any]:
        name = _field(r"to the owner of (.+?) \(", prompt)
        city = _field(r"\((?:[^,]+),\s*\n?(.+?)\)\.", prompt).strip()
        url = _field(r"live website preview: (\S+)", prompt)
        hook = _field(r"Honest observation to open with \(from our audit\): (.+?)\n", prompt)
        short = name.split(" ")[0] if name else "there"
        return {
            "initial": {
                "subject": f"Built {name} a website - it's live",
                "body": (f"Hi - I run Novus Co., a small web studio.\n\n{hook}\n\n"
                         f"Rather than pitch you, I went ahead and built {name} a site. "
                         f"It's live here:\n{url}\n\nIf it's useful, it's yours and we'll finish it together. "
                         f"If not, ignore me and keep the mockup.\n\nWorth a look?\n\nSalim"),
            },
            "followup2": {
                "subject": f"The mobile version of that {short} preview",
                "body": (f"Quick follow-up - most of your customers will find you on a phone, "
                         f"so I made sure the preview I built for {name} works one-handed: "
                         f"tap to call, tap to request a quote.\n\n{url}\n\n"
                         f"Want me to send a screen recording of it on a phone?\n\nSalim"),
            },
            "followup3": {
                "subject": f"Leaving the {city} preview up through Friday",
                "body": (f"Last note from me. A few {city} home-service businesses we work with "
                         f"started exactly like this - a free preview that became their real site.\n\n"
                         f"I'll keep yours live through Friday: {url}\n\n"
                         f"If the timing's wrong, no hard feelings - I'll take it down and leave you be.\n\nSalim"),
            },
        }

    @staticmethod
    def _email_judge(prompt: str) -> dict[str, Any]:
        subject = _field(r"Subject: (.+?)\n", prompt)
        body = prompt.split("Body:", 1)[-1]
        problems = []
        subject_honest = not re.match(r"\s*(re|fwd?):", subject, re.I) and subject.strip() != ""
        if not subject_honest:
            problems.append("subject looks deceptive")
        unfilled = bool(re.search(r"\{\{|\}\}|\[(?:name|business|city)\]", body, re.I))
        if unfilled:
            problems.append("unfilled personalization token")
        return {"subject_honest": subject_honest, "sounds_human": True,
                "personalized": not unfilled, "problems": problems}

    # -- demo page renderer (stands in for Fable 5 elevating the skeleton) --

    def _render_page(self, prompt: str) -> str:
        facts_name = _field(r"- Name: (.+?)\n", prompt)
        facts_trade = _field(r"- Trade: (.+?)\n", prompt)
        facts_city = _field(r"- City: (.+?)\n", prompt)
        facts_phone = _field(r"- Phone: (.+?)\n", prompt)
        if "not public" in facts_phone:
            facts_phone = ""
        brief = _json_after("DESIGN BRIEF (follow it):", prompt) or {}
        media = _json_after("IMAGE URLS", prompt) or {}
        reviews = _json_after("REAL_REVIEWS", prompt) or []
        skeleton = prompt.split("BRAND SKELETON", 1)[-1]
        skeleton = skeleton.split(":\n", 1)[-1]
        # Trim trailing instruction block after the document ends
        end = skeleton.rfind("</html>")
        if end != -1:
            skeleton = skeleton[:end + len("</html>")]
        return render_skeleton(skeleton, facts_name, facts_trade, facts_city,
                               facts_phone, brief, media, reviews)


# ---------------------------------------------------------------------------
# Skeleton renderer (shared by DemoClaude; also handy for tests)
# ---------------------------------------------------------------------------

def _loop_block(html: str, tag: str, rows: list[dict[str, str]]) -> str:
    """Expand <!-- novus:tag --> ... <!-- /novus:tag --> for each row."""
    pat = re.compile(rf"<!--\s*novus:{tag}\s*-->(.*?)<!--\s*/novus:{tag}\s*-->", re.DOTALL)
    m = pat.search(html)
    if not m:
        return html
    tpl = m.group(1)
    rendered = "".join(_apply(tpl, row) for row in rows)
    return html[:m.start()] + rendered + html[m.end():]


def _apply(tpl: str, mapping: dict[str, str]) -> str:
    for k, v in mapping.items():
        tpl = tpl.replace("{{" + k + "}}", str(v))
    return tpl


def render_skeleton(skeleton: str, name: str, trade: str, city: str, phone: str,
                    brief: dict[str, Any], media: dict[str, Any],
                    reviews: list[dict[str, Any]]) -> str:
    from datetime import date
    pal = brief.get("palette", {})
    city_short = city.split(",")[0].strip()
    hero_img = media.get("hero")
    section_img = media.get("section")

    html = skeleton
    html = _loop_block(html, "service", [
        {"SERVICE_NAME": s_["name"], "SERVICE_BLURB": s_["blurb"],
         "SERVICE_INDEX": str(i % 4), "SERVICE_NUM": f"{i + 1:02d}"}
        for i, s_ in enumerate(brief.get("services", []))])
    html = _loop_block(html, "area", [{"AREA": a} for a in brief.get("areas_served", [])])
    if reviews:
        html = _loop_block(html, "review", [
            {"REVIEW_AUTHOR": r["author"],
             "REVIEW_STARS": "★" * int(round(r.get("rating") or 5)),
             "REVIEW_TEXT": r["text"],
             "REVIEW_TAG": "Google review",
             "REVIEW_INDEX": str(i)} for i, r in enumerate(reviews)])
        html = _loop_block(html, "placeholder-reviews", [])  # real reviews replace samples
    else:
        html = _loop_block(html, "review", [])  # drop the empty card template
        # and leave the labeled placeholder block from the skeleton untouched

    hero_css = (f"background-image:linear-gradient(160deg,rgba(10,8,7,.78),rgba(10,8,7,.35) 55%,rgba(10,8,7,.65)),url('{hero_img}');"
                "background-size:cover;background-position:center;") if hero_img else ""
    section_html = (f'<img src="{section_img}" alt="{trade} work by {name}" loading="lazy" '
                    f'style="width:100%;height:100%;object-fit:cover;border-radius:14px">'
                    if section_img else "")

    # Demo pages must be fully self-contained (no network): swap the Google
    # Fonts link for an empty data: stylesheet and use system font stacks.
    display_font = "Georgia"
    text_font = "Segoe UI"
    fonts_href = "data:text/css,"
    trade_word = trade.split()[0].upper()

    html = _apply(html, {
        "BUSINESS_NAME": name, "CITY": city_short, "TRADE": trade,
        "TRADE_WORD": trade_word,
        "HERO_HEADLINE": brief.get("hero_headline", f"{trade} in {city_short}, done right."),
        "HERO_SUB": brief.get("hero_sub", ""),
        "ABOUT_LINE": brief.get("about_line", ""),
        "CTA_LABEL": brief.get("cta_label", "Get a free quote"),
        "PHONE": phone or "",
        "PHONE_HREF": re.sub(r"[^\d+]", "", phone) if phone else "",
        "YEAR": str(date.today().year),
        "BG": pal.get("bg", "#141210"), "SURFACE": pal.get("surface", "#201c18"),
        "INK": pal.get("ink", "#f2ece2"), "ACCENT": pal.get("accent", "#d96c32"),
        "ACCENT2": pal.get("accent_2", "#8a9ba8"),
        "FONT_DISPLAY": display_font, "FONT_TEXT": text_font,
        "FONTS_HREF": fonts_href,
        "HERO_BG_CSS": hero_css,
        "SECTION_IMAGE": section_html,
    })
    # Phone CTA rows collapse cleanly when no public phone exists
    if not phone:
        html = html.replace('data-novus="phone-row"', 'data-novus="phone-row" hidden')
    # Ship a clean page: drop skeleton documentation / consumed loop-marker comments
    html = re.sub(r"<!--(?:(?!-->).)*-->", "", html, flags=re.DOTALL)
    return html
