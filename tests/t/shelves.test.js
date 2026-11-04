// Saltmouth, wider (map expansion, M1: expansion/MAP_EXPANSION.md): two shelves on the cliff.
// - The map is 36 by 36: the Rise (rows 1 to 12), the cliff face (13, 14) with two stairs two tiles wide, the Square (15 to 29),
//   the shore's shingle (30 to 32), the sea. Plots (TOWN_PLOTS) are drawn shut: solid, and nothing is built on them.
// - Every kept place is reachable from where you climb out, the Rise only up a stair; nothing may stand on a stair's foot or head.
// - The buildings stand on their own tiles; the Belfry stays outside the black wood.
// - An old town moves once (ll-town v 1 to 2): pieces in the old square go down with it, the old cemetery's yard goes up with it,
//   a piece that now meets a building or a stair, or stood anywhere else, goes into Storage whole (nothing is paid back), where you
//   stood moves, a card says so once, and the move is saved at once and never made again. Developer mode moves only its copy.
// - The tests' helper: __t.at(x, y) is a tile of the old square on today's map.
const {chromium}=require('playwright');
const fails=[]; const ok=(c,m,d)=>{if(!c)fails.push(m+(d!==undefined?' '+JSON.stringify(d).slice(0,700):''));};
(async()=>{
  const b=await chromium.launch(); const p=await b.newPage({viewport:{width:412,height:860}});
  const errs=[]; p.on('pageerror',e=>errs.push(String(e)));
  await p.goto('file://'+process.argv[2]); await p.waitForTimeout(300);

  /* 1. the map */
  const m=await p.evaluate(()=>{const T=__t, M=T.TOWN_MAP, o={};
    o.size=[M.length,M.every(r=>r.length===36)];
    o.cliff=[13,14].every(y=>[...M[y]].every(c=>c==='^'||c==='/'));
    o.stairs=T.TOWN_STAIRS.slice(); o.stairTiles=T.TOWN_STAIRS.every(x=>[13,14].every(y=>M[y][x]==='/'&&M[y][x+1]==='/'));
    o.walkStair=T.TOWN_STAIRS.every(x=>!T.townSolid(x,13)&&!T.townSolid(x+1,14));
    o.cliffSolid=[13,14].every(y=>[...M[y]].every((c,x)=>c==='/'||T.townSolid(x,y)));
    o.shore=[30,31,32].every(y=>[...M[y]].filter(c=>c===':').length>20); o.sea=M[35].split('').every(c=>c==='~');
    o.plots=Object.entries(T.TOWN_PLOTS).map(([k,P])=>[k,P.rects.every(([x,y,w,h])=>{for(let j=y;j<y+h;j++)for(let i=x;i<x+w;i++){const c=M[j][i]; if(c!=='x'&&c!=='T')return false; if(!T.townSolid(i,j)||T.townBuildable(i,j,true))return false;} return true;})]);
    const wood=T.TOWN_PLOTS.wood.rects, bel=T.TOWN_WORKSHOPS.belfry, inWood=(x,y)=>wood.some(([a,b2,w,h])=>x>=a&&y>=b2&&x<a+w&&y<b2+h);
    o.belfry=!inWood(bel.dx,bel.dy)&&[...Array(bel.w)].every((_,i)=>[...Array(bel.h)].every((_,j)=>M[bel.y+j][bel.x+i]==='#'&&!inWood(bel.x+i,bel.y+j)));
    o.houses=T.TOWN_HOUSES.every(h=>{for(let j=h.y;j<h.y+h.h;j++)for(let i=h.x;i<h.x+h.w;i++)if(M[j][i]!=='#')return false; return true;});
    o.lodgeRise=T.TOWN_HOUSES[0].y+T.TOWN_HOUSES[0].h<=12&&T.LODGE_OUT.y<13;
    o.helper=JSON.stringify(T.at(12,14))===JSON.stringify([T.TOWN_SPAWN.x,T.TOWN_SPAWN.y]);
    return o;});
  ok(m.size[0]===36&&m.size[1],'the map is 36 by 36',m.size);
  ok(m.cliff&&m.cliffSolid,'rows 13 and 14 are the cliff, solid but for the stairs',m);
  ok(m.stairs.length===2&&m.stairTiles&&m.walkStair,'two stairs up the cliff, two tiles wide, walkable',m);
  ok(m.shore&&m.sea,'a shore of shingle along the south, then the sea',m);
  ok(m.plots.length===4&&m.plots.every(([k,v])=>v),'every plot is shut: solid, and nothing is built on it',m.plots);
  ok(m.belfry&&m.houses&&m.lodgeRise,'every building stands on its tiles; the Lodge is on the Rise; the Belfry stays outside the black wood',m);
  ok(m.helper,'__t.at(12, 14), the old spawn, is today\'s spawn',m);

  /* 2. reaching: every kept place from where you climb out, the Rise only by a stair; the stairs' ends are kept */
  const r=await p.evaluate(()=>{const T=__t, W=T.TWN, o={};
    localStorage.removeItem('ll-town'); T.townReset(); T.setDev(false); T.townOpen();
    o.keepOK=T.townKeepOK([]); o.reach=T.townReaches(Math.floor(T.TOWN_SPAWN.x),Math.floor(T.TOWN_SPAWN.y));
    W.p.x=T.TOWN_SPAWN.x; W.p.y=T.TOWN_SPAWN.y; const L=T.LODGE_OUT, path=T.townPathTo(Math.floor(L.x),Math.floor(L.y));
    o.path=!!path; o.viaStair=!!path&&path.some(q=>T.TOWN_MAP[Math.floor(q.y)][Math.floor(q.x)]==='/');
    W.path=path; W.goal=null; let bad=0; for(let i=0;i<600&&W.path;i++){T.townStep(1/30); if(!T.townFree(W.p.x,W.p.y))bad++;}
    o.arrived=Math.hypot(W.p.x-L.x,W.p.y-L.y)<.6; o.bad=bad;
    const D=T.townData(); D.res={timber:99,iron:99,tallow:99,curios:9};
    o.foot=T.TOWN_STAIRS.map(x=>[T.townCanPlace('fence',x,15),T.townCanPlace('fence',x+1,12)]);
    o.kept=T.TOWN_STAIRS.every(x=>T.townKept(x,12)&&T.townKept(x+1,12)&&T.townKept(x,15)&&T.townKept(x+1,15));
    T.townClose(); return o;});
  ok(r.keepOK&&r.reach,'every kept place can be walked to from where you climb out',r);
  ok(r.path&&r.viaStair&&r.arrived&&r.bad===0,'the walk to the Lodge goes up a stair and arrives, never through anything solid',r);
  ok(r.kept&&r.foot.every(f=>f.every(s=>/Keep|clear/i.test(s))),'nothing may stand at a stair\'s foot or head',r.foot);

  /* 3. an old town moves once */
  const v1={v:1,px:12,py:14,visits:4,res:{timber:3,iron:4,tallow:5,curios:0},
    graves:[{n:1,kit:'lamplighter',floor:2,wave:3}],graveN:1,
    decos:[{id:'lamp',c:3,r:15},{id:'lamp',c:5,r:15,x:80,y:242},{id:'cobble',c:4,r:14},{id:'stone',c:15,r:3,g:1},
      {id:'lamp',c:20,r:2},{id:'lamp',c:2,r:12},{id:'lamp',c:2,r:6}],
    store:[{s:'town',id:'fence',cost:{timber:2}}]};
  const mv=await p.evaluate(v1=>{const T=__t, o={};
    T.setDev(false); localStorage.setItem('ll-town',JSON.stringify(v1)); T.townReset();
    const D=T.townData(), saved=JSON.parse(localStorage.getItem('ll-town'));
    o.v=D.v; o.savedV=saved.v; o.px=[D.px,D.py]; o.savedGrew=Array.isArray(saved.grew)&&saved.grew.length;
    /* the card waits through a reload until it is read */
    T.townReset(); o.kept=JSON.stringify(T.TOWN_GREW)===JSON.stringify(saved.grew);
    o.decos=D.decos.map(d=>[d.id,d.c,d.r,d.x,d.y]);
    o.store=D.store.map(e=>[e.id,e.cost.iron||0,e.cost.tallow||0]); o.res=D.res;
    o.grew=T.TOWN_GREW&&T.TOWN_GREW.slice();
    T.tutSet({walk:'done',seen:[],off:true}); T.townOpen();
    o.card=!document.getElementById('townCardWrap').hidden&&document.querySelector('#townCard b').textContent;
    o.cardText=document.getElementById('townCard').textContent;
    document.getElementById('townCard').click(); o.gone=document.getElementById('townCardWrap').hidden&&!T.TOWN_GREW&&JSON.parse(localStorage.getItem('ll-town')).grew===null;
    T.townClose();
    /* once only: a reload reads v 2 and moves nothing */
    const s1=localStorage.getItem('ll-town'); T.townReset(); const D2=T.townData();
    o.again=JSON.stringify(D2.decos)===JSON.stringify(D.decos)&&!T.TOWN_GREW&&localStorage.getItem('ll-town')===s1;
    return o;},v1);
  const at=(id,c,r)=>mv.decos.some(d=>d[0]===id&&d[1]===c&&d[2]===r);
  ok(mv.v===2&&mv.savedV===2,'the town is v 2, and the move is saved at once',mv);
  ok(at('lamp',9,24)&&at('cobble',10,23),'pieces in the old square go down with it, by one offset',mv.decos);
  ok(mv.decos.some(d=>d[0]==='lamp'&&d[1]===11&&d[2]===24&&d[3]===176&&d[4]===386),'a piece placed freely keeps its pixel, moved by the same offset',mv.decos);
  ok(at('stone',10,3),'a headstone in the old cemetery goes up with its yard',mv.decos);
  ok(mv.store.length===4&&mv.store.filter(e=>e[0]==='lamp'&&e[1]===6&&e[2]===4).length===3,'three lamps (off the square, under the Smithy, at a stair\'s foot) wait in Storage whole',mv.store);
  ok(mv.res.iron===4&&mv.res.tallow===5,'nothing is paid back for what went into Storage',mv.res);
  ok(mv.px[0]===18&&mv.px[1]===23,'where you stood moves with the square',mv.px);
  ok(mv.grew&&mv.grew.length===3&&mv.card==='The town grew'&&/Storage/.test(mv.cardText)&&/Street-Lamp/.test(mv.cardText),'a card says the town grew and names what waits in Storage',mv);
  ok(mv.savedGrew===3&&mv.kept,'the names wait in the save, through a reload, until the card is read',mv);
  ok(mv.gone&&mv.again,'the card goes on click; a reload moves nothing again',mv);

  /* where you stood in the old cemetery yard goes up with it */
  const yard=await p.evaluate(()=>{const T=__t; localStorage.setItem('ll-town',JSON.stringify({v:1,px:14.5,py:3.5,visits:1}));
    T.townReset(); const D=T.townData(); return [D.px,D.py];});
  ok(yard[0]===9.5&&yard[1]===3.5,'where you stood in the old cemetery yard moves with the yard',yard);

  /* 4. developer mode moves only its own copy (rule 24) */
  const dev=await p.evaluate(v1=>{const T=__t; localStorage.setItem('ll-town',JSON.stringify(v1)); T.townReset();
    T.setDev(true); const D=T.townData(); const o={v:D.v,n:D.decos.length,raw:JSON.parse(localStorage.getItem('ll-town')).v,grew:T.TOWN_GREW};
    T.townOpen(); T.townClose(); o.after=JSON.parse(localStorage.getItem('ll-town')).v;
    T.setDev(false); T.townReset(); localStorage.removeItem('ll-town'); T.townReset(); return o;},v1);
  ok(dev.v===2&&dev.raw===1&&dev.after===1&&!dev.grew,'developer mode moves only its copy and never writes ll-town',dev);

  /* 5. the stairs' art and the teaching */
  const art=await p.evaluate(()=>{const T=__t, R=T.TOWN_STAIR_ROWS, o={};
    o.rows=R.length===32&&R.every(r=>r.length===32&&[...r].every(c=>c==='.'||T.PX[c]));
    const A=T.townArt(), g=A.ground.getContext('2d'), x=T.TOWN_STAIRS[0]*16, y=13*16, d=g.getImageData(x+16,y+16,1,1).data, want=T.PX[R[16][16]];
    o.drawn='#'+[d[0],d[1],d[2]].map(v=>v.toString(16).padStart(2,'0')).join('')===want;
    o.tip=/stair/.test(T.TIPS.town.text); o.rules=/two shelves/.test(document.getElementById('rulesList').textContent);
    return o;});
  ok(art.rows&&art.drawn,'each stair is PixelLab rows of 32 by 32 on PX letters, laid into the ground',art);
  ok(art.tip&&art.rules,'the first-visit tip and the rules line teach the Rise and its stairs',art);

  ok(!errs.length,'no page errors',errs);
  for(const f of fails)console.log('FAIL '+f);
  console.log(fails.length?fails.length+' failed':'shelves ok');
  await b.close(); process.exit(fails.length?1:0);
})();
