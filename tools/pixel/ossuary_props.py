"""The Ossuary's props (pixel stair step 7), drawn pixel by pixel with px.py, or recoloured from art PixelLab made for step 6c.

  python3 ossuary_props.py <out_dir> [--spare <dir>] [--cistern-atlas <png>]

Writes o_<name>.png for every candidate: skull_a (from the front), skull_b (fallen on its side), skull_c (a candle stub on its crown),
bones_h (three long bones), chalk_w and chalk_r (a chalk circle, white or old red as the painted floor's), chips_a and chips_b (bone chips
for the aisle). With --spare (6c's spare bone props, bones22.png and bones9.png, on the orphan branch claude/shots-cistern-detail) also
bones_p22 and bones_p9 (its skull cut away), recoloured to old bone. With --cistern-atlas (PIX_SRC.props.cistern, see pack.py extract)
also dais_r and rift_r, the Cistern's dais and rift recoloured to the Ossuary's stone, and dais_s, the dais ringed with ten skulls.
"""
import sys, os, math, random, colorsys, argparse, numpy as np
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from px import *
from PIL import Image
RAMP=['#3a2f24','#62533f','#8d7c62','#b4a283','#d8c9a6']; OUT='#17110c'; OUTL='#33281e'; HOLE='#0d0907'; DEEP='#2c2219'; GRIME='#54473a'
def draw(cv,m,flat=1.8,bias=0,ramp=RAMP):
    paint(cv,shade(m,ramp,flat=flat,bias=bias),ramp); outline(cv,m,OUT,OUTL)
def socket(cv,XX,cx,cy,rx,ry):
    s=ellipse(cv.w,cv.h,cx,cy,rx,ry); cv.put(s,HOLE)
    low=s&~np.pad(s,1)[2:,1:-1]; cv.put(low&(XX+.5>=cx),DEEP); return s
# ---- skulls (the painted floor's kind 0) ----
def skull_front(top=1,W=26,H=25,candle=False):
    cv=Canvas(W,H); YY,XX=grid(W,H); cx=W/2
    m=ellipse(W,H,cx,top+8.5,9,8)|ellipse(W,H,cx,top+14.2,7,4.8)|ellipse(W,H,cx-5.6,top+13.4,2.6,2.4)|ellipse(W,H,cx+5.6,top+13.4,2.6,2.4)
    m|=(XX>=cx-4.5)&(XX<cx+4.5)&(YY>=top+15)&(YY<top+19)
    draw(cv,m,flat=3.4,bias=.06)
    for s in (-1,1): socket(cv,XX,cx+s*3.6,top+12.4,2.7,2.5)
    for (x,y) in ((-6,9),(-5,9),(2,9),(3,9)): cv.px(int(cx)+x,top+y,RAMP[4])           # brows catching the light
    for (x,y) in ((0,15),(-1,16),(0,16)): cv.px(int(cx)+x,top+y,HOLE)                       # the nose
    cv.px(int(cx)+1,top+16,RAMP[1])
    for i,x in enumerate(range(int(cx)-4,int(cx)+4)):                                        # the upper teeth, one gone
        if i==5: cv.px(x,top+18,HOLE); continue
        cv.px(x,top+18,RAMP[4] if i%2 else RAMP[3])
    for x in range(int(cx)-4,int(cx)+4): cv.px(x,top+19,OUT)
    for (x,y) in ((2,2),(3,3),(3,4),(4,5),(5,6)): cv.px(int(cx)+x,top+y,GRIME)               # a crack over the crown
    if candle:
        wax=['#8a7d63','#c2b597','#e6dcc2','#f6efdd']
        st=(XX>=cx-2.5)&(XX<cx+2.5)&(YY>=2)&(YY<top+2)
        paint(cv,shade(st,wax,flat=1.3),wax); outline(cv,st,OUT,OUTL)
        for x in (int(cx)-2,int(cx)+2): cv.px(x,2,wax[1])                                    # the rim melted lower at the sides
        cv.px(int(cx),1,'#120d09'); cv.px(int(cx),0,'#120d09')                               # the wick, burnt black
        pool=ellipse(W,H,cx,top+2.2,5.2,1.6)&~st; cv.put(pool,wax[2]); cv.put(pool&(YY>=top+2)&(XX>cx),wax[1])
        for (x,y0,n) in ((-3,3,4),(2,3,6),(4,2,3)):                                          # drips run down the crown
            for k in range(n): cv.px(int(cx)+x,top+y0+k,wax[2] if k<n-1 else wax[1])
    return cv
def skull_side(W=31,H=23):
    cv=Canvas(W,H); YY,XX=grid(W,H)
    m=ellipse(W,H,12,9.5,10.5,7.8)|ellipse(W,H,21,8.4,4.2,3.6)|ellipse(W,H,21.8,13,5.6,4.6)|ellipse(W,H,25.6,16.4,3.4,2.6)
    m&=~ellipse(W,H,27.6,10.6,1.9,1.6)                                                      # the notch under the brow
    m&=~((XX>=28)&(YY<14))
    draw(cv,m,flat=3.0,bias=.05)
    socket(cv,XX,21.2,10.4,2.7,2.7)
    for x in range(14,20): cv.px(x,14,RAMP[3])                                               # the cheekbone's arch
    for x in range(14,20): cv.px(x,15,RAMP[1])
    for (x,y) in ((26,13),(26,14),(27,14)): cv.px(x,y,HOLE)                                  # the nose's opening
    for i,x in enumerate(range(22,29)):
        if i==3: cv.px(x,19,HOLE); continue
        cv.px(x,19,RAMP[4] if i%2 else RAMP[3])
    for x in range(22,29): cv.px(x,20,OUT)
    for (x,y) in ((11,12),(12,12),(11,13)): cv.px(x,y,HOLE)                                  # the ear
    for (x,y) in ((6,4),(7,5),(8,5),(9,6),(10,6),(11,7)): cv.px(x,y,GRIME)                   # the suture
    cv.px(19,4,RAMP[4]); cv.px(20,4,RAMP[4])
    return cv
# ---- bones (kind 1) ----
def longbone(W,H,x0,y0,x1,y1,r=1.3):
    m=capsule(W,H,x0,y0,x1,y1,r); dx,dy=x1-x0,y1-y0; L=np.hypot(dx,dy); ux,uy=dx/L,dy/L; px,py=-uy,ux
    for s in (1,-1): m|=ellipse(W,H,x1+px*s*1.35-ux*.3,y1+py*s*1.35-uy*.3,1.75,1.75)
    m|=ellipse(W,H,x0+ux*.2+px*.9,y0+uy*.2+py*.9,2.1,2.1); m|=ellipse(W,H,x0+ux*1.6-px*1.3,y0+uy*1.6-py*1.3,1.2,1.2)
    return m
def bones_hand(W=40,H=40):
    cv=Canvas(W,H)
    for (a,b,c,d,r) in ((7,29,32,11,1.35),(9,10,31,33,1.25),(13,36,35,25,1.1)): draw(cv,longbone(W,H,a,b,c,d,r),flat=1.6)
    return cv
def recolour(img,ramp_cols,keep=None,lo=None,hi=None):
    a=np.array(img.convert('RGBA')).astype(float); L=.299*a[...,0]+.587*a[...,1]+.114*a[...,2]; op=a[...,3]>0
    lo=np.percentile(L[op],2) if lo is None else lo; hi=np.percentile(L[op],99.5) if hi is None else hi
    t=np.clip((L-lo)/(hi-lo),0,1); idx=np.clip((t*(len(ramp_cols)-1)+.5).astype(int),0,len(ramp_cols)-1)
    out=a.copy()
    for i,c in enumerate(ramp_cols):
        sel=op&(idx==i)
        if keep is not None: sel&=~keep
        out[sel,:3]=hexc(c)
    return Image.fromarray(out.astype(np.uint8))
BONE7=['#1f1913','#3a2f24','#62533f','#8d7c62','#b4a283','#cdbd9c','#e2d6b8']
# ---- chalk circles (kind 2) ----
def chalk(cols,drop,W=40,seed=7,dust=None):
    random.seed(seed); cv=Canvas(W,W); C=((W-1)/2+.5,(W-1)/2+.5); R1,R2=W/2-1.5,W/2-6.5
    def pt(x,y,dr=drop):
        if 0<=x<W and 0<=y<W and random.random()>=dr:
            r=random.random(); cv.px(x,y,cols[0] if r<.6 else cols[1] if r<.88 else cols[2])
    def ring(r,dr):
        seen=set(); a=0
        while a<2*math.pi:
            x=int(round(C[0]+r*math.cos(a)-.5)); y=int(round(C[1]+r*math.sin(a)-.5))
            if (x,y) not in seen: seen.add((x,y)); pt(x,y,dr)
            a+=.35/r
    def line(x0,y0,x1,y1,dr):
        n=int(max(abs(x1-x0),abs(y1-y0)))+1
        for i in range(n+1): t=i/n; pt(int(round(x0+(x1-x0)*t-.5)),int(round(y0+(y1-y0)*t-.5)),dr)
    ring(R1,drop); ring(R2,drop*1.2)
    P=[(C[0]+R2*math.cos(-math.pi/2+k*4*math.pi/5),C[1]+R2*math.sin(-math.pi/2+k*4*math.pi/5)) for k in range(5)]
    for k in range(5): line(*P[k],*P[(k+1)%5],drop)
    G=[["#.#","###","#.#"],["##","#.","##"],["#.#",".#.","#.#"],["###",".#.",".#."],[".#","##",".#"],["#.","##","#."]]
    for k,g in enumerate(G):
        a=-math.pi/2+k*2*math.pi/6+math.pi/6; cx=C[0]+(R1+R2)/2*math.cos(a); cy=C[1]+(R1+R2)/2*math.sin(a)
        for j,row in enumerate(g):
            for i,ch in enumerate(row):
                if ch=='#': pt(int(round(cx-len(row)/2+i)),int(round(cy-1.5+j)),0)
    return cv
# ---- chips on the aisle (path props) ----
def chips(seed,W=32):
    random.seed(seed); cv=Canvas(W,W)
    for k in range(4):
        x0=random.uniform(5,W-9); y0=random.uniform(5,W-9); a=random.uniform(0,math.pi); L=random.uniform(3.5,6)
        m=capsule(W,W,x0,y0,x0+math.cos(a)*L,y0+math.sin(a)*L,.75)|ellipse(W,W,x0,y0,1.2,1.2); draw(cv,m,flat=1.0)
    for k in range(3):
        x=random.randrange(4,W-4); y=random.randrange(4,W-4); cv.px(x,y,RAMP[4]); cv.px(x,y+1,RAMP[2]); cv.px(x+1,y+1,OUT); cv.px(x,y+2,OUT)
    return cv
# ---- write everything ----
def label(m):
    lab=np.zeros(m.shape,int); n=0
    for y0,x0 in zip(*np.nonzero(m)):
        if lab[y0,x0]: continue
        n+=1; st=[(y0,x0)]; lab[y0,x0]=n
        while st:
            y,x=st.pop()
            for dy in (-1,0,1):
                for dx in (-1,0,1):
                    yy,xx=y+dy,x+dx
                    if 0<=yy<m.shape[0] and 0<=xx<m.shape[1] and m[yy,xx] and not lab[yy,xx]: lab[yy,xx]=n; st.append((yy,xx))
    return lab,n
def mini_skull():
    cv=Canvas(7,7); YY,XX=grid(7,7); m=ellipse(7,7,3.5,2.9,3.1,2.6)|((XX>=2)&(XX<5)&(YY>=4)&(YY<6))
    paint(cv,shade(m,RAMP,flat=1.6,bias=.08),RAMP); outline(cv,m,OUT)
    for x,y in ((2,3),(4,3)): cv.px(x,y,HOLE)
    cv.px(3,5,RAMP[4]); cv.px(2,5,RAMP[3]); cv.px(4,5,RAMP[3])
    return Image.fromarray(cv.rgba)
if __name__=='__main__':
    ap=argparse.ArgumentParser(); ap.add_argument('out'); ap.add_argument('--spare'); ap.add_argument('--cistern-atlas'); a=ap.parse_args()
    os.makedirs(a.out,exist_ok=True); O=lambda n:os.path.join(a.out,'o_'+n+'.png')
    skull_front().save(O('skull_a')); skull_side().save(O('skull_b')); skull_front(top=5,H=29,candle=True).save(O('skull_c'))
    bones_hand().save(O('bones_h'))
    chalk(['#d9d3c2','#c2baa5','#a39b86'],.1).save(O('chalk_w')); chalk(['#87402f','#723526','#5c2b20'],.16).save(O('chalk_r'))
    chips(3).save(O('chips_a')); chips(11).save(O('chips_b'))
    if a.spare:
        recolour(Image.open(os.path.join(a.spare,'bones22.png')),BONE7).save(O('bones_p22'))
        b9=np.array(Image.open(os.path.join(a.spare,'bones9.png')).convert('RGBA')); lab,n=label(b9[...,3]>0)
        # the skull is the part nearest the middle
        c=[np.argwhere(lab==i).mean(0) for i in range(1,n+1)]; sk=1+int(np.argmin([abs(p[0]-18.5)+abs(p[1]-23.5) for p in c]))
        b9[lab==sk,3]=0; recolour(Image.fromarray(b9),BONE7).save(O('bones_p9'))
    if a.cistern_atlas:
        at=Image.open(a.cistern_atlas).convert('RGBA'); dais=at.crop((0,128,96,224)); rift=at.crop((96,128,192,224))
        WARM=['#130f0b','#1c1812','#26201a','#2c261e','#362e24','#3d3529','#433b2d','#544a38','#5d533f','#625742','#695e48','#756851','#7f725a','#9a8b6c']
        d=recolour(dais,WARM); d.save(O('dais_r'))
        sk=mini_skull()
        for k in range(10):
            ang=-math.pi/2+k*2*math.pi/10; x=48+40.5*math.cos(ang); y=48+40.5*math.sin(ang)*.98
            d.alpha_composite(sk,(int(round(x-sk.width/2)),int(round(y-sk.height/2))))
        d.save(O('dais_s'))
        r=np.array(rift).astype(float); keep=np.zeros(r.shape[:2],bool)
        for y in range(r.shape[0]):
            for x in range(r.shape[1]):
                if r[y,x,3]>0:
                    hh,ss,vv=colorsys.rgb_to_hsv(*(r[y,x,:3]/255)); keep[y,x]=ss>.18 and 230<hh*360<330
        recolour(rift,WARM,keep=keep).save(O('rift_r'))
    print('written to',a.out)
