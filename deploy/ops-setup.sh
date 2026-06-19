#!/usr/bin/env bash
set -eu
SBD="$HOME/supabase/docker"

echo "== backup script =="
sudo mkdir -p /opt/rai/backups
sudo tee /opt/rai/backup.sh >/dev/null <<EOF
#!/usr/bin/env bash
set -eu
export PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
DIR=/opt/rai/backups; mkdir -p "\$DIR"
F="rai-\$(date +%F-%H%M).sql.gz"
cd "$SBD"
docker compose exec -T db pg_dump -U postgres postgres | gzip > "\$DIR/\$F"
SIZE=\$(stat -c%s "\$DIR/\$F" 2>/dev/null || echo 0)
ls -1t "\$DIR"/*.sql.gz 2>/dev/null | tail -n +15 | xargs -r rm -f || true
docker compose exec -T db psql -U postgres -d postgres -c "insert into ops.backups(filename,size_bytes,ok) values ('\$F',\$SIZE,true);"
EOF
sudo chmod +x /opt/rai/backup.sh

echo "== cron =="
TMP=$(mktemp); sudo crontab -l 2>/dev/null | grep -v rai-backup > "$TMP" || true
echo "0 19 * * * /opt/rai/backup.sh # rai-backup" >> "$TMP"
sudo crontab "$TMP"; rm -f "$TMP"
sudo crontab -l | grep rai-backup && echo "cron ok"

echo "== run first backup =="
sudo /opt/rai/backup.sh
ls -lh /opt/rai/backups | tail -2

echo "== lock Studio =="
if ! grep -q 'studio.raiholdings.vn' /opt/caddy/Caddyfile; then
  SPW="$(openssl rand -base64 12 | tr -d '/+=')"
  HASH="$(sudo docker run --rm caddy:2 caddy hash-password --plaintext "$SPW")"
  sudo tee -a /opt/caddy/Caddyfile >/dev/null <<EOF

studio.raiholdings.vn {
    basic_auth {
        rai $HASH
    }
    reverse_proxy localhost:8000
}
EOF
  sudo docker exec caddy caddy reload --config /etc/caddy/Caddyfile --adapter caddyfile 2>/dev/null || sudo docker restart caddy >/dev/null
  echo "STUDIO_USER=rai"; echo "STUDIO_PASS=$SPW"
else echo "studio already locked"; fi
