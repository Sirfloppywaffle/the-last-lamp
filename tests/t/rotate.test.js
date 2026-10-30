// Expansion 4, step 2: 8-way rotation (expansion/EXPANSION4_RUNBOOK.md §5).
// - f on each piece (0 S, 1 SW … 7 SE); ⟳ or a tap on the lifted piece turns it a step clockwise, a hold turns it back; a path
//   or a fence turns a quarter. Old pieces load as f 0; f survives Store, a reload and storeFix().
// - faces per piece: 1, 2, 4 or 8; a facing not drawn falls back to the nearest drawn one, mirrored where it fits.
// - Footprints turn with the piece (the desk is 1×2 on its side); a drawn diagonal uses its own mask (the Armchair's one tile,
//   while its 24-px art hangs over the tiles beside it), so a chair can face the room from a corner.
// - The Armchair is Criss's PixelLab object through tools/png2rows.py: every pixel a PX letter, 16 wide straight, ≤24 diagonal.
// - Developer mode turns pieces without writing ll-town (rule 24). Taught: the lift tip and the rules line.
const {chromium}=require('playwright');
const fails=[]; const ok=(cond,msg,detail)=>{if(!cond)fails.push(msg+(detail!==undefined?' '+JSON.stringify(detail).slice(0,700):''));};
(async()=>{
  const b=await chromium.launch();
  const p=await b.newPage({viewport:{width:412,height:860}});
  await p.goto('file://'+process.argv[2]); await p.waitForTimeout(400);

  /* 1. the fallback table: what each facing draws, for each count of drawn facings */
  const fb=await p.evaluate(()=>__t.FACE_SRC);
  ok(fb[1].every(e=>e[0]===0&&!e[1]),'a round piece draws its one facing every way',fb[1]);
  ok(JSON.stringify(fb[2])===JSON.stringify([[0,false],[0,false],[2,false],[2,false],[0,false],[2,true],[2,true],[0,false]]),'a two-way piece: its back is its front, east is west mirrored',fb[2]);
  ok(JSON.stringify(fb[4])===JSON.stringify([[0,false],[0,false],[2,false],[2,false],[4,false],[2,true],[2,true],[0,false]]),'a four-way piece: south, west and north drawn, east mirrored, diagonals the straight one nearer the front',fb[4]);
  ok(fb[8].every((e,i)=>e[0]===i&&!e[1]),'an eight-way piece draws every facing',fb[8]);

  /* 2. the Armchair's art: eight facings, every letter in PX, 16 wide straight and at most 24 on the diagonals, as tall as a prop */
  const art=await p.evaluate(()=>{const C=__t.LODGE_CHAIR, P=__t.PX;
    return {n:C.length,w:C.map(r=>r[0].length),h:C.map(r=>r.length),even:C.every(r=>r.every(s=>s.length===r[0].length)),
      letters:C.every(r=>r.every(s=>[...s].every(ch=>ch==='.'||P[ch]))),
      drawn:[0,1,2,3,4,5,6,7].map(f=>{const a=__t.lodgeFurnArt('chair',f); return [a.cv.width,a.cv.height,a.dx,a.dy];})};});
  ok(art.n===8&&art.even&&art.letters,'eight facings of rows, every pixel a PX letter',art);
  ok([0,2,4,6].every(f=>art.w[f]===16)&&[1,3,5,7].every(f=>art.w[f]>16&&art.w[f]<=24),'16 wide facing straight, up to 24 on a diagonal',art.w);
  ok(art.h.every(h=>h>=20&&h<=30)&&art.drawn.every(([w,h,dx,dy])=>dy===16-h&&dx===Math.round((16-w)/2)),'each stands on its tile’s bottom edge and rises above it, centred on the tile',art.drawn);

  /* 3. lift, ⟳ eight times: back to the start; a path and a fence turn a quarter at a time (four to come back) */
  const turn=await p.evaluate(()=>{
    localStorage.removeItem('ll-town'); __t.townReset(); __t.setDev(false);
    const D=__t.townData(); D.res={timber:300,iron:300,tallow:300,curios:30}; D.free=false; __t.townSave();
    __t.townOpen(); const T=__t.TWN; T.p.x=12; T.p.y=14; T.path=null;
    __t.townRestoreLodge(); __t.lodgeEnter(); __t.townBuildSet(true);
    const o={place:__t.lodgePlace('chair',3,5)}; const d=D.lodge.furn.find(e=>e.id==='chair');
    __t.bldTap(3,5); o.lifted=!!T.lift; o.seq=[];
    for(let i=0;i<8;i++){document.getElementById('townTurn').click(); o.seq.push(T.lift.f);}
    o.line=document.getElementById('townTmsg').textContent;
    __t.bldTurn(1); __t.bldTurn(1); __t.bldTurn(-1); o.back=T.lift.f;
    __t.bldDrop(); o.saved=d.f;
    __t.townBuildSet(false); __t.lodgeLeave(); __t.townBuildSet(true);
    __t.townPlace('fence',3,15); __t.bldTap(3,15); o.fseq=[]; for(let i=0;i<4;i++){__t.bldTurn(1); o.fseq.push(T.lift.f);} __t.bldCancel();
    __t.townBuildSet(false); __t.townClose();
    return o;});
  ok(turn.place===''&&turn.lifted,'the Armchair goes down and lifts',turn);
  ok(JSON.stringify(turn.seq)==='[1,2,3,4,5,6,7,0]','⟳ turns it a step clockwise, and eight taps return to the start',turn.seq);
  ok(/faces south/.test(turn.line)&&turn.back===1&&turn.saved===1,'the line names where it faces; turning back goes the other way; Place keeps the facing',turn);
  ok(JSON.stringify(turn.fseq)==='[2,4,6,0]','a fence turns a quarter at a time',turn.fseq);

  /* 4. the facing survives a reload, Store and storeFix(); an old piece is f 0 and a broken f is mended */
  const keep=await p.evaluate(()=>{
    __t.townReset(); const D=__t.townData(), o={};
    o.reload=(D.lodge.furn.find(e=>e.id==='chair')||{}).f;
    __t.townOpen(); __t.lodgeEnter(); __t.townBuildSet(true); const T=__t.TWN;
    __t.bldTap(3,5); __t.bldTurn(1); __t.bldTurn(1); __t.bldStow(); o.stored=D.store.map(e=>e.f);
    __t.townReset(); const D2=__t.townData(); o.reStored=D2.store.map(e=>e.f);
    __t.townOpen(); __t.lodgeEnter(); __t.townBuildSet(true);
    T.tab='store'; T.pick='chair'; __t.bldTap(6,6); o.down=(D2.lodge.furn.find(e=>e.id==='chair')||{}).f;
    __t.townBuildSet(false); __t.lodgeLeave(); __t.townClose();
    const fx=__t.townFix({lodge:{built:true,furn:[{id:'chair',c:2,r:5},{id:'desk',c:4,r:5,f:9},{id:'shelf',c:7,r:5,f:'2'}]},decos:[{id:'fence',c:3,r:15,f:3},{id:'lamp',c:5,r:15,f:5}],store:[{s:'lodge',id:'chair',f:5},{s:'lodge',id:'chair',f:-1}]});
    o.old=fx.lodge.furn.map(e=>e.f); o.decos=fx.decos.map(e=>e.f); o.fxStore=fx.store.map(e=>e.f);
    return o;});
  ok(keep.reload===1,'the facing survives a reload',keep);
  ok(keep.stored[0]===3&&keep.reStored[0]===3&&keep.down===3,'a stored piece keeps how it faced, through a reload, and is set down that way',keep);
  ok(JSON.stringify(keep.old)==='[0,0,0]'&&JSON.stringify(keep.decos)==='[2,5]'&&keep.fxStore[0]===5&&keep.fxStore[1]===undefined,'an old piece faces south; a broken facing is mended; a fence faces only straight',keep);

  /* 5. footprints: the desk on its side covers the tile below, not beside; a diagonal Armchair blocks its own tile only, so it fits
     in a corner and the tiles beside it stay free */
  const foot=await p.evaluate(()=>{
    localStorage.removeItem('ll-town'); __t.townReset(); const D=__t.townData(); D.res={timber:300,iron:300,tallow:300,curios:30}; D.free=false;
    __t.townOpen(); const T=__t.TWN; T.p.x=12; T.p.y=14; __t.townRestoreLodge(); __t.lodgeEnter(); __t.townBuildSet(true); T.p.x=5; T.p.y=8.4;
    const o={desk:__t.lodgePlace('desk',2,5)};
    __t.bldTap(2,5); __t.bldTurn(1); __t.bldTurn(1); o.liftW=[T.lift.f,!!T.lift.why]; __t.bldDrop();
    o.deskTiles=[[2,5],[3,5],[2,6]].map(([x,y])=>!!__t.lodgeAt(x,y));
    o.foot=__t.pieceFoot(__t.LODGE_ITEMS.desk,2);
    o.corner=__t.lodgePlace('chair',8,2);
    const ch=D.lodge.furn.find(e=>e.id==='chair'); __t.bldTap(8,2); __t.bldTurn(1); o.cornerWhy=T.lift.why; __t.bldDrop(); o.cf=ch.f;
    o.blocked=__t.TWN.inside&&[[8,2],[7,2],[8,3],[7,3]].map(([x,y])=>!!__t.lodgeAt(x,y));
    o.beside=__t.lodgeCanPlace('shelf',7,2);
    /* Free: the diagonal chair's mask at its pixel position */
    __t.bldSnapSet(true); __t.bldTap(8,2); __t.bldLiftTo(7*16+5,5*16+3); o.freeWhy=T.lift.why; __t.bldDrop();
    o.free=[ch.x,ch.y,ch.c,ch.r,ch.f]; o.freeAt=!!__t.lodgeAt(7,5)&&!__t.lodgeAt(8,5)&&!__t.lodgeAt(7,6);
    __t.bldSnapSet(false); __t.townBuildSet(false); __t.lodgeLeave(); __t.townClose();
    return o;});
  ok(foot.desk===''&&foot.liftW[0]===2&&!foot.liftW[1]&&JSON.stringify(foot.deskTiles)==='[true,false,true]'&&foot.foot.w===1&&foot.foot.h===2,'the desk turned west covers its tile and the one below, not the one beside',foot);
  ok(foot.corner===''&&!foot.cornerWhy&&foot.cf===1&&JSON.stringify(foot.blocked)==='[true,false,false,false]'&&foot.beside==='','a diagonal Armchair fits in a corner and blocks only its own tile',foot);
  ok(foot.free[4]===1&&foot.free[0]===7*16+5&&foot.free[1]===5*16+3&&foot.freeAt&&!foot.freeWhy,'in Free the diagonal stands at its pixel position on its mask',foot);

  /* 6. a mirrored facing draws: the desk facing east is its west side flipped, its lamp's glow moved with it; the stove from
     behind still lights the room */
  const mir=await p.evaluate(()=>{
    /* the desk's banker's lamp went with its redraw (Expansion 4, step 4), so the glow moves with the stove's fire instead */
    const D2=__t.lodgeFurnArt('desk',2), D6=__t.lodgeFurnArt('desk',6), W=__t.lodgeFurnArt('stove',2), E=__t.lodgeFurnArt('stove',6), px=(cv,x,y)=>[...cv.getContext('2d').getImageData(x,y,1,1).data].join(',');
    let same=D2.cv.width===D6.cv.width&&D2.cv.height===D6.cv.height;
    for(let y=0;same&&y<D2.cv.height;y++)for(let x=0;x<D2.cv.width;x++)if(px(D2.cv,x,y)!==px(D6.cv,D2.cv.width-1-x,y)){same=false; break;}
    const S=__t.lodgeFurnArt('stove',4), C=__t.lodgeFurnArt('chair',5), C3=__t.lodgeFurnArt('chair',3);
    return {same,ex:[W.ex,E.ex,W.em.width,W.cv.width],lx:[W.lx,E.lx],stove:[!!S.em,S.lx,S.ly],ne:C.cv.width,nw:C3.cv.width,
      side:__t.townSide({id:'board',f:2}),front:__t.townSide({id:'board',f:4})};});
  ok(mir.same&&mir.ex[1]===mir.ex[3]-mir.ex[0]-mir.ex[2]&&mir.lx[1]===mir.ex[3]-mir.lx[0],'east is west mirrored, glow and light with it',mir);
  ok(!mir.stove[0]&&mir.stove[1]>0,'a stove turned away hides its fire and still has its light',mir);
  ok(mir.side&&!mir.front,'a boardwalk turned a quarter runs the other way; turned half, it is as it was',mir);

  /* 7. in the room: the lights stay, the art redraws per facing, and a turned boardwalk repaints its tile */
  const scene=await p.evaluate(()=>{
    localStorage.removeItem('ll-town'); __t.townReset(); const D=__t.townData(); D.res={timber:300,iron:300,tallow:300,curios:30}; D.free=false;
    __t.townOpen(); const T=__t.TWN; T.p.x=12; T.p.y=14; T.path=null;
    __t.townBuildSet(true); __t.townPlace('board',3,15); __t.townFrame(1/30);
    const A=__t.townArt(), g=A.ground.getContext('2d'), tile=()=>[...g.getImageData(48,240,16,16).data].join(',');
    const t0=tile(); __t.bldTap(3,15); __t.bldTurn(1); __t.bldDrop(); const t1=tile();
    __t.bldTap(3,15); __t.bldTurn(1); __t.bldDrop(); const t2=tile();
    __t.townBuildSet(false);
    __t.townRestoreLodge(); __t.lodgeEnter(); __t.townBuildSet(true); T.p.x=5; T.p.y=8.4;
    __t.lodgePlace('stove',2,4); const n0=__t.lodgeArt().lights.length; const st=D.lodge.furn.find(e=>e.id==='stove');
    __t.bldTap(2,4); __t.bldTurn(1); __t.bldTurn(1); __t.bldTurn(1); __t.bldTurn(1); __t.bldDrop(); const L=__t.lodgeArt();
    __t.townFrame(1/30);
    const o={t:[t0!==t1,t0===t2],lights:[n0,L.lights.length],sf:st.f,props:L.props.length};
    __t.townBuildSet(false); __t.lodgeLeave(); __t.townClose();
    return o;});
  ok(scene.t[0]&&scene.t[1],'a boardwalk turned a quarter repaints its tile across; turned back, it is as it was',scene);
  ok(scene.sf===4&&scene.lights[0]===scene.lights[1],'a stove turned to the wall keeps its light in the room',scene);

  /* 8. the real UI: ⟳ held turns back, a tap on the lifted piece turns it, a tap elsewhere moves it */
  await p.evaluate(()=>{localStorage.removeItem('ll-town'); __t.townReset(); const D=__t.townData(); D.res={timber:50,iron:50,tallow:50,curios:5}; D.free=false; __t.townSave();
    __t.townOpen(); const T=__t.TWN; T.p.x=12; T.p.y=14; T.path=null; __t.townPlace('fence',14,14); T.cx=null; __t.townFrame(1/30);
    document.getElementById('townBuild').click(); while(!document.getElementById('townCardWrap').hidden)document.getElementById('townCard').click();});
  const pos=await p.evaluate(()=>{const T=__t.TWN, k=T.k/T.dpr; return {k,x:((14*16+8)-T.lcx)*k,y:((14*16+8)-T.lcy)*k};});
  await p.mouse.click(pos.x,pos.y); await p.waitForTimeout(60);
  const u0=await p.evaluate(()=>({lift:!!__t.TWN.lift,f:__t.TWN.lift&&__t.TWN.lift.f,turn:!document.getElementById('townTurn').hidden&&!document.getElementById('townLiftBar').hidden}));
  await p.click('#townTurn'); await p.waitForTimeout(40);
  const u1=await p.evaluate(()=>__t.TWN.lift.f);
  const tb=await p.locator('#townTurn').boundingBox();
  await p.mouse.move(tb.x+tb.width/2,tb.y+tb.height/2); await p.mouse.down(); await p.waitForTimeout(650); await p.mouse.up(); await p.waitForTimeout(60);
  const u2=await p.evaluate(()=>__t.TWN.lift.f);
  await p.evaluate(()=>{__t.TWN.cx=null; __t.townFrame(1/30);});
  const pos2=await p.evaluate(()=>{const T=__t.TWN, k=T.k/T.dpr; return {x:((T.lift.x+8)-T.lcx)*k,y:((T.lift.y+8)-T.lcy)*k};});
  await p.mouse.click(pos2.x,pos2.y); await p.waitForTimeout(60);
  const u3=await p.evaluate(()=>({f:__t.TWN.lift.f,c:__t.TWN.lift.c}));
  await p.mouse.move(pos2.x,pos2.y); await p.mouse.down(); await p.waitForTimeout(650); await p.mouse.up(); await p.waitForTimeout(60);
  const u4=await p.evaluate(()=>({f:__t.TWN.lift.f,c:__t.TWN.lift.c}));
  await p.mouse.click(pos2.x+pos.k*16*2,pos2.y); await p.waitForTimeout(60);
  const u5=await p.evaluate(()=>({f:__t.TWN.lift.f,c:__t.TWN.lift.c}));
  ok(u0.lift&&u0.turn&&u0.f===0,'lifting shows ⟳ with Place, Cancel and Store',u0);
  ok(u1===2&&u2===0,'⟳ turns the fence a quarter; held, it turns it back',{u1,u2});
  ok(u3.f===2&&u3.c===14&&u4.f===0&&u4.c===14,'a tap on the lifted piece turns it; held there, it turns back; it never moves',{u3,u4});
  ok(u5.c===16&&u5.f===0,'a tap beside it still moves it there',u5);
  await p.evaluate(()=>{__t.townBuildSet(false); __t.townClose();});

  /* 9. developer mode turns pieces and writes nothing (rule 24) */
  const dev=await p.evaluate(()=>{
    const before=localStorage.getItem('ll-town');
    __t.setDev(true); __t.townReset(); __t.townOpen(); const T=__t.TWN; T.p.x=12; T.p.y=14; T.path=null; __t.townBuildSet(true);
    const d=__t.townData().decos.find(e=>e.id==='fence'); __t.bldTap(d.c,d.r); __t.bldTurn(1); __t.bldDrop(); __t.bldTap(d.c,d.r); __t.bldTurn(1); __t.bldStow();
    __t.townBuildSet(false); __t.townClose(); const after=localStorage.getItem('ll-town'); __t.setDev(false); __t.townReset();
    return before===after;});
  ok(dev,'developer mode turns and stores without writing ll-town');

  /* 10. taught: the lift tip and the rules line name ⟳ */
  const teach=await p.evaluate(()=>({tip:__t.TIPS.townlift.text,rules:document.getElementById('rulesList').textContent}));
  ok(/⟳/.test(teach.tip)&&/turn it back/.test(teach.tip)&&/⟳/.test(teach.rules)&&/turns it back/.test(teach.rules),'the lift tip and the rules line teach ⟳',teach.tip);

  for(const f of fails)console.log('FAIL '+f);
  console.log(fails.length?fails.length+' failed':'rotate ok');
  await b.close(); process.exit(fails.length?1:0);
})();
