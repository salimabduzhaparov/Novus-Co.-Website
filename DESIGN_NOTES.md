# Novus website redesign — implementation notes

## Direction
The owner selected Clay's spacious agency structure and rejected the Obys-style portfolio direction. Novus retains its own logo, cobalt blue and orbital identity. The site now uses a light, open layout, larger readable typography, clear service rows, original concept examples and a direct enquiry journey.

Geist was retained: hierarchy, spacing, measure and contrast were the larger issues than the font family. The hero has one sculptural focal point. Motion supports that composition; there are no compulsory scroll locks or hidden content.

## Design references and implementation
- [Clay](https://clay.global/): spacious page composition, prominent work presentation, agency positioning.
- [21st.dev Split Hero with Image Cards](https://21st.dev/@felipemenezes098/components/hero-08): researched as a hero composition reference.
- [21st.dev Gallery Grid](https://21st.dev/@moumensoliman/components/gallery-grid-block-shadcnui): researched as a gallery reference.
- [21st.dev FAQ](https://21st.dev/@kevingirelli/components/faq): researched as an accordion reference.
- [21st.dev Image Comparison](https://21st.dev/@tommyjepsen/components/feature-with-image-comparison): evaluated; not added because there was no substantiated before/after client case study.

The shipped components are original implementations adapted to Novus. No claim is made that these third-party components were installed or copied. The FAQ uses native HTML disclosure controls; the process timeline is original scroll-progress code.

## Media
The actual repository logo is used in navigation and footer. The original logo icon is also used as the favicon. Website mockups are original illustrations and compositions.

Higgsfield generated the original orbital sculpture and a five-second silent image-to-video animation:
- Image job: 07b0ad13-6940-43c2-97a0-5e9eac143a47, gpt_image_2_5.
- Video job: 2298989e-3eb7-45ed-81ab-bd1f2d07a7e6, Seedance 2.5.
- Served image: WebP, approximately 32 KB.
- Served video: MP4, approximately 390 KB, 5.04 seconds.
- Playback position follows scrolling. Visitors can turn motion off. Reduced-motion visitors receive the static image without loading the video element.

Video prompt:
> Animate this exact cobalt blue and polished silver sculptural orbital ribbon. Locked-off studio camera, pale cool blue seamless background, restrained luxury product animation. The orbital ring smoothly rotates a subtle 25 degrees around its vertical axis, while two small spheres glide slowly in the same orbital plane and light moves softly across the metallic surface. Preserve the sculpture topology, shape and materials. No deformation, no new objects, no text, no logo. Gentle continuous motion, no sudden moves, no zoom, no cuts. A clean refined five second hero animation for a premium web design studio.

## Content integrity
Evergrove and Form & Field are explicitly labeled fictional design concepts. They are not represented as customers or delivered projects. Invented reviews, ratings and unsupported trust percentages were removed. Existing /reviews and /statistics URLs remain useful pages rather than broken links.

## Technical changes
- Static-rendered pages with page-specific titles, descriptions and canonical URLs.
- Canonicals, sitemap and organization schema use the verified primary host: https://www.novuswebsites.com.
- robots.txt, sitemap.xml, a social image and Organization JSON-LD.
- Skip link, visible keyboard focus, labeled form controls and accessible validation.
- Booking phone and notes are optional; email confirms a requested call rather than implying a calendar reservation.
- Existing Resend recipient and sender integration preserved.
- Next.js and eslint-config-next updated to 16.3.8.
- Build uses supported webpack mode after a local Turbopack port-binding failure.
- Unused legacy marketing components and fabricated proof data removed.

## Validation
- Production build, lint, TypeScript and whitespace checks.
- 27 mocked API checks plus eight production-server invalid-input checks. No real email was sent.
- Ten public routes, 21 internal links/anchors, sitemap, robots, social asset and 404 handling checked.
- Browser checks at desktop, 390 px and 320 px widths; no horizontal overflow on checked routes.
- Mobile menu, Escape, form errors, focused confirmation with mocked response, FAQ and reduced-motion behavior checked.
- Production dependency audit: zero known vulnerabilities at the check. Full development audit retains five entries from one upstream braces dependency chain; no forced incompatible downgrade applied.

Live inbox delivery and Google indexing/ranking are not claimed by these checks. A search-engine crawl and rankings happen after deployment and cannot be guaranteed.
