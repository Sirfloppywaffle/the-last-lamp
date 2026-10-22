// Descents (Expansion 2, step 4): the descent frame and The Carry.
// - The door roll: only on the landings after floors 2, 3 and 4, on one door with no Trial, never a descent already walked;
//   pure (the same seed and landing give the same door), and the plain stair stays the default (some landings have none).
// - Taking it: the toll once, then The Carry on the shaft (real time), then the floor. Rewards land after the toll.
// - The headless hook: run The Carry, set the outcome, assert the reward (oil) and the cost (dread on the next floor).
// - The game itself: a thumb that never lifts, one that never holds, and one that plays it; 15 to 40 seconds, never over 45.
// - Touch: one thumb, pointercancel never fails it, the edges are left to the back swipe, the card shows 600 ms or more after
//   the last lift and goes on click, not pointerdown.
// - Saving: the checkpoint at its start; a reload plays it again from the top, with nothing lost or paid twice. Old saves load.
// - Taught: a tip on the door and on The Carry, a rules line, a Grimoire page. Developer practice saves nothing.
const {chromium}=require('playwright');
const fails=[]; const ok=(cond,msg,detail)=>{if(!cond)fails.push(msg+(detail!==undefined?' '+JSON.stringify(detail).slice(0,700):''));};
(async()=>{
  const b=await chromium.launch();
  const ctx=await b.newContext({viewport:{width:412,height:860},deviceScaleFactor:2,hasTouch:true,isMobile:true});
  const p=await ctx.newPage();
  const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.goto('file://'+process.argv[2]); await p.waitForTimeout(300);

  await p.evaluate(()=>{
    const T=__t;
    /* a run on floor f (0-based), cleared, at its fork, with the doors drawn as the game draws them */
    window.__fork=(seed,f)=>{
      T.newRun('lamplighter',0,{seed}); T.run.floor=f; T.beginFloor(null);
      T.F.foes=[]; T.F.queue=[]; T.F.wave=T.F.def.waves.length; T.F.phase='cleared'; T.openDraft(40,0);
      const d=T.F.draft; d.patron=null; d.relics=0; d.step='gift'; T.F.blocking.choices[0].fn();
      return T.F.draft;
    };
    /* give this landing a descent door, whatever the roll said, and take it */
    window.__takeCarry=(seed,f)=>{
      const d=__fork(seed,f); d.doors.forEach(x=>delete x.descent);
      const i=d.doors.findIndex(x=>!x.trial&&x.room!=='deep'); d.doors[i].descent='carry'; T.showLanding();
      const essBefore=T.run.ess, oilBefore=T.run.oil;
      T.chooseDoor(d,i);
      if(T.F.draft&&!T.F.draft.done)T.descend();
      return {essBefore,oilBefore};
    };
  });

  /* 1. the door roll */
  const roll=await p.evaluate(()=>{
    const T=__t, out={byFloor:{},trialClash:0,two:0,impure:0,seeds:0};
    for(let sd=1;sd<=160;sd++){
      for(const f of [0,1,2,3]){
        const d=__fork(sd,f), n=d.doors.filter(x=>x.descent).length;
        (out.byFloor[f]=out.byFloor[f]||[0,0])[n?1:0]++;
        if(n>1)out.two++;
        if(d.doors.some(x=>x.descent&&x.trial))out.trialClash++;
        /* pure: the same roll again gives the same doors */
        const again=T.seeded(T.SALT.descent,0,()=>{const dd=JSON.parse(JSON.stringify(d.doors)); dd.forEach(x=>delete x.descent); T.descentDoor(dd); return dd;});
        if(JSON.stringify(again)!==JSON.stringify(d.doors))out.impure++;
      }
    }
    /* never a descent already walked */
    T.newRun('lamplighter',0,{seed:5}); T.run.floor=1; T.run.descents=['carry']; let walked=0;
    for(let i=0;i<60;i++){const dd=[{room:'merchant'},{room:'shrine'},{room:'rest'}]; T.seeded(T.SALT.descent,i,()=>T.descentDoor(dd)); if(dd.some(x=>x.descent))walked++;}
    out.walked=walked;
    out.salt=T.SALT.descent===Math.max(...Object.values(T.SALT));
    return out;
  });
  ok(roll.byFloor[0][1]===0,'no descent on the landing after floor 1',roll.byFloor);
  for(const f of [1,2,3])ok(roll.byFloor[f][1]>0&&roll.byFloor[f][0]>0,`the landing after floor ${f+1} sometimes carries a descent, and sometimes doesn't`,roll.byFloor[f]);
  ok(!roll.two&&!roll.trialClash,'at most one descent door, and never on the Trial door',roll);
  ok(!roll.impure,'the descent roll is pure',roll.impure);
  ok(roll.walked===0,'a descent already walked is never offered again',roll.walked);
  ok(roll.salt,'the descent salt is the newest, at the end of SALT');

  /* 2. the door says so, with its glyph */
  const door=await p.evaluate(()=>{
    const T=__t; T.tutSet({walk:'done',seen:[],off:false});
    const d=__fork(77,1); d.doors.forEach(x=>delete x.descent); const i=d.doors.findIndex(x=>!x.trial); d.doors[i].descent='carry'; T.showLanding();
    const btn=document.querySelectorAll('#mChoices .choice')[i];
    const o={tag:btn.querySelector('.tg').textContent,glyph:!!btn.querySelector('.tg svg.dsc-glyph'),cls:btn.className,sub:btn.textContent,
      tip:(document.querySelector('#mBody .dsc-tip')||{}).textContent||''};
    T.tutSet({walk:'done',seen:[],off:true});
    return o;
  });
  ok(/Descent: The Carry/.test(door.tag)&&door.glyph&&/dsc-door/.test(door.cls),'a descent door carries the glyph and says which descent',door);
  ok(/oil/.test(door.sub)&&/dread/.test(door.sub),'the door says what it pays and what it costs',door.sub);
  ok(/A descent/.test(door.tip)&&/never ends the run/.test(door.tip),'the first descent door comes with a tip on the landing',door.tip);

  /* 3. taking it: the toll once, The Carry, then the floor; the outcome sets the reward */
  await p.evaluate(()=>__t.setDescentAuto(null));
  const take=await p.evaluate(()=>{
    const T=__t, out={};
    const b0=__takeCarry(31,1);
    out.active=T.DESC.active; out.k=T.DESC.k; out.floor=T.run.floor; out.phase=T.DESC.phase;
    out.overlay=!document.getElementById('dscOverlay').hidden; out.map=T.MAP_SYS.active;
    out.tollPaid=T.run.ess<b0.essBefore; out.essMid=T.run.ess; out.oilMid=T.run.oil;
    out.saved=JSON.parse(localStorage.getItem('ll-save-v2')); out.saved={descent:out.saved.run.descent,floor:out.saved.run.floor,ess:out.saved.run.ess,towers:out.saved.towers.length,draft:out.saved.draft};
    out.descents=T.run.descents.slice();
    /* the outcome: two stumbles, one sleeper woken */
    T.run.oil=10; T.descentFinish({woke:1,spilt:2});
    out.after={active:T.DESC.active,overlay:!document.getElementById('dscOverlay').hidden,floor:T.run.floor,phase:T.F.phase,oil:T.run.oil,
      stipend:T.F.def.stipend,ess:T.run.ess,woke:T.run.woke,dread:T.wokeDread(),descent:T.run.descent,
      save:JSON.parse(localStorage.getItem('ll-save-v2')).run.descent};
    /* the woken are dread on this floor only */
    T.run.floor++; out.nextFloorDread=T.wokeDread(); T.run.floor--;
    return out;
  });
  ok(take.active&&take.k==='carry'&&take.overlay&&!take.map&&take.floor===2,'taking the door starts The Carry on the way to the next floor',take);
  ok(take.tollPaid,'the toll is paid before The Carry',take);
  ok(take.saved.descent&&take.saved.descent.k==='carry'&&take.saved.floor===2&&take.saved.ess===take.essMid&&take.saved.towers===0&&take.saved.draft===null,'the checkpoint is at The Carry’s start, after the toll',take.saved);
  ok(take.descents.join()==='carry','The Carry is marked walked',take.descents);
  ok(!take.after.active&&!take.after.overlay&&take.after.floor===2&&take.after.phase==='build','after The Carry the next floor begins',take.after);
  ok(take.after.oil===10+3,'two stumbles spill two of the five: three oil lands',take.after.oil);
  ok(take.after.ess===take.essMid+take.after.stipend,'the floor’s stipend lands once, after the toll; The Carry pays no essence',[take.essMid,take.after.ess,take.after.stipend]);
  ok(take.after.dread===1&&take.after.woke&&take.after.woke.n===1&&take.nextFloorDread===0,'one woken sleeper is 1 dread on the next floor, and only there',take);
  ok(take.after.descent===null&&!take.after.save,'the floor’s save no longer marks a descent',take.after);

  const fail=await p.evaluate(()=>{const T=__t; __takeCarry(32,2); T.run.oil=10; T.descentFinish({woke:3,spilt:0});
    const o={oil:T.run.oil,dread:T.wokeDread(),floor:T.run.floor,phase:T.F.phase,mad:T.madness()}; return o;});
  ok(fail.oil===10&&fail.dread===3&&fail.floor===3&&fail.phase==='build','failing (three woken) loses the flask, costs 3 dread, and never ends the run',fail);
  const res=await p.evaluate(()=>{const R=__t.carryResult; return [R({woke:0,spilt:0}),R({woke:2,spilt:9}),R({woke:3,spilt:0}),R({})];});
  ok(res[0].oil===5&&res[0].mad===0&&!res[0].fail&&res[1].oil===0&&res[1].mad===2&&!res[1].fail&&res[2].fail&&res[2].oil===0&&res[3].oil===5,'carryResult: 5 oil less 1 a stumble, 1 dread a sleeper, three woken fails',res);

  /* 4. the game: hold patterns, driven step by step */
  const sim=await p.evaluate(()=>{
    const T=__t, out={};
    const play=(seed,policy)=>{
      T.newRun('lamplighter',0,{seed}); T.run.floor=2; T.run.descent={k:'carry',f0:1,msg:''}; T.startDescent();
      const C=T.DESC; C.phase='walk';
      let n=0; while(C.phase==='walk'&&n<20000){C.held=policy(C); T.carryStep(1/30); n++;}
      const r={woke:C.woke,spilt:C.spilt,t:+C.t.toFixed(1),len:+C.len.toFixed(1)}; T.descentFinish({woke:0,spilt:0}); return r;
    };
    /* a careful thumb: hold while an unwoken sleeper is near the light's edge, lift otherwise */
    /* a careful thumb: hold while an unwoken sleeper is inside the light's ring, and lift for a breath when the ring round the
       flame runs low (a pair is too long to pass under one held breath) */
    const near=C=>C.sl.some(s=>!s.woke&&Math.hypot(s.x,s.y-C.pos)<1.8)&&C.blind<.9;
    out.never=[]; out.always=[]; out.careful=[]; out.lens=[];
    for(let sd=1;sd<=40;sd++){out.never.push(play(sd,()=>false)); out.always.push(play(sd,()=>true)); out.careful.push(play(sd,near));}
    for(let sd=1;sd<=300;sd++){T.newRun('lamplighter',0,{seed:sd}); T.run.floor=2+sd%3; out.lens.push(T.seeded(T.SALT.descent,1,T.carryLayout).len);}
    /* the same stair lays out the same gallery */
    T.newRun('lamplighter',0,{seed:99}); T.run.floor=2; const a=JSON.stringify(T.seeded(T.SALT.descent,1,T.carryLayout)), a2=JSON.stringify(T.seeded(T.SALT.descent,1,T.carryLayout));
    out.sameLayout=a===a2;
    return out;
  });
  const avg=(a,k)=>a.reduce((s,x)=>s+x[k],0)/a.length;
  ok(sim.never.every(r=>r.woke>=3),'a flame never cupped wakes the gallery',sim.never.slice(0,5));
  ok(sim.always.every(r=>r.spilt>=4),'a thumb that never lifts stumbles again and again',sim.always.slice(0,5));
  ok(avg(sim.careful,'woke')<1.2&&avg(sim.careful,'spilt')<1&&sim.careful.filter(r=>r.woke>=3).length<=4,'a careful thumb gets through mostly clean',{woke:avg(sim.careful,'woke'),spilt:avg(sim.careful,'spilt'),fails:sim.careful.filter(r=>r.woke>=3).length});
  const all=sim.never.concat(sim.always,sim.careful);
  ok(all.every(r=>r.t>=15&&r.t<=45),'every Carry lasts 15 to 45 seconds',all.map(r=>r.t).filter(t=>t<15||t>45));
  ok(sim.careful.every(r=>r.t<=40),'played well, it lasts 40 seconds or less',sim.careful.map(r=>r.t).filter(t=>t>40));
  ok(Math.min(...sim.lens)>=18&&Math.max(...sim.lens)<=36,'every gallery is 18 to 36 tiles long',[Math.min(...sim.lens),Math.max(...sim.lens)]);
  ok(sim.sameLayout,'a stair lays out the same gallery every time');
  console.log('carry: careful woke',avg(sim.careful,'woke').toFixed(2),'spilt',avg(sim.careful,'spilt').toFixed(2),'secs',avg(sim.careful,'t').toFixed(1),
    '| never woke',avg(sim.never,'woke').toFixed(1),'| always spilt',avg(sim.always,'spilt').toFixed(1),'| gallery',Math.min(...sim.lens).toFixed(1),'-',Math.max(...sim.lens).toFixed(1));

  /* 5. touch, for real: a thumb held and lifted, a cancelled touch, the edges, the card */
  await p.evaluate(()=>{const T=__t; T.tutSet({walk:'done',seen:[],off:true}); __takeCarry(41,1);});
  await p.waitForTimeout(150);
  const cdp=await ctx.newCDPSession(p);
  const touch=async(type,x,y,id=1)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:type==='touchEnd'||type==='touchCancel'?[]:[{x,y,id}]});
  await touch('touchStart',206,650); await p.waitForTimeout(400);
  const held=await p.evaluate(()=>({held:__t.DESC.held,cup:__t.DESC.cup,prompt:document.getElementById('dscPrompt').className}));
  await p.screenshot({path:(process.argv[3]||'.')+'/carry-held.png'});
  await touch('touchCancel'); await p.waitForTimeout(100);
  const cancelled=await p.evaluate(()=>({held:__t.DESC.held,active:__t.DESC.active,phase:__t.DESC.phase,spilt:__t.DESC.spilt,woke:__t.DESC.woke}));
  ok(held.held&&held.cup>.5&&/is-gone/.test(held.prompt),'a thumb held anywhere cups the flame, and the prompt goes',held);
  ok(!cancelled.held&&cancelled.active&&cancelled.phase==='walk'&&!cancelled.spilt&&!cancelled.woke,'a cancelled touch only lifts: nothing fails',cancelled);
  await touch('touchStart',8,500); await p.waitForTimeout(120);
  const edge=await p.evaluate(()=>__t.DESC.held); await touch('touchEnd'); await p.waitForTimeout(50);
  ok(!edge,'a touch starting at the very edge (the back swipe) does not cup the flame');
  /* walk it to the end with the thumb down, then lift: the card waits 600 ms after the lift */
  await touch('touchStart',206,650); await p.waitForTimeout(100);
  await p.evaluate(()=>{const C=__t.DESC; C.pos=C.len+.01; C.blind=0;}); await p.waitForTimeout(900);
  const heldEnd=await p.evaluate(()=>({phase:__t.DESC.phase,card:!document.getElementById('dscCardWrap').hidden}));
  ok(heldEnd.phase==='out'&&!heldEnd.card,'while the thumb is still down at the end, no card',heldEnd);
  await touch('touchEnd'); const lifted=Date.now();
  await p.waitForFunction(()=>!document.getElementById('dscCardWrap').hidden,null,{timeout:4000});
  const waited=Date.now()-lifted;
  ok(waited>=580,'the result card shows 600 ms or more after the last lift',waited);
  await p.screenshot({path:(process.argv[3]||'.')+'/carry-card.png'});
  const box=await p.evaluate(()=>{const r=document.getElementById('dscCard').getBoundingClientRect(); return [r.left,r.top,r.right,r.bottom].map(Math.round);});
  await touch('touchStart',(box[0]+box[2])/2,(box[1]+box[3])/2); await p.waitForTimeout(80);
  const onDown=await p.evaluate(()=>__t.DESC.active);
  await touch('touchEnd'); await p.waitForTimeout(200);
  const onClick=await p.evaluate(()=>({active:__t.DESC.active,floor:__t.run.floor,phase:__t.F.phase,overlay:!document.getElementById('dscOverlay').hidden}));
  ok(onDown,'the card stays through pointerdown');
  ok(!onClick.active&&!onClick.overlay&&onClick.floor===2&&onClick.phase==='build','the card goes on click, and the floor begins',onClick);

  /* 6. resume in the middle: it plays again from the top, nothing lost or paid twice */
  const resume=await p.evaluate(()=>{
    const T=__t, out={}, J=o=>JSON.parse(JSON.stringify(o));
    __takeCarry(55,2);
    const save=J(JSON.parse(localStorage.getItem('ll-save-v2'))), lay=JSON.stringify(T.DESC.sl.map(s=>[s.x,s.y,s.v])), ess=T.run.ess, oil=T.run.oil;
    /* half-way, a sleeper woken, a stumble; then the page is gone */
    T.DESC.pos=10; T.DESC.woke=1; T.DESC.spilt=1; T.DESC.sl[0].woke=true;
    T.resumeFrom(save);
    out.restart={active:T.DESC.active,pos:T.DESC.pos,woke:T.DESC.woke,spilt:T.DESC.spilt,sameLayout:JSON.stringify(T.DESC.sl.map(s=>[s.x,s.y,s.v]))===lay,
      awake:T.DESC.sl.filter(s=>s.woke).length,ess:T.run.ess===ess,oil:T.run.oil===oil,floor:T.run.floor,descents:T.run.descents.join()};
    /* resume twice more for luck, then finish */
    T.resumeFrom(save); T.resumeFrom(save);
    T.descentFinish({woke:0,spilt:0});
    out.done={floor:T.run.floor,ess:T.run.ess,want:ess+T.F.def.stipend,oil:T.run.oil,wantOil:Math.min(T.run.oilMax,oil+5),descents:T.run.descents.join(),phase:T.F.phase};
    /* an old save (no descents at all) still loads and plays */
    const old=J(save); delete old.run.descent; delete old.run.descents; old.towers=[]; T.resumeFrom(old);
    out.old={active:T.DESC.active,phase:T.F.phase,floor:T.run.floor};
    /* a save whose descent this build doesn't know begins its floor */
    const odd=J(save); odd.run.descent={k:'nonesuch',f0:2,msg:''}; T.resumeFrom(odd);
    out.odd={active:T.DESC.active,phase:T.F.phase,floor:T.run.floor,descent:T.run.descent};
    return out;
  });
  ok(resume.restart.active&&resume.restart.pos===0&&!resume.restart.woke&&!resume.restart.spilt&&!resume.restart.awake&&resume.restart.sameLayout,'a reload mid-Carry starts it again from the top, the same gallery, nobody awake',resume.restart);
  ok(resume.restart.ess&&resume.restart.oil&&resume.restart.floor===3&&resume.restart.descents==='carry','nothing is lost on the reload: the same essence, oil and floor',resume.restart);
  ok(resume.done.floor===3&&resume.done.ess===resume.done.want&&resume.done.oil===resume.done.wantOil&&resume.done.descents==='carry'&&resume.done.phase==='build','after three reloads, the toll, stipend and flask each landed once',resume.done);
  ok(!resume.old.active&&resume.old.phase==='build','an old save without descents loads and plays',resume.old);
  ok(!resume.odd.active&&resume.odd.phase==='build'&&resume.odd.floor===3&&resume.odd.descent===null,'a save with a descent this build doesn’t know begins its floor',resume.odd);

  /* 7. the first time, a tip card holds The Carry until it is read */
  const tip=await p.evaluate(async()=>{
    const T=__t; T.tutSet({walk:'done',seen:[],off:false});
    __takeCarry(61,1);
    const o={phase:T.DESC.phase,card:!document.getElementById('dscCardWrap').hidden,text:document.getElementById('dscCard').textContent};
    T.carryStep(.5); o.still=T.DESC.pos===0;
    document.getElementById('dscCard').click();
    o.after=T.DESC.phase; o.seen=!T.tipFresh('carry');
    T.descentFinish({woke:0,spilt:0});
    __takeCarry(62,2); o.second=T.DESC.phase; T.descentFinish({woke:0,spilt:0});
    T.tutSet({walk:'done',seen:[],off:true});
    return o;
  });
  ok(tip.phase==='tip'&&tip.card&&/cup the flame/.test(tip.text)&&tip.still,'the first Carry waits behind its tip',tip);
  ok(tip.after==='walk'&&tip.seen&&tip.second==='walk','tapping the tip starts the walk, and it is not shown again',tip);

  /* 8. taught: rules line, the dread line, the Grimoire's Descents page */
  const teach=await p.evaluate(()=>{
    const T=__t; T.newRun('lamplighter',0,{seed:3}); T.run.descents=['carry'];
    const rules=document.getElementById('rulesList').textContent;
    T.openBook('hud','descents');
    const o={rules:/Descents\./.test(rules)&&/The Carry:/.test(rules),dread:/sleeper you wake on The Carry/.test(rules),
      tabs:[...document.querySelectorAll('[data-book]')].map(x=>x.textContent),names:[...document.querySelectorAll('.book-e b')].map(x=>x.textContent),
      text:(document.querySelector('.book-list')||{}).textContent||'',icon:(()=>{const cv=document.querySelector('canvas[data-dicon]'); if(!cv)return 0; const d=cv.getContext('2d').getImageData(0,0,72,72).data; let n=0; for(let i=3;i<d.length;i+=4)if(d[i])n++; return n;})()};
    T.resumeFrom(JSON.parse(localStorage.getItem('ll-save-v2')));
    return o;
  });
  ok(teach.rules&&teach.dread,'"How the dark works" has a Descents line, and the Dread line names the woken',teach);
  ok(teach.tabs.includes('Descents')&&teach.names.includes('The Carry')&&/Pays:/.test(teach.text)&&/Walked this descent/.test(teach.text)&&teach.icon>500,'the Grimoire has a Descents page with The Carry on it, painted',teach);

  /* 9. developer practice: it pays and saves nothing (rule 24) */
  const dev=await p.evaluate(()=>{
    const T=__t; T.newRun('whaler',0,{seed:8}); T.run.floor=1; T.beginFloor(null); T.setP(false);
    const before={save:localStorage.getItem('ll-save-v2'),oil:T.run.oil,floor:T.run.floor,descents:JSON.stringify(T.run.descents||null),tut:localStorage.getItem('ll-tut')};
    const r=T.DEV_ACTS.descent('carry');
    const mid=T.DESC.active&&T.DESC.practice;
    T.DESC.woke=1; T.descentFinish();
    return {r,mid,same:localStorage.getItem('ll-save-v2')===before.save&&T.run.oil===before.oil&&T.run.floor===before.floor&&JSON.stringify(T.run.descents||null)===before.descents&&!T.run.woke,
      modal:document.getElementById('mTitle').textContent,body:document.getElementById('mBody').textContent};
  });
  ok(dev.r===null&&dev.mid&&dev.same&&dev.modal==='Developer'&&/practised/.test(dev.body),'developer mode practises The Carry and keeps nothing',dev);

  /* 10. painted: the light, a sleeper and the flame show; the Lite path and a stumble draw without error */
  await p.evaluate(()=>{const T=__t; T.newRun('lamplighter',0,{seed:12}); T.run.floor=2; T.run.descent={k:'carry',f0:1,msg:''}; T.startDescent(); const C=T.DESC; C.phase='walk'; C.pos=C.sl[0].y-1; C.sl[0].stir=.6; C.sl[1].woke=true; C.sl[1].wt=2;});
  await p.waitForTimeout(250);
  await p.screenshot({path:(process.argv[3]||'.')+'/carry-walk.png'});
  const lit=await p.evaluate(()=>{const cv=document.getElementById('dscCv'), c=cv.getContext('2d'), d=c.getImageData(0,0,cv.width,cv.height).data; let bright=0, warm=0;
    for(let i=0;i<d.length;i+=16){const l=d[i]+d[i+1]+d[i+2]; if(l>120)bright++; if(d[i]>180&&d[i+1]>120&&d[i+2]<140)warm++;} return {bright,warm,w:cv.width,h:cv.height};});
  ok(lit.bright>200&&lit.warm>20,'The Carry paints a lit stair and a warm flame',lit);
  await p.evaluate(()=>{const T=__t; T.setLite(true); T.DESC.stumble=.5; T.DESC.flash=1; T.DESC.blind=.8; T.DESC.held=true;});
  await p.waitForTimeout(200); await p.screenshot({path:(process.argv[3]||'.')+'/carry-lite-stumble.png'});
  await p.evaluate(()=>{const T=__t; T.setLite(false); T.descentFinish({woke:0,spilt:0}); T.setDescentAuto({woke:0,spilt:0});});

  ok(!errs.length,'no page errors',errs);
  await b.close();
  if(fails.length){fails.forEach(f=>console.log('FAIL '+f)); process.exit(1);}
  console.log('descents: ok');
})();
