// Builds .build/game.hooked.html from ../index.html, exposing game internals as window.__t for tests.
// The hook is inserted just before the script's closing "})();", inside the game's scope.
const fs=require('fs'), path=require('path');
const HOOK=`window.__t={get run(){return run},get F(){return F},get sel(){return sel},get devOn(){return devOn},newRun,beginFloor,spawnFoe,forceUI,setP(v){paused=v},setSel(v){sel=v},tryPlace,placeProblem,floorCleared,callWave,bindSoul,update,get ORIENT(){return ORIENT},get COLS(){return COLS},get ROWS(){return ROWS},wstat,buyBranch,branchState,canSee,posAt,hurt,render:()=>render(),get meta(){return meta()},descend,makeRoom,showLanding,drawBonesTable,setBonesAnim(v){BONES_ANIM=v},get BONES_ANIM(){return BONES_ANIM},bonesCol,bonesAI,bonesTotal,get COACH(){return COACH},coachPoll,coachRun,TIPS,tut,tutReset(){store.set('ll-tut',null)},tutSet(o){store.set('ll-tut',o)},bonesPractice,openBook,get BOOK(){return BOOK},codex,get bonesPrac(){return bonesPrac},openKitPicker,openHall,get OMENS(){return OMENS},get KITS(){return KITS},checkOccultistDeed,unlockDeed,victory,defeat,revealKit,revealKits,get DEV_ACTS(){return DEV_ACTS},lampBase,tiers,wardCost,horrorMad,startWave,makeDoors,addRelic,removeRelic,resumeFrom,killFoe:(e)=>killFoe(e),castRite,castKindle:(e)=>castKindle(e),wdef,signalReach,treeOf,segDist,potRender,blubberToll,blubberDue,potsPour,forkPick,relicPool,get RESTING(){return RESTING},get EVENTS(){return EVENTS},drawWaves,drawnWaves,get DECKS(){return DECKS},get FLOORS(){return FLOORS},checkpoint,renderPreview,get PATRONS(){return PATRONS},drawWard,drawLamp,castRaise,castHaul,gridBuild,gridSync,castOverload,overloadFry,castAnchor,inCage,bindSoul,arcOff,plantRod,lstat,mirrorBeams,turnMirror,aimMirror,cutVictims,castHaul,corpseSync,bodyNear,takeBody,corpseBurnOut,castUnbind,horrorBoost,spearMul,addCorpse,madTier,madness,buildLit,sellTower,waveCleared,get OFFERINGS(){return OFFERINGS},offerSet,takeOffer,addAtt,attOf,patTier,hasOff,floodSeed,waterSync,waterRise,inWater,nearWater,patronBreak,openOffer,castEbb,lampHit,chimePulse,connectedLights,lampToll,addNoise,wireTrip,clapHit,crack,shatterAll,tocsinCall,beatOff,heraldGate,bellKit,startToll,draftOptions,pathEdges,hear,captionsOn,openDraft,get draft(){return F&&F.draft},renderRelics,relicTip,setOrient,showBook,portraitCanvas,paintPortrait,hoodEyes,get ROSTER(){return ROSTER},get HOOD_EYES(){return HOOD_EYES},get nPortraits(){return PORTRAITS.size},kitLocked,get TRIALS(){return TRIALS},rationN,rationFull,hallowAt,hallowSeed,sealable,sealedW,onceTaken,riteSilent,trialBarred,chooseDoor,landingModal,addCorpse,floorMaps,mapOf,mapDraw,setMapV(v){MAPV_FORCE=v},
 get spriteBytes(){try{return spriteBytes}catch(e){return 0}}, get nSprites(){try{return SPRITES.size}catch(e){return 0}}, setLite(v){try{gfxLite=v}catch(e){}}};
/* tests run with the walkthrough and tips switched off; tutorial.test.js turns them back on with __t.tutReset() */
store.set('ll-tut',{walk:'done',seen:[],off:true});
/* tests play map 0 of every floor unless they pick another with __t.setMapV(); maps.test.js walks them all.
   LL_MAPV=1 node run.js … runs a whole test on another map */
MAPV_FORCE=${JSON.stringify(+(process.env.LL_MAPV||0))};
`;
function build(){
  const src=path.join(__dirname,'..','index.html');
  let s=fs.readFileSync(src,'utf8');
  const i=s.lastIndexOf('})();');
  if(i<0)throw new Error('index.html: could not find the closing "})();" of the game script');
  s=s.slice(0,i)+HOOK+s.slice(i);
  const out=path.join(__dirname,'.build');
  fs.mkdirSync(out,{recursive:true});
  const dst=path.join(out,'game.hooked.html');
  fs.writeFileSync(dst,s);
  return {hooked:dst, raw:src};
}
module.exports={build};
if(require.main===module)console.log(build());
