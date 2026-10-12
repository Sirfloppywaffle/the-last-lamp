// "How the dark works" on the title screen opens the rules where you can see them, and says when there is more below (issue #11).
const {chromium}=require('playwright');
(async()=>{
  const b=await chromium.launch(); let fails=0;
  const fail=m=>{console.log('FAIL '+m); fails++;};
  for(const [w,h,name] of [[412,860,'fold-folded'],[915,356,'fold-side'],[393,659,'iphone'],[1280,900,'desktop']]){
    const p=await b.newPage({viewport:{width:w,height:h},hasTouch:true});
    await p.goto('file://'+process.env.LL_RAW); await p.waitForTimeout(400);
    await p.tap('#rulesBtn'); await p.waitForTimeout(250);
    const r=await p.evaluate(()=>{
      const box=document.querySelector('#modal .box'), li=document.querySelector('#mChoices li'), rb=li&&li.getBoundingClientRect();
      const cue=document.querySelector('#mMore');
      return {open:!document.querySelector('#modal').hidden, title:document.querySelector('#mTitle').textContent,
        firstVisible:!!rb&&rb.top>=0&&rb.bottom<=innerHeight, overflow:box.scrollHeight>box.clientHeight+8, cue:!cue.hidden,
        cueBox:cue.hidden?null:(()=>{const s=cue.querySelector('span').getBoundingClientRect(), bb=box.getBoundingClientRect(); return s.top>=bb.top&&s.bottom<=bb.bottom+1;})()};
    });
    const tag=name+' '+w+'x'+h+': ';
    if(!r.open||r.title!=='How the dark works')fail(tag+'tapping the button should open the rules on top '+JSON.stringify(r));
    if(!r.firstVisible)fail(tag+'the first rule should be on screen without scrolling');
    if(r.overflow!==r.cue)fail(tag+'the "More below" cue should show exactly when there is more to scroll '+JSON.stringify(r));
    if(r.cue&&!r.cueBox)fail(tag+'the cue should sit inside the box');
    await p.screenshot({path:(process.argv[3]||'.')+'/rules-'+name+'.png'});
    if(r.overflow){
      await p.evaluate(()=>{const box=document.querySelector('#modal .box'); box.scrollTop=box.scrollHeight;}); await p.waitForTimeout(150);
      if(await p.evaluate(()=>!document.querySelector('#mMore').hidden))fail(tag+'the cue should go away at the bottom');
      await p.evaluate(()=>{document.querySelector('#modal .box').scrollTop=0;}); await p.waitForTimeout(150);
      if(await p.evaluate(()=>document.querySelector('#mMore').hidden))fail(tag+'the cue should come back when scrolled up again');
    }
    // Close (a click, not pointerdown: AGENTS.md rule 5) returns to the title, and reopening starts at the top
    await p.evaluate(()=>[...document.querySelectorAll('#mActions button')].find(x=>x.textContent==='Close').click()); await p.waitForTimeout(150);
    if(await p.evaluate(()=>!document.querySelector('#modal').hidden||document.querySelector('#title').hidden))fail(tag+'Close should return to the title screen');
    await p.tap('#rulesBtn'); await p.waitForTimeout(200);
    if(await p.evaluate(()=>document.querySelector('#modal .box').scrollTop)!==0)fail(tag+'reopened rules should start at the top');
    console.log(tag+JSON.stringify(r));
    await p.close();
  }
  await b.close();
  if(fails)process.exitCode=1;
})();
