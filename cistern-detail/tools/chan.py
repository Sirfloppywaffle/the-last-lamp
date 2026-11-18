# chan.py <name> [near]: the Wang sheet with its floor cut away (pixels the set pasted from its plain floor tile, and the fringe close to
# it), so only the channel, its water and the kerb are left, to lay over a floor of slabs. Isolated specks are cleaned both ways.
import sys, json, numpy as np
from PIL import Image
n = sys.argv[1]; near = int(sys.argv[2]) if len(sys.argv) > 2 else 40
sh = np.asarray(Image.open(f'ts/{n}.png').convert('RGBA')).astype(int); at = json.load(open(f'ts/{n}.at.json'))['at']; T = json.load(open(f'ts/{n}.at.json'))['TS']
full = sh[at[15][1]:at[15][1]+T, at[15][0]:at[15][0]+T]
out = sh.copy().astype(np.uint8)
def majority(m, it=2):
    m = m.copy()
    for _ in range(it):
        p = np.pad(m, 1, mode='edge').astype(int)
        s = sum(p[1+dy:1+dy+m.shape[0], 1+dx:1+dx+m.shape[1]] for dy in (-1,0,1) for dx in (-1,0,1))
        m = np.where(s >= 6, True, np.where(s <= 3, False, m))
    return m
for k in range(16):
    x, y = at[k]; a = sh[y:y+T, x:x+T]
    if k == 15: out[y:y+T, x:x+T, 3] = 0; continue
    du = np.abs(a - full)[..., :3].sum(2)
    # a quadrant whose corner is channel is kept whole (its water may share colours with the floor's joints)
    wq = np.zeros((T, T), bool); h = T//2
    for bit, (qy, qx) in ((8,(0,0)), (4,(0,h)), (2,(h,0)), (1,(h,h))):
        if not (k & bit): wq[qy:qy+h, qx:qx+h] = True
    keep = majority((du >= near) | wq) | wq
    t = out[y:y+T, x:x+T]; t[..., 3] = np.where(keep, 255, 0)
    # a joint where the kerb meets the slabs: the floor pixels just outside what is kept go dark
    p = np.pad(keep, 1)
    edge = (~keep) & (p[:-2,1:-1] | p[2:,1:-1] | p[1:-1,:-2] | p[1:-1,2:])
    t[edge] = (8, 12, 14, 170)
Image.fromarray(out).save(f'ts/{n}_chan.png'); print('ok', n)
