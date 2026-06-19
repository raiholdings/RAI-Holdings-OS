# RAI OS Browser Extension (MV3) — P4

Một codebase (`src/`) → Chrome/Edge (service_worker) + Firefox (background.scripts).
Safari cần wrapper Xcode trên macOS (P-later).

## Chức năng
- **Popup:** mở Workspace / Tạo Venture / Tra cứu Big Data; **"Lưu trang này vào RAI OS"** (trích tên DN, mô tả, SĐT, email từ trang đang xem → mở Venture Builder với ý tưởng dựng sẵn).
- **Context menu** chuột phải: "Lưu vào RAI OS" (trang/selection/link).
- **SSO:** mở `raiholdings.vn` trong tab → dùng lại phiên đăng nhập sẵn có. **Không lưu token/secret** trong extension.
- **Cài đặt:** đổi base URL (mặc định `https://raiholdings.vn`).
- Notification agent/Venture: helper sẵn (`globalThis.raiNotify`) — nối nguồn thật ở P-later.

## Build
```bash
cd extension
npm run build        # → dist/chrome  +  dist/firefox
```
Đóng gói store:
```bash
cd dist && zip -r chrome.zip chrome && zip -r firefox.zip firefox
```

## Nạp thử (unpacked)
- **Chrome/Edge:** chrome://extensions → bật Developer mode → Load unpacked → `extension/dist/chrome`.
- **Firefox:** about:debugging → This Firefox → Load Temporary Add-on → chọn `extension/dist/firefox/manifest.json`.

## Publish (cần tài khoản)
| Store | Phí | Gói |
|---|---|---|
| Chrome Web Store | $5 một lần | `dist/chrome` (zip) |
| Edge Add-ons | miễn phí | dùng chung gói Chrome |
| Firefox (AMO) | miễn phí | `dist/firefox` (zip) |
| Safari | qua App Store | wrapper Xcode trên macOS |

## Lưu ý
- Icons 16/48/128 đang dùng lại icon RAI (trình duyệt tự thu nhỏ) — thay bản đúng kích thước trước khi publish nếu muốn nét hơn.
- Quyền tối thiểu: `storage, activeTab, scripting, contextMenus, notifications` + `host_permissions: *.raiholdings.vn`. Không dùng content_scripts thường trú (chỉ inject theo yêu cầu qua `scripting`).
