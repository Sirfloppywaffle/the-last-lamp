// The Winch (Expansion 2, step 9; expansion/SEEDS-AND-MINI-FLOORS.md §5.5): the fifth descent, on the descent frame.
// - The door: offered like the others to every kit; the pool holds six (five for the Galvanist and the Occultist); a seed's
//   descent doors stand where they did. Taking it pays the toll once.
// - The headless hook: settle it, assert the reward (a purse a tenth of what you arrive with, 4 to 12) and the cost (1 oil a
//   snag, 3 at most, never the last). No embers. Failing never ends the run.
// - The pure roll: one seed lays out the same shaft twice, with Math.random barred while it does; over 200 seeds a scripted
//   lantern reaches every purse; the drowned man's purse comes about one shaft in four, never cursed, the same for a seed.
// - The swing (step 11, Criss's play of #111): the lantern swings under the cable's top, knocked by its jerks; a chaser still
//   catches nearly every purse, a careful thumb snags far less, and a lantern left alone in the middle is no longer safe.
// - Snags: a 1 s grace, a 0.6 s lurch, the glow down a step. Pressed against a rib, one snag per grace window.
// - Touch, for real: a sideways drag steers, relative; a cancel costs nothing; the edges are the back swipe's.
// - Saving: checkpoint at its start; a reload plays it again, nothing paid; the end pays once. Taught: tip, rules, Grimoire, practice.
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
    const T=__t, K=T.WINCHK;
    window.__fork=(seed,f,kit)=>{
      T.newRun(kit||'lamplighter',0,{seed}); T.run.floor=f; T.beginFloor(null);
      T.F.foes=[]; T.F.queue=[]; T.F.wave=T.F.def.waves.length; T.F.phase='cleared'; T.openDraft(40,0);
      const d=T.F.draft; d.patron=null; d.relics=0; d.step='gift'; T.F.blocking.choices[0].fn();
      return T.F.draft;
    };
    window.__takeWinch=(seed,f,ess)=>{
      const d=__fork(seed,f); d.doors.forEach(x=>{delete x.descent; delete x.horror;});
      const i=d.doors.findIndex(x=>!x.trial&&x.room!=='deep'); d.doors[i].descent='winch'; T.showLanding();
      if(ess!=null)T.run.ess=ess;
      const essBefore=T.run.ess, embers=T.meta.embers;
      T.chooseDoor(d,i);
      if(T.F.draft&&!T.F.draft.done)T.descend();
      return {essBefore,embers,door:i};
    };
    /* a shaft on its own, with nothing paid: for the game's step */
    window.__shaft=(seed,ess)=>{T.newRun('lamplighter',0,{seed}); T.run.floor=2; T.run.ess=ess==null?200:ess; T.run.descent={k:'winch',f0:1,msg:''}; T.startDescent(); const C=T.DESC; C.phase='walk'; return C;};
    /* a scripted lantern: a path planned on a grid of x at most 0.8 of the top speed, clear of every rib and arm with a little
       to spare, through every purse within 0.6 of the catch radius. null if no such path exists */
    window.__plan=(C,mg)=>{mg=mg==null?.08:mg;
      const dt=1/30, step=.025, M=K.W-K.LR, nx=Math.round(2*M/step)+1, X=i=>-M+i*step, mv=Math.floor(K.TOP*.8*dt/step+1e-9);
      const N=Math.ceil(C.len/K.SPEED/dt)+2; let cur=new Uint8Array(nx); cur[Math.round(M/step)]=1; const prev=[]; let pi=0;
      for(let s=1;s<N;s++){const t=s*dt, d=t*K.SPEED, nxt=new Uint8Array(nx), pr=new Int16Array(nx).fill(-1);
        for(let j=0;j<nx;j++){if(T.winchHit(C,X(j),d,t,mg))continue;
          for(let e=0;e<=mv;e++){const i=cur[j-e]?j-e:cur[j+e]?j+e:-1; if(i>=0&&i<nx){nxt[j]=1; pr[j]=i; break;}}}
        if(pi<C.ps.length&&t>=C.ps[pi].ta){for(let j=0;j<nx;j++)if(Math.abs(X(j)-C.ps[pi].x)>K.CATCH*.6)nxt[j]=0; pi++;}
        prev.push(pr); cur=nxt; if(!cur.some(Boolean))return null;}
      let j=cur.indexOf(1); const path=new Array(prev.length+1); path[prev.length]=X(j);
      for(let s=prev.length-1;s>=0;s--){j=prev[s][j]; path[s]=X(j);} return path;
    };
    /* a thumb that steers the swinging lantern onto a moving goal: it puts the cable's top over the goal and moves it with the
       swing, after the lantern, which bleeds the swing away (winchSway). goal(C) gives where the lantern should be now and how
       fast that is moving */
    window.__steer=goal=>C=>{const g=goal(C); C.tx=g[0]+K.LAG*(g[1]+4*C.sw);};
    /* plays the shaft by the step; f(C) moves the thumb's target */
    window.__play=(C,f)=>{let n=0; while(C.phase==='walk'&&n<3000){if(f)f(C); T.winchStep(1/30); n++;} return {caught:C.caught,snags:C.snags,relic:C.relic,t:+C.t.toFixed(1)};};
  });

  /* 1. the door: offered among the descents at the landings, to every kit; the pool's order and size; doors stand where they did */
  const door=await p.evaluate(()=>{
    const T=__t, kinds={}, pools={};
    for(let sd=1;sd<=160;sd++)for(const f of [1,2,3]){const d=__fork(sd,f); for(const x of d.doors)if(x.descent)kinds[x.descent]=(kinds[x.descent]||0)+1;}
    for(const k of Object.keys(T.KITS)){T.newRun(k,0,{seed:5}); pools[k]=T.descentPool().slice();}
    /* where a descent stands is drawn before which one: with the Winch already walked (the pool a row shorter), the same door */
    let same=0, n=0;
    for(let sd=1;sd<=80;sd++)for(const f of [1,2,3]){const a=__fork(sd,f).doors.map(x=>!!x.descent);
      const T2=__t; T2.newRun('lamplighter',0,{seed:sd}); T2.run.descents=['winch']; T2.run.floor=f; T2.beginFloor(null);
      T2.F.foes=[]; T2.F.queue=[]; T2.F.wave=T2.F.def.waves.length; T2.F.phase='cleared'; T2.openDraft(40,0);
      const d2=T2.F.draft; d2.patron=null; d2.relics=0; d2.step='gift'; T2.F.blocking.choices[0].fn();
      const bb=T2.F.draft.doors.map(x=>!!x.descent); n++; if(JSON.stringify(a)===JSON.stringify(bb))same++;}
    const d=__fork(77,1); d.doors.forEach(x=>{delete x.descent; delete x.horror;}); const i=d.doors.findIndex(x=>!x.trial); d.doors[i].descent='winch'; T.showLanding();
    const btn=document.querySelectorAll('#mChoices .choice')[i];
    return {kinds,pools,keys:Object.keys(T.DESCENTS),same,n,tag:btn.querySelector('.tg').textContent,glyph:!!btn.querySelector('.tg svg.dsc-glyph'),sub:btn.textContent};
  });
  ok(door.kinds.winch>15&&door.kinds.carry>15&&door.kinds.smother>15,'The Winch is offered on the landings alongside the other descents',door.kinds);
  ok(door.keys.join()==='carry,mirror,binding,cast,smother,winch','its row is appended after The Smothering, so the pool keeps its order (§5.8)',door.keys);
  const sz=Object.fromEntries(Object.entries(door.pools).map(([k,v])=>[k,v.length]));
  ok(Object.values(door.pools).every(v=>v.includes('winch'))&&sz.galvanist===5&&sz.occultist===5&&Object.keys(sz).filter(k=>k!=='galvanist'&&k!=='occultist').every(k=>sz[k]===6),
    'every kit may draw it: the pool holds six, five for the Galvanist and the Occultist',sz);
  ok(door.same===door.n,'a seed’s descent doors stand where they did, however long the pool',{same:door.same,n:door.n});
  ok(/Descent: The Winch/.test(door.tag)&&door.glyph,'a Winch door carries the glyph and says which descent',door);
  ok(/purse/.test(door.sub)&&/tenth of the essence/.test(door.sub)&&/oil/.test(door.sub)&&/relic/.test(door.sub),'the door says what it pays and what it costs',door.sub);

  /* 2. taking it: the toll once, the shaft, the floor; the outcome pays the purses and takes the oil */
  await p.evaluate(()=>__t.setDescentAuto(null));
  const take=await p.evaluate(()=>{
    const T=__t, out={};
    const b0=__takeWinch(31,1,300);
    out.active=T.DESC.active; out.k=T.DESC.k; out.floor=T.run.floor; out.overlay=!document.getElementById('dscOverlay').hidden;
    out.hud=document.getElementById('dscHud').textContent; out.prompt=document.getElementById('dscPrompt').textContent;
    out.essMid=T.run.ess; out.purse=T.DESC.purse; out.tollPaid=T.run.ess<b0.essBefore; out.oilMid=T.run.oil; T.DESC.relicK=null;
    const sv=JSON.parse(localStorage.getItem('ll-save-v2')); out.saved={descent:sv.run.descent,ess:sv.run.ess,towers:sv.towers.length,draft:sv.draft};
    out.descents=T.run.descents.slice();
    T.descentFinish({caught:2,snags:1});
    out.after={active:T.DESC.active,floor:T.run.floor,phase:T.F.phase,ess:T.run.ess,stipend:T.F.def.stipend,oil:T.run.oil,
      embers:T.meta.embers,embersBefore:b0.embers,descent:T.run.descent,msg:document.getElementById('banner').textContent+' '+(T.MAP_SYS.pendingMsg||'')};
    return out;
  });
  ok(take.active&&take.k==='winch'&&take.overlay&&take.floor===2,'taking the door starts The Winch on the way to the next floor',take);
  ok(/Purses\s*0\s*of\s*3/.test(take.hud)&&/Oil lost\s*0\s*of\s*3/.test(take.hud)&&/left or right/.test(take.prompt),'its counts show the purses and the oil lost',[take.hud,take.prompt]);
  ok(take.tollPaid&&take.purse===Math.min(12,Math.max(4,Math.round(take.essMid*.1)))&&take.saved.descent&&take.saved.descent.k==='winch'&&take.saved.ess===take.essMid&&take.saved.towers===0&&take.saved.draft===null,
    'the toll is paid first, a purse is a tenth of what is left (4 to 12), and the checkpoint is at its start',{saved:take.saved,purse:take.purse,mid:take.essMid});
  ok(take.descents.join()==='winch','The Winch is marked walked',take.descents);
  ok(!take.after.active&&take.after.floor===2&&take.after.phase==='build'&&take.after.descent===null,'after the shaft the next floor begins',take.after);
  ok(take.after.ess===take.essMid+2*take.purse+take.after.stipend,'two purses caught: two tenths paid once, after the toll; the stipend lands as ever',take.after);
  ok(take.after.embers===take.after.embersBefore,'the shaft leaves no embers',take.after);

  /* 3. the result table: 0 to 3 caught × 0 to 5 snags; the purse at its floor and cap */
  const res=await p.evaluate(()=>{
    const T=__t, out={rows:[]}; __shaft(4,100); const C=T.DESC; C.relicK=null; C.purse=T.winchPurse(100);
    for(let c=0;c<=3;c++)for(let s=0;s<=5;s++){const r=T.winchResult({caught:c,snags:s}); out.rows.push([c,s,r.ess,r.oil,r.fail]);}
    out.purse=[T.winchPurse(0),T.winchPurse(60),T.winchPurse(500),T.winchPurse(-40)];
    out.def=T.winchResult({woke:0,spilt:0});
    const L=T.winchLine; out.lines=[L(T.winchResult({caught:0,snags:2}),true),L(T.winchResult({caught:3,snags:0}),true),L(T.winchResult({caught:1,snags:1}),false),L(T.winchResult({caught:0,snags:0}),false)];
    T.descentFinish({}); return out;});
  ok(res.rows.every(([c,s,e,o,f])=>e===c*10&&o===Math.min(s,3)&&f===(c===0)),'winchResult: each purse caught pays a purse; each snag 1 oil, 3 at most; none caught is the failure',res.rows.filter(([c,s,e,o,f])=>!(e===c*10&&o===Math.min(s,3)&&f===(c===0))));
  ok(res.purse.join()==='4,6,12,4','a purse is a tenth of what you arrive with: 4 for none (or a debt), 6 for 60, 12 for 500',res.purse);
  ok(res.def.caught===3&&res.def.oil===0&&!res.def.fail,'DESCENT_AUTO’s walk catches every purse and snags on nothing',res.def);
  ok(res.lines.every(l=>!/undefined|NaN/.test(l))&&/fell past/.test(res.lines[0])&&/2 oil/.test(res.lines[0])&&/three purses: 30 essence/.test(res.lines[1])&&/Nothing snagged/.test(res.lines[1])&&/10 essence/.test(res.lines[2])&&/1 oil/.test(res.lines[2]),'its lines read right',res.lines);

  /* 4. the pure roll, and the game by the step: a scripted lantern reaches every purse, over 200 seeds */
  const roll=await p.evaluate(()=>{
    const T=__t, K=T.WINCHK, out={noRandom:true};
    T.newRun('lamplighter',0,{seed:99}); T.run.floor=2;
    const mr=Math.random; let a,a2;
    Math.random=()=>{throw new Error('Math.random in winchLayout');};
    try{a=JSON.stringify(T.seeded(T.SALT.descent,7,T.winchLayout)); a2=JSON.stringify(T.seeded(T.SALT.descent,7,T.winchLayout));}catch(e){out.noRandom=false;}
    Math.random=mr;
    out.same=a===a2; out.own=a!==JSON.stringify(T.seeded(T.SALT.descent,6,T.castLayout));
    out.noPath=[]; out.missed=[]; out.planned=[]; out.chase=[]; out.lens=[]; out.idle=[]; out.free=[]; out.tight=[];
    for(let sd=1;sd<=200;sd++){
      const C=__shaft(sd); const path=__plan(C);
      /* every purse at a spot clear of ribs and arms, inside the walls, at the moment it arrives */
      out.free.push(C.ps.every(q=>T.winchFree(C,q.x,q.ta)));
      /* the last falls as the lantern threads the pair: the tightest gap */
      const pr=C.rb.filter(r=>r.pair), gap=4-pr[0].jut-pr[1].jut, others=C.rb.filter(r=>!r.pair).map(r=>4-r.jut);
      out.tight.push(Math.abs(C.ps[2].ta*K.SPEED-pr[0].d)<1e-6&&others.every(g=>g>gap));
      out.lens.push(+(C.len/K.SPEED).toFixed(1));
      if(!path){out.noPath.push(sd); T.descentFinish({}); continue;}
      T.descentFinish({});
      /* a careful thumb: a path that keeps 0.2 clear of the stone where there is one, steered by the cable's top with the swing */
      const C2=__shaft(sd), cp=__plan(C2,.2)||__plan(C2,.08), at=t=>cp[Math.max(0,Math.min(cp.length-1,Math.round(t*30)))];
      out.planned.push(__play(C2,__steer(D=>{const t=D.t+K.LAG; return [at(t),(at(t+1/30)-at(t))*30];}))); T.descentFinish({});
      /* a chaser: steers the cable's top for each glint as it shows and moves it with the swing; it dodges nothing */
      const r=__play(__shaft(sd),__steer(D=>{const q=D.ps.find(x=>x.st==='glint'||x.st==='fall'); if(q)D._g=q.x; return [D._g==null?0:D._g,0];}));
      out.chase.push(r); if(!r.caught)out.missed.push([sd,r]);
      T.descentFinish({});
      out.idle.push(__play(__shaft(sd),null)); T.descentFinish({});
    }
    return out;
  });
  ok(roll.noRandom,'winchLayout never calls Math.random (rule 11b)');
  ok(roll.same&&roll.own,'one seed lays out the same shaft twice, on its own sub-stream');
  ok(roll.free.every(Boolean),'every purse, over 200 seeds, falls where the lantern can wait for it');
  ok(roll.tight.every(Boolean),'the last purse arrives as the lantern threads the tightest gap in the shaft');
  ok(!roll.noPath.length,'over 200 seeds a scripted lantern can reach every purse (the catchable rule holds)',roll.noPath);
  /* changed on purpose (the swing, step 11): a lantern that swings on its cable can no longer be steered onto a path exactly, so
     the real step is judged by two thumbs instead of "a scripted path catches all three every time" */
  const av=(a,k)=>a.reduce((s,r)=>s+r[k],0)/a.length, chC=av(roll.chase,'caught'), chS=av(roll.chase,'snags'), pl=av(roll.planned,'snags');
  ok(!roll.missed.length&&chC>=2.7,'through the real step, swinging a beat behind on its cable, a thumb that chases each glint and steadies the swing catches nearly every purse, and never none',{caught:chC,none:roll.missed.slice(0,5)});
  ok(pl<=1.2&&pl<=chS*.55,'a thumb that reads the shaft and keeps clear of the arms snags far less than one that only chases: skill pays',{careful:pl,chaser:chS});
  ok(roll.lens.every(t=>t>=15&&t<=40),'every shaft lasts 15 to 40 seconds (never over 45)',[Math.min(...roll.lens),Math.max(...roll.lens)]);
  /* changed on purpose (Criss, playing #111): the middle was a safe lane. Arms now reach 1.9 of the 2 to a wall, across the
     middle, and the cable's jerks swing the lantern, so a lantern left alone snags */
  const idle=roll.idle.reduce((s,r)=>s+r.caught,0)/roll.idle.length, idleS=roll.idle.reduce((s,r)=>s+r.snags,0)/roll.idle.length,
    idleHit=roll.idle.filter(r=>r.snags>0).length/roll.idle.length;
  ok(idleS>=1&&idleHit>=.7&&idle<1.2,'a lantern left alone is no longer safe: the arms reach across the middle and the swing carries it, so it snags in most shafts and still catches only the purses that fall to it',{idle,idleS,idleHit});
  console.log('winch: idle catches',idle.toFixed(2),'snags',idleS.toFixed(2),'(snag in',(idleHit*100).toFixed(0)+'% of shafts) | chaser catches',chC.toFixed(2),'snags',chS.toFixed(2),'| careful snags',pl.toFixed(2),'| shaft',Math.min(...roll.lens),'-',Math.max(...roll.lens),'s');

  /* 4b. the swing (Criss, playing #111): the lantern hangs under the cable's top, which the thumb steers. The cable's jerks knock
     it sideways (rolled with the shaft, drawn last); a quick steer overshoots; moving the top with the swing bleeds it; the walls
     stop it dead. The same shaft swings the same way twice */
  const sway=await p.evaluate(()=>{
    const T=__t, K=T.WINCHK, out={};
    const free=(sd,f)=>{const C=__shaft(sd); C.rb=[]; C.am=[]; C.ps=[]; const xs=[]; let n=0; while(C.phase==='walk'&&n<900){if(f)f(C); T.winchStep(1/30); xs.push(+C.sw.toFixed(5)); n++;} T.descentFinish({}); return xs;};
    const amp=xs=>{const v=xs.slice(120); return Math.sqrt(v.reduce((q,x)=>q+x*x,0)/v.length);};
    const a=free(21), a2=free(21); out.same=a.join()===a2.join(); out.idleAmp=amp(a);
    /* a thumb that holds the cable's top in the middle and moves it with the swing, after the lantern */
    const st=free(21,C=>{C.tx=K.LAG*4*C.sw;}); out.steadyAmp=amp(st);
    /* the kicks: a fixed count, each a way and a strength of 0.4 to 1 */
    T.newRun('lamplighter',0,{seed:21}); T.run.floor=2; const L=T.seeded(T.SALT.descent,7,T.winchLayout);
    out.kicks=L.kk.length; out.kickOk=L.kk.every(k=>Math.abs(k)>=.4&&Math.abs(k)<=1); out.both=L.kk.some(k=>k<0)&&L.kk.some(k=>k>0);
    /* a quick steer overshoots: no kicks, the top sent a tile right and held there */
    let C=__shaft(21); C.rb=[]; C.am=[]; C.ps=[]; C.kk=[]; C.tx=1; let mx=0, sum=0; for(let i=0;i<180;i++){T.winchStep(1/30); mx=Math.max(mx,C.x); if(i>=120)sum+=C.x;}
    out.over=+mx.toFixed(2); out.settle=+(sum/60).toFixed(2); T.descentFinish({});
    /* the wall stops it dead */
    C=__shaft(21); C.rb=[]; C.am=[]; C.ps=[]; C.kk=[]; C.hx=C.tx=1.6; C.sv=6; for(let i=0;i<10&&C.x<K.W-K.LR-1e-9;i++)T.winchStep(1/30); out.wall={x:+C.x.toFixed(3),sv:C.sv,m:K.W-K.LR}; T.descentFinish({});
    return out;});
  ok(sway.same,'the same shaft swings the same way twice (a reload replays it)');
  ok(sway.kicks===await p.evaluate(()=>__t.WINCHK.KICKS)&&sway.kickOk&&sway.both,'the cable’s jerks are rolled with the shaft: a fixed count, either way, 0.4 to 1 of a kick',sway);
  ok(sway.idleAmp>=.1,'left alone, the jerks swing the lantern out under its cable, wider as they add up',sway);
  ok(sway.steadyAmp<sway.idleAmp*.8,'moving the cable’s top with the swing steadies the lantern: the knocks still land, but they no longer build',sway);
  ok(sway.over>1.05&&Math.abs(sway.settle-1)<.1,'a quick steer swings past where you sent it, and swings on around it',sway);
  ok(Math.abs(sway.wall.x-sway.wall.m)<1e-9&&sway.wall.sv===0,'the shaft’s wall stops the swing dead',sway.wall);

  /* 5. the drowned man's purse: the same for a seed, about one shaft in four, never cursed, an empty pool gives an ordinary one */
  const rel=await p.evaluate(()=>{
    const T=__t, out={};
    let n=0, cursed=0, last=0; const same=[];
    for(let sd=1;sd<=1000;sd++){const C=__shaft(sd); if(C.relicK){n++; if(T.RELICS[C.relicK].curse)cursed++; if(C.ps[2].relic&&!C.ps[0].relic&&!C.ps[1].relic)last++;} T.descentFinish({});}
    for(const sd of [3,7,11,19,23]){const a=__shaft(sd).relicK; T.descentFinish({}); const b2=__shaft(sd).relicK; T.descentFinish({}); same.push(a===b2);}
    out.n=n; out.cursed=cursed; out.last=last; out.same=same.every(Boolean);
    /* an empty pool: hold every relic the landing could offer */
    let sd=1; for(;sd<300;sd++){const C=__shaft(sd); const k=C.relicK; T.descentFinish({}); if(k)break;}
    T.newRun('lamplighter',0,{seed:sd}); T.run.floor=2; for(const k of T.relicPool(false))T.run.relics.push(k);
    T.run.descent={k:'winch',f0:1,msg:''}; T.startDescent(); out.empty={rk:T.DESC.relicK,relic:T.DESC.ps.some(q=>q.relic)};
    T.descentFinish({}); return out;});
  ok(rel.n>=200&&rel.n<=300,'about one shaft in four holds the drowned man’s purse',rel.n);
  ok(rel.cursed===0&&rel.last===rel.n,'it is never cursed, and it is always the last purse',rel);
  ok(rel.same,'one seed draws the same relic, or none, twice');
  ok(rel.empty.rk===null&&!rel.empty.relic,'with nothing left a landing could offer, the last purse is an ordinary one',rel.empty);
  /* caught: addRelic once, at the end; a reload before the end adds nothing */
  const relc=await p.evaluate(()=>{
    const T=__t, out={};
    let sd=1, k=null; for(;sd<300;sd++){__takeWinch(sd,1,200); k=T.DESC.relicK; if(k)break; T.descentFinish({});}
    out.k=k; out.held0=T.run.relics.includes(k);
    const save=JSON.parse(localStorage.getItem('ll-save-v2'));
    T.DESC.caught=3; T.DESC.relic=true; T.DESC.ps.forEach(q=>q.st='hook');
    T.resumeFrom(save); out.reload={active:T.DESC.active,held:T.run.relics.includes(k),k:T.DESC.relicK,caught:T.DESC.caught};
    const ess=T.run.ess;
    T.descentFinish({caught:3,snags:0,relic:true});
    out.after={held:T.run.relics.filter(x=>x===k).length,ess:T.run.ess-T.F.def.stipend-ess,purse:0,msg:T.MAP_SYS.pendingMsg||document.getElementById('banner').textContent};
    out.seen=JSON.parse(localStorage.getItem('ll-codex')||'{}');
    return out;});
  ok(relc.k&&!relc.held0,'a shaft with the drowned man’s purse names a relic you do not hold',relc);
  ok(relc.reload.active&&!relc.reload.held&&relc.reload.k===relc.k&&relc.reload.caught===0,'a reload before the end adds nothing, and draws the same relic',relc.reload);
  ok(relc.after.held===1,'caught, the relic is added once, at the end',relc.after);
  ok(relc.seen&&relc.seen.relics&&relc.seen.relics.includes(relc.k),'the Grimoire records it (through addRelic)',relc.seen&&relc.seen.relics);

  /* 6. snags: the grace, the lurch, the glow, the cap, and the last oil */
  const snag=await p.evaluate(()=>{
    const T=__t, K=T.WINCHK, out={};
    /* pressed against one rib for 3 s: a rib kept level with the lantern, the thumb's target inside it */
    let C=__shaft(5); C.am=[]; C.ps=[]; C.kk=[]; const r={side:-1,d:0,jut:1.2}; C.rb=[r];
    const times=[]; let n=0, still=null, x0=null;
    C.x=0; C.tx=-1.8; while(C.t<3-1e-9){r.d=C.pos+T.WINCHK.SPEED/30; const s0=C.snags; T.winchStep(1/30); n++;
      if(C.snags>s0){times.push(+C.t.toFixed(2)); if(still===null){still=0; x0=C.x;}}
      else if(still!==null&&C.lurch>0&&Math.abs(C.x-x0)<1e-9)still++;}
    out.times=times; out.still=still; out.glow=C.glow; out.lurchFrames=Math.round(K.LURCH*30);
    T.descentFinish({});
    /* the glow never under its floor, however many snags */
    C=__shaft(5); for(let i=0;i<6;i++)T.winchSnag(); out.glowMin=+C.glow.toFixed(2); out.res=T.winchResult(C); T.descentFinish({});
    /* at 1 oil, three snags leave the lamp at 1 and the floor begins */
    __takeWinch(9,1,100); T.run.oil=1; T.descentFinish({caught:1,snags:3}); out.dry={oil:T.run.oil,floor:T.run.floor,phase:T.F.phase,active:T.DESC.active};
    __takeWinch(9,2,100); const o0=T.run.oil; T.descentFinish({caught:0,snags:5}); out.full={lost:o0-T.run.oil,floor:T.run.floor,phase:T.F.phase};
    return out;});
  ok(snag.times.length===3&&snag.times.every((t,i)=>i===0||Math.abs(t-snag.times[i-1]-1)<.05),'pressed against one rib for 3 s: one snag a grace window, a second apart',snag.times);
  ok(snag.still>=snag.lurchFrames-2,'a snag holds the lantern still for its lurch',snag);
  ok(Math.abs(snag.glow-(2.6-.9))<1e-6&&snag.glowMin===1.7&&snag.res.oil===3,'each snag dims the glow a step, never under 1.7; the oil caps at 3',snag);
  ok(snag.dry.oil===1&&snag.dry.floor===2&&snag.dry.phase==='build'&&!snag.dry.active,'at 1 oil, three snags leave the lamp at 1 and the floor begins',snag.dry);
  ok(snag.full.lost===3&&snag.full.phase==='build','five snags cost the lamp three oil, no more',snag.full);

  /* 7. touch, for real: a sideways drag moves the lantern's target by the thumb's travel, not to the thumb */
  await p.evaluate(()=>{const T=__t; T.tutSet({walk:'done',seen:[],off:true}); __takeWinch(41,1,300);});
  await p.waitForTimeout(150);
  const cdp=await ctx.newCDPSession(p);
  const touch=async(type,x,y,id=1)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:type==='touchEnd'||type==='touchCancel'?[]:[{x,y,id}]});
  const g=await p.evaluate(()=>{const r=document.getElementById('dscOverlay').getBoundingClientRect(); return {u:__t.winchU(r.width,r.height),w:r.width,h:r.height};});
  const sx=g.w*.75, sy=g.h*.8;
  await touch('touchStart',sx,sy); await p.waitForTimeout(40);
  const down=await p.evaluate(()=>({tx:__t.DESC.tx,steer:!!__t.DESC.steer}));
  await touch('touchMove',sx-g.u,sy); await p.waitForTimeout(40); await touch('touchMove',sx-g.u*1.5,sy+20); await p.waitForTimeout(400);
  const moved=await p.evaluate(()=>({tx:+__t.DESC.tx.toFixed(2),x:+__t.DESC.x.toFixed(2),prompt:document.getElementById('dscPrompt').className}));
  await shot('winch-steer');
  await touch('touchEnd'); await p.waitForTimeout(60);
  const lifted=await p.evaluate(()=>({tx:+__t.DESC.tx.toFixed(2),steer:!!__t.DESC.steer,held:__t.DESC.held}));
  ok(down.steer&&down.tx===0,'a touch anywhere takes the lantern without moving it (relative, not under the thumb)',down);
  ok(Math.abs(moved.tx+1.5)<.05&&moved.x<-.5&&/is-gone/.test(moved.prompt),'a drag left a tile and a half moves it a tile and a half left, and the prompt goes',moved);
  ok(!lifted.steer&&!lifted.held&&Math.abs(lifted.tx+1.5)<.05,'a lift lets go; the lantern stays where it was going',lifted);
  /* pushing past a wall and coming back answers at once */
  await touch('touchStart',sx,sy); await touch('touchMove',sx-g.u*3,sy); await touch('touchMove',sx-g.u*2.8,sy); await p.waitForTimeout(40);
  const wall=await p.evaluate(()=>+__t.DESC.tx.toFixed(2)); await touch('touchEnd');
  ok(Math.abs(wall-(-1.8+.2))<.06,'past the wall the target stops at it, and coming back answers at once',wall);
  await touch('touchStart',sx,sy); await touch('touchMove',sx+g.u,sy); await p.waitForTimeout(30); await touch('touchCancel'); await p.waitForTimeout(60);
  const cancel=await p.evaluate(()=>({steer:!!__t.DESC.steer,held:__t.DESC.held,phase:__t.DESC.phase,snags:__t.DESC.snags}));
  ok(!cancel.steer&&!cancel.held&&cancel.phase==='walk'&&cancel.snags===0,'a cancelled touch lets go and costs nothing',cancel);
  await touch('touchStart',6,sy); await p.waitForTimeout(40);
  const edge=await p.evaluate(()=>!!__t.DESC.steer); await touch('touchEnd'); await p.waitForTimeout(40);
  ok(!edge,'a touch at the very edge (the back swipe) steers nothing');
  /* a purse caught on the hook: the count goes up */
  const hook=await p.evaluate(()=>{const T=__t, C=T.DESC, q=C.ps.find(x=>x.st!=='hook'&&x.st!=='miss'); C.rb=[]; C.am=[]; C.kk=[]; C.x=C.tx=C.hx=q.x; C.sw=C.sv=0; const n0=C.caught;
    while(q.st!=='hook'&&q.st!=='miss'&&C.t<30)T.winchStep(1/30); return {st:q.st,n:C.caught-n0};});
  ok(hook.st==='hook'&&hook.n===1,'under a purse when it arrives, the hook takes it',hook);
  await p.waitForTimeout(250); await shot('winch-caught');
  /* the end: the card waits for the thumb to lift, then 600 ms */
  await touch('touchStart',sx,sy); await p.waitForTimeout(60);
  await p.evaluate(()=>{const C=__t.DESC; C.pos=C.len; C.t=C.len/__t.WINCHK.SPEED;}); await p.waitForTimeout(800);
  const heldEnd=await p.evaluate(()=>({phase:__t.DESC.phase,card:!document.getElementById('dscCardWrap').hidden}));
  ok(heldEnd.phase==='out'&&!heldEnd.card,'the shaft’s foot ends the walk; while the thumb is still down, no card',heldEnd);
  await touch('touchEnd'); const up=Date.now();
  await p.waitForFunction(()=>!document.getElementById('dscCardWrap').hidden,null,{timeout:4000});
  ok(Date.now()-up>=560,'the result card shows 600 ms or more after the last lift',Date.now()-up);
  await shot('winch-card');
  const card=await p.evaluate(()=>({text:document.getElementById('dscCard').textContent,caught:__t.DESC.caught}));
  ok(/caught/.test(card.text)&&/essence/.test(card.text)&&/Tap to go down to/.test(card.text),'the card says what was caught and what it pays',card);
  const box=await p.evaluate(()=>{const r=document.getElementById('dscCard').getBoundingClientRect(); return [r.left,r.top,r.right,r.bottom].map(Math.round);});
  await touch('touchStart',(box[0]+box[2])/2,(box[1]+box[3])/2); await p.waitForTimeout(80);
  const onDown=await p.evaluate(()=>__t.DESC.active);
  await touch('touchEnd'); await p.waitForTimeout(200);
  const onClick=await p.evaluate(()=>({active:__t.DESC.active,floor:__t.run.floor,phase:__t.F.phase}));
  ok(onDown&&!onClick.active&&onClick.floor===2&&onClick.phase==='build','the card stays through pointerdown and goes on click; the floor begins',onClick);

  /* 8. resume in the middle: it plays again from the top, nothing paid; the end pays once */
  const resume=await p.evaluate(()=>{
    const T=__t, out={}, J=o=>JSON.parse(JSON.stringify(o));
    __takeWinch(55,2,250); T.DESC.relicK=null;
    const save=J(JSON.parse(localStorage.getItem('ll-save-v2'))), lay=JSON.stringify(T.DESC.ps.map(q=>[q.ta,q.x])), ess=T.run.ess, oil=T.run.oil, purse=T.DESC.purse;
    T.DESC.t=8; T.DESC.pos=7; T.DESC.caught=2; T.DESC.snags=2;
    T.resumeFrom(save);
    out.restart={active:T.DESC.active,k:T.DESC.k,pos:T.DESC.pos,caught:T.DESC.caught,snags:T.DESC.snags,same:JSON.stringify(T.DESC.ps.map(q=>[q.ta,q.x]))===lay,
      ess:T.run.ess===ess,oil:T.run.oil===oil,floor:T.run.floor};
    T.resumeFrom(save); T.resumeFrom(save); T.DESC.relicK=null;
    T.descentFinish({caught:2,snags:2});
    out.done={floor:T.run.floor,ess:T.run.ess,want:ess+2*purse+T.F.def.stipend,oil:T.run.oil,wantOil:Math.max(1,oil-2),descents:T.run.descents.join(),phase:T.F.phase};
    return out;
  });
  ok(resume.restart.active&&resume.restart.k==='winch'&&resume.restart.pos===0&&!resume.restart.caught&&!resume.restart.snags&&resume.restart.same,'a reload mid-shaft starts it again from the top: the same purses, nothing counted',resume.restart);
  ok(resume.restart.ess&&resume.restart.oil&&resume.restart.floor===3,'nothing is lost or paid on the reload',resume.restart);
  ok(resume.done.floor===3&&resume.done.ess===resume.done.want&&resume.done.oil===resume.done.wantOil&&resume.done.descents==='winch'&&resume.done.phase==='build','after three reloads, the purses and the snags each landed once',resume.done);

  /* 9. the first time, a tip card holds it until read */
  const tip=await p.evaluate(()=>{
    const T=__t; T.tutSet({walk:'done',seen:[],off:false});
    __takeWinch(61,1);
    const o={phase:T.DESC.phase,card:!document.getElementById('dscCardWrap').hidden,text:document.getElementById('dscCard').textContent};
    T.winchStep(.5); o.still=T.DESC.pos===0;
    document.getElementById('dscCard').click();
    o.after=T.DESC.phase; o.seen=!T.tipFresh('winch');
    T.descentFinish({});
    __takeWinch(62,2); o.second=T.DESC.phase; T.descentFinish({});
    T.tutSet({walk:'done',seen:[],off:true});
    return o;
  });
  ok(tip.phase==='tip'&&tip.card&&/left or right/.test(tip.text)&&/pale one holds a relic/.test(tip.text)&&tip.still,'the first Winch waits behind its tip',tip);
  ok(tip.after==='walk'&&tip.seen&&tip.second==='walk','tapping the tip starts the shaft; it is not shown again',tip);

  /* 10. taught: the rules line and the Grimoire's Descents page */
  const teach=await p.evaluate(()=>{
    const T=__t; T.newRun('lamplighter',0,{seed:3}); T.run.descents=['winch'];
    const rules=document.getElementById('rulesList').textContent;
    T.openBook('hud','descents');
    const ents=[...document.querySelectorAll('.book-e')].map(e=>e.textContent);
    const cv=document.querySelector('canvas[data-dicon="winch"]');
    let px=0; if(cv){const d=cv.getContext('2d').getImageData(0,0,cv.width,cv.height).data; for(let i=3;i<d.length;i+=4)if(d[i])px++;}
    return {rules:/The Winch:/.test(rules)&&/purse/.test(rules)&&/snag/.test(rules),entry:ents.find(t=>/The Winch/.test(t))||'',px};
  });
  ok(teach.rules,'"How the dark works" has a Winch line');
  ok(/Steer/.test(teach.entry)&&/Pays:/.test(teach.entry)&&/Costs:/.test(teach.entry)&&/Walked this descent/.test(teach.entry)&&teach.px>500,'the Grimoire’s Descents page has The Winch on it, painted',teach);

  /* 11. developer practice keeps nothing (rule 24) */
  const dev=await p.evaluate(()=>{
    const T=__t; T.newRun('whaler',0,{seed:8}); T.run.floor=1; T.beginFloor(null); T.setP(false);
    const before={save:localStorage.getItem('ll-save-v2'),floor:T.run.floor,ess:T.run.ess,oil:T.run.oil,relics:T.run.relics.join(),descents:JSON.stringify(T.run.descents||null)};
    const r=T.DEV_ACTS.descent('winch'); const mid=T.DESC.active&&T.DESC.practice&&T.DESC.k==='winch';
    T.DESC.caught=3; T.DESC.snags=3; T.DESC.relic=!!T.DESC.relicK; T.descentFinish();
    return {r,mid,same:localStorage.getItem('ll-save-v2')===before.save&&T.run.floor===before.floor&&T.run.ess===before.ess&&T.run.oil===before.oil&&T.run.relics.join()===before.relics&&JSON.stringify(T.run.descents||null)===before.descents,
      body:document.getElementById('mBody').textContent};
  });
  ok(dev.r===null&&dev.mid&&dev.same&&/The Winch, practised/.test(dev.body),'developer mode practises The Winch and keeps nothing',dev);
  await p.evaluate(()=>__t.closeModal&&__t.closeModal());

  /* 12. painted: a rib in the light shows and one past it is lost; the pale glint reads cold and the gold one warm; a snag
     shrinks the light; Lite and reduceMotion draw without error */
  await p.evaluate(()=>{const T0=__t; T0.setLite(false);});
  await p.evaluate(()=>{const C=__shaft(12); const T=__t; C.relicK=T.relicPool(false)[0]; C.ps=[{ta:C.t+1.9,x:-1,st:'glint',ct:0,relic:false},{ta:C.t+1.9,x:1,st:'glint',ct:0,relic:true}];
    C.am=[]; C.rb=[{side:-1,d:C.pos+.8,jut:1.2},{side:1,d:C.pos+3.6,jut:1.2}]; C.x=C.tx=C.rx=0; T.winchStep(.01);});
  await p.waitForTimeout(500);
  await shot('winch-glints');
  const px=await p.evaluate(()=>{const T=__t, C=T.DESC, K=T.WINCHK, cv=document.getElementById('dscCv'), c=cv.getContext('2d'), w=cv.width, h=cv.height, u=T.winchU(w,h);
    const avg=(x,y,r)=>{const d=c.getImageData(Math.round(x-r),Math.round(y-r),Math.round(r*2),Math.round(r*2)).data; let R=0,G=0,B=0; for(let i=0;i<d.length;i+=4){R+=d[i];G+=d[i+1];B+=d[i+2];} const n=d.length/4; return [R/n,G/n,B/n];};
    const gy=T.winchGlintY(h/devicePixelRatio,w/devicePixelRatio)*devicePixelRatio, fy=h*K.FY;
    const lum=a=>a[0]+a[1]+a[2];
    /* a rib's root, near the wall: one in the light, one far beyond it */
    const near=avg(w/2-1.85*u,fy+(C.rb[0].d-C.pos)*u,u*.08), far=avg(w/2+1.85*u,fy+(C.rb[1].d-C.pos)*u,u*.08), wallNear=avg(w/2-1.85*u,fy+(C.rb[0].d-C.pos+.6)*u,u*.08);
    return {gold:avg(w/2-u,gy,u*.12),pale:avg(w/2+u,gy,u*.12),gy,near:lum(near),wallNear:lum(wallNear),far:lum(far)};});
  /* coldness is blue less red: the pale glint is 40 colder than the gold. (Before this compared blue alone, which held only when
     the game had switched itself to Lite under load; in Full the gold star's white heart carries blue too, on main as here) */
  ok(px.gold[0]>px.gold[2]+15&&px.pale[2]>=px.pale[0]-4&&px.pale[1]>px.gold[1]-40&&(px.pale[2]-px.pale[0])>(px.gold[2]-px.gold[0])+40,'the gold glint reads warm and the drowned man’s cold and pale',px);
  ok(px.wallNear-px.near>8&&px.far<12,'a rib in the light shows dark against the lit stone; one beyond it is lost in the dark',px);
  const dim=await p.evaluate(()=>{const T=__t, C=T.DESC; const g0=C.glow; T.winchSnag(); T.winchSnag(); return [g0,C.glow];});
  ok(dim[1]<dim[0],'a snag shrinks the light',dim);
  await p.evaluate(()=>{const T=__t; T.setLite(true); const C=T.DESC; C.ps[0].st='fall'; C.ps[1].st='hook'; C.caught=1;});
  await p.waitForTimeout(250); await shot('winch-lite');
  await p.emulateMedia({reducedMotion:'reduce'}); await p.evaluate(()=>__t.setLite(false)); await p.waitForTimeout(250); await shot('winch-still');
  await p.emulateMedia({reducedMotion:'no-preference'});
  await p.evaluate(()=>{const T=__t; T.descentFinish({}); T.setDescentAuto({woke:0,spilt:0});});

  ok(!errs.length,'no page errors',errs);
  await b.close();
  if(fails.length){fails.forEach(f=>console.log('FAIL '+f)); process.exit(1);}
  console.log('winch: ok');
})();
