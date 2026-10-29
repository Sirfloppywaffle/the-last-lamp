---
name: steward
description: Conventions for Claude's own pull requests on The Last Lamp - PR body shape, the self-review while Gemini is paused, no /gemini, balance changes old → new, short text for Criss on his phone. Use when opening, updating or driving one of Claude's PRs to merge.
---

# Claude's PRs on this repo

Source: `AGENTS.md` §1 (paused reviewers), §3 (workflow) and `CLAUDE.md`. Criss merges; a merge is the green light. Never push to `main`.

**Opening**
- [ ] Branch `claude/<topic>` from `origin/main` (Saltmouth steps: `claude/town-<topic>`). One topic per PR. Draft.
- [ ] Body, short, in this order (runbook §4.6):
  - **Try this first:** numbered, what Criss taps on his Fold in the preview.
  - **What and why:** plain words, a few lines.
  - **How it was tested:** commands and results; the screenshots (`shots` skill).
  - **Risks.**
  - **Balance changes:** every new or changed number, `old → new`, or "none" (rule 22).
  - Link the issue (`Closes #n`) when there is one.
- [ ] Keep it short. Criss reads on his phone: lead with what changed and what to try; no walls of text, no tables he has to scroll sideways.

**Reviewing**
- [ ] Gemini and Jules are paused, so post a **self-review** comment in the §2 shape (`self-review` skill) right after opening.
- [ ] **Never comment `/gemini`** unless Criss asks: its quota is small. Criss comments `/gemini re-review` himself. When Gemini is back, ask him whether to re-review what merged without it.
- [ ] A reviewer's point gets a fix or a reasoned reply. A disagreement after one round each becomes a **Decision needed** comment for Criss (`AGENTS.md` §1).

**Keeping it green**
- [ ] CI is `checks.yml` (`npm test`). Reproduce a failure locally first (`test-setup` skill). `winch.test.js` is the one known flake.
- [ ] A behaviour change that breaks a test: update the test and say so in the PR; never weaken or delete one to pass.
- [ ] Every push that changes behaviour updates the HISTORY line and, if needed, the PR's *Try this first*.

**After the merge**
- [ ] `CLAUDE.md` Releases: artifact mirroring is paused, and during Expansion 3 the Unreleased lines in `docs/HISTORY.md` wait for step 10.
- [ ] Reply to Criss with what to try next and, for a runbook step, the next step's prompt.
