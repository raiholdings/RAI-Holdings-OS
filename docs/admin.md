# RAI Admin — Tài liệu chức năng

> Bảng quản trị trung tâm tại **https://admin.raiholdings.vn**
> Cập nhật: 2026-06-19 · Trạng thái: LIVE

---

## 1. Tổng thể & kiến trúc

| Thành phần | Mô tả |
|---|---|
| **Nền tảng** | Refine (React + Vite + Ant Design); deploy static Worker `rai-admin` trên Cloudflare; domain `admin.raiholdings.vn` (SSL tự cấp) |
| **Đăng nhập** | Supabase GoTrue (email + mật khẩu). JWT mang claim `user_role` + `org_id` (auth-hook gắn) |
| **Phân quyền (RBAC)** | `owner`/`admin` = toàn quyền · `editor` = sửa nội dung · `viewer` = chỉ đọc |
| **Dữ liệu** | PostgREST của Supabase (`api.raiholdings.vn`). Trình duyệt dùng JWT người đăng nhập + RLS (chỉ owner/admin CRUD); server (Worker) dùng `service_role` riêng |
| **AI** | RAI LLMs gateway (`llms.raiholdings.vn`) → Anthropic; hạ tầng trên VM GCP Singapore |

```
Trình duyệt (admin SPA, JWT Supabase)
   ├── đọc/ghi dữ liệu → api.raiholdings.vn  (PostgREST + RLS)
   └── AI điều khiển   → raiholdings.vn/api/admin/ai (Worker)
                            → xác thực JWT admin → agent AI (gateway)
                            → tool trên DB (service_role)
```

**Tài khoản hiện tại:** `info@raiholdings.vn` — vai trò `owner`.

---

## 2. Tổng quan (Dashboard) — `/`
- Thẻ số liệu: số **Ventures**, **Tổ chức**, **Thành viên**, **Tổng credit (VND)**.
- Bảng **Giao dịch gần đây** + **Sử dụng gần đây**.
- Chỉ đọc; số liệu trực tiếp từ DB.

## 3. AI điều khiển (AI Console) — `/ai` ⭐
Gõ lệnh tiếng Việt → AI thật truy vấn + thực thi hành động quản trị bằng tool; hiển thị tool đã chạy.

| Nhóm | Tool | Loại |
|---|---|---|
| Tổng hợp | `get_stats` | đọc |
| Ventures | `search_ventures`, `set_venture_status` | đọc / **ghi** |
| Tổ chức–ví | `list_orgs`, `adjust_credit` | đọc / **ghi** |
| Usage | `recent_usage` | đọc |
| Marketplace | `list_listings`, `set_listing_status` | đọc / **ghi** |
| Code/Apps/MCP | `list_repos`, `list_apps`, `list_mcp_servers` | đọc |

**Bảo mật:** chỉ JWT owner/admin; thao tác ghi chỉ chạy khi yêu cầu rõ; không bịa số (lấy từ tool); giới hạn số tiền + số bước (≤6).

## 4. Workspace (dữ liệu sản phẩm sống)

| Mục | Bảng | Chức năng |
|---|---|---|
| **Doanh nghiệp (Ventures)** | `workspace.ventures` | Danh sách (tên, ngành, vùng, độ tin cậy, trạng thái) · Xem chi tiết + JSON · **Đổi trạng thái** · **Xoá** |
| **Tổ chức & ví** | `workspace.orgs` | Danh sách + số dư · **Sửa số dư credit (VND)** |
| **Thành viên** | `workspace.org_members` | Danh sách (tên, @username, vai trò, org) — đọc |
| **Giao dịch ví** | `workspace.wallet_txns` | Sổ nạp/trừ + số dư sau giao dịch — đọc |
| **Sử dụng** | `workspace.usage_events` | Lịch sử usage (product, model, lượt, chi phí) — đọc |

## 5. Solutions (catalog 4 module)

| Mục | Bảng | Chức năng |
|---|---|---|
| **Marketplace** | `marketplace.listings` | Danh sách (tên, loại, trạng thái, nổi bật, lượt cài, đánh giá) · **Sửa trạng thái + nổi bật** |
| **Code** | `code.repos` | Danh sách repo (giấy phép, deploy, chủ sở hữu) — đọc |
| **Apps** | `apps.apps` | Danh sách ứng dụng (danh mục, nhà phát triển, RAI/community) — đọc |
| **MCP** | `mcp.servers` | Registry server (namespace, trạng thái, nguồn) — đọc |

## 6. IAM (phân quyền hệ thống)

| Mục | Bảng | Chức năng |
|---|---|---|
| **Tổ chức (IAM)** | `iam.organizations` | Danh sách · **Tạo / Sửa / Xoá** |
| **Vai trò** | `iam.roles` | owner/admin/editor/viewer — đọc |
| **Phân quyền** | `iam.memberships` | User ↔ org + vai trò — đọc |

---

## 7. Bản đồ mã nguồn

| Lớp | Đường dẫn |
|---|---|
| Admin SPA | `admin/src/App.tsx` (resources + routes), `admin/src/pages/*` (dashboard, ai, ventures, workspace, solutions, organizations, iam) |
| Auth/RBAC client | `admin/src/authProvider.ts`, `accessControlProvider.ts`, `supabaseClient.ts` |
| AI agent (server) | `src/lib/admin-ai.ts` (verify JWT + tool loop), `src/app/api/admin/ai/route.ts` |
| Seed catalog → DB | `src/app/api/admin/seed-solutions/route.ts` |
| DB adapter | `src/lib/db.ts` (PostgREST qua fetch, tham số `schema`) |
| Schema/RLS | `infra/supabase/sql/{02_iam_rbac,03_auth_hook,04_rls,05_workspace,06_admin_rls,07_solutions}.sql` |
| Triển khai | `deploy/*` (gcp-provision, supabase-up, admin-setup, …) |

---

## 8. Giới hạn hiện tại → hướng cải tiến

1. **Trang công khai chưa nối DB** — `/marketplace`, `/code`, `/apps`, `/mcp` vẫn đọc catalog in-app; admin sửa DB nhưng public chưa phản chiếu. → *Wiring public → DB (per-module).*
2. **Mới có catalog chính** — chưa migrate submissions/đăng ký/subscriptions; CMS (Enterprise/Pricing/Platform/Portfolio) chưa vào admin.
3. **Nhiều mục read-only** — Code/Apps/MCP/Members/Usage chưa có form sửa/duyệt (duyệt submission, đổi license, xoá server…).
4. **AI điều khiển** — chưa có **audit log**, chưa **xác nhận 2 bước** cho thao tác nhạy cảm, tool ghi còn ít (thiếu Code/Apps/MCP).
5. **RBAC** — mới phân biệt owner/admin vs viewer ở UI; chưa map quyền chi tiết theo `iam.permissions` (`module.resource.action`).
6. **Quản trị người dùng** — chưa có UI tạo/khoá user GoTrue + gán vai trò (hiện làm bằng script `deploy/admin-setup.sh`).
7. **Vận hành** — chưa backup DB tự động; chưa khóa `studio.raiholdings.vn` (IP allowlist + basic-auth).

---

## 9. Lộ trình đề xuất

| Ưu tiên | Việc | Giá trị |
|---|---|---|
| 1 | Wiring public Marketplace → DB (một nguồn sự thật) | Doanh thu, admin sửa là public đổi |
| 2 | Form duyệt submission (Apps/Marketplace/MCP) + đổi trạng thái | Vận hành thực |
| 3 | Audit log + xác nhận 2 bước cho AI/thao tác nhạy cảm | An toàn |
| 4 | Migrate CMS (Enterprise/Pricing/Platform/Portfolio) → DB + admin | Quản trị nội dung tập trung |
| 5 | UI quản trị user + RBAC theo permission | Mở rộng đội ngũ |
| 6 | Backup DB cron + khóa Studio | Vận hành an toàn |
