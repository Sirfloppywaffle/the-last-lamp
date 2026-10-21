# Relic Overhaul Design Specification (#62, Item 7h — `expansion/BRAINSTORM.md` §13.4)

This design returns all eleven resting relics behind `RELICS_RESTING` to the active pool by replacing flat stat multipliers with rules that alter board placement, resource timing, and wave tactics. It also introduces kit-aware pool filtering so no kit is offered a dead relic unless it already carries the required ward or rite (including gift wards).

## 1. Executive Summary Table (All 11 Overhauled Relics)

Slots 1 through 11 preserve their exact table positions and internal keys so saved runs carrying any of these relics continue to function without migration errors.

| Slot | Relic | Pack | Type | Kit Filter (`needs`) | Old Effect (Resting) | New Rule (Action / Board Change) |
|---|---|---|---|---|---|---|
| 1 | **Tallow of Saints** | Base | Plain | All 5 kits | +0.8 light. | The outermost **1.0 tile** of the main lamp's light is a consecrated **bright spot** ring: wards in this rim fire **35% faster** and cast **+0.5 light**, while inner-core wards get no bonus. |
| 2 | **Oil Reserve** | Base | Plain | All 5 kits | Refill 6 oil; +4 capacity. | Refill **4 oil** on pickup and uncap lamp oil; whenever oil sits above base capacity, the lamp enters **Flood Burn**, draining **0.4 oil/s** to ignite the path under the lead creature in light for **14 damage/s** over **3s**. |
| 3 | **Whetted Barbs** | Base | Plain | Impaling ward (`Brine Harpoon`, `Tether Harpoon`, `Bone Spear`, `Clapper Harpoon`, `Whaling Gun`) | Brine Harpoons deal +30% damage. | Impaling shots lodge up to **3 barbs** in surviving creatures (**12% slow** per barb); when a barbed creature dies or hits a trap, all lodged barbs rip free and fire into the nearest creature within **2.5 tiles** for **100% shot damage**. |
| 4 | **Salt Flats** | Base | Plain | `Salt Circle` or `Pillar of Salt` | Salt Circles cost 10, refills 5, last 2x. | Two `Salt Circles` placed within **2.5 tiles** fuse the path between them into a shared **Salt Bridge**; refilling either circle splits **+50% duration** to both, and Salt Circles can be placed on **water tiles**. |
| 5 | **Quiet Mind** | Base | Plain | All 5 kits | Madness thresholds sit 3 higher. | Going **10s** during a wave without placing a ward, refilling, or casting a rite grants **Stillness**: madness drains by **1 per 5s** (shedding **1 dread**), and your next ward or rite costs **0 madness** and **30% less essence**. |
| 6 | **Sealing Wax** | Base | **Cursed** | All 5 kits | Bound horrors cost 1 less madness (min 1). | Your closest ward to the stair (plus **1 ward per bound horror**) is **Wax-Sealed**: it never expires, lowers madness by **1**, and marks hit targets to take **+25% damage** for **4s**, but fires **30% slower** and can never be sold or replaced. |
| 7 | **Bounty of the Deep** | Base | **Cursed** | All 5 kits | Creatures leave 30% more essence. | Creatures killed in the **back half of the lane** (near the stair) or on **water tiles** drop **+60% essence** and recharge **15% Rite cooldown**; creatures killed in the **front third** (near spawn) drop **20% less essence**. |
| 8 | **Ossuary Key** | Base | Plain | All 5 kits | Merchants charge 30% less. | You may buy from merchants on **Bone Credit** down to **-25 essence**; while in debt (or for **2 waves** after any merchant purchase), kills within **2.5 tiles** of the stair drop **+5 essence** and restore **1 oil** at wave end. |
| 9 | **Leech Jar** | Deep | Plain | All 5 kits | Every 30 kills restore 1 oil. | Only creatures killed while **slowed, tethered, snared, or in water** feed the jar (**1 leech** per kill, max **8**); at **8 leeches**, the jar bursts to restore **2 oil** and bleed all creatures in lamp light for **15 damage** and **30% slow** over **3s**. |
| 10 | **Thunder Marrow** | Deep | Plain | Stun/Shock ward (`Bone Chime`, `the Tocsin`, `Lightning Rod`, `Pylon`, `Galvanic Coil`, `Hook Trap`) | Bone Chime stuns last 0.4s longer. | When one of your wards stuns, shocks, or snares a creature, a **Thunder Arc** jumps to your nearest other ward within **2.5 tiles**, making it fire **immediately for free** with **+25% damage** for **3s**. |
| 11 | **Witch Salt** | Deep | **Cursed** | All 5 kits *(or Retire option below)* | Salt Circles slow by 65% instead of 50%. | Wards burn out **25% faster** and **cannot be manually refilled**; when any ward expires, it leaves a **1.5-tile Witch Salt ring** (**2.2 tiles** for `Salt Circle`) for **8s** that slows by **55%** and refunds **50% ward cost** if a creature dies inside. |

## 2. Detailed Relic Designs (1–11)

### 1. Tallow of Saints
* **Classification:** Plain Relic (Base Pool, Slot 1)
* **Kit Availability:** All 5 kits (no prerequisite; uses the main stair lamp and any placed wards).
* **New Rule:** The outermost **1.0 tile** of the main lamp's current light radius forms a consecrated **bright spot** ring. Wards standing inside this outer band fire or pulse **35% faster** and project **+0.5 tile** of local light, while wards inside the inner core receive no bonus.
* **How It Changes Play:** Because the main lamp's radius expands when you refill oil and shrinks as oil burns down, you stop clustering wards right against the stair. Instead, you build wards in concentric bands and actively manipulate your oil level—letting oil burn down to bring the rim inward onto fallback wards, or refilling oil mid-wave to push the consecrated rim outward onto your forward line.
* **Patron Interaction:**
  * *No Patron:* Works fully via the **+35% fire rate** and **+0.5 tile** light projection on rim wards.
  * *The Wrong Sun:* The **1.0-tile** outer band counts as a true **bright spot** on the board, triggering all Wrong Sun bright-spot boons and penalties along the moving ring.
* **Starting Numbers & Rationale:**
  * **1.0-tile rim width:** Wide enough to catch a ring of wards without requiring pixel-perfect placement, but narrow enough that a **3–4 oil** swing moves the band off one ring of wards and onto another.
  * **+35% fire rate / +0.5 light:** Strong enough to outperform the old flat +0.8 light when you manage oil level around your layout, while giving zero passive radius when ignored.
* **Boss & UI Constraints:** Bosses remain all-or-nothing; rim wards simply attack faster during waves. Rendered using a subtle warm double-stroke on the existing lamp radius line with zero new HUD elements.
* **Teaching (Rule 21 Voice):**
  * *First-time tip:* Keep your wards on the edge of your lamp's reach. Let your oil rise and fall to move the blessed rim where the press is thickest.
  * *Grimoire:* Rendered from the knuckles of three drowned martyrs. Its flame blesses only the border where light meets the dark.

### 2. Oil Reserve
* **Classification:** Plain Relic (Base Pool, Slot 2)
* **Kit Availability:** All 5 kits (no prerequisite; uses the main lamp oil reservoir).
* **New Rule:** On pickup, refill **4 oil**. Your lamp oil is no longer capped at maximum capacity. Whenever your oil sits above your base capacity, the lamp enters **Flood Burn**: it drains excess oil at **0.4 oil per second** and pours burning oil onto the tile beneath the foremost non-boss creature inside the lamp's light, scorching that tile for **14 damage per second** for **3 seconds**.
* **How It Changes Play:** Normally you refill oil only when low to avoid wasting pickups at full capacity. With Oil Reserve, you intentionally hold your lamp near full capacity and collect oil drops or trigger oil-restoring effects in bursts right as heavy waves enter the light, turning surplus oil into a targeted ground-fire phase.
* **Patron Interaction:**
  * *No Patron:* Surplus oil triggers Flood Burn on the foremost creature inside lamp light.
  * *The Drowned Mother:* Burning oil spilled onto **water tiles** floats downstream by **1.0 extra tile**, widening the scorched zone without dousing the flame.
  * *The Wrong Sun:* Each active Flood Burn patch counts as a temporary **bright spot** for its **3-second** duration.
* **Starting Numbers & Rationale:**
  * **4 oil on pickup:** Gives an immediate Flood Burn demonstration if picked up above 60% oil without granting a permanent passive tank increase.
  * **0.4 oil/s drain for 14 damage/s (3s patches):** Every **1 excess oil** gives **2.5 seconds** of Flood Burn (~35 total burn damage across a choke tile), rewarding deliberate overfilling over passive hoarding.
* **Boss & UI Constraints:** Does not chip bosses (bosses remain all-or-nothing; during a boss wave, Flood Burn targets non-boss escorts or scorches the path ahead of the stair). Uses the existing oil bar with an amber overflow glow when `oil > maxOil`.
* **Teaching (Rule 21 Voice):**
  * *First-time tip:* Fill your lamp past its brim to spill burning oil onto the stair path. Save oil pickups for the moment the pack enters your light.
  * *Grimoire:* A copper cistern strapped beneath the burner. When overfilled, it weeps liquid fire down the steps.

### 3. Whetted Barbs
* **Classification:** Plain Relic (Base Pool, Slot 3)
* **Kit Availability:** Requires an impaling/ballistic ward in kit or inventory: `Brine Harpoon` (Lamplighter), `Tether Harpoon` or `Whaling Gun` (Whaler), `Bone Spear` (Occultist), or `Clapper Harpoon` (Bellringer). Not offered to Galvanist unless holding one of these as a gift ward.
* **New Rule:** Impaling shots stay lodged in surviving creatures (up to **3 barbs** per creature). Each lodged barb slows the creature by **12%**. When a barbed creature dies—or steps onto a trap or circle (`Hook Trap`, `Salt Circle`, `Grasping Dead`, `Bell Wire`)—all lodged barbs rip free and fire into the nearest creature within **2.5 tiles** for **100% of the ward's shot damage**.
* **How It Changes Play:** Instead of placing harpoons or spears at the back of the lane to finish off damaged stragglers, you place them at the **front of the lane** to sink 3 barbs into healthy lead creatures, then place a trap or circle mid-lane to rip the barbs out as a burst volley into the pack following behind.
* **Patron Interaction:**
  * *No Patron:* Lodged barbs slow by **12%** per stack and rip free on death or trap/circle contact.
  * *The Many-Mouthed:* Ripping **3 barbs** at once from a single creature also strips **1 dread** buildup from the wave.
* **Starting Numbers & Rationale:**
  * **Max 3 barbs per creature, 12% slow each (36% max):** Prevents infinite stacking on high-HP elites while letting three early hits noticeably compress the front creature back into the pack behind it.
  * **100% shot damage within 2.5 tiles:** Replaces the old flat +30% damage with up to +100% redirected burst damage when you pair front-line harpoons with mid-lane traps or circles.
* **Boss & UI Constraints:** Bosses cannot be slowed or chipped; barbs lodged in nearby wave creatures still rip free normally. Drawn as tiny tick marks on the creature sprite with no HUD overlay.
* **Teaching (Rule 21 Voice):**
  * *First-time tip:* Place your harpoons and spears near the lane mouth so barbs stack in the lead creature, then set a trap behind to tear them loose into the pack.
  * *Grimoire:* Filed backward with sharkskin so the iron enters smooth and comes out only through another body.

### 4. Salt Flats
* **Classification:** Plain Relic (Base Pool, Slot 4)
* **Kit Availability:** Requires `Salt Circle` (ward) or `Pillar of Salt` (rite) in kit or inventory. Native to **Lamplighter**, **Whaler**, and **Galvanist**; offered to **Occultist** or **Bellringer** only if holding a gifted `Salt Circle`.
* **New Rule:** Placing two `Salt Circles` within **2.5 tiles** of each other fuses the ground between them into a continuous **Salt Bridge** that shares their slow and ward properties. Refilling either circle in a linked pair splits the refill across both (**+50% duration** to each). In addition, `Salt Circles` may be placed directly onto **water tiles**, crusting the water into walkable salt for the circle's lifespan.
* **How It Changes Play:** Rather than dropping single isolated Salt Circles on narrow bends, you place Salt Circles in **linked pairs** across wide lanes or directly over water hazards to form long salt barriers, and you maintain two circles at once with a single refill click.
* **Patron Interaction:**
  * *No Patron:* Linked Salt Bridges and water-tile placement work on any map layout.
  * *The Drowned Mother:* A `Salt Circle` placed on a **water tile** counts simultaneously as **water** (for Drowned Mother blessings) and **salt**, and its Salt Bridge range increases from **2.5 tiles** to **3.2 tiles**.
* **Starting Numbers & Rationale:**
  * **2.5-tile link distance:** Spans the gap between two adjacent lane bends without letting two opposite ends of the map connect.
  * **+50% split refill duration:** Preserves the economy of maintaining two linked circles with one action instead of cutting raw essence cost to trivial levels.
* **Boss & UI Constraints:** Does not alter boss all-or-nothing resolution. Drawn as a faint white crystalline band connecting the two existing circle rings on the ground layer.
* **Teaching (Rule 21 Voice):**
  * *First-time tip:* Set two Salt Circles close together to bridge the path between them, or drop them onto water to crust the tide into a barrier.
  * *Grimoire:* Core-cut blocks from a dead inland sea. Two grains remember the bed that joined them.

### 5. Quiet Mind
* **Classification:** Plain Relic (Base Pool, Slot 5)
* **Kit Availability:** All 5 kits (no prerequisite; interacts with madness, essence, and action pacing).
* **New Rule:** Going **10 seconds** during an active wave without placing a ward, refilling a ward, or casting a rite puts you into **Stillness**. While Stillness holds, your madness drains by **1 every 5 seconds**, and your next ward placement or rite cast breaks Stillness to cost **0 madness** and **30% less essence**.
* **How It Changes Play:** Instead of panic-clicking refills and placing wards piecemeal as soon as essence trickles in, you play in disciplined **build-then-wait cycles**: you set your board in a tight burst, take your hands off the controls for **10–15 seconds** mid-wave to bleed off madness, and then cash in the Stillness discount on your heaviest ward or rite.
* **Patron Interaction:**
  * *No Patron:* Drains **1 madness per 5s** during Stillness and grants **0 madness / -30% essence** on the breaking action.
  * *The Many-Mouthed:* Each **5-second** Stillness tick also purges **1 stack of dread**, making deliberate hands-off windows your primary tool for suppressing dread surges.
* **Starting Numbers & Rationale:**
  * **10-second entry delay, 5-second drain tick:** A typical wave lasts 30–45 seconds; waiting 10 seconds requires real restraint under pressure and yields 1–3 madness drain plus one discounted play per wave.
  * **30% essence discount & 0 madness on next action:** Rewards banking essence for a single decisive placement rather than spamming cheap wards.
* **Boss & UI Constraints:** No effect on boss resolution; requires zero clicks or keys (specifically rewards *not* clicking). Indicated by a calm blue-silver pulse on the existing madness meter when Stillness is active.
* **Teaching (Rule 21 Voice):**
  * *First-time tip:* Hold your hand for ten seconds during a wave to steady your mind. Spend the stillness on a single heavy ward or rite at reduced cost.
  * *Grimoire:* Ear-plugs of cold lead and beeswax. The sea still roars, but it roars outside your skull.

### 6. Sealing Wax
* **Classification:** **Cursed Relic** (#1 of 3 curses — Base Pool, Slot 6)
* **Kit Availability:** All 5 kits (works with 0 bound horrors and scales with each bound horror carried).
* **New Rule:** At the start of each wave, your closest unsealed ward to the stair—plus **1 additional ward per bound horror** you carry (minimum **1 ward**)—is stamped with **Sealing Wax**. A **Wax-Sealed Ward** never loses duration or fuel and reduces your total madness by **1**, and its hits mark creatures to take **+25% damage** from all other wards for **4 seconds**. **Curse:** Wax-Sealed Wards fire **30% slower** and are permanently fused to their tile for the rest of the run (they can never be sold, replaced, or moved).
* **How It Changes Play:** Because the wards closest to the stair become permanent fixtures for the entire run, you can never drop a cheap temporary ward near the stair on wave 1 without locking that tile forever. You deliberately place high-value utility or debuff wards in the inner slots so they gain infinite lifespan and apply the **+25% damage mark** for your outer kill-zone wards, while each bound horror you take expands this permanent inner sanctum outward.
* **Patron Interaction:**
  * *No Patron:* Seals **1 ward + 1 per bound horror**, granting infinite duration, **-1 madness**, and the **+25% vulnerability mark** at the cost of **-30% fire rate** and permanent tile lock.
  * *The Many-Mouthed:* Creatures that die while carrying a Wax-Sealed Ward's mark do not generate **dread** on death.
* **Starting Numbers & Rationale:**
  * **1 base ward + 1 per bound horror (-1 madness each):** Guarantees immediate value and curse tension even before you find a bound horror, while preserving the original relic's -1 madness per bound horror identity.
  * **+25% damage mark for 4s vs. -30% fire rate & permanent lock:** Turns sealed wards from solo DPS towers into permanent debuff anchors that amplify unsealed outer wards.
* **Boss & UI Constraints:** Bosses remain all-or-nothing; sealed wards participate normally in wave defense. Marked with a crimson wax stamp icon on the ward base.
* **Teaching (Rule 21 Voice):**
  * *First-time tip:* Choose your inner wards with care before the wave begins. Once the wax cools on a ward near the stair, that stone is bound for good.
  * *Grimoire:* Red tallow mixed with powdered bone. What it shuts stays shut until the stair falls.

### 7. Bounty of the Deep
* **Classification:** **Cursed Relic** (#2 of 3 curses — Base Pool, Slot 7)
* **Kit Availability:** All 5 kits (no prerequisite; modifies essence drops by path depth and water tiles).
* **New Rule:** Creatures drag salvage up from the abyss the further they advance along the path. Creatures killed in the **back half of the path** (the half closer to the stair) or on **water tiles** drop **+60% essence** and refund **15% cooldown** to your Rites. **Curse:** Creatures killed in the **front third of the path** (near spawn) have not yet surfaced their haul and drop **20% less essence** than base.
* **How It Changes Play:** Standard play rewards killing enemies as close to the spawn edge as possible. Bounty of the Deep flips your board geometry upside down: killing at the front entrance *starves* your economy by **-20%**, so you pull your lethal wards back into the **deep half of the path near the stair** (or cluster them around **water tiles**) and use the front lane only for softening or herding.
* **Patron Interaction:**
  * *No Patron:* Back-half kills grant **+60% essence** and **15% Rite cooldown**; front-third kills grant **-20% essence**.
  * *The Drowned Mother:* Because **water tiles** count as Deep Bounty zones regardless of path depth, extra water tiles created by the Drowned Mother let you claim the **+60% essence and 15% Rite recharge** even in the front third of the lane.
* **Starting Numbers & Rationale:**
  * **+60% essence & 15% Rite cooldown (back half / water) vs. -20% essence (front third):** A net double increase over the old +30% essence if you commit to dangerous deep-lane defenses near the stair, balanced by real danger of leaks and reduced income if you spawn-camp.
* **Boss & UI Constraints:** Bosses remain all-or-nothing. A subtle barnacle-gold shimmer appears on creatures once they cross the midpoint of the path or step into water.
* **Teaching (Rule 21 Voice):**
  * *First-time tip:* Let the pack march past the midpoint or into water before you strike them down. Kills near the spawn edge yield lean pickings.
  * *Grimoire:* A rusted grappling iron tangled inkelp and coin. The deep pays only those who let it come close.

### 8. Ossuary Key
* **Classification:** Plain Relic (Base Pool, Slot 8)
* **Kit Availability:** All 5 kits (no prerequisite; modifies merchant purchasing and post-merchant waves).
* **New Rule:** At any merchant, you may buy items on **Bone Credit**, spending down to **-25 essence** below zero. Negative essence is paid off automatically from your next wave drops before essence accumulates above zero. While your essence is negative—or for **2 waves** after any merchant purchase—creatures killed within **2.5 tiles** of the stair drop **Ossuary Shards** worth **+5 essence** each and restore **1 oil** when the wave ends.
* **How It Changes Play:** Instead of hoarding unspent essence across waves just in case a merchant has a high-cost item, you spend aggressively on your board and still unlock key merchant upgrades on credit. Entering the next wave in debt activates a high-payout collection ring within **2.5 tiles** of the stair, incentivizing you to let enemies reach your inner stair defense to clear the ledger fast and earn bonus oil.
* **Patron Interaction:**
  * *No Patron:* Grants **-25 essence** Bone Credit at merchants and **+5 essence** inner-ring kills / **+1 wave-end oil** while indebted or for **2 waves** post-purchase.
  * *The Many-Mouthed:* Entering a wave at **-15 essence or lower** suppresses the first **dread** threshold trigger during that wave (the ledger's claim takes precedence over the patron's).
* **Starting Numbers & Rationale:**
  * **-25 essence credit limit:** Equivalent to roughly one mid-tier ward or half a relic price, letting you bridge a short wallet at the shop without breaking early-wave economy.
  * **+5 essence within 2.5 tiles of stair (5 kills clears full debt):** Rewards dangerous close-in kills after shopping so paying off Bone Credit feels active rather than punitive.
* **Boss & UI Constraints:** Requires no new merchant buttons—the existing buy check simply permits `essence >= price - 25`, displaying negative essence in bone-ivory text. Bosses remain all-or-nothing.
* **Teaching (Rule 21 Voice):**
  * *First-time tip:* Spend below zero at the merchant when you need a ward or relic now, then cull creatures close to the stair to pay the bone-debt back fast.
  * *Grimoire:* Carved from a debtor's collarbone. The vault opens on a promise and collects at the bottom step.

### 9. Leech Jar *(Relics of the Deep)*
* **Classification:** Plain Relic (Relics of the Deep Pack, Slot 9)
* **Kit Availability:** All 5 kits (every kit has native slow, tether, or snare tools: Lamplighter `Salt Circle`/`Hook Trap`; Whaler `Tether Harpoon`/`Salt Circle`/`Hook Trap`; Occultist `Grasping Dead`/`Hex Effigy`; Galvanist `Salt Circle`/`Grounding Anchor`; Bellringer `Bell Wire`/`Tar Censer`/`Bone Chime`; plus any kill on a **water tile** counts for all kits).
* **New Rule:** Unimpaired kills no longer charge the jar. Only creatures that die while **slowed, tethered, snared, stunned, or standing in water** feed the jar (**1 leech** per qualifying kill, up to **8 leeches**). When the jar reaches **8 leeches**, it bursts: it restores **2 oil** to the lamp and flings gorged leeches onto all creatures currently inside the lamp's light, dealing **15 bleed damage** over **3 seconds** and slowing them by **30%**.
* **How It Changes Play:** Pure damage wards on dry ground never advance Leech Jar. You deliberately pair your kill zones with **slow/tether wards** or build around **water tiles** so deaths count toward the jar, and you time the 8th kill when a dense pack is inside the lamp's light so the burst bleeds and slows the entire group.
* **Patron Interaction:**
  * *No Patron:* Charges on any slowed/tethered/snared/stunned/water kill and bursts at **8 stacks** for **2 oil** + AoE bleed/slow in lamp light.
  * *The Drowned Mother:* Kills on **water tiles** grant **2 leeches** instead of 1, doubling jar cycling speed on flooded maps.
* **Starting Numbers & Rationale:**
  * **8 qualifying kills for 2 oil + 15 bleed / 30% slow (3s):** Requires 12 kills per oil instead of 30 when you build around control wards (4 kills per oil on Drowned Mother water), rewarding control-heavy boards with both fuel and an AoE pulse.
* **Boss & UI Constraints:** Bosses remain all-or-nothing. Stack count (`0/8`) displays as a tiny number badge on the relic icon in the existing relic bar.
* **Teaching (Rule 21 Voice):**
  * *First-time tip:* Snare, slow, or drown your prey before the killing blow to feed the jar. Trigger the eighth kill while the pack stands inside your lamp light.
  * *Grimoire:* Stoppered with pitch and swarming with blind black ribbons. They will not drink from blood that runs fast.

### 10. Thunder Marrow *(Relics of the Deep)*
* **Classification:** Plain Relic (Relics of the Deep Pack, Slot 10)
* **Kit Availability:** Requires a stun, shock, or snare ward in kit or inventory: `Bone Chime` or `the Tocsin` (Bellringer), `Lightning Rod`, `Pylon`, or `Galvanic Coil` (Galvanist), `Hook Trap` (Lamplighter, Whaler), or `Grasping Dead` (Occultist).
  * *Note on filtering:* Because this rule triggers on `Bone Chime` / `the Tocsin` stuns, `Lightning Rod` / `Pylon` / `Galvanic Coil` shocks, and `Hook Trap` / `Grasping Dead` snares (with a **3-second** internal cooldown per triggering ward), it works natively across **all 5 kits** while keeping `Bone Chime` as its fastest premier trigger! If you prefer stricter gating, gate it to `{Bone Chime, the Tocsin, Lightning Rod, Pylon, Galvanic Coil, Hook Trap}`.
* **New Rule:** Whenever one of your wards stuns, shocks, or snares a creature (max once every **3 seconds** per triggering ward), a **Thunder Arc** leaps from that creature to your **nearest other ward within 2.5 tiles**, causing that second ward to **fire or pulse immediately for free** and deal **+25% damage** for **3 seconds**.
* **How It Changes Play:** Normally you space stun/snare wards (`Bone Chime`, `Hook Trap`, `Galvanic Coil`) out along the path purely to delay enemies. With Thunder Marrow, you place your stun/chime ward **directly adjacent to your slowest, hardest-hitting ward** (`Whaling Gun`, `Clapper Harpoon`, `Bone Spear`, `Arc Lamp`, `Brine Harpoon`), using every stun or shock as a relay trigger to bypass your heavy weapon's slow fire rate.
* **Patron Interaction:**
  * *No Patron:* Stun/shock/snare jumps a **2.5-tile** Thunder Arc to force an immediate free shot (**+25% damage** for **3s**) from the nearest partner ward.
  * *The Wrong Sun:* If either the triggering ward or the receiving ward stands in a **bright spot**, the Thunder Arc jumps to **two** nearby wards instead of one.
* **Starting Numbers & Rationale:**
  * **2.5-tile jump range, 3.0s per-ward cooldown, +25% damage for 3s:** Ensures `Bone Chime` and shock wards act as rhythmic fire-rate relays for slow heavy hitters without creating infinite zero-cooldown loops between two shock wards.
* **Boss & UI Constraints:** Bosses are not stunned, so the arc triggers off wave creatures stunned/snared near the boss or during waves. Drawn as a single brief bone-white lightning line between the stunned creature and the receiving ward.
* **Teaching (Rule 21 Voice):**
  * *First-time tip:* Set your chimes, traps, and coils right beside your slowest heavy ward. Every stun jumps an arc that forces its neighbor to fire at once.
  * *Grimoire:* Split femur of a storm-struck whale, still humming in the salt air. Strike it and the iron beside it answers.

### 11. Witch Salt *(Relics of the Deep)* — Saved Cursed Version + Retire Alternative

Because `Brined Ledger` (in the active pool) and `Salt Flats` (Slot 4 above) already reward `Salt Circle`, keeping `Witch Salt` as a third `Salt Circle`-only relic narrows the pool for kits without salt. Below is the **recommended saved version** (which keeps the name `Witch Salt`, makes it our **3rd Cursed Relic**, and opens it to **all 5 kits** via expiring wards), followed by a **Retire & Replace option** (`Dead Reckoning`) if you prefer to retire the name outright.

#### Option 11A (Recommended — Saved as Cursed Relic for All 5 Kits)
* **Classification:** **Cursed Relic** (#3 of 3 curses — Relics of the Deep Pack, Slot 11)
* **Kit Availability:** All 5 kits (triggers whenever any ward expires or burns out, with a wider radius when a `Salt Circle` expires).
* **New Rule:** **Curse:** All of your placed wards burn through their lifespan or fuel **25% faster**, and you **cannot manually refill** wards before they expire. **Gain:** Whenever any ward expires or is consumed, it collapses into a **Witch Salt Ring** (**1.5-tile radius**; **2.2-tile radius** if the ward was a `Salt Circle`) for **8 seconds**. Creatures inside a Witch Salt Ring are slowed by **55%**, lose water/bright-spot speed buffs, and refund **50% of the expired ward's base essence cost** if at least **2 creatures** die inside the ring before it fades.
* **How It Changes Play:** You abandon the defensive maintenance loop of refilling existing wards to keep a static board alive. Instead, you play an aggressive **burn-and-replant cycle**: placing forward wards timed to expire right as a wave crests over them, detonating them into **55% slow Witch Salt kill-rings**, collecting the **50% essence refund**, and replanting fresh wards further down the path.
* **Patron Interaction:**
  * *No Patron:* Wards expire **25% faster** (no manual refills) and collapse into **8s, 55%-slow Witch Salt Rings** that refund **50% ward cost** on **2 kills**.
  * *The Drowned Mother / The Wrong Sun:* Witch Salt Rings strip patron-granted creature haste or regeneration inside their radius while leaving player patron boons intact.
* **Starting Numbers & Rationale:**
  * **-25% ward lifespan & no refills vs. 8s ring (55% slow) & 50% cost refund on 2 kills:** Prevents static turtling while ensuring that forward wards that expire in active combat pay back half their cost and leave an 8-second control zone behind.
* **Teaching (Rule 21 Voice):**
  * *First-time tip:* You cannot refill your wards, so let them burn out in the teeth of the pack. Each dying ward leaves a black salt ring that slows prey and pays back half its cost in blood.
  * *Grimoire:* Swept from the hearth where three effigies burned to ash. It eats the candle to salt the floor.

#### Option 11B (Alternative — Retire `Witch Salt` & Replace in Slot 11 with `Dead Reckoning`)
* **If Retired:** Keep table slot 11 (`witch_salt` save key aliased to `dead_reckoning`) and replace with **Dead Reckoning** *(Relics of the Deep)*.
* **Classification:** **Cursed Relic** (#3 of 3 curses — Slot 11)
* **Kit Availability:** All 5 kits.
* **New Rule:** **Curse:** Your main lamp's light radius is fixed at **60% of its normal width** and no longer expands when you refill oil. **Gain:** Every ward you place **outside** the main lamp's light gains **+40% range** and deals **+25% damage** to creatures that have not yet entered the main lamp's light; whenever a creature dies in the dark, it drops a **1.0-tile flare** that reveals the tile for **4 seconds**.
* **Starting Numbers & Rationale:** **60% fixed lamp radius** forces blind outer-lane play, while **+40% range / +25% dark damage** rewards building an autonomous outpost network in the dark instead of defending the stair steps.
* **Teaching (Rule 21 Voice):**
  * *First-time tip:* Your lamp stays dim, so build your wards out in the dark where their reach is longest. Let dying creatures light the path for the next shot.
  * *Grimoire:* A brass octant with its mirrors smoked black. You chart the shoals by what strikes the hull.

## 3. Solving the Kit-Blind Relic Pool (Filter Specification)

To stop offering dead relics like `Second Shadow` or `Brined Ledger` to a Bellringer, the relic offer generator checks a `needs` predicate against the player's **Current Active Kit Inventory** (`kit.wards ∪ kit.rites ∪ run.giftWards`).

* **Rule:** If `relic.needs` is `null`, the relic is eligible for all 5 kits. If `relic.needs` is an array of ward/rite keys, the relic is eligible **if and only if** the player currently owns at least one matching ward or rite in their starting kit or acquired Gift Wards.

### Complete Pool Eligibility Matrix (Existing Pool + 11 Overhauled Relics)

| Relic | Group | `needs` Prerequisite Keys | Lamplighter | Whaler | Occultist | Galvanist | Bellringer |
|---|---|---|---|---|---|---|---|
| **Mourning Veil** | Existing | `null` (Universal) | Yes | Yes | Yes | Yes | Yes |
| **Drowned Compass** | Existing | `null` (Universal) | Yes | Yes | Yes | Yes | Yes |
| **Binder's Thread** | Existing | `null` (Universal — bound horrors) | Yes | Yes | Yes | Yes | Yes |
| **Brined Ledger** | Existing | `['salt_circle', 'pillar_of_salt']` | **Yes** | **Yes** | *Gift only* | **Yes** | *Gift only* |
| **Glass Lantern** *(Cursed)* | Existing | `null` (Universal — lamp) | Yes | Yes | Yes | Yes | Yes |
| **Black Wick** *(Cursed)* | Existing | `['signal_candle', 'blubber_lamp', 'corpse_candle', 'arc_lamp']` *(or Universal if main lamp)* | **Yes** | **Yes** | **Yes** | **Yes** | *Gift only (if candle-gated) / Yes (if main lamp)* |
| **Second Shadow** | Existing | `['hex_effigy']` | *Gift only* | *Gift only* | **Yes** | *Gift only* | *Gift only* |
| **Choir in the Walls** *(Forbidden)* | Existing | `null` (Universal) | Yes | Yes | Yes | Yes | Yes |
| **Gilded Teeth** *(Forbidden)* | Existing | `null` (Universal) | Yes | Yes | Yes | Yes | Yes |
| **Hollow Crown** *(Forbidden)* | Existing | `null` (Universal) | Yes | Yes | Yes | Yes | Yes |
| **A Thousand Eyes** *(Forbidden)* | Existing | `null` (Universal) | Yes | Yes | Yes | Yes | Yes |
| **1. Tallow of Saints** | Overhaul | `null` (Universal — main lamp) | **Yes** | **Yes** | **Yes** | **Yes** | **Yes** |
| **2. Oil Reserve** | Overhaul | `null` (Universal — main lamp) | **Yes** | **Yes** | **Yes** | **Yes** | **Yes** |
| **3. Whetted Barbs** | Overhaul | `['brine_harpoon', 'tether_harpoon', 'bone_spear', 'clapper_harpoon', 'whaling_gun']` | **Yes** | **Yes** | **Yes** | *Gift only* | **Yes** |
| **4. Salt Flats** | Overhaul | `['salt_circle', 'pillar_of_salt']` | **Yes** | **Yes** | *Gift only* | **Yes** | *Gift only* |
| **5. Quiet Mind** | Overhaul | `null` (Universal — madness/pacing) | **Yes** | **Yes** | **Yes** | **Yes** | **Yes** |
| **6. Sealing Wax** *(Cursed)* | Overhaul | `null` (Universal — inner ward + horrors) | **Yes** | **Yes** | **Yes** | **Yes** | **Yes** |
| **7. Bounty of the Deep** *(Cursed)* | Overhaul | `null` (Universal — path depth/water) | **Yes** | **Yes** | **Yes** | **Yes** | **Yes** |
| **8. Ossuary Key** | Overhaul | `null` (Universal — merchant/stair) | **Yes** | **Yes** | **Yes** | **Yes** | **Yes** |
| **9. Leech Jar** | Overhaul | `null` (Universal — any slow/snare/water) | **Yes** | **Yes** | **Yes** | **Yes** | **Yes** |
| **10. Thunder Marrow** | Overhaul | `['bone_chime', 'the_tocsin', 'lightning_rod', 'pylon', 'galvanic_coil', 'hook_trap', 'grasping_dead']` *(or strict chime/shock subset)* | **Yes** | **Yes** | **Yes** *(or Gift)* | **Yes** | **Yes** |
| **11. Witch Salt** *(Cursed)* | Overhaul | `null` (Universal — any expiring ward) | **Yes** | **Yes** | **Yes** | **Yes** | **Yes** |

*Note on `Black Wick`:* If `Black Wick` in `index.html` modifies only the main stair lamp, keep its `needs` as `null`; if it modifies candle-slot wards (`Signal Candle`, `Blubber Lamp`, `Corpse Candle`, `Arc Lamp`), set `needs` to those four wards so Bellringer (`Tuning Fork — no candles`) is only offered `Black Wick` after acquiring a candle gift ward.

## 4. Patron Synergy & Patronless Fallback Summary

Every relic that touches one of the three Patrons functions cleanly in a run with **no Patron** active:

| Relic | Patron Touched | Baseline Behavior (No Patron) | Patron-Enhanced Behavior |
|---|---|---|---|
| **Tallow of Saints** | **The Wrong Sun** *(Bright Spots)* | Outer **1.0-tile** lamp rim gives wards **+35% fire rate** and **+0.5 light**. | The **1.0-tile** rim also registers as a **bright spot** for all Wrong Sun mechanics. |
| **Oil Reserve** | **The Drowned Mother** *(Water)* & **The Wrong Sun** *(Bright Spots)* | Excess oil above base cap burns at **0.4 oil/s** to scorch the lead creature's tile (**14 dmg/s** for **3s**). | Burning oil spreads **+1.0 tile** further across **water tiles** and acts as a temporary **bright spot**. |
| **Salt Flats** | **The Drowned Mother** *(Water)* | Pairs of `Salt Circles` within **2.5 tiles** link into a **Salt Bridge** and can be placed on water tiles. | Water tiles crusted by a `Salt Circle` still count as **water** for Drowned Mother effects, and bridge link range extends to **3.2 tiles**. |
| **Quiet Mind** | **The Many-Mouthed** *(Dread)* | **10s** of no building/refilling/rites drains **1 madness per 5s** and discounts the next action by **30% essence / 0 madness**. | Each **5s** Stillness tick also clears **1 dread** stack. |
| **Sealing Wax** *(Cursed)* | **The Many-Mouthed** *(Dread)* | Seals inner ward(s) for infinite duration, **-1 madness**, and **+25% damage mark** (**-30% fire rate**, permanent lock). | Creatures dying under a Wax-Sealed Ward's mark generate **0 dread**. |
| **Bounty of the Deep** *(Cursed)* | **The Drowned Mother** *(Water)* | Kills in the **back half of the lane** grant **+60% essence** and **15% Rite recharge** (front third **-20% essence**). | Any kill on a **water tile** (even in the front third) counts as a Deep Bounty kill (**+60% essence + 15% Rite recharge**). |
| **Leech Jar** | **The Drowned Mother** *(Water)* | Kills on **slowed, tethered, snared, or stunned** creatures grant **1 leech** (bursts at **8** for **2 oil** + AoE bleed/slow). | Kills on **water tiles** grant **2 leeches** even without a slow ward. |
| **Thunder Marrow** | **The Wrong Sun** *(Bright Spots)* | Stun/shock/snare jumps a **2.5-tile** arc to force an immediate free shot (**+25% dmg** for **3s**) from the nearest ward. | If either ward stands in a **bright spot**, the arc jumps to **two** nearby wards instead of one. |
| **Witch Salt** *(Cursed)* | **The Drowned Mother** & **The Wrong Sun** | Expiring wards drop an **8s, 55%-slow ring** that refunds **50% ward cost** on **2 kills**. | The ring also strips water/bright-spot haste or regeneration buffs from creatures inside it. |

## 5. Verification Against Constraints

* **Bosses stay all-or-nothing:** None of the eleven relics apply percentage health shred, stun-locks, or partial victory states to bosses. Ground burn (`Oil Reserve`), barb bursts (`Whetted Barbs`), and leech bleeds (`Leech Jar`) clear wave escorts and regular waves while respecting binary boss checks.
* **No keyboard or hover:** Every trigger is driven by existing board geometry (lamp rim, lane depth, ward adjacency, water tiles), existing click actions (placing wards, refilling, casting rites, buying at the merchant), or deliberate stillness (`Quiet Mind`).
* **Nothing new covers the board:** Visual feedback uses existing world-space rings (double-stroked lamp rim, salt bridge line, expired-ward ring) and small badge counts on the existing relic strip.
* **Saved-run compatibility:** All 11 slots preserve their table indices and internal IDs (`RELICS_RESTING` flag can be flipped to `false` once implemented).
