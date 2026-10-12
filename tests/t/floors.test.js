const {chromium}=require('playwright');
const file='file://'+process.argv[2], out=process.argv[3], W=+(process.argv[4]||1100), H=+(process.argv[5]||900), only=process.argv[6];
(async()=>{
  const b=await chromium.launch(); const ctx=await b.newContext({viewport:{width:W,height:H},deviceScaleFactor:2}); const p=await ctx.newPage();
  const errs=[]; p.on('pageerror',e=>errs.push(e.message)); p.on('console',m=>{if(m.type()==='error'&&!m.text().includes('ERR_TUNNEL'))errs.push(m.text())});
  await p.goto(file); await p.waitForTimeout(500);
  for(let f=0;f<5;f++){
    if(only&&!only.split(',').includes(String(f)))continue;
    const info=await p.evaluate((f)=>{
      const T=__t; T.newRun(); T.run.floor=f; T.beginFloor(null); T.run.ess=2000; T.setP(false);
      for(const ty of ['candle','harpoon','harpoon','chime','censer','candle','salt']){
        const it={kind:'ward',type:ty}; if(!T.run.wards.includes(ty))T.run.wards.push(ty); T.setSel(it);
        let best=null,bd=1e9; for(let r=0;r<T.ROWS;r++)for(let c=0;c<T.COLS;c++){if(T.placeProblem(it,c,r))continue; const d=Math.hypot(c+.5-T.F.lx,r+.5-T.F.ly)+Math.random()*.8; if(d<bd){bd=d;best=[c,r];}}
        if(best)T.tryPlace(best[0],best[1]);
      }
      T.setSel(null);
      T.F.phase='wave'; T.F.queue=[{t:999,type:'crawler',gate:0}];
      const kinds=['crawler','skitter','gnasher','watcher','shade','wretch','shrieker','elite','stalker','behemoth'];
      let i=0; for(let gi=0;gi<T.F.paths.length;gi++){const P=T.F.paths[gi]; for(let d=1.5;d<P.len-.6;d+=1.7){T.spawnFoe(kinds[(i++)%kinds.length],gi,d);}}
      if(f===3)T.spawnFoe('boss',0,T.F.paths[0].len-6);
      if(f===4)T.spawnFoe('boss2',0,T.F.paths[0].len-4);
      for(const e of T.F.foes)e.hp=e.max=1e9;
      return {foes:T.F.foes.length};
    },f);
    await p.waitForTimeout(1600);
    const stats=await p.evaluate(()=>{let t=performance.now(),n=0; return {sprites:document.querySelectorAll('canvas').length}});
    await p.screenshot({path:`${out}/floor${f+1}.png`});
    console.log('floor',f+1,info,errs.splice(0));
  }
  await b.close();
})();
