# The Last Lamp — History

What changed, who did it, and why. Newest first. Add your PR's line under **Unreleased**; Claude moves it into a version when it ships.

## Unreleased
- **The shifting stair: three maps for each of floors one to three** (#73, part 1; Criss: "replaying a lot, the floors themselves look the same"). One map is drawn as you reach the floor, named beside the floor's name in the banner, the pause menu and the descent map, and kept with the save. You meet every map of a floor before any comes back, and your first descent ever plays the first map. The waves, stipends and names don't change.
  - **The Cistern:** the Spillway (today's), **the Ring Drain** (in from the far corner and right round the lamp; kill at the corners), **the Settling Beds** (in under the lamp, then three lanes against the west wall, two tiles apart: a ward between two strikes both, but only the nearest lane is lit).
  - **The Ossuary:** the Upper Gallery (today's), **the Two Galleries** (the fork splits the whole floor: up the west, or round by the east and the top), **the Charnel Cloister** (the fork at your doorstep: light the west wall and they turn in past the lamp).
  - **The Drowned Nave:** the Flooded Aisle (today's), **the Transept** (both veins from the west, at the lamp's two faces), **the Side Chapel** (the lamp stands by the west wall; both veins cross the dark from the east).
  - A first-time tip, a rules line, a developer row to restart on any map, and DESIGN lists each map's roads. `maps.test.js` walks every map in both orientations, and `forks.test.js` now checks every fork. Brainstormed with Gemini on #75. No balance numbers change; road lengths are listed in the PR. (Claude)

## v18.0.0 — Trials Complete
All seven Trials are in: five more join Rationed and the Hallowed Ground on the doors to floors two and three, and the Tuning Fork feedback loop and the lit-fork Weir rule are fixed.
- **Fix: a Weir needs no light** (Criss: the Bellringer couldn't build one, because the fork of the stair was dark and she has no candles). A Weir is a floodgate, not a ward that strikes, so it now stands on its fork lit or dark, for every kit, and stays awake there. Its rules text and placement card say so. A new Bellringer test builds one on a dark fork. No other numbers change. (Claude)
- **Fix: Tuning Forks no longer ring each other forever** (Criss: two forks "stuck in some kind of feedback loop"). A fork remembered only the last toll it passed on, so two tolls at once (a Toll and a Peal heartbeat) bounced between two forks without end. Every bounce cracked what stood near them again, which shattered whole waves and made two forks, a wire and Peal hold floors alone. Each toll now crosses each fork once. Played headless on floors one and two, the same build held both with no oil lost before the fix, and falls on wave 3 or 4 after it. A new test pins the overlap. No balance changes. (Claude)
- **Five more Trials** (#31): Sealed, One of Each, Bare Hands, Unbranched and The Long Night join Rationed and the Hallowed Ground on the doors to floors two and three. Each is checked against all five kits.
  - **Sealed:** two of your wards are locked for the floor (named as it begins, kept with the save). Never your light (candles of every kind, Tuning Forks, pylons, Bell Wires, Try-pots) and never your harpoon.
  - **One of Each:** each kind of ward stands once; sell it to build it elsewhere. Your light is spared, so candles, forks, pylons, Bell Wires and Try-pots stand as often as you like.
  - **Bare Hands:** every rite is silent, the Will-o’-Wisp too. The Bellringer keeps her Toll, because it is how she sees.
  - **Unbranched:** nothing can be upgraded, the lamp included.
  - **The Long Night:** candles shine half as far, Tuning Forks hum half as wide, the lamp burns a tile smaller. Its door never carries Moonless or Thick Dark.
  - A ward a Trial bars is now dashed with a lock on its icon, not greyed like one you can't afford (this also fixes the Rationed nit from #66). Silent rites are dashed and read *Silent*.
  - Tips, rules lines, Grimoire entries, DESIGN, and the developer row lists all seven. No balance changes to existing numbers. (Claude)

## v17.1.1 — Rising Water
The Drowned Mother's water now rises on every wave it should, instead of sitting still about one wave in 25.
- **Fix: the Drowned Mother's rising water never skips a rise** (#62, the flaky "Watched: the water rises one tile" check). Her two flooded stretches can stand end to end, and when one was told to grow into the other's tile, the wave began and no new tile flooded. That was about one rise in 25, which is also how often the check failed on `main`. A stretch now only grows into a dry tile, trying its far end, then its near end, then the other stretch. A new test pins the end-to-end case. No balance changes. (Claude)

## v17.0 — Trials
A door on the way to floors two and three can carry a Trial, a floor with a rule that forces a different build, and a kit you earn on a run now rises out of the dark on the end screen.
- **Trials: Rationed and the Hallowed Ground** (#31, Criss's idea: "limiting what wards you can use … or only being able to use certain parts of the map regardless if lit or not"). On the way to floors two and three, one door carries a Trial (never the Deep Stair's door), named on the door with its rule. Take it and the floor plays by that rule; pass it and a relic waits, as after an elite floor. A banner and hint name it as the floor begins, the HUD shows it beside the floor's name, and the pause menu and descent map say it too.
  - **Rationed:** six wards at most beside the path. What lies on the path (salt, traps, Bell Wires, Weirs, the Grasping Dead), the Risen and horrors don't count. The HUD keeps the count (Rationed 4/6), and at six the counted wards in the tray grey out; sell one to build another.
  - **The Hallowed Ground:** four patches marked in chalk, each the ground around one tile of the path (so a patch reaches both sides of it), one always around the lamp. Beside the path you build only there, lit or dark. Nothing on a patch goes dark: a candle there burns without the lamp, a Tuning Fork hums without the lamp's sound, a pylon powers the grid. Wards there still strike only what is seen or heard, so light still matters. The patches are kept with the save and turn with the board.
  - Checked against all five kits: neither seals a kit's light (Signal Candles, Blubber Lamps, Corpse Candles, Arc Lamps and pylons, Tuning Forks), the Signal Mirror always has lamp-lit ground, and a Corpse Candle still needs a body beside it.
  - Tips for each, a rules line (Trials), a Trials page in the Grimoire, DESIGN, and a developer row to restart a floor under either Trial. No balance changes to existing numbers. (Claude)
- **The unlock reveal** (#36, part 1). When a deed earns a kit during a run, the end screen opens on its portrait first: the locked silhouette, then the lit painting floods out from the character's own light (a ring sweeps out and draws Agathe, who has none). Then the name, the kit, how it was earned and a reveal line. A kit bought in the Ember Hall gets the same reveal there, and the Hall comes back after it. A tap anywhere in the box snaps to the finished card and the next one goes on (on `click`, and a hasty double tap isn't read as both). The name starts to rise partway through the light, so nothing sits empty. It shows whatever the tip setting says. With reduced motion it is a plain fade. Two kits earned on one run reveal one after the other. Developer mode has a **Reveal a kit** row to preview each one; it saves nothing. No balance changes. (Claude)

## v16.9 — The Roster
Descend opens a roster of five painted characters, and the Nameless's hood fills with what you bind.
- **Gemini answers only when asked** (Criss: its quota is small). The review workflow no longer runs when a PR opens; it runs only on a trusted `/gemini` comment. (Claude)
- **The Roster: five who went down the stair** (#36, designed with Gemini on #60). Descend now opens a roster of five painted characters, each lit by a light of their own:
  - **Ambrose Fenn**, the lamplighter, in a coat crusted with wax, his lantern at his chin.
  - **Jonah Tolland**, a grey-bearded harpooner with a cruse lamp held low.
  - **The Nameless**, a hood with no face.
  - **Dr. Lucan Voss**, with an arc across his collar.
  - **Agathe Vell**, drawn only in the rings of her bell.

  A kit you haven't earned is a shape in the dark with only its light showing, and its deed or Ember Hall cost beneath. Tap a character to read who they were; tap again, or Descend, to go down. The last one you carried is chosen already. **The Nameless's hood fills with what you bind:** every kind of horror bound or captured, on any descent with any kit, adds its eyes for good, six kinds in all (the Keeper's is last), so there's a reason to keep playing. The Grimoire's Kits page shows the portraits, How the dark works has a Roster line, and a tip marks each new eye. The Galvanist and Bellringer stay Ember Hall unlocks (Criss). The portraits were repainted by Gemini in a chiaroscuro style (sculpted faces, cloth folds, a cataract eye for Fenn), delivered as a patch through Criss. (Claude; portraits by Gemini)
## v16.8 — The Tithe and the Bell
Two more Heralds walk the middle floors, and every Herald can now be prepared for: a red mark on its rift, gentler health, and no way to hold one under forever.
- **No Herald can be held forever** (Criss: a Tithe-taker stood stunned at the edge of her water, filling its sack). Undertow holds whatever a harpoon bolt strikes in water for a second, and a fast harpoon re-holds it before it can move, so a Herald could be kept under for the whole wave. Now a Herald held 3 seconds (stunned or pinned; the count eases while it walks) breaks free with a red ring and *breaks free*, and shrugs off every hold, Into the Deep's line included, for 3 seconds. Slows still work. Every kit's holds count: Undertow, candle snares, the Galvanist's shocks, the Bellringer's peals, the Occultist's grasping hands. (Claude)
- **Heralds you can prepare for** (Criss lost to the first two: "I don't know which side they're going to come from"). In the break before a Herald's wave, a pulsing red ring with a **!** marks the rift it will climb out of, so you know where to build; the rift is chosen once and kept with the save. The **Tithe-taker** now takes 2 essence a second and only while it walks in your light, so it can't drain you before it reaches your defences. All three Heralds have less health: the Last Keeper 440, the Tithe-taker 400, the Bellfather 520 (before floor scaling).
- **The wave strip moved to the top centre** (Criss: it hid an entrance). It is narrower and wraps; if it would still cover a rift, it drops to the bottom of the board. (Claude)
- **Two more Heralds, on every middle floor** (#31). Floors two, three and four now each send one Herald, drawn into a later wave, and a descent never meets the same one twice. Each one is checked against every kit:
  - **The Tithe-taker**: a bloated collector in a coat gone green, with spectacles, an open ledger and a coin-sack. While it lives it takes 3 essence a second into its sack, and the sack shows what it holds. Kill it and the sack bursts: everything it took comes back, and half again. Every kit spends essence, so every kit feels it.
  - **The Bellfather**: a hulking hooded thing bent under the drowned church's great bell. Every 5 seconds it strikes it, and every ward within 2.2 tiles reels (a wobbling ring of bronze dashes) and does nothing for 2 seconds. That covers harpoons, chimes, Tocsins and horrors; for the Galvanist, a reeling pylon's wires go dead, and for the Bellringer its toll is a ring like her own that hears what it touches.
  - Both drain 8 oil at the lamp, are no boss, and pay a relic. Entrance banners, a cracked, out-of-tune bell sound, Grimoire entries, the rules' Heralds line, and a general Herald tip. (Claude)
## v16.7 — The Last Keeper
The first Herald walks the second floor, putting out your candles as it goes. You can hold the dark still without leaving the board, and look back at a cleared floor.
- **Hold the dark still, and look back at a cleared floor** (Criss: the only pause hid the map, and he wanted screenshots). A pause button beside the speed button freezes everything without covering the board; a pill says it's held, and play lets it move again. Every landing after a floor (the gift, the doors, the rooms) has a **See the floor** button that sets the screen aside so the board and your build can be seen; **Back to the stair** brings it back. (Claude)
- **Heralds: The Last Keeper** (#31, the first of three). On the second floor, one wave (any but the first) is drawn for a Herald when the floor begins, and the strip above the board names it in red during the break before. The Last Keeper is a dead lamp-tender in a rotted cape and a wide hat, carrying a lantern on a crook. Its own lamp lights the dark around it, and every candle it passes goes out for 6.5 seconds, so whatever that candle held up goes dark (Criss: 6.5s, enough for it to walk on past). The Bellringer lights nothing, so for her it stills every Tuning Fork it passes instead, and what the fork's hum held goes blind. It walks in the middle of its wave, drains 8 oil if it reaches the lamp, and is no boss: it never ends the run by itself. Kill it and it pays a relic. It survives save and resume. A tip, a rules line (Heralds), a Grimoire entry, and DESIGN. (Claude)
## v16.6 — The Bellringer
Agathe Vell, the fifth and last kit, sees by sound: Toll, Noise, ghosts, Tuning Forks humming in the dark, Bell Wires and the Tocsin, Resonance and its shatters, the Perfect Toll, echoes and footsteps. Designed with Criss across four playtests, and balanced after the fourth. One tap now places one ward.
- **The Bellringer sees by sound** (#26, the last of the five kits; designed with Criss and Gemini on #52: "Echo location. Being able to see into the dark. Setting bell trip wires."). She is **Agathe Vell**, who rang the bell of St. Agatha's as the town went under and came back up the stair blind. **Light lets you build; sound lets you see.**
  - **Toll** (her first rite; no cooldown, a 3-second swing): the lamp rings and a pale ring sweeps 7 tiles. Everything it touches is **heard** for 1.5 seconds: outlined in bone-white in the dark, veiled or not, and every ward can strike it. When the echo fades it leaves a hollow **ghost** where it was.
  - **Noise** is the price. Each Toll makes 1, and Noise fades 1 every 8 seconds. At 5 **the dark answers**: two Abyssal Stalkers climb out at the head of the path, and Noise drops to 2. The Toll button shows the Noise and warns when the next toll will call them.
  - **The Great Bell** (cooldown 30, 3 Noise): one toll across the whole floor. Everything is heard for 4 seconds and staggered for half a second.
  - **The Tocsin** (her second ward, 60; Criss's combo idea): an alarm bell cast as a mortar. It never aims at what is near it. When a Bell Wire jangles there is a breath of silence (0.6s), then it lobs a shell across the floor and bursts it on that wire, any distance away, dark or not (40 damage in 1.1 tiles; reload 5s). You see the shell arc over the dark and a ring mark where it will land. Branches: Powder (Grapeshot), Breech (Ready Rounds: two shells), Clang (Crack Shot).
  - **Resonance**: her bells crack what they strike (Tolls, the Great Bell, Bell Wires, Clapper bolts, Tocsin shells; not the heartbeat, echoes or chimes). Cracks show as pale fracture lines that glow as they build. **Three cracks shatter it** into shards of bronze-glass: 20 plus 10% of its health, and 12 to everything within a tile, which cracks them too, so a cracked crowd breaks in a chain. Bosses take 8 cracks (a shatter deals 120), Behemoths and elites 5. A crack fades after 3 seconds without a ring.
  - **Perfect Toll**: with Peal, a ring closes on the lamp before each beat and the Toll button glows. Tap Toll as it lands and the toll rings true: half again as far, two cracks, a gold ring, and half the Noise. It takes the beat's place.
  - **Bell Wire** (her own ward, 25): the one thing that can be strung in the dark, anywhere on the path. Whatever crosses it is heard for 4 seconds, and its jangle hears what walks beside it. It rings again after 2 seconds. Three at most; Gnashers chew through one until the wave breaks; fliers pass over. Branches: Chord (capstone Carillon), Rope (Tarred Rope) and Linger (Marked).
  - **She hears the path**: its edges show as faint stone lines in the dark and flare where a ring passes, so wires are easy to place.
  - **Tuning Forks replace her candles** (Criss: "instead of candles we did tuning forks"). A fork (35) gives no light; it hums. It stands within 5 tiles of the lamp or 3.5 of another fork the sound reaches, lit or dark, so you chain them out by sound. Inside a fork's hum (2.3 tiles) you can build in the dark, but wards there are blind: they strike only what is heard, so you have to keep ringing, and ringing makes Noise. A toll that reaches a fork rings again from it. Branches: Pitch (capstone Long Note: the next fork can stand 2 tiles further), Sustain (capstone Drone: it rings by itself every 5s), Overtone (capstone: its ring hears veiled things and cracks twice). A dotted thread shows which fork holds up which.
  - **Echoes** (inspired by Dark Echo): a toll from the lamp comes back off the floor's walls as a fainter ring that hears things again and cracks them again.
  - **Footsteps**: anything heavy walking unseen leaves a red ripple where it treads, so you see something coming but not what. Shades, Stalkers and fliers make no sound.
  - **Clapper Harpoon**: what it strikes is heard for 2 seconds and knocked half a tile back (Ring branch; capstone Peal Bolt).
  - **Chimes**: she is the only kit that starts with the Bone Chime. Like every ward in the dark, it strikes only what a toll has found.
  - **Her lamp** is a lantern inside a cracked bronze bell on an oak frame; it swings and the crack burns white as it tolls. Its **Peal** branch (in place of Fire) makes it toll by itself every 4 seconds, then 3.5, with no Noise. That heartbeat finds only the ordinary dark, so Shades still need a Toll. Capstone **Cathedral**: every toll staggers what is within 2 tiles.
  - **Sound you can see**: every ring, outline and ghost is drawn. Bell Wires give a short buzz on phones that vibrate. A new Settings button, **Show sounds**, writes each bell on the board ("DONG", "ting-a-ling"); Auto turns it on whenever the sound is muted. There is also a Vibration switch.
  - Two Drowned Mother offerings: **The Drowned Peal** (a toll is heard by everything in her water) and **Her Lullaby** (Noise fades twice as fast; Toll reaches 2 tiles less).
  - Bronze bell sounds built from real bell partials (hum, strike, minor third, fifth, nominal), a jangle of little bells, a clang for the Clapper, and a low swell when the dark answers.
  - Tips: She sees by sound, Noise, Bell Wires, the Tocsin, Resonance, Peal (with the Perfect Toll). The rules' Kits line and the Grimoire (her name on the kit card).
  - Kit rites (Toll, the Great Bell, Overload, the Anchor, Raise the Dead, and at Criss's ask Kindle, Haul Away and Unbind) are no longer offered as gifts to other kits.
  - **Balance after Criss cleared floor 4 with five forks, two chimes and a harpoon**: her chimes heard the dark by themselves and cracked everything, and the free heartbeat did the rest. Peal now costs 60/80/150 and its heartbeat reaches 5 tiles, hears for 1 second and cracks nothing.
- **One tap, one ward** (Criss: "I keep accidentally putting more wards down"). Placing a ward puts the choice away; tap it in the tray again to place another.
  - She no longer starts with Flare, the Drowning Bell or Hook Traps; all three can still be found. (Claude)
## v16.5 — Live Wires
The Galvanist arrives: a mad scientist's power grid that captures what it kills instead of binding it. Every kit's own wards now name their branches in its own words, the Bone Chime becomes something you find, and hints stop getting in the way. Criss playtested each piece.
- **The Bone Chime is found, not given** (Criss: a friend says it "has been saving his ass"; "leave it up to RNG"). Benchmarked one ward against standard groups: a bare Chime (55) killed 10 of 10 Crawlers and 8 of 12 Skitters where a Harpoon (40) killed 2 of each, the best damage per essence of any ward against a crowd, better than the Tar Censer (70) that you have to find, plus a stun on everything. Three Toll chimes held a boss stunned for 11.5 seconds. Now: it costs **60** (was 55); only the **Bellringer** starts with it; everyone else finds it as a gift, from a merchant or in a pack. **The ring spreads thin**: the four nearest take its full strike, the rest half (a bare Chime now kills 6 of 10 Crawlers, still the best crowd ward per essence). **A boss it stuns goes deaf to every chime for 4 seconds**; chimes still strike it, and a dull grey ring shows it shrugging them off (three chimes now hold a boss 3.5 seconds, not 11.5). Branches: Marrow's tiers now say what they always did (+6, +8); Choir of Bone's echo strikes again. The Hymn Under the Water offering still needs a chime. A **Deaf to the Chime** tip, the rules' Wards and Chimes lines, the Grimoire ("Found on the stair; the Bellringer starts with it"). (Claude)
- **Hints stay out of the way** (Criss, playing #49). A ward's long description (the Pylon's filled half the board) shows by itself only the first time you pick that ward; tap its card for it again. Any tap on the board puts a hint away at once. In a wave, the "cut off from the lamp" warning speaks once, not every time an Arc Lamp flickers or something drops in and out of the light. (Claude)
- **The Galvanist captures instead of binding** (Criss's idea, balanced with Gemini on #48). He leaves no sigils. His second rite, the **Grounding Anchor** (replaces Pillar of Salt, cooldown 30), drives a spike anywhere you tap for 8 seconds; every powered pylon within 3.5 tiles is forced to link to it, past any cap. Its wires never shock (it is a cage, not a weapon). A bindable creature that dies inside a triangle of the Anchor and two wired pylons is **caught**: a crackling core in a cage of current, with a ring of time; tap it within 5 seconds to capture it. The Anchor burns out on a catch, so it is one capture per cooldown, and a capture **draws 2 Heat out of the grid** (succeeding never overheats you; Overload, then capture, is a combo). The Choirmaster is caught the same way or lost. The **Keeper's core lingers 15 seconds** and its fall readies the Anchor at once; tap the core once a cage closes round it. Merchants sell \"a specimen jar\" to him. A rising capacitor whine says something is caught. Tips for the Anchor and the cage; the rules' Binding and Kits lines. (Claude)
- **Kit wards speak their own language** (Criss: "the wax one doesn't make much sense" for an Arc Lamp). Every kit's own candle, harpoon and lamp now names its shared branches in its own words, with the same effects underneath: the Signal Candle's **Lens** and **Burner**, the Flare Harpoon's **Windlass** and **Heavy Bolts**; the Blubber Lamp's **Fat** and **Smoke** (capstone **Tar Snare**), the Tether Harpoon's **Winch** and **Iron**; the Arc Lamp's **Filament** and **Field** (capstone **Seize**), the Lightning Rod's **Solenoid** and **Copper**, the Galvanist lamp's **Carbon** and **Accumulator**; the Bone Spear's **Sinew** and **Splinter**. (Claude)
- **The grid sounds electric**: a crackling bite on every wire, a rising surge for Overload, a pop and sizzle when a pylon burns out, the crack of a Static Burst, a buzz when an Arc Lamp flares, a ringing tink when a rod drives home, and a low mains hum while live current runs. (Claude)
- **The Galvanist plays differently** (#26, the fourth kit of five; designed with Criss: a mad scientist's power grid, "think Wattson"). His own ward is the **Pylon** (40): it links to other pylons within 3.5 tiles with a live wire (up to three each); anything crossing a wire is shocked (12), stunned (0.4s) and lit for a moment, Shades too, then the wire recharges for 1.5s, so a swarm pours through. The grid must reach the lamp: a pylon in the lamp's own light is the mains, and anything cut off is dead (and taking a pylon away warns what it cuts). Behemoths snap wires for the wave; fliers pass over. His candle, the **Arc Lamp**, burns 0.4 brighter but flickers out for half a second every 4 in a wave, shocking everything in its light as it returns. His harpoon, the **Lightning Rod**, plants a rod where it strikes for 5 seconds; a rod is a pylon while it stands, and coil lightning arcs through it. His rite, **Overload**, costs 2 oil and no cooldown: every live wire fires at triple strength and recharges; each adds Heat (cools 1 every 10s), and cast at 3 or more it **fries** the hardest-worked pylons. His lamp swaps Fire for **Dynamo** (wires recharge faster; capstone **Static Burst** stuns everything near the lamp when something comes close). He keeps the Galvanic Coil; the old +1 leap and cheap salt are gone. Own branches: Spark (Arc Lamp; capstone Steady Current), Charge (Lightning Rod; capstone Thunderhead), and the Pylon's Voltage, Span and Capacitor (capstone Insulated). Two Drowned Mother offerings: **Live Water** and **Grounded**. Art: a carbon-arc lamp in a glass globe on a copper base, lattice pylons with porcelain insulators, a copper ball and a Leyden jar, a coil-wound Arc Lamp bulb, crackling wires that dim while they recharge, Overload's surge, the Static Burst ring and burnt-out pylons. Tips for the grid, Arc Lamps, rods, Overload and Heat; the rules; the Grimoire. (Claude)
---

## v16.4 — Bones and Mirrors
The Occultist plays its own way, and every finished kit now has its own candle, harpoon, ward and rite. Criss playtested each piece ("this kit has really been diving into another way to play"); his rounds added the starting bones and the lesson, capped the bone piles, gave the Occultist the Grasping Dead, made the Mirror truly reflect, and turned Haul Away into a thrown net.
- **Every kit has its own ward and rite now** (Criss: "ensure the other kits already tested have its own abilities as well"). The Lamplighter's **Signal Mirror** (45): built in the lamp's own light, it truly reflects the lamp, in a beam 5 tiles long. Tap it, then **Aim the beam** and tap where the light should go, or turn it 15° at a time with ⟲ ⟳; the beam moves live, and it locks while a wave comes (Criss: the first version "acts like a magnifying glass"). The beam lights the ground (you can build along it, and it counts as your light at a fork) and burns whatever crosses it, 5 a second. Taking the mirror away cuts what stands in its beam, with the usual warning. The Whaler's **Haul Away** (replaces Flare): tap the path and a whaling net lands there; everything under it, and everything already on one of your lines, slides 3 tiles back down the path and is left tangled, 50% slower for 3 seconds (Behemoths are dragged one tile; bosses only tangle). The first version only dragged what was on a line and was hard to see (Criss: "underwhelming"). The net is thrown spinning and lands as a draped diamond mesh of tarred rope, knotted, with a lead-weighted rim and two cork floats; what it catches is wrapped in loops of rope. Tips, rules and the Grimoire. (Claude)
- **The Occultist plays differently** (#26, the third kit of five). Its candle is the **Corpse Candle**: free, and it needs no lamp because it burns on the dead, but it can only stand beside a body from this floor (each death leaves one on the path, marked in bone), each candle uses a body up, and it goes out when the wave breaks. Every floor starts dark, so its light follows the killing. Its harpoon is the **Bone Spear**: +25% damage per tier of madness, with its own **Dread** branch (+10% more per tier per level; capstone **Soul Spear**: what it kills leaves its sigil). **Madness feeds its horrors** (+20% damage per tier) instead of the old "horrors cost 1 less madness". Its new rite, **Unbind**, replaces Flare: tap a horror and it charges down the path toward where they come from, dealing 30 + 20 × its madness to everything it passes and stunning it, then it is gone for good. Two of the Drowned Mother's offerings are its own: **Wet Graves** (a Corpse Candle beside water stays lit) and **Drowned Souls** (what dies in water leaves its sigil). Tips for Corpse Candles, madness and Unbind; the rules' Kits line; the Grimoire shows the skull candle and the bone spear. After Criss's first look: every Occultist descent starts with two piles of bones on the first floor, and the first descent walks you through lighting a candle on them before the first wave; bones gather into piles of at most three, a death beside a full pile scatters, and a floor keeps only the freshest twelve, so the board never fills with them. Bones still keep in the dark. Criss's idea: a ward built from the bones, the **Grasping Dead** (the Occultist's own, free): a full pile of three on one tile rises as dead arms that seize each creature walking over them and hold it 2 seconds (bosses 0.5s; Behemoths and fliers pass free), lit or dark, seen or unseen; after six grips they crumble. And a second rite of its own, **Raise the Dead** (in place of Name the Thing, which can still be found as a gift): tap a pile of bones and its dead stand up beside the path as a **Risen** that bites whatever comes near, even unseen, for 14 a bone (and more with madness), until the wave breaks. (Claude)

## v16.3 — The Drowned Mother
The first patron. Old things below the stair now make offerings, and the Drowned Mother's price is water on the path. Criss playtested her once ("looked good on my end"); that round made her a little rarer, redrew her water as one channel, and made the Occultist's deed a real deed.
- **The number-only relics rest** (#29), so patrons can be tested without them: Tallow of Saints, Whetted Barbs, Bounty of the Deep, Oil Reserve, Quiet Mind, Sealing Wax, Ossuary Key, Salt Flats, Thunder Marrow, Witch Salt and Leech Jar are never offered while `RELICS_RESTING` is on. A run that carries one keeps it. The Salt-crusted Altar gives the Brined Ledger instead, and the Grimoire marks resting relics "Not on the stair for now". (Claude)
- **The first patron: the Drowned Mother** (#30). Half the time the landing's gift is her offering instead, and at about one break in five (once a floor) she reaches out between waves. Three offerings, take one or refuse her. Each gift raises her **Attention**, and Attention changes your floors: at 1 (**Noticed**) two stretches of the path flood, and the current carries creatures through 30% faster; at 3 (**Watched**) the water creeps a tile further up the path as each wave begins, to 14 tiles; at 5 (**Claimed**) whatever walks in it goes under and can't be seen there unless something unveils it. Ten offerings, all built on her water: **Brine Pools** (salt drags back instead of slowing), **Undertow**, **Hymn Under the Water**, **Her Milk**, **The Cradle** (saves the lamp once, never from a boss), and a new rite, **The Ebb**; the Lamplighter's own **Still Water** and **Drowned Flares**; the Whaler's own **Into the Deep** and **Her Fat**. An offer holds at most one kit offering. Her sign sits beside the Grimoire (tap it), the Grimoire has a Patrons page, How the dark works has a Patrons line, and her water gets tips. Built into the game rather than a separate prototype, so it can be played straight away. After Criss's first playtest she reaches out a little less (about one break in seven, and the landing after that is a quarter, not half), and her water is drawn as one channel poured along the path instead of tile by tile. (Claude)
- **The Occultist's deed is harder** (Criss: binding three horrors "is just tapping the ritual after they die"). It is now **break a wave with your madness at Slipping or deeper**, which takes fielding real horrors and living with the risk. A save that earned the Occultist the old way earns it again, once. (Claude)

## v16.2 — The Whaler
The second kit that plays its own way, and every kit's wards now look like its own. Criss playtested the Whaler twice; the second round reshaped its oil economy and fixed the harpoon line ("that worked out better and I appreciate the design").
- **The Whaler plays differently** (#26, the second kit of five). Its candle is the **Blubber Lamp**: a dish of rendered fat that burns 0.8 tiles wider, but **every Blubber Lamp drinks as each wave begins**: a measure from a Try-pot, or 1 oil from the lamp. Its own new ward, the **Try-pot** (30), renders the dead: each death near it gives up the oil it would have drained, every 6 makes a measure (a gold dot; a ring shows the next), it holds 4, a full pot pours into the lamp, and whatever is left when the floor ends pours in too. The "Next wave" strip shows what the lamps will drink. Its harpoon is the **Tether Harpoon**: the line holds what it hits and slows it more the longer it holds, up to 40%, and lets go as soon as the harpoon fires at something else. Own branches: **Reek** (capstone **Lure**) and **Line** (capstone **Reel In**). The old +20% harpoon damage is gone. Criss's playtest reshaped the economy (one lamp's toll was too gentle, the pot's payoff too small, its wording unclear) and found the line staying on an old target. (Claude)
- **Each kit's wards look like its own.** The Signal Candle is a hooded brass lantern on an iron post, the Blubber Lamp a dish of yellow fat with a smoky flame; the Flare Harpoon carries a red flare canister, the Tether Harpoon a coil of line. The Grimoire shows each kit's version in its own art. (Claude)

---

## v16.1 — Wave decks
Every floor now draws its waves, so no two descents meet the same dark. Criss playtested the decks on their preview and found the late Watcher tip, fixed here.
- **Creature tips wait their turn.** Criss met Watchers on wave 3 but got their tip on wave 4: another tip was up, and the Watchers died before their turn, so the game waited for the next one. Now a creature you meet keeps its tip in line even after it dies, and creature tips come before the others. (Claude)
- **Wave decks** (#27). Each floor now draws its waves from a deck, so no two descents meet the same dark: every wave slot has today's wave plus one or two other cards of about the same weight, built from the creatures that floor already has. Waves with a boss or the Choirmaster keep their place, and floor 5 always brings a Behemoth. The draw is saved with the run; an old save plays the classic waves. The "Next wave" strip names the wave, a tip and a rules line teach it, and `docs/DESIGN.md` lists every card. (Claude, after Jules's run on #27 ended in an error)

---

## v16.0 — Kits that differ, part one
The first release from the "runs that differ" plan (`expansion/BRAINSTORM.md` §13). The Lamplighter plays its own way, kits are earned by deeds, and the Grimoire and relics from the last round ship with it. Criss playtested the Lamplighter and the deeds on their previews.
- **Kits are earned by deeds** (#28). You start with the Lamplighter. The Whaler: kill a Trench Behemoth with harpoons alone. The Occultist: have 3 horrors bound at once. The Galvanist and Bellringer stay in the Ember Hall. Existing saves lock the Whaler and Occultist too (Criss's call). A tip tells you when a deed is done. Developer mode opens every kit and Grimoire page and saves none of it. (Gemini via Jules; review fixes by Claude)
- **The Lamplighter plays differently** (#26, the first kit of five). Its candle is now the **Signal Candle**: you can light one in the dark if it stands within 4 tiles of a lit one, and a dotted thread shows the light leaping across. Its harpoon is the **Flare Harpoon**: each bolt flares where it strikes and unveils what stands near. **Kindle** replaces Flare: tap a creature and it burns for 8 seconds, lighting the dark around it and waking any ward cut off there, but it runs 25% faster. Each has its own branch in place of one plain one: the Signal Candle's **Signal** (the light leaps further; capstone **Fire Thread**: anything crossing a thread catches fire) replaces Wax, and the Flare Harpoon's **Flare** (wider, longer flares; capstone **Starshell**: every fourth bolt lights a wide circle) replaces Sight. The old perks (20-essence candles, wider light, wider lamp) are gone. New tips, rules lines and a Kits tab in the Grimoire teach it. (Claude)
- **Relics in the HUD.** Criss found the Glass Lantern's cost only by watching his oil. Every relic you carry now sits as a seal beside the HUD (cursed ones in red). Tap one and a card says what it does; the next tap anywhere puts it away. The bar keeps one size, so gaining a relic never moves the board. (Claude)
- **The Grimoire**, after Enter the Gungeon's Ammonomicon. It opens from the book in the HUD, the pause menu or the title, and has four tabs:
  - **Creatures**: portrait, life, speed, oil, essence, traits and how each one works. Creatures you haven't met yet are a dark shape and "???".
  - **Wards**: every ward and the lamp, with cost, branches and capstones, and which are gifts.
  - **Rites**: each rite and its cooldown.
  - **Relics**: every relic found, with the ones you carry marked.

  What you've met is remembered across runs. A player from before this version starts with every creature from the floors they reached. (Claude)
- **The plan for runs that differ** (design only): kit variants, wave decks, patrons, Heralds, deeds and dev-mode unlocks, in `expansion/BRAINSTORM.md` §13. Two new rules in `AGENTS.md`: teach every change, and developer mode never saves unlocks. (Criss, Claude)

---

## v15.5 — The walkthrough
Criss's friend playtested 15.4 and was lost by floor 2. This release teaches the game as you play it. Criss playtested it ("everything works as expected").
- **A walkthrough for the first descent.** Criss's friend playtested and was lost by floor 2. Now the first descent asks "First time down here?". The walkthrough teaches by doing: the oil, essence and madness on the HUD, the light, choosing a Candle and building it, opening its branches, rites, and calling the dark. A ring marks what each step talks about, and a bubble over the HUD explains it. Only the bubble's buttons take taps, so the board underneath still works. "I know the way" or "Skip walkthrough" ends it for good. (Claude)
- **First-time tips.** The first time something new turns up, a tip explains it and holds the wave while you read: the fork (with the Weir and the Will-o'-Wisp), veiled Shades and Stalkers, Gnashers, Watchers, Ichor Wretches, Shriekers, Behemoths, the Choirmaster, sigils, madness, and wards cut off from the light. Each tip shows once. "No more tips" switches them off, and Settings can replay the walkthrough and tips. (Claude)
- **The Knucklebones on the title**, in developer mode only: a practice table against a Gentle, Cunning or Merciless opponent. Nothing is staked, won or saved. (Claude)
- The rules list still described the old push-your-luck Knucklebones; it now describes the current game. (Claude)

---

## v15.4 — The Knucklebones
The gambling idea from the expansion brainstorm, built as a room behind the stair doors. Designed with Gemini, then reshaped over three playtests by Criss: first push-your-luck, then a table "visually playing the game", then Cult of the Lamb's rules on a table repainted to match the rest of the game ("I tested it out and I enjoyed it").
- **The Knucklebones**, a new Gamble room. The hooded thing plays Cult of the Lamb's knucklebones for essence the stair would burn. Each side has three columns of three. Roll one bone and set it in a column. Matching bones multiply (two 4s score 16, three score 36). A bone knocks every bone of that number out of the facing column. When either side fills, the higher total wins. The stake is 40 + 20 per floor. A win pays double, safe from the toll, and a win by 20 or more adds a relic. A draw hands the stake back. It plays greedily, and less carefully on the shallow floors. (Claude, designed with Gemini)
- **The table:** a stone wall, a rough table with carved places, dripping candles and a skull, with fog drifting across. The hooded figure's eyes glow dimly in its hood and follow the bone in play. The bones are 3D cubes that tumble, bounce and settle; its bones are darker, and their one is an eye. Tap a column, or the table over it; a tap during its move hurries it. (Claude)
- **Developer mode** can jump to any floor, keeping the run (relics, wards, essence), and can clear the current floor straight to the landing. Criss: "absolutely helpful… to run these play tests better." (Claude)
- Gemini's reviews tightened the opponent's tie-break and asked for proof that the table's animation loop stops when you leave. (Gemini, Claude)

---

## v15.3 — Forked stairs
The first piece of the expansion Criss asked for: ways to influence the path during a run. Designed by Claude and Gemini on #10, prototyped in a sandbox, then playtested by Criss ("made the game feel more interesting… try different strategies") before it went in.
- **Forked stairs** on floors 2 and 3. Creatures take the darker way, counting only the light you cast; a gold chevron shows where they will go. Shades and Stalkers hunt your light, Gnashers and bosses keep the main way, and a Wretch bursting before a fork sends a Skitterling down each side. Untouched, both floors play as before. (Claude, Gemini)
- **The Weir** (45), a path ward on forked floors: build it on the fork and flip it between waves. Watchers fly over it; a Behemoth breaks it. (Claude, Gemini)
- **Will-o’-Wisp**, a rite you hold on forked floors: tap a way at a fork and for 8 seconds everything but a boss follows the wisp. Cooldown 30s. (Claude, Gemini)
- Gemini's review caught a Wretch brood born past a fork jumping three tiles to the other way; creatures now choose only as they walk across. (Gemini found, Claude fixed)
- "How the dark works" opens the rules on top, with a "More below" cue on any pop-up that scrolls. Found by Criss (#11). (Claude)
- The Gemini reviewer no longer posts cut-off answers; Gemini caught a bolded-verdict gap in the fix. (Claude, Gemini)

---

## v15.2 — Moved to GitHub, steadier taps, relic fix
- **Gemini:**
  - Relic removal is now exact: removing any relic undoes only its own effect on oil capacity, whatever order relics came and went in. `removeRelic` checks you actually hold the relic, and the capacity floor of 6 holds for every combination. Old saves migrate.
  - Double-tap protection: a tap that starts before, or within 150ms of, a modal or landing step appearing can't pick a choice on the new screen. Fast double-taps no longer blindly choose a stair door. Tested with real touch events (`double-tap.test.js`).
- **Claude:**
  - Moved the project to GitHub: `AGENTS.md` as the shared brief, design docs, a test suite on every PR (`checks`), playable preview links for every PR plus the live site (`site`), and the Gemini reviewer (`gemini-review`).
  - PR previews keep their own save (`window.LL_STORE_NS`), so Criss's real run is never touched.
  - The title screen shows the version, and "preview build" on previews.
- **Expansion (design only, nothing in the game yet):** Claude and Gemini brainstormed path influence, gambling and darkness mechanics in `expansion/`, and built a sandbox prototype of forked stairs. See `expansion/BRAINSTORM.md`.

---

## v15 — Parallax descent dust
- **Gemini:** dust in the descent map rushes upward as the camera sinks, with nearer motes moving faster (parallax from `scrollY`).
- **Claude:** at full speed each mote stretches into a short streak, sized from the derivative of the easing curve, so the drop reads as speed rather than flicker at 60fps.

## v14 — Fits any phone, and the placement card leaves the board
- **Bug (found by Criss on the unfolded Fold):** the "Candle Ward · 30 essence / Cancel" card floated over the bottom of the board, and tiles under it couldn't be tapped. In a reproduction, 43 lit tiles were unplaceable. **Fix:** the card now lives in the command bar and takes the rites' slot while you place, at exactly the rites' size, so nothing shifts. If its description gets cut off, the full text shows as a hint.
- **Short landscape screens** (iPhones sideways, the folded Fold sideways) get a three-column layout: HUD left, board centre, tools right. On an iPhone 15 tiles grew from 15 to 22 px; on the folded Fold, from 16 to 28 px. Sideways, the upgrade panel covers the tools column instead of the board.
- Safe-area padding for notches, the Dynamic Island and rounded corners; `100dvh`; no double-tap zoom or long-press text selection; "Full screen" is hidden on iPhone (it can't work there); the pause menu fits short screens in two columns.
- Checked on 14 screen sizes. (Claude; Gemini approved)

## v13 — The descent map
- Criss asked for a map of the floors and a lantern descending between them.
- **Gemini** designed and wrote it: a full-screen overlay, a lantern sinking down a shaft past cleared floors, unknown floors shown as "???", watching eyes that keep off the shaft, drifting dust, floor tints, tap to skip, "View map" in the pause menu, and a longer descent into the Abyssal Heart. Its later patch made the glow bleed red on that final drop.
- **Claude's review** found and fixed nine issues before it shipped:
  - The lantern drew about 2px tall (wrong unit-space scale).
  - Eyes and dust were invisible because `hash()` got two arguments instead of three.
  - The toll message was read after it had been cleared, so a deferred hint crashed or showed empty.
  - A touchscreen ghost-tap: a skip tap could start a wave or hit a pause-menu button. It now listens on `click`.
  - Floor tints showed band seams.
  - The pause-menu map didn't fit all floors or show "you are here".
  - Closing that map didn't return to the pause menu.
  - Floor names now fade as the lantern passes over them.
  - The frame-loop patch was rebased onto v12.

## v12 — Gemini batch 2
- **Gemini:** removed per-frame array copies in damage loops (less garbage collection on mobile), and added 3× speed.
- **Claude:**
  - Kept the loops allocation-free but cached their length. A plain `for…of` would have hit Wretch Skitterlings on the tick they're born, a silent gameplay change.
  - Made piercing bolts use a swept hit test so fast bolts can't skip creatures.
  - The simulation now runs in steps of 50ms or less, so 3× plays like 1×, only faster.

## v11 — Gemini batch 1
- **Gemini:**
  - The trap now finds its targets in a single pass.
  - Creatures grow out of their rift and shrink as they reach the lamp.
  - The boss bar only writes when its value changes.
  - The Keeper's attack gets a beam and a screen shake.
  - Ember payouts now grow with how deep you got.
- **Claude:**
  - The lamp-shrink effect never triggered, because creatures are removed at `len − 0.4`. Fixed with `foeScale()`.
  - Added a red `kbeam` effect instead of reusing the green hex link.
  - Raised Ember Hall costs to match Gemini's bigger ember payouts.

## v10 — The roguelike layer
- Criss: "way too easy to accumulate essence… what would you do to make it more of a roguelike?" He asked for everything in one go:
  - the essence **toll** on the stair;
  - **forked stairs** with rooms (merchant, shrine, event, rest, reliquary, deep stair);
  - **omens**;
  - starting **kits**;
  - **relics** with trade-offs, some cursed;
  - **embers**, the **Ember Hall** and **the Deeper Dark** (depths 1–5).
- Income was cut 5–40% per floor before the toll.
- Criss: reached floor 4's last wave and died to a nearly dead boss, and called it "better balanced". He decided bosses stay **all-or-nothing**.

## v9 — More wards, boss entrances, harder
- Criss: "the game's pretty easy". He cleared floor 2 with one upgraded harpoon and a bound horror. He asked for more things to buy, with real strategies and synergies.
- **New wards:** Hook Trap, Tithe Bowl, Hex Effigy. **Gift wards:** Tar Censer, Galvanic Coil, Whaling Gun.
- **Statuses:** hex, bleed, pin, flense, stun, knell.
- **Boss entrances:** the sim freezes, the boss is revealed and a title card plays, plus a boss bar. First-appearance banners for the elite and the behemoth.
- **Difficulty:** wave count ×1.35, spawn gaps ×1.3, group delays ×1.25, steeper health scaling.
- In testing, the one-harpoon strategy now loses about 44 oil on floor 2.

## v8 — "3D in the 2D sense"
- Criss asked for scarier enemies, maps and backgrounds.
- **Creatures:**
  - procedural art with volume shading, specular glints and glossy eyes;
  - silhouettes with burning eyes in the dark;
  - cached sprites and a y-sorted draw list;
  - shadows cast away from the lamp and rim light from the nearest light;
  - the Watcher's iris stares at the lamp.
- **Floors:** beveled flagstones, sunken trench paths, per-floor props with baked shadows, glowing veins and fissures, fog, dust, death stains, a madness vignette and phantom eyes.
- **Graphics settings:** Lite graphics, plus an automatic switch to Lite when frames stay slow.
- Criss: "absolutely incredible… way more than I was expecting."

## v7 — Flare fix
- Casting Flare shifted the whole board left. Cause: the banner class `.banner.rite` collided with the rite buttons' `.rite` CSS. Banner variants are now prefixed `is-`.

## v6 — First Claude + Gemini merge
- Merged Gemini's modified version of the game with Claude's review fixes:
  - a crash from a missing `FOES.keeper` entry;
  - floor 5 had five times floor 4's total creature health, so it was rebalanced;
  - the developer menu used to open by accident when you placed candles around the lamp, so it moved to a hidden unlock (tap the title 7 times).

## v1–v5 — The beginning
- Built by Claude from Criss's concept: tower defense meets roguelike, a Lovecraftian dungeon crawl, the last lamp at the bottom of a drowned stair. Criss grew up on tower defense and came to roguelikes later.
- These versions introduced the core game:
  - light and connectivity;
  - wards with branch upgrades;
  - bound horrors and madness;
  - rites;
  - five floors with the Keeper Below and the Primordial;
  - procedural sound and saves.

---

## How the collaboration has worked
1. **Relay era (v6–v15):** Criss carried files and FIND/REPLACE patches between Claude and Gemini. Gemini proposed, Claude reviewed and tested on Fold-sized screens, and Criss gave the green light. It worked, but it was slow, every version had to be downloaded, and a stale FIND broke at least once.
2. **GitHub era (now):** one repository, pull requests, critical reviews in both directions, CI tests on 14 screen sizes, and Criss merging as the green light. See `AGENTS.md`.

## Lessons that became rules
They're all in `AGENTS.md` section 6. In short:
- class collisions;
- deferred reads after state is cleared;
- `hash()` arity;
- unit-space scale;
- ghost taps;
- UI covering the board;
- loops that hit newborn creatures;
- FINDs that match the wrong place.
