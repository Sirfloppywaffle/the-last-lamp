# Conjunction offerings: Gemini's design (#87)

> Kept for the record. **Claude's review on #87 changed it:** five of nine were built, reworked; four were cut. What shipped is in `docs/HISTORY.md` (v18.4.0) and `docs/DESIGN.md` (Conjunctions). Where this file and the game disagree, the game is right.

# Conjunction Offerings — Design Specification (#62, Item 7g / §13.3)

When two patrons below the stair have both noticed you (**Attention 1+** with each), their domains touch on the board. A **Conjunction Offering** is not a stat boost; it is an intersection of two hazards—water that carries violet glare, tide that swallows the chorus, light that feeds the mouths. Every conjunction changes how you act on the board and exacts a price where those two domains meet.

---

## Part 1: Systemic Answers (Questions 1–5)

### 1. When They Appear (Slot, Eligibility, Frequency, and Tier Scaling)

| Rule | Specification | Why |
|---|---|---|
| **Draft Slot** | **Replaces Slot 3** in a standard 3-offering draft (never adds a 4th card). | Preserves the 3-card layout on mobile/touch viewports without covering the board or shrinking tap targets. Visually, the 3rd card splits its frame tint between both patrons. |
| **Eligibility Gate** | Requires **Attention ≥ 1 (Noticed)** with at least two patrons, and neither patron in the rolled pair at **Attention 5 (Claimed)**. | Ensures both patrons are already active on the board (water, bright spots, or dread/creatures exist) before a conjunction can reference both mechanics. |
| **Run Cap** | **Max 1 Conjunction per draft**, and **max 1 Conjunction taken per pair per run** (hard cap of **2 Conjunctions total per run**). | Keeps runs distinct (Pillar 5) and prevents board rules from tangling into unreadable state soup. |
| **Spawn Chance (Noticed: both 1–2)** | **25%** chance on an offering draft to convert Slot 3 into a Conjunction from an eligible pair. | Rare enough at low Attention that you cannot force the same build every run, common enough to see in most dual-patron runs. |
| **Spawn Chance (Mixed: one 3–4, one 1–2)** | **40%** chance to convert Slot 3. | As one patron begins watching closely, their pull drags the other into the draft more often. |
| **Spawn Chance (Watched: both 3–4)** | **60%** chance to convert Slot 3. | Holding two patrons at Watched is high-risk; the draft reflects their shared fixation on you. |
| **Noticed vs. Watched Strength** | **Single card pool with a live Watched Clause (Attention 3+ with both).** The base effect works at Noticed (1+); a secondary **Watched Resonance** line activates live on the board once *both* patrons in the pair reach **Watched (3+)**. | Avoids duplicating cards in the pool while making the climb to dual-Watched visibly intensify the conjunction on the board. (If flat code is preferred for pass 1, ignore the Watched line and ship the base numbers only.) |

### 2. The Price (Attention Economy & Threshold Pacing)

Raising **both** patrons' Attention by +1 on a single pick (+2 total Attention) stacks too fast: a player at `(2, 2)` would cross two **Watched (3)** thresholds simultaneously and hit **Claimed (5)** in two drafts, turning Conjunctions into a trap.

Instead, Conjunctions use **Caller + Board Price** (with zero new UI meters):

| Price Layer | Rule | Why |
|---|---|---|
| **1. Caller Attention (+1 to One Patron)** | The patron in the pair with **lower current Attention** extends the offer as the **Caller** (if tied, pick the patron less recently incremented). Taking the Conjunction raises **only the Caller's Attention by +1**. | Keeps total Attention velocity at **+1 per offering**—identical to standard offerings—while naturally pulling the lagging patron up toward parity with the leading patron. |
| **2. Witness Surge (Immediate Next-Wave Tax)** | The other patron in the pair is the **Witness**. Their Attention does not rise, but on the **next wave only**, their domain starts one step harsher: **Drowned Mother** starts water **+1 tile further up the path**; **Wrong Sun** spawns **+1 violet bright spot**; **Many-Mouthed** starts you at **+12 Dread** and spawns **1 extra Gibberer**. | Makes the second patron's presence felt immediately on the board without burning an permanent Attention pip toward Claimed (5). |
| **3. Persistent Action Price (§13.3)** | Every Conjunction carries its own ongoing board trade-off built into its mechanic (detailed per offering below). | Upholds §13.3: every offering permanently alters both your capability and your vulnerability for the rest of the run. |

### 3. Kit Compatibility Overview (All 5 Kits)

Every Conjunction triggers off **universal board verbs** rather than candle-only or bind-only hooks so all five kits function natively without special-case UI:

* **Ward / Placed Anchor (`placed piece`):** Covers **Lamplighter** candles, **Whaler** oil-lamps/line-posts, **Occultist** ritual wards, **Galvanist** coils/capacitors, and **Bellringer** bells (since Bellringer has no candles, glare "ward slow" slows bell toll cadence/cooldown the same way it slows candle tick rate).
* **Resolve (`banish / capture / kill`):** Covers **Lamplighter** light-binding, **Whaler** harpoon reel-in, **Occultist** madness-fed spear kills, **Galvanist** arc-captures (triggers on capture completion just as on binding), and **Bellringer** resonant shatter.
* **Strike / Cast (`active tap action`):** Covers direct player taps/casts on the path across all five kits.
* **Boss Constraint:** Bosses remain strictly **all-or-nothing**. Conjunction slows, pulls, and stuns apply to path horrors (walkers, Gibberers, Gorgers, Choir-Husks) or modify your own wards/dread/cooldowns; they never deal fractional chip damage to bosses or bypass a boss's all-or-nothing threshold.

---

## Part 2: Pair 1 — The Drowned Mother + The Wrong Sun

**Theme:** *Brine & Glare — Water that carries the violet light; light that boils the tide.*

### Offering 1.1: Phosphor Tide

* **How It Changes Your Action:** Placing a ward, bell, or coil adjacent to water—or striking/resolving a horror inside a **violet bright spot** that touches water—ignites that water segment into **Lit Brine** for **6 seconds** (spreading **2 tiles downstream** with the current). Submerged horrors in Lit Brine lose their water stealth (unveiled as if in a bright spot) and take **+25% faster progress** toward binding, capture, spear-threshold, or bell-shatter.
* **The Price:** Water on the path flows an **additional +15% faster** (bringing the Drowned Mother's **30%** current bonus to **45%** total), and wards/bells/coils bordering Lit Brine suffer half of the Wrong Sun's glare slow (**-15% action/toll rate**).
* **Watched Clause (Both Patrons at Attention 3+):** Lit Brine spreads **3 tiles downstream** instead of 2 and sears unveiled submerged horrors for **15% slow** against the current.

| Parameter | Starting Number | Why |
|---|---|---|
| Lit Brine duration | **6.0s** | Long enough to expose and resolve one wave cluster washing through a choke without permanently lighting the river. |
| Downstream spread | **2 tiles** (3 at dual-Watched) | Matches the feel of current carrying light downstream while keeping the lit zone readable on the existing water shader. |
| Resolution speed bonus | **+25%** | Rewards fighting on flooded tiles (normally dangerous because water speeds and hides horrors) without one-shotting elites. |
| Extra current speed penalty | **+15%** (30% → 45%) | Meaningful spatial tax: anything you fail to stop in the Lit Brine reaches the stair noticeably faster. |
| Adjacent ward/bell slow | **-15% rate** | Half of full glare penalty, forcing you to space placements carefully along the riverbank. |

| Kit | How It Works |
|---|---|
| **Lamplighter** | Candles placed on the bank ignite the water; Lit Brine unveils submerged walkers so candles can bind them before they slip past. |
| **Whaler** | Harpooning a horror where glare meets water lights the downstream channel, revealing hidden targets for follow-up line casts. |
| **Occultist** | Unveiled horrors in Lit Brine can be targeted early by madness spears before they emerge near the stair. |
| **Galvanist** | Coils placed by the water trigger Lit Brine, and the **+25%** resolution speed accelerates **capture** completion on fast-drifting targets. |
| **Bellringer** | No candles required: tolling a bell next to water or resolving a horror in wet glare ignites Lit Brine; the **-15%** bank slow moderately delays bell recharge. |

* **Teaching (Rule 21 Voice):**
  * **First-time tip:** `Glare spills into the current. Strike where light meets water to unveil the tide, or watch it rush past you.`
  * **Grimoire line:** `You let the violet sun sink into the Mother's water. The current runs faster now, but nothing beneath its surface stays hidden from you.`

---

### Offering 1.2: Scalding Ebb

* **How It Changes Your Action:** When you **resolve** (bind, capture, spear, harpoon, or toll-shatter) a horror standing on a tile that is **both flooded and inside a violet bright spot** (or within **1 tile** of both), the water on that tile flashes into steam for **4 seconds**, drying the tile temporarily, removing the current speed boost on that tile, and refunding **30% cooldown/charge** to your nearest placed piece or active strike.
* **The Price:** When a steamed tile re-floods after **4 seconds**, the tide surges **1 tile further up the path** for **8 seconds**, and the violet bright spot shifts **1 tile toward your nearest placed ward/bell/coil** (risking glare-slow on your setup).
* **Watched Clause (Both Patrons at Attention 3+):** Steaming a tile also slows horrors on adjacent tiles by **25% for 2.5 seconds** as the scalding mist rolls outward.

| Parameter | Starting Number | Why |
|---|---|---|
| Steam dry duration | **4.0s** | Creates a brief dry breakwater on the path that interrupts the 30% current speed chain for trailing horrors. |
| Cooldown / charge refund | **30%** | Strong enough to feel an immediate rhythm change when you time a kill at the water-glare border. |
| Trigger proximity | **Same tile or within 1 tile of both** | Ensures the offering still triggers reliably even when random bright spot placement is 1 tile off the waterline. |
| Surge penalty | **+1 path tile for 8.0s** | Gives the Drowned Mother an immediate counter-push up the stair whenever you boil her water. |
| Glare drift penalty | **1 tile toward nearest piece** | Makes the Wrong Sun actively creep onto your wards/bells/coils if you don't reposition or bait it. |

| Kit | How It Works |
|---|---|
| **Lamplighter** | Timing bindings at the glare-water edge refunds candle/light action readiness, at the risk of the bright spot drifting onto your candle line. |
| **Whaler** | Reeling a horror into a wet bright spot boils the tile dry, creating a temporary dry choke point where trailing horrors lose current speed. |
| **Occultist** | Executing a horror with an empowered spear at the water's edge refunds **30%** spear cooldown to chain into the next target. |
| **Galvanist** | Completing a **capture** at the glare-water junction vents steam and recharges **30%** of your nearest coil/capture cycle. |
| **Bellringer** | Shattering a horror with a toll near water and glare speeds up your next toll by **30%**, though the creeping glare can slow a bell if it lands on one. |

* **Teaching (Rule 21 Voice):**
  * **First-time tip:** `Finish a horror where glare touches water to boil the path dry. Prepare for the tide to surge higher when it returns.`
  * **Grimoire line:** `You turn her water against its light. The path steams dry beneath your hand, then climbs one step closer to your throat.`

---

### Offering 1.3: Drowned Corona

* **How It Changes Your Action:** You may place wards, bells, or coils **directly onto flooded path tiles** (or bank tiles touching water) to anchor a **Submerged Glare** ring (radius **1.5 tiles**) around that piece. Submerged Glare unveils horrors in water and sears them for **20% movement slow** (canceling two-thirds of the Drowned Mother's 30% current speed boost) without slowing your own piece inside it.
* **The Price:** Any ward, bell, or coil you place on **dry tiles** (away from water) has its effective range reduced by **25%**, and natural violet bright spots on the board sear **your dry pieces** twice as hard (**2x glare slow**).
* **Watched Clause (Both Patrons at Attention 3+):** When water rises onto a new tile, your nearest water-anchored piece pulses once for **+35% effect** at zero cooldown cost.

| Parameter | Starting Number | Why |
|---|---|---|
| Submerged Glare radius | **1.5 tiles** | Covers the flooded tile and its immediate neighbors without blanketing the whole lane. |
| Water sear slow | **-20% speed** | Drops the Drowned Mother's 1.30x current speed to ~1.04x inside the ring, turning flooded tiles into contested ground. |
| Dry placement range penalty | **-25% range** | Forces a real commitment to building along the waterline rather than camping high dry ground near the stair. |
| Dry glare slow multiplier | **2.0x** | Punishes ignoring the conjunction's rule; dry placements caught in natural glare become nearly frozen. |

| Kit | How It Works |
|---|---|
| **Lamplighter** | Lets you plant drowned candles directly in the tide; they burn violet underwater and unveil everything swimming through. |
| **Whaler** | Anchors along the flooded channel slow the current's rush and expose targets for long harpoon lines. |
| **Occultist** | Wet wards create unveiled kill-zones where horrors are slowed and exposed for madness-charged spears. |
| **Galvanist** | Coils placed in water project a violet capture field that slows and unveils submerged horrors without suffering glare slow themselves. |
| **Bellringer** | Bells set in the water ring with violet light, unveiling and slowing the current around them while dry bells lose **25%** reach. |

* **Teaching (Rule 21 Voice):**
  * **First-time tip:** `Set your pieces in the water to drown the glare and slow the current. Dry ground dims your reach.`
  * **Grimoire line:** `You sink the violet sun beneath the tide. Your works shine brightest under water and wither on dry stone.`

---

## Part 3: Pair 2 — The Drowned Mother + The Many-Mouthed

**Theme:** *Undertow & Chorus — Water that muffles the mouths; mouths that drink the flood.*

### Offering 2.1: Gorger's Undertow

* **How It Changes Your Action:** While **Gibberers, Gorgers, or Choir-Husks** are on flooded tiles, the water muffles their chorus: they generate **50% less passive Dread**. When you **resolve** any horror on a flooded tile, the undertow drags all path horrors within **2 tiles upstream or downstream** by **1 tile back down the path** (away from the stair).
* **The Price:** Whenever a **Gorger** or **Choir-Husk** enters water—or whenever your **Dread is at 50% or higher**—the water level immediately **rises by 1 tile** up the path, and submerged Gorgers move **+40% faster** in the current (instead of the base +30%).
* **Watched Clause (Both Patrons at Attention 3+):** Dragging horrors backward with the undertow also drains **6 Dread** if at least two horrors are pulled.

| Parameter | Starting Number | Why |
|---|---|---|
| Submerged Dread reduction | **-50%** | Turns rising water from a pure threat into a way to muffle Gibberer/Choir-Husk Dread pressure. |
| Undertow pull radius | **2 tiles** | Wide enough to catch a pack of Gibberers trailing a lead walker without resetting the entire board. |
| Undertow pull distance | **1 tile down-path** | Gives concrete spatial breathing room on every submerged resolution while respecting boss immunity. |
| High-Dread / Gorger tide rise | **+1 flooded tile** | The mouths displace and swell the water; letting Dread climb floods more of the path. |
| Submerged Gorger speed | **+40%** (vs. 30% base) | Gorgers become heavy torpedoes in the current if you do not resolve a target nearby to drag them back. |

| Kit | How It Works |
|---|---|
| **Lamplighter** | Binding a front-runner in the water drags the rest of the pack back into your candle light for a second pass. |
| **Whaler** | Combines with harpoon pulls to control lane position, repeatedly dragging Gorgers back down the flooded path. |
| **Occultist** | Lets you control Dread intake—keep horrors in water to halve Dread, or let Dread hit **50%+** to intentionally flood more tiles for spear setups. |
| **Galvanist** | Completing a **capture** on a submerged target triggers the **1-tile undertow pull**, grouping adjacent horrors into coil range. |
| **Bellringer** | Tolling to finish a submerged Gibberer pulls the pack backward, buying time for the next bell resonance without needing candles. |

* **Teaching (Rule 21 Voice):**
  * **First-time tip:** `Water muffles the chorus. Finish a submerged horror to drag nearby walkers back down the tide.`
  * **Grimoire line:** `You fill their mouths with river-silt. They choke on their own song, and their weight makes the dark water rise.`

---

### Offering 2.2: Brine-Choir

* **How It Changes Your Action:** Your active strikes and placed pieces resonate through water whenever **Dread is 35% or higher**: any action (strike, harpoon, spear, capture pulse, or bell toll) that hits a horror on a **flooded tile** echoes across **all connected water tiles** for **20% of its progress/effect** and purges **4 Dread** on resolution.
* **The Price:** Whenever water **rises onto a new dry tile**, you immediately gain **+8 Dread**, and horrors hidden in water cannot be unveiled or targeted until they are within **2 tiles** of your nearest placed piece or bright spot.
* **Watched Clause (Both Patrons at Attention 3+):** At **60%+ Dread**, the water echo increases from **20%** to **35%** across connected water tiles.

| Parameter | Starting Number | Why |
|---|---|---|
| Dread activation threshold | **35% Dread** | Low enough to enter intentionally and maintain as a combat stance without living one tick from madness failure. |
| Connected water echo | **20%** (35% at 60%+ Dread & Watched) | Rewards letting water connect across multiple path tiles so one strike works the whole flooded channel. |
| Dread purge on wet resolution | **-4 Dread** | Gives a release valve so fighting in the water keeps your Dread hovering near the sweet spot. |
| Tide rise Dread spike | **+8 Dread per new flooded tile** | Connects the Drowned Mother's rising tide directly to the Many-Mouthed's Dread meter. |
| Submerged stealth distance | **2 tiles** | Makes deep water murkier until horrors close in on your pieces. |

| Kit | How It Works |
|---|---|
| **Lamplighter** | Candles near the water project binding progress down the entire flooded strip once Dread hits **35%+**. |
| **Whaler** | Harpoon strikes in the water reverberate down the channel, softening trailing Gibberers and Gorgers before you reel them. |
| **Occultist** | Natural synergy with madness-fed spears: hovering above **35% Dread** supercharges both your spears and the water's echo while `-4 Dread` on kill keeps you just under the brink. |
| **Galvanist** | Electrical **capture** pulses conduct naturally through connected water tiles for **20%** capture progress on every submerged horror. |
| **Bellringer** | Bell tolls vibrate through the water column, striking every submerged horror in the connected tide at once. |

* **Teaching (Rule 21 Voice):**
  * **First-time tip:** `Water carries your strikes while dread runs high. Watch the tide, for every dry stone it claims feeds your dread.`
  * **Grimoire line:** `You hear the Choir singing beneath the water. When dread swells in you, every blow you strike rings through the whole river.`

---

### Offering 2.3: Bilge-Swallowed

* **How It Changes Your Action:** Once every **7 seconds**, your direct strike/cast on a horror on or adjacent to water **floods its tile with a Bilge Eddy** for **3.5 seconds** (pulling the target into water if it was 1 tile on dry land). Horrors caught in the Bilge Eddy have their movement speed **halved (-50%)**, and any **Gibberer** that enters the Eddy is instantly swallowed (resolved) if your **Dread is below 50%**.
* **The Price:** Each horror swallowed or resolved inside a Bilge Eddy adds **+6 Dread**, and while your **Dread is 50% or higher**, the Bilge Eddy no longer swallows Gibberers and all water on the board flows **+20% faster**.
* **Watched Clause (Both Patrons at Attention 3+):** Bilge Eddy cooldown drops to **5.5 seconds**, and resolving a **Gorger** or **Choir-Husk** in the Eddy purges **10 Dread** instead of adding +6.

| Parameter | Starting Number | Why |
|---|---|---|
| Bilge Eddy cooldown | **7.0s** (5.5s at dual-Watched) | Paces the effect to roughly once per wave cluster without requiring a separate button or keyboard input. |
| Eddy duration & slow | **3.5s at -50% speed** | Pins a problem horror in the current long enough to finish a bind, capture, or toll cycle. |
| Gibberer swallow cutoff | **< 50% Dread** | Creates a crisp high/low Dread rhythm: keep Dread under 50% to drown small mouths effortlessly. |
| Dread cost per Eddy resolution | **+6 Dread** | Swallowing Gibberers in the bilge pushes you toward the 50% cutoff, forcing you to manage Dread actively. |
| High-Dread current penalty | **+20% current speed at ≥ 50% Dread** | Punishes overflowing the bilge with too much Dread. |

| Kit | How It Works |
|---|---|
| **Lamplighter** | Holds fast walkers inside the Eddy for **3.5s** so adjacent candles can finish binding them before they slip downstream. |
| **Whaler** | Casts a line to pull dry horrors into the Bilge Eddy, drowning Gibberers while saving heavy harpoons for Gorgers. |
| **Occultist** | Uses Gibberer swallows to build Dread rapidly up to **50%** to feed madness spears, then spends that madness on elites. |
| **Galvanist** | The **-50% speed** Eddy holds fast submerged targets inside coil arcs long enough to complete a full **capture**. |
| **Bellringer** | Pins clusters in the Eddy so a single bell toll catches both the slowed elite and the trailing pack. |

* **Teaching (Rule 21 Voice):**
  * **First-time tip:** `Strike near the water to spin an eddy that slows walkers and drowns Gibberers. Keep your dread low, or the bilge turns on you.`
  * **Grimoire line:** `You open a throat in the river-bed. It swallows the small mouths whole until their dread brims back up to the surface.`

---

## Part 4: Pair 3 — The Wrong Sun + The Many-Mouthed

**Theme:** *Glare & Chorus — Light that feeds the mouths; mouths that sing in the violet sun.*

### Offering 3.1: Sun-Drunk Chorus

* **How It Changes Your Action:** **Violet bright spots** mesmerize the Many-Mouthed's brood: **Gibberers, Gorgers, and Choir-Husks** entering a violet bright spot are unveiled and **halt in place for 1.0 second** as they gape upward at the Wrong Sun. Resolving any horror while it stands inside a violet bright spot **purges 8 Dread** and expands that bright spot's radius by **+0.5 tiles for 5 seconds**.
* **The Price:** Any horror that **exits** a violet bright spot without being resolved cries out, giving you **+7 Dread** and gaining **+20% movement speed** for **3 seconds**.
* **Watched Clause (Both Patrons at Attention 3+):** The mesmerize halt lasts **1.4 seconds**, and resolving a **Choir-Husk** in a bright spot triggers a violet flash that halts all horrors on the board for **0.6 seconds**.

| Parameter | Starting Number | Why |
|---|---|---|
| Mesmerize halt duration | **1.0s** (1.4s at dual-Watched) | Long enough to visibly pause Gibberers/Gorgers inside the glare so you can react and strike, without trivializing the wave. |
| Dread purge on glare resolution | **-8 Dread** | Rewards using bright spots as kill-zones to vent the Many-Mouthed's pressure. |
| Temporary glare expansion | **+0.5 tiles for 5.0s** | Lets you chain kills in a bright spot, though expanding the glare also risks touching your own nearby wards/bells. |
| Escape penalty | **+7 Dread and +20% speed for 3.0s** | Makes every bright spot a pact: if you let a horror walk through the light unpunished, it feeds the chorus. |

| Kit | How It Works |
|---|---|
| **Lamplighter** | Place candles just outside a bright spot's edge so mesmerized horrors are bound inside the glare without the glare slowing your candles. |
| **Whaler** | Harpoon horrors *into* a violet bright spot to trigger the **1.0s** halt and finish them for **-8 Dread**. |
| **Occultist** | Intentionally let a few Gibberers pass through a bright spot to farm **+7 Dread** for madness spears, then execute a Gorger inside the glare to vent **-8 Dread**. |
| **Galvanist** | Set coils around a bright spot; the **1.0s** halt inside the glare guarantees your **capture** arc finishes before the target escapes. |
| **Bellringer** | Time bell tolls for the moment a pack halts inside the violet spot, shattering multiple mouths and purging **8 Dread** per kill without using candles. |

* **Teaching (Rule 21 Voice):**
  * **First-time tip:** `The brood stops to stare in violet glare. Finish them in the light to shed dread, or suffer their cry when they leave it.`
  * **Grimoire line:** `You show the mouths to the Wrong Sun. They stand still to drink its glare, and scream if you let them walk back into the dark.`

---

### Offering 3.2: Glare-Fed Maw

* **How It Changes Your Action:** Your **Dread** fuels the Wrong Sun's glare to work *for* you: for every **20% Dread** you hold, your active strikes and placed pieces deal **+12% faster resolution** (up to **+48%** at 80% Dread) against horrors inside or within **1 tile** of a violet bright spot, and the Wrong Sun's **ward/bell glare slow on your pieces is reduced by 20% per 20% Dread** (reaching **0% slow** at **80%+ Dread**).
* **The Price:** Whenever a violet bright spot sits **empty of horrors** for more than **3 seconds**, the hungry light feeds on your mind, generating **+2.5 Dread per second** until a horror enters the spot or you tap/strike inside the spot to feed it **15% of your nearest piece's cooldown**.
* **Watched Clause (Both Patrons at Attention 3+):** At **60%+ Dread**, your direct strikes inside a violet bright spot sear adjacent horrors for **25% of the strike's progress**.

| Parameter | Starting Number | Why |
|---|---|---|
| Resolution bonus per 20% Dread | **+12%** (max +48% at 80% Dread) | Smooth, predictable scaling that rewards high-Dread play inside bright spots without breaking sub-20% Dread runs. |
| Ward glare-slow reduction | **-20% slow per 20% Dread** (immune at 80%) | Turns the Wrong Sun's signature penalty (slowed wards in glare) into something you can overcome by embracing the Many-Mouthed's Dread. |
| Empty glare grace time | **3.0s** | Prevents unfair Dread ticks between spawn sub-waves while forcing action during lulls. |
| Empty glare Dread rate | **+2.5 Dread/s** | Fast enough to demand attention if a spot stays empty, slow enough to manage with a tap or a pulled horror. |

| Kit | How It Works |
|---|---|
| **Lamplighter** | High Dread lets you place candles *directly inside* violet bright spots with reduced or zero glare slow. |
| **Whaler** | Pull horrors into empty bright spots with harpoons to stop the **+2.5/s** Dread drain and cash in on the **+12%–48%** resolution boost. |
| **Occultist** | Peak synergy: Occultist already wants high madness/Dread for spears, and high Dread now turns every bright spot into an un-slowed execution furnace. |
| **Galvanist** | High Dread removes the glare slow on coils placed inside bright spots and accelerates **captures** by up to **+48%**. |
| **Bellringer** | Bell tolls inside glare normally suffer slow recharge; riding **60%–80% Dread** strips away that penalty and lets bells ring at full speed in the violet light. |

* **Teaching (Rule 21 Voice):**
  * **First-time tip:** `Your dread strengthens you inside violet glare and shields your pieces from its slow. Keep horrors in the light, or it feeds on your mind.`
  * **Grimoire line:** `You feed your dread to the violet glare. When madness fills you, the light stops fighting your hands and burns only what walks the path.`

---

### Offering 3.3: Violet Husking

* **How It Changes Your Action:** When you **resolve** a **Gorger, Choir-Husk, or elite horror** (or every **3rd Gibberer**), its body remains on that path tile for **6 seconds** as a **Half-Sun Husk**—a compact violet bright spot (**1-tile radius**, subtle violet outline on the tile so nothing covers the board). The Husk unveils hidden horrors, draws nearby **Gibberers** to veer toward it (slowing their advance by **30%** within **1.5 tiles**), and **does not slow your wards, bells, or coils**.
* **The Price:** While a **Half-Sun Husk** is burning on the board, natural violet bright spots deal **+25% stronger glare slow** to your pieces, and when a Husk expires after **6 seconds**, it releases **+5 Dread** unless you resolved another horror inside its light before it burned out.
* **Watched Clause (Both Patrons at Attention 3+):** Resolving a horror inside a Half-Sun Husk refreshes its duration once (**+4 seconds**) and purges **5 Dread** instead of releasing Dread on expiry.

| Parameter | Starting Number | Why |
|---|---|---|
| Husk duration | **6.0s** (+4.0s once at dual-Watched) | Long enough to anchor a temporary choke point where you killed a Gorger/Choir-Husk without cluttering the board permanently. |
| Gibberer trigger count | **Every 3rd Gibberer** | Ensures waves without Gorgers/Choir-Husks still spawn Husks reliably. |
| Husk radius & slow | **1.0 tile radius, -30% Gibberer speed in 1.5 tiles** | Compact footprint that never obscures path tiles while bunching up small fast mouths. |
| Unfed expiry price | **+5 Dread** (0 if fed a kill) | Pushes you to kill the first target *where* the next horrors will walk so you can feed the Husk before it dies. |
| Natural glare slow penalty | **+25% stronger slow** while a Husk is active | Sharpens the contrast between safe player-made Husks and harsh natural Wrong Sun spots. |

| Kit | How It Works |
|---|---|
| **Lamplighter** | Gives you safe, ward-friendly bright spots right inside your candle kill-zones without suffering glare slow on your candles. |
| **Whaler** | Reel a Gorger to the exact tile where you want a Husk, then use the Husk's **-30% slow** to bunch Gibberers for the next line. |
| **Occultist** | Spear a Choir-Husk to drop a safe unveiling spot, then either chain kills inside it or let it expire for **+5 Dread** to fuel your next spear. |
| **Galvanist** | **Capturing** a Gorger or 3rd Gibberer drops a Husk on the capture tile; your coils near the Husk suffer zero glare slow while capturing the lured pack. |
| **Bellringer** | Shatter a pack with a bell to leave a Husk behind; the Husk slows trailing Gibberers for **6 seconds** while your bell recharges at full speed. |

* **Teaching (Rule 21 Voice):**
  * **First-time tip:** `Slain Gorgers and Husks burn with safe violet light that slows the pack. Claim another horror inside that light before it dies, or take its dread.`
  * **Grimoire line:** `You hollow out their bodies to hold the Wrong Sun's light. The dead shine for you briefly, and demand another mouth before they go dark.`

---

## Part 5: Quick-Reference Verification Matrix (Constraints & Code Audit)

| Constraint (`AGENTS.md` / Brief) | How This Spec Complies |
|---|---|
| **Bosses stay all-or-nothing** | All slows, pulls (*Gorger's Undertow*, *Bilge-Swallowed*), halts (*Sun-Drunk Chorus*), and percentage echoes apply strictly to path horrors (`!enemy.isBoss`) or modify player cooldowns/dread. Boss threshold checks remain untouched. |
| **No keyboard or hover** | Zero new buttons, hotkeys, or hover states. All nine offerings trigger passively from existing placement/resolution events or existing direct taps on the path. |
| **Nothing new may cover the board** | *Lit Brine* tints existing water tiles violet; *Scalding Ebb* briefly dries an existing water tile; *Half-Sun Husk* uses a 1-tile floor ring like existing bright spots. No overlays or floating panels. |
| **Patron tiers & existing offerings stay as they are** | Attention thresholds (Noticed 1, Watched 3, Claimed 5) and all single-patron offerings are unchanged. Conjunctions simply replace Slot 3 when 2+ patrons are at Attention 1–4. |
| **Works across all 5 kits** | Every trigger uses kit-universal hooks (`onPlacePiece`, `onResolveEnemy` covering bind/capture/spear/harpoon/toll, `onPathTap`), and glare penalties affect Bellringer bell recharge just as they affect Lamplighter candles. |
| **Rule 21 Voice** | All 18 teaching lines (9 first-time tips + 9 Grimoire entries) use second person (`you`/`your`), present tense, terse phrasing, and zero exclamation marks. |
