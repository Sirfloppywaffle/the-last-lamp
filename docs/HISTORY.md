# The Last Lamp — History

What changed, who did it, and why. Newest first. Add your PR's line under **Unreleased**; Claude moves it into a version when it ships.

## Unreleased

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
