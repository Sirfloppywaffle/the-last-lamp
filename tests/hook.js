// Builds .build/game.hooked.html from ../index.html, exposing game internals as window.__t for tests.
// The hook is inserted just before the script's closing "})();", inside the game's scope.
const fs=require('fs'), path=require('path');
const HOOK=`window.__t={get run(){return run},get F(){return F},get sel(){return sel},newRun,beginFloor,spawnFoe,forceUI,setP(v){paused=v},setSel(v){sel=v},tryPlace,placeProblem,floorCleared,callWave,bindSoul,update,get ORIENT(){return ORIENT},get COLS(){return COLS},get ROWS(){return ROWS},wstat,buyBranch,branchState,canSee,posAt,hurt,render:()=>render(),get meta(){return meta()},descend,makeRoom,showLanding,drawBonesTable,setBonesAnim(v){BONES_ANIM=v},get BONES_ANIM(){return BONES_ANIM},openKitPicker,openHall,get OMENS(){return OMENS},lampBase,tiers,wardCost,horrorMad,startWave,makeDoors,addRelic,removeRelic,resumeFrom,killFoe:(e)=>killFoe(e),
 get spriteBytes(){try{return spriteBytes}catch(e){return 0}}, get nSprites(){try{return SPRITES.size}catch(e){return 0}}, setLite(v){try{gfxLite=v}catch(e){}}};
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
