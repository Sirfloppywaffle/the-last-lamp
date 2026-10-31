const {chromium}=require('playwright');
const file='file://'+process.argv[2];
const DEV=[
  ['fold-open',832,694,2.6,{}],['fold-open-rot',750,776,2.6,{}],['fold-closed',412,860,2.6,{}],['fold-closed-land',915,356,2.6,{}],
  ['ip-se',375,553,2,{}],['ip-se-land',667,325,2,{}],['ip15',393,659,3,{}],['ip15-land',852,342,3,{top:0,bottom:21,left:59,right:59}],['ipmax-land',932,382,3,{top:0,bottom:21,left:59,right:59}],
  ['android-small',360,560,3,{}],['android-land',740,330,3,{}],['ipad-land',1024,700,2,{}],['ipad-port',768,950,2,{}],['desktop',1440,820,1,{}],
];
(async()=>{
  const b=await chromium.launch(); let bad=0;
  for(const [nm,w,h,dpr,ins] of DEV){
    const ctx=await b.newContext({viewport:{width:w,height:h},deviceScaleFactor:dpr,hasTouch:true,isMobile:dpr>1});
    const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
    const cdp=await ctx.newCDPSession(p);
    try{await cdp.send('Emulation.setSafeAreaInsetsOverride',{insets:Object.assign({top:0,bottom:0,left:0,right:0},ins)});}catch(e){}
    await p.goto(file); await p.waitForTimeout(400);
    /* Saltmouth (Expansion 3): Walk Saltmouth fits on the title; in the town, Title and Descend the stair sit inside the safe
       area, take a thumb and don't overlap; the canvas covers the screen at a whole number of device pixels to an art pixel;
       a tile is 40 to 64 CSS px; the Head-frame's button showing moves nothing */
    const town=await p.evaluate(ins=>{
      ins=Object.assign({top:0,bottom:0,left:0,right:0},ins);
      const q=x=>{if(!x||x.hidden)return null; const r=x.getBoundingClientRect(); return [r.left,r.top,r.right,r.bottom].map(Math.round);};
      const inside=r=>!!r&&r[0]>=ins.left-1&&r[2]<=innerWidth-ins.right+1&&r[1]>=ins.top-1&&r[3]<=innerHeight-ins.bottom+1;
      const thumb=r=>!!r&&r[3]-r[1]>=44&&r[2]-r[0]>=44;
      const tb=document.getElementById('townBtn'); tb.scrollIntoView({block:'center'});
      const o={walk:q(tb)}; o.walkIn=inside(o.walk)&&o.walk[3]-o.walk[1]>=40;
      tb.click();
      const T=__t.TWN; T.p.x=12; T.p.y=14; T.cx=null; __t.townFrame(1/30);
      const cv=document.getElementById('townCv'), c0=q(cv);
      T.p.x=__t.TOWN_DECK.x; T.p.y=__t.TOWN_DECK.y; __t.townFrame(1/30);
      const back=q(document.getElementById('townBack')), act=q(document.getElementById('townAct')), res0=q(document.getElementById('townRes')), c1=q(cv);
      const D=__t.townData(), keep=D.res; D.res={timber:16,iron:10,tallow:4,curios:1}; __t.townHud();
      const res1=q(document.getElementById('townRes'));
      D.res=keep; __t.townHud();
      o.back=back; o.act=act; o.res0=res0; o.res1=res1; o.k=T.k; o.tile=+(16*T.k/T.dpr).toFixed(1);
      o.btns=inside(back)&&inside(act)&&inside(res0)&&inside(res1)&&res0[0]>=back[2]&&thumb(back)&&thumb(act)&&!(back[2]>act[0]&&back[0]<act[2]&&back[3]>act[1]&&back[1]<act[3]);
      o.cover=c0[0]<=0&&c0[1]<=0&&c0[2]>=innerWidth&&c0[3]>=innerHeight;
      o.whole=Number.isInteger(T.k)&&cv.width===Math.round(cv.getBoundingClientRect().width*T.dpr)&&o.tile>=40&&o.tile<=64;
      o.still=JSON.stringify(c0)===JSON.stringify(c1);
      o.resStill=JSON.stringify(res0)===JSON.stringify(res1);
      /* build mode (step 4): Build sits in the HUD beside the counts without touching them; opening it shows the tray inside
         the safe area, every chip a thumb, the message line clear of the HUD, and nothing else moves */
      const bb=document.getElementById('townBuild'), hudB0=[back,q(bb),res0], over=(a,c)=>!!a&&!!c&&a[2]>c[0]&&a[0]<c[2]&&a[3]>c[1]&&a[1]<c[3];
      bb.click();
      const tw=document.getElementById('townCardWrap'); if(!tw.hidden)document.getElementById('townCard').click();
      const tray=q(document.getElementById('townTray')), msg=q(document.getElementById('townTmsg')), chips=[...document.querySelectorAll('#townTrow [data-deco]')].map(q);
      const hudB1=[q(document.getElementById('townBack')),q(bb),q(document.getElementById('townRes'))];
      o.build={btn:hudB0[1],tray,msg,first:chips[0],n:chips.length};
      o.buildOk=inside(hudB0[1])&&thumb(hudB0[1])&&!over(hudB0[1],res0)&&!over(hudB0[1],back)&&inside(q(document.getElementById('townTrow')))&&inside(msg)&&chips.length===7
        &&chips.every(c=>c[3]-c[1]>=44&&c[2]-c[0]>=44&&c[3]<=innerHeight-ins.bottom+1)&&inside(chips[0])
        &&!hudB1.some(r=>over(r,msg))&&JSON.stringify(hudB0)===JSON.stringify(hudB1)&&JSON.stringify(q(cv))===JSON.stringify(c1);
      return o;},ins);
    await p.waitForTimeout(200);
    await p.screenshot({path:(process.argv[3]||'.')+'/town-build-'+nm+'.png'});
    await p.evaluate(()=>__t.townBuildSet(false)); await p.waitForTimeout(100);
    await p.screenshot({path:(process.argv[3]||'.')+'/town-'+nm+'.png'});
    /* the Keepers (step 5): "Talk to Dr. Lucan Voss" sits where Descend the stair does, inside the safe area, a thumb, on one line,
       and showing it moves nothing; the talk card's buttons all fit on the screen */
    const keepers=await p.evaluate(ins=>{
      ins=Object.assign({top:0,bottom:0,left:0,right:0},ins);
      const q=x=>{if(!x||x.hidden)return null; const r=x.getBoundingClientRect(); return [r.left,r.top,r.right,r.bottom].map(Math.round);};
      const inside=r=>!!r&&r[0]>=ins.left-1&&r[2]<=innerWidth-ins.right+1&&r[1]>=ins.top-1&&r[3]<=innerHeight-ins.bottom+1;
      const T=__t.TWN, cv=document.getElementById('townCv'); __t.setDev(true); __t.townKeepers();
      T.p.x=12; T.p.y=14; T.cx=null; __t.townFrame(1/30);
      const c0=q(cv), back0=q(document.getElementById('townBack')), res0=q(document.getElementById('townRes'));
      const e=T.crowd.find(x=>x.k==='galvanist'); T.p.x=e.x; T.p.y=e.y+1.2; __t.townFrame(1/30);
      const act=document.getElementById('townAct'), a=q(act), o={a,label:act.textContent,n:T.crowd.filter(x=>!x.shade).length};
      o.one=act.getBoundingClientRect().height<=64&&act.scrollWidth<=act.clientWidth+1&&getComputedStyle(act).whiteSpace!=='normal'||act.getClientRects().length===1;
      o.out=inside(a)&&a[3]-a[1]>=44&&a[2]-a[0]>=44;
      o.still=JSON.stringify(q(cv))===JSON.stringify(c0)&&JSON.stringify(q(document.getElementById('townBack')))===JSON.stringify(back0)&&JSON.stringify(q(document.getElementById('townRes')))===JSON.stringify(res0);
      __t.townTalk('galvanist');
      const bs=[...document.querySelectorAll('#mActions button')].map(q), mo=q(document.querySelector('#modal .box')||document.getElementById('mBody'));
      o.talk=bs.length===3&&bs.every(r=>inside(r)&&r[3]-r[1]>=40);
      return o;},ins);
    await p.waitForTimeout(150);
    await p.screenshot({path:(process.argv[3]||'.')+'/town-talk-'+nm+'.png'});
    await p.evaluate(()=>{document.querySelector('#mActions').querySelectorAll('button')[2].click(); __t.setDev(false); __t.townKeepers();});
    if(!(keepers.n===4&&keepers.label==='Talk to Dr. Lucan Voss'&&keepers.out&&keepers.one&&keepers.still&&keepers.talk))console.log('FAIL '+nm+': Keepers on this screen',JSON.stringify(keepers));
    /* the Keeper's Lodge (step 9), in developer mode so nothing is written: inside, Leave the Lodge sits where Descend the stair
       does, inside the safe area and a thumb; the room fills its canvas at whole pixels; the build tray's seven chips (the Lodge's own floors and walls, and step 5's fireplace) are thumbs
       inside the safe area, and opening it moves nothing in the HUD */
    const lodge=await p.evaluate(ins=>{
      ins=Object.assign({top:0,bottom:0,left:0,right:0},ins);
      const q=x=>{if(!x||x.hidden)return null; const r=x.getBoundingClientRect(); return [r.left,r.top,r.right,r.bottom].map(Math.round);};
      const inside=r=>!!r&&r[0]>=ins.left-1&&r[2]<=innerWidth-ins.right+1&&r[1]>=ins.top-1&&r[3]<=innerHeight-ins.bottom+1;
      const thumb=r=>!!r&&r[3]-r[1]>=44&&r[2]-r[0]>=44;
      __t.setDev(true); const D=__t.townData(); D.res={timber:500,iron:500,tallow:500,curios:50}; __t.townRestoreLodge();
      D.lodge.floor='parquet'; D.lodge.wall='library'; D.lodge.furn=[{id:'desk',c:1,r:3},{id:'rug',c:3,r:4},{id:'stove',c:8,r:5},{id:'chair',c:7,r:7}];
      const o={enter:__t.lodgeEnter()}; const tw=document.getElementById('townCardWrap'); while(!tw.hidden)document.getElementById('townCard').click();
      __t.townFrame(1/30);
      const cv=document.getElementById('townCv'), act=document.getElementById('townAct'), a=q(act), hud0=[q(document.getElementById('townBack')),q(document.getElementById('townBuild')),q(document.getElementById('townRes'))];
      o.label=act.textContent; o.act=inside(a)&&thumb(a); o.cover=JSON.stringify(q(cv))===JSON.stringify([0,0,innerWidth,innerHeight].map(Math.round))||q(cv)[2]>=innerWidth;
      document.getElementById('townBuild').click(); while(!tw.hidden)document.getElementById('townCard').click();
      const chips=[...document.querySelectorAll('#townTrow [data-lodge]')].map(q), hud1=[q(document.getElementById('townBack')),q(document.getElementById('townBuild')),q(document.getElementById('townRes'))];
      o.n=chips.length; o.chips=chips.every(c=>c[3]-c[1]>=44&&c[2]-c[0]>=44&&c[3]<=innerHeight-ins.bottom+1)&&inside(chips[0])&&inside(q(document.getElementById('townTmsg')));
      o.still=JSON.stringify(hud0)===JSON.stringify(hud1);
      return o;},ins);
    await p.waitForTimeout(150);
    await p.screenshot({path:(process.argv[3]||'.')+'/lodge-build-'+nm+'.png'});
    await p.evaluate(()=>__t.townBuildSet(false)); await p.waitForTimeout(100);
    await p.screenshot({path:(process.argv[3]||'.')+'/lodge-'+nm+'.png'});
    /* Expansion 4, step 2: the Armchair in all eight facings, one in each corner facing the middle and one on each side, lit
       by a stove and the desk's lamp, in developer mode (nothing written); the Keeper stands in the middle so the camera holds the room */
    const chairs=await p.evaluate(()=>{const D=__t.townData(), T=__t.TWN;
      D.lodge.furn=[[1,2,7],[8,2,1],[1,8,5],[8,8,3],[1,5,6],[8,5,2],[6,2,0],[3,7,4]].map(([c,r,f])=>({id:'chair',c,r,f})).concat([{id:'stove',c:3,r:5,f:0},{id:'desk',c:5,r:5,f:0}]);
      __t.lodgeSync(); T.p.x=4.5; T.p.y=6.7; T.path=null; T.cx=null; __t.townFrame(1/30); __t.townFrame(1/30);
      return __t.lodgeArt().props.filter(o=>o.c.width>16&&o.c.width<=24).length;});
    await p.waitForTimeout(100);
    await p.screenshot({path:(process.argv[3]||'.')+'/lodge-chairs-'+nm+'.png'});
    if(chairs!==4)console.log('FAIL '+nm+': the four diagonal Armchairs are not drawn wide',chairs);
    /* Expansion 4, step 3: the Flooded Cellar and the Attic, opened and furnished in developer mode (nothing written). Each is
       reached by its way; the way back sits where Leave the Lodge does, inside the safe area and a thumb; the room fills its canvas.
       A screenshot of each, standing at the way in, and one from the middle */
    for(const room of ['cellar','attic']){
      const rm=await p.evaluate(([room,ins])=>{
        ins=Object.assign({top:0,bottom:0,left:0,right:0},ins);
        const q=x=>{if(!x||x.hidden)return null; const r=x.getBoundingClientRect(); return [r.left,r.top,r.right,r.bottom].map(Math.round);};
        const inside=r=>!!r&&r[0]>=ins.left-1&&r[2]<=innerWidth-ins.right+1&&r[1]>=ins.top-1&&r[3]<=innerHeight-ins.bottom+1;
        const thumb=r=>!!r&&r[3]-r[1]>=44&&r[2]-r[0]>=44;
        const D=__t.townData(), T=__t.TWN; if(__t.lodgeCur()!=='main')__t.lodgeGo('main');
        D.lodge.furn=[{id:'desk',c:5,r:4},{id:'chair',c:3,r:5,f:1},{id:'rug',c:4,r:6}]; __t.lodgeSync();
        const o={buy:__t.lodgeRoomBuilt(room)||__t.lodgeBuyRoom(room)};
        const R=__t.lodgeRoom(D,room); R.wall=room==='cellar'?'damp':'library';
        R.furn=room==='cellar'?[{id:'stove',c:3,r:4},{id:'chair',c:5,r:5,f:7},{id:'rug',c:2,r:6},{id:'shelf',c:5,r:2}]:[{id:'desk',c:5,r:4},{id:'chair',c:3,r:5,f:1},{id:'shelf',c:7,r:2,f:0},{id:'rug',c:4,r:6}];
        o.go=__t.lodgeWay(__t.LODGE_WAYS[room==='cellar'?'C':'L']);
        const tw=document.getElementById('townCardWrap'); while(!tw.hidden)document.getElementById('townCard').click();
        T.near=undefined; __t.townFrame(1/30); __t.townFrame(1/30);
        const act=document.getElementById('townAct'), a=q(act), cv=q(document.getElementById('townCv'));
        o.label=act.textContent; o.act=inside(a)&&thumb(a); o.cover=cv[0]<=0&&cv[1]<=0&&cv[2]>=innerWidth&&cv[3]>=innerHeight;
        return o;},[room,ins]);
      await p.waitForTimeout(150);
      await p.screenshot({path:(process.argv[3]||'.')+'/lodge-'+room+'-'+nm+'.png'});
      await p.evaluate(()=>{const T=__t.TWN; T.p.x=4.5; T.p.y=6.2; T.cx=null; T.near=undefined; __t.townFrame(1/30); __t.townFrame(1/30);});
      await p.waitForTimeout(100);
      await p.screenshot({path:(process.argv[3]||'.')+'/lodge-'+room+'-mid-'+nm+'.png'});
      await p.evaluate(()=>__t.lodgeGo('main'));
      const want=room==='cellar'?'Up to the Lodge':'Down to the Lodge';
      if(!(rm.buy&&rm.go&&rm.label===want&&rm.act&&rm.cover))console.log('FAIL '+nm+': the '+room+' on this screen',JSON.stringify(rm));
    }
    /* Expansion 4, step 4: the catalogue. In the Lodge's tray the set chip leads and each set's pieces follow, those of a set not yet
       bought shown shut with a padlock (not in developer mode, which opens them all); lifting a piece puts Dye beside ⟳ in the bar,
       five thumbs that still fit; wall mounts and small things are drawn. Each a thumb inside the safe area, clear of one another and
       of the message line, and nothing in the HUD moves. A screenshot of each */
    const cat=await p.evaluate(ins=>{
      ins=Object.assign({top:0,bottom:0,left:0,right:0},ins);
      const q=x=>{if(!x||x.hidden)return null; const r=x.getBoundingClientRect(); return [r.left,r.top,r.right,r.bottom].map(Math.round);};
      const inside=r=>!!r&&r[0]>=ins.left-1&&r[2]<=innerWidth-ins.right+1&&r[1]>=ins.top-1&&r[3]<=innerHeight-ins.bottom+1;
      const thumb=r=>!!r&&r[3]-r[1]>=44&&r[2]-r[0]>=44, over=(a,c)=>!!a&&!!c&&a[2]>c[0]&&a[0]<c[2]&&a[3]>c[1]&&a[1]<c[3];
      const apart=rs=>rs.every((r,i)=>rs.every((t,j)=>i===j||!over(r,t)));
      const D=__t.townData(), T=__t.TWN; if(__t.lodgeCur()!=='main')__t.lodgeGo('main');
      D.lodge.floor='planks'; D.lodge.wall='damp';
      D.lodge.furn=[{id:'desk',c:1,r:3,on:[{id:'candle',s:0},{id:'books',s:1},{id:'ink',s:3}]},{id:'wheel',c:6,r:0},{id:'portrait',c:3,r:0},{id:'chest',c:7,r:5,on:[{id:'lantern',s:0}]},{id:'chair',c:4,r:6,f:5},{id:'stove',c:8,r:3}];
      __t.lodgeSync(); T.p.x=5; T.p.y=8.4; T.path=null; T.cx=null; __t.townFrame(1/30);
      __t.townBuildSet(true); const tw=document.getElementById('townCardWrap'); while(!tw.hidden)document.getElementById('townCard').click();
      T.set='rooms'; __t.townTrayUI(); __t.townFrame(1/30);
      const hud=()=>JSON.stringify([q(document.getElementById('townBack')),q(document.getElementById('townBuild')),q(document.getElementById('townRes')),q(document.getElementById('townCv'))]);
      const msg=()=>q(document.getElementById('townTmsg')), h0=hud(), o={sets:[]};
      for(const k of __t.LODGE_SET_KEYS){
        T.set=k; __t.townTrayUI(); const set=document.getElementById('townSet'), chips=[...document.querySelectorAll('#townTrow [data-lodge]')].map(q);
        const sc=q(set); o.sets.push([k,chips.length,thumb(sc)&&inside(sc),chips.every(c=>thumb(c)&&c[3]<=innerHeight-ins.bottom+1),!over(sc,msg())&&hud()===h0]);}
      /* a piece lifted: the bar of five */
      T.set='fisher'; __t.townTrayUI(); __t.bldTap(1,3); __t.townFrame(1/30);
      const lb=[...document.querySelectorAll('#townLiftBar .town-tb')].map(q).filter(Boolean), chips=[...document.querySelectorAll('#townTrow .town-chip')].filter(c=>!c.hidden).map(q);
      o.lift=!!T.lift; o.lb=lb.length; o.liftOk=lb.length===6&&lb.every(r=>inside(r)&&thumb(r))&&apart(lb)&&!lb.some(r=>over(r,msg())||chips.some(c=>over(r,c)))&&hud()===h0;
      return o;},ins);
    await p.waitForTimeout(120);
    await p.screenshot({path:(process.argv[3]||'.')+'/lodge-catlift-'+nm+'.png'});
    await p.evaluate(()=>{__t.bldCancel(); __t.TWN.set='library'; __t.townTrayUI(); __t.townFrame(1/30);});
    await p.waitForTimeout(100);
    await p.screenshot({path:(process.argv[3]||'.')+'/lodge-cat-'+nm+'.png'});
    /* the sets not yet bought, shown locked (real mode: its own town in this page's storage) */
    const locked=await p.evaluate(ins=>{
      ins=Object.assign({top:0,bottom:0,left:0,right:0},ins);
      const q=x=>{if(!x||x.hidden)return null; const r=x.getBoundingClientRect(); return [r.left,r.top,r.right,r.bottom].map(Math.round);};
      __t.townBuildSet(false); __t.setDev(false); __t.townReset(); const R=__t.townData(); R.res={timber:500,iron:500,tallow:500,curios:50}; R.lodge.built=true; R.lodge.furn=[]; __t.lodgeSync();
      __t.townBuildSet(true); const tw=document.getElementById('townCardWrap'); while(!tw.hidden)document.getElementById('townCard').click();
      __t.TWN.set='chapel'; __t.townTrayUI();
      const chips=[...document.querySelectorAll('#townTrow [data-lodge]')], locks=document.querySelectorAll('#townTrow img.town-lock').length;
      const rs=chips.map(q); const o={n:chips.length,locks,locked:chips.every(c=>c.classList.contains('locked')),thumbs:rs.every(r=>r[3]-r[1]>=44&&r[2]-r[0]>=44)};
      chips[0].click(); o.say=document.getElementById('townTmsg').textContent; o.pick=__t.TWN.pick;
      return o;},ins);
    await p.waitForTimeout(100);
    await p.screenshot({path:(process.argv[3]||'.')+'/lodge-locked-'+nm+'.png'});
    await p.evaluate(()=>{__t.townBuildSet(false); __t.setDev(true); __t.townReset(); __t.townKeepers();});
    if(!(cat.sets.length===7&&cat.sets.every(x=>x[2]&&x[3]&&x[4])&&cat.sets.map(x=>x[1]).join()==='7,8,10,8,7,7,2'&&cat.lift&&cat.liftOk))console.log('FAIL '+nm+': the catalogue’s tray on this screen',JSON.stringify(cat));
    if(!(locked.n===8&&locked.locks===8&&locked.locked&&locked.thumbs&&/Peddler/.test(locked.say)&&locked.pick===null))console.log('FAIL '+nm+': a set not yet bought, on this screen',JSON.stringify(locked));
    /* Expansion 4, step 5: light and dark, in developer mode so nothing is written. The same room dark (every light out, the
       sconces cold) and lit (the fireplace, a sconce, a candle): darker without; standing under a sconce, the button offers to light
       it, a thumb inside the safe area, and lighting it moves nothing. A trophy's card fits. A screenshot of each */
    const lit=await p.evaluate(ins=>{
      ins=Object.assign({top:0,bottom:0,left:0,right:0},ins);
      const q=x=>{if(!x||x.hidden)return null; const r=x.getBoundingClientRect(); return [r.left,r.top,r.right,r.bottom].map(Math.round);};
      const inside=r=>!!r&&r[0]>=ins.left-1&&r[2]<=innerWidth-ins.right+1&&r[1]>=ins.top-1&&r[3]<=innerHeight-ins.bottom+1;
      const thumb=r=>!!r&&r[3]-r[1]>=44&&r[2]-r[0]>=44;
      const D=__t.townData(), T=__t.TWN; if(!T.inside)__t.lodgeEnter(); if(__t.lodgeCur()!=='main')__t.lodgeGo('main');
      const tw=document.getElementById('townCardWrap'); while(!tw.hidden)document.getElementById('townCard').click();
      D.lodge.floor='planks'; D.lodge.wall='damp'; 
      D.lodge.furn=[{id:'grimoire',c:4,r:2,free:true},{id:'sconce',c:1,r:0,free:true,out:true},{id:'hearth',c:6,r:3,out:true},{id:'chair',c:3,r:5,f:1},{id:'desk',c:6,r:6,on:[{id:'candle',s:1,out:true}]},{id:'keeper',c:6,r:0},{id:'primordial',c:1,r:4}];
      __t.lodgeSync(); T.p.x=5; T.p.y=8.4; T.path=null; T.cx=null; __t.townFrame(1/30);
      const o={dark:__t.lodgeArt().dark};
      return o;},ins);
    await p.waitForTimeout(100);
    await p.screenshot({path:(process.argv[3]||'.')+'/lodge-dark-'+nm+'.png'});
    const lit2=await p.evaluate(ins=>{
      ins=Object.assign({top:0,bottom:0,left:0,right:0},ins);
      const q=x=>{if(!x||x.hidden)return null; const r=x.getBoundingClientRect(); return [r.left,r.top,r.right,r.bottom].map(Math.round);};
      const inside=r=>!!r&&r[0]>=ins.left-1&&r[2]<=innerWidth-ins.right+1&&r[1]>=ins.top-1&&r[3]<=innerHeight-ins.bottom+1;
      const thumb=r=>!!r&&r[3]-r[1]>=44&&r[2]-r[0]>=44;
      const T=__t.TWN, L=__t.lodgeRoom(), o={};
      for(const d of L.furn)if(d.out&&d.id!=='sconce')__t.lodgeToggle(__t.lodgeActOf(d));
      const dk=L.furn.find(d=>d.id==='desk'); __t.lodgeToggle(__t.lodgeActOf(dk.on[0],dk));
      /* stand under the left-hand sconce: the button offers to light it */
      T.p.x=1.6; T.p.y=2.6; T.path=null; T.near=undefined; __t.townFrame(1/30); __t.townFrame(1/30);
      const act=document.getElementById('townAct'), a=q(act), hud0=JSON.stringify([q(document.getElementById('townBack')),q(document.getElementById('townBuild')),q(document.getElementById('townRes')),q(document.getElementById('townCv'))]);
      o.label=act.textContent; o.act=inside(a)&&thumb(a);
      act.click(); __t.townFrame(1/30); __t.townFrame(1/30);
      o.sconce=L.furn.filter(d=>d.id==='sconce').map((d,i)=>d.out?'':i).join(); o.label2=act.textContent;
      /* the button names what it offers, so its own width follows its words; nothing else moves */
      o.still=hud0===JSON.stringify([q(document.getElementById('townBack')),q(document.getElementById('townBuild')),q(document.getElementById('townRes')),q(document.getElementById('townCv'))])&&inside(q(act));
      T.p.x=5; T.p.y=6.2; T.cx=null; __t.townFrame(1/30); __t.townFrame(1/30);
      o.lit=__t.lodgeArt().dark;
      return o;},ins);
    await p.waitForTimeout(100);
    await p.screenshot({path:(process.argv[3]||'.')+'/lodge-lit-'+nm+'.png'});
    const troph=await p.evaluate(ins=>{
      ins=Object.assign({top:0,bottom:0,left:0,right:0},ins);
      const q=x=>{if(!x||x.hidden)return null; const r=x.getBoundingClientRect(); return [r.left,r.top,r.right,r.bottom].map(Math.round);};
      const inside=r=>!!r&&r[0]>=ins.left-1&&r[2]<=innerWidth-ins.right+1&&r[1]>=ins.top-1&&r[3]<=innerHeight-ins.bottom+1;
      const d=__t.lodgeRoom().furn.find(e=>e.id==='keeper'); __t.lodgeTrophyCard(d);
      const m=document.querySelector('#modal > div')||document.getElementById('modal'), r=q(m), b=[...document.querySelectorAll('#mActions button')].filter(x=>!x.hidden).map(q);
      return {card:!!r&&r[3]-r[1]<=innerHeight,btn:b.length>0&&b.every(x=>x&&x[3]-x[1]>=40&&x[3]<=innerHeight+1),text:document.getElementById('modal').textContent.slice(0,60)};},ins);
    await p.waitForTimeout(150);
    await p.screenshot({path:(process.argv[3]||'.')+'/lodge-trophy-'+nm+'.png'});
    await p.waitForTimeout(200); await p.evaluate(()=>{__t.TWN.shake=0; const b=document.querySelector('#mActions button'); if(b)b.click();});
    if(!(lit.dark>lit2.lit+.08&&/^Light the sconce$/.test(lit2.label)&&lit2.act&&lit2.sconce==='0'&&/^Put out the sconce$/.test(lit2.label2)&&lit2.still))console.log('FAIL '+nm+': light and dark in the Lodge on this screen',JSON.stringify({lit,lit2}));
    if(!(troph.card&&troph.btn&&/Keeper Below/.test(troph.text)))console.log('FAIL '+nm+': a trophy’s card on this screen',JSON.stringify(troph));
    await p.evaluate(()=>{__t.lodgeLeave(); __t.setDev(false); __t.townKeepers();});
    if(!(lodge.enter&&lodge.label==='Leave the Lodge'&&lodge.act&&lodge.cover&&lodge.n===7&&lodge.chips&&lodge.still))console.log('FAIL '+nm+': the Lodge on this screen',JSON.stringify(lodge));
    /* Expansion 4, step 1: the build tools, in developer mode so nothing is written. The tool bar (Pieces, Storage, Grid, Free,
       Undo) and, with a piece lifted, Place, ⟳ (step 2), Cancel and Store: each a thumb inside the safe area, clear of one another, of the
       message line and of the chips; lifting swaps the bars and moves nothing else. Storage's chips are thumbs too */
    const tools=await p.evaluate(ins=>{
      ins=Object.assign({top:0,bottom:0,left:0,right:0},ins);
      const q=x=>{if(!x||x.hidden)return null; const r=x.getBoundingClientRect(); return [r.left,r.top,r.right,r.bottom].map(Math.round);};
      const inside=r=>!!r&&r[0]>=ins.left-1&&r[2]<=innerWidth-ins.right+1&&r[1]>=ins.top-1&&r[3]<=innerHeight-ins.bottom+1;
      const thumb=r=>!!r&&r[3]-r[1]>=44&&r[2]-r[0]>=44, over=(a,c)=>!!a&&!!c&&a[2]>c[0]&&a[0]<c[2]&&a[3]>c[1]&&a[1]<c[3];
      const apart=rs=>rs.every((r,i)=>rs.every((t,j)=>i===j||!over(r,t)));
      __t.setDev(true); const D=__t.townData(); D.res={timber:500,iron:500,tallow:500,curios:50};
      const T=__t.TWN; T.p.x=12; T.p.y=14; T.path=null; T.cx=null;
      __t.townBuildSet(true); const tw=document.getElementById('townCardWrap'); while(!tw.hidden)document.getElementById('townCard').click();
      const o={place:__t.townPlace('lamp',14,15)}; __t.townFrame(1/30);
      const hud=()=>JSON.stringify([q(document.getElementById('townBack')),q(document.getElementById('townBuild')),q(document.getElementById('townRes')),q(document.getElementById('townCv'))]);
      const msg=()=>q(document.getElementById('townTmsg')), chips=()=>[...document.querySelectorAll('#townTrow .town-chip')].filter(c=>!c.hidden).map(q);
      const bar=[...document.querySelectorAll('#townTools .town-tb')].map(q), m0=msg(), row0=q(document.getElementById('townTrow')), h0=hud(), ch=chips();
      o.bar=bar; o.barOk=bar.length===5&&bar.every(r=>inside(r)&&thumb(r))&&apart(bar)&&!bar.some(r=>over(r,m0)||ch.some(c=>over(r,c)));
      __t.bldTap(14,15); __t.townFrame(1/30);
      const lb=[...document.querySelectorAll('#townLiftBar .town-tb')].map(q).filter(Boolean);
      o.lb=lb; o.liftOk=!!T.lift&&lb.length===5&&lb.every(r=>inside(r)&&thumb(r))&&apart(lb)&&!lb.some(r=>over(r,msg())||chips().some(c=>over(r,c)))
        &&JSON.stringify(q(document.getElementById('townTrow')))===JSON.stringify(row0)&&hud()===h0;
      return o;},ins);
    await p.waitForTimeout(120);
    await p.screenshot({path:(process.argv[3]||'.')+'/town-lift-'+nm+'.png'});
    const store=await p.evaluate(ins=>{
      ins=Object.assign({top:0,bottom:0,left:0,right:0},ins);
      const q=x=>{if(!x||x.hidden)return null; const r=x.getBoundingClientRect(); return [r.left,r.top,r.right,r.bottom].map(Math.round);};
      const inside=r=>!!r&&r[0]>=ins.left-1&&r[2]<=innerWidth-ins.right+1&&r[1]>=ins.top-1&&r[3]<=innerHeight-ins.bottom+1;
      __t.bldStow(); document.querySelector('#townTools [data-tab="store"]').click(); document.querySelector('#townTrow [data-stored="lamp"]').click();
      const cs=[document.getElementById('townSalvage'),document.querySelector('#townTrow [data-stored="lamp"]')].map(q);
      return {cs,ok:cs.every(r=>inside(r)&&r[3]-r[1]>=44&&r[2]-r[0]>=44),n:document.getElementById('townStoreN').textContent};},ins);
    await p.waitForTimeout(120);
    await p.screenshot({path:(process.argv[3]||'.')+'/town-store-'+nm+'.png'});
    await p.evaluate(()=>{__t.townBuildSet(false); __t.setDev(false); __t.townKeepers();});
    if(!(tools.place===''&&tools.barOk&&tools.liftOk&&store.ok&&store.n==='1'))console.log('FAIL '+nm+': the build tools on this screen',JSON.stringify({tools,store}));
    /* Step 6: workshop cards scroll on short phones; gifts keep the board fixed. */
    await p.evaluate(()=>{__t.setDev(true); __t.townBuildSet(true);});
    const materials=p.locator('#townMaterials'); await materials.scrollIntoViewIfNeeded();
    const mr=await materials.boundingBox();
    if(!mr||mr.width<44||mr.height<44||mr.x<(ins.left||0)||mr.x+mr.width>w-(ins.right||0)+1||mr.y<(ins.top||0)||mr.y+mr.height>h-(ins.bottom||0)+1)
      console.log('FAIL '+nm+': dev materials control out of reach',mr);
    await materials.click();
    await p.evaluate(()=>__t.townBuildSet(false));
    const workshop=await p.evaluate(()=>{
      __t.setDev(true);
      const T=__t.townData(); T.res={timber:500,iron:500,tallow:500,curios:50};
      __t.townUpgrade('brazier'); __t.townWorkshop('brazier');
      return document.getElementById('mTitle').textContent;
    });
    for(const button of await p.locator('#mActions button').all()){
      await button.scrollIntoViewIfNeeded();
      const r=await button.boundingBox();
      if(!r||r.height<44||r.x<ins.left||r.x+r.width>w-(ins.right||0)+1||r.y<0||r.y+r.height>h+1)console.log('FAIL '+nm+': workshop action out of reach',r);
    }
    await p.locator('#mActions button').first().scrollIntoViewIfNeeded();
    await p.screenshot({path:(process.argv[3]||'.')+'/town-workshop-'+nm+'.png'});
    if(!/Restored/.test(workshop))console.log('FAIL '+nm+': workshop card missing');
    await p.locator('#mActions button').first().click();
    await p.evaluate(()=>{
      __t.townClose(); __t.newRun(); __t.renderRelics();
    });
    const beforeGift=await p.locator('#board').boundingBox();
    await p.locator('#relChips .is-gift').click();
    const giftTip=await p.locator('#relTip').boundingBox(), afterGift=await p.locator('#board').boundingBox();
    if(!giftTip||giftTip.x<0||giftTip.y<0||giftTip.x+giftTip.width>w+1||giftTip.y+giftTip.height>h+1||JSON.stringify(beforeGift)!==JSON.stringify(afterGift))console.log('FAIL '+nm+': gift inspection shifts board or leaves screen');
    /* step 7: the Toothmonger's stall and the Drowned Oar, with both souls home (developer mode: nothing is written). Every trade
       and every action is thumb-sized and reachable; then the cage on a landing */
    /* Expansion 4, step 6: the Peddler's barrow, his three wares */
    for(const card of ['stall','oar','peddler']){
      await p.evaluate(c=>{const T=__t.townData(); T.rescued=['croupier','toothmonger','peddler']; T.res={timber:500,iron:500,tallow:500,curios:50};
        __t.townOpen(); if(c==='stall')__t.townStallCard(); else if(c==='peddler')__t.townPeddlerCard(); else __t.townOar();},card);
      if(card==='peddler'&&await p.locator('#mChoices button').count()!==3)console.log('FAIL '+nm+': the Peddler shows three wares');
      for(const button of await p.locator('#mChoices button, #mActions button').all()){
        await button.scrollIntoViewIfNeeded();
        const r=await button.boundingBox();
        if(!r||r.height<44||r.x<ins.left||r.x+r.width>w-(ins.right||0)+1||r.y<0||r.y+r.height>h+1)console.log('FAIL '+nm+': '+card+' control out of reach',r);
      }
      await p.locator('#mTitle').scrollIntoViewIfNeeded();
      await p.screenshot({path:(process.argv[3]||'.')+'/town-'+card+'-'+nm+'.png'});
      await p.evaluate(()=>{document.getElementById('modal').hidden=true; __t.townClose();});
    }
    await p.evaluate(()=>{const T=__t; T.newRun('lamplighter',0,{seed:11}); T.run.ess=60; T.F.foes=[]; T.F.queue=[]; T.F.wave=T.F.def.waves.length; T.F.phase='cleared'; T.openDraft(0,0);
      const d=T.F.draft; d.step='fork'; d.doors=[{room:'cage',who:'toothmonger',omen:null},{room:'rest',omen:null}]; T.chooseDoor(d,0);});
    for(const button of await p.locator('#mChoices button, #mActions button').all()){
      await button.scrollIntoViewIfNeeded();
      const r=await button.boundingBox();
      /* the landing's own buttons (Walk past, Pause menu, See the floor) are 42 px on wide screens in every room; the cage keeps that bar */
      if(!r||r.height<40||r.x<ins.left||r.x+r.width>w-(ins.right||0)+1||r.y<0||r.y+r.height>h+1)console.log('FAIL '+nm+': cage control out of reach',r);
    }
    await p.locator('#mTitle').scrollIntoViewIfNeeded();
    await p.screenshot({path:(process.argv[3]||'.')+'/cage-'+nm+'.png'});
    if(!/Locked Cage/.test(await p.locator('#mTitle').textContent()))console.log('FAIL '+nm+': cage card missing');
    await p.evaluate(()=>{document.getElementById('modal').hidden=true;});
    await p.evaluate(()=>{__t.setDev(false);});
    await p.evaluate(()=>__t.townClose());
    const townOk=town.walkIn&&town.btns&&town.resStill&&town.cover&&town.whole&&town.still&&town.buildOk;
    if(!townOk)console.log('FAIL '+nm+': Saltmouth on this screen',JSON.stringify(town));
    await p.evaluate(()=>{const T=__t; T.newRun(); T.run.floor=2; T.beginFloor(null); T.run.ess=900; T.forceUI();});
    await p.waitForTimeout(400);
    const snap=()=>p.evaluate(()=>{const R=s=>{const x=document.querySelector(s); if(!x||x.hidden||!x.offsetParent&&s!=='#board')return null; const q=x.getBoundingClientRect(); return [q.left,q.top,q.right,q.bottom].map(Math.round);};
      const bd=R('#board'), mb=R('#modebar'); const tile=bd?(bd[2]-bd[0])/__t.COLS:0;
      const ov=(a,c)=>a&&c?Math.max(0,Math.min(a[2],c[2])-Math.max(a[0],c[0]))*Math.max(0,Math.min(a[3],c[3])-Math.max(a[1],c[1])):0;
      // every control inside the safe area and on screen?
      const L=parseFloat(getComputedStyle(document.getElementById('app')).paddingLeft), Rr=parseFloat(getComputedStyle(document.getElementById('app')).paddingRight);
      const offs=[...document.querySelectorAll('#app button')].filter(x=>x.offsetParent).filter(x=>{const q=x.getBoundingClientRect(); const tray=x.closest('.tray'); return !tray&&(q.left<L-1||q.right>innerWidth-Rr+1||q.bottom>innerHeight+1);}).map(x=>x.id||x.textContent.slice(0,12));
      return {side:document.getElementById('app').classList.contains('side'), orient:__t.ORIENT, tile:+tile.toFixed(1), board:bd, cmd:R('#cmdbar'), card:mb, over:+(ov(bd,mb)/(tile*tile||1)).toFixed(2), offs, hint:document.getElementById('hint').classList.contains('show')};});
    const a=await snap();
    await p.evaluate(()=>{__t.setSel({kind:'ward',type:'harpoon'}); __t.forceUI();}); await p.waitForTimeout(350);
    const c=await snap();
    await p.screenshot({path:(process.argv[3]||'.')+'/fit-'+nm+'.png'});
    const moved=JSON.stringify(a.board)!==JSON.stringify(c.board), cmdMoved=JSON.stringify(a.cmd)!==JSON.stringify(c.cmd);
    /* seeds (#95): the stair's name, code and Copy on the pause screen, and Descend the same stair on the death screen, fit
       inside the safe area without scrolling sideways, stay big enough for a thumb, and leave the board where it was */
    const seedChk=()=>p.evaluate(ins=>{
      const box=document.querySelector('#modal .box');
      const q=x=>{if(!x)return null; x.scrollIntoView({block:'nearest'}); const r=x.getBoundingClientRect(); return [r.left,r.top,r.right,r.bottom].map(Math.round);};
      const inside=r=>!!r&&r[0]>=ins.left-1&&r[2]<=innerWidth-ins.right+1&&r[1]>=-1&&r[3]<=innerHeight+1;
      const copy=q(document.querySelector('#mBody [data-seedcopy]')), code=q(document.querySelector('#mBody .seed-code')), bx=box.getBoundingClientRect();
      const same=q([...document.querySelectorAll('#mActions button')].find(x=>x.textContent==='Descend the same stair'));
      return {copy,code,same,copyIn:inside(copy),sameIn:same?inside(same):null,codeIn:!!code&&code[2]<=bx.right+1,thumb:!!copy&&copy[3]-copy[1]>=40&&copy[2]-copy[0]>=56&&(!same||same[3]-same[1]>=40),
        sideways:getComputedStyle(box).overflowX!=='hidden'&&box.scrollWidth>box.clientWidth+1};},Object.assign({top:0,bottom:0,left:0,right:0},ins));
    await p.evaluate(()=>{__t.setSel(null); __t.forceUI();}); await p.waitForTimeout(250);
    const b0=(await snap()).board;
    await p.evaluate(()=>{document.getElementById('pauseBtn').click();}); await p.waitForTimeout(250);
    const sp=await seedChk();
    await p.screenshot({path:(process.argv[3]||'.')+'/seed-pause-'+nm+'.png'});
    await p.evaluate(()=>{document.querySelector('#mActions button.call').click();}); await p.waitForTimeout(250);
    const b1=(await snap()).board;
    await p.evaluate(()=>{__t.defeat();}); await p.waitForTimeout(1600);
    const sd=await seedChk();
    await p.screenshot({path:(process.argv[3]||'.')+'/seed-death-'+nm+'.png'});
    const seedOk=sp.copyIn&&sp.codeIn&&sp.thumb&&!sp.sideways&&sd.copyIn&&sd.codeIn&&sd.sameIn===true&&sd.thumb&&!sd.sideways&&JSON.stringify(b0)===JSON.stringify(b1);
    if(!seedOk)console.log('FAIL '+nm+': the stair’s name and code on the pause and death screens',JSON.stringify({sp,sd,b0,b1}));
    /* descents (Expansion 2): the descent door and its first-time tip on the landing fit without sideways scroll; The Carry's
       counts and prompt sit inside the safe area, clear of the flame and the stair ahead of it, and don't move as they change;
       its result card fits and is big enough for a thumb. The same in #app.side */
    const dsc=await p.evaluate(ins=>{
      const T=__t; ins=Object.assign({top:0,bottom:0,left:0,right:0},ins);
      const q=x=>{if(!x||x.hidden)return null; const r=x.getBoundingClientRect(); return [r.left,r.top,r.right,r.bottom].map(Math.round);};
      const inside=r=>!!r&&r[0]>=ins.left-1&&r[2]<=innerWidth-ins.right+1&&r[1]>=ins.top-1&&r[3]<=innerHeight-ins.bottom+1;
      const o={side:document.getElementById('app').classList.contains('side')};
      T.tutSet({walk:'done',seen:[],off:false});
      T.newRun('lamplighter',0,{seed:4242}); T.run.floor=1; T.beginFloor(null);
      T.F.foes=[]; T.F.queue=[]; T.F.wave=T.F.def.waves.length; T.F.phase='cleared'; T.openDraft(40,0);
      const d=T.F.draft; d.patron=null; d.relics=0; T.F.blocking.choices[0].fn();
      d.doors.forEach(x=>delete x.descent); const i=d.doors.findIndex(x=>!x.trial); d.doors[i].descent='carry'; T.showLanding();
      const box=document.querySelector('#modal .box'), door=document.querySelectorAll('#mChoices .choice')[i];
      door.scrollIntoView({block:'nearest'});
      o.door=q(door); o.doorIn=inside(o.door); o.tip=!!document.querySelector('#mBody .dsc-tip');
      o.sideways=getComputedStyle(box).overflowX!=='hidden'&&box.scrollWidth>box.clientWidth+1;
      T.tutSet({walk:'done',seen:['carry'],off:false});
      T.setDescentAuto(null); T.chooseDoor(d,i); if(T.F.draft&&!T.F.draft.done)T.descend();
      const C=T.DESC; o.active=C.active&&C.phase==='walk';
      const ov=document.getElementById('dscOverlay').getBoundingClientRect();
      const u=Math.min(ov.width/6.2,ov.height/7.4), fy=ov.height*.36;
      const stats=[...document.querySelectorAll('.dsc-stat')].map(q), prompt=q(document.querySelector('#dscPrompt span'));
      o.u=+u.toFixed(1); o.stats=stats; o.prompt=prompt;
      o.statsIn=stats.every(inside)&&inside(prompt);
      /* clear of the flame and what lies ahead of it: the light above it, and three tiles of stair below it */
      o.clear=stats.every(r=>r[3]<=fy-u*.9)&&prompt[1]>=fy+u*2.5;
      C.woke=2; C.spilt=3; C.hudKey=''; T.descentFrame(0);
      const stats2=[...document.querySelectorAll('.dsc-stat')].map(q);
      o.still=JSON.stringify(stats)===JSON.stringify(stats2);
      return o;},ins);
    await p.waitForTimeout(250);
    await p.screenshot({path:(process.argv[3]||'.')+'/carry-'+nm+'.png'});
    const card=await p.evaluate(ins=>{
      const T=__t, C=T.DESC; ins=Object.assign({top:0,bottom:0,left:0,right:0},ins);
      C.pos=C.len; C.held=false; C.liftT=0; T.carryStep(.05); C.t+=1; T.descentFrame(.05);
      const el=document.getElementById('dscCard'), r=el.getBoundingClientRect();
      const o={shown:!document.getElementById('dscCardWrap').hidden,r:[r.left,r.top,r.right,r.bottom].map(Math.round),thumb:r.height>=44&&r.width>=200,
        fits:el.scrollHeight<=el.clientHeight+1||r.height>=120};
      o.in=r.left>=ins.left-1&&r.right<=innerWidth-ins.right+1&&r.top>=ins.top-1&&r.bottom<=innerHeight-ins.bottom+1;
      return o;},ins);
    await p.screenshot({path:(process.argv[3]||'.')+'/carry-card-'+nm+'.png'});
    await p.evaluate(()=>{const T=__t; T.descentFinish({woke:0,spilt:0}); T.setDescentAuto({woke:0,spilt:0}); T.tutSet({walk:'done',seen:[],off:true});});
    const dscOk=dsc.doorIn&&dsc.tip&&!dsc.sideways&&dsc.active&&dsc.statsIn&&dsc.clear&&dsc.still&&card.shown&&card.in&&card.thumb&&card.fits;
    if(!dscOk)console.log('FAIL '+nm+': the descent door, The Carry and its card',JSON.stringify({dsc,card}));
    /* The Mirror Stair (Expansion 2, step 5): its counts and prompt sit inside the safe area, the counts above the highest spot
       of light and the prompt below the lowest, so neither covers a sconce you can reach; on a phone (500 px wide or less) the shaft fills most
       of the width; the mirrors stand clear of the back-swipe edges; the counts don't move as they change; the card fits */
    const mir=await p.evaluate(ins=>{
      const T=__t; ins=Object.assign({top:0,bottom:0,left:0,right:0},ins);
      const q=x=>{if(!x||x.hidden)return null; const r=x.getBoundingClientRect(); return [r.left,r.top,r.right,r.bottom].map(Math.round);};
      const inside=r=>!!r&&r[0]>=ins.left-1&&r[2]<=innerWidth-ins.right+1&&r[1]>=ins.top-1&&r[3]<=innerHeight-ins.bottom+1;
      T.tutSet({walk:'done',seen:['mirrorstair'],off:false}); T.setDescentAuto(null);
      T.newRun('lamplighter',0,{seed:4242}); T.run.floor=2; T.run.descent={k:'mirror',f0:1,msg:''}; T.startDescent();
      const C=T.DESC, K=T.MIRK, o={active:C.active&&C.phase==='walk'&&C.k==='mirror'};
      const ov=document.getElementById('dscOverlay').getBoundingClientRect(), u=T.mirrorU(ov.width,ov.height), fy=ov.height*K.FY, cx=ov.width/2;
      const stats=[...document.querySelectorAll('.dsc-stat')].map(q), prompt=q(document.querySelector('#dscPrompt span'));
      o.u=+u.toFixed(1); o.stats=stats; o.prompt=prompt; o.statsIn=stats.length===2&&stats.every(inside)&&inside(prompt);
      o.clear=stats.every(r=>r[3]<=fy+(K.SPOT[0]-K.TOL)*u-u*.25)&&prompt[1]>=fy+(K.SPOT[1]+K.TOL)*u;
      o.shaft=+(T.mirrorWall(ov.width,ov.height)*2*u/ov.width).toFixed(2); o.wide=ov.width>500||o.shaft>=.8;
      o.pivots=[-1,1].every(sd=>{const x=cx+sd*K.ARM[0]*u; return x-u*.3>=Math.max(24,ins.left)&&x+u*.3<=innerWidth-Math.max(24,ins.right)&&fy+K.ARM[1]*u-u*.2>=ins.top;});
      const s=C.sc[0]; C.pos=s.y-1.2; C.ms[s.side>0?1:0].spot=1.2; s.lit=true; s.lt=1; C.lit=1;
      C.sc[1].dark=true; C.sc[1].lt=2; C.dark=1; C.hudKey=''; T.descentFrame(0);
      o.still=JSON.stringify(stats)===JSON.stringify([...document.querySelectorAll('.dsc-stat')].map(q));
      return o;},ins);
    await p.waitForTimeout(250);
    await p.screenshot({path:(process.argv[3]||'.')+'/mirror-'+nm+'.png'});
    const mcard=await p.evaluate(ins=>{
      const T=__t, C=T.DESC; ins=Object.assign({top:0,bottom:0,left:0,right:0},ins);
      C.pos=C.len; C.held=false; C.liftT=0; T.mirrorStep(.05); C.t+=1; T.descentFrame(.05);
      const el=document.getElementById('dscCard'), r=el.getBoundingClientRect();
      const o={shown:!document.getElementById('dscCardWrap').hidden,thumb:r.height>=44&&r.width>=200,fits:el.scrollHeight<=el.clientHeight+1||r.height>=120};
      o.in=r.left>=ins.left-1&&r.right<=innerWidth-ins.right+1&&r.top>=ins.top-1&&r.bottom<=innerHeight-ins.bottom+1;
      return o;},ins);
    await p.screenshot({path:(process.argv[3]||'.')+'/mirror-card-'+nm+'.png'});
    await p.evaluate(()=>{const T=__t; T.descentFinish({}); T.setDescentAuto({woke:0,spilt:0}); T.tutSet({walk:'done',seen:[],off:true});});
    const mirOk=mir.active&&mir.statsIn&&mir.clear&&mir.wide&&mir.pivots&&mir.still&&mcard.shown&&mcard.in&&mcard.thumb&&mcard.fits;
    if(!mirOk)console.log('FAIL '+nm+': The Mirror Stair and its card',JSON.stringify({mir,mcard}));
    /* The Binding (Expansion 2, step 7; §5.4): the pledge card fits without scrolling sideways and its buttons take a thumb;
       on the shaft, the counts and prompt sit in the safe area, every dot and its snap ring stand at least 24 px (and clear of
       the insets) inside the screen and above the prompt, dots stand 50 px or more apart, the sigil strip sits under the counts
       and clear of the field, the counts don't move as they change, and the card fits */
    const bnd=await p.evaluate(ins=>{
      const T=__t; ins=Object.assign({top:0,bottom:0,left:0,right:0},ins);
      const q=x=>{if(!x||x.hidden)return null; const r=x.getBoundingClientRect(); return [r.left,r.top,r.right,r.bottom].map(Math.round);};
      const inside=r=>!!r&&r[0]>=ins.left-1&&r[2]<=innerWidth-ins.right+1&&r[1]>=ins.top-1&&r[3]<=innerHeight-ins.bottom+1;
      T.tutSet({walk:'done',seen:[],off:false}); T.setDescentAuto(null);
      T.newRun('lamplighter',0,{seed:4242}); T.run.floor=1; T.beginFloor(null); T.addRelic('tallow'); T.addRelic('reserve'); T.run.ess=300;
      T.run.floor=2; T.run.descent={k:'binding',f0:1,msg:''}; T.run.mini={k:'binding',horror:'elite',kind:null}; T.pledgeCard();
      const box=document.querySelector('#modal .box'), ch=[...document.querySelectorAll('#mChoices .choice')];
      const o={card:ch.map(x=>{x.scrollIntoView({block:'nearest'}); return q(x);})};
      o.cardIn=o.card.length===2&&o.card.every(inside)&&o.card.every(r=>r[3]-r[1]>=44); o.sideways=getComputedStyle(box).overflowX!=='hidden'&&box.scrollWidth>box.clientWidth+1;
      T.tutSet({walk:'done',seen:['binding','pledge'],off:false});
      T.F.blocking.choices[0].fn();
      const C=T.DESC; o.active=C.active&&C.phase==='walk'&&C.k==='binding';
      T.descentFrame(0);
      const G=T.bindGeo(), stats=[...document.querySelectorAll('.dsc-stat')].map(q), prompt=q(document.querySelector('#dscPrompt span'));
      o.stats=stats; o.statsIn=stats.length===2&&stats.every(inside)&&inside(prompt);
      const L=Math.max(24,ins.left), R=innerWidth-Math.max(24,ins.right), dots=[...Array(9).keys()].map(i=>T.bindDotXY(i,G));
      o.g=Math.round(G.g); o.r=Math.round(G.r);
      o.dotsIn=dots.every(d=>d[0]-G.r>=L-1&&d[0]+G.r<=R+1&&d[1]-G.r>=ins.top&&d[1]+G.r<=prompt[1]+1);
      o.gap=G.g>=50;
      const strip=[G.sx,G.sy,G.sx+G.sw,G.sy+G.sw/3.4].map(Math.round);
      o.strip=strip; o.stripOk=strip[0]>=ins.left-1&&strip[2]<=innerWidth-ins.right+1&&stats.every(r=>r[3]<=strip[1]+1)
        &&!(strip[2]>G.cx-G.g-G.r&&strip[0]<G.cx+G.g+G.r&&strip[3]>G.cy-G.g-G.r&&strip[1]<G.cy+G.g+G.r);
      C.done=2; C.hudKey=''; T.descentFrame(0);
      o.still=JSON.stringify(stats)===JSON.stringify([...document.querySelectorAll('.dsc-stat')].map(q));
      C.done=1; C.prog=2; C.fp=T.bindDotXY(C.sig[1][2],G); C.hudKey=''; T.descentFrame(0);
      return o;},ins);
    await p.waitForTimeout(250);
    await p.screenshot({path:(process.argv[3]||'.')+'/binding-'+nm+'.png'});
    const bcard=await p.evaluate(ins=>{
      const T=__t, C=T.DESC; ins=Object.assign({top:0,bottom:0,left:0,right:0},ins);
      C.done=3; C.phase='out'; C.stroke=null; C.endAt=C.t; C.held=false; C.liftT=0; C.t+=1; T.descentFrame(.05);
      const el=document.getElementById('dscCard'), r=el.getBoundingClientRect();
      const o={shown:!document.getElementById('dscCardWrap').hidden,thumb:r.height>=44&&r.width>=200,fits:el.scrollHeight<=el.clientHeight+1||r.height>=120};
      o.in=r.left>=ins.left-1&&r.right<=innerWidth-ins.right+1&&r.top>=ins.top-1&&r.bottom<=innerHeight-ins.bottom+1;
      return o;},ins);
    await p.screenshot({path:(process.argv[3]||'.')+'/binding-card-'+nm+'.png'});
    await p.evaluate(()=>{const T=__t; T.descentFinish({}); T.setDescentAuto({woke:0,spilt:0}); T.tutSet({walk:'done',seen:[],off:true});});
    const bndOk=bnd.cardIn&&!bnd.sideways&&bnd.active&&bnd.statsIn&&bnd.dotsIn&&bnd.gap&&bnd.stripOk&&bnd.still&&bcard.shown&&bcard.in&&bcard.thumb&&bcard.fits;
    if(!bndOk)console.log('FAIL '+nm+': The Binding, its pledge card and its result card',JSON.stringify({bnd,bcard}));
    /* The Cast (Expansion 2, step 8): its counts and prompt sit inside the safe area, the counts above the highest ring a line can
       reach and the prompt below the lowest, so neither covers a ring in play; on a phone (500 px wide or less) the shaft fills
       at least two thirds of the width (the rings hang where they do on every screen, so a short phone gets a narrower shaft than
       The Mirror Stair's); the counts don't move as they change; the card fits */
    const cst=await p.evaluate(ins=>{
      const T=__t; ins=Object.assign({top:0,bottom:0,left:0,right:0},ins);
      const q=x=>{if(!x||x.hidden)return null; const r=x.getBoundingClientRect(); return [r.left,r.top,r.right,r.bottom].map(Math.round);};
      const inside=r=>!!r&&r[0]>=ins.left-1&&r[2]<=innerWidth-ins.right+1&&r[1]>=ins.top-1&&r[3]<=innerHeight-ins.bottom+1;
      T.tutSet({walk:'done',seen:['cast'],off:false}); T.setDescentAuto(null);
      T.newRun('lamplighter',0,{seed:4242}); T.run.floor=2; T.run.ess=1234; T.run.descent={k:'cast',f0:1,msg:''}; T.startDescent();
      const C=T.DESC, K=T.CASTK, o={active:C.active&&C.phase==='walk'&&C.k==='cast'};
      const ov=document.getElementById('dscOverlay').getBoundingClientRect(), u=T.castU(ov.width,ov.height), fy=ov.height*K.FY;
      const stats=[...document.querySelectorAll('.dsc-stat')].map(q), prompt=q(document.querySelector('#dscPrompt span'));
      const reach=Math.sqrt(K.LINE*K.LINE-K.RX*K.RX);
      o.u=+u.toFixed(1); o.stats=stats; o.prompt=prompt; o.statsIn=stats.length===2&&stats.every(inside)&&inside(prompt)&&stats[0][2]<stats[1][0];
      o.clear=stats.every(r=>r[3]<=fy-(reach+.48)*u+2)&&prompt[1]>=fy+(reach+.3)*u;
      o.shaft=+(K.W*2*u/ov.width).toFixed(2); o.wide=ov.width>500||o.shaft>=.66;
      C.caught=1; C.left=1; C.hudKey=''; T.descentFrame(0);
      o.still=JSON.stringify(stats)===JSON.stringify([...document.querySelectorAll('.dsc-stat')].map(q));
      C.pos=C.rg[0].y-.8; C.aim={id:9,x0:ov.width/2,y0:fy+3*u,px:-C.rg[0].side*.9,py:-1}; T.descentFrame(0);
      return o;},ins);
    await p.waitForTimeout(250);
    await p.screenshot({path:(process.argv[3]||'.')+'/cast-'+nm+'.png'});
    const ccard=await p.evaluate(ins=>{
      const T=__t, C=T.DESC; ins=Object.assign({top:0,bottom:0,left:0,right:0},ins);
      C.aim=null; C.wt=null; C.left=0; C.held=false; C.liftT=0; T.castStep(.05); C.t+=1; T.descentFrame(.05);
      const el=document.getElementById('dscCard'), r=el.getBoundingClientRect();
      const o={shown:!document.getElementById('dscCardWrap').hidden,thumb:r.height>=44&&r.width>=200,fits:el.scrollHeight<=el.clientHeight+1||r.height>=120};
      o.in=r.left>=ins.left-1&&r.right<=innerWidth-ins.right+1&&r.top>=ins.top-1&&r.bottom<=innerHeight-ins.bottom+1;
      return o;},ins);
    await p.screenshot({path:(process.argv[3]||'.')+'/cast-card-'+nm+'.png'});
    await p.evaluate(()=>{const T=__t; T.descentFinish({}); T.setDescentAuto({woke:0,spilt:0}); T.tutSet({walk:'done',seen:[],off:true});});
    const cstOk=cst.active&&cst.statsIn&&cst.clear&&cst.wide&&cst.still&&ccard.shown&&ccard.in&&ccard.thumb&&ccard.fits;
    if(!cstOk)console.log('FAIL '+nm+': The Cast and its card',JSON.stringify({cst,ccard}));
    /* The Smothering: four targets of 48 px or more, 24 px clear of the edges and the safe area, never overlapping; the counts
       above the niches and the prompt below the wicks, so neither covers a target; the counts don't move as they change; the card fits */
    const smo=await p.evaluate(ins=>{
      const T=__t; ins=Object.assign({top:0,bottom:0,left:0,right:0},ins);
      const q=x=>{if(!x||x.hidden)return null; const r=x.getBoundingClientRect(); return [r.left,r.top,r.right,r.bottom].map(Math.round);};
      const inside=r=>!!r&&r[0]>=ins.left-1&&r[2]<=innerWidth-ins.right+1&&r[1]>=ins.top-1&&r[3]<=innerHeight-ins.bottom+1;
      T.tutSet({walk:'done',seen:['smothering'],off:false}); T.setDescentAuto(null);
      T.newRun('lamplighter',0,{seed:4242}); T.run.floor=2; T.run.descent={k:'smother',f0:1,msg:''}; T.startDescent();
      const C=T.DESC; C.pl[0].rise=999; C.gt=T.SMOK.GAP; T.smotherStep(.01); C.pt=1; T.descentFrame(0);
      const o={active:C.active&&C.phase==='walk'&&C.sub==='plume'&&C.k==='smother'};
      const G=T.smoGeo(), xs=[0,1,2,3].map(k=>T.smoX(G,k)), stats=[...document.querySelectorAll('.dsc-stat')].map(q), prompt=q(document.querySelector('#dscPrompt span'));
      o.R=+G.R.toFixed(1); o.xs=xs.map(Math.round); o.stats=stats; o.prompt=prompt;
      o.targets=G.R*2>=48&&xs.every((x,k)=>k===0||x-xs[k-1]>=G.R*2)&&xs[0]-G.R>=Math.max(24,ins.left)&&innerWidth-xs[3]-G.R>=Math.max(24,ins.right)&&G.cy-G.R>=ins.top&&G.cy+G.R<=innerHeight-ins.bottom;
      o.statsIn=stats.length===2&&stats.every(inside)&&inside(prompt)&&stats[0][2]<stats[1][0];
      o.clear=stats.every(r=>r[3]<=G.rowY-86*G.s+2)&&prompt[1]>=G.cy+G.R-2;
      C.clean=1; C.wrong=2; C.hudKey=''; T.descentFrame(0);
      o.still=JSON.stringify(stats)===JSON.stringify([...document.querySelectorAll('.dsc-stat')].map(q));
      return o;},ins);
    await p.waitForTimeout(250);
    await p.screenshot({path:(process.argv[3]||'.')+'/smother-'+nm+'.png'});
    const scard=await p.evaluate(ins=>{
      const T=__t, C=T.DESC; ins=Object.assign({top:0,bottom:0,left:0,right:0},ins);
      for(let k=0;k<4;k++)C.lit[k]=false; C.lit[0]=true; C.i=2; C.pl[2].rise=999; T.smotherSnuff(0); C.held=false; C.liftT=0; T.smotherStep(.05); C.t+=1; T.descentFrame(.05);
      const el=document.getElementById('dscCard'), r=el.getBoundingClientRect();
      const o={shown:!document.getElementById('dscCardWrap').hidden,thumb:r.height>=44&&r.width>=200,fits:el.scrollHeight<=el.clientHeight+1||r.height>=120};
      o.in=r.left>=ins.left-1&&r.right<=innerWidth-ins.right+1&&r.top>=ins.top-1&&r.bottom<=innerHeight-ins.bottom+1;
      return o;},ins);
    await p.screenshot({path:(process.argv[3]||'.')+'/smother-card-'+nm+'.png'});
    await p.evaluate(()=>{const T=__t; T.descentFinish({}); T.setDescentAuto({woke:0,spilt:0}); T.tutSet({walk:'done',seen:[],off:true});});
    const smoOk=smo.active&&smo.targets&&smo.statsIn&&smo.clear&&smo.still&&scard.shown&&scard.in&&scard.thumb&&scard.fits;
    if(!smoOk)console.log('FAIL '+nm+': The Smothering and its card',JSON.stringify({smo,scard}));
    /* The Winch: the counts and the prompt inside the safe area; the glints below the counts and inside it too, well above the
       lantern, and over the shaft; the lantern mid-stage; the counts don't move as they change, and nothing moves when a purse
       falls or is caught; the card fits */
    const wch=await p.evaluate(ins=>{
      const T=__t; ins=Object.assign({top:0,bottom:0,left:0,right:0},ins);
      const q=x=>{if(!x||x.hidden)return null; const r=x.getBoundingClientRect(); return [r.left,r.top,r.right,r.bottom].map(Math.round);};
      const inside=r=>!!r&&r[0]>=ins.left-1&&r[2]<=innerWidth-ins.right+1&&r[1]>=ins.top-1&&r[3]<=innerHeight-ins.bottom+1;
      T.tutSet({walk:'done',seen:['winch'],off:false}); T.setDescentAuto(null);
      T.newRun('lamplighter',0,{seed:4242}); T.run.floor=2; T.run.ess=400; T.run.descent={k:'winch',f0:1,msg:''}; T.startDescent();
      const C=T.DESC, K=T.WINCHK, o={active:C.active&&C.phase==='walk'&&C.k==='winch'};
      const ov=document.getElementById('dscOverlay').getBoundingClientRect(), u=T.winchU(ov.width,ov.height), fy=ov.height*K.FY, cx=ov.width/2;
      const stats=[...document.querySelectorAll('.dsc-stat')].map(q), prompt=q(document.querySelector('#dscPrompt span')), gy=T.winchGlintY(ov.height,ov.width);
      o.u=+u.toFixed(1); o.gy=Math.round(gy); o.stats=stats;
      o.statsIn=stats.length===2&&stats.every(inside)&&inside(prompt)&&stats[0][2]<stats[1][0];
      /* a glint's star reaches 0.26 of a tile each way: below the counts it may share a row with, clear of the notch, and two tiles
         above the lantern */
      const gr=u*.3, shaftL=cx-K.W*u, shaftR=cx+K.W*u, overlapsStats=stats.some(r=>r[2]>shaftL&&r[0]<shaftR);
      o.glint=gy-gr>=Math.max(ins.top,overlapsStats?Math.max(...stats.map(r=>r[3])):0)&&gy<=fy-2*u+1&&shaftL>=ins.left&&shaftR<=innerWidth-ins.right;
      o.clear=prompt[1]>=fy+(K.GLOW-.6)*u;
      o.mid=Math.abs(fy-ov.height/2)<ov.height*.1;
      const st=()=>JSON.stringify([...document.querySelectorAll('.dsc-stat')].map(q).concat([q(document.getElementById('dscCv'))]));
      const s0=st();
      C.ps[0].st='fall'; C.ps[0].ta=C.t+.4; T.descentFrame(0); const s1=st();
      C.caught=1; C.ps[0].st='hook'; C.snags=2; C.hudKey=''; T.descentFrame(0); const s2=st();
      o.still=s0===s1&&s1===s2;
      C.ps[1].st='glint'; C.ps[1].ta=C.t+1.5; C.ps[1].relic=true;
      return o;},ins);
    await p.waitForTimeout(250);
    await p.screenshot({path:(process.argv[3]||'.')+'/winch-'+nm+'.png'});
    const wcard=await p.evaluate(ins=>{
      const T=__t, C=T.DESC; ins=Object.assign({top:0,bottom:0,left:0,right:0},ins);
      C.pos=C.len; C.t=C.len/T.WINCHK.SPEED; C.held=false; C.liftT=0; T.winchStep(.05); C.t+=1; T.descentFrame(.05);
      const el=document.getElementById('dscCard'), r=el.getBoundingClientRect();
      const o={shown:!document.getElementById('dscCardWrap').hidden,thumb:r.height>=44&&r.width>=200,fits:el.scrollHeight<=el.clientHeight+1||r.height>=120};
      o.in=r.left>=ins.left-1&&r.right<=innerWidth-ins.right+1&&r.top>=ins.top-1&&r.bottom<=innerHeight-ins.bottom+1;
      return o;},ins);
    await p.screenshot({path:(process.argv[3]||'.')+'/winch-card-'+nm+'.png'});
    await p.evaluate(()=>{const T=__t; T.descentFinish({}); T.setDescentAuto({woke:0,spilt:0}); T.tutSet({walk:'done',seen:[],off:true});});
    const wchOk=wch.active&&wch.statsIn&&wch.glint&&wch.clear&&wch.mid&&wch.still&&wcard.shown&&wcard.in&&wcard.thumb&&wcard.fits;
    if(!wchOk)console.log('FAIL '+nm+': The Winch and its card',JSON.stringify({wch,wcard}));
    const ok=!moved&&!cmdMoved&&c.over===0&&!c.offs.length&&c.card&&seedOk&&dscOk&&mirOk&&bndOk&&cstOk&&smoOk&&wchOk&&townOk;
    if(!ok)bad++;
    console.log((ok?'OK  ':'BAD ')+nm.padEnd(17),'side',c.side,'tile',c.tile,'boardMoved',moved,'barMoved',cmdMoved,'over',c.over,'unsafe',c.offs,'hint',c.hint,errs.length?errs:'');
    await ctx.close();
  }
  // rotate mid-placement: portrait -> landscape -> portrait
  const ctx=await b.newContext({viewport:{width:393,height:659},deviceScaleFactor:3,hasTouch:true,isMobile:true});
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.goto(file); await p.waitForTimeout(400);
  await p.evaluate(()=>{const T=__t; T.newRun(); T.run.floor=1; T.beginFloor(null); T.run.ess=900; T.setSel({kind:'ward',type:'candle'}); T.forceUI();});
  await p.waitForTimeout(300);
  await p.setViewportSize({width:852,height:342}); await p.waitForTimeout(400);
  const r1=await p.evaluate(()=>({side:document.getElementById('app').classList.contains('side'), cardH:document.getElementById('modebar').offsetHeight, cardW:document.getElementById('modebar').offsetWidth}));
  await p.screenshot({path:(process.argv[3]||'.')+'/fit-rotated.png'});
  await p.setViewportSize({width:393,height:659}); await p.waitForTimeout(400);
  const r2=await p.evaluate(()=>({side:document.getElementById('app').classList.contains('side'), cardH:document.getElementById('modebar').offsetHeight}));
  // place a ward through the card's replacement flow, then cancel brings rites back
  await p.evaluate(()=>{document.getElementById('mbCancel').click();}); await p.waitForTimeout(250);
  const r3=await p.evaluate(()=>({rites:getComputedStyle(document.getElementById('rites')).display, card:document.getElementById('modebar').hidden}));
  console.log('rotate',JSON.stringify(r1),JSON.stringify(r2),'cancel',JSON.stringify(r3),errs);
  console.log('BAD COUNT',bad); if(bad)process.exitCode=1;
  if(!(r1.side&&!r2.side&&r3.rites==='flex'&&r3.card)){console.log('FAIL rotate/cancel', JSON.stringify([r1,r2,r3])); process.exitCode=1;}
  await b.close();
})();
