// The Knucklebones: a landing room where you play Cult of the Lamb's knucklebones for essence the stair would burn.
const {chromium}=require('playwright');
(async()=>{
  const b=await chromium.launch(); let fails=0; const fail=m=>{console.log('FAIL '+m); fails++;};
  // the rules run with reduced motion (moves resolve at once); the table's animation is checked at the end
  const p=await b.newPage({viewport:{width:412,height:860},hasTouch:true});
  await p.emulateMedia({reducedMotion:'reduce'});
  await p.goto('file://'+process.argv[2]); await p.waitForTimeout(300);
  await p.evaluate(()=>{window.__rnd=Math.random;});
  const room=(ess)=>p.evaluate((ess)=>{const T=__t; T.newRun(); T.run.floor=1; T.beginFloor(null); T.setP(true); Math.random=()=>.5;
    T.run.ess=ess; T.F.phase='draft'; T.F.draft={step:'room',salvage:50,healed:0,opts:[],relics:0}; T.F.draft.room=T.makeRoom('bones'); T.showLanding();
    return T.F.draft.room.stake;},ess);
  const card=(title)=>p.evaluate(t=>{const c=[...document.querySelectorAll('#mChoices .choice')].find(x=>x.querySelector('b').textContent===t); if(!c)return false; c.click(); return true;},title);
  /* lay out a game in progress: your board, its board, the bone you rolled, and what Math.random returns from here on */
  const setGame=(you,them,die,rnd)=>p.evaluate(([you,them,die,rnd])=>{const r=__t.F.draft.room; r.started=true; r.you=you; r.them=them; r.die=die; Math.random=()=>rnd; __t.showLanding();},[you,them,die,rnd]);
  const col=(i)=>p.evaluate(i=>document.querySelector('[data-bcol="'+i+'"]').click(),i);
  const st=()=>p.evaluate(()=>{const T=__t, r=T.F.draft.room; return {ess:T.run.ess,salvage:T.F.draft.salvage,you:r.you,them:r.them,die:r.die,done:r.done,started:r.started,
    title:document.querySelector('#mTitle').textContent,relics:T.run.relics.length,cards:[...document.querySelectorAll('#mChoices .choice b')].map(x=>x.textContent),
    open:[...document.querySelectorAll('[data-bcol]')].map(x=>!x.disabled)};});

  // A: a column scores its sum, and matching bones multiply
  const sc=await p.evaluate(()=>[[4,4],[4,4,4],[2,3,2],[],[6,1,5]].map(c=>__t.bonesCol(c)));
  if(sc.join()!=='16,36,11,0,12')fail('column scores (4,4)=16, (4,4,4)=36, (2,3,2)=11, ()=0, (6,1,5)=12: '+sc);

  // B: sitting down pays the stake and rolls your first bone; all three columns are open
  let stake=await room(400);
  if(stake!==60)fail('stake on floor 2 should be 60, got '+stake);
  if(!await card('Sit down and play'))fail('no way to sit down and play');
  let s=await st();
  if(s.ess!==340||!s.started||s.die!==4||s.open.join()!=='true,true,true')fail('the stake is paid and a 4 is rolled, three columns open '+JSON.stringify(s));

  // C: your 3 knocks both its 3s out of the facing column; it answers with a 6 and you roll again
  await setGame([[],[],[]],[[3,3],[],[1]],3,.99);
  const hint=await p.evaluate(()=>document.querySelector('[data-bcol="0"]').textContent);
  if(!/Knocks off 2/.test(hint))fail('the column shows how many it would knock off: '+hint);
  await col(0); s=await st();
  if(s.you[0].join()!=='3'||s.them[0].join()!=='6'||s.them[2].join()!=='1'||s.die!==6)fail('your 3 knocks off its 3s, it sets a 6, you roll a 6 '+JSON.stringify(s));

  // D: it plays to knock your bones off when it can
  const ai=await p.evaluate(()=>{__t.run.floor=4; Math.random=()=>0; return __t.bonesAI({you:[[5,5],[],[]],them:[[],[],[]]},5);});
  if(ai!==0)fail('with a 5 it should knock off your two 5s, chose column '+ai);
  await p.evaluate(()=>{__t.run.floor=1;});

  // E: filling your board ends the game; a win by 20 or more pays double, safe from the toll, and a relic
  await setGame([[6,6],[6,6,6],[6,6,6]],[[1],[1],[2]],6,.5);
  await col(0); s=await st();
  if(s.done!=='win'||s.ess!==460||s.salvage!==170||s.title!=='What it was keeping')fail('a big win pays 120 into salvage and offers a relic '+JSON.stringify(s));
  const before=s.relics; await p.evaluate(()=>document.querySelector('#mChoices .choice').click()); s=await st();
  if(s.relics!==before+1)fail('the relic is taken '+JSON.stringify(s));

  // F: a narrow win pays without a relic, and the winnings survive the toll
  await room(400); await card('Sit down and play');
  await setGame([[2,2],[2,2,2],[2,2,2]],[[5,5],[5,5],[1]],2,.5);
  await col(0); s=await st();
  if(s.done!=='win'||s.ess!==460||s.salvage!==170||s.title!=='You beat it')fail('54 to 41 wins 120 and no relic '+JSON.stringify(s));
  await p.evaluate(()=>{__t.descend();}); await p.waitForTimeout(100);
  s=await p.evaluate(()=>__t.run.ess);
  // 170 protected + 30% of the 290 loose = 257, plus floor 3's stipend 120
  if(s!==170+87+120)fail('after the toll the winnings are kept: expected 377, got '+s);
  await p.evaluate(()=>{document.querySelector('#mapOverlay').hidden=true;});

  // G: when it fills its board ahead of you, it keeps your stake
  await room(400); await card('Sit down and play');
  await setGame([[1],[1],[]],[[6,6,6],[6,6,6],[6,6]],2,.99);
  await col(2); s=await st();
  if(s.done!=='lose'||s.ess!==340||s.title!=='It beats you'||s.them[2].length!==3)fail('it fills its board with a 6 and wins '+JSON.stringify(s));

  // H: a draw hands the stake back
  await room(400); await card('Sit down and play');
  await setGame([[1,1],[2,2,2],[3,3,3]],[[6,6,6],[],[]],1,.5);
  await col(0); s=await st();
  if(s.done!=='draw'||s.ess!==400||s.title!=='A draw')fail('54 to 54 is a draw and the stake comes back '+JSON.stringify(s));

  // I: too poor to play
  await room(10); s=await st();
  if(s.cards.length)fail('with 10 essence there is nothing to stake '+JSON.stringify(s));

  // J: a real tap on a column, after the double-tap guard's window
  await room(400); await card('Sit down and play'); await p.evaluate(()=>{Math.random=()=>.99;}); await p.waitForTimeout(300);
  const box=await p.evaluate(()=>{const r=document.querySelector('[data-bcol="1"]').getBoundingClientRect(); return {x:r.left+r.width/2,y:r.top+r.height/2};});
  await p.touchscreen.tap(box.x,box.y); await p.waitForTimeout(150); s=await st();
  if(s.you[1].join()!=='4'||s.them.flat().join()!=='6')fail('a real tap sets your 4, and it answers with a 6 '+JSON.stringify(s));
  await p.screenshot({path:(process.argv[3]||'.')+'/bones-midgame.png'});

  // K: the room can come up behind a door
  const seen=await p.evaluate(()=>{Math.random=window.__rnd; let n=0; for(let i=0;i<300;i++)if(__t.makeDoors().some(d=>d.room==='bones'))n++; return n;});
  if(seen<20)fail('the Knucklebones should turn up behind doors, seen '+seen+'/300');

  // M: a save from the push-your-luck version pays out the pot it held and offers a fresh game
  await room(400);
  s=await p.evaluate(()=>{const T=__t, d=T.F.draft; d.room={type:'bones',stake:60,pot:120,wins:1,done:null,res:''}; T.run.ess=340; T.showLanding();
    return {ess:T.run.ess,salvage:d.salvage,cards:[...document.querySelectorAll('#mChoices .choice b')].map(x=>x.textContent),you:d.room.you};});
  if(s.ess!==460||s.salvage!==170||s.cards.join()!=='Sit down and play'||!s.you)fail('an old save pays its pot and sets the table '+JSON.stringify(s));

  // L: with motion, the table plays each move out; a tap on your side of the table sets a bone, a tap during a move hurries it
  for(const [w,h,tag] of [[412,860,'folded'],[915,356,'side']]){
    const q=await b.newPage({viewport:{width:w,height:h},hasTouch:true});
    await q.goto('file://'+process.argv[2]); await q.waitForTimeout(300);
    await q.evaluate(()=>{const T=__t; T.newRun(); T.run.floor=1; T.beginFloor(null); T.setP(true); Math.random=()=>.5;
      T.run.ess=400; T.F.phase='draft'; T.F.draft={step:'room',salvage:50,healed:0,opts:[],relics:0}; T.F.draft.room=T.makeRoom('bones'); T.showLanding();});
    await q.waitForTimeout(300);
    const painted=()=>q.evaluate(()=>{const cv=document.getElementById('bonesCv'); if(!cv||!cv.width)return 0; const d=cv.getContext('2d').getImageData(0,0,cv.width,cv.height).data; let n=0; for(let i=0;i<d.length;i+=40)if(d[i]+d[i+1]+d[i+2]>60)n++; return n;});
    if(await painted()<50)fail(tag+': the table should be painted before you sit down');
    await q.evaluate(()=>[...document.querySelectorAll('#mChoices .choice')].find(c=>c.querySelector('b').textContent==='Sit down and play').click());
    await q.waitForTimeout(900);
    let m=await q.evaluate(()=>({open:[...document.querySelectorAll('[data-bcol]')].map(x=>!x.disabled).join(),wait:!!document.querySelector('.bones-wait')}));
    if(m.open!=='true,true,true'||m.wait)fail(tag+': after your first throw the columns open '+JSON.stringify(m));
    // tap the table over your left column
    const at=await q.evaluate(()=>{const r=document.getElementById('bonesCv').getBoundingClientRect(), S=Math.min(r.width*.48,r.height/1.85); return {x:r.left+r.width/2-.26*S,y:r.top+r.height*.8};});
    await q.waitForTimeout(200); await q.touchscreen.tap(at.x,at.y); await q.waitForTimeout(350);
    m=await q.evaluate(()=>({you:__t.BONES_ANIM&&__t.BONES_ANIM.mv.you.col===0?1:0,open:[...document.querySelectorAll('[data-bcol]')].map(x=>!x.disabled).join(),wait:!!document.querySelector('.bones-wait')}));
    if(m.you!==1||m.open!=='false,false,false'||!m.wait)fail(tag+': a tap on your left column sets the bone and the move plays out, columns shut '+JSON.stringify(m));
    await q.screenshot({path:(process.argv[3]||'.')+'/bones-move-'+tag+'.png'});
    await q.waitForTimeout(2600);
    m=await q.evaluate(()=>({open:[...document.querySelectorAll('[data-bcol]')].filter(x=>!x.disabled).length,wait:!!document.querySelector('.bones-wait'),die:__t.F.draft.room.die}));
    if(m.wait||m.open<2||!m.die)fail(tag+': after its move you have a new bone and open columns '+JSON.stringify(m));
    if(await painted()<50)fail(tag+': the table should still be painted');
    await q.screenshot({path:(process.argv[3]||'.')+'/bones-turn-'+tag+'.png'});
    // a second move, hurried by a tap on the table
    await q.evaluate(()=>document.querySelector('[data-bcol]:not([disabled])').click()); await q.waitForTimeout(250);
    await q.touchscreen.tap(at.x,at.y); await q.waitForTimeout(250);
    m=await q.evaluate(()=>({wait:!!document.querySelector('.bones-wait'),die:__t.F.draft.room.die}));
    if(m.wait||!m.die)fail(tag+': a tap during its move hurries it to your turn '+JSON.stringify(m));
    // the table's loop is one loop, and it stops once you leave the room
    const loops=await q.evaluate(async()=>{
      let n=0; const raf=window.requestAnimationFrame;
      window.requestAnimationFrame=cb=>{if(cb&&cb.name==='bonesFrame')n++; return raf(cb);};
      await new Promise(r=>setTimeout(r,500)); const open=n;
      __t.descend(); document.querySelector('#mapOverlay').hidden=true;
      await new Promise(r=>setTimeout(r,200)); n=0;
      await new Promise(r=>setTimeout(r,700)); window.requestAnimationFrame=raf; return {open,after:n};
    });
    console.log(tag+' table loop frames',JSON.stringify(loops));
    if(loops.open<10||loops.open>60)fail(tag+': one table loop while the room is open (frames in 0.5s) '+JSON.stringify(loops));
    if(loops.after!==0)fail(tag+': the table loop must stop after you leave '+JSON.stringify(loops));
    await q.close();
  }
  await b.close();
  if(fails)process.exitCode=1;
})();
