# Step 6c: the Cistern in detail, candidates

Sheets 1 to 8 are posted on the PR. raw/ holds every candidate as PixelLab made it (tiles, the cut-out channel, slabs raw and graded,
props numbered as on the sheets); picks.json has each one's PixelLab job. tools/ is the scratch harness that laid them in the game
(paths are the session's scratchpad): build.js makes a hooked page, shot.js renders the board canvas, painter.js is paintBoardPixel
with 64 px tiles, a floor of slabs under the cut-out channel, and prop layers; chan.py cuts a pro set's floor away.
