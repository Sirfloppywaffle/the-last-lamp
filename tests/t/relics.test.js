// Test relic add/remove symmetry, double-curse independence in both orders,
// ownership guard, and legacy saves.
const {chromium}=require('playwright');
const fails=[]; const ok=(cond,msg,detail)=>{if(!cond)fails.push(msg+(detail!==undefined?' '+JSON.stringify(detail):''));};
(async()=>{
  const b=await chromium.launch(); const p=await b.newPage({viewport:{width:900,height:700}});
  await p.goto('file://'+process.argv[2]); await p.waitForTimeout(300);

  const r=await p.evaluate(()=>{
    const T=__t, out={};

    // 1. Oil Reserve (#89): no capacity any more. At full oil, its 4 spill instead of being lost
    T.newRun('lamplighter', 0);
    T.addRelic('reserve');
    out.reserveAdded={oilMax:T.run.oilMax,oil:T.run.oil,spill:T.run.spill};
    T.removeRelic('reserve');
    out.reserveRemoved={oilMax:T.run.oilMax};

    // 2. Double-curse order 1 (glass then hollow): oilMax 10 -> add glass (6) -> add hollow (6) -> remove glass (6) -> remove hollow (10)
    T.newRun('lamplighter', 0);
    T.run.oilMax=10; T.run.oil=10;
    T.addRelic('glass');
    out.doubleGlassFirstAddedGlass={oilMax:T.run.oilMax};
    T.addRelic('hollow');
    out.doubleGlassFirstAddedHollow={oilMax:T.run.oilMax};
    T.removeRelic('glass');
    out.doubleGlassFirstRemovedGlass={oilMax:T.run.oilMax};
    T.removeRelic('hollow');
    out.doubleGlassFirstRemovedHollow={oilMax:T.run.oilMax};

    // 3. Double-curse order 2 (hollow then glass): oilMax 10 -> add hollow (6) -> add glass (6) -> remove hollow (6) -> remove glass (10)
    T.newRun('lamplighter', 0);
    T.run.oilMax=10; T.run.oil=10;
    T.addRelic('hollow');
    out.doubleHollowFirstAddedHollow={oilMax:T.run.oilMax};
    T.addRelic('glass');
    out.doubleHollowFirstAddedGlass={oilMax:T.run.oilMax};
    T.removeRelic('hollow');
    out.doubleHollowFirstRemovedHollow={oilMax:T.run.oilMax};
    T.removeRelic('glass');
    out.doubleHollowFirstRemovedGlass={oilMax:T.run.oilMax};

    // 4. Ownership guard: removing a relic not held does nothing
    T.newRun('lamplighter', 0);
    T.removeRelic('glass');
    out.unheldRemoved={oilMax:T.run.oilMax};

    // 5. Legacy save test: old save without relicDeltas object removes default amounts safely
    T.newRun('lamplighter', 0);
    T.run.relics=['reserve', 'glass', 'hollow'];
    T.run.oilMax=22;
    delete T.run.relicDeltas;
    delete T.run.baseOilMax;
    T.removeRelic('reserve');
    out.legacyReserveRemoved={oilMax:T.run.oilMax};
    T.removeRelic('glass');
    out.legacyGlassRemoved={oilMax:T.run.oilMax};

    return out;
  });

  console.log(JSON.stringify(r));
  ok(r.reserveAdded.oilMax===20&&r.reserveAdded.oil===20&&r.reserveAdded.spill===4,'Oil Reserve leaves capacity alone and spills its 4 oil at full',r.reserveAdded);
  ok(r.reserveRemoved.oilMax===20,'Oil Reserve removal restores oilMax to 20',r.reserveRemoved);

  ok(r.doubleGlassFirstAddedGlass.oilMax===6&&r.doubleGlassFirstAddedHollow.oilMax===6,'Double curse order 1: glass and hollow both clamp oilMax to 6',r.doubleGlassFirstAddedHollow);
  ok(r.doubleGlassFirstRemovedGlass.oilMax===6,'Double curse order 1: removing glass keeps oilMax at 6 while hollow is held',r.doubleGlassFirstRemovedGlass);
  ok(r.doubleGlassFirstRemovedHollow.oilMax===10,'Double curse order 1: removing hollow restores oilMax to 10',r.doubleGlassFirstRemovedHollow);

  ok(r.doubleHollowFirstAddedHollow.oilMax===6&&r.doubleHollowFirstAddedGlass.oilMax===6,'Double curse order 2: hollow and glass both clamp oilMax to 6',r.doubleHollowFirstAddedGlass);
  ok(r.doubleHollowFirstRemovedHollow.oilMax===6,'Double curse order 2: removing hollow keeps oilMax at 6 while glass is held',r.doubleHollowFirstRemovedHollow);
  ok(r.doubleHollowFirstRemovedGlass.oilMax===10,'Double curse order 2: removing glass restores oilMax to 10',r.doubleHollowFirstRemovedGlass);

  ok(r.unheldRemoved.oilMax===20,'Removing a relic not held does nothing',r.unheldRemoved);

  // the old Oil Reserve's +4 stays in a legacy save's base (it no longer counts as the relic's), so removing it changes nothing
  ok(r.legacyReserveRemoved.oilMax===22,'Legacy save keeps the capacity the old Oil Reserve gave',r.legacyReserveRemoved);
  ok(r.legacyGlassRemoved.oilMax===28,'Legacy save without deltas adds default 6 for glass',r.legacyGlassRemoved);

  for(const f of fails)console.log('FAIL '+f);
  if(fails.length)process.exitCode=1; else console.log('all relic tests ok');
  await b.close();
})();
