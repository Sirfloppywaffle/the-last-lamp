// The Keeper's Ledger (Expansion 5, step 1; expansion/EXPANSION5_RUNBOOK.md §5): a lectern in the Lodge, one of a kind like the
// Grimoire, whose feats each pay once in town materials when the haul comes up. Each feat fires from its source (a Herald slain, a
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

  /* 2. paid once, in the same write; the death screen says it; a reload of the death screen pays nothing more */
  const pay=await p.evaluate(()=>{const T=__t, o={}; __clean();
    __fresh(); T.floorCleared(); T.killFoe({dead:false,hp:0,x:2,y:2,gate:0,d:1,type:'tithetaker',def:Object.assign({},T.FOES.tithetaker)});
    T.F.phase='wave'; T.F.wave=1; T.checkpoint();
    o.line=T.ledgerLine(T.run);
    const res0=JSON.stringify(T.townData().res);
    T.run.oil=0; T.defeat();
    const D=JSON.parse(localStorage.getItem('ll-town')||'{}');
    o.done=Object.keys((D.ledger||{}).done||{}).sort().join(); o.res=D.res; o.res0=res0;
    o.day=/^\d{4}-\d\d-\d\d$/.test(((D.ledger||{}).done||{}).cistern||'');
    o.save=localStorage.getItem('ll-save-v2');
    /* a reload: the town is read again; nothing in it is paid twice */
    T.townReset(); const again=T.ledgerDue(null).length, r2=JSON.stringify(T.townData().res); o.again=[again,r2===JSON.stringify(D.res)];
    /* and crediting the same run again pays nothing */
    o.twice=T.haulCredit(T.run);
    /* four feats or more: three lines, then how many more */
    __fresh('lamplighter',4); T.run.bosses=2; T.run.morning=true; T.run.untouched=1; o.many=T.ledgerLine(T.run);
    return o;});
  ok(/The Ledger: Clear the Cistern\. 20 timber\./.test(pay.line)&&/Slay the Tithe-taker\. 25 iron/.test(pay.line),'the death screen\'s line names each feat and its pay',pay.line);
  ok(pay.done==='cistern,h_tithetaker,untouched'&&pay.day,'the feats are marked done, with the date',pay);
  ok(pay.res&&pay.res.timber>=20&&pay.res.iron>=25+5+8&&pay.res.tallow>=25,'what they pay is in the town with the haul',pay.res);
  ok(!JSON.parse(pay.save),'the run is gone after the death screen',pay.save);
  ok(pay.again[0]===0&&pay.again[1]&&pay.twice===false,'a reload owes nothing, and the run is never credited twice',pay);
  ok((pay.many.match(/The Ledger:/g)||[]).length===3&&/And (two|three|four|five|six) more in the Ledger\./.test(pay.many),'more than three: three lines, then how many more',pay.many);

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
    const D=T.townData(); D.ledger={done:{cistern:'2026-11-20'}}; T.lodgeSync(); T.TWN.p.x=5.5; T.TWN.p.y=3.6; T.lodgeArt();
    o.near=T.townNearAct(); o.label=T.townActLabel(o.near);
    document.getElementById('townAct').hidden=false; T.townStep(0.016); document.getElementById('townAct').click();
    o.title=document.getElementById('mTitle').textContent; o.tabs=[...document.querySelectorAll('[data-ledger]')].map(b=>b.textContent).join();
    const txt=document.getElementById('mChoices').textContent; o.cistern=/Clear the Cistern/.test(txt)&&/Done 2026-11-20/.test(txt)&&/Paid 20 timber/.test(txt);
    o.throat=/Reach the Throat/.test(txt); o.hidden=/\?\?\?/.test(txt)&&!/Meet every creature/.test(txt);
    o.newly=/Newly entered/.test(txt)&&/Restore the Keeper’s Lodge/.test(txt)&&T.townData().ledger.done.lodge!=null;
    document.querySelector('[data-ledger="keepers"]').click(); o.keepers=/Ambrose Fenn/.test(document.getElementById('mChoices').textContent)&&/floors? cleared/.test(document.getElementById('mChoices').textContent);
    o.tip=T.TWN.tipFor; T.closeModal(); T.lodgeArt();
    /* the motes: one a feat, ten at most, made once a count */
    o.motes=[T.ledgerMotes(0),T.ledgerMotes(3)===T.ledgerMotes(3),T.ledgerMotes(12)===T.ledgerMotes(10)];
    o.em=T.LODGE_ART.em.some(e=>e.fl&&e.fl[0]===T.ledgerMotes(2)[0]);
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
  ok(lec.title==='The Keeper’s Ledger'&&lec.tabs==='Feats,Keepers','the button opens its card, with its two tabs',lec);
  ok(lec.cistern&&lec.throat&&lec.hidden,'a feat done shows its date and pay; one beside it shows; a group with none done is ???',lec);
  ok(lec.newly,'a town feat done in the square is paid as the Ledger opens',lec.newly);
  ok(lec.keepers,'the Keepers tab counts floors cleared with each',lec.keepers);
  ok(lec.tip==='ledger','its tip is the one shown on first opening it',lec.tip);
  ok(lec.motes[0]===null&&lec.motes[1]&&lec.motes[2]&&lec.em,'a gold mote a feat, ten at most, made once a count',lec);

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
