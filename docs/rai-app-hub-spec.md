# RAI OS App Hub — Tài liệu kỹ thuật (`app.raiholdings.vn`)

> **Sản phẩm:** Trang giới thiệu + trung tâm tải xuống đa nền tảng của RAI OS, đặt tại `app.raiholdings.vn`, host trên VPS Google Cloud hiện có.
>
> **Hai vai trò trong một site:**
> 1. **Landing/marketing** — giới thiệu đầy đủ RAI OS (hệ điều hành doanh nghiệp AI-native) cho người chưa biết.
> 2. **Download hub** — phát hành mọi phiên bản: iOS (App Store), Android (Google Play), Desktop (Win/macOS/Linux), Tiện ích trình duyệt (Chrome/Edge/Firefox/Safari), và PWA cài trực tiếp.
>
> File này là nguồn sự thật cho Claude Code. Khi mâu thuẫn với phỏng đoán, ưu tiên file này.

---

## 0. TÓM TẮT 1 PHÚT

`app.raiholdings.vn` là "cửa ngõ" của RAI OS: vừa bán câu chuyện sản phẩm, vừa đưa người dùng tới đúng bản cài cho thiết bị của họ. Site tự **phát hiện nền tảng** của khách (OS + trình duyệt) và nổi bật nút tải phù hợp, đồng thời liệt kê đầy đủ mọi bản khác.

Bản thân RAI OS là một **web app** (chạy ở `workspace.raiholdings.vn`). Các "phiên bản tải về" đều là **vỏ bọc (shell) quanh cùng một web app**:
- **PWA** — cài thẳng từ trình duyệt, không qua store.
- **Desktop** — Tauri v2 (khuyến nghị) đóng gói web app thành app Win/macOS/Linux.
- **Mobile** — Tauri v2 mobile hoặc Capacitor, phát hành lên App Store / Google Play.
- **Extension** — tiện ích trình duyệt (truy cập nhanh + tích hợp trang web).

Một codebase frontend → mọi nền tảng. Đây là chiến lược chi phí thấp, cập nhật tức thì.

---

## 1. KIẾN TRÚC TỔNG

```
                    app.raiholdings.vn  (Landing + Download Hub)
                    │  - giới thiệu RAI OS
                    │  - phát hiện nền tảng → gợi ý bản tải
                    │  - /downloads (mọi nền tảng), /releases (changelog)
                    ▼
        ┌───────────────────────────────────────────────┐
        │  Cùng một web app RAI OS (workspace SPA)        │
        │  React + Vite + TS + Tailwind + PWA manifest    │
        └───────────────────────────────────────────────┘
            │          │            │             │
         PWA        Desktop       Mobile       Extension
       (install)   (Tauri v2)  (Tauri/Capacitor) (MV3/WebExt)
            │          │            │             │
         trình      Win/mac/      App Store /    Chrome/Edge/
         duyệt       Linux        Google Play    Firefox/Safari
```

**Hạ tầng (VPS Google Cloud hiện có):**
- Reverse proxy (Nginx/Caddy) phục vụ static site + SSL (Let's Encrypt hoặc Cloudflare).
- Thư mục `releases/` chứa file cài (hoặc trỏ tới GitHub Releases / GCS bucket cho artifact lớn).
- Endpoint `update.raiholdings.vn` (hoặc path) phục vụ **auto-update** cho desktop (Tauri updater).
- CDN (Cloudflare) đứng trước để tải nhanh & giảm băng thông VPS.

---

## 2. CẤU TRÚC TRANG (LANDING + HUB)

| Route | Nội dung |
|---|---|
| `/` | Hero giới thiệu RAI OS + nút tải thông minh (theo nền tảng) + social proof |
| `/product` | Mô tả sâu: Venture Builder, Big Data, RAI LLMs, 8 Engine, các giải pháp |
| `/downloads` | **Trung tâm tải** — mọi nền tảng, mọi kiến trúc CPU |
| `/downloads/:platform` | Trang chi tiết từng nền tảng (hướng dẫn cài, yêu cầu hệ thống) |
| `/releases` | Changelog + lịch sử phiên bản (đọc từ `releases.json`) |
| `/pricing` | Bảng giá (nếu hiển thị ở đây) |
| `/docs` | Hướng dẫn bắt đầu, FAQ cài đặt |

### 2.1 Hero — giới thiệu RAI OS
Nội dung chính (tiếng Việt-first):
- **Tagline:** "Hệ điều hành doanh nghiệp AI-Native. Gõ một ý tưởng — RAI dựng nên công ty."
- 3–4 điểm giá trị: Venture Builder (tạo công ty từ một câu), Big Data (~1tr DN VN), RAI LLMs (cổng AI hợp nhất), tự động hóa qua 8 engine.
- **Nút tải thông minh:** JS phát hiện nền tảng → nút chính hiển thị đúng bản (vd "Tải cho macOS" / "Cài trên iPhone" / "Thêm vào Chrome"). Link phụ "Xem mọi nền tảng" → `/downloads`.
- CTA phụ: "Dùng ngay trên web" → `workspace.raiholdings.vn`.

### 2.2 Phát hiện nền tảng (platform detection)
```ts
function detectPlatform(): { os: string; browser: string; arch?: string; suggested: DownloadKind } {
  const ua = navigator.userAgent;
  const isIOS = /iPhone|iPad|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const isAndroid = /Android/.test(ua);
  const isMac = /Macintosh/.test(ua);
  const isWin = /Windows/.test(ua);
  const isLinux = /Linux/.test(ua) && !isAndroid;
  // → trả về bản gợi ý: ios-appstore | android-play | desktop-mac | desktop-win | desktop-linux | pwa
  // Lưu ý: arch (arm64 vs x64) khó lấy chính xác từ UA — cho người dùng chọn ở /downloads.
}
```
Quy tắc gợi ý: iOS→App Store (hoặc PWA qua Share), Android→Google Play (hoặc APK/PWA), macOS→.dmg, Windows→.msi/.exe, Linux→.AppImage/.deb, còn lại→PWA/web.

---

## 3. CÁC PHIÊN BẢN — CHI TIẾT KỸ THUẬT

### 3.1 PWA (Progressive Web App) — nền tảng của mọi bản
Đây là lõi: web app RAI OS được làm thành PWA cài được. **Yêu cầu cài đặt (2026):**
- HTTPS bắt buộc + **service worker** đã đăng ký + **web app manifest** hợp lệ.
- Manifest đủ: `name`, `short_name`, `description`, `start_url`, `display`, `theme_color`, `background_color`, và **icon đủ kích thước** (tối thiểu 192px và 512px, kèm maskable).

`manifest.webmanifest` mẫu:
```json
{
  "name": "RAI OS",
  "short_name": "RAI OS",
  "description": "Hệ điều hành doanh nghiệp AI-Native",
  "start_url": "/?source=pwa",
  "scope": "/",
  "display": "standalone",
  "theme_color": "#0a0b10",
  "background_color": "#0a0b10",
  "lang": "vi",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icons/maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ],
  "shortcuts": [
    { "name": "Tạo Venture", "url": "/build" },
    { "name": "Big Data", "url": "/data" }
  ]
}
```

**Service worker** (khuyến nghị Workbox 7, tích hợp Vite):
- App shell: cache-first.
- API động: network-first (fallback cache khi offline).
- Static asset có hash: stale-while-revalidate.

**Cài PWA theo nền tảng (lưu ý quan trọng):**
- Chromium desktop (Chrome/Edge): nút cài tự xuất hiện qua sự kiện `beforeinstallprompt` → ta hứng sự kiện, hiện nút "Cài RAI OS".
- macOS Safari 17+: "Add to Dock".
- iOS 16.4+: cài từ menu **Share → Add to Home Screen** (Safari/Chrome/Edge/Firefox). Hiển thị hướng dẫn hình ảnh cho iOS vì không có prompt tự động.
- Firefox desktop **không** cài PWA bằng manifest → hướng người Firefox sang desktop app hoặc dùng trên web.

### 3.2 Desktop (Windows / macOS / Linux) — Tauri v2 (khuyến nghị)
**Lý do chọn Tauri v2:** binary nhỏ (~3–10MB vs ~80–200MB của Electron), dùng WebView hệ điều hành, RAM thấp, bảo mật theo mặc định, và **một codebase có thể mở rộng sang mobile**. Đánh đổi: cần Rust cho lớp native và phải test trên từng WebView.

> Phương án thay thế: **Electron** nếu cần rendering Chromium đồng nhất tuyệt đối hoặc hệ thống auto-update/signing trưởng thành hơn. Mặc định tài liệu này dùng Tauri v2.

**Artifact phát hành:**
| OS | Định dạng | Kiến trúc |
|---|---|---|
| Windows | `.msi` + `.exe` (NSIS) | x64, arm64 |
| macOS | `.dmg` (+ `.app`) | Universal (Intel + Apple Silicon) |
| Linux | `.AppImage`, `.deb`, (`.rpm`) | x64, arm64 |

**Ký số (bắt buộc 2026):** Windows code signing (EV cert khuyến nghị), macOS Developer ID + **notarization** (Apple). Không ký → user gặp cảnh báo bảo mật.

**Auto-update:** Tauri updater tải bản binary đầy đủ (Tauri không dùng diff). Vì bundle nhỏ nên chấp nhận được. Cấu hình endpoint `update.raiholdings.vn/{target}/{arch}/{current_version}` trả manifest JSON (version + URL + chữ ký).

`tauri.conf.json` (rút gọn, các điểm quan trọng):
```jsonc
{
  "productName": "RAI OS",
  "identifier": "vn.raiholdings.os",
  "build": { "frontendDist": "../dist", "devUrl": "http://localhost:5173" },
  "app": { "windows": [{ "title": "RAI OS", "width": 1280, "height": 800 }] },
  "bundle": {
    "active": true,
    "targets": ["msi", "nsis", "dmg", "appimage", "deb"],
    "icon": ["icons/32x32.png", "icons/128x128.png", "icons/icon.icns", "icons/icon.ico"]
  },
  "plugins": {
    "updater": {
      "endpoints": ["https://update.raiholdings.vn/{{target}}/{{arch}}/{{current_version}}"],
      "pubkey": "<TAURI_UPDATER_PUBLIC_KEY>"
    }
  }
}
```
Desktop shell có thể chỉ "trỏ" vào `workspace.raiholdings.vn` (thin shell) hoặc bundle frontend offline-capable (khuyến nghị bundle để mở nhanh + dùng được khi mạng yếu).

### 3.3 Mobile (iOS / Android)
**Hai lựa chọn, chọn 1 theo nguồn lực:**
- **Tauri v2 mobile** — cùng codebase desktop, mới hơn nên cần prototype ký số/plugin trước.
- **Capacitor** (Ionic) — trưởng thành cho việc bọc web app thành app store, nhiều plugin native, dễ submit.

**Yêu cầu phát hành:**
| Store | Yêu cầu chính |
|---|---|
| **Apple App Store** | Tài khoản Apple Developer ($99/năm), App Store Connect, icon/screenshot đủ size, App Privacy, review. App "bọc web" phải có đủ tính năng native-feel để qua review. |
| **Google Play** | Tài khoản Play Console ($25 một lần), **AAB** (Android App Bundle), ký app (Play App Signing), data safety form, review. |

Mobile shell nên hỗ trợ: push notification (FCM/APNs), deep link (mở `/ventures/:id`), đăng nhập sinh trắc (tùy chọn), splash screen + icon thương hiệu RAI.

### 3.4 Tiện ích trình duyệt (Browser Extension)
Chuẩn **Manifest V3 / WebExtensions** — một codebase chạy đa trình duyệt.
| Trình duyệt | Cửa hàng | Ghi chú |
|---|---|---|
| Chrome | Chrome Web Store ($5 một lần) | MV3 |
| Edge | Microsoft Edge Add-ons | MV3, dùng chung gói Chrome |
| Firefox | Firefox Add-ons (AMO) | WebExtensions, vài khác biệt API |
| Safari | App Store (qua Xcode wrapper) | Safari Web Extension, cần macOS để build |

**Chức năng tiện ích (đề xuất):**
- Truy cập nhanh workspace (popup mở mini Venture Builder / tra cứu Big Data).
- "Lưu vào RAI OS": bắt thông tin doanh nghiệp từ trang web đang xem → đẩy vào Big Data/Venture.
- Thông báo trạng thái agent/Venture.
- SSO dùng chung phiên đăng nhập với workspace (cookie/token).

`manifest.json` (MV3) khung:
```json
{
  "manifest_version": 3,
  "name": "RAI OS",
  "version": "1.0.0",
  "description": "Truy cập nhanh RAI OS — tạo Venture, tra cứu doanh nghiệp",
  "action": { "default_popup": "popup.html", "default_icon": "icons/48.png" },
  "background": { "service_worker": "sw.js" },
  "permissions": ["storage", "activeTab", "scripting"],
  "host_permissions": ["https://*.raiholdings.vn/*"],
  "icons": { "16": "icons/16.png", "48": "icons/48.png", "128": "icons/128.png" }
}
```

---

## 4. TRANG `/downloads` — TRUNG TÂM TẢI

Bố cục: lưới thẻ theo nhóm nền tảng, mỗi thẻ có icon, tên, yêu cầu hệ thống, nút tải (kèm chọn kiến trúc), kích thước file, phiên bản.

**Nguồn dữ liệu:** một file `releases.json` (single source of truth) để cả hub & auto-update đọc:
```json
{
  "version": "1.4.0",
  "released_at": "2026-06-19",
  "notes_url": "/releases#1-4-0",
  "platforms": {
    "windows": { "x64": { "url": "https://.../RAI-OS_1.4.0_x64.msi", "size": "8.2 MB" },
                 "arm64": { "url": "https://.../RAI-OS_1.4.0_arm64.msi", "size": "8.0 MB" } },
    "macos":   { "universal": { "url": "https://.../RAI-OS_1.4.0_universal.dmg", "size": "9.1 MB" } },
    "linux":   { "x64-appimage": { "url": "https://.../RAI-OS_1.4.0_amd64.AppImage", "size": "10.3 MB" },
                 "x64-deb": { "url": "https://.../rai-os_1.4.0_amd64.deb", "size": "7.9 MB" } },
    "ios":     { "store_url": "https://apps.apple.com/app/idXXXXXXXX" },
    "android": { "store_url": "https://play.google.com/store/apps/details?id=vn.raiholdings.os",
                 "apk_url": "https://.../RAI-OS_1.4.0.apk" },
    "chrome":  { "store_url": "https://chromewebstore.google.com/detail/XXXX" },
    "edge":    { "store_url": "https://microsoftedge.microsoft.com/addons/detail/XXXX" },
    "firefox": { "store_url": "https://addons.mozilla.org/addon/rai-os/" },
    "safari":  { "store_url": "https://apps.apple.com/app/idYYYYYYYY" },
    "pwa":     { "install": true }
  }
}
```
Frontend đọc `releases.json` → render thẻ + gợi ý theo `detectPlatform()`. Auto-update desktop đọc cùng nguồn.

---

## 5. PIPELINE BUILD & PHÁT HÀNH (CI/CD)

**Mục tiêu:** một lần tag version → tự build mọi nền tảng → ký số → đẩy artifact → cập nhật `releases.json`.

```
GitHub Actions (matrix theo OS)
 ├─ build web (vite) → dist/
 ├─ build desktop (tauri) trên windows/macos/linux runner → ký + notarize
 ├─ build mobile (tauri/capacitor) → .aab / .ipa (cần macOS runner cho iOS)
 ├─ build extension → zip MV3 (Chrome/Edge/Firefox), Safari wrapper trên macOS
 ├─ upload artifact → GCS bucket / GitHub Releases
 └─ cập nhật releases.json + update manifest cho Tauri updater
```
- **Secrets** (chứng chỉ ký, Apple API key, Play service account, store token) lưu ở GitHub Secrets / Secret Manager GCP — không commit.
- Store submission (App Store/Play/Web Store) có thể bán tự động (fastlane / store API) hoặc thủ công bước cuối.

---

## 6. HẠ TẦNG TRÊN VPS GOOGLE CLOUD (hiện có)

- **Web server:** Nginx/Caddy phục vụ static build của hub (`app.raiholdings.vn`) + `releases.json`.
- **SSL:** Caddy auto-HTTPS hoặc Certbot; hoặc đặt sau Cloudflare.
- **Artifact lớn:** nên để trên **GCS bucket** (hoặc GitHub Releases) thay vì ổ VPS, rồi CDN hóa — tránh nghẽn băng thông VPS khi nhiều người tải.
- **Update endpoint:** path/subdomain riêng phục vụ Tauri update manifest.
- **Cache:** Cloudflare cache static + artifact; HTML `releases.json` cache ngắn (vài phút) để cập nhật nhanh.
- **Giám sát:** uptime check + log tải (đếm lượt download theo nền tảng → đưa vào RAI Admin analytics).

---

## 7. SEO / GIỚI THIỆU SẢN PHẨM

- Trang `/` và `/product` là nội dung marketing đầy đủ về RAI OS: vấn đề giải quyết, cách hoạt động (Venture Builder + 8 engine), các giải pháp (Big Data, RAI LLMs, Marketplace, Code, Apps, MCP, Platform), ảnh/video demo.
- Meta tags + Open Graph + JSON-LD (`SoftwareApplication`) để hiển thị đẹp khi chia sẻ và lên kết quả tìm kiếm.
- Đa ngôn ngữ: mặc định tiếng Việt, có thể thêm English sau (hreflang).
- Sitemap + robots; tốc độ tải nhanh (static + CDN) cho điểm Core Web Vitals tốt.

---

## 8. STACK ĐỀ XUẤT

- **Hub site:** React + Vite + TS + Tailwind (đồng bộ hệ RAI). Có thể tách riêng repo `rai-app-hub` hoặc nằm chung monorepo.
- **PWA:** Workbox 7 + Vite PWA plugin.
- **Desktop/Mobile:** Tauri v2 (Rust core) — hoặc Capacitor cho mobile nếu ưu tiên độ trưởng thành store.
- **Extension:** WebExtension + MV3, build bằng Vite; wrapper Safari qua Xcode.
- **CI/CD:** GitHub Actions (matrix OS) + fastlane (tùy chọn).
- **Phân phối artifact:** GCS bucket + Cloudflare CDN.

---

## 9. KẾ HOẠCH TRIỂN KHAI (PHASES)

| Phase | Nội dung |
|---|---|
| **P1** | Hub site (landing + `/downloads` + `/releases`) đọc `releases.json` (mock) + platform detection + nút tải thông minh. |
| **P2** | PWA hóa web app RAI OS (manifest + service worker + nút cài) — bản "tải về" đầu tiên, không cần store. |
| **P3** | Desktop Tauri v2 (Win/mac/Linux) + ký số + auto-update + nối `releases.json`. |
| **P4** | Extension MV3 (Chrome/Edge/Firefox) + Safari wrapper; publish các store. |
| **P5** | Mobile (Tauri/Capacitor) → App Store + Google Play; CI/CD matrix hoàn chỉnh. |

> Trong môi trường artifact/preview: làm **P1** (hub site + mock `releases.json`) trước để có giao diện chạy được. Các bản native build ngoài môi trường này (cần runner OS + chứng chỉ ký).

---

## 10. RÀNG BUỘC & QUY ƯỚC

- **Một codebase frontend → mọi nền tảng.** Mọi shell bọc cùng web app RAI OS; tránh chia nhánh logic theo nền tảng trừ phần native bắt buộc.
- **Ký số bắt buộc** cho desktop & mobile (2026 yêu cầu để qua cảnh báo bảo mật và store review).
- **Secret chỉ ở CI/Secret Manager**, không commit; hub site không chứa key.
- **`releases.json` là nguồn sự thật** cho cả hub & auto-update.
- **Tiếng Việt-first**; thương hiệu "RAI OS"; tuân thủ chính sách store (Apple/Google/Microsoft/Mozilla).
- **Không nghẽn VPS:** artifact lớn để CDN/bucket, VPS chỉ phục vụ HTML + JSON nhẹ.

---

## 11. FILE LIÊN QUAN

```
CLAUDE.md                          ← bộ nhớ dự án
docs/rai-app-hub-spec.md           ← FILE NÀY
docs/rai-os-workspace-spec.md      ← web app được bọc
public/manifest.webmanifest        ← PWA manifest
public/sw.js                       ← service worker (Workbox)
src-tauri/tauri.conf.json          ← cấu hình desktop/mobile
extension/manifest.json            ← MV3
releases.json                      ← nguồn sự thật phát hành
.github/workflows/release.yml      ← CI/CD matrix
```

*Hết tài liệu. Đặt tại `docs/rai-app-hub-spec.md`, tham chiếu từ `CLAUDE.md`.*
