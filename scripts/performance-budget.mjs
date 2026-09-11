import { readFile, readdir, stat } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';

const assets = await readdir('dist/assets');
const records = [];
for (const name of assets) {
  const data = await readFile(`dist/assets/${name}`);
  records.push({name,bytes:data.length,gzipBytes:gzipSync(data).length});
}
const html = await readFile('dist/index.html');
const site = JSON.parse(await readFile('src/content/site.json', 'utf8'));
const codeGzip = records.reduce((sum, asset) => sum + asset.gzipBytes, gzipSync(html).length);
if (codeGzip > 120_000) throw Error(`Compressed code/HTML budget exceeded: ${codeGzip}`);
const heroBytes = (await stat(`public${site.hero.image}`)).size;
if (heroBytes > 40_000) throw Error('Hero exceeds 40 KB budget');
const layers = JSON.parse(await readFile('src/content/hero-layers.json', 'utf8'));
const layerBytes = await Promise.all(layers.map(async layer => ({id:layer.id,large:(await stat(`public${layer.src}`)).size,small:(await stat(`public${layer.small}`)).size})));
const heroLargeTotal = layerBytes.reduce((sum, layer) => sum + layer.large, 0);
const heroSmallTotal = layerBytes.reduce((sum, layer) => sum + layer.small, 0);
const loadingPosterBytes = (await stat(`public${site.hero.imageSmall}`)).size;
if (heroLargeTotal + loadingPosterBytes > 180_000 || heroSmallTotal + loadingPosterBytes > 90_000) throw Error('Hero exceeds 180 KB maximum / 90 KB small-candidate-set budget, including loading poster');
if (/<img[^>]+fetchPriority="high"/i.test(html.toString())) throw Error('Unexpected high-priority image in initial HTML');
if (/<img[^>]+src="[^"]+\.gif"/.test(html.toString())) throw Error('A GIF is included in initial HTML');
const escape = text => text.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#x27;');
if (!html.toString().includes(escape(site.work.title))) throw Error('Prerendered content missing');
console.log(JSON.stringify({codeGzipBytes:codeGzip,largestHeroBytes:heroBytes,heroLargeTotal,heroSmallTotal,loadingPosterBytes,layerBytes,initialGifImages:0,assets:records},null,2));
