// Map variants (#73): every map of every floor (the boss floors too), in both board orientations. Each one builds, keeps its roads apart,
// holds its length near map 0, leaves room to build by the lamp for every kit, walks a creature from every mouth to
// the lamp, and survives the floor systems keyed to the path (water, bodies, chalk, forks, Heralds).
// The draw: a resumed floor keeps its map, an old save plays map 0, the first descent plays map 0, and the bag
// shows every map of a floor before any repeats.
const {chromium}=require('playwright');
const fails=[]; const ok=(cond,msg,detail)=>{if(!cond)fails.push(msg+(detail!==undefined?' '+JSON.stringify(detail):''));};
(async()=>{
  const b=await chromium.launch();
  const orients=[];
  for(const vp of [{width:900,height:700},{width:412,height:860}]){
    const p=await b.newPage({viewport:vp});
    const errs=[]; p.on('pageerror',e=>errs.push(e.message));
    await p.goto('file://'+process.argv[2]); await p.waitForTimeout(300);
    const r=await p.evaluate(()=>{
      const T=__t, out=[];
      const key=(c,r)=>c+','+r;
      const kits=Object.keys(T.KITS);
      const setup=(f,v,kit)=>{T.setMapV(v); T.newRun(kit); T.run.floor=f; T.beginFloor(null); T.run.ess=9000; T.run.oil=T.run.oilMax=999; T.setP(false);};
      // the tiles a path walks, in board order
      const tilesOf=(P)=>{const s=[]; for(let d=0;d<=P.len;d+=.25){const q=T.posAt(P,Math.min(d,P.len)); const k=key(Math.floor(q[0]),Math.floor(q[1])); if(s[s.length-1]!==k)s.push(k);} return s;};
      for(let f=0;f<T.FLOORS.length;f++){
        const maps=T.floorMaps(f);
        setup(f,0); const base=T.F.paths.map(P=>P.len);
        for(let v=0;v<maps.length;v++){
          const o={floor:f+1,map:v,name:maps[v].n};
          setup(f,v);
          const F=T.F;
          o.picked=F.def.mapv===v&&F.def.mapN===maps[v].n;
          o.roots=F.nRoots; o.roots0=T.FLOORS[f].paths.length;
          const lampK=key(F.lampC,F.lampR);
          // every road stays on the board and ends on the lamp
          o.bounds=F.paths.every(P=>tilesOf(P).every(k=>{const [c,r]=k.split(',').map(Number); return c>=0&&r>=0&&c<T.COLS&&r<T.ROWS;}));
          o.ends=F.paths.every(P=>tilesOf(P).at(-1)===lampK);
          // roots never share a tile but the lamp's, and a root never crosses itself
          const owner=new Map(); o.shared=[]; o.selfCross=[];
          for(let i=0;i<F.nRoots;i++){const ts=tilesOf(F.paths[i]); if(new Set(ts).size!==ts.length)o.selfCross.push(i);
            for(const k of ts){if(k===lampK)continue; if(owner.has(k)&&owner.get(k)!==i)o.shared.push(k); owner.set(k,i);}}
          // forks: one per root, the branch shares the root's prefix and is longer than the way it replaces
          o.forks=F.forks.map(fk=>{const A=F.paths[fk.opts[0]], B=F.paths[fk.opts[1]], a=T.posAt(A,fk.d), c=T.posAt(B,fk.d);
            /* light can steer it: for each way, some open tile where one candle lights clearly more of that way than the
               other (a fork whose ways run side by side can't be steered by light, which is its whole point) */
            const lr=T.wstat({kind:'ward',type:'candle',br:{}}).light, s0=fk.samples[0], s1=fk.samples[1];
            const cnt=(s,x,y)=>{let n=0; for(let i=0;i<s.length;i+=2)if(Math.hypot(s[i]-x,s[i+1]-y)<=lr)n++; return n;};
            let only0=false, only1=false;
            for(let r=0;r<T.ROWS;r++)for(let c=0;c<T.COLS;c++){if(F.pathTiles.has(key(c,r)))continue; const a=cnt(s0,c+.5,r+.5), b2=cnt(s1,c+.5,r+.5);
              if(a-b2>=3)only0=true; if(b2-a>=3)only1=true;}
            const apart=only0&&only1;
            return {prefix:Math.hypot(a[0]-c[0],a[1]-c[1])<1e-6, longer:B.len>A.len, onPath:F.pathTiles.has(key(fk.c,fk.r)), apart};});
          o.forkRoots=F.forks.map(fk=>fk.opts[0]);
          o.forkOk=o.forks.every(x=>x.prefix&&x.longer&&x.onPath&&x.apart)&&new Set(o.forkRoots).size===o.forkRoots.length;
          o.hasFork=F.forks.length>0;
          // lengths: each road within 20% of map 0's
          o.lens=F.paths.map(P=>+P.len.toFixed(1)); o.base=base.map(x=>+x.toFixed(1));
          o.lenOk=F.paths.every((P,i)=>i>=base.length||Math.abs(P.len-base[i])/base[i]<=.2);
          // the boss floors: the boss walks gate 0, so gate 0 stays the longest way in, as on map 0
          const fw=T.FLOORS[f].waves.flat(), bossGate=fw.filter(g=>g[0]==='boss'||g[0]==='boss2').map(g=>g[4]||0);
          o.bossLong=!bossGate.length||bossGate.every(g=>F.paths.slice(0,F.nRoots).every((P,i)=>P.len<=F.paths[g].len+1e-6));
          // the lamp's light stays on the board
          o.lampIn=F.lx-3.7>=0&&F.ly-3.7>=0&&F.lx+3.7<=T.COLS&&F.ly+3.7<=T.ROWS;
          // room to build: free tiles in the lamp's own light
          const cand={kind:'ward',type:'candle'}; let room=0;
          for(let r=0;r<T.ROWS;r++)for(let c=0;c<T.COLS;c++)if(Math.hypot(c+.5-F.lx,r+.5-F.ly)<=3.7&&!F.pathTiles.has(key(c,r))&&!(c===F.lampC&&r===F.lampR))room++;
          o.room=room;
          // empty ground: open tiles more than two tiles from any road. Criss flagged the maps with 25 to 51 of them as
          // "too much empty" (#75); the ones he liked have 1 to 16
          const pts=[...F.pathTiles].map(k=>k.split(',').map(Number)); let far=0;
          for(let r=0;r<T.ROWS;r++)for(let c=0;c<T.COLS;c++){if(F.pathTiles.has(key(c,r)))continue; if(!pts.some(([x,y])=>Math.hypot(x-c,y-r)<=2))far++;}
          o.empty=far;
          // a crawler from every mouth (and down every branch) reaches the lamp
          o.walk=[];
          for(let g=0;g<F.paths.length;g++){
            setup(f,v); T.F.phase='wave'; T.F.queue=[{t:1e9,type:'crawler',gate:0}];
            const e=T.spawnFoe('crawler',g,0); e.hp=e.max=1e9; const o0=T.run.oil; let n=0;
            for(;n<6000&&!e.dead;n++)T.update(1/20);
            o.walk.push(e.dead&&T.run.oil<o0);
          }
          // every kit can build its light and its first striking ward by the lamp
          o.kits={};
          for(const k of kits){
            setup(f,v,k);
            const ws=T.run.wards.filter(w=>!T.wdef(w).path&&!T.wdef(w).fork);
            let built=0;
            for(const w of ws.slice(0,3)){const it={kind:'ward',type:w}; let best=null, bd=1e9;
              for(let r=0;r<T.ROWS;r++)for(let c=0;c<T.COLS;c++){if(T.placeProblem(it,c,r))continue; const d=Math.hypot(c+.5-T.F.lx,r+.5-T.F.ly); if(d<bd){bd=d; best=[c,r];}}
              if(best){T.setSel(it); const n0=T.F.towers.length; T.tryPlace(best[0],best[1]); if(T.F.towers.length>n0)built++;}}
            T.setSel(null);
            o.kits[k]=built+'/'+Math.min(3,ws.length);
          }
          // the floor's path-keyed systems: the Drowned Mother's water, the Occultist's bodies, the Hallowed Ground, a Herald's rift
          setup(f,v); T.run.water=null; T.floodSeed(); o.water=T.F.water.size;
          setup(f,v,'occultist'); o.bodies=f===0?T.F.bodies.size:-1;
          setup(f,v); T.run.trial='hallowed'; T.run.hallow=null; T.beginFloor(null); o.hallow=T.F.hallowG?T.F.hallowG.tiles.length:0;
          o.herald=T.heraldGate({type:'lastkeeper',wave:1})<T.F.nRoots;
          out.push(o);
        }
      }
      // a resumed floor keeps its map, even if the draw would now say otherwise; an old save plays map 0
      const save={};
      setup(1,2); T.checkpoint(); const snap=JSON.parse(JSON.stringify({run:T.run,wave:T.F.wave,towers:[],lamp:{br:T.F.lamp.br,invested:0}}));
      T.setMapV(1); T.resumeFrom(JSON.parse(JSON.stringify(snap))); save.kept=T.F.def.mapv;
      const old=JSON.parse(JSON.stringify(snap)); delete old.run.mapv; T.setMapV(1); T.resumeFrom(old); save.old=T.F.def.mapv;
      // the next floor draws afresh
      T.setMapV(2); T.run.floor=2; T.beginFloor(null); save.next=T.run.mapv.floor===2&&T.F.def.mapv===2;
      // the bag: every map once before any repeats, and never the same map twice in a row
      T.setMapV(null); localStorage.removeItem('ll-maps');
      const runs=[]; for(let i=0;i<30;i++)runs.push(T.mapDraw(1));
      const bag={firstThree:[...new Set(runs.slice(0,3))].length, repeats:runs.filter((x,i)=>i&&x===runs[i-1]).length, seen:[...new Set(runs)].sort().join()};
      // the first descent ever plays map 0
      T.tutSet({walk:'',seen:[],off:true}); localStorage.removeItem('ll-maps'); const first=[0,1,2,3,4].map(()=>T.mapDraw(0));
      T.tutSet({walk:'done',seen:[],off:true}); T.setMapV(0);
      // the pause menu and the banner name the map
      setup(0,1); T.F.showHints(); const banner=document.getElementById('banner').textContent;
      // the first-time tip shows on a shifted map only, and names it
      setup(1,0); const tip0=T.TIPS.shifted.when(); setup(1,2); const tip2=T.TIPS.shifted.when(), tipText=T.TIPS.shifted.steps()[0].text;
      // developer mode restarts the floor on a chosen map, drawing its chalk again
      setup(2,0); T.run.trial='hallowed'; T.run.hallow=null; T.beginFloor(null); const h0=JSON.stringify(T.run.hallow);
      T.DEV_ACTS.mapv('2'); const dev={map:T.F.def.mapv, floor:T.run.floor, chalk:JSON.stringify(T.run.hallow)!==h0&&!!T.F.hallowG};
      return {out,save,bag,first,banner,tip0,tip2,tipText,dev,orient:T.ORIENT};
    });
    orients.push(r.orient);
    for(const o of r.out){
      const tag=`floor ${o.floor} map ${o.map} (${o.name}, ${r.orient})`;
      ok(o.picked,tag+': the map drawn is the one played',o);
      ok(o.roots===o.roots0,tag+': as many roots as map 0, so the waves keep their gates',[o.roots,o.roots0]);
      ok(o.bounds&&o.ends,tag+': every road stays on the board and ends on the lamp',o);
      ok(!o.shared.length&&!o.selfCross.length,tag+': roots never share a tile but the lamp, nor cross themselves',[o.shared,o.selfCross]);
      ok(o.forkOk,tag+': each fork shares its root’s prefix, its branch is longer, a candle can steer it either way, one fork per root',o.forks);
      ok(o.floor===1||o.floor>3||o.hasFork,tag+': floors two and three always fork (the Weir and the Will-o’-Wisp need one)');
      ok(o.bossLong,tag+': the boss’s gate is still the longest way in',o.lens);
      ok(o.lenOk,tag+': each road within 20% of map 0’s length',[o.lens,o.base]);
      ok(o.lampIn,tag+': the lamp’s light stays on the board');
      ok(o.room>=18,tag+': at least 18 open tiles in the lamp’s own light',o.room);
      ok(o.empty<=16,tag+': no more than 16 open tiles lie over two tiles from any road',o.empty);
      ok(o.walk.every(Boolean),tag+': a creature from every mouth, and down every branch, reaches the lamp',o.walk);
      const k0=r.out.find(x=>x.floor===o.floor&&x.map===0).kits;
      ok(Object.keys(o.kits).every(k=>+o.kits[k].split('/')[0]>=+k0[k].split('/')[0]),tag+': every kit builds as many of its first wards by the lamp as on map 0',[o.kits,k0]);
      ok(o.water>0,tag+': the Drowned Mother’s water finds the road',o.water);
      ok(o.bodies!==0,tag+': the Occultist starts the first floor with bodies on the road',o.bodies);
      ok(o.hallow>0,tag+': the Hallowed Ground marks its patches',o.hallow);
      ok(o.herald,tag+': a Herald’s rift is a real mouth');
      console.log(tag.padEnd(48),'lens',o.lens.join('/'),'room',o.room,'empty',o.empty);
    }
    ok(r.save.kept===2,'a resumed floor keeps its map',r.save);
    ok(r.save.old===0,'an old save without a map plays map 0',r.save);
    ok(r.save.next,'the next floor draws its own map',r.save);
    ok(r.bag.firstThree===3&&r.bag.repeats===0&&r.bag.seen==='0,1,2','the bag shows every map before any repeats, never the same twice running',r.bag);
    ok(r.first.every(v=>v===0),'the first descent ever plays the Spillway',r.first);
    ok(/The Ring Drain/.test(r.banner),'the banner names the map',r.banner);
    ok(!r.tip0&&r.tip2&&/The Charnel Cloister/.test(r.tipText),'the tip shows on a shifted map, naming it, and not on map 0',[r.tip0,r.tip2,r.tipText]);
    ok(r.dev.map===2&&r.dev.floor===2&&r.dev.chalk,'developer mode restarts the floor on a chosen map',r.dev);
    ok(!errs.length,'no page errors',errs);
    await p.close();
  }
  ok(orients[0]!==orients[1],'both board orientations were checked',orients);
  await b.close();
  if(fails.length){fails.forEach(f=>console.log('FAIL '+f)); process.exit(1);}
  console.log('maps: ok');
})();
