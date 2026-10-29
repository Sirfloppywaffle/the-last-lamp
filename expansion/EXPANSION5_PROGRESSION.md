# Expansion 5: Progression (design)

**Status (29 Oct 2026):** design, nothing built. Step 1 (the Keeper's Ledger) is specified in full below. Steps 2 to 4 are provisional and are specified only after Criss has played step 1. Expansion 4 (Customization, `EXPANSION4_RUNBOOK.md`) is built first; this expansion follows it.
**From Criss:** take a page from Hades (the Fated List, weapon aspects and mastery, Heat) and make our own versions, with daily challenges, per-Keeper progression and achievements. Issue #131 holds the discussion; Gemini's two rounds are on #130.
**Where this doc and anything older disagree, this doc wins** until Criss says otherwise.

---

## 0. Decisions so far

### 0.1 Criss's calls
1. **Four systems, not six.** The Ledger (the Fated List and achievements as one), Tonight's Stair, Keeper mastery and Marks, and the Deeper Dark chosen (Heat). Revisit if it feels thin.
2. **Heat is last.** It matters only after you win, and it is the most balance to tune.
3. **Bounties stay town-only.** They pay town materials and Lodge things, never anything on the stair. A stair reward can come later if the pull isn't enough.
4. **Step by step.** Step 1 ships and is played before steps 2 to 4 are specified.
5. **The skill tree is the Marks** (#135): two Marks per Keeper, each a branch of three tiers like the ward trees, points only from mastery, tiers unlocked for good by mastery, and nothing bought with essence during a run (the essence balance stays as it is). Details in step 3.

### 0.2 Rules that hold for every step
Everything in `EXPANSION3_RUNBOOK.md` §2 still applies.
- **Pillar 2:** every gain has a price.
- **The game stays hard.** No permanent stat upgrades of any kind (Hades' Mirror of Night is the one thing not to copy).
- **Nothing in the HUD during a fight.** Progress is told on the death and morning screens and in the Lodge, never mid-wave. This answers Gemini's objection that checklists turn survival into chores.
- **Seeds:** rule 11b for anything on the stair.
- **Saves:** rule 15; `ll-town` and `ll-meta` only grow.
- **Developer mode:** rule 24, shows everything and writes nothing.
- **Teaching:** rule 23, every change ships with its tip and its rules line.

### 0.3 How it meets Expansion 4
- Expansion 4's step 5 builds trophies as wall-mounted Lodge items. The Ledger's trophies use the same mounts: they must be a general kind of wall item, not boss-only.
- Expansion 4's step 1 build tools (lift, move, storage) apply to the Ledger's furniture rewards.
- Nothing here changes Expansion 4's rule that decorations are decorations. The Ledger's rewards are decorations; the reason to descend is in earning them.

---

## 1. Step 1: The Keeper's Ledger (specified)

**Goal:** a reason to go back down that never touches the stair. A ledger in the Lodge lists feats done below. Each pays once, in town materials and something you can see in the Lodge. Three bounties beside it repeat and pay a little.

### 1.1 The feat list (proposal, 30 feats)
Each feat is read from data the game already keeps: run fields (`run.floor`, `run.bosses`, `run.elites`, `run.bound`, `run.peakMad`, `run.kit`, `run.depth`, `run.descents`, `run.rescued`), `ll-meta` (`wins`, `depth`, `unlocked`), `ll-codex` (`foes`, `relics`, `bound`) and `ll-town`. The four marked **new hook** need one counter added where the game already notices the moment.

| Group | Feat | Read from |
|---|---|---|
| The stair | Clear the Cistern; reach the Throat; reach the Abyssal Heart | `run.floor` at `floorCleared()` |
| The stair | Slay the Keeper Below; see morning (slay the Primordial) | `run.bosses`, `victory()` |
| The stair | Slay a Herald of each kind (3) | **new hook** in `killFoe()` (it already tells Heralds apart for the haul) |
| The stair | Clear a floor with the lamp untouched | **new hook**: a flag cleared in `lampHit()` |
| The stair | Break a wave at Leaning madness | `madTier()` as the wave breaks, like the Occultist's deed |
| Keepers | See morning with each Keeper (5) | `victory()` with `run.kit` |
| The Deeper Dark | See morning at depths 1, 3 and 5 | `victory()` with `run.depth` |
| The Grimoire | Meet every creature; find every relic; bind every kind of horror | `ll-codex` |
| Trials and descents | Pass every kind of Trial | **new hook**: kinds passed kept in `ll-meta` where the Trial pays its relic |
| Trials and descents | Walk every descent | **new hook**: kinds walked kept in `ll-meta` (today `run.descents` lasts only one run) |
| Saltmouth | Restore the Lodge; restore every workshop; raise all three shrines; free both souls | `ll-town` |
| Saltmouth | Carve five headstones | `ll-town.decos` |

### 1.2 Rewards (shape)
- **Materials:** 20 to 60 of one or two materials per feat, by how hard it is. Curios only for the hardest: morning at depth 5, every relic, every creature, every horror kind (1 to 2 each). Curios now come only from bosses, so this keeps them rare.
- **Every feat:** a gold spine on a new top row of the Grimoire shelf, so the shelf counts feats too.
- **Eight feats also hang a trophy** (Expansion 4's wall mount): the Keeper Below, the Primordial, each Herald, every horror kind, and morning at depth 5. Each trophy is pixel art per §0.4; tap it to read a line about the deed.
- **Four feats also give a furniture piece** that can't be bought: one per Grimoire completion and one for every Keeper seeing morning.
- Paid when the run's haul comes up (`haulCredit()`), in the same write, so it can never pay twice.

### 1.3 The three bounties
- **Three on the desk at a time.** One finished is replaced when the haul comes up; the others stay until done.
- **Drawn to fit.** A bounty names only creatures already in your Grimoire, and is drawn for the Keeper you carry (only wards and rites that Keeper can build). Until the shelf holds 10 spines there are no bounties; then one, then two at 20, three at 30.
- **Kinds (proposal):** kill N of a creature you've met; clear a floor with no more than K wards standing; break a wave at Slipping or deeper; bind a horror of a kind; clear a floor without calling a wave early; walk a descent.
- **Pay (shape):** 10 to 25 of one material. Never curios.
- **Read off the run:** the bounties are copied into `run.bty` at `newRun()` (as chores are into `run.chore`), counted by the same hooks as the feats, and paid in `haulCredit()`.
- **Barred on:** a replayed stair (`run.replay`). Developer mode shows them and writes nothing. They still count under a Trial, since they help nothing on the stair.
- **Tear one up:** once per visit, tear up a bounty for 5 tallow and draw another. The draw uses `Math.random` (the town is not the stair).

### 1.4 Where the Ledger lives
- **A fixed lectern** against the Lodge's back wall, beside the Grimoire shelf, at (6, 2). The ground before it, (6, 3), is kept clear like the shelf's. A saved piece standing there comes up and pays back (`lodgeFix()` already does this). It stands from the moment the Lodge is restored, so the Ledger never depends on a placed desk.
- **Tap the lectern:** a card with three tabs: the bounties, feats done, feats still to do. Feats not yet seen read "???" until their group is reached, like the Grimoire.

### 1.5 Saves
- **`ll-town.ledger`:** `{done:{id:date}, bty:[{k, arg, n}], torn:visit}`, with defaults in `townFix()`; unknown feats and bounties are dropped. The visit is when a bounty was last torn up.
- **`ll-meta`:** `trialsPassed` and `descentsWalked`, as lists with defaults in `meta()`.
- **`ll-save-v2`:** `run.bty` and `run.untouched` are optional; an old save resumes with none.
- **Developer mode:** writes nothing (rule 24).

### 1.6 Where progress shows
- The death and morning screens: one line per feat done and per bounty paid ("The Ledger: Slay the Keeper Below. 40 iron, and a trophy for the Lodge.").
- The Lodge: the lectern's card, the gold spines, the trophies.
- Never mid-wave. A feat done mid-run is told only at the run's end.
- **Teaching:** `TIPS.ledger` (on first opening the lectern), `TIPS.bounty` (when the first bounty posts), and a sentence in the Saltmouth rules line.

### 1.7 Test
`tests/t/ledger.test.js`:
- each feat fires from its source;
- feats pay once across a reload of the death screen;
- bounties draw only met creatures and the carried Keeper's wards;
- a replayed stair pays nothing;
- tearing up a bounty is once per visit;
- an old save and an old `ll-town` load;
- developer mode writes nothing.

`devices.test.js` checks the lectern card's tabs and buttons on all 14 sizes.

### 1.8 Playtest checklist for Criss
1. After one run, does the death screen tell you something you did, and does it feel earned?
2. Do you want to finish a bounty before you start your next run?
3. Is any bounty a chore you would skip? Name it, and it goes.
4. Do the trophies make the Lodge feel like yours?
5. Did you go down once more than you meant to?

---

## 2. Step 2: Tonight's Stair (provisional)
- A stair seeded by the date, the same for everyone that day, built the way stair seeds already are.
- One scored attempt a day, and it resumes like any run (the phone's auto-save stays).
- The Keeper is drawn from those you have unlocked.
- Pays a small fixed number of embers once a day, and the deepest floor reached each night is cut into a board by the Head-frame.

## 3. Step 3: Keeper mastery and Marks: the skill tree (provisional)
Gemini and Claude both proposed the same shape (#135), and Criss has decided the rest.

**The shape:** the Keepers' skill tree *is* their Marks, built like the ward trees players already know.
- **Two Marks per Keeper** (Criss: enough for now; revisit if needed). That is 10 Marks in all.
- Each Mark is one branch of 3 tiers; tier 3 is its capstone.
- Carrying no Mark is the plain kit; the plain kit is not a branch.

**Points come only from mastery** (Criss). A Keeper ranks up by floors cleared while you carry them. Not embers, not town materials, not feats: the town never buys power. Mastery also rewards carrying different Keepers (pillar 5).

**Mastery unlocks the tiers for good; nothing is bought during a run** (Criss).
- Essence was balanced long ago and stays the run's one currency to spend; a second thing to buy with it would either starve the wards or go unused.
- So a Mark works from the moment you choose it, at every tier its Keeper's mastery has opened.

**The price lives inside each tier.** With nothing to buy, the Mark itself must carry its cost (pillar 2):
- every tier gives something and takes something *from the same kit*;
- the Galvanist's Overload, which runs hot and fries his pylons, is the model;
- a Mark at its capstone is different from the plain kit, never stronger overall.

**Choosing:** one Mark per run, picked at the Roster beside the Keeper (or with Take the lamp in Saltmouth), shown as one seal in the HUD. Nothing to manage mid-fight.

**Writing them:**
- Each Mark is written against the code, one Keeper per PR, and played by Criss before the next. Gemini's first example broke three mechanics (#135).
- Every number is listed for Criss.

## 4. Step 4: The Deeper Dark, chosen (provisional)
- Pick cruelties one by one to reach a depth, Hades' Heat in our own words.
- Depths 1 to 5 stay as ready-made sets, so old saves and Criss's progress keep their meaning.
- More depth brings up more haul.
- Name: "the Deeper Dark" and "cruelties". "Pact" is already the shrine's pacts.

## 5. Step 5: Release v21.0.0
After Expansion 4's v20.0.0. Steps 1 to 4 ship as 20.1.0 to 20.4.0.
