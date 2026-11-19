# the Ossuary's atlas: eight slabs, then the dais, the rift and the props; rects by kind -> atlas.json
import json, sys
from PIL import Image
C7='/tmp/claude-0/-home-user-the-last-lamp/df56029d-169b-5d0a-a5c1-e51437e4f439/scratchpad/c7'
pick=json.loads(sys.argv[1]) if len(sys.argv)>1 else {}
H=lambda n:f'{C7}/hand/o_{n}.png'
kinds={'dais':pick.get('dais',['dais_s']),'rift':['rift_r'],'chalk':pick.get('chalk',['chalk_w','chalk_r']),
       'bones':pick.get('bones',['bones_h','bones_p22','bones_p9']),'skull':pick.get('skull',['skull_a','skull_b','skull_c']),'chips':pick.get('chips',['chips_a','chips_b'])}
ims=[(k,n,Image.open(H(n)).convert('RGBA')) for k in kinds for n in kinds[k]]
slabs=Image.open(f'{C7}/ts/O2_slabs.png').convert('RGBA')
W=512; x=0; y=64; rowh=0; place=[]
for k,n,im in sorted(ims,key=lambda t:-t[2].height):
    if x+im.width>W: x=0; y+=rowh; rowh=0
    place.append((k,n,im,x,y)); x+=im.width; rowh=max(rowh,im.height)
A=Image.new('RGBA',(W,y+rowh)); A.paste(slabs,(0,0))
at={'slab':[[i*64,0,64,64] for i in range(8)]}
for k,n,im,px,py in place: A.paste(im,(px,py)); at.setdefault(k,[]).append([px,py,im.width,im.height])
out=pick.get('out','atlas'); A.save(f'{C7}/ts/{out}.png'); json.dump(at,open(f'{C7}/ts/{out}.json','w'))
print(A.size, {k:len(v) for k,v in at.items()})
