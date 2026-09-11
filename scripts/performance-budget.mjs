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
if (/<img[^>]+src="[^"]+\.gif"/.test(html.toString())) throw Error('A GIF is included in initial HTML');
const escape = text => text.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#x27;');
if (!html.toString().includes(escape(site.work.title))) throw Error('Prerendered content missing');
console.log(JSON.stringify({codeGzipBytes:codeGzip,largestHeroBytes:heroBytes,initialGifImages:0,assets:records},null,2));
