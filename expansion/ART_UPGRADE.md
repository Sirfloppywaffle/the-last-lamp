# Art upgrade: Saltmouth through PixelLab

**For Criss:** you now have a PixelLab subscription (Tier 1: 2,000 generations a month, more than one job at a time). This plan uses it in four passes, each slotted in just before the runbook step that builds on it. Step 4 takes the first part itself, because it makes about 30 new pieces anyway. The stair stays painted (#116); this is Saltmouth only, unless you say otherwise.

**For the AI picking this up:** read `expansion/EXPANSION4_RUNBOOK.md` §2 and §3 first. This file adds to §3 and does not replace it. Each pass is one PR, run with the runbook's §4 workflow.

---

## 1. Where the art stands (after step 3, #139)

| What | How it is made now |
|---|---|
| Keepers and souls | 16×24 text rows per facing (`d`, `u`, `r`; `l` mirrored), each Keeper with their own uppercase palette (`TOWN_KITS`). Legs are shared (`TOWN_BODY`, `TOWN_LEGS`), with a two-pose walk (`TOWN_WALK`). The glowing parts (`em`) are drawn again after the dark. |
| Buildings, trees, braziers, fences, headstones, the Head-frame | Painted by code, one function each (`townHouse()`, `townTree()`, `townBrazier()`…). Flames are 3 hand-made frames. |
| The square's ground | Generated pixel by pixel (`townGround()`). |
| The Lodge | Armchair, hatch, ladder and round window come from PixelLab. The desk, stove, bookshelf and rug are painted by code (step 2). Floors and walls are generated. |
| The stair | Painted canvas. **Out of scope** (Criss's call on #116). |

---

## 2. Rules for every pass

1. **Runbook §2 and §3 hold**: no anti-aliasing, whole-pixel scale, outlines one shade darker than the fill, 16 px a tile, characters 16×24, salt, rot, rust, tallow, eerie and never cute.
2. **The palette is locked.** Every PixelLab call passes the town's colours (`PX` as hex). That is why step 3's art needed no new letters. Only `w`, `x` and `z` are left free, so a new letter needs a reason in the PR. A Keeper's own colours stay on their uppercase letters.
3. **Style references.** Approved pieces are the reference for the next ones:
   - `style_object_id` = the Lodge Armchair for 8-facing objects;
   - `style_images` = the hatch, ladder and window for one-facing pieces.
   Once a pass is approved, its best pieces join the set.
4. **Criss sees it before it goes in.** Post a contact sheet of the candidates, plus the chosen ones at game scale in the device shots. Swapping one is a single-line change, so a bold first pick is fine.
5. **A size budget.** `index.html` is 1.19 MB and `npm run check` already warns. Each pass states its kilobytes in the PR and stays under about 60 KB. Text rows compress well on Pages, but the file is still the game.
6. **Motion has a still.** Anything animated has a still frame for Lite and Reduce Motion (rule 18), and no frame allocates (rule 17).
7. **Keep a log.** Add a row to §6 below for every piece: what it is, its PixelLab object id, the candidate chosen, and any hand fixes.
8. **Budget generations.** Each pass estimates its spend up front and reports it in the PR. Look at `get_balance` before starting.

---

## 3. Step 4 takes the first part (the art kit)

Step 4 draws about 30 catalogue pieces. Drawing them the new way from the start saves redoing them later. So step 4 also does this:

- **The art kit.** The palette list, the style references (§2.3), and the prompt shape that worked in step 3: "low top-down view, … wet, salt-stained, eerie muted colours", passing the palette.
- **The right tool per piece:**
  - furniture with 4 or 8 facings: `create_8_direction_object`, using the Armchair as its style;
  - wall mounts and small things on surfaces (candles, books, bottles, a skull): `create_1_direction_object`. Size 32 gives 64 candidates and 48 gives 16.
- **Dyes cost no generations.** A colourway is a letter-to-letter swap in code, not new art.
- **Redraw the old four.** The Banker's Desk, Stove, Bookshelf and Ritual Rug get redrawn so they match the Armchair. They are catalogue pieces, so this belongs in step 4.
- **`tools/png2rows.py --sheet out.png`.** The tool writes the contact sheet itself, numbered, at 4×, using only the standard library. That replaces the throwaway script used in step 3. *Built (step 4):* it also gained `--outline X`, which takes an edge pixel of pure dark up to the piece's own darkest letter (§2.1's outline rule).
- *Learned (step 4):* with the Armchair as `style_object_id` the canvas must be at least 34, and the pieces came out 27 to 32 px across, so squeezing them to 16 spoiled them. Over-sized pieces were regenerated at canvas 24 without a style object (brighter, but the right size); wide ones (desk, pew, chart table, chest, coral table) keep 36 and a 2-tile footprint. Wall mounts and small things: 1-direction objects at 16 px (a style image forces its own size, 24); small things are about 10 px, so a candle sits on a desk's slot. Pass a short `item_descriptions` list: a 64-candidate job at size 16 draws your items first and 56 useful extras after.
- **Estimated spend:** 10 to 20 generations a piece, so about 350 to 700 of the month's 2,000.

---

## 4. The passes after step 4

Each pass comes before the step that leans on it (runbook §1 numbers them A1, A2, A3):

| Order | What | Why here |
|---|---|---|
| Step 4 | The catalogue, with the art kit (§3) | |
| **Art 1** | Fire, water, weather | Step 5 lights rooms from these flames |
| Step 5 | Light and dark indoors; trophies | |
| **Art 2** | The Keepers and the souls | Step 6's Peddler is born in this pipeline |
| Step 6 | The Peddler | |
| **Art 3** | Scenery: buildings, ground, props | Step 7 paints the buildings, so redraw them first |
| Steps 7 to 10 | Village, Hearth Beacon, Keepers react, v20.0.0 | The Hearth Beacon is made this way from the start |

### Art 1: fire, water, weather (about 150 generations)
- **Flames.** The brazier, street-lamp, sconce, stove grate and banker's lamp get 4 to 8 frame loops from `animate_image`, with a step-sized flicker the lights can follow (`townFlick()`).
- **Water.** The sea along the south shore, the tide-pools and the Cellar's brine get slow loops. The brine's glints stay in code.
- **Rain.** Splash and drip frames, and the Attic window's rain as a loop.
- **Effects.** A puff of dust when a piece is placed or salvaged, from `vfx_workbench` (Full only).
- **Test:** each loop has its still frame, and the frame time in `devices` doesn't rise.
- *Learned (A1):* `animate_image` on the piece itself at 32×32 (1 generation each) gives a usable flicker, but it redraws the body too, so only the flame's zone is kept and the rest is locked to the piece's rows (frame 0 is the input, so the still is the art as it was). Below about 4 px wide a flame comes back as a blob: draw those few frames by hand. On flat textures (sea, brine) it repaints the ground, so keep only its moving highlights, in small specks. Rain, splashes and dust come better from `vfx_workbench` parts (`water_splash`, `dust_puff`), which are free and take the palette as their colour ramp.

### Art 2: the Keepers and the souls (about 400 generations)
- **Pilot first.** Make Ambrose the Lamplighter with `create_character` (4 directions; Criss: not 8) plus `animate_character` (`walking`, `breathing-idle`). Put him side by side with today's rows in the shots. **If he doesn't beat the hand rows at 16×24, stop there and keep the rows.** Faces made of two or three pixels are hard to improve on.
- **If the pilot wins:**
  - every Keeper and the rescued souls get the same treatment, keeping their silhouettes and tools: Jonah's harpoon, the Nameless's hood, Voss's rod;
  - their glowing letters (`em`) stay;
  - `png2rows.py` gains `--kit <name>`, which maps colours to that Keeper's uppercase palette, and `--frames`, which turns one PNG strip into a frame list;
  - the walk goes from 2 poses to 4 to 6 frames.
- **Size:** 12 figures × 4 facings × about 6 frames is the biggest cost. Measure it in the PR, and trim frames before trimming facings.

### Art 3: scenery (about 700 generations; may split into 3a buildings and 3b ground and props)
- **Buildings.**
  - The Lodge, the Drowned Oar, the five workshops, the houses and the Head-frame come from `create_map_object` or `create_building_kit`.
  - The ruined, restored and lit states come from `create_object_state`, so each workshop's three tiers come from one base.
  - Step 7 then adds 3 palettes each by letter swap, as with the dyes.
- **Ground.** `create_topdown_tileset` at 16 px makes the edges between earth and cobbles, cobbles and deck, and earth and the cliff edge. The 24×24 map and `TOWN_MAP` stay exactly as they are; only the painting changes.
- **Props.** Trees, fences, headstones, braziers and the cemetery railings.
- **Test:** `town.test.js` and `townbuild.test.js` still pass untouched, and every building's door and keep tile is where it was.

### Art 4 (optional; Criss's call)
Pixel portraits on the town's talk cards, from `create_portrait_character`, beside a Keeper's lines.

---

## 5. Criss's calls (on #139)

1. **Versions: middle-number bumps.** Each art pass is a new part of the expansion: A1 19.5.0, A2 19.7.0, A3 19.9.0, and the steps after them shift (the runbook's status table has the numbers). v20.0.0 stays the release.
2. **Keepers: pilot one.** Art 2 starts with Ambrose alone; if he feels right, the others follow; if not, the hand-made rows stay.
3. **4 facings, not 8.** Keepers keep `d`, `u`, `r` (and `l` mirrored).

---

## 6. Art log

| Piece | Where | PixelLab object | Candidate | Hand fixes |
|---|---|---|---|---|
| Lodge Armchair | `LODGE_CHAIR` | `d2cde9bc-8019-4377-ae95-49526e49995a` (Criss's) | 8 facings | narrowed to 16 / 24 wide; new `o`, `p` |
| Cellar hatch | `LODGE_HATCH` | `f50809e6-9b56-4f7a-9e61-658056500dba` | 10 | narrowed 28→16; shut and open states drawn in code |
| Attic ladder | `LODGE_LADDER` | `2326e2dc-bc2e-4a85-8e58-147c62a9a728` | 4 | 18×45 → 16×34; outline `0`→`5` |
| Attic round window | `LODGE_WINDOW` | `65908fca-70c8-4ae0-a90c-3d511bc11592` | 12 | 28→24; glass cleared; outline `0`→`5` |
| Chest (Sea Chest, 2 tiles) | `LODGE_ROWS.chest` | `b4ef2540-fb30-45db-bab5-88b43bc86af1` | 8 directions, S W N | none; edge `5` |
| Stove (redraw) | `LODGE_ROWS.stove` | `76bd1769-21da-4ec6-922e-44982acf4be7` | 8 directions at 24, S W N | 17→16; edge `1`; its grate (`vkab89`) glows |
| Banker's Desk (redraw) | `LODGE_ROWS.desk` | `ecbbec79-76bd-4889-9797-e23f5c53c71f` | 8 directions, S W N | 40→32 / 19→16; edge `5`; the lamp is gone |
| Bookshelf (redraw) | `LODGE_ROWS.shelf` | `046c836e-3393-4c31-91d0-d03b2dda7472` | 8 directions at 24 | 19→16; edge `5` |
| Ritual Rug (redraw) | `LODGE_ROWS.rug` | `c9efb5ad-2ec6-4b42-b3ae-4618eac806c0` | frame 10 of 16 (1-direction, 48) | 42×43 on its 3×3; edge `5` |
| Chapel pew | `LODGE_ROWS.pew` | `14b225da-c37a-4d16-980d-be4e10c1c06e` | 8 directions, S W N | 38→32, 36→32, 15 |
| Holy-water font | `LODGE_ROWS.font` | `ee04725e-3f66-4a77-9bb9-1172b447a0bd` | 8 directions at 24, S | 17→16; edge `2` |
| Chapel lectern | `LODGE_ROWS.lectern` | `61245af4-daae-4bca-8e6e-a94ebca57d21` | 8 directions at 24, S W N | 17→16 |
| Brass telescope | `LODGE_ROWS.telescope` | `24b195a9-1e9b-41ca-acc6-8be5ccfa4b58` | 8 directions at 24, S W N | 21→16 (side); edge `2` |
| Orrery | `LODGE_ROWS.orrery` | `030745f4-86fc-4188-a0bd-e04f9816e6b7` | 8 directions at 24, S | 19→16 |
| Chart table | `LODGE_ROWS.chart` | `6d489eb4-ab99-4b50-8f8a-dfc6f550a52c` | 8 directions, S W N | 38→32, 36→32, 20→16 |
| Coral cluster | `LODGE_ROWS.coral` | `dbe2dde2-336d-464a-ad68-29fb75fcc3c4` | 8 directions at 24, S | 17→16 |
| Brine urn | `LODGE_ROWS.urn` | `240bc2a9-47d6-432a-a152-7d43b91a1b29` | 8 directions at 24, S | 17→16; edge `5` |
| Coral table (2 tiles) | `LODGE_ROWS.ctable` | `56da008d-e20c-492a-99d9-b741e46eb2d1` | 8 directions, S | none; edge `2` |
| Wall mounts (wheel, barometer, anchor, portrait, saint, bell, clock, star chart, coral fan, mask) | `LODGE_ROWS.<id>` | `d9c1f555-6b2f-44db-8be3-ff736edd0713` | frames 0 to 9 of 64 (1-direction, 16) | none; edge `5` or `1` |
| Small things (lantern, bottle, candle, skull, hourglass, shell, inkwell) | `LODGE_ROWS.<id>` | `6c375693-45e7-4b3d-bfaf-ddf3b5204c1d` | frames 0 to 7 of 64 (1-direction, 16) | narrowed to 8 to 12 wide, 7 to 12 tall; edge `5` or `1` |
| Wall lights (ship's lantern, candle sconce, votive rack, brass wall lamp, glow-anemone) | `LODGE_ROWS.<id>` | `852515e3-5ab7-443d-8e5e-544077e1db26` | frames 24, 1, 56, 3, 4 of 64 (1-direction, 16) | none; edge `1`; their flames and glass glow |
| Candelabra | `LODGE_ROWS.candelabra` | `0603cbdf-02ae-4b87-94e1-85f816b47314` | 8 directions at 24, S | 19→16; edge `1` |
| Standing lamp | `LODGE_ROWS.floorlamp` | `e682c63e-62f5-4902-8a63-18a48d201086` | 8 directions at 24, NE (a hooked lamp, its lantern to the right) | none; edge `1` |
| Stack of books | `LODGE_ROWS.books` | `b375d966-2b23-43c4-9cc5-1cac07cf5263` | frame 3 of 64 | 14×15→13×11 |
| Brazier flame (A1) | `TOWN_FIRE.brazier` | `animate_image` job `d2ade228-b535-46fd-939f-da9fdd70a20e` (the brazier at 32; a 64 px try, `f2a4a71c-…`, was blurrier) | frames 1 to 6 | the flame alone over the code-drawn bowl; snapped warm letters to `v89abc`. Frame 0 (the old hand-made flame over a dull ember bar) left out on Criss's #141 playtest, where it showed as a floating line |
| Street-lamp glass (A1) | `TOWN_FIRE.lamp` | `522f9288-d708-4e9f-a42a-e05d59c222ba` | frames 0, 1, 2, 4, 3, 6 | the glass alone (6×7); sparks above the cap dropped. Criss on #141 (it blinked): frame 4's dark ring redrawn as a small dip, each frame held twice as long (`hold:2`) |
| The Lodge's own sconces (A1) | `TOWN_FIRE.sconce` | `f9313fe0-5ece-4b06-af90-f8228f79ce7d` | frames 0, 1, 3, 5, 6 | the flame alone over the candle; frames 2 and 4 left out (the flame floats off the wick) |
| Stove grate (A1) | `LODGE_FIRE.stove` | `5dfa4cc6-792c-4d16-bd37-03e6799626cc` | frames 0 to 6 | facing 0 only (the side's two glowing pixels stay still); the body locked to its rows |
| Ship's lantern (A1) | `LODGE_FIRE.shiplamp` | `723e3e9b-032a-4bcf-9643-e71a19a5cd43` | frames 0 to 6 | the glass zone only |
| Votive rack (A1) | `LODGE_FIRE.votive` | `6f899101-af89-4b70-8d4f-184ab66edcdc` | frames 0 to 6 | the flames' rows only; scraps floating free of the rack dropped |
| Candelabra (A1) | `LODGE_FIRE.candelabra` | `1c65407f-cb5c-43af-ba0c-71b13d57a492` | frames 0, 1, 6, 5, 4 | three flame zones, the candles locked; floating scraps dropped; frames 2 and 3 left out (flames torn off) |
| Hurricane lantern (A1) | `LODGE_FIRE.lantern` | `c79500df-ef32-431f-a942-ba321fe8d538` | frames 0, 1, 0, 2, 0, 1, 5, 2 | holes in the glass filled with `9`; frames 3, 4, 6 left out (a face, grey patches). Criss on #141 (its light strobed): an uneven order, each frame held twice (`hold:2`), its light's swing halved (`amp:.5`) |
| Candle and candle sconce (A1) | `LODGE_FIRE.candle`, `.sconce` | `36cad0d5-280c-4b7c-ba65-7a1b9d84b329`, `408b00e0-d374-4214-805a-24254e3e8147` | none kept | at 3 px wide every candidate was a blob or lost its flame: six frames each drawn by hand from the still and candidate 6's lean |
| The sea (A1) | `TOWN_SEA` | `c11d4794-cc16-478c-adaa-1c7d297f99fd` (64×48: cliff foot and sea) | frames 1 to 8 | only the sea's moving pixels (`tq2r34`), tiled along the shore; the cliff never moves. Criss on #141 (the black sea read as a wall): the water repainted in dark blues with swells and foam at the cliff's foot (`townGroundPx`), the moving pixels lifted a shade (`SEA_LIFT`), and a surf line that washes in and out drawn faint through the dark (`townSurf()`, `SURF_ALPHA`) |
| Tide-pool water (A1) | `TOWN_POOL_WATER` | `d9d2a10f-8bc5-4ebe-8048-68f68efa6fe7` | frames 1 to 6 | only the dark water (`t`, `q`) changes; rim and what lies in it never move |
| Cellar brine (A1) | `LODGE_BRINE` | `52b65da3-e2f2-4c3a-8533-7a02174da01c` (64×64 of flags) | frames 1 to 8 | only pale ripples (`fge`) kept, in specks of 4 px or fewer: the model repainted the flags into blots, all dropped |
| Attic window rain (A1) | `LODGE_WIN_STREAK` | `8923841c-d171-4017-ac65-7bf60e51a3bc` | frames 1 to 8 | too few streaks to read alone (47 px in 8 frames): they run down the pane over today's drops, which now fall as an 8-frame loop |
| Rain splash (A1) | `TOWN_SPLASH` | effects tool, "Saltmouth rain splash" (`2276d9e3-36bf-4053-a3b4-c372cdc6c94a`, part `water_splash` at 0.14, the rain's own blues) | frames 7, 8, 2, 3, 4 (crown, drips, ring) | cropped to 11×9; its colours stay the rain's (`RAIN_PAL`), as the drops' always have |
| Dust puff (A1) | `TOWN_PUFF` | effects tool, "Saltmouth dust puff" (`46b636b1-d70f-4382-a62a-26663e4e3063`, part `dust_puff` at 0.6 on `2 6 7 o d`) | frames 1 to 6 | cropped to 20×15 |
| Stone Fireplace (step 5) | `LODGE_ROWS.hearth` | `4c4ffe8e-d3e8-444b-a72a-0f67e5c7ade2` (1-direction, 32; the town palette) | 40 of 64 | none; edge `1`; its fire (`9abc`) a loop drawn by hand from the still (`LODGE_FIRE.hearth`: a lean either way, a drop, a tall split) |
| The Keeper Below's Maw (step 5, trophy) | `LODGE_ROWS.keeper` | `7e9561f5-5538-48d6-8ee7-d3fbafd992d3` (1-direction, 16) | 29 of 64 | none; 14×14 |
| The Primordial's Eye (step 5, trophy) | `LODGE_ROWS.primordial` | `a167eae0-6262-4ed7-9799-5c543b58d4b6` (1-direction, 24) | 2 of 64 | 18→16 by taking off the base's two outer columns by hand (`--width` narrowing broke the eye); the eye's blues made violet on new letters `w` `#7a4fb8`, `x` `#c79bff` (no `PX` letter was close); `x` glows |
