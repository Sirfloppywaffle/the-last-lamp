// Heralds (#31): The Last Keeper walks one wave of the second floor. It is named in the break before, survives a save,
// drains 8 oil at the lamp without ending the run, snuffs the candles it passes, and pays a relic when slain.
const {chromium}=require('playwright');
const fails=[]; const ok=(c,m,d)=>{if(!c)fails.push(m+(d!==undefined?' '+JSON.stringify(d):''));};
(async()=>{
  const b=await chromium.launch(); const p=await b.newPage({viewport:{width:412,height:860}});
  const errs=[]; p.on('pageerror',e=>errs.push(String(e)));
  await p.goto('file://'+process.argv[2]); await p.waitForTimeout(300);
  const r=await p.evaluate(()=>{const T=__t, out={};
    T.tutSet({off:true,seen:[],walk:'done'});
    const fresh=(fl)=>{T.newRun('lamplighter',0); T.run.floor=fl; T.beginFloor(null); T.setP(false); T.run.ess=9999; T.run.oil=T.run.oilMax=40;};
    /* only the second floor sends one, and never in the first wave or a boss or elite wave */
    fresh(0); out.f1=T.run.draw.herald;
    const slots=new Set(); for(let i=0;i<40;i++){fresh(1); const h=T.run.draw.herald; slots.add(h&&h.type+'@'+h.wave);}
    out.slots=[...slots];
    /* it walks in exactly one wave */
    fresh(1); const hd=T.run.draw.herald, n=T.F.def.waves.length; let found=[];
    for(let w=0;w<n;w++){T.F.wave=w; T.startWave(); if(T.F.queue.some(q=>q.type==='lastkeeper'))found.push(w); T.F.queue=[]; T.F.foes=[]; T.F.phase='build';}
    out.found=found; out.hd=hd;
    /* named in the break before its wave */
    fresh(1); T.F.wave=T.run.draw.herald.wave; T.F.phase='build'; T.renderPreview(); out.preview=document.getElementById('preview').textContent;
    out.tip=T.TIPS.herald.when();
    /* it survives a save and resume */
    fresh(1); const before=JSON.stringify(T.run.draw.herald); T.checkpoint();
    T.resumeFrom({run:JSON.parse(JSON.stringify(T.run)),wave:T.F.wave,towers:[],lamp:{br:T.F.lamp.br,invested:0}});
    out.resumed=JSON.stringify(T.run.draw.herald)===before;
    /* it snuffs the candles it passes, and what they held up goes dark */
    fresh(1); T.startWave(); T.F.queue=[];
    const P=T.F.paths[0];
    let spot=null, sd=0; for(let d=2;d<P.len-2&&!spot;d+=.25){const q=T.posAt(P,d); for(let rr=0;rr<T.ROWS&&!spot;rr++)for(let c=0;c<T.COLS&&!spot;c++){if(T.placeProblem({kind:'ward',type:'candle'},c,rr))continue; if(Math.hypot(c+.5-q[0],rr+.5-q[1])<=1.1){spot=[c,rr]; sd=d;}}}
    T.setSel({kind:'ward',type:'candle'}); T.tryPlace(spot[0],spot[1]); const cdl=T.F.towers[T.F.towers.length-1]; T.update(.01);
    const k=T.spawnFoe('lastkeeper',0,sd); k.spawnT=0; k.stunT=1e6; k.hp=k.max=1e6; T.update(.05);
    out.snuff={t:+(cdl.snuffT||0).toFixed(1),dark:cdl.dark,fx:T.F.fx.some(f=>f.k==='snuff'),ownLight:T.F.L.some(L=>L.temp&&Math.hypot(L.x-k.x,L.y-k.y)<.5)};
    k.dead=true; T.F.foes=[]; for(let i=0;i<220;i++)T.update(.05); out.relit=!cdl.dark&&!(cdl.snuffT>0);
    /* at the lamp it drains 8 oil and the run goes on */
    fresh(1); T.startWave(); T.F.queue=[]; const k2=T.spawnFoe('lastkeeper',0,T.F.paths[0].len-.05); k2.spawnT=0; const o0=T.run.oil;
    for(let i=0;i<40&&!k2.dead;i++)T.update(.05);
    out.arrive={drained:o0-T.run.oil,phase:T.F.phase,alive:T.run.oil>0};
    /* slain, it pays a relic */
    fresh(1); T.startWave(); T.F.queue=[]; const rel0=T.run.relics.length, k3=T.spawnFoe('lastkeeper',0,3); k3.spawnT=0; T.hurt(k3,1e7);
    out.relic=T.run.relics.length-rel0; out.heralds=T.run.heralds;
    T.render();
    out.lore=!!document.body&&true;
    return out;});
  console.log(JSON.stringify(r));
  ok(r.f1===null,'the first floor sends no Herald',r.f1);
  ok(r.slots.length>1&&r.slots.every(s=>/^lastkeeper@[1-9]/.test(s)),'the second floor draws the Last Keeper into a later wave, at random',r.slots);
  ok(r.found.length===1&&r.found[0]===r.hd.wave,'it walks in exactly one wave',[r.found,r.hd]);
  ok(/Herald · The Last Keeper/.test(r.preview),'the break before names it on the strip',r.preview);
  ok(r.tip===true,'the Herald tip fires in that break');
  ok(r.resumed,'its wave survives a save and resume');
  ok(r.snuff.t>9&&r.snuff.dark&&r.snuff.fx&&r.snuff.ownLight,'it snuffs a candle it passes, and carries its own lamp',r.snuff);
  ok(r.relit,'the candle comes back when the snuff wears off');
  ok(r.arrive.drained===8&&r.arrive.alive,'at the lamp it drains 8 oil and the run goes on',r.arrive);
  ok(r.relic===1&&r.heralds===1,'slain, it pays a relic',[r.relic,r.heralds]);
  ok(!errs.length,'no page errors',errs);
  await b.close();
  if(fails.length){console.log('FAIL\n- '+fails.join('\n- ')); process.exit(1);} console.log('herald ok');
})();
