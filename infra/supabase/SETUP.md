# Supabase self-host for RAI OS — DevOps runbook (Phase A)

Stand up Supabase (Postgres + GoTrue Auth + PostgREST + Storage + Realtime + Studio)
on **your own VPS** behind **Caddy** with your own domains. Only the API gateway is
public; Postgres is never exposed; Studio is locked behind IP allowlist + basic-auth.

```
api.raiholdings.vn     → Kong gateway (Supabase)   [public, SSL]
studio.raiholdings.vn  → Studio                     [locked: IP allowlist + basic auth]
admin.raiholdings.vn   → RAI Admin (Refine, Phase B — deployed separately)
```

Legend: 🟦 = you (DevOps) · 🧑‍💻 = already prepared in this repo (`infra/supabase/`).

---

## A0 🟦 Provision a VPS
- **OS:** Ubuntu 24.04 LTS. **Size:** start ≥ **4 vCPU / 8 GB RAM / 80 GB SSD**
  (e.g. Hetzner CPX31, DigitalOcean 8GB, Vultr HF). Disk-backed, not ephemeral.
- Open firewall ports **80** and **443** only (SSH 22 restricted to your IP).
- Install Docker + Compose:
  ```bash
  curl -fsSL https://get.docker.com | sh
  sudo usermod -aG docker $USER   # re-login after this
  docker --version && docker compose version
  ```

## A2 🟦 DNS (Cloudflare)
Create A records → your VPS IP:
| Name | Type | Value | Proxy |
|---|---|---|---|
| `api` | A | `<VPS_IP>` | **DNS only (grey cloud)** so Caddy can issue Let's Encrypt |
| `studio` | A | `<VPS_IP>` | DNS only |

(You can switch `api` to proxied/orange later once it's stable; keep grey for first issuance.)

## A1 🧑‍💻→🟦 Get the Supabase stack + apply the RAI overlay
On the VPS:
```bash
# 1) Clone upstream Supabase docker stack (pinned, shallow)
git clone --depth 1 https://github.com/supabase/supabase
cd supabase/docker
cp .env.example .env

# 2) Copy RAI overlay files from this repo (infra/supabase/) onto the VPS, e.g. via scp/git:
#    - .env.rai.example   → merge its values into ./.env
#    - Caddyfile          → ./Caddyfile
#    - gen-keys.mjs       → ./gen-keys.mjs
#    - sql/*.sql          → ./rai-sql/
```

## A3 🟦 Generate secrets & fill `.env`
**Change EVERY default secret.** Generate them:
```bash
# strong passwords / jwt secret
openssl rand -base64 48   # use for POSTGRES_PASSWORD
openssl rand -base64 48   # use for JWT_SECRET  (must be ≥ 32 chars)

# derive ANON_KEY + SERVICE_ROLE_KEY from the JWT_SECRET:
JWT_SECRET="<paste the jwt secret above>" node gen-keys.mjs
```
Set in `./.env` (key ones — see `.env.rai.example` for the full list):
- `POSTGRES_PASSWORD`, `JWT_SECRET`, `ANON_KEY`, `SERVICE_ROLE_KEY`
- `DASHBOARD_USERNAME`, `DASHBOARD_PASSWORD` (Studio basic gate)
- `SITE_URL=https://raiholdings.vn`, `API_EXTERNAL_URL=https://api.raiholdings.vn`
- `SUPABASE_PUBLIC_URL=https://api.raiholdings.vn`
- `ADDITIONAL_REDIRECT_URLS=https://raiholdings.vn,https://admin.raiholdings.vn`
- `SMTP_*` (for auth emails)
- `PGRST_DB_SCHEMAS=public,iam,cms,ai,shared,apps,mcp,marketplace,code,enterprise,pricing,platform,portfolio,home`
- Custom-claims hook: `GOTRUE_HOOK_CUSTOM_ACCESS_TOKEN_ENABLED=true`,
  `GOTRUE_HOOK_CUSTOM_ACCESS_TOKEN_URI=pg-functions://postgres/public/custom_access_token_hook`

## A3 🟦 Start the stack + Caddy
Add a Caddy service (see `Caddyfile`) — easiest is a separate tiny compose, or add a
`caddy` service to the Supabase compose on the same Docker network. Then:
```bash
docker compose up -d --wait
docker compose ps          # all services should be healthy
```
Caddy auto-issues SSL for `api.` and `studio.` on first request.

## A4 🧑‍💻→🟦 Apply RAI SQL (schemas + RBAC + auth hook + RLS)
Run the migration files in order against the stack's Postgres:
```bash
for f in rai-sql/0*.sql; do
  echo ">> $f"; docker compose exec -T db psql -U postgres -d postgres -v ON_ERROR_STOP=1 -f - < "$f";
done
```
This creates the module schemas, the `iam` RBAC tables, the GoTrue custom-access-token
hook (adds `role`/`org_id` claims), and the RLS pattern. (Data migration of existing
RAI content = A6, added later.)

## A5 🟦 Lock down + back up
- **Studio:** the `Caddyfile` restricts `studio.raiholdings.vn` to an IP allowlist +
  basic auth — set your office/VPN IPs there. Never expose Studio publicly (it has **no
  RBAC**).
- **Postgres:** stays internal to the Docker network (no published 5432). Do **not** add
  a public port for `db`.
- **Backups:** schedule nightly `pg_dump` + offsite copy:
  ```bash
  # crontab -e
  0 2 * * * cd /home/<you>/supabase/docker && docker compose exec -T db pg_dump -U postgres postgres | gzip > /backups/rai-$(date +\%F).sql.gz
  ```
  Test a restore monthly. Consider WAL/PITR later (wal-g) for RPO < 1 day.
- **Updates:** periodically `git pull` upstream + re-`up -d` to get patched images.

## A8 🧑‍💻→🟦 Connect RAI to Supabase
- **Public site / Admin (client):** `NEXT_PUBLIC_SUPABASE_URL=https://api.raiholdings.vn`,
  `NEXT_PUBLIC_SUPABASE_ANON_KEY=<ANON_KEY>` — RLS-protected.
- **Server-side (Core/jobs):** `SUPABASE_SERVICE_ROLE_KEY=<SERVICE_ROLE_KEY>` — bypasses
  RLS; **server-only**, never shipped to the browser (set as a secret in Cloudflare /
  the VPS, not in client env).

---

### Done when
- `https://api.raiholdings.vn/rest/v1/` responds (with `apikey` header).
- `https://studio.raiholdings.vn` reachable only from allowed IPs, behind basic-auth.
- `psql` shows the module schemas + `iam` tables; logging in returns a JWT with
  `role`/`org_id` custom claims; backups run.
