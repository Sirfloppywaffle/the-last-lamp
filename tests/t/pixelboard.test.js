// The pixel board (pilot): Settings turns it on and keeps it; on the Cistern the floor is laid in pixel tiles from the path (every
// map of the floor: a channel square is water, a floor square is stone) and the five piloted creatures come from their sheets,
// lit, dark and as echoes; every other floor and every other creature is painted as before; turning it off puts the paint back.
const {chromium}=require('playwright');
const fails=[]; const ok=(c,m,d)=>{if(!c)fails.push(m+(d!==undefined?' '+JSON.stringify(d):''));};
(async()=>{
  const b=await chromium.launch(); const p=await b.newPage({viewport:{width:412,height:860},hasTouch:true});
  await p.goto('file://'+process.argv[2]); await p.waitForTimeout(600);
  const set=await p.evaluate(()=>{const T=__t, o={a0:T.boardArt}; document.getElementById('settingsBtn').click(); const bt=document.getElementById('artBtn'); o.l0=bt.textContent; bt.click(); o.l1=bt.textContent; o.a1=T.boardArt; o.st=localStorage.getItem('ll-board');
    [...document.querySelectorAll('#mActions button')].find(x=>/Close|Back/.test(x.textContent)).click(); return o;});
  ok(set.a0==='painted'&&/Painted/.test(set.l0)&&/Pixel \(pilot\)/.test(set.l1)&&set.a1==='pixel'&&/pixel/.test(set.st||''),'Settings turns the pixel board on and keeps it',set);
  for(const mv of [0,1,2]){
    const r=await p.evaluate((mv)=>{const T=__t; T.setMapV(mv); T.newRun('lamplighter',0,{seed:9}); T.run.floor=0; T.beginFloor(null); T.setP(false); T.F.phase='wave'; T.F.queue=[{t:1e9,type:'crawler',gate:0}];
      const o={pix:T.pixOn()}, cv=T.floorPx.canvas, g=T.floorPx, s=cv.width/T.COLS;
      const at=(x,y)=>{const d=g.getImageData(Math.round((x+.5)*s),Math.round((y+.5)*s),1,1).data; return [d[0],d[1],d[2]];};
      /* a square of the channel well away from its banks, and a square of floor with floor all round it */
      const P=T.F.pathTiles, isP=(x,y)=>P.has(x+','+y); let water=null, stone=null;
      for(let y=1;y<T.ROWS-1;y++)for(let x=1;x<T.COLS-1;x++){const n=[[1,0],[-1,0],[0,1],[0,-1]].filter(([a,c])=>isP(x+a,y+c)).length;
        if(isP(x,y)&&n>=2&&!water&&Math.hypot(x+.5-T.F.lx,y+.5-T.F.ly)>2)water=at(x,y);
        if(!isP(x,y)&&n===0&&!stone&&!isP(x+1,y+1)&&!isP(x-1,y-1)&&!isP(x+1,y-1)&&!isP(x-1,y+1)&&Math.hypot(x+.5-T.F.lx,y+.5-T.F.ly)>2)stone=at(x,y);}
      o.water=water; o.stone=stone; o.n=T.PIX.water?T.PIX.water.length/4:0; o.paths=P.size;
      const kinds=['crawler','skitter','gnasher','watcher','shade']; o.px=kinds.every(k=>T.artOf(k).pix); o.other=!T.artOf('wretch').pix&&!T.artOf('boss').pix;
      const L=T.F.paths[0]; kinds.concat(['wretch']).forEach((k,i)=>{const e=T.spawnFoe(k,0,L.len*(.1+.13*i)); e.hp=e.max=1e6;});
      for(let i=0;i<40;i++){T.update(1/30); T.render();} o.sprites=T.nSprites;
      return o;},mv);
    ok(r.pix,'map '+mv+': the Cistern is a pixel floor',r);
    ok(r.water&&r.water[2]>r.water[0]&&r.water[0]<60,'map '+mv+': a square of the channel is dark water',r.water);
    ok(r.stone&&r.stone[0]>r.water[0]+8&&Math.abs(r.stone[0]-r.stone[2])<60,'map '+mv+': a square of the floor is stone',r.stone);
    ok(r.n===r.paths&&r.n>10,'map '+mv+': the water under the lamplight is the path, square for square',[r.n,r.paths]);
    ok(r.px&&r.other,'map '+mv+': the five piloted creatures come from their sheets, the rest are painted',r);
    ok(r.sprites>0,'map '+mv+': they draw, lit and dark',r.sprites);
  }
  const rest=await p.evaluate(()=>{const T=__t, o={}; T.setMapV(0); T.newRun('lamplighter',0,{seed:9}); T.run.floor=1; T.beginFloor(null); o.ossuary=T.pixOn(); o.art=!!T.artOf('gnasher').pix;
    T.run.floor=0; T.beginFloor(null); T.boardArtSet('painted'); o.off=T.pixOn(); o.artOff=!!T.artOf('gnasher').pix; o.st=localStorage.getItem('ll-board'); T.setP(false); for(let i=0;i<5;i++)T.render(); return o;});
  ok(!rest.ossuary&&!rest.art,'every other floor is painted, creatures and all',rest);
  ok(!rest.off&&!rest.artOff&&/painted/.test(rest.st||''),'turned off, the paint is back',rest);
  for(const f of fails)console.log('FAIL '+f);
  if(fails.length)process.exitCode=1; else console.log('pixelboard: all ok');
  await b.close();
})();
