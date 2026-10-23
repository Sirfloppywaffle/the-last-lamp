# AGENTS.md — The Last Lamp

**Read this whole file before every task.** It is the shared memory of this project. Jules (Gemini) reads it automatically; Claude reads it through `CLAUDE.md`. If something here is wrong or out of date, fix it in the same pull request that proves it wrong.

---

## 0. The short version

- **The game:** *The Last Lamp*, a Lovecraftian tower-defense roguelike in a single HTML file (`index.html`). No build step, no frameworks, no external scripts. Played mostly on a **Samsung Galaxy Z Fold 7 in Chrome**, folded and unfolded, by touch.
- **The team:** Criss (owner, creative director, playtester, final say), Claude (Anthropic) and Gemini (Google, working here as Jules). Two AIs, one human.
- **The loop:** an issue describes the work → one AI opens a pull request → **the other AI reviews it critically** → Criss reads the exchange, plays the PR's **preview link** on his phone, and merges. **A merge is the green light.** Nothing reaches `main` without it.
- **Your review job is to find problems, not to approve.** Read section 2. It is the most important part of this file.
- **Never** push to `main`, rewrite history, or change balance numbers without saying so in the PR.

---

## 1. The team and who decides what

| Who | Role | Notes |
|---|---|---|
| **Criss** (GitHub owner) | Creative director, playtester, final say | Plays on a Galaxy Z Fold 7 (Chrome), folded portrait, folded landscape and unfolded. Gives short, direct feedback ("too wordy", "just go for it"). Prefers bold creative choices over a list of questions. His playtest reports outrank any test or argument. |
| **Claude** (Anthropic) | Engineer and QA | Builds features, runs the headless test suite on 14 screen sizes, reviews Jules's pull requests, keeps the docs current, mirrors releases to a claude.ai artifact. |
| **Gemini via Jules** (Google) | Engineer and co-designer | Builds features from issues labelled `jules`. Gemini also reviews Claude's pull requests (through the Gemini reviewer workflow, or when asked). Gemini designed the descent map and came up with the red drop into the Abyssal Heart, the parallax dust and the 3× speed. |

**Paused (October 2026):** Criss has taken Gemini and Jules off the project until further notice (usage limits and failed runs). Until he says otherwise, Claude builds everything. Without an independent reviewer, Claude posts a **self-review** on each of its PRs in the §2 shape, and is as hard on its own work as it would be on Jules's. Issues labelled `jules` go back to `claude`.

**Disagreements:** argue on the PR with evidence (a repro, a number, a screenshot, a line reference). One round each. If still unresolved, write a comment headed **`Decision needed`** that states both positions in two or three lines each, and let Criss choose. Never "resolve" a disagreement by quietly doing it your way in another PR.

**Decisions Criss has already made (do not reopen without his say-so):**
- **Bosses are all-or-nothing.** A boss reaching the lamp is an instant loss. He likes it.
- The game should be **hard**. He found early versions too easy, then essence too plentiful. Difficulty went up in v9 and v10, and he called v10 "better balanced". His recent runs end on the floor 4 boss or the floor 5 boss.
- **No keyboard-only features.** He plays by touch; an `F` shortcut patch was scrapped for this reason.
- The art direction is "**3D in the 2D sense**": painted canvas volumes, glossy eyes, silhouettes in the dark, eerie but readable.

---

## 2. Reviewing — your most important job

Review is where this collaboration earns its keep. Real bugs caught in review so far: a crash in a deferred hint, a touchscreen ghost-tap that started waves, an invisible lantern from a wrong scale, NaN from a missing `hash()` argument, a FIND that replaced game logic instead of drawing code. **A review that only praises adds nothing.** Be kind and specific, but be a reviewer, not a fan.

Every review **must** use this shape:

```
**Verdict:** Approve | Approve with changes | Request changes

**Strongest objection:** the single biggest risk, weakness or doubt in this change.
Required even when approving. If you truly found nothing, name what you
tried hardest to break and why it held.

**Bugs:** each with file/line or function, what goes wrong, and how to reproduce.

**Design:** does this make the game better for Criss on a phone? Is there a
simpler or bolder way? Does it fight an earlier decision (section 1)?

**Checked:** what you actually verified (read X, traced Y, ran Z, imagined
a folded Fold in portrait with a thumb).
```

Rules for reviewers:
- **Verify, don't trust.** Read the diff and the code around it. A PR description is a claim, not evidence.
- **Trace the mobile path.** Folded portrait (~412×860 CSS px), folded landscape (~915×356), unfolded (~832×694), and an iPhone (~393×659, ~852×342 sideways). Would a thumb hit it? Does anything cover the board? Does anything shift when it appears?
- **Look for the known traps** in section 6 first. They have all happened before.
- **Push back on design, not just code.** If a feature is dull, confusing or off-tone, say so and propose the better version.
- **Praise:** at most one sentence. Specifics: as many as needed.
- If you're the author and a reviewer is right, fix it. If you disagree, reply with your reasoning. Don't ignore a point.

---

## 3. Workflow

### Branches and pull requests
- Never commit to `main`. Branches: `jules/<topic>` or `claude/<topic>`.
- One topic per PR, kept small. Link the issue (`Closes #12`).
- PR description, always:
  - **What and why**, in plain words Criss can read on his phone.
  - **How it was tested**: commands run, sizes checked, what you looked at.
  - **Risks**: what might break, what you're unsure about.
  - **Balance changes**: list every changed number, old → new. If none, say "none".
- Add a line to `docs/HISTORY.md` under **Unreleased**.
- Don't weaken or delete a test to make it pass. If behaviour changed on purpose, update the test **and say so in the PR**.

### Tasks for Jules
- Tasks arrive as GitHub issues labelled **`jules`**. Claude or Criss may create them.
- Before coding: restate the goal in one or two sentences in your plan, list the files and functions you'll touch, and name the riskiest part.
- When Claude reviews your PR and tags **@Jules**, answer every point: fix it, or explain why not.
- If the issue is ambiguous, make the boldest reasonable call, state the assumption at the top of the PR, and keep it easy to change. Criss prefers that to a stalled task.

### Claude's side
- Claude opens PRs from `claude/<topic>` branches, runs the full test suite, and posts results.
- The **Gemini reviewer** workflow runs **only when someone trusted comments `/gemini` on a PR** (see `.github/workflows/gemini-review.yml`); it no longer reviews PRs on its own, to save its quota. Comment `/gemini <message>` to ask it something, or `/gemini re-review` for a full review of the current diff.

### Previews and releases
- **Every pull request gets a playable preview** at `https://<owner>.github.io/the-last-lamp/pr-<number>/`. The `site` workflow posts the link on the PR and updates it on every push. Previews use their own save space (`window.LL_STORE_NS`) and show a "PREVIEW" badge, so Criss's real run is never touched. Mention anything he should try in the PR description.
- `main` is live. A merge republishes `https://<owner>.github.io/the-last-lamp/` within a minute or two, and the PR's preview is removed.
- Claude also mirrors each release to the claude.ai artifact (unless Criss has said to skip it; see the next line), bumps `GAME_VERSION` (shown on the title screen), and notes the version in `docs/HISTORY.md`.
- **Artifact mirroring is paused until Criss says otherwise.**

### Version numbers
Three numbers, always (`17.1.1`, `18.0.0`; never `17.1`).
- **Last** = bug fixes and small tweaks.
- **Middle** = a new part of an ongoing feature. The last number resets to 0.
- **First** = a finished arc or a big change. The other two reset to 0.
- Bump **once per release**. The biggest change in the batch wins.

---

## 4. The game in one page

You tend **the last lamp** at the bottom of a drowned stair. Things climb out of the dark along fixed paths toward it. Each one that reaches the lamp drains oil; at 0 oil the run ends. A **boss** that reaches it ends the run outright.

- **Light is everything.** You can only build on lit tiles, and most wards only work while connected to the lamp's light. Wards cut off from the light go dark and do nothing. Shades and Stalkers are **veiled**: invisible unless something unveils them.
- **Essence** is the currency: you start each floor with a stipend, and earn more from kills, early wave calls, the tithe and rooms. **The stair takes a toll:** when you descend, everything except your salvage is cut to 30%.
- **Wards** (10 kinds) are built on tiles and upgraded along **branch trees**: each has three branches of three tiers, but only **one** branch can reach its capstone (tier 3).
- **Horrors** are bound creatures you field like towers. They're strong, but every one fielded raises **madness**. Madness tiers (Calm → Whispers → Slipping → Leaning) flicker the lamp, shrink it, and make the dark worse.
- **Forks** (floors 2 and 3): the stair splits. Creatures take the darker way, counting only the light you cast; Shades and Stalkers hunt it instead; Gnashers and bosses keep the main way. The **Weir** (built on a fork) shuts one way between waves, and the **Will-o’-Wisp** rite (on forked floors only) lures everything but bosses down a chosen way for 8 seconds, mid-wave.
- **Rites** are cooldown spells (Flare, Pillar of Salt, Drowning Bell, Name the Thing).
- **Five floors:** the Cistern, the Ossuary, the Drowned Nave, the Throat (the Keeper Below), the Abyssal Heart (the Primordial). Floors 1 to 3 each have **three maps** and floors 4 and 5 two (the shifting stair, #73), one drawn as the floor begins and named beside the floor's name; the waves are the same on every map.
- **Roguelike layer:**
  - **Kits** choose your starting arsenal.
  - After each floor comes **the landing**: a gift, then a relic if earned, then **forked stairs** with an **omen** on some doors, then the room behind the chosen door. One door on the way to floors 2 and 3 carries a **Trial** (`TRIALS`: Rationed, the Hallowed Ground, Sealed, One of Each, Bare Hands, Unbranched, the Long Night), a floor rule that pays a relic when passed. Rooms can be a merchant, shrine, event, rest, reliquary, the **Knucklebones** (Cult of the Lamb's knucklebones against the hooded thing, for essence the stair would burn), or the **deep stair**, which makes the next floor elite.
  - **Relics** bend the rules; some are cursed.
  - **Embers**, earned on every run, unlock kits, relic packs and events in the **Ember Hall**.
  - Winning opens **the Deeper Dark**: depths 1–5, each adding a new cruelty.
- **The descent map** plays between floors: a lantern sinking down the shaft past cleared floors. You can also open it from the pause menu.
- **Speed** 1×/2×/3×. **Auto-save** at each floor start, each landing step, and each break between waves.

Full tables and formulas: **`docs/DESIGN.md`**.

---

## 5. Code map (`index.html`, about 4,000 lines)

Everything lives in one file: CSS, then markup, then one big script inside an IIFE. The sections appear in this order, each marked by a `/* ------- name ------- */` comment.

| Section | What's there |
|---|---|
| CSS `:root` | Design tokens: `--abyss --stone --slab --seam --veil --tallow --brine --madness --wound --bone --ash`, fonts `--f-display` (Grenze Gotisch), `--f-body` (Alegreya Sans), `--f-num` (DM Mono). |
| CSS end | `#app.side` = the short-landscape three-column layout; safe-area rules; short-screen modal rules. |
| Markup | `#app` → `header.hud#hud`, `main.stage#stage` (`canvas#board`, `#preview`, `#banner`, `#hint`, `#bossCard`, `#bossBar`, `#sheet`), `footer.cmdbar#cmdbar` (`#tray`, `#rites`, `#modebar`, `.calls`). Screens: `#title`, `#modal`, `#mapOverlay`. |
| `data` | `PAL`, `FOES`, `SPAWNABLE`, `WARDS`, `BASE_WARDS`, `GIFT_WARDS`, `HORRORS`, `TREES` (branch upgrades), `TARGETS`, `RITES`, `RELICS`. |
| `roguelike layer` | `KITS`, `OMENS`, `TRIALS` (floor rules on a door; `run.trial` → `F.trial`; the Hallowed Ground's patches in `run.hallow`, canonical like `FLOORS`, mapped into `F.hallow` by `hallowSync()` in `buildGeometry()`; Rationed's count is `rationN()`; Sealed's two wards in `run.seal`, kept like `run.hallow`; `TRIAL_SPARE` is each kit's light, which no Trial locks or caps; `trialBarred()` marks the tray), `ROOMS`, `PACTS`, `HALL`, `DEPTHS`, `EVENTS`, `meta()` and `saveMeta()` (Ember Hall progress), `price()`. |
| floors | `FLOORS` (paths, waves, stipend, hue; `mapN` names map 0 and `variants` holds the other maps, each `{n, paths, forks, lamp}` with as many roots as map 0), `floorMaps()`/`mapOf()`, `mapDraw()` (a seeded run takes its map from its seed; only an old, unseeded run uses the bag per floor in `ll-maps`), `run.mapv` (the floor's map, kept so a resume never re-rolls; an old save plays map 0), `COUNT_MUL`/`GAP_MUL`/`DELAY_MUL`, `scaledGroup()`. |
| `seeds` | `run.seed` (32 bits, made in `newRun`; an old save has none and plays unseeded). `roll(seed,floor,salt,i)` is pure; `SALT` gives each stair decision a fixed integer (never reuse or renumber one). `seeded(salt,sub,fn)` points `RNG` (behind `rnd`/`pick`/`shuffle`) at that decision's stream while `fn` runs; everywhere else `RNG` is `Math.random`. Stair rolls are seeded; fight rolls stay random. `stairName`/`stairCode`/`parseStair`, `seedLine()` (the pause, death and morning screens), `run.replay` (Descend the same stair, or a code pasted in dev mode: no embers). |
| `sound` | `AUDIO` (synthesized SFX), `BGM` (procedural music). |
| `state` | Globals: `run` (the whole run, saved), `F` (the current floor, rebuilt each floor), `sel` (selected tray item), `selTower`, `mode` (rite targeting), `paused`, `speed`, `uid`. |
| `stats from branches` | `wstat(t)` (a ward's live stats from its branch levels), `lstat()` (the lamp's), madness: `tiers()`, `horrorMad()`, `madness()`/`madTier()` (horrors plus the Many-Mouthed's `dread()`: they set the tiers), `boundMadness()`/`boundMadTier()` (paid horrors only: what feeds the Occultist and opens Unpaid Teeth's free horrors), `wardCost()`. |
| `orientation` / `paths` | Board is 14×12 (`land`) or 12×14 (`port`), picked by `bestOrient()`. `buildGeometry()`, `posAt(path,d)`. Forks: each branch is a whole extra path sharing its root's prefix (`F.paths` beyond `F.nRoots`); at the fork a creature switches `e.gate` via `forkPick()` and keeps `e.d`. Spawns and rifts use roots only. |
| `light` | `lampBase()`, `lampRadius()`, `lightsNow()`, `canSee(e)`, light connectivity (wards go `dark`). |
| `saving` | `store` (all localStorage goes through it; prefixed by `window.LL_STORE_NS` in PR previews), `SAVEKEY='ll-save-v2'`, `checkpoint()`, `resumeFrom()` (migrates old saves; keep it backward compatible). |
| `dev mode` | Hidden. Tap the title heading 7 times within 3s. `DEV_ACTS`. It also shows a Knucklebones button on the title: a practice table (`bonesPractice()`) that stakes and saves nothing. |
| `run & floors` | `newRun(kit,depth)`, `beginFloor(snap)`, `awardEmbers()`, `callWave()`, `startWave()`, `floorCleared()`. |
| `entrances` | `BOSS_INTRO`, `BIG_INTRO`, `startIntro()` (`F.intro` freezes the sim during a boss reveal), `renderBossBar()`. |
| `the landing` | State machine in `F.draft` (`step`: gift → relic → fork → room, plus `pick` sub-state). `draftOptions()`, `makeDoors()`, `makeRoom()`, `landingModal()`, `descend()` (applies the toll, then `showMap()`, then `beginFloor()`), the map: `MAP_SYS`, `drawMap()`. |
| `descents` | Expansion 2's mini floors, after `descend()`. `DESCENTS` (data, near `TRIALS`), `descentDoor()` (a pure roll on `SALT.descent`: one door, landings after floors 2 to 4, never a Trial door or one walked this run, `run.descents`). `descend()` pays the toll, sets `run.descent`, saves (`descentSave()`) and calls `startDescent()`; `descentFinish()` pays the reward, then `beginFloor()`. A reload with `run.descent` set plays it again. `DESC` (visual and per-play state, never saved) runs in `#dscOverlay` on real time from `frame()`. The Carry: `carryLayout()`, `carryStep()`, `carryResult()`, `drawCarry()`; woken sleepers are `run.woke`, dread on the next floor (`wokeDread()`). The Mirror Stair: `mirrorLayout()` (sub 2 of `SALT.descent`), two swivel mirrors (`DESC.ms`, each with a spot on its wall; `mirrorAim()` turns the glass with `mirrorTurn` and draws the beam along `mirrorOut`), `mirrorStep()`, `mirrorResult()`, `drawMirror()`; its sconces widen or narrow the next floor's lamp until the first wave breaks, `run.glow` (`sconceGlow()` in `lampBase()`, ended in `waveCleared()`). Each descent is a row in `DSC_GAME` (layout, sub-stream, tip key, step, result, pay, counts, painter, touch); add a row and a new sub for the next one. `mirrorOut()`/`mirrorTurn()` are the one reflection rule, shared with the Signal Mirror. The Binding (`fits`: never `gridKit()`): `descentGate()` gates its door by what you hold after the pure roll (nothing to pledge → the next open descent) and names its creature (sub 4); `descend()` sets `run.mini={k,horror,kind,n,relic,pull,pick}` and shows `pledgeCard()` (as `F.blocking`, saved, so a reload shows it again); `layEss()`/`layRelic()` lay the pledge (the pull is sub 5, kept in `run.mini`), `plainStair()` backs out unwalked; `bindLayout()` (sub 3), `bindGeo()`, `bindDown/Move/Up()`, `bindStep()`, `bindPay()` settles the pot (essence back on a win; `removeRelic()` on a failure, which also clears what a relic kept). `pledgeBack()` returns a stray pledge on resume. The Cast: `castLayout()` (sub 6), `castSway()`/`castSwayV()` (the cable's swing), `castDown/Move/Up()` (a slingshot pull; `castVel()`), `castThrow()`, `castFly()`, `castStep()`, `castResult()`, `castPay()` (the essence tithe, paid at the end, and `run.charge={floor,n}`); `chargesNow()`, `chargeable()`; `castRite()` wraps `castRiteNow()` so a charge casts a cooling rite, and `chargeSettle()` (in `update()`) spends it only when the cast lands (`F.chg`). The Smothering (`fits`: never the Occultist): `smotherLayout()` (sub 8; `smoPlume()` per plume, `smoB()` a wick's brightness from the layout and time only, `smoCross()` counts crossings), `smotherFresh()` (`sub`: lead, plume, gap; `pos` in storeys), `smoLay()`/`smoGeo()`/`smoHit()` (CSS px, the wick row), `smotherDown/Move/Up()` (snuffed on the lift, on the same wick), `smotherSnuff()`, `smotherStep()`, `smotherResult()`, `smotherPay()` (depth through `run.baseOilMax`, dread as `run.fume={floor,n}`, read by `fumeDread()` in `dread()`), `drawSmother()` (one cached flame sprite; light alone ranks the wicks). The Winch (every kit): `winchLayout()` (sub 7: ribs, arms, purses, then the drowned man's purse as a roll and an index, always drawn; `winchFree()`/`winchNear()` keep every purse catchable), `winchFresh()` (the relic from `relicPool(false)`; none left, an ordinary purse), `winchExt()` (an arm's reach from its phase and time only), `winchHit()` (ribs and arms are solid), `winchReach()` (where a lantern can get to round the stone; a purse hangs only there), `winchSway()` (the thumb steers the cable's top, `C.hx`; the lantern swings under it, `C.sw`, knocked by the jerks rolled in `C.kk`), `winchDown/Move/Up()` (relative steering), `winchSnag()`, `winchStep()`, `winchResult()`, `winchPay()` (essence, `addRelic()`, `loseOil()`, all at the end), `drawWinch()` (`winchGlintY()` keeps the glints under the counts). Tests settle descents at once (`DESCENT_AUTO` in `tests/hook.js`, which pledges essence first); `descents.test.js`, `mirror-stair.test.js`, `binding.test.js`, `cast.test.js`, `smothering.test.js` and `winch.test.js` play them. |
| `building` | `placeProblem()`, `tryPlace()`, `sellTower()`, `buyBranch()`. |
| `combat` | `hurt()`, `killFoe()`, `burst()`, `lampHit()`, `bindSoul()`. |
| `rites` | `castRite()` (rite charges, then `castRiteNow()`), `castPillar()`, `castName()`. |
| `update` | `update(dt)` → `updateFoes()`, `updateTowers()`, `updateShots()`. Dead foes are compacted once at the end of `update()`. |
| art | `drawCreature()` (procedural creatures in unit space, cached as sprites in `SPRITES`; bosses paint live), `ART`, `THEMES` (per-floor props), `paintBoard()`, `paintFloor()`, `stainFloor()`, `drawWard()`, `drawLamp(c,x,y,tm,k)` (unit space: the lamp is ~0.75 units tall). |
| `render` | `render()`: y-sorted draw list, shadows away from the lamp, rim light, darkness, fog, fx, boss intro, floats. |
| `relics in the HUD, and the Grimoire` | `#relBar` in the HUD: the book button and a seal per relic (`renderRelics()`, one fixed size so nothing shifts); a tap shows `#relTip`, which takes no taps. `codex()`/`codexSee()` record creatures met (in `spawnFoe`) and relics found (in `addRelic`). `openBook(from,tab)` / `showBook()`: tabs Creatures, Wards, Rites, Relics; unmet creatures and unfound relics show as ???. `LORE` holds each creature's how-it-works line. |
| `walkthrough and tips` | `COACH`, `coachWalkSteps()` (the first-descent walkthrough), `TIPS` (first-time tips: each a `foe` match or a `when()` test), `coachPoll()` (from the frame loop, 5×/s), `coachPlace()` (the bubble docks over the HUD, or over the command bar when the HUD is the subject; only its buttons take taps). Tests run with it off; `tutorial.test.js` turns it on. |
| `the Roster` | `PORTRAIT_ART` (one painter per kit, unit space, one light each), `portraitCanvas()` (cached, locked and lit, a few frames for the Nameless's eyes and Voss's arc), `HOOD_EYES`/`hoodEyes()` (kinds bound, from `ll-codex`), `ROSTER` (who they were), `openKitPicker()` (the roster screen: tap chooses, tap again descends). |
| `UI` | `renderHUD()`, `renderPreview()`, `renderTray()`, `renderSheet()` (upgrade panel), `renderModebar()` (placement card), `renderRites()`; `tickUI()` runs every 0.2s, `forceUI()` runs now. `banner()`, `hint()`. |
| `settings, modal, pause & title` | `showModal(o)`, `closeModal()`, `openPause()`, `openSettings()`, `showRules()`, `showTitle()`, `drawTitle()`. |
| `loop` | `watchPerf()` (auto-Lite if frames stay slow), `frame()` (sim in steps ≤ 50ms; `speed` 1/2/3; the map overlay runs on real time). |
| `wiring` | Button handlers, `layout()` (calls `applyShape()` first), resize handling. |

**Storage keys:** `ll-save-v2` (the run), `ll-meta` (embers/unlocks), `ll-best`, `ll-vol`, `ll-dev`, `ll-gfx-lite`, `ll-gfx-auto`, `ll-tut` (walkthrough and tips: `{walk, seen, off}`), `ll-maps` (the map bags: maps of each floor not yet met, and the last one played), `ll-codex` (the Grimoire: creatures met, relics found, offerings seen, and kinds of horror ever bound for the Nameless's hood, `{foes, relics, offs, bound}`). Changing a stored shape needs a migration in `resumeFrom()` or `meta()`.

---

## 6. Hard rules and known traps

Every item here is a bug or near-miss we've already had.

**Layout and touch**
1. **Nothing covers the board while you need to tap it.** The placement card lives in the command bar (`#modebar` inside `#cmdbar`), not over the stage.
2. **Nothing shifts when it appears.** The card copies the size of the rites slot (`--mbw`/`--mbh`). New UI must not resize the stage and jump the board under a thumb.
3. **Respect safe areas** (notches, Dynamic Island, rounded corners): use `env(safe-area-inset-*)`. `#app`, `.modal` and `.screen` already do.
4. **Short landscape screens use `#app.side`** (HUD left, board centre, tools right). Test new UI there too.
5. **Dismiss overlays on `click`, not `pointerdown`.** On touchscreens the click lands after the finger lifts; if the overlay is gone by then, it hits whatever is underneath. This once started a wave by accident.
6. **No keyboard-only or hover-only features.**
7. **CSS class names are global and collide.** Prefix new ones by feature (`.dmap-…`). A bare `.rite` banner modifier once collided with the rite buttons and shifted the whole board left. Banner variants use `is-…`.
8. `[hidden]{display:none!important}` is global. Use the `hidden` attribute to show and hide.
9. Use `data-` attributes and JS handlers, never inline `onclick="…"` in markup strings.

**Logic**

10. **Deferred reads:** if a `setTimeout` callback needs a value, copy it into a local first. Twice now, state was cleared before the timer fired (a crash, then an empty toll message).
11. **`hash(a,b,s)` takes three arguments.** With two, it returns `NaN` and whatever uses it silently disappears.
11b. **Stair rolls go through `seeded()`.** A new roll that shapes the stair (what is offered, drawn or laid out before you act) uses `rnd`/`pick`/`shuffle`/`RNG()` inside `seeded(SALT.<new>,…)` with a new salt added at the end of `SALT`; a bare `Math.random()` there makes the same seed give a different stair. `seeds.test.js` walks five floors twice and will catch it.
12. **Looping over `F.foes` while calling `hurt()`:** `killFoe()` can spawn new creatures (Wretch splits) mid-loop. Use `for(let i=0,n=F.foes.length;i<n;i++)` so newborns aren't hit on the tick they appear. Don't `splice` foes; dead ones are compacted at the end of `update()`.
13. **Heavy creatures** (Behemoth) can't be stunned, and slow on them is capped at 15% after all sources. Bosses take reduced pins and stuns.
14. **Timing:** simulation time scales with `speed` (1/2/3×); overlays and animations the player watches (descent map, boss card) run on real time. Keep any per-step `dt` ≤ 0.05.
15. **Saves:** never break `ll-save-v2` loading. Old saves must still resume. `F.descent`/`MAP_SYS` and other visual-only state must not be saved.
16. **Reaching the lamp:** creatures are removed at `path.len - 0.4`. Anything keyed to "reached the lamp" has to fire before that.

**Rendering and performance**

17. The Fold must stay smooth. No per-frame allocations in hot loops (no `.slice()`/`.filter()` per creature per frame). Sprites are cached; don't paint complex creatures live except bosses.
18. Provide a **Lite** path (`gfxLite`) for anything expensive, and respect `reduceMotion`.
19. `drawLamp`/`drawCreature` work in **unit space**; scale with `setTransform` in pixels, not `/128`.
20. The canvas is DPR-scaled (`DPR` ≤ 2); multiply pixel sizes by `DPR`.

**Content and voice**

21. **In-game text:** terse, eerie, plain words. Second person ("You strip your wards…"), present tense, no exclamation marks, no jokes that break the mood. Name things as concretely as the game does: "Brine Harpoon", "the stair", "the dark".
22. Balance changes go in their own PR, or are clearly listed in the PR description. Criss tunes difficulty by feel; don't hide number changes inside a refactor.
23. **Teach every change.** Anything that changes how you play ships in the same PR with: a first-time tip in `TIPS` (or a walkthrough step in `COACH` if it shows up on the first floors), a line in "How the dark works" (`showRules()`), and a Grimoire entry for every new creature, ward, rite, relic, kit or patron. A reviewer should block a PR that's missing any of these.
24. **Developer mode shows, never saves.** Dev mode may open every kit, patron, offering and Grimoire page while it's on, but must never write those unlocks to `ll-meta` or `ll-codex`. Turning it off puts real progress back exactly as it was.

**Patching across AIs**

25. If you ever hand over a FIND/REPLACE patch instead of a PR, copy every FIND **verbatim from the current `main`**, and make each one match exactly once. (A FIND written against an older version once failed; a non-unique one once replaced the wrong block.)

---

## 7. Testing

The tests live in `tests/`: Node, Playwright and headless Chromium. They load `index.html` with a test hook (`window.__t`) that exposes internals.

```bash
cd tests
npm install                       # first time
npx playwright install chromium   # first time (add --with-deps on a bare Linux VM)
npm test                          # everything: syntax/lint checks, UI flows, mechanics, roguelike walkthrough, map, touch, 14 device sizes
npm run check                     # fast: syntax + lint rules only (no browser)
```

- **CI runs `npm test` on every PR** (`.github/workflows/checks.yml`). A red check blocks the merge.
- If a browser can't be installed in your environment, run `npm run check`, say so in the PR, and rely on CI for the rest.
- `tests/t/devices.test.js` checks 14 screen sizes. With a ward selected, it confirms that nothing overlaps the board, nothing shifts, and no control sits in a notch zone. If you add UI, extend it.
- Tests play **map 0** of every floor (`tests/hook.js` pins it); `maps.test.js` and `forks.test.js` walk every map. `LL_MAPV=2 node run.js --only <name>` runs any test on another map.
- Add a test for every bug you fix, and for every new mechanic (e.g., spawn a creature, run `__t.update(1/30)` a few hundred times, assert the effect). Tests live in `tests/t/*.test.js`; a test fails by printing a line starting with `FAIL` or exiting non-zero, and any page error or `console.error` fails it automatically. `tests/t/mechanics.test.js` is the model to copy.
- The static checks (`npm run check`) also enforce some section 6 rules: `hash()` arity, no inline handlers, no external scripts, overlays dismissed on `click`, and the placement card staying out of the stage.

---

## 8. Code style

- Match what's there: compact modern JS, no dependencies, no build step, no modules. Short names in hot code are fine; data tables are spelled out.
- Comments explain **why**, in plain sentences, above the code they explain. Don't narrate the obvious.
- Keep everything in `index.html` unless Criss agrees to split it.
- New strings follow the voice in rule 21. New colours come from the CSS tokens or `PAL`.

---

## 9. Design pillars

1. **Light is the resource.** Every system should touch light: where you can build, what you can see, what works.
2. **Every gain has a price:** madness for horrors, the toll for essence, curses for relics, oil for pacts.
3. **Dread over gore.** Show less, imply more. Eyes in the dark, silhouettes, things almost seen.
4. **Readable at a glance on a phone.** If it can't be read on a folded Fold mid-wave, it isn't done.
5. **Runs should differ.** Kits, doors, omens and relics should push you into different builds; one dominant strategy is a bug. (Criss once cleared floor 2 with a single upgraded harpoon and a bound horror. That's what "too easy" means here.)

---

## 10. More context

- `docs/DESIGN.md`: every data table (creatures, wards and their upgrade trees, horrors, rites, relics, kits, omens, rooms, pacts, events, depths, Ember Hall, floors and waves) plus the formulas.
- `docs/HISTORY.md`: version history, what each AI contributed, and Criss's feedback over time.
- `docs/OTHER-GAMES.md`: Criss's other game projects (RECLAIM, OBLATION).
- Live play link: GitHub Pages for this repo (see `README.md`).
