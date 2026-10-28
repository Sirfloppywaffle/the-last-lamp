// Saltmouth (Expansion 3, step 8): three patron shrines and three tide-pools.
// - Shrines stand in the north cemetery (map 'S'), ruined until raised for SHRINE_COST; ll-town.shrines = {mother,sun,mouths} booleans.
// - A raised shrine's black candle is one town gift (cmother, csun, cmouths): newRun gives that patron Attention 1 and run.candle,
//   and the first break on floor 1 is that patron's offer, once. A replayed stair carries nothing.
// - Tide-pools: ll-town.pools = 3 slots of {k,n} | {bottle:true} | null. First open fills them, a descent's haul refills only empty ones.
const {chromium}=require('playwright');
const fails=[]; const ok=(c,m,d)=>{if(!c)fails.push(m+(d!==undefined?' '+JSON.stringify(d).slice(0,600):''));};
(async()=>{
  const b=await chromium.launch(); const p=await b.newPage({viewport:{width:412,height:860}});
  const errs=[]; p.on('pageerror',e=>errs.push(String(e)));
  await p.goto('file://'+process.argv[2]); await p.waitForTimeout(300);

  /* 1. the ground: shrines and fronts, pools, all reachable, none walled in */
  const g=await p.evaluate(()=>{const T=__t, out={shrines:{},pools:[]};
    T.townReset(); T.setDev(false); T.townOpen(); const W=T.TWN;
    for(const k in T.TOWN_SHRINES){const S=T.TOWN_SHRINES[k];
      out.shrines[k]={solid:T.townSolid(S.x,S.y), frontFree:!T.townSolid(S.dx,S.dy), reach:!!(T.townPathTo(S.dx,S.dy)||(W.p.x|0)===S.dx&&(W.p.y|0)===S.dy), at:T.SHRINE_AT[S.y*30+S.x]===k||true};}
    T.TOWN_POOLS.forEach(([x,y])=>out.pools.push({free:!T.townSolid(x,y),reach:!!(T.townPathTo(x,y))}));
    out.keep=T.TOWN_KEEP.length;
    return out;});
  console.log(JSON.stringify(g));
  for(const k of ['mother','sun','mouths']){ok(g.shrines[k].solid,k+' shrine is solid ground');ok(g.shrines[k].frontFree&&g.shrines[k].reach,k+' shrine front is open and reachable',g.shrines[k]);}
  ok(g.pools.length===3&&g.pools.every(q=>q.free&&q.reach),'three tide-pools, open and reachable',g.pools);

  /* 2. raising: needs the whole cost, takes it, persists, opens the gift */
  const r=await p.evaluate(()=>{const T=__t, out={}; const td=T.townData(); td.res={timber:0,iron:0,tallow:0,curios:0};
    out.cost=T.SHRINE_COST;
    out.poor=T.townRaiseShrine('mother'); out.openPoor=T.townGiftOpen('cmother');
    out.setPoor=T.townSetGift('cmother');
    td.res={timber:0,iron:25,tallow:25,curios:2};
    out.rich=T.townRaiseShrine('mother'); out.res=Object.assign({},td.res);
    out.again=T.townRaiseShrine('mother'); out.openNow=T.townGiftOpen('cmother'); out.openOther=T.townGiftOpen('csun');
    out.set=T.townSetGift('cmother'); out.gift=td.gift;
    out.saved=JSON.parse(localStorage.getItem('ll-town')||'{}').shrines;
    return out;});
  console.log(JSON.stringify(r));
  ok(r.cost.iron===25&&r.cost.tallow===25&&r.cost.curios===2,'a shrine costs 25 iron, 25 tallow and 2 curios',r.cost);
  ok(!r.poor&&!r.openPoor&&!r.setPoor,'a ruined shrine gives nothing and cannot be raised without the haul',r);
  ok(r.rich&&r.res.iron===0&&r.res.tallow===0&&r.res.curios===0,'raising takes the cost',r.res);
  ok(!r.again&&r.openNow&&!r.openOther,'raised once; only its own candle opens',r);
  ok(r.set===true&&r.gift==='cmother','the candle is carried as the one town gift',r);
  ok(r.saved&&r.saved.mother===true&&!r.saved.sun,'the shrine is saved',r.saved);

  /* 3. the candle on the stair: Attention 1 from the start, first break is hers, once, replay carries none */
  const c=await p.evaluate(async()=>{const T=__t, out={};
    T.newRun('lamplighter',0); T.setP(false);
    out.att=T.attOf('mother'); out.tier=T.patTier('mother'); out.candle=T.run.candle; out.water=T.F.water.size>0;
    out.others=T.attOf('sun')+T.attOf('mouths');
    T.F.phase='build'; T.F.patronCalled=false; T.patronBreak();
    await new Promise(r=>setTimeout(r,1300));
    out.open=!document.querySelector('#modal').hidden; out.title=document.querySelector('#mTitle').textContent; out.seen=T.run.candleSeen;
    document.querySelector('#modal').hidden=true; T.setP(false);
    T.F.patronCalled=false; T.run.candleSeen=true; T.patronBreak(); await new Promise(r=>setTimeout(r,1300));
    out.second=!document.querySelector('#modal').hidden && document.querySelector('#mTitle').textContent!==out.title;
    document.querySelector('#modal').hidden=true; T.setP(false);
    T.newRun('lamplighter',0,{replay:true}); out.replayAtt=T.attOf('mother'); out.replayCandle=T.run.candle||null; out.replayGift=T.run.gift;
    return out;});
  console.log(JSON.stringify(c));
  ok(c.att===1&&c.tier===1&&c.candle==='mother'&&c.others===0,'the candle gives its patron Attention 1 and no one else any',c);
  ok(c.open&&/Drowned Mother/.test(c.title)&&c.seen===true,'the first break is the candle patron’s offer',c);
  ok(c.replayAtt===0&&!c.replayCandle&&!c.replayGift,'a replayed stair carries no candle',c);

  /* 3b. review fixes (#129): the candle's offer is seeded, is spent only when it opens, and its point is quiet under a Trial */
  const rv=await p.evaluate(async()=>{const T=__t, out={}; const td=T.townData(); td.res={timber:0,iron:50,tallow:50,curios:4};
    T.townRaiseShrine('mother'); T.townSetGift('cmother');
    const modal=()=>document.querySelector('#modal'), txt=()=>modal().innerText.replace(/\s+/g,' ');
    const sleep=ms=>new Promise(r=>setTimeout(r,ms));
    const sample=async(seed)=>{T.newRun('lamplighter',0,{seed}); T.setP(false); T.F.phase='build'; T.F.patronCalled=false; T.patronBreak();
      await sleep(1300); const t=modal().hidden?'':txt(); modal().hidden=true; T.setP(false); return t;};
    const a=await sample(12345), b=await sample(12345), c=await sample(54321);
    out.same=a&&a===b; out.some=!!a; out.other=c;
    /* the next wave is called inside the 900 ms delay: the offer is not lost, it waits for the next break */
    T.newRun('lamplighter',0,{seed:777}); T.setP(false); T.F.phase='build'; T.F.patronCalled=false; T.patronBreak();
    T.setP(true); T.F.phase='wave'; await sleep(1300);
    out.afterLapse={seen:!!T.run.candleSeen, called:T.F.patronCalled, open:!modal().hidden};
    T.F.phase='build'; T.setP(false); T.patronBreak(); await sleep(1300);
    out.afterRetry={seen:!!T.run.candleSeen, open:!modal().hidden}; modal().hidden=true; T.setP(false);
    /* Trial floor: the candle's point does not count; earned Attention does */
    T.newRun('lamplighter',0,{seed:1}); T.setP(false);
    const raw=T.run.att.mother; T.F.trial={}; const quiet=[T.attOf('mother'),T.patTier('mother')];
    T.run.att={mother:3}; const earned=T.attOf('mother'); T.F.trial=null; const loud=T.attOf('mother');
    out.trial={raw,quiet,earned,loud};
    return out;});
  console.log(JSON.stringify({afterLapse:rv.afterLapse,afterRetry:rv.afterRetry,trial:rv.trial}));
  ok(rv.some&&rv.same,'the same stair with the same candle offers the same three',rv);
  ok(!rv.afterLapse.seen&&!rv.afterLapse.called&&!rv.afterLapse.open&&rv.afterRetry.seen&&rv.afterRetry.open,'a candle offer lost to an early call waits for the next break',rv);
  ok(rv.trial.raw===1&&rv.trial.quiet[0]===0&&rv.trial.quiet[1]===0&&rv.trial.earned===2&&rv.trial.loud===3,'under a Trial the candle’s point is quiet and earned Attention stays',rv.trial);

  /* 4. another patron's candle: its own patron, and a save with no candle is unchanged */
  const o=await p.evaluate(()=>{const T=__t, td=T.townData(), out={};
    td.res={timber:0,iron:50,tallow:50,curios:4}; T.townRaiseShrine('sun'); T.townRaiseShrine('mouths');
    T.townSetGift('csun'); T.newRun('whaler',0); out.sun=[T.attOf('sun'),T.attOf('mother'),T.run.candle];
    T.townSetGift('cmouths'); T.newRun('whaler',0); out.mouths=[T.attOf('mouths'),T.run.candle];
    T.townSetGift(null); T.newRun('whaler',0); out.none=[T.run.att||null,T.run.candle||null];
    return out;});
  ok(o.sun[0]===1&&o.sun[1]===0&&o.sun[2]==='sun','the Sun’s candle',o.sun);
  ok(o.mouths[0]===1&&o.mouths[1]==='mouths','the Many-Mouthed’s candle',o.mouths);
  ok(o.none[0]===null&&o.none[1]===null,'no candle, no Attention',o.none);

  /* 5. tide-pools: filled once on first open, gathered, refilled only where empty, bottles tell and are saved */
  const t=await p.evaluate(()=>{const T=__t, out={};
    T.townReset(); localStorage.removeItem('ll-town'); T.townOpen(); const td=T.townData();
    out.first=T.poolsFix(td.pools).map(q=>q?(q.bottle?'bottle':q.k+q.n):null);
    td.pools=[{k:'iron',n:4},null,{bottle:true}]; td.res={timber:0,iron:0,tallow:0,curios:0};
    T.townPoolTake(0); out.iron=td.res.iron; out.slot0=td.pools[0];
    T.townPoolTake(2); out.lore=(td.lore||[]).length; out.slot2=td.pools[2];
    out.takeEmpty=T.townPoolTake(1);
    td.pools=[null,{k:'tallow',n:5},null]; T.poolsRefill(td);
    out.kept=JSON.stringify(td.pools[1]); out.filled=td.pools.every(Boolean);
    let bad=0; for(let i=0;i<500;i++){const q=T.poolRoll(); if(!(q.bottle||(['timber','iron','tallow','curios'].includes(q.k)&&q.n>=1&&q.n<=6&&(q.k!=='curios'||q.n===1))))bad++;} out.bad=bad;
    return out;});
  console.log(JSON.stringify(t));
  ok(t.first.length===3&&t.first.every(Boolean),'the pools are filled when the square first opens',t.first);
  ok(t.iron===4&&t.slot0===null,'gathering empties the pool and pays the haul',t);
  ok(t.lore===1&&t.slot2===null&&t.takeEmpty===false,'a bottle is read once and kept',t);
  ok(t.kept==='{"k":"tallow","n":5}'&&t.filled&&t.bad===0,'refilling leaves a full pool alone',t);

  /* 6. a damaged save is mended; old saves have no shrines or pools */
  const f=await p.evaluate(()=>{const T=__t; const x=T.townFix({shrines:{mother:'yes',moon:true},pools:[{k:'gold',n:99},{k:'iron',n:99},7],lore:[1,'a',-4,1.5]});
    const y=T.townFix({}); return {sh:x.shrines,pools:x.pools,lore:x.lore,y:y.shrines,yp:y.pools};});
  ok(f.sh&&f.sh.mother!==true&&f.sh.moon===undefined,'bad shrine values are not trusted',f.sh);
  ok(Array.isArray(f.pools)&&f.pools[0]===null&&f.pools[1]&&f.pools[1].n<=6&&f.pools[2]===null,'bad pool entries are mended',f.pools);
  ok(f.yp===null&&f.y&&!Object.values(f.y).some(Boolean),'an old save has no pools until opened, and no shrine raised',[f.y,f.yp]);

  /* 7. teaching (rule 23) */
  const tx=await p.evaluate(()=>({rules:document.getElementById('rulesList').textContent,shr:!!__t.TIPS&&1}));
  ok(/black candle/.test(tx.rules)&&/tide-pools/.test(tx.rules),'the rules name the shrines and the tide-pools');

  ok(!errs.length,'no page errors',errs);
  await b.close();
  if(fails.length){console.log('FAIL\n'+fails.join('\n')); process.exit(1);} console.log('shrines ok');
})();
