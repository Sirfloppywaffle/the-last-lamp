// Preloaded into every test (node -r ./guard.js). Any uncaught page error, or any console.error from the
// game (its error handler logs there), is printed with a marker the runner treats as a failure.
// Font downloads that fail in offline sandboxes are ignored.
const pw=require('playwright');
const IGNORE=/Failed to load resource|ERR_TUNNEL|ERR_NAME_NOT_RESOLVED|ERR_INTERNET_DISCONNECTED|fonts\.(googleapis|gstatic)\.com/;
const watch=(page)=>{
  if(page.__guarded)return; page.__guarded=true;
  page.on('pageerror',e=>console.log('PAGEERR '+e.message));
  page.on('console',m=>{if(m.type()==='error'&&!IGNORE.test(m.text()))console.log('CONSOLEERR '+m.text().slice(0,300));});
};
const launch=pw.chromium.launch.bind(pw.chromium);
pw.chromium.launch=async(...a)=>{
  const b=await launch(...a);
  const newContext=b.newContext.bind(b);
  b.newContext=async(...x)=>{const c=await newContext(...x); c.on('page',watch); return c;};
  const newPage=b.newPage.bind(b);
  b.newPage=async(...x)=>{const p=await newPage(...x); watch(p); return p;};
  return b;
};
