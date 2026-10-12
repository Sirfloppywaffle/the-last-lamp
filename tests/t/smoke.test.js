// The real index.html (no test hook): the title loads, a run starts from the buttons, floor 1 begins.
const {chromium}=require('playwright');
(async()=>{
  const b=await chromium.launch(); const p=await b.newPage({viewport:{width:412,height:860}});
  await p.goto('file://'+process.env.LL_RAW); await p.waitForTimeout(500);
  await p.click('#descendBtn'); await p.waitForTimeout(300);
  await p.evaluate(()=>document.querySelectorAll('#mChoices .choice')[0].click()); await p.waitForTimeout(600);
  const fl=await p.evaluate(()=>document.querySelector('#floorNo').textContent);
  console.log('floor label:',fl);
  if(!/Floor 1 of 5/.test(fl)){console.log('FAIL a new run did not start on floor 1'); process.exitCode=1;}
  await p.screenshot({path:(process.argv[3]||'.')+'/smoke.png'});
  await b.close();
})();
