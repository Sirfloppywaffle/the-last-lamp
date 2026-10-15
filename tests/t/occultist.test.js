// The Occultist (#26, the third kit): Corpse Candles, the Bone Spear, madness that feeds, and Unbind.
const {chromium}=require('playwright');
const fails=[]; const ok=(c,m,d)=>{if(!c)fails.push(m+(d!==undefined?' '+JSON.stringify(d):''));};
(async()=>{
  const b=await chromium.launch(); const p=await b.newPage({viewport:{width:412,height:860}});
  const errs=[]; p.on('pageerror',e=>errs.push(String(e)));
  await p.goto('file://'+process.argv[2]); await p.waitForTimeout(300);
  const r=await p.evaluate(async()=>{const T=__t, out={}; window.devNoDark=false;
    const fresh=()=>{T.newRun('occultist',0); T.setP(false); T.run.ess=2000;};
    const field=(type,i)=>{const t={kind:'horror',type,id:9100+i,c:0,r:i,x:.5,y:i+.5,br:{},cd:9,ang:0,tgt:'first',invested:0,fresh:0}; T.F.towers.push(t); return t;};
    fresh();
    out.names=[T.wdef('candle').n,T.wdef('harpoon').n]; out.cost=T.wardCost('candle'); out.rites=T.run.rites.slice(); out.wards=T.run.wards.slice(); out.mad=T.horrorMad('gnasher');
    out.trees=[T.treeOf('candle').length,T.treeOf('harpoon').map(x=>x.n).join()];
    /* the first floor starts with the last lamp-carrier's bones; every floor after starts bare */
    out.seeded=[T.F.bodies.size,T.run.corpses.list.length];
    T.run.floor=1; T.beginFloor(null); T.setP(false);
    let any=false; for(let r=0;r<T.ROWS;r++)for(let c=0;c<T.COLS;c++)if(T.placeProblem({kind:'ward',type:'candle'},c,r)==='')any=true;
    out.noneAtStart=!any;
    /* a death far down the path leaves a body; a Corpse Candle can stand beside it in the dark, free */
    const P=T.F.paths[0], e=T.spawnFoe('crawler',0,3); T.update(.001); T.hurt(e,999);
    /* piles: deaths near one gather into it, three at most; a death beside a full pile scatters */
    const pile=()=>[...T.F.bodies.values()].map(b=>b.n);
    out.pile1=pile(); const save=JSON.stringify(T.run.corpses);
    for(let i=0;i<4;i++){const f=T.spawnFoe('crawler',0,3.3+i*.2); T.update(.001); T.hurt(f,999);}
    out.pileFull=pile();
    /* the floor keeps the freshest twelve */
    for(let i=0;i<20;i++){const f=T.spawnFoe('crawler',0,3+i*2.5); T.update(.001); T.hurt(f,999);}
    out.capped=T.run.corpses.list.length; out.maxPile=Math.max(...pile());
    T.run.corpses=JSON.parse(save); T.corpseSync();
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
    /* the Grasping Dead: a full pile rises as arms that hold what crosses them, six times, in the dark too */
    fresh(); T.run.floor=1; T.beginFloor(null); T.setP(false); T.run.ess=500;
    for(let i=0;i<3;i++)T.addCorpse({gate:0,d:6,def:{}});
    const [pk,pb]=[...T.F.bodies.entries()][0]; const [gc,gr]=pk.split(',').map(Number);
    let other=0; for(let r=0;r<T.ROWS;r++)for(let c=0;c<T.COLS;c++)if(T.placeProblem({kind:'ward',type:'grasp'},c,r)==='')other++;
    const ess2=T.run.ess; T.setSel({kind:'ward',type:'grasp'}); T.tryPlace(gc,gr); T.setSel(null);
    const gw=T.F.towers.find(t=>t.type==='grasp');
    out.grasp={spots:other, placed:!!gw, free:T.run.ess===ess2, bones:T.run.corpses.list.length, lit:T.buildLit(gc,gr), dark:gw&&gw.dark};
    T.F.phase='wave'; const walker=T.spawnFoe('crawler',0,5.2); for(let i=0;i<20&&!(walker.stunT>0);i++)T.update(.05);
    out.grasp.held=+walker.stunT.toFixed(2); out.grasp.grips=gw.grips;
    for(let k=0;k<8;k++){const f=T.spawnFoe('crawler',0,5.6); f.d=5.95; f.tile=pk; T.update(.01);}
    out.grasp.crumbled=!T.F.towers.includes(gw);
    T.F.foes.forEach(f=>f.dead=true); T.update(.01);
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
    /* the first descent's lesson: choose, light, and it teaches the Corpse Candle tip */
    fresh(); T.tutSet({walk:'done',seen:[],off:false}); T.F.born=-1e6; T.F.phase='build'; T.coachPoll(); out.tip=T.COACH.key;
    const step=()=>document.querySelector('#coachTitle').textContent;
    out.steps=[step()]; document.querySelector('#coachActs [data-coach="next"]').click(); out.steps.push(step());
    T.setSel({kind:'ward',type:'candle'}); await new Promise(r=>setTimeout(r,250)); out.steps.push(step());
    const sp=[]; for(let r=0;r<T.ROWS;r++)for(let c=0;c<T.COLS;c++)if(T.placeProblem({kind:'ward',type:'candle'},c,r)==='')sp.push([c,r]);
    T.tryPlace(...sp[0]); await new Promise(r=>setTimeout(r,250)); out.steps.push(step());
    document.querySelector('#coachActs [data-coach="next"]').click(); out.seenCorpse=T.tut().seen.includes('corpse')&&T.tut().seen.includes('occwalk');
    /* a later floor's first bones get the plain tip only if the lesson never ran */
    fresh(); T.run.floor=1; T.beginFloor(null); T.setP(false); T.addCorpse({gate:0,d:5,def:{}}); T.tutSet({walk:'done',seen:['fork','deck'],off:false}); T.F.born=-1e6; T.F.phase='build'; T.coachPoll(); out.tip2=T.COACH.key;
    T.tutSet({walk:'done',seen:[],off:true});
    return out;});
  console.log(JSON.stringify(r));
  ok(r.names.join()==='Corpse Candle,Bone Spear'&&r.cost===0,'the Occultist builds Corpse Candles (free) and Bone Spears',r);
  ok(r.wards.includes('grasp')&&r.rites.join()==='unbind,name'&&r.mad===3,'it casts Unbind and Name the Thing; horrors cost their full madness',r);
  ok(r.trees[0]===0&&r.trees[1]==='Speed,Strength,Dread','Corpse Candles take no branches; the Bone Spear has Dread',r.trees);
  ok(r.seeded[0]===2&&r.seeded[1]===3,'the first floor starts with two piles of bones',r.seeded);
  ok(r.noneAtStart,'a later floor begins with nowhere to light one');
  ok(r.pile1.join()==='1'&&r.pileFull.join()==='3','deaths gather into one pile of three at most',[r.pile1,r.pileFull]);
  ok(r.capped===12&&r.maxPile<=3,'a floor keeps at most twelve bodies',[r.capped,r.maxPile]);
  ok(r.bodies===1&&r.spots>0,'a death leaves a body with places beside it',r);
  ok(r.inDark&&r.placed.corpse&&r.placed.lit&&r.placed.free&&r.placed.bodiesLeft===0,'it stands in the dark, burns without the lamp, costs nothing, and uses the body',r.placed);
  ok(r.buildsNow,'its light lets you build');
  ok(r.back===1,'dismantled, it hands the body back',r.back);
  ok(r.afterWave.phase==='build'&&r.afterWave.candles===0,'Corpse Candles go out when the wave breaks',r.afterWave);
  ok(r.resumed&&r.turned,'bodies survive a resume and a turned board',r);
  ok(r.tier===2&&Math.abs(r.spear2/r.spear0-1.5)<.01&&r.boost0===1&&r.boost2===1.4,'madness feeds the spear (+25%/tier) and the horrors (+20%/tier)',r);
  ok(Math.abs(r.dread2/r.spear0-1.9)<.01,'Dread adds 10% per tier per level',r.dread2/r.spear0);
  ok(r.grasp.spots===1&&r.grasp.placed&&r.grasp.free&&r.grasp.bones===0,'the Grasping Dead rise only from a full pile, free, using its three bones',r.grasp);
  ok(!r.grasp.dark&&Math.abs(r.grasp.held-2)<.1,'they hold what walks over them for 2s, light or none',r.grasp);
  ok(r.grasp.crumbled,'after six grips they crumble',r.grasp);
  ok(r.noHorror===0,'Unbind waits when no horror stands on the board');
  ok(r.unbind.cd&&r.unbind.gone&&r.unbind.roster===0&&r.unbind.hit[0]&&r.unbind.hit[1]&&!r.unbind.hit[2]&&r.unbind.charges===0,'Unbind charges toward where they come from, hits what is in its way, and is gone',r.unbind);
  ok(r.soul===1,'Soul Spear leaves a sigil',r.soul);
  ok(r.drowned===1,'Drowned Souls: death in water leaves a sigil',r.drowned);
  ok(r.graves===1,'Wet Graves: a Corpse Candle beside water stays lit',r.graves);
  ok(r.tip==='occwalk'&&r.steps.join('|')==='The Occultist|Choose a Corpse Candle|Light it on the dead|It goes out','the first descent walks through lighting a Corpse Candle',r.steps);
  ok(r.seenCorpse,'the lesson counts as the Corpse Candle tip');
  ok(r.tip2==='corpse','without the lesson, the first bones get the tip',r.tip2);
  ok(!errs.length,'no page errors',errs);
  fails.forEach(f=>console.log('FAIL '+f)); await b.close(); process.exitCode=fails.length?1:0;
})();
