// Saltmouth (Expansion 3, step 9): the Keeper's Lodge.
// - The first house in TOWN_HOUSES, a ruin until restored for LODGE_COST; ll-town.lodge = {built, floor, wall, furn:[{id,c,r}]}.
// - Its door swaps the square for a 10×10 room in the same renderer (TWN.inside); leaving puts you on the square before its door.
// - Floors, walls and furniture go down with the build tray and come up for all they cost.
// - The Grimoire shelf shows one spine per creature met and relic found, and opens the Grimoire with openBook('town').
// - With the Lodge standing, a second Keeper can work at a chore (ll-town.chore2, run.chore2, run.wage2).
const {chromium}=require('playwright');
const fails=[]; const ok=(c,m,d)=>{if(!c)fails.push(m+(d!==undefined?' '+JSON.stringify(d).slice(0,600):''));};
(async()=>{
  const b=await chromium.launch(); const p=await b.newPage({viewport:{width:412,height:860}});
  const errs=[]; p.on('pageerror',e=>errs.push(String(e)));
  await p.goto('file://'+process.argv[2]); await p.waitForTimeout(300);

  /* 1. the ruin: its door is kept clear and reachable; restoring needs the whole cost, takes it, and is saved */
  const r=await p.evaluate(()=>{const T=__t, out={};
    localStorage.removeItem('ll-town'); T.townReset(); T.setDev(false); T.townOpen();
    const O=T.LODGE_OUT, ox=Math.floor(O.x), oy=Math.floor(O.y);
    out.kept=T.TOWN_KEEP.some(([x,y])=>x===ox&&y===oy); out.free=!T.townSolid(ox,oy); out.path=!!T.townPathTo(ox,oy);
    out.ruin=T.TOWN_HOUSES[0].ruin; out.built0=T.lodgeBuilt();
    const td=T.townData(); td.res={timber:29,iron:15,tallow:0,curios:0};
    out.poor=T.townRestoreLodge(); out.enterPoor=T.lodgeEnter();
    T.TWN.p.x=O.x; T.TWN.p.y=O.y; T.townStep(1/30); out.labelRuin=document.getElementById('townAct').textContent;
    T.townLodgeDoor(); out.card=document.getElementById('mTitle').textContent; document.getElementById('modal').hidden=true;
    td.res={timber:30,iron:15,tallow:3,curios:0};
    out.rich=T.townRestoreLodge(); out.res=Object.assign({},td.res); out.again=T.townRestoreLodge();
    T.townArt(); out.ruinAfter=T.TOWN_HOUSES[0].ruin; out.lit=T.TOWN_HOUSES[0].lit.every(Boolean);
    T.TWN.near=undefined; T.townStep(1/30); out.label=document.getElementById('townAct').textContent;
    out.saved=JSON.parse(localStorage.getItem('ll-town')).lodge;
    return out;});
  console.log(JSON.stringify(r));
  ok(r.kept&&r.free&&r.path,'the ground before the Lodge’s door is kept clear and can be walked to',r);
  ok(r.ruin&&!r.built0&&!r.poor&&!r.enterPoor,'a ruined Lodge cannot be entered, nor restored short of the cost',r);
  ok(r.labelRuin==='The Keeper’s Lodge'&&/Ruin/.test(r.card),'at the ruin’s door the button names it and shows what restores it',r);
  ok(r.rich&&r.res.timber===0&&r.res.iron===0&&r.res.tallow===3&&!r.again,'restoring takes 30 timber and 15 iron, once',r.res);
  ok(!r.ruinAfter&&r.lit&&r.label==='Enter the Lodge','restored, it loses its roof hole, its windows burn, and the door reads Enter the Lodge',r);
  ok(r.saved&&r.saved.built===true&&r.saved.floor==='planks'&&r.saved.wall==='damp'&&Array.isArray(r.saved.furn),'the Lodge is saved, with the free floor and wall',r.saved);

  /* 2. in and out: the room's map is walked, the square's crowd is gone, and you come out before the door; closing the town from
     inside keeps you before the door too */
  const w=await p.evaluate(()=>{const T=__t, W=T.TWN, out={};
    T.townKeepers(); out.crowd0=W.crowd.length;
    /* a tap on the Lodge from across the square walks to its door and goes in */
    W.p.x=12; W.p.y=14; T.townTapTile(2,9); out.goal=W.goal;
    for(let i=0;i<600&&!W.inside;i++)T.townStep(1/30);
    out.inside=!!W.inside; out.at=[W.p.x,W.p.y]; out.crowd=W.crowd.length;
    while(!document.getElementById('townCardWrap').hidden)document.getElementById('townCard').click();
    W.near=undefined; T.townStep(1/30); out.label=document.getElementById('townAct').textContent;
    out.wall=T.townSolid(0,5)&&T.townSolid(4,2)&&T.townSolid(4,9)&&!T.townSolid(2,5);
    /* walk across the room and back to the door */
    T.lodgeTapTile(2,4); for(let i=0;i<200&&W.path;i++)T.townStep(1/30); out.walked=[Math.floor(W.p.x),Math.floor(W.p.y)];
    T.townDraw(); out.art=!!T.LODGE_ART&&T.LODGE_ART.mw===160;
    T.lodgeTapTile(4,9); out.doorGoal=W.goal; for(let i=0;i<300&&W.inside;i++)T.townStep(1/30);
    out.out=!W.inside; out.outAt=[+W.p.x.toFixed(2),+W.p.y.toFixed(2)]; out.crowdBack=W.crowd.length;
    out.squareSolid=T.townSolid(2,9);
    /* closed from inside: kept before the door */
    T.lodgeEnter(); T.townClose(); const td=T.townData(); out.closed=[td.px,td.py]; out.insideAfterClose=!!W.inside;
    T.townOpen(); out.reopen=[W.p.x,W.p.y,!!W.inside];
    T.townDraw();
    return out;});
  console.log(JSON.stringify(w));
  ok(w.goal==='lodge'&&w.inside,'a tap on the Lodge walks to its door and goes in',w);
  ok(Math.abs(w.at[0]-5)<.01&&Math.abs(w.at[1]-8.4)<.01&&w.crowd===0,'inside, you stand by the door and nobody from the square is about',w);
  ok(w.label==='Leave the Lodge'&&w.wall&&w.art,'the room’s walls, shelf and door are solid, its floor is not; the door reads Leave the Lodge',w);
  ok(w.walked[0]===2&&w.walked[1]===4,'you walk the room',w.walked);
  ok(w.doorGoal==='door'&&w.out&&Math.abs(w.outAt[0]-3.5)<.01&&Math.abs(w.outAt[1]-12.5)<.01,'the door puts you on the square before the Lodge',w);
  ok(w.crowdBack===w.crowd0&&w.squareSolid,'back outside, the Keepers stand again and the square is the square',w);
  ok(w.closed[0]===3.5&&w.closed[1]===12.5&&!w.insideAfterClose&&w.reopen[0]===3.5&&w.reopen[1]===12.5&&!w.reopen[2],'closing from inside keeps your place before the door',w);

  /* 3. floors, walls and furniture: paid, refunded in full, and kept off the ways to the door and the shelf */
  const f=await p.evaluate(()=>{const T=__t, W=T.TWN, td=T.townData(), out={};
    T.lodgeEnter(); td.res={timber:100,iron:100,tallow:100,curios:5}; const R0=JSON.stringify(td.res);
    out.parquet=T.lodgeStyle('parquet'); out.r1=Object.assign({},td.res);
    out.flags=T.lodgeStyle('flags'); out.r2=Object.assign({},td.res);
    out.same=T.lodgeStyleWhy('flags');
    out.planks=T.lodgeStyle('planks'); out.r3=JSON.stringify(td.res)===R0;
    out.library=T.lodgeStyle('library'); out.brass=T.lodgeStyle('brass'); out.damp=T.lodgeStyle('damp'); out.r4=JSON.stringify(td.res)===R0;
    W.p.x=7.5; W.p.y=7.5;
    out.onDoor=T.lodgeCanPlace('chair',4,8); out.onShelfFront=T.lodgeCanPlace('stove',5,3); out.onShelf=T.lodgeCanPlace('chair',4,2);
    out.onWall=T.lodgeCanPlace('chair',0,5); out.rugDoor=T.lodgeCanPlace('rug',3,6);
    out.desk=T.lodgePlace('desk',1,3); out.rd=Object.assign({},td.res); out.deskSolid=T.townSolid(1,3)&&T.townSolid(2,3);
    out.overlap=T.lodgeCanPlace('chair',2,3);
    out.rug=T.lodgePlace('rug',3,4); out.rugWalk=!T.townSolid(4,5);
    /* a wall of furniture across the room is refused where it would cut the door off from the shelf */
    const row=[]; for(const x of [1,2,3,4,5,6,7,8])row.push(T.lodgePlace('shelf',x,7));
    out.row=row; out.rowLeft=row.filter(s=>s).length;
    out.keepOK=T.lodgeKeepOK(td.lodge.furn.filter(d=>!T.LODGE_ITEMS[d.id].flat));
    out.saved=JSON.parse(localStorage.getItem('ll-town')).lodge.furn.length===td.lodge.furn.length;
    for(const d of td.lodge.furn.slice())T.lodgeTakeUp(d);
    out.empty=td.lodge.furn.every(d=>d.id==='grimoire')&&!T.townSolid(1,3);
    out.refund=JSON.stringify(td.res)===R0;
    out.poorWhy=(td.res={timber:0,iron:0,tallow:0,curios:0},T.lodgeCanPlace('desk',1,3));
    td.res=JSON.parse(R0);
    return out;});
  console.log(JSON.stringify(f));
  ok(f.parquet==='Diamond Parquet laid.'&&f.r1.timber===80,'the parquet takes 20 timber',f);
  ok(/gives back 20 timber/.test(f.flags)&&f.r2.timber===100&&f.r2.iron===80,'a new floor gives back the old one in full',f);
  ok(f.same==='The room has it already.'&&f.r3&&f.r4,'the free floor and wall put everything back',f);
  ok(/door/.test(f.onDoor)&&f.onShelfFront===''&&/already/.test(f.onShelf)&&/no floor/.test(f.onWall)&&f.rugDoor==='','nothing solid on the way to the door, nor on the walls, nor on the Grimoire shelf, which is a piece; the rug may lie anywhere',f);
  ok(f.desk===''&&f.rd.timber===88&&f.rd.iron===96&&f.deskSolid&&/already/.test(f.overlap),'the desk is paid for, stands on two tiles, and nothing stands on it',f);
  ok(f.rug===''&&f.rugWalk,'the rug is walked over',f);
  ok(f.rowLeft>=1&&f.keepOK,'a piece that would wall off the door is refused',f.row);
  ok(f.saved&&f.empty&&f.refund,'everything taken up gives back all it cost; the Grimoire stays (it is never taken up)',f);
  ok(/You need/.test(f.poorWhy),'short of the haul, it says what is missing',f.poorWhy);

  /* 4. the Grimoire shelf: one spine per creature met and relic found, the book over the room, and back to the room */
  const g=await p.evaluate(()=>{const T=__t, W=T.TWN, C=T.codex(), out={};
    C.foes.clear(); C.relics.clear();
    out.s0=T.lodgeSpines().n; T.lodgeArt(); out.d0=T.LODGE_ART.spines;
    for(const k of ['crawler','skitter','gnasher'])C.foes.add(k);
    for(const k of Object.keys(T.RELICS).slice(0,4))C.relics.add(k);
    const S=T.lodgeSpines(); T.lodgeArt(); out.n=S.n; out.cap=S.cap; out.d1=T.LODGE_ART.spines;
    out.want=[...C.foes].length+[...C.relics].length;
    T.setDev(true); T.lodgeArt(); out.dev=T.LODGE_ART.spines; T.setDev(false); T.lodgeArt();
    W.p.x=5; W.p.y=3.5; W.near=undefined; T.townStep(1/30); out.label=document.getElementById('townAct').textContent;
    document.getElementById('townAct').click();
    out.book=document.getElementById('mTitle').textContent; out.from=T.BOOK.from;
    const btn=[...document.querySelectorAll('#mActions button')].find(x=>/Close/.test(x.textContent)); btn.click();
    out.closed=document.getElementById('modal').hidden; out.still=!!W.inside&&W.on&&!document.getElementById('townOverlay').hidden;
    out.tip=W.card;
    return out;});
  console.log(JSON.stringify(g));
  ok(g.s0===0&&g.d0===0,'a Grimoire with nothing in it, a shelf with no spines',g);
  ok(g.n===7&&g.d1===g.n&&g.n===g.want,'the shelf shows one spine for every creature met and relic found',g);
  ok(g.dev===g.cap,'developer mode, which opens the whole book, fills the shelf',g);
  ok(g.label==='The Grimoire'&&g.book==='The Grimoire'&&g.from==='town','at the shelf the button opens the Grimoire',g);
  ok(g.closed&&g.still,'closing the book leaves you in the Lodge, not on the title',g);
  ok(g.tip==='lodgeshelf'||g.tip===null,'the shelf has its own tip',g.tip);

  /* 5. a second chore with the Lodge standing; one without it */
  const c=await p.evaluate(()=>{const T=__t, td=T.townData(), out={};
    T.lodgeLeave();
    localStorage.setItem('ll-meta',JSON.stringify(Object.assign(JSON.parse(localStorage.getItem('ll-meta')||'{}'),{unlocked:Object.values(T.KITS).map(K=>K.lock).filter(Boolean),lastKit:'lamplighter'})));
    const locked=['whaler','galvanist'].filter(k=>T.kitLocked(k)); out.locked=locked;
    T.townSetChore(null); T.townSetChore('whaler'); T.townSetChore('galvanist'); out.two=[td.chore,td.chore2];
    T.townKeepers(); out.atWork=T.TWN.crowd.filter(e=>e.work).map(e=>e.k).sort();
    T.townSetChore('bellringer'); out.three=[td.chore,td.chore2];
    T.townEndChore('galvanist'); out.ended=[td.chore,td.chore2];
    T.townSetChore('galvanist');
    td.res={timber:0,iron:0,tallow:0,curios:0};
    T.townClose(); T.newRun('lamplighter',0); out.run=[T.run.chore,T.run.chore2];
    T.floorCleared(); out.haul=Object.assign({},T.run.haul); out.wage=[T.run.wage,T.run.wage2];
    out.line=T.choreLine(T.run);
    /* without the Lodge only one slot: a second sends the first back */
    const save=JSON.parse(JSON.stringify(td)); td.lodge.built=false; td.chore2=null;
    T.townSetChore('whaler'); out.one=[td.chore,td.chore2];
    out.chore2NoLodge=T.townChore2('lamplighter');
    td.lodge.built=true;
    /* an old town (no lodge, no chore2) loads with a ruined Lodge and one slot */
    const old=T.townFix({v:1,res:{timber:1,iron:2,tallow:3,curios:0},chore:'whaler',chore2:'galvanist'});
    out.old=[old.lodge.built,old.lodge.floor,old.lodge.wall,old.lodge.furn.length,old.chore,old.chore2];
    /* a broken save: a stove before the door comes up and pays back */
    const bad=T.townFix({v:1,res:{timber:0,iron:0,tallow:0,curios:0},lodge:{built:true,floor:'nope',wall:'brass',furn:[{id:'stove',c:4,r:8},{id:'chair',c:2,r:5},{id:'rug',c:6,r:6},{id:'zzz',c:1,r:1}]}});
    out.bad=[bad.lodge.floor,bad.lodge.wall,bad.lodge.furn.map(d=>d.id).join(','),bad.res.iron,bad.res.tallow];
    return out;});
  console.log(JSON.stringify(c));
  ok(!c.locked.length,'test setup: whaler and galvanist unlocked',c.locked);
  ok(c.two[0]==='whaler'&&c.two[1]==='galvanist'&&c.atWork.join()==='galvanist,whaler','with the Lodge, two Keepers go to their work',c);
  ok(c.three[0]==='galvanist'&&c.three[1]==='bellringer','a third sends back the one longest at work',c);
  ok(c.ended[0]==='bellringer'&&c.ended[1]===null,'ending one leaves the other in the first slot',c);
  ok(c.run[0]==='bellringer'&&c.run[1]==='galvanist','the descent takes both chores',c.run);
  ok(c.haul.timber===8+5&&c.haul.iron===5+5+8,'a floor cleared pays both chores into the haul',c.haul);
  ok(c.wage[0]&&c.wage[0].timber===5&&c.wage[1]&&c.wage[1].iron===8&&/Agathe/.test(c.line)&&/Voss/.test(c.line),'each Keeper’s pay is shown on its own line',c);
  ok(c.one[0]==='whaler'&&c.one[1]===null&&c.chore2NoLodge===null,'without the Lodge, one slot',c);
  ok(c.old.join()==='false,planks,damp,0,whaler,','an old town has a ruined Lodge and no second chore',c.old);
  ok(c.bad[0]==='planks'&&c.bad[1]==='brass'&&c.bad[2]==='grimoire,chair,rug,sconce,sconce'&&c.bad[3]===10&&c.bad[4]===2,'a broken Lodge keeps what fits and pays back what does not',c.bad);

  /* 6. developer mode never writes ll-town */
  const d=await p.evaluate(()=>{const T=__t, out={};
    document.getElementById('modal').hidden=true;
    localStorage.removeItem('ll-town'); T.townReset(); T.setDev(false); T.townData(); T.townSave();
    const before=localStorage.getItem('ll-town');
    T.setDev(true); const td=T.townData(); td.res={timber:500,iron:500,tallow:500,curios:50};
    T.townOpen(); out.restore=T.townRestoreLodge(); out.enter=T.lodgeEnter();
    out.style=T.lodgeStyle('parquet'); out.place=T.lodgePlace('stove',7,4); T.townSetChore('whaler');
    T.townDraw(); T.lodgeLeave(); T.townClose();
    out.same=localStorage.getItem('ll-town')===before;
    T.setDev(false); out.real=T.lodgeBuilt();
    return out;});
  console.log(JSON.stringify(d));
  ok(d.restore&&d.enter&&d.place===''&&d.same&&!d.real,'developer mode builds the Lodge in its own copy and writes nothing',d);

  ok(!errs.length,'no page errors',errs);
  await b.close();
  if(fails.length){for(const f of fails)console.log('FAIL '+f); process.exit(1);}
  console.log('lodge ok');
})();
