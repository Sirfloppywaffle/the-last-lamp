"""The Ossuary's floor (pixel stair step 7; Criss, 26 Nov 2026: "number 2's design with the borders of 1", from his photos of Sedlec and
other ossuaries). Drawn by hand with bones.py, from the Wang set floor.py fetched (sheet.png, at.json) and the cut it made (cut.png: only
its alpha is used, which pixels the walls keep):

  python3 ossuary_floor.py <dir>

writes into <dir>: tiles.png (the set graded for contrast: a darker aisle, the skulls in its walls kept bright; the floor cut away),
hex0.png to hex7.png (Sedlec's floor of small hex tiles in cream, grey and rust, a square each: the tiles that cross a square's edges are
grey in every variant, so squares always meet), pyr0.png to pyr2.png (pyramids of skulls on pedestals, as in Sedlec's corners: they stand
on the floor's corners as the Cistern's columns do, and break to their base beside a ward), friezeH.png and friezeV.png (skulls and crossed
bones in turn, as over Sedlec's door, laid along each side of the floor that meets the aisle) and dais.png (the lamp's dais: a chandelier
seen from above, a sunburst of bones ringed with skulls). Pack them with pack.py.
"""
import sys, os, json, math, colorsys, random, numpy as np
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from bones import *
from PIL import Image
def rgba(im): return np.array(im.convert('RGBA'))
def lum(a): return .299*a[...,0]+.587*a[...,1]+.114*a[...,2]
# ---------- the tileset, graded for contrast: a darker aisle and slabs, the skulls in the walls kept bright ----------
def curve(L):
    P=[(0,0),(16,10),(56,27),(92,40),(134,50),(159,58),(173,90),(195,150),(214,178),(255,215)]
    xs,ys=zip(*P); return np.interp(L,xs,ys)
def grade(a,hue=34,pull=.6,sat=.9):
    out=a.copy(); flat=out.reshape(-1,4)
    for c in np.unique(flat[:,:3],axis=0):
        h,s,v=colorsys.rgb_to_hsv(*(c/255)); h=h*360; h2=h+(hue-h)*pull
        r1,g1,b1=colorsys.hsv_to_rgb(h2/360,s*sat,1.0); L1=.299*r1*255+.587*g1*255+.114*b1*255
        v2=min(1.0,float(curve(.299*c[0]+.587*c[1]+.114*c[2]))/max(1e-6,L1)); m=np.array(colorsys.hsv_to_rgb(h2/360,s*sat,v2))*255
        sel=(flat[:,0]==c[0])&(flat[:,1]==c[1])&(flat[:,2]==c[2]); flat[sel,:3]=m.round()
    return out
W_=sys.argv[1]
raw=rgba(Image.open(os.path.join(W_,'sheet.png')))
# the aisle's loud features painted out as before (floor.py's --patch), then the cut by the walls' bands
at=json.load(open(os.path.join(W_,'at.json')))['at']
low=raw[at[0][1]:at[0][1]+64,at[0][0]:at[0][0]+64].copy(); fixed=low.copy()
for (x0,y0,x1,y1,dy) in ((30,14,40,24,-12),(40,36,53,50,14)): fixed[y0:y1,x0:x1]=low[y0+dy:y1+dy,x0:x1]
for k in range(16):
    t=raw[at[k][1]:at[k][1]+64,at[k][0]:at[k][0]+64]
    for (x0,y0,x1,y1,dy) in ((30,14,40,24,-12),(40,36,53,50,14)):
        sub=t[y0:y1,x0:x1]; same=(sub==low[y0:y1,x0:x1]).all(-1); sub[same]=fixed[y0:y1,x0:x1][same]
cut=rgba(Image.open(os.path.join(W_,'cut.png')))   # only for its alpha: which pixels the walls keep
g=grade(raw); g[...,3]=cut[...,3]; Image.fromarray(g).save(os.path.join(W_,'tiles.png'))
# the frieze along each side of a floor square that meets the aisle: skulls and crossed bones in turn, as over Sedlec's door
def friezeH():
    S=Sheet(64,12)
    for i in range(4): x=8+i*16; skull(S,x,6,9)
    for i in range(3): crossbones(S,16+i*16,6,11,.8)
    return S.img()
def friezeV():
    S=Sheet(12,64)
    for i in range(4): y=8+i*16; skull(S,6,y,9)
    for i in range(3): crossbones(S,6,16+i*16,11,.8)
    return S.img()
# ---------- the dais all three share: the chandelier seen from above, a sunburst of bones ringed with skulls ----------
def dais(D=112):
    S=Sheet(D,D); c=D/2; YY,XX=S.YY,S.XX
    base=ellipse(D,D,c,c,c-2,c-2); S.piece(base,flat=4,ramp=['#1d1914','#2a241d','#352e25','#41392e','#4c4336'])
    rim=ellipse(D,D,c,c,c-8,c-8)&~ellipse(D,D,c,c,c-10,c-10); S.cv.put(rim,'#15110d')
    for k in range(32):
        t=k*2*math.pi/32+(math.pi/32); r0,r1=(22,40) if k%2 else (24,44)
        femur(S,c+math.cos(t)*r0,c+math.sin(t)*r0,c+math.cos(t)*r1,c+math.sin(t)*r1,.8,flat=1.0)
    for k in range(16):
        t=k*2*math.pi/16; skull(S,c+math.cos(t)*48,c+math.sin(t)*48,9)
    plate=ellipse(D,D,c,c,17,17); S.piece(plate,flat=5,ramp=['#2b251e','#3a3228','#4a4033','#5a4f3f','#6b5e4b'])
    for k in range(8):
        t=k*2*math.pi/8; skull(S,c+math.cos(t)*12.5,c+math.sin(t)*12.5,7,teeth=False)
    return S.img()
# ---------- B: the Sedlec chapel ----------
HEXC={'cream':['#6f6350','#7c6f5a','#8a7c65'],'grey':['#4b4844','#55524d','#605c56'],'rust':['#6a3e2a','#774630','#834e36']}
def hexfloor(seed):
    """a square of small hex tiles, periodic in 64: the tiles that cross the square's edges are grey in every variant, so squares meet,
       and the eleven inside it take cream, grey or rust by the variant's own draw"""
    random.seed(seed); W=64; img=np.zeros((W,W,4),np.uint8); img[...,3]=255; img[...,:3]=(36,31,25)
    cent=[]
    for row in range(4):
        y=row*16
        for col in range(4):
            x=col*16+(8 if row%2 else 0); cent.append((x,y))
    yy,xx=np.mgrid[0:W,0:W]
    # each pixel belongs to the nearest centre in a squashed metric (pointy hexes 16 wide, 21 tall); a pixel on a boundary is mortar
    best=np.full((W,W),1e9); sec=np.full((W,W),1e9); idx=np.zeros((W,W),int)
    for i,(x,y) in enumerate(cent):
        for ox in (-64,0,64):
            for oy in (-64,0,64):
                d=np.hypot((xx+.5-(x+ox)),(yy+.5-(y+oy))*.78)
                upd=d<best; sec=np.where(upd,best,np.minimum(sec,d)); idx=np.where(upd,i,idx); best=np.where(upd,d,best)
    tone={}
    for i,(x,y) in enumerate(cent):
        xm,ym=x%64,y%64; edge=(xm==0 or ym==0)
        tone[i]='grey' if edge else random.choices(['cream','grey','rust'],[5,3,1.4])[0]
    for i in range(len(cent)):
        m=idx==i; rmp=HEXC[tone[i]]
        img[m,:3]=np.array([tuple(int(rmp[1][j:j+2],16) for j in (1,3,5))])
        hi=m&(np.roll(idx,1,0)!=i)|m&(np.roll(idx,1,1)!=i); img[hi,:3]=tuple(int(rmp[2][j:j+2],16) for j in (1,3,5))
        lo=m&(np.roll(idx,-1,0)!=i)|m&(np.roll(idx,-1,1)!=i); img[lo,:3]=tuple(int(rmp[0][j:j+2],16) for j in (1,3,5))
    mortar=(sec-best)<1.1; img[mortar,:3]=(30,25,20)
    rng=np.random.default_rng(seed); n=rng.random((W,W))<.06; img[n&~mortar,:3]=(img[n&~mortar,:3]*.88).astype(np.uint8)
    return Image.fromarray(img)
def pyramid(seed,W=48,H=116):
    """a pyramid of skulls on a stone pedestal, as in Sedlec's corners: rows of skulls narrowing upward, a cross of bones on top"""
    random.seed(seed); S=Sheet(W,H); YY,XX=S.YY,S.XX
    top=(XX>=6)&(XX<42)&(YY>=H-30)&(YY<H-24); front=(XX>=6)&(XX<42)&(YY>=H-24)&(YY<H-4)
    S.piece(front,flat=2,ramp=['#1c1814','#26211b','#302a22','#3a3229','#433a30'])
    S.piece(top,flat=2,ramp=['#3a3229','#463d32','#52483b','#5e5344','#6a5e4d'])
    for (x,y) in ((10,H-17),(37,H-17)): S.cv.px(x,y,'#57412c')
    rows=[(5,H-35),(4,H-43),(4,H-51),(3,H-59),(3,H-67),(2,H-75),(2,H-83),(1,H-91)]
    for n,y in rows:
        w=n*8; x0=W/2-w/2+4
        for i in range(n): skull(S,x0+i*8+random.uniform(-.3,.3),y,9)
    femur(S,W/2,H-112,W/2,H-96,1.0); femur(S,W/2-6,H-107,W/2+6,H-107,.9)
    return S.img()
if __name__=='__main__':
    for i in range(8): hexfloor(i+1).save(os.path.join(W_,f'hex{i}.png'))
    for i in range(3): pyramid(i).save(os.path.join(W_,f'pyr{i}.png'))
    friezeH().save(os.path.join(W_,'friezeH.png')); friezeV().save(os.path.join(W_,'friezeV.png')); dais().save(os.path.join(W_,'dais.png'))
    print('written to',W_)
