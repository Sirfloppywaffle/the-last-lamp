// The walkthrough on the first descent, first-time tips, and the practice Knucklebones on the title (developer mode).
const {chromium}=require('playwright');
(async()=>{
  const b=await chromium.launch(); let fails=0; const fail=m=>{console.log('FAIL '+m); fails++;};
  const coach=p=>p.evaluate(()=>{const c=document.getElementById('coach'), r=c.getBoundingClientRect();
    return {on:__t.COACH.on,kind:__t.COACH.kind,key:__t.COACH.key,title:document.getElementById('coachTitle').textContent,shown:!c.hidden,
      inView:r.left>=0&&r.top>=0&&r.right<=innerWidth+1&&r.bottom<=innerHeight+1,ring:!document.getElementById('coachRing').hidden,tut:__t.tut()};});
  const btn=(p,t)=>p.evaluate(t=>{const x=[...document.querySelectorAll('#coachActs button, #mActions button')].find(b=>b.textContent===t&&b.offsetParent); if(!x)return false; x.click(); return true;},t);
  const ringMid=p=>p.evaluate(()=>{const e=document.getElementById('coachRing').getBoundingClientRect(); return {x:e.left+e.width/2,y:e.top+e.height/2};});
  const start=async(p)=>{await p.click('#descendBtn'); await p.waitForTimeout(250); await p.evaluate(()=>document.querySelectorAll('#mChoices .choice')[0].click()); await p.waitForTimeout(2600);};

  // A: the whole walkthrough, by touch, folded and sideways
  for(const [w,h,tag] of [[412,860,'folded'],[915,356,'side']]){
    const p=await b.newPage({viewport:{width:w,height:h},hasTouch:true});
    await p.goto('file://'+process.argv[2]); await p.waitForTimeout(300);
    await p.evaluate(()=>__t.tutReset());
    await start(p);
    const offer=await p.evaluate(()=>!document.querySelector('#modal').hidden&&document.querySelector('#mTitle').textContent);
    if(offer!=='First time down here?'){fail(tag+': the first descent offers the walkthrough, got '+offer); await p.close(); continue;}
    await btn(p,'Show me'); await p.waitForTimeout(300);
    for(const t of ['Lamp oil','Essence','Madness','The light']){
      const c=await coach(p);
      if(c.title!==t||!c.shown||!c.inView||!c.ring)fail(tag+': step "'+t+'" shows on screen with its ring '+JSON.stringify(c));
      await btn(p,'Next'); await p.waitForTimeout(250);
    }
    let c=await coach(p);
    if(c.title!=='Choose a ward')fail(tag+': then it asks you to choose a ward '+JSON.stringify(c));
    let at=await ringMid(p); await p.touchscreen.tap(at.x,at.y); await p.waitForTimeout(350);
    c=await coach(p);
    if(c.title!=='Build it'||!await p.evaluate(()=>__t.sel&&__t.sel.type==='candle'))fail(tag+': tapping the ringed Candle chooses it and moves on '+JSON.stringify(c));
    // putting the ward down goes back a step; choosing it again comes forward
    if(tag==='folded'){
      await p.evaluate(()=>{__t.setSel(null);}); await p.waitForTimeout(350);
      if((await coach(p)).title!=='Choose a ward')fail('putting the ward down goes back to choosing one');
      at=await ringMid(p); await p.touchscreen.tap(at.x,at.y); await p.waitForTimeout(350);
      if((await coach(p)).title!=='Build it')fail('choosing it again comes back to building it');
    }
    // a real tap on a lit tile goes through to the board, even with the bubble up
    const tile=await p.evaluate(()=>{const T=__t, r=document.getElementById('board').getBoundingClientRect();
      for(let d=1;d<4;d++)for(let dc=-d;dc<=d;dc++)for(let dr=-d;dr<=d;dr++){const cc=T.F.lampC+dc, rr=T.F.lampR+dr; if(!T.placeProblem(T.sel,cc,rr)){const x=r.left+(cc+.5)/T.COLS*r.width, y=r.top+(rr+.5)/T.ROWS*r.height; const hit=document.elementFromPoint(x,y); if(hit&&hit.id==='board')return {x,y};}}
      return null;});
    if(!tile){fail(tag+': no free lit tile that the bubble leaves uncovered'); await p.close(); continue;}
    await p.touchscreen.tap(tile.x,tile.y); await p.waitForTimeout(350);
    c=await coach(p);
    if(c.title!=='Branches'||await p.evaluate(()=>__t.F.towers.length)!==1)fail(tag+': the candle is built and the walkthrough moves on '+JSON.stringify(c));
    at=await ringMid(p); await p.touchscreen.tap(at.x,at.y); await p.waitForTimeout(350);
    c=await coach(p);
    if(!/three branches/.test(await p.evaluate(()=>document.getElementById('coachText').textContent))||!await p.evaluate(()=>!document.getElementById('sheet').hidden))fail(tag+': tapping the ringed ward opens its branches '+JSON.stringify(c));
    await p.screenshot({path:(process.argv[3]||'.')+'/walk-branches-'+tag+'.png'});
    await btn(p,'Next'); await p.waitForTimeout(250);
    c=await coach(p); if(c.title!=='Rites')fail(tag+': then rites '+JSON.stringify(c));
    await btn(p,'Next'); await p.waitForTimeout(250);
    c=await coach(p); if(c.title!=='Call the dark')fail(tag+': then calling the dark '+JSON.stringify(c));
    await p.click('#callBtn'); await p.waitForTimeout(350);
    c=await coach(p); if(c.title!=='Speed and pause'||await p.evaluate(()=>__t.F.phase)!=='wave')fail(tag+': calling the dark starts the wave and the last step shows '+JSON.stringify(c));
    await btn(p,'Got it'); await p.waitForTimeout(250);
    c=await coach(p); if(c.on||c.shown||c.tut.walk!=='done')fail(tag+': the walkthrough is done and remembered '+JSON.stringify(c));
    await p.close();
  }

  // B: "I know the way", and skipping partway
  {
    const p=await b.newPage({viewport:{width:412,height:860},hasTouch:true});
    await p.goto('file://'+process.argv[2]); await p.waitForTimeout(300);
    await p.evaluate(()=>__t.tutReset()); await start(p);
    await btn(p,'I know the way'); await p.waitForTimeout(300);
    let c=await coach(p);
    if(c.on||c.tut.walk!=='skipped'||!await p.evaluate(()=>document.getElementById('hint').classList.contains('show')))fail('"I know the way" skips it, remembers that, and leaves the one-line hint '+JSON.stringify(c));
    await p.evaluate(()=>__t.tutReset()); await p.evaluate(()=>{__t.newRun();}); await p.waitForTimeout(2600);
    await btn(p,'Show me'); await p.waitForTimeout(250); await btn(p,'Skip walkthrough'); await p.waitForTimeout(250);
    c=await coach(p);
    if(c.on||c.shown||c.tut.walk!=='skipped')fail('skipping partway puts it away for good '+JSON.stringify(c));
    // the next descent does not offer it again
    await p.evaluate(()=>{__t.newRun();}); await p.waitForTimeout(2600);
    if(await p.evaluate(()=>!document.querySelector('#modal').hidden))fail('once skipped, the walkthrough is not offered again');
    await p.close();
  }

  // C: tips. The fork on floor 2, then a Shade holds the wave until it's read; seen tips don't come back; "No more tips" means none
  {
    const p=await b.newPage({viewport:{width:412,height:860},hasTouch:true});
    await p.goto('file://'+process.argv[2]); await p.waitForTimeout(300);
    await p.evaluate(()=>{__t.tutSet({walk:'done',seen:[],off:false}); __t.newRun(); __t.run.floor=1; __t.beginFloor(null);}); await p.waitForTimeout(2600);
    const steps=[];
    for(let i=0;i<3;i++){const c=await coach(p); steps.push(c.title); if(!c.ring)fail('fork tip step '+c.title+' rings what it talks about'); await btn(p,i<2?'Next':'Got it'); await p.waitForTimeout(250);}
    if(steps.join()!=='The stair forks,The Weir,The Will-o’-Wisp')fail('the fork tip walks through the fork, the Weir and the Wisp: '+steps);
    await p.evaluate(()=>{__t.spawnFoe('shade',0,0); __t.F.phase='wave';});
    await p.evaluate(()=>{const e=__t.F.foes[__t.F.foes.length-1]; e.d=2;}); await p.waitForTimeout(700);
    let c=await coach(p), paused=await p.evaluate(()=>__t.COACH.held);
    if(c.key!=='veiled'||!c.shown||!paused)fail('a Shade on the board brings its tip and holds the wave '+JSON.stringify(c));
    await btn(p,'Got it'); await p.waitForTimeout(250);
    if(await p.evaluate(()=>__t.COACH.on||__t.COACH.held))fail('"Got it" lets the wave go on');
    const moved=await p.evaluate(async()=>{const e=__t.F.foes.find(o=>o.type==='shade'), d0=e.d; await new Promise(r=>setTimeout(r,500)); return e.d-d0;});
    if(!(moved>0))fail('the wave runs again after the tip (the Shade walks on) '+moved);
    // seen: another Shade brings nothing; switching tips off: a Wretch brings nothing
    await p.evaluate(()=>{__t.spawnFoe('shade',0,2);}); await p.waitForTimeout(700);
    if((await coach(p)).on)fail('a tip is only given once');
    await p.evaluate(()=>{__t.spawnFoe('wretch',0,2);}); await p.waitForTimeout(700);
    c=await coach(p); if(c.key!=='wretch')fail('a Wretch brings its own tip '+JSON.stringify(c));
    await btn(p,'No more tips'); await p.waitForTimeout(250);
    await p.evaluate(()=>{__t.spawnFoe('shrieker',0,2);}); await p.waitForTimeout(700);
    c=await coach(p); if(c.on||!c.tut.off)fail('"No more tips" switches them off '+JSON.stringify(c));
    await p.close();
  }

  // D: the practice Knucklebones on the title, only in developer mode, and it never touches a run
  {
    const p=await b.newPage({viewport:{width:412,height:860},hasTouch:true});
    await p.goto('file://'+process.argv[2]); await p.waitForTimeout(300);
    if(await p.evaluate(()=>!document.getElementById('bonesBtn').hidden))fail('the Knucklebones button stays hidden without developer mode');
    await p.evaluate(()=>localStorage.setItem('ll-dev','true')); await p.reload(); await p.waitForTimeout(300);
    if(await p.evaluate(()=>document.getElementById('bonesBtn').hidden))fail('developer mode shows the Knucklebones on the title');
    const save0=await p.evaluate(()=>JSON.stringify(Object.keys(localStorage).sort().map(k=>[k,localStorage.getItem(k)])));
    await p.click('#bonesBtn'); await p.waitForTimeout(300);
    let s=await p.evaluate(()=>({title:document.querySelector('#mTitle').textContent,cards:[...document.querySelectorAll('#mChoices .choice b')].map(x=>x.textContent)}));
    if(s.title!=='The Knucklebones'||s.cards.join()!=='Gentle,Cunning,Merciless')fail('the practice table opens with a choice of how it plays '+JSON.stringify(s));
    await p.evaluate(()=>[...document.querySelectorAll('#mChoices .choice')].find(c=>c.querySelector('b').textContent==='Merciless').click()); await p.waitForTimeout(900);
    s=await p.evaluate(()=>({level:__t.bonesPrac.level,die:__t.bonesPrac.room.die,open:document.querySelectorAll('[data-bcol]:not([disabled])').length}));
    if(s.level!==4||!s.die||s.open!==3)fail('choosing Merciless starts a game at its hardest, with your first bone rolled '+JSON.stringify(s));
    await p.evaluate(()=>document.querySelector('[data-bcol="0"]').click()); await p.waitForTimeout(3000);
    s=await p.evaluate(()=>({you:__t.bonesPrac.room.you.flat().length+__t.bonesPrac.room.them.flat().length,die:__t.bonesPrac.room.die,run:!!__t.run}));
    if(!(s.you>=1)||!s.die||s.run)fail('a move plays out on the practice table, with no run started '+JSON.stringify(s));
    await p.screenshot({path:(process.argv[3]||'.')+'/practice-bones.png'});
    await p.evaluate(()=>[...document.querySelectorAll('#mActions button')].find(x=>x.textContent==='Back to the title').click()); await p.waitForTimeout(300);
    const save1=await p.evaluate(()=>JSON.stringify(Object.keys(localStorage).sort().map(k=>[k,localStorage.getItem(k)])));
    if(await p.evaluate(()=>!document.querySelector('#modal').hidden||document.querySelector('#title').hidden||!!__t.bonesPrac))fail('Back to the title closes the table');
    if(save0!==save1)fail('the practice table saves nothing');
    await p.close();
  }
  await b.close();
  if(fails)process.exitCode=1;
})();
