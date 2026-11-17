# Multiplayer Worker setup

This Worker relays low-frequency movement and attack events for two-player rooms. It uses a SQLite-backed Durable Object, which is supported on Cloudflare's Workers Free plan. Free-plan limits apply; when a limit is exceeded, requests fail until the quota resets.

## Deploy

1. Create a free Cloudflare account and install a current Node.js release if needed.
2. In Terminal, open this `worker` folder.
3. Run `npx wrangler@latest login` and finish the Cloudflare login in your browser.
4. Run `npx wrangler@latest deploy`.
5. Copy the Worker address printed by Wrangler. It will look like `https://gabriel-vs-hamsa-multiplayer.<your-account>.workers.dev`.
6. Paste that address into the **Online Match** Worker URL field on the game page. The game remembers it in that browser.
7. Both players open the published game. The first selects a fighter and clicks **Create room**, then shares the displayed code. The second selects the other fighter, enters the code, and clicks **Join room**.

No API token needs to be added to the game. Wrangler authenticates through Cloudflare's browser sign-in. Keep the Worker on the Free plan to avoid paid usage; over-quota operations will fail instead of being billed on that plan.

## GitHub Pages

The workflow at `.github/workflows/pages.yml` publishes the game from the repository root on pushes to `main`. Create a **public** GitHub repository on the GitHub Free plan, upload the contents of this game folder, and set **Settings → Pages → Build and deployment → Source** to **GitHub Actions**. After the workflow succeeds, the Pages URL is shown in the workflow run and in Pages settings.

The GitHub Pages copy is the public game. Only include files you are comfortable making public.
