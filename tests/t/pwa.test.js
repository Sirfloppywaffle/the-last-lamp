// Install and offline (10 Nov 2026), played against a small local server: the game registers its service worker and its manifest,
// opens with the server gone, plays a NEW version the next time it opens with the server back (an installed game is never stuck
// on an old one), opens the kept game when the network is too slow and then offers the new one on the title, and leaves a pull
// request's preview alone. From a file on disk (every other test) none of it runs.
const {chromium}=require('playwright');
const http=require('http'), fs=require('fs'), path=require('path');
const fails=[]; const ok=(c,m,d)=>{if(!c)fails.push(m+(d!==undefined?' '+JSON.stringify(d):''));};
const root=path.dirname(process.env.LL_RAW);
let ver='20.0.0', down=false, delay=0;
const srv=http.createServer((req,res)=>{
  if(down){req.socket.destroy(); return;}
  let u=decodeURIComponent(req.url.split('?')[0]), preview=false; const m=u.match(/^\/pr-(\d+)\/(.*)$/); if(m){preview=true; u='/'+m[2];}
  if(u==='/'||u==='/index.html'){
    let s=fs.readFileSync(path.join(root,'index.html'),'utf8').replace(/const GAME_VERSION='[^']*'/,"const GAME_VERSION='"+ver+"'");
    if(preview)s=s.replace('<head>',"<head>\n<script>window.LL_STORE_NS='pr7:';</script>");
    const send=()=>{res.writeHead(200,{'content-type':'text/html; charset=utf-8','etag':'"'+ver+'"','cache-control':'no-cache'}); res.end(s);};
    if(delay)setTimeout(send,delay); else send(); return;}
  const f=path.join(root,u);
  if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){res.writeHead(404); res.end(); return;}
  const type=u.endsWith('.js')?'text/javascript':u.endsWith('.png')?'image/png':u.endsWith('.webmanifest')?'application/manifest+json':'application/octet-stream';
  res.writeHead(200,{'content-type':type,'cache-control':'no-cache'}); res.end(fs.readFileSync(f));
});
(async()=>{
  await new Promise(r=>srv.listen(0,'127.0.0.1',r)); const base='http://127.0.0.1:'+srv.address().port+'/';
  const b=await chromium.launch(); const ctx=await b.newContext({viewport:{width:412,height:860}}); const p=await ctx.newPage();
  const verLine=()=>p.evaluate(()=>document.querySelector('#verLine').textContent);
  await p.goto(base); await p.waitForTimeout(300);
  const ready=await p.evaluate(async()=>{const r=await navigator.serviceWorker.ready; for(let i=0;i<80&&!navigator.serviceWorker.controller;i++)await new Promise(x=>setTimeout(x,100));
    const man=document.querySelector('link[rel=manifest]'), o={scope:r.scope,ctl:!!navigator.serviceWorker.controller,man:man&&man.getAttribute('href')};
    const m=await (await fetch(man.href)).json(); o.name=m.name; o.start=m.start_url; o.scopeM=m.scope; o.display=m.display; o.icons=[];
    for(const ic of m.icons){const r=await fetch(new URL(ic.src,man.href)); o.icons.push([ic.sizes,ic.purpose,r.status,r.headers.get('content-type')]);}
    return o;});
  ok(ready.ctl&&ready.scope===base,'the service worker registers and takes the page',ready);
  ok(ready.name==='The Last Lamp'&&ready.start==='./'&&ready.scopeM==='./'&&ready.display==='fullscreen','the manifest names the game and keeps to its own folder',ready);
  ok(ready.icons.length===3&&ready.icons.every(i=>i[2]===200&&/png/.test(i[3])),'every icon in the manifest is there',ready.icons);
  ok(await verLine()==='Version 20.0.0','the game opens',await verLine());
  // with no signal
  down=true; await p.reload({waitUntil:'domcontentloaded'}); await p.waitForTimeout(400);
  ok(await verLine()==='Version 20.0.0','with the server gone, the kept game opens',await verLine().catch(e=>e.message));
  const offlineIcons=await p.evaluate(async()=>{try{return (await fetch('icons/icon-192.png')).status;}catch(e){return e.message;}});
  ok(offlineIcons===200,'and its icon with it',offlineIcons);
  // a new version reaches an installed game the next time it opens with a signal
  down=false; ver='99.0.0'; await p.reload({waitUntil:'domcontentloaded'}); await p.waitForTimeout(400);
  ok(await verLine()==='Version 99.0.0','back with a signal, the newest game opens, not the kept one',await verLine());
  down=true; await p.reload({waitUntil:'domcontentloaded'}); await p.waitForTimeout(300);
  ok(await verLine()==='Version 99.0.0','and that newest game is the one kept from then on',await verLine());
  // a network too slow to wait for: the kept game now, the new one offered on the title
  down=false; delay=5200; ver='99.1.0'; const t0=Date.now(); await p.reload({waitUntil:'domcontentloaded'}); const took=Date.now()-t0; await p.waitForTimeout(300);
  ok(await verLine()==='Version 99.0.0'&&took<5000,'a slow network is not waited on: the kept game opens',[await verLine(),took]);
  const hid0=await p.evaluate(()=>document.querySelector('#updBtn').hidden);
  await p.waitForFunction(()=>!document.querySelector('#updBtn').hidden,null,{timeout:9000}).catch(()=>{});
  const hid1=await p.evaluate(()=>document.querySelector('#updBtn').hidden);
  ok(hid0&&!hid1,'when the new one arrives, the title offers it',[hid0,hid1]);
  delay=0; await p.click('#titleStrike'); await p.waitForTimeout(200);
  await Promise.all([p.waitForNavigation({waitUntil:'domcontentloaded'}),p.click('#updBtn')]); await p.waitForTimeout(300);
  ok(await verLine()==='Version 99.1.0','and a tap loads it',await verLine());
  // a pull request's preview is left alone
  ver='55.0.0'; await p.goto(base+'pr-7/'); await p.waitForTimeout(400);
  const pv=await p.evaluate(()=>({man:!!document.querySelector('link[rel=manifest]'),ver:document.querySelector('#verLine').textContent}));
  ok(!pv.man&&/^Version 55\.0\.0/.test(pv.ver),'a preview registers nothing and is fetched fresh, never from what is kept',pv);
  await ctx.close();
  // from a file on disk: nothing
  const q=await b.newPage(); await q.goto('file://'+process.argv[2]); await q.waitForTimeout(300);
  const fl=await q.evaluate(()=>({web:__t.INSTALL.web,row:__t.installRow(),man:!!document.querySelector('link[rel=manifest]')}));
  ok(!fl.web&&fl.row===''&&!fl.man,'opened from a file, nothing is registered and Settings says nothing of it',fl);
  for(const f of fails)console.log('FAIL '+f);
  if(fails.length)process.exitCode=1; else console.log('pwa: all ok');
  await b.close(); srv.close(); srv.closeAllConnections&&srv.closeAllConnections();
})();
