# three single skulls for the Ossuary's floor (the painted floor's kind 0), drawn pixel by pixel with the kit
import sys, numpy as np
sys.path.insert(0,'.')
from px import *
RAMP=['#4a3b2d','#7a6650','#a8937a','#cdbb9e','#ebdfc6']; OUT='#1a130e'; OUTL='#3b2e22'; HOLE='#0e0a08'; GRIME='#5f4e3d'; DEEP='#3a2c20'
def draw(cv,m,flat=1.8,bias=0,ramp=RAMP):
    paint(cv,shade(m,ramp,flat=flat,bias=bias),ramp); outline(cv,m,OUT,OUTL)
def sockets(cv,XX,YY,pts,ry=2.0):
    for cx,cy,rx in pts:
        s=ellipse(cv.w,cv.h,cx,cy,rx,ry); cv.put(s,HOLE)
        low=s&~np.pad(s,1)[2:,1:-1]; cv.put(low&(XX+.5>=cx),DEEP)
def skull_front(name,W=28,H=26,jaw=False,crack=True,candle=False):
    """a skull seen from the front and a little above, no lower jaw: the crown, the cheekbones, two sockets, the nose, the upper teeth"""
    cv=Canvas(W,H); YY,XX=grid(W,H); cx=W/2
    top=4 if candle else 1
    m=ellipse(W,H,cx,top+8.2,8.6,7.6)|ellipse(W,H,cx,top+13.6,6.6,4.8)|ellipse(W,H,cx,top+11.4,8.0,5.0)
    if jaw: m|=ellipse(W,H,cx,top+17.6,5.2,2.6)
    draw(cv,m,flat=3.2,bias=.05)
    sockets(cv,XX,YY,[(cx-3.3,top+11.6,2.3),(cx+3.3,top+11.6,2.3)])
    cv.px(int(cx-5),top+9,RAMP[4]); cv.px(int(cx-4),top+9,RAMP[4]); cv.px(int(cx+2),top+9,RAMP[3])
    for (x,y) in ((0,14),(-1,15),(0,15),(0,16)): cv.px(int(cx)+x,top+y,HOLE)
    cv.px(int(cx)+1,top+15,RAMP[0])
    ty=top+17
    for i,x in enumerate(range(int(cx)-4,int(cx)+4)):
        if i in (2,): cv.px(x,ty,HOLE); continue
        cv.px(x,ty,RAMP[4] if i%2 else RAMP[3]); cv.px(x,ty+1,RAMP[2] if i%2 else RAMP[1])
    for x in range(int(cx)-4,int(cx)+4): cv.px(x,ty+2,OUT)
    if crack:
        for (x,y) in ((2,2),(3,3),(3,4),(4,5),(4,6)): cv.px(int(cx)+x,top+y,GRIME)
    for (x,y) in ((-7,11),(7,12),(-2,5)): cv.px(int(cx)+x,top+y,GRIME)
    if candle:
        # a burnt-out candle stub stuck on the crown with wax run down over it
        st=(XX>=cx-2)&(XX<cx+2)&(YY>=0)&(YY<top+2); wax=['#6d6250','#a89c84','#d8ccb0','#efe6d0']
        paint(cv,shade(st,wax,flat=1.2),wax); outline(cv,st,OUT,OUTL)
        for (x,y) in ((-1,top+2),(-1,top+3),(1,top+2),(-3,top+3),(-3,top+4),(2,top+3)): cv.px(int(cx)+x,y,'#d8ccb0')
        cv.px(int(cx)-1,0,'#14100c'); cv.px(int(cx),0,'#14100c')   # the wick, burnt black
    cv.save(name); return cv
def skull_side(name,W=30,H=24):
    """a skull fallen on its side, turned to the right: the long crown, one socket, the cheek, the nose's edge, the teeth in profile"""
    cv=Canvas(W,H); YY,XX=grid(W,H)
    m=ellipse(W,H,13.5,10.5,10.2,7.6)|ellipse(W,H,20.8,13.6,6.4,5.6)|ellipse(W,H,24.2,15.8,3.2,3.4)
    m&=~((XX>26.5)&(YY<11))
    draw(cv,m,flat=3.0,bias=.05)
    sockets(cv,XX,YY,[(21.2,12.4,2.4)],ry=2.2)
    for (x,y) in ((26,14),(26,15),(27,15)): cv.px(x,y,HOLE)
    for i,x in enumerate(range(21,27)):
        cv.px(x,19,RAMP[4] if i%2 else RAMP[3]); cv.px(x,20,OUT)
    cv.px(23,19,HOLE)
    # the suture across the crown and the ear's hole
    for (x,y) in ((8,5),(9,6),(10,6),(11,7),(12,7),(13,8)): cv.px(x,y,GRIME)
    for (x,y) in ((12,13),(13,13),(12,14)): cv.px(x,y,DEEP)
    cv.save(name); return cv
skull_front('skull_a.png')
skull_side('skull_b.png')
skull_front('skull_c.png',H=29,candle=True,crack=False)
print('ok')
