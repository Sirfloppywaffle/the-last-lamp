// Saltmouth (Expansion 4, step 8): the Hearth Beacon.
// - A fixed place in the middle of the south square ('B' on the map, 2 by 2), solid, its front tiles kept clear (TOWN_KEEP).
// - Fed tallow and curios a level at a time (HEARTH_COST) up to HEARTH_MAX; saved as ll-town.hearth = {lv}.
// - Each level thins the rain in a widening circle (fewer, fainter drops), lifts the dark a little, and shows more of the carving.
// - It changes nothing on the stair: no run field, no ll-save-v2, ll-meta or ll-codex.
// - Developer mode shows, never writes (rule 24).
const {chromium}=require('playwright');
const fails=[]; const ok=(c,m,d)=>{if(!c)fails.push(m+(d!==undefined?' '+JSON.stringify(d).slice(0,600):''));};
(async()=>{
  const b=await chromium.launch(); const p=await b.newPage({viewport:{width:412,height:860}});
  await p.goto('file://'+process.argv[2]); await p.waitForTimeout(300);

  /* 1. the ground: solid, its front open and reachable and kept, nothing may be built before it */
  const g=await p.evaluate(()=>{const T=__t, H=T.HEARTH, out={};
    T.townReset(); T.setDev(false); T.townOpen();
    out.solid=[];
    for(let y=H.y;y<H.y+H.h;y++)for(let x=H.x;x<H.x+H.w;x++)out.solid.push(T.townSolid(x,y)&&T.TOWN_MAP[y][x]==='B');
    out.front=H.front.map(([x,y])=>({free:!T.townSolid(x,y),reach:!!T.townPathTo(x,y),kept:T.TOWN_KEEP.some(k=>k[0]===x&&k[1]===y)}));
    out.rows=T.TOWN_MAP.every(r=>r.length===24);
    out.lv=T.hearthLv(); out.saved=JSON.parse(localStorage.getItem('ll-town')||'{}').hearth;
    out.carve=T.HEARTH_CARVE.length>100&&T.HEARTH_CARVE.every(r=>r.length===T.HEARTH_CARVE[0].length);
    out.cost=T.HEARTH_COST.length===T.HEARTH_MAX&&T.HEARTH_COST.every(c=>Object.keys(c).every(k=>k==='tallow'||k==='curios'));
    return out;});
  console.log(JSON.stringify(g));
  ok(g.solid.length===4&&g.solid.every(Boolean),'the Hearth stands on four solid B tiles',g.solid);
  ok(g.front.every(f=>f.free&&f.reach&&f.kept),'the ground before it is open, reachable and kept clear',g.front);
  ok(g.rows,'every map row is still 24 long');
  ok(g.lv===0,'a new town’s Hearth is cold',g);
  ok(g.carve,'the carving is rows of one width');
  ok(g.cost,'each level costs tallow and curios only, one cost per level',g);

  /* 2. walking up to it and its card */
  const w=await p.evaluate(async()=>{const T=__t, H=T.HEARTH, W=T.TWN, out={};
    W.p.x=12.5; W.p.y=19.5; T.townTapTile(H.x,H.y);
    out.goal=W.goal; for(let i=0;i<400&&(W.path||W.goal);i++)T.townStep(1/30);
    out.open=!document.querySelector('#modal').hidden; out.title=document.querySelector('#mTitle').textContent;
    out.btn=[...document.querySelectorAll('#mActions button')].map(b=>b.textContent);
    T.closeModal(); T.townStep(1/30); out.near=W.near; out.label=document.querySelector('#townAct').textContent;
    return out;});
  console.log(JSON.stringify(w));
  ok(w.goal==='hearth'&&w.open&&/Hearth Beacon/.test(w.title),'a tap walks you to the Hearth and opens its card',w);
  ok(w.btn.some(t=>/Light the Hearth/.test(t)),'a cold Hearth offers to be lit',w.btn);
  ok(w.near==='hearth'&&/Hearth Beacon/.test(w.label),'standing before it, the button offers the Hearth',w);

  /* 3. feeding: the whole cost or nothing, a level at a time, saved, never past the top; nothing on the stair moves */
  const f=await p.evaluate(()=>{const T=__t, out={}, td=T.townData();
    const snap=k=>localStorage.getItem(k);
    out.before={save:snap('ll-save-v2'),meta:snap('ll-meta'),codex:snap('ll-codex'),run:JSON.stringify(T.run||null)};
    td.res={timber:0,iron:0,tallow:0,curios:0};
    out.poor=T.hearthFeed();
    td.res={timber:7,iron:7,tallow:1000,curios:100};
    out.lv=[]; out.res=[];
    for(let i=0;i<T.HEARTH_MAX;i++){out.lv.push(T.hearthFeed()&&T.hearthLv()); out.res.push(td.res.tallow);}
    out.over=T.hearthFeed(); out.top=T.hearthLv();
    out.saved=JSON.parse(localStorage.getItem('ll-town')||'{}').hearth;
    out.res5=Object.assign({},td.res);
    out.after={save:snap('ll-save-v2'),meta:snap('ll-meta'),codex:snap('ll-codex'),run:JSON.stringify(T.run||null)};
    return out;});
  console.log(JSON.stringify(f));
  ok(f.poor===false,'without the haul the Hearth is not fed');
  ok(JSON.stringify(f.lv)==='[1,2,3,4,5]','each feeding raises it a level',f.lv);
  ok(f.over===false&&f.top===5,'it never burns past its top level',f);
  ok(f.saved&&f.saved.lv===5,'its level is saved in ll-town.hearth',f.saved);
  const tall=1000-[15,30,45,65,90].reduce((a,b)=>a+b,0), cur=100-15;
  ok(f.res5.tallow===tall&&f.res5.curios===cur&&f.res5.timber===7&&f.res5.iron===7,'it takes tallow and curios, and only those',f.res5);
  ok(JSON.stringify(f.before)===JSON.stringify(f.after),'feeding it changes nothing on the stair (run, ll-save-v2, ll-meta, ll-codex)',{b:f.before,a:f.after});

  /* 4. what it does to the square: the rain thins and the carving shows, more at each level; the dark lifts */
  const v=await p.evaluate(()=>{const T=__t, W=T.TWN, H=T.HEARTH, out={drops:[],carve:[],r:[],lift:[],light:[]}, td=T.townData();
    for(let lv=0;lv<=T.HEARTH_MAX;lv++){
      td.hearth={lv}; T.townArt(); const A=T.TOWN_ART;
      W.p.x=H.sx; W.p.y=H.sy; W.cx=null; W.rain=null;
      let n=0; for(let i=0;i<240;i++){T.townFrame(1/30); n+=W.rainN;}
      out.drops.push(n);
      let px=0; if(A.carve){const c=A.carve.getContext('2d').getImageData(0,0,A.carve.width,A.carve.height).data; for(let i=3;i<c.length;i+=4)if(c[i])px++;}
      out.carve.push(px); out.r.push(A.hearth.r); out.lift.push(A.hearth.lift);
      out.light.push(A.lights.filter(L=>L.x>=H.x*16&&L.x<(H.x+H.w)*16&&L.y<(H.y+H.h)*16&&L.y>H.y*16-40).map(L=>L.r).sort((a,b)=>b-a)[0]||0);
    }
    return out;});
  console.log(JSON.stringify(v));
  for(let i=1;i<v.drops.length;i++){
    ok(v.drops[i]<v.drops[i-1],'fewer drops fall round it at level '+i+' than at '+(i-1),v.drops);
    ok(v.carve[i]>v.carve[i-1],'more of the carving shows at level '+i,v.carve);
    ok(v.r[i]>v.r[i-1]&&v.lift[i]>v.lift[i-1],'the circle widens and the dark lifts further at level '+i,{r:v.r,lift:v.lift});
    ok(v.light[i]>=v.light[i-1]&&v.light[i]>0,'it burns at level '+i,v.light);}
  ok(v.carve[0]===0&&v.light[0]===0,'cold, it shows no carving and throws no light',v);
  ok(v.drops[5]<v.drops[0]*.6,'at the top level well under two thirds of the drops fall by it',v.drops);

  /* 5. a laid path covers the carving where it lies */
  const pth=await p.evaluate(()=>{const T=__t, td=T.townData(), A=T.TOWN_ART, H=T.HEARTH;
    const cnt=()=>{const c=A.carve.getContext('2d').getImageData(0,0,A.carve.width,A.carve.height).data; let n=0; for(let i=3;i<c.length;i+=4)if(c[i])n++; return n;};
    const before=cnt(); td.res.timber=99; td.res.iron=99;
    const placed=T.townPlace('board',H.x-1,H.y-2); const after=cnt();
    return {before,placed,after};});
  console.log(JSON.stringify(pth));
  ok(pth.placed!==false&&pth.after<pth.before,'a path laid over the carving hides it there',pth);

  /* 6. shots at levels 0, 3 and 5 */
  for(const lv of [0,3,5]){
    await p.evaluate(lv=>{const T=__t, W=T.TWN, H=T.HEARTH; T.townData().hearth={lv}; T.townArt(); W.p.x=H.sx; W.p.y=H.sy+.5; W.cx=null; for(let i=0;i<30;i++)T.townFrame(1/30);},lv);
    await p.screenshot({path:'hearth-'+lv+'.png'});
  }

  /* 7. developer mode shows, never writes */
  const d=await p.evaluate(()=>{const T=__t;
    T.townClose(); const before=localStorage.getItem('ll-town'); T.setDev(true); T.townOpen(); const td=T.townData(); td.res={timber:0,iron:0,tallow:500,curios:50}; td.hearth={lv:0};
    const fed=T.hearthFeed(), lv=T.hearthLv(); const after=localStorage.getItem('ll-town'); T.townClose(); T.setDev(false);
    return {fed,lv,same:before===after};});
  console.log(JSON.stringify(d));
  ok(d.fed&&d.lv===1&&d.same,'developer mode feeds its own copy and writes nothing',d);

  /* 8. an old town without the field, and a broken one, read as cold or clamped */
  const o=await p.evaluate(()=>{const T=__t; return {none:T.hearthFix(undefined).lv,bad:T.hearthFix({lv:'x'}).lv,big:T.hearthFix({lv:99}).lv,neg:T.hearthFix({lv:-3}).lv};});
  ok(o.none===0&&o.bad===0&&o.big===5&&o.neg===0,'ll-town.hearth is read safely',o);

  await b.close();
  for(const m of fails)console.log('FAIL '+m);
  console.log(fails.length?fails.length+' failed':'hearth ok');
  process.exit(fails.length?1:0);
})();
