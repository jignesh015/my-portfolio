// Local visual/performance QA. Bundled Playwright is supplied via NODE_PATH.
const { chromium } = require('playwright');
const fs = require('node:fs/promises');
(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  const base = process.argv[2] || 'http://127.0.0.1:4173/';
  const label = process.argv[3] || 'hero';
  await fs.mkdir('artifacts/hero', { recursive: true });
  const reports = [];
  for (const width of [1440, 768, 390, 320]) {
    const context = await browser.newContext({ viewport: { width, height: 1000 } });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.addInitScript(() => {
      window.metrics = { cls: 0, lcp: 0 };
      new PerformanceObserver(list => list.getEntries().forEach(e => { if (!e.hadRecentInput) window.metrics.cls += e.value; })).observe({ type: 'layout-shift', buffered: true });
      new PerformanceObserver(list => list.getEntries().forEach(e => window.metrics.lcp = e.startTime)).observe({ type: 'largest-contentful-paint', buffered: true });
    });
    await page.goto(base);
    await page.waitForTimeout(2000);
    const initial = await page.evaluate(() => ({ ...window.metrics, paint: performance.getEntriesByType('paint').map(e => ({name:e.name,ms:e.startTime})), heroRequests: performance.getEntriesByType('resource').filter(e=>e.name.includes('/images/hero/')).length }));
    await page.locator('.hero-art').scrollIntoViewIfNeeded();
    await page.waitForTimeout(1700);
    await page.screenshot({ path: `artifacts/hero/${label}-${width}.png`, fullPage: false });
    await page.locator('.hero-art').screenshot({ path: `artifacts/hero/${label}-art-${width}.png` });
    reports.push({ width, initial, errors, ...await page.evaluate(() => ({ overflow:document.documentElement.scrollWidth > innerWidth, ready:!!document.querySelector('.portrait-scene.is-ready'), layers:[...document.querySelectorAll('.portrait-layer img')].map(e=>({loaded:e.complete&&e.naturalWidth>0,src:e.currentSrc,opacity:getComputedStyle(e.parentElement).opacity})), fallback:!!document.querySelector('.portrait-fallback'), metrics:window.metrics })) });
    await context.close();
  }
  await fs.writeFile(`artifacts/hero/${label}-qa.json`, JSON.stringify(reports,null,2));
  console.log(JSON.stringify(reports,null,2));
  await browser.close();
})();
