// Saltmouth, Expansion 4, step 6: the Peddler (expansion/EXPANSION4_RUNBOOK.md §5).
// - A third rescued soul in TOWN_SOULS, caged on a landing like the others (cagePool(): no new stair roll). His barrow is two
//   tiles west of the Head-frame (TOWN_MAP), solid; where he stands and the tile in front of it are kept clear and reachable.
// - He only stands in the square once freed; before that his barrow is shut and its card says how to free him.
// - His wares: PEDDLER_N of what you lack (the three locked furniture sets' blueprints, for curios; the rare dyes, for tallow),
//   rolled on SALT.peddler = 27 keyed on ll-town.trips, which rises only when a run ends (victory(), defeat()). The stock
//   survives closing and reopening the town and buying; it changes only after a run ends.
// - A blueprint opens its set for good; a rare dye joins every piece it changes, and a save keeps it on a piece.
// - Taught: a town tip, the rules line, the Grimoire's souls. Developer mode never writes ll-town.
const {chromium}=require('playwright');
const fails=[]; const ok=(c,m,d)=>{if(!c)fails.push(m+(d!==undefined?' '+JSON.stringify(d).slice(0,700):''));};
(async()=>{
  const b=await chromium.launch(); const p=await b.newPage({viewport:{width:412,height:860}});
  const errs=[]; p.on('pageerror',e=>errs.push(String(e)));
  await p.goto('file://'+process.argv[2]); await p.waitForTimeout(300);

  /* 1. the data and the ground */
  const g=await p.evaluate(()=>{const T=__t, S=T.TOWN_SOULS.peddler, out={};
    T.townReset(); T.setDev(false); const Tn=T.townData(); Tn.rescued=[]; T.townSave(); T.townOpen();
    out.salt=T.SALT.peddler; out.n=T.PEDDLER_N;
    const [x,y,w,h]=S.box; out.box=[];
    for(let i=0;i<w;i++)for(let j=0;j<h;j++)out.box.push(T.townSolid(x+i,y+j));
    const kept=(c,r)=>T.TOWN_KEEP.some(([a,b2])=>a===c&&b2===r);
    out.keep=kept(S.st[0],S.st[1])&&kept(S.dx,S.dy);
    out.free=!T.townSolid(S.st[0],S.st[1])&&!T.townSolid(S.dx,S.dy);
    out.reach=!!T.townPathTo(S.dx,S.dy)&&!!T.townPathTo(S.st[0],S.st[1]); out.keepOK=T.townKeepOK([]);
    /* beside the Head-frame: within a few tiles of its deck */
    out.near=Math.hypot(S.dx-T.TOWN_DECK.x,S.dy-T.TOWN_DECK.y);
    out.rows=T.TOWN_MAP.every(r=>r.length===24);
    /* his blueprints are exactly the sets not open from the start; every rare dye changes some piece, and lands on PX letters */
    const W=T.PEDDLER_WARES, locked=Object.keys(T.LODGE_SETS).filter(k=>!T.LODGE_SETS[k].open).sort();
    out.bps=Object.values(W).filter(v=>v.bp).map(v=>v.bp).sort().join()===locked.join();
    const rare=Object.keys(T.LODGE_DYES).filter(k=>T.LODGE_DYES[k].rare);
    out.rare=rare.length; out.dyeWares=Object.values(W).filter(v=>v.dye).map(v=>v.dye).sort().join()===rare.slice().sort().join();
    out.dyeUse=rare.map(k=>[k,Object.keys(T.LODGE_ITEMS).filter(id=>T.dyeTouches(id,k)).length]);
    out.dyePX=rare.every(k=>Object.values(T.LODGE_DYES[k].sw).every(ch=>T.PX[ch]));
    out.costs=Object.values(W).every(v=>v.bp?v.cost.curios>0&&Object.keys(v.cost).length===1:v.cost.tallow>0&&Object.keys(v.cost).length===1);
    /* no trophy and nothing drawn without dyes ever takes one */
    out.noTrophy=rare.every(k=>!T.dyeTouches('keeper',k)&&!T.dyeTouches('primordial',k));
    /* a town saved before the barrow, with a brazier and a fence where it now stands and you standing on it: both come up and
       pay back, and you stand at the spawn */
    const fx=T.townFix({res:{timber:0,iron:0,tallow:0,curios:0},px:7.5,py:10.5,decos:[{id:'brazier',c:7,r:10},{id:'fence',c:8,r:10},{id:'brazier',c:5,r:13}]});
    out.fix={n:fx.decos.length,iron:fx.res.iron,tallow:fx.res.tallow,px:fx.px,py:fx.py};
    T.townClose();
    return out;});
  ok(g.fix.n===1&&g.fix.iron>=8&&g.fix.tallow>=6&&!(g.fix.px===7.5&&g.fix.py===10.5),'pieces saved where the barrow now stands come up and pay back; you are moved off it',g.fix);
  ok(g.salt===27&&g.n===3,'the Peddler rolls on SALT.peddler = 27, three wares at a time',g);
  ok(g.box.length===2&&g.box.every(Boolean)&&g.rows,'his barrow is two solid tiles of the square, and the map stays 24 wide',g);
  ok(g.keep&&g.free&&g.reach&&g.keepOK,'where he stands and the tile before his barrow are kept clear and reachable',g);
  ok(g.near<4,'his barrow stands by the Head-frame',g.near);
  ok(g.bps&&g.dyeWares&&g.rare>=3&&g.costs,'he sells the three locked sets for curios and every rare dye for tallow',g);
  ok(g.dyeUse.every(([k,n])=>n>=3)&&g.dyePX&&g.noTrophy,'each rare dye changes several pieces, on the town palette, and never a trophy',g.dyeUse);

  /* 2. caged on the stair like the others: in the pool until home, and up with the haul */
  const c=await p.evaluate(()=>{const T=__t, out={who:{}};
    const Tn=T.townData(); Tn.rescued=['croupier','toothmonger']; T.townSave();
    const doorsAt=(seed,floor)=>{T.newRun('lamplighter',0,{seed}); T.run.floor=floor; T.run.cage=null;
      const d=T.seeded(T.SALT.doors,0,()=>T.makeDoors()); T.seeded(T.SALT.descent,0,()=>T.descentDoor(d)); T.seeded(T.SALT.cage,0,()=>T.cageDoor(d)); return d;};
    for(let sd=1;sd<=120;sd++){const a=doorsAt(sd,2); for(const x of a)if(x.room==='cage')out.who[x.who]=(out.who[x.who]||0)+1;}
    out.pool=T.cagePool();
    /* freed: run.rescued, then ll-town.rescued with the haul */
    T.newRun('lamplighter',0,{seed:3}); T.run.rescued=['peddler']; T.haulCredit();
    out.home=T.townRescued('peddler'); out.pool2=T.cagePool();
    Tn.rescued=[]; T.townSave();
    return out;});
  ok(c.who.peddler>0&&!c.who.croupier&&!c.who.toothmonger&&c.pool.join()==='peddler','with the others home, a cage holds the Peddler',c);
  ok(c.home&&c.pool2.length===0,'freed, he climbs with the haul and is never caged again',c);

  /* 3. only once freed: a shut barrow and no one there; freed, he stands by it and the card is his wares */
  const f=await p.evaluate(()=>{const T=__t, out={};
    T.closeModal(); const Tn=T.townData(); Tn.rescued=[]; T.townSave(); T.townOpen();
    out.before=T.TWN.crowd.some(e=>e.k==='peddler');
    T.townSoulCard('peddler'); out.shutTitle=document.querySelector('#mTitle').textContent; out.shutBody=document.querySelector('#mBody').textContent;
    out.shutChoices=document.querySelectorAll('#mChoices > *').length; T.closeModal();
    const shut=T.townBarrow(false).cv.toDataURL();
    T.townClose(); Tn.rescued=['peddler']; T.townSave(); T.townOpen();
    out.after=T.TWN.crowd.some(e=>e.k==='peddler'&&e.soul);
    out.barrowChanged=T.townBarrow(true).cv.toDataURL()!==shut;
    /* standing before his barrow, the button names it */
    const S=T.TOWN_SOULS.peddler; T.TWN.p.x=S.dx+.5; T.TWN.p.y=S.dy+.5; T.townStep(1/60);
    out.act=document.querySelector('#townAct').textContent;
    T.tutSet({walk:'done',seen:Object.keys(T.TIPS).filter(k=>k!=='townpeddler'),off:false});
    T.townSoulCard('peddler'); out.openTitle=document.querySelector('#mTitle').textContent; out.wares=document.querySelectorAll('#mChoices > *').length;
    out.tip=T.TWN.card; T.closeModal(); T.townClose(); T.tutSet({walk:'done',seen:[],off:true});
    return out;});
  ok(!f.before&&f.after,'he stands in the square only once freed',f);
  ok(/Peddler/.test(f.shutTitle)&&/Free the Peddler/.test(f.shutBody)&&f.shutChoices===0,'before then his barrow is shut, and says how to free him',f);
  ok(f.barrowChanged,'his barrow opens when he comes home',f);
  ok(f.act==='The Peddler’s Barrow'&&f.openTitle==='The Peddler’s Barrow'&&f.wares===3,'before his barrow: his three wares',f);
  ok(f.tip==='townpeddler','the first time, a tip says what he sells',f.tip);

  /* 4. the stock: kept through closing, reopening and buying; a new three only after a run ends */
  const s=await p.evaluate(()=>{const T=__t, out={};
    const Tn=T.townData(); Tn.rescued=['peddler']; Tn.blueprints=[]; Tn.dyes=[]; Tn.trips=4; Tn.wares=null; Tn.res={timber:0,iron:0,tallow:100,curios:20}; T.townSave();
    const a=T.peddlerStock().slice(); out.a=a;
    for(let i=0;i<5;i++){T.townOpen(); T.townSoulCard('peddler'); T.closeModal(); T.townClose();}
    T.townReset(); out.reload=T.peddlerStock().join()===a.join()&&T.townData().trips===4;
    /* a run begun (and a floor played) is not a run ended */
    T.newRun('lamplighter',0,{seed:9}); out.newRun=T.townData().trips===4&&T.peddlerStock().join()===a.join();
    /* buying: paid, kept, and shown sold, the stock the same */
    const k=a[0], W=T.PEDDLER_WARES[k], before=Object.assign({},T.townData().res);
    out.why=T.peddlerBuy(k); out.held=T.wareHeld(k); out.again=T.peddlerBuy(k);
    out.paid=Object.keys(W.cost).every(m=>before[m]-T.townData().res[m]===W.cost[m]);
    out.after=T.peddlerStock().join()===a.join();
    T.townOpen(); T.townSoulCard('peddler'); out.sold=[...document.querySelectorAll('#mChoices > *')].filter(e=>/Sold/.test(e.textContent)).length; T.closeModal(); T.townClose();
    out.notHere=T.peddlerBuy(Object.keys(T.PEDDLER_WARES).find(x=>!a.includes(x)));
    /* a run ends: defeat and victory each add a trip, and the next stock is rolled from what you still lack */
    T.newRun('lamplighter',0,{seed:9}); T.defeat(); out.t1=T.townData().trips;
    const b2=T.peddlerStock().slice(); out.b=b2; out.noHeld=!b2.includes(k);
    T.newRun('lamplighter',0,{seed:9}); T.victory(); out.t2=T.townData().trips; T.closeModal();
    out.c=T.peddlerStock().slice();
    /* pure: the same trip and the same holdings give the same three */
    const keep=JSON.stringify(T.townData().wares); T.townData().wares=null; out.pure=T.peddlerStock().join()===out.c.join(); T.townData().wares=JSON.parse(keep);
    /* different trips give different stocks, at least sometimes */
    const seen=new Set(); for(let t=10;t<30;t++){T.townData().trips=t; T.townData().wares=null; seen.add(T.peddlerStock().join());} out.varied=seen.size;
    /* everything held: an empty barrow */
    const Tn2=T.townData(); Tn2.blueprints=['chapel','observ','coral']; Tn2.dyes=Object.keys(T.LODGE_DYES).filter(x=>T.LODGE_DYES[x].rare); Tn2.trips=40; Tn2.wares=null;
    out.empty=T.peddlerStock().length;
    T.townOpen(); T.townSoulCard('peddler'); out.emptyBody=document.querySelector('#mBody').textContent; T.closeModal(); T.townClose();
    out.saved=JSON.parse(localStorage.getItem('ll-town')).trips;
    return out;});
  ok(s.a.length===3&&s.reload&&s.newRun,'the stock survives closing and reopening the town, a reload and a new run',s);
  ok(s.why===''&&s.held&&s.again!==''&&s.paid&&s.after&&s.sold===1,'a ware is paid for once, and shows sold; the stock stays',s);
  ok(s.notHere!=='','what is not in his stock cannot be bought',s.notHere);
  ok(s.t1===5&&s.t2===6&&s.noHeld,'a run lost or won adds a trip, and the next stock leaves out what you hold',s);
  ok(s.pure&&s.varied>3,'the stock is a pure roll on the trip, and changes from trip to trip',s);
  ok(s.empty===0&&/Nothing you lack/.test(s.emptyBody)&&s.saved===40,'with everything held his barrow is empty',s);

  /* 5. what he sells works: a blueprint opens its set; a rare dye joins the pieces it changes and stays on them */
  const w=await p.evaluate(()=>{const T=__t, out={};
    const Tn=T.townData(); Tn.rescued=['peddler']; Tn.blueprints=[]; Tn.dyes=[]; Tn.trips=50; Tn.res={timber:0,iron:0,tallow:0,curios:0};
    Tn.wares={trip:50,items:['bp:chapel','dye:drown','bp:coral']}; T.townSave();
    out.locked=!T.lodgeSetOpen('chapel'); out.lockWhy=T.lodgeLockWhy('pew');
    out.poor=T.peddlerBuy('bp:chapel'); out.stillLocked=!T.lodgeSetOpen('chapel');
    Tn.res={timber:0,iron:0,tallow:40,curios:3};
    out.buy=T.peddlerBuy('bp:chapel'); out.open=T.lodgeSetOpen('chapel')&&T.lodgeLockWhy('pew')===''; out.curios=T.townData().res.curios;
    out.saved=JSON.parse(localStorage.getItem('ll-town')).blueprints;
    const chair0=T.dyeWays('chair',true); out.dyeBefore=chair0.includes('drown');
    out.dye=T.peddlerBuy('dye:drown'); const chair1=T.dyeWays('chair',true); out.dyeAfter=chair1.includes('drown')&&chair1.slice(0,3).join()===T.LODGE_ITEMS.chair.dyes.join();
    out.fix=T.dyeFix('drown',T.LODGE_ITEMS.chair); out.fixTrophy=T.dyeFix('drown',T.LODGE_ITEMS.keeper);
    out.pal=!!T.dyePal('drown');
    out.tallow=T.townData().res.tallow;
    return out;});
  ok(w.locked&&/Peddler/.test(w.lockWhy),'a locked set says to ask the Peddler',w);
  ok(w.poor!==''&&w.stillLocked,'without the curios nothing changes',w);
  ok(w.buy===''&&w.open&&w.curios===0&&w.saved.includes('chapel'),'buying a blueprint opens its set, for good',w);
  ok(!w.dyeBefore&&w.dye===''&&w.dyeAfter&&w.tallow===20,'a rare dye joins a piece’s colourways once bought, after its own',w);
  ok(w.fix==='drown'&&w.fixTrophy===null&&w.pal,'a piece keeps a rare dye through a save; a trophy never takes one',w);

  /* 6. dyeing a lifted piece: Dye runs through the piece's own colourways, then each rare dye held; a reload keeps it */
  const dy=await p.evaluate(()=>{const T=__t, o={};
    localStorage.removeItem('ll-town'); T.townReset(); T.setDev(false); T.townOpen();
    const D=T.townData(); D.res={timber:900,iron:900,tallow:900,curios:90}; T.townRestoreLodge(); D.res={timber:900,iron:900,tallow:900,curios:90}; D.free=false;
    T.lodgeEnter(); while(!document.getElementById('townCardWrap').hidden)document.getElementById('townCard').click(); T.TWN.p.x=5; T.TWN.p.y=8.4;
    T.townBuildSet(true); T.lodgePlace('desk',2,4); const desk=T.lodgeRoom().furn.find(e=>e.id==='desk');
    T.bldTap(2,4); const run=()=>{const seq=[]; for(let i=0;i<6;i++){T.bldDye(); seq.push(desk.dye||'-');} return seq.join();};
    o.without=run(); D.dyes=['drown','bone']; o.ways=T.dyeWays('desk',true).join(); o.with=run();
    while(desk.dye!=='bone')T.bldDye(); T.bldDrop(); T.townBuildSet(false); T.townSave(); T.townReset();
    o.saved=T.townData().lodge.furn.find(e=>e.id==='desk').dye;
    T.townClose();
    return o;});
  ok(dy.without==='tar,wine,bleach,-,tar,wine','without his dyes, a piece cycles only its own colourways',dy);
  ok(dy.ways==='tar,wine,bleach,drown,bone'&&/bleach,drown,bone,-/.test(dy.with+','+dy.with),'with them, Dye reaches each rare dye after the piece’s own',dy);
  ok(dy.saved==='bone','a desk dyed Bone-White is still that colour after a reload',dy);

  /* 7. taught: the rules line and the Grimoire's souls */
  const t=await p.evaluate(()=>{const T=__t, out={};
    out.rules=/Peddler opens his barrow/.test(document.querySelector('#rulesList').textContent);
    const Tn=T.townData(); Tn.rescued=[]; T.townSave();
    T.openBook('title','kits'); out.caged=/Souls freed from cages/.test(document.querySelector('#modal').textContent)&&!/The Peddler/.test(document.querySelector('#modal').textContent);
    T.closeModal(); Tn.rescued=['peddler']; T.townSave();
    T.openBook('title','kits'); out.freed=/The Peddler/.test(document.querySelector('#modal').textContent); T.closeModal();
    return out;});
  ok(t.rules,'the rules line names the Peddler’s barrow',t);
  ok(t.caged&&t.freed,'the Grimoire lists the souls freed from cages, the Peddler once he is home',t);

  /* 8. developer mode never writes ll-town */
  const dev=await p.evaluate(()=>{const T=__t, out={};
    const Tn=T.townData(); Tn.rescued=['peddler']; Tn.blueprints=[]; Tn.dyes=[]; Tn.res={timber:0,iron:0,tallow:100,curios:20}; Tn.trips=7; Tn.wares=null; T.townSave();
    const before=localStorage.getItem('ll-town');
    T.setDev(true); T.townReset();
    T.townOpen(); T.townSoulCard('peddler'); const st=T.peddlerStock(); out.buy=T.peddlerBuy(st[0]); T.closeModal(); T.townTrip(); T.townClose();
    out.same=localStorage.getItem('ll-town')===before;
    T.setDev(false); T.townReset(); out.back=T.townData().trips===7&&T.townData().blueprints.length===0&&T.townData().dyes.length===0;
    return out;});
  ok(dev.buy===''&&dev.same&&dev.back,'developer mode buys and turns the stock over in its own copy, and never writes',dev);
  /* developer mode can bring him home from his shut barrow's card, to try it, and still writes nothing */
  const home=await p.evaluate(()=>{const T=__t, out={};
    const Tn=T.townData(); Tn.rescued=[]; T.townSave(); const before=localStorage.getItem('ll-town');
    T.townSoulCard('peddler'); out.plain=[...document.querySelectorAll('#mActions button')].some(b=>/developer/.test(b.textContent)); T.closeModal();
    T.setDev(true); T.townReset(); T.townOpen(); T.townSoulCard('peddler');
    const btn=[...document.querySelectorAll('#mActions button')].find(b=>/Bring him home/.test(b.textContent)); out.btn=!!btn; if(btn)btn.click();
    out.crowd=T.TWN.crowd.some(e=>e.k==='peddler'); out.title=document.querySelector('#mTitle').textContent; out.wares=document.querySelectorAll('#mChoices button').length;
    T.closeModal(); T.townClose(); out.same=localStorage.getItem('ll-town')===before; T.setDev(false); T.townReset(); out.real=T.townRescued('peddler');
    return out;});
  ok(!home.plain&&home.btn&&home.crowd&&home.wares===3&&home.same&&!home.real,'developer mode brings him home from his shut barrow, in its own copy only',home);

  ok(errs.length===0,'no page errors',errs);
  await b.close();
  for(const x of fails)console.log('FAIL '+x);
  if(fails.length){console.log(fails.length+' failed'); process.exit(1);}
  console.log('peddler ok');
})().catch(e=>{console.log('FAIL '+e.stack); process.exit(1);});
