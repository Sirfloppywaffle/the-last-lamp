// the candidate floor painter: paintBoardPixel with the tile size taken from PIX.TS, variants for the plain tiles and prop layers.
// Evaluated inside the game's scope by __x.swap('paintBoardPixel', src). window.__cand holds the candidate's options and images.
module.exports.paint=`(prev)=>function(c,o){
  const C=window.__cand||{}, I=window.__candImg||{};
  const TH=THEMES[o.theme]||THEMES[0], img=PIX.tiles[TH.deco], AT=PIX_AT[TH.deco]; if(!img||!AT)return false;
  const {cols,rows,s}=o, P=o.path, TS=PIX.TS, lx=o.lamp[0], ly=o.lamp[1];
  /* invert (mockup): the path is the raised stone, everything else the water */
  const up=C.invert?(x,y)=>P.has(clamp(x,0,cols-1)+','+clamp(y,0,rows-1)):(x,y)=>!P.has(clamp(x,0,cols-1)+','+clamp(y,0,rows-1));
  const bld=(x,y)=>!P.has(clamp(x,0,cols-1)+','+clamp(y,0,rows-1));
  const H=(x,y,k)=>{const q=o.canon?o.canon(x,y):[x,y]; return srand(q[0]*31.7+q[1]*17.3+k*7.13,o.seed);};
  const b=document.createElement('canvas'); b.width=cols*TS; b.height=rows*TS; const g=b.getContext('2d'); g.imageSmoothingEnabled=false;
  const pick0=(arr,h)=>arr[Math.min(arr.length-1,Math.floor(h*arr.length))];
  const put=(src,sx,sy,dx,dy,h,flip)=>{if(!flip){g.drawImage(src,sx,sy,TS,TS,dx,dy,TS,TS); return;}
    const fx=h<.5?-1:1, fy=(h*2%1)<.5?-1:1; g.save(); g.translate(dx+TS/2,dy+TS/2); g.scale(fx,flip===2?1:fy); g.drawImage(src,sx,sy,TS,TS,-TS/2,-TS/2,TS,TS); g.restore();};
  /* a floor of slabs, one a square, then the channel and its kerb laid over them from the sheet with its floor cut away */
  const slabs=I.slab&&I.slab.length&&I.chan&&I.chan[0];
  if(slabs){
    for(let y=-1;y<=rows;y++)for(let x=-1;x<=cols;x++){if(!up(x,y))continue; const im=pick0(I.slab,H(x,y,11));
      if(C.slabFlip){const h=H(x,y,7), fx=h<.5?-1:1, fy=(h*2%1)<.5?-1:1; g.save(); g.translate(x*TS+TS/2,y*TS+TS/2); g.scale(fx,fy); g.drawImage(im,-TS/2,-TS/2,TS,TS); g.restore();}
      else g.drawImage(im,x*TS,y*TS,TS,TS);}
    const ch=I.chan[0];
    for(let vy=0;vy<=rows;vy++)for(let vx=0;vx<=cols;vx++){
      const key=(up(vx-1,vy-1)?8:0)|(up(vx,vy-1)?4:0)|(up(vx-1,vy)?2:0)|(up(vx,vy)?1:0); if(key===15)continue; const t=AT[key];
      if(key===0&&C.flip0)put(ch,t[0],t[1],vx*TS-TS/2,vy*TS-TS/2,H(vx,vy,8),1); else g.drawImage(ch,t[0],t[1],TS,TS,vx*TS-TS/2,vy*TS-TS/2,TS,TS);}
  }
  else for(let vy=0;vy<=rows;vy++)for(let vx=0;vx<=cols;vx++){
    const key=(up(vx-1,vy-1)?8:0)|(up(vx,vy-1)?4:0)|(up(vx-1,vy)?2:0)|(up(vx,vy)?1:0), t=AT[key], dx=vx*TS-TS/2, dy=vy*TS-TS/2;
    if(key===15&&I.v15&&I.v15.length){const h=H(vx,vy,11); const im=I.v15[Math.min(I.v15.length-1,Math.floor(h*I.v15.length))]; put(im,0,0,dx,dy,H(vx,vy,7),C.flip15===false?0:1);}
    else if(key===15)put(img,t[0],t[1],dx,dy,H(vx,vy,7),C.flip15===false?0:1);
    else if(key===0&&I.v0&&I.v0.length){const h=H(vx,vy,12); put(I.v0[Math.floor(h*I.v0.length)],0,0,dx,dy,H(vx,vy,8),C.flip0?1:0);}
    else if(key===0&&C.flip0)put(img,t[0],t[1],dx,dy,H(vx,vy,8),1);
    else g.drawImage(img,t[0],t[1],TS,TS,dx,dy,TS,TS);
  }
  const pa=C.patch===undefined?1:C.patch;
  if(pa)for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){if(!up(x,y))continue; const h=H(x,y,1); g.fillStyle=h<.5?'rgba(4,8,14,'+((.5-h)*.38*pa).toFixed(3)+')':'rgba(150,190,200,'+((h-.5)*.09*pa).toFixed(3)+')'; g.fillRect(x*TS,y*TS,TS,TS);}
  const nearLamp=(x,y,r)=>Math.abs(x+.5-lx)<r&&Math.abs(y+.5-ly)<r;
  const ring=(x,y)=>up(x-1,y)&&up(x+1,y)&&up(x,y-1)&&up(x,y+1);
  const pick=(arr,h)=>arr[Math.min(arr.length-1,Math.floor(h*arr.length))];
  const used=new Set();
  const drawAt=(im,cx,cy,h,flip,rot)=>{const w=im.width, hh=im.height, X=Math.round(cx-w/2), Y=Math.round(cy-hh/2);
    if(rot){const q=Math.floor(h*4)%4; g.save(); g.translate(Math.round(cx),Math.round(cy)); g.rotate(q*Math.PI/2); if(flip&&(h*8%1)<.5)g.scale(-1,1); g.drawImage(im,-Math.round(w/2),-Math.round(hh/2)); g.restore(); return;}
    if(flip&&h<.5){g.save(); g.translate(X+w,Y); g.scale(-1,1); g.drawImage(im,0,0); g.restore();} else g.drawImage(im,X,Y);};
  for(const L of (C.layers||[])){
    const arr=I[L.img]; if(!arr||!arr.length)continue;
    for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){
      const k=x+','+y; if(used.has(k)&&!L.share)continue;
      const h=H(x,y,L.salt||80); if(h>L.p)continue;
      if(L.where==='floor'){if(!up(x,y)||nearLamp(x,y,1.1))continue; if(L.ring&&!ring(x,y))continue; if(L.bank&&ring(x,y))continue;}
      else if(L.where==='kerb'){/* a floor square with the channel to its south: the kerb's face shows there */ if(!up(x,y)||up(x,y+1)||nearLamp(x,y,1.1))continue;}
      else if(L.where==='water'){if(up(x,y))continue; if(L.calm&&(!(!up(x-1,y)&&!up(x+1,y))&&!(!up(x,y-1)&&!up(x,y+1))))continue;}
      else if(L.where==='nearlamp'){if(!up(x,y)||nearLamp(x,y,1.1))continue; const d=Math.hypot(x+.5-lx,y+.5-ly); if(d>L.r)continue;}
      const h2=H(x,y,(L.salt||80)+1), h3=H(x,y,(L.salt||80)+2);
      const im=pick(arr,h2); const jx=(h3-.5)*(L.jit||0)*TS, jy=(H(x,y,(L.salt||80)+3)-.5)*(L.jit||0)*TS;
      const cx=(x+.5)*TS+jx+(L.dx||0)*TS, cy=(y+.5)*TS+jy+(L.dy||0)*TS;
      drawAt(im,cx,cy,h3,L.flip!==false,L.rot); used.add(k);
    }
  }
  /* the flooded hall (mockup): a thin film of still water over the stone */
  if(C.film){g.fillStyle=C.film; for(let y=0;y<rows;y++)for(let x=0;x<cols;x++)if(up(x,y))g.fillRect(x*TS,y*TS,TS,TS);}
  /* the colonnade (mockup): columns on the grid's corners, each with a long shadow away from the lamp and its reflection in the water */
  const CO=C.cols, ci=CO&&I[CO.img]&&I[CO.img];
  if(ci&&ci.length){const list=[];
    for(let vy=1;vy<rows;vy++)for(let vx=1;vx<cols;vx++){
      if((vx-(CO.ox||0))%CO.step||(vy-(CO.oy||0))%CO.step)continue;
      if(Math.hypot(vx-lx,vy-ly)<(CO.clear||1.6))continue;
      const nP=(!bld(vx-1,vy-1))+(!bld(vx,vy-1))+(!bld(vx-1,vy))+(!bld(vx,vy)); if(CO.dry&&nP)continue; if(CO.noPath&&nP)continue;
      list.push([vx,vy,nP]);}
    for(const [vx,vy] of list){const dx=vx-lx, dy=vy-ly, d=Math.hypot(dx,dy)||1, ux=dx/d, uy=dy/d, L=Math.min(CO.shLen||7,1.5+d*.9), w=(CO.shW||.22);
      if(CO.shadow!==false){const x0=vx*TS, y0=vy*TS, px=-uy*w*TS, py=ux*w*TS, x1=x0+ux*L*TS, y1=y0+uy*L*TS;
        const gr=g.createLinearGradient(x0,y0,x1,y1); gr.addColorStop(0,'rgba(0,0,0,'+(CO.shA||.55)+')'); gr.addColorStop(1,'rgba(0,0,0,0)');
        g.fillStyle=gr; g.beginPath(); g.moveTo(x0+px,y0+py); g.lineTo(x1+px*1.8,y1+py*1.8); g.lineTo(x1-px*1.8,y1-py*1.8); g.lineTo(x0-px,y0-py); g.closePath(); g.fill();}}
    for(const [vx,vy] of list){const im=pick0(ci,H(vx,vy,21)), ax=CO.ax!==undefined?CO.ax:im.width/2, ay=CO.ay!==undefined?CO.ay:im.height-2;
      const X=Math.round(vx*TS-ax), Y=Math.round(vy*TS-ay);
      if(CO.refl){g.save(); g.globalAlpha=CO.refl; g.translate(X,Math.round(vy*TS)*2-Y); g.scale(1,-1); g.drawImage(im,0,0); g.restore();}
      g.drawImage(im,X,Y);}
    PIX.cols=list;}
  PIX.water=[]; for(let y=0;y<rows;y++)for(let x=0;x<cols;x++)if(!up(x,y))PIX.water.push(x,y,H(x,y,3),H(x,y,4));
  const da=(I.dais&&I.dais[0])||PIX.props.dais; if(da)g.drawImage(da,Math.round(lx*TS-da.width/2),Math.round(ly*TS-da.height/2+(C.daisDy!==undefined?C.daisDy:2)));
  c.setTransform(1,0,0,1,0,0);
  const W=Math.round(cols*s), Hh=Math.round(rows*s), k=Math.max(1,Math.ceil(s/TS));
  if(Math.abs(s/TS-k)<.01){c.imageSmoothingEnabled=false; c.drawImage(b,0,0,W,Hh);}
  else{const b2=document.createElement('canvas'); b2.width=b.width*k; b2.height=b.height*k; const g2=b2.getContext('2d'); g2.imageSmoothingEnabled=false; g2.drawImage(b,0,0,b2.width,b2.height);
    c.imageSmoothingEnabled=true; c.imageSmoothingQuality='high'; c.drawImage(b2,0,0,W,Hh);}
  c.imageSmoothingEnabled=true;
  const R=Math.hypot(W,Hh)/2, v=c.createRadialGradient(W/2,Hh/2,R*.45,W/2,Hh/2,R);
  v.addColorStop(0,'rgba(0,0,0,0)'); v.addColorStop(1,'rgba(0,0,0,.55)'); c.fillStyle=v; c.fillRect(0,0,W,Hh);
  return true;
}`;
module.exports.rift=`(prev)=>function(c,x,y,s){const I=window.__candImg||{}, C=window.__cand||{}; const im=(I.rift&&I.rift[0])||PIX.props.rift; if(!im)return false;
  const w=(C.riftW||1.5)*s, h=w*im.height/im.width; c.imageSmoothingEnabled=im.width>w*1.02; if(c.imageSmoothingEnabled)c.imageSmoothingQuality='high';
  c.drawImage(im,x*s-w/2,y*s-h/2+(C.riftDy||0)*s,w,h); c.imageSmoothingEnabled=true; return true;}`;
