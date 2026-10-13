// The Knucklebones: a landing room where you push your luck with essence the stair would burn.
const {chromium}=require('playwright');
(async()=>{
  const b=await chromium.launch(); let fails=0; const fail=m=>{console.log('FAIL '+m); fails++;};
  // the rules run with reduced motion (no throw animation); the table's animation is checked at the end
  const p=await b.newPage({viewport:{width:412,height:860},hasTouch:true});
  await p.emulateMedia({reducedMotion:'reduce'});
  await p.goto('file://'+process.argv[2]); await p.waitForTimeout(300);
  // a landing with the Knucklebones behind the door; dice are forced: 0.99 lands bare bone, 0 lands an eye
  const room=(ess,roll)=>p.evaluate(([ess,roll])=>{const T=__t; T.newRun(); T.run.floor=1; T.beginFloor(null); T.setP(true);
    Math.random=()=>roll;
    T.run.ess=ess; T.F.phase='draft'; T.F.draft={step:'room',salvage:50,healed:0,opts:[],relics:0}; T.F.draft.room=T.makeRoom('bones'); T.showLanding();
    return T.F.draft.room.stake;},[ess,roll]);
  const card=(title)=>p.evaluate(t=>{const c=[...document.querySelectorAll('#mChoices .choice')].find(x=>x.querySelector('b').textContent===t); if(!c)return null; const sub=c.querySelector('span:last-child').textContent; c.click(); return sub;},title);
  const st=()=>p.evaluate(()=>{const T=__t, r=T.F.draft.room; return {ess:T.run.ess,pot:r.pot,wins:r.wins,done:r.done,madPen:T.run.madPen||0,salvage:T.F.draft.salvage,title:document.querySelector('#mTitle').textContent,relics:T.run.relics.length,cards:[...document.querySelectorAll('#mChoices .choice b')].map(x=>x.textContent)};});

  // A: two clean throws, then walk away; winnings survive the toll
  let stake=await room(400,.99);
  if(stake!==60)fail('stake on floor 2 should be 60, got '+stake);
  let sub=await card('Throw the bones'); if(!/69%/.test(sub||''))fail('first throw shows 69% '+sub);
  let s=await st(); if(s.ess!==340||s.pot!==120||s.madPen!==0)fail('a clean first throw doubles the stake, no madness '+JSON.stringify(s));
  sub=await card('Throw again'); if(!/44%/.test(sub||''))fail('second throw shows 44% '+sub);
  s=await st(); if(s.pot!==240||s.madPen!==1)fail('a second throw costs 1 madness and doubles the pot '+JSON.stringify(s));
  if(!/25%/.test(await p.evaluate(()=>document.querySelector('#mChoices .choice span:last-child').textContent)))fail('third throw shows 25%');
  await card('Take the pot'); s=await st();
  if(s.ess!==580||s.salvage!==290||s.done!=='cash')fail('walking away pays the pot into protected salvage '+JSON.stringify(s));
  await p.evaluate(()=>{__t.descend();}); await p.waitForTimeout(100);
  s=await p.evaluate(()=>__t.run.ess);
  // 290 protected + 30% of the 290 loose = 377, plus floor 3's stipend 120
  if(s!==290+87+120)fail('after the toll the winnings are kept: expected 497, got '+s);

  // B: an eye on the first throw takes the stake
  await p.evaluate(()=>{document.querySelector('#mapOverlay').hidden=true;});
  await room(400,.99); await p.evaluate(()=>{Math.random=()=>0;});
  await card('Throw the bones'); s=await st();
  if(s.done!=='bust'||s.ess!==340||s.pot!==0||!/take/i.test(s.title))fail('a bust loses the stake '+JSON.stringify(s));

  // C: three clean throws pay the pot and a relic, and cost 2 madness
  await room(400,.99);
  await card('Throw the bones'); await card('Throw again'); await card('Throw again'); s=await st();
  if(s.wins!==3||s.done!=='cash'||s.madPen!==2||s.title!=='What it was keeping')fail('three clean throws end on a relic pick '+JSON.stringify(s));
  const before=s.relics; await p.evaluate(()=>document.querySelector('#mChoices .choice').click()); s=await st();
  if(s.relics!==before+1||s.ess!==340+480)fail('the third throw pays 480 and a relic '+JSON.stringify(s));

  // D: too poor to play
  await room(10,.99); s=await st();
  if(s.cards.length)fail('with 10 essence there is no throw to offer '+JSON.stringify(s));

  // E: a real tap on a phone, after the double-tap guard's window
  await room(400,.99); await p.waitForTimeout(300);
  const box=await p.evaluate(()=>{const r=document.querySelector('#mChoices .choice').getBoundingClientRect(); return {x:r.left+r.width/2,y:r.top+r.height/2};});
  await p.touchscreen.tap(box.x,box.y); await p.waitForTimeout(150); s=await st();
  if(s.pot!==120)fail('a real tap throws the bones '+JSON.stringify(s));
  await p.screenshot({path:(process.argv[3]||'.')+'/bones-midgame.png'});

  // F: the room can come up behind a door
  const seen=await p.evaluate(()=>{let n=0; for(let i=0;i<300;i++)if(__t.makeDoors().some(d=>d.room==='bones'))n++; return n;});
  if(seen<20)fail('the Knucklebones should turn up behind doors, seen '+seen+'/300');
  // G: with motion, the table plays the throw out: no text or choices until the bones land, then the result
  for(const [w,h,tag] of [[412,860,'folded'],[915,356,'side']]){
    const q=await b.newPage({viewport:{width:w,height:h},hasTouch:true});
    await q.goto('file://'+process.argv[2]); await q.waitForTimeout(300);
    await q.evaluate(()=>{const T=__t; T.newRun(); T.run.floor=1; T.beginFloor(null); T.setP(true); Math.random=()=>.99;
      T.run.ess=400; T.F.phase='draft'; T.F.draft={step:'room',salvage:50,healed:0,opts:[],relics:0}; T.F.draft.room=T.makeRoom('bones'); T.showLanding();});
    await q.waitForTimeout(300);
    const painted=()=>q.evaluate(()=>{const cv=document.getElementById('bonesCv'); if(!cv||!cv.width)return 0; const d=cv.getContext('2d').getImageData(0,0,cv.width,cv.height).data; let n=0; for(let i=0;i<d.length;i+=40)if(d[i]+d[i+1]+d[i+2]>60)n++; return n;});
    if(await painted()<50)fail(tag+': the table should be painted before the throw');
    await q.evaluate(()=>{[...document.querySelectorAll('#mChoices .choice')].find(c=>c.querySelector('b').textContent==='Throw the bones').click();});
    await q.waitForTimeout(500);
    let m=await q.evaluate(()=>({cards:document.querySelectorAll('#mChoices .choice').length,wait:!!document.querySelector('.bones-wait'),pot:__t.F.draft.room.pot}));
    if(m.cards||!m.wait||m.pot!==120)fail(tag+': mid-throw shows only the tumbling bones (the result is already decided) '+JSON.stringify(m));
    await q.screenshot({path:(process.argv[3]||'.')+'/bones-throw-'+tag+'.png'});
    await q.waitForTimeout(1300);
    m=await q.evaluate(()=>({cards:[...document.querySelectorAll('#mChoices .choice b')].map(x=>x.textContent),wait:!!document.querySelector('.bones-wait')}));
    if(m.wait||m.cards.join()!=='Throw again,Take the pot')fail(tag+': after landing, the result and choices return '+JSON.stringify(m));
    if(await painted()<50)fail(tag+': the table should still be painted after the throw');
    await q.screenshot({path:(process.argv[3]||'.')+'/bones-landed-'+tag+'.png'});
    // the table's loop is one loop, and it stops once you leave the room (Gemini's review asked)
    const loops=await q.evaluate(async()=>{
      let n=0; const raf=window.requestAnimationFrame;
      window.requestAnimationFrame=cb=>{if(cb&&cb.name==='bonesFrame')n++; return raf(cb);};
      await new Promise(r=>setTimeout(r,500)); const open=n;
      __t.descend(); document.querySelector('#mapOverlay').hidden=true;
      await new Promise(r=>setTimeout(r,200)); n=0;
      await new Promise(r=>setTimeout(r,700)); window.requestAnimationFrame=raf; return {open,after:n};
    });
    console.log(tag+' table loop frames',JSON.stringify(loops));
    if(loops.open<10||loops.open>60)fail(tag+': one table loop while the room is open (frames in 0.5s) '+JSON.stringify(loops));
    if(loops.after!==0)fail(tag+': the table loop must stop after you leave '+JSON.stringify(loops));
    await q.close();
  }
  await b.close();
  if(fails)process.exitCode=1;
})();
