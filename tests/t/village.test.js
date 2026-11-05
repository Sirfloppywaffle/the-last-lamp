// Saltmouth, Expansion 4, step 7: the village (expansion/EXPANSION4_RUNBOOK.md §5).
// - New pieces from PixelLab: lantern posts, benches, kelp planters, statues, fences and a hut for each Keeper, every one on PX
//   letters with a footprint, a group on the tray and (for a variant) a pack from the Peddler; the first of each kind is open.
// - A pack is a blueprint: a shut variant refuses with the reason, the Peddler sells it, and developer mode opens all.
// - Paint and trim: each building that stands has three colourways (letter swaps of its rows, never a pane), for tallow while worn,
//   paid back on its own colours, kept in ll-town.paint, undone by Undo, and never on a ruin.
// - Keepers' huts: one to a Keeper once freed; the door is a kept, reachable tile; the Keeper stands there unless at work.
// - Developer mode writes nothing.
const {chromium}=require('playwright');
const fails=[]; const ok=(c,m,d)=>{if(!c)fails.push(m+(d!==undefined?' '+JSON.stringify(d).slice(0,700):''));};
(async()=>{
  const b=await chromium.launch(); const p=await b.newPage({viewport:{width:412,height:860}});
  const errs=[]; p.on('pageerror',e=>errs.push(String(e)));
  await p.goto('file://'+process.argv[2]); await p.waitForTimeout(300);
  const before=await p.evaluate(()=>localStorage.getItem('ll-town'));

  /* 1. the data */
  const g=await p.evaluate(()=>{const T=__t, D=T.TOWN_DECOS, R=T.TOWN_PIECE_ROWS, o={bad:[],art:0,packs:{}};
    for(const id in D){const d=D[id]; if(!d.art)continue; o.art++;
      const rows=R[d.art]; if(!rows||!rows.length||rows.some(r=>r.length!==rows[0].length||[...r].some(ch=>ch!=='.'&&!T.PX[ch])))o.bad.push(id+' rows');
      if(!T.TOWN_GROUPS[d.grp])o.bad.push(id+' group'); if(d.pack&&!T.TOWN_PACKS[d.pack])o.bad.push(id+' pack');
      if(!d.cost||Object.keys(d.cost).some(k=>!['timber','iron','tallow','curios'].includes(k)))o.bad.push(id+' cost');
      if(d.pack)o.packs[d.pack]=(o.packs[d.pack]|0)+1;
      /* a piece is no wider than its tiles plus a little overhang, and rises above them */
      const w=(d.w||1)*16; if(rows&&(rows[0].length>w+(d.hut?14:10)||rows[0].length<8))o.bad.push(id+' width '+rows[0].length+' on '+w);}
    o.wares=Object.keys(T.TOWN_PACKS).every(k=>T.PEDDLER_WARES['pk:'+k]&&T.PEDDLER_WARES['pk:'+k].pk===k&&Object.keys(T.PEDDLER_WARES['pk:'+k].cost).join()==='curios');
    o.eachPack=Object.keys(T.TOWN_PACKS).every(k=>o.packs[k]>=1||Object.values(D).some(d=>d.pack===k));
    /* the first of each kind is open (no pack) and every group has one open piece */
    o.open=Object.keys(T.TOWN_GROUPS).every(k=>Object.keys(D).some(id=>D[id].grp===k&&!D[id].pack));
    /* one hut for each Keeper that stands in the square */
    const huts=Object.values(D).filter(d=>d.hut).map(d=>d.hut).sort().join(), keepers=Object.keys(T.TOWN_STAND).sort().join(); o.huts=huts===keepers;
    o.hutDoors=Object.values(D).filter(d=>d.hut).every(d=>d.w===2&&d.h===2&&d.snap);
    o.wang=['es','ep','es2','ep2','ep3'].every(k=>T.TOWN_WANG[k]&&Object.keys(T.TOWN_WANG[k]).length===16);
    o.pathsTerr=Object.values(D).filter(d=>d.path).every(d=>d.terr>0&&(!d.terrT||d.terrT===d.terr+1));
    return o;});
  ok(!g.bad.length&&g.art===33,'every new piece has rows on PX letters, a group, a cost in the four materials and a sane width',[g.art,g.bad]);
  ok(g.wares&&g.eachPack,'every pack is a Peddler ware for curios, and holds a piece',g);
  ok(g.open,'every group has a piece open from the start',g.open);
  ok(g.huts&&g.hutDoors,'there is one hut for each Keeper, two by two and kept to the tiles',g);
  ok(g.wang&&g.pathsTerr,'the paths’ Wang sets are all there, and each path has its terrain (a turned one is the next code)',g);

  /* 2. a pack is a blueprint: shut until the Peddler sells it, open in developer mode without writing */
  const k=await p.evaluate(()=>{const T=__t, o={}; T.setDev(false); T.townReset(); T.townOpen();
    const Tn=T.townData(); Tn.res={timber:900,iron:900,tallow:900,curios:90}; Tn.rescued=['peddler']; Tn.blueprints=[];
    const spot=(id)=>{for(let r=2;r<22;r++)for(let c=1;c<22;c++)if(!T.townCanPlace(id,c,r)||T.townCanPlace(id,c,r).startsWith('Locked'))if(T.townCanPlace(id,c,r)==='')return [c,r]; return null;};
    o.shut=T.townCanPlace('post2',...__t.at(3,14)); o.open1=T.townCanPlace('post1',...__t.at(3,14));
    o.why=T.townLockWhy('bench3'); o.free=T.townLockWhy('bench1');
    Tn.wares={trip:Tn.trips|0,items:['pk:posts']}; T.townSave(); o.buy=T.peddlerBuy('pk:posts');
    o.bought=T.townData().blueprints.includes('posts'); o.after=T.townCanPlace('post2',...__t.at(3,14));
    o.spent=900-0; o.curios=T.townData().res.curios;
    o.stillShut=T.townLockWhy('bench3');
    T.setDev(true); o.dev=T.townLockWhy('bench3'); T.setDev(false);
    return o;});
  ok(/^Locked: ask the Peddler/.test(k.shut)&&k.open1===''&&k.free==='','a variant in a shut pack refuses, with the reason; the first of its kind is open',k);
  ok(k.buy===''&&k.bought&&k.after===''&&k.curios===87,'the Peddler sells the pack for 3 curios, and its variants open',k);
  ok(/^Locked/.test(k.stillShut)&&k.dev==='','a pack you have not bought stays shut, and developer mode shows it open',k);

  /* 3. paint and trim */
  const q=await p.evaluate(()=>{const T=__t, o={}; T.setDev(false); T.townReset(); T.townOpen();
    const Tn=T.townData(); Tn.res={timber:900,iron:900,tallow:20,curios:9}; Tn.buildings={brazier:2,quay:1,smithy:0,belfry:0,menagerie:0}; Tn.rescued=[]; Tn.lodge.built=false;
    o.list=T.townPaintList().map(B=>B.art).join();
    /* a ruin or a building not restored is not on the list, and a paint cannot be asked of it */
    o.ruin=T.townPaintCycle('smithy'); o.keys=T.PAINT_KEYS.join();
    T.townArt(); const h=T.TOWN_HOUSES.find(x=>x.art==='brazier'), W=T.TOWN_BLD.brazier, px=(cv,x,y)=>{const d=cv.getContext('2d').getImageData(x,y,1,1).data; return d.join();};
    const own=T.townHouse(h).cv, panes=[]; for(const rects of W.win)for(const [x0,y0,w,hh] of rects)panes.push([x0+(w>>1),y0+(hh>>1)]);
    const ownPx=panes.map(([x,y])=>px(own,x,y)), ownAll=own.toDataURL();
    o.c1=T.townPaintCycle('brazier'); T.townArt(); const a=T.townHouse(T.TOWN_HOUSES.find(x=>x.art==='brazier')).cv;
    o.paid=Tn.res.tallow; o.differs=a.toDataURL()!==ownAll; o.panes=panes.map(([x,y])=>px(a,x,y)).join('|')===ownPx.join('|');
    o.saved=T.townData().paint.brazier; o.key1=T.townPaintOf('brazier');
    /* a second tap is the next colourway, free; a fourth is its own colours, paid back */
    T.townPaintCycle('brazier'); o.k2=T.townPaintOf('brazier'); o.paid2=Tn.res.tallow;
    T.townPaintCycle('brazier'); o.k3=T.townPaintOf('brazier'); T.townPaintCycle('brazier'); o.k4=T.townPaintOf('brazier'); o.back=Tn.res.tallow;
    /* too poor */
    Tn.res.tallow=3; o.poor=T.townPaintCycle('quay')===false&&!T.townPaintOf('quay'); Tn.res.tallow=20;
    /* Undo takes a coat back */
    T.townBuildSet(true); T.TWN.tab='paint'; T.townPaintCycle('quay'); o.undoOn=T.townPaintOf('quay'); T.bldUndo(); o.undoOff=T.townPaintOf('quay'); T.townBuildSet(false);
    /* a saved paint on a building that is a ruin shows its own colours; paint on a ruin reads as none */
    Tn.paint={brazier:'kelp',smithy:'tar'}; o.ruinRead=T.townPaintOf('smithy'); o.fixed=JSON.stringify(T.paintFix({brazier:'kelp',smithy:'nope',oar:7,x:'tar'}));
    /* kept through a reload */
    T.townSave(); const raw=JSON.parse(localStorage.getItem('ll-town')); o.stored=raw.paint&&raw.paint.brazier;
    T.townClose(); return o;});
  ok(q.list==='brazier,quay'&&q.ruin===false,'only buildings that stand are paintable',q);
  ok(q.c1===true&&q.paid===16&&q.differs&&q.panes&&q.key1==='tar','a first coat costs 4 tallow and changes the building but never a pane',q);
  ok(q.k2==='kelp'&&q.paid2===16&&q.k3==='bone'&&q.k4===null&&q.back===20,'the next colourways are free; its own colours give the 4 tallow back',q);
  ok(q.poor,'you cannot paint without the tallow',q);
  ok(q.undoOn&&!q.undoOff,'Undo takes a coat back',q);
  ok(q.ruinRead===null&&q.fixed==='{"brazier":"kelp"}','a ruin wears no paint, and a saved paint that makes no sense is dropped',q);
  ok(q.stored==='kelp','a colourway is kept in ll-town.paint',q);

  /* 4. the Keepers' huts */
  const h=await p.evaluate(()=>{const T=__t, o={}; T.setDev(false); T.townReset(); T.townOpen();
    localStorage.setItem('ll-meta',JSON.stringify({embers:0,unlocked:[],lastKit:'lamplighter'})); T.townClose(); T.townOpen();
    const Tn=T.townData(); Tn.res={timber:900,iron:900,tallow:900,curios:90}; Tn.chore=null; Tn.chore2=null; T.townSave();
    o.locked=T.townCanPlace('hut_whaler',2,2);
    const locks=Object.values(T.KITS).map(k=>k.lock).filter(Boolean); localStorage.setItem('ll-meta',JSON.stringify({embers:0,unlocked:locks,lastKit:'lamplighter'})); T.townClose(); T.townOpen();
    let spot=null; for(let r=12;r<20&&!spot;r++)for(let c=1;c<22&&!spot;c++)if(T.townCanPlace('hut_whaler',c,r)==='')spot=[c,r];
    o.spot=spot; if(!spot)return o;
    const [c,r]=spot, door=[c+1,r+2], at=()=>T.TWN.crowd.find(e=>e.k==='whaler');
    o.st0=[at().tx,at().ty];
    o.placed=T.townPlace('hut_whaler',c,r)==='';
    o.doorStand=[at().tx,at().ty]; o.doors=JSON.stringify(T.townHutDoors());
    /* map expansion, M1: the first other spot where a hut's ground is open says why not (M2: a plot's ground has reasons of its own) */
    o.twice=''; for(let rr=12;rr<30&&!o.twice;rr++)for(let cc=1;cc<34&&!o.twice;cc++){if(Math.abs(cc-c)<3&&Math.abs(rr-r)<3)continue; const m=T.townCanPlace('hut_whaler',cc,rr); if(m&&!/open ground|Something stands|Keep it clear|wall off|deck|tower|shut behind|Clear it first|gateway|the dock/.test(m))o.twice=m;}
    o.onDoor=T.townCanPlace('tree',door[0],door[1]-1); o.bench=T.townCanPlace('bench1',door[0],door[1]);
    o.reach=!!T.townPathTo(door[0],door[1]); o.keepOK=T.townKeepOK(T.townData().decos);
    /* at work, the Keeper is at their workplace instead */
    Tn.chore='whaler'; T.townSave(); T.townDecoSync(); o.work=[at().tx,at().ty]; Tn.chore=null; T.townDecoSync();
    /* a reload keeps the hut; a town saved with a tree on the door gives the hut back and pays */
    const raw=JSON.parse(JSON.stringify(T.townData())); const fx=T.townFix(raw); o.kept=fx.decos.some(d=>d.id==='hut_whaler');
    const bad=T.townFix({v:2,res:{timber:0,iron:0,tallow:0,curios:0},decos:[{id:'tree',c:door[0],r:door[1]-1},{id:'hut_whaler',c:c,r:r}]});
    o.bad={huts:bad.decos.filter(d=>d.id==='hut_whaler').length,timber:bad.res.timber,iron:bad.res.iron};
    /* taking it up puts the Keeper back at their footing */
    const d=T.townData().decos.find(e=>e.id==='hut_whaler'); T.townTakeUp(d); o.back=[at().tx,at().ty]; o.refund=T.townData().res.timber;
    T.townClose(); return o;});
  ok(h.spot,'a hut has somewhere to stand',h);
  if(h.spot){
    ok(/not freed yet/.test(h.locked),'a Keeper not freed has no hut to build',h.locked);
    ok(h.placed&&h.doors===JSON.stringify([[h.spot[0]+1,h.spot[1]+2]]),'a hut stands, and its door is the tile below its right half',h);
    ok(h.doorStand[0]===h.spot[0]+1&&h.doorStand[1]===h.spot[1]+2&&(h.st0[0]!==h.doorStand[0]||h.st0[1]!==h.doorStand[1]),'the Keeper stands at their hut’s door, not their footing',h);
    ok(/has a hut already/.test(h.twice),'a Keeper has one hut',h.twice);
    ok(/Keeper’s door/.test(h.onDoor)||/Keeper’s door|Something stands/.test(h.bench),'nothing may stand on a hut’s door',[h.onDoor,h.bench]);
    ok(h.reach&&h.keepOK,'the door can be walked to, and counts among the places that must stay reachable',h);
    ok(h.work[0]===h.st0[0]&&h.work[1]!==h.st0[1]||h.work[0]!==h.doorStand[0],'at work the Keeper is at their workplace, not the hut',[h.work,h.st0]);
    ok(h.kept&&h.bad.huts===0&&h.bad.timber>=20&&h.bad.iron>=6,'a hut survives a reload; one whose door was built over comes up and pays back',h);
    ok(h.back[0]===h.st0[0]&&h.back[1]===h.st0[1],'taking the hut up puts the Keeper back at their footing',h);
  }

  /* 5. the tray: a group chip, shut chips with their padlock, Paint beside Pieces and Storage */
  const t=await p.evaluate(()=>{const T=__t, o={}; T.setDev(false); T.townReset(); T.townOpen(); T.townData().blueprints=[]; T.townBuildSet(true);
    const chips=()=>[...document.querySelectorAll('#townTrow [data-deco]')].map(c=>c.dataset.deco);
    o.g0=document.getElementById('townGrp').dataset.townset; o.c0=chips().join();
    const names=[o.g0]; for(let i=0;i<8;i++){document.getElementById('townGrp').click(); names.push(document.getElementById('townGrp').dataset.townset);}
    o.names=names.join(); o.cycle=names[0]===names[7];
    T.TWN.grp='seat'; T.townTrayUI(); document.getElementById('townGrp').click(); T.TWN.grp='seat'; T.townTrayBuild(); document.querySelector('#townTrow').dataset.scene='x'; T.townTrayBuild();
    o.seat=chips().join(); o.locks=document.querySelectorAll('#townTrow img.town-lock').length;
    const shut=document.querySelector('#townTrow [data-deco="bench3"]'); shut.click(); o.say=document.getElementById('townTmsg').textContent; o.pick=T.TWN.pick;
    const paintTab=document.querySelector('#townTools [data-tab="paint"]'); o.paintTab=!!paintTab&&!paintTab.hidden; paintTab.click(); o.tab=T.TWN.tab; o.msg=document.getElementById('townTmsg').textContent;
    o.paintChips=document.querySelectorAll('#townTrow [data-paint]').length;
    T.townBuildSet(false); T.townClose(); return o;});
  ok(t.g0==='ground'&&t.cycle&&t.names.split(',').length===9,'the first chip turns through the groups and back round',t);
  ok(t.seat.split(',').length===6&&t.locks===5,'the benches show their five shut ones with a padlock',t);
  ok(/^Locked/.test(t.say)&&t.pick===null,'tapping a shut chip says why and chooses nothing',t);
  ok(t.paintTab&&t.tab==='paint'&&/Nothing stands|Paint:/.test(t.msg),'Paint sits in the tray beside Pieces and Storage',t);

  /* 6. a path is a floor: a piece stands on it, a tap with a piece chosen sets it down and a tap with nothing lifts what is on top;
     a path is never laid over a path; and a cell of one path all round is that path's own full tile, not the cobbles */
  const fl=await p.evaluate(()=>{const T=__t, o={}; T.setDev(true); T.townReset(); T.townOpen(); const D=T.townData(); D.res={timber:900,iron:900,tallow:900,curios:90}; D.decos=[]; T.townBuildSet(true);
    o.lay=T.townPlace('shell',3,26)===''; o.lay2=T.townPlace('shell',4,26)===''; T.townPlace('shell',3,27); T.townPlace('shell',4,27);
    o.again=T.townCanPlace('shell',3,26); o.can=T.townCanPlace('bench1',3,26);
    T.TWN.tab='pieces'; T.TWN.pick='bench1'; T.townBuildTap(3,26);
    const here=T.townData().decos.filter(d=>d.c===3&&d.r===26).map(d=>d.id).sort().join(); o.here=here; o.lift=!!T.TWN.lift; o.at=T.townDecoAt(3,26).id;
    /* nothing chosen: the bench on top is lifted, not the path */
    T.TWN.pick=null; T.townBuildTap(3,26); o.lifted=T.TWN.lift&&T.TWN.lift.id; if(T.TWN.lift)T.bldCancel&&T.bldCancel();
    /* a path laid under a piece that stands */
    o.under=T.townCanPlace('cobble',3,25)===''; T.TWN.pick='cobble'; T.townBuildTap(9,26); o.cob=T.townData().decos.some(d=>d.id==='cobble'&&d.c===9&&d.r===26);
    const sel=T.townWangSel(3,3,3,3), sel2=T.townWangSel(3,3,3,0), selp=T.townWangSel(7,7,7,7);
    o.full=sel[0]===T.TOWN_WANG.es&&sel[1]==='1111'; o.part=sel2[0]===T.TOWN_WANG.es&&sel2[1]==='1110'; o.p2=selp[0]===T.TOWN_WANG.ep2&&selp[1]==='1111';
    T.townBuildSet(false); T.townClose(); T.setDev(false); return o;});
  ok(fl.lay&&fl.lay2&&/^Something stands there/.test(fl.again)&&fl.can==='','a bench may stand on a laid path, and a path may not be laid on a path',fl);
  ok(fl.here==='bench1,shell'&&!fl.lift&&fl.at==='bench1','a tap with a bench chosen sets it on the path instead of lifting the path',fl);
  ok(fl.lifted==='bench1'&&fl.under&&fl.cob,'with nothing chosen the bench is lifted, and a path may be laid under a piece',fl);
  ok(fl.full&&fl.part&&fl.p2,'a cell all of one path is that path’s own full tile, never the cobbles',fl);

  /* 8. turning (Criss on #151: every view the same piece): a one-tile piece (post, statue, barrel, urn) turns an eighth at a time
     through eight drawn views on the same tile; a two-tile piece (bench, trough, fence) a quarter at a time through four, covering
     1 by 2 tiles end-on. Each view is its own rows (TOWN_PIECE_TURN, on PX letters), none a mirror, and no two alike */
  const tr=await p.evaluate(()=>{const T=__t, o={one:{},two:{},bad:[]}; T.setDev(true); T.townReset(); T.townOpen(); const D=T.townData(); D.res={timber:900,iron:900,tallow:900,curios:90}; D.decos=[]; T.townBuildSet(true); T.TWN.p.x=__t.ax(18.5); T.TWN.p.y=__t.ay(13.5);
    const dat=(c)=>c.toDataURL();
    for(const id in T.TOWN_DECOS){const I=T.TOWN_DECOS[id]; if(!I.art||I.hut)continue;
      const R=T.TOWN_PIECE_TURN[I.art], want=(I.w||1)>1?[2,4,6]:[1,2,3,4,5,6,7];
      if(!R||want.some(g=>!R[g]))o.bad.push(id+' lacks a view');
      else for(const g of want)if(R[g].some(r=>/[^.0-9a-y]/.test(r)||r.length!==R[g][0].length))o.bad.push(id+' '+g+' not on PX');
      const seen=new Set(); for(let f=0;f<8;f++){const [g,m]=T.townPieceFace({id,f}); if(m)o.bad.push(id+' '+f+' mirrored'); seen.add(dat(T.townPieceArt(id,g,m).cv));}
      if(seen.size!==want.length+1)o.bad.push(id+' shows '+seen.size+' views');}
    for(const id of ['post2','statue3','planter4']){
      T.townPlace(id,...__t.at(4,14)); const d=D.decos.find(e=>e.id===id); T.bldLift(d); const fs=[], tiles=new Set();
      for(let k=0;k<8;k++){T.bldTurn(1); fs.push(T.TWN.lift.f); tiles.add(T.decoTiles(id,d.c,d.r,T.TWN.lift.f).join());}
      o.one[id]=[fs.join(),tiles.size]; T.bldCancel(); D.decos=[]; T.townDecoSync();}
    for(const id of ['bench1','bench4','planter1','rail1','rail2','rail3','rail4']){
      const ok=T.townPlace(id,...__t.at(3,14))===''; const d=D.decos.find(e=>e.id===id); T.bldLift(d); T.bldTurn(1); const f=T.TWN.lift.f, t=T.decoTiles(id,d.c,d.r,f);
      o.two[id]=[ok,f,t.length,new Set(t.map(q=>q[0])).size,new Set(t.map(q=>q[1])).size,T.TWN.lift.why]; T.bldCancel(); D.decos=[]; T.townDecoSync();}
    /* a turned piece stands, is saved turned, and comes back turned */
    T.townPlace('bench2',...__t.at(5,14)); const b=D.decos.find(e=>e.id==='bench2'); b.f=6; T.townDecoSync(); o.saved=T.townFix(JSON.parse(JSON.stringify(D))).decos.filter(e=>e.id==='bench2').map(e=>e.f).join();
    o.diagSaved=T.townFix({decos:[{id:'statue1',c:6,r:13,f:3},{id:'post1',c:8,r:13,f:5}]}).decos.map(e=>e.f).join();
    T.townBuildSet(false); T.townClose(); T.setDev(false); return o;});
  ok(!tr.bad.length,'every new piece has a view of its own for each facing it turns to, on PX letters, none a mirror',tr.bad);
  for(const id in tr.one)ok(tr.one[id][0]==='1,2,3,4,5,6,7,0'&&tr.one[id][1]===1,'the '+id+' turns an eighth at a time on the same tile, and eight turns bring it back',[id,tr.one[id]]);
  for(const id in tr.two)ok(tr.two[id][0]&&tr.two[id][1]===2&&tr.two[id][2]===2&&tr.two[id][3]===1&&tr.two[id][4]===2,'the '+id+' turns a quarter to run north to south',[id,tr.two[id]]);
  ok(tr.saved==='6'&&tr.diagSaved==='3,5','a turned piece is kept turned, a diagonal too',tr);

  /* 7. developer mode: a chip in the tray turns the town's darkness off to see by; shut in normal play */
  const dk=await p.evaluate(()=>{const T=__t, o={}; T.setDev(false); T.townReset(); T.townOpen(); T.townBuildSet(true);
    o.hidden=document.getElementById('townLight').hidden; T.setDev(true); T.townTrayUI(); o.shown=!document.getElementById('townLight').hidden;
    document.getElementById('townLight').click(); o.off=window.devNoDark===true; T.townDraw(); o.label=document.getElementById('townLight').textContent;
    document.getElementById('townLight').click(); o.on=window.devNoDark===false; window.devNoDark=false;
    T.townBuildSet(false); T.townClose(); T.setDev(false); return o;});
  ok(dk.hidden&&dk.shown&&dk.off&&dk.on,'a developer-only chip turns the darkness off and on in the square',dk);

  /* developer mode wrote nothing to ll-town */
  const after=await p.evaluate(()=>localStorage.getItem('ll-town'));
  ok(typeof after==='string'||after===null,'ll-town is readable');
  const dev=await p.evaluate(()=>{const T=__t; T.setDev(false); T.townReset(); const s0=localStorage.getItem('ll-town'); T.setDev(true); T.townOpen(); const D=T.townData(); D.res={timber:900,iron:900,tallow:900,curios:90}; D.rescued=['croupier']; D.lodge.built=true;
    T.townPaintCycle('lodge'); T.townPlace('post3',...__t.at(3,14)); T.townPlace('hut_whaler',12,13); T.townClose(); T.setDev(false); return [s0,localStorage.getItem('ll-town')];});
  ok(dev[0]===dev[1],'developer mode paints and builds without writing ll-town',dev.map(x=>x&&x.slice(0,80)));
  if(errs.length)fails.push('page errors: '+errs.join(' | '));
  await b.close();
  if(fails.length){for(const f of fails)console.log('FAIL '+f); process.exit(1);} console.log('village: all good');
})();
