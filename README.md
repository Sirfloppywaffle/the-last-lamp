# The Last Lamp

*Tend the last lamp at the bottom of a drowned stair. Things are climbing toward the light.*

A Lovecraftian tower-defense roguelike that runs in your browser. Built by **Criss** with two AIs: **Claude** (Anthropic) and **Gemini** (Google, working as Jules).

**▶ Play:** https://sirfloppywaffle.github.io/the-last-lamp/

It works on phones held upright or sideways, foldables, tablets and desktops. Your run saves automatically.

## How this project works
- **Criss** decides what the game becomes, plays every change, and gives the green light by **merging** a pull request.
- **Claude** and **Gemini/Jules** propose changes as pull requests and **review each other's work critically**. Every pull request also runs automated tests on 14 screen sizes.
- The full brief for the AIs is in [`AGENTS.md`](AGENTS.md). Design tables are in [`docs/DESIGN.md`](docs/DESIGN.md), and history in [`docs/HISTORY.md`](docs/HISTORY.md).

## For Criss: the quick version
- **Give Gemini a task:** New issue → **Task for Jules** → describe it. Jules picks it up automatically.
- **Give Claude a task:** tell Claude in chat, or open a **Task for Claude** issue and point Claude to it.
- **Green light:** open the pull request, tap its **▶ Play this version** link to try it on your phone (it has its own save), read the review conversation, and tap **Merge**.
- **Something broke:** New issue → **Bug report**. Screenshots help.
- **Test town building:** tap the title heading seven times to enable developer mode, then **Walk Saltmouth → Build → Dev +100 each**. Tap again for more timber, iron, tallow and curios. Materials and anything bought with them are temporary: reloading or leaving developer mode restores your saved town.
