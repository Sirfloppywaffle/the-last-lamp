// Saltmouth, Expansion 4, step 4: the catalogue (the Lodge's pieces).
// - Five themed sets (Fisherman's, Old Library open; Drowned Chapel, Brass Observatory, Deep-One Coral bought as blueprints, shown
//   locked on the tray until then), about 30 pieces, each set with something for the floor, the wall and a surface.
// - Wall mounts hang on the back wall of any of the three rooms (wall tiles, never floor), where the room's hang list allows.
// - Small things stand on a surface, in half-tile slots; the host carries them (lift, store, salvage, undo, save).
// - Every piece has two to four colourways (dye, tallow); a dye is a swap of palette letters.
// - Art: every piece from PixelLab on the town's palette; nothing here changes the stair; developer mode never writes ll-town.
const {chromium}=require('playwright');
const fails=[]; const ok=(c,m,d)=>{if(!c)fails.push(m+(d!==undefined?' '+JSON.stringify(d).slice(0,700):''));};
(async()=>{
  const b=await chromium.launch(); const p=await b.newPage({viewport:{width:412,height:860}});
  const errs=[]; p.on('pageerror',e=>errs.push(String(e)));
  await p.goto('file://'+process.argv[2]); await p.waitForTimeout(300);

  /* 1. the data: about thirty pieces in five sets, something in each for the floor, the wall and a surface; two to four colourways
     each; art for every piece on the town's palette, 16 pixels a tile */
  const d=await p.evaluate(()=>{const T=__t, I=T.LODGE_ITEMS, out={}, furn=Object.keys(I).filter(k=>I[k].k==='furn');
    out.n=furn.length; out.sets=Object.keys(T.LODGE_SETS);
    out.parts=out.sets.filter(s=>s!=='rooms').map(s=>{const f=furn.filter(k=>I[k].set===s); return [s,f.filter(k=>!I[k].mount&&!I[k].small).length,f.filter(k=>I[k].mount).length,f.filter(k=>I[k].small).length,f.filter(k=>I[k].top).length];});
    out.dyes=furn.filter(k=>{const n=(I[k].dyes||[]).length+1; return n<2||n>4||!(I[k].dyes||[]).every(y=>T.LODGE_DYES[y]);});
    out.noSet=Object.keys(I).filter(k=>!T.LODGE_SETS[I[k].set]);
    out.noArt=furn.filter(k=>k!=='chair'&&!T.LODGE_ROWS[k]);
    out.tops=furn.filter(k=>I[k].top).map(k=>{const f=T.FACE_SRC[I[k].faces>=4?4:1], used=[...new Set(f.map(x=>x[0]))]; return [k,used.every(s=>T.LODGE_TOPS[k]&&T.LODGE_TOPS[k][s])];});
    const letters=new Set(Object.keys(T.PX)); let bad=[], wide=[];
    for(const k of furn){const R=k==='chair'?T.LODGE_CHAIR.map((r,i)=>[i,r]):Object.entries(T.LODGE_ROWS[k]);
      for(const [f,rows] of R){for(const r of rows)for(const ch of r)if(ch!=='.'&&!letters.has(ch))bad.push(k+f+ch);
        const w=rows[0].length, tiles=I[k].w||1, h=I[k].h||1, side=(+f===2||+f===6);
        const max=I[k].flat?48:(side?h:tiles)*16+((+f&1)?8:0); if(w>max)wide.push([k,f,w,max]);}}
    out.bad=bad.slice(0,5); out.wide=wide;
    out.costs=furn.filter(k=>Object.keys(I[k].cost).some(m=>!['timber','iron','tallow','curios'].includes(m)));
    out.mounts=furn.filter(k=>I[k].mount).map(k=>{const r=T.LODGE_ROWS[k][0]; return [k,r[0].length,r.length];});
    out.smalls=furn.filter(k=>I[k].small).map(k=>{const r=T.LODGE_ROWS[k][0]; return [k,r[0].length,r.length];});
    return out;});
  console.log(JSON.stringify({n:d.n,parts:d.parts}));
  ok(d.n>=30&&d.n<=40,'about thirty pieces in all',d.n);
  ok(d.sets.join()==='rooms,fisher,library,chapel,observ,coral','five themed sets, and the Lodge’s own floors and walls',d.sets);
  ok(d.parts.every(([s,fl,m,sm])=>fl>=1&&m>=1&&sm>=1)&&d.parts.every(x=>x[4]>=0),'every set has something for the floor, the wall and a surface',d.parts);
  ok(d.parts.some(x=>x[4]>=1),'surfaces exist',d.parts);
  ok(!d.dyes.length&&!d.noSet.length&&!d.noArt.length&&d.tops.every(x=>x[1])&&!d.costs.length,'every piece: a set, art, two to four colourways, its slots drawn for every facing, town materials only',d);
  ok(!d.bad.length&&!d.wide.length,'every pixel on a PX letter; a piece is 16 wide a tile',{bad:d.bad,wide:d.wide});
  ok(d.mounts.every(([k,w,h])=>w<=16&&h<=20),'a wall mount fits a tile of the wall',d.mounts);
  ok(d.smalls.every(([k,w,h])=>w<=13&&h<=12),'a small thing is small: no more than a slot and a half across',d.smalls);

  /* the room, as every test below finds it: the Lodge restored, both rooms open, the haul full, Build closed */
  const setup=`(room)=>{localStorage.removeItem('ll-town'); __t.townReset(); __t.setDev(false); __t.townOpen();
    const D=__t.townData(); D.res={timber:900,iron:900,tallow:900,curios:90}; __t.townRestoreLodge(); D.res={timber:900,iron:900,tallow:900,curios:90};
    D.lodge.rooms.cellar.built=true; D.lodge.rooms.attic.built=true; D.free=false; __t.lodgeEnter(); if(room&&room!=='main')__t.lodgeGo(room);
    while(!document.getElementById('townCardWrap').hidden)document.getElementById('townCard').click(); __t.TWN.p.x=5; __t.TWN.p.y=8.4; return D;}`;

  /* 2. sets: two open, three locked until a blueprint is bought; the tray shows them locked and says who sells them; developer
     mode opens them without writing */
  const s=await p.evaluate(`(()=>{const D=(${setup})('main'), T=__t, o={};
    o.open=['rooms','fisher','library','chapel','observ','coral'].map(k=>T.lodgeSetOpen(k));
    o.pew=T.lodgeCanPlace('pew',2,5); o.pewSmall=T.lodgePlaceSmall('skull',10,10);
    D.blueprints=['chapel']; o.chapel=T.lodgeSetOpen('chapel'); o.pewOk=T.lodgeCanPlace('pew',2,5);
    o.fix=T.blueprintsFix(['chapel','fisher','nope','chapel','coral']);
    T.townSave(); T.townReset(); o.kept=T.townData().blueprints; T.townData().blueprints=[];
    /* the tray: the set chip, then that set's pieces */
    T.townBuildSet(true); const row=document.getElementById('townTrow');
    o.first=row.children[1]&&row.children[1].id; o.chips0=[...row.querySelectorAll('[data-lodge]')].map(b=>b.dataset.lodge).join();
    document.getElementById('townSet').click(); o.set1=T.TWN.set; o.chips1=[...row.querySelectorAll('[data-lodge]')].map(b=>b.dataset.lodge).join();
    o.lockedA=row.querySelectorAll('.locked').length;
    for(let i=0;i<2;i++)document.getElementById('townSet').click(); o.set3=T.TWN.set;
    const chips=[...row.querySelectorAll('[data-lodge]')]; o.lockedChips=chips.filter(c=>c.classList.contains('locked')).length+'/'+chips.length; o.lockImgs=row.querySelectorAll('img.town-lock').length;
    chips[0].click(); o.pickLocked=T.TWN.pick; o.say=document.getElementById('townTmsg').textContent; o.setSay=(()=>{document.getElementById('townSet').click(); return document.getElementById('townTmsg').textContent;})();
    T.townBuildSet(false);
    /* developer mode opens every set and writes nothing */
    const before=localStorage.getItem('ll-town'); T.setDev(true); T.townReset(); const DD=T.townData(); DD.res={timber:900,iron:900,tallow:900,curios:90};
    o.dev=['chapel','observ','coral'].map(k=>T.lodgeSetOpen(k)); o.devPlace=T.lodgePlace('pew',2,5); T.lodgePlace('wheel',3,0); T.townSave();
    const after=localStorage.getItem('ll-town'); T.setDev(false); T.townReset(); o.devSame=before===after; o.real=T.lodgeRoom(T.townData()).furn.some(e=>e.id==='pew');
    return o;})()`);
  ok(s.open.join()==='true,true,true,false,false,false','Fisherman’s and the Old Library are open from the start; the other three are not',s.open);
  ok(/locked/.test(s.pew)&&/Peddler/.test(s.pew)&&/Peddler/.test(s.pewSmall),'a locked set’s piece is refused, and says whom to ask',s);
  ok(s.chapel&&s.pewOk==='','a blueprint opens its set',s);
  ok(s.fix.join()==='chapel,coral'&&s.kept.join()==='chapel','ll-town.blueprints keeps only sets that are bought, once each, and survives a reload',s);
  ok(s.first==='townSet'&&s.set1==='fisher'&&/^stove,chest,wheel,baro,shiplamp,anchor,lantern,bottle$/.test(s.chips1)&&/^planks,parquet,flags,damp,library,brass$/.test(s.chips0),'the tray’s first chip is the set on show; each set shows its own pieces',s);
  ok(s.set3==='chapel'&&s.lockedChips==='8/8'&&s.lockImgs===8&&s.lockedA===0,'a set not yet bought shows locked, a padlock on each piece',s);
  ok(s.pickLocked===null&&/Peddler/.test(s.say)&&/Peddler/.test(s.setSay),'tapping a locked piece chooses nothing and says "Ask the Peddler"',s);
  ok(s.dev.join()==='true,true,true'&&s.devPlace===''&&s.devSame&&!s.real,'developer mode opens every set, and writes nothing to ll-town',s);

  /* 3. wall mounts, in all three rooms: wall tiles, never floor; the hang list keeps the ladder, the shelf, the lamps and the
     roof clear; no two overlap; Free to the pixel; saved; the walk is untouched */
  const wm=await p.evaluate(`(()=>{const T=__t, o={}, D=(${setup})('main');
    const why=(id,c,x)=>{const w=T.lodgeCanPlace(id,c,0,x,x!=null?0:undefined); return w===''?'ok':w;};
    o.main=[3,6,8,2,4,5,1,7].map(c=>why('wheel',c));
    o.row0=T.lodgePlace('wheel',3,0); o.dup=T.lodgePlace('baro',3,0); o.near=why('baro',3,56);
    const f=T.lodgeRoom().furn.find(e=>e.id==='wheel'); o.at=[f.c,f.r,f.x==null,f.y==null]; o.tiles=T.lodgeAt(3,0)===f&&T.lodgeAt(3,1)===f&&!T.lodgeAt(3,2);
    o.solid=[T.townSolid(3,0),T.townSolid(3,1),!T.townSolid(3,2),!T.townSolid(3,3)];
    o.floorUnder=T.lodgePlace('stove',3,2)+T.lodgeCanPlace('stove',3,3);
    o.free=[96,100,112,114,128,129,15,16].map(x=>why('baro',3,x));
    o.cellar=null;
    for(const m of ['cellar','attic']){T.lodgeGo(m); const cs=m==='cellar'?[1,3,2,7,5]:[3,6,2,4,7];
      o[m]=cs.map(c=>why('wheel',c)); o[m+'Put']=T.lodgePlace('wheel',cs[0],0); o[m+'Furn']=T.lodgeRoom().furn.map(e=>e.id+e.c+','+e.r).join();}
    T.lodgeGo('main'); o.mainStill=T.lodgeRoom().furn.map(e=>e.id).join();
    /* a mount in the Cellar hangs above the brine: its art is not wetted */
    T.lodgeGo('cellar'); const w=T.lodgeArt().props.find(q=>q.c.width===T.lodgeFA('wheel',0).cv.width&&q.base===30); o.dry=!!w&&w.c===T.lodgeFA('wheel',0).cv;
    T.lodgeGo('main'); T.townSave(); T.townReset(); const L=T.townData().lodge; o.saved=[L.furn.find(e=>e.id==='wheel').r,L.rooms.cellar.furn.length,L.rooms.attic.furn.length];
    /* a saved wall that no longer takes it comes up and pays back; a mount on the floor row hangs on the wall instead */
    const res={timber:0,iron:0,tallow:0,curios:0}, bad=T.lodgeRoomFix({furn:[{id:'wheel',c:2,r:0},{id:'baro',c:6,r:5},{id:'portrait',c:6,r:0},{id:'portrait',c:8,r:0,x:130,y:0},{id:'candle',c:5,r:5},{id:'anchor',c:4,r:0}]},'main',res,true);
    o.fix=[bad.furn.map(e=>e.id+e.c+','+e.r+(e.x!=null?'@'+e.x:'')).join(' '),res.timber,res.iron,res.tallow];
    return o;})()`);
  ok(wm.main.join()==='ok,ok,ok,The ladder is in the way.,The shelf is in the way.,The shelf is in the way.,The sconce is in the way.,The sconce is in the way.','the main room’s wall takes a mount at three places; the ladder, the shelf and the sconces keep theirs',wm.main);
  ok(wm.row0===''&&/already/.test(wm.dup)&&/shelf/.test(wm.near),'a mount goes up, and no two overlap',wm);
  ok(wm.at.join()==='3,0,true,true'&&wm.tiles,'on the grid a mount stands on its wall tiles, in the wall’s first row',wm.at);
  ok(wm.solid.every(x=>x)&&wm.floorUnder==='','a mount holds wall tiles and no floor: the floor below it is as free as before',wm);
  ok(wm.free.join()==='ok,The sconce is in the way.,The sconce is in the way.,The sconce is in the way.,ok,The wall ends there.,The wall ends there.,The sconce is in the way.','Free hangs to the pixel, and the wall’s ends and lamps still hold',wm.free);
  ok(wm.cellar.join()==='ok,ok,The sconce is in the way.,The ladder is in the way.,ok','the Cellar’s wall takes a mount; its ladder and its sconce keep theirs',wm.cellar);
  ok(wm.attic.join()==='ok,ok,The roof is in the way.,The window is in the way.,The roof is in the way.','the Attic’s wall takes a mount between its roof and its window',wm.attic);
  ok(wm.cellarPut===''&&wm.atticPut===''&&wm.cellarFurn==='wheel1,0'&&wm.atticFurn==='wheel3,0'&&wm.mainStill==='wheel,stove','a mount hangs in each room, and each room keeps its own',wm);
  ok(wm.dry,'a mount in the Cellar hangs above the brine, dry',wm.dry);
  ok(wm.saved.join()==='0,1,1','a mount is saved on the wall and survives a reload',wm.saved);
  ok(wm.fix[0]==='baro6,0'&&wm.fix.slice(1).join()==='16,10,5','a saved wall that no longer takes a mount takes it up and pays it back: one on the ladder, one over another, one past the wall’s end, one on the shelf, a loose small thing; one on the floor row hangs on the wall',wm.fix);

  /* 4. small things on surfaces: half-tile slots along a piece's top; the nearest free one; the host carries them */
  const sf=await p.evaluate(`(()=>{const T=__t, o={}, D=(${setup})('main'); T.townBuildSet(true);
    const R0=Object.assign({},D.res); T.lodgePlace('desk',2,4); const desk=T.lodgeRoom().furn.find(e=>e.id==='desk'), pt=i=>T.lodgeSlotPoint(desk,i);
    o.pts=[0,1,2,3].map(i=>pt(i).map(Math.round));
    const t0=D.res.tallow;
    o.p1=T.lodgePlaceSmall('candle',pt(1)[0]+1,pt(1)[1]-3); o.s1=desk.on.map(q=>q.id+q.s).join(); o.paid=t0-D.res.tallow;
    o.p2=T.lodgePlaceSmall('books',pt(1)[0],pt(1)[1]-3); o.s2=desk.on.map(q=>q.id+q.s).join();
    o.off=T.lodgePlaceSmall('ink',2,2);
    T.lodgePlaceSmall('ink',pt(3)[0],pt(3)[1]); T.lodgePlaceSmall('bottle',pt(2)[0],pt(2)[1]);
    o.full=T.lodgePlaceSmall('lantern',pt(0)[0],pt(0)[1]); o.n=desk.on.length;
    o.cost=JSON.stringify(T.lodgeCostOf(desk));
    /* art: the desk and its four, a candle that lights the room */
    const A=T.lodgeArt(); o.props=A.props.length; o.lights=A.lights.length;
    /* lifting the table lifts what is on it */
    T.bldTap(2,4); const L=T.TWN.lift; o.lifted=L&&L.d===desk; o.artN=L&&L.art.length; o.props2=T.lodgeArt().props.length;
    T.bldLiftTo(5*16,5*16); o.why=L.why; T.bldDrop();
    o.moved=[desk.c,desk.r,desk.on.length]; o.pt0=pt(0).map(Math.round);
    /* store it whole, with everything on it; set it down again for nothing */
    T.bldTap(5,5); T.bldStow(); const st=D.store[0]; o.stored=[st.id,(st.on||[]).length,JSON.stringify(st.cost)===o.cost,T.lodgeRoom().furn.length];
    T.TWN.tab='store'; T.TWN.pick='desk'; T.bldTap(3,5); const d2=T.lodgeRoom().furn.find(e=>e.id==='desk'); o.back=[d2.on&&d2.on.length,D.store.length]; T.TWN.tab='pieces'; T.TWN.pick=null;
    /* salvage gives back all of it */
    T.bldTap(3,5); T.bldStow(); T.bldSalvage('desk'); o.salvage=Object.keys(R0).every(k=>D.res[k]===R0[k]);
    T.townBuildSet(false); return o;})()`);
  console.log(JSON.stringify(sf));
  ok(sf.pts.every((p2,i)=>i===0||p2[0]-sf.pts[i-1][0]===8||Math.abs(p2[0]-sf.pts[i-1][0]-7.5)<1.01),'the desk’s four slots are half a tile apart',sf.pts);
  ok(sf.p1===''&&sf.s1==='candle1'&&sf.paid===1,'a small thing goes in the slot nearest the thumb, and costs what it costs',sf);
  ok(sf.p2===''&&sf.s2==='candle1,books0','the next goes in the nearest free slot',sf.s2);
  ok(/Set it on/.test(sf.off)&&/no room/.test(sf.full)&&sf.n===4,'not on a surface, or on a full one, it is refused',sf);
  ok(sf.props===10&&sf.lights===3,'the host and each small thing are drawn, and a candle or a lantern lights the room',sf);
  ok(sf.lifted&&sf.artN===5&&sf.props2===sf.props-5,'lifting the table lifts what is on it',sf);
  ok(sf.moved.join()==='5,5,4','it comes down where it is put, with all four',sf.moved);
  ok(sf.stored[0]==='desk'&&sf.stored[1]===4&&sf.stored[2]&&sf.stored[3]===0&&sf.back[0]===4&&sf.back[1]===0,'Store keeps the table with all that was on it, and what it cost; it goes back down for nothing',sf);
  ok(sf.salvage,'Salvage gives back all of it: the table and everything on it',sf);

  /* 4b. light: each set has a wall light, and the Library and the Chapel a standing one; they light the room from where they are,
     a lamp steadily, a flame guttering, the Glow-Anemone cold */
  const lt=await p.evaluate(`(()=>{const T=__t, I=T.LODGE_ITEMS, o={}, D=(${setup})('main'); D.blueprints=['chapel','observ','coral'];
    const lit=Object.keys(I).filter(k=>I[k].light);
    o.lit=lit.join(); o.wall=lit.filter(k=>I[k].mount).map(k=>I[k].set).join(); o.floor=lit.filter(k=>!I[k].mount&&!I[k].small).join();
    const n0=T.lodgeArt().lights.length; const c=[1,6,8,3,3];
    T.lodgePlace('shiplamp',3,0); T.lodgePlace('sconce',6,0); T.lodgePlace('floorlamp',2,5); T.lodgeGo('attic'); T.lodgePlace('walllamp',3,0); T.lodgePlace('anemone',6,0);
    const A=T.lodgeArt(); o.attic=A.lights.filter(l=>l.col==='cold').length; o.steady=A.lights.filter(l=>l.f<=.2&&l.col!=='cold').length;
    T.lodgeGo('main'); const M=T.lodgeArt(); o.main=M.lights.length-n0; o.em=M.em.length;
    const sc=T.lodgeRoom().furn.find(e=>e.id==='sconce'), a=T.lodgeFA('sconce',0); o.pos=[Math.round(M.lights.find(l=>Math.abs(l.r-28)<.1).x)===sc.c*16+a.dx+a.lx];
    /* a lit mount is still a mount: wall tiles, no floor */
    o.solid=[T.townSolid(6,2)];
    return o;})()`);
  ok(lt.wall.split(',').sort().join()==='chapel,coral,fisher,library,observ','a wall light for each set',lt);
  ok(lt.floor.split(',').sort().join()==='candelabra,floorlamp,stove','a standing lamp and a candelabra besides the stove',lt.floor);
  ok(lt.main===3&&lt.attic===2&&lt.steady>=1&&lt.pos[0]&&lt.solid[0]===false,'each light the room from where it is: a wall lantern, a sconce and a lamp in the main room (3), a lamp and a cold anemone in the Attic, beside its window’s own cold light; a lit mount blocks no floor',lt);

  /* 5. a small thing can be lifted, moved to another surface, stored, and set down from Storage; Undo takes each deed back */
  const it=await p.evaluate(`(()=>{const T=__t, o={}, D=(${setup})('main'); T.townBuildSet(true);
    T.lodgePlace('desk',2,4); T.lodgePlace('chest',6,4); const desk=T.lodgeRoom().furn.find(e=>e.id==='desk'), chest=T.lodgeRoom().furn.find(e=>e.id==='chest');
    T.lodgePlaceSmall('candle',...T.lodgeSlotPoint(desk,0)); const c=desk.on[0];
    const pt=T.lodgeSlotPoint(desk,0);
    /* a tap on it lifts it, not the desk */
    T.TWN.tapPx=[pt[0],pt[1]-3]; T.bldTap(2,4); const L=T.TWN.lift; o.lift=!!L&&L.item===true&&L.d===c&&T.BLD_SKIP===c&&!T.lodgeArt().props.some(q=>q.c===T.lodgeFA('candle',0).cv);
    o.turn=T.bldTurn(1)===false&&L.f===0;
    /* moved to the chest, red where there is no surface */
    T.bldLiftTo(100,120); o.red=L.why; T.bldLiftTo(...T.lodgeSlotPoint(chest,1)); o.green=[L.why,L.host===chest,L.s];
    T.bldDrop(); o.moved=[desk.on&&desk.on.length||0,chest.on.map(q=>q.id+q.s).join()];
    T.bldUndo(); o.undone=[desk.on.map(q=>q.id+q.s).join(),chest.on&&chest.on.length||0];
    /* cancel leaves it where it was */
    T.TWN.tapPx=[pt[0],pt[1]-3]; T.bldTap(2,4); T.bldLiftTo(...T.lodgeSlotPoint(chest,0)); T.bldCancel(); o.cancel=[desk.on.length,chest.on&&chest.on.length||0,T.TWN.lift,T.BLD_SKIP];
    /* store it: it waits in Storage and is set down from there on any surface, for nothing */
    const t0=D.res.tallow; T.TWN.tapPx=[pt[0],pt[1]-3]; T.bldTap(2,4); T.bldStow(); o.stored=[D.store.map(e=>e.id).join(),desk.on&&desk.on.length||0,D.res.tallow===t0];
    T.TWN.tab='store'; T.TWN.pick='candle'; const cp=T.lodgeSlotPoint(chest,0); T.TWN.tapPx=[cp[0],cp[1]-3]; T.bldTap(6,4);
    o.placed=[chest.on&&chest.on.map(q=>q.id+q.s).join(),D.store.length,D.res.tallow===t0,T.TWN.pick];
    T.bldUndo(); o.undoStore=[chest.on&&chest.on.length||0,D.store.length]; T.TWN.tab='pieces';
    T.bldUndo(); o.undoStow=[desk.on&&desk.on.map(q=>q.id).join(),D.store.length];
    /* bought: Undo gives the tallow back */
    T.TWN.pick='books'; T.TWN.tapPx=[cp[0],cp[1]-3]; const t1=D.res.timber; T.bldTap(6,4); o.bought=[chest.on&&chest.on.map(q=>q.id).join(),t1-D.res.timber]; T.bldUndo(); o.refund=[D.res.timber===t1,chest.on&&chest.on.length||0];
    T.townBuildSet(false); return o;})()`);
  console.log(JSON.stringify(it));
  ok(it.lift&&it.turn,'a tap on a small thing lifts it, not the table; it does not turn',it);
  ok(/Set it on/.test(it.red)&&it.green.join()===',true,1','red over bare floor, green over a free slot',it);
  ok(it.moved.join()==='0,candle1','it moves to another surface',it);
  ok(it.undone.join()==='candle0,0','Undo puts it back on the first',it.undone);
  ok(it.cancel[0]===1&&it.cancel[1]===0&&it.cancel[2]===null&&it.cancel[3]===null,'Cancel leaves it where it was',it.cancel);
  ok(it.stored.join()==='candle,0,true','Store takes it off, whole, and keeps what it cost',it.stored);
  ok(it.placed[0]==='candle0'&&it.placed[1]===0&&it.placed[2]===true&&it.placed[3]===null,'from Storage it is set on any surface for nothing',it.placed);
  ok(it.undoStore.join()==='0,1'&&it.undoStow.join()==='candle,0','Undo takes each deed back, in turn',it);
  ok(it.bought.join()==='books,3'&&it.refund.join()==='true,0','a bought one gives back what it cost when undone',it);

  /* 6. surfaces in the other rooms: the Cellar (the host stands in the brine, what is on it stays dry) and the Attic */
  const rm=await p.evaluate(`(()=>{const T=__t, o={}, D=(${setup})('main');
    for(const m of ['cellar','attic']){T.lodgeGo(m); T.lodgePlace('chest',4,4); const h=T.lodgeRoom().furn.find(e=>e.id==='chest'), n0=T.lodgeArt().lights.length;
      o[m]=[T.lodgePlaceSmall('lantern',...T.lodgeSlotPoint(h,0)),T.lodgePlaceSmall('books',...T.lodgeSlotPoint(h,1)),h.on.length,T.lodgeArt().lights.length-n0];
      T.townFrame&&T.townFrame(1/30);}
    T.lodgeGo('main'); o.main=T.lodgeRoom().furn.length;
    T.townSave(); T.townReset(); const L=T.townData().lodge; o.saved=[L.rooms.cellar.furn[0].on.map(q=>q.id+q.s).join(),L.rooms.attic.furn[0].on.map(q=>q.id+q.s).join()];
    return o;})()`);
  ok(rm.cellar[0]===''&&rm.cellar[1]===''&&rm.cellar[2]===2&&rm.attic[2]===2&&rm.main===0&&rm.saved.join()==='lantern0,books1 lantern0,books1'.replace(' ',','),'small things stand on a chest in the Cellar and the Attic, each in its own room, and are saved there',rm);
  ok(rm.cellar[3]===1&&rm.attic[3]===1,'a lantern lights the room it stands in: one more light in each room, and a book none',rm);

  /* 7. dyes: the next colourway for tallow, back to the piece’s own for the tallow back; a swap of palette letters */
  const dy=await p.evaluate(`(()=>{const T=__t, o={}, D=(${setup})('main'); T.townBuildSet(true);
    T.lodgePlace('desk',2,4); const desk=T.lodgeRoom().furn.find(e=>e.id==='desk'); T.lodgePlaceSmall('candle',...T.lodgeSlotPoint(desk,0));
    T.bldTap(2,4); const t=()=>D.res.tallow;
    /* poor: the first dye is refused, and nothing changes */
    D.res.tallow=1; const r2=T.bldDye(); o.poor=[r2,desk.dye||'-',D.res.tallow,document.getElementById('townTmsg').textContent];
    D.res.tallow=500; const t0=t(), seq=[];
    for(let i=0;i<5;i++){const r=T.bldDye(); seq.push([r,desk.dye||'-',t0-t()]);} o.seq=seq.map(x=>x.join(':')).join(' ');
    /* art: a swap of letters; the candle on it is not dyed with it */
    const cnt=(cv)=>{const d=cv.getContext('2d').getImageData(0,0,cv.width,cv.height).data; let s=0; for(let i=0;i<d.length;i++)s+=d[i]*(i%7+1); return s;};
    o.differs=['tar','wine','bleach'].map(y=>cnt(T.lodgeFA('desk',0,y).cv)!==cnt(T.lodgeFA('desk',0).cv)); o.threeApart=new Set(['tar','wine','bleach'].map(y=>cnt(T.lodgeFA('desk',0,y).cv))).size;
    o.shape=[T.lodgeFA('desk',0,'tar').cv.width===T.lodgeFA('desk',0).cv.width,T.lodgeFA('desk',0,'tar').top.join()===T.lodgeFA('desk',0).top.join()];
    T.bldDrop(); o.dyed=desk.dye;
    T.bldUndo(); o.undo=[desk.dye||'-',D.res.tallow];
    /* it keeps its colourway through Store and a reload, and so does what is on it */
    T.bldTap(2,4); T.bldDye(); T.bldDye(); const t2=D.res.tallow; T.bldStow(); o.st=[D.store[0].dye,(D.store[0].on||[]).length,D.store[0].cost.tallow];
    T.TWN.tab='store'; T.TWN.pick='desk'; T.bldTap(3,5); const d2=T.lodgeRoom().furn.find(e=>e.id==='desk'); o.back=[d2.dye,d2.on.length,D.res.tallow===t2];
    T.TWN.tab='pieces'; T.TWN.pick=null; T.townBuildSet(false); T.townSave(); T.townReset(); const L=T.townData().lodge.furn.find(e=>e.id==='desk'); o.saved=[L.dye,L.on.length];
    /* a small thing takes a dye too */
    T.townOpen&&0; T.townBuildSet(true); const L2=T.lodgeRoom().furn.find(e=>e.id==='desk'); const q=L2.on[0]; T.bldLiftItem(L2,q); T.bldDye(); T.bldDrop(); o.small=q.dye;
    T.townBuildSet(false);
    o.bad=T.dyeFix('verd',T.LODGE_ITEMS.desk)===null&&T.dyeFix('tar',T.LODGE_ITEMS.desk)==='tar';
    return o;})()`);
  console.log(JSON.stringify(dy));
  ok(dy.seq==='true:tar:2 true:wine:2 true:bleach:2 true:-:0 true:tar:2','Dye cycles the piece’s colourways, 2 tallow for any but its own, and gives it back',dy.seq);
  ok(dy.differs.every(x=>x)&&dy.threeApart===3&&dy.shape.every(x=>x),'a colourway is a different swap of letters on the same art',dy);
  ok(dy.poor[0]===false&&/You need 1 more tallow/.test(dy.poor[3])&&dy.poor[1]==='-'&&dy.poor[2]===1,'too poor for a dye, it stays as it is and says so',dy.poor);
  ok(dy.dyed==='tar'&&dy.undo[0]==='-'&&dy.undo[1]===500,'Undo takes a dye back, with its tallow',dy);
  ok(dy.st[0]==='wine'&&dy.st[1]===1&&dy.back[0]==='wine'&&dy.back[1]===1&&dy.back[2]&&dy.saved.join()==='wine,1','Store keeps the colourway, what is on it and what it cost; both survive a reload',dy);
  ok(dy.small==='bleach'&&dy.bad,'a small thing takes a dye of its own (the candle’s: Salt-bleached), and only a piece’s own colourways are kept',dy);

  /* 8. the real tray: the Dye button is the Lodge’s, a mount or a small thing is chosen and set with a tap */
  const ui=await p.evaluate(`(()=>{const T=__t, o={}, D=(${setup})('main'); T.townBuildSet(true);
    const dye=document.getElementById('townDye'); o.dyeIdle=[dye.hidden,dye.disabled];
    document.getElementById('townSet').click(); document.getElementById('townSet').click();   /* fisher, library... see below */
    o.set=T.TWN.set; T.TWN.set='fisher'; T.townTrayUI(); T.townBuildSet(false); T.townBuildSet(true);
    const chip=id=>document.querySelector('#townTrow [data-lodge="'+id+'"]');
    chip('wheel').click(); o.pickWheel=T.TWN.pick; o.say=document.getElementById('townTmsg').textContent;
    /* a tap on the floor under the wall's column hangs it there */
    T.TWN.tapPx=null; T.bldTap(6,6); const w=T.lodgeRoom().furn.find(e=>e.id==='wheel'); o.wheel=w&&[w.c,w.r];
    chip('wheel').click(); T.bldTap(2,6); o.ladder=T.lodgeRoom().furn.filter(e=>e.id==='wheel').length;
    /* tapped on the wall, a mount lifts and slides along it, held to the wall; Free hangs it to the pixel */
    T.TWN.pick=null; T.TWN.tapPx=[6*16+8,20]; T.bldTap(6,1); o.mountLift=!!T.TWN.lift&&T.TWN.lift.d===w; T.bldLiftTo(40,90); o.slide=[T.TWN.lift.x,T.TWN.lift.y,T.TWN.lift.why];
    T.bldDrop(); o.dropped=[w.c,w.r,w.x==null]; T.townData().free=true; T.TWN.tapPx=[3*16+8,20]; T.bldTap(3,1); T.bldLiftTo(98,60); T.bldDrop(); o.free=[w.c,w.r,w.x,w.y]; T.townData().free=false;
    document.getElementById('townTmsg').textContent='';
    T.TWN.pick=null; chip('chest').click(); T.bldTap(4,5); const ch=T.lodgeRoom().furn.find(e=>e.id==='chest');
    chip('lantern').click(); o.pickLantern=T.TWN.pick; const sp=T.lodgeSlotPoint(ch,0); T.TWN.tapPx=[sp[0],sp[1]-3]; T.bldTap(4,5); o.lantern=ch.on&&ch.on.map(q=>q.id).join();
    /* lifting a piece shows Place, Cancel, Store, ⟳ and Dye; the Dye button is live for a piece with colourways */
    T.TWN.pick=null; T.TWN.tapPx=[4*16+8,5*16+12]; T.bldTap(4,5); o.lifted=!!T.TWN.lift&&T.TWN.lift.d===ch; const bar=[...document.querySelectorAll('#townLiftBar .town-tb')].filter(x=>!x.hidden).map(x=>x.id);
    o.bar=bar.join(); o.dyeLive=[document.getElementById('townDye').disabled,document.getElementById('townTurn').disabled];
    document.getElementById('townDye').click(); o.dyed=ch.dye; T.bldCancel();
    /* a small thing lifted: ⟳ is disabled */
    T.TWN.tapPx=[sp[0],sp[1]-3]; T.bldTap(4,5); o.turnOff=[document.getElementById('townTurn').disabled,T.TWN.lift&&T.TWN.lift.item]; T.bldCancel();
    T.townBuildSet(false); T.lodgeLeave(); T.townBuildSet(true); o.town=[document.getElementById('townDye').hidden,!!document.getElementById('townSet')]; T.townBuildSet(false); T.townClose();
    return o;})()`);
  console.log(JSON.stringify(ui));
  ok(ui.dyeIdle[0]===false&&ui.dyeIdle[1]===true,'in the Lodge the Dye button is there, and idle until a piece is lifted',ui.dyeIdle);
  ok(ui.pickWheel==='wheel'&&/tap the wall/.test(ui.say)&&ui.wheel&&ui.wheel.join()==='6,0'&&ui.ladder===1,'a mount chosen on the tray goes on the wall in the column tapped, wherever on the room; not where something is',ui);
  ok(ui.mountLift&&ui.slide.join()==='48,0,'&&ui.dropped.join()==='3,0,true'&&ui.free.join()==='6,0,98,0','a tap on a mount lifts it, it slides along the wall and never off it; in Free it hangs to the pixel',ui);
  ok(ui.pickLantern==='lantern'&&ui.lantern==='lantern','a small thing chosen on the tray is set on the surface tapped',ui);
  ok(ui.lifted&&/townDrop/.test(ui.bar)&&/townDye/.test(ui.bar)&&ui.dyeLive.join()==='false,false'&&ui.dyed==='tar','a lifted piece shows Dye beside ⟳, live when it has colourways',ui);
  ok(ui.turnOff[0]===true&&ui.turnOff[1]===true,'a small thing lifted cannot be turned',ui.turnOff);
  ok(ui.town[0]===true&&ui.town[1]===false,'on the square there is no Dye and no set chip',ui.town);

  /* 9. old saves load as they were; what is no longer valid is dropped and paid back */
  const old=await p.evaluate(()=>{const T=__t, res={timber:0,iron:0,tallow:0,curios:0};
    const a=T.townFix({res:{timber:0,iron:0,tallow:0,curios:0},lodge:{built:true,floor:'parquet',wall:'library',furn:[{id:'desk',c:2,r:4},{id:'stove',c:5,r:5,f:2},{id:'rug',c:5,r:6},{id:'chair',c:2,r:7,f:5},{id:'shelf',c:8,r:3}]}});
    const o={furn:a.lodge.furn.map(e=>e.id+e.c+','+e.r+'/'+(e.f|0)+(e.dye||'')+(e.on?'+':'')).join(' '),bp:a.blueprints};
    const b=T.townFix({res:{timber:0,iron:0,tallow:0,curios:0},blueprints:['coral','fisher','x'],lodge:{built:true,furn:[{id:'desk',c:2,r:4,dye:'nope',on:[{id:'candle',s:9},{id:'wheel',s:0},{id:'candle',s:1,dye:'bleach'},{id:'books',s:1},{id:'ink',s:0,dye:'verd'}]},{id:'chest',c:6,r:4,dye:'tar'}]},store:[{s:'lodge',id:'chest',dye:'bad'},{s:'lodge',id:'chair',dye:'wine'},{s:'town',id:'lamp',dye:'wine'},{s:'lodge',id:'desk',on:[{id:'candle',s:3},{id:'candle',s:3},{id:'books',s:7}]}]});
    o.b=[b.blueprints.join(),b.lodge.furn[0].dye||'-',(b.lodge.furn[0].on||[]).map(q=>q.id+q.s+(q.dye||'')).join(),b.lodge.furn[1].dye,b.res.timber,b.res.curios,b.res.tallow,b.res.iron];
    o.store=b.store.map(e=>e.id+(e.dye||'-')+(e.on?e.on.length:0)).join();
    return o;});
  console.log(JSON.stringify(old));
  ok(old.furn==='desk2,4/0 stove5,5/2 rug5,6/0 chair2,7/5 shelf8,3/0'&&old.bp.length===0,'a Lodge from before the catalogue loads exactly as it was',old);
  ok(old.b[0]==='coral'&&old.b[1]==='-'&&old.b[2]==='candle1bleach,ink0'&&old.b[3]==='tar','a dye or a slot that is not valid is dropped; one that is stays',old.b);
  ok(old.b[4]===3+6&&old.b[5]===0&&old.b[6]===1&&old.b[7]===2,'what comes up pays back: a book in a slot taken, a candle past the top, a wheel that is no small thing',old.b);
  const junk=await p.evaluate(()=>{const res={timber:0,iron:0,tallow:0,curios:0}; let err=null, f=null;
    try{f=__t.lodgeRoomFix({furn:[{id:'desk',c:0,r:0,on:[{id:'nope',s:0},null,{id:'candle',s:1}]},{id:'chest',c:7,r:5,on:'x'},{id:'shelf',c:0,r:1,on:{}}]},'main',res,true);}catch(e){err=String(e);}
    return {err,furn:f&&f.furn.map(e=>e.id).join(),tallow:res.tallow,timber:res.timber};});
  ok(!junk.err&&junk.furn==='chest'&&junk.tallow===1&&junk.timber===22,'a saved piece carrying an item that does not exist, or an `on` that is no list, is repaired, not fatal, and pays back what is real',junk);
  ok(old.store==='chest-0,chairwine0,lamp-0,desk-1','Storage keeps a piece’s colourway and what stood on it, and only valid ones',old.store);

  /* 10. taught: a card for wall mounts, small things and dyes, the first time each is chosen; the rules line grows */
  const teach=await p.evaluate(`(()=>{const T=__t, o={}, D=(${setup})('main');
    localStorage.setItem('ll-tut',JSON.stringify({walk:'done',seen:['lodge','town','townhaul','townbuild','townlift','townfree'],off:false}));
    T.townBuildSet(true); const card=()=>T.TWN.card; o.start=card();
    T.TWN.set='fisher'; T.townTrayUI(); const chip=id=>document.querySelector('#townTrow [data-lodge="'+id+'"]');
    chip('wheel').click(); o.mount=card(); document.getElementById('townCard').click(); chip('wheel').click(); chip('wheel').click(); o.again=card();
    chip('lantern').click(); o.small=card(); document.getElementById('townCard').click();
    T.TWN.pick=null; T.lodgePlace('chest',4,5); T.TWN.tapPx=[4*16+8,5*16+12]; T.bldTap(4,5); document.getElementById('townDye').click(); o.dye=card(); document.getElementById('townCard').click(); document.getElementById('townDye').click(); o.dye2=card();
    T.bldCancel(); T.townBuildSet(false); T.lodgeLeave(); T.townClose();
    localStorage.setItem('ll-tut',JSON.stringify({walk:'done',seen:[],off:true}));
    const tips=['lodgemount','lodgesmall','lodgedye'].map(k=>T.TIPS[k]&&T.TIPS[k].where==='town'&&T.TIPS[k].text.length>60);
    o.tips=tips; o.rules=document.getElementById('rulesList').textContent; return o;})()`);
  ok(teach.start===null&&teach.mount==='lodgemount'&&teach.again===null&&teach.small==='lodgesmall'&&teach.dye==='lodgedye'&&teach.dye2===null,'the first wall mount, small thing and dye each bring one card, once',teach);
  ok(teach.tips.every(x=>x),'tray tips for wall mounts, surfaces and dyes',teach.tips);
  ok(/Old Library/.test(teach.rules)&&/blueprint from the Peddler/.test(teach.rules)&&/hang on the back wall/.test(teach.rules)&&/Dye gives/.test(teach.rules),'the Saltmouth rules line teaches the sets, the wall, small things and dye',teach.rules.slice(0,60));

  for(const f of fails)console.log('FAIL '+f);
  console.log(fails.length?fails.length+' failed':'catalogue ok');
  if(errs.length){console.log('PAGE ERRORS',errs); fails.push('page errors');}
  await b.close(); process.exit(fails.length?1:0);
})();
