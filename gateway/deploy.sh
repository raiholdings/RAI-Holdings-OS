#!/usr/bin/env bash
# RAI LLMs Gateway — one-shot deploy for a fresh Ubuntu VPS.
# Usage:  bash deploy.sh
# Re-running is safe. It NEVER overwrites an existing .env.
set -euo pipefail
cd "$(dirname "$0")"

echo "==> 1/5 Docker"
if ! command -v docker >/dev/null 2>&1; then
  echo "Installing Docker…"; curl -fsSL https://get.docker.com | sh
fi

echo "==> 2/5 .env"
if [ ! -f .env ]; then
  gen() { openssl rand -hex "$1"; }
  ENC=$(gen 32); ADMIN=$(gen 16); DBPW=$(gen 12)
  cat > .env <<EOF
PORT=8080
NODE_ENV=production
DATABASE_URL=postgres://rai:${DBPW}@db:5432/rai_llms
POSTGRES_USER=rai
POSTGRES_PASSWORD=${DBPW}
POSTGRES_DB=rai_llms
REDIS_URL=redis://redis:6379
ENCRYPTION_KEY=${ENC}
ADMIN_TOKEN=${ADMIN}
FX_USD_VND=25400
DEFAULT_MARKUP_PERCENT=20
PUBLIC_BASE_URL=https://llms.raiholdings.vn
VAT_PERCENT=10
# ---- Fill these in (at least one upstream key for real answers) ----
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
GOOGLE_API_KEY=
DEEPSEEK_API_KEY=
SEARCH_API_KEY=
VNP_TMN_CODE=
VNP_HASH_SECRET=
VNP_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
MOMO_PARTNER_CODE=
MOMO_ACCESS_KEY=
MOMO_SECRET_KEY=
MOMO_ENDPOINT=https://test-payment.momo.vn/v2/gateway/api/create
EOF
  echo "    .env created."
  echo "    ┌──────────────────────────────────────────────────────────"
  echo "    │ SAVE THIS — ADMIN_TOKEN = ${ADMIN}"
  echo "    └──────────────────────────────────────────────────────────"
  echo "    Edit .env to add upstream provider keys (OPENAI/ANTHROPIC/…),"
  echo "    set PUBLIC_BASE_URL to your real domain, then re-run this script."
else
  echo "    .env exists — leaving it untouched."
fi

echo "==> 3/5 Build & start containers"
docker compose up -d --build

echo "==> 4/5 Wait for Postgres, run migrations"
sleep 8
docker compose exec -T gateway npm run migrate

echo "==> 5/5 Health check"
sleep 2
curl -fsS http://localhost:8080/health && echo

cat <<'NEXT'

Gateway is up on :8080 (behind your reverse proxy).
Next:
  1) Point a reverse proxy (Caddy) for your domain → localhost:8080 (TLS).
     See Caddyfile.example in this folder.
  2) Create the first account + API key (use the ADMIN_TOKEN above):
       curl -X POST https://YOUR_DOMAIN/api/v1/keys \
         -H "Authorization: Bearer <ADMIN_TOKEN>" \
         -H "Content-Type: application/json" \
         -d '{"email":"you@raiholdings.vn","label":"first","topup":500000}'
  3) In the RAI OS frontend (Cloudflare Worker), set:
       NEXT_PUBLIC_RAI_LLMS_BASE=https://YOUR_DOMAIN/api/v1
       RAI_LLMS_BASE=https://YOUR_DOMAIN/api/v1
       RAI_LLMS_ADMIN_TOKEN=<ADMIN_TOKEN>
NEXT
