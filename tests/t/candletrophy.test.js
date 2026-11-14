// The Stub That Held (Criss, 13 Nov 2026): a trophy for a wave cleared with nothing but candles. From the wave's call to its break
// nothing stands but candles (no other ward, no horror), no rite is cast, nothing reaches the lamp, and at least one candle stands.
// It is earned into run.trophies and carried up with the haul like the boss trophies; never on a replayed stair; its Lodge card and
// its lock say the deed (it has no creature); developer mode writes nothing.
const {chromium}=require('playwright');
const fails=[]; const ok=(c,m,d)=>{if(!c)fails.push(m+(d!==undefined?' '+JSON.stringify(d).slice(0,500):''));};
(async()=>{
  const b=await chromium.launch(); const p=await b.newPage({viewport:{width:412,height:860}});
  const errs=[]; p.on('pageerror',e=>errs.push(String(e)));
  await p.goto('file://'+process.argv[2]); await p.waitForTimeout(400);
  const r=await p.evaluate(()=>{const T=__t, o={};
    localStorage.removeItem('ll-town'); T.townReset(); T.setDev(false);
    /* one wave on the Cistern: lay what the case asks for, call the wave, act during it, and clear it */
    const wave=(build,during,opt)=>{T.newRun('lamplighter',0,Object.assign({seed:9},opt||{})); T.run.floor=0; T.beginFloor(null); T.setP(false); T.run.ess=9999;
      const F=T.F; F.phase='build';
      const place=type=>{const it={kind:'ward',type}; for(let rr=0;rr<T.ROWS;rr++)for(let c=0;c<T.COLS;c++){const d=Math.hypot(c+.5-F.lx,rr+.5-F.ly); if(d>1.2&&d<3&&!T.placeProblem(it,c,rr)){T.setSel(it); T.tryPlace(c,rr); T.setSel(null); return true;}} return false;};
      for(const w of build)place(w);
      T.callWave(); F.queue=[{t:1e9,type:'crawler',gate:0}];
      for(let i=0;i<5;i++){T.update(1/30); if(i===2&&during)during(F,place);}
      F.foes.length=0; F.queue.length=0; T.waveCleared();
      return (T.run.trophies||[]).includes('stub');};
    o.candles=wave(['candle','candle']);
    {const b=document.getElementById('trophyBanner'); o.banner=[b.classList.contains('is-show'),getComputedStyle(b).pointerEvents,document.getElementById('trophyBannerS').textContent,document.getElementById('trophyBannerArt').width];}
    o.trophyRun=(T.run.trophies||[]).join();
    o.none=wave([]);
    o.harpoon=wave(['candle','harpoon']);
    o.builtMid=wave(['candle'],(F,place)=>place('harpoon'));
    o.rite=wave(['candle'],()=>T.castRiteNow('flare'));
    o.hit=wave(['candle'],F=>T.lampHit({def:{oil:1,r:.3},type:'crawler'}));
    o.replay=wave(['candle','candle'],null,{replay:true});
    /* earned on a real stair, it comes up with the haul once */
    wave(['candle']); T.haulCredit(T.run); o.town=(T.townData().trophies||[]).join(); o.saved=(JSON.parse(localStorage.getItem('ll-town')||'{}').trophies||[]).join();
    /* its lock and its card say the deed, not a creature */
    localStorage.removeItem('ll-town'); T.townReset(); o.lock=T.lodgeLockWhy('stub');
    T.lodgeTrophyCard({id:'stub'}); o.card=document.getElementById('mBody')?document.getElementById('mBody').textContent:''; T.closeModal();
    /* developer mode: earned on the descent, but the town is never written */
    localStorage.removeItem('ll-town'); T.townReset(); T.setDev(true); wave(['candle']); T.haulCredit(T.run); o.dev=localStorage.getItem('ll-town'); T.setDev(false);
    return o;});
  ok(r.candles&&r.trophyRun==='stub','a wave cleared with two candles and nothing else earns the Stub That Held',r);
  ok(r.banner[0]&&r.banner[1]==='none'&&r.banner[2]==='The Stub That Held'&&r.banner[3]===16,'its banner shows its art and its name, and takes no taps',r.banner);
  ok(!r.none,'no candle standing: no trophy',r.none);
  ok(!r.harpoon&&!r.builtMid,'another ward standing, or built during the wave: no trophy',r);
  ok(!r.rite,'a rite cast in the wave: no trophy',r.rite);
  ok(!r.hit,'something reaching the lamp: no trophy',r.hit);
  ok(!r.replay,'a replayed stair earns none',r.replay);
  ok(r.town==='stub'&&r.saved==='stub','it comes up with the haul into the town',r);
  ok(/Clear a wave with nothing but candles/.test(r.lock||'')&&/Earned: Clear a wave/.test(r.card)&&/pewter dish/.test(r.card),'its lock and its card say the deed',r);
  ok(r.dev===null,'developer mode writes no town',r.dev);
  await p.waitForTimeout(5300);
  ok(!(await p.evaluate(()=>document.getElementById('trophyBanner').classList.contains('is-show'))),'the banner is gone after five seconds');
  ok(!errs.length,'no page errors',errs);
  for(const f of fails)console.log('FAIL '+f);
  if(fails.length)process.exitCode=1; else console.log('candletrophy: all ok');
  await b.close();
})();
