const {chromium,devices}=require('playwright');
const file='file://'+process.argv[2], out=process.argv[3];
const sizes=[[1040,940],[940,1040],[884,1032],[1032,884],[1700,1000],[2208,1768]];
(async()=>{
  const b=await chromium.launch();
  for(const [w,h] of sizes){
    const ctx=await b.newContext({viewport:{width:w,height:h},deviceScaleFactor:2,hasTouch:true,isMobile:true});
    const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
    await p.goto(file); await p.waitForTimeout(400);
    await p.evaluate(()=>{const T=__t; T.newRun('whaler');}); /* the Lamplighter casts Kindle, not Flare */ await p.waitForTimeout(700);
    const snap=()=>p.evaluate(()=>{const r=document.querySelector('#board').getBoundingClientRect(); const sc=[]; document.querySelectorAll('*').forEach(el=>{if(el.scrollLeft||el.scrollTop)sc.push((el.id||el.className||el.tagName)+':'+el.scrollLeft+','+el.scrollTop);}); const se=document.scrollingElement; return {x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height),scrolled:sc,doc:[se.scrollWidth,se.clientWidth,window.scrollX], vw:innerWidth};});
    const before=await snap();
    await p.tap('.rite[data-r=flare]'); await p.waitForTimeout(600);
    const after=await snap();
    await p.screenshot({path:`${out}/flare-${w}x${h}.png`});
    console.log(w+'x'+h, JSON.stringify(before), '->', JSON.stringify(after), errs);
    if(JSON.stringify(before)!==JSON.stringify(after)){console.log('FAIL flare moved the board at '+w+'x'+h); process.exitCode=1;}
    await ctx.close();
  }
  await b.close();
})();
