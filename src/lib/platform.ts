/**
 * RAI Platform — global software/platform catalog (G2/Capterra-style).
 *
 * Hierarchical taxonomy (products attach only to leaf categories), multi-facet
 * filtering, structured reviews, side-by-side compare, and an AI ingestion
 * pipeline. Every field carries provenance (source + time). Compliance (SPEC §9):
 * only factual public metadata is catalogued; descriptions are RAI's own neutral
 * wording (never verbatim copy); nothing is fabricated. RAI platforms carry a
 * badge and link to /apps · /code · /mcp · /pricing.
 *
 * Server-safe + client-importable; production = PostgreSQL + full-text search.
 */
import { t, type T } from "@/lib/i18n-core";

/* ============================== taxonomy ================================ */
export type Category = { id: string; slug: string; name: T; parentId?: string; isLeaf: boolean };

export const categories: Category[] = [
  { id: "productivity", slug: "productivity", name: t("Productivity", "Năng suất"), isLeaf: false },
  { id: "notes-docs", slug: "notes-docs", name: t("Notes & docs", "Ghi chú & tài liệu"), parentId: "productivity", isLeaf: true },
  { id: "project-mgmt", slug: "project-mgmt", name: t("Project management", "Quản lý dự án"), parentId: "productivity", isLeaf: true },
  { id: "collaboration", slug: "collaboration", name: t("Collaboration", "Cộng tác"), isLeaf: false },
  { id: "team-chat", slug: "team-chat", name: t("Team chat", "Chat nhóm"), parentId: "collaboration", isLeaf: true },
  { id: "crm-sales", slug: "crm-sales", name: t("CRM & sales", "CRM & Bán hàng"), isLeaf: false },
  { id: "crm", slug: "crm", name: t("CRM", "CRM"), parentId: "crm-sales", isLeaf: true },
  { id: "marketing", slug: "marketing", name: t("Marketing", "Marketing"), isLeaf: false },
  { id: "marketing-automation", slug: "marketing-automation", name: t("Marketing automation", "Tự động hóa marketing"), parentId: "marketing", isLeaf: true },
  { id: "analytics", slug: "analytics", name: t("Data & analytics", "Phân tích dữ liệu"), isLeaf: false },
  { id: "bi-analytics", slug: "bi-analytics", name: t("BI & analytics", "BI & phân tích"), parentId: "analytics", isLeaf: true },
  { id: "ai-ml", slug: "ai-ml", name: t("AI & ML", "AI & ML"), isLeaf: false },
  { id: "ai-platform", slug: "ai-platform", name: t("AI platform", "Nền tảng AI"), parentId: "ai-ml", isLeaf: true },
  { id: "llm-tools", slug: "llm-tools", name: t("LLM tooling", "Công cụ LLM"), parentId: "ai-ml", isLeaf: true },
  { id: "dev", slug: "dev", name: t("Software development", "Phát triển phần mềm"), isLeaf: false },
  { id: "code-hosting", slug: "code-hosting", name: t("Code hosting", "Lưu trữ mã"), parentId: "dev", isLeaf: true },
  { id: "paas", slug: "paas", name: t("PaaS & deploy", "PaaS & triển khai"), parentId: "dev", isLeaf: true },
  { id: "infra-devops", slug: "infra-devops", name: t("Infrastructure & DevOps", "Hạ tầng & DevOps"), isLeaf: false },
  { id: "databases", slug: "databases", name: t("Databases", "Cơ sở dữ liệu"), parentId: "infra-devops", isLeaf: true },
  { id: "automation", slug: "automation", name: t("Automation", "Tự động hóa"), parentId: "infra-devops", isLeaf: true },
  { id: "design", slug: "design", name: t("Design", "Thiết kế"), isLeaf: false },
  { id: "design-tools", slug: "design-tools", name: t("Design tools", "Công cụ thiết kế"), parentId: "design", isLeaf: true },
  { id: "ecommerce", slug: "ecommerce", name: t("E-commerce", "Thương mại điện tử"), isLeaf: false },
  { id: "ecommerce-platform", slug: "ecommerce-platform", name: t("E-commerce platform", "Nền tảng TMĐT"), parentId: "ecommerce", isLeaf: true },
];
export const getCategory = (slug: string) => categories.find((c) => c.slug === slug);
export const leafCategories = () => categories.filter((c) => c.isLeaf);
export type CategoryNode = Category & { children: Category[] };
export function categoryTree(): CategoryNode[] {
  return categories.filter((c) => !c.parentId).map((p) => ({ ...p, children: categories.filter((c) => c.parentId === p.id) }));
}

/* ============================== facets ================================== */
export type PricingModel = "free" | "freemium" | "paid" | "contact";
export type Deployment = "cloud" | "on_prem" | "hybrid";
export type PlatformType = "web" | "desktop" | "mobile" | "api" | "cli";
export type CompanySize = "startup" | "sme" | "enterprise";
export type SourceType = "community" | "vendor" | "ai_aggregation" | "official_api";

export const pricingLabels: Record<PricingModel, T> = { free: t("Free", "Miễn phí"), freemium: t("Freemium", "Freemium"), paid: t("Paid", "Trả phí"), contact: t("Contact", "Liên hệ") };
export const deploymentLabels: Record<Deployment, T> = { cloud: t("Cloud", "Cloud"), on_prem: t("On-prem", "On-prem"), hybrid: t("Hybrid", "Hybrid") };
export const companySizeLabels: Record<CompanySize, T> = { startup: t("Startup", "Startup"), sme: t("SME", "SME"), enterprise: t("Enterprise", "Doanh nghiệp") };
export const sourceTypeLabels: Record<SourceType, T> = { community: t("Community", "Cộng đồng"), vendor: t("Vendor", "Vendor"), ai_aggregation: t("AI aggregation", "AI tổng hợp"), official_api: t("Official API", "API chính thức") };

/* ============================== model ================================== */
export type Provenance = { sourceType: SourceType; sourceName: string; sourceUrl?: string; fetchedAt: string; field?: string; confidence?: number; note?: T };
export type PricingTier = { name: string; model: PricingModel; highlights: T };
export type Platform = {
  id: string; slug: string; name: string; vendorName: string; websiteUrl: string; monogram: string; accent: string;
  shortDescription: T; longDescription: T;
  categorySlugs: string[]; // leaf categories
  useCases: { title: T; description: T }[];
  features: string[];
  integrations: string[];
  deployment: Deployment[];
  platformTypes: PlatformType[];
  openSource: boolean; licenseSpdx?: string;
  pricingModel: PricingModel; pricingTiers: PricingTier[];
  companySizeFit: CompanySize[];
  industries: string[]; regions: string[];
  isRaiPlatform: boolean; raiRefs: { label: T; href: string }[];
  ratingAvg: number; reviewCount: number; // seed = 0; community reviews build these
  status: "pending" | "published" | "rejected" | "archived";
  provenance: Provenance[];
  createdAt: string; updatedAt: string;
};

const FETCHED = "2026-06-17T00:00:00Z";
type Opts = Partial<Pick<Platform, "openSource" | "licenseSpdx" | "isRaiPlatform" | "raiRefs" | "longDescription" | "features" | "integrations" | "useCases" | "industries" | "regions" | "pricingTiers" | "provenance">>;
function mk(slug: string, name: string, vendorName: string, websiteUrl: string, accent: string, categorySlugs: string[], pricingModel: PricingModel, deployment: Deployment[], platformTypes: PlatformType[], companySizeFit: CompanySize[], shortDescription: T, o: Opts = {}): Platform {
  const isRai = o.isRaiPlatform ?? false;
  return {
    id: `pf-${slug}`, slug, name, vendorName, websiteUrl, monogram: name.replace(/[^A-Za-z]/g, "").slice(0, 2).toUpperCase(), accent,
    shortDescription, longDescription: o.longDescription ?? shortDescription,
    categorySlugs, useCases: o.useCases ?? [], features: o.features ?? [], integrations: o.integrations ?? [],
    deployment, platformTypes, openSource: o.openSource ?? false, licenseSpdx: o.licenseSpdx,
    pricingModel, pricingTiers: o.pricingTiers ?? [], companySizeFit, industries: o.industries ?? [], regions: o.regions ?? ["global"],
    isRaiPlatform: isRai, raiRefs: o.raiRefs ?? [],
    ratingAvg: 0, reviewCount: 0, status: "published",
    provenance: o.provenance ?? [{ sourceType: isRai ? "vendor" : "vendor", sourceName: vendorName, sourceUrl: websiteUrl, fetchedAt: FETCHED, note: t("Factual metadata from the vendor's public site; description is RAI's own neutral wording.", "Dữ kiện factual từ trang công khai của vendor; mô tả là giọng trung lập của RAI.") }],
    createdAt: "2026-06-01T00:00:00Z", updatedAt: FETCHED,
  };
}

const SEED: Platform[] = [
  mk("notion", "Notion", "Notion Labs", "https://notion.so", "#111111", ["notes-docs", "project-mgmt"], "freemium", ["cloud"], ["web", "desktop", "mobile"], ["startup", "sme", "enterprise"],
    t("All-in-one workspace for notes, docs, and projects.", "Không gian làm việc all-in-one cho ghi chú, tài liệu và dự án."),
    { features: ["Docs", "Databases", "Wikis"], integrations: ["Slack", "GitHub", "Google Drive"], industries: ["technology", "media"], useCases: [{ title: t("Team wiki", "Wiki nhóm"), description: t("A single source of truth for team knowledge.", "Một nguồn sự thật cho tri thức nhóm.") }] }),
  mk("slack", "Slack", "Salesforce", "https://slack.com", "#4A154B", ["team-chat"], "freemium", ["cloud"], ["web", "desktop", "mobile"], ["startup", "sme", "enterprise"],
    t("Messaging and collaboration for teams.", "Nhắn tin và cộng tác cho đội nhóm."), { features: ["Channels", "Huddles", "Apps"], integrations: ["Google Drive", "GitHub"], industries: ["technology"] }),
  mk("figma", "Figma", "Figma", "https://figma.com", "#F24E1E", ["design-tools"], "freemium", ["cloud"], ["web", "desktop"], ["startup", "sme", "enterprise"],
    t("Collaborative interface design in the browser.", "Thiết kế giao diện cộng tác ngay trên trình duyệt."), { features: ["Design", "Prototyping", "Dev mode"], integrations: ["Slack", "Jira"], industries: ["technology", "media"] }),
  mk("github", "GitHub", "Microsoft", "https://github.com", "#181717", ["code-hosting"], "freemium", ["cloud"], ["web", "api", "cli"], ["startup", "sme", "enterprise"],
    t("Code hosting, review, and CI/CD.", "Lưu trữ mã, review và CI/CD."), { features: ["Repos", "Actions", "Pull requests"], integrations: ["Slack", "Vercel"], industries: ["technology"] }),
  mk("linear", "Linear", "Linear", "https://linear.app", "#5E6AD2", ["project-mgmt"], "freemium", ["cloud"], ["web", "desktop"], ["startup", "sme"],
    t("Issue tracking and project planning for software teams.", "Theo dõi issue và lập kế hoạch dự án cho đội phần mềm."), { features: ["Issues", "Cycles", "Roadmaps"], integrations: ["GitHub", "Slack"], industries: ["technology"] }),
  mk("hubspot", "HubSpot", "HubSpot", "https://hubspot.com", "#FF7A59", ["crm", "marketing-automation"], "freemium", ["cloud"], ["web", "api"], ["sme", "enterprise"],
    t("CRM and marketing automation suite.", "Bộ CRM và tự động hóa marketing."), { features: ["CRM", "Email", "Pipelines"], integrations: ["Gmail", "Slack"], industries: ["marketing"] }),
  mk("salesforce", "Salesforce", "Salesforce", "https://salesforce.com", "#00A1E0", ["crm"], "paid", ["cloud"], ["web", "api"], ["enterprise"],
    t("Enterprise CRM and customer platform.", "Nền tảng CRM và khách hàng cho doanh nghiệp lớn."), { features: ["Sales Cloud", "Service Cloud"], integrations: ["Slack", "Tableau"], industries: ["finance"] }),
  mk("tableau", "Tableau", "Salesforce", "https://tableau.com", "#E97627", ["bi-analytics"], "paid", ["hybrid"], ["web", "desktop"], ["sme", "enterprise"],
    t("Business intelligence and data visualization.", "BI và trực quan hóa dữ liệu."), { features: ["Dashboards", "Data prep"], integrations: ["Salesforce"], industries: ["finance", "retail"] }),
  mk("n8n", "n8n", "n8n", "https://n8n.io", "#EA4B71", ["automation"], "freemium", ["cloud", "on_prem"], ["web", "api"], ["startup", "sme", "enterprise"],
    t("Workflow automation you can self-host.", "Tự động hóa workflow, có thể tự host."), { openSource: true, licenseSpdx: "Apache-2.0", features: ["Workflows", "Nodes", "Self-host"], integrations: ["HTTP", "Postgres"], industries: ["technology"] }),
  mk("postgresql", "PostgreSQL", "PostgreSQL Global Dev Group", "https://postgresql.org", "#336791", ["databases"], "free", ["on_prem", "cloud"], ["api", "cli"], ["startup", "sme", "enterprise"],
    t("Open-source relational database.", "Cơ sở dữ liệu quan hệ mã nguồn mở."), { openSource: true, licenseSpdx: "PostgreSQL", features: ["SQL", "Extensions", "JSONB"], industries: ["technology"] }),
  mk("huggingface", "Hugging Face", "Hugging Face", "https://huggingface.co", "#FFD21E", ["ai-platform", "llm-tools"], "freemium", ["cloud"], ["web", "api"], ["startup", "sme", "enterprise"],
    t("Models, datasets, and tooling for AI.", "Model, dataset và công cụ cho AI."), { openSource: true, features: ["Models", "Datasets", "Spaces"], integrations: ["PyTorch"], industries: ["technology"] }),
  mk("vercel", "Vercel", "Vercel", "https://vercel.com", "#000000", ["paas"], "freemium", ["cloud"], ["web", "api", "cli"], ["startup", "sme", "enterprise"],
    t("Frontend cloud and instant deploys.", "Cloud frontend và deploy tức thì."), { features: ["Deploys", "Edge", "Analytics"], integrations: ["GitHub"], industries: ["technology"],
      provenance: [{ sourceType: "ai_aggregation", sourceName: "Public software catalog", fetchedAt: FETCHED, confidence: 0.82, note: t("Category and pricing model inferred by AI from public factual data; reviewed before publishing.", "Danh mục và mô hình giá do AI suy ra từ dữ kiện công khai; đã duyệt trước khi công khai.") }] }),
  // ---- RAI platforms ----
  mk("rai-apps", "RAI Apps", "RAI Holdings", "https://raiholdings.vn/apps", "#378add", ["ai-platform"], "freemium", ["cloud"], ["web", "api"], ["startup", "sme", "enterprise"],
    t("AI apps that run inside the conversation (MCP, SEP-1865).", "App AI chạy trong hội thoại (MCP, SEP-1865)."), { isRaiPlatform: true, raiRefs: [{ label: t("Open RAI Apps", "Mở RAI Apps"), href: "/apps" }, { label: t("Pricing", "Bảng giá"), href: "/pricing/plat-apps" }], features: ["In-chat apps", "Consent + audit", "Usage metering"], industries: ["technology"] }),
  mk("rai-code", "RAI Code", "RAI Holdings", "https://raiholdings.vn/code", "#0c447c", ["paas"], "freemium", ["cloud"], ["web", "api", "cli"], ["startup", "sme", "enterprise"],
    t("Build and instantly deploy with SPDX licensing.", "Xây và deploy tức thì kèm cấp phép SPDX."), { isRaiPlatform: true, raiRefs: [{ label: t("Open RAI Code", "Mở RAI Code"), href: "/code" }, { label: t("Pricing", "Bảng giá"), href: "/pricing/plat-code" }], features: ["Instant deploy", "Custom domains", "Rollback"], industries: ["technology"] }),
  mk("rai-mcp", "RAI MCP Registry", "RAI Holdings", "https://raiholdings.vn/mcp", "#0f6e56", ["llm-tools"], "freemium", ["cloud"], ["web", "api"], ["sme", "enterprise"],
    t("A governed registry connecting models to systems.", "Registry có quản trị nối model với hệ thống."), { isRaiPlatform: true, raiRefs: [{ label: t("Open MCP Registry", "Mở MCP Registry"), href: "/mcp" }, { label: t("Pricing", "Bảng giá"), href: "/pricing/plat-mcp" }], features: ["Private registry", "Namespace auth", "Scoped tokens"], industries: ["technology"] }),
  mk("rai-one", "RAI ONE", "RAI Holdings", "https://raiholdings.vn/one", "#3b6d11", ["notes-docs", "ecommerce-platform"], "freemium", ["cloud"], ["web"], ["startup", "sme", "enterprise"],
    t("The business platform for commerce and operations.", "Nền tảng kinh doanh cho thương mại và vận hành."), { isRaiPlatform: true, raiRefs: [{ label: t("Open RAI ONE", "Mở RAI ONE"), href: "/one" }, { label: t("Pricing", "Bảng giá"), href: "/pricing/plat-one" }], features: ["Commerce", "Operations", "Shared data"], industries: ["realestate", "retail"] }),
];

const store: Platform[] = [...SEED];

/* ============================== queries ================================= */
export type ListParams = {
  search?: string; category?: string; pricing?: PricingModel; deployment?: Deployment; platformType?: PlatformType;
  openSource?: boolean; companySize?: CompanySize; source?: SourceType; rai?: boolean; minRating?: number;
  sort?: "rating" | "reviews" | "newest" | "az"; page?: number; pageSize?: number;
};
export type ListResult = { platforms: Platform[]; total: number; page: number; pageSize: number };

export function listPlatforms(params: ListParams = {}, extra: Platform[] = []): ListResult {
  let rows = [...store, ...extra].filter((p) => p.status === "published");
  if (params.category) rows = rows.filter((p) => p.categorySlugs.includes(params.category!));
  if (params.pricing) rows = rows.filter((p) => p.pricingModel === params.pricing);
  if (params.deployment) rows = rows.filter((p) => p.deployment.includes(params.deployment!));
  if (params.platformType) rows = rows.filter((p) => p.platformTypes.includes(params.platformType!));
  if (params.openSource != null) rows = rows.filter((p) => p.openSource === params.openSource);
  if (params.companySize) rows = rows.filter((p) => p.companySizeFit.includes(params.companySize!));
  if (params.rai != null) rows = rows.filter((p) => p.isRaiPlatform === params.rai);
  if (params.source) rows = rows.filter((p) => p.provenance.some((pr) => pr.sourceType === params.source));
  if (params.minRating) rows = rows.filter((p) => p.ratingAvg >= params.minRating!);
  if (params.search) {
    const q = params.search.toLowerCase();
    rows = rows.filter((p) => (p.name + " " + p.vendorName + " " + JSON.stringify(p.shortDescription) + " " + p.features.join(" ")).toLowerCase().includes(q));
  }
  const sort = params.sort ?? "rating";
  rows.sort((a, b) =>
    sort === "az" ? a.name.localeCompare(b.name) :
    sort === "reviews" ? b.reviewCount - a.reviewCount :
    sort === "newest" ? b.createdAt.localeCompare(a.createdAt) :
    b.ratingAvg - a.ratingAvg || a.name.localeCompare(b.name));
  const total = rows.length;
  const page = params.page ?? 1; const pageSize = params.pageSize ?? 12;
  return { platforms: rows.slice((page - 1) * pageSize, page * pageSize), total, page, pageSize };
}
export const getPlatform = (slug: string, extra: Platform[] = []) => [...store, ...extra].find((p) => p.slug === slug);
export const allPlatforms = () => store;
export const allIndustries = () => Array.from(new Set(store.flatMap((p) => p.industries)));
