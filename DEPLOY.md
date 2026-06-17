# Deploy — RAI Holdings OS on Cloudflare Workers (push-to-deploy)

This app is **Next.js 16 (SSR + 26 API routes + env)** — not a static export — so it
runs on **Cloudflare Workers** via the **OpenNext** adapter (`@opennextjs/cloudflare`).
Every push to GitHub `main` → **Cloudflare Workers Builds** rebuilds and redeploys
automatically. The domain stays on **Cloudflare DNS**.

> Verified locally on Cloudflare's `workerd` runtime (`npm run cf:preview`) with
> Next 16.2.9 + OpenNext 1.19.11 — all routes + APIs return 200, no Error 1101.

## What's already configured
- `wrangler.jsonc` — Worker `rai-holdings-os`, `nodejs_compat`, assets binding, self-reference.
- `open-next.config.ts` — minimal (no R2; the app uses no ISR/revalidate).
- `package.json` scripts — `cf:preview`, `cf:deploy`, `cf-typegen`.
- `.gitignore` — ignores `.open-next/`, `.wrangler/`, `.dev.vars`, `cloudflare-env.d.ts`.
- `.node-version` → `22` (Workers Builds uses Node 22).
- Git initialized with an initial commit.

## 1. Push to GitHub (private)
Create an empty **private** repo on GitHub (no README), then:
```bash
cd "/Users/phamvanthu/Documents/RAI Holdings OS"
git branch -M main
git remote add origin git@github.com:<you>/rai-holdings-os.git   # or https://...
git push -u origin main
```

## 2. Connect the repo to Cloudflare Workers Builds (push-to-deploy)
Cloudflare dashboard → **Workers & Pages → Create → Workers → Import a repository**
→ authorize GitHub → select the repo. Set:
- **Build command:** `npx opennextjs-cloudflare build`
- **Deploy command:** `npx wrangler deploy`
- **Root directory:** `/`

Save. Cloudflare builds & deploys; from now on **every push to `main` auto-deploys**.
First deploy gives a URL like `https://rai-holdings-os.<your-subdomain>.workers.dev`.

## 3. (Optional) AI key — for real AI drafting (Enterprise/Pricing/Portfolio/Platform)
Without it, the AI pipelines fall back to deterministic templates (app still works).
```bash
npx wrangler secret put ANTHROPIC_API_KEY      # paste the key when prompted
```
…or dashboard → the Worker → **Settings → Variables and Secrets → Add (Secret)**.

## 4. Custom domain (DNS already in Cloudflare)
The Worker → **Settings → Domains & Routes → Add → Custom Domain** →
`raiholdings.vn` (and `www.raiholdings.vn`). Cloudflare auto-creates the DNS record
and TLS cert — no manual CNAME needed since the zone is in the same account.

## Local commands
```bash
npm run dev          # Next dev server (http://localhost:4173) — day-to-day work
npm run cf:preview   # build + run the real Worker locally on workerd (parity check)
npm run cf:deploy    # manual build + deploy (bypasses CI)
npm run cf-typegen   # regenerate cloudflare-env.d.ts after editing wrangler.jsonc
```

## Notes / production gaps (by design)
- App state (admin edits, review queues, reviews) is **client-side localStorage** —
  there is no database yet. For multi-user/persistent data, add D1/KV/Postgres + APIs.
- `/admin/*` routes are **not auth-gated** — add access control before public launch
  (e.g. Cloudflare Access in front of `/admin/*`).
- No ISR/revalidate is used; if you add it later, configure an **R2 incremental cache**
  in `open-next.config.ts`.
