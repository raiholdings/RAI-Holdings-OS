/**
 * RAI Portfolio (v2) — the RAI ecosystem catalog.
 *
 * ~27 platforms + member companies + investments, organized into 3 sub-tabs
 * (Platforms / Companies / Investments) mapped from 5 strategic pillars. Each
 * entry is a block-based profile (mini-site) linking out to its own domain.
 * Pricing is ESTIMATED (pricingStatus) and labelled as such; legal figures are
 * omitted when unknown — never fabricated (SPEC §3, §12).
 *
 * Server-safe + client-importable; production = PostgreSQL.
 */
import { t, type T } from "@/lib/i18n-core";

/* ============================== taxonomy ================================ */
export type EntryType = "platform" | "company" | "investment";
export type Pillar = "tech_business" | "saas_platform" | "tech_transfer" | "community_platform" | "franchise_venture";
export type PortfolioTab = "platforms" | "companies" | "investments";
export type Stage = "building" | "live" | "beta" | "partner";

export const tabLabels: Record<PortfolioTab, T> = {
  platforms: t("Platform development", "Phát triển nền tảng"),
  companies: t("Member companies", "Công ty thành viên"),
  investments: t("Investments", "Đầu tư"),
};
export const tabOrder: PortfolioTab[] = ["platforms", "companies", "investments"];

export const pillarLabels: Record<Pillar, T> = {
  tech_business: t("Tech Business", "Kinh doanh công nghệ"),
  saas_platform: t("SaaS Platform", "Nền tảng SaaS"),
  tech_transfer: t("Technology Transfer", "Chuyển giao công nghệ"),
  community_platform: t("Community Platform", "Nền tảng cộng đồng"),
  franchise_venture: t("Franchise & Venture Partnership", "Nhượng quyền & Đối tác Venture"),
};
export const pillarBlurb: Record<Pillar, T> = {
  tech_business: t("Vertical tech platforms by industry.", "Nền tảng công nghệ theo ngành."),
  saas_platform: t("SaaS ecosystem to operate a business.", "Hệ sinh thái SaaS vận hành doanh nghiệp."),
  tech_transfer: t("Technology transfer & digital transformation (Odoo/ERPNext).", "Chuyển giao công nghệ & chuyển đổi số (Odoo/ERPNext)."),
  community_platform: t("Social, media, video, identity.", "Mạng xã hội, truyền thông, video, identity."),
  franchise_venture: t("Scale via franchise, JV, white-label, equity.", "Scale qua franchise, JV, white-label, equity."),
};
export const pillarColor: Record<Pillar, string> = {
  tech_business: "#378add", saas_platform: "#0c447c", tech_transfer: "#0f6e56", community_platform: "#C9A227", franchise_venture: "#7A5CFF",
};
/** Which pillars surface under each tab (configurable in admin per SPEC §1). */
export const tabPillars: Record<PortfolioTab, Pillar[]> = {
  platforms: ["tech_business", "saas_platform", "community_platform", "tech_transfer"],
  companies: ["tech_business", "saas_platform"],
  investments: ["franchise_venture"],
};
export const stageLabels: Record<Stage, T> = {
  building: t("Building", "Đang xây"), live: t("Live", "Vận hành"), beta: t("Beta", "Beta"), partner: t("Partner", "Đối tác"),
};

/* ============================== blocks ================================= */
export type BlockStatus = "published" | "draft";
export type BlockSource = "manual" | "ai";
export type ProfileBlock =
  | { type: "overview"; data: { body: T } }
  | { type: "models"; data: { items: T[] } }
  | { type: "pricing_table"; data: { estimated: boolean; tiers: { name: T; price: T }[] } }
  | { type: "use_cases"; data: { items: { title: T; description: T }[] } }
  | { type: "ecosystem_links"; data: { items: { label: T; href: string }[] } }
  | { type: "status"; data: { stage: Stage; note?: T } }
  | { type: "contact_cta"; data: { title: T; ctaLabel: T; ctaHref: string } };
export type ContentBlock = { id: string; type: ProfileBlock["type"]; order: number; data: ProfileBlock["data"]; status: BlockStatus; source: BlockSource };

export const blockTypeLabels: Record<ProfileBlock["type"], T> = {
  overview: t("Overview", "Tổng quan"), models: t("Business models", "Mô hình kinh doanh"), pricing_table: t("Pricing (estimated)", "Gói giá (dự kiến)"),
  use_cases: t("Use cases", "Ứng dụng"), ecosystem_links: t("Ecosystem links", "Liên kết hệ sinh thái"), status: t("Status", "Trạng thái"), contact_cta: t("Contact CTA", "CTA liên hệ"),
};

/* ============================== entry ================================== */
export type PricingTier = { name: T; price: T };
export type PortfolioEntry = {
  id: string; slug: string; name: string; domain?: string; monogram: string; accent: string;
  tagline: T; sector: string;
  entryType: EntryType; pillar: Pillar; portfolioTab: PortfolioTab;
  models: T[]; pricingTiers: PricingTier[]; pricingStatus: "estimated" | "official";
  legalName?: string; foundedYear?: string; headquarters?: string; teamSize?: string;
  stage: Stage; status: "draft" | "published" | "archived";
  blocks: ContentBlock[]; featured: boolean; order: number;
  createdAt: string; updatedAt: string;
};

/* reserved domains not yet mapped to a platform (kept in the registry) */
export const reservedDomains = ["raichat.vn", "raimail.vn", "raimeet.vn"];

const TS = "2026-06-17T00:00:00Z";
const P = (name: string, price: string): PricingTier => ({ name: t(name, name), price: t(price, price) });
const VT = (s: string): T => t(s, s);
let _b = 0;
const blk = (type: ProfileBlock["type"], order: number, data: ProfileBlock["data"]): ContentBlock => ({ id: `pb-${++_b}`, type, order, data, status: "published", source: "manual" });

const defaultModel: Record<Pillar, T> = {
  tech_business: t("Vertical platform + subscription tiers", "Nền tảng theo ngành + gói thuê bao"),
  saas_platform: t("SaaS subscription", "Thuê bao SaaS"),
  tech_transfer: t("Implementation & consulting", "Triển khai & tư vấn"),
  community_platform: t("Community + premium", "Cộng đồng + premium"),
  franchise_venture: t("Partnership / equity", "Hợp tác / cổ phần"),
};

type Opt = { models?: T[]; stage?: Stage; legalName?: string; featured?: boolean; entryType?: EntryType; useCases?: { title: T; description: T }[] };
function mk(order: number, slug: string, name: string, domain: string | undefined, sector: string, pillar: Pillar, tab: PortfolioTab, tiers: PricingTier[], o: Opt = {}): PortfolioEntry {
  const entryType = o.entryType ?? (tab === "companies" ? "company" : tab === "investments" ? "investment" : "platform");
  const stage = o.stage ?? (entryType === "investment" ? "partner" : "building");
  const models = o.models ?? [defaultModel[pillar]];
  const noun = entryType === "company" ? { en: "company", vi: "công ty" } : entryType === "investment" ? { en: "venture", vi: "doanh nghiệp" } : { en: "platform", vi: "nền tảng" };
  const tagline = t(`${sector} ${noun.en} in the RAI ecosystem.`, `${noun.vi === "công ty" ? "Công ty" : noun.vi === "doanh nghiệp" ? "Doanh nghiệp" : "Nền tảng"} ${sector} trong hệ sinh thái RAI.`);
  const blocks: ContentBlock[] = [
    blk("overview", 0, { body: t(`${name} is a ${sector} ${noun.en} within the RAI Holdings ecosystem${domain ? `, at ${domain}` : ""}. It is part of RAI's "${pillarLabels[pillar].en}" pillar.`, `${name} là ${noun.vi} ${sector} trong hệ sinh thái RAI Holdings${domain ? `, tại ${domain}` : ""}. Thuộc trụ cột "${pillarLabels[pillar].vi}" của RAI.`) }),
    blk("models", 1, { items: models }),
    ...(tiers.length ? [blk("pricing_table", 2, { estimated: true, tiers })] : []),
    ...(o.useCases?.length ? [blk("use_cases", 3, { items: o.useCases })] : []),
    blk("ecosystem_links", 4, { items: [{ label: t("Pricing", "Bảng giá"), href: "/pricing" }, { label: t("About RAI", "Về RAI Holdings"), href: "/about" }] }),
    blk("status", 5, { stage, note: t("Estimated pricing — subject to change.", "Giá dự kiến — có thể thay đổi.") }),
    blk("contact_cta", 6, { title: t(`Partner with ${name}`, `Hợp tác với ${name}`), ctaLabel: t("Contact", "Liên hệ"), ctaHref: "/about/contact" }),
  ];
  return {
    id: `pe-${slug}`, slug, name, domain, monogram: name.replace(/[^A-Za-z]/g, "").slice(0, 2).toUpperCase() || "RAI",
    accent: pillarColor[pillar], tagline, sector, entryType, pillar, portfolioTab: tab,
    models, pricingTiers: tiers, pricingStatus: "estimated", legalName: o.legalName,
    stage, status: "published", blocks, featured: o.featured ?? false, order, createdAt: "2026-06-01T00:00:00Z", updatedAt: TS,
  };
}

/* ============================== seed ================================== */
const SEED: PortfolioEntry[] = [
  // ---- Tech Business (platforms tab) ----
  mk(0, "rai-academy", "RAI Academy", "raiacademy.vn", "EdTech", "tech_business", "platforms", [P("Basic", "Miễn phí"), P("Pro Learning", "299.000đ/tháng")], { featured: true }),
  mk(1, "rai-travel", "RAI Travel", "raitravel.vn", "TravelTech", "tech_business", "platforms", [P("Booking fee", "Theo giao dịch"), P("Partner Package", "2–10 triệu/tháng")], { models: [VT("Transaction / booking fee"), VT("Partner package")] }),
  mk(2, "rai-property", "RAI Property", "raiproperty.vn", "PropTech", "tech_business", "platforms", [P("Cá nhân", "Miễn phí"), P("Pro Broker", "999.000đ/tháng")], { featured: true }),
  mk(3, "rai-commerce", "RAI Commerce", "raicommerce.vn", "CommerceTech", "tech_business", "platforms", [P("Starter", "199.000đ/tháng"), P("Business", "2 triệu/tháng")]),
  mk(4, "rai-talent", "RAI Talent", "raitalent.vn", "HRTech", "tech_business", "platforms", [P("Candidate", "Miễn phí"), P("Recruiter", "1–5 triệu/tháng")]),
  mk(5, "rai-vr", "RAI VR", "raivr.vn", "VR / Immersive", "tech_business", "platforms", [P("VR Experience", "Theo dịch vụ"), P("Enterprise VR", "20–200 triệu")]),
  mk(6, "rai-music", "RAI Music", "raimusic.vn", "MusicTech", "tech_business", "platforms", [P("User", "Miễn phí"), P("Creator Pro", "299.000đ/tháng")]),
  mk(7, "rai-ads", "RAI Ads", "raiads.vn", "AdTech", "tech_business", "platforms", [P("SME Ads", "2–10 triệu/tháng"), P("Enterprise Ads", "Theo ngân sách")]),
  // ---- SaaS Platform (platforms tab) ----
  mk(8, "rai-erp", "RAI ERP", "raierp.vn", "ERP SaaS", "saas_platform", "platforms", [P("Starter", "499.000đ/tháng"), P("Business", "2–5 triệu/tháng")], { featured: true }),
  mk(9, "rai-crm", "RAI CRM", "raicrm.vn", "CRM SaaS", "saas_platform", "platforms", [P("Free CRM", "Miễn phí"), P("Sales Pro", "299.000đ/user")]),
  mk(10, "rai-pos", "RAI POS", "raipos.vn", "POS SaaS", "saas_platform", "platforms", [P("Retail", "199.000đ/tháng"), P("Chain Store", "2–10 triệu/tháng")]),
  mk(11, "rai-gpt", "RAI GPT", "raigpt.vn", "AI Workspace", "saas_platform", "platforms", [P("AI Basic", "199.000đ/tháng"), P("AI Pro", "999.000đ/tháng")], { featured: true }),
  mk(12, "rai-chatbot", "RAI Chatbot", "raichatbot.vn", "AI Chatbot", "saas_platform", "platforms", [P("Basic", "299.000đ/tháng"), P("Business", "2 triệu/tháng")]),
  mk(13, "rai-agent", "RAI Agent", "raiagent.vn", "AI Agent Infra", "saas_platform", "platforms", [P("Solo Founder", "999.000đ/tháng"), P("Startup", "5 triệu/tháng")]),
  mk(14, "rai-bot", "RAI Bot", "raibot.vn", "Automation", "saas_platform", "platforms", [P("Starter", "299.000đ/tháng"), P("Business", "2 triệu/tháng")]),
  mk(15, "rai-data", "RAI Data", "raidata.vn", "Data Infra", "saas_platform", "platforms", [P("SME", "1 triệu/tháng"), P("Enterprise", "Theo storage")]),
  mk(16, "rai-cdp", "RAI CDP", "raicdp.vn", "CDP", "saas_platform", "platforms", [P("Starter", "2 triệu/tháng"), P("Enterprise", "Theo data volume")]),
  mk(17, "rai-platform", "RAI Platform", "raiplatform.vn", "Platform Infra", "saas_platform", "platforms", [P("Startup", "5 triệu/tháng"), P("Enterprise", "Theo deployment")]),
  mk(18, "rai-n8n", "RAI n8n", "rain8n.vn", "Workflow Automation", "saas_platform", "platforms", [P("Basic", "299.000đ/tháng"), P("Pro", "2 triệu/tháng")]),
  // ---- Community Platform (platforms tab) ----
  mk(19, "rai-social", "RAI Social", "raisocial.vn", "Social Network", "community_platform", "platforms", [P("Community", "Miễn phí"), P("Business Community", "2 triệu/tháng")], { featured: true }),
  mk(20, "rai-play", "RAI Play", "raiplay.vn", "Video Platform", "community_platform", "platforms", [P("User", "Miễn phí"), P("Creator Pro", "299.000đ/tháng")]),
  mk(21, "rai-bio", "RAI Bio", "raibio.vn", "Digital Identity", "community_platform", "platforms", [P("Free", "Miễn phí"), P("Pro", "99.000đ/tháng")]),
  mk(22, "rai-times", "RAI Times", "www.raitimes.com", "Media & News", "community_platform", "platforms", [], { models: [VT("Advertising / PR / media partnership / premium content")] }),
  mk(23, "rai-zalo", "RAI Zalo", "raizalo.vn", "Communication", "community_platform", "platforms", [], { models: [VT("Communication platform (model TBD)")] }),
  // ---- Technology Transfer (now under Platform development tab) ----
  mk(24, "rai-odoo", "RAI Odoo", "raiodoo.vn", "Odoo ERP", "tech_transfer", "platforms", [P("SME Setup", "20–100 triệu"), P("Enterprise", "200 triệu+")]),
  mk(25, "rai-erpnext", "RAI ERPNext", "raierpnext.vn", "ERPNext", "tech_transfer", "platforms", [P("Starter", "50 triệu+"), P("Enterprise", "Theo quy mô")]),
  mk(26, "rai-service", "RAI Service", "raiservice.vn", "Digital Transformation", "tech_transfer", "platforms", [P("Consulting", "10–50 triệu"), P("AI Transformation", "100 triệu+")]),
  // ---- Member companies (companies tab) — legal corporate entities ----
  mk(27, "rai-property-co", "RAI Property", "raiproperty.vn", "Real estate / PropTech", "tech_business", "companies", [], { entryType: "company", legalName: "Công ty Cổ phần Sàn giao dịch Bất động sản RAI Property", models: [VT("Real-estate exchange company")], stage: "live", featured: true }),
  mk(28, "rai-platform-co", "RAI Platform", "raiplatform.vn", "Technology", "saas_platform", "companies", [], { entryType: "company", legalName: "Công ty Cổ phần Nền tảng Công nghệ RAI Platform", models: [VT("Technology platform company")], stage: "live", featured: true }),
  mk(29, "rai-academy-co", "RAI Academy", "raiacademy.vn", "Education & consulting", "tech_business", "companies", [], { entryType: "company", legalName: "Công ty Cổ phần Tư vấn và Đào tạo RAI Academy", models: [VT("Consulting & training company")], stage: "live", featured: true }),
  // ---- Investments (investments tab) ----
  mk(30, "roi-ai-vietnam", "ROI AI Việt Nam", undefined, "Media & technology", "franchise_venture", "investments", [], { entryType: "investment", legalName: "Công ty Cổ phần Truyền thông và Công nghệ ROI AI Việt Nam", models: [VT("Invested startup — AI marketing & media")], stage: "partner", featured: true }),
];

const store: PortfolioEntry[] = [...SEED];

/* ============================== queries ================================= */
export type ListParams = { tab?: PortfolioTab; pillar?: Pillar; sector?: string; search?: string };
export function listEntries(params: ListParams = {}, extra: PortfolioEntry[] = []): PortfolioEntry[] {
  let rows = [...store, ...extra].filter((e) => e.status === "published" || extra.includes(e));
  if (params.tab) rows = rows.filter((e) => e.portfolioTab === params.tab);
  if (params.pillar) rows = rows.filter((e) => e.pillar === params.pillar);
  if (params.sector) rows = rows.filter((e) => e.sector === params.sector);
  if (params.search) {
    const q = params.search.toLowerCase();
    rows = rows.filter((e) => (e.name + " " + (e.domain ?? "") + " " + e.sector + " " + JSON.stringify(e.tagline)).toLowerCase().includes(q));
  }
  return rows.sort((a, b) => a.order - b.order);
}
export const getEntry = (slug: string, extra: PortfolioEntry[] = []) => [...store, ...extra].find((e) => e.slug === slug);
export const allEntries = () => store;
export const allSectors = () => Array.from(new Set(store.map((e) => e.sector)));
export function portfolioStats(extra: PortfolioEntry[] = []) {
  const rows = [...store, ...extra].filter((e) => e.status === "published" || extra.includes(e));
  return {
    platforms: rows.filter((e) => e.entryType === "platform").length,
    companies: rows.filter((e) => e.entryType === "company").length,
    investments: rows.filter((e) => e.entryType === "investment").length,
    total: rows.length,
  };
}
