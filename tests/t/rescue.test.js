// Saltmouth (Expansion 3, step 7): rescued souls. A cage on a landing; the Drowned Oar and the Croupier; the Toothmonger's stall
// and the Pawned Relic.
// - The cage roll is pure (SALT.cage): the same seed and landing give the same door and the same soul, every time.
// - Only on the landings after floors 2, 3 and 4; never a Trial door, a descent door or the Deep Stair; at most once a run.
// - A soul already home (ll-town.rescued) is never caged again; with both home, no cage hangs.
// - The lock takes CAGE_PRICE essence, never below 0; the soul goes up with the haul's one credit, once, even from a death.
// - The Drowned Oar is restored and the stall opens once their keeper is home; the Loaded Bone moved to the Oar.
// - The Croupier's table is played for town materials; the stall's trades always give back less; developer mode writes nothing.
// - The Pawned Relic is never offered, and is taken out only after the seeded roll: everything else stays as the seed made it.
const {chromium}=require('playwright');
const fails=[]; const ok=(cond,msg,detail)=>{if(!cond)fails.push(msg+(detail!==undefined?' '+JSON.stringify(detail).slice(0,700):''));};
(async()=>{
  const b=await chromium.launch();
  const ctx=await b.newContext({viewport:{width:412,height:860},deviceScaleFactor:2.625,hasTouch:true,isMobile:true});
  const p=await ctx.newPage();
  const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.goto('file://'+process.argv[2]); await p.waitForTimeout(400);

  /* 1. the roll: pure, only where it may hang, never on a Trial, descent or Deep door, and only souls not yet home */
  const roll=await p.evaluate(()=>{
    const T=__t, out={salt:T.SALT.cage,pure:true,where:[],bad:[],seen:0,whoSeen:{},offFloors:0,homeWho:{},bothHome:0};
    /* a landing's doors as toFork() makes them, from a fresh roll */
    const doorsAt=(seed,floor)=>{T.newRun('lamplighter',0,{seed}); T.run.floor=floor; T.run.cage=null;
      const d=T.seeded(T.SALT.doors,0,()=>T.makeDoors()); T.seeded(T.SALT.descent,0,()=>T.descentDoor(d)); T.seeded(T.SALT.cage,0,()=>T.cageDoor(d)); return d;};
    const Tn=T.townData(); Tn.rescued=[]; T.townSave();
    for(let sd=1;sd<=160;sd++)for(const fl of [0,1,2,3,4]){
      const a=doorsAt(sd,fl), b2=doorsAt(sd,fl);
      if(JSON.stringify(a)!==JSON.stringify(b2))out.pure=false;
      const i=a.findIndex(x=>x.room==='cage'); if(i<0)continue;
      if(fl===0||fl===4)out.offFloors++;
      out.seen++; out.whoSeen[a[i].who]=(out.whoSeen[a[i].who]||0)+1;
      if(a[i].trial||a[i].descent)out.bad.push([sd,fl,a[i]]);
      if(a.filter(x=>x.room==='cage').length>1)out.bad.push([sd,fl,'two cages']);
      if(out.where.length<3)out.where.push([sd,fl,i,a[i].who]);
    }
    /* the Croupier home: only the Toothmonger is ever caged; both home: no cage hangs */
    Tn.rescued=['croupier']; T.townSave();
    for(let sd=1;sd<=120;sd++){const a=doorsAt(sd,2); for(const x of a)if(x.room==='cage')out.homeWho[x.who]=(out.homeWho[x.who]||0)+1;}
    Tn.rescued=['croupier','toothmonger']; T.townSave();
    for(let sd=1;sd<=120;sd++){const a=doorsAt(sd,2); if(a.some(x=>x.room==='cage'))out.bothHome++;}
    Tn.rescued=[]; T.townSave();
    /* at most once a run: a cage rolled on one landing leaves the next without one */
    let sd=out.where[0]?out.where[0][0]:1, fl=out.where[0]?out.where[0][1]:1;
    T.newRun('lamplighter',0,{seed:sd}); T.run.floor=fl;
    const d1=T.seeded(T.SALT.doors,0,()=>T.makeDoors()); T.seeded(T.SALT.cage,0,()=>T.cageDoor(d1));
    let again=0; for(let f=1;f<=3;f++){T.run.floor=f; const d=T.seeded(T.SALT.doors,0,()=>T.makeDoors()); T.seeded(T.SALT.cage,0,()=>T.cageDoor(d)); if(d.some(x=>x.room==='cage'))again++;}
    out.once={first:d1.some(x=>x.room==='cage'),again,mark:T.run.cage};
    /* a Trial door is never the cage's even when every door is a candidate */
    T.newRun('lamplighter',0,{seed:7}); T.run.floor=1;
    let trialHit=0; for(let s2=1;s2<=200;s2++){T.run.seed=s2; T.run.cage=null; const d=[{room:'rest',trial:'ration'},{room:'merchant',descent:'carry'},{room:'deep'}]; T.seeded(T.SALT.cage,0,()=>T.cageDoor(d)); if(d.some(x=>x.room==='cage'))trialHit++;}
    out.trialHit=trialHit;
    return out;
  });
  ok(roll.salt===26,'the cage has its own salt at the end of SALT',roll.salt);
  ok(roll.pure,'same seed, same landing: the same doors, the same cage, the same soul');
  ok(roll.seen>20&&roll.whoSeen.croupier>0&&roll.whoSeen.toothmonger>0,'cages hang on some landings, holding either soul',roll);
  ok(roll.offFloors===0,'no cage on the landings after floors 1 or 5',roll.offFloors);
  ok(roll.bad.length===0,'a cage is never on a Trial door or a descent door, and one landing has one at most',roll.bad);
  ok(!roll.homeWho.croupier&&roll.homeWho.toothmonger>0,'a soul already home is never caged again',roll.homeWho);
  ok(roll.bothHome===0,'with both souls home, no cage hangs',roll.bothHome);
  ok(roll.once.first&&roll.once.again===0&&roll.once.mark!=null,'a cage hangs at most once a run',roll.once);
  ok(roll.trialHit===0,'Trial doors, descent doors and the Deep Stair never take the cage',roll.trialHit);

  /* 2. the room: pay the lock (never below 0), walk past, and the soul goes up with the haul, once, even from a death */
  const room=await p.evaluate(()=>{
    const T=__t, out={};
    const Tn=T.townData(); Tn.rescued=[]; T.townSave();
    const land=(ess)=>{T.newRun('lamplighter',0,{seed:11}); T.run.ess=ess; T.F.foes=[]; T.F.queue=[]; T.F.wave=T.F.def.waves.length; T.F.phase='cleared'; T.openDraft(0,0);
      const d=T.F.draft; d.step='fork'; d.doors=[{room:'cage',who:'croupier',omen:null},{room:'rest',omen:null}]; T.showLanding(); return d;};
    T.tutSet({walk:'done',seen:[],off:false});
    let d=land(10); out.forkTip=/A cage/.test(document.getElementById('mBody').innerHTML); out.doorTag=document.getElementById('mChoices').textContent.includes('Cage');
    T.chooseDoor(d,0); let B=T.landingModal(); out.poorChoices=(B.choices||[]).length; out.poorWalk=B.actions.some(a=>a.label==='Walk past');
    T.tutSet({walk:'done',seen:[],off:true});
    d=land(40); T.chooseDoor(d,0); B=T.landingModal(); out.choices=B.choices.length;
    B.choices[0].fn(); B.choices[0].fn();
    out.ess=T.run.ess; out.rescued=T.run.rescued.slice(); out.res=d.room.res; out.town0=T.townData().rescued.slice();
    /* the run is saved here; a reload keeps the soul freed, and nothing is paid twice */
    T.checkpoint(); T.resumeFrom(JSON.parse(localStorage.getItem('ll-save-v2'))); out.resumed=T.run.rescued.slice(); out.resumedEss=T.run.ess;
    out.line=T.soulLine(T.run);
    T.defeat();
    out.town1=JSON.parse(localStorage.getItem('ll-town')).rescued; out.runAfter=T.run.rescued.slice();
    T.haulCredit(); out.town2=JSON.parse(localStorage.getItem('ll-town')).rescued;
    /* an old save has no rescued list */
    T.newRun('lamplighter',0,{seed:3}); T.checkpoint(); const sv=JSON.parse(localStorage.getItem('ll-save-v2')); delete sv.run.rescued; delete sv.run.cage;
    T.resumeFrom(sv); out.oldSave=Array.isArray(T.run.rescued)&&T.run.rescued.length===0;
    return out;
  });
  ok(room.forkTip&&room.doorTag,'the fork names the cage door, and its first-time tip shows there',room);
  ok(room.poorChoices===0&&room.poorWalk,'with less essence than the lock asks, there is nothing to pay and you walk past',room);
  ok(room.choices===1&&room.ess===25&&room.rescued.join()==='croupier'&&room.res,'freeing the Croupier takes 15 essence once, even tapped twice',room);
  ok(room.town0.length===0,'nothing reaches the town until the haul is credited',room.town0);
  ok(room.resumed.join()==='croupier'&&room.resumedEss===25,'a reload keeps the soul freed and the essence paid once',room);
  ok(/Croupier climbs the chain to Saltmouth/.test(room.line),'the end screens say who climbed to Saltmouth',room.line);
  ok(room.town1.join()==='croupier'&&room.runAfter.length===0&&room.town2.join()==='croupier','a death credits the soul once, with the haul',room);
  ok(room.oldSave,'an old save resumes with nobody rescued');

  /* 3. the town: the Oar and the stall open when their keeper is home; the Loaded Bone is the Oar's now; developer mode writes nothing */
  const town=await p.evaluate(()=>{
    const T=__t, out={};
    const Tn=T.townData(); Tn.rescued=[]; Tn.gift=null; Tn.res={timber:100,iron:100,tallow:100,curios:2}; T.townSave();
    const oar=T.TOWN_HOUSES[T.TOWN_SOULS.croupier.house];
    T.townArt(); out.ruin0=oar.ruin; out.bone0=T.townSetGift('bone'); T.townOpen(); out.crowd0=T.TWN.crowd.filter(e=>e.soul).length;
    out.keep=Object.values(T.TOWN_SOULS).every(S=>T.townKept(S.st[0],S.st[1])&&T.townKept(S.dx,S.dy)); out.reach=T.townKeepOK([]);
    out.solid=[[4,18],[5,18]].every(([x,y])=>T.townSolid(x,y));
    T.townSoulCard('croupier'); out.ruinCard=document.getElementById('mTitle').textContent; document.getElementById('modal').hidden=true; T.townClose();
    Tn.rescued=['croupier','toothmonger']; T.townSave();
    T.townArt(); out.ruin1=oar.ruin; out.lit1=oar.lit.every(Boolean);
    T.townOpen(); out.crowd1=T.TWN.crowd.filter(e=>e.soul).map(e=>e.k).sort().join();
    out.bone1=T.townSetGift('bone'); out.gift1=T.townData().gift;
    /* the near button at each place, and a tap on each place walks there */
    T.TWN.p.x=17.5; T.TWN.p.y=20.5; out.nearOar=T.townActLabel(T.townNearAct());
    T.TWN.p.x=4.5; T.TWN.p.y=19.5; out.nearStall=T.townActLabel(T.townNearAct());
    T.TWN.p.x=12; T.TWN.p.y=14; T.townTapTile(18,17); out.walkOar=!!(T.TWN.path&&T.TWN.path.length)&&T.TWN.goal&&T.TWN.goal.soul;
    for(let i=0;i<400&&T.TWN.goal;i++)T.townStep(1/30); out.oarCard=document.getElementById('mTitle').textContent; document.getElementById('modal').hidden=true;
    /* trades: always less back than given; a short trade changes nothing */
    /* no round of trades comes out ahead: every cycle of rates multiplies to less than 1 (Floyd–Warshall on the best rates) */
    const M=['timber','iron','tallow','curios'], best={}; for(const a of M)for(const c of M)best[a+c]=a===c?1:0;
    for(const t of T.TOWN_TRADES){const a=Object.keys(t.give)[0], c=Object.keys(t.get)[0]; best[a+c]=Math.max(best[a+c],t.get[c]/t.give[a]);}
    for(const m of M)for(const a of M)for(const c of M)best[a+c]=Math.max(best[a+c],best[a+m]*best[m+c]);
    out.tradesLose=M.every(a=>best[a+a]<=1)&&T.TOWN_TRADES.every(t=>Object.keys(t.give).length===1&&Object.keys(t.get).length===1);
    const r0=Object.assign({},T.townData().res); T.townTrade(0); const r1=Object.assign({},T.townData().res);
    out.trade=r1.timber===r0.timber-10&&r1.iron===r0.iron+5;
    T.townData().res.curios=0; out.short=T.townTrade(3)===false&&T.townData().res.tallow===r1.tallow;
    document.getElementById('modal').hidden=true;
    /* the Croupier's table: the stake comes from the town as the first bone is thrown; a win pays it back twice */
    const before=T.townData().res.timber; T.bonesTown('timber'); out.staked=before-T.townData().res.timber;
    const d=T.bonesPrac; d.room.you=[[6,6],[6,6,6],[6,6,6]]; d.room.them=[[1],[1],[1]]; d.room.die=6; T.setBonesAnim(null);
    T.bonesPick(d,0); out.done=d.room.done; out.paid=T.townData().res.timber-before;
    out.store=JSON.parse(localStorage.getItem('ll-town')).res.timber===T.townData().res.timber;
    /* developer mode: the table, the trades and the cage's credit write nothing */
    const live=localStorage.getItem('ll-town'); T.setDev(true); T.townReset();
    T.townData().res.timber=50; T.bonesTown('timber'); T.townTrade(0);
    T.newRun('lamplighter',0,{seed:4}); T.run.rescued=['toothmonger']; T.haulCredit();
    out.devIsolated=localStorage.getItem('ll-town')===live; T.setDev(false); T.townReset();
    document.getElementById('modal').hidden=true; T.townClose();
    return out;
  });
  ok(town.ruin0&&town.bone0===false&&town.crowd0===0&&/Drowned Oar/.test(town.ruinCard),'before the Croupier is home: the Oar is a ruin, nobody stands there, and the Loaded Bone is not offered',town);
  ok(town.keep&&town.reach&&town.solid,'the stall stands on its two tiles, and the souls’ places are kept clear and reachable',town);
  ok(!town.ruin1&&town.lit1&&town.crowd1==='croupier,toothmonger','home: the Oar is restored with lit windows, and both stand in the square',town);
  ok(town.bone1&&town.gift1==='bone','the Loaded Bone is carried from the Drowned Oar',town);
  ok(town.nearOar==='The Drowned Oar'&&town.nearStall==='The Toothmonger’s Stall','the button names each place you stand at',town);
  ok(town.walkOar&&town.oarCard==='The Drowned Oar','a tap on the Oar walks to its door and opens its card',town);
  ok(town.tradesLose&&town.trade&&town.short,'trades run at fixed rates, always for less, and a short one changes nothing',town);
  ok(town.staked===10&&town.done==='win'&&town.paid===10&&town.store,'the Croupier takes the stake and pays a win back twice over, into ll-town',town);
  ok(town.devIsolated,'developer mode never writes ll-town from the table, the stall or a rescue');

  /* 4. the Pawned Relic: never offered; taken out after the roll, so seeds are otherwise the same; off on replay and under a Trial */
  const pawn=await p.evaluate(()=>{
    const T=__t, out={bad:[],prefix:true};
    const Tn=T.townData(); Tn.rescued=['toothmonger']; Tn.res={timber:0,iron:0,tallow:30,curios:0};
    const k=Object.keys(T.RELICS).find(x=>!T.RELICS[x].curse&&!T.RELICS[x].pack&&!T.RELICS[x].needs&&!T.RELICS[x].notKit);
    Tn.pawn=k; out.set=T.townSetGift('pawn'); T.townSave(); out.k=k;
    T.newRun('lamplighter',0,{seed:21}); out.gift=T.run.gift; out.pawnRun=T.run.pawn; out.tallow=T.townData().res.tallow; out.pawned=T.pawned();
    const withDraw=JSON.stringify([T.run.draw,T.run.mapv]);
    T.townSetGift(null); T.newRun('lamplighter',0,{seed:21}); out.sameDraw=withDraw===JSON.stringify([T.run.draw,T.run.mapv]);
    /* the same rolls with and without it: the pawned relic gone, the rest in the same order */
    for(let sd=1;sd<=60;sd++)for(const fl of [0,1,2]){
      T.newRun('lamplighter',0,{seed:sd}); T.run.floor=fl;
      T.run.gift=null; const a=T.seeded(T.SALT.pick,1,()=>T.relicOpts(3)), ga=T.seeded(T.SALT.gift,0,()=>T.draftOptions(4,false)), sa=T.seeded(T.SALT.merchant,0,()=>T.makeStock());
      T.run.gift='pawn'; T.run.pawn=k; const b2=T.seeded(T.SALT.pick,1,()=>T.relicOpts(3)), gb=T.seeded(T.SALT.gift,0,()=>T.draftOptions(4,false)), sb=T.seeded(T.SALT.merchant,0,()=>T.makeStock());
      if(b2.includes(k)||gb.some(o=>o.kind==='relic'&&o.key===k)||sb.some(o=>o.kind==='relic'&&o.key===k))out.bad.push([sd,fl]);
      const af=a.filter(x=>x!==k); if(JSON.stringify(af)!==JSON.stringify(b2.slice(0,af.length)))out.prefix=false;
      /* a gift draw keeps every other thing it offered (its never-all-relics rule may swap the last slot, so not a prefix) */
      const J=o=>JSON.stringify(o), gaf=ga.filter(o=>!(o.kind==='relic'&&o.key===k)); if(!gaf.every(o=>gb.some(x=>J(x)===J(o))))out.prefix=false;
      const saf=sa.filter(o=>!(o.kind==='relic'&&o.key===k)); if(!saf.every(o=>sb.some(x=>x.kind===o.kind&&x.key===o.key)))out.prefix=false;
    }
    /* off on a replayed stair and under a Trial */
    T.newRun('lamplighter',0,{seed:5}); T.run.gift='pawn'; T.run.pawn=k; T.run.replay=true; out.replay=T.pawned();
    T.run.replay=false; T.F.trial='ration'; out.trial=T.pawned(); T.F.trial=null;
    /* short of tallow it stays up top, and nothing is taken */
    const Tm=T.townData(); Tm.res.tallow=10; T.townSetGift('pawn'); T.newRun('lamplighter',0,{seed:6}); out.poor={gift:T.run.gift,tallow:T.townData().res.tallow};
    /* a cursed relic can't be pawned; the stall's list is relics you have carried */
    const curse=Object.keys(T.RELICS).find(x=>T.RELICS[x].curse); out.curseOK=T.pawnOK(curse);
    out.fixCurse=T.townFix({rescued:['toothmonger'],pawn:curse,gift:'pawn'}).gift;
    T.townSetGift(null); T.townSave();
    return out;
  });
  ok(pawn.set&&pawn.gift==='pawn'&&pawn.pawnRun===pawn.k&&pawn.tallow===5&&pawn.pawned===pawn.k,'the Pawned Relic goes down, and the Toothmonger keeps 25 tallow',pawn);
  ok(pawn.bad.length===0,'the pawned relic is never offered: not as a gift, a pick or at the merchant',pawn.bad);
  ok(pawn.prefix&&pawn.sameDraw,'the pawned relic is taken out after the roll: everything else stays where the seed put it',pawn);
  ok(pawn.replay===null&&pawn.trial===null,'the Pawned Relic is off on a replayed stair and under a Trial',pawn);
  ok(pawn.poor.gift===null&&pawn.poor.tallow===10,'short of 25 tallow it stays up top, and nothing is taken',pawn.poor);
  ok(pawn.curseOK===false&&pawn.fixCurse===null,'a cursed relic is never pawned',pawn);

  /* 5. the art: both figures 16 by 24, outlined, and a head per facing */
  const art=await p.evaluate(()=>{const S=__t.townSprites(), out={};
    for(const k in __t.TOWN_SOULS){const A=__t.TOWN_SOULS[k].art; out[k]=!!S[k]&&['d','u','r'].every(f=>A.head[f].length===12&&A.head[f].every(r=>r.length===16))&&['d','u','r','l'].every(f=>S[k][f].every(fr=>fr.c.width===16&&fr.c.height===24));}
    return out;});
  ok(art.croupier&&art.toothmonger,'the Croupier and the Toothmonger are 16 by 24, a head for every facing',art);

  ok(errs.length===0,'no page errors',errs);
  await b.close();
  for(const f of fails)console.log('FAIL '+f);
  if(fails.length){console.log(fails.length+' failed'); process.exit(1);}
  console.log('rescue ok');
})().catch(e=>{console.log('FAIL '+e.stack); process.exit(1);});
