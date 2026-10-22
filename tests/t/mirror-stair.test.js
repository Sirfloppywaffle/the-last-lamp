// The Mirror Stair (Expansion 2, step 5): the second descent, on the frame The Carry built.
// - The door: offered like The Carry, never one already walked; taking it pays the toll once, then the shaft, then the floor.
// - The headless hook: run it, set the outcome, assert the reward (a wider lamp until the first wave breaks) and the cost (a
//   narrower one for every sconce left dark). No embers. Failing never ends the run.
// - The game: two mirrors swing on the lantern, one per wall; a drag moves a mirror's spot of light up or down its wall. An idle
//   thumb lights nothing; a skilled one lights nearly all; one that trails the sconce clearly fewer. 15 to 40 s, never over 45.
// - Touch, for real: hold a side, drag, and follow a sconce up until it catches; a cancelled touch puts the mirror back and fails
//   nothing; the edges are left to the back swipe; the card shows 600 ms or more after the last lift and goes on click.
// - Saving: checkpoint at its start; a reload plays it again from the top, nothing lost or paid twice.
// - Taught: a tip card, a rules line, the Grimoire's Descents page. Developer practice keeps nothing. Lite and reduceMotion draw.
const {chromium}=require('playwright');
const fails=[]; const ok=(cond,msg,detail)=>{if(!cond)fails.push(msg+(detail!==undefined?' '+JSON.stringify(detail).slice(0,700):''));};
(async()=>{
  const b=await chromium.launch();
  const ctx=await b.newContext({viewport:{width:412,height:860},deviceScaleFactor:2,hasTouch:true,isMobile:true});
  const p=await ctx.newPage();
  const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.goto('file://'+process.argv[2]); await p.waitForTimeout(300);
  const shot=n=>p.screenshot({path:(process.argv[3]||'.')+'/'+n+'.png'});

  await p.evaluate(()=>{
    const T=__t;
    window.__fork=(seed,f)=>{
      T.newRun('lamplighter',0,{seed}); T.run.floor=f; T.beginFloor(null);
      T.F.foes=[]; T.F.queue=[]; T.F.wave=T.F.def.waves.length; T.F.phase='cleared'; T.openDraft(40,0);
      const d=T.F.draft; d.patron=null; d.relics=0; d.step='gift'; T.F.blocking.choices[0].fn();
      return T.F.draft;
    };
    /* give this landing a Mirror Stair door and take it */
    window.__takeMirror=(seed,f)=>{
      const d=__fork(seed,f); d.doors.forEach(x=>delete x.descent);
      const i=d.doors.findIndex(x=>!x.trial&&x.room!=='deep'); d.doors[i].descent='mirror'; T.showLanding();
      const essBefore=T.run.ess, oilBefore=T.run.oil, embers=T.meta.embers;
      T.chooseDoor(d,i);
      if(T.F.draft&&!T.F.draft.done)T.descend();
      return {essBefore,oilBefore,embers,door:i};
    };
    /* the shaft on screen, as the game lays it out, in CSS px */
    window.__geo=()=>{const r=document.getElementById('dscOverlay').getBoundingClientRect(), K=T.MIRK, u=T.mirrorU(r.width,r.height);
      return {u,cx:r.width/2,fy:r.height*K.FY,w:r.width,h:r.height};};
  });

  /* 1. the door: both descents offered at the landings, The Mirror Stair says what it pays and costs */
  const door=await p.evaluate(()=>{
    const T=__t, kinds={};
    for(let sd=1;sd<=120;sd++)for(const f of [1,2,3]){const d=__fork(sd,f); for(const x of d.doors)if(x.descent)kinds[x.descent]=(kinds[x.descent]||0)+1;}
    const d=__fork(77,1); d.doors.forEach(x=>delete x.descent); const i=d.doors.findIndex(x=>!x.trial); d.doors[i].descent='mirror'; T.showLanding();
    const btn=document.querySelectorAll('#mChoices .choice')[i];
    return {kinds,tag:btn.querySelector('.tg').textContent,glyph:!!btn.querySelector('.tg svg.dsc-glyph'),sub:btn.textContent};
  });
  ok(door.kinds.carry>20&&door.kinds.mirror>20,'both descents are offered on the landings, about as often',door.kinds);
  ok(/Descent: Mirror Stair/.test(door.tag)&&door.glyph,'a Mirror Stair door carries the glyph and says which descent',door);
  ok(/widens the lamp/.test(door.sub)&&/stays dark/.test(door.sub),'the door says what it pays and what it costs',door.sub);

  /* 2. taking it: toll once, the shaft, the floor; the outcome sets the lamp for the first wave */
  await p.evaluate(()=>__t.setDescentAuto(null));
  const take=await p.evaluate(()=>{
    const T=__t, out={};
    const b0=__takeMirror(31,1);
    out.active=T.DESC.active; out.k=T.DESC.k; out.floor=T.run.floor; out.overlay=!document.getElementById('dscOverlay').hidden;
    out.hud=document.getElementById('dscHud').textContent; out.prompt=document.getElementById('dscPrompt').textContent;
    out.tollPaid=T.run.ess<b0.essBefore; out.essMid=T.run.ess;
    const sv=JSON.parse(localStorage.getItem('ll-save-v2')); out.saved={descent:sv.run.descent,floor:sv.run.floor,ess:sv.run.ess,towers:sv.towers.length,draft:sv.draft};
    out.descents=T.run.descents.slice();
    T.descentFinish({lit:5,dark:2});
    const base=(()=>{const g=T.run.glow; T.run.glow=null; const v=T.lampBase(); T.run.glow=g; return v;})();
    out.after={active:T.DESC.active,floor:T.run.floor,phase:T.F.phase,glow:T.run.glow,ess:T.run.ess,stipend:T.F.def.stipend,
      lamp:+(T.lampBase()-base).toFixed(2),embers:T.meta.embers,embersBefore:b0.embers,descent:T.run.descent};
    /* the floor-start save carries the glow, so a resume before the first wave keeps it */
    out.floorSave=JSON.parse(localStorage.getItem('ll-save-v2')).run.glow;
    /* the first wave breaks: the glow goes, the lamp is as it was */
    T.F.wave=1; T.F.phase='wave'; T.waveCleared(); out.afterWave={glow:T.run.glow,lamp:+(T.lampBase()-base).toFixed(2)};
    /* and a glow never reaches the floor after */
    T.run.glow={floor:T.run.floor-1,r:1.4}; out.stale=T.sconceGlow(); T.run.glow=null;
    return out;
  });
  ok(take.active&&take.k==='mirror'&&take.overlay&&take.floor===2,'taking the door starts The Mirror Stair on the way to the next floor',take);
  ok(/Lit\s*0\s*of\s*7/.test(take.hud)&&/Dark\s*0/.test(take.hud)&&/mirror/.test(take.prompt),'its counts and prompt are its own, not The Carry’s',[take.hud,take.prompt]);
  ok(take.tollPaid&&take.saved.descent&&take.saved.descent.k==='mirror'&&take.saved.ess===take.essMid&&take.saved.towers===0&&take.saved.draft===null,'the toll is paid first, and the checkpoint is at its start',take.saved);
  ok(take.descents.join()==='mirror','The Mirror Stair is marked walked',take.descents);
  ok(!take.after.active&&take.after.floor===2&&take.after.phase==='build'&&take.after.descent===null,'after the shaft the next floor begins',take.after);
  ok(take.after.glow&&take.after.glow.r===.6&&take.after.lamp===.6,'five lit and two dark: the lamp burns 0.6 wider',take.after);
  ok(take.after.ess===take.essMid+take.after.stipend,'the stipend lands once, after the toll; the shaft pays no essence',take.after);
  ok(take.after.embers===take.after.embersBefore,'the shaft leaves no embers',take.after);
  ok(take.floorSave&&take.floorSave.r===.6,'the floor’s own save keeps the glow until the first wave',take.floorSave);
  ok(take.afterWave.glow===null&&take.afterWave.lamp===0,'when the first wave breaks the lamp burns as it did',take.afterWave);
  ok(take.stale===0,'a glow never carries to the floor after');

  const fail=await p.evaluate(()=>{const T=__t; __takeMirror(32,2); const oil=T.run.oil; T.descentFinish({lit:2,dark:5});
    const g=T.run.glow; T.run.glow=null; const base=T.lampBase(); T.run.glow=g;
    return {glow:T.run.glow,lamp:+(T.lampBase()-base).toFixed(2),floor:T.run.floor,phase:T.F.phase,oil:T.run.oil===oil};});
  ok(fail.glow&&fail.glow.r===-.6&&fail.lamp===-.6&&fail.floor===3&&fail.phase==='build'&&fail.oil,'failing (five dark) narrows the lamp 0.6 for the first wave, and never ends the run',fail);
  const res=await p.evaluate(()=>{const R=__t.mirrorResult, L=__t.mirrorLine; return {r:[R({lit:7,dark:0}),R({lit:4,dark:3}),R({lit:3,dark:4}),R({}),R({woke:0,spilt:0}),R({lit:9,dark:9})],
    lines:[L(R({lit:7,dark:0}),true),L(R({lit:2,dark:5}),true),L(R({lit:0,dark:7}),false),L(R({lit:6,dark:1}),false)]};});
  ok(res.r[0].glow===1.4&&!res.r[0].fail&&res.r[1].glow===.2&&!res.r[1].fail&&res.r[2].glow===-.2&&res.r[2].fail&&res.r[3].lit===7&&res.r[4].glow===1.4&&res.r[5].lit+res.r[5].dark===7,
    'mirrorResult: a fifth of a tile a sconce lit, a fifth taken a sconce dark; three of seven fails; a clean settle lights all',res.r);
  ok(res.lines.every(l=>!/undefined|NaN/.test(l))&&/1.4 tiles wider/.test(res.lines[0])&&/smaller/.test(res.lines[1])&&/smaller/.test(res.lines[2])&&/a tile wider/.test(res.lines[3]),'its lines read right',res.lines);

  /* 3. the game, step by step: an idle thumb, a skilled one and a sloppy one. One thumb steers one mirror at a time: switching
     sides costs a moment, the thumb moves the spot only so fast, and a sloppy thumb wanders off the mark */
  const sim=await p.evaluate(()=>{
    const T=__t, K=T.MIRK, out={idle:[],skilled:[],sloppy:[],lens:[]};
    const play=(seed,thumb)=>{
      T.newRun('lamplighter',0,{seed}); T.run.floor=2; T.run.descent={k:'mirror',f0:1,msg:''}; T.startDescent();
      const C=T.DESC; C.phase='walk'; let n=0, hold=null, wait=0; const dt=1/30;
      while(C.phase==='walk'&&n<20000){
        if(thumb){
          /* the sconce that runs out of reach first, among those still cold and in reach */
          const tg=C.sc.filter(s=>!s.lit&&!s.dark&&s.y-C.pos<=K.SPOT[1]+K.TOL&&s.y-C.pos>=K.SPOT[0]-K.TOL).sort((a,b)=>a.y-b.y)[0];
          if(tg){const m=C.ms[tg.side>0?1:0];
            if(hold!==m){if(wait<=0&&hold)wait=thumb.sw; hold=hold||m; if(wait>0){wait-=dt; if(wait<=0)hold=m;}}
            /* a thumb that trails aims where the sconce was thumb.lag seconds ago, give or take a little shake */
            else{const want=tg.y-(C.pos-thumb.lag*K.SPEED)+thumb.err(C.t,seed), d=want-m.spot; m.spot=Math.max(K.SPOT[0],Math.min(K.SPOT[1],m.spot+Math.sign(d)*Math.min(Math.abs(d),thumb.v*dt)));}}}
        T.mirrorStep(dt); n++;
      }
      const r={lit:C.lit,dark:C.dark,t:+C.t.toFixed(1)}; T.descentFinish({}); return r;
    };
    const shake=(t,sd)=>.08*Math.sin(t*9+sd)+.05*Math.sin(t*23+sd*2);
    const skilled={sw:.25,v:8,lag:0,err:()=>0}, decent={sw:.35,v:6,lag:.15,err:shake}, sloppy={sw:.5,v:4,lag:.33,err:shake};
    out.decent=[];
    for(let sd=1;sd<=40;sd++){out.idle.push(play(sd,null)); out.skilled.push(play(sd,skilled)); out.decent.push(play(sd,decent)); out.sloppy.push(play(sd,sloppy));}
    for(let sd=1;sd<=300;sd++){T.newRun('lamplighter',0,{seed:sd}); T.run.floor=1+sd%3; out.lens.push(T.seeded(T.SALT.descent,2,T.mirrorLayout).len);}
    /* the same stair lays out the same shaft, and its own sub-stream leaves The Carry's gallery as it was */
    T.newRun('lamplighter',0,{seed:99}); T.run.floor=2;
    const a=JSON.stringify(T.seeded(T.SALT.descent,2,T.mirrorLayout)), a2=JSON.stringify(T.seeded(T.SALT.descent,2,T.mirrorLayout)), car=JSON.stringify(T.seeded(T.SALT.descent,1,T.carryLayout));
    out.same=a===a2&&a!==car;
    /* every shaft has one close pair on the same wall, and every other gap is wide */
    out.pairs=[...Array(200).keys()].map(i=>{T.newRun('lamplighter',0,{seed:1000+i}); T.run.floor=2; const sc=T.seeded(T.SALT.descent,2,T.mirrorLayout).sc;
      const g=sc.slice(1).map((s,j)=>[s.y-sc[j].y,s.side===sc[j].side]); const close=g.filter(x=>x[0]<K.GAP[0]); return close.length===1&&close[0][1];}).filter(x=>!x).length;
    /* the mirror turns by the Signal Mirror's rule: its beam, along mirrorOut, strikes the wall where its spot is */
    T.newRun('lamplighter',0,{seed:5}); T.run.floor=2; T.run.descent={k:'mirror',f0:1,msg:''}; T.startDescent();
    out.aim=[-1,0,1.2,2.5,3.4].map(sp=>{const m=T.DESC.ms[1]; m.spot=sp; T.mirrorAim(m); const k=(K.W-K.ARM[0])/m.ox; return +(K.ARM[1]+m.oy*k-sp).toFixed(6);});
    T.descentFinish({});
    return out;
  });
  const avg=(a,k)=>a.reduce((s,x)=>s+x[k],0)/a.length;
  ok(sim.idle.every(r=>r.lit===0&&r.dark===7),'an idle thumb lights nothing: a sconce slides through a still spot too fast to catch',sim.idle.slice(0,3));
  ok(avg(sim.skilled,'lit')>=6.5,'a skilled thumb lights nearly every sconce',avg(sim.skilled,'lit'));
  ok(avg(sim.decent,'lit')>=6,'a thumb that trails a little still lights most',avg(sim.decent,'lit'));
  ok(avg(sim.sloppy,'lit')<=avg(sim.skilled,'lit')-2,'a thumb that trails a third of a second behind lights clearly fewer: you have to lead it',{sloppy:avg(sim.sloppy,'lit'),skilled:avg(sim.skilled,'lit')});
  const all=sim.idle.concat(sim.skilled,sim.decent,sim.sloppy);
  ok(all.every(r=>r.t>=15&&r.t<=40),'every Mirror Stair lasts 15 to 40 seconds (never over 45)',all.map(r=>r.t).filter(t=>t<15||t>40));
  ok(Math.min(...sim.lens)>=20&&Math.max(...sim.lens)<=28,'every shaft is 20 to 28 tiles long',[Math.min(...sim.lens),Math.max(...sim.lens)]);
  ok(sim.same,'a stair lays out the same shaft every time, on its own sub-stream');
  ok(sim.pairs===0,'every shaft has one close pair, on the same wall',sim.pairs);
  ok(sim.aim.every(d=>Math.abs(d)<1e-4),'each mirror’s beam, turned by the Signal Mirror’s rule, strikes the wall at its spot',sim.aim);
  console.log('mirror: skilled lit',avg(sim.skilled,'lit').toFixed(2),'| decent lit',avg(sim.decent,'lit').toFixed(2),'| sloppy lit',avg(sim.sloppy,'lit').toFixed(2),'| secs',avg(sim.skilled,'t').toFixed(1),
    '| shaft',Math.min(...sim.lens).toFixed(1),'-',Math.max(...sim.lens).toFixed(1));

  /* 4. touch, for real: hold the sconce's side, drag the spot onto it, and follow it up until it catches */
  await p.evaluate(()=>{const T=__t; T.tutSet({walk:'done',seen:[],off:true}); __takeMirror(41,1); const C=T.DESC; C.pos=C.sc[0].y-2.6;});
  await p.waitForTimeout(150);
  const cdp=await ctx.newCDPSession(p);
  const touch=async(type,x,y,id=1)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:type==='touchEnd'||type==='touchCancel'?[]:[{x,y,id}]});
  const g=await p.evaluate(()=>__geo());
  const K=await p.evaluate(()=>__t.MIRK);
  const s0=await p.evaluate(()=>{const C=__t.DESC, s=C.sc[0]; return {side:s.side,spot0:C.ms[s.side>0?1:0].spot};});
  const tx=g.cx+s0.side*g.w*.25, ty0=g.fy+2*g.u;
  await touch('touchStart',tx,ty0); await p.waitForTimeout(40);
  let caught=false, mid=null;
  for(let k=0;k<120&&!caught;k++){
    const st=await p.evaluate(()=>{const C=__t.DESC, s=C.sc[0]; return {want:s.y-C.pos,lit:s.lit,heat:s.heat};});
    if(st.lit){caught=true; break;}
    if(!mid&&st.heat>.2){mid=true; await shot('mirror-aim');}
    await touch('touchMove',tx,ty0+(st.want-s0.spot0)*g.u/K.GAIN); await p.waitForTimeout(25);
  }
  const heldNow=await p.evaluate(sd=>{const C=__t.DESC; return {drag:!!C.drag,side:C.drag&&C.drag.m.side,prompt:document.getElementById('dscPrompt').className,lit:C.lit};},s0.side);
  ok(caught&&heldNow.drag&&heldNow.side===s0.side&&/is-gone/.test(heldNow.prompt)&&heldNow.lit===1,'held on its side and followed up, the spot catches the sconce',{caught,heldNow});
  await touch('touchEnd'); await p.waitForTimeout(80);
  const left=await p.evaluate(()=>{const C=__t.DESC; return {drag:!!C.drag,spots:C.ms.map(m=>m.spot)};});
  ok(!left.drag&&left.spots.some(sp=>sp!==K.REST),'a lift leaves the mirror where it was turned',left);
  await shot('mirror-lit');
  /* a cancelled touch puts the mirror back and fails nothing */
  const before=await p.evaluate(()=>({dark:__t.DESC.dark,lit:__t.DESC.lit,spot:__t.DESC.ms.map(m=>m.spot)}));
  const ox=g.cx-s0.side*g.w*.25;
  await touch('touchStart',ox,ty0); await touch('touchMove',ox,ty0+g.u*1.5); await p.waitForTimeout(60);
  const moved=await p.evaluate(()=>__t.DESC.ms.map(m=>m.spot));
  await touch('touchCancel'); await p.waitForTimeout(80);
  const cancelled=await p.evaluate(()=>({spot:__t.DESC.ms.map(m=>m.spot),drag:!!__t.DESC.drag,held:__t.DESC.held,phase:__t.DESC.phase,dark:__t.DESC.dark,lit:__t.DESC.lit}));
  ok(JSON.stringify(moved)!==JSON.stringify(before.spot)&&JSON.stringify(cancelled.spot)===JSON.stringify(before.spot)&&!cancelled.drag&&!cancelled.held&&cancelled.phase==='walk'&&cancelled.lit===before.lit,
    'a cancelled touch puts the mirror back where it was, and fails nothing',{before,moved,cancelled});
  await touch('touchStart',8,ty0); await p.waitForTimeout(80);
  const edge=await p.evaluate(()=>!!__t.DESC.drag); await touch('touchEnd'); await p.waitForTimeout(50);
  ok(!edge,'a touch starting at the very edge (the back swipe) turns no mirror');
  /* to the end with a thumb down: no card until it lifts, then 600 ms */
  await touch('touchStart',ox,ty0); await p.waitForTimeout(80);
  await p.evaluate(()=>{const C=__t.DESC; C.pos=C.len+.01;}); await p.waitForTimeout(900);
  const heldEnd=await p.evaluate(()=>({phase:__t.DESC.phase,card:!document.getElementById('dscCardWrap').hidden}));
  ok(heldEnd.phase==='out'&&!heldEnd.card,'while the thumb is still down at the end, no card',heldEnd);
  await touch('touchEnd'); const lifted=Date.now();
  await p.waitForFunction(()=>!document.getElementById('dscCardWrap').hidden,null,{timeout:4000});
  ok(Date.now()-lifted>=580,'the result card shows 600 ms or more after the last lift',Date.now()-lifted);
  await shot('mirror-card');
  const card=await p.evaluate(()=>({text:document.getElementById('dscCard').textContent,dark:__t.DESC.dark,lit:__t.DESC.lit}));
  ok(card.lit+card.dark===7&&card.lit>=1&&/sconces/.test(card.text)&&/Tap to go down to/.test(card.text),'the card says how many caught and what it means for the lamp',card);
  const box=await p.evaluate(()=>{const r=document.getElementById('dscCard').getBoundingClientRect(); return [r.left,r.top,r.right,r.bottom].map(Math.round);});
  await touch('touchStart',(box[0]+box[2])/2,(box[1]+box[3])/2); await p.waitForTimeout(80);
  const onDown=await p.evaluate(()=>__t.DESC.active);
  await touch('touchEnd'); await p.waitForTimeout(200);
  const onClick=await p.evaluate(()=>({active:__t.DESC.active,floor:__t.run.floor,phase:__t.F.phase,glow:__t.run.glow}));
  ok(onDown&&!onClick.active&&onClick.floor===2&&onClick.phase==='build'&&onClick.glow&&typeof onClick.glow.r==='number','the card stays through pointerdown and goes on click; the floor begins, the glow landed',onClick);

  /* 5. resume in the middle: it plays again from the top, nothing lost or paid twice */
  const resume=await p.evaluate(()=>{
    const T=__t, K=T.MIRK, out={}, J=o=>JSON.parse(JSON.stringify(o));
    __takeMirror(55,2);
    const save=J(JSON.parse(localStorage.getItem('ll-save-v2'))), lay=JSON.stringify(T.DESC.sc.map(s=>[s.side,s.y])), ess=T.run.ess, oil=T.run.oil;
    T.DESC.pos=9; T.DESC.lit=2; T.DESC.dark=1; T.DESC.sc[0].lit=true; T.DESC.ms[0].spot=3;
    T.resumeFrom(save);
    out.restart={active:T.DESC.active,k:T.DESC.k,pos:T.DESC.pos,lit:T.DESC.lit,dark:T.DESC.dark,same:JSON.stringify(T.DESC.sc.map(s=>[s.side,s.y]))===lay,
      cold:T.DESC.sc.every(s=>!s.lit&&!s.dark&&!s.heat),rest:T.DESC.ms.every(m=>m.spot===K.REST),ess:T.run.ess===ess,oil:T.run.oil===oil,floor:T.run.floor,glow:T.run.glow||null};
    T.resumeFrom(save); T.resumeFrom(save);
    T.descentFinish({lit:7,dark:0});
    out.done={floor:T.run.floor,ess:T.run.ess,want:ess+T.F.def.stipend,glow:T.run.glow,descents:T.run.descents.join(),phase:T.F.phase};
    /* a save from before The Mirror Stair (no glow, no descents) loads and plays */
    const old=J(save); delete old.run.descent; delete old.run.descents; delete old.run.glow; old.towers=[]; T.resumeFrom(old);
    out.old={active:T.DESC.active,phase:T.F.phase,glow:T.sconceGlow()};
    return out;
  });
  ok(resume.restart.active&&resume.restart.k==='mirror'&&resume.restart.pos===0&&!resume.restart.lit&&!resume.restart.dark&&resume.restart.same&&resume.restart.cold&&resume.restart.rest,'a reload mid-shaft starts it again from the top: the same sconces, all cold, both mirrors at rest',resume.restart);
  ok(resume.restart.ess&&resume.restart.oil&&resume.restart.floor===3&&resume.restart.glow===null,'nothing is lost or paid on the reload',resume.restart);
  ok(resume.done.floor===3&&resume.done.ess===resume.done.want&&resume.done.glow&&resume.done.glow.r===1.4&&resume.done.descents==='mirror'&&resume.done.phase==='build','after three reloads, the toll, stipend and glow each landed once',resume.done);
  ok(!resume.old.active&&resume.old.phase==='build'&&resume.old.glow===0,'an old save without a glow loads and plays',resume.old);

  /* 6. the first time, a tip card holds it until read */
  const tip=await p.evaluate(()=>{
    const T=__t; T.tutSet({walk:'done',seen:[],off:false});
    __takeMirror(61,1);
    const o={phase:T.DESC.phase,card:!document.getElementById('dscCardWrap').hidden,text:document.getElementById('dscCard').textContent};
    T.mirrorStep(.5); o.still=T.DESC.pos===0;
    document.getElementById('dscCard').click();
    o.after=T.DESC.phase; o.seen=!T.tipFresh('mirrorstair'); o.signal=T.tipFresh('mirror'); o.carryFresh=T.tipFresh('carry');
    T.descentFinish({});
    __takeMirror(62,2); o.second=T.DESC.phase; T.descentFinish({});
    T.tutSet({walk:'done',seen:[],off:true});
    return o;
  });
  ok(tip.phase==='tip'&&tip.card&&/drag up or down/.test(tip.text)&&/follow/.test(tip.text)&&tip.still,'the first Mirror Stair waits behind its tip',tip);
  ok(tip.after==='walk'&&tip.seen&&tip.signal&&tip.carryFresh&&tip.second==='walk','tapping the tip starts the shaft; it is not shown again, and The Carry and the Signal Mirror keep their own',tip);

  /* 7. taught: the rules line and the Grimoire's Descents page */
  const teach=await p.evaluate(()=>{
    const T=__t; T.newRun('lamplighter',0,{seed:3}); T.run.descents=['mirror'];
    const rules=document.getElementById('rulesList').textContent;
    T.openBook('hud','descents');
    const ents=[...document.querySelectorAll('.book-e')].map(e=>e.textContent);
    const cv=document.querySelector('canvas[data-dicon="mirror"]');
    let px=0; if(cv){const d=cv.getContext('2d').getImageData(0,0,cv.width,cv.height).data; for(let i=3;i<d.length;i+=4)if(d[i])px++;}
    const o={rules:/The Mirror Stair:/.test(rules)&&/first wave breaks/.test(rules)&&/swing/.test(rules),entry:ents.find(t=>/The Mirror Stair/.test(t))||'',px};
    T.resumeFrom(JSON.parse(localStorage.getItem('ll-save-v2')));
    return o;
  });
  ok(teach.rules,'"How the dark works" has a Mirror Stair line');
  ok(/Route/.test(teach.entry)&&/swing/.test(teach.entry)&&/Pays:/.test(teach.entry)&&/Costs:/.test(teach.entry)&&/Walked this descent/.test(teach.entry)&&teach.px>500,'the Grimoire’s Descents page has The Mirror Stair on it, painted',teach);

  /* 8. developer practice keeps nothing (rule 24) */
  const dev=await p.evaluate(()=>{
    const T=__t; T.newRun('whaler',0,{seed:8}); T.run.floor=1; T.beginFloor(null); T.setP(false);
    const before={save:localStorage.getItem('ll-save-v2'),floor:T.run.floor,descents:JSON.stringify(T.run.descents||null)};
    const r=T.DEV_ACTS.descent('mirror'); const mid=T.DESC.active&&T.DESC.practice&&T.DESC.k==='mirror';
    T.DESC.lit=3; T.descentFinish();
    return {r,mid,same:localStorage.getItem('ll-save-v2')===before.save&&T.run.floor===before.floor&&JSON.stringify(T.run.descents||null)===before.descents&&!T.run.glow,
      body:document.getElementById('mBody').textContent};
  });
  ok(dev.r===null&&dev.mid&&dev.same&&/Mirror Stair, practised/.test(dev.body),'developer mode practises The Mirror Stair and keeps nothing',dev);

  /* 9. painted: both beams strike the walls, a lit sconce and the lantern show; Lite and reduceMotion draw without error */
  await p.evaluate(()=>{const T=__t; T.newRun('lamplighter',0,{seed:12}); T.run.descent={k:'mirror',f0:1,msg:''}; T.run.floor=2; T.startDescent();
    const C=T.DESC; C.phase='walk'; const s=C.sc[0]; C.pos=s.y-1.2; C.ms[s.side>0?1:0].spot=1.2; C.ms[s.side>0?0:1].spot=2.6; s.lit=true; s.lt=1; C.lit=1;});
  await p.waitForTimeout(1000);
  await shot('mirror-walk');
  const lit=await p.evaluate(()=>{const cv=document.getElementById('dscCv'), d=cv.getContext('2d').getImageData(0,0,cv.width,cv.height).data; let bright=0, warm=0;
    for(let i=0;i<d.length;i+=16){const l=d[i]+d[i+1]+d[i+2]; if(l>300)bright++; if(d[i]>180&&d[i+1]>120&&d[i+2]<140)warm++;} return {bright,warm,lit:__t.DESC.sc[0].lit};});
  ok(lit.bright>200&&lit.warm>20&&lit.lit,'The Mirror Stair paints its beams, a lit sconce and the lantern',lit);
  await p.evaluate(()=>{const T=__t; T.setLite(true); const C=T.DESC; C.sc[2].dark=true; C.sc[2].lt=2;});
  await p.waitForTimeout(200); await shot('mirror-lite');
  await p.emulateMedia({reducedMotion:'reduce'}); await p.evaluate(()=>__t.setLite(false)); await p.waitForTimeout(200);
  await p.emulateMedia({reducedMotion:'no-preference'});
  await p.evaluate(()=>{const T=__t; T.descentFinish({}); T.setDescentAuto({woke:0,spilt:0});});

  ok(!errs.length,'no page errors',errs);
  await b.close();
  if(fails.length){fails.forEach(f=>console.log('FAIL '+f)); process.exit(1);}
  console.log('mirror-stair: ok');
})();
