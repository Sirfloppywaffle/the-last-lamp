// Seeds (#95): every run carries a seed, and every stair roll is a pure function of it.
// - roll() is pure and never NaN; a code holds the whole seed and reads back.
// - Walk floors 1 to 5 twice with one seed (several seeds, kits and depths, every map of every floor met) and compare
//   everything: the run at each floor's start, the gift, the patron, the relics, the doors, omens and Trials, the rooms.
// - A resume at each landing step, and at a floor's start, gives the same next floor.
// - Seeded runs never read or write ll-maps; an old save without a seed still plays, unseeded.
// - The pause, death and morning screens name the stair and copy its code; Descend the same stair walks it again and
//   leaves no embers; the developer box descends a pasted code and saves nothing.
const {chromium}=require('playwright');
const fails=[]; const ok=(cond,msg,detail)=>{if(!cond)fails.push(msg+(detail!==undefined?' '+JSON.stringify(detail).slice(0,600):''));};
(async()=>{
  const b=await chromium.launch();
  const ctx=await b.newContext({viewport:{width:900,height:700}});
  try{await ctx.grantPermissions(['clipboard-read','clipboard-write']);}catch(e){}
  const p=await ctx.newPage();
  const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.goto('file://'+process.argv[2]); await p.waitForTimeout(300);

  /* the walker: plays a landing to the next floor the same way every time, and records what the stair offered */
  await p.evaluate(()=>{
    const T=__t;
    const J=o=>JSON.parse(JSON.stringify(o));
    /* what a floor is, the moment it begins (the herald's rift is drawn lazily, so draw it here, the same in every walk) */
    window.__floorRec=()=>{if(T.run.draw&&T.run.draw.herald)T.heraldGate(T.run.draw.herald);
      return {run:J(T.run),map:T.F.def.mapv,mapN:T.F.def.mapN,waves:J(T.F.def.waves),wnames:J(T.F.def.wnames),omen:T.F.omen,elite:T.F.elite,trial:T.F.trial};};
    /* clear the floor and open its landing, as floorCleared() would after the last wave */
    window.__clear=()=>{T.F.foes=[]; T.F.queue=[]; T.F.wave=T.F.def.waves.length; T.F.phase='cleared'; T.openDraft(40,0);};
    /* from the open landing to the next floor. onStep(stepName) is called each time a step is on screen (and saved) */
    window.__drive=(rec,onStep)=>{
      const f0=T.run.floor;
      for(let n=0;n<30&&T.run.floor===f0;n++){
        const d=T.F.draft, B=T.F.blocking, st=d.pick?'pick':d.step;
        if(onStep)onStep(st+n);
        if(st==='pick'){rec.push(['pick',J(d.pick.opts)]); B.choices[0].fn(); continue;}
        if(st==='gift'){rec.push(['gift',J(d.opts),J(d.patron||null)]); B.choices[0].fn(); continue;}
        if(st==='relic'){rec.push(['relic',J(d.ropts)]); B.choices[0].fn(); continue;}
        if(st==='fork'){rec.push(['doors',J(d.doors)]);
          /* a Trial door when there is one (to walk its chalk and seals), otherwise the first that isn't the Knucklebones */
          let i=d.doors.findIndex(x=>x.trial); if(i<0)i=d.doors.findIndex(x=>x.room!=='bones'); if(i<0)i=0;
          if(d.doors[i].room==='bones'){T.chooseDoor(d,i); T.descend(); continue;}
          B.choices[i].fn(); continue;}
        if(st==='room'){
          /* act once (marked on the room, so a resumed landing knows), then take the stair */
          if(!d.room._acted&&B.choices&&B.choices.length&&d.room.type!=='bones'){rec.push(['room',J(d.room)]); d.room._acted=true; B.choices[0].fn(); continue;}
          rec.push(['left',J(d.room)]); T.descend(); continue;}
        rec.push(['stuck',st]); break;
      }
    };
    /* a whole walk: floors 1 to 5, each recorded at its start and through its landing */
    window.__walk=(seed,kit,depth)=>{
      T.newRun(kit,depth,{seed}); const out=[];
      for(let f=0;f<5;f++){
        if(T.run.floor!==f){out.push(['lost',f,T.run.floor]); break;}
        const rec=[__floorRec()];
        if(f<4){__clear(); __drive(rec);}
        out.push(rec);
      }
      return out;
    };
  });

  /* 1. the roll and the code */
  const pure=await p.evaluate(()=>{
    const T=__t, out={};
    out.same=T.roll(7,2,5,3)===T.roll(7,2,5,3);
    out.range=[...Array(2000).keys()].every(i=>{const r=T.roll(i*2654435761>>>0,i%5,i%23,i); return r>=0&&r<1;});
    out.noNaN=[T.roll(1,2,3),T.roll(),T.roll('x',undefined,null,4),T.roll(4294967295,4,99,1e6)].every(v=>typeof v==='number'&&v>=0&&v<1);
    out.diff=new Set([0,1,2,3,4,5,6,7].map(i=>T.roll(12345,0,1,i))).size===8&&T.roll(1,0,1,0)!==T.roll(1,1,1,0)&&T.roll(1,0,1,0)!==T.roll(1,0,2,0)&&T.roll(1,0,1,0)!==T.roll(2,0,1,0);
    /* the salts never collide */
    const sv=Object.values(T.SALT); out.salts=new Set(sv).size===sv.length&&sv.every(v=>Number.isInteger(v)&&v>0);
    const seeds=[0,1,4294967295,0x80000000,0x7FFFFFFF,123456789].concat([...Array(300).keys()].map(i=>(Math.random()*4294967296)>>>0));
    out.round=seeds.filter(s=>T.parseStair(T.stairCode(s))!==s);
    out.shape=seeds.filter(s=>!/^[A-Z]+-[A-Z]+-[0-9A-HJKMNP-TV-Z]{4}$/.test(T.stairCode(s)));
    out.name=T.stairName(0)+' / '+T.stairCode(0)+' / '+T.stairName(4294967295)+' / '+T.stairCode(4294967295);
    const s=3735928559, c=T.stairCode(s);
    out.lenient=[c.toLowerCase(),'  '+c.replace(/-/g,' ')+' ',c.replace(/0/g,'O'),c.replace(/1/g,'l'),String(s)].map(x=>T.parseStair(x)===s);
    out.bad=['','BRINE','BRINE-HOLLOW','BRINE-HOLLOW-7F2','NOTAWORD-HOLLOW-7F2A','BRINE-NOPE-7F2A','BRINE-HOLLOW-7F2U','99999999999',null,undefined].map(x=>T.parseStair(x));
    /* the name is read off the code */
    out.nameMatch=seeds.slice(0,50).every(sd=>{const n=T.stairName(sd), cc=T.stairCode(sd).split('-'); return n.toUpperCase()==='THE '+cc[0]+'-'+cc[1]+' STAIR';});
    /* a seeded() draw that throws still hands the dice back */
    try{T.seeded(1,0,()=>{throw new Error('x');});}catch(e){}
    T.newRun('lamplighter',0,{seed:5}); const a=T.seeded(T.SALT.doors,0,()=>T.makeDoors()), a2=T.seeded(T.SALT.doors,0,()=>T.makeDoors());
    out.seededSame=JSON.stringify(a)===JSON.stringify(a2);
    const free=[...Array(40).keys()].map(()=>JSON.stringify(T.makeDoors()));
    out.freeAfter=new Set(free).size>1;
    return out;
  });
  ok(pure.same&&pure.range&&pure.noNaN&&pure.diff,'roll() is pure, 0 to 1, and never NaN',pure);
  ok(pure.salts,'every salt is its own positive integer');
  ok(!pure.round.length,'every code reads back to its seed',pure.round.slice(0,5));
  ok(!pure.shape.length,'every code is WORD-WORD-four letters',pure.shape.slice(0,5));
  ok(pure.lenient.every(Boolean),'a code reads back whatever its case, spacing, dashes, O for 0 or l for 1',pure.lenient);
  ok(pure.bad.every(v=>v===null),'nonsense is not a stair',pure.bad);
  ok(pure.nameMatch,'the stair’s name is the first two words of its code');
  ok(pure.seededSame&&pure.freeAfter,'a seeded draw repeats, and the dice go back to Math.random after it (even after a throw)',pure);
  console.log('names:',pure.name);

  /* 2. walk floors 1 to 5 twice with one seed, for many seeds, and compare everything */
  const walks=await p.evaluate(()=>{
    const T=__t;
    T.setMapV(null); localStorage.removeItem('ll-maps');
    const cases=[];
    const kits=['lamplighter','whaler','occultist','galvanist','bellringer'];
    const seeds=[1,2,3,42,1234,99999,0xBEEF,0xC0FFEE,0xDEADBEEF,0x12345678,77777,31337,271828,314159,8675309,4000000000];
    seeds.forEach((sd,i)=>cases.push({sd,kit:kits[i%kits.length],depth:i%4===3?2:0}));
    const out=[], maps={};
    for(const c of cases){
      const a=__walk(c.sd,c.kit,c.depth), b2=__walk(c.sd,c.kit,c.depth);
      const A=JSON.stringify(a), B=JSON.stringify(b2);
      let first='';
      if(A!==B){for(let f=0;f<Math.max(a.length,b2.length);f++){const x=JSON.stringify(a[f]), y=JSON.stringify(b2[f]); if(x!==y){
        for(let k=0;k<Math.max((a[f]||[]).length,(b2[f]||[]).length);k++){const u=JSON.stringify((a[f]||[])[k]), v=JSON.stringify((b2[f]||[])[k]); if(u!==v){first='floor '+(f+1)+' item '+k+': '+u.slice(0,300)+' VS '+v.slice(0,300); break;}}
        break;}}}
      const reached=a.filter(r=>Array.isArray(r)&&r[0]&&r[0].run).length;
      a.forEach((r,f)=>{if(r&&r[0]&&r[0].run){(maps[f]=maps[f]||new Set()).add(r[0].map);}});
      const doors=a.flatMap(r=>Array.isArray(r)?r.filter(x=>Array.isArray(x)&&x[0]==='doors'):[]).length;
      out.push({sd:c.sd,kit:c.kit,depth:c.depth,same:A===B,first,reached,doors,sig:A.length,key:JSON.stringify(a.map(r=>r&&r[0]&&r[0].map))+JSON.stringify(a[0]&&a[0][0]&&a[0][0].run.draw)});
    }
    const counts=T.FLOORS.map((f,i)=>T.floorMaps(i).length), met=counts.map((n,f)=>maps[f]?[...maps[f]].sort().join():'');
    return {out,counts,met,bag:localStorage.getItem('ll-maps')};
  });
  for(const w of walks.out){
    ok(w.same,`seed ${w.sd} (${w.kit}, depth ${w.depth}): two walks of floors 1 to 5 are identical`,w.first);
    ok(w.reached===5&&w.doors===4,`seed ${w.sd}: the walk reached all five floors through four landings`,w);
  }
  ok(new Set(walks.out.map(w=>w.key)).size===walks.out.length,'different seeds draw different stairs',walks.out.map(w=>w.key));
  walks.counts.forEach((n,f)=>ok(walks.met[f]===[...Array(n).keys()].join(),`floor ${f+1}: the walks met every one of its ${n} maps`,walks.met[f]));
  ok(walks.bag===null,'seeded runs never write ll-maps',walks.bag);
  console.log('walked',walks.out.length,'seeds twice; maps met per floor:',walks.met.join(' | '));

  /* 3. a resume at a floor's start and at each landing step gives the same next floor */
  const res=await p.evaluate(()=>{
    const T=__t, J=o=>JSON.parse(JSON.stringify(o)), out=[];
    T.setMapV(null);
    const save=()=>J(JSON.parse(localStorage.getItem('ll-save-v2')));
    for(const [sd,kit] of [[0xC0FFEE,'lamplighter'],[31337,'occultist'],[8675309,'bellringer']]){
      T.newRun(kit,0,{seed:sd});
      for(let f=0;f<4;f++){
        /* the reference: from this floor's start to the next floor's start, saving at every step on the way */
        const snaps=[['floor start',save()]];
        __clear();
        const ref=[];
        __drive(ref,st=>snaps.push([st,save()]));
        const nextRef=JSON.stringify(__floorRec());
        const refLanding=JSON.stringify(ref);
        const keep=save();
        for(const [st,snap] of snaps){
          T.resumeFrom(J(snap));
          const rec=[];
          if(st==='floor start'){
            /* a resumed floor keeps its map and waves; its landing then offers the same */
            __clear(); __drive(rec);
            out.push({sd,f:f+1,st,same:JSON.stringify(__floorRec())===nextRef&&JSON.stringify(rec)===refLanding});
          }else{
            __drive(rec);
            out.push({sd,f:f+1,st,same:JSON.stringify(__floorRec())===nextRef,got:JSON.stringify(__floorRec()).slice(0,200),want:nextRef.slice(0,200)});
          }
        }
        /* carry on from where the reference stood */
        T.resumeFrom(J(keep));
      }
    }
    return out;
  });
  const steps=new Set(res.map(r=>r.st.replace(/\d+$/,'')));
  for(const r of res)ok(r.same,`seed ${r.sd}, floor ${r.f}: resumed at "${r.st}", the next floor is the same`,r.same?undefined:[r.got,r.want]);
  ok(['floor start','gift','fork','room'].every(s=>steps.has(s)),'resumes were tried at the floor start, the gift, the fork and the room',[...steps]);
  console.log('resumes checked:',res.length,'at',[...steps].join(', '));

  /* 4. old saves, the bag, the first descent */
  const old=await p.evaluate(()=>{
    const T=__t, J=o=>JSON.parse(JSON.stringify(o)), out={};
    T.setMapV(null);
    /* a bag already on the device is left exactly as it was by a seeded run */
    const bag=JSON.stringify({b:{1:[2],2:[0]},l:{1:1,2:2}}); localStorage.setItem('ll-maps',bag);
    __walk(4242,'lamplighter',0); out.bagKept=localStorage.getItem('ll-maps')===bag;
    /* an old save has no seed: it resumes, plays unseeded, shows no stair, and its next floor uses the bag */
    T.newRun('lamplighter',0,{seed:4242}); T.checkpoint();
    const s=J(JSON.parse(localStorage.getItem('ll-save-v2'))); delete s.run.seed;
    localStorage.removeItem('ll-maps');
    T.resumeFrom(s);
    out.unseeded=!T.seedOn()&&T.run.seed===undefined&&T.seedLine(true)==='';
    __clear(); __drive([]);
    out.bagUsed=T.run.floor===1&&localStorage.getItem('ll-maps')!==null;
    /* its doors and gifts still vary, as they always did */
    const d=new Set(); for(let i=0;i<30;i++)d.add(JSON.stringify(T.seeded(T.SALT.doors,0,()=>T.makeDoors())));
    out.unseededVaries=d.size>1;
    /* every new run is seeded; the first descent ever is given a seed whose Cistern is the walkthrough's map */
    T.tutSet({walk:'',seen:[],off:true});
    const first=[...Array(30).keys()].map(()=>{T.newRun('lamplighter',0); return [typeof T.run.seed==='number', T.run.mapv.v, !T.run.replay];});
    T.tutSet({walk:'done',seen:[],off:true});
    out.first=first.every(x=>x[0]&&x[1]===0&&x[2]);
    const later=[...Array(30).keys()].map(()=>{T.newRun('lamplighter',0); return T.run.mapv.v;});
    out.laterVaries=new Set(later).size>1;
    out.seedsDiffer=new Set([...Array(20).keys()].map(()=>{T.newRun('lamplighter',0); return T.run.seed;})).size===20;
    T.setMapV(0);
    return out;
  });
  ok(old.bagKept,'a seeded run leaves the ll-maps bag exactly as it found it');
  ok(old.unseeded,'an old save without a seed resumes and plays unseeded, with no stair named',old);
  ok(old.bagUsed,'an old save’s next floor still draws its map from the bag',old);
  ok(old.unseededVaries,'an unseeded run’s doors still vary draw to draw');
  ok(old.first,'the first descent ever is seeded and plays the walkthrough’s map',old);
  ok(old.laterVaries&&old.seedsDiffer,'later descents draw fresh seeds and varied maps',old);

  /* 5. the screens: pause, death (with Descend the same stair), morning */
  await p.evaluate(()=>{__t.setMapV(0); __t.newRun('whaler',1,{seed:0xDEADBEEF}); __t.setP(false);});
  await p.click('#pauseBtn'); await p.waitForTimeout(150);
  const pause=await p.evaluate(()=>({code:document.querySelector('#mBody .seed-code')&&document.querySelector('#mBody .seed-code').textContent,
    name:document.querySelector('#mBody .seed-name')&&document.querySelector('#mBody .seed-name').textContent,want:__t.stairCode(0xDEADBEEF),wantN:__t.stairName(0xDEADBEEF),
    again:!!document.querySelector('#mBody .seed-again')}));
  ok(pause.code===pause.want&&pause.name&&pause.name.toLowerCase()===pause.wantN.toLowerCase()&&!pause.again,'the pause screen names the stair and shows its code',pause);
  await p.click('#mBody [data-seedcopy]'); await p.waitForTimeout(250);
  const copied=await p.evaluate(async()=>{let clip=null; try{clip=await navigator.clipboard.readText();}catch(e){} return {label:document.querySelector('#mBody [data-seedcopy]').textContent,clip};});
  ok(copied.label==='Copied','tapping Copy copies, and says so',copied);
  if(copied.clip!==null)ok(copied.clip===pause.want,'the clipboard holds the code',copied);
  await p.evaluate(()=>{document.querySelector('#mActions button.call').click();});

  const embersBefore=await p.evaluate(()=>__t.meta.embers);
  await p.evaluate(()=>{__t.run.floor=1; __t.defeat();}); await p.waitForTimeout(2600);
  const death=await p.evaluate(()=>({title:document.getElementById('mTitle').textContent,code:(document.querySelector('#mBody .seed-code')||{}).textContent,
    again:!!document.querySelector('#mBody .seed-again'),btns:[...document.querySelectorAll('#mActions button')].map(b=>b.textContent),embers:__t.meta.embers}));
  ok(/lamp is out/i.test(death.title)&&death.code===pause.want&&death.again,'the death screen names the stair, its code, and what walking it again means',death);
  ok(death.btns.includes('Descend the same stair')&&death.btns.indexOf('Descend again')===0,'the death screen offers Descend the same stair, after Descend again',death.btns);
  ok(death.embers>embersBefore,'a first walk of a stair still leaves embers',[embersBefore,death.embers]);
  await p.evaluate(()=>{[...document.querySelectorAll('#mActions button')].find(b=>b.textContent==='Descend the same stair').click();});
  await p.waitForTimeout(200);
  const replay=await p.evaluate(()=>({seed:__t.run.seed,replay:__t.run.replay,kit:__t.run.kit,depth:__t.run.depth,floor:__t.run.floor,phase:__t.F.phase,
    save:!!JSON.parse(localStorage.getItem('ll-save-v2')||'null')}));
  ok(replay.seed===0xDEADBEEF&&replay.replay===true&&replay.kit==='whaler'&&replay.depth===1&&replay.floor===0&&replay.phase==='build'&&replay.save,
    'Descend the same stair starts the same seed, kit and depth from the first floor, marked as walked again',replay);
  const e2=await p.evaluate(()=>__t.meta.embers);
  await p.evaluate(()=>{__t.run.floor=2; __t.run.bosses=1; __t.defeat();}); await p.waitForTimeout(2600);
  const death2=await p.evaluate(()=>({body:document.getElementById('mBody').textContent,embers:__t.meta.embers,name:(document.querySelector('#mBody .seed-name')||{}).textContent}));
  ok(death2.embers===e2&&/walked twice leaves no embers/.test(death2.body)&&/walked again/.test(death2.name||''),'a stair walked again leaves no embers, and says so',death2);
  await p.evaluate(()=>{__t.newRun('lamplighter',0,{seed:777}); __t.victory();}); await p.waitForTimeout(2600);
  const won=await p.evaluate(()=>({title:document.getElementById('mTitle').textContent,code:(document.querySelector('#mBody .seed-code')||{}).textContent,want:__t.stairCode(777),
    again:!!document.querySelector('#mBody .seed-again'),btns:[...document.querySelectorAll('#mActions button')].map(b=>b.textContent)}));
  ok(/Morning/.test(won.title)&&won.code===won.want&&!won.again&&!won.btns.includes('Descend the same stair'),'the morning screen names the stair and its code',won);

  /* 6. developer mode: paste a code. It shows, never saves (rule 24) */
  const dev=await p.evaluate(async()=>{
    const T=__t, out={};
    T.newRun('galvanist',0,{seed:1}); T.setP(false);
    const before={meta:localStorage.getItem('ll-meta'),codex:localStorage.getItem('ll-codex'),maps:localStorage.getItem('ll-maps')};
    out.bad=T.DEV_ACTS.seed();
    const code=T.stairCode(0xC0FFEE);
    const inp=document.createElement('input'); inp.id='seedIn'; inp.value=code.toLowerCase(); document.body.appendChild(inp);
    out.ret=T.DEV_ACTS.seed(); inp.remove();
    out.run={seed:T.run.seed,replay:T.run.replay,kit:T.run.kit,floor:T.run.floor};
    out.kept=localStorage.getItem('ll-meta')===before.meta&&localStorage.getItem('ll-codex')===before.codex&&localStorage.getItem('ll-maps')===before.maps;
    out.stored=Object.keys(localStorage).filter(k=>(localStorage.getItem(k)||'').includes(code)&&k!=='ll-save-v2');
    return out;
  });
  ok(/No stair has that code/.test(dev.bad||''),'an empty or wrong code is refused with a plain line',dev.bad);
  ok(dev.ret===null&&dev.run.seed===0xC0FFEE&&dev.run.replay===true&&dev.run.kit==='galvanist'&&dev.run.floor===0,'developer mode descends a pasted code as a walk-again run',dev);
  ok(dev.kept&&!dev.stored.length,'a pasted code writes nothing to ll-meta, ll-codex or ll-maps, and is not kept',dev);
  /* the box itself, in the Developer menu */
  await p.evaluate(()=>{localStorage.setItem('ll-dev','true');});
  await p.reload(); await p.waitForTimeout(300);
  await p.evaluate(()=>{__t.newRun('lamplighter',0,{seed:2024}); __t.setP(false);});
  await p.click('#pauseBtn'); await p.waitForTimeout(100);
  await p.evaluate(()=>{[...document.querySelectorAll('#mActions button')].find(b=>b.textContent==='Developer').click();});
  await p.waitForTimeout(100);
  const box=await p.evaluate(()=>{const i=document.getElementById('seedIn'), r=i&&i.getBoundingClientRect(); return {there:!!i,ph:i&&i.placeholder,font:i&&getComputedStyle(i).fontSize,h:r&&r.height,want:__t.stairCode(2024)};});
  ok(box.there&&box.ph===box.want&&box.font==='16px'&&box.h>=40,'the Developer menu has a code box (16px, so phones don’t zoom), showing this stair’s code',box);
  await p.fill('#seedIn','BRINE-HOLLOW-7F2A');
  await p.evaluate(()=>{document.querySelector('[data-dev="seed"]').click();}); await p.waitForTimeout(150);
  const viaBox=await p.evaluate(()=>({code:__t.stairCode(__t.run.seed),replay:__t.run.replay,modal:document.getElementById('modal').hidden}));
  ok(viaBox.code==='BRINE-HOLLOW-7F2A'&&viaBox.replay&&viaBox.modal,'typing a code in the box and tapping Descend it walks that stair',viaBox);
  await p.evaluate(()=>{localStorage.removeItem('ll-dev');});

  /* 7. it is taught: a first-time tip after the first floor, and a rules line; no Grimoire entry */
  const teach=await p.evaluate(()=>{const T=__t; T.newRun('lamplighter',0,{seed:9}); const t0=T.TIPS.stair.when(); T.run.floor=1; T.beginFloor(null); const t1a=T.TIPS.stair.when(); T.F.wave=1; const t1=T.TIPS.stair.when()&&!t1a;
    return {t0,t1,text:T.TIPS.stair.text,rule:document.getElementById('rulesList').textContent.includes('Every stair has a name'),bag:/before any comes back/.test(document.getElementById('rulesList').textContent)};});
  ok(!teach.t0&&teach.t1&&/no embers/.test(teach.text),'the stair tip waits for a break on the second floor, and says a replay leaves no embers',teach);
  ok(teach.rule&&!teach.bag,'"How the dark works" names it, and no longer promises every map before a repeat',teach);

  ok(!errs.length,'no page errors',errs);
  await b.close();
  if(fails.length){fails.forEach(f=>console.log('FAIL '+f)); process.exit(1);}
  console.log('seeds: ok');
})();
