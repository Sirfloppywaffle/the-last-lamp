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
- **`tools/png2rows.py --sheet out.png`.** The tool writes the contact sheet itself, numbered, at 4×, using only the standard library. That replaces the throwaway script used in step 3.
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
