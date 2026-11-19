"""Make a pixel floor's art from one PixelLab Wang set (create_topdown_tileset, pro, 64 px). Pixel stair step 7 made the Ossuary with it.

  python3 floor.py fetch <tileset_id> <dir>
      the sheet (<dir>/sheet.png), its metadata, and at.json: the game's 16-entry lookup for PIX_AT (key NW 8, NE 4, SW 2, SE 1; the
      upper terrain, the floor, is 1).
  python3 floor.py grade <dir> --k .5 --o 8 --hue 34 --pull .6 --sat .92 [--patch x0,y0,x1,y1,dy ...]
      grade.png: every colour moved to luminance L*k+o, its hue pulled toward --hue by --pull, its saturation times --sat (the Ossuary:
      PixelLab's slabs were twice the painted floor's brightness). Each --patch box (in the plain lower tile's own pixels) is painted over
      with the lower tile's pixels dy rows away, wherever a tile shows the plain lower tile there: a loud feature (a knob, a long bone)
      that would otherwise repeat a square at a time along the path.
  python3 floor.py slabs <dir> [--src grade.png] --roll -30,-41 --bands N=2,S=1,W=8,E=2
      slabs.png: eight slabs, the plain floor tile rolled so its dark joints lie on its top and left edges (find the joint's rows and
      columns first, e.g. by each row's mean brightness), its middle turned and flipped; and cut.png: the sheet with the floor cut away,
      so the slabs laid one a square under it show (PIX_FLOOR's at.slab). In each quadrant whose corner is floor only the wall's own
      pixels are kept: a band from the boundary as wide as that side's feature (N: the aisle is above, S: below, W: to the left, E: to the
      right; measure them, they differ by side). Use it when the set's slab grid does not fall on the board's squares.

Needs numpy and Pillow. Work in a scratch directory; only the finished PNGs go into index.html.
"""
import argparse, colorsys, json, os, urllib.request
import numpy as np
from PIL import Image

QUAD=((8,(slice(0,32),slice(0,32))),(4,(slice(0,32),slice(32,64))),(2,(slice(32,64),slice(0,32))),(1,(slice(32,64),slice(32,64))))

def tile(im,at,k,ts=64): x,y=at[k]; return im[y:y+ts,x:x+ts]

def fetch(a):
    os.makedirs(a.dir,exist_ok=True); base='https://api.pixellab.ai/mcp/tilesets/'+a.id
    get=lambda u: urllib.request.urlopen(u,timeout=60).read()
    open(os.path.join(a.dir,'sheet.png'),'wb').write(get(base+'/image?inline=true'))
    meta=json.loads(get(base+'/metadata')); json.dump(meta,open(os.path.join(a.dir,'meta.json'),'w'),indent=1)
    tiles=meta.get('tiles') or meta.get('tileset_data',{}).get('tiles') or meta
    at=[None]*16
    for t in tiles:
        c=t['corners']; bb=t['bounding_box']
        if any(c[n]=='transition' for n in c): continue
        k=sum(v for n,v in (('NW',8),('NE',4),('SW',2),('SE',1)) if c[n]=='upper')
        if at[k] is None: at[k]=[bb['x'],bb['y']]
    json.dump({'TS':tiles[0]['bounding_box']['width'],'at':at},open(os.path.join(a.dir,'at.json'),'w'))
    print('at',at)

def grade(a):
    im=np.array(Image.open(os.path.join(a.dir,'sheet.png')).convert('RGBA')); at=json.load(open(os.path.join(a.dir,'at.json')))['at']
    low=tile(im,at,0).copy(); fixed=low.copy(); boxes=[tuple(int(v) for v in p.split(',')) for p in a.patch or []]
    for (x0,y0,x1,y1,dy) in boxes: fixed[y0:y1,x0:x1]=low[y0+dy:y1+dy,x0:x1]
    for k in range(16):
        t=tile(im,at,k)
        for (x0,y0,x1,y1,dy) in boxes:
            sub=t[y0:y1,x0:x1]; same=(sub==low[y0:y1,x0:x1]).all(-1); sub[same]=fixed[y0:y1,x0:x1][same]
    lum=lambda c:.299*c[0]+.587*c[1]+.114*c[2]; flat=im.reshape(-1,4)
    for c in map(tuple,np.unique(flat[:,:3],axis=0)):
        h,s,v=colorsys.rgb_to_hsv(*(x/255 for x in c)); h=h*360; h2=h+(a.hue-h)*a.pull; s2=s*a.sat
        r1,g1,b1=colorsys.hsv_to_rgb(h2/360,s2,1.0); v2=min(1.0,(lum(c)*a.k+a.o)/max(1e-6,lum((r1*255,g1*255,b1*255))))
        m=tuple(round(x*255) for x in colorsys.hsv_to_rgb(h2/360,s2,v2))
        sel=(flat[:,0]==c[0])&(flat[:,1]==c[1])&(flat[:,2]==c[2]); flat[sel,:3]=m
    Image.fromarray(im).save(os.path.join(a.dir,'grade.png')); print('grade.png')

def shift(m,dy,dx):
    r=np.zeros_like(m); H,W=m.shape
    r[max(0,dy):H+min(0,dy),max(0,dx):W+min(0,dx)]=m[max(0,-dy):H+min(0,-dy),max(0,-dx):W+min(0,-dx)]; return r

def slabs(a):
    im=np.array(Image.open(os.path.join(a.dir,a.src)).convert('RGBA')); at=json.load(open(os.path.join(a.dir,'at.json')))['at']
    ry,rx=(int(v) for v in a.roll.split(',')); slab=np.roll(tile(im,at,15).copy(),(ry,rx),axis=(0,1)); I0=4; out=[]
    for k in range(8):
        q=np.rot90(slab[I0:,I0:],k%4)
        if k>=4: q=q[:,::-1]
        v=slab.copy(); v[I0:,I0:]=q; out.append(v)
    Image.fromarray(np.concatenate(out,1)).save(os.path.join(a.dir,'slabs.png'))
    B=dict((p.split('=')[0],int(p.split('=')[1])) for p in a.bands.split(','))
    cut=im.copy()
    for k in range(16):
        t=tile(cut,at,k); low=np.zeros((64,64),bool)
        for bit,(ys,xs) in QUAD:
            if not k&bit: low[ys,xs]=True
        keep=low.copy()
        for d in range(1,B['N']+1): keep|=shift(low,d,0)
        for d in range(1,B['S']+1): keep|=shift(low,-d,0)
        for d in range(1,B['W']+1): keep|=shift(low,0,d)
        for d in range(1,B['E']+1): keep|=shift(low,0,-d)
        for (sy,sx,p,q) in ((1,1,'N','W'),(1,-1,'N','E'),(-1,1,'S','W'),(-1,-1,'S','E')):
            for d in range(1,min(B[p],B[q])+1): keep|=shift(low,sy*d,sx*d)
        t[~keep,3]=0
    Image.fromarray(cut).save(os.path.join(a.dir,'cut.png')); print('slabs.png, cut.png')

if __name__=='__main__':
    ap=argparse.ArgumentParser(); sp=ap.add_subparsers(dest='cmd',required=True)
    f=sp.add_parser('fetch'); f.add_argument('id'); f.add_argument('dir'); f.set_defaults(fn=fetch)
    g=sp.add_parser('grade'); g.add_argument('dir'); g.add_argument('--k',type=float,default=.5); g.add_argument('--o',type=float,default=8)
    g.add_argument('--hue',type=float,default=34); g.add_argument('--pull',type=float,default=.6); g.add_argument('--sat',type=float,default=.92)
    g.add_argument('--patch',nargs='*'); g.set_defaults(fn=grade)
    s=sp.add_parser('slabs'); s.add_argument('dir'); s.add_argument('--src',default='grade.png'); s.add_argument('--roll',default='-30,-41')
    s.add_argument('--bands',default='N=2,S=1,W=8,E=2'); s.set_defaults(fn=slabs)
    a=ap.parse_args(); a.fn(a)
