# About asset production

Seven separate original illustrations were generated with the built-in image-generation tool. Exact prompts are in `prompts.json`; original source paths and delivered dimensions/bytes are in `assets.json`. All selected sources have real alpha. Soft halos on the mug, controller and keyboard remain unobtrusive at background opacity. A discarded mug extraction edit is not used.

Production derivatives were trimmed and resized mechanically with Sharp, preserving alpha, then encoded as WebP (quality 78, alpha quality 85). Delivered assets live in `public/images/artefacts/`, with separate objects reused only for rings and foliage. The subtle cream flecks are now CSS background details rather than an image asset.

The profile is the supplied `inspiration/Profile Pic.jpg`, with EXIF orientation applied, cropped to left 460/top 130/1330-square source pixels and resized to 280/560px WebP quality 82. The original photo remains untouched. Circular masking is CSS; the photo was not generated or retouched.
