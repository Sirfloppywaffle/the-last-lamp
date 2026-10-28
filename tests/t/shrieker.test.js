// The Bound Shrieker against slow, big creatures (Criss, on #127: "they can't move past one").
// Its scream pushes everything in range back 1.3 tiles every 3 seconds. A Herald walks about 1.1 tiles in that time, so a full
// push held it on one spot for good. Choirmasters and Heralds now go back a third as far, and not again for 3 seconds whichever
// Shrieker screams, so even three Shriekers can't pin one. Everything else is pushed exactly as before.
const {chromium}=require('playwright');
const fails=[]; const ok=(cond,msg,detail)=>{if(!cond)fails.push(msg+(detail!==undefined?' '+JSON.stringify(detail):''));};
(async()=>{
  const b=await chromium.launch(); const p=await b.newPage({viewport:{width:900,height:700}});
  const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.goto('file://'+process.argv[2]); await p.waitForTimeout(300);

  const r=await p.evaluate(()=>{
    const T=__t, out={};
    const setup=(n)=>{T.newRun(); T.run.floor=3; T.beginFloor(null); T.run.ess=9000; T.run.oil=T.run.oilMax=999; T.run.roster.shrieker=n;
      T.setP(false); T.F.phase='wave'; T.F.queue=[{t:1e9,type:'crawler',gate:0}]; T.F.foes=[];};
    const P=()=>T.F.paths[0];
    /* the path point nearest a tile, as a distance along the path */
    const along=(c,r)=>{let bd=1e9, bdd=0; for(let d=0;d<P().len;d+=.1){const q=T.posAt(P(),d); const x=Math.hypot(q[0]-(c+.5),q[1]-(r+.5)); if(x<bd){bd=x; bdd=d;}} return [bd,bdd];};
    /* n Shriekers beside the same stretch of path, far enough up it that a creature has room to walk into their range */
    const placeN=(n)=>{const it={kind:'horror',type:'shrieker'}, cand=[];
      for(let r=0;r<T.ROWS;r++)for(let c=0;c<T.COLS;c++){if(T.placeProblem(it,c,r))continue; const [x,d]=along(c,r); if(x<=1.2&&d>4&&d<P().len-4.5)cand.push([c,r,d,Math.hypot(c+.5-T.F.lx,r+.5-T.F.ly)]);}
      /* by the lamp, where all of their range is lit and they can see what they scream at */
      cand.sort((a,b)=>a[3]-b[3]); const at=cand[0]; if(!at)return null;
      const near=cand.slice().sort((a,b)=>Math.hypot(a[0]-at[0],a[1]-at[1])-Math.hypot(b[0]-at[0],b[1]-at[1])).slice(0,n);
      for(const [c,r] of near){T.setSel(it); T.tryPlace(c,r);} T.setSel(null);
      return {n:T.F.towers.filter(t=>t.type==='shrieker').length,d:Math.max(...near.map(q=>q[2]))};};
    /* walk one creature up to and past the Shriekers for up to 60 seconds of play. Past: 3 tiles beyond them, out of range */
    const walk=(type,n)=>{setup(n); const pl=placeN(n); if(!pl)return {placed:0};
      const e=T.spawnFoe(type,0,Math.max(0,pl.d-3)); e.hp=e.max=1e9; let t=0, minD=e.d, pushes=0, last=e.d;
      for(;t<60&&e.d<pl.d+3&&!e.dead;t+=1/30){T.update(1/30); if(e.d<last-.05)pushes++; last=e.d;}
      return {placed:pl.n,passed:e.d>=pl.d+3,secs:+t.toFixed(1),pushes};};
    out.herald1=walk('bellfather',1);
    out.herald3=walk('bellfather',3);
    out.elite1=walk('elite',1);
    out.elite3=walk('elite',3);
    /* one scream on a Crawler still pushes the full 1.3; on a Herald, a third of it */
    const once=(type)=>{setup(1); const pl=placeN(1); const e=T.spawnFoe(type,0,pl.d); e.hp=e.max=1e9; const t=T.F.towers.find(x=>x.type==='shrieker'); t.cd=0;
      const d0=e.d; T.update(1/30); return +(d0-e.d).toFixed(2);};
    out.crawlerPush=once('crawler'); out.heraldPush=once('lastkeeper');
    /* the rest: a second scream inside 3 seconds leaves the Herald where it is; after 3 seconds a scream moves it again */
    {setup(1); const pl=placeN(1); const e=T.spawnFoe('lastkeeper',0,pl.d); e.hp=e.max=1e9; const t=T.F.towers.find(x=>x.type==='shrieker');
      t.cd=0; let d0=e.d; T.update(1/30); const first=+(d0-e.d).toFixed(2);
      t.cd=0; d0=e.d; T.update(1/30); const again=+(d0-e.d).toFixed(2);
      T.F.time+=3.05; t.cd=0; d0=e.d; T.update(1/30); const after=+(d0-e.d).toFixed(2);
      out.rest={first,again,after};
      /* its first-time tip is ready while one stands in a Shrieker's range, and not with only a Crawler there */
      out.tip=T.TIPS.shriekbig.when(); e.dead=true; const c=T.spawnFoe('crawler',0,pl.d); c.hp=c.max=1e9; out.tipCrawler=T.TIPS.shriekbig.when();}
    return out;
  });
  for(const k of ['herald1','herald3','elite1','elite3'])ok(r[k].placed>0,'Shriekers were placed beside the path for '+k,r[k]);
  /* on main a Herald spent 38 to 45 seconds being screamed back to the same spot by one Shrieker, and three held it all minute */
  ok(r.herald1.passed&&r.herald1.secs<=25,'a Herald walks past one Shrieker in under 25 seconds',r.herald1);
  ok(r.herald3.placed===3&&r.herald3.passed&&r.herald3.secs<=30,'a Herald walks past three Shriekers together in under 30 seconds',r.herald3);
  ok(r.elite1.passed&&r.elite1.secs<=20&&r.elite3.placed===3&&r.elite3.passed&&r.elite3.secs<=25,'a Choirmaster walks past one Shrieker, and past three',[r.elite1,r.elite3]);
  ok(r.herald1.pushes>0&&r.elite1.pushes>0,'they are still screamed back on the way',[r.herald1.pushes,r.elite1.pushes]);
  ok(r.crawlerPush>1.2&&r.crawlerPush<1.35,'a Crawler is still screamed back the full 1.3 tiles',r.crawlerPush);
  ok(r.heraldPush>.35&&r.heraldPush<.5,'a Herald is screamed back a third as far',r.heraldPush);
  ok(r.tip===true&&r.tipCrawler===false,'the first-time tip shows when a Choirmaster or Herald is in a bound Shrieker’s range',[r.tip,r.tipCrawler]);
  ok(r.rest.first>.35&&r.rest.again<=0&&r.rest.after>.35,'no scream moves the same Herald again for 3 seconds; after that one does',r.rest);
  ok(errs.length===0,'no page errors',errs);
  await b.close();
  for(const f of fails)console.log('FAIL '+f);
  if(fails.length){console.log(fails.length+' failed'); process.exit(1);}
  console.log('shrieker ok',JSON.stringify(r));
})().catch(e=>{console.log('FAIL '+e.stack); process.exit(1);});
