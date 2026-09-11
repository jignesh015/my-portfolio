# Layered workstation artwork

## Current perspective correction

Active artwork is `workstation-perspective.png`: a coordinated foreground group rendered from behind the seated man, so the desktop, two monitors, keyboard, chair and desk legs share a consistent projection. The lamp is restored with warm desktop light; plant sits left, controller rests on desktop, and green skull headphones remain visible. Keep these physically connected objects grouped when positioning/scaling. The separate city window and SVG coffee steam preserve layering and independent animation. `src/content/hero-layers.json` lists the two active bitmap layers.

Built-in imagegen produced the corrective artwork and removed a baked checkerboard. Final PNG has real alpha (range 0–255), verified before integration. `scripts/prepare-workstation.cjs` preserves alpha and optimizes 480/960px WebP; source dimensions 1254 × 1254. The website delivers only optimized exports. The early sprite sheet and exports below are retained as historical authoring material and are no longer used by the portrait.

Corrective generation brief: preserve the user's identity, brown short-sleeve shirt and black headphones with neon-green original skull. View from behind and slightly left of the seated man, facing two angled monitors: leafy split-pane IDE and Unity top-down voxel game. Draw all furniture/equipment together in one perspective, hands resting naturally at keyboard/mouse, stands on the desktop, chair and casters clear of desk legs. Restore the articulated black desk lamp with warm light, keep a smaller plant far left and clear of the screen, cream coffee at front-left with no baked steam, lit wireless controller resting on desk. No window/wall/floor/background; true transparent alpha. Final extraction prompt removed all checkerboard pixels while preserving the workstation geometry and details.

Loading remains progressive at group level: the window and workstation download and reveal independently after viewport entry/idle scheduling. A dimmed old poster stays until the workstation decodes. Delaying the window does not block the workstation. The earlier text below describes the superseded six-object attempt.

Created with the built-in image-generation tool on 2026-09-11. Source sheet: `workstation-sheet.png` (1536 × 1024, real alpha). Delivered assets: `public/images/hero/`, six objects in 240px and 480px WebP variants. The sheet is authoring material, not downloaded by visitors.

## Generation brief

One transparent 3 × 2 sprite sheet with generous padding and six isolated objects, warm minimalist flat-vector styling, restrained two-tone shading, consistent perspective. Top row: an open walnut window with navy night city skyline and warm lit windows; wooden desk with keyboard/mouse, cream coffee mug on the left and small plant at far left; seated man in chair facing left with brown skin, short black hair, rectangular glasses, moustache and beard, brown shirt, black over-ear headphones with a glowing neon-green original skull emblem, arms extended to type. Bottom row: a widescreen monitor and stand with dark leafy Rider-style split code panes and green/orange/teal syntax; a widescreen monitor and stand with Unity editor panels around a stylized top-down voxel forest/island game; a black wireless controller viewed from above at three-quarter angle with a green status light. No labels, no scene background, no photorealism. Identity, IDE, existing workstation style, and night-window mood informed by the supplied inspiration images.

## Assembly

`scripts/prepare-hero.cjs` mechanically crops the six sprites, preserves alpha and encodes WebP. It uses the bundled Sharp package supplied through NODE_PATH. Top-row feet extend past the nominal sheet midpoint, so the measured split is y=560. It does not redraw objects. Layout and media paths live in `src/content/hero-layers.json`; coordinates are percentages of the square scene. Actual sprite dimensions preserve aspect ratios.

Objects requiring tight registration stay together: headphones with the person, each screen with its frame/stand, mug/plant/keyboard with the desk. These groups animate independently as six layers. The controller has a static perspective adjustment and contact shadow inside its tweened wrapper. The page background remains visible between all silhouettes; the window contains its own opaque sky.

Mobile enlarges the person/headphones, Unity monitor and controller while keeping both monitors visible. The illustrated green glow stays steady; no continuous pulse was added. Coffee steam is a separate SVG, anchored to the new mug rim and paused offscreen or in a hidden tab, disabled for reduced motion.

## Loading

After viewport entry and idle scheduling, a dimmed 13.5 KB existing poster provides loading continuity while the window, desk and person download. Each decoded layer reveals independently. The monitors are requested after these three core layers decode; the controller follows the monitors. A slow accessory therefore cannot block the visible core. The temporary poster disappears when the core is decoded. No image or tween preload is emitted in normal initial HTML.

The earlier 21.8 KB workstation remains the no-JavaScript/error fallback. An image error or 12-second incomplete-load timeout selects it. Tween import failure or a 1.5-second stall reveals decoded artwork immediately. Reduced-motion users receive immediate static layers and no tween download. Cleanup stops active tweens, frames, timers and observers.
