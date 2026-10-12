"""Derive the claude.ai artifact body from index.html (the artifact host adds its own <html>/<head>/<body>).
Usage: python3 tools/build-artifact.py [out]   (default: tests/.build/artifact.html)"""
import re, sys, os
root=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
s=open(os.path.join(root,'index.html'),encoding='utf-8').read()
for pat in [r'^\s*<!doctype html>\s*', r'^\s*<html[^>]*>\s*', r'^\s*<head>\s*', r'^\s*<meta charset="utf-8">\s*', r'^\s*<meta name="viewport"[^>]*>\s*']:
    s=re.sub(pat,'',s,count=1,flags=re.I)
s=s.replace('\n</head>\n<body>\n','',1)
s=re.sub(r'\n</body>\n</html>\n?$','',s)
out=sys.argv[1] if len(sys.argv)>1 else os.path.join(root,'tests','.build','artifact.html')
os.makedirs(os.path.dirname(out),exist_ok=True)
open(out,'w',encoding='utf-8').write(s)
print('wrote',out,len(s),'chars')
