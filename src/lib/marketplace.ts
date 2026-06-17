/**
 * RAI Marketplace — catalog data layer (commerce layer over /apps + /mcp).
 * A listing only adds commercial metadata (price, plans, publisher, rating)
 * and points to a technical artifact via artifactRef — it never duplicates run
 * logic. Prices are in VND. In-memory seed; production = PostgreSQL.
 */
import { t, type T } from "@/lib/i18n-core";

export type ListingType = "app" | "mcp_server" | "workflow" | "model";
export type Category = "realestate" | "design" | "productivity" | "data" | "security" | "marketing";
export type Compatibility = "rai_os" | "claude_code" | "claude_desktop";
export type PlanType = "free" | "flat_rate" | "per_unit";
export type ListingStatus = "approved" | "submitted" | "in_review" | "rejected" | "suspended";

export type PricingPlan = {
  id: string;
  name: T;
  type: PlanType;
  priceMonthly: number; // VND
  priceYearly: number; // VND
  perUnitName?: T;
  features: T[];
  hasFreeTrial: boolean;
  trialDays: number;
  availableFor: "personal" | "org" | "both";
};

export type Publisher = { id: string; name: string; type: "individual" | "organization"; verified: boolean };

export type Listing = {
  id: string;
  slug: string;
  name: string;
  tagline: T;
  description: T;
  icon: string;
  color: string;
  type: ListingType;
  categories: Category[];
  compatibility: Compatibility[];
  artifactRef: { kind: "app" | "mcp" | "workflow"; id: string };
  publisherId: string;
  rating: number;
  installCount: number;
  status: ListingStatus;
  featured?: boolean;
  reviewerNote?: string;
  plans: PricingPlan[];
};

/* ----------------------------- label maps ------------------------------- */
export const typeLabels: Record<ListingType, T> = {
  app: t("App", "Ứng dụng"),
  mcp_server: t("MCP Server", "MCP Server"),
  workflow: t("Workflow", "Workflow"),
  model: t("Model", "Model"),
};
export const categoryLabels: Record<Category, T> = {
  realestate: t("Real estate", "Bất động sản"),
  design: t("Design", "Thiết kế"),
  productivity: t("Productivity", "Năng suất"),
  data: t("Data", "Dữ liệu"),
  security: t("Security", "Bảo mật"),
  marketing: t("Marketing", "Marketing"),
};
export const compatLabels: Record<Compatibility, T> = {
  rai_os: t("RAI OS", "RAI OS"),
  claude_code: t("Claude Code", "Claude Code"),
  claude_desktop: t("Claude Desktop", "Claude Desktop"),
};

export const formatVnd = (n: number) => (n === 0 ? "0₫" : n.toLocaleString("vi-VN") + "₫");

/* ----------------------------- publishers ------------------------------- */
const PUBLISHERS: Publisher[] = [
  { id: "pub-rai", name: "RAI Holdings", type: "organization", verified: true },
  { id: "pub-minhphat", name: "Minh Phát Studio", type: "organization", verified: true },
  { id: "pub-opc-anh", name: "OPC · Tuấn Anh", type: "individual", verified: false },
];
const seedPublishers: Record<string, Publisher> = Object.fromEntries(PUBLISHERS.map((p) => [p.id, p]));

/* ----------------------------- plan helpers ----------------------------- */
const freePlan = (features: T[]): PricingPlan => ({ id: "free", name: t("Free", "Miễn phí"), type: "free", priceMonthly: 0, priceYearly: 0, features, hasFreeTrial: false, trialDays: 0, availableFor: "both" });
const flat = (id: string, name: T, m: number, y: number, features: T[], trial = true): PricingPlan => ({ id, name, type: "flat_rate", priceMonthly: m, priceYearly: y, features, hasFreeTrial: trial, trialDays: 14, availableFor: "both" });
const perUnit = (id: string, name: T, m: number, y: number, unit: T, features: T[]): PricingPlan => ({ id, name, type: "per_unit", priceMonthly: m, priceYearly: y, perUnitName: unit, features, hasFreeTrial: true, trialDays: 14, availableFor: "org" });

/* ----------------------------- seed listings ---------------------------- */
const SEED: Listing[] = [
  {
    id: "lst-1", slug: "rai-property", name: "RAI Property", tagline: t("Interactive real-estate map inside chat.", "Bản đồ bất động sản tương tác trong hội thoại."),
    description: t("Search and explore listings on an interactive map, view details, and request advisory — rendered directly in chat. Pluggable with live brokerage data.", "Tìm và khám phá BĐS trên bản đồ tương tác, xem chi tiết, yêu cầu tư vấn — render thẳng trong chat. Cắm được dữ liệu sàn thật."),
    icon: "home", color: "#2E75B6", type: "app", categories: ["realestate"], compatibility: ["rai_os", "claude_desktop"], artifactRef: { kind: "app", id: "property" }, publisherId: "pub-rai", rating: 4.8, installCount: 1243, status: "approved", featured: true,
    plans: [
      freePlan([t("Up to 50 listings", "Tối đa 50 BĐS"), t("Map + cards in chat", "Bản đồ + card trong chat")]),
      flat("pro", t("Pro", "Pro"), 290000, 2900000, [t("Unlimited listings", "BĐS không giới hạn"), t("Live brokerage data", "Dữ liệu sàn thật"), t("Advisory pipeline", "Pipeline tư vấn")]),
    ],
  },
  {
    id: "lst-2", slug: "rai-designer", name: "RAI Designer", tagline: t("Generate layouts on a canvas in chat.", "Sinh layout trên canvas trong hội thoại."),
    description: t("Describe what you want and RAI Designer generates a layout you can iterate and export. Brings the RAI design platform into the conversation.", "Mô tả mong muốn và RAI Designer sinh layout để lặp lại và xuất ảnh. Đưa nền tảng thiết kế RAI vào hội thoại."),
    icon: "sparkles", color: "#C9A227", type: "app", categories: ["design", "marketing"], compatibility: ["rai_os"], artifactRef: { kind: "app", id: "designer" }, publisherId: "pub-rai", rating: 4.7, installCount: 642, status: "approved", featured: true,
    plans: [
      freePlan([t("10 designs / month", "10 thiết kế / tháng")]),
      flat("studio", t("Studio", "Studio"), 490000, 4900000, [t("Unlimited designs", "Thiết kế không giới hạn"), t("HD export", "Xuất HD"), t("Brand kit", "Brand kit")]),
    ],
  },
  {
    id: "lst-3", slug: "rai-workflow", name: "RAI Workflow", tagline: t("Run n8n automations by natural language.", "Chạy automation n8n bằng ngôn ngữ tự nhiên."),
    description: t("Trigger automations from chat and track progress step by step. The AI agent runs the sprint while you watch.", "Kích hoạt automation từ chat và theo dõi từng bước. Trợ lý ảo chạy đợt làm việc, bạn theo dõi."),
    icon: "bolt", color: "#0F2A47", type: "workflow", categories: ["productivity"], compatibility: ["rai_os", "claude_code"], artifactRef: { kind: "app", id: "workflow" }, publisherId: "pub-rai", rating: 4.6, installCount: 511, status: "approved",
    plans: [
      freePlan([t("3 active workflows", "3 workflow đang chạy")]),
      perUnit("team", t("Team", "Team"), 99000, 990000, t("per seat", "mỗi người dùng"), [t("Unlimited workflows", "Workflow không giới hạn"), t("Shared library", "Thư viện dùng chung")]),
    ],
  },
  {
    id: "lst-4", slug: "rai-property-search-mcp", name: "RAI Property Search (MCP)", tagline: t("MCP server for property data in any client.", "MCP server cho dữ liệu BĐS ở mọi client."),
    description: t("Connect the RAI property dataset to Claude Code, Claude Desktop, or any MCP client. Metadata in the registry; install via npm.", "Kết nối dữ liệu BĐS RAI tới Claude Code, Desktop hay mọi MCP client. Metadata ở registry; cài qua npm."),
    icon: "database", color: "#2E75B6", type: "mcp_server", categories: ["realestate", "data"], compatibility: ["claude_code", "claude_desktop", "rai_os"], artifactRef: { kind: "mcp", id: "vn.rai/property-search" }, publisherId: "pub-rai", rating: 4.5, installCount: 980, status: "approved",
    plans: [freePlan([t("Full API access", "Toàn quyền API"), t("Community support", "Hỗ trợ cộng đồng")])],
  },
  {
    id: "lst-5", slug: "minhphat-listing-sync", name: "Listing Sync Pro", tagline: t("Sync property listings across portals.", "Đồng bộ tin đăng BĐS đa kênh."),
    description: t("Automation that syncs listings from your CRM to property portals and social channels, with AI-written copy.", "Automation đồng bộ tin đăng từ CRM tới các cổng BĐS và mạng xã hội, nội dung do AI viết."),
    icon: "send", color: "#1D9E75", type: "workflow", categories: ["realestate", "marketing"], compatibility: ["rai_os"], artifactRef: { kind: "workflow", id: "listing-sync" }, publisherId: "pub-minhphat", rating: 4.4, installCount: 320, status: "approved",
    plans: [flat("standard", t("Standard", "Tiêu chuẩn"), 390000, 3900000, [t("5 portals", "5 cổng"), t("AI copywriting", "AI viết nội dung"), t("Daily sync", "Đồng bộ hằng ngày")])],
  },
  {
    id: "lst-6", slug: "opc-meeting-notes", name: "Meeting Notes Agent", tagline: t("AI agent that summarizes meetings.", "Trợ lý ảo tóm tắt cuộc họp."),
    description: t("A simple AI agent that turns meeting transcripts into action items and summaries. Free and open.", "Trợ lý ảo đơn giản biến biên bản họp thành đầu việc và tóm tắt. Miễn phí, mở."),
    icon: "file-text", color: "#7A5CFF", type: "app", categories: ["productivity"], compatibility: ["rai_os", "claude_desktop"], artifactRef: { kind: "app", id: "meeting-notes" }, publisherId: "pub-opc-anh", rating: 4.2, installCount: 142, status: "approved",
    plans: [freePlan([t("Unlimited summaries", "Tóm tắt không giới hạn"), t("Export to Markdown", "Xuất Markdown")])],
  },
];

/* ----------------------------- store ------------------------------------ */
const store: Listing[] = [...SEED];

export function getPublisher(id: string): Publisher | undefined {
  return seedPublishers[id];
}
export function allPublishers(): Publisher[] { return PUBLISHERS; }

/* ----------------------------- queries ---------------------------------- */
export type ListParams = {
  type?: ListingType; category?: Category; price?: "free" | "paid" | "trial"; compat?: Compatibility;
  verifiedOnly?: boolean; search?: string; limit?: number; cursor?: number;
};
export type ListResult = { listings: Listing[]; count: number; nextCursor?: number };

function cheapestPaid(l: Listing): PricingPlan | undefined {
  return l.plans.filter((p) => p.type !== "free").sort((a, b) => a.priceMonthly - b.priceMonthly)[0];
}
export function listingPriceBadge(l: Listing): { free: boolean; from?: number; trial: boolean } {
  const paid = cheapestPaid(l);
  return { free: l.plans.some((p) => p.type === "free"), from: paid?.priceMonthly, trial: l.plans.some((p) => p.hasFreeTrial) };
}

export function listListings(params: ListParams, extra: Listing[] = []): ListResult {
  const limit = params.limit ?? 9;
  let rows = [...store, ...extra].filter((l) => l.status === "approved");
  if (params.type) rows = rows.filter((l) => l.type === params.type);
  if (params.category) rows = rows.filter((l) => l.categories.includes(params.category!));
  if (params.compat) rows = rows.filter((l) => l.compatibility.includes(params.compat!));
  if (params.verifiedOnly) rows = rows.filter((l) => getPublisher(l.publisherId)?.verified);
  if (params.price === "free") rows = rows.filter((l) => l.plans.some((p) => p.type === "free"));
  if (params.price === "paid") rows = rows.filter((l) => l.plans.some((p) => p.type !== "free"));
  if (params.price === "trial") rows = rows.filter((l) => l.plans.some((p) => p.hasFreeTrial));
  if (params.search) {
    const q = params.search.toLowerCase();
    rows = rows.filter((l) => (l.name + " " + JSON.stringify(l.tagline) + " " + JSON.stringify(l.description)).toLowerCase().includes(q));
  }
  rows.sort((a, b) => b.installCount - a.installCount);
  const start = params.cursor ?? 0;
  return { listings: rows.slice(start, start + limit), count: rows.length, nextCursor: start + limit < rows.length ? start + limit : undefined };
}

export function getListingBySlug(slug: string, extra: Listing[] = []): Listing | undefined {
  return [...store, ...extra].find((l) => l.slug === slug);
}
export function featuredListings(): Listing[] { return store.filter((l) => l.featured && l.status === "approved"); }
