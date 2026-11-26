# tools/pixel

Tools for the pixel stair (`expansion/PIXEL_RUNBOOK.md`), kept so each step doesn't rebuild them. The Python needs numpy and Pillow. `shots.js` needs Playwright, as the tests do; run it from the repo. Work in a scratch folder: only the finished PNGs go into `index.html`, as data URIs (`pack.py uri`).

- `px.py`: the drawing kit. Masks (ellipse, capsule), dome shading from a mask's own distance field, banded onto a colour ramp, a selective outline, single pixels for details.
- `bones.py`: bone stamps on top of `px.py`: skulls from the front, 7 to 13 px wide; long bones at any angle; crossed bones. Each piece gets its own outline, so they pack tight into patterns.
- `ossuary_floor.py`: the Ossuary's floor (Criss's pick, 26 Nov 2026: Sedlec's chapel with borders). The set graded for contrast; the three-colour hex floor; pyramids of skulls; the borders of skulls and crossed bones along the aisles; the sunburst dais.
- `ossuary_props.py`: step 7's first props, drawn with `px.py` (skulls, bones, chalk circles, bone chips) or recoloured (6c's spare bones, the Cistern's dais and rift). The floor still uses its bone chips and recoloured rift.
- `floor.py`: a floor from one PixelLab Wang set. `fetch` gets the sheet and builds the `PIX_AT` row. `grade` moves the palette darker or warmer and paints out a feature that would repeat every square. `slabs` lays one slab a square under the sheet, for a set whose slab grid misses the board's squares.
- `pack.py`: `extract` takes an image out of `PIX_SRC`, `sheet` and `atlas` make palette PNGs and the atlas's rects for `PIX_FLOOR`, and `uri` makes the data URI.
- `shots.js`: candidate art laid by the game itself on each of a floor's maps, lit and in the dark, with wards and creatures. Use it for the contact sheets, before anything goes into `index.html`.

Step 7's floor, start to finish (each step reproduces what is in `index.html` exactly):

```bash
python3 tools/pixel/floor.py fetch cd2895e0-dfa2-4c17-b82f-76e3f47c54e8 $W
python3 tools/pixel/floor.py slabs $W --src sheet.png --roll -30,-41 --bands N=2,S=1,W=8,E=2
python3 tools/pixel/ossuary_floor.py $W
python3 tools/pixel/pack.py extract index.html props.cistern $W/cistern-atlas.png
python3 tools/pixel/ossuary_props.py $W --cistern-atlas $W/cistern-atlas.png
python3 tools/pixel/pack.py sheet $W/tiles.png $W/tiles_q.png
python3 tools/pixel/pack.py atlas $W/spec.json $W/pk
node tools/pixel/shots.js $W/shots $W/cand.json
```

`$W` is a scratch folder. `slabs` is run only for its cut: which pixels of the set the walls keep. The atlas's `spec.json` lists, in this order: `hex0.png` to `hex7.png` as `slab`, `pyr0.png` to `pyr2.png` as `col`, `friezeH.png`, `friezeV.png`, `dais.png`, `o_rift_r.png` as `rift`, and `o_chips_a.png` and `o_chips_b.png` as `chips`. `cand.json` is described at the top of `shots.js`. The first round's props used 6c's spare bones (`bones22.png`, `bones9.png`), which are on the orphan branch `claude/shots-cistern-detail`; pass them with `--spare`.
