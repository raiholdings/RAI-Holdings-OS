import { t, type T } from "@/lib/i18n-core";

// RAI app launcher catalog (Google-style grid). `external` opens a new tab.
// In-workspace features point to /workspace/* so they run inside the shell.
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
    label: t("RAI ecosystem", "Hệ sinh thái RAI"),
    items: [
      { name: t("RAI Social", "RAI Social"), desc: t("The RAI social network.", "Mạng xã hội RAI."), icon: "world", color: "#1D4ED8", href: "https://raisocial.vn", external: true },
      { name: t("RAI Music", "RAI Music"), desc: t("RAI music platform.", "Nền tảng âm nhạc RAI."), icon: "music", color: "#9333EA", href: "https://raimusic.vn", external: true },
      { name: t("RAI Times", "RAI Times"), desc: t("RAI news & media.", "Tin tức & truyền thông RAI."), icon: "file-text", color: "#B91C1C", href: "https://www.raitimes.com", external: true },
      { name: t("RAI Holdings", "RAI Holdings"), desc: t("The RAI Holdings home site.", "Trang chủ RAI Holdings."), icon: "home", color: "#378ADD", href: "https://raiholdings.vn", external: true },
    ],
  },
];

export const raiAppsFlat: RaiAppItem[] = raiAppGroups.flatMap((g) => g.items);
