const {chromium}=require('playwright');
(async()=>{
  const b=await chromium.launch(); const ctx=await b.newContext({viewport:{width:1100,height:900},deviceScaleFactor:1}); const p=await ctx.newPage();
  const errs=[]; p.on('pageerror',e=>errs.push(e.message)); p.on('console',m=>{if(m.type()==='error'&&!m.text().includes('ERR_TUNNEL'))errs.push(m.text())});
  await p.goto('file://'+process.argv[2]); await p.waitForTimeout(400);
  for(const [f,tag] of [[3,'keeper'],[4,'prim']]){
    await p.evaluate((f)=>{const T=__t; T.newRun(); T.run.floor=f; T.beginFloor(null); T.run.oil=T.run.oilMax=999; T.F.wave=T.F.def.waves.length-1; T.setP(false); T.callWave();},f);
    for(const ms of [700,1500,2600]){await p.waitForTimeout(ms===700?700:ms===1500?800:1100); await p.screenshot({path:`${process.argv[3]}/intro-${tag}-${ms}.png`});}
    await p.waitForTimeout(2600);
    await p.screenshot({path:`${process.argv[3]}/intro-${tag}-after.png`});
    {const st=await p.evaluate(()=>({intro:!!__t.F.intro, bar:!document.querySelector('#bossBar').hidden, card:!document.querySelector('#bossCard').hidden, foes:__t.F.foes.length})); console.log(tag, st, errs.splice(0)); if(st.intro||!st.bar||st.card){console.log('FAIL boss entrance did not finish cleanly for '+tag); process.exitCode=1;}}
  }
  await b.close();
})();
