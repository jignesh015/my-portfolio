# Hero portrait update plan

## Implementation outcome — 2026-09-11

Latest user-requested perspective correction: replace the six independent foreground sprites with one coordinated workstation cutout so the monitors face the seated figure and desk/chair geometry stays natural. The desk lamp is restored and plant placement cleared. Foreground objects stay together deliberately; the window and coffee steam remain independent. The earlier six-layer implementation/review below is retained as history, not the active composition. Both active bitmap layers are deferred, decoded and revealed independently. Details: `docs/hero-assets/README.md`.

Implemented as six independently loaded transparent WebP object groups extracted from a coordinated sprite sheet. Small parts remain registered within their parent object: headphone/emblem with person, screen/frame with each monitor, keyboard/mug/plant with desk. Tween.js is dynamically imported; viewport entry and idle scheduling precede image loading. The revised loader reveals decoded core layers progressively, then requests monitors and controller, with a dimmed existing poster while core layers arrive. Mobile enlarges the person, game monitor and controller. Steady neon-green skull glow and separate coffee steam are included.

Critic score: 7.7/10 on the initial result. Completed exactly one revision pass addressing progressive loading, mobile detail visibility, controller contact/position and performance reporting. The older poster remains the no-JavaScript/error fallback. Final implementation details and asset generation brief are in `docs/hero-assets/README.md`; review and verification records are in `docs/reviews.md` and `docs/performance.md`. The sections below preserve the original plan.

## Goal

Replace the current single workstation illustration with a layered, transparent hero scene that keeps the page’s espresso background visible while making the portrait feel more personal: headphones, a dual-monitor game-development setup, a lit controller, and a night city window.

## Current implementation constraints

- The hero is rendered in `src/App.tsx` as one responsive `workstation-640/960.webp` image.
- The current image is marked `fetchPriority="high"`, so the new implementation must deliberately change the loading strategy.
- There is no tween/animation dependency today.
- The build currently enforces a 40 KB hero-image budget and a 120 KB gzipped HTML/code budget; the layered asset budget will need to be measured and likely revised explicitly rather than silently exceeded.
- The existing coffee steam SVG and caption should remain compatible with the new layered composition.

## Art direction

Use the existing `inspiration/me.webp` only as an identity reference and `inspiration/ide.png` as the IDE reference. Use `inspiration/lofi-girl.jpg` for the warm, intimate night-window mood, lighting, and skyline depth—not as a copied composition.

The final scene should retain the portfolio’s current restrained flat-vector / warm-dark palette and generous negative space around the copy. The person remains the visual anchor on the right, facing the monitors, with the desk crossing the lower portion of the art area.

Required visual elements:

1. Transparent person/torso layer matching the existing caricature style and identity cues.
2. Black Skullcandy-style over-ear headphones, worn by the person, with an original skull-style emblem (not the exact trademark logo) on the earcup. The emblem should glow neon green with a restrained bloom that fits the scene’s dark, warm palette.
3. Desk and keyboard/mouse layer.
4. Two separate monitor frames and stands, with controlled perspective and consistent glow.
5. IDE screen layer inspired by `inspiration/ide.png`: dark editor chrome, split panes, syntax-colored code, and no legible personal/project secrets.
6. Unity screen layer showing a small top-down voxel game with stylized terrain, readable as a game-development preview at hero size.
7. Wireless game controller on the desk with a subtle emissive/status-light detail.
8. Open window layer behind the subject with a dark blue/purple city skyline, sparse lit windows, and soft atmospheric glow.
9. Optional small lighting accents (monitor glow, desk lamp/window spill, headphone skull emblem glow) kept separate if they need independent animation.

## Asset format and composition decision

Prefer separate transparent WebP/AVIF assets for the person, desk, monitors, screens, controller, window, and lighting accents. This gives each element independent positioning, responsive hiding, loading, and animation control.

Do not use one large sprite sheet as the primary delivery format: it couples unrelated elements into the same download and makes responsive cropping and accessibility harder. A compact sprite sheet may be added later only for tiny decorative states (for example, controller light variants) if profiling proves it worthwhile.

Keep each layer in a shared artboard coordinate system, with documented anchor points and z-order. Export responsive widths (at least desktop and mobile variants where the layer contains meaningful detail), compress aggressively, and preserve alpha. The hero should have a CSS background/fallback rather than baked-in background pixels.

## Component and data structure

Create a dedicated `HeroPortrait` component rather than expanding the existing `App` markup. Define a typed layer manifest containing:

- stable layer id and asset URL(s)
- desktop/mobile positioning and scale
- width/height or aspect-ratio metadata
- z-index
- alt/decorative status
- optional animation delay and duration

Use semantic alt text only on the portrait’s meaningful accessible layer/group. Mark purely decorative layers `aria-hidden` and avoid announcing every visual detail separately.

## Loading strategy

1. Render the hero shell and copy immediately with a lightweight CSS fallback/background.
2. Mount the layered assets through a small `HeroPortrait` loader after the first paint using `requestIdleCallback` with a `setTimeout` fallback, while also using `decoding="async"`.
3. Use `IntersectionObserver` with a modest root margin for pages where the hero is initially below the fold or restored from navigation; do not rely on native `loading="lazy"` alone for a visible LCP illustration.
4. Load the assets in visual priority order: window/background glow, person/desk silhouette, monitor frames, then screen content, controller accents, and the headphone skull glow.
5. Avoid eager preloading of every layer and remove/unmount nonessential animation assets if the hero leaves the viewport.
6. Provide a no-JavaScript/static fallback using the current illustration or a simplified composed poster so the hero remains useful during loading and SSR/prerendering.

## Animation behavior

Add a lightweight tween dependency only if the current bundle/performance check supports it; prefer a tree-shakeable, small tween package over importing a full animation suite. Encapsulate animation setup and cleanup in `HeroPortrait`.

On successful load, animate each layer from `opacity: 0` and `transform: translateY(6px) scale(.985)` to its authored position/scale. Stagger background layers first, then person/desk, then monitor screens, controller glow, and finally the headphone skull emblem. Use transform/opacity for entrance motion and a restrained opacity/box-shadow or filter-bloom pulse for the neon-green emblem. Avoid perpetual movement except for a very subtle controller LED, screen glow, or headphone emblem breathing effect if it adds value.

Respect `prefers-reduced-motion: reduce`: reveal layers without tweening, disable glow loops, and keep the existing steam behavior consistent with the site’s current reduced-motion rule. Cancel animation handles and observers on unmount.

## Responsive behavior

- Desktop: preserve the current two-column hero balance; place the window behind the subject and keep the dual monitors readable without colliding with the copy.
- Tablet: reduce screen-detail layers and tighten the art bounds while keeping both monitors identifiable.
- Mobile: use a deliberately simplified crop/stack. Keep the face/headphones and one readable monitor as priorities; hide or substantially simplify the second screen/window details if space demands it.
- Ensure the composition never creates horizontal overflow, and keep caption/steam anchors tied to the composed art bounds rather than the old image’s pixel percentages.

## Verification checklist

- Visual QA at desktop, tablet, and mobile widths; confirm transparent edges, z-order, monitor alignment, controller placement, and window depth.
- Confirm the IDE and Unity screens are stylistically recognizable but remain decorative and contain no misleading interaction affordances.
- Confirm all image requests are asynchronous, deferred, and not present as eager high-priority hero downloads.
- Test slow-network behavior, JS-disabled/prerendered output, cache misses, and viewport entry/exit.
- Test keyboard navigation, screen-reader output, focus visibility, and reduced-motion behavior.
- Run type-check, build, prerender validation, and performance-budget checks; record final per-layer bytes and total hero transfer cost in `docs/performance.md`.
- Compare LCP and first meaningful paint against the existing single-image hero before accepting the change.

## Implementation order

1. Inventory the existing hero and establish the coordinate/z-index contract.
2. Produce and optimize the transparent layer assets from the approved art direction.
3. Add the typed manifest and `HeroPortrait` component with a static fallback.
4. Replace the current hero image markup and update the content alt/caption copy if needed.
5. Add deferred loading and tweened reveal with reduced-motion handling.
6. Tune responsive layout and asset visibility rules.
7. Update validation/performance budgets and documentation.
8. Build, prerender, inspect the rendered hero at target sizes, and iterate on any layout or performance regressions.

## Open decisions before implementation

- Approve separate transparent assets as the default delivery format, with a sprite sheet reserved for tiny repeated states.
- Select the tween library after checking its production bundle impact; keep the option open for a small custom adapter if the dependency cost is disproportionate.
- Decide whether the existing workstation illustration remains as the JS-disabled fallback or is replaced by a newly composed static fallback poster.
- Approve the original skull-style headphone emblem: neon green, visibly glowing, and intentionally different from the exact Skullcandy trademark logo.
