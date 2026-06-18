# Phase 0 — RAI OS backend on Google Cloud (Singapore)

One GCP VM hosts **Supabase** (DB + auth + PostgREST) and the **RAI LLMs gateway**.
Cloudflare Workers stays the frontend/edge and calls this backend.

> **Why Singapore:** Anthropic does not serve requests originating from Vietnam —
> that is why the gateway 403'd/502'd. `asia-southeast1` (Singapore) reaches
> Anthropic and is the lowest-latency supported region for VN users.

Legend: 🟦 = **you** (account/billing/DNS — I can't do these) · 🤖 = **me** (I run these over `gcloud`/SSH from your machine).

---

## What you do once (🟦)
1. Create a GCP project, **enable billing** (the $300 free credit covers the first ~3 months).
2. Install the CLI and sign in **on this machine**:
   ```bash
   # macOS:  brew install --cask google-cloud-sdk
   gcloud auth login
   gcloud config set project <YOUR_PROJECT_ID>
   ```
3. Tell me when that's done — then everything below is me.

---

## P0 🤖 Provision the VM
```bash
bash deploy/gcp-provision.sh        # creates static IP + firewall + e2-standard-4 VM
```
Prints the VM's static IP.

## P1 🟦 DNS (Cloudflare) — point at the printed IP, **DNS-only (grey cloud)**
| Name | Type | Value |
|---|---|---|
| `api`    | A | `<VM_IP>` | Supabase (Kong) |
| `studio` | A | `<VM_IP>` | Supabase Studio (locked) |
| `llms`   | A | `<VM_IP>` | RAI LLMs gateway |

Grey cloud is required so Caddy can issue Let's Encrypt certs on first run.

## P2 🤖 Bring up Supabase + gateway (on the VM)
I SSH in (`gcloud compute ssh rai-os --zone asia-southeast1-b`), copy the repo's
`infra/supabase/` + `gateway/` up, then follow `infra/supabase/SETUP.md` (Supabase
overlay + Caddy + key gen) and run `gateway/deploy.sh` (gateway + its Postgres).

## P3 🤖 Apply the workspace schema + expose it to PostgREST
- Run the SQL into Supabase Postgres, in order: `infra/supabase/sql/01_schemas.sql`
  … `05_workspace.sql`.
- Add `workspace` to **`PGRST_DB_SCHEMAS`** in the Supabase `.env`
  (e.g. `public,storage,graphql_public,workspace`) and restart the `rest` container.

## P4 🤖 Wire the Cloudflare Worker to the DB
On the `raiholdings` Worker:
- `SUPABASE_URL` = `https://api.raiholdings.vn`  (var — non-secret)
- `SUPABASE_SERVICE_ROLE` = the service-role key from `gen-keys.mjs`  (**Secret**)

That single step flips the workspace from localStorage to Postgres — ventures,
multi-org RBAC and the wallet/usage ledger all go live (no code change).

## P5 🤖 Turn on real AI (unblocks Venture Builder + payments)
- Put an upstream key (e.g. `ANTHROPIC_API_KEY`) in the gateway `.env` on the VM.
- On the Worker set `RAI_LLMS_BASE=https://llms.raiholdings.vn` + `RAI_LLMS_API_KEY` (Secret).
- `workspace-ai.ts` already prefers the gateway → ventures produce real content.

---

## Verify (🤖)
- `https://api.raiholdings.vn/rest/v1/` responds (Supabase up).
- `https://llms.raiholdings.vn/health` + `/models` 200 (gateway up, reaches Anthropic).
- `GET /api/workspace/v0/bootstrap` on raiholdings.vn returns `{ db:true, … }`.
- Create a venture → it persists across devices; top-up writes a ledger row.

## What I cannot do (🟦 only)
Create the cloud account, enter payment details, or click the GCP/Cloudflare web
consoles. Everything scriptable (gcloud, ssh, docker, SQL, wrangler) I drive from here.
