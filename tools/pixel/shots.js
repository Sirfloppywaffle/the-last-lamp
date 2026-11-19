// node tools/pixel/shots.js <out_dir> <cand.json>
// A floor laid by the game itself with candidate art swapped in, before any of it goes into index.html (pixel stair steps 6c and 7):
// each of the floor's maps, lit everywhere (window.devNoDark) and as played, with wards built beside the path and every creature on it.
// cand.json: {"deco":"ossuary","floor":1,"tiles":"cut.png","at":[16 x [x,y]],"row":{a PIX_FLOOR row},"atlas":"atlas.png"}, paths relative
// to it. Env: MAPS (0,1,2), LIT (1,0), VPS (fold, open, land), WARDS (4), KINDS (the creatures). Writes <vp>-m<map>-<lit|dark>.png, and the
// hooked copy of the game it ran (game.x.html). Uses tests/hook.js, so run it from the repo; it needs Playwright as the tests do.
const {chromium}=require('playwright'); const fs=require('fs'), path=require('path');
const out=path.resolve(process.argv[2]); fs.mkdirSync(out,{recursive:true});
const cf=path.resolve(process.argv[3]), cand=JSON.parse(fs.readFileSync(cf,'utf8')), rel=f=>path.resolve(path.dirname(cf),f);
const {build}=require(path.join(__dirname,'../../tests/hook.js'));
let s=fs.readFileSync(build().hooked,'utf8'); const i=s.lastIndexOf('})();');
s=s.slice(0,i)+`window.__x={get PIX_AT(){return PIX_AT},get PIX_FLOOR(){return PIX_FLOOR},swap(name,src){eval(name+'=('+src+')('+name+')');},
 lampRadius:()=>lampRadius()};\n`+s.slice(i);
const game=path.join(out,'game.x.html'); fs.writeFileSync(game,s);
const VP={fold:{width:412,height:860},open:{width:832,height:694},land:{width:915,height:356}};
const uri=f=>'data:image/png;base64,'+fs.readFileSync(rel(f)).toString('base64');
(async()=>{
  const b=await chromium.launch();
  for(const vk of (process.env.VPS||'fold').split(',')){
    const p=await b.newPage({viewport:VP[vk],deviceScaleFactor:2,hasTouch:true});
    p.on('pageerror',e=>console.log('PAGEERR',e.message));
    await p.goto('file://'+game); await p.waitForTimeout(800);
    await p.evaluate(async([deco,tiles,at,row,atlas])=>{
      const ld=src=>new Promise(r=>{const im=new Image(); im.onload=()=>r(im); im.onerror=()=>r(null); im.src=src;});
      const P=__t.PIX; P.tiles[deco]=await ld(tiles); __x.PIX_AT[deco]=at; __x.PIX_FLOOR[deco]=row; if(atlas)P.props[deco]=await ld(atlas);
    },[cand.deco,uri(cand.tiles),cand.at,cand.row,cand.atlas?uri(cand.atlas):null]);
    for(const mv of (process.env.MAPS||'0,1,2').split(',').map(Number))for(const lit of (process.env.LIT||'1,0').split(',').map(v=>v==='1')){
      const png=await p.evaluate(([mv,lit,floor,nw,kinds])=>{const T=__t; window.devNoDark=lit; T.boardArtSet('pixel'); T.setMapV(mv);
        T.newRun('lamplighter',0,{seed:9}); T.run.floor=floor; T.beginFloor(null); T.setP(false); T.run.ess=9999;
        const R=__x.lampRadius(), P=T.F.pathTiles, isP=(x,y)=>P.has(x+','+y), spots=[];
        for(let y=0;y<T.ROWS;y++)for(let x=0;x<T.COLS;x++){if(isP(x,y))continue; const d=Math.hypot(x+.5-T.F.lx,y+.5-T.F.ly); if(d>R-.7||d<1.2)continue;
          if(isP(x+1,y)||isP(x-1,y)||isP(x,y+1)||isP(x,y-1))spots.push([x,y,d]);}
        spots.sort((a,b)=>b[2]-a[2]); const put=[], wk=['candle','harpoon','candle','salt','chime','candle','harpoon','tithe'];
        for(const [x,y] of spots){if(put.length>=nw)break; if(put.some(([a,b])=>Math.abs(a-x)+Math.abs(b-y)<3))continue;
          T.setSel({kind:'ward',type:wk[put.length%wk.length]}); T.tryPlace(x,y); T.setSel(null); put.push([x,y]);}
        for(let i=0;i<3;i++)T.update(1/30);
        T.F.phase='wave'; T.F.queue=[{t:1e9,type:'crawler',gate:0}];
        kinds.forEach((k,i)=>{const L=T.F.paths[i%T.F.nRoots]; const e=T.spawnFoe(k,i%T.F.nRoots,L.len*(.08+.84*(i/kinds.length))); e.hp=e.max=1e6;});
        for(let i=0;i<3;i++)T.update(1/30);
        T.render(); return document.getElementById('board').toDataURL('image/png');},
        [mv,lit,cand.floor,+(process.env.WARDS||4),(process.env.KINDS||'crawler,skitter,gnasher,watcher,shade,wretch,shrieker,gibberer,gorger,husk,stalker,elite,behemoth').split(',')]);
      const f=path.join(out,`${vk}-m${mv}-${lit?'lit':'dark'}.png`); fs.writeFileSync(f,Buffer.from(png.split(',')[1],'base64')); console.log(f);
    }
    await p.close();}
  await b.close();
})();
