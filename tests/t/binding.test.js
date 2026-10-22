// The Binding and the pledge (Expansion 2, step 7; expansion/SEEDS-AND-MINI-FLOORS.md §5.1, §5.2, §5.4).
// - The door: never for the Galvanist; gated by what you hold (nothing to pledge, and it carries another descent or none);
//   it names the creature, a pure roll.
// - The pledge card, after the toll: Essence (a quarter, never under 20) and A relic; each greyed with a reason; back out to
//   the plain stair (nothing laid, not walked). The relic pull: 3 non-cursed, kept, the same after a step back or a reload.
// - The pot on every exit: a win gives the pledge back and binds the horror; a failure keeps it (a relic leaves, with what
//   it kept); a reload at the card shows it again; a reload mid-floor plays it again with the pledge still out and pays once.
// - The game: sigils that snap and never cross a dot, pure; a careful thumb binds in time; a wrong dot resets that sigil only;
//   a lift or a cancel only lets go; time out fails; never over 45 seconds.
// - Taught: tips, a rules line, a Grimoire page; developer practice keeps nothing.
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
    window.__fork=(seed,f,kit)=>{
      T.newRun(kit||'lamplighter',0,{seed}); T.run.floor=f; T.beginFloor(null);
      T.F.foes=[]; T.F.queue=[]; T.F.wave=T.F.def.waves.length; T.F.phase='cleared'; T.openDraft(40,0);
      const d=T.F.draft; d.patron=null; d.relics=0; d.step='gift'; T.F.blocking.choices[0].fn();
      return T.F.draft;
    };
    /* a Binding door on this landing, whatever the roll said, with the run holding ess essence and these relics; take it */
    window.__takeBinding=(seed,f,ess,relics,horror)=>{
      const d=__fork(seed,f); d.doors.forEach(x=>{delete x.descent; delete x.horror;});
      const i=d.doors.findIndex(x=>!x.trial&&x.room!=='deep'); d.doors[i].descent='binding'; d.doors[i].horror=horror||'gnasher'; d.doors[i].omen=null;
      T.run.relics=[]; (relics||[]).forEach(k=>T.addRelic(k)); T.run.ess=ess; d.salvage=0; T.showLanding();
      const keep=T.tollKeep(ess,0);
      T.chooseDoor(d,i); if(T.F.draft&&!T.F.draft.done)T.descend();
      return {keep};
    };
    window.__card=()=>({shown:!document.getElementById('modal').hidden,title:document.getElementById('mTitle').textContent,
      choices:[...document.querySelectorAll('#mChoices .choice')].map(c=>({cls:c.className,text:c.textContent})),
      acts:[...document.querySelectorAll('#mActions button')].map(x=>x.textContent),body:document.getElementById('mBody').textContent});
    window.__save=()=>JSON.parse(localStorage.getItem('ll-save-v2'));
  });
  await p.evaluate(()=>__t.setDescentAuto(null));

  /* 1. the door */
  const door=await p.evaluate(()=>{
    const T=__t, out={galv:0,lamp:0,impure:0,kinds:{},gatedPoor:0,poorAlt:0};
    for(let sd=1;sd<=120;sd++){
      for(const f of [1,2,3]){
        const g=__fork(sd,f,'galvanist'); if(g.doors.some(x=>x.descent==='binding'))out.galv++;
        const d=__fork(sd,f,'lamplighter'); const bd=d.doors.find(x=>x.descent==='binding');
        if(bd){out.lamp++; out.kinds[bd.horror]=(out.kinds[bd.horror]||0)+1;
          /* the same landing drawn again names the same creature */
          const d2=__fork(sd,f,'lamplighter'); const b2=d2.doors.find(x=>x.descent==='binding'); if(!b2||b2.horror!==bd.horror)out.impure++;}
        /* nothing to pledge: a run arriving with too little essence and no relic */
        T.newRun('lamplighter',0,{seed:sd}); T.run.floor=f; T.run.ess=10; T.run.relics=[];
        const dd=[{room:'merchant'},{room:'shrine'},{room:'rest'}]; T.seeded(T.SALT.descent,0,()=>T.descentDoor(dd)); const had=dd.some(x=>x.descent==='binding');
        T.descentGate({doors:dd,salvage:0}); if(had){if(dd.some(x=>x.descent==='binding'))out.gatedPoor++; else if(dd.some(x=>x.descent))out.poorAlt++;}
      }
    }
    /* the door's words name the creature */
    T.tutSet({walk:'done',seen:[],off:true});
    const d=__fork(77,1); d.doors.forEach(x=>{delete x.descent; delete x.horror;}); const i=d.doors.findIndex(x=>!x.trial); d.doors[i].descent='binding'; d.doors[i].horror='wretch'; T.showLanding();
    out.text=document.querySelectorAll('#mChoices .choice')[i].textContent;
    return out;
  });
  ok(door.galv===0,'the Galvanist is never offered The Binding',door.galv);
  ok(door.lamp>0,'the Lamplighter is offered The Binding',door);
  ok(Object.keys(door.kinds).every(k=>['gnasher','watcher','wretch','shrieker','elite'].includes(k))&&Object.keys(door.kinds).length>=3,'the door names a creature it can bind, and they vary',door.kinds);
  ok((door.kinds.elite||0)<=door.lamp*.2,'the Choirmaster is a rare draw, not a fifth of the doors',door.kinds);
  ok(!door.impure,'the same landing names the same creature',door.impure);
  ok(door.gatedPoor===0&&door.poorAlt>0,'with nothing to pledge, its door carries another descent instead',door);
  ok(/Descent: The Binding/.test(door.text)&&/Ichor Wretch|Wretch/.test(door.text)&&/pledge/.test(door.text),'the door says The Binding, the creature and the pledge',door.text);

  /* 2. the card, after the toll */
  const card=await p.evaluate(()=>{
    const T=__t, out={};
    T.tutSet({walk:'done',seen:[],off:false});
    const t=__takeBinding(41,1,400,['reserve','tallow','whetted','quiet','wax'],'gnasher');
    out.keep=t.keep; out.ess=T.run.ess; out.n=T.pledgeEss(); out.card=__card(); out.active=T.DESC.active; out.mini=JSON.parse(JSON.stringify(T.run.mini));
    out.saved=__save().run; out.saved={descent:__save().run.descent,mini:__save().run.mini,ess:__save().run.ess};
    out.tip=!!document.querySelector('#mBody .dsc-tip');
    T.tutSet({walk:'done',seen:[],off:true});
    return out;
  });
  ok(card.ess===card.keep&&card.card.title==='The Binding'&&card.card.shown&&!card.active,'the toll is paid, then the pledge card, before The Binding',card);
  ok(card.n===Math.round(card.keep*.25)&&card.card.choices[0].text.includes('Essence ('+card.n+')')&&!/off/.test(card.card.choices[0].cls),'Essence pledges a quarter of what the toll left',card);
  ok(/A relic/.test(card.card.choices[1].text)&&!/off/.test(card.card.choices[1].cls),'A relic is open with non-cursed relics held',card.card.choices);
  ok(card.card.acts.includes('Take the plain stair'),'the card has a way back to the plain stair',card.card.acts);
  ok(card.saved.descent&&card.saved.descent.k==='binding'&&card.saved.mini&&card.saved.mini.kind===null&&card.saved.ess===card.keep,'the card is saved: nothing laid yet',card.saved);
  ok(card.tip,'the first pledge card says what a pledge is',card);

  const grey=await p.evaluate(()=>{
    const T=__t, out={};
    __takeBinding(42,1,60,['wax'],'gnasher'); /* arrives with 18, only a cursed relic */
    out.a=__card(); out.ess=T.run.ess; out.active=T.DESC.active; out.floor=T.run.floor; out.phase=T.F.phase;
    __takeBinding(43,1,90,[],'gnasher'); /* arrives with 27, no relic */
    out.b=__card(); out.bn=T.pledgeEss();
    /* tapping a greyed kind does nothing */
    T.F.blocking.choices[1].fn(); out.bAfter=T.run.mini&&T.run.mini.pick;
    __takeBinding(45,1,-10,['tallow'],'gnasher'); out.debt=__card();
    return out;
  });
  ok(!grey.a.shown||grey.a.title!=='The Binding','with neither kind payable the card never shows',grey.a);
  ok(grey.floor===2&&grey.phase==='build'&&!grey.active,'…and the plain stair goes down to the floor',grey);
  ok(/off/.test(grey.b.choices[1].cls)&&/no relic/.test(grey.b.choices[1].text)&&!/off/.test(grey.b.choices[0].cls)&&grey.bn===20,'no relic: A relic is greyed and says why; the essence pledge is never under 20',grey.b);
  ok(!grey.bAfter,'a greyed kind does nothing when tapped',grey.bAfter);
  ok(/off/.test(grey.debt.choices[0].cls)&&/debt/.test(grey.debt.choices[0].text),'in debt, Essence is greyed and says why',grey.debt.choices[0]);
  const cursed=await p.evaluate(()=>{const T=__t; __takeBinding(44,1,300,['wax','glass'],'gnasher'); return __card();});
  ok(/off/.test(cursed.choices[1].cls)&&/Only cursed relics/.test(cursed.choices[1].text),'only cursed relics: A relic is greyed, and it says so',cursed.choices[1]);

  /* 3. the pot, on every way out */
  const pot=await p.evaluate(()=>{
    const T=__t, out={};
    const roster=k=>T.run.roster[k]||0;
    /* essence, bound */
    let t=__takeBinding(51,1,400,[],'watcher'); const n=T.pledgeEss(); T.F.blocking.choices[0].fn();
    out.w={mid:T.run.ess,keep:t.keep,n,active:T.DESC.active,k:T.DESC.k,pledge:T.DESC.pledge,savedEss:__save().run.ess,savedMini:__save().run.mini};
    const r0=roster('watcher'), b0=T.run.bound; T.descentFinish({done:3});
    out.w.after=T.run.ess; out.w.stip=T.F.def.stipend; out.w.roster=roster('watcher')-r0; out.w.bound=T.run.bound-b0; out.w.mini=T.run.mini; out.w.phase=T.F.phase; out.w.floor=T.run.floor;
    out.w.save=__save().run.mini||null;
    /* essence, broken */
    t=__takeBinding(52,1,400,[],'gnasher'); const n2=T.pledgeEss(); T.F.blocking.choices[0].fn(); const r1=roster('gnasher');
    T.descentFinish({done:2}); out.f={keep:t.keep,n:n2,after:T.run.ess,stip:T.F.def.stipend,roster:roster('gnasher')-r1,mini:T.run.mini};
    /* reload at the card: the card again, nothing laid */
    t=__takeBinding(53,1,400,[],'gnasher'); T.resumeFrom(__save());
    out.rc={card:__card(),ess:T.run.ess,keep:t.keep,active:T.DESC.active};
    /* reload mid-floor: plays again with the pledge still out, and pays once */
    T.F.blocking.choices[0].fn(); const n3=T.run.mini.n, mid=T.run.ess;
    T.resumeFrom(__save());
    out.rm={active:T.DESC.active,k:T.DESC.k,ess:T.run.ess,mid,mini:JSON.parse(JSON.stringify(T.run.mini)),done:T.DESC.done,pledge:T.DESC.pledge};
    T.resumeFrom(__save()); /* and once more, as quit to title and Continue does */
    T.descentFinish({done:3}); out.rm.after=T.run.ess; out.rm.stip=T.F.def.stipend; out.rm.n=n3;
    /* back out to the plain stair */
    t=__takeBinding(54,1,400,[],'gnasher'); T.F.blocking.actions.find(a=>/plain stair/.test(a.label)).fn();
    out.back={ess:T.run.ess,keep:t.keep,stip:T.F.def.stipend,mini:T.run.mini,descent:T.run.descent,walked:T.run.descents.slice(),phase:T.F.phase,floor:T.run.floor,active:T.DESC.active};
    return out;
  });
  ok(pot.w.mid===pot.w.keep-pot.w.n&&pot.w.savedEss===pot.w.mid&&pot.w.savedMini.kind==='ess'&&pot.w.savedMini.n===pot.w.n&&pot.w.active&&pot.w.k==='binding','laying essence takes it now, saved with the pledge out',pot.w);
  ok(pot.w.after===pot.w.keep+pot.w.stip,'a binding that holds gives the essence back, exactly',pot.w);
  ok(pot.w.roster===1&&pot.w.bound===1&&pot.w.mini===null&&!pot.w.save&&pot.w.phase==='build'&&pot.w.floor===2,'…binds the creature into the roster, and the pledge is settled',pot.w);
  ok(pot.f.after===pot.f.keep-pot.f.n+pot.f.stip&&pot.f.roster===0&&pot.f.mini===null,'a binding that breaks keeps the essence, and binds nothing',pot.f);
  ok(pot.rc.card.title==='The Binding'&&pot.rc.ess===pot.rc.keep&&!pot.rc.active,'a reload at the card shows it again, nothing laid',pot.rc);
  ok(pot.rm.active&&pot.rm.k==='binding'&&pot.rm.ess===pot.rm.mid&&pot.rm.mini.kind==='ess'&&pot.rm.done===0&&pot.rm.pledge&&pot.rm.pledge.n===pot.rm.n,'a reload mid-floor plays it again from the top, the pledge still out',pot.rm);
  ok(pot.rm.after===pot.rm.mid+pot.rm.n+pot.rm.stip,'…and, reloaded twice, pays the pledge back once',pot.rm);
  ok(pot.back.ess===pot.back.keep+pot.back.stip&&!pot.back.mini&&!pot.back.descent&&!pot.back.walked.includes('binding')&&pot.back.phase==='build'&&pot.back.floor===2&&!pot.back.active,'the plain stair: nothing laid, not walked, and the floor begins',pot.back);

  /* the relic pledge */
  const rel=await p.evaluate(()=>{
    const T=__t, out={};
    const held=['reserve','tallow','whetted','quiet','key','wax'];
    __takeBinding(61,1,10,held,'gnasher');
    out.first=__card(); T.F.blocking.choices[1].fn(); out.pull=T.run.mini.pull.slice(); out.pick=__card();
    /* back, and again: the same three */
    T.F.blocking.actions.find(a=>a.label==='Back').fn(); T.F.blocking.choices[1].fn(); out.pull2=T.run.mini.pull.slice();
    /* reload: the same three */
    T.resumeFrom(__save()); out.reCard=__card().title; if(!T.run.mini.pick)T.F.blocking.choices[1].fn(); out.pull3=T.run.mini.pull.slice();
    /* lay Oil Reserve if pulled (else the first), with spill in it */
    const k=out.pull.includes('reserve')?'reserve':out.pull[0]; out.k=k; T.run.spill=3;
    const i=out.pull.indexOf(k); T.F.blocking.choices[i].fn();
    out.during={held:T.run.relics.includes(k),active:T.DESC.active,mini:JSON.parse(JSON.stringify(T.run.mini)),hud:document.getElementById('dscHud').textContent};
    T.descentFinish({done:1});
    out.fail={held:T.run.relics.includes(k),spill:T.run.spill,oilMax:T.run.oilMax,others:held.filter(x=>x!==k).every(x=>T.run.relics.includes(x)),mini:T.run.mini};
    /* and a win keeps it */
    __takeBinding(62,1,10,['tallow','glass'],'gnasher'); T.F.blocking.choices[1].fn(); out.one=T.run.mini.pull.slice(); T.F.blocking.choices[0].fn(); T.descentFinish({done:3});
    out.win={held:T.run.relics.includes('tallow'),glass:T.run.relics.includes('glass')};
    /* Oil Reserve's pull, seeded: the same seed and landing pull the same three */
    const a=[]; for(let j=0;j<2;j++){__takeBinding(63,2,10,held,'gnasher'); T.F.blocking.choices[1].fn(); a.push(T.run.mini.pull.join());}
    out.samePull=a[0]===a[1];
    return out;
  });
  ok(/off/.test(rel.first.choices[0].cls)&&!/off/.test(rel.first.choices[1].cls),'arriving poor with relics: only A relic is open',rel.first.choices);
  ok(rel.pull.length===3&&!rel.pull.includes('wax')&&new Set(rel.pull).size===3,'A relic pulls three non-cursed relics',rel.pull);
  ok(rel.pick.choices.length===3&&rel.pick.acts.includes('Back'),'…and you pick one of them',rel.pick);
  ok(rel.pull2.join()===rel.pull.join()&&rel.pull3.join()===rel.pull.join()&&rel.reCard,'the pull is kept: a step back or a reload shows the same three',rel);
  ok(rel.during.held&&rel.during.mini.kind==='relic'&&rel.during.mini.relic===rel.k&&rel.during.active,'a pledged relic stays held, and working, while you draw',rel.during);
  ok(rel.during.hud.includes('Pledged'),'the counts show what is pledged',rel.during.hud);
  ok(!rel.fail.held&&rel.fail.others&&rel.fail.mini===null,'a binding that breaks takes the pledged relic, and only it',rel.fail);
  ok(rel.k!=='reserve'||rel.fail.spill===0,'losing Oil Reserve takes its spilled oil with it',rel.fail);
  ok(rel.one.join()==='tallow'&&rel.win.held&&rel.win.glass,'one relic the stone takes: it shows that one; a binding that holds keeps it',rel);
  ok(rel.samePull,'the same stair pulls the same three',rel.samePull);

  /* 4. the game */
  const game=await p.evaluate(()=>{
    const T=__t, K=T.BINDK, out={bad:[],cross:0,dups:0};
    /* every sigil: the right length, each dot once, no stroke through another dot; three different ones */
    for(let sd=1;sd<=200;sd++){T.newRun('lamplighter',0,{seed:sd}); T.run.floor=2+sd%3; const L=T.seeded(T.SALT.descent,3,T.bindLayout);
      L.sig.forEach((s,i)=>{if(s.length!==K.SEGS[i]+1||new Set(s).size!==s.length)out.bad.push([sd,i,s]);
        for(let j=1;j<s.length;j++){const dx=Math.abs(s[j]%3-s[j-1]%3), dy=Math.abs((s[j]/3|0)-(s[j-1]/3|0)); if(dx%2===0&&dy%2===0)out.cross++;}});
      if(new Set(L.sig.map(s=>s.join())).size!==L.sig.length)out.dups++;
      const L2=T.seeded(T.SALT.descent,3,T.bindLayout); if(JSON.stringify(L)!==JSON.stringify(L2))out.impure=(out.impure||0)+1;}
    /* play it with synthetic touches through the frame's own handlers */
    const ev=(type,x,y,id)=>new PointerEvent(type,{pointerId:id||7,clientX:x,clientY:y,bubbles:true,pointerType:'touch',isPrimary:true});
    const cv=document.getElementById('dscCv');
    const start=sd=>{T.newRun('lamplighter',0,{seed:sd}); T.run.floor=2; T.run.mini={k:'binding',horror:'gnasher',kind:'ess',n:30}; T.run.descent={k:'binding',f0:1,msg:''}; T.startDescent(); T.DESC.phase='walk'; return T.DESC;};
    const run=(s)=>{for(let i=0;i<s;i++){T.bindStep(1/30); T.descentFrame&&0;}};
    const at=i=>{const G=T.bindGeo(); return T.bindDotXY(i,G);};
    /* a careful hand: about a second to find the sigil, a third of a second a stroke */
    const trace=(C,s,wander)=>{let xy=at(s[0]); cv.dispatchEvent(ev('pointerdown',xy[0],xy[1])); run(10);
      for(let j=1;j<s.length;j++){const a=at(s[j-1]), b2=at(s[j]); for(let q=1;q<=6;q++){window.dispatchEvent(ev('pointermove',a[0]+(b2[0]-a[0])*q/6,a[1]+(b2[1]-a[1])*q/6))} run(10);
        if(wander&&j===2){const w=[0,1,2,3,4,5,6,7,8].find(x=>!s.slice(0,3).includes(x)&&x!==s[3]); const wx=at(w); window.dispatchEvent(ev('pointermove',wx[0],wx[1])); return 'wander';}}
      xy=at(s[s.length-1]); window.dispatchEvent(ev('pointerup',xy[0],xy[1])); run(30); return 'ok';};
    out.careful=[];
    for(let sd=1;sd<=20;sd++){const C=start(sd); for(let q=0;q<3;q++)trace(C,C.sig[q]); out.careful.push({done:C.done,t:+C.t.toFixed(1),phase:C.phase});
      run(40); T.descentFrame(.05); out.cardShown=out.cardShown||!document.getElementById('dscCardWrap').hidden; T.descentFinish({});}
    /* a wandering stroke: that sigil starts again, the ones bound stay bound */
    let C=start(5); trace(C,C.sig[0]); const before=C.done; const r=trace(C,C.sig[1],true);
    out.wander={before,after:C.done,prog:C.prog,wrong:C.wrong,r};
    window.dispatchEvent(ev('pointerup',0,0)); run(5);
    /* a lift mid-sigil lets it go; a cancel likewise, and neither fails */
    const s=C.sig[1], a0=at(s[0]), a1=at(s[1]); cv.dispatchEvent(ev('pointerdown',a0[0],a0[1])); window.dispatchEvent(ev('pointermove',a1[0],a1[1]));
    const mid=C.prog; window.dispatchEvent(ev('pointerup',a1[0],a1[1])); out.lift={mid,after:C.prog,phase:C.phase,done:C.done};
    cv.dispatchEvent(ev('pointerdown',a0[0],a0[1])); window.dispatchEvent(ev('pointermove',a1[0],a1[1])); window.dispatchEvent(ev('pointercancel',a1[0],a1[1]));
    out.cancel={prog:C.prog,phase:C.phase,done:C.done};
    /* an idle thumb: the lantern passes, it fails */
    run(Math.ceil(K.TIME*30)+5); out.idle={phase:C.phase,done:C.done,t:+C.t.toFixed(1),fail:T.bindResult(C).fail};
    run(60); T.descentFrame(.05); out.idleCard=!document.getElementById('dscCardWrap').hidden;
    T.descentFinish({});
    return out;
  });
  ok(!game.bad.length&&!game.cross&&!game.dups&&!game.impure,'sigils: the right lengths, each dot once, never through a dot, three different, pure',game);
  ok(game.careful.every(r=>r.done===3&&r.phase==='out'&&r.t<=27),'a careful hand binds all three in time',game.careful);
  ok(game.cardShown,'the card shows after the last lift',game.cardShown);
  ok(game.wander.before===1&&game.wander.after===1&&game.wander.prog===0&&game.wander.wrong===1,'a wandering stroke resets that sigil only',game.wander);
  ok(game.lift.mid===2&&game.lift.after===0&&game.lift.phase==='walk'&&game.cancel.prog===0&&game.cancel.phase==='walk','a lift or a cancel only lets the sigil go; nothing fails',[game.lift,game.cancel]);
  ok(game.idle.phase==='out'&&game.idle.done<3&&game.idle.fail&&game.idle.t<=45,'an idle thumb: the lantern passes and it fails, inside 45 seconds',game.idle);
  ok(game.idleCard,'the card shows when the lantern has passed',game.idleCard);
  console.log('binding: careful secs',(game.careful.reduce((s,r)=>s+r.t,0)/game.careful.length).toFixed(1),'| time',await p.evaluate(()=>__t.BINDK.TIME));

  /* 5. taught, and practice keeps nothing */
  const taught=await p.evaluate(()=>{
    const T=__t, out={};
    out.tips=!!(T.TIPS.binding&&T.TIPS.pledge&&T.TIPS.binding.text&&T.TIPS.pledge.text);
    out.rules=/<i>The Binding:<\/i>[^<]*pledge/.test(document.body.innerHTML);
    T.newRun('lamplighter',0,{seed:9}); T.run.descents=['binding']; T.beginFloor(null); T.openBook('hud','descents');
    out.book=[...document.querySelectorAll('.book-list')].map(x=>x.textContent).join(' ');
    const ess=T.run.ess, rs=JSON.stringify(T.run.roster);
    T.DEV_ACTS.descent('binding'); out.prac=T.DESC.active&&T.DESC.k==='binding'&&!T.DESC.pledge;
    T.descentFinish({done:3}); out.kept=T.run.ess===ess&&JSON.stringify(T.run.roster)===rs&&!T.run.mini;
    return out;
  });
  ok(taught.tips,'a tip for The Binding and for the pledge');
  ok(taught.rules,'How the dark works says what The Binding and the pledge are');
  ok(/The Binding/.test(taught.book)&&/pledge/.test(taught.book),'the Grimoire’s Descents page has The Binding',taught.book.slice(0,300));
  ok(taught.prac&&taught.kept,'practice in developer mode pledges nothing and keeps nothing',taught);

  /* 6. the tab is closed at the card, then Continue from a fresh page: the card, then The Binding, then the floor */
  await p.evaluate(()=>{__t.setDescentAuto(null); __takeBinding(71,1,400,[],'shrieker');});
  await p.reload(); await p.waitForTimeout(400);
  const fresh=await p.evaluate(()=>{const T=__t; T.setDescentAuto(null); document.getElementById('continueBtn').click();
    const o={card:document.getElementById('mTitle').textContent,shown:!document.getElementById('modal').hidden};
    const b2=[...document.querySelectorAll('#mChoices .choice')][0]; b2.click(); o.active=T.DESC.active&&T.DESC.k==='binding';
    T.descentFinish({done:3}); o.phase=T.F&&T.F.phase; o.roster=T.run.roster.shrieker||0; o.mini=T.run.mini; return o;});
  ok(fresh.shown&&fresh.card==='The Binding'&&fresh.active&&fresh.phase==='build'&&fresh.roster>=1&&fresh.mini===null,'Continue on a fresh page at the card: the card, The Binding, then the floor',fresh);

  ok(!errs.length,'no page errors',errs);
  await b.close();
  if(fails.length){fails.forEach(f=>console.log('FAIL '+f)); process.exit(1);}
  console.log('binding ok');
})().catch(e=>{console.log('FAIL '+e.stack); process.exit(1);});
