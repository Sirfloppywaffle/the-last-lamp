// Battery (10 Nov 2026): a paused board is painted on a change and ten times a second, not every frame; render() keeps its lists
// between frames; Settings can hold the game to 60 frames a second; developer mode shows what a frame costs, and only there.
const {chromium}=require('playwright');
const fails=[]; const ok=(c,m,d)=>{if(!c)fails.push(m+(d!==undefined?' '+JSON.stringify(d):''));};
(async()=>{
  const b=await chromium.launch(); const p=await b.newPage({viewport:{width:412,height:860},hasTouch:true}); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.goto('file://'+process.argv[2]); await p.waitForTimeout(300);
  await p.evaluate(()=>{const T=__t; T.newRun('lamplighter',0,{seed:5}); T.run.floor=1; T.beginFloor(null); T.run.oil=T.run.oilMax=999; T.setP(false);
    T.F.phase='wave'; T.F.queue=[{t:1e9,type:'crawler',gate:0}]; for(let i=0;i<24;i++){const e=T.spawnFoe(['crawler','gnasher','watcher'][i%3],0,1+i*.4); e.hp=e.max=1e6; e.spd=0;}
    const cv=document.getElementById('board'), g=cv.getContext('2d'), fr=g.fillRect; window.__paints=0;
    g.fillRect=function(x,y,w,h){if(x===0&&y===0&&w===cv.width&&h===cv.height)window.__paints++; return fr.apply(this,arguments);};});
  const count=async ms=>{await p.evaluate(()=>{window.__paints=0;}); await p.waitForTimeout(ms); return p.evaluate(()=>window.__paints);};
  const moving=await count(1000);
  const pool0=await p.evaluate(()=>__t.rPool); await p.waitForTimeout(500); const pool1=await p.evaluate(()=>__t.rPool);
  await p.evaluate(()=>__t.setP(true)); await p.waitForTimeout(200);
  const still=await count(1000);
  const dirty=await p.evaluate(()=>{window.__paints=0; __t.forceUI(); return new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(()=>r(window.__paints))));});
  ok(moving>20,'a moving board is painted every frame',moving);
  ok(still>=4&&still<moving*.45,'a paused board is painted about ten times a second, not every frame',[still,moving]);
  ok(dirty>=1,'and at once when something on it changes',dirty);
  ok(pool0>=1&&pool1===pool0,'render() keeps its draw list between frames',[pool0,pool1]);
  // Settings: the frame rate
  const fps=await p.evaluate(()=>{__t.showTitle(); document.getElementById('settingsBtn').click(); const b=document.getElementById('fpsBtn'), o={l0:b.textContent,m0:__t.fpsMode}; b.click(); o.l1=b.textContent; o.m1=__t.fpsMode; o.st=localStorage.getItem('ll-fps'); return o;});
  ok(/Smooth/.test(fps.l0)&&fps.m0==='smooth'&&/Battery \(60\)/.test(fps.l1)&&fps.m1==='battery'&&/battery/.test(fps.st||''),'Settings turns Battery on and keeps it',fps);
  await p.evaluate(()=>{[...document.querySelectorAll('#mActions button')].find(x=>/Close|Back/.test(x.textContent)).click(); document.getElementById('title').hidden=true; __t.setP(false);});
  const capped=await count(1000);
  ok(capped>20,'held to 60, the game still runs',capped);
  // developer mode: the readout, and only there
  const none=await p.evaluate(()=>!document.getElementById('perfLine')||document.getElementById('perfLine').hidden);
  await p.evaluate(()=>__t.setDev(true)); await p.waitForTimeout(1300);
  const on=await p.evaluate(()=>{const e=document.getElementById('perfLine'); return e&&!e.hidden&&e.textContent;});
  await p.evaluate(()=>__t.setDev(false)); await p.waitForTimeout(200);
  const off=await p.evaluate(()=>document.getElementById('perfLine').hidden);
  ok(none&&/sim [\d.]+ · draw [\d.]+ ms · \d+ fps/.test(on||'')&&off,'the frame readout shows in developer mode and nowhere else',[none,on,off]);
  ok(errs.length===0,'no page errors',errs);
  console.log(JSON.stringify({moving,still,dirty,pool0,capped,on}));
  for(const f of fails)console.log('FAIL '+f);
  if(fails.length)process.exitCode=1; else console.log('battery: all ok');
  await b.close();
})();
