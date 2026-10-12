// Pull-request previews set window.LL_STORE_NS so they never touch the real save.
const {chromium}=require('playwright');
(async()=>{
  const b=await chromium.launch(); let fail=false;
  for(const ns of ['', 'pr7:']){
    const ctx=await b.newContext(); const p=await ctx.newPage();
    if(ns)await p.addInitScript(n=>{window.LL_STORE_NS=n;},ns);
    await p.goto('file://'+process.argv[2]); await p.waitForTimeout(300);
    const keys=await p.evaluate(()=>{const T=__t; T.newRun(); return Object.keys(localStorage);});
    const want=ns+'ll-save-v2', stray=keys.filter(k=>ns?!k.startsWith(ns):k.includes(':'));
    console.log(JSON.stringify(ns),'keys',keys);
    if(!keys.includes(want)||stray.length){console.log('FAIL save namespace '+JSON.stringify(ns)+' wrote '+JSON.stringify(keys)); fail=true;}
    await ctx.close();
  }
  if(fail)process.exitCode=1;
  await b.close();
})();
