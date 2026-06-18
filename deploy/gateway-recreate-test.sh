#!/usr/bin/env bash
set -euo pipefail
cd ~/rai/gateway
echo "ANTHROPIC key set in .env: $(grep -c '^ANTHROPIC_API_KEY=sk-ant' .env)"
sudo docker compose up -d gateway      # recreate so new .env env vars load
sleep 5
KEY="$(sudo cat /root/RAI_LLMS_API_KEY.txt)"
cat > /tmp/chat.json <<JSON
{"model":"anthropic/claude-opus-4.8","messages":[{"role":"user","content":"Reply exactly: RAI gateway OK"}],"max_tokens":16}
JSON
curl -s -o /tmp/c.json -w "chat HTTP %{http_code}\n" \
  -X POST localhost:8080/api/v1/chat/completions \
  -H "Authorization: Bearer $KEY" -H "content-type: application/json" --data @/tmp/chat.json
python3 -c "import json;d=json.load(open('/tmp/c.json'));print('reply:', d['choices'][0]['message']['content'] if 'choices' in d else d)"
