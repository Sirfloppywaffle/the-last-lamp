# a small pixel-art kit: shapes as masks, dome shading from the mask's own distance field lit from the top left, banded onto a colour
# ramp, a selective outline (darker on the shadow side), and stamps. Everything is drawn by these rules, pixel by pixel.
import numpy as np
from PIL import Image
def hexc(h): h=h.lstrip('#'); return tuple(int(h[i:i+2],16) for i in (0,2,4))
class Canvas:
    def __init__(s,w,h): s.w,s.h=w,h; s.rgba=np.zeros((h,w,4),np.uint8)
    def put(s,mask,col):
        c=hexc(col) if isinstance(col,str) else col; s.rgba[mask,:3]=c; s.rgba[mask,3]=255
    def px(s,x,y,col):
        if 0<=x<s.w and 0<=y<s.h: c=hexc(col); s.rgba[y,x,:3]=c; s.rgba[y,x,3]=255
    def clear(s,mask): s.rgba[mask,3]=0
    def opaque(s): return s.rgba[...,3]>0
    def save(s,p): Image.fromarray(s.rgba).save(p)
def grid(w,h): return np.mgrid[0:h,0:w]
def ellipse(w,h,cx,cy,rx,ry,rot=0):
    yy,xx=grid(w,h); x=xx+.5-cx; y=yy+.5-cy; c,s=np.cos(rot),np.sin(rot)
    u=x*c+y*s; v=-x*s+y*c; return (u/rx)**2+(v/ry)**2<=1
def capsule(w,h,x0,y0,x1,y1,r):
    yy,xx=grid(w,h); px,py=xx+.5,yy+.5; dx,dy=x1-x0,y1-y0; L2=dx*dx+dy*dy
    t=np.clip(((px-x0)*dx+(py-y0)*dy)/L2,0,1); qx,qy=x0+t*dx,y0+t*dy
    return (px-qx)**2+(py-qy)**2<=r*r
def dist_in(mask):
    """distance of each pixel inside the mask to its edge (a cheap chamfer), the dome's height"""
    INF=1e9; d=np.where(mask,INF,0.0); h,w=mask.shape
    for _ in range(2):
        for y in range(h):
            for x in range(w):
                if d[y,x]==0: continue
                b=d[y,x]
                if y>0: b=min(b,d[y-1,x]+1)
                if x>0: b=min(b,d[y,x-1]+1)
                if y>0 and x>0: b=min(b,d[y-1,x-1]+1.414)
                if y>0 and x<w-1: b=min(b,d[y-1,x+1]+1.414)
                d[y,x]=b
        for y in range(h-1,-1,-1):
            for x in range(w-1,-1,-1):
                if d[y,x]==0: continue
                b=d[y,x]
                if y<h-1: b=min(b,d[y+1,x]+1)
                if x<w-1: b=min(b,d[y,x+1]+1)
                if y<h-1 and x<w-1: b=min(b,d[y+1,x+1]+1.414)
                if y<h-1 and x>0: b=min(b,d[y+1,x-1]+1.414)
                d[y,x]=b
    return d
def shade(mask,ramp,light=(-1,-1.3,1.5),flat=2.2,bias=0.0):
    """dome-shade a mask: height from its distance field (capped so wide shapes stay rounded only at their rims), normals from the
    height's slope, lambert light from the top left, banded onto the ramp (dark to light)"""
    d=np.minimum(dist_in(mask),flat); hgt=np.sqrt(np.clip(d/flat,0,1))
    gy,gx=np.gradient(hgt); nx,ny,nz=-gx*2.2,-gy*2.2,np.ones_like(hgt)
    n=np.sqrt(nx*nx+ny*ny+nz*nz); L=np.array(light,float); L/=np.linalg.norm(L)
    lam=(nx*L[0]+ny*L[1]+nz*L[2])/n+bias
    k=np.clip((lam-.35)/.65,0,1); idx=np.clip((k*len(ramp)).astype(int),0,len(ramp)-1)
    out=np.full(mask.shape,-1); out[mask]=idx[mask]; return out
def paint(cv,idx,ramp):
    for i,c in enumerate(ramp): cv.put(idx==i,c)
def outline(cv,mask,dark,lit=None):
    """a one-pixel outline round the mask: dark on the shadow side, a little lighter where the light comes from (top left)"""
    h,w=mask.shape; p=np.pad(mask,1); ring=(~mask)&(p[:-2,1:-1]|p[2:,1:-1]|p[1:-1,:-2]|p[1:-1,2:])
    cv.put(ring,dark)
    if lit:
        litside=ring&(p[2:,1:-1]|p[1:-1,2:])&~(p[:-2,1:-1]|p[1:-1,:-2])  # the mask lies below or right of it: the top-left rim
        cv.put(litside,lit)
    return ring
