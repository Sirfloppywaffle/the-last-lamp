// The Bone Chime is found, not given: only the Bellringer starts with it. Its ring spreads thin, and a boss it stuns goes deaf to chimes.
const {chromium}=require('playwright');
const fails=[]; const ok=(c,m,d)=>{if(!c)fails.push(m+(d!==undefined?' '+JSON.stringify(d):''));};
(async()=>{
  const b=await chromium.launch(); const p=await b.newPage({viewport:{width:412,height:860}});
  const errs=[]; p.on('pageerror',e=>errs.push(String(e)));
  await p.goto('file://'+process.argv[2]); await p.waitForTimeout(300);

  const r=await p.evaluate(()=>{const T=__t, out={};
    /* who starts with it */
    out.starts={}; for(const k of Object.keys(T.KITS)){T.newRun(k,0); out.starts[k]=T.run.wards.includes('chime');}
    /* the stair offers it to everyone else: gifts, merchants and the pack draw from it */
    T.newRun('lamplighter',0); T.run.floor=1; T.beginFloor(null); T.setP(true);
    let seen=0; for(let i=0;i<400;i++){T.F.phase='cleared'; T.openDraft(0,0); if(T.draft.opts.some(o=>o.kind==='ward'&&o.key==='chime'))seen++; T.F.draft=null; T.F.phase='build';}
    out.gifted=seen;
    /* the ring spreads thin: four nearest full, the rest half */
    window.devNoDark=true;
    T.newRun('lamplighter',0); T.run.floor=1; T.run.wards.push('chime'); T.beginFloor(null); T.setP(true);
    const P=T.F.paths[0]; let spot=null;
    for(let r=0;r<T.ROWS&&!spot;r++)for(let c=0;c<T.COLS&&!spot;c++){if(T.placeProblem({kind:'ward',type:'chime'},c,r)!=='')continue; for(let d=2;d<P.len-2;d+=.25){const q=T.posAt(P,d); if(Math.hypot(q[0]-c-.5,q[1]-r-.5)<1.01){spot=[c,r,d];break;}}}
    T.setSel({kind:'ward',type:'chime'}); T.tryPlace(spot[0],spot[1]); T.setSel(null);
    const ch=T.F.towers[T.F.towers.length-1], st=T.wstat(ch);
    T.F.phase='wave'; T.F.queue=[];
    const es=[]; for(let i=0;i<6;i++){const e=T.spawnFoe('gnasher',0,spot[2]); e.hp=e.max=1e6; e.spawnT=0; es.push(e);}
    T.update(.001);
    /* lay them out at known distances from the chime */
    es.forEach((e,i)=>{e.x=ch.x+.2+i*.25; e.y=ch.y;});
    T.chimePulse(ch,st);
    out.hits=es.map(e=>Math.round(1e6-e.hp)); out.dmg=st.dmg; out.stunned=es.every(e=>e.stunT>0);
    es.forEach(e=>{e.dead=true;});
    /* a boss: stunned once, then deaf for 4 seconds */
    const bo=T.spawnFoe('boss',0,spot[2]); bo.hp=bo.max=1e9; bo.spawnT=0; T.update(.001); bo.x=ch.x+.3; bo.y=ch.y;
    T.chimePulse(ch,st); out.boss1={stun:+bo.stunT.toFixed(2),deaf:bo.deafT};
    bo.stunT=0; const hp=bo.hp; T.chimePulse(ch,st); out.boss2={stun:bo.stunT,hit:bo.hp<hp,grey:T.F.fx.some(f=>f.col==='120,116,108')};
    const d0=bo.deafT; T.update(.5); out.deafTick=+(d0-bo.deafT).toFixed(2);
    bo.deafT=0; bo.stunT=0; bo.x=ch.x+.3; bo.y=ch.y; T.chimePulse(ch,st); out.boss3=bo.stunT>0;
    out.tip=!!T.TIPS.chimedeaf&&T.TIPS.chimedeaf.when();
    window.devNoDark=false;
    /* the Grimoire says where it is found */
    out.cost=T.wdef('chime').cost;
    return out;});
  console.log(JSON.stringify(r));
  ok(r.starts.bellringer===true,'the Bellringer starts with the Bone Chime',r.starts);
  ok(['lamplighter','whaler','occultist','galvanist'].every(k=>r.starts[k]===false),'no other kit starts with it',r.starts);
  ok(r.gifted>20,'the gift between floors can offer the Bone Chime',r.gifted);
  ok(r.hits.slice(0,4).every(h=>h===r.dmg)&&r.hits.slice(4).every(h=>h===Math.round(r.dmg/2)),'the four nearest take the full strike, the rest half',[r.hits,r.dmg]);
  ok(r.stunned,'every creature in the ring is stunned');
  ok(r.boss1.stun>0&&r.boss1.deaf===4,'a boss is stunned once and goes deaf for 4 seconds',r.boss1);
  ok(r.boss2.stun===0&&r.boss2.hit&&r.boss2.grey,'deaf, it is struck but not stunned, with a grey ring',r.boss2);
  ok(Math.abs(r.deafTick-.5)<.05,'deafness wears off over time',r.deafTick);
  ok(r.boss3,'once it hears again, the chime stuns it');
  ok(r.tip===true,'the Deaf to the Chime tip fires while a boss is deaf',r.tip);
  ok(r.cost===55,'the chime still costs 55',r.cost);
  ok(!errs.length,'no page errors',errs);
  await b.close();
  if(fails.length){console.log('FAIL\n- '+fails.join('\n- ')); process.exit(1);} console.log('chime ok');
})();
