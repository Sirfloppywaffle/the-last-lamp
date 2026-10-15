// Wave decks (#27): each floor draws its waves; boss and Choirmaster waves keep their slot; the draw is saved,
// an old save without one plays the classic waves; the strip names the next wave; a tip teaches it.
const {chromium}=require('playwright');
const fails=[]; const ok=(cond,msg,detail)=>{if(!cond)fails.push(msg+(detail!==undefined?' '+JSON.stringify(detail):''));};
(async()=>{
  const b=await chromium.launch(); const p=await b.newPage({viewport:{width:412,height:860}});
  await p.goto('file://'+process.argv[2]); await p.waitForTimeout(300);
  const r=await p.evaluate(()=>{
    const T=__t, out={};
    const FL=T.FLOORS, DK=T.DECKS;
    // the data: every card fits its floor's gates and creatures, and alternatives weigh about what the classic wave does
    const hp={crawler:26,skitter:12,gnasher:72,watcher:42,shade:30,wretch:34+24,shrieker:52,stalker:32,behemoth:420,elite:380,boss:2600,boss2:4200};
    const weight=w=>w.reduce((a,g)=>a+(hp[g[0]]||0)*g[1],0);
    out.data=[];
    FL.forEach((f,fi)=>{
      const types=new Set(); f.waves.forEach(w=>w.forEach(g=>types.add(g[0])));
      const gates=f.paths.length;
      (DK[fi]||[]).forEach(c=>c.at.forEach(i=>{
        const bad=c.w.filter(g=>!hp[g[0]]||(g[4]||0)>=gates).map(g=>g[0]);
        const ratio=weight(c.w)/weight(f.waves[i]);
        if(bad.length||ratio<.75||ratio>1.25||!f.waves[i])out.data.push({floor:fi,card:c.n,slot:i,bad,ratio:+ratio.toFixed(2)});
      }));
    });
    // fixed slots never change, and over many draws every slot that has alternatives varies
    out.fixed=[]; out.varies=[];
    FL.forEach((f,fi)=>{
      const seen=f.waves.map(()=>new Set());
      for(let k=0;k<200;k++)T.drawWaves(fi).forEach((c,i)=>seen[i].add(String(c)));
      f.waves.forEach((w,i)=>{const fixed=w.some(g=>['boss','boss2','elite'].includes(g[0])), alts=(DK[fi]||[]).some(c=>c.at.includes(i));
        if(fixed&&(seen[i].size!==1||!seen[i].has('c')))out.fixed.push([fi,i]);
        if(!fixed&&alts&&seen[i].size<2)out.varies.push([fi,i]);});
    });
    // floor 5 always brings a Behemoth (the Whaler's deed needs one)
    out.behemoth=true; for(let k=0;k<100;k++){const d=T.drawnWaves(4,T.drawWaves(4)); if(!d.some(x=>x.w.some(g=>g[0]==='behemoth')))out.behemoth=false;}
    // a floor plays its draw, and a resumed run keeps it
    T.newRun('lamplighter',0); T.run.floor=1; T.run.draw=null; T.beginFloor(null);
    out.played=JSON.stringify(T.F.def.waves)===JSON.stringify(T.drawnWaves(1,T.run.draw.cards).map(d=>d.w));
    T.run.draw.cards=[0,1,0,0,0]; T.beginFloor({wave:2,towers:[],lamp:null,draft:null});
    out.resume=JSON.stringify(T.run.draw.cards)==='[0,1,0,0,0]'&&T.F.def.waves[1]===T.DECKS[1][1].w;
    // an old save (no draw) resumes on the classic waves
    T.run.draw=undefined; T.beginFloor({wave:1,towers:[],lamp:null,draft:null});
    out.legacy=T.F.def.waves.every((w,i)=>w===T.FLOORS[1].waves[i])&&T.run.draw.cards.every(c=>c==='c');
    // the strip names the next wave
    T.run.draw=null; T.beginFloor(null); T.setP(false); T.forceUI(); T.renderPreview();
    out.strip=document.querySelector('#preview .pv-n')?document.querySelector('#preview .pv-n').textContent:'';
    out.stripWant=T.F.def.wnames[0];
    // the tip: at the first break (or once a wave has finished arriving)
    T.tutSet({walk:'done',seen:[],off:false}); T.F.born=-1e6;
    T.F.wave=1; T.F.phase='wave'; T.F.queue=[]; T.coachPoll(); out.tip=T.COACH.on?T.COACH.key:'';
    T.tutSet({walk:'done',seen:[],off:true});
    return out;
  });
  console.log(JSON.stringify(r));
  ok(!r.data.length,'every card fits its floor and weighs within 25% of the classic wave',r.data);
  ok(!r.fixed.length,'boss and Choirmaster waves keep their slot',r.fixed);
  ok(!r.varies.length,'every slot with alternatives varies across draws',r.varies);
  ok(r.behemoth,'floor 5 always brings a Behemoth');
  ok(r.played,'the floor plays the waves it drew');
  ok(r.resume,'a resumed run keeps its draw');
  ok(r.legacy,'an old save without a draw plays the classic waves');
  ok(r.strip&&r.strip===r.stripWant,'the strip names the next wave',[r.strip,r.stripWant]);
  ok(r.tip==='deck','a tip teaches the decks once a wave has finished arriving',r.tip);
  fails.forEach(f=>console.log('FAIL '+f));
  await b.close(); process.exitCode=fails.length?1:0;
})();
