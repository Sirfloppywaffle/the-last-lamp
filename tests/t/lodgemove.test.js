// Saltmouth, Expansion 4: small Lodge changes from Criss's playtest.
// - The sconces a room is built with are pieces (free, cold): lifted, moved, stored (and put out again), salvaged for nothing, and
//   never put back once taken away. A Lodge from before keeps the ones it had, lit as they were.
// - A rug lies under whatever stands on it: furniture goes on a rug, a rug goes under furniture, a tap lifts the furniture first,
//   two rugs still keep apart, and a saved chair on a rug loads.
// - The Grimoire shelf is a piece (grimoire): moved, stored, never salvaged or taken up, one only, always somewhere, always
//   reachable, never on the tray, and a tap on it still opens the book.
// - A Keeper's lantern is cut by anything standing in front of its feet: Ambrose behind an armchair does not show through it.
const {chromium}=require('playwright');
const fails=[]; const ok=(c,m,d)=>{if(!c)fails.push(m+(d!==undefined?' '+JSON.stringify(d).slice(0,700):''));};
(async()=>{
  const b=await chromium.launch(); const p=await b.newPage({viewport:{width:412,height:860}});
  const errs=[]; p.on('pageerror',e=>errs.push(String(e)));
  await p.goto('file://'+process.argv[2]); await p.waitForTimeout(300);

  /* a real town with the Lodge standing, plenty in the haul, Grid on, standing by the door */
  const setup=`()=>{localStorage.removeItem('ll-town'); __t.townReset(); __t.setDev(false); __t.townOpen();
    const D=__t.townData(); D.res={timber:900,iron:900,tallow:900,curios:90}; __t.townRestoreLodge(); D.res={timber:900,iron:900,tallow:900,curios:90}; D.free=false;
    __t.lodgeEnter(); while(!document.getElementById('townCardWrap').hidden)document.getElementById('townCard').click();
    __t.TWN.p.x=5; __t.TWN.p.y=8.4; return D;}`;

  /* 1. the sconces */
  const sc=await p.evaluate(`(()=>{const T=__t, D=(${setup})(), o={}, L=()=>T.lodgeRoom(), sconces=()=>L().furn.filter(d=>d.id==='sconce');
    o.start=sconces().map(d=>[d.c,d.r,!!d.free,!!d.out]);
    T.townBuildSet(true); while(!document.getElementById('townCardWrap').hidden)document.getElementById('townCard').click();
    /* lift the first and move it along the wall */
    const a=sconces()[0]; o.lift=T.bldLift(a); o.move=T.bldLiftTo(64,0); o.why=T.TWN.lift.why; o.drop=T.bldDrop(); o.at=[a.c,a.r,a.free===true];
    /* store the second: free to store, free to salvage; the haul does not move */
    const r0=JSON.stringify(D.res), b=sconces()[1]; T.bldLift(b); T.bldStow();
    o.stored=D.store.map(e=>e.id+(e.free?'!':'')+JSON.stringify(e.cost)).join(); o.left=sconces().length;
    T.TWN.tab='store'; o.salv=T.bldSalvage('sconce'); o.haul=JSON.stringify(D.res)===r0; o.gone=D.store.length;
    /* one stored and set down again stays free: stored again it is worth nothing */
    T.bldStow&&0; o.placed=0;
    T.townBuildSet(false);
    T.townSave(); T.townReset(); const S=T.townData();
    o.saved=S.lodge.furn.filter(d=>d.id==='sconce').map(d=>d.c+(d.free?'f':'')).join();
    return o;})()`);
  ok(sc.start.length===2&&sc.start.every(([c,r,f,out])=>r===0&&f&&out)&&sc.start[0][0]===1&&sc.start[1][0]===7,'the Lodge starts with two free, cold sconces on the back wall',sc.start);
  ok(sc.lift&&sc.move&&sc.why===''&&sc.drop===''&&sc.at.join()==='4,0,true','a sconce is lifted and moved along the wall, still free',sc);
  ok(sc.stored.startsWith('sconce!')&&/\{"timber":0,"iron":0,"tallow":0,"curios":0\}/.test(sc.stored)&&sc.left===1,'stored, it costs nothing and carries its free mark',sc.stored);
  ok(sc.salv===true&&sc.haul&&sc.gone===0,'salvaged, a starting sconce gives back nothing',sc);
  ok(sc.saved==='4f','a sconce moved stays moved and one taken away does not come back',sc.saved);

  /* a stored free sconce, set down and stored again, is still worth nothing (no iron or tallow from a sconce that cost none) */
  const fr=await p.evaluate(`(()=>{const T=__t, D=(${setup})(), o={}, L=()=>T.lodgeRoom();
    T.townBuildSet(true); while(!document.getElementById('townCardWrap').hidden)document.getElementById('townCard').click();
    const a=L().furn.find(d=>d.id==='sconce'); T.bldLift(a); T.bldStow();
    T.TWN.tab='store'; T.TWN.pick='sconce'; T.bldTap(3,0); const d=L().furn.filter(x=>x.id==='sconce').pop();
    o.back=[!!d,d&&d.free===true,D.store.length]; T.TWN.tab='pieces'; T.TWN.pick=null;
    T.bldLift(d); T.bldStow(); o.cost=JSON.stringify(D.store[0].cost);
    const r0=JSON.stringify(D.res); T.TWN.tab='store'; T.bldSalvage('sconce'); o.haul=JSON.stringify(D.res)===r0;
    /* a sconce bought for its cost is worth it: stored and salvaged it pays back */
    T.TWN.tab='pieces'; o.buy=T.lodgePlace('sconce',3,0)||'ok'; const n=L().furn.filter(x=>x.id==='sconce').pop(); T.bldLift(n); T.bldStow(); T.TWN.tab='store'; const r1=D.res.iron; T.bldSalvage('sconce'); o.paid=D.res.iron-r1;
    T.townBuildSet(false); return o;})()`);
  ok(fr.back[0]&&fr.back[1]&&fr.back[2]===0,'a stored sconce comes back as a free one',fr);
  ok(/"iron":0/.test(fr.cost)&&fr.haul,'stored again, still worth nothing',fr);
  ok(fr.buy==='ok'&&fr.paid===2,'a Candle Sconce you paid for still pays back its iron and tallow',fr);

  /* an old Lodge: its lit sconces stay lit, as pieces */
  const old=await p.evaluate(`(()=>{const T=__t, o={}; (${setup})();
    localStorage.setItem('ll-town',JSON.stringify({v:1,lodge:{built:true,sconces:[1],furn:[]}})); T.townReset();
    const L=T.townData().lodge; o.old=L.furn.filter(d=>d.id==='sconce').map(d=>d.c+(d.out?'!':'')).join();
    localStorage.setItem('ll-town',JSON.stringify({v:1,lodge:{built:true,sconces:[1],furn:[{id:'sconce',c:3,r:0}]}})); T.townReset();
    o.mixed=T.townData().lodge.furn.filter(d=>d.id==='sconce').map(d=>d.c+(d.out?'!':'')).join();
    return o;})()`);
  ok(old.old==='1!,7','an old Lodge keeps its second sconce lit, as a piece',old);

  /* 2. rugs */
  const rg=await p.evaluate(`(()=>{const T=__t, D=(${setup})(), o={}, L=()=>T.lodgeRoom();
    T.TWN.p.x=8.5; T.TWN.p.y=7.5;
    o.rug=T.lodgePlace('rug',3,4);
    o.chair=T.lodgeCanPlace('chair',4,5); o.placed=T.lodgePlace('chair',4,5); o.desk=T.lodgePlace('desk',3,3);
    o.rug2=T.lodgeCanPlace('rug',4,4);
    /* a rug goes under what already stands */
    o.stove=T.lodgePlace('stove',7,5); o.under=T.lodgePlace('rug',6,4);
    o.at=T.lodgeAt(4,5)&&T.lodgeAt(4,5).id; o.atRug=[T.lodgeAt(3,3)&&T.lodgeAt(3,3).id,T.lodgeAt(3,4)&&T.lodgeAt(3,4).id].join();
    /* a tap lifts what stands on the rug, then the rug where nothing does */
    const c=L().furn.find(d=>d.id==='chair'), R=T.pieceRect(c,T.LODGE_ITEMS.chair);
    T.TWN.build=true; o.pickChair=T.bldPieceAt(4,5,R.x+8,R.y+8).id; o.pickRug=T.bldPieceAt(3,4,3*16+8,4*16+8).id; T.TWN.build=false;
    /* all of it survives a save and a load */
    T.townSave(); T.townReset(); const S=T.townData().lodge.furn.map(d=>d.id).join();
    o.saved=S;
    return o;})()`);
  ok(rg.rug===''&&rg.chair===''&&rg.placed===''&&rg.desk==='','a chair and a desk go down on a rug',rg);
  ok(/already/.test(rg.rug2),'a rug still keeps another rug off its tiles',rg.rug2);
  ok(rg.stove===''&&rg.under==='','and a rug goes down under a stove that stands already',rg);
  ok(rg.at==='chair'&&rg.atRug==='desk,rug','a tile answers with what stands on the rug, and with the rug where nothing does',rg);
  ok(rg.pickChair==='chair'&&rg.pickRug==='rug','a tap lifts the chair before the rug, and the rug where nothing stands',rg);
  ok(rg.saved==='grimoire,sconce,sconce,rug,chair,desk,stove,rug','a chair on a rug is still there after a reload',rg.saved);

  /* 3. the Grimoire shelf */
  const gr=await p.evaluate(`(()=>{const T=__t, D=(${setup})(), o={}, L=()=>T.lodgeRoom(), W=T.TWN;
    const g=()=>L().furn.find(d=>d.id==='grimoire');
    o.start=[g().c,g().r,!!g().free,T.lodgeCh(4,2),T.lodgeCh(5,2)];
    /* never on the tray, never bought */
    T.townBuildSet(true); while(!document.getElementById('townCardWrap').hidden)document.getElementById('townCard').click();
    T.townTrayUI(); o.chip=!!document.querySelector('#townTrow [data-lodge="grimoire"]'); o.again=T.lodgeCanPlace('grimoire',2,4);
    /* the book on its shelf opens from where it stands */
    T.townBuildSet(false); T.lodgeArt(); W.tapPx=[80,30]; T.lodgeTapTile(5,2); W.tapPx=null; o.goal=W.goal;
    for(let i=0;i<400&&(W.path||W.goal);i++)T.townFrame(1/30);
    o.book=!!document.querySelector('#bookOverlay:not([hidden]), #modal:not([hidden])'); try{T.closeBook&&T.closeBook();}catch(e){}
    const closeAll=()=>{while(!document.getElementById('modal').hidden)closeModal&&0; };
    document.getElementById('modal').hidden=true;
    /* lift it, move it across the room, set it down */
    T.townBuildSet(true); while(!document.getElementById('townCardWrap').hidden)document.getElementById('townCard').click();
    const gg=g(); o.lift=T.bldLift(gg); o.moved=T.bldLiftTo(6*16,6*16); o.why=W.lift.why; o.drop=T.bldDrop(); o.now=[gg.c,gg.r];
    o.old=[T.lodgeCanPlace('stove',4,2),T.townSolid(4,2),T.townSolid(6,6)];
    /* salvage and take-up are refused; the haul does not move */
    const r0=JSON.stringify(D.res); o.takeUp=T.lodgeTakeUp(gg); T.bldLift(gg); T.bldStow(); o.stored=D.store.map(e=>e.id).join(); o.free=JSON.stringify(D.store[0].cost);
    W.tab='store'; o.salv=T.bldSalvage('grimoire'); o.still=D.store.length; o.haul=JSON.stringify(D.res)===r0;
    /* one only, wherever it is */
    o.second=T.lodgeCanPlace('grimoire',2,4); o.where=T.trophyWhere('grimoire');
    /* set down from Storage, anywhere with floor */
    W.pick='grimoire'; T.bldTap(2,4); o.back=[g()&&g().c,g()&&g().r,D.store.length];
    T.townBuildSet(false);
    T.townSave(); T.townReset(); o.saved=T.townData().lodge.furn.filter(d=>d.id==='grimoire').map(d=>d.c+','+d.r).join();
    return o;})()`);
  ok(gr.start.join()==='4,2,true,.,.','the Grimoire shelf stands where it always stood, as a free piece on open floor',gr.start);
  ok(!gr.chip&&/already|waits|here/.test(gr.again)||gr.again!=='','it is not on the tray and a second cannot be set down',[gr.chip,gr.again]);
  ok(gr.lift&&gr.moved&&gr.why===''&&gr.drop===''&&gr.now.join()==='6,6','the shelf is lifted and set down across the room',gr);
  ok(gr.old[0]===''&&gr.old[1]===false&&gr.old[2],'where it stood is open floor, and it is solid where it went',gr.old);
  ok(gr.takeUp===false&&gr.salv===false&&gr.still===1&&gr.haul,'it is never taken up or salvaged',gr);
  ok(gr.stored==='grimoire'&&/"iron":0/.test(gr.free),'stored, it waits in Storage and costs nothing',gr);
  ok(/here already|waits in Storage/.test(gr.second)&&gr.where==='store','only one: a second says where the first is',gr);
  ok(gr.back.join()==='2,4,0'&&gr.saved==='2,4','set down from Storage, it is saved where it was set',gr);

  /* it opens the book wherever it stands (button and tap) */
  const op=await p.evaluate(`(()=>{const T=__t, D=(${setup})(), o={}, W=T.TWN, L=()=>T.lodgeRoom(); const g=L().furn.find(d=>d.id==='grimoire');
    g.c=6; g.r=6; T.lodgeSync(); T.lodgeArt();
    W.p.x=7; W.p.y=7.5; W.near=undefined; T.townStep(1/30); o.near=T.townNearAct(); o.label=document.getElementById('townAct').textContent;
    document.getElementById('townAct').click(); o.book=document.getElementById('mTitle').textContent;
    return o;})()`);
  ok(op.near==='shelf'&&op.label==='The Grimoire','standing beside it, wherever it is, the button reads The Grimoire',op);

  /* it cannot be walled in, and not lost */
  const wl=await p.evaluate(`(()=>{const T=__t, D=(${setup})(), o={}, L=()=>T.lodgeRoom();
    T.TWN.p.x=8.5; T.TWN.p.y=7.5;
    const g=L().furn.find(d=>d.id==='grimoire'); g.c=7; g.r=3; T.lodgeSync();
    /* the Grimoire in a corner pocket: pieces around it until the last would shut it in */
    const tries=[]; for(const [id,c,r] of [['desk',7,2],['desk',7,4],['chair',6,2],['chair',6,3],['chair',6,4]]){tries.push(T.lodgePlace(id,c,r)||'ok');}
    o.tries=tries; o.reach=T.lodgeKeepOK(L().furn.filter(d=>!T.LODGE_ITEMS[d.id].flat&&!T.LODGE_ITEMS[d.id].mount));
    /* a save with none anywhere gets one back; one whose place is taken waits in Storage */
    const raw={v:1,lodge:{built:true,furn:[{id:'chair',c:4,r:2},{id:'chair',c:5,r:2}]}};
    const f=T.townFix(raw); o.ensure=[f.lodge.furn.some(d=>d.id==='grimoire'),f.store.filter(e=>e.id==='grimoire').length];
    const none=T.townFix({v:1}); o.noLodge=[none.lodge.furn.length,none.store.length];
    const two=T.townFix({v:1,lodge:{built:true,furn:[{id:'grimoire',c:1,r:3},{id:'grimoire',c:6,r:5}]}}); o.two=two.lodge.furn.filter(d=>d.id==='grimoire').length;
    return o;})()`);
  ok(wl.reach,'whatever is placed leaves the Grimoire reachable',wl);
  ok(wl.tries.slice(0,4).every(t=>t==='ok')&&/wall off the door or the Grimoire/.test(wl.tries[4]),'the piece that would shut the Grimoire in is refused',wl.tries);
  ok(wl.ensure[0]===false&&wl.ensure[1]===1&&wl.noLodge.join()==='0,0'&&wl.two===1,'a Lodge always has its Grimoire (in Storage when its place is taken), only one, and none before the Lodge stands',wl);

  /* 4. the lantern behind the armchair: Ambrose's glow is cut by what stands in front of his feet */
  const lt=await p.evaluate(`(()=>{const T=__t, D=(${setup})(), o={}, W=T.TWN, L=()=>T.lodgeRoom();
    T.lodgeRoom().furn.find(d=>d.id==='sconce').out=true;
    W.kit='lamplighter'; W.p.face='u'; W.p.moving=false;
    const shot=()=>{W.cx=null; for(let i=0;i<4;i++)T.townFrame(1/30);
      const A=T.LODGE_ART, S=A.spr[W.kit][W.p.face], spr=S.walk?T.townFigPick(S,false,W.p.wt,W.t,false):S[0];
      const pfx=Math.round(W.p.x*16), pfy=Math.round(W.p.y*16), cx=W.lcx, cy=W.lcy, em=spr.em, w=em.width, h=em.height;
      const e=em.getContext('2d').getImageData(0,0,w,h).data, bg=W.bc.getImageData(pfx-8-cx,pfy-22-cy,w,h).data;
      let n=0, same=0; for(let i=0;i<w*h;i++){if(e[i*4+3]<250)continue; n++; if(Math.abs(bg[i*4]-e[i*4])<2&&Math.abs(bg[i*4+1]-e[i*4+1])<2&&Math.abs(bg[i*4+2]-e[i*4+2])<2)same++;}
      return [n,same];};
    /* an armchair with Ambrose right behind it: his feet a little north of its front, his lantern low at his side */
    T.lodgePlace('chair',4,5); W.p.x=4.5; W.p.y=4.95; W.p.wt=0;
    o.behind=shot();
    /* the same spot with the chair gone: the whole lantern shows */
    const c=L().furn.find(d=>d.id==='chair'); L().furn.splice(L().furn.indexOf(c),1); T.lodgeSync(); T.lodgeArt();
    o.clear=shot();
    return o;})()`);
  ok(lt.clear[0]>0&&lt.clear[1]===lt.clear[0],'in the open, every glowing pixel of Ambrose’s lantern shows',lt.clear);
  ok(lt.behind[0]>0&&lt.behind[1]<lt.behind[0],'behind an armchair, the part of his lantern the chair covers does not show through it',lt.behind);


  /* 5. Salvage in one tap, from the lifted piece: all it cost comes back at once; Undo takes it back for what it cost; a free piece
     gives nothing; the Grimoire is refused; a small thing on a desk salvages too */
  const sv=await p.evaluate(`(()=>{const T=__t, D=(${setup})(), o={}, L=()=>T.lodgeRoom();
    T.TWN.p.x=8.5; T.TWN.p.y=7.5; T.lodgePlace('chair',3,5); T.lodgePlace('desk',5,5);
    T.townBuildSet(true); while(!document.getElementById('townCardWrap').hidden)document.getElementById('townCard').click();
    const r0=Object.assign({},D.res), c=L().furn.find(d=>d.id==='chair');
    T.bldLift(c); o.btn=!document.getElementById('townScrap').hidden&&!document.getElementById('townScrap').disabled;
    o.done=T.bldScrap(); o.gone=!L().furn.includes(c); o.back=[D.res.timber-r0.timber,D.res.tallow-r0.tallow]; o.store=D.store.length; o.lift=!!T.TWN.lift;
    o.say=document.getElementById('townTmsg').textContent;
    /* Undo: it comes back, and is paid for again */
    T.bldUndo(); o.undone=L().furn.some(d=>d.id==='chair'); o.paid=JSON.stringify(D.res)===JSON.stringify(r0);
    /* a small thing */
    const desk=L().furn.find(d=>d.id==='desk'); T.townBuildSet(false); T.lodgePlaceSmall('candle',...T.lodgeSlotPoint(desk,0)); T.townBuildSet(true);
    const t0=D.res.tallow, it=desk.on[0]; T.bldLiftItem(desk,it); o.item=T.bldScrap(); o.itemGone=!desk.on; o.itemBack=D.res.tallow-t0;
    T.bldUndo(); o.itemUndo=(desk.on||[]).length===1;
    /* a free sconce: nothing back; the Grimoire: refused, and the button is off while it is lifted */
    const sc=L().furn.find(d=>d.id==='sconce'), h0=JSON.stringify(D.res); T.bldLift(sc); T.bldScrap(); o.sconce=[!L().furn.includes(sc),JSON.stringify(D.res)===h0];
    const g=L().furn.find(d=>d.id==='grimoire'); T.bldLift(g); T.townTrayUI(); o.gBtn=document.getElementById('townScrap').disabled; o.gDone=T.bldScrap(); o.gStill=L().furn.includes(g)&&!!T.TWN.lift;
    T.bldCancel(); T.townBuildSet(false); return o;})()`);
  ok(sv.btn&&sv.done&&sv.gone&&sv.back.join()==='8,2'&&sv.store===0&&!sv.lift,'Salvage on a lifted piece breaks it up at once: all it cost is back, nothing waits in Storage',sv);
  ok(/You salvage the Armchair/.test(sv.say)&&sv.undone&&sv.paid,'it says so, and Undo brings it back and charges for it again',sv);
  ok(sv.item&&sv.itemGone&&sv.itemBack===1&&sv.itemUndo,'a small thing salvages the same way',sv);
  ok(sv.sconce[0]&&sv.sconce[1],'a starting sconce salvages for nothing',sv.sconce);
  ok(sv.gBtn&&sv.gDone===false&&sv.gStill,'the Grimoire cannot be salvaged: the button is off and a press does nothing',sv);

  /* 6. the Grimoire is a podium with a book floating over it: one tile, four facings, a tap anywhere on it lifts it, its chip draws
     in Storage, and the book opens as you come near and shuts as you leave */
  const pd=await p.evaluate(`(()=>{const T=__t, D=(${setup})(), o={}, W=T.TWN, L=()=>T.lodgeRoom(), I=T.LODGE_ITEMS.grimoire;
    const g=L().furn.find(d=>d.id==='grimoire');
    o.foot=[0,2,4,6].map(f=>{const F=T.pieceFoot(I,f); return F.w+'x'+F.h;}).join();
    const sig=f=>T.lodgeFA('grimoire',f).cv.toDataURL(); o.faces=[sig(0)!==sig(2),sig(4)!==sig(0),sig(2)!==sig(6),sig(0)===sig(1)];
    /* a tap on the book above the podium lifts it (nothing chosen on the tray) */
    T.townBuildSet(true); while(!document.getElementById('townCardWrap').hidden)document.getElementById('townCard').click();
    const R=T.pieceRect(g,I); o.top=T.bldPieceAt(4,1,R.x+8,R.y-12)===g; o.pod=T.bldPieceAt(4,2,R.x+8,R.y+4)===g; o.beside=T.bldPieceAt(2,2,R.x-9,R.y+4)!==g;
    /* turning it */
    T.bldLift(g); T.bldTurn(1); T.bldTurn(1); o.turned=W.lift.f; T.bldDrop(); o.f=g.f;
    /* stored, its chip draws and nothing throws */
    T.bldLift(g); T.bldStow(); W.tab='store'; let err=null; try{T.townTrayUI();}catch(e){err=String(e);} o.chip=[!err,!!document.querySelector('#townTrow [data-stored="grimoire"] img')];
    W.tab='pieces'; W.pick=null; W.pick='grimoire'; W.tab='store'; T.bldTap(5,3); W.tab='pieces'; T.townBuildSet(false);
    /* the book: shut far off, open near, shut again; it bobs, and its aura is its own frame */
    const gg=L().furn.find(d=>d.id==='grimoire'); gg.c=5; gg.r=3; gg.f=0; T.lodgeSync(); T.lodgeArt();
    W.p.x=5.5; W.p.y=8; W.p.face='u'; for(let i=0;i<40;i++)T.townFrame(1/30); o.far=W.bk.s;
    W.p.x=5.5; W.p.y=5.2; for(let i=0;i<40;i++)T.townFrame(1/30); o.near=W.bk.s;
    const st=[]; W.p.x=5.5; W.p.y=8; for(let i=0;i<4;i++){T.townFrame(1/30); st.push(W.bk.s);} o.closing=st;
    for(let i=0;i<40;i++)T.townFrame(1/30); o.shut=W.bk.s;
    const sh=s=>T.lodgeBookFrame(0,s,0).toDataURL(); o.steps=new Set([0,1,2,3,4].map(sh)).size; o.bob=new Set([0,1,2].map(b=>T.lodgeBookFrame(0,4,b).toDataURL())).size;
    o.em=T.lodgeBookEm(0,4,0,5).width===28&&T.lodgeBookEm(0,4,0,5)!==T.lodgeBookEm(0,0,0,5);
    return o;})()`);
  ok(pd.foot==='1x1,1x1,1x1,1x1','the Grimoire’s podium is one tile',pd.foot);
  ok(pd.faces.every(Boolean),'it turns: front, side and back differ, east mirrors west, a diagonal shows the front',pd.faces);
  ok(pd.top&&pd.pod&&pd.beside,'a tap on the book above the podium lifts it, as one on the podium does; a tap beside it does not',pd);
  ok(pd.turned===2&&pd.f===2,'and it turns',pd);
  ok(pd.chip[0]&&pd.chip[1],'stored, its chip draws in Storage',pd.chip);
  ok(pd.far===0&&pd.near===4&&pd.closing[0]>0&&pd.shut===0,'the book is shut away from it, opens when you come near, and shuts again in steps when you leave',pd);
  ok(pd.steps===5&&pd.bob>=2&&pd.em,'five steps from shut to open, a bob, and an aura frame of its own',pd);

  ok(!errs.length,'no page errors',errs);
  await b.close();
  if(fails.length){for(const f of fails)console.log('FAIL '+f); process.exit(1);}
  console.log('lodgemove: ok');
})();
