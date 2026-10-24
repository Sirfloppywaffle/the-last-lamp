// Saltmouth (Expansion 3, step 2): the walkable square above the stair.
// - The front door: Walk Saltmouth beside Descend on the title; Start in Saltmouth is off by default, a setting turns it on.
// - Pixel art (0.4): every Keeper's frames are 16 by 24, fully opaque or fully clear (no anti-aliasing), outlined dark,
//   different for each kit; the canvas is a whole number of device pixels to an art pixel and never smoothed.
// - Light: the square is dark except where something warm burns; the Head-frame and the braziers carve it out.
// - Walking: a tap walks there over open ground (never through anything solid); hold and drag steers; walls stop you.
// - The Head-frame: its button shows on the deck, opens the same Roster as Descend; Back keeps you in the town; descending
//   closes the town and starts the run as newRun() always has. A saved run is asked about, never lost by one tap.
// - Saving: ll-town keeps where you stood and the setting; developer mode never writes it (rule 24); no other key changes.
// - Frame time on a folded Fold, Full and Lite, with the CPU slowed four times; Lite is lighter.
// - Taught (rule 23): a first-visit card (dismissed on click), a TIPS entry, a rules line.
const {chromium}=require('playwright');
const fails=[]; const ok=(cond,msg,detail)=>{if(!cond)fails.push(msg+(detail!==undefined?' '+JSON.stringify(detail).slice(0,700):''));};
const shots=process.argv[3]||'.';
(async()=>{
  const b=await chromium.launch();
  const ctx=await b.newContext({viewport:{width:412,height:860},deviceScaleFactor:2.625,hasTouch:true,isMobile:true});
  const p=await ctx.newPage();
  await p.goto('file://'+process.argv[2]); await p.waitForTimeout(400);
  const keys=['ll-save-v2','ll-meta','ll-best','ll-codex','ll-maps','ll-dev','ll-gfx-lite'];
  const snapKeys=()=>p.evaluate(ks=>ks.map(k=>localStorage.getItem(k)),keys);

  /* the front door */
  const front=await p.evaluate(()=>{
    const d=document.getElementById('descendBtn'), w=document.getElementById('townBtn');
    return {next:d.nextElementSibling===w, shown:!!w.offsetParent, h:w.getBoundingClientRect().height, town:localStorage.getItem('ll-town'),
      overlay:document.getElementById('townOverlay').hidden, start:__t.townData().startInTown};});
  ok(front.next&&front.shown&&front.h>=44,'Walk Saltmouth sits beside Descend, big enough for a thumb',front);
  ok(front.overlay&&front.start===false&&front.town===null,'the title is the front door: Start in Saltmouth is off, and nothing is written yet',front);

  /* the art */
  const art=await p.evaluate(()=>{
    const S=__t.townSprites(), out={kits:Object.keys(S), sizes:true, alpha:true, outline:true, distinct:true, frames:0, heads:true};
    for(const k in __t.TOWN_KITS)for(const f of ['d','u','r'])if(__t.TOWN_KITS[k].head[f].length!==12||__t.TOWN_KITS[k].head[f].some(r=>r.length!==16))out.heads=false;
    const sig={};
    for(const k in S)for(const f in S[k])for(const fr of S[k][f]){
      out.frames++; const c=fr.c; if(c.width!==16||c.height!==24)out.sizes=false;
      const d=c.getContext('2d').getImageData(0,0,16,24).data; let s='';
      for(let i=0;i<d.length;i+=4){if(d[i+3]!==0&&d[i+3]!==255)out.alpha=false; s+=d[i+3]?d[i]+','+d[i+1]+','+d[i+2]+';':'.';}
      /* every opaque pixel on the edge of the figure is the dark outline */
      for(let y=0;y<24;y++)for(let x=0;x<16;x++){const i=(y*16+x)*4; if(!d[i+3])continue;
        const edge=x===0||x===15||y===0||y===23||!d[i-4+3]||!d[i+4+3]||!d[i-64+3]||!d[i+64+3];
        if(edge&&(d[i]>12||d[i+1]>12||d[i+2]>16))out.outline=false;}
      if(f==='d'&&fr===S[k][f][0])sig[k]=s;
    }
    const v=Object.values(sig); out.distinct=new Set(v).size===v.length;
    return out;});
  ok(art.kits.length===5&&art.frames===60&&art.sizes&&art.heads,'five Keepers, four facings, three steps, each 16 by 24',art);
  ok(art.alpha,'no anti-aliasing: every pixel of every Keeper is fully there or not at all',art);
  ok(art.outline,'every Keeper has a dark outline',art);
  ok(art.distinct,'each Keeper looks different',art);

  /* into the town */
  await p.click('#townBtn'); await p.waitForTimeout(500);
  const inT=await p.evaluate(()=>{const T=__t.TWN, cv=document.getElementById('townCv'), r=cv.getBoundingClientRect();
    return {on:T.on, shown:!document.getElementById('townOverlay').hidden, k:T.k, dpr:T.dpr, W:cv.width, cssW:r.width, H:cv.height, cssH:r.height,
      smooth:T.ctx.imageSmoothingEnabled, buf:T.bc.imageSmoothingEnabled, card:!document.getElementById('townCardWrap').hidden, kit:T.kit, tile:16*T.k/T.dpr};});
  ok(inT.on&&inT.shown&&!inT.card,'Walk Saltmouth opens the square (tips off: no card)',inT);
  ok(Number.isInteger(inT.k)&&inT.W===Math.round(inT.cssW*inT.dpr)&&inT.H===Math.round(inT.cssH*inT.dpr)&&!inT.smooth&&!inT.buf,'integer scale, never smoothed',inT);
  ok(inT.tile>=40&&inT.tile<=64,'a tile is thumb-sized, about 48 CSS px',inT);
  ok(inT.kit==='lamplighter','a first visit walks the Lamplighter',inT);

  /* the light: bright by the Head-frame's braziers, dark out on the south road */
  /* two patches of 2 by 2 tiles in one frame: the cobbles between the braziers, and bare earth by the cliff, far from any light */
  const lit=await p.evaluate(()=>{const T=__t.TWN, P=T.p; P.x=12; P.y=14; T.cx=null; __t.townFrame(1/30);
    const lum=(wx,wy)=>{const d=T.bc.getImageData(wx*16-Math.round(T.cx),wy*16-Math.round(T.cy),32,32).data; let s=0; for(let i=0;i<d.length;i+=4)s+=d[i]*.3+d[i+1]*.59+d[i+2]*.11; return s/(d.length/4);};
    return {sq:+lum(11,12).toFixed(1),dark:+lum(4,18).toFixed(1)};});
  ok(lit.sq>lit.dark*3,'the square is lit, the earth far from any fire is dark',lit);
  await p.screenshot({path:shots+'/town-square.png'});

  /* tap to walk: a path round the solid things, and the feet never stand in one */
  const walk=await p.evaluate(()=>{const T=__t.TWN, P=T.p; P.x=12; P.y=14; T.path=null; T.goal=null; T.ptr=null;
    const out={};
    __t.townTapTile(20,13); out.path=!!(T.path&&T.path.length);
    let bad=0; for(let i=0;i<200&&T.path;i++){__t.townStep(.05); if(!__t.townFree(P.x,P.y))bad++;}
    out.at=[+P.x.toFixed(2),+P.y.toFixed(2)]; out.bad=bad; out.arrived=Math.hypot(P.x-20.5,P.y-13.5)<.1;
    /* round the Head-frame: from below it to the north side of the square */
    P.x=12; P.y=13.5; __t.townTapTile(12,6);
    for(let i=0;i<300&&T.path;i++){__t.townStep(.05); if(!__t.townFree(P.x,P.y))bad++;}
    out.north=Math.hypot(P.x-12.5,P.y-6.5)<.1; out.bad2=bad;
    /* a tap on a building walks to the nearest open ground beside it */
    __t.townTapTile(20,9); for(let i=0;i<300&&T.path;i++)__t.townStep(.05);
    out.house=[+P.x.toFixed(2),+P.y.toFixed(2)]; out.houseOk=__t.townFree(P.x,P.y)&&Math.hypot(P.x-20.5,P.y-9.5)<2.6;
    out.face=P.face;
    return out;});
  ok(walk.path&&walk.arrived&&walk.bad===0,'a tap walks there, never through anything solid',walk);
  ok(walk.north&&walk.bad2===0,'the walk goes round the Head-frame',walk);
  ok(walk.houseOk,'a tap on a building walks to the open ground nearest it',walk);

  /* hold and drag: a real touch-like pointer, held then dragged right, steers; a wall stops you */
  await p.evaluate(()=>{const T=__t.TWN; T.p.x=12; T.p.y=14; T.path=null; T.cx=null;});
  const box=await p.locator('#townCv').boundingBox(), sx=box.x+box.width/2, sy=box.y+box.height*.7;
  await p.mouse.move(sx,sy); await p.mouse.down(); await p.waitForTimeout(320);
  await p.mouse.move(sx+60,sy,{steps:4}); await p.waitForTimeout(600);
  const steer=await p.evaluate(()=>({x:__t.TWN.p.x, steer:!!(__t.TWN.ptr&&__t.TWN.ptr.steer), face:__t.TWN.p.face}));
  await p.screenshot({path:shots+'/town-steer.png'});
  await p.mouse.up();
  ok(steer.steer&&steer.x>12.8&&steer.face==='r','hold and drag steers the Keeper',steer);
  const wall=await p.evaluate(()=>{const T=__t.TWN, P=T.p; P.x=8.5; P.y=13; T.path=null;
    T.ptr={id:1,x0:0,y0:0,x:0,y:-80,t0:0,steer:true}; for(let i=0;i<80;i++)__t.townStep(.05); T.ptr=null;
    return {y:+P.y.toFixed(2), free:__t.townFree(P.x,P.y)};});
  ok(wall.free&&wall.y>5.9&&wall.y<6.5,'steering north stops at the cemetery fence, never inside it',wall);
  const tap=await p.evaluate(()=>{const T=__t.TWN; T.p.x=12; T.p.y=14; T.cx=null; __t.townFrame(0); return true;});
  const tpt=await p.evaluate(()=>{const T=__t.TWN, k=T.k/T.dpr; return {x:(13*16+8-Math.round(T.cx))*k, y:(15*16+8-Math.round(T.cy))*k};});
  await p.touchscreen.tap(box.x+tpt.x,box.y+tpt.y); await p.waitForTimeout(80);
  const tp=await p.evaluate(()=>{const T=__t.TWN, e=T.path&&T.path[T.path.length-1]; return e?[e.x,e.y]:null;});
  ok(tp&&tp[0]===13.5&&tp[1]===15.5,'a quick tap on the screen walks to the tile under it',{tp,tpt});
  /* a slow tap (held 0.4 s, never moved) still walks there; a hold of a second that never moves does nothing */
  await p.evaluate(()=>{const T=__t.TWN; T.path=null; T.p.x=12; T.p.y=14; T.cx=null; __t.townFrame(0);});
  await p.mouse.move(box.x+tpt.x,box.y+tpt.y); await p.mouse.down(); await p.waitForTimeout(400); await p.mouse.up(); await p.waitForTimeout(60);
  const slow=await p.evaluate(()=>{const T=__t.TWN, e=T.path&&T.path[T.path.length-1]; return e?[e.x,e.y]:null;});
  await p.evaluate(()=>{const T=__t.TWN; T.path=null; T.p.x=12; T.p.y=14; T.cx=null; __t.townFrame(0);});
  await p.mouse.down(); await p.waitForTimeout(1000); await p.mouse.up(); await p.waitForTimeout(60);
  const held=await p.evaluate(()=>({path:__t.TWN.path, x:__t.TWN.p.x, y:__t.TWN.p.y}));
  ok(slow&&slow[0]===13.5&&slow[1]===15.5,'a slow tap still walks there',slow);
  ok(!held.path&&held.x===12&&held.y===14,'a long still hold goes nowhere',held);

  /* the Head-frame */
  const hf=await p.evaluate(()=>{const T=__t.TWN, P=T.p; P.x=12; P.y=14; T.path=null; T.ptr=null;
    __t.townTapTile(12,9); const goal=T.goal;
    for(let i=0;i<200&&(T.path||T.goal);i++)__t.townStep(.05);
    return {goal, at:[+P.x.toFixed(2),+P.y.toFixed(2)], btn:!document.getElementById('townAct').hidden,
      modal:!document.getElementById('modal').hidden, title:document.getElementById('mTitle').textContent};});
  ok(hf.goal==='frame'&&hf.modal&&/carries the lamp/.test(hf.title),'a tap on the Head-frame walks to its deck and opens the Roster',hf);
  ok(hf.btn,'the Head-frame’s button shows while you stand on its deck',hf);
  await p.screenshot({path:shots+'/town-roster.png'});
  await p.evaluate(()=>{[...document.querySelectorAll('#mActions button')].find(x=>x.textContent==='Back').click();});
  await p.waitForTimeout(150);
  const back=await p.evaluate(()=>({on:__t.TWN.on, modal:!document.getElementById('modal').hidden}));
  ok(back.on&&!back.modal,'Back from the Roster leaves you in the town',back);
  const before=await snapKeys();
  await p.click('#townAct'); await p.waitForTimeout(150);
  await p.evaluate(()=>{document.querySelector('#mActions button.call').click();}); await p.waitForTimeout(300);
  const run=await p.evaluate(()=>({town:__t.TWN.on, shown:!document.getElementById('townOverlay').hidden, F:!!__t.F, floor:__t.run&&__t.run.floor, kit:__t.run&&__t.run.kit,
    title:document.getElementById('title').hidden, saved:JSON.parse(localStorage.getItem('ll-town'))}));
  ok(!run.town&&!run.shown&&run.F&&run.floor===0&&run.kit==='lamplighter'&&run.title,'Descend the stair closes the town and starts the run on the Cistern',run);
  ok(run.saved&&run.saved.v===1&&Math.abs(run.saved.px-12)<1.2&&Math.abs(run.saved.py-11.6)<.6,'ll-town keeps where you stood',run.saved);

  /* a saved run is asked about from the Head-frame, never thrown away by one tap */
  await p.evaluate(()=>{__t.checkpoint(); document.getElementById('pauseBtn').click();});
  await p.evaluate(()=>{[...document.querySelectorAll('#mActions button')].find(x=>/quit to title/.test(x.textContent)).click();});
  await p.click('#townBtn'); await p.waitForTimeout(200);
  const ask=await p.evaluate(()=>{const T=__t.TWN; T.p.x=12; T.p.y=11.6; __t.townStep(.05); __t.townDescend();
    return {title:document.getElementById('mTitle').textContent, acts:[...document.querySelectorAll('#mActions button')].map(b=>b.textContent), save:!!localStorage.getItem('ll-save-v2')&&localStorage.getItem('ll-save-v2')!=='null'};});
  ok(/still waiting/.test(ask.title)&&ask.acts.join('|')==='Continue|Start a new descent|Stay in Saltmouth'&&ask.save,'with a run saved, the Head-frame asks first',ask);
  await p.evaluate(()=>{[...document.querySelectorAll('#mActions button')].find(x=>x.textContent==='Continue').click();}); await p.waitForTimeout(200);
  const cont=await p.evaluate(()=>({town:__t.TWN.on, F:!!__t.F, phase:__t.F&&__t.F.phase, title:document.getElementById('title').hidden}));
  ok(!cont.town&&cont.F&&cont.title,'Continue from the Head-frame resumes the saved run',cont);

  /* Start in Saltmouth: a setting, kept in ll-town, and the game opens in the town */
  await p.evaluate(()=>{document.getElementById('pauseBtn').click(); [...document.querySelectorAll('#mActions button')].find(x=>/quit to title/.test(x.textContent)).click();});
  await p.click('#settingsBtn'); await p.waitForTimeout(100);
  const lbl0=await p.textContent('#townSetBtn'); await p.click('#townSetBtn'); const lbl1=await p.textContent('#townSetBtn');
  ok(lbl0==='Start in Saltmouth: Off'&&lbl1==='Start in Saltmouth: On','the setting reads Off, then On',{lbl0,lbl1});
  await p.reload(); await p.waitForTimeout(500);
  const boot=await p.evaluate(()=>({on:__t.TWN.on, shown:!document.getElementById('townOverlay').hidden, kept:JSON.parse(localStorage.getItem('ll-town')).startInTown}));
  ok(boot.on&&boot.shown&&boot.kept===true,'with Start in Saltmouth on, the game opens in the town',boot);
  await p.click('#townBack'); await p.waitForTimeout(100);
  const title=await p.evaluate(()=>({on:__t.TWN.on, title:!document.getElementById('title').hidden}));
  ok(!title.on&&title.title,'Title goes back to the title',title);
  await p.evaluate(()=>{const t=JSON.parse(localStorage.getItem('ll-town')); t.startInTown=false; localStorage.setItem('ll-town',JSON.stringify(t));});

  /* rule 24: developer mode never writes ll-town, and no other key changes on a visit */
  await p.reload(); await p.waitForTimeout(400);
  const dev=await p.evaluate(()=>{
    const before=localStorage.getItem('ll-town');
    __t.setDev(true); __t.townReset(); __t.townOpen(); const T=__t.TWN; T.p.x=16; T.p.y=13; __t.townData().startInTown=true; __t.townSave(); __t.townClose();
    __t.townOpen(); __t.townClose();
    const after=localStorage.getItem('ll-town');
    __t.setDev(false); __t.townReset();
    const real=__t.townData();
    return {same:before===after, px:real.px, start:real.startInTown};});
  ok(dev.same&&dev.start===false&&dev.px!==16,'developer mode never writes ll-town; turning it off puts the town back as it was',dev);
  const k0=await snapKeys();
  await p.evaluate(()=>{__t.townOpen(); for(let i=0;i<30;i++)__t.townFrame(1/30); __t.townTapTile(8,13); for(let i=0;i<60;i++)__t.townStep(.05); __t.townClose();});
  const k1=await snapKeys();
  ok(JSON.stringify(k0)===JSON.stringify(k1),'a walk in the town changes no other save key',{k0,k1});
  /* an old or broken ll-town loads: a spot that is solid now puts you back at the square */
  const mig=await p.evaluate(()=>{localStorage.setItem('ll-town',JSON.stringify({v:1,px:12,py:10,startInTown:true,future:{a:1}})); __t.townReset(); const t=__t.townData();
    localStorage.setItem('ll-town','"junk"'); __t.townReset(); const u=__t.townData(); localStorage.removeItem('ll-town'); __t.townReset();
    return {t,u};});
  ok(mig.t.px===12&&mig.t.py===14&&mig.t.startInTown===true&&mig.t.future&&mig.t.future.a===1&&mig.u.v===1&&mig.u.startInTown===false,'ll-town loads old, broken or newer shapes safely',mig);

  /* every Keeper walks the square as the kit last carried */
  for(const k of ['whaler','occultist','galvanist','bellringer']){
    const got=await p.evaluate(k=>{localStorage.setItem('ll-meta',JSON.stringify({lastKit:k,unlocked:[]})); __t.townOpen(); const T=__t.TWN; T.p.x=12; T.p.y=13; T.p.face='d'; T.cx=null; __t.townFrame(1/30); const r=T.kit; return r;},k);
    ok(got===k,'the Keeper in the square is the kit last carried: '+k,got);
    await p.screenshot({path:shots+'/town-'+k+'.png'});
    await p.evaluate(()=>__t.townClose());
  }
  await p.evaluate(()=>localStorage.removeItem('ll-meta'));

  /* taught: the first visit's card, dismissed on click (rule 5), a TIPS entry and a rules line (rule 23) */
  const teach=await p.evaluate(()=>{__t.tutSet({walk:'done',seen:[],off:false}); __t.townOpen();
    const o={card:!document.getElementById('townCardWrap').hidden, text:document.getElementById('townCard').textContent, tip:!!(__t.TIPS.town&&__t.TIPS.town.text),
      rules:/<b>Saltmouth\.<\/b>/.test(document.getElementById('rulesList').innerHTML)};
    /* a press on the card is not a tap on the ground */
    document.getElementById('townCard').dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));
    o.still=!document.getElementById('townCardWrap').hidden;
    return o;});
  await p.screenshot({path:shots+'/town-card.png'});
  await p.click('#townCard');
  const teach2=await p.evaluate(()=>({gone:document.getElementById('townCardWrap').hidden, seen:__t.tut().seen.includes('town')}));
  await p.evaluate(()=>{__t.townClose(); __t.townOpen();});
  const again=await p.evaluate(()=>!document.getElementById('townCardWrap').hidden);
  await p.evaluate(()=>{__t.townClose(); __t.tutSet({walk:'done',seen:[],off:true});});
  ok(teach.card&&/hold and drag/.test(teach.text)&&teach.tip&&teach.rules&&teach.still,'the first visit shows a card; a TIPS entry and a rules line teach it',teach);
  ok(teach2.gone&&teach2.seen&&!again,'the card goes on click and does not come back',{teach2,again});

  /* frame time on a folded Fold (412 × 860 at 2.625), the CPU slowed four times: Full and Lite */
  const cdp=await ctx.newCDPSession(p);
  await p.evaluate(()=>{__t.townOpen(); const T=__t.TWN; T.p.x=12; T.p.y=13; T.cx=null; for(let i=0;i<20;i++)__t.townFrame(1/60);});
  const measure=async lite=>{await p.evaluate(v=>__t.setLite(v),lite);
    await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
    const r=await p.evaluate(()=>{const T=__t.TWN, P=T.p, ms=[]; for(let i=0;i<10;i++)__t.townFrame(1/60);
      for(let i=0;i<180;i++){P.x=8+8*(.5+.5*Math.sin(i/30)); P.y=13; const t0=performance.now(); __t.townFrame(1/60); ms.push(performance.now()-t0);}
      ms.sort((a,b)=>a-b); return {avg:+(ms.reduce((a,b)=>a+b,0)/ms.length).toFixed(2), p95:+ms[Math.floor(ms.length*.95)].toFixed(2), max:+ms[ms.length-1].toFixed(2)};});
    await cdp.send('Emulation.setCPUThrottlingRate',{rate:1}); return r;};
  const full=await measure(false), lite=await measure(true);
  await p.evaluate(()=>__t.setLite(false));
  console.log('frame time, folded Fold 412×860 @2.625, CPU ×4 slower: Full',JSON.stringify(full),'Lite',JSON.stringify(lite));
  ok(full.p95<16,'Full stays well inside a 60 Hz frame on a folded Fold, CPU slowed four times',full);
  ok(lite.avg<=full.avg*1.05,'Lite is no heavier than Full',{full,lite});

  for(const f of fails)console.log('FAIL '+f);
  console.log(fails.length?fails.length+' failed':'town ok');
  await b.close(); process.exit(fails.length?1:0);
})();
