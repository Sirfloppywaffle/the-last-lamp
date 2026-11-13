// Every kit's own ward and rite (#26): the Lamplighter's Signal Mirror, the Whaler's Haul Away.
const {chromium}=require('playwright');
const fails=[]; const ok=(c,m,d)=>{if(!c)fails.push(m+(d!==undefined?' '+JSON.stringify(d):''));};
(async()=>{
  const b=await chromium.launch(); const p=await b.newPage({viewport:{width:412,height:860}});
  const errs=[]; p.on('pageerror',e=>errs.push(String(e)));
  await p.goto('file://'+process.argv[2]); await p.waitForTimeout(300);
  const r=await p.evaluate(()=>{const T=__t, out={}; window.devNoDark=false;
    T.newRun('lamplighter',0); T.setP(false); T.run.ess=2000;
    out.lampWards=T.run.wards.slice(); out.whalerRites=T.KITS.whaler.rites.slice();
    /* the Mirror only stands in the lamp's own light */
    const R=T.lampBase(), F=T.F; let near=null, far=null;
    for(let r=0;r<T.ROWS;r++)for(let c=0;c<T.COLS;c++){const d=Math.hypot(c+.5-F.lx,r+.5-F.ly), pp=T.placeProblem({kind:'ward',type:'mirror'},c,r);
      if(pp===''&&d>1.5&&(!near||d>near[2]))near=[c,r,d];
      if(d>R&&T.buildLit(c,r)&&!far)far=[c,r,pp];}
    out.near=!!near;
    T.setSel({kind:'ward',type:'mirror'}); T.tryPlace(near[0],near[1]); T.setSel(null); T.update(.001);
    const m=T.F.towers.find(t=>t.type==='mirror');
    out.beams=T.F.beams.length; out.mdark=m.dark;
    /* it reflects: the beam leaves at the mirror angle, not straight on from the lamp */
    const B=()=>T.F.beams[0], inc=[(m.x-F.lx)/near[2],(m.y-F.ly)/near[2]];
    out.reflects=Math.abs(B().ux*inc[0]+B().uy*inc[1])<.2;
    /* turning it turns the beam, live */
    const u0=[B().ux,B().uy]; T.turnMirror(m,Math.PI/12); out.turned=+(Math.acos(Math.max(-1,Math.min(1,u0[0]*B().ux+u0[1]*B().uy)))*180/Math.PI).toFixed(1);
    /* aiming at a point sends the beam there */
    const tgt=[m.x-inc[1]*3+inc[0]*.5, m.y+inc[0]*3+inc[1]*.5]; T.aimMirror(m,tgt[0],tgt[1]); T.update(.001);
    const want=[(tgt[0]-m.x),(tgt[1]-m.y)], wl=Math.hypot(...want); out.aimed=+(B().ux*want[0]/wl+B().uy*want[1]/wl).toFixed(3);
    out.straight=T.aimMirror(m,m.x+inc[0]*3,m.y+inc[1]*3);
    /* nor can the turn buttons: a full turn either way, a step at a time, never leaves the beam within 10° of straight on, and the
       smallest bend aiming allows is 10°. A mirror left edge-on (an older save) throws no beam */
    const bend=()=>{T.update(.001); const b=T.F.beams.find(q=>q.t===m); return b?Math.acos(Math.max(-1,Math.min(1,b.ux*b.ix+b.uy*b.iy)))*180/Math.PI:null;};
    out.turnBends=[]; for(const dir of [1,-1])for(let k=0;k<26;k++){T.turnMirror(m,dir*Math.PI/12); out.turnBends.push(bend());}
    const ia=Math.atan2(inc[1],inc[0]), aimAt=deg=>T.aimMirror(m,m.x+Math.cos(ia+deg*Math.PI/180)*3,m.y+Math.sin(ia+deg*Math.PI/180)*3);
    out.aim9=aimAt(9); out.aim11=aimAt(11); out.aim11Bend=bend();
    m.rot=Math.atan2(inc[1],inc[0]); out.edgeOn=bend();
    T.aimMirror(m,tgt[0],tgt[1]); T.update(.001);
    /* the dark locks it */
    T.F.phase='wave'; const r0=m.rot; T.turnMirror(m,1); const aimedInWave=T.aimMirror(m,tgt[0]+1,tgt[1]); out.locked=m.rot===r0&&!aimedInWave; T.F.phase='build';
    /* a tile the beam lights, past the lamp's own light */
    let probe=null; const b1=B(); for(let st=1;st<=5;st+=.5){const x=m.x+b1.ux*st, y=m.y+b1.uy*st, c=Math.floor(x), rr=Math.floor(y); if(c<0||rr<0||c>=T.COLS||rr>=T.ROWS)break; if(Math.hypot(c+.5-F.lx,rr+.5-F.ly)>R+.3&&!T.F.pathTiles.has(c+','+rr)&&!T.F.towers.some(t=>t.c===c&&t.r===rr)){probe=[c,rr]; break;}}
    out.probe=!!probe; out.probeAfter=probe?T.buildLit(probe[0],probe[1]):null;
    T.F.towers=T.F.towers.filter(t=>t!==m); T.update(.001); out.probeBefore=probe?T.buildLit(probe[0],probe[1]):null; T.F.towers.push(m); T.update(.001);
    /* a ward built in the beam is cut if the mirror goes */
    if(probe){T.setSel({kind:'ward',type:'chime'}); T.tryPlace(probe[0],probe[1]); T.setSel(null); T.update(.001); out.cut=T.cutVictims(m).length;}
    /* the beam burns what walks through it */
    const b0=T.F.beams[0]; let fd=null; const P=T.F.paths[0];
    for(let d=0;d<P.len;d+=.25){const q=T.posAt(P,d); if(T.segDist(q[0],q[1],b0.x0,b0.y0,b0.x1,b0.y1)<.3){fd=d; break;}}
    if(fd!=null){const e=T.spawnFoe('behemoth',0,fd); e.def=Object.assign({},e.def,{spd:0}); T.update(.001); const hp=e.hp; for(let i=0;i<10;i++)T.update(.1); out.burn=+(hp-e.hp).toFixed(1); e.dead=true; T.update(.01);}
    /* Haul Away: a net lands where you tap; under it, and on your lines, they slide 3 back and tangle */
    {T.newRun('whaler',0); T.setP(false); window.devNoDark=true; T.F.phase='wave';
    out.whalerHas=T.run.rites.slice();
    const P=T.F.paths[0], mid=Math.floor(P.len*.6), q=T.posAt(P,mid);
    const crowd=[T.spawnFoe('crawler',0,mid),T.spawnFoe('crawler',0,mid+.5),T.spawnFoe('behemoth',0,mid-.4),T.spawnFoe('boss',0,mid+.3)], far=T.spawnFoe('crawler',0,3);
    const h={kind:'ward',type:'harpoon',id:9999,c:0,r:0,x:.5,y:.5,br:{speed:0,strength:0,line:0},cd:99,ang:0}; T.F.towers.push(h); h.st=T.wstat(h); h.st.range=99; far.tetherBy=h; far.tetherT=0; h.tethered=far;
    for(const e of crowd.concat(far))e.def=Object.assign({},e.def,{spd:0}); T.update(.001);
    const d0=crowd.concat(far).map(e=>e.d);
    T.castRite('haul'); out.haulMode=document.querySelector('#modebar').textContent.includes('Haul');
    const cvs=document.querySelector('#board').getBoundingClientRect();
    document.querySelector('#board').dispatchEvent(new PointerEvent('pointerdown',{clientX:cvs.left+q[0]/T.COLS*cvs.width,clientY:cvs.top+q[1]/T.ROWS*cvs.height,bubbles:true}));
    for(let i=0;i<12;i++)T.update(.05);
    const all=crowd.concat(far);
    out.haul={back:all.map((e,i)=>+(d0[i]-e.d).toFixed(2)), tangled:all.map(e=>e.tangleT>0), cd:T.F.cd.haul};
    }
    window.devNoDark=false;
    return out;});
  console.log(JSON.stringify(r));
  ok(r.lampWards.includes('mirror')&&r.whalerRites.join()==='haul,bell','the Lamplighter builds Mirrors; the Whaler casts Haul Away',r);
  ok(r.near,'a Mirror can stand in the lamp’s light');
  ok(r.beams===1&&!r.mdark,'it throws one beam',r);
  ok(r.reflects,'it reflects the lamp at an angle, not straight on',r);
  ok(!r.straight&&r.aim9===false&&r.aim11===true&&Math.abs(r.aim11Bend-11)<.5,'aiming refuses a bend under 10°, and allows one just over',r);
  ok(r.turnBends.length===52&&r.turnBends.every(a=>a!==null&&a>=10),'the turn buttons, a whole turn either way, never send the light straight on',r.turnBends);
  ok(r.edgeOn===null,'a mirror left edge-on to the light throws no beam',r.edgeOn);
  ok(Math.abs(r.turned-30)<.5,'a 15° turn of the glass turns the beam 30°',r.turned);
  ok(r.aimed>.99&&r.straight===false,'aiming sends the beam where you tap; it won’t pass the light straight on',r);
  ok(r.locked,'it is locked while a wave comes',r);
  ok(r.probe&&r.probeBefore===false&&r.probeAfter===true,'the beam lights ground past the lamp, to build on',r);
  ok(r.cut===1,'a ward standing in the beam is cut if the Mirror goes',r.cut);
  ok(r.burn>=4.5,'the beam burns what crosses it, 5 a second',r.burn);
  /* a second mirror (Criss, 13 Nov 2026): built in a beam outside the lamp's own light, it catches the beam and throws it on once more,
     burning half as hard; a third catches nothing; take the first away and the second goes dark */
  const bo=await p.evaluate(()=>{const T=__t, o={}; window.devNoDark=false; T.newRun('lamplighter',0,{seed:9}); T.run.floor=0; T.beginFloor(null); T.setP(true); T.run.ess=99999;
    const F=T.F, R=T.lampBase(), MI={kind:'ward',type:'mirror'}, place=(c,r)=>{T.setSel(MI); T.tryPlace(c,r); T.setSel(null); T.update(.001); return F.towers.find(t=>t.type==='mirror'&&t.c===c&&t.r===r);};
    const free=(c,r)=>T.placeProblem(MI,c,r)==='';
    /* the first mirror, in the lamp's light; aimed round until its beam runs out past the light onto a tile a mirror can take */
    let m1=null, spot=null;
    for(let r=0;r<T.ROWS&&!m1;r++)for(let c=0;c<T.COLS&&!m1;c++){const d=Math.hypot(c+.5-F.lx,r+.5-F.ly); if(d>1&&d<R-.6&&free(c,r))m1=place(c,r);}
    o.m1=!!m1;
    for(let a=0;a<72&&!spot;a++){const ang=a*5*Math.PI/180; if(!T.aimMirror(m1,m1.x+Math.cos(ang)*4,m1.y+Math.sin(ang)*4))continue; T.update(.001);
      const b=F.beams.find(q=>q.t===m1); if(!b)continue;
      /* the farthest spot first: glass at the very tip of a beam catches it too */
      for(let s2=5;s2>=1&&!spot;s2-=.25){const x=b.x0+b.ux*s2, y=b.y0+b.uy*s2, c=Math.floor(x), r=Math.floor(y); if(c<0||r<0||c>=T.COLS||r>=T.ROWS)continue;
        if(Math.hypot(c+.5-F.lx,r+.5-F.ly)>R+.3&&T.segDist(c+.5,r+.5,b.x0,b.y0,b.x1,b.y1)<=.35&&free(c,r))spot=[c,r];}}
    o.spot=spot; if(!spot)return o;
    const inc=(()=>{const b=F.beams.find(q=>q.t===m1); return [b.ux,b.uy];})();
    const m2=place(spot[0],spot[1]); o.m2=!!m2; o.m2dark=m2.dark;
    const b1=F.beams.find(q=>q.t===m1), b2=F.beams.find(q=>q.t===m2);
    o.stops=!!b1&&b1.hit===m2&&Math.hypot(b1.x1-m2.x,b1.y1-m2.y)<.5; o.bounce=b2?b2.bounce:null; o.n=F.beams.length;
    o.bend=b2?+(Math.acos(Math.max(-1,Math.min(1,b2.ux*inc[0]+b2.uy*inc[1])))*180/Math.PI).toFixed(1):null;
    /* it turns and aims by the beam it catches: straight on along that beam is refused */
    o.straight2=T.aimMirror(m2,m2.x+inc[0]*3,m2.y+inc[1]*3);
    o.turns=[]; for(let k=0;k<24;k++){T.turnMirror(m2,Math.PI/12); T.update(.001); const q=F.beams.find(x=>x.t===m2); o.turns.push(q?Math.acos(Math.max(-1,Math.min(1,q.ux*inc[0]+q.uy*inc[1])))*180/Math.PI:null);}
    /* half the burn: a creature held where only the bounced beam crosses the path */
    const P=F.paths[0]; let fd=null;
    for(let a=0;a<72&&fd==null;a++){const ang=a*5*Math.PI/180; if(!T.aimMirror(m2,m2.x+Math.cos(ang)*4,m2.y+Math.sin(ang)*4))continue; T.update(.001);
      const q2=F.beams.find(x=>x.t===m2), q1=F.beams.find(x=>x.t===m1); if(!q2)continue;
      for(let d=0;d<P.len;d+=.25){const z=T.posAt(P,d); if(T.segDist(z[0],z[1],q2.x0,q2.y0,q2.x1,q2.y1)<.3&&T.segDist(z[0],z[1],q1.x0,q1.y0,q1.x1,q1.y1)>.8){fd=d; break;}}}
    if(fd!=null){T.setP(false); F.phase='wave'; F.queue=[{t:1e9,type:'crawler',gate:0}]; const e=T.spawnFoe('behemoth',0,fd); e.def=Object.assign({},e.def,{spd:0}); T.update(.001); const hp=e.hp; for(let i=0;i<10;i++)T.update(.1); o.burn2=+(hp-e.hp).toFixed(2); e.dead=true; T.update(.01); F.phase='build'; T.setP(true);}
    /* a third mirror in the bounced beam catches nothing */
    o.third=null;
    for(let a=0;a<72&&o.third==null;a++){const ang=a*5*Math.PI/180; if(!T.aimMirror(m2,m2.x+Math.cos(ang)*4,m2.y+Math.sin(ang)*4))continue; T.update(.001);
     const q2=F.beams.find(x=>x.t===m2); if(q2)for(let s2=1;s2<=4.6&&o.third==null;s2+=.25){const x=q2.x0+q2.ux*s2, y=q2.y0+q2.uy*s2, c=Math.floor(x), r=Math.floor(y); if(c<0||r<0||c>=T.COLS||r>=T.ROWS)break;
      if(Math.hypot(c+.5-F.lx,r+.5-F.ly)>R+.3&&T.segDist(c+.5,r+.5,q2.x0,q2.y0,q2.x1,q2.y1)<=.35&&!F.towers.some(t=>t.c===c&&t.r===r)&&T.buildLit(c,r)&&!F.pathTiles.has(c+','+r))o.third=T.placeProblem(MI,c,r);}}
    /* without the first, the second catches nothing and goes dark */
    o.cut=T.cutVictims(m1).includes(m2);
    F.towers=F.towers.filter(t=>t!==m1); T.update(.001); o.darkAfter=m2.dark; o.beamsAfter=F.beams.length;
    return o;});
  ok(bo.m1&&bo.spot&&bo.m2,'a second mirror can be built in a beam, outside the lamp\'s own light',bo);
  ok(bo.m2dark===false&&bo.stops&&bo.bounce===1&&bo.n===2,'it catches the beam (which stops at its glass) and throws it on',bo);
  ok(Math.abs(bo.bend-90)<2,'built, it turns the beam a quarter, as a first mirror does',bo.bend);
  ok(bo.straight2===false&&bo.turns.every(a=>a===null||a>=10),'it can\'t send the beam straight on either, aimed or turned',bo);
  ok(bo.burn2!=null&&bo.burn2>=2&&bo.burn2<=3.2,'the bounced beam burns half as hard, 2.5 a second',bo.burn2);
  ok(/bounces only twice/.test(bo.third||''),'a third mirror in the bounced beam catches nothing',bo.third);
  ok(bo.cut&&bo.darkAfter===true&&bo.beamsAfter===0,'take the first away and the second goes dark',bo);
  ok(r.whalerHas.join()==='haul,bell'&&r.haulMode,'Haul Away asks where to cast',r);
  const hb=r.haul.back; ok(Math.abs(hb[0]-3)<.05&&Math.abs(hb[1]-3)<.05&&Math.abs(hb[2]-1)<.05&&hb[3]===0&&Math.abs(hb[4]-3)<.05,'the net hauls a crowd 3 back (a Behemoth 1, a boss not at all), and what is on a line too',hb);
  ok(r.haul.tangled.every(Boolean)&&r.haul.cd>23,'everything it caught is tangled',r.haul);
  ok(!errs.length,'no page errors',errs);
  fails.forEach(f=>console.log('FAIL '+f)); await b.close(); process.exitCode=fails.length?1:0;
})();
