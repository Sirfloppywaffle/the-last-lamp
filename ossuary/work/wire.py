# wire the Ossuary's art into index.html (idempotent): PIX_SRC tiles/props, the PIX_AT row, the PIX_FLOOR row
import json, base64, re, sys
html, tiles, atlas, atlasj, atj = sys.argv[1:6]
s=open(html,encoding='utf8').read()
uri=lambda f:'data:image/png;base64,'+base64.b64encode(open(f,'rb').read()).decode()
# PIX_SRC
m=re.search(r'const PIX_SRC=(\{.*?\});\n',s); src=json.loads(m.group(1))
src['tiles']['ossuary']=uri(tiles); src['props']['ossuary']=uri(atlas)
s=s[:m.start(1)]+json.dumps(src,separators=(',',':'))+s[m.end(1):]
# PIX_AT
at=json.load(open(atj))['at']; row='ossuary:'+json.dumps(at,separators=(',',':'))
m=re.search(r'const PIX_AT=\{(cistern:\[\[.*?\]\])(,ossuary:\[\[.*?\]\])?\};',s)
s=s[:m.start()]+'const PIX_AT={'+m.group(1)+','+row+'};'+s[m.end():]
# PIX_FLOOR
A=json.load(open(atlasj)); J=lambda v:json.dumps(v,separators=(',',':'))
fl=("  ossuary:{ts:64,dry:true,tint:[[12,8,4,.42],[214,190,150,.12]],\n"
    "    at:{slab:"+J(A['slab'])+",\n      dais:"+J(A['dais'])+",rift:"+J(A['rift'])+",skull:"+J(A['skull'])+",\n      bones:"+J(A['bones'])+",chalk:"+J(A['chalk'])+",chips:"+J(A['chips'])+"},\n"
    "    props:[{k:'skull',p:.16,salt:80,pick:[84,3,0],jit:.3},{k:'bones',p:.16,salt:80,pick:[84,3,1],rot:1,jit:.25},{k:'chalk',p:.16,salt:80,pick:[84,3,2],jit:.1},\n"
    "      {k:'chips',p:.16,salt:90,path:1,rot:1,jit:.3}]}")
i=s.index('const PIX_FLOOR={'); j=s.index('}};\n',i)+3
body=s[i:j]; k=body.find(',\n  ossuary:{')
if k>=0: body=body[:k]+'};'
body=body[:-2]+',\n'+fl+'};'
s=s[:i]+body+s[j:]
open(html,'w',encoding='utf8').write(s); print('wired; index.html',len(s.encode()),'bytes')
