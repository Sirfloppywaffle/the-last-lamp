// The next five Trials (#31): Sealed, One of Each, Bare Hands, Unbranched, The Long Night. Each is checked against all five kits.
const {chromium}=require('playwright');
const fails=[]; const ok=(c,m,d)=>{if(!c)fails.push(m+(d!==undefined?' '+JSON.stringify(d):''));};
(async()=>{
  const b=await chromium.launch(); const p=await b.newPage({viewport:{width:412,height:860}});
  const errs=[]; p.on('pageerror',e=>errs.push(String(e)));
  await p.goto('file://'+process.argv[2]); await p.waitForTimeout(300);
  const r=await p.evaluate(()=>{const T=__t, out={kits:{}};
    T.tutSet({off:true,seen:[],walk:'done'});
    const SPARE=['candle','fork','pylon','bellwire','trypot'];
    const fresh=(kit,fl,trial)=>{T.newRun(kit,0); T.run.floor=fl; T.run.trial=trial||null; T.beginFloor(null); T.setP(false); T.run.ess=99999; T.run.oil=T.run.oilMax=40;};
    const place=(type,c,r,kind)=>{const n=T.F.towers.length; T.setSel({kind:kind||'ward',type}); T.tryPlace(c,r); return T.F.towers.length>n?T.F.towers[T.F.towers.length-1]:null;};
    const tiles=()=>{const o=[]; for(let r=0;r<T.ROWS;r++)for(let c=0;c<T.COLS;c++)o.push([c,r]); return o;};
    const lampD=(c,r)=>Math.hypot(c+.5-T.F.lamp.x,r+.5-T.F.lamp.y);
    const spot=type=>tiles().filter(([c,r])=>!T.placeProblem({kind:'ward',type},c,r)).sort((a,b)=>lampD(...a)-lampD(...b))[0];

    /* the doors: every new Trial turns up on the way to floors two and three, and the Long Night never brings Moonless or Thick Dark */
    const seen={}; let darkOmen=0;
    for(let i=0;i<400;i++){fresh('lamplighter',i%2); for(const d of T.makeDoors())if(d.trial){seen[d.trial]=1; if(d.trial==='night'&&(d.omen==='moonless'||d.omen==='thickdark'))darkOmen++;}}
    out.seen=Object.keys(seen); out.darkOmen=darkOmen;

    for(const kit of Object.keys(T.KITS)){const K={};
      const own=kit==='bellringer'?'fork':kit==='occultist'?null:'candle';
      /* ---- Sealed ---- */
      fresh(kit,1,'sealed');
      const w=T.run.seal.w.slice(); K.sealed=w;
      K.sealOk=w.length===2&&w.every(x=>T.run.wards.includes(x)&&!SPARE.includes(x)&&x!=='harpoon');
      const any=tiles().find(([c,r])=>T.placeProblem({kind:'ward',type:w[0]},c,r)!=='taken');
      K.sealMsg=T.placeProblem({kind:'ward',type:w[0]},any[0],any[1]);
      K.harpoonFree=!/^Sealed/.test(T.placeProblem({kind:'ward',type:'harpoon'},any[0],any[1]));
      if(own)K.ownFree=!/^Sealed/.test(T.placeProblem({kind:'ward',type:own},any[0],any[1]));
      T.forceUI(); K.trayLocks=document.querySelectorAll('#tray .titem.is-barred').length;
      T.checkpoint(); const sv=JSON.parse(localStorage.getItem(Object.keys(localStorage).find(k=>k.endsWith('ll-save-v2'))));
      T.resumeFrom(sv); K.sealResumed=JSON.stringify(T.run.seal.w)===JSON.stringify(w)&&T.F.trial==='sealed';
      fresh(kit,2,null); K.sealGone=!T.sealedW(w[0]);

      /* ---- One of Each ---- */
      fresh(kit,1,'once');
      const two=tiles().filter(([c,r])=>!T.placeProblem({kind:'ward',type:'harpoon'},c,r)).sort((a,b)=>lampD(...a)-lampD(...b));
      const s1=two[0], s2=two[1]; const h1=place('harpoon',s1[0],s1[1]);
      K.secondHarpoon=s2?T.placeProblem({kind:'ward',type:'harpoon'},s2[0],s2[1]):'no tile';
      T.forceUI(); K.onceLock=T.trialBarred({kind:'ward',type:'harpoon'})&&document.querySelectorAll('#tray .titem.is-barred').length===1;
      if(own){const a=spot(own); const l1=a&&place(own,a[0],a[1]); const c2=spot(own); const l2=c2&&place(own,c2[0],c2[1]); K.ownTwice=!!(l1&&l2);}
      if(kit==='galvanist'){const a=spot('pylon'); const q1=a&&place('pylon',a[0],a[1]); const c2=spot('pylon'); K.pylonTwice=!!(q1&&c2&&place('pylon',c2[0],c2[1]));}
      T.sellTower(h1,true); const s3=spot('harpoon'); K.afterSell=!!(s3&&place('harpoon',s3[0],s3[1]));

      /* ---- Bare Hands ---- */
      fresh(kit,1,'bare'); T.callWave(); for(let i=0;i<5;i++)T.update(1/30);
      const rs=T.run.rites.slice(); K.rites={};
      for(const k of rs){const cd=T.F.cd[k]||0; T.castRite(k); K.rites[k]={silent:T.riteSilent(k),cast:(T.F.cd[k]||0)!==cd};}
      T.forceUI(); K.silentBtns=document.querySelectorAll('#rites .rite.is-silent').length; K.silentWant=[...document.querySelectorAll('#rites .rite')].filter(x=>x.dataset.r!=='toll').length;

      /* ---- Unbranched ---- */
      fresh(kit,1,'unbranched');
      const u=spot('harpoon'); const ht=place('harpoon',u[0],u[1]); const ess=T.run.ess;
      K.lock=T.branchState(ht,0).lock; T.buyBranch(ht,0); T.buyBranch(T.F.lamp,0);
      K.noGrowth=Object.values(ht.br).every(v=>!v)&&Object.values(T.F.lamp.br).every(v=>!v)&&T.run.ess===ess;

      /* ---- The Long Night ---- */
      fresh(kit,1,null); const base=T.lampBase();
      const lightOf=()=>{if(!own)return null; const a=spot(own); const t=a&&place(own,a[0],a[1]); return t?(own==='fork'?T.wstat(t).hum:T.wstat(t).light):null;};
      const day=lightOf();
      fresh(kit,1,'night'); K.lampDrop=+(base-T.lampBase()).toFixed(2);
      const night=lightOf(); if(own)K.dim=day&&night?+(night/day).toFixed(2):[day,night];
      out.kits[kit]=K;
    }

    /* teach it: a tip for each, a rules line, the Grimoire */
    out.tips={};
    for(const k of ['sealed','once','bare','unbranched','night']){fresh('lamplighter',1,k); out.tips[k]=!!T.TIPS[k]&&T.TIPS[k].when();}
    fresh('lamplighter',1,null); out.tipsOff=['sealed','once','bare','unbranched','night'].some(k=>T.TIPS[k].when());
    const rl=document.getElementById('rulesList').textContent; out.rules=['Sealed','One of Each','Bare Hands','Unbranched','The Long Night'].every(x=>rl.includes(x));
    T.openBook('hud','trials'); T.BOOK.tab='trials'; T.showBook(); const bk=document.getElementById('mChoices').textContent;
    out.book=['Sealed','One of Each','Bare Hands','Unbranched','The Long Night'].every(x=>bk.includes(x));
    return out;
  });
  console.log(JSON.stringify(r));
  ok(['sealed','once','bare','unbranched','night'].every(k=>r.seen.includes(k)),'every new Trial reaches the doors',r.seen);
  ok(r.darkOmen===0,'the Long Night never comes with Moonless or Thick Dark',r.darkOmen);
  for(const [k,K] of Object.entries(r.kits)){
    ok(K.sealOk,k+': two wards sealed, never the light or the harpoon',K.sealed);
    ok(/^Sealed/.test(K.sealMsg),k+': a sealed ward is refused',K.sealMsg);
    ok(K.harpoonFree&&K.ownFree!==false,k+': the harpoon and the light stay free');
    ok(K.trayLocks===2,k+': the tray locks the two sealed wards',K.trayLocks);
    ok(K.sealResumed,k+': the seal survives a save');
    ok(K.sealGone,k+': the next floor is unsealed');
    ok(/^One of Each/.test(K.secondHarpoon),k+': a second harpoon is refused',K.secondHarpoon);
    ok(K.onceLock,k+': the tray locks only what already stands');
    if(K.ownTwice!==undefined)ok(K.ownTwice,k+': the kit’s light stands twice');
    if(K.pylonTwice!==undefined)ok(K.pylonTwice,k+': pylons stand twice');
    ok(K.afterSell,k+': selling it frees the kind again');
    for(const [rk,R] of Object.entries(K.rites)){
      if(rk==='toll')ok(!R.silent,k+': the Toll still rings');
      else ok(R.silent&&!R.cast,k+': '+rk+' is silent',R);
    }
    ok(K.silentBtns===K.silentWant,k+': the rite buttons show which are silent',[K.silentBtns,K.silentWant]);
    ok(K.lock==='Unbranched'&&K.noGrowth,k+': nothing can be upgraded, the lamp included',K);
    ok(K.lampDrop===1,k+': the lamp burns a tile smaller',K.lampDrop);
    if(K.dim!==undefined)ok(K.dim===.5,k+': the light or hum is halved',K.dim);
  }
  for(const [k,v] of Object.entries(r.tips))ok(v,'a tip for '+k);
  ok(!r.tipsOff,'the tips stay quiet on an ordinary floor');
  ok(r.rules,'a rules line for each'); ok(r.book,'a Grimoire entry for each');
  ok(!errs.length,'no page errors',errs);
  fails.forEach(f=>console.log('FAIL '+f));
  await b.close();
  process.exit(fails.length?1:0);
})();
