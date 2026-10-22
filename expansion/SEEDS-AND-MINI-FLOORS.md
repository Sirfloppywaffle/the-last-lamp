# Expansion 2, first pass: seeds and mini floors

**Status:** ideas only. Nothing here is built, and nothing changes the game. No changes to `index.html`, `tests/`, `tools/` or `.github/` (see `README.md`).
**From Criss:** this is the second expansion, so right now we only brainstorm. Two ideas so far: a **seed system** (#95) and **mini-game floors** between the main floors. More ideas get added here (see section 5).
**Who:** Claude drafted it, Gemini reviewed it (round 1, below), Criss steers. Round 1 is settled; what remains open is in section 4.

---

## 0. Round 1: where it landed

**Agreed by Claude and Gemini:**
- Mini floors sit **on the descent**, not behind a landing room.
- A mini floor can **fail** (a cost) but **never ends a run**. Bosses stay all-or-nothing (`AGENTS.md` §1).
- Mini floors pay **no embers**. A replayed stair pays no embers either.
- **Pilot two:** The Carry and The Mirror Stair. Six remains the goal.
- Seeds: every run gets a name, **Descend the same stair** on the death screen, the default stays random.

**Gemini was right, and Claude changed its mind:**
- **Rolls are pure functions** of (seed, floor, salt). No saved stream position, so a resume cannot drift. (Claude had proposed a per-floor stream with a saved position.)
- **Seeded runs never touch the `ll-maps` bag**, which would otherwise be corrupted by a replay.
- **A tap-to-copy seed code** on the death and pause screens; **typing or pasting a seed is dev mode only** for now.
- **Cut:** The Bone Field (it overlaps Knucklebones), The Narrow Door (a second tower-defense floor, which Claude's own rules ban), The Drowning Stair (button mashing, off-tone), The Bell Below (fails on mute).
- **Replaced** by two of Gemini's: **The Winch** and **The Smothering** (section 2.4).

**Where Claude held its ground:**
- Gemini's **Snare Line** (a timing tap) and **Black Tide** (no clear challenge yet) are not counted until each has a real mechanic. Gemini's `hash(seed, floor, 'mini')` would return NaN (rule 11: `hash()` needs three numbers; a missing argument gives NaN, and so does a string), so rolls use a small integer hash, not `hash()`.
- Gemini's review said it checked thumb comfort on a 412×860 screen and cited `mapDraw` at line 805 (it is near line 1851). A review cannot test a thumb, so only Criss's playtest settles comfort.

**How long a floor really takes (Criss, 1× speed):** floor 1 is about **3 minutes**, floor 2 about **8 minutes**. Gemini guessed 2 to 4, which is only true of the shortest runs. Mini-bosses, relics and patrons make the player stop and think, so floors run long and uneven.
- **What this changes:** a 15 to 40 second mini floor is a small fraction of a floor, so Gemini's pacing worry (its strongest objection) is real but smaller than it assumed. Between long, think-it-through floors, a short tactile one reads as a contrast, not an interruption.
- **What it does not change:** the cap. **Target 15 to 40 seconds, never over 45**, embedded in the sinking shaft rather than stopping it. Claude's call; Gemini may object.

---

## 1. Seeds (#95)

A **seed** is one number that fixes a run's dice, so the same seed gives the same stair: same maps, doors, omens, waves and offers.

- **The seed:** a 32-bit number made when a run starts, kept in `run`. An old save has none and plays unseeded, as today (rule 15).
- **The name:** words from short lists in the game's voice (rule 21), chosen from the seed's bits: "the Brine-Hollow stair". Shown on the pause, death and win screens, with a short code (for example `BRINE-7F2A`) and a **Tap to copy** button.
- **Rolls are pure.** A stair roll is `roll(seed, floor, salt, i)`: a small integer hash that returns 0 to 1. Each decision owns one fixed integer `salt`, and `i` counts draws inside it (a shuffle uses `i = 0, 1, 2…`). Salts are never reused or renumbered, or old seeds change.
- **Stair rolls** (pure): map draw, wave cards, doors, omens, rooms, offers, patron offers, events, and later the mini floors offered. **Mid-fight rolls** (spawn gates, patron tosses, combat jitter) stay on `Math.random`, so the same stair plays differently if you play differently.
- **Maps:** a seeded run takes its map from `roll(seed, floor, SALT_MAP)` and **never reads or writes `ll-maps`**.
- **Replay:** **Descend the same stair** starts a new run with the saved seed. It pays **no embers** (pillar 2: no farming a known easy stair).
- **Dev mode:** shows a **paste a seed** box. It shows, never saves (rule 24).
- **Default stays random** (pillar 5). **Later:** a daily stair (the date as the seed; there is no server, so players compare by text).

**Checked:** §1 untouched (touch only; bosses all-or-nothing; difficulty unchanged). Pillars 2, 4 and 5 hold. Rule 23: a first-time tip and a "How the dark works" line, no Grimoire entry (nothing new to catalogue). Rule 24 above.

**Riskiest part:** one stair roll left on `Math.random`, or one whose salt depends on what the player did, makes the same seed give a different stair. A test should walk floors 1 to 5 twice with one seed and compare everything. A resume at each landing step must give the same next floor.

**Touches:** `newRun`, `beginFloor`, `mapDraw`, `makeDoors` / `makeRoom` / `draftOptions`, `patronOffer`, wave decks, `resumeFrom()`, the death and win screens, `tests/hook.js` (which pins map 0).

---

## 2. Mini floors (Criss's idea)

Short sub-floors between main floors, each a different game mechanic, but small. Six is the goal. From floor 2 on, you may be offered some of them between floors.

### 2.1 The mini floor *is* the descent

Today `descend()` applies the toll, plays `showMap()` (a lantern sinking down the shaft, passive), then `beginFloor()`. **Make that drop playable.** A door on the forked stairs can carry a mini-floor glyph, like the Trial door to floors 2 and 3. Take it and you play a short touch game on the shaft, then the next floor begins.
- **No new place in the run.** It reuses the door step (`makeDoors`, `F.draft`), the toll (applied once, where it is now) and the map overlay (real time, rule 14).
- **Saves (rule 15):** `F.descent` and `MAP_SYS` are never saved. Checkpoint at the mini floor's start; a resume restarts it.

### 2.2 Rules every mini floor follows

- **About light, the price, or the dark** (pillars 1 and 2).
- **15 to 40 seconds, never over 45.** Never a second tower-defense floor.
- **One thumb, touch only, readable on a folded Fold** (rules 1 to 6, pillar 4); nothing covers what you need to see, nothing shifts. Test all 14 sizes.
- **A different verb each.** Building is taken by the main game.
- **Each pays a different currency and costs something**, so the choice matters (pillar 5): light, oil, sigils, essence, a ward tier, a rite charge; at the price of madness, oil or a tighter toll.
- **Failing costs; it never ends the run.**
- **Offered, not forced:** the plain descent stays the default. A door carries a mini floor, drawn with a pure roll, so a replayed stair offers the same ones. Never the same one twice in a run.
- **Teach (rule 23):** a first-time tip each, a line in "How the dark works", a Grimoire page (**Descents**).

### 2.3 Where they appear

Landings after floors **2, 3 and 4** (the gaps 2→3, 3→4, 4→5). Floor 1→2 stays plain: floor 1 is where you learn. The last floor has no descent.

### 2.4 The six

| # | Name | Status | Verb | What you do | Pays | Costs |
|---|---|---|---|---|---|---|
| 1 | **The Mirror Stair** | **pilot** | route | As the lantern sinks, drag 2 or 3 mirrors to bounce its beam onto wall sconces. Each one lit is kept. | light: the next floor's lamp burns wider for its first wave | each missed sconce stays dark |
| 2 | **The Carry** | **pilot** | hide | Hold your thumb to cup a small flame through a gallery of sleepers. Show light too long and they stir; hold too long and you stumble. | oil | madness for every sleeper woken |
| 3 | **The Winch** | candidate (Gemini) | steer | The cable snags on the way down. Drag the lantern left or right past black ribs and reaching arms to catch a falling flask or purse. | oil, or an essence purse | a snag costs oil |
| 4 | **The Smothering** | candidate (Gemini) | order | Black fumes rise the tube. Snuff three wicks in the order of their brightness, dimmest first, before they reach the lamp. | oil refilled | madness for a wrong snuff |
| 5 | *open* | needs a mechanic | | Gemini's **Snare Line** (cut tangled lines at tension notches) is a timing tap. Is there a spookier verb? | | |
| 6 | *open* | needs a mechanic | | Gemini's **Black Tide** (drag weights onto the lantern through a torrent) has no clear challenge yet. | | |

**Cut:** The Bone Field, The Narrow Door, The Drowning Stair, The Bell Below (reasons in section 0).

All numbers above are *shape, not balance*. Balance is its own later PR (rule 22).

### 2.5 Risks

- **The Smothering** needs brightness to be distinguishable on a phone in a dark scene. Test it on a Fold, not a headless screenshot.
- **Reward order.** The toll cuts everything but salvage to 30% when you descend. A mini-floor reward granted **after** the toll skips the cut, which would make a purse the best essence in the game. Decide the order before balance (section 4).
- **Do not become a minigame collection.** A player should leave a mini floor hungrier for the lamp, not relieved to be out of the tower defense.
- **Mirror Stair needs the Signal Mirror's beam logic** (`mirror` ward). Reuse it, don't copy it.
- **Tests:** each mini floor needs a headless hook (run it, set the outcome, assert the reward and cost), and a 14-size layout check.

---

## 3. Action plan

| # | Step | Who / model | Effort |
|---|---|---|---|
| 1 | Update this doc to round 1 (this commit) | Claude, Sonnet 5.5 | medium |
| 2 | Rewrite #95 with the pure-roll design | Claude, Sonnet 5.5 | low |
| 3 | **Build seeds:** name, copy button, same-stair replay, no embers on replays, dev paste, tests, tip, rules line | Claude, Opus 5.5 | high |
| 4 | **Build the descent mini-floor frame and The Carry** | Claude, Opus 5.5 | high |
| 5 | **Build The Mirror Stair** | Claude, Opus 5.5 | high |
| 6 | Criss plays both on the PR previews; decide on the other four | Criss | |
| 7 | Balance numbers, in their own PR | Claude, Opus 5.5 | high |

Each build is a normal feature PR against `index.html`, reviewed as usual (a self-review while Gemini is paused, or `/gemini re-review` when Criss asks), with tests, tips, rules lines and Grimoire entries (rule 23). Criss says when an idea graduates.

---

## 4. Still open

1. **Reward order:** do mini-floor rewards land before or after the toll? [Claude's call: after the toll, but essence rewards are capped small, so the stair's price still bites. Revisit at balance.]
2. **Mini floors 5 and 6:** what are they? Needs a mechanic, not a mood.
3. **Criss's additions** (section 5).

## 5. Criss's additions

*(Criss adds his further Expansion 2 ideas here, and Claude folds them into the plan.)*
