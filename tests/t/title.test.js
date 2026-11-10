// The title (10 Nov 2026): it opens dark and one tap strikes the light; the scene fills the screen at a whole number of pixels to an
// art pixel; the menu says what it knows (the run you left, what Saltmouth holds, the Grimoire, the embers); on the Fold's shapes
// and a small phone every button is a thumb inside the safe area; a tap on the scene never presses a button, and the 7-tap
// developer trigger still works.
const {chromium}=require('playwright');
const fails=[]; const ok=(c,m,d)=>{if(!c)fails.push(m+(d!==undefined?' '+JSON.stringify(d):''));};
(async()=>{
  const b=await chromium.launch();
  for(const [nm,w,h] of [['fold-closed',412,860],['fold-open',832,694],['fold-closed-land',915,356],['android-small',360,560]]){
    const ctx=await b.newContext({viewport:{width:w,height:h},hasTouch:true}); const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
    await p.goto('file://'+process.env.LL_RAW); await p.waitForTimeout(500);
    const dark=await p.evaluate(()=>({strike:!document.querySelector('#titleStrike').hidden,menu:!document.querySelector('#title .title-inner').hidden,lit:false}));
    ok(dark.strike&&!dark.menu,nm+': the title opens dark, the menu not yet there',dark);
    await p.tap('#titleStrike'); await p.waitForTimeout(1700);
    const r=await p.evaluate(()=>{
      const q=x=>{const r=x.getBoundingClientRect(); return [r.left,r.top,r.right,r.bottom].map(Math.round);};
      const cv=document.querySelector('#titleCv'), cr=cv.getBoundingClientRect(), o={};
      o.cover=cr.left<=0&&cr.top<=0&&cr.right>=innerWidth&&cr.bottom>=innerHeight; o.k=cr.width/cv.width; o.whole=Math.abs(o.k-Math.round(o.k))<.02||Math.abs(cr.width/Math.ceil(innerWidth/Math.round(o.k))-Math.round(o.k))<.05;
      o.strike=document.querySelector('#titleStrike').hidden; o.menu=!document.querySelector('#title .title-inner').hidden;
      const ids=['descendBtn','townBtn','bookTitleBtn','hallBtn','rulesBtn','settingsBtn']; o.btns={};
      for(const id of ids){const e=document.getElementById(id); e.scrollIntoView({block:'nearest'}); const r=q(e); o.btns[id]={r,thumb:r[3]-r[1]>=40&&r[2]-r[0]>=44,inside:r[0]>=0&&r[2]<=innerWidth+1&&r[1]>=0&&r[3]<=innerHeight+1};}
      o.subs={desc:document.querySelector('#descSub').textContent,town:document.querySelector('#townSub').textContent,book:document.querySelector('#bookSub').textContent,hall:document.querySelector('#hallSub').textContent};
      o.sw=document.documentElement.scrollWidth<=innerWidth+1;
      return o;});
    ok(r.cover,nm+': the scene covers the screen'); ok(r.whole,nm+': a whole number of pixels to an art pixel',r.k);
    ok(r.strike&&r.menu,nm+': one tap strikes the light and the menu rises');
    for(const id in r.btns)ok(r.btns[id].thumb&&r.btns[id].inside,nm+': '+id+' is a thumb, on the screen',r.btns[id]);
    ok(r.subs.desc==='Five floors down'&&r.subs.town==='The town above the stair'&&/^0 of \d+ found$/.test(r.subs.book)&&r.subs.hall==='0 embers',nm+': with nothing saved the menu says so',r.subs);
    ok(r.sw,nm+': nothing wider than the screen');
    if(nm==='fold-closed'){
      /* taps on the scene: the lamp, then the dark. Nothing opens, nothing throws */
      await p.mouse.click(206,395); await p.waitForTimeout(300); await p.mouse.click(40,300); await p.waitForTimeout(600);
      const after=await p.evaluate(()=>({modal:document.querySelector('#modal').hidden,title:!document.querySelector('#title').hidden}));
      ok(after.modal&&after.title,'a tap on the scene opens nothing',after);
      /* a saved run and a stocked town show on the menu */
      const subs=await p.evaluate(()=>{
        localStorage.setItem('ll-town',JSON.stringify({v:2,res:{timber:12,iron:1,tallow:0,curios:1}}));
        localStorage.setItem('ll-meta',JSON.stringify(Object.assign(JSON.parse(localStorage.getItem('ll-meta')||'{}'),{embers:37})));
        return true;});
      await p.reload(); await p.waitForTimeout(500); await p.tap('#titleStrike'); await p.waitForTimeout(300);
      const s2=await p.evaluate(()=>({town:document.querySelector('#townSub').textContent,hall:document.querySelector('#hallSub').textContent}));
      ok(s2.town==='12 timber · 1 iron · 1 curio'&&s2.hall==='37 embers','the menu reads the town and the embers',s2);
      /* the 7-tap developer trigger on the heading */
      for(let i=0;i<7;i++){await p.tap('#title h1'); await p.waitForTimeout(40);}
      await p.waitForTimeout(300);
      const dev=await p.evaluate(()=>!document.querySelector('#modal').hidden||!document.querySelector('#bonesBtn').hidden||!!localStorage.getItem('ll-dev'));
      ok(dev,'seven taps on the heading still reach developer mode');
    }
    ok(errs.length===0,nm+': no page errors',errs);
    await p.screenshot({path:(process.argv[3]||'.')+'/title-'+nm+'.png'});
    await ctx.close();
  }
  for(const f of fails)console.log('FAIL '+f);
  if(fails.length)process.exitCode=1; else console.log('title: all ok');
  await b.close();
})();
