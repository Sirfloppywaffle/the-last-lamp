---
name: town-patterns
description: How to add things to Saltmouth (the town in index.html) as the code stands after Expansion 3 step 9 - a tappable thing, the #townAct offer, keeping a tile clear, new ll-town and run fields, town tips, the Lodge's scene switch, test hooks and the devices test. Use when building or changing anything in the town.
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
- [ ] Room furniture: `LODGE_ITEMS`; kept clear: `LODGE_KEEP`; placing: `lodgeCanPlace()`/`lodgePlace()`.

## Build mode (Expansion 4, step 1): lift, storage, undo, Grid / Free

- [ ] A new kind of piece goes in `TOWN_DECOS` (square) or `LODGE_ITEMS` (`k:'furn'`, the Lodge); the `bld…` functions serve both scenes through `bldTab()`/`bldList()`/`bldSync()`/`bldFits()`. Give it `snap:true` if it must keep to the tiles (painted into the ground, or joined to its neighbours).
- [ ] A piece may carry `x, y` (art pixels, Free) beside `c, r`; always read its footprint with `pieceRect(d,I)`, never `d.c*16`. `c, r` are the tiles it blocks, so walking and `TOWN_KEEP` checks stay on tiles.
- [ ] Anything that draws or blocks pieces skips `BLD_SKIP` (the piece held). A new deed the player can take back calls `bldDid({a:…})` and gets a branch in `bldUndo()`.
- [ ] New saved fields on a piece survive Store (`bldStow()` builds the stored entry) and `storeFix()`.

## Tests

- [ ] **`tests/hook.js`:** add each function a test calls to the `HOOK` object, on the line for your step (functions by name, tables as getters: `get TOWN_X(){return TOWN_X}`).
- [ ] **A step test** in `tests/t/<name>.test.js`, modelled on `town.test.js` (or the step's own, like `lodge.test.js`).
- [ ] **`tests/t/devices.test.js`:** a block per new button, card or panel, inside the per-device loop, after the other Saltmouth blocks. Use developer mode (`__t.setDev(true)`, and put it back) so nothing is written; check the control is inside the safe area and takes a thumb (44 px), nothing moved, and print `FAIL <device>: …` if not; take a `<scene>-'+nm+'.png'` screenshot for the `shots` skill.
