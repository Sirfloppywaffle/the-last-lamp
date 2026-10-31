import json,re
import sys
D=json.load(open(sys.argv[1]))['d']
L=[]
w=L.append
def esc(s): return str(s).replace('|','\\|')
w("# The Last Lamp — Design Reference\n")
w("Every table below is generated from the live code (`index.html`) by `tests/gen-design.js` + `tools/gen_design.py`, so the numbers are exact as of the last regeneration. If you change a data table in the code, regenerate this file in the same PR (`cd tests && npm run design`). Hand-written sections are marked ✍️.\n")
w("**Global wave pacing:** wave group counts × `COUNT_MUL` = **%s**, spawn gaps × `GAP_MUL` = **%s**, group delays × `DELAY_MUL` = **%s** (groups of 1, such as bosses and elites, are not multiplied).\n"%(D['COUNT_MUL'],D['GAP_MUL'],D['DELAY_MUL']))

w("## ✍️ Formulas\n")
w("""- **Creature health:** `hp = base × m`, where `m = 1.15 + 0.35 × floorIndex` (floor 1 → 1.15, floor 5 → 2.55). Then ×1.3 on elite floors, ×1.25 under the Ironhide omen, ×1.15 at depth ≥ 1. **Bosses** ignore all of that and get only ×1.3 at depth ≥ 4.
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
""")

w("## Saltmouth workshops and town gifts\n")
w("Workshops have tiers 0–2: ruined, restored, then lit windows. Tier 1 offers the gift. One gift is copied into the run; every gain and price is off on replay and under a Trial. The Loaded Bone is offered at the Drowned Oar and the Pawned Relic at the Toothmonger's stall, once each soul is freed (step 7).\n")
w("| Workshop | Restore (0 → 1) | Light windows (1 → 2) |\n|---|---|---|")
for k,v in D['TOWN_WORKSHOPS'].items():
    costs=[', '.join('%s %s'%(n,r) for r,n in c.items()) for c in v['costs']]
    w("| %s | %s | %s |"%(v['n'],*costs))
w("\n| Gift | Gain | Price |\n|---|---|---|")
for v in D['TOWN_GIFTS'].values():
    w("| %s | %s | %s |"%(v['n'],v['gain'],v['price']))
w("\nThe Loaded Bone uses `SALT.townGift = 25`, independently of map and wave draws. Gift use and each rite’s first Tune wait survive a save. Dip marks its free Candle; dismantling that Candle restores the free placement, while selling another tower leaves the gift spent. Older saves without the marker keep their recorded gift use. Dip’s smaller lamp lasts through floor 1, following the Step 6 handoff (the original §0.3 ended it after the first wave).\n")

w("## Saltmouth: rescued souls (step 7)\n")
if 'CAGE_PRICE' in D:
    w("On the landings after floors %s, a door holds a cage with chance **%s**, at most once a run, rolled on `SALT.cage = 26` after the descent doors and never on a Trial door, a descent door or the Deep Stair. The lock takes **%s** essence. Freed souls go up with the haul's one credit, even from a death.\n"%(', '.join(str(x+1) for x in D['CAGE_LANDINGS']),D['CAGE_CHANCE'],D['CAGE_PRICE']))
    w("The Croupier plays knucklebones at the Drowned Oar for **%s** timber or tallow (a win pays it back twice over). The Pawned Relic costs **%s** tallow, paid when you pawn it; it then holds the one town gift until the next descent, which spends it (a replayed stair does not). The relic is taken out of offers after the seeded roll.\n"%(D['BONES_WAGER'],D['PAWN_PRICE']))
    w("| The Toothmonger gives | You get |\n|---|---|")
    for t in D['TOWN_TRADES']:
        nm=lambda n,k:'%s %s'%(n,'curio' if k=='curios' and n==1 else k)
        w("| %s | %s |"%(', '.join(nm(n,k) for k,n in t['give'].items()),', '.join(nm(n,k) for k,n in t['get'].items())))
    w("")

if 'LODGE_ITEMS' in D:
    w("## Saltmouth: the Keeper's Lodge (step 9)\n")
    nm=lambda c:', '.join('%s %s'%(n,'curio' if k=='curios' and n==1 else k) for k,n in c.items()) or 'free'
    w("Restoring the Lodge costs **%s**. Inside, one floor and one wall cover the room (changing either gives back the one replaced); furniture stands where it is set and comes up for all it cost. With the Lodge standing, two Keepers can work at chores.\n"%nm(D['LODGE_COST']))
    if 'LODGE_SETS' in D:
        w("### The catalogue (Expansion 4, step 4)\n")
        w("The Lodge's pieces come in five themed sets, plus its own floors, walls and fireplace, and the trophies (step 5: one per boss put down on the stair, free, one of each). A set is **open** from the start or **bought as a blueprint** from the Peddler (step 6), until then shown locked on the tray. A **wall mount** hangs on the back wall (wall tiles, never floor, 1 tile wide). A **small thing** stands on a surface (a piece with slots on its top, half a tile apart) and goes wherever its host goes. Every piece has two to four **colourways**: its own, and a dye of %s each, a swap of palette letters (going back to its own colours gives the tallow back). Costs are shape only.\n"%nm(D['DYE_COST']))
        w("| Set | Pieces | Open |\n|---|---|---|")
        for k,S in D['LODGE_SETS'].items():
            ps=[v['n'] for v in D['LODGE_ITEMS'].values() if v['set']==k]
            w("| %s | %d: %s | %s |"%(S['n'],len(ps),', '.join(ps),'earned on the stair, one of each' if k=='trophy' else 'from the start' if S.get('open') else 'blueprint'))
        w("")
        w("| Dye | Swaps |\n|---|---|\n"+"\n".join("| %s%s | %s |"%(v['n'],' (rare: the Peddler)' if v.get('rare') else '',', '.join('`%s`→`%s`'%(a,b) for a,b in v['sw'].items())) for v in D['LODGE_DYES'].values()))
        w("")
    if 'PEDDLER_WARES' in D:
        w("### The Peddler's wares (Expansion 4, step 6)\n")
        w("Freed from a cage like the other souls, he keeps a barrow by the Head-frame. He shows **%s** of what you lack, rolled on `SALT.peddler = %s` keyed on `ll-town.trips` (+1 whenever a run ends, won or lost), and keeps that stock in `ll-town.wares` until the next run ends. A blueprint opens its set for good; a rare dye joins every piece it changes (a dozen or more of its pixels), and putting it on costs tallow like any dye.\n"%(D['PEDDLER_N'],D['SALT']['peddler']))
        w("| Ware | Price |\n|---|---|")
        for k,v in D['PEDDLER_WARES'].items():
            w("| %s | %s |"%(('Blueprint: '+D['LODGE_SETS'][v['bp']]['n']) if v.get('bp') else ('Dye: '+D['LODGE_DYES'][v['dye']]['n']),nm(v['cost'])))
        w("")
    w("| Piece | Set | Kind | Cost | Footprint | Light | Facings drawn | Colourways |\n|---|---|---|---|---|---|---|---|")
    for v in D['LODGE_ITEMS'].values():
        piece=v['k'] in ('furn','trophy')
        kind='Floor' if v['k']=='floor' else 'Wall' if v['k']=='wall' else ('Trophy (%s, %s)'%('wall mount' if v.get('mount') else 'plinth',D['FOES'][v['foe']]['n'] if 'FOES' in D else v['foe'])) if v['k']=='trophy' else 'Wall mount' if v.get('mount') else 'Small thing' if v.get('small') else 'Surface (%d slots)'%v['top'] if v.get('top') else 'Furniture'
        w("| %s | %s | %s | %s | %s | %s | %s | %s |"%(v['n'],D['LODGE_SETS'][v['set']]['s'] if 'LODGE_SETS' in D else '',kind,nm(v['cost']),('%d×%d'%(v.get('w',1),v.get('h',1))+(' (walked over)' if v.get('flat') else '')) if piece else 'the room',('%s%s'%(v['light'],' (green)' if v.get('green') else '')) if v.get('light') else '',v.get('faces',1) if piece else '',1+len(v.get('dyes',[])) if piece else ''))
    w("")

w("## Creatures\n")
w("| Key | Name | HP | Speed | Oil | Essence | Radius | Traits |\n|---|---|---|---|---|---|---|---|")
for k,f in D['FOES'].items():
    tr=[t for t in ['bind','fly','veiled','aura','elite','boss','spawner','heavy','bound'] if f.get(t)]
    if f.get('split'):tr.append('splits into %d'%f['split'])
    w("| `%s` | %s | %s | %s | %s | %s | %s | %s |"%(k,esc(f['n']),f['hp'],f['spd'],f['oil'],f['ess'],f['r'],', '.join(tr)))
w("\n`bind` = can drop a sigil you can bind as a horror. `veiled` = invisible unless unveiled. `aura` = buffs nearby creatures. `spawner` = calls minions. `keeper` is the bound form of the Keeper Below; it never spawns as an enemy. Spawnable: %s.\n"%', '.join('`%s`'%s for s in D['SPAWNABLE']))

w("## Wards\n")
w("Base set (any kit may start with these): %s. Gift-only: %s.\n"%(', '.join('`%s`'%x for x in D['BASE_WARDS']),', '.join('`%s`'%x for x in D['GIFT_WARDS'])))
w("| Key | Name | Cost | Placement | Description |\n|---|---|---|---|---|")
for k,v in D['WARDS'].items():
    w("| `%s` | %s | %s | %s | %s |"%(k,esc(v['n']),v['cost'],'path' if v.get('path') else 'beside path','%s%s'%(esc(v['d']),' *(aimed: First/Last/Strongest)*' if v.get('aim') else '')))
w("\n### Upgrade trees (cost per tier; tier 3 is the capstone)\n")
for k,branches in D['TREES'].items():
    nm=D['WARDS'][k]['n'] if k in D['WARDS'] else ('The Lamp' if k=='lamp' else k)
    w("**%s**\n"%nm)
    w("| Branch | Tier 1 | Tier 2 | Tier 3 (capstone) |\n|---|---|---|---|")
    for b in branches:
        t=b['t']; w("| %s | %s — %s | %s — %s | %s — %s |"%(b['n'],t[0][0],esc(t[0][1]),t[1][0],esc(t[1][1]),t[2][0],esc(t[2][1])))
    w("")

w("## Horrors (bound creatures)\n")
w("| Key | Name | Cost | Madness | Range | Damage / effect | Description |\n|---|---|---|---|---|---|---|")
for k,h in D['HORRORS'].items():
    eff=[]
    if 'dmg' in h: eff.append('%s dmg every %.2fs'%(h['dmg'],1/h['rate']) if h.get('rate') else '%s dmg'%h['dmg'])
    if 'dps' in h: eff.append('%s dps'%h['dps'])
    if 'slow' in h: eff.append('slow %d%%'%round(h['slow']*100))
    if 'poison' in h: eff.append('poison %s/s'%h['poison'])
    if 'push' in h: eff.append('push %s'%h['push'])
    w("| `%s` | %s | %s | %s | %s | %s | %s |"%(k,esc(h['n']),h['cost'],h['mad'],h['range'],'; '.join(eff),esc(h['d'])))

w("\n## Rites\n\n| Key | Name | Cooldown | Effect |\n|---|---|---|---|")
for k,r in D['RITES'].items(): w("| `%s` | %s | %s | %s |"%(k,r['n'],('%ss'%r['cd']) if r['cd'] else 'once per floor',esc(r['d'])))

w("\n## Kits\n\n| Key | Name | Wards | Rites | Starts with | Unlock | Perk |\n|---|---|---|---|---|---|---|")
for k,v in D['KITS'].items():
    w("| `%s` | %s | %s | %s | %s | %s | %s |"%(k,v['n'],', '.join(v['wards']),', '.join(v['rites']),', '.join('%s×%s'%(a,b) for a,b in v['roster'].items()) or '—',('Deed: %s'%esc(v['deed'])) if v.get('deed') else ('Ember Hall (`%s`)'%v['lock']) if v.get('lock') else 'open',esc(v['d'])))

if D.get('KIT_WARDS'):
    w("\n### Kit wards\n\nA kit's own version of a ward. Underneath it is the same ward (same key, cost, branches, relics and omens); only its name and its twist differ.\n\n| Kit | Replaces | Name | What it does |\n|---|---|---|---|")
    for kk,ws in D['KIT_WARDS'].items():
        for wk,v in ws.items(): w("| `%s` | `%s` | %s | %s |"%(kk,wk,esc(v['n']),esc(v['d'])))
    for kk,ts in (D.get('KIT_TREES') or {}).items():
        for wk,tree in ts.items():
            w("\n**%s (`%s`, %s)**\n\n| Branch | Tier 1 | Tier 2 | Tier 3 (capstone) |\n|---|---|---|---|"%(esc((D['KIT_WARDS'].get(kk,{}).get(wk) or D['WARDS'].get(wk) or {'n':'The Lamp'})['n']),kk,('replaces '+wk) if wk in D['KIT_WARDS'].get(kk,{}) else ('its own '+wk if wk in D['WARDS'] else 'its own lamp branches')))
            for b in tree: w("| %s | %s |"%(b['n'],' | '.join('%s — %s'%(c,esc(t)) for c,t in b['t'])))
    if 'RING_SPD' in D: w("\nBellringer numbers: a toll's ring sweeps **%s** tiles a second out to **%s** tiles; what it touches is heard for **%ss**. Toll has a **%ss** swing and makes 1 Noise; Noise fades 1 per **%ss**, and at **%s** the dark answers with **%s** Abyssal Stalkers and Noise drops to **%s**. Bell Wires (at most **%s**) hear what crosses them for **%ss** and jangle within **%s**, ringing again after **%ss**. A Clapper bolt rings its target for **%ss** and knocks it back **%s** tiles. Peal tolls every **%ss**; Cathedral staggers within **%s** for **%ss**. The Great Bell is heard **%ss**, staggers **%ss** and makes **%s** Noise. Ghosts last **%ss**, **%s** at most."%(D['RING_SPD'],D['TOLL_R'],D['HEAR_T'],D['TOLL_SWING'],D['NOISE_FADE'],D['NOISE_MAX'],D['NOISE_CALL'],D['NOISE_AFTER'],D['BELLWIRE_MAX'],D['WIRE_HEAR'],D['WIRE_ECHO'],D['WIRE_RING'],D['CLAP_HEAR'],D['CLAP_KNOCK'],D['PEAL_T'],D['CATH_R'],D['CATH_STUN'],D['GREAT_HEAR'],D['GREAT_STUN'],D['GREAT_NOISE'],D['GHOST_T'],D['GHOST_MAX']))
    if 'SNUFF_R' in D: w("\nHeralds: %s. The Last Keeper carries a lamp of **%s** tiles and snuffs every candle within **%s** for **%ss**. The Tithe-taker takes **%s** essence a second into its sack, and pays back **×%s** when slain. The Bellfather tolls every **%ss**: wards within **%s** reel for **%ss**. A Herald drains its oil at the lamp but never ends the run by itself, pays a relic when slain, and a run never meets the same one twice. None can be held forever: **%ss** stunned or pinned (easing **%s**/s while it walks) and it breaks free, shrugging off every hold for **%ss**."%(', '.join('floor %d: %s'%(int(k)+1,', '.join(v)) for k,v in D['HERALDS'].items()),D['KEEPER_LIGHT'],D['SNUFF_R'],D['SNUFF_T'],D['TITHE_TAKE'],D['TITHE_BACK'],D['BELLF_EVERY'],D['BELLF_R'],D['BELLF_DAZE'],D['HELD_MAX'],D['HELD_EASE'],D['HELD_FREE']))
    if 'FORK_REACH' in D: w("\nTuning Forks stand within **%s** tiles of the lamp or **%s** of a reached fork, hum **%s** tiles (build there in the dark; wards strike only what is heard) and ring a toll on **%s** tiles; Drone rings every **%ss**. Echoes off the walls hear for **%ss**. Unseen heavy things leave a footstep ripple every **%ss** (at most **%s** at once)."%(D['FORK_LAMP'],D['FORK_REACH'],D['FORK_HUM'],D['FORK_RING'],D['FORK_DRONE'],D['ECHO_HEAR'],D['STEP_EVERY'],D['STEP_MAX']))
    if 'TOCSIN_DMG' in D: w("\nThe Tocsin answers a Bell Wire after **%ss** of silence; its shell flies **%ss** (more for distance), deals **%s** in **%s** tiles, and it reloads in **%ss**. Resonance: **%s** cracks shatter a creature (**%s** for Behemoths and elites, **%s** for bosses); a crack fades after **%ss** without a ring. A shatter deals **%s** + **%s** of its health (bosses **%s**) and **%s** to everything within **%s**, cracking it. A Perfect Toll lands within **%ss** of the lamp's beat."%(D['TOCSIN_DELAY'],D['TOCSIN_FLIGHT'],D['TOCSIN_DMG'],D['TOCSIN_R'],D['TOCSIN_RELOAD'],D['RES_SHATTER'],D['RES_BIG'],D['RES_BOSS'],D['RES_FADE'],D['SHATTER_DMG'],D['SHATTER_PCT'],D['SHATTER_BOSS'],D['SHATTER_SPLASH'],D['SHATTER_R'],D['PERFECT_WIN']))
    if 'CHIME_FULL' in D: w("\nBone Chime: the **%s** creatures nearest take its full strike, the rest **×%s**. A boss it stuns is deaf to every chime for **%ss**. Found on the stair (gift, merchant, pack); only the Bellringer starts with it."%(D['CHIME_FULL'],D['CHIME_FAR'],D['CHIME_DEAF']))
    if 'PYLON_LINK' in D: w("\nGalvanist numbers: pylons link within **%s** tiles, **%s** wires each; a wire shocks for **%s**, stuns **%ss** (bosses 0.15s), lights what it touches for **%ss**, then recharges **%ss**. Lightning Rods stand **%ss**, **%s** per harpoon. The Arc Lamp shines **+%s**, cuts out **%ss** of every **%ss** in a wave, and flares for **%s** with a **%ss** stun. Overload costs **%s** oil, strikes at **×%s**, adds 1 Heat (cools 1 per **%ss**), and at **%s** Heat or more fries pylons. Static Burst fires when something is within **%s** of the lamp, stuns everything within **%s** for **%ss**, every **%ss**. The Grounding Anchor stands **%ss**; a catch waits **%ss** for a tap and a capture vents **%s** Heat."%(D['PYLON_LINK'],D['PYLON_LINKS'],D['WIRE_DMG'],D['WIRE_STUN'],D['WIRE_REVEAL'],D['WIRE_RECHARGE'],D['ROD_T'],D['ROD_MAX'],D['ARC_LIGHT'],D['ARC_OFF'],D['ARC_PERIOD'],D['ARC_DMG'],D['ARC_STUN'],D['OVER_OIL'],D['OVER_MUL'],D['HEAT_COOL'],D['HEAT_FRY'],D['STATIC_TRIG'],D['STATIC_R'],D['STATIC_STUN'],D['STATIC_CD'],D['ANCHOR_T'],D['CAGE_T'],D['CAPTURE_VENT']))
    if 'MIRROR_LEN' in D: w("\nOwn wards and rites: the Lamplighter's Signal Mirror throws a beam **%s** tiles long (lit in patches of **%s**) that burns **%s** a second, and only while it stands in the lamp's own light. The Whaler's Haul Away casts a net of radius **%s**: everything under it, and everything on its lines, slides **%s** tiles back over %ss (Behemoths a third as far, bosses not at all) and is tangled, **%d%%** slower for **%ss**."%(D['MIRROR_LEN'],D['MIRROR_R'],D['MIRROR_DPS'],D['NET_R'],D['HAUL_BACK'],D['HAUL_TIME'],round(D['TANGLE_SLOW']*100),D['TANGLE_T']))
    if 'CORPSE_REACH' in D: w("\nOccultist numbers: a Corpse Candle costs nothing, needs no lamp, stands within **%s** tiles of a body from this floor (one body per candle) and goes out when the wave breaks. A death within **%s** tiles of a pile joins it; a pile holds **%s**, a death beside a full one scatters, and a floor keeps the freshest **%s** bodies. The first floor of an Occultist descent starts with two piles. The Grasping Dead rise from a full pile (its three bodies), need no light, hold each creature **%ss** (bosses **%ss**) and crumble after **%s** grips. Raise the Dead stands a pile up as a Risen beside it: **%s** damage per bone (× the horrors' madness bonus), range **%s**, **%s** bites a second, until the wave breaks. A Bone Spear deals **+%d%%** per tier of madness (Dread adds **+%d%%** per tier per level). Horrors deal **+%d%%** per tier. Unbind charges at **%s** tiles a second, dealing **%s + %s × the horror's madness** to each creature it passes, and stuns for 1s (bosses 0.3s, Behemoths not at all)."%(D['CORPSE_REACH'],D['PILE_GATHER'],D['PILE_MAX'],D['BODY_MAX'],D['GRASP_HOLD'],D['GRASP_BOSS'],D['GRASP_GRIPS'],D['RISEN_DMG'],D['RISEN_RANGE'],D['RISEN_RATE'],round(D['SPEAR_TIER']*100),round(D['DREAD_TIER']*100),round(D['HORROR_TIER']*100),D['UNBIND_SPD'],D['UNBIND_BASE'],D['UNBIND_PER']))
    if 'POT_R' in D: w("\nWhaler numbers: a Blubber Lamp burns **+%s** light; while any stands, each wave costs 1 oil unless a Try-pot has a measure. The Try-pot reaches **%s** tiles; each death gives up its oil value (at most %s); every **%s** makes a measure; it holds **%s**, and a full pot pours 1 oil into the lamp instead. The line slows by **%s** a second held, up to **%s**%%; Reel In hauls back 1 tile every **%ss**."%(D['BLUBBER_LIGHT'],D['POT_R'],D['POT_MEASURE'],D['POT_MEASURE'],D['POT_MAX'],D['TETHER_RATE'],int(D['TETHER_MAX']*100),D['HAUL_EVERY']))
    w("\nNumbers: Signal Candle light leaps **%s** tiles. A flare bolt lights **%s** tiles for **%ss** (at most %s at once); a Starshell lights **%s** tiles for **%ss**. A Fire Thread kindles what crosses it for **%ss**. Kindle burns **%ss**, lights **%s** tiles, deals **%s** damage a second, and the creature moves **×%s** (bosses don't hurry)."%(D['LEAP'],D['GLINT_R'],D['GLINT_T'],D['GLINT_MAX'],D['STAR_R'],D['STAR_T'],D['THREAD_T'],D['KINDLE_T'],D['KINDLE_R'],D['KINDLE_DPS'],D['KINDLE_RUN']))

w("\n## Relics\n\n| Key | Name | Cursed | Pack | Needs | Effect |\n|---|---|---|---|---|---|")
for k,v in D['RELICS'].items(): w("| `%s` | %s | %s | %s | %s | %s |"%(k,esc(v['n']),'yes' if v.get('curse') else '',v.get('pack','base'),', '.join(['`%s`'%n for n in v.get('needs') or []]+['never `%s`'%n for n in v.get('notKit') or []]),esc(v['d'])))
if D.get('RESERVE_OIL') is not None:
    w("\n**Offered only if you can use it** (#89): a relic with needs is offered only to a run holding one of those wards or rites (its kit's, or one bought, gifted or found).")
    w("\nNumbers (#89): Oil Reserve restores **%s**, spills up to **%s**, burns **%s** spill a second as fire of **%s**/s for **%ss**. Tallow of Saints: edge **%s** tile, wait ×**%s**. Whetted Barbs: **%s** barbs, **%s** slow each, torn **%s** tiles for **%s** of the blow. Salt Flats bridges circles within **%s**. Quiet Mind: still after **%ss**, madness **−%s**, next build ×**%s**. Sealing Wax: **%s** at most, wait ×**%.2f**, mark ×**%s** for **%ss**. Bounty of the Deep: far ×**%s**, near ×**%s**. Ossuary Key: credit **%s**, **%s** waves, within **%s** tiles, **+%s**. Leech Jar: **%s** kills, **%s** oil, bleed **%s** over **%ss**, slow **%s**. Thunder Marrow: **%s** tiles, every **%ss** per ward, ×**%s** for **%ss**. Dead Reckoning: lamp **−%s**, range ×**%s**, damage ×**%s**."%tuple(D[n] for n in 'RESERVE_OIL SPILL_MAX SPILL_DRAIN SPILL_DPS SPILL_T TALLOW_RIM TALLOW_CD BARB_MAX BARB_SLOW BARB_R BARB_HIT BRIDGE_R STILL_T STILL_MAD STILL_DISC WAX_MAX WAX_CD WAX_MARK WAX_MARK_T BOUNTY_FAR BOUNTY_NEAR KEY_CREDIT KEY_WAVES KEY_R KEY_ESS LEECH_N LEECH_OIL LEECH_DMG LEECH_T LEECH_SLOW MARROW_R MARROW_CD MARROW_DMG MARROW_T RECKON_LAMP RECKON_RANGE RECKON_DMG'.split()))
if D.get('RELICS_RESTING'): w("\n**Resting while patrons are tested** (#29, `RELICS_RESTING`): %s. They are never offered; a run that carries one keeps it."%', '.join(esc(D['RELICS'][k]['n']) for k in D['RESTING']))

if D.get('PATRONS'):
    w("\n## Patrons\n\nAt the landing the gift is a patron's offering instead, half the time (a quarter if one already reached out on that floor); between waves one reaches out at **%d%%** of breaks (once a floor). Take one or refuse. Each gift is +1 Attention.\n"%round(D['PATRON_BREAK']*100))
    for pk,P in D['PATRONS'].items():
        w("**%s** (`%s`): %s\n"%(esc(P['n']),pk,esc(P['d'])))
        w("| Attention | Tier | What changes |\n|---|---|---|")
        for t in P['tiers']: w("| %s | %s | %s |"%(t['at'],t['n'],esc(t['d'])))
    if 'MOUTH_DREAD' in D: w("\nMany-Mouthed numbers: Watched carries **%s** dread; each Gibberer alive adds **%s** (at most **%s**), and a ward within **%s** tiles of one waits **×%s** between shots. A Gorger takes **×%s** from horrors; every **%ss** (the first after %ss) it lashes a horror within **%s** tiles (once Watched, a candle or fork within **%s**), dazing or snuffing it **%ss** and healing **%s**. A Choir-Husk veils what walks within **%s** tiles (not itself, a boss or a Herald). Dread counts toward the madness tiers; only paid horrors' madness feeds the Occultist and opens Unpaid Teeth."%(D['MOUTH_DREAD'],D['GIB_DREAD'],D['GIB_DREAD_MAX'],D['GIB_R'],D['GIB_SLOW'],D['GORGE_RESIST'],D['GORGE_CD'],D['GORGE_FIRST'],D['GORGE_R'],D['GORGE_WARD_R'],D['GORGE_T'],D['GORGE_HEAL'],D['HUSK_R']))
    w("\nWater numbers: current **×%s**; a floor floods **%s** stretches of **%s** tiles; it rises to at most **%s** tiles; \"beside water\" is within **%s** tiles."%(D['CURRENT'],D['FLOOD_N'],D['FLOOD_LEN'],D['FLOOD_MAX'],D['NEAR_WATER']))
    w("\n| Key | Offering | Patron | Kit | Effect |\n|---|---|---|---|---|")
    for k,v in D['OFFERINGS'].items():
        if not v.get('pair'): w("| `%s` | %s | %s | %s | %s |"%(k,esc(v['n']),v['p'],v.get('kit',''),esc(v['d'])))
    conj=[(k,v) for k,v in D['OFFERINGS'].items() if v.get('pair')]
    if conj and 'CONJ_CHANCE' in D:
        ch=D['CONJ_CHANCE']
        w("\n### Conjunctions\n\nTwo patrons who have both noticed you (Attention 1 to 4 each, neither Claimed) may put one in the third card of an offer: **%d%%** of offers when neither is Watched, **%d%%** with one, **%d%%** with both. It never replaces the kit's own offering. A run takes one per pair, **%s** at most. The **Caller** (the pair's lower Attention; the first of the pair on a tie) takes +1 Attention; the **Witness** takes none, but the next wave its water rises a tile, it opens another spot, or one more Gibberer climbs.\n"%(round(ch[0]*100),round(ch[1]*100),round(ch[2]*100),D['CONJ_MAX']))
        w("Numbers: Phosphor Tide glow **%ss**, **×%s** damage, current **×%s**. Gorger's Undertow drags **%s** tile within **%s** (each creature **%s** times at most), **%s** rises a wave, Gorgers **×%s**. Brine-Choir echo **×%s**, dread at most **%s**. Sun-Drunk Chorus **%ss** still, **×%s** for **%ss**, dread at most **%s**. Violet Husking **%ss**, light **%s** tile, Gibberers **%s%%** slower within **%s**, every **%s**rd Gibberer, unfed: 1 dread for **%ss** (at most **%s**).\n"%(D['PHOS_T'],D['PHOS_DMG'],D['PHOS_CURRENT'],D['DRAG_BACK'],D['DRAG_R'],D['DRAG_MAX'],D['DRAG_RISE'],D['GORGE_CURRENT'],D['CHOIR_ECHO'],D['CHOIR_DREAD_MAX'],D['DRUNK_T'],D['DRUNK_RUN'],D['DRUNK_RUN_T'],D['DRUNK_DREAD_MAX'],D['HUSKL_T'],D['HUSKL_R'],round(D['HUSKL_SLOW']*100),D['HUSKL_GIB_R'],D['HUSKL_EVERY'],D['HUSKL_DREAD_T'],D['HUSKL_DREAD_MAX']))
        w("| Key | Conjunction | Patrons | Effect |\n|---|---|---|---|")
        for k,v in conj: w("| `%s` | %s | %s | %s |"%(k,esc(v['n']),' + '.join(v['pair']),esc(v['d'])))

w("\n## Omens (on stair doors)\n\n| Key | Name | Effect |\n|---|---|---|")
for k,v in D['OMENS'].items(): w("| `%s` | %s | %s |"%(k,v['n'],esc(v['d'])))

if 'TRIALS' in D:
  w("\n## Trials (on stair doors, floors 2 and 3)\n\nOne door on each fork into floor %s carries a Trial; passing it pays a relic. Rationed allows %s wards beside the path; the Hallowed Ground marks %s patches of up to %s tiles.\n\n| Key | Name | Rule |\n|---|---|---|"%(' or '.join(str(f+1) for f in D['TRIAL_FLOORS']),D['RATION_MAX'],D['HALLOW_PATCHES'],D['HALLOW_SIZE']))
  for k,v in D['TRIALS'].items(): w("| `%s` | %s | %s |"%(k,esc(v['n']),esc(v['d'])))

w("\n## Rooms (behind stair doors)\n\n| Key | Name | Tag | Description |\n|---|---|---|---|")
for k,v in D['ROOMS'].items(): w("| `%s` | %s | %s | %s |"%(k,esc(v['n']),v['tag'],esc(v['d'])))

w("\n## Shrine pacts\n\n| Key | Name | Effect |\n|---|---|---|")
for k,v in D['PACTS'].items(): w("| `%s` | %s | %s |"%(k,v['n'],esc(v['d'])))

w("\n## Events\n")
for k,v in D['EVENTS'].items():
    w("**%s** (`%s`)%s: *%s*\n"%(v['n'],k,' — needs `%s`'%v['pack'] if v.get('pack') else '',esc(v['body'])))
    for o in v['opts']: w("- **%s:** %s"%(o['l'],esc(o['d'])))
    w("")

w("## The Deeper Dark (depths, cumulative)\n")
for i,d in enumerate(D['DEPTHS']):
    if d: w("%d. %s"%(i,d))
w("\n## Ember Hall\n\n| Key | Unlock | Cost | Effect |\n|---|---|---|---|")
for h in D['HALL']: w("| `%s` | %s | %s | %s |"%(h['k'],h['n'],h['cost'],esc(h['d'])))

w("\n## Floors and waves (base counts, before `COUNT_MUL`)\n")
w("Each floor draws one card per wave slot when it begins: the classic wave (listed first, with its name) or one of the alternatives under it. A **fixed** wave (a boss or the Choirmaster) always keeps its slot. The draw is saved with the run.\n")
for i,f in enumerate(D['FLOORS']):
    w("### %d. %s\n"%(i+1,f['name']))
    nf=len(f.get('forks',[]))
    w("Stipend **%s** essence · %d gate%s%s · hue %s\n"%(f['stipend'],len(f['paths']),'s' if len(f['paths'])>1 else '',(' · %d fork%s'%(nf,'s' if nf>1 else '')) if nf else '',f.get('hue')))
    if f.get('variants'):
        # each map: road lengths (in tiles, the fork's branch after a slash), where the lamp stands if it moves
        plen=lambda pts:sum(abs(b[0]-a[0])+abs(b[1]-a[1]) for a,b in zip(pts,pts[1:]))
        def blen(m,fd):
            root=m['paths'][fd['gate']]; seg=[fd['from']]+fd['via']+[fd['to']]
            cut=lambda q:next(plen(root[:j+1])+abs(q[0]-root[j][0])+abs(q[1]-root[j][1]) for j in range(len(root)-1) if min(root[j][0],root[j+1][0])<=q[0]<=max(root[j][0],root[j+1][0]) and min(root[j][1],root[j+1][1])<=q[1]<=max(root[j][1],root[j+1][1]))
            return plen(root)-(cut(fd['to'])-cut(fd['from']))+plen(seg)
        maps=[dict(n=f.get('mapN','Map 1'),paths=f['paths'],forks=f.get('forks',[]),lamp=f['lamp'])]+[{'lamp':f['lamp'],'forks':[],**v} for v in f['variants']]
        w("Maps (one is drawn as the floor begins, from a bag per floor; a saved floor keeps its own):\n")
        for m in maps:
            roads=[str(plen(p)) for p in m['paths']]
            for fd in m.get('forks') or []: roads[fd['gate']]+='/%d'%blen(m,fd)
            w("- **%s**: road %s%s%s"%(m['n'],', '.join(roads),' · fork' if m.get('forks') else '',(' · lamp at %s'%m['lamp']) if m['lamp']!=f['lamp'] else ''))
        w("")
    names=(D.get('WAVE_NAMES') or [[]]*99)[i]
    deck=(D.get('DECKS') or [[]]*99)[i]
    grp=lambda wave:' + '.join('%s× %s'%(g[1],D['FOES'][g[0]]['n']) for g in wave)
    fixed=lambda wave:any(g[0] in ('boss','boss2','elite') for g in wave)
    for k,wave in enumerate(f['waves']):
        w("- Wave %d%s: %s%s"%(k+1,(' · *%s*'%names[k]) if k<len(names) else '',grp(wave),' **(fixed)**' if fixed(wave) else ''))
        for c in deck:
            if k in c['at']: w("  - or *%s*: %s"%(c['n'],grp(c['w'])))
    w("")
w("Boss entrances: %s.\n"%('; '.join('%s (%s): “%s”'%(v['name'],k,v['sub']) for k,v in D['BOSS_INTRO'].items())))
open(sys.argv[2],'w').write('\n'.join(L)+'\n')
print('wrote',sys.argv[2])
