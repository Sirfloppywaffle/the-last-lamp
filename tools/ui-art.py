#!/usr/bin/env python3
"""The descent's pixel-art UI (the HUD's icons, the landing's frame and door icons) from PixelLab PNGs into index.html.

    python3 tools/ui-art.py            # rewrite the block between the ui-art markers in index.html
    python3 tools/ui-art.py --check    # exit 1 if the block in index.html is not what the sources make

Sources live in art/ui/: one folder per icon (base.png, the still PixelLab drew, and f000.png … the frames of its
animation, when it has one; rt-<rite> for each rite), plus frame.png (the landing's iron frame), pieces.png (the stone card,
the glass tube, the round badge and the plaque, on one sheet) and slots.png (the build tray's slots and the rites' tablets,
drawn three times too big and brought down by third()). Dice are drawn here, pip by pip, so a face never shows the wrong count.

What it writes, all CSS (the game's own rules for these classes sit by the HUD and modal rules, not in this block):
  .ui-ic-<name>   background-image: a strip of frames side by side, --uf the count. An animated icon also gets its own
                  @keyframes and animation (steps, so a frame is a frame); a still one is a single frame.
  --ui-<piece>    custom properties on :root, a url() each, for border-image (frame, card, tube, slot, tablet) and background
                  (badge, plaque).
Every PNG is written indexed (a palette and tRNS), which is what keeps this small. Standard library only.
"""
import os, struct, sys, zlib, base64, importlib.util

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'art', 'ui')
HTML = os.path.join(ROOT, 'index.html')
BEGIN = '/* ui-art: begin (written by tools/ui-art.py from art/ui/; change the tool or the art, never this block) */'
END = '/* ui-art: end */'

_spec = importlib.util.spec_from_file_location('png2rows', os.path.join(ROOT, 'tools', 'png2rows.py'))
_p2r = importlib.util.module_from_spec(_spec); _spec.loader.exec_module(_p2r)
read_png = _p2r.read_png

# name: (how it moves, ms a frame, ms held on the still before it moves). 'still' never moves; 'loop' plays its frames round
# and round (a flame); 'swing' plays them there and back (a light that fades, so the loop never jumps); 'now' holds the
# still and then plays its frames once (a blink, a glance), every hold + frames.
ICONS = {
    # the HUD
    'oil': ('loop', 120, 0), 'ess': ('loop', 110, 0),
    'mad0': ('now', 110, 4200), 'mad1': ('now', 80, 2600), 'mad2': ('now', 70, 1900), 'mad3': ('loop', 90, 0),
    # the landing's doors (ROOMS) and what rides on them
    'merchant': ('still', 0, 0), 'event': ('swing', 140, 0), 'shrine': ('swing', 150, 0), 'rest': ('loop', 130, 0),
    'reliquary': ('still', 0, 0), 'deep': ('loop', 150, 0), 'bones': ('still', 0, 0), 'cage': ('loop', 150, 0),
    'trial': ('loop', 150, 0), 'omen': ('still', 0, 0), 'descent': ('loop', 150, 0),
    # what a card offers
    'relic': ('still', 0, 0), 'ward': ('still', 0, 0), 'rite': ('loop', 110, 0), 'binding': ('loop', 140, 0),
    'patron': ('now', 120, 2400), 'vial': ('still', 0, 0), 'chalice': ('still', 0, 0), 'satchel': ('still', 0, 0),
    'lock': ('still', 0, 0), 'bonebag': ('still', 0, 0), 'coin': ('still', 0, 0), 'vortex': ('still', 0, 0),
    # the boss bar
    'skull': ('still', 0, 0),
    # the rites (RITES): each moves only while it is ready (the game's CSS holds a cooling one on its first frame)
    'rt-flare': ('loop', 110, 0), 'rt-pillar': ('loop', 140, 0), 'rt-bell': ('still', 0, 0), 'rt-wisp': ('loop', 120, 0),
    'rt-name': ('swing', 180, 0), 'rt-kindle': ('loop', 100, 0), 'rt-anchor': ('loop', 90, 0), 'rt-overload': ('loop', 90, 0),
    'rt-haul': ('loop', 160, 0), 'rt-raise': ('loop', 150, 0), 'rt-unbind': ('still', 0, 0), 'rt-toll': ('loop', 110, 0),
    'rt-greatbell': ('loop', 150, 0), 'rt-ebb': ('loop', 130, 0), 'rt-feed': ('loop', 140, 0),
}
# the bone faces, 16 by 16, drawn below
DICE = 6


def frames_of(name):
    d = os.path.join(SRC, name)
    fs = sorted(f for f in os.listdir(d) if f.startswith('f') and f.endswith('.png'))
    return read_png(os.path.join(d, 'base.png')), [read_png(os.path.join(d, f)) for f in fs]


def clear_alpha(g):
    """PixelLab's edges carry a few half-clear pixels: at 128 or more a pixel is there, below it is not (as png2rows)."""
    return [[(p[0], p[1], p[2], 255) if p[3] >= 128 else (0, 0, 0, 0) for p in row] for row in g]


def strip(gs):
    h = len(gs[0]); return [sum((g[y] for g in gs), []) for y in range(h)]


def png_indexed(g):
    """rows of RGBA tuples to an indexed PNG (colour type 3) with a tRNS for the clear one; falls back to RGBA past 256 colours"""
    h, w = len(g), len(g[0])
    cols = {}
    for row in g:
        for p in row:
            if p not in cols: cols[p] = len(cols)
    def chunk(kind, body):
        c = struct.pack('>I', len(body)) + kind + body
        return c + struct.pack('>I', zlib.crc32(kind + body) & 0xffffffff)
    if len(cols) <= 256:
        order = sorted(cols, key=lambda p: p[3])  # clear first, so tRNS stays short
        ix = {p: i for i, p in enumerate(order)}
        raw = b''.join(b'\0' + bytes(ix[p] for p in row) for row in g)
        plte = b''.join(bytes(p[:3]) for p in order)
        trns = bytes(p[3] for p in order if p[3] < 255)
        body = chunk(b'IHDR', struct.pack('>IIBBBBB', w, h, 8, 3, 0, 0, 0)) + chunk(b'PLTE', plte)
        if trns: body += chunk(b'tRNS', trns)
    else:
        raw = b''.join(b'\0' + bytes(c for p in row for c in p) for row in g)
        body = chunk(b'IHDR', struct.pack('>IIBBBBB', w, h, 8, 6, 0, 0, 0))
    return b'\x89PNG\r\n\x1a\n' + body + chunk(b'IDAT', zlib.compress(raw, 9)) + chunk(b'IEND', b'')


def uri(g):
    return 'url(data:image/png;base64,' + base64.b64encode(png_indexed(g)).decode() + ')'


def crop(g, x0, y0, x1, y1):
    return [row[x0:x1] for row in g[y0:y1]]


def flatten(g, stop, col):
    """the frame's inside: PixelLab smudged it, and a smudge tiled across a big box repeats. Everything reachable from the middle
    without crossing the trim (stop) becomes one flat colour, except the ring of pixels against the trim, its inner shadow"""
    h, w = len(g), len(g[0]); g = [row[:] for row in g]
    seen, todo = set(), [(w // 2, h // 2)]
    while todo:
        x, y = todo.pop()
        if (x, y) in seen or not (0 <= x < w and 0 <= y < h) or g[y][x][:3] in stop: continue
        seen.add((x, y)); todo += [(x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)]
    for (x, y) in seen:
        if not any(g[y + dy][x + dx][:3] in stop for dx in (-1, 0, 1) for dy in (-1, 0, 1) if 0 <= x + dx < w and 0 <= y + dy < h):
            g[y][x] = col
    return g


def third(g, k=3):
    """a piece drawn large, made small: each k by k block becomes the colour most of it is (a clear block stays clear), so the
    small piece keeps the big one's palette and its edges stay hard. A thin line (the near-black outline, a rivet, a rune) is
    a minority in its block, so a colour that dark or that bright wins its block from two pixels of nine: the lines stay lines"""
    lum = lambda p: .3 * p[0] + .59 * p[1] + .11 * p[2]
    sat = lambda p: max(p[:3]) - min(p[:3])
    h, w = len(g) // k, len(g[0]) // k
    out = []
    for y in range(h):
        row = []
        for x in range(w):
            n = {}
            for j in range(k):
                for i in range(k):
                    p = g[y * k + j][x * k + i]; n[p] = n.get(p, 0) + 1
            line = [p for p in n if p[3] and n[p] >= 2 and (lum(p) < 16 or sat(p) > 70)]
            row.append(max(line, key=lambda p: (sat(p), n[p])) if line else max(n, key=lambda p: (n[p], p[3])))
        out.append(row)
    return out


def die(n):
    """a knucklebone's face, 16 by 16: bone with a shaded lower edge, a near-black outline and n dark pips"""
    O, B, S, H, P = (8, 9, 10, 255), (228, 221, 204, 255), (184, 174, 152, 255), (255, 247, 230, 255), (43, 31, 26, 255)
    C = (0, 0, 0, 0)
    g = [[C] * 16 for _ in range(16)]
    for y in range(1, 15):
        for x in range(1, 15):
            corner = (x in (1, 14)) and (y in (1, 14))
            if corner: continue
            edge = x in (1, 14) or y in (1, 14) or ((x in (2, 13)) and (y in (2, 13)))
            g[y][x] = O if edge else (S if (y >= 12 or x >= 12) else B)
    for x in range(3, 11): g[2][x] = H
    for y in range(3, 10): g[y][2] = H
    spots = {1: [(7, 7)], 2: [(4, 4), (10, 10)], 3: [(4, 4), (7, 7), (10, 10)], 4: [(4, 4), (10, 4), (4, 10), (10, 10)],
             5: [(4, 4), (10, 4), (7, 7), (4, 10), (10, 10)], 6: [(4, 4), (10, 4), (4, 7), (10, 7), (4, 10), (10, 10)]}[n]
    for (x, y) in spots:
        for dy in (0, 1):
            for dx in (0, 1): g[y + dy][x + dx] = P
    return g


def keyframes(name, n, mode, ms, hold):
    """steps that hold each frame for its time; 'now' holds frame 0 for hold ms first"""
    if mode == 'loop':
        seq, total = [(i, ms) for i in range(n)], n * ms
    elif mode == 'swing':
        seq = [(i, ms) for i in range(n)] + [(i, ms) for i in range(n - 2, 0, -1)]
        total = len(seq) * ms
    else:
        seq = [(0, hold)] + [(i, ms) for i in range(1, n)] + [(0, 0)]
        total = hold + (n - 1) * ms
    out, t = [], 0
    for i, d in seq:
        pos = 0 if n == 1 else i * 100 / (n - 1)
        out.append('%s{background-position-x:%s%%}' % (('%.2f%%' % (t * 100 / total)) if t < total else '100%', ('%.4f' % pos).rstrip('0').rstrip('.')))
        t += d
    return '@keyframes ui-%s{%s}' % (name, ''.join(out)), total


def build():
    css = [BEGIN]
    root = []
    # the landing's frame: iron with brass trim and two candle finials on its top corners
    fr = flatten(clear_alpha(read_png(os.path.join(SRC, 'frame.png'))), {(58, 36, 16), (154, 100, 36), (237, 180, 90)}, (27, 33, 36, 255))
    root.append('--ui-frame:' + uri(crop(fr, 22, 28, 236, 210)))        # slices 44 26 22 26: the candles stand in the top 18
    root.append('--ui-frame-low:' + uri(crop(fr, 22, 46, 236, 210)))    # short screens: the same without the candles, 26 26 22 26
    pc = clear_alpha(read_png(os.path.join(SRC, 'pieces.png')))
    root.append('--ui-card:' + uri(crop(pc, 14, 8, 242, 112)))
    root.append('--ui-tube:' + uri(crop(pc, 14, 123, 242, 157)))
    root.append('--ui-badge:' + uri(crop(pc, 13, 171, 79, 240)))
    root.append('--ui-plaque:' + uri(crop(pc, 95, 171, 244, 240)))
    # the build tray's slots (stone; brass for the one you hold; violet runes for a horror) and the rites' stone tablets (the
    # teal-runed one is a rite waiting for its target), drawn at three times the size they are shown and brought down here
    sl = clear_alpha(read_png(os.path.join(SRC, 'slots.png')))
    for name, box in (('slot', (23, 23, 161, 167)), ('slot-on', (192, 24, 321, 168)), ('slot-h', (354, 24, 489, 168)),
                      ('tablet', (24, 220, 246, 319)), ('tablet-on', (268, 220, 490, 319))):
        root.append('--ui-%s:%s' % (name, uri(third(crop(sl, *box)))))
    css.append(':root{' + ';'.join(root) + '}')
    for name, (mode, ms, hold) in ICONS.items():
        base, fs = frames_of(name)
        if mode == 'still' or not fs:
            gs = [base]
        elif mode in ('loop', 'swing'):
            gs = fs
        else:
            gs = [base] + fs
        gs = [clear_alpha(g) for g in gs]
        n = len(gs)
        rule = '.ui-ic-%s{background-image:%s;--uf:%d' % (name, uri(strip(gs)), n)
        if n > 1:
            kf, total = keyframes(name, n, mode, ms, hold)
            css.append(kf)
            rule += ';animation:ui-%s %dms step-end infinite' % (name, total)
        css.append(rule + '}')
    for k in range(1, DICE + 1):
        css.append('.ui-ic-die%d{background-image:%s;--uf:1}' % (k, uri(die(k))))
    css.append(END)
    return '\n'.join(css)


def main():
    src = open(HTML, encoding='utf8').read()
    i, j = src.find(BEGIN), src.find(END)
    if i < 0 or j < 0:
        sys.exit('index.html: the ui-art markers are missing (put "%s" and "%s" inside the <style>)' % (BEGIN, END))
    block = build()
    if '--check' in sys.argv:
        ok = src[i:j + len(END)] == block
        print('ui-art: ' + ('up to date' if ok else 'out of date, run python3 tools/ui-art.py'))
        sys.exit(0 if ok else 1)
    out = src[:i] + block + src[j + len(END):]
    open(HTML, 'w', encoding='utf8').write(out)
    print('ui-art: %d bytes written' % len(block))


if __name__ == '__main__':
    main()
