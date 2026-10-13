// Forked stairs (floors 2 and 3): who goes where at a fork, the Weir, and Wretch splits.
const {chromium}=require('playwright');
const fails=[]; const ok=(cond,msg,detail)=>{if(!cond)fails.push(msg+(detail!==undefined?' '+JSON.stringify(detail):''));};
(async()=>{
  const b=await chromium.launch();
  for(const vp of [{width:900,height:700},{width:412,height:860}]){
    const p=await b.newPage({viewport:vp});
    await p.goto('file://'+process.argv[2]); await p.waitForTimeout(300);
    const r=await p.evaluate(()=>{
      const T=__t, out={};
      const setup=(floor)=>{T.newRun(); T.run.floor=floor; T.beginFloor(null); T.run.ess=9000; T.run.oil=T.run.oilMax=999; T.run.lampBonus=30; T.setP(false); T.F.phase='wave'; T.F.queue=[{t:1e9,type:'crawler',gate:0}];};
      // walk one creature through the first fork; report the path it ends on (0 = main, 1 = branch)
      const through=(type,pre)=>{
        const fk=T.F.forks[0];
        const e=T.spawnFoe(type,fk.opts[0],Math.max(0,fk.d-.4)); e.hp=e.max=1e6; if(pre)pre(e);
        for(let k=0;k<120&&e.d<fk.d+.5;k++)T.update(1/30);
        const g=fk.opts.indexOf(e.gate); e.dead=true; T.update(1/30); return g;
      };
      // a candle beside the main way, on the side away from the branch: lights the main way only
      const lightMain=()=>{
        const fk=T.F.forks[0], s0=fk.samples[0], s1=fk.samples[1];
        const mid=(s)=>{const i=2*Math.floor(s.length/4); return [s[i],s[i+1]];};
        const m=mid(s0), n=mid(s1), dx=m[0]-n[0], dy=m[1]-n[1], L=Math.hypot(dx,dy)||1;
        const x=m[0]+dx/L*1.2, y=m[1]+dy/L*1.2;
        const t={kind:'ward',type:'candle',id:99999,c:Math.floor(x),r:Math.floor(y),x,y,br:{},tgt:'first',invested:0,fresh:0,cd:.3,ang:0,ring:0,echo:0};
        T.F.towers.push(t); T.update(1/30); return t;
      };
      const weir=(open)=>{const fk=T.F.forks[0]; const t={kind:'ward',type:'weir',id:99998,c:fk.c,r:fk.r,x:fk.x,y:fk.y,open,br:{},invested:0,fresh:0,cd:.3,ang:0,ring:0,echo:0}; T.F.towers.push(t); T.update(1/30); return t;};

      for(const fl of [1,2]){
        const o=out['floor'+fl]={};
        setup(fl);
        o.forks=T.F.forks.length; o.roots=T.F.nRoots; o.paths=T.F.paths.length;
        const fk=T.F.forks[0];
        o.longer=T.F.paths[fk.opts[1]].len>T.F.paths[fk.opts[0]].len;
        // the prefix is shared, so switching paths at the fork does not move the creature
        const a=T.posAt(T.F.paths[fk.opts[0]],fk.d), c=T.posAt(T.F.paths[fk.opts[1]],fk.d); o.samePrefix=Math.hypot(a[0]-c[0],a[1]-c[1])<1e-6;
        o.untouched={crawler:through('crawler'),shade:through('shade'),gnasher:through('gnasher')};
        setup(fl); lightMain();
        o.lit={crawler:through('crawler'),shade:through('shade'),gnasher:through('gnasher'),boss:through('boss')};
        T.F.flareT=5; o.lit.flare=through('crawler'); T.F.flareT=0;
        setup(fl); const w=weir(1);
        o.weir={crawler:through('crawler'),watcher:through('watcher'),still:T.F.towers.includes(w)};
        o.weir.behemoth=through('behemoth'); o.weir.smashed=!T.F.towers.includes(w);
        setup(fl);
        o.placeOff=T.placeProblem({kind:'ward',type:'weir'},0,0);
        o.tray=T.F.forks.length>0;
        // a Wretch that bursts just before the fork sends one Skitterling each way
        const e=T.spawnFoe('wretch',fk.opts[0],fk.d-.2); T.killFoe(e);
        const sk=T.F.foes.filter(f=>f.type==='skitter'); sk.forEach(s=>s.hp=s.max=1e6);
        for(let k=0;k<120;k++)T.update(1/30);
        o.split=sk.map(s=>fk.opts.indexOf(s.gate)).sort().join(',');
        // a Wretch that bursts past the fork, on either way: its Skitterlings stay on that way and don't jump
        o.late=[];
        for(const k of [0,1]){
          T.F.foes.forEach(f=>f.dead=true); T.update(1/30);
          const w=T.spawnFoe('wretch',fk.opts[k],fk.d+2.5); T.update(1/30); const wx=w.x, wy=w.y; T.killFoe(w);
          const kids=T.F.foes.filter(f=>f.type==='skitter'&&!f.dead); kids.forEach(s=>s.hp=s.max=1e6);
          T.update(1/30);
          o.late.push({way:k,gates:kids.map(s=>fk.opts.indexOf(s.gate)),jump:Math.max(...kids.map(s=>Math.hypot(s.x-wx,s.y-wy)))});
        }
        T.render();
      }
      setup(0); out.floor0=T.F.forks.length;
      setup(3); out.floor3=T.F.forks.length;
      return out;
    });
    const tag=vp.width+'x'+vp.height+' ';
    ok(r.floor0===0&&r.floor3===0,tag+'floors 1 and 4 have no forks',[r.floor0,r.floor3]);
    for(const fl of ['floor1','floor2']){
      const o=r[fl], t=tag+fl+': ';
      ok(o.forks===1&&o.paths===o.roots+1,t+'one fork, one extra path',o);
      ok(o.longer,t+'the branch is longer than the main way');
      ok(o.samePrefix,t+'branch and main share the prefix');
      ok(o.untouched.crawler===0&&o.untouched.shade===0&&o.untouched.gnasher===0,t+'with no light of yours, everything keeps the main way',o.untouched);
      ok(o.lit.crawler===1,t+'light the main way and crawlers take the dark branch',o.lit);
      ok(o.lit.shade===0,t+'Shades hunt your light',o.lit);
      ok(o.lit.gnasher===0&&o.lit.boss===0,t+'Gnashers and bosses ignore it',o.lit);
      ok(o.lit.flare===0,t+'under a Flare everything is lit, so the tie goes to the main way',o.lit);
      ok(o.weir.crawler===1&&o.weir.watcher===0&&o.weir.still,t+'the weir turns walkers, Watchers fly over',o.weir);
      ok(o.weir.behemoth===0&&o.weir.smashed,t+'a Behemoth smashes the weir',o.weir);
      ok(/fork/.test(o.placeOff||''),t+'a weir only fits on a fork',o.placeOff);
      ok(o.split==='0,1',t+'Wretch Skitterlings split down both ways',o.split);
      for(const l of o.late)ok(l.gates.every(g=>g===l.way)&&l.jump<1,t+'Skitterlings born past the fork stay on their way, no jump',l);
    }
    // the Will-o'-Wisp, cast through the real buttons: tap the rite, then tap the branch
    const ws=await p.evaluate(async()=>{
      const T=__t, o={};
      T.newRun(); T.run.floor=1; T.beginFloor(null); T.run.oil=T.run.oilMax=999; T.run.lampBonus=30; T.setP(false); T.forceUI();
      o.inBar=!!document.querySelector('.rite[data-r="wisp"]');
      T.F.phase='wave'; T.F.queue=[{t:1e9,type:'crawler',gate:0}];
      document.querySelector('.rite[data-r="wisp"]').click();
      const fk=T.F.forks[0], sm=fk.samples[1], i=2*Math.floor(sm.length/4), cv=document.querySelector('#board'), r=cv.getBoundingClientRect();
      cv.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,clientX:r.left+sm[i]/T.COLS*r.width,clientY:r.top+sm[i+1]/T.ROWS*r.height}));
      o.wisp=T.F.wisp&&{k:T.F.wisp.k,t:T.F.wisp.t};
      const through=(type)=>{const e=T.spawnFoe(type,fk.opts[0],Math.max(0,fk.d-.4)); e.hp=e.max=1e6; for(let k=0;k<60&&e.d<fk.d+.5;k++)T.update(1/30); const g=fk.opts.indexOf(e.gate); e.dead=true; T.update(1/30); return g;};
      o.crawler=through('crawler'); o.gnasher=through('gnasher'); o.boss=through('boss');
      for(let k=0;k<300;k++)T.update(1/30);
      o.after=T.F.wisp; o.crawlerAfter=through('crawler');
      T.render();
      T.newRun(); T.run.floor=0; T.beginFloor(null); T.forceUI(); o.floor1=!!document.querySelector('.rite[data-r="wisp"]');
      return o;
    });
    ok(ws.inBar&&!ws.floor1,tag+'the wisp is in the rites bar on forked floors only',ws);
    ok(ws.wisp&&ws.wisp.k===1,tag+'tapping the branch sets the wisp on it',ws);
    ok(ws.crawler===1&&ws.gnasher===1&&ws.boss===0,tag+'everything but a boss follows the wisp',ws);
    ok(ws.after===null&&ws.crawlerAfter===0,tag+'after 8 seconds the wisp is gone and the dark decides again',ws);
    await p.close();
  }
  await b.close();
  if(fails.length){fails.forEach(f=>console.log('FAIL '+f)); process.exit(1);}
  console.log('forks ok');
})().catch(e=>{console.log('FAIL '+e.stack); process.exit(1);});
