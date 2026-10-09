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
