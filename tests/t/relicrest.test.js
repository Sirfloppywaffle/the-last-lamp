// The relic switch (#29): number-only relics stay off the stair while patrons are tested; a run that carries one keeps it.
const {chromium}=require('playwright');
const fails=[]; const ok=(c,m,d)=>{if(!c)fails.push(m+(d!==undefined?' '+JSON.stringify(d):''));};
(async()=>{
  const b=await chromium.launch(); const p=await b.newPage({viewport:{width:412,height:860}});
  await p.goto('file://'+process.argv[2]); await p.waitForTimeout(300);
  const r=await p.evaluate(()=>{const T=__t, out={};
    localStorage.setItem('ll-meta',JSON.stringify({unlocked:['relics_deep','relics_forbidden']}));
    T.newRun('lamplighter',0);
    const seen=new Set(); for(let i=0;i<300;i++)T.relicPool(false).forEach(k=>seen.add(k));
    out.pool=[...seen].sort(); out.cursed=T.relicPool(true).sort();
    out.resting=T.RESTING;
    // a carried resting relic still works: Whetted Barbs on a saved run
    T.addRelic('whetted'); T.run.ess=999; T.setP(false);
    const tiles=[]; for(let r=0;r<T.ROWS;r++)for(let c=0;c<T.COLS;c++)if(T.placeProblem({kind:'ward',type:'harpoon'},c,r)==='')tiles.push([c,r]);
    T.setSel({kind:'ward',type:'harpoon'}); T.tryPlace(...tiles[0]); T.setSel(null);
    out.whetted=Math.round(T.wstat(T.F.towers[0]).dmg);
    // the altar gives the Brined Ledger while the salt relics rest
    T.run.relics=[]; const ev=T.EVENTS.altar.opts[0]; const res=ev.fn(); out.altar={has:T.run.relics.slice(), text:res.text};
    localStorage.removeItem('ll-meta');
    return out;});
  console.log(JSON.stringify(r));
  ok(r.resting.every(k=>!r.pool.includes(k)),'no resting relic is offered',r.pool);
  ok(['veil','compass','binder','ledger','shadow'].every(k=>r.pool.includes(k)),'the rule-changing relics are still offered',r.pool);
  ok(r.cursed.length>=6,'cursed relics are untouched',r.cursed);
  ok(r.whetted===13,'a carried resting relic still works (Whetted Barbs: 10 → 13)',r.whetted);
  ok(r.altar.has.join()==='ledger','the altar gives the Brined Ledger instead',r.altar);
  fails.forEach(f=>console.log('FAIL '+f)); await b.close(); process.exitCode=fails.length?1:0;
})();
