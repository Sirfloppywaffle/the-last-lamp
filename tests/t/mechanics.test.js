// Core mechanics with hard assertions: traps, the Whaling Gun's pin, the Hex Effigy (hex, voodoo, doom),
// piercing bolts on long frames, Wretch splits, and the speed button.
const {chromium}=require('playwright');
const fails=[]; const ok=(cond,msg,detail)=>{if(!cond)fails.push(msg+(detail!==undefined?' '+JSON.stringify(detail):''));};
(async()=>{
  const b=await chromium.launch(); const p=await b.newPage({viewport:{width:900,height:700}});
  await p.goto('file://'+process.argv[2]); await p.waitForTimeout(300);

  const r=await p.evaluate(()=>{
    const T=__t, out={};
    const setup=()=>{T.newRun(); T.run.floor=0; T.beginFloor(null); T.run.ess=9000; T.run.oil=T.run.oilMax=999; T.run.wards.push('coil','lance'); T.setP(false); T.F.phase='wave'; T.F.queue=[{t:1e9,type:'crawler',gate:0}];};
    const P=()=>T.F.paths[0];
    const tileAt=(d)=>{const q=T.posAt(P(),d); return [Math.floor(q[0]),Math.floor(q[1])];};
    const placeAt=(type,c,r)=>{T.setSel({kind:'ward',type}); T.tryPlace(c,r); T.setSel(null); return T.F.towers.find(t=>t.c===c&&t.r===r);};
    const nearLit=(type,near)=>{const it={kind:'ward',type}; const q=near||[T.F.lx,T.F.ly]; let best=null,bd=1e9; for(let r=0;r<T.ROWS;r++)for(let c=0;c<T.COLS;c++){if(T.placeProblem(it,c,r))continue; const d=Math.hypot(c+.5-q[0],r+.5-q[1]); if(d<bd){bd=d;best=[c,r];}} return best;};

    // trap: Barbs capstone (bleed) + Chain tier 2 (longer hold) on a lit path tile
    setup();
    let trapTile=null; for(let d=P().len-1;d>0;d-=.5){const [c,r]=tileAt(d); if(!T.placeProblem({kind:'ward',type:'trap'},c,r)){trapTile=[c,r,d];break;}}
    const tr=placeAt('trap',trapTile[0],trapTile[1]); for(let i=0;i<3;i++)T.buyBranch(tr,0); for(let i=0;i<2;i++)T.buyBranch(tr,2);
    const e=T.spawnFoe('gnasher',0,Math.max(0,trapTile[2]-1.5)); e.hp=e.max=1e6;
    let caught=null; for(let k=0;k<300;k++){T.update(1/30); if(e.stunT>0&&!caught)caught={stun:+e.stunT.toFixed(2),bleed:+(e.bleedT||0).toFixed(2),hpLost:Math.round(1e6-e.hp)};}
    out.trap=caught;

    // trap: Drag Below capstone hauls its catch back along the path
    setup();
    const tr2=placeAt('trap',trapTile[0],trapTile[1]); for(let i=0;i<3;i++)T.buyBranch(tr2,2);
    const e2=T.spawnFoe('crawler',0,Math.max(0,trapTile[2]-1)); e2.hp=e2.max=1e6;
    let drag=null; for(let k=0;k<200;k++){const before=e2.d; T.update(1/30); if(e2.d<before-1){drag=before-e2.d;break;}}
    out.drag=drag;

    // Whaling Gun: Barbed Line capstone pins even a heavy Behemoth
    setup();
    const lt=nearLit('lance'); const L=placeAt('lance',lt[0],lt[1]); for(let i=0;i<3;i++)T.buyBranch(L,1);
    const bh=T.spawnFoe('behemoth',0,P().len-3); bh.hp=bh.max=1e6;
    let pinned=0; for(let k=0;k<400;k++){T.update(1/30); if(bh.pinT>0)pinned++;}
    out.pin={frames:pinned, dmg:Math.round(1e6-bh.hp)};

    // Hex Effigy: hex multiplier, voodoo echo, then doom on a fresh effigy
    setup();
    const q=T.posAt(P(),P().len-3); const spot=nearLit('effigy',q);
    const E=placeAt('effigy',spot[0],spot[1]); for(let i=0;i<3;i++)T.buyBranch(E,1); for(let i=0;i<2;i++)T.buyBranch(E,0);
    const a=T.spawnFoe('crawler',0,P().len-3), c2=T.spawnFoe('crawler',0,P().len-3.3); a.hp=a.max=c2.hp=c2.max=1e6;
    T.update(1/30);
    out.hex={a:!!a.hex,c:!!c2.hex,mul:a.hex&&a.hex.mul,voodoo:a.hex&&a.hex.voodoo};
    const h0=a.hp,h1=c2.hp; T.hurt(a,100); out.hex.hitOnA=Math.round(h0-a.hp); out.hex.echoOnC=Math.round(h1-c2.hp);
    setup();
    const E2=placeAt('effigy',spot[0],spot[1]); for(let i=0;i<3;i++)T.buyBranch(E2,0);
    const v=T.spawnFoe('crawler',0,P().len-3), w=T.spawnFoe('crawler',0,P().len-3.4); w.hp=w.max=1e6;
    T.update(1/30); const wh=w.hp; T.hurt(v,1e5);
    out.doom={dead:!!v.dead, hit:Math.round(wh-w.hp), hexT:w.hexT||0};

    // a fast piercing bolt on a long frame still hits what it passes over (swept test)
    setup(); T.F.queue=[{t:1e9,type:'crawler',gate:0}];
    const f=T.spawnFoe('crawler',0,P().len-4); f.hp=f.max=1e6; f.stunT=99;
    T.F.shots.push({k:'pierce',x:f.x-.75,y:f.y,dx:1,dy:0,ang:0,spd:14,trav:0,max:6,dmg:50,hit:[]});
    T.update(.1); out.pierce=Math.round(1e6-f.hp);

    // a Wretch killed by burning ground splits, and its Skitterlings aren't burned on the tick they're born
    setup(); T.run.floor=1; T.beginFloor(null); T.setP(false); T.F.phase='wave'; T.F.queue=[{t:1e9,type:'crawler',gate:0}];
    const wr=T.spawnFoe('wretch',0,T.F.paths[0].len-5); wr.hp=.5;
    T.F.pools.push({x:wr.x,y:wr.y,r:2,dps:60,t:5,max:5});
    T.update(1/30);
    const sk=T.F.foes.filter(z=>z.type==='skitter');
    out.split={dead:!!wr.dead, n:sk.length, fresh:sk.every(z=>z.hp===z.max)};
    return out;
  });
  console.log(JSON.stringify(r));
  ok(r.trap&&r.trap.stun>=1.9&&r.trap.bleed>0&&r.trap.hpLost>0,'trap should stun ~2s, bleed and damage',r.trap);
  ok(r.drag>1,'Drag Below should haul its catch more than a tile back',r.drag);
  ok(r.pin.frames>0&&r.pin.dmg>0,'Whaling Gun should pin and damage a Behemoth',r.pin);
  ok(r.hex.a&&r.hex.c&&Math.abs(r.hex.mul-1.7)<1e-6&&r.hex.voodoo,'effigy should hex both creatures at ×1.7 with voodoo',r.hex);
  ok(r.hex.hitOnA>=160&&r.hex.echoOnC>0,'hexed hit should be amplified and echo',r.hex);
  ok(r.doom.dead&&r.doom.hit>0&&r.doom.hexT>0,'doom should burst and hex a neighbour',r.doom);
  ok(r.pierce===50,'piercing bolt should hit on a long frame',r.pierce);
  ok(r.split.dead&&r.split.n===2&&r.split.fresh,'Wretch should split into 2 untouched Skitterlings',r.split);

  // the speed button cycles 1× → 2× → 3× → 1×, and 3× really runs three times as fast
  await p.evaluate(()=>{const T=__t; T.newRun(); T.run.floor=0; T.beginFloor(null); T.forceUI(); T.setP(false); document.getElementById('title').hidden=true;});
  const lbl=[]; for(let i=0;i<4;i++){lbl.push(await p.$eval('#speedBtn',x=>x.textContent)); if(i<3)await p.click('#speedBtn',{force:true});}
  ok(JSON.stringify(lbl)===JSON.stringify(['1×','2×','3×','1×']),'speed labels',lbl);
  while((await p.$eval('#speedBtn',x=>x.textContent))!=='3×')await p.click('#speedBtn',{force:true});
  await p.evaluate(()=>{__t.setP(false); __t.callWave();});
  const t0=await p.evaluate(()=>[__t.F.time,performance.now()]); await p.waitForTimeout(2000);
  const t1=await p.evaluate(()=>[__t.F.time,performance.now()]);
  const ratio=(t1[0]-t0[0])/((t1[1]-t0[1])/1000);
  ok(ratio>2.6&&ratio<3.3,'3× should run ~3× real time',+ratio.toFixed(2));

  for(const f of fails)console.log('FAIL '+f);
  if(fails.length)process.exitCode=1; else console.log('all mechanics ok');
  await b.close();
})();
