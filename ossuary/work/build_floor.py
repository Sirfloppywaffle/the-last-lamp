# the Ossuary's floor from its one Wang set.
# (1) one slab a square: the plain floor tile turned so its dark joints lie on the square's top and left edges, in eight variants (its
#     middle turned and flipped, the joints and their light bevels kept).
# (2) the Wang sheet with the floor cut away: in each quadrant whose corner is floor, only the wall's own pixels are kept, a band from the
#     boundary as wide as that side's feature (north: the lip, 2 px; south: the coping's edge, 1; west: the column of bones, 8; east: the
#     bevel, 2; diagonals: the smaller of the two); the rest is the slab laid under it.
import json, sys, numpy as np
from PIL import Image
src=sys.argv[1] if len(sys.argv)>1 else 'ts/O1.png'; out=sys.argv[2] if len(sys.argv)>2 else 'ts/O1'
im=np.array(Image.open(src).convert('RGBA'))
at=json.load(open('ts/O1.at.json'))['at']
T=lambda k: im[at[k][1]:at[k][1]+64, at[k][0]:at[k][0]+64]
plain=T(15).copy()
slab=np.roll(plain,(-30,-41),axis=(0,1)); I0=4
vars=[]
for k in range(8):
    q=np.rot90(slab[I0:,I0:],k%4)
    if k>=4: q=q[:,::-1]
    v=slab.copy(); v[I0:,I0:]=q; vars.append(v)
Image.fromarray(np.concatenate(vars,1)).save(out+'_slabs.png')
B={'N':2,'S':1,'W':8,'E':2}
def shift(m,dy,dx):
    r=np.zeros_like(m); H,W=m.shape
    ys=slice(max(0,dy),H+min(0,dy)); xs=slice(max(0,dx),W+min(0,dx)); ys2=slice(max(0,-dy),H+min(0,-dy)); xs2=slice(max(0,-dx),W+min(0,-dx))
    r[ys,xs]=m[ys2,xs2]; return r
cut=im.copy()
for k in range(16):
    x0,y0=at[k]; t=cut[y0:y0+64,x0:x0+64]
    low=np.zeros((64,64),bool)
    for bit,(ys,xs) in ((8,(slice(0,32),slice(0,32))),(4,(slice(0,32),slice(32,64))),(2,(slice(32,64),slice(0,32))),(1,(slice(32,64),slice(32,64)))):
        if not k&bit: low[ys,xs]=True
    keep=low.copy()
    # a floor pixel with the aisle above it (north) within B['N'], below it (south), to its left (west), to its right (east)
    for d in range(1,B['N']+1): keep|=shift(low,d,0)
    for d in range(1,B['S']+1): keep|=shift(low,-d,0)
    for d in range(1,B['W']+1): keep|=shift(low,0,d)
    for d in range(1,B['E']+1): keep|=shift(low,0,-d)
    for (sy,sx,a,b) in ((1,1,'N','W'),(1,-1,'N','E'),(-1,1,'S','W'),(-1,-1,'S','E')):
        for d in range(1,min(B[a],B[b])+1): keep|=shift(low,sy*d,sx*d)
    t[~keep,3]=0
Image.fromarray(cut).save(out+'_cut.png')
print('kept per tile',[int((cut[at[k][1]:at[k][1]+64,at[k][0]:at[k][0]+64,3]>0).sum()) for k in range(16)])
