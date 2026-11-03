// Saltmouth, art pass A3a (expansion/ART_UPGRADE.md §4, Art 3): the square's buildings and props from PixelLab.
// - Every building (TOWN_HOUSES, the workshops among them) has rows on the town's letters (PX), and so does its ruin; each is no
//   wider than its footprint, so it stands on its own tiles, centred.
// - A building's lit windows glow and throw light; unlit, the same panes are dark (and nothing of it glows). A ruin is its own
//   drawing. The Oar's ruin keeps one candle in a window; the Lodge's round window burns only once the Attic is built.
// - Trees, headstones, fences and braziers are PixelLab rows too, each canvas standing on its tile's foot; a north-south run of
//   railings is a post a tile, an east-west run is bars.
// - Nothing is written in developer mode.
const {chromium}=require('playwright');
const fails=[]; const ok=(c,m,d)=>{if(!c)fails.push(m+(d!==undefined?' '+JSON.stringify(d).slice(0,600):''));};
(async()=>{
  const b=await chromium.launch(); const p=await b.newPage();
  const errs=[]; p.on('pageerror',e=>errs.push(String(e)));
  await p.goto('file://'+process.argv[2]); await p.waitForTimeout(300);
  const before=await p.evaluate(()=>localStorage.getItem('ll-town'));

  const r=await p.evaluate(()=>{const T=__t, PX=T.PX, out={bad:[]};
    T.setDev(true); T.townReset(); T.townOpen();
    const px=cv=>cv.getContext('2d').getImageData(0,0,cv.width,cv.height).data;
    const glows=cv=>!!cv&&px(cv).some((v,i)=>i%4===3&&v);
    /* every building: art on PX letters, no wider than its footprint */
    for(const h of T.TOWN_HOUSES){const k=h.art; if(!k){out.bad.push('no art '+h.x+','+h.y); continue;}
      const H=T.townHouse(Object.assign({},h,{ruin:false})); if(H.cv.width>h.w*16)out.bad.push(k+' too wide '+H.cv.width);
      if(h.ruin!==undefined&&h.art!=='chandler'&&h.art!=='crypt'){const R=T.townHouse(Object.assign({},h,{ruin:true}));
        if(R.cv===H.cv)out.bad.push(k+' ruin is not its own'); if(R.cv.width>h.w*16)out.bad.push(k+' ruin too wide');}}
    /* the workshops: ruined, restored and lit are three looks (their pixels differ, not just their canvases); lit panes glow and light, unlit ones do neither */
    out.shops={};
    for(const k of ['brazier','quay','smithy','belfry','menagerie']){const W=T.TOWN_WORKSHOPS[k], h=W.house;
      const ruin=T.townHouse(Object.assign({},h,{ruin:true,lit:h.win.map(()=>false)})), rest=T.townHouse(Object.assign({},h,{ruin:false,lit:h.win.map(()=>false)})), lit=T.townHouse(Object.assign({},h,{ruin:false,lit:h.win.map(()=>true)}));
      const same=(a,b)=>{if(a.width!==b.width||a.height!==b.height)return false; const A=px(a), B=px(b); return A.every((v,i)=>v===B[i]);};
      out.shops[k]=[!same(ruin.cv,rest.cv)&&!same(rest.cv,lit.cv)&&!same(ruin.cv,lit.cv), !rest.em&&rest.wl.length===0, glows(lit.em)&&lit.wl.length>0];}
    /* the Oar's ruin: a candle in its last window; the Lodge's round window and the Attic */
    const oar=T.TOWN_HOUSES[2], L=T.TOWN_HOUSES[0];
    const oarR=T.townHouse(Object.assign({},oar,{ruin:true,lit:oar.win.map((w,i)=>i===oar.win.length-1)}));
    out.oar=glows(oarR.em)&&oarR.wl.length===1;
    const l0=T.townHouse(Object.assign({},L,{ruin:false,lit:[true,true],attic:false})), l1=T.townHouse(Object.assign({},L,{ruin:false,lit:[true,true],attic:true}));
    out.attic=[l0.wl.length,l1.wl.length];
    /* in the square: the Attic's window follows the Attic */
    const D=T.townData(); D.lodge=D.lodge||{}; D.lodge.built=true; T.townArt(); out.sq0=!!T.TOWN_HOUSES[0].attic;
    D.lodge.rooms=D.lodge.rooms||{}; D.lodge.rooms.attic={built:true,floor:'plank',wall:'stone',furn:[]}; T.townArt(); out.sq1=!!T.TOWN_HOUSES[0].attic;
    /* props: every canvas on PX colours, standing on its foot (its bottom row drawn) */
    const pal=new Set(Object.values(PX).map(h=>h.toLowerCase()));
    const onPX=cv=>{const d=px(cv); for(let i=0;i<d.length;i+=4){if(!d[i+3])continue; const h='#'+[d[i],d[i+1],d[i+2]].map(v=>v.toString(16).padStart(2,'0')).join(''); if(!pal.has(h))return false;} return true;};
    const foot=cv=>{const d=px(cv), w=cv.width, y=cv.height-1; for(let x=0;x<w;x++)if(d[(y*w+x)*4+3])return true; return false;};
    const props={tree:[[2,1],[1,6],[21,1],[3,13]].map(([x,y])=>T.townTree(x,y)), grave:[[8,2],[15,2],[8,4],[15,4]].map(([x,y])=>T.townGrave(x,y))};
    out.trees=new Set(props.tree.map(c=>c.toDataURL())).size; out.graves=new Set(props.grave.map(c=>c.toDataURL())).size;
    out.props=[...props.tree,...props.grave].every(c=>onPX(c)&&foot(c));
    out.housePX=T.TOWN_HOUSES.every(h=>onPX(T.townHouse(h).cv));
    /* the railings: east to west (row 1) is bars, north to south (column 7) a post a tile */
    const ew=T.townFence(9,1), ns=T.townFence(7,3), cols=cv=>{const d=px(cv), w=cv.width; let n=0; for(let x=0;x<w;x++){for(let y=0;y<cv.height;y++)if(d[(y*w+x)*4+3]){n++; break;}} return n;};
    out.fence=[cols(ew),cols(ns),foot(ew),foot(ns)];
    return out;});
  ok(!r.bad.length,'every building has its art and its ruin, none wider than its footprint',r.bad);
  for(const [k,v] of Object.entries(r.shops))ok(v.every(Boolean),k+': ruined, restored and lit are three looks; dark panes glow nowhere, lit ones glow and throw light',v);
  ok(r.oar,'the Oar’s ruin keeps a candle burning in one window',r);
  ok(r.attic[0]===2&&r.attic[1]===3,'the Lodge’s round window (the Attic’s) lights only with the Attic',r.attic);
  ok(!r.sq0&&r.sq1,'in the square, the round window follows the Attic being built',r);
  ok(r.trees>=2&&r.graves>=2,'the trees and the headstones come in kinds, picked by where they stand',r);
  ok(r.props&&r.housePX,'every building and prop is on the town’s colours and stands on its foot',r);
  ok(r.fence[0]===16&&r.fence[1]<=6&&r.fence[2]&&r.fence[3],'railings east to west are a run of bars, north to south a post',r.fence);
  const after=await p.evaluate(()=>localStorage.getItem('ll-town'));
  ok(after===before,'developer mode never writes ll-town');
  if(errs.length)fails.push('page errors: '+errs.join(' | '));
  await b.close();
  if(fails.length){for(const f of fails)console.log('FAIL '+f); process.exit(1);}
  console.log('scenery ok');
})();
