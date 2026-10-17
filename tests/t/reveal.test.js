// The unlock reveal (#36, part 1): a kit earned by a deed rises out of the dark before the end screen, and a kit bought in
// the Ember Hall gets the same reveal there. A tap snaps it to the end, a second tap goes on (both on click, rule 5). It
// shows whatever the tip setting says (tests run with tips off). Reduce motion fades plainly. Nothing shifts when the text
// arrives (rule 2), and the reveal fits the folded, unfolded and short-landscape screens.
const {chromium}=require('playwright');
const file='file://'+process.argv[2], out=process.argv[3];
(async()=>{
  const b=await chromium.launch(); let fails=0;
  const fail=m=>{console.log('FAIL '+m); fails++;};
  const ok=(c,m)=>{if(!c)fail(m); else console.log('OK '+m);};
  const page=async(w,h,opts)=>{const p=await b.newPage(Object.assign({viewport:{width:w,height:h}},opts||{}));
    p.on('pageerror',e=>fail('page error: '+e.message)); p.on('console',m=>{if(m.type()==='error'&&!m.text().includes('ERR_'))fail('console: '+m.text());});
    await p.goto(file); await p.waitForTimeout(300); return p;};
  const state=p=>p.evaluate(()=>{const t=document.getElementById('urvTxt'), btn=document.querySelector('#mActions button.call');
    return {reveal:!!document.getElementById('urvBox'),title:document.getElementById('mTitle').textContent,on:!!t&&t.classList.contains('on'),
      text:t?t.innerText:'',btn:btn?btn.textContent:'',hidden:document.getElementById('modal').hidden};});
  // the modal ignores a click whose press began within 150ms of it opening, so wait before each tap
  const tap=async p=>{await p.waitForTimeout(450); await p.click('#urvBox');};

  // 1. two deeds on one run, then the morning: Whaler first, the Occultist after it, then the end screen
  let p=await page(412,860);
  await p.evaluate(()=>{const T=__t; T.newRun('lamplighter'); T.beginFloor(null); T.unlockDeed('whaler'); T.unlockDeed('occultist'); T.victory();});
  await p.waitForTimeout(150);
  let s=await state(p);
  ok(s.reveal&&s.title==='A deed is done','the reveal opens before the end screen');
  ok(!s.on,'the name has not appeared while the light is still spreading');
  ok(s.btn==='Skip','a Skip button stands in until it is finished');
  const rect0=await p.evaluate(()=>{const r=document.getElementById('urvBox').getBoundingClientRect(); return [Math.round(r.width),Math.round(r.height)];});
  await tap(p);
  s=await state(p);
  ok(s.reveal&&s.on,'one tap snaps to the finished card');
  ok(/Jonah Tolland/.test(s.text)&&/The Whaler/i.test(s.text)&&/Behemoth/.test(s.text)&&/The line holds/.test(s.text),'it shows the name, the kit, the deed and the reveal line');
  ok(s.btn==='Next','the button says Next while another kit waits');
  const rect1=await p.evaluate(()=>{const r=document.getElementById('urvBox').getBoundingClientRect(); return [Math.round(r.width),Math.round(r.height)];});
  ok(rect0[0]===rect1[0]&&rect0[1]===rect1[1],'nothing shifts when the text arrives ('+rect0+' -> '+rect1+')');
  const same=await p.evaluate(()=>document.getElementById('urvCv').toDataURL()===__t.portraitCanvas('whaler',false,0,0).toDataURL());
  ok(same,'the snapped card is the lit portrait');
  await p.waitForTimeout(100); await p.click('#urvBox'); // a hasty second tap is not read as "go on"
  s=await state(p);
  ok(s.reveal&&/Jonah Tolland/.test(s.text),'a hasty double tap does not skip past the card');
  await tap(p);
  s=await state(p);
  ok(s.reveal&&/The Nameless|Occultist/.test(s.text)&&/Something below hears it ask/.test(s.text),'the second tap goes on to the next kit');
  ok(s.btn==='Skip','the next reveal starts again from the dark');
  await p.waitForTimeout(1500);
  s=await state(p);
  ok(s.on&&s.btn==='Continue','left alone, the light finishes by itself and the button says Continue');
  await tap(p);
  s=await state(p);
  ok(!s.reveal&&s.title==='Morning'&&!s.hidden,'then the end screen follows');
  await p.close();

  // 2. a lost run: the end screen waits for the reveal, and the Skip button works like a tap
  p=await page(412,860);
  await p.evaluate(()=>{const T=__t; T.newRun('lamplighter'); T.beginFloor(null); T.unlockDeed('whaler'); T.defeat();});
  await p.waitForTimeout(1300);
  s=await state(p);
  ok(s.reveal&&s.title==='A deed is done','a lost run reveals too');
  await p.waitForTimeout(300); await p.click('#mActions button.call');
  s=await state(p);
  ok(s.reveal&&s.on,'the Skip button snaps to the end');
  await p.waitForTimeout(450); await p.click('#mActions button.call');
  s=await state(p);
  ok(!s.reveal&&s.title==='The lamp is out','and the same button goes on to the end screen');
  await p.close();

  // 3. a run with no deed shows no reveal
  p=await page(412,860);
  await p.evaluate(()=>{const T=__t; T.newRun('lamplighter'); T.beginFloor(null); T.victory();});
  await p.waitForTimeout(150);
  s=await state(p);
  ok(!s.reveal&&s.title==='Morning','no deed, no reveal');
  await p.close();

  // 4. a kit bought in the Ember Hall: the same reveal, in the Hall, and the Hall comes back after it
  p=await page(412,860);
  await p.evaluate(()=>{localStorage.setItem('ll-meta',JSON.stringify({embers:500,unlocked:[],depth:0,runs:0,wins:0,deeds:2})); __t.openHall();});
  await p.waitForTimeout(150);
  await p.evaluate(()=>{const c=[...document.querySelectorAll('#mChoices .choice')].find(x=>/Galvanist/i.test(x.innerText)); c.click();});
  await p.waitForTimeout(150);
  s=await state(p);
  ok(s.reveal&&s.title==='The Ember Hall'&&/Bought in the Ember Hall/.test(s.text)&&/Lucan Voss/.test(s.text),'a bought kit is revealed in the Hall');
  ok((await p.evaluate(()=>__t.meta.unlocked.includes('kit_galvanist'))),'and it is unlocked');
  await tap(p); await tap(p);
  s=await state(p);
  const hall=await p.evaluate(()=>({t:document.getElementById('mTitle').textContent,b:document.getElementById('mBody').innerText}));
  ok(!s.reveal&&hall.t==='The Ember Hall'&&/is yours/.test(hall.b),'the Hall comes back with its note after the reveal');
  await p.close();

  // 5. reduce motion: a plain fade, still finished by itself, still one tap to snap
  p=await page(412,860,{reducedMotion:'reduce'});
  await p.evaluate(()=>{const T=__t; T.newRun('lamplighter'); T.beginFloor(null); T.unlockDeed('whaler'); T.victory();});
  await p.waitForTimeout(1100);
  s=await state(p);
  ok(s.reveal&&s.on&&s.btn==='Continue','with reduced motion it fades in and finishes by itself');
  await p.close();

  // 6. every screen shape: the card and its button stay on screen and nothing spills sideways
  for(const [w,h] of [[412,860],[915,356],[832,694],[393,659],[852,342]]){
    p=await page(w,h,{hasTouch:true});
    await p.evaluate(()=>{const T=__t; T.newRun('lamplighter'); T.beginFloor(null); T.unlockDeed('bellringer'); T.victory();});
    await p.waitForTimeout(300);
    const g=await p.evaluate(()=>{const a=document.querySelector('#mActions button.call').getBoundingClientRect(), r=document.getElementById('urvBox').getBoundingClientRect(), bx=document.querySelector('#modal .box');
      return {btnBottom:a.bottom,btnTop:a.top,boxTop:r.top,right:r.right,over:document.documentElement.scrollWidth>innerWidth+1,scroll:bx.scrollHeight-bx.clientHeight};});
    ok(g.btnBottom<=h&&g.btnTop>=0&&g.boxTop>=0&&g.right<=w&&!g.over,w+'x'+h+': the card and its button are on screen (button '+Math.round(g.btnTop)+'-'+Math.round(g.btnBottom)+')');
    await p.screenshot({path:out+'/reveal-'+w+'x'+h+'.png'});
    await p.close();
  }

  await b.close();
  process.exit(fails?1:0);
})();
