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
            w("\n**%s (`%s`, %s)**\n\n| Branch | Tier 1 | Tier 2 | Tier 3 (capstone) |\n|---|---|---|---|"%(esc(D['KIT_WARDS'][kk][wk]['n']),kk,'replaces '+wk))
            for b in tree: w("| %s | %s |"%(b['n'],' | '.join('%s — %s'%(c,esc(t)) for c,t in b['t'])))
    if 'CORPSE_REACH' in D: w("\nOccultist numbers: a Corpse Candle costs nothing, needs no lamp, stands within **%s** tiles of a body from this floor (one body per candle) and goes out when the wave breaks. A death within **%s** tiles of a pile joins it; a pile holds **%s**, a death beside a full one scatters, and a floor keeps the freshest **%s** bodies. The first floor of an Occultist descent starts with two piles. A Bone Spear deals **+%d%%** per tier of madness (Dread adds **+%d%%** per tier per level). Horrors deal **+%d%%** per tier. Unbind charges at **%s** tiles a second, dealing **%s + %s × the horror's madness** to each creature it passes, and stuns for 1s (bosses 0.3s, Behemoths not at all)."%(D['CORPSE_REACH'],D['PILE_GATHER'],D['PILE_MAX'],D['BODY_MAX'],round(D['SPEAR_TIER']*100),round(D['DREAD_TIER']*100),round(D['HORROR_TIER']*100),D['UNBIND_SPD'],D['UNBIND_BASE'],D['UNBIND_PER']))
    if 'POT_R' in D: w("\nWhaler numbers: a Blubber Lamp burns **+%s** light; while any stands, each wave costs 1 oil unless a Try-pot has a measure. The Try-pot reaches **%s** tiles; each death gives up its oil value (at most %s); every **%s** makes a measure; it holds **%s**, and a full pot pours 1 oil into the lamp instead. The line slows by **%s** a second held, up to **%s**%%; Reel In hauls back 1 tile every **%ss**."%(D['BLUBBER_LIGHT'],D['POT_R'],D['POT_MEASURE'],D['POT_MEASURE'],D['POT_MAX'],D['TETHER_RATE'],int(D['TETHER_MAX']*100),D['HAUL_EVERY']))
    w("\nNumbers: Signal Candle light leaps **%s** tiles. A flare bolt lights **%s** tiles for **%ss** (at most %s at once); a Starshell lights **%s** tiles for **%ss**. A Fire Thread kindles what crosses it for **%ss**. Kindle burns **%ss**, lights **%s** tiles, deals **%s** damage a second, and the creature moves **×%s** (bosses don't hurry)."%(D['LEAP'],D['GLINT_R'],D['GLINT_T'],D['GLINT_MAX'],D['STAR_R'],D['STAR_T'],D['THREAD_T'],D['KINDLE_T'],D['KINDLE_R'],D['KINDLE_DPS'],D['KINDLE_RUN']))

w("\n## Relics\n\n| Key | Name | Cursed | Pack | Effect |\n|---|---|---|---|---|")
for k,v in D['RELICS'].items(): w("| `%s` | %s | %s | %s | %s |"%(k,esc(v['n']),'yes' if v.get('curse') else '',v.get('pack','base'),esc(v['d'])))
if D.get('RELICS_RESTING'): w("\n**Resting while patrons are tested** (#29, `RELICS_RESTING`): %s. They are never offered; a run that carries one keeps it."%', '.join(esc(D['RELICS'][k]['n']) for k in D['RESTING']))

if D.get('PATRONS'):
    w("\n## Patrons\n\nAt the landing the gift is a patron's offering instead, half the time (a quarter if one already reached out on that floor); between waves one reaches out at **%d%%** of breaks (once a floor). Take one or refuse. Each gift is +1 Attention.\n"%round(D['PATRON_BREAK']*100))
    for pk,P in D['PATRONS'].items():
        w("**%s** (`%s`): %s\n"%(esc(P['n']),pk,esc(P['d'])))
        w("| Attention | Tier | What changes |\n|---|---|---|")
        for t in P['tiers']: w("| %s | %s | %s |"%(t['at'],t['n'],esc(t['d'])))
    w("\nWater numbers: current **×%s**; a floor floods **%s** stretches of **%s** tiles; it rises to at most **%s** tiles; \"beside water\" is within **%s** tiles."%(D['CURRENT'],D['FLOOD_N'],D['FLOOD_LEN'],D['FLOOD_MAX'],D['NEAR_WATER']))
    w("\n| Key | Offering | Patron | Kit | Effect |\n|---|---|---|---|---|")
    for k,v in D['OFFERINGS'].items(): w("| `%s` | %s | %s | %s | %s |"%(k,esc(v['n']),v['p'],v.get('kit',''),esc(v['d'])))

w("\n## Omens (on stair doors)\n\n| Key | Name | Effect |\n|---|---|---|")
for k,v in D['OMENS'].items(): w("| `%s` | %s | %s |"%(k,v['n'],esc(v['d'])))

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
