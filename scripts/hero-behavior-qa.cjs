const { chromium } = require('playwright');
const fs = require('node:fs/promises');
(async () => {
  const browser = await chromium.launch({headless:true,channel:'chrome'});
  const results=[];
  for (const mode of ['steam','reduced','no-js','image-failure','tween-failure','below-fold','slow-network','slow-window']) {
    if(process.argv[2] && mode!==process.argv[2]) continue;
    const context=await browser.newContext({viewport:{width:390,height:600},javaScriptEnabled:mode!=='no-js',reducedMotion:mode==='reduced'?'reduce':'no-preference'});
    const page=await context.newPage();
    await page.addInitScript(()=>{
      window.heroTimings={earlySteam:false};
      document.addEventListener('DOMContentLoaded',()=>{
        const watch=new MutationObserver(()=>{
          const nodes=[...document.querySelectorAll('.portrait-layer')];
          if(document.querySelector('.portrait-steam') && (nodes.length!==2 || nodes.some(e=>getComputedStyle(e).opacity!=='1'||getComputedStyle(e).transform!=='none'))) window.heroTimings.earlySteam=true;
          if(nodes.length===2 && document.querySelector('.is-ready') && nodes.every(e=>getComputedStyle(e).opacity==='1')) {
            window.heroTimings.completeReveal ??= performance.now();
          }
        });
        watch.observe(document.documentElement,{subtree:true,attributes:true,childList:true});
      });
    });
    const errors=[]; page.on('pageerror',e=>errors.push(e.message));
    if(mode==='image-failure') await page.route('**/images/hero/workstation-*',route=>route.abort());
    if(mode==='tween-failure') await page.route('**/assets/tween.*',route=>route.abort());
    if(mode==='slow-window') await page.route('**/images/hero/window-*',async route=>{await new Promise(resolve=>setTimeout(resolve,5000));await route.continue();});
    if(mode==='below-fold') await page.addInitScript(()=>document.addEventListener('DOMContentLoaded',()=>{document.querySelector('.hero-art').style.marginTop='1500px';}));
    if(mode==='slow-network') {
      const client=await context.newCDPSession(page);
      await client.send('Network.enable');
      await client.send('Network.setCacheDisabled',{cacheDisabled:true});
      await client.send('Network.emulateNetworkConditions',{offline:false,latency:150,downloadThroughput:200000,uploadThroughput:100000});
      await client.send('Emulation.setCPUThrottlingRate',{rate:4});
    }
    await page.goto(process.argv[3] || 'http://127.0.0.1:4173/');
    await page.waitForTimeout(1000);
    const before=await page.evaluate(()=>performance.getEntriesByType('resource').filter(e=>e.name.includes('/images/hero/')).length);
    await page.locator('.hero-art').scrollIntoViewIfNeeded();
    let progressive=null;
    if(mode==='slow-window') {
      await page.waitForTimeout(1800);
      progressive=await page.evaluate(()=>({core:[...document.querySelectorAll('.portrait-workstation')].some(e=>getComputedStyle(e).opacity==='1'),complete:!!document.querySelector('.is-ready'),steam:!!document.querySelector('.portrait-steam')}));
      if(!progressive.core||progressive.complete) throw Error('Slow window blocked progressive workstation reveal');
      if(progressive.steam) throw Error('Steam appeared before the window settled');
    }
    if(mode==='no-js') await page.locator('.portrait-fallback').waitFor();
    else if(mode==='image-failure') await page.locator('.portrait-fallback').waitFor();
    else await page.locator('.portrait-scene.is-ready').waitFor({timeout:20000});
    await page.waitForTimeout(1500);
    if(mode==='steam') {
      const steam=page.locator('.portrait-steam path').first();
      const first=await steam.evaluate(e=>getComputedStyle(e).transform);
      await page.waitForTimeout(450);
      const second=await steam.evaluate(e=>getComputedStyle(e).transform);
      if(first===second) throw Error('Steam stopped after portrait finished loading');
      await page.locator('#contact').scrollIntoViewIfNeeded();
      await page.waitForTimeout(200);
      if(await steam.evaluate(e=>getComputedStyle(e).animationPlayState)!=='paused') throw Error('Offscreen steam did not pause');
      await page.locator('.hero-art').scrollIntoViewIfNeeded();
      await page.waitForTimeout(200);
      if(await steam.evaluate(e=>getComputedStyle(e).animationPlayState)!=='running') throw Error('Steam did not resume');
    }
    const result=await page.evaluate(()=>({fallback:!!document.querySelector('.portrait-fallback'),layers:[...document.querySelectorAll('.portrait-layer')].map(e=>({opacity:getComputedStyle(e).opacity,transform:getComputedStyle(e).transform})),steamHidden:!document.querySelector('.portrait-steam')||getComputedStyle(document.querySelector('.portrait-steam')).display==='none',heroRequests:performance.getEntriesByType('resource').filter(e=>e.name.includes('/images/hero/')).length,allImages:[...document.querySelectorAll('.hero-art img')].every(e=>e.complete&&e.naturalWidth>0)}));
    if(!result.allImages) throw Error(`${mode}: broken portrait image`);
    if(mode==='below-fold'&&before!==0) throw Error('Offscreen portrait downloaded eagerly');
    if(mode==='reduced'&&(!result.steamHidden||result.layers.some(e=>e.opacity!=='1'||e.transform!=='none'))) throw Error('Reduced motion failed');
    if(['no-js','image-failure'].includes(mode)&&!result.fallback) throw Error('Missing fallback');
    if(result.layers.some(e=>e.opacity!=='1')) throw Error(`${mode}: invisible layer`);
    const timing=await page.evaluate(()=>({...window.heroTimings,paint:performance.getEntriesByType('paint').map(e=>({name:e.name,ms:e.startTime})),images:performance.getEntriesByType('resource').filter(e=>e.name.includes('/images/hero/')||e.name.includes('/images/workstation-')).map(e=>({name:e.name.split('/').pop(),bytes:e.encodedBodySize,start:e.startTime,end:e.responseEnd}))}));
    if(timing.earlySteam) throw Error(`${mode}: steam appeared before the portrait settled`);
    if(!['no-js','image-failure','reduced'].includes(mode)&&result.steamHidden) throw Error(`${mode}: steam missing after reveal`);
    if(errors.length) throw Error(`${mode}: ${errors.join('; ')}`);
    results.push({mode,before,errors,progressive,timing,...result});
    await context.close();
  }
  await fs.writeFile('artifacts/hero/'+(process.argv[2]||'behavior')+'-qa.json',JSON.stringify(results,null,2));
  console.log(JSON.stringify(results,null,2));
  await browser.close();
})();
