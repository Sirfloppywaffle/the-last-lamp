// The sound pass: the Bell Wire has its own sound again, every effect plays without an error, a sound never moves a stair's
// seeded stream (rule 11b), and the score follows where you stand: title, Saltmouth (hushed indoors), the stair in three layers.
const {chromium}=require('playwright');
const fails=[]; const ok=(c,m,d)=>{if(!c)fails.push(m+(d!==undefined?' '+JSON.stringify(d):''));};
(async()=>{
  const b=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']}); const p=await b.newPage({viewport:{width:412,height:860}});
  await p.goto('file://'+process.argv[2]); await p.waitForTimeout(300);
  const r=await p.evaluate(async()=>{const T=__t, A=T.AUDIO, B=T.BGM, out={};
    A.init(); out.ctx=!!A.ctx; out.state=A.ctx&&A.ctx.state;
    out.wireIsBells=!/crackle/.test(String(A.wire))&&/crackle/.test(String(A.spark)); out.click=typeof A.click==='function';
    /* every effect, once: none throws */
    out.threw=[]; for(const k of Object.keys(A)){if(typeof A[k]!=='function'||['init','updateVols','ok','gate','synth','noise','when','can','route','tone','hiss','swell','ring','bronze','crackle','hum'].includes(k))continue; try{A.last={}; A[k]();}catch(e){out.threw.push(k+': '+e.message);}}
    A.hum(.05); A.hum(0);
    /* what should play, by where you stand */
    const w=()=>{const o=T.bgmWant(); return {name:o.name,danger:o.danger,mad:o.mad,indoor:o.indoor,heart:o.heart,floor:o.floor};};
    out.title=w();
    T.setDev(true); T.townReset(); T.townOpen(); out.town=w(); T.TWN.inside=true; out.indoor=w(); T.TWN.inside=false; T.townClose(); T.setDev(false); T.townReset();
    T.newRun('lamplighter',0,{seed:3}); T.run.floor=2; T.beginFloor(null); T.setP(false); out.build=w();
    T.F.phase='wave'; T.F.queue=[{t:1e9,type:'crawler',gate:0}]; out.wave=w();
    T.run.oil=2; out.low=w(); T.run.oil=T.run.oilMax;
    const boss=T.spawnFoe('boss',0,1); out.boss=w(); boss.hp=0; out.bossDead=w();
    T.F.phase='over'; out.over=w(); T.F.phase='wave';
    /* a sound inside a seeded roll leaves the roll as it was */
    T.newRun('lamplighter',0,{seed:77}); T.run.floor=2;
    const plain=JSON.stringify(T.seeded(T.SALT.descent,3,T.bindLayout));
    const loud=JSON.stringify(T.seeded(T.SALT.descent,3,()=>{A.last={}; A.kill(); A.place(); A.bolt(); A.coin(); return T.bindLayout();}));
    out.pure=plain===loud;
    /* the timer's tick picks the scene, and changes it when the floor does */
    T.run.floor=0; T.beginFloor(null); T.setP(false);
    B.tick(); out.key0=B.key; out.sceneOk=!!B.cur||out.state!=='running';
    T.run.floor=3; B.tick(); out.key3=B.key;
    T.F.phase='wave'; T.F.queue=[{t:1e9,type:'crawler',gate:0}]; T.spawnFoe('boss',0,1); for(let i=0;i<6;i++){B.tick(); await new Promise(r=>setTimeout(r,60));} out.danger=B.danger;
    return out;});
  console.log(JSON.stringify(r));
  ok(r.ctx,'the audio engine starts');
  ok(r.wireIsBells,'the Bell Wire rings little bells, and the grid has its own spark()');
  ok(r.click,'the Roster\'s click exists');
  ok(r.threw.length===0,'every effect plays without throwing',r.threw);
  ok(r.title.name==='title','the title plays the title\'s score',r.title);
  ok(r.town.name==='town'&&!r.town.indoor&&r.indoor.indoor,'Saltmouth plays its own score, and knows when you are indoors',[r.town,r.indoor]);
  ok(r.build.name==='desc'&&r.build.danger===0&&r.build.floor===2,'building on a floor: the stair\'s score, at rest',r.build);
  ok(r.wave.danger===1&&!r.wave.heart,'a wave adds the pulse',r.wave);
  ok(r.low.heart,'two oil left in a wave: the heartbeat',r.low);
  ok(r.boss.danger===2&&r.bossDead.danger===1,'a living boss brings the third layer, and its death takes it away',[r.boss,r.bossDead]);
  ok(r.over.name==='','a finished run leaves the room to its ending',r.over);
  ok(r.pure,'a sound inside a seeded roll does not move the roll');
  if(r.state==='running'){ok(r.key0==='desc0'&&r.key3==='desc3'&&r.sceneOk,'the timer picks the stair\'s scene and changes it with the floor',[r.key0,r.key3]); ok(r.danger===2,'the scene hears the boss',r.danger);}
  else console.log('note: the audio context is '+r.state+' here, so the scene checks were skipped');
  for(const f of fails)console.log('FAIL '+f);
  if(fails.length)process.exitCode=1; else console.log('sound: all ok');
  await b.close();
})();
