const {chromium}=require('playwright');
(async()=>{
  const b=await chromium.launch(); const ctx=await b.newContext({viewport:{width:1100,height:900},deviceScaleFactor:1}); const p=await ctx.newPage();
  const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.goto('file://'+process.argv[2]); await p.waitForTimeout(400);
  await p.evaluate(()=>{const T=__t; T.newRun('occultist'); T.run.floor=1; T.beginFloor(null); T.run.ess=3000; T.run.roster.keeper=1; T.run.oil=T.run.oilMax=999;
    for(const [ty,kind] of [['candle','ward'],['candle','ward'],['keeper','horror']]){const it={kind,type:ty}; T.setSel(it); let best=null,bd=1e9; for(let r=0;r<T.ROWS;r++)for(let c=0;c<T.COLS;c++){if(T.placeProblem(it,c,r))continue; const d=Math.hypot(c+.5-T.F.lx,r+.5-T.F.ly); if(d<bd){bd=d;best=[c,r];}} if(best)T.tryPlace(best[0],best[1]);}
    T.setSel(null); T.setP(false); T.callWave();});
  await p.evaluate(()=>{const T=__t; for(const k of [1.5,2.2,2.9]){const e=T.spawnFoe('crawler',0,T.F.paths[0].len-k); e.hp=e.max=1e6;} T.setP(false);});
  // wait until the keeper has fired
  for(let i=0;i<60;i++){await p.waitForTimeout(150); if(await p.evaluate(()=>__t.F.fx.some(f=>f.k==='kbeam'&&f.t<.1)))break;}
  await p.screenshot({path:process.argv[3]+'/kbeam.png'});
  // a creature emerging from its rift
  const s=await p.evaluate(()=>{const T=__t; const P=T.F.paths[0]; const e=T.spawnFoe('gnasher',0,.1); return [e.d, +(Math.min(Math.max(e.d/.3,0),1)).toFixed(2)];});
  console.log('beam captured, emerging scale',s,errs);
  await b.close();
})();
