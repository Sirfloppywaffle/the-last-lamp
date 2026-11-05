// Saltmouth, wider (map expansion, M3: expansion/MAP_EXPANSION.md §5): the fog and the outer dark.
// - The fog lies only over the shore (the drowned strand, the shingle, the dock) and the cemetery with the north acre.
// - The Hearth Beacon's circle thins it; Lite and Reduce Motion show the still (frame 0), Full plays its loop.
// - A plot that is shut, or open with nothing built in it that burns, lies darker than the square; a light built in it lifts it.
// - Neither changes anything you do: walking, building and the saved town are untouched.
// - A frame makes nothing: no canvas, no image data, while the square draws.
const {chromium}=require('playwright');
const fails=[]; const ok=(c,m,d)=>{if(!c)fails.push(m+(d!==undefined?' '+JSON.stringify(d).slice(0,700):''));};
(async()=>{
  const b=await chromium.launch(); const p=await b.newPage({viewport:{width:412,height:860}});
  const errs=[]; p.on('pageerror',e=>errs.push(String(e)));
  await p.goto('file://'+process.argv[2]); await p.waitForTimeout(300);

  /* 1. where the fog lies: every misted pixel of every frame within its areas (and their pad), and some mist over each place named */
  const f=await p.evaluate(()=>{const T=__t, o={};
    localStorage.removeItem('ll-town'); T.townReset(); T.setDev(false); T.townOpen(); T.townFrame(1/30);
    const A=T.townArt(), F=T.TOWN_FOG, P=F.pad, inA=(x,y)=>Object.values(F.areas).some(a=>a.r.some(([ax,ay,w,h])=>x>=ax*16-P&&y>=ay*16-P&&x<(ax+w)*16+P&&y<(ay+h)*16+P));
    o.keys=A.fog.map(a=>a.k).join(); o.frames=A.fog.map(a=>a.fr.length); o.out=0;
    const cover={}; const named={strand:[3,31],shingle:[15,31],dock:[27,34],cemetery:[7,5],acre:[2,11]};
    for(const a of A.fog)for(let k=0;k<a.fr.length;k++){const d=a.fr[k].getContext('2d').getImageData(0,0,a.w,a.h).data;
      for(let y=0;y<a.h;y++)for(let x=0;x<a.w;x++){if(!d[(y*a.w+x)*4+3])continue; const wx=a.x+x, wy=a.y+y;
        if(!inA(wx,wy))o.out++;
        for(const n in named){const [tx,ty]=named[n]; if(Math.abs(wx-(tx*16+8))<24&&Math.abs(wy-(ty*16+8))<24)cover[n]=(cover[n]||0)+1;}}}
    o.cover=cover;
    /* the square, the Rise's open ground and the wood have none */
    o.square=A.fog.some(a=>{const [x,y]=[18*16,22*16]; return x>=a.x&&y>=a.y&&x<a.x+a.w&&y<a.y+a.h;});
    o.wood=A.fog.some(a=>{const [x,y]=[28*16,4*16]; return x>=a.x&&y>=a.y&&x<a.x+a.w&&y<a.y+a.h;});
    return o;});
  ok(f.keys==='shore,cemetery'&&f.frames.every(n=>n===16),'the fog is two areas, the shore and the cemetery, each a loop of 16 frames',f);
  ok(f.out===0,'no mist falls outside the shore and the cemetery',f.out);
  ok(['strand','shingle','dock','cemetery','acre'].every(k=>f.cover[k]>50),'mist lies over the drowned strand, the shingle, the dock, the cemetery and the north acre',f.cover);
  ok(!f.square&&!f.wood,'the square and the black wood have no fog',f);

  /* 2. the Hearth's circle thins it: the shore's mist near the Hearth, cold and at level 5 */
  const h=await p.evaluate(()=>{const T=__t, H=T.HEARTH, D=T.townData(), sum=()=>{const A=T.townArt(), a=A.fog.find(q=>q.k==='shore'), R=T.HEARTH_RAIN[5]; let n=0;
      for(const cv of a.fr){const d=cv.getContext('2d').getImageData(0,0,a.w,a.h).data;
        for(let y=0;y<a.h;y++)for(let x=0;x<a.w;x++)if(Math.hypot(a.x+x-H.cx,a.y+y-H.cy)<R*.8)n+=d[(y*a.w+x)*4+3];}
      return n;};
    T.setDev(true); T.townReset(); T.townOpen(); const D2=T.townData(); D2.hearth={lv:0}; const cold=sum(); D2.hearth={lv:5}; const hot=sum(); D2.hearth={lv:0}; T.townArt();
    return {cold,hot};});
  ok(h.cold>0&&h.hot<h.cold*.5,'the Hearth Beacon at level 5 thins the mist inside its circle to under half',h);

  /* 3. Full plays the loop; Lite shows the still and the frames never change */
  const lp=await p.evaluate(()=>{const T=__t, W=T.TWN, o={full:new Set(),lite:new Set()};
    T.setDev(false); T.townReset(); T.townOpen(); W.p.x=15.5; W.p.y=31.5; W.cx=null;
    for(let i=0;i<40;i++){T.townFrame(1/20); o.full.add(W.fogK%16);}
    T.setLite(true); for(let i=0;i<40;i++){T.townFrame(1/20); o.lite.add(W.fogK);} T.setLite(false);
    return {full:o.full.size,lite:[...o.lite],n:W.fogN};});
  ok(lp.full>4&&lp.n>0,'Full plays the fog\'s loop',lp);
  ok(lp.lite.length===1&&lp.lite[0]===0,'Lite shows the still, frame 0',lp);

  /* 4. the outer dark: a shut plot lies deeper than the square; open with nothing burning, still; a lamp built in it lifts it */
  const od=await p.evaluate(()=>{const T=__t, W=T.TWN, o={};
    o.before=localStorage.getItem('ll-town');
    T.setDev(true); T.townReset(); T.townOpen(); const D=T.townData(); D.res={timber:99,iron:99,tallow:99,curios:9};
    /* the dark the view shows at a tile's middle (alpha of the mask), with you standing far from it */
    const dark=(tx,ty)=>{W.p.x=28.5; W.p.y=22.5; W.cx=null; T.townFrame(1/30); T.townFrame(1/30); const x=tx*16+8-W.lcx, y=ty*16+8-W.lcy;
      if(x<0||y<0||x>=W.vw||y>=W.vh)return -1; return W.mc.getImageData(x,y,1,1).data[3];};
    const A=T.townArt(), outer=k=>A.outer.find(q=>q.k===k);
    o.shut=T.PLOT_KEYS.every(k=>{const q=T.townArt().outer.find(z=>z.k===k); return q&&q.a>0&&q.night>.9;});
    o.sq=dark(25,27); o.loftsShut=dark(30,29); o.shutA=outer('lofts').a;
    T.townOpenPlot('lofts'); o.openA=T.townArt().outer.find(q=>q.k==='lofts').a; o.loftsOpen=dark(30,29);
    o.place=T.townPlace('lamp',32,28); const L=T.townArt().outer.find(q=>q.k==='lofts'); o.litA=L.a; o.litW=L.w; o.loftsLit=dark(30,29);
    o.woodA=T.townArt().outer.find(q=>q.k==='wood').a;
    o.same=localStorage.getItem('ll-town')===o.before;
    T.setDev(false); return o;});
  ok(od.shut,'every plot, shut, lies at full night',od);
  ok(od.sq>=0&&od.loftsShut>od.sq+10,'a shut plot is darker than the square',od);
  ok(od.loftsOpen>od.sq+10&&Math.abs(od.openA-od.shutA)<1e-9,'open with nothing burning, it stays at full night',od);
  ok(od.place===''&&od.litW>0&&od.litA<od.openA&&od.loftsLit<od.loftsOpen,'a lamp built in it lifts its dark',od);
  ok(od.woodA>0,'the other plots stay dark',od);
  ok(od.same,'developer mode wrote nothing');

  /* 5. a frame makes nothing: no canvas or image data while the square draws (Full, walking the shore and the cemetery) */
  const al=await p.evaluate(()=>{const T=__t, W=T.TWN, o={c:0,i:0};
    T.townReset(); T.setDev(false); T.townOpen(); W.p.x=12.5; W.p.y=31.5; W.cx=null;
    /* the same walk once first: a pool of light of each size the flicker reaches is made the first time it is drawn, and kept */
    const walk=()=>{W.p.x=12.5; W.p.y=31.5; W.cx=null; for(let i=0;i<60;i++){W.p.x=8+i*.2; T.townFrame(1/30);} W.p.x=7.5; W.p.y=6.5; W.cx=null; for(let i=0;i<60;i++)T.townFrame(1/30);};
    walk();
    const ce=document.createElement, P=CanvasRenderingContext2D.prototype, gi=P.getImageData, ci=P.createImageData;
    document.createElement=function(t){if(String(t).toLowerCase()==='canvas')o.c++; return ce.apply(this,arguments);};
    P.getImageData=function(){o.i++; return gi.apply(this,arguments);}; P.createImageData=function(){o.i++; return ci.apply(this,arguments);};
    try{walk();}
    finally{document.createElement=ce; P.getImageData=gi; P.createImageData=ci;}
    return o;});
  ok(al.c===0&&al.i===0,'a frame of the square, fog and the outer dark included, makes no canvas and reads no pixels',al);

  /* 6. Reduce Motion shows the still too */
  const p2=await b.newPage({viewport:{width:412,height:860}}); await p2.emulateMedia({reducedMotion:'reduce'}); p2.on('pageerror',e=>errs.push(String(e)));
  await p2.goto('file://'+process.argv[2]); await p2.waitForTimeout(300);
  const rm=await p2.evaluate(()=>{const T=__t, W=T.TWN, s=new Set(); T.townReset(); T.setDev(true); T.townOpen(); W.p.x=15.5; W.p.y=31.5; W.cx=null;
    for(let i=0;i<40;i++){T.townFrame(1/20); s.add(W.fogK);} T.setDev(false); return [...s];});
  ok(rm.length===1&&rm[0]===0,'Reduce Motion shows the still, frame 0',rm);

  /* 7. teach (rule 23): the rules line names the fog and the outer dark; the plots' tip says how a plot's dark lifts */
  const te=await p.evaluate(()=>{const T=__t, o={};
    T.tutSet({walk:'done',seen:['town','townhaul','townkeepers','gift'],off:false}); localStorage.removeItem('ll-town'); T.townReset(); T.townOpen();
    T.townGate('acre'); o.tip=document.querySelector('#townCard').textContent; T.closeModal(); document.querySelector('#townCard').click();
    o.rules=document.querySelector('#rulesList').innerHTML;
    T.tutSet({walk:'done',seen:[],off:true}); T.townClose(); return o;});
  ok(/deeper in the dark/.test(te.tip),'the plots\' tip says a shut or unlit plot lies deeper in the dark',te.tip);
  ok(/Mist lies along the shore and over the cemetery/.test(te.rules)&&/plots lie darker than the square/.test(te.rules),'the rules line names the fog and the outer dark');

  ok(!errs.length,'no page errors',errs);
  await b.close();
  if(fails.length){for(const f of fails)console.log('FAIL '+f); process.exit(1);} console.log('fog: all good');
})();
