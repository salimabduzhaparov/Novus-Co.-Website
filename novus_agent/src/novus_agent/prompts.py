"""Every Fable 5 prompt + JSON schema the agent uses.

The design guidance below is the distilled "taste layer" for Module 3. It lives
in the repo (not in any external tool) so the nightly run produces design-led
output on a bare server.
"""
from __future__ import annotations

import json
from typing import Any

# ---------------------------------------------------------------------------
# Design guidance (Module 3 - premium previews)
# ---------------------------------------------------------------------------

DESIGN_GUIDE = """\
You are the design lead at Novus Co., a studio whose landing pages sell for
$3,000-$5,000. You are elevating a brand skeleton into a bespoke page for ONE
real local business. The owner must stop and stare; a rival agency must wince.

TASTE RULES (non-negotiable):
- Bespoke palette per business: derive 4-6 colors from the trade's material
  world and the city's light (roofing: asphalt char, terracotta, storm sky;
  barbershop: oxblood leather, brass, cream enamel; landscaping: moss, loam,
  morning fog). Never default palettes, never purple-gradient-on-dark, never
  #007bff. Check text contrast >= 4.5:1.
- Type pairing with intent: one characterful display face + one quiet text face
  (Google Fonts, max 2 families, weights chosen deliberately). Never Inter,
  Roboto, Arial, Poppins, or system-default-looking choices for the display
  face. Big, confident hero type (clamp() from ~2.5rem to ~5rem), tight
  leading, real typographic hierarchy.
- Spend boldness ONCE: exactly one signature element (an oversized outlined
  word, a diagonal section seam, a hand-drawn underline SVG, an asymmetric
  photo crop, a ticker strip). Everything else stays disciplined on an 8px
  spacing system with generous whitespace.
- Motion = cinematic choreography, not decoration. The page must feel alive
  from the first frame, built from these layers (all inline JS/CSS, no
  external libraries):
    * LOAD TIMELINE: hero headline split into word-level rise reveals
      (overflow-hidden line masks, 60-90ms stagger, slight rotate), then
      eyebrow keyline draw, sub, CTAs, badges - one orchestrated sequence.
    * ATMOSPHERE: exactly one ambient layer tuned to the trade - a sparse
      canvas particle field (embers/dust/pollen, ~40 max, paused when the tab
      is hidden), a slow-drifting gradient sky, or soft blurred color blobs.
      Subtle enough to sit behind text without fighting it.
    * SCROLL CHOREOGRAPHY: IntersectionObserver reveals (translateY 12-24px +
      fade, once, staggered inside grids), section headings unmasking from
      overflow-hidden line wraps, at most one subtle parallax depth cue, and
      a 2px scroll-progress hairline under the nav.
    * MICRO-INTERACTIONS: magnetic pull on the primary CTA (fine pointers
      only), sheen sweep or arrow-slide on buttons, card lift + keyline/edge
      accent on hover, chip fill sweeps. 150-300ms, custom cubic-bezier ease.
    * NAV BEHAVIOR: fixed nav with real section links (Services / Why us /
      Reviews / Areas), transparent at top -> compressed + blurred backdrop
      after ~30px scroll, active-link highlighting via IntersectionObserver.
  EVERY layer must be disabled under `prefers-reduced-motion: reduce` (CSS
  media query AND a JS matchMedia guard). Over-animation still reads as
  AI-generated: no scroll-jacking, no spinning icons, nothing that loops
  loudly in the reading path. Choreographed restraint is the signature.
- Animated counters are allowed ONLY for real numbers you were given (e.g. an
  actual Google review count). Never invent "500+ roofs" style stats.
- Photography treatment: images get a consistent grade (single-color overlay or
  duotone tuned to the palette), never raw stock look. All imagery lazy-loads
  (`loading="lazy"` except the hero), with width/height or aspect-ratio set so
  nothing shifts. Hero may use a gradient scrim for text legibility.
- The hero is a thesis: the single most confidence-projecting, characteristic
  claim about this business, phrased for its city - not a generic slogan.
- Honest content only: real services for the trade, 4 real nearby areas,
  reviews ONLY if real ones are supplied - otherwise keep the clearly-labeled
  placeholder block exactly as marked. Never invent named testimonials, star
  counts, or stats.
- Performance: ONE self-contained .html file (inline CSS + JS, no build step,
  no external JS libraries). Fonts via a single Google Fonts <link> with
  preconnect and display=swap. Total inline code budget ~<90KB.
- Accessibility: semantic landmarks, alt text on every image, visible focus
  states, tap targets >= 44px, mobile-first layout that holds at 360px wide.
"""

# ---------------------------------------------------------------------------
# Module 0 - city targeting
# ---------------------------------------------------------------------------

CITY_SCHEMA: dict[str, Any] = {
    "type": "object",
    "additionalProperties": False,
    "required": ["cities"],
    "properties": {
        "cities": {
            "type": "array",
            "items": {
                "type": "object",
                "additionalProperties": False,
                "required": ["name", "state", "pay_probability", "biz_density",
                             "weak_web_share", "spending_power", "competition", "rationale"],
                "properties": {
                    "name": {"type": "string"},
                    "state": {"type": "string"},
                    "pay_probability": {"type": "number"},
                    "biz_density": {"type": "number"},
                    "weak_web_share": {"type": "number"},
                    "spending_power": {"type": "number"},
                    "competition": {"type": "number"},
                    "rationale": {"type": "string"},
                },
            },
        }
    },
}


def cities_prompt(enrichment: str = "") -> str:
    extra = f"\nPublic data pulled for you (use it to ground your estimates):\n{enrichment}\n" if enrichment else ""
    return f"""Build a ranked list of exactly 50 US cities for a web-design agency
(Novus Co.) that sells $1k-$5k websites + retainers to LOCAL and HOME-SERVICE
businesses (roofing, HVAC, landscaping, plumbing, barbershops, detailing...).

Score each city 0..1 on:
- biz_density: raw count/density of local + home-service businesses
- weak_web_share: estimated share of those businesses with weak or NO website
  (older metros, fast-growing exurbs and trade-heavy markets rank higher)
- spending_power: local small-business revenue / ability to pay real money
- competition: how saturated the market already is with agencies
  (0 = wide open, 1 = saturated - LOWER is better)

pay_probability = the overall probability a cold outreach in this city turns
into a paying client; weigh weak_web_share and biz_density most, then
spending_power, penalize high competition. Rank the list by pay_probability
descending. Favor mid-size Sun Belt / Midwest metros over NYC/SF-tier cities
where competition is brutal. Mix states; no two adjacent suburbs of the same
metro.{extra}
Return JSON only."""


# ---------------------------------------------------------------------------
# Module 2 - "why they need us" note
# ---------------------------------------------------------------------------

def why_note_prompt(lead: dict[str, Any], audit: dict[str, Any]) -> str:
    return f"""You are a sales analyst at a web-design studio. In 2-3 tight sentences,
explain why this business needs us and why it is winnable. Be concrete (cite
what the audit found), zero fluff, no exclamation marks.

Business: {lead['business_name']} - {lead['trade']} in {lead['city']}
Has website: {lead.get('has_website')}  URL: {lead.get('website_url') or 'none found'}
Audit findings: {json.dumps(audit, default=str)}

Return the 2-3 sentences as plain text only."""


# ---------------------------------------------------------------------------
# Module 3 - design brief
# ---------------------------------------------------------------------------

BRIEF_SCHEMA: dict[str, Any] = {
    "type": "object",
    "additionalProperties": False,
    "required": ["palette", "fonts", "signature_element", "hero_headline", "hero_sub",
                 "tone", "services", "areas_served", "about_line", "cta_label",
                 "image_briefs"],
    "properties": {
        "palette": {
            "type": "object",
            "additionalProperties": False,
            "required": ["bg", "surface", "ink", "accent", "accent_2", "rationale"],
            "properties": {
                "bg": {"type": "string"}, "surface": {"type": "string"},
                "ink": {"type": "string"}, "accent": {"type": "string"},
                "accent_2": {"type": "string"}, "rationale": {"type": "string"},
            },
        },
        "fonts": {
            "type": "object",
            "additionalProperties": False,
            "required": ["display", "text", "google_fonts_href"],
            "properties": {
                "display": {"type": "string"}, "text": {"type": "string"},
                "google_fonts_href": {"type": "string"},
            },
        },
        "signature_element": {"type": "string"},
        "hero_headline": {"type": "string"},
        "hero_sub": {"type": "string"},
        "tone": {"type": "string"},
        "services": {
            "type": "array",
            "items": {
                "type": "object",
                "additionalProperties": False,
                "required": ["name", "blurb"],
                "properties": {"name": {"type": "string"}, "blurb": {"type": "string"}},
            },
        },
        "areas_served": {"type": "array", "items": {"type": "string"}},
        "about_line": {"type": "string"},
        "cta_label": {"type": "string"},
        "image_briefs": {
            "type": "object",
            "additionalProperties": False,
            "required": ["hero", "section"],
            "properties": {"hero": {"type": "string"}, "section": {"type": "string"}},
        },
    },
}


def design_brief_prompt(lead: dict[str, Any], gbp: dict[str, Any] | None) -> str:
    gbp_txt = json.dumps(gbp, default=str) if gbp else "none available"
    return f"""{DESIGN_GUIDE}

Produce the DESIGN BRIEF (JSON) for this business. Derive everything from who
they actually are - do not recolor a template.

Business: {lead['business_name']}
Trade: {lead['trade']}
City: {lead['city']}
Instagram: {lead.get('instagram_handle') or 'n/a'}
Google Business Profile signals: {gbp_txt}

Requirements:
- palette: 5 hex colors + one-line rationale rooted in trade material + city light.
- fonts: display + text Google Fonts family names, plus the full
  https://fonts.googleapis.com/css2?... href loading exactly those families/weights.
- signature_element: ONE bold move, described concretely enough to implement.
- hero_headline: the thesis. <= 9 words, names the city or its people.
- services: 4-6 real services this trade sells (no invented specialties).
- areas_served: exactly 4 REAL neighborhoods/suburbs near {lead['city']} - real
  place names a local would recognize.
- image_briefs: cinematic photo/render direction for the hero and one section
  image, tuned to trade + city (golden hour, texture, human presence).
Return JSON only."""


# ---------------------------------------------------------------------------
# Module 3 - full page generation
# ---------------------------------------------------------------------------

PAGE_SYSTEM = DESIGN_GUIDE + """
You write COMPLETE production HTML. Output rules:
- Output ONLY the HTML document, starting with <!doctype html>. No markdown,
  no commentary, no code fences.
- Single file: all CSS in one <style>, all JS in one <script> before </body>.
- Keep the skeleton's SECTION ORDER and its data-novus hooks. You may restyle
  and rewrite everything inside sections, but every section present in the
  skeleton must exist in your page.
- Keep a working top navigation: section links (Services / Why us / Reviews /
  Areas + the CTA) pointing at real ids, scrolled-state compression, and
  active-link tracking. Anchors must actually land on their sections.
- The footer line "Free website preview built by Novus Co." MUST remain,
  verbatim, visible in the footer.
- Reviews: if REAL_REVIEWS are provided, render them with reviewer first names
  and star ratings exactly as given. If none are provided, keep the skeleton's
  clearly-labeled placeholder review block untouched in substance (you may
  restyle it) - it must keep the words "sample review shown as a placeholder".
- Use the provided IMAGE URLS exactly as given for hero/section imagery. If an
  image slot has no URL, build a designed CSS/SVG treatment instead (gradient
  mesh, pattern, oversized type) - never a broken <img>, never an external
  placeholder service.
- Contact form: decorative only in a preview - intercept submit with JS and
  show a friendly "This is a preview - call {phone} instead" toast.
- Include <meta name="viewport">, a <title> with business + city, and a meta
  description. Respect prefers-reduced-motion for every animation.
"""


def page_prompt(lead: dict[str, Any], brief: dict[str, Any], skeleton: str,
                media: dict[str, str | None], reviews: list[dict] | None,
                phone: str | None, fixes: list[str] | None = None) -> str:
    fix_block = ""
    if fixes:
        joined = "\n".join(f"- {f}" for f in fixes)
        fix_block = (f"\n\nQA FIX DIRECTIVES - a previous attempt FAILED review. "
                     f"You MUST resolve every one of these:\n{joined}\n")
    return f"""{fix_block}BUSINESS FACTS (the only true facts - do not invent others):
- Name: {lead['business_name']}
- Trade: {lead['trade']}
- City: {lead['city']}
- Phone: {phone or 'not public - use the contact form only'}
- Instagram: {lead.get('instagram_handle') or 'n/a'}

DESIGN BRIEF (follow it):
{json.dumps(brief, indent=2)}

IMAGE URLS (use exactly; null means design a non-photo treatment):
{json.dumps(media, indent=2)}

REAL_REVIEWS (empty list = keep labeled placeholder block):
{json.dumps(reviews or [], indent=2)}

BRAND SKELETON (keep section order + data-novus hooks + Novus footer):
{skeleton}

Build the full bespoke page now. Make the first second unforgettable: staged
hero reveal, confident type, the one signature element. Then discipline.
Output the complete HTML document only."""


# ---------------------------------------------------------------------------
# Module 3.5 - taste self-critique
# ---------------------------------------------------------------------------

TASTE_SCHEMA: dict[str, Any] = {
    "type": "object",
    "additionalProperties": False,
    "required": ["would_charge_3k", "premium_score", "generic_signals", "strongest_moment",
                 "verdict", "fix_directives"],
    "properties": {
        "would_charge_3k": {"type": "boolean"},
        "premium_score": {"type": "integer"},
        "generic_signals": {"type": "array", "items": {"type": "string"}},
        "strongest_moment": {"type": "string"},
        "verdict": {"type": "string", "enum": ["PASS", "FAIL"]},
        "fix_directives": {"type": "array", "items": {"type": "string"}},
    },
}


def taste_prompt(lead: dict[str, Any], html: str) -> str:
    return f"""{DESIGN_GUIDE}

You are now the HARSHEST design critic on the team, reviewing a page the studio
is about to show a prospect ({lead['business_name']}, {lead['trade']},
{lead['city']}). Judge the HTML below against the taste rules.

Quality bar: "Would a design-led studio charge $3,000-$5,000 for this page, and
would the owner feel it already looks better than 95% of their competitors?"
If it reads as a generic AI landing page (default palette, Inter/Poppins,
uniform card grids, purple gradients, over-animation, fake-feeling copy), it
FAILS.

Score premium_score 0-100 (>= 80 required to PASS). verdict=PASS only if
would_charge_3k is true AND premium_score >= 80. If FAIL, give concrete
fix_directives a developer can apply mechanically.

HTML:
{html}

Return JSON only."""


# ---------------------------------------------------------------------------
# Module 3.5 - content truthfulness judge (city/trade/areas/reviews)
# ---------------------------------------------------------------------------

CONTENT_JUDGE_SCHEMA: dict[str, Any] = {
    "type": "object",
    "additionalProperties": False,
    "required": ["hero_matches_city_trade", "services_match_trade", "areas_real",
                 "reviews_ok", "problems"],
    "properties": {
        "hero_matches_city_trade": {"type": "boolean"},
        "services_match_trade": {"type": "boolean"},
        "areas_real": {"type": "boolean"},
        "reviews_ok": {"type": "boolean"},
        "problems": {"type": "array", "items": {"type": "string"}},
    },
}


def content_judge_prompt(lead: dict[str, Any], html_text: str,
                         real_reviews: list[dict] | None) -> str:
    return f"""Audit the TEXT of a website preview for factual grounding. Business:
{lead['business_name']}, a {lead['trade']} business in {lead['city']}.

Checks:
1. hero_matches_city_trade: hero/headline area clearly references the correct
   city (or its recognizable local area) AND the correct trade.
2. services_match_trade: every listed service is something a {lead['trade']}
   business actually sells.
3. areas_real: the "areas we serve" list contains exactly real neighborhoods,
   suburbs or nearby towns for {lead['city']} (no invented names, no places
   from other metros).
4. reviews_ok: reviews are EITHER (a) drawn from these real reviews:
   {json.dumps(real_reviews or [], default=str)} OR (b) a placeholder block
   explicitly labeled as sample/placeholder. Any named testimonial not in the
   real list and not labeled placeholder = false. Fabricated stats
   ("500+ roofs replaced") that are not in the real data also = false.

Page text:
{html_text}

Return JSON only."""


# ---------------------------------------------------------------------------
# Module 4 - outreach
# ---------------------------------------------------------------------------

EMAILS_SCHEMA: dict[str, Any] = {
    "type": "object",
    "additionalProperties": False,
    "required": ["initial", "followup2", "followup3"],
    "properties": {
        **{
            k: {
                "type": "object",
                "additionalProperties": False,
                "required": ["subject", "body"],
                "properties": {"subject": {"type": "string"}, "body": {"type": "string"}},
            }
            for k in ("initial", "followup2", "followup3")
        }
    },
}


def emails_prompt(lead: dict[str, Any], preview_url: str, audit_hook: str,
                  sender_name: str, business_name: str) -> str:
    return f"""Write a 3-touch cold email sequence from {sender_name} at {business_name},
a web-design studio, to the owner of {lead['business_name']} ({lead['trade']},
{lead['city']}).

The hook: we ALREADY built them a free, live website preview: {preview_url}
Honest observation to open with (from our audit): {audit_hook}

Rules for all three:
- Sound like one busy human wrote it. Short sentences. No hype words
  ("revolutionize", "skyrocket"), no emojis, no exclamation marks, no
  "I hope this finds you well".
- 60-120 words each. First-name-basis sign-off "{sender_name}".
- Subject: specific + honest, mentions their business or city, never clickbait,
  NEVER fake "Re:"/"Fwd:", no ALL CAPS.
- Include the preview link naturally in the body of every touch.
- Low-friction CTA: "worth a look?" / "want me to send the mobile version?" -
  not "book a 30-minute call".
- Do NOT include an opt-out line or mailing address; the system appends the
  compliance footer automatically.
- No placeholders like [Name] or {{business}} - fully written out.

Angles:
- initial: the observation + "I already built you this preview" + link.
- followup2 (day 3): value angle - one concrete thing the preview fixes
  (mobile, booking, Google impression). New subject, don't guilt-trip.
- followup3 (day 7): soft breakup - "I'll leave it here; the preview stays up
  this week", one line of social proof about local businesses upgrading, out.

Return JSON only."""


EMAIL_JUDGE_SCHEMA: dict[str, Any] = {
    "type": "object",
    "additionalProperties": False,
    "required": ["subject_honest", "sounds_human", "personalized", "problems"],
    "properties": {
        "subject_honest": {"type": "boolean"},
        "sounds_human": {"type": "boolean"},
        "personalized": {"type": "boolean"},
        "problems": {"type": "array", "items": {"type": "string"}},
    },
}


def email_judge_prompt(lead: dict[str, Any], subject: str, body: str) -> str:
    return f"""Judge this cold email to {lead['business_name']} ({lead['trade']},
{lead['city']}).

subject_honest: subject is non-deceptive - no fake Re:/Fwd:, no false claims of
a prior relationship, no bait ("your account", "invoice"), accurately reflects
the body.
sounds_human: reads like a busy human, not AI marketing copy.
personalized: references THIS business/city/trade specifically, and contains no
unfilled tokens or bracket placeholders.

Subject: {subject}
Body:
{body}

Return JSON only."""
