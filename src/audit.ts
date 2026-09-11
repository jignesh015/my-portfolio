// Read-only diagnostics for local production verification; not a visitor-facing feature.
let cls = 0;
let lcp = 0;
new PerformanceObserver(list => {
  for (const item of list.getEntries()) {
    const entry = item as PerformanceEntry & { hadRecentInput: boolean; value: number };
    if (!entry.hadRecentInput) cls += entry.value;
  }
}).observe({ type: 'layout-shift', buffered: true });
new PerformanceObserver(list => {
  for (const item of list.getEntries()) lcp = item.startTime;
}).observe({ type: 'largest-contentful-paint', buffered: true });

function report() {
  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
  const result = {
    viewport: `${innerWidth}x${innerHeight}`,
    domReadyMs: Math.round(navigation.domContentLoadedEventEnd),
    loadMs: Math.round(navigation.loadEventEnd),
    firstContentfulPaintMs: Math.round(performance.getEntriesByName('first-contentful-paint')[0]?.startTime ?? 0),
    largestContentfulPaintMs: Math.round(lcp),
    cumulativeLayoutShift: Number(cls.toFixed(4)),
    transferBytes: resources.reduce((sum, entry) => sum + entry.transferSize, navigation.transferSize),
    gifRequests: resources.filter(entry => /\.gif(?:\?|$)/.test(entry.name)).length,
    resourceCount: resources.length,
    overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    resources: resources.map(entry => ({ path: new URL(entry.name).pathname, transferred: entry.transferSize }))
  };
  const output = document.createElement('output');
  output.id = 'local-audit'; output.hidden = true; output.textContent = JSON.stringify(result);
  document.body.append(output);
  console.info('PORTFOLIO_AUDIT', JSON.stringify(result));
}
if (document.readyState === 'complete') setTimeout(report, 1200);
else window.addEventListener('load', () => setTimeout(report, 1200), { once: true });
export {};
