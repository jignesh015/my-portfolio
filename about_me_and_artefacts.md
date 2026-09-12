# About section and background artefacts — implementation plan

## Objective

Extend the portfolio’s work area with subtle, flat vector-like raster decorations, then add a new **Little about me** section immediately after the project cards. The additions should retain the existing cozy espresso-and-cream visual language, remain accessible and responsive, and have no material effect on the initial page load.

## Source material and visual direction

- Use `inspiration/mockup.png` as the composition reference: restrained coffee rings and small flecks around the work cards; botanical edge treatments; and a low-contrast desk-object collage around the about copy.
- Create original, small, transparent raster WebP assets rather than copying any supplied mockup artwork. They should look like simple flat illustrations, not photorealistic images or SVG requirements.
- Keep foliage to a sage-green range compatible with the existing `--leaf` palette. Keep coffee rings and cream stains subtle enough to remain background texture.
- Use `inspiration/Profile Pic.jpg` only to create a cropped, web-optimized profile image for the circular portrait.

## Content and component structure

1. Add an editable `about` object to `src/content/site.json` containing the eyebrow, heading, supplied two-paragraph description, portrait alt text, and profile-image paths. Add an About navigation item only if it fits the final navigation balance; otherwise retain the existing concise navigation.
2. Create `src/content/artefacts.json` for decorative asset metadata. Each record should include a stable ID, asset path(s), section (`work` or `about`), semantic status (decorative), intended anchor/size, and mobile visibility rule. This keeps copy and decorative placement data out of React components.
3. Add an `About` component to render the section after `Gallery`, including a semantic heading, circular portrait, and copy from `site.json`.
4. Add a reusable `DeferredArtefacts` component. It will render no image requests during initial page rendering, then introduce artefacts only after the load event and browser idle time (with a timeout fallback).

## Assets to produce

- Work section: 2–3 translucent coffee-cup rings/stains, 2–3 edge-anchored sage branches, succulents, or creepers, and a small scattering of cream paper-like dots/stains.
- About section: one top-down coffee mug, rustic notebook, game controller, gaming keyboard, succulent, plus a few cream stains.
- Export each decorative illustration at its actual display scale (with at most a 2x variant where useful), using transparent WebP and modest dimensions. Reuse an asset only when visually appropriate; do not build one large collage image.
- Create a square/circular-crop-ready WebP profile derivative sized for its rendered display, retaining the original photo separately in `inspiration/`.
- Store generated production assets beneath `public/images/artefacts/` and `public/images/profile/`; document asset prompts/source notes in `docs/` if generation is used.

## Layout and motion

1. Make the work and about sections positioned, overflow-contained decorative canvases. Render artefacts behind readable content and cards using explicit stacking layers; decorations must not overlap a project card, portrait, text, links, or controls.
2. On wide screens, place botanicals at outer edges and coffee rings/flecks in genuine whitespace. On smaller screens, hide or reposition nonessential pieces so there is no horizontal overflow or cramped content.
3. About should have a balanced portrait-and-copy layout on desktop and a centered/stacked layout on mobile. The circular image gets meaningful alternative text; every object and stain is `aria-hidden`/empty-alt decorative content.
4. Use an `IntersectionObserver` per section to add a one-time revealed class when that section first enters the viewport. Plants slide/fade in from their nearest horizontal edge; small stains can fade in. Once revealed, keep the class for the current page lifetime; a page refresh naturally resets it.
5. Respect `prefers-reduced-motion`: reveal decorations without movement (or suppress nonessential movement) while preserving the static design.

## Deferred-loading behavior

1. The initial HTML and hydration path must not include decorative `<img>` elements or preload hints.
2. Start the decoration queue only after `window.load`, then `requestIdleCallback` when available (with a bounded `setTimeout` fallback).
3. Load and mount exactly one asset at a time. Wait for its image decode/load completion (and handle errors) before advancing to the next queue item; yielding between items prevents a burst of decode/network work.
4. Keep the profile image separate from decorative priority: it is meaningful section content, use `loading="lazy"` and `decoding="async"`, and reserve its dimensions to avoid layout shift.
5. Avoid decorative animation libraries and unnecessary JavaScript. CSS handles the reveal transition after the lightweight observer sets state/classes.

## Validation and acceptance criteria

- Run the existing type, prerender, content/media validation, and performance-budget build.
- Extend validation for the required `about` content fields, profile paths, unique artefact IDs, valid section names, and referenced artefact files.
- Confirm initial prerendered HTML contains no artefact image URLs and browser initial requests exclude all decorative assets.
- In a browser, verify decorations begin only after full page load, enter serially rather than together, and failures do not block later queue entries.
- Verify one-time reveal behavior, refreshed-page reset, reduced-motion behavior, and that all decorative images remain noninteractive.
- Check 320px, 390px, 768px, and 1440px layouts for no overflow, card overlap, broken assets, or layout shifts. Verify keyboard navigation and heading hierarchy for the new About section.
- Measure and record the updated asset budget and observed behavior in `docs/performance.md`/`agent.md` after implementation; do not claim cold-load results without testing them.

## Implementation order

1. Define content schemas and validate them.
2. Generate/optimize the profile and decorative assets.
3. Build deferred serial asset loading and one-time reveal behavior.
4. Add the About component and responsive styling; place work decorations.
5. Test functional, accessibility, responsive, and performance requirements; update handoff documentation with actual results.
