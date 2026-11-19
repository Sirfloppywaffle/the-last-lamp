# the second dais: the recoloured rune dais with ten small skulls set round its rim (the painted dais has ten marks round it)
import sys, math, numpy as np
sys.path.insert(0,'.')
from px import *
from PIL import Image
R=['#3a2f24','#62533f','#8d7c62','#b4a283','#d8c9a6']; OUT='#17110c'; HOLE='#0d0907'
def mini():
    cv=Canvas(7,7); m=ellipse(7,7,3.5,2.9,3.1,2.6)|((grid(7,7)[1]>=2)&(grid(7,7)[1]<5)&(grid(7,7)[0]>=4)&(grid(7,7)[0]<6))
    paint(cv,shade(m,R,flat=1.6,bias=.08),R); outline(cv,m,OUT)
    for x,y in ((2,3),(4,3)): cv.px(x,y,HOLE)
    cv.px(3,5,R[4]); cv.px(2,5,R[3]); cv.px(4,5,R[3])
    return Image.fromarray(cv.rgba)
d=Image.open('o_dais_r.png').convert('RGBA'); sk=mini()
c=(48,48); r=40.5
for k in range(10):
    a=-math.pi/2+k*2*math.pi/10; x=c[0]+r*math.cos(a); y=c[1]+r*math.sin(a)*.98
    d.alpha_composite(sk,(int(round(x-sk.width/2)),int(round(y-sk.height/2))))
d.save('o_dais_s.png'); print('ok')
