#!/usr/bin/env python3
"""PNG to tRows() rows, for Saltmouth's pixel art (EXPANSION4_RUNBOOK.md §3).

    python3 tools/png2rows.py chair.png                                     # one array of rows
    python3 tools/png2rows.py --width 16 --name 0 south.png --name 2 west.png  # an object keyed by --name
One --width (or --height) a run: it applies to every file in it, so straight facings and diagonals are two runs.

What it does, in order, to every PNG (8-bit, not interlaced; what PixelLab exports):
  1. Alpha: a pixel at alpha 128 or more is fully there, anything less is clear. No semi-transparent pixel survives, and the
     count of ones it had to decide is reported.
  2. Crops to what is opaque (--no-crop keeps the canvas).
  3. --width / --height: narrows the art to fit its footprint by taking out the interior columns (rows) most like their
     neighbour, one at a time, so outlines and edges stay whole. Look at the result: hand-touch it if a seam shows.
  4. Every colour snaps to the nearest letter in PX, read from index.html so it never drifts from the game. A colour with no
     letter within --max (RGB distance, default 28) gets a new lowercase letter, reported as NEW so the PR can say so and the
     letter can be added to PX. --pal o=#755941 gives such a letter up front, so later runs agree.
Prints JavaScript (an array of strings per file, or an object keyed by --name) to stdout; the report goes to stderr.
Standard library only.
"""
import argparse, os, re, struct, sys, zlib

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FREE = 'opwxz'  # lowercase letters PX does not use yet; uppercase belong to each Keeper's own palette


def read_png(path):
    with open(path, 'rb') as f:
        data = f.read()
    if data[:8] != b'\x89PNG\r\n\x1a\n':
        sys.exit(path + ': not a PNG')
    pos, idat, plte, trns = 8, b'', None, None
    while pos < len(data):
        n, kind = struct.unpack('>I4s', data[pos:pos + 8])
        body = data[pos + 8:pos + 8 + n]
        pos += 12 + n
        if kind == b'IHDR':
            w, h, depth, ctype, _, _, inter = struct.unpack('>IIBBBBB', body)
        elif kind == b'PLTE':
            plte = [tuple(body[i:i + 3]) for i in range(0, len(body), 3)]
        elif kind == b'tRNS':
            trns = body
        elif kind == b'IDAT':
            idat += body
        elif kind == b'IEND':
            break
    if depth != 8 or inter:
        sys.exit(path + ': only 8-bit, non-interlaced PNGs (got depth %d, interlace %d)' % (depth, inter))
    bpp = {0: 1, 2: 3, 3: 1, 4: 2, 6: 4}[ctype]
    raw, stride, out, prev = zlib.decompress(idat), w * bpp, [], bytearray(w * bpp)
    for y in range(h):
        ft, line = raw[y * (stride + 1)], bytearray(raw[y * (stride + 1) + 1:(y + 1) * (stride + 1)])
        for i in range(stride):
            a = line[i - bpp] if i >= bpp else 0
            b, c = prev[i], prev[i - bpp] if i >= bpp else 0
            if ft == 1: line[i] = (line[i] + a) & 255
            elif ft == 2: line[i] = (line[i] + b) & 255
            elif ft == 3: line[i] = (line[i] + (a + b) // 2) & 255
            elif ft == 4:
                p = a + b - c
                pa, pb, pc = abs(p - a), abs(p - b), abs(p - c)
                line[i] = (line[i] + (a if pa <= pb and pa <= pc else b if pb <= pc else c)) & 255
        row = []
        for x in range(w):
            px = line[x * bpp:(x + 1) * bpp]
            if ctype == 6: row.append(tuple(px))
            elif ctype == 2: row.append(tuple(px) + (255,))
            elif ctype == 0: row.append((px[0],) * 3 + (255,))
            elif ctype == 4: row.append((px[0],) * 3 + (px[1],))
            else: row.append(plte[px[0]] + ((trns[px[0]] if trns and px[0] < len(trns) else 255),))
        out.append(row)
        prev = line
    return out


def game_palette():
    src = open(os.path.join(ROOT, 'index.html'), encoding='utf8').read()
    m = re.search(r'const PX=\{(.*?)\};', src, re.S)
    if not m:
        sys.exit('index.html: could not find const PX={...}')
    return {k: hexrgb(v) for k, v in re.findall(r"'?([0-9a-zA-Z])'?:'(#[0-9a-fA-F]{6})'", m.group(1))}


def hexrgb(h):
    return tuple(int(h[i:i + 2], 16) for i in (1, 3, 5))


def dist(a, b):
    return sum((x - y) ** 2 for x, y in zip(a, b)) ** .5


def crop(g):
    on = [(x, y) for y, r in enumerate(g) for x, p in enumerate(r) if p]
    if not on:
        return [[None]]
    x0, x1 = min(x for x, _ in on), max(x for x, _ in on)
    y0, y1 = min(y for _, y in on), max(y for _, y in on)
    return [r[x0:x1 + 1] for r in g[y0:y1 + 1]]


def narrow(g, w):
    """take out interior columns, the one most like its left neighbour first (ties: nearest the middle)"""
    while len(g[0]) > w and len(g[0]) > 4:
        n, mid = len(g[0]), (len(g[0]) - 1) / 2
        best = min(range(2, n - 2), key=lambda i: (sum(r[i] != r[i - 1] for r in g), abs(i - mid)))
        g = [r[:best] + r[best + 1:] for r in g]
    return g


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('files', nargs='*')
    ap.add_argument('--name', action='append', default=[], help='a key for the next file (repeat; makes an object)')
    ap.add_argument('--width', type=int, help='narrow to at most this many pixels')
    ap.add_argument('--height', type=int, help='shorten to at most this many pixels')
    ap.add_argument('--max', type=float, default=28, help='largest RGB distance that still counts as close (default 28)')
    ap.add_argument('--pal', action='append', default=[], help='an extra letter, e.g. o=#755941')
    ap.add_argument('--no-crop', action='store_true')
    a, files, names = ap.parse_known_args()[0], [], []
    # --name applies to the file after it
    argv, pend = sys.argv[1:], None
    for i, s in enumerate(argv):
        if s == '--name': pend = argv[i + 1]
        elif s.lower().endswith('.png') and (i == 0 or argv[i - 1] not in ('--name', '--pal', '--width', '--height', '--max')):
            files.append(s); names.append(pend); pend = None
    if not files:
        ap.print_help(); return
    PX = game_palette()
    extra = {}
    for s in a.pal:
        k, v = s.split('=')
        extra[k] = hexrgb(v)
    letters, new, semi, used, blocks = {}, {}, 0, {}, []
    pool = [c for c in FREE if c not in PX and c not in extra]
    for path, nm in zip(files, names):
        g = read_png(path)
        for r in g:
            for p in r:
                if 0 < p[3] < 255: semi += 1
        g = [[p[:3] if p[3] >= 128 else None for p in r] for r in g]
        if not a.no_crop: g = crop(g)
        size0 = (len(g[0]), len(g))
        if a.width: g = narrow(g, a.width)
        if a.height:
            t = narrow([list(c) for c in zip(*g)], a.height)
            g = [list(r) for r in zip(*t)]
        rows = []
        for r in g:
            s = ''
            for p in r:
                if p is None:
                    s += '.'; continue
                if p not in letters:
                    k, d = min(((k, dist(p, v)) for k, v in {**PX, **extra}.items()), key=lambda kv: kv[1])
                    if d > a.max and k not in extra:
                        if not pool: sys.exit('no free letter left for %s' % ('#%02x%02x%02x' % p))
                        near = (k, d)
                        k = pool.pop(0); extra[k] = p; new[k] = (p, near)
                    letters[p] = k
                k = letters[p]; used[k] = used.get(k, 0) + 1; s += k
            rows.append(s)
        blocks.append((nm or os.path.splitext(os.path.basename(path))[0], rows))
        print('%s: %dx%d -> %dx%d' % (path, size0[0], size0[1], len(rows[0]), len(rows)), file=sys.stderr)
    print('semi-transparent pixels decided: %d' % semi, file=sys.stderr)
    for p, k in sorted(letters.items(), key=lambda kv: kv[1]):
        src = PX.get(k) or extra[k]
        print("  #%02x%02x%02x -> '%s' (#%02x%02x%02x, distance %d)" % (p + (k,) + src + (round(dist(p, src)),)), file=sys.stderr)
    for k, (p, near) in new.items():
        print("NEW letter '%s': '#%02x%02x%02x' (nearest PX '%s' at %d). Add it to PX and say so in the PR." % ((k,) + p + (near[0], round(near[1]))), file=sys.stderr)
    js = lambda rows: '[' + ','.join("'%s'" % r for r in rows) + ']'
    if len(blocks) == 1 and not names[0]:
        print(js(blocks[0][1]))
    else:
        print('{\n' + ',\n'.join('  %s:%s' % (k if re.match(r'^[A-Za-z_]\w*$|^\d+$', k) else "'%s'" % k, js(r)) for k, r in blocks) + '}')


if __name__ == '__main__':
    main()
