# Mostly Harmless portfolio — project context

2026-09-12: Replaced the game card Stop Preview Roman numeral glyph with a filled 12px SVG square that inherits the button color and is independent of fonts. TypeScript check passed. Local change only.

Last updated: 2026-09-12 (about section and decorative artefacts implemented locally)

## About section and deferred decorative artefacts — implemented locally

2026-09-12: Added data-driven Little about me after Gallery, with the user's two exact supplied paragraphs (including user-confirmed 8 years), circular 280/560px optimized profile photo and About navigation. Original photo remains unchanged. Added seven original transparent WebP decorations in 11 placements: coffee rings, sage branches, mug, notebook, controller, keyboard and succulent, plus subtle CSS cream flecks. Metadata lives in src/content/artefacts.json; prompts and sources in docs/about-assets/. On widths up to 1100px, nonessential pieces are hidden and not requested.

One shared serial queue waits for window.load and idle time; each image must load/decode before the next item. No decorative URLs/images/preloads in initial HTML. Per-section one-time reveals persist until refresh; CSS handles motion and reduced motion. Edge lanes keep decorations clear of all content, including rotated cards. Profile is lazy/async with reserved size.

Validation: types, prerender, content/media and budgets pass. Local Chrome at 320/390/768/1440 has no overflow, broken new images, runtime errors, transformed decoration/content intersections or measured CLS. Sequential post-load requests, blocked initial script, image-failure recovery, reveal persistence/reset, reduced motion and About keyboard navigation checked. Evidence: artifacts/about/qa.json and screenshots; scripts/about-qa.cjs. Combined code/HTML gzip 90,264 bytes; decorations 104,176 bytes; 560px profile 29,856 bytes. These are unthrottled local observations, not cold-network measurements. Existing pnpm command resolution failed; equivalent build stages succeeded directly through Node.

Local preview remains running at http://127.0.0.1:4174/#about . No deployment. Next: user review of this working preview; original implementation brief retained in about_me_and_artefacts.md. No additional critic review requested.

## Latest hero update

2026-09-12: flattened the active workstation and Mumbai window into simpler vector-like raster artwork, preserving composition, detailed IDE/Unity screens, warm lighting and green skull. New sources and full prompts: `docs/hero-assets/flat-update.md`. Active WebP layer filenames remain unchanged; loading/error/no-JS posters now use `workstation-flat-320/640.webp`. Workstation has verified alpha; window still uses an adjusted CSS silhouette clip. Whole-scene edge fade, lazy loading and tween entrance remain. Steam now waits for all layers' completed reveals, including animation fallback paths. Build/types/prerender/content/budgets pass (136,000 bytes full layers, 52,004 small, 13,396 loading poster). Visual checks at 320/390/768/1440: no overflow, errors or measured CLS. All eight behavior modes pass, including early-steam assertions, slow window, slow network, reduced motion, lazy offscreen loading and image/tween failures. Reports: `artifacts/hero/flat-final-qa.json` and `behavior-qa.json`. User requested the local server remain running: preview at http://127.0.0.1:4174/ . No deployment.

2026-09-11 follow-up: replaced active window artwork with `window-mumbai-240/480.webp` (source `docs/hero-assets/window-mumbai.png`), showing Mumbai suburb apartments, rooftop water tanks and amber/teal/blue/pink lights. Generated export has a baked checkerboard outside the wood; `.portrait-window img` clips precisely to the outer frame silhouette rather than treating it as true alpha. Added intersecting horizontal/vertical scene masks for a unified edge fade. Fixed stopped steam: imperative visibility classes were lost during React load-state rerenders; viewport/tab visibility now use React state. Brighter staggered wisps stay aligned to the mug and pause offscreen; reduced motion still hides steam. Added a steam regression mode to the existing behavior QA script (optional third argument selects preview URL). Build/types/prerender/assets/performance budgets pass; final `artifacts/hero/mumbai-*` checks at 320/390/768/1440 show loaded assets, no overflow, no runtime errors and zero measured CLS. Steam movement/pause/resume and reduced-motion checks pass. Full layers 150,672 bytes; small layers 53,182 bytes; loading poster 13,536 bytes. Local changes only; no deployment.

Current correction supersedes the six-sprite assembly below: after the user reported mismatched perspective, plant/monitor and chair/desk overlaps, and a missing lamp, generated a single perspective-coherent transparent workstation group. Active composition is two bitmap layers (window + workstation) and separate SVG steam. The workstation includes the seated figure from behind, angled IDE/Unity monitors, lamp, plant, coffee, controller, desk and chair with consistent geometry. Source is `docs/hero-assets/workstation-perspective.png`, delivered at 480/960px WebP. True alpha verified after removing an initially baked checkerboard with built-in image generation. `src/content/hero-layers.json` now lists two independently decoded/revealed layers. The old six-sprite files are retained but not referenced by the page. Latest checks are `artifacts/hero/perspective-*` and `behavior-qa.json`; current total layer bytes 144,390 full-size, 52,128 small, plus 13,536 loading poster. Build/types/prerender/budgets and 320–1440px visual checks pass. No new deployment or independent critic score.

Implemented the approved `hero-portrait-update.md` brief locally: six transparent WebP layers, black headphones with an original glowing green skull, leafy IDE and Unity voxel monitors, lit controller, and an open city-night window. `HeroPortrait.tsx` owns deferred progressive loading and dynamically imported Tween.js reveals. Original poster provides loading/no-JS/error fallback; mobile gives extra space to the person/headphones, Unity screen and controller. Separate steam retained. Source sheet and production notes are in `docs/hero-assets/`.

The single independent critic scored the first implementation **7.7/10**, triggering the user's exactly-one revision pass. Revised progressive loading with visible placeholder, enlarged mobile details, moved controller inward with contact shadow, and corrected performance reporting. Do not claim a second independent score: none was requested or run. See `docs/reviews.md` and `docs/performance.md` for evidence.

## Purpose and maintenance

This is the living project handoff document. Read it before working on this portfolio. Keep it current after meaningful decisions, implementation changes, verification, or blockers. Record what actually exists separately from proposed work. Update the next steps rather than accumulating obsolete plans. Never record secrets here.

The user has now authorized implementation in three phases, with one critic-agent review scored 0–10 per phase. If a score is below 7, revise that phase once before proceeding. Because the request also limits the critic to one run per phase, use an independent implementation recheck after remediation rather than spawning a second critic. Do not loop indefinitely.

All three implementation phases are complete: (1) foundation and hero; (2) game gallery and social links; (3) responsive polish and performance verification. Each received **8/10** from its single critic agent. No phase reruns were needed. The user paused overnight due to usage limits and explicitly resumed on 2026-09-11. Do not repeat completed phases or critic reviews. Local preview servers are stopped after handoff; restart with `pnpm dev` or `pnpm preview` when needed. Private deployment metadata, if needed locally, is stored in the ignored `.env` file.

Latest visual correction: the hero must use **minimal vector-style artwork**, a clearly simplified caricature facing the computer while working, not looking toward the viewer. Steam must be a separate animation, not part of the static image. The rejected realistic/detailed variants are not used. Current responsive WebP assets are under `public/images/`; separate SVG/CSS steam is aligned to the actual mug rim.

Performance approach: prerender readable HTML, minimize initial assets, local images and system fonts, defer all GIF downloads until interaction. A universal complete load in a few milliseconds is not achievable; report measured conditions without guarantees.

## Identity and objective

- Display name: **Mostly Harmless** (confirmed by the user; use this for now).
- Build a personal game developer portfolio with the feeling of visiting a cozy coffee shop or evening workstation.
- Main visitor journey: read a short introduction, browse games, follow game or social links.
- The user wants editable content isolated from implementation. Do not embed career summaries, game descriptions, or other editorial copy in components or core scripts.

## References and source material

- `inspiration/mockup.png`: supplied visual reference, reviewed. Dark espresso background, warm hanging bulbs, workstation hero, cream Polaroid-style game cards, plants, and warm footer lighting. Its game names and prose are placeholders, not verified portfolio content.
- `inspiration/me.webp`: supplied portrait, reviewed. Use for an illustrated likeness, retaining glasses, hairstyle, and facial hair; dress the subject in a simple T-shirt as requested.
- itch.io profile: https://mostlyharmless042.itch.io/
- GitHub linked from the profile: https://github.com/jignesh015
- Verified LinkedIn destination from profile: https://www.linkedin.com/in/jignesh-n-patel/
- Never infer individual project contributions, technologies, employment history, or current years of experience from imagery. Confirm these before adding claims.

## Design requirements

### Overall appearance

- Prominent coffee brown, plant green, and warm yellow light.
- Cozy lofi-study atmosphere, using an original illustration of the user.
- Dark background with subtle wood/paper texture, cream text, soft shadows, and restrained amber glow.
- Proposed palette: espresso `#211813`, walnut `#39291F`, paper `#F1E4CD`, cream `#EAD8B8`, amber `#E7AD58`, leaf green `#64784D`.
- Proposed typography: characterful serif headings and readable sans-serif body text. Exact fonts remain undecided.

### Landing section

- Desktop: three-to-four-line summary on the left; illustrated workstation on the right. Proposed proportions: 45% / 55%.
- Show Mostly Harmless as the identity and provide a link to scroll to the work section.
- Illustration: user seated at a wooden desk with a lit PC, lamp, plant, and steaming coffee mug; simple T-shirt, recognizable face, warm hanging bulbs.
- Blend the illustration into the background instead of placing it inside a visible rectangular frame.
- Implemented: separate lightweight SVG/CSS steam animation; static warm lighting. Minimal vector-style raster hero generated and optimized to 640px/960px WebP.

### Game gallery

- Cards resemble cream Polaroids casually lying on a desk, each with a slightly different rotation.
- Proposed rotation range: approximately -4 to +4 degrees. Keep rotations stable rather than rerandomizing on render.
- Each card contains the same original GIF used on itch.io, a title, a short description, and a game link.
- Proposed interaction: still image at rest; original GIF on hover or keyboard focus; slight lift/straightening on interaction.
- GIFs cannot be treated as ordinary pauseable videos: plan a still-preview swap. Retrieve and verify original files before implementing playback behavior.
- Touch proposal: explicit preview toggle separate from the game link.
- Preserve image aspect ratios and reserve image space to avoid layout shifts. Load animations on demand.

### Footer and responsive behavior

- Social icons link to LinkedIn, GitHub, itch.io, and any additional destinations actually supplied or confirmed.
- Mobile: introduction above illustration, single-column cards, reduced rotation, unobstructed text and touch targets.
- Accessible names for icons, visible keyboard focus, readable contrast, and reduced-motion support.
- The About section was added locally on 2026-09-12; see current implementation notes above.

## Content architecture — user requirement

All user-editable text and content metadata must live in dedicated content files, separate from rendering and behavior. Implemented layout:

- `src/content/site.json`: display name, career summary, navigation labels, section headings, calls to action, footer text, and page metadata.
- `src/content/games.json`: ordered game records with stable ID, title, description, destination URL, original GIF path, still-preview path, image alternative text, and optional verified contribution/technology information.
- `src/content/socials.json`: social labels, destination URLs, and supported icon keys.

Components should consume these files; editing copy, reordering games, or adding a game using the established schema must not require changing core implementation scripts. Keep media paths in content records and binary media in an asset directory. Keep palette and spacing values in centralized CSS design tokens. Do not mix presentation constants with editorial content.

When implementing, add concise content-editing instructions and validate required fields and unique game IDs. Provide useful handling for absent optional fields. Do not add a CMS, database, or admin interface without a need established by the user.

## Initial games inventory

The public profile was inspected on 2026-09-11 and lists seven entries with GIF labels:

1. Tragic Trojan Tragedy
2. Spell Bind
3. FedUp Ex!
4. The Aftermath - Wasteland
5. Demi-Lune
6. VR Cave Escape
7. Jewel Hunter

Verified all seven original animated GIF URLs and game destinations from the public profile DOM. Downloaded original animations unchanged (52–84 frames, roughly 2.1–3.1 MB each); extracted lightweight WebP first frames. JSON retains source URLs. The profile thumbnail endpoints serve single-frame images and must not be used as animation sources. Demi-Lune retains its Cerize Studios destination and studio credit without claiming an individual role. Descriptions are paraphrased from the public profile and remain editable.

## Implemented technical approach

- React + TypeScript with Vite.
- Custom CSS for layout, design tokens, texture, responsive behavior, and lightweight animation.
- Local JSON content files as described above.
- Optimized hero artwork plus original itch.io GIFs and extracted still previews.
- Static site; no backend or database needed for the current scope.
- Static hosting metadata is local-only and must remain outside the repository. Sites plugin is now available at version 0.1.58. Its build wrapper could not resolve the local package-manager command; the equivalent direct `pnpm run build` succeeds.
- Installed React 19.3, TypeScript 5.9, Vite 7.3, pnpm 11.19; exact versions locked in `pnpm-lock.yaml`. Build prerenders React to HTML, then validates content/media. Scripts: `pnpm dev`, `pnpm build`, `pnpm preview`. `verifyDepsBeforeRun: false` avoids environment-specific repeated installs; explicit install and build validation remain available.

## Progress

### Phase 1 — foundation and hero: complete

- Responsive hero, semantic navigation and skip link, JSON content, system fonts, minimal vector-style illustration, separate animated steam, and reduced-motion CSS.
- Prerendered HTML provides content before client JavaScript. Build/type checks passed.
- Critic: **8/10**. No rerun required. Findings: maintain this document, verify bio claims, improve responsive image sizing. Bio platform claims are supported by public itch.io profile; sizing and context were corrected.

### Phase 2 — gallery and socials: complete

- Seven real game cards with stable ID-derived rotations and original GIFs loaded only on hover/focus/explicit preview.
- Preview loading/error state, explicit play/stop, Escape, offscreen and hidden-tab stopping, reduced-motion auto-play opt-out.
- Real LinkedIn, GitHub, itch.io links; decorative hanging lights and footer.
- Verified seven media assets are animated, build passes, browser play/stop returns to zero GIF elements, social URLs match profile.
- Content-editing guide: `CONTENT.md`. Exact image-generation brief: `docs/hero-prompt.md`.
- Critic: **8/10**. Fixed re-starting an already-playing preview (which could hide the image and leave loading text stuck); added inset focus outline. No rerun required. Detailed reviews: `docs/reviews.md`.

### Phase 3 — complete (critic 8/10)

- Implemented readable 16px descriptions, larger preview controls, final CSS refinements, localhost-only opt-in diagnostics, strengthened content/path validation, and build performance budgets. Removed unused single-frame GIF download copies.
- Latest production build after resumption passed: types, prerender, content/media checks, and performance budgets. Code + HTML gzip total 82,479 bytes (includes the optional 691-byte gzip audit chunk); large hero 21,764 bytes. No GIF image in initial HTML.
- Prior local production observation at 390×844: first contentful paint 104 ms, initial observed CLS 0, zero initial GIF requests. Some images were cached; no network/CPU throttling. Do not claim cold-load or real-phone performance. Details: `docs/performance.md`.
- Verified no document overflow at requested 320px/390px widths; phone cards render as a single column. Tablet 768px has two columns; desktop 1440px has three; no document overflow or broken images. Keyboard regression passed: loaded preview stays visible after Tab to the title; Escape removes GIF. Steam alignment visually checked. Reduced-motion behavior is source-reviewed, not live-emulated.
- Single final critic scored **8/10**, with no blocking defects. No rerun required. Nonblocking future cleanup: format/consolidate CSS and extend budgets to posters/small hero.
- No custom domain is selected. Source credentials and deployment identifiers must never be saved in project files or output.

## Working notes and remaining decisions

- Hero original is a vector-style raster, not editable SVG. User requested vector style, not a specific vector file format. Steam is actual animated SVG/CSS.
- About is implemented locally; no contact form, audio, CMS, or speculative features.
- Final copy can be edited in JSON. Do not introduce experience-year claims or individual collaborative project roles without evidence.
- No custom domain selected. No public access has been requested.
- Local preview is not a permanent service; restart it when working again. No further critic runs are required for these completed phases.
- The first realistic and second detailed hero generations were rejected; ship only the third, minimal artwork.


## Publication and future work

- Local-only deployment metadata is stored in `.env`; it is intentionally not tracked.
- All requested implementation is complete. Await user feedback before making further design/content changes. Optional follow-ups: final copy personalization, CSS formatting/consolidation, expanded image budgets, real-device/cold-network testing, custom domain/public release if requested.

## Header and identity update — 2026-09-12
Replaced favicon and header mug with one transparent SVG controller + overlapping espresso mug, sage/coffee/cream palette based on inspiration/favicon_mockup.jfif. Fixed header contracts after 32px scroll (112 to 68px desktop; 92 to 60px mobile), reserved space prevents content shift, anchor offset protects headings, reduced motion respected. Type/build/prerender/content/performance checks pass. Browser checks at 320/390/768/1440 confirm top=0 when scrolled, correct expansion, no overflow or brand/nav overlap. Screenshots artifacts/header-*.png. Live Vite development server: http://127.0.0.1:5174/ with automatic updates. No deployment.
