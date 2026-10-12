const {chromium}=require('playwright');
(async()=>{
  const b=await chromium.launch(); const ctx=await b.newContext({viewport:{width:1100,height:900},deviceScaleFactor:2}); const p=await ctx.newPage();
  const errs=[]; p.on('pageerror',e=>errs.push(e.message)); p.on('console',m=>{if(m.type()==='error'&&!m.text().includes('ERR_TUNNEL'))errs.push(m.text())});
  await p.goto('file://'+process.argv[2]); await p.waitForTimeout(400);
  for(const f of [0,3,4]){
    await p.evaluate((f)=>{
      const T=__t; T.newRun(); T.run.floor=f; T.beginFloor(null); T.run.ess=5000;
      T.run.wards=['candle','harpoon','salt','chime','censer'];
      for(const k of ['gnasher','watcher','wretch','shrieker','elite','keeper'])T.run.roster[k]=1;
      T.forceUI();
      const place=(it)=>{T.setSel(it); let best=null,bd=1e9; for(let r=0;r<T.ROWS;r++)for(let c=0;c<T.COLS;c++){if(T.placeProblem(it,c,r))continue; const d=Math.hypot(c+.5-T.F.lx,r+.5-T.F.ly)+Math.random(); if(d<bd){bd=d;best=[c,r];}} if(best)T.tryPlace(best[0],best[1]);};
      for(const ty of ['candle','candle','harpoon','chime','censer','harpoon','salt','salt','candle'])place({kind:'ward',type:ty});
      for(const k of ['gnasher','watcher','wretch','shrieker','elite','keeper'])place({kind:'horror',type:k});
      T.setSel(null); T.setP(false); T.callWave();
    },f);
    await p.click('#speedBtn');
    await p.waitForTimeout(9000);
    await p.screenshot({path:process.argv[3]+'/live'+(f+1)+'.png'});
    const st=await p.evaluate(()=>({phase:__t.F.phase,foes:__t.F.foes.length,towers:__t.F.towers.length,wave:__t.F.wave,oil:__t.run.oil}));
    console.log('floor',f+1,JSON.stringify(st),errs.splice(0).slice(0,3));
    await p.click('#speedBtn');
  }
  await b.close();
})();
