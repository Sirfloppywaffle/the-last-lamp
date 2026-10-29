// Expansion 4, step 1: the build tools (expansion/EXPANSION4_RUNBOOK.md §5).
// - Tap a placed piece in build mode to lift it: it follows the thumb as a ghost; Place, Cancel (exactly back) or Store.
// - Storage (ll-town.store) keeps a piece and what it cost: set down again for nothing; Salvage gives back all of it.
// - Undo takes back the last 10 deeds of this build session (place, move, store, salvage, a Lodge floor or wall), and forgets
//   them when Build closes.
// - Grid / Free (ll-town.free): Free keeps x, y in art pixels beside c, r (the tiles it covers most of); it survives a reload,
//   and a Free piece can't wall off a door either.
// - The Lodge's furniture uses the same tools. Developer mode never writes ll-town (rule 24). Taught: two tips, the rules line.
const {chromium}=require('playwright');
const fails=[]; const ok=(cond,msg,detail)=>{if(!cond)fails.push(msg+(detail!==undefined?' '+JSON.stringify(detail).slice(0,700):''));};
(async()=>{
  const b=await chromium.launch();
  const ctx=await b.newContext({viewport:{width:1280,height:900},deviceScaleFactor:1});
  const p=await ctx.newPage();
  await p.goto('file://'+process.argv[2]); await p.waitForTimeout(400);

  /* 1. an old ll-town loads with nothing stored, on the grid; a broken store or a broken free position is mended */
  const old=await p.evaluate(()=>{
    const fx=__t.townFix({v:1,res:{timber:5,iron:5,tallow:0,curios:0},decos:[{id:'lamp',c:3,r:15}]});
    const bad=__t.townFix({decos:[{id:'lamp',c:3,r:15,x:52,y:240},{id:'lamp',c:5,r:15,x:300,y:243},{id:'fence',c:7,r:15,x:115,y:240},{id:'lamp',c:9,r:15,x:146.5,y:240}],
      store:[{s:'town',id:'lamp',cost:{iron:6,tallow:4}},{s:'town',id:'nope'},{s:'lodge',id:'parquet'},{s:'lodge',id:'chair'},null,'x',{s:'moon',id:'lamp'}],free:'yes'});
    return {store:fx.store,free:fx.free,d:fx.decos[0],bad:bad.decos,bstore:bad.store,bfree:bad.free};
  });
  ok(Array.isArray(old.store)&&!old.store.length&&old.free===false&&old.d.x===undefined,'an old ll-town loads with an empty store, on the grid',old);
  ok(old.bad[0].x===52&&old.bad[0].y===240&&old.bad[1].x===undefined&&old.bad[2].x===undefined&&old.bad[3].x===undefined,
    'a free position is kept only where it matches its tiles (a fence always keeps to the tiles)',old.bad);
  ok(old.bstore.length===2&&old.bstore[0].cost.iron===6&&old.bstore[1].id==='chair'&&old.bstore[1].cost.timber===8&&old.bfree===false,'storage keeps only real pieces, with what they cost',old.bstore);

  /* 2. lift, then Cancel: back exactly where it stood, nothing paid either way */
  await p.evaluate(()=>{localStorage.removeItem('ll-town'); __t.townReset(); const D=__t.townData(); D.res={timber:200,iron:200,tallow:200,curios:20}; __t.townSave();});
  const lift=await p.evaluate(()=>{
    __t.townOpen(); const T=__t.TWN; T.p.x=12; T.p.y=14; T.path=null; __t.townBuildSet(true);
    const o={}; o.place=__t.townPlace('lamp',3,15); const res0=JSON.stringify(__t.townData().res);
    __t.bldTap(3,15); o.lifted=!!T.lift&&T.lift.id==='lamp'; o.clear=!__t.townSolid(3,15); o.art=T.lift&&T.lift.art.length>0;
    o.bar=!document.getElementById('townLiftBar').hidden&&document.getElementById('townTools').hidden;
    __t.bldLiftTo(8*16,13*16); o.moved=T.lift.c===8&&T.lift.r===13;
    __t.townFrame(1/30);
    document.getElementById('townCancel').click();
    const d=__t.townData().decos[0]; o.back=d.c===3&&d.r===15&&d.x===undefined&&__t.townSolid(3,15)&&!T.lift;
    o.paid=JSON.stringify(__t.townData().res)===res0;
    /* a free piece comes back to its very pixel */
    __t.bldSnapSet(true); T.pick='lamp'; T.tapPx=[5*16+13,15*16+11]; __t.bldTap(5,15);
    const f=__t.townData().decos[1]; o.free={x:f.x,y:f.y,c:f.c,r:f.r};
    __t.bldTap(5,15); __t.bldLiftTo(f.x+20,f.y-7); o.fmove=T.lift.x===f.x+20; __t.bldCancel();
    o.fback=f.x===o.free.x&&f.y===o.free.y&&f.c===o.free.c&&f.r===o.free.r;
    /* closing Build or the town with a piece lifted sets it back too */
    __t.bldTap(3,15); __t.townBuildSet(false); o.closeBuild=!T.lift&&__t.townSolid(3,15)&&__t.townData().decos[0].c===3;
    __t.townBuildSet(true); __t.bldTap(3,15); __t.townClose(); o.closeTown=!T.lift&&JSON.parse(localStorage.getItem('ll-town')).decos.some(e=>e.id==='lamp'&&e.c===3&&e.r===15);
    __t.bldSnapSet(false);
    return o;
  });
  ok(lift.place===''&&lift.lifted&&lift.clear&&lift.art&&lift.bar,'a tap on a placed piece lifts it: it blocks nothing, and Place, Cancel and Store take the tray',lift);
  ok(lift.moved&&lift.back&&lift.paid,'lift and Cancel returns it exactly, and nothing is paid',lift);
  ok(lift.free.x===85&&lift.free.c===5&&lift.fmove&&lift.fback,'a free piece lifted and cancelled returns to its pixel',lift);
  ok(lift.closeBuild&&lift.closeTown,'closing Build or the town with a piece lifted puts it back where it stood',lift);

  /* 3. move, store, place from storage, salvage; and Undo takes each back */
  const flow=await p.evaluate(()=>{
    __t.townOpen(); const T=__t.TWN; T.p.x=12; T.p.y=14; T.path=null; __t.townBuildSet(true);
    const D=__t.townData(), snap=()=>JSON.stringify({d:D.decos.map(e=>[e.id,e.c,e.r,e.x,e.y]),s:D.store,r:D.res}), o={}, S=[snap()];
    __t.bldTap(3,15); __t.bldLiftTo(7*16,15*16); o.drop=__t.bldDrop(); o.at=(__t.townDecoAt(7,15)||{}).id; S.push(snap());
    __t.bldTap(7,15); const r0=JSON.stringify(D.res); __t.bldStow(); o.stored=D.store.length===1&&D.store[0].id==='lamp'&&D.store[0].cost.iron===6&&!__t.townDecoAt(7,15);
    o.noRefund=JSON.stringify(D.res)===r0; S.push(snap());
    T.tab='store'; T.pick='lamp'; __t.bldTap(9,16); o.free=JSON.stringify(D.res)===r0&&(__t.townDecoAt(9,16)||{}).id==='lamp'&&!D.store.length&&!T.pick; S.push(snap());
    __t.bldTap(9,16); __t.bldStow(); S.push(snap());
    const iron=D.res.iron, tallow=D.res.tallow; __t.bldSalvage('lamp'); o.salvage=D.res.iron===iron+6&&D.res.tallow===tallow+4&&!D.store.length; S.push(snap());
    o.saved=JSON.parse(localStorage.getItem('ll-town')).res.iron===D.res.iron;
    o.n=T.undo.length;
    const back=[]; for(let i=S.length-2;i>=0;i--){__t.bldUndo(); back.push(snap()===S[i]);}
    o.undo=back; o.empty=!__t.bldUndo()&&document.getElementById('townUndo').disabled;
    /* only the last ten */
    for(let i=0;i<12;i++)__t.townPlace('cobble',2+i,13);
    let u=0; while(__t.bldUndo())u++; o.ten=u; o.left=D.decos.filter(e=>e.id==='cobble').length;
    /* closing Build forgets them */
    __t.townPlace('cobble',3,19); __t.townBuildSet(false); __t.townBuildSet(true); o.forgot=!__t.bldUndo();
    __t.townBuildSet(false); __t.townClose();
    return o;
  });
  ok(flow.drop===''&&flow.at==='lamp','a lifted piece is placed where its ghost is',flow);
  ok(flow.stored&&flow.noRefund,'Store puts it away with what it cost, and pays nothing back',flow);
  ok(flow.free,'a stored piece is set down again for nothing',flow);
  ok(flow.salvage&&flow.saved,'Salvage gives back all it cost, and is saved',flow);
  ok(flow.n===5&&flow.undo.length===5&&flow.undo.every(Boolean)&&flow.empty,'Undo reverses each deed in turn (salvage, store, place from storage, store, move)',flow);
  ok(flow.ten===10&&flow.left===2,'Undo holds the last ten deeds',flow);
  ok(flow.forgot,'closing Build forgets them',flow);

  /* 4. Undo won't put a piece back on you, or take salvage back unpaid */
  const guard=await p.evaluate(()=>{
    __t.townOpen(); const T=__t.TWN; T.p.x=12; T.p.y=14; T.path=null; __t.townBuildSet(true); const D=__t.townData();
    __t.townPlace('lamp',8,16); __t.bldTap(8,16); __t.bldLiftTo(10*16,16*16); __t.bldDrop();
    T.p.x=8.5; T.p.y=16.5; const a=__t.bldUndo(), msg=document.getElementById('townTmsg').textContent;
    T.p.x=12; T.p.y=14; const b2=__t.bldUndo()&&(__t.townDecoAt(8,16)||{}).id==='lamp';
    __t.bldTap(8,16); __t.bldStow(); __t.bldSalvage('lamp'); const keep=D.res.iron; D.res.iron=2; const c=__t.bldUndo(), msg2=document.getElementById('townTmsg').textContent; D.res.iron=keep;
    const c2=__t.bldUndo()&&__t.bldStored('lamp').length===1;
    __t.bldUndo(); __t.townBuildSet(false); __t.townClose();
    return {a,msg,b2,c,msg2,c2};
  });
  ok(!guard.a&&/standing where it stood/.test(guard.msg)&&guard.b2,'Undo will not set a piece back on you; step aside and it does',guard);
  ok(!guard.c&&/You need/.test(guard.msg2)&&guard.c2,'salvage is taken back only if you can pay for it again',guard);

  /* 5. Free placement survives a reload, and the toggle is remembered */
  const fr=await p.evaluate(()=>{
    __t.townOpen(); const T=__t.TWN; T.p.x=12; T.p.y=14; T.path=null; __t.townBuildSet(true); __t.bldSnapSet(true);
    T.pick='brazier'; T.tapPx=[6*16+11,18*16+2]; __t.bldTap(6,18);
    const d=__t.townData().decos.find(e=>e.id==='brazier');
    T.pick='cobble'; T.tapPx=[8*16+11,19*16+2]; __t.bldTap(8,19); const cob=__t.townData().decos.find(e=>e.id==='cobble'&&e.r===19&&e.c===8)||{};
    __t.townBuildSet(false); __t.townClose();
    return {x:d.x,y:d.y,c:d.c,r:d.r,cob:[cob.x,cob.c,cob.r]};
  });
  await p.reload(); await p.waitForTimeout(400);
  const fr2=await p.evaluate(()=>{
    __t.townOpen(); const D=__t.townData(), d=D.decos.find(e=>e.id==='brazier'), A=__t.townArt();
    const o={x:d.x,y:d.y,c:d.c,r:d.r,free:D.free,solid:__t.townSolid(d.c,d.r),prop:A.props.some(q=>q.x===d.x&&q.y===d.y-6),
      light:A.lights.some(L=>L.x===d.x+8&&L.y===d.y+2)};
    __t.townBuildSet(true); o.pressed=document.querySelector('#townTools [data-snap="free"]').getAttribute('aria-pressed');
    __t.townBuildSet(false); __t.townClose(); return o;
  });
  ok(fr.x===6*16+3&&fr.y===18*16+2-8&&fr.c===Math.round(fr.x/16)&&fr.r===Math.round(fr.y/16),'a free tap centres the piece on the thumb to the pixel',fr);
  ok(fr.cob[0]===undefined&&fr.cob[1]===8&&fr.cob[2]===19,'a path keeps to the tiles even in Free',fr);
  ok(fr2.x===fr.x&&fr2.y===fr.y&&fr2.c===fr.c&&fr2.r===fr.r&&fr2.solid&&fr2.prop&&fr2.light,'Free placement survives a reload: drawn at its pixel, solid on its tiles, its light with it',fr2);
  ok(fr2.free===true&&fr2.pressed==='true','Grid / Free is remembered in ll-town',fr2);

  /* 6. a Free piece can't wall off the Head-frame, or the Lodge's door */
  const wall=await p.evaluate(()=>{
    localStorage.removeItem('ll-town'); __t.townReset(); const D=__t.townData(); D.res={timber:500,iron:500,tallow:500,curios:50}; D.free=true;
    __t.townOpen(); const T=__t.TWN; T.p.x=12; T.p.y=14; T.path=null; __t.townBuildSet(true);
    const o={}; o.w=[__t.townPlace('fence',10,11),__t.townPlace('fence',13,11),__t.townPlace('fence',11,12)];
    o.freeCut=__t.townCanPlace('lamp',12,12,12*16,12*16+5);
    o.hangDeck=__t.townCanPlace('lamp',12,12,12*16,11*16+9);
    __t.townBuildSet(false);
    __t.townRestoreLodge(); __t.lodgeEnter(); __t.townBuildSet(true);
    for(let x=1;x<=7;x++)o['s'+x]=__t.lodgePlace('shelf',x,5);
    o.lodgeCut=__t.lodgeCanPlace('shelf',8,5,8*16,5*16+4);
    o.lodgeGrid=__t.lodgeCanPlace('shelf',8,5);
    o.overWall=__t.lodgeCanPlace('chair',8,4,8*16+6,4*16);
    o.overlap=__t.lodgeCanPlace('chair',7,4,7*16,4*16+9);
    return o;
  });
  ok(wall.w.every(x=>x==='')&&/wall off/.test(wall.freeCut),'a free piece that would wall off the Head-frame is refused',wall);
  ok(/deck/.test(wall.hangDeck),'a free piece may not hang over the deck',wall);
  ok([1,2,3,4,5,6,7].every(x=>wall['s'+x]==='')&&/wall off the door/.test(wall.lodgeCut)&&/wall off the door/.test(wall.lodgeGrid),'a free piece that would wall off the Lodge door is refused',wall);
  ok(/no floor/.test(wall.overWall)&&/already/.test(wall.overlap),'a free piece fits only over the floor and clear of other pieces',wall);

  /* 7. the Lodge: lift, store and set down furniture; a floor laid is undone with its cost */
  const lodge=await p.evaluate(()=>{
    const T=__t.TWN, D=__t.townData(), o={}; D.free=false;
    const sh=D.lodge.furn.find(e=>e.c===4&&e.r===5);
    __t.bldTap(4,5); o.lifted=T.lift&&T.lift.d===sh&&!__t.lodgeAt(4,5);
    __t.bldStow(); o.stored=__t.bldStored('shelf').length===1&&D.store[0].s==='lodge';
    T.tab='store'; T.pick='shelf'; __t.bldTap(4,6); o.placed=(__t.lodgeAt(4,6)||{}).id==='shelf'&&!__t.bldStored().length;
    T.tab='pieces'; T.pick=null; __t.townTrayUI();
    const t0=D.res.timber; document.querySelector('#townTrow [data-lodge="parquet"]').click(); o.laid=D.lodge.floor==='parquet'&&D.res.timber===t0-20;
    __t.bldUndo(); o.unlaid=D.lodge.floor==='planks'&&D.res.timber===t0;
    __t.townBuildSet(false); __t.lodgeLeave();
    /* town storage stays in the town: the Lodge's Storage shows only the Lodge's */
    __t.townBuildSet(true); __t.bldTap(10,11); __t.bldStow(); __t.townBuildSet(false); __t.lodgeEnter(); __t.townBuildSet(true);
    T.tab='store'; __t.townTrayUI(); o.split=__t.bldStored().length===0&&document.getElementById('townStoreN').textContent==='0';
    __t.townBuildSet(false); __t.lodgeLeave(); __t.townBuildSet(true); T.tab='store'; __t.townTrayUI();
    o.townSide=__t.bldStored('fence').length===1&&!!document.querySelector('#townTrow [data-stored="fence"]');
    __t.townBuildSet(false); __t.townClose();
    return o;
  });
  ok(lodge.lifted&&lodge.stored&&lodge.placed,'the Lodge\'s furniture lifts, stores and is set down again',lodge);
  ok(lodge.laid&&lodge.unlaid,'Undo takes back a floor laid, with its cost',lodge);
  ok(lodge.split&&lodge.townSide,'each scene\'s Storage holds only its own pieces',lodge);

  /* 8. the real UI: a tap lifts, a drag slides the piece (not the Keeper), Place sets it down */
  await p.evaluate(()=>{localStorage.removeItem('ll-town'); __t.townReset(); const D=__t.townData(); D.res={timber:50,iron:50,tallow:50,curios:5}; __t.townSave();
    __t.townOpen(); const T=__t.TWN; T.p.x=12; T.p.y=14; T.path=null; __t.townPlace('lamp',14,14); T.cx=null; __t.townFrame(1/30);
    document.getElementById('townBuild').click(); while(!document.getElementById('townCardWrap').hidden)document.getElementById('townCard').click();});
  const pos=await p.evaluate(()=>{const T=__t.TWN, k=T.k/T.dpr; return {k,x:((14*16+8)-T.lcx)*k,y:((14*16+8)-T.lcy)*k,px:T.p.x,py:T.p.y};});
  await p.mouse.click(pos.x,pos.y); await p.waitForTimeout(60);
  const ui1=await p.evaluate(()=>({lift:!!__t.TWN.lift,bar:!document.getElementById('townLiftBar').hidden}));
  await p.mouse.move(pos.x+5,pos.y+5); await p.mouse.down(); await p.mouse.move(pos.x+5+pos.k*16*2,pos.y+5,{steps:6}); await p.mouse.up();
  for(let i=0;i<10;i++)await p.evaluate(()=>__t.townFrame(1/30));
  const ui2=await p.evaluate(()=>({c:__t.TWN.lift&&__t.TWN.lift.c,r:__t.TWN.lift&&__t.TWN.lift.r,px:__t.TWN.p.x,py:__t.TWN.p.y}));
  await p.click('#townDrop'); await p.waitForTimeout(60);
  const ui3=await p.evaluate(()=>({at:(__t.townDecoAt(16,14)||{}).id,old:__t.townDecoAt(14,14),lift:!!__t.TWN.lift,undo:!document.getElementById('townUndo').disabled}));
  ok(ui1.lift&&ui1.bar,'a tap on a piece lifts it and shows Place, Cancel and Store',ui1);
  ok(ui2.c===16&&ui2.r===14&&ui2.px===pos.px&&ui2.py===pos.py,'a drag slides the lifted piece two tiles, and the Keeper stays put',{ui2,pos});
  ok(ui3.at==='lamp'&&!ui3.old&&!ui3.lift&&ui3.undo,'Place sets it down there, and Undo is ready',ui3);
  /* Free: the same drag slides it to the pixel */
  await p.click('#townTools [data-snap="free"]');
  await p.evaluate(()=>{__t.TWN.cx=null; __t.townFrame(1/30);});
  const pos2=await p.evaluate(()=>{const T=__t.TWN, k=T.k/T.dpr; return {k,x:((16*16+8)-T.lcx)*k,y:((14*16+8)-T.lcy)*k};});
  await p.mouse.click(pos2.x,pos2.y); await p.waitForTimeout(60);
  await p.mouse.move(pos2.x,pos2.y); await p.mouse.down(); await p.mouse.move(pos2.x+pos2.k*5,pos2.y-pos2.k*3,{steps:4}); await p.mouse.up();
  await p.click('#townDrop'); await p.waitForTimeout(60);
  const ui4=await p.evaluate(()=>{const d=__t.townData().decos.find(e=>e.id==='lamp'); return {x:d.x,y:d.y,c:d.c,r:d.r,free:__t.townData().free};});
  ok(ui4.free&&ui4.x===16*16+5&&ui4.y===14*16-3&&ui4.c===16&&ui4.r===14,'in Free a drag moves it to the art pixel',ui4);
  await p.evaluate(()=>{__t.townBuildSet(false); __t.townClose();});

  /* 9. developer mode lifts, stores, salvages, toggles and undoes without writing ll-town (rule 24) */
  const dev=await p.evaluate(()=>{
    const before=localStorage.getItem('ll-town');
    __t.setDev(true); __t.townReset(); __t.townOpen(); const T=__t.TWN; T.p.x=12; T.p.y=14; T.path=null; __t.townBuildSet(true);
    const d=__t.townData().decos.find(e=>e.id==='lamp');
    __t.bldTap(d.c,d.r); __t.bldLiftTo(5*16,15*16); __t.bldDrop(); __t.bldTap(5,15); __t.bldStow(); __t.bldSalvage('lamp'); __t.bldUndo();
    __t.bldSnapSet(false); __t.townPlace('fence',3,15); __t.townBuildSet(false); __t.townClose();
    const after=localStorage.getItem('ll-town');
    __t.setDev(false); __t.townReset(); const real=__t.townData();
    return {same:before===after,free:real.free,lamp:real.decos.some(e=>e.id==='lamp'&&e.x===16*16+5),store:real.store.length};
  });
  ok(dev.same&&dev.free===true&&dev.lamp&&dev.store===0,'developer mode never writes ll-town, and the real town comes back as it was',dev);

  /* 10. taught: two town tips, one build card at a time, and the rules line */
  const teach=await p.evaluate(()=>{
    const L=__t.TIPS.townlift, F=__t.TIPS.townfree;
    localStorage.setItem('ll-tut',JSON.stringify({walk:'done',seen:['town','townhaul','townbuild'],off:false}));
    __t.townOpen(); __t.townBuildSet(true); const first=__t.TWN.card;
    document.getElementById('townCard').click(); const then=__t.TWN.card;
    __t.townBuildSet(false); __t.townBuildSet(true); const next=__t.TWN.card;
    document.getElementById('townCard').click(); __t.townBuildSet(false); __t.townClose();
    localStorage.setItem('ll-tut',JSON.stringify({walk:'done',seen:[],off:true}));
    return {L:L&&L.where==='town'&&/lift/.test(L.text)&&/Salvage/.test(L.text)&&/Undo/.test(L.text),F:F&&F.where==='town'&&/Free/.test(F.text),first,then,next,
      rules:document.getElementById('rulesList').textContent};
  });
  ok(teach.L&&teach.F,'tips for lifting and storing, and for Grid / Free',teach);
  ok(teach.first==='townlift'&&!teach.then&&teach.next==='townfree','one build card each time Build opens, never two in a row',teach);
  ok(/lift it/.test(teach.rules)&&/Salvage/.test(teach.rules)&&/Undo/.test(teach.rules)&&/Free wherever/.test(teach.rules),'the Saltmouth rules line teaches the tools',teach.rules.slice(0,100));

  for(const f of fails)console.log('FAIL '+f);
  console.log(fails.length?fails.length+' failed':'buildtools ok');
  await b.close(); process.exit(fails.length?1:0);
})();
