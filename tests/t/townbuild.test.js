// Saltmouth (Expansion 3, step 4): build mode and headstones.
// - TOWN_DECOS: place pays, taking up refunds all of it; never on the deck, on something solid, on another piece, or where it
//   would wall the Head-frame off from where you climb out.
// - Lamps and braziers carve pools out of the dark: the screen gets brighter round them.
// - defeat() keeps a grave (the creature that put the lamp out, the seed); the last 12 without a stone are kept.
// - A Mossy Headstone carries the oldest waiting grave; reading it shows that stair's code to copy.
// - The real UI: Build in the HUD, a chip on the tray, a tap on the canvas; ll-town keeps what was built across a reload.
// - Developer mode never writes ll-town (rule 24). Taught (rule 23): TIPS.townbuild and the Saltmouth rules line.
const {chromium}=require('playwright');
const fails=[]; const ok=(cond,msg,detail)=>{if(!cond)fails.push(msg+(detail!==undefined?' '+JSON.stringify(detail).slice(0,700):''));};
(async()=>{
  const b=await chromium.launch();
  const ctx=await b.newContext({viewport:{width:1280,height:900},deviceScaleFactor:1});
  const p=await ctx.newPage();
  await p.goto('file://'+process.argv[2]); await p.waitForTimeout(400);

  /* 1. an old ll-town (step 3's shape) loads with nothing built and no graves; a piece that can't stand is paid back */
  const old=await p.evaluate(()=>{
    const fx=__t.townFix({v:1,startInTown:false,px:12,py:14,visits:3,res:{timber:5,iron:5,tallow:0,curios:0}});
    const bad=__t.townFix({res:{iron:0},decos:[{id:'lamp',c:11,r:11},{id:'cobble',c:3,r:14},{id:'cobble',c:3,r:14},{id:'nope',c:4,r:14}]});
    return {decos:fx.decos,graves:fx.graves,res:fx.res,visits:fx.visits,bad:bad.decos,badRes:bad.res};
  });
  ok(Array.isArray(old.decos)&&!old.decos.length&&Array.isArray(old.graves)&&!old.graves.length&&old.res.timber===5&&old.visits===3,'an old ll-town loads with empty decos and graves, keeping its haul',old);
  ok(old.bad.length===1&&old.bad[0].id==='cobble'&&old.badRes.iron===8&&old.badRes.tallow===4,'a stored piece on the deck, or a second on the same tile, is dropped and paid back',old);

  /* 2. place, pay, take up, refund; the rules for where */
  await p.evaluate(()=>{localStorage.setItem('ll-tut',JSON.stringify({walk:'done',seen:['town','townhaul','townbuild'],off:false}));
    localStorage.removeItem('ll-town'); __t.townReset();});
  const place=await p.evaluate(()=>{
    const D=__t.townData(); D.res={timber:40,iron:60,tallow:30,curios:0}; __t.townSave();
    __t.townOpen(); const T=__t.TWN; T.p.x=12; T.p.y=14; T.path=null;
    const o={};
    o.lamp=__t.townPlace('lamp',3,15); o.after=Object.assign({},__t.townData().res);
    o.solidNow=__t.townSolid(3,15); o.at=(__t.townDecoAt(3,15)||{}).id;
    o.cob=__t.townPlace('cobble',4,13); o.cobWalk=!__t.townSolid(4,13);
    o.tree=__t.townPlace('tree',6,17); o.treeTiles=[[6,17],[7,17],[6,18],[7,18]].every(([x,y])=>__t.townSolid(x,y));
    o.deck=__t.townCanPlace('lamp',11,11); o.rock=__t.townCanPlace('lamp',0,5); o.house=__t.townCanPlace('fence',2,9);
    o.taken=__t.townCanPlace('fence',3,15); o.treeOver=__t.townCanPlace('fence',7,18); o.spawn=__t.townCanPlace('fence',12,14);
    o.spawnPath=__t.townCanPlace('cobble',12,14); o.frame=__t.townCanPlace('lamp',11,7);
    T.p.x=8.5; T.p.y=14.5; o.onYou=__t.townCanPlace('fence',8,14); T.p.x=12; T.p.y=14;
    o.stoneNone=__t.townCanPlace('stone',2,13);
    const R=__t.townData().res; const keep=Object.assign({},R); R.tallow=1; o.poor=__t.townCanPlace('lamp',2,13); Object.assign(R,keep);
    /* wall the deck in on three sides: the fourth is refused */
    o.w1=__t.townPlace('fence',10,11); o.w2=__t.townPlace('fence',13,11); o.w3=__t.townPlace('fence',11,12);
    o.cut=__t.townCanPlace('fence',12,12); o.cutPath=__t.townCanPlace('cobble',12,12);
    o.reach=__t.townReaches(12,14);
    const before=Object.assign({},__t.townData().res), n0=__t.townData().decos.length;
    o.up=__t.townTakeUp(__t.townDecoAt(3,15)); o.refund=__t.townData().res.iron-before.iron===6&&__t.townData().res.tallow-before.tallow===4;
    o.gone=!__t.townSolid(3,15)&&__t.townData().decos.length===n0-1;
    o.stored=JSON.parse(localStorage.getItem('ll-town')).decos.length;
    return o;
  });
  ok(place.lamp===''&&place.after.iron===54&&place.after.tallow===26&&place.solidNow&&place.at==='lamp','placing a street-lamp pays 6 iron and 4 tallow and stands solid',place);
  ok(place.cob===''&&place.cobWalk,'a cobble is laid into the ground and walked on',place);
  ok(place.tree===''&&place.treeTiles&&/already/.test(place.treeOver),'a tree covers its 2 by 2 footprint',place);
  ok(/deck/.test(place.deck),'never on the deck',place.deck);
  ok(/no open ground/.test(place.rock)&&/no open ground/.test(place.house),'never on rock or a building',place);
  ok(/already/.test(place.taken),'never on another piece',place.taken);
  ok(/climb out/.test(place.spawn)&&place.spawnPath==='','nothing solid where you climb out; a path is fine',place);
  ok(/Head-frame/.test(place.frame),'nothing under the Head-frame tower',place.frame);
  ok(/standing there/.test(place.onYou),'never on the Keeper',place.onYou);
  ok(/No grave/.test(place.stoneNone),'no headstone without a grave waiting',place.stoneNone);
  ok(/You need 3 more tallow/.test(place.poor),'says what is short',place.poor);
  ok(place.w1===''&&place.w2===''&&place.w3===''&&/wall off/.test(place.cut)&&place.cutPath===''&&place.reach,'a piece that would cut off the Head-frame is refused (a path is not)',place);
  ok(place.up&&place.refund&&place.gone,'taking a piece up refunds all of it and clears its tile',place);
  ok(place.stored===5,'what is built is saved in ll-town',place.stored);

  /* 3. lights add pools: the dark round a new lamp gets lighter */
  const lum=await p.evaluate(()=>{
    const T=__t.TWN; T.p.x=22.5; T.p.y=14.5; T.path=null;
    const shot=()=>{T.cx=null; T.lcx=null; T.lcy=null; __t.townFrame(0);
      const cv=document.getElementById('townCv'), k=T.k/T.dpr, c=cv.getContext('2d');
      /* the two tiles left of (3,15), in device pixels */
      const x0=Math.round((1*16-T.lcx)*T.k), y0=Math.round((15*16-T.lcy)*T.k), w=Math.round(32*T.k), h=Math.round(16*T.k);
      const d=c.getImageData(x0,y0,w,h).data; let s=0; for(let i=0;i<d.length;i+=4)s+=.2126*d[i]+.7152*d[i+1]+.0722*d[i+2]; return s/(d.length/4);};
    const off=shot(); const r=__t.townPlace('lamp',3,15); const on=shot();
    const light=__t.townArt().lights.some(L=>L.r===__t.TOWN_DECOS.lamp.light);
    __t.townTakeUp(__t.townDecoAt(3,15));
    return {off,on,r,light};
  });
  ok(lum.r===''&&lum.light&&lum.on>lum.off*1.6,'a street-lamp carves a pool of light: the ground beside it brightens',lum);

  /* 4. graves: defeat names the taker; the last 12 without a stone are kept, the oldest let go */
  const gr=await p.evaluate(()=>new Promise(res=>{
    __t.townClose();
    localStorage.removeItem('ll-town'); __t.townReset(); const D=__t.townData(); D.res={timber:0,iron:40,tallow:0,curios:0}; __t.townSave();
    __t.newRun('whaler',0); __t.run.floor=3; __t.F.wave=3; __t.run.oil=2;
    const seed0=__t.run.seed;
    __t.lampHit({type:'boss',def:{oil:99,boss:true}});
    const g0=JSON.parse(JSON.stringify(__t.townData().graves));
    setTimeout(()=>{
      const twice=__t.graveAdd();
      const seeds=[seed0];
      for(let i=0;i<12;i++){__t.newRun('lamplighter',0); seeds.push(__t.run.seed); __t.graveAdd();}
      const G=__t.townData().graves, stored=JSON.parse(localStorage.getItem('ll-town')).graves;
      document.querySelector('#mActions button:last-child').click();
      res({g0,seed0,twice,n:G.length,ns:G.map(g=>g.n),stored:stored.length,words:__t.graveWords(g0[0]),seeds});
    },1000);
  }));
  ok(gr.g0.length===1&&gr.g0[0].kit==='whaler'&&gr.g0[0].floor===4&&gr.g0[0].wave===3&&gr.g0[0].foe==='boss'&&gr.g0[0].seed===gr.seed0,'defeat keeps a grave: who, floor, wave, the taker and the seed',gr.g0);
  ok(/^Floor 4, wave 3\. Taken by the Keeper Below on the [A-Z][a-z]+-[A-Z][a-z]+ stair\.$/.test(gr.words),'the epitaph reads as the runbook says',gr.words);
  ok(gr.twice===null,'a run leaves one grave, never two',gr.twice);
  ok(gr.n===12&&gr.ns[0]===2&&gr.ns[11]===13&&gr.stored===12,'the last 12 deaths are kept; the oldest is let go',gr);

  /* 5. a headstone carries the oldest waiting grave; the button and the stone read it, with that stair's code */
  const hs=await p.evaluate(()=>{
    __t.townOpen(); const T=__t.TWN; T.p.x=12; T.p.y=14; T.path=null;
    const oldest=__t.gravesWaiting()[0];
    const r=__t.townPlace('stone',8,15), d=__t.townDecoAt(8,15);
    const waiting=__t.gravesWaiting().length;
    /* thirteen more deaths: the stone's own grave is kept all the same */
    for(let i=0;i<13;i++){__t.newRun('lamplighter',0); __t.graveAdd();}
    __t.townOpen(); T.p.x=8.5; T.p.y=16.5; T.path=null; __t.townFrame(1/30);
    const act=document.getElementById('townAct'), btn={hidden:act.hidden,txt:act.textContent};
    act.click();
    const title=document.getElementById('mTitle').textContent, copy=(document.querySelector('#mBody [data-seedcopy]')||{}).dataset;
    document.querySelector('#mActions button').click();
    const kept=__t.townData().graves.some(g=>g.n===d.g);
    /* lifted and stored (Expansion 4, step 1), it keeps its name; salvaged, its grave waits again */
    __t.townBuildSet(true); __t.townBuildTap(8,15); const lifted=!!__t.TWN.lift; __t.bldStow();
    const storedKeeps=!__t.gravesWaiting().some(g=>g.n===d.g)&&__t.bldStored('stone').some(e=>e.g===d.g);
    __t.bldSalvage('stone'); const back=__t.gravesWaiting().some(g=>g.n===d.g);
    __t.townBuildSet(false);
    return {r,bound:d&&d.g===oldest.n,waiting,btn,title,copy:copy&&copy.seedcopy,code:__t.stairCode(oldest.seed),kept,back,lifted,storedKeeps};
  });
  ok(hs.r===''&&hs.bound&&hs.waiting===11,'a headstone binds the oldest grave that has no stone',hs);
  ok(!hs.btn.hidden&&hs.btn.txt==='Read the headstone'&&hs.title==='Here lies Ambrose Fenn','standing by it, the button reads it',hs);
  ok(hs.copy===hs.code,'the epitaph shows its own stair\'s code to copy',hs);
  ok(hs.kept,'a grave with a stone is kept past the 12',hs);
  ok(hs.lifted&&hs.storedKeeps,'a headstone lifted and stored keeps the name it carries',hs);
  ok(hs.back,'a headstone salvaged gives its grave back to wait',hs);

  /* 6. the real UI: Build, a chip, a tap on the canvas, and the tip; then a tap takes it up */
  const ui=await p.evaluate(()=>{
    localStorage.setItem('ll-tut',JSON.stringify({walk:'done',seen:['town','townhaul'],off:false}));
    const T=__t.TWN; T.p.x=12; T.p.y=14; T.path=null; T.cx=null; __t.townFrame(1/30);
    document.getElementById('townBuild').click();
    const card=!document.getElementById('townCardWrap').hidden&&document.querySelector('#townCard b').textContent;
    document.getElementById('townCard').click();
    const tray=!document.getElementById('townTray').hidden, chips=document.querySelectorAll('#townTrow [data-deco]').length;
    const label=document.getElementById('townBuild').textContent;
    document.querySelector('#townTrow [data-deco="cobble"]').click();
    const msg=document.getElementById('townTmsg').textContent;
    const k=T.k/T.dpr; return {card,tray,chips,label,msg,x:((14*16+8)-T.lcx)*k,y:((14*16+8)-T.lcy)*k,iron:__t.townData().res.iron};
  });
  ok(ui.card==='Build'&&ui.tray&&ui.chips===7&&ui.label==='Done','Build opens the tray and teaches it on a card',ui);
  ok(/Wet Cobblestone · 2 iron/.test(ui.msg),'choosing a chip names it and its cost',ui.msg);
  await p.mouse.click(ui.x,ui.y); await p.waitForTimeout(80);
  const tap=await p.evaluate(()=>({at:(__t.townDecoAt(14,14)||{}).id,iron:__t.townData().res.iron}));
  ok(tap.at==='cobble'&&tap.iron===ui.iron-2,'a tap on the canvas lays the chosen piece where it lands',{tap,ui});
  /* Expansion 4, step 1 changed this on purpose: a tap on a piece lifts it (nothing is refunded); Store puts it away, and Salvage
     in Storage gives back all it cost */
  await p.mouse.click(ui.x,ui.y); await p.waitForTimeout(80);
  const tap2=await p.evaluate(()=>{const o={lift:!!__t.TWN.lift,at:__t.townDecoAt(14,14),iron:__t.townData().res.iron,msg:document.getElementById('townTmsg').textContent};
    document.getElementById('townStow').click(); document.querySelector('#townTools [data-tab="store"]').click();
    document.querySelector('#townTrow [data-stored="cobble"]').click(); document.getElementById('townSalvage').click();
    o.iron2=__t.townData().res.iron; o.msg2=document.getElementById('townTmsg').textContent; o.left=__t.bldStored().length;
    document.querySelector('#townTools [data-tab="pieces"]').click(); return o;});
  ok(tap2.lift&&!tap2.at&&tap2.iron===ui.iron-2&&/lift the Wet Cobblestone/.test(tap2.msg),'a tap on a piece lifts it',tap2);
  ok(tap2.iron2===ui.iron&&/salvage the Wet Cobblestone: 2 iron back/.test(tap2.msg2)&&tap2.left===0,'stored, then salvaged, it gives back all it cost',tap2);

  /* 7. what was built survives a reload: the paths are back in the ground, the solids block */
  await p.evaluate(()=>{__t.townData().res.timber=10; __t.townPlace('board',14,14); __t.townPlace('fence',15,15); __t.townClose();});
  await p.reload(); await p.waitForTimeout(400);
  const rl=await p.evaluate(()=>{
    __t.townOpen(); const A=__t.townArt(), g=A.ground.getContext('2d').getImageData(14*16,14*16,16,16).data, g0=A.ground0.getContext('2d').getImageData(14*16,14*16,16,16).data;
    let diff=0; for(let i=0;i<g.length;i++)if(g[i]!==g0[i])diff++;
    const n=__t.townData().decos.length; __t.townClose();
    return {diff,fence:__t.townSolid(15,15),board:__t.townDecoAt(14,14)&&__t.townDecoAt(14,14).id,n};
  });
  ok(rl.diff>0&&rl.fence&&rl.board==='board','after a reload, laid paths repaint the ground and built pieces stand',rl);

  /* 8. developer mode builds, takes up and buries without writing ll-town (rule 24) */
  const dev=await p.evaluate(()=>{
    const before=localStorage.getItem('ll-town');
    __t.setDev(true); __t.townReset();
    __t.townOpen(); const T=__t.TWN; T.p.x=12; T.p.y=14;
    __t.townData().res.iron=50; __t.townData().res.tallow=10;
    const a=__t.townPlace('lamp',4,15)||__t.townPlace('fence',4,15);
    __t.townTakeUp(__t.townDecoAt(14,14)); __t.newRun('lamplighter',0); __t.graveAdd(); __t.townClose();
    const after=localStorage.getItem('ll-town');
    __t.setDev(false); __t.townReset(); __t.townOpen(); const back=__t.townDecoAt(14,14)&&__t.townDecoAt(14,14).id, lamp=__t.townDecoAt(4,15); __t.townClose();
    return {same:before===after,a,back,lamp};
  });
  ok(dev.same&&dev.back==='board'&&!dev.lamp,'developer mode never writes ll-town, and the real town comes back as it was',dev);

  /* 9. the rules line teaches build mode and headstones */
  const rules=await p.evaluate(()=>document.getElementById('rulesList').textContent);
  ok(/Build spends it on the square/.test(rules)&&/Mossy Headstone/.test(rules),'the Saltmouth rules line teaches Build and headstones',rules.slice(0,200));

  for(const f of fails)console.log('FAIL '+f);
  console.log(fails.length?fails.length+' failed':'townbuild ok');
  await b.close(); process.exit(fails.length?1:0);
})();
