# RAI LLMs Gateway — Hướng dẫn triển khai (DevOps runbook)

Triển khai cổng `llms.raiholdings.vn` trên một VPS tự host. Backend gateway **bắt buộc tự host** — upstream provider keys chỉ tồn tại server-side.

---

## 1. Yêu cầu (Prerequisites)

- Một VPS (Ubuntu 22.04+ khuyến nghị), 2 vCPU / 2 GB RAM trở lên.
- **Docker** + **Docker Compose plugin** (`docker compose version`).
- Một domain trỏ về VPS: `llms.raiholdings.vn` (A/AAAA record).
- Reverse proxy có TLS (**Caddy** khuyến nghị, hoặc Nginx + certbot) → forward `:443` về `gateway:8080`.

---

## 2. Lấy mã nguồn

```bash
git clone <repo-url> rai-holdings-os
cd "rai-holdings-os/gateway"
```

---

## 3. Cấu hình môi trường

Copy file mẫu và điền giá trị thật:

```bash
cp .env.example .env
```

Các biến quan trọng (xem `.env.example` để biết đầy đủ):

| Biến | Ý nghĩa |
|------|---------|
| `PORT` | Cổng app (mặc định `8080`). |
| `DATABASE_URL` | Postgres. Trong compose, dùng host `db`, vd `postgres://rai:rai@db:5432/rai_llms`. |
| `REDIS_URL` | Redis rate-limit/cache. Trong compose: `redis://redis:6379`. Bỏ trống = degrade gracefully. |
| `ENCRYPTION_KEY` | Khóa 32 byte (hex) cho AES-256-GCM mã hóa upstream/BYOK keys. |
| `ADMIN_TOKEN` | Bearer token cho các endpoint `/admin`. |
| `FX_USD_VND` | Tỷ giá quy đổi credits (lưu theo VND). |
| `DEFAULT_MARKUP_PERCENT` | Markup nền tảng mặc định (overridable theo model/provider). |
| `OPENAI_API_KEY` / `ANTHROPIC_API_KEY` / `GOOGLE_API_KEY` / `DEEPSEEK_API_KEY` | Upstream keys (bootstrap dev; production nên lưu mã hóa trong DB). |
| `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB` | Dùng bởi service `db` trong compose. Khớp với `DATABASE_URL`. |

Sinh `ENCRYPTION_KEY` (32 byte hex):

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 4. Khởi chạy stack

```bash
docker compose up -d
docker compose ps          # đợi service db = healthy
```

Chạy migration **một lần** sau lần `up` đầu tiên (tạo bảng + seed providers/markup):

```bash
docker compose exec gateway npm run migrate
```

> Cách thay thế nếu không muốn chạy trong container: trỏ `DATABASE_URL` tới Postgres rồi chạy
> `npm run migrate` từ máy có Node, hoặc nạp trực tiếp `psql "$DATABASE_URL" -f sql/schema.sql`.

---

## 5. Reverse proxy + TLS

Ví dụ **Caddy** (`/etc/caddy/Caddyfile`) — tự động cấp Let's Encrypt:

```caddy
llms.raiholdings.vn {
    reverse_proxy localhost:8080
}
```

```bash
sudo systemctl reload caddy
```

(Nếu Caddy cũng chạy trong Docker, dùng `reverse_proxy gateway:8080` trên cùng network.)

---

## 6. Kiểm tra (Verify)

```bash
curl https://llms.raiholdings.vn/api/v1/models
```

Phải trả về JSON catalog mô hình. Thử một request chat:

```bash
curl https://llms.raiholdings.vn/api/v1/chat/completions \
  -H "Authorization: Bearer <RAI_API_KEY>" \
  -H "Content-Type: application/json" \
  -d '{"model":"anthropic/claude-sonnet-4.6","messages":[{"role":"user","content":"Xin chào"}]}'
```

---

## 7. Bảo mật (Security notes)

- **Không bao giờ** publish cổng Postgres (`5432`) ra public. Giữ nó trong network nội bộ của compose.
- **Upstream provider keys** chỉ ở server-side, lưu **mã hóa** trong DB (`provider_credentials.upstream_key_enc`, `byok_keys.key_enc`) bằng `ENCRYPTION_KEY`. Không bao giờ đẩy key thật vào client/frontend/artifact.
- Bảo vệ `.env` (quyền `600`, không commit). `ADMIN_TOKEN` và `ENCRYPTION_KEY` là bí mật cấp cao nhất.
- **Xoay khóa định kỳ** (rotate): upstream keys, `ADMIN_TOKEN`, và RAI API keys của người dùng.
- Chỉ mở `:443` ra ngoài qua reverse proxy; gateway `:8080` nên bind nội bộ.

---

## 8. Kết nối frontend RAI OS

Frontend RAI OS chạy trên Cloudflare Worker `raiholdings`. Để UI dùng gateway thật thay cho mock in-app, set biến:

```
NEXT_PUBLIC_RAI_LLMS_BASE=https://llms.raiholdings.vn/api/v1
```

Trong Cloudflare (Worker `raiholdings`): thêm vào environment variables / `wrangler.toml` `[vars]`, rồi redeploy. Khi biến này có giá trị, lớp client `raiLLMClient.ts` sẽ gọi gateway thật.

---

## 9. Vận hành (Operations)

```bash
docker compose logs -f gateway     # xem log
docker compose pull && docker compose up -d --build   # cập nhật & redeploy
docker compose down                # dừng (giữ volume dữ liệu)
```

Backup Postgres định kỳ:

```bash
docker compose exec db pg_dump -U rai rai_llms > backup-$(date +%F).sql
```
