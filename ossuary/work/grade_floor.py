# the Ossuary's sheet made ready: (1) the aisle's two loud features (a round knob, a long bone) painted out wherever the plain aisle is
# pasted, so it does not repeat a square at a time; (2) the palette graded darker and warmer, toward the painted Ossuary
# (stone [78,68,56], path [42,35,28]): hue pulled toward 34 degrees, luminance L -> L*k+o, saturation a touch lower
import json, sys, colorsys, numpy as np
from PIL import Image
src,out=sys.argv[1],sys.argv[2]; k=float(sys.argv[3]) if len(sys.argv)>3 else .5; o=float(sys.argv[4]) if len(sys.argv)>4 else 8
im=np.array(Image.open(src).convert('RGBA'))
at=json.load(open('ts/O1.at.json'))['at']
x0,y0=at[0]; low=im[y0:y0+64,x0:x0+64].copy(); patched=low.copy()
for (bx0,by0,bx1,by1,dy) in ((30,14,40,24,-12),(40,36,53,50,14)):
    patched[by0:by1,bx0:bx1]=low[by0+dy:by1+dy,bx0:bx1]
n=0
for t in range(16):
    tx,ty=at[t]; tile=im[ty:ty+64,tx:tx+64]
    for (bx0,by0,bx1,by1,dy) in ((30,14,40,24,-12),(40,36,53,50,14)):
        sub=tile[by0:by1,bx0:bx1]; same=(sub==low[by0:by1,bx0:bx1]).all(-1)
        sub[same]=patched[by0:by1,bx0:bx1][same]; n+=int(same.sum())
print('pixels patched',n)
cols=np.unique(im.reshape(-1,4)[:,:3],axis=0)
lum=lambda c:.299*c[0]+.587*c[1]+.114*c[2]
M={}
for c in map(tuple,cols):
    h,s,v=colorsys.rgb_to_hsv(*(x/255 for x in c)); h=h*360; h2=h+(34-h)*.6; s2=s*.92
    r1,g1,b1=colorsys.hsv_to_rgb(h2/360,s2,1.0); L1=lum((r1*255,g1*255,b1*255)); Lt=lum(c)*k+o
    v2=min(1.0,Lt/L1); r,g,b=colorsys.hsv_to_rgb(h2/360,s2,v2); M[c]=(round(r*255),round(g*255),round(b*255))
flat=im.reshape(-1,4)
for c,m in M.items():
    sel=(flat[:,0]==c[0])&(flat[:,1]==c[1])&(flat[:,2]==c[2]); flat[sel,:3]=m
Image.fromarray(im).save(out)
for c,m in sorted(M.items(),key=lambda t:lum(t[0])): print('#%02x%02x%02x -> #%02x%02x%02x  L %3.0f -> %3.0f'%(*c,*m,lum(c),lum(m)))
