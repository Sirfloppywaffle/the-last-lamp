// Developer mode: jump to any floor, and clear the floor you're on, through the real pause menu.
const {chromium}=require('playwright');
(async()=>{
  const b=await chromium.launch(); let fails=0; const fail=m=>{console.log('FAIL '+m); fails++;};
  const p=await b.newPage({viewport:{width:412,height:860},hasTouch:true});
  await p.goto('file://'+process.argv[2]); await p.waitForTimeout(300);
  await p.evaluate(()=>localStorage.setItem('ll-dev','true')); await p.reload(); await p.waitForTimeout(300);
  await p.evaluate(()=>{__t.newRun(); __t.forceUI();}); await p.waitForTimeout(200);
  const btn=async(sel,text)=>p.evaluate(([sel,text])=>{const x=[...document.querySelectorAll(sel)].find(b=>b.textContent.includes(text)); if(!x)return false; x.click(); return true;},[sel,text]);
  const openDev=async()=>{/* on the landing the stair screen is up, so the way in is its own Pause menu button */ if(await p.evaluate(()=>!document.querySelector('#modal').hidden))await btn('#mActions button','Pause menu'); else await p.click('#pauseBtn'); await p.waitForTimeout(250); if(!await btn('#mActions button','Developer'))fail('no Developer entry in the pause menu'); await p.waitForTimeout(250);};

  await p.evaluate(()=>{__t.run.relics.push('tallow'); __t.run.ess=500;});
  await openDev();
  if(!await btn('[data-dev="floor"]','3 · '))fail('no floor 3 button');
  await p.waitForTimeout(400);
  let s=await p.evaluate(()=>({floor:__t.run.floor,name:document.querySelector('#floorName').textContent,phase:__t.F.phase,modal:!document.querySelector('#modal').hidden,relics:__t.run.relics.slice(),forks:__t.F.forks.length}));
  if(s.floor!==2||s.name!=='The Drowned Nave'||s.phase!=='build'||s.modal)fail('jump to floor 3 '+JSON.stringify(s));
  if(!s.relics.includes('tallow'))fail('a jump keeps the run (relics) '+JSON.stringify(s));
  if(s.forks!==1)fail('floor 3 should be built with its fork '+JSON.stringify(s));

  await openDev();
  await btn('[data-dev="skip"]','Clear this floor');
  await p.waitForTimeout(2600);
  s=await p.evaluate(()=>({phase:__t.F.phase,title:document.querySelector('#mTitle').textContent,modal:!document.querySelector('#modal').hidden}));
  if(s.phase!=='draft'||!s.modal||!/stair/i.test(s.title))fail('clearing the floor should open the landing '+JSON.stringify(s));

  await openDev();
  await btn('[data-dev="floor"]','5 · '); await p.waitForTimeout(400);
  s=await p.evaluate(()=>({floor:__t.run.floor,name:document.querySelector('#floorName').textContent,modal:!document.querySelector('#modal').hidden,map:!document.querySelector('#mapOverlay').hidden}));
  if(s.floor!==4||s.name!=='The Abyssal Heart'||s.modal||s.map)fail('jump from the landing to floor 5 '+JSON.stringify(s));
  await p.screenshot({path:(process.argv[3]||'.')+'/dev-floor5.png'});

  await openDev(); await p.screenshot({path:(process.argv[3]||'.')+'/dev-menu.png'});
  await b.close();
  if(fails)process.exitCode=1;
})();
