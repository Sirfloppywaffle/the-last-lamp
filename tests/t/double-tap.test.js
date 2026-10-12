// Double-tap protection: a fast double-tap on a landing choice must not leak into the next screen.
const {chromium}=require('playwright');
const fails=[]; const ok=(c,m,d)=>{if(!c)fails.push(m+(d!==undefined?' '+JSON.stringify(d):''));};

(async()=>{
  const b=await chromium.launch();
  const ctx=await b.newContext({viewport:{width:412,height:860},deviceScaleFactor:2,hasTouch:true,isMobile:true});
  const p=await ctx.newPage(); const cdp=await ctx.newCDPSession(p);
  await p.goto('file://'+process.argv[2]); await p.waitForTimeout(400);

  // Set up a run that cleared floor 1 and opened the landing draft
  await p.evaluate(()=>{
    const T=__t;
    T.newRun();
    T.run.floor=1;
    T.beginFloor(null);
    T.F.wave=T.F.def.waves.length;
    T.F.phase='cleared';
    T.openDraft(100,0);
  });
  await p.waitForTimeout(300);

  // Confirm we start on the 'gift' step
  const step1=await p.evaluate(()=>__t.F&&__t.F.draft&&__t.F.draft.step);
  ok(step1==='gift','should start on gift step',step1);

  // Find the position of the first gift choice button
  const pos=await p.$eval('#mChoices .choice',e=>{
    const r=e.getBoundingClientRect();
    return [r.x+r.width/2,r.y+r.height/2];
  });

  // Double-tap: two real touch taps about 70ms apart on the first gift choice
  const tap=async(x,y)=>{
    await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});
    await p.waitForTimeout(30);
    await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  };

  await tap(pos[0],pos[1]);
  await p.waitForTimeout(70);
  await tap(pos[0],pos[1]);
  await p.waitForTimeout(300);

  // Check landing state: must be on 'fork' step with no door/room chosen
  const state=await p.evaluate(()=>{
    const d=__t.F&&__t.F.draft;
    return d?{step:d.step,room:d.room}:null;
  });

  ok(state&&state.step==='fork'&&!state.room,'landing should be on fork step with no door chosen',state);

  for(const f of fails)console.log('FAIL '+f);
  if(fails.length)process.exitCode=1; else console.log('double-tap ok');
  await b.close();
})();
