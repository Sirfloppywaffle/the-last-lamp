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

  // 4. Occultist Deed: Having 3 horrors bound at once
  await p.evaluate(()=>{
    const T=__t; T.newRun('lamplighter'); T.beginFloor(null);
    T.run.roster={watcher:1, gnasher:1, wretch:1};
    T.checkOccultistDeed();
  });
  const metaOccultist=await p.evaluate(()=>__t.meta);
  ok(metaOccultist.unlocked.includes('kit_occultist'), 'Occultist unlocked by having 3 horrors bound at once');

  // 5. Developer Mode: Unlocks kits and Grimoire without saving to ll-meta or ll-codex
  await p.evaluate(()=>{
    localStorage.clear();
    localStorage.setItem('ll-dev','true');
  });
  await p.reload(); await p.waitForTimeout(300);

  const devUnlocked=await p.evaluate(()=>{
    const K=__t.KITS;
    const m=__t.meta;
    const locks=Object.keys(K).map(k=>!__t.devOn&&K[k].lock&&!m.unlocked.includes(K[k].lock));
    return {devOn: __t.devOn, locks, meta: m};
  });
  ok(devUnlocked.devOn, 'devOn is true');
  ok(devUnlocked.locks.every(l=>!l), 'All kits are unlocked/selectable when devOn is true');

  // Turn devOn off and verify real progress is restored
  await p.evaluate(()=>{
    localStorage.setItem('ll-dev','false');
  });
  await p.reload(); await p.waitForTimeout(300);

  const metaRestored=await p.evaluate(()=>__t.meta);
  ok(!metaRestored.unlocked.includes('kit_whaler'), 'Turning dev mode off restored exact real progress');

  await b.close();
})();
