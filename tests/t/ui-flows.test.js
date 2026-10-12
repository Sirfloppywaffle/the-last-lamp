const {chromium}=require('playwright');
const file='file://'+process.argv[2], out=process.argv[3];
(async()=>{
  const b=await chromium.launch();
  const ctx=await b.newContext({viewport:{width:1700,height:1000}});
  const p=await ctx.newPage();
  const errs=[]; p.on('pageerror',e=>errs.push('PAGEERR '+e.message)); p.on('console',m=>{if(m.type()==='error')errs.push('CONSOLE '+m.text().slice(0,200));});
  await p.goto(file); await p.waitForTimeout(700);
  let n=0; const log=(l,x)=>{const ne=errs.slice(n); n=errs.length; console.log(l.padEnd(28), x!==undefined?JSON.stringify(x):'', ne.length?ne:'');};
  const ev=async(code)=>{try{return await p.evaluate(code);}catch(e){errs.push('EVAL '+e.message.split('\n')[0]); return null;}};
  await p.screenshot({path:out+'/title.png'});
  // secret dev unlock
  const h=await p.$('#title h1'); for(let i=0;i<7;i++){await h.click(); await p.waitForTimeout(60);}
  log('dev unlock line', await ev(`document.querySelector('#bestLine').textContent`));
  // settings from title
  await p.click('#settingsBtn'); await p.waitForTimeout(200);
  log('settings sliders', await ev(`document.querySelectorAll('#modal input[type=range]').length`));
  await ev(`document.querySelector('#mActions button').click()`);
  // floor 5
  await ev(`const T=__t; T.newRun(); T.run.floor=4; T.beginFloor(null);`); await p.waitForTimeout(400);
  log('floor5 loaded', await ev(`[__t.F.def.name, __t.ORIENT, __t.F.paths.length]`));
  // bind keeper and place it
  await ev(`__t.run.roster.keeper=1; __t.run.ess=900; __t.forceUI();`); await p.waitForTimeout(300);
  log('tray after keeper', await ev(`[...document.querySelectorAll('#tray button, #tray .item')].map(b=>b.textContent.trim().slice(0,20))`));
  const placed=await ev(`(()=>{const T=__t,it={kind:'horror',type:'keeper'}; T.setSel(it); for(let r=0;r<T.ROWS;r++)for(let c=0;c<T.COLS;c++){if(!T.placeProblem(it,c,r)){T.tryPlace(c,r); return [c,r,T.F.towers.length];}} return 'nowhere';})()`);
  log('keeper placed', placed);
  // a harpoon + candle so the board isn't empty
  await ev(`(()=>{const T=__t; for(const ty of ['harpoon','harpoon','candle']){const it={kind:'ward',type:ty}; T.setSel(it); let done=false; for(let r=0;r<T.ROWS&&!done;r++)for(let c=0;c<T.COLS&&!done;c++){if(!T.placeProblem(it,c,r)){T.tryPlace(c,r); done=true;}}} T.setSel(null);})()`);
  await p.waitForTimeout(500);
  await p.click('#callBtn'); await p.waitForTimeout(4000);
  log('wave 1 running', await ev(`[__t.F.phase, __t.F.foes.length, __t.F.foes.map(e=>e.type+':'+e.gate).slice(0,6)]`));
  await ev(`for(const k of ['behemoth','boss2','stalker'])__t.spawnFoe(k,0,6);`); await p.waitForTimeout(1500);
  await p.screenshot({path:out+'/floor5-land.png'});
  // dev menu via pause
  await p.click('#pauseBtn'); await p.waitForTimeout(200);
  const labels=await ev(`[...document.querySelectorAll('#mActions button')].map(b=>b.textContent)`);
  log('pause actions', labels);
  await ev(`[...document.querySelectorAll('#mActions button')].find(b=>b.textContent==='Developer').click()`); await p.waitForTimeout(200);
  log('dev buttons', await ev(`document.querySelectorAll('[data-dev]').length`));
  await ev(`document.querySelector('[data-dev=dark]').click()`); await p.waitForTimeout(100);
  await ev(`document.querySelector('[data-dev=spawn][data-arg=behemoth]').click()`); await p.waitForTimeout(100);
  log('dev note', await ev(`document.querySelector('#mBody').textContent`));
  await ev(`document.querySelector('[data-dev=unlock]').click()`); await p.waitForTimeout(100);
  await ev(`[...document.querySelectorAll('#mActions button')].find(b=>b.textContent==='Resume').click()`); await p.waitForTimeout(1500);
  await p.screenshot({path:out+'/floor5-nodark.png'});
  log('after resume', await ev(`[__t.F.foes.length, Object.keys(__t.run.roster)]`));
  await p.click('#pauseBtn'); await p.waitForTimeout(150);
  await ev(`[...document.querySelectorAll('#mActions button')].find(b=>b.textContent==='Developer').click()`); await p.waitForTimeout(100);
  await ev(`document.querySelector('[data-dev=kill]').click()`); await ev(`document.querySelector('[data-dev=dark]').click()`);
  await ev(`[...document.querySelectorAll('#mActions button')].find(b=>b.textContent==='Resume').click()`); await p.waitForTimeout(800);
  log('after kill', await ev(`[__t.F.phase,__t.F.foes.length]`));
  // heavy slow cap: behemoth on salt
  // soul linger at floor clear (floor 4)
  await ev(`const T=__t; T.run.roster={}; T.run.floor=3; T.beginFloor(null);`); await p.waitForTimeout(300);
  await ev(`const T=__t; T.F.wave=T.F.def.waves.length; T.F.phase='wave'; T.F.queue=[]; T.F.foes=[]; T.F.souls.push({x:5.5,y:6.5,type:'keeper',t:15,max:15,big:true});`);
  await p.waitForTimeout(2600);
  log('waiting for soul', await ev(`[__t.F.phase, document.querySelector('#modal').hidden, __t.F.souls.length]`));
  const box=await (await p.$('#board, canvas#cv, #cv')).boundingBox();
  const sp=await ev(`[__t.F.souls[0].x/__t.COLS, __t.F.souls[0].y/__t.ROWS]`);
  await p.mouse.click(box.x+sp[0]*box.width, box.y+sp[1]*box.height); await p.waitForTimeout(1200);
  log('after binding', await ev(`[__t.F.phase, document.querySelector('#modal').hidden, document.querySelector('#mTitle').textContent, __t.run.roster]`));
  await p.screenshot({path:out+'/draft.png'});
  // portrait
  await p.setViewportSize({width:880,height:1500}); await p.waitForTimeout(300);
  await ev(`const T=__t; T.run.floor=4; T.beginFloor(null);`); await p.waitForTimeout(800);
  log('portrait orient', await ev(`__t.ORIENT`));
  await p.screenshot({path:out+'/floor5-port.png'});
  console.log('TOTAL ERRORS', errs.length); await b.close();
})();
