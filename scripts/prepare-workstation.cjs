// Optimize the perspective-coherent generated cutout without redrawing it.
const sharp = require('sharp');
const fs = require('node:fs/promises');
(async () => {
  const input = process.argv[2];
  if (!input) throw Error('Pass a generated transparent workstation PNG');
  const meta = await sharp(input).metadata();
  const stats = await sharp(input).stats();
  if (!meta.hasAlpha || stats.isOpaque) throw Error('Workstation must have real transparency');
  await fs.mkdir('public/images/hero', { recursive: true });
  for (const width of [480, 960]) {
    await sharp(input).resize({width}).webp({quality:78,alphaQuality:90,effort:4}).toFile(`public/images/hero/workstation-${width}.webp`);
  }
  console.log(JSON.stringify({width:960,height:Math.round(meta.height/meta.width*960),alpha:stats.channels[3]},null,2));
})();
