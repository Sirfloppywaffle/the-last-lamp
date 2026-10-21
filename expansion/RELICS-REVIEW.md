# Claude's review of RELICS.md (#89)

Posted on #89. Kept here so the Gemini reviewer can read it in this PR's diff; it is replaced by the build.


Checked against `main` at v18.4.0 (`839a426`). Every number below was looked up in `index.html`; line numbers are `main`'s.

**Sanity check:** the file is a design for #89, not code. All eleven resting relics, by their real names; nothing scrambled.

### Three things Gemini misread (they decide most verdicts)

1. **Oil is the lamp's life, not fuel.** Nothing burns it over time, the lamp's light doesn't grow or shrink with it (`lampBase()` 2254: 3.7 + wick, Tallow, Black Wick, omens, Leaning), and there are no oil pickups to time in a wave. Oil comes back from rests, events, the merchant, the lamp's Well, Try-pots and the Tithe Bowl's branch.
2. **Wards don't expire, burn fuel or get refilled.** Only Salt Circles wear (14 crossings, `tryPlace` 4208) and refill (`refillSalt` 4267). Grasping Dead crumble after 6 grips; Corpse Candles and the Risen go at wave's end. And **every floor starts with an empty board** (`beginFloor` 3086), so nothing can be "locked for the run".
3. **Madness isn't a pool you pay into.** It's your fielded horrors plus dread, worked out live (`madness()` 2060). Wards and rites cost no madness, and dread has no stacks to purge.

Also: "bosses are all-or-nothing" means a boss **reaching the lamp** ends the run. Bosses still take damage, slows and (shorter) stuns, so relics don't need to dodge them. And the ward keys in §3 (`salt_circle`, `bone_spear`…) don't exist: the code uses `salt`, `harpoon` (every kit's harpoon, renamed per kit), `chime`, `trap`, `grasp`, `pylon`, `effigy`, `lance`. Saves store relics by key (`run.relics`), so keys stay and table order doesn't matter.

### The eleven

**1. Tallow of Saints — needs review.** A ring of power at the edge of the lamp's light is a good idea. But the rim never moves with oil, so "let your oil rise and fall" can't happen. What does move it: wick upgrades and Black Wick push it out; Whispers' flicker (−0.6) and Leaning (−1) pull it in, and rim wards can go dark. That's a better tension (horrors vs. your rim). The +0.5 light per ward does nothing for wards that don't light. The Wrong Sun hook can't work: spots are path tiles, and Claimed would slow those wards. **Proposed:** wards standing in the outermost tile of the lamp's own light fire 25% faster (35% is a lot on ~15 tiles everyone already builds on). Drop the light and the Sun hook.

**2. Oil Reserve — needs review.** Nothing to "save for the moment the pack enters", and draining real oil (your life) as damage is a trap. **Proposed:** +4 oil on pickup; oil you gain past the brim isn't lost, it pools as **flood** (8 at most, drawn amber past the bar). In a wave, flood burns 0.4 a second as fire on the path under the foremost creature in the lamp's light, 14 damage a second. Bosses can burn too. Numbers fine. A rest at full oil now has a use. Cut the Mother/Sun hooks (small, and spots are the Sun's).

**3. Whetted Barbs — needs review.** Good, and every kit can use it: Galvanist's Lightning Rod *is* his harpoon (same key), so it's not "gift only". Problems: 3 barbs × 100% shot damage on every death is +300% per kill; barbs that re-lodge would chain forever; "steps onto a trap or circle" needs checking per path ward. **Proposed:** harpoon and Whaling Gun hits lodge a barb (3 at most, 10% slower each, never bosses; heavy still capped at 15%). On death, each barb flies to the nearest seen creature within 2.5 tiles for 50% of the hit and doesn't lodge. Keep the trap/salt rip as a second step only if Criss wants it. Many-Mouthed hook: no dread stacks, cut.

**4. Salt Flats — needs review.** The **salt bridge** is good: two circles within 2.5 tiles on the same path salt the tiles between them, and refilling one refills both. "Salt on water" is already allowed (`placeProblem` doesn't block it): cut. Needs a rule for wear: a bridge tile wears its nearer circle. "+50% split" is unclear; refill-both is simpler. Needs `salt` only; Pillar of Salt doesn't touch circles. Watch: bridges also burn with the Brined Ledger and double the Galvanic Coil.

**5. Quiet Mind — needs review.** "Drain madness", "0 madness on your next ward" and "purge dread" can't work (point 3). Most players also don't act mid-wave except rites, and the Bellringer tolls every 3 seconds to see, so she'd never be still. **Proposed:** after 10 seconds of a wave without building, upgrading or casting (her Toll doesn't count), you're **still**: madness counts 3 lower until you act, and the next ward you build costs 30% less. Only matters with horrors or dread; every kit can field them.

**6. Sealing Wax (cursed) — needs review.** "Never expires" means nothing (wards don't), "for the rest of the run" can't (the board empties each floor), and sealing at **every** wave start grows to 5+ slowed wards a floor. **Proposed:** as a floor's first wave begins, the ward nearest the lamp and one more per horror you field (3 at most) are sealed for the floor: can't be sold, fire 30% slower, and what they hit takes 25% more from everything else for 4 seconds. Each sealed ward lowers madness by 1. Keeps the old horror link.

**7. Bounty of the Deep (cursed) — can't work as balanced.** You can only build in light, and light is round the lamp, so most kills already happen in the back half. +60% there is a near-passive +60% essence (double the old relic, and Criss found essence too plentiful). 15% rite cooldown per kill means rites never wait. **Proposed flip, same theme:** kills on the far half of the path (toward the rifts) pay 50% more; kills within 3 tiles of the lamp pay half. You have to reach into the dark with candles, forks, mirrors. Water counts as far (a small Mother hook). Cut the rite refund.

**8. Ossuary Key — needs review.** Credit at the merchant works, but debt never survives to a wave: the stair's toll leaves negatives alone (`descend` 4097) and the next stipend (110–200) clears it on arrival, so "while in debt" is dead. +1 oil a wave is a lot of life. "The stair" here means the lamp. **Proposed:** the merchant sells down to −25 essence, paid out of the next stipend. For the next floor's first two waves after a purchase, kills within 2.5 tiles of the lamp pay +3 essence. Cut the oil and the Many-Mouthed hook.

**9. Leech Jar — can't work as numbered.** Candles slow everything in their light, so nearly every kill is "slowed" for four kits; 2 oil per 8 kills is far too much life. **Proposed:** a kill feeds the jar only while held, stunned, tethered, tangled, in salt or in water (not candle light). At 12 it restores 1 oil and bleeds everything in the lamp's light for 15 over 3 seconds, 30% slower. Every kit qualifies (salt, traps, tethers, Grasping Dead, pylons, chimes). Counter shows on the relic seal. Old saves carrying a count past 12 need clamping.

**10. Thunder Marrow — good, small fixes.** The best of the eleven. Arc must jump only to a ward that strikes (not salt, a wire or a trap), with the 3s per-ward cooldown. Every kit starts with a trigger: Hook Trap (Lamplighter, Whaler), Grasping Dead (Occultist), Pylon (Galvanist), Bone Chime (Bellringer). **Needs:** `chime`, `trap`, `grasp` or `pylon`. Bosses are stunned (briefly) and can trigger it. The Wrong Sun's double arc: fine but optional.

**11. Witch Salt — 11A can't work; 11B needs review.** 11A rests on wards burning out; only salt, Grasping Dead and Corpse Candles ever do. **11B (Dead Reckoning, key stays `witchsalt`)** is the right direction: a curse that rewards your light network for every kit (candles, Blubber, Corpse, Arc, forks). Its "60% radius, no longer grows with oil" premise is wrong (point 1). **Proposed:** the lamp burns 1.5 tiles smaller; wards standing outside the lamp's own light reach 40% farther and deal 25% more. Cut the flares. The Pray event ("Gain Salt Flats, or Witch Salt if you have it") then needs new text, since it reads `RELICS_RESTING`.

### The kit filter — good, with corrections
`relicPool()` (1004) ignores the kit today. Proposed: a relic's `needs` is a list of ward or rite keys; it's offered only if `run.wards`/`run.rites` holds one. Merchant and gift wards land in `run.wards` (`buyStock` 4002), so they count; there is no `run.giftWards`.

| Relic | Needs | Lamplighter | Whaler | Occultist | Galvanist | Bellringer |
|---|---|---|---|---|---|---|
| Brined Ledger, Salt Flats | `salt` | yes | yes | if bought | yes | if bought |
| Second Shadow | `effigy` | if bought | if bought | yes | if bought | if bought |
| Thunder Marrow | `chime`/`trap`/`grasp`/`pylon` | yes | yes | yes | yes | yes |
| Every other relic | none | yes | yes | yes | yes | yes |

"If bought" = from the merchant, the "Search the pack" event or a landing gift. Black Wick touches only the main lamp: no filter. Whetted Barbs: no filter (every kit's harpoon). Relic picks, the merchant, cursed picks and Herald drops all draw from `relicPool()`, so one filter covers them. The Pray event gives Salt along with its relic, so it stays as it is.

### Curses and patrons
Three curses (Sealing Wax, Bounty, Witch Salt/Dead Reckoning), as the brief allows. Every relic works with no patron. Patron hooks I'd keep: Bounty (water counts as far), Thunder Marrow (Sun double arc). The rest lean on things that don't exist (dread stacks, Sun rings).

### Teaching lines
Voice is right (second person, present, no exclamation marks). Rewrite them for the changed rules. Typo: "tangled inkelp".

### Balance changes to existing rules, if built as proposed
None to other relics or kits. The eleven change completely (old numbers listed in the build PR). Turning `RELICS_RESTING` off puts eleven more relics in the pool, so each relic offer is diluted.

**Decision needed (Criss):**
1. **Go** on the proposals above? (or name any you want as Gemini wrote them)
2. **Slot 11:** Dead Reckoning (my pick), or keep Witch Salt as a salt-only relic?
3. **Bounty of the Deep:** the flip (far kills pay), or Gemini's version with smaller numbers?

_Reviewed by Claude (Opus 5.5)._
