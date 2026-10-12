const {chromium}=require('playwright');
(async()=>{
  const b=await chromium.launch(); const ctx=await b.newContext({viewport:{width:1100,height:900},deviceScaleFactor:2}); const p=await ctx.newPage();
  const errs=[]; p.on('pageerror',e=>errs.push(e.message)); p.on('console',m=>{if(m.type()==='error'&&!m.text().includes('ERR_TUNNEL'))errs.push(m.text())});
  await p.goto('file://'+process.argv[2]); await p.waitForTimeout(400);
  const info=await p.evaluate(()=>{
    const T=__t; T.newRun(); T.run.floor=+(new URLSearchParams(location.search).get('f')||1); T.beginFloor(null); T.run.ess=6000;
    T.run.wards.push('censer','coil','lance'); T.forceUI();
    const place=(it,near)=>{T.setSel(it); let best=null,bd=1e9; for(let r=0;r<T.ROWS;r++)for(let c=0;c<T.COLS;c++){if(T.placeProblem(it,c,r))continue; const d=Math.hypot(c+.5-T.F.lx,r+.5-T.F.ly)+Math.random()*.6; if(d<bd){bd=d;best=[c,r];}} if(best){T.tryPlace(best[0],best[1]); return T.F.towers[T.F.towers.length-1];}};
    for(const ty of ['candle','candle','effigy','coil','lance','tithe','trap','trap','salt','salt','harpoon','chime','candle']) place({kind:'ward',type:ty});
    T.setSel(null);
    // upgrade some capstones to exercise them
    for(const t of T.F.towers){ if(t.type==='effigy'){T.buyBranch(t,2);T.buyBranch(t,2);T.buyBranch(t,2);T.buyBranch(t,1);} if(t.type==='coil'){T.buyBranch(t,1);T.buyBranch(t,1);T.buyBranch(t,1);} if(t.type==='lance'){T.buyBranch(t,1);T.buyBranch(t,1);T.buyBranch(t,1);T.buyBranch(t,0);} if(t.type==='trap'){T.buyBranch(t,0);T.buyBranch(t,0);T.buyBranch(t,0);T.buyBranch(t,2);} if(t.type==='tithe'){T.buyBranch(t,0);T.buyBranch(t,1);} }
    T.setP(false); T.callWave();
    return T.F.towers.map(t=>t.type).join(',');
  });
  console.log('placed',info);
  await p.waitForTimeout(6500);
  await p.screenshot({path:process.argv[3]+'/wards-live.png'});
  const st=await p.evaluate(()=>({ess:__t.run.ess,oil:__t.run.oil,foes:__t.F.foes.length,hexed:__t.F.foes.filter(e=>e.hex).length,kills:__t.run.kills}));
  console.log(JSON.stringify(st),errs.slice(0,4));
  // tray icons close-up
  const tray=await p.$('#tray'); await tray.screenshot({path:process.argv[3]+'/tray.png'});
  await b.close();
})();
