import { t, type T } from "@/lib/i18n-core";

// RAI app launcher catalog (Google-style grid). `external` opens a new tab.
// In-workspace features point to /workspace/* so they run inside the shell.
// Platform/product landings point to /workspace/platform/[slug] — app surfaces
// inside RAI OS (content from src/lib/ventures.ts).
export type RaiAppItem = { name: T; desc: T; icon: string; color: string; href: string; external?: boolean };
export type RaiAppGroup = { label: T; items: RaiAppItem[] };

export const raiAppGroups: RaiAppGroup[] = [
  {
    label: t("In your workspace", "Trong workspace"),
    items: [
      { name: t("Venture Builder", "Venture Builder"), desc: t("Turn an idea into a company with 8 AI agents.", "Biến ý tưởng thành công ty với 8 AI agent."), icon: "sparkles", color: "#378ADD", href: "/workspace" },
      { name: t("Ventures", "Doanh nghiệp"), desc: t("Your AI-native companies.", "Các công ty AI-native của bạn."), icon: "building", color: "#0C447C", href: "/workspace/ventures" },
      { name: t("Big Data", "Big Data"), desc: t("Look up ~1M Vietnamese companies.", "Tra cứu ~1 triệu doanh nghiệp VN."), icon: "database", color: "#0F6E56", href: "/workspace/data" },
      { name: t("RAI LLMs", "RAI LLMs"), desc: t("One API for every model.", "Một API cho mọi mô hình."), icon: "cpu", color: "#6D28D9", href: "/workspace/llms" },
      { name: t("Engines", "Engine"), desc: t("The 8 venture engines.", "8 engine của venture."), icon: "settings", color: "#3B6D11", href: "/workspace/engines" },
      { name: t("Billing", "Thanh toán"), desc: t("Credits, top-ups, invoices.", "Credit, nạp tiền, hóa đơn."), icon: "receipt", color: "#B45309", href: "/workspace/billing" },
    ],
  },
  {
    label: t("RAI Solutions", "Giải pháp RAI"),
    items: [
      { name: t("Marketplace", "Chợ ứng dụng"), desc: t("Templates, agents, datasets & services.", "Template, agent, dataset & dịch vụ."), icon: "cart", color: "#C9A227", href: "/workspace/marketplace" },
      { name: t("Code", "Mã nguồn"), desc: t("Build & deploy apps and automations.", "Dựng & triển khai app, automation."), icon: "stack", color: "#0EA5E9", href: "/workspace/code" },
      { name: t("RAI Apps", "RAI Apps"), desc: t("Install AI apps into ventures.", "Cài app AI vào venture."), icon: "box", color: "#DB2777", href: "/workspace/apps" },
      { name: t("MCP", "MCP"), desc: t("Tools agents can call (MCP servers).", "Công cụ agent gọi (máy chủ MCP)."), icon: "server", color: "#475569", href: "/workspace/mcp" },
      { name: t("Platform", "Nền tảng"), desc: t("Software & platform catalog.", "Danh mục nền tảng & phần mềm."), icon: "grid", color: "#0891B2", href: "/platform" },
      { name: t("Portfolio", "Danh mục"), desc: t("RAI ecosystem companies.", "Các công ty hệ sinh thái RAI."), icon: "trending-up", color: "#0F2A47", href: "/portfolio" },
    ],
  },
  {
    label: t("RAI products", "Sản phẩm RAI"),
    items: [
      { name: t("RAI GPT", "RAI GPT"), desc: t("AI workspace for Vietnamese business.", "Không gian làm việc AI cho doanh nghiệp Việt."), icon: "sparkles", color: "#6D28D9", href: "/workspace/platform/rai-gpt" },
      { name: t("RAI Chatbot", "RAI Chatbot"), desc: t("Multi-channel AI customer care.", "Chatbot AI chăm sóc khách đa kênh."), icon: "message", color: "#0EA5E9", href: "/workspace/platform/rai-chatbot" },
      { name: t("RAI Agent", "RAI Agent"), desc: t("Production multi-agent framework.", "Framework multi-agent cho production."), icon: "robot", color: "#DB2777", href: "/workspace/platform/rai-agent" },
      { name: t("RAI Data", "RAI Data"), desc: t("Unified, AI-ready data warehouse.", "Kho dữ liệu hợp nhất, sẵn cho AI."), icon: "database", color: "#0F6E56", href: "/workspace/platform/rai-data" },
      { name: t("RAI CDP", "RAI CDP"), desc: t("Customer data platform.", "Nền tảng dữ liệu khách hàng."), icon: "users", color: "#B45309", href: "/workspace/platform/rai-cdp" },
      { name: t("RAI n8n", "RAI n8n"), desc: t("Low-code workflow automation.", "Tự động hóa quy trình low-code."), icon: "settings", color: "#C9A227", href: "/workspace/platform/rai-n8n" },
      { name: t("RAI Odoo", "RAI Odoo"), desc: t("End-to-end Odoo ERP delivery.", "Triển khai ERP Odoo trọn gói."), icon: "building", color: "#7A5CFF", href: "/workspace/platform/rai-odoo" },
      { name: t("RAI ERPNext", "RAI ERPNext"), desc: t("Open-source ERP, localized.", "ERP mã nguồn mở, bản địa hóa."), icon: "stack", color: "#0891B2", href: "/workspace/platform/rai-erpnext" },
      { name: t("RAI Travel", "RAI Travel"), desc: t("AI-planned travel platform.", "Nền tảng du lịch lên lịch bằng AI."), icon: "world", color: "#0C447C", href: "/workspace/platform/rai-travel" },
      { name: t("RAI Commerce", "RAI Commerce"), desc: t("Sell everywhere, manage in one place.", "Bán mọi nơi, quản lý một chỗ."), icon: "shopping-bag", color: "#B91C1C", href: "/workspace/platform/rai-commerce" },
      { name: t("RAI Ads", "RAI Ads"), desc: t("AI-run ad campaigns.", "Chiến dịch quảng cáo vận hành bằng AI."), icon: "megaphone", color: "#3B6D11", href: "/workspace/platform/rai-ads" },
    ],
  },
  {
    label: t("RAI ecosystem", "Hệ sinh thái RAI"),
    items: [
      { name: t("RAI Social", "RAI Social"), desc: t("The RAI social network & single sign-on.", "Mạng xã hội RAI & đăng nhập chung."), icon: "users", color: "#C9A227", href: "/workspace/platform/rai-social" },
      { name: t("RAI Music", "RAI Music"), desc: t("RAI music platform.", "Nền tảng âm nhạc RAI."), icon: "music", color: "#9333EA", href: "/workspace/platform/rai-music" },
      { name: t("RAI Times", "RAI Times"), desc: t("RAI news & media.", "Tin tức & truyền thông RAI."), icon: "file-text", color: "#B91C1C", href: "/workspace/platform/rai-times" },
      { name: t("RAI Holdings", "RAI Holdings"), desc: t("The RAI Holdings home site.", "Trang chủ RAI Holdings."), icon: "home", color: "#378ADD", href: "https://raiholdings.vn", external: true },
    ],
  },
];

export const raiAppsFlat: RaiAppItem[] = raiAppGroups.flatMap((g) => g.items);
