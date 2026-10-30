// Saltmouth, art pass A2's pilot (expansion/ART_UPGRADE.md §4, Art 2): Ambrose the Lamplighter drawn whole by PixelLab.
// - His figure comes from TOWN_FIG: a walk and an idle for each facing drawn (d, u, r; l is r mirrored), every frame on his own
//   palette letters (TOWN_KITS.lamplighter.pal) or the outline's 0, no bigger than 16 by 24.
// - Compiled, every frame is 16 by 24, fully there or not at all, its edge pure dark; his lantern glows through the dark on its
//   own layer. The three steps every other reader takes (town.test.js counts them) are still there.
// - His head is the same in every frame of a facing (Criss on #144); only his body moves.
// - Walking runs every frame of the walk once a stride pair; standing, he breathes in the idle by the clock; Lite and Reduce
//   Motion stand him still on the idle's first frame. Freed Keepers standing at their posts breathe the same way.
// - Everyone else is still made of the hand rows.
// - In a Lodge room with nothing lit, his lantern is the only light: bright round him, dark in the far corner.
// - A comparison sheet (today's rows beside the pilot, every facing, the walk and the idle) is saved for the PR. Nothing is saved
//   in developer mode.
const {chromium}=require('playwright');
const fails=[]; const ok=(c,m,d)=>{if(!c)fails.push(m+(d!==undefined?' '+JSON.stringify(d).slice(0,600):''));};
(async()=>{
  const b=await chromium.launch(); const ctx=await b.newContext({viewport:{width:412,height:860},deviceScaleFactor:2.625}); const p=await ctx.newPage();
  const errs=[]; p.on('pageerror',e=>errs.push(String(e)));
  await p.goto('file://'+process.argv[2]); await p.waitForTimeout(300);
  const shots=process.argv[3]||'.';
  const before=await p.evaluate(()=>localStorage.getItem('ll-town'));

  /* 1. the data */
  const d=await p.evaluate(()=>{const T=__t, G=T.TOWN_FIG.lamplighter, pal=T.TOWN_KITS.lamplighter.pal, o={};
    o.keys=Object.keys(T.TOWN_FIG).join();
    o.n=['walk','idle'].map(k=>['d','u','r'].map(f=>G[k][f].length).join()).join(';');
    o.letters=['walk','idle'].every(k=>['d','u','r'].every(f=>G[k][f].every(fr=>fr.every(r=>[...r].every(ch=>ch==='.'||ch==='0'||pal[ch]))))) ;
    o.size=['walk','idle'].every(k=>['d','u','r'].every(f=>G[k][f].every(fr=>fr.length<=24&&fr.every(r=>r.length===fr[0].length&&r.length<=16))));
    /* every frame of one facing's walk is cut to the same box, so he never jitters on the spot */
    o.box=['walk','idle'].every(k=>['d','u','r'].every(f=>G[k][f].every(fr=>fr.length===G[k][f][0].length&&fr[0].length===G[k][f][0][0].length)));
    /* one head a facing (Criss on #144: a frame filled his face out a pixel each side): the nine rows from the hat's top are the same
       in every walk and idle frame */
    const top=fr=>fr.findIndex(r=>/[^.]/.test(r)), head=fr=>fr.slice(top(fr),top(fr)+9).join('/');
    o.head=['d','u','r'].map(f=>new Set(G.walk[f].concat(G.idle[f]).map(head)).size);
    const em=T.TOWN_KITS.lamplighter.em; o.lantern=['d','u','r'].map(f=>G.idle[f][0].some(r=>[...r].some(ch=>em.includes(ch))));
    return o;});
  ok(d.keys==='lamplighter','only Ambrose is drawn whole: the pilot',d);
  ok(/^6,6,6;4,4,4$/.test(d.n),'a walk of six frames and an idle of four, for each facing drawn',d);
  ok(d.head.every(n=>n===1),'his head is the same in every frame of a facing: only his body walks and breathes',d);
  ok(d.letters&&d.size&&d.box,'every frame on his own letters (and the outline’s 0), no bigger than 16 by 24, one box a facing',d);
  ok(d.lantern.every(Boolean),'his lantern is in every facing, on the letters that glow (em)',d);

  /* 2. compiled */
  const c=await p.evaluate(()=>{const T=__t, S=T.townSprites(), A=S.lamplighter, o={sizes:true,alpha:true,edge:true,steps:true,glow:true,mirror:true};
    const px=cv=>cv.getContext('2d').getImageData(0,0,cv.width,cv.height).data;
    for(const f of ['d','u','r','l']){const L=A[f]; if(L.length!==3)o.steps=false;
      for(const fr of L.walk.concat(L.idle)){const cv=fr.c; if(cv.width!==16||cv.height!==24)o.sizes=false; const q=px(cv);
        for(let y=0;y<24;y++)for(let x=0;x<16;x++){const i=(y*16+x)*4; if(q[i+3]!==0&&q[i+3]!==255)o.alpha=false; if(!q[i+3])continue;
          const e=x===0||x===15||y===0||y===23||!q[i-4+3]||!q[i+4+3]||!q[i-64+3]||!q[i+64+3];
          if(e&&(q[i]>12||q[i+1]>12||q[i+2]>16))o.edge=false;}
        if(!fr.em||!px(fr.em).some((v,i)=>i%4===3&&v))o.glow=false;}
      if(L[0]!==L.idle[0])o.steps=false;}
    /* l is r, mirrored, pixel for pixel */
    for(let k=0;k<6;k++){const a=px(A.r.walk[k].c), m=px(A.l.walk[k].c);
      for(let y=0;y<24;y++)for(let x=0;x<16;x++){const i=(y*16+x)*4, j=(y*16+15-x)*4; if(a[i+3]!==m[j+3]||a[i]!==m[j])o.mirror=false;}}
    o.others=Object.keys(S).filter(k=>k!=='lamplighter').every(k=>!S[k].d.walk&&S[k].d.length===3);
    /* the walk: over one stride pair (as the old four steps took) every frame shows once, in order; standing, the idle by the
       clock; still (Lite, Reduce Motion), the idle's first frame whatever the clock says */
    const L=A.d, seen=[], idle=new Set(); for(let i=0;i<24;i++){const fr=T.townFigPick(L,true,i/24*(4/(T.TOWN_SPEED*2.4)),0,false); seen.push(L.walk.indexOf(fr));}
    o.walk=[...new Set(seen)].join();
    for(let t=0;t<3;t+=.05)idle.add(L.idle.indexOf(T.townFigPick(L,false,0,t,false)));
    o.idle=[...idle].sort().join();
    o.still=[0,.4,1.1,2.7].every(t=>T.townFigPick(L,false,0,t,true)===L.idle[0]);
    /* a clock below zero still picks a frame (loops.test.js runs the square's clock backwards) */
    o.neg=!!T.townFigPick(L,false,0,-2.3,false)&&!!T.townFigPick(L,true,-1,0,false);
    return o;});
  ok(c.sizes&&c.alpha&&c.edge,'every frame 16 by 24, no anti-aliasing, its edge pure dark',c);
  ok(c.steps,'the three steps everything else reads are still there, the first his idle’s still',c);
  ok(c.glow,'his lantern glows through the dark in every frame',c);
  ok(c.mirror,'facing left is facing right mirrored',c);
  ok(c.others,'every other Keeper and soul is still made of the hand rows',c);
  ok(c.walk==='0,1,2,3,4,5','a stride pair walks through all six frames in order',c);
  ok(c.idle==='0,1,2,3'&&c.still,'standing he breathes in four frames; Lite and Reduce Motion hold the first',c);
  ok(c.neg,'a clock below zero still picks a frame',c);

  /* 3. drawn: in the square he is the figure from TOWN_FIG; a freed Ambrose at his post breathes (another Keeper carried) */
  const sq=await p.evaluate(()=>{const T=__t; T.setDev(true); T.townReset(); T.townOpen();
    const tw=document.getElementById('townCardWrap'); while(!tw.hidden)document.getElementById('townCard').click();
    const W=T.TWN, o={kit:W.kit}; W.p.x=12.5; W.p.y=12.8; W.p.face='d'; W.p.moving=false; W.cx=null; W.path=null; W.t=.1; T.townFrame(1/60); T.townFrame(1/60);
    return o;});
  await p.waitForTimeout(80);
  await p.screenshot({path:shots+'/figure-square.png'});
  ok(sq.kit==='lamplighter','the square opens with Ambrose carried',sq);

  /* 4. a dark Lodge room: nothing lit, so his lantern is the only light */
  const dk=await p.evaluate(()=>{const T=__t, W=T.TWN, D=T.townData(); D.res={timber:900,iron:900,tallow:900,curios:90}; T.townRestoreLodge();
    D.lodge.floor='planks'; D.lodge.wall='damp'; D.lodge.sconces=[];
    D.lodge.furn=[{id:'hearth',c:6,r:3,out:true},{id:'chair',c:3,r:5,f:1},{id:'desk',c:6,r:6,on:[{id:'candle',s:1,out:true}]}];
    T.lodgeEnter(); const tw=document.getElementById('townCardWrap'); while(!tw.hidden)document.getElementById('townCard').click();
    T.lodgeSync(); W.p.x=4.5; W.p.y=6.6; W.p.face='d'; W.cx=null; W.path=null; W.t=.1; T.townFrame(1/60); T.townFrame(1/60);
    const A=T.lodgeArt(), bc=W.bc, cx=W.lcx, cy=W.lcy, lum=(x,y,s)=>{const q=bc.getImageData(x-cx-s/2|0,y-cy-s/2|0,s,s).data; let n=0; for(let i=0;i<q.length;i+=4)n+=q[i]*.3+q[i+1]*.59+q[i+2]*.11; return n/(q.length/4);};
    const o={warm:A.lights.filter(L=>L.w>0).length,night:A.dark===T.LODGE_ROOMS.main.night};
    /* the floor beside him against the floor in the far corner */
    o.near=lum(Math.round(W.p.x*16)+12,Math.round(W.p.y*16)-4,6); o.far=lum(8*16+8,8*16+8,6);
    /* the lantern itself is drawn after the dark: some pixel of his figure is its gold */
    const fx=Math.round(W.p.x*16)-cx-8, fy=Math.round(W.p.y*16)-cy-22, q=bc.getImageData(fx,fy,16,24).data; o.gold=0;
    for(let i=0;i<q.length;i+=4)if(q[i]>200&&q[i+1]>150&&q[i+2]<140)o.gold++;
    return o;});
  await p.waitForTimeout(80);
  await p.screenshot({path:shots+'/figure-lodge-dark.png'});
  ok(dk.warm===0&&dk.night,'nothing burns in the room: it sits at its night',dk);
  ok(dk.near>dk.far+6,'his lantern carves its pool: the floor beside him is lighter than the far corner',dk);
  ok(dk.gold>0,'his lantern shows through the dark',dk);

  /* 5. the comparison sheet for the PR: today's rows (townKeeper) beside the pilot, six times up */
  await p.evaluate(()=>{const T=__t, S=T.townSprites().lamplighter, k=6, F=['d','r','u','l'];
    const cv=document.createElement('canvas'); cv.id='figCompare'; cv.width=(16*k+8)*10+8; cv.height=(24*k+8)*3+8; const c=cv.getContext('2d'); c.imageSmoothingEnabled=false;
    c.fillStyle='#16181f'; c.fillRect(0,0,cv.width,cv.height);
    const put=(im,col,row)=>c.drawImage(im,8+col*(16*k+8),8+row*(24*k+8),16*k,24*k);
    F.forEach((f,i)=>{put(T.townKeeper('lamplighter',f,0).c,i,0); put(S[f].idle[0].c,i+5,0);});
    S.d.walk.forEach((fr,i)=>put(fr.c,i,1)); S.d.idle.forEach((fr,i)=>put(fr.c,i+6,1));
    S.r.walk.forEach((fr,i)=>put(fr.c,i,2)); S.u.idle.forEach((fr,i)=>put(fr.c,i+6,2));
    Object.assign(cv.style,{position:'fixed',left:0,top:0,zIndex:9999,width:cv.width/devicePixelRatio+'px'}); document.body.appendChild(cv);});
  const box=await p.evaluate(()=>{const r=document.getElementById('figCompare').getBoundingClientRect(); return {x:0,y:0,width:r.width,height:r.height};});
  await p.screenshot({path:shots+'/figure-compare.png',clip:box});
  await p.evaluate(()=>document.getElementById('figCompare').remove());

  const after=await p.evaluate(()=>{__t.townClose(); __t.setDev(false); return localStorage.getItem('ll-town');});
  ok(after===before,'developer mode never writes ll-town',{before,after});

  ok(errs.length===0,'no page errors',errs);
  await b.close();
  if(fails.length){fails.forEach(f=>console.log('FAIL '+f)); process.exit(1);}
  console.log('figure: all checks passed');
})().catch(e=>{console.log('FAIL '+e.stack); process.exit(1);});
