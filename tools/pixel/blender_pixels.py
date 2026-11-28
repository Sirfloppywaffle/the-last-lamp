"""Turn tools/blender/ossuary_pyramid.py's renders into the Ossuary's pyramid sprite, in the game's palette and outline (bones.py):

    python tools/pixel/blender_pixels.py <dir> [seed ...]

reads shade<seed>.png, id<seed>.png and inst<seed>.png (8x the sprite) from <dir> and writes pyr<seed>.png (48 by 116) and
pyr<seed>_x4.png (a preview) beside them. Each sprite pixel is one 8 by 8 block: it is there if half the block is; it is a socket if a
quarter of it is (so the small dark holes survive the shrink), else what most of it is; its light is the mean light of that part of the
block. Bone takes bones.py's five tones and stone the pedestal's, each by where its light falls among that material's pixels, so the
render's brightness doesn't matter, only its order. Sockets are HOLE; the teeth are bone with every other pixel DEEP; where one skull
meets another lower in the light, the darker side gets a line, so the heap reads as skulls; and the outline is px.py's, dark with a
lighter edge toward the top left.
"""
import sys, os, numpy as np
from PIL import Image
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from bones import BONE, OUT as OUTC, OUTL, HOLE, DEEP
STONE = ['#1c1814', '#302a22', '#3a3229', '#52483b', '#6a5e4d']   # few tones, so a flat face stays flat (no stripes from the render's soft light)
W, H, K = 48, 116, 8
SHARE = {'bone': [.1, .2, .3, .25, .15], 'stone': [.1, .5, .2, .12, .08]}

def hexrgb(h): return tuple(int(h[i:i + 2], 16) for i in (1, 3, 5))
def bands(vals, shares):
    """thresholds that split vals into len(shares) bands of those shares, dark to light"""
    q = np.cumsum(shares)[:-1]
    return np.quantile(vals, q) if len(vals) else np.zeros(len(q))

def convert(d, seed):
    sh = np.asarray(Image.open(os.path.join(d, f'shade{seed}.png')).convert('RGBA')).astype(float)
    idm = np.asarray(Image.open(os.path.join(d, f'id{seed}.png')).convert('RGBA'))
    ins = np.asarray(Image.open(os.path.join(d, f'inst{seed}.png')).convert('RGBA'))
    on = idm[..., 3] > 127
    r, g, b = idm[..., 0] > 127, idm[..., 1] > 127, idm[..., 2] > 127
    cls = np.full(on.shape, -1); cls[on & r & ~g] = 0; cls[on & b & ~r] = 1; cls[on & r & g] = 2; cls[on & g & ~r] = 3   # bone socket teeth stone
    lumh = .299 * sh[..., 0] + .587 * sh[..., 1] + .114 * sh[..., 2]
    blk = lambda a: a.reshape(H, K, W, K).swapaxes(1, 2).reshape(H, W, K * K)
    C, Lh, I = blk(cls), blk(lumh), blk(ins[..., 0].astype(int))
    cover = (C >= 0).mean(-1)
    out_cls = np.full((H, W), -1); lum = np.zeros((H, W)); inst = np.zeros((H, W), int)
    for y in range(H):
        for x in range(W):
            if cover[y, x] < .5: continue
            c = C[y, x]; cnt = np.bincount(c[c >= 0], minlength=4)
            k = 1 if cnt[1] >= K * K * .34 else int(np.argmax(cnt))
            out_cls[y, x] = k
            sel = c == (0 if k in (1, 2) else k)
            if not sel.any(): sel = c >= 0
            lum[y, x] = Lh[y, x][sel].mean()
            ii = I[y, x][c >= 0]; inst[y, x] = np.bincount(ii).argmax()
    img = np.zeros((H, W, 4), np.uint8)
    put = lambda m, col: img.__setitem__(m, (*hexrgb(col), 255))
    # bone and teeth share the bone tones; stone takes the pedestal's
    for name, ks, ramp in (('bone', (0, 2), BONE), ('stone', (3,), STONE)):
        m = np.isin(out_cls, ks); t = bands(lum[m], SHARE[name])
        idx = np.searchsorted(t, lum)
        for i, col in enumerate(ramp): put(m & (idx == i), col)
    put(out_cls == 1, HOLE)
    teeth = out_cls == 2; xs = np.arange(W)[None, :].repeat(H, 0); put(teeth & (xs % 2 == 1), DEEP)
    # a line where two skulls meet: on the darker side of the seam, so each skull keeps its lit rim
    bone = np.isin(out_cls, (0, 2))
    seam = np.zeros((H, W), bool)
    for dy, dx in ((0, 1), (1, 0), (0, -1), (-1, 0)):
        nb_inst = np.roll(np.roll(inst, -dy, 0), -dx, 1); nb_bone = np.roll(np.roll(bone, -dy, 0), -dx, 1)
        nb_lum = np.roll(np.roll(lum, -dy, 0), -dx, 1)
        seam |= bone & nb_bone & (nb_inst != inst) & (lum < nb_lum)
    put(seam & (out_cls == 0), OUTL)
    # the outline round the whole sprite: dark, lighter on the top left (px.py's outline)
    solid = img[..., 3] > 0; p = np.pad(solid, 1)
    ring = ~solid & (p[:-2, 1:-1] | p[2:, 1:-1] | p[1:-1, :-2] | p[1:-1, 2:])
    put(ring, OUTC)
    lit = ring & (p[2:, 1:-1] | p[1:-1, 2:]) & ~(p[:-2, 1:-1] | p[1:-1, :-2])   # the solid lies below or right of it: a top-left edge
    put(lit, OUTL)
    im = Image.fromarray(img); im.save(os.path.join(d, f'pyr{seed}.png'))
    im.resize((W * 4, H * 4), Image.NEAREST).save(os.path.join(d, f'pyr{seed}_x4.png'))
    return im

if __name__ == '__main__':
    d = sys.argv[1]
    for s in (sys.argv[2:] or ['0']): convert(d, int(s))
    print('blender_pixels: written to', d)
