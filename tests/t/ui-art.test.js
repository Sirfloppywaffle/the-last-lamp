// The descent's pixel UI (tools/ui-art.py, art/ui/): the HUD's icons and what they do, the landing's door pictures, the toll gauge,
// the build tray's slots and the rites' sigils.
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
    const T=__t, want=Object.keys(T.RITES).map(k=>'rt-'+k).concat(['oil','ess','mad0','mad1','mad2','mad3','ward','rite','relic','binding','patron','vial','chalice','satchel','bonebag','skull',
      'trial','descent','omen','die1','die2','die3','die4','die5','die6'].concat(['merchant','shrine','event','rest','reliquary','bones','deep','cage']));
    const root=getComputedStyle(document.documentElement);
    return {missing:want.filter(k=>!has(k)),pieces:['--ui-frame','--ui-frame-low','--ui-card','--ui-tube','--ui-badge','--ui-plaque','--ui-slot','--ui-slot-on','--ui-slot-h','--ui-tablet','--ui-tablet-on'].filter(v=>!/^\s*url\(/.test(root.getPropertyValue(v)))};
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

  // H: the rites. Each wears its own sigil, which moves only while the rite is ready; it flashes the moment it comes ready, never
  // when it is first drawn; armed, the tablet's runes light
  const rite=await p.evaluate(async()=>{
    const T=__t; T.closeModal(); T.newRun('lamplighter'); T.beginFloor(null); T.setP(true); T.run.rites.push('flare'); T.forceUI();
    const bs=()=>[...document.querySelectorAll('#rites .rite')], fl=b=>b.getAnimations().filter(a=>!(a instanceof CSSAnimation)).length;
    const o={sig:bs().map(b=>[b.dataset.r,b.querySelector('.rite-ic').className]), first:bs().map(fl), span:bs().every(b=>b.querySelector('span')===b.children[2])};
    T.F.cd.pillar=5; T.forceUI(); const pb=document.querySelector('#rites [data-r="pillar"]');
    o.cool={dis:pb.disabled, play:getComputedStyle(pb.querySelector('.rite-ic')).animationPlayState};
    T.F.cd.pillar=0; T.forceUI(); o.ready={play:getComputedStyle(pb.querySelector('.rite-ic')).animationPlayState, flash:fl(pb), others:bs().filter(b=>b!==pb).map(fl)};
    pb.getAnimations().forEach(a=>{if(!(a instanceof CSSAnimation))a.finish();});
    T.setMode('pillar'); T.forceUI(); o.armed=pb.classList.contains('armed')&&getComputedStyle(pb).borderImageSource!==getComputedStyle(bs().find(b=>b!==pb)).borderImageSource;
    T.setMode(null); T.forceUI(); o.cancel=fl(pb);
    /* a rite charge arms a cooling rite at once (its F.cd goes to 0 while you aim): that is not the rite coming ready */
    T.run.charge={floor:T.run.floor,n:1}; T.F.phase='wave'; T.F.queue=[]; T.F.cd.pillar=12; T.forceUI(); pb.getAnimations().forEach(a=>{if(!(a instanceof CSSAnimation))a.finish();});
    T.setP(false); T.castRite('pillar'); T.setP(true); T.forceUI(); o.charged={mode:T.mode,cd:T.F.cd.pillar,flash:fl(pb)};
    /* land it with its old wait already run out: the cast sets the Pillar's wait and the charge gives back none, so it is ready,
       but that is the charge settling, not a cooldown ending */
    T.F.chg.left=0; pb.getAnimations().forEach(a=>{if(!(a instanceof CSSAnimation))a.finish();});
    T.setP(false); T.castPillar(T.F.lx,T.F.ly); T.update(.05); T.setP(true); T.forceUI(); o.landed={cd:T.F.cd.pillar, chg:!!T.F.chg, flash:fl(pb)};
    T.F.phase='build'; T.run.charge=null; T.F.cd.pillar=0; T.forceUI();
    /* a rite still cooling when the floor ends is ready on the next: that is the floor beginning, not the rite coming ready */
    T.F.cd.pillar=8; T.forceUI(); pb.getAnimations().forEach(a=>{if(!(a instanceof CSSAnimation))a.finish();}); T.beginFloor(null); T.setP(true); T.forceUI();
    const pb2=document.querySelector('#rites [data-r="pillar"]'); o.floor={same:pb2===pb, cd:T.F.cd.pillar||0, flash:fl(pb2)};
    o.rn=getComputedStyle(document.getElementById('cmdbar')).getPropertyValue('--rn').trim();
    /* Lite (slower phones) skips both flashes, as it skips the icons' motion */
    T.setLite(true); T.F.cd.pillar=4; T.run.ess=0; T.forceUI(); T.F.cd.pillar=0; T.run.ess=900; T.forceUI();
    o.lite=[...document.querySelectorAll('#cmdbar button')].reduce((n,b)=>n+b.getAnimations().filter(a=>!(a instanceof CSSAnimation)).length,0);
    T.setLite(false); T.forceUI();
    return o;});
  ok(rite.sig.every(([k,c])=>c.split(' ').includes('ui-ic-rt-'+k))&&rite.sig.length===3&&rite.span,'every rite wears its own sigil, and its status is still its first span',rite.sig);
  ok(rite.first.every(n=>n===0),'a rite drawn ready does not flash',rite.first);
  ok(rite.cool.dis&&rite.cool.play==='paused'&&rite.ready.play==='running','a cooling rite’s sigil holds still, a ready one moves',rite);
  ok(rite.ready.flash>=1&&rite.ready.others.every(n=>n===0),'the rite that comes ready flashes, and only it',rite.ready);
  ok(rite.armed,'an armed rite lights its runes');
  ok(rite.cancel===0,'putting down a target you were choosing does not flash the rite',rite.cancel);
  ok(rite.floor.same&&rite.floor.cd===0&&rite.floor.flash===0,'a rite cooling as a floor ends does not flash as the next begins',rite.floor);
  ok(rite.landed.cd===0&&!rite.landed.chg&&rite.landed.flash===0,'a charged cast that lands does not flash its rite',rite.landed);
  ok(rite.charged.mode==='pillar'&&rite.charged.cd===0&&rite.charged.flash===0,'a charge arming a cooling rite does not flash it',rite.charged);
  ok(rite.lite===0,'Lite: no tray or rite flashes',rite.lite);
  ok(rite.rn==='3','the command bar knows how many rites it holds, to give the tray back their sigils’ width',rite.rn);

  // I: the build tray. A horror's count rides on its slot, a ward a Trial seals carries a lock, and a ward you can newly afford
  // flashes once (but never as a floor begins)
  const tray=await p.evaluate(()=>{
    const T=__t, o={};
    T.newRun('occultist'); T.beginFloor(null); T.setP(true); T.run.ess=0; T.run.roster.shrieker=2; T.forceUI();
    o.tags=[...document.querySelectorAll('#tray .titem.horror')].map(b=>{const i=T.trayItems()[+b.dataset.ix]; return [(b.querySelector('.tray-cnt')||{}).textContent,'×'+T.avail(i.type)];});
    o.noTag=[...document.querySelectorAll('#tray .titem:not(.horror) .tray-cnt')].length;
    o.start=[...document.querySelectorAll('#tray .titem')].filter(b=>b.getAnimations().some(a=>!(a instanceof CSSAnimation))).length;
    T.run.ess=40; T.forceUI();
    const items=T.trayItems(), fl=[...document.querySelectorAll('#tray .titem')].filter(b=>b.getAnimations().some(a=>!(a instanceof CSSAnimation))).map(b=>items[+b.dataset.ix]);
    o.flash=fl.map(i=>i.type); o.want=items.filter(i=>{const c=i.kind==='ward'?T.wardCost(i.type):i.kind==='horror'?T.horrorCost(i.type):0; return c>0&&c<=40&&(i.kind!=='horror'||T.avail(i.type)>0);}).map(i=>i.type);
    T.run.floor=1; T.run.trial='sealed'; T.beginFloor(null); T.run.ess=0; T.forceUI();
    o.sealed=[...document.querySelectorAll('#tray .titem')].map(b=>[b.classList.contains('is-barred'),!!b.querySelector('.tray-lock')]);
    /* Rationed: the sixth ward beside the path bars the rest. One you already could not afford is barred and still out of
       reach: it must not flash as if you could now afford it */
    T.newRun('lamplighter'); T.run.floor=1; T.run.trial='rationed'; T.beginFloor(null); T.setP(true); T.run.ess=9000; T.forceUI();
    const spot=w=>{for(let r=0;r<T.ROWS;r++)for(let c=0;c<T.COLS;c++)if(!T.placeProblem({kind:'ward',type:w},c,r))return [c,r]; return null;};
    const put=w=>{const t=spot(w); if(!t)return false; T.setSel({kind:'ward',type:w}); T.tryPlace(t[0],t[1]); T.setSel(null); return true;};
    while(T.rationN()<5&&put('harpoon'));
    T.run.ess=T.wardCost('harpoon'); T.forceUI();
    const dear=T.run.wards.filter(w=>T.wardCost(w)>T.run.ess&&!T.trialBarred({kind:'ward',type:w}));
    const t6=spot('harpoon'); T.setSel({kind:'ward',type:'harpoon'}); T.tryPlace(t6[0],t6[1]);
    const els=[...document.querySelectorAll('#tray .titem')], it2=T.trayItems();
    o.once={n:T.rationN(), dear, barred:dear.filter(w=>{const b=els.find(e=>it2[+e.dataset.ix].type===w); return b&&b.classList.contains('is-barred');}),
      flash:els.filter(e=>dear.includes(it2[+e.dataset.ix].type)&&e.getAnimations().some(x=>!(x instanceof CSSAnimation))).map(e=>it2[+e.dataset.ix].type)};
    T.setSel(null); T.run.trial=null;
    return o;});
  ok(tray.tags.length>=2&&tray.tags.every(([a,b])=>a===b)&&!tray.noTag,'each horror’s slot carries its count, and no ward’s does',tray);
  ok(!tray.start,'a floor’s first tray flashes nothing',tray.start);
  ok(tray.flash.length&&tray.flash.join()===tray.want.join(),'the slots you can newly afford flash, and only they',tray);
  ok(tray.sealed.some(([a])=>a)&&tray.sealed.every(([a,b])=>a===b),'a sealed ward wears the lock, and only a sealed one',tray.sealed);
  ok(tray.once.n===6&&tray.once.barred.length>0&&!tray.once.flash.length,'Rationed: a ward the sixth ward bars while you cannot afford it does not flash',tray.once);

  // F: Reduce Motion: no floats, and every icon holds still on its first frame
  const q=await b.newPage({viewport:{width:412,height:860}}); await q.emulateMedia({reducedMotion:'reduce'});
  await q.goto('file://'+process.argv[2]); await q.waitForTimeout(300);
  const rm=await q.evaluate(()=>{const T=__t; T.newRun(); T.beginFloor(null); T.forceUI(); T.run.ess+=40; T.forceUI();
      T.F.cd[T.run.rites[0]]=3; T.forceUI(); T.F.cd[T.run.rites[0]]=0; T.run.ess+=500; T.setSel({kind:'ward',type:T.run.wards[0]}); T.forceUI();
      const flashes=[...document.querySelectorAll('#cmdbar button')].reduce((n,b)=>n+b.getAnimations().length,0);
      return {floats:document.querySelectorAll('.hud-float').length,flashes,anim:[...document.querySelectorAll('#hud .ui-ic,#rites .ui-ic,#tray .titem')].map(x=>getComputedStyle(x).animationName)};});
  ok(!rm.floats&&!rm.flashes&&rm.anim.every(a=>a==='none'),'Reduce Motion: no floats, no flashes, no moving icons or slots',rm);

  // G: the HUD keeps its three counts apart, and none of it reaches the board (rule 1), folded and unfolded
  for(const [w,h] of [[412,860],[832,694],[915,356],[393,659]]){
    await p.setViewportSize({width:w,height:h}); await p.waitForTimeout(200);
    const lay=await p.evaluate(()=>{const T=__t; T.closeModal(); T.newRun(); T.beginFloor(null); T.forceUI(); document.getAnimations().forEach(a=>{if(a instanceof CSSAnimation)return; a.finish();});
      const q=e=>{const r=e.getBoundingClientRect(); return [r.left,r.top,r.right,r.bottom];};
      const st=[...document.querySelectorAll('#hud .stat')].map(q), ics=[...document.querySelectorAll('#hud .hud-ic')].map(q), board=q(document.getElementById('board'));
      const over=(a,c)=>a[2]>c[0]+.5&&a[0]<c[2]-.5&&a[3]>c[1]+.5&&a[1]<c[3]-.5;
      return {apart:st.every((a,i)=>st.every((c,j)=>i===j||!over(a,c))),inside:ics.every((r,i)=>r[0]>=st[i][0]-.5&&r[2]<=st[i][2]+.5),clear:ics.every(r=>!over(r,board))};});
    ok(lay.apart&&lay.inside&&lay.clear,'at '+w+'×'+h+' the counts stay apart, each icon in its own, none over the board',lay);
    /* the madness count is as wide as its longest tier: the pause button and the board never move as madness climbs */
    const still=await p.evaluate(()=>{const T=__t, t=T.tiers(), o=new Set();
      for(const m of [0,t[0],t[1],t[2]]){T.run.fume={floor:T.run.floor,n:m}; T.forceUI(); const a=document.getElementById('pauseBtn').getBoundingClientRect(), c=document.getElementById('board').getBoundingClientRect(); o.add([a.left,a.top,c.left,c.top,c.width].map(Math.round).join());}
      T.run.fume=null; return [...o];});
    ok(still.length===1,'at '+w+'×'+h+' nothing moves as madness climbs through its tiers',still);
  }

  ok(!errs.length,'no page errors',errs);
  await b.close();
  if(fails)process.exitCode=1; else console.log('ui-art: all checks passed');
})();
