# The Last Lamp — History

What changed, who did it, and why. Newest first. Add your PR's line under **Unreleased**; Claude moves it into a version when it ships.

## Unreleased

- Moved the project to GitHub, with:
  - `AGENTS.md`, the shared brief;
  - design docs;
  - a 16-part test suite, run on every PR (`checks`);
  - playable preview links for every PR, plus the live site (`site`);
  - the Gemini reviewer (`gemini-review`). (Claude)
- The game reads `window.LL_STORE_NS` so PR previews keep their own save. No gameplay changes.
- The title screen shows the version (`GAME_VERSION`, now 15.1), and "preview build" on PR previews, so it's always clear which build is being played. (Claude)

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
