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
    o.candles=['occultist','galvanist','bellringer'].every(k=>__wardImg('candle',{kit:k},1)===o.ptCandle[k]); o.lampHarp=__wardImg('harpoon',{kit:'lamplighter'},1)!==o.ptHarpLamp;
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
  ok(wards.candles&&wards.lampHarp,'the Occultist\'s, Galvanist\'s and Bellringer\'s candles stay painted (step 4); every harpoon is the pixel ballista',wards);
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
  ok(kitw.harps===3,'the Lamplighter\'s and the Whaler\'s harpoons carry their own bolt head and foot; the other kits keep theirs',kitw.harps);
  ok(Object.values(kitw.dark).every(Boolean)&&kitw.darkStill.every(n=>n===1),'cut off from the light, each goes dark and holds still',kitw);
  ok(kitw.anim.every(n=>n>1),'the two kit candles flicker and the Try-pot\'s fire licks',kitw.anim);
  ok(kitw.burner,'the Burner turns the Signal Candle\'s flame red',kitw.burner);
  ok(kitw.turn&&kitw.lock,'the Signal Mirror turns, and its ring dims while a wave holds it',kitw);
  ok(kitw.oil===5,'the Try-pot shows its oil by the measure',kitw.oil);
  ok(kitw.net[0]&&kitw.net[1]>200&&kitw.tangle[0]&&kitw.tangle[1]>50&&kitw.rope[1]>30&&kitw.kindle[1]>4,'the net, the tangle, the line and Kindle\'s flames draw in art pixels',kitw);
  ok(!kitw.errs&&kitw.beam&&kitw.beamCached,'beam, threads, line, net, tangle and flames on the board through a wave; the beam is built once and reused',kitw);
  for(const f of fails)console.log('FAIL '+f);
  if(fails.length)process.exitCode=1; else console.log('pixelboard: all ok');
  await b.close();
})();
