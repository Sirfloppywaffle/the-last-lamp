# Expansion 2, first pass: seeds and mini floors

**Status:** ideas only. Nothing here is built, and nothing changes the game. No changes to `index.html`, `tests/`, `tools/` or `.github/` (see `README.md`).
**From Criss:** this is the second expansion, so right now we only brainstorm. Two ideas so far: a **seed system** (#95) and **mini-game floors** between the main floors. More ideas will be added here.
**Who:** Claude drafted this. **Gemini: please brainstorm and review** (shape below). Criss steers by replying to Claude.

---

## 0. What Gemini is asked to do

Review both ideas critically, in the `AGENTS.md` §2 shape: **Verdict, Strongest objection, Bugs (what breaks), Design, Checked.** Then:

1. Attack Claude's calls in sections 1 and 2. Where something is dull, off-tone or fights the game, say so and offer a bolder version.
2. **Mini floors:** Criss wants six. Claude has drafted six (section 2.4). Keep, cut or replace each, and say which two you would build first as a proof.
3. Answer the open questions in section 3. Two or three lines each is plenty.

Check every idea against `AGENTS.md` §1 (decisions already made), §9 (design pillars) and rule 23 (teach every change).

---

## 1. Seeds (#95)

A **seed** is one number that fixes a run's dice, so the same seed gives the same stair: same maps, doors, omens, waves and offers.

**Claude's call (small, and in the game's voice):**
- Every run gets a **name** ("the Brine-Hollow stair"), shown on the pause and death screens. No typed seed box yet.
- The death screen gets **Descend the same stair**. A replayed stair pays **no embers** (pillar 2: no farming a known easy stair).
- **Streams, not one stream.** Stair rolls (maps, wave cards, doors, omens, rooms, offers, patron offers, events) come from a per-floor stream seeded from (seed, floor). Mid-fight rolls stay on `Math.random`, so the same stair still plays differently if you play differently.
- The default stays random (pillar 5).
- Later: a daily stair (the date as the seed; there is no server, so players compare by text) and typed seeds.

**Why it fits:** the game is hard on purpose, so retrying a stair that nearly beat you is the hook. It also makes Criss's playtest reports reproducible ("died on Brine-Hollow, floor 4").

**Checked:** §1 untouched (touch only, bosses all-or-nothing, difficulty unchanged). Pillars 2, 4 and 5 hold as above. Rule 15: old saves have no seed, so `resumeFrom()` must tolerate that and a resume must not re-roll a floor. Rule 23: a first-time tip and a "How the dark works" line, no Grimoire entry. Rule 24: dev mode shows, never saves.

**Riskiest part:** keeping the stair stream independent of player actions. There are dozens of `Math.random` calls; one left in the stair stream, or one whose order depends on the player, breaks reproducibility. The stream position must also survive a save.

**Touches:** `newRun`, `beginFloor`, `mapDraw` and the `ll-maps` bag, `makeDoors` / `makeRoom` / `draftOptions`, `patronOffer`, wave decks, `resumeFrom()`, the death and win screens, `tests/hook.js`.

---

## 2. Mini floors (Criss's idea, Claude's first take)

**Criss's idea:** short sub-floors between main floors, each with a different game mechanic. Not a whole floor, just a small change of game. Six in total; from floor 2 on, you may be offered three of the six between floors. How the stairs work around them is open.

### 2.1 Claude's call: the mini floor *is* the descent

The game already has **a descent**: after the landing, `descend()` applies the toll, then `showMap()` plays a lantern sinking down the shaft, then `beginFloor()`. Nothing in it is playable today.

**Make the descent the mini floor.** A door on the forked stairs can carry a mini-floor glyph (the way one door to floors 2 and 3 already carries a Trial). Take that door and, instead of the passive lantern drop, you play a short touch game on the shaft. Then the next floor begins.

Why this is the cheap, clean version:
- **No new place in the run.** It reuses the landing's door step (`makeDoors`, `F.draft`), the toll (applied once, in the same spot) and the map overlay (which already runs on real time, rule 14).
- **It answers "how do we handle going down the stairs":** the stairs are the mini floor.
- **Saves stay simple (rule 15):** checkpoint at its start; a resume restarts the mini floor, and with seeds (section 1) it is the same one.

### 2.2 Rules every mini floor must follow

- **About light, the price, or the dark** (pillars 1 and 2). If it could be in any other game, it is off-tone.
- **Short:** 45 to 90 seconds. Never a second tower-defense floor.
- **One thumb, touch only,** readable on a folded Fold (rules 1 to 6, pillar 4). Test on all 14 sizes.
- **A different verb each:** build is taken by the main game. These use route, carry, dig, hold, bail, listen.
- **Each pays a different currency and costs something:** so the choice of three matters (pillar 5) and no mini floor is always right. Rewards are *light, oil, sigils, a ward tier, essence, a relic shard*. Costs are *madness, oil, a tighter toll*.
- **Failing costs; it never ends the run.** Bosses are all-or-nothing (§1). A mini-game that ended a run would feel cheap and cheats the player of a fair loss.
- **Offered, not forced:** one door per landing carries one, drawn from the stair stream so a replayed stair offers the same ones. Never the same mini floor twice in a run.
- **Teach (rule 23):** a first-time tip each, a line in "How the dark works", and a Grimoire page (**Descents**) listing the ones you have met.

### 2.3 Where they appear

Landings after floors **2, 3 and 4** (the gaps 2→3, 3→4, 4→5). That is three gaps, so a run meets at most three of the six, and the choice is which door. Floor 1→2 stays plain: floor 1 is where you learn (Gemini, round 1). The final floor has no descent.

### 2.4 The six (drafts, for Gemini to keep, cut or replace)

| # | Name | Verb | What you do | Pays | Costs |
|---|---|---|---|---|---|
| 1 | **The Mirror Stair** | route | Drag three mirrors to bounce the lamp's beam onto dead candles on the shaft wall. Each one relit is kept. | light: the next floor's lamp burns wider for its first wave | slow: you linger, so the toll cuts a little harder |
| 2 | **The Carry** | carry | Walk one small flame through a hall of sleepers. Your own light wakes them; shield it with your hand (hold) and walk in the dark. | oil | madness for every sleeper woken |
| 3 | **The Bone Field** | dig | Tap tiles to dig. Each holds a sigil, bone, or something that wakes. Stop whenever you like (push your luck, like Knucklebones). | sigils, and a relic shard on a deep dig | madness; the dark takes what the dig woke |
| 4 | **The Narrow Door** | hold | A tiny fixed choke with three pre-set wards and no building. Hold it for one short wave. | a free ward tier | oil for every creature that slips past |
| 5 | **The Drowning Stair** | bail | Water climbs the shaft. Tap to bail, or to carry a candle up out of it; you cannot do both. | essence | the candle you let drown is gone for the run |
| 6 | **The Bell Below** | listen | Something rings in the dark; repeat the pattern by tapping, longer each round (Bellringer-flavoured, but it works for every kit). | a rite charge (a Flare, a Pillar of Salt) | madness for each missed note |

All numbers above are *shape, not balance*. Balance is a later pass, on Opus.

### 2.5 Pushback Claude would give itself

- **Six is a lot.** Each needs touch design, 14 sizes of testing, a tip and a Grimoire entry. Build **two** first as a proof, and call them Expansion 2 pilot floors. Claude would start with **The Bone Field** (it reuses Knucklebones' push-your-luck, so the pattern exists) and **The Mirror Stair** (it reuses the Signal Mirror, and its reward is the light pillar made literal).
- **Rooms already exist.** The Knucklebones room is already a mini-game. A mini floor must feel like a *place you pass through*, not another room with a button. Keeping them on the descent, not behind a door, is what separates them.
- **Do not turn the game into a minigame collection.** The test: a player should finish a mini floor and be hungrier to get back to the lamp, not relieved to be out of the tower defense.
- **Dull risk:** #5 and #6 are the likeliest to read as generic. If Gemini has a bolder verb or a spookier version, swap them.

---

## 3. Open questions (for Gemini; Claude's call in brackets)

1. **Do mini floors replace a landing room, or sit on the descent?** [Descent. Section 2.1.]
2. **Can a mini floor fail?** [Yes: a lesser reward and a cost, never a lost run.]
3. **Do they pay embers?** [No: embers stay for floors and bosses (a mini floor is a one-off, so farming is not a worry, but it also keeps the Ember Hall's numbers untouched).]
4. **Which two are the proof?** [The Bone Field and the Mirror Stair.]
5. **Is six the right number?** [Six is Criss's. Pilot two, then see.]
6. **Seed tie-in:** the offered mini floors and each one's layout come from the stair stream. [Yes.]

## 4. What would make this graduate

Criss says so. Then it is two PRs, in order: the seed system (#95), then the pilot mini floors on the descent. Each is a normal feature PR against `index.html`, reviewed as usual, with tests, tips, rules lines and Grimoire entries (rule 23).
