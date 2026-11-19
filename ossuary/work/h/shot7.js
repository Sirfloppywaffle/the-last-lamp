// node shot7.js <outdir> <cand.json>: the Ossuary (floor 1) laid by the game itself with candidate art swapped in, on its three maps,
// lit and dark, with wards and creatures; cand = {tiles, at, floor:{...PIX_FLOOR row}, atlas, src?:{name:file}}
const {chromium}=require('playwright'); const fs=require('fs'), path=require('path');
const out=process.argv[2]; fs.mkdirSync(out,{recursive:true});
const cand=JSON.parse(fs.readFileSync(process.argv[3],'utf8'));
const VP={fold:{width:412,height:860},open:{width:832,height:694},land:{width:915,height:356}};
const toURI=f=>'data:image/png;base64,'+fs.readFileSync(f).toString('base64');
(async()=>{
  const b=await chromium.launch();
  for(const vk of (process.env.VPS||'fold').split(',')){
    const p=await b.newPage({viewport:VP[vk],deviceScaleFactor:2,hasTouch:true});
    p.on('pageerror',e=>console.log('PAGEERR',e.message)); p.on('console',m=>{if(m.type()==='error')console.log('CONSOLEERR',m.text());});
    await p.goto('file://'+path.join(__dirname,'game.x.html')); await p.waitForTimeout(800);
    await p.evaluate(async([tiles,at,floor,atlas,code])=>{
      const ld=src=>new Promise(r=>{const im=new Image(); im.onload=()=>r(im); im.onerror=()=>r(null); im.src=src;});
      const X=__x, P=__t.PIX;
      P.tiles.ossuary=await ld(tiles); X.PIX_AT.ossuary=at; X.PIX_FLOOR.ossuary=floor; if(atlas)P.props.ossuary=await ld(atlas);
      if(code)X.swap('paintBoardPixel',code);
    },[toURI(cand.tiles),cand.at,cand.floor,cand.atlas?toURI(cand.atlas):null,cand.code?fs.readFileSync(cand.code,'utf8'):null]);
    for(const mv of (process.env.MAPS||'0,1,2').split(',').map(Number)){
      for(const lit of (process.env.LIT||'1,0').split(',').map(v=>v==='1')){
        const uri=await p.evaluate(([mv,lit,nw,kinds])=>{const T=__t; window.devNoDark=lit; T.boardArtSet('pixel'); T.setMapV(mv); T.newRun('lamplighter',0,{seed:9}); T.run.floor=1; T.beginFloor(null);
          T.setP(false);
          T.run.ess=9999; const R=__x.help.lampRadius(), P=T.F.pathTiles, isP=(x,y)=>P.has(x+','+y), spots=[];
          for(let y=0;y<T.ROWS;y++)for(let x=0;x<T.COLS;x++){if(isP(x,y))continue; const d=Math.hypot(x+.5-T.F.lx,y+.5-T.F.ly); if(d>R-.7||d<1.2)continue;
            if(isP(x+1,y)||isP(x-1,y)||isP(x,y+1)||isP(x,y-1))spots.push([x,y,d]);}
          spots.sort((a,b)=>b[2]-a[2]); const put=[], wk=['candle','harpoon','candle','salt','chime','candle','harpoon','tithe'];
          for(const [x,y] of spots){if(put.length>=nw)break; if(put.some(([a,b])=>Math.abs(a-x)+Math.abs(b-y)<3))continue; T.setSel({kind:'ward',type:wk[put.length%wk.length]}); T.tryPlace(x,y); T.setSel(null); put.push([x,y]);}
          for(let i=0;i<3;i++)T.update(1/30);
          T.F.phase='wave'; T.F.queue=[{t:1e9,type:'crawler',gate:0}];
          const roots=T.F.nRoots;
          kinds.forEach((k,i)=>{const L=T.F.paths[i%roots]; const e=T.spawnFoe(k,i%roots,L.len*(.08+.84*(i/kinds.length))); e.hp=e.max=1e6;});
          for(let i=0;i<3;i++)T.update(1/30);
          T.render(); return document.getElementById('board').toDataURL('image/png');},[mv,lit,+(process.env.WARDS||4),(process.env.KINDS||'crawler,skitter,gnasher,watcher,shade,wretch,shrieker,gibberer,gorger,husk,stalker,elite,behemoth').split(',')]);
        fs.writeFileSync(path.join(out,`${vk}-m${mv}-${lit?'lit':'dark'}.png`),Buffer.from(uri.split(',')[1],'base64'));
      }
    }
    await p.close();}
  await b.close();
})();
