const {chromium}=require('playwright');
(async()=>{
  const b=await chromium.launch(); const p=await b.newPage();
  const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.goto('file://'+process.argv[2]); await p.waitForTimeout(300);
  const r=await p.evaluate(()=>{
    const T=__t; T.newRun(); T.run.floor=2; T.beginFloor(null); T.run.ess=8000; T.run.oil=T.run.oilMax=999;
    T.run.wards.push('censer','coil','lance');
    const place=(it)=>{T.setSel(it); let best=null,bd=1e9; for(let r=0;r<T.ROWS;r++)for(let c=0;c<T.COLS;c++){if(T.placeProblem(it,c,r))continue; const d=Math.hypot(c+.5-T.F.lx,r+.5-T.F.ly)+Math.random()*.6; if(d<bd){bd=d;best=[c,r];}} if(best){T.tryPlace(best[0],best[1]); return T.F.towers[T.F.towers.length-1];}};
    for(const ty of ['candle','candle','candle','effigy','coil','lance','tithe','trap','trap','salt','salt','candle','effigy']) place({kind:'ward',type:ty});
    T.setSel(null);
    const up=(t,bi,n)=>{for(let i=0;i<n;i++)T.buyBranch(t,bi);};
    const ef=T.F.towers.filter(t=>t.type==='effigy');
    up(ef[0],0,3); up(ef[0],1,2); up(ef[1],2,3); up(ef[1],1,3);
    for(const t of T.F.towers){ if(t.type==='coil'){up(t,1,3);up(t,0,2);} if(t.type==='lance'){up(t,1,3);up(t,0,3);} if(t.type==='trap'){up(t,0,3);up(t,2,3);} if(t.type==='tithe'){up(t,0,3);up(t,1,2);} }
    const ess0=T.run.ess;
    const C={snaps:0,arcs:0,lances:0,hexedMax:0,bleed:0,pinned:0,flensed:0,echo:0,stunned:0,unmasked:0};
    T.setP(false);
    for(let w=0;w<3;w++){
      T.callWave();
      let t=0; while(T.F.phase==='wave'&&t<300){
        T.update(1/30); t+=1/30;
        for(const tw of T.F.towers){if(tw.type==='trap'&&tw.snap>.38)C.snaps++;}
        for(const f of T.F.fx){if(f.t===0||f.t<1/30+1e-9){ if(f.k==='arc')C.arcs++; if(f.k==='hexlink')C.echo++; }}
        for(const s of T.F.shots){if(s.k==='lance'&&!s.counted){s.counted=1;C.lances++;}}
        let hx=0; for(const e of T.F.foes){if(e.hex)hx++; if(e.bleedT>3.95)C.bleed++; if(e.pinT>1.45)C.pinned++; if(e.flenseT>4.95)C.flensed++; if(e.hex&&e.hex.unmask)C.unmasked++;}
        C.hexedMax=Math.max(C.hexedMax,hx);
      }
    }
    C.kills=T.run.kills; C.essGained=T.run.ess-ess0; C.oilLost=999-T.run.oil; C.phase=T.F.phase; C.wave=T.F.wave;
    return C;
  });
  console.log(JSON.stringify(r),errs.slice(0,3));
  await b.close();
})();
