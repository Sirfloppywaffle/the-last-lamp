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
    setup('bellringer'); out.whalerNames=[T.wdef('candle').n,T.wdef('harpoon').n]; out.lampSame=Math.abs(T.lampBase()-lampL)<1e-9;

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

    // kit branches: the Signal Candle trades Wax for Signal, the Flare Harpoon trades Sight for Flare
    setup('lamplighter');
    const bc=placeAt('candle',edge[0],edge[1]); T.update(1/30);
    out.trees={candle:[0,1,2].map(i=>T.treeOf('candle')[i].n), harpoon:[0,1,2].map(i=>T.treeOf('harpoon')[i].n), whaler:[0,1,2].map(i=>T.treeOf('harpoon','bellringer')[i].n)};
    // Signal tier 2: the light leaps 6 tiles
    const farSpot=tiles().find(([c,r])=>dark(c,r)&&Math.hypot(c-edge[0],r-edge[1])>4.3&&Math.hypot(c-edge[0],r-edge[1])<=5.8&&T.F.towers.every(t=>t===bc||Math.hypot(c+.5-t.x,r+.5-t.y)>4.5));
    out.signal2={spot:!!farSpot, before:farSpot?T.placeProblem({kind:'ward',type:'candle'},farSpot[0],farSpot[1]):'none'};
    T.buyBranch(bc,1); T.buyBranch(bc,1); T.update(1/30);
    if(farSpot){const c3=placeAt('candle',farSpot[0],farSpot[1]); T.update(1/30); out.signal2.after=!!c3&&!c3.dark;}
    // Fire Thread: a creature crossing a thread from a capstone candle catches fire
    setup('lamplighter'); wave();
    const fa=placeAt('candle',edge[0],edge[1]); for(let i=0;i<3;i++)T.buyBranch(fa,1); T.update(1/30);
    const P2=T.F.paths[0]; let cross=null;
    for(const [c,r] of tiles()){
      if(!dark(c,r)||T.placeProblem({kind:'ward',type:'candle'},c,r)!=='')continue;
      for(let d=1;d<P2.len-1;d+=.1){const q=T.posAt(P2,d); if(T.segDist(q[0],q[1],fa.x,fa.y,c+.5,r+.5)<.2&&Math.hypot(q[0]-fa.x,q[1]-fa.y)>.6){cross={c,r,d}; break;}}
      if(cross)break;
    }
    out.thread={found:!!cross};
    if(cross){placeAt('candle',cross.c,cross.r); T.update(1/30); out.thread.threads=T.F.threads.length;
      const fe=T.spawnFoe('crawler',0,Math.max(0,cross.d-1)); fe.hp=fe.max=1e6; let lit=0;
      for(let k=0;k<60;k++){T.update(1/30); if(fe.kindleT>0)lit++;}
      out.thread.burned=lit>0;}
    // Starshell: every fourth bolt lights a 3-tile circle
    setup('lamplighter'); wave();
    {const P=T.F.paths[0]; let d=P.len-2.2; for(;d>0;d-=.25){const q=T.posAt(P,d); if(Math.hypot(q[0]-T.F.lx,q[1]-T.F.ly)>2.2)break;}
     const q=T.posAt(P,d);
     const hs=tiles().filter(([c,r])=>T.placeProblem({kind:'ward',type:'harpoon'},c,r)==='').sort((a,b)=>Math.hypot(a[0]+.5-q[0],a[1]+.5-q[1])-Math.hypot(b[0]+.5-q[0],b[1]+.5-q[1]))[0];
     const sh=placeAt('harpoon',hs[0],hs[1]); for(let i=0;i<3;i++)T.buyBranch(sh,2);
     const cr=T.spawnFoe('crawler',0,d); cr.hp=cr.max=1e6; cr.stunT=99;
     let star=0, small=0; for(let k=0;k<300;k++){T.update(1/30); for(const gl of T.F.glints){if(gl.r>=2.9)star++; else small++;}}
     out.star={star:star>0, small:small>0, range:+T.wstat(sh).range.toFixed(2)};}

    // first-time tips for the Signal Candle, flare bolts and Kindle (AGENTS.md rule 23)
    const tipFor=(prep)=>{setup('lamplighter'); T.tutSet({walk:'done',seen:[],off:false}); prep(); T.F.born=-1e6; T.coachPoll(); const k=T.COACH.on?T.COACH.key:''; T.tutSet({walk:'done',seen:[],off:true}); document.querySelector('#coach').hidden=true; T.COACH.on=false; return k;};
    out.tips=[
      tipFor(()=>{T.setSel({kind:'ward',type:'candle'});}),
      tipFor(()=>{wave(); T.F.glints.push({x:T.F.lx,y:T.F.ly-1,t:1}); T.update(1/30); T.F.glints.push({x:T.F.lx,y:T.F.ly-1,t:1});}),
      tipFor(()=>{wave(); const e=T.spawnFoe('crawler',0,T.F.paths[0].len-2); e.stunT=99; T.update(1/30);})];
    T.tutSet({walk:'done',seen:[],off:true});

    // ---- the Whaler ----
    setup('whaler');
    out.wh={names:[T.wdef('candle').n,T.wdef('harpoon').n], wards:T.run.wards.join(','), trees:[T.treeOf('candle')[2].n,T.treeOf('harpoon')[2].n]};
    const wc=placeAt('candle',edge[0],edge[1]); T.update(1/30);
    out.wh.light=+(T.wstat(wc).light-2.3).toFixed(2);
    // Blubber Lamps cost 1 oil a wave with no pot
    T.run.oil=T.run.oilMax=20; T.startWave(); out.wh.toll=20-T.run.oil;
    // every lamp drinks: three lamps with no pot cost 3
    {const extra=tiles().filter(([c,r])=>T.placeProblem({kind:'ward',type:'candle'},c,r)==='').slice(0,2); extra.forEach(([c,r])=>placeAt('candle',c,r)); T.update(1/30);
     T.F.phase='build'; T.run.oil=20; out.wh.due=T.blubberDue(); T.startWave(); out.wh.toll3=20-T.run.oil;}
    // a Try-pot renders the dead: 6 Gnashers (2 oil each) make one measure, which feeds the next wave
    setup('whaler'); T.run.oil=T.run.oilMax=20;
    placeAt('candle',edge[0],edge[1]); T.update(1/30);
    const PW=T.F.paths[0]; let pd=PW.len-2; const pq=T.posAt(PW,pd);
    const pt=tiles().filter(([c,r])=>T.placeProblem({kind:'ward',type:'trypot'},c,r)==='').sort((a,b)=>Math.hypot(a[0]+.5-pq[0],a[1]+.5-pq[1])-Math.hypot(b[0]+.5-pq[0],b[1]+.5-pq[1]))[0];
    const pot=placeAt('trypot',pt[0],pt[1]); T.update(1/30);
    for(let i=0;i<6;i++){const g=T.spawnFoe('gnasher',0,pd); g.x=pot.x+.3; g.y=pot.y; T.hurt(g,1e6);}
    out.wh.meas=pot.meas||0;
    T.startWave(); out.wh.fed={oil:T.run.oil, meas:pot.meas};
    // a full pot pours into the lamp
    pot.meas=4; T.run.oil=10; for(let i=0;i<6;i++){const g=T.spawnFoe('gnasher',0,pd); g.x=pot.x+.3; g.y=pot.y; T.hurt(g,1e6);}
    out.wh.pour=T.run.oil;
    // what is left when the floor ends pours in
    pot.meas=3; T.run.oil=10; out.wh.endPour=[T.potsPour(),T.run.oil,pot.meas];
    // the Try-pot never turns up as a gift or in other kits
    setup('lamplighter'); out.wh.lampHasPot=T.run.wards.includes('trypot');

    // Tether Harpoon: the line slows its catch more the longer it holds, up to 40%
    const tetherRun=(kit,line)=>{setup(kit); wave();
      const P=T.F.paths[0]; let d=P.len-2.2; for(;d>0;d-=.25){const q=T.posAt(P,d); if(Math.hypot(q[0]-T.F.lx,q[1]-T.F.ly)>2.2)break;}
      const q=T.posAt(P,d);
      const hs=tiles().filter(([c,r])=>T.placeProblem({kind:'ward',type:'harpoon'},c,r)==='').sort((a,b)=>Math.hypot(a[0]+.5-q[0],a[1]+.5-q[1])-Math.hypot(b[0]+.5-q[0],b[1]+.5-q[1]))[0];
      const h=placeAt('harpoon',hs[0],hs[1]); for(let i=0;i<line;i++)T.buyBranch(h,2);
      const e=T.spawnFoe('gnasher',0,d); e.hp=e.max=1e6; e.stunT=99;
      for(let k=0;k<90;k++)T.update(1/30);
      e.stunT=0; const d0=e.d; for(let k=0;k<30;k++)T.update(1/30);
      return {held:!!e.tetherBy, t:+(e.tetherT||0).toFixed(1), speed:+((e.d-d0)/(e.def.spd*1)).toFixed(2), d:+e.d.toFixed(2), d0:+d0.toFixed(2)};};
    out.teth=tetherRun('whaler',0); out.tethLamp=tetherRun('lamplighter',0);
    // the line lets go when the harpoon fires at something else, even if that bolt never lands
    {setup('whaler'); wave();
     const P=T.F.paths[0]; let d=P.len-3; for(;d>0;d-=.25){const q=T.posAt(P,d); if(Math.hypot(q[0]-T.F.lx,q[1]-T.F.ly)>2.2)break;}
     const q=T.posAt(P,d);
     const hs=tiles().filter(([c,r])=>T.placeProblem({kind:'ward',type:'harpoon'},c,r)==='').sort((a,b)=>Math.hypot(a[0]+.5-q[0],a[1]+.5-q[1])-Math.hypot(b[0]+.5-q[0],b[1]+.5-q[1]))[0];
     const h=placeAt('harpoon',hs[0],hs[1]);
     const a=T.spawnFoe('gnasher',0,d); a.hp=a.max=1e6; a.stunT=99;
     for(let k=0;k<60;k++)T.update(1/30);
     const heldA=a.tetherBy===h;
     // a creature it prefers turns up; its first bolt at it is in the air
     h.tgt='strong'; const b=T.spawnFoe('behemoth',0,d+.2); b.hp=b.max=1e7; b.stunT=99; h.cd=0;
     T.update(1/30); const firedAtB=T.F.shots.some(x=>x.tg===b);
     b.dead=true; T.update(1/30); T.update(1/30);
     out.release={heldA, firedAtB, aFree:a.tetherBy==null, hHolds:h.tethered?h.tethered.type:null};}
    // Reel In: held 5 seconds without moving, the catch is hauled back a tile
    {setup('whaler'); wave();
     const P=T.F.paths[0]; let d=P.len-3; for(;d>0;d-=.25){const q=T.posAt(P,d); if(Math.hypot(q[0]-T.F.lx,q[1]-T.F.ly)>2.2)break;}
     const q=T.posAt(P,d);
     const hs=tiles().filter(([c,r])=>T.placeProblem({kind:'ward',type:'harpoon'},c,r)==='').sort((a,b)=>Math.hypot(a[0]+.5-q[0],a[1]+.5-q[1])-Math.hypot(b[0]+.5-q[0],b[1]+.5-q[1]))[0];
     const h=placeAt('harpoon',hs[0],hs[1]); for(let i=0;i<3;i++)T.buyBranch(h,2);
     const e=T.spawnFoe('gnasher',0,d); e.hp=e.max=1e6; e.stunT=99;
     for(let k=0;k<150;k++)T.update(1/30);
     out.tethHaul={held:!!e.tetherBy,back:+(d-e.d).toFixed(2)};}

    // Reek: the smoke keeps slowing a creature after it leaves the light
    setup('whaler'); wave();
    {const rc=placeAt('candle',edge[0],edge[1]); for(let i=0;i<2;i++)T.buyBranch(rc,2); T.update(1/30);
     const e=T.spawnFoe('crawler',0,1); e.hp=e.max=1e6; e.x=rc.x; e.y=rc.y; e.reekT=0;
     T.update(1/30); const r0=e.reekT; e.x=e.y=-50; T.update(1/30); out.reek={inLight:r0, after:+e.reekT.toFixed(2), s:e.reekS};}
    // Lure: at a fork, a capstone Blubber Lamp lighting a way draws the crowd down it
    setup('whaler'); T.run.floor=1; T.beginFloor(null); T.setP(false);
    {const fk=T.F.forks[0]; const sm=fk.samples[1];
     const plain=T.forkPick(fk,T.spawnFoe('crawler',0,0));
     const mi=(sm.length>>1)&~1, s0=fk.samples[0];
     out.lureGap=Math.min(...Array.from({length:s0.length/2},(_,i)=>Math.hypot(s0[2*i]-sm[mi],s0[2*i+1]-sm[mi+1]))).toFixed(2);
     T.F.cands=[{x:sm[mi],y:sm[mi+1],st:{lure:true,light:1.2}}];
     const lured=T.forkPick(fk,T.spawnFoe('crawler',0,0)), boss=T.forkPick(fk,T.spawnFoe('boss',0,0));
     out.lure={plain,lured,boss};}
    // the Whaler's tips
    const whTip=(prep)=>{setup('whaler'); T.tutSet({walk:'done',seen:['blubber','trypot','tether'].filter(k=>k!==prep.k),off:false}); prep.f(); T.F.born=-1e6; T.coachPoll(); const k=T.COACH.on?T.COACH.key:''; T.tutSet({walk:'done',seen:[],off:true}); document.querySelector('#coach').hidden=true; T.COACH.on=false; return k;};
    out.whTips=[whTip({k:'blubber',f:()=>T.setSel({kind:'ward',type:'candle'})}),
      whTip({k:'trypot',f:()=>{placeAt('candle',edge[0],edge[1]);}}),
      whTip({k:'tether',f:()=>{wave(); const e=T.spawnFoe('crawler',0,T.F.paths[0].len-3); e.tetherBy={}; }})];

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
  ok(r.trees.candle.join()==='Glow,Signal,Ember'&&r.trees.harpoon.join()==='Speed,Strength,Flare','the Lamplighter wards have their own branches',r.trees);
  ok(r.trees.whaler.join()==='Speed,Strength,Sight','other kits keep the plain branches',r.trees.whaler);
  ok(r.signal2.spot&&/4 tiles|leaps/.test(r.signal2.before)&&r.signal2.after===true,'the Signal branch lets the light leap further',r.signal2);
  ok(r.thread.found&&r.thread.threads>0&&r.thread.burned,'a Fire Thread sets what crosses it burning',r.thread);
  ok(r.star.star&&r.star.small,'Starshell lights a wide circle every fourth bolt',r.star);
  ok(r.tips.join()==='signal,flarebolt,kindle','first-time tips teach the Signal Candle, flare bolts and Kindle',r.tips);
  ok(r.wh.names.join()==='Blubber Lamp,Tether Harpoon'&&/trypot/.test(r.wh.wards),'the Whaler builds Blubber Lamps, Tether Harpoons and the Try-pot',r.wh);
  ok(r.wh.trees.join()==='Reek,Line','the Whaler wards have their own branches',r.wh.trees);
  ok(r.wh.light===.8,'a Blubber Lamp burns 0.8 wider',r.wh.light);
  ok(r.wh.toll===1,'one Blubber Lamp drinks 1 oil a wave with no pot',r.wh.toll);
  ok(r.wh.toll3===3&&r.wh.due.lamps===3,'every Blubber Lamp drinks: three cost 3',[r.wh.toll3,r.wh.due]);
  ok(r.wh.meas===2&&r.wh.fed.oil===20&&r.wh.fed.meas===1,'six Gnashers render two measures, and one feeds the lamp',[r.wh.meas,r.wh.fed]);
  ok(r.wh.pour===12,'a full pot pours its overflow into the lamp',r.wh.pour);
  ok(r.wh.endPour.join()==='3,13,0','what is left at the floor end pours in',r.wh.endPour);
  ok(!r.wh.lampHasPot,'other kits have no Try-pot');
  ok(r.teth.held&&r.teth.speed<.75,'the line holds and slows its catch',r.teth);
  ok(!r.tethLamp.held&&r.tethLamp.speed>.95,'plain harpoons hold nothing',r.tethLamp);
  ok(r.release.heldA&&r.release.firedAtB&&r.release.aFree,'the line lets go as soon as the harpoon fires at another',r.release);
  ok(r.tethHaul.held&&r.tethHaul.back>=.9,'Reel In hauls its catch back a tile',r.tethHaul);
  ok(r.reek.inLight===4&&r.reek.after>3.9&&r.reek.s>0,'Reek keeps slowing a creature after it leaves the light',r.reek);
  ok(r.lure.plain===0&&r.lure.lured===1&&r.lure.boss===0,'Lure draws the crowd down the way it lights, never a boss',[r.lure,r.lureGap]);
  ok(r.whTips.join()==='blubber,trypot,tether','first-time tips teach the Blubber Lamp, the Try-pot and the line',r.whTips);
  ok(r.book&&r.bookWards,'the Grimoire shows the kit and its wards',[r.book,r.bookWards]);
  fails.forEach(f=>console.log('FAIL '+f));
  await b.close();
  process.exitCode=fails.length?1:0;
})();
