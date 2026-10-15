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
    /* the tile the beam will reach: straight out from the lamp through the mirror, beyond the lamp's light */
    const ux=(near[0]+.5-F.lx)/near[2], uy=(near[1]+.5-F.ly)/near[2];
    let probe=null; for(let s=1;s<=5;s+=.5){const x=near[0]+.5+ux*s, y=near[1]+.5+uy*s, c=Math.floor(x), rr=Math.floor(y); if(c<0||rr<0||c>=T.COLS||rr>=T.ROWS)break; if(Math.hypot(c+.5-F.lx,rr+.5-F.ly)>R+.3&&!T.F.pathTiles.has(c+','+rr)){probe=[c,rr]; break;}}
    out.probeBefore=probe?T.buildLit(probe[0],probe[1]):null;
    T.setSel({kind:'ward',type:'mirror'}); T.tryPlace(near[0],near[1]); T.setSel(null); T.update(.001);
    const m=T.F.towers.find(t=>t.type==='mirror');
    out.beams=T.F.beams.length; out.mdark=m.dark; out.probeAfter=probe?T.buildLit(probe[0],probe[1]):null;
    /* a ward built in the beam is cut if the mirror goes */
    if(probe){T.setSel({kind:'ward',type:'chime'}); T.tryPlace(probe[0],probe[1]); T.setSel(null); T.update(.001); out.cut=T.cutVictims(m).length;}
    /* the beam burns what walks through it */
    const b0=T.F.beams[0]; let fd=null; const P=T.F.paths[0];
    for(let d=0;d<P.len;d+=.25){const q=T.posAt(P,d); if(T.segDist(q[0],q[1],b0.x0,b0.y0,b0.x1,b0.y1)<.3){fd=d; break;}}
    if(fd!=null){const e=T.spawnFoe('behemoth',0,fd); e.def=Object.assign({},e.def,{spd:0}); T.update(.001); const hp=e.hp; for(let i=0;i<10;i++)T.update(.1); out.burn=+(hp-e.hp).toFixed(1); e.dead=true; T.update(.01);}
    /* Haul Away: everything on a line is dragged back at once */
    T.newRun('whaler',0); T.setP(false); window.devNoDark=true;
    out.whalerHas=T.run.rites.slice();
    T.castRite('haul'); out.haulIdle=T.F.cd.haul||0;
    const h={kind:'ward',type:'harpoon',id:9999,c:0,r:0,x:.5,y:.5,br:{speed:0,strength:0,line:0},cd:99,ang:0}; T.F.towers.push(h); h.st=T.wstat(h); h.st.range=99;
    const e1=T.spawnFoe('crawler',0,8), boss=T.spawnFoe('boss',0,9); T.update(.001);
    for(const e of [e1,boss]){e.tetherBy=h; e.tetherT=0;} h.tethered=e1;
    const d1=e1.d, db=boss.d; T.castRite('haul');
    out.haul={back:+(d1-e1.d).toFixed(2), boss:+(db-boss.d).toFixed(2), cd:T.F.cd.haul};
    window.devNoDark=false;
    return out;});
  console.log(JSON.stringify(r));
  ok(r.lampWards.includes('mirror')&&r.whalerRites.join()==='haul,bell','the Lamplighter builds Mirrors; the Whaler casts Haul Away',r);
  ok(r.near,'a Mirror can stand in the lamp’s light');
  ok(r.beams===1&&!r.mdark,'it throws one beam',r);
  ok(r.probeBefore===false&&r.probeAfter===true,'the beam lights ground past the lamp, to build on',r);
  ok(r.cut===1,'a ward standing in the beam is cut if the Mirror goes',r.cut);
  ok(r.burn>=4.5,'the beam burns what crosses it, 5 a second',r.burn);
  ok(r.whalerHas.join()==='haul,bell'&&r.haulIdle===0,'Haul Away waits when nothing is on a line',r);
  ok(Math.abs(r.haul.back-2)<.01&&r.haul.boss===0&&r.haul.cd===22,'Haul Away drags what is on a line 2 tiles back; a boss holds',r.haul);
  ok(!errs.length,'no page errors',errs);
  fails.forEach(f=>console.log('FAIL '+f)); await b.close(); process.exitCode=fails.length?1:0;
})();
