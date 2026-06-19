# RAI OS Mobile — publish checklist

Publish dùng **API credentials** (không phải mật khẩu tài khoản) + build trên CI.
Tạo các giá trị dưới đây trong console rồi thêm vào **GitHub → repo → Settings →
Secrets and variables → Actions**. Sau đó tôi bấm chạy workflow `Mobile release`.

## Google Play (Android) — app đã tạo sẵn (vn.raiholdings.os)
1. **Service account JSON** (quyền publish):
   - Google Cloud Console (cùng tài khoản) → IAM & Admin → Service Accounts → tạo SA → tạo key JSON.
   - Play Console → Setup → **API access** → liên kết project + cấp quyền "Release to testing tracks" cho SA đó.
   - → Secret `PLAY_SERVICE_ACCOUNT_JSON` = toàn bộ nội dung file JSON.
2. **Keystore ký app** (nếu không dùng Play App Signing tự sinh):
   - `keytool -genkey -v -keystore rai-os.keystore -alias rai-os -keyalg RSA -keysize 2048 -validity 9125`
   - `base64 -i rai-os.keystore` → Secret `ANDROID_KEYSTORE_BASE64`
   - + `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS` (=rai-os), `ANDROID_KEY_PASSWORD`

## Apple App Store (iOS)
1. App Store Connect → **Users and Access → Integrations → App Store Connect API** → tạo key (role: App Manager):
   - tải file `.p8` (chỉ tải 1 lần), ghi **Key ID** + **Issuer ID**.
   - `base64 -i AuthKey_XXX.p8` → Secret `ASC_KEY_P8_BASE64`
   - → Secrets `ASC_KEY_ID`, `ASC_ISSUER_ID`
2. Tạo **App record** trong App Store Connect với bundle id `vn.raiholdings.os`.
3. Ký số iOS (distribution cert + provisioning profile) — khuyến nghị dùng `fastlane match`,
   hoặc cung cấp `IOS_DIST_CERT_P12_BASE64` + `IOS_DIST_CERT_PASSWORD` + `IOS_PROVISIONING_PROFILE_BASE64`.

## Sau khi đủ secrets
- Báo tôi → tôi chạy GitHub Actions `Mobile release` (workflow_dispatch) →
  Android lên **Play internal**, iOS lên **TestFlight** → bạn duyệt review → production.
- Có store URL → tôi cập nhật `app-hub/public/releases.json` (ios/android store_url) → hub /downloads hiện nút.

> ⚠️ Không chia sẻ mật khẩu tài khoản Apple/Google. Chỉ cần các secret API ở trên.
