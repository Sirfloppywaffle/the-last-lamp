// Regression for v14: with a ward selected on an unfolded Fold, every lit tile in the bottom rows can be
// tapped. (Before v14 the placement card covered them: 43 tiles could not be placed.)
const {chromium}=require('playwright');
(async()=>{
  const b=await chromium.launch();
  const ctx=await b.newContext({viewport:{width:832,height:694},deviceScaleFactor:2.6,hasTouch:true,isMobile:true});
  const p=await ctx.newPage();
  await p.goto('file://'+process.argv[2]); await p.waitForTimeout(400);
  let tiles=0, placed=0;
  for(const fl of [0,1,2,3,4]){
    const list=await p.evaluate((fl)=>{const T=__t; T.newRun(); T.run.floor=fl; T.beginFloor(null); T.run.ess=5000; const it={kind:'ward',type:'candle'};
      // light the lower rows with candles, as a player would
      T.setSel(it); let s=7; const rnd=()=>{s=(s*9301+49297)%233280; return s/233280;};
      for(let pass=0;pass<4;pass++)for(let r=T.ROWS-6;r<T.ROWS-2;r++)for(let c=0;c<T.COLS;c++)if(!T.placeProblem(it,c,r)&&rnd()<.5){T.setSel(it); T.tryPlace(c,r);}
      /* placing puts the choice away, so pick the candle again before tapping */
      T.setSel(it); T.forceUI();
      const q=document.getElementById('board').getBoundingClientRect(), s2=q.width/T.COLS, out=[];
      for(let r=T.ROWS-2;r<T.ROWS;r++)for(let c=0;c<T.COLS;c++)if(!T.placeProblem(it,c,r))out.push([q.left+(c+.5)*s2,q.top+(r+.5)*s2]);
      return out;},fl);
    for(const [x,y] of list){
      tiles++;
      const n0=await p.evaluate(()=>__t.F.towers.length);
      await p.touchscreen.tap(x,y); await p.waitForTimeout(80);
      if(await p.evaluate(()=>__t.F.towers.length)>n0)placed++;
      await p.evaluate(()=>{__t.setSel({kind:'ward',type:'candle'}); __t.forceUI();});
    }
  }
  console.log('bottom-row tiles',tiles,'placed by tapping',placed);
  if(tiles<10||placed!==tiles){console.log('FAIL some bottom tiles could not be tapped'); process.exitCode=1;}
  await b.close();
})();
