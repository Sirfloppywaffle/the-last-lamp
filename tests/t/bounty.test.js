// The Ledger's bounties (Expansion 5, step 2; expansion/EXPANSION5_RUNBOOK.md §5): up to three small tasks, each done within one
// descent. The gates (none under 10 in the Grimoire, then one, two at 20, three at 30, and the tab says how far off the next is);
// draws name only creatures met and fit the Keeper carried; each kind counts from its hook; like a feat, one done is fulfilled when
// the haul comes up and claimed by hand at the Ledger, never paid by itself (Criss, after playing step 1, #187), and its place is
// drawn again; a gold banner between waves; nothing on a replay; torn up once a visit for 5 tallow; old saves load; developer mode
// writes nothing.
const {chromium}=require('playwright');
const fails=[]; const ok=(c,m,d)=>{if(!c)fails.push(m+(d!==undefined?' '+JSON.stringify(d).slice(0,600):''));};
(async()=>{
  const b=await chromium.launch(); const p=await b.newPage({viewport:{width:412,height:860}});
  const errs=[]; p.on('pageerror',e=>errs.push(String(e)));
  await p.goto('file://'+process.argv[2]); await p.waitForTimeout(400);
  await p.evaluate(()=>{
    window.__clean=()=>{for(const k of ['ll-town','ll-meta','ll-codex','ll-save-v2'])localStorage.removeItem(k); __t.townReset(); __t.setDev(false); const C=__t.codex(); C.foes.clear(); C.relics.clear(); C.bound.clear();};
    /* the Grimoire holding n things: creatures first, then relics */
    window.__book=n=>{const T=__t, C=T.codex(); C.foes.clear(); C.relics.clear(); const fs=Object.keys(T.FOES).filter(k=>!T.FOES[k].bound), rs=Object.keys(T.RELICS);
      for(let i=0;i<n;i++){if(i<fs.length)C.foes.add(fs[i]); else C.relics.add(rs[i-fs.length]);}};
    window.__fresh=(kit,fl,o)=>{const T=__t; T.newRun(kit||'lamplighter',(o&&o.depth)||0,Object.assign({seed:7},o||{})); T.run.floor=fl||0; T.beginFloor(null); T.setP(false); T.run.ess=9999;};
    /* the town holding these bounties (live), and a run carrying them down */
    window.__post=list=>{const D=__t.townData(); D.ledger={done:{},claimed:{},bty:list.map((x,i)=>Object.assign({id:i+1},x)),btyN:list.length}; D.ledger=JSON.parse(JSON.stringify(D.ledger));};
    window.__c=k=>{const b=__t.run.bty.find(x=>x.k===k); return b?b.c:-1;};
  });

  /* 1. the gates, and the tab says how far off the next one is */
  const gate=await p.evaluate(()=>{const T=__t, o={}; __clean();
    o.g=[0,9,10,19,20,29,30,40].map(n=>{__book(n); return [T.lodgeSpines().n,T.btyGate()];});
    o.spines=T.BTY_GATES.join();
    __book(9); const D=T.townData(); o.fill9=T.btyFill(D).length;
    __book(14); o.fill14=T.btyFill(D).length; o.fillAgain=T.btyFill(D).length;
    __book(25); o.fill25=T.btyFill(D).length; o.live=T.btyLive().length;
    /* the card: its Bounties tab names the next gate */
    D.lodge.built=true; T.ledgerCard('bounties'); const txt=document.getElementById('mChoices').textContent;
    o.tab=/The third posts when the Grimoire holds 30; it holds 25/.test(txt); o.posted=document.querySelectorAll('[data-tear]').length; o.locked=/Posts when the Grimoire holds 30/.test(txt);
    T.closeModal();
    __clean(); __book(4); T.townData().lodge.built=true; T.ledgerCard('bounties'); o.none=/No bounty is posted yet\. The first comes when the Grimoire holds 10 things, creatures met and relics found\. It holds 4\./.test(document.getElementById('mChoices').textContent); T.closeModal();
    return o;});
  ok(gate.g.map(x=>x[1]).join()==='0,0,1,1,2,2,3,3'&&gate.g.every((x,i)=>x[0]===[0,9,10,19,20,29,30,40][i]),'no bounty under 10, one at 10, two at 20, three at 30',gate.g);
  ok(gate.fill9===0&&gate.fill14===1&&gate.fillAgain===0&&gate.fill25===1&&gate.live===2,'they post as the Grimoire fills, never past the gate',gate);
  ok(gate.tab&&gate.posted===2&&gate.locked,'the Bounties tab shows those posted, and how far off the next is',gate);
  ok(gate.none,'with none posted, the tab says how far off the first is',gate.none);

  /* 2. draws name only creatures met, and fit the Keeper carried */
  const draw=await p.evaluate(()=>{const T=__t, o={}; __clean();
    const C=T.codex(); ['crawler','gnasher','skitter'].forEach(k=>C.foes.add(k));
    const kinds={}, bad=[], seen=new Set();
    for(let i=0;i<400;i++){const L={bty:[]}, kit=['lamplighter','whaler','occultist','galvanist','bellringer'][i%5];
      for(let j=0;j<3;j++){const b=T.btyDraw(L,kit); if(!b){bad.push('none'); continue;} kinds[b.k]=(kinds[b.k]||0)+1; seen.add(b.k+':'+b.arg+':'+kit);
        if(b.k==='kill'&&!C.foes.has(b.arg))bad.push(b.arg);
        if(b.k==='bind'&&b.arg!=='gnasher')bad.push('bind '+b.arg);
        if(b.k==='slip'&&b.arg!==(kit==='occultist'?3:2))bad.push('slip '+kit);}
      const keys=L.bty.map(b=>b.k+':'+b.arg); if(new Set(keys).size!==keys.length)bad.push('twice '+keys);
      if(new Set(L.bty.map(b=>b.k)).size!==L.bty.length)bad.push('kind twice '+keys);}
    o.bad=bad.slice(0,8); o.kinds=Object.keys(kinds).sort().join();
    o.names=[T.btyName({k:'bind',arg:'gnasher',n:1,kit:'galvanist'}),T.btyName({k:'bind',arg:'wretch',n:1,kit:'whaler'}),T.btyName({k:'bind',arg:'keeper',n:1,kit:'occultist'}),
      T.btyName({k:'kill',arg:'gnasher',n:8}),T.btyName({k:'kill',arg:'elite',n:1}),T.btyName({k:'slip',arg:3,n:1}),T.btyName({k:'slip',arg:2,n:1}),T.btyName({k:'wards',arg:5,n:1})];
    /* the Keeper Below's soul only once the Keeper Below is met */
    C.foes.add('boss'); o.keeper=T.BOUNTIES.bind.args('whaler',C).includes('keeper');
    /* the pay: 10 to 25 of one material, never curios */
    const pays=[]; for(const k in T.BOUNTIES)for(const a of T.BOUNTIES[k].args('lamplighter',{foes:new Set(Object.keys(T.FOES))}).concat(k==='slip'?[3]:[]))pays.push(T.btyPay({k,arg:a}));
    o.pay=pays.every(p=>Object.keys(p).length===1&&!p.curios&&Object.values(p)[0]>=10&&Object.values(p)[0]<=25);
    return o;});
  ok(!draw.bad.length,'every draw names a creature met, fits the Keeper, and never repeats a kind',draw.bad);
  ok(draw.kinds==='bind,calm,descent,kill,slip,wards','all six kinds are drawn',draw.kinds);
  ok(draw.names.join('|')==='Capture a Gnasher|Bind an Ichor Wretch|Bind the Keeper Below|Slay 8 Gnashers|Slay a Drowned Choirmaster|Break a wave at Leaning madness|Break a wave at Slipping madness or deeper|Clear a floor with 5 wards or fewer','each reads plainly, the Galvanist capturing what the others bind',draw.names);
  ok(draw.keeper,'the Keeper\'s soul can be asked for once the Keeper Below is met',draw.keeper);
  ok(draw.pay,'each pays 10 to 25 of one material, never curios',draw.pay);

  /* 3. each kind counts from its hook */
  const hook=await p.evaluate(()=>{const T=__t, o={}; __clean();
    const all=[{k:'kill',arg:'crawler',n:60},{k:'kill',arg:'gnasher',n:8},{k:'wards',arg:4},{k:'slip',arg:2},{k:'bind',arg:'gnasher'},{k:'calm',arg:0},{k:'descent',arg:0}];
    __post(all); __fresh(); o.copied=T.run.bty.map(b=>b.k+':'+b.c).join();
    const foe=t=>({dead:false,hp:0,x:2,y:2,gate:0,d:1,type:t,def:Object.assign({},T.FOES[t])});
    for(let i=0;i<3;i++)T.killFoe(foe('crawler')); T.killFoe(foe('skitter'));
    o.kill=[__c('kill'),T.run.bty[1].c];
    T.bindSoul({x:2,y:2,type:'watcher',t:5,max:5}); o.bindOther=__c('bind'); T.bindSoul({x:2,y:2,type:'gnasher',t:5,max:5}); o.bind=__c('bind');
    /* a wave broken calm, then one at Slipping */
    T.F.phase='wave'; T.F.wave=1; T.waveCleared(); o.slipCalm=__c('slip');
    __post([{k:'slip',arg:2},{k:'slip',arg:3}]); __fresh(); T.F.phase='wave'; T.F.wave=1; T.run.madPen=40;
    ['gnasher','watcher','wretch'].forEach((ty,i)=>T.F.towers.push({kind:'horror',type:ty,id:7000+i,c:0,r:i,x:.5,y:i+.5,br:{},cd:9,ang:0}));
    o.tier=T.madTier(); T.waveCleared(); o.slip=T.run.bty.map(b=>b.c).join();
    /* a floor cleared with few wards beside the path (the light not counted), and one with too many */
    __post([{k:'wards',arg:4},{k:'calm',arg:0}]); __fresh();
    for(let i=0;i<4;i++)T.F.towers.push({kind:'ward',type:'harpoon',id:8000+i,c:i,r:0,x:i+.5,y:.5,br:{}});
    for(let i=0;i<6;i++)T.F.towers.push({kind:'ward',type:'candle',id:8100+i,c:i,r:1,x:i+.5,y:1.5,br:{}});
    o.nw=T.btyWards(); T.floorCleared(); o.wards=__c('wards'); o.calm=__c('calm');
    __post([{k:'wards',arg:4},{k:'calm',arg:0}]); __fresh();
    for(let i=0;i<5;i++)T.F.towers.push({kind:'ward',type:'harpoon',id:8200+i,c:i,r:0,x:i+.5,y:.5,br:{}});
    /* a wave called early on this floor: not calm */
    T.F.phase='wave'; T.F.wave=1; T.F.queue=[]; T.callWave(); o.early=T.run.earlyOn===T.run.floor;
    T.F.foes.length=0; T.F.queue=[]; T.floorCleared(); o.wards5=__c('wards'); o.calmEarly=__c('calm');
    /* a descent walked */
    __post([{k:'descent',arg:0}]); __fresh(null,1); T.DESC.active=true; T.DESC.k='carry'; T.run.descent={k:'carry'}; T.descentFinish({woke:0,spilt:0}); o.descent=__c('descent');
    return o;});
  ok(hook.copied==='kill:0,kill:0,wards:0,slip:0,bind:0,calm:0,descent:0','a descent carries the bounties down, counted from nothing',hook.copied);
  ok(hook.kill[0]===3&&hook.kill[1]===0,'a kill counts for its own creature only',hook.kill);
  ok(hook.bindOther===0&&hook.bind===1,'a horror bound counts for its own kind only',hook);
  ok(hook.slipCalm===0&&hook.tier>=2&&hook.slip===(hook.tier>=3?'1,1':'1,0'),'a wave broken at Slipping counts; a calm one does not',hook);
  ok(hook.nw===4&&hook.wards===1&&hook.calm===1,'a floor cleared with four wards beside the path (candles not counted), no wave called early',hook);
  ok(hook.early&&hook.wards5===0&&hook.calmEarly===0,'five wards is too many, and a wave called early spoils the calm',hook);
  ok(hook.descent===1,'a descent walked counts',hook.descent);

  /* 4. fulfilled when the haul comes up, never paid by itself; claimed by hand, once; its place drawn again; the death screen and
     a banner between waves say so */
  const pay=await p.evaluate(()=>{const T=__t, o={}; __clean(); __book(12);
    __post([{k:'kill',arg:'crawler',n:60}]); __fresh();
    const ban=document.getElementById('trophyBanner'), shown=()=>{const v=ban.classList.contains('is-show')&&ban.classList.contains('is-ledger')?document.getElementById('trophyBannerB').textContent+'|'+document.getElementById('trophyBannerS').textContent:''; ban.classList.remove('is-show','is-ledger'); return v;};
    shown(); T.F.phase='wave'; T.F.wave=1;
    for(let i=0;i<60;i++)T.killFoe({dead:false,hp:0,x:2,y:2,gate:0,d:1,type:'crawler',def:Object.assign({},T.FOES.crawler)});
    T.ledgerWatch(); o.mid=shown();
    T.F.foes.length=0; T.F.queue=[]; T.waveCleared(); o.brk=shown(); T.F.phase='build'; T.ledgerWatch(); o.again=shown();
    o.told=T.run.bty[0].told===true; T.checkpoint(); o.toldSaved=JSON.parse(localStorage.getItem('ll-save-v2')).run.bty[0].told===true;
    o.line=T.ledgerLine(T.run);
    T.run.oil=0; T.defeat();
    const D=JSON.parse(localStorage.getItem('ll-town')||'{}'), L=D.ledger||{};
    o.res=D.res; o.bty=(L.bty||[]).map(b=>b.k+(b.done?':done':'')).join();
    o.day=/^\d{4}-\d\d-\d\d$/.test(((L.bty||[]).find(b=>b.done)||{}).done||'');
    /* a reload: nothing fulfilled twice */
    T.townReset(); o.twice=T.haulCredit(T.run); o.waitN=T.btyWaiting().length;
    o.lodgeWait=T.ledgerWaitN();
    /* claimed at the lectern: its pay, once */
    const id='b'+T.btyWaiting()[0].id, t0=T.townData().res.timber;
    o.c=T.ledgerClaim(id).map(g=>g.n).join(); o.c2=T.ledgerClaim(id).length; o.paid=T.townData().res.timber-t0;
    T.townReset(); o.after=[T.btyWaiting().length,T.btyLive().length,T.townData().ledger.btyPaid];
    /* feats and a bounty together on the death screen */
    __post([{k:'calm',arg:0}]); __fresh(); T.floorCleared(); o.mixed=T.ledgerLine(T.run);
    return o;});
  ok(pay.mid==='','no banner mid-wave',pay.mid);
  ok(pay.brk==='A bounty fulfilled|Slay 60 Crawlers'&&pay.again==='','as the wave breaks, a gold banner names the bounty, once',pay);
  ok(pay.told&&pay.toldSaved,'that it was told is kept across a reload',pay);
  ok(/Bounty fulfilled/.test(pay.line)&&/Slay 60 Crawlers\. 10 timber\./.test(pay.line)&&/Claim it at the Ledger/.test(pay.line),'the death screen names it in gold, and where to claim it',pay.line);
  ok(pay.res&&pay.res.timber===0&&pay.res.iron===0,'the haul pays only the haul (nothing, on a floor not cleared): the bounty waits to be claimed',pay.res);
  ok(/^kill:done,/.test(pay.bty)&&pay.bty.split(',').length===2&&!/,.*done/.test(pay.bty)&&pay.day,'fulfilled with the date, and its place drawn again as the haul comes up',pay.bty);
  ok(pay.twice===false&&pay.waitN===1&&pay.lodgeWait===1,'a reload fulfils nothing twice; it waits at the lectern',pay);
  ok(pay.c==='Slay 60 Crawlers'&&pay.c2===0&&pay.paid===10,'claimed once, for its pay',pay);
  ok(pay.after.join()==='0,1,1','claimed, it leaves the Ledger; one still posted; one counted as paid',pay.after);
  ok(/Fulfilled in the Ledger/.test(pay.mixed)&&/Clear the Cistern\. 20 timber\./.test(pay.mixed)&&/Bounty: Clear a floor without calling a wave early\. 10 iron\./.test(pay.mixed),'feats and bounties share the gold block, feats first',pay.mixed);

  /* 5. a replayed stair counts nothing; a bounty torn up while a run is down is not fulfilled by it */
  const rep=await p.evaluate(()=>{const T=__t, o={}; __clean(); __book(12);
    __post([{k:'calm',arg:0}]); __fresh('lamplighter',0,{replay:true}); o.carried=T.run.bty.length; T.floorCleared(); o.due=T.btyDue(T.run).length;
    T.haulCredit(T.run); o.done=T.btyWaiting().length;
    __post([{k:'calm',arg:0}]); __fresh(); T.floorCleared(); const D=T.townData(); D.ledger.bty=[]; o.gone=T.btyDue(T.run).length;
    return o;});
  ok(rep.carried===0&&rep.due===0&&rep.done===0,'a replayed stair carries and counts no bounty',rep);
  ok(rep.gone===0,'a bounty no longer posted is not fulfilled',rep.gone);

  /* 6. torn up once a visit, for 5 tallow, and another drawn in its place; on the card */
  const tear=await p.evaluate(()=>{const T=__t, o={}; __clean(); __book(30);
    const C=T.codex(); C.foes.add('crawler');
    T.townOpen(); const D=T.townData(); D.res={timber:0,iron:0,tallow:12,curios:0}; D.lodge.built=true;
    T.btyFill(D); o.live=T.btyLive().map(b=>b.k).sort().join();
    const first=T.btyLive()[0], k0=first.k+':'+first.arg;
    o.why0=T.btyTearWhy();
    const nb=T.btyTear(first.id); o.tore=!!nb&&nb!==true&&nb.k+':'+nb.arg!==k0; o.tallow=T.townData().res.tallow; o.n=T.btyLive().length;
    o.why1=T.btyTearWhy(); o.again=T.btyTear(T.btyLive()[0].id);
    /* the card: each posted bounty has its button, shut for the rest of the visit */
    T.ledgerCard('bounties'); o.btns=[...document.querySelectorAll('[data-tear]')].map(x=>x.disabled).join(); o.cardWhy=/torn one up this visit/.test(document.getElementById('mChoices').textContent); T.closeModal();
    T.townClose(); T.townOpen(); o.why2=T.btyTearWhy();
    /* too little tallow */
    T.townData().res.tallow=4; o.why3=T.btyTearWhy();
    /* torn up from the card */
    T.townData().res.tallow=10; T.ledgerCard('bounties'); const ids0=T.btyLive().map(b=>b.id).join(); document.querySelector('[data-tear]').click();
    o.clicked=[T.townData().res.tallow,T.btyLive().map(b=>b.id).join()!==ids0,/Torn up\. The Ledger posts another/.test(document.getElementById('mChoices').textContent)];
    T.closeModal(); T.townClose();
    return o;});
  ok(tear.live.split(',').length===3&&tear.why0==='','three posted at 30; one can be torn up',tear);
  ok(tear.tore&&tear.tallow===7&&tear.n===3,'torn up for 5 tallow, and another of a different kind drawn',tear);
  ok(/this visit/.test(tear.why1)&&tear.again===false,'only once a visit',tear);
  ok(tear.btns==='true,true,true'&&tear.cardWhy,'the card shuts the buttons for the rest of the visit, and says why',tear);
  ok(tear.why2===''&&/costs 5 tallow/.test(tear.why3),'the next visit it can be torn up again, if there is tallow for it',tear);
  ok(tear.clicked[0]===5&&tear.clicked[1]&&tear.clicked[2],'Tear it up on the card does it, and says what was drawn',tear.clicked);

  /* 6b. Saltmouth: the bounties' tip once the first is posted, and the card when one waits */
  const town=await p.evaluate(()=>{const T=__t, o={}; __clean(); __book(9);
    T.tutSet({walk:true,seen:Object.keys(T.TIPS).filter(k=>k!=='bounty'),off:false});
    T.townOpen(); T.townShowTip(); o.before=T.TWN.card;
    __book(10); T.townHud(); o.posted=T.btyLive().length; o.tip=T.TWN.card; o.text=document.getElementById('townCard').textContent;
    T.tutSet({walk:true,seen:Object.keys(T.TIPS),off:false});
    const D=T.townData(); D.ledger.bty.push({id:99,k:'calm',arg:0,n:1,kit:null,done:'2026-11-26'}); D.ledger.done={cistern:'2026-11-26'};
    T.TWN.ledgerSaid=false; T.townShowTip(); o.wait=document.getElementById('townCard').textContent;
    T.townClose(); T.tutReset();
    return o;});
  ok(town.before!=='bounty'&&town.posted===1&&town.tip==='bounty'&&/Bounties/.test(town.text),'the first bounty posts in the town, with its tip',town);
  ok(/A feat and a bounty wait in the Ledger/.test(town.wait),'Saltmouth\'s card counts feats and bounties waiting',town.wait);

  /* 7. old saves load: a town from before bounties, junk in its list, and a run saved without run.bty */
  const old=await p.evaluate(()=>{const T=__t, o={}; __clean();
    localStorage.setItem('ll-town',JSON.stringify({v:2,visits:3,ledger:{done:{cistern:'2026-11-01'}}})); T.townReset();
    const L=T.townData().ledger; o.fresh=JSON.stringify([L.bty,L.btyN,L.btyPaid,L.torn,Object.keys(L.done).join()]);
    o.junk=T.ledgerFix({bty:[{k:'nope',arg:1},{k:'kill',arg:'dragon'},{k:'wards',arg:99},{k:'kill',arg:'crawler',n:3},{k:'calm',arg:0,id:5},{k:'calm',arg:0,id:5},{k:'slip',arg:2},{k:'descent',arg:0},{k:'bind',arg:'gnasher',done:'2026-11-02'}]});
    __fresh('whaler',1); T.F.phase='build'; T.checkpoint(); const sv=JSON.parse(localStorage.getItem('ll-save-v2')); delete sv.run.bty; delete sv.run.earlyOn;
    T.resumeFrom(sv); T.killFoe({dead:false,hp:0,x:2,y:2,gate:0,d:1,type:'crawler',def:Object.assign({},T.FOES.crawler)}); T.floorCleared();
    o.run=[T.btyDue(T.run).length,T.ledgerLine(T.run).indexOf('Bount')<0];
    return o;});
  ok(old.fresh==='[[],0,0,-1,"cistern"]','an old ll-town loads with no bounties and its feats kept',old.fresh);
  ok(old.junk.bty.map(b=>b.k+':'+b.id+':'+b.n+(b.done?':d':'')).join()==='kill:1:60,calm:5:1,calm:6:1,bind:7:1:d'&&old.junk.btyN===7,'unknown bounties are dropped, three live at most, the count from the table, ids made whole',old.junk);
  ok(old.run[0]===0&&old.run[1],'a run saved before bounties resumes carrying none',old.run);

  /* 8. developer mode shows them and writes nothing */
  const dev=await p.evaluate(()=>{const T=__t, o={}; __clean(); T.setDev(true);
    T.townOpen(); const D=T.townData(); D.lodge.built=true;
    T.ledgerCard('bounties'); o.posted=document.querySelectorAll('[data-tear]').length; T.closeModal();
    __fresh(); o.carried=T.run.bty.length; T.floorCleared(); T.haulCredit(T.run);
    o.town=localStorage.getItem('ll-town'); o.meta=localStorage.getItem('ll-meta'); T.setDev(false);
    return o;});
  ok(dev.posted===3&&dev.carried===3,'developer mode posts all three and carries them down',dev);
  ok(dev.town===null&&dev.meta===null,'developer mode writes no town and no meta',dev);

  ok(!errs.length,'no page errors',errs);
  await b.close();
  if(fails.length){fails.forEach(f=>console.log('FAIL '+f)); process.exit(1);}
  console.log('ok bounty');
})();
