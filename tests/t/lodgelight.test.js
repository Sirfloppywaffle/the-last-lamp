// Saltmouth, Expansion 4, step 5: light and dark indoors; boss trophies.
// - A room is dark until you light it: its dark lifts with the warm light in it (its own sconces, cold until lit, and every
//   piece that burns, which comes down lit and can be put out). A room with no lights is darker; the state is saved.
// - Each light throws the shadows of what stands near it, and what has a light behind it stands dark against it.
// - The Stone Fireplace: the Lodge's brightest light, its fire a loop with a still.
// - Trophies (k: 'trophy'): one per boss put down on the stair, carried up with the haul; only for bosses beaten; one of each;
//   a tap shows its Grimoire line; the Keeper Below's rumbles. The codex never changes; developer mode never writes.
const {chromium}=require('playwright');
const fails=[]; const ok=(c,m,d)=>{if(!c)fails.push(m+(d!==undefined?' '+JSON.stringify(d).slice(0,700):''));};
(async()=>{
  const b=await chromium.launch(); const p=await b.newPage({viewport:{width:412,height:860}});
  const errs=[]; p.on('pageerror',e=>errs.push(String(e)));
  await p.goto('file://'+process.argv[2]); await p.waitForTimeout(300);

  /* a real town with the Lodge and its rooms; trophies as given (null: the field left out, as an old save) */
  const setup=`(tr)=>{localStorage.removeItem('ll-town'); localStorage.removeItem('ll-best'); __t.townReset(); __t.setDev(false); __t.townOpen();
    const D=__t.townData(); D.res={timber:900,iron:900,tallow:900,curios:90}; __t.townRestoreLodge(); D.res={timber:900,iron:900,tallow:900,curios:90};
    D.lodge.rooms.cellar.built=true; D.lodge.rooms.attic.built=true; D.free=false; if(tr!==undefined)D.trophies=tr; __t.lodgeEnter();
    while(!document.getElementById('townCardWrap').hidden)document.getElementById('townCard').click(); __t.TWN.p.x=5; __t.TWN.p.y=8.4; return D;}`;

  /* 1. the data: the fireplace (a light that burns, with its fire's loop), two trophies of one kind, each on its boss */
  const d=await p.evaluate(()=>{const T=__t, I=T.LODGE_ITEMS, o={};
    o.hearth=I.hearth&&[I.hearth.k,I.hearth.set,I.hearth.light,I.hearth.w,!!T.LODGE_FIRE.hearth,T.LODGE_FIRE.hearth.f.length];
    /* it turns: four facings drawn (east the west mirrored), on its side a tile across and two deep, every view as tall as the front */
    const H=T.LODGE_ROWS.hearth; o.turns=[I.hearth.faces,Object.keys(H).join(),H[2][0].length,H[2].length,H[4][0].length,H[4].length,H[0].length];
    o.foot=[0,2,4,6].map(f=>{const P=T.pieceFoot(I.hearth,f); return P.w+'x'+P.h;}).join();
    const F=T.LODGE_FIRE.hearth, rows=T.LODGE_ROWS.hearth[0]; o.still=F.f[0].every((r,i)=>rows[F.y+i].slice(F.x,F.x+r.length)===r);
    o.trophies=T.TROPHY_KEYS.map(k=>[k,I[k].k,I[k].set,I[k].foe,!!I[k].mount,Object.keys(I[k].cost).length]);
    o.foes=T.TROPHY_KEYS.every(k=>T.LORE[I[k].foe]&&T.TROPHY_TEXT[k]);
    o.letters=T.TROPHY_KEYS.concat(['hearth']).every(k=>T.LODGE_ROWS[k][0].every(r=>[...r].every(ch=>ch==='.'||T.PX[ch])));
    o.size=T.TROPHY_KEYS.concat(['hearth']).map(k=>[k,T.LODGE_ROWS[k][0][0].length,T.LODGE_ROWS[k][0].length]);
    o.rooms=Object.keys(T.LODGE_ROOMS).map(m=>{const R=T.LODGE_ROOMS[m]; return R.night>R.dim&&R.night<.83;});
    return o;});
  ok(d.hearth&&d.hearth.join()==='furn,rooms,52,2,true,5'&&d.still,'the Stone Fireplace: two tiles, the brightest light, its fire a loop whose first frame is its still',d);
  ok(d.turns.join()==='4,0,2,4,13,30,28,30,30'&&d.foot==='2x1,1x2,2x1,1x2','the fireplace turns: front, side and back drawn, 1 by 2 on its side, every view as tall as the front',d);
  ok(d.trophies.map(x=>x.join()).join(';')==='keeper,trophy,trophy,boss,true,0;primordial,trophy,trophy,boss2,false,0'&&d.foes,'two trophies of one kind (k: trophy): the Keeper Below’s on the wall, the Primordial’s on a plinth, each free and each with a Grimoire line',d.trophies);
  ok(d.letters&&d.size.every(([k,w,h])=>w<=(k==='hearth'?32:16)&&h<=32),'every pixel a PX letter, 16 wide a tile',d.size);
  ok(d.rooms.every(Boolean),'every room is darker unlit than lit, and lighter than the square’s night (0.83)',d.rooms);

  /* 2. dark until you light it: an empty room sits at its night; its own sconces are cold; each light lifts the dark; a room with
     no lights is darker than one with them, on screen as well as in its numbers */
  const dk=await p.evaluate(`(()=>{const T=__t, D=(${setup})(), o={}, L=T.lodgeRoom(), R=T.LODGE_ROOMS.main;
    const shot=()=>{T.TWN.cx=null; for(let i=0;i<3;i++)T.townFrame(1/30); const c=document.getElementById('townCv'), x=c.getContext('2d'), w=c.width, h=c.height, g=x.getImageData(0,0,w,h).data; let s=0; for(let i=0;i<g.length;i+=4)s+=g[i]+g[i+1]+g[i+2]; return s/(g.length/4);};
    T.TWN.p.x=5; T.TWN.p.y=8.4;
    let A=T.lodgeArt(); o.empty=[A.dark,A.lights.length,(L.sconces||[]).length]; o.b0=shot();
    o.label=T.lodgeActLabel(T.LODGE_SCONCE_ACT.main[0]);
    T.lodgeToggle(T.LODGE_SCONCE_ACT.main[0]); A=T.lodgeArt(); o.one=[A.dark,A.lights.length,L.sconces.join()];
    T.lodgeToggle(T.LODGE_SCONCE_ACT.main[1]); T.lodgePlace('hearth',2,5); T.lodgePlace('floorlamp',8,5);
    A=T.lodgeArt(); o.lit=[A.dark,A.lights.length,+A.warm.toFixed(2)]; o.b1=shot();
    /* every light out: back to its night */
    for(const d of L.furn)if(T.LODGE_ITEMS[d.id].light&&!d.out)T.lodgeToggle(T.lodgeActOf(d));
    T.lodgeToggle(T.LODGE_SCONCE_ACT.main[0]); T.lodgeToggle(T.LODGE_SCONCE_ACT.main[1]);
    A=T.lodgeArt(); o.out=[A.dark,A.lights.length,L.furn.filter(d=>d.out).map(d=>d.id).join()];
    /* a snuffed piece draws its flame as soot and glows not at all */
    const on=T.lodgeFA('hearth',0,null), off=T.lodgeFA('hearth',0,null,true); o.art=[!!on.em,!!on.fr,!!off.em,!!off.fr,off.out];
    o.night=R.night; o.dim=R.dim;
    return o;})()`);
  ok(Math.abs(dk.empty[0]-dk.night)<1e-9&&dk.empty[1]===0&&dk.empty[2]===0,'an empty room is at its night: no light, its sconces cold',dk);
  ok(dk.label==='Light the sconce','a cold sconce offers to be lit',dk.label);
  ok(dk.one[0]<dk.empty[0]&&dk.one[1]===1&&dk.one[2]==='0','a lit sconce lights the room and lifts the dark',dk.one);
  ok(dk.lit[0]<dk.one[0]&&Math.abs(dk.lit[0]-dk.dim)<1e-9&&dk.lit[1]===4,'two sconces, a fireplace and a lamp: as light as the room gets',dk.lit);
  ok(dk.b1>dk.b0*1.25,'a room with no lights is darker on screen',[dk.b0,dk.b1]);
  ok(Math.abs(dk.out[0]-dk.night)<1e-9&&dk.out[1]===0&&dk.out[2].split(',').sort().join()==='floorlamp,hearth','put out, every light goes and the room is as dark as it was',dk.out);
  ok(dk.art.join()==='true,true,false,false,true','put out, a fire is soot: nothing glows and nothing moves',dk.art);

  /* 3. saved: what is lit and what is out survives a reload (a candle on a desk too); a new piece comes down lit; a cold room in an
     old save loads cold; a stored lamp comes back lit */
  const sv=await p.evaluate(`(()=>{const T=__t, D=(${setup})(), o={}, L=T.lodgeRoom();
    T.lodgeToggle(T.LODGE_SCONCE_ACT.main[1]); T.lodgePlace('hearth',2,5); T.lodgePlace('desk',6,6);
    const dk=L.furn.find(d=>d.id==='desk'); T.lodgePlaceSmall('candle',...T.lodgeSlotPoint(dk,0)); T.lodgePlaceSmall('candle',...T.lodgeSlotPoint(dk,1));
    o.fresh=[L.furn.find(d=>d.id==='hearth').out,dk.on.map(q=>q.out).join()];
    T.lodgeToggle(T.lodgeActOf(L.furn.find(d=>d.id==='hearth'))); T.lodgeToggle(T.lodgeActOf(dk.on[1],dk));
    T.lodgeGo('cellar'); T.lodgeToggle(T.LODGE_SCONCE_ACT.cellar[0]); T.lodgeGo('main');
    T.townSave(); T.townReset(); const S=T.townData();
    o.saved=[S.lodge.sconces.join(),S.lodge.rooms.cellar.sconces.join(),S.lodge.rooms.attic.sconces.join(),S.lodge.furn.find(d=>d.id==='hearth').out,S.lodge.furn.find(d=>d.id==='desk').on.map(q=>q.id+(q.out?'!':'')).join()];
    /* an old save: no sconces field, a lamp with a stray out on something that does not burn */
    localStorage.setItem('ll-town',JSON.stringify({v:1,lodge:{built:true,floor:'planks',wall:'damp',furn:[{id:'floorlamp',c:2,r:5},{id:'chair',c:4,r:5,out:true}]}}));
    T.townReset(); const O=T.townData(); o.old=[O.lodge.sconces.join(),O.lodge.furn.map(d=>d.id+(d.out?'!':'')).join()];
    return o;})()`);
  ok(sv.fresh[0]===undefined&&sv.fresh[1]===',','a new piece comes down lit',sv.fresh);
  ok(sv.saved.join('|')==='1|0||true|candle,candle!','which sconces are lit in each room, a fireplace put out and a candle put out are saved',sv.saved);
  ok(sv.old.join('|')==='|floorlamp,chair','an old Lodge loads with its sconces cold and its lamp lit; out only on what burns',sv.old);

  /* 4. tap a light outside Build: you walk to it, the button offers it, and a tap on the button lights it */
  const tap=await p.evaluate(`(()=>{const T=__t, D=(${setup})(), o={}, W=T.TWN;
    T.lodgeArt(); const x=19+3, y=12; W.tapPx=[x,y]; T.lodgeTapTile(1,0); W.tapPx=null;
    o.goal=!!(W.goal&&W.goal.lact&&W.goal.sconce===0); o.path=!!W.path;
    for(let i=0;i<200&&(W.path||W.goal);i++)T.townFrame(1/30);
    o.lit=T.lodgeRoom().sconces.join();
    /* again, from where you stand: now it puts it out (the button reads so first) */
    for(let i=0;i<3;i++)T.townFrame(1/30); const act=document.getElementById('townAct'); o.label=act.textContent; o.shown=!act.hidden;
    act.click(); o.after=T.lodgeRoom().sconces.join();
    return o;})()`);
  ok(tap.goal&&tap.path&&tap.lit==='0','a tap on a cold sconce walks you there and lights it',tap);
  ok(tap.shown&&tap.label==='Put out the sconce'&&tap.after==='','standing at it, the button puts it out',tap);

  /* 5. shadows: each light throws what stands near it across the floor away from it, and what has a light behind it stands dark;
     nothing to throw, no layer; computed only when the room changes */
  const sh=await p.evaluate(`(()=>{const T=__t, D=(${setup})(), o={}, L=T.lodgeRoom();
    T.lodgePlace('floorlamp',4,4); T.lodgePlace('chest',4,6);
    let A=T.lodgeArt(); const at=(x,y)=>A.sil?A.sil.getContext('2d').getImageData(x,y,1,1).data[3]:0;
    /* the lamp stands on tile (4,4), the chest on (4..5,6): its shadow falls south of it, and nothing north of the lamp */
    let below=0, above=0; for(let y=112;y<150;y++)for(let x=64;x<96;x++)below+=at(x,y)>0?1:0; for(let y=34;y<46;y++)for(let x=64;x<80;x++)above+=at(x,y)>0?1:0;
    o.shadow=[!!A.sil,below,above];
    /* backlit: some of the chest's own pixels are dark, its top row is not */
    const a=T.lodgeFA('chest',0,null), R=T.pieceRect(L.furn.find(d=>d.id==='chest'),T.LODGE_ITEMS.chest), cx=R.x+a.dx, cy=R.y+a.dy;
    let sil=0; for(let y=cy+3;y<cy+a.cv.height;y++)for(let x=cx;x<cx+a.cv.width;x++)sil+=at(x,y)>0?1:0; o.sil=sil;
    const s0=A.sil; T.townFrame(1/30); T.townFrame(1/30); o.same=T.lodgeArt().sil===s0;
    T.lodgeToggle(T.lodgeActOf(L.furn.find(d=>d.id==='floorlamp'))); A=T.lodgeArt(); o.none=A.sil;
    return o;})()`);
  ok(sh.shadow[0]&&sh.shadow[1]>30&&sh.shadow[2]===0,'a lamp throws the chest’s shadow away from it, onto the floor beyond',sh.shadow);
  ok(sh.sil>10,'the chest, with the lamp behind it, stands dark against it',sh.sil);
  ok(sh.same&&sh.none===null,'made once while nothing changes; no light, no shadow',sh);

  /* 6. trophies only for bosses beaten. A town with none: the tray shows them shut and says what earns them; a Herald earns
     nothing; the Keeper Below put down earns its trophy, which comes up with the haul even if the lamp goes out after */
  const tr=await p.evaluate(`(()=>{const T=__t, D=(${setup})([]), o={};
    o.none=[T.trophyEarned('keeper'),T.lodgeLockWhy('keeper'),T.lodgeCanPlace('keeper',3,0),T.lodgeCanPlace('primordial',2,4)];
    T.townBuildSet(true); while(!document.getElementById('townCardWrap').hidden)document.getElementById('townCard').click();
    T.TWN.set='trophy'; T.townTrayUI(); const ch=[...document.querySelectorAll('#townTrow [data-lodge]')];
    o.chips=[ch.map(c=>c.dataset.lodge).join(),ch.every(c=>c.classList.contains('locked')),document.querySelectorAll('#townTrow img.town-lock').length];
    ch[0].click(); o.say=document.getElementById('townTmsg').textContent; o.pick=T.TWN.pick; T.townBuildSet(false);
    T.townClose();
    T.newRun('lamplighter',0);
    const foe=(type,def)=>({dead:false,hp:0,x:2,y:2,gate:0,d:1,type,def:Object.assign({ess:10,oil:1,r:.3,col:'200,180,120'},def)});
    T.killFoe(foe('lastkeeper',{n:'The Last Keeper',herald:true})); o.herald=(T.run.trophies||[]).join();
    T.killFoe(foe('boss',{n:'The Keeper Below',boss:true})); o.run=(T.run.trophies||[]).join();
    T.haulCredit(T.run); o.town=T.townData().trophies.join(); o.left=(T.run.trophies||[]).join();
    o.twice=T.haulCredit(T.run);
    return o;})()`);
  ok(tr.none[0]===false&&/Slay the Keeper Below/.test(tr.none[1])&&tr.none[2]===tr.none[1]&&/Primordial/.test(tr.none[3]),'not yet earned: it can’t be set down, and says what earns it',tr.none);
  ok(tr.chips[0]==='keeper,primordial'&&tr.chips[1]&&tr.chips[2]===2&&/Slay/.test(tr.say)&&tr.pick===null,'the tray’s trophy page shows them shut, padlocked',tr);
  ok(tr.herald==='','a Herald earns no trophy',tr.herald);
  ok(tr.run==='keeper'&&tr.town==='keeper'&&tr.left===''&&tr.twice===false,'the Keeper Below put down earns its trophy, carried up with the haul once',tr);

  /* 7. one of each, set down for nothing; a second waits where the first is; Store and back; the Primordial's too once won */
  const one=await p.evaluate(`(()=>{const T=__t, D=(${setup})(['keeper','primordial']), o={}, r0=JSON.stringify(D.res);
    o.place=T.lodgePlace('keeper',3,0); o.again=T.lodgeCanPlace('keeper',6,0); o.free=JSON.stringify(T.townData().res)===r0;
    T.lodgeGo('attic'); o.attic=T.lodgeCanPlace('keeper',3,0); T.lodgeGo('main');
    T.townBuildSet(true); const d=T.lodgeRoom().furn.find(e=>e.id==='keeper'); T.bldLift(d); T.bldStow(); o.stored=T.bldStored('keeper').length;
    o.waits=T.lodgeCanPlace('keeper',6,0); o.back=T.bldPlaceStored('keeper',6,0); T.townBuildSet(false);
    o.plinth=T.lodgePlace('primordial',2,4); o.where=[T.trophyWhere('keeper'),T.trophyWhere('primordial')];
    T.townSave(); T.townReset(); o.saved=T.townData().lodge.furn.map(d=>d.id).join();
    /* a saved second copy, or one not earned, goes on loading */
    const S=JSON.parse(localStorage.getItem('ll-town')); S.lodge.furn.push({id:'keeper',c:3,r:0}); S.trophies=['primordial'];
    localStorage.setItem('ll-town',JSON.stringify(S)); T.townReset(); o.tidy=T.townData().lodge.furn.map(d=>d.id).join();
    return o;})()`);
  ok(one.place===''&&one.free,'a trophy earned hangs for nothing',one);
  ok(/here already/.test(one.again)&&/is in the Keeper’s Lodge/.test(one.attic),'one of each: a second says where the first is',one);
  ok(one.stored===1&&/waits in Storage/.test(one.waits)&&one.back==='','it stores like any piece, and comes back from Storage',one);
  ok(one.plinth===''&&one.where.join()==='main,main'&&one.saved==='keeper,primordial','the Primordial’s stands on its plinth; both are saved',one);
  ok(one.tidy==='primordial','loading, a trophy not earned and a second copy are let go',one.tidy);

  /* 8. an old town: no trophies field. ll-best past the fourth floor gives the Keeper Below's; a win both; nothing, none */
  const seed=await p.evaluate(()=>{const T=__t, o={};
    const at=b=>{localStorage.setItem('ll-town',JSON.stringify({v:1})); if(b)localStorage.setItem('ll-best',JSON.stringify(b)); else localStorage.removeItem('ll-best'); T.townReset(); return T.townData().trophies.join();};
    o.none=at(null); o.four=at({floor:4,wins:0}); o.five=at({floor:5,wins:0}); o.won=at({floor:5,wins:1});
    localStorage.setItem('ll-town',JSON.stringify({v:1,trophies:[]})); T.townReset(); o.kept=T.townData().trophies.join();
    localStorage.removeItem('ll-best'); return o;});
  ok(seed.none===''&&seed.four===''&&seed.five==='keeper'&&seed.won==='keeper,primordial'&&seed.kept==='','an old town is given what ll-best shows it did; a saved list stands',seed);

  /* 9. tapping a trophy: its card with its Grimoire line, the Keeper Below's rumbling (through the sound setting) and shaking; on
     its own it rumbles faintly now and then. Nothing is written to the codex */
  const card=await p.evaluate(`(()=>{const T=__t, D=(${setup})(['keeper','primordial']), o={}, W=T.TWN;
    T.lodgePlace('keeper',3,0); T.lodgePlace('primordial',2,4);
    const c0=localStorage.getItem('ll-codex');
    const d=T.lodgeRoom().furn.find(e=>e.id==='keeper'); T.lodgeArt();
    W.tapPx=[3*16+8,14]; T.lodgeTapTile(3,0); W.tapPx=null; o.goal=!!(W.goal&&W.goal.lp===d);
    for(let i=0;i<200&&(W.path||W.goal);i++)T.townFrame(1/30);
    o.modal=!document.getElementById('modal').hidden; o.title=document.getElementById('mTitle').textContent; o.body=document.getElementById('mBody').textContent;
    o.shake=W.shake>0; o.codex=localStorage.getItem('ll-codex')===c0;
    return o;})()`);
  ok(card.goal&&card.modal&&card.title==='The Keeper Below’s Maw'&&/The Grimoire, The Keeper Below: The boss of the fourth floor/.test(card.body),'a tap on a trophy walks you there and shows its Grimoire line',card);
  ok(card.shake&&card.codex,'the Keeper Below’s shakes when tapped; the codex never changes',card);
  await p.waitForTimeout(250);
  const amb=await p.evaluate(()=>{const T=__t, W=T.TWN, o={}; const b=document.querySelector('#mActions button'); if(b)b.click();
    W.card=null; W.shake=0; W.rumT=.05; let n=0; for(let i=0;i<10;i++){T.townStep(1/30); if(W.shake>0)n++;}
    o.ambient=n>0;
    /* the Primordial's room has no rumble */
    return o;});
  ok(amb.ambient,'on its own, now and then, it shakes',amb);

  /* 10. developer mode: every trophy shown, lights lit and put out, nothing written */
  const dev=await p.evaluate(`(()=>{const T=__t; (${setup})([]); T.townSave(); const s0=localStorage.getItem('ll-town'), c0=localStorage.getItem('ll-codex');
    T.setDev(true); T.townReset(); T.townOpen(); T.lodgeEnter(); const o={earned:T.trophyEarned('keeper')&&T.trophyEarned('primordial')};
    o.place=T.lodgePlace('keeper',3,0); T.lodgeToggle(T.LODGE_SCONCE_ACT.main[0]); T.lodgePlace('hearth',2,5);
    T.lodgeToggle(T.lodgeActOf(T.lodgeRoom().furn.find(d=>d.id==='hearth'))); T.townSave(); T.townClose();
    o.same=localStorage.getItem('ll-town')===s0&&localStorage.getItem('ll-codex')===c0;
    T.setDev(false); T.townReset(); o.real=T.townData().lodge.furn.length+'/'+T.townData().lodge.sconces.length;
    return o;})()`);
  ok(dev.earned&&dev.place===''&&dev.same&&dev.real==='0/0','developer mode shows every trophy and lights the room, and writes nothing',dev);

  ok(!errs.length,'no page errors',errs);
  await b.close();
  if(fails.length){for(const f of fails)console.log('FAIL '+f); process.exit(1);}
  console.log('lodgelight: ok');
})();
