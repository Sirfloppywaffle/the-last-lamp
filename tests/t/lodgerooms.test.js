// Saltmouth, Expansion 4, step 3: the Lodge's rooms.
// - ll-town.lodge is the main room as it always was; lodge.rooms.cellar and lodge.rooms.attic each {built, floor, wall, furn}.
//   An old save loads as the main room alone, with both other rooms shut.
// - The Flooded Cellar (25 iron, 10 tallow) under a hatch in the main room's floor, the Attic (30 timber, 2 curios) up a ladder
//   by the shelf. Their tiles are kept clear; #townAct offers "Down to the cellar" / "Up to the attic", and the way back.
// - Each room keeps its own floor, wall and furniture, which turn like the main room's (f, faces, pieceFoot()).
// - The Cellar has brine over its floor (and its pieces' feet); the Attic's round window shows the rain falling outside.
const {chromium}=require('playwright');
const fails=[]; const ok=(c,m,d)=>{if(!c)fails.push(m+(d!==undefined?' '+JSON.stringify(d).slice(0,600):''));};
(async()=>{
  const b=await chromium.launch(); const p=await b.newPage({viewport:{width:412,height:860}});
  const errs=[]; p.on('pageerror',e=>errs.push(String(e)));
  await p.goto('file://'+process.argv[2]); await p.waitForTimeout(300);

  /* 1. old saves: the main room as it was, both other rooms shut; a piece standing where the hatch or the ladder's foot now is
     comes up and pays back; the shape kept only grows */
  const o=await p.evaluate(()=>{const T=__t, out={};
    const old=T.townFix({v:1,res:{timber:0,iron:0,tallow:0,curios:0},lodge:{built:true,floor:'parquet',wall:'library',
      furn:[{id:'chair',c:3,r:4,f:2},{id:'stove',c:1,r:6},{id:'shelf',c:2,r:2},{id:'rug',c:5,r:5}]}});
    const L=old.lodge;
    out.main=[L.built,L.floor,L.wall,L.furn.map(d=>d.id+d.c+','+d.r+'/'+(d.f|0)).join(' ')];
    out.rooms=['cellar','attic'].map(m=>[L.rooms[m].built,L.rooms[m].floor,L.rooms[m].wall,L.rooms[m].furn.length]);
    out.paid=[old.res.iron,old.res.tallow,old.res.timber];
    const none=T.townFix({v:1}); out.none=[none.lodge.built,none.lodge.rooms.cellar.built,none.lodge.rooms.attic.built];
    /* a room marked built in a town whose Lodge is a ruin stays shut */
    const odd=T.townFix({lodge:{built:false,rooms:{cellar:{built:true,furn:[{id:'chair',c:3,r:3}]}}}}); out.odd=[odd.lodge.rooms.cellar.built,odd.lodge.rooms.cellar.furn.length];
    /* a broken room: what stands on the way back up comes up and pays back */
    const bad=T.townFix({res:{timber:0,iron:0,tallow:0,curios:0},lodge:{built:true,rooms:{cellar:{built:true,floor:'nope',furn:[{id:'stove',c:7,r:2},{id:'chair',c:3,r:3},{id:'desk',c:-1,r:4}]},attic:{built:true,wall:'brass',furn:[{id:'rug',c:1,r:2}]}}}});
    out.bad=[bad.lodge.rooms.cellar.floor,bad.lodge.rooms.cellar.furn.map(d=>d.id).join(),bad.lodge.rooms.attic.wall,bad.lodge.rooms.attic.furn.length,bad.res.iron,bad.res.timber,bad.res.tallow,bad.res.curios];
    return out;});
  console.log(JSON.stringify(o));
  ok(o.main[0]===true&&o.main[1]==='parquet'&&o.main[2]==='library'&&o.main[3]==='grimoire4,2/0 chair3,4/2 rug5,5/0 sconce1,0/0 sconce7,0/0','an old Lodge loads as the main room, as it was, with its Grimoire and the two sconces it was built with',o.main);
  ok(o.paid[0]===10&&o.paid[1]===2&&o.paid[2]===10,'a stove on the new hatch and a shelf on the ladder’s foot come up and pay back',o.paid);
  ok(o.rooms[0].join()==='false,flags,damp,0'&&o.rooms[1].join()==='false,planks,damp,0','both other rooms start shut and bare, each with its own floor and wall',o.rooms);
  ok(o.none.join()==='false,false,false'&&o.odd.join()==='false,0','no Lodge, no rooms',o);
  ok(o.bad[0]==='flags'&&o.bad[1]==='chair,sconce'&&o.bad[2]==='brass'&&o.bad[3]===0&&o.bad[4]===10+4&&o.bad[5]===12&&o.bad[6]===2+8&&o.bad[7]===1,'a broken room keeps what fits and pays back the rest',o.bad);

  /* 2. the main room's hatch and ladder: solid, kept clear, tapped, and shut until bought; buying takes the whole cost, once */
  const r=await p.evaluate(()=>{const T=__t, W=T.TWN, out={};
    localStorage.removeItem('ll-town'); T.townReset(); T.setDev(false); T.townOpen();
    const td=T.townData(); td.res={timber:30,iron:15,tallow:0,curios:0}; T.townRestoreLodge(); T.lodgeEnter();
    while(!document.getElementById('townCardWrap').hidden)document.getElementById('townCard').click();
    out.solid=[T.townSolid(1,6),T.townSolid(2,1),T.townSolid(2,0),!T.townSolid(2,2),!T.townSolid(1,7)];
    td.res={timber:100,iron:100,tallow:100,curios:10};
    out.keep=[T.lodgeCanPlace('stove',2,2),T.lodgeCanPlace('stove',1,7),T.lodgeCanPlace('rug',2,5),T.lodgeCanPlace('chair',1,6),T.lodgeCanPlace('rug',1,6)];
    /* a tap on the hatch walks beside it and shows what opens the Cellar */
    T.lodgeTapTile(1,6); out.goal=!!(W.goal&&W.goal.way==='C');
    for(let i=0;i<400&&(W.path||W.goal);i++)T.townStep(1/30);
    out.at=[+W.p.x.toFixed(2),+W.p.y.toFixed(2)]; out.card=document.getElementById('mTitle').textContent; out.cardBody=document.getElementById('mBody').textContent;
    document.getElementById('modal').hidden=true;
    W.near=undefined; T.townStep(1/30); out.label=document.getElementById('townAct').textContent;
    td.res={timber:29,iron:24,tallow:10,curios:1};
    out.poor=[T.lodgeBuyRoom('cellar'),T.lodgeBuyRoom('attic'),T.lodgeWay(T.LODGE_WAYS.C),T.lodgeCur()];
    document.getElementById('modal').hidden=true;
    td.res={timber:30,iron:25,tallow:12,curios:2};
    out.buy=[T.lodgeBuyRoom('cellar'),T.lodgeBuyRoom('cellar')]; out.r1=Object.assign({},td.res);
    W.near=undefined; T.townStep(1/30); out.label2=document.getElementById('townAct').textContent;
    out.buyA=T.lodgeBuyRoom('attic'); out.r2=Object.assign({},td.res);
    W.p.x=2.5; W.p.y=2.5; W.near=undefined; T.townStep(1/30); out.label3=document.getElementById('townAct').textContent;
    const s=JSON.parse(localStorage.getItem('ll-town')).lodge; out.saved=[s.built,s.rooms.cellar.built,s.rooms.attic.built,s.floor];
    /* the main room's art: the hatch open, the ladder whole, now both are bought */
    out.sigs=T.lodgeArt().sig.split('|').slice(0,2).join('|');
    return out;});
  console.log(JSON.stringify(r));
  ok(r.solid.every(Boolean),'the hatch and the ladder are solid; the ground before each is not',r.solid);
  ok(/ladder/.test(r.keep[0])&&/hatch/.test(r.keep[1])&&r.keep[2]===''&&/hatch/.test(r.keep[3])&&/hatch/.test(r.keep[4]),'nothing solid on the ground before the ladder or the hatch, nothing at all over the hatch; a rug may lie beside it',r.keep);
  ok(r.goal&&r.at[0]===1.5&&r.at[1]===7.5&&/Flooded Cellar/.test(r.card)&&/Shut/.test(r.card)&&/25 iron, 10 tallow/.test(r.cardBody),'a tap on the hatch walks beside it and shows what opens the Cellar',r);
  ok(r.label==='The hatch','shut, the button names the hatch',r.label);
  ok(!r.poor[0]&&!r.poor[1]&&!r.poor[2]&&r.poor[3]==='main','short of the cost, nothing opens and nobody goes down',r.poor);
  ok(r.buy[0]&&!r.buy[1]&&r.r1.iron===0&&r.r1.tallow===2&&r.r1.timber===30,'the Cellar takes 25 iron and 10 tallow, once',r.r1);
  ok(r.label2==='Down to the cellar','open, the hatch reads Down to the cellar',r.label2);
  ok(r.buyA&&r.r2.timber===0&&r.r2.curios===0&&r.label3==='Up to the attic','the Attic takes 30 timber and 2 curios; the ladder reads Up to the attic',r);
  ok(r.saved.join()==='true,true,true,planks'&&r.sigs==='main|11','both rooms are saved open, and the main room draws its hatch and ladder open',r);

  /* 3. between the rooms: down the hatch, up the ladder, and back; each room's own walls; closing from below keeps you at the door */
  const w=await p.evaluate(()=>{const T=__t, W=T.TWN, out={};
    /* the room cards are tips: on for this part, with the Lodge's own already read */
    T.tutSet({walk:'done',seen:['town','townhaul','lodge','lodgeshelf','townbuild','townlift','townfree'],off:false});
    const dismiss=()=>{while(!document.getElementById('townCardWrap').hidden)document.getElementById('townCard').click();};
    W.p.x=1.5; W.p.y=7.5; W.near=undefined; T.townStep(1/30); document.getElementById('townAct').click();
    out.cellar=[T.lodgeCur(),W.p.x,W.p.y]; out.tip=W.card; dismiss();
    W.near=undefined; T.townStep(1/30); out.up=document.getElementById('townAct').textContent;
    out.walls=[T.townSolid(7,1),T.townSolid(7,0),!T.townSolid(1,6),T.townSolid(4,9),!T.townSolid(4,8)];
    T.townDraw(); out.art=[T.LODGE_ART.room,!!T.LODGE_ART.wade,!!T.LODGE_ART.glints,!T.LODGE_ART.win];
    /* a tap on the ladder walks to its foot and climbs */
    T.lodgeTapTile(7,1); for(let i=0;i<300&&T.lodgeCur()==='cellar';i++)T.townStep(1/30);
    out.back=[T.lodgeCur(),W.p.x,W.p.y];
    /* up to the Attic by the ladder, and its hatch back down */
    T.lodgeTapTile(2,0); for(let i=0;i<400&&T.lodgeCur()==='main';i++)T.townStep(1/30);
    out.attic=[T.lodgeCur(),W.p.x,W.p.y]; out.tip2=W.card; dismiss();
    W.near=undefined; T.townStep(1/30); out.down=document.getElementById('townAct').textContent;
    out.awalls=[T.townSolid(2,2),T.townSolid(2,0),T.townSolid(4,9),!T.townSolid(2,3)];
    T.townDraw(); out.aart=[T.LODGE_ART.room,!!T.LODGE_ART.win,T.LODGE_ART.lights.some(L=>L.col==='cold'),!T.LODGE_ART.wade];
    T.lodgeWay(T.LODGE_WAYS.H); out.main=[T.lodgeCur(),W.p.x,W.p.y];
    /* no door below: leaving is from the main room; closing the town from the Cellar keeps you before the Lodge's door */
    T.lodgeGo('cellar'); dismiss(); T.townClose(); const td=T.townData(); out.closed=[td.px,td.py,!!W.inside,W.room];
    T.townOpen(); T.lodgeEnter(); out.reenter=T.lodgeCur(); dismiss();
    out.noGo=[T.lodgeGo('main'),T.lodgeGo('nowhere')];
    T.tutSet({walk:'done',seen:[],off:true});
    return out;});
  console.log(JSON.stringify(w));
  ok(w.cellar[0]==='cellar'&&w.cellar[1]===7.5&&w.cellar[2]===2.5&&w.tip==='lodgecellar','down the hatch you stand at the foot of the cellar’s ladder, and the Cellar has its own card',w);
  ok(w.up==='Up to the Lodge'&&w.walls.every(Boolean),'the Cellar’s ladder is solid, its floor open where the hatch is above, and it has no door',w);
  ok(w.art.join()==='cellar,true,true,true','the Cellar draws its brine: the floor, the glints, the water round your feet',w.art);
  ok(w.back[0]==='main'&&w.back[1]===1.5&&w.back[2]===7.5,'up the ladder you come out beside the hatch',w.back);
  ok(w.attic[0]==='attic'&&w.attic[1]===2.5&&w.attic[2]===3.5&&w.tip2==='lodgeattic'&&w.down==='Down to the Lodge'&&w.awalls.every(Boolean),'up the ladder you stand beside the Attic’s hatch, with its own card',w);
  ok(w.aart.join()==='attic,true,true,true','the Attic has its round window and the night’s cold light through it, and no brine',w.aart);
  ok(w.main[0]==='main'&&w.main[1]===2.5&&w.main[2]===2.5,'down the hatch you stand at the ladder’s foot',w.main);
  ok(w.closed[0]===3.5&&w.closed[1]===12.5&&!w.closed[2]&&w.closed[3]==='main'&&w.reenter==='main','closing from the Cellar keeps you before the Lodge’s door; going in again is the main room',w);
  ok(!w.noGo[0]&&!w.noGo[1],'no going to the room you are in, or to one that is not',w.noGo);

  /* 4. each room its own floor, wall and furniture; a room's first floor and wall are free in it; storage is one for the Lodge */
  const f=await p.evaluate(()=>{const T=__t, W=T.TWN, td=T.townData(), out={};
    const dismiss=()=>{while(!document.getElementById('townCardWrap').hidden)document.getElementById('townCard').click();};
    td.res={timber:100,iron:100,tallow:100,curios:10}; const R0=JSON.stringify(td.res);
    T.lodgePlace('desk',5,4); T.lodgeStyle('parquet');
    T.lodgeGo('cellar'); dismiss(); W.p.x=7.5; W.p.y=2.5;
    out.rc=JSON.stringify(td.res); out.cellar0=[T.lodgeRoom().floor,T.lodgeRoom().furn.length,T.lodgeCost('flags').iron|0,T.lodgeCost('planks').iron|0];
    out.planks=T.lodgeStyle('planks'); out.r1=Object.assign({},td.res); out.back=T.lodgeStyle('flags'); out.r2=Object.assign({},td.res);
    out.library=T.lodgeStyle('library'); out.r3=Object.assign({},td.res);
    out.place=T.lodgePlace('chair',3,4); out.ladderFoot=T.lodgeCanPlace('stove',7,2); out.wallOff=T.lodgeCanPlace('rug',6,1);
    out.solid=T.townSolid(3,4); out.cellarN=T.lodgeRoom().furn.length; out.mainN=td.lodge.furn.length; out.mainFloor=td.lodge.floor;
    /* a wall of shelves across the Cellar may not cut the ladder off from where you stand */
    W.p.x=4.5; W.p.y=6.5; const row=[]; for(let x=1;x<=8;x++)row.push(T.lodgePlace('shelf',x,3)); out.row=row.filter(s=>s).length;
    out.keepOK=T.lodgeKeepOK(T.lodgeRoom().furn.filter(d=>!T.LODGE_ITEMS[d.id].flat),'cellar');
    for(const d of T.lodgeRoom().furn.slice())if(d.id==='shelf')T.lodgeTakeUp(d);
    /* store the cellar's chair in build mode, and set it down in the Attic for nothing */
    T.townBuildSet(true); dismiss(); const ch=T.lodgeRoom().furn.find(d=>d.id==='chair'); T.bldLift(ch); T.bldTurn(1); T.bldTurn(1); T.bldStow();
    out.stored=T.townData().store.map(e=>e.s+':'+e.id+'/'+(e.f|0)).join();
    T.lodgeGo('main'); out.buildOff=!W.build; T.lodgeGo('attic'); dismiss(); W.p.x=2.5; W.p.y=3.5;
    const rb=JSON.stringify(td.res);
    T.townBuildSet(true); dismiss(); W.tab='store'; W.pick='chair'; T.bldTap(5,5);
    out.attic=T.lodgeRoom().furn.map(d=>d.id+d.c+','+d.r+'/'+(d.f|0)).join(); out.free=JSON.stringify(td.res)===rb;
    T.townBuildSet(false);
    /* the chair turns in the Attic as below: eight taps back to where it started; on a diagonal it keeps to its own tile */
    T.townBuildSet(true); dismiss(); const a=T.lodgeRoom().furn[0]; T.bldLift(a); const f0=W.lift.f, seen=[];
    for(let i=0;i<8;i++){T.bldTurn(1); seen.push(W.lift.f);} out.turns=[f0,seen.join('')]; T.bldTurn(1); T.bldDrop(); out.f=a.f;
    out.diag=[!!T.lodgeAt(5,5),!T.lodgeAt(6,5),!T.lodgeAt(5,6)];
    T.townBuildSet(false);
    const s=JSON.parse(localStorage.getItem('ll-town')).lodge;
    out.saved=[s.floor,s.furn.length,s.rooms.cellar.wall,s.rooms.cellar.floor,s.rooms.cellar.furn.length,s.rooms.attic.furn.map(d=>d.id+'/'+(d.f|0)).join()];
    const re=T.townFix(JSON.parse(localStorage.getItem('ll-town'))); out.reload=re.lodge.rooms.attic.furn.map(d=>d.id+'/'+(d.f|0)).join();
    return out;});
  console.log(JSON.stringify(f));
  ok(f.cellar0.join()==='flags,1,0,0','the Cellar starts on its own free flagstones, bare but for the one sconce it is built with',f.cellar0);
  ok(/Ship-Planks laid/.test(f.planks)&&JSON.stringify(f.r1)===f.rc&&JSON.stringify(f.r2)===f.rc,'its first floor gives back nothing (it was free there) and costs nothing to lay again',f);
  ok(/Library hung/.test(f.library)&&f.r3.timber===f.r2.timber-30,'a wall costs the same in any room',f.r3);
  ok(f.place===''&&f.solid&&f.cellarN===2&&f.mainN===4&&f.mainFloor==='parquet','furniture and floors are kept per room',f);
  ok(/ladder/.test(f.ladderFoot)&&/no floor|ladder/.test(f.wallOff),'the ladder’s foot is kept clear',f);
  ok(f.row>=1&&f.keepOK,'a piece that would wall off the ladder is refused',f);
  ok(f.stored==='lodge:chair/2','a piece stored in one room keeps its facing',f.stored);
  ok(f.buildOff,'going to another room closes Build',f.buildOff);
  ok(f.attic==='chair5,5/2'&&f.free,'and is set down in another room for nothing, still turned',f);
  ok(f.turns[0]===2&&f.turns[1]==='34567012'&&f.f===3,'a piece turns in the Attic as in the main room',f.turns);
  ok(f.diag.every(Boolean),'turned to a diagonal, the chair keeps to its own tile',f.diag);
  ok(f.saved.join('|')==='parquet|4|library|flags|1|chair/3'&&f.reload==='chair/3','each room is saved apart, facings with it',f.saved);

  /* 5. the brine and the rain, drawn: wet feet below the waterline, dry above; drops only inside the glass */
  const d=await p.evaluate(()=>{const T=__t, out={};
    const [src,c]=(()=>{const cv=document.createElement('canvas'); cv.width=4; cv.height=10; const x=cv.getContext('2d'); x.fillStyle='#ad5428'; x.fillRect(0,0,4,10); return [cv,x];})();
    const wet=T.lodgeWet(src,3,false), wd=wet.getContext('2d').getImageData(0,0,4,10).data, px=y=>[wd[(y*4+1)*4],wd[(y*4+1)*4+1],wd[(y*4+1)*4+2]].join();
    out.top=px(0); out.line=px(7); out.under=px(9); out.src=c.getImageData(1,9,1,1).data.slice(0,3).join();
    const flat=T.lodgeWet(src,3,true).getContext('2d').getImageData(1,0,1,1).data.slice(0,3).join(); out.flat=flat;
    /* the rain in the Attic's window: drawn over a few seconds, every drop inside the glass, and some drawn */
    const W=T.LODGE_WIN, cv=document.createElement('canvas'); cv.width=160; cv.height=40; const g=cv.getContext('2d');
    let n=0, outside=0;
    for(let k=0;k<40;k++){g.clearRect(0,0,160,40); T.TWN.t=k*.13; T.lodgeWinRain(g,W,0,0,false);
      const D=g.getImageData(0,0,160,40).data;
      for(let y=0;y<40;y++)for(let x=0;x<160;x++)if(D[(y*160+x)*4+3]){n++; if(Math.hypot(x+.5-W.x,y+.5-W.y)>W.r+.8)outside++;}}
    out.rain=[n,outside];
    /* the ways' art: the ladder 16 wide standing over the back wall, every pixel a PX colour; shut ladders lose rungs */
    const full=T.lodgeWayArt('ladder',true,0), shut=T.lodgeWayArt('ladder',false,0), cnt=cv=>{const D=cv.getContext('2d').getImageData(0,0,cv.width,cv.height).data; let k=0; for(let i=3;i<D.length;i+=4)if(D[i])k++; return k;};
    out.ladder=[full.width,full.height,cnt(full)>cnt(shut)];
    const hs=T.lodgeWayArt('hatch','shut'), ho=T.lodgeWayArt('hatch','open'); out.hatch=[hs.width,hs.height,ho.width,ho.height];
    const pal=new Set(Object.values(T.PX).map(h=>h.toLowerCase()));
    const offPal=cv=>{const D=cv.getContext('2d').getImageData(0,0,cv.width,cv.height).data; let k=0; for(let i=0;i<D.length;i+=4){if(!D[i+3])continue; if(D[i+3]!==255)k++; const h='#'+[D[i],D[i+1],D[i+2]].map(v=>v.toString(16).padStart(2,'0')).join(''); if(!pal.has(h))k++;} return k;};
    out.offPal=[offPal(full),offPal(shut),offPal(hs),offPal(ho),offPal(T.lodgeWindowArt())];
    return out;});
  console.log(JSON.stringify(d));
  ok(d.top===d.src&&d.top!==d.under&&d.line!==d.under&&d.line!==d.top&&d.flat!==d.src,'a wet piece is dry above the waterline, a ripple at it, brine below; a flat one is under all over',d);
  ok(d.rain[0]>40&&d.rain[1]===0,'the rain shows only inside the window’s glass',d.rain);
  ok(d.ladder[0]===16&&d.ladder[1]===34&&d.ladder[2]&&d.hatch.join()==='16,16,16,16','the ladder is a tile wide and stands floor to ceiling; the hatch fills its tile; a shut ladder lacks rungs',d);
  ok(d.offPal.every(n=>n===0),'the ladder, the hatch and the window are all PX colours, fully opaque',d.offPal);

  /* 6. developer mode never writes ll-town */
  const v=await p.evaluate(()=>{const T=__t, out={};
    document.getElementById('modal').hidden=true;
    localStorage.removeItem('ll-town'); T.townReset(); T.setDev(false); T.townData(); T.townSave();
    const before=localStorage.getItem('ll-town');
    T.setDev(true); const td=T.townData(); td.res={timber:500,iron:500,tallow:500,curios:50};
    T.townOpen(); T.townRestoreLodge(); T.lodgeEnter();
    out.buy=[T.lodgeBuyRoom('cellar'),T.lodgeBuyRoom('attic')]; out.go=T.lodgeGo('cellar');
    out.place=T.lodgePlace('stove',3,4); out.style=T.lodgeStyle('parquet'); T.townDraw(); T.lodgeGo('main'); T.lodgeGo('attic'); T.townDraw();
    T.townClose();
    out.same=localStorage.getItem('ll-town')===before;
    T.setDev(false); out.real=[T.lodgeBuilt(),T.lodgeRoomBuilt('cellar')];
    return out;});
  console.log(JSON.stringify(v));
  ok(v.buy.every(Boolean)&&v.go&&v.place===''&&v.same&&!v.real[0]&&!v.real[1],'developer mode opens and furnishes the rooms in its own copy and writes nothing',v);

  ok(!errs.length,'no page errors',errs);
  await b.close();
  if(fails.length){for(const f of fails)console.log('FAIL '+f); process.exit(1);}
  console.log('lodgerooms ok');
})();
