# Hướng dẫn nộp ứng dụng lên RAI Apps

> Dành cho nhà phát triển muốn đưa **ứng dụng** của mình lên thư mục `/apps` của RAI ONE.
> Chuẩn tuân thủ: **MCP Apps Extension (SEP-1865)**.

## 1. Ứng dụng là gì trên RAI Apps

Một **ứng dụng** = một **MCP server** đăng ký:
- ít nhất một **UI resource** (`ui://...`, mimeType `text/html+mcp`) — template HTML render trong iframe sandbox;
- một hoặc nhiều **tool** (hành động), tham chiếu UI resource qua `_meta["ui/resourceUri"]`;
- **fallback text** cho mọi tool — để host chỉ-text vẫn dùng được.

RAI ONE là **host**: prefetch template, render UI trong iframe sandbox, định tuyến hội thoại, xin **chấp thuận** người dùng cho mọi tool call khởi tạo từ UI, và ghi **audit log**.

## 2. Yêu cầu bắt buộc

- [ ] Server expose endpoint `/mcp` hợp lệ (JSON-RPC qua HTTP + postMessage).
- [ ] Mỗi UI resource có `uri` dạng `ui://<vendor>/<name>` và `mimeType: text/html+mcp`.
- [ ] Mỗi tool có UI **đều** trả `content: [{ type: "text", text: <fallback> }]` cùng `structuredContent`.
- [ ] Widget giao tiếp host **chỉ** qua MCP JSON-RPC (`@modelcontextprotocol/sdk`) — không tự chế giao thức.
- [ ] Widget chạy được trong iframe `sandbox="allow-scripts"` (KHÔNG dựa vào `allow-same-origin`).
- [ ] Khai báo rõ **scope quyền** (ví dụ `read:listings`, `run:workflow`).

## 3. Nhận diện trong widget

- Font **Montserrat**; màu **Navy `#0F2A47`** + **Gold `#C9A227`** + Blue `#2E75B6`.
- Phong cách macOS glassmorphism, **nền trong suốt**, widget gọn trong iframe.
- Từ vựng nhất quán (tiếng Việt): **trợ lý ảo** = AI agent · **đợt làm việc** = sprint · **ứng dụng** = app · **kết nối** = connect.

## 4. Quy trình duyệt

`draft → submitted → in_review → approved / rejected`

Form nộp cần: tên, mô tả, danh mục, URL MCP server, icon, ảnh chụp UI, scope quyền.

**Validate tự động:** kiểm tra `/mcp` phản hồi đúng, có UI resource `ui://` + `text/html+mcp`, mọi tool có fallback text.

**Checklist kiểm duyệt:**
- Phạm vi rõ ràng (một việc, làm tốt).
- Trực quan trong hội thoại (UI có giá trị, không chỉ là text trá hình).
- Mang giá trị thật cho người dùng.
- An toàn: không tự cấp quyền nhạy cảm; cảnh giác prompt injection khi kéo nội dung web không tin cậy.

Khi `approved`, ứng dụng tự được thêm vào registry và xuất hiện ở `/apps`.

## 5. Kiểm thử local

1. Chạy MCP server của bạn ở chế độ developer.
2. Mở `/apps/host` (host thử nghiệm), gõ `@` để **kết nối** và gọi ứng dụng.
3. Kiểm tra: widget render đúng, tool call hiện hộp **chấp thuận**, mọi thông điệp xuất hiện trong **audit log**, và **fallback text** đúng khi bật "Host chỉ-text".

---
*Tài liệu nội bộ RAI Holdings — RAI Apps — v1.0.*
