"""The Ossuary's floor, the bone mosaics (pixel stair step 7; Criss, 26 Nov 2026: "mix 1's border with the mosaic design", from photos of
Sedlec and other ossuaries). Drawn by hand with bones.py, from the Wang set floor.py fetched (sheet.png, at.json) and the cut it made
(cut.png: only its alpha is used, which pixels the walls keep):

  python3 ossuary_mosaics.py <dir>

writes into <dir>: tiles.png (the set graded for contrast: a darker aisle and slabs, the skulls in the walls kept bright; the floor cut
away), slab0.png to slab7.png (dark stone slabs, one a square, five inlaid with a picture in bone: a rosette, a sunburst, a frame, crossed
bones, a diamond; three plain), friezeH.png and friezeV.png (skulls and crossed bones in turn, laid along each side of the floor that meets
the aisle) and dais.png (the lamp's dais: a chandelier seen from above, a sunburst of bones ringed with skulls). Pack them with pack.py.
"""
import sys, os, json, math, colorsys, numpy as np
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
# the plain slab, rolled so its joints lie on its top and left edges, and darkened to a cold dark stone
plain=raw[at[15][1]:at[15][1]+64,at[15][0]:at[15][0]+64]; slab0=np.roll(plain,(-30,-41),axis=(0,1))
def stone(a,k=.42,des=.35):
    out=a.astype(float); L=lum(out)[...,None]; out[...,:3]=(out[...,:3]*(1-des)+L*des)*k; return out.clip(0,255).astype(np.uint8)
def slabvar(i):
    q=np.rot90(slab0[4:,4:],i%4)
    if i>=4: q=q[:,::-1]
    v=slab0.copy(); v[4:,4:]=q; return stone(v)
def onslab(i,draw):
    S=Sheet(64,64); S.cv.rgba[:]=slabvar(i); draw(S); return S.img()
C=33.5
# ---------- A: bone mosaics ----------
def rosette(S):
    for a in (45,135,225,315):
        t=math.radians(a); femur(S,C+math.cos(t)*7,C+math.sin(t)*7,C+math.cos(t)*24,C+math.sin(t)*24,1.0)
    for a in (270,0,90,180):
        t=math.radians(a); skull(S,C+math.cos(t)*19,C+math.sin(t)*19,9)
    skull(S,C,C,11)
def sunburst(S):
    for k in range(12):
        t=k*math.pi/6; femur(S,C+math.cos(t)*10,C+math.sin(t)*10,C+math.cos(t)*23,C+math.sin(t)*23,.85,flat=1.0)
    skull(S,C,C,13)
def frame(S):
    for (a,b,c,d) in ((14,11,53,11),(14,56,53,56),(10,15,10,52),(57,15,57,52)): femur(S,a,b,c,d,1.0)
    for (x,y) in ((10,11),(57,11),(10,56),(57,56)): skull(S,x,y,9)
    skull(S,C,C,11)
def crossed(S):
    crossbones(S,C,C+1,44,1.3); skull(S,C,C-1,13)
def diamond(S):
    P=[(C,8),(59,C),(C,59),(8,C)]
    for i in range(4): femur(S,*P[i],*P[(i+1)%4],1.0)
    skull(S,C,C,11)
A_slabs=[onslab(0,rosette),onslab(1,sunburst),onslab(2,frame),onslab(3,crossed),onslab(5,diamond),onslab(4,lambda S:None),onslab(6,lambda S:None),onslab(7,lambda S:None)]
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
if __name__=='__main__':
    for i,im in enumerate(A_slabs): im.save(os.path.join(W_,f'slab{i}.png'))
    friezeH().save(os.path.join(W_,'friezeH.png')); friezeV().save(os.path.join(W_,'friezeV.png')); dais().save(os.path.join(W_,'dais.png'))
    print('written to',W_)
