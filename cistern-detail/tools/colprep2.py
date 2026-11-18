# colprep2.py <scale> <luma> <fade> <ids...>: columns scaled by nearest, graded to a brightness (hues kept), their tops faded into the dark
import sys, json, numpy as np
from PIL import Image
sys.path.insert(0,'/tmp/claude-0/-home-user-the-last-lamp/df56029d-169b-5d0a-a5c1-e51437e4f439/scratchpad/c6')
from grade import grade
C6='/tmp/claude-0/-home-user-the-last-lamp/df56029d-169b-5d0a-a5c1-e51437e4f439/scratchpad/c6'
sc, luma, fade = float(sys.argv[1]), float(sys.argv[2]), float(sys.argv[3]); out={}
for i in sys.argv[4:]:
    im=Image.open(f'{C6}/props/col{i}.png').convert('RGBA')
    im=grade(im,luma=luma,cs=1.1,ss=.35)
    im=im.resize((round(im.width*sc),round(im.height*sc)),Image.NEAREST)
    a=np.asarray(im).astype(float); H,W=a.shape[:2]; op=a[...,3]>0; ys,xs=np.nonzero(op); top,bot=ys.min(),ys.max()
    out[i]={'ax':round(float(xs[ys>=bot-4].mean())),'ay':int(bot)-3}
    t=np.clip((np.arange(H)-top)/(fade*(bot-top)),0,1)[:,None]; t=np.floor(t*7)/7
    a[...,3]*=t; a[...,:3]*=(0.3+0.7*t)[...,None]
    Image.fromarray(a.clip(0,255).astype(np.uint8)).save(f'{C6}/props/colg{i}.png')
json.dump(out,open(f'{C6}/props/colg_anchor.json','w')); print(out)
