# The old title screen (before v18.10)

Kept so we can fall back if the new title scene ever has to go. It is **not** in use: the scene from Gemini's main menu overhaul replaced it (Criss, 23 Oct 2026).

## To restore it
1. In `index.html`, delete the block from `/* === LOVECRAFTIAN TITLE OVERHAUL === */` to the end of that CSS (just before `</style>`).
2. Replace the block from `/* title canvas: the new scene` up to `/* ---------------- loop ---------------- */` with the JavaScript below.
3. The loop already calls `drawTitle(now/1000)` while the title shows, so nothing else changes.

## CSS (unchanged; still in the game)
```css
#titleCv{width:100%;max-width:560px;height:auto;aspect-ratio:2/1;display:block}
```

## JavaScript
```js
/* title canvas: the lamp and the eyes */
const tcv=$('#titleCv'), tg=tcv.getContext('2d');
const titleEyes=Array.from({length:14},()=>({x:.06+Math.random()*.88,y:.08+Math.random()*.84,ph:Math.random()*20,sp:.6+Math.random()*1.2}));
const TITLE_LURK=[{t:'crawler',x:.15,y:.84,s:1.4,f:1,ph:.1},{t:'elite',x:.87,y:.7,s:1.05,f:-1,ph:.4},{t:'watcher',x:.79,y:.2,s:1.1,f:-1,ph:.7},{t:'gnasher',x:.08,y:.32,s:1.05,f:1,ph:.2}];
function drawTitle(tm){
  const w=tcv.width, h=tcv.height;
  tg.setTransform(1,0,0,1,0,0);
  tg.fillStyle='#050607'; tg.fillRect(0,0,w,h);
  const lx=w*.5, ly=h*.58;
  const fl=reduceMotion?1:1+Math.sin(tm*7)*.03+Math.sin(tm*13)*.02;
  const gr=tg.createRadialGradient(lx,ly,0,lx,ly,h*.62*fl);
  gr.addColorStop(0,'rgba(237,170,80,.42)'); gr.addColorStop(.45,'rgba(237,150,60,.12)'); gr.addColorStop(1,'rgba(0,0,0,0)');
  tg.fillStyle=gr; tg.fillRect(0,0,w,h);
  
  for(const e of titleEyes){
    const ex=e.x*w, ey=e.y*h;
    if(dst(ex,ey,lx,ly)<h*.42)continue;
    const blink=Math.sin(tm*e.sp+e.ph);
    if(blink<-.55)continue;
    const open=clamp((blink+.55)*2,0,1);
    
    tg.fillStyle='rgba(240,120,58,'+(.18*open)+')';
    tg.beginPath(); tg.ellipse(ex,ey,20,14*open+.01,0,0,TAU); tg.ellipse(ex+30,ey,20,14*open+.01,0,0,TAU); tg.fill();
    
    /* ember irises that glow out of the dark, each with a thin slit pupil */
    tg.fillStyle='rgba(242,134,74,'+open+')';
    tg.beginPath(); tg.ellipse(ex,ey,8,5.5*open+.01,0,0,TAU); tg.ellipse(ex+30,ey,8,5.5*open+.01,0,0,TAU); tg.fill();
    tg.fillStyle='rgba(255,214,150,'+(.55*open)+')';
    tg.beginPath(); tg.ellipse(ex,ey-1,4.5,2.6*open+.01,0,0,TAU); tg.ellipse(ex+30,ey-1,4.5,2.6*open+.01,0,0,TAU); tg.fill();
    tg.fillStyle='rgba(14,8,5,'+open+')';
    tg.beginPath(); tg.ellipse(ex,ey,1.5,5*open+.01,0,0,TAU); tg.ellipse(ex+30,ey,1.5,5*open+.01,0,0,TAU); tg.fill();
  }
  
  /* things waiting just past the light */
  const k=h*.3; tg.setTransform(k,0,0,k,0,0);
  for(const L of TITLE_LURK){const bob=Math.sin(tm*.4+L.ph*6)*.04; drawCreature(tg,L.t,L.x*w/k+bob,L.y*h/k,FOES[L.t].r*L.s,tm,{sil:true,face:L.f,ph:L.ph,look:[L.f<0?-1:1,.3]});}
  tg.setTransform(h*.42,0,0,h*.42,lx,ly);
  drawLamp(tg,0,0,tm,1);
}
```
