// The Smothering (Expansion 2, step 10; expansion/SEEDS-AND-MINI-FLOORS.md §5.6, as tuned on the Fold test #106/#108): the
// sixth descent, on the descent frame.
// - The door: offered like the others, never one walked, never to the Occultist (dread would feed him); it says what it pays
//   and costs. Taking it pays the toll once.
// - The headless hook: settle it, assert the reward (the lamp holds more oil for the run, through baseOilMax) and the cost (dread
//   on the next floor only, three at most). No embers. Failing never ends the run.
// - The pure roll: one seed lays out the same tube twice, with Math.random barred while it does; at most one crossing a plume,
//   none in its first 1.5 s; a perfect tapper clears every plume in time; an idle thumb is smothered every time.
// - The tie rule; a wrong snuff (1 dread, that wick out, the plume not clean); a plume reaching the wicks (1 dread).
// - Depth survives an oil-cap relic coming and going, and a save and resume; an old save with no run.fume reads 0.
// - Touch, for real: a tap snuffs on the lift; a slide off, a lift on another wick, a cancel and the back-swipe edge snuff nothing.
// - Brightness, painted: the light round each wick ranks as its level does, in Full and in Lite.
// - Saving: checkpoint at its start; a reload plays it again, nothing paid twice. Taught: tip, rules line, Grimoire, practice.
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
    window.__takeSmother=(seed,f,kit)=>{
      const d=__fork(seed,f,kit); d.doors.forEach(x=>{delete x.descent; delete x.horror;});
      const i=d.doors.findIndex(x=>!x.trial&&x.room!=='deep'); d.doors[i].descent='smother'; T.showLanding();
      const essBefore=T.run.ess, embers=T.meta.embers, oilMax=T.run.oilMax, base=T.run.baseOilMax;
      T.chooseDoor(d,i);
      if(T.F.draft&&!T.F.draft.done)T.descend();
      return {essBefore,embers,oilMax,base,door:i};
    };
    /* plays a plume or more by the step: taps lands on the dimmest lit wick at those plume times (a perfect reader), or none */
    window.__play=(taps,until)=>{
      const C=T.DESC, dt=1/60; let n=0;
      while(C.phase==='walk'&&n<6000&&(!until||!until())){
        if(C.sub==='plume'&&taps){const q=taps(C);
          if(q!=null){T.smotherSnuff(q);}}
        T.smotherStep(dt); n++;
      }
      return n;
    };
    window.__dimmest=C=>{const ws=C.pl[C.i].ws; let best=-1, bb=1e9; for(let k=0;k<ws.length;k++)if(C.lit[k]){const v=T.smoB(ws[k],C.pt); if(v<bb){bb=v; best=k;}} return best;};
  });

  /* 1. the door: offered among the descents at the landings, never to the Occultist, saying what it pays and costs */
  const door=await p.evaluate(()=>{
    const T=__t, kinds={}, occ={}, pools={};
    for(let sd=1;sd<=160;sd++)for(const f of [1,2,3]){const d=__fork(sd,f); for(const x of d.doors)if(x.descent)kinds[x.descent]=(kinds[x.descent]||0)+1;}
    for(let sd=1;sd<=120;sd++)for(const f of [1,2,3]){const d=__fork(sd,f,'occultist'); for(const x of d.doors)if(x.descent)occ[x.descent]=(occ[x.descent]||0)+1;}
    for(const k of Object.keys(T.KITS)){T.newRun(k,0,{seed:5}); pools[k]=T.descentPool().includes('smother');}
    const d=__fork(77,1); d.doors.forEach(x=>{delete x.descent; delete x.horror;}); const i=d.doors.findIndex(x=>!x.trial); d.doors[i].descent='smother'; T.showLanding();
    const btn=document.querySelectorAll('#mChoices .choice')[i];
    return {kinds,occ,pools,keys:Object.keys(T.DESCENTS),tag:btn.querySelector('.tg').textContent,glyph:!!btn.querySelector('.tg svg.dsc-glyph'),sub:btn.textContent};
  });
  ok(door.kinds.smother>15&&door.kinds.carry>15&&door.kinds.cast>15,'The Smothering is offered on the landings alongside the other descents',door.kinds);
  ok(!door.occ.smother&&door.occ.carry>5,'the Occultist is never offered it, over 120 stairs; he still meets the others',door.occ);
  ok(!door.pools.occultist&&Object.keys(door.pools).filter(k=>k!=='occultist').every(k=>door.pools[k]),'every kit but the Occultist has it in its pool',door.pools);
  /* §5.8: rows are only appended. The Smothering went in right after The Cast; The Winch, built after it, follows it */
  ok(door.keys.indexOf('smother')===door.keys.indexOf('cast')+1,'its row follows The Cast’s, so the pool keeps its order (§5.8)',door.keys);
  ok(/Descent: The Smothering/.test(door.tag)&&door.glyph,'a Smothering door carries the glyph and says which descent',door);
  ok(/hold one more oil/.test(door.sub)&&/dread/.test(door.sub),'the door says what it pays and what it costs',door.sub);

  /* 2. taking it: the toll once, the tube, the floor; the outcome deepens the lamp and sends dread down */
  await p.evaluate(()=>__t.setDescentAuto(null));
  const take=await p.evaluate(()=>{
    const T=__t, out={};
    const b0=__takeSmother(31,1);
    out.active=T.DESC.active; out.k=T.DESC.k; out.floor=T.run.floor; out.overlay=!document.getElementById('dscOverlay').hidden;
    out.hud=document.getElementById('dscHud').textContent; out.prompt=document.getElementById('dscPrompt').textContent;
    out.essMid=T.run.ess; out.tollPaid=T.run.ess<b0.essBefore; out.sub=T.DESC.sub; out.wicks=T.DESC.pl.map(P=>P.ws.length);
    const sv=JSON.parse(localStorage.getItem('ll-save-v2')); out.saved={descent:sv.run.descent,floor:sv.run.floor,ess:sv.run.ess,towers:sv.towers.length,draft:sv.draft};
    out.descents=T.run.descents.slice();
    T.descentFinish({clean:2,wrong:1,late:1});
    out.after={active:T.DESC.active,floor:T.run.floor,phase:T.F.phase,fume:T.run.fume,oilMax:T.run.oilMax,base:T.run.baseOilMax,oilMax0:b0.oilMax,base0:b0.base,
      fd:T.fumeDread(),dread:T.dread(),embers:T.meta.embers,embersBefore:b0.embers,descent:T.run.descent,msg:document.getElementById('banner').textContent};
    out.floorSave=JSON.parse(localStorage.getItem('ll-save-v2')).run;
    out.floorSave={fume:out.floorSave.fume,base:out.floorSave.baseOilMax};
    /* the dread never reaches the floor after */
    T.run.fume={floor:T.run.floor-1,n:3}; out.stale=T.fumeDread(); T.run.fume=undefined; out.none=T.fumeDread(); T.run.fume=null;
    return out;
  });
  ok(take.active&&take.k==='smother'&&take.overlay&&take.floor===2&&take.sub==='lead','taking the door starts The Smothering on the way to the next floor',take);
  ok(take.wicks.join()==='4,4,4','three plumes of four wicks',take.wicks);
  ok(/Clean\s*0\s*of\s*3/.test(take.hud)&&/Dread\s*0\s*of\s*3/.test(take.hud)&&/dimmest/.test(take.prompt),'its counts show the plumes clean and the dread',[take.hud,take.prompt]);
  ok(take.tollPaid&&take.saved.descent&&take.saved.descent.k==='smother'&&take.saved.ess===take.essMid&&take.saved.towers===0&&take.saved.draft===null,'the toll is paid first, and the checkpoint is at its start',take.saved);
  ok(take.descents.join()==='smother','The Smothering is marked walked',take.descents);
  ok(!take.after.active&&take.after.floor===2&&take.after.phase==='build'&&take.after.descent===null,'after the tube the next floor begins',take.after);
  ok(take.after.oilMax===take.after.oilMax0+2&&take.after.base===take.after.base0+2,'two plumes clean: the lamp holds two more oil, through its base',take.after);
  ok(take.after.fume&&take.after.fume.n===2&&take.after.fume.floor===2&&take.after.fd===2&&take.after.dread>=2,'a wrong snuff and a late plume: two dread on the next floor',take.after);
  ok(take.after.embers===take.after.embersBefore,'the tube leaves no embers',take.after);
  ok(take.floorSave.fume&&take.floorSave.fume.n===2&&take.floorSave.base===take.after.base,'the floor’s own save keeps the dread and the depth',take.floorSave);
  ok(take.stale===0&&take.none===0,'the dread never carries to the floor after, and a run with none reads 0',[take.stale,take.none]);

  /* the results, the caps and the lines; and a failure that never ends the run */
  const res=await p.evaluate(()=>{
    const T=__t, R=T.smotherResult, L=T.smotherLine;
    const r={r:[R({}),R({woke:0,spilt:0}),R({clean:3,wrong:5}),R({clean:0,late:3}),R({clean:1,wrong:1,late:1}),R({clean:3,late:2})]};
    r.lines=[L(r.r[0],true),L(r.r[2],true),L(r.r[3],true),L(r.r[4],true),L(r.r[0],false),L(r.r[3],false),L(r.r[4],false)];
    __takeSmother(32,2); const m0=T.run.oilMax, o0=T.run.oil;
    T.descentFinish({clean:0,wrong:2,late:2});
    r.fail={oilMax:T.run.oilMax===m0,oil:T.run.oil===o0,fume:T.run.fume,floor:T.run.floor,phase:T.F.phase};
    return r;
  });
  ok(res.r[0].clean===3&&res.r[0].depth===3&&res.r[0].mad===0&&res.r[1].depth===3,'a clean settle is three plumes clean: three more oil, no dread',res.r.slice(0,2));
  ok(res.r[2].mad===3&&res.r[2].depth===3&&res.r[3].fail&&res.r[3].depth===0&&res.r[3].mad===3&&res.r[4].mad===2&&res.r[4].depth===1&&res.r[5].late===0,
    'dread is a mistake each, three at most; depth a clean plume each, three at most; no plume is both clean and late',res.r);
  ok(res.lines.every(l=>!/undefined|NaN/.test(l))&&/all three plumes out clean/.test(res.lines[0])&&/Five wicks went out of order/.test(res.lines[1])
    &&/No plume went out clean/.test(res.lines[2])&&/Three plumes reached wicks still lit/.test(res.lines[2])&&/One wick went out of order/.test(res.lines[3])
    &&/holds 3 more oil/.test(res.lines[4])&&/dread on this floor/.test(res.lines[6]),'its lines read right',res.lines);
  ok(res.fail.oilMax&&res.fail.oil&&res.fail.fume&&res.fail.fume.n===3&&res.fail.floor===3&&res.fail.phase==='build','no plume clean: the lamp holds no more, three dread stand, and the run goes on',res.fail);

  /* 3. the pure roll, over many stairs: barred from Math.random, the same tube twice, fair by construction */
  const roll=await p.evaluate(()=>{
    const T=__t, K=T.SMOK, out={same:true,noRandom:true,flat:true,levels:true,cross:[0,0,0],twoX:0,early:0,floor:1e9,lens:[]};
    const real=Math.random;
    for(let sd=1;sd<=200;sd++){
      T.newRun('lamplighter',0,{seed:sd}); T.run.floor=1+sd%3;
      let a, a2;
      Math.random=()=>{throw new Error('Math.random in smotherLayout');};
      try{a=T.seeded(T.SALT.descent,8,T.smotherLayout); a2=T.seeded(T.SALT.descent,8,T.smotherLayout);}catch(e){out.noRandom=false;}
      Math.random=real;
      if(!a){continue;}
      if(JSON.stringify(a)!==JSON.stringify(a2))out.same=false;
      a.pl.forEach((P,i)=>{
        if(i===0&&P.ws.some(w=>w.amp))out.flat=false;
        if(P.ws.map(w=>w.base).sort((x,y)=>x-y).join()!==K.LEVELS.join())out.levels=false;
        if(P.rise!==K.RISE[i])out.levels=false;
        const c=T.smoCross(P.ws,P.rise); out.cross[i]+=c.n; if(c.n>1)out.twoX++; if(c.n&&c.first<K.CALM)out.early++;
        for(let t=0;t<=P.rise;t+=.05)for(const w of P.ws)out.floor=Math.min(out.floor,T.smoB(w,t));
      });
    }
    T.newRun('lamplighter',0,{seed:99}); T.run.floor=2;
    out.own=JSON.stringify(T.seeded(T.SALT.descent,8,T.smotherLayout))!==JSON.stringify(T.seeded(T.SALT.descent,6,T.castLayout));
    return out;
  });
  ok(roll.noRandom,'smotherLayout never calls Math.random (rule 11b)');
  ok(roll.same&&roll.own,'one seed lays out the same tube twice, on its own sub-stream',roll);
  ok(roll.flat&&roll.levels,'every plume has the four levels and its own rise; the first never gutters',roll);
  ok(roll.twoX===0&&roll.early===0,'over 200 stairs: at most one crossing a plume, none in its first 1.5 s',roll);
  ok(roll.cross[0]===0&&roll.cross[1]>=150&&roll.cross[2]>=150,'the drift matters: most guttering plumes do cross once',roll.cross);
  ok(roll.floor>=.6,'the dimmest wick never sinks under 0.6 of a level',roll.floor);

  /* the game, step by step: a perfect reader (first tap at 1.0 s, then one every 0.6 s), a slow one, and an idle thumb */
  const sim=await p.evaluate(()=>{
    const T=__t, out={perfect:[],slow:[],idle:[],secs:[]};
    const go=(seed,first,every)=>{
      T.newRun('lamplighter',0,{seed}); T.run.floor=2; T.run.descent={k:'smother',f0:1,msg:''}; T.startDescent(); const C=T.DESC; C.phase='walk';
      let next=first;
      __play(first==null?null:C=>{if(C.pt<.02)next=first; if(C.pt>=next){next=C.pt+every; return __dimmest(C);} return null;});
      const r={clean:C.clean,wrong:C.wrong,late:C.late,t:+C.t.toFixed(1)}; T.descentFinish({clean:C.clean,wrong:C.wrong,late:C.late}); return r;
    };
    for(let sd=1;sd<=200;sd++){out.perfect.push(go(sd,1,.6));}
    for(let sd=1;sd<=40;sd++){out.slow.push(go(sd,1.4,1.1)); out.idle.push(go(sd,null,0));}
    return out;
  });
  ok(sim.perfect.every(r=>r.clean===3&&r.wrong===0&&r.late===0),'a perfect reader, tapping every 0.6 s from 1 s in, clears every plume clean on 200 stairs',sim.perfect.filter(r=>r.clean<3).slice(0,3));
  ok(sim.idle.every(r=>r.clean===0&&r.late===3),'an idle thumb is smothered every plume: none clean, three late',sim.idle.slice(0,3));
  ok(sim.slow.some(r=>r.late>0),'a slow thumb (a tap every 1.1 s) is caught by the fumes',sim.slow.map(r=>r.late).join(''));
  const all=sim.perfect.concat(sim.idle,sim.slow);
  ok(all.every(r=>r.t<=40),'every Smothering lasts no more than 40 seconds (never over 45); a quick reader ends each plume early',Math.max(...all.map(r=>r.t)));
  ok(sim.idle.every(r=>r.t>=15),'the whole tube, with every plume left to the fumes, lasts 15 seconds or more',sim.idle.map(r=>r.t));
  console.log('smothering: secs perfect',(sim.perfect.reduce((s,r)=>s+r.t,0)/200).toFixed(1),'idle',(sim.idle.reduce((s,r)=>s+r.t,0)/40).toFixed(1),
    '| slow thumb late plumes',(sim.slow.reduce((s,r)=>s+r.late,0)/40).toFixed(2));

  /* 4. the tie rule, a wrong snuff, a plume that reaches the wicks */
  const rules=await p.evaluate(()=>{
    const T=__t, out={};
    const plume=bases=>{T.newRun('lamplighter',0,{seed:4}); T.run.floor=2; T.run.descent={k:'smother',f0:1,msg:''}; T.startDescent();
      const C=T.DESC; C.phase='walk'; C.pl[0]={ws:bases.map(b=>({base:b,amp:0,ph:0})),rise:6,cross:0}; C.i=-1; C.sub='lead'; C.gt=T.SMOK.GAP; T.smotherStep(.01); return C;};
    /* two wicks inside the band: either is right */
    let C=plume([1.1,1,1.95,2.5]); out.tieA=T.smotherSnuff(0); C=plume([1.1,1,1.95,2.5]); out.tieB=T.smotherSnuff(1);
    C=plume([1.2,1,1.95,2.5]); out.outside=T.smotherSnuff(0); C.hudKey=''; T.descentFrame(0); out.hudBad=document.getElementById('dscStatF').className;
    /* a wrong snuff: the wick goes out, one dread, the plume can't be clean, and you finish it */
    C=plume([1,1.45,1.95,2.5]); out.wrong=T.smotherSnuff(3); out.afterWrong={lit:C.lit.slice(),wrong:C.wrong,wrongP:C.wrongP};
    out.rest=[T.smotherSnuff(0),T.smotherSnuff(1),T.smotherSnuff(2)];
    out.end={sub:C.sub,clean:C.clean,msg:C.msg,i:C.i};
    /* a snuffed wick can't be snuffed again; nothing is snuffed between plumes */
    out.again=T.smotherSnuff(3);
    /* the fumes reach the wicks with two still lit: both smothered, one late plume, one dread */
    C=plume([1,1.45,1.95,2.5]); T.smotherSnuff(0); T.smotherSnuff(1); let n=0; while(C.sub==='plume'&&n<1000){T.smotherStep(.02); n++;}
    out.late={lit:C.lit.slice(),late:C.late,clean:C.clean,msg:C.msg,pt:+C.pt.toFixed(2)};
    T.descentFinish({}); return out;
  });
  ok(rules.tieA===true&&rules.tieB===true,'two wicks within 0.15 of a level of each other both count as the dimmest',rules);
  ok(rules.outside===false&&/is-bad/.test(rules.hudBad),'outside the band, the brighter one is wrong, and the dread count turns red',rules);
  ok(rules.wrong===false&&rules.afterWrong.lit.join()==='true,true,true,false'&&rules.afterWrong.wrong===1&&rules.afterWrong.wrongP,'a wrong snuff still puts that wick out and counts one dread',rules.afterWrong);
  ok(rules.rest.every(x=>x===true)&&rules.end.sub==='gap'&&rules.end.clean===0&&rules.end.msg==='Out of order.','you finish the plume, and it is not clean',rules.end);
  ok(rules.again===null,'nothing is snuffed twice, or between plumes');
  ok(rules.late.lit.every(x=>!x)&&rules.late.late===1&&rules.late.clean===0&&rules.late.msg==='Smothered.'&&rules.late.pt===6,'the fumes reaching the wicks smother every one still lit: one late plume',rules.late);

  /* 5. depth survives an oil-cap relic coming and going, and a save and resume; an old save with no run.fume reads 0 */
  const depth=await p.evaluate(()=>{
    const T=__t, out={}, J=o=>JSON.parse(JSON.stringify(o));
    const b0=__takeSmother(44,1); T.descentFinish({clean:3});
    out.after={max:T.run.oilMax,base:T.run.baseOilMax,want:b0.oilMax+3};
    T.addRelic('glass'); out.glass={max:T.run.oilMax,want:out.after.want-6};
    T.removeRelic('glass'); out.back=T.run.oilMax;
    T.checkpoint(); const sv=J(JSON.parse(localStorage.getItem('ll-save-v2'))); T.resumeFrom(sv); out.resumed=T.run.oilMax;
    const old=J(sv); delete old.run.fume; T.resumeFrom(old); out.old={fd:T.fumeDread(),dread:typeof T.dread(),phase:T.F.phase};
    return out;
  });
  ok(depth.after.max===depth.after.want,'three clean plumes: the lamp holds three more oil',depth.after);
  ok(depth.glass.max===depth.glass.want&&depth.back===depth.after.want,'an oil-cap relic taken and laid down leaves the depth in place',depth);
  ok(depth.resumed===depth.after.want,'the depth survives a save and resume',depth.resumed);
  ok(depth.old.fd===0&&depth.old.dread==='number'&&depth.old.phase==='build','an old save with no run.fume loads, and reads no dread',depth.old);

  /* 6. touch, for real: a tap snuffs on the lift; a slide off, a lift on another wick, a cancel and the edge snuff nothing */
  await p.evaluate(()=>{const T=__t; T.tutSet({walk:'done',seen:[],off:true}); T.newRun('lamplighter',0,{seed:41}); T.run.floor=2;
    T.run.descent={k:'smother',f0:1,msg:''}; T.startDescent(); const C=T.DESC; C.pl[0].rise=999; C.i=-1; C.sub='lead'; C.gt=T.SMOK.GAP; T.smotherStep(.01);});
  await p.waitForTimeout(500);
  const cdp=await ctx.newCDPSession(p);
  const touch=async(type,x,y,id=1)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:type==='touchEnd'||type==='touchCancel'?[]:[{x,y,id}]});
  const g=await p.evaluate(()=>{const T=__t, G=T.smoGeo(); return {xs:[0,1,2,3].map(k=>T.smoX(G,k)),cy:G.cy,R:G.R,w:G.w,h:G.h};});
  await shot('smother-plume');
  const lit=()=>p.evaluate(()=>__t.DESC.lit.slice());
  /* slide off */
  await touch('touchStart',g.xs[0],g.cy); await p.waitForTimeout(40);
  const pressed=await p.evaluate(()=>({press:__t.DESC.press,prompt:document.getElementById('dscPrompt').className}));
  await touch('touchMove',g.xs[0],g.cy+g.R*2.5); await p.waitForTimeout(40);
  const off=await p.evaluate(()=>__t.DESC.press&&__t.DESC.press.on);
  await touch('touchEnd'); await p.waitForTimeout(60);
  const slid=await lit();
  /* lift on the next wick */
  await touch('touchStart',g.xs[0],g.cy); await touch('touchMove',g.xs[1],g.cy); await touch('touchEnd'); await p.waitForTimeout(60);
  const other=await lit();
  /* cancel */
  await touch('touchStart',g.xs[0],g.cy); await p.waitForTimeout(40); await touch('touchCancel'); await p.waitForTimeout(60);
  const cancel=await p.evaluate(()=>({lit:__t.DESC.lit.slice(),press:__t.DESC.press,wrong:__t.DESC.wrong}));
  /* the back-swipe edge, and the stone between wicks */
  await touch('touchStart',6,g.cy); await touch('touchEnd'); await touch('touchStart',(g.xs[0]+g.xs[1])/2,g.cy-g.R*3); await touch('touchEnd'); await p.waitForTimeout(60);
  const edge=await lit();
  /* a tap: snuffed on the lift, a little drift of the thumb allowed */
  const want=await p.evaluate(()=>__dimmest(__t.DESC));
  await touch('touchStart',g.xs[want],g.cy); await p.waitForTimeout(40);
  const mid=await lit();
  await touch('touchMove',g.xs[want]+4,g.cy-5); await touch('touchEnd'); await p.waitForTimeout(80);
  const tapped=await p.evaluate(()=>({lit:__t.DESC.lit.slice(),wrong:__t.DESC.wrong,puffs:__t.DESC.puffs.length}));
  ok(pressed.press&&pressed.press.k===0&&/is-gone/.test(pressed.prompt),'a touch on a wick takes it, and the prompt goes',pressed);
  ok(off===false&&slid.every(Boolean),'a slide off the wick snuffs nothing',slid);
  ok(other.every(Boolean),'a lift on another wick snuffs nothing',other);
  ok(cancel.lit.every(Boolean)&&!cancel.press&&cancel.wrong===0,'a cancelled touch snuffs nothing and costs nothing',cancel);
  ok(edge.every(Boolean),'a touch at the very edge (the back swipe) or on the bare stone snuffs nothing',edge);
  ok(mid[want]===true&&tapped.lit[want]===false&&tapped.wrong===0&&tapped.puffs===1,'a tap on the dimmest wick snuffs it on the lift, not the press',{mid,tapped,want});
  await p.waitForTimeout(150); await shot('smother-snuffed');
  ok(g.R*2>=48&&g.xs[0]-g.R>=24&&g.w-g.xs[3]-g.R>=24,'targets 48 px or more, 24 px clear of the edges (folded)',g);

  /* the walk ends after the third plume; the card comes 600 ms after the last lift and goes on click */
  await p.evaluate(()=>{const T=__t, C=T.DESC; for(let k=0;k<4;k++)C.lit[k]=false; C.lit[0]=true; C.i=2; C.pl[2].rise=999; T.smotherSnuff(0);});
  const lifted=Date.now();
  await p.waitForFunction(()=>!document.getElementById('dscCardWrap').hidden,null,{timeout:4000});
  ok(Date.now()-lifted>=580,'the result card shows 600 ms or more after the walk ends',Date.now()-lifted);
  await shot('smother-card');
  const card=await p.evaluate(()=>({text:document.getElementById('dscCard').textContent,phase:__t.DESC.phase}));
  ok(card.phase==='card'&&/plume/.test(card.text)&&/Tap to go down to/.test(card.text),'the card says what came of the plumes',card);
  const box=await p.evaluate(()=>{const r=document.getElementById('dscCard').getBoundingClientRect(); return [r.left,r.top,r.right,r.bottom].map(Math.round);});
  await touch('touchStart',(box[0]+box[2])/2,(box[1]+box[3])/2); await p.waitForTimeout(80);
  const onDown=await p.evaluate(()=>__t.DESC.active);
  await touch('touchEnd'); await p.waitForTimeout(200);
  const onClick=await p.evaluate(()=>({active:__t.DESC.active,floor:__t.run.floor,phase:__t.F.phase}));
  ok(onDown&&!onClick.active&&onClick.floor===2&&onClick.phase==='build','the card stays through pointerdown and goes on click',onClick);

  /* 7. resume in the middle: it plays again from the top, nothing lost or paid twice */
  const resume=await p.evaluate(()=>{
    const T=__t, out={}, J=o=>JSON.parse(JSON.stringify(o));
    const b0=__takeSmother(55,2);
    const save=J(JSON.parse(localStorage.getItem('ll-save-v2'))), lay=JSON.stringify(T.DESC.pl), max=T.run.oilMax, ess=T.run.ess;
    T.DESC.i=1; T.DESC.sub='plume'; T.DESC.clean=1; T.DESC.wrong=2;
    T.resumeFrom(save);
    out.restart={active:T.DESC.active,k:T.DESC.k,i:T.DESC.i,sub:T.DESC.sub,clean:T.DESC.clean,wrong:T.DESC.wrong,same:JSON.stringify(T.DESC.pl)===lay,max:T.run.oilMax===max,ess:T.run.ess===ess,fume:T.run.fume||null};
    T.resumeFrom(save); T.resumeFrom(save);
    T.descentFinish({clean:1,wrong:1});
    out.done={floor:T.run.floor,max:T.run.oilMax,want:max+1,fume:T.run.fume,descents:T.run.descents.join(),phase:T.F.phase};
    return out;
  });
  ok(resume.restart.active&&resume.restart.k==='smother'&&resume.restart.i===-1&&resume.restart.sub==='lead'&&!resume.restart.clean&&!resume.restart.wrong&&resume.restart.same,'a reload mid-tube starts it again from the top: the same wicks, nothing counted',resume.restart);
  ok(resume.restart.max&&resume.restart.ess&&resume.restart.fume===null,'nothing is lost or paid on the reload',resume.restart);
  ok(resume.done.floor===3&&resume.done.max===resume.done.want&&resume.done.fume&&resume.done.fume.n===1&&resume.done.descents==='smother'&&resume.done.phase==='build','after three reloads, the depth and the dread each landed once',resume.done);

  /* 8. the first time, a tip card holds it until read */
  const tip=await p.evaluate(()=>{
    const T=__t; T.tutSet({walk:'done',seen:[],off:false});
    __takeSmother(61,1);
    const o={phase:T.DESC.phase,card:!document.getElementById('dscCardWrap').hidden,text:document.getElementById('dscCard').textContent};
    T.smotherStep(.5); o.still=T.DESC.i===-1&&T.DESC.gt===0;
    document.getElementById('dscCard').click();
    o.after=T.DESC.phase; o.seen=!T.tipFresh('smothering');
    T.descentFinish({});
    __takeSmother(62,2); o.second=T.DESC.phase; T.descentFinish({});
    T.tutSet({walk:'done',seen:[],off:true});
    return o;
  });
  ok(tip.phase==='tip'&&tip.card&&/dimmest first/.test(tip.text)&&/smoke comes down with you/.test(tip.text)&&tip.still,'the first Smothering waits behind its tip',tip);
  ok(tip.after==='walk'&&tip.seen&&tip.second==='walk','tapping the tip starts the tube; it is not shown again',tip);

  /* 9. taught: the rules line and the Grimoire's Descents page; developer practice keeps nothing (rule 24) */
  const teach=await p.evaluate(()=>{
    const T=__t; T.newRun('lamplighter',0,{seed:3}); T.run.descents=['smother'];
    const rules=document.getElementById('rulesList').textContent;
    T.openBook('hud','descents');
    const ents=[...document.querySelectorAll('.book-e')].map(e=>e.textContent);
    const cv=document.querySelector('canvas[data-dicon="smother"]');
    let px=0; if(cv){const d=cv.getContext('2d').getImageData(0,0,cv.width,cv.height).data; for(let i=3;i<d.length;i+=4)if(d[i])px++;}
    const o={rules:/The Smothering:/.test(rules)&&/dimmest first/.test(rules)&&/Occultist is never offered it/.test(rules),entry:ents.find(t=>/The Smothering/.test(t))||'',px};
    T.resumeFrom(JSON.parse(localStorage.getItem('ll-save-v2')));
    return o;
  });
  ok(teach.rules,'"How the dark works" has a Smothering line');
  ok(/Order/.test(teach.entry)&&/Pays:/.test(teach.entry)&&/Costs:/.test(teach.entry)&&/Walked this descent/.test(teach.entry)&&teach.px>500,'the Grimoire’s Descents page has The Smothering on it, painted',teach);
  const dev=await p.evaluate(()=>{
    const T=__t; T.newRun('whaler',0,{seed:8}); T.run.floor=1; T.beginFloor(null); T.setP(false);
    const before={save:localStorage.getItem('ll-save-v2'),floor:T.run.floor,max:T.run.oilMax,descents:JSON.stringify(T.run.descents||null)};
    const r=T.DEV_ACTS.descent('smother'); const mid=T.DESC.active&&T.DESC.practice&&T.DESC.k==='smother';
    T.DESC.clean=2; T.DESC.wrong=1; T.descentFinish();
    return {r,mid,same:localStorage.getItem('ll-save-v2')===before.save&&T.run.floor===before.floor&&T.run.oilMax===before.max&&JSON.stringify(T.run.descents||null)===before.descents&&!T.run.fume,
      body:document.getElementById('mBody').textContent};
  });
  ok(dev.r===null&&dev.mid&&dev.same&&/The Smothering, practised/.test(dev.body),'developer mode practises The Smothering and keeps nothing',dev);

  /* 10. brightness, painted: the light round each wick ranks as its level does, in Full and in Lite */
  const paint=async lite=>{
    await p.evaluate(lite=>{const T=__t; T.setLite(lite); T.newRun('lamplighter',0,{seed:12}); T.run.descent={k:'smother',f0:1,msg:''}; T.run.floor=2; T.startDescent();
      const C=T.DESC; C.phase='walk'; C.pl[0]={ws:[1.95,1,2.5,1.45].map(b=>({base:b,amp:0,ph:0})),rise:999,cross:0}; C.i=-1; C.sub='lead'; C.gt=T.SMOK.GAP; T.smotherStep(.01); C.pt=1;},lite);
    await p.waitForTimeout(400);
    return p.evaluate(()=>{const T=__t, cv=document.getElementById('dscCv'), c=cv.getContext('2d'), D=cv.width/cv.clientWidth, G=T.smoGeo();
      const lum=(x,y,r)=>{const d=c.getImageData(Math.round((x-r)*D),Math.round((y-r)*D),Math.round(r*2*D),Math.round(r*2*D)).data; let s=0; for(let i=0;i<d.length;i+=4)s+=d[i]+d[i+1]+d[i+2]; return s/(d.length/4);};
      /* the pool on the wall, beside and above the niche; and the whole glow round the flame */
      const pool=[0,1,2,3].map(k=>+lum(T.smoX(G,k),G.rowY-62*G.s,14*G.s).toFixed(1));
      const halo=[0,1,2,3].map(k=>+lum(T.smoX(G,k),G.rowY-16*G.s,22*G.s).toFixed(1));
      return {pool,halo};});
  };
  const order=[1,3,0,2];
  const full=await paint(false); await shot('smother-full');
  const lite=await paint(true); await shot('smother-lite');
  const ranks=a=>order.every((k,i)=>i===0||a[k]>a[order[i-1]]);
  ok(ranks(full.pool)&&ranks(full.halo),'Full: the pool on the wall and the glow round the flame rank as the levels do',full);
  ok(ranks(lite.pool)&&ranks(lite.halo),'Lite: the same ranking without the additive glow',lite);
  ok(full.halo[order[0]]>18,'the dimmest wick stays well clear of black',full.halo);
  await p.emulateMedia({reducedMotion:'reduce'}); await p.evaluate(()=>__t.setLite(false)); await p.waitForTimeout(200);
  await p.emulateMedia({reducedMotion:'no-preference'});
  await p.evaluate(()=>{const T=__t; T.descentFinish({}); T.setDescentAuto({woke:0,spilt:0});});

  ok(!errs.length,'no page errors',errs);
  await b.close();
  if(fails.length){fails.forEach(f=>console.log('FAIL '+f)); process.exit(1);}
  console.log('smothering: ok');
})();
