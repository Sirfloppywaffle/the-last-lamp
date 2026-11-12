# Pixel stair runbook: the descent in pixel art

**Who this is for:** whichever AI picks up the next step, with no memory of earlier sessions. Read this file and `AGENTS.md` (§0 to §3, §6, and the code-map rows `the pixel board (pilot)`, `art`, `the Roster`). That is enough to start; do not read the whole of `index.html`.

**For Criss:** to hand off a step, start a **new session** and paste that step's **Prompt** (§5) with the repo link. One step, one PR. After you merge, **delete the PR's branch**.

**What this is.** Saltmouth is pixel art. The stair was painted. Criss reopened that on 10 Nov 2026 ("we are good to go full pixel"). The first floor's tiles and five creatures were piloted in #168, and the Roster's portraits followed in #169. This runbook takes the rest of the stair to pixel art, a piece at a time, without changing how anything plays.

---

## 1. Status (update this table in every step's PR)

| Step | What | PR | State |
|---|---|---|---|
| P0 | The pilot: the Cistern's floor, dais, grates, five creatures, lamplight on water | #168 | done |
| R | The Roster's five animated portraits | #169 | done |
| 1 | The five kit lamps | #172 | done |
| 2 | The base wards (nine: no kit builds the plain candle) | #173 | done |
| 3 | Kit wards and kit marks on the board (Lamplighter, Whaler) | | next |
| 4 | Kit wards and kit marks (Occultist, Galvanist, Bellringer) | | |
| 5 | What patrons lay on the floor, and the board's small effects | | |
| 6 | The rest of the creatures, and the horrors | | |
| 7 | The Ossuary (floor 2) | | |
| 8 | The Drowned Nave (floor 3) | | |
| 9 | The Throat (floor 4) and the Keeper Below | | |
| 10 | The Abyssal Heart (floor 5) and the Primordial | | |
| 11 | Heralds, rifts, forks and the Weir | | |
| 12 | The six descents (the mini-games) | | |
| 13 | Pixel becomes the default; the pilot's Settings switch goes | | |

**Order matters for 1 to 6** (they make the Cistern whole). Steps 7 to 12 can be reordered if Criss asks. Never start a step until the one before is merged into `main`.

---

## 2. Rules that apply to every step

1. **Nothing about play changes.** No radius, speed, cost, timing or hit box. A pixel thing is drawn where the painted one was. Balance changes: "none" in every PR. If a sprite is larger than the thing it replaces, say so; the game's own numbers stay.
2. **Pixel only where `pixOn()` says so.** Every new drawing path asks `pixOn()` (pixel chosen in Settings, art loaded, this floor has tiles) and falls back to the painted code. Painted stays the default until step 13. Never delete a painted painter before step 13.
3. **Everything that adds to the map or changes a look needs its pixel form** before a floor is called done. The list is in `AGENTS.md`, code-map row `the pixel board (pilot)`, under "What the pixel conversion must not forget". Each PR lists which of those the floor still paints.
4. **Layouts are data.** Tiles are laid from the path's own squares (`paintBoardPixel`). Never draw a map as one picture. Every map variant of a floor, and any map added later, must draw with no new art. `pixelboard.test.js` checks three maps; extend it for each floor.
5. **Keep each design.** A pixel creature or ward is the same creature or ward: same shape, colours, eyes, and what it shows of its state (a ward gone dark, a branch capstone, a trap sprung). Describe the painted one to PixelLab; do not invent a new look.
6. **Animate.** Criss asked for it by name: creatures that blink, look about, chomp, scuttle. Every creature gets a sheet of frames (`animate_image`), not one still. Wards move when they act (fire, ring, flicker).
7. **Lite and Reduce Motion.** Anything drawn every frame is left out under `gfxLite`, and anything that moves holds its first frame under `reduceMotion` (rule 18).
8. **No per-frame garbage** (rule 17). Sprites are cached; a per-frame painter walks flat arrays and makes no objects. `getImageData` only when building a cached sprite, never in `render()`.
9. **One step, one PR, off `main`.** Do not stack PRs. If you must, set the next PR's base to `main` only after the first is merged, and tell Criss to delete merged branches: #166 and #167 merged into their stacked bases and never reached `main` until #168 carried them.
10. **Size.** `index.html` is about 2.15 MB. Each step says in its PR how many KB of art it adds. Keep sheets as palette PNGs (`Image.quantize`) where that loses nothing.

---

## 3. Art: how a piece is made

All new art is PixelLab (`.mcp.json`; tools named `mcp__pixellab__*`). About 600 generations were left on 11 Nov 2026; the allowance refills on the 29th. Check `get_balance` first and say in the PR how many a step used.

- **A sprite:** `create_image_pixflux`, 64 by 64 (wards and lamps: 32 by 48 or 48 by 48), `no_background: true`, `view: "low top-down"`, `outline: "selective outline"`, `shading: "detailed shading"`, `detail: "highly detailed"`. One generation. End every prompt with "dark muted palette, eerie, lit by warm lamplight".
- **Its animation:** `animate_image` with `first_frame_url` set to the sprite's download URL (`https://api.pixellab.ai/mcp/images/<job_id>/download`), `frame_count: 8`. One generation at 64 by 64. Say only what moves. Frame 0 comes back as the input; frames 1 to 8 are new. **Look at every frame**: the generator sometimes turns the subject into something else after a few frames (the Skitterling became a moth; only frames 0 to 2 were kept). Use the frames that hold, and play them forward and back (`seq`) if they do not loop.
- **When the first try loses the design** (step 2: the effigy came back a teddy, the trap a ring, the ballista diagonal): draw the painted piece alone at the sprite's size in the page (`drawWard(c,t,tm,true)` with a 46 px unit), upload it (`get_upload_url`, one curl) and generate again with `init_image_url` set to it, strength 200 (a real redraw) to 330 (close to the paint). Its geometry carries over, so its anchor and scale are known.
- **Stable bodies:** an animation may redraw the still parts a little each frame. Keep one frame's body and take only what moves from the rest (step 2's candle: the flame rows).
- **A floor's tiles:** `create_topdown_tileset`, `tile_size` 32, `transition_size` 0.25, `shape_style: "square"`, `raggedness` 0.1. Lower terrain is the path, upper is the floor, the transition is the kerb between. One generation. Fetch `/mcp/tilesets/<id>/image?inline=true` and `/metadata`; the metadata gives each tile's four corners, which become that floor's row in `PIX_AT` (key: NW 8, NE 4, SW 2, SE 1; upper is 1).
- **Clean up in Python (PIL), in the scratchpad, never in the repo:** centre each sheet on the middle of everything it covers across all frames; mirror it if it does not face right; remove any ground the generator painted under it. Then base64 the PNG into the game.
- **Where it goes:** tiles and props in `PIX_SRC`, creature sheets in `PIX_SRC.foes` with a row in `ART_PX` (`n` frames, `seq`, `period`, `ext`, `eye`). `eye(r,g,b)` picks the pixels the dark keeps: test it by looking at the creature in the dark.

---

## 4. The workflow for every step

1. New branch `claude/<topic>` from `origin/main`. Read the step's prompt and the functions it names. Check that each piece can be built in play before making its art: a kit's `wards`, `KIT_WARDS`, `learnable()` (step 2 made a plain candle no kit can build).
2. Make the art (§3). Look at it enlarged before using it.
3. Wire it in behind `pixOn()`. Keep the painted path.
4. Tests: `cd tests && npm run check`, then the step's own test and `node run.js --only pixelboard`. In Claude's cloud container follow `.claude/skills/test-setup/SKILL.md` (no `npm install`). The full suite takes about 20 minutes; run it once before the PR, in the background. `devices` fails there on one Copy-button width and passes on CI.
5. Screenshots at the Fold's three shapes (`.claude/skills/shots/SKILL.md`), with a painted one beside a pixel one.
6. Docs in the same PR: a line under **Unreleased** in `docs/HISTORY.md`; the code-map row in `AGENTS.md`; this file's status table.
7. Draft PR in the shape of `.claude/skills/steward/SKILL.md`, then a self-review (`.claude/skills/self-review/SKILL.md`). The PR lists what the floor still paints (rule 3).
8. Watch CI. A red check is yours to fix before Criss is asked to merge.

---

## 5. The steps

### Step 1: the five kit lamps

**Why first:** the lamp is the centre of every screen and the smoothest thing on a pixel floor.

**Was:** `drawLamp(c,x,y,tm,k,style)` painted it in unit space (about 0.8 units tall); `style` is `kit()`. Only the Galvanist (the arc lamp) and the Bellringer (the bell) had their own painters; the Lamplighter, the Whaler and the Occultist shared one lantern (the Whaler's Blubber Lamp is a ward, step 3). The lamp's branches (`lstat()`) and madness change the light and rings round it in `render()`, not `drawLamp`.

**Done (step 1):** five sheets, `pixLamp()`, `drawLamp(…,board)`; see the code map row `the pixel board (pilot)`.

**Build:** a sheet per kit (a still body and four to six flame frames), drawn by a `pixLamp()` that `drawLamp` hands over to when `pixOn()` and the call is for the board. Madness tiers flicker and shrink the lamp: keep whatever `drawLamp` does for them. Icons elsewhere may stay painted in this step; say so.

**Test:** on a pixel Cistern each kit's lamp draws from its sheet and differs from the others; painted floors are untouched; Reduce Motion holds one frame.

**Prompt:**
> Read `expansion/PIXEL_RUNBOOK.md` and `AGENTS.md`. Do step 1, the five kit lamps, as one PR off `main`. Read `drawLamp()` first and keep everything it shows (kit style, branches, madness). Follow the runbook's §2 to §4.

### Step 2: the ten base wards

**Was:** `drawWard(c,t,tm,icon)` painted all wards, on the board and as tray icons. "The ten base wards" are `BASE_WARDS` (Candle, Harpoon, Salt, Chime, Trap, Tithe, Effigy) and `GIFT_WARDS` (Chime, Censer, Coil, Whaling Gun `lance`). What it showed: for every ward the capstone's ring (`hasCap(t)`), a shadow away from the lamp (not salt or trap) and a pip per branch level; the candle's flame (redder with the Ember branch) or, cut off, a snuffed wick with smoke; the harpoon and the gun turning to aim (`t.ang`), the gun kicking back (`t.recoil`); salt fading as it dissolves (`t.dur/t.max`) with a twinkle; the chime's bones swaying, hard when it rings (`t.ring`), and its ring spreading; the trap open, or shut with a jolt (`t.snap`) and its reset creeping round (`t.cd`); the tithe's glow and coins when it pays (`t.ping`); the effigy's eyes pulsing; the censer's coals, smoke and sparks; the coil's sphere and its arcs, more when it fires. Every kit builds its own candle except the Bellringer, and every kit trims the harpoon (bolt head and foot). Dark is otherwise drawn in `render()` (a grey ring and slash over the dark), and so is the Sealing Wax's red ring (step 5). The tray's icons are painted by `drawIcon()` through `drawWard(…,icon)`; `art/ui/ward` is one generic icon, not a ward's own.

**Done (step 2):** nine sheets, `pixWard()`, `WARD_PX`, `WARD_CAP`; see the code map row `the pixel board (pilot)`. A dark ward now holds still, and the effigy, censer and coil show their fire or eyes gone out. The tray's icons stay painted. **No plain candle** (Criss spotted it): every kit that builds candles builds its own, and the Bellringer can't learn one (`learnable()`), so the Candle Ward's tallow pillar is never built. Its pixel art was made and dropped; the kit candles are steps 3 and 4.

**Build:** a sprite per ward with the frames its states need (lit and dark at least; an acting frame; a capstone mark). `drawWard` hands over to a `pixWard()` on a pixel floor. Path wards (Salt, Trap) lie flat on the channel: draw them to sit on water. The tray icons stay painted.

**Test:** each base ward draws from its sheet on a pixel Cistern, shows dark when cut off, and the painted floors are untouched.

**Prompt:**
> Read `expansion/PIXEL_RUNBOOK.md` and `AGENTS.md`. Do step 2, the ten base wards, as one PR off `main`. Read `drawWard()` first and list every state it shows before making art. Follow the runbook's §2 to §4.

### Steps 3 and 4: kit wards and kit marks

Each kit builds its own versions of some wards and lays its own marks on the board. Find them from `WARDS` rows with `kit:` and from `wdef()`, and from the kit sections in `AGENTS.md`'s code map.

- **Step 3. Lamplighter:** Signal Candle, Flare harpoon, Signal Mirror and its beam, the threads between Signal Candles. **Whaler:** Blubber Lamp, Try-pot, lines and nets on creatures.
- **Step 4. Occultist:** bones on the path, Corpse Candles, Grasping Dead, the Risen. **Galvanist:** Pylons, live wires and arcs, Lightning Rods, the Arc Lamp, the Grounding Anchor's cage. **Bellringer:** Tuning Forks, Bell Wires, the Tocsin, cracks, shells, the path she hears in the dark.

Many of these are drawn over the dark in `render()` on purpose (wires glow, bones show for the candles). Keep that order.

**Prompt (step 3; change the names for step 4):**
> Read `expansion/PIXEL_RUNBOOK.md` and `AGENTS.md`. Do step 3: the Lamplighter's and the Whaler's own wards and marks in pixel art, one PR off `main`. Find every one from `WARDS` (`kit:`), `wdef()` and `render()` before making art, and list them in the PR.

### Step 5: what patrons lay on the floor, and small effects

The Drowned Mother's water (`drawWater()`), the Wrong Sun's bright spots, the Many-Mouthed's rings (Choir-Husk veil, Gibberer chatter). Also: salt bridges, burning pitch pools, wax seals, the Hallowed Ground's chalk, hex and stun rings, shots in flight (bolts, lances, pitch). Water must sit on pixel flagstones and on the channel alike.

**Prompt:**
> Read `expansion/PIXEL_RUNBOOK.md` and `AGENTS.md`. Do step 5: everything patrons and effects lay on the board, in pixel art, one PR off `main`. Walk `render()` top to bottom and list every thing it draws that is not a tile, a ward, the lamp or a creature; convert those.

### Step 6: the rest of the creatures, and the horrors

Done: Crawler, Skitterling (redo: only three frames held), Gnasher, Watcher, Shade. To do: Ichor Wretch (and its split), Shrieker, Drowned Choirmaster, Abyssal Stalker, Trench Behemoth, Gibberer, Gorger, Choir-Husk, the Bound Keeper. Horrors (`HORRORS`, `drawHorror()`) are bound creatures you field: give each its creature's sheet with a bound mark, as the painted ones do.

**Prompt:**
> Read `expansion/PIXEL_RUNBOOK.md` and `AGENTS.md`. Do step 6: every remaining creature as an animated sheet through `ART_PX` and `artOf()`, and the horrors, one PR off `main`. Look at each painted creature (draw it large with `drawCreature`) before prompting, and keep its design.

### Steps 7 to 10: the other four floors

For each: a tileset (path and floor in that floor's own materials), its props where the painted floor has them (`decoProp`, by the same squares and numbers), its glow marks (`paintGlow`: the Throat's veins, the Heart's fissures and eyes), a row in `PIX_AT`, and a look at all its maps. Floors 2 and 3 have **forks**; floors 4 and 5 have a **boss** (bosses paint live today, `A.live`: give each a sheet large enough for its size, or keep it painted and say so).

- **7. The Ossuary:** bone-packed niches, a dry aisle of bone and dust for the path, skulls, a chalk circle.
- **8. The Drowned Nave:** flooded tiles, an aisle of deeper water, pews and weed, coloured light.
- **9. The Throat:** flesh and cartilage, a wet red gullet for the path, teeth, pulsing veins. The Keeper Below.
- **10. The Abyssal Heart:** black glass with violet veins, closed eyes in the floor, fissures that glow. The Primordial.

**Prompt (step 7; change the floor for 8 to 10):**
> Read `expansion/PIXEL_RUNBOOK.md` and `AGENTS.md`. Do step 7: the Ossuary as a pixel floor, one PR off `main`. A Wang tileset, its props and glow, a `PIX_AT` row, and `pixelboard.test.js` extended to all of the floor's maps and its forks.

### Step 11: Heralds, rifts, forks and the Weir

The three Heralds (the Last Keeper, the Tithe-taker, the Bellfather) as sheets; rifts as broken floor (`pixRift` exists, and the painted swirl is still drawn over it in `render()`); the fork's markers; the Weir.

### Step 12: the six descents

The mini-games between floors (the Carry, the Mirror Stair, the Binding, the Cast, the Smothering, the Winch) are painted, each with its own painter in `DSC_GAME`. Criss: "the mini games might need to be updated to match the rest of the game". One PR each is safer than one for all six; ask Criss which first.

### Step 13: pixel becomes the default

When every floor is whole: `ll-board` defaults to pixel, the Settings note stops calling it a pilot, and the painted painters that nothing reaches are removed in their own PR. Ask Criss before deleting anything.

---

## 6. If something here is wrong

Fix this file in the same PR that proves it wrong, as with `AGENTS.md`. If a step turns out to be two, split it and add a row to the table.
