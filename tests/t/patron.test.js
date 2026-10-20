// The Drowned Mother (#30): offerings, Attention, her water, and every offering's effect.
const {chromium}=require('playwright');
const fails=[]; const ok=(c,m,d)=>{if(!c)fails.push(m+(d!==undefined?' '+JSON.stringify(d):''));};
(async()=>{
  const b=await chromium.launch(); const p=await b.newPage({viewport:{width:412,height:860}});
  const errs=[]; p.on('pageerror',e=>errs.push(String(e)));
  await p.goto('file://'+process.argv[2]); await p.waitForTimeout(300);

  /* the offers: three at most, never more than one of the kit's own, and only what this run can use */
  const offers=await p.evaluate(()=>{const T=__t, out={};
    const sample=(k)=>{T.newRun(k,0); const s={sizes:new Set(),kitMax:0,keys:new Set()};
      for(let i=0;i<300;i++){const o=T.offerSet('mother'); s.sizes.add(o.length); s.kitMax=Math.max(s.kitMax,o.filter(x=>T.OFFERINGS[x].kit).length); o.forEach(x=>s.keys.add(x));}
      return {sizes:[...s.sizes],kitMax:s.kitMax,keys:[...s.keys].sort()};};
    out.lamp=sample('lamplighter'); out.whaler=sample('whaler'); out.occ=sample('occultist');
    /* all taken: she has nothing left */
    T.newRun('lamplighter',0); Object.keys(T.OFFERINGS).forEach(k=>T.run.offs=(T.run.offs||[]).concat(k)); out.empty=T.offerSet('mother');
    return out;});
  console.log(JSON.stringify(offers));
  ok(offers.lamp.sizes.length===1&&offers.lamp.sizes[0]===3,'every offer holds three',offers.lamp.sizes);
  ok(offers.lamp.kitMax===1&&offers.whaler.kitMax===1,'at most one kit offering per offer',[offers.lamp.kitMax,offers.whaler.kitMax]);
  ok(offers.lamp.keys.includes('still')&&offers.lamp.keys.includes('drowned')&&!offers.lamp.keys.includes('fat'),'the Lamplighter sees its own, not the Whaler’s',offers.lamp.keys);
  ok(offers.whaler.keys.includes('fat')&&offers.whaler.keys.includes('deep')&&!offers.whaler.keys.includes('still'),'the Whaler sees its own',offers.whaler.keys);
  ok(!offers.occ.keys.includes('brine')&&!offers.occ.keys.includes('hymn'),'Brine Pools needs salt and the Hymn a chime; the Occultist starts with neither',offers.occ.keys);
  ok(offers.empty===null,'nothing left to give: no offer',offers.empty);

  /* Attention: the first gift floods the floor at once; water sits on the path, never on the lamp; the current is 30% */
  const water=await p.evaluate(()=>{const T=__t, out={}; window.devNoDark=false;
    T.newRun('lamplighter',0); T.setP(false);
    out.before=T.F.water.size;
    T.takeOffer('milk'); out.att=T.attOf('mother'); out.tier=T.patTier('mother'); out.size=T.F.water.size;
    out.onPath=[...T.F.water.keys()].every(k=>T.F.pathTiles.has(k));
    out.onLamp=T.F.water.has(T.F.lampC+','+T.F.lampR);
    out.saved=JSON.parse(JSON.stringify(T.run.water));
    /* a creature in water against one on dry path, the same tick */
    const [g,d0]=T.run.water.str[0];
    const wet=T.spawnFoe('crawler',g,d0+.3), dry=T.spawnFoe('crawler',0,.3);
    out.wetIn=T.inWater(wet); out.dryIn=T.inWater(dry);
    const w0=wet.d, y0=dry.d; T.update(.05);
    out.ratio=+((wet.d-w0)/(dry.d-y0)).toFixed(2);
    T.F.foes.forEach(e=>e.dead=true); T.update(.01);
    /* Watched: the water rises a tile as each wave begins, up to the cap */
    T.addAtt('mother',2); out.tier3=T.patTier('mother');
    const n0=T.F.water.size; T.waterRise(); out.rose=T.F.water.size-n0;
    for(let i=0;i<30;i++)T.waterRise(); out.cap=T.F.water.size;
    /* Claimed: what walks in the water goes under, unless something unveils it */
    T.addAtt('mother',2); out.under=T.F.under;
    const [g2,a2]=T.run.water.str[0];
    const sub=T.spawnFoe('crawler',g2,a2+.3); T.update(.001);
    out.inW=T.inWater(sub); out.seen=T.canSee(sub);
    T.F.flareT=5; out.seenFlare=T.canSee(sub); T.F.flareT=0;
    sub.dead=true; T.update(.01);
    return out;});
  console.log(JSON.stringify(water));
  ok(water.before===0,'no water before she notices you',water.before);
  ok(water.att===1&&water.tier===1,'one gift, Attention 1: Noticed',[water.att,water.tier]);
  ok(water.size>=3&&water.size<=6,'the floor floods at once: two stretches of up to three tiles',water.size);
  ok(water.onPath&&!water.onLamp,'water stands only on the path, never on the lamp',water);
  ok(water.saved.floor===0&&water.saved.str.length===2,'the water is kept in the run',water.saved);
  ok(water.wetIn&&!water.dryIn,'inWater tells wet from dry',water);
  ok(Math.abs(water.ratio-1.3)<.05,'the current carries them 30% faster',water.ratio);
  ok(water.tier3===2&&water.rose===1,'Watched: the water rises one tile',[water.tier3,water.rose]);
  ok(water.cap===14,'the rising water stops at 14 tiles',water.cap);
  ok(water.under&&water.inW&&!water.seen&&water.seenFlare,'Claimed: unseen under water, found by a Flare',water);

  /* every rise adds a tile. Two stretches standing end to end used to swallow one (about 1 run in 25 of the check above) */
  const rise=await p.evaluate(()=>{const T=__t, out={}; window.devNoDark=false;
    const fresh=()=>{T.newRun('lamplighter',0); T.setP(false); T.takeOffer('milk'); T.addAtt('mother',2);};
    fresh(); T.run.water={floor:0,str:[[0,15,17],[0,12,14]]}; T.waterSync();
    out.steps=[]; for(let i=0;i<6;i++){const a=T.F.water.size; T.waterRise(); out.steps.push(T.F.water.size-a);}
    out.bad=0; for(let i=0;i<300;i++){fresh(); const a=T.F.water.size; T.waterRise(); if(T.F.water.size-a!==1)out.bad++;}
    return out;});
  ok(rise.steps.every(n=>n===1),'stretches end to end: every rise still floods a new tile',rise.steps);
  ok(rise.bad===0,'seeded at random, no rise is lost',rise.bad);

  /* every offering does what it says */
  const fx=await p.evaluate(()=>{const T=__t, out={}; window.devNoDark=false;
    const fresh=(k)=>{T.newRun(k,0); T.setP(false); T.run.ess=9999; T.addAtt('mother',1); return T.run.water.str[0];};
    const place=(type,c,r)=>{T.setSel({kind:'ward',type}); T.tryPlace(c,r); T.setSel(null); return T.F.towers[T.F.towers.length-1];};
    const pathAt=(g,d)=>{const q=T.posAt(T.F.paths[g],d); return [Math.floor(q[0]),Math.floor(q[1])];};
    /* Brine Pools: a salt circle drags each creature a tile back, once, and no longer slows */
    {const s=fresh('lamplighter'); T.takeOffer('brine'); window.devNoDark=true;
     const [c,r]=pathAt(0,6), salt=place('salt',c,r); const e=T.spawnFoe('crawler',0,5.45);
     let minD=99, maxD=0; for(let i=0;i<120;i++){T.update(.03); if(e.d>maxD)maxD=e.d; if(e.d<maxD-.5)minD=Math.min(minD,e.d);}
     out.brine={id:salt&&salt.id, brined:e.brined||[], draggedBack:minD<99, past:e.d>6.6};
     window.devNoDark=false; e.dead=true; T.update(.01);}
    /* Undertow: a harpoon bolt holds a creature in water under for a second */
    {const [g,d0]=fresh('lamplighter'); T.takeOffer('undertow');
     const e=T.spawnFoe('gnasher',g,d0+.3); T.update(.001);
     T.F.shots.push({k:'bolt',x:e.x,y:e.y,tg:e,tx:e.x,ty:e.y,spd:13,dmg:1,ang:0}); T.update(.01);
     out.undertow=+e.stunT.toFixed(2);}
    /* Hymn: everything in water hears every chime, wherever it is */
    {const [g,d0]=fresh('lamplighter'); T.takeOffer('hymn'); window.devNoDark=true;
     const tiles=[]; for(let r=0;r<T.ROWS;r++)for(let c=0;c<T.COLS;c++)if(T.placeProblem({kind:'ward',type:'chime'},c,r)==='')tiles.push([c,r]);
     const e=T.spawnFoe('gnasher',g,d0+.3); T.update(.001);
     tiles.sort((a,b2)=>Math.hypot(b2[0]-e.x,b2[1]-e.y)-Math.hypot(a[0]-e.x,a[1]-e.y));
     const ch=place('chime',...tiles[0]); const far=Math.hypot(ch.x-e.x,ch.y-e.y);
     const hp=e.hp; T.chimePulse(ch,T.wstat(ch)); out.hymn={far:+far.toFixed(1),hit:e.hp<hp,stun:e.stunT>0};
     window.devNoDark=false; e.dead=true; T.update(.01);}
    /* Her Milk: every 4 deaths in water restore 1 oil */
    {const [g,d0]=fresh('lamplighter'); T.takeOffer('milk'); T.run.oil=10;
     for(let i=0;i<4;i++){const e=T.spawnFoe('crawler',g,d0+.3); T.update(.001); T.killFoe(e);}
     out.milk=T.run.oil;}
    /* The Cradle: once, she catches a lamp a creature would put out, and her Attention jumps by 2 */
    {fresh('lamplighter'); T.takeOffer('cradle'); const a0=T.attOf('mother'); T.run.oil=1;
     const e=T.spawnFoe('gnasher',0,1); T.lampHit(e);
     out.cradle={oil:T.run.oil, used:!!T.run.cradled, att:T.attOf('mother')-a0, phase:T.F.phase};}
    /* The Ebb: a new rite; it drags what stands in water 2 tiles back, and waits when the water is empty */
    {const [g,d0]=fresh('lamplighter'); T.takeOffer('ebb'); const has=T.run.rites.includes('ebb');
     T.castRite('ebb'); const idle=T.F.cd.ebb||0;
     const e=T.spawnFoe('crawler',g,d0+1.3); T.update(.001); const d=e.d; T.castRite('ebb');
     out.ebb={has, idle, back:+(d-e.d).toFixed(2), cd:T.F.cd.ebb}; e.dead=true; T.update(.01);}
    /* Drowned Flares: a flare that lands in water burns three times as long */
    {const [g,d0]=fresh('lamplighter'); T.takeOffer('drowned');
     const e=T.spawnFoe('gnasher',g,d0+.3); T.update(.001);
     T.F.shots.push({k:'bolt',x:e.x,y:e.y,tg:e,tx:e.x,ty:e.y,spd:13,dmg:1,ang:0,flare:true,fr:1.3,ft:1.5}); T.update(.01);
     const gl=T.F.glints[T.F.glints.length-1]; out.drowned=gl?+gl.max.toFixed(2):0; e.dead=true; T.update(.01);}
    /* Into the Deep: on the line and in water, it cannot move */
    {const [g,d0]=fresh('whaler'); T.takeOffer('deep'); window.devNoDark=true;
     const e=T.spawnFoe('crawler',g,d0+.3); T.update(.001);
     const h={kind:'ward',type:'harpoon',id:9999,c:Math.floor(e.x),r:Math.floor(e.y)+1,x:e.x,y:e.y+1,br:T.treeOf('harpoon').reduce((o,B)=>(o[B.k]=0,o),{}),cd:99,ang:0};
     T.F.towers.push(h); h.st=T.wstat(h); h.tethered=e; e.tetherBy=h; e.tetherT=0;
     const d=e.d; T.update(.1); out.deep={held:+(e.d-d).toFixed(3)};
     T.F.towers.splice(T.F.towers.indexOf(h),1); e.tetherBy=null; T.update(.1); out.deep.free=+(e.d-d).toFixed(3);
     window.devNoDark=false; e.dead=true; T.update(.01);}
    /* Her Fat: a Blubber Lamp beside water drinks from it, not from the pots or the lamp */
    {fresh('whaler'); window.devNoDark=true;
     const wp=T.F.waterPts; let spot=null;
     for(let r=0;r<T.ROWS&&!spot;r++)for(let c=0;c<T.COLS&&!spot;c++)if(T.placeProblem({kind:'ward',type:'candle'},c,r)===''&&Math.hypot(c+.5-wp[0],r+.5-wp[1])<=1.5)spot=[c,r];
     place('candle',...spot); const before=T.blubberDue().oil; T.takeOffer('fat'); const after=T.blubberDue().oil;
     out.fat={before,after}; window.devNoDark=false;}
    return out;});
  console.log(JSON.stringify(fx));
  ok(fx.brine.brined.includes(fx.brine.id)&&fx.brine.brined.length===1,'Brine Pools drags a creature back once',fx.brine);
  ok(fx.brine.draggedBack&&fx.brine.past,'it is dragged back, then walks on past the pool',fx.brine);
  ok(fx.undertow>=.9,'Undertow holds a creature in water under for a second',fx.undertow);
  ok(fx.hymn.far>3&&fx.hymn.hit&&fx.hymn.stun,'Hymn: a chime far away strikes and stuns what stands in water',fx.hymn);
  ok(fx.milk===11,'Her Milk: four deaths in water, one oil',fx.milk);
  ok(fx.cradle.oil===5&&fx.cradle.used&&fx.cradle.att===2&&fx.cradle.phase!=='over','The Cradle catches the lamp',fx.cradle);
  ok(fx.ebb.has&&fx.ebb.idle===0&&Math.abs(fx.ebb.back-2)<.01&&fx.ebb.cd===30,'The Ebb is a rite, waits on empty water, drags 2 tiles',fx.ebb);
  ok(Math.abs(fx.drowned-4.5)<.01,'Drowned Flares burn three times as long in water',fx.drowned);
  ok(fx.deep.held===0&&fx.deep.free>0,'Into the Deep: held still in water on the line',fx.deep);
  ok(fx.fat.before===1&&fx.fat.after===0,'Her Fat: a Blubber Lamp beside water drinks nothing from the lamp',fx.fat);

  /* Still Water: two Signal Candles beside water link through it, however far */
  const still=await p.evaluate(()=>{const T=__t, out={}; window.devNoDark=false;
    T.newRun('lamplighter',0); T.setP(false);
    const P=T.F.paths[0], L=Math.floor(P.len);
    T.run.att={mother:1}; /* the near water two tiles short of the lamp, so it sits in the lamp's light on any map (#75 reshaped the Spillway) */
    T.run.water={floor:0,str:[[0,L-2,L-2],[0,2,2]]}; T.waterSync();
    const wp=T.F.waterPts, spots=[];
    for(const i of [0,2]){let best=null;
      for(let r=0;r<T.ROWS;r++)for(let c=0;c<T.COLS;c++){if(T.F.pathTiles.has(c+','+r)||(c===T.F.lampC&&r===T.F.lampR))continue; const d=Math.hypot(c+.5-wp[i],r+.5-wp[i+1]); if(d<=1.5&&(!best||d<best[2]))best=[c,r,d];}
      spots.push(best);}
    const mk=(s,id)=>({kind:'ward',type:'candle',id,c:s[0],r:s[1],x:s[0]+.5,y:s[1]+.5,br:{glow:0,signal:0,ember:0},cd:0,ang:0});
    const A=mk(spots[0],8001), B=mk(spots[1],8002); T.F.towers.push(A,B);
    out.apart=+Math.hypot(A.x-B.x,A.y-B.y).toFixed(1);
    out.before=T.connectedLights(null).conn.has(B);
    T.run.offs=['still']; const C=T.connectedLights(null);
    out.after=C.conn.has(B); out.aLit=C.conn.has(A);
    return out;});
  console.log(JSON.stringify(still));
  ok(still.apart>6&&still.aLit,'the test candles stand far apart, the near one lit',still);
  ok(!still.before&&still.after,'Still Water links two Signal Candles beside water',still);

  /* the landing: half the time the gift is her offering; take one, or refuse her */
  const land=await p.evaluate(async()=>{const T=__t, out={}; window.devNoDark=false;
    T.newRun('lamplighter',0); T.setP(false);
    T.F.wave=T.F.def.waves.length; T.F.phase='cleared'; T.openDraft(0,0);
    T.draft.patron=T.offerSet('mother'); T.showLanding();
    out.title=document.querySelector('#mTitle').textContent;
    out.cards=document.querySelectorAll('#mChoices .choice.patron').length;
    out.refuse=[...document.querySelectorAll('#mActions button')].some(b=>b.textContent==='Refuse her');
    const first=T.draft.patron[0];
    document.querySelector('#mChoices .choice.patron').click();
    out.took=T.hasOff(first); out.att=T.attOf('mother'); out.step=T.draft.step;
    out.noFlood=T.F.water.size;   /* the floor being left does not flood */
    /* refusing leaves her Attention alone */
    T.newRun('lamplighter',0); T.setP(false); T.F.wave=T.F.def.waves.length; T.F.phase='cleared'; T.openDraft(0,0);
    T.draft.patron=T.offerSet('mother'); T.showLanding();
    [...document.querySelectorAll('#mActions button')].find(b=>b.textContent==='Refuse her').click();
    out.refAtt=T.attOf('mother'); out.refStep=T.draft.step;
    return out;});
  console.log(JSON.stringify(land));
  ok(land.title==='The Drowned Mother'&&land.cards===3&&land.refuse,'the landing shows her three offerings and a refusal',land);
  ok(land.took&&land.att===1&&land.step!=='gift','taking one raises her Attention and moves on',land);
  ok(land.noFlood===0,'Attention gained at the landing waits for the floor below',land.noFlood);
  ok(land.refAtt===0&&land.refStep!=='gift','refusing her moves on with no Attention',land);

  /* the next floor floods; a resume and a turned board keep the same water */
  const keep=await p.evaluate(()=>{const T=__t, out={};
    T.newRun('lamplighter',0); T.setP(false); T.addAtt('mother',1);
    T.run.floor=1; T.beginFloor(null);
    out.floor1=T.F.water.size; out.rf=T.run.water.floor;
    const keys=[...T.F.water.keys()].sort().join(' ');
    T.checkpoint(); const save=JSON.parse(JSON.stringify({run:T.run,wave:T.F.wave,towers:[],lamp:{br:T.F.lamp.br,invested:0}}));
    T.resumeFrom(save); out.same=[...T.F.water.keys()].sort().join(' ')===keys;
    const n=T.F.water.size, o=T.ORIENT; T.setOrient(o==='land'?'port':'land');
    out.turned=T.F.water.size===n&&[...T.F.water.keys()].every(k=>T.F.pathTiles.has(k)); T.setOrient(o);
    return out;});
  console.log(JSON.stringify(keep));
  ok(keep.floor1>=3&&keep.rf===1,'a floor she has noticed you on floods as it begins',keep);
  ok(keep.same,'a resumed floor keeps its water',keep);
  ok(keep.turned,'a turned board keeps its water on the path',keep);

  /* between waves: she reaches out once a floor; refusing closes it and play goes on */
  const brk=await p.evaluate(async()=>{const T=__t, out={};
    T.newRun('lamplighter',0); T.setP(false); T.F.phase='build';
    /* either patron can reach out (#81); with the Wrong Sun's gifts all taken, it is hers */
    Object.keys(T.OFFERINGS).filter(k=>T.OFFERINGS[k].p==='sun').forEach(k=>T.run.offs=(T.run.offs||[]).concat(k));
    T.patronBreak(true); await new Promise(r=>setTimeout(r,80));
    out.open=!document.querySelector('#modal').hidden; out.title=document.querySelector('#mTitle').textContent;
    out.cards=document.querySelectorAll('#mChoices .choice.patron').length;
    [...document.querySelectorAll('#mActions button')].find(b=>b.textContent==='Refuse her').click();
    out.closed=document.querySelector('#modal').hidden;
    T.patronBreak(true); await new Promise(r=>setTimeout(r,80)); out.again=!document.querySelector('#modal').hidden;
    return out;});
  console.log(JSON.stringify(brk));
  ok(brk.open&&brk.title==='The Drowned Mother'&&brk.cards===3,'a mid-floor offer opens between waves',brk);
  ok(brk.closed&&!brk.again,'refused, it closes, and she does not ask twice on one floor',brk);

  /* teaching: her sign in the HUD, its card, the Grimoire page, the rules line and the water tip */
  const teach=await p.evaluate(async()=>{const T=__t, out={};
    T.newRun('lamplighter',0); T.setP(false); T.takeOffer('milk'); T.renderRelics();
    const chip=document.querySelector('#relChips .relchip.is-patron'); out.chip=!!chip;
    chip.click(); out.card=document.querySelector('#relTip').textContent;
    T.openBook('hud','patrons'); out.book=document.querySelector('#mChoices').textContent;
    out.tabs=document.querySelectorAll('.book-tabs .btn').length;
    document.querySelector('#modal').hidden=true; T.setP(false);
    out.rules=document.querySelector('#rulesList').textContent.includes('Patrons.');
    T.tutSet({walk:'done',seen:[],off:false}); T.F.born=-1e6; T.F.phase='build'; T.coachPoll(); out.tip=T.COACH.key;
    T.tutSet({walk:'done',seen:[],off:true});
    return out;});
  console.log(JSON.stringify(teach));
  ok(teach.chip&&teach.card.includes('Attention 1')&&teach.card.includes('Her Milk'),'her sign shows Attention and her gifts',teach.card);
  ok(teach.book.includes('The Drowned Mother')&&teach.book.includes('Her Milk')&&teach.tabs===7,'the Grimoire has a Patrons page',teach);
  ok(teach.rules,'How the dark works explains patrons');
  ok(teach.tip==='water','the first water gets a tip',teach.tip);

  ok(!errs.length,'no page errors',errs);
  fails.forEach(f=>console.log('FAIL '+f)); await b.close(); process.exitCode=fails.length?1:0;
})();
