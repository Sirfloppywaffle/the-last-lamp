// The Occultist (#26, the third kit): Corpse Candles, the Bone Spear, madness that feeds, and Unbind.
const {chromium}=require('playwright');
const fails=[]; const ok=(c,m,d)=>{if(!c)fails.push(m+(d!==undefined?' '+JSON.stringify(d):''));};
(async()=>{
  const b=await chromium.launch(); const p=await b.newPage({viewport:{width:412,height:860}});
  const errs=[]; p.on('pageerror',e=>errs.push(String(e)));
  await p.goto('file://'+process.argv[2]); await p.waitForTimeout(300);
  const r=await p.evaluate(()=>{const T=__t, out={}; window.devNoDark=false;
    const fresh=()=>{T.newRun('occultist',0); T.setP(false); T.run.ess=2000;};
    const field=(type,i)=>{const t={kind:'horror',type,id:9100+i,c:0,r:i,x:.5,y:i+.5,br:{},cd:9,ang:0,tgt:'first',invested:0,fresh:0}; T.F.towers.push(t); return t;};
    fresh();
    out.names=[T.wdef('candle').n,T.wdef('harpoon').n]; out.cost=T.wardCost('candle'); out.rites=T.run.rites.slice(); out.mad=T.horrorMad('gnasher');
    out.trees=[T.treeOf('candle').length,T.treeOf('harpoon').map(x=>x.n).join()];
    /* no bodies yet: nowhere to stand */
    let any=false; for(let r=0;r<T.ROWS;r++)for(let c=0;c<T.COLS;c++)if(T.placeProblem({kind:'ward',type:'candle'},c,r)==='')any=true;
    out.noneAtStart=!any;
    /* a death far down the path leaves a body; a Corpse Candle can stand beside it in the dark, free */
    const P=T.F.paths[0], e=T.spawnFoe('crawler',0,3); T.update(.001); T.hurt(e,999);
    out.bodies=T.F.bodies.size;
    const spots=[]; for(let r=0;r<T.ROWS;r++)for(let c=0;c<T.COLS;c++)if(T.placeProblem({kind:'ward',type:'candle'},c,r)==='')spots.push([c,r,T.buildLit(c,r)]);
    out.spots=spots.length; const dark=spots.find(s=>!s[2])||spots[0]; out.inDark=!dark[2];
    const ess=T.run.ess; T.setSel({kind:'ward',type:'candle'}); T.tryPlace(dark[0],dark[1]); T.setSel(null);
    const cand=T.F.towers[T.F.towers.length-1]; T.update(.001);
    out.placed={corpse:!!cand.corpse, lit:!cand.dark, free:T.run.ess===ess, bodiesLeft:T.run.corpses.list.length};
    out.buildsNow=T.buildLit(dark[0],dark[1]);
    /* dismantled, it hands its body back */
    T.sellTower(cand,true); out.back=T.run.corpses.list.length;
    T.setSel({kind:'ward',type:'candle'}); T.tryPlace(dark[0],dark[1]); T.setSel(null);
    /* the wave breaks: the Corpse Candles go out */
    T.F.wave=1; T.F.phase='wave'; T.F.queue=[]; T.update(.01);
    out.afterWave={phase:T.F.phase, candles:T.F.towers.filter(t=>t.corpse).length};
    /* bodies survive a resume and a turned board */
    T.addCorpse({gate:0,d:6,def:{}}); const n=T.run.corpses.list.length; T.checkpoint();
    T.resumeFrom({run:JSON.parse(JSON.stringify(T.run)),wave:T.F.wave,towers:[],lamp:{br:T.F.lamp.br,invested:0}});
    out.resumed=T.run.corpses.list.length===n&&T.F.bodies.size>0;
    const o=T.ORIENT; T.setOrient(o==='land'?'port':'land'); out.turned=[...T.F.bodies.keys()].every(k=>T.F.pathTiles.has(k)); T.setOrient(o);
    /* madness feeds: the Bone Spear and the horrors */
    fresh(); T.F.towers=T.F.towers.filter(t=>t.kind!=='horror');
    const h={kind:'ward',type:'harpoon',br:{speed:0,strength:0,dread:0}};
    out.spear0=T.wstat(h).dmg; out.boost0=T.horrorBoost();
    field('shrieker',0); field('shrieker',1); field('gnasher',2); out.tier=T.madTier();
    out.spear2=+T.wstat(h).dmg.toFixed(2); out.boost2=+T.horrorBoost().toFixed(2);
    h.br.dread=2; out.dread2=+T.wstat(h).dmg.toFixed(2);
    /* Unbind: it charges down the stair, through everything, and leaves the roster */
    fresh(); T.F.towers=[]; T.run.roster={gnasher:1};
    T.castRite('unbind'); out.noHorror=T.F.cd.unbind||0;
    const P0=T.F.paths[0], mid=Math.floor(P0.len*.6), q=T.posAt(P0,mid);
    const g=field('gnasher',0); g.x=q[0]+1; g.y=q[1]; g.c=Math.floor(g.x); g.r=Math.floor(g.y);
    T.F.phase='wave';
    const foes=[T.spawnFoe('crawler',0,mid-2),T.spawnFoe('crawler',0,mid-4),T.spawnFoe('gnasher',0,mid+3)]; T.update(.001);
    const hp=foes.map(f=>f.hp);
    T.castUnbind(g); for(let i=0;i<60;i++)T.update(.05);
    out.unbind={cd:T.F.cd.unbind>20, gone:!T.F.towers.includes(g), roster:T.run.roster.gnasher, hit:foes.map((f,i)=>f.dead||f.hp<hp[i]), charges:T.F.charges.length};
    /* Soul Spear: what a Bone Spear kills leaves its sigil */
    fresh(); window.devNoDark=true;
    const tgt=T.spawnFoe('gnasher',0,4); T.update(.001); T.F.souls=[];
    T.F.shots.push({k:'bolt',x:tgt.x,y:tgt.y,tg:tgt,tx:tgt.x,ty:tgt.y,spd:13,dmg:9999,ang:0,soul:true}); T.update(.01);
    out.soul=T.F.souls.length; window.devNoDark=false;
    /* the Mother's two for the Occultist: Wet Graves and Drowned Souls */
    fresh(); T.addAtt('mother',1); T.takeOffer('graves'); T.takeOffer('souls');
    const [wg,wd]=T.run.water.str[0];
    const dead=T.spawnFoe('gnasher',wg,wd+.3); T.update(.001); T.F.souls=[]; T.hurt(dead,9999); out.drowned=T.F.souls.length;
    const wp=T.F.waterPts; let near=null;
    for(let r=0;r<T.ROWS&&!near;r++)for(let c=0;c<T.COLS&&!near;c++)if(T.placeProblem({kind:'ward',type:'candle'},c,r)===''&&T.nearWater(c+.5,r+.5))near=[c,r];
    T.setSel({kind:'ward',type:'candle'}); T.tryPlace(near[0],near[1]); T.setSel(null);
    T.F.wave=1; T.F.phase='wave'; T.F.queue=[]; T.F.foes.forEach(f=>f.dead=true); T.update(.01);
    out.graves=T.F.towers.filter(t=>t.corpse).length;
    /* the first Corpse Candle tip */
    fresh(); T.addCorpse({gate:0,d:5,def:{}}); T.tutSet({walk:'done',seen:[],off:false}); T.F.born=-1e6; T.F.phase='build'; T.coachPoll(); out.tip=T.COACH.key;
    T.tutSet({walk:'done',seen:[],off:true});
    return out;});
  console.log(JSON.stringify(r));
  ok(r.names.join()==='Corpse Candle,Bone Spear'&&r.cost===0,'the Occultist builds Corpse Candles (free) and Bone Spears',r);
  ok(r.rites.join()==='unbind,name'&&r.mad===3,'it casts Unbind and Name the Thing; horrors cost their full madness',r);
  ok(r.trees[0]===0&&r.trees[1]==='Speed,Strength,Dread','Corpse Candles take no branches; the Bone Spear has Dread',r.trees);
  ok(r.noneAtStart,'a floor begins with nowhere to light one');
  ok(r.bodies===1&&r.spots>0,'a death leaves a body with places beside it',r);
  ok(r.inDark&&r.placed.corpse&&r.placed.lit&&r.placed.free&&r.placed.bodiesLeft===0,'it stands in the dark, burns without the lamp, costs nothing, and uses the body',r.placed);
  ok(r.buildsNow,'its light lets you build');
  ok(r.back===1,'dismantled, it hands the body back',r.back);
  ok(r.afterWave.phase==='build'&&r.afterWave.candles===0,'Corpse Candles go out when the wave breaks',r.afterWave);
  ok(r.resumed&&r.turned,'bodies survive a resume and a turned board',r);
  ok(r.tier===2&&Math.abs(r.spear2/r.spear0-1.5)<.01&&r.boost0===1&&r.boost2===1.4,'madness feeds the spear (+25%/tier) and the horrors (+20%/tier)',r);
  ok(Math.abs(r.dread2/r.spear0-1.9)<.01,'Dread adds 10% per tier per level',r.dread2/r.spear0);
  ok(r.noHorror===0,'Unbind waits when no horror stands on the board');
  ok(r.unbind.cd&&r.unbind.gone&&r.unbind.roster===0&&r.unbind.hit[0]&&r.unbind.hit[1]&&!r.unbind.hit[2]&&r.unbind.charges===0,'Unbind charges toward where they come from, hits what is in its way, and is gone',r.unbind);
  ok(r.soul===1,'Soul Spear leaves a sigil',r.soul);
  ok(r.drowned===1,'Drowned Souls: death in water leaves a sigil',r.drowned);
  ok(r.graves===1,'Wet Graves: a Corpse Candle beside water stays lit',r.graves);
  ok(r.tip==='corpse','the first body gets the Corpse Candle tip',r.tip);
  ok(!errs.length,'no page errors',errs);
  fails.forEach(f=>console.log('FAIL '+f)); await b.close(); process.exitCode=fails.length?1:0;
})();
