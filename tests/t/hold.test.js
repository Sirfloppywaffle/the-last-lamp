// Hold the dark (the hourglass): everything on the stair stops and the board still takes your hands. A ward goes down while it is
// held, nothing moves, it does not come back whole, a rite waits and a soul cannot be bound; let go and the wave goes on.
// And reading: a hint's clock does not run while a tip is up, and a long tip leads with its first sentence behind More.
const {chromium}=require('playwright');
const fails=[]; const ok=(c,m,d)=>{if(!c)fails.push(m+(d!==undefined?' '+JSON.stringify(d):''));};
(async()=>{
  const b=await chromium.launch(); const p=await b.newPage({viewport:{width:412,height:860},hasTouch:true});
  await p.goto('file://'+process.argv[2]); await p.waitForTimeout(300);
  const tile=await p.evaluate(()=>{const T=__t;
    T.newRun('lamplighter',0,{seed:5}); T.run.floor=0; T.beginFloor(null); T.run.ess=500; T.run.oil=T.run.oilMax=999; T.setP(false);
    T.F.phase='wave'; T.F.wave=1; T.F.queue=[{t:1e9,type:'crawler',gate:0}];
    const e=T.spawnFoe('crawler',0,2); e.hp=e.max=1e6; window.__e=e;
    for(let i=0;i<10;i++)T.update(1/30);
    const it={kind:'ward',type:'harpoon'}; let best=null;
    for(let r=0;r<T.ROWS&&!best;r++)for(let c=0;c<T.COLS&&!best;c++)if(!T.placeProblem(it,c,r))best=[c,r];
    const cv=document.getElementById('board'), rc=cv.getBoundingClientRect();
    return {c:best[0],r:best[1],x:rc.left+(best[0]+.5)/T.COLS*rc.width,y:rc.top+(best[1]+.5)/T.ROWS*rc.height};});
  // a full pause takes no taps on the board
  const r0=await p.evaluate(({x,y})=>{const T=__t; T.setSel({kind:'ward',type:'harpoon'}); T.setP(true);
    document.getElementById('board').dispatchEvent(new PointerEvent('pointerdown',{clientX:x,clientY:y,bubbles:true}));
    const n=T.F.towers.length; T.setP(false); return n;},tile);
  ok(r0===0,'paused from the menu, the board takes nothing',r0);
  await p.click('#holdBtn'); await p.waitForTimeout(150);
  const r1=await p.evaluate(({x,y,c,r})=>{const T=__t, out={held:T.held, pill:!document.getElementById('heldPill').hidden, label:document.getElementById('holdBtn').getAttribute('aria-label')};
    const d0=window.__e.d, ess0=T.run.ess; T.setSel({kind:'ward',type:'harpoon'});
    document.getElementById('board').dispatchEvent(new PointerEvent('pointerdown',{clientX:x,clientY:y,bubbles:true}));
    const t=T.F.towers.find(t=>t.c===c&&t.r===r); out.placed=!!t; out.paid=ess0-T.run.ess; out.back=t?T.refundOf(t):-1; out.invested=t?t.invested:0;
    out.rite=T.castRite(T.run.rites[0])===undefined; out.cool=T.F.cd?JSON.stringify(T.F.cd):'';
    return new Promise(res=>setTimeout(()=>{out.moved=window.__e.d-d0; out.stillHeld=T.held; res(out);},500));},tile);
  ok(r1.held&&r1.pill&&/Let the dark move/.test(r1.label),'the hourglass holds the dark and says so',r1);
  ok(r1.placed&&r1.paid>0,'a ward goes down while the dark is held',r1);
  ok(r1.back<r1.invested,'and does not come back whole',[r1.back,r1.invested]);
  ok(r1.moved===0&&r1.stillHeld,'nothing on the stair moves while it is held',r1.moved);
  await p.click('#holdBtn'); await p.waitForTimeout(500);
  const r2=await p.evaluate(()=>({held:__t.held,d:window.__e.d,label:document.getElementById('holdBtn').getAttribute('aria-label'),pill:document.getElementById('heldPill').hidden}));
  ok(!r2.held&&r2.pill&&/Hold the dark and build/.test(r2.label),'let go, the dark moves again',r2);
  // reading: a hint waits for a tip; a long tip leads with its opening
  const r3=await p.evaluate(()=>{const T=__t, out={}; const h=document.getElementById('hint');
    T.tipHolds(true); T.hintNow('The wave breaks.',60);
    return new Promise(res=>setTimeout(()=>{out.kept=h.classList.contains('show'); T.tipHolds(false);
      setTimeout(()=>{out.afterShort=h.classList.contains('show'); setTimeout(()=>{out.gone=!h.classList.contains('show');
        const long=T.TIPSK.map(k=>{try{return T.tipText(k)||'';}catch(e){return '';}}).filter(t=>t.length>200); out.n=long.length;
        out.leads=long.map(t=>T.tipLead(t)); out.bad=long.filter((t,i)=>{const l=out.leads[i]; return !(l===t||(t.startsWith(l)&&/[.!?]['"’”)]*$/.test(l)));}).length; out.cut=long.filter((t,i)=>out.leads[i].length<t.length).length;
        out.maxLead=Math.max(...out.leads.map(l=>l.length)); out.short=T.tipLead('Tap the lamp.')==='Tap the lamp.'; delete out.leads; res(out);},2900);},300);},400));});
  ok(r3.kept,'a hint stays up while a tip is being read');
  ok(r3.afterShort&&r3.gone,'and gets its time once the tip is put away, then goes',r3);
  ok(r3.n>10&&r3.bad===0&&r3.cut>r3.n*.8&&r3.short,'every long tip leads with whole sentences from its start; a short one is left alone',r3);
  // in the bubble: More opens the rest
  const r4=await p.evaluate(()=>{const T=__t; T.tutSet({walk:'done',seen:[],off:false}); const k=T.TIPSK.find(k=>{try{return (T.tipText(k)||'').length>260&&!/^deed_/.test(k);}catch(e){return false;}}); const full=T.tipText(k);
    T.coachRun('tip',k,[{title:'t',text:full}]); const lead=document.getElementById('coachText').textContent, more=document.querySelector('#coachActs [data-coach="more"]');
    const o={lead:lead.length,full:full.length,more:!!more,up:T.tipUp}; if(more)more.click(); o.opened=document.getElementById('coachText').textContent===full&&!document.querySelector('#coachActs [data-coach="more"]');
    document.querySelector('#coachActs [data-coach="next"]').click(); o.down=!T.tipUp; return o;});
  ok(r4.more&&r4.lead<r4.full&&r4.opened,'a long tip shows its opening, and More shows the rest',r4);
  ok(r4.up&&r4.down,'a tip holds the hints while it is up and lets them go when it is put away',r4);
  console.log(JSON.stringify({r1,r3,r4}));
  for(const f of fails)console.log('FAIL '+f);
  if(fails.length)process.exitCode=1; else console.log('hold: all ok');
  await b.close();
})();
