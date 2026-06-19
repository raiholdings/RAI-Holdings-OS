# RAI OS Mobile (Capacitor) — P5 scaffold

Bọc web app RAI OS thành app iOS + Android (thin shell tải `workspace.raiholdings.vn`).
**Không build được trong môi trường này** — cần macOS + Xcode (iOS), Android SDK,
và tài khoản store + chứng chỉ ký.

## Cấu trúc
```
mobile/
├── package.json            ← Capacitor 7 (core/ios/android/app/splash) + assets
├── capacitor.config.ts     ← appId vn.raiholdings.os, server.url = workspace, màu nền
├── www/index.html          ← webDir (loading shell + fallback mở workspace)
├── resources/icon.png      ← icon nguồn (capacitor-assets sinh icon/splash)
└── (ios/, android/  ← sinh bằng `npx cap add`, không commit)
```

## Khởi tạo native (trên máy bạn — 1 lần)
```bash
cd mobile
npm install
npm run assets            # sinh app icon + splash từ resources/icon.png
npx cap add android       # tạo android/
npx cap add ios           # tạo ios/  (cần macOS)
npx cap sync
npm run open:android      # mở Android Studio → build AAB
npm run open:ios          # mở Xcode → build/archive IPA
```

## Yêu cầu store (bạn cung cấp tài khoản → tôi wiring CI để đẩy)
| Store | Cần |
|---|---|
| **Google Play** | Play Console ($25 một lần) · tạo app `vn.raiholdings.os` · upload key (Play App Signing) · **service account JSON** (publish API) · data safety form |
| **Apple App Store** | Apple Developer ($99/năm) · App Store Connect · App ID `vn.raiholdings.os` · **App Store Connect API key** (.p8 + Key ID + Issuer ID) · cert phân phối + provisioning profile · App Privacy |

> ⚠️ App "bọc web" cần **tính năng native** (push FCM/APNs, deep link mở `/ventures/:id`,
> splash + icon thương hiệu, đăng nhập sinh trắc tùy chọn) để qua review. Đã bật splash;
> push/deep-link thêm khi cần.

## Đẩy lên (publish)
CI `.github/workflows/mobile-release.yml` (workflow_dispatch): build AAB (Android) + IPA (iOS)
→ upload qua fastlane khi đã có secrets ở trên. Khi bạn gửi tài khoản:
1. Tôi đặt secrets (service account JSON, ASC API key, keystore, cert/profile) vào GitHub Secrets — **không commit**.
2. Bật các bước fastlane (supply / pilot+deliver), chạy workflow → app lên TestFlight/Play internal → review → production.

## Liên kết
- Khi có store URL → cập nhật `app-hub/public/releases.json` (`ios.store_url`, `android.store_url`) → hub `/downloads` tự hiện nút store.
- Spec: `docs/rai-app-hub-spec.md` §3.3, §5.
