// The Relic Overhaul (#89): each of the eleven relics that came back changes a rule. One check (or a few) per relic.
const {chromium}=require('playwright');
const fails=[]; const ok=(c,m,d)=>{if(!c)fails.push(m+(d!==undefined?' '+JSON.stringify(d):''));};
(async()=>{
  const b=await chromium.launch(); const p=await b.newPage({viewport:{width:412,height:860}});
  const errs=[]; p.on('pageerror',e=>errs.push(String(e)));
  await p.goto('file://'+process.argv[2]); await p.waitForTimeout(300);
  await p.evaluate(()=>{
    window.fresh=(kit,relics)=>{const T=__t; T.newRun(kit||'lamplighter',0); T.setP(false); T.run.ess=3000; window.devNoDark=true;
      T.F.towers=T.F.towers.filter(t=>t.kind!=='horror'); (relics||[]).forEach(k=>T.addRelic(k)); return T;};
    window.pass=(sec)=>{for(let i=0;i<sec*30;i++)__t.update(1/30);};
    window.holdWave=()=>{const T=__t; T.F.phase='wave'; T.F.queue=[{t:9999,type:'crawler',gate:0}];};
    /* build a ward on the first free tile whose distance from the lamp passes the test */
    window.place=(type,test,kind)=>{const T=__t, it={kind:kind||'ward',type};
      for(let r=0;r<T.ROWS;r++)for(let c=0;c<T.COLS;c++){if(T.placeProblem(it,c,r)!=='')continue; const d=Math.hypot(c+.5-T.F.lx,r+.5-T.F.ly); if(test&&!test(d))continue;
        T.setSel(it); T.tryPlace(c,r); T.setSel(null); return T.F.towers[T.F.towers.length-1];}
      return null;};
    /* a creature on path 0, so many tiles from the lamp along the path */
    window.near=(type,back)=>{const T=__t, P=T.F.paths[0], e=T.spawnFoe(type||'crawler',0,Math.max(0,P.len-back)); e.spawnT=0; return e;};
    window.far=(type,d)=>{const T=__t, e=T.spawnFoe(type||'crawler',0,d||1); e.spawnT=0; return e;};
  });

  const r=await p.evaluate(()=>{const out={};
    /* 1. Tallow of Saints: the lamp's own edge fires faster, the core does not, and the lamp is no wider */
    let T=fresh('lamplighter'); const base=T.lampBase(); T.addRelic('tallow'); const R=T.lampRadius();
    const rim=place('harpoon',d=>d<=R&&d>R-1), core=place('harpoon',d=>d<R-1.2);
    out.tallow={base,with:T.lampBase(),rim:rim&&T.sunCd(rim),core:core&&T.sunCd(core)};

    /* 2. Oil Reserve: oil past the brim spills (8 at most), and in a wave the spill burns under the foremost creature in the light */
    T=fresh('lamplighter'); T.addRelic('reserve'); const s0=T.run.spill; T.gainOil(3); const s1=T.run.spill; T.addOil(9); const s2=T.run.spill;
    holdWave(); const e2=near('behemoth',2); const hp=e2.hp; pass(1.1);
    out.reserve={oilMax:T.run.oilMax,s0,s1,s2,after:T.run.spill,pool:T.F.pools.some(q=>q.spill),burnt:hp-e2.hp};

    /* 3. Whetted Barbs: three barbs at most, each a slow; on death they tear into the nearest seen creature for half */
    T=fresh('lamplighter',['whetted']); const h=place('harpoon');
    const a=near('behemoth',6), o=near('crawler',5.5); T.update(.001);
    for(let i=0;i<4;i++)T.struck(h,a,20);
    const boss=near('boss',8); T.struck(h,boss,20);
    const nb=a.barbs, before=T.F.shots.length; T.killFoe(a);
    const torn=T.F.shots.slice(before);
    out.barbs={n:nb,left:a.barbs,dmg:a.barbDmg,boss:boss.barbs||0,torn:torn.length,to:torn.every(s=>s.tg===o),each:torn[0]&&torn[0].dmg};

    /* 4. Salt Flats: two circles within 2.5 tiles salt the path between them, and refilling one refills both */
    T=fresh('lamplighter',['saltflats']); const P=T.F.paths[0]; let pair=null;
    for(let d=2;d<P.len-4&&!pair;d++){const q0=T.posAt(P,d), q1=T.posAt(P,d+2), c0=[Math.floor(q0[0]),Math.floor(q0[1])], c1=[Math.floor(q1[0]),Math.floor(q1[1])];
      const mid=T.posAt(P,d+1), cm=Math.floor(mid[0])+','+Math.floor(mid[1]);
      if(T.placeProblem({kind:'ward',type:'salt'},...c0)!==''||T.placeProblem({kind:'ward',type:'salt'},...c1)!=='')continue;
      if(Math.hypot(c1[0]-c0[0],c1[1]-c0[1])>2.4||cm===c0.join()||cm===c1.join())continue;
      if((c0[0]===c1[0])||(c0[1]===c1[1]))pair={c0,c1,cm};}
    T.setSel({kind:'ward',type:'salt'}); T.tryPlace(...pair.c0); T.setSel({kind:'ward',type:'salt'}); T.tryPlace(...pair.c1); T.setSel(null);
    const sa=T.F.towers.filter(t=>t.type==='salt'); T.bridgeSync();
    const mid=T.saltAt(pair.cm);
    sa[0].dur=3; sa[1].dur=3; T.refillSalt(sa[0]);
    out.salt={cost:T.wardCost('salt'),bridge:T.F.bridge?T.F.bridge.size:0,mid:!!mid&&sa.includes(mid),durs:sa.map(t=>t.dur)};

    /* 5. Quiet Mind: ten quiet seconds of a wave and madness counts 3 lower, the next build is cheaper, and acting ends it */
    T=fresh('lamplighter',['quiet']); holdWave(); const t0=T.tiers(); const c0=T.wardCost('harpoon'); pass(10.3);
    const still=T.stillNow(), t1=T.tiers(), c1=T.wardCost('harpoon'), b0=T.branchState(T.F.lamp,0).cost;
    place('harpoon'); const after=T.stillNow(), spent=T.F.towers[T.F.towers.length-1].invested;
    T.quietAct(); pass(5); T.castRite('pillar'); pass(6); const rite=T.stillNow();
    out.quiet={still,t0,t1,c0,c1,b0,after,spent,rite};

    /* 6. Sealing Wax: the striking ward nearest the lamp, one more per horror; each lowers madness, marks what it hits; unsellable, slower */
    T=fresh('occultist',['wax']); const gn=place('gnasher',null,'horror'); const w1=place('harpoon',d=>d<2.6), w2=place('harpoon',d=>d>3.5);
    const m0=T.madness(); T.F.wave=0; T.startWave(); const sealed=T.F.towers.filter(t=>t.sealed);
    const ce=near('behemoth',6); T.update(.001); T.struck(sealed[0],ce,10); const hp0=ce.hp; T.hurt(ce,10);
    const n0=T.F.towers.length; T.sellTower(sealed[0]);
    out.wax={n:sealed.length,nearest:sealed.includes(w1),m0,m1:T.madness(),mark:ce.waxT,dealt:hp0-ce.hp,kept:T.F.towers.length===n0,cd:T.sunCd(sealed[0]),horror:!!gn};

    /* 7. Bounty of the Deep: the far half of the path pays 40% more, the near half 25% less */
    const pay=(rel,where)=>{const T=fresh('lamplighter',rel); T.F.phase='wave'; const P=T.F.paths[0]; const e=where==='far'?far('behemoth',2):near('behemoth',3); const e0=T.run.ess; T.killFoe(e); return T.run.ess-e0;};
    out.bounty={base:pay([],'far'),far:pay(['bounty'],'far'),near:pay(['bounty'],'near')};

    /* 8. Ossuary Key: bone credit at the merchant, and debts collected near the lamp for two waves */
    T=fresh('lamplighter',['key']); T.run.ess=10; T.F.wave=T.F.def.waves.length; T.F.phase='cleared'; T.openDraft(0,0); const dr=T.draft; dr.step='fork'; dr.doors=[{room:'merchant',omen:null}]; T.chooseDoor(dr,0);
    dr.room.stock=[{kind:'oil',key:'oil',cost:30},{kind:'oil',key:'oil',cost:30}];
    T.buyStock(dr,0); const debt=T.run.ess, left=T.run.keyLeft; T.buyStock(dr,1); const second=T.run.ess;
    T.descend(); const tolled=T.run.ess;
    T=fresh('lamplighter',['key']); T.F.phase='wave'; T.run.keyLeft=2; let e8=near('behemoth',1.5); let x0=T.run.ess; T.killFoe(e8); const close=T.run.ess-x0;
    T.run.keyLeft=0; e8=near('behemoth',1.5); x0=T.run.ess; T.killFoe(e8); const plain=T.run.ess-x0;
    T.run.keyLeft=2; T.F.phase='wave'; T.F.queue=[]; T.waveCleared&&T.waveCleared();
    out.key={credit:T.keyCredit(),debt,left,second,tolled,close,plain,after:T.run.keyLeft};

    /* 9. Leech Jar: only blood that runs slow feeds it; at 8 it bursts for 1 oil and bleeds what stands in the light */
    T=fresh('lamplighter',['leech']); T.run.oil=12; T.F.phase='wave';
    const free=near('crawler',3); T.update(.001); T.killFoe(free); const fed0=T.run.leech||0;
    T.run.leech=7; const held=near('crawler',3), by=near('crawler',2.5); T.update(.001); held.stunT=1; T.killFoe(held);
    out.leech={fed0,leech:T.run.leech,oil:T.run.oil,bleed:by.leechT};

    /* 10. Thunder Marrow: a stun leaps to the nearest striking ward within 2.5 tiles: it fires at once and hits harder, every 3 seconds */
    T=fresh('lamplighter',['marrow']); T.run.wards.push('chime');
    const ch=place('chime',d=>d<3), hh=place('harpoon',d=>d<3); T.F.towers.forEach(t=>t.cd=5);
    const st=T.spawnFoe('crawler',0,1); st.x=(ch.x+hh.x)/2; st.y=(ch.y+hh.y)/2;
    const m1=T.wardMul(hh); T.thunder(ch,st); const cd1=hh.cd, m2=T.wardMul(hh); hh.cd=5; T.thunder(ch,st); const cd2=hh.cd;
    out.marrow={dist:Math.hypot(hh.x-st.x,hh.y-st.y),cd1,cd2,boost:m2/m1,needs:T.RELICS.marrow.needs};

    /* 11. Dead Reckoning: the lamp is 1.5 smaller; a ward beyond its own light hits 25% harder (and reaches 40% farther) */
    T=fresh('lamplighter'); const lb=T.lampBase(); T.addRelic('witchsalt'); const lr=T.lampRadius();
    const out1=place('harpoon',d=>d>lr+.6), in1=place('harpoon',d=>d<lr-.6);
    out.reckon={drop:lb-T.lampBase(),out:out1&&T.reckoned(out1),in:in1&&T.reckoned(in1),mul:out1&&T.wardMul(out1)/T.wardMul(in1),curse:!!T.RELICS.witchsalt.curse};
    /* 12. Choir in the Walls: no madness; a horror fielded under it leaves the roster when recalled or carried to the stair. One fielded before it stays */
    T=fresh('occultist'); T.run.roster={gnasher:2,watcher:1,wretch:1};
    const pre=place('wretch',null,'horror'); T.addRelic('choirwalls');
    const g1=place("gnasher",null,"horror"); place("gnasher",null,"horror"); place("watcher",null,"horror");
    const mad=T.madness(); T.sellTower(g1); const afterRecall=T.run.roster.gnasher;
    T.checkpoint(); const savedSung=JSON.parse(localStorage.getItem(Object.keys(localStorage).find(k=>k.endsWith('ll-save-v2')))||'{}').towers;
    T.F.draft={done:false,salvage:0}; T.descend();
    out.choir={mad,afterRecall,gnasher:T.run.roster.gnasher,watcher:T.run.roster.watcher,wretch:T.run.roster.wretch,pre:!!(pre&&!pre.sung),
      sungSaved:Array.isArray(savedSung)?savedSung.filter(t=>t.sung).length:-1,tip:!!T.TIPS.r_choir};
    /* every relic's first-time tip can be asked, and shows somewhere, with all eleven carried mid-wave */
    T=fresh('lamplighter',['tallow','reserve','whetted','saltflats','quiet','wax','bounty','key','leech','marrow','witchsalt','choirwalls']); T.forceUI();
    out.tips={}; for(const k of Object.keys(T.TIPS).filter(k=>k.startsWith('r_'))){let w, tg; try{w=!!T.TIPS[k].when(); tg=w?!!T.TIPS[k].target():null;}catch(e){w='threw '+e.message;} out.tips[k]=[w,tg];}
    window.devNoDark=false;
    return out;});
  console.log(JSON.stringify(r));
  const near1=(a,b)=>Math.abs(a-b)<1e-6;
  ok(r.tallow.base===r.tallow.with,'Tallow of Saints no longer widens the lamp',r.tallow);
  ok(near1(r.tallow.rim,.8)&&near1(r.tallow.core,1),'Tallow of Saints: wards on the edge fire 25% faster, the core does not',r.tallow);
  ok(r.reserve.oilMax===20&&r.reserve.s0===4&&r.reserve.s1===7&&r.reserve.s2===8,'Oil Reserve: oil past the brim spills, 8 at most',r.reserve);
  ok(r.reserve.pool&&r.reserve.after>=7.19&&r.reserve.after<=7.61&&r.reserve.burnt>0,'Oil Reserve: a wave burns the spill under the foremost creature',r.reserve);
  ok(r.barbs.n===3&&r.barbs.dmg===20&&r.barbs.boss===0,'Whetted Barbs: three barbs at most, never in a boss',r.barbs);
  ok(r.barbs.torn===3&&r.barbs.to&&r.barbs.each===10,'Whetted Barbs: on death each barb tears into the nearest for half',r.barbs);
  ok(r.salt.cost===20&&r.salt.bridge>0&&r.salt.mid,'Salt Flats: two circles bridge the path between them',r.salt);
  ok(r.salt.durs.every(d=>d===14),'Salt Flats: refilling one refills both',r.salt);
  ok(r.quiet.still&&r.quiet.t1[0]===r.quiet.t0[0]+3,'Quiet Mind: still after ten seconds, madness counts 3 lower',r.quiet);
  ok(r.quiet.c0===40&&r.quiet.c1===28&&r.quiet.spent===28&&r.quiet.b0<40,'Quiet Mind: the next ward or upgrade costs 30% less',r.quiet);
  ok(!r.quiet.after&&!r.quiet.rite,'Quiet Mind: building or a rite ends stillness',r.quiet);
  ok(r.wax.n===2&&r.wax.nearest,'Sealing Wax: the nearest striking ward and one more per horror are sealed',r.wax);
  ok(r.wax.m1===r.wax.m0-2&&r.wax.mark===4&&near1(r.wax.dealt,12.5)&&r.wax.kept&&near1(r.wax.cd,1/.7),'Sealing Wax: madness −1 each, a 25% mark, unsellable, 30% slower',r.wax);
  ok(r.bounty.far===Math.round(35*.9*1.4)&&r.bounty.near===Math.round(35*.9*.75)&&r.bounty.base===Math.round(35*.9),'Bounty of the Deep: far half +40%, near half −25%',r.bounty);
  ok(r.key.credit===25&&r.key.debt===-20&&r.key.left===2&&r.key.second===-20,'Ossuary Key: bone credit to −25, never past it',r.key);
  ok(r.key.tolled===-20||r.key.tolled===90,'Ossuary Key: the stair\'s toll leaves a debt alone; the next purse pays it',r.key);
  ok(r.key.close===r.key.plain+3&&r.key.after===1,'Ossuary Key: kills near the lamp pay 3 more for two waves',r.key);
  ok(r.leech.fed0===0&&r.leech.leech===0&&r.leech.oil===13&&r.leech.bleed===3,'Leech Jar: only slow blood feeds it; at 8 it bursts for 1 oil and a bleed',r.leech);
  ok(r.marrow.dist<=2.5&&r.marrow.cd1===0&&r.marrow.cd2===5&&near1(r.marrow.boost,1.25),'Thunder Marrow: the nearest striking ward fires at once, 25% harder, every 3 seconds',r.marrow);
  ok(near1(r.reckon.drop,1.5)&&r.reckon.out&&!r.reckon.in&&near1(r.reckon.mul,1.25)&&r.reckon.curse,'Dead Reckoning: a smaller lamp; wards beyond it hit harder',r.reckon);
  ok(r.choir.mad===0,'Choir in the Walls: fielded horrors cost no madness',r.choir);
  ok(r.choir.afterRecall===1&&r.choir.gnasher===0&&r.choir.watcher===0,'Choir in the Walls: recalled or carried to the stair, a horror goes into the walls',r.choir);
  ok(r.choir.pre&&r.choir.wretch===1,'Choir in the Walls: a horror fielded before you held it is kept',r.choir);
  ok(r.choir.sungSaved===2,'Choir in the Walls: a save remembers which horrors are sung',r.choir);
  ok(Object.keys(r.tips).length===12&&Object.values(r.tips).every(([w])=>typeof w==='boolean'),'every relic tip can be asked without error',r.tips);
  ok(!errs.length,'no page errors',errs);
  fails.forEach(f=>console.log('FAIL '+f)); await b.close(); process.exitCode=fails.length?1:0;
})();
