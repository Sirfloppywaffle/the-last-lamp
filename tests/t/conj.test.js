// Conjunction offerings (#87): two patrons who have both noticed you offer one gift together.
// The offer (third card, gates, caps), the Caller and the Witness, and each of the five conjunctions.
const {chromium}=require('playwright');
const fails=[]; const ok=(c,m,d)=>{if(!c)fails.push(m+(d!==undefined?' '+JSON.stringify(d):''));};
(async()=>{
  const b=await chromium.launch(); const p=await b.newPage({viewport:{width:412,height:860}});
  const errs=[]; p.on('pageerror',e=>errs.push(String(e)));
  await p.goto('file://'+process.argv[2]); await p.waitForTimeout(300);
  await p.evaluate(()=>{
    window.fresh=(kit,att)=>{const T=__t; T.newRun(kit||'lamplighter',0); T.setP(false); T.run.ess=3000; window.devNoDark=false;
      T.F.towers=T.F.towers.filter(t=>t.kind!=='horror'); T.run.att=Object.assign({},att||{}); return T;};
    window.clearFoes=()=>{const T=__t; T.F.foes.forEach(e=>e.dead=true); T.update(.001);};
    /* a wave that never ends on its own, and time that passes in small steps */
    window.holdWave=()=>{const T=__t; T.F.phase='wave'; T.F.queue=[{t:9999,type:'crawler',gate:0}];};
    window.pass=(sec)=>{for(let i=0;i<sec*30;i++)__t.update(1/30);};
    /* her water, seeded fresh, and a creature standing on its first tile (or a tile further along) */
    window.wet=()=>{const T=__t; T.floodSeed(); return T.run.water.str[0];};
    window.at=(type,g,d)=>{const T=__t, e=T.spawnFoe(type,g,d); e.spawnT=0; T.update(.001); return e;};
    /* a bright spot on a path tile: [path, tile] */
    window.spotOn=(g,d)=>{const T=__t; T.run.spots={floor:T.run.floor,tiles:[[g,d]]}; T.spotSync();};
  });

  /* the offer: a conjunction takes the third card, last, only for a pair that has both noticed you, never Claimed */
  const offer=await p.evaluate(()=>{const out={};
    const roll=(kit,att,p,n)=>{const T=fresh(kit,att); let conj=0, last=true, seen=new Set(), size=true, own=0, ownConj=0;
      for(let i=0;i<n;i++){const o=T.offerSet(p)||[]; const c=o.filter(T.isConj);
        if(c.length){conj++; c.forEach(k=>seen.add(k)); if(!T.isConj(o[o.length-1]))last=false; if(o.filter(k=>T.OFFERINGS[k].kit).length)ownConj++;}
        if(o.filter(k=>T.OFFERINGS[k].kit).length)own++;
        if(c.length>1||o.length>3)size=false;}
      return {rate:conj/n,last,seen:[...seen],size,own,ownConj};};
    out.n11=roll('lamplighter',{mother:1,sun:1},'mother',800);
    out.n33=roll('lamplighter',{mother:3,sun:3},'mother',800);
    out.n31=roll('lamplighter',{mother:3,sun:1},'sun',800);
    out.claimed=roll('lamplighter',{mother:5,sun:1},'mother',300);
    out.alone=roll('lamplighter',{mother:2},'mother',300);
    out.mouths=roll('occultist',{mother:1,sun:1,mouths:1},'mouths',800);
    out.kits={};
    for(const k of ['lamplighter','whaler','occultist','galvanist','bellringer'])out.kits[k]=roll(k,{mother:1,sun:1,mouths:1},'sun',400).seen;
    return out;});
  console.log(JSON.stringify(offer));
  ok(Math.abs(offer.n11.rate-.25)<.06,'both Noticed: a conjunction about a quarter of the time',offer.n11.rate);
  ok(Math.abs(offer.n33.rate-.6)<.06,'both Watched: about three in five',offer.n33.rate);
  ok(Math.abs(offer.n31.rate-.4)<.06,'one Watched: about two in five',offer.n31.rate);
  ok(offer.n11.seen.join()==='phosphor'&&offer.n11.last&&offer.n11.size,'the Mother and the Sun offer Phosphor Tide, last, one at a time, three cards',offer.n11);
  ok(offer.n11.ownConj>0,'a kit offering can sit beside a conjunction (it is never the card replaced)',offer.n11);
  ok(offer.claimed.rate===0&&offer.alone.rate===0,'never with a Claimed patron, never with one patron alone',[offer.claimed.rate,offer.alone.rate]);
  ok(['brinechoir','gorgedrag','husking','sundrunk'].every(k=>offer.mouths.seen.includes(k))&&!offer.mouths.seen.includes('phosphor'),'the Many-Mouthed brings its four, never the Mother and Sun\'s',offer.mouths.seen);
  for(const k of Object.keys(offer.kits))ok(offer.kits[k].length===3,k+' is offered every conjunction the Sun is part of',offer.kits[k]);

  /* the price: the Caller (lagging Attention) pays +1; the Witness makes itself felt next wave; caps: one a pair, two a run */
  const price=await p.evaluate(()=>{const out={};
    let T=fresh('lamplighter',{mother:2,sun:1}); T.beginFloor(); wet();
    out.tag=T.offerChoice('phosphor',()=>{}).tag;
    const w0=T.F.water.size; T.takeOffer('phosphor');
    out.att=[T.attOf('mother'),T.attOf('sun')]; out.witness=T.run.witness;
    T.startWave(); out.rose=T.F.water.size-w0; out.cleared=T.run.witness;
    T=fresh('lamplighter',{mother:1,sun:1,mouths:1}); T.F.phase='build'; T.F.towers=[];
    T.takeOffer('sundrunk'); out.tie=[T.attOf('sun'),T.attOf('mouths'),T.run.witness];
    T.F.queue=[]; T.startWave(); out.gibs=T.F.queue.filter(q=>q.type==='gibberer').length;
    T.run.att={mother:1,sun:1,mouths:1};
    let pairAgain=0; for(let i=0;i<300;i++)(T.offerSet('sun')||[]).forEach(k=>{if(k==='husking')pairAgain++;});
    out.pairAgain=pairAgain;
    T.takeOffer('gorgedrag'); let more=0; for(let i=0;i<300;i++)(T.offerSet('mother')||[]).concat(T.offerSet('sun')||[]).forEach(k=>{if(T.isConj(k))more++;});
    out.more=more;
    return out;});
  console.log(JSON.stringify(price));
  ok(/^Conjunction · Wrong Sun \+1 · Drowned Mother watches/.test(price.tag),'the card names who pays and who watches',price.tag);
  ok(price.att.join()==='2,2'&&price.witness==='mother','the lagging Sun pays +1; the Mother is the Witness',price);
  ok(price.rose===1&&price.cleared===null,'the Witness raises her water once, next wave, though she is only Noticed',price);
  ok(price.tie.join()==='2,1,mouths','a tie: the first of the pair pays',price.tie);
  ok(price.gibs===2,'the Many-Mouthed as Witness sends one more Gibberer (one for the bare board, one for the Witness)',price.gibs);
  ok(price.pairAgain===0,'a pair offers one conjunction a run',price.pairAgain);
  ok(price.more===0,'two conjunctions a run at most',price.more);

  /* Phosphor Tide: a blow in water near a spot lights the stretch: seen, a quarter more; the current at 1.45 */
  const phos=await p.evaluate(()=>{const T=fresh('lamplighter',{mother:1,sun:1}), out={}; T.run.offs=['phosphor'];
    const [g,d0]=wet(); spotOn(g,d0); holdWave();
    const a=at('crawler',g,d0+.5), sh=at('shade',g,d0+1.5);
    out.inWater=T.inWater(a)&&T.inWater(sh); out.seenBefore=T.canSee(sh);
    out.cur=+T.currentOf(a).toFixed(2);
    T.hurt(a,5); out.glow=T.glowAt(sh); out.seenAfter=T.canSee(sh); T.render();
    const h0=sh.hp; T.hurt(sh,10); out.hit=+(h0-sh.hp).toFixed(2);
    pass(6.5); out.faded=!T.glowAt(sh);
    out.notSaved=!JSON.stringify(T.run).includes('glowT');
    /* a fresh floor's spots: one always stands in her water */
    let inW=0; for(let i=0;i<40;i++){T.floodSeed(); T.spotSeed(); if([...T.F.spots].some(k=>T.F.water.has(k)))inW++;} out.spotInWater=inW;
    clearFoes(); return out;});
  console.log(JSON.stringify(phos));
  ok(phos.inWater&&!phos.seenBefore,'a Shade in her water starts unseen',phos);
  ok(phos.glow&&phos.seenAfter,'a blow near the spot lights the stretch; the Shade in it is seen',phos);
  ok(phos.hit===12.5,'what stands in lit water takes a quarter more',phos.hit);
  ok(phos.faded&&phos.notSaved,'the glow fades after 6 seconds and is never saved',phos);
  ok(phos.spotInWater===40,'with Phosphor Tide, one bright spot always burns in her water',phos.spotInWater);
  ok(phos.cur===1.45,'her current runs at 1.45',phos.cur);

  /* Gorger's Undertow: a wet Gibberer brings 1 dread; a death in water drags its neighbours a tile back; a Gorger raises the water */
  const drag=await p.evaluate(()=>{const T=fresh('lamplighter',{mother:1,mouths:1}), out={}; T.run.offs=['gorgedrag'];
    const [g,d0]=wet(); holdWave();
    const gib=at('gibberer',g,d0+.5); out.dread=T.dread(); gib.dead=true; T.update(.001);
    const v=at('crawler',g,d0+.5), n1=at('crawler',g,d0+1.5), bs=at('boss',g,d0+1.2);
    const dn=n1.d, db=bs.d; T.hurt(v,9999); out.back=+(dn-n1.d).toFixed(2); out.boss=+(db-bs.d).toFixed(2);
    for(let i=0;i<3;i++)T.hurt(at('crawler',g,n1.d-.3),9999); out.capped=+(dn-n1.d).toFixed(2);
    clearFoes();
    out.cur=+T.currentOf(T.spawnFoe('gorger',g,d0+.5)).toFixed(2); clearFoes();
    holdWave(); T.F.gorgeRise=0; const w0=T.F.water.size;
    for(let k=0;k<3;k++){const go=at('gorger',g,Math.max(0,d0-1.2)); for(let i=0;i<120&&!T.inWater(go);i++)T.update(1/30); go.dead=true; T.update(.001);}
    out.rose=T.F.water.size-w0;
    clearFoes(); return out;});
  console.log(JSON.stringify(drag));
  ok(drag.dread===1,'a Gibberer in water brings 1 dread, not 2',drag.dread);
  ok(drag.back===1&&drag.boss===0,'a death in water drags a neighbour a tile back; never a boss',drag);
  ok(drag.capped===2,'a creature is dragged twice at most',drag.capped);
  ok(drag.cur===1.4,'Gorgers ride her current at 1.4',drag.cur);
  ok(drag.rose===2,'three Gorgers stepping into water raise it twice (two a wave)',drag.rose);

  /* Brine-Choir: a blow in water rings a fifth as hard through the same stretch; each tile gained is 1 dread, 3 at most */
  const choir=await p.evaluate(()=>{const T=fresh('lamplighter',{mother:1,mouths:1}), out={}; T.run.offs=['brinechoir'];
    const [g,d0]=wet(); holdWave();
    const a=at('crawler',g,d0+.5), c=at('crawler',g,d0+1.5), dry=at('crawler',g,Math.max(0,d0-1.5));
    const hc=c.hp, hd=dry.hp; T.hurt(a,10); out.echo=+(hc-c.hp).toFixed(2); out.dry=hd-dry.hp;
    clearFoes();
    out.d0=T.conjDread(); for(let i=0;i<5;i++)T.waterRise(true); out.d5=T.conjDread();
    return out;});
  console.log(JSON.stringify(choir));
  ok(choir.echo===2&&choir.dry===0,'the blow rings 2 through the same water, nothing on dry stone',choir);
  ok(choir.d0===0&&choir.d5===3,'risen water brings 1 dread a tile, 3 at most',choir);

  /* Sun-Drunk Chorus: its creatures stand still a second in a spot; walking out alive, they run and bring dread */
  const drunk=await p.evaluate(()=>{const T=fresh('lamplighter',{sun:1,mouths:1}), out={}; T.run.offs=['sundrunk'];
    const g=0, P=T.F.paths[0], d=6; spotOn(g,d); holdWave();
    const e=at('gibberer',g,d-1.3);
    let held=0; for(let i=0;i<300&&!T.inSpot(e);i++)T.update(1/30);
    out.stun=+e.stunT.toFixed(2); out.inSpot=T.inSpot(e);
    for(let i=0;i<300&&T.inSpot(e);i++)T.update(1/30);
    out.run=e.drunkRunT>0; out.dread=T.conjDread();
    /* a second spot further on: it does not stare again, and cries out only once */
    T.run.spots.tiles.push([g,d+3]); T.spotSync(); for(let i=0;i<300&&!T.inSpot(e);i++)T.update(1/30); out.again=e.stunT;
    for(let i=0;i<300&&T.inSpot(e);i++)T.update(1/30); out.dread2=T.conjDread();
    const c=at('crawler',g,d-1.3); for(let i=0;i<300&&!T.inSpot(c);i++)T.update(1/30); out.crawlerStun=c.stunT;
    clearFoes(); return out;});
  console.log(JSON.stringify(drunk));
  ok(drunk.inSpot&&drunk.stun>.9,'a Gibberer stepping into a spot stands still for a second',drunk);
  ok(drunk.run&&drunk.dread===1,'walking out alive, it runs faster and brings 1 dread',drunk);
  ok(!(drunk.again>0)&&drunk.dread2===1,'once each: no second stare, no second cry',drunk);
  ok(!(drunk.crawlerStun>0),'only the Many-Mouthed\'s creatures stare',drunk);

  /* Violet Husking: a dead Gorger burns violet; it shows what stands in it; unfed, it leaves 1 dread for 6 seconds */
  const husk=await p.evaluate(()=>{const T=fresh('lamplighter',{sun:1,mouths:1}), out={}; T.run.offs=['husking']; holdWave();
    const P=T.F.paths[0];
    const go=at('gorger',0,8); T.hurt(go,9999); out.lights=(T.F.hlights||[]).length; T.render();
    const sh=at('shade',0,8.3); out.seen=T.canSee(sh); sh.dead=true; T.update(.001);
    let gibs=0; for(let i=0;i<3;i++){const gb=at('gibberer',0,2+i*.1); T.hurt(gb,9999);} out.third=(T.F.hlights||[]).length;
    pass(6.5); out.left=(T.F.hlights||[]).length; out.dread=T.conjDread();
    pass(6.5); out.later=T.conjDread();
    holdWave(); const g2=at('gorger',0,10); T.hurt(g2,9999); const f=at('crawler',0,10.2); T.hurt(f,9999); pass(6.5); out.fed=T.conjDread();
    out.notSaved=!JSON.stringify(T.run).includes('hlights');
    clearFoes(); return out;});
  console.log(JSON.stringify(husk));
  ok(husk.lights===1&&husk.seen,'a dead Gorger burns violet, and a Shade in its light is seen',husk);
  ok(husk.third===2,'the third Gibberer burns too, not the first two',husk.third);
  ok(husk.left===0&&husk.dread===2&&husk.later===0,'two unfed husks leave 1 dread each for 6 seconds',husk);
  ok(husk.fed===0&&husk.notSaved,'a husk fed a kill leaves nothing; husks are never saved',husk);

  ok(!errs.length,'no page errors',errs);
  await b.close();
  if(fails.length){fails.forEach(f=>console.log('FAIL '+f)); process.exit(1);}
  console.log('conj ok');
})();
