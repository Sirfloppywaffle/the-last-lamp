# Expansion 3 runbook: Saltmouth, steps 3 to 10

**Who this is for:** whichever AI picks up the next step, Claude or Gemini (Jules), with no memory of earlier sessions. Read this file, `AGENTS.md`, and `expansion/EXPANSION3_TOWN.md` §0. That is all the context you need.

**For Criss:** to hand off a step, paste the step's **Prompt** (below) to Claude or to Gemini, with the repo link. Each prompt is self-contained. After each merge, the AI that did the work ticks the status table.

---

## 1. Status (update this table in every step's PR)

| Step | What | PR | State | Version |
|---|---|---|---|---|
| 1 | Design doc (`EXPANSION3_TOWN.md`) | #116 | merged | — |
| 2 | Pixel compiler, the square, rain, light, Keeper sprite, Head-frame, Walk Saltmouth, `ll-town` | #117 | merged | 18.10.0 |
| 3 | The haul | #119 | merged | 18.11.0 |
| 4 | Build mode: paths, lights, fences, trees, headstones of past runs | #122 | merged | 18.12.0 |
| 5 | Keepers in town, Take the lamp (swap kit), chores | #123 | merged | 18.13.0 |
| 6 | Workshops and the one town gift, with its price | #124 | merged | 18.14.0 |
| 7 | Rescued souls: the cage, the Drowned Oar, the Toothmonger | #127 | merged | 18.15.0 |
| 8 | The three shrines and the tide-pools | #129 | merged | 18.16.0 |
| 9 | The Keeper's Lodge (one room) | #130 | merged | 18.17.0 |
| 10 | Release v19.0.0 | #133 | done | 19.0.0 |

**Order matters.** Each step builds on the one before. Never start a step until the previous PR is merged into `main` (Criss merges after playing the preview).

---

## 2. Rules that apply to every step

**Read these sections of `AGENTS.md` before writing code: §1 (decisions), §2 (review shape), §3 (workflow), §6 (all 25 rules).** The ones that bite in the town:

1. **Additive only.** Criss: "We're not changing anything to the game itself, just adding to it." The town meets the game only at its seams: the title, `newRun()`, the end of a run (`victory()`, `defeat()`), the landing (step 7 only), `descend()` (step 3 only), and the run's start (step 6 only). Floors, waves, wards and descents do not change.
2. **Pixel art, §0.4.** No anti-aliasing (every pixel fully opaque or clear), integer scale only, a dark low-contrast ground, light only from small warm sources, outlines one shade darker than the fill (pure-dark outlines on characters only). Characters 16×24. The stair stays painted.
3. **Rule 24: developer mode never writes `ll-town`.** Use `townData()` and `townSave()`; they already handle it. Never call `store.set('ll-town',…)` yourself.
4. **Rule 15: saves.** `ll-town` only grows: add fields with defaults in `townFix()`, never rename or remove one. `ll-save-v2` stays loadable: anything new in `run` needs a default when an old save resumes (`resumeFrom()`).
5. **Rule 11b: stair rolls.** Anything the town changes about what the stair offers is applied *after* the seeded roll, as a filter, and saved in `run`. A new roll goes through `seeded(SALT.<new>,…)` with a new salt **added at the end of `SALT`** (the next free number is 27). Never reuse or renumber a salt.
6. **Rule 23: teach every change.** Each step ships a `TIPS` entry (town tips use `where:'town'` and show on the town's card, see §3), a line in `#rulesList` (the existing `<li><b>Saltmouth.</b>…` line grows; add another `<li>` only for a big new system), and a Grimoire entry for any new creature, ward, rite, relic, kit or patron.
7. **Rule 22: balance.** Every number is "shape only" until Criss plays it. List every new or changed number in the PR, old → new.
8. **Pillar 2 (§0.3): every gain has a price.** Only one town gift per descent. Chores pay town materials only, never embers or anything on the stair.
9. **The gift is off** on a replayed stair (`run.replay`) and on any floor under a Trial (`F.trial`). Every run is seeded, so "off on seeded runs" would mean "off always": never write that.

---

## 3. How the step 2 code works (read once, then work from this)

For the patterns as they stand after step 9 (the `#townAct` offer, town tips, the Lodge's scene switch, the devices test), see `.claude/skills/town-patterns/SKILL.md`.

Everything is in `index.html`, in the section `/* ---------------- Saltmouth (Expansion 3, the town above the stair) ---------------- */`, just before `/* ---------------- loop ---------------- */`. Search for these names.

**Data**
- `TOWN_MAP`: 24 strings of 24 characters. `^` rock, `~` sea, `#` building, `H` Head-frame, `o` brazier, `T` tree, `+` grave, `|` fence: solid (`TOWN_SOLID`). `.` earth, `,` cobbles, `=` deck: walkable. Change the map only by editing these strings, keeping each 24 long.
- `TOWN_HOUSES`: `{x,y,w,h,door,win,lit,ruin,chim,crypt}` in tiles. The Lodge is the first (x 1, y 8, 5×4, a ruin); the Drowned Oar is the third (x 16, y 16, a ruin).
- `PX`: the shared palette, one character per colour. `TOWN_KITS`: each Keeper's own colours (uppercase letters), head rows per facing (`d`, `u`, `r`; `l` is mirrored), body marks, tool, and `em` (letters that glow through the dark).

**The compiler** (all run once, cached)
- `tp(c,x,y,ch,w,h)` paints pixels in a palette colour. `tRows(c,rows,x,y,pal)` paints rows of characters. `tOutline(cv)` adds a dark outline. `tCanvas(w,h)` makes a canvas with smoothing off.
- `townKeeper(kit,face,step)` → `{c, em}`; `townSprites()` caches all of them.
- Props are painted one canvas each: `townHouse(b)`, `townFrame0()` (the Head-frame), `townBrazier()`, `townTree(tx,ty)`, `townGrave(tx,ty)`, `townFence(tx,ty)`.
- `townArt()` builds everything once into `TOWN_ART = {ground, props, lights, em, spr, …}`.
  - `props` are `{c, x, y, base}` in world pixels; `base` is the y of the bottom of their footprint, and they are drawn in order of `base` with the Keeper slotted in. **To add anything that stands up (a lamp, a fence, a person), push a prop with the right `base` and re-sort.**
  - `lights` are `{x, y, r, f}`: a pool of light at world pixels, radius in art pixels, `f` how much it flickers (0 for steady). `em` are things drawn again after the dark (glowing panes, flames).
- **Since step 4**, `TOWN_ART` is rebuildable: `props0`/`lights0`/`em0` and `ground0` are the fixed square; `townDecoSync()` lays what is built over them (call it after anything changes `townData().decos`). **A new building or person must not be walled in:** add the tile in front of its door or station to `TOWN_KEEP`, and `townCanPlace()` refuses any piece that would cut it off (since step 5 `townReaches()` needs **every** place in `TOWN_KEEP` to be reachable, and `townFix()` drops, newest first, any saved piece that would wall one in). Step 5 put every Keeper's station and workplace there; **a workshop in step 6 that stands on a Keeper's workplace must move that workplace in `TOWN_STAND`** (the Nameless and Agathe share the two tiles before the crypt, because the cemetery's side pockets are sealed). If a step turns earth into building tiles, `townFix()` already drops (and pays back) any piece that stood there.

**State**
- `TOWN` (kept in `ll-town`) via `townData()`; `TOWN_DEV` is developer mode's copy. `townFix(t)` merges any stored shape onto the defaults `{v:1, startInTown:false, px, py, visits}` and keeps unknown fields, so a later step adds `res`, `graves`, etc. there.
- `TWN` is one visit (never saved): `p` (Keeper's feet, in tiles), `path`, `goal`, `ptr` (the thumb), `near` (what `#townAct` offers, from `townNearAct()`), `card`, the canvases `buf`/`mask`, `k` (device pixels per art pixel).

**Flow**
- `townOpen()` (from Walk Saltmouth, or at launch with Start in Saltmouth) shows `#townOverlay`; `townClose()` saves where you stood; `newRun()` calls `townClose()`.
- `frame()` calls `townFrame(raw)` → `townStep(dt)` (walk or steer, slide on what is solid, the deck's button) → `townDraw()`.
- Taps: `townTapTile(tx,ty)` (in build mode it hands over to `townBuildTap()`; a headstone is walked to and read). `#townAct`'s label and action come from `townNearAct()`: return a new thing there to offer it. A tap on the Head-frame walks to the deck and calls `townDescend()` (the Roster, or the saved-run question). **To make a new thing tappable (a person, a door, a shrine), add a branch in `townTapTile` that sets `TWN.goal` to its id, path to the tile in front of it, and act in `townStep` where `TWN.goal==='frame'` is handled.**
- The town's buttons are DOM over the canvas: `#townBack` (top-left), `#townAct` (bottom centre, one button that shows near something: reuse it for every "Talk to…", "Enter the Lodge" action: `townNearAct()` returns the thing, `townActLabel()` gives its text, and the button's click handler acts on it), `#townCardWrap`/`#townCard` (the tip card). Add anything new to `.town-hud` at the top, never over the middle of the canvas.
- **Town tips:** a `TIPS` entry `{where:'town', when:()=>false, title, text}`; show it once by adding it to the chain in `townShowTip()`, or for a thing you just opened, `TWN.tipFor=key; townShowTip();`.

**Tests**
- `tests/hook.js` exposes `__t.TWN`, `townOpen`, `townClose`, `townData`, `townSave`, `townTapTile`, `townStep`, `townDraw`, `townFrame`, `townPathTo`, `townFree`, `townSolid`, `townSprites`, `townArt`, `townDescend`, `TOWN_MAP`, `TOWN_KITS`, `TOWN_DECK`, `setDev(v)`, `townReset()`, and each later step's functions on a line of their own. Add new functions there when a test needs them.
- `tests/t/town.test.js` is the model for town tests. `tests/t/devices.test.js` has a Saltmouth block per device (search `Saltmouth (Expansion 3)`); extend it when you add UI.

---

## 4. The workflow for every step (do all of it, in order)

1. **Start:** `git fetch origin main`, branch `claude/town-<topic>` (Claude) or `jules/town-<topic>` (Jules) from `origin/main`. Check open PRs and issues first (REST: `gh api repos/Sirfloppywaffle/the-last-lamp/pulls?state=open`; `gh pr list` uses GraphQL, which Claude's sessions can't reach).
2. **Build** to the step's spec below. Keep the diff inside the Saltmouth section and the named seams.
3. **Teach it** (rule 23), add the **HISTORY** line under Unreleased, bump **`GAME_VERSION`** to the version in the status table, update the **AGENTS.md** code map's Saltmouth row and storage keys if names changed, and tick the **status table** above.
4. **Test:** `cd tests && npm test`. New test file per step (named in the spec), and extend `devices.test.js` for any new button or panel. If you change a data table, `npm run design` and commit `docs/DESIGN.md`.
   - **Known flake:** `winch.test.js` fails about 1 run in 3 on `main` too. Rerun it alone before blaming your change.
   - **Claude's cloud container:** skip `npm install` and `npx playwright install`. Playwright and Chromium are preinstalled and resolve globally (`NODE_PATH`, `/opt/pw-browsers`); installing the pinned 1.56 breaks the launch (delete `tests/node_modules` if it exists). `node run.js --only <name>` runs one test. Details: `.claude/skills/test-setup/SKILL.md`. If no browser at all (Jules may hit this): run `npm run check`, say so in the PR, and rely on CI.
5. **Screenshots:** look at `tests/.build/shots/` yourself. Push the ones that matter (folded Fold portrait and landscape, unfolded, iPhone sideways) to an orphan branch `claude/shots-<topic>` with a README "Never merge this branch", and link them in the PR as `https://raw.githubusercontent.com/Sirfloppywaffle/the-last-lamp/<commit sha>/<path>.png`.
6. **Open the PR** with: *Try this first* (numbered, what Criss taps on his Fold), *What and why*, *How it was tested*, *Risks*, *Balance changes* (every number, or "none"). End with the attribution line your tool asks for.
7. **Self-review** as a PR comment in the AGENTS.md §2 shape (Verdict, Strongest objection, Bugs, Design, Checked). Be harder on yourself than on a stranger. **Don't comment `/gemini`.**
8. **End your reply to Criss** with the next step's prompt (copy it from §5 and adjust anything your step changed).

---

## 5. The steps

Numbers marked *shape* are for playtest. Model and effort are Claude's settings; on Gemini, use its strongest model.

### Step 3: The haul (Claude: Opus 5.5, medium)

**Goal:** every run brings something up. Timber, iron, tallow and curios collect during a run and are credited to the town once, at its end.

**Build:**
- `run.haul = {timber:0, iron:0, tallow:0, curios:0}` in `newRun()`; `resumeFrom()` gives an old save `{0,0,0,0}`.
- A named table `HAUL = {floor:{timber:8, iron:5}, herald:{iron:8}, boss:{tallow:5, curios:1}, tollPer:20}` (*shape*).
- `floorCleared()`: add `HAUL.floor`. `killFoe()`: on a Herald add `HAUL.herald`, on a boss `HAUL.boss` (find how the code already tells them apart, e.g. how heralds pay a relic).
- **The toll renders tallow:** in `descend()`, `burned` already holds the essence the stair takes. Add `Math.floor(burned/HAUL.tollPer)` tallow. A death's last floor pays no toll, so nothing renders there.
- **Credit once:** one function `haulCredit()` adds `run.haul` to `townData().res` (a new field, default `{timber:0,iron:0,tallow:0,curios:0}` in `townFix()`), calls `townSave()`, then zeroes `run.haul` and checkpoints. Call it from `victory()`, `defeat()`, and wherever a saved run is thrown away (the kit picker's `go()` calls `clearSave()`: credit the old save's haul first, from `lastSave.run.haul`). It must never pay twice across a reload: write `ll-town` and clear the haul in the same synchronous turn, and mark `run.haulPaid=true` before writing so a reload of the death screen sees it.
- Developer mode: hauls show on screen but `townSave()` writes nothing (rule 24).
- **Show it:** a line on the death and morning screens ("You haul up 16 timber, 10 iron, 4 tallow."), and the town's totals in `.town-hud` as four small counts with fixed widths (rule 2; DM Mono, like `.dsc-stat`).

**Teach:** `TIPS.haul` (town card, first time totals are above zero); the Saltmouth rules line gains one sentence on the haul and the toll rendering tallow.

**Test** `tests/t/haul.test.js`: haul adds on floor clear, Herald, boss; tallow equals `floor(burned/20)`; a reload mid-run and a reload on the death screen credit exactly once; an old save resumes with an empty haul; developer mode never writes `ll-town`; abandoning a saved run credits it. Extend `devices.test.js`: the death screen's haul line fits; the town's counts sit inside the safe area and don't move as they change.

**Prompt:**
> Repo Sirfloppywaffle/the-last-lamp. Read AGENTS.md, CLAUDE.md, expansion/EXPANSION3_RUNBOOK.md (all of §2 to §4, and §5 step 3), and expansion/EXPANSION3_TOWN.md §0. Build Expansion 3, step 3 (the haul) exactly as the runbook says, following its §4 workflow: branch, tests, screenshots, PR, self-review in the AGENTS.md §2 shape, no /gemini. Tick the runbook's status table. End with the prompt for step 4 from the runbook.

### Step 4: Build mode (Claude: Opus 5.5, high)

**Goal:** spend the haul on the square: paths, lights, fences, trees, and headstones of past runs.

**Build:**
- `ll-town` gains `decos: [{id, c, r}]` and `graves: [{kit, floor, wave, foe, seed, date}]` (last 12 deaths). `defeat()` pushes a grave (seed from `run.seed`; skip in developer mode by using `townSave()`).
- `TOWN_DECOS` table (*shape* costs): Wet Cobblestone 2 iron, Boardwalk 2 timber, Iron Street-Lamp 6 iron + 4 tallow (light r 40), Brazier 8 iron + 6 tallow (light r 50), Wrought-Iron Fence 3 iron, Blood-Lichen Tree 8 timber + 4 tallow (2×2), Mossy Headstone 5 iron (binds to the oldest unplaced grave). Draw each with the existing painters (`townTree`, `townGrave`, `townFence`, `townBrazier`) or a new `town<Name>()` painter in the same style.
- A **Build** button in `.town-hud` toggles build mode: a tray along the bottom (in `.town-actwrap`'s place, same height, so nothing shifts), the item's footprint shown green or red on the tile under the thumb; tap to place, tap a placed item to pick it up (refunds all of it, §7 of the draft). Only on walkable, non-deck tiles; never where it would block the only way to the Head-frame (re-run `townPathTo` from spawn to the deck after each placement and refuse if it fails).
- Placed paths change the ground: repaint only that tile into `TOWN_ART.ground`. Placed solids join `TOWN_SOLID` checks via a `Set` of blocked tiles that `townSolid()` consults.
- Headstones: a tap reads the epitaph ("Here lies Jonah Tolland. Floor 4, wave 3. Taken by the Keeper Below on the Brine-Hollow stair.") with a Copy button for the seed (reuse `seedLine()`'s button pattern).

**Teach:** `TIPS.build`; the rules line gains build mode and headstones.

**Test** `tests/t/townbuild.test.js`: place, pay, refund; can't place on deck, on solid, or where it cuts off the Head-frame; lights add pools (luminance rises at that tile); graves capped at 12, oldest dropped; headstone shows the right seed; developer mode never writes. Devices: the tray fits every size and nothing moves when build mode opens.

**Prompt:**
> Repo Sirfloppywaffle/the-last-lamp. Read AGENTS.md, CLAUDE.md, expansion/EXPANSION3_RUNBOOK.md (§2 to §4, and §5 step 4), and expansion/EXPANSION3_TOWN.md §0. Build Expansion 3, step 4 (build mode) exactly as the runbook says, following its §4 workflow. Tick the status table. End with the prompt for step 5.

### Step 5: Keepers in town, Take the lamp, chores (Claude: Sonnet 5.5, high)

**Goal:** the Keepers you have unlocked stand in the town; talk to one to carry the lamp as them; set one to a chore.

**Build:**
- Each unlocked kit other than the one you carry stands at its station (*shape* spots: Ambrose by the east house, Jonah at the south overlook, the Nameless in the cemetery, Voss by the Head-frame's east footing, Agathe by the crypt). Locked Keepers don't walk; their station stands dark and a tap shows the deed that frees them (`kitHow(k)`). Unlocked = `!kitLocked(k)`.
- They idle: 2 frames (rows 0 to 11 shift down one pixel), using `townKeeper()` sprites. They face you when you come within 2 tiles.
- Walk near one: `#townAct` reads "Talk to Jonah Tolland". The talk card shows their line (the idle barks in the draft §10.1, kept to rule 21's voice) and two buttons: **Take the lamp** (sets `meta().lastKit` through the same code as the kit picker's `go()`, not saved in developer mode; your sprite swaps) and **A chore** (one slot; two from step 9's Lodge, so leave room).
- Chores (§0.3): pay town materials only, credited with the haul in `haulCredit()`. *Shape:* Jonah 15 tallow a floor cleared, Ambrose 12 timber, Voss 8 iron, the Nameless 1 curio per 3 floors, Agathe 5 timber and 5 iron. Saved as `ll-town.chore = kit|null`. A Keeper on a chore stands at their workplace, not their station.

**Teach:** `TIPS.keepers`, `TIPS.chore`; rules line.

**Test** `tests/t/keepers.test.js`: only unlocked Keepers stand; Take the lamp changes the kit the next descent starts with, and the Roster's pre-selection; developer mode doesn't save it; chore pays only materials, once, through `haulCredit()`.

**Prompt:**
> Repo Sirfloppywaffle/the-last-lamp. Read AGENTS.md, CLAUDE.md, expansion/EXPANSION3_RUNBOOK.md (§2 to §4, and §5 step 5), and expansion/EXPANSION3_TOWN.md §0. Build Expansion 3, step 5 exactly as the runbook says, following its §4 workflow. Tick the status table. End with the prompt for step 6.

### Step 6: Workshops and the one town gift (Claude: Opus 5.5, high)

**Goal:** restore workshops with the haul; carry **one** gift down per descent, and pay its price on the stair.

**Build:**
- `ll-town.buildings = {brazier, quay, smithy, belfry, menagerie}` tiers 0 to 2 (*shape* costs from the draft §6.1, tier 1 and 2 only). Each is a building on the map (add to `TOWN_HOUSES` / `TOWN_MAP` where the draft's districts put them; extend the map only by turning earth tiles into building tiles). Ruined at tier 0, restored at 1, lit windows at 2.
- Each restored workshop offers its gift (the table in `EXPANSION3_TOWN.md` §0.3, gain and price). Pick one at its door before going down; `ll-town.gift` holds the pick.
- **At the seam:** `newRun()` copies the pick into `run.gift` (unless `run.replay`), and it shows as one seal in `#relBar` (`renderRelics()`; a `.relchip` with its own glyph, tap shows its text in `#relTip`). The gift's gain and price are read where they act: lamp size (`lampBase()`), merchant prices (`price()`), rite charges (`chargesNow()`), wave preview (`renderPreview()`), a bound Watcher in `run.roster` and its madness, essence. Each does nothing on a floor with `F.trial`. Write every effect as one guarded `if(run.gift==='…')` so it is greppable.
- The Loaded Bone's roll is a stair roll: new `SALT.townGift = 25` at the end of `SALT`.
- Pawned Relic and the shrine's candle come in steps 7 and 8; leave them out of the table here.

**Teach:** `TIPS.gift` (town) and one tip per gift the first time it acts on the stair; Grimoire: gifts are not relics, so add them to the Relics tab under a "Town gifts" heading only if it fits; rules line.

**Test** `tests/t/townGift.test.js`: one gift at most; each gift's gain and price both happen; off on `run.replay` and under every Trial; the same seed gives the same Loaded Bone; old saves have no gift. **List every gift number in the PR.**

**Prompt:**
> Repo Sirfloppywaffle/the-last-lamp. Read AGENTS.md, CLAUDE.md, expansion/EXPANSION3_RUNBOOK.md (§2 to §4, and §5 step 6), and expansion/EXPANSION3_TOWN.md §0 (0.3 is the gift table). Build Expansion 3, step 6 exactly as the runbook says, following its §4 workflow. Tick the status table. End with the prompt for step 7.

### Step 7: Rescued souls (Claude: Opus 5.5, high)

**Goal:** a cage on a landing holds someone from Saltmouth; free them and they open a place in town.

**Build:**
- **The cage:** a new stair roll with **`SALT.cage`** (26; built as `cageDoor()`, called from `toFork()` after the descent doors are rolled and before the Binding's gate, so `makeDoors()` and every old seed's doors are untouched): on the landings after floors 2, 3 and 4, at most once a run, one door may carry a cage instead of a room (never a Trial door, never a descent door). Behind it: pay 15 essence (*shape*, never below 0) to free them, or walk past. Saved in `run.rescued` and credited with the haul.
- Who: the Croupier (opens the Drowned Oar), the Toothmonger (opens the stall). Already rescued souls are not caged again (`ll-town.rescued`).
- **The Drowned Oar** (third in `TOWN_HOUSES`, now restored when rescued): a table to play Knucklebones against the Croupier for town materials, reusing `bonesPractice()`'s table with a wager of timber or tallow (no essence, no embers). The Loaded Bone gift (step 6) moves here if it fits better.
- **The Toothmonger's stall:** trade materials at fixed rates, and the **Pawned Relic** gift: pick one non-cursed relic that is never offered this descent, price 25 tallow (§0.3). Filter it out of `relicPool()` after the roll, never before (rule 11b).

**Teach:** tips for the cage door, the Croupier and the Toothmonger; rules lines; Grimoire: the two as people under Roster, if that tab fits, else a line in the rules.

**Test** `tests/t/rescue.test.js`: the cage roll is pure (same seed, same landing, same door); never on Trial or descent doors; a rescued soul is never caged again; the pawned relic is never offered and seeds stay identical otherwise (`seeds.test.js` must still pass unchanged).

**Prompt:**
> Repo Sirfloppywaffle/the-last-lamp. Read AGENTS.md, CLAUDE.md, expansion/EXPANSION3_RUNBOOK.md (§2 to §4, and §5 step 7), and expansion/EXPANSION3_TOWN.md §0. Build Expansion 3, step 7 exactly as the runbook says, following its §4 workflow. Tick the status table. End with the prompt for step 8.

### Step 8: Shrines and tide-pools (Claude: Sonnet 5.5, high)

**Goal:** the patrons' shrines in the cemetery, and tide-pools on the shore.

**Build:**
- Three shrines in the north cemetery (inside the fence, on its free tiles), each built for 25 iron, 25 tallow, 2 curios (*shape*). Pixel art in the crypt's style; each with its patron's colour (her brine, the Sun's gold, the Mouths' violet).
- **A black candle** at one shrine is that descent's one town gift (shares `run.gift` with steps 6 and 7: a gift with a `soul` or `workshop` opens by `townGiftOpen()`; give the candle its own test there): that patron's offer is among floor 1's, and its Attention starts at 1 (`addAtt()`). Applied after the seeded roll, the way step 7's `unpawn()` filters the Pawned Relic. Leave the south overlook's new stall (tiles 4–5, row 18) and the souls' tiles in `TOWN_KEEP` clear.
- **Tide-pools:** three spots on the south overlook (add a short stair down to the shore if the map needs it). Each refills after every descent with a small stack of one material (*shape*: 3 to 6) or, rarely, a bottle with a lore line. Tapped to collect. Use `Math.random`, not a stair roll; they are not on the stair.

**Teach:** tips for shrines and pools; rules line.

**Test** `tests/t/shrines.test.js`: one gift total across workshop and shrine; the patron's offer appears on floor 1 and its Attention is 1; seeds unchanged otherwise; pools refill once per descent and never in developer mode's saved state.

**Prompt:**
> Repo Sirfloppywaffle/the-last-lamp. Read AGENTS.md, CLAUDE.md, expansion/EXPANSION3_RUNBOOK.md (§2 to §4, and §5 step 8), and expansion/EXPANSION3_TOWN.md §0. Build Expansion 3, step 8 exactly as the runbook says, following its §4 workflow. Tick the status table. End with the prompt for step 9.

### Step 9: The Keeper's Lodge (Claude: Opus 5.5, high)

**Goal:** step inside the Lodge: one 10×10 room, the library reference (diamond red-brown floor, shelves of coloured spines, green and amber lamps, a ritual circle).

**Build:**
- Restoring the Lodge (first in `TOWN_HOUSES`) costs 30 timber, 15 iron (*shape*); it loses its roof hole.
- Its door: `#townAct` "Enter the Lodge" swaps the town's map for a room map (a second `TOWN_MAP`-like array, a second ground, its own props and lights), same renderer. Leaving puts you outside the door.
- Floors (3), walls (3) and furniture (desk with a green banker's lamp, stove, ritual rug, armchair, shelves) placed with step 4's build tray, refunded in full.
- **The Grimoire shelf:** its spines fill with `codex()` progress (one spine per creature met and relic found). Tapping it opens the Grimoire with `openBook('town')`; add a `'town'` case where the book closes (it checks `BOOK.from`) so closing it returns to the Lodge, not the title.
- **Second chore slot** (step 5) opens with the Lodge.

**Teach:** tips for the Lodge and the shelf; rules line.

**Test** `tests/t/lodge.test.js`: enter and leave keep your place; the shelf's spine count matches the codex; furniture refunds; developer mode never writes.

**Prompt:**
> Repo Sirfloppywaffle/the-last-lamp. Read AGENTS.md, CLAUDE.md, expansion/EXPANSION3_RUNBOOK.md (§2 to §4, and §5 step 9), and expansion/EXPANSION3_TOWN.md §0. Build Expansion 3, step 9 exactly as the runbook says, following its §4 workflow. Tick the status table. End with the prompt for step 10.

### Step 10: Release v19.0.0 (Claude: Sonnet 5.5, low)

**Build:** no new features. Fix anything Criss reported on steps 2 to 9. `GAME_VERSION = '19.0.0'`; move every Unreleased line in `docs/HISTORY.md` under `## v19.0.0 — Saltmouth Above` with a one-line summary; `npm run design` if any table changed; full `npm test`; update `AGENTS.md` (§4 "The game in one page" gains a Saltmouth bullet; §1 notes the town is done); set this runbook's status to done. Skip the artifact mirror unless Criss says otherwise.

**Prompt:**
> Repo Sirfloppywaffle/the-last-lamp. Read AGENTS.md, CLAUDE.md, and expansion/EXPANSION3_RUNBOOK.md (§4, and §5 step 10). Release v19.0.0 exactly as the runbook says. Open the PR with a self-review; no /gemini.

---

## 6. If something here is wrong

The code wins over this file. If a function named here was renamed or a number changed on Criss's word, fix this runbook in the same PR (AGENTS.md: "fix it in the same pull request that proves it wrong"). If the change would fight §0 of `EXPANSION3_TOWN.md` or a decision in `AGENTS.md` §1, stop and write a **Decision needed** comment on the PR for Criss.
