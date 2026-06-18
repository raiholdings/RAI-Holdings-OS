#!/usr/bin/env bash
# Bring up the Supabase self-host stack on the VM with freshly generated secrets.
# Run ON THE VM (it expects ~/rai/infra/supabase/gen-keys.mjs to exist).
# Idempotent-ish: clones once, regenerates .env only on first run.
set -euo pipefail

cd ~
[ -d supabase ] || git clone --depth 1 https://github.com/supabase/supabase
cd supabase/docker

if [ ! -f .env.rai-done ]; then
  cp -n .env.example .env
  gen() { openssl rand -hex "$1"; }
  JWT_SECRET_VAL="$(openssl rand -hex 40)"
  PG_PW="$(gen 24)"; DASH_PW="$(gen 12)"; SKB="$(gen 32)"; VAULT="$(gen 16)"

  cp ~/rai/infra/supabase/gen-keys.mjs ./gen-keys.mjs
  KEYS="$(sudo docker run --rm -e JWT_SECRET="$JWT_SECRET_VAL" -v "$PWD/gen-keys.mjs:/gen-keys.mjs" node:20-alpine node /gen-keys.mjs)"
  ANON="$(echo "$KEYS" | grep '^ANON_KEY=' | cut -d= -f2-)"
  SERVICE="$(echo "$KEYS" | grep '^SERVICE_ROLE_KEY=' | cut -d= -f2-)"

  python3 - "$PG_PW" "$JWT_SECRET_VAL" "$ANON" "$SERVICE" "$DASH_PW" "$SKB" "$VAULT" <<'PY'
import sys,re
pgpw,jwt,anon,service,dashpw,skb,vault=sys.argv[1:8]
vals={
 'POSTGRES_PASSWORD':pgpw,'JWT_SECRET':jwt,'ANON_KEY':anon,'SERVICE_ROLE_KEY':service,
 'DASHBOARD_USERNAME':'rai','DASHBOARD_PASSWORD':dashpw,
 'SECRET_KEY_BASE':skb,'VAULT_ENC_KEY':vault,
 'SITE_URL':'https://raiholdings.vn','API_EXTERNAL_URL':'https://api.raiholdings.vn',
 'SUPABASE_PUBLIC_URL':'https://api.raiholdings.vn',
 'PGRST_DB_SCHEMAS':'public,storage,graphql_public,workspace',
}
lines=open('.env').read().splitlines(); seen=set(); out=[]
for line in lines:
    m=re.match(r'^([A-Z0-9_]+)=',line)
    if m and m.group(1) in vals:
        k=m.group(1); out.append(f"{k}={vals[k]}"); seen.add(k)
    else: out.append(line)
for k,v in vals.items():
    if k not in seen: out.append(f"{k}={v}")
open('.env','w').write("\n".join(out)+"\n")
print("env patched")
PY

  echo "$SERVICE" | sudo tee /root/SUPABASE_SERVICE_ROLE.txt >/dev/null
  echo "$ANON"    | sudo tee /root/SUPABASE_ANON.txt >/dev/null
  touch .env.rai-done
  echo "secrets generated"
else
  echo ".env already prepared — leaving it."
fi

echo "==> pulling images (may take a few minutes)"
sudo docker compose pull -q
echo "==> starting stack"
sudo docker compose up -d
sleep 15
sudo docker compose ps --format '{{.Name}}\t{{.Status}}' | sort
