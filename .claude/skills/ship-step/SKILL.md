---
name: ship-step
description: Checklist for building and shipping one Expansion 3 (Saltmouth) step, or any feature PR, on The Last Lamp, from branch to PR to the next step's prompt. Use when asked to build a runbook step or ship a feature.
---

# Ship a step

The workflow is `expansion/EXPANSION3_RUNBOOK.md` §4; the rules are its §2 and `AGENTS.md` §3 and §6. This is the checklist. Read those for the why.

- [ ] **Read** `AGENTS.md`, `CLAUDE.md`, runbook §2–§4 and the step's §5 entry, `expansion/EXPANSION3_TOWN.md` §0.
- [ ] **Open work first:** `gh api 'repos/Sirfloppywaffle/the-last-lamp/pulls?state=open'` and `.../issues?state=open` (`gh pr list` needs GraphQL, which the cloud session can't reach). The previous step must be merged.
- [ ] **Branch** from `origin/main`: `git fetch origin main && git checkout -b claude/town-<topic> origin/main`.
- [ ] **Build** to the spec, inside the Saltmouth section and the seams runbook §2.1 names. Patterns: the `town-patterns` skill.
- [ ] **Teach it** (rule 23, runbook §2.6):
  - [ ] a `TIPS` entry (`where:'town'` for the town, shown by `townShowTip()`);
  - [ ] the `<li><b>Saltmouth.</b>…` line in `#rulesList` grows (a new `<li>` only for a big new system);
  - [ ] a Grimoire entry for any new creature, ward, rite, relic, kit or patron.
- [ ] **HISTORY:** one line under `## Unreleased` in `docs/HISTORY.md`, in the shape of the lines already there.
- [ ] **`GAME_VERSION`** (top of the script in `index.html`) set to the version in the status table (`AGENTS.md` §3, Version numbers).
- [ ] **`AGENTS.md` §5:** the Saltmouth row names every new function, table and field; **Storage keys** lists any new `ll-town` field.
- [ ] **Runbook §1:** tick the status table (PR number, state, version). Fix anything else in the runbook the step proved wrong (§6).
- [ ] **Test** (setup: the `test-setup` skill): the step's new test file, `devices.test.js` extended for any new button or panel, then `cd tests && npm test`. Changed a data table? `npm run design` and commit `docs/DESIGN.md`.
- [ ] **Screenshots:** the `shots` skill.
- [ ] **PR** (draft) and its body: the `steward` skill.
- [ ] **Self-review** comment: the `self-review` skill. No `/gemini`.
- [ ] **Reply to Criss:** short, what changed and what to try, then the next step's **Prompt** from runbook §5, adjusted for anything this step changed.
