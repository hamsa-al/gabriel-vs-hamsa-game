# Gabriel vs Hamsa — Character Edition

Open `index.html` in a modern browser to play. The fight view fills the browser window with the approved underground fight-club background. Each fighter’s portrait sits beside their life bar in a translucent HUD layered over the arena.

- Choose a character on the entry screen.
- On phones and touch screens, use the left/right arrows to move and the Jab, Kick, and Block buttons to fight. Movement is relative to the selected character, so Forward always moves toward the opponent.
- On desktop, move with **←/→** or **A/D**; **J** = jab, **K** = kick, **L** = block.
- **1/2** switches the fighter you control; **R** resets the match; **Escape** returns to character select.
- Both fighters use the matching 1060 × 1484 transparent PNG artwork in `assets/` for their master stance, attacks, defense, walks, hit recoil, and pain reaction.
- Local play works without an internet connection. Online rooms use the optional Cloudflare Worker described in `worker/README.md`.
- For online games, choose your fighter, paste the Worker URL, create a room, and share its six-character code. Your opponent chooses the other fighter and joins with that code.
- GitHub Pages and Cloudflare deployment steps are in `worker/README.md`.
