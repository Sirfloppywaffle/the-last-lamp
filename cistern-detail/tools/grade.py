# grade(): bring a tile to a target brightness, keeping its hues: scale to the target mean luma, ease the contrast, ease the saturation
import numpy as np
from PIL import Image
L=np.array([.299,.587,.114])
def grade(im, luma=60.0, cs=1.0, ss=1.0, tint=None):
    a=np.asarray(im.convert('RGBA')).astype(float); rgb=a[...,:3]; m=a[...,3]>0
    lm=(rgb[m]@L).mean(); rgb=rgb*(luma/max(lm,1))
    mu=rgb[m].mean(0); rgb=mu+(rgb-mu)*cs
    y=(rgb@L)[...,None]; rgb=y+(rgb-y)*ss
    if tint is not None: rgb=rgb*np.array(tint)
    a[...,:3]=np.clip(rgb,0,255); return Image.fromarray(a.astype(np.uint8))
