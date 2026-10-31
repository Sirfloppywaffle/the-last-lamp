// Saltmouth, art pass A2 (expansion/ART_UPGRADE.md §4, Art 2): every Keeper and every rescued soul drawn whole by PixelLab
// (the Peddler joined them in Expansion 4, step 6).
// - Each figure comes from TOWN_FIG: a walk and an idle for each facing drawn (d, u, r; l is r mirrored), every frame on the
//   figure's own palette letters (TOWN_KITS[k].pal, or a soul's art.pal) or the outline's 0, no bigger than 16 by 24.
// - Compiled, every frame is 16 by 24, fully there or not at all, its edge pure dark; what glows (em) shows through the dark on
//   its own layer, facing you at least. The three steps every other reader takes (town.test.js counts them) are still there.
// - A head is the same in every frame of a facing (Criss on #144); only the body moves.
// - What a figure holds is in every frame: the template animations drop it, and it is laid back from the still.
// - Walking runs every frame of the walk once a stride pair; standing, the idle by the clock; Lite and Reduce Motion stand a
//   figure still on the idle's first frame. Freed Keepers and souls standing at their posts breathe the same way.
// - A Keeper not yet freed stands as the shade of the figure drawn whole.
// - In a Lodge room with nothing lit, Ambrose's lantern is the only light: bright round him, dark in the far corner.
// - A comparison sheet (today's rows beside each figure, every facing, and the walk facing you) and a lineup in the square at
//   game scale are saved for the PR. Nothing is saved in developer mode.
const {chromium}=require('playwright');
const fails=[]; const ok=(c,m,d)=>{if(!c)fails.push(m+(d!==undefined?' '+JSON.stringify(d).slice(0,600):''));};
(async()=>{
  const b=await chromium.launch(); const ctx=await b.newContext({viewport:{width:412,height:860},deviceScaleFactor:2.625}); const p=await ctx.newPage();
  const errs=[]; p.on('pageerror',e=>errs.push(String(e)));
  await p.goto('file://'+process.argv[2]); await p.waitForTimeout(300);
  const shots=process.argv[3]||'.';
  const before=await p.evaluate(()=>localStorage.getItem('ll-town'));

  /* 1. the data */
  const d=await p.evaluate(()=>{const T=__t, out={};
    for(const k of Object.keys(T.TOWN_FIG)){const G=T.TOWN_FIG[k], K=T.TOWN_KITS[k]||T.TOWN_SOULS[k].art, pal=K.pal, o=out[k]={};
      o.n=['walk','idle'].map(a=>['d','u','r'].map(f=>G[a][f].length).join()).join(';');
      o.letters=['walk','idle'].every(a=>['d','u','r'].every(f=>G[a][f].every(fr=>fr.every(r=>[...r].every(ch=>ch==='.'||ch==='0'||pal[ch])))));
      o.size=['walk','idle'].every(a=>['d','u','r'].every(f=>G[a][f].every(fr=>fr.length<=24&&fr.every(r=>r.length===fr[0].length&&r.length<=16))));
      /* every frame of one facing's walk is cut to the same box, so a figure never jitters on the spot */
      o.box=['walk','idle'].every(a=>['d','u','r'].every(f=>G[a][f].every(fr=>fr.length===G[a][f][0].length&&fr[0].length===G[a][f][0][0].length)));
      /* one head a facing (Criss on #144: a frame filled Ambrose's face out a pixel each side): the nine rows from the top are the
         same in every walk and idle frame */
      const top=fr=>fr.findIndex(r=>/[^.]/.test(r)), head=fr=>fr.slice(top(fr),top(fr)+9).join('/');
      o.head=['d','u','r'].map(f=>new Set(G.walk[f].concat(G.idle[f]).map(head)).size);
      /* what glows shows facing you (and is in no frame where it is not drawn standing: the em letters are only for it) */
      const em=K.em||'', has=fr=>fr.some(r=>[...r].some(ch=>em.includes(ch)));
      o.glow=!em||has(G.idle.d[0]);
      o.emOnly=!em||['d','u','r'].every(f=>has(G.idle[f][0])||!G.walk[f].concat(G.idle[f]).some(has));}
    return out;});
  ok(Object.keys(d).sort().join()===['lamplighter','whaler','occultist','galvanist','bellringer','croupier','toothmonger','peddler'].sort().join(),'every Keeper and every soul (the Peddler too, Expansion 4 step 6) are drawn whole',Object.keys(d));
  for(const [k,o] of Object.entries(d)){
    ok(/^6,6,6;4,4,4$/.test(o.n),k+': a walk of six frames and an idle of four, for each facing drawn',o);
    ok(o.head.every(n=>n===1),k+': the head is the same in every frame of a facing: only the body walks and breathes',o);
    ok(o.letters&&o.size&&o.box,k+': every frame on its own letters (and the outline’s 0), no bigger than 16 by 24, one box a facing',o);
    ok(o.glow&&o.emOnly,k+': what glows (em) shows facing you, and nowhere it is not drawn standing',o);}
  const lan=await p.evaluate(()=>{const T=__t, G=T.TOWN_FIG.lamplighter, em=T.TOWN_KITS.lamplighter.em; return ['d','u','r'].map(f=>G.idle[f][0].some(r=>[...r].some(ch=>em.includes(ch))));});
  ok(lan.every(Boolean),'Ambrose’s lantern is in every facing, on the letters that glow (em)',lan);

  /* 2. compiled */
  const c=await p.evaluate(()=>{const T=__t, S=T.townSprites(), o={sizes:true,alpha:true,edge:true,steps:true,glow:true,mirror:true,dark:true,bad:[]};
    const px=cv=>cv.getContext('2d').getImageData(0,0,cv.width,cv.height).data;
    for(const k of Object.keys(T.TOWN_FIG)){const A=S[k], K=T.TOWN_KITS[k]||T.TOWN_SOULS[k].art, em=K.em||'';
      for(const f of ['d','u','r','l']){const L=A[f]; if(L.length!==3)o.steps=false;
        /* the facings whose standing frame has something that glows glow in every frame; the rest have nothing on that layer */
        const lit=!!em&&T.TOWN_FIG[k].idle[f==='l'?'r':f][0].some(r=>[...r].some(ch=>em.includes(ch)));
        for(const fr of L.walk.concat(L.idle)){const cv=fr.c; if(cv.width!==16||cv.height!==24)o.sizes=false; const q=px(cv);
          for(let y=0;y<24;y++)for(let x=0;x<16;x++){const i=(y*16+x)*4; if(q[i+3]!==0&&q[i+3]!==255)o.alpha=false; if(!q[i+3])continue;
            const e=x===0||x===15||y===0||y===23||!q[i-4+3]||!q[i+4+3]||!q[i-64+3]||!q[i+64+3];
            if(e&&(q[i]>12||q[i+1]>12||q[i+2]>16)){o.edge=false; o.bad.push(k+f+' '+x+','+y);}}
          const g=!!fr.em&&px(fr.em).some((v,i)=>i%4===3&&v);
          if(lit&&!g){o.glow=false; o.bad.push(k+f+' unlit');}
          if(!lit&&g){o.dark=false; o.bad.push(k+f+' glows');}}
        if(L[0]!==L.idle[0])o.steps=false;}
      /* l is r, mirrored, pixel for pixel */
      for(let i=0;i<6;i++){const a=px(A.r.walk[i].c), m=px(A.l.walk[i].c);
        for(let y=0;y<24;y++)for(let x=0;x<16;x++){const u=(y*16+x)*4, j=(y*16+15-x)*4; if(a[u+3]!==m[j+3]||a[u]!==m[j])o.mirror=false;}}}
    /* a Keeper not yet freed stands as a shade: the silhouette of the figure drawn whole, not of the old rows */
    o.shade=['whaler','occultist','galvanist','bellringer'].every(k=>{const a=px(T.townShade(k)), b=px(S[k].d.idle[0].c);
      for(let i=3;i<a.length;i+=4)if(!!a[i]!==!!b[i])return false; return true;});
    o.bad=o.bad.slice(0,12);
    /* the walk: over one stride pair (as the old four steps took) every frame shows once, in order; standing, the idle by the
       clock; still (Lite, Reduce Motion), the idle's first frame whatever the clock says */
    const L=S.lamplighter.d, seen=[], idle=new Set(); for(let i=0;i<24;i++){const fr=T.townFigPick(L,true,i/24*(4/(T.TOWN_SPEED*2.4)),0,false); seen.push(L.walk.indexOf(fr));}
    o.walk=[...new Set(seen)].join();
    for(let t=0;t<3;t+=.05)idle.add(L.idle.indexOf(T.townFigPick(L,false,0,t,false)));
    o.idle=[...idle].sort().join();
    o.still=[0,.4,1.1,2.7].every(t=>T.townFigPick(L,false,0,t,true)===L.idle[0]);
    /* a clock below zero still picks a frame (loops.test.js runs the square's clock backwards) */
    o.neg=!!T.townFigPick(L,false,0,-2.3,false)&&!!T.townFigPick(L,true,-1,0,false);
    return o;});
  ok(c.sizes&&c.alpha&&c.edge,'every frame 16 by 24, no anti-aliasing, its edge pure dark',c);
  ok(c.steps,'the three steps everything else reads are still there, the first the idle’s still',c);
  ok(c.glow&&c.dark,'what glows glows through the dark in every frame of a facing that shows it, and nothing else does',c);
  ok(c.mirror,'facing left is facing right mirrored',c);
  ok(c.shade,'a Keeper not yet freed stands as the shade of the figure drawn whole',c);
  ok(c.walk==='0,1,2,3,4,5','a stride pair walks through all six frames in order',c);
  ok(c.idle==='0,1,2,3'&&c.still,'standing, a figure breathes in four frames; Lite and Reduce Motion hold the first',c);
  ok(c.neg,'a clock below zero still picks a frame',c);

  /* 3. drawn: in the square he is the figure from TOWN_FIG; a freed Ambrose at his post breathes (another Keeper carried) */
  const sq=await p.evaluate(()=>{const T=__t; T.setDev(true); T.townReset(); T.townOpen();
    const tw=document.getElementById('townCardWrap'); while(!tw.hidden)document.getElementById('townCard').click();
    const W=T.TWN, o={kit:W.kit}; W.p.x=12.5; W.p.y=12.8; W.p.face='d'; W.p.moving=false; W.cx=null; W.path=null; W.t=.1; T.townFrame(1/60); T.townFrame(1/60);
    return o;});
  await p.waitForTimeout(80);
  await p.screenshot({path:shots+'/figure-square.png'});
  ok(sq.kit==='lamplighter','the square opens with Ambrose carried',sq);

  /* 3b. the lineup at game scale for the PR: every freed Keeper and every soul (developer mode frees them, in its own copy) stood
     in a row below Ambrose on the deck, more than two tiles off so they face you (nearer, a figure turns to Ambrose); then every
     figure's four facings at the square's own scale (TWN.k device pixels an art pixel), on its night */
  const ln=await p.evaluate(()=>{const T=__t, W=T.TWN, D=T.townData(); D.rescued=['croupier','toothmonger','peddler']; T.townKeepers(); T.townFrame(1/60);
    const order=['whaler','occultist','galvanist','bellringer','croupier','toothmonger','peddler'];
    W.crowd.forEach(e=>{const i=order.indexOf(e.k); e.x=W.p.x+(i-3)*1.15; e.y=W.p.y+2.3; e.base=Math.round(e.y*16); e.face='d';});
    /* each figure's own pool of light goes with it (townKeepers() laid them at the posts) */
    const A=T.townArt(); A.lights=A.lightsD.concat(W.crowd.map(e=>({x:Math.round(e.x*16),y:Math.round((e.y-.82)*16)+2,r:22,f:.35})));
    W.crowd.sort((a,b)=>a.base-b.base); W.t=.1; T.townFrame(1/60); return W.crowd.map(e=>e.k).sort().join();});
  await p.waitForTimeout(80);
  await p.screenshot({path:shots+'/figure-lineup.png'});
  await p.evaluate(()=>{const T=__t, S=T.townSprites(), k=T.TWN.k, K=Object.keys(T.TOWN_FIG), F=['d','r','u','l'];
    const cv=document.createElement('canvas'); cv.id='figScale'; cv.width=(16*4+12)*k+8; cv.height=(24+4)*K.length*k+8; const c=cv.getContext('2d'); c.imageSmoothingEnabled=false;
    c.fillStyle='#16130f'; c.fillRect(0,0,cv.width,cv.height);
    K.forEach((n,r)=>F.forEach((f,i)=>c.drawImage(S[n][f].idle[0].c,4+i*19*k,4+r*28*k,16*k,24*k)));
    Object.assign(cv.style,{position:'fixed',left:0,top:0,zIndex:9999,width:cv.width/devicePixelRatio+'px'}); document.body.appendChild(cv);});
  const sb=await p.evaluate(()=>{const r=document.getElementById('figScale').getBoundingClientRect(); return {x:0,y:0,width:r.width,height:r.height};});
  await p.screenshot({path:shots+'/figure-scale.png',clip:sb});
  await p.evaluate(()=>document.getElementById('figScale').remove());
  ok(ln===['bellringer','croupier','galvanist','occultist','peddler','toothmonger','whaler'].join(),'every freed Keeper and every soul stand in the square',ln);

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

  /* 5. the comparison sheet for the PR: per figure, today's rows (townKeeper) in four facings, the figure drawn whole in four, and
     its walk facing you; four times up */
  await p.evaluate(()=>{const T=__t, S=T.townSprites(), k=4, F=['d','r','u','l'], K=Object.keys(T.TOWN_FIG);
    const cv=document.createElement('canvas'); cv.id='figCompare'; cv.width=(16*k+8)*15+8; cv.height=(24*k+8)*K.length+8; const c=cv.getContext('2d'); c.imageSmoothingEnabled=false;
    c.fillStyle='#16181f'; c.fillRect(0,0,cv.width,cv.height);
    const put=(im,col,row)=>c.drawImage(im,8+col*(16*k+8),8+row*(24*k+8),16*k,24*k);
    K.forEach((n,r)=>{F.forEach((f,i)=>{put(T.townKeeper(n,f,0).c,i,r); put(S[n][f].idle[0].c,i+5,r);}); S[n].d.walk.forEach((fr,i)=>put(fr.c,i+9,r));});
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
