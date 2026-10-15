// Kits that play differently (#26). The Lamplighter: Signal Candles that stand in the dark within 4 tiles of a lit one,
// Flare Harpoons whose bolts light and unveil where they strike, and Kindle. Other kits keep the plain Candle and Harpoon.
const {chromium}=require('playwright');
const fails=[]; const ok=(cond,msg,detail)=>{if(!cond)fails.push(msg+(detail!==undefined?' '+JSON.stringify(detail):''));};
(async()=>{
  const b=await chromium.launch(); const p=await b.newPage({viewport:{width:900,height:700}});
  await p.goto('file://'+process.argv[2]); await p.waitForTimeout(300);

  const r=await p.evaluate(()=>{
    const T=__t, out={};
    const setup=(kit)=>{T.newRun(kit,0); T.run.floor=0; T.beginFloor(null); T.run.ess=9000; T.run.oil=T.run.oilMax=999; T.setP(false);};
    const wave=()=>{T.F.phase='wave'; T.F.queue=[{t:1e9,type:'crawler',gate:0}];};
    const placeAt=(type,c,r)=>{T.setSel({kind:'ward',type}); T.tryPlace(c,r); T.setSel(null); return T.F.towers.find(t=>t.c===c&&t.r===r&&t.type===type);};
    const tiles=()=>{const a=[]; for(let r=0;r<T.ROWS;r++)for(let c=0;c<T.COLS;c++)a.push([c,r]); return a;};
    const far=(c,r)=>Math.hypot(c+.5-T.F.lx,r+.5-T.F.ly);
    const dark=(c,r)=>/Too dark/.test(T.placeProblem({kind:'ward',type:'harpoon'},c,r));

    // names, rites and the old perks gone
    setup('lamplighter');
    out.names=[T.wdef('candle').n,T.wdef('harpoon').n,T.run.rites.join(',')];
    out.cost=T.wardCost('candle'); const lampL=T.lampBase();
    setup('whaler'); out.whalerNames=[T.wdef('candle').n,T.wdef('harpoon').n]; out.lampSame=Math.abs(T.lampBase()-lampL)<1e-9;

    // a Signal Candle at the edge of the light, then one in the dark within 4 tiles of it
    setup('lamplighter');
    const edge=tiles().filter(([c,r])=>!T.placeProblem({kind:'ward',type:'candle'},c,r)).sort((a,b)=>far(...b)-far(...a))[0];
    const c1=placeAt('candle',edge[0],edge[1]); T.update(1/30);
    const lit=T.wstat(c1).light;
    const spot=tiles().find(([c,r])=>dark(c,r)&&Math.hypot(c-edge[0],r-edge[1])<=3.9&&Math.hypot(c-edge[0],r-edge[1])>lit+.6&&T.placeProblem({kind:'ward',type:'candle'},c,r)==='');
    out.spot=!!spot;
    if(spot){
      const c2=placeAt('candle',spot[0],spot[1]); T.update(1/30);
      out.leap={placed:!!c2, dark:c2&&c2.dark, links:T.F.links.length};
      // a harpoon in the new candle's light works
      const hs=tiles().find(([c,r])=>Math.hypot(c+.5-c2.x,r+.5-c2.y)<=1.5&&T.placeProblem({kind:'ward',type:'harpoon'},c,r)==='');
      if(hs){const h=placeAt('harpoon',hs[0],hs[1]); T.update(1/30); out.outpostHarpoon=h&&!h.dark;}
      // take the first candle away and the outpost goes dark
      T.F.towers=T.F.towers.filter(t=>t!==c1); T.update(1/30); out.cut=c2.dark;
    }
    const tooFar=tiles().find(([c,r])=>dark(c,r)&&T.F.towers.every(t=>Math.hypot(c+.5-t.x,r+.5-t.y)>4.5));
    out.tooFar=tooFar?T.placeProblem({kind:'ward',type:'candle'},tooFar[0],tooFar[1]):'none';
    // other kits: the same dark tile is refused
    setup('whaler');
    const w1=placeAt('candle',edge[0],edge[1]); T.update(1/30);
    out.whalerDark=spot?T.placeProblem({kind:'ward',type:'candle'},spot[0],spot[1]):'none';

    // Flare Harpoon: a bolt lights the spot it strikes, so a Shade beside its target is unveiled
    const flareRun=(kit)=>{
      setup(kit); wave();
      const P=T.F.paths[0];
      let d=P.len-2.2; for(;d>0;d-=.25){const q=T.posAt(P,d); if(Math.hypot(q[0]-T.F.lx,q[1]-T.F.ly)>2.2)break;}
      const q=T.posAt(P,d);
      const hs=tiles().filter(([c,r])=>T.placeProblem({kind:'ward',type:'harpoon'},c,r)==='').sort((a,b)=>Math.hypot(a[0]+.5-q[0],a[1]+.5-q[1])-Math.hypot(b[0]+.5-q[0],b[1]+.5-q[1]))[0];
      placeAt('harpoon',hs[0],hs[1]);
      const cr=T.spawnFoe('crawler',0,d), sh=T.spawnFoe('shade',0,d);
      cr.hp=cr.max=sh.hp=sh.max=1e6; cr.stunT=sh.stunT=99;
      let glints=0, seen=0;
      for(let k=0;k<120;k++){T.update(1/30); glints=Math.max(glints,T.F.glints.length); if(T.canSee(sh))seen++;}
      return {glints,seen};
    };
    out.flare=flareRun('lamplighter'); out.flareWhaler=flareRun('whaler');

    // Kindle: a creature in the dark burns, lights itself and runs; a ward cut off near it wakes
    setup('lamplighter'); wave();
    const P=T.F.paths[0];
    let d0=1; for(;d0<P.len;d0+=.25){const q=T.posAt(P,d0); if(Math.hypot(q[0]-T.F.lx,q[1]-T.F.ly)>T.lampBase()+3)break;}
    const q0=T.posAt(P,d0);
    // a harpoon dropped in the dark beside the path (as if its light had been cut)
    const ds=tiles().find(([c,r])=>dark(c,r)&&!/path/.test(T.placeProblem({kind:'ward',type:'harpoon'},c,r))&&Math.hypot(c+.5-q0[0],r+.5-q0[1])<=1.2);
    let H=null; if(ds){H={kind:'ward',type:'harpoon',id:9999,c:ds[0],r:ds[1],x:ds[0]+.5,y:ds[1]+.5,br:{speed:0,strength:0,sight:0},tgt:'first',invested:0,fresh:0,cd:.3,ang:0,ring:0,echo:0}; T.F.towers.push(H);}
    const a=T.spawnFoe('crawler',0,d0), c=T.spawnFoe('crawler',0,d0);
    a.hp=a.max=c.hp=c.max=1e6; a.stunT=c.stunT=99;
    T.update(1/30);
    out.kindleBefore={seen:T.canSee(a), wardDark:H?H.dark:null};
    T.castKindle(a); T.update(1/30);
    out.kindleOn={seen:T.canSee(a), wardDark:H?H.dark:null, t:+a.kindleT.toFixed(2), cd:T.F.cd.kindle};
    a.stunT=c.stunT=0; const s0=a.d, s1=c.d;
    for(let k=0;k<30;k++)T.update(1/30);
    out.kindleRun=+((a.d-s0)/Math.max(1e-6,c.d-s1)).toFixed(2); out.kindleBurn=Math.round(1e6-a.hp);
    a.stunT=99; for(let k=0;k<240;k++)T.update(1/30);
    out.kindleAfter={t:a.kindleT, light:T.F.L.some(L=>L.kindle)};

    // first-time tips for the Signal Candle, flare bolts and Kindle (AGENTS.md rule 23)
    const tipFor=(prep)=>{setup('lamplighter'); T.tutSet({walk:'done',seen:[],off:false}); prep(); T.F.born=-1e6; T.coachPoll(); const k=T.COACH.on?T.COACH.key:''; T.tutSet({walk:'done',seen:[],off:true}); document.querySelector('#coach').hidden=true; T.COACH.on=false; return k;};
    out.tips=[
      tipFor(()=>{placeAt('candle',edge[0],edge[1]); T.update(1/30);}),
      tipFor(()=>{wave(); T.F.glints.push({x:T.F.lx,y:T.F.ly-1,t:1}); T.update(1/30); T.F.glints.push({x:T.F.lx,y:T.F.ly-1,t:1});}),
      tipFor(()=>{wave(); const e=T.spawnFoe('crawler',0,T.F.paths[0].len-2); e.stunT=99; T.update(1/30);})];
    T.tutSet({walk:'done',seen:[],off:true});

    // the Grimoire's Kits tab lists the kit's own wards
    T.openBook('title','kits'); out.book=document.querySelector('#mChoices').innerText.includes('Signal Candle');
    T.openBook('title','wards'); out.bookWards=document.querySelector('#mChoices').innerText.includes('Flare Harpoon');
    return out;
  });
  console.log(JSON.stringify(r));
  ok(r.names[0]==='Signal Candle'&&r.names[1]==='Flare Harpoon','Lamplighter wards are named',r.names);
  ok(r.names[2]==='kindle,pillar','Lamplighter casts Kindle and the Pillar',r.names[2]);
  ok(r.cost===30,'Signal Candles cost what candles cost',r.cost);
  ok(r.whalerNames[0]==='Candle Ward'&&r.whalerNames[1]==='Brine Harpoon','other kits keep the plain wards',r.whalerNames);
  ok(r.lampSame,'the Lamplighter lamp no longer burns wider');
  ok(r.spot,'found a dark tile within 4 tiles of a lit Signal Candle');
  ok(r.leap&&r.leap.placed&&!r.leap.dark&&r.leap.links===1,'a Signal Candle stands in the dark and its light leaps',r.leap);
  ok(r.outpostHarpoon===true,'a ward in the leaped light works',r.outpostHarpoon);
  ok(r.cut===true,'cutting the link darkens the outpost',r.cut);
  ok(/4 tiles/.test(r.tooFar),'too far from any Signal Candle is refused with the reason',r.tooFar);
  ok(/Too dark/.test(r.whalerDark),'other kits cannot build a candle in the dark',r.whalerDark);
  ok(r.flare.glints>0&&r.flare.seen>0,'flare bolts light and unveil the Shade beside their target',r.flare);
  ok(r.flareWhaler.glints===0&&r.flareWhaler.seen===0,'plain harpoons do not',r.flareWhaler);
  ok(!r.kindleBefore.seen&&r.kindleOn.seen,'a kindled creature lights itself',[r.kindleBefore,r.kindleOn]);
  ok(r.kindleBefore.wardDark===true&&r.kindleOn.wardDark===false,'a ward cut off beside a kindled creature wakes',[r.kindleBefore,r.kindleOn]);
  ok(r.kindleOn.cd>29&&r.kindleOn.cd<=30,'Kindle goes on cooldown',r.kindleOn.cd);
  ok(r.kindleRun>1.15&&r.kindleRun<1.35,'a kindled creature runs about 25% faster',r.kindleRun);
  ok(r.kindleBurn>0,'a kindled creature burns',r.kindleBurn);
  ok(r.kindleAfter.t<=0&&!r.kindleAfter.light,'the fire goes out after 8 seconds',r.kindleAfter);
  ok(r.tips.join()==='signal,flarebolt,kindle','first-time tips teach the Signal Candle, flare bolts and Kindle',r.tips);
  ok(r.book&&r.bookWards,'the Grimoire shows the kit and its wards',[r.book,r.bookWards]);
  fails.forEach(f=>console.log('FAIL '+f));
  await b.close();
  process.exitCode=fails.length?1:0;
})();
