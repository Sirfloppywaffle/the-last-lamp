// Saltmouth, art pass A3b (expansion/ART_UPGRADE.md §4, Art 3): the square's ground from PixelLab Wang tiles, and the haul's
// readout in a pixel frame with an icon per material.
// - Each set has its 16 tiles (every corner combination), 16 rows of 16, every letter in PX.
// - Every map tile is its own terrain at its centre: earth on bare ground, cobbles on the square, deck in front of the shaft.
// - The cliff and the sea are townGroundPx() as before. A path laid in build mode (Expansion 4, step 7) is a terrain of its own: its
//   middle is its set's, its rim reaches into the tiles beside it (the Wang edge, as the square's cobbles have), and taking it up puts
//   the ground back exactly.
// - The readout: a frame and four icons painted, no taller than the Title button, no wider or narrower as the counts grow.
// - Nothing is written in developer mode.
const {chromium}=require('playwright');
const fails=[]; const ok=(c,m,d)=>{if(!c)fails.push(m+(d!==undefined?' '+JSON.stringify(d).slice(0,600):''));};
(async()=>{
  const b=await chromium.launch(); const p=await b.newPage({viewport:{width:412,height:860},deviceScaleFactor:2.6});
  const errs=[]; p.on('pageerror',e=>errs.push(String(e)));
  await p.goto('file://'+process.argv[2]); await p.waitForTimeout(300);
  const before=await p.evaluate(()=>localStorage.getItem('ll-town'));
  const r=await p.evaluate(()=>{const T=__t, PX=T.PX, W=T.TOWN_WANG, o={bad:[]};
    const keys=[]; for(let i=0;i<16;i++)keys.push(i.toString(2).padStart(4,'0'));
    for(const s of ['ec','cd','es','ep','es2','ep2','ep3']){const S=W[s]; if(!S){o.bad.push('no set '+s); continue;}
      for(const k of keys){const t=S[k]; if(!t||t.length!==16||t.some(r=>r.length!==16||[...r].some(ch=>!PX[ch])))o.bad.push(s+' '+k);}}
    /* each tile's middle 4×4 is its own terrain's letters (all but a stray pixel or two: a plank's dark seam reads as mortar) */
    const L={0:'lmn',1:'01234qrs',2:'4567',3:'234ued'}, M=T.TOWN_MAP; o.centre=[];
    /* map expansion, M1: 36 by 36; the stairs are drawn into the ground, not Wang tiles */
    for(let ty=0;ty<M.length;ty++)for(let tx=0;tx<M[0].length;tx++){const ch=M[ty][tx]; if(ch==='^'||ch==='~'||ch==='/')continue; const t=T.townTer(tx,ty);
      let n=0; for(let y=6;y<10;y++)for(let x=6;x<10;x++)if(L[t].indexOf(T.townWangPx(tx*16+x,ty*16+y))>=0)n++;
      if(n<13)o.centre.push([tx,ty,ch,n]);}
    /* the cliff and the sea untouched, and a laid path is townGroundPx's cobbles */
    const g=T.townGround(), c=g.getContext('2d'), d=c.getImageData(0,0,g.width,g.height).data, hex=i=>'#'+[d[i],d[i+1],d[i+2]].map(v=>v.toString(16).padStart(2,'0')).join('');
    o.edge=0; for(let y=0;y<g.height;y+=3)for(let x=0;x<g.width;x+=3){const ch=M[(y/16)|0][(x/16)|0]; if(ch!=='^'&&ch!=='~')continue;
      if(hex((y*g.width+x)*4)!==PX[T.townGroundPx(x,y,ch)])o.edge++;}
    T.setDev(true); T.townReset(); T.townOpen();
    const D=T.townData(); D.res={timber:500,iron:500,tallow:500,curios:50};
    const A0=T.townArt(), g0=A0.ground.getContext('2d'), snap=(tx,ty)=>g0.getImageData(tx*16,ty*16,16,16).data, same=(a,b)=>{let n=0; for(let i=0;i<a.length;i++)if(a[i]!==b[i])n++; return n;};
    const before0=snap(2,26), mid0=snap(3,26); o.rim={};
    /* each laid kind: its tile's middle is its set's letters, the tile beside it (earth) gains a rim, and taking it up restores both */
    const kinds={cobble:['01234qrs',3,13],shell:['234ued',6,8],board:['5667o',9,13]};
    for(const k in kinds){
      const [L,tx,need]=kinds[k], ty=26, b0=snap(tx-1,ty), m0=snap(tx,ty);
      const ok1=T.townPlace(k,tx,ty)==='', A=T.townArt(), c=A.ground.getContext('2d');
      let n=0; for(let y=6;y<10;y++)for(let x=6;x<10;x++)if(L.indexOf(T.townWangPx(tx*16+x,ty*16+y))>=0)n++;
      const rim=same(snap(tx-1,ty),b0);
      const d=D.decos.find(e=>e.id===k&&e.c===tx&&e.r===ty); T.townTakeUp(d);
      o.rim[k]={placed:ok1,centre:n,need,rim,back:same(snap(tx-1,ty),b0)+same(snap(tx,ty),m0)};}
    /* the readout */
    const tw=document.getElementById('townCardWrap'); while(!tw.hidden)document.getElementById('townCard').click();
    const res=document.getElementById('townRes'), q=e=>e.getBoundingClientRect();
    o.frame=/url\(/.test(res.style.getPropertyValue('--res-frame'))&&getComputedStyle(res).borderImageSource!=='none';
    o.icons=[...res.querySelectorAll('.town-ico')].map(i=>/url\(/.test(i.style.backgroundImage)&&q(i).width>=10).join();
    D.res={timber:0,iron:0,tallow:0,curios:0}; T.townHud(); const a=q(res);
    D.res={timber:999,iron:999,tallow:999,curios:99}; T.townHud(); const z=q(res);
    o.box=[a.width,a.height,z.width,z.height]; o.back=q(document.getElementById('townBack')).height;
    o.font=parseFloat(getComputedStyle(document.getElementById('townResTimber')).fontSize);
    o.rows=[T.TOWN_HUD_FRAME.length,T.TOWN_HUD_FRAME[0].length,T.TOWN_HUD_FRAME.every(r=>r.length===T.TOWN_HUD_FRAME[0].length&&[...r].every(ch=>ch==='.'||PX[ch]))];
    o.iconRows=Object.values(T.TOWN_RES_ICON).every(t=>t.length===16&&t.every(r=>r.length===16&&[...r].every(ch=>ch==='.'||PX[ch])));
    T.setDev(false); return o;});
  ok(!r.bad.length,'every Wang set has its 16 tiles of 16 by 16 on PX letters',r.bad);
  ok(!r.centre.length,'every tile of TOWN_MAP is its own terrain at its centre',r.centre.slice(0,8));
  ok(r.edge===0,'the cliff and the sea are painted as before',r.edge);
  for(const k of ['cobble','shell','board']){const q=r.rim[k]||{};
    ok(q.placed&&q.centre>=q.need,'a laid '+k+' path is its own terrain at its middle',q);
    ok(q.rim>8,'a laid '+k+' path reaches into the earth beside it with a rim (its Wang edge, not a hard square)',q);
    ok(q.back===0,'taking a laid '+k+' path up puts the ground back exactly',q);}
  ok(r.frame&&r.icons==='true,true,true,true','the readout has its frame and an icon for each material',[r.frame,r.icons]);
  ok(r.box[0]===r.box[2]&&r.box[1]===r.box[3],'the readout keeps its size as the counts grow',r.box);
  ok(r.box[1]<=r.back,'the readout is no taller than the Title button',[r.box,r.back]);
  ok(r.font>=12,'on a folded Fold the counts are 12 px or more',r.font);
  ok(r.rows[2]&&r.rows[0]>=14&&r.iconRows,'the frame and the icons are rows on PX letters',r.rows);
  const after=await p.evaluate(()=>localStorage.getItem('ll-town'));
  ok(after===before,'developer mode writes nothing to ll-town');
  if(errs.length)fails.push('page errors: '+errs.join(' | '));
  await b.close();
  if(fails.length){for(const f of fails)console.log('FAIL '+f); process.exit(1);} console.log('ground: all good');
})();
