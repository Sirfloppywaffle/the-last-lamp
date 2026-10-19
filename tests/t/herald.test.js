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
    const slots=new Set(), types=new Set(); for(let i=0;i<60;i++){fresh(1); const h=T.run.draw.herald; slots.add(h&&h.wave); types.add(h&&h.type);}
    out.slots=[...slots]; out.types=[...types].sort();
    fresh(4); out.f5=T.run.draw.herald;
    /* a descent never meets the same one twice */
    fresh(1); T.run.heraldsMet=['lastkeeper','tithetaker']; T.run.floor=2; T.run.draw=null; T.beginFloor(null); out.third=T.run.draw.herald.type;
    /* it walks in exactly one wave */
    fresh(1); const hd=T.run.draw.herald, n=T.F.def.waves.length; let found=[];
    for(let w=0;w<n;w++){T.F.wave=w; T.startWave(); if(T.F.queue.some(q=>q.type===hd.type))found.push(w); T.F.queue=[]; T.F.foes=[]; T.F.phase='build';}
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
    k.dead=true; T.F.foes=[]; for(let i=0;i<140;i++)T.update(.05); out.relit=!cdl.dark&&!(cdl.snuffT>0);
    /* the Bellringer lights nothing, so it stills her Tuning Forks instead */
    T.newRun('bellringer',0); T.run.floor=1; T.beginFloor(null); T.setP(false); T.run.ess=9999; T.startWave(); T.F.queue=[];
    const P2=T.F.paths[0]; let fs=null, fd=0; for(let d=2;d<P2.len-2&&!fs;d+=.25){const q=T.posAt(P2,d); for(let rr=0;rr<T.ROWS&&!fs;rr++)for(let c=0;c<T.COLS&&!fs;c++){if(T.placeProblem({kind:'ward',type:'fork'},c,rr))continue; if(Math.hypot(c+.5-q[0],rr+.5-q[1])<=1.1){fs=[c,rr]; fd=d;}}}
    T.setSel({kind:'ward',type:'fork'}); T.tryPlace(fs[0],fs[1]); const fk=T.F.towers[T.F.towers.length-1]; T.update(.01); const fkWas=fk.dark;
    const k4=T.spawnFoe('lastkeeper',0,fd); k4.spawnT=0; k4.stunT=1e6; k4.hp=k4.max=1e6; T.update(.05);
    out.fork={before:fkWas,stilled:fk.snuffT>0,dark:fk.dark};
    /* at the lamp it drains 8 oil and the run goes on */
    fresh(1); T.startWave(); T.F.queue=[]; const k2=T.spawnFoe('lastkeeper',0,T.F.paths[0].len-.05); k2.spawnT=0; const o0=T.run.oil;
    for(let i=0;i<40&&!k2.dead;i++)T.update(.05);
    out.arrive={drained:o0-T.run.oil,phase:T.F.phase,alive:T.run.oil>0};
    /* slain, it pays a relic */
    fresh(1); T.startWave(); T.F.queue=[]; const rel0=T.run.relics.length, k3=T.spawnFoe('lastkeeper',0,3); k3.spawnT=0; T.hurt(k3,1e7);
    out.relic=T.run.relics.length-rel0; out.heralds=T.run.heralds;
    /* the Tithe-taker takes 3 essence a second into its sack; slain, it pays it all back and half again */
    fresh(1); T.startWave(); T.F.queue=[]; T.run.ess=100; const ttd=T.spawnFoe('tithetaker',0,.5); ttd.spawnT=0; ttd.stunT=1e6; ttd.hp=ttd.max=1e6;
    for(let i=0;i<41;i++)T.update(.05); out.titheDark=100-T.run.ess; ttd.dead=true;
    /* the rift is chosen once, marked in the break before, and is where it climbs out */
    fresh(1); const hh=T.run.draw.herald; T.F.wave=hh.wave; T.F.phase='build'; const g0=T.heraldGate(hh); T.startWave(); const q=T.F.queue.find(x=>x.type===hh.type);
    out.gate={marked:g0!==undefined,same:!!q&&q.gate===g0}; T.F.queue=[]; T.F.foes=[];
    /* a boss's rift is marked in the break before its wave, on every map, and is where it climbs out; nothing is marked before */
    out.bossRift=[];
    for(const [fl,mv] of [[3,0],[3,1],[4,0],[4,1]]){
      T.setMapV(mv); fresh(fl); const last=T.F.def.waves.length-1; T.F.wave=last-1; T.F.phase='build';
      const early=T.riftDue().filter(x=>x.boss).length;
      T.F.wave=last; const due=T.riftDue().filter(x=>x.boss); T.startWave();
      const mid=T.riftDue().filter(x=>x.boss), bq=T.F.queue.find(x=>T.F.def.waves[last].some(g=>g[0]===x.type&&x.type.indexOf('boss')===0));
      out.bossRift.push({fl,mv,early,n:due.length,same:!!bq&&mid.length===1&&mid[0].gate===due[0].gate&&bq.gate===due[0].gate});
      T.F.queue=[]; T.F.foes=[]; out.bossGone=T.riftDue().filter(x=>x.boss).length;
    }
    T.setMapV(0);
    fresh(1); T.startWave(); T.F.queue=[]; T.run.ess=100; const tt=T.spawnFoe('tithetaker',0,T.F.paths[0].len-1.5); tt.spawnT=0; tt.stunT=1e6; tt.hp=tt.max=1e6;
    for(let i=0;i<41;i++)T.update(.05); out.tithe={ess:T.run.ess,sack:tt.sack};
    const e0=T.run.ess; T.hurt(tt,1e7); out.titheBack=T.run.ess-e0;
    /* the Bellfather tolls: wards near it reel and do nothing */
    fresh(1); T.startWave(); T.F.queue=[];
    let hs=null; const PB=T.F.paths[0]; for(let d=3;d<PB.len-3&&!hs;d+=.25){const q=T.posAt(PB,d); for(let rr=0;rr<T.ROWS&&!hs;rr++)for(let c=0;c<T.COLS&&!hs;c++)if(!T.placeProblem({kind:'ward',type:'harpoon'},c,rr)&&Math.hypot(c+.5-q[0],rr+.5-q[1])<=1.2)hs=[c,rr,d];}
    T.setSel({kind:'ward',type:'harpoon'}); T.tryPlace(hs[0],hs[1]); const hb=T.F.towers[T.F.towers.length-1];
    const bf=T.spawnFoe('bellfather',0,hs[2]); bf.spawnT=0; bf.stunT=0; bf.hp=bf.max=1e6; bf.bellT=0; T.update(.05);
    out.daze={t:+(hb.dazeT||0).toFixed(1)}; bf.stunT=1e6;
    const shots0=T.F.shots.length; for(let i=0;i<20;i++)T.update(.05); out.daze.shotsWhileDazed=T.F.shots.length-shots0;
    for(let i=0;i<30;i++)T.update(.05); out.daze.firesAfter=hb.cd<1;
    /* for the Bellringer, its toll is a ring: it hears what it touches */
    T.newRun('bellringer',0); T.run.floor=1; T.beginFloor(null); T.setP(false); T.startWave(); T.F.queue=[];
    const bf2=T.spawnFoe('bellfather',0,4); bf2.spawnT=0; bf2.hp=bf2.max=1e6; bf2.bellT=0; T.update(.05); out.bellRing=T.F.tolls.length>0;
    /* no Herald can be held forever: re-stunned every 0.9s (a fast harpoon with Undertow), it still breaks free and walks */
    fresh(1); T.startWave(); T.F.queue=[]; const hz=T.spawnFoe('tithetaker',0,2); hz.spawnT=0; hz.hp=hz.max=1e6;
    let free=0, cd=0, sawFx=false; const hd0=hz.d;
    for(let i=0;i<400;i++){cd-=.05; if(cd<=0){hz.stunT=Math.max(hz.stunT,1); cd=.9;} T.update(.05); if(hz.freeT>0)free++; if(T.F.fx.some(f=>f.txt==='breaks free'))sawFx=true;}
    out.held={moved:+(hz.d-hd0).toFixed(2),freed:free>0,fx:sawFx};
    /* a plain creature can still be held */
    const sk=T.spawnFoe('skitter',0,2); sk.spawnT=0; sk.hp=sk.max=1e6; const sd0=sk.d; cd=0;
    for(let i=0;i<200;i++){cd-=.05; if(cd<=0){sk.stunT=Math.max(sk.stunT,1); cd=.9;} T.update(.05);}
    out.skHeld=+(sk.d-sd0).toFixed(2);
    T.render();
    out.lore=!!document.body&&true;
    return out;});
  console.log(JSON.stringify(r));
  ok(r.f1===null,'the first floor sends no Herald',r.f1);
  ok(r.slots.length>1&&r.slots.every(w=>w>=1),'a Herald is drawn into a later wave, at random',r.slots);
  ok(r.types.join()==='bellfather,lastkeeper,tithetaker','any of the three can come',r.types);
  ok(r.f5===null,'the last floor sends none',r.f5);
  ok(r.third==='bellfather','a descent never meets the same Herald twice',r.third);
  ok(r.found.length===1&&r.found[0]===r.hd.wave,'it walks in exactly one wave',[r.found,r.hd]);
  ok(/Herald · The (Last Keeper|Tithe-taker|Bellfather)/.test(r.preview),'the break before names it on the strip',r.preview);
  ok(r.tip===true,'the Herald tip fires in that break');
  ok(r.resumed,'its wave survives a save and resume');
  ok(Math.abs(r.snuff.t-6.5)<.1&&r.snuff.dark&&r.snuff.fx&&r.snuff.ownLight,'it snuffs a candle it passes, and carries its own lamp',r.snuff);
  ok(!r.fork.before&&r.fork.stilled&&r.fork.dark,'for the Bellringer it stills the Tuning Forks it passes',r.fork);
  ok(r.relit,'the candle comes back when the snuff wears off');
  ok(r.arrive.drained===8&&r.arrive.alive,'at the lamp it drains 8 oil and the run goes on',r.arrive);
  ok(r.relic===1&&r.heralds===1,'slain, it pays a relic',[r.relic,r.heralds]);
  ok(r.tithe.ess===96&&r.tithe.sack===4,'the Tithe-taker takes 2 essence a second into its sack while it walks in your light',r.tithe);
  ok(r.titheDark===0,'in the dark it takes nothing',r.titheDark);
  ok(r.gate.marked&&r.gate.same,'the rift it will come from is marked, and that is where it climbs out',r.gate);
  ok(r.bossRift.every(x=>x.early===0&&x.n===1&&x.same)&&r.bossGone===0,'a boss’s rift is marked only in the break before its wave, on every map, and is where it climbs out',r.bossRift);
  ok(r.titheBack===6,'slain, its sack pays back half again',r.titheBack);
  ok(r.daze.t>1.9&&r.daze.shotsWhileDazed===0,'the Bellfather’s toll leaves the wards near it reeling, doing nothing',r.daze);
  ok(r.bellRing,'for the Bellringer, its toll is a ring that hears');
  ok(r.held.freed&&r.held.fx&&r.held.moved>1.5,'no Herald can be held forever: it breaks free and walks on',r.held);
  ok(r.skHeld===0,'an ordinary creature can still be held',r.skHeld);
  ok(!errs.length,'no page errors',errs);
  await b.close();
  if(fails.length){console.log('FAIL\n- '+fails.join('\n- ')); process.exit(1);} console.log('herald ok');
})();
