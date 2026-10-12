#!/usr/bin/env python3
"""Prototype: forked stairs. Builds expansion/proto/forks.html from the current index.html.

Never touches index.html. Every FIND must match exactly once (AGENTS.md rule 23), or the build stops.
Run from the repo root:  python3 expansion/proto/forks.py
"""
import pathlib, sys

ROOT = pathlib.Path(__file__).resolve().parents[2]
src = (ROOT / 'index.html').read_text(encoding='utf-8')
out = ROOT / 'expansion' / 'proto' / 'forks.html'

def sub(find, repl):
    global src
    n = src.count(find)
    if n != 1:
        sys.exit(f'FIND matched {n} times, expected 1:\n{find[:200]}')
    src = src.replace(find, repl)

# --- sandbox: own save space, and the title says which build this is ---
# (test.sh passes --bare: the suite runs in a fresh browser and checks the stock save keys and version line)
if '--bare' not in sys.argv:
    sub('<script>', "<script>window.LL_STORE_NS=window.LL_STORE_NS||'exp-forks:';</script>\n<script>")
    sub("const GAME_VERSION='15.1';", "const GAME_VERSION='15.1 · forks prototype';")

# --- data: forks on the Ossuary and the Drowned Nave (canonical portrait coordinates) ---
# A fork leaves a root path at `from`, runs through `via`, and rejoins it at `to`.
# Rule (BRAINSTORM.md §8, §10): the main route is unchanged and always the shorter one.
sub("""  {name:'The Ossuary',hue:36,mark:'bone',lamp:[6,7],stipend:110,
   paths:[[[11,0],[11,3],[1,3],[1,12],[10,12],[10,7],[6,7]]],""",
"""  {name:'The Ossuary',hue:36,mark:'bone',lamp:[6,7],stipend:110,
   paths:[[[11,0],[11,3],[1,3],[1,12],[10,12],[10,7],[6,7]]],
   /* the upper gallery: a long, dark loop far from the lamp */
   forks:[{gate:0,from:[8,3],via:[[8,1],[3,1]],to:[3,3]}],""")
sub("""   paths:[[[0,0],[9,0],[9,2],[3,2],[3,5],[6,5],[6,7]],[[11,13],[2,13],[2,11],[9,11],[9,7],[6,7]]],""",
"""   paths:[[[0,0],[9,0],[9,2],[3,2],[3,5],[6,5],[6,7]],[[11,13],[2,13],[2,11],[9,11],[9,7],[6,7]]],
   /* the flooded aisle: the lower vein can swing wide along the east wall */
   forks:[{gate:1,from:[9,11],via:[[11,11],[11,5],[8,5]],to:[8,7]}],""")

# --- the Weir: a gate built on a fork. Never offered as a gift; it shows in the tray on forked floors. ---
sub("""  lance:{n:'Whaling Gun',short:'Whaler',cost:90,aim:true,d:'A slow, enormous harpoon. Double damage to heavy creatures, elites and bosses.'}
};""",
"""  lance:{n:'Whaling Gun',short:'Whaler',cost:90,aim:true,d:'A slow, enormous harpoon. Double damage to heavy creatures, elites and bosses.'},
  weir:{n:'Weir',short:'Weir',cost:45,path:true,fork:true,d:'A rotten floodgate set where the stair forks. It shuts one way; flip it between waves. Watchers fly over it. A Behemoth breaks it.'}
};""")
sub("const w=pick(Object.keys(WARDS).filter(x=>!run.wards.includes(x))||[]);",
    "const w=pick(Object.keys(WARDS).filter(x=>!run.wards.includes(x)&&!WARDS[x].fork)||[]);")
sub("Object.keys(WARDS).forEach(w=>{if(!run.wards.includes(w))pool.push({kind:'ward',key:w});});",
    "Object.keys(WARDS).forEach(w=>{if(!run.wards.includes(w)&&!WARDS[w].fork)pool.push({kind:'ward',key:w});});")
sub("shuffle(Object.keys(WARDS).filter(w=>!run.wards.includes(w))).slice(0,2)",
    "shuffle(Object.keys(WARDS).filter(w=>!run.wards.includes(w)&&!WARDS[w].fork)).slice(0,2)")
sub("""  run.wards.forEach(w=>it.push({kind:'ward',type:w}));
  Object.keys(HORRORS)""",
"""  run.wards.forEach(w=>it.push({kind:'ward',type:w}));
  if(F&&F.forks&&F.forks.length&&!run.wards.includes('weir'))it.push({kind:'ward',type:'weir'});
  Object.keys(HORRORS)""")

# --- geometry: branches become extra paths that share their root's prefix ---
sub("""  const flipped=def.paths.map(pts=>pts.map(flipPt));
  F.paths=flipped.map(buildPath);
  F.pathTiles=new Set();""",
"""  const flipped=def.paths.map(pts=>pts.map(flipPt));
  F.paths=flipped.map(buildPath);
  F.nRoots=F.paths.length;
  F.forks=[];
  /* each branch is a whole path: the root up to the fork, the detour, then the root again.
     The prefix is identical, so a creature can switch e.gate at the fork and keep its e.d. */
  for(const fd of def.forks||[]){
    const root=flipped[fd.gate], from=flipPt(fd.from), to=flipPt(fd.to), via=fd.via.map(flipPt);
    const i=segIndex(root,from), j=segIndex(root,to);
    const pts=dedupe(root.slice(0,i+1).concat([from],via,[to],root.slice(j+1)));
    flipped.push(pts);
    const P=buildPath(pts), M=F.paths[fd.gate], d=distAlong(root,from);
    F.paths.push(P);
    const ends=[distAlong(root,to),distAlong(pts,to)], opts=[fd.gate,F.paths.length-1];
    const fk={c:from[0],r:from[1],x:from[0]+.5,y:from[1]+.5,d,opts,dirs:[],samples:[]};
    opts.forEach((pi,k)=>{
      const Q=F.paths[pi], a=posAt(Q,d+.6), s=[];
      fk.dirs.push([Math.sign(Math.round(a[0]-fk.x)),Math.sign(Math.round(a[1]-fk.y))]);
      for(let dd=d+.5;dd<ends[k]-.25;dd+=.5){const q=posAt(Q,dd); s.push(q[0],q[1]);}
      fk.samples.push(s);
    });
    F.forks.push(fk);
  }
  F.pathTiles=new Set();""")
sub("""/* ---------------- paths ---------------- */
function buildPath(pts){""",
"""/* ---------------- paths ---------------- */
function segIndex(pts,q){
  for(let i=0;i<pts.length-1;i++){const a=pts[i], b=pts[i+1];
    if(Math.min(a[0],b[0])<=q[0]&&q[0]<=Math.max(a[0],b[0])&&Math.min(a[1],b[1])<=q[1]&&q[1]<=Math.max(a[1],b[1]))return i;}
  throw new Error('fork point '+q+' is not on its path');
}
function distAlong(pts,q){
  let s=0;
  for(let i=0;i<pts.length-1;i++){const a=pts[i], b=pts[i+1];
    if(Math.min(a[0],b[0])<=q[0]&&q[0]<=Math.max(a[0],b[0])&&Math.min(a[1],b[1])<=q[1]&&q[1]<=Math.max(a[1],b[1]))return s+Math.abs(q[0]-a[0])+Math.abs(q[1]-a[1]);
    s+=Math.abs(b[0]-a[0])+Math.abs(b[1]-a[1]);}
  return s;
}
function dedupe(pts){return pts.filter((p,i)=>!i||p[0]!==pts[i-1][0]||p[1]!==pts[i-1][1]);}
/* how much of a branch your own light covers (the lamp's light never counts, so an untouched floor plays as before) */
function castLight(fk,k,lamp){
  const s=fk.samples[k]; let n=0;
  for(let i=0;i<s.length;i+=2){for(const L of F.L){if((lamp||!L.lamp)&&dst(s[i],s[i+1],L.x,L.y)<=L.r){n++; break;}}}
  return n;
}
function weirAt(fk){const t=towerAt(fk.c,fk.r); return t&&t.type==='weir'&&!t.dead&&!t.dark?t:null;}
/* which way a creature goes at a fork: the weir, then its instinct, then the dark. Ties take the main way (0). */
function forkPick(fk,e){
  const w=weirAt(fk);
  if(w&&!(e&&(e.def.fly||e.def.boss))){
    if(e&&e.def.heavy){removeTower(w); F.fx.push({k:'ring',x:w.x,y:w.y,r0:.1,r1:.9,t:0,dur:.5,col:'139,146,148'}); F.shake=Math.max(F.shake,.25); hint('A Behemoth smashes the weir.'); return 0;}
    return w.open||0;
  }
  if(e){
    if(e.def.boss||e.type==='gnasher')return 0;
    if(e.forkPref!=null)return e.forkPref%fk.opts.length;
  }
  if(F.flareT>0)return 0;
  /* Shades and Stalkers hunt your light; everything else shies from it */
  const toward=!!(e&&e.def.veiled);
  let best=0, bv=castLight(fk,0);
  for(let k=1;k<fk.opts.length;k++){const v=castLight(fk,k); if(toward?v>bv:v<bv){bv=v; best=k;}}
  return best;
}
function buildPath(pts){""")

# spawns and rifts use only the root paths
sub("spawnFoe(k,Math.floor(Math.random()*F.paths.length),0);", "spawnFoe(k,Math.floor(Math.random()*F.nRoots),0);")
sub("groups.push(['skitter',8,.35,2.5,Math.floor(Math.random()*F.paths.length)]);", "groups.push(['skitter',8,.35,2.5,Math.floor(Math.random()*F.nRoots)]);")
sub("gate:Math.min(g.gate,F.paths.length-1)});", "gate:Math.min(g.gate,F.nRoots-1)});")
sub("  for(const P of F.paths){const [x,y]=P.start; const pg=fg.createRadialGradient(",
    "  for(let pi=0;pi<F.nRoots;pi++){const P=F.paths[pi]; const [x,y]=P.start; const pg=fg.createRadialGradient(")
sub("""  /* the rifts */
  for(const P of F.paths){""",
"""  /* the forks: a chevron shows which way the crowd will go */
  for(const fk of F.forks){
    const k=forkPick(fk,null), dv=fk.dirs[k], cx=fk.x+dv[0]*.75, cy=fk.y+dv[1]*.75, a=Math.atan2(dv[1],dv[0]);
    g.save(); g.translate(cx,cy); g.rotate(a);
    g.lineCap='round'; g.lineJoin='round';
    for(const o of [0,.2]){
      g.strokeStyle='rgba(8,6,4,.7)'; g.lineWidth=.16; g.beginPath(); g.moveTo(o-.16,-.22); g.lineTo(o+.08,0); g.lineTo(o-.16,.22); g.stroke();
      g.strokeStyle='rgba(237,180,90,'+(.6+.3*Math.sin(tm*3-o*8))+')'; g.lineWidth=.08; g.beginPath(); g.moveTo(o-.16,-.22); g.lineTo(o+.08,0); g.lineTo(o-.16,.22); g.stroke();
    }
    g.restore();
  }
  /* the rifts */
  for(let pi=0;pi<F.nRoots;pi++){const P=F.paths[pi];""")

# movement: choose at the fork, before the position is read
sub("""    e.d+=sp*dt;
    const P=F.paths[e.gate], p=posAt(P,e.d);""",
"""    e.d+=sp*dt;
    for(let fi=0;fi<F.forks.length;fi++){
      const fk=F.forks[fi];
      if(e.d>=fk.d&&!((e.fk||0)&(1<<fi))&&fk.opts.includes(e.gate)){e.fk=(e.fk||0)|(1<<fi); e.gate=fk.opts[forkPick(fk,e)];}
    }
    const P=F.paths[e.gate], p=posAt(P,e.d);""")

# a Wretch that bursts before a fork sends its Skitterlings down different ways
sub("if(e.def.split)for(let i=0;i<e.def.split;i++)spawnFoe('skitter',e.gate,Math.max(0,e.d-.25-i*.3));",
    "if(e.def.split)for(let i=0;i<e.def.split;i++){const s=spawnFoe('skitter',e.gate,Math.max(0,e.d-.25-i*.3)); s.forkPref=i;}")

# placement, upkeep, the sheet and the art
sub("""  if(item.kind==='ward'&&WARDS[item.type].path){""",
"""  if(item.kind==='ward'&&item.type==='weir'&&!F.forks.some(f=>f.c===c&&f.r===r))return 'A weir only fits where the stair forks.';
  if(item.kind==='ward'&&WARDS[item.type].path){""")
sub("if(t.type==='candle'||t.type==='salt'||t.type==='tithe'||t.type==='effigy')continue;",
    "if(t.type==='candle'||t.type==='salt'||t.type==='tithe'||t.type==='effigy'||t.type==='weir')continue;")
sub("""    if(t.type==='salt')html+=B('Refill · '+refillCost(),()=>refillSalt(t),{cls:'call',disabled:t.dur>=t.max||run.ess<refillCost()});""",
"""    if(t.type==='salt')html+=B('Refill · '+refillCost(),()=>refillSalt(t),{cls:'call',disabled:t.dur>=t.max||run.ess<refillCost()});
    if(t.type==='weir')html+=B(F.phase==='wave'?'Locked until the wave ends':'Flip the weir',()=>{t.open=t.open?0:1; forceUI();},{cls:'call',disabled:F.phase==='wave'});""")
sub("  if(o.type==='coil')return 'Damage <b>'",
    "  if(o.type==='weir')return 'Open: <b>'+(o.open?'the long way':'the main stair')+'</b> · Watchers fly over · A Behemoth breaks it';\n  if(o.type==='coil')return 'Damage <b>'")
sub("""function drawWard(c,t,tm,icon){
  const x=t.x,y=t.y;""",
"""function drawWeir(c,t,icon){
  const x=t.x, y=t.y;
  let dx=1, dy=0;
  if(!icon){const fk=F.forks.find(f=>f.c===t.c&&f.r===t.r); if(fk){const dv=fk.dirs[t.open?0:1]; dx=dv[0]; dy=dv[1];}}
  /* planks across the mouth of the closed way */
  const cx=x+dx*(icon?0:.34), cy=y+dy*(icon?0:.34), px=-dy, py=dx, out=!icon&&t.dark;
  c.lineCap='round';
  c.strokeStyle='rgba(8,6,4,.75)'; c.lineWidth=.3;
  c.beginPath(); c.moveTo(cx-px*.44,cy-py*.44); c.lineTo(cx+px*.44,cy+py*.44); c.stroke();
  c.strokeStyle=out?'#4a4038':'#8a6440'; c.lineWidth=.22;
  c.beginPath(); c.moveTo(cx-px*.42,cy-py*.42); c.lineTo(cx+px*.42,cy+py*.42); c.stroke();
  c.strokeStyle=out?'#5a5048':'#b98a58'; c.lineWidth=.05;
  for(const o of [-.06,.06]){c.beginPath(); c.moveTo(cx-px*.4+dx*o,cy-py*.4+dy*o); c.lineTo(cx+px*.4+dx*o,cy+py*.4+dy*o); c.stroke();}
  c.fillStyle='#1d1612';
  for(const s of [-1,1]){c.beginPath(); c.arc(cx+px*.46*s,cy+py*.46*s,.09,0,TAU2); c.fill();}
}
function drawWard(c,t,tm,icon){
  const x=t.x,y=t.y;
  if(t.type==='weir'){drawWeir(c,t,icon); return;}""")

# first sight of a fork
sub("""    if(run.floor===0&&!snap)setTimeout(()=>hint('Pick a ward below, then tap a lit tile. Tap the lamp or any ward to upgrade it.',5200),2500);""",
"""    if(run.floor===0&&!snap)setTimeout(()=>hint('Pick a ward below, then tap a lit tile. Tap the lamp or any ward to upgrade it.',5200),2500);
    if(F.forks.length&&!(snap&&F.wave))setTimeout(()=>{if(F&&F.forks.length)hint('The stair forks here. They take the darker way, and only your own light counts. The chevron shows where they will go.',6000);},F.omen?6800:2600);""")

out.write_text(src, encoding='utf-8')
print('wrote', out.relative_to(ROOT))
