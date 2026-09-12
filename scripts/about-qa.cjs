const { chromium } = require('playwright');
const fs = require('node:fs/promises');
const assert = require('node:assert/strict');
const base = process.argv[2] || 'http://127.0.0.1:4174/';
(async () => {
  const browser = await chromium.launch({headless:true,channel:'chrome'});
  await fs.mkdir('artifacts/about',{recursive:true});
  const reports=[];
  for (const width of [320,390,768,1440]) {
    const page = await browser.newPage({viewport:{width,height:1000}});
    const errors=[]; page.on('pageerror',e=>errors.push(e.message));
    await page.addInitScript(()=>{
      window.qa={cls:0,load:0};
      window.addEventListener('load',()=>window.qa.load=performance.now());
      new PerformanceObserver(list=>list.getEntries().forEach(e=>{if(!e.hadRecentInput)window.qa.cls+=e.value})).observe({type:'layout-shift',buffered:true});
    });
    await page.goto(base);
    await page.waitForTimeout(2200);
    await page.locator('#about').scrollIntoViewIfNeeded();
    await page.waitForTimeout(1300);
    await page.screenshot({path:`artifacts/about/about-${width}.png`});
    const result=await page.evaluate(()=>{
      const rect=e=>e.getBoundingClientRect();
      const intersects=(a,b)=>a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top;
      const overlaps=[];
      document.querySelectorAll('.artefact').forEach(a=>{
        if(!a.getBoundingClientRect().width||getComputedStyle(a).display==='none')return;
        a.closest('section').querySelectorAll('.game-card,.section-heading,.gallery-hint,.about-copy,.about-portrait').forEach(c=>{if(intersects(rect(a.querySelector('img')),rect(c)))overlaps.push(a.className+' / '+c.className)});
      });
      return {overflow:document.documentElement.scrollWidth>innerWidth,cls:window.qa.cls,overlaps,broken:[...document.querySelectorAll('#about img,.artefact img')].filter(e=>!e.complete||!e.naturalWidth).length,
        requests:performance.getEntriesByType('resource').filter(e=>e.name.includes('/images/artefacts/')).map(e=>({name:e.name.split('/').pop(),start:e.startTime,end:e.responseEnd})),load:window.qa.load,
        headings:[...document.querySelectorAll('h1,h2')].map(e=>e.textContent),decorationsAccessible:[...document.querySelectorAll('.artefact img')].some(e=>e.alt||!e.closest('[aria-hidden="true"]'))};
    });
    assert.equal(result.overflow,false);assert.equal(result.broken,0);assert.equal(result.decorationsAccessible,false);assert.deepEqual(result.overlaps,[]);assert.deepEqual(errors,[]);
    assert(result.requests.every(r=>r.start>=result.load));
    for(let i=1;i<result.requests.length;i++)assert(result.requests[i].start>=result.requests[i-1].end);
    await page.locator('#home').scrollIntoViewIfNeeded();
    assert(await page.locator('#about .artefact.is-revealed').count()>0);
    await page.reload();
    await page.evaluate(()=>window.scrollTo(0,0));
    await page.waitForTimeout(100);
    reports.push({width,errors,...result});
    await page.close();
  }
  // Hold a blocking script: no decorative requests before the page load event.
  const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
  let release; const gate=new Promise(r=>release=r); let count=0;
  await page.route('**/assets/index-*.js',async route=>{await gate;await route.continue()});
  page.on('request',r=>{if(r.url().includes('/images/artefacts/'))count++});
  const navigation=page.goto(base);await page.waitForTimeout(400);assert.equal(count,0);release();await navigation;
  await page.waitForTimeout(2200);
  assert.equal(await page.locator('#about .artefact.is-revealed').count(),0);
  await page.locator('#about').scrollIntoViewIfNeeded();await page.waitForTimeout(100);
  const motion=await page.locator('#about .artefact').first().evaluate(e=>({duration:getComputedStyle(e).transitionDuration,transform:getComputedStyle(e).transform}));
  assert.equal(motion.duration,'0s');
  await page.close();
  const failure=await browser.newPage({viewport:{width:1440,height:1000}});
  await failure.route('**/images/artefacts/coffee-ring.webp',route=>route.abort());
  await failure.goto(base);await failure.waitForTimeout(2300);
  assert(await failure.locator('#about .artefact img').count()>0);
  await failure.close();
  await fs.writeFile('artifacts/about/qa.json',JSON.stringify({reports,blockingLoad:true,failureRecovery:true,reducedMotion:motion},null,2));
  console.log(JSON.stringify({layouts:reports.map(r=>({width:r.width,cls:r.cls,requests:r.requests.length})),blockingLoad:true,failureRecovery:true,reducedMotion:motion}));
  await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});

