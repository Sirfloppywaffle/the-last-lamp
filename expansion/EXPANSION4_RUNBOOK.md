# Expansion 4 runbook: Customization, steps 1 to 10

**Who this is for:** whichever AI picks up the next step, with no memory of earlier sessions. Read this file, `AGENTS.md`, `expansion/EXPANSION4_BRAINSTORM.md` (the decisions at its end win over its first half), and `.claude/skills/town-patterns/SKILL.md`. Expansion 3's runbook (`EXPANSION3_RUNBOOK.md` §3) explains how the town code works; read it once.

**For Criss:** to hand off a step, paste its **Prompt** (below) to Claude, with the repo link. After each merge, the AI that did the work ticks the status table.

---

## 1. Status (update this table in every step's PR)

| Step | What | PR | State | Version |
|---|---|---|---|---|
| 0 | Brainstorm and this runbook | #134 | merged | — |
| 1 | Build tools: lift, move, storage, undo, Grid/Free toggle | #137 | merged | 19.1.0 |
| 2 | 8-way rotation and the PixelLab art pipeline | #138 | merged | 19.2.0 |
| 3 | Lodge rooms: the Flooded Cellar and the Attic | #139 | merged | 19.3.0 |
| 4 | The catalogue: themed sets, wall mounts, small things on surfaces (with the art kit, `ART_UPGRADE.md` §3) | #140 | merged | 19.4.0 |
| A1 | Art pass 1: fire, water, weather (`ART_UPGRADE.md` §4) | #141 | merged | 19.5.0 |
| 5 | Light and dark indoors; boss trophies | #143 | merged | 19.6.0 |
| A2 | Art pass 2: the Keepers and the souls, one Keeper piloted first | #144 (pilot), #145 (the rest) | merged | 19.7.0 |
| — | The Lodge from Criss's playtest: movable sconces, the Grimoire's podium, rugs under furniture | #146 | merged | 19.8.0 |
| 6 | The Peddler: a rescued soul with a stall by the stairs | #148 | open: his figure waits for Criss's pick | 19.9.0 |
| A3 | Art pass 3: scenery (buildings, ground, props) | | | 19.10.0 |
| 7 | The village: decorations, paths, paint, Keepers' huts | | | 19.11.0 |
| 8 | The Hearth Beacon: the rain thins | | | 19.12.0 |
| 9 | Keepers react: waypoints, lore chalk, the cellar's tide | | | 19.13.0 |
| 10 | Release v20.0.0 | | | 20.0.0 |

**Order matters.** Never start a step until the previous PR is merged into `main`. The art passes (A1 to A3, Criss on #139: each a middle-number bump, placed before the step that leans on it) are built from `expansion/ART_UPGRADE.md`; their prompts are in §5 below, beside the steps.

---

## 2. Rules that apply to every step

Everything in `EXPANSION3_RUNBOOK.md` §2 still applies (additive only, pixel art §0.4, rule 24 dev mode never writes `ll-town`, rule 15 saves only grow, rule 11b stair rolls, rule 23 teach every change, rule 22 balance, AGENTS.md §6). On top of that, Criss's decisions for this expansion:

1. **Decorations are decorations.** No piece changes anything on the stair. The only exception is a piece that ties into another expansion's arc (the Hearth Beacon, step 8, feeds the true ending, and even it changes only the town).
2. **Grid or Free, as a toggle.** Build mode has a Grid / Free switch, remembered in `ll-town`. Grid snaps to tiles; Free places at art-pixel precision anywhere the footprint fits. Both keep every `TOWN_KEEP` / Lodge door and shelf tile reachable.
3. **8-way rotation** (every 45°). A chair in a corner can face the middle of the room. Symmetric pieces reuse mirrored frames; only pieces that need it get 8 drawn facings.
4. **Four materials only** (timber, iron, tallow, curios). Curios buy blueprints; tallow buys dyes and light.
5. **The vibe:** salt, rot, rusted iron, tallow, bone, soot, barnacles. Muted and wet. Eerie, never cute. Lighting makes sharp silhouettes. It always rains (until step 8 thins it, a little).
6. **Touch only, thumb-sized.** Every new control works on a folded Fold 7 in portrait. No drag-only action without a tap alternative.
7. **Cut:** farming and crops. A wandering stranger (the Peddler is a rescued soul instead).

---

## 3. Art (every step)

**New art comes from PixelLab.** Its tools load from `.mcp.json` (`create_8_direction_object`, `get_object`, `pixelart_workbench`, …). When Criss has made a piece himself he names the object: read it with `get_object`, which lists one PNG per facing. To make one, ask for a low top-down view on a canvas near 32 px, in the town's palette and §2.5's vibe, and show Criss before building on it. **Gemini's text grids** (one line per row, one character per pixel, `.` clear, a palette `char → hex`; the prompt is on PR #134) are still fine when Criss brings them: they skip the download, their colours snap to `PX` by the same rule as step 2 (nearest letter, a new one only if none is close), and every other rule holds.

**From PNG to the game:**
1. Download each facing into your scratchpad, never into the repo.
2. Convert it with **`tools/png2rows.py`** (standard library only; one `--width` a run, so straight facings and diagonals are two runs):
   `python3 tools/png2rows.py --width 16 --name 0 south.png --name 2 west.png --name 4 north.png --name 6 east.png`
   - **No semi-transparent pixels:** alpha 128 or more is fully there, anything less is clear (it reports how many it had to decide).
   - It crops to what is drawn, and `--width`/`--height` narrow it by taking out the interior columns (rows) most like their neighbour, so outlines stay whole.
   - **Every colour snaps to the nearest `PX` letter**, read from `index.html`. A colour with no letter within `--max` (RGB distance, default 28) gets a new lowercase letter, reported as `NEW`: add it to `PX` with a comment, **say so in the PR**, and pass `--pal <letter>=#hex` on later runs so the letters agree. Free lowercase letters left: `w x z` (uppercase belong to each Keeper's palette).
   - It prints the rows as JavaScript; paste them into the piece's art table and draw them with `tRows()`.
   - **A Keeper** (art pass A2): `--kit <name>` snaps to that Keeper's own letters (`TOWN_KITS[name].pal`, or a soul's `art.pal`) plus `0`, and makes every edge pixel `0` (a character's outline is pure dark); `--frames N` cuts a strip of N frames, all cropped to one box and narrowed alike, so a walk never jitters. Fitted to 16 by 24 with `--width 16 --height 24`.
3. **Match the town's art** (`EXPANSION3_TOWN.md` §0.4): no anti-aliasing, outlines one shade darker than the fill (pure dark only on characters), and the town's sizes. A piece is **16 px wide for each tile of its footprint**, up to 24 on a diagonal, and its height rises above the tile like the other props (it stands on its footprint's bottom edge: the Armchair is 26 to 28 tall over one tile). Crop or narrow to fit; where narrowing leaves a seam or an outline breaks, hand-touch it, in the rows or with `pixelart_workbench` (`inspect`, `lint`, `repair`) on the PNG before converting.
4. **Look at it in the 14-device shots** (`cd tests && npm run shots`) and up close, at every facing. Fix stray pixels yourself rather than sending the art back, and list the fixes in the PR.

## 4. The workflow for every step

Same as `EXPANSION3_RUNBOOK.md` §4 (test and design commands run from `tests/`: `cd tests && npm test`, `cd tests && npm run design`), with these changes: branch `claude/custom-<topic>`; the shots branch is `claude/shots-custom-<topic>`; HISTORY lines go under Unreleased and wait there for step 10's v20.0.0. Use the `ship-step`, `shots`, `self-review` and `steward` skills. **Don't comment `/gemini`** unless Criss asks.

---

## 5. The steps

Numbers marked *shape* are for playtest.

### Step 1: Build tools (Claude: Opus 5.5, high)

**Goal:** placing things feels like Animal Crossing: lift, move, then set down.

**Build:**
- In build mode (town and Lodge), tap a placed piece to **lift** it. It follows the thumb as a ghost (red where it can't go). Buttons in the tray: **✓ Place**, **✕ Cancel** (it goes back where it was), **Store**.
- **Storage:** stored pieces keep what they cost and wait in a Storage tab of the tray, free to place again. Selling (the old full refund) becomes **Salvage** in the same tab. Saved in `ll-town.store` (optional, defaults to empty).
- **Undo:** one button, the last 10 actions of this build session (place, lift, store, salvage). Clears when build mode closes.
- **Grid / Free switch** in the tray. Free placement saves `x,y` in art pixels beside `c,r`; old saves are Grid. `townCanPlace()` / `lodgeCanPlace()` take a footprint in pixels in Free mode and test the tiles it covers.
- Lifting a piece that a `TOWN_KEEP` path relies on is fine; placing anything that walls one off is still refused.

**Teach:** a town tip for lifting and storing; one for Grid / Free. Rules line grows.

**Test** `tests/t/buildtools.test.js`: lift and cancel returns it exactly; store then place costs nothing; salvage refunds in full; undo reverses each action; Free placement survives a reload; a Free piece can't wall off the door; developer mode never writes. Extend `devices.test.js` with the tray's new buttons.

**Prompt:**
> Repo Sirfloppywaffle/the-last-lamp. Read AGENTS.md, CLAUDE.md, expansion/EXPANSION4_RUNBOOK.md (§2 to §4, and §5 step 1) and expansion/EXPANSION4_BRAINSTORM.md's decisions. Build Expansion 4, step 1 exactly as the runbook says, following its §4 workflow. Tick the status table. End with the prompt for step 2.

### Step 2: 8-way rotation (Claude: Opus 5.5, high)

**Goal:** every piece turns in 45° steps.

**Build:**
- A **⟳** button while a piece is lifted (and a tap on the lifted piece itself) turns it one step clockwise; long-press turns it back. Saved as `f` (0 to 7) on each piece: 0 S (facing the camera), 1 SW, 2 W, 3 NW, 4 N, 5 NE, 6 E, 7 SE; old pieces are `f:0`. Art is 16 px wide for each tile of footprint facing straight, up to 24 on a diagonal, and as tall as it needs above its tile like any prop (§3).
- Each art entry declares `faces`: 1 (round things, no change), 2 (mirror), 4, or 8. Missing facings fall back to the nearest drawn one, mirrored where it fits.
- **Diagonal footprints:** a piece at 45° covers its own tile mask (declared per piece). In Grid mode a diagonal piece snaps to tile centres; in Free mode it uses the mask at its pixel position.
- Draw 8 facings for the Armchair (Criss's PixelLab object "Lodge Armchair", `d2cde9bc-8019-4377-ae95-49526e49995a`, through §3) and 4 for the Banker's Desk, Stove and Bookshelf. Fences and paths in town get 2 (mirror) or 4.
- *As built (#138):* new pieces go down facing south; a stored piece keeps its facing. Paths and fences (`snap`) turn a quarter at a time. A footprint keeps its top-left as it turns, so eight turns put it back exactly. A facing not drawn: east is west mirrored, a two-way piece's back is its front, and a diagonal shows the straight facing beside it nearer the front.

**Teach:** the tip from step 1 grows a line about ⟳.

**Test** `tests/t/rotate.test.js`: 8 taps return to the start; the facing survives reload; a diagonal footprint blocks the right tiles; mirrored fallback draws. Shots: a chair in each corner facing the middle.

**Prompt:**
> Repo Sirfloppywaffle/the-last-lamp. Read AGENTS.md, CLAUDE.md, expansion/EXPANSION4_RUNBOOK.md (§2 to §4, and §5 step 2) and expansion/EXPANSION4_BRAINSTORM.md's decisions. Build Expansion 4, step 2 exactly as the runbook says, following its §4 workflow. Tick the status table. End with the prompt for step 3.

### Step 3: Lodge rooms (Claude: Opus 5.5, high)

**Goal:** the Lodge grows: the **Flooded Cellar** (down a hatch) and the **Attic** (up a ladder, a round window onto the rain).

**Build:**
- `ll-town.lodge` becomes a set of rooms (`main`, `cellar`, `attic`), each with its own floor, wall, furniture. Old saves load as `main`.
- Each room is bought: Cellar 25 iron, 10 tallow; Attic 30 timber, 2 curios (*shape*).
- A hatch / ladder tile in the main room (added to the room's keep tiles) moves between rooms; `#townAct` offers "Down to the cellar" / "Up to the attic".
- The Cellar has **brine**: a water level drawn over its floor (step 9 makes it move; here it sits at a fixed shallow level). The Attic's window shows rain falling outside.

- *As built (#139):* the main room stays in `ll-town.lodge` itself; the others are `lodge.rooms.cellar` / `.attic`, each `{built, floor, wall, furn}` (`LODGE_ROOMS`, `lodgeRoom()`, `lodgeCur()`; every room is 10×10, so one set of room code serves all three). The hatch is `C` at (1,6), the ladder `L` on the back wall at x 2; the Cellar's ladder back is `U`, the Attic's hatch `H` (`LODGE_WAYS`); you arrive beside the way back. The Cellar's brine is `LODGE_ROOMS.cellar.brine` (3 art px), drawn into its ground and its pieces' feet (`lodgeWet()`); step 9 moves it. A room's first floor and wall are free there (`lodgeCost()`). Storage is shared by every room; changing room closes Build.

**Teach:** a tip per room. **Test** `tests/t/lodgerooms.test.js`. Devices: each room on each screen.

**Prompt:**
> Repo Sirfloppywaffle/the-last-lamp. Read AGENTS.md, CLAUDE.md, expansion/EXPANSION4_RUNBOOK.md (§2 to §4, and §5 step 3) and expansion/EXPANSION4_BRAINSTORM.md's decisions. Build Expansion 4, step 3 exactly as the runbook says, following its §4 workflow. Tick the status table (step 2 is #138). Any new art (the hatch, the ladder, the attic's round window) comes from PixelLab through runbook §3 and `tools/png2rows.py`. Each room's furniture turns like the main room's (`f`, `faces`, `pieceFoot()`). End with the prompt for step 4.

### Step 4: The catalogue (Claude: Sonnet 5.5, high)

**Goal:** many more pieces, in five themed sets: **Fisherman's**, **Drowned Chapel**, **Brass Observatory**, **Old Library**, **Deep-One Coral**. About 30 pieces in all (*shape*), every set with something for the floor, the wall and a surface.

**Build:**
- **Wall mounts:** pieces that hang on the back wall (paintings, ship's wheel, barometer, clock). They use wall slots, never floor tiles.
- **Small things on surfaces:** candles, books, bottles, a skull. Placed on a desk, shelf or table piece at half-tile precision; lifting the table lifts what is on it.
- **Dyes:** each piece has 2 to 4 colourways (palette swaps). Dyeing costs tallow (*shape*). Saved as `dye` on the piece.
- **Blueprints:** two sets are open from the start (Fisherman's, Old Library). The other three are bought from the Peddler (step 6); until then they show locked in the tray with "Ask the Peddler".
- Everything costs town materials only.

- **The art kit** (`expansion/ART_UPGRADE.md` §3): every new piece from PixelLab on the town's palette, the Armchair and step 3's hatch, ladder and window as style references, dyes as letter swaps; the Banker's Desk, Stove, Bookshelf and Ritual Rug redrawn to match; `tools/png2rows.py --sheet`. Log every piece in `ART_UPGRADE.md` §6.

- *As built (#140):* the Lodge only (the square's pieces are step 7). `LODGE_ITEMS` holds 40 pieces (seven give light: a wall light for each set, a standing lamp and a candelabra, added on Criss's #140 playtest) in `LODGE_SETS`; the sets, wall mounts, small things, dyes and blueprints are described in `AGENTS.md` §5's Saltmouth row. A **mount** is one tile wide and two tall on the wall rows (`r` 0), with art up to 16 wide and about 14 tall; where it may hang is each room's `hang` list (the main room has three places, the Cellar and the Attic more). A **surface** is any piece with `top: n`; small things are saved inside it (`on`), so Store, Salvage, Undo and a reload carry them. **Dye** is `bldDye()`: the next colourway for 2 tallow, going back refunds; a dye is a swap of palette letters (`LODGE_DYES`). **Blueprints** are `ll-town.blueprints` (a list of set keys; step 6 pushes to it); a locked set's chips show a padlock and say "Ask the Peddler", and developer mode opens all sets without writing. The Banker's Desk lost its lamp in the redraw. Art: PixelLab 8-direction objects at canvas 24 (36 for the desk, pew, chart table, chest and coral table, which are wider than a tile) without a style object (with the Armchair as style the 36 px canvases came out 27 to 32 px across and had to be squeezed to 16), mounts and small things as 1-direction objects at 16 px; about 290 of the month's 2,000 generations.

**Teach:** tray tips for wall mounts, surfaces, dyes. **Test** `tests/t/catalogue.test.js`. `cd tests && npm run design` (new table).

**Prompt:**
> Repo Sirfloppywaffle/the-last-lamp. Read AGENTS.md, CLAUDE.md, expansion/EXPANSION4_RUNBOOK.md (§2 to §4, and §5 step 4) and expansion/EXPANSION4_BRAINSTORM.md's decisions. Build Expansion 4, step 4 exactly as the runbook says, following its §4 workflow, with the art kit from expansion/ART_UPGRADE.md §3 (every new piece from PixelLab through runbook §3 and tools/png2rows.py). The Lodge has three rooms now (LODGE_ROOMS; read pieces through lodgeRoom(), never T.lodge.furn): wall mounts and surface pieces work in all three. Tick the status table (step 3 is #139). End with the prompt for art pass A1.

### Art pass A1: fire, water, weather (Claude: Opus 5.5, high)

**Build:** `expansion/ART_UPGRADE.md` §4, Art 1: flames that loop (brazier, street-lamp, sconce, stove, banker's lamp), the sea, the tide-pools and the brine, rain splashes and the Attic window's rain, a puff of dust on placing or salvaging. A still frame for Lite and Reduce Motion. No balance, no new mechanics. **Test:** each loop has its still; `devices` frame time does not rise; shots.

- *As built (A1):* the banker's lamp left with step 4's redraw, so the Lodge's flames are every `LODGE_ITEMS` row that burns (`glow` and `light`, neither `steady` nor `col`: the stove, the lantern and the candle, the ship's lantern, the candle sconce, the votive rack, the candelabra) and the room's own sconces; the lamps and the anemone stay steady. A flame loop is `TOWN_FIRE` / `LODGE_FIRE`: frames of its zone's rows, the piece's body never moving, frame 0 the art as it was (the still). Lights follow their flame's frame (`fireFk()`, `townFlick()`). Water: `TOWN_SEA`, `TOWN_POOL_WATER`, `LODGE_BRINE` (moving pixels as `T64` triplets, `tPts()`), stepping every `WATER_DT`. Rain: `TOWN_SPLASH` (crown, drips, ring) and the window loop (`lodgeWinFrames()`). Dust: `TOWN_PUFF`, `townPuff()`/`townPuffAt()` on placing, setting down, storing and salvaging (Full only). Lite now stills the flames too (it used to keep the 3-frame flicker). A flame may hold each frame longer (`hold`) and swing its light less (`amp`): the street-lamp and the hurricane lantern do, after Criss's playtest on #141; the shore's surf shows faintly through the dark (`townSurf()`). Spend: 15 animate_image generations (32 to 64 px, 1 each; the estimate was about 150); the effects tool is free. `tests/t/loops.test.js`.

**Prompt:**
> Repo Sirfloppywaffle/the-last-lamp. Read AGENTS.md, CLAUDE.md, expansion/EXPANSION4_RUNBOOK.md (§2 to §4, and §5 art pass A1) and expansion/ART_UPGRADE.md. Build art pass A1 exactly as ART_UPGRADE.md §4 says, through runbook §3, following the runbook's §4 workflow. Log every piece in ART_UPGRADE.md §6. Tick the status table. End with the prompt for step 5.

### Step 5: Light and dark; trophies (Claude: Opus 5.5, high)

**Goal:** rooms are dark until you light them. Lamps, candles, a fireplace and the stove make pools of warm light with sharp silhouettes.

**Build:**
- Indoor darkness like the town's, lighter than outside but real. Each lit piece adds a light (`{x,y,r,f}`).
- **Boss trophies:** each boss beaten unlocks a Lodge item of one shared kind, `k:'trophy'` (wall mount or plinth). Build it as a general kind, not one-off objects: Expansion 5's Keeper's Ledger (#131, `expansion/EXPANSION5_PROGRESSION.md` in #135) adds more trophies through the same kind. Tapping it shows its Grimoire line, and the Keeper Below's trophy rumbles faintly (sound off with the game's sound setting).

**Test** `tests/t/lodgelight.test.js`: a room with no lights is darker; trophies only for beaten bosses; codex never changes. Shots: one lit and one dark room per device.

- *As built (#143):* each room has a `night` with nothing burning (0.8 to 0.82, under the square's 0.83) and a `dim` once lit (0.58 to 0.64), reached at `LODGE_WARM` = 3 of warm light (a light's radius over 36; a cold one half; the Attic's window and the hatch's spill nothing). "Dark until you light them" covers the rooms' **own sconces** too: cold until a tap lights them (a room's `sconces`, so an old Lodge loads cold), and any piece that burns can be put out the same way (`out`; it comes down lit). Outside Build a tap on a light or a trophy walks you to it and `#townAct` offers it. **Sharp silhouettes** are a layer worked out once per room signature (`lodgeShade()`): each light throws every floor piece's shadow away from it, and a piece lit from behind stands dark with its top edge caught. A **Stone Fireplace** (the Lodge's own set, two tiles, light 52; `faces: 4`, on its side 1 by 2, so it backs onto a side wall: Criss on #143) answers "a fireplace". **Trophies** are `k:'trophy'` rows in `LODGE_ITEMS` with a `foe`, on a tray page `trophy`; `lodgePiece()` is what every place that meant furniture now asks. Earned in `killFoe()` into `run.trophies`, carried up by `haulCredit()` into `ll-town.trophies`; an old town is given what `ll-best` shows. One of each, free, no dye. The Keeper Below's Maw (a wall mount) rumbles when tapped and on its own every 16 to 32 s; the Primordial's Eye (a plinth) glows violet (new `PX` `w`, `x`). Expansion 5 earns more through `trophyEarn()`.

**Prompt:**
> Repo Sirfloppywaffle/the-last-lamp. Read AGENTS.md, CLAUDE.md, expansion/EXPANSION4_RUNBOOK.md (§2 to §4, and §5 step 5) and expansion/EXPANSION4_BRAINSTORM.md's decisions. Build Expansion 4, step 5 exactly as the runbook says, following its §4 workflow. Tick the status table. End with the prompt for art pass A2.

### Art pass A2: the Keepers and the souls (Claude: Opus 5.5, high)

**Build:** `expansion/ART_UPGRADE.md` §4, Art 2. **Pilot first:** Ambrose the Lamplighter only, 4 facings (Criss: no 8), walk and idle, side by side with today's rows in the shots, and stop for Criss's verdict. If he likes it, the other Keepers and the rescued souls follow in the same PR or the next; if not, the hand-made rows stay and the pass ends. **Test:** `town.test.js`, `keepers.test.js`, `rescue.test.js` untouched; sprite sizes stay 16×24.

- *As built (the pilot, #144):* Ambrose only. A Keeper drawn whole is a `TOWN_FIG` entry (a walk and an idle per facing drawn, `d`, `u`, `r`; `l` mirrored), compiled by `townFigFrame()` onto each facing's list in `TOWN_SPR` as `.walk` and `.idle`, beside the three steps everything else reads (the idle's first frame and two of the walk, so `town.test.js` still counts 84); `townFigPick()` chooses the frame (the walk by distance, a stride pair as the old four steps; standing, the idle every `FIG_IDLE_DT`; still with Lite or Reduce Motion), for you and for a Keeper at his post (`townCrowdDraw()`, no head bob). Nine candidates were made (standard, v3 and pro modes, sizes 18 to 32). Criss first chose the pro-mode one on his own palette (`08d71ea5-…`); on the Fold its mottled face read as frightening at 16×24, and he settled on the standard one at size 22 with a brown greatcoat (`219111a0-…`, re-imported with its lantern as `0f61ca97-…`). Next time, show the contact sheet and let him pick before building, and show the pick at game scale before calling it done. Template animations (`walking`, `breathing-idle`, 1 generation a facing) keep the figure but drop what he holds and ignore the palette; the lantern is laid back into every frame from the still, and his own letters fix the colours (his buckle is `Y`, gold that does not glow). Spend: 35 generations. `figure.test.js`.
- *As built (the rest, #145):* Jonah, the Nameless, Voss, Agathe, the Croupier and the Toothmonger, each a `TOWN_FIG` entry like Ambrose's (walk 6 and idle 4 per facing drawn), on letters of their own added to their palettes. Candidates first (2 to 4 each, standard, size 22, big heads), Criss's picks on #145 (two after a retry from his first choice), then the walk and the idle from the templates. Held things laid back from the still in every frame (and painted from the one view that had them into the others), heads locked to the standing frame, `em` kept on what glows: Jonah's lamp and the Nameless's eyes gain a brighter `g`, Voss's spark stays `G`/`g`. `png2rows.py --kit` reads a soul's palette now (it found only Keepers'). `figure.test.js` checks every figure, and saves a lineup in the square and every facing at game scale. Spend: 62 generations; +76 KB (+14 KB gzipped).

**Prompt:**
> Repo Sirfloppywaffle/the-last-lamp. Read AGENTS.md, CLAUDE.md, expansion/EXPANSION4_RUNBOOK.md (§2 to §4, and §5 art pass A2) and expansion/ART_UPGRADE.md. Build art pass A2's pilot: Ambrose the Lamplighter from PixelLab, 4 facings, walk and idle, through runbook §3, following the runbook's §4 workflow. Show him beside today's sprite, in the square and in a dark Lodge room (step 5: his lantern is the only light there until something is lit), and stop for Criss's verdict before redrawing anyone else. Tick the status table (step 5 is #143). End with the prompt for step 6.

### Step 6: The Peddler (Claude: Opus 5.5, high)

**Goal:** a new rescued soul. Found caged on the stair like the Croupier and the Toothmonger; once freed, he keeps a stall by the stairs (the Head-frame) in Saltmouth.

**Build:**
- Add him to `TOWN_SOULS` (the cage roll already picks from `cagePool()`, so no new stair roll). His stall is a building-like prop near the Head-frame with a keep tile in front of it.
- `#townAct` "Talk to the Peddler" opens his wares: **blueprints** (the three locked sets from step 4, curios) and **dyes** (rare colourways, tallow). His stock rotates after each descent: 3 items from the pool, rolled with a new salt `SALT.peddler = 27` keyed on a new counter `ll-town.trips` that rises only when a run ends (`victory()` / `defeat()`), so closing and reopening the town never rerolls it (*shape*).
- Pixel-art character 16×24, his own kit colours. A short, odd voice: he trades in things that washed up.

**Teach:** a tip, a rules line, a Grimoire entry. **Test** `tests/t/peddler.test.js`: he only appears once freed; stock survives closing and reopening the town, and changes only after a run ends; buying a blueprint unlocks the set; dev mode never writes.

- *As built (#148):* his barrow is two `#` tiles west of the Head-frame, (7, 10) and (8, 10), from PixelLab (one-direction object, 64 candidates at 32 on the town palette); he stands **beside** it at (9, 10), mirroring Voss on the other side of the frame, because its awning would hide him behind it; you stand at (9, 11). Shut, it is the same rows with nothing on it and a torn hem. Wares (`PEDDLER_WARES`, *shape*): the three locked sets' blueprints for 3, 4 and 5 curios, and four **rare dyes** (Drowned Green, Wreck-Gilt, Bone-White, Pearl) for 20 to 25 tallow; a rare dye bought joins the Dye button's cycle on every piece it changes (`dyeWays()`), after the piece's own, and costs `DYE_COST` to put on like any other. The stock is kept in `ll-town.wares` once rolled, so a buy shows "Sold" instead of pulling in a fourth. The Grimoire entry is a list of the souls freed from cages on its Kits tab (??? while caged). With three souls, the cage roll's `cagePool()` has one more name, so a seed that caged the Toothmonger before may cage the Peddler now (the door it hangs on is unchanged). His figure follows A2's way: candidates on #148 for Criss to pick, then the walk and idle; until then he stands as hand rows.

**Prompt:**
> Repo Sirfloppywaffle/the-last-lamp. Read AGENTS.md, CLAUDE.md, expansion/EXPANSION4_RUNBOOK.md (§2 to §4, and §5 step 6) and expansion/EXPANSION4_BRAINSTORM.md's decisions. Build Expansion 4, step 6 exactly as the runbook says, following its §4 workflow; draw the Peddler the way art pass A2 drew the Keepers and souls (expansion/ART_UPGRADE.md §4, Art 2, and its “Learned” notes): candidates on a contact sheet for Criss to pick before building on one, then the pick at game scale. Log him in ART_UPGRADE.md §6. Tick the status table (A2 is #144 and #145). End with the prompt for art pass A3.

### Art pass A3: scenery (Claude: Opus 5.5, high)

**Build:** `expansion/ART_UPGRADE.md` §4, Art 3: the buildings with their ruined, restored and lit states from one base each, the ground's tiles and edges, trees, fences, headstones, braziers, the Head-frame. `TOWN_MAP`, doors and keep tiles do not move. May split into A3a (buildings) and A3b (ground and props), each its own PR and the same version. **Test:** `town.test.js`, `townbuild.test.js`, `townGift.test.js` untouched; shots of the whole square.

**Prompt:**
> Repo Sirfloppywaffle/the-last-lamp. Read AGENTS.md, CLAUDE.md, expansion/EXPANSION4_RUNBOOK.md (§2 to §4, and §5 art pass A3) and expansion/ART_UPGRADE.md. Build art pass A3 exactly as ART_UPGRADE.md §4 says, through runbook §3, following the runbook's §4 workflow. Log every piece in ART_UPGRADE.md §6. Tick the status table. End with the prompt for step 7.

### Step 7: The village (Claude: Sonnet 5.5, high)

**Goal:** the square gets the same tools as the Lodge.

**Build:**
- New town pieces: lamp posts, benches, planters of black kelp, statues, a shell path, a plank boardwalk, more fences. They use step 1's tools, step 2's rotation and the Grid / Free switch.
- **Paint and trim:** each restored building has 3 muted palettes (*shape* cost in tallow).
- **Keepers' huts:** one small hut per freed Keeper, placed by you (a keep tile in front of its door). The Keeper walks there between chores.

**Test** `tests/t/village.test.js`; devices.

**Prompt:**
> Repo Sirfloppywaffle/the-last-lamp. Read AGENTS.md, CLAUDE.md, expansion/EXPANSION4_RUNBOOK.md (§2 to §4, and §5 step 7) and expansion/EXPANSION4_BRAINSTORM.md's decisions. Build Expansion 4, step 7 exactly as the runbook says, following its §4 workflow. Tick the status table. End with the prompt for step 8.

### Step 8: The Hearth Beacon (Claude: Opus 5.5, high)

**Goal:** the seed of the true ending: bringing the village out of the rain.

**Build:**
- The Hearth stands on the square (a fixed place, a keep tile). Feed it tallow and curios; it has levels (*shape*: 5).
- Each level thins the rain in a widening circle around it (fewer, fainter drops; the dark lifts a little) and reveals more of a drowned carving in the stone under the square.
- It changes **nothing** on the stair. Saved as `ll-town.hearth`.

**Teach:** a tip, a rules line. **Test** `tests/t/hearth.test.js`: rain density falls with level; carvings appear; no run field changes.

**Prompt:**
> Repo Sirfloppywaffle/the-last-lamp. Read AGENTS.md, CLAUDE.md, expansion/EXPANSION4_RUNBOOK.md (§2 to §4, and §5 step 8) and expansion/EXPANSION4_BRAINSTORM.md's decisions. Build Expansion 4, step 8 exactly as the runbook says, following its §4 workflow. Tick the status table. End with the prompt for step 9.

### Step 9: Keepers react (Claude: Sonnet 5.5, high)

**Build:**
- **Waypoints:** benches, the Hearth, the stove and armchairs are places Keepers go to when idle; each Keeper has a favourite set and lingers near it.
- **Lore chalk:** a Keeper whose favourite set stands near their post leaves a chalked note on the floor once (tap to read). A few lines each.
- **The cellar's tide:** brine rises a step after a death on the stair and drains after a win past floor 5 (*shape*). Risen water leaves kelp and barnacles on cellar pieces until the next win.

**Test** `tests/t/keepers4.test.js`.

**Prompt:**
> Repo Sirfloppywaffle/the-last-lamp. Read AGENTS.md, CLAUDE.md, expansion/EXPANSION4_RUNBOOK.md (§2 to §4, and §5 step 9) and expansion/EXPANSION4_BRAINSTORM.md's decisions. Build Expansion 4, step 9 exactly as the runbook says, following its §4 workflow. Tick the status table. End with the prompt for step 10.

### Step 10: Release v20.0.0 (Claude: Sonnet 5.5, low)

**Build:** no new features. Fix what Criss reported on steps 1 to 9. `GAME_VERSION = '20.0.0'`; move every Unreleased line in `docs/HISTORY.md` under `## v20.0.0 — Customization`; `cd tests && npm run design`; full `cd tests && npm test`; update `AGENTS.md`; set this table to done.

**Prompt:**
> Repo Sirfloppywaffle/the-last-lamp. Read AGENTS.md, CLAUDE.md, and expansion/EXPANSION4_RUNBOOK.md (§4, and §5 step 10). Release v20.0.0 exactly as the runbook says. Open the PR with a self-review; no /gemini.

---

## 6. If something here is wrong

The code wins over this file: fix it in the PR that proves it wrong. If a change would fight a decision in §2 or `AGENTS.md` §1, stop and write a **Decision needed** comment for Criss.
