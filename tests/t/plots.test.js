// Saltmouth, wider (map expansion, M2: expansion/MAP_EXPANSION.md §3): the plots and the dock.
// - Four plots (TOWN_PLOTS), each with a gate at its edge; shut, a plot can't be walked or built on.
// - A gate opens once, with the haul, from its card; it never shuts again.
// - Debris is laid by hand (the same in every town), solid, one or two tiles; a tap in Build shows its card, and clearing a piece
//   pays what it costs or gives what it gives, frees its tiles, survives a reload and never grows back. Pieces build only on
//   cleared ground. The strand's ribs never clear.
// - Every kept place stays reachable whatever is shut or cleared.
// - The dock: ruined (solid) until restored like a workshop; then you walk out on it to the boat.
// - Saved as ll-town.plots and ll-town.dock. Developer mode shows, never writes (rule 24).
const {chromium}=require('playwright');
const fails=[]; const ok=(c,m,d)=>{if(!c)fails.push(m+(d!==undefined?' '+JSON.stringify(d).slice(0,700):''));};
(async()=>{
  const b=await chromium.launch(); const p=await b.newPage({viewport:{width:412,height:860}});
  const errs=[]; p.on('pageerror',e=>errs.push(String(e)));
  await p.goto('file://'+process.argv[2]); await p.waitForTimeout(300);

  /* 1. the data: every plot's lay sits on its own x tiles, its trees where M1 drew them, its gate on the map; its front kept */
  const d=await p.evaluate(()=>{const T=__t, M0=T.TOWN_MAP0, o={plots:{}};
    localStorage.removeItem('ll-town'); T.townReset(); T.setDev(false); T.townOpen();
    for(const k of T.PLOT_KEYS){const L=T.TOWN_PLOTS[k], [x0,y0,rows]=L.lay, inR=(x,y)=>L.rects.some(([a,b2,w,h])=>x>=a&&y>=b2&&x<a+w&&y<b2+h), bad=[];
      rows.forEach((r,j)=>[...r].forEach((c,i)=>{const x=x0+i, y=y0+j, m=M0[y][x];
        if(c==='-')return; if(!inR(x,y))bad.push(['out',x,y]);
        if(c==='T'&&m!=='T')bad.push(['tree',x,y]); if(c!=='T'&&m==='T')bad.push(['lost tree',x,y]);
        if(c==='G'&&(x!==L.gate[0]||y!==L.gate[1]))bad.push(['gate',x,y]);
        if(T.TOWN_DEBRIS[c]&&m!=='x')bad.push(['debris on '+m,x,y]);}));
      for(const dd of L.debris)if(dd.w===2&&(rows[dd.r-y0][dd.c-x0+1]!==dd.k))bad.push(['pair',dd.c,dd.r]);
      o.plots[k]={bad,gate:M0[L.gate[1]][L.gate[0]]==='G',kept:T.TOWN_KEEP.some(q=>q[0]===L.front[0]&&q[1]===L.front[1]),
        front:!T.townSolid(...L.front),reach:!!T.townPathTo(...L.front),n:L.debris.length,art:T.TOWN_GATE_ROWS[k].length===2};}
    o.kinds=Object.keys(T.TOWN_DEBRIS).every(k=>T.TOWN_DEBRIS_ROWS[k]&&T.TOWN_DEBRIS_ROWS[k].every(R=>R.every(r=>r.length===R[0].length)));
    o.dockArt=['ruin','pier','sunk','boat'].every(k=>T.TOWN_DOCK_ROWS[k].every(r=>r.length===T.TOWN_DOCK_ROWS[k][0].length));
    o.saved=JSON.parse(localStorage.getItem('ll-town')||'null');
    return o;});
  for(const k in d.plots){const P=d.plots[k];
    ok(!P.bad.length,k+': its lay sits on its own shut tiles, the trees where they were, the gate on its G',P.bad);
    ok(P.gate&&P.kept&&P.front&&P.reach,k+': its gate is on the map and the ground before it is open, kept and reachable',P);
    ok(P.n>=8&&P.art,k+': debris laid, and the gate drawn shut and open',P);}
  ok(d.kinds&&d.dockArt,'every kind of debris, the dock and its boat have rows of one width');

  /* 2. shut: solid, never built on; a gate opens once, with the haul, and stays open through a reload */
  const s=await p.evaluate(()=>{const T=__t, L=T.TOWN_PLOTS.lofts, o={}, D=T.townData();
    const gap=[32,27];   /* open ground inside the net-lofts' lay, between the crates */
    o.shutSolid=T.townSolid(...gap)&&T.townSolid(...L.gate); D.res={timber:99,iron:99,tallow:99,curios:9};
    o.shutWhy=T.townCanPlace('lamp',...gap);
    D.res={timber:0,iron:0,tallow:0,curios:0}; o.poor=T.townOpenPlot('lofts');
    D.res={timber:50,iron:50,tallow:20,curios:0}; o.open=T.townOpenPlot('lofts'); o.res=Object.assign({},D.res); o.again=T.townOpenPlot('lofts'); o.res2=Object.assign({},D.res);
    o.gateWalk=!T.townSolid(...L.gate)&&T.TOWN_MAP[L.gate[1]][L.gate[0]]==='g'; o.gapWalk=!T.townSolid(...gap);
    o.debrisSolid=L.debris.every(q=>T.townSolid(q.c,q.r)&&T.townSolid(q.c+q.w-1,q.r));
    o.gateWhy=T.townCanPlace('lamp',...L.gate); o.gapOK=T.townCanPlace('lamp',...gap);
    o.onDebris=T.townCanPlace('lamp',L.debris[0].c,L.debris[0].r);
    o.saved=JSON.parse(localStorage.getItem('ll-town')).plots.lofts;
    T.townReset(); o.reload=T.plotOpen('lofts')&&T.TOWN_MAP[L.gate[1]][L.gate[0]]==='g'&&T.plotOpen('wood')===false;
    o.others=T.townSolid(...T.TOWN_PLOTS.wood.gate)&&T.townSolid(24,9);
    return o;});
  console.log(JSON.stringify(s));
  ok(s.shutSolid&&/shut/i.test(s.shutWhy),'a shut plot is solid and nothing is built on it',s);
  ok(s.poor===false&&s.open===true&&s.again===false,'a gate opens once, and only with the haul',s);
  ok(s.res.timber===35&&s.res.iron===40&&s.res.tallow===20&&JSON.stringify(s.res)===JSON.stringify(s.res2),'opening costs its price, once',s.res);
  ok(s.gateWalk&&s.gapWalk&&s.debrisSolid,'open, its gate and open ground are walked; its debris stays solid',s);
  ok(/gateway/.test(s.gateWhy)&&s.gapOK===''&&/Clear it first/.test(s.onDebris),'a piece stands on open ground in the plot, never in the gateway or on debris',s);
  ok(s.saved&&s.saved.open===true&&s.reload&&s.others,'the open gate is saved and survives a reload; the others stay shut',s);

  /* 3. clearing, piece by piece: its card in Build, its cost or what it gives, its tiles freed, kept through a reload, never regrown */
  const c=await p.evaluate(()=>{const T=__t, W=T.TWN, L=T.TOWN_PLOTS.lofts, o={}, D=T.townData();
    T.townOpen(); T.townBuildSet(true); W.pick=null;
    const ki=L.debris.findIndex(q=>q.k==='K'), K=L.debris[ki], ci=L.debris.findIndex(q=>q.k==='c'), C=L.debris[ci];
    D.res={timber:0,iron:0,tallow:0,curios:0};
    W.tapPx=null; T.bldTap(K.c+1,K.r);
    o.card=!document.querySelector('#modal').hidden&&document.querySelector('#mTitle').textContent;
    o.body=document.querySelector('#mBody').textContent;
    const btn=[...document.querySelectorAll('#mActions button')].find(b=>/Clear it/.test(b.textContent)); o.btn=btn&&btn.textContent;
    btn&&btn.click();
    o.gone=T.townCh(K.c,K.r)==='.'&&T.townCh(K.c+1,K.r)==='.'&&!T.townSolid(K.c,K.r)&&!T.townSolid(K.c+1,K.r);
    o.gave=D.res.timber; o.closed=document.querySelector('#modal').hidden;
    o.again=T.townClearDebris('lofts',ki);
    o.canBuild=T.townFits('lamp',K.c,K.r);
    /* a piece that costs: not without the haul */
    D.res={timber:10,iron:10,tallow:5,curios:0}; T.townOpenPlot('strand');
    const SL=T.TOWN_PLOTS.strand, si=SL.debris.findIndex(q=>q.k==='o');
    o.costly=T.townClearDebris('strand',si); D.res.iron=1; o.paid=T.townClearDebris('strand',si)&&D.res.iron===0;
    T.townBuildSet(false);
    o.saved=JSON.parse(localStorage.getItem('ll-town')).plots.lofts.cleared;
    T.townReset(); T.townOpen(); o.reload=T.townData().plots.lofts.cleared.includes(ki)&&!T.townSolid(K.c,K.r)&&T.townSolid(C.c,C.r);
    /* never regrows: a cleared list on a shut plot, nonsense, a fixed piece or a repeat is dropped */
    const f=T.plotsFix({wood:{open:false,cleared:[0,1]},lofts:{open:true,cleared:[ki,ki,-1,999,'2',1.5]},strand:{open:true,cleared:[T.TOWN_PLOTS.strand.debris.findIndex(q=>q.k==='R')]}});
    o.fix=[f.wood.cleared.length,JSON.stringify(f.lofts.cleared),f.strand.cleared.length,f.acre.open];
    o.ribs=T.townClearDebris('strand',T.TOWN_PLOTS.strand.debris.findIndex(q=>q.k==='R'));
    T.townClose(); return o;});
  console.log(JSON.stringify(c));
  ok(/skiff/i.test(c.card)&&/gives back/i.test(c.body)&&/Clear it/.test(c.btn||''),'a tap on debris in Build shows its card: what it is and what clearing gives back',c);
  ok(c.gone&&c.gave===2&&c.closed,'clearing it frees both its tiles and gives back what it said',c);
  ok(c.again===false&&c.canBuild==='','a cleared piece is gone for good, and its ground takes a piece',c);
  ok(c.costly===false&&c.paid,'a piece that costs is not cleared without the haul, and with it pays',c);
  ok(c.reload&&c.saved.length===1,'what was cleared is saved by index and survives a reload; the rest still stands',c);
  ok(c.fix[0]===0&&c.fix[1]==='['+c.saved[0]+']'&&c.fix[2]===0&&c.fix[3]===false,'nothing regrows, and a bad save clears nothing it should not',c.fix);
  ok(c.ribs===false,'the strand\'s ribs never clear');

  /* 4. every kept place is reachable whatever is shut, open or cleared */
  const r=await p.evaluate(()=>{const T=__t, o={};
    const all=open=>{const P={}; for(const k of T.PLOT_KEYS){const L=T.TOWN_PLOTS[k]; P[k]={open,cleared:open?L.debris.map((_,i)=>i):[]};} return P;};
    for(const [n,P] of [['shut',{}],['open',Object.fromEntries(T.PLOT_KEYS.map(k=>[k,{open:true,cleared:[]}]))],['cleared',all(true)]]){
      T.townMapSync({plots:P,dock:{lv:n==='cleared'?1:0}}); o[n]=T.townKeepOK([]);}
    T.townReset(); T.townData(); return o;});
  ok(r.shut&&r.open&&r.cleared,'every kept place is reachable with the plots shut, open, or cleared',r);

  /* 5. the dock: a ruin (solid) until restored; restored, its planks are walked to the boat; saved */
  const k=await p.evaluate(()=>{const T=__t, W=T.TWN, K=T.TOWN_DOCK, o={}, D=T.townData();
    T.townOpen(); o.ruinSolid=T.townSolid(K.x,K.y)&&T.townSolid(K.x+1,K.y+2)&&!T.dockBuilt();
    W.p.x=K.front[0][0]+.5; W.p.y=K.front[0][1]+.5-1; W.path=null; W.goal=null;
    T.townTapTile(K.x,K.y+1); for(let i=0;i<300&&(W.path||W.goal);i++)T.townStep(1/30);
    o.card=!document.querySelector('#modal').hidden&&document.querySelector('#mTitle').textContent;
    o.btn=[...document.querySelectorAll('#mActions button')].map(b=>b.textContent);
    T.closeModal(); T.townStep(1/30); o.near=W.near; o.label=document.querySelector('#townAct').textContent;
    D.res={timber:0,iron:0,tallow:0,curios:0}; o.poor=T.townRestoreDock();
    D.res={timber:40,iron:20,tallow:10,curios:0}; o.up=T.townRestoreDock(); o.res=Object.assign({},D.res); o.again=T.townRestoreDock();
    o.walk=[0,1,2].every(j=>!T.townSolid(K.x,K.y+j)&&!T.townSolid(K.x+1,K.y+j))&&!T.townBuildable(K.x,K.y,true);
    W.path=T.townPathTo(...K.stand); o.path=!!W.path; for(let i=0;i<300&&W.path;i++)T.townStep(1/30);
    o.on=Math.hypot(W.p.x-(K.stand[0]+.5),W.p.y-(K.stand[1]+.5))<.6; T.townStep(1/30); o.near2=W.near;
    o.lit=T.townArt().em.some(e=>e.y>K.y*16-8);
    o.saved=JSON.parse(localStorage.getItem('ll-town')).dock; T.townReset(); o.reload=T.dockBuilt();
    T.townClose(); return o;});
  console.log(JSON.stringify(k));
  ok(k.ruinSolid,'the dock is a ruin, solid, in a new town',k);
  ok(/dock/i.test(k.card)&&k.btn.some(t=>/Restore/.test(t))&&k.near==='dock'&&/dock/i.test(k.label),'a tap walks you to its foot and opens its card; the button offers it there',k);
  ok(k.poor===false&&k.up===true&&k.again===false&&k.res.timber===0&&k.res.iron===0&&k.res.tallow===0,'it is restored once, for its price',k);
  ok(k.walk&&k.path&&k.on&&k.near2==='dock','restored, you walk out on it to the boat, and it is never built on',k);
  ok(k.lit,'restored, its lamps burn',k);
  ok(k.saved&&k.saved.lv===1&&k.reload,'the dock is saved and survives a reload',k);

  /* 6. developer mode shows, never writes; leaving it puts the map back */
  const v=await p.evaluate(()=>{const T=__t, o={};
    localStorage.removeItem('ll-town'); T.townReset(); T.setDev(false); T.townData(); const before=localStorage.getItem('ll-town');
    T.setDev(true); T.townReset(); const D=T.townData(); D.res={timber:99,iron:99,tallow:99,curios:9};
    o.open=T.townOpenPlot('acre'); o.clear=T.townClearDebris('acre',0); o.dock=T.townRestoreDock();
    o.devMap=T.TOWN_MAP[T.TOWN_PLOTS.acre.gate[1]][T.TOWN_PLOTS.acre.gate[0]];
    o.same=localStorage.getItem('ll-town')===before;
    T.setDev(false); T.townData(); o.back=T.TOWN_MAP[T.TOWN_PLOTS.acre.gate[1]][T.TOWN_PLOTS.acre.gate[0]]==='G'&&!T.dockBuilt()&&T.townSolid(27,33);
    return o;});
  ok(v.open&&v.clear&&v.dock&&v.devMap==='g','developer mode opens, clears and restores in its own copy',v);
  ok(v.same&&v.back,'developer mode never writes ll-town, and leaving it puts the map back',v);

  /* 7. teach: the gate's card shows the plots' tip once, the dock's its own; the rules name them */
  const t=await p.evaluate(()=>{const T=__t, o={};
    T.tutSet({walk:'done',seen:['town','townhaul','townkeepers','gift'],off:false}); localStorage.removeItem('ll-town'); T.townReset(); T.townOpen();
    T.townGate('acre'); o.tip=document.querySelector('#townCard').textContent; T.closeModal(); document.querySelector('#townCard').click();
    T.townDock(); o.tip2=document.querySelector('#townCard').textContent; T.closeModal();
    o.rules=/net-lofts/.test(document.body.innerHTML)&&/dock/.test(document.querySelector('#rulesList').innerHTML);
    T.tutSet({walk:'done',seen:[],off:true}); T.townClose(); return o;});
  ok(/Overgrown ground/.test(t.tip)&&/The dock/.test(t.tip2),'a gate\'s card teaches the plots, the dock\'s card the dock',t);
  ok(t.rules,'the rules line names the plots and the dock',t);

  if(errs.length)fails.push('page errors: '+errs.join(' | '));
  await b.close();
  if(fails.length){for(const f of fails)console.log('FAIL '+f); process.exitCode=1;} else console.log('plots: ok');
})();
