// The Galvanist (#26, the fourth kit): pylons and their grid, the Arc Lamp, Lightning Rods, Overload and Heat, Static Burst.
const {chromium}=require('playwright');
const fails=[]; const ok=(c,m,d)=>{if(!c)fails.push(m+(d!==undefined?' '+JSON.stringify(d):''));};
(async()=>{
  const b=await chromium.launch(); const p=await b.newPage({viewport:{width:412,height:860}});
  const errs=[]; p.on('pageerror',e=>errs.push(String(e)));
  await p.goto('file://'+process.argv[2]); await p.waitForTimeout(300);
  const r=await p.evaluate(()=>{const T=__t, out={};
    const fresh=()=>{window.devNoDark=false; T.newRun('galvanist',0); T.setP(false); T.run.ess=5000;};
    const put=(type,c,r)=>{window.devNoDark=true; T.setSel({kind:'ward',type}); T.tryPlace(c,r); T.setSel(null); window.devNoDark=false; T.update(.001); return T.F.towers.find(t=>t.c===c&&t.r===r);};
    const free=(test)=>{const o=[]; for(let r=0;r<T.ROWS;r++)for(let c=0;c<T.COLS;c++){if(T.F.pathTiles.has(c+','+r)||(c===T.F.lampC&&r===T.F.lampR)||T.F.towers.some(t=>t.c===c&&t.r===r))continue; if(test(c+.5,r+.5))o.push([c,r]);} return o;};
    fresh();
    out.kit={wards:T.run.wards.slice(),rites:T.run.rites.slice(),names:[T.wdef('candle').n,T.wdef('harpoon').n],salt:T.wardCost('salt')};
    const F=T.F, R=T.lampBase();
    /* a pylon on each side of a stretch of path: the wire crosses it */
    const P=F.paths[0]; let best=null;
    for(let d=1;d<P.len-1&&!best;d+=.5){const q=T.posAt(P,d); if(Math.hypot(q[0]-F.lx,q[1]-F.ly)>R+.5)continue;
      const A=free((x,y)=>Math.hypot(x-F.lx,y-F.ly)<=R&&Math.hypot(x-q[0],y-q[1])<=1.6);
      for(const a of A){const B=free((x,y)=>Math.hypot(x-a[0]-.5,y-a[1]-.5)<=3.4&&Math.hypot(x-a[0]-.5,y-a[1]-.5)>=1.5&&T.segDist(q[0],q[1],a[0]+.5,a[1]+.5,x,y)<.15); if(B.length){best={d,q,a,b:B[0]}; break;}}}
    out.found=!!best;
    const p1=put('pylon',...best.a), p2=put('pylon',...best.b);
    const live=()=>T.F.grid&&T.F.grid.edges.filter(e=>e.live).length;
    out.grid={edges:T.F.grid.edges.length,live:live(),p1dark:p1.dark,p2dark:p2.dark};
    /* a pylon with no path back to the mains is dead */
    const far=free((x,y)=>Math.hypot(x-F.lx,y-F.ly)>R+4&&[p1,p2].every(t=>Math.hypot(x-t.x,y-t.y)>5))[0];
    const p3=put('pylon',...far); out.grid.lonely=p3.dark;
    out.cut=T.cutVictims(p1).includes(p2);
    /* a creature crossing the wire is shocked, stunned and lit; the wire then recharges */
    T.F.phase='wave';
    const mk=(type)=>{const e=T.spawnFoe(type,0,best.d); e.def=Object.assign({},e.def,{spd:0}); return e;};
    const e1=mk('gnasher'); const h0=e1.hp; T.update(.001); T.update(.02);
    out.shock={dmg:h0-e1.hp, stun:+e1.stunT.toFixed(2), lit:e1.revealT>0};
    const e2=mk('gnasher'); const h2=e2.hp; T.update(.05); out.shock.recharging=e2.hp===h2; e1.dead=true;
    for(let i=0;i<40;i++)T.update(.05); out.shock.later=e2.hp<h2;
    /* Overload: 2 oil, triple strength, Heat; run hot and it fries the hardest-worked pylon */
    T.run.oil=12; T.F.heat=0; const h3=e2.hp; T.castRite('overload');
    out.over={oil:T.run.oil,heat:+T.F.heat.toFixed(2),dmg:+(h3-e2.hp).toFixed(1)};
    T.F.heat=2.1; out.over.next=T.overloadFry(); const before=T.F.towers.filter(t=>t.type==='pylon').length; p1.zaps=99; T.castRite('overload');
    out.over.fried=before-T.F.towers.filter(t=>t.type==='pylon').length; out.over.p1gone=!T.F.towers.includes(p1); out.over.p2dark=p2.dark;
    T.run.oil=2; const h4=e2.hp; T.castRite('overload'); out.over.tooLow=T.run.oil===2;
    /* a Behemoth snaps a wire for the wave */
    fresh(); const q1=put('pylon',...best.a), q2=put('pylon',...best.b); T.F.phase='wave';
    const beh=T.spawnFoe('behemoth',0,best.d); beh.def=Object.assign({},beh.def,{spd:0}); T.update(.001); T.update(.02);
    out.snapped=T.F.grid.edges.filter(e=>e.live).length===0&&T.F.wireBroken.size===1;
    /* a Lightning Rod plants where it strikes and joins the grid */
    fresh(); const r1=put('pylon',...best.a); T.F.phase='wave';
    const hp=put('harpoon',...free((x,y)=>Math.hypot(x-F.lx,y-F.ly)<=R)[0]);
    const tg=T.spawnFoe('gnasher',0,best.d); T.update(.001);
    T.F.shots.push({k:'bolt',x:tg.x,y:tg.y,tg,tx:tg.x,ty:tg.y,spd:13,dmg:1,ang:0,rodBy:hp}); T.update(.01);
    out.rod={rods:T.F.rods.length, linked:T.F.grid.edges.some(e=>(e.a.rod||e.b.rod)&&e.live)};
    for(let i=0;i<4;i++){T.plantRod(tg.x+i*.1,tg.y,hp);} out.rod.capped=T.F.rods.length;
    tg.def=Object.assign({},tg.def,{spd:0}); out.rod.t=T.F.rods.map(x=>+x.t.toFixed(2)); for(let i=0;i<120;i++)T.update(.05); out.rod.fell=T.F.rods.length; out.rod.t2=T.F.rods.map(x=>+x.t.toFixed(2)); out.rod.phase=T.F.phase;
    /* the Arc Lamp: brighter, flickers out in a wave, and flares a shock as it returns */
    fresh(); const cl=put('candle',...free((x,y)=>Math.hypot(x-F.lx,y-F.ly)<=R-.5)[0]);
    out.arc={light:+T.wstat(cl).light.toFixed(2)}; T.F.phase='wave'; const idle=T.spawnFoe('crawler',0,0); idle.def=Object.assign({},idle.def,{spd:0});
    let off=0; for(let i=0;i<100;i++){T.update(.05); if(T.arcOff(cl))off++;} out.arc.offFrames=off;
    T.F.phase='build'; out.arc.buildOff=T.arcOff(cl);
    /* Static Burst: the Dynamo's capstone stuns what comes close */
    fresh(); T.F.lamp.br.dynamo=3; T.F.phase='wave'; const near=T.spawnFoe('crawler',0,T.F.paths[0].len-1.2); near.def=Object.assign({},near.def,{spd:0});
    T.update(.001); T.update(.02); out.static={stun:near.stunT>0, cd:T.F.staticCd>10};
    {/* the Grounding Anchor: forced links that never shock, a cage, one catch, a capture that vents Heat */
    fresh(); const a1=put('pylon',...best.a), a2=put('pylon',...best.b);
    const mid=[(a1.x+a2.x)/2,(a1.y+a2.y)/2], q=best.q, ax=q[0]+(q[0]-mid[0])*1.5, ay=q[1]+(q[1]-mid[1])*1.5;
    T.F.phase='wave'; const idle2=T.spawnFoe('crawler',0,0); idle2.def=Object.assign({},idle2.def,{spd:0}); T.update(.001);
    T.castAnchor(ax,ay);
    const an=T.F.grid.edges.filter(e=>e.anchor);
    out.anc={links:an.length, tris:T.F.grid.tris.length, cd:T.F.cd.anchor, inside:T.inCage(q[0],q[1])};
    /* an anchor wire does not shock */
    const ae=an[0]; const qx=(ae.a.x+ae.b.x)/2, qy=(ae.a.y+ae.b.y)/2;
    const bystander=T.spawnFoe('crawler',0,1); bystander.def=Object.assign({},bystander.def,{spd:0}); bystander.x=qx; bystander.y=qy; bystander.d=-1;
    /* a Gnasher dies inside the cage: caught, not a sigil; the Anchor burns out */
    T.F.heat=2.5; const gn=T.spawnFoe('gnasher',0,best.d); T.update(.001); gn.x=q[0]+(ax-q[0])*.3; gn.y=q[1]+(ay-q[1])*.3; out.anc.gnIn=T.inCage(gn.x,gn.y); T.hurt(gn,9999);
    const cg=T.F.souls.find(x=>x.cage);
    out.anc.caught=!!cg&&cg.max===5; out.anc.burnt=T.F.anchor===null; out.anc.sigils=T.F.souls.filter(x=>!x.cage).length;
    if(!cg)return out; const before=T.run.roster.gnasher||0; T.bindSoul(cg); out.anc.captured=(T.run.roster.gnasher||0)-before; out.anc.heat=+T.F.heat.toFixed(2);
    /* dying outside any cage leaves nothing for the Galvanist */
    T.F.souls=[]; const g2=T.spawnFoe('gnasher',0,1); T.update(.001); T.hurt(g2,9999); out.anc.outside=T.F.souls.length;
    /* the Keeper: its fall readies the Anchor; its core needs a cage before a tap takes it */
    T.F.cd.anchor=20; const kp=T.spawnFoe('boss',0,best.d); T.update(.001); kp.x=q[0]+(ax-q[0])*.3; kp.y=q[1]+(ay-q[1])*.3; T.hurt(kp,1e9);
    const core=T.F.souls.find(x=>x.core); out.keeper={core:!!core&&core.max===15, cd:T.F.cd.anchor};
    const rr=document.querySelector('#board').getBoundingClientRect(), tap=()=>document.querySelector('#board').dispatchEvent(new PointerEvent('pointerdown',{clientX:rr.left+core.x/T.COLS*rr.width,clientY:rr.top+core.y/T.ROWS*rr.height,bubbles:true}));
    tap(); out.keeper.uncaged=!T.run.roster.keeper;
    T.castAnchor(ax,ay); out.keeper.coreIn=T.inCage(core.x,core.y); tap(); out.keeper.taken=T.run.roster.keeper===1;
    }
    return out;});
  console.log(JSON.stringify(r));
  ok(r.kit.wards.includes('pylon')&&r.kit.wards.includes('coil')&&r.kit.rites.join()==='overload,anchor'&&r.kit.names.join()==='Arc Lamp,Lightning Rod'&&r.kit.salt===20,'the Galvanist builds pylons, Arc Lamps, Lightning Rods and keeps the coil',r.kit);
  ok(r.found&&r.grid.live===1&&!r.grid.p1dark&&!r.grid.p2dark,'two pylons, one in the lamp’s light, string a live wire',r.grid);
  ok(r.grid.lonely&&r.cut,'a pylon cut off from the mains is dead; taking the mains away cuts the rest',r);
  ok(r.shock.dmg>=12&&r.shock.stun>=.3&&r.shock.lit,'a wire shocks, stuns and lights what crosses it',r.shock);
  ok(r.shock.recharging&&r.shock.later,'then it recharges before it shocks again',r.shock);
  ok(r.over.oil===10&&r.over.heat>=.99&&r.over.dmg>=36,'Overload costs 2 oil, adds Heat, strikes at triple strength',r.over);
  ok(r.over.next===1&&r.over.fried===1&&r.over.p1gone&&r.over.p2dark,'run hot, it fries the hardest-worked pylon, and what it powered goes dark',r.over);
  ok(r.over.tooLow,'it won’t take the lamp’s last oil');
  ok(r.snapped,'a Behemoth snaps the wire for the wave');
  ok(r.rod.rods===1&&r.rod.linked&&r.rod.capped===2&&r.rod.fell===0,'a Lightning Rod plants, joins the grid, two at most, then falls',r.rod);
  ok(Math.abs(r.arc.light-2.7)<.01&&r.arc.offFrames>0&&r.arc.offFrames<30&&r.arc.buildOff===false,'the Arc Lamp shines brighter and flickers only in a wave',r.arc);
  ok(r.static.stun&&r.static.cd,'Static Burst stuns what comes close, then recharges',r.static);
  ok(r.anc.links===2&&r.anc.tris===1&&r.anc.cd===30&&r.anc.inside,'the Anchor links both pylons and closes a cage over the path',r.anc);
  ok(r.anc.caught&&r.anc.burnt&&r.anc.sigils===0,'a bindable death in the cage is caught, never a sigil, and the Anchor burns out',r.anc);
  ok(r.anc.captured===1&&Math.abs(r.anc.heat-.5)<.05,'tapping the cage captures it and vents 2 Heat',r.anc);
  ok(r.anc.outside===0,'outside a cage, the Galvanist gets nothing',r.anc);
  ok(r.keeper.core&&r.keeper.cd===0,'the Keeper leaves a core for 15 s and readies the Anchor',r.keeper);
  ok(r.keeper.uncaged&&r.keeper.coreIn&&r.keeper.taken,'its core is taken only inside a cage',r.keeper);
  ok(!errs.length,'no page errors',errs);
  fails.forEach(f=>console.log('FAIL '+f)); await b.close(); process.exitCode=fails.length?1:0;
})();
