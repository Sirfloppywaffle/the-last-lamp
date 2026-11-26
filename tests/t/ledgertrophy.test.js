// The Ledger's trophies (Expansion 5, step 3; expansion/EXPANSION5_RUNBOOK.md §5). Five more trophies for the Lodge: one per Herald,
// earned by its death as a boss's is (but never on a replayed stair, and its banner waits for the wave's break), and two for the
// Ledger's feats (every kind of horror bound, morning at depth 5), earned when the feat is claimed at the lectern. A trophy without a
// creature shows its feat on its card and its lock. An old town is given only what its Ledger proves. Developer mode writes nothing.
const {chromium}=require('playwright');
const fails=[]; const ok=(c,m,d)=>{if(!c)fails.push(m+(d!==undefined?' '+JSON.stringify(d).slice(0,600):''));};
(async()=>{
  const b=await chromium.launch(); const p=await b.newPage({viewport:{width:412,height:860}});
  const errs=[]; p.on('pageerror',e=>errs.push(String(e)));
  await p.goto('file://'+process.argv[2]); await p.waitForTimeout(400);
  await p.evaluate(()=>{
    window.__clean=()=>{for(const k of ['ll-town','ll-meta','ll-codex','ll-save-v2','ll-best'])localStorage.removeItem(k); __t.townReset(); __t.setDev(false);};
    window.__fresh=(o)=>{const T=__t; T.newRun('lamplighter',0,Object.assign({seed:7},o||{})); T.run.floor=1; T.beginFloor(null); T.setP(false);};
    window.__herald=type=>__t.killFoe({dead:false,hp:0,x:2,y:2,gate:0,d:1,type,def:Object.assign({},__t.FOES[type])});
    window.__saved=()=>(JSON.parse(localStorage.getItem('ll-town')||'{}').trophies||[]).slice().sort().join();
  });

  /* 0. the five rows: trophies, one of each kind, their art 16 wide on PX letters, a line each; three by a Herald, two by a feat */
  const rows=await p.evaluate(()=>{const T=__t, I=T.LODGE_ITEMS, ids=['sack','clapper','snuffed','sixeyes','shard'];
    return ids.map(k=>{const R=T.LODGE_ROWS[k]&&T.LODGE_ROWS[k][0];
      return {k,trophy:I[k].k==='trophy'&&I[k].set==='trophy'&&I[k].faces===1&&!Object.keys(I[k].cost).length&&T.TROPHY_KEYS.includes(k),
        by:I[k].foe||I[k].feat, art:!!R&&R.every(r=>r.length===R[0].length)&&R[0].length<=16&&R.length<=26&&R.join('').split('').every(ch=>ch==='.'||T.PX[ch]),
        text:!!T.TROPHY_TEXT[k], feat:!I[k].feat||T.LEDGER_FEATS.some(f=>f.id===I[k].feat)};});});
  for(const r of rows)ok(r.trophy&&r.art&&r.text&&r.feat,'the '+r.k+' trophy is a trophy row with its art and its line',r);
  ok(rows.map(r=>r.by).join()==='tithetaker,bellfather,lastkeeper,horrors,d5','one per Herald, and the horrors and depth-5 feats',rows.map(r=>r.by));

  /* 1. each Herald's death earns its trophy, once, and it comes up with the haul */
  const her=await p.evaluate(()=>{const T=__t, o={}; __clean(); __fresh();
    const bn=document.getElementById('trophyBanner');
    bn.classList.remove('is-show'); __herald('tithetaker'); o.first=[(T.run.trophies||[]).join(),bn.classList.contains('is-show'),document.getElementById('trophyBannerS').textContent];
    __herald('tithetaker'); o.twice=(T.run.trophies||[]).join();
    __herald('bellfather'); __herald('lastkeeper'); o.all=(T.run.trophies||[]).slice().sort().join();
    T.haulCredit(T.run); o.town=(T.townData().trophies||[]).slice().sort().join(); o.saved=__saved();
    /* a later descent: already in the Lodge, so no banner and nothing new */
    __fresh(); bn.classList.remove('is-show'); __herald('bellfather'); o.again=bn.classList.contains('is-show');
    return o;});
  ok(her.first[0]==='sack'&&her.first[1]&&her.first[2]==='The Tithe-taker’s Sack','the Tithe-taker slain earns its sack, with the trophy banner between waves',her.first);
  ok(her.twice==='sack','a second Tithe-taker earns nothing more',her.twice);
  ok(her.all==='clapper,sack,snuffed'&&her.town===her.all&&her.saved===her.all,'each Herald earns its own, carried up with the haul',her);
  ok(!her.again,'one already in the Lodge shows no banner',her.again);

  /* 2. slain mid-wave, its banner waits for the wave's break, and tells the Ledger's feat with it */
  const mid=await p.evaluate(()=>{const T=__t, o={}; __clean(); __fresh(); const bn=document.getElementById('trophyBanner');
    T.F.phase='wave'; T.F.wave=1; bn.classList.remove('is-show');
    __herald('bellfather'); o.during=[bn.classList.contains('is-show'),(T.run.trophies||[]).join()];
    T.F.foes.length=0; T.F.queue=[]; T.waveCleared();
    o.broke=[bn.classList.contains('is-show'),document.getElementById('trophyBannerS').textContent,document.getElementById('trophyBannerB').textContent];
    o.later=T.F.trophyLater||null;
    return o;});
  ok(!mid.during[0]&&mid.during[1]==='clapper','slain mid-wave: earned, but no banner until the break',mid.during);
  ok(mid.broke[0]&&mid.broke[1]==='The Bellfather’s Clapper'&&/^A trophy for the Lodge, and a feat fulfilled$/.test(mid.broke[2])&&mid.later===null,'at the break, its banner, telling the feat beside it',mid.broke);

  /* 3. a replayed stair earns no Herald's trophy (a boss's is as it always was) */
  const rep=await p.evaluate(()=>{const T=__t; __clean(); __fresh({replay:true}); __herald('tithetaker'); __herald('bellfather'); __herald('lastkeeper'); return (T.run.trophies||[]).join();});
  ok(rep==='','a replayed stair earns no Herald trophy',rep);

  /* 4. the feat trophies come with their feats, when claimed at the Ledger */
  const feat=await p.evaluate(()=>{const T=__t, o={}; __clean();
    const D=T.townData(); D.lodge.built=true; T.townSave();
    o.pay=[T.featPay(T.LEDGER_FEATS.find(f=>f.id==='horrors')),T.featPay(T.LEDGER_FEATS.find(f=>f.id==='d5')),T.featPay(T.LEDGER_FEATS.find(f=>f.id==='cistern'))];
    /* the death screen's line names the trophy beside the pay */
    __fresh(); T.run.morning=true; T.run.depth=5; const dn=T.townData().ledger.done, pre=['morning','k_lamplighter','d1','d3','lodge'];
    for(const k of pre)dn[k]='x'; o.line=T.ledgerLine(T.run).replace(/<[^>]+>/g,' '); for(const k of pre)delete dn[k];
    const D2=T.townData();
    T.ledgerMark(D2,T.LEDGER_FEATS.filter(f=>['horrors','d5','cistern'].includes(f.id))); T.townSave();
    o.before=(T.townData().trophies||[]).join(); o.lock=T.lodgeLockWhy('sixeyes');
    o.cistern=T.ledgerClaim('cistern').map(g=>g.trophy||'').join(); o.afterCistern=(T.townData().trophies||[]).join();
    const bn=document.getElementById('trophyBanner'); bn.classList.remove('is-show');
    const r0=Object.assign({},T.townData().res);
    const got=T.ledgerClaim('feats'); const r1=T.townData().res; o.paid=['timber','iron','tallow','curios'].map(k=>r1[k]-r0[k]).join(); o.got=got.map(g=>g.id+':'+(g.trophy||'')).sort().join();
    o.town=(T.townData().trophies||[]).slice().sort().join(); o.saved=__saved(); o.banner=[bn.classList.contains('is-show'),document.getElementById('trophyBannerB').textContent];
    o.lock2=T.lodgeLockWhy('sixeyes');
    /* the card says so after a claim */
    T.ledgerMark(T.townData(),[]); T.ledgerCard('feats');
    return o;});
  ok(/, and a trophy for the Lodge$/.test(feat.pay[0])&&/, and a trophy for the Lodge$/.test(feat.pay[1])&&!/trophy/.test(feat.pay[2]),'the two feats pay a trophy beside their materials',feat.pay);
  ok(feat.before===''&&/^Bind every kind of horror, and claim it at the Ledger/.test(feat.lock),'fulfilled, not claimed: no trophy yet, and its lock says what earns it',feat);
  ok(/See morning at depth 5\. .*and a trophy for the Lodge/.test(feat.line),'the morning screen names the trophy',feat.line);
  ok(feat.cistern===''&&feat.afterCistern==='','a feat without one gives none',feat);
  ok(feat.paid==='0,50,40,3','the claim pays the two feats\' materials once (30 iron and a curio; 40 tallow, 20 iron, 2 curios)',feat.paid);
  ok(feat.got==='d5:shard,horrors:sixeyes'&&feat.town==='shard,sixeyes'&&feat.saved==='shard,sixeyes','claimed, each gives its trophy, saved',feat);
  ok(feat.banner[0]&&feat.banner[1]==='A trophy for the Lodge','claiming shows the trophy banner in Saltmouth',feat.banner);
  ok(feat.lock2==='','claimed, it is no longer locked',feat.lock2);

  /* 5. a trophy card without a creature shows its feat; a Herald's shows its Grimoire line */
  const card=await p.evaluate(()=>{const T=__t, o={};
    T.lodgeTrophyCard({id:'sixeyes'}); o.eyes=document.getElementById('mBody').textContent; T.closeModal();
    T.lodgeTrophyCard({id:'shard'}); o.shard=document.getElementById('mBody').textContent; T.closeModal();
    T.lodgeTrophyCard({id:'clapper'}); o.clap=document.getElementById('mBody').textContent; T.closeModal();
    __clean(); o.lock=T.lodgeLockWhy('sack');
    return o;});
  ok(/Earned in the Ledger: Bind every kind of horror\./.test(card.eyes)&&/shadow box/.test(card.eyes),'the six eyes\' card shows its feat',card.eyes);
  ok(/Earned in the Ledger: See morning at depth 5\./.test(card.shard),'the shard\'s card shows its feat',card.shard);
  ok(/The Grimoire, The Bellfather:/.test(card.clap),'a Herald\'s card shows its Grimoire line',card.clap);
  ok(/^Slay the Tithe-taker on the stair/.test(card.lock),'a Herald\'s lock names it',card.lock);

  /* 6. an old town: given only what its Ledger proves (a feat claimed before its trophy came; a Herald's feat fulfilled), never from
     ll-best alone */
  const old=await p.evaluate(()=>{const T=__t, o={}; __clean();
    localStorage.setItem('ll-best',JSON.stringify({floor:5,wins:1}));
    localStorage.setItem('ll-town',JSON.stringify({v:2,res:{timber:0,iron:0,tallow:0,curios:0},lodge:{built:true},
      ledger:{done:{horrors:'2026-11-20',h_bellfather:'2026-11-21',d5:'2026-11-21'},claimed:{horrors:'2026-11-22'}}}));
    T.townReset(); o.proved=(T.townData().trophies||[]).slice().sort().join();
    __clean(); localStorage.setItem('ll-best',JSON.stringify({floor:5,wins:1})); localStorage.setItem('ll-town',JSON.stringify({v:2,res:{timber:0,iron:0,tallow:0,curios:0}}));
    T.townReset(); o.none=(T.townData().trophies||[]).slice().sort().join();
    return o;});
  ok(old.proved.split(',').includes('sixeyes')&&old.proved.split(',').includes('clapper')&&!old.proved.split(',').includes('shard')&&!old.proved.split(',').includes('sack'),'an old town gets the trophies its Ledger proves, and no more',old.proved);
  ok(['sack','clapper','snuffed','sixeyes','shard'].every(k=>!old.none.split(',').includes(k)),'an old town without a Ledger gets none of the new ones',old.none);

  /* 7. the new trophies hang and stand in the Lodge: mounts on the wall, the lamp and the jar on the floor */
  const hang=await p.evaluate(()=>{const T=__t; __clean(); T.setDev(true); const D=T.townData(); D.lodge.built=true; T.townOpen(); T.lodgeEnter();
    const o={sack:T.lodgeCanPlace('sack',3,0),clapper:T.lodgeCanPlace('clapper',4,0),sixeyes:T.lodgeCanPlace('sixeyes',5,0),snuffed:T.lodgeCanPlace('snuffed',2,6),shard:T.lodgeCanPlace('shard',8,6)};
    T.townClose(); T.setDev(false); return o;});
  ok(Object.values(hang).every(v=>v===''),'each can be set down in the Lodge (developer mode)',hang);

  /* 8. developer mode: everything shows, nothing is written */
  const dev=await p.evaluate(()=>{const T=__t, o={}; __clean(); T.setDev(true);
    o.earned=['sack','clapper','snuffed','sixeyes','shard'].every(k=>T.trophyEarned(k));
    __fresh(); __herald('tithetaker'); T.haulCredit(T.run);
    const D=T.townData(); D.lodge.built=true; T.ledgerMark(D,T.LEDGER_FEATS.filter(f=>f.id==='horrors')); T.ledgerClaim('horrors');
    o.town=localStorage.getItem('ll-town'); T.setDev(false); return o;});
  ok(dev.earned&&dev.town===null,'developer mode shows them all and writes no town',dev);

  await p.waitForTimeout(5300);
  ok(!errs.length,'no page errors',errs);
  for(const f of fails)console.log('FAIL '+f);
  if(fails.length)process.exitCode=1; else console.log('ledgertrophy: all ok');
  await b.close();
})();
