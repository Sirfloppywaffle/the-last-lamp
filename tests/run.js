// Runs the whole suite: static checks first, then every t/*.test.js in a headless browser.
//   node run.js                 everything
//   node run.js --only map      just tests whose name contains "map"
//   node run.js --shots         keep going and print where screenshots went
// A test fails if it exits non-zero, prints "FAIL", or the guard reports a page/console error.
const {spawnSync}=require('child_process'), fs=require('fs'), path=require('path');
const {build}=require('./hook');
const args=process.argv.slice(2), only=args.includes('--only')?args[args.indexOf('--only')+1]:null;

const check=spawnSync(process.execPath,[path.join(__dirname,'check.js')],{stdio:'inherit'});
if(check.status!==0&&!only){console.error('\nStatic checks failed; fix those first.'); process.exit(1);}

const {hooked,raw}=build();
const shotsRoot=path.join(__dirname,'.build','shots'); fs.mkdirSync(shotsRoot,{recursive:true});
const tests=fs.readdirSync(path.join(__dirname,'t')).filter(f=>f.endsWith('.test.js')).filter(f=>!only||f.includes(only)).sort();
const results=[]; const t0=Date.now();
for(const f of tests){
  const name=f.replace('.test.js',''), shots=path.join(shotsRoot,name); fs.mkdirSync(shots,{recursive:true});
  const s=Date.now();
  const r=spawnSync(process.execPath,['-r',path.join(__dirname,'guard.js'),path.join(__dirname,'t',f),hooked,shots],
    {cwd:shots,encoding:'utf8',env:{...process.env,LL_RAW:raw},timeout:10*60*1000,maxBuffer:64*1024*1024});
  const out=(r.stdout||'')+(r.stderr||'');
  const bad=out.split('\n').filter(l=>/^(FAIL|PAGEERR|CONSOLEERR)\b/.test(l.trim()));
  const pass=r.status===0&&!bad.length;
  results.push({name,pass,secs:((Date.now()-s)/1000).toFixed(1),bad,out,status:r.status,signal:r.signal});
  console.log((pass?'✓':'✗')+' '+name.padEnd(16)+' '+results.at(-1).secs+'s'+(pass?'':'  ← '+(bad[0]||('exit '+r.status+(r.signal?' '+r.signal:'')))));
}
const failed=results.filter(r=>!r.pass);
for(const r of failed){console.log('\n──── '+r.name+' output ────\n'+r.out.split('\n').slice(-40).join('\n'));}
console.log(`\n${results.length-failed.length}/${results.length} passed in ${((Date.now()-t0)/1000).toFixed(0)}s. Screenshots: ${shotsRoot}`);
fs.writeFileSync(path.join(__dirname,'.build','results.json'),JSON.stringify(results.map(({out,...r})=>r),null,1));
process.exit(failed.length?1:0);
