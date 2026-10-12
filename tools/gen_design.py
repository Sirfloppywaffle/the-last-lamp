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
    w("| `%s` | %s | %s | %s | %s | %s | %s |"%(k,v['n'],', '.join(v['wards']),', '.join(v['rites']),', '.join('%s×%s'%(a,b) for a,b in v['roster'].items()) or '—',('Ember Hall (`%s`)'%v['lock']) if v.get('lock') else 'open',esc(v['d'])))

w("\n## Relics\n\n| Key | Name | Cursed | Pack | Effect |\n|---|---|---|---|---|")
for k,v in D['RELICS'].items(): w("| `%s` | %s | %s | %s | %s |"%(k,esc(v['n']),'yes' if v.get('curse') else '',v.get('pack','base'),esc(v['d'])))

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
for i,f in enumerate(D['FLOORS']):
    w("### %d. %s\n"%(i+1,f['name']))
    w("Stipend **%s** essence · %d gate%s · hue %s\n"%(f['stipend'],len(f['paths']),'s' if len(f['paths'])>1 else '',f.get('hue')))
    for k,wave in enumerate(f['waves']):
        w("- Wave %d: %s"%(k+1,' + '.join('%s× %s'%(g[1],D['FOES'][g[0]]['n']) for g in wave)))
    w("")
w("Boss entrances: %s.\n"%('; '.join('%s (%s): “%s”'%(v['name'],k,v['sub']) for k,v in D['BOSS_INTRO'].items())))
open(sys.argv[2],'w').write('\n'.join(L)+'\n')
print('wrote',sys.argv[2])
