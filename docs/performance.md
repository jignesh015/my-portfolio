# Performance and verification

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
