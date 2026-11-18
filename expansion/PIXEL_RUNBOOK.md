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
| 3 | Kit wards and kit marks on the board (Lamplighter, Whaler) | #174 | done |
| 4 | Kit wards and kit marks (Occultist, Galvanist, Bellringer) | #177 | done |
| 5 | What patrons lay on the floor, and the board's small effects | #179 | done |
| 6 | The rest of the creatures, and the horrors (wiring, binding, tests; first art) | #182 | done, with 6b |
| 6b | The creature redesign: Lovecraftian, from a brief (§5); creatures on every floor; icons from the sheets | #182 | done (all fourteen from his picks) |
| 6c | The Cistern redone in detail, to match the creatures (Criss, 18 Nov 2026) | | next |
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
2. **Pixel only where `pixOn()` says so.** Every new drawing path asks `pixOn()` (pixel chosen in Settings, art loaded, this floor has tiles) and falls back to the painted code. Creatures, horrors and bosses with a sheet are the exception since step 6b: they ask `pixFoes()` (pixel chosen, art loaded, any floor) through `artOf()`, so they look the same on every floor. Painted stays the default until step 13. Never delete a painted painter before step 13.
3. **Everything that adds to the map or changes a look needs its pixel form** before a floor is called done. The list is in `AGENTS.md`, code-map row `the pixel board (pilot)`, under "What the pixel conversion must not forget". Each PR lists which of those the floor still paints.
4. **Layouts are data.** Tiles are laid from the path's own squares (`paintBoardPixel`). Never draw a map as one picture. Every map variant of a floor, and any map added later, must draw with no new art. `pixelboard.test.js` checks three maps; extend it for each floor.
5. **Keep each design, except the creatures.** A pixel ward or lamp is the same ward or lamp: same shape, colours, and what it shows of its state (a ward gone dark, a branch capstone, a trap sprung). Describe the painted one to PixelLab; do not invent a new look. **Creatures are the exception** (Criss, 18 Nov 2026: the paint "were placeholders"; make them "more terrifying" and "more Lovecraftian"): step 6b redesigns them, keeping only what play needs (§5, step 6b).
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
- **A piece that keeps its paint's design starts from its paint** (step 6 did this for creatures; step 6b redesigns them instead, and a ward or lamp can still use it): draw it alone by `ART[type].draw` in its own box, shrink to 64 and give it as `init_image` at strength 250 (330 when a feature goes). Its anchor and size carry over, so `ext` is the box. Then animate from the result, and start the sheet at frame 1 (frame 0 is the input and pops).
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

**Done (step 3):** the Signal Candle and Blubber Lamp (`WARD_PX['candle:<kit>']`, 56 px frames), the Signal Mirror, the Try-pot, each of the two kits' harpoon head and foot (`WARD_PX.harpoon.kits`), and on the board the mirror's beam, the threads and Fire Threads, the Tether line and the haul's line, the net, the tangle and Kindle's flames; see the code map row `the pixel board (pilot)`. What it found: the kit candles are taller than a 48 px frame, so a ward row may carry `fh`; the Blubber and Try-pot animations redrew their fat and oil and threw fire into the pot's mouth, so only the flame and fire rows were taken (§3, stable bodies); the net came back a solid disc from text alone and held its mesh only from the painted net's own geometry (strength 350). The mirror's glass is cut from its stand so it can turn. Flare bolts' strikes and Starshell are lights (gradients in the dark) and stay so. For step 4: the Corpse Candle and Arc Lamp have no `WARD_PX` row yet and fall back to paint by kit; the other three kits' harpoons still call `harpoonHead`/`harpoonFoot`.

**Done (step 4):** the Corpse Candle, the Arc Lamp, the Pylon, the Risen, the Grasping Dead, the Tuning Fork, the Tocsin and the Bell Wire, each of the three kits' harpoon head and foot, and on the board the bones, the grid (planted rods, the Grounding Anchor's spike and cage, wires live, recharging and snapped), a caught specimen's cage, the coil's and the wires' arcs, Overload, the Static Burst, a pylon frying, the path she hears, the hums, footsteps, tolls, cracks, shells and the beat; see the code map row `the pixel board (pilot)`. What it found: wide lines of art pixels laid as overlapping squares add up under `lighter` (the toll's ring came out twice as bright), so `pixSeg` and `pixArc` lay each pixel once; and a frame of thousands of `fillRect`s costs (five toll rings at once, three Overloads), so runs on one row are one rect and the toll's soft wake stays a stroke. The Pylon's animation moved its glow into the mast and the arm's lost its fingers after three frames: the jar pulses in code, the fingers are pixelled on, and the Grasping Dead is one arm drawn once for every grip and a half left, as the paint draws it. The fork came back without its plinth; it stands on the Arc Lamp's. The Arc Lamp now shows its bulb grey while it flickers out in a wave (`arcOff`), which the paint never did. Echoes and ghosts of what she hears already come from each creature's sheet (`artSprite`). Unbind's charge and Borrowed Flesh's phantom are creatures (step 6).

**Prompt (step 3; change the names for step 4):**
> Read `expansion/PIXEL_RUNBOOK.md` and `AGENTS.md`. Do step 3: the Lamplighter's and the Whaler's own wards and marks in pixel art, one PR off `main`. Find every one from `WARDS` (`kit:`), `wdef()` and `render()` before making art, and list them in the PR.

### Step 5: what patrons lay on the floor, and small effects

The Drowned Mother's water (`drawWater()`), the Wrong Sun's bright spots, the Many-Mouthed's rings (Choir-Husk veil, Gibberer chatter). Also: salt bridges, burning pitch pools, wax seals, the Hallowed Ground's chalk, hex and stun rings, shots in flight (bolts, lances, pitch). Water must sit on pixel flagstones and on the channel alike.

**Done (step 5):** `render()` walked top to bottom. Converted, each behind `pxb` with its paint kept: her water (`pixFlood()`: a body and a sheet over the dark built into layers of art pixels by `waterLayers()` only when `F.waterLines` or the board's size changes, a Phosphor layer a stretch, `waterGlow()`; the current's lanes stepped by `pixLane()`; glints), her wake (`pixWake()`), the Wrong Sun's spots and Violet Husking (`pixSpots()`), burning pitch (`pixPools()`), salt bridges, Tallow's rim, wax seals, the selected ward's reach and the lamp's ring of fire (`pixGroundMarks()`), the husk's and Gibberer's rings and a slowed ward's, the effigy's reach, every mark on a creature and its health bar (`pixFoeMarks()`), shots in flight (`pixShot()`), the effects under and over the dark (`pixFxLow()`, `pixFxHigh()`), a soul to bind (`pixSoul()`), the Hallowed Ground's chalk (`pixHallow()`), the Bellfather's daze, a ward cut off, the madness's eyes, the motes, and the selection and placing outlines (`pixBox()`). Helpers: `pixEll()`, `pixRing()` (a turned ellipse), `pixDot()`, and `glowPx()`/`glowPut()`: a glow that is the mark itself (her water, a spot, pitch, a pitch shot) is the paint's own gradient sampled in a few bands, Bayer-dithered where they meet, built once a size into `GLOW_PX` and stamped on the grid. **No PixelLab art:** every one of these is a line, ring or glow in its paint; drawn on the grid they keep its shape and colours exactly. **Left as they were:** the dark and every light (pools of light, the lamp's bloom, `glowCv`), the fog, the madness's vignette and the hurt flash (washes over the whole screen), the floating numbers (text), creatures' ground shadows and Unbind's charge and the phantom (step 6), the Tithe-taker's sack, the rift's swirl and its red warning ring, the boss reveal (step 11), and the fork's chevrons and the Wisp, which no Cistern has (step 11).

**Prompt:**
> Read `expansion/PIXEL_RUNBOOK.md` and `AGENTS.md`. Do step 5: everything patrons and effects lay on the board, in pixel art, one PR off `main`. Walk `render()` top to bottom and list every thing it draws that is not a tile, a ward, the lamp or a creature; convert those.

### Step 6: the rest of the creatures, and the horrors

Done: Crawler, Skitterling (redo: only three frames held), Gnasher, Watcher, Shade. To do: Ichor Wretch (and its split), Shrieker, Drowned Choirmaster, Abyssal Stalker, Trench Behemoth, Gibberer, Gorger, Choir-Husk, the Bound Keeper. Horrors (`HORRORS`, `drawHorror()`) are bound creatures you field: give each its creature's sheet with a bound mark, as the painted ones do.

**Done (step 6):** ten sheets (the nine above and the Skitterling again), `ART_PX` rows, `pixBound()` and `drawHorror(…,board)`; see the code map row `the pixel board (pilot)`. 25 generations. What it found: **start a creature from its paint.** Each was drawn alone by its own `ART[type].draw` at 512 px, cropped round its anchor so it fills about nine tenths of the box, shrunk to 64 and given as `init_image` at strength 250; the box it was drawn in is its `ext`, so its size and anchor carry over with no measuring. Six held at 250; the Stalker (its long body), the Behemoth (its eyes), the Choir-Husk (its column of mouths) and the Gorger (its fangs) needed 330. **An animation's frame 0 is the input**, crisper and in other colours than the frames drawn from it, so it pops once a loop: the sheets start at frame 1. Small things the generator lost were put back by hand, frame by frame, as step 4 did the fingers: the Behemoth's eyes, the Gibberer's red eye (and its pale bump, which came back yellow), the Husk's two eyes, the Gorger's yellow eyes (so the dark keeps them and not its fangs), the Keeper's white fangs and slit pupils, and the Gorger's tongue (its animation tore it off after one frame). Horrors already drew their creature through `drawCreature`, so they, Unbind's charge and Borrowed Flesh's phantom follow the sheets with nothing more; only the binding's rings and runes were paint. The Cistern's own waves bring only the Crawler, Skitterling, Gnasher and Watcher, so most of these first show in play when floors 2 to 5 get their tiles (steps 7 to 10); on the Cistern they show as horrors, and `pixelboard.test.js` spawns them. Still painted on a pixel Cistern: the Heralds (step 11) and the bosses (steps 9 and 10); small creature icons (`foeShape`: the tray and the wave preview, painted everywhere). Creatures animate under Reduce Motion, painted or pixel, as before; the binding's runes hold.

**Prompt:**
> Read `expansion/PIXEL_RUNBOOK.md` and `AGENTS.md`. Do step 6: every remaining creature as an animated sheet through `ART_PX` and `artOf()`, and the horrors, one PR off `main`. Look at each painted creature (draw it large with `drawCreature`) before prompting, and keep its design.

### Step 6b: the creature redesign (Criss, 18 Nov 2026)

**Why.** Criss looked at #182: the Bound Keeper "looks good", the rest of the step's creatures "need a full rework in design". The painted creatures were placeholders; he wants them **more terrifying and more Lovecraftian**, with the detail of the Roster's portraits (`PORT_SRC`, Fable 5.2's work). Usage is no concern this cycle (Criss: a full reset to spend before the 20th; PixelLab refills on the 29th).

**Scope.** The ten sheets of #182: the Ichor Wretch, Shrieker, Drowned Choirmaster, Abyssal Stalker, Trench Behemoth, Gibberer, Gorger, Choir-Husk and Skitterling get new designs; **the Bound Keeper stays** (the design that worked). The pilot's five (Crawler, Gnasher, Watcher, Shade; the Skitterling is above) only if Criss asks. Work on #182's branch (`claude/jolly-dirac-zum88f`); its wiring (`ART_PX`, `artOf`, `pixBound`, `drawHorror(…,board)`) and `pixelboard.test.js` carry over: a new sheet is a new `PIX_SRC.foes` entry and its `ART_PX` row (`ext`, `eye`, `seq`).

**Also in 6b: the Keeper Below.** Criss likes the Bound Keeper. Make the boss (`boss`, floor 4) that same design, and pixel where he sees it:
- its sheet, large enough for its size (`FOES.boss.r` .6; it paints live today, `A.live`), drawn through `artOf()`;
- its reveal as it rises from the rift (`render()`, "the reveal": it reads `ART[e.type]` directly; make it read `artOf()` and draw the sheet);
- what it calls up: Skitterlings every 5 seconds (`update()`, `def.spawner`), so the new Skitterling;
- **it must show when reached through dev mode's floor jump.** Today nothing on floor 4 is pixel, because `pixOn()` asks that the floor have tiles and only the Cistern does. **Decision (recommended, Criss may overrule):** with Pixel chosen, creatures, horrors and bosses draw from their sheets on **every** floor (`artOf()` asks for the art and the setting, not the floor's tiles); tiles, wards and marks stay per floor (steps 7 to 10). Otherwise none of the redesign is seen until those steps. Rule 2 changes to match for creatures only, and `pixelboard.test.js`'s "every other floor is painted" check becomes "every other floor's tiles and wards are painted".

**Keep what play needs** (the redesign is free otherwise):
- **Silhouette and size**: each still reads at its board size and is told from the others at a glance. A tile is 31 CSS px on a folded Fold (28 sideways, 45 open; the board's canvas is at most 2 device px a CSS px), so a creature's art stands from about 14 CSS px (the Gibberer) to 66 (the Keeper). Its radius (`FOES[type].r`) does not change; `ext` sets how its box stands on that.
- **Colour key**: `FOES[type].col` is its colour in the wave preview, the Grimoire and the tray; keep the creature in that family (or change `col` and say so).
- **Eyes**: the dark keeps only the `eye()` pixels, so every design has eyes (or lights) that read in the dark, in colours nothing else on it uses.
- **What the lore says it looks like** (`LORE`): the Gibberer "small, pale and round, covered in mouths"; the Gorger "big and purple, with a gaping mouth and a long tongue; not the red, round Gnasher"; the Choir-Husk "tall, grey and hollow, with a column of black mouths". Change the lore with the look if Criss agrees, never one without the other.
- **Facing**: side-on creatures face right (mirrored walking left); front-facing ones get `flip:false`.

**Direction, a starting point per creature** (pitch something bolder if you have it; Criss prefers bold):
- **Skitterling** (a swarm, small and quick; the Wretch bursts into two; the Keeper Below calls them): a pale louse the size of a hand, too many jointed legs like finger bones, a cluster of red eyes, a small human mouth under them.
- **Ichor Wretch** (bursts into two Skitterlings): a sagging translucent sac of green ichor on stumps, two Skitterlings curled inside and visibly moving, eyes floating loose in the fluid, a split grin leaking.
- **Shrieker** (its cry hastens all near it): a skinned, throat-shaped thing; the whole front a ringed lamprey mouth, a ruff of torn membrane that flares when it screams, a crown of small red eyes.
- **Drowned Choirmaster** (an elite; its hymn hastens): a towering drowned priest, robes heavy with barnacles and weed, a cephalopod head whose tentacles hang over an open ribcage where small drowned faces mouth the hymn, both arms raised conducting, cyan eyes.
- **Abyssal Stalker** (veiled, fast): a gaunt deep-sea eel with a human jaw of long needle teeth; its lure is a tiny lantern, a false lamp, the one warm light on it.
- **Trench Behemoth** (heavy, unstoppable): a huge armoured isopod, plates crusted with barnacles and bone, a face half-sunk in its head plate, many slow legs, small black eyes.
- **Gibberer** (the Many-Mouthed's; small, pale, round): a pale bald head on spider legs of fingers, covered in human mouths with human teeth that chatter out of time, one red eye.
- **Gorger** (big, purple, a gaping mouth, a long tongue): a bloated bruise-purple gut on short legs, the whole belly a vertical maw of crooked teeth, a long prehensile tongue that tastes the air, small yellow eyes.
- **Choir-Husk** (tall, grey, hollow, a column of black mouths): a flayed chorister's shell stood upright, hollow through the ribs, a column of black mouths singing down its front, a tatter of surplice, two pale points of eye.

**How** (§3 still holds; what is new):
1. **Show Criss designs before animating anything.** For each creature, three or more candidates (text-first `create_image_pixflux`, or `create_image_pro` where it gives more detail), on a 128 px canvas for the look; pick the strongest, put them on one contact sheet beside the current sheet and post it on #182 for Criss. Animate only what he picks.
2. **Board size is the real test**: shrink the pick to its board size on a pixel Cistern (`drawCreature` at its `r`) and check it still reads, lit and in the dark, before animating.
3. **Sheets**: 64 px frames as now for the small ones (their box is 38 to 66 canvas px on a folded Fold). The Behemoth, the Choirmaster and the Keeper stand 113 to 148 canvas px folded and 165 to 215 open, where a 64 px sheet is blocky (see the Keeper in the lineup), so give them 128 px frames (a frame size on their `ART_PX` row; `pixFrame` reads 64 today); `animate_image` from the chosen frame, start the sheet at frame 1 (§3), hand-fix what an animation tears (step 6's notes).
4. **Lore and Grimoire** follow any look that changes (rule 23 does not apply: nothing about play changes).

**Candidates (posted on #182, 18 Nov 2026; waiting on Criss's picks):** 44 designs, four or five a creature and four for the Keeper, one sheet a creature with the current sheet as card 0, and a lineup of the roster at real size. The sheets and every raw 128 px design are on the orphan branch `claude/shots-creature-redesign`: `creature-redesign/cand/<creature>-<n>.png`, numbered as on the sheets, and `picks.json` (each one's PixelLab job and index, and whether it was mirrored to face right). What it found: `create_image_pro` at 128 px (10 generations for four) far outdid `create_image_pixflux`, which came back tame, faced the wrong way and dropped the eye cluster and the mouth. A second, bolder prompt (the Skitterling as a hand, the Wretch as a drowned corpse, the Choirmaster as a bishop, a more human Gibberer, the Gorger's maw in its belly) gave several of the best. **Eyes are the hard part:** they are 2 or 3 px at 128 and vanish when halved, and the dark keeps only them, so set them by hand on each pick, big enough to survive the board's shrink, before the dark check. `pixFrame` shrinks by nearest when a sprite is under 64 px (every small creature on a folded Fold), which drops thin legs and lone eye pixels; consider drawing smoothed when it shrinks. Beside the new designs the pilot's four (Crawler, Gnasher, Watcher, Shade) look cartoony; Criss was asked whether to redo them. 153 generations.

**Done (step 6b, Criss's ten picks, 18 Nov 2026):** the Skitterling 1, the Wretch 2, the Shrieker 1, the Choirmaster 2, the Stalker 1 (with option 4's bare lantern: he wanted the lantern to glow, not sit on a painted disk of light), the Behemoth 1, the Gibberer 2, the Gorger 1, the Husk 1 and the Keeper 1 (red for the Keeper Below, a palette shift to magenta for the Bound Keeper); he also asked for the pilot four to be redone (candidates posted on #182) and for creatures on every floor. What it found: **pin the last frame.** `animate_image` with `last_frame_url` set to the first frame gives a loop, so every sheet plays forward (`PX_RUN`), frames 1 to 8. **Animate on a 144 px canvas** with the 128 px design in the middle: several designs touch their edge, and a limb cannot move past it. The small ones are then area-averaged into 64 px frames (the union of every frame's extent fills 62 px; `ext` is set so the creature stands as big as before), the Choirmaster, the Behemoth and the Keeper keep 128 px frames (`fs`) uncropped. **Eyes:** a colour test inside a head region on the 144 px frames (teeth, gums and highlights share eye colours), carried through the shrink only where an eye covers 30% of a pixel, kept at least 2 by 2, and given palette entries no other pixel of the sheet is within 3 of; `pxEye()` lists them. Where the generator drops a one-pixel eye between frames (the Choirmaster, the Gorger, the Husk), the head is tracked against frame 0 and the eye set back. Dark reds were brightened in the palette so they burn in the dark. The Keeper shuts its eyes as its maw gapes (four frames of eight), so its `seq` holds the open frames longer. The Gibberer's animation grew a yellow speck on its crown, cut away against frame 0's outline. **The board shrinks small sprites:** on a folded Fold a Skitterling's sprite is about 40 px from a 64 px frame, and `pixFrame()` now shrinks smoothly and picks the eyes before shrinking, so legs and eyes are not dropped. The reveal draws the boss straight from its sheet (`drawCreature(…,{big:true})`). About 205 KB of sheets in place of 43 (+163 KB, the three 128 px sheets and the boss's own about half of it). 153 generations for the candidates, 50 for the pilot four's, 30 for the ten animations. **The pilot four** followed (Criss's picks: Crawler 1, Gnasher 2, Watcher 2, Shade 2) the same way, 12 generations; the Gnasher stays red and round, as its lore says; the Shade turns its head away in its frames, so its eyes are tracked and set back. **Icons:** with Pixel chosen, `foeShape()` hands over to `pixIcon()`: the wave preview's, the Grimoire's and the lesson cards' creatures come from the sheets (their first frame, fitted by what it covers, `A.bb`), run or no run; `ART_ICONS` is cleared when the art loads or the board art changes. **Walking** (Criss: "walking animations for creatures with legs so they don't look like they're just hovering"): each creature with legs, and the Keeper Below on its tentacles, has a second animation from the same drawing, walking in place, prompted "it stays centred and does not move across the frame" with its last frame pinned to its first (all ten held at the first try, 3 generations each). `build.py` frames it with the loop (frames 8 to 15, `wseq`) so the box never jumps, and `artFrameOf()` steps it by the ground covered (`e.d`), a cycle every `stride` tiles (chosen so each walks one to four strides a second at its own speed; tune by eye). Horrors, the robed, the flying and the Shrieker keep their loops. Every sheet is now a 96-colour palette (no visible loss), which paid back part of the walk frames' size: about 105 KB more. **Next, Criss:** the Cistern now looks plain beside them (step 6c).

**Prompt (6b):**
> Read `expansion/PIXEL_RUNBOOK.md` and `AGENTS.md`. Do step 6b, the creature redesign, on #182's branch. Read the brief in §5 first. Show me candidates on #182 before animating anything.

### Step 6c: the Cistern redone in detail (Criss, 18 Nov 2026)

**Why.** Criss, after the redesign: "redesign first floor for a more detailed floor to match the creatures. It stands out now in comparison." The pilot's floor (P0, #168) is one quick 32 px Wang set: flat flagstones, a plain channel, grates. Beside the 6b creatures (128 px designs, detailed shading) it reads as plain.

**Build.** A new Cistern at the creatures' level of detail: wet, cracked, moss-veined flagstones with worn edges; a channel of dark water with depth, silt and a kerb carved to meet it; and the floor's props (grates, drains, chains, bones, stubs of candles) at the same detail. Keep what the pilot got right: tiles laid from the path's own squares (§2.4), every map of the floor drawn with no new art (`pixelboard.test.js` checks three), its row in `PIX_AT`, `pixWater()`'s lamplight on the channel, the dais and the rifts, and the creatures standing out from the floor in the light and in the dark. Try `create_tiles_pro` beside `create_topdown_tileset`; a tile more than 32 px is fine if it reads better, but the board's grid does not change.

**How.** As 6b: candidates first, posted on the PR as a contact sheet (a stretch of each floor laid from a real map, with the creatures standing on it at their real size, lit and in the dark), and nothing wired until Criss picks. **Steps 7 to 10 are made at this level of detail from the start.**

**Prompt (6c):**
> Read `expansion/PIXEL_RUNBOOK.md` and `AGENTS.md`. Do step 6c: the Cistern redone in detail to match the creatures, one PR off `main`. Show me candidates on the PR before wiring anything.

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
