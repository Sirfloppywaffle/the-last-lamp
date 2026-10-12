// Test relic add/remove symmetry for Oil Reserve, Glass Lantern, and Hollow Crown,
// including clamped oilMax capacity cases and legacy saves without recorded deltas.
const {chromium}=require('playwright');
const fails=[]; const ok=(cond,msg,detail)=>{if(!cond)fails.push(msg+(detail!==undefined?' '+JSON.stringify(detail):''));};
(async()=>{
  const b=await chromium.launch(); const p=await b.newPage({viewport:{width:900,height:700}});
  await p.goto('file://'+process.argv[2]); await p.waitForTimeout(300);

  const r=await p.evaluate(()=>{
    const T=__t, out={};

    // 1. Oil Reserve (reserve) test: adding adds 4 capacity, removing takes back exactly 4
    T.newRun('lamplighter', 0);
    const origReserveOilMax=T.run.oilMax; // 20
    T.addRelic('reserve');
    out.reserveAdded={oilMax:T.run.oilMax, deltaRecorded:T.run.relicDeltas['reserve']};
    T.removeRelic('reserve');
    out.reserveRemoved={oilMax:T.run.oilMax};

    // 2. Glass Lantern (glass) clamped test: oilMax starts at 10 -> add glass (clamped to Math.max(6, 10-6) = 6, delta -4) -> remove glass -> restores to 10
    T.newRun('lamplighter', 0);
    T.run.oilMax=10; T.run.oil=10;
    T.addRelic('glass');
    out.glassClampedAdded={oilMax:T.run.oilMax, deltaRecorded:T.run.relicDeltas['glass']};
    T.removeRelic('glass');
    out.glassClampedRemoved={oilMax:T.run.oilMax};

    // 3. Hollow Crown (hollow) clamped test: oilMax starts at 8 -> add hollow (clamped to Math.max(6, 8-4) = 6, delta -2) -> remove hollow -> restores to 8
    T.newRun('lamplighter', 0);
    T.run.oilMax=8; T.run.oil=8;
    T.addRelic('hollow');
    out.hollowClampedAdded={oilMax:T.run.oilMax, deltaRecorded:T.run.relicDeltas['hollow']};
    T.removeRelic('hollow');
    out.hollowClampedRemoved={oilMax:T.run.oilMax};

    // 4. Legacy save test: old save without relicDeltas object removes default amounts safely
    T.newRun('lamplighter', 0);
    T.run.relics=['reserve', 'glass', 'hollow'];
    T.run.oilMax=22; // 20 + 4 - 6 - 4 = 14 in standard scenario, let's say oilMax is 22
    delete T.run.relicDeltas; // simulate old save format
    T.removeRelic('reserve');
    out.legacyReserveRemoved={oilMax:T.run.oilMax};
    T.removeRelic('glass');
    out.legacyGlassRemoved={oilMax:T.run.oilMax};

    return out;
  });

  console.log(JSON.stringify(r));
  ok(r.reserveAdded.oilMax===24&&r.reserveAdded.deltaRecorded===4,'Oil Reserve adds +4 oilMax',r.reserveAdded);
  ok(r.reserveRemoved.oilMax===20,'Oil Reserve removal restores oilMax to 20',r.reserveRemoved);

  ok(r.glassClampedAdded.oilMax===6&&r.glassClampedAdded.deltaRecorded===-4,'Glass Lantern clamps oilMax from 10 to 6 (delta -4)',r.glassClampedAdded);
  ok(r.glassClampedRemoved.oilMax===10,'Glass Lantern removal restores oilMax back to 10 exactly',r.glassClampedRemoved);

  ok(r.hollowClampedAdded.oilMax===6&&r.hollowClampedAdded.deltaRecorded===-2,'Hollow Crown clamps oilMax from 8 to 6 (delta -2)',r.hollowClampedAdded);
  ok(r.hollowClampedRemoved.oilMax===8,'Hollow Crown removal restores oilMax back to 8 exactly',r.hollowClampedRemoved);

  ok(r.legacyReserveRemoved.oilMax===18,'Legacy save without deltas subtracts default 4 for reserve',r.legacyReserveRemoved);
  ok(r.legacyGlassRemoved.oilMax===24,'Legacy save without deltas adds default 6 for glass',r.legacyGlassRemoved);

  for(const f of fails)console.log('FAIL '+f);
  if(fails.length)process.exitCode=1; else console.log('all relic tests ok');
  await b.close();
})();
