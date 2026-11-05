// Saltmouth, Expansion 4, step 9 (expansion/EXPANSION4_RUNBOOK.md §5): the Keepers react.
// - Waypoints: benches, the Hearth Beacon once lit (its front), and in the Lodge the stove, armchairs and the fireplace. An idle
//   Keeper walks to one by a path over both shelves and their stairs, never through anything solid on TOWN_MAP (a shut plot,
//   debris), lingers, and walks home. Unlit, the Hearth is no waypoint. A Keeper at a chore never wanders.
// - Each Keeper has a favourite set and lingers near it: a waypoint with their favourites near it is chosen more and held longer,
//   and talking to them there they say so.
// - In the Lodge they are gone from the square and stand beside the piece in its room, to talk to.
// - Lore chalk: a favourite built near a Keeper's post makes them leave a note there once; it stays, survives a reload, reads on a
//   tap, and developer mode writes none.
// - The cellar's tide: a death raises the brine a step, a win drains it; kelp and barnacles stay on what it reached until the win
//   after that. The brine, the wade and the pieces' art follow it.
// - A walking Keeper makes nothing per frame: no canvas, no image data (as fog.test.js counts).
const {chromium}=require('playwright');
const fails=[]; const ok=(c,m,d)=>{if(!c)fails.push(m+(d!==undefined?' '+JSON.stringify(d).slice(0,700):''));};
(async()=>{
  const b=await chromium.launch(); const p=await b.newPage({viewport:{width:412,height:860}});
  const errs=[]; p.on('pageerror',e=>errs.push(String(e)));
  await p.goto('file://'+process.argv[2]); await p.waitForTimeout(300);
  const ALL=['kit_whaler','kit_occultist','kit_galvanist','kit_bellringer'];
  /* a fresh town with every Keeper freed and the Lamplighter carried, in developer mode (nothing is written) unless real */
  const setup=(real)=>p.evaluate(([u,real])=>{const T=__t;
    localStorage.setItem('ll-meta',JSON.stringify({embers:50,unlocked:u,lastKit:'lamplighter'}));
    localStorage.removeItem('ll-town'); T.closeModal(); T.setDev(!real); T.townReset(); T.townClose(); T.townOpen();
    const D=T.townData(); D.res={timber:999,iron:999,tallow:999,curios:99}; return true;},[ALL,real]);
  /* holds every Keeper at home but one, then runs the square until that one reaches somewhere (or the time runs out) */
  const helpers=`
    window.__k={
      hold(k){const KS=__t.TWN.kst; for(const q in KS)KS[q].t=q===k?0:1e9;},
      run(k,until,secs){const T=__t, W=T.TWN, e=W.kst[k], o={tiles:[],solid:0,moved:0,frames:0}; let lx=e.x, ly=e.y;
        for(let i=0;i<secs*20;i++){T.townFrame(1/20); o.frames++;
          if(e.x!==lx||e.y!==ly){o.moved++; lx=e.x; ly=e.y;}
          const tx=Math.floor(e.x), ty=Math.floor(e.y); if(!e.away){if(T.townSolid(tx,ty))o.solid++; const t=tx+','+ty; if(o.tiles[o.tiles.length-1]!==t)o.tiles.push(t);}
          if(until(e))break;}
        o.mode=e.mode; o.at=[e.tx,e.ty]; return o;},
      spot(id,rows){const T=__t; for(const r of rows)for(let c=2;c<34;c++)if(T.townCanPlace(id,c,r)==='')return [c,r]; return null;}};`;
  await p.evaluate(h=>{(0,eval)(h);},helpers);

  /* 1. nothing to go to: they stay at their posts */
  await setup(false);
  const idle=await p.evaluate(()=>{const T=__t, W=T.TWN, o={};
    o.wps=T.keeperWaypoints(T.townData()).length; const at=W.crowd.filter(e=>e.mode).map(e=>e.k+e.tx+','+e.ty).join();
    for(let i=0;i<600;i++)T.townFrame(1/20);
    o.same=W.crowd.filter(e=>e.mode).map(e=>e.k+e.tx+','+e.ty).join()===at; o.modes=W.crowd.filter(e=>e.mode).map(e=>e.mode).join();
    /* an unlit Hearth is no waypoint; lit, its front is */
    T.townData().hearth={lv:0}; o.cold=T.keeperWaypoints(T.townData()).some(w=>w.kind==='hearth');
    T.townData().hearth={lv:2}; const h=T.keeperWaypoints(T.townData()).find(w=>w.kind==='hearth');
    o.lit=!!h; o.front=h&&h.spots.slice(0,2).map(s=>[s.x,s.y]); o.want=T.HEARTH.front; T.townData().hearth={lv:0};
    return o;});
  ok(idle.wps===0&&idle.same&&/^(home,?)+$/.test(idle.modes),'with no bench, no lit Hearth and no Lodge piece, every Keeper stays at their post',idle);
  ok(!idle.cold&&idle.lit&&JSON.stringify(idle.front)===JSON.stringify(idle.want),'an unlit Hearth is no waypoint; lit, the ground before it is',idle);

  /* 2. a bench on the Square: the Nameless walks down from the cemetery on the Rise, by a stair, never through anything solid */
  await setup(false);
  const walk=await p.evaluate(()=>{const T=__t, W=T.TWN, o={};
    o.spot=__k.spot('bench1',[27,26,25]); if(!o.spot)return o;
    o.place=T.townPlace('bench1',...o.spot); T.townBuildSet&&W.build&&T.townBuildSet(false);
    const w=T.keeperWaypoints(T.townData()); o.kind=w.map(q=>q.kind).join();
    __k.hold('occultist'); const e=W.kst.occultist; o.home=[e.hx,e.hy];
    const r=__k.run('occultist',e=>e.mode==='stay',90); Object.assign(o,{solid:r.solid,moved:r.moved,mode:r.mode,at:r.at,frames:r.frames});
    o.stair=r.tiles.some(t=>{const [x,y]=t.split(',').map(Number); return T.TOWN_MAP[y][x]==='/';});
    o.shut=r.tiles.some(t=>{const [x,y]=t.split(',').map(Number); return 'xX'.includes(T.TOWN_MAP[y][x]);});
    const S=w[0].spots.map(s=>s.x+','+s.y); o.onSpot=S.includes(r.at.join());
    o.talk=T.townKeeperAt(...r.at)===e;
    /* and home again when their time is up */
    e.t=0; const back=__k.run('occultist',e=>e.mode==='home',90); o.back=back.at; o.backSolid=back.solid;
    return o;});
  ok(walk.place===''&&walk.kind==='bench','a bench stands, and it is a waypoint',walk);
  ok(walk.moved>40&&walk.mode==='stay'&&walk.onSpot&&walk.talk,'the Nameless walks to the bench, a step at a time, and stands before it (and can be talked to there)',walk);
  ok(walk.stair&&!walk.shut&&walk.solid===0&&walk.backSolid===0,'down from the Rise by a stair, never through a shut plot, debris or anything solid',walk);
  ok(walk.back&&walk.back[0]===walk.home[0]&&walk.back[1]===walk.home[1],'and walks home again when their time is up',walk);

  /* 3. favourites: a bench near their favourites draws them more, holds them longer, and they say so */
  await setup(false);
  const fav=await p.evaluate(()=>{const T=__t, W=T.TWN, D=T.townData(), o={};
    const a=__k.spot('bench1',[27]), b=a&&(()=>{for(let c=a[0]+8;c<34;c++)if(T.townCanPlace('bench1',c,a[1])==='')return [c,a[1]]; for(let c=2;c<a[0]-6;c++)if(T.townCanPlace('bench1',c,a[1])==='')return [c,a[1]]; return null;})();
    o.a=a; o.b=b; if(!a||!b)return o;
    T.townPlace('bench1',...a); T.townPlace('bench1',...b);
    /* Agathe's: a Blind Saint by the first */
    let s=null; for(let dy=-2;dy<=2&&!s;dy++)for(let dx=-2;dx<=3&&!s;dx++)if(T.townCanPlace('statue5',a[0]+dx,a[1]+dy)==='')s=[a[0]+dx,a[1]+dy];
    o.statue=s&&T.townPlace('statue5',...s); W.build&&T.townBuildSet(false);
    const ws=T.keeperWaypoints(D), wa=ws.find(w=>w.key.includes('@'+a[0]+','+a[1]+'/')), wb=ws.find(w=>w.key.includes('@'+b[0]+','+b[1]+'/'));
    o.favA=wa&&wa.fav.bellringer; o.favB=wb&&wb.fav.bellringer; o.favOther=wa&&wa.fav.galvanist;
    W.wps=ws; const e=W.kst.bellringer; let na=0, nb=0;
    for(let i=0;i<2000;i++){const w=T.keeperPick(e); if(w===wa)na++; else if(w===wb)nb++;}
    o.na=na; o.nb=nb;
    /* send her to the first and see how long she stays, and what she says */
    W.wps=[wa]; __k.hold('bellringer'); const r=__k.run('bellringer',e=>e.mode==='stay',120); o.mode=r.mode; o.which=e.wpo&&e.wpo.key; o.t=e.t;
    o.says=T.keeperSays('bellringer'); o.line=T.KEEPER_FAV.bellringer.says;
    T.townTalk('bellringer'); o.card=document.querySelector('#mBody').textContent; T.closeModal();
    return o;});
  ok(fav.a&&fav.b&&fav.statue==='','two benches, and the Blind Saint by the first',fav);
  ok(fav.favA>=1&&fav.favB===0&&fav.favOther===0,'the first bench counts Agathe\'s favourite near it, and no one else\'s',fav);
  ok(fav.na>fav.nb*2,'she chooses the bench by her favourite far more often',fav);
  ok(fav.mode==='stay'&&fav.which&&fav.which.includes('@'+fav.a[0]+','+fav.a[1]+'/')&&fav.t>10*1.8-1,'by her favourite she lingers longer',fav);
  ok(fav.says===fav.line&&fav.card.includes(fav.line),'talking to her there, she speaks of it',fav);

  /* 4. the lit Hearth: they gather at its front; at a chore, never */
  await setup(false);
  const hr=await p.evaluate(()=>{const T=__t, W=T.TWN, D=T.townData(), o={};
    D.hearth={lv:3}; T.townArt(); T.townKeepers();
    const w=W.wps.find(q=>q.kind==='hearth'); o.n=w&&w.spots.length;
    __k.hold('whaler'); const r=__k.run('whaler',e=>e.mode==='stay',90); o.mode=r.mode; o.at=r.at;
    o.front=T.HEARTH.front.some(([x,y])=>x===r.at[0]&&y===r.at[1])||w.spots.some(s=>s.x===r.at[0]&&s.y===r.at[1]);
    o.look=W.kst.whaler.look; o.says=T.keeperSays('whaler')===T.KEEPER_FAV.whaler.hearth||T.keeperSays('whaler')===T.KEEPER_FAV.whaler.says;
    /* Voss at a chore stays at his work */
    T.townSetChore('galvanist'); T.closeModal(); T.keepersSettle(); const g=W.kst.galvanist; g.t=0; for(let i=0;i<200;i++)T.townFrame(1/20);
    o.work=[g.tx,g.ty]; o.wk=T.TOWN_STAND.galvanist.wk; o.gmode=g.mode;
    D.hearth={lv:0}; T.townArt(); T.townKeepers(); o.left=W.kst.whaler.dest;
    return o;});
  ok(hr.n>=2&&hr.mode==='stay'&&hr.front&&hr.look!=='d'&&hr.says,'at the lit Hearth a Keeper stands before it, facing it, and speaks of it',hr);
  ok(hr.work.join()===hr.wk.join()&&hr.gmode==='home','a Keeper at a chore stays at their work',hr);
  ok(hr.left==='home','the Hearth gone cold, whoever stood there goes home',hr);

  /* 5. the Lodge: a stove, and the Keeper goes in through the door and stands by it in the room */
  await setup(false);
  const lg=await p.evaluate(()=>{const T=__t, W=T.TWN, D=T.townData(), o={};
    D.lodge.built=true; D.lodge.furn.push({id:'stove',c:5,r:4,f:0}); T.townSave(); T.townArt(); T.townKeepers();
    const w=W.wps.find(q=>q.kind==='lodge'); o.kind=!!w; o.room=w&&w.room;
    __k.hold('galvanist'); const r=__k.run('galvanist',e=>e.away,120); const e=W.kst.galvanist; o.mode=e.mode; o.away=e.away;
    o.door=Math.hypot(e.x-T.LODGE_OUT.x,e.y-T.LODGE_OUT.y)<1.2; o.inSquare=W.crowd.some(q=>q===e&&!q.away);
    o.near=T.townKeeperAt(e.tx,e.ty)===e;
    T.townFrame(1/20);
    T.lodgeEnter(); const k=W.crowd.find(q=>q.k==='galvanist'); o.inside=!!k; o.spot=k&&[k.tx,k.ty];
    o.byStove=k&&Math.max(Math.abs(k.tx-5),Math.abs(k.ty-4))<=1; o.lookUp=k&&k.look;
    if(k){W.p.x=k.x; W.p.y=k.y+1; T.townFrame(1/20); o.offer=T.townNearAct()===k; o.label=document.querySelector('#townAct').textContent;
      T.townTalk('galvanist'); o.card=document.querySelector('#mTitle').textContent; T.closeModal();}
    T.lodgeLeave(); o.outside=W.crowd.some(q=>q.k==='galvanist'&&q.away);
    return o;});
  ok(lg.kind&&lg.room==='main','a stove in the Lodge is a waypoint',lg);
  ok(lg.away&&lg.mode==='in'&&lg.door&&!lg.near,'the Keeper walks to the Lodge\'s door and goes in: gone from the square',lg);
  ok(lg.inside&&lg.byStove&&lg.offer&&/Talk to/.test(lg.label)&&/Voss/.test(lg.card),'inside, they stand beside the stove, and you can talk to them',lg);
  ok(lg.outside,'back out, they are still in the Lodge',lg);

  /* 5b. a piece lifted in the Lodge keeps its tiles: the Keeper by the chair beside it does not step into its place, so it goes
     back where it was (CodeRabbit on #160) */
  await setup(false);
  const lf=await p.evaluate(()=>{const T=__t, W=T.TWN, D=T.townData();
    D.lodge.built=true; D.lodge.furn.push({id:'chair',c:4,r:4,f:0},{id:'chair',c:5,r:4,f:0}); T.townArt(); T.townKeepers();
    W.wps=W.wps.filter(q=>q.kind==='lodge').slice(0,1); __k.hold('galvanist'); __k.run('galvanist',e=>e.away,150);
    T.lodgeEnter(); const k0=W.crowd.find(q=>q.k==='galvanist'), at0=k0&&[k0.tx,k0.ty];
    T.townBuildSet(true); T.townBuildTap(5,4); const k1=W.crowd.find(q=>q.k==='galvanist');
    const o={at0,at1:k1&&[k1.tx,k1.ty],lifted:!!W.lift,back:T.bldFits('chair',5,4,null,null,0)}; T.townBuildSet(false); T.lodgeLeave(); return o;});
  ok(lf.at0&&lf.lifted&&JSON.stringify(lf.at0)===JSON.stringify(lf.at1)&&lf.back==='','lifting the chair beside a Keeper leaves them where they stand, and it can go back',lf);

  /* 6. lore chalk: Ambrose's note, once, saved, read on a tap; developer mode writes none */
  const ch=await p.evaluate(()=>{const T=__t, W=T.TWN, o={};
    localStorage.setItem('ll-meta',JSON.stringify({embers:50,unlocked:['kit_whaler','kit_occultist','kit_galvanist','kit_bellringer'],lastKit:'whaler'}));
    localStorage.removeItem('ll-town'); T.closeModal(); T.setDev(false); T.townReset(); T.townClose(); T.townOpen();
    const D=T.townData(); D.res={timber:999,iron:999,tallow:999,curios:99};
    const [px,py]=T.keeperPost('lamplighter',D); o.post=[px,py];
    o.none=!D.chalk.lamplighter;
    /* something not his near his post leaves nothing */
    let s=null; for(let r=1;r<=3&&!s;r++)for(let dy=-r;dy<=r&&!s;dy++)for(let dx=-r;dx<=r&&!s;dx++)if(T.townCanPlace('planter1',px+dx,py+dy)==='')s=[px+dx,py+dy];
    o.other=s&&T.townPlace('planter1',...s); o.still=!D.chalk.lamplighter;
    /* a Gibbet Lantern (his) */
    let l=null; for(let r=1;r<=3&&!l;r++)for(let dy=-r;dy<=r&&!l;dy++)for(let dx=-r;dx<=r&&!l;dx++)if(T.townCanPlace('post1',px+dx,py+dy)==='')l=[px+dx,py+dy];
    o.lamp=l&&T.townPlace('post1',...l); W.build&&T.townBuildSet(false);
    const q=D.chalk.lamplighter; o.note=q&&[q.x,q.y]; o.near=q&&Math.max(Math.abs(q.x-px),Math.abs(q.y-py))<=2; o.ground=q&&!T.townSolid(q.x,q.y)&&!T.townKept(q.x,q.y);
    o.saved=JSON.parse(localStorage.getItem('ll-town')).chalk; o.drawn=W.chalk.length;
    /* once: taking the lantern up and putting it back moves nothing */
    const d=D.decos.find(x=>x.id==='post1'); T.townTakeUp(d); T.townPlace('post1',...l); o.same=JSON.stringify(D.chalk.lamplighter)===JSON.stringify(q);
    /* a tap reads it */
    if(q){W.p.x=q.x+.5; W.p.y=q.y+.5+.6; T.townFrame(1/20); o.offer=T.townNearAct()===T.CHALK_ACT.lamplighter; o.label=document.querySelector('#townAct').textContent;
      T.townTapTile(q.x,q.y); o.card=document.querySelector('#mTitle').textContent+'|'+document.querySelector('#mBody').textContent; T.closeModal(); o.read=D.chalk.lamplighter.read;}
    /* a reload keeps it */
    T.townReset(); o.reload=JSON.stringify(T.townData().chalk.lamplighter);
    /* developer mode: a note left there is never written */
    const before=localStorage.getItem('ll-town'); T.setDev(true); T.townReset(); T.townOpen(); const DD=T.townData(); DD.res={timber:999,iron:999,tallow:999,curios:99};
    const [wx,wy]=T.keeperPost('bellringer',DD); let w=null; for(let r=1;r<=3&&!w;r++)for(let dy=-r;dy<=r&&!w;dy++)for(let dx=-r;dx<=r&&!w;dx++)if(T.townCanPlace('statue5',wx+dx,wy+dy)==='')w=[wx+dx,wy+dy];
    o.dev=w&&T.townPlace('statue5',...w); o.devNote=!!DD.chalk.bellringer; o.devSame=localStorage.getItem('ll-town')===before;
    T.setDev(false); T.townReset(); T.townClose();
    return o;});
  ok(ch.none&&ch.other===''&&ch.still,'a piece that is not his leaves no note',ch);
  ok(ch.lamp===''&&ch.note&&ch.near&&ch.ground,'his Gibbet Lantern by his post: Ambrose leaves a note on open ground beside it',ch);
  ok(ch.saved&&ch.saved.lamplighter&&ch.drawn===1&&ch.same,'it is saved, drawn, and left only once',ch);
  ok(ch.offer&&/Read the chalk/.test(ch.label)&&/Chalk/.test(ch.card)&&/Forty-one wicks/.test(ch.card)&&ch.read,'a tap reads it, in his words, and it is marked read',ch);
  ok(ch.reload&&JSON.parse(ch.reload).read===true,'a reload keeps it',ch.reload);
  ok(ch.dev===''&&ch.devNote&&ch.devSame,'developer mode leaves a note in its own copy and writes nothing',ch);

  /* 7. the cellar's tide */
  const td=await p.evaluate(()=>{const T=__t, o={};
    localStorage.removeItem('ll-town'); T.setDev(false); T.townReset();
    o.fix=[JSON.stringify(T.tideFix(null)),JSON.stringify(T.tideFix({lv:9,mark:1})),JSON.stringify(T.tideFix({lv:-2,mark:'x'}))];
    const base=T.tideBrine(); o.base=base;
    T.newRun('lamplighter',0,{seed:9}); T.defeat(); T.closeModal(); T.newRun('lamplighter',0,{seed:9}); T.defeat(); T.closeModal();
    o.two=JSON.stringify(T.townData().tide); o.brine=T.tideBrine(); o.kelp=T.tideKelp();
    o.saved=JSON.parse(localStorage.getItem('ll-town')).tide;
    /* the cellar's art: deeper brine, the wade deeper too, and kelp on a piece */
    const D=T.townData(); D.lodge.built=true; D.lodge.rooms=D.lodge.rooms||{}; D.lodge.rooms.cellar={built:true,floor:'flags',wall:'damp',furn:[{id:'chest',c:3,r:4,f:0}]}; T.townSave();
    T.townOpen(); T.lodgeEnter(); T.lodgeGo('cellar'); const A=T.townArt&&T.LODGE_ART||null; const L=T.lodgeArt();
    o.wade=L.wade&&L.wade.height; o.sig=/\|7\/7$/.test(L.sig);
    /* kelp sits only on the piece's own pixels, within its band */
    const [cv,c]=(()=>{const cv=document.createElement('canvas'); cv.width=20; cv.height=20; const c=cv.getContext('2d'); c.fillStyle='#4f3829'; c.fillRect(2,4,16,16); return [cv,c];})();
    const k=T.lodgeKelp(cv,7,11), d0=c.getImageData(0,0,20,20).data, d1=k.getContext('2d').getImageData(0,0,20,20).data; let ch=0, out=0, high=0;
    for(let i=0;i<400;i++){const same=d0[i*4]===d1[i*4]&&d0[i*4+1]===d1[i*4+1]&&d0[i*4+2]===d1[i*4+2]&&d0[i*4+3]===d1[i*4+3]; if(!same){ch++; if(!d0[i*4+3])out++; if(((i/20)|0)<13)high++;}}
    o.kelp1={ch,out,high,none:T.lodgeKelp(cv,0,11)===cv};
    T.lodgeLeave(); T.townClose();
    /* a win drains it, the kelp stays; the next win clears it */
    T.newRun('lamplighter',0,{seed:9}); T.victory(); T.closeModal(); o.win1=JSON.stringify(T.townData().tide); o.kelpAfter=T.tideKelp(); o.brineAfter=T.tideBrine();
    T.newRun('lamplighter',0,{seed:9}); T.victory(); T.closeModal(); o.win2=JSON.stringify(T.townData().tide);
    for(let i=0;i<9;i++){T.newRun('lamplighter',0,{seed:9}); T.defeat(); T.closeModal();} o.max=T.townData().tide.lv;
    T.clearSave&&T.clearSave(); localStorage.removeItem('ll-town'); T.townReset();
    return o;});
  ok(td.fix[0]==='{"lv":0,"mark":0}'&&td.fix[1]==='{"lv":4,"mark":4}'&&td.fix[2]==='{"lv":0,"mark":0}','ll-town.tide mends any shape',td.fix);
  ok(td.two==='{"lv":2,"mark":2}'&&td.brine===td.base+4&&td.kelp===td.base+4&&td.saved&&td.saved.lv===2,'two deaths raise the brine two steps, and it is saved',td);
  ok(td.wade===td.brine&&td.sig,'in the cellar the brine and your wade stand as deep',td);
  ok(td.kelp1.ch>4&&td.kelp1.out===0&&td.kelp1.high===0&&td.kelp1.none,'kelp and barnacles grow only on the piece, under the high-water line',td.kelp1);
  ok(td.win1==='{"lv":0,"mark":2}'&&td.brineAfter===td.base&&td.kelpAfter===td.base+4,'a win drains it, and what it reached keeps its kelp',td);
  ok(td.win2==='{"lv":0,"mark":0}','the win after clears the kelp',td.win2);
  ok(td.max===4,'it rises four steps at most',td.max);

  /* 8. a Keeper walking makes nothing per frame (Full): no canvas, no image data */
  await setup(false);
  const al=await p.evaluate(()=>{const T=__t, W=T.TWN, o={c:0,i:0};
    T.townPlace('bench1',...__k.spot('bench1',[27,26])); T.townData().hearth={lv:2}; T.townArt(); T.townKeepers(); W.build&&T.townBuildSet(false);
    const go=()=>{for(const k in W.kst){const e=W.kst[k]; e.t=0;} for(let i=0;i<200;i++){W.p.x=15+Math.sin(i/30)*4; T.townFrame(1/30);}};
    go(); for(const k in W.kst){const e=W.kst[k]; e.t=0;}
    const ce=document.createElement, P=CanvasRenderingContext2D.prototype, gi=P.getImageData, ci=P.createImageData;
    document.createElement=function(t){if(String(t).toLowerCase()==='canvas')o.c++; return ce.apply(this,arguments);};
    P.getImageData=function(){o.i++; return gi.apply(this,arguments);}; P.createImageData=function(){o.i++; return ci.apply(this,arguments);};
    let walked=0;
    try{for(let i=0;i<300;i++){W.p.x=15+Math.sin(i/30)*4; T.townFrame(1/30); walked+=W.crowd.filter(e=>e.moving).length;}}
    finally{document.createElement=ce; P.getImageData=gi; P.createImageData=ci;}
    o.walked=walked; return o;});
  ok(al.walked>50,'Keepers walked during the count',al);
  ok(al.c===0&&al.i===0,'a frame with Keepers walking makes no canvas and reads no pixels',al);

  /* 9. teach (rule 23): the tips and the rules line */
  const te=await p.evaluate(()=>{const T=__t; return {tips:['townwander','townchalk','lodgetide'].every(k=>T.TIPS&&T.TIPS[k]&&T.TIPS[k].where==='town'),
    rules:document.querySelector('#rulesList').innerHTML};});
  ok(te.tips!==false,'tips for the wandering, the chalk and the tide',te.tips);
  ok(/walks to a bench/.test(te.rules)&&/note in chalk/.test(te.rules)&&/cellar's brine rises/.test(te.rules),'the rules line names waypoints, the chalk and the tide');

  ok(!errs.length,'no page errors',errs);
  await b.close();
  if(fails.length){for(const f of fails)console.log('FAIL '+f); process.exit(1);} console.log('keepers4: all good');
})();
