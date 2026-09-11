import { readFile, access } from 'node:fs/promises';
import { resolve, sep } from 'node:path';
const site = JSON.parse(await readFile('src/content/site.json', 'utf8'));
const games = JSON.parse(await readFile('src/content/games.json', 'utf8'));
const socials = JSON.parse(await readFile('src/content/socials.json', 'utf8'));
const ids = new Set();
const requiredSite = ['name','role','navigationLabel','skipLink','meta.title','meta.description','hero.eyebrow','hero.greeting','hero.headline','hero.summary','hero.cta','hero.image','hero.imageSmall','hero.imageAlt','work.eyebrow','work.title','work.description','work.preview','work.stopPreview','work.previewLoading','work.previewError','work.gameLink','work.indexLabel','footer.title','footer.description','footer.backToTop'];
for (const path of requiredSite) {
  const value = path.split('.').reduce((part, key) => part?.[key], site);
  if (typeof value !== 'string' || !value.trim()) throw Error(`Missing site text: ${path}`);
}
const publicRoot = resolve('public') + sep;
async function localAsset(path) {
  if (!path.startsWith('/')) throw Error(`Asset must start with /: ${path}`);
  const absolute = resolve('public', path.slice(1));
  if (!absolute.startsWith(publicRoot)) throw Error(`Asset outside public folder: ${path}`);
  await access(absolute);
}
function httpsUrl(value) {
  const url = new URL(value);
  if (url.protocol !== 'https:' || url.username || url.password) throw Error(`Invalid public URL: ${value}`);
}
for (const link of site.navigation) if (!link.label?.trim() || !['#home','#work','#contact'].includes(link.href)) throw Error('Invalid navigation entry');
for (const game of games) {
  for (const key of ['id', 'title', 'description', 'url', 'gif', 'poster', 'alt']) if (!game[key]?.trim()) throw Error(`Missing game field ${key}`);
  if (ids.has(game.id)) throw Error(`Duplicate game ID: ${game.id}`);
  ids.add(game.id);
  httpsUrl(game.url);
  await localAsset(game.gif); await localAsset(game.poster);
}
const socialKeys = new Set();
for (const social of socials) {
  if (!social.label?.trim() || !['github','linkedin','itch'].includes(social.icon) || socialKeys.has(social.icon)) throw Error('Invalid or duplicate social record');
  socialKeys.add(social.icon); httpsUrl(social.url);
}
await localAsset(site.hero.image); await localAsset(site.hero.imageSmall);
console.log(`Content and assets validated: ${games.length} games, ${socials.length} socials.`);
