// Hints never stand in the way: a ward's long description shows by itself once, a tap on the board puts any hint away,
// and in a wave the "cut off" warning speaks once, not at every flicker.
const {chromium}=require('playwright');
const fails=[]; const ok=(c,m,d)=>{if(!c)fails.push(m+(d!==undefined?' '+JSON.stringify(d):''));};
(async()=>{
  const b=await chromium.launch(); const p=await b.newPage({viewport:{width:384,height:860},hasTouch:true,isMobile:true});
  const errs=[]; p.on('pageerror',e=>errs.push(String(e)));
  await p.goto('file://'+process.argv[2]); await p.waitForTimeout(300);
  await p.evaluate(()=>{const T=__t; localStorage.removeItem('ll-desc'); T.tutSet({off:true,seen:[],walk:'done'}); T.newRun('galvanist',0); T.run.floor=1; T.beginFloor(null); T.run.ess=999; T.forceUI();});
  await p.waitForTimeout(300);
  const shown=()=>p.evaluate(()=>{const h=document.getElementById('hint'); return h.classList.contains('show')?h.textContent:'';});
  const pick=(name)=>p.evaluate((name)=>{const el=[...document.querySelectorAll('button')].find(e=>e.textContent.trim().startsWith(name)); el.click();},name);
  await pick('Pylon'); await p.waitForTimeout(200);
  const first=await shown();
  ok(/iron mast/.test(first),'the first pick of the Pylon shows its full description',first);
  /* a tap on the board puts it away */
  const box=await p.$eval('canvas',c=>{const r=c.getBoundingClientRect(); return [r.x+r.width/2,r.y+10];});
  await p.touchscreen.tap(box[0],box[1]); await p.waitForTimeout(350);
  ok(!/iron mast/.test(await shown()),'a tap on the board puts the description away',await shown());
  /* picking it again does not cover the board */
  await p.evaluate(()=>{__t.setSel(null); __t.forceUI();}); await p.waitForTimeout(100);
  await p.evaluate(()=>{document.getElementById('hint').classList.remove('show');});
  await pick('Pylon'); await p.waitForTimeout(200);
  ok(!/iron mast/.test(await shown()),'the second pick does not show it by itself');
  await p.evaluate(()=>document.querySelector('#modebar .mt').click()); await p.waitForTimeout(100);
  ok(/iron mast/.test(await shown()),'tapping the card still shows it');
  /* in a wave, a ward dropping in and out of the light is warned about once */
  const r=await p.evaluate(()=>{const T=__t; T.setSel(null); T.setP(false); window.devNoDark=false;
    /* MutationObserver only reports after this script ends, so read the hint after every step instead */
    const hs=[], H=document.getElementById('hint'); let last=null; const step=(dt)=>{H.textContent=''; T.update(dt); if(H.textContent)hs.push(H.textContent);};
    T.newRun('lamplighter',0); T.run.floor=1; T.beginFloor(null); T.run.ess=9999; T.run.oil=T.run.oilMax=999;
    /* a harpoon in the light */
    let edge=null, ed=0; const R=T.lampBase(); for(let r=0;r<T.ROWS;r++)for(let c=0;c<T.COLS;c++){if(T.placeProblem({kind:'ward',type:'harpoon'},c,r))continue; const d=Math.hypot(c+.5-T.F.lx,r+.5-T.F.ly); if(d<=R&&d>R-.6&&d>ed){ed=d;edge=[c,r];}}
    T.setSel({kind:'ward',type:'harpoon'}); T.tryPlace(edge[0],edge[1]); T.setSel(null);
    T.startWave(); step(.05);
    const h=T.F.towers.find(t=>t.type==='harpoon'), hx=h.x, hy=h.y, n1=hs.length;
    const dk=[]; for(let i=0;i<5;i++){h.x=T.F.lx+40; step(.05); dk.push(h.dark); h.x=hx; h.y=hy; step(.05); dk.push(h.dark);}
    const flips=hs.slice(n1).filter(x=>/cut off/.test(x)).length;
    return {dk:dk.join(''),flips,phase:T.F.phase};});
  console.log(JSON.stringify({first:first.slice(0,30),r}));
  ok(r.phase==='wave'&&r.dk.startsWith('truefalse')&&r.flips===1,'in a wave the cut-off warning speaks once at most',r);
  ok(!errs.length,'no page errors',errs);
  await b.close();
  if(fails.length){console.log('FAIL\n- '+fails.join('\n- ')); process.exit(1);} console.log('hints ok');
})();
