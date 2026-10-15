// A creature tip waits its turn: met while another tip is up, it shows next, even if that creature has died meanwhile.
// Creature tips come before other tips, since the creature won't wait.
const {chromium}=require('playwright');
const fails=[]; const ok=(c,m,d)=>{if(!c)fails.push(m+(d!==undefined?' '+JSON.stringify(d):''));};
(async()=>{
  const b=await chromium.launch(); const p=await b.newPage({viewport:{width:412,height:860}});
  await p.goto('file://'+process.argv[2]); await p.waitForTimeout(300);
  const r=await p.evaluate(()=>{const T=__t, out={};
    const next=()=>{while(T.COACH.on)document.querySelector('#coachActs [data-coach="next"]').click(); T.setP(false);};
    T.newRun('whaler',0); T.run.oil=T.run.oilMax=999; T.setP(false); T.F.born=-1e6;
    T.tutSet({walk:'done',seen:[],off:false});
    T.F.phase='wave'; T.F.wave=1; T.F.queue=[{t:1e9,type:'crawler',gate:0}];
    // another tip is up when a Watcher arrives, and the Watcher dies before it ends
    T.coachRun('tip','madness',[{title:'Madness',text:'x'}]);
    const w=T.spawnFoe('watcher',0,2); T.update(1/30); T.coachPoll();
    out.during=T.COACH.key; T.hurt(w,1e6); next(); T.coachPoll();
    out.after=T.COACH.key; next();
    // a creature tip and another tip are both due: the creature's goes first
    T.F.queue=[]; const g=T.spawnFoe('gnasher',0,2); g.stunT=99; T.update(1/30); T.coachPoll();
    out.first=T.COACH.key; next(); T.coachPoll(); out.second=T.COACH.key; next();
    T.tutSet({walk:'done',seen:[],off:true});
    return out;});
  console.log(JSON.stringify(r));
  ok(r.during==='madness','a tip on screen is never replaced',r.during);
  ok(r.after==='watcher','the Watcher tip shows next, though the Watcher is dead',r.after);
  ok(r.first==='gnasher'&&r.second==='deck','creature tips come before other tips',[r.first,r.second]);
  fails.forEach(f=>console.log('FAIL '+f)); await b.close(); process.exitCode=fails.length?1:0;
})();
