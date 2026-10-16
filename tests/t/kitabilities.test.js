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
  ok(Math.abs(r.turned-30)<.5,'a 15° turn of the glass turns the beam 30°',r.turned);
  ok(r.aimed>.99&&r.straight===false,'aiming sends the beam where you tap; it won’t pass the light straight on',r);
  ok(r.locked,'it is locked while a wave comes',r);
  ok(r.probe&&r.probeBefore===false&&r.probeAfter===true,'the beam lights ground past the lamp, to build on',r);
  ok(r.cut===1,'a ward standing in the beam is cut if the Mirror goes',r.cut);
  ok(r.burn>=4.5,'the beam burns what crosses it, 5 a second',r.burn);
  ok(r.whalerHas.join()==='haul,bell'&&r.haulMode,'Haul Away asks where to cast',r);
  const hb=r.haul.back; ok(Math.abs(hb[0]-3)<.05&&Math.abs(hb[1]-3)<.05&&Math.abs(hb[2]-1)<.05&&hb[3]===0&&Math.abs(hb[4]-3)<.05,'the net hauls a crowd 3 back (a Behemoth 1, a boss not at all), and what is on a line too',hb);
  ok(r.haul.tangled.every(Boolean)&&r.haul.cd>23,'everything it caught is tangled',r.haul);
  ok(!errs.length,'no page errors',errs);
  fails.forEach(f=>console.log('FAIL '+f)); await b.close(); process.exitCode=fails.length?1:0;
})();
