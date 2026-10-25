// Saltmouth (Expansion 3, step 6): workshops and the one town gift, with its price.
// - ll-town.buildings = {brazier, quay, smithy, belfry, menagerie} tiers 0..2: ruined at 0, restored at 1, lit windows at 2.
// - One town gift at most in ll-town.gift, copied into run.gift in newRun() (unless run.replay), shown as a seal in #relBar.
// - Each of the 6 gifts (dip, ration, tune, echo, tether, bone) applies both its gain and its price on the stair.
// - Every gift does nothing on run.replay and on any floor under every Trial in TRIALS.
// - Same seed gives the same Loaded Bone roll (SALT.townGift = 25), and old saves without run.gift have no gift.
const {chromium}=require('playwright');
const fails=[]; const ok=(cond,msg,detail)=>{if(!cond)fails.push(msg+(detail!==undefined?' '+JSON.stringify(detail).slice(0,700):''));};
(async()=>{
  const b=await chromium.launch();
  const ctx=await b.newContext({viewport:{width:412,height:860},deviceScaleFactor:2.625,hasTouch:true,isMobile:true});
  const p=await ctx.newPage();
  await p.goto('file://'+process.argv[2]); await p.waitForTimeout(400);

  /* 1. Workshops: tiers 0 -> 1 -> 2, costs, ruin/restored/lit windows, and one gift at most */
  const wkRes=await p.evaluate(()=>{
    const T=__t.townData();
    const b0=Object.assign({},T.buildings);
    const A0=__t.townArt(), lights0=A0.lights.length;
    const hBrazier=__t.TOWN_WORKSHOPS.brazier.house;
    const ruin0=hBrazier.ruin, lit0=hBrazier.lit.slice();
    /* cannot upgrade with 0 resources */
    const failUp=__t.townUpgrade('brazier');
    T.res={timber:500,iron:500,tallow:500,curios:50};
    const up1=__t.townUpgrade('brazier');
    const ruin1=hBrazier.ruin, lit1=hBrazier.lit.slice(), resAfter1=Object.assign({},T.res);
    const up2=__t.townUpgrade('brazier');
    const ruin2=hBrazier.ruin, lit2=hBrazier.lit.slice(), lights2=__t.townArt().lights.length;
    const up3=__t.townUpgrade('brazier');
    /* picking a gift replaces any previous pick (one gift at most) */
    __t.townSetGift('dip');
    const g1=T.gift;
    __t.townUpgrade('quay');
    __t.townSetGift('ration');
    const g2=T.gift;
    return {b0,failUp,up1,ruin0,lit0,ruin1,lit1,resAfter1,up2,ruin2,lit2,lights0,lights2,up3,g1,g2};
  });
  ok(wkRes.b0.brazier===0&&wkRes.b0.quay===0&&wkRes.b0.smithy===0&&wkRes.b0.belfry===0&&wkRes.b0.menagerie===0,'ll-town.buildings starts at tier 0 for all 5 workshops',wkRes.b0);
  ok(wkRes.failUp===false&&wkRes.up1===true&&wkRes.up2===true&&wkRes.up3===false,'workshops upgrade 0 -> 1 -> 2 and stop at 2',wkRes);
  ok(wkRes.ruin0===true&&wkRes.ruin1===false&&wkRes.ruin2===false&&!wkRes.lit1[0]&&wkRes.lit2[0]&&wkRes.lights2>wkRes.lights0,'ruined at tier 0, restored at tier 1, lit windows at tier 2',wkRes);
  ok(wkRes.resAfter1.iron===480&&wkRes.resAfter1.tallow===485,'tier 1 brazier deducts 20 iron and 15 tallow',wkRes.resAfter1);
  ok(wkRes.g1==='dip'&&wkRes.g2==='ration','only one town gift is held in ll-town.gift at a time',wkRes);

  /* 2. Seam & #relBar seal + #relTip, old saves have no gift, and disabled on run.replay */
  const seamRes=await p.evaluate(()=>{
    for(const id of Object.keys(__t.TOWN_WORKSHOPS))__t.townUpgrade(id);
    __t.townSetGift('dip');
    __t.newRun('lamplighter',0);
    __t.renderRelics();
    const chip=document.querySelector('#relChips .relchip.is-gift');
    const chipGlyph=chip?chip.textContent:'';
    if(chip)chip.click();
    const tipTxt=document.getElementById('relTip').textContent||'';
    /* replay run has no gift */
    __t.newRun('lamplighter',0,{seed:12345,replay:true});
    __t.renderRelics();
    const replayGift=__t.run.gift, replayChip=document.querySelector('#relChips .relchip.is-gift');
    /* old save without gift resumes with null even when ll-town.gift is set */
    __t.newRun('lamplighter',0);
    __t.checkpoint();
    const sv=JSON.parse(localStorage.getItem('ll-save-v2'));
    delete sv.run.gift;
    __t.townSetGift('tune');
    __t.resumeFrom(sv);
    const oldSaveGift=__t.run.gift;
    return {chipGlyph,tipTxt,replayGift,hasReplayChip:!!replayChip,oldSaveGift};
  });
  ok(seamRes.chipGlyph==='C'&&/Chandler’s Dip/.test(seamRes.tipTxt)&&/0.5 smaller/.test(seamRes.tipTxt),'active town gift renders a seal in #relBar and shows gain + price in #relTip',seamRes);
  ok(seamRes.replayGift===null&&!seamRes.hasReplayChip,'town gift is off on a replayed stair (run.replay)',seamRes);
  ok(seamRes.oldSaveGift===null,'old saves without run.gift have no gift on resumeFrom',seamRes);

  /* 3. Each of the 6 gifts: both gain and price occur on the stair */
  const giftsRes=await p.evaluate(()=>{
    const out={};
    /* 3a. The Chandler's Dip (dip): first Candle on floor 1 free, lamp 0.5 smaller until floor 2 */
    __t.townSetGift(null); __t.newRun('lamplighter',0);
    const baseLamp=__t.lampBase(), baseCandleCost=__t.wardCost('candle');
    __t.townSetGift('dip'); __t.newRun('lamplighter',0);
    const dipLampF1=__t.lampBase(), dipCost1=__t.wardCost('candle');
    /* place a candle on a lit tile near the lamp */
    __t.setSel({kind:'ward',type:'candle'});
    let placed=false;
    for(let r=0;r<12&&!placed;r++)for(let c=0;c<12&&!placed;c++){
      const n0=__t.F.towers.length; __t.tryPlace(c,r); if(__t.F.towers.length>n0)placed=true;
    }
    const dipCost2=__t.wardCost('candle');
    __t.run.floor=1; const dipLampF2=__t.lampBase();
    out.dip={baseLamp,dipLampF1,dipLampF2,baseCandleCost,dipCost1,dipCost2,placed};

    /* 3b. Whaler's Ration (ration): +2 oil at each Rest, merchant asks 10% more */
    __t.townSetGift(null); __t.newRun('lamplighter',0);
    const basePrice100=__t.price(100);
    __t.townSetGift('ration'); __t.newRun('lamplighter',0);
    const rationPrice100=__t.price(100);
    __t.run.oil=5; __t.F.phase='draft'; __t.F.draft={step:'room',done:false,salvage:0,room:{type:'rest'}};
    __t.beginFloor({wave:4,towers:[],lamp:{br:{},invested:0},draft:__t.F.draft});
    const restText=document.getElementById('mChoices').textContent||'';
    document.querySelector('#mChoices button').click();
    out.ration={basePrice100,rationPrice100,restText,restOil:__t.run.oil};

    /* 3c. Capacitor Tune (tune): +1 rite charge on floor 1, every rite's first wait on floor 1 is 25% longer */
    __t.townSetGift('tune'); __t.newRun('lamplighter',0);
    const chgF1=__t.chargesNow();
    __t.F.cd.pillar=__t.RITES.pillar.cd;
    const wait1=__t.F.cd.pillar, expectedWait1=+(__t.RITES.pillar.cd*1.25).toFixed(4);
    __t.F.cd.pillar=0; __t.F.cd.pillar=__t.RITES.pillar.cd;
    const wait2=__t.F.cd.pillar;
    __t.run.floor=1; const chgF2=__t.chargesNow();
    out.tune={chgF1,chgF2,wait1,expectedWait1,wait2};

    /* 3d. Echoing Iron (echo): floor 1 shows waves 1 and 2, early-call bonus halved on floor 1 */
    __t.townSetGift(null); __t.newRun('lamplighter',0);
    const baseEarly=__t.earlyBonus();
    __t.townSetGift('echo'); __t.newRun('lamplighter',0);
    __t.renderPreview();
    const pvHtml=document.getElementById('preview').textContent||'';
    const echoEarlyF1=__t.earlyBonus();
    __t.run.floor=1; const echoEarlyF2=__t.earlyBonus();
    out.echo={baseEarly,echoEarlyF1,echoEarlyF2,pvHtml};

    /* 3e. Familiar's Tether (tether): start with bound Watcher, its madness counts fielded or not */
    __t.townSetGift('tether'); __t.newRun('lamplighter',0);
    const tetherRoster=__t.run.roster.watcher, tetherMadUnfielded=__t.madness();
    __t.F.towers.push({townTether:true,kind:'horror',type:'watcher',c:1,r:1,x:1.5,y:1.5,br:{}});
    const tetherMadFielded=__t.madness();
    out.tether={tetherRoster,tetherMadUnfielded,tetherMadFielded};

    /* 3f. The Loaded Bone (bone): SALT.townGift = 25, 4..6 -> +15 essence, 1..3 -> -10 essence, deterministic per seed */
    let seedHi=1, seedLo=1;
    for(let s=1;s<500;s++){if(__t.loadedBoneFace(s)>=4){seedHi=s; break;}}
    for(let s=1;s<500;s++){if(__t.loadedBoneFace(s)<=3){seedLo=s; break;}}
    __t.townSetGift(null); __t.newRun('lamplighter',0,{seed:seedHi}); const baseEss=__t.run.ess;
    __t.townSetGift('bone');
    __t.newRun('lamplighter',0,{seed:seedHi}); const essHi1=__t.run.ess, rollHi1=__t.run.boneRoll, drawHi1=JSON.stringify(__t.run.draw);
    __t.newRun('lamplighter',0,{seed:seedHi}); const essHi2=__t.run.ess, rollHi2=__t.run.boneRoll, drawHi2=JSON.stringify(__t.run.draw);
    __t.newRun('lamplighter',0,{seed:seedLo}); const essLo=__t.run.ess, rollLo=__t.run.boneRoll;
    out.bone={salt:__t.SALT.townGift,baseEss,essHi1,essHi2,rollHi1,rollHi2,sameDraw:drawHi1===drawHi2,essLo,rollLo};
    return out;
  });
  ok(giftsRes.dip.dipCost1===0&&giftsRes.dip.placed&&giftsRes.dip.dipCost2===giftsRes.dip.baseCandleCost&&Math.abs(giftsRes.dip.baseLamp-giftsRes.dip.dipLampF1-0.5)<1e-6&&Math.abs(giftsRes.dip.dipLampF2-giftsRes.dip.baseLamp)<1e-6,'Chandler’s Dip: first candle free on floor 1, lamp 0.5 smaller until floor 2',giftsRes.dip);
  ok(giftsRes.ration.basePrice100===100&&giftsRes.ration.rationPrice100===110&&giftsRes.ration.restOil===15&&/Restore 10 oil/.test(giftsRes.ration.restText),'Whaler’s Ration: +2 oil at Rest and +10% merchant price',giftsRes.ration);
  ok(giftsRes.tune.chgF1===1&&giftsRes.tune.chgF2===0&&giftsRes.tune.wait1===giftsRes.tune.expectedWait1&&giftsRes.tune.wait2<giftsRes.tune.wait1,'Capacitor Tune: +1 rite charge on floor 1 and +25% first wait on floor 1',giftsRes.tune);
  ok(/Wave 2/.test(giftsRes.echo.pvHtml)&&giftsRes.echo.echoEarlyF1===Math.floor(giftsRes.echo.baseEarly/2)&&giftsRes.echo.echoEarlyF2===giftsRes.echo.baseEarly,'Echoing Iron: shows wave 1 and 2 on floor 1 and halves early-call bonus on floor 1',giftsRes.echo);
  ok(giftsRes.tether.tetherRoster===1&&giftsRes.tether.tetherMadUnfielded===2&&giftsRes.tether.tetherMadFielded===2,'Familiar’s Tether: starts with 1 bound Watcher whose madness counts fielded or not',giftsRes.tether);
  ok(giftsRes.bone.salt===25&&giftsRes.bone.essHi1===giftsRes.bone.baseEss+15&&giftsRes.bone.essHi1===giftsRes.bone.essHi2&&giftsRes.bone.rollHi1===giftsRes.bone.rollHi2&&giftsRes.bone.sameDraw&&giftsRes.bone.essLo===giftsRes.bone.baseEss-10,'Loaded Bone: SALT.townGift=25, +15 on 4..6, -10 on 1..3, same seed gives same roll',giftsRes.bone);

  /* Dip belongs to its free Candle, even after upgrades and a save: other sales cannot restore it. */
  const dipSales=await p.evaluate(()=>{
    const T=__t, out={}; T.townSetGift('dip'); T.newRun('lamplighter',0); T.setP(true); T.run.ess=1000;
    const place=type=>{
      const it={kind:'ward',type}, spots=[];
      for(let r=0;r<T.ROWS;r++)for(let c=0;c<T.COLS;c++)if(!T.placeProblem(it,c,r))spots.push([c,r]);
      spots.sort((a,b)=>Math.hypot(a[0]+.5-T.F.lx,a[1]+.5-T.F.ly)-Math.hypot(b[0]+.5-T.F.lx,b[1]+.5-T.F.ly));
      if(!spots.length)throw new Error('No legal tile for '+type);
      T.setSel(it); T.tryPlace(...spots[0]); return T.F.towers.at(-1);
    };
    const free=place('candle'), paid=place('candle'), other=place('harpoon'), cost=T.wardCost('candle');
    out.marked=free.townDip===true&&!paid.townDip&&!other.townDip;
    T.sellTower(paid,true); out.paidSale=T.run.dipUsed===true&&T.wardCost('candle')===cost;
    T.sellTower(other,true); out.otherSale=T.run.dipUsed===true&&T.wardCost('candle')===cost;
    T.buyBranch(free,0); out.upgraded=free.invested>0;
    T.checkpoint(); const save=JSON.parse(localStorage.getItem('ll-save-v2'));
    out.saved=save.run.dipUsed===true&&save.towers.find(t=>t.id===free.id).townDip===true;
    T.resumeFrom(save); T.setP(true);
    const restored=T.F.towers.find(t=>t.id===free.id);
    out.restored=restored.townDip===true&&T.run.dipUsed===true&&T.wardCost('candle')===cost;
    T.sellTower(restored,true); out.freeSale=T.run.dipUsed===false&&T.wardCost('candle')===0;
    const ess=T.run.ess, replacement=place('candle');
    out.replaced=replacement.townDip===true&&T.run.ess===ess&&T.run.dipUsed===true&&T.wardCost('candle')===cost;
    /* Older saves lack ownership information: never guess that an unmarked Candle owns the gift. */
    delete save.towers.find(t=>t.id===free.id).townDip;
    T.resumeFrom(save); T.setP(true); T.sellTower(T.F.towers.find(t=>t.id===free.id),true);
    out.oldSave=T.run.dipUsed===true&&T.wardCost('candle')===cost;
    return out;
  });
  ok(dipSales.marked,'Dip marks only the gift-funded Candle',dipSales);
  ok(dipSales.paidSale&&dipSales.otherSale,'selling a paid Candle or another ward preserves Dip use',dipSales);
  ok(dipSales.upgraded&&dipSales.saved&&dipSales.restored,'Dip ownership survives upgrades and save/resume',dipSales);
  ok(dipSales.freeSale&&dipSales.replaced,'selling the gifted Candle restores one free replacement',dipSales);
  ok(dipSales.oldSave,'an unmarked Candle in an older save never restores Dip',dipSales);

  /* 4. Disabled under every Trial in TRIALS */
  const trialRes=await p.evaluate(()=>{
    const trials=Object.keys(__t.TRIALS), bad=[];
    let seedHi=1; for(let s=1;s<500;s++){if(__t.loadedBoneFace(s)>=4){seedHi=s; break;}}
    for(const tr of trials){
      __t.townSetGift(null); __t.newRun('lamplighter',0,{seed:seedHi,trial:tr});
      const baseLamp=__t.lampBase(), baseCandle=__t.wardCost('candle'), basePrice=__t.price(100), baseEarly=__t.earlyBonus(), baseEss=__t.run.ess;

      __t.townSetGift('dip'); __t.newRun('lamplighter',0,{seed:seedHi,trial:tr});
      if(__t.wardCost('candle')!==baseCandle||Math.abs(__t.lampBase()-baseLamp)>1e-6)bad.push(tr+':dip');

      __t.townSetGift('ration'); __t.newRun('lamplighter',0,{seed:seedHi,trial:tr});
      if(__t.price(100)!==basePrice)bad.push(tr+':ration');

      __t.townSetGift('tune'); __t.newRun('lamplighter',0,{seed:seedHi,trial:tr});
      __t.F.cd.pillar=__t.RITES.pillar.cd;
      if(__t.chargesNow()!==0||__t.F.cd.pillar!==__t.RITES.pillar.cd)bad.push(tr+':tune');

      __t.townSetGift('echo'); __t.newRun('lamplighter',0,{seed:seedHi,trial:tr});
      __t.renderPreview();
      if(__t.earlyBonus()!==baseEarly||/Wave 2/.test(document.getElementById('preview').textContent||''))bad.push(tr+':echo');

      __t.townSetGift('tether'); __t.newRun('lamplighter',0,{seed:seedHi,trial:tr});
      if(__t.madness()!==0||__t.avail('watcher')!==0)bad.push(tr+':tether');

      __t.townSetGift('bone'); __t.newRun('lamplighter',0,{seed:seedHi,trial:tr});
      if(__t.run.ess!==baseEss)bad.push(tr+':bone');
    }
    __t.townSetGift(null);
    return {trials:trials.length,bad};
  });
  ok(trialRes.trials>=7&&trialRes.bad.length===0,'every town gift does nothing on a floor under any Trial',trialRes);

  /* Exercise real casts, reloads and all doors, rather than just assigning stats. */
  const boundaries=await p.evaluate(()=>{
    __t.townSetGift('tune'); __t.newRun('lamplighter',0,{seed:42});
    __t.castRite('flare'); const firstWait=__t.F.cd.flare;
    __t.castRite('flare'); const chargeLeft=__t.chargesNow(), restoredWait=__t.F.cd.flare;
    __t.run.charge={floor:0,n:1}; __t.F.cd.pillar=10; __t.castRite('pillar'); __t.castRite('pillar');
    const cancelled=__t.chargesNow();
    __t.checkpoint(); const save=JSON.parse(localStorage.getItem('ll-save-v2'));
    __t.resumeFrom(save); __t.castRite('flare'); const waitAfterReload=__t.F.cd.flare;
    __t.townSetGift('tether'); __t.newRun('lamplighter',0); __t.run.ess=900;
    __t.setSel({kind:'horror',type:'watcher'});
    for(let r=0;r<__t.ROWS&&!__t.F.towers.length;r++)for(let c=0;c<__t.COLS&&!__t.F.towers.length;c++)__t.tryPlace(c,r);
    const watcher=__t.F.towers.find(t=>t.townTether), fieldedMad=__t.madness(), paidMad=__t.boundMadness();
    if(watcher)__t.castUnbind(watcher);
    const lostMad=__t.madness(), lostGift=__t.run.tetherWatcher;
    __t.townSetGift('bone'); __t.newRun('lamplighter',0,{seed:42});
    const boneEss=__t.run.ess, boneFace=__t.run.boneRoll;
    __t.checkpoint(); __t.resumeFrom(JSON.parse(localStorage.getItem('ll-save-v2')));
    const resumedEss=__t.run.ess, resumedFace=__t.run.boneRoll;
    __t.townSetGift(null); __t.newRun('lamplighter',0,{seed:42});
    const plainDraw=JSON.stringify([__t.run.draw,__t.run.mapv]);
    __t.townSetGift('bone'); __t.newRun('lamplighter',0,{seed:42});
    const giftDraw=JSON.stringify([__t.run.draw,__t.run.mapv]);
    const doors=[]; __t.townOpen();
    for(const W of Object.values(__t.TOWN_WORKSHOPS)){
      __t.TWN.p.x=12; __t.TWN.p.y=14;
      const protectedDoor=__t.TOWN_KEEP.some(([x,y])=>x===W.dx&&y===W.dy)&&__t.townKept(W.dx,W.dy);
      __t.townTapTile(W.x,W.y);
      for(let i=0;i<1000&&__t.TWN.goal;i++)__t.townStep(.05);
      doors.push({id:W.id,protectedDoor,opened:document.getElementById('mTitle').textContent.startsWith(W.n)});
      document.querySelector('#mActions button:last-child').click();
    }
    const fixed=__t.townFix({res:{},decos:[{id:'fence',c:8,r:17}],buildings:{brazier:99,quay:-1},gift:'unknown'});
    __t.townClose();
    const live=localStorage.getItem('ll-town'); __t.setDev(true);
    __t.townData().res={timber:1000,iron:1000,tallow:1000,curios:100};
    __t.townUpgrade('brazier'); __t.townSetGift('echo');
    const devIsolated=localStorage.getItem('ll-town')===live; __t.setDev(false);
    return {fieldedMad,paidMad,lostMad,lostGift,firstWait,chargeLeft,restoredWait,cancelled,waitAfterReload,boneEss,boneFace,resumedEss,resumedFace,sameDraw:plainDraw===giftDraw,doors,fixed,devIsolated};
  });
  ok(boundaries.firstWait===35&&boundaries.chargeLeft===0&&boundaries.restoredWait<=35&&boundaries.waitAfterReload===28,'Tune: a real charged cast spends the gift and the first-wait flag survives reload',boundaries);
  ok(boundaries.fieldedMad===2&&boundaries.paidMad===2&&boundaries.lostMad===0&&boundaries.lostGift===false,'Tether: actual placement preserves paid madness, unbinding removes the gift and its madness',boundaries);
  ok(boundaries.cancelled===1,'a cancelled targeted rite keeps remaining charges',boundaries);
  ok(boundaries.boneEss===boundaries.resumedEss&&boundaries.boneFace===boundaries.resumedFace&&boundaries.sameDraw,'Bone: reload never pays twice and town roll leaves wave/map streams unchanged',boundaries);
  ok(boundaries.doors.every(d=>d.protectedDoor&&d.opened),'all five workshop taps walk to protected reachable doors and open their cards',boundaries.doors);
  ok(boundaries.fixed.decos.length===0&&boundaries.fixed.res.iron>0&&boundaries.fixed.buildings.brazier===2&&boundaries.fixed.buildings.quay===0&&boundaries.fixed.gift===null,'old decorations on new workshop footprints are refunded and town fields sanitized',boundaries.fixed);
  ok(boundaries.devIsolated,'developer workshop upgrades and gift picks never write ll-town');

  for(const f of fails)console.log('FAIL '+f);
  console.log(fails.length?fails.length+' failed':'townGift ok');
  await b.close(); process.exit(fails.length?1:0);
})();
