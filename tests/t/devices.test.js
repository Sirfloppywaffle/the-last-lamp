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
    const ok=!moved&&!cmdMoved&&c.over===0&&!c.offs.length&&c.card&&seedOk;
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
