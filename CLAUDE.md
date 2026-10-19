# CLAUDE.md

**Read `AGENTS.md` first.** It's the shared brief for both AIs and it's authoritative. This file only adds what's specific to Claude.

## Your seat
You're the engineer and QA on this project. Gemini, working through Jules, is your peer and your reviewer. Criss is the owner, and his merge is the green light.

## Every session
1. Read `AGENTS.md`, then skim the latest entries in `docs/HISTORY.md`.
2. Check open PRs and issues (`gh pr list`, `gh issue list`) before starting anything, so you pick up where things left off.
3. Work on `claude/<topic>` branches. Never commit to `main`.

## Building and testing
- `cd tests && npm install && npx playwright install chromium`, then `npm test`. The suite covers UI flows, mechanics, the roguelike walkthrough, the descent map, touch behaviour and 14 device sizes.
- For UI changes, also look at the device screenshots that `npm run shots` writes to `tests/.build/shots/`, and post the relevant ones in the PR. Criss reads PRs on his phone.
- After changing any data table, run `npm run design` and commit the regenerated `docs/DESIGN.md`.

## Reviewing Jules's PRs
- Review with the shape in `AGENTS.md` §2. Run the suite against the PR branch, and check the mobile layouts yourself.
- Put requested changes in a review comment that starts with **@Jules**, numbered, so Jules can answer point by point.
- Be as critical as you'd want Gemini to be with you.

## Your PRs get reviewed by Gemini
- **Paused:** Gemini and Jules are off the project for now (see `AGENTS.md` §1). Post a self-review in the §2 shape on each PR instead; when Gemini returns, ask it to `/gemini re-review` anything merged without it.
- The `gemini-review` workflow runs only when a trusted person comments `/gemini` on the PR; it doesn't review on open. Don't comment `/gemini` yourself unless Criss asks, because its quota is small. Criss comments `/gemini re-review` when he wants a review.
- Take its objections seriously. Agree and fix, or answer with evidence.

## Handing work to Jules
- Open an issue with the **Task for Jules** template, or add the `jules` label. Write the goal, the constraints that matter (cite `AGENTS.md` rules), and how it'll be judged.

## Releases
- **Version numbers** (details in `AGENTS.md` §3): three numbers, always. Last = bug fixes and small tweaks. Middle = a new part of an ongoing feature (last resets to 0). First = a finished arc or a big change (others reset to 0). Bump once per release; the biggest change in the batch wins.
- When Criss merges, mirror `index.html` to the claude.ai artifact (`python3 tools/build-artifact.py` writes the artifact body to `tests/.build/artifact.html`; publish it to https://claude.ai/artifact/PP2gyEZiPauEoEpbuM5Se7), then move the Unreleased notes in `docs/HISTORY.md` under a new version.

## Talking to Criss
Short and direct. Lead with what changed and what he should try. He's on a phone.
