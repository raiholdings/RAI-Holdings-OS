#!/usr/bin/env bash
# Enable Admin (Refine) login: IAM RBAC + GoTrue custom-claims hook + an owner user.
# Run ON THE VM. Prints the generated admin password once at the end.
set -euo pipefail
cd ~/supabase/docker
SR="$(sudo cat /root/SUPABASE_SERVICE_ROLE.txt)"
ANON="$(sudo cat /root/SUPABASE_ANON.txt)"
EMAIL="info@raiholdings.vn"
PW="$(openssl rand -base64 18 | tr -d '/+=' | cut -c1-14)Aa1!"

echo "== apply iam / auth-hook / rls SQL =="
for f in 02_iam_rbac 03_auth_hook 04_rls; do
  echo ">> $f"; sudo docker compose exec -T db psql -U postgres -d postgres -v ON_ERROR_STOP=1 -f - < ~/rai/infra/supabase/sql/$f.sql >/dev/null
done

echo "== enable GoTrue custom-access-token hook =="
sed -i 's|# GOTRUE_HOOK_CUSTOM_ACCESS_TOKEN_ENABLED: "true"|GOTRUE_HOOK_CUSTOM_ACCESS_TOKEN_ENABLED: "true"|' docker-compose.yml
sed -i 's|# GOTRUE_HOOK_CUSTOM_ACCESS_TOKEN_URI: "pg-functions://postgres/public/custom_access_token_hook"|GOTRUE_HOOK_CUSTOM_ACCESS_TOKEN_URI: "pg-functions://postgres/public/custom_access_token_hook"|' docker-compose.yml
sudo docker compose up -d auth >/dev/null
sleep 6

echo "== org =="
ORG=$(sudo docker compose exec -T db psql -U postgres -d postgres -t -A -c "insert into iam.organizations(name,slug) values('RAI Holdings','rai-holdings') on conflict (slug) do update set name=excluded.name returning id;")
echo "org=$ORG"

echo "== create admin user =="
curl -s -o /tmp/u.json -w "create_user HTTP %{http_code}\n" -X POST localhost:8000/auth/v1/admin/users \
  -H "apikey: $SR" -H "Authorization: Bearer $SR" -H "content-type: application/json" \
  --data "{\"email\":\"$EMAIL\",\"password\":\"$PW\",\"email_confirm\":true}"
USERID=$(python3 -c "import json;print(json.load(open('/tmp/u.json')).get('id','') or '')")
if [ -z "$USERID" ]; then
  echo "(user may exist — looking up + resetting password)"
  curl -s "localhost:8000/auth/v1/admin/users?per_page=200" -H "apikey: $SR" -H "Authorization: Bearer $SR" -o /tmp/list.json
  USERID=$(python3 -c "import json;d=json.load(open('/tmp/list.json'));us=d.get('users',[]) if isinstance(d,dict) else d;print(next((u['id'] for u in us if u.get('email')=='$EMAIL'),''))")
  [ -n "$USERID" ] && curl -s -X PUT "localhost:8000/auth/v1/admin/users/$USERID" -H "apikey: $SR" -H "Authorization: Bearer $SR" -H "content-type: application/json" --data "{\"password\":\"$PW\",\"email_confirm\":true}" >/dev/null
fi
echo "user_id=$USERID"
[ -n "$USERID" ] || { echo "FAILED to create/find user"; cat /tmp/u.json; exit 1; }

echo "== owner membership =="
sudo docker compose exec -T db psql -U postgres -d postgres -v ON_ERROR_STOP=1 \
  -c "insert into iam.memberships(user_id,org_id,role_key) values ('$USERID','$ORG','owner') on conflict (user_id,org_id) do update set role_key='owner';" >/dev/null
echo "membership set: owner"

echo "== test login + decode claim =="
curl -s -o /tmp/t.json -w "login HTTP %{http_code}\n" -X POST "localhost:8000/auth/v1/token?grant_type=password" \
  -H "apikey: $ANON" -H "content-type: application/json" --data "{\"email\":\"$EMAIL\",\"password\":\"$PW\"}"
python3 -c "
import json,base64
d=json.load(open('/tmp/t.json')); t=d.get('access_token','')
if t:
    p=t.split('.')[1]; p+='='*(-len(p)%4)
    c=json.loads(base64.urlsafe_b64decode(p)); print('claims: user_role=',c.get('user_role'),'org_id=',c.get('org_id'))
else: print('NO TOKEN:', d)
"
echo "========================================"
echo "ADMIN_EMAIL=$EMAIL"
echo "ADMIN_PASSWORD=$PW"
echo "========================================"
