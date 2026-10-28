# Expansion 3: Saltmouth Above

**Status (28 Oct 2026):** steps 1 to 8 are merged (#116, #117, #119, #122, #123, #124, #127, #129). Step 9 (the Keeper's Lodge) is in review. The Loaded Bone moved from the Brazier to the Drowned Oar in step 7. Progress per step lives in `EXPANSION3_RUNBOOK.md` §1.
**From Criss:** a walkable town above the stair, built from what each run hauls up. *"We're not changing anything to the game itself, just adding to it."*
**Who:** Gemini drafted it (from section 1 down, kept as written apart from the fixes listed in 0.1). Claude reviewed it against `main` at v18.9.0 (round 1, section 0, Opus 5.5). Criss steers. **Where section 0 and the draft disagree, section 0 wins** until Criss says otherwise.

---

## 0. Round 1: Claude's review, and where it landed

**Verdict:** doable, as an additive module that only touches the game at three seams (the title, the end of a run, and `newRun()`). Not doable as written: one rule would switch the whole feature off, several gains break Pillar 2, and the scope is about twice what ten small PRs can carry. The changes below fix that.

### 0.1 Fixed in the draft (facts that were wrong on `main`)
- **The whaler is Jonah Tolland**, not Mags (renamed with his bearded portrait in #61). Changed throughout.
- **Floor 4 is the Throat**, not the Keeper's Vault. Changed.
- Section 2.2 says an `18×18` map and a `288×288` light buffer; section 5 says `24×24`. It is **`24×24` tiles, `384×384` logical pixels**, and the light buffer matches.
- At `3×` a 16 px tile is 48 CSS px, so a folded Fold (412 px wide) shows about **8½ tiles across**, not 11. Fine for thumbs; the camera follows.
- The `< 0.8 ms` per frame is a guess, not a measurement. Step 2 measures it.
- `showHaul()` and `lastKit` don't exist. The kit is `meta().lastKit`; the end-of-run card is built in the death and morning screens.
- A Skitterling can't be bound (only Gnasher, Watcher, Wretch and Shrieker). Familiar's Tether gives a **Watcher**.

### 0.2 The big catch: every run is seeded
Since v18.6.0 **every** new run has a seed (`newRun()` always makes one). The draft turns Town Blessings off on "Seeded Runs", which would turn them off on every run.
- **Rule instead:** the town's gift is off on a **replayed** stair (`run.replay`, *Descend the same stair* and pasted codes) and on any floor under a **Trial**. Everywhere else it applies.
- **Same seed, same stair:** anything the town changes about what the stair offers (a shrine's patron, a pawned relic) is applied **after** the seeded roll, as a filter, and is saved in `run` so a resume gives the same landing. No new `Math.random()` on the stair (rule 11b).

### 0.3 One thing goes down with you (Pillar 2 and "the game should be hard")
The draft has one blessing slot, but chores, shrines and the pawned relic sit outside it, so they stack. And several gains are free: the Loaded Bone always pays, the Nameless's chore mints embers, Agathe's chore adds starting essence.
- **One town gift per descent, total.** A workshop blessing, **or** a shrine's candle, **or** a pawned relic. Picked before the frame, shown as one seal in `#relBar`, saved in `run.gift`.
- **Every gift has a price on the stair.** Numbers are shape only:

| Gift | Gain | Price |
|---|---|---|
| The Chandler's Dip (Brazier) | your first Candle Ward on floor 1 is free | the lamp burns 0.5 smaller until floor 1's first wave breaks |
| Whaler's Ration (Try-Works) | +2 oil at each Rest | the merchant asks 10% more this descent |
| Capacitor Tune (Smithy) | +1 rite charge on floor 1 | every rite's first wait on floor 1 is 25% longer |
| Echoing Iron (Belfry) | floor 1 shows waves 1 and 2 exactly | the early-call bonus is halved on floor 1 |
| Familiar's Tether (Menagerie) | start with a bound Watcher | its madness counts from the first wave, fielded or not |
| The Loaded Bone (Drowned Oar) | roll: 4 to 6 is +15 essence | 1 to 3 is −10 |
| A shrine's black candle | that patron's offer is among floor 1's | its Attention starts at 1 |
| The Pawned Relic (Toothmonger) | one non-cursed relic is never offered | the Toothmonger keeps 25 tallow |

- **Chores pay town materials only.** Never embers, never anything on the stair. The Nameless scribes **1 curio per 3 floors**; Agathe tolls the fog-bell for **5 timber and 5 iron a floor**. One chore slot (two at Lodge tier 3).
- **The Scrap Chute** (80% back on a sale) and the **Harpoon Rack** (50% off an upgrade) are cut. They are permanent, priceless and on top of the gift.

### 0.4 Art direction: pixel art (Criss decided, 23 Oct)
`AGENTS.md` §1 records "3D in the 2D sense" for the game. **The surface is pixel art; the stair stays painted.** Criss: "Pixel 100%." The Roster portraits stay painted, so faces match where you choose a Keeper.

The four references Criss gave Gemini (screenshots, not kept in the repo), and what each means here:
- **Pixel Heroes** (an idle RPG's title art): chunky chibi bodies with big heads and hoods, a hard dark outline, one held tool each, faces read from two or three pixels. *Here:* the Keepers and townsfolk, 16×24, each told apart by silhouette and tool alone.
- **Blood Forest** (a top-down action RPG): purple-brown earth in big dithered patches, black round-crowned trees with rust-orange canopies, scattered red ember squares, pale grass tufts, wooden posts. *Here:* the cliff ground and its edge; the palette's rust and ember reds.
- **Lovecraft's Untold Stories, the library:** diamond-patterned red-brown floor, tall shelves of coloured spines, green and amber desk lamps, two jackal statues flanking a dark ritual circle, cyan water in stone basins. *Here:* the Keeper's Lodge.
- **Lovecraft's Untold Stories, the graveyard:** dark cobbles drawn as rounded stones, a slate-roofed crypt in blue-grey brick with moss, iron fence, stone crosses, small amber fires, thin diagonal rain. *Here:* the square, the north cemetery, the weather.

What all four share, and the rules for step 2: a **dark ground with little contrast** so lit things pop; **light as small warm sources** (fires, lamps, windows), never a flat bright scene; **no anti-aliasing**, integer scale only; **outlines one shade darker**, not pure black, except on characters.

### 0.5 Smaller calls
- **The title stays the front door.** `startInTown` defaults to **off**; *Walk Saltmouth* sits beside Descend. Turning it on is a setting. (Criss: nothing changes in the game itself.)
- **Merge #115 first.** The new title scene is still open and step 2 adds a button to the same screen.
- **The town's lift isn't "the Winch."** Expansion 2 already has a descent called The Winch. Saltmouth was a mining port too: the shaft in the square is the **Head-frame**. "Descend the stair" stays the button.
- **The haul is credited once, at the end of the run.** Floor clears add to `run.haul` (saved with the run); death, the morning or abandoning credits it to `ll-town` and clears it in one write. Crediting at each floor clear would double-pay after a reload.
- **The toll renders tallow:** counted in `descend()`, where the 70% burns, into `run.haul`. The last floor of a death has no toll, so nothing renders there.
- **Rescued souls** come from a cage on a landing. That is a new stair roll with **a new salt** at the end of `SALT`; old seeds keep their doors but a door may now hold a cage.
- **Dev mode** works on an in-memory town and never writes `ll-town` (rule 24), as the draft says.
- **Cut for now:** the Lodge's Comfort Score, three Lodge sizes (one `10×10` room), the Phonograph, the Belfry's weather bell, Specimen Terrariums, the Eldritch Sentinel, walk-speed paths. Each is art or systems with no reason to descend. They can come back in a later round.
- **Locked Keepers** don't walk the town. Their station stands dark, with the deed that frees them on a tap.

### 0.6 The plan, reordered (each step is one PR, playtested on the preview link before the next)

| Step | What | Model, effort |
|---|---|---|
| 1 | This doc | Opus 5.5, medium |
| 2 | Pixel compiler, the walkable square, rain, light, the Head-frame (descend), *Walk Saltmouth* on the title, `ll-town` save and dev isolation | Opus 5.5, high |
| 3 | The haul: `run.haul`, toll to tallow, the haul on the death and morning screens, credit to `ll-town` | Opus 5.5, medium |
| 4 | Build mode: paths, lights, fences, trees, headstones of past runs (`town.graves`, last 12, tap to copy the seed) | Opus 5.5, high |
| 5 | Keepers in town, Take the lamp (swap kit), chores | Sonnet 5.5, high |
| 6 | Workshops and the one town gift with its price | Opus 5.5, high |
| 7 | Rescued souls: the cage (new salt), the Drowned Oar, the Toothmonger | Opus 5.5, high |
| 8 | The three shrines and the tide-pools | Sonnet 5.5, high |
| 9 | The Keeper's Lodge (one room, floors, walls, furniture, the Grimoire shelf) | Opus 5.5, high |
| 10 | Release v19.0.0 | Sonnet 5.5, low |

Every step ships its tip, rules line and Grimoire entry (rule 23), a test, and a `docs/HISTORY.md` line.

### 0.7 Still open (for Criss)
1. ~~Pixel art or painted~~: pixel art (0.4).
2. The gift prices in 0.3: the shape is Claude's call; the numbers are for playtest.
3. Does the town ever show something Floors 1 to 5 can't (a sixth Keeper, a new relic)? This doc says no: the town only prepares and remembers.

---

*Gemini's draft follows. Section 0 overrides it where they disagree.*

---

# The Last Lamp — Expansion Update 3: Saltmouth Above (`expansionupdate3.md`)

> **Target Codebase:** [`Sirfloppywaffle/the-last-lamp`](https://github.com/Sirfloppywaffle/the-last-lamp) (`index.html`, post-v18.9.0 / [PR #113](https://github.com/Sirfloppywaffle/the-last-lamp/pull/113), [PR #114](https://github.com/Sirfloppywaffle/the-last-lamp/pull/114), [PR #115](https://github.com/Sirfloppywaffle/the-last-lamp/pull/115))  
> **Scope:** Additive surface-town hub expansion (**Saltmouth**). Zero destructive changes to Floors 1–5 combat, descent mini-floors, or existing save keys (`ll-save-v2`, `ll-meta`, `ll-codex`, `ll-maps`, `ll-tut`).  
> **Core Inspirations:** *Enter the Gungeon* (The Breach / rescuing NPCs / permanent meta-unlocks & pre-run blessings), *Cult of the Lamb* (sanctuary building, follower chores, dark devotion & rituals, Knucklebones), and *Animal Crossing* (free-roam grid placement, exterior & interior home customization, cozy-dread decoration, tending lanterns and tide-pools).  
> **Visual Direction:** Procedural crisp pixel-art surface mode (`imageSmoothingEnabled = false`) inspired by *Lovecraft's Untold Stories* (Gothic ironwork, rain-slicked cobblestones, occult libraries, glowing braziers), *Blood Forest* (top-down 2D exploration, muted earth & autumn-rust foliage against dark abyssal edges), and *Pixel Heroes* (chunky 16×24 / 24×24 sprite silhouettes with bold 1px dark outlines and glowing eyes).

---

## 1. Executive Summary & Architectural Philosophy

### 1.1 Why Descending Now Has a Purpose
In *The Last Lamp* (through v18.9.0), every descent begins at the Title / Roster screen and drops straight down the stair through **Floor 1 (The Cistern)**, **Floor 2 (The Ossuary)**, **Floor 3 (The Drowned Nave)**, **Floor 4 (The Throat)**, and **Floor 5 (The Abyssal Heart)**. Embers (`ll-meta`) unlock kits and flat Ember Hall passives, and deeds (`ROSTER.md`, [PR #60](https://github.com/Sirfloppywaffle/the-last-lamp/pull/60) / [PR #61](https://github.com/Sirfloppywaffle/the-last-lamp/pull/61)) unlock the five playable Keepers. However, **Saltmouth**—the drowned whaling and mining port spoken of in the Grimoire and Roster lore—has only existed in text.

**Expansion Update 3 ("Saltmouth Above")** turns Saltmouth into a playable, walkable **2D Top-Down Pixel-Art Hub** sitting directly at the mouth of the stair. Descending is no longer just chasing a high score or a single deed:
1. **Every run brings physical salvage back up the winch:** Whether you die on Floor 3 or slay the Primordial on Floor 5, the Winch hauls up your **Embers** alongside four surface building materials gathered during the descent (**Drift-Timber**, **Drowned Iron**, **Pale Tallow**, and **Abyssal Relics / Blueprints**).
2. **You rebuild Saltmouth from a rain-lashed ruin into a living port:** Using an *Animal Crossing* × *Cult of the Lamb* tile-placement editor, you clear rubble, lay cobblestone paths, hang street-lamps, erect workshops, and customize the **Keeper's Lodge** (your personal home).
3. **The Five Keepers and Rescued Townsfolk live and work in your town:** Inactive playable characters (**Ambrose Fenn**, **Jonah Tolland**, **The Nameless**, **Dr. Lucan Voss**, and **Agathe Vell**) wander Saltmouth, tend their respective district stations, and chat when approached. Lost souls rescued from the stair (**The Toothmonger**, **The Knucklebones Croupier**, **The Old Chandlers**, **The Bell-Founder**, and **The Harbourmaster**) open permanent shops and shrines in town.
4. **Your town shapes your next descent (without breaking Floor 1–5 balance):** A well-tended town grants **1 Pre-Run Preparation Slot** (a warm meal, a blessed wick, a pre-rolled Knucklebones wager, or a tuned starting ward variant) and generates passive salvage between runs, while strictly respecting `AGENTS.md` Pillar 2 (*Every gain has a price*) and keeping Seeded Runs / Trials fair.

### 1.2 Non-Destructive Integration Guarantee ("Additive Only")
Per Criss's core constraint (*"We're not changing anything to the game itself, just adding to it"*):
- **Zero changes to `F` (combat floor simulation) or `MAP_SYS` (descent mini-floors):** Once you step onto the **Winch Platform** at the center of Saltmouth and tap **Descend**, the game calls the existing `openKitPicker()` / `newRun()` flow. Floors 1–5 run on the exact same painted vector canvas, balance tables, wave decks, and patron rules.
- **Instant "Quick Descend" bypass:** Players who want to jump straight into a run from the Title Screen (or immediately tap **Descend Again** on the Death/Victory modal) can always do so in one tap. Entering Saltmouth is a button right beside Descend (`Walk Saltmouth`), or you can toggle `"Start in Saltmouth"` as your default launch view.
- **Single-File Vanilla Architecture Preserved:** All pixel-art sprites, tilesets, and building blueprints are generated procedurally via an offscreen pixel-art compiler (`compilePixelAtlas()`) using compact palette-indexed strings or integer bitmaps—zero external `.png` dependencies, zero build steps, preserving `index.html` portability.

---

## 2. Visual Direction & Procedural Pixel-Art Engine

### 2.1 Translating the 4 Reference Concepts into *The Last Lamp*'s Aesthetic
While the stair below is rendered in smooth, dark vector strokes and radial gradients (`paintBoard`), **Saltmouth Above** uses a dedicated **Crisp Pixel-Art Renderer** (`ctx.imageSmoothingEnabled = false`) that evokes classic gothic-eldritch 2D pixel RPGs while sharing *The Last Lamp*'s exact color tokens (`PAL`).

| Reference Image | Visual Takeaway | How It Shapes Saltmouth Above |
| :--- | :--- | :--- |
| **Ref 1: *Pixel Heroes*** (`13550.jpg`) | Chunky, expressive chibi-proportioned pixel sprites (`16×20` / `16×24` logical pixels), 1px black outer stroke, oversized hoods/helmets, distinct held tools (staffs, lanterns, shields), glowing eyes inside dark hoods. | **Character & NPC Sprites:** Ambrose (tall lantern pole + white wax crust on left shoulder), Jonah (harpoon toggle on shoulder + chest blubber lamp), The Nameless (deep void hood with peering Watcher eyes inside), Dr. Voss (smoked goggles + crackling blue collar electrodes), and Agathe (slate cloak + cracked bell + bone sound-ring aura) are drawn in this exact readable, chunky pixel style with 2-frame idle breathing and 4-frame walk cycles. |
| **Ref 2: *Blood Forest: Pixel Action RPG*** (`13552.jpg`) | Top-down 3/4 view over textured dark-earth ground tiles, scattered grass tufts, crooked dark trees with muted autumn-rust / blood-amber leaves, stone obelisks, and floating ember particles over black abyssal chasms. | **Town Terrain & Outer Perimeter:** Saltmouth sits on a cliff above the black sea and the Drowned Stair. The ground uses dithered dark peat/slate tiles (`#14181d`, `#1c2228`) with salt-grass tufts, dead brine-trees with rust-amber lichen (`#8a3b24`, `#b85d28`), weathered stone boundary pillars, and drifting ember/ash motes around the central Winch Pit. |
| **Ref 3: *Lovecraft's Untold Stories* — Interior** (`13554.jpg`) | Rich Victorian-occult interior: diamond-parquet wood floors, tall mahogany bookshelves lined with teal/amber tomes, green banker's lamps, brass candelabras, eldritch statues flanking a stone ritual circle in the floor. | **The Keeper's Lodge (Player Home) & Grimoire Archive:** Stepping inside your Lodge switches to an indoor pixel room with warm timber/parquet flooring, customizable wall bookshelves (which visually fill up as `ll-codex` / Grimoire entries are discovered!), green-glass study lamps, patron idol pedestals, and a central ritual rug. |
| **Ref 4: *Lovecraft's Untold Stories* — Exterior** (`13556.jpg`) | Rain-lashed dark cobblestone streets, wrought-iron fences, gothic stone mausoleums/crypts with pitched slate roofs, mossy tombstones, and warm flickering fire-braziers cutting through the diagonal rain. | **Saltmouth Architecture & Weather:** Buildings feature pitched slate roofs, mossy ashlar stone walls, and wrought-iron railings. A gentle diagonal pixel-rain and rolling sea-fog drift across the town; placing pixel Braziers, Street-Lamps, and Blubber Pots carves warm pools of amber light out of the rain. |

### 2.2 The Offscreen Pixel-Art Atlas (`PIXEL_ATLAS`)
To respect **Rule 17 (Performance on Mobile / No Hot Allocations)** and keep `index.html` self-contained:
- **Logical Grid Resolution:** Each town tile is **`16×16` logical pixels** rendered at integer scaling (`3×` or `4×` on mobile DPR, so each tile is `48×48` or `64×64` CSS px). Character sprites are **`16×24` logical pixels** (giving them height overlaps over tile top edges for authentic 3/4 RPG depth).
- **Palette-Indexed Template Strings:** Sprites and tiles are defined in code using compact 16-character ASCII rows mapped to a shared 24-color Lovecraftian Pixel Palette (`P_PAL`), compiled **once** at boot (or on first town entry) into a single offscreen `<canvas>` sprite sheet (`TOWN_SHEET`).
- **Per-Frame Cost:** Drawing the entire `18×18` town map, decorations, NPCs, rain, and lighting uses `ctx.drawImage(TOWN_SHEET, sx, sy, sw, sh, dx, dy, dw, dh)` with `imageSmoothingEnabled = false`—taking `< 0.8ms` per frame on a Galaxy Z Fold 7.

```javascript
/* Palette tokens for Saltmouth Pixel Atlas (matches index.html PAL) */
const P_PAL = {
  '.': null,        // Transparent
  '0': '#07090c',   // 1px outline / deep void
  '1': '#101419',   // Wet slate shadow
  '2': '#1a2028',   // Cobblestone mid
  '3': '#28303b',   // Cobblestone highlight / ashlar stone
  '4': '#3b4654',   // Weathered stone rim
  '5': '#1d1612',   // Dark rot-timber
  '6': '#33241b',   // Mahogany / wet plank
  '7': '#4f3829',   // Warm timber highlight
  '8': '#7a331e',   // Blood-forest rust leaf / brick dark
  '9': '#ad5428',   // Autumn-rust / copper highlight
  'a': '#d98a36',   // Tallow amber (mid flame / brass)
  'b': '#f5c26b',   // Bright wick gold
  'c': '#fff0c2',   // White-hot core / bone highlight
  'd': '#c9bfa8',   // Carved bone / parchment
  'e': '#7a8a74',   // Graveyard moss / brine lichen
  'f': '#3b6e5c',   // Banker's lamp green / deep sea-glass
  'g': '#5ab8a8',   // Eldritch verdigris / spirit glow
  'h': '#4a7bc7',   // Galvanic arc blue
  'i': '#9ecbff',   // Spark core
  'j': '#782238',   // Occultist crimson / madness ribbon
  'k': '#c93b5b',   // Watcher eye red / blood salt
};
```

### 2.3 Dynamic Pixel Lighting & Weather Layer
Even in town, **Light is the soul of the game**:
- **The Darkness Mask (`TOWN_LIGHT`):** An offscreen low-res lighting buffer (`288×288` px, 1:1 with logical town pixels) fills with `rgba(6, 8, 12, 0.78)` night gloom.
- **Carving Light:** The central **Great Winch Beacon**, every placed **Street-Lamp / Brazier / Corpse-Lantern**, building windows, and the player's own held **Hand-Lantern** punch stepped pixel-circles of warm amber/teal/galvanic light out of the darkness mask using `globalCompositeOperation = 'destination-out'` with dithered Bayer-matrix rings.
- **Town Prosperity Radiance ("The Beacon Tier"):** As you build and decorate Saltmouth, the town's **Total Light Rating (`townLight`)** rises. At higher tiers, the black fog retreats from the outer cliffs, revealing hidden tide-pools, dockside piers, and ancient ruins to build on.

---

## 3. Core Gameplay Loop: Blending the Three Inspirations

```
  ┌─────────────────────────────────────────────────────────────────────┐
  │                     SALTMOUTH ABOVE (Pixel Hub)                     │
  │  • Walk around in 3/4 pixel art (Thumb Joystick or Tap-to-Walk)     │
  │  • Construct & upgrade District Stations (CotL / Gungeon)           │
  │  • Place paths, lamps, fences & decorate Keeper's Lodge (AC)        │
  │  • Talk to the 5 Keepers, assign 1 Watchman Duty, pick 1 Blessing   │
  └───────────────────┬─────────────────────────────────────────────────┘
                      │ Step onto the Central Winch & Tap "Descend"
                      ▼
  ┌─────────────────────────────────────────────────────────────────────┐
  │                 THE STAIR BELOW (Existing Game Unchanged)           │
  │  • Floors 1–5 Tower Defense + Expansion 2 Descent Mini-Floors       │
  │  • Earn Embers + Salvage Crates (Timber, Iron, Tallow, Curios)      │
  │  • Discover NPCs in rare Landing Cages / Deeds to send up the Winch │
  └───────────────────┬─────────────────────────────────────────────────┘
                      │ Winch Hauls Up Your Spoils (Death or Victory)
                      ▼
  ┌─────────────────────────────────────────────────────────────────────┐
  │                  THE HAUL SUMMARY & TOWN RETURN                     │
  │  • Embers + Salvage tallied; assigned Town Chores complete          │
  │  • New blueprints, rescued residents, and trophies delivered        │
  └─────────────────────────────────────────────────────────────────────┘
```

### 3.1 *Enter the Gungeon* Pillar: The Breach, Rescued Specialists & Loadout Prep
- **Rescuing Lost Souls on the Stair:** On Floors 2, 3, and 4, the inter-floor Landing occasionally offers a **Locked Iron Cage** (or a special deed condition) holding a survivor of Saltmouth. Paying a small oil/essence toll or completing their mini-floor challenge sends them up the Winch Rope to Saltmouth permanently.
- **Living Character Roster:** Instead of picking your kit solely from a static 2D modal, all **unlocked Keepers** physically hang out in Saltmouth! Walking up to **Jonah Tolland** by the harpoon racks or **Agathe Vell** in the belfry lets you talk to them and tap **"Take the Lamp (Play as Jonah)"** to swap your active character immediately.
- **Trophy & Boss Pedestals:** Slaying Heralds (*The Last Keeper*, *The Tithe-taker*, *The Bellfather*) and Bosses (*The Keeper Below*, *The Primordial*) unlocks pixel-art monuments and mounted trophies in town.

### 3.2 *Cult of the Lamb* Pillar: Devotion, Follower Chores, Rituals & Knucklebones
- **Keeper Duties ("The Surface Watch"):** Before you descend, any unlocked Keepers you aren't currently playing can be assigned a **Watch Duty** in Saltmouth (1 duty completes per floor you clear down the stair):
  - *Tend the Try-Works (Jonah):* Renders +15 Tallow per floor cleared.
  - *Patrol the Breakwater (Ambrose):* Hauls up +12 Drift-Timber per floor cleared.
  - *Scribe the Ossuary Ledger (The Nameless):* Generates +2 Embers per floor cleared (max +6/run).
  - *Stoke the Galvanic Kiln (Dr. Voss):* Smelts +8 Drowned Iron per floor cleared.
  - *Toll the Fog-Bell (Agathe):* Calms the town's Dread Weather, guaranteeing a fair wind (+10% starting essence on Floor 1).
- **The Patron Shrines (Dark Devotion):** Build shrines to **The Drowned Mother**, **The Wrong Sun**, and **The Many-Mouthed** on the cliffside. Praying at a Patron's shrine before a run lets you **Attune** to that Patron (guaranteeing their first offering appears on Floor 1's landing) or **appease** them (reducing their starting Attention hazard).
- **The Knucklebones Tavern Table:** Walk up to the candle-lit slab in the Saltmouth Tavern to play Knucklebones against any of the Keepers or the hooded Croupier, wagering surface salvage or earning cosmetic tavern furniture.

### 3.3 *Animal Crossing* Pillar: Grid Customization, The Keeper's Lodge & Cozy-Dread Living
- **Edit Town Mode (`Build & Decorate`):** Tap the **Trowel & Lantern** icon in the top-right HUD to toggle a clean grid overlay on Saltmouth. Drag with your thumb to lay down **Cobblestone Roads**, **Boardwalks**, **Wrought-Iron Fences**, **Street-Lamps**, **Graveyard Headstones**, **Salt-Crystal Gardens**, and **Tide-Pool Traps**.
- **The Keeper's Lodge (Interior Home Customization):** Enter your personal stone cottage to decorate a `10×10` pixel-art room (modeled on Ref 3: *Lovecraft's Untold Stories*). Swap **Flooring** (Diamond Parquet, Sunken Flagstone, Whalebone Planks), **Wallpaper** (Mahogany Bookshelves, Drowned Tapestry, Copper Plate), and place **Furniture** (Banker's Desk, Phonograph, Specimen Jars, Patron Rugs, Cast-Iron Stove, Bound Horror Terrariums).
- **The Comfort Score & Rest Bonus:** Just like the Happy Home Academy, your Lodge calculates a **Sanctuary Comfort Score** based on lighting, furniture variety, and completed sets—granting subtle quality-of-life perks (like +1 reroll on the Floor 1 Merchant or a cosmetic custom lantern flame color in town).
- **Tending the Tide-Pools & Lichen Beds:** Small daily/per-run harvest spots along the rocky shore wash up shells, driftwood, and abyssal bottles containing lore scraps.

---

## 4. Surface Economy & Resource Architecture

To ensure **existing Embers (`ll-meta`) and in-run Essence/Oil (`run.ess`, `run.oil`) are never broken or inflated**, Expansion 3 introduces a clean **Surface Salvage Pouch** stored in `ll-town`.

### 4.1 The Four Surface Materials (Plus Embers)
You do **not** have to micromanage picking up wood or iron mid-wave during combat. Instead, salvage is awarded automatically at **Floor Clear**, during **Descent Mini-Floors** (e.g., *The Winch* and *The Cast* from Expansion 2), and when **dismantling/salvaging** at the end of a run:

| Material | Key | Icon | How It Is Earned on the Stair | Primary Use in Saltmouth |
| :--- | :--- | :--- | :--- | :--- |
| **Drift-Timber** | `timber` | 🪵 | +8 per Floor Cleared; +6 bonus on Floor 1 (Cistern) & Floor 3 (Nave); caught in *The Winch*. | Building structural frames, boardwalks, fences, tavern tables, and Lodge furniture. |
| **Drowned Iron** | `iron` | ⚓ | +5 per Floor Cleared; +8 per Herald slain; +6 bonus on Floor 2 (Ossuary) & Floor 4 (Throat). | Forging street-lamps, wrought-iron gates, workshop upgrades, and the Winch Gearbox. |
| **Pale Tallow** | `tallow` | 🕯️ | +1 per 20 unspent Essence burned by the 70% Stair Toll! *(Turns the painful 70% toll burn into surface candle wax!)* +5 per Boss slain. | Lighting town braziers, fueling the Great Beacon, crafting Pre-Run Candle Blessings. |
| **Abyssal Curios** | `curios` | 🏺 | +1 per Boss slain; +1 first time clearing each Trial or discovering a new Grimoire entry. | Unlocking rare occult decorations, Patron Shrines, Phonograph tracks, and Trophy Plinths. |
| **Embers** *(Existing)* | `embers` | 🔥 | Unchanged (`ll-meta.embers`). Earned from floor clears & boss kills on unseeded runs. | Remains the currency for Ember Hall upgrades; can also be traded at the Toothmonger's Stall for missing building materials. |

> **Design Highlight — "The Toll Renders Tallow":** In the base game, 70% of unspent liquid essence burns away when descending a stair. With Expansion 3, that burned essence isn't just deleted—**every 20 essence consumed by the stair's dark toll condenses into 1 Pale Tallow hauled up the winch**. It gives the stair toll a tangible physical connection to your town without changing in-run combat economy by a single point!

---

## 5. Town Map Layout & District Blueprint (`24×24` Tile Grid)

Saltmouth is a `24×24` tile grid (`384×384` logical pixels). The camera centers smoothly on the player, showing roughly `11×15` tiles at a time on a folded Galaxy Z Fold 7 portrait screen (`412×860` CSS px) or `16×9` tiles in landscape (`#app.side`), so pixels are large, crisp, and effortless to tap with a thumb.

### 5.1 Five Connected Zones of Saltmouth
```
      [ N: THE CLIFFSIDE CEMETERY & BELFRY (Agathe & The Nameless) ]
               (Mausoleums, Patron Shrines, Bell Tower)
                                  │
 [ W: THE WHALER'S QUAY ] ────────┼──────── [ E: THE GALVANIC FOUNDRY ]
  (Jonah's Try-Works, Docks,       │          (Dr. Voss's Lab, Arc Kiln,
   Tide-Pools, Toothmonger)       │           Street-Lamp Smithy)
                                  ▼
                 ┌─────────────────────────────────┐
                 │    CENTRAL SALTMOUTH SQUARE     │
                 │  • The Great Winch & Stair Pit  │
                 │  • Ambrose's Watch-Post         │
                 │  • The Keeper's Lodge (Home)    │
                 │  • The Drowned Oar (Bones Den)  │
                 └─────────────────────────────────┘
                                  │
                 [ S: THE SHATTERED BREAKWATER ]
                  (Sea Wall, Foghorn, Vista Overlook)
```

1. **Central Saltmouth Square (Unlocked from Day 1):**
   - **The Great Winch & Stair Mouth `[12, 12]`:** A massive pixel-art iron crane and stone shaft yawning into the dark, lit by four corner braziers. Stepping onto the grate brings up the context prompt: **`Descend the Stair`** (or **`Seeded Descent` / `Trials`**).
   - **The Keeper's Lodge `[8, 10]`:** Your personal 2-story stone house with warm glowing windows. Walk through the front door to enter the indoor `10×10` room editor.
   - **The Notice Post & Salvage Chest `[15, 11]`:** Shows your town stats, active Keeper Chores, and any unclaimed haul from your last descent.
2. **West — The Whaler's Quay:**
   - Weathered timber docks jutting over black water, hanging whale ribs, Jonah Tolland's **Try-Works Cauldron**, the **Toothmonger's Curio Stall**, and 3 harvestable **Tide-Pools**.
3. **East — The Galvanic Foundry & Chandler's Row:**
   - Brick chimneys, copper lightning rods, Dr. Voss's **Galvanic Workshop**, Ambrose's **Tallow Chandlery**, and the **Ember Brazier** (which opens the existing Ember Hall upgrades in-world!).
4. **North — The Cliffside Cemetery & Belfry (Ref 4 Aesthetic):**
   - Wrought-iron fences, mossy gothic crypts, Agathe's **Cracked Belfry**, The Nameless's **Ossuary Menagerie** (where bound horror types you've recorded in `ll-codex` can be viewed in containment circles), and the **Three Patron Altars**.
5. **South — The Shattered Breakwater:**
   - Rain-swept sea wall where waves crash in white pixel foam; home to the **Harbourmaster's Lighthouse** (seed & map-variant scout).

---

## 6. Buildings, Stations & Functional Unlocks

Every major structure in Saltmouth has **3 visual pixel-art tiers** (*Ruined $\to$ Restored $\to$ Masterwork*) and provides a concrete reason to descend.

### 6.1 Core Town Buildings Table

| Building Name | Footprint | Associated NPC / Keeper | Build Cost (Tier 1 $\to$ Tier 2 $\to$ Tier 3) | Town Function & Pre-Run Benefit |
| :--- | :--- | :--- | :--- | :--- |
| **1. The Keeper's Lodge** *(Player Home)* | `4×3` tiles | You (The Active Keeper) | **T1:** Free (Ruined Roof)<br>**T2:** 30 Timber, 15 Iron<br>**T3:** 60 Timber, 30 Iron, 25 Tallow | **T1:** `8×8` indoor room.<br>**T2:** Expands indoor grid to `10×10`; unlocks the **Hearth Stove** (1 Pre-Run Meal/Blessing slot).<br>**T3:** Expands to `12×12` + upstairs study; unlocks **2nd Chores Slot** for inactive Keepers. |
| **2. The Ember Brazier** *(The Ember Hall)* | `2×2` tiles | **Ambrose Fenn** | **T1:** Built at start<br>**T2:** 20 Iron, 15 Tallow<br>**T3:** 40 Iron, 35 Tallow, 2 Curios | **T1:** Opens the classic Ember Hall (`ll-meta` upgrades) in-world.<br>**T2 (*The Chandler's Dip*):** Allows spending 10 Tallow before a run to coat your wicks (**First Candle placed on Floor 1 costs 0 Essence**).<br>**T3:** Unlocks custom flame tinting in town + +10% Tallow rendered from the Stair Toll. |
| **3. The Drowned Oar** *(Knucklebones Den)* | `4×3` tiles | **The Croupier** *(Unlocked after playing Knucklebones once on the stair)* | **T1:** 25 Timber, 10 Tallow<br>**T2:** 45 Timber, 20 Iron, 20 Tallow<br>**T3:** 70 Timber, 40 Tallow, 3 Curios | **T1:** Play Knucklebones anytime in town; wager Timber/Tallow.<br>**T2 (*The Loaded Bone*):** Once before each run, roll a single die at the bar: **4–6** grants **+15 starting Essence** on Floor 1; **1–3** grants **+5 Essence** (never penalizes oil/madness).<br>**T3:** Unlocks cosmetic bone-dice styles (Ivory, Whale-Tooth, Cursed Obsidian, Brass) used on the stair! |
| **4. The Try-Works & Quay** | `3×3` tiles | **Jonah Tolland** | **T1:** 30 Timber, 20 Iron<br>**T2:** 50 Timber, 35 Iron, 15 Tallow<br>**T3:** 80 Timber, 50 Iron, 3 Curios | **T1:** Enables Jonah's Tallow-rendering chore; unlocks dockside Tide-Pools.<br>**T2 (*Whaler's Ration*):** Pre-run blessing option: **Restore +2 extra Oil at every Rest Site** during the next descent.<br>**T3 (*Harpoon Rack*):** Your first Harpoon / Spear / Pylon / Chime built on Floor 1 starts with **50% off its first Tier-1 upgrade**. |
| **5. The Galvanic Smithy** | `3×3` tiles | **Dr. Lucan Voss** | **T1:** 20 Timber, 30 Iron<br>**T2:** 40 Timber, 55 Iron, 20 Tallow<br>**T3:** 60 Timber, 90 Iron, 4 Curios | **T1:** Enables Voss's Iron-smelting chore; crafts iron town lamps and fences.<br>**T2 (*Capacitor Tune*):** Pre-run blessing option: **Start Floor 1 with +1 extra Rite Charge** (integrates with Expansion 2's Rite Charges from [PR #103](https://github.com/Sirfloppywaffle/the-last-lamp/pull/103)).<br>**T3 (*The Scrap Chute*):** Dismantling/selling a ward during a run refunds **80% essence** (up from 70%) on Floor 1 and Floor 2. |
| **6. The Cracked Belfry** | `2×3` tiles | **Agathe Vell** | **T1:** 25 Timber, 25 Iron<br>**T2:** 45 Timber, 45 Iron, 2 Curios<br>**T3:** 70 Timber, 70 Iron, 5 Curios | **T1:** Enables Agathe's Fog-Bell chore; unlocks town soundscape chime selector.<br>**T2 (*Echoing Iron*):** Pre-run blessing option: **Floor 1 Wave Preview shows the exact wave deck draw for Waves 1 & 2** at floor start.<br>**T3:** Ringing the Great Bell in town shifts the weather (Clear Starry Night, Heavy Rain, Rolling Sea-Fog, Blood-Moon). |
| **7. The Ossuary Menagerie & Archive** | `4×3` tiles | **The Nameless** | **T1:** 30 Timber, 15 Tallow, 1 Curio<br>**T2:** 50 Timber, 30 Iron, 25 Tallow, 2 Curios<br>**T3:** 80 Timber, 50 Tallow, 5 Curios | **T1:** Physical library for **The Grimoire** (`openBook()`) + displays bound horrors you've discovered (`ll-codex.bound`) in pixel containment pens.<br>**T2 (*Familiar's Tether*):** Pre-run blessing option: **Start your descent with 1 Bound Skitterling or Watcher already in your Roster** (still costs normal essence/madness to field).<br>**T3:** Complete Grimoire statue garden; unlocks The Nameless's secret lore entries. |
| **8. The Toothmonger's Stall** | `2×2` tiles | **The Toothmonger** *(Rescued on Floor 2/3)* | **T1:** 20 Timber, 10 Tallow<br>**T2:** 35 Timber, 20 Iron, 20 Tallow | **T1:** Barter excess Timber, Iron, Tallow, and Embers at fair fixed rates.<br>**T2 (*The Pawned Relic*):** Pay 25 Tallow to **banish 1 non-cursed Relic** from the stair's relic pool for your next descent (tightening build consistency, *Gungeon*-style!). |
| **9. The Three Patron Shrines** | `2×2` each | *Drowned Mother*, *Wrong Sun*, *Many-Mouthed* | **25 Iron, 25 Tallow, 2 Curios** per Shrine | Light a black candle at **one** Shrine before descending: guarantees that Patron's offering is offered on **Floor 1's Landing**, OR snuff the candle to **banish** that Patron from reaching out on Floors 1–2. |

### 6.2 Guarding Game Balance ("The 1-Blessing Rule")
A classic trap in town-builder roguelikes is letting town upgrades stack until the main game becomes trivial. To protect Criss's tuned difficulty:
1. **Strict Single Pre-Run Blessing Slot (`activeBlessing`):** You can build every workshop in Saltmouth, but your Keeper can only carry **ONE** active Town Blessing down the stair per run (chosen by interacting with the corresponding building before stepping onto the Winch).
2. **Trial & Seeded Run Purity:**
   - In **Trials** ([PR #66](https://github.com/Sirfloppywaffle/the-last-lamp/pull/66), [PR #70](https://github.com/Sirfloppywaffle/the-last-lamp/pull/70)) and **Seeded Runs** ([PR #97](https://github.com/Sirfloppywaffle/the-last-lamp/pull/97)), Town Blessings are automatically **disabled** (or locked to cosmetic-only) so every seed and trial remains 100% deterministic and fair.

---

## 7. *Animal Crossing* Customization: Decorations, Paths & Furniture Catalog

Players can craft and place decorations anywhere on the `24×24` exterior grid (outside of the fixed `4×4` Winch Pit) and inside their `10×10` / `12×12` **Keeper's Lodge**.

### 7.1 Exterior Town Decorations (`TOWN_DECOS`)
| Category | Item Name | Size | Cost | Visual & Interactive Detail |
| :--- | :--- | :--- | :--- | :--- |
| **Pathways** | *Wet Cobblestone* | `1×1` | 2 Iron | Dark rain-slicked stones (Ref 4); +10% walk speed in town. |
| **Pathways** | *Whaler's Boardwalk* | `1×1` | 2 Timber | Weathered oak planks over mud; creaks softly underfoot. |
| **Pathways** | *Consecrated Salt Path* | `1×1` | 3 Tallow | White salt-crusted gravel that glows faintly in the dark. |
| **Lighting** | *Iron Street-Lamp* | `1×1` | 6 Iron, 4 Tallow | Casts a 3.5-tile warm tallow circle; moths flutter around the glass. |
| **Lighting** | *Abyssal Brazier* | `1×1` | 8 Iron, 6 Tallow | Casts a 4.0-tile flickering fire ring (Ref 4); crackles when walked past. |
| **Lighting** | *Galvanic Arc Post* | `1×1` | 12 Iron | Casts a 3.0-tile cold blue electric glow; hums and snaps when tapped. |
| **Lighting** | *Corpse-Lantern Plinth* | `1×1` | 5 Iron, 8 Tallow | A skull-topped stone post burning with pale green spirit fire. |
| **Fencing & Flora** | *Wrought-Iron Fence* | `1×1` | 3 Iron | Auto-tiles horizontally and vertically with spiked gothic finials (Ref 4). |
| **Fencing & Flora** | *Blood-Lichen Tree* | `2×2` | 8 Timber, 4 Tallow | Crooked dark tree with deep crimson-amber canopy (Ref 2); drops rust leaves. |
| **Fencing & Flora** | *Mossy Headstone / CryptCross* | `1×1` | 5 Iron | Carved stone cross (Ref 4); tapping it reads the epitaph of one of your past fallen runs! |
| **Monuments** | *Whalebone Arch* | `2×1` | 15 Timber, 1 Curio | Giant bleached leviathan jawbones arching over a path; player walks underneath. |
| **Monuments** | *Anubis / Eldritch Sentinel* | `1×2` | 20 Iron, 2 Curios | Tall black-and-gold guardian statue (Ref 3) whose eyes track the player's position. |
| **Monuments** | *Fountain of the Drowned* | `2×2` | 30 Iron, 2 Curios | Weeping stone basin with animated cyan/brine water cascades (Ref 3 bottom-right). |

> **Delight Detail — "Graveyard of Past Runs":** Every time you place a *Mossy Headstone* (`1×1`) in the Cemetery, it binds to an entry from a new `ll-graves` array (storing the last 12 runs where you died: e.g., *"Here lies Jonah Tolland — Floor 4, Wave 3 — Taken by the Keeper Below on The Brine-Hollow Stair"*). Tapping a headstone in town lets you remember your fallen runs and even copy that run's Seed!

### 7.2 Interior Keeper's Lodge Catalog (`LODGE_ITEMS` — Ref 3 Aesthetic)
Inside the Lodge, players can customize:
- **Flooring Styles:** *Rotted Ship-Planks* (default), *Victorian Diamond Parquet* (Ref 3, 20 Timber), *Cistern Flagstones* (20 Iron), *Crimson Sanctum Carpet* (25 Tallow, 1 Curio).
- **Wall Styles:** *Damp Stone* (default), *Mahogany Occult Library* (Ref 3, 30 Timber — visually fills with colorful pixel books as `ll-codex` completion % rises!), * Brass-Ribbed Bulkhead* (30 Iron), *Many-Mouthed Tapestry* (2 Curios).
- **Placeable Interior Furniture:**
  - *Keeper's Study Desk & Banker's Lamp* (`2×1`, Ref 3 emerald glass lamp — tap to toggle light or read `DESIGN.md` / Lore).
  - *Occult Ritual Rug* (`3×3` center floor medallion from Ref 3).
  - *Cast-Iron Ship Stove* (`1×1` — warms the room, selects Meal Blessing).
  - *Wax-Cylinder Phonograph* (`1×1` — lets Criss toggle between the Town Rain Theme, Descent Drone, or Boss Heartbeat).
  - *Specimen Terrarium* (`1×1` — displays a mini pixel pet version of any Bound Horror you've captured!).
  - *Armchair by the Hearth* (`1×1` — your Keeper can sit down and rest while the rain patters outside).

---

## 8. Mobile Touch UX & Galaxy Z Fold 7 Ergonomics

All town interactions are engineered around `AGENTS.md` Section 6 & Section 9 (**Galaxy Z Fold 7** folded portrait `412×860` CSS px and unfolded/landscape `#app.side`):

1. **Dual-Mode Thumb Movement (Zero Clutter):**
   - **Tap-to-Walk (Default One-Handed Mode):** Tap any walkable tile in Saltmouth; a subtle pixel target ring pulses on the ground and your Keeper smoothly walks there (using simple $24\times 24$ BFS pathfinding—evaluated **only** on tap, zero per-frame allocation). Tapping an NPC or Building walks you to its entrance and triggers its interaction automatically.
   - **Floating Thumb-Stick (Hold & Drag):** Press and hold your thumb anywhere on the lower half of the canvas for `>120ms` and drag in any direction for direct 8-directional arcade movement (like *Enter the Gungeon* / *Blood Forest* Ref 2, but invisible until held so no ugly virtual buttons block the pixel art!).
2. **Context Action Pill (`#townAct`):**
   - When standing within `1.5` tiles of an interactable door, NPC, or the Central Winch, a single crisp bottom action pill appears above the command bar (e.g., **`[ Talk to Jonah Tolland ]`**, **`[ Enter Keeper's Lodge ]`**, **`[ Descend the Stair ]`**).
3. **One-Thumb Build & Edit Mode:**
   - Tapping **`Build`** replaces the bottom bar with a horizontal scrollable tray of categories (*Buildings*, *Paths*, *Lights*, *Decor*, *Move/Store*).
   - Tapping a blueprint shows a green/red `16×16` pixel footprint on the map. Tap once to place, or drag across tiles to paint paths/fences continuously.
   - Moving or storing any placed decoration refunds **100% of its materials** (encouraging free experimentation, *Animal Crossing*-style).
4. **No Stage Jump (Rule 2) & Click Dismissal (Rule 5):**
   - Saltmouth renders inside the exact same `#board` `<canvas>` element used by the main game (or a stacked `#townCanvas` sharing `#stage`), keeping the top bar and bottom bar anchored without a single pixel of layout shift. All town modals use `click` events with the 320ms ghost-tap guard.

---

## 9. Save State, Storage Isolation & Developer Mode

### 9.1 Dedicated Storage Key (`ll-town`)
To guarantee **Rule 15 (Saves: never break)**, Saltmouth stores all persistent data in its own isolated `localStorage` key (`ll-town`), leaving `ll-save-v2` (in-run state) and `ll-meta` (Embers & Ember Hall) untouched:

```javascript
const TOWN_KEY = 'll-town';

function defaultTown() {
  return {
    v: 1,
    visited: false,
    startInTown: true, // Toggleable in Settings: launch into Saltmouth vs Title
    res: { timber: 25, iron: 15, tallow: 10, curios: 0 }, // Starter salvage so player can build right away!
    buildings: {
      lodge: 1,      // Tier 1 ruined cottage unlocked at start
      brazier: 1,    // Tier 1 Ember Brazier unlocked at start
      oar: 0,        // Knucklebones Tavern
      quay: 0,       // Whaler's Quay
      smithy: 0,     // Galvanic Smithy
      belfry: 0,     // Cracked Belfry
      menagerie: 0,  // Ossuary Menagerie & Archive
      stall: 0,      // Toothmonger's Stall
      shrine_mother: 0,
      shrine_sun: 0,
      shrine_mouths: 0
    },
    npcsRescued: [], // ['toothmonger', 'croupier', 'chandler', 'harbourmaster']
    chores: {},      // { whaler: 'tallow', galvanist: 'iron' }
    blessing: null,  // 'wick' | 'ration' | 'charge' | 'echo' | 'tether' | 'dice'
    attunedPatron: null, // 'mother' | 'sun' | 'mouths' | null
    banishedRelic: null, // relic key or null
    weather: 'rain', // 'rain' | 'fog' | 'clear' | 'ember'
    px: 12, py: 14,  // Player tile position in town (just south of the Winch)
    decos: [         // Placed exterior paths, lamps, fences, headstones: { id, c, r, meta }
      { id: 'lamp_iron', c: 10, r: 12 },
      { id: 'lamp_iron', c: 14, r: 12 },
      { id: 'path_cobble', c: 12, r: 13 },
      { id: 'path_cobble', c: 12, r: 14 }
    ],
    lodge: {
      floor: 'plank',
      wall: 'stone',
      items: [
        { id: 'desk_banker', c: 2, r: 2 },
        { id: 'stove_iron', c: 7, r: 2 },
        { id: 'rug_ritual', c: 4, r: 4 }
      ]
    },
    graves: []       // Up to 12 fallen run epitaphs: { kit, floor, wave, foe, seed, date }
  };
}
```

### 9.2 Rule 24 Compliance (Developer Mode Isolation)
- When `devOn === true`, `townLoad()` returns an in-memory clone where all buildings can be freely upgraded, +500 of every material can be granted via a new `DEV_ACTS.townmax()` button, and all NPCs are present—**without ever writing to `store.set('ll-town', ...)`**.

---

## 10. Teaching, Voice & Grimoire Integration (Rules 21 & 23)

### 10.1 Voice & Tone (Rule 21)
Saltmouth is cozy only by contrast with the pit below. Its prose stays terse, salt-stained, and concrete:
- **Entering Saltmouth for the first time:** *"The rain has not stopped since the lamps went out. Saltmouth clings to the cliff above the shaft—wet slate, cold iron, and the winch waiting in the square."*
- **Ambrose Fenn (idle bark):** *"Keep the tallow dry. Water in the wax makes a sputtering wick, and a sputtering wick gets you eaten."*
- **Jonah Tolland (idle bark):** *"The sea took the lower wharves. Whatever’s down that stair smells worse than whale-belly."*
- **The Nameless (idle bark):** *"They press their eyes against the inside of the cloth. Build the pens, and I will let them look at the rain."*
- **Dr. Lucan Voss (idle bark):** *"Candles are superstition. Give me thirty ingots of drowned iron and I'll wire this whole cliff."*
- **Agathe Vell (idle bark):** *"Listen to the rain on the slate. Every roof has its own note."*

### 10.2 First-Time Tips (`TIPS`) & Rules (`showRules()`)
- **`TIPS.town_welcome`:** Fires on first entry to Saltmouth: *"Saltmouth Above. Tap any stone to walk, or hold and drag to steer. Whatever timber, iron, and tallow you haul up from the stair builds the port around the winch."*
- **`TIPS.town_blessing`:** Fires when restoring your first Tier-2 workshop: *"A restored station prepares you for the dark. You may carry one Town Blessing down the stair on each unseeded descent."*
- **`showRules()` addition:** Adds a concise `<li><b>Saltmouth Above.</b> ...</li>` bullet explaining surface salvage, the 70% toll rendering into Pale Tallow, Keeper chores, and the 1-Blessing rule.

---

## 11. Step-by-Step Implementation Plan for Claude (10 PR Milestones)

Just like **Expansion 2** ([PR #96](https://github.com/Sirfloppywaffle/the-last-lamp/pull/96) $\to$ [PR #114](https://github.com/Sirfloppywaffle/the-last-lamp/pull/114)), **Expansion 3** is broken into small, self-contained, testable PR steps so each piece can be playtested on Criss's Galaxy Z Fold 7 via GitHub Pages preview links before moving to the next:

### Step 1: Design Doc PR (`expansion/EXPANSION3_TOWN.md`)
- Commit this design specification as `expansion/EXPANSION3_TOWN.md` and link it from `AGENTS.md` and `docs/DESIGN.md`.

### Step 2: The Pixel-Art Compiler & Walkable Saltmouth Square
- Add `P_PAL`, `compilePixelAtlas()`, and the `24×24` tile renderer (`paintTown()`) with `imageSmoothingEnabled = false`, diagonal pixel rain, and the dithered Bayer-matrix lighting mask (`TOWN_LIGHT`).
- Add the player pixel sprite (switching dynamically to match your selected Keeper: Ambrose, Jonah, Nameless, Voss, or Agathe) with tap-to-walk BFS and hold-to-steer thumbstick.
- Add the **`Walk Saltmouth`** button on the Title Screen and the Central Winch (`Descend the Stair`) in the town square.
- Add `tests/t/town.test.js` verifying `ll-town` save/load, `devOn` isolation, and zero layout shift across all 14 device viewports (`devices.test.js`).

### Step 3: The Haul — Surface Materials & Toll-to-Tallow Conversion
- Wire `timber`, `iron`, `tallow`, and `curios` drops into `floorCleared()`, `killFoe()` (Heralds/Bosses), and the Death/Victory summary card (`showHaul()`).
- Wire the **70% Stair Toll $\to$ Pale Tallow** conversion (`Math.floor(burnedEss / 20)` tallow hauled up the winch) so every descent feeds town progression.

### Step 4: Town Build Mode — Paths, Street-Lamps & Exterior Decorations
- Implement the **`Build & Decorate`** trowel toggle in Saltmouth.
- Add `TOWN_DECOS` (Wet Cobblestone, Whaler's Boardwalk, Salt Path, Iron Street-Lamp, Abyssal Brazier, Galvanic Arc Post, Wrought-Iron Fence, Blood-Lichen Tree, Mossy Headstone, Whalebone Arch, Eldritch Sentinel, Drowned Fountain).
- Wire `ll-graves` so placed Headstones display the epitaphs and seeds of past fallen runs.

### Step 5: Living Roster in Town & Keeper Chores ("The Surface Watch")
- Spawn the other 4 unlocked Keepers around Saltmouth Square and their respective districts with pixel sprites, idle animations, dialogue barks, and **"Swap Keeper"** interaction.
- Implement **Keeper Chores** (`town.chores`) so assigning an inactive Keeper before descending yields bonus Timber, Iron, Tallow, or Embers for each floor cleared.

### Step 6: The Keeper's Lodge (Interior Room & Furniture Editor)
- Implement stepping through the Lodge door into the indoor `10×10` pixel-art room (Ref 3 *Lovecraft's Untold Stories* aesthetic).
- Add indoor Wallpaper/Flooring swaps, the dynamic **Mahogany Grimoire Bookshelf** (fills with pixel tomes based on `ll-codex`), Specimen Terrariums for bound horrors, and the Phonograph.

### Step 7: The Workshops & The 1-Blessing Prep System
- Implement restoring and upgrading **The Ember Brazier**, **The Try-Works & Quay** (Jonah), **The Galvanic Smithy** (Voss), **The Cracked Belfry** (Agathe), and **The Ossuary Menagerie** (Nameless).
- Wire the **Single Active Town Blessing (`town.blessing`)** into `newRun()` (automatically bypassed on Seeded Runs and Trials) and display the active blessing chip in `#relBar`.

### Step 8: Rescued Specialists — The Drowned Oar (Knucklebones Den) & Toothmonger's Stall
- Add the **Rescued Survivor Cage** event on Floor 2–4 Landings (or automatic unlock upon meeting them on the stair) to bring **The Croupier** and **The Toothmonger** up to Saltmouth.
- Open **The Drowned Oar** in town (play Knucklebones for salvage, roll the pre-run *Loaded Bone*, unlock cosmetic dice sets) and **The Toothmonger's Stall** (material barter + *The Pawned Relic* banishing).

### Step 9: The Cliffside Patron Shrines & Tide-Pool Harvesting
- Add the three **Patron Shrines** (*Drowned Mother*, *Wrong Sun*, *Many-Mouthed*) in the north cemetery, allowing pre-run Patron Attunement or Floors 1–2 Banishment.
- Add the 3 dockside **Tide-Pools** along the Whaler's Quay that refill after every descent with salvage and lore bottles.

### Step 10: Polish, Coaching Tips, Grimoire Entries & Release v19.0.0 ("Saltmouth Above")
- Complete Rule 23 checklist (`TIPS`, `showRules()`, `LORE`, `tests/gen-design.js` $\to$ `docs/DESIGN.md`, `docs/HISTORY.md`), run full Playwright suite (`npm test`), and stamp **v19.0.0**.

---

## 12. Reference Code Scaffolding for Claude (`index.html` Anchors)

Below is the drop-in architectural skeleton showing how `TOWN` hooks cleanly into `index.html` without mutating `F` or `MAP_SYS`:

```javascript
/* ═══════════════════════════════════════════════════════════════════════════
 * SALTMOUTH ABOVE — EXPANSION 3 PIXEL HUB (Additive Module)
 * ═══════════════════════════════════════════════════════════════════════════ */
const TOWN_W = 24, TOWN_H = 24, TILE_PX = 16;
let TOWN = null;       // Active loaded ll-town state
let TOWN_MODE = false; // true when player is walking around Saltmouth
let TOWN_EDIT = null;  // null | { cat, selId, mode: 'place'|'remove' }
let TOWN_INDOOR = false; // true when inside the Keeper's Lodge (Ref 3 view)
let TOWN_ATLAS = null; // Offscreen compiled pixel spritesheet canvas

function enterTown() {
  if (!TOWN) TOWN = loadTown();
  if (!TOWN_ATLAS) TOWN_ATLAS = compilePixelAtlas();
  TOWN_MODE = true;
  TOWN_INDOOR = false;
  closeModal();
  syncTownHUD();
  requestAnimationFrame(townFrame);
}

function exitTownToDescent(opts = {}) {
  TOWN_MODE = false;
  TOWN_EDIT = null;
  // Transition directly into existing kit picker or newRun() without touching Floor 1-5 code
  if (opts.pickKit) openKitPicker();
  else newRun(lastKit || 'lamplighter', opts);
}

/* Hook in floorCleared() & gameOver() / victory() to credit surface salvage */
function creditDescentHaul(floorsCleared, tollBurnedEss, heraldsKilled, bossesKilled) {
  if (devOn) return; // Rule 24: Developer mode never saves to ll-town
  const t = loadTown();
  const timberGain = floorsCleared * 8;
  const ironGain   = floorsCleared * 5 + heraldsKilled * 8;
  const tallowGain = Math.floor(tollBurnedEss / 20) + bossesKilled * 5;
  const curioGain  = bossesKilled;
  t.res.timber += timberGain;
  t.res.iron   += ironGain;
  t.res.tallow += tallowGain;
  t.res.curios += curioGain;
  saveTown(t);
  return { timberGain, ironGain, tallowGain, curioGain };
}
```
