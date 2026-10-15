// The relic bar in the HUD (tap a relic to read it) and the Grimoire (creatures met, wards, rites, relics found).
const {chromium}=require('playwright');
(async()=>{
  const b=await chromium.launch(); let fails=0; const fail=m=>{console.log('FAIL '+m); fails++;};

  // A: the relic bar, at each layout: it never moves the board, and a tap reads a relic
  for(const [w,h,tag] of [[412,860,'folded'],[915,356,'side'],[832,694,'unfolded'],[393,659,'iphone']]){
    const p=await b.newPage({viewport:{width:w,height:h},hasTouch:true});
    await p.goto('file://'+process.argv[2]); await p.waitForTimeout(300);
    await p.evaluate(()=>{__t.newRun(); __t.forceUI();}); await p.waitForTimeout(300);
    const stage=()=>p.evaluate(()=>JSON.stringify(document.getElementById('stage').getBoundingClientRect()));
    const s0=await stage();
    await p.evaluate(()=>{['glass','tallow','veil','binder','quiet','blackwick','key'].forEach(k=>__t.addRelic(k)); __t.forceUI();}); await p.waitForTimeout(250);
    if(await stage()!==s0)fail(tag+': carrying relics must not move the board');
    const chips=await p.evaluate(()=>[...document.querySelectorAll('#relChips .relchip')].map(c=>c.textContent+(c.classList.contains('is-curse')?'!':'')));
    if(chips.join()!=='G!,T,M,B,Q,B!,O')fail(tag+': one seal per relic, cursed ones marked '+chips);
    const at=await p.evaluate(()=>{const r=document.querySelector('.relchip').getBoundingClientRect(); return {x:r.left+r.width/2,y:r.top+r.height/2};});
    await p.touchscreen.tap(at.x,at.y); await p.waitForTimeout(250);
    const tip=await p.evaluate(()=>{const t=document.getElementById('relTip'), r=t.getBoundingClientRect(); return {shown:!t.hidden,text:t.textContent,curse:t.classList.contains('is-curse'),inView:r.left>=0&&r.top>=0&&r.right<=innerWidth+1&&r.bottom<=innerHeight+1};});
    if(!tip.shown||!/Glass Lantern/.test(tip.text)||!/6 less oil/.test(tip.text)||!tip.curse||!tip.inView)fail(tag+': tapping the Glass Lantern says what it does, on screen '+JSON.stringify(tip));
    await p.screenshot({path:(process.argv[3]||'.')+'/relic-tip-'+tag+'.png'});
    // the card takes no taps: a tap on the board goes through, and puts the card away
    const board=await p.evaluate(()=>{const r=document.getElementById('board').getBoundingClientRect(); return {x:r.left+r.width/2,y:r.top+r.height*.75};});
    await p.touchscreen.tap(board.x,board.y); await p.waitForTimeout(250);
    if(await p.evaluate(()=>!document.getElementById('relTip').hidden))fail(tag+': the next tap puts the relic card away');
    // and with the card up, a button still does its job: Pause opens the pause menu
    if(tag==='folded'){
      await p.touchscreen.tap(at.x,at.y); await p.waitForTimeout(250);
      await p.tap('#pauseBtn'); await p.waitForTimeout(250);
      const m=await p.evaluate(()=>({title:document.querySelector('#mTitle').textContent,open:!document.querySelector('#modal').hidden,tip:!document.getElementById('relTip').hidden}));
      if(!m.open||m.title!=='Paused'||m.tip)fail('with a relic card up, Pause still opens the pause menu (and the card goes) '+JSON.stringify(m));
    }
    await p.close();
  }

  // B: the Grimoire from the HUD: it pauses, shows only creatures met, and closing resumes
  {
    const p=await b.newPage({viewport:{width:412,height:860},hasTouch:true});
    await p.goto('file://'+process.argv[2]); await p.waitForTimeout(300);
    await p.evaluate(()=>{localStorage.removeItem('ll-codex'); localStorage.removeItem('ll-best');}); await p.reload(); await p.waitForTimeout(300);
    await p.evaluate(()=>{__t.newRun(); __t.addRelic('glass'); __t.spawnFoe('shade',0,0); __t.forceUI();}); await p.waitForTimeout(300);
    await p.tap('#bookBtn'); await p.waitForTimeout(300);
    let s=await p.evaluate(()=>({title:document.querySelector('#mTitle').textContent,paused:!!__t.BOOK&&document.querySelector('#modal').hidden===false,
      tabs:[...document.querySelectorAll('[data-book]')].map(x=>x.textContent),names:[...document.querySelectorAll('.book-e b')].map(x=>x.textContent)}));
    if(s.title!=='The Grimoire'||s.tabs.join()!=='Creatures,Wards,Rites,Relics,Kits,Patrons')fail('the HUD book opens the Grimoire with its six tabs '+JSON.stringify(s));
    if(!s.names.includes('Shade')||s.names.includes('Trench Behemoth')||s.names.filter(n=>n==='???').length<5)fail('creatures met are named, the rest are ??? '+JSON.stringify(s.names));
    const lore=await p.evaluate(()=>[...document.querySelectorAll('.book-e')].find(e=>e.querySelector('b').textContent==='Shade').textContent);
    if(!/Veiled/.test(lore)||!/Life 30/.test(lore))fail('a met creature shows its numbers and how it works: '+lore);
    await p.evaluate(()=>document.querySelector('[data-book="wards"]').click()); await p.waitForTimeout(200);
    const wards=await p.evaluate(()=>document.querySelector('.book-list').textContent);
    if(!/Brine Harpoon/.test(wards)||!/Twin Reel/.test(wards)||!/Whaling Gun/.test(wards)||!/Won as a gift/.test(wards))fail('the wards tab lists every ward, its branches and capstones, and which are gifts');
    await p.evaluate(()=>document.querySelector('[data-book="rites"]').click()); await p.waitForTimeout(200);
    if(!/Cooldown 28s/.test(await p.evaluate(()=>document.querySelector('.book-list').textContent)))fail('the rites tab gives each rite and its cooldown');
    await p.evaluate(()=>document.querySelector('[data-book="relics"]').click()); await p.waitForTimeout(200);
    const rel=await p.evaluate(()=>[...document.querySelectorAll('.book-e')].map(e=>e.querySelector('b').textContent+(e.classList.contains('is-held')?'*':'')));
    if(!rel.includes('Glass Lantern*')||rel.includes('Tallow of Saints'))fail('relics found are listed, the one carried marked, the rest ??? '+rel);
    await p.screenshot({path:(process.argv[3]||'.')+'/grimoire-relics.png'});
    if(!await p.evaluate(()=>{const t=document.querySelector('#mActions button'); return t.textContent==='Close';}))fail('the Grimoire closes with Close');
    await p.evaluate(()=>document.querySelector('#mActions button').click()); await p.waitForTimeout(200);
    if(await p.evaluate(()=>!document.querySelector('#modal').hidden))fail('Close shuts the Grimoire and the floor goes on');
    // it remembers across runs and reloads
    await p.reload(); await p.waitForTimeout(300);
    const C=await p.evaluate(()=>({foes:[...__t.codex().foes],relics:[...__t.codex().relics]}));
    if(!C.foes.includes('shade')||!C.relics.includes('glass'))fail('what has been met is remembered '+JSON.stringify(C));
    // from the title and from the pause menu
    await p.click('#bookTitleBtn'); await p.waitForTimeout(250);
    if(await p.evaluate(()=>document.querySelector('#mTitle').textContent)!=='The Grimoire')fail('the title opens the Grimoire');
    await p.evaluate(()=>document.querySelector('#mActions button').click()); await p.waitForTimeout(200);
    if(await p.evaluate(()=>!document.querySelector('#modal').hidden||document.querySelector('#title').hidden))fail('closing it goes back to the title');
    await p.evaluate(()=>{__t.newRun(); __t.forceUI();}); await p.waitForTimeout(200);
    await p.click('#pauseBtn'); await p.waitForTimeout(200);
    await p.evaluate(()=>[...document.querySelectorAll('#mActions button')].find(x=>x.textContent==='The Grimoire').click()); await p.waitForTimeout(200);
    await p.evaluate(()=>[...document.querySelectorAll('#mActions button')].find(x=>x.textContent==='Back').click()); await p.waitForTimeout(200);
    if(await p.evaluate(()=>document.querySelector('#mTitle').textContent)!=='Paused')fail('from the pause menu, Back goes back to it');
    await p.close();
  }

  // D: a damaged ll-codex is tolerated: wrong types are dropped, unknown keys ignored
  {
    const p=await b.newPage({viewport:{width:412,height:860}});
    await p.goto('file://'+process.argv[2]); await p.waitForTimeout(300);
    for(const bad of ['{"foes":5,"relics":"glass"}','{"foes":["shade","nonsense",7],"relics":null}','"just a string"','[1,2,3]']){
      await p.evaluate(v=>localStorage.setItem('ll-codex',v),bad); await p.reload(); await p.waitForTimeout(250);
      const r=await p.evaluate(()=>{try{__t.openBook('title'); const n=document.querySelectorAll('.book-e').length; return {ok:true,n,foes:[...__t.codex().foes]};}catch(e){return {ok:false,err:e.message};}});
      if(!r.ok||!(r.n>0)||r.foes.some(k=>k!=='shade'&&typeof k!=='string'))fail('a damaged codex ('+bad+') still opens the book '+JSON.stringify(r));
      if(bad.includes('nonsense')&&r.foes.join()!=='shade')fail('unknown and non-string entries are dropped '+JSON.stringify(r));
    }
    await p.close();
  }

  // C: someone who played before the Grimoire has met everything on the floors they reached
  {
    const p=await b.newPage({viewport:{width:412,height:860}});
    await p.goto('file://'+process.argv[2]); await p.waitForTimeout(300);
    await p.evaluate(()=>{localStorage.removeItem('ll-codex'); localStorage.setItem('ll-best',JSON.stringify({floor:2,wins:0}));}); await p.reload(); await p.waitForTimeout(300);
    const foes=await p.evaluate(()=>[...__t.codex().foes].sort().join());
    if(!/crawler/.test(foes)||!/shade/.test(foes)||/behemoth/.test(foes))fail('an old save has met floors 1 and 2, not the deep ones: '+foes);
    await p.close();
  }
  await b.close();
  if(fails)process.exitCode=1;
})();
