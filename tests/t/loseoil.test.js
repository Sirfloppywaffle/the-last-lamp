// Tests for loseOil boundary conditions
const {chromium}=require('playwright');
const fails=[]; const ok=(cond,msg,detail)=>{if(!cond)fails.push(msg+(detail!==undefined?' '+JSON.stringify(detail):''));};
(async()=>{
  const b=await chromium.launch(); const p=await b.newPage({viewport:{width:900,height:700}});
  await p.goto('file://'+process.argv[2]); await p.waitForTimeout(300);

  const r=await p.evaluate(()=>{
    const T=__t, out={};

    T.newRun('lamplighter', 0);
    T.run.oil = 10;
    T.loseOil(4);
    out.normal_lose = T.run.oil;

    T.run.oil = 2;
    T.loseOil(4);
    out.boundary_lose = T.run.oil;

    return out;
  });

  ok(r.normal_lose===6, "Normal loseOil subtraction", r);
  ok(r.boundary_lose===1, "loseOil respects lower bound of 1", r);

  if(fails.length>0){console.log('FAILS:\n'+fails.join('\n')); process.exit(1);}
  console.log('ok'); process.exit(0);
})().catch(e=>{console.error(e); process.exit(1);});
