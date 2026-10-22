# Expansion 2, first pass: seeds and mini floors

**Status:** ideas only. Nothing here is built, and nothing changes the game. No changes to `index.html`, `tests/`, `tools/` or `.github/` (see `README.md`).
**From Criss:** this is the second expansion, so right now we only brainstorm. Two ideas so far: a **seed system** (#95) and **mini-game floors** between the main floors. More ideas get added here (see section 5).
**Who:** Claude drafted it, Gemini reviewed it (round 1, below), Criss steers. Round 1 is settled. Round 2 (Criss's **Binding** idea, the failure cost, and mini floor 6) is folded in at section 5 by Claude, Sonnet 5.5, and has not been reviewed by Gemini. Round 3 folds in Criss's answers on the pledge and picks mini floor 6 (The Cast); it is Claude's too, and equally unreviewed. What remains open is in section 4.

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
| 5 | **The Binding** | **chosen (Criss)** | draw | Trace three different sigils, each a short connect-the-dots path, before the lantern sinks past the creature it holds. A wrong stroke resets only that sigil. | a bound horror, named on the door | the **pledge**: what you put up is forfeit on failure (5.2) |
| 6 | **The Cast** | **chosen (Criss)** | aim | Drag back and loose a weighted line at three iron rings on the swaying shaft wall; the cable sways, so lead it. Each ring caught is kept. | a rite charge | each line cast is weighted with a tenth of your essence, caught or not (5.3) |

Gemini's **Snare Line** (a timing tap) and **Black Tide** (no clear challenge) stay out; The Cast takes the one verb nothing else uses (aim).

**Cut:** The Bone Field, The Narrow Door, The Drowning Stair, The Bell Below (reasons in section 0).

All numbers above are *shape, not balance*. Balance is its own later PR (rule 22).

### 2.5 Risks

- **The Smothering** needs brightness to be distinguishable on a phone in a dark scene. Test it on a Fold, not a headless screenshot.
- **Reward order.** The toll cuts everything but salvage to 30% when you descend. A mini-floor reward granted **after** the toll skips the cut, which would make a purse the best essence in the game. Criss decided it (section 4): rewards land after the toll, and balance keeps essence rewards small. The Binding pays no essence and takes its pledge from post-toll essence, so the order does not matter for it (5.2).
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
| 6 | Criss plays both on the PR previews; decide on The Winch and The Smothering (The Binding and The Cast are chosen) | Criss | |
| 7 | Balance numbers, in their own PR | Claude, Opus 5.5 | high |

Each build is a normal feature PR against `index.html`, reviewed as usual (a self-review while Gemini is paused, or `/gemini re-review` when Criss asks), with tests, tips, rules lines and Grimoire entries (rule 23). Criss says when an idea graduates.

---

## 4. Still open

**Closed by Criss (round 3)**
- **Mini floor 5** is **The Binding** (5.1) and **mini floor 6** is **The Cast** (5.3).
- **Reward order:** rewards land **after the toll**; essence rewards stay capped small so the stair's price still bites. The Binding sidesteps it (5.2). Balance numbers come later.
- **The pledge (5.2):** (a) the two kinds, an essence share and a relic, are right; (b) the word is **pledge**; (c) the relic is **a random pull of 3 non-cursed relics, and you pick which one**, and the **pledge card** lets you choose the kind, greying out a kind you cannot pay (5.2); (d) a reload mid-mini-floor restarts it with the pledge still out: **accepted**.

**Still open**
1. **Relic pledge, to revisit after a playtest:** a pull of 3 where you pick one lets a player with several relics offer the least-loved. Tune the pull then.
2. **Mini floors 3 and 4** (The Winch, The Smothering): candidates, to decide after Criss plays the pilots.
3. **Criss's additions** (section 5): The Binding is folded in. More still welcome.

## 5. Criss's additions

*(Criss adds his further Expansion 2 ideas here, and Claude folds them into the plan.)*

### 5.1 The Binding (Criss), round 2

- **What you do.** The lantern sinks past a creature held in its light. Three different sigils come one at a time, each a short path through a field of 5 to 7 dots. Trace each in order with one thumb; dots snap, and a wandering stroke resets only that sigil. All three before the lantern passes the creature, about 25 to 35 seconds (inside the 45 cap).
- **Pays:** one bound horror into `run.roster`, fielded like any other, so it carries its madness (pillar 2). Never essence, never embers (section 0). The creature is named on the door and chosen by a pure roll, like the rest of the stair.
- **Offered:** only to kits that field horrors. Never the Galvanist (`gridKit()`): the same filter as Swallowed Sigils and the relic `needs` filter (v18.5.0). At most once a run (section 2.2).
- **Tone:** it fits the existing violet sigil. Today you *tap* a sigil a kill leaves; here you *draw* one. Pushback: that makes the tap feel thin, and a skilled player could farm horrors. The once-a-run cap and the kit filter hold that down; if Criss finds it overlaps, the horror kind on the door can be one the player cannot get by the tap.

### 5.2 The failure cost: the pledge

**Call: adopt the stake, narrowed. In-game it is a *pledge*** ("You lay 60 essence on the stone."). "Stake" reads as gambling, and Knucklebones already owns that. Gambling pays double; a pledge only comes back.

**Rejected costs, for the record**
- (a) 3 madness: it tangles with the Occultist (bound-horror madness feeds his spears and deed) and the Many-Mouthed's dread.
- (b) Cap horrors in the first wave, (c) one more creature next wave: nothing for a kit with no horrors, almost nothing for a strong build.
- **A few oil:** a rounding error for builds that lose none.
- **Oil as the stake:** it shrinks as you get stronger (anti-scaling), and it is what ends a run, so a weak build spirals. Never.
- **A bound horror as the stake:** Criss said losing one horror a stair "was no curse, especially for the Occultist" (v18.5.0, Choir in the Walls), and it is nothing to the Galvanist.
- **A ward:** wards are stripped every floor (`floorCleared`); only the buildable list persists, and losing one touches the tray, trees and Trials. Too many systems for a 30-second floor.
- **A cursed relic:** fail on purpose and shed the curse. Excluded.

**The one rule that stops it being income: pledge only what you would arrive with.** The pledge is taken *after* the toll (`descend()` applies the toll, then the map, then `beginFloor()`), from the essence that survived. A win returns exactly that, no interest, so there is nothing to farm and no way to dodge the toll. The reward is separate and is a horror, not essence. A win is your baseline plus the reward; a failure is your baseline minus the pledge.

**What can be pledged (two kinds):**
1. **An essence share** of what you arrive with (one table number, say a quarter). It scales with the build, and a poor run pledges little, so it cannot spiral. Not offered if it would be under the Knucklebones floor of 20, or if essence is in debt (the Ossuary Key's credit).
2. **A relic**, for when you hold one that is not cursed. This is the tooth that stops it being dull. **Criss's call (round 3):** the game pulls **3 of your non-cursed relics at random and you pick which one** to put up. Build order: **essence first**; the relic pledge second, because losing a relic needs a lose-relic path that undoes side effects (below).

**The pledge card (Criss and Claude, round 3).** Taking the Binding door opens one card with two buttons: **Essence (N)** and **A relic**. The player chooses the kind.
- **Essence is greyed** if what you would arrive with is under 20, or essence is in debt.
- **Relic is greyed** if you hold no relic, or only cursed ones, with a line saying why ("Only cursed relics. The stone won't take them."). It stays visible when greyed, so players learn it exists. Cursed relics never count, so a failure cannot shed a curse (rejected costs, above).
- **If both are greyed,** the door shows as the plain stair and cannot be taken as the Binding.
- **Back out:** the card has a way back to the plain stair.
- One seed still shows the same door glyph; whether it is the Binding or the plain stair is gated by state after a pure roll (5.5).

**The relic pick (Criss's call, round 3).** Tapping **A relic** pulls **3 non-cursed relics at random**, and you pick which one to put up (voice, rule 23: "You lay one on the stone."). There is **no reroll**, so you cannot fish for a spare one. The pull is drawn when you tap and kept in `run.mini`, so a reload shows the same three. With two or one it shows what you hold. **To revisit after a playtest:** with several relics you can offer your least-loved, so the stake costs less the more you hold; tune the pull then, not before.

**A pledged relic stays in `run.relics`, marked, with its effects on, until the floor resolves (Claude's call).** Do not take it out at the start and give it back on a win. In `index.html`, `addRelic()` pays Oil Reserve's oil on every add, so removing then re-adding that relic would pay it twice. Only a failure calls `removeRelic()` (it already undoes the oil cap, but not Oil Reserve's oil; the failure path still has to handle that). A win does nothing to the relic.

**Stall, on purpose.** Essence no longer skips a screen: every Binding door opens the pledge card, one tap, because one consistent card reads better on a phone than two door behaviours. The door's sub-line still names the Binding and that it asks a pledge. The plain stair stays the default. The essence pledge is deducted at the mini floor's start, as Knucklebones does (`run.ess-=r.stake`), kept as `run.mini={id,pot}` (old saves have none; for a relic pledge `pot` holds the relic and the pulled three), and refunded on a win. If the pledge would be empty, the door shows as the plain stair.

**Reload (Criss, round 3: accepted).** A reload mid-mini-floor restarts it with the pledge still out. That means an app-kill buys a retry, and Criss accepts it, because a folded Fold can reload the tab and a forfeit for that is cruel. For a relic pledge the restart keeps the same three and the same pick.

**Every mini floor? No.** A pledge belongs to a mini floor whose result is *binary*. The Binding either holds or it does not. The Carry, Mirror Stair and Smothering already cost something per mistake, shown as it happens (a woken sleeper, a dark sconce), which beats a lump forfeit; giving all six the same bet-play-collect shape would break section 2.2 ("a different cost each") and pillar 5. The Winch and The Cast keep their own per-try costs.

### 5.3 Mini floor 6: The Cast (chosen by Criss, round 3)

- **Verb: aim.** Nothing else uses it (route, hide, steer, order, draw).
- **What you do.** Iron rings hang on the shaft wall; the cable sways with the descent. Drag back from the bottom of the stage, which shows an arc, and loose a weighted line to catch a ring. 3 lines, 15 to 25 seconds, one thumb.
- **Pays:** a rite charge, one extra cast of a rite you carry on the next floor, per ring caught (2 at most; a rite is a cooldown spell, so a charge is a new thing). **Costs:** each line is weighted with a tenth of your essence, caught or not. A share scales with the build where a flat oil cost does not.
- **Touches light** only thinly: the rings show only inside the lantern's glow. Weakest of the six on pillar 1; Criss may want to cut it.

### 5.4 Thumb test: drawing sigils on a folded Fold (rules 1 to 6)

A review cannot test a thumb (section 0); only Criss's playtest settles it. On paper the idea passes only in this shape, and fails if the shape is freeform:
- **Not freeform.** Free recognition of a drawn shape is jittery on glass. Use a **3×3 dot field that snaps**, like an unlock pattern: a thumb error under the snap radius is invisible.
- **Rule 1 (nothing covers the board):** a thumb hides about 45 px. Show the sigil as a ghost under the field **and** in a strip above it, out of the thumb's way. The timer is a thin bar, not a modal.
- **Rule 2 (nothing shifts):** the strip and bar have a fixed size, reserved from the start.
- **Rule 3 (safe areas):** dots stay at least 24 px inside the screen edge, because Android's back swipe starts at the edge. Keep the field above the bottom gesture bar.
- **Rule 4 (short landscape):** at 915×356 the field is about 170 px square with dots 56 px apart; it fits in `#app.side` only if the strip moves to the side column. Test it; likewise 852×342.
- **Rule 5 (click, not pointerdown):** drawing needs pointer events, but the result card must appear 600 ms or more after the last lift and dismiss on `click`, or the lift lands on its button. A `pointercancel` (a palm, a fold) ends the stroke and never fails the floor.
- **Rule 6:** touch only; `touch-action:none` on the field; no hover.
- **Pace:** at about 8 seconds a sigil, 5 segments is the limit.

### 5.5 Checked, touches, riskiest part

- **§1:** touch only; bosses stay all-or-nothing and a failed mini floor never ends a run (the pledge cannot kill: it is essence or a relic, never oil); hard on purpose; the sigil is painted violet, glowing, silhouetted. **§9:** pillars 2, 4 and 5 hold. Pillar 1 is thin (the creature and the rings show only in the lantern's glow). **Rule 23:** each mini floor ships a first-time tip, a "How the dark works" line and a Grimoire **Descents** page, and the pledge gets its own tip and line.
- **Systems touched:** `descend()` and `showMap()` (the frame), `makeDoors()` (the glyph and the pledge line), `run` and `resumeFrom()` (`run.mini`), `run.ess` (HUD, merchant, Ossuary Key credit), `run.relics` (relic pledge), `run.roster` and `HORRORS` (the reward, madness tiers, the Many-Mouthed's Gorger count), the kit filter, `tests/hook.js` (a headless hook for each mini floor), and the 14-size device test.
- **Riskiest part: the pledge pot.** Essence leaves `run.ess` at the start and has to come back on every exit: a win, a failure, a reload mid-floor, quit to title and Continue. Miss one and essence vanishes or doubles. A relic pledge has its own two ways to go wrong: a failure that forfeits the relic but leaves Oil Reserve's oil in place, and a reload that re-pulls the three (so the pull belongs in `run.mini`, not in a fresh roll). Second: a pure roll (seeds) picks the door, but whether the pledge exists depends on what you hold, so two plays of one seed can show a plain door where the other shows The Binding. Roll purely, then gate by state.
- **Balance** (later PR): the pledge share, the reward's worth against it, the Cast's essence tenth.
