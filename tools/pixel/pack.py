"""Pack a pixel floor's art for index.html (pixel stair steps 6c and 7).

  python3 pack.py extract <index.html> <key.path> <out.png>
      one image out of PIX_SRC, e.g. props.cistern (the Cistern's atlas) or tiles.cistern, to reuse or recolour.
  python3 pack.py sheet <in.png> <out.png> [--colors 64]
      a Wang sheet (cut.png from floor.py, or a whole one) as a palette PNG; transparency kept.
  python3 pack.py atlas <spec.json> <out_dir>
      one atlas of a floor's slabs, dais, rift and props: atlas.png (a palette PNG) and atlas.json, the rects by kind for PIX_FLOOR's at.
      spec: {"width":512, "strips":[["slab","slabs.png",64]], "items":[["skull","o_skull_a.png"],["dais","o_dais_s.png"],...]};
      a strip is cut into cells of that width and laid first, on the top row; the rest shelf-packed, tallest first. Paths are relative
      to the spec's folder.
  python3 pack.py uri <png>
      the data URI to paste into PIX_SRC (tiles.<deco> or props.<deco>), and its size.

Needs numpy and Pillow.
"""
import argparse, base64, io, json, os, re
import numpy as np
from PIL import Image

def png_bytes(im):
    b=io.BytesIO(); im.save(b,'PNG',optimize=True); return b.getvalue()

def quant(im,n):
    """a palette PNG: exact when the art has no more than n colours (alpha included), else quantized with alpha kept"""
    a=np.array(im.convert('RGBA')); a[a[...,3]==0]=0; im=Image.fromarray(a)          # a clear pixel's colour is not a colour
    cols,inv=np.unique(a.reshape(-1,4),axis=0,return_inverse=True)
    if len(cols)<=n:
        q=Image.fromarray(inv.reshape(a.shape[:2]).astype(np.uint8),'P'); q.putpalette(cols[:,:3].astype(np.uint8).flatten().tolist())
        q.info['transparency']=bytes(cols[:,3].astype(np.uint8).tolist())
    else: q=im.quantize(colors=n,method=Image.Quantize.FASTOCTREE,dither=Image.Dither.NONE)
    back=np.asarray(q.convert('RGBA')).astype(int); orig=np.asarray(im.convert('RGBA')).astype(int); m=orig[...,3]>0
    print('  alpha kept %.4f, colour error %.2f'%((np.abs(back[...,3]-orig[...,3])<=1).mean(),np.abs(back[m][:,:3]-orig[m][:,:3]).mean()))
    return q

def extract(a):
    s=open(a.html,encoding='utf8').read(); m=re.search(r'const PIX_SRC=(\{.*?\});\n',s); src=json.loads(m.group(1))
    for k in a.path.split('.'): src=src[k]
    open(a.out,'wb').write(base64.b64decode(src.split(',',1)[1])); print(a.out)

def sheet(a):
    q=quant(Image.open(a.src),a.colors); q.save(a.out,optimize=True); print(a.out,len(png_bytes(q)),'bytes')

def atlas(a):
    spec=json.load(open(a.spec)); base=os.path.dirname(os.path.abspath(a.spec)); W=spec.get('width',512)
    os.makedirs(a.out,exist_ok=True); rects={}; place=[]; x=y=rowh=0
    for k,f,cw in spec.get('strips',[]):
        im=Image.open(os.path.join(base,f)).convert('RGBA')
        for i in range(im.width//cw):
            if x+cw>W: x=0; y+=rowh; rowh=0
            place.append((k,im.crop((i*cw,0,i*cw+cw,im.height)),x,y)); x+=cw; rowh=max(rowh,im.height)
    items=[(k,Image.open(os.path.join(base,f)).convert('RGBA')) for k,f in spec['items']]
    for k,im in sorted(items,key=lambda t:-t[1].height):
        if x+im.width>W: x=0; y+=rowh; rowh=0
        place.append((k,im,x,y)); x+=im.width; rowh=max(rowh,im.height)
    A=Image.new('RGBA',(W,y+rowh))
    for k,im,px,py in place: A.alpha_composite(im,(px,py)); rects.setdefault(k,[]).append([px,py,im.width,im.height])
    q=quant(A,255); q.save(os.path.join(a.out,'atlas.png'),optimize=True); json.dump(rects,open(os.path.join(a.out,'atlas.json'),'w'))
    print('atlas',A.size,len(png_bytes(q)),'bytes'); print(json.dumps(rects,separators=(',',':')))

def uri(a):
    b=open(a.png,'rb').read(); u='data:image/png;base64,'+base64.b64encode(b).decode(); print(u); print(len(u),'chars',file=__import__('sys').stderr)

if __name__=='__main__':
    ap=argparse.ArgumentParser(); sp=ap.add_subparsers(dest='cmd',required=True)
    e=sp.add_parser('extract'); e.add_argument('html'); e.add_argument('path'); e.add_argument('out'); e.set_defaults(fn=extract)
    s=sp.add_parser('sheet'); s.add_argument('src'); s.add_argument('out'); s.add_argument('--colors',type=int,default=64); s.set_defaults(fn=sheet)
    t=sp.add_parser('atlas'); t.add_argument('spec'); t.add_argument('out'); t.set_defaults(fn=atlas)
    u=sp.add_parser('uri'); u.add_argument('png'); u.set_defaults(fn=uri)
    a=ap.parse_args(); a.fn(a)
