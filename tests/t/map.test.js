// The descent map: plays on the stair, shows the toll afterwards, can't be tapped through on a touchscreen,
// and the still map from the pause menu returns to the pause menu.
const {chromium}=require('playwright');
const fails=[]; const ok=(c,m,d)=>{if(!c)fails.push(m+(d!==undefined?' '+JSON.stringify(d):''));};
(async()=>{
  const b=await chromium.launch();
  const ctx=await b.newContext({viewport:{width:412,height:860},deviceScaleFactor:2,hasTouch:true,isMobile:true});
  const p=await ctx.newPage(); const cdp=await ctx.newCDPSession(p);
  await p.goto('file://'+process.argv[2]); await p.waitForTimeout(400);
  // a human-length touch: the click arrives after the finger lifts
  const tap=async(x,y)=>{await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]}); await p.waitForTimeout(90); await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]}); await p.waitForTimeout(150);};
  const toStair=async()=>{
    await p.evaluate(()=>{const T=__t; T.newRun(); T.run.floor=1; T.beginFloor(null); T.run.ess=500; T.F.wave=T.F.def.waves.length; T.floorCleared();});
    for(let i=0;i<40;i++){if(await p.evaluate(()=>!!__t.F.draft))break; await p.waitForTimeout(200);}
  };

  // 1. descending shows the map; the toll appears as a hint after it ends
  await toStair();
  await p.evaluate(()=>{__t.F.draft.salvage=0; __t.descend();});
  ok(await p.evaluate(()=>!document.getElementById('mapOverlay').hidden),'map overlay should open on descent');
  let toll=false; for(let i=0;i<45;i++){const h=await p.evaluate(()=>{const e=document.getElementById('hint'); return e.classList.contains('show')?e.textContent:'';}); if(/toll/.test(h)){toll=true;break;} await p.waitForTimeout(200);}
  ok(toll,'the toll message should show after the descent');
  await p.screenshot({path:(process.argv[3]||'.')+'/map-after.png'});

  // 2. a skip tap over "Call the dark" must not start the wave (touch ghost-click)
  await toStair();
  await p.evaluate(()=>__t.descend()); await p.waitForTimeout(500);
  const cb=await p.$eval('#callBtn',e=>{const r=e.getBoundingClientRect(); return [r.x+r.width/2,r.y+r.height/2];});
  await tap(cb[0],cb[1]);
  const s2=await p.evaluate(()=>({overlay:!document.getElementById('mapOverlay').hidden, phase:__t.F.phase}));
  ok(!s2.overlay&&s2.phase==='build','skip tap should close the map without calling a wave',s2);

  // 3. the still map from the pause menu closes back to the pause menu
  await p.evaluate(()=>{document.getElementById('pauseBtn').click();}); await p.waitForTimeout(250);
  const btns=await p.evaluate(()=>[...document.querySelectorAll('#modal button')].map(b=>{const r=b.getBoundingClientRect(); return [b.textContent,r.x+r.width/2,r.y+r.height/2];}));
  ok(btns.some(x=>/view map/i.test(x[0])),'pause menu should offer View map',btns.map(x=>x[0]));
  await p.evaluate(()=>{[...document.querySelectorAll('#modal button')].find(b=>/map/i.test(b.textContent)).click();}); await p.waitForTimeout(300);
  ok(await p.evaluate(()=>!document.getElementById('mapOverlay').hidden),'still map should open');
  await p.screenshot({path:(process.argv[3]||'.')+'/map-still.png'});
  const res=btns.find(x=>/Resume/.test(x[0]));
  await tap(res[1],res[2]);
  const s3=await p.evaluate(()=>({overlay:!document.getElementById('mapOverlay').hidden, menu:!document.getElementById('modal').hidden, paused:null}));
  ok(!s3.overlay&&s3.menu,'closing the still map should return to the pause menu, not tap through',s3);

  for(const f of fails)console.log('FAIL '+f);
  if(fails.length)process.exitCode=1; else console.log('map ok');
  await b.close();
})();
