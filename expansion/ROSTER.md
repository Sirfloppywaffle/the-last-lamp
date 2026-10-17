# The Roster — five who went down the stair

Design for #36, part 2: the kit picker becomes a roster of characters, each with a painted portrait. Part 1, the unlock reveal, uses the same portraits. Drafted by Claude, revised after Gemini's review on #60, October 2026. **Nothing here is in the game yet.** When the thread settles, it graduates into one feature PR (see "Build plan").

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

**Light sits at chest height or above** (Gemini). A card on a folded Fold is about 180 px wide, the bottom third is crowded, and a light at the hips leaves the face dark.

### The Lamplighter: Ambrose Fenn
*"He kept the harbour lamps forty years. On the last night he kept one more."*
- **Who:** the town's lamplighter. When the water came he climbed the stair with the last flame he could carry, and he is why the lamp below still burns. He's the default for a reason: the lamp is his.
- **Portrait:** an old man, tall and stooped, in a greatcoat stiff with forty years of wax drips. Pale streaks run down the front, built up like candle runs. Wax has built up over his left shoulder and collar into a crust of stalagmites, so his silhouette is lopsided and reads at any size (Gemini). He holds a lighting pole as tall as himself, hooked at the top, with a hooded brass Signal lantern hanging from it at chin height. The lantern lights his face from below: a hooked nose, deep sockets, one eye milky from the heat. A brass mirror hangs at his hip (the Signal Mirror).
- **Light source:** his lantern, warm tallow (`--tallow`).
- **Locked:** n/a, since he's always open. In the reveal and the Grimoire, his lantern is the first thing to light.
- **Plays like:** *Light passes hand to hand.*

### The Whaler: Margery "Mags" Tolland
*"Harpooner off the Patience. She has gutted worse than what climbs these stairs."*
- **Who:** the first woman to throw iron off a Saltmouth ship. She was rendering blubber on the quay when the sea came over it, and she followed the dark down with her irons because it had taken her ship.
- **Portrait:** broad-shouldered, in black oilskins slick with brine. A sou'wester is pushed back. A coil of tarred line hangs over one shoulder, and a toggle harpoon rests across the other. Her forearms are scarred, with a faded anchor tattoo. An open iron cruse lamp, hooked to her oilskins at mid-chest, burns rendered fat. It throws a smoky amber light up across her collar, a scar at her throat and her jaw, and catches the iron toggle head on her shoulder (Gemini; it was a dish at her belt). Her jaw is set and her eyes are narrowed.
- **Light source:** the blubber flame, smoky yellow.
- **Locked:** the flame at her chest, and the glint of the harpoon's iron head.
- **Deed (as now):** kill a Trench Behemoth with harpoons alone.
- **Reveal line:** *The line holds. She comes down after it.*
- **Plays like:** *Hold them, haul them, render them.*

### The Occultist: the Nameless
*"It gave its name to something below, and got this in return."*
- **Who:** nobody remembers who it was, not even itself. It paid its name for the right to bind what climbs the stair. **Bold call:** it stays nameless, and the card says *The Nameless* where the others have names.
- **Portrait:** a deep hood and a long robe gone green at the hem, with no face. Inside the hood is darkness and two pinpricks of violet. A skull candle burns on bones in one hand. **The eyes of its bound things are inside the hood**, peering out of the dark where a face should be: a Watcher's great pale eye, a Gnasher's red slits, two or three more, glossy and wet (Gemini: eyes floating around the robe clutter a small card). Two stay outside, as Criss asked in #36: one large pale eye low in the dark at its side, and one above its shoulder, few and big enough to read. **The eyes move.** That's the one animated detail besides Voss's arc (a slow drift; Lite freezes it).
- **Light source:** the corpse candle, a sickly green-white, and the violet of madness (`--madness`).
- **Locked:** only the eyes, glinting inside a hood you can't see.
- **Deed (as now):** break a wave with your madness at Slipping or deeper.
- **Reveal line:** *Something below hears it ask, and answers.*
- **Plays like:** *Madness is the price, and the weapon.*

### The Galvanist: Dr. Lucan Voss
*"Struck off the Royal Institution's rolls. He came down to prove the lamp could run on lightning."*
- **Who:** a disgraced natural philosopher who came to Saltmouth for its storms. He'd strung copper over half the harbour when the sea came. He doesn't think the dark is supernatural. He thinks it's a problem in conduction.
- **Portrait:** a thin man in a scorched waistcoat, sleeves rolled, round smoked-glass goggles pushed up on his forehead. His hair stands up from static, and his grin is too wide. A bandolier of Leyden jars glows faintly blue across his chest, and a coil of copper wraps his left forearm to the fingertips. Two copper electrodes are bolted to his high collar, and **a blue arc jumps between them across his throat**. That arc lights him: a violent blue-white from below, on his goggles and his grin (Gemini: a spark at the fingertips is a few pixels under a thumb). Burn marks cover his hands.
- **Light source:** the collar arc, blue-white, flickering. It's the one portrait whose light flickers (Lite: steady).
- **Locked:** the jars' faint blue and the arc at the collar, with a man-shaped dark around them.
- **Deed (new, proposed, revised):** *carry the light 12 tiles from the lamp in one unbroken chain.* His whole kit is a circuit that must reach the lamp, and every kit already builds chains of light (Signal Candles, Blubber Lamps, Corpse Candles in a line of the dead), so it needs no lucky drop. This replaces "three in salt with one Coil bolt", which Gemini rightly called double luck (a Coil gift, then salt). The Ember Hall cost (70) stays as the other way in.
- **Reveal line:** *The circuit closes. Somewhere below, a man laughs.*
- **Plays like:** *Wire the dark; don't let it run hot.*

### The Bellringer: Agathe Vell
*"She rang the bell of St. Agatha's as the town went under, and came back up the stair blind."* (already in the game)
- **Who:** as the game has her. The bell rope burned her hands, and the water took her eyes. She hears everything.
- **Portrait:** a small woman in a drowned church-warden's cloak. A strip of linen is bound over her eyes, stained at the edges. She holds a hand bell up near her ear, and its clapper is cracked. Her head is tilted, listening. Bell rope is wrapped around her wrists like bandages. **There is no light on her at all.** She's drawn in **pale sound-rings**, as the game draws a Toll: bone-white outlines where the ring touches cloak, cheek and bell. Her body is a faint slate mass (`#101418`), never pure black, so the rings have a human form to trace and the card never looks blank on an OLED screen (Gemini). She's the one portrait drawn by echo instead of light.
- **Light source:** none. Bone outlines over a slate shape.
- **Locked:** a single faint ring expanding over nothing.
- **Deed (new, proposed):** *kill ten Shades or Stalkers in one descent while they're unseen* (with Hook Traps, the Grasping Dead or a censer: anything that strikes what the light doesn't show). You learn to fight what you can't see before she arrives. Every kit can do it from the start: the Lamplighter and Whaler begin with Hook Traps, and the Occultist with the Grasping Dead. The Ember Hall cost (110) stays as the other way in. (Gemini proposed "survive the dark answering", but Noise only exists in her own kit, so nobody could earn her that way.)
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
4. **Any tap snaps it to the finished card at once** (Gemini: never hold someone who wants to descend again), and a second tap continues. Both on `click` (rule 5). It shows **regardless of the tip setting**, since it's a reward. Reduce motion makes it a plain fade.

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

Settled with Gemini: names and Saltmouth stay; light at chest height; Agathe gets a slate body under her rings; the reveal skips on a tap.

For Criss:
1. **New deeds** for the Galvanist (carry the light 12 tiles in one chain) and the Bellringer (ten Shades or Stalkers killed unseen in one descent), or keep both Ember Hall only?
2. **The Nameless's eyes:** mostly inside the hood (Gemini), with two outside as in #36. Or all inside?
