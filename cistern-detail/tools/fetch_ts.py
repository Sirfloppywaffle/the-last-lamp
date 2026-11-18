# fetch a create_topdown_tileset result: sheet + metadata -> ts/<name>.png, ts/<name>.json (with the game's 16-entry lookup)
import sys, json, urllib.request, os
tid, name = sys.argv[1], sys.argv[2]
base='https://api.pixellab.ai/mcp/tilesets/'+tid
def get(u):
    with urllib.request.urlopen(u, timeout=60) as r: return r.read()
img=get(base+'/image?inline=true'); open(f'ts/{name}.png','wb').write(img)
meta=json.loads(get(base+'/metadata')); json.dump(meta, open(f'ts/{name}.meta.json','w'), indent=1)
print(json.dumps(meta)[:1500])
