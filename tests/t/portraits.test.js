// The Roster's pixel portraits: every Keeper has a sheet; a portrait asked for comes from it, moving frame by frame; locked, it is
// a shape in the dark with only what burns left; Reduce Motion holds the first frame; and the Roster shows them.
const {chromium}=require('playwright');
const fails=[]; const ok=(c,m,d)=>{if(!c)fails.push(m+(d!==undefined?' '+JSON.stringify(d):''));};
(async()=>{
  const b=await chromium.launch(); const p=await b.newPage({viewport:{width:412,height:860},hasTouch:true});
  await p.goto('file://'+process.argv[2]); await p.waitForTimeout(700);
  const r=await p.evaluate(async()=>{const T=__t, o={kits:Object.keys(T.PORT_PX), loaded:Object.keys(T.PORT_PX).every(k=>!!T.PORT_PX[k].img)};
    const lum=cv=>{const d=cv.getContext('2d').getImageData(0,0,cv.width,cv.height).data; let s=0,bright=0; for(let i=0;i<d.length;i+=4){const l=d[i]*.5+d[i+1]*.4+d[i+2]*.1; s+=l; if(l>60)bright++;} return [Math.round(s/(d.length/4)),bright];};
    o.each={}; for(const k of o.kits){const lit=T.portraitCanvas(k,false,0,0), lock=T.portraitCanvas(k,true,0,0); o.each[k]={size:[lit.width,lit.height],lit:lum(lit),lock:lum(lock)};}
    const seen=new Set(); for(let i=0;i<14;i++){seen.add(T.portraitCanvas('galvanist',false,0,0)); await new Promise(r=>setTimeout(r,90));} o.frames=seen.size;
    return o;});
  ok(r.kits.length===5&&r.loaded,'all five Keepers have a sheet, loaded',r.kits);
  for(const k in r.each){const e=r.each[k]; ok(e.size[0]===300&&e.size[1]===400,k+': a portrait is the Roster\'s size',e.size);
    ok(e.lit[1]>8000,k+': lit, there is a figure to see',e.lit); ok(e.lock[0]<e.lit[0]*.6&&e.lock[1]>20&&e.lock[1]<e.lit[1]*.35,k+': locked, a shape in the dark with only what burns',e);}
  ok(r.frames>=5,'a portrait moves, frame by frame',r.frames);
  await p.evaluate(()=>{document.getElementById('descendBtn').click();}); await p.waitForTimeout(900);
  const shown=await p.evaluate(()=>{const cv=document.querySelector('#rostRow canvas'); if(!cv)return null; const d=cv.getContext('2d').getImageData(0,0,cv.width,cv.height).data; let n=0; for(let i=0;i<d.length;i+=4)if(d[i]+d[i+1]+d[i+2]>150)n++; return n;});
  ok(shown>500,'the Roster shows them',shown);
  /* on the Roster itself every Keeper's card moves, Ambrose's and Jonah's too (Criss, on #169: theirs stood still) */
  const moved=await p.evaluate(async()=>{__t.setDev(true); const sig=cv=>{const d=cv.getContext('2d').getImageData(0,0,cv.width,cv.height).data; let h=0; for(let i=0;i<d.length;i+=16)h=(h*31+d[i]+d[i+1])|0; return h;};
    const o={}; for(let n=0;n<16;n++){document.querySelectorAll('#rostRow canvas[data-port]').forEach(cv=>{(o[cv.dataset.port]=o[cv.dataset.port]||new Set()).add(sig(cv));}); await new Promise(r=>setTimeout(r,160));}
    const out={}; for(const k in o)out[k]=o[k].size; return out;});
  for(const k of ['lamplighter','whaler','occultist','galvanist','bellringer'])ok(moved[k]>=3,k+': its card on the Roster moves',moved);
  await p.screenshot({path:(process.argv[3]||'.')+'/roster-fold-closed.png'});
  for(const f of fails)console.log('FAIL '+f);
  if(fails.length)process.exitCode=1; else console.log('portraits: all ok');
  await b.close();
})();
