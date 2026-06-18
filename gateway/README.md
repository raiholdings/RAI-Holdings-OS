# RAI LLMs Gateway

Cổng LLM hợp nhất, **tương thích OpenAI** ("OpenRouter của RAI"). Một API key, một endpoint, truy cập nhiều mô hình từ nhiều nhà cung cấp — có định tuyến, fallback, đo token + chi phí, và trừ credits (VND).

- Domain production: `https://llms.raiholdings.vn`
- Base URL: `https://llms.raiholdings.vn/api/v1`
- Drop-in OpenAI: chỉ cần đổi `baseURL` + `apiKey`, code OpenAI SDK chạy ngay.
- Self-hosted: backend **bắt buộc tự host** trên VPS (xem `SETUP.md`).

> Stack: Node.js + TypeScript (ESM) · Fastify · PostgreSQL · Redis · Docker.

---

## Endpoints đã triển khai

| Method | Path | Mô tả |
|--------|------|-------|
| `POST` | `/api/v1/chat/completions` | Chat completions, **streaming (SSE)** + non-streaming. Kết thúc bằng `[DONE]`, `usage` ở chunk cuối kèm `cost`. |
| `GET`  | `/api/v1/models` | Catalog toàn bộ mô hình (id `author/slug`, pricing, context, supported params). |
| `GET`  | `/api/v1/credits` | Số dư credits (VND) còn lại của key/tài khoản. |
| `GET`  | `/api/v1/generation?id=<gen_id>` | Thống kê chi tiết (token, cost, latency) của 1 request đã xong. |
| `GET`/`POST`/`GET`/`PATCH`/`DELETE` | `/api/v1/keys` … `/api/v1/keys/{hash}` | Quản lý API key: tạo/liệt kê/chi tiết/cập nhật (limit, disable)/thu hồi. |
| `GET`  | `/api/v1/providers` | Danh sách nhà cung cấp + chính sách dữ liệu. |
| `POST` | `/api/v1/billing/topup` | Tạo lệnh nạp credit (VND) → trả `payUrl` (VNPay/MoMo). |
| `GET`  | `/api/v1/billing/vnpay/return` · `/billing/vnpay/ipn` | VNPay return + IPN: xác thực HMAC-SHA512 → cộng credit (idempotent) + xuất hóa đơn VAT. |
| `POST` | `/api/v1/billing/momo/ipn` | MoMo IPN: xác thực HMAC-SHA256 → cộng credit. |
| `GET`  | `/api/v1/billing/transactions` · `/billing/invoices` | Lịch sử giao dịch + hóa đơn VAT. |
| `GET`/`POST`/`DELETE` | `/api/v1/admin/markups` | (Admin) CRUD markup theo global/model/provider. |
| `POST` | `/api/v1/admin/providers/{slug}/credential` | (Admin) nạp upstream key (mã hóa AES-256-GCM). |
| `GET`  | `/api/v1/admin/stats` | (Admin) doanh thu (sum cost) · request · token · theo model · tổng top-up. |

> `/admin/*` cần header `Authorization: Bearer <ADMIN_TOKEN>`.

---

## Local dev

```bash
npm install
cp .env.example .env      # điền DATABASE_URL, ENCRYPTION_KEY, ADMIN_TOKEN, upstream keys
npm run migrate           # tạo bảng + seed providers/markup (cần Postgres chạy)
npm run dev               # tsx watch src/server.ts → http://localhost:8080
```

Scripts (`package.json`):

| Script | Lệnh |
|--------|------|
| `dev` | `tsx watch src/server.ts` |
| `build` | `tsc` → `dist/` |
| `start` | `node dist/server.js` |
| `migrate` | `node --import tsx scripts/migrate.ts` (áp `sql/schema.sql` lên `$DATABASE_URL`) |
| `typecheck` | `tsc --noEmit` |

Cần Postgres (+ Redis tùy chọn) khi chạy local — dễ nhất là `docker compose up -d db redis`.

---

## Biến môi trường (tóm tắt)

| Biến | Mô tả |
|------|-------|
| `PORT` | Cổng HTTP (mặc định `8080`). |
| `DATABASE_URL` | Connection string Postgres. |
| `REDIS_URL` | Redis cho rate-limit/cache (bỏ trống = degrade gracefully). |
| `ENCRYPTION_KEY` | 32 byte hex, AES-256-GCM mã hóa upstream/BYOK keys. |
| `ADMIN_TOKEN` | Bearer cho endpoint `/admin`. |
| `FX_USD_VND` | Tỷ giá quy đổi credits (credits lưu theo VND). |
| `DEFAULT_MARKUP_PERCENT` | Markup nền tảng mặc định. |
| `OPENAI_API_KEY` / `ANTHROPIC_API_KEY` / `GOOGLE_API_KEY` / `DEEPSEEK_API_KEY` | Upstream keys (bootstrap dev). |
| `PUBLIC_BASE_URL` | URL công khai của gateway (cho return/IPN thanh toán). |
| `VAT_PERCENT` | % VAT trên hóa đơn (mặc định 10). |
| `VNP_TMN_CODE` / `VNP_HASH_SECRET` / `VNP_URL` | Cấu hình VNPay (merchant). |
| `MOMO_PARTNER_CODE` / `MOMO_ACCESS_KEY` / `MOMO_SECRET_KEY` / `MOMO_ENDPOINT` | Cấu hình MoMo. |
| `SEARCH_PROVIDER` / `SEARCH_API_KEY` | Plugin web-search (Tavily). Bỏ trống = plugin no-op. |

Chi tiết đầy đủ: `.env.example`. Triển khai VPS: `SETUP.md`.

> **Plugins**: gửi `"plugins":[{"id":"web"}]` (web-search) hoặc `{"id":"file-parser","urls":["https://…"]}` trong body `/chat/completions` — gateway sẽ nạp ngữ cảnh (kết quả tìm kiếm / nội dung tài liệu) vào system trước khi gọi model.
>
> **Frontend admin proxy**: app Next gọi `/admin/*` của gateway qua route server `/api/llms-admin/*` (giấu token). Đặt `RAI_LLMS_BASE` + `RAI_LLMS_ADMIN_TOKEN` trong env của Worker `raiholdings`.

---

## Ví dụ gọi API

```bash
curl https://llms.raiholdings.vn/api/v1/chat/completions \
  -H "Authorization: Bearer <RAI_API_KEY>" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "anthropic/claude-sonnet-4.6",
    "messages": [{"role": "user", "content": "Chào RAI LLMs!"}]
  }'
```

Streaming: thêm `"stream": true` — server trả SSE (`chat.completion.chunk`), kết thúc bằng `data: [DONE]`.

Dùng OpenAI SDK (drop-in):

```ts
import OpenAI from "openai";
const client = new OpenAI({
  baseURL: "https://llms.raiholdings.vn/api/v1",
  apiKey: process.env.RAI_API_KEY,
});
```

---

## Trạng thái triển khai (Phases)

| Phase | Trạng thái |
|-------|-----------|
| **P3 — Gateway core** | ✅ Đã triển khai: router + fallback, adapters (OpenAI/Anthropic/Google/DeepSeek), usage meter, logging. |
| **P4 — Credits & wallet** | ✅ Đã triển khai: credits/ví VND, transactions, per-key budget + rate limit, activity log. |
| **P4 — Thanh toán VNPay/MoMo + VAT** | ✅ Lõi đã triển khai: topup intent → payUrl, return/IPN xác thực HMAC → cộng credit (idempotent) + ghi hóa đơn VAT. ⚙️ Cần điền merchant creds (sandbox/live) + nối nhà cung cấp **hóa đơn điện tử** để phát hành thật. |
| **P5 — Admin, ZDR/BYOK, Plugins** | ✅ Admin API (markup CRUD, nạp upstream credential mã hóa, stats) + **UI admin trong app** (`/admin/llms` qua proxy `/api/llms-admin/*`). ✅ **ZDR** (`provider.data_collection:"deny"`) + **BYOK** (`byok_keys`). ✅ **Plugins** web-search (Tavily) + file-parser. 🚧 TODO: structured-output enforcement, thêm plugin. |

---

## Liên quan

- `sql/schema.sql` — data model (spec §6), idempotent + seed.
- `scripts/migrate.ts` — migration runner.
- `SETUP.md` — runbook triển khai VPS + reverse proxy + bảo mật.
