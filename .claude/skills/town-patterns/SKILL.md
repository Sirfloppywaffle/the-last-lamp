---
name: town-patterns
description: How to add things to Saltmouth (the town in index.html) as the code stands after Expansion 4 step 4 - new pixel art (runbook §3), turning pieces, a tappable thing, the #townAct offer, keeping a tile clear, new ll-town and run fields, town tips, the Lodge's scene switch, its rooms and its catalogue (sets, wall mounts, small things, dyes), test hooks and the devices test. Use when building or changing anything in the town.
---

# Adding to Saltmouth

Background: runbook §3 (the step 2 code) and the Saltmouth row of `AGENTS.md` §5 (every name since). Rules: runbook §2. The code wins over all of these; search `index.html` for each name below before trusting it.

## Something tappable (a person, a door, a stone)

- [ ] **The tap:** a branch in `townTapTile(tx,ty)`, before the plain walk at the end. Already standing in front (`Math.hypot` < ~1.5)? Act at once. Otherwise set `TWN.goal` and `TWN.path=townPathTo(<tile in front>)`, set the marker (`TWN.mark`, `mx`, `my`) from the path's last point, and clear the goal if there is no path. The workshop, shrine and pool branches are the models.
- [ ] **The goal:** a string for one-of-a-kind things (`'frame'`, `'lodge'`), an object keyed by kind for many (`{shrine:k}`, `{pool:i}`, `{workshop:id}`).
- [ ] **Arrival:** a line at the end of `townStep(dt)`, beside the others: `if(TWN.goal&&TWN.goal.<kind>&&!TWN.path&&!R){…; TWN.goal=null; if(<still close>)<act>;}`.

## The `#townAct` offer

- [ ] `townNearAct()` returns your thing when it is nearest (add a distance test beside the others). Return a **stable** value (a string, or an object made once and kept in a table, like `POOL_ACT[i]`): `townStep()` compares it with `!==` every frame, and a fresh object would rewrite the button every frame.
- [ ] `townActLabel(n)`: the button's text for it.
- [ ] The `$('#townAct').addEventListener('click',…)` chain: what the button does. On `click` (rule 5).

## Keeping a tile clear

- [ ] Push the tile in front of the new door or station onto `TOWN_KEEP` (the `TOWN_KEEP.push` lines after it are per step). `townCanPlace()` then refuses a piece there or one that walls it off (`townReaches()`), and `townFix()` takes up and pays back any saved piece that does.
- [ ] Turning earth into building tiles in `TOWN_MAP`? Keep each row 24 long; `townFix()` already pays back what stood there.

## Saved state

- [ ] **`ll-town` fields:** a default in `townFix()`, validated from whatever is stored (a `…Fix()` helper per field, like `shrinesFix`, `lodgeFix`). Never rename or remove a field (rule 15). Read and write only through `townData()`/`townSave()` (rule 24). Add it to `AGENTS.md` §5's storage keys.
- [ ] **`run` fields:** a default for an old save in `resumeFrom()` (like `run.haul=haulFix(run.haul)`), or make every reader treat a missing field as the default (like `run.chore2`, `run.candleSeen`).
- [ ] **Per-visit state** goes on `TWN` and is reset in `townOpen()` (and in `lodgeEnter()`/`lodgeLeave()` if it is per scene). Never saved.

## Teaching it

- [ ] `TIPS.<key>={where:'town',when:()=>false,title,text}`.
- [ ] Show it once: either add `tipFresh('<key>')?'<key>'` to the chain in `townShowTip()`, or, for a tip about a thing you just opened, set `TWN.tipFor='<key>'; townShowTip();` (as `lodgeShelf()` and the pools do).

## The Lodge (step 9): the second scene

- [ ] `TWN.inside` is true inside. `townSolid()` asks `lodgeSolid()` there and `townSolidOut()` outside; use `townSolidOut` when you mean the square whatever the scene (`townFix()` does).
- [ ] `townTapTile()` hands over to `lodgeTapTile()`; `townNearAct()` returns only `'door'` or `'shelf'` inside; `townDraw()` draws `lodgeArt()` (rebuilt when its signature changes) with no rain.
- [ ] `lodgeEnter()`/`lodgeLeave()` reset the walk, the camera and `TWN.tipFor`; anything new per scene resets there too. `TWN.crowd` is empty inside.
- [ ] Room furniture: `LODGE_ITEMS`; kept clear: each room's `LODGE_ROOMS[m].keep` (the main room's is `LODGE_KEEP`); placing: `lodgeCanPlace()`/`lodgePlace()`.
- [ ] **Rooms (Expansion 4, step 3):** the Lodge is three rooms of 10×10, `LODGE_ROOMS` (main, cellar, attic). Inside, `lodgeCur()` is the room you stand in (`TWN.room`) and `lodgeRoom(T,m)` what is kept of one: never read `T.lodge.furn`/`.floor`/`.wall` directly, or you get the main room wherever you are. Anything checking the room's map passes the room when it runs outside a visit (`lodgeCh(x,y,m)`, `lodgeKeepOK(pieces,m)`, as `lodgeRoomFix()` does). A new way between rooms is a letter in the map, in `LODGE_SOLID` and in `LODGE_WAYS`, with its `at` tile in that room's `keep`. Anything new per room goes in `LODGE_ROOMS` and `lodgeArt()` (its signature names the room); `lodgeGo()` resets the visit as `lodgeEnter()` does.

## Build mode (Expansion 4, step 1): lift, storage, undo, Grid / Free

- [ ] A new kind of piece goes in `TOWN_DECOS` (square) or `LODGE_ITEMS` (`k:'furn'`, the Lodge); the `bld…` functions serve both scenes through `bldTab()`/`bldList()`/`bldSync()`/`bldFits()`. Give it `snap:true` if it must keep to the tiles (painted into the ground, or joined to its neighbours).
- [ ] A piece may carry `x, y` (art pixels, Free) beside `c, r`; always read its footprint with `pieceRect(d,I)`, never `d.c*16`. `c, r` are the tiles it blocks, so walking and `TOWN_KEEP` checks stay on tiles.
- [ ] Anything that draws or blocks pieces skips `BLD_SKIP` (the piece held). A new deed the player can take back calls `bldDid({a:…})` and gets a branch in `bldUndo()`.
- [ ] New saved fields on a piece survive Store (`bldStow()` builds the stored entry) and `storeFix()`.

## Turning, and new art (Expansion 4, step 2)

- [ ] **New art:** `expansion/EXPANSION4_RUNBOOK.md` §3. PixelLab (`get_object` for a piece Criss made), then `tools/png2rows.py` to rows, every colour on a `PX` letter (a new letter only if none is close, said in the PR), drawn with `tRows()`; 16 px wide a tile, up to 24 on a diagonal, standing on its tile and rising above it. Check it in the shots.
- [ ] A new piece declares `faces` (1, 2, 4 or 8) and, if its diagonals are drawn and cover other tiles than its straight footprint, `diag` (its tiles facing SW). Its painter takes the drawn facing `s` (`lodgeFurnDraw(id,s)`); mirrors come from `faceSrc()`.
- [ ] Read a footprint with `pieceFoot(I,d.f)` / `pieceRect(d,I)` / `decoTiles(id,c,r,f)`, never `I.w`: a piece on its side swaps w and h. Anything that places, checks or draws a piece passes its `f`.
- [ ] A new field on a piece rides along with `f`: in `bldStow()`, `storeFix()`, `bldPlaceStored()` and `townFix()`/`lodgeFix()`.

## The catalogue (Expansion 4, step 4)

- [ ] **A new Lodge piece** is a row in `LODGE_ITEMS` with a `set` (a key of `LODGE_SETS`), `cost` (the four materials only), `faces`, `dyes` (2 to 4 colourways in all, so 1 to 3 keys of `LODGE_DYES`), and its rows in `LODGE_ROWS` (from PixelLab, `tools/png2rows.py --outline`, §3). Floor pieces need `w`/`h` and a facing's rows for each of 0, 2, 4 (`faces: 4`) or just 0 (`faces: 1`). `glow: 'letters'` for what burns (and `light: r`).
- [ ] **A wall mount** is `mount:true, h:2`: wall tiles, `r` 0, never solid. Where it may hang is each room's `hang` list in `LODGE_ROOMS`; a new fixture on a back wall (a lamp, a door) adds its range there.
- [ ] **A surface** is `top: n` plus `LODGE_TOPS[id][facing]` (the two ends of its lane in the art's canvas, for each drawn facing). **A small thing** is `small:true`; it is never in `furn` itself, only in its host's `on`. Cost, dye and storage of a piece all go through `lodgeCostOf(d)`; never `I.cost` for a piece that exists.
- [ ] **A new dye** is a swap in `LODGE_DYES` (letters to letters); a piece lists the keys it takes.
- [ ] **A new set** is a row in `LODGE_SETS` (`rep` is the piece its chip shows; no `open` means a blueprint in `ll-town.blueprints`, which step 6's Peddler sells). The tray, the locked chips and "Ask the Peddler" follow from it; the tests check each set has a floor piece, a wall mount and a small thing.
- [ ] Anything that reads or writes a Lodge piece keeps `dye` and `on` with it (`bldStow()`, `bldPlaceStored()`, `storeFix()`, `lodgeRoomFix()`).

## Tests

- [ ] **`tests/hook.js`:** add each function a test calls to the `HOOK` object, on the line for your step (functions by name, tables as getters: `get TOWN_X(){return TOWN_X}`).
- [ ] **A step test** in `tests/t/<name>.test.js`, modelled on `town.test.js` (or the step's own, like `lodge.test.js`).
- [ ] **`tests/t/devices.test.js`:** a block per new button, card or panel, inside the per-device loop, after the other Saltmouth blocks. Use developer mode (`__t.setDev(true)`, and put it back) so nothing is written; check the control is inside the safe area and takes a thumb (44 px), nothing moved, and print `FAIL <device>: …` if not; take a `<scene>-'+nm+'.png'` screenshot for the `shots` skill.
