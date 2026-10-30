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
  5. --outline X: the runbook's rule is an outline one shade darker than the fill, pure dark on characters only (§3.3), and
     PixelLab draws its edge in the palette's near-black. Every pixel of 0 or s that touches clear ground (or the canvas
     edge) becomes letter X (the piece's own darkest: 5 for wood, 1 or 2 for iron or stone); dark pixels inside stay.
Prints JavaScript (an array of strings per file, or an object keyed by --name) to stdout; the report goes to stderr.
--kit NAME snaps to a Keeper's own palette instead (art pass A2): the letters of TOWN_KITS[NAME].pal (or a rescued soul's art.pal),
read as tRows() reads them, plus 0 for the outline, which every pixel at the figure's edge becomes. No new letter is made (a Keeper's colours are fixed), so --max is ignored;
the report lists how far each colour moved.
--frames N cuts each PNG into N equal frames side by side (a strip), each converted as its own file and named <name>N; every frame
of a strip is cropped to the same box (the union of what any frame draws), and --width / --height take the same columns (rows) out
of every frame, so a walk never jitters.
--sheet out.png also writes a contact sheet of what it made: every file as converted (so on its PX colours, narrowed), numbered
from 1 in the order given, 4 times up on a dark ground, --cols to a row (default 6). That is how a batch of candidates is looked at
and chosen from, and how a piece is checked once it is converted.
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


def kit_palette(name):
    """a Keeper's letters (TOWN_KITS or TOWN_SOULS[...].art), then every PX letter the Keeper does not take over"""
    src = open(os.path.join(ROOT, 'index.html'), encoding='utf8').read()
    # a Keeper's pal opens its entry; a soul's sits in its art, after its texts: the first pal:{ before the next entry
    # (other tables have entries of the same name, ROSTER's and TOWN_FIG's: the first entry with a pal is the one)
    m = None
    for e in re.finditer(r"\n  %s:\{" % re.escape(name), src):
        end = re.compile(r"\n  [A-Za-z]\w*:\{").search(src, e.end())
        m = re.compile(r"(?<![A-Za-z])pal:\{(.*?)\}", re.S).search(src, e.end(), end.start() if end else len(src))
        if m:
            break
    if not m:
        sys.exit('index.html: no Keeper or soul called %s with a pal' % name)
    own = {k: hexrgb(v) for k, v in re.findall(r"'?([0-9a-zA-Z])'?:'(#[0-9a-fA-F]{6})'", m.group(1))}
    # a Keeper's colours stay on his own letters (ART_UPGRADE.md §2.2); the only shared one is the pure dark of the outline
    return own, {**own, '0': game_palette()['0']}


def split(g, n):
    w = len(g[0]) // n
    return [[r[i * w:(i + 1) * w] for r in g] for i in range(n)]


def box(gs):
    on = [(x, y) for g in gs for y, r in enumerate(g) for x, p in enumerate(r) if p]
    if not on:
        return gs
    x0, x1 = min(x for x, _ in on), max(x for x, _ in on)
    y0, y1 = min(y for _, y in on), max(y for _, y in on)
    return [[r[x0:x1 + 1] for r in g[y0:y1 + 1]] for g in gs]


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


DIGITS = {'0': '111101101101111', '1': '010110010010111', '2': '111001111100111', '3': '111001111001111', '4': '101101111001001',
          '5': '111100111001111', '6': '111100111101111', '7': '111001001001001', '8': '111101111101111', '9': '111101111001111'}


def write_png(path, w, h, px):
    """px: rows of (r, g, b) tuples; an 8-bit RGB PNG"""
    raw = b''.join(b'\0' + bytes(c for p in row for c in p) for row in px)
    def chunk(kind, body):
        c = struct.pack('>I', len(body)) + kind + body
        return c + struct.pack('>I', zlib.crc32(kind + body) & 0xffffffff)
    with open(path, 'wb') as f:
        f.write(b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', struct.pack('>IIBBBBB', w, h, 8, 2, 0, 0, 0)) + chunk(b'IDAT', zlib.compress(raw, 9)) + chunk(b'IEND', b''))


def contact_sheet(path, blocks, pal, cols, k=4, bg=(22, 26, 32)):
    """each block's rows painted on its PX colours, k times up, numbered from 1 in the corner of its cell"""
    label_w = 8 * len(str(len(blocks))) - 2  # a two-digit number must fit its cell
    cell_w = max(max(len(r[0]) for _, r in blocks) * k, label_w) + 8
    cell_h = max(len(r) for _, r in blocks) * k + 8 + 7 * 2
    cols = max(1, min(cols, len(blocks))); n_rows = (len(blocks) + cols - 1) // cols
    W, H = cols * cell_w, n_rows * cell_h
    img = [[bg] * W for _ in range(H)]
    for i, (_, rows) in enumerate(blocks):
        ox, oy = (i % cols) * cell_w + 4, (i // cols) * cell_h + 4 + 14
        for y, row in enumerate(rows):
            for x, ch in enumerate(row):
                if ch == '.': continue
                c = pal[ch]
                for dy in range(k):
                    for dx in range(k):
                        img[oy + y * k + dy][ox + x * k + dx] = c
        tx = ox
        for ch in str(i + 1):
            for j, bit in enumerate(DIGITS[ch]):
                if bit == '1':
                    for dy in range(2):
                        for dx in range(2): img[oy - 12 + (j // 3) * 2 + dy][tx + (j % 3) * 2 + dx] = (230, 220, 190)
            tx += 8
    write_png(path, W, H, img)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('files', nargs='*')
    ap.add_argument('--name', action='append', default=[], help='a key for the next file (repeat; makes an object)')
    ap.add_argument('--width', type=int, help='narrow to at most this many pixels')
    ap.add_argument('--height', type=int, help='shorten to at most this many pixels')
    ap.add_argument('--max', type=float, default=28, help='largest RGB distance that still counts as close (default 28)')
    ap.add_argument('--pal', action='append', default=[], help='an extra letter, e.g. o=#755941')
    ap.add_argument('--no-crop', action='store_true')
    ap.add_argument('--outline', help='the letter an edge pixel of 0 or s becomes (the piece\'s own darkest; see 5.)')
    ap.add_argument('--kit', help='snap to this Keeper\'s own palette (TOWN_KITS key or rescued soul)')
    ap.add_argument('--frames', type=int, default=1, help='each PNG is a strip of this many frames side by side')
    ap.add_argument('--sheet', help='also write a contact sheet of the converted art to this PNG (numbered, 4x)')
    ap.add_argument('--cols', type=int, default=6, help='cells a row on the sheet (default 6)')
    a, files, names = ap.parse_known_args()[0], [], []
    # --name applies to the file after it
    argv, pend = sys.argv[1:], None
    for i, s in enumerate(argv):
        if s == '--name': pend = argv[i + 1]
        elif s.lower().endswith('.png') and not s.startswith('-') and (i == 0 or argv[i - 1] not in ('--name', '--pal', '--width', '--height', '--max', '--sheet', '--cols', '--outline', '--kit', '--frames')):
            files.append(s); names.append(pend); pend = None
    if not files:
        ap.print_help(); return
    PX = game_palette()
    if a.kit:
        own, PX = kit_palette(a.kit)
        a.max = 1e9
    extra = {}
    for s in a.pal:
        k, v = s.split('=')
        extra[k] = hexrgb(v)
    letters, new, semi, used, blocks = {}, {}, 0, {}, []
    pool = [c for c in FREE if c not in PX and c not in extra]
    jobs = []
    for path, nm in zip(files, names):
        g = read_png(path)
        for r in g:
            for p in r:
                if 0 < p[3] < 255: semi += 1
        g = [[p[:3] if p[3] >= 128 else None for p in r] for r in g]
        if a.frames > 1:
            gs = split(g, a.frames)
            if not a.no_crop: gs = box(gs)
            # narrowed as one strip, so every frame loses the same columns (rows) and the figure never jitters between frames
            if a.width or a.height:
                w0, j = len(gs[0][0]), [sum((g[y] for g in gs), []) for y in range(len(gs[0]))]
                if a.height:
                    t = narrow([list(c) for c in zip(*j)], a.height)
                    j = [list(r) for r in zip(*t)]
                if a.width:
                    # the interior columns most like their neighbour across every frame at once
                    while w0 > a.width:
                        n, mid = w0, (w0 - 1) / 2
                        best = min(range(2, n - 2), key=lambda i: (sum(r[f * n + i] != r[f * n + i - 1] for r in j for f in range(len(gs))), abs(i - mid)))
                        j = [sum((r[f * n:f * n + best] + r[f * n + best + 1:(f + 1) * n] for f in range(len(gs))), []) for r in j]
                        w0 -= 1
                gs = [[r[f * w0:(f + 1) * w0] for r in j] for f in range(len(gs))]
            base = nm or os.path.splitext(os.path.basename(path))[0]
            jobs += [('%s[%d]' % (path, i), '%s%d' % (base, i), f) for i, f in enumerate(gs)]
        else:
            jobs.append((path, nm, crop(g) if not a.no_crop else g))
    names = [nm for _, nm, _ in jobs]
    for path, nm, g in jobs:
        size0 = (len(g[0]), len(g))
        if a.frames > 1: pass
        elif a.width: g = narrow(g, a.width)
        if a.frames > 1: pass
        elif a.height:
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
        if a.kit:
            # a character's outline is pure dark (runbook §3.3; tOutline() does it for the hand-made rows): every pixel at the edge of
            # the figure becomes 0, so what PixelLab drew in a shade of the coat or the hat at the rim still reads as outline
            n, m = len(rows), len(rows[0])
            clear = lambda x, y: x < 0 or y < 0 or x >= m or y >= n or rows[y][x] == '.'
            rows = [''.join('0' if ch != '.' and any(clear(x + dx, y + dy) for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1))) else ch
                            for x, ch in enumerate(r)) for y, r in enumerate(rows)]
        if a.outline:
            n, m = len(rows), len(rows[0])
            clear = lambda x, y: x < 0 or y < 0 or x >= m or y >= n or rows[y][x] == '.'
            rows = [''.join(a.outline if ch in '0s' and any(clear(x + dx, y + dy) for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1))) else ch
                            for x, ch in enumerate(r)) for y, r in enumerate(rows)]
        blocks.append((nm or os.path.splitext(os.path.basename(path))[0], rows))
        print('%s: %dx%d -> %dx%d' % (path, size0[0], size0[1], len(rows[0]), len(rows)), file=sys.stderr)
    print('semi-transparent pixels decided: %d' % semi, file=sys.stderr)
    for p, k in sorted(letters.items(), key=lambda kv: kv[1]):
        src = PX.get(k) or extra[k]
        print("  #%02x%02x%02x -> '%s' (#%02x%02x%02x, distance %d)" % (p + (k,) + src + (round(dist(p, src)),)), file=sys.stderr)
    for k, (p, near) in new.items():
        print("NEW letter '%s': '#%02x%02x%02x' (nearest PX '%s' at %d). Add it to PX and say so in the PR." % ((k,) + p + (near[0], round(near[1]))), file=sys.stderr)
    if a.sheet:
        contact_sheet(a.sheet, blocks, {**PX, **extra}, a.cols)
        print('contact sheet: %s (%d pieces, numbered from 1 in the order given)' % (a.sheet, len(blocks)), file=sys.stderr)
    js = lambda rows: '[' + ','.join("'%s'" % r for r in rows) + ']'
    if len(blocks) == 1 and not names[0]:
        print(js(blocks[0][1]))
    else:
        print('{\n' + ',\n'.join('  %s:%s' % (k if re.match(r'^[A-Za-z_]\w*$|^\d+$', k) else "'%s'" % k, js(r)) for k, r in blocks) + '}')


if __name__ == '__main__':
    main()
