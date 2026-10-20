// The Wrong Sun (#81): offers, its spots, the turned board, Attention tiers, and each offering's effect.
const {chromium}=require('playwright');
const fails=[]; const ok=(c,m,d)=>{if(!c)fails.push(m+(d!==undefined?' '+JSON.stringify(d):''));};
(async()=>{
  const b=await chromium.launch(); const p=await b.newPage({viewport:{width:412,height:860}});
  const errs=[]; p.on('pageerror',e=>errs.push(String(e)));
  await p.goto('file://'+process.argv[2]); await p.waitForTimeout(300);

  /* the offers: only what the kit can use, and either patron can reach out, whatever the Attention */
  const offers=await p.evaluate(()=>{const T=__t, out={};
    const keys=k=>{T.newRun(k,0); const s=new Set(); for(let i=0;i<200;i++)(T.offerSet('sun')||[]).forEach(x=>s.add(x)); return [...s].sort();};
    out.lamp=keys('lamplighter'); out.whaler=keys('whaler'); out.bell=keys('bellringer');
    T.newRun('lamplighter',0); T.addAtt('sun',3);
    const n={mother:0,sun:0}; for(let i=0;i<300;i++){const o=T.patronOffer(); n[o.p]++; if(!o.o.every(k=>T.OFFERINGS[k].p===o.p))n.mixed=1;}
    out.pick=n;
    Object.keys(T.OFFERINGS).filter(k=>T.OFFERINGS[k].p==='sun').forEach(k=>T.run.offs=(T.run.offs||[]).concat(k));
    out.fallback=T.patronOffer().p;
    return out;});
  console.log(JSON.stringify(offers));
  ok(offers.lamp.includes('sun_signal')&&!offers.lamp.includes('sun_harpoon'),'the Lamplighter sees its own, not the Whaler’s',offers.lamp);
  ok(offers.whaler.includes('sun_harpoon')&&!offers.whaler.includes('sun_signal'),'the Whaler sees its own',offers.whaler);
  ok(offers.bell.includes('sun_chime'),'the Bellringer sees Resonant Glare',offers.bell);
  ok(offers.pick.mother>90&&offers.pick.sun>90&&!offers.pick.mixed,'either patron reaches out at even odds, even at Attention 3, each with only its own',offers.pick);
  ok(offers.fallback==='mother','a patron with nothing left gives way to the other',offers.fallback);

  /* Noticed: three spots on the path, never the lamp, kept with the run; they see, they sight Stalkers, no burn yet */
  const spots=await p.evaluate(()=>{const T=__t, out={}; window.devNoDark=false;
    T.newRun('lamplighter',0); T.setP(false);
    out.before=T.F.spots?T.F.spots.size:0;
    T.takeOffer('solarflare'); out.tier=T.patTier('sun'); out.size=T.F.spots.size;
    out.onPath=[...T.F.spots].every(k=>T.F.pathTiles.has(k)); out.onLamp=T.F.spots.has(T.F.lampC+','+T.F.lampR);
    out.saved=JSON.parse(JSON.stringify(T.run.spots));
    const [g,d]=T.run.spots.tiles[0];
    const st=T.spawnFoe('stalker',g,d), away=T.spawnFoe('stalker',0,.2);
    out.inSpot=T.inSpot(st); out.seen=T.canSee(st); out.awaySeen=T.canSee(away);
    const hp0=st.hp; T.update(.05); out.sight=st.sightT>0; out.awaySight=!!(away.sightT>0); out.noBurn=st.hp===hp0;
    /* the turned board works the spots out again from the run: same count, still on the path */
    const o=T.ORIENT; T.setOrient(o==='land'?'port':'land'); out.turned=T.F.spots.size; out.turnedOnPath=[...T.F.spots].every(k=>T.F.pathTiles.has(k)); T.setOrient(o);
    T.F.foes.forEach(e=>e.dead=true); T.update(.01);
    return out;});
  console.log(JSON.stringify(spots));
  ok(spots.before===0,'no spots before it notices you',spots.before);
  ok(spots.tier===1&&spots.size===3,'one gift: Noticed, three spots at once',[spots.tier,spots.size]);
  ok(spots.onPath&&!spots.onLamp,'spots burn on the path, never on the lamp',spots);
  ok(spots.saved.floor===0&&spots.saved.tiles.length===3,'the spots are kept in the run',spots.saved);
  ok(spots.inSpot&&spots.seen&&!spots.awaySeen,'a veiled Stalker in a spot is seen; one in the dark is not',spots);
  ok(spots.sight&&!spots.awaySight,'a Stalker that crosses a spot has seen the lamp',spots);
  ok(spots.noBurn,'Noticed alone does not burn',spots);
  ok(spots.turned===3&&spots.turnedOnPath,'turning the board keeps the spots on the path',spots);

  /* Watched: spots sear 3 a second (6 with Searing Rays), another opens each wave up to 12; Blinded Prey slows and
     spares the Stalker; Claimed: a ward in the glare waits a third longer between shots */
  const tiers=await p.evaluate(()=>{const T=__t, out={};
    T.newRun('lamplighter',0); T.setP(false); T.addAtt('sun',3); out.tier=T.patTier('sun');
    const [g,d]=T.run.spots.tiles[0];
    const c=T.spawnFoe('crawler',g,d); c.stunT=9; const h0=c.hp; T.update(.5); out.burn=+(h0-c.hp).toFixed(2);
    T.run.offs=(T.run.offs||[]).concat('sunbeam'); const h1=c.hp; T.update(.5); out.burn2=+(h1-c.hp).toFixed(2);
    c.dead=true; T.update(.01);
    const n0=T.F.spots.size; T.spotRise(); out.rose=T.F.spots.size-n0; for(let i=0;i<40;i++)T.spotRise(); out.cap=T.F.spots.size;
    T.run.offs=(T.run.offs||[]).concat('solartrap');
    const s2=T.spawnFoe('stalker',g,d), free=T.spawnFoe('stalker',0,.2);
    const a0=s2.d, b0=free.d; T.update(.05); out.dazzled=!(s2.sightT>0); out.slowRatio=+((s2.d-a0)/(free.d-b0)).toFixed(2);
    T.F.foes.forEach(e=>e.dead=true); T.update(.01);
    out.cdBefore=T.sunCd({x:T.F.spotPts[0]+1,y:T.F.spotPts[1]});
    T.addAtt('sun',2); out.claimed=T.patTier('sun');
    out.cdNear=+T.sunCd({x:T.F.spotPts[0]+1,y:T.F.spotPts[1]}).toFixed(3);
    out.cdFar=T.sunCd({x:-20,y:-20});
    return out;});
  console.log(JSON.stringify(tiers));
  ok(tiers.tier===2,'Attention 3 is Watched',tiers.tier);
  ok(Math.abs(tiers.burn-1.5)<.2,'Watched sears 3 a second',tiers.burn);
  ok(Math.abs(tiers.burn2-3)<.3,'Searing Rays doubles it',tiers.burn2);
  ok(tiers.rose===1&&tiers.cap===8,'another spot opens each wave, eight at most',[tiers.rose,tiers.cap]);
  ok(tiers.dazzled,'a dazzled Stalker never sights the lamp',tiers);
  ok(tiers.slowRatio>.7&&tiers.slowRatio<.9,'Blinded Prey slows what stands in a spot by a fifth',tiers.slowRatio);
  ok(tiers.cdBefore===1,'Watched does not slow your wards',tiers.cdBefore);
  ok(tiers.claimed===3&&Math.abs(tiers.cdNear-1.333)<.01&&tiers.cdFar===1,'Claimed: a ward in the glare fires a quarter slower; one away from it does not',tiers);

  /* the offerings that strike: Solar Glare bursts on Flare, Solar Tether, Resonant Glare (a Toll, not a Peal beat),
     Alien Spectrum sears in candle light, Disorienting Flare once each and never a Herald */
  const offs=await p.evaluate(()=>{const T=__t, out={};
    T.newRun('lamplighter',0); T.setP(false); T.takeOffer('solarflare');
    const [g,d]=T.run.spots.tiles[0];
    const c=T.spawnFoe('crawler',g,d); const h0=c.hp; T.castRite('flare'); out.glare=+(h0-c.hp).toFixed(1); c.dead=true; T.update(.01);
    T.newRun('whaler',0); T.setP(false); T.takeOffer('sun_harpoon');
    const [g2,d2]=T.run.spots.tiles[0];
    const w=T.spawnFoe('behemoth',g2,d2); w.tetherBy={}; const w0=w.hp; T.hurt(w,10,'harpoon'); out.tether=+(w0-w.hp).toFixed(1);
    w.tetherBy=null; const w1=w.hp; T.hurt(w,10,'harpoon'); out.free=+(w1-w.hp).toFixed(1); w.dead=true; T.update(.01);
    T.newRun('bellringer',0); T.setP(false); T.takeOffer('sun_chime');
    const [g3,d3]=T.run.spots.tiles[0];
    const r=T.spawnFoe('crawler',g3,d3); T.lampToll('peal'); out.peal=r.stunT>0; T.lampToll('toll'); out.toll=r.stunT>0&&r.heardT>0; r.dead=true; T.update(.01);
    T.newRun('lamplighter',0); out.spectrum=T.wstat({type:'candle',br:{},x:0,y:0}).burn;
    T.takeOffer('aliencandle'); out.spectrum2=T.wstat({type:'candle',br:{},x:0,y:0}).burn;
    return out;});
  console.log(JSON.stringify(offs));
  ok(offs.glare>=20,'Solar Glare: Flare bursts every spot for 20',offs.glare);
  ok(Math.abs(offs.tether-15)<.1&&Math.abs(offs.free-10)<.1,'Solar Tether: half again on the line in a spot, nothing off it',offs);
  ok(!offs.peal&&offs.toll,'Resonant Glare: a Toll stuns and hears what stands in a spot; a Peal beat does not',offs);
  ok(offs.spectrum2-offs.spectrum===6,'Alien Spectrum: candles sear 6 a second more',offs);

  /* Disorienting Flare: an Arc Lamp's flare makes a stunned creature walk back for 2s, once each, never a boss or a Herald */
  const arc=type=>p.evaluate(type=>{const T=__t, out={};
    T.newRun('galvanist',0); T.setP(false); T.run.offs=['sun_arc']; T.F.phase='wave';
    /* by the lamp, so its light reaches the candle (a dark candle never flares) */
    const L0=T.F.paths[0].len-3.2, pt=T.posAt(T.F.paths[0],L0);
    T.F.towers.push({kind:'ward',type:'candle',id:9001,c:Math.floor(pt[0]),r:Math.floor(pt[1]),x:pt[0],y:pt[1]+.3,br:{glow:0,spark:0,signal:0,ember:0},cd:0,ang:0});
    const e=T.spawnFoe(type,0,L0); e.hp=1e6; let back=0, stunned=0;
    /* hold it in the lamp's light until the flare comes (every 4s); once lost, let it walk */
    for(let i=0;i<260;i++){if(!(e.disorientT>0)&&!e.lost)e.d=L0; const before=e.d; T.update(.05); if(e.stunT>0)stunned++; if(e.lost&&e.d<before-1e-6)back++;}
    return {lost:!!e.lost,back,stunned};},type);
  const lost={crawler:await arc('crawler'),herald:await arc('tithetaker'),boss:await arc('boss')};
  console.log(JSON.stringify(lost));
  ok(lost.crawler.stunned>0&&lost.crawler.lost&&lost.crawler.back>=20,'Disorienting Flare: a stunned creature forgets the way and walks back',lost.crawler);
  ok(lost.herald.stunned>0&&!lost.herald.lost&&!lost.boss.lost,'a Herald (struck by the flare, so stunned) and a boss are never disoriented',lost);

  /* Alien Ash: an Occultist's Corpse Candle by a spot shines a tile further and sears; away from one, it does not */
  const ash=await p.evaluate(()=>{const T=__t, out={};
    T.newRun('occultist',0); T.setP(false); T.run.offs=['sun_corpse']; T.addAtt('sun',1);
    const [g,d]=T.run.spots.tiles[0], pt=T.posAt(T.F.paths[g],d);
    const near={kind:'ward',type:'candle',id:9101,x:pt[0]+.8,y:pt[1],br:{}}, far={kind:'ward',type:'candle',id:9102,x:-20,y:-20,br:{}};
    const a=T.wstat(near), b=T.wstat(far);
    out.lightGain=+(a.light-b.light).toFixed(2); out.burnGain=a.burn-b.burn;
    T.newRun('lamplighter',0); T.setP(false); T.run.offs=['sun_corpse']; T.addAtt('sun',1);
    const [g2,d2]=T.run.spots.tiles[0], q=T.posAt(T.F.paths[g2],d2);
    out.otherKit=T.wstat({kind:'ward',type:'candle',id:9103,x:q[0]+.8,y:q[1],br:{}}).burn;
    return out;});
  console.log(JSON.stringify(ash));
  ok(ash.lightGain===1&&ash.burnGain===6,'Alien Ash: a Corpse Candle by a spot shines a tile further and sears 6 a second',ash);
  ok(ash.otherKit===0,'Alien Ash does nothing for another kit',ash);

  /* an offer from it reads as its own, and refusing it says so */
  const modal=await p.evaluate(()=>{const T=__t; T.newRun('lamplighter',0); T.openOffer(T.offerSet('sun'),'sun');
    const out={title:document.querySelector('#modal').textContent.includes('The Wrong Sun'),refuse:[...document.querySelectorAll('#mActions button')].some(b=>b.textContent==='Refuse it')};
    [...document.querySelectorAll('#mActions button')].find(b=>b.textContent==='Refuse it').click(); out.att=T.attOf('sun'); return out;});
  console.log(JSON.stringify(modal));
  ok(modal.title&&modal.refuse&&modal.att===0,'its offer names it, Refuse it closes it, and refusing costs nothing',modal);

  ok(!errs.length,'no page errors',errs);
  await b.close();
  if(fails.length){fails.forEach(f=>console.log('FAIL '+f)); process.exit(1);}
  console.log('sun ok');
})();
