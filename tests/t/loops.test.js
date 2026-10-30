// Saltmouth, art pass A1 (expansion/ART_UPGRADE.md §4): fire, water and weather.
// - Flames loop in frames from PixelLab: the square's braziers and street-lamps, the Lodge's own sconces, and every Lodge piece
//   that burns (the stove, the candle and the lantern, the three wall flames, the candelabra). A lamp and the anemone stay steady.
//   A burning piece's body never moves: only its flame's zone changes, and frame 0 is the piece as it was drawn.
// - The light beside a flame swells and shrinks with the frame it shows.
// - Water moves slowly: the sea along the shore, the tide-pools (what lies in them never moves) and the Cellar's brine.
// - Rain splashes in frames; the Attic's window rain is a loop; a puff of dust rises where a piece is set down or put away.
// - Every loop has its still: Lite (and Reduce Motion) show frame 0 and nothing moves. Nothing here is saved.
const {chromium}=require('playwright');
const fails=[]; const ok=(c,m,d)=>{if(!c)fails.push(m+(d!==undefined?' '+JSON.stringify(d).slice(0,600):''));};
(async()=>{
  const b=await chromium.launch(); const ctx=await b.newContext({viewport:{width:412,height:860},deviceScaleFactor:2.625}); const p=await ctx.newPage();
  const errs=[]; p.on('pageerror',e=>errs.push(String(e)));
  await p.goto('file://'+process.argv[2]); await p.waitForTimeout(300);
  const shots=process.argv[3]||'.';

  /* 1. the frames themselves: every letter a PX letter (the splash its rain colours), every frame of a loop the same size, a
     Lodge flame's first frame the piece's own rows, and every piece that burns has a loop while a steady one has none */
  const d=await p.evaluate(()=>{const T=__t, out={}, PX=T.PX, I=T.LODGE_ITEMS;
    const letters=(rows,pal)=>rows.every(r=>[...r].every(ch=>ch==='.'||(pal||PX)[ch]));
    const same=F=>F.f.every(f=>f.length===F.f[0].length&&f.every(r=>r.length===F.f[0][0].length));
    out.town=Object.keys(T.TOWN_FIRE).map(k=>[k,T.TOWN_FIRE[k].f.length,same(T.TOWN_FIRE[k]),T.TOWN_FIRE[k].f.every(f=>letters(f))]);
    out.lodge=Object.keys(T.LODGE_FIRE).map(k=>{const F=T.LODGE_FIRE[k], rows=T.LODGE_ROWS[k][0], z0=F.f[0];
      const first=z0.every((r,y)=>rows[F.y+y].slice(F.x,F.x+r.length)===r);
      return [k,F.f.length,same(F),F.f.every(f=>letters(f)),first,F.y+z0.length<=rows.length&&F.x+z0[0].length<=rows[0].length];});
    out.burn=Object.keys(I).filter(k=>I[k].glow&&I[k].light&&!I[k].steady&&!I[k].col).sort().join();
    out.loops=Object.keys(T.LODGE_FIRE).sort().join();
    out.steady=Object.keys(I).filter(k=>I[k].steady||I[k].col).filter(k=>T.LODGE_FIRE[k]).join();
    const pts=s=>s.length%3===0&&[...s].every((ch,i)=>i%3===2?!!PX[ch]:T.T64?true:true);
    out.water=[T.TOWN_SEA.length,T.LODGE_BRINE.length,T.TOWN_POOL_WATER.length,T.LODGE_WIN_STREAK.length,
      [...T.TOWN_SEA,...T.LODGE_BRINE,...T.TOWN_POOL_WATER,...T.LODGE_WIN_STREAK].every(pts),T.TOWN_POOL_WATER[0]===''];
    out.splash=[T.TOWN_SPLASH.f.length,same(T.TOWN_SPLASH),T.TOWN_SPLASH.f.every(f=>letters(f,T.RAIN_PAL))];
    out.puff=[T.TOWN_PUFF.f.length,same(T.TOWN_PUFF),T.TOWN_PUFF.f.every(f=>letters(f))];
    return out;});
  console.log(JSON.stringify(d));
  ok(d.town.length===3&&d.town.every(t=>t[1]>=4&&t[1]<=8&&t[2]&&t[3]),'the brazier, the street-lamp and the Lodge’s sconces each loop in 4 to 8 frames of PX letters',d.town);
  ok(d.lodge.every(t=>t[1]>=4&&t[1]<=8&&t[2]&&t[3]&&t[4]&&t[5]),'every Lodge flame loops in 4 to 8 frames inside its piece, the first the piece as drawn',d.lodge);
  ok(d.burn===d.loops&&!d.steady,'every piece that burns has a loop, and no steady lamp or cold light does',{burn:d.burn,loops:d.loops,steady:d.steady});
  ok(d.water[0]>=4&&d.water[1]>=4&&d.water[2]>=4&&d.water[3]>=4&&d.water[4]&&d.water[5],'the sea, the brine, the pools and the window each move in frames; a still pool is the pool as it was',d.water);
  ok(d.splash[0]>=3&&d.splash[1]&&d.splash[2]&&d.puff[0]>=4&&d.puff[1]&&d.puff[2],'the splash and the dust come in frames, on their palettes',{splash:d.splash,puff:d.puff});

  /* 2. a burning piece's frames: the body never moves, only the flame's zone; the light follows the frame (the brightest frame
     has the widest light); a tide-pool's frames move only its water, never its rim or what lies in it */
  const f=await p.evaluate(()=>{const T=__t, out={};
    const px=cv=>cv.getContext('2d').getImageData(0,0,cv.width,cv.height).data;
    out.body=Object.keys(T.LODGE_FIRE).map(k=>{const F=T.LODGE_FIRE[k], a=T.lodgeFA(k,0), w=a.cv.width, z=F.f[0];
      if(!a.fr||a.fr.length!==F.f.length||a.emf.length!==F.f.length)return [k,'no frames'];
      const p0=px(a.fr[0]), c0=px(a.cv); let still=0, moved=0, outside=0;
      for(let i=0;i<p0.length;i++)if(p0[i]!==c0[i])still++;
      for(let n=1;n<a.fr.length;n++){const pn=px(a.fr[n]); let ch=0;
        for(let i=0;i<pn.length;i+=4){if(pn[i]===p0[i]&&pn[i+1]===p0[i+1]&&pn[i+2]===p0[i+2]&&pn[i+3]===p0[i+3])continue; ch++;
          const x=(i>>2)%w, y=((i>>2)/w)|0; if(x<F.x||x>=F.x+z[0].length||y<F.y||y>=F.y+z.length)outside++;}
        if(ch)moved++;}
      return [k,still,moved,outside];});
    /* the light follows: for each flame, the frame with the most of b and c gets the widest light */
    out.follow=[['brazier',T.TOWN_FIRE.brazier],['lamp',T.TOWN_FIRE.lamp],...Object.keys(T.LODGE_FIRE).map(k=>[k,T.LODGE_FIRE[k]])].map(([k,F])=>{
      const fk=T.fireFk(F), L={x:0,y:0,r:30,f:1,fk,ph:0}, n=F.f.map(r=>r.join('').split('').filter(c=>c==='b'||c==='c').length);
      const flick=fk.map((_,i)=>T.townFlick(L,i,false)), bi=n.indexOf(Math.max(...n)), lo=n.indexOf(Math.min(...n));
      return [k,flick[bi]===Math.max(...flick),flick[lo]===Math.min(...flick),Math.max(...flick)>Math.min(...flick),T.townFlick(L,3,true)===0];});
    /* a pool with something in it: frame 0 is the pool as it was, and later frames change only water pixels */
    const q={k:'iron'}, P0=px(T.townPool(q,0)), P1=px(T.townPool(q));
    let same=true; for(let i=0;i<P0.length;i++)if(P0[i]!==P1[i])same=false;
    const wat=new Set(['#04070b','#0a1118','#262e3b','#101419','#1a2028','#28303b','#3b4654','#36404f','#7a8a74','#5ab8a8','#3b6e5c']);
    let rimMoved=0, moved=0;
    for(let k=1;k<T.TOWN_POOL_WATER.length;k++){const Pk=px(T.townPool(q,k));
      for(let i=0;i<Pk.length;i+=4){if(Pk[i]===P0[i]&&Pk[i+1]===P0[i+1]&&Pk[i+2]===P0[i+2])continue; moved++;
        const h='#'+[P0[i],P0[i+1],P0[i+2]].map(v=>v.toString(16).padStart(2,'0')).join(''); if(P0[i+3]&&!['#0a1118','#262e3b'].includes(h))rimMoved++;}}
    out.pool=[same,moved,rimMoved];
    return out;});
  console.log(JSON.stringify(f));
  ok(f.body.every(t=>t[1]===0&&t[2]>=2&&t[3]===0),'a burning piece’s first frame is the piece, its other frames move only its flame’s zone',f.body);
  ok(f.follow.every(t=>t[1]&&t[2]&&t[3]&&t[4]),'a flame’s light is widest on its brightest frame and narrowest on its dimmest; still with Lite',f.follow);
  ok(f.pool[0]&&f.pool[1]>0&&f.pool[2]===0,'a pool’s still is the pool as it was; its frames move only the dark water, never the rim or what lies in it',f.pool);

  /* 3. drawn: the Lodge lit by everything that burns, in Full the room moves and in Lite it holds still. Developer mode, so
     nothing is written; ll-town is the same after */
  const before=await p.evaluate(()=>localStorage.getItem('ll-town'));
  const room=async(m,lite)=>p.evaluate(([m,lite])=>{const T=__t, W=T.TWN;
    T.setLite(lite); W.lite=lite;
    W.t=0; W.dt=1/60; T.townFrame(1/60);
    const grab=()=>{const c=W.buf.getContext('2d').getImageData(0,0,W.vw,W.vh).data; return c;};
    const a=grab().slice(); const seen=[];
    for(const t of [.23,.57,1.3,2.9]){W.t=t; T.townDraw(); const c=grab(); let n=0; for(let i=0;i<c.length;i+=4)if(c[i]!==a[i]||c[i+1]!==a[i+1]||c[i+2]!==a[i+2])n++; seen.push(n);}
    T.setLite(false); W.lite=false; return seen;},[m,lite]);
  await p.evaluate(()=>{const T=__t; T.setDev(true); T.townOpen(); const D=T.townData(); D.res={timber:500,iron:500,tallow:500,curios:50};
    T.townRestoreLodge(); D.lodge.floor='parquet'; D.lodge.wall='library';
    D.lodge.furn=[{id:'stove',c:2,r:4},{id:'candelabra',c:7,r:4},{id:'chest',c:4,r:6,on:[{id:'candle',s:0},{id:'lantern',s:2}]},
      {id:'shiplamp',c:3,r:0},{id:'votive',c:6,r:0},{id:'sconce',c:8,r:0}];
    T.lodgeEnter(); const tw=document.getElementById('townCardWrap'); while(!tw.hidden)document.getElementById('townCard').click();
    T.TWN.p.x=4.5; T.TWN.p.y=7.6; T.TWN.p.face='u'; T.TWN.cx=null;});
  const full=await room('main',false), lite=await room('main',true);
  await p.evaluate(()=>{__t.TWN.t=.4; __t.townDraw();}); await p.waitForTimeout(80);
  await p.screenshot({path:shots+'/loops-lodge.png'});
  /* the Cellar: its brine and a stove standing in it; the Attic: its window */
  const cel=await p.evaluate(()=>{const T=__t, D=T.townData(); if(!T.lodgeRoomBuilt('cellar'))T.lodgeBuyRoom('cellar'); if(!T.lodgeRoomBuilt('attic'))T.lodgeBuyRoom('attic');
    T.lodgeRoom(D,'cellar').furn=[{id:'stove',c:3,r:4},{id:'candelabra',c:6,r:5}]; T.lodgeGo('cellar');
    const tw=document.getElementById('townCardWrap'); while(!tw.hidden)document.getElementById('townCard').click();
    T.TWN.p.x=4.5; T.TWN.p.y=7; T.TWN.cx=null; return !!T.lodgeArt().brine;});
  const cfull=await room('cellar',false), clite=await room('cellar',true);
  await p.evaluate(()=>{__t.TWN.t=.4; __t.townDraw();}); await p.waitForTimeout(80);
  await p.screenshot({path:shots+'/loops-cellar.png'});
  await p.evaluate(()=>{const T=__t; T.lodgeGo('main'); T.lodgeGo('attic'); const tw=document.getElementById('townCardWrap'); while(!tw.hidden)document.getElementById('townCard').click();
    T.TWN.p.x=5; T.TWN.p.y=4; T.TWN.cx=null;});
  const afull=await room('attic',false), alite=await room('attic',true);
  console.log('changed pixels, Full and Lite: main',full,lite,'cellar',cfull,clite,'attic',afull,alite);
  ok(full.some(n=>n>20)&&lite.every(n=>n===0),'the Lodge’s flames move in Full and hold still in Lite',{full,lite});
  ok(cel&&cfull.some(n=>n>20)&&clite.every(n=>n===0),'the Cellar’s brine and its flames move in Full and hold still in Lite',{cfull,clite});
  ok(afull.some(n=>n>0)&&alite.every(n=>n===0),'the Attic’s window rain loops in Full and holds still in Lite',{afull,alite});

  /* 4. the square: the braziers' glow moves in Full and holds in Lite; the sea along the shore too. The rain falls in Lite as
     well, so the drops are sent to the top of the screen and only the lower part is compared; the Keepers (who breathe in Lite
     too, as before) are out of the square while it is */
  const sq=await p.evaluate(()=>{const T=__t, W=T.TWN, out={}; T.lodgeGo('main'); T.lodgeLeave();
    const tw=document.getElementById('townCardWrap'); while(!tw.hidden)document.getElementById('townCard').click();
    const glow=()=>W.glow.getContext('2d').getImageData(0,0,W.vw,W.vh).data.slice();
    const diff=(a,c,y0)=>{let n=0; for(let i=y0*W.vw*4;i<c.length;i+=4)if(c[i]!==a[i]||c[i+1]!==a[i+1]||c[i+2]!==a[i+2])n++; return n;};
    const crowd=W.crowd; W.crowd=[];
    const run=(lite,which)=>{T.setLite(lite); W.p.x=which==='sea'?12:12; W.p.y=which==='sea'?20.5:12.6; W.cx=null; W.t=0; T.townFrame(1/60); W.dt=0;
      const pin=()=>{if(W.rain)for(let i=0;i<W.rain.length;i+=4){W.rain[i+1]=-30; W.rain[i+3]=1e9;} if(W.splash)W.splash.fill(0);};
      pin(); T.townDraw(); const a=which==='sea'?W.buf.getContext('2d').getImageData(0,0,W.vw,W.vh).data.slice():glow(); const seen=[];
      for(const t of [.35,.8,1.6,2.5]){W.t=t; pin(); T.townDraw(); seen.push(diff(a,which==='sea'?W.buf.getContext('2d').getImageData(0,0,W.vw,W.vh).data:glow(),which==='sea'?Math.round(W.vh*.4):0));}
      T.setLite(false); return seen;};
    out.fire=[run(false,'fire'),run(true,'fire')]; out.sea=[run(false,'sea'),run(true,'sea')];
    W.crowd=crowd; W.dt=1/60; return out;});
  console.log(JSON.stringify(sq));
  ok(sq.fire[0].some(n=>n>10)&&sq.fire[1].every(n=>n===0),'the braziers’ fire moves in Full and holds still in Lite',sq.fire);
  ok(sq.sea[0].some(n=>n>0)&&sq.sea[1].every(n=>n===0),'the sea along the shore moves in Full and holds still in Lite',sq.sea);
  await p.evaluate(()=>{const W=__t.TWN; W.p.x=12; W.p.y=19.5; W.cx=null; W.t=1; __t.townFrame(1/60); __t.townFrame(1/60);}); await p.waitForTimeout(80);
  await p.screenshot({path:shots+'/loops-shore.png'});
  await p.evaluate(()=>{const W=__t.TWN; W.p.x=12; W.p.y=12.6; W.cx=null; __t.townFrame(1/60); __t.townFrame(1/60);}); await p.waitForTimeout(80);
  await p.screenshot({path:shots+'/loops-square.png'});

  /* 5. dust: setting a piece down raises a puff where it stands (Full only), which runs its frames and is gone; storing one
     raises one where it was held. A splash runs its frames over its time */
  const du=await p.evaluate(()=>{const T=__t, W=T.TWN, out={}; T.townBuildSet(true);
    const live=()=>W.puff?[...W.puff].filter((v,i)=>i%3===2&&v>=0).length:0;
    const D=T.townData(); D.res={timber:500,iron:500,tallow:500,curios:50};
    out.place=T.townPlace('brazier',15,13)===''; out.n1=live();
    out.at=W.puff?[...W.puff].slice(0,2):null;
    for(let i=0;i<60;i++)T.townFrame(1/60); out.n2=live();
    const d=D.decos[D.decos.length-1]; T.bldLift(d); T.bldStow(); out.n3=live();
    for(let i=0;i<60;i++)T.townFrame(1/60);
    T.setLite(true); out.salv=T.bldSalvage('brazier'); out.n4=live(); T.setLite(false);
    T.townBuildSet(false);
    const sp=T.townDrops().spl; out.spl=[sp.length,sp[0].width,sp[0].height];
    return out;});
  console.log(JSON.stringify(du));
  ok(du.place&&du.n1===1&&du.at&&Math.abs(du.at[0]-(15*16+8))<1&&Math.abs(du.at[1]-(14*16-2))<1,'setting a piece down raises a puff at its foot',du);
  ok(du.n2===0&&du.n3===1,'the puff runs its frames and is gone; storing a piece raises one where it was held',du);
  ok(du.salv&&du.n4===0,'no puff with Lite',du);
  ok(du.spl[0]===d.splash[0]&&du.spl[1]>2,'the rain’s splash is drawn from its frames',du.spl);
  const after=await p.evaluate(()=>{__t.townClose(); __t.setDev(false); return localStorage.getItem('ll-town');});
  ok(after===before,'developer mode never writes ll-town',{before,after});

  /* 6. frame time, as town.test.js measures it: the square and the Cellar on a folded Fold, CPU slowed four times */
  const cdp=await ctx.newCDPSession(p);
  const measure=async where=>{await p.evaluate(w=>{const T=__t; T.setDev(true); T.townOpen(); const W=T.TWN;
      if(w==='cellar'){const D=T.townData(); D.res={timber:500,iron:500,tallow:500,curios:50}; T.townRestoreLodge(); T.lodgeEnter(); if(!T.lodgeRoomBuilt('cellar'))T.lodgeBuyRoom('cellar');
        T.lodgeRoom(D,'cellar').furn=[{id:'stove',c:3,r:4},{id:'candelabra',c:6,r:5}]; T.lodgeGo('cellar');}
      const tw=document.getElementById('townCardWrap'); while(!tw.hidden)document.getElementById('townCard').click();
      W.p.x=w==='cellar'?4.5:12; W.p.y=w==='cellar'?6:13; W.cx=null; for(let i=0;i<20;i++)T.townFrame(1/60);},where);
    await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
    const r=await p.evaluate(()=>{const ms=[]; for(let i=0;i<180;i++){const t0=performance.now(); __t.townFrame(1/60); ms.push(performance.now()-t0);}
      ms.sort((a,b)=>a-b); return {avg:+(ms.reduce((a,b)=>a+b,0)/ms.length).toFixed(2),p95:+ms[Math.floor(ms.length*.95)].toFixed(2)};});
    await cdp.send('Emulation.setCPUThrottlingRate',{rate:1}); await p.evaluate(()=>{__t.townClose(); __t.setDev(false);}); return r;};
  const tSq=await measure('square'), tCel=await measure('cellar');
  console.log('frame time, folded Fold, CPU ×4 slower: square',JSON.stringify(tSq),'cellar',JSON.stringify(tCel));
  ok(tSq.p95<16&&tCel.p95<16,'the square and the Cellar stay well inside a 60 Hz frame',{tSq,tCel});

  ok(!errs.length,'no page errors',errs);
  for(const m of fails)console.log('FAIL '+m);
  console.log(fails.length?fails.length+' failed':'loops ok');
  await b.close(); process.exit(fails.length?1:0);
})();
