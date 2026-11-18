// builds a hooked copy of the game with extra handles for the candidate harness (scratchpad only)
const fs=require('fs'), path=require('path');
const {build}=require('/home/user/the-last-lamp/tests/hook.js');
const {hooked}=build();
let s=fs.readFileSync(hooked,'utf8');
const i=s.lastIndexOf('})();');
const X=`window.__x={get PIX_AT(){return PIX_AT},paintFloor:()=>paintFloor(),get T(){return T},get DPR(){return DPR},
 swap(name,src){const prev=eval(name); eval(name+'=('+src+')(prev)'); return typeof eval(name);},
 help:{srand,clamp,THEMES,PIX,PIX_AT,dst,lampRadius:()=>lampRadius(),get F(){return F}},
 get floorCv(){return floorCv}, layout:()=>layout(), tryPlace};
`;
s=s.slice(0,i)+X+s.slice(i);
fs.writeFileSync(path.join(__dirname,'game.x.html'),s);
console.log('ok',s.length);
