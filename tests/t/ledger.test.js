// The Keeper's Ledger (Expansion 5, step 1; expansion/EXPANSION5_RUNBOOK.md §5): a lectern in the Lodge, one of a kind like the
// Grimoire. A feat done is fulfilled when the haul comes up (or, for the town's and the Grimoire's, as soon as the town sees it), told
// by a gold banner between waves, and paid once when it is claimed at the lectern, as Hades' Fated List (Criss, 26 Nov 2026). Each feat fires from its source (a Herald slain, a
// floor cleared with the lamp untouched, a wave broken at Leaning, a Trial passed, a descent walked, the Grimoire and the town);
// each pays once, across a reload of the death screen; a replayed stair pays no run feat; mastery counts floors per Keeper and not
// on a replay; the lectern can't be salvaged, can be stored, and is put back if missing; an old ll-town, ll-meta and save load;
// developer mode writes nothing.
const {chromium}=require('playwright');
const fails=[]; const ok=(c,m,d)=>{if(!c)fails.push(m+(d!==undefined?' '+JSON.stringify(d).slice(0,600):''));};
(async()=>{
  const b=await chromium.launch(); const p=await b.newPage({viewport:{width:412,height:860}});
  const errs=[]; p.on('pageerror',e=>errs.push(String(e)));
  await p.goto('file://'+process.argv[2]); await p.waitForTimeout(400);
  await p.evaluate(()=>{
    window.__clean=()=>{for(const k of ['ll-town','ll-meta','ll-codex','ll-save-v2'])localStorage.removeItem(k); __t.townReset(); __t.setDev(false);};
    /* a fresh run on a floor, ready to act on */
    window.__fresh=(kit,fl,o)=>{const T=__t; T.newRun(kit||'lamplighter',(o&&o.depth)||0,Object.assign({seed:7},o||{})); T.run.floor=fl||0; T.beginFloor(null); T.setP(false); T.run.ess=9999;};
    window.__ids=list=>list.map(f=>f.id).sort().join();
  });

  /* 1. each feat fires from its source */
  const src=await p.evaluate(()=>{const T=__t, o={}; __clean();
    o.n=T.LEDGER_FEATS.length; o.groups=[...new Set(T.LEDGER_FEATS.map(f=>f.g))].every(g=>T.LEDGER_GROUPS[g]);
    o.pays=T.LEDGER_FEATS.every(f=>{const v=Object.values(f.pay), mat=Object.keys(f.pay).filter(k=>k!=='curios').reduce((a,k)=>a+f.pay[k],0); return v.length&&mat>=20&&mat<=60;});
    o.curios=T.LEDGER_FEATS.filter(f=>f.pay.curios).map(f=>f.id).sort().join();
    /* a fresh run that has done nothing owes nothing */
    __fresh(); o.none=__ids(T.ledgerDue(T.run));
    /* a Herald slain: its kind is kept */
    T.killFoe({dead:false,hp:0,x:2,y:2,gate:0,d:1,type:'bellfather',def:Object.assign({},T.FOES.bellfather)});
    o.herald=[T.run.heraldKinds.join(),__ids(T.ledgerDue(T.run))];
    /* a floor cleared with nothing reaching the lamp: untouched, and the Cistern cleared */
    __fresh(); T.floorCleared(); o.clean=[T.run.untouched,T.run.floorsClr,__ids(T.ledgerDue(T.run))];
    /* the same with the lamp hit: not untouched. Teeth in the Stair's first bite takes no oil, so it is not a hit */
    __fresh(); T.lampHit({def:{oil:1,r:.3},type:'crawler'}); T.floorCleared(); o.hit=[T.run.untouched,__ids(T.ledgerDue(T.run))];
    /* a wave broken at Leaning: madness past the third tier as it breaks */
    __fresh(); T.F.phase='wave'; T.F.wave=1; T.run.madPen=40;
    ['gnasher','watcher','wretch','shrieker','gnasher','watcher'].forEach((ty,i)=>T.F.towers.push({kind:'horror',type:ty,id:7000+i,c:0,r:i,x:.5,y:i+.5,br:{},cd:9,ang:0}));
    o.tier=T.madTier(); T.waveCleared(); o.lean=[T.run.leaned,T.ledgerDue(T.run).some(f=>f.id==='leaning')];
    __fresh(); T.F.phase='wave'; T.F.wave=1; T.waveCleared(); o.calm=T.run.leaned;
    /* the Keeper Below, morning, the Throat and the Heart, morning with a Keeper and at a depth */
    __fresh('whaler',4,{depth:3}); T.run.bosses=2; T.run.morning=true; o.win=__ids(T.ledgerDue(T.run));
    /* a Trial passed is kept for good in ll-meta, a kind once; all seven make the feat */
    __fresh(); T.run.trial='rationed'; T.beginFloor(null); T.floorCleared(); o.trial=T.meta.trialsPassed.join();
    __fresh(); T.run.trial='rationed'; T.beginFloor(null); T.floorCleared(); o.trialOnce=T.meta.trialsPassed.length;
    {const m=T.meta; m.trialsPassed=Object.keys(T.TRIALS); T.saveMeta(m);} o.trials=T.ledgerDue(null).some(f=>f.id==='trials');
    /* a descent walked is kept for good too */
    __fresh(null,1); T.DESC.active=true; T.DESC.k='carry'; T.run.descent={k:'carry'}; T.descentFinish({woke:0,spilt:0}); o.walked=T.meta.descentsWalked.join();
    {const m=T.meta; m.descentsWalked=Object.keys(T.DESCENTS); T.saveMeta(m);} o.descents=T.ledgerDue(null).some(f=>f.id==='descents');
    /* the Grimoire's three: every creature met, every relic found, every kind of horror bound */
    const C=T.codex(); for(const k in T.FOES)C.foes.add(k); for(const k in T.RELICS)C.relics.add(k); ['keeper','watcher','gnasher','wretch','shrieker','elite'].forEach(k=>C.bound.add(k));
    o.book=['foes','relics','horrors'].every(id=>T.ledgerDue(null).some(f=>f.id===id));
    C.foes.clear(); C.relics.clear(); C.bound.clear();
    /* the town's: the Lodge, workshops, shrines, souls (one freed on this very descent counts), the Hearth, five headstones */
    const D=T.townData(); D.lodge.built=true; D.buildings={brazier:1,quay:1,smithy:2,belfry:1,menagerie:1}; D.shrines={mother:true,mouths:true,sun:true};
    D.rescued=['croupier','toothmonger']; D.hearth={lv:T.HEARTH_MAX}; D.decos=[1,2,3,4,5].map(i=>({id:'stone',c:i,r:20}));
    __fresh(); T.run.rescued=['peddler'];
    o.town=__ids(T.ledgerDue(T.run).filter(f=>f.g==='town')); o.townNoRun=__ids(T.ledgerDue(null).filter(f=>f.g==='town'));
    return o;});
  ok(src.n===29&&src.groups,'29 feats, each in a group the card names',src);
  ok(src.pays,'each feat pays 20 to 60 in materials',src);
  ok(src.curios==='d5,foes,horrors,relics','curios only for the hardest four',src.curios);
  ok(src.none==='','a run that has done nothing owes nothing',src.none);
  ok(src.herald[0]==='bellfather'&&src.herald[1]==='h_bellfather','a Herald slain is kept by kind and makes its feat',src.herald);
  ok(src.clean[0]===1&&src.clean[1]===1&&src.clean[2]==='cistern,untouched','a floor cleared with the lamp untouched counts, and clears the Cistern',src.clean);
  ok(src.hit[0]===0&&src.hit[1]==='cistern','a lamp that lost oil on the floor is not untouched',src.hit);
  ok(src.tier===3&&src.lean[0]===true&&src.lean[1]&&src.calm===false,'a wave broken at Leaning counts; one broken calm does not',src);
  ok(src.win==='d1,d3,heart,k_whaler,keeper,morning,throat','morning at depth 3 with the Whaler: the stair, the Keeper and depths 1 and 3',src.win);
  ok(src.trial==='rationed'&&src.trialOnce===1&&src.trials,'a Trial passed is kept once in ll-meta; all of them make the feat',src);
  ok(src.walked==='carry'&&src.descents,'a descent walked is kept in ll-meta; all of them make the feat',src);
  ok(src.book,'the Grimoire filled makes its three feats',src.book);
  ok(src.town==='graves,hearth,lodge,shrines,souls,workshops'&&src.townNoRun==='graves,hearth,lodge,shrines,workshops','the town feats read ll-town; a soul freed on this descent counts with its haul',src);

  /* 2. fulfilled once, in the haul's own write; the death screen says it in gold; nothing is paid until it is claimed at the
     lectern, once; a reload of the death screen fulfils nothing more */
  const pay=await p.evaluate(()=>{const T=__t, o={}; __clean();
    __fresh(); T.floorCleared(); T.killFoe({dead:false,hp:0,x:2,y:2,gate:0,d:1,type:'tithetaker',def:Object.assign({},T.FOES.tithetaker)});
    T.F.phase='wave'; T.F.wave=1; T.checkpoint();
    o.line=T.ledgerLine(T.run);
    const res0=JSON.stringify(T.townData().res);
    T.run.oil=0; T.defeat();
    const D=JSON.parse(localStorage.getItem('ll-town')||'{}');
    o.done=Object.keys((D.ledger||{}).done||{}).sort().join(); o.claimed0=Object.keys((D.ledger||{}).claimed||{}).length; o.res=D.res;
    o.day=/^\d{4}-\d\d-\d\d$/.test(((D.ledger||{}).done||{}).cistern||'');
    o.save=localStorage.getItem('ll-save-v2');
    /* a reload: the town is read again; nothing is fulfilled twice, and crediting the run again does nothing */
    T.townReset(); o.again=T.ledgerDue(null).length; o.twice=T.haulCredit(T.run);
    o.waiting=T.ledgerWaiting().map(f=>f.id).sort().join();
    /* claimed one at a time, then the rest at once; each pays once */
    const r0=Object.assign({},T.townData().res);
    o.c1=T.ledgerClaim('cistern').map(f=>f.id).join(); o.c1b=T.ledgerClaim('cistern').length;
    o.t1=T.townData().res.timber-r0.timber;
    o.call=T.ledgerClaim(null).map(f=>f.id).sort().join(); o.call2=T.ledgerClaim(null).length;
    const r1=T.townData().res; o.paid=[r1.timber-r0.timber,r1.iron-r0.iron,r1.tallow-r0.tallow];
    T.townReset(); o.saved=Object.keys(T.townData().ledger.claimed).sort().join(); o.waitAfter=T.ledgerWaiting().length;
    /* four feats or more: three lines, then how many more */
    __fresh('lamplighter',4); T.run.bosses=2; T.run.morning=true; T.run.untouched=1; o.many=T.ledgerLine(T.run);
    return o;});
  ok(/Feats fulfilled/.test(pay.line)&&/>Clear the Cistern\. 20 timber\./.test(pay.line)&&/Slay the Tithe-taker\. 25 iron/.test(pay.line)&&/Claim them at the Ledger/.test(pay.line)&&/ledger-end/.test(pay.line),'the death screen names each feat in gold, and where to claim it',pay.line);
  ok(pay.done==='cistern,h_tithetaker,untouched'&&pay.day&&pay.claimed0===0,'the feats are marked fulfilled, with the date, and nothing is claimed',pay);
  ok(pay.res&&pay.res.timber===8&&pay.res.iron===13,'the haul pays only the haul: a feat waits to be claimed',pay.res);
  ok(!JSON.parse(pay.save),'the run is gone after the death screen',pay.save);
  ok(pay.again===0&&pay.twice===false,'a reload fulfils nothing again, and the run is never credited twice',pay);
  ok(pay.waiting==='cistern,h_tithetaker,untouched','all three wait at the Ledger',pay.waiting);
  ok(pay.c1==='cistern'&&pay.c1b===0&&pay.t1===20,'claimed one at a time: its pay, once',pay);
  ok(pay.call==='h_tithetaker,untouched'&&pay.call2===0&&pay.paid.join()==='20,25,25','Claim all takes the rest, once',pay);
  ok(pay.saved==='cistern,h_tithetaker,untouched'&&pay.waitAfter===0,'what is claimed is saved',pay);
  ok((pay.many.match(/ledger-end">[^<]*\. \d+ [a-z]/g)||[]).length===3&&/And (two|three|four|five|six) more in the Ledger\./.test(pay.many),'more than three: three lines, then how many more',pay.many);

  /* 2b. the moment: a gold banner between waves, never mid-wave; once a feat a run; none for what was fulfilled before the run;
     none on a replayed stair. A feat of the town is fulfilled, with its banner, as soon as the town sees it */
  const ban=await p.evaluate(()=>{const T=__t, o={}; __clean();
    const b=document.getElementById('trophyBanner'), shown=()=>{const v=b.classList.contains('is-show')&&b.classList.contains('is-ledger')?document.getElementById('trophyBannerS').textContent:''; b.classList.remove('is-show','is-ledger'); return v;};
    __fresh(); shown(); T.F.phase='wave'; T.F.wave=1;
    T.killFoe({dead:false,hp:0,x:2,y:2,gate:0,d:1,type:'bellfather',def:Object.assign({},T.FOES.bellfather)});
    T.ledgerWatch(); o.mid=shown();
    T.F.foes.length=0; T.F.queue=[]; T.waveCleared(); o.brk=[shown(),document.getElementById('trophyBannerB').textContent];
    T.F.phase='build'; T.ledgerWatch(); o.again=shown();
    /* what was fulfilled before the run began is not told again */
    T.townData().ledger={done:{},claimed:{}}; const C=T.codex(); for(const k of ['keeper','watcher','gnasher','wretch','shrieker','elite'])C.bound.add(k);
    __fresh(); o.seenAtStart=T.run.ledgerSeen.includes('horrors'); T.F.phase='build'; T.ledgerWatch(); o.old=shown(); C.bound.clear();
    __fresh('lamplighter',0,{replay:true}); T.floorCleared(); o.replay=shown();
    /* the town: the Hearth raised to its height in the square */
    __clean(); T.townOpen(); const D=T.townData(); D.hearth={lv:T.HEARTH_MAX}; T.townHud(); o.town=[shown(),T.townData().ledger.done.hearth!=null];
    T.townShowTip(); o.card=[T.TWN.card,document.getElementById('townCard').textContent];
    T.townClose();
    return o;});
  ok(ban.mid==='','no banner mid-wave',ban.mid);
  ok(ban.brk[0]==='Slay the Bellfather'&&ban.brk[1]==='A feat fulfilled'&&ban.again==='','as the wave breaks, a gold banner names the feat, once',ban);
  ok(ban.seenAtStart&&ban.old==='','a feat fulfilled before the run began is not told on it',ban);
  ok(ban.replay==='','a replayed stair tells none',ban.replay);
  ok(ban.town[0]==='Raise the Hearth Beacon to its height'&&ban.town[1],'a feat of the town is fulfilled the moment it is done, with its banner',ban.town);
  ok(ban.card[0]==='ledgerwait'&&/A feat waits in the Ledger/.test(ban.card[1]),'Saltmouth\'s card says a feat waits in the Ledger',ban.card);

  /* 3. a replayed stair counts no run feat (lifetime ones still pay), and no mastery or lifetime list */
  const rep=await p.evaluate(()=>{const T=__t, o={}; __clean();
    __fresh('lamplighter',0,{replay:true}); T.run.trial='rationed'; T.beginFloor(null); T.floorCleared(); T.run.bosses=1;
    o.due=__ids(T.ledgerDue(T.run)); o.meta=[T.meta.trialsPassed.length,JSON.stringify(T.meta.mastery)];
    T.haulCredit(T.run); o.done=Object.keys(T.townData().ledger.done).join();
    return o;});
  ok(rep.due===''&&rep.done==='','a replayed stair pays no run feat',rep);
  ok(rep.meta[0]===0&&rep.meta[1]==='{}','a replayed stair keeps no Trial and no mastery',rep.meta);

  /* 4. mastery: one a floor cleared, by Keeper; once a floor even if the page reloads before the landing saves */
  const mas=await p.evaluate(()=>{const T=__t, o={}; __clean();
    __fresh('whaler',0); T.floorCleared(); T.run.floor=1; T.beginFloor(null); T.floorCleared();
    __fresh('lamplighter',0,{seed:11}); T.floorCleared(); T.floorCleared();
    o.m=JSON.stringify(T.meta.mastery);
    T.setDev(true); __fresh('lamplighter',0,{seed:12}); T.floorCleared(); T.setDev(false); o.dev=JSON.stringify(T.meta.mastery);
    return o;});
  ok(mas.m==='{"whaler":2,"lamplighter":1}','mastery counts floors cleared with each Keeper, once a floor',mas.m);
  ok(mas.dev===mas.m,'developer mode counts no mastery',mas.dev);

  /* 5. the lectern: one of a kind, stored but never salvaged, put back if missing; its card and its motes */
  const lec=await p.evaluate(()=>{const T=__t, o={}; __clean();
    localStorage.setItem('ll-town',JSON.stringify({v:2,visits:2,lodge:{built:true,furn:[{id:'grimoire',c:4,r:2}]}})); T.townReset();
    const L=()=>T.lodgeRoom(T.townData(),'main'), led=()=>L().furn.find(d=>d.id==='ledger');
    o.placed=led()?[led().c,led().r]:null; o.one=T.LODGE_ITEMS.ledger.one&&T.LODGE_ITEMS.grimoire.one;
    T.townOpen(); T.lodgeEnter(); T.lodgeSync();
    /* never on the tray */
    T.townBuildSet(true); T.TWN.tab='pieces'; T.townTrayUI(); o.chip=!!document.querySelector('#townTrow [data-lodge="ledger"]');
    /* lifted: Salvage refuses and names it */
    T.bldLift(led()); T.townTrayUI(); o.scrapOff=document.getElementById('townScrap').disabled; o.scrap=T.bldScrap(); o.say=(document.getElementById('townTmsg')||{}).textContent||'';
    o.stillHeld=!!T.TWN.lift; T.bldStow(); o.stored=T.townData().store.filter(e=>e.id==='ledger').length; o.gone=!led();
    o.salv=T.bldSalvage('ledger'); o.stillStored=T.townData().store.filter(e=>e.id==='ledger').length;
    /* a second can't be set down while one waits in Storage */
    o.second=T.lodgeCanPlace('ledger',6,5);
    T.townBuildSet(false);
    /* missing altogether (a broken save): put back beside the Grimoire */
    const raw=JSON.parse(JSON.stringify(T.townData())); raw.store=raw.store.filter(e=>e.id!=='ledger'); raw.lodge.furn=raw.lodge.furn.filter(d=>d.id!=='ledger');
    const f=T.townFix(raw), lf=f.lodge.furn.find(d=>d.id==='ledger'); o.back=lf?Math.abs(lf.c-4)+Math.abs(lf.r-2):-1;
    /* two in a save: one is kept */
    const two=T.townFix({v:2,lodge:{built:true,furn:[{id:'grimoire',c:4,r:2},{id:'ledger',c:6,r:5},{id:'ledger',c:2,r:6}]}}); o.two=two.lodge.furn.filter(d=>d.id==='ledger').length+two.store.filter(e=>e.id==='ledger').length;
    /* a Lodge with no room left near the book: it waits in Storage */
    o.noLodge=T.townFix({v:2}).lodge.furn.length;
    /* walled off: refused, and the line names both books */
    /* walled off: refused, and the line names the book it would cut off (the Ledger in the corner, two shelves beside it) */
    o.wall=(()=>{const D=T.townData(); D.store=D.store.filter(e=>e.id!=='ledger'); D.lodge.furn=[{id:'grimoire',c:4,r:2},{id:'ledger',c:8,r:2},{id:'shelf',c:7,r:2},{id:'shelf',c:8,r:3}]; T.lodgeSync(); T.TWN.p.x=5; T.TWN.p.y=8.4;
      const w=T.lodgeFits('shelf',7,3,null,null,0); D.lodge.furn=[{id:'grimoire',c:4,r:2},{id:'ledger',c:5,r:2}]; T.lodgeSync(); return w;})();
    /* the card: tap it outside Build; its tabs; feats to come as ??? until their group has one done */
    const D=T.townData(); D.ledger={done:{cistern:'2026-11-20',keeper:'2026-11-21'},claimed:{cistern:'2026-11-21'}}; T.lodgeSync(); T.TWN.p.x=5.5; T.TWN.p.y=3.6; T.lodgeArt();
    o.calls=T.LODGE_ART.em.some(e=>e.fl&&e.fl[0]===T.ledgerCall()[0]);
    o.near=T.townNearAct(); o.label=T.townActLabel(o.near);
    document.getElementById('townAct').hidden=false; T.townStep(0.016); document.getElementById('townAct').click();
    o.title=document.getElementById('mTitle').textContent; o.tabs=[...document.querySelectorAll('[data-ledger]')].map(b=>b.textContent).join();
    const txt=document.getElementById('mChoices').textContent; o.cistern=/Clear the Cistern/.test(txt)&&/Claimed 2026-11-21/.test(txt)&&/Paid 20 timber/.test(txt);
    o.tabs=[...document.querySelectorAll('[data-ledger]')].map(b=>b.textContent).join();
    /* waiting to be claimed: the Keeper Below, and the Lodge fulfilled as the card opened; each its button, and one for all */
    o.wait=[...document.querySelectorAll('[data-claim]')].map(b=>b.dataset.claim).sort().join();
    const iron0=T.townData().res.iron; document.querySelector('[data-claim="keeper"]').click();
    o.claim=[T.townData().res.iron-iron0,/You take 40 iron from the Ledger/.test(document.getElementById('mChoices').textContent),document.querySelectorAll('[data-claim]').length];
    document.querySelector('[data-claim="lodge"]').click(); o.noneLeft=document.querySelectorAll('[data-claim]').length;
    T.lodgeArt(); o.quiet=!T.LODGE_ART.em.some(e=>e.fl&&e.fl[0]===T.ledgerCall()[0]);
    o.throat=/Reach the Throat/.test(txt); o.hidden=/\?\?\?/.test(txt)&&!/Meet every creature/.test(txt);
    document.querySelector('[data-ledger="keepers"]').click(); o.keepers=/Ambrose Fenn/.test(document.getElementById('mChoices').textContent)&&/floors? cleared/.test(document.getElementById('mChoices').textContent);
    o.tip=T.TWN.tipFor; T.closeModal(); T.lodgeArt();
    /* the motes: one a feat, ten at most, made once a count */
    o.motes=[T.ledgerMotes(0),T.ledgerMotes(3)===T.ledgerMotes(3),T.ledgerMotes(12)===T.ledgerMotes(10)];
    o.em=T.LODGE_ART.em.some(e=>e.fl&&e.fl[0]===T.ledgerMotes(3)[0]);
    return o;});
  ok(lec.one&&lec.placed&&Math.abs(lec.placed[0]-4)+Math.abs(lec.placed[1]-2)===1,'the Ledger stands beside the Grimoire the first time',lec.placed);
  ok(!lec.chip,'it is never on the tray',lec.chip);
  ok(lec.scrapOff&&lec.scrap===false&&/Keeper’s Ledger is not yours to break up/.test(lec.say),'lifted, it cannot be salvaged, and the line names it',lec);
  ok(lec.stored===1&&lec.gone&&lec.salv===false&&lec.stillStored===1,'it can be stored, and Salvage in Storage refuses it',lec);
  ok(/waits in Storage/.test(lec.second),'a second is never set down',lec.second);
  ok(lec.back>=1&&lec.back<=2,'a Ledger missing from a save is put back near the Grimoire',lec.back);
  ok(lec.two===1,'two in a save: one is kept',lec.two);
  ok(lec.noLodge===0,'no Lodge, no Ledger',lec.noLodge);
  ok(lec.wall==='That would wall off the Keeper’s Ledger.','walling off is refused, and the line names the book cut off',lec.wall);
  ok(lec.near==='ledger'&&lec.label==='The Keeper’s Ledger','beside it, the button offers the Ledger',lec);
  ok(lec.title==='The Keeper’s Ledger'&&lec.tabs==='Feats ✦2,Keepers','the button opens its card, with its two tabs (Feats counts what waits)',lec);
  ok(lec.calls&&lec.quiet,'the lectern calls you over while a feat waits, and is quiet once all are claimed',lec);
  ok(lec.wait==='all,keeper,lodge'&&lec.claim[0]===40&&lec.claim[1]&&lec.claim[2]===1&&lec.noneLeft===0,'each waiting feat has its Claim, and Claim all; a claim pays and says so',lec);
  ok(lec.cistern&&lec.throat&&lec.hidden,'a feat done shows its date and pay; one beside it shows; a group with none done is ???',lec);
  ok(lec.keepers,'the Keepers tab counts floors cleared with each',lec.keepers);
  ok(lec.tip==='ledger','its tip is the one shown on first opening it',lec.tip);
  ok(lec.motes[0]===null&&lec.motes[1]&&lec.motes[2]&&lec.em,'a gold mote a feat claimed, ten at most, made once a count',lec);

  /* 6. old saves load: a town, a meta and a run from before the Ledger */
  const old=await p.evaluate(()=>{const T=__t, o={}; __clean();
    localStorage.setItem('ll-meta',JSON.stringify({embers:40,unlocked:['kit_whaler'],depth:1,runs:3,wins:0,lastKit:'whaler'}));
    o.meta=JSON.stringify([T.meta.trialsPassed,T.meta.descentsWalked,T.meta.mastery,T.meta.embers]);
    localStorage.setItem('ll-town',JSON.stringify({v:2,visits:1,res:{timber:3},lodge:{built:true,furn:[{id:'grimoire',c:4,r:2}]},ledger:{done:{cistern:'2026-11-01',nonsense:'x'}}}));
    T.townReset(); o.town=[Object.keys(T.townData().ledger.done).join(),!!T.lodgeRoom(T.townData(),'main').furn.find(d=>d.id==='ledger')];
    /* a save from before: no hurtOn, so its floor is not counted untouched; no floorsClr, so its floors below count */
    __fresh('whaler',2); T.F.phase='build'; T.checkpoint(); const sv=JSON.parse(localStorage.getItem('ll-save-v2'));
    for(const k of ['floorsClr','hurtOn','untouched','heraldKinds','leaned'])delete sv.run[k];
    T.resumeFrom(sv); T.floorCleared(); o.run=[T.run.untouched|0,T.run.floorsClr];
    return o;});
  ok(old.meta==='[[],[],{},40]','an old ll-meta loads with empty lists and no mastery',old.meta);
  ok(old.town[0]==='cistern'&&old.town[1],'an old ll-town keeps its known feats and gets its Ledger',old.town);
  ok(old.run[0]===0&&old.run[1]===3,'an old save resumes: its floor is not counted untouched, and its floors below count',old.run);

  /* 7. developer mode shows every feat and writes nothing */
  const dev=await p.evaluate(()=>{const T=__t, o={}; __clean(); T.setDev(true);
    T.townOpen(); const D=T.townData(); D.lodge.built=true; D.lodge.furn=[{id:'grimoire',c:4,r:2},{id:'ledger',c:5,r:2}];
    __fresh(); T.floorCleared(); T.run.trial=null; T.haulCredit(T.run);
    T.ledgerCard('feats'); o.all=!/\?\?\?/.test(document.getElementById('mChoices').textContent); T.closeModal(); T.townClose();
    o.town=localStorage.getItem('ll-town'); o.meta=localStorage.getItem('ll-meta'); T.setDev(false);
    return o;});
  ok(dev.all,'developer mode shows every feat',dev.all);
  ok(dev.town===null&&dev.meta===null,'developer mode writes no town and no meta',dev);

  ok(!errs.length,'no page errors',errs);
  await b.close();
  if(fails.length){fails.forEach(f=>console.log('FAIL '+f)); process.exit(1);}
  console.log('ok ledger');
})();
