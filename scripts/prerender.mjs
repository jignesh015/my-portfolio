import { readFile, writeFile } from 'node:fs/promises';
import { render } from '../.prerender/prerender.js';
const site = JSON.parse(await readFile('src/content/site.json', 'utf8'));
const escape = value => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
let html = await readFile('dist/index.html', 'utf8');
html = html.replace('<!--app-html-->', render()).replace('<!--page-meta-->', `<title>${escape(site.meta.title)}</title><meta name="description" content="${escape(site.meta.description)}">`);
await writeFile('dist/index.html', html);
console.log('Static HTML generated: content is readable before JavaScript loads.');
