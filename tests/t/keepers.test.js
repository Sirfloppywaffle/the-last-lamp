// Saltmouth (Expansion 3, step 5): the Keepers in town, Take the lamp, chores.
// - Only a Keeper you have freed (and are not carrying) stands at their station; the rest stand dark, and a tap shows how they are freed.
// - Every station and workplace is in TOWN_KEEP: nothing is built on one, and nothing built may wall one off. Pieces already standing on one
//   come up and pay back; a piece that would shut one off comes up too.
// - The button at the bottom reads "Talk to <name>". The card offers Take the lamp (the same write as the kit picker's Descend: ll-meta.lastKit,
//   the Roster's pre-selection, the sprite) and A chore (one slot).
// - Developer mode swaps the sprite but never saves the choice (rule 24).
// - A chore pays town materials only, put into the haul, so haulCredit() pays it once (reload, the death screen). A Keeper you carry does none.
// - ll-town gains chore (rule 15: old shapes merge on). Taught (rule 23): TIPS.townkeepers, TIPS.townchore and the Saltmouth rules line.
const {chromium}=require('playwright');
const fails=[]; const ok=(cond,msg,detail)=>{if(!cond)fails.push(msg+(detail!==undefined?' '+JSON.stringify(detail).slice(0,700):''));};
(async()=>{
  const b=await chromium.launch();
  const ctx=await b.newContext({viewport:{width:412,height:860},deviceScaleFactor:2,hasTouch:true,isMobile:true});
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.goto('file://'+process.argv[2]); await p.waitForTimeout(400);
  const ALL=['kit_whaler','kit_occultist','kit_galvanist','kit_bellringer'];
  const setup=(unlocked,kit)=>p.evaluate(([u,k])=>{
    localStorage.setItem('ll-tut',JSON.stringify({walk:'done',seen:['town','townhaul','townbuild','townkeepers','townchore'],off:false}));
    localStorage.setItem('ll-meta',JSON.stringify({embers:50,unlocked:u,lastKit:k}));
    localStorage.removeItem('ll-town'); localStorage.removeItem('ll-save-v2'); __t.setDev(false); __t.townReset(); __t.townClose(); __t.townOpen();
  },[unlocked,kit]);

  /* 1. who stands: only the unlocked, never the one you carry; the rest are shades */
  await setup([], 'lamplighter');
  const none=await p.evaluate(()=>__t.TWN.crowd.map(e=>e.k+(e.shade?':shade':'')).sort());
  ok(none.length===4&&none.every(s=>/:shade$/.test(s))&&!none.some(s=>/^lamplighter/.test(s)),'at the start only the Lamplighter is free, and you carry him: the other four stand dark',none);
  await setup(['kit_whaler'], 'lamplighter');
  const one=await p.evaluate(()=>__t.TWN.crowd.filter(e=>!e.shade).map(e=>e.k));
  ok(one.length===1&&one[0]==='whaler','a freed Keeper stands; locked ones do not',one);
  await setup(ALL, 'lamplighter');
  const all=await p.evaluate(()=>({stand:__t.TWN.crowd.filter(e=>!e.shade).map(e=>e.k).sort(),pos:__t.TWN.crowd.map(e=>[e.k,e.tx,e.ty])}));
  ok(all.stand.join()==='bellringer,galvanist,occultist,whaler','with every Keeper freed, the four you do not carry stand',all);
  await setup(ALL, 'whaler');
  const swapped=await p.evaluate(()=>__t.TWN.crowd.map(e=>e.k).sort().join());
  ok(swapped==='bellringer,galvanist,lamplighter,occultist','the Keeper you carry is not in the square; the Lamplighter takes his station',swapped);
  const shade=await p.evaluate(()=>{__t.townReset(); localStorage.setItem('ll-meta',JSON.stringify({embers:0,unlocked:[],lastKit:'lamplighter'})); __t.townClose(); __t.townOpen();
    const e=__t.TWN.crowd.find(x=>x.k==='galvanist'); __t.townShadeCard('galvanist'); const m=document.getElementById('mBody').textContent;
    const was=document.getElementById('modal').hidden; document.querySelector('#mActions button').click(); return {shade:e.shade,m,hidden:was};});
  ok(shade.shade&&!shade.hidden&&/Voss|Galvanist|embers|Ember Hall|deed/i.test(shade.m),'a tap on a dark footing says how that Keeper is freed',shade);

  /* 2. every Keeper's place is kept clear, and cannot be walled off */
  await setup(ALL,'lamplighter');
  const keep=await p.evaluate(()=>{
    const S=__t.TOWN_STAND, o={all:true,bad:[]};
    for(const k in S)for(const [x,y] of [S[k].st,S[k].wk]){
      if(!__t.TOWN_KEEP.some(([a,c])=>a===x&&c===y))o.all=false;
      if(__t.townSolid(x,y))o.bad.push(['solid',k,x,y]);
      const r=__t.townCanPlace('cobble',x,y); if(r==='')o.bad.push(['buildable',k,x,y]);
    }
    return o;
  });
  ok(keep.all&&!keep.bad.length,'every station and workplace is in TOWN_KEEP, walkable, and refuses a piece',keep);
  const wall=await p.evaluate(()=>{
    const D=__t.townData(); D.res={timber:99,iron:99,tallow:99,curios:0};
    /* shut a Keeper's workplace in with fences on its open sides: the last piece that would do it is refused, a path is not */
    const o={};
    for(const [nm,[x,y]] of [['voss',__t.TOWN_STAND.galvanist.wk],['ambrose',__t.TOWN_STAND.lamplighter.wk],['jonah',__t.TOWN_STAND.whaler.wk]]){
      const sides=[[x+1,y],[x-1,y],[x,y+1],[x,y-1],[x+1,y+1],[x-1,y+1],[x+1,y-1],[x-1,y-1]].filter(([a,c])=>!__t.townSolid(a,c)&&!__t.townKept(a,c));
      const placed=[]; let refused=null;
      for(const [a,c] of sides){const r=__t.townCanPlace('fence',a,c); if(r===''){__t.townPlace('fence',a,c); placed.push([a,c]);} else {refused=r; break;}}
      o[nm]={sides:sides.length,placed:placed.length,refused,reach:__t.townReaches(12,14)};
      for(const [a,c] of placed)__t.townTakeUp(__t.townDecoAt(a,c));
    }
    return o;
  });
  ok(Object.values(wall).every(w=>w.placed>0&&/wall off/.test(w.refused||'')&&w.reach),'fencing a Keeper\u2019s place in is refused at the last piece that would shut it off; every place stays reachable',wall);

  /* 3. an old town with pieces on a Keeper's place: they come up and pay back, and a card says so once */
  const mig=await p.evaluate(()=>{
    __t.setTownNote([]); __t.townReset();
    const S=__t.TOWN_STAND.whaler.st, W=__t.TOWN_STAND.galvanist.wk;
    const fx=__t.townFix({res:{iron:0,timber:0,tallow:0,curios:0},decos:[{id:'lamp',c:S[0],r:S[1]},{id:'cobble',c:W[0],r:W[1]},{id:'lamp',c:3,r:15}]});
    return {ids:fx.decos.map(d=>d.id+d.c+','+d.r),res:fx.res};
  });
  ok(mig.ids.length===1&&mig.ids[0]==='lamp3,15'&&mig.res.iron===8&&mig.res.tallow===4,'pieces standing on a Keeper’s place are taken up and paid back (lamp 6 iron 4 tallow, cobble 2 iron)',mig);
  const card=await p.evaluate(()=>{
    localStorage.setItem('ll-tut',JSON.stringify({walk:'done',seen:[],off:false}));
    __t.setTownNote(['Street-lamp']); __t.townClose(); __t.townOpen();
    const t=document.querySelector('#townCard b')?document.querySelector('#townCard b').textContent:'';
    __t.setTownNote([]); return t;});
  ok(card==='Taken up','a one-time card says what was taken up',card);

  /* 4. Talk to ... through townNearAct, and the card */
  await setup(ALL,'lamplighter');
  const near=await p.evaluate(()=>{
    const T=__t.TWN, e=T.crowd.find(x=>x.k==='galvanist'); T.p.x=e.x; T.p.y=e.y+1.2; T.path=null; __t.townFrame(.03);
    const a=__t.townNearAct(), btn=document.getElementById('townAct');
    const far=(T.p.x=4,T.p.y=14,__t.townNearAct());
    T.p.x=e.x; T.p.y=e.y+1.2; __t.townFrame(.03);
    return {k:a&&a.k,label:btn.hidden?null:btn.textContent,far:far&&(far.k||far.id||'x')};
  });
  ok(near.k==='galvanist'&&near.label==='Talk to Dr. Lucan Voss','the button reads "Talk to Dr. Lucan Voss" within reach',near);
  ok(!near.far,'nothing offered away from a Keeper',near);
  const talk=await p.evaluate(()=>{
    __t.townTalk('galvanist');
    const btns=[...document.querySelectorAll('#mActions button')].map(x=>x.textContent);
    return {title:document.getElementById('mTitle')?document.getElementById('mTitle').textContent:'',btns,body:document.getElementById('mBody').textContent};
  });
  ok(/Take the lamp/.test(talk.btns.join('|'))&&/A chore/.test(talk.btns.join('|')),'the talk card offers Take the lamp and A chore',talk);
  ok(/iron/.test(talk.body)&&/8 iron for each floor/.test(talk.body),'it says what the chore pays',talk.body);
  await p.evaluate(()=>document.getElementById('mActions').querySelectorAll('button')[2].click());

  /* 5. Take the lamp: lastKit, the next descent, the Roster's pre-selection, the sprite; the old carrier takes a station */
  await setup(ALL,'lamplighter');
  const tl=await p.evaluate(()=>{
    const r=__t.townTakeLamp('occultist'), m=JSON.parse(localStorage.getItem('ll-meta'));
    const stand=__t.TWN.crowd.map(e=>e.k).sort().join(), kit=__t.TWN.kit;
    __t.openKitPicker(); const pre=document.querySelector('#rostRow .rost-card.on'); const preKit=pre&&pre.dataset.kit;
    const call=document.querySelector('#mActions button.call').textContent;
    document.querySelector('#mActions button.call').click();
    return {r,last:m.lastKit,stand,kit,preKit,call,runKit:__t.run.kit};
  });
  ok(tl.r&&tl.last==='occultist'&&tl.kit==='occultist','Take the lamp writes ll-meta.lastKit and swaps the sprite',tl);
  ok(tl.stand==='bellringer,galvanist,lamplighter,whaler','the Occultist leaves the square and the Lamplighter takes his station',tl);
  ok(tl.preKit==='occultist'&&/Descend as The Nameless/.test(tl.call)&&tl.runKit==='occultist','the Roster pre-selects them and the next descent starts as them',tl);
  const lock=await p.evaluate(()=>{__t.townReset(); localStorage.setItem('ll-meta',JSON.stringify({embers:0,unlocked:[],lastKit:'lamplighter'})); return __t.townTakeLamp('bellringer');});
  ok(lock===false,'Take the lamp is refused for a Keeper not yet freed',lock);

  /* 6. developer mode: the sprite swaps, nothing is saved (rule 24) */
  await setup(ALL,'lamplighter');
  const dev=await p.evaluate(()=>{
    const m0=localStorage.getItem('ll-meta'), t0=localStorage.getItem('ll-town');
    __t.setDev(true); __t.townReset(); __t.townClose(); __t.townOpen();
    __t.townTakeLamp('galvanist'); __t.townSetChore('whaler');
    const o={kit:__t.TWN.kit,carried:__t.carriedKit(),m:localStorage.getItem('ll-meta')===m0,t:localStorage.getItem('ll-town')===t0};
    __t.openKitPicker(); const pre=document.querySelector('#rostRow .rost-card.on'); o.pre=pre&&pre.dataset.kit;
    document.querySelector('#mActions button.call').click(); o.runKit=__t.run.kit; o.m2=localStorage.getItem('ll-meta')===m0;
    __t.setDev(false); __t.townReset(); o.after=JSON.parse(localStorage.getItem('ll-meta')).lastKit; return o;
  });
  ok(dev.kit==='galvanist'&&dev.carried==='galvanist'&&dev.pre==='galvanist'&&dev.runKit==='galvanist','developer mode carries them in the square and into the Roster',dev);
  ok(dev.m&&dev.t&&dev.m2&&dev.after==='lamplighter','developer mode never writes ll-meta or ll-town (rule 24)',dev);

  /* 7. a chore: one slot, at the workplace, pays materials only, once, through haulCredit() */
  await setup(ALL,'lamplighter');
  const ch=await p.evaluate(()=>{
    const o={};
    __t.townSetChore('whaler'); const e=__t.TWN.crowd.find(x=>x.k==='whaler'), W=__t.TOWN_STAND.whaler;
    o.at=[e.tx,e.ty]; o.work=e.work; o.want=W.wk;
    __t.townSetChore('galvanist'); const e2=__t.TWN.crowd.find(x=>x.k==='whaler'); o.back=[e2.tx,e2.ty]; o.backWant=__t.TOWN_STAND.whaler.st; o.one=__t.townData().chore;
    o.stored=JSON.parse(localStorage.getItem('ll-town')).chore;
    __t.townSetChore('whaler'); __t.townSetChore(null); o.cleared=__t.townData().chore;
    return o;
  });
  ok(ch.at.join()===ch.want.join()&&ch.work,'a Keeper on a chore stands at their workplace',ch);
  ok(ch.one==='galvanist'&&ch.back.join()===ch.backWant.join()&&ch.stored==='galvanist','one slot: setting another sends the first back to their station, and it is saved',ch);
  ok(ch.cleared===null,'ending a chore clears it',ch);
  const pay=await p.evaluate(()=>{
    const shape={}; for(const k in __t.TOWN_CHORES)shape[k]=Object.assign({},__t.TOWN_CHORES[k].pay,{every:__t.TOWN_CHORES[k].every||1});
    __t.townData().res={timber:0,iron:0,tallow:0,curios:0}; __t.townSetChore('whaler');
    __t.newRun('lamplighter',0); const o={chore:__t.run.chore};
    __t.floorCleared(); __t.floorCleared();
    o.haul=Object.assign({},__t.run.haul); o.wage=Object.assign({},__t.run.wage);
    __t.checkpoint(); o.mid=Object.assign({},__t.townData().res);
    __t.defeat(); o.after=Object.assign({},__t.townData().res); o.second=__t.haulCredit();
    return new Promise(r=>setTimeout(()=>r({shape,o,body:document.getElementById('mBody').textContent}),1000));
  });
  ok(pay.shape.lamplighter.timber===12&&pay.shape.whaler.tallow===15&&pay.shape.galvanist.iron===8&&pay.shape.occultist.curios===1&&pay.shape.occultist.every===3&&pay.shape.bellringer.timber===5&&pay.shape.bellringer.iron===5,'the chore table: Ambrose 12 timber, Jonah 15 tallow, Voss 8 iron, Nameless 1 curio per 3 floors, Agathe 5 timber and 5 iron',pay.shape);
  ok(pay.o.chore==='whaler'&&pay.o.wage.tallow===30&&pay.o.haul.tallow===30&&pay.o.haul.timber===16&&pay.o.haul.iron===10,'each floor cleared puts the wage in the haul beside the floor’s own',pay.o);
  ok(pay.o.mid.tallow===0,'nothing reaches the town until the haul comes up',pay.o.mid);
  ok(pay.o.after.tallow===30&&pay.o.after.timber===16&&pay.o.after.iron===10&&pay.o.second===false,'defeat credits it once through haulCredit()',pay.o);
  ok(pay.o.after.curios===0,'a chore pays no curios unless it is the Nameless’s',pay.o.after);
  const wage=pay.body;
  ok(/Jonah Tolland put by 30 tallow while you were down\./.test(wage),'the death screen says what was put by',wage);

  /* the Nameless pays 1 curio every third floor; only materials, never embers */
  const nm=await p.evaluate(()=>{
    localStorage.setItem('ll-meta',JSON.stringify({embers:7,unlocked:['kit_occultist'],lastKit:'lamplighter'}));
    __t.townData().res={timber:0,iron:0,tallow:0,curios:0}; __t.townSetChore('occultist');
    __t.newRun('lamplighter',0); const o=[]; for(let i=0;i<6;i++){__t.floorCleared(); o.push(__t.run.wage?__t.run.wage.curios:0);}
    __t.defeat(); o.push(__t.townData().res.curios); o.push(JSON.parse(localStorage.getItem('ll-meta')).embers); return o;
  });
  ok(nm.slice(0,6).join()==='0,0,1,1,1,2'&&nm[6]===2,'the Nameless puts by one curio on every third floor',nm);

  /* reload on the death screen never pays twice; a mid-run reload keeps the wage */
  await p.reload(); await p.waitForTimeout(350);
  await p.evaluate(([ALL])=>{localStorage.setItem('ll-meta',JSON.stringify({embers:0,unlocked:ALL,lastKit:'lamplighter'})); __t.townReset();},[ALL]);
  const mid=await p.evaluate(()=>{
    __t.townData().res={timber:0,iron:0,tallow:0,curios:0}; __t.townSetChore('galvanist');
    __t.newRun('lamplighter',0); __t.floorCleared(); __t.checkpoint();
    const sv=JSON.parse(localStorage.getItem('ll-save-v2')); __t.resumeFrom(sv);
    return {chore:__t.run.chore,wage:__t.run.wage,haul:__t.run.haul,res:__t.townData().res};
  });
  ok(mid.chore==='galvanist'&&mid.wage.iron===8&&mid.haul.iron===13&&mid.res.iron===0,'a reload mid-run keeps the chore and the wage, and has not paid',mid);
  const dead=await p.evaluate(()=>new Promise(res=>{
    __t.defeat(); const first=Object.assign({},__t.townData().res);
    __t.townReset(); const again=__t.haulCredit(__t.run); const reloaded=Object.assign({},__t.townData().res);
    setTimeout(()=>res({first,again,reloaded}),50);
  }));
  ok(dead.first.iron===13&&dead.again===false&&dead.reloaded.iron===13,'a reload on the death screen never pays twice',dead);

  /* the Keeper you carry does no chore; an old save with no chore is fine */
  const carry=await p.evaluate(()=>{
    __t.townData().res={timber:0,iron:0,tallow:0,curios:0}; __t.townSetChore('whaler');
    __t.newRun('whaler',0); const a=__t.run.chore; __t.floorCleared(); const w=__t.run.wage; const h=Object.assign({},__t.run.haul);
    __t.newRun('lamplighter',0); const b=__t.run.chore;
    const sv=JSON.parse(JSON.stringify({run:Object.assign({},__t.run)})); delete sv.run.chore; delete sv.run.cleared; delete sv.run.wage;
    return {a,w,h,b,old:__t.townFix({v:1,res:{timber:2}}).chore};
  });
  ok(carry.a===null&&!carry.w&&carry.h.tallow===0&&carry.b==='whaler','the Keeper you carry down is not at a chore; the others still are',carry);
  ok(carry.old===null,'an old ll-town with no chore loads with none',carry);
  const bad=await p.evaluate(()=>[__t.townFix({chore:'nope'}).chore,__t.townFix({chore:7}).chore,__t.townFix({chore:'whaler'}).chore]);
  ok(bad[0]===null&&bad[1]===null&&bad[2]==='whaler','a stored chore that is not a Keeper is dropped',bad);
  const locked=await p.evaluate(()=>{localStorage.setItem('ll-meta',JSON.stringify({embers:0,unlocked:[],lastKit:'lamplighter'})); __t.townReset(); __t.townData().chore='whaler'; const r=__t.townChore('lamplighter'); __t.townSetChore('whaler'); return {r,set:__t.townData().chore};});
  ok(locked.r===null&&locked.set===null,'a Keeper not freed cannot be set to a chore',locked);

  /* 8. taught (rule 23) */
  const teach=await p.evaluate(()=>{
    localStorage.setItem('ll-meta',JSON.stringify({embers:0,unlocked:['kit_whaler'],lastKit:'lamplighter'}));
    localStorage.setItem('ll-tut',JSON.stringify({walk:'done',seen:['town','townhaul','townbuild'],off:false}));
    localStorage.removeItem('ll-town'); __t.townReset(); __t.townClose(); __t.townOpen();
    const t1=document.querySelector('#townCard b')?document.querySelector('#townCard b').textContent:'';
    document.getElementById('townCard').click();
    __t.townSetChore('whaler'); __t.townClose(); __t.townOpen();
    const t2=document.querySelector('#townCard b')?document.querySelector('#townCard b').textContent:'';
    document.getElementById('townCard').click();
    const seen=JSON.parse(localStorage.getItem('ll-tut')||'{}').seen||[];
    const rules=document.getElementById('rulesList').textContent||'';
    return {t1,t2,seen,rules};
  });
  ok(teach.t1==='The Keepers'&&teach.t2==='A chore','the Keepers card shows once one stands; the chore card once one is set',teach);
  ok(teach.seen.includes('townkeepers')&&teach.seen.includes('townchore'),'both are marked seen when dismissed',teach.seen);
  ok(/Keepers/.test(teach.rules)&&/chore/i.test(teach.rules),'the Saltmouth rules line mentions the Keepers and a chore',teach.rules.slice(0,200));
  const noTip=await p.evaluate(()=>{localStorage.setItem('ll-meta',JSON.stringify({embers:0,unlocked:[],lastKit:'lamplighter'})); localStorage.setItem('ll-tut',JSON.stringify({walk:'done',seen:['town','townhaul','townbuild'],off:false})); __t.townReset(); __t.townClose(); __t.townOpen(); return document.getElementById('townCardWrap').hidden;});
  ok(noTip,'no Keepers card while only shades stand',noTip);

  ok(!errs.length,'no page errors',errs);
  await b.close();
  if(fails.length){console.log('FAIL keepers:\n - '+fails.join('\n - ')); process.exit(1);}
  console.log('keepers ok');
})();
