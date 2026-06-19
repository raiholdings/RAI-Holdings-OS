# RAI OS Desktop (Tauri v2) — P3 scaffold

Đóng gói RAI OS thành app desktop Win/macOS/Linux. **Thin shell** mở web app sống
tại `workspace.raiholdings.vn` + auto-update qua Tauri updater.

> ⚠️ Không build được trong môi trường preview/artifact — cần **Rust** + runner OS
> tương ứng + chứng chỉ ký. Build trên máy bạn hoặc qua CI (`.github/workflows/desktop-release.yml`).

## Cấu trúc
```
desktop/
├── shell/index.html              ← thin shell (mở workspace.raiholdings.vn)
└── src-tauri/
    ├── tauri.conf.json           ← productName/bundle targets/updater endpoint
    ├── Cargo.toml · build.rs · src/main.rs
    ├── capabilities/default.json ← quyền (updater, shell)
    └── icons/icon.png            ← icon nguồn (tauri icon sinh phần còn lại)
```

## Build local (1 lần cài Rust + Tauri CLI)
```bash
# Prereqs: Rust (rustup), và deps hệ điều hành theo tauri.app/start/prerequisites
npm i -g @tauri-apps/cli            # hoặc dùng npx @tauri-apps/cli
cd desktop
tauri icon src-tauri/icons/icon.png # sinh 32/128/icns/ico từ icon.png (1 lần)
tauri build                         # → src-tauri/target/release/bundle/{msi,nsis,dmg,appimage,deb}
```
Chạy thử: `cd desktop && tauri dev`.

## Ký số (bắt buộc 2026)
- **Updater:** `tauri signer generate -w ~/.tauri/rai-os.key` → dán **public key** vào
  `tauri.conf.json > plugins.updater.pubkey`; private key + mật khẩu để ở GitHub Secrets
  (`TAURI_SIGNING_PRIVATE_KEY`, `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`).
- **macOS:** Apple Developer ID + notarization (secrets `APPLE_*`).
- **Windows:** code signing cert (EV khuyến nghị).

## Phát hành (CI)
Tag `vX.Y.Z` → workflow build cả 3 OS, ký, tạo GitHub Release (draft) + `latest.json` (updater).
Sau đó:
1. Tải artifact → đặt lên **GCS/Cloudflare R2** hoặc giữ ở GitHub Releases (CDN hoá).
2. Cập nhật `app-hub/public/releases.json` với URL + size thật từng nền tảng (nguồn sự thật cho hub `/downloads`).
3. Phục vụ **update endpoint** `update.raiholdings.vn/{target}/{arch}/{current}` trả `latest.json`
   (Caddy trên VM tại `/opt/rai/updates`, hoặc trỏ GitHub Releases).

## Liên kết
- Hub đọc `releases.json` để hiện nút tải (xem `app-hub/`).
- Spec: `docs/rai-app-hub-spec.md` §3.2, §5.
