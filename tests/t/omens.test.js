const {chromium}=require('playwright');
(async()=>{
  const b=await chromium.launch(); const p=await b.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.goto('file://'+process.argv[2]); await p.waitForTimeout(300);
  const r=await p.evaluate(()=>{
    const T=__t, out={};
    const floorWith=(omen,elite,kit,depth)=>{T.newRun(kit,depth); T.run.omen=omen; T.run.elite=!!elite; T.beginFloor(null); T.setP(false);};
    floorWith(null); const baseLamp=T.lampBase(), baseT=T.tiers().join('/');
    const q=()=>{T.startWave(); const n=T.F.queue.length, sk=T.F.queue.filter(x=>x.type==='skitter').length; return [n,sk];};
    const baseQ=q();
    const hp=(type)=>{const e=T.spawnFoe(type,0,5); return e.max;};
    floorWith(null); const baseHp=hp('crawler');
    floorWith('moonless'); out.moonless=[baseLamp,T.lampBase()];
    floorWith('swarm'); out.swarm=[baseQ,q()];
    floorWith('ironhide'); out.ironhide=[baseHp,hp('crawler')];
    floorWith(null,true); out.elite=[baseHp,hp('crawler'),baseQ[0],q()[0]];
    floorWith('whispering'); out.whispering=[baseT,T.tiers().join('/')];
    floorWith('starved'); out.starvedEss=T.run.ess;
    floorWith('hungering'); {const e=T.spawnFoe('gnasher',0,5); const ess=T.run.ess; T.hurt(e,1e6); out.hungering=T.run.ess-ess;}
    floorWith(null); {const e=T.spawnFoe('gnasher',0,5); const ess=T.run.ess; T.hurt(e,1e6); out.normalKill=T.run.ess-ess;}
    // kits
    floorWith(null,false,'lamplighter'); out.lampCandle=T.wardCost('candle');
    floorWith(null,false,'galvanist'); out.galvSalt=T.wardCost('salt');
    floorWith(null,false,'occultist'); out.occMad=T.horrorMad('gnasher')+' roster '+JSON.stringify(T.run.roster);
    // depth
    floorWith(null,false,'whaler',5); out.depth5={oil:T.run.oilMax, hp:hp('crawler'), ess:T.run.ess};
    floorWith(null,false,'whaler',2); out.depth2doors=T.makeDoors().map(d=>d.omen).join(',');
    return out;
  });
  console.log(JSON.stringify(r,null,0), errs);
  // the Ember Hall: earn, unlock a kit, pick it
  await p.evaluate(()=>{localStorage.setItem('ll-meta',JSON.stringify({embers:100,unlocked:[],depth:0})); localStorage.removeItem('ll-save-v2');});
  await p.reload(); await p.waitForTimeout(300);
  await p.click('#hallBtn'); await p.waitForTimeout(150);
  await p.evaluate(()=>document.querySelectorAll('#mChoices .choice')[0].click()); await p.waitForTimeout(150);
  const hall=await p.evaluate(()=>({note:document.querySelector('#mBody').innerText.slice(-60),first:document.querySelector('#mChoices .choice .tg').textContent}));
  await p.evaluate(()=>[...document.querySelectorAll('#mActions button')].find(b=>b.textContent==='Close').click());
  await p.click('#descendBtn'); await p.waitForTimeout(150);
  // the roster (#36): the first tap on a card chooses it, the second descends
  await p.evaluate(()=>document.querySelectorAll('#mChoices .choice')[3].click()); await p.waitForTimeout(150);
  await p.evaluate(()=>document.querySelectorAll('#mChoices .choice')[3].click()); await p.waitForTimeout(400);
  console.log('hall',JSON.stringify(hall),'kit picked:',await p.evaluate(()=>__t.run.kit+' '+__t.run.wards.join(',')), 'title line:', await p.evaluate(()=>document.querySelector('#bestLine').textContent), errs);
  await b.close();
})();
