// Town materials before a run: real dev toggle and grant button, spending, reload and save isolation.
const {chromium}=require('playwright');
(async()=>{
  const b=await chromium.launch();
  const p=await b.newPage({viewport:{width:412,height:860},hasTouch:true});
  let fails=0; const ok=(c,m,d)=>{if(!c){console.log('FAIL '+m+' '+JSON.stringify(d)); fails++;}};
  await p.goto('file://'+process.argv[2]); await p.waitForTimeout(300);
  await p.evaluate(()=>{__t.townData().res={timber:3,iron:4,tallow:5,curios:6}; __t.townSave();});
  const toggle=async()=>{for(let i=0;i<7;i++)await p.locator('#title h1').tap();};
  const open=async()=>{await p.click('#townBtn'); await p.click('#townBuild');};
  const res=()=>p.evaluate(()=>({...__t.townData().res}));
  const stored=()=>p.evaluate(()=>JSON.stringify(Object.fromEntries(Object.keys(localStorage).filter(k=>k!=='ll-dev').sort().map(k=>[k,localStorage.getItem(k)]))));
  const initial=await res();
  await open();
  ok(await p.locator('#townMaterials').isHidden(),'grant is hidden in normal play');
  await p.evaluate(()=>document.getElementById('townMaterials').click());
  ok(JSON.stringify(await res())===JSON.stringify(initial),'hidden grant cannot change normal materials');
  await p.click('#townBack');
  const saved=await stored();

  await toggle(); await open();
  ok(await p.evaluate(()=>__t.devOn&&!__t.run),'materials can be granted before starting any run');
  const poor=await p.locator('[data-deco="lamp"]').getAttribute('class');
  await p.click('#townMaterials'); await p.click('#townMaterials');
  const grant=await p.evaluate(()=>({res:{...__t.townData().res},hud:document.getElementById('townResIron').textContent,
    poor:document.querySelector('[data-deco="lamp"]').classList.contains('poor'),msg:document.getElementById('townTmsg').textContent}));
  ok(Object.keys(initial).every(k=>grant.res[k]===initial[k]+200),'each tap adds 100 of all four materials',grant);
  ok(poor.includes('poor')&&!grant.poor&&grant.hud===String(grant.res.iron)&&/not saved/.test(grant.msg),'grant updates counts, affordability and feedback',grant);
  const spending=await p.evaluate(()=>({lamp:__t.townPlace('lamp',3,15),restored:__t.townUpgrade('brazier'),lit:__t.townUpgrade('brazier')}));
  ok(spending.lamp===''&&spending.restored&&spending.lit,'granted materials buy decorations and both workshop tiers',spending);
  ok(await stored()===saved,'granting and spending never change saved storage');
  await p.screenshot({path:(process.argv[3]||'.')+'/dev-materials.png'});

  await p.click('#townBack'); await p.reload(); await p.waitForTimeout(300); await open();
  const fresh=await p.evaluate(()=>({dev:__t.devOn,res:{...__t.townData().res},tier:__t.townData().buildings.brazier,decos:__t.townData().decos.length}));
  ok(fresh.dev&&JSON.stringify(fresh.res)===JSON.stringify(initial)&&fresh.tier===0&&fresh.decos===0,'reloading dev mode discards materials and purchases',fresh);
  await p.click('#townMaterials');
  await p.click('#townBack'); await toggle(); await open();
  ok(await p.locator('#townMaterials').isHidden(),'cached grant control hides again after leaving dev mode');
  ok(JSON.stringify(await res())===JSON.stringify(initial),'leaving dev mode restores real materials');
  await p.evaluate(()=>document.getElementById('townMaterials').click());
  ok(JSON.stringify(await res())===JSON.stringify(initial),'cached control is inactive outside dev mode');
  await p.click('#townBack'); await p.reload(); await p.waitForTimeout(300);
  ok(JSON.stringify(await res())===JSON.stringify(initial),'normal save still has the original materials after reload');
  await b.close(); process.exitCode=fails?1:0;
})();
