# The Last Lamp — Design Reference

Every table below is generated from the live code (`index.html`) by `tests/gen-design.js` + `tools/gen_design.py`, so the numbers are exact as of the last regeneration. If you change a data table in the code, regenerate this file in the same PR (`cd tests && npm run design`). Hand-written sections are marked ✍️.

**Global wave pacing:** wave group counts × `COUNT_MUL` = **1.35**, spawn gaps × `GAP_MUL` = **1.3**, group delays × `DELAY_MUL` = **1.25** (groups of 1, such as bosses and elites, are not multiplied).

## ✍️ Formulas

- **Creature health:** `hp = base × m`, where `m = 1.15 + 0.35 × floorIndex` (floor 1 → 1.15, floor 5 → 2.55). Then ×1.3 on elite floors, ×1.25 under the Ironhide omen, ×1.15 at depth ≥ 1. **Bosses** ignore all of that and get only ×1.3 at depth ≥ 4.
- **Kill bounty:** `round(ess × [0.9, 0.8, 0.7, 0.6, 0.5][floor] × (Bounty relic 1.3) × (Ironhide 1.3)) + (Gilded Teeth 2)`. Zero under Hungering. Only the **best** Tithe Bowl in range adds its per-kill bonus.
- **Calling a wave early:** `6 + 2 × wave + min(12, 3 + creatures on the board)` essence. **Break between waves:** `8 + 2 × wave`.
- **The toll (descending):** `salvage` is protected (half of what you invested in wards this floor). Everything above it keeps **30%** (0% with Gilded Teeth).
- **Lamp light radius:** `3.7 + Wick branch + Tallow 0.8 + Lamplighter kit 0.5 + Black Wick 1.2 + Black Mirror bonus − Moonless 1`, −1 more at madness tier 3, min 1.6. It flickers −0.6 at tier ≥ 1.
- **Madness thresholds:** `[6, 10, 14]` + Quiet Mind (+3) − Whispering omen (3) − pact penalties − A Thousand Eyes (2), with floors of 2/3/4. Tiers: **Calm → Whispers → Slipping → Leaning**. A horror's madness = its base − Sealing Wax (1) − Occultist kit (1), minimum 1; 0 with Choir in the Walls.
- **Starting oil:** 20 (15 at depth 5). Each creature that reaches the lamp drains its `oil` value. **Bosses drain 99: all-or-nothing.**
- **Embers per run:** `round((5 + flr² × 6 + 15 × bosses + 8 × elites + (won ? 30 : 0)) × (1 + 0.25 × depth))`, where `flr = floor reached (+1 if won)`.
- **Heavy creatures:** no stun; total slow capped at 15%.
- **Forks (floors 2 and 3):** a creature chooses only as it walks across a fork (anything born past one keeps its way), taking, in order: the way a working Weir leaves open (Watchers and bosses ignore it; a Behemoth smashes it and keeps the main way); the way a live Will-o’-Wisp marks (bosses ignore it); the main way if it is a Gnasher or a boss; its side if it is a Wretch's Skitterling born before the fork (one each way); otherwise the way with fewer path points inside **your** light (candles, Watchers; the lamp never counts), or, for Shades and Stalkers, the way with more. Ties, and anything under a Flare, keep the main way. Every branch is longer than the stretch of main way it replaces.
- **Horror stats** are fixed (no upgrade trees). Wards upgrade along branches: 3 branches × 3 tiers, and **only one branch per ward may reach tier 3** (the capstone).

## Creatures

| Key | Name | HP | Speed | Oil | Essence | Radius | Traits |
|---|---|---|---|---|---|---|---|
| `crawler` | Crawler | 26 | 0.95 | 1 | 4 | 0.29 |  |
| `skitter` | Skitterling | 12 | 1.7 | 1 | 2 | 0.21 |  |
| `gnasher` | Gnasher | 72 | 0.72 | 2 | 9 | 0.36 | bind |
| `watcher` | Watcher | 42 | 0.78 | 1 | 7 | 0.31 | bind, fly |
| `shade` | Shade | 30 | 1.15 | 1 | 6 | 0.27 | veiled |
| `wretch` | Ichor Wretch | 34 | 0.95 | 1 | 7 | 0.31 | bind, splits into 2 |
| `shrieker` | Shrieker | 52 | 1 | 1 | 8 | 0.31 | bind, aura |
| `elite` | Drowned Choirmaster | 380 | 0.5 | 6 | 45 | 0.46 | aura, elite |
| `boss` | The Keeper Below | 2600 | 0.42 | 99 | 0 | 0.6 | boss, spawner |
| `stalker` | Abyssal Stalker | 32 | 1.5 | 2 | 8 | 0.26 | veiled |
| `behemoth` | Trench Behemoth | 420 | 0.35 | 6 | 35 | 0.55 | heavy |
| `boss2` | The Primordial | 3400 | 0.38 | 99 | 0 | 0.75 | aura, boss, spawner |
| `lastkeeper` | The Last Keeper | 440 | 0.42 | 8 | 40 | 0.52 |  |
| `tithetaker` | The Tithe-taker | 400 | 0.5 | 8 | 0 | 0.5 |  |
| `bellfather` | The Bellfather | 520 | 0.36 | 8 | 40 | 0.56 |  |
| `gibberer` | Gibberer | 22 | 1.25 | 1 | 0 | 0.24 |  |
| `gorger` | Gorger | 56 | 0.8 | 2 | 0 | 0.36 |  |
| `husk` | Choir-Husk | 95 | 0.7 | 2 | 0 | 0.4 |  |
| `keeper` | Bound Keeper | 1 | 0 | 0 | 0 | 0.6 | bound |

`bind` = can drop a sigil you can bind as a horror. `veiled` = invisible unless unveiled. `aura` = buffs nearby creatures. `spawner` = calls minions. `keeper` is the bound form of the Keeper Below; it never spawns as an enemy. Spawnable: `crawler`, `skitter`, `gnasher`, `watcher`, `shade`, `wretch`, `shrieker`, `elite`, `boss`, `stalker`, `behemoth`, `boss2`, `lastkeeper`, `tithetaker`, `bellfather`, `gibberer`, `gorger`, `husk`.

## Wards

Base set (any kit may start with these): `candle`, `harpoon`, `salt`, `chime`, `trap`, `tithe`, `effigy`. Gift-only: `chime`, `censer`, `coil`, `lance`.

| Key | Name | Cost | Placement | Description |
|---|---|---|---|---|
| `candle` | Candle Ward | 30 | beside path | Casts light, unveils Shades, and slows whatever walks in it. |
| `harpoon` | Brine Harpoon | 40 | beside path | Fires barbed bolts at a single creature. *(aimed: First/Last/Strongest)* |
| `salt` | Salt Circle | 20 | path | Poured on the path. Anything crossing it moves at half speed until the salt scatters. |
| `chime` | Bone Chime | 60 | beside path | Rings out in a circle, stunning everything nearby. The four nearest take its full strike, the rest half. A boss it stuns goes deaf to chimes for 4 seconds. |
| `trap` | Hook Trap | 35 | path | Rusted jaws set on the path. They snap shut on the first thing that walks in, seen or unseen, then reset. |
| `tithe` | Tithe Bowl | 50 | beside path | Pays you essence for every creature that dies near it, and a tithe at every break between waves. |
| `effigy` | Hex Effigy | 40 | beside path | A pinned doll. Everything that passes near it is hexed for a while and takes 40% more damage from every source. |
| `censer` | Tar Censer | 70 | beside path | Lobs burning pitch that splashes a cluster. It hits whatever it lands on, lit or not. *(aimed: First/Last/Strongest)* |
| `coil` | Galvanic Coil | 75 | beside path | Throws lightning that leaps from creature to creature. Brine conducts: anything standing in salt takes double. *(aimed: First/Last/Strongest)* |
| `lance` | Whaling Gun | 90 | beside path | A slow, enormous harpoon. Double damage to heavy creatures, elites and bosses. *(aimed: First/Last/Strongest)* |
| `trypot` | Try-pot | 30 | beside path | An iron pot that renders the dead into whale oil. Build it where things die. Each Blubber Lamp drinks a measure from it as a wave begins. A full pot pours into the lamp, and whatever is left when the floor ends pours in too. |
| `grasp` | Grasping Dead | 0 | path | Three bodies rise as arms from a full pile of bones on the path. They seize each creature that walks over them and hold it 2 seconds, seen or unseen, lit or dark. After six they crumble. Bosses they hold only a moment; Behemoths and fliers pass free. |
| `pylon` | Pylon | 40 | beside path | An iron mast hung with porcelain and a jar of stored lightning. It links to other pylons within 3.5 tiles with a live wire across the ground; anything crossing a wire is shocked and stunned, and lit for a moment, Shades too. A wire needs a moment to recharge after each shock. The grid must reach the lamp: a pylon in the lamp’s own light is the mains. Behemoths snap wires; fliers pass over. |
| `mirror` | Signal Mirror | 45 | beside path | A mirror on an iron stand. Built in the lamp’s own light, it reflects the lamp in a beam 5 tiles long. Turn it between waves to aim the beam; it locks while the dark comes. The beam lights the ground it crosses, so you can build there, and burns whatever walks through it. |
| `risen` | The Risen | 0 | beside path | Raised from a pile of bones by the rite Raise the Dead. It bites whatever comes near, seen or unseen, harder for every bone it rose from and every tier of madness, and falls when the wave breaks. |
| `bellwire` | Bell Wire | 25 | path | A line of small bells strung across the path, and the one thing that can be strung in the dark. It does no harm: whatever crosses it is heard for 4 seconds, veiled or not, and its jangle hears whatever walks beside it. It rings again 2 seconds later. Three at most. Gnashers chew through it; fliers pass over. |
| `fork` | Tuning Fork | 35 | beside path | A steel fork on a hollow box. It gives no light: it hums. It stands anywhere within 5 tiles of the lamp or 3.5 of another fork, lit or dark, and you can build inside its hum even in the dark. Wards there are blind: they strike only what is heard, so keep the bell ringing. A toll that reaches it rings again from it, carrying the sound further. |
| `tocsin` | The Tocsin | 60 | beside path | An alarm bell cast as a mortar. It never aims at what is near it: when one of your Bell Wires jangles, there is a breath of silence, then it lobs a shell across the floor and bursts it on that wire, any distance away, in the dark or not. It reloads slowly, so where you string the wires is everything. |
| `weir` | Weir | 45 | path | A rotten floodgate set where the stair forks, lit or dark: it needs no light. It shuts one way; flip it between waves. Watchers fly over it. A Behemoth breaks it. |

### Upgrade trees (cost per tier; tier 3 is the capstone)

**Brine Harpoon**

| Branch | Tier 1 | Tier 2 | Tier 3 (capstone) |
|---|---|---|---|
| Speed | 35 — Reload 25% faster | 50 — Reload 25% faster again | 120 — Twin Reel: two bolts per shot |
| Strength | 35 — +6 damage | 55 — +8 damage | 130 — Piercing Barb: bolts pass through everything in a line |
| Sight | 30 — +0.4 range | 45 — +0.4 range | 110 — Deepwater Eye: fires into the dark and hits Shades |

**Candle Ward**

| Branch | Tier 1 | Tier 2 | Tier 3 (capstone) |
|---|---|---|---|
| Glow | 15 — +0.5 light | 25 — +0.5 light | 50 — Beacon: wards in its light deal 20% more damage |
| Wax | 15 — Slow rises to 30% | 25 — Slow rises to 40% | 50 — Tallow Snare: roots each creature for 1s the first time it enters |
| Ember | 15 — Burns 3 damage a second in its light | 25 — Burns 6 damage a second | 50 — Pyre: anything dying in its light bursts for 12 damage |

**Bone Chime**

| Branch | Tier 1 | Tier 2 | Tier 3 (capstone) |
|---|---|---|---|
| Resonance | 40 — +0.25 range | 60 — +0.25 range | 140 — Choir of Bone: every ring sounds twice, striking again |
| Toll | 40 — +0.3s stun | 60 — +0.3s stun | 140 — Deathknell: stunned creatures take 30% more damage from everything |
| Marrow | 40 — +6 damage | 60 — +8 damage | 140 — Shatter: its kills burst into shrapnel for 10 damage |

**Tar Censer**

| Branch | Tier 1 | Tier 2 | Tier 3 (capstone) |
|---|---|---|---|
| Swing | 45 — Lobs 25% faster | 65 — Lobs 25% faster again | 150 — Volley: three lobs at once |
| Pitch | 45 — Leaves burning ground, 4 damage a second | 65 — Burning ground, 7 damage a second | 150 — Inferno: wider pools, 10 damage a second, lasting 4s |
| Spread | 45 — +0.25 splash | 65 — +0.25 splash | 150 — Cluster: each lob splits into three |

**The Lamp**

| Branch | Tier 1 | Tier 2 | Tier 3 (capstone) |
|---|---|---|---|
| Wick | 40 — +0.5 light | 60 — +0.5 light | 120 — Sunlamp: +0.5 light, and lamplight unveils Shades |
| Reservoir | 35 — Refill 3 oil | 50 — Refill 3 oil | 100 — Wellspring: +1 oil after every wave |
| Fire | 40 — Scorches creatures beside it, 6 damage a second | 60 — Scorch rises to 10 damage a second | 130 — Corona: 16 damage a second within 2.2 tiles |

**Hook Trap**

| Branch | Tier 1 | Tier 2 | Tier 3 (capstone) |
|---|---|---|---|
| Barbs | 30 — +20 damage | 45 — +25 damage | 90 — Bloodletting: what it catches bleeds 10 damage a second for 4s |
| Spring | 30 — Resets 25% faster | 45 — Resets 25% faster again | 90 — Twin Jaws: snaps on two creatures at once |
| Chain | 25 — Holds 0.5s longer | 40 — Holds 0.5s longer | 90 — Drag Below: hauls its catch 1.5 tiles back along the path |

**Tithe Bowl**

| Branch | Tier 1 | Tier 2 | Tier 3 (capstone) |
|---|---|---|---|
| Greed | 35 — +2 essence per death nearby | 50 — +3 more per death | 110 — Gilded Tithe: the tithe between waves triples |
| Blood | 40 — Every 20 deaths nearby restore 1 oil | 55 — Every 14 deaths restore 1 oil | 120 — Blood Price: every 8 deaths nearby restore 1 oil |
| Reach | 30 — +0.5 range | 40 — +0.5 range | 90 — Sacrament: creatures in its range move 20% slower |

**Hex Effigy**

| Branch | Tier 1 | Tier 2 | Tier 3 (capstone) |
|---|---|---|---|
| Malice | 35 — Hexed creatures take 55% more | 50 — Hexed creatures take 70% more | 110 — Doom: hexed creatures burst for 18 when they die, hexing what they hit |
| Pins | 30 — Hexed creatures bleed 4 damage a second | 45 — Bleed rises to 8 a second | 100 — Voodoo: every hit on a hexed creature echoes 30% onto another |
| Wither | 30 — Hexed creatures move 12% slower | 45 — They move 24% slower | 100 — Unmasking: everything in its range can be seen, in the dark and veiled alike |

**Galvanic Coil**

| Branch | Tier 1 | Tier 2 | Tier 3 (capstone) |
|---|---|---|---|
| Capacitance | 45 — +6 damage | 60 — +8 damage | 130 — Overcharge: every fourth discharge strikes for triple |
| Conduction | 40 — Leaps to 1 more creature | 55 — Leaps to 1 more, and loses nothing per leap | 130 — Storm: leaps up to 2.6 tiles and stuns what it touches |
| Frequency | 40 — Discharges 25% faster | 55 — Discharges 25% faster again | 120 — Static Field: everything in range takes 5 damage a second |

**Whaling Gun**

| Branch | Tier 1 | Tier 2 | Tier 3 (capstone) |
|---|---|---|---|
| Powder | 55 — +25 damage | 75 — +35 damage | 150 — Flensing: what it strikes takes 25% more damage from everything for 5s |
| Breech | 50 — Reloads 25% faster | 70 — Reloads 25% faster again | 140 — Barbed Line: pins its target 1.5s, even heavy ones (bosses 0.5s) |
| Spyglass | 40 — +0.6 range | 55 — +0.6 range | 120 — Deep Sight: fires into the dark and at veiled things |

**Pylon**

| Branch | Tier 1 | Tier 2 | Tier 3 (capstone) |
|---|---|---|---|
| Voltage | 30 — Its wires shock for 6 more | 45 — 8 more again | 100 — Arc Flash: its wires stun twice as long |
| Span | 25 — Links 0.5 tiles further | 40 — 0.5 further again | 90 — Relay: it holds 2 more wires |
| Capacitor | 30 — Its wires recharge 20% faster | 45 — 20% faster again | 100 — Insulated: an Overload never fries it |

**Bell Wire**

| Branch | Tier 1 | Tier 2 | Tier 3 (capstone) |
|---|---|---|---|
| Chord | 20 — Its jangle hears 0.5 tiles further | 30 — 0.5 further again | 70 — Carillon: what its jangle hears is staggered for half a second |
| Rope | 20 — Rings again half a second sooner | 30 — Half a second sooner again | 70 — Tarred Rope: Gnashers cannot chew through it |
| Linger | 20 — What it hears stays heard 1 second longer | 30 — 1 second longer again | 70 — Marked: what it hears takes 15% more damage while heard |

**The Tocsin**

| Branch | Tier 1 | Tier 2 | Tier 3 (capstone) |
|---|---|---|---|
| Powder | 40 — +15 damage | 60 — +20 damage | 130 — Grapeshot: its burst is 0.6 tiles wider |
| Breech | 40 — Reloads 20% faster | 60 — 20% faster again | 130 — Ready Rounds: it holds two shells |
| Clang | 35 — Its burst rings: what it hits is heard 2 seconds, veiled too | 50 — And staggered for half a second | 120 — Crack Shot: its burst lays two cracks, not one |

**Tuning Fork**

| Branch | Tier 1 | Tier 2 | Tier 3 (capstone) |
|---|---|---|---|
| Pitch | 15 — Its hum spreads 0.5 tiles wider | 25 — 0.5 wider again | 50 — Long Note: the next fork can stand 2 tiles further from it |
| Sustain | 15 — What its ring hears stays heard 0.5s longer | 25 — 1s longer | 50 — Drone: it rings by itself every 5 seconds of a wave, with no Noise |
| Overtone | 15 — Its ring carries 0.5 tiles further | 25 — 0.5 further again | 50 — Overtone: its ring hears veiled things too, and cracks twice |

## Horrors (bound creatures)

| Key | Name | Cost | Madness | Range | Damage / effect | Description |
|---|---|---|---|---|---|---|
| `gnasher` | Bound Gnasher | 30 | 3 | 1.35 | 24 dmg every 1.11s | Bites whatever passes within reach. Brutal and short-ranged. |
| `watcher` | Bound Watcher | 25 | 2 | 3.4 | 5 dmg every 0.83s | Its gaze is light. Everything in range is lit and unveiled, Shades included. |
| `wretch` | Bound Wretch | 35 | 3 | 2.5 | 4 dmg every 1.25s; poison 6/s | Spits ichor that poisons for 6 damage a second over 3 seconds. |
| `shrieker` | Bound Shrieker | 40 | 4 | 2 | 4 dmg every 3.00s; push 1.3 | Every 3 seconds it screams everything in range backward along the path. |
| `elite` | Bound Choir | 50 | 5 | 2.4 | 6 dps; slow 35% | A drowned hymn. Everything in range slows by 35% and rots for 6 damage a second. |
| `keeper` | Bound Keeper | 90 | 7 | 3.2 | 65 dmg every 2.50s | The conquered lord of the Throat. Colossal damage and range. Radiates dread that slows all nearby. |

## Rites

| Key | Name | Cooldown | Effect |
|---|---|---|---|
| `flare` | Flare | 28s | Everything on the floor is lit and unveiled for 5 seconds. |
| `pillar` | Pillar of Salt | 22s | Tap the board. Everything nearby freezes for 2.5 seconds and takes 10 damage. |
| `bell` | Drowning Bell | 34s | Every creature on the floor takes 25 damage, lit or not. |
| `wisp` | Will-o’-Wisp | 30s | Tap a way at a fork. For 8 seconds, everything that reaches the fork follows the wisp, whatever it wants. Bosses ignore it. |
| `name` | Name the Thing | once per floor | Once per floor. Tap a visible creature and its whole kind takes 60% more damage until the floor ends. |
| `kindle` | Kindle | 30s | Tap a creature you can see. It burns for 8 seconds: it lights the dark around it, wakes your wards there, and takes fire damage, but it runs faster. Bosses burn without running. |
| `anchor` | Grounding Anchor | 30s | Tap anywhere to drive a grounding spike into the floor for 8 seconds. Every powered pylon within 3.5 tiles is forced to link to it. Its wires never shock: they make a cage. A creature you could bind that dies inside a triangle of the Anchor and two wired pylons is caught; tap it within 5 seconds to capture it. The Anchor burns out when it catches something, and a capture draws 2 Heat out of your grid. |
| `overload` | Overload | once per floor | Paid in oil, not time: 2 oil, and every live wire fires at once at triple strength, arcs leap between your pylons, and every wire recharges. Each Overload adds Heat, which cools 1 every 10 seconds. Cast at 3 Heat or more, it fries your hardest-worked pylons. |
| `haul` | Haul Away | 24s | Tap the path to cast a whaling net. Everything under it, and everything already on one of your lines, is hauled 3 tiles back down the path and left tangled, 50% slower for 3 seconds. Behemoths are dragged only a tile; bosses only tangle. |
| `raise` | Raise the Dead | 30s | Tap a pile of bones. Its dead stand up beside the path as a Risen that bites whatever comes near, seen or unseen, until the wave breaks. The more bones, the harder it bites. |
| `unbind` | Unbind | 25s | Tap one of your horrors on the board. It breaks its binding and charges down the path toward where they come from, tearing through everything in its way. Then it is gone for good. |
| `toll` | Toll | 3s | The lamp tolls. A ring sweeps 7 tiles out from it, and everything it touches is heard for 1.5 seconds: outlined in the dark, veiled or not, and every ward can strike it. Each toll makes Noise. At 5 Noise the dark answers, and two Abyssal Stalkers climb toward the sound. With Peal, tap it on the lamp’s own beat for a Perfect Toll: half again as far, and half the Noise. |
| `greatbell` | The Great Bell | 30s | One huge toll across the whole floor. Everything is heard for 4 seconds, veiled or not, and staggered for half a second. It makes 3 Noise. |
| `ebb` | The Ebb | 30s | The water draws back. Everything standing in it is dragged 2 tiles back down the path. Bosses and Behemoths hold their ground. |
| `feed` | Feed the Dark | 22s | The lamp gutters for 2.5 seconds and burns 1.2 smaller. Everything within 3 tiles of it is dragged 1.5 tiles back (a Behemoth a third as far, never a boss), and your horrors strike twice as fast and into the dark. In a wave, you carry 4 dread until it breaks. |

## Kits

| Key | Name | Wards | Rites | Starts with | Unlock | Perk |
|---|---|---|---|---|---|---|
| `lamplighter` | The Lamplighter | candle, harpoon, mirror, salt, trap, tithe | kindle, pillar | — | open | Your Signal Candles pass light to one another across the dark, up to 4 tiles apart. Your harpoons fire flare bolts. Kindle a creature and it becomes a running torch. A Signal Mirror throws the lamp’s light down the path in a burning beam. |
| `whaler` | The Whaler | candle, harpoon, salt, trap, lance, trypot | haul, bell | — | Deed: Kill a Trench Behemoth with harpoons alone. | Your Blubber Lamps burn wide but cost the lamp oil each wave, unless your Try-pot renders it from the dead. Your harpoons hold what they hit on a line, and Haul Away casts a net that hauls a crowd back and tangles it. Starts with the Whaling Gun. |
| `occultist` | The Occultist | candle, harpoon, grasp, effigy, tithe | unbind, raise | watcher×1, gnasher×1 | Deed: Break a wave with your madness at Slipping or deeper. | Your Corpse Candles are free and need no lamp, but stand only where something died, and go out when the wave ends. Madness feeds you: your Bone Spears and your horrors hit harder with every tier. Unbind sends a horror charging down the stair. Starts with a bound Watcher and a bound Gnasher. |
| `galvanist` | The Galvanist | candle, harpoon, pylon, salt, coil | overload, anchor | — | Ember Hall (`kit_galvanist`) | A mad scientist with a power grid. Pylons string live wires across the path that shock and light what crosses them, if the grid reaches the lamp. Arc Lamps burn bright but flicker. Lightning Rods plant where they strike and join the grid. Overload fires every wire at once, paid in oil, and run too hot it fries your pylons. No ritual binds for him: the Grounding Anchor cages what dies in its circuit. Starts with the Galvanic Coil. |
| `bellringer` | The Bellringer | fork, harpoon, bellwire, tocsin, chime, censer | toll, greatbell | — | Ember Hall (`kit_bellringer`) | Agathe Vell rang the bell of St. Agatha’s as the town went under, and came back up the stair blind. She sees by sound. Toll the lamp and everything its ring touches is heard: outlined in the dark, veiled or not, and every ward can strike it, until its echo fades to a ghost. Each Toll makes Noise, and at 5 the dark answers with Stalkers; tap it on the lamp’s own beat for a Perfect Toll. Her bells crack what they strike, and three cracks shatter it. She builds no candles: her Tuning Forks hum in the dark, and she can build inside their hum, but wards there strike only what is heard. Tolls echo back off the walls, and heavy things leave footsteps in the dark; Shades and Stalkers make none. Bell Wires can be strung anywhere on the path, and the Tocsin shells whatever trips them, however far. Clapper Harpoons ring what they strike. She hears the path, even in the dark. She is the only kit that starts with the Bone Chime. |

### Kit wards

A kit's own version of a ward. Underneath it is the same ward (same key, cost, branches, relics and omens); only its name and its twist differ.

| Kit | Replaces | Name | What it does |
|---|---|---|---|
| `lamplighter` | `candle` | Signal Candle | Casts light, unveils Shades, and slows what walks in it. Its light leaps up to 4 tiles to another Signal Candle, even across the dark. |
| `lamplighter` | `harpoon` | Flare Harpoon | Fires barbed bolts at a single creature. Each bolt flares where it strikes, lighting what stands near it for a moment. |
| `whaler` | `candle` | Blubber Lamp | A lamp of rendered fat. It burns almost a tile wider than a candle, but it drinks: as each wave begins, every Blubber Lamp takes a measure from a Try-pot, or 1 oil from the lamp if the pots are dry. |
| `whaler` | `harpoon` | Tether Harpoon | Fires barbed bolts on a line. The line holds what it strikes and slows it more the longer it holds, until the harpoon fires at something else. |
| `galvanist` | `candle` | Arc Lamp | A glass bulb on a coil-wound post. It shines brighter than a candle but flickers: every few seconds in a wave it cuts out for half a second, and whatever needs its light goes dark with it. When it flares back on, everything in its light is shocked. |
| `galvanist` | `harpoon` | Lightning Rod | Fires copper-tipped bolts. Each one stays planted where it strikes for a few seconds, and while it stands it is a pylon: wires link to it, and coil lightning arcs through it. |
| `bellringer` | `harpoon` | Clapper Harpoon | Fires bronze-headed bolts that ring when they strike. What it hits is heard for 2 seconds, in the dark too, and knocked half a tile back down the path. |
| `occultist` | `candle` | Corpse Candle | Free, and it needs no lamp: it burns on the dead. It can only stand beside the path where something died this floor, and each one uses up a body. It goes out when the wave ends. |
| `occultist` | `harpoon` | Bone Spear | Fires a spear of sharpened bone at a single creature. The madder you are, the harder it hits: 25% more for each tier of madness. |

**Signal Candle (`lamplighter`, replaces candle)**

| Branch | Tier 1 | Tier 2 | Tier 3 (capstone) |
|---|---|---|---|
| Lens | 15 — A polished lens: +0.5 light | 25 — A finer lens: +0.5 light | 50 — Beacon: wards in its light deal 20% more damage |
| Signal | 15 — Its light leaps 1 tile further | 25 — Leaps 1 tile further again | 50 — Fire Thread: anything that crosses its threads catches fire |
| Burner | 15 — The lantern runs hot: its light burns 3 damage a second | 25 — Hotter: 6 damage a second | 50 — Pyre: anything dying in its light bursts for 12 damage |

**Flare Harpoon (`lamplighter`, replaces harpoon)**

| Branch | Tier 1 | Tier 2 | Tier 3 (capstone) |
|---|---|---|---|
| Windlass | 35 — A quicker crank: reloads 25% faster | 50 — Reloads 25% faster again | 120 — Twin Reel: two flare bolts per shot |
| Heavy Bolts | 35 — +6 damage | 55 — +8 damage | 130 — Piercing Flare: bolts pass through everything in a line |
| Flare | 30 — Flares burn wider | 45 — Flares burn a second longer | 110 — Starshell: every fourth bolt lights a wide circle for 4 seconds |

**Blubber Lamp (`whaler`, replaces candle)**

| Branch | Tier 1 | Tier 2 | Tier 3 (capstone) |
|---|---|---|---|
| Fat | 15 — More fat in the dish: +0.5 light | 25 — A heaped dish: +0.5 light | 50 — Beacon: wards in its light deal 20% more damage |
| Smoke | 15 — Its greasy smoke slows by 30% | 25 — Thicker smoke: slows by 40% | 50 — Tar Snare: the smoke roots each creature for 1s the first time it enters |
| Reek | 15 — Its smoke clings: what leaves its light stays slowed 2 seconds | 25 — It clings 4 seconds | 50 — Lure: at a fork, everything but a boss takes the way it lights |

**Tether Harpoon (`whaler`, replaces harpoon)**

| Branch | Tier 1 | Tier 2 | Tier 3 (capstone) |
|---|---|---|---|
| Winch | 35 — A geared winch: reloads 25% faster | 50 — Reloads 25% faster again | 120 — Twin Reel: two lines per shot |
| Iron | 35 — A heavier iron: +6 damage | 55 — +8 damage | 130 — Through-Iron: bolts pass through everything in a line |
| Line | 30 — The line slows by up to 55% | 45 — The line holds a tile further out | 110 — Reel In: every 4 seconds the line hauls its catch a tile back |

**Arc Lamp (`galvanist`, replaces candle)**

| Branch | Tier 1 | Tier 2 | Tier 3 (capstone) |
|---|---|---|---|
| Filament | 15 — A thicker filament: +0.5 light | 25 — +0.5 light again | 50 — Floodlight: wards in its light deal 20% more damage |
| Field | 15 — Its field numbs: what stands in it slows by 30% | 25 — Slows by 40% | 50 — Seize: the first time each creature enters, the current locks its limbs for 1s |
| Spark | 15 — Its flare shocks for 4 more | 25 — 4 more again | 50 — Steady Current: it never cuts out, and still flares |

**Lightning Rod (`galvanist`, replaces harpoon)**

| Branch | Tier 1 | Tier 2 | Tier 3 (capstone) |
|---|---|---|---|
| Solenoid | 35 — A stronger solenoid: fires 25% faster | 50 — Fires 25% faster again | 120 — Twin Rods: two bolts per shot |
| Copper | 35 — A heavier copper tip: +6 damage | 55 — +8 damage | 130 — Arc Bolt: bolts pass through everything in a line |
| Charge | 30 — Rods stand 2 seconds longer | 45 — Each harpoon keeps 3 rods | 110 — Thunderhead: a rod bursts when it falls, shocking all within 1.5 tiles |

**Pylon (`galvanist`, its own pylon)**

| Branch | Tier 1 | Tier 2 | Tier 3 (capstone) |
|---|---|---|---|
| Voltage | 30 — Its wires shock for 6 more | 45 — 8 more again | 100 — Arc Flash: its wires stun twice as long |
| Span | 25 — Links 0.5 tiles further | 40 — 0.5 further again | 90 — Relay: it holds 2 more wires |
| Capacitor | 30 — Its wires recharge 20% faster | 45 — 20% faster again | 100 — Insulated: an Overload never fries it |

**The Lamp (`galvanist`, its own lamp branches)**

| Branch | Tier 1 | Tier 2 | Tier 3 (capstone) |
|---|---|---|---|
| Carbon | 40 — Thicker carbons: +0.5 light | 60 — +0.5 light again | 120 — Floodlamp: +0.5 light, and lamplight unveils Shades |
| Accumulator | 35 — Refill 3 oil | 50 — Refill 3 oil | 100 — Wellspring: +1 oil after every wave |
| Dynamo | 40 — Every wire recharges 20% faster | 60 — 20% faster again | 130 — Static Burst: when something comes close, the lamp discharges and stuns everything near it, then recharges |

**Tuning Fork (`bellringer`, its own fork)**

| Branch | Tier 1 | Tier 2 | Tier 3 (capstone) |
|---|---|---|---|
| Pitch | 15 — Its hum spreads 0.5 tiles wider | 25 — 0.5 wider again | 50 — Long Note: the next fork can stand 2 tiles further from it |
| Sustain | 15 — What its ring hears stays heard 0.5s longer | 25 — 1s longer | 50 — Drone: it rings by itself every 5 seconds of a wave, with no Noise |
| Overtone | 15 — Its ring carries 0.5 tiles further | 25 — 0.5 further again | 50 — Overtone: its ring hears veiled things too, and cracks twice |

**Clapper Harpoon (`bellringer`, replaces harpoon)**

| Branch | Tier 1 | Tier 2 | Tier 3 (capstone) |
|---|---|---|---|
| Crank | 35 — A quicker crank: fires 25% faster | 50 — Fires 25% faster again | 120 — Twin Clappers: two bolts per shot |
| Bronze | 35 — Heavier bronze: +6 damage | 55 — +8 damage | 130 — Tolling Bolt: bolts pass through everything in a line |
| Ring | 30 — What it strikes is heard 1 second longer | 45 — Its knock sends them a quarter tile further | 110 — Peal Bolt: each strike rings out, hearing everything within 1.5 tiles, veiled too |

**Bell Wire (`bellringer`, its own bellwire)**

| Branch | Tier 1 | Tier 2 | Tier 3 (capstone) |
|---|---|---|---|
| Chord | 20 — Its jangle hears 0.5 tiles further | 30 — 0.5 further again | 70 — Carillon: what its jangle hears is staggered for half a second |
| Rope | 20 — Rings again half a second sooner | 30 — Half a second sooner again | 70 — Tarred Rope: Gnashers cannot chew through it |
| Linger | 20 — What it hears stays heard 1 second longer | 30 — 1 second longer again | 70 — Marked: what it hears takes 15% more damage while heard |

**The Tocsin (`bellringer`, its own tocsin)**

| Branch | Tier 1 | Tier 2 | Tier 3 (capstone) |
|---|---|---|---|
| Powder | 40 — +15 damage | 60 — +20 damage | 130 — Grapeshot: its burst is 0.6 tiles wider |
| Breech | 40 — Reloads 20% faster | 60 — 20% faster again | 130 — Ready Rounds: it holds two shells |
| Clang | 35 — Its burst rings: what it hits is heard 2 seconds, veiled too | 50 — And staggered for half a second | 120 — Crack Shot: its burst lays two cracks, not one |

**The Lamp (`bellringer`, its own lamp branches)**

| Branch | Tier 1 | Tier 2 | Tier 3 (capstone) |
|---|---|---|---|
| Votive | 40 — A votive wick: +0.5 light | 60 — +0.5 light again | 120 — Sanctuary Lamp: +0.5 light, and lamplight unveils Shades |
| Font | 35 — Refill 3 oil | 50 — Refill 3 oil | 100 — Wellspring: +1 oil after every wave |
| Peal | 60 — The lamp tolls on its own every 4 seconds of a wave, 5 tiles out, and makes no Noise | 80 — It tolls every 3.5 seconds | 150 — Cathedral: every toll of the lamp staggers everything within 2 tiles for half a second |

**Corpse Candle (`occultist`, replaces candle)**

| Branch | Tier 1 | Tier 2 | Tier 3 (capstone) |
|---|---|---|---|

**Bone Spear (`occultist`, replaces harpoon)**

| Branch | Tier 1 | Tier 2 | Tier 3 (capstone) |
|---|---|---|---|
| Sinew | 35 — Corded sinew: hurls 25% faster | 50 — Hurls 25% faster again | 120 — Twin Spears: two spears per throw |
| Splinter | 35 — A sharper splinter: +6 damage | 55 — +8 damage | 130 — Splintering Spear: it passes through everything in a line |
| Dread | 30 — Each tier of madness adds 10% more | 45 — Each tier adds 10% more again | 110 — Soul Spear: what it kills leaves its sigil, if its kind can be bound |

Bellringer numbers: a toll's ring sweeps **8** tiles a second out to **7** tiles; what it touches is heard for **1.5s**. Toll has a **3s** swing and makes 1 Noise; Noise fades 1 per **8s**, and at **5** the dark answers with **2** Abyssal Stalkers and Noise drops to **2**. Bell Wires (at most **3**) hear what crosses them for **4s** and jangle within **1.5**, ringing again after **2s**. A Clapper bolt rings its target for **2s** and knocks it back **0.5** tiles. Peal tolls every **4s**; Cathedral staggers within **2** for **0.5s**. The Great Bell is heard **4s**, staggers **0.5s** and makes **3** Noise. Ghosts last **1.1s**, **24** at most.

Heralds: floor 2: lastkeeper, tithetaker, bellfather, floor 3: lastkeeper, tithetaker, bellfather, floor 4: lastkeeper, tithetaker, bellfather. The Last Keeper carries a lamp of **1.4** tiles and snuffs every candle within **1.3** for **6.5s**. The Tithe-taker takes **2** essence a second into its sack, and pays back **×1.5** when slain. The Bellfather tolls every **5s**: wards within **2.2** reel for **2s**. A Herald drains its oil at the lamp but never ends the run by itself, pays a relic when slain, and a run never meets the same one twice. None can be held forever: **3s** stunned or pinned (easing **1**/s while it walks) and it breaks free, shrugging off every hold for **3s**.

Tuning Forks stand within **5** tiles of the lamp or **3.5** of a reached fork, hum **2.3** tiles (build there in the dark; wards strike only what is heard) and ring a toll on **3** tiles; Drone rings every **5s**. Echoes off the walls hear for **1s**. Unseen heavy things leave a footstep ripple every **0.55s** (at most **40** at once).

The Tocsin answers a Bell Wire after **0.6s** of silence; its shell flies **0.9s** (more for distance), deals **40** in **1.1** tiles, and it reloads in **5s**. Resonance: **3** cracks shatter a creature (**5** for Behemoths and elites, **8** for bosses); a crack fades after **3s** without a ring. A shatter deals **20** + **0.1** of its health (bosses **120**) and **12** to everything within **1**, cracking it. A Perfect Toll lands within **0.25s** of the lamp's beat.

Bone Chime: the **4** creatures nearest take its full strike, the rest **×0.5**. A boss it stuns is deaf to every chime for **4s**. Found on the stair (gift, merchant, pack); only the Bellringer starts with it.

Galvanist numbers: pylons link within **3.5** tiles, **3** wires each; a wire shocks for **12**, stuns **0.4s** (bosses 0.15s), lights what it touches for **1.2s**, then recharges **1.5s**. Lightning Rods stand **5s**, **2** per harpoon. The Arc Lamp shines **+0.4**, cuts out **0.5s** of every **4s** in a wave, and flares for **6** with a **0.3s** stun. Overload costs **2** oil, strikes at **×3**, adds 1 Heat (cools 1 per **10s**), and at **3** Heat or more fries pylons. Static Burst fires when something is within **1.5** of the lamp, stuns everything within **2.5** for **1.2s**, every **12s**. The Grounding Anchor stands **8s**; a catch waits **5s** for a tap and a capture vents **2** Heat.

Own wards and rites: the Lamplighter's Signal Mirror throws a beam **5** tiles long (lit in patches of **0.8**) that burns **5** a second, and only while it stands in the lamp's own light. The Whaler's Haul Away casts a net of radius **1.6**: everything under it, and everything on its lines, slides **3** tiles back over 0.45s (Behemoths a third as far, bosses not at all) and is tangled, **50%** slower for **3s**.

Occultist numbers: a Corpse Candle costs nothing, needs no lamp, stands within **1.5** tiles of a body from this floor (one body per candle) and goes out when the wave breaks. A death within **1.5** tiles of a pile joins it; a pile holds **3**, a death beside a full one scatters, and a floor keeps the freshest **12** bodies. The first floor of an Occultist descent starts with two piles. The Grasping Dead rise from a full pile (its three bodies), need no light, hold each creature **2s** (bosses **0.5s**) and crumble after **6** grips. Raise the Dead stands a pile up as a Risen beside it: **14** damage per bone (× the horrors' madness bonus), range **1.5**, **1** bites a second, until the wave breaks. A Bone Spear deals **+25%** per tier of madness (Dread adds **+10%** per tier per level). Horrors deal **+20%** per tier. Unbind charges at **7** tiles a second, dealing **30 + 20 × the horror's madness** to each creature it passes, and stuns for 1s (bosses 0.3s, Behemoths not at all).

Whaler numbers: a Blubber Lamp burns **+0.8** light; while any stands, each wave costs 1 oil unless a Try-pot has a measure. The Try-pot reaches **2.4** tiles; each death gives up its oil value (at most 6); every **6** makes a measure; it holds **4**, and a full pot pours 1 oil into the lamp instead. The line slows by **0.12** a second held, up to **40**%; Reel In hauls back 1 tile every **4s**.

Numbers: Signal Candle light leaps **4** tiles. A flare bolt lights **1.3** tiles for **1.5s** (at most 8 at once); a Starshell lights **3** tiles for **4s**. A Fire Thread kindles what crosses it for **2s**. Kindle burns **8s**, lights **1.8** tiles, deals **5** damage a second, and the creature moves **×1.25** (bosses don't hurry).

## Relics

| Key | Name | Cursed | Pack | Needs | Effect |
|---|---|---|---|---|---|
| `tallow` | Tallow of Saints |  | base |  | Your wards that stand in the outermost tile of the lamp’s own light fire 25% faster. When the lamp shrinks, the edge moves in with it. |
| `reserve` | Oil Reserve |  | base |  | Restore 4 oil. Oil you gain past the brim is not lost: it spills, 8 at most. In a wave, the spill burns on the path under the foremost creature in the lamp’s light. |
| `whetted` | Whetted Barbs |  | base |  | Your harpoon and Whaling Gun leave a barb in what they strike, three at most, each slowing it 10%. When it dies, each barb tears free into the nearest thing you can see within 2.5 tiles, for half the blow. |
| `saltflats` | Salt Flats |  | base | `salt` | Two Salt Circles within 2.5 tiles of each other salt the path between them. A bridge wears the nearer circle, and refilling one refills both. |
| `quiet` | Quiet Mind |  | base |  | Build, upgrade and cast nothing for 10 seconds of a wave and you are still: madness counts 3 lower, and your next ward or upgrade costs 30% less. Acting ends it. A Toll does not. |
| `wax` | Sealing Wax | yes | base |  | As each floor’s first wave begins, your striking ward nearest the lamp is sealed, and one more for each horror you field (three at most). Each lowers madness by 1, and what it strikes takes 25% more for 4 seconds. But it fires 30% slower and cannot be sold. |
| `bounty` | Bounty of the Deep | yes | base |  | Kills on the far half of the path, toward where they climb out, pay 40% more essence. Kills on the near half pay 25% less. Water always counts as far. |
| `binder` | Binder’s Thread |  | base |  | Bindable creatures leave their sigil twice as often. |
| `ledger` | Brined Ledger |  | base | `salt` | Salt Circles also burn whatever stands in them, 6 damage a second. |
| `veil` | Mourning Veil |  | base |  | Shades and Abyssal Stalkers can be seen wherever there is light. |
| `key` | Ossuary Key |  | base |  | Merchants sell on bone credit, down to −25 essence, paid out of the next floor’s purse. For the first two waves after you buy, kills within 2.5 tiles of the lamp pay 3 more. |
| `compass` | Drowned Compass |  | base |  | The stair forks into four doors instead of three. |
| `blackwick` | Black Wick | yes | base |  | The lamp burns 1.2 tiles wider, but loses 1 oil at the start of every wave. |
| `glass` | Glass Lantern | yes | base |  | The lamp holds 6 less oil, but everything you field deals 15% more damage. |
| `leech` | Leech Jar |  | relics_deep |  | A kill feeds the jar only if it dies held, stunned, on a line, tangled, in salt or in water. At 8 the jar bursts: 1 oil, and everything in the lamp’s light bleeds 15 over 3 seconds and walks 30% slower. |
| `shadow` | Second Shadow |  | relics_deep | `effigy` | Hexes linger twice as long after leaving an Effigy. |
| `marrow` | Thunder Marrow |  | relics_deep | `chime`, `trap`, `grasp`, `pylon`, `coil` | When a ward of yours stuns, shocks or seizes a creature, thunder leaps to your nearest striking ward within 2.5 tiles of it: that ward fires at once and deals 25% more for 3 seconds. Each ward sends it once every 3 seconds. In the Wrong Sun’s glare it leaps to two. |
| `witchsalt` | Dead Reckoning | yes | relics_deep |  | The lamp burns 1.5 tiles smaller, and every light you build costs double: candles, forks, pylons, wires, try-pots, mirrors. A ward past the edge of the lamp's own light, where only your lights reach, strikes 40% farther and deals 25% more. The Occultist's candles stay free, but shine 40% less far out there. Tap a ward to see if it counts. |
| `choirwalls` | Choir in the Walls | yes | relics_forbidden |  | Horrors cost no madness, but a horror you field is never yours again. Recall it, or carry it to the stair, and it goes into the walls: your roster loses it. |
| `gilded` | Gilded Teeth | yes | relics_forbidden |  | Every kill pays 2 more essence, but the stair burns all essence except your salvage. |
| `hollow` | Hollow Crown | yes | relics_forbidden |  | Every gift offers one more choice, but the lamp holds 4 less oil. |
| `eyes` | A Thousand Eyes | yes | relics_forbidden |  | Everything in light can be seen, veiled or not, but every madness threshold sits 2 lower. |

**Offered only if you can use it** (#89): a relic with needs is offered only to a run holding one of those wards or rites (its kit's, or one bought, gifted or found).

Numbers (#89): Oil Reserve restores **4**, spills up to **8**, burns **0.4** spill a second as fire of **14**/s for **3s**. Tallow of Saints: edge **1** tile, wait ×**0.8**. Whetted Barbs: **3** barbs, **0.1** slow each, torn **2.5** tiles for **0.5** of the blow. Salt Flats bridges circles within **2.5**. Quiet Mind: still after **10s**, madness **−3**, next build ×**0.7**. Sealing Wax: **3** at most, wait ×**1.43**, mark ×**1.25** for **4s**. Bounty of the Deep: far ×**1.4**, near ×**0.75**. Ossuary Key: credit **25**, **2** waves, within **2.5** tiles, **+3**. Leech Jar: **8** kills, **1** oil, bleed **15** over **3s**, slow **0.3**. Thunder Marrow: **2.5** tiles, every **3s** per ward, ×**1.25** for **3s**. Dead Reckoning: lamp **−1.5**, range ×**1.4**, damage ×**1.25**.

## Patrons

At the landing the gift is a patron's offering instead, half the time (a quarter if one already reached out on that floor); between waves one reaches out at **15%** of breaks (once a floor). Take one or refuse. Each gift is +1 Attention.

**The Drowned Mother** (`mother`): She lies under all the water below the stair. She gives freely, and she remembers everything she gives.

| Attention | Tier | What changes |
|---|---|---|
| 1 | Noticed | Water stands on the path of every floor. Its current carries creatures through it 30% faster. |
| 3 | Watched | The water rises: as each wave begins, the flood creeps one tile further up the path. |
| 5 | Claimed | Whatever walks in her water goes under. It cannot be seen or struck there unless something unveils it. |
**The Wrong Sun** (`sun`): An alien light that burns above the dark stair. It shines without heat and sears whatever stands beneath its glare.

| Attention | Tier | What changes |
|---|---|---|
| 1 | Noticed | Three bright spots burn on the path of every floor. Whatever stands in one is seen. But a Stalker that crosses one has seen the lamp, and runs 40% faster for 3 seconds. |
| 3 | Watched | The glare spreads onto the stone beside each spot, and sears whatever stands in a spot, 3 a second. As each wave begins, another spot opens. |
| 5 | Claimed | Your wards that stand in the glare fire 25% slower. |
**The Many-Mouthed** (`mouths`): It gnaws at the roots of the stair, where the names were eaten. It lends you teeth, and comes up to count them.

| Attention | Tier | What changes |
|---|---|---|
| 1 | Noticed | Its creatures climb with every wave, shaped by what you build: Gibberers for your wards, Gorgers for your horrors. Nothing it sends leaves essence, bones or sigils. |
| 3 | Watched | You carry 3 dread on every floor, and one more of its creatures climbs each wave. Gorgers snuff candles and silence forks too. |
| 5 | Claimed | A Choir-Husk climbs with every wave and veils whatever walks near it. Bindings may break at Whispers, and half the time at Slipping or deeper. |

Many-Mouthed numbers: Watched carries **3** dread; each Gibberer alive adds **2** (at most **6**), and a ward within **1.6** tiles of one waits **×1.25** between shots. A Gorger takes **×0.65** from horrors; every **4.5s** (the first after 1.5s) it lashes a horror within **2** tiles (once Watched, a candle or fork within **1.8**), dazing or snuffing it **2s** and healing **8**. A Choir-Husk veils what walks within **1.8** tiles (not itself, a boss or a Herald). Dread counts toward the madness tiers; only paid horrors' madness feeds the Occultist and opens Unpaid Teeth.

Water numbers: current **×1.3**; a floor floods **2** stretches of **3** tiles; it rises to at most **14** tiles; "beside water" is within **1.5** tiles.

| Key | Offering | Patron | Kit | Effect |
|---|---|---|---|---|
| `brine` | Brine Pools | mother |  | Your Salt Circles turn to brine. They no longer slow: each pool drags whatever wades into it a tile back, once. Bosses and Behemoths wade on. |
| `undertow` | Undertow | mother |  | A harpoon bolt that strikes something standing in water holds it under for a second. A boss, for a moment. |
| `hymn` | Hymn Under the Water | mother |  | Everything standing in water hears your Bone Chimes, wherever it is. Each ring strikes and stuns it too. |
| `milk` | Her Milk | mother |  | What dies in water feeds the lamp: every 4 deaths there restore 1 oil. |
| `cradle` | The Cradle | mother |  | Once, when a creature would put the lamp out, she catches it and leaves it 5 oil. Not a boss. When she does, her Attention rises by 2. |
| `ebb` | The Ebb | mother |  | A new rite. The water draws back, and drags everything standing in it 2 tiles back down the path. Bosses and Behemoths hold their ground. |
| `still` | Still Water | mother | lamplighter | Signal Candles that stand beside water pass their light to each other through it, however far apart. |
| `drowned` | Drowned Flares | mother | lamplighter | A flare bolt that strikes something standing in water floats there, and burns three times as long. |
| `deep` | Into the Deep | mother | whaler | Whatever is on your line cannot move while it stands in water, for up to 3 seconds a catch. Bosses and Behemoths still can. |
| `livewater` | Live Water | mother | galvanist | A wire that touches water electrifies it: each time it shocks something, everything standing in that water is shocked too. |
| `drownedpeal` | The Drowned Peal | mother | bellringer | Her water carries the bell. Every time the lamp tolls, whatever stands in her water is heard, anywhere on the floor, veiled or not. |
| `lullaby` | Her Lullaby | mother | bellringer | She hums the dark to sleep. Noise fades twice as fast, but your Toll reaches 2 tiles less far. |
| `ground` | Grounded | mother | galvanist | A pylon that stands beside water never fries, and while one does, your grid sheds Heat twice as fast. |
| `graves` | Wet Graves | mother | occultist | A Corpse Candle that stands beside water does not go out when the wave ends. |
| `souls` | Drowned Souls | mother | occultist | Whatever dies in water leaves its sigil, if its kind can be bound. |
| `fat` | Her Fat | mother | whaler | A Blubber Lamp that stands beside water drinks from it as a wave begins, not from your pots or your lamp. |
| `aliencandle` | Alien Spectrum | sun |  | Your candles burn the wrong colour. Whatever walks in their light is seared, 6 a second, but your wards that stand in it fire 20% slower. |
| `solarflare` | Solar Glare | sun |  | When you cast Flare, every bright spot bursts: 20 to everything within a tile of it. An Arc Lamp’s flare bursts the spots in its light. |
| `sunbeam` | Searing Rays | sun |  | Whatever stands in a bright spot is seared, 3 a second, from the start. Doubled once it has Watched you. |
| `solartrap` | Blinded Prey | sun |  | Whatever stands in a bright spot is dazzled and walks 20% slower. A Stalker dazzled there never sights the lamp. |
| `sun_signal` | Alien Leaps | sun | lamplighter | Signal Candles leap 2 tiles further across the dark. But a Stalker that walks in their light has seen the lamp, and runs 40% faster for 3 seconds. |
| `sun_arc` | Disorienting Flare | sun | galvanist | A creature an Arc Lamp’s flare stuns forgets the way and walks back down the path for 2 seconds. Once each. Not a boss, a Behemoth or a Herald. |
| `sun_chime` | Resonant Glare | sun | bellringer | Every time the lamp tolls, each bright spot flashes. Whatever stands in one is heard, and stunned for a moment. |
| `sun_corpse` | Alien Ash | sun | occultist | A Corpse Candle that stands within a tile and a half of a bright spot shines a tile further and sears what walks in its light, 6 a second. |
| `sun_harpoon` | Solar Tether | sun | whaler | Whatever is on your line takes half again from everything while it stands in a bright spot. |
| `openears` | Open Your Ears | mouths |  | You carry 4 dread on every floor. While you are at Whispers or deeper your wards reload 20% faster, but the lamp flickers twice as often. |
| `first_bite` | The Dark Bites First | mouths |  | The first time each creature walks out of a candle’s light into the dark, the dark bites it for 10 and drags it a tile back down the path. A Behemoth a third as far; a boss only bitten. Your lamp burns half a tile smaller. |
| `feed` | Feed the Dark | mouths |  | A new rite. The lamp gutters for 2.5 seconds, 1.2 smaller: everything within 3 tiles of it is dragged 1.5 tiles back (a Behemoth a third as far, never a boss), and your horrors strike twice as fast and into the dark. Feed it in a wave and you carry 4 dread until the wave breaks. |
| `famine` | Swallowed Sigils | mouths |  | Creatures you could bind leave their sigil twice as often. A sigil left to fade while a wave is fought hatches a Gibberer where it lay. |
| `teeth` | Teeth in the Stair | mouths |  | The first creature to reach the lamp each wave is eaten whole, and costs no oil. Never a boss or a Herald. Every one after it costs 1 more oil. |
| `unpaid` | Unpaid Teeth | mouths |  | For each tier of madness your paid horrors bring, one more horror costs nothing to field. It still brings its madness. If your paid madness falls, the free ones beyond it go back to your roster. |
| `bloodsalt` | Salted Teeth | mouths |  | A Salt Circle within 1.5 tiles of a horror bites each creature that steps into it for 7 and takes half a second off that horror’s wait. It wears out twice as fast, and dissolves when the wave breaks. |
| `baited` | Living Bait | mouths |  | A Hook Trap within 2 tiles of a horror resets twice as fast and drags its catch almost a tile back. Each snap, that horror strikes at once, and you take 1 dread until the wave breaks (3 at most). |
| `holloweffigy` | Hollow Effigy | mouths |  | Each Hex Effigy adds 2 dread. What it hexes walks 25% slower, and your horrors reach it from half a tile further. |
| `mouth_corpse` | Borrowed Flesh | mouths | occultist | Where one of your horrors breaks loose or is Unbound, it leaves a body on the path that remembers what it was. A Corpse Candle lit on that body raises its phantom on the candle, striking as it did while the candle burns, at no madness. |
| `mouth_signal` | Teeth on the Thread | mouths | lamplighter | The light between your Signal Candles grows teeth: each link bites a creature the first time it crosses, for 8, and holds it a moment. Your horrors reach a Kindled creature from a tile further and hurt it a quarter more. |
| `mouth_harpoon` | Blood in the Try-pot | mouths | whaler | A Try-pot renders twice as much from what your horrors kill. Your horrors strike what is held on a line 40% faster, and when one kills it there, the line snaps to the nearest creature and hauls it 1.5 tiles back. Never a boss, a Behemoth or a Herald. |
| `mouth_arc` | Wired Specimens | mouths | galvanist | Your fielded specimens take wires from your pylons, if a pylon has a link to spare, and never fry. Each shock on a wire tied to one sheds half a second of its wait. |
| `mouth_chime` | The Answering Choir | mouths | bellringer | A Perfect Toll makes every horror you field strike at once, into the dark, and crack what it hits. But at 5 Noise a Gorger climbs with the Stalkers. |

### Conjunctions

Two patrons who have both noticed you (Attention 1 to 4 each, neither Claimed) may put one in the third card of an offer: **25%** of offers when neither is Watched, **40%** with one, **60%** with both. It never replaces the kit's own offering. A run takes one per pair, **2** at most. The **Caller** (the pair's lower Attention; the first of the pair on a tie) takes +1 Attention; the **Witness** takes none, but the next wave its water rises a tile, it opens another spot, or one more Gibberer climbs.

Numbers: Phosphor Tide glow **6s**, **×1.25** damage, current **×1.45**. Gorger's Undertow drags **1** tile within **2** (each creature **2** times at most), **2** rises a wave, Gorgers **×1.4**. Brine-Choir echo **×0.2**, dread at most **3**. Sun-Drunk Chorus **1s** still, **×1.2** for **3s**, dread at most **3**. Violet Husking **6s**, light **1** tile, Gibberers **30%** slower within **1.5**, every **3**rd Gibberer, unfed: 1 dread for **6s** (at most **3**).

| Key | Conjunction | Patrons | Effect |
|---|---|---|---|
| `phosphor` | Phosphor Tide | mother + sun | One bright spot always burns in her water. When a blow lands on something in her water within a tile and a half of a bright spot, that stretch of water glows violet for 6 seconds. Whatever stands in it is seen, veiled or not, and takes a quarter more. Her current runs faster: 45%, not 30%. |
| `gorgedrag` | Gorger’s Undertow | mother + mouths | A Gibberer in water brings 1 dread, not 2. When anything dies in water, what walks within 2 tiles of it is dragged a tile back, twice at most. Never a boss or a Behemoth. But a Gorger that steps into water raises it a tile, twice a wave at most, and her current carries Gorgers 40% faster. |
| `brinechoir` | Brine-Choir | mother + mouths | A blow that lands on something in water rings through it: everything else in the same water takes a fifth as much. Each tile her water gains on a floor brings you 1 dread, 3 at most. |
| `sundrunk` | Sun-Drunk Chorus | sun + mouths | Its creatures stop to stare at the Wrong Sun: the first time one steps into a bright spot, it stands still for a second. But one that walks out of a spot alive runs 20% faster for 3 seconds and brings you 1 dread until the wave breaks, 3 at most. |
| `husking` | Violet Husking | sun + mouths | A Gorger or Choir-Husk you kill, and every third Gibberer, burns violet where it fell for 6 seconds. Whatever stands in that light is seen, and a Gibberer within a tile and a half of it walks 30% slower. A husk that burns out before anything else dies in its light leaves you 1 dread for 6 seconds. |

## Omens (on stair doors)

| Key | Name | Effect |
|---|---|---|
| `moonless` | Moonless | The lamp burns a whole tile smaller. |
| `flooded` | Flooded | Everything moves 10% slower, but salt dissolves twice as fast. |
| `swarm` | Swarm | Every wave brings an extra pack of Skitterlings. |
| `hungering` | Hungering | Kills pay nothing. A relic waits at the end. |
| `frenzied` | Frenzied | Creatures move 15% faster. |
| `ironhide` | Ironhide | Creatures have 25% more health, and pay 30% more when they die. |
| `whispering` | Whispering | Every madness threshold sits 3 lower. |
| `thickdark` | Thick Dark | Candles shine half a tile less. |
| `starved` | Starved | Half the usual essence to start. The gift after it offers one more choice. |

## Trials (on stair doors, floors 2 and 3)

One door on each fork into floor 2 or 3 carries a Trial; passing it pays a relic. Rationed allows 6 wards beside the path; the Hallowed Ground marks 4 patches of up to 4 tiles.

| Key | Name | Rule |
|---|---|---|
| `rationed` | Rationed | Six wards at most beside the path. What lies on the path doesn’t count, and neither do horrors. Upgrades are where the power goes. |
| `hallowed` | The Hallowed Ground | You build only on four marked patches of ground, lit or dark; nothing stands anywhere else beside the path. Nothing there goes dark, and a candle there burns without the lamp. |
| `sealed` | Sealed | Two of your wards are locked for the floor. Never your light, and never your harpoon. |
| `once` | One of Each | Each kind of ward stands only once. What makes your light is spared: build as many of those as you like. |
| `bare` | Bare Hands | Your rites are silent this floor. Only a Bellringer’s Toll still rings. |
| `unbranched` | Unbranched | Nothing can be upgraded this floor, not even the lamp. Spend on more wards instead. |
| `night` | The Long Night | Candles shine half as far, Tuning Forks hum half as wide, and the lamp burns a tile smaller. |

## Rooms (behind stair doors)

| Key | Name | Tag | Description |
|---|---|---|---|
| `merchant` | A Merchant’s Alcove | Merchant | Something trades in the dark. Spend your essence on relics, wards and bindings before the stair burns it. |
| `shrine` | A Bleeding Shrine | Shrine | Make a pact: power, for a price. |
| `event` | Something in the Dark | Unknown | You hear something off the stair. You could go and look. |
| `rest` | A Quiet Landing | Rest | Tend the lamp. Restore oil, or deepen its reservoir. |
| `reliquary` | A Forgotten Reliquary | Reliquary | Another gift lies here, waiting to be taken. |
| `bones` | The Knucklebones | Gamble | Something hooded waits at a stone table. It will play knucklebones for the essence the stair would burn. |
| `deep` | The Deep Stair | Elite | No landing. The next floor is fiercer, with tougher creatures and more of them. Clear it and take a relic. |

## Shrine pacts

| Key | Name | Effect |
|---|---|---|
| `flame` | Feed the flame | The lamp holds 4 less oil. Choose a relic. |
| `blood` | Blood for essence | Lose 5 oil. Gain 150 essence. |
| `curse` | Embrace the curse | Take a cursed relic, then choose a relic. |
| `name` | Whisper a name | Bind a Drowned Choir. Every madness threshold sits 2 lower for the rest of the run. |
| `forget` | Forget a ward | Lose a random ward from your arsenal forever. Choose two relics. |
| `burn` | Burn your essence | Lose all your essence. The lamp holds 6 more oil. |

## Events

**The Drowned Choir** (`choir`): *Below the stair, voices rise out of black water. They are singing your name, slightly wrong.*

- **Listen:** Lose 3 oil. Choose a relic.
- **Sing back:** Half the time 120 essence, half the time lose 4 oil.
- **Walk past:** Nothing happens.

**A Lantern-bearer’s Corpse** (`corpse`): *Someone made it this far. Their lamp is cracked and dry, but their pack is still full.*

- **Take their oil:** +5 oil.
- **Search the pack:** Learn a ward you do not have.
- **Bury them:** The next floor starts with 60 more essence.

**An Open Grave** (`grave`): *It is freshly dug and exactly your size. Something at the bottom glints.*

- **Climb in:** Take a cursed relic, then choose a relic.
- **Fill it in:** The lamp holds 2 more oil.
- **Walk on:** Nothing happens.

**A Salt-crusted Altar** (`altar`): *An old altar furred white with salt. Something was sacrificed here, and the salt kept it.*

- **Pray:** Gain Salt Flats, or the Brined Ledger if you have it, and learn Salt if you have not.
- **Pocket the salt:** +70 essence.
- **Smash it:** The lamp holds 3 more oil, but you lose 2 oil now.

**A Door That Was Not There** (`door`) — needs `events_more`: *Set into the wall of the stair. The hinges are still wet.*

- **Open it:** Half the time a merchant. Half the time the next floor turns elite.
- **Leave it shut:** Nothing happens.

**The Black Mirror** (`mirror`) — needs `events_more`: *Your reflection is carrying a lamp too. Its flame is brighter than yours.*

- **Trade lamps:** The lamp holds 5 less oil, but burns half a tile wider for the rest of the run.
- **Break it:** Bind a Watcher from the shards.
- **Look away:** Nothing happens.

**The Toothmonger** (`teeth`) — needs `events_more`: *A thing with too many hands offers to buy whatever you no longer need.*

- **Sell a relic:** Lose a random relic. Gain 200 essence.
- **Sell oil:** Lose 4 oil. Gain 100 essence.
- **Decline:** Nothing happens.

## The Deeper Dark (depths, cumulative)

1. Creatures have 15% more health.
2. Every floor carries an omen.
3. Each floor starts with 25% less essence.
4. Bosses have 30% more health.
5. The lamp holds 5 less oil.

## Ember Hall

| Key | Unlock | Cost | Effect |
|---|---|---|---|
| `kit_galvanist` | The Galvanist | 70 | A new kit: a mad scientist’s power grid of pylons, arc lamps and lightning. |
| `kit_bellringer` | The Bellringer | 110 | A new kit: Agathe Vell, the blind bellringer, who sees the dark by its echoes. |
| `relics_deep` | Relics of the Deep | 50 | Leech Jar, Second Shadow, Thunder Marrow and Dead Reckoning join the relic pool. |
| `relics_forbidden` | Forbidden Relics | 90 | Four cursed relics with great power join the pool: Choir in the Walls, Gilded Teeth, Hollow Crown, A Thousand Eyes. |
| `events_more` | Older Stories | 60 | Three more things can happen off the stair. |
| `merchant_plus` | A Regular Customer | 60 | Merchants stock one more relic. |

## Floors and waves (base counts, before `COUNT_MUL`)

Each floor draws one card per wave slot when it begins: the classic wave (listed first, with its name) or one of the alternatives under it. A **fixed** wave (a boss or the Choirmaster) always keeps its slot. The draw is saved with the run.

### 1. The Cistern

Stipend **130** essence · 1 gate · hue 188

Maps (one is drawn as the floor begins, from a bag per floor; a saved floor keeps its own):

- **The Spillway**: road 39
- **The Ring Drain**: road 38
- **The Overflow**: road 36

- Wave 1 · *The first crawl*: 8× Crawler
  - or *A trickle*: 5× Crawler + 4× Skitterling
- Wave 2 · *Crawl and skitter*: 8× Crawler + 6× Skitterling
  - or *The skittering*: 14× Skitterling + 3× Crawler
- Wave 3 · *Teeth*: 10× Crawler + 2× Gnasher
  - or *Two mouths*: 3× Gnasher + 6× Crawler
  - or *Eyes above*: 3× Watcher + 8× Crawler + 4× Skitterling
- Wave 4 · *Everything wakes*: 10× Skitterling + 8× Crawler + 2× Watcher + 1× Gnasher
  - or *The flood*: 16× Crawler + 1× Gnasher
  - or *Gnawing*: 5× Gnasher + 4× Skitterling

### 2. The Ossuary

Stipend **110** essence · 1 gate · 1 fork · hue 36

Maps (one is drawn as the floor begins, from a bag per floor; a saved floor keeps its own):

- **The Upper Gallery**: road 40/46 · fork
- **The Two Galleries**: road 39/43 · fork
- **The Charnel Cloister**: road 45/51 · fork

- Wave 1 · *Pale shapes*: 10× Crawler + 3× Shade
  - or *The pale ones*: 7× Shade + 5× Crawler
- Wave 2 · *Wings in the bone*: 14× Skitterling + 3× Watcher
  - or *Rattle*: 10× Crawler + 4× Skitterling
- Wave 3 · *Burst*: 5× Ichor Wretch + 8× Crawler
  - or *Brood*: 7× Ichor Wretch + 3× Shade
- Wave 4 · *Teeth in the dark*: 7× Shade + 3× Gnasher + 6× Crawler
  - or *Gnashing dark*: 5× Gnasher + 3× Shade + 4× Crawler
- Wave 5 · *The screaming*: 2× Shrieker + 12× Crawler + 8× Skitterling + 3× Ichor Wretch
  - or *Choir of screams*: 4× Shrieker + 10× Crawler + 6× Shade

### 3. The Drowned Nave

Stipend **120** essence · 2 gates · 1 fork · hue 205

Maps (one is drawn as the floor begins, from a bag per floor; a saved floor keeps its own):

- **The Flooded Aisle**: road 25, 25/33 · fork
- **The Transept**: road 24, 22/30 · fork
- **The Side Chapel**: road 27, 24/30 · fork · lamp at [4, 8]

- Wave 1 · *Twin tides*: 9× Crawler + 9× Crawler
  - or *Tide and shadow*: 10× Crawler + 4× Shade + 6× Skitterling
- Wave 2 · *Veil and vigil*: 12× Skitterling + 6× Shade + 3× Watcher
  - or *Watchers’ vigil*: 6× Watcher + 8× Crawler
- Wave 3 · *Drowned teeth*: 4× Gnasher + 4× Ichor Wretch + 2× Shrieker
  - or *Drowned shriek*: 3× Shrieker + 10× Crawler + 3× Gnasher
- Wave 4 · *Black water*: 8× Shade + 14× Crawler + 3× Gnasher
  - or *Veils*: 12× Shade + 4× Ichor Wretch + 6× Crawler
- Wave 5 · *The Choirmaster*: 1× Drowned Choirmaster + 10× Crawler + 10× Skitterling + 2× Shrieker **(fixed)**

### 4. The Throat

Stipend **130** essence · 1 gate · hue 358

Maps (one is drawn as the floor begins, from a bag per floor; a saved floor keeps its own):

- **The Gullet**: road 72
- **The Ribs**: road 63

- Wave 1 · *Swallowed*: 14× Crawler + 6× Shade + 3× Gnasher
  - or *Eyes in the gullet*: 5× Watcher + 10× Crawler + 5× Shade + 1× Gnasher
  - or *The gullet*: 4× Gnasher + 10× Crawler + 4× Shade
- Wave 2 · *Bile and wings*: 6× Ichor Wretch + 3× Shrieker + 4× Watcher + 14× Skitterling
  - or *Peristalsis*: 18× Crawler + 4× Shrieker + 2× Gnasher
  - or *Bile*: 8× Ichor Wretch + 3× Shade + 8× Skitterling
- Wave 3 · *The Keeper Below*: 1× The Keeper Below + 10× Crawler + 4× Gnasher **(fixed)**

### 5. The Abyssal Heart

Stipend **200** essence · 3 gates · hue 275

Maps (one is drawn as the floor begins, from a bag per floor; a saved floor keeps its own):

- **The Three Veins**: road 28, 17, 16
- **The Whorl**: road 31, 17, 17

- Wave 1 · *The hunt begins*: 4× Ichor Wretch + 4× Abyssal Stalker + 8× Crawler
  - or *Hunters*: 4× Abyssal Stalker + 3× Abyssal Stalker + 6× Crawler + 3× Shade + 2× Gnasher
- Wave 2 · *Something heavy*: 1× Trench Behemoth + 14× Skitterling + 6× Shade
  - or *The weight below*: 1× Trench Behemoth + 8× Crawler + 3× Ichor Wretch
- Wave 3 · *The Choirmaster*: 1× Drowned Choirmaster + 10× Abyssal Stalker + 3× Shrieker + 8× Crawler **(fixed)**
- Wave 4 · *Leviathans*: 2× Trench Behemoth + 12× Crawler + 4× Watcher + 5× Abyssal Stalker
  - or *Leviathan’s wake*: 1× Trench Behemoth + 1× Trench Behemoth + 8× Abyssal Stalker + 4× Shrieker + 6× Crawler
- Wave 5 · *The Primordial*: 1× The Primordial + 10× Abyssal Stalker + 6× Ichor Wretch + 1× Trench Behemoth **(fixed)**

Boss entrances: The Keeper Below (boss): “It has waited a long time for your light”; The Primordial (boss2): “It was here before the dark had a name”.

