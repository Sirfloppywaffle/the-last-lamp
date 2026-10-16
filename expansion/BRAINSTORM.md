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

---

## 8. Criss's answers (round 3)

- **Woven into the base game.** No separate mode, so forks reach floors 1–5 too. That overrides §7's "new floors only".
- **He wants ways to influence the path during runs. Open to anything.**
- **File:** Claude's call. Everything stays in `index.html` (`AGENTS.md` §8). Previews and the artifact mirror only publish that file.

**A rule to protect his v10 tuning:** every floor keeps its current route as the *main* path. Forks only add branches that are **as long or longer** than the stretch they replace. A player who ignores forks faces the same walk as today; steering can only buy time, never cost it. (Exception: anything sold as a gamble or a curse.)

## 9. Ways to influence the path (Claude, round 3)

**Steering at forks** (cheap, since they build on braided paths)
1. **Darkness pull.** Creatures take the darker branch (agreed).
2. **Sluice Gate** (ward, placed on a fork). One tap flips which branch is open, even mid-wave. A railway switch in the drowned stair. Short cooldown, a loud clank.
3. **Carrion Lure** (ward). Rotting bait beside a branch. Creatures at the fork go toward it, overriding the darkness pull. A Whaler-flavoured counter to light steering.
4. **Seal a branch.** Tap a fork mouth to salt it shut for a wave (agreed).

**Every creature has its own instinct** (pathing as a puzzle)
5. Shades and Stalkers take the **darkest** branch. Gnashers take the **shortest**. Watchers **fly and ignore forks**. Wretches **split down both**. Behemoths take the **widest** route. No single candle layout handles a mixed wave.

**They learn** (the dark adapts, which counters any one dominant layout, pillar 5)
6. **Scent of the dead.** Each branch keeps a tally of kills on it. Past a threshold, creatures start to avoid that branch: your killzone goes cold, and you have to move or re-bait it. Shown as a dark stain that grows on the branch.

**Holding them on the path**
7. **Bulwark horror.** A bound thing placed **on** the path. Creatures stop and claw at it until it breaks. This is the classic TD body-block, priced in madness. Bosses trample it.
8. **Undertow** (rite or ward). Drags everything on one stretch back along the path. A bigger, aimable version of the Shrieker's push.

**Changing the shape**
9. **Switchback Chalk** (once per floor). Tap a straight stretch to bend it into a prebaked detour, so the path gets longer. Detours are authored per floor, so the art can be repainted once, not dug freehand.
10. **Close a rift** (rite). Seal one spawn for a wave. Its creatures re-route through the others, which concentrates the pressure. Floor 3 and floor 5 have more than one rift.
11. **Open a rift** (gamble or pact). A new rift opens for the rest of the floor: more creatures and more essence. Pairs with the Knucklebones as a prize or a bust.

**Before the floor**
12. **Doors show the stair's shape.** At the landing, each door shows a thumbnail of the next floor's path variant. Choosing a door is choosing your battlefield.

**Relics** (bend the rules)
13. **Lodestone:** creatures take the *lit* branch instead (inverts steering). **Wandering Stair** (cursed): forks reshuffle every wave. **Pilgrim's Chalk:** Switchback Chalk twice per floor.

**Claude's pick for a first prototype:** forks on floors 2–5 with the main-path rule, plus the **darkness pull**, the **Sluice Gate**, **creature instincts** and **scent of the dead**. That set makes the path a living opponent with only one new ward and no new gestures.

## 10. Round 3 with Gemini: where it landed

**Gemini was right:**
- **The main-path rule leaks.** A longer branch is free slow time, and a wave split across two branches thins every choke point. **Patch:** alternate branches carry a structural deficit, such as less buildable ground, so you can't line both sides with wards.
- **Mid-wave taps on a 1×1 gate are a mis-tap trap.** The Sluice Gate becomes the **Weir**: flipped during the build phase, then it locks when you call the wave.
- **Scent of the dead is invisible punishment.** Cut. Its inverted version, **Carrion Feasting** (Skitterlings that cross a heavy kill tile frenzy), is optional.
- **Floor 1 stays pure.** It's where you learn candle chains. Forks start on floor 2.
- **Wretch splits at a fork** send one Skitterling down each branch: a breach that punishes over-investing in one branch.
- **Cut:** Carrion Lure, Bulwark, Undertow, Switchback Chalk, Close a rift.

**Claude's corrections (round 4):**
- **Lamp light can't count in the darkness pull.** If the long branch runs far from the lamp, it's naturally dark, so creatures would take it by default, and the game gets *easier* untouched. Rule: the pull counts only light you cast (candles, Watchers, the Flare), and a tie goes to the main path. Steering then always costs a ward, and the branch you push them down is dark, where your wards go dark too.
- **The Weir must cost something**, or it makes steering free and redundant. It's a ward you build at a fork (one per fork), flipped free between waves. Watchers fly over it; Behemoths smash it.
- **Keep one mid-wave tool, as a rite, not a tile tap.** **Will-o'-Wisp**: tap a branch, and for 10s everything reaching that fork follows the wisp. It uses the same board-tap targeting as Pillar of Salt, so the gesture already exists.

**Prototype slice:** forks on floors 2–5 + darkness pull (cast light only, ties to main) + creature instincts + the Weir + Wretch split at forks. Will-o'-Wisp and the door previews come next.

## 11. Prototype 1: forked stairs (`expansion/proto/`)

`forks.py` builds `forks.html` from the current `index.html`, so the real game is never edited. `test.sh` runs the whole suite plus `forks.test.js` against it in a throwaway copy: **19/19 pass**.

What's in it:
- **Forks on floor 2** (the upper gallery, a long dark loop along the top wall; moved up a row after Gemini's review so one candle can't light both ways) and **floor 3** (the lower vein swings wide along the east wall). Each branch is a full path sharing its root's prefix; at the fork the creature switches `e.gate` and keeps `e.d`.
- **Darkness pull**, counting only your light; ties go to the main way. Untouched floors play as before (tested).
- **Instincts:** Gnashers and bosses keep the main way; **Shades and Stalkers hunt your light** (the opposite of the crowd, so no single layout handles a mixed wave); Watchers fly over the Weir; a Behemoth smashes it.
- **The Weir** (45, tray-only on forked floors, never a gift): built on the fork tile, flipped from its panel between waves, locked during a wave.
- **Wretch Skitterlings** born before a fork split one each way.
- A **chevron** at every fork shows where the crowd will go right now. A hint explains forks on first sight.

**Floors 1, 4, 5 have no forks**, on purpose: floor 1 is where you learn (Gemini); floor 4 is a spiral with no room for a branch at least 1.5 tiles clear of the trench, and it is the Keeper's floor; floor 5 already has three rifts and no clear ground. Worth a second look once Criss has played this.

**New number:** Weir cost 45. No other balance changes.

## 12. Criss played prototype 1

> "The path was working as intended with the abilities to swap the accessible pathways. It made the game feel more interesting allowing the user to try different strategies and keep them more engaged."

Forked stairs graduate into the game (floors 2 and 3, the Weir, instincts, Wretch splits). Still open from §10: **Will-o'-Wisp** (mid-wave rite), **door previews** of the stair's shape, and the gambling pick, **Knucklebones**.

---

## 13. Runs that differ (October 2026, Criss and Claude)

**Criss's problem:** runs don't feel different enough. Beating the five floors unlocks more, but it's the same floors and waves; the kits differ only by small perks; relics, omens and doors change numbers more than how you play.

**Diagnosis (agreed):**
1. **Every kit is the same kit.** Candle, Harpoon and Flare are in all five. You rebuild every floor, so the arsenal *is* the build.
2. **What you face is a fixed script.** 22 known waves in a known order. Omens and depths change the numbers on the same test.
3. **Rewards change numbers, not actions.** Most relics are "X deals 30% more".

**Pushback Criss accepted:** more waves would make runs longer, not more varied (draw from a bigger pool instead); a fixed mid-floor mini-boss is just another script (Heralds are random and each breaks a rule); boons that only add a percentage repeat the relic problem (every offering changes an action, and has a price).

### 13.1 Kit variants (build first)

Every kit keeps both roles, but swaps the base Candle and Harpoon for **its own version**. Criss prefers this to taking wards away. The narrow-arsenal idea (e.g. an Occultist with no candles at all) becomes a **dev-mode test toggle**.

| Kit | Its candle | Its harpoon |
|---|---|---|
| Lamplighter | **Signal Candle**: its light jumps to any other Signal Candle within 4 tiles, so you don't need a chain | **Flare Bolt**: briefly lights and unveils wherever it hits |
| Whaler | **Blubber Lamp**: wide light, but it burns oil each wave unless the Try-pot feeds it | **Tether Harpoon**: the line slows its target more the longer it holds |
| Occultist | **Corpse Candle**: free, can only be lit where something died, and burns out after the wave | **Bone Spear**: hits harder the higher your madness |
| Galvanist | **Arc Lamp**: its light flickers, and anything in it when it flares takes a shock | **Lightning Rod**: the bolt stays planted, and coils arc through it |
| Bellringer | **Bell Candle**: its light pulses with each chime, and Shades show on the pulse | **Clapper Harpoon**: knocks its target back along the path |

Each kit also gets one **rule-breaking passive** and one **unique rite or ward** in place of today's percentage perks:
- **Lamplighter:** rite *Kindle*: set a creature alight; it becomes a moving light your wards can use.
- **Whaler:** ward *Try-pot*: renders heavy kills into oil (whale oil is lamp oil).
- **Occultist:** madness tiers strengthen your horrors instead of only punishing you. Rite *Unbind*: send a horror charging down the stair, then it's gone.
- **Galvanist:** wards linked by salt share charge. Rite *Arc Lamp*: the lamp itself fires lightning, paid in oil.
- **Bellringer:** chimes work while dark (sound needs no light). The price: Shades and Stalkers hunt the noise.

### 13.2 Wave decks

Each floor gets a pool of about 9 wave cards; a run draws 4–5. During the break, the **next card is shown on the banner** (Into the Breach style), so the randomness is always readable. The boss wave stays fixed at the end. Existing creatures only at first.

### 13.3 Patrons (the Hades layer, made our own)

Three patrons of our own: **the Drowned Mother** (water, slow, oil), **the Wrong Sun** (alien light), **the Many-Mouthed** (madness, horrors). A fourth later if three isn't enough.

- **Where offerings come from:** at the landing, the gift step is a normal gift or a patron's offering, **50/50**, so runs stay the same length. At about **20% of wave breaks** a patron also reaches out mid-floor: three offerings, take one or refuse (free for now).
- **Offerings change actions, not numbers.** Examples: *Drowned Mother:* salt becomes brine pools that pull creatures back. *Wrong Sun:* candles burn a colour that hurts what stands in it, but your wards in it fire slower. *Many-Mouthed:* each madness tier lets you field one more horror for free.
- **The price is Attention.** Each offering raises that patron's Attention. At thresholds the patron starts changing your floors: the Mother floods tiles, the Sun burns bright spots that unveil you to Stalkers, the Many-Mouthed sends its own creatures. **Your build changes what you face.**
- **Conjunctions:** two patrons who have both noticed you can offer a combined offering.
- **Kit offerings:** each patron has about 2 offerings per kit that twist that kit's own candle and harpoon. An offer of three holds at most one. Examples: *Drowned Mother × Whaler:* the Tether Harpoon drags its target into the deep, and kills leave a pool of oil. *Wrong Sun × Lamplighter:* Signal Candles jump further, but their light unveils you to Stalkers. *Many-Mouthed × Occultist:* a Corpse Candle lit where a horror died raises it for one wave. *Wrong Sun × Galvanist:* creatures stunned in the Arc Lamp's flare forget which way the fork goes. *Drowned Mother × Bellringer:* the Bell Candle's pulse slows everything on wet tiles.
- Prototype **one patron first**. *Built (October 2026):* the Drowned Mother, woven into the game itself rather than `expansion/proto/`, since Criss wants to play changes in the real game. Her price is water on the path (Noticed 1, Watched 3, Claimed 5), and all ten offerings work through that water. The Wrong Sun and the Many-Mouthed, conjunctions, and kit offerings for the other three kits come after Criss has played her.

### 13.4 Relics while patrons are tested

Behind one switch, the **number-only relics leave the pool** (they are not deleted): Tallow of Saints, Whetted Barbs, Bounty of the Deep, Oil Reserve, Quiet Mind, Sealing Wax, Ossuary Key, Salt Flats, Thunder Marrow, Witch Salt, Leech Jar.
**Kept** (they change rules): Mourning Veil, Drowned Compass, Binder's Thread, Brined Ledger, Second Shadow, Black Wick, Glass Lantern, and the four Forbidden relics. Relics already in a saved run keep working. Once patrons settle, the pulled relics come back as merchant stock or patron rewards.

### 13.5 Heralds (mini-bosses)

Each floor has a pool of 3 Heralds; one arrives in a random wave, named during the break before. A Herald drains heavy oil (about 8) but **does not** end the run; bosses stay the only all-or-nothing threat. Killing it earns a patron offering or a relic. Reuses the boss intro.
- **The Last Keeper:** a dead lamp-tender whose lamp snuffs your candles as it walks.
- **The Tithe-taker:** steals essence while it lives.
- **The Bellfather:** each toll stuns your wards in a ring around it.

### 13.6 Unlocks, deeds and developer mode

Unlocks come from **how** you play, not only how much (the Ember Hall stays).
- **Open from the start:** the Lamplighter only.
- **Whaler:** kill a Trench Behemoth with harpoons alone. **Occultist:** break a wave with your madness at Slipping or deeper (was "have 3 horrors bound at once", which Criss found too easy). **Galvanist, Bellringer:** Ember Hall, as now.
- **Patrons:** the first meets you on your first descent; the others find you after you clear floor 3, then floor 5.
- **Kit offerings** unlock as you play that kit.
- A locked kit shows as a dark silhouette with its deed underneath.
- **Existing saves lock them too (Criss).** The Whaler and Occultist are open today; after this change every save, his included, earns them back through their deeds.
- **Developer mode** shows every kit, patron, offering and Grimoire page while it's on, and **saves none of it**: turning it off puts real progress back exactly as it was. (Today's dev "Unlock everything" already only touches the current run, never `ll-meta`; keep it that way.)

### 13.6b The Galvanist (agreed with Criss, October 2026)

A mad scientist who builds a **power grid**. Every other kit places wards that work alone; his work as a network that can be overwhelmed, broken, cut off or overloaded.

- **Pylon** (his own ward, think Wattson): links to other pylons within ~3.5 tiles with a live wire across the ground. Anything crossing a wire is shocked (damage + a short stun). A wire then needs ~1.5s to recharge and dims meanwhile, so one crawler dies but a swarm pours through. Behemoths snap a wire for the wave; fliers pass over. The grid must reach the lamp: a pylon in the lamp's own light is the **mains**, and anything cut off from it is dead.
- **Arc Lamp** (his candle): brighter, but it flickers. Every few seconds it cuts out for half a second (wards in its light go dark for that moment); when it comes back, everything in its light takes a shock.
- **Lightning Rod** (his harpoon): the bolt stays planted for a few seconds and counts as a temporary pylon. Wires and coil lightning jump through it.
- **Overload** (his rite): paid in **oil, not a cooldown**: 2 oil, and every wire fires at triple strength, arcs leap between all pylons, every wire recharges. The setback is **Heat**: each Overload adds 1, it cools 1 every 10 seconds, and an Overload cast at 3 or more **fries** pylons (the hardest-worked ones burn out and must be rebuilt, which can cut power to what is behind them). The rite button always shows what the next one will cost.
- **Rule-breaker:** live wires glow; anything crossing one is lit and unveiled for a moment, Shades included. Not buildable light.
- **The lamp itself** gets his own branch, **Dynamo** (wires recharge faster), capped by **Static Burst**: when something comes close, the lamp discharges and stuns everything near it, then recharges. (If that doesn't fly, it becomes a gift.)
- **Keeps the Galvanic Coil** (his Tesla coil) to test alongside pylons; coil lightning arcs through Lightning Rods.
- **Look (go all out):** copper, porcelain insulators, Leyden jars, blue-white arcs that re-jag every few frames, sparks, a hum. **His lamp is restyled** as a carbon-arc lamp in a glass globe on a coil-wound copper base. Everything electric shares one palette (cold blue-white on copper).
- **Capture, not binding** (Criss, balanced with Gemini on #48): no sigils for him. The **Grounding Anchor** (rite, 30s, replaces Pillar of Salt) is a spike dropped anywhere for 8s that forces nearby powered pylons to link to it; its wires never shock. A bindable creature dying inside an Anchor triangle is caught (tap within 5s). One catch per Anchor; a capture vents 2 Heat. The Keeper's core waits 15s, and its fall resets the Anchor.
- **Who builds the art:** Claude builds the mechanics with full art. Gemini (Jules) can take an art pass afterward from an issue that names the exact draw functions; if Jules hits its usage limit mid-way, Claude finishes from the same issue, so nothing waits on it.

### 13.6c The Bellringer (draft for Criss and Gemini, October 2026)

Criss: "Echo location. Being able to see into the dark. Setting bell trip wires. Using sound (or visuals for anyone unable to hear) in a way to see." Every other kit lives by the rule *you can only fight what light shows you*. The Bellringer breaks it: **light lets you build, sound lets you see.**

**The core mechanic: Echo.**
- **The lamp is a bell.** Every 4 seconds of a wave the Bellringer's lamp tolls. A pale ring sweeps out from it at about 8 tiles a second, reaching 7 tiles.
- **Whatever the ring touches is *heard*** for 1.5 seconds, in the dark, veiled or not: outlined in bone-white, and every ward can target it. This uses `revealT`, which already exists for the Galvanist's wires.
- **When a creature stops being heard, its echo stays**: a fading ghost of its shape where it last was, for about a second. You read the dark by its afterimages, a rhythm of seeing and losing.
- **The price: they hear you too.** A heard creature moves 20% faster while it is heard. Every ring tells the dark where the lamp is. The Bellringer's lamp is also smaller (−0.5), because he trusts his ears, so he has less ground to build on.
- **The rule that stays:** you still build only in light. Sound shows things; it is never ground to stand on.

**His own wards.**
- **Bell Wire** (his own ward, like the Mirror or the Pylon): a line of small bells strung across one path tile. It can be strung **in the dark**, anywhere on the path: his early warning.
  - Whatever crosses it is heard for 4 seconds, and it sends a small echo (radius 1.5) that hears whatever walks beside it.
  - It does no damage. It rings again after 2 seconds.
  - At most 3 stand at once.
  - Gnashers chew through one (gone for the wave). Watchers fly over.
- **Bell Candle** (his candle): 0.3 dimmer than a candle, but each lamp toll relays from it, so the echo reaches past the lamp's 7 tiles: the ring starts again at every Bell Candle the sound reaches. Candles carry the sound outward the way Signal Candles carry light.
- **Clapper Harpoon** (his harpoon): fires only at what is heard or lit, as now. A bolt that strikes **rings its target**, so it is heard for 2 seconds, and it knocks the target back 0.5 tiles.
- **Bone Chime** keeps his 20% faster ring. Each ring is also a small echo, so chimes strike what they hear in the dark: sound needs no light.

**Rites.**
- **Toll the Great Bell** (replaces Flare): one huge ring across the whole floor. Everything is heard for 4 seconds, and everything heard is faster, so call it when you can kill what you hear.
- **Silence** (replaces the Drowning Bell): for 6 seconds nothing is heard and nothing tolls. Creatures already heard *lose the lamp*: they slow by 40% and wander, but your wards are blind in the dark too. A breath held.

**His lamp.** It swaps Fire for **Peal**: the lamp tolls every 3.5s, then every 3s. The capstone, **Cathedral**, makes each toll also stun everything in its first 2 tiles for half a second.

**Seeing without hearing (accessibility; Criss asked for it).** Everything sound does is drawn: the expanding ring, the heard outline, the ghosts, and a small bell glyph that shakes at each Bell Wire when it trips. On phones that allow it, a Bell Wire trip also gives a short **haptic** buzz. A Settings toggle, **Sound cues on the board's edge**, draws a small arc at the edge of the board pointing toward any wire or chime that rings off-screen or in the dark.

**What it changes in play.**
- The board breathes: dark, toll, everything flashes into view, wards fire, the shapes fade to ghosts.
- Strong in the dark, against Shades and Stalkers, and when spotting what is coming.
- Weak, because hearing them makes them faster and his lamp is smaller.

**Open questions for Gemini.**
1. Does "heard = faster" hurt too much? The alternative is Noise, a meter like Heat that brings extra Stalkers into the next wave when it runs high.
2. Should Bell Wires be able to stand in the dark? It is the one exception to "build only in light."
3. Should Silence exist at all, or is it too clever for a phone game read at a glance?
4. How should his capture or binding differ, if at all? The Galvanist captures; the Bellringer could bind normally, or "toll for the dead" (a sigil you *hear*, shown in the dark).
5. Should the toll keep a fixed rhythm or be driven by taps?

### 13.7 Later

- **Floor-signature creatures**, each breaking one rule: Wick-eater (Cistern), the Reassembled (Ossuary), Congregant (Nave, an inverse Shade), Throat-polyp (Throat), Echo (Heart).
- **The Touched:** one creature kind mutated at random each run, marked in the Grimoire.
- **Variant floors with light hazards** (Rising Tide, Bone Rain, Drifting Glow) and **alternate floors** (Ossuary *or* the Lightless Well). Most expensive; wave decks give most of the variety first.

### 13.8 Teach every change

Every change to how you play ships with a first-time tip (or a walkthrough step if it shows up on the first floors), a line in "How the dark works", and a Grimoire entry for anything new. Now a rule in `AGENTS.md` §6.

### 13.9 Build order

| # | Item | Who | Size |
|---|---|---|---|
| 1 | Kit variants, passives and rites | Claude | medium |
| 2 | Wave decks with the next wave shown | Gemini (Jules) | medium |
| 3 | Deeds, kit unlocks and dev-mode unlocks | Gemini (Jules) | small |
| 4 | Relic pool switch | Claude | small |
| 5 | One patron + Attention + kit offerings (prototype) | Claude builds, Gemini attacks the design | big |
| 6 | Heralds | Gemini (Jules) | medium |
| 7 | Floor-signature creatures | Gemini (art), Claude (rules) | medium each |
