// node shot.js <outdir> [candidate.json]  — renders the Cistern on maps, lit and dark, with creatures, straight from the board's canvas
const {chromium}=require('playwright'); const fs=require('fs'), path=require('path');
const PNT=require('./painter.js');
const out=process.argv[2]||'out'; fs.mkdirSync(out,{recursive:true});
const cand=process.argv[3]?JSON.parse(fs.readFileSync(process.argv[3],'utf8')):null;
const VP={fold:{width:412,height:860},open:{width:832,height:694},land:{width:915,height:356}};
const which=(process.env.VPS||'fold').split(',');
const toURI=f=>f.startsWith('data:')?f:'data:image/png;base64,'+fs.readFileSync(f).toString('base64');
(async()=>{
  const b=await chromium.launch();
  for(const vk of which){
  const p=await b.newPage({viewport:VP[vk],deviceScaleFactor:2,hasTouch:true});
  p.on('pageerror',e=>console.log('PAGEERR',e.message)); p.on('console',m=>{if(m.type()==='error')console.log('CONSOLEERR',m.text());});
  await p.goto('file://'+path.join(__dirname,'game.x.html')); await p.waitForTimeout(800);
  if(cand){
    const c2=JSON.parse(JSON.stringify(cand)); if(c2.tiles)c2.tiles=toURI(c2.tiles);
    const imgs={}; for(const k in (c2.imgs||{}))imgs[k]=c2.imgs[k].map(toURI);
    await p.evaluate(async([c,imgs,PNT])=>{
      const ld=src=>new Promise(r=>{const im=new Image(); im.onload=()=>r(im); im.onerror=()=>r(null); im.src=src;});
      const X=__x, P=__t.PIX;
      if(c.tiles){P.tiles.cistern=await ld(c.tiles); X.PIX_AT.cistern=c.at;}
      if(c.TS)P.TS=c.TS;
      window.__cand=c.opts||{}; window.__candImg={};
      for(const k in imgs){window.__candImg[k]=[]; for(const s of imgs[k]){const im=await ld(s); if(im)window.__candImg[k].push(im);}}
      X.swap('paintBoardPixel',PNT.paint); X.swap('pixRift',PNT.rift);
    },[c2,imgs,{paint:PNT.paint,rift:PNT.rift}]);}
  for(const mv of (process.env.MAPS||'0,1,2').split(',').map(Number)){
    for(const lit of (process.env.LIT||'1,0').split(',').map(v=>v==='1')){
      const uri=await p.evaluate(([mv,lit,kinds])=>{const T=__t; window.devNoDark=lit; T.boardArtSet('pixel'); T.setMapV(mv); T.newRun('lamplighter',0,{seed:9}); T.run.floor=0; T.beginFloor(null);
        T.setP(false);
        if(window.__wards!==false){T.run.ess=9999; const R=__x.help.lampRadius(), P=T.F.pathTiles, isP=(x,y)=>P.has(x+','+y), spots=[];
          for(let y=0;y<T.ROWS;y++)for(let x=0;x<T.COLS;x++){if(isP(x,y))continue; const d=Math.hypot(x+.5-T.F.lx,y+.5-T.F.ly); if(d>R-.7||d<1.2)continue;
            if(isP(x+1,y)||isP(x-1,y)||isP(x,y+1)||isP(x,y-1))spots.push([x,y,d]);}
          spots.sort((a,b)=>b[2]-a[2]); const put=[];
          for(const [x,y] of spots){if(put.length>=3)break; if(put.some(([a,b])=>Math.abs(a-x)+Math.abs(b-y)<3))continue; T.setSel({kind:'ward',type:put.length===1?'harpoon':'candle'}); T.tryPlace(x,y); T.setSel(null); put.push([x,y]);}
          for(let i=0;i<3;i++)T.update(1/30);}
        T.F.phase='wave'; T.F.queue=[{t:1e9,type:'crawler',gate:0}];
        const roots=T.F.nRoots;
        kinds.forEach((k,i)=>{const L=T.F.paths[i%roots]; const e=T.spawnFoe(k,i%roots,L.len*(.08+.84*(i/kinds.length))); e.hp=e.max=1e6;});
        for(let i=0;i<3;i++)T.update(1/30);
        T.render(); return document.getElementById('board').toDataURL('image/png');},[mv,lit,(process.env.KINDS||'crawler,skitter,gnasher,watcher,shade,wretch,shrieker,gibberer,gorger,husk,stalker,elite,behemoth').split(',')]);
      fs.writeFileSync(path.join(out,`${vk}-m${mv}-${lit?'lit':'dark'}.png`),Buffer.from(uri.split(',')[1],'base64'));
    }
  }
  await p.close();}
  await b.close();
})();
