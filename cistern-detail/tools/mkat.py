# build the game's lookup (key NW8 NE4 SW2 SE1, upper=1) from a tileset's metadata
import sys, json
name=sys.argv[1]; meta=json.load(open(f'ts/{name}.meta.json'))
tiles = meta.get('tiles') or meta.get('tileset_data',{}).get('tiles') or meta
at=[None]*16; ts=None
for t in tiles:
    c=t['corners']; bb=t['bounding_box']; ts=bb['width']
    k=sum(v for n,v in (('NW',8),('NE',4),('SW',2),('SE',1)) if c[n]=='upper')
    if any(c[n]=='transition' for n in c): print('transition corner?',t); continue
    if at[k] is None: at[k]=[bb['x'],bb['y']]
print(json.dumps({'TS':ts,'at':at}))
json.dump({'TS':ts,'at':at}, open(f'ts/{name}.at.json','w'))
