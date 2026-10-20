// The Many-Mouthed (#83), the third patron: its pack, dread, its three creatures, Claimed, and every offering.
const {chromium}=require('playwright');
const fails=[]; const ok=(c,m,d)=>{if(!c)fails.push(m+(d!==undefined?' '+JSON.stringify(d):''));};
(async()=>{
  const b=await chromium.launch(); const p=await b.newPage({viewport:{width:412,height:860}});
  const errs=[]; p.on('pageerror',e=>errs.push(String(e)));
  await p.goto('file://'+process.argv[2]); await p.waitForTimeout(300);
  await p.evaluate(()=>{
    window.fresh=(kit)=>{const T=__t; T.newRun(kit||'lamplighter',0); T.setP(false); T.run.ess=3000; window.devNoDark=false; T.F.towers=T.F.towers.filter(t=>t.kind!=='horror'); return T;};
    window.field=(type,i,x,y)=>{const T=__t, t={kind:'horror',type,id:9100+i,c:0,r:i,x:x===undefined?.5:x,y:y===undefined?i+.5:y,br:{},cd:9,ang:0,tgt:'first',invested:0,fresh:0}; T.F.towers.push(t); return t;};
    window.ward=(type,i,x,y)=>{const T=__t, t={kind:'ward',type,id:9300+i,c:Math.floor(x||0),r:Math.floor(y||0),x:x||.5,y:y||.5,br:{},cd:9,ang:0,tgt:'first',invested:0,fresh:0}; T.F.towers.push(t); return t;};
    window.holdWave=()=>{const T=__t; T.F.phase='wave'; T.F.queue=[{t:9999,type:'crawler',gate:0}];};
    window.clearFoes=()=>{const T=__t; T.F.foes.forEach(e=>e.dead=true); T.update(.001);};
  });

  /* the offers: each kit is offered at least four that need nothing, and only its own kit offering */
  const offers=await p.evaluate(()=>{const out={};
    for(const k of ['lamplighter','whaler','occultist','galvanist','bellringer']){const T=fresh(k); T.run.roster={};
      const s=new Set(); for(let i=0;i<300;i++)(T.offerSet('mouths')||[]).forEach(x=>s.add(x));
      const all=[...s]; out[k]={gen:all.filter(x=>!T.OFFERINGS[x].kit).length, own:all.filter(x=>T.OFFERINGS[x].kit), all};}
    return out;});
  console.log(JSON.stringify(offers));
  for(const k of Object.keys(offers))ok(offers[k].gen>=4,k+' is offered at least four that need nothing',offers[k].all);
  ok(offers.whaler.own.length===0&&offers.galvanist.own.length===0&&offers.bellringer.own.length===0,'with no horror bound, the horror kit offerings wait',offers);
  ok(offers.lamplighter.own.join()==='mouth_signal'&&offers.occultist.own.join()==='mouth_corpse','each kit only sees its own',[offers.lamplighter.own,offers.occultist.own]);
  ok(!offers.galvanist.all.includes('famine')&&!offers.bellringer.all.includes('first_bite'),'Swallowed Sigils never for the Galvanist; no candle, no Dark Bites First',offers);

  /* the pack it sends, for every board in the table, at each tier */
  const pack=await p.evaluate(()=>{const out={};
    for(const tier of [1,3,5])for(const w of [0,3,6])for(const h of [0,1,3]){const T=fresh(); T.F.towers=[]; T.run.att={mouths:tier};
      for(let i=0;i<w;i++)ward('harpoon',i,i+.5,.5);
      for(let i=0;i<h;i++)field('gnasher',i);
      ward('salt',90,1.5,1.5);
      const pk=T.mouthPack(), n=t=>pk.filter(x=>x===t).length; out[tier+'|'+w+'|'+h]=[n('gibberer'),n('gorger'),n('husk')].join(',');}
    return out;});
  console.log(JSON.stringify(pack));
  const want={'1|0|0':'1,0,0','1|3|0':'2,0,0','1|6|0':'3,0,0','1|0|1':'0,1,0','1|3|1':'1,1,0','1|6|1':'2,1,0','1|0|3':'0,2,0','1|3|3':'1,2,0','1|6|3':'2,2,0',
    '3|0|0':'2,0,0','3|3|0':'3,0,0','3|6|0':'4,0,0','3|0|1':'0,2,0','3|3|1':'2,1,0','3|6|1':'3,1,0','3|0|3':'0,3,0','3|3|3':'1,3,0','3|6|3':'2,3,0'};
  for(const k of Object.keys(want)){ok(pack[k]===want[k],'the pack for tier|wards|horrors '+k,[pack[k],want[k]]); if(k[0]==='3'){const c='5'+k.slice(1); ok(pack[c]===want[k].replace(/0$/,'1'),'Claimed adds a Choir-Husk '+c,pack[c]);}}

  /* a wave carries the pack; what it sends leaves nothing, and its creatures keep to their numbers */
  const wave=await p.evaluate(()=>{const T=fresh('occultist'), out={}; T.run.att={mouths:1}; T.F.towers=[];
    T.startWave(); out.queued=T.F.queue.filter(q=>q.type==='gibberer'||q.type==='gorger').length; T.F.queue=[];
    const ess=T.run.ess, bodies=T.run.corpses.list.length, souls=T.F.souls.length;
    for(const k of ['gibberer','gorger','husk']){const e=T.spawnFoe(k,0,2); T.update(.001); T.hurt(e,9999);}
    out.nothing=T.run.ess===ess&&T.run.corpses.list.length===bodies&&T.F.souls.length===souls;
    out.hp={gib:T.spawnFoe('gibberer',0,1).max,gorg:T.spawnFoe('gorger',0,1).max,husk:T.spawnFoe('husk',0,1).max};
    clearFoes(); return out;});
  console.log(JSON.stringify(wave));
  ok(wave.queued===1,'Noticed, a bare board: one Gibberer climbs with the wave',wave);
  ok(wave.nothing,'its creatures leave no essence, bones or sigils',wave);
  ok(wave.hp.gib===25&&wave.hp.gorg===64&&wave.hp.husk===109,'floor one: Gibberer 25, Gorger 64, Choir-Husk 109',wave.hp);

  /* dread: Watched's 3 and each Gibberer's 2 (6 at most) count toward the tiers, but never toward bound madness */
  const dr=await p.evaluate(()=>{const T=fresh('occultist'), out={}; T.run.att={mouths:3};
    field('gnasher',0); field('gnasher',1);
    out.bound=T.boundMadness(); out.d=T.dread(); out.mad=T.madness(); out.tier=T.madTier(); out.btier=T.boundMadTier();
    for(let i=0;i<5;i++)T.spawnFoe('gibberer',0,1+i*.3);
    out.d5=T.dread(); out.tier5=T.madTier(); out.boost=+T.horrorBoost().toFixed(2);
    clearFoes(); return out;});
  console.log(JSON.stringify(dr));
  ok(dr.bound===6&&dr.d===3&&dr.mad===9,'two Gnashers are 6 madness; Watched adds 3 dread',dr);
  ok(dr.d5===9&&dr.tier5===3,'five Gibberers add 6 dread at most: 15, Leaning',dr);
  ok(dr.btier===1&&Math.abs(dr.boost-1.2)<.01,'the Occultist is fed by his paid madness only (Whispers), not by dread',dr);

  /* a Gibberer's chatter slows the wards near it; Open Your Ears quickens them from Whispers */
  const cd=await p.evaluate(()=>{const T=fresh(), out={}; const w={x:5.5,y:5.5,kind:'ward'};
    out.none=T.sunCd(w); const g=T.spawnFoe('gibberer',0,1); g.x=6; g.y=5.5; T.mouthsGather(); out.near=T.sunCd(w); g.x=12; out.far=T.sunCd(w);
    clearFoes(); T.mouthsGather();
    T.run.offs=['openears']; out.earsDread=T.dread(); out.calm=T.sunCd(w); field('gnasher',0); out.whispers=T.sunCd(w);
    return out;});
  console.log(JSON.stringify(cd));
  ok(cd.none===1&&cd.near===1.25&&cd.far===1,'a ward within a Gibberer’s chatter waits a quarter longer',cd);
  ok(cd.earsDread===4&&cd.calm===1&&cd.whispers===.8,'Open Your Ears: 4 dread, and from Whispers your wards reload 20% faster',cd);

  /* the Gorger: horrors hurt it less; it dazes a horror and heals; Watched, it snuffs a candle */
  const gorge=await p.evaluate(()=>{const T=fresh(), out={}; T.run.att={mouths:1};
    const e=T.spawnFoe('gorger',0,2); T.update(.001); const h0=e.hp; T.hurt(e,20,'horror'); out.taken=+(h0-e.hp).toFixed(2);
    const t=field('gnasher',0,e.x+1,e.y); t.dazeT=0; e.latchCd=0; const h1=e.hp; T.gorgerLatch(e,.01); out.dazed=t.dazeT; out.healed=e.hp-h1; out.rest=e.latchCd;
    T.F.towers=T.F.towers.filter(x=>x!==t); const c=ward('candle',1,e.x+1,e.y); e.latchCd=0; T.gorgerLatch(e,.01); out.noticedSnuff=!!(c.snuffT>0);
    T.run.att={mouths:3}; e.latchCd=0; T.gorgerLatch(e,.01); out.watchedSnuff=c.snuffT;
    clearFoes(); return out;});
  console.log(JSON.stringify(gorge));
  ok(gorge.taken===13,'a Gorger takes 35% less from horrors',gorge);
  ok(gorge.dazed===2&&gorge.healed===8&&gorge.rest===4.5,'its tongue dazes a horror 2 seconds, heals it 8, and rests 4.5',gorge);
  ok(!gorge.noticedSnuff&&gorge.watchedSnuff===2,'only once Watched does it snuff a candle',gorge);

  /* the Choir-Husk veils what walks near it, never a boss, never itself */
  const husk=await p.evaluate(()=>{const T=fresh(), out={}; const L=T.F.paths[0].len;
    const d=L-2.2; const h=T.spawnFoe('husk',0,d), c=T.spawnFoe('crawler',0,d+.3), bs=T.spawnFoe('boss',0,d+.6);
    T.update(.001); T.mouthsGather();
    out.husk=T.canSee(h); out.crawler=T.canSee(c); out.boss=T.canSee(bs);
    h.dead=true; T.mouthsGather(); out.after=T.canSee(c);
    clearFoes(); return out;});
  console.log(JSON.stringify(husk));
  ok(husk.husk&&!husk.crawler&&husk.boss,'in lamplight, the Husk and a boss are seen; the crawler beside it is veiled',husk);
  ok(husk.after,'kill the Husk and the veil lifts',husk);

  /* Claimed: bindings may break from Whispers; Leaning never hastens a boss */
  const claim=await p.evaluate(()=>{const T=fresh(), out={};
    field('gnasher',0); field('gnasher',1); out.plain=T.slipChance();
    T.run.att={mouths:5}; out.claimedWhispers=T.slipChance();
    field('gnasher',2); out.claimedSlip=T.slipChance();
    T.F.towers=T.F.towers.filter(t=>t.kind!=='horror'); T.run.att={}; field('keeper',0); field('keeper',1);
    const bs=T.spawnFoe('boss',0,1), cr=T.spawnFoe('crawler',0,1); bs.spawnT=99; T.update(.001); const b0=bs.d, c0=cr.d; T.update(.1);
    out.lean=T.madTier(); out.bossSpd=+((bs.d-b0)/.1).toFixed(3); out.crawlSpd=+((cr.d-c0)/.1).toFixed(3);
    clearFoes(); return out;});
  console.log(JSON.stringify(claim));
  ok(claim.plain===0&&claim.claimedWhispers===.2&&claim.claimedSlip===.5,'Claimed: 20% at Whispers, half at Slipping',claim);
  ok(claim.lean===3&&Math.abs(claim.bossSpd-.42)<.02&&Math.abs(claim.crawlSpd-1.14)<.02,'Leaning hastens a crawler 20%, never the Keeper Below',claim);

  /* Teeth in the Stair: the first one each wave is eaten, every one after costs 1 more */
  const teeth=await p.evaluate(()=>{const T=fresh(), out={}; T.run.offs=['teeth']; T.F.queue=[]; T.startWave(); T.F.queue=[];
    const o0=T.run.oil; T.lampHit(T.spawnFoe('crawler',0,1)); out.first=o0-T.run.oil; const o1=T.run.oil; T.lampHit(T.spawnFoe('gnasher',0,1)); out.second=o1-T.run.oil;
    T.F.queue=[]; T.startWave(); T.F.queue=[]; const o2=T.run.oil; T.lampHit(T.spawnFoe('crawler',0,1)); out.nextWave=o2-T.run.oil;
    clearFoes(); return out;});
  console.log(JSON.stringify(teeth));
  ok(teeth.first===0&&teeth.second===3&&teeth.nextWave===0,'Teeth in the Stair: eaten whole, then 1 more oil each, and again next wave',teeth);

  /* Unpaid Teeth: a free horror per tier of paid madness; it goes home if paid madness falls */
  const unpaid=await p.evaluate(()=>{const T=fresh(), out={}; T.run.roster={gnasher:3,keeper:1}; T.run.offs=['unpaid'];
    out.cost0=T.horrorCost('keeper');
    const a=field('gnasher',0), b=field('gnasher',1); out.cost1=T.horrorCost('keeper');
    let spot=null; for(let r=0;r<T.ROWS&&!spot;r++)for(let c=0;c<T.COLS;c++)if(T.placeProblem({kind:'horror',type:'keeper'},c,r)===''){spot=[c,r]; break;}
    const ess=T.run.ess; T.setSel({kind:'horror',type:'keeper'}); T.tryPlace(spot[0],spot[1]); T.setSel(null);
    const k=T.F.towers.find(t=>t.type==='keeper'); out.free=!!(k&&k.free); out.paid=ess-T.run.ess; out.mad=T.madness(); out.bound=T.boundMadness(); out.cost2=T.horrorCost('gnasher');
    T.F.towers=T.F.towers.filter(t=>t!==b); T.syncFree(); out.back=!T.F.towers.includes(k);
    return out;});
  console.log(JSON.stringify(unpaid));
  ok(unpaid.cost0===90&&unpaid.cost1===0,'no paid madness, no free horror; two Gnashers (Whispers) open one',unpaid);
  ok(unpaid.free&&unpaid.paid===0&&unpaid.mad===13&&unpaid.bound===6&&unpaid.cost2===30,'a free Keeper costs nothing, brings its madness, and opens no more',unpaid);
  ok(unpaid.back,'paid madness falls, and the free one goes back',unpaid);

  /* The Dark Bites First: a creature walking out of a candle's light is bitten 10 and dragged a tile, once */
  const bite=await p.evaluate(()=>{const T=fresh(), out={}; T.run.offs=['first_bite'];
    const P=T.F.paths[0], d0=P.len-6; const pt=T.posAt(P,d0); window.devNoDark=true; const c=ward('candle',2,pt[0],pt[1]+.01); T.update(.001);
    const R=T.wstat(c).light; let dOut=d0; while(dOut<P.len){const q=T.posAt(P,dOut); if(Math.hypot(q[0]-c.x,q[1]-c.y)>R)break; dOut+=.05;}
    const e=T.spawnFoe('crawler',0,dOut-.1); e.max=e.hp=500; T.update(.001); const h0=e.hp;
    for(let i=0;i<20&&!e.bitten;i++)T.update(.03);
    out.bitten=!!e.bitten; out.dmg=+(h0-e.hp).toFixed(1); out.hauled=e.haulLeft>0||e.d<dOut;
    for(let i=0;i<120;i++)T.update(.03); out.once=+(h0-e.hp).toFixed(1);
    out.lamp=+(T.lampBase()).toFixed(2); T.run.offs=[]; out.lamp0=+(T.lampBase()).toFixed(2);
    window.devNoDark=false; clearFoes(); return out;});
  console.log(JSON.stringify(bite));
  ok(bite.bitten&&bite.dmg>=10&&bite.dmg<11&&bite.hauled,'walking out of a candle’s light: bitten 10 and dragged back',bite);
  ok(bite.lamp0-bite.lamp===.5,'the lamp burns half a tile smaller',bite);

  /* Feed the Dark: a rite; it drags what is near the lamp, guts the lamp, and adds dread in a wave */
  const feed=await p.evaluate(()=>{const T=fresh(), out={}; T.takeOffer('feed'); out.rite=T.run.rites.includes('feed');
    T.F.queue=[]; T.startWave(); T.F.queue=[];
    const P=T.F.paths[0], e=T.spawnFoe('crawler',0,P.len-1.5), far=T.spawnFoe('crawler',0,1), bs=T.spawnFoe('boss',0,P.len-1.2); bs.spawnT=99; T.update(.001);
    const r0=T.lampRadius(), d0=e.d, f0=far.d, b0=bs.d; T.castRite('feed');
    out.light=+(r0-T.lampRadius()).toFixed(2); out.dread=T.dread();
    for(let i=0;i<10;i++)T.update(.05);
    out.dragged=+(d0-e.d).toFixed(2); out.farStill=far.d>=f0; out.bossHeld=bs.d>=b0;
    for(let i=0;i<60;i++)T.update(.05); out.after=+(r0-T.lampRadius()).toFixed(2);
    clearFoes(); return out;});
  console.log(JSON.stringify(feed));
  ok(feed.rite&&feed.light===1.2&&feed.dread===4,'Feed the Dark: the lamp gutters 1.2 and you carry 4 dread',feed);
  ok(feed.dragged>.9&&feed.farStill&&feed.bossHeld&&feed.after===0,'what is near the lamp is dragged back, never a boss; then the lamp returns',feed);

  /* Swallowed Sigils: a sigil left to fade in a wave hatches a Gibberer; one you take never does */
  const famine=await p.evaluate(()=>{const T=fresh(), out={}; T.run.offs=['famine']; T.F.queue=[]; T.startWave(); clearFoes(); holdWave();
    T.F.souls.push({x:5,y:5,type:'gnasher',t:.01,max:5}); const taken={x:5,y:5,type:'gnasher',t:5,max:5}; T.F.souls.push(taken); T.bindSoul(taken);
    T.update(.05); out.gibs=T.F.foes.filter(e=>!e.dead&&e.type==='gibberer').length;
    clearFoes(); return out;});
  console.log(JSON.stringify(famine));
  ok(famine.gibs===1,'a faded sigil hatches one Gibberer; a bound one does not',famine);

  /* Salted Teeth and Living Bait: salt and traps beside a horror */
  const salt=await p.evaluate(()=>{const T=fresh(), out={}; T.run.offs=['bloodsalt','baited']; T.F.queue=[]; T.startWave(); holdWave(); window.devNoDark=true;
    const P=T.F.paths[0], q=T.posAt(P,5), c=Math.floor(q[0]), r=Math.floor(q[1]);
    const s={kind:'ward',type:'salt',id:9500,c,r,x:c+.5,y:r+.5,br:{},max:14,dur:14,invested:0,fresh:0}; T.F.towers.push(s); T.F.salt.set(c+','+r,s);
    const h=field('gnasher',0,c+1.5,r+.5); h.cd=5; T.update(.001);
    let d=5; while(d>0){const z=T.posAt(P,d); if(Math.floor(z[0])+','+Math.floor(z[1])!==c+','+r)break; d-=.05;}
    const e=T.spawnFoe('crawler',0,Math.max(0,d-.05)); e.max=e.hp=500; T.update(.001); const h0=e.hp;
    for(let i=0;i<10;i++)T.update(.02);
    out.bite=+(h0-e.hp).toFixed(1); out.cd=+h.cd.toFixed(2); out.wear=14-s.dur;
    T.F.foes.forEach(x=>x.dead=true); T.F.queue=[]; T.update(.01); out.dissolved=!T.F.towers.includes(s);
    window.devNoDark=false; return out;});
  console.log(JSON.stringify(salt));
  ok(salt.bite>=7&&salt.bite<8&&salt.wear===2,'salt beside a horror bites 7 and wears 2 a step',salt);
  ok(salt.dissolved,'and dissolves when the wave breaks',salt);

  const bait=await p.evaluate(()=>{const T=fresh(), out={}; T.run.offs=['baited']; T.F.queue=[]; T.startWave(); holdWave(); window.devNoDark=true;
    const P=T.F.paths[0], q=T.posAt(P,5), c=Math.floor(q[0]), r=Math.floor(q[1]);
    const tr={kind:'ward',type:'trap',id:9600,c,r,x:c+.5,y:r+.5,br:{},cd:0,invested:0,fresh:0}; T.F.towers.push(tr);
    const h=field('gnasher',0,c+1.5,r+.5); h.cd=5; T.update(.001);
    for(let k=0;k<5;k++){const e=T.spawnFoe('crawler',0,5); e.max=e.hp=999; e.tile=c+','+r; tr.cd=0; h.cd=5; T.update(.001);}
    out.horrorCd=+h.cd.toFixed(2); out.reset=+tr.cd.toFixed(2); out.dread=T.dread();
    window.devNoDark=false; clearFoes(); return out;});
  console.log(JSON.stringify(bait));
  ok(bait.reset<=1.5&&bait.dread===3,'Living Bait: half the reset, and 1 dread a snap, 3 at most',bait);

  /* Hollow Effigy: 2 dread an effigy; horrors reach the hexed half a tile further */
  const eff=await p.evaluate(()=>{const T=fresh('occultist'), out={}; T.run.offs=['holloweffigy']; ward('effigy',3,9.5,9.5); ward('effigy',4,10.5,9.5);
    out.dread=T.dread();
    const e=T.spawnFoe('crawler',0,3); T.update(.001); e.hex={mul:1,slow:0}; e.stunT=9; window.devNoDark=true;
    const d=Math.hypot(e.x-1,e.y-1); out.reach=!!T.pickTarget(e.x+1.6,e.y,1.35,'first',true,null,x=>x.hex?.5:0); out.plain=!!T.pickTarget(e.x+1.6,e.y,1.35,'first',true,null,null);
    window.devNoDark=false; clearFoes(); return out;});
  console.log(JSON.stringify(eff));
  ok(eff.dread===4&&eff.reach&&!eff.plain,'two effigies add 4 dread, and a hexed creature is reached from half a tile further',eff);

  /* Borrowed Flesh: an Unbound horror leaves a body that remembers; a Corpse Candle on it raises the phantom; Raise takes plain bones first */
  const flesh=await p.evaluate(()=>{const T=fresh('occultist'), out={}; T.run.offs=['mouth_corpse']; T.run.floor=1; T.beginFloor(null); T.setP(false); T.run.ess=3000;
    T.run.roster={gnasher:2}; const g=field('gnasher',0,6.5,6.5); T.update(.001); T.castUnbind(g);
    out.typed=T.run.corpses.list.filter(x=>x[2]==='gnasher').length;
    const [key,body]=[...T.F.bodies.entries()].find(([k,b])=>b.typed); const [bc,br]=key.split(',').map(Number);
    let spot=null; for(let r=br-2;r<=br+2&&!spot;r++)for(let c=bc-2;c<=bc+2;c++)if(T.placeProblem({kind:'ward',type:'candle'},c,r)===''&&T.bodyNear(c,r)===key){spot=[c,r]; break;}
    T.setSel({kind:'ward',type:'candle'}); T.tryPlace(spot[0],spot[1]); T.setSel(null);
    const cand=T.F.towers.find(t=>t.corpse); out.ph=cand&&cand.ph; out.mad=T.madness();
    const e=T.spawnFoe('crawler',0,1); e.max=e.hp=999; e.x=cand.x+.5; e.y=cand.y; e.stunT=99; window.devNoDark=true; cand.cd=0; cand.dark=false;
    const h0=e.hp; T.horrorAct(cand,'gnasher',.01); out.struck=h0-e.hp>0; window.devNoDark=false;
    /* the save keeps the remembered body and the phantom */
    T.checkpoint(); const snap=JSON.parse(JSON.stringify({run:T.run,wave:T.F.wave,towers:T.F.towers,lamp:{br:T.F.lamp.br,invested:0}}));
    T.resumeFrom(snap); out.resumed=!!T.F.towers.find(t=>t.corpse&&t.ph==='gnasher');
    /* plain bones before remembered ones */
    T.run.corpses={floor:T.run.floor,list:[[0,6,'gnasher'],[0,6]]}; T.corpseSync(); const k2=[...T.F.bodies.keys()][0];
    out.plainFirst=!T.takeBody(k2)[2]; T.run.corpses={floor:T.run.floor,list:[[0,6],[0,6,'gnasher']]}; T.corpseSync(); out.typedForCandle=T.takeBody([...T.F.bodies.keys()][0],true)[2]==='gnasher';
    clearFoes(); return out;});
  console.log(JSON.stringify(flesh));
  ok(flesh.typed===1,'an Unbound horror leaves a body that remembers it',flesh);
  ok(flesh.ph==='gnasher'&&flesh.mad===0&&flesh.struck,'a Corpse Candle on it raises a phantom that strikes, at no madness',flesh);
  ok(flesh.resumed,'the phantom survives a resume',flesh);
  ok(flesh.plainFirst&&flesh.typedForCandle,'Raise takes plain bones first; a Corpse Candle the remembered one',flesh);

  /* Teeth on the Thread: each link bites a creature once; horrors hurt the Kindled a quarter more */
  const thread=await p.evaluate(()=>{const T=fresh(), out={}; T.run.offs=['mouth_signal'];
    const e=T.spawnFoe('crawler',0,3); e.max=e.hp=500; T.update(.001); e.stunT=99;
    T.F.links=[[{id:1,x:e.x-1,y:e.y},{id:2,x:e.x+1,y:e.y}]];
    const h0=e.hp; T.threadBite(e); out.bite=+(h0-e.hp).toFixed(1); out.held=e.stunT; e.stunT=0; T.threadBite(e); out.once=+(h0-e.hp).toFixed(1);
    e.kindleT=0; const h1=e.hp; T.hurt(e,20,'horror'); out.plain=+(h1-e.hp).toFixed(1); e.kindleT=5; const h2=e.hp; T.hurt(e,20,'horror'); out.kindled=+(h2-e.hp).toFixed(1);
    clearFoes(); return out;});
  console.log(JSON.stringify(thread));
  ok(thread.bite===8&&thread.once===8,'a link bites a creature 8, once',thread);
  ok(thread.plain===20&&thread.kindled===25,'horrors hurt a Kindled creature a quarter more',thread);

  /* Blood in the Try-pot: twice the render from horror kills; the line snaps to the next */
  const pot=await p.evaluate(()=>{const T=fresh('whaler'), out={}; T.run.offs=['mouth_harpoon']; window.devNoDark=true;
    const tp={kind:'ward',type:'trypot',id:9700,x:5.5,y:5.5,c:5,r:5,br:{},invested:0,fresh:0}; T.F.towers.push(tp); T.update(.001);
    T.potRender({x:5.5,y:5.5,def:{oil:1},lastSrc:'harpoon'}); const r1=tp.render||0; T.potRender({x:5.5,y:5.5,def:{oil:1},lastSrc:'horror'});
    out.plain=r1; out.blood=(tp.render||0)+(tp.meas||0)*2-r1;
    const P=T.F.paths[0], q=T.posAt(P,4), hp={kind:'ward',type:'harpoon',id:9701,x:q[0]+1,y:q[1],c:0,r:0,br:{},cd:9,invested:0,fresh:0}; T.F.towers.push(hp); T.update(.001); hp.st=T.wstat(hp);
    const a=T.spawnFoe('crawler',0,4), bb=T.spawnFoe('crawler',0,3.6); T.update(.001); a.tetherBy=hp; hp.tethered=a; const d0=bb.d;
    T.hurt(a,9999,'horror'); for(let i=0;i<20;i++)T.update(.03);
    out.snapped=hp.tethered===bb&&bb.d<d0;
    window.devNoDark=false; clearFoes(); return out;});
  console.log(JSON.stringify(pot));
  ok(pot.blood===2*pot.plain&&pot.plain>0,'a horror kill renders twice as much',pot);
  ok(pot.snapped,'a horror kill on the line snaps it to the next and hauls it back',pot);

  /* Wired Specimens: a horror takes a spare wire from a pylon, never makes mains, and sheds wait on a shock */
  const arc=await p.evaluate(()=>{const T=fresh('galvanist'), out={}; T.run.offs=['mouth_arc'];
    const py={kind:'ward',type:'pylon',id:9800,x:T.F.lx+1,y:T.F.ly,c:0,r:0,br:{},invested:0,fresh:0}; T.F.towers.push(py);
    const h=field('gnasher',0,T.F.lx+3,T.F.ly); T.update(.001);
    const gr=T.gridBuild(null); const e=gr.edges.find(x=>x.a.horror||x.b.horror); out.edge=!!e; out.mains=gr.nodes.some(n=>n.horror&&n.mains);
    out.stats=e?[e.dmg>0,e.stun>0]:null;
    const two=field('gnasher',1,T.F.lx+3,T.F.ly+1); out.hh=T.gridBuild(null).edges.some(x=>x.a.horror&&x.b.horror);
    return out;});
  console.log(JSON.stringify(arc));
  ok(arc.edge&&!arc.mains&&arc.stats&&arc.stats.every(Boolean),'a specimen takes a pylon’s wire with the pylon’s strength, and never makes mains',arc);
  ok(!arc.hh,'two specimens never wire to each other',arc);

  /* The Answering Choir: a Perfect Toll makes every horror strike at once; the dark answers with a Gorger too */
  const choir=await p.evaluate(()=>{const T=fresh('bellringer'), out={}; T.run.offs=['mouth_chime']; T.F.phase='wave';
    const a=field('gnasher',0), b=field('wretch',1); a.cd=b.cd=5; out.n=T.choirAnswers(); out.cd=[a.cd,b.cd]; out.deep=a.deepT>0;
    T.darkAnswers(); out.gorger=T.F.foes.filter(e=>e.type==='gorger').length; out.stalkers=T.F.foes.filter(e=>e.type==='stalker').length;
    clearFoes(); return out;});
  console.log(JSON.stringify(choir));
  ok(choir.n===2&&choir.cd.join()==='0,0'&&choir.deep,'a Perfect Toll and every horror strikes at once, into the dark',choir);
  ok(choir.gorger===1&&choir.stalkers===2,'at 5 Noise a Gorger climbs with the two Stalkers',choir);

  /* teaching: the Grimoire, the rules, the seal, the floor hint and the tips; the board draws them; a long wave stays sane */
  const teach=await p.evaluate(async()=>{const T=fresh(), out={};
    out.lore=['gibberer','gorger','husk'].every(k=>T.LORE[k]&&T.LORE[k].length>40);
    out.tips=['mouths','dread','husk','feed','phantom','unpaid'].every(k=>T.TIPS[k]);
    T.takeOffer('openears'); T.renderRelics(); out.seal=[...document.querySelectorAll('#relChips .relchip.is-patron')].map(x=>x.textContent).join('');
    out.rules=document.body.innerHTML.includes('<b>Dread.</b>')&&document.body.innerHTML.includes('the Wrong Sun, and the Many-Mouthed');
    T.run.att={mouths:5}; T.F.towers=[]; ward('harpoon',1,T.F.lx+1,T.F.ly); field('gnasher',0,T.F.lx-1,T.F.ly);
    T.F.queue=[]; T.startWave(); out.husks=T.F.queue.filter(q=>q.type==='husk').length;
    for(let i=0;i<400;i++){T.update(.05); if(i%40===0)T.render();}
    out.phase=T.F.phase; out.sprites=['gibberer','gorger','husk'].every(k=>T.nSprites>0);
    return out;});
  console.log(JSON.stringify(teach));
  ok(teach.lore&&teach.tips,'Grimoire lines and first-time tips for its creatures and gifts',teach);
  ok(teach.seal==='ᗯ','its seal sits beside the Grimoire',teach.seal);
  ok(teach.rules,'the rules name it and teach dread',teach);
  ok(teach.husks===1,'Claimed sends a Choir-Husk with the wave',teach);

  if(errs.length)fails.push('page errors: '+errs.join(' | '));
  await b.close();
  if(fails.length){fails.forEach(f=>console.log('FAIL '+f)); process.exit(1);}
  console.log('ok');
})();
