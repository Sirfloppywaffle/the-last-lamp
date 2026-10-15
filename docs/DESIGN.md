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
| `boss2` | The Primordial | 4200 | 0.38 | 99 | 0 | 0.75 | aura, boss, spawner |
| `keeper` | Bound Keeper | 1 | 0 | 0 | 0 | 0.6 | bound |

`bind` = can drop a sigil you can bind as a horror. `veiled` = invisible unless unveiled. `aura` = buffs nearby creatures. `spawner` = calls minions. `keeper` is the bound form of the Keeper Below; it never spawns as an enemy. Spawnable: `crawler`, `skitter`, `gnasher`, `watcher`, `shade`, `wretch`, `shrieker`, `elite`, `boss`, `stalker`, `behemoth`, `boss2`.

## Wards

Base set (any kit may start with these): `candle`, `harpoon`, `salt`, `chime`, `trap`, `tithe`, `effigy`. Gift-only: `censer`, `coil`, `lance`.

| Key | Name | Cost | Placement | Description |
|---|---|---|---|---|
| `candle` | Candle Ward | 30 | beside path | Casts light, unveils Shades, and slows whatever walks in it. |
| `harpoon` | Brine Harpoon | 40 | beside path | Fires barbed bolts at a single creature. *(aimed: First/Last/Strongest)* |
| `salt` | Salt Circle | 20 | path | Poured on the path. Anything crossing it moves at half speed until the salt scatters. |
| `chime` | Bone Chime | 55 | beside path | Rings out in a circle, striking and stunning everything nearby. |
| `trap` | Hook Trap | 35 | path | Rusted jaws set on the path. They snap shut on the first thing that walks in, seen or unseen, then reset. |
| `tithe` | Tithe Bowl | 50 | beside path | Pays you essence for every creature that dies near it, and a tithe at every break between waves. |
| `effigy` | Hex Effigy | 40 | beside path | A pinned doll. Everything that passes near it is hexed for a while and takes 40% more damage from every source. |
| `censer` | Tar Censer | 70 | beside path | Lobs burning pitch that splashes a cluster. It hits whatever it lands on, lit or not. *(aimed: First/Last/Strongest)* |
| `coil` | Galvanic Coil | 75 | beside path | Throws lightning that leaps from creature to creature. Brine conducts: anything standing in salt takes double. *(aimed: First/Last/Strongest)* |
| `lance` | Whaling Gun | 90 | beside path | A slow, enormous harpoon. Double damage to heavy creatures, elites and bosses. *(aimed: First/Last/Strongest)* |
| `trypot` | Try-pot | 30 | beside path | An iron pot that renders the dead into whale oil. Build it where things die. Each Blubber Lamp drinks a measure from it as a wave begins. A full pot pours into the lamp, and whatever is left when the floor ends pours in too. |
| `grasp` | Grasping Dead | 0 | path | Three bodies rise as arms from a full pile of bones on the path. They seize each creature that walks over them and hold it 2 seconds, seen or unseen, lit or dark. After six they crumble. Bosses they hold only a moment; Behemoths and fliers pass free. |
| `mirror` | Signal Mirror | 45 | beside path | A tilted mirror on an iron stand. Built in the lamp’s own light, it catches the lamp and throws a beam 5 tiles straight out, away from the lamp. The beam lights the ground it crosses, so you can build there, and burns whatever walks through it. Where you stand it decides where it points. |
| `risen` | The Risen | 0 | beside path | Raised from a pile of bones by the rite Raise the Dead. It bites whatever comes near, seen or unseen, harder for every bone it rose from and every tier of madness, and falls when the wave breaks. |
| `weir` | Weir | 45 | path | A rotten floodgate set where the stair forks. It shuts one way; flip it between waves. Watchers fly over it. A Behemoth breaks it. |

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
| Resonance | 40 — +0.25 range | 60 — +0.25 range | 140 — Choir of Bone: every ring sounds twice |
| Toll | 40 — +0.3s stun | 60 — +0.3s stun | 140 — Deathknell: stunned creatures take 30% more damage from everything |
| Marrow | 40 — +5 damage | 60 — +7 damage | 140 — Shatter: its kills burst into shrapnel for 10 damage |

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
| `haul` | Haul Away | 22s | Every creature on one of your lines is dragged 2 tiles back down the path at once. Bosses and Behemoths hold their ground. |
| `raise` | Raise the Dead | 30s | Tap a pile of bones. Its dead stand up beside the path as a Risen that bites whatever comes near, seen or unseen, until the wave breaks. The more bones, the harder it bites. |
| `unbind` | Unbind | 25s | Tap one of your horrors on the board. It breaks its binding and charges down the path toward where they come from, tearing through everything in its way. Then it is gone for good. |
| `ebb` | The Ebb | 30s | The water draws back. Everything standing in it is dragged 2 tiles back down the path. Bosses and Behemoths hold their ground. |

## Kits

| Key | Name | Wards | Rites | Starts with | Unlock | Perk |
|---|---|---|---|---|---|---|
| `lamplighter` | The Lamplighter | candle, harpoon, mirror, salt, chime, trap, tithe | kindle, pillar | — | open | Your Signal Candles pass light to one another across the dark, up to 4 tiles apart. Your harpoons fire flare bolts. Kindle a creature and it becomes a running torch. A Signal Mirror throws the lamp’s light down the path in a burning beam. |
| `whaler` | The Whaler | candle, harpoon, salt, trap, lance, trypot | haul, bell | — | Deed: Kill a Trench Behemoth with harpoons alone. | Your Blubber Lamps burn wide but cost the lamp oil each wave, unless your Try-pot renders it from the dead. Your harpoons hold what they hit on a line, and Haul Away drags everything on your lines back at once. Starts with the Whaling Gun. |
| `occultist` | The Occultist | candle, harpoon, grasp, effigy, tithe, chime | unbind, raise | watcher×1, gnasher×1 | Deed: Break a wave with your madness at Slipping or deeper. | Your Corpse Candles are free and need no lamp, but stand only where something died, and go out when the wave ends. Madness feeds you: your Bone Spears and your horrors hit harder with every tier. Unbind sends a horror charging down the stair. Starts with a bound Watcher and a bound Gnasher. |
| `galvanist` | The Galvanist | candle, harpoon, salt, coil, chime | flare, pillar | — | Ember Hall (`kit_galvanist`) | Lightning leaps to one more creature, and salt costs 15. Starts with the Galvanic Coil. |
| `bellringer` | The Bellringer | candle, harpoon, chime, censer, trap | flare, bell | — | Ember Hall (`kit_bellringer`) | Bone Chimes ring 20% faster. Starts with the Tar Censer and the Drowning Bell. |

### Kit wards

A kit's own version of a ward. Underneath it is the same ward (same key, cost, branches, relics and omens); only its name and its twist differ.

| Kit | Replaces | Name | What it does |
|---|---|---|---|
| `lamplighter` | `candle` | Signal Candle | Casts light, unveils Shades, and slows what walks in it. Its light leaps up to 4 tiles to another Signal Candle, even across the dark. |
| `lamplighter` | `harpoon` | Flare Harpoon | Fires barbed bolts at a single creature. Each bolt flares where it strikes, lighting what stands near it for a moment. |
| `whaler` | `candle` | Blubber Lamp | A lamp of rendered fat. It burns almost a tile wider than a candle, but it drinks: as each wave begins, every Blubber Lamp takes a measure from a Try-pot, or 1 oil from the lamp if the pots are dry. |
| `whaler` | `harpoon` | Tether Harpoon | Fires barbed bolts on a line. The line holds what it strikes and slows it more the longer it holds, until the harpoon fires at something else. |
| `occultist` | `candle` | Corpse Candle | Free, and it needs no lamp: it burns on the dead. It can only stand beside the path where something died this floor, and each one uses up a body. It goes out when the wave ends. |
| `occultist` | `harpoon` | Bone Spear | Fires a spear of sharpened bone at a single creature. The madder you are, the harder it hits: 25% more for each tier of madness. |

**Signal Candle (`lamplighter`, replaces candle)**

| Branch | Tier 1 | Tier 2 | Tier 3 (capstone) |
|---|---|---|---|
| Glow | 15 — +0.5 light | 25 — +0.5 light | 50 — Beacon: wards in its light deal 20% more damage |
| Signal | 15 — Its light leaps 1 tile further | 25 — Leaps 1 tile further again | 50 — Fire Thread: anything that crosses its threads catches fire |
| Ember | 15 — Burns 3 damage a second in its light | 25 — Burns 6 damage a second | 50 — Pyre: anything dying in its light bursts for 12 damage |

**Flare Harpoon (`lamplighter`, replaces harpoon)**

| Branch | Tier 1 | Tier 2 | Tier 3 (capstone) |
|---|---|---|---|
| Speed | 35 — Reload 25% faster | 50 — Reload 25% faster again | 120 — Twin Reel: two bolts per shot |
| Strength | 35 — +6 damage | 55 — +8 damage | 130 — Piercing Barb: bolts pass through everything in a line |
| Flare | 30 — Flares burn wider | 45 — Flares burn a second longer | 110 — Starshell: every fourth bolt lights a wide circle for 4 seconds |

**Blubber Lamp (`whaler`, replaces candle)**

| Branch | Tier 1 | Tier 2 | Tier 3 (capstone) |
|---|---|---|---|
| Glow | 15 — +0.5 light | 25 — +0.5 light | 50 — Beacon: wards in its light deal 20% more damage |
| Wax | 15 — Slow rises to 30% | 25 — Slow rises to 40% | 50 — Tallow Snare: roots each creature for 1s the first time it enters |
| Reek | 15 — Its smoke clings: what leaves its light stays slowed 2 seconds | 25 — It clings 4 seconds | 50 — Lure: at a fork, everything but a boss takes the way it lights |

**Tether Harpoon (`whaler`, replaces harpoon)**

| Branch | Tier 1 | Tier 2 | Tier 3 (capstone) |
|---|---|---|---|
| Speed | 35 — Reload 25% faster | 50 — Reload 25% faster again | 120 — Twin Reel: two bolts per shot |
| Strength | 35 — +6 damage | 55 — +8 damage | 130 — Piercing Barb: bolts pass through everything in a line |
| Line | 30 — The line slows by up to 55% | 45 — The line holds a tile further out | 110 — Reel In: every 4 seconds the line hauls its catch a tile back |

**Corpse Candle (`occultist`, replaces candle)**

| Branch | Tier 1 | Tier 2 | Tier 3 (capstone) |
|---|---|---|---|

**Bone Spear (`occultist`, replaces harpoon)**

| Branch | Tier 1 | Tier 2 | Tier 3 (capstone) |
|---|---|---|---|
| Speed | 35 — Reload 25% faster | 50 — Reload 25% faster again | 120 — Twin Reel: two bolts per shot |
| Strength | 35 — +6 damage | 55 — +8 damage | 130 — Piercing Barb: bolts pass through everything in a line |
| Dread | 30 — Each tier of madness adds 10% more | 45 — Each tier adds 10% more again | 110 — Soul Spear: what it kills leaves its sigil, if its kind can be bound |

Own wards and rites: the Lamplighter's Signal Mirror throws a beam **5** tiles long (lit in patches of **0.8**) that burns **5** a second, and only while it stands in the lamp's own light. The Whaler's Haul Away drags everything on its lines **2** tiles back (bosses and Behemoths hold).

Occultist numbers: a Corpse Candle costs nothing, needs no lamp, stands within **1.5** tiles of a body from this floor (one body per candle) and goes out when the wave breaks. A death within **1.5** tiles of a pile joins it; a pile holds **3**, a death beside a full one scatters, and a floor keeps the freshest **12** bodies. The first floor of an Occultist descent starts with two piles. The Grasping Dead rise from a full pile (its three bodies), need no light, hold each creature **2s** (bosses **0.5s**) and crumble after **6** grips. Raise the Dead stands a pile up as a Risen beside it: **14** damage per bone (× the horrors' madness bonus), range **1.5**, **1** bites a second, until the wave breaks. A Bone Spear deals **+25%** per tier of madness (Dread adds **+10%** per tier per level). Horrors deal **+20%** per tier. Unbind charges at **7** tiles a second, dealing **30 + 20 × the horror's madness** to each creature it passes, and stuns for 1s (bosses 0.3s, Behemoths not at all).

Whaler numbers: a Blubber Lamp burns **+0.8** light; while any stands, each wave costs 1 oil unless a Try-pot has a measure. The Try-pot reaches **2.4** tiles; each death gives up its oil value (at most 6); every **6** makes a measure; it holds **4**, and a full pot pours 1 oil into the lamp instead. The line slows by **0.12** a second held, up to **40**%; Reel In hauls back 1 tile every **4s**.

Numbers: Signal Candle light leaps **4** tiles. A flare bolt lights **1.3** tiles for **1.5s** (at most 8 at once); a Starshell lights **3** tiles for **4s**. A Fire Thread kindles what crosses it for **2s**. Kindle burns **8s**, lights **1.8** tiles, deals **5** damage a second, and the creature moves **×1.25** (bosses don't hurry).

## Relics

| Key | Name | Cursed | Pack | Effect |
|---|---|---|---|---|
| `tallow` | Tallow of Saints |  | base | The lamp burns wider: +0.8 light. |
| `reserve` | Oil Reserve |  | base | Refill 6 oil and raise the lamp’s capacity by 4. |
| `whetted` | Whetted Barbs |  | base | Brine Harpoons deal 30% more damage. |
| `saltflats` | Salt Flats |  | base | Salt Circles cost 10, refills cost 5, and they last twice as long. |
| `quiet` | Quiet Mind |  | base | Every madness threshold sits 3 higher. |
| `wax` | Sealing Wax |  | base | Each bound horror costs 1 less madness (minimum 1). |
| `bounty` | Bounty of the Deep |  | base | Creatures leave 30% more essence. |
| `binder` | Binder’s Thread |  | base | Bindable creatures leave their sigil twice as often. |
| `ledger` | Brined Ledger |  | base | Salt Circles also burn whatever stands in them, 6 damage a second. |
| `veil` | Mourning Veil |  | base | Shades and Abyssal Stalkers can be seen wherever there is light. |
| `key` | Ossuary Key |  | base | Merchants charge 30% less. |
| `compass` | Drowned Compass |  | base | The stair forks into four doors instead of three. |
| `blackwick` | Black Wick | yes | base | The lamp burns 1.2 tiles wider, but loses 1 oil at the start of every wave. |
| `glass` | Glass Lantern | yes | base | The lamp holds 6 less oil, but everything you field deals 15% more damage. |
| `leech` | Leech Jar |  | relics_deep | Every 30 kills restore 1 oil. |
| `shadow` | Second Shadow |  | relics_deep | Hexes linger twice as long after leaving an Effigy. |
| `marrow` | Thunder Marrow |  | relics_deep | Bone Chime stuns last 0.4s longer. |
| `witchsalt` | Witch Salt |  | relics_deep | Salt Circles slow by 65% instead of 50%. |
| `choirwalls` | Choir in the Walls | yes | relics_forbidden | Horrors cost no madness, but one of your bound horrors slips away at every stair. |
| `gilded` | Gilded Teeth | yes | relics_forbidden | Every kill pays 2 more essence, but the stair burns all essence except your salvage. |
| `hollow` | Hollow Crown | yes | relics_forbidden | Every gift offers one more choice, but the lamp holds 4 less oil. |
| `eyes` | A Thousand Eyes | yes | relics_forbidden | Everything in light can be seen, veiled or not, but every madness threshold sits 2 lower. |

**Resting while patrons are tested** (#29, `RELICS_RESTING`): Tallow of Saints, Whetted Barbs, Bounty of the Deep, Oil Reserve, Quiet Mind, Sealing Wax, Ossuary Key, Salt Flats, Thunder Marrow, Witch Salt, Leech Jar. They are never offered; a run that carries one keeps it.

## Patrons

At the landing the gift is a patron's offering instead, half the time (a quarter if one already reached out on that floor); between waves one reaches out at **15%** of breaks (once a floor). Take one or refuse. Each gift is +1 Attention.

**The Drowned Mother** (`mother`): She lies under all the water below the stair. She gives freely, and she remembers everything she gives.

| Attention | Tier | What changes |
|---|---|---|
| 1 | Noticed | Water stands on the path of every floor. Its current carries creatures through it 30% faster. |
| 3 | Watched | The water rises: as each wave begins, the flood creeps one tile further up the path. |
| 5 | Claimed | Whatever walks in her water goes under. It cannot be seen or struck there unless something unveils it. |

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
| `graves` | Wet Graves | mother | occultist | A Corpse Candle that stands beside water does not go out when the wave ends. |
| `souls` | Drowned Souls | mother | occultist | Whatever dies in water leaves its sigil, if its kind can be bound. |
| `fat` | Her Fat | mother | whaler | A Blubber Lamp that stands beside water drinks from it as a wave begins, not from your pots or your lamp. |

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

- **Pray:** Gain the Brined Ledger, and learn Salt if you have not.
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
| `kit_galvanist` | The Galvanist | 70 | A new kit, built on lightning and salt. |
| `kit_bellringer` | The Bellringer | 110 | A new kit, built on chimes, pitch and the Drowning Bell. |
| `relics_deep` | Relics of the Deep | 50 | Second Shadow joins the relic pool, and Leech Jar, Thunder Marrow and Witch Salt when they return to the stair. |
| `relics_forbidden` | Forbidden Relics | 90 | Four cursed relics with great power join the pool: Choir in the Walls, Gilded Teeth, Hollow Crown, A Thousand Eyes. |
| `events_more` | Older Stories | 60 | Three more things can happen off the stair. |
| `merchant_plus` | A Regular Customer | 60 | Merchants stock one more relic. |

## Floors and waves (base counts, before `COUNT_MUL`)

Each floor draws one card per wave slot when it begins: the classic wave (listed first, with its name) or one of the alternatives under it. A **fixed** wave (a boss or the Choirmaster) always keeps its slot. The draw is saved with the run.

### 1. The Cistern

Stipend **130** essence · 1 gate · hue 188

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

- Wave 1 · *Swallowed*: 14× Crawler + 6× Shade + 3× Gnasher
  - or *Eyes in the gullet*: 5× Watcher + 10× Crawler + 5× Shade + 1× Gnasher
  - or *The gullet*: 4× Gnasher + 10× Crawler + 4× Shade
- Wave 2 · *Bile and wings*: 6× Ichor Wretch + 3× Shrieker + 4× Watcher + 14× Skitterling
  - or *Peristalsis*: 18× Crawler + 4× Shrieker + 2× Gnasher
  - or *Bile*: 8× Ichor Wretch + 3× Shade + 8× Skitterling
- Wave 3 · *The Keeper Below*: 1× The Keeper Below + 10× Crawler + 4× Gnasher **(fixed)**

### 5. The Abyssal Heart

Stipend **200** essence · 3 gates · hue 275

- Wave 1 · *The hunt begins*: 4× Ichor Wretch + 4× Abyssal Stalker + 8× Crawler
  - or *Hunters*: 4× Abyssal Stalker + 3× Abyssal Stalker + 6× Crawler + 3× Shade + 2× Gnasher
- Wave 2 · *Something heavy*: 1× Trench Behemoth + 14× Skitterling + 6× Shade
  - or *The weight below*: 1× Trench Behemoth + 8× Crawler + 3× Ichor Wretch
- Wave 3 · *The Choirmaster*: 1× Drowned Choirmaster + 10× Abyssal Stalker + 3× Shrieker + 8× Crawler **(fixed)**
- Wave 4 · *Leviathans*: 2× Trench Behemoth + 12× Crawler + 4× Watcher + 5× Abyssal Stalker
  - or *Leviathan’s wake*: 1× Trench Behemoth + 1× Trench Behemoth + 8× Abyssal Stalker + 4× Shrieker + 6× Crawler
- Wave 5 · *The Primordial*: 1× The Primordial + 10× Abyssal Stalker + 6× Ichor Wretch + 1× Trench Behemoth **(fixed)**

Boss entrances: The Keeper Below (boss): “It has waited a long time for your light”; The Primordial (boss2): “It was here before the dark had a name”.

