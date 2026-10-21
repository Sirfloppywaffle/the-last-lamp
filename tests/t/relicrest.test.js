// The relic pool (#29, #89): the eleven relics that once rested are back, and a relic that needs a ward or rite
// is only offered to a run that has one. A carried relic keeps its key, and the altar still answers.
const {chromium}=require('playwright');
const fails=[]; const ok=(c,m,d)=>{if(!c)fails.push(m+(d!==undefined?' '+JSON.stringify(d):''));};
(async()=>{
  const b=await chromium.launch(); const p=await b.newPage({viewport:{width:412,height:860}});
  await p.goto('file://'+process.argv[2]); await p.waitForTimeout(300);
  const r=await p.evaluate(()=>{const T=__t, out={kits:{}};
    localStorage.setItem('ll-meta',JSON.stringify({unlocked:['relics_deep','relics_forbidden','kit_whaler','kit_occultist','kit_galvanist','kit_bellringer']}));
    for(const k of ['lamplighter','whaler','occultist','galvanist','bellringer']){T.newRun(k,0); out.kits[k]=T.relicPool(undefined).sort();}
    out.resting=T.RESTING;
    // a bought ward opens what needs it: a Bellringer who learns Salt is offered the salt relics
    T.newRun('bellringer',0); T.run.wards.push('salt'); out.bellSalt=T.relicPool(undefined);
    // the altar: Salt Flats first, then the Brined Ledger, and it teaches Salt
    T.newRun('occultist',0); const ev=T.EVENTS.altar.opts[0];
    ev.fn(); out.altar1=T.run.relics.slice(); out.salt=T.run.wards.includes('salt'); ev.fn(); out.altar2=T.run.relics.slice();
    out.altarText=ev.d;
    // Dead Reckoning keeps Witch Salt's key, so a saved run carrying it carries Dead Reckoning
    out.reckon=T.RELICS.witchsalt.n;
    localStorage.removeItem('ll-meta');
    return out;});
  console.log(JSON.stringify(r));
  const K=r.kits, all=Object.values(K);
  ok(r.resting.every(k=>all.some(pool=>pool.includes(k))),'every relic that rested is offered again',r.resting);
  ok(['tallow','reserve','whetted','quiet','wax','bounty','key','leech','marrow'].every(k=>all.every(pool=>pool.includes(k))),'the universal relics (and Thunder Marrow) reach all five kits',K);
  /* Dead Reckoning reaches every kit but the Bellringer: its price falls on light, and she sees by sound (Criss, v18.5.2) */
  ok(Object.entries(K).every(([k,pool])=>pool.includes('witchsalt')===(k!=='bellringer')),'Dead Reckoning reaches every kit but the Bellringer',K);
  ok(K.lamplighter.includes('saltflats')&&K.whaler.includes('saltflats')&&K.galvanist.includes('saltflats'),'Salt Flats for the kits with Salt');
  ok(!K.occultist.includes('saltflats')&&!K.bellringer.includes('saltflats')&&!K.occultist.includes('ledger')&&!K.bellringer.includes('ledger'),'no salt relic for a kit without Salt',[K.occultist,K.bellringer]);
  ok(K.occultist.includes('shadow')&&!['lamplighter','whaler','galvanist','bellringer'].some(k=>K[k].includes('shadow')),'Second Shadow only with an Effigy');
  ok(r.bellSalt.includes('saltflats')&&r.bellSalt.includes('ledger'),'a bought ward opens the relics that need it',r.bellSalt);
  ok(r.altar1.join()==='saltflats'&&r.salt&&r.altar2.join()==='saltflats,ledger','the altar gives Salt Flats, then the Brined Ledger, and teaches Salt',[r.altar1,r.altar2]);
  ok(/Salt Flats/.test(r.altarText)&&!/Witch Salt/.test(r.altarText),'the altar says what it gives',r.altarText);
  ok(r.reckon==='Dead Reckoning','Witch Salt\'s key carries Dead Reckoning',r.reckon);
  fails.forEach(f=>console.log('FAIL '+f)); await b.close(); process.exitCode=fails.length?1:0;
})();
