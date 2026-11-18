# pack a create_tiles_pro corner set (tile_k has mask k: NW8 NE4 SW2 SE1, first terrain = floor) into a 4x4 sheet + lookup
import sys, json, glob, re
from PIL import Image
src, name = sys.argv[1], sys.argv[2]
files = {int(re.search(r'_(\d+)\.png$', f).group(1)): f for f in glob.glob(src + '/*.png')}
t0 = Image.open(files[0]); TS = t0.width
sheet = Image.new('RGBA', (TS*4, TS*4))
at = []
for k in range(16):
    im = Image.open(files[k]).convert('RGBA'); assert im.size == (TS, TS), im.size
    x, y = (k % 4)*TS, (k//4)*TS; sheet.paste(im, (x, y)); at.append([x, y])
sheet.save(f'ts/{name}.png'); json.dump({'TS': TS, 'at': at}, open(f'ts/{name}.at.json', 'w')); print(TS, sheet.size)
