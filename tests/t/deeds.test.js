const {chromium}=require('playwright');
const file='file://'+process.argv[2], out=process.argv[3];
(async()=>{
  const b=await chromium.launch(); const ctx=await b.newContext({viewport:{width:1100,height:900}}); const p=await ctx.newPage();
  const errs=[]; p.on('pageerror',e=>errs.push(e.message)); p.on('console',m=>{if(m.type()==='error'&&!m.text().includes('ERR_TUNNEL'))errs.push(m.text());});
  await p.goto(file); await p.waitForTimeout(400);

  const fail=(msg)=>{console.log('FAIL '+msg); process.exitCode=1;};
  const ok=(cond,msg)=>{if(!cond)fail(msg); else console.log('OK '+msg);};

  // 1. Initial lock state (only Lamplighter is unlocked by default)
  const meta0=await p.evaluate(()=>__t.meta);
  ok(!meta0.unlocked.includes('kit_whaler'), 'Whaler is locked initially');
  ok(!meta0.unlocked.includes('kit_occultist'), 'Occultist is locked initially');

  // 2. Whaler Deed: Kill Trench Behemoth with non-harpoon damage fails deed
  await p.evaluate(()=>{
    const T=__t; T.newRun('lamplighter'); T.beginFloor(null);
    const e=T.spawnFoe('behemoth',0,1);
    T.hurt(e, 5, 'chime');
    T.hurt(e, e.hp, 'harpoon');
  });
  const metaFail=await p.evaluate(()=>__t.meta);
  ok(!metaFail.unlocked.includes('kit_whaler'), 'Whaler NOT unlocked if Behemoth took chime damage');

  // 3. Whaler Deed: Kill Trench Behemoth with harpoons alone unlocks Whaler
  await p.evaluate(()=>{
    const T=__t; T.newRun('lamplighter'); T.beginFloor(null);
    const e=T.spawnFoe('behemoth',0,1);
    T.hurt(e, e.hp, 'harpoon');
  });
  const metaWhaler=await p.evaluate(()=>__t.meta);
  ok(metaWhaler.unlocked.includes('kit_whaler'), 'Whaler unlocked by harpoon-only Behemoth kill');

  // 4. Occultist Deed: break a wave with madness at Slipping or deeper (binding three is no longer enough)
  const SLIP=`window.__slip=(types)=>{const T=__t; T.setP(false);
    types.forEach((ty,i)=>T.F.towers.push({kind:'horror',type:ty,id:7000+i,c:0,r:i,x:.5,y:i+.5,br:{},cd:9,ang:0}));
    T.F.phase='wave'; T.F.wave=1; T.F.queue=[]; T.F.foes.forEach(e=>e.dead=true); T.update(.01);}`;
  const occ=await p.evaluate((src)=>{eval(src); const T=__t, out={};
    T.newRun('lamplighter'); T.beginFloor(null);
    T.run.roster={watcher:1, gnasher:1, wretch:1}; T.checkOccultistDeed();
    out.bound=T.meta.unlocked.includes('kit_occultist');
    __slip(['gnasher','watcher']); out.whispers=T.meta.unlocked.includes('kit_occultist');
    T.newRun('lamplighter'); T.beginFloor(null);
    __slip(['shrieker','shrieker','gnasher']); out.slipping=T.meta.unlocked.includes('kit_occultist');
    return out;},SLIP);
  ok(!occ.bound, 'binding three horrors no longer earns the Occultist');
  ok(!occ.whispers, 'a wave broken at Whispers does not either');
  ok(occ.slipping, 'Occultist unlocked by breaking a wave at Slipping');

  // 4b. A save that earned the Occultist the old way earns it again; a newer save keeps it
  await p.evaluate(()=>localStorage.setItem('ll-meta',JSON.stringify({embers:5,unlocked:['kit_occultist','kit_whaler'],lastKit:'occultist'})));
  await p.reload(); await p.waitForTimeout(300);
  const mig=await p.evaluate(()=>JSON.parse(localStorage.getItem('ll-meta')));
  await p.evaluate(()=>{const m=JSON.parse(localStorage.getItem('ll-meta')); m.unlocked.push('kit_occultist'); localStorage.setItem('ll-meta',JSON.stringify(m));});
  await p.reload(); await p.waitForTimeout(300);
  const kept=await p.evaluate(()=>JSON.parse(localStorage.getItem('ll-meta')));
  console.log(JSON.stringify({mig,kept}));
  ok(!mig.unlocked.includes('kit_occultist')&&mig.unlocked.includes('kit_whaler')&&mig.deeds===2&&mig.lastKit==='lamplighter', 'an old save loses the Occultist once, keeps the rest');
  ok(kept.unlocked.includes('kit_occultist'), 'once migrated, an Occultist earned again stays');

  // 5. The deed tip is an ordinary tip: never with "No more tips", never over another tip, and it waits for a floor
  const tips=await p.evaluate((src)=>{eval(src); const T=__t, out={};
    localStorage.removeItem('ll-meta');
    T.newRun('lamplighter'); T.setP(false); T.F.born=-1e6;
    T.tutSet({walk:'done',seen:[],off:true});
    __slip(['shrieker','shrieker','gnasher']); T.F.phase='build'; T.coachPoll();
    out.offUnlocked=T.meta.unlocked.includes('kit_occultist'); out.offShown=T.COACH.on;
    localStorage.removeItem('ll-meta');
    T.newRun('lamplighter'); T.setP(false); T.F.born=-1e6;
    T.tutSet({walk:'done',seen:[],off:false});
    T.coachRun('tip','madness',[{title:'Madness',text:'x'},{title:'Madness 2',text:'y'}]);
    const e=T.spawnFoe('behemoth',0,1); T.hurt(e,e.hp,'harpoon'); T.coachPoll();
    out.during=T.COACH.key;
    document.querySelector('#coachActs [data-coach="next"]').click(); document.querySelector('#coachActs [data-coach="next"]').click();
    out.madnessSeen=T.tut().seen.includes('madness');
    T.coachPoll(); out.after=T.COACH.key; out.afterTitle=document.querySelector('#coachTitle').textContent;
    return out;},SLIP);
  console.log(JSON.stringify(tips));
  ok(tips.offUnlocked&&!tips.offShown, 'with "No more tips", the deed still unlocks but shows no tip');
  ok(tips.during==='madness'&&tips.madnessSeen, 'a deed never cuts into a tip already on screen');
  ok(tips.after==='deed_whaler'&&/deed/i.test(tips.afterTitle), 'the deed tip follows once the screen is free');

  // 6. Developer mode opens every kit and Grimoire page, and saves none of it
  const seededMeta={embers:12,unlocked:['kit_galvanist'],depth:0,runs:3,wins:0,lastDepth:0,lastKit:'lamplighter'};
  const seededCodex={foes:['crawler'],relics:[]};
  await p.evaluate(([m,c])=>{localStorage.clear(); localStorage.setItem('ll-meta',JSON.stringify(m)); localStorage.setItem('ll-codex',JSON.stringify(c)); localStorage.setItem('ll-dev','true'); localStorage.setItem('ll-tut',JSON.stringify({walk:'done',seen:[],off:true}));},[seededMeta,seededCodex]);
  await p.reload(); await p.waitForTimeout(300);
  const dev=await p.evaluate((src)=>{const T=__t, out={devOn:T.devOn};
    T.openKitPicker(); out.lockedChoices=document.querySelectorAll('#mChoices .choice.off').length;
    T.openBook('title','foes'); out.unmet=document.querySelectorAll('#mChoices .is-locked').length;
    T.openBook('title','kits'); out.lockedKits=document.querySelectorAll('#mChoices .is-locked').length;
    T.newRun('occultist'); T.setP(false);
    eval(src); __slip(['shrieker','shrieker','gnasher']);
    const e=T.spawnFoe('behemoth',0,1); T.hurt(e,e.hp,'harpoon');
    T.spawnFoe('stalker',0,2);
    return out;},SLIP);
  ok(dev.devOn, 'dev mode is on');
  ok(dev.lockedChoices===0, 'every kit can be chosen in dev mode');
  ok(dev.unmet===0&&dev.lockedKits===0, 'every Grimoire page is open in dev mode');
  // turn dev mode off: real progress is exactly what it was
  await p.evaluate(()=>localStorage.setItem('ll-dev','false')); await p.reload(); await p.waitForTimeout(300);
  const back=await p.evaluate(()=>({meta:localStorage.getItem('ll-meta'),codex:localStorage.getItem('ll-codex'),devOn:__t.devOn}));
  console.log(JSON.stringify({dev,back}));
  ok(!back.devOn, 'dev mode is off');
  ok(JSON.stringify(JSON.parse(back.meta))===JSON.stringify(seededMeta), 'll-meta is exactly the real progress');
  ok(JSON.stringify(JSON.parse(back.codex))===JSON.stringify(seededCodex), 'll-codex is exactly the real progress');

  await b.close();
})();
