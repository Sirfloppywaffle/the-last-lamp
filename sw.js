/* The Last Lamp: the service worker (10 Nov 2026). It does two things and no more.
   It lets the game be installed and played with no signal: the page, the icons and the fonts are kept on the device.
   And it never keeps an old game from a new one. The whole game is one page, and the page is always asked of the network first;
   the kept copy is only for when the network does not answer. So a game installed months ago plays today's version the next time
   it is opened with a signal, with nothing to bump here: CACHE only changes if what is kept, or how, changes.
   A slow network is not waited on for long (PAGE_WAIT): the kept game opens, the new one is kept as it arrives, and the page is told
   ('ll-update') so the title can offer it.
   A pull request's preview (…/pr-12/) is never this worker's business: those are fetched as if it were not here. */
const CACHE='last-lamp-v1', PAGE_WAIT=3500, PAGE_KEY='./', PREVIEW=/\/pr-\d+\//;
const SHELL=['manifest.webmanifest','icons/icon-192.png','icons/icon-512.png','icons/icon-maskable-512.png'];

self.addEventListener('install',ev=>{
  ev.waitUntil(caches.open(CACHE)
    .then(c=>Promise.all([fetch(PAGE_KEY,{cache:'no-store'}).then(r=>r.ok?c.put(PAGE_KEY,r):null).catch(()=>null)].concat(SHELL.map(u=>c.add(u).catch(()=>null)))))
    .then(()=>self.skipWaiting()));
});
self.addEventListener('activate',ev=>{
  ev.waitUntil(caches.keys()
    .then(ks=>Promise.all(ks.filter(k=>k.startsWith('last-lamp-')&&k!==CACHE).map(k=>caches.delete(k))))
    .then(()=>self.clients.claim()));
});

const stamp=r=>r?(r.headers.get('etag')||r.headers.get('last-modified')||r.headers.get('content-length')||''):'';
function tell(){self.clients.matchAll({type:'window'}).then(cs=>{for(const c of cs)c.postMessage({type:'ll-update'});}).catch(()=>{});}

/* the game itself: the network first, the kept copy if it does not answer in time */
async function page(url){
  const c=await caches.open(CACHE), kept=await c.match(PAGE_KEY);
  const net=fetch(url,{cache:'no-store',credentials:'same-origin'}).then(r=>{if(r&&r.ok)c.put(PAGE_KEY,r.clone()); return r;});
  if(!kept)return net;
  let timer=0; const slow=new Promise(res=>{timer=setTimeout(()=>res(null),PAGE_WAIT);});
  const first=await Promise.race([net.catch(()=>null),slow]); clearTimeout(timer);
  if(first&&first.ok)return first;
  /* the kept game now; if the new one arrives after all and is not the same, say so */
  net.then(r=>{if(r&&r.ok&&stamp(r)!==stamp(kept))tell();}).catch(()=>{});
  return kept;
}
/* the small files beside it: fresh when there is a signal, kept when there is none */
async function fresh(req){
  const c=await caches.open(CACHE);
  try{const r=await fetch(req); if(r&&r.ok)c.put(req,r.clone()); return r;}
  catch(e){const k=await c.match(req); if(k)return k; throw e;}
}
/* the fonts: kept once fetched, and quietly renewed */
async function font(req){
  const c=await caches.open(CACHE), k=await c.match(req);
  const net=fetch(req).then(r=>{if(r&&(r.ok||r.type==='opaque'))c.put(req,r.clone()); return r;});
  if(k){net.catch(()=>{}); return k;}
  return net;
}

self.addEventListener('fetch',ev=>{
  const req=ev.request; if(req.method!=='GET')return;
  const url=new URL(req.url), base=new URL('./',self.location).pathname;
  if(url.origin===self.location.origin){
    if(PREVIEW.test(url.pathname)||!url.pathname.startsWith(base))return;
    const rest=url.pathname.slice(base.length);
    if(req.mode==='navigate'||rest===''||rest==='index.html'){ev.respondWith(page(new URL('./',self.location).href)); return;}
    ev.respondWith(fresh(req)); return;
  }
  if(/(^|\.)fonts\.(googleapis|gstatic)\.com$/.test(url.hostname))ev.respondWith(font(req));
});
