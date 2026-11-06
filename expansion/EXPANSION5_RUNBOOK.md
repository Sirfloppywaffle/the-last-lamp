# Expansion 5 runbook: Progression

**Who this is for:** whichever AI picks up the next step, with no memory of earlier sessions. Read this file, `AGENTS.md`, `expansion/EXPANSION5_PROGRESSION.md` (the design: its §0 and its "Resolved" note win over anything older) and `.claude/skills/town-patterns/SKILL.md`. Expansion 3's runbook (`EXPANSION3_RUNBOOK.md` §3) explains how the town code works, and Expansion 4's (`EXPANSION4_RUNBOOK.md` §3) how new pixel art comes in; read each once.

**For Criss:** to hand off a step, paste its **Prompt** (below) to Claude, with the repo link. After each merge, the AI that did the work ticks the status table.

---

## 1. Status (update this table in every step's PR)

| Step | What | PR | State | Version |
|---|---|---|---|---|
| 0 | Design (`EXPANSION5_PROGRESSION.md`) and this runbook | #135, this PR | | — |
| 1 | The Keeper's Ledger: feats, the lectern, rewards, mastery counted | | | 20.1.0 |
| 2 | The Ledger's bounties | | | 20.2.0 |
| 3 | The Ledger's trophies | | | 20.3.0 |
| — | **Criss plays steps 1 to 3.** Steps 4 to 10 are specified here only after that. | | | |
| 4 | Tonight's Stair | | provisional | 20.4.0 |
| 5 | Mastery and Marks: the groundwork, and the Lamplighter's two Marks | | provisional | 20.5.0 |
| 6 | The Whaler's Marks | | provisional | 20.6.0 |
| 7 | The Occultist's Marks | | provisional | 20.7.0 |
| 8 | The Galvanist's Marks | | provisional | 20.8.0 |
| 9 | The Bellringer's Marks | | provisional | 20.9.0 |
| 10 | The Deeper Dark, chosen (Heat) | | provisional | 20.10.0 |
| 11 | Release v21.0.0 | | | 21.0.0 |

**Order matters.** Never start a step until the previous PR is merged into `main`. The Marks go one Keeper a PR, and Criss plays each before the next (design §3).

---

## 2. Rules that apply to every step

Everything in `EXPANSION3_RUNBOOK.md` §2 still applies:
- additive only;
- pixel art in the town (§0.4);
- rule 24: developer mode never writes `ll-town`, `ll-meta` or `ll-codex`;
- rule 15: saves only grow;
- rule 11b for stair rolls;
- rule 23: teach every change;
- rule 22: balance;
- `AGENTS.md` §6.

Criss's decisions for this expansion (design §0.1):
1. **Four systems:** the Ledger, Tonight's Stair, mastery and Marks, the Deeper Dark chosen. Heat comes last.
2. **The Ledger is town-only.** Feats and bounties pay town materials and Lodge things, never anything on the stair.
3. **No permanent stat upgrades,** ever. Nothing from this expansion shows in the HUD mid-fight: progress is told on the death and morning screens and in the Lodge.
4. **A replayed stair earns nothing** (`run.replay`), as it earns no embers. Developer mode shows everything and writes nothing.
5. **Marks:** two per Keeper; points only from mastery; mastery unlocks tiers for good; nothing bought with essence; each tier gives and takes from the same kit.

---

## 3. Art

New pixel art comes in as Expansion 4 does it (`EXPANSION4_RUNBOOK.md` §3): made in PixelLab (Claude's tools from `.mcp.json`, or an object Criss made there), then `tools/png2rows.py` turns it into rows, every colour on a `PX` letter. A step that needs art lists the objects, with a line each describing them. If PixelLab can't be reached, a stand-in drawn by hand in rows is fine, said so in the PR and replaced later.

---

## 4. The workflow for every step

Same as `EXPANSION3_RUNBOOK.md` §4, run from `tests/` (`cd tests && npm test`, `cd tests && npm run design`), with these changes:
- branch `claude/prog-<topic>`; the shots branch is `claude/shots-prog-<topic>`;
- HISTORY lines go under Unreleased and wait there for step 11's v21.0.0;
- use the `ship-step`, `shots`, `self-review`, `steward` and `town-patterns` skills;
- **don't comment `/gemini`** unless Criss asks.

---

## 5. The steps

Numbers marked *shape* are for playtest.

### Step 1: The Keeper's Ledger (Claude: Opus 5.5, high)

**Goal:** a reason to go back down that never touches the stair. A lectern in the Lodge holds a ledger of feats done below. Each pays once, in town materials, and lights a gold mote in the lectern's glow.

**Build:**
- **The lectern,** `LODGE_ITEMS.ledger`: a piece of one of a kind, like the Grimoire.
  - Grow `book: true` into a general one-of-a-kind rule (one only, never salvaged, never walled in, always reachable) whose messages name the piece. Today they say "the Grimoire" (`bldScrap()`, `bldSalvage()` and `lodgeCanPlace()`'s wall-off line).
  - A `ledgerEnsure()` like `grimoireEnsure()` stands it in the main room, on a free tile near the Grimoire, the first time the Lodge is entered after this ships.
  - It moves, turns (`faces: 4`) and stores like any piece, and glows faintly through the dark.
  - Art: one PixelLab object (§3): "a slanted wooden lectern with a heavy ledger open on it, a ribbon marker, a candle stub", 16 wide, about 26 tall.
- **The feats,** a named table `LEDGER_FEATS`, one row each: `{id, g (group), n, pay, test}`. Use the list in design §1.1 (30 feats, Saltmouth row as updated there). `pay` is materials (*shape*: 20 to 60 by how hard), curios only for the hardest four.
- **Where each is read:**
  - **Run feats** are worked out at the run's end from run fields, and from three new run flags, each set where the game already notices the moment:
    - `run.heralds` (kinds slain, in `killFoe()`, beside the Herald haul);
    - `run.untouched` (a floor cleared without `lampHit()` taking oil: a per-floor flag cleared in `lampHit()`, read in `floorCleared()`);
    - `run.leaned` (a wave broken at Leaning, in `waveCleared()` like the Occultist's deed).
  - **Lifetime lists** in `ll-meta`, with defaults in `meta()`: `trialsPassed` (added where a floor under `F.trial` is cleared) and `descentsWalked` (in `descentFinish()`).
  - **Town and Grimoire feats** are read from `ll-town` and `ll-codex`, whenever the Ledger is opened or a haul comes up.
- **Paying, once:**
  - Work out what is due before `haulCredit()` (as `haulLine()` is, so the death and morning screens can say it).
  - Pay it inside `haulCredit()`, in the same write that marks `ll-town.ledger.done` (`{id: date}`), so a reload never pays twice.
  - Town feats done in the square are paid when the Ledger is next opened.
  - A replayed stair counts no run feats.
- **Mastery, counted from now:** `ll-meta.mastery` is `{kit: floors cleared}`, one per floor cleared in `floorCleared()` (not on a replay, never in developer mode). Nothing reads it yet; step 5's Marks will, so the Keepers already have ranks by then.
- **The card:** tap the lectern (outside Build; `lodgeArt()`'s `acts`, `lodgeActLabel()`, `lodgeActOn()`).
  - **Feats:** done, with the date and what it paid; to come, as "???" until something in its group has been done, like the Grimoire.
  - **Keepers:** floors cleared with each.
  - Room for step 2's Bounties tab.
- **The motes:** one gold mote in the lectern's glow per feat done, ten at most. Draw them as `lodgeBookEm()` draws the Grimoire's, once per count, never per frame.
- **The lines:** `ledgerLine(r)` beside `haulLine()`/`choreLine()`/`soulLine()` in `victory()` and `defeat()`: "The Ledger: Slay the Keeper Below. 40 iron." One line per feat, at most three, then "and two more".

**Teach:**
- `TIPS.ledger` (on first opening the lectern);
- a sentence in the Saltmouth rules line;
- the Grimoire's Rites or Relics tab needs nothing (no new creature, ward, rite, relic, kit or patron).

**Test** `tests/t/ledger.test.js`:
- each feat fires from its source (spawn a Herald and kill it; clear a floor with no lamp hit; break a wave at Leaning; pass a Trial; walk a descent; codex and town feats);
- each pays once, across a reload of the death screen;
- a replayed stair pays no run feat;
- mastery counts floors per Keeper and not on a replay;
- the lectern is one of a kind: it can't be salvaged, can be stored, and is put back if missing;
- an old `ll-town`, `ll-meta` and save load;
- developer mode writes nothing.

Extend `devices.test.js`: the card's tabs and buttons on all 14 sizes; the death screen's Ledger line fits.

**Prompt:**
> Repo Sirfloppywaffle/the-last-lamp. Read AGENTS.md, CLAUDE.md, expansion/EXPANSION5_RUNBOOK.md (§2 to §4, and §5 step 1) and expansion/EXPANSION5_PROGRESSION.md (§0, the Resolved note, §1). Build Expansion 5, step 1 exactly as the runbook says, following its §4 workflow. Make the lectern in PixelLab (§3); if it can't be reached, draw a stand-in in rows and say so. Tick the status table (step 0 is this runbook's PR). End with the prompt for step 2.

### Step 2: The Ledger's bounties (Claude: Opus 5.5, high)

**Goal:** three small tasks that change from run to run, so there is always one to go down for.

**Build** (design §1.3):
- **A Bounties tab** on the Ledger's card, holding up to three.
  - **Gates:** none until `lodgeSpines()` counts 10 (creatures met plus relics found), then one; two at 20; three at 30. The tab says how far off the next is.
- **Drawn to fit** (`Math.random`: the town is not the stair):
  - a bounty names only creatures in `ll-codex.foes`;
  - it is drawn for the Keeper you carry (`carriedKit()`; only what `KITS[k].wards`/`.rites` hold).
- **Kinds (*shape*):**
  - kill N of a creature met (`killFoe()`);
  - clear a floor with no more than K wards standing (`floorCleared()`);
  - break a wave at Slipping or deeper (`waveCleared()`);
  - bind a horror of a kind (`bindSoul()`);
  - clear a floor without calling a wave early (`callWave()`);
  - walk a descent (`descentFinish()`).
- **Read off the run:**
  - copied into `run.bty` at `newRun()` (as chores are into `run.chore`);
  - counted by the hooks above;
  - paid in `haulCredit()` with the feats;
  - a finished one is replaced when the haul comes up.
- **Pay:** 10 to 25 of one material (*shape*), never curios.
- **Rules:**
  - a replayed stair counts nothing;
  - bounties still count under a Trial (they help nothing below);
  - developer mode shows them and writes nothing.
- **Tear one up:** once a visit, for 5 tallow (*shape*), draw another.
- **Saves:** `ll-town.ledger.bty` (`[{k, arg, n}]`) and `.torn` (the visit), with defaults; `run.bty` is optional in a save.
- **Lines:** the death and morning screens' Ledger line names a bounty paid.

**Teach:** `TIPS.bounty` (when the first one posts); the Saltmouth rules line grows a sentence.

**Test** `tests/t/bounty.test.js`:
- the gates;
- draws use only met creatures and the carried Keeper's wards;
- each kind counts from its hook;
- paid once, and replaced;
- nothing on a replay;
- torn up once a visit;
- old saves load;
- developer mode writes nothing.

Devices: the tab on all 14 sizes.

**Prompt:**
> Repo Sirfloppywaffle/the-last-lamp. Read AGENTS.md, CLAUDE.md, expansion/EXPANSION5_RUNBOOK.md (§2 to §4, and §5 step 2) and expansion/EXPANSION5_PROGRESSION.md (§0, §1.3). Build Expansion 5, step 2 exactly as the runbook says, following its §4 workflow. Tick the status table. End with the prompt for step 3.

### Step 3: The Ledger's trophies (Claude: Opus 5.5, medium)

**Goal:** what you did below hangs in the Lodge.

**Build:**
- **Five new trophies** on Expansion 4's trophy kind (`k:'trophy'`, `set:'trophy'`, `cost:{}`, `faces:1`; town-patterns "Light and dark indoors, and trophies"):
  - one per Herald, the Tithe-taker, the Bellfather and the Last Keeper. Each is earned by the creature's death (`foe`), as the boss trophies are;
  - **every horror kind bound;**
  - **morning at depth 5.**
  - The last two are earned by `trophyEarn(id)` when their Ledger feat is paid.
- **A line each** in `TROPHY_TEXT`. `lodgeTrophyCard()` today assumes a `foe` (`FOES[I.foe]`); a trophy without one shows its feat instead.
- **Art:** five PixelLab objects (§3); wall mounts (`mount:true, h:2`) or standing pieces, as each suits:
  1. **the Tithe-taker's ledger-sack:** a burst sack on a hook, coins spilling;
  2. **the Bellfather's clapper:** the great bell's iron clapper on a bracket;
  3. **the Last Keeper's snuffed lamp:** a tin lamp, black glass, on a plinth;
  4. **the six eyes:** six glass eyes in a shadow box, one per horror kind (the Nameless's hood);
  5. **the depth-5 morning:** a shard of the stair's stone, still wet, under a bell jar.
- An old town gets no Herald trophies it can't prove; they're earned from now.

**Teach:** the Ledger tip names trophies; the rules line grows a clause.

**Test** `tests/t/ledgertrophy.test.js`:
- each Herald's death earns its trophy, once;
- the two feat trophies come with their feats;
- a replay earns none;
- a trophy card without a `foe` shows its feat;
- developer mode writes nothing.

Shots: the trophies hung, lit and dark.

**Prompt:**
> Repo Sirfloppywaffle/the-last-lamp. Read AGENTS.md, CLAUDE.md, expansion/EXPANSION5_RUNBOOK.md (§2 to §4, and §5 step 3) and expansion/EXPANSION5_PROGRESSION.md (§1.2). Build Expansion 5, step 3 exactly as the runbook says, following its §4 workflow. Make the five trophies in PixelLab (§3); if it can't be reached, hand-drawn stand-ins, said so in the PR. Tick the status table. End by asking Criss to play steps 1 to 3 with the playtest checklist in EXPANSION5_PROGRESSION.md §1.8, and tell him the next step is to specify steps 4 to 10.

### Criss plays steps 1 to 3

Use the checklist in `EXPANSION5_PROGRESSION.md` §1.8. What he says decides whether steps 4 to 10 stand as listed, change, or are cut (design §0.1: "if it feels thin, revisit").

**Prompt to specify the rest:**
> Repo Sirfloppywaffle/the-last-lamp. Read AGENTS.md, CLAUDE.md, expansion/EXPANSION5_RUNBOOK.md and expansion/EXPANSION5_PROGRESSION.md (§2 to §4). Criss has played the Ledger (steps 1 to 3); his notes: <paste>. Specify steps 4 to 10 in the runbook in the same shape as steps 1 to 3 (Goal, Build, Teach, Test, Prompt), from the design and his notes. Check every mechanic a Mark names against the code (the design's §3 warns why). Docs only. Open the PR with a self-review; no /gemini.

### Steps 4 to 10 (provisional; specified after the playtest)

These come from design §2 to §4, and are only sketched here.
- **Step 4, Tonight's Stair:** a date seed, one scored try a day that resumes like any run, its Keeper drawn from those unlocked, a few embers once a day, and a board by the Head-frame.
- **Step 5, mastery and Marks, the groundwork and the Lamplighter's two Marks:**
  - ranks from `ll-meta.mastery`;
  - a Mark picker at the Roster and with Take the lamp;
  - one seal in the HUD;
  - the Lamplighter's two Marks, each tier a give-and-take within his kit;
  - every number listed.
- **Steps 6 to 9:** the Whaler's, the Occultist's, the Galvanist's and the Bellringer's two Marks, one Keeper a PR, each played before the next.
- **Step 10, the Deeper Dark chosen:**
  - cruelties picked one by one;
  - depths 1 to 5 kept as ready-made sets;
  - more depth brings up more haul.

### Step 11: Release v21.0.0 (Claude: Sonnet 5.5, medium)

**Build:** no new features.
- Fix anything Criss reported on this expansion.
- `GAME_VERSION = '21.0.0'`.
- Move every Unreleased line in `docs/HISTORY.md` under `## v21.0.0 — Progression` with a one-line summary.
- `npm run design` if any table changed; full `npm test`.
- Update `AGENTS.md` (§4 gains the Ledger, mastery and Marks, Tonight's Stair and the Deeper Dark's cruelties).
- Set this runbook's status to done.

**Prompt:**
> Repo Sirfloppywaffle/the-last-lamp. Read AGENTS.md, CLAUDE.md, and expansion/EXPANSION5_RUNBOOK.md (§4, and §5 step 11). Release v21.0.0 exactly as the runbook says. Open the PR with a self-review; no /gemini.

---

## 6. If something here is wrong

The code wins over this file. If a function named here was renamed or a number changed on Criss's word, fix this runbook in the same PR. If a change would fight the design's §0 or a decision in `AGENTS.md` §1, stop and write a **Decision needed** comment on the PR for Criss.
