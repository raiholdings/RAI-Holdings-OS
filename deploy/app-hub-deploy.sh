#!/usr/bin/env bash
# Publish the RAI OS App Hub to app.raiholdings.vn (static site on the VM + Caddy).
# Run from repo root on the dev machine (needs gcloud authed).
#
# Caddy serves /opt/rai/app-hub via this block in /opt/caddy/Caddyfile:
#   app.raiholdings.vn { root * /opt/rai/app-hub; encode gzip; try_files {path} /index.html; file_server }
# IMPORTANT: the caddy container MUST mount the hub dir, else file_server 404s:
#   docker run ... -v /opt/rai/app-hub:/opt/rai/app-hub:ro ...  (already configured)
set -e
ZONE=asia-southeast1-b; VM=rai-os
cd "$(dirname "$0")/../app-hub"
npm run build
tar -czf /tmp/hub-dist.tgz -C dist .
gcloud compute scp /tmp/hub-dist.tgz "$VM:~/hub-dist.tgz" --zone "$ZONE" --quiet
gcloud compute ssh "$VM" --zone "$ZONE" --quiet --command "sudo rm -rf /opt/rai/app-hub/* && sudo tar -xzf ~/hub-dist.tgz -C /opt/rai/app-hub && echo deployed"
echo "Live: https://app.raiholdings.vn"
