# the contact sheets for the step 7 PR, phone width
from PIL import Image, ImageDraw, ImageFont
C7='/tmp/claude-0/-home-user-the-last-lamp/df56029d-169b-5d0a-a5c1-e51437e4f439/scratchpad/c7'
B='/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'; R='/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
FT,FL,FS=ImageFont.truetype(B,30),ImageFont.truetype(B,22),ImageFont.truetype(R,19)
BG=(14,15,17); GOLD=(230,196,120); INK=(236,220,190); DIM=(175,170,155); PANEL=(46,52,56)
def wrap(t,f,w):
    out=[]; l=''
    for x in t.split():
        s=(l+' '+x).strip()
        if f.getlength(s)<=w: l=s
        else: out.append(l); l=x
    return out+([l] if l else [])
def sheet(title,sub,blocks,W,name):
    # blocks: list of (caption, [images side by side])
    M=16; y=M; hs=[]
    tl=wrap(title,FT,W-2*M); sl=wrap(sub,FS,W-2*M) if sub else []
    H=M+len(tl)*38+len(sl)*24+12
    for cap,ims in blocks: H+=30+max(i.height for i in ims)+16
    out=Image.new('RGB',(W,H+M),BG); d=ImageDraw.Draw(out)
    for l in tl: d.text((M,y),l,font=FT,fill=INK); y+=38
    for l in sl: d.text((M,y),l,font=FS,fill=DIM); y+=24
    y+=12
    for cap,ims in blocks:
        d.text((M,y),cap,font=FL,fill=GOLD); y+=30; x=M
        for im in ims: out.paste(im.convert('RGB'),(x,y)); x+=im.width+12
        y+=max(i.height for i in ims)+16
    out.save(f'{C7}/sheets/{name}',optimize=True); print(name,out.size)
O=lambda p:Image.open(f'{C7}/out/{p}')
sc=lambda im,k:im.resize((round(im.width*k),round(im.height*k)),Image.LANCZOS)
names=['The Upper Gallery','The Two Galleries','The Charnel Cloister']
# 1: the three maps lit and in the dark, folded
W=1200; k=(W-32-24)/3/744
sheet('The Ossuary in pixel art, laid by the game on its three maps',
      'Folded Fold. Top row lit everywhere so you can see it all; bottom row as you play, in the dark. The forks are part of the aisles.',
      [('Lit: '+', '.join(names),[sc(O(f'full/fold-m{m}-lit.png'),k) for m in range(3)]),
       ('In the dark',[sc(O(f'full/fold-m{m}-dark.png'),k) for m in range(3)])],W,'ossuary-1-maps.png')
# 2: up close, at the phone's own pixels: the pixel floor beside the painted one, same moment
a=O('full/fold-m0-lit.png').crop((0,0,560,430)); b=O('before/fold-m0-lit.png').crop((0,0,560,430))
sheet('Up close, at your phone\'s own pixels','Same map, same moment. The skulls packed in the aisle\'s walls, a slab to a square, and the props.',
      [('Pixel',[a]),('Painted, today',[b])],592,'ossuary-2-close.png')
# 3: unfolded and sideways
sheet('Unfolded and sideways','',[('Unfolded',[sc(O('full/open-m0-lit.png'),.7)]),('Folded, sideways',[sc(O('full/land-m0-lit.png'),.6)])],1200,'ossuary-3-shapes.png')
# 4: the props, numbered
slab=Image.open(f'{C7}/ts/O2_slabs.png').convert('RGBA').crop((0,0,64,64))
def cell(n,size=64,k=4,dark=False):
    im=Image.open(f'{C7}/hand/o_{n}.png').convert('RGBA'); bg=Image.new('RGBA',(size,size))
    for yy in range(0,size,64):
        for xx in range(0,size,64): bg.alpha_composite(slab,(xx,yy))
    if dark:
        a=Image.open(f'{C7}/ts/O2_cut.png').convert('RGBA'); bg=Image.new('RGBA',(size,size),(41,35,28,255))
    bg.alpha_composite(im,((size-im.width)//2,(size-im.height)//2)); return bg.resize((size*k,size*k),Image.NEAREST)
def numbered(ims):
    out=[]
    for i,im in enumerate(ims):
        c=Image.new('RGB',(im.width,im.height+28),BG); c.paste(im.convert('RGB'),(0,28)); ImageDraw.Draw(c).text((4,2),str(i+1),font=FL,fill=INK); out.append(c)
    return out
sheet('The props, numbered: pick any, or several','All drawn by hand or recoloured from PixelLab\'s spare 6c art; none cost a generation. Shown 4 times bigger on the floor\'s slab.',
      [('Skulls (on the floor, where the painted skulls lie)',numbered([cell('skull_a'),cell('skull_b'),cell('skull_c')])),
       ('Bones (1 by hand; 2 and 3 PixelLab\'s, recoloured)',numbered([cell('bones_h'),cell('bones_p22'),cell('bones_p9')])),
       ('Chalk circles (1 white chalk; 2 old red, as painted)',numbered([cell('chalk_w'),cell('chalk_r')])),
       ('Bone chips in the aisle (both used)',numbered([cell('chips_a',dark=True),cell('chips_b',dark=True)])),
       ('The lamp\'s dais (the Cistern\'s, recoloured; 2 ringed with skulls)',numbered([cell('dais_r',128,3),cell('dais_s',128,3)])),
       ('The rift (the Cistern\'s, recoloured)',[cell('rift_r',128,3)])],820,'ossuary-4-props.png')
