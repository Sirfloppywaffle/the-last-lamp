// Saltmouth (Expansion 3, step 3): the haul.
// - newRun() starts with run.haul = {timber:0, iron:0, tallow:0, curios:0}; an old save without run.haul resumes with {0,0,0,0}.
// - HAUL table: floor clear adds +8 timber, +5 iron; Herald kill adds +8 iron; boss kill adds +5 tallow, +1 curio.
// - descend() renders Math.floor(burned / 20) tallow from the stair's essence toll.
// - haulCredit() credits townData().res once on victory, defeat, or when abandoning a saved run (Start fresh / Descend the same stair).
// - Reload mid-run preserves run.haul; reload on the death screen never credits twice (run.haulPaid).
// - Developer mode shows the haul line on screen but never writes ll-town (rule 24).
// - Taught (rule 23): TIPS.townhaul card in town when totals > 0, and Saltmouth rules line mentions the haul and tallow toll.
const {chromium}=require('playwright');
const fails=[]; const ok=(cond,msg,detail)=>{if(!cond)fails.push(msg+(detail!==undefined?' '+JSON.stringify(detail).slice(0,700):''));};
(async()=>{
  const b=await chromium.launch();
  const ctx=await b.newContext({viewport:{width:412,height:860},deviceScaleFactor:2.625,hasTouch:true,isMobile:true});
  const p=await ctx.newPage();
  await p.goto('file://'+process.argv[2]); await p.waitForTimeout(400);

  /* 1. HAUL table, newRun() initialization, and old save migration */
  const init=await p.evaluate(()=>{
    __t.newRun('lamplighter',0);
    const h0=Object.assign({},__t.run.haul);
    __t.checkpoint();
    const sv=JSON.parse(localStorage.getItem('ll-save-v2'));
    delete sv.run.haul;
    __t.resumeFrom(sv);
    const hOld=Object.assign({},__t.run.haul);
    return {HAUL:__t.HAUL,h0,hOld,res0:__t.townData().res};
  });
  ok(init.HAUL&&init.HAUL.floor.timber===8&&init.HAUL.floor.iron===5&&init.HAUL.herald.iron===8&&init.HAUL.boss.tallow===5&&init.HAUL.boss.curios===1&&init.HAUL.tollPer===20,'HAUL shape matches spec',init.HAUL);
  ok(init.h0.timber===0&&init.h0.iron===0&&init.h0.tallow===0&&init.h0.curios===0,'newRun starts with empty haul',init.h0);
  ok(init.hOld.timber===0&&init.hOld.iron===0&&init.hOld.tallow===0&&init.hOld.curios===0,'resumeFrom gives an old save {0,0,0,0}',init.hOld);
  ok(init.res0.timber===0&&init.res0.iron===0&&init.res0.tallow===0&&init.res0.curios===0,'townData().res defaults to {0,0,0,0}',init.res0);

  /* 2. Floor clear, Herald kill, boss kill, and toll tallow in descend() */
  const accrual=await p.evaluate(()=>{
    __t.newRun('lamplighter',0);
    /* simulate a Herald kill and a boss kill via killFoe */
    const herald={dead:false,hp:0,x:2,y:2,gate:0,d:1,type:'herald_tallow',def:{n:'Herald',ess:10,oil:1,r:.3,col:'200,180,120',herald:true}};
    const boss={dead:false,hp:0,x:3,y:3,gate:0,d:1,type:'keeper',def:{n:'The Keeper Below',ess:40,oil:5,r:.5,col:'220,160,90',boss:true}};
    __t.killFoe(herald);
    __t.killFoe(boss);
    const afterKills=Object.assign({},__t.run.haul);
    /* floorCleared adds HAUL.floor */
    __t.floorCleared();
    const afterFloor=Object.assign({},__t.run.haul);
    /* set up draft and essence to test descend() toll tallow: burned = floor(ess * 0.7) -> tallow += floor(burned / 20) */
    __t.F.phase='draft';
    __t.F.draft={step:'fork',done:false,salvage:0,doors:[]};
    __t.run.ess=100; /* tollKeep(100,0) = 30, burned = 70 -> floor(70/20) = 3 tallow */
    __t.descend();
    const afterDescend=Object.assign({},__t.run.haul);
    __t.checkpoint();
    return {afterKills,afterFloor,afterDescend};
  });
  ok(accrual.afterKills.iron===8&&accrual.afterKills.tallow===5&&accrual.afterKills.curios===1,'Herald adds 8 iron and boss adds 5 tallow + 1 curio',accrual.afterKills);
  ok(accrual.afterFloor.timber===8&&accrual.afterFloor.iron===13&&accrual.afterFloor.tallow===5&&accrual.afterFloor.curios===1,'floorCleared adds 8 timber + 5 iron',accrual.afterFloor);
  ok(accrual.afterDescend.tallow===8,'descend() adds floor(burned/20) tallow (5 + floor(70/20) = 8)',accrual.afterDescend);

  /* 3. Reload mid-run preserves run.haul without crediting town yet */
  await p.reload(); await p.waitForTimeout(350);
  const midReload=await p.evaluate(()=>{
    const sv=JSON.parse(localStorage.getItem('ll-save-v2'));
    __t.resumeFrom(sv);
    return {haul:__t.run.haul,res:__t.townData().res};
  });
  ok(midReload.haul.timber===8&&midReload.haul.iron===13&&midReload.haul.tallow===8&&midReload.haul.curios===1,'reload mid-run preserves run.haul',midReload);
  ok(midReload.res.timber===0&&midReload.res.iron===0,'mid-run reload has not credited town yet',midReload.res);

  /* 4. Defeat credits once, shows haul line on death screen, and never double-credits on reload or repeat call */
  const defRes=await p.evaluate(()=>new Promise(res=>{
    __t.defeat();
    const secondCredit=__t.haulCredit();
    setTimeout(()=>{
      const body=document.getElementById('mBody').textContent||'';
      res({res:__t.townData().res,paid:__t.run.haulPaid,haulAfter:__t.run.haul,secondCredit,body});
    },1000);
  }));
  ok(defRes.res.timber===8&&defRes.res.iron===13&&defRes.res.tallow===8&&defRes.res.curios===1,'defeat credits townData().res exactly once',defRes);
  ok(defRes.paid===true&&defRes.secondCredit===false&&defRes.haulAfter.timber===0,'haul is marked paid and zeroed synchronously',defRes);
  ok(/You haul up 8 timber, 13 iron, 8 tallow, 1 curio./.test(defRes.body),'death screen shows formatted haul line',defRes.body);

  /* 5. Victory credits once and shows haul line on Morning screen */
  const vicRes=await p.evaluate(()=>{
    __t.newRun('lamplighter',0);
    __t.haulAdd({timber:16,iron:10,tallow:4});
    __t.victory();
    const body=document.getElementById('mBody').textContent||'';
    return {res:__t.townData().res,body};
  });
  ok(vicRes.res.timber===24&&vicRes.res.iron===23&&vicRes.res.tallow===12&&vicRes.res.curios===1,'victory adds haul to townData().res',vicRes);
  ok(/You haul up 16 timber, 10 iron, 4 tallow./.test(vicRes.body),'morning screen shows formatted haul line',vicRes.body);

  /* 6. Abandoning a saved run via openKitPicker go() credits its haul first */
  const abandonRes=await p.evaluate(()=>{
    __t.newRun('lamplighter',0);
    __t.haulAdd({timber:8,iron:5});
    __t.checkpoint();
    __t.openKitPicker();
    const callBtn=document.querySelector('#mActions button.call');
    callBtn.click();
    return {res:__t.townData().res,newHaul:__t.run.haul};
  });
  ok(abandonRes.res.timber===32&&abandonRes.res.iron===28,'abandoning a saved run for a new descent credits the saved haul first',abandonRes);
  ok(abandonRes.newHaul.timber===0&&abandonRes.newHaul.iron===0,'the new run starts with a fresh haul',abandonRes.newHaul);

  /* 7. Developer mode shows haul on screen but never writes ll-town (rule 24) */
  const devRes=await p.evaluate(()=>{
    const storedBefore=localStorage.getItem('ll-town');
    __t.setDev(true); __t.townReset();
    __t.newRun('lamplighter',0);
    __t.haulAdd({timber:8,iron:5,tallow:2});
    __t.victory();
    const body=document.getElementById('mBody').textContent||'';
    const storedAfter=localStorage.getItem('ll-town');
    __t.setDev(false); __t.townReset();
    return {storedBefore,storedAfter,body};
  });
  ok(devRes.storedBefore===devRes.storedAfter,'developer mode never writes ll-town (rule 24)',devRes);
  ok(/You haul up 8 timber, 5 iron, 2 tallow./.test(devRes.body),'developer mode still shows haul line on screen',devRes.body);

  /* 8. Town HUD counts and teaching (rule 23: TIPS.townhaul and #rulesList) */
  const teach=await p.evaluate(()=>{
    localStorage.setItem('ll-tut',JSON.stringify({walk:'done',seen:['town'],off:false}));
    __t.townOpen();
    const cardTitle=document.querySelector('#townCard b')?document.querySelector('#townCard b').textContent:'';
    const cardHidden=document.getElementById('townCardWrap').hidden;
    document.getElementById('townCard').click();
    const cardHiddenAfter=document.getElementById('townCardWrap').hidden;
    const seen=JSON.parse(localStorage.getItem('ll-tut')||'{}').seen||[];
    const hud={
      timber:document.getElementById('townResTimber').textContent,
      iron:document.getElementById('townResIron').textContent,
      tallow:document.getElementById('townResTallow').textContent,
      curios:document.getElementById('townResCurios').textContent
    };
    const rules=document.getElementById('rulesList').textContent||'';
    __t.townClose();
    return {cardTitle,cardHidden,cardHiddenAfter,hud,rules,seen};
  });
  ok(!teach.cardHidden&&teach.cardTitle==='The haul'&&teach.cardHiddenAfter,'TIPS.townhaul shows on the town card the first time totals > 0 and dismisses on click',teach);
  ok(teach.seen.includes('townhaul')&&!teach.seen.includes('haul'),'dismissing the town haul card leaves the Haul Away rite tip unseen',teach.seen);
  ok(teach.hud.timber==='32'&&teach.hud.iron==='28'&&teach.hud.tallow==='12'&&teach.hud.curios==='1','town HUD displays current resource totals',teach.hud);
  ok(/timber, iron, tallow and curios/i.test(teach.rules)&&/toll renders tallow/i.test(teach.rules),'Saltmouth rules line teaches the haul and the toll rendering tallow',teach.rules);

  for(const f of fails)console.log('FAIL '+f);
  console.log(fails.length?fails.length+' failed':'haul ok');
  await b.close(); process.exit(fails.length?1:0);
})();
