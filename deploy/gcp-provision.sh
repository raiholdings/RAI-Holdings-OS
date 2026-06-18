#!/usr/bin/env bash
# RAI OS — provision a single GCP VM (Singapore) for Supabase + RAI LLMs gateway.
#
# Prereqs (you do once):  install gcloud, then `gcloud auth login` and
#   `gcloud config set project <YOUR_PROJECT_ID>`  and enable billing.
# Then run:  bash deploy/gcp-provision.sh
#
# Re-running is safe: each resource is created only if missing. Prints the static
# IP at the end — point your DNS A-records at it (see deploy/README.md).
set -euo pipefail

# ── config (override via env) ───────────────────────────────────────────────
NAME="${NAME:-rai-os}"
REGION="${REGION:-asia-southeast1}"          # Singapore — reaches Anthropic, low latency to VN
ZONE="${ZONE:-asia-southeast1-b}"
MACHINE="${MACHINE:-e2-standard-4}"          # 4 vCPU / 16 GB — fits Supabase + gateway on one box
DISK_GB="${DISK_GB:-100}"
IMAGE_FAMILY="${IMAGE_FAMILY:-ubuntu-2404-lts-amd64}"
IMAGE_PROJECT="${IMAGE_PROJECT:-ubuntu-os-cloud}"
SSH_SRC="${SSH_SRC:-0.0.0.0/0}"              # tighten to your IP/32 for SSH if you can

PROJECT="$(gcloud config get-value project 2>/dev/null)"
[ -n "$PROJECT" ] && [ "$PROJECT" != "(unset)" ] || { echo "ERROR: run 'gcloud config set project <ID>' first"; exit 1; }
echo "Project: $PROJECT   Zone: $ZONE   Machine: $MACHINE"

echo "==> 1/5 Enable Compute API"
gcloud services enable compute.googleapis.com --quiet

echo "==> 2/5 Reserve static IP ($NAME-ip)"
gcloud compute addresses describe "$NAME-ip" --region "$REGION" >/dev/null 2>&1 \
  || gcloud compute addresses create "$NAME-ip" --region "$REGION"
IP="$(gcloud compute addresses describe "$NAME-ip" --region "$REGION" --format='value(address)')"
echo "    static IP: $IP"

echo "==> 3/5 Firewall (80/443 public, 22 from $SSH_SRC)"
gcloud compute firewall-rules describe "$NAME-web" >/dev/null 2>&1 \
  || gcloud compute firewall-rules create "$NAME-web" \
       --allow tcp:80,tcp:443 --source-ranges 0.0.0.0/0 --target-tags "$NAME"
gcloud compute firewall-rules describe "$NAME-ssh" >/dev/null 2>&1 \
  || gcloud compute firewall-rules create "$NAME-ssh" \
       --allow tcp:22 --source-ranges "$SSH_SRC" --target-tags "$NAME"

echo "==> 4/5 Create VM ($NAME)"
if gcloud compute instances describe "$NAME" --zone "$ZONE" >/dev/null 2>&1; then
  echo "    VM already exists — skipping create."
else
  gcloud compute instances create "$NAME" \
    --zone "$ZONE" --machine-type "$MACHINE" \
    --image-family "$IMAGE_FAMILY" --image-project "$IMAGE_PROJECT" \
    --boot-disk-size "${DISK_GB}GB" --boot-disk-type pd-ssd \
    --address "$IP" --tags "$NAME"
fi

echo "==> 5/5 Done"
cat <<EOF

  ┌────────────────────────────────────────────────────────────────
  │ VM '$NAME' is up at  $IP
  │
  │ Next:
  │  1. Point DNS A-records (DNS-only / grey cloud) at $IP:
  │       api.raiholdings.vn   studio.raiholdings.vn   llms.raiholdings.vn
  │  2. SSH in:   gcloud compute ssh $NAME --zone $ZONE
  │  3. Run the server setup (see deploy/README.md → step S2/S3).
  └────────────────────────────────────────────────────────────────
EOF
