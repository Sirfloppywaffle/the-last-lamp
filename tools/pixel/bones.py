"""Bone stamps (pixel stair step 7): skulls from the front (7 to 13 px wide), long bones at any angle, crossed bones. Each is drawn into
its own mask and painted with px.py's dome shading and outline, so pieces can be packed tight into patterns and later ones lie over
earlier ones. ossuary_mosaics.py builds the Ossuary's floor from them. Run this file to preview the stamps (stamps_x4.png).
"""
import sys, os, math, numpy as np
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from px import *
from PIL import Image
BONE=['#4e4232','#7d6d55','#a8977a','#cdbd9d','#ece0c3']; OUT='#120d09'; OUTL='#2c2219'; HOLE='#0b0806'; DEEP='#2a2018'
class Sheet:
    """a canvas that pieces are stamped onto one after another, each with its own outline (later pieces lie over earlier ones)"""
    def __init__(s,w,h): s.w,s.h=w,h; s.cv=Canvas(w,h); s.YY,s.XX=grid(w,h)
    def piece(s,m,flat=1.6,bias=0,ramp=BONE,outline_=True):
        paint(s.cv,shade(m,ramp,flat=flat,bias=bias),ramp)
        if outline_: outline(s.cv,m,OUT,OUTL)
    def img(s): return Image.fromarray(s.cv.rgba)
def skull(S,cx,cy,size=9,ramp=BONE,teeth=True):
    """a skull seen from the front: size 7, 9, 11 or 13 px wide"""
    w=size; r=w/2-.3; YY,XX=S.YY,S.XX
    m=ellipse(S.w,S.h,cx,cy-r*.18,r,r*.9)|ellipse(S.w,S.h,cx,cy+r*.42,r*.72,r*.55)
    if teeth: m|=(XX>=cx-r*.5)&(XX<cx+r*.5)&(YY>=cy+r*.55)&(YY<cy+r*.95)
    S.piece(m,flat=max(1.2,r*.55),bias=.06,ramp=ramp)
    # sockets: two dark holes, the nose a dot
    sx=max(1,round(r*.42)); sy=round(cy+r*.08)
    ss=1 if size<=9 else 2
    for d in (-sx,sx):
        x0=int(round(cx+d-ss/2)); 
        for yy in range(ss):
            for xx in range(ss): S.cv.px(x0+xx,sy-ss//2+yy,HOLE)
    if size>=11: S.cv.px(int(cx),sy+2,HOLE)
    if teeth and size>=9:
        ty=int(round(cy+r*.62))
        for i,x in enumerate(range(int(cx-r*.45),int(cx+r*.45)+1)):
            if i%2: S.cv.px(x,ty,DEEP)
def femur(S,x0,y0,x1,y1,r=1.1,ramp=BONE,flat=1.3):
    """a long bone from (x0,y0) to (x1,y1): its shaft, a pair of knuckles at one end, a round head at the other"""
    W,H=S.w,S.h; m=capsule(W,H,x0,y0,x1,y1,r); dx,dy=x1-x0,y1-y0; L=math.hypot(dx,dy) or 1; ux,uy=dx/L,dy/L; px,py=-uy,ux
    k=r*1.25
    for s in (1,-1): m|=ellipse(W,H,x1+px*s*k-ux*.2,y1+py*s*k-uy*.2,k*1.15,k*1.15)
    for s in (1,-1): m|=ellipse(W,H,x0+px*s*k*.9+ux*.2,y0+py*s*k*.9+uy*.2,k,k)
    S.piece(m,flat=flat,ramp=ramp)
def crossbones(S,cx,cy,L,r=1.0,ramp=BONE):
    h=L/2/math.sqrt(2)
    femur(S,cx-h,cy-h,cx+h,cy+h,r,ramp); femur(S,cx+h,cy-h,cx-h,cy+h,r,ramp)
if __name__=='__main__':
    S=Sheet(120,40)
    for i,sz in enumerate((7,9,11,13)): skull(S,8+i*18,12,sz)
    femur(S,4,30,40,26); crossbones(S,60,30,18); femur(S,80,36,110,20,1.3)
    S.img().resize((480,160),Image.NEAREST).save('stamps_x4.png'); print('ok')
