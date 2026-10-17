# The Roster — five who went down the stair

Design for #36, part 2: the kit picker becomes a roster of characters, each with a painted portrait. Part 1, the unlock reveal, uses the same portraits. Drafted by Claude for Criss and Gemini, October 2026. **Nothing here is in the game yet.** When the thread settles, it graduates into one feature PR (see "Build plan").

Everything below is a proposal. The bold calls are made so there's something to push against.

---

## 1. What changes for the player

- **Descend** opens the **Roster**: five tall cards, one per kit. Each has a portrait, a name, the kit's title, and one line of who they were.
  - On a folded Fold in portrait, the cards make a 2-column grid, and the last one sits centred.
  - Unfolded and on wide screens they sit in one row of five.
  - In short landscape they're a single row that scrolls sideways.
- **Tap a card** and it lifts: lamplight sweeps across the portrait, and the kit's wards, rites and "plays like" line appear beneath. **Descend as …** begins the run. Tapping another card switches; nothing jumps.
- **Locked kits** are a figure in the dark: the silhouette with one detail catching light, set by each character below. Underneath is the deed in tallow and, if the kit has one, its Ember Hall cost. Tapping one says the deed. It never starts a run.
- **The Grimoire's Kits tab** shows the same portrait in place of the letter seal, with the backstory below.
- **The reveal** (part 1): when a deed is done during a run, the end-of-run screen shows that portrait dark, then floods it with lamplight. Its name, its title, the deed and the reveal line follow.

---

## 2. The five

The town has no name in the game yet. **Proposal:** call it **Saltmouth**, a harbour town that went under in one night when the sea "came in and did not go out". St. Agatha's, the Bellringer's church, stood at its top. Every character was there that night.

Each portrait is painted the way the creatures are: in unit space, "3D in the 2D sense", volume from one light, glossy eyes, and the rest lost to the dark. **Every portrait is lit by its own light source**, and that source is what survives in the locked silhouette.

### The Lamplighter: Ambrose Fenn
*"He kept the harbour lamps forty years. On the last night he kept one more."*
- **Who:** the town's lamplighter. When the water came he climbed the stair with the last flame he could carry, and he is why the lamp below still burns. He's the default for a reason: the lamp is his.
- **Portrait:** an old man, tall and stooped, in a greatcoat stiff with forty years of wax drips. Pale streaks run down the front, built up like candle runs. He holds a lighting pole as tall as himself, hooked at the top, with a hooded brass Signal lantern hanging from it. The lantern lights his face from below: a hooked nose, deep sockets, one eye milky from the heat. A brass mirror hangs at his hip (the Signal Mirror).
- **Light source:** his lantern, warm tallow (`--tallow`).
- **Locked:** n/a, since he's always open. In the reveal and the Grimoire, his lantern is the first thing to light.
- **Plays like:** *Light passes hand to hand.*

### The Whaler: Margery "Mags" Tolland
*"Harpooner off the Patience. She has gutted worse than what climbs these stairs."*
- **Who:** the first woman to throw iron off a Saltmouth ship. She was rendering blubber on the quay when the sea came over it, and she followed the dark down with her irons because it had taken her ship.
- **Portrait:** broad-shouldered, in black oilskins slick with brine. A sou'wester is pushed back. A coil of tarred line hangs over one shoulder, and a toggle harpoon rests across the other. Her forearms are scarred, with a faded anchor tattoo. A small blubber dish burns at her belt and lights her from the side in a smoky yellow, so half her face is in shadow. Her jaw is set and her eyes are narrowed.
- **Light source:** the blubber flame, smoky yellow.
- **Locked:** the flame at her belt, and the glint of the harpoon's iron head.
- **Deed (as now):** kill a Trench Behemoth with harpoons alone.
- **Reveal line:** *The line holds. She comes down after it.*
- **Plays like:** *Hold them, haul them, render them.*

### The Occultist: the Nameless
*"It gave its name to something below, and got this in return."*
- **Who:** nobody remembers who it was, not even itself. It paid its name for the right to bind what climbs the stair. **Bold call:** it stays nameless, and the card says *The Nameless* where the others have names.
- **Portrait:** a deep hood and a long robe gone green at the hem, with no face. Inside the hood is darkness and two pinpricks of violet. A skull candle burns on bones in one hand. Around it, hanging in the black, are **the eyes of its bound things**: a Watcher's great pale eye above its shoulder, a Gnasher's red slits low at its side, three or four more, glossy and wet. **The eyes move.** That's the one animated detail on the roster (a slow drift, two frames in Lite).
- **Light source:** the corpse candle, a sickly green-white, and the violet of madness (`--madness`).
- **Locked:** only the eyes, glinting in a ring around nothing.
- **Deed (as now):** break a wave with your madness at Slipping or deeper.
- **Reveal line:** *Something below hears it ask, and answers.*
- **Plays like:** *Madness is the price, and the weapon.*

### The Galvanist: Dr. Lucan Voss
*"Struck off the Royal Institution's rolls. He came down to prove the lamp could run on lightning."*
- **Who:** a disgraced natural philosopher who came to Saltmouth for its storms. He'd strung copper over half the harbour when the sea came. He doesn't think the dark is supernatural. He thinks it's a problem in conduction.
- **Portrait:** a thin man in a scorched waistcoat, sleeves rolled, round smoked-glass goggles pushed up on his forehead. His hair stands up from static, and his grin is too wide. A bandolier of Leyden jars glows faintly blue across his chest, and a coil of copper wraps his left forearm to the fingertips. A spark jumps between his thumb and forefinger. **That spark lights him**: a hard blue-white from below, with sharp shadows. Burn marks cover his hands.
- **Light source:** the spark, blue-white, flickering. It's the one portrait whose light flickers (Lite: steady).
- **Locked:** the jars' faint blue and the spark, with a man-shaped dark between them.
- **Deed (new, proposed):** *kill three creatures standing in salt with a single Galvanic Coil bolt.* It's his own combo (lightning does double in salt), done by someone else's kit before he exists. The Ember Hall cost (70) stays as the other way in.
- **Reveal line:** *The circuit closes. Somewhere below, a man laughs.*
- **Plays like:** *Wire the dark; don't let it run hot.*

### The Bellringer: Agathe Vell
*"She rang the bell of St. Agatha's as the town went under, and came back up the stair blind."* (already in the game)
- **Who:** as the game has her. The bell rope burned her hands, and the water took her eyes. She hears everything.
- **Portrait:** a small woman in a drowned church-warden's cloak. A strip of linen is bound over her eyes, stained at the edges. She holds a hand bell up near her ear, and its clapper is cracked. Her head is tilted, listening. Bell rope is wrapped around her wrists like bandages. **There is no light on her at all.** She's drawn in **pale sound-rings**, as the game draws a Toll: bone-white outlines where the ring touches cloak, cheek and bell, with everything between left dark. She's the one portrait drawn by echo instead of light.
- **Light source:** none. Outlines only, in `--bone`.
- **Locked:** a single faint ring expanding over nothing.
- **Deed (new, proposed):** *kill ten Shades or Stalkers in one descent while they're unseen* (with traps, the Grasping Dead or a censer: anything that strikes what the light doesn't show). You learn to fight what you can't see before she arrives. The Ember Hall cost (110) stays as the other way in.
- **Reveal line:** *A bell rings under the water. She heard you.*
- **Plays like:** *Light lets you build; sound lets you see.*

---

## 3. Art direction for all five

- **Size:** each portrait is painted once into an offscreen canvas at 3:4, about 300×400 device px (DPR ≤ 2), cached in `PORTRAITS`. Locked and unlocked are two cached versions.
- **Shared kit:** reuse `blob`, `tendril`, `ell`, `eyeG`, `lit` and the silhouette mode `M.sil` from `drawCreature`. Portraits are a new `ART`-like table, `PORTRAIT_ART`, in unit space.
- **One light each, falling off to the dark.** Black around the edges, no backgrounds. The card's frame is `--seam` stone with a tallow inner edge when the card is selected.
- **Lite:** no live animation (the Nameless's eyes and Voss's spark freeze on their best frame). Otherwise the same cached images.
- **Reduce motion:** no sweep. The card brightens in place.
- **Not portraits of anyone real.** Original characters only.

---

## 4. The reveal (part 1)

1. The end-of-run box (won or lost) shows, before its stats, **one reveal per kit unlocked this run**.
2. The portrait shows dark, in its locked version. Over 1.2 s the lit version fades up from the light source outward: a radial wipe from the lantern, flame, candle or spark. For Agathe Vell, a ring sweeps out and draws her.
3. Then come her name and the kit's title in `--f-display`, the deed in small caps, and the reveal line in italics.
4. A tap continues (`click`, rule 5). It shows **regardless of the tip setting**, since it's a reward. Reduce motion makes it a plain fade.

---

## 5. Rules this has to keep

- **Rule 2 (nothing shifts):** cards have a fixed aspect from the first frame, and portraits paint into a placeholder of the same size.
- **Rule 17:** portraits are painted once, at load or first open, and never per frame. Only the eyes and the spark animate, from 2–4 cached frames.
- **Rule 18:** Lite and reduce-motion paths as above.
- **Rule 23:** a "How the dark works" line ("**The Roster.** Five went down the stair the night Saltmouth drowned. …"), a tip the first time the roster opens with a locked card, and the Grimoire's Kits tab shows portraits and backstories. New deeds get the existing "A deed is done" tip.
- **Rule 24:** dev mode shows every portrait lit and every backstory, and records nothing.
- **Saves:** no save shape changes for the roster. The two new deeds add keys to the existing deed list. A save that already has the Galvanist or Bellringer keeps them.
- **Devices:** Fold portrait (~412×860), Fold landscape (~915×356), unfolded (~832×694) and the iPhone sizes, all in `devices.test.js`.

---

## 6. Build plan

1. **This PR:** the design, reviewed by Gemini, settled by Criss.
2. **Roster PR:** `PORTRAIT_ART` for all five, the roster screen in place of the kit modal, and the Grimoire Kits portraits. Comes with tests and screenshots at the device sizes.
3. **Reveal PR:** the end-of-run reveal and the two new deeds (if Criss takes them).

---

## 7. Open questions (for Gemini and Criss)

1. **Names.** Ambrose Fenn, Mags Tolland, the Nameless, Dr. Lucan Voss, Agathe Vell. Do they fit? Is "Saltmouth" right for the town?
2. **New deeds** for the Galvanist and Bellringer, or keep them Ember Hall only?
3. **Agathe drawn in sound-rings** instead of light. Is it striking, or hard to read on a phone?
4. **The Nameless's moving eyes.** Is this the right single animated detail for the roster, or should every portrait have one?
