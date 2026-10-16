// Regenerates docs/DESIGN.md from the live data tables in index.html.
// Step 1 (here): load the game in a headless browser and dump its data tables to .build/data.json.
// Step 2: tools/gen_design.py turns that JSON into docs/DESIGN.md.   Run both with: npm run design
const {chromium}=require('playwright'), fs=require('fs'), path=require('path'), {spawnSync}=require('child_process');
const NAMES='FOES SPAWNABLE WARDS BASE_WARDS GIFT_WARDS KIT_WARDS KIT_TREES RESTING RELICS_RESTING PATRONS OFFERINGS CURRENT FLOOD_N FLOOD_LEN FLOOD_MAX NEAR_WATER PATRON_BREAK BLUBBER_LIGHT POT_R POT_MEASURE POT_MAX TETHER_RATE TETHER_MAX HAUL_EVERY PYLON_LINK PYLON_LINKS WIRE_DMG WIRE_STUN WIRE_RECHARGE WIRE_REVEAL ROD_T ROD_MAX ARC_LIGHT ARC_PERIOD ARC_OFF ARC_DMG ARC_STUN OVER_OIL OVER_MUL HEAT_COOL HEAT_FRY STATIC_TRIG STATIC_R STATIC_STUN STATIC_CD ANCHOR_T CAGE_T CAPTURE_VENT MIRROR_LEN MIRROR_R MIRROR_DPS NET_R HAUL_BACK HAUL_TIME TANGLE_T TANGLE_SLOW GRASP_HOLD GRASP_BOSS GRASP_GRIPS RISEN_DMG RISEN_RANGE RISEN_RATE CORPSE_REACH PILE_MAX PILE_GATHER BODY_MAX SPEAR_TIER DREAD_TIER HORROR_TIER UNBIND_SPD UNBIND_BASE UNBIND_PER WAVE_NAMES DECKS LEAP STAR_R STAR_T THREAD_T GLINT_R GLINT_T GLINT_MAX KINDLE_T KINDLE_R KINDLE_DPS KINDLE_RUN HORRORS TREES TARGETS RITES RELICS KITS OMENS ROOMS PACTS HALL DEPTHS EVENTS FLOORS COUNT_MUL GAP_MUL DELAY_MUL TIERNAMES BOSS_INTRO BIG_INTRO'.split(' ');
(async()=>{
  let s=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
  const dump='window.__d={};'+NAMES.map(n=>`try{window.__d.${n}=${n}}catch(e){}`).join('');
  const i=s.lastIndexOf('})();'); s=s.slice(0,i)+dump+s.slice(i);
  const dir=path.join(__dirname,'.build'); fs.mkdirSync(dir,{recursive:true});
  fs.writeFileSync(path.join(dir,'dump.html'),s);
  const b=await chromium.launch(); const p=await b.newPage();
  await p.goto('file://'+path.join(dir,'dump.html')); await p.waitForTimeout(300);
  const json=await p.evaluate(()=>JSON.stringify({d:window.__d},(k,v)=>typeof v==='function'?'fn:'+v.toString().slice(0,400):v));
  await b.close();
  fs.writeFileSync(path.join(dir,'data.json'),json);
  const r=spawnSync('python3',[path.join(__dirname,'..','tools','gen_design.py'),path.join(dir,'data.json'),path.join(__dirname,'..','docs','DESIGN.md')],{stdio:'inherit'});
  process.exit(r.status||0);
})();
