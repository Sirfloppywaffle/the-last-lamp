# Expansion brainstorm

**Status:** ideas only. Nothing here is built, and nothing changes the game.
**From Criss:** an expansion with new mechanics: **gambling**, a **path editor**, and **a different way to play that uses the darkness**.
**Who:** Claude and Gemini brainstorm on this PR. Criss steers by replying to Claude. Prototypes go in `expansion/` only (see `README.md`).

---

## 0. A spine to hang it on (proposal)

The three seeds read like three faces of one idea: **the dark makes you offers**.

- **Gambling:** the dark plays games with you.
- **Path editor:** the dark moves, and so can the stair.
- **Darkness mode:** at the end, you play *as* the dark.

Working title: **The Dark Bargain** (alternatives: *What the Dark Keeps*, *Below the Last Lamp*).

Every idea below is checked against the pillars in `AGENTS.md` §9: light is the resource, every gain has a price, dread over gore, readable on a phone, runs should differ.

---

## 1. Gambling

The game already has small gambles (Sing back: 50/50; the Black Door). This seed makes risk a system you choose to engage with.

**G1. The Bone Game (a new room).** A hooded thing on the landing throws knucklebones. You stake essence, oil or a relic. The odds are printed plainly. As **madness** rises, the dice start to show eyes and the odds tilt against you, and you can see that they do. *Price:* what you stake. *Phone:* one tap per throw.

**G2. Wagers on waves.** Before you call a wave, you can take a wager from the dark: "No creature reaches the lamp", "The elite dies before the second rift", "Nothing you build goes dark". Win and the stake comes back doubled, plus embers. Lose and the dark takes the stake. This builds on early wave calls, which already reward risk. *Phone:* the wager sits in the call button area, so nothing new covers the board.

**G3. The Drowned Deck.** At each landing you draw a face-down card. You can turn it now, or carry it face-down to turn later, even mid-wave as a gamble ("an omen you choose when to read"). Some cards are blessings, some curses, a few are both. This is a new resource with a hidden value.

**G4. Double or drown (a shrine pact).** Stake half your oil. Win and the lamp's capacity doubles for the run. Lose and you start the next floor on what's left. This is the most brutal version, fitting Criss's "hard and all-or-nothing" taste.

**Guardrails:** in-game resources only, honest odds on screen, and losses that hurt but can be played through (except G4, by design).

---

## 2. The path editor

There are two readings. They could be one feature or two.

**P1. In-run: reshape the stair.** On some floors the path isn't fixed. You can spend essence to **collapse** a tile, which blocks it, or **dig** one to open a new route, as in maze-building TDs (Desktop TD, Fieldrunners). The twist that keeps light central: **creatures prefer the dark**. Among the open routes, they take the one with the least light. So every candle you place also steers the swarm, and the light you build with fights the light you hide behind.

**P2. Out of run: the Cartographer.** A floor editor. Drag a finger from a rift to the lamp to draw a path, place props, pick a floor theme and wave set, then play it. Floors save as a short code you can share or paste. It could be unlocked in the Ember Hall. *Risk:* a touch editor on a 12×14 grid at Fold size is fiddly. It needs a drag-to-draw path tool, not tile-by-tile tapping.

**P3. A shifting stair (lighter version).** Each floor has two or three rift positions and path variants. Omens or rooms pick which one you face. The game gets variety without any editor UI.

---

## 3. A different way to play, using the darkness

**D1. Umbral wards (a new layer in the normal game).** Some wards work only in the dark: built on unlit tiles, powered by madness, disabled by your own light. Examples: a Drowned Bell-Jar that only rings unseen; a Hungry Shadow that eats veiled creatures. This produces the opposite pull to every other ward. The light vs. dark build tension is a direct "runs should differ" win.

**D2. The Unlit (a new mode: play as the dark).** Reverse tower defense. The lamp-keeper is AI-driven and builds wards. You are the thing below: you spend **dread** to send creatures, pick which rift they come from, snuff candles, and veil your swarm. A boss reaching the lamp ends it, as now, but in your favour. It reuses every creature, sprite and path we already have. *Risk:* largest scope, and the AI builder must be good enough to beat.

**D3. Carry the lamp (an escort mode).** The lamp moves slowly up the stair, and the light, and your buildable ground, moves with it. Wards left behind go dark. You build ahead, abandon, and rebuild. Light becomes a moving map.

**D4. A dimmer.** You can turn the lamp down. A smaller light means fewer wards work, but you earn **umbra**, which you spend on darkness abilities. This is a small, one-control way to make darkness a resource in the existing game. It pairs with D1.

---

## 4. Claude's first pick (for Gemini to attack)

- **The core of the expansion:** **P1 + D1 + D4**: creatures path toward darkness, umbral wards, and the dimmer. Together they turn the light map into the strategy. Every candle becomes a decision about where the swarm walks, and the dimmer lets you trade safety for umbra.
- **Gambling:** **G1 + G2**, threaded through the landing and wave calls. They're cheap to build and fit the voice.
- **Later, or the "big" mode:** **D2 The Unlit**, once P1 and D1 exist. "Creatures prefer the dark" is half of the AI you'd fight there.
- **P2 Cartographer:** only if Criss wants to make floors himself. Otherwise P3 gets most of the value.

## 5. Open questions

**For Gemini:**
1. Which of these is dull, off-tone or a trap? Where's the bolder version?
2. P1: does "prefers the dark" pathing survive `posAt(path,d)`, given that paths are precomputed polylines? What's the cheapest honest way to re-route (recompute on build/collapse, not per frame)?
3. D2: what would the AI lamp-keeper's build logic look like, simply?
4. What would you add that isn't here?

**For Criss (later, after the AIs converge):**
1. Is the expansion a new mode on the title screen, or woven into the existing run, or both?
2. Path editor: do you want to *make* floors (P2), or reshape the stair *during* a run (P1)?
3. Keep everything in `index.html` (`AGENTS.md` §8), or allow a second file for the expansion?

---

## 6. Round 1 with Gemini: where it landed

**Agreed:**
- **Cut D4, the dimmer.** It's a micromanagement dial; it fights pillar 4 and the dread of a lamp you can't control.
- **Cut digging and collapsing in P1.** It breaks the trench art (`paintBoard`, `THEMES`) and mazing by thumb on a 12×14 board means mis-taps.
- **"Creatures prefer the dark" via braided paths** (Gemini). A floor's paths fork into two or three branches. At a fork, a creature takes the darker branch. Implementation note (Claude): write each branch as a full path in `FLOORS[..].paths` that shares its prefix with its siblings. At the fork, the creature switches `e.gate` to the darkest sibling, and `e.d` stays valid, so `posAt` is unchanged. Cost: one light check per creature per fork.
- **Steering tools:** candle light, plus Gemini's **salt line**, which shuts a branch for one wave.
- **Gambling:** drop G2 (wave wagers read as quests). Gemini's **Knucklebones** replaces G1 as push-your-luck, with every re-roll costing permanent madness.
- **Darkness:** Gemini's **Black Snuff / Eclipse**: you put the lamp out for a few seconds on purpose. Wards sleep, horrors frenzy, the payoff surges.
- **D2 The Unlit** stays parked as the later big mode. Gemini's AI keeper sketch (keep the candle chain, answer the threat, upgrade the cheapest) is enough for an opponent.

**Still open (Claude's pushback, round 2):** see the PR thread.

## 7. Round 2: converged shortlist for Criss

Gemini accepted all four pushbacks. Added constraints: forks diverge at least 1.5 tiles so ward ranges stay readable; Knucklebones stays two buttons ("Roll again" / "Walk away") in the existing modal.

**The core: the dark steers.** New expansion floors only (floors 1–5 stay as tuned).
1. **Forked stairs on the board.** Paths split; creatures take the darker branch. Your candles decide where they walk.
2. **Seal a branch.** Tap a fork's mouth to salt it shut for one wave.
3. **Snuff the Wick** (rite). Put the lamp out for a few seconds. Wards sleep, horrors frenzy, kills drop sigils. The price: in the dark, every branch is the same, so your steering is gone.
4. **One umbral ward** (gift). Works only on unlit tiles, and everywhere during a Snuff. The non-horror reason to go dark.

**Gambling: the Knucklebones.** A landing room. Each roll grows the prize and carves another eye onto the bones (worse odds), and costs +1 permanent madness. Walk away any time; bust and you lose it all plus your stake.

**Later: The Unlit.** Play as the dark against an AI lamp-keeper. Built on top of the core once it exists.

**Cut:** the dimmer, digging and collapsing tiles, wave wagers, the floor editor (unless Criss wants to make floors himself).
