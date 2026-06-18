import { t, type T } from "@/lib/i18n-core";

// RAI app launcher catalog (Google-style grid). `external` opens a new tab.
export type RaiAppItem = { name: T; icon: string; color: string; href: string; external?: boolean };
export type RaiAppGroup = { label: T; items: RaiAppItem[] };

export const raiAppGroups: RaiAppGroup[] = [
  {
    label: t("In your workspace", "Trong workspace"),
    items: [
      { name: t("Venture Builder", "Venture Builder"), icon: "sparkles", color: "#378ADD", href: "/workspace" },
      { name: t("Ventures", "Doanh nghiệp"), icon: "building", color: "#0C447C", href: "/workspace/ventures" },
      { name: t("Big Data", "Big Data"), icon: "database", color: "#0F6E56", href: "/bigdata" },
      { name: t("RAI LLMs", "RAI LLMs"), icon: "cpu", color: "#6D28D9", href: "/llms" },
      { name: t("Engines", "Engine"), icon: "settings", color: "#3B6D11", href: "/workspace/engines" },
      { name: t("Billing", "Thanh toán"), icon: "receipt", color: "#B45309", href: "/workspace/billing" },
    ],
  },
  {
    label: t("RAI Solutions", "Giải pháp RAI"),
    items: [
      { name: t("Marketplace", "Chợ ứng dụng"), icon: "cart", color: "#C9A227", href: "/marketplace" },
      { name: t("Code", "Mã nguồn"), icon: "stack", color: "#0EA5E9", href: "/code" },
      { name: t("RAI Apps", "RAI Apps"), icon: "box", color: "#DB2777", href: "/apps" },
      { name: t("MCP", "MCP"), icon: "server", color: "#475569", href: "/mcp" },
      { name: t("Platform", "Nền tảng"), icon: "grid", color: "#0891B2", href: "/platform" },
      { name: t("Portfolio", "Danh mục"), icon: "trending-up", color: "#0F2A47", href: "/portfolio" },
    ],
  },
  {
    label: t("RAI ecosystem", "Hệ sinh thái RAI"),
    items: [
      { name: t("RAI Social", "RAI Social"), icon: "world", color: "#1D4ED8", href: "https://raisocial.vn", external: true },
      { name: t("RAI Music", "RAI Music"), icon: "music", color: "#9333EA", href: "https://raimusic.vn", external: true },
      { name: t("RAI Times", "RAI Times"), icon: "file-text", color: "#B91C1C", href: "https://www.raitimes.com", external: true },
      { name: t("RAI Holdings", "RAI Holdings"), icon: "home", color: "#378ADD", href: "https://raiholdings.vn", external: true },
    ],
  },
];
