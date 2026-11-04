// The descent's pixel UI (tools/ui-art.py, art/ui/): the HUD's icons and what they do, the landing's door pictures, the toll gauge.
// None of it changes a rule: every check here is about what is shown, and that it shows nothing it should not.
const {chromium}=require('playwright');
(async()=>{
  const b=await chromium.launch(); let fails=0; const fail=m=>{console.log('FAIL '+m); fails++;};
  const ok=(c,m,d)=>{if(!c)fail(m+(d!==undefined?' '+JSON.stringify(d):''));};
  const p=await b.newPage({viewport:{width:412,height:860},hasTouch:true}); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.goto('file://'+process.argv[2]); await p.waitForTimeout(300);

  // A: every icon the game asks for has its art (a class with a background), and the frame's pieces are there
  const art=await p.evaluate(()=>{
    const has=k=>{const i=document.createElement('i'); i.className='ui-ic ui-ic-'+k; document.body.appendChild(i);
      const cs=getComputedStyle(i), r=/^url\(/.test(cs.backgroundImage)&&+cs.getPropertyValue('--uf')>=1; i.remove(); return r;};
    const T=__t, want=['oil','ess','mad0','mad1','mad2','mad3','ward','rite','relic','binding','patron','vial','chalice','satchel','bonebag','skull',
      'trial','descent','omen','die1','die2','die3','die4','die5','die6'].concat(['merchant','shrine','event','rest','reliquary','bones','deep','cage']);
    const root=getComputedStyle(document.documentElement);
    return {missing:want.filter(k=>!has(k)),pieces:['--ui-frame','--ui-frame-low','--ui-card','--ui-tube','--ui-badge','--ui-plaque'].filter(v=>!/^\s*url\(/.test(root.getPropertyValue(v)))};
  });
  ok(!art.missing.length,'every icon has its art',art.missing);
  ok(!art.pieces.length,'every frame piece is defined',art.pieces);

  // B: the HUD. The madness eye opens a tier at a time; the lamp gutters at 6 oil or less
  const hud=await p.evaluate(()=>{
    const T=__t; T.newRun(); T.beginFloor(null); T.setP(true); T.forceUI();
    const o={eye:[]}; const t=T.tiers();
    for(const m of [0,t[0],t[1],t[2]]){T.run.fume={floor:T.run.floor,n:m}; T.forceUI(); o.eye.push([T.madTier(),document.getElementById('madIc').className]);}
    T.run.fume=null; T.run.oil=6; T.forceUI(); o.low=document.getElementById('oilIc').parentElement.classList.contains('is-low');
    T.run.oil=7; T.forceUI(); o.high=document.getElementById('oilIc').parentElement.classList.contains('is-low');
    return o;});
  ok(hud.eye.every(([t,c])=>c.split(' ').includes('ui-ic-mad'+Math.min(3,t)))&&hud.eye.map(x=>x[0]).join()==='0,1,2,3','the madness eye follows the tier',hud.eye);
  ok(hud.low&&!hud.high,'the lamp icon gutters at 6 oil, not at 7',hud);

  // C: a count that moves floats by how much, and the float goes; a new floor or a new run never floats what it set
  const fl=await p.evaluate(async()=>{
    const T=__t, n=()=>[...document.querySelectorAll('.hud-float')].map(x=>x.textContent);
    document.querySelectorAll('.hud-float').forEach(x=>x.remove());
    T.newRun(); T.beginFloor(null); T.forceUI(); const o={start:n()};
    T.run.ess+=35; T.forceUI(); o.gain=n();
    T.run.oil-=3; T.forceUI(); o.hit=n();
    await new Promise(r=>setTimeout(r,1150)); o.gone=n();
    T.run.ess+=500; T.run.floor++; T.beginFloor(null); T.forceUI(); o.floor=n();
    T.newRun(); T.beginFloor(null); T.forceUI(); o.run=n();
    return o;});
  ok(!fl.start.length,'a new floor starts without a float',fl);
  ok(fl.gain.includes('+35'),'gaining essence floats +35',fl);
  ok(fl.hit.includes('−3'),'losing oil floats −3',fl);
  ok(!fl.gone.length,'floats are gone after a second',fl);
  ok(!fl.floor.length&&!fl.run.length,'a new floor or a new run never floats what it set',fl);

  // D: the landing's doors: each card shows its room's picture, and a small one for each Trial, descent and omen on it
  const doors=await p.evaluate(()=>{
    const T=__t; T.newRun(); T.run.floor=1; T.beginFloor(null); T.setP(true); T.run.ess=200; T.F.phase='draft';
    const out=[];
    for(let k=0;k<12;k++){
      T.F.draft={step:'fork',salvage:40,healed:0,opts:[],relics:0}; T.toFork(T.F.draft);
      const cards=[...document.querySelectorAll('#mChoices .choice')];
      T.F.draft.doors.forEach((d,i)=>{const c=cards[i], ics=c?[...c.querySelectorAll('.ch-ics .ui-ic')].map(x=>[...x.classList].find(y=>y.startsWith('ui-ic-'))):[];
        out.push({room:d.room,want:['ui-ic-'+d.room].concat(d.trial?['ui-ic-trial']:[],d.descent?['ui-ic-descent']:[],d.omen?['ui-ic-omen']:[]),ics,text:!!c&&c.querySelector('.ch-ics').textContent===''});});
      T.newRun(); T.run.floor=1; T.beginFloor(null); T.setP(true); T.run.ess=200; T.F.phase='draft';
    }
    return out;});
  const bad=doors.filter(d=>d.ics.join()!==d.want.join()||!d.text);
  ok(doors.length>=30&&!bad.length,'every door shows its room, and its Trial, descent and omen, as pictures with no text',bad.slice(0,3));

  // E: the toll gauge: safe, kept and burned add up to what you hold, as the stair counts it (tollKeep)
  const toll=await p.evaluate(()=>{
    const T=__t, o=[];
    for(const [ess,salv] of [[245,50],[90,120],[1,0],[600,0]]){
      T.run.ess=ess; T.F.draft={step:'room',salvage:salv,healed:0,opts:[],relics:0}; T.F.draft.room=T.makeRoom('merchant'); T.showLanding();
      const w=c=>parseFloat((document.querySelector('#mBody .toll-'+c)||{style:{width:'0'}}).style.width)||0;
      o.push({ess,salv,safe:w('safe'),keep:w('keep'),burn:w('burn'),kept:T.tollKeep(ess,salv)});
    }
    T.run.ess=0; T.showLanding(); o.push({none:!document.querySelector('#mBody .toll-g')});
    return o;});
  for(const t of toll.slice(0,4)){
    const keptPct=(t.safe+t.keep)/100*t.ess;
    ok(Math.abs(t.safe+t.keep+t.burn-100)<.05&&Math.abs(keptPct-t.kept)<.05,'the gauge shows what the stair keeps of '+t.ess+' with '+t.salv+' salvage',t);
  }
  ok(toll[4].none,'with no essence there is no gauge',toll[4]);

  // F: Reduce Motion: no floats, and every icon holds still on its first frame
  const q=await b.newPage({viewport:{width:412,height:860}}); await q.emulateMedia({reducedMotion:'reduce'});
  await q.goto('file://'+process.argv[2]); await q.waitForTimeout(300);
  const rm=await q.evaluate(()=>{const T=__t; T.newRun(); T.beginFloor(null); T.forceUI(); T.run.ess+=40; T.forceUI();
    return {floats:document.querySelectorAll('.hud-float').length,anim:[...document.querySelectorAll('#hud .ui-ic')].map(x=>getComputedStyle(x).animationName)};});
  ok(!rm.floats&&rm.anim.every(a=>a==='none'),'Reduce Motion: no floats, no moving icons',rm);

  // G: the HUD keeps its three counts apart, and none of it reaches the board (rule 1), folded and unfolded
  for(const [w,h] of [[412,860],[832,694],[915,356],[393,659]]){
    await p.setViewportSize({width:w,height:h}); await p.waitForTimeout(200);
    const lay=await p.evaluate(()=>{const T=__t; T.closeModal(); T.newRun(); T.beginFloor(null); T.forceUI();
      const q=e=>{const r=e.getBoundingClientRect(); return [r.left,r.top,r.right,r.bottom];};
      const st=[...document.querySelectorAll('#hud .stat')].map(q), ics=[...document.querySelectorAll('#hud .hud-ic')].map(q), board=q(document.getElementById('board'));
      const over=(a,c)=>a[2]>c[0]+.5&&a[0]<c[2]-.5&&a[3]>c[1]+.5&&a[1]<c[3]-.5;
      return {apart:st.every((a,i)=>st.every((c,j)=>i===j||!over(a,c))),inside:ics.every((r,i)=>r[0]>=st[i][0]-.5&&r[2]<=st[i][2]+.5),clear:ics.every(r=>!over(r,board))};});
    ok(lay.apart&&lay.inside&&lay.clear,'at '+w+'×'+h+' the counts stay apart, each icon in its own, none over the board',lay);
  }

  ok(!errs.length,'no page errors',errs);
  await b.close();
  if(fails)process.exitCode=1; else console.log('ui-art: all checks passed');
})();
