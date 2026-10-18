// Trials (#31): a door can carry one, and the floor behind it plays by its rule. Rationed caps the wards beside the path at six;
// the Hallowed Ground lets you build only on four marked patches, lit or dark. Each is checked against all five kits.
const {chromium}=require('playwright');
const fails=[]; const ok=(c,m,d)=>{if(!c)fails.push(m+(d!==undefined?' '+JSON.stringify(d):''));};
(async()=>{
  const b=await chromium.launch(); const p=await b.newPage({viewport:{width:412,height:860}});
  const errs=[]; p.on('pageerror',e=>errs.push(String(e)));
  await p.goto('file://'+process.argv[2]); await p.waitForTimeout(300);
  const r=await p.evaluate(()=>{const T=__t, out={kits:{}};
    T.tutSet({off:true,seen:[],walk:'done'});
    const KITS=Object.keys(T.KITS);
    const fresh=(kit,fl,trial)=>{T.newRun(kit,0); T.run.floor=fl; T.run.trial=trial||null; T.beginFloor(null); T.setP(false); T.run.ess=99999; T.run.oil=T.run.oilMax=40;};
    const place=(type,c,r,kind)=>{const n=T.F.towers.length; T.setSel({kind:kind||'ward',type}); T.tryPlace(c,r); return T.F.towers.length>n?T.F.towers[T.F.towers.length-1]:null;};
    const tiles=()=>{const o=[]; for(let r=0;r<T.ROWS;r++)for(let c=0;c<T.COLS;c++)o.push([c,r]); return o;};
    const lampD=(c,r)=>Math.hypot(c+.5-T.F.lamp.x,r+.5-T.F.lamp.y);

    /* the doors: one Trial on the way to floors two and three, never on the Deep Stair, none toward the Keeper or the Primordial */
    out.doors={};
    for(const fl of [0,1,2,3]){let n=[], deep=0;
      for(let i=0;i<80;i++){fresh('lamplighter',fl); const ds=T.makeDoors(); n.push(ds.filter(d=>d.trial).length); deep+=ds.filter(d=>d.trial&&d.room==='deep').length;}
      out.doors[fl]={min:Math.min(...n),max:Math.max(...n),deep};}
    /* a Trial door says so; choosing it carries the rule down the stair, and the next floor drops it again */
    fresh('lamplighter',0); T.F.phase='cleared'; T.openDraft(0,0); const d=T.draft; d.step='fork'; d.doors=[{room:'rest',omen:null,trial:'rationed'},{room:'merchant',omen:null}];
    const fm=T.landingModal(); out.doorTag=fm.choices[0].tag; out.doorSub=fm.choices[0].sub.includes('Six wards');
    T.chooseDoor(d,0); T.descend(); out.after={trial:T.run.trial,F:T.F.trial,floor:T.run.floor};
    out.banner=document.getElementById('floorNo').textContent;
    T.F.phase='cleared'; T.openDraft(0,0); out.relics=T.draft.relics;
    const d2=T.draft; d2.step='fork'; d2.doors=[{room:'rest',omen:null}]; T.chooseDoor(d2,0); T.descend(); out.dropped=T.run.trial;

    for(const kit of KITS){const K={};
      /* ---- Rationed ---- */
      fresh(kit,1,'rationed');
      const lit=tiles().filter(([c,r])=>!T.placeProblem({kind:'ward',type:'harpoon'},c,r)).sort((a,b)=>lampD(...a)-lampD(...b));
      let placed=0; for(const [c,r] of lit){if(placed>=6)break; if(place('harpoon',c,r))placed++;}
      K.placed=placed; K.count=T.rationN(); K.full=T.rationFull();
      K.seventh=T.placeProblem({kind:'ward',type:'harpoon'},lit[lit.length-1][0],lit[lit.length-1][1]);
      /* what lies on the path is free of the count */
      const pw=T.run.wards.find(w=>['salt','trap','bellwire'].includes(w));
      if(pw){const pt=tiles().find(([c,r])=>!T.placeProblem({kind:'ward',type:pw},c,r)); K.pathWard=pt?!!place(pw,pt[0],pt[1]):'no tile'; K.countAfterPath=T.rationN();}
      /* horrors don't count either */
      T.run.roster.watcher=(T.run.roster.watcher||0)+1;
      const ht=tiles().find(([c,r])=>!T.placeProblem({kind:'horror',type:'watcher'},c,r)); K.horror=ht?!!place('watcher',ht[0],ht[1],'horror'):'no tile';
      /* sell one and you can build again */
      T.sellTower(T.F.towers.find(t=>t.type==='harpoon'),true); K.afterSell=T.rationN(); K.again=!T.rationFull();
      T.forceUI(); K.hud=document.getElementById('floorNo').textContent;

      /* ---- the Hallowed Ground, on both floors it can fall on ---- */
      for(const fl of [1,2]){
        fresh(kit,fl,'hallowed');
        const H=T.run.hallow, set=T.F.hallow, ts=[...set].map(k=>k.split(',').map(Number));
        K['patches'+fl]=H.p.length; K['tiles'+fl]=set.size;
        K['offPath'+fl]=ts.every(([c,r])=>!T.F.pathTiles.has(c+','+r)&&c>=0&&r>=0&&c<T.COLS&&r<T.ROWS&&!(c===T.F.lampC&&r===T.F.lampR));
        K['beside'+fl]=H.p.every(g=>g.some(q=>{const [c,r]=T.ORIENT==='land'?[q[1],q[0]]:q; for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++)if(T.F.pathTiles.has((c+dc)+','+(r+dr)))return true; return false;}));
        K['lampPatch'+fl]=H.p[0].every(q=>{const [c,r]=T.ORIENT==='land'?[q[1],q[0]]:q; return lampD(c,r)<=T.lampBase();});
      }
      fresh(kit,1,'hallowed');
      const ts=[...T.F.hallow].map(k=>k.split(',').map(Number));
      /* off the patches, nothing stands, even in the lamp's own light */
      const litOff=tiles().find(([c,r])=>!T.F.hallow.has(c+','+r)&&!T.F.pathTiles.has(c+','+r)&&lampD(c,r)<2.2&&!(c===T.F.lampC&&r===T.F.lampR));
      K.offPatch=T.placeProblem({kind:'ward',type:'harpoon'},litOff[0],litOff[1]);
      /* on a patch far out in the dark, a harpoon stands and stays awake */
      const far=ts.slice().sort((a,b)=>lampD(...b)-lampD(...a));
      const hp=place('harpoon',far[0][0],far[0][1]); K.farHarpoon=hp?{dark:hp.dark}:'refused: '+T.placeProblem({kind:'ward',type:'harpoon'},far[0][0],far[0][1]);
      /* the kit's own light works there */
      const own=kit==='bellringer'?'fork':'candle';
      if(kit==='occultist'){
        /* a Corpse Candle still needs a body beside it: lay one on the path next to the far patch */
        let best=null; T.F.paths.forEach((P,gi)=>{for(let dd=0;dd<P.len;dd+=.25){const q=T.posAt(P,dd), dist=Math.hypot(q[0]-(far[1][0]+.5),q[1]-(far[1][1]+.5)); if(!best||dist<best[1])best=[dd,dist,gi];}});
        K.noBody=T.placeProblem({kind:'ward',type:'candle'},far[1][0],far[1][1]);
        T.addCorpse({gate:best[2],d:best[0]}); T.forceUI();
      }
      const lt=place(own,far[1][0],far[1][1]); T.F.L=T.F.L;
      K.ownLight=lt?{dark:lt.dark,lit:own==='candle'?T.F.L.some(L=>Math.abs(L.x-lt.x)<.01&&Math.abs(L.y-lt.y)<.01):null,hum:own==='fork'?T.F.forkNet.has(lt)&&T.F.hums.some(h=>h.t===lt):null}:'refused: '+T.placeProblem({kind:'ward',type:own},far[1][0],far[1][1]);
      if(kit==='galvanist'){
        /* a pylon on the far patch is powered without reaching the lamp */
        const py=place('pylon',far[2][0],far[2][1]); K.pylon=py?{dark:py.dark}:'refused';
      }
      if(kit==='lamplighter'){
        /* the Signal Mirror still needs the lamp's own light: the lamp's patch gives it a place */
        const lp=ts.filter(([c,r])=>lampD(c,r)<=T.lampBase()&&!T.F.towers.some(t=>t.c===c&&t.r===r));
        K.mirror=lp.length?!!place('mirror',lp[0][0],lp[0][1]):'no lamp patch tile';
      }
      /* a Bell Wire, salt or a trap still goes anywhere on the path */
      const pw2=T.run.wards.find(w=>['salt','trap','bellwire'].includes(w));
      if(pw2){const pt=tiles().find(([c,r])=>T.F.pathTiles.has(c+','+r)&&!T.placeProblem({kind:'ward',type:pw2},c,r)); K.pathOk=!!pt;}
      /* it survives a save and resume, and the board turning */
      const before=JSON.stringify([...T.F.hallow].sort());
      T.checkpoint(); const sv=JSON.parse(localStorage.getItem(Object.keys(localStorage).find(k=>k.endsWith('ll-save-v2'))));
      T.resumeFrom(sv); K.resumed=JSON.stringify([...T.F.hallow].sort())===before&&T.F.trial==='hallowed';
      const o=T.ORIENT; T.setOrient(o==='land'?'port':'land'); const flipped=T.F.towers.filter(t=>t.kind==='ward').every(t=>T.hallowAt(t.c,t.r)||T.F.pathTiles.has(t.c+','+t.r));
      T.setOrient(o); K.turned=flipped&&JSON.stringify([...T.F.hallow].sort())===before;
      T.render();
      out.kits[kit]=K;
    }

    /* a Galvanist's wire can cross the path inside a patch: tiles on both sides of one path tile */
    let across=0, total=0;
    for(let i=0;i<40;i++){fresh('galvanist',i%2+1,'hallowed');
      for(const g of T.run.hallow.p.slice(1)){total++; const q=g.map(x=>T.ORIENT==='land'?[x[1],x[0]]:x);
        if(q.some(a=>q.some(b2=>{const mx=Math.floor((a[0]+b2[0])/2+.5), my=Math.floor((a[1]+b2[1])/2+.5); return a!==b2&&T.F.pathTiles.has(mx+','+my)&&Math.hypot(a[0]-b2[0],a[1]-b2[1])<=2.9;})))across++;}}
    out.across=across/total;

    /* teach it: tips, a rules line, the Grimoire */
    fresh('lamplighter',1,'rationed'); out.tipR=T.TIPS.rationed.when(); out.tipH=T.TIPS.hallowed.when();
    fresh('lamplighter',1,'hallowed'); out.tipH2=T.TIPS.hallowed.when();
    out.rules=document.getElementById('rulesList').textContent.includes('The Hallowed Ground');
    T.openBook('hud','trials'); T.BOOK.tab='trials'; T.showBook(); out.book=document.getElementById('mChoices').textContent.includes('Rationed');
    return out;
  });
  console.log(JSON.stringify(r));
  ok(r.doors[0].min===1&&r.doors[0].max===1,'one Trial on the doors to floor two',r.doors[0]);
  ok(r.doors[1].min===1&&r.doors[1].max===1,'one Trial on the doors to floor three',r.doors[1]);
  ok(r.doors[2].max===0&&r.doors[3].max===0,'no Trial toward the Keeper or the Primordial',[r.doors[2],r.doors[3]]);
  ok(r.doors[0].deep===0&&r.doors[1].deep===0,'never on the Deep Stair');
  ok(/Trial: Rationed/.test(r.doorTag)&&r.doorSub,'the door names its Trial and rule',r.doorTag);
  ok(r.after.trial==='rationed'&&r.after.F==='rationed'&&r.after.floor===1,'choosing the door carries the Trial down',r.after);
  ok(/Rationed 0\/6/.test(r.banner),'the HUD shows the count',r.banner);
  ok(r.relics===1,'passing it pays a relic',r.relics);
  ok(r.dropped===null,'the next floor drops it',r.dropped);
  for(const [k,K] of Object.entries(r.kits)){
    ok(K.placed===6&&K.count===6&&K.full,k+': six wards fill the ration',K);
    ok(/^Rationed/.test(K.seventh),k+': the seventh is refused',K.seventh);
    if(K.pathWard!==undefined)ok(K.pathWard===true&&K.countAfterPath===6,k+': a path ward is free of the count',K);
    ok(K.horror===true,k+': a horror is free of the count',K.horror);
    ok(K.afterSell===5&&K.again,k+': selling one frees a place',K);
    ok(/Rationed 5\/6/.test(K.hud),k+': the HUD count follows',K.hud);
    for(const fl of [1,2]){
      ok(K['patches'+fl]===4&&K['tiles'+fl]>=12,k+': four patches on floor '+(fl+1),[K['patches'+fl],K['tiles'+fl]]);
      ok(K['offPath'+fl]&&K['beside'+fl],k+': patches lie beside the path',fl);
      ok(K['lampPatch'+fl],k+': one patch lies in the lamp light',fl);
    }
    ok(/not hallowed/.test(K.offPatch),k+': nothing stands off the patches',K.offPatch);
    ok(K.farHarpoon&&K.farHarpoon.dark===false,k+': a ward on a dark patch stays awake',K.farHarpoon);
    ok(K.ownLight&&K.ownLight.dark===false&&K.ownLight.lit!==false&&K.ownLight.hum!==false,k+': the kit’s own light works on a patch',K.ownLight);
    if(k==='occultist')ok(/Corpse Candle/.test(K.noBody),'occultist: a Corpse Candle still needs a body',K.noBody);
    if(k==='galvanist')ok(K.pylon&&K.pylon.dark===false,'galvanist: a pylon on a patch is powered',K.pylon);
    if(k==='lamplighter')ok(K.mirror===true,'lamplighter: the mirror has a place',K.mirror);
    if(K.pathOk!==undefined)ok(K.pathOk,k+': path wards still go anywhere on the path');
    ok(K.resumed,k+': the patches survive a save');
    ok(K.turned,k+': the patches turn with the board');
  }
  ok(r.across>=.7,'most patches reach across the path',r.across);
  ok(r.tipR&&!r.tipH&&r.tipH2,'tips for each Trial',[r.tipR,r.tipH,r.tipH2]);
  ok(r.rules,'a rules line'); ok(r.book,'a Grimoire page');
  ok(!errs.length,'no page errors',errs);
  fails.forEach(f=>console.log('FAIL '+f));
  await b.close();
  process.exit(fails.length?1:0);
})();
