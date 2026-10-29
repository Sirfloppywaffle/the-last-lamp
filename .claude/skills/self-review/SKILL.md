---
name: self-review
description: Fill-in template for the review comment Claude posts on its own Last Lamp PRs (AGENTS.md §2 shape), plus a checklist of the AGENTS.md §6 traps to run against the diff. Use after opening a PR, or when reviewing anyone's PR.
---

# Self-review

Gemini and Jules are paused (`AGENTS.md` §1), so Claude reviews its own PRs. Be as hard on the diff as on a stranger's. **Don't comment `/gemini`** unless Criss asks.

## 1. Run the diff against §6

`npm run check` catches `hash()` arity, inline handlers, external scripts, and `pointerdown` dismissal on `#mapOverlay`/`#modal`/`#bossCard` only. Check the rest by reading `git diff origin/main`. Rule text: `AGENTS.md` §6; town rules: runbook §2.

- [ ] **`hash(a,b,s)` has three arguments** everywhere the diff calls it (rule 11).
- [ ] **Overlays and cards dismiss on `click`**, not `pointerdown`, including any new town card or button (rule 5).
- [ ] **Developer mode never writes** (rule 24): `ll-town` only through `townData()`/`townSave()`; no `store.set` of `ll-meta`, `ll-codex` or `ll-town` while `devOn`. Is there a test that turns dev mode on and checks nothing was written?
- [ ] **New stair rolls** use `seeded(SALT.<new>,…)`, with the salt added **at the end** of `SALT` (rule 11b; next free number in runbook §2.5). Town effects on the stair filter *after* the roll.
- [ ] **No per-frame allocations** in `frame()`, `update()`, `townStep()`, `townDraw()` or anything they call: no `.slice()`, `.filter()`, `.map()`, spreads or new objects per creature or per tile (rule 17).
- [ ] **Nothing shifts when it appears** (rule 2): new UI keeps a fixed size, and `devices.test.js` compares rects before and after.
- [ ] **Safe areas** (rule 3): new controls sit inside `env(safe-area-inset-*)`; check `ip15-land` in the shots.
- [ ] **Saves** (rule 15): new `ll-town` fields have defaults in `townFix()`; new `run` fields have a default for an old save (`resumeFrom()`); nothing renamed or removed.
- [ ] **Teach it** (rule 23): tip, `#rulesList` line, Grimoire entry if needed.
- [ ] **Balance** (rule 22): every new or changed number listed in the PR, old → new.
- [ ] The rest of §6 the diff touches: deferred reads (10), `F.foes` loops (12), `dt` ≤ 0.05 and real time for overlays (14), unit space and `DPR` (19, 20), prefixed CSS classes (7), the `hidden` attribute (8), voice (21).

## 2. Post this as a PR comment

```
**Verdict:** Approve | Approve with changes | Request changes

**Strongest objection:** <the single biggest risk or doubt. Nothing found?
Name what you tried hardest to break and why it held.>

**Bugs:** <file/function, what goes wrong, how to reproduce. "None found" only
after the §6 pass above.>

**Design:** <better for Criss on a folded Fold? Simpler or bolder way?
Does it fight a decision in AGENTS.md §1?>

**Checked:** <what you actually did: tests run and their result, shots
looked at, code paths traced, old save resumed, dev mode on.>
```

Praise: one sentence at most. If the review finds a bug, fix it before asking Criss to play the preview.
