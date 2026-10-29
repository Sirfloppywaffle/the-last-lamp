---
name: shots
description: Which device screenshots to post on a Last Lamp PR, and how to publish them from an orphan claude/shots-<topic> branch as raw.githubusercontent.com links Criss can open on his phone. Use for any PR that changes UI.
---

# Screenshots for a PR

Why: Criss reads PRs on his phone (`CLAUDE.md`). The workflow is runbook §4.5.

- [ ] **Make them:** `cd tests && npm run shots` (or the full `npm test`). They land in `tests/.build/shots/devices/` as `<scene>-<device>.png`; each scene's prefix is in its `p.screenshot(...)` call in `tests/t/devices.test.js`.
- [ ] **Look at them yourself** before posting. Anything cut off, covered, or sitting in a notch is a bug to fix first.
- [ ] **Post these devices** (the `DEV` list in `devices.test.js`), for each scene the PR changes:
  - `fold-closed`: folded Fold, portrait (412×860)
  - `fold-closed-land`: folded Fold, landscape (915×356)
  - `fold-open`: unfolded Fold (832×694)
  - `ip15-land`: iPhone sideways, with its notch insets (852×342)
  Add another only if it shows something these don't.
- [ ] **Push to an orphan branch** (never the PR branch, never merged), from the repo root:
  ```bash
  T=<topic>; D=$(mktemp -d)/shots; S=$PWD/tests/.build/shots/devices
  git worktree add --orphan -b claude/shots-$T "$D"
  mkdir -p "$D/$T" && cp "$S"/<scene>-{fold-closed,fold-closed-land,fold-open,ip15-land}.png "$D/$T/"
  printf '# Screenshots for the %s PR\n\nNever merge this branch. It only holds images linked from the PR.\n' "$T" > "$D/README.md"
  git -C "$D" add -A && git -C "$D" commit -m "Screenshots for claude/$T" && git -C "$D" push -u origin claude/shots-$T
  git -C "$D" rev-parse HEAD; git worktree remove "$D"
  ```
  An earlier `claude/shots-<topic>` exists? Pick a new topic name rather than force-pushing.
- [ ] **Link them** in the PR body by commit sha, so a later push can't change what Criss sees:
  `![Fold, folded](https://raw.githubusercontent.com/Sirfloppywaffle/the-last-lamp/<sha>/<topic>/<file>.png)`. Say in a few words what each one shows.
