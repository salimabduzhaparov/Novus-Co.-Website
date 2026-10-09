# Page-specific invitations and centered request form — 10 October 2026

This revision supersedes the earlier shared invitation placement where noted below.

- Removed introductory preview buttons from About, Services and Process. About now focuses on the business without a closing preview section; navigation and footer links remain available.
- Restored the exact historical homepage closing text: “You take pride in your work. Your website should show it.” (from commit `a45f1a08668e2b45b189a4db589ba6ef47ee380e`).
- Process retains “Put your business first.” at the bottom. Services closes with “See a service that could make your business shine?” and the existing free-preview button.
- Preserved the request-page heading “See what your website could be.”, removed its redundant start button, and centered the form in a light-blue, navy-accented panel capped at 760px. Expectations and direct email now follow the form.
- Form fields, validation, focus handling, success/error states and submission logic are unchanged. Inputs remain 16px on phones; no real form message was submitted.
- Desktop, 390px and 320px form checks confirmed centering, visible contrast and no horizontal overflow. Production build, TypeScript, ESLint, whitespace, route/SEO/media and page-specific CTA checks passed. Live publication is verified separately after push.

---

# Smooth ranking swaps and phone preview — 10 October 2026

- Restored 0.7-second positional swaps while keeping the shorter 1.9-second stage delays. The SEO panel remains 780px, with automatic replay on returning and no Replay button.
- Kept positional layout active across the playback threshold; scrolling can pause the stage timer without cancelling a swap already in progress. Full exit still resets the example offscreen.
- Reserved the featured card description height and kept it above its neighbours during crossing, so the two rows visibly exchange positions without a card-height jump.
- Browser sampling verified both transitions at desktop and 390px phone widths, including intermediate positions and stable featured-card height. Production build, TypeScript, ESLint and whitespace checks passed.
- Prepared a separate local live-phone preview with 360/390/430px options; this viewer is outside the website repository. The mobile review found no new blocking source issue. The 36px story-pause control remains a minor touch-target limitation; no unrelated design change was made.

---

# Focused SEO example and preview invitation — 10 October 2026

Production build, TypeScript, ESLint, whitespace and local HTTP checks passed. Live release verification follows the push.

- Reduced the centered SEO demonstration from 900px to 780px and tightened internal spacing. Its ranking steps now start at 1.9 and 3.8 seconds, with shorter 550ms movement.
- Removed Replay. The example resets only after fully leaving the viewport and plays again on reentry in either scroll direction. Small threshold movements do not restart it. Manual pause, hidden-tab pause and reduced-motion behavior remain supported; the Pause control disappears when the animation finishes without changing header height.
- Replaced the closing illustration and three-step strip with a centered command: “Put your business first.” The existing large preview button remains. Home, About, Services, Process and Reviews share the same invitation.
- Retired Work from desktop/mobile navigation, footer, homepage and sitemap. Removed the old portfolio FAQ and Reviews promotion. The old /work URL permanently redirects to /services, preserving a useful destination for existing links. Historical portfolio source/assets remain recoverable.
- Browser checks covered desktop and 390px mobile appearance, last-to-first progression, automatic replay on scrolling back, absence of Replay, and the preview link. Core-page H1/canonical/description/indexability, sitemap/robots, existing media and the Work redirect passed HTTP checks. No form messages were submitted.

---

# Continuous-loop and CTA refinement — 10 October 2026

**Status: Production build and local verification passed; live deployment is verified separately.**

This revision supersedes the previous scroll-frame playback and two-panel growth demonstration. Earlier release notes remain preserved below.

- Generated a new Higgsfield loop with the same start/end photograph: job `b2d51f2a-2aaa-4cb1-a979-64b7531737b9`, `seedance_2_5`, H.264, 1920×1040, 24fps, 10.041667 seconds, 1,449,722 bytes. Native playback is independent of scroll, with pause/offscreen/hidden-tab handling and reduced-motion/data-saving poster support.
- Kept the readable customer-story chapters, while replacing negative-margin overlap with a contained sticky grid. Controls use a separate sticky layer; the following white Services section has an explicit stacking boundary.
- Replaced the two growth panels with one centered SEO search example. “Your Business” advances from last to first, with a visible illustrative label, pause/replay, reduced-motion support and practical SEO explanations. No measured rank or enquiry result is claimed.
- Strengthened the shared free-preview CTA using navy/ice-blue contrast, a stable label, designed arrow tile and restrained hover/focus halo. Expanded the closing offer with an illustrative website preview and three clear next steps. Applied the shared CTA across Process, Services, About, Work, Contact and Book without changing form semantics.
- Extended explicit top-reset navigation to Home/logo clicks, including from homepage hashes, while preserving Process, hash links and Back/Forward behavior.
- Refreshed native 21st catalog research: [Motion Button](https://21st.dev/@Shatlyk1011/components/motion-button), [Interactive Hover Button](https://21st.dev/@dillionverma/components/interactive-hover-button), [Expanding Arrow Button](https://21st.dev/@starc007/components/expanding-arrow-button). These informed an original CTA implementation; no new component source was retrieved or copied. Existing [Motiq Animated List](https://21st.dev/@rmahammad/components/animated-list) attribution is retained.

Local mobile visual checks at 320px/390px, short-desktop layout at 1280×600, pause/reduced-motion behavior, Services boundary, Home/Process navigation and form-entry navigation passed. Production build, TypeScript, ESLint, whitespace and HTTP/SEO/media checks passed. Commit/deployment and live checks are verified after the push. Rankings, enquiries, conversions and field performance remain unmeasured.

---

## Previous release records — preserved for history

The playback and two-panel statements below describe earlier revisions and are superseded where noted above.

# Scroll-story update — 9 October 2026

**Status: Production build and local verification passed; deployment is verified separately.**

This update supersedes the interim illustration and prompt-only hero described in the preserved earlier record below.

- Generated a roughly 12-second, 1080p Higgsfield person/laptop film. The website uses 96 optimized WebP frames (1,728,200 bytes / 1.73 MB), a static poster and a bounded frame cache instead of compressed-video seeking on every scroll event.
- Added a five-chapter homepage journey: introduction, local search, missing information, competitor choice with sourced statistics, then the Novus approach. Search screens and cursor are deterministic interface elements; important copy and links remain HTML.
- Added clearly labelled illustrative search visibility and enquiry examples after Why Novus. Sample notifications are not live transactions or measured results. Motion includes pause/replay, offscreen/hidden-tab handling and reduced-motion behavior.
- Used the connected 21st.dev tooling for eight searches and two complete source retrievals. Adapted the MIT Motiq Animated List with its notice retained; used other inspected examples as relevant design references without adding a new UI runtime.
- Removed Bluepeak/Mike explorations from the homepage; retained them on Work. Strengthened section-label hierarchy and gave Services a white background, navy headings and contrasting scope areas.
- Slowed the homepage horizontal process to 1.65× scrolling distance, widened milestones to 420px and increased gaps to 150px. The separate Process route now uses expanded vertical stages with white/ice/navy contrast.
- Integrated RouteScrollReset for deliberate /process link navigation. It returns to the overview after outgoing pin cleanup, without overriding hash anchors or Back/Forward restoration.
- Preserved SEO metadata, crawlable content, canonical URLs, sitemap, robots and Organization data. Rankings, enquiries, conversion changes and field performance remain unmeasured; no outcome guarantee is made.

Integrated production build, TypeScript, ESLint and whitespace checks passed. Browser checks covered 320px/390px phones, 1280px desktop and the 1440 × 1000 horizontal timeline, motion pause, reduced-motion poster fallback, service anchors and Process navigation from the pinned timeline. Production HTTP checks passed for core routes, one H1 per page, canonical URLs, descriptions, robots/sitemap, generated media and a real 404. Live deployment verification follows the push. The release summary and complete 21st.dev decisions are exported in the workspace outputs folder.

---

## Earlier revision record — preserved for history

The following describes the previous release. Its interim-hero and prompt-only statements are superseded by the update above.

# Novus website revision — 9 October 2026

This revision supersedes the earlier orbital-hero redesign.

## What changed and why

- Replaced the rejected orbital hero with a lightweight website illustration and direct messaging for local service businesses. No hero video element is rendered in this version.
- Put sourced customer research immediately after the hero, ahead of project examples. The following section shows missing information, a confusing website and a clear website, with an illustration that changes during ordinary page scrolling.
- Made services practical: explain the business, make enquiries easier and establish search foundations.
- Replaced Evergrove and Form & Field with Bluepeak and Mike the Plumber hero explorations. Both have contextual loops, pause controls and reduced-motion fallbacks. They are labelled concepts, not approved client work or evidence of results.
- Combined the homepage's thinking/why content. Restored mission, vision and a fuller explanation on the separate About page.
- Restored six process stages: Discover, Design the Preview, Review Together, Build, Launch, Optional Improvements. Each explains the work and its takeaway.
- Retained separate Services, Process, About and Work pages. Services uses six clear cards and section links.
- Made the main action consistently a free preview. The form explains that a requested call is arranged by reply, not instantly booked.
- Kept Geist and the original circular N. Hierarchy, spacing, contrast and composition were more useful changes than another font replacement.

## References inspected

21st.dev component categories, rendered previews and public usage information were inspected in a browser. Some full source/copy-prompt controls require sign-in; those controls were not bypassed and hidden code was not copied.

| Reference | Decision |
| --- | --- |
| [Ryvo](https://ryvodigital.com/) | Adopt narrative that changes as visitors scroll. Keep Novus's identity and omit the orbital visual the owner rejected. |
| [Dedun Ventures](https://dedunventures.com/) | Use clear numbered storytelling and explicit business outcomes. Omit loading theatre and invented operational figures. |
| [Clay](https://clay.global/) | Retain whitespace and hierarchy as general principles without carrying its agency style so far that Novus loses its personality. |
| [Hyperiux Product Timeline](https://21st.dev/@hyperiux/components/timeline) | Adapt the source supplied by the owner to Novus's six stages. Preserve its credit. Use existing GSAP; omit Lenis and SplitText. |
| [Sticky Scroll Reveal](https://21st.dev/@manuarora700/components/sticky-scroll-reveal) | Use the changing visual/story pattern for the customer journey, implemented with native IntersectionObserver and CSS, without a nested scroll box. |
| [Number Ticker](https://21st.dev/@danielpetho/components/basic-number-ticker/fancy-basic-number-ticker) | Use a brief, once-per-view reveal for sourced statistics. Original lightweight counter with stable server-rendered values, not an added package. |

The process uses pinned horizontal motion only on a sufficiently large, tall desktop viewport with a fine pointer and no reduced-motion preference. Other visitors get all six stages vertically. Native scrolling and controls provide a fallback. Animation is not required to read the process.

## Evidence

- 54%: stated likelihood of visiting a business website after positive reviews; US adults, n=1,002, BrightLocal, February 2026. [Source](https://www.brightlocal.com/research/local-consumer-review-survey/)
- 85%: importance of contact details/opening hours when researching local businesses; US consumers, n=1,000, BrightLocal, April 2025. [Source](https://www.brightlocal.com/research/consumer-search-behavior/)
- 52%: recent local searchers who considered a business and decided not to contact it during their last search, for any reason; US recent searchers, n=1,227, BrightLocal, July 2026. This is not rejection specifically because a website is missing. [Source](https://www.brightlocal.com/research/consumer-search-behavior-decisions/)

Each number has source and sample context on the website. None predicts revenue, rankings or leads. No fabricated reviews, customer portraits, satisfaction rates, prices or turnaround guarantees were added.

## Judgment on Claude's feedback

Accepted: clearer audience/outcome in the hero, preview-first action, more specific services, trade-business examples and a stronger explanation of the customer problem.

Rejected or deferred: unsupported prices, deadlines, fictional testimonials/results, font assumptions from a text-only review, reducing the preferred process to three steps and turning the website into one page. The owner's instructions take priority.

## Asset provenance

- Novus: owner's original PNG, displayed as a circular N crop without the lower wordmark; 52px desktop, 48px mobile. Source preserved.
- Mike: original logo and work photographs from the owner's Mike plumbing project. The preview remains a concept, not an approval claim.
- Bluepeak: generated with OpenAI image generation at the owner's explicit request. The rendered website uses an optimized WebP. The technician image is illustrative, not a claimed employee portrait.

Bluepeak generation brief: clean flat mountain-peak mark combining a flowing water curve and an energy diagonal, ice blue/cobalt on dark navy, white lettering reading BLUEPEAK with PLUMBING & ELECTRICAL below; no gradients, mockup objects, photographic texture or 3D effects. An opaque navy result was selected after the transparent variant produced poor lettering edges. The original PNG is preserved.

## Hero video: prompt only

The replacement video has not been generated or published. A separate production brief describes a 15-second Higgsfield story: person at laptop, incomplete local-business listing, hesitation, then a competitor's clear website. The live hero uses an interim illustration.

Use Higgsfield for the person, environment and camera work. Composite exact interface text and cursor movements separately so they stay legible and controllable. Keep the headline and call to action in HTML. Avoid scroll-seeking an ordinary compressed clip, which contributed to the rejected experience.

## SEO and limits

The subject, audience and offer are more explicit. Crawlable page content, separate page topics, descriptive titles/descriptions, internal links, canonical URLs, sitemap, robots.txt, social metadata and Organization structured data are preserved. Canonicals use https://www.novuswebsites.com.

These foundations help search engines discover and understand pages. They do not guarantee indexing, higher rankings or enquiries. Useful original content and understandable organization matter more than animation as an SEO strategy. [Google SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide)

Removing the hero video and limiting animation work should reduce unnecessary loading/rendering, but no measured field Core Web Vitals or conversion improvement is claimed. [Google Core Web Vitals guidance](https://developers.google.com/search/docs/appearance/core-web-vitals)

The strongest future improvements are permission-backed client case studies and genuine reviews, measured enquiries, Search Console data and service/location content based on the actual offer. Avoid mass-produced city pages or invented proof. A Tampa setting in the illustrative video does not itself establish a verified office address.

## Validation

- Production build including TypeScript, lint and whitespace validation.
- Desktop and mobile layout checks, including 390px/320px homepages, mobile menu and service navigation.
- Scroll-story state and illustration clipping checked and corrected.
- Process/portfolio motion controls and reduced-motion behavior checked separately.
- Production route status, one H1 per page, canonical URLs, descriptions, absence of accidental noindex, assets, robots, sitemap and missing-page behavior.
- No real test email sent. Inbox delivery, Search Console access, rankings, leads and field performance remain unmeasured.

Publication is verified separately against the Git commit's Vercel status and live domain; a local build alone is not a deployment.
