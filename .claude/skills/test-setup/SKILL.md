---
name: test-setup
description: How to get The Last Lamp's headless test suite running in Claude's cloud container (no npm install needed), run one test, and handle the known winch.test.js flake. Use before running npm test, or when a test can't launch the browser.
---

# Running the tests in Claude's cloud container

What the suite covers and how tests are written: `AGENTS.md` §7. This is only about getting it to run here.

**Checked October 2026:** Node 22, Playwright 1.63 and Chromium are preinstalled. `require('playwright')` resolves through `NODE_PATH` (the global modules), and the browser is in `/opt/pw-browsers` (`PLAYWRIGHT_BROWSERS_PATH`).

- [ ] **Don't `npm install` or `npx playwright install`.** `tests/package.json` pins Playwright 1.56, which wants a Chromium build that isn't in `/opt/pw-browsers`; installing it makes `chromium.launch()` fail with "Executable doesn't exist". If `tests/node_modules` exists from an earlier try, delete it.
- [ ] Run from `tests/`:
  - `npm run check`: static checks only, a few seconds.
  - `npm test`: everything. It takes a while: run it in the background.
  - `node run.js --only <name>`: tests whose file name contains `<name>` (`--only map` runs `map` and `maps`). Static checks still run first.
  - `LL_MAPV=2 node run.js --only <name>`: the same on another map.
  - `npm run shots`: just `devices`, which writes the device screenshots (the `shots` skill).
- [ ] Results: `tests/.build/results.json`; screenshots under `tests/.build/shots/<test>/`.
- [ ] **Known flake:** `winch.test.js` fails about 1 run in 3 on `main` too. Rerun it alone (`node run.js --only winch`) before blaming your change; if it passes alone, say so in the PR.
- [ ] **Fails here, passes on CI** (checked on `main`, October 2026). This container's Chromium (153) is newer than the one CI installs for the pinned 1.56:
  - `devices`: "the stair's name and code on the pause and death screens" fails on every device. Its Copy button measures 55 px wide, and the test wants 56.
  - `smothering`: "the result card shows 600 ms or more after the walk ends" can miss by a few ms under the full run's load. It passes alone.
  If these are the only failures and your diff doesn't touch them, CI is the judge. Say so in the PR.
- [ ] **No browser at all** (Jules's VM, or a container without Chromium): run `npm run check`, say so in the PR, and rely on CI (`.github/workflows/checks.yml` runs `npm test` on every PR).

If any of this stops being true, fix this file and runbook §4 in the same PR.
