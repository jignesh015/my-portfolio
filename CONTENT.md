# Editing the portfolio

All editorial content lives in `src/content/`. Edit these JSON files without changing components:

- `site.json`: name, bio, navigation, headings, buttons, accessible labels, footer, and search metadata.
- `games.json`: games in display order. Each record needs a unique `id`, `title`, `description`, `url`, local `gif` and `poster` paths, and image `alt` text. `category` and `credit` are optional. `sourceGif` records the original itch.io asset URL.
- `socials.json`: labels, URLs, and icon keys (`github`, `linkedin`, or `itch`). Remove a record to remove that social link.

Keep JSON valid: double-quoted strings, commas between records, no trailing comma. To add a game, duplicate a record, give it a unique ID, update the content, and add its images under `public/images/games/`. JSON asset paths start with `/images/`, without `public`. The order of records is the display order; card rotations are derived from IDs and stay stable.

Run `pnpm build` after changing content to regenerate the static page. The build checks types, required game fields, IDs, links, and local image files. `pnpm dev` starts a local editing preview. The production build lives in `dist/` and includes readable HTML before JavaScript runs.

Theme colors and layout values are in `src/styles.css`. Content JSON controls words and assets; CSS controls presentation. Do not add secrets to public content.

## Hero artwork

The current asset is a minimal vector-style raster illustration, delivered as responsive WebP images. Steam is a separate animated SVG overlay, not baked into the artwork. When replacing the art, update its paths and alternative text in `site.json`; adjust `.coffee-steam` in CSS if the mug moves.

## Asset provenance

Hero generated using the built-in image-generation tool from the user's portrait. Final brief: minimal flat vector-style caricature, short hair and glasses, simple T-shirt, facing the monitor while working; coffee brown palette, plants, warm bulbs, no static steam. Original rejected realistic and detailed variants are not shipped. Exact final prompt is recorded in `docs/hero-prompt.md`.

Game GIFs are original public itch.io cover assets, preserved byte-for-byte. The optional `scripts/prepare-media.py` utility downloads `sourceGif` URLs and extracts static WebP first frames; it needs Python and Pillow. Content changes do not require running this utility unless adding or replacing media.

## About and decorations

Edit `site.json` → `about` for the eyebrow, heading, two paragraphs, portrait alt text and responsive image paths. The current experience statement was supplied by the user on 2026-09-12; update it manually as needed.

`artefacts.json` stores stable IDs, image paths, work/about section, decorative semantic status, left/right anchor, size, vertical position, opacity, rotation, motion and narrow-screen visibility. `mobile: "hide"` skips loading at widths up to 1100px; `edge` keeps the small edge treatment. CSS further constrains sizes so artwork stays outside content. Botanical work rotations are held neutral to preserve these clear lanes. After changing placements, run the About browser checks as well as the build.

Production images are in `public/images/artefacts/` and `public/images/profile/`. Exact built-in image-generation prompts and asset provenance are in `docs/about-assets/`. No decoration URLs appear in initial HTML; do not add image preloads or CSS backgrounds for them.
