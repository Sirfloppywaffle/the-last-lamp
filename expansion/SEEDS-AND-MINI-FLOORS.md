# Expansion 2, first pass: seeds and mini floors

**Status (22 Oct 2026):** seeds (v18.6.0), the descent frame and The Carry (v18.7.0) and The Mirror Stair (v18.8.0) are **built and on `main`** (#97, #98, #100). **The Binding and the pledge** (step 7) are on `main` too (#102). **The Cast** (step 8) is on `main` too (#103). **The Winch and The Smothering are chosen by Criss** (round 4) and designed at 5.5 and 5.6, agreed as the final draft; not built yet (steps 9 and 10). This doc's own PR changes no code (no `index.html`, `tests/`, `tools/` or `.github/`; see `README.md`).
**From Criss:** this is the second expansion, so right now we only brainstorm. Two ideas so far: a **seed system** (#95) and **mini-game floors** between the main floors. More ideas get added here (see section 5).
**Who:** Claude drafted it, Gemini reviewed it (round 1, below), Criss steers. Round 1 is settled. Round 2 (Criss's **Binding** idea, the failure cost, and mini floor 6) is folded in at section 5 by Claude, Sonnet 5.5, and has not been reviewed by Gemini. Round 3 folds in Criss's answers on the pledge and picks mini floor 6 (The Cast); it is Claude's too, and equally unreviewed. Round 4 designs Criss's last two picks, The Winch and The Smothering (5.5, 5.6), by Claude, Opus 5.5, with a self-review on its PR; Gemini has not seen it. What remains open is in section 4.

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
| 3 | **The Winch** | **chosen (Criss)** | steer | The cable snags on the way down. Drag the lantern left or right past black ribs and reaching arms to catch falling purses (5.5). | essence: three small purses; sometimes the last holds a relic (5.5) | a snag costs the lamp oil |
| 4 | **The Smothering** | **chosen (Criss)** | order | Black fumes rise the tube. Snuff three wicks in the order of their brightness, dimmest first, before they reach the lamp (5.6). Never the Occultist: madness feeds him. | depth: the lamp holds more oil for the run (not a refill, 5.6) | dread for a wrong snuff |
| 5 | **The Binding** | **chosen (Criss)** | draw | Trace three different sigils, each a short connect-the-dots path, before the lantern sinks past the creature it holds. A wrong stroke resets only that sigil. | a bound horror, named on the door | the **pledge**: what you put up is forfeit on failure (5.2) |
| 6 | **The Cast** | **chosen (Criss)** | aim | Drag back and loose a weighted line at three iron rings on the swaying shaft wall; the cable sways, so lead it. Each ring caught is kept. | a rite charge | each line cast is weighted with a tenth of your essence, caught or not (5.3) |

Gemini's **Snare Line** (a timing tap) and **Black Tide** (no clear challenge) stay out; The Cast takes the one verb nothing else uses (aim).

**Cut:** The Bone Field, The Narrow Door, The Drowning Stair, The Bell Below (reasons in section 0).

All numbers above are *shape, not balance*. Balance is its own later PR (rule 22).

### 2.5 Risks

- **The Smothering** needs brightness to be distinguishable on a phone in a dark scene. Test it on a Fold, not a headless screenshot.
- **Reward order.** The toll cuts everything but salvage to 30% when you descend. A mini-floor reward granted **after** the toll skips the cut, which would make a purse the best essence in the game. Criss decided it (section 4): rewards land after the toll, and balance keeps essence rewards small. The Binding pays no essence and takes its pledge from post-toll essence, so the order does not matter for it (5.2). The Winch's purses are the case this warns of: each is a tenth of what you arrive with, capped at 12 (5.5).
- **Do not become a minigame collection.** A player should leave a mini floor hungrier for the lamp, not relieved to be out of the tower defense.
- **Mirror Stair needs the Signal Mirror's beam logic** (`mirror` ward). Reuse it, don't copy it.
- **Tests:** each mini floor needs a headless hook (run it, set the outcome, assert the reward and cost), and a 14-size layout check.

---

## 3. Action plan

| # | Step | Who / model | Effort |
|---|---|---|---|
| 1 | Update this doc to round 1 | Claude, Sonnet 5.5 | medium |
| 2 | Rewrite #95 with the pure-roll design | Claude, Sonnet 5.5 | low |
| 3 | **Build seeds** (**done**, v18.6.0, #97) | Claude, Opus 5.5 | high |
| 4 | **Build the descent mini-floor frame and The Carry** (**done**, v18.7.0, #98) | Claude, Opus 5.5 | high |
| 5 | **Build The Mirror Stair** (**done**, v18.8.0, #100; reworked after Criss's first playtest) | Claude, Opus 5.5 | high |
| 6 | Criss decides on The Winch and The Smothering (**done**, round 4: both chosen; designed at 5.5 and 5.6) | Criss | |
| 7 | **Built: The Binding and the pledge** (**done**, #102; 5.1, 5.2, 5.4): the pledge card, `run.mini`, the relic pull, the sigil field, the kit filter, tests, tips, Grimoire | Claude, Opus 5.5 | high |
| 8 | **Built: The Cast** (**done**, #103; 5.3): the aim and line, the rite charge, the essence tenth, tests, tips, Grimoire | Claude, Opus 5.5 | high |
| 9 | **Build The Winch** (5.5; #105): the steer, ribs and arms, the purses, the snag's oil, tests, tips, Grimoire | Claude, Opus 5.5 | high |
| 10 | **Build The Smothering** (5.6; Fold test #106, then the build #107): the wicks and their drift, the fumes, dread, the lamp's depth, tests, tips, Grimoire. **Fold test first:** Criss plays a one-screen brightness check before the full build | Claude, Opus 5.5 | high |
| 11 | Balance numbers for all six, in their own PR | Claude, Opus 5.5 | high |

Each build is a normal feature PR against `index.html`, reviewed as usual (a self-review while Gemini is paused, or `/gemini re-review` when Criss asks), with tests, tips, rules lines and Grimoire entries (rule 23). Criss says when an idea graduates.

---

## 4. Still open

**Closed by Criss (round 3)**
- **Mini floor 5** is **The Binding** (5.1) and **mini floor 6** is **The Cast** (5.3).
- **Reward order:** rewards land **after the toll**; essence rewards stay capped small so the stair's price still bites. The Binding sidesteps it (5.2). Balance numbers come later.
- **The pledge (5.2):** (a) the two kinds, an essence share and a relic, are right; (b) the word is **pledge**; (c) the relic is **a random pull of 3 non-cursed relics, and you pick which one**, and the **pledge card** lets you choose the kind, greying out a kind you cannot pay (5.2); (d) a reload mid-mini-floor restarts it with the pledge still out: **accepted**.

**Still open**
1. **Relic pledge, to revisit after a playtest:** a pull of 3 where you pick one lets a player with several relics offer the least-loved. Tune the pull then.
2. **Mini floors 3 and 4: chosen** (round 4). The Winch's pay is settled (Criss, round 4: purses, the flask cut, and a drowned man's purse that sometimes holds a relic). The Smothering pays depth, not a refill (Criss, round 4). Nothing about the six is open now except balance (step 11).
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
- One seed still shows the same door glyph; whether it is the Binding or the plain stair is gated by state after a pure roll (5.7).

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
- **As built (step 8, Claude's calls):** a slingshot pull from anywhere; the arc leaves out the swing the weight carries and the rings' rise, so both are yours to lead. **Retuned on #103** (Criss: too easy, too fast, two rings too few; Gemini's numbers, Claude's refund, Criss's cap): five rings, four lines, three charges at most, and a fourth ring caught gives back its line's weight; catch radius 0.26 tiles, swing 2.1 s, sink 0.85 tiles a second; you ride the whole shaft (about 20 to 25 s) unless your lines run out. A line costs a tenth of what you arrive with (after the toll), **never under 5 or over 20** (Criss), paid when the shaft ends so a reload costs nothing. Gemini's rising cost per line was dropped: Criss wants each line cheaper, not steeper. A charge works on any rite with a wait (never the Toll, Name the Thing or Overload): a rite still cooling casts at once and its own wait runs on as it was; the charge is spent only if the cast lands. Charges last the next floor only.

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

### 5.5 Mini floor 3: The Winch (chosen by Criss, round 4)

- **Verb: steer.** Sideways, the one way no other descent drags (the Mirror Stair drags up and down, the Cast drags back).
- **What you do.** The cable snags and pays out in jerks as the lantern sinks. Drag anywhere, left or right: the lantern follows your thumb's sideways travel (relative, not under the thumb), a beat behind on its cable. Black ribs jut from both walls and narrow the shaft to a gap; arms reach out of slits in the stone and draw back on a rhythm, fingers first. Three purses are knocked loose above you, one at a time; a glint at the top edge marks where each will fall a second before it does. Be under it when it reaches the lantern and the hook takes it. Touch a rib or an arm and you snag. About 25 seconds.
- **Pays: essence.** Each purse caught is a tenth of what you arrive with (after the toll), never under 4 or over 12: 36 at most. The Cast's mirror (a line costs a tenth, 5 to 20): the Cast spends essence for charges, the Winch earns it at the lamp's risk. Capped small because it lands after the toll (2.5).
- **The drowned man's purse (Criss, round 4).** About one Winch in four, the last purse is a drowned man's, pale and waterlogged, and it holds a relic instead of essence. You see which it is from its glint, before it falls, so going for it is a choice. It falls behind the tightest gap of the shaft: the hardest catch. Caught, the relic is yours (`addRelic()`, so the Grimoire records it); missed, it sinks. Never a cursed relic: a curse sprung by a good catch reads as a cheat. Drawn from `relicPool(false)`, the pool a landing relic comes from, so it fits your kit and your unlocked packs. If that pool is empty, it is an ordinary purse.
- **Costs: the lamp's oil.** Each snag is 1 oil, 3 at most. It also jerks the lantern still for 0.6 s and dims its glow a step for the rest of the shaft, so you see the next rib later: one snag invites the next. After a snag, 1 s of grace, so leaning on one rib is one snag, not thirty. Paid when the shaft ends, so a reload costs nothing (as the Cast). Through `loseOil()`, which never takes the last oil: it cannot end the run. No descent takes the lamp's oil yet (the Carry spills its own flask), so the cost is the Winch's alone.
- **Light (pillar 1).** Ribs and arms show only inside the lantern's glow, and the arms reach for the light. The glow is how you read ahead; a snag shrinks it. The dark below the glow is where the thumb rests, so it covers nothing you need.
- **Fail:** no purse caught (a relic purse counts). The snags are paid all the same. No lump forfeit (5.2: the Winch keeps its per-try cost).

**Pure roll (sub 7 of `SALT.descent`).** `winchLayout()`, inside `seeded(SALT.descent,7,…)`, draws once and in a fixed order: each rib (wall, depth, how far it juts), each arm (wall, depth, reach, its phase on the rhythm), each purse (when it falls, its x), then whether the last is the drowned man's and which relic it holds. Both are always drawn, as a 0-to-1 roll and an index into the pool, so the draw count never depends on what you hold. The arms move as a function of time and their rolled phase, never `Math.random`, so a reload replays the same shaft. **Every purse is catchable:** its x lies in a gap no rib or arm closes when it arrives, at least the catch radius from a wall, and reachable from the last purse at the lantern's top speed. A purse that fails this rerolls inside the stream a fixed number of times, then takes the widest gap, so the draw count never changes. A row in `DSC_GAME`: `winch:{sub:7,tip:'winch',…}`.

**Shape numbers** (shape, not balance; rule 22): sink 0.9 tiles/s; walls ±2; 6 ribs jutting 0.8 to 1.3; 3 arms, reach 1.2, out 0.9 s in every 2.4 s, fingers shown 0.5 s first; 3 purses, glint 1 s ahead; catch radius 0.35; cable lag 0.12 s; top sideways speed 3 tiles/s; glow 2.6 tiles, −0.3 a snag, never under 1.7; lurch 0.6 s, grace 1 s; snag 1 oil, 3 at most; purse 0.1 of arrival, 4 to 12; a relic purse 0.25 of Winches; cap 40 s.

**Tests** (`tests/t/winch.test.js`; `DESCENT_AUTO` settles it in the rest of the suite):
- One seed lays out the same shaft twice; `Math.random` stubbed to throw while `winchLayout()` runs.
- Over 200 seeds, a scripted lantern can reach every purse (the catchable rule holds).
- Result table: 0 to 3 caught × 0 to 5 snags → essence and oil; snags cap at 3; purse at 4 and 12 for arrivals of 0, 60 and 500.
- The relic purse: one seed draws the same relic, or none, twice; about a quarter of 1,000 seeds hold one; caught, `addRelic()` runs once and a reload before the end adds nothing; never cursed; an empty pool gives an ordinary purse.
- At 1 oil, three snags leave the lamp at 1 and the floor begins.
- Pressed against one rib for 3 s: one snag per grace window.
- Reload mid-shaft replays it with nothing paid; the end pays once.
- The pool holds six descents (five for the Galvanist and the Occultist); a seed's descent doors stand where they did.
- 14 sizes: glint and HUD strip clear of notches; nothing shifts when a purse falls.

**Rule 23:** a first-time tip (`TIPS.winch`: "Drag left or right to steer. Ribs and arms show only in the light. Be under a purse when it falls. A pale one holds a relic."), a clause in the Descents line of "How the dark works", its Grimoire Descents page (from its `DESCENTS` row), and a practice button in the Developer menu. Nothing new for the Grimoire's other tabs.

**Checked.**
- **Pillar 1:** fits, middling. The glow is read, and a snag shrinks it. Stronger than the Cast, weaker than the Mirror Stair.
- **Pillar 2:** fits. Essence or a relic in, the lamp's oil out, capped and never the last drop. The relic is the bait: it sits behind the tightest gap, so chasing it is how you snag.
- **Pillar 3:** fits. Arms from slits, fingers first, ribs as silhouettes.
- **Pillar 4:** fits on paper: one sideways drag from anywhere. The worry is short landscape (915×356, 852×342): few tiles of shaft above and below the lantern. Size the tile to the stage's height, lantern at mid-stage, as the Cast does.
- **Pillar 5:** fits. The only descent that pays essence and the only one that takes the lamp's oil.
- **§1:** touch only; cannot end a run; bosses untouched; hard (a purse behind a closing gap); dark art.
- **Does not fit as Gemini wrote it: the flask.** A flask pays oil against an oil cost, a wash, and it is the Carry's reward (2.2: a different currency each). **Settled (Criss, round 4): purses only, the flask cut, and the drowned man's purse added for teeth.**

**Risks.**
- **Essence after the toll:** 36 at most, and a Knucklebones room can sit behind the same door. Balance PR.
- **A relic for 25 seconds is a lot.** The Binding asks a pledge for its horror; the Winch asks only oil and nerve. One in four, the hardest catch, and never twice a run hold it down; the balance PR may lower the chance or make the relic purse cost a snag's worth more.
- **A snag at 1 oil costs nothing,** so a dry lamp plays it free. Accepted: it helps a weak run, not a strong one.
- **Relative steering:** a player may expect the lantern under the thumb. Too much cable lag reads as input delay. Criss's play settles both.

### 5.6 Mini floor 4: The Smothering (chosen by Criss, round 4)

- **Verb: order.**
- **What you do.** The lantern sinks down a narrow tube. Three wicks burn in niches across it, at the lantern's height, each a different brightness. Black fumes climb from below. Tap them out dimmest first, then the middle, then the brightest, before the fumes reach the lantern. Three plumes, three new wicks each. In the second and third the wicks gutter: their brightness drifts, so the order can change as you watch. You read the light now, not a moment ago. About 25 seconds.
- **The tap.** A wick is snuffed on the lift, on the same wick (`pointerup`); a slide off it or a `pointercancel` snuffs nothing, so a palm or a fold never costs madness. Targets at least 48 px, wicks at least 1.2 tiles apart.
- **Pays: depth.** Each plume snuffed clean (all three, in order, before the fumes arrive) deepens the lamp: it holds 1 more oil for the rest of the run, 3 at most. Through `run.baseOilMax` and `updateOilMax()`, the path the Rest room and events use, so relic oil mods stay right. Paid at the end.
- **Costs: dread.** Each wrong snuff, and each plume that reaches the lantern with a wick still lit, is 1 dread on the next floor, 3 at most. A wrong snuff still puts that wick out; the plume can't be clean, but you finish it. Kept as `run.fume={floor,n}`, read in `dread()` beside the Carry's `wokeDread()`. Paid at the end, so a reload costs nothing.
- **Fail:** no plume clean. Nothing paid; the dread stands.
- **Offered: never to the Occultist (Criss, round 4).** His Bone Spears, Risen and horrors hit harder with every madness tier, and dread raises the tier, so a wrong snuff would feed him instead of biting him: a mistake that pays breaks pillar 2. Its `DESCENTS` row gets `fits:()=>run.kit!=='occultist'`, the same filter that keeps the Binding from the Galvanist. Every other kit may draw it.

**Pure roll (sub 8 of `SALT.descent`).** `smotherLayout()`, inside `seeded(SALT.descent,8,…)`, draws per plume: which niche holds which brightness, each wick's drift (a slow swing with a rolled phase and size; plumes 2 and 3 only) and the plume's rise. A wick's brightness is a function of the layout and time only. **Fair by construction:** at most one crossing a plume, never in its first 1.5 s; and two wicks within a tie band of each other both count as the dimmest, so a crossing can never make a right read wrong. Every plume leaves time for three taps with a reaction margin. A row in `DSC_GAME`: `smother:{sub:8,tip:'smothering',…}`.

**Shape numbers:** 3 plumes of 3 wicks; brightness levels 1, 1.7 and 2.8 (at least 1.6× apart); rise 8, 7 and 6 s; drift 0, 0.5 and 0.8 of a level, over 5 s; tie band 0.15 of a level; 1.5 s between plumes; 1 dread a mistake, 3 at most; 1 depth a clean plume, 3 at most; cap 40 s.

**Reading brightness on a phone.** Never colour or glow alone: three cues together, the flame's height, its halo's radius and the pool it throws on the tube wall. The Lite path draws the same sizes without the additive glow. `reduceMotion` keeps the drift (it is the game) but drops the flicker. The dimmest wick stays well clear of black, because phone auto-brightness crushes the dark end first.

**Tests** (`tests/t/smothering.test.js`):
- One seed lays out the same tube twice; `Math.random` stubbed to throw while `smotherLayout()` runs.
- Over 200 seeds: at most one crossing a plume, none in its first 1.5 s; a perfect tapper clears every plume in time.
- The tie rule: inside the band, either wick is right.
- A wrong snuff: 1 dread, that wick out, the plume not clean. A plume reaching the lantern: 1 dread. Dread caps at 3 and lasts the next floor only; an old save with no `run.fume` reads 0.
- Depth: +1 capacity a clean plume through `baseOilMax`; it survives adding and removing an oil-cap relic, and a save and resume.
- `pointercancel` and a slide off snuff nothing.
- The Occultist's pool never holds it, over many seeds; every other kit's does.
- 14 sizes: three targets of 48 px or more, 24 px clear of the edges, at 915×356 and 852×342 too (a row across the tube fits the short height).

**Rule 23:** a first-time tip (`TIPS.smothering`: "Tap the wicks out, dimmest first, before the fumes reach the lantern. Out of order, the smoke comes down with you."), a clause in the Descents rules line, its Grimoire Descents page, a practice button. Depth needs no tip of its own: the Rest room already teaches it.

**Checked.**
- **Pillar 1:** the strongest of the six. Reading light is the whole game.
- **Pillar 2:** fits. Dread for every mistake.
- **Pillar 3:** fits. Black fumes, faint wicks, nothing seen in full.
- **Pillar 4: the real risk** (2.5 flagged it). Brightness in a dark scene on a phone is hard to read, and only Criss's Fold settles it. So step 10 starts with a one-screen prototype (`expansion/proto/`, its own `LL_STORE_NS`) for Criss to play before the full build. If it fails, the fallback reads the flame's height alone, which is less about light.
- **Pillar 5: does not fit as Gemini wrote it.** "Oil refilled" for madness is the Carry's trade exactly (oil in, dread out), so two of six descents would be one bargain with two verbs, and 2.2 asks a different currency each. **Settled (Criss, round 4): pay depth.** The Carry tops the lamp up now; the Smothering makes it hold more for the rest of the run. The cost stays Criss's (madness, as dread; 2.2 asks only the pay to differ).
- **§1:** touch only; dread cannot end a run; bosses untouched; hard (the drift); dark art.
- **Pillar 2 for the Occultist:** fails, so he is never offered it (above).
- **Length:** one plume alone is about 5 s, under the 15 s floor (2.2). That is why there are three.

**Risks.**
- **Depth overlaps the Rest room** ("Deepen the reservoir", +3). A Rest room and a Smothering can be one door, so +6 is possible. Balance PR.
- **The Carry stays offered to the Occultist (Criss, round 4).** Its dread feeds him too, but madness still flickers and shrinks his lamp, and a failed Carry still loses the flask, so it bites. The Smothering's only price is dread, so it does not.
- **`run.fume` is a new saved field:** old saves have none (reads 0), and it counts only on its floor, as `run.woke` does.
- **A tap game can feel thin** beside the others. The drift is what makes it a game; if it is too easy, tighten the rise, not the wick count (Criss said three).

### 5.7 Checked, touches, riskiest part (The Binding and the pledge)

- **§1:** touch only; bosses stay all-or-nothing and a failed mini floor never ends a run (the pledge cannot kill: it is essence or a relic, never oil); hard on purpose; the sigil is painted violet, glowing, silhouetted. **§9:** pillars 2, 4 and 5 hold. Pillar 1 is thin (the creature and the rings show only in the lantern's glow). **Rule 23:** each mini floor ships a first-time tip, a "How the dark works" line and a Grimoire **Descents** page, and the pledge gets its own tip and line.
- **Systems touched:** `descend()` and `showMap()` (the frame), `makeDoors()` (the glyph and the pledge line), `run` and `resumeFrom()` (`run.mini`), `run.ess` (HUD, merchant, Ossuary Key credit), `run.relics` (relic pledge), `run.roster` and `HORRORS` (the reward, madness tiers, the Many-Mouthed's Gorger count), the kit filter, `tests/hook.js` (a headless hook for each mini floor), and the 14-size device test.
- **Riskiest part: the pledge pot.** Essence leaves `run.ess` at the start and has to come back on every exit: a win, a failure, a reload mid-floor, quit to title and Continue. Miss one and essence vanishes or doubles. A relic pledge has its own two ways to go wrong: a failure that forfeits the relic but leaves Oil Reserve's oil in place, and a reload that re-pulls the three (so the pull belongs in `run.mini`, not in a fresh roll). Second: a pure roll (seeds) picks the door, but whether the pledge exists depends on what you hold, so two plays of one seed can show a plain door where the other shows The Binding. Roll purely, then gate by state.
- **Balance** (later PR): the pledge share, the reward's worth against it, the Cast's essence tenth.

### 5.8 Door odds with six descents

Today each landing after floors 2 to 4 rolls once (`DESCENT_CHANCE` 0.7) for one door to carry a descent, drawn evenly from those not yet walked that fit the kit (`descentDoor()`, `descentPool()`). Simulated over 200,000 runs that reach all three landings:

| Pool | Descent doors a run | Runs with none | A given descent offered in a run |
|---|---|---|---|
| 4 (today) | 2.1 | 2.7% | 0.53 |
| **6, at 0.7** | **2.1** | **2.7%** | **0.35** |
| 6, at 0.8 | 2.4 | 0.8% | 0.40 |
| 5 (the Galvanist: no Binding; the Occultist: no Smothering), at 0.7 | 2.1 | 2.7% | 0.42 |

- **Call: keep 0.7.** Six descents don't change how many doors carry one (about two a run, and the plain stair stands on every landing). They spread those doors over more kinds, which is pillar 5, at the price of each showing about one run in three. Raising it to 0.8 buys little (0.35 → 0.40) and makes a descent near certain on every landing: section 2.5's warning about a minigame collection.
- **No weighting toward descents you haven't seen.** It would read `ll-codex`, which differs per phone, so one seed would offer different doors on two phones (rule 11b). The roll stays pure.
- **Seeds:** two new `DESCENTS` rows change the pool's length, so a code made before the build keeps its descent doors where they stood but may carry a different descent, as happened with the Mirror Stair, the Binding and the Cast. Append the rows after `cast` and never reorder: `Object.keys` order is the pool's order.
- The Binding's fallback (`descentGate()`: nothing to pledge, so the next open descent) almost never comes up empty with six.
