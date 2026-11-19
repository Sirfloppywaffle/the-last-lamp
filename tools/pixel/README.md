# tools/pixel

Tools for the pixel stair (`expansion/PIXEL_RUNBOOK.md`), kept so each step doesn't rebuild them. The Python needs numpy and Pillow. `shots.js` needs Playwright, as the tests do; run it from the repo. Work in a scratch folder: only the finished PNGs go into `index.html`, as data URIs (`pack.py uri`).

- `px.py`: the drawing kit. Masks (ellipse, capsule), dome shading from a mask's own distance field, banded onto a colour ramp, a selective outline, single pixels for details.
- `ossuary_props.py`: step 7's props, drawn with `px.py` (skulls, bones, chalk circles, bone chips) or recoloured (6c's spare bones, the Cistern's dais and rift). An example to copy for the next floor.
- `floor.py`: a floor from one PixelLab Wang set. `fetch` gets the sheet and builds the `PIX_AT` row. `grade` moves the palette darker or warmer and paints out a feature that would repeat every square. `slabs` lays one slab a square under the sheet, for a set whose slab grid misses the board's squares.
- `pack.py`: `extract` takes an image out of `PIX_SRC`, `sheet` and `atlas` make palette PNGs and the atlas's rects for `PIX_FLOOR`, and `uri` makes the data URI.
- `shots.js`: candidate art laid by the game itself on each of a floor's maps, lit and in the dark, with wards and creatures. Use it for the contact sheets, before anything goes into `index.html`.

Step 7's floor, start to finish:

```bash
python3 tools/pixel/floor.py fetch cd2895e0-dfa2-4c17-b82f-76e3f47c54e8 $W
python3 tools/pixel/floor.py grade $W --k .5 --o 8 --hue 34 --pull .6 --patch 30,14,40,24,-12 40,36,53,50,14
python3 tools/pixel/floor.py slabs $W --roll -30,-41 --bands N=2,S=1,W=8,E=2
python3 tools/pixel/pack.py extract index.html props.cistern $W/cistern-atlas.png
python3 tools/pixel/ossuary_props.py $W --spare <6c's props> --cistern-atlas $W/cistern-atlas.png
python3 tools/pixel/pack.py sheet $W/cut.png $W/tiles.png
python3 tools/pixel/pack.py atlas $W/spec.json $W/pk
node tools/pixel/shots.js $W/shots $W/cand.json
```

`$W` is a scratch folder. 6c's spare props (`bones22.png`, `bones9.png`) are on the orphan branch `claude/shots-cistern-detail`. `spec.json` and `cand.json` are described at the top of `pack.py` and `shots.js`.
