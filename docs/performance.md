# Performance and verification

## Current perspective-corrected hero

Supersedes the six-sprite figures below. Active layers: window 18,842/8,432 bytes (480/240px), coordinated workstation 125,548/43,696 bytes (960/480px). Full set 144,390 bytes; small set 52,128 bytes; loading poster 13,536 bytes. All code/HTML/CSS including deferred chunks: 87,244 bytes gzip. Existing 120 KB code, 180 KB full-image-set and 90 KB small-candidate-set budgets pass.

Latest production Chrome checks: 1440px FCP/LCP 220/380ms; 768px 96/272ms; 390px 88/268ms; 320px 88/264ms. Selected image bytes including loading poster: 157,926 / 76,074 / 65,664 / 65,664 respectively. All four widths: observed CLS 0, no horizontal overflow, no page errors and both image layers decoded and visible. Local single-run observations, not real-device performance claims. See `artifacts/hero/perspective-qa.json` and corresponding PNGs.

Updated behavioral suite passes reduced motion, no-JavaScript fallback, image failure, tween import failure, offscreen request deferral, cold throttled loading, and a five-second delayed window while the workstation remains visible. The suite now targets the two active layers; old six-layer metrics and critic records below are historical.

## Layered hero update — 2026-09-11

The sections below this update describe the earlier published single-image hero. The new local implementation uses six transparent WebP layers and a deferred Tween.js import (3,322 bytes gzip). Total HTML/code/CSS including all deferred chunks is 87,502 bytes gzip, within the unchanged 120,000-byte budget. Full-size layer set: 140,792 bytes. Small candidate set: 57,632 bytes. Deferred loading poster: 13,536 bytes. The image budget now covers the whole selected set plus poster: maximum 180,000 bytes; all-small candidate set 90,000 bytes. These candidate totals are not universal desktop/mobile transfer totals: responsive selection varies by viewport and device pixel ratio.

Production Chrome checks at 1440, 768, 390 and 320px passed: no overflow, no runtime errors, no broken layers, and observed CLS 0. Separate fresh contexts, local server, no network/CPU throttle for this comparison; these single samples are not a statistical benchmark. The revised run overlapped behavioral QA, so timing noise is expected.

| Viewport | Earlier FCP / LCP (ms) | Revised FCP / LCP (ms) | Selected hero image bytes including loading poster |
| --- | --- | --- | --- |
| 1440 | 340 / 340 | 260 / 468 | 119,772 |
| 768 | 116 / 116 | 104 / 264 | 97,106 |
| 390 | 96 / 96 | 128 / 280 | 109,362 |
| 320 | 104 / 104 | 92 / 260 | 86,696 |

The deliberate late reveal increases LCP in these samples, while initial text paint stays broadly similar. Do not claim zero loading impact or an LCP improvement. The priority is immediate prerendered content with delayed decorative art. The 390px test selected the 480px desk and person; reporting the 57.6 KB all-small candidate total as actual mobile transfer would be incorrect.

Cold throttled verification at 390 × 600, Chrome with cache disabled, 150ms network latency, 200,000 bytes/sec download throughput and 4× CPU slowdown: FCP 712ms; completed reveal at 2,691ms since navigation. Image requests began after FCP, around 870ms: poster/window/desk/person first, monitors at 1,507ms, controller at 1,778ms. Selected image bytes totaled 109,362. This is desktop browser emulation on localhost, not a physical-device or deployed-network claim.

Behavioral checks passed: live reduced-motion mode (static layers, no steam), JavaScript disabled (old static fallback), blocked image (fallback), failed tween chunk (visible static scene), offscreen hero (zero layer requests before entry), and a five-second delayed controller (core fully visible while accessory waits). Generated alpha is verified. Scripts and snapshots: `scripts/hero-qa.cjs`, `scripts/hero-behavior-qa.cjs`, `artifacts/hero/revised-*.png`, `artifacts/hero/revised-qa.json`, `artifacts/hero/behavior-qa.json`, `artifacts/hero/slow-network-qa.json`.

Build wrapper could not resolve the package-manager path in this portable environment; the project's direct `pnpm build` completed types, Vite build, prerender, asset validation and budgets successfully. No deployment was requested for this edit.

## Implementation

- Pre-rendered HTML includes the introduction, all seven game titles/descriptions, and real links before JavaScript runs.
- System fonts: no webfont network requests.
- Responsive hero WebP: 13,536 bytes at 640px; 21,764 bytes at 960px.
- Small WebP game posters use native lazy loading and asynchronous decoding.
- Original itch.io GIFs (roughly 2–3 MB each) mount only on hover/focus or explicit preview. Short pointer-intent delay avoids unnecessary loading when passing across a card.
- Preview stops on Escape, explicit stop, leaving a card (unless explicitly pinned), leaving keyboard focus, scrolling offscreen, or hiding the tab. Reduced-motion users get explicit playback only.
- Steam uses CSS transforms/opacity on a tiny SVG; hidden for reduced motion.
- Build enforces a 120,000-byte gzip budget for code plus HTML and a 40,000-byte hero budget. Gzip figures describe potential transfer compression, not universal host behavior.

## Local production observation (2026-09-11)

Using the optimized local Vite preview in a desktop browser at a 390×844 viewport, without CPU or network throttling:

| Measurement | Result |
|---|---:|
| DOM ready | 70 ms |
| Load event | 80 ms |
| First contentful paint | 104 ms |
| Largest contentful paint in initial observation | 104 ms |
| Cumulative layout shift in initial observation | 0 |
| GIF requests before interaction | 0 |
| Observed network transfer | 99,915 bytes |

Some images were already cached. This is not a cold-load or real-device benchmark. Local latency and a desktop CPU do not represent mobile networks. Load-event timing excludes lazy images and on-demand GIFs; paint measures are the better indication of visible initial content. A universal complete load in a few milliseconds is not achievable.

The localhost-only `?audit=1` option loads a separate diagnostic chunk and reports through a hidden `#local-audit` output and the console. Ordinary visits never load that chunk. The initial observation window is 1.2 seconds after load; it is not a full-session field measurement.

## Verification log

- Production build, TypeScript checks, required content fields, unique game IDs, HTTPS links and local asset references pass.
- All seven original GIFs are animated (52–84 frames); initial HTML contains no GIF image source.
- At 320px and 390px requested viewport widths, document width does not overflow; phone cards remain a single readable column.
- Explicit preview play/stop tested in browser; stopping removes the animated image.
- Social URLs match the public profile.
- Final tablet/desktop checks passed: two columns at 768px, three at 1440px, no document overflow or broken images. Browser vertical scrollbars reduce reported content width by about 15px.
- Keyboard regression passed: loaded Spell Bind preview stays visible after Tab moves focus to its title; Escape removes the animated image.
- Hero steam alignment was visually checked. Reduced-motion handling was inspected in source; the live preference was not emulated.
- Phase 3 critic: 8/10, no blocking defects.
## About and decorative artefacts — 2026-09-12

Implemented locally after the game gallery. The user's two supplied paragraphs are preserved verbatim in `site.json`; the 8-year experience statement is user-supplied. Circular portrait derivatives come from `inspiration/Profile Pic.jpg`, cropped mechanically and optimized without generative alteration.

- Combined compressed code/HTML: 90,264 bytes (120,000-byte budget), including optional audit and tween chunks.
- Eight unique transparent decorations: 104,176 bytes total, reused in 13 placements. Budget: 200,000 bytes.
- Profile 560px derivative: 29,856 bytes (65,000-byte budget); responsive 280px candidate also supplied.
- Initial prerendered HTML has zero decorative URLs/images/preloads. One shared queue waits for `window.load`, yields to idle time, and waits for each image load/decode before advancing. Asset errors are skipped.
- At 320/390/768px, nonessential decorations are hidden and skipped in the queue; only one subtle edge branch is fetched. All eight unique assets are fetched at 1440px.
- Production browser checks at 320/390/768/1440: no overflow, broken new images, runtime errors, or decoration/content intersections (including transformed image bounds). Measured CLS was 0 in each local unthrottled test.
- Blocking-script test confirms no early decoration requests. Request timings confirm serial delivery after load. Aborted ring requests do not block later About assets. Reduced motion has zero transition duration and no translation. About reveal persists after scrolling away and starts unrevealed on a fresh top-of-page visit. Keyboard About navigation and forward tab to socials passed.
- Evidence: `artifacts/about/qa.json`, responsive screenshots, `scripts/about-qa.cjs`. Type checking, prerender, content/media validation and existing budgets pass. The local pnpm shim failed to resolve tsc, so the same existing build stages were run directly with Node; no dependency changes.

These are local desktop-browser observations, not cold-network or real-phone benchmarks. Local preview remains at http://127.0.0.1:4174/ . No publication performed for this working preview.
