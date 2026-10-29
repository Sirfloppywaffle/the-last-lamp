# expansion/ — the sandbox

This folder is where we design and prototype the expansion. **Nothing here is part of the game.**

Rules (on top of `AGENTS.md`):
- **No changes to `index.html`, `tests/`, `tools/` or `.github/`** in expansion work until Criss says an idea graduates. Graduating means a normal feature PR against `index.html`, reviewed as usual.
- **Prototypes are copies.** Copy `index.html` to `expansion/proto/<idea>.html` (or write a small standalone page), and set `window.LL_STORE_NS='exp-<idea>:'` at the top so a prototype can never touch Criss's real save.
- **Graduated:** forked stairs (prototype 1) moved into the game in the "Forked stairs" PR; its sandbox scripts were retired then.
- PR previews only publish `index.html`, so prototypes won't show up on the preview link. Claude can publish a prototype as a claude.ai artifact for Criss to play on his phone.
- Design talk happens on the brainstorm PR and in `BRAINSTORM.md`. Edit the doc when the thread settles something.

**Docs here:** `SEEDS-AND-MINI-FLOORS.md` (Expansion 2, shipped as v18.6.0 to v18.9.0), `EXPANSION3_TOWN.md` (Expansion 3, Saltmouth Above: shipped as v19.0.0), `EXPANSION5_PROGRESSION.md` (Expansion 5, Progression: in design; follows Expansion 4, Customization).
