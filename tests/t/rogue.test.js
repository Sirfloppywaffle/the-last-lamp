const {chromium}=require('playwright');
const file='file://'+process.argv[2], out=process.argv[3];
(async()=>{
  const b=await chromium.launch(); const ctx=await b.newContext({viewport:{width:1100,height:900}}); const p=await ctx.newPage();
  const errs=[]; p.on('pageerror',e=>errs.push(e.message)); p.on('console',m=>{if(m.type()==='error'&&!m.text().includes('ERR_TUNNEL'))errs.push(m.text())});
  await p.goto(file); await p.waitForTimeout(400);
  const modal=()=>p.evaluate(()=>({hidden:document.querySelector('#modal').hidden,title:document.querySelector('#mTitle').textContent,choices:[...document.querySelectorAll('#mChoices .choice')].map(c=>c.querySelector('.tg').textContent+' | '+c.querySelector('b').textContent),actions:[...document.querySelectorAll('#mActions button')].map(b=>b.textContent),body:document.querySelector('#mBody').innerText.slice(0,160)}));
  const clickChoice=async(i)=>{await p.evaluate(i=>document.querySelectorAll('#mChoices .choice')[i].click(),i); await p.waitForTimeout(250);};
  const clickAction=async(t)=>{await p.evaluate(t=>[...document.querySelectorAll('#mActions button')].find(b=>b.textContent.includes(t)).click(),t); await p.waitForTimeout(250);};
  const log=(l,x)=>console.log(l.padEnd(18),JSON.stringify(x),errs.splice(0).slice(0,2));
  // hall and kits
  await p.click('#hallBtn'); await p.waitForTimeout(200); log('hall',await modal()); await p.screenshot({path:out+'/hall.png'}); await clickAction('Close');
  await p.click('#descendBtn'); await p.waitForTimeout(200); log('kits',await modal()); await p.screenshot({path:out+'/kits.png'});
  await clickChoice(3); log('locked kit',(await modal()).body);
  await clickChoice(1); await p.waitForTimeout(400);
  log('run',await p.evaluate(()=>({kit:__t.run.kit,wards:__t.run.wards,rites:__t.run.rites,ess:__t.run.ess})));
  // clear the floor
  const clear=async()=>{await p.evaluate(()=>{const o=document.getElementById('mapOverlay'); if(o&&!o.hidden)o.click();}); await p.waitForTimeout(100); await p.evaluate(()=>{const T=__t; T.F.wave=T.F.def.waves.length; T.F.phase='wave'; T.F.queue=[]; T.F.foes=[]; T.run.ess+=500; T.setP(false);}); await p.waitForTimeout(2600);};
  await clear(); log('gift',await modal()); await p.screenshot({path:out+'/gift.png'});
  await clickChoice(0); const fork=await modal(); log('fork',fork); await p.screenshot({path:out+'/fork.png'});
  // save & resume on the stair
  await p.reload(); await p.waitForTimeout(500); await p.click('#continueBtn'); await p.waitForTimeout(500);
  log('resumed',(await modal()).choices);
  // walk through each door type by forcing doors
  const types=['merchant','shrine','event','rest','reliquary','deep'];
  for(const ty of types){
    await p.evaluate(ty=>{const d=__t.F.draft; d.doors=[{room:ty,omen:'moonless'},{room:'rest',omen:null},{room:'deep',omen:'swarm'}]; d.step='fork';},ty);
    await p.evaluate(()=>{const T=__t; /* refresh */}); await p.evaluate(()=>document.querySelector('#modal').hidden=true); await p.waitForTimeout(300);
    await clickChoice(0);
    const m=await modal(); log('room '+ty,{title:m.title,choices:m.choices.slice(0,4),actions:m.actions});
    if(ty==='merchant'){await p.screenshot({path:out+'/merchant.png'}); await clickChoice(0); log('bought',await p.evaluate(()=>({ess:__t.run.ess,relics:__t.run.relics}))); await clickAction('Take the stair');}
    else if(ty==='shrine'){await p.screenshot({path:out+'/shrine.png'}); await clickChoice(0); let m2=await modal(); log('pact',{title:m2.title,body:m2.body,choices:m2.choices.length}); for(let k=0;k<3&&m2.choices.length&&!m2.actions.some(a=>a.includes('Take'));k++){await clickChoice(0); m2=await modal();} log('after pact',{title:m2.title,body:m2.body}); await clickAction('Take the stair');}
    else if(ty==='event'){await p.screenshot({path:out+'/event.png'}); await clickChoice(0); let m2=await modal(); log('event res',{title:m2.title,body:m2.body,choices:m2.choices.length}); if(m2.choices.length&&m2.title.startsWith('Choose')){await clickChoice(0);} m2=await modal(); if(!m2.hidden&&m2.actions.some(a=>a.includes('Take'))) await clickAction('Take the stair'); else if(!m2.hidden&&m2.choices.length) {await clickChoice(0); m2=await modal(); if(m2.actions.some(a=>a.includes('Take')))await clickAction('Take the stair');}}
    else if(ty==='rest'){await clickChoice(1);}
    else if(ty==='reliquary'){await clickChoice(0);}
    await p.waitForTimeout(500);
    const st=await p.evaluate(()=>({floor:__t.run.floor,omen:__t.F.omen,elite:__t.F.elite,ess:__t.run.ess,oil:__t.run.oil+'/'+__t.run.oilMax,phase:__t.F.phase,hud:document.querySelector('#floorNo').textContent}));
    log('next floor',st);
    if(ty==='deep')await p.screenshot({path:out+'/elite-floor.png'});
    if(st.floor>=4){await p.evaluate(()=>{__t.run.floor=0;});}
    await clear(); await clickChoice(0); // take the gift (or the relic step)
    let m3=await modal(); if(m3.title!=='The stair forks'){await clickChoice(0); m3=await modal();}
  }
  // death and embers
  await p.evaluate(()=>{const T=__t; document.querySelector('#modal').hidden=true; T.F.draft=null; T.F.phase='wave'; T.F.blocking=null; T.run.oil=1; T.setP(false); T.spawnFoe('crawler',0,T.F.paths[0].len-.5);});
  await p.waitForTimeout(2500); log('defeat',(await modal()).body);
  log('meta',await p.evaluate(()=>__t.meta));
  // win: last floor cleared
  await p.evaluate(()=>{const T=__t; T.newRun('lamplighter',0); T.run.floor=4; T.beginFloor(null); T.F.wave=T.F.def.waves.length; T.F.phase='wave'; T.F.queue=[]; T.F.foes=[]; T.setP(false);});
  await p.waitForTimeout(2500); {const vb=(await modal()).body; log('victory',vb); if(!/Primordial is still/.test(vb||'')){console.log('FAIL no victory screen'); process.exitCode=1;}} log('meta2',await p.evaluate(()=>__t.meta));
  await clickAction('Descend again'); await p.waitForTimeout(200); log('kits+depth',(await modal()).actions);
  await b.close();
})();
