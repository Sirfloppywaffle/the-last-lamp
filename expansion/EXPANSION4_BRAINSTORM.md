# Expansion 4: Customization (brainstorm)

Status: **brainstorm, nothing built.** Claude's opening list for Gemini and Criss to argue over. Criss picks; then this becomes `EXPANSION4_RUNBOOK.md` with numbered steps like Expansion 3.

## The pitch
Saltmouth stops being a list of things you restore and becomes *your* town. Touchstones: Animal Crossing (place anything anywhere, the joy of a cosy room), Stardew Valley (seasons of work showing up in the world), Cult of the Lamb (a dark cult-village you decorate between runs, decorations with small effects).

**Vibe guardrails:** still raining, still Lovecraftian, still pixel art in the town, still hard on the stair. Decorations never make descents easier by more than a nudge. No keyboard-only anything; everything works with a thumb on a folded Fold.

**The long arc:** the true ending is lifting the Village out of the endless rain. Expansion 4 doesn't do that, but it should plant it: every light you hang, every Keeper you house, pushes back the dark a little (a town-wide "Hearth" glow) that a later expansion can cash in.

## 1. The basics (must have)
- **Pick up, move, rotate, then place.** Tap a placed piece → it lifts with a ghost; drag to move, a ⟳ button turns it 90°, ✓ places, ✕ cancels. Red tint where it can't go. Same rules as now (door and shelf never blocked).
- **Rotation** on every furniture piece (4 facings, or 2 for symmetrical ones). Pixel art drawn per facing.
- **Storage chest / inventory.** Picking a piece up puts it in storage instead of selling it; a separate "Salvage" gives the materials back.
- **Grid snapping with a half-tile option** for small things (candles, books) on top of desks and shelves: surfaces.
- **Undo the last action** button while in build mode.

## 2. The Lodge, much bigger
- **More rooms:** a back bedroom, a cellar (stair-themed, damp), an attic with a round window onto the rain. Unlocked by upgrades (timber, iron, curios).
- **Many more furniture sets** (roughly 30–40 pieces), in themed sets: Fisherman's, Drowned Chapel, Brass Observatory, Old Library, Deep-One Coral.
- **Wall-hung items:** paintings of bosses you've beaten, mounted relics, ship's wheel, barometer, clocks.
- **Lights matter:** lamps, candles, a fireplace; the room is darker without them. Lighting is the town's core visual.
- **Trophies:** beat a boss → its trophy can be displayed. Grimoire shelf already does this for creatures; extend it.
- **Set bonus (small):** a full themed set gives one tiny perk (e.g. Observatory: +1 preview of the next wave).

## 3. The village outside
- **Place decorations on the square:** lamp posts, fences, benches, planters of black kelp, statues, shrine tiles, paths (cobble, plank boardwalk, shell).
- **Paint and trim** for restored buildings (a few palettes each, all muted and wet).
- **Keepers' homes:** each freed Keeper gets a hut you can place and furnish lightly; they wander to it, sit on benches, gather at lit places. (Cult of the Lamb follower feel.)
- **Gardens:** a tide-garden plot that grows a crop over descents (Stardew), giving tallow or rare dye.
- **Town Hearth:** total light/comfort across the village; thresholds unlock new pieces and push the rain back a few tiles on the map (the seed for the true ending).

## 4. How you get things
- **Recipes found on the stair** (a blueprint drop per floor, chance rises with depth) so descents feed the town.
- **A travelling peddler** in the rain every few descents with a rotating stock (Animal Crossing's Nooks/Celeste feel).
- **Dyes** from curios to recolour pieces.
- Keep materials the same four (timber, iron, tallow, curios) plus maybe one new rare: **sea-glass**.

## 5. Small joys
- Photo mode: hide UI, pan, save a picture.
- Keepers react to your rooms ("the stove is warm tonight").
- Ambient sound changes inside vs outside; rain on the attic roof.
- Seasonal tide: the sea level in town rises and falls between descents.

## Open questions for Gemini and Criss
1. How much should decoration affect the stair? Cosmetic only, or small set bonuses?
2. Free placement on the square, or fixed plots like now?
3. Rotation: true 4-way sprites (lots of art) or 2-way mirrored?
4. Do we add sea-glass, or keep the economy at four materials?
5. What's the first step: the move/rotate/storage tools (everything else uses them), then Lodge rooms, then outdoors?
6. What could make this *not* fit the vibe, and how do we keep it eerie instead of cosy-cute?

---

## After round 1 with Gemini (PR #134)
**Agreed, adopted:**
- **No stair effects.** Decoration is cosmetic, lore, and town-side only. Set bonuses dropped.
- **No fifth material.** Curios buy blueprints; tallow buys light and dye.
- **Tile grid stays** (extends `LODGE_MAP` and the town's grid): reliable for a thumb on a folded Fold.
- **Rotation:** flip for symmetric pieces, 4-way only for key asymmetric ones.
- **Vibe palette:** salt, rot, iron, tallow, bone, rusted brass; barnacled, waterlogged, soot-stained; lighting makes sharp silhouettes.
- **Gemini's ideas folded in:** the **Hearth Beacon** (fed with tallow and curios, thins the rain around town and reveals drowned carvings in the stone: the true-ending engine); the **Flooded Cellar** (brine rises after deaths and drains after deep wins, leaving kelp and barnacles); **Keeper waypoints and lore chalk**; **boss trophies** that rumble or show lore when tapped.

**Dropped:** the tide-garden and farming (too cosy and choreful); the travelling peddler (Keepers and rescued souls do the trading instead).

**Build order (draft runbook):**
1. Build tools: lift, drag, rotate, storage, undo, small things on surfaces.
2. Lodge rooms: the main room plus the Flooded Cellar and the Attic, and switching between them.
3. Furniture catalogue in themed sets, wall mounts, trophies, and real darkness and light.
4. The Hearth Beacon and the rain thinning out.
5. Keepers reacting to what you place, lore chalk, and the cellar's watermarks.

**Still for Criss:** whether any of the cut ideas should come back (e.g. a peddler as a rescued soul rather than a wanderer).

## Criss's calls (round 2)
- **Decorations are decorations.** No bonuses, unless a piece ties into another expansion (e.g. the Hearth Beacon feeding the true ending).
- **Placement: both, as a toggle.** A Grid / Free switch in build mode. Grid snaps to tiles; Free places anywhere the footprint fits. Both keep the door and shelf clear.
- **Rotation: 8 ways** (every 45°), so a chair can sit in a corner facing the middle of the room. Art: 8 facings for pieces that need them; symmetric pieces reuse mirrored frames. Diagonal footprints need their own collision check, especially in Grid mode.
- The peddler and farming stay cut unless Criss brings them back.
