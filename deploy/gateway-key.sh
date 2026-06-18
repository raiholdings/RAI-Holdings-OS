#!/usr/bin/env bash
# Create a gateway API key for the RAI OS Worker and test real AI through the
# gateway. Saves the key to /root/RAI_LLMS_API_KEY.txt (not printed).
set -euo pipefail
cd ~/rai/gateway
ADMIN="$(grep -E '^ADMIN_TOKEN=' .env | cut -d= -f2-)"

curl -s -o /tmp/key.json -w "create_key HTTP %{http_code}\n" \
  -X POST localhost:8080/api/v1/keys \
  -H "Authorization: Bearer $ADMIN" -H "content-type: application/json" \
  --data '{"email":"workspace@raiholdings.vn","label":"rai-os-worker","topup":500000}'

KEY="$(python3 -c "import json;d=json.load(open('/tmp/key.json'));print(d.get('key') or d.get('api_key') or d.get('apiKey') or d.get('token') or '')")"
if [ -z "$KEY" ]; then echo "KEY PARSE FAIL:"; cat /tmp/key.json; exit 1; fi
echo "$KEY" | sudo tee /root/RAI_LLMS_API_KEY.txt >/dev/null
echo "key created + saved (len ${#KEY})"

echo "=== chat via gateway (real AI) ==="
cat > /tmp/chat.json <<JSON
{"model":"anthropic/claude-opus-4.8","messages":[{"role":"user","content":"Reply exactly: RAI gateway OK"}],"max_tokens":16}
JSON
curl -s -o /tmp/c.json -w "chat HTTP %{http_code}\n" \
  -X POST localhost:8080/api/v1/chat/completions \
  -H "Authorization: Bearer $KEY" -H "content-type: application/json" \
  --data @/tmp/chat.json
python3 -c "import json;d=json.load(open('/tmp/c.json'));print('reply:', d['choices'][0]['message']['content'] if 'choices' in d else d)"
