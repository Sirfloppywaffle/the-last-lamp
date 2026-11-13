// The pixel board (pilot): Settings turns it on and keeps it; on the Cistern the floor is laid in pixel tiles from the path (every
// map of the floor: a channel square is water, a floor square is stone) and the five piloted creatures come from their sheets,
// lit, dark and as echoes; every other floor and every other creature is painted as before; turning it off puts the paint back.
const {chromium}=require('playwright');
const fails=[]; const ok=(c,m,d)=>{if(!c)fails.push(m+(d!==undefined?' '+JSON.stringify(d):''));};
(async()=>{
  const b=await chromium.launch(); const p=await b.newPage({viewport:{width:412,height:860},hasTouch:true});
  await p.goto('file://'+process.argv[2]); await p.waitForTimeout(600);
  const set=await p.evaluate(()=>{const T=__t, o={a0:T.boardArt}; document.getElementById('settingsBtn').click(); const bt=document.getElementById('artBtn'); o.l0=bt.textContent; bt.click(); o.l1=bt.textContent; o.a1=T.boardArt; o.st=localStorage.getItem('ll-board');
    [...document.querySelectorAll('#mActions button')].find(x=>/Close|Back/.test(x.textContent)).click(); return o;});
  ok(set.a0==='painted'&&/Painted/.test(set.l0)&&/Pixel \(pilot\)/.test(set.l1)&&set.a1==='pixel'&&/pixel/.test(set.st||''),'Settings turns the pixel board on and keeps it',set);
  for(const mv of [0,1,2]){
    const r=await p.evaluate((mv)=>{const T=__t; T.setMapV(mv); T.newRun('lamplighter',0,{seed:9}); T.run.floor=0; T.beginFloor(null); T.setP(false); T.F.phase='wave'; T.F.queue=[{t:1e9,type:'crawler',gate:0}];
      const o={pix:T.pixOn()}, cv=T.floorPx.canvas, g=T.floorPx, s=cv.width/T.COLS;
      const at=(x,y)=>{const d=g.getImageData(Math.round((x+.5)*s),Math.round((y+.5)*s),1,1).data; return [d[0],d[1],d[2]];};
      /* a square of the channel well away from its banks, and a square of floor with floor all round it */
      const P=T.F.pathTiles, isP=(x,y)=>P.has(x+','+y); let water=null, stone=null;
      for(let y=1;y<T.ROWS-1;y++)for(let x=1;x<T.COLS-1;x++){const n=[[1,0],[-1,0],[0,1],[0,-1]].filter(([a,c])=>isP(x+a,y+c)).length;
        if(isP(x,y)&&n>=2&&!water&&Math.hypot(x+.5-T.F.lx,y+.5-T.F.ly)>2)water=at(x,y);
        if(!isP(x,y)&&n===0&&!stone&&!isP(x+1,y+1)&&!isP(x-1,y-1)&&!isP(x+1,y-1)&&!isP(x-1,y+1)&&Math.hypot(x+.5-T.F.lx,y+.5-T.F.ly)>2)stone=at(x,y);}
      o.water=water; o.stone=stone; o.n=T.PIX.water?T.PIX.water.length/4:0; o.paths=P.size;
      const kinds=['crawler','skitter','gnasher','watcher','shade']; o.px=kinds.every(k=>T.artOf(k).pix); o.other=!T.artOf('wretch').pix&&!T.artOf('boss').pix;
      const L=T.F.paths[0]; kinds.concat(['wretch']).forEach((k,i)=>{const e=T.spawnFoe(k,0,L.len*(.1+.13*i)); e.hp=e.max=1e6;});
      for(let i=0;i<40;i++){T.update(1/30); T.render();} o.sprites=T.nSprites;
      return o;},mv);
    ok(r.pix,'map '+mv+': the Cistern is a pixel floor',r);
    ok(r.water&&r.water[2]>r.water[0]&&r.water[0]<60,'map '+mv+': a square of the channel is dark water',r.water);
    ok(r.stone&&r.stone[0]>r.water[0]+8&&Math.abs(r.stone[0]-r.stone[2])<60,'map '+mv+': a square of the floor is stone',r.stone);
    ok(r.n===r.paths&&r.n>10,'map '+mv+': the water under the lamplight is the path, square for square',[r.n,r.paths]);
    ok(r.px&&r.other,'map '+mv+': the five piloted creatures come from their sheets, the rest are painted',r);
    ok(r.sprites>0,'map '+mv+': they draw, lit and dark',r.sprites);
  }
  const rest=await p.evaluate(()=>{const T=__t, o={}; T.setMapV(0); T.newRun('lamplighter',0,{seed:9}); T.run.floor=1; T.beginFloor(null); o.ossuary=T.pixOn(); o.art=!!T.artOf('gnasher').pix;
    T.run.floor=0; T.beginFloor(null); T.boardArtSet('painted'); o.off=T.pixOn(); o.artOff=!!T.artOf('gnasher').pix; o.st=localStorage.getItem('ll-board'); T.setP(false); for(let i=0;i<5;i++)T.render(); return o;});
  ok(!rest.ossuary&&!rest.art,'every other floor is painted, creatures and all',rest);
  ok(!rest.off&&!rest.artOff&&/painted/.test(rest.st||''),'turned off, the paint is back',rest);
  /* the five kit lamps (pixel stair step 1): on a pixel Cistern the board's lamp is drawn from its kit's sheet, each unlike the others
     and unlike the paint; icons and the descent map (no board flag) stay painted; another floor, or the painted board, is untouched;
     the Bellringer's bell swings as it tolls; under Reduce Motion the flame holds one frame */
  const lampProbe=()=>{const T=__t, cv=document.createElement('canvas'); cv.width=cv.height=120; const c=cv.getContext('2d');
    window.__lampImg=(k,board,tm)=>{c.setTransform(1,0,0,1,0,0); c.clearRect(0,0,120,120); c.setTransform(60,0,0,60,60,72); T.drawLamp(c,0,0,tm,1,k,board);
      c.setTransform(1,0,0,1,0,0); const d=c.getImageData(0,0,120,120).data; let h=0, n=0; for(let i=0;i<d.length;i+=4){h=(h*31+d[i]+d[i+1]*3+d[i+2]*7+d[i+3]*11)>>>0; if(d[i+3])n++;} return h+':'+n;};};
  const kits=['lamplighter','whaler','occultist','galvanist','bellringer'];
  const lamps=await p.evaluate(([kits,probe])=>{eval('('+probe+')')(); const T=__t, o={px:{},pt:{},ready:{},anim:{}}; T.setMapV(0); T.boardArtSet('pixel');
    for(const k of kits){T.newRun(k,0,{seed:9}); T.run.floor=0; T.beginFloor(null); T.setP(true); T.F.lampRing=0; o.on=T.pixOn(); o.ready[k]=T.LAMP_PX[k].ready;
      o.px[k]=__lampImg(k,true,1); o.pt[k]=__lampImg(k,false,1); o.anim[k]=new Set([.1,.3,.5,.7,.9].map(tm=>__lampImg(k,true,tm))).size;
      for(let i=0;i<5;i++)T.render();}
    T.F.lampRing=1; o.toll=__lampImg('bellringer',true,1.2); T.F.lampRing=0;
    T.newRun('galvanist',0,{seed:9}); T.run.floor=1; T.beginFloor(null); o.oss=T.pixOn(); o.ossSame=__lampImg('galvanist',true,1)===__lampImg('galvanist',false,1);
    T.run.floor=0; T.beginFloor(null); T.boardArtSet('painted'); o.offSame=__lampImg('galvanist',true,1)===__lampImg('galvanist',false,1); return o;},[kits,lampProbe.toString()]);
  ok(lamps.on&&kits.every(k=>lamps.ready[k]),'the five kit lamps load',lamps.ready);
  ok(new Set(kits.map(k=>lamps.px[k])).size===5,'on a pixel Cistern each kit draws its own lamp',lamps.px);
  ok(kits.every(k=>lamps.px[k]!==lamps.pt[k]),'the board\'s lamp is the sheet, not the paint; a call without the board flag is painted',lamps);
  ok(kits.every(k=>lamps.anim[k]>1),'every lamp moves: the flame flickers',lamps.anim);
  ok(lamps.toll!==lamps.px.bellringer,'the Bellringer\'s bell swings and its crack burns as it tolls',lamps.toll);
  ok(!lamps.oss&&lamps.ossSame,'another floor draws the painted lamp',lamps);
  ok(lamps.offSame,'with the painted board chosen, the lamp is painted',lamps);
  {const p2=await b.newPage({viewport:{width:412,height:860},reducedMotion:'reduce'}); await p2.goto('file://'+process.argv[2]); await p2.waitForTimeout(600);
    const rm=await p2.evaluate(([kits,probe])=>{eval('('+probe+')')(); const T=__t, o={}; T.boardArtSet('pixel');
      for(const k of kits){T.newRun(k,0,{seed:9}); T.run.floor=0; T.beginFloor(null); T.setP(true); T.F.lampRing=1; o[k]=new Set([.1,.3,.5,.7,.9].map(tm=>__lampImg(k,true,tm))).size;} return o;},[kits,lampProbe.toString()]);
    ok(kits.every(k=>rm[k]===1),'under Reduce Motion each lamp holds one frame, and the bell does not swing',rm);
    await p2.close();}
  /* the base wards (pixel stair step 2): on a pixel Cistern each draws from its sheet, unlike its paint; cut off from the light it
     holds still, and the effigy, censer and coil show their dark frame; the trap snaps shut; a capstone lays its ring; every candle is a
     kit's own and stays painted (steps 3 and 4) while every kit's harpoon is the pixel ballista; tray icons, other floors and the
     painted board are untouched; under Reduce Motion each holds one frame */
  const wardProbe=()=>{const T=__t;
    /* a fresh canvas each time: the painted wards leave line caps and joins behind them */
    window.__wardImg=(type,o,tm,icon)=>{const cv=document.createElement('canvas'); cv.width=cv.height=120; const c=cv.getContext('2d'), t=Object.assign({kind:'ward',type,x:0,y:0,c:0,r:0,ang:-.7,dur:1,max:1,ring:0,br:{},cd:0,snap:0,ping:0,recoil:0},o||{});
      c.setTransform(1,0,0,1,0,0); c.clearRect(0,0,120,120); c.setTransform(90,0,0,90,60,70); T.drawWard(c,t,tm,!!icon);
      c.setTransform(1,0,0,1,0,0); const d=c.getImageData(0,0,120,120).data; let h=0, n=0; for(let i=0;i<d.length;i+=4){h=(h*31+d[i]+d[i+1]*3+d[i+2]*7+d[i+3]*11)>>>0; if(d[i+3])n++;} return h+':'+n;};};
  const W10=['harpoon','salt','chime','trap','tithe','effigy','censer','coil','lance'], LOOPS=['chime','tithe','effigy','censer','coil'], DARKS=['effigy','censer','coil'], KITS5=['lamplighter','whaler','occultist','galvanist','bellringer'];
  const wards=await p.evaluate(([W10,LOOPS,DARKS,KITS5,probe])=>{eval('('+probe+')')(); const T=__t, o={ready:{},px:{},pt:{},icon:{},dark:{},darkStill:{},anim:{}}; T.setMapV(0);
    const at=(art,kit,floor)=>{T.boardArtSet(art); T.newRun(kit,0,{seed:9}); T.run.floor=floor; T.beginFloor(null); T.setP(true);};
    at('painted','bellringer',0); for(const w of W10){o.pt[w]=__wardImg(w,null,1); o.icon[w]=__wardImg(w,null,1,true);}
    o.ptCandle={}; for(const k of KITS5)o.ptCandle[k]=__wardImg('candle',{kit:k},1); o.ptHarpLamp=__wardImg('harpoon',{kit:'lamplighter'},1);
    at('pixel','bellringer',0); o.on=T.pixOn(); o.cap=T.WARD_CAP.ready;
    for(const w of W10){o.ready[w]=T.WARD_PX[w].ready; o.px[w]=__wardImg(w,null,1); o.icon[w]=o.icon[w]===__wardImg(w,null,1,true);
      o.dark[w]=__wardImg(w,{dark:true},1); o.darkStill[w]=new Set([.1,.3,.5,.7,.9].map(tm=>__wardImg(w,{dark:true},tm))).size;
      o.anim[w]=new Set([.1,.3,.5,.7,.9,1.3,1.7].map(tm=>__wardImg(w,null,tm))).size;}
    o.capOn=__wardImg('chime',{br:{a:3}},1)!==__wardImg('chime',{br:{a:2}},1);
    o.sprung=__wardImg('trap',{cd:2},1)!==o.px.trap; o.snap=__wardImg('trap',{cd:2,snap:.3},1)!==__wardImg('trap',{cd:2},1);
    o.turn=__wardImg('harpoon',{ang:1.2},1)!==o.px.harpoon&&__wardImg('lance',{ang:1.2},1)!==o.px.lance; o.kick=__wardImg('lance',{recoil:.3},1)!==o.px.lance;
    o.fade=__wardImg('salt',{dur:.3},1)!==o.px.salt; o.ring=__wardImg('chime',{ring:.3},1)!==o.px.chime;
    o.candles=__wardImg('candle',{kit:'bellringer'},1)===o.ptCandle.bellringer&&['occultist','galvanist'].every(k=>__wardImg('candle',{kit:k},1)!==o.ptCandle[k]); o.lampHarp=__wardImg('harpoon',{kit:'lamplighter'},1)!==o.ptHarpLamp;
    /* all nine on the board through a stretch of a wave, near the lamp, salt and trap on the channel */
    for(const type of W10){const it={kind:'ward',type}; let best=null,bd=1e9;
      for(let r=0;r<T.ROWS;r++)for(let c=0;c<T.COLS;c++){if(T.placeProblem(it,c,r)||T.F.towers.some(t=>t.c===c&&t.r===r))continue; const d=Math.hypot(c+.5-T.F.lx,r+.5-T.F.ly); if(d>1.2&&d<bd){bd=d; best=[c,r];}}
      if(best){T.run.ess=9999; T.setSel(it); T.tryPlace(best[0],best[1]); T.setSel(null);}}
    o.placed=W10.filter(w=>T.F.towers.some(t=>t.type===w)).length;
    T.setP(false); T.F.phase='wave'; T.F.queue=[{t:0,type:'crawler',gate:0},{t:.5,type:'crawler',gate:0}];
    for(let i=0;i<120;i++){T.update(1/30); T.render();}
    T.F.towers.length=0; for(let i=0;i<5;i++)T.render();
    at('pixel','bellringer',1); o.oss=T.pixOn(); o.ossSame=W10.every(w=>__wardImg(w,null,1)===o.pt[w]);
    at('painted','bellringer',0); o.offSame=W10.every(w=>__wardImg(w,null,1)===o.pt[w]); return o;},[W10,LOOPS,DARKS,KITS5,wardProbe.toString()]);
  ok(wards.on&&wards.cap&&W10.every(w=>wards.ready[w]),'the nine base wards load',wards.ready);
  ok(W10.every(w=>wards.px[w]!==wards.pt[w]),'on a pixel Cistern each base ward draws from its sheet, not its paint',{px:wards.px,pt:wards.pt});
  ok(W10.every(w=>wards.icon[w]),'the tray\'s icons stay painted',wards.icon);
  ok(DARKS.every(w=>wards.dark[w]!==wards.px[w]),'cut off from the light, the effigy, censer and coil go out',wards.dark);
  ok(W10.every(w=>wards.darkStill[w]===1),'a dark ward holds still',wards.darkStill);
  ok(LOOPS.every(w=>wards.anim[w]>1),'the chime, tithe, effigy, censer and coil move',wards.anim);
  ok(wards.capOn,'a capstone lays its ring under the ward',wards.capOn);
  ok(wards.sprung&&wards.snap,'the trap shows sprung, and snaps',wards);
  ok(wards.turn&&wards.kick,'the harpoon and the whaling gun turn to aim; the gun kicks back',wards);
  ok(wards.fade&&wards.ring,'salt fades as it dissolves; the chime rings',wards);
  ok(wards.candles&&wards.lampHarp,'the Corpse Candle and the Arc Lamp are pixel (step 4); a plain candle, which no kit builds, stays painted; every harpoon is the pixel ballista',wards);
  ok(!wards.oss&&wards.ossSame,'another floor draws the painted wards',wards);
  ok(wards.placed===9,'all nine stand on a pixel Cistern through a wave',wards.placed);
  ok(wards.offSame,'with the painted board chosen, the wards are painted',wards.offSame);
  {const p2=await b.newPage({viewport:{width:412,height:860},reducedMotion:'reduce'}); await p2.goto('file://'+process.argv[2]); await p2.waitForTimeout(600);
    const rm=await p2.evaluate(([LOOPS,probe])=>{eval('('+probe+')')(); const T=__t, o={}; T.boardArtSet('pixel'); T.newRun('bellringer',0,{seed:9}); T.run.floor=0; T.beginFloor(null); T.setP(true);
      for(const w of LOOPS)o[w]=new Set([.1,.3,.5,.7,.9,1.3,1.7].map(tm=>__wardImg(w,null,tm))).size;
      for(const [n,w,x] of [['sig','candle',{kit:'lamplighter'}],['blub','candle',{kit:'whaler'}],['pot','trypot',{meas:2}],['mirror','mirror',{}]])o[n]=new Set([.1,.3,.5,.7,.9].map(tm=>__wardImg(w,x,tm))).size;
      return o;},[LOOPS,wardProbe.toString()]);
    ok(Object.values(rm).every(n=>n===1),'under Reduce Motion each ward holds one frame, the kit wards too',rm);
    await p2.close();}
  /* the Lamplighter's and the Whaler's own wards and marks (pixel stair step 3): the Signal Candle (redder with the Burner) and the
     Blubber Lamp from their sheets, snuffed when cut off; each kit's harpoon with its own bolt head and foot; the Signal Mirror turning, its
     glass gone dark, its ring dimmed in a wave; the Try-pot's fire, its oil by the measure; and on the board the beam, the threads, the
     line, the net, the tangle and a Kindled creature's flames in art pixels, all without a hitch through a wave */
  const kitw=await p.evaluate(([probe])=>{eval('('+probe+')')(); const T=__t, o={}; T.setMapV(0);
    const at=(art,kit)=>{T.boardArtSet(art); T.newRun(kit,0,{seed:9}); T.run.floor=0; T.beginFloor(null); T.setP(true); T.F.phase='build';};
    const cases={sig:['candle',{kit:'lamplighter'}],blub:['candle',{kit:'whaler'}],mirror:['mirror',{rot:.4}],pot:['trypot',{meas:2}],
      hLamp:['harpoon',{kit:'lamplighter'}],hWhale:['harpoon',{kit:'whaler'}],hOcc:['harpoon',{kit:'occultist'}]};
    at('painted','lamplighter'); const pt={}; for(const k in cases)pt[k]=__wardImg(cases[k][0],cases[k][1],1);
    at('pixel','lamplighter'); o.ready=['candle:lamplighter','candle:whaler','mirror','trypot'].every(k=>T.WARD_PX[k].ready)&&T.MARK_PX.net.ready&&T.MARK_PX.tangle.ready;
    const px={}; for(const k in cases)px[k]=__wardImg(cases[k][0],cases[k][1],1);
    o.fromSheet=Object.keys(cases).filter(k=>px[k]===pt[k]);
    o.harps=new Set([px.hLamp,px.hWhale,px.hOcc]).size;
    const D=(k,extra)=>__wardImg(cases[k][0],Object.assign({},cases[k][1],extra),1);
    o.dark={sig:D('sig',{dark:true})!==px.sig,blub:D('blub',{dark:true})!==px.blub,mirror:D('mirror',{dark:true})!==px.mirror,pot:D('pot',{dark:true})!==px.pot};
    o.darkStill=['sig','blub','pot'].map(k=>new Set([.1,.3,.5,.7].map(tm=>__wardImg(cases[k][0],Object.assign({dark:true},cases[k][1]),tm))).size);
    o.anim=['sig','blub','pot'].map(k=>new Set([.1,.3,.5,.7,.9].map(tm=>__wardImg(cases[k][0],cases[k][1],tm))).size);
    o.burner=D('sig',{br:{ember:1}})!==px.sig;
    o.turn=D('mirror',{rot:1.3})!==px.mirror; T.F.phase='wave'; o.lock=D('mirror',{})!==px.mirror; T.F.phase='build';
    o.oil=new Set([0,1,2,3,4].map(m=>D('pot',{meas:m}))).size;
    /* the marks, drawn on a probe canvas */
    const cv=document.createElement('canvas'); cv.width=cv.height=160; const c=cv.getContext('2d');
    const ink=fn=>{c.setTransform(1,0,0,1,0,0); c.clearRect(0,0,160,160); c.setTransform(40,0,0,40,80,80); const r=fn(); c.setTransform(1,0,0,1,0,0); const d=c.getImageData(0,0,160,160).data; let n=0; for(let i=3;i<d.length;i+=4)if(d[i])n++; return [r,n];};
    o.net=ink(()=>T.pixNet(c,{x:0,y:0,r:1.6},.5)); o.tangle=ink(()=>T.pixTangle(c,0,0,.3,.9)); o.rope=ink(()=>{T.pixRope(c,-1,-1,0,.3,1,1,true); return true;}); o.kindle=ink(()=>{T.pixKindle(c,0,0,.3,1); return true;});
    /* on the board through a wave: a beam, threads (one burning), a line, a net and a tangle and a Kindled creature */
    T.setP(false); T.F.phase='wave'; T.F.queue=[{t:1e9,type:'crawler',gate:0}];
    const L=T.F.paths[0], e=T.spawnFoe('crawler',0,L.len*.3); e.hp=e.max=1e6; e.kindleT=5; e.tangleT=2;
    const A={x:T.F.lx+1,y:T.F.ly,br:{signal:3}}, B={x:T.F.lx+1,y:T.F.ly+3,br:{}};
    let errs=0;
    /* update() works the beams and threads out afresh, so they are laid after it, as a mirror and two Signal Candles would lay them */
    const lay=()=>{T.F.beams=[{x0:T.F.lx+.5,y0:T.F.ly,x1:T.F.lx+4,y1:T.F.ly+2,ux:.87,uy:.5,bounce:0}]; T.F.links=[[A,B]]; T.F.threads=[[A,B]];};
    for(let i=0;i<30;i++){
      if(i===2)T.F.fx.push({k:'net',x:e.x,y:e.y,r:1.6,t:0,dur:1.1}); if(i===3)T.F.fx.push({k:'hline',x:A.x,y:A.y,e,t:0,dur:.5});
      try{T.update(1/30); lay(); T.render();}catch(err){errs++; o.err=String(err);}}
    o.errs=errs; o.beam=!!T.BEAM.cv&&T.BEAM.cv.width===T.COLS*32; const cvB=T.BEAM.cv, k0=T.BEAM.k.slice(); lay(); T.render(); o.beamCached=T.BEAM.cv===cvB&&T.BEAM.k.length===9&&T.BEAM.k.every((v,i)=>v===k0[i]);
    return o;},[wardProbe.toString()]);
  ok(kitw.ready,'the kit wards and marks load',kitw);
  ok(!kitw.fromSheet.length,'on a pixel Cistern the Signal Candle, Blubber Lamp, Signal Mirror, Try-pot and every kit harpoon draw from their sheets, not the paint',kitw.fromSheet);
  ok(kitw.harps===3,'the Lamplighter\'s, the Whaler\'s and the Occultist\'s harpoons each carry their own bolt head and foot',kitw.harps);
  ok(Object.values(kitw.dark).every(Boolean)&&kitw.darkStill.every(n=>n===1),'cut off from the light, each goes dark and holds still',kitw);
  ok(kitw.anim.every(n=>n>1),'the two kit candles flicker and the Try-pot\'s fire licks',kitw.anim);
  ok(kitw.burner,'the Burner turns the Signal Candle\'s flame red',kitw.burner);
  ok(kitw.turn&&kitw.lock,'the Signal Mirror turns, and its ring dims while a wave holds it',kitw);
  ok(kitw.oil===5,'the Try-pot shows its oil by the measure',kitw.oil);
  ok(kitw.net[0]&&kitw.net[1]>200&&kitw.tangle[0]&&kitw.tangle[1]>50&&kitw.rope[1]>30&&kitw.kindle[1]>4,'the net, the tangle, the line and Kindle\'s flames draw in art pixels',kitw);
  ok(!kitw.errs&&kitw.beam&&kitw.beamCached,'beam, threads, line, net, tangle and flames on the board through a wave; the beam is built once and reused',kitw);

  /* the Occultist's, the Galvanist's and the Bellringer's own wards and marks (pixel stair step 4): the Corpse Candle and the Arc Lamp
     (grey while it flickers out), the Pylon, the Risen, the Grasping Dead, the Tuning Fork, the Tocsin, the Bell Wire and each kit's
     harpoon from their sheets, unlike the paint; dark when cut off and still; what each does when it acts; and on the board the bones,
     the grid (rods, the Anchor and its cage, wires, arcs, Overload, Static, a pylon frying), a caught specimen's cage, the path she
     hears, the hums, tolls, cracks, shells and the beat in art pixels, through a wave for each kit with no hitch */
  const k4=await p.evaluate(([probe])=>{eval('('+probe+')')(); const T=__t, o={}; T.setMapV(0);
    const at=(art,kit)=>{T.boardArtSet(art); T.newRun(kit,0,{seed:9}); T.run.floor=0; T.beginFloor(null); T.setP(true); T.F.phase='build';};
    const cases={corpse:['candle',{kit:'occultist'}],arc:['candle',{kit:'galvanist'}],pylon:['pylon',{}],risen:['risen',{}],grasp:['grasp',{grips:6}],
      fork:['fork',{}],tocsin:['tocsin',{ammo:1}],wire:['bellwire',{wireAng:0}],hOcc:['harpoon',{kit:'occultist'}],hGal:['harpoon',{kit:'galvanist'}],hBell:['harpoon',{kit:'bellringer'}]};
    at('painted','galvanist'); const pt={}; for(const k in cases)pt[k]=__wardImg(cases[k][0],cases[k][1],1);
    at('pixel','galvanist'); o.ready=['candle:occultist','candle:galvanist','pylon','risen','grasp','fork','tocsin','tocsin:bell','galv:rod','galv:anchor','occ:bones'].filter(k=>!T.WARD_PX[k].ready);
    const px={}; for(const k in cases)px[k]=__wardImg(cases[k][0],cases[k][1],1);
    o.fromPaint=Object.keys(cases).filter(k=>px[k]===pt[k]);
    o.harps=new Set(['lamplighter','whaler','occultist','galvanist','bellringer'].map(k=>__wardImg('harpoon',{kit:k},1))).size;
    const D=(k,extra,tm)=>__wardImg(cases[k][0],Object.assign({},cases[k][1],extra),tm===undefined?1:tm);
    o.dark=['corpse','arc','pylon','fork'].filter(k=>D(k,{dark:true})===px[k]);
    o.darkStill=['corpse','arc','pylon','fork'].filter(k=>new Set([.1,.3,.5,.7].map(tm=>D(k,{dark:true},tm))).size!==1);
    o.anim=['corpse','arc','risen','grasp','pylon'].filter(k=>new Set([.1,.3,.5,.7,.9,1.3,1.7].map(tm=>D(k,{},tm))).size<2);
    /* the Arc Lamp in a wave: at a moment it flickers out its bulb is grey, at another it burns */
    T.F.phase='wave'; const arcT={kind:'ward',type:'candle',kit:'galvanist',id:77,br:{}}; let off=null, on=null;
    for(let i=0;i<400&&(off===null||on===null);i++){T.F.time=i*.05; if(T.arcOff(arcT)){if(off===null)off=D('arc',{id:77});} else if(on===null)on=D('arc',{id:77});}
    o.arcFlicker=off!==null&&on!==null&&off===D('arc',{dark:true})&&on!==off; T.F.phase='build';
    o.acts={fork:D('fork',{ring:.3})!==px.fork, tocsinTurn:D('tocsin',{ang:0})!==px.tocsin, tocsinKick:D('tocsin',{recoil:.4})!==px.tocsin, reload:D('tocsin',{ammo:0,cd:1})!==px.tocsin,
      clench:D('grasp',{snap:.3})!==px.grasp, grips:D('grasp',{grips:2})!==px.grasp, lunge:D('risen',{snap:.3,ang:0})!==px.risen,
      wireRing:D('wire',{ring:.4})!==px.wire, wireCut:D('wire',{cut:true})!==px.wire, clapper:D('hBell',{recoil:.3},1.01)!==px.hBell};
    /* the marks on a probe canvas */
    const cv=document.createElement('canvas'); cv.width=cv.height=160; const c=cv.getContext('2d');
    const ink=fn=>{c.setTransform(1,0,0,1,0,0); c.clearRect(0,0,160,160); c.setTransform(40,0,0,40,80,80); c.fillStyle='#fff'; fn(); c.setTransform(1,0,0,1,0,0); const d=c.getImageData(0,0,160,160).data; let n=0; for(let i=3;i<d.length;i+=4)if(d[i])n++; return n;};
    o.ink={seg:ink(()=>T.pixSeg(c,-1,-1,1,1,1,0,3)),arc:ink(()=>T.pixArc(c,0,0,1,.6,0,6.3,2,2,1)),quad:ink(()=>T.pixQuad(c,-1,0,0,1,1,0,1)),disc:ink(()=>T.pixDisc(c,0,0,.5)),bolt:ink(()=>T.pixBolt(c,-1,0,1,0,3,.2,1))};
    /* each kit on the board through a wave, every mark it lays */
    o.errs=[]; o.drawn={};
    for(const kit of ['occultist','galvanist','bellringer']){at('pixel',kit); const F=T.F, L=F.paths[0]; T.setP(false); F.phase='wave'; F.queue=[{t:1e9,type:'crawler',gate:0}];
      const free=[]; for(let r=0;r<T.ROWS;r++)for(let cc=0;cc<T.COLS;cc++){const d=Math.hypot(cc+.5-F.lx,r+.5-F.ly); if(d>1&&d<3.5&&!F.pathTiles.has(cc+','+r))free.push([d,cc,r]);} free.sort((a,b)=>a[0]-b[0]);
      let id=500; const put=(type,x)=>{const q=free.shift(); F.towers.push(Object.assign({kind:'ward',type,id:++id,c:q[1],r:q[2],x:q[1]+.5,y:q[2]+.5,br:{},tgt:'first',invested:0,fresh:0,cd:0,ang:-.7,ring:0,echo:0},x||{}));};
      const e=T.spawnFoe('crawler',0,L.len*.5); e.hp=e.max=1e6;
      if(kit==='occultist'){put('candle'); put('risen'); put('harpoon');
        const P=[...F.pathTiles].slice(0,3); P.forEach((k,i)=>{const [cx,cy]=k.split(',').map(Number); F.bodies.set(k,{x:cx+.5,y:cy+.5,n:i+1,ref:[0,0],typed:i?null:'gnasher'});});
        const [gx,gy]=[...F.pathTiles][5].split(',').map(Number); F.towers.push({kind:'ward',type:'grasp',id:++id,c:gx,r:gy,x:gx+.5,y:gy+.5,br:{},grips:6,cd:0,ang:0,ring:0,echo:0});}
      if(kit==='galvanist'){put('candle'); put('pylon'); put('pylon'); put('pylon'); put('harpoon'); F.rods.push({id:-1,x:F.lx+1,y:F.ly+1,t:3,max:3});}
      if(kit==='bellringer'){put('fork'); put('fork'); put('tocsin',{ammo:1}); put('harpoon'); const [wx,wy]=[...F.pathTiles][4].split(',').map(Number); F.towers.push({kind:'ward',type:'bellwire',id:++id,c:wx,r:wy,x:wx+.5,y:wy+.5,br:{},cd:0,ang:0,ring:0,echo:0});
        e.cracks=2; F.shots.push({k:'tocsin',sx:F.lx+1,sy:F.ly,tx:F.lx-2,ty:F.ly+1,t:.2,dur:2,r:.8});}
      for(let i=0;i<45;i++){
        if(kit==='galvanist'&&i===5){F.anchor={x:F.lx-1,y:F.ly+1,t:6,max:8}; F.souls.push({x:F.lx+1.5,y:F.ly-1,type:'crawler',t:5,max:6,cage:true});
          F.fx.push({k:'arc',pts:[[F.lx,F.ly],[F.lx+1,F.ly+1],[F.lx+2,F.ly]],t:0,dur:.5,seed:3,big:true},{k:'surge',segs:[[F.lx,F.ly,F.lx+2,F.ly+1]],t:0,dur:.7,seed:4},{k:'static',x:F.lx,y:F.ly,r:2,t:0,dur:.6,seed:5},{k:'fry',x:F.lx+1,y:F.ly,t:0,dur:1.1});}
        if(kit==='bellringer'&&i%15===2)F.tolls.push({id:i,x:F.lx,y:F.ly,r:0,max:7,spd:3,hear:1,veil:true,stun:0,relay:false,big:i>20,gold:i>30,echo:false,cracks:0,hit:new Set()});
        try{T.update(1/30); if(kit==='bellringer')e.cracks=2; T.render();}catch(err){o.errs.push(kit+': '+String(err));}}
      if(kit==='occultist')o.drawn.bones=T.pixBodies(T.F.time);
      if(kit==='galvanist'){F.anchor={x:F.lx-1,y:F.ly+1,t:6,max:8}; o.drawn.grid=T.pixGrid(T.F.time)&&!!T.F.grid;}
      T.setP(true);}
    return o;},[wardProbe.toString()]);
  ok(!k4.ready.length,'the step 4 sheets load',k4.ready);
  ok(!k4.fromPaint.length,'on a pixel Cistern the Corpse Candle, Arc Lamp, Pylon, Risen, Grasping Dead, Tuning Fork, Tocsin, Bell Wire and the three kits\' harpoons draw from their sheets, not the paint',k4.fromPaint);
  ok(k4.harps===5,'each of the five kits\' harpoons carries its own bolt head and foot',k4.harps);
  ok(!k4.dark.length&&!k4.darkStill.length,'cut off, the Corpse Candle snuffs, the Arc Lamp and Pylon go cold, the fork goes dull, and each holds still',k4);
  ok(!k4.anim.length,'the Corpse Candle, the Arc Lamp, the Risen, the Grasping Dead and the Pylon move',k4.anim);
  ok(k4.arcFlicker,'in a wave the Arc Lamp\'s bulb goes grey while it flickers out',k4.arcFlicker);
  ok(Object.values(k4.acts).every(Boolean),'the fork rings, the Tocsin turns, kicks and reloads, the arms close and thin out, the Risen lunges, the Bell Wire rings and hangs cut, the Clapper\'s bell swings',k4.acts);
  ok(Object.values(k4.ink).every(n=>n>10),'lines, arcs, curves, discs and bolts draw in art pixels',k4.ink);
  ok(!k4.errs.length&&k4.drawn.bones&&k4.drawn.grid,'each kit\'s marks on the board through a wave: bones, grid, cage, Anchor, arcs, surge, static, fry, the path she hears, hums, tolls, cracks, shells',k4);
  {const p2=await b.newPage({viewport:{width:412,height:860},reducedMotion:'reduce'}); await p2.goto('file://'+process.argv[2]); await p2.waitForTimeout(600);
    const rm=await p2.evaluate(([probe])=>{eval('('+probe+')')(); const T=__t, o={}; T.boardArtSet('pixel'); T.newRun('galvanist',0,{seed:9}); T.run.floor=0; T.beginFloor(null); T.setP(true);
      for(const [n,w,x] of [['corpse','candle',{kit:'occultist'}],['arc','candle',{kit:'galvanist'}],['pylon','pylon',{}],['risen','risen',{}],['grasp','grasp',{grips:6}],['fork','fork',{ring:.3}],['wire','bellwire',{wireAng:0,ring:.4}]])
        o[n]=new Set([.1,.3,.5,.7,.9,1.3].map(tm=>__wardImg(w,x,tm))).size;
      return o;},[wardProbe.toString()]);
    ok(Object.values(rm).every(n=>n===1),'under Reduce Motion each step 4 ward holds one frame',rm);
    await p2.close();}

  /* what patrons and effects lay on the floor (pixel stair step 5): on a pixel Cistern the Drowned Mother's water is a layer of art
     pixels built once (and again only when her water moves), banded from the paint's four strokes, its Phosphor glow and its sheet over
     the dark; the Wrong Sun's spots and burning pitch are banded glows; each of the rest (rings, marks on creatures, shots, effects,
     souls, the Hallowed Ground's chalk, the madness's eyes) changes the frame; all of it through a wave with no hitch; another floor and
     the painted board build none of it; under Reduce Motion the spots hold one size */
  const s5=await p.evaluate(()=>{const T=__t, o={}; T.setMapV(0);
    const at=(art,floor)=>{T.boardArtSet(art); T.newRun('lamplighter',0,{seed:9}); T.run.floor=floor; T.run.trial='hallowed'; T.run.hallow=null; T.beginFloor(null); T.setP(true); T.F.phase='build';
      const F=T.F; T.floodSeed(); T.run.spots={floor:T.run.floor,tiles:[[0,5],[0,9]]}; T.spotSync(); F.glowT=F.glowT||{}; F.glowT[0]=2; F.shake=0;
      for(const k of ['tallow','wax'])if(!T.run.relics.includes(k))T.run.relics.push(k);};
    const hash=()=>{const cv=document.getElementById('board'), d=cv.getContext('2d').getImageData(0,0,cv.width,cv.height).data; let h=0; for(let i=0;i<d.length;i+=16)h=(h*31+d[i]+d[i+1]*3+d[i+2]*7)>>>0; return h;};
    at('pixel',0); const F=T.F; o.on=T.pixOn(); o.water=F.waterLines.length; o.spots=F.spotPts.length/2; o.hallow=!!F.hallowG;
    F.time=3.3; T.render(); const WP=T.WATER_PX, body=WP.body; o.built=WP.lines===F.waterLines&&!!body&&body.width===T.COLS*32;
    /* the body: dark water where her channel runs, nothing on dry stone far from it */
    const W0=F.waterLines[0], bd=body.getContext('2d'), px=(x,y)=>bd.getImageData(Math.floor(x*32),Math.floor(y*32),1,1).data;
    const mid=px(W0.c[4],W0.c[5]); o.mid=[...mid]; o.dry=px(.2,.2)[3];
    o.glow=WP.glow.size>0; T.render(); o.cached=WP.body===body&&WP.lines===F.waterLines;
    /* a glow is banded: a handful of alphas, not a smooth ramp */
    const sp=T.glowPx('spot',20,1,[0,246,236,255,.95, .28,196,150,255,.72, .6,132,78,220,.3, 1,90,40,170,0],5), sd=sp.getContext('2d').getImageData(0,0,sp.width,sp.height).data, al=new Set();
    for(let i=3;i<sd.length;i+=4)if(sd[i])al.add(sd[i]); o.bands=al.size; o.spotKeys=(T.GLOW_PX.get('spot')||new Map()).size;
    /* each mark changes the frame */
    const base=hash(), ch={};
    const tryIt=(n,add,undo)=>{add(); T.render(); ch[n]=hash()!==base; undo(); T.render();};
    const e=T.spawnFoe('crawler',0,F.paths[0].len*.6); e.hp=e.max=1e6; e.x=F.lx+1.1; e.y=F.ly+.2; T.render(); const b0=hash();
    const mark=(n,k,v)=>{e[k]=v; T.render(); ch[n]=hash()!==b0; e[k]=0; T.render();};
    mark('hex','hex',1); mark('bleed','bleedT',3); mark('pin','pinT',3); mark('flense','flenseT',3); mark('poison','poisonT',3); mark('stun','stunT',3); e.hp=e.max/2; T.render(); ch.hp=hash()!==b0; e.hp=e.max; e.dead=true; F.foes.length=0; T.render();
    const nb=hash(), tryN=(n,add,undo)=>{add(); T.render(); ch[n]=hash()!==nb; undo(); T.render();};
    tryN('pool',()=>F.pools.push({x:F.lx-1,y:F.ly+1,r:.6,t:3,max:4}),()=>F.pools.length=0);
    for(const sh of [{k:'bolt',x:F.lx+1,y:F.ly-.8,ang:-.5},{k:'lance',sx:F.lx,sy:F.ly,x:F.lx-1,y:F.ly-1.2,ang:-2.2},{k:'spit',x:F.lx+.6,y:F.ly+1},{k:'tar',sx:F.lx,sy:F.ly,tx:F.lx+2,ty:F.ly+2,t:.5,dur:1}])tryN('shot:'+sh.k,()=>F.shots.push(sh),()=>F.shots.length=0);
    for(const f of [{k:'splash',x:F.lx+1,y:F.ly,r:.5},{k:'bite',x:F.lx-1,y:F.ly},{k:'beam',x:F.lx,y:F.ly,tx:F.lx+2,ty:F.ly-1},{k:'snuff',x:F.lx+1,y:F.ly},{k:'shatter',x:F.lx,y:F.ly+1,r:.3,seed:2},{k:'burst',x:F.lx+1,y:F.ly-1,r:.3,col:'#B8433A'},
      {k:'ring',x:F.lx,y:F.ly+1.5,r0:.2,r1:1,col:'214,228,236'},{k:'kbeam',x:F.lx-2,y:F.ly-1,tx:F.lx+1,ty:F.ly-1.5},{k:'tongue',x:F.lx+2,y:F.ly,tx:F.lx+.8,ty:F.ly+.2},{k:'hexlink',x:F.lx,y:F.ly,tx:F.lx+2,ty:F.ly+1},{k:'pillar',x:F.lx-1.5,y:F.ly+.5}])
      tryN('fx:'+f.k,()=>F.fx.push(Object.assign({t:.25,dur:1},f)),()=>F.fx.length=0);
    tryN('soul',()=>F.souls.push({x:F.lx-1.5,y:F.ly-1,type:'crawler',t:3,max:5.5}),()=>F.souls.length=0);
    const hg=F.hallowG; F.hallowG=null; T.render(); ch.chalk=hash()!==nb; F.hallowG=hg; T.render();
    o.unchanged=Object.keys(ch).filter(k=>!ch[k]);
    /* through a wave with all of it at once: under the water, husks and gibberers' rings, wards cut off, a soul, every shot and effect */
    T.setP(false); F.phase='wave'; F.queue=[{t:1e9,type:'crawler',gate:0}]; F.under=true; let errs=0;
    const L=F.paths[0]; ['crawler','gnasher','skitter','watcher'].forEach((k,i)=>{const f=T.spawnFoe(k,0,L.len*(.2+.15*i)); f.hp=f.max=1e6; f.hex=1; f.bleedT=f.pinT=f.flenseT=f.poisonT=f.stunT=9;}); F.named='gnasher';
    F.hlights=[{x:F.lx+2,y:F.ly-2,t:3}];
    for(let i=0;i<40;i++){if(i%10===1){F.pools.push({x:F.lx-1,y:F.ly+1,r:.6,t:3,max:4}); F.shots.push({k:'bolt',x:F.lx+1,y:F.ly-.8,ang:-.5,tx:F.lx+3,ty:F.ly}); F.fx.push({k:'ring',x:F.lx,y:F.ly,r0:.2,r1:1,col:'214,228,236',t:0,dur:.5},{k:'shatter',x:F.lx,y:F.ly+1,r:.3,seed:2,t:0,dur:.5});}
      try{T.update(1/30); T.render();}catch(err){errs++; o.err=String(err);}}
    o.errs=errs; o.cachedWave=T.WATER_PX.body===body;
    /* another floor, and the painted board, build no water of their own */
    at('pixel',1); T.render(); o.oss=T.pixOn(); o.ossNone=T.WATER_PX.lines!==T.F.waterLines;
    at('painted',0); T.render(); o.offNone=T.WATER_PX.lines!==T.F.waterLines;
    return o;});
  ok(s5.on&&s5.water>0&&s5.spots>0&&s5.hallow,'a pixel Cistern with her water, the Wrong Sun\'s spots and the Hallowed Ground',s5);
  ok(s5.built&&s5.cached&&s5.cachedWave,'her water is a layer of art pixels, built once and kept through a wave',s5);
  ok(s5.mid[3]>150&&s5.mid[2]>s5.mid[0]&&!s5.dry,'the layer is dark water along her channel, and nothing on dry stone',s5);
  ok(s5.glow,'a lit stretch builds its Phosphor glow',s5.glow);
  ok(s5.bands<=7&&s5.bands>=3&&s5.spotKeys>=1,'a glow is laid in bands of art pixels, not a smooth ramp',s5);
  ok(!s5.unchanged.length,'each mark, shot and effect draws on a pixel floor',s5.unchanged);
  ok(!s5.errs,'all of it at once through a wave, with no hitch',s5);
  ok(!s5.oss&&s5.ossNone&&s5.offNone,'another floor and the painted board build no pixel water',s5);
  {const p2=await b.newPage({viewport:{width:412,height:860},reducedMotion:'reduce'}); await p2.goto('file://'+process.argv[2]); await p2.waitForTimeout(600);
    const rm=await p2.evaluate(()=>{const T=__t; T.boardArtSet('pixel'); T.newRun('lamplighter',0,{seed:9}); T.run.floor=0; T.beginFloor(null); T.setP(true);
      T.run.spots={floor:0,tiles:[[0,5]]}; T.spotSync(); T.GLOW_PX.clear(); for(let i=0;i<12;i++){T.F.time=i*.37; T.render();} return (T.GLOW_PX.get('spot')||new Map()).size;});
    ok(rm===1,'under Reduce Motion a spot holds one size',rm);
    await p2.close();}
  for(const f of fails)console.log('FAIL '+f);
  if(fails.length)process.exitCode=1; else console.log('pixelboard: all ok');
  await b.close();
})();
