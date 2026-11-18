# final.py: the three candidate floors with the same props, dais and rift -> ts/F<n>.cand.json
import json, sys
C6='/tmp/claude-0/-home-user-the-last-lamp/df56029d-169b-5d0a-a5c1-e51437e4f439/scratchpad/c6'
cand=json.loads(sys.argv[1]) if len(sys.argv)>1 else {'n':'cand','ids':[5,10,20,0,14]}
P=lambda n,ids:[f'{C6}/props/{n}{i}.png' for i in ids]
layers=[{'img':'grate','where':'floor','ring':True,'p':0.08,'salt':80,'flip':False},
        {'img':'bones','where':'floor','p':0.06,'salt':86,'jit':0.25,'rot':True},
        {'img':'chain','where':'floor','p':0.04,'salt':87,'jit':0.2,'rot':True},
        {'img':'cand','where':'floor','p':0.045,'salt':88,'jit':0.25}]
props={'grate':P('grate',[0,4,7,8]),'bones':P('bones',[13,16,22,3,10]),'chain':P('chain',[2,3,6,13,19,4]),'cand':P(cand['n'],cand['ids']),
       'dais':[f'{C6}/props/dais1.png'],'rift':[f'{C6}/props/riftc0.png']}
for k,src in [('1','D'),('2','DS1g'),('3','CDg')]:
    c=json.load(open(f'{C6}/ts/{src}.cand.json'))
    c['opts']=dict(c.get('opts',{}),layers=layers); c['imgs']=dict(c['imgs'],**props)
    json.dump(c,open(f'{C6}/ts/F{k}.cand.json','w'))
print('ok')
