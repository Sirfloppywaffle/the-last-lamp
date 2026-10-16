// The Bellringer (#26, the fifth kit): Agathe Vell sees by sound. Toll, Noise and the dark answering, ghosts, Peal,
// the Great Bell, Bell Wires in the dark, Bell Candles relaying, Clapper bolts, chimes hearing the dark, her offerings.
const {chromium}=require('playwright');
const fails=[]; const ok=(c,m,d)=>{if(!c)fails.push(m+(d!==undefined?' '+JSON.stringify(d):''));};
(async()=>{
  const b=await chromium.launch(); const p=await b.newPage({viewport:{width:412,height:860}});
  const errs=[]; p.on('pageerror',e=>errs.push(String(e)));
  await p.goto('file://'+process.argv[2]); await p.waitForTimeout(300);

  const r=await p.evaluate(()=>{const T=__t, out={};
    T.tutSet({off:true,seen:[],walk:'done'});
    const fresh=()=>{T.newRun('bellringer',0); T.run.floor=1; T.beginFloor(null); T.setP(false); T.run.ess=9999; T.run.oil=T.run.oilMax=999; T.F.queue=[];};
    const wave=()=>{T.startWave(); T.F.queue=[];};
    const P=()=>T.F.paths[0];
    const lampD=(e)=>Math.hypot(e.x-T.F.lx,e.y-T.F.ly);
    /* how far along the path a point lies */
    const dAt=(x,y)=>{let best=0,bd=1e9; for(let d=0;d<P().len;d+=.05){const q=T.posAt(P(),d), dd=Math.hypot(q[0]-x,q[1]-y); if(dd<bd){bd=dd; best=d;}} return best;};
    /* a creature held still somewhere along the path */
    const hold=(type,d)=>{const e=T.spawnFoe(type,0,d); e.hp=e.max=1e6; e.spawnT=0; e.stunT=1e6; return e;};
    const run=(s)=>{for(let i=0;i<Math.round(s/.05);i++)T.update(.05);};
    /* a point on the path that lies in the dark, within the toll's reach */
    const darkD=()=>{for(let d=P().len-1;d>0;d-=.25){const q=T.posAt(P(),d), dd=Math.hypot(q[0]-T.F.lx,q[1]-T.F.ly); if(dd>4.6&&dd<6.4&&!T.F.L.some(L=>Math.hypot(q[0]-L.x,q[1]-L.y)<=L.r))return d;} return null;};

    /* the kit */
    fresh();
    out.kit={wards:T.run.wards.join(),rites:T.run.rites.join(),who:T.KITS.bellringer.who,candle:T.wdef('candle').n,harpoon:T.wdef('harpoon').n,lamp:T.treeOf('lamp').map(x=>x.n).join(),chime:T.KITS.bellringer.wards.includes('chime')};

    /* Toll waits for the dark */
    T.castRite('toll'); out.buildToll={tolls:T.F.tolls.length,noise:T.F.noise};

    /* Toll: a crawler and a Shade in the dark are heard; Noise rises; the swing */
    fresh(); wave(); const dd=darkD(); out.darkD=dd;
    const cr=hold('crawler',dd), sh=hold('shade',dd-.4); T.update(.01);
    out.before=[T.canSee(cr),T.canSee(sh)];
    T.castRite('toll'); out.swing=T.F.cd.toll; out.noise1=T.F.noise;
    run(1.0); out.heard=[cr.heardT>0,sh.heardT>0,T.canSee(cr),T.canSee(sh)];
    /* the echo fades and leaves ghosts */
    for(let i=0;i<60&&(cr.heardT>0||sh.heardT>0);i++)T.update(.05);
    out.faded=[cr.heardT,T.canSee(cr)]; out.ghosts=T.F.ghosts.filter(g=>g.type==='crawler'||g.type==='shade').length;
    T.render();

    /* Noise: it fades, and at 5 the dark answers with two Stalkers */
    fresh(); wave(); hold('crawler',1); T.F.noise=0;
    for(let i=0;i<4;i++){T.F.cd.toll=0; T.castRite('toll');}
    out.noise4={n:+T.F.noise.toFixed(2),stalkers:T.F.foes.filter(e=>e.answered).length};
    run(6); out.faded1=+(4-T.F.noise).toFixed(2);
    T.F.noise=4.2; T.F.cd.toll=0; T.castRite('toll');
    out.answer={noise:T.F.noise,stalkers:T.F.foes.filter(e=>e.answered&&e.type==='stalker').length};

    /* Peal: the lamp tolls on its own, with no Noise, and finds only the ordinary dark */
    fresh(); T.buyBranch(T.F.lamp,2); wave(); T.F.noise=0;
    const d2=darkD(), c2=hold('crawler',d2), s2=hold('shade',d2-.4);
    run(4.6); out.peal={lstat:T.lstat().peal,noise:T.F.noise,crawler:c2.heardT>0,shade:s2.heardT>0};
    /* Cathedral: every toll staggers what is near the lamp */
    fresh(); T.buyBranch(T.F.lamp,2); T.buyBranch(T.F.lamp,2); T.buyBranch(T.F.lamp,2); wave();
    const near=T.spawnFoe('crawler',0,P().len-1.2); near.spawnT=0; T.update(.01); near.stunT=0;
    T.lampToll('peal'); out.cathedral={cap:T.lstat().cathedral,near:+lampD(near).toFixed(1),stun:near.stunT};

    /* the Great Bell: the whole floor, veiled too, staggered, 3 Noise */
    fresh(); wave(); T.F.noise=0;
    const farS=hold('shade',.5); farS.stunT=0;
    T.castRite('greatbell'); const gNoise=T.F.noise; let gStun=0; for(let i=0;i<32;i++){T.update(.05); gStun=Math.max(gStun,farS.stunT);}
    out.great={heard:farS.heardT>0,noise:gNoise,cd:T.F.cd.greatbell>0,stunned:gStun>0};

    /* Bell Wires: strung in the dark on the path, three at most, never off the path */
    fresh();
    /* dark tiles along the main way, in the order they walk them */
    const dark=[], seenT=new Set(); for(let d=0;d<P().len;d+=.1){const q=T.posAt(P(),d), c=Math.floor(q[0]), rr=Math.floor(q[1]), k=c+','+rr; if(!seenT.has(k)&&!T.buildLit(c,rr)){seenT.add(k); dark.push([c,rr]);}}
    const off=[]; for(let rr=0;rr<T.ROWS;rr++)for(let c=0;c<T.COLS;c++)if(!T.F.pathTiles.has(c+','+rr)&&!T.buildLit(c,rr))off.push([c,rr]);
    out.wirePlace={dark:T.placeProblem({kind:'ward',type:'bellwire'},dark[0][0],dark[0][1]),off:T.placeProblem({kind:'ward',type:'bellwire'},off[0][0],off[0][1]),harpoonDark:T.placeProblem({kind:'ward',type:'harpoon'},off[0][0],off[0][1])};
    const wires=[]; for(let i=0;i<3;i++){T.setSel({kind:'ward',type:'bellwire'}); T.tryPlace(dark[i*3][0],dark[i*3][1]); T.setSel(null); wires.push(T.F.towers[T.F.towers.length-1]);}
    out.wireMax=T.placeProblem({kind:'ward',type:'bellwire'},dark[10][0],dark[10][1]);
    T.update(.01); out.wireLit=wires.every(t=>t.type==='bellwire'&&!t.dark);
    /* a Shade crossing a wire is heard for 4 seconds, and so is what walks beside it */
    wave(); const w=wires[0];
    const sx=T.spawnFoe('shade',0,0), mate=T.spawnFoe('crawler',0,0); for(const e of [sx,mate]){e.spawnT=0; e.stunT=1e6; e.hp=e.max=1e6;}
    w.cd=0; sx.d=dAt(w.x,w.y); mate.d=sx.d+.9; T.update(.05);
    out.trip={shade:+sx.heardT.toFixed(1),mate:mate.heardT>0,cd:w.cd>0};
    /* fliers pass over; a Gnasher chews through, and the wire is restrung when the wave breaks */
    const w2=wires[1]; w2.cd=0; const fl=T.spawnFoe('watcher',0,0); fl.spawnT=0; fl.stunT=1e6; fl.d=dAt(w2.x,w2.y); T.update(.05); out.flier=!(fl.heardT>0)&&!(w2.cd>0);
    fl.dead=true;
    const gn=T.spawnFoe('gnasher',0,dAt(w2.x,w2.y)); gn.spawnT=0; gn.stunT=1e6; T.update(.05); out.chewed=w2.cut===true;
    T.F.foes.forEach(e=>{e.dead=true;}); T.waveCleared(); out.restrung=w2.cut===false;
    T.render();

    /* a Bell Candle the toll reaches rings it again from there */
    fresh();
    let edge=null, ed=0; for(let rr=0;rr<T.ROWS;rr++)for(let c=0;c<T.COLS;c++){if(T.placeProblem({kind:'ward',type:'candle'},c,rr))continue; const d=Math.hypot(c+.5-T.F.lx,rr+.5-T.F.ly); if(d>ed){ed=d; edge=[c,rr];}}
    T.setSel({kind:'ward',type:'candle'}); T.tryPlace(edge[0],edge[1]); T.setSel(null); const bc=T.F.towers[T.F.towers.length-1]; T.update(.01);
    wave(); T.castRite('toll'); run(.8);
    out.relay={dist:+ed.toFixed(1),light:T.wstat(bc).light,relayed:bc.relayId>0};

    /* Clapper bolts: ring what they strike, and knock it back */
    fresh(); wave();
    const hp=T.F.towers.length; T.setSel({kind:'ward',type:'harpoon'}); let spot=null; for(let rr=0;rr<T.ROWS&&!spot;rr++)for(let c=0;c<T.COLS&&!spot;c++)if(!T.placeProblem({kind:'ward',type:'harpoon'},c,rr))spot=[c,rr]; T.tryPlace(spot[0],spot[1]); T.setSel(null);
    const hq=T.F.towers[hp], cst=T.wstat(hq).clap; out.clap=cst;
    const kb=hold('crawler',5); kb.stunT=0; const d0=kb.d; T.clapHit(kb,cst); out.knock={back:+(d0-kb.d).toFixed(2),heard:kb.heardT>0};
    const ksh=hold('shade',6); T.clapHit(ksh,cst); out.knockShade=ksh.heardT>0;

    /* her chimes hear the ordinary dark, and strike it */
    fresh(); wave();
    /* a chime at the edge of the light, and a crawler just past it in the dark */
    let cs=null, cd0=0; for(let rr=0;rr<T.ROWS;rr++)for(let c=0;c<T.COLS;c++){if(T.placeProblem({kind:'ward',type:'chime'},c,rr))continue; const d=Math.hypot(c+.5-T.F.lx,rr+.5-T.F.ly); if(d>cd0){cd0=d; cs=[c,rr];}}
    T.setSel({kind:'ward',type:'chime'}); T.tryPlace(cs[0],cs[1]); T.setSel(null);
    const ch=T.F.towers[T.F.towers.length-1], cdk=T.spawnFoe('crawler',0,1); cdk.spawnT=0; cdk.stunT=1e6; cdk.hp=cdk.max=1e6;
    T.update(.01); const ux=(ch.x-T.F.lx)/cd0, uy=(ch.y-T.F.ly)/cd0; cdk.x=ch.x+ux*1.5; cdk.y=ch.y+uy*1.5; cdk.heardT=0;
    const chp=cdk.hp, lit=T.F.L.some(L=>Math.hypot(cdk.x-L.x,cdk.y-L.y)<=L.r); T.chimePulse(ch,T.wstat(ch)); out.chime={lit,hit:cdk.hp<chp,period:T.wstat(ch).period};

    /* her offerings: the Drowned Peal and Her Lullaby */
    fresh(); T.takeOffer('lullaby'); wave(); hold('crawler',1); T.F.noise=3; run(3); out.lullaby={faded:+(3-T.F.noise).toFixed(2)};
    T.F.cd.toll=0; T.castRite('toll'); out.lullaby.max=T.F.tolls[0].max;

    /* kit rites stay with their kit: no gift offers Toll, the Great Bell, Overload or the Anchor to anyone else */
    T.newRun('lamplighter',0); T.run.floor=1; T.beginFloor(null);
    const seenR=new Set(); for(let i=0;i<300;i++)T.draftOptions(5).forEach(o=>{if(o.kind==='rite')seenR.add(o.key);});
    out.pool=[...seenR].sort();

    /* Resonance: three cracks shatter a crawler and crack what stands beside it; a boss takes 8; cracks fade */
    fresh(); wave();
    const ra=hold('crawler',6), rb=hold('crawler',6.3), boss=hold('boss',8);
    T.crack(ra,1); T.crack(ra,1); out.res1={cracks:ra.cracks};
    const rhp=ra.hp, bhp=rb.hp; T.crack(ra,1); T.shatterAll();
    out.res2={cracks:ra.cracks,hurt:Math.round(rhp-ra.hp),splash:Math.round(bhp-rb.hp),nearCrack:rb.cracks,fx:T.F.fx.some(f=>f.k==='shatter')};
    for(let i=0;i<7;i++)T.crack(boss,1); out.boss7={cracks:boss.cracks,need:8};
    T.crack(rb,1); run(6.3); out.fade=rb.cracks;
    /* a toll's ring cracks what it hears */
    const rc=hold('crawler',T.F.paths[0].len-2); T.update(.01); rc.cracks=0; T.F.cd.toll=0; T.castRite('toll'); run(.6); out.tollCrack=rc.cracks;
    /* the Tocsin: a tripped wire calls it; after the silence it shells the wire, wherever it is */
    fresh();
    const dkT=[], seenK=new Set(); for(let d=0;d<P().len;d+=.1){const q=T.posAt(P(),d), c=Math.floor(q[0]), rr=Math.floor(q[1]), k=c+','+rr; if(!seenK.has(k)&&!T.buildLit(c,rr)){seenK.add(k); dkT.push([c,rr]);}}
    T.setSel({kind:'ward',type:'bellwire'}); T.tryPlace(dkT[0][0],dkT[0][1]); T.setSel(null); const tw=T.F.towers[T.F.towers.length-1];
    let ts=null; for(let rr=0;rr<T.ROWS&&!ts;rr++)for(let c=0;c<T.COLS&&!ts;c++)if(!T.placeProblem({kind:'ward',type:'tocsin'},c,rr))ts=[c,rr];
    T.setSel({kind:'ward',type:'tocsin'}); T.tryPlace(ts[0],ts[1]); T.setSel(null); const toc=T.F.towers[T.F.towers.length-1];
    wave();
    const victim=T.spawnFoe('crawler',0,dAt(tw.x,tw.y)); victim.spawnT=0; victim.stunT=1e6; victim.hp=victim.max=1e6; tw.cd=0;
    T.update(.05); out.call={calls:T.F.tocsinCalls.length,dist:+Math.hypot(toc.x-tw.x,toc.y-tw.y).toFixed(1),ammo:toc.ammo};
    run(.5); out.silence=T.F.shots.filter(x=>x.k==='tocsin').length;
    run(.3); out.fired={shells:T.F.shots.filter(x=>x.k==='tocsin').length,ammo:toc.ammo};
    const vhp=victim.hp; run(1.6); out.landed={hurt:Math.round(vhp-victim.hp),reloading:toc.ammo===0&&toc.cd>0};
    T.render();
    /* a Perfect Toll: on the lamp's beat it reaches twice as far, cracks twice and makes no Noise; off the beat it is a plain Toll */
    fresh(); T.buyBranch(T.F.lamp,2); wave(); hold('crawler',1); T.F.noise=0;
    T.F.pealT=T.lstat().peal-.1; out.beatOff=+T.beatOff().toFixed(2); T.F.cd.toll=0; T.castRite('toll');
    const pt=T.F.tolls[T.F.tolls.length-1]; out.perfect={noise:T.F.noise,max:pt.max,cracks:pt.cracks,gold:pt.gold,pealReset:T.F.pealT};
    T.F.pealT=1.5; T.F.cd.toll=0; T.castRite('toll'); out.offbeat={noise:T.F.noise,max:T.F.tolls[T.F.tolls.length-1].max};
    T.render();

    /* the path she hears, and captions for playing without sound */
    fresh(); out.edges=T.pathEdges().length;
    localStorage.setItem('ll-captions','true'); wave(); hold('crawler',1); T.castRite('toll'); out.caption=T.F.fx.some(f=>f.cap);
    localStorage.removeItem('ll-captions');
    T.render();
    return out;});
  console.log(JSON.stringify(r));
  ok(r.kit.wards==='candle,harpoon,bellwire,tocsin,chime,censer'&&r.kit.rites==='toll,greatbell','her wards and rites',r.kit);
  ok(r.kit.who==='Agathe Vell'&&r.kit.candle==='Bell Candle'&&r.kit.harpoon==='Clapper Harpoon','Agathe Vell builds Bell Candles and Clapper Harpoons',r.kit);
  ok(r.kit.lamp==='Votive,Font,Peal','her lamp trades Fire for Peal',r.kit.lamp);
  ok(r.buildToll.tolls===0&&r.buildToll.noise===0,'Toll does nothing between waves',r.buildToll);
  ok(r.darkD!==null,'a dark stretch of path within reach of the toll');
  ok(!r.before[0]&&!r.before[1],'in the dark, unheard, neither can be seen',r.before);
  ok(r.heard.every(Boolean),'the toll hears a crawler and a Shade in the dark, and they can be seen',r.heard);
  ok(r.swing===3&&r.noise1===1,'Toll swings for 3 seconds and makes 1 Noise',[r.swing,r.noise1]);
  ok(r.faded[0]===0&&!r.faded[1]&&r.ghosts>=2,'the echo fades, and ghosts stay where they were',[r.faded,r.ghosts]);
  ok(r.noise4.n===4&&r.noise4.stalkers===0,'four tolls, 4 Noise, nothing answers yet',r.noise4);
  ok(Math.abs(r.faded1-1)<.05,'Noise fades 1 every 6 seconds',r.faded1);
  ok(r.answer.stalkers===2&&r.answer.noise===2,'at 5 Noise the dark answers: two Stalkers, and Noise drops to 2',r.answer);
  ok(r.peal.lstat===4&&r.peal.noise===0&&r.peal.crawler&&!r.peal.shade,'Peal tolls on its own every 4s, makes no Noise, and hears only the ordinary dark',r.peal);
  ok(r.cathedral.cap&&r.cathedral.stun>0,'Cathedral: a toll staggers what stands near the lamp',r.cathedral);
  ok(r.great.heard&&r.great.noise===3&&r.great.cd&&r.great.stunned,'the Great Bell hears the whole floor, veiled too, staggers, and makes 3 Noise',r.great);
  ok(r.wirePlace.dark===''&&r.wirePlace.off!==''&&/Too dark/.test(r.wirePlace.harpoonDark),'a Bell Wire goes on the path in the dark; nothing else does',r.wirePlace);
  ok(/Three Bell Wires/.test(r.wireMax),'three Bell Wires at most',r.wireMax);
  ok(r.wireLit,'a Bell Wire in the dark still works');
  ok(r.trip.shade===4&&r.trip.mate&&r.trip.cd,'a Shade crossing a wire is heard 4s, and its jangle hears what walks beside it',r.trip);
  ok(r.flier,'fliers pass over a Bell Wire');
  ok(r.chewed&&r.restrung,'a Gnasher chews through a wire, and it is restrung when the wave breaks',[r.chewed,r.restrung]);
  ok(r.relay.relayed,'a Bell Candle the toll reaches rings it again',r.relay);
  ok(r.clap&&r.clap.hear===2&&Math.abs(r.knock.back-.5)<.01&&r.knock.heard,'a Clapper bolt rings what it strikes and knocks it half a tile back',[r.clap,r.knock]);
  ok(!r.knockShade,'a Clapper bolt alone does not hear a Shade');
  ok(!r.chime.lit&&r.chime.hit&&r.chime.period===1.6,'her chimes hear and strike the ordinary dark, and ring 20% faster',r.chime);
  ok(Math.abs(r.lullaby.faded-1)<.05&&r.lullaby.max===5,'Her Lullaby: Noise fades twice as fast, and Toll reaches 2 tiles less',r.lullaby);
  ok(!['toll','greatbell','overload','anchor','raise'].some(k=>r.pool.includes(k))&&r.pool.length>0,'kit rites are never gifted to another kit',r.pool);
  ok(r.res1.cracks===2,'two cracks hold',r.res1);
  ok(r.res2.cracks===0&&r.res2.hurt>=20&&r.res2.splash>=12&&r.res2.nearCrack>=1&&r.res2.fx,'the third crack shatters it, hurting and cracking what stands beside it',r.res2);
  ok(r.boss7.cracks===7,'a boss holds 7 cracks without shattering',r.boss7);
  ok(r.fade===0,'cracks fade when nothing rings',r.fade);
  ok(r.tollCrack>=1,'a toll cracks what it hears',r.tollCrack);
  ok(r.call.calls===1&&r.call.dist>3,'a tripped Bell Wire calls the Tocsin, far away',r.call);
  ok(r.silence===0,'a breath of silence before it fires',r.silence);
  ok(r.fired.shells===1&&r.fired.ammo===0,'then it fires its shell',r.fired);
  ok(r.landed.hurt>=40&&r.landed.reloading,'the shell bursts on the wire, and the Tocsin reloads',r.landed);
  ok(Math.abs(r.beatOff-.1)<.02,'the beat is measured from the lamp’s own toll',r.beatOff);
  ok(r.perfect.noise===0&&r.perfect.max===14&&r.perfect.cracks===2&&r.perfect.gold&&r.perfect.pealReset===0,'a Perfect Toll: twice as far, two cracks, no Noise, and it takes the beat’s place',r.perfect);
  ok(r.offbeat.noise===1&&r.offbeat.max===7,'off the beat it is a plain Toll',r.offbeat);
  ok(r.edges>10,'she hears the path: its edges are traced in the dark',r.edges);
  ok(r.caption,'with Show sounds on, the toll writes itself on the board');
  ok(!errs.length,'no page errors',errs);
  await b.close();
  if(fails.length){console.log('FAIL\n- '+fails.join('\n- ')); process.exit(1);} console.log('bellringer ok');
})();
