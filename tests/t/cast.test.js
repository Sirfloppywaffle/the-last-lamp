// The Cast (Expansion 2, step 8; expansion/SEEDS-AND-MINI-FLOORS.md §5.3): the fourth descent, on the descent frame.
// - The door: offered like the others, never one walked; it says what it pays and costs. Taking it pays the toll once.
// - The headless hook: settle it, assert the reward (rite charges on the next floor, two at most) and the cost (a tenth of the
//   essence you arrive with for every line cast, caught or not). No embers. Failing never ends the run.
// - The game: a thumb that leads the swing and the rise catches nearly every time; one that throws straight at a ring catches
//   clearly fewer; an idle one catches none and pays nothing. 15 to 40 s, never over 45. Rings show only in the lantern's light.
// - Touch, for real: drag back and let go to cast; a slack pull or a cancel costs nothing; the edges are the back swipe's.
// - The charge: a rite still cooling casts at once, its own wait running on; a cast never made keeps the charge; it lasts one floor.
// - Saving: checkpoint at its start; a reload plays it again, nothing paid twice. Taught: tips, rules line, Grimoire, practice.
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
    window.__fork=(seed,f,kit)=>{
      T.newRun(kit||'lamplighter',0,{seed}); T.run.floor=f; T.beginFloor(null);
      T.F.foes=[]; T.F.queue=[]; T.F.wave=T.F.def.waves.length; T.F.phase='cleared'; T.openDraft(40,0);
      const d=T.F.draft; d.patron=null; d.relics=0; d.step='gift'; T.F.blocking.choices[0].fn();
      return T.F.draft;
    };
    window.__takeCast=(seed,f,ess)=>{
      const d=__fork(seed,f); d.doors.forEach(x=>{delete x.descent; delete x.horror;});
      const i=d.doors.findIndex(x=>!x.trial&&x.room!=='deep'); d.doors[i].descent='cast'; T.showLanding();
      if(ess!=null)T.run.ess=ess;
      const essBefore=T.run.ess, embers=T.meta.embers;
      T.chooseDoor(d,i);
      if(T.F.draft&&!T.F.draft.done)T.descend();
      return {essBefore,embers,door:i};
    };
    /* a thumb that plays it: when nothing is in the air, pick the ring that will rise out of reach first, and throw so the
       weight meets it where it will be. lead: allows for the swing; rise: allows for the ring rising while it flies; lag: the
       thumb lets go this long after it judged the throw; err: how far off the pull is. Each throw stays inside the pull */
    window.__thumb=o=>{
      const K=T.CASTK, C=T.DESC, vmax=K.POW*K.PULL;
      if(C.phase!=='walk'||C.wt||C.left<=0||C.caught>=K.MAX)return null;
      const t=C.t+(o.lag||0), x0=T.castSway(t), y0=K.HAND, sv=T.castSwayV(t);
      const live=C.rg.filter(r=>!r.caught&&r.y-C.pos>-2.3&&r.y-C.pos<2.2).sort((a,b)=>a.y-b.y);
      for(const r of live){
        let best=null;
        for(let F=.25;F<=.85;F+=.01){
          const tx=r.side*K.RX, ty=r.y-C.pos-(o.rise?K.SPEED*F:0)-(o.lag||0)*K.SPEED;
          const vx=(tx-x0)/F-(o.lead?sv:0), vy=(ty-y0-.5*K.G*F*F)/F, sp=Math.hypot(vx,vy);
          if(sp>vmax*.98)continue;
          if(Math.hypot(tx-x0,ty-y0)>=K.LINE-.05)continue;
          if(!best||sp<best.sp)best={vx,vy,sp};
        }
        if(best){const e=o.err?1+o.err():1; return [best.vx*e,best.vy*e];}
      }
      return null;
    };
  });

  /* 1. the door: offered among the descents at the landings, saying what it pays and costs */
  const door=await p.evaluate(()=>{
    const T=__t, kinds={};
    for(let sd=1;sd<=160;sd++)for(const f of [1,2,3]){const d=__fork(sd,f); for(const x of d.doors)if(x.descent)kinds[x.descent]=(kinds[x.descent]||0)+1;}
    const gal={}; for(let sd=1;sd<=60;sd++)for(const f of [1,2,3]){const d=__fork(sd,f,'galvanist'); for(const x of d.doors)if(x.descent)gal[x.descent]=(gal[x.descent]||0)+1;}
    const d=__fork(77,1); d.doors.forEach(x=>{delete x.descent; delete x.horror;}); const i=d.doors.findIndex(x=>!x.trial); d.doors[i].descent='cast'; T.showLanding();
    const btn=document.querySelectorAll('#mChoices .choice')[i];
    return {kinds,gal,tag:btn.querySelector('.tg').textContent,glyph:!!btn.querySelector('.tg svg.dsc-glyph'),sub:btn.textContent};
  });
  ok(door.kinds.cast>20&&door.kinds.carry>20&&door.kinds.mirror>20&&door.kinds.binding>10,'The Cast is offered on the landings alongside the other descents',door.kinds);
  ok(door.gal.cast>5&&!door.gal.binding,'The Cast is offered to the Galvanist too (he has a rite to charge); The Binding still is not',door.gal);
  ok(/Descent: The Cast/.test(door.tag)&&door.glyph,'a Cast door carries the glyph and says which descent',door);
  ok(/rite charge/.test(door.sub)&&/tenth of the essence/.test(door.sub),'the door says what it pays and what it costs',door.sub);

  /* 2. taking it: the toll once, the shaft, the floor; the outcome sets the charges and takes the weights */
  await p.evaluate(()=>__t.setDescentAuto(null));
  const take=await p.evaluate(()=>{
    const T=__t, K=T.CASTK, out={};
    const b0=__takeCast(31,1,300);
    out.active=T.DESC.active; out.k=T.DESC.k; out.floor=T.run.floor; out.overlay=!document.getElementById('dscOverlay').hidden;
    out.hud=document.getElementById('dscHud').textContent; out.prompt=document.getElementById('dscPrompt').textContent;
    out.essMid=T.run.ess; out.tithe=T.DESC.tithe; out.tollPaid=T.run.ess<b0.essBefore;
    const sv=JSON.parse(localStorage.getItem('ll-save-v2')); out.saved={descent:sv.run.descent,floor:sv.run.floor,ess:sv.run.ess,towers:sv.towers.length,draft:sv.draft};
    out.descents=T.run.descents.slice();
    T.descentFinish({caught:2,cast:3});
    out.after={active:T.DESC.active,floor:T.run.floor,phase:T.F.phase,charge:T.run.charge,ess:T.run.ess,stipend:T.F.def.stipend,charges:T.chargesNow(),
      embers:T.meta.embers,embersBefore:b0.embers,descent:T.run.descent,msg:document.getElementById('banner').textContent};
    out.floorSave=JSON.parse(localStorage.getItem('ll-save-v2')).run.charge;
    /* a charge never reaches the floor after */
    T.run.charge={floor:T.run.floor-1,n:2}; out.stale=T.chargesNow(); T.run.charge=null;
    return out;
  });
  ok(take.active&&take.k==='cast'&&take.overlay&&take.floor===2,'taking the door starts The Cast on the way to the next floor',take);
  ok(/Rings\s*0\s*of\s*2/.test(take.hud)&&/Lines\s*3/.test(take.hud)&&new RegExp(take.tithe+'\\s*each').test(take.hud)&&/Drag back/.test(take.prompt),'its counts show the rings, the lines and what each weighs',[take.hud,take.prompt]);
  ok(take.tollPaid&&take.tithe===Math.round(take.essMid*.1)&&take.saved.descent&&take.saved.descent.k==='cast'&&take.saved.ess===take.essMid&&take.saved.towers===0&&take.saved.draft===null,
    'the toll is paid first, a line weighs a tenth of what is left, and the checkpoint is at its start',{take:take.saved,tithe:take.tithe,mid:take.essMid});
  ok(take.descents.join()==='cast','The Cast is marked walked',take.descents);
  ok(!take.after.active&&take.after.floor===2&&take.after.phase==='build'&&take.after.descent===null,'after the shaft the next floor begins',take.after);
  ok(take.after.charge&&take.after.charge.n===2&&take.after.charges===2,'two rings caught: two rite charges on the next floor',take.after);
  ok(take.after.ess===take.essMid-3*take.tithe+take.after.stipend,'three lines cast: three tenths taken once, after the toll; the stipend lands as ever',take.after);
  ok(take.after.embers===take.after.embersBefore,'the shaft leaves no embers',take.after);
  ok(take.floorSave&&take.floorSave.n===2,'the floor’s own save keeps the charges',take.floorSave);
  ok(take.stale===0,'charges never carry to the floor after');

  const res=await p.evaluate(()=>{const T=__t; __takeCast(32,2,200); const tithe=T.DESC.tithe, mid=T.run.ess, oil=T.run.oil;
    const R=T.castResult, L=T.castLine;
    const r={r:[R({caught:0,cast:3}),R({caught:3,cast:3}),R({caught:1,cast:0}),R({}),R({woke:0,spilt:0}),R({caught:0,cast:0})]};
    r.lines=[L(r.r[0],true),L(r.r[1],true),L(r.r[5],true),L(r.r[0],false),L(r.r[1],false),L(R({caught:1,cast:2}),false),L(r.r[5],false)];
    T.descentFinish({caught:0,cast:3});
    r.fail={charge:T.run.charge,ess:T.run.ess-T.F.def.stipend,want:mid-3*tithe,floor:T.run.floor,phase:T.F.phase,oil:T.run.oil===oil};
    return r;});
  ok(res.fail.charge===null&&res.fail.ess===res.fail.want&&res.fail.floor===3&&res.fail.phase==='build'&&res.fail.oil,'three lines and nothing caught: the weights are paid, no charge, and the run goes on',res.fail);
  ok(res.r[0].fail&&res.r[0].spent>0&&res.r[1].charges===2&&res.r[1].caught===3&&res.r[2].lines===1&&res.r[3].charges===2&&res.r[3].lines===2&&res.r[4].charges===2&&res.r[5].fail&&res.r[5].spent===0,
    'castResult: two charges at most; a ring caught took a line; a clean settle catches two with two; casting nothing costs nothing',res.r);
  ok(res.lines.every(l=>!/undefined|NaN/.test(l))&&/fell short/.test(res.lines[0])&&/two rite charges/.test(res.lines[1])&&/let the rings go by/.test(res.lines[2])&&/caught nothing/.test(res.lines[3])&&/a rite charge/.test(res.lines[5]),'its lines read right',res.lines);

  /* 3. the game, step by step: idle, skilled, decent and straight-at-it thumbs, over many stairs */
  const sim=await p.evaluate(()=>{
    const T=__t, K=T.CASTK, out={idle:[],skilled:[],decent:[],naive:[],lens:[]};
    const play=(seed,o)=>{
      T.newRun('lamplighter',0,{seed}); T.run.floor=2; T.run.ess=200; T.run.descent={k:'cast',f0:1,msg:''}; T.startDescent();
      const C=T.DESC; C.phase='walk'; let n=0, pend=null; const dt=1/30;
      while(C.phase==='walk'&&n<20000){
        if(o){if(pend&&C.t>=pend.at){T.castThrow(pend.v[0],pend.v[1]); pend=null;}
          else if(!pend){const v=__thumb(o); if(v)pend={v,at:C.t+(o.lag||0)};}}
        T.castStep(dt); n++;
      }
      const r={caught:C.caught,cast:C.cast,t:+C.t.toFixed(1)}; T.descentFinish({caught:C.caught,cast:C.cast}); return r;
    };
    let sd0=0; const noise=()=>{sd0=(sd0*1103515245+12345)%2147483648; return (sd0/2147483648-.5)*.12;};
    for(let sd=1;sd<=40;sd++){out.idle.push(play(sd,null)); out.skilled.push(play(sd,{lead:1,rise:1}));
      out.decent.push(play(sd,{lead:1,rise:1,lag:.12,err:noise})); out.naive.push(play(sd,{}));}
    for(let sd=1;sd<=300;sd++){T.newRun('lamplighter',0,{seed:sd}); T.run.floor=1+sd%3; out.lens.push(T.seeded(T.SALT.descent,6,T.castLayout).len);}
    T.newRun('lamplighter',0,{seed:99}); T.run.floor=2;
    const a=JSON.stringify(T.seeded(T.SALT.descent,6,T.castLayout)), a2=JSON.stringify(T.seeded(T.SALT.descent,6,T.castLayout)), mir=JSON.stringify(T.seeded(T.SALT.descent,2,T.mirrorLayout));
    out.same=a===a2&&a!==mir;
    return out;
  });
  const avg=(a,k)=>a.reduce((s,x)=>s+x[k],0)/a.length;
  ok(sim.idle.every(r=>r.caught===0&&r.cast===0),'an idle thumb casts nothing, catches nothing and pays nothing',sim.idle.slice(0,3));
  ok(avg(sim.skilled,'caught')>=1.9,'a thumb that leads the swing and the rise catches two nearly every time',avg(sim.skilled,'caught'));
  ok(avg(sim.decent,'caught')>=1.4,'a thumb a little late and a little off still catches most',avg(sim.decent,'caught'));
  ok(avg(sim.naive,'caught')<=avg(sim.skilled,'caught')-.6,'a thumb that throws straight at a ring catches clearly fewer: you have to lead it',{naive:avg(sim.naive,'caught'),skilled:avg(sim.skilled,'caught')});
  const all=sim.idle.concat(sim.skilled,sim.decent,sim.naive);
  ok(all.every(r=>r.t<=40),'every Cast lasts no more than 40 seconds (never over 45); one ends early when its lines are spent or two rings are caught',all.map(r=>r.t).filter(t=>t>40));
  ok(sim.idle.every(r=>r.t>=15),'the whole shaft, with nothing caught, lasts 15 seconds or more',sim.idle.map(r=>r.t));
  ok(sim.same,'a stair hangs the same rings every time, on its own sub-stream');
  console.log('cast: skilled',avg(sim.skilled,'caught').toFixed(2),'| decent',avg(sim.decent,'caught').toFixed(2),'| naive',avg(sim.naive,'caught').toFixed(2),
    '| secs idle',avg(sim.idle,'t').toFixed(1),'skilled',avg(sim.skilled,'t').toFixed(1),'| lines skilled',avg(sim.skilled,'cast').toFixed(2),'naive',avg(sim.naive,'cast').toFixed(2),
    '| shaft',Math.min(...sim.lens).toFixed(1),'-',Math.max(...sim.lens).toFixed(1));

  /* 4. touch, for real: drag back and let go; the weight flies the other way, and a line is spent */
  await p.evaluate(()=>{const T=__t; T.tutSet({walk:'done',seen:[],off:true}); __takeCast(41,1,300); const C=T.DESC; C.pos=C.rg[0].y-1;});
  await p.waitForTimeout(150);
  const cdp=await ctx.newCDPSession(p);
  const touch=async(type,x,y,id=1)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:type==='touchEnd'||type==='touchCancel'?[]:[{x,y,id}]});
  const g=await p.evaluate(()=>{const r=document.getElementById('dscOverlay').getBoundingClientRect(), K=__t.CASTK, u=__t.castU(r.width,r.height); return {u,cx:r.width/2,fy:r.height*K.FY,w:r.width,h:r.height};});
  const side=await p.evaluate(()=>__t.DESC.rg[0].side);
  /* pull down and away from the ring's wall: the weight flies up and toward it */
  const sx=g.cx, sy=g.fy+3*g.u;
  await touch('touchStart',sx,sy); await p.waitForTimeout(40);
  await touch('touchMove',sx-side*g.u*.9,sy+g.u*.9); await p.waitForTimeout(80);
  const aiming=await p.evaluate(()=>{const C=__t.DESC; return {aim:!!C.aim,px:C.aim&&+C.aim.px.toFixed(2),py:C.aim&&+C.aim.py.toFixed(2),left:C.left,prompt:document.getElementById('dscPrompt').className};});
  await shot('cast-aim');
  await touch('touchEnd'); await p.waitForTimeout(60);
  const loosed=await p.evaluate(()=>{const C=__t.DESC; return {aim:!!C.aim,left:C.left,cast:C.cast,wt:C.wt&&{st:C.wt.st,vx:+C.wt.vx.toFixed(2),vy:+C.wt.vy.toFixed(2)}};});
  ok(aiming.aim&&Math.sign(aiming.px)===side&&aiming.py<0&&/is-gone/.test(aiming.prompt)&&aiming.left===3,'a drag back is a pull, away from the thumb; no line is spent while you aim',aiming);
  ok(!loosed.aim&&loosed.left===2&&loosed.cast===1&&loosed.wt&&loosed.wt.vy<0,'letting go looses the line: the weight flies up and the other way, and one line is spent',loosed);
  await p.waitForTimeout(200); await shot('cast-fly');
  await p.waitForFunction(()=>!__t.DESC.wt,null,{timeout:4000});
  /* a slack pull and a cancel cost nothing */
  await touch('touchStart',sx,sy); await touch('touchMove',sx+4,sy+6); await touch('touchEnd'); await p.waitForTimeout(60);
  const slack=await p.evaluate(()=>({left:__t.DESC.left,wt:!!__t.DESC.wt}));
  await touch('touchStart',sx,sy); await touch('touchMove',sx+g.u,sy+g.u); await p.waitForTimeout(40); await touch('touchCancel'); await p.waitForTimeout(60);
  const cancel=await p.evaluate(()=>({left:__t.DESC.left,wt:!!__t.DESC.wt,aim:!!__t.DESC.aim,held:__t.DESC.held,phase:__t.DESC.phase}));
  ok(slack.left===2&&!slack.wt,'a slack pull (a tap, a twitch) looses nothing',slack);
  ok(cancel.left===2&&!cancel.wt&&!cancel.aim&&!cancel.held&&cancel.phase==='walk','a cancelled touch looses nothing and fails nothing',cancel);
  await touch('touchStart',8,sy); await p.waitForTimeout(60);
  const edge=await p.evaluate(()=>!!__t.DESC.aim); await touch('touchEnd'); await p.waitForTimeout(50);
  ok(!edge,'a touch at the very edge (the back swipe) aims nothing');
  /* a line in the air takes no second pull */
  const busy=await p.evaluate(()=>{const T=__t, C=T.DESC; T.castThrow(0,-3); const a=T.castThrow(0,-3); const o={second:a,left:C.left}; return o;});
  ok(busy.second===false&&busy.left===1,'one line at a time',busy);
  /* caught: a weight sent through a ring catches it, the ring glows and the count goes up */
  const hook=await p.evaluate(()=>{const T=__t, K=T.CASTK, C=T.DESC; C.wt=null;
    const r=C.rg.find(x=>!x.caught); C.pos=r.y; const x0=T.castSway(C.t), sv=T.castSwayV(C.t), F=.4, ty=-K.SPEED*F;
    T.castThrow((r.side*K.RX-x0)/F-sv,(ty-K.HAND-.5*K.G*F*F)/F);
    for(let i=0;i<40&&!r.caught;i++)T.castStep(1/60);
    return {caught:r.caught,n:C.caught,st:C.wt&&C.wt.st};});
  ok(hook.caught&&hook.n===1&&hook.st==='hook','a weight that meets a ring catches it',hook);
  await p.waitForTimeout(250); await shot('cast-caught');
  /* the walk ends when the lines are spent; with a thumb still down, no card until it lifts, then 600 ms */
  await p.evaluate(()=>{const C=__t.DESC; C.wt=null; C.left=1; C.phase='walk'; C.endAt=0; document.getElementById('dscCardWrap').hidden=true;});
  await touch('touchStart',sx,sy); await p.waitForTimeout(60);
  await p.evaluate(()=>{const C=__t.DESC; C.left=0;}); await p.waitForTimeout(800);
  const heldEnd=await p.evaluate(()=>({phase:__t.DESC.phase,card:!document.getElementById('dscCardWrap').hidden}));
  ok(heldEnd.phase==='out'&&!heldEnd.card,'every line spent ends the walk; while the thumb is still down, no card',heldEnd);
  await touch('touchEnd'); const lifted=Date.now();
  await p.waitForFunction(()=>!document.getElementById('dscCardWrap').hidden,null,{timeout:4000});
  ok(Date.now()-lifted>=580,'the result card shows 600 ms or more after the last lift',Date.now()-lifted);
  await shot('cast-card');
  const card=await p.evaluate(()=>({text:document.getElementById('dscCard').textContent,caught:__t.DESC.caught,cast:__t.DESC.cast,tithe:__t.DESC.tithe}));
  ok(card.caught===1&&card.cast===3&&/one ring/.test(card.text)&&/a rite charge/.test(card.text)&&new RegExp((3*card.tithe)+' essence').test(card.text)&&/Tap to go down to/.test(card.text),'the card says what was caught, what it pays and what the weights took',card);
  const box=await p.evaluate(()=>{const r=document.getElementById('dscCard').getBoundingClientRect(); return [r.left,r.top,r.right,r.bottom].map(Math.round);});
  await touch('touchStart',(box[0]+box[2])/2,(box[1]+box[3])/2); await p.waitForTimeout(80);
  const onDown=await p.evaluate(()=>__t.DESC.active);
  await touch('touchEnd'); await p.waitForTimeout(200);
  const onClick=await p.evaluate(()=>({active:__t.DESC.active,floor:__t.run.floor,phase:__t.F.phase,charge:__t.run.charge}));
  ok(onDown&&!onClick.active&&onClick.floor===2&&onClick.phase==='build'&&onClick.charge&&onClick.charge.n===1,'the card stays through pointerdown and goes on click; the floor begins with one charge',onClick);

  /* 5. the charge: a rite still cooling casts at once, its own wait runs on, and only a cast that lands spends it */
  const chg=await p.evaluate(()=>{
    const T=__t, out={};
    T.newRun('lamplighter',0,{seed:5}); T.run.floor=2; T.beginFloor(null); T.setP(false); T.run.charge={floor:2,n:2};
    T.F.phase='wave'; T.F.queue=[];
    /* Pillar of Salt waits on a target: cooling, a tap arms it at once, and nothing is spent until it lands */
    T.F.cd.pillar=15; T.forceUI();
    const btn=document.querySelector('#rites [data-r="pillar"]');
    out.btn={disabled:btn.disabled,cls:btn.className,txt:btn.querySelector('span').textContent};
    btn.click(); out.armed={mode:T.mode,cd:T.F.cd.pillar,n:T.chargesNow()};
    /* let it go: the wait comes back as it was, run on, and the charge is kept */
    T.castRite('pillar'); T.update(.5); out.cancel={mode:T.mode,cd:+T.F.cd.pillar.toFixed(2),n:T.chargesNow(),chg:!!T.F.chg};
    /* arm it again, wait a second, and land it: the old wait comes back run on, and one charge is spent */
    T.castRite('pillar'); T.update(1); out.mid={mode:T.mode,left:T.F.chg&&+T.F.chg.left.toFixed(2),n:T.chargesNow()};
    T.castPillar(T.F.lx,T.F.ly); T.update(.05);
    out.landed={mode:T.mode,cd:+T.F.cd.pillar.toFixed(2),n:T.chargesNow(),chg:!!T.F.chg};
    /* switching to another rite while one is armed with a charge lets the first go, charge kept */
    T.F.cd.kindle=8; T.castRite('pillar'); const m1=T.mode; T.castRite('kindle'); T.update(.05);
    out.swap={m1,mode:T.mode,pillar:+T.F.cd.pillar.toFixed(2),kindle:T.F.cd.kindle,n:T.chargesNow(),chg:T.F.chg&&T.F.chg.k};
    T.setMode(null); T.update(.05);
    return out;
  });
  ok(chg.btn.disabled===false&&/is-charged/.test(chg.btn.cls)&&/Charge/.test(chg.btn.txt),'with a charge, a cooling rite can be tapped and says so',chg.btn);
  ok(chg.armed.mode==='pillar'&&chg.armed.cd===0&&chg.armed.n===2,'tapping it arms it at once; nothing is spent yet',chg.armed);
  ok(chg.cancel.mode===null&&chg.cancel.cd===14.5&&chg.cancel.n===2&&!chg.cancel.chg,'let go without casting: its wait comes back, run on, and the charge is kept',chg.cancel);
  ok(chg.mid.mode==='pillar'&&chg.mid.left===13.5&&chg.mid.n===2,'armed again, its own wait runs on underneath',chg.mid);
  ok(chg.landed.mode===null&&Math.abs(chg.landed.cd-13.45)<.06&&chg.landed.n===1&&!chg.landed.chg,'the cast lands: one charge spent, and the Pillar’s wait is where it would have been',chg.landed);
  ok(chg.swap.m1==='pillar'&&chg.swap.mode==='kindle'&&chg.swap.pillar>13&&chg.swap.kindle===0&&chg.swap.n===1&&chg.swap.chg==='kindle','tapping another rite lets the first go with its wait back; the new one takes the charge in its turn',chg.swap);
  /* Flare casts at once: the charge is spent as it lands, and Flare's own wait carries on */
  const flare=await p.evaluate(()=>{
    const T=__t, out={}; T.run.charge={floor:T.run.floor,n:2}; T.F.chg=null;
    T.run.rites=['kindle','pillar','flare']; T.F.cd.flare=20; T.forceUI();
    const n0=T.chargesNow(); T.castRite('flare');
    out.n=[n0,T.chargesNow()]; out.flareT=T.F.flareT>0; out.cd=+T.F.cd.flare.toFixed(2);
    T.F.cd.flare=12; T.castRite('flare'); out.n2=T.chargesNow(); out.charge=T.run.charge; out.cd2=+T.F.cd.flare.toFixed(2);
    /* none left: a cooling rite is barred again */
    T.F.cd.flare=9; T.forceUI(); const b=document.querySelector('#rites [data-r="flare"]'); out.after={disabled:b.disabled,cls:b.className};
    T.castRite('flare'); out.cd3=+T.F.cd.flare.toFixed(2);
    out.ch=['toll','name','overload','flare','pillar','greatbell','anchor','unbind','wisp'].map(k=>T.chargeable(k));
    return out;});
  ok(flare.n[0]===2&&flare.n[1]===1&&flare.flareT&&flare.cd===20,'Flare, cooling, casts at once: one charge spent, and its wait is where it was',flare);
  ok(flare.n2===0&&flare.charge===null&&flare.cd2===12,'the last charge spent, the charges are gone',flare);
  ok(flare.after.disabled&&!/is-charged/.test(flare.after.cls)&&flare.cd3===9,'with none left, a cooling rite waits as ever',flare);
  ok(flare.ch.join()==='false,false,false,true,true,true,true,true,true','the Toll, Name the Thing and Overload take no charge; every rite with a wait does',flare.ch);
  /* Bare Hands: a silent rite stays silent, charge or not */
  const bare=await p.evaluate(()=>{const T=__t; T.run.charge={floor:T.run.floor,n:1}; T.F.trial='bare'; T.F.cd.flare=5; const was=T.F.flareT; T.F.flareT=0; T.castRite('flare');
    const o={n:T.chargesNow(),flare:T.F.flareT>0,cd:T.F.cd.flare}; T.F.trial=null; T.run.charge=null; return o;});
  ok(bare.n===1&&!bare.flare&&bare.cd===5,'under Bare Hands a charge wakes no silent rite',bare);
  /* the tip comes the first time a rite cools with a charge held */
  const ctip=await p.evaluate(()=>{const T=__t; T.tutSet({walk:'done',seen:[],off:false});
    T.newRun('lamplighter',0,{seed:6}); T.run.floor=2; T.beginFloor(null); T.setP(false); T.F.phase='wave'; T.F.queue=[];
    const o={}; o.before=T.TIPS.charge.when(); T.run.charge={floor:2,n:1}; o.noCool=T.TIPS.charge.when(); T.F.cd.kindle=10; o.on=T.TIPS.charge.when();
    T.tutSet({walk:'done',seen:[],off:true}); return o;});
  ok(!ctip.before&&!ctip.noCool&&ctip.on,'the charge tip comes when a rite cools with a charge held',ctip);

  /* 6. resume in the middle: it plays again from the top, nothing lost or paid twice */
  const resume=await p.evaluate(()=>{
    const T=__t, out={}, J=o=>JSON.parse(JSON.stringify(o));
    __takeCast(55,2,250);
    const save=J(JSON.parse(localStorage.getItem('ll-save-v2'))), lay=JSON.stringify(T.DESC.rg.map(r=>[r.side,r.y])), ess=T.run.ess, tithe=T.DESC.tithe;
    T.DESC.pos=6; T.DESC.caught=1; T.DESC.cast=2; T.DESC.left=1; T.DESC.rg[0].caught=true;
    T.resumeFrom(save);
    out.restart={active:T.DESC.active,k:T.DESC.k,pos:T.DESC.pos,caught:T.DESC.caught,left:T.DESC.left,same:JSON.stringify(T.DESC.rg.map(r=>[r.side,r.y]))===lay,
      free:T.DESC.rg.every(r=>!r.caught),ess:T.run.ess===ess,tithe:T.DESC.tithe===tithe,floor:T.run.floor,charge:T.run.charge||null};
    T.resumeFrom(save); T.resumeFrom(save);
    T.descentFinish({caught:2,cast:2});
    out.done={floor:T.run.floor,ess:T.run.ess,want:ess-2*tithe+T.F.def.stipend,charge:T.run.charge,descents:T.run.descents.join(),phase:T.F.phase};
    const old=J(save); delete old.run.descent; delete old.run.descents; delete old.run.charge; old.towers=[]; T.resumeFrom(old);
    out.old={active:T.DESC.active,phase:T.F.phase,charges:T.chargesNow()};
    return out;
  });
  ok(resume.restart.active&&resume.restart.k==='cast'&&resume.restart.pos===0&&!resume.restart.caught&&resume.restart.left===3&&resume.restart.same&&resume.restart.free&&resume.restart.tithe,'a reload mid-shaft starts it again from the top: the same rings, all free, three lines',resume.restart);
  ok(resume.restart.ess&&resume.restart.floor===3&&resume.restart.charge===null,'nothing is lost or paid on the reload',resume.restart);
  ok(resume.done.floor===3&&resume.done.ess===resume.done.want&&resume.done.charge&&resume.done.charge.n===2&&resume.done.descents==='cast'&&resume.done.phase==='build','after three reloads, the toll, weights, stipend and charges each landed once',resume.done);
  ok(!resume.old.active&&resume.old.phase==='build'&&resume.old.charges===0,'an old save without charges loads and plays',resume.old);

  /* 7. the first time, a tip card holds it until read */
  const tip=await p.evaluate(()=>{
    const T=__t; T.tutSet({walk:'done',seen:[],off:false});
    __takeCast(61,1);
    const o={phase:T.DESC.phase,card:!document.getElementById('dscCardWrap').hidden,text:document.getElementById('dscCard').textContent};
    T.castStep(.5); o.still=T.DESC.pos===0;
    document.getElementById('dscCard').click();
    o.after=T.DESC.phase; o.seen=!T.tipFresh('cast');
    T.descentFinish({});
    __takeCast(62,2); o.second=T.DESC.phase; T.descentFinish({});
    T.tutSet({walk:'done',seen:[],off:true});
    return o;
  });
  ok(tip.phase==='tip'&&tip.card&&/Drag back/.test(tip.text)&&/lead/.test(tip.text)&&tip.still,'the first Cast waits behind its tip',tip);
  ok(tip.after==='walk'&&tip.seen&&tip.second==='walk','tapping the tip starts the shaft; it is not shown again',tip);

  /* 8. taught: the rules line and the Grimoire's Descents page */
  const teach=await p.evaluate(()=>{
    const T=__t; T.newRun('lamplighter',0,{seed:3}); T.run.descents=['cast'];
    const rules=document.getElementById('rulesList').textContent;
    T.openBook('hud','descents');
    const ents=[...document.querySelectorAll('.book-e')].map(e=>e.textContent);
    const cv=document.querySelector('canvas[data-dicon="cast"]');
    let px=0; if(cv){const d=cv.getContext('2d').getImageData(0,0,cv.width,cv.height).data; for(let i=3;i<d.length;i+=4)if(d[i])px++;}
    const o={rules:/The Cast:/.test(rules)&&/rite charge/.test(rules)&&/tenth/.test(rules),entry:ents.find(t=>/The Cast/.test(t))||'',px};
    T.resumeFrom(JSON.parse(localStorage.getItem('ll-save-v2')));
    return o;
  });
  ok(teach.rules,'"How the dark works" has a Cast line');
  ok(/Aim/.test(teach.entry)&&/Pays:/.test(teach.entry)&&/Costs:/.test(teach.entry)&&/Walked this descent/.test(teach.entry)&&teach.px>500,'the Grimoire’s Descents page has The Cast on it, painted',teach);

  /* 9. developer practice keeps nothing (rule 24) */
  const dev=await p.evaluate(()=>{
    const T=__t; T.newRun('whaler',0,{seed:8}); T.run.floor=1; T.beginFloor(null); T.setP(false);
    const before={save:localStorage.getItem('ll-save-v2'),floor:T.run.floor,ess:T.run.ess,descents:JSON.stringify(T.run.descents||null)};
    const r=T.DEV_ACTS.descent('cast'); const mid=T.DESC.active&&T.DESC.practice&&T.DESC.k==='cast';
    T.DESC.caught=2; T.DESC.cast=3; T.descentFinish();
    return {r,mid,same:localStorage.getItem('ll-save-v2')===before.save&&T.run.floor===before.floor&&T.run.ess===before.ess&&JSON.stringify(T.run.descents||null)===before.descents&&!T.run.charge,
      body:document.getElementById('mBody').textContent};
  });
  ok(dev.r===null&&dev.mid&&dev.same&&/The Cast, practised/.test(dev.body),'developer mode practises The Cast and keeps nothing',dev);

  /* 10. painted: a ring in the light shows, one beyond it is all but lost; Lite and reduceMotion draw without error */
  await p.evaluate(()=>{const T=__t; T.newRun('lamplighter',0,{seed:12}); T.run.ess=200; T.run.descent={k:'cast',f0:1,msg:''}; T.run.floor=2; T.startDescent();
    const C=T.DESC; C.phase='walk'; C.pos=C.rg[0].y-.6; C.rg[0].caught=true; C.rg[0].lt=1; C.caught=1;});
  await p.waitForTimeout(800);
  await shot('cast-walk');
  const lit=await p.evaluate(()=>{const T=__t, C=T.DESC, cv=document.getElementById('dscCv'), c=cv.getContext('2d'), w=cv.width, h=cv.height, u=T.castU(w,h), K=T.CASTK;
    const lum=(x,y,r)=>{const d=c.getImageData(Math.round(x-r),Math.round(y-r),Math.round(r*2),Math.round(r*2)).data; let s=0; for(let i=0;i<d.length;i+=4)s+=d[i]+d[i+1]+d[i+2]; return s/(d.length/4);};
    const r0=C.rg[0], r1=C.rg[1];
    return {near:lum(w/2+r0.side*K.RX*u,h*K.FY+(r0.y-C.pos)*u,u*.3),far:r1.y-C.pos>K.GLOW?lum(w/2+r1.side*K.RX*u,h*K.FY+(r1.y-C.pos)*u,u*.3):0,farY:r1.y-C.pos};});
  ok(lit.near>120&&lit.far<lit.near/3,'a caught ring in the light shows bright; one still deep in the dark is all but lost',lit);
  await p.evaluate(()=>{const T=__t; T.setLite(true); const C=T.DESC; C.aim={id:9,x0:200,y0:600,px:1,py:-1.2}; C.wt={x:.4,y:-.5,vx:3,vy:-2,t:.1,st:'fly',rt:0,ring:null};});
  await p.waitForTimeout(200); await shot('cast-lite');
  await p.emulateMedia({reducedMotion:'reduce'}); await p.evaluate(()=>__t.setLite(false)); await p.waitForTimeout(200);
  await p.emulateMedia({reducedMotion:'no-preference'});
  await p.evaluate(()=>{const T=__t; T.descentFinish({}); T.setDescentAuto({woke:0,spilt:0});});

  ok(!errs.length,'no page errors',errs);
  await b.close();
  if(fails.length){fails.forEach(f=>console.log('FAIL '+f)); process.exit(1);}
  console.log('cast: ok');
})();
