// The Roster (#36): the kit picker is five painted characters. Locked ones are shapes in the dark with their deed or
// Ember Hall cost; a tap chooses, a second tap (or Descend) goes down; portraits keep their size while they paint (rule 2);
// every kind of horror bound adds its eyes to the Nameless's hood for good, and developer mode never records it (rule 24).
const {chromium}=require('playwright');
const file='file://'+process.argv[2], out=process.argv[3];
(async()=>{
  const b=await chromium.launch(); let fails=0;
  const fail=m=>{console.log('FAIL '+m); fails++;};
  const ok=(c,m)=>{if(!c)fail(m); else console.log('OK '+m);};
  const page=async(w,h)=>{const p=await b.newPage({viewport:{width:w,height:h},hasTouch:true});
    p.on('pageerror',e=>fail('page error: '+e.message)); p.on('console',m=>{if(m.type()==='error'&&!m.text().includes('ERR_'))fail('console: '+m.text());});
    await p.goto(file); await p.waitForTimeout(300); return p;};
  const roster=p=>p.evaluate(()=>{const cards=[...document.querySelectorAll('#rostRow .rost-card')];
    return {title:document.querySelector('#mTitle').textContent,n:cards.length,locked:cards.filter(c=>c.classList.contains('off')).map(c=>c.dataset.kit),
      on:(cards.find(c=>c.classList.contains('on'))||{}).dataset?.kit,info:document.querySelector('#rostInfo').innerText,
      descend:[...document.querySelectorAll('#mActions button')].map(x=>x.textContent).find(t=>t.startsWith('Descend'))||'',
      rects:cards.map(c=>{const r=c.getBoundingClientRect(); return [Math.round(r.width),Math.round(r.height)];}),
      painted:cards.map(c=>{const cv=c.querySelector('canvas'), d=cv.getContext('2d').getImageData(0,0,cv.width,cv.height).data; let lit=0; for(let i=0;i<d.length;i+=40)if(d[i]+d[i+1]+d[i+2]>60)lit++; return lit;}),
      overflowX:document.documentElement.scrollWidth>innerWidth+1,
      run:!!__t.run&&document.querySelector('#modal').hidden};});

  // 1. a fresh save on a folded Fold: Fenn is open and chosen, the other four are dark with their deed or cost
  let p=await page(412,860);
  await p.tap('#descendBtn'); await p.waitForTimeout(150);
  const early=await p.evaluate(()=>[...document.querySelectorAll('#rostRow .rost-card')].map(c=>{const r=c.getBoundingClientRect(); return [Math.round(r.width),Math.round(r.height)];}));
  await p.waitForTimeout(500);
  let r=await roster(p);
  ok(r.title==='Who carries the lamp?'&&r.n===5,'the roster shows five characters '+JSON.stringify([r.title,r.n]));
  ok(JSON.stringify(r.locked)===JSON.stringify(['whaler','occultist','galvanist','bellringer']),'only the Lamplighter is open on a fresh save '+r.locked);
  ok(r.on==='lamplighter'&&r.descend==='Descend as Ambrose Fenn','Ambrose Fenn is chosen, and Descend names him '+r.descend);
  ok(r.painted.every(n=>n>3),'every portrait is painted, locked ones too (their light shows) '+r.painted);
  ok(JSON.stringify(early)===JSON.stringify(r.rects),'cards keep their size while portraits paint (rule 2) '+JSON.stringify([early[0],r.rects[0]]));
  ok(!r.overflowX,'nothing pushes the page sideways');
  ok(r.info.includes('He kept the harbour lamps'),'the chosen character says who they were');
  // a locked card tells you how to earn it, and starts nothing
  await p.evaluate(()=>document.querySelector('#rostRow [data-kit="galvanist"]').click()); await p.waitForTimeout(150);
  r=await roster(p);
  ok(r.info.includes('The Ember Hall · 70 embers')&&!r.run&&r.on==='lamplighter','a locked card shows its Ember Hall cost and starts nothing '+r.info.slice(0,80));
  await p.evaluate(()=>document.querySelector('#rostRow [data-kit="whaler"]').click()); await p.waitForTimeout(150);
  r=await roster(p);
  ok(r.info.includes('Deed: Kill a Trench Behemoth'),'the Whaler shows its deed');
  await p.screenshot({path:out+'/roster-fold-fresh.png'});

  // 2. one tap chooses, the second goes down
  await p.evaluate(()=>{localStorage.setItem('ll-meta',JSON.stringify({embers:0,unlocked:['kit_whaler'],depth:0,deeds:2}));}); await p.reload(); await p.waitForTimeout(300);
  await p.tap('#descendBtn'); await p.waitForTimeout(300);
  await p.evaluate(()=>document.querySelector('#rostRow [data-kit="whaler"]').click()); await p.waitForTimeout(150);
  r=await roster(p);
  ok(r.on==='whaler'&&!r.run&&r.descend==='Descend as Jonah Tolland'&&r.info.includes('Patience'),'one tap on Jonah Tolland chooses him and starts nothing '+r.descend);
  await p.evaluate(()=>document.querySelector('#rostRow [data-kit="whaler"]').click()); await p.waitForTimeout(400);
  ok(await p.evaluate(()=>__t.run&&__t.run.kit==='whaler'&&document.querySelector('#modal').hidden),'a second tap descends as the Whaler');
  // and she is chosen already the next time
  await p.evaluate(()=>{localStorage.removeItem('ll-save-v2');}); await p.reload(); await p.waitForTimeout(300);
  await p.tap('#descendBtn'); await p.waitForTimeout(300);
  r=await roster(p); ok(r.on==='whaler','the last kit carried is chosen when the roster opens again');
  await p.close();

  // 3. the hood fills with what you bind, for good; an old codex without the list still loads
  p=await page(412,860);
  const h=await p.evaluate(()=>{const T=__t, o={};
    localStorage.setItem('ll-codex',JSON.stringify({foes:['crawler'],relics:[]}));
    o.empty=T.codex().bound.size===0||null;
    return o;});
  await p.reload(); await p.waitForTimeout(300);
  const h2=await p.evaluate(()=>{const T=__t, o={};
    o.loads=T.codex().bound.size===0; o.eyes0=T.hoodEyes().length;
    const k0=T.portraitCanvas('occultist',false,0,0);
    T.newRun('lamplighter',0);
    T.bindSoul({type:'watcher',x:3,y:3,t:5}); T.bindSoul({type:'gnasher',x:3,y:3,t:5});
    o.eyes=T.hoodEyes(); o.saved=JSON.parse(localStorage.getItem('ll-codex')).bound; o.newEye=T.run.newEye;
    o.repaint=T.portraitCanvas('occultist',false,0,0)!==k0;
    o.tip=!!T.TIPS.hoodeye&&T.TIPS.hoodeye.text.length>20;
    return o;});
  ok(h2.loads&&h2.eyes0===0,'an old codex without the list loads, with an empty hood');
  ok(JSON.stringify(h2.eyes)==='["watcher","gnasher"]'&&JSON.stringify(h2.saved)==='["watcher","gnasher"]','bound kinds are kept across runs, deepest first in the hood '+JSON.stringify(h2));
  ok(h2.newEye==='gnasher'&&h2.repaint&&h2.tip,'the new eye repaints the portrait and has a tip to teach it');
  await p.close();

  // 4. developer mode fills the hood and opens every card, and records nothing (rule 24)
  p=await page(412,860);
  await p.evaluate(()=>{localStorage.setItem('ll-codex',JSON.stringify({foes:[],relics:[],offs:[],bound:[]})); localStorage.setItem('ll-dev','true');}); await p.reload(); await p.waitForTimeout(300);
  const d=await p.evaluate(()=>{const T=__t; T.newRun('lamplighter',0); T.bindSoul({type:'shrieker',x:3,y:3,t:5});
    return {eyes:T.hoodEyes().length,saved:JSON.parse(localStorage.getItem('ll-codex')).bound,locked:Object.keys(T.KITS).filter(k=>T.kitLocked(k))};});
  ok(d.eyes===6&&d.saved.length===0&&d.locked.length===0,'dev mode shows six eyes and every kit, and saves no bind '+JSON.stringify(d));
  await p.close();

  // 5. the Grimoire's Kits page shows the portraits; every layout fits
  for(const [w,hh,name] of [[412,860,'fold'],[915,356,'fold-side'],[832,694,'unfolded'],[393,659,'iphone'],[852,342,'iphone-side']]){
    p=await page(w,hh);
    await p.tap('#descendBtn'); await p.waitForTimeout(450);
    r=await roster(p);
    const fit=await p.evaluate(()=>{const box=document.querySelector('#modal .box').getBoundingClientRect(), row=document.querySelector('#rostRow').getBoundingClientRect(), c=document.querySelector('#rostRow .rost-card').getBoundingClientRect();
      return {inBox:row.left>=box.left-1&&row.right<=box.right+1,cardTop:c.top>=0&&c.bottom<=innerHeight,cardH:Math.round(c.height)};});
    ok(!r.overflowX&&fit.inBox&&fit.cardTop,name+': the roster fits, and the first card is on screen '+JSON.stringify(fit));
    await p.screenshot({path:out+'/roster-'+name+'.png'});
    await p.close();
  }
  p=await page(412,860);
  const g=await p.evaluate(()=>{__t.openBook('title','kits'); return [...document.querySelectorAll('#mChoices canvas[data-port]')].map(c=>c.dataset.port);});
  ok(g.length===5&&g[0]==='lamplighter:0'&&g[1]==='whaler:1','the Grimoire Kits page shows each portrait, locked ones dark '+g);
  await p.close();

  await b.close();
  if(fails)process.exitCode=1;
})();
