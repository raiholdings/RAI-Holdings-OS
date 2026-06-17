/**
 * RAI Pricing — pricing-as-data (github.com/pricing-style plans + compare table).
 *
 * The whole pricing page is structured data so the admin CMS and the AI pipeline
 * can edit it safely (no code changes). Two plan kinds: "subscription" (Free /
 * Team / Business) and "program" — a themed bundle of AI agents + platforms for
 * a vertical (e.g. "RAI Proptech AI-native 2026") shown via highlightGroups and
 * with a detail page. Prices in VND. Reuses the Enterprise "AI proposes → human
 * reviews" model. Server-safe + client-importable; production = PostgreSQL.
 */
import { t, type T } from "@/lib/i18n-core";
import { formatVnd } from "@/lib/marketplace";

export { formatVnd };

/* ============================== model =================================== */
export type PlanKind = "subscription" | "program" | "platform";
export type PriceModel = "free" | "flat" | "per_user" | "contact";
export type Cycle = "monthly" | "yearly";
export type EntryStatus = "published" | "draft";
export type EntrySource = "manual" | "ai" | "community";

export type Cta = { label: T; url: string; style: "primary" | "secondary" };
export type PlanFeatureItem = { id: string; title: T; description: T; valueLabel?: T; source: EntrySource };
export type HighlightGroup = { title: T; items: { title: T; description: T }[] };

export type Plan = {
  id: string;
  key: string;
  name: T;
  tagline: T;
  kind: PlanKind;
  recommended: boolean;
  priceModel: PriceModel;
  priceMonthly: number | null; // VND, null for free/contact
  priceYearly: number | null;
  priceUnit?: T; // e.g. "/user/month"
  priceNote?: T;
  ctas: Cta[];
  featureItems: PlanFeatureItem[];
  featuredAddOnIds: string[];
  highlightGroups: HighlightGroup[];
  status: EntryStatus;
  source: EntrySource;
};

export type AddOn = { id: string; name: T; description: T; priceLabel: T; url: string; scope: "featured" | "additional" };

export type ComparisonValue = { kind: "yes" | "no" | "text"; text?: T };
export type ComparisonRow = { id: string; featureName: T; featureDescription: T; values: Record<string, ComparisonValue> };
export type ComparisonGroup = { id: string; title: T; order: number; rows: ComparisonRow[] };

export type PricingPage = {
  id: string;
  locale: string;
  status: EntryStatus;
  trialBanner: { text: T; linkText: T; linkUrl: string; enabled: boolean };
  heroTitle: T;
  heroSubtitle: T;
  billing: { monthlyLabel: T; yearlyLabel: T; defaultCycle: Cycle; yearlyNote: T };
  plans: Plan[];
  addOns: AddOn[];
  comparison: ComparisonGroup[];
  proof: { quote: T; author: string; role: T; logos: string[] };
  faq: { q: T; a: T }[];
  updatedAt: string;
};

/** Display price for a plan at a billing cycle. */
export function planPrice(plan: Plan, cycle: Cycle): { amount: string; unit?: T; note?: T } {
  if (plan.priceModel === "free") return { amount: formatVnd(0), unit: plan.priceUnit, note: plan.priceNote };
  if (plan.priceModel === "contact") return { amount: "—", note: plan.priceNote ?? t("Contact us", "Liên hệ") };
  const v = cycle === "monthly" ? plan.priceMonthly : plan.priceYearly;
  return { amount: v == null ? "—" : formatVnd(v), unit: plan.priceUnit, note: plan.priceNote };
}

/* ============================== seed ==================================== */
let _seq = 0;
const fid = (p: string) => `${p}-${++_seq}`;
const fitem = (title: T, description: T, valueLabel?: T, source: EntrySource = "manual"): PlanFeatureItem => ({ id: fid("fi"), title, description, valueLabel, source });
const yes: ComparisonValue = { kind: "yes" };
const no: ComparisonValue = { kind: "no" };
const txt = (en: string, vi: string): ComparisonValue => ({ kind: "text", text: t(en, vi) });

const ADDONS: AddOn[] = [
  { id: "addon-copilot", name: t("Extra AI agent seats", "Thêm chỗ trợ lý ảo"), description: t("Add more AI agent capacity per team.", "Thêm năng lực trợ lý ảo cho đội."), priceLabel: t("from 90,000₫/seat/mo", "từ 90.000₫/chỗ/tháng"), url: "/apps", scope: "featured" },
  { id: "addon-storage", name: t("Extra storage & runs", "Thêm dung lượng & lượt chạy"), description: t("More workflow runs and deploy storage.", "Thêm lượt chạy workflow và dung lượng deploy."), priceLabel: t("from 120,000₫/mo", "từ 120.000₫/tháng"), url: "/code", scope: "featured" },
  { id: "addon-registry", name: t("Private MCP registry", "Registry MCP riêng"), description: t("A governed internal registry for your org.", "Registry nội bộ có quản trị cho tổ chức."), priceLabel: t("Contact", "Liên hệ"), url: "/mcp", scope: "additional" },
  { id: "addon-domain", name: t("Custom domains & SSL", "Domain riêng & SSL"), description: t("Attach your own domains with auto SSL.", "Gắn domain riêng kèm SSL tự động."), priceLabel: t("from 60,000₫/domain/mo", "từ 60.000₫/domain/tháng"), url: "/code", scope: "additional" },
  { id: "addon-support", name: t("Priority support", "Hỗ trợ ưu tiên"), description: t("Faster response and a named contact.", "Phản hồi nhanh hơn và đầu mối riêng."), priceLabel: t("Contact", "Liên hệ"), url: "/enterprise", scope: "additional" },
];

const PLANS: Plan[] = [
  {
    id: "plan-free", key: "free", name: t("Free", "Free"), tagline: t("Start building on RAI OS at no cost.", "Bắt đầu xây trên RAI OS miễn phí."),
    kind: "subscription", recommended: false, priceModel: "free", priceMonthly: 0, priceYearly: 0, priceUnit: t("/month", "/tháng"),
    ctas: [{ label: t("Start free", "Bắt đầu miễn phí"), url: "/apps", style: "secondary" }],
    featureItems: [
      fitem(t("RAI Apps (in-chat)", "RAI Apps (trong chat)"), t("Use the pilot AI apps inside the conversation.", "Dùng các app AI thử nghiệm ngay trong hội thoại."), t("3 apps", "3 app")),
      fitem(t("Instant deploy", "Deploy tức thì"), t("Ship a project to a live URL.", "Đưa dự án lên URL chạy thật."), t("1 project", "1 dự án")),
      fitem(t("Community support", "Hỗ trợ cộng đồng"), t("Docs and community channels.", "Tài liệu và kênh cộng đồng.")),
    ],
    featuredAddOnIds: ["addon-storage"], highlightGroups: [], status: "published", source: "manual",
  },
  {
    id: "plan-team", key: "team", name: t("Team", "Team"), tagline: t("For small teams shipping together.", "Cho đội nhỏ cùng nhau ship."),
    kind: "subscription", recommended: false, priceModel: "per_user", priceMonthly: 180000, priceYearly: 1800000, priceUnit: t("/user/month", "/người/tháng"), priceNote: t("billed annually saves ~17%", "trả theo năm tiết kiệm ~17%"),
    ctas: [{ label: t("Choose Team", "Chọn Team"), url: "/marketplace", style: "primary" }],
    featureItems: [
      fitem(t("Everything in Free", "Tất cả ở Free"), t("Plus team collaboration.", "Cộng thêm cộng tác nhóm.")),
      fitem(t("RAI Apps", "RAI Apps"), t("All apps with team workspaces.", "Tất cả app với workspace nhóm."), t("Unlimited apps", "Không giới hạn app")),
      fitem(t("Deployments", "Triển khai"), t("Multiple live projects with rollback.", "Nhiều dự án chạy thật, có rollback."), t("10 projects", "10 dự án")),
      fitem(t("Marketplace selling", "Bán trên marketplace"), t("List your apps and templates.", "Đăng app và mẫu của bạn.")),
    ],
    featuredAddOnIds: ["addon-copilot"], highlightGroups: [], status: "published", source: "manual",
  },
  {
    id: "plan-business", key: "business", name: t("Business", "Doanh nghiệp"), tagline: t("Governed AI across your whole business.", "AI có quản trị cho toàn doanh nghiệp."),
    kind: "subscription", recommended: true, priceModel: "per_user", priceMonthly: 420000, priceYearly: 4200000, priceUnit: t("/user/month", "/người/tháng"), priceNote: t("14-day free trial", "Dùng thử 14 ngày"),
    ctas: [{ label: t("Start trial", "Dùng thử"), url: "/marketplace", style: "primary" }, { label: t("Contact sales", "Tư vấn"), url: "/enterprise/contribute", style: "secondary" }],
    featureItems: [
      fitem(t("Everything in Team", "Tất cả ở Team"), t("Plus governance and audit.", "Cộng thêm quản trị và kiểm toán.")),
      fitem(t("Scoped permissions", "Phân quyền theo phạm vi"), t("OAuth-style consent on every tool call.", "Đồng ý kiểu OAuth trên mọi lệnh gọi tool.")),
      fitem(t("Private MCP registry", "Registry MCP riêng"), t("Connect models to internal systems.", "Kết nối model với hệ thống nội bộ.")),
      fitem(t("Audit & usage metering", "Kiểm toán & đo lường"), t("Per app, team, and tool.", "Theo từng app, đội và tool."), t("Unlimited", "Không giới hạn")),
    ],
    featuredAddOnIds: ["addon-registry"], highlightGroups: [], status: "published", source: "manual",
  },
];

/* ---- program series: AI-native venture builder programs by industry ---- */
const COMMON_PLATFORMS: HighlightGroup["items"] = [
  { title: t("RAI Apps", "RAI Apps"), description: t("AI apps that run inside the conversation.", "App AI chạy trong hội thoại.") },
  { title: t("RAI Code", "RAI Code"), description: t("Deploy products with custom domains.", "Deploy sản phẩm kèm domain riêng.") },
  { title: t("Private MCP registry", "Registry MCP riêng"), description: t("Connect to internal systems, governed.", "Kết nối hệ thống nội bộ, có quản trị.") },
];
const COMMON_SCOPE: HighlightGroup["items"] = [
  { title: t("Venture build & onboarding", "Dựng venture & onboarding"), description: t("From idea to a live, AI-native venture.", "Từ ý tưởng tới venture AI-native chạy thật.") },
  { title: t("Service-level support", "Hỗ trợ theo SLA"), description: t("Priority support and a named advisor.", "Hỗ trợ ưu tiên và cố vấn riêng.") },
];
function mkProgram(key: string, name: T, tagline: T, agents: HighlightGroup["items"]): Plan {
  return {
    id: `plan-${key}`, key, name, tagline, kind: "program", recommended: false,
    priceModel: "contact", priceMonthly: null, priceYearly: null, priceNote: t("Contact for a tailored quote", "Liên hệ để báo giá riêng"),
    ctas: [{ label: t("Talk to an advisor", "Tư vấn"), url: "/enterprise/contribute", style: "primary" }, { label: t("See details", "Xem chi tiết"), url: `/pricing/${key}`, style: "secondary" }],
    featureItems: [], featuredAddOnIds: ["addon-support"],
    highlightGroups: [
      { title: t("AI agents included", "Trợ lý ảo được dùng"), items: agents },
      { title: t("Platforms & products", "Nền tảng & sản phẩm"), items: COMMON_PLATFORMS },
      { title: t("Scope & commitment", "Quy mô & cam kết"), items: COMMON_SCOPE },
    ],
    status: "published", source: "manual",
  };
}
const PROGRAMS: Plan[] = [
  mkProgram("proptech", t("Proptech AI-native venture", "Venture AI-native Proptech"), t("Build a real-estate venture with AI agents + platform.", "Dựng doanh nghiệp bất động sản với trợ lý ảo + nền tảng."), [
    { title: t("Property advisor agent", "Trợ lý tư vấn BĐS"), description: t("Answers buyer questions and qualifies leads.", "Trả lời câu hỏi người mua và sàng lọc lead.") },
    { title: t("NOXH dossier reviewer", "Trợ lý thẩm định hồ sơ NOXH"), description: t("Checks social-housing applications against criteria.", "Kiểm hồ sơ nhà ở xã hội theo tiêu chí.") },
    { title: t("Listing design agent", "Trợ lý thiết kế ấn phẩm"), description: t("Generates listing artwork and brochures.", "Tạo ấn phẩm và brochure cho listing.") },
  ]),
  mkProgram("fintech", t("Fintech AI-native venture", "Venture AI-native Fintech"), t("Launch a finance venture under full governance.", "Khởi chạy doanh nghiệp tài chính dưới quản trị đầy đủ."), [
    { title: t("Credit assessment agent", "Trợ lý thẩm định tín dụng"), description: t("Scores applications from sourced data.", "Chấm hồ sơ từ dữ liệu có nguồn.") },
    { title: t("Compliance / AML monitor", "Trợ lý tuân thủ / AML"), description: t("Flags risky transactions for review.", "Đánh dấu giao dịch rủi ro để soát.") },
    { title: t("eKYC onboarding agent", "Trợ lý eKYC"), description: t("Verifies customer identity end to end.", "Xác minh danh tính khách hàng đầu cuối.") },
  ]),
  mkProgram("retailtech", t("Retail AI-native venture", "Venture AI-native Bán lẻ"), t("Run an AI-native commerce business end to end.", "Vận hành doanh nghiệp thương mại AI-native đầu cuối."), [
    { title: t("Merchandising agent", "Trợ lý trưng bày hàng"), description: t("Optimizes catalog and promotions.", "Tối ưu danh mục và khuyến mãi.") },
    { title: t("Demand forecaster", "Trợ lý dự báo nhu cầu"), description: t("Predicts demand from sales data.", "Dự báo nhu cầu từ dữ liệu bán hàng.") },
    { title: t("Customer support agent", "Trợ lý CSKH"), description: t("Handles orders and questions 24/7.", "Xử lý đơn và câu hỏi 24/7.") },
  ]),
  mkProgram("healthtech", t("Healthtech AI-native venture", "Venture AI-native Y tế"), t("Build a healthcare venture with governed AI.", "Dựng doanh nghiệp y tế với AI có quản trị."), [
    { title: t("Patient intake agent", "Trợ lý tiếp nhận bệnh nhân"), description: t("Collects and structures intake forms.", "Thu thập và cấu trúc hồ sơ tiếp nhận.") },
    { title: t("Records summarizer", "Trợ lý tóm tắt hồ sơ"), description: t("Summarizes records with sources.", "Tóm tắt hồ sơ có dẫn nguồn.") },
    { title: t("Scheduling agent", "Trợ lý đặt lịch"), description: t("Manages appointments and reminders.", "Quản lý lịch hẹn và nhắc lịch.") },
  ]),
  mkProgram("agritech", t("Agritech AI-native venture", "Venture AI-native Nông nghiệp"), t("Launch an agriculture venture powered by AI.", "Khởi chạy doanh nghiệp nông nghiệp nhờ AI."), [
    { title: t("Crop advisor agent", "Trợ lý tư vấn mùa vụ"), description: t("Recommends actions from field data.", "Gợi ý hành động từ dữ liệu đồng ruộng.") },
    { title: t("Supply-chain tracker", "Trợ lý theo dõi chuỗi cung"), description: t("Tracks produce from farm to buyer.", "Theo dõi nông sản từ nông trại tới người mua.") },
    { title: t("Market price analyst", "Trợ lý phân tích giá"), description: t("Surfaces sourced market prices.", "Nêu giá thị trường có nguồn.") },
  ]),
];

/* ---- platform pricing: RAI ecosystem platforms (business → SaaS/PaaS) --- */
function mkPlatform(key: string, name: T, tagline: T, url: string, priceModel: PriceModel, priceMonthly: number | null, items: HighlightGroup["items"], priceNote?: T): Plan {
  return {
    id: `plan-${key}`, key, name, tagline, kind: "platform", recommended: false,
    priceModel, priceMonthly, priceYearly: priceMonthly == null ? null : priceMonthly * 10, priceUnit: t("/month", "/tháng"), priceNote,
    ctas: priceModel === "contact"
      ? [{ label: t("Contact us", "Liên hệ"), url: "/enterprise/contribute", style: "primary" }, { label: t("Open platform", "Mở nền tảng"), url, style: "secondary" }]
      : [{ label: t("Get started", "Bắt đầu"), url, style: "primary" }],
    featureItems: items.map((it) => fitem(it.title, it.description)),
    featuredAddOnIds: [], highlightGroups: [], status: "published", source: "manual",
  };
}
const PLATFORMS: Plan[] = [
  mkPlatform("plat-one", t("RAI ONE — Business platform", "RAI ONE — Nền tảng kinh doanh"), t("Run commerce and operations for your business.", "Vận hành thương mại và vận hành cho doanh nghiệp."), "/one", "flat", 990000, [
    { title: t("Commerce & operations", "Thương mại & vận hành"), description: t("The business workspace across RAI ONE products.", "Workspace kinh doanh trên các sản phẩm RAI ONE.") },
    { title: t("Shared data layer", "Lớp dữ liệu chung"), description: t("One source of truth across departments.", "Một nguồn sự thật cho các phòng ban.") },
  ]),
  mkPlatform("plat-apps", t("RAI Apps — AI apps host (MCP)", "RAI Apps — Host app AI (MCP)"), t("Host AI apps that run inside the conversation.", "Host app AI chạy ngay trong hội thoại."), "/apps", "flat", 1490000, [
    { title: t("MCP apps host", "Host app MCP"), description: t("SEP-1865 in-chat apps with consent + audit.", "App trong chat theo SEP-1865 có đồng ý + kiểm toán.") },
    { title: t("Usage metering", "Đo lường usage"), description: t("Metered per app, team, and tool.", "Đo theo từng app, đội và tool.") },
  ]),
  mkPlatform("plat-code", t("RAI Code — Deploy (PaaS)", "RAI Code — Triển khai (PaaS)"), t("Build and instantly deploy products with domains.", "Xây và deploy sản phẩm tức thì kèm domain."), "/code", "flat", 1290000, [
    { title: t("Instant deploy", "Deploy tức thì"), description: t("Repo to a live URL with rollback.", "Repo tới URL chạy thật, có rollback.") },
    { title: t("Custom domains & SSL", "Domain riêng & SSL"), description: t("Attach domains with auto SSL.", "Gắn domain kèm SSL tự động.") },
  ]),
  mkPlatform("plat-mcp", t("RAI MCP Registry — SaaS", "RAI MCP Registry — SaaS"), t("A governed registry connecting models to systems.", "Registry có quản trị nối model với hệ thống."), "/mcp", "flat", 1990000, [
    { title: t("Private registry", "Registry riêng"), description: t("Publish and govern internal MCP servers.", "Publish và quản trị MCP server nội bộ.") },
    { title: t("Namespace auth", "Xác thực namespace"), description: t("Scoped tokens per namespace.", "Token theo phạm vi cho mỗi namespace.") },
  ]),
  mkPlatform("plat-marketplace", t("RAI Marketplace — Commerce", "RAI Marketplace — Thương mại"), t("Distribute and sell apps, templates, and services.", "Phân phối và bán app, mẫu và dịch vụ."), "/marketplace", "contact", null, [
    { title: t("Storefront & billing", "Gian hàng & thanh toán"), description: t("List paid plans with VND pricing.", "Đăng gói có phí với giá VND.") },
    { title: t("70/30 revenue share", "Chia doanh thu 70/30"), description: t("Revenue share with developers and OPCs.", "Chia doanh thu với developer và OPC.") },
  ], t("Revenue share — contact us", "Chia doanh thu — liên hệ")),
];

const ALL_PLANS: Plan[] = [...PLANS, ...PROGRAMS, ...PLATFORMS];

const COMPARISON: ComparisonGroup[] = [
  { id: "cg-ai", title: t("AI tools", "Công cụ AI"), order: 0, rows: [
    { id: "cr-apps", featureName: t("RAI Apps (in-chat)", "RAI Apps (trong chat)"), featureDescription: t("AI apps that run inside the conversation.", "App AI chạy trong hội thoại."), values: { free: txt("3 apps", "3 app"), team: txt("Unlimited", "Không giới hạn"), business: txt("Unlimited", "Không giới hạn"), proptech26: txt("Unlimited + property apps", "Không giới hạn + app BĐS") } },
    { id: "cr-agents", featureName: t("AI agents", "Trợ lý ảo"), featureDescription: t("Specialized assistants for tasks.", "Trợ lý chuyên biệt theo tác vụ."), values: { free: no, team: txt("Shared", "Dùng chung"), business: txt("Per team", "Theo đội"), proptech26: txt("Property suite", "Bộ trợ lý BĐS") } },
    { id: "cr-workflow", featureName: t("Workflow automation", "Tự động hóa workflow"), featureDescription: t("Automate operations with AI.", "Tự động hóa vận hành bằng AI."), values: { free: no, team: yes, business: yes, proptech26: yes } },
  ] },
  { id: "cg-platform", title: t("Platform", "Nền tảng"), order: 1, rows: [
    { id: "cr-deploy", featureName: t("Instant deploy", "Deploy tức thì"), featureDescription: t("Ship to a live URL.", "Đưa lên URL chạy thật."), values: { free: txt("1 project", "1 dự án"), team: txt("10 projects", "10 dự án"), business: txt("Unlimited", "Không giới hạn"), proptech26: txt("Unlimited", "Không giới hạn") } },
    { id: "cr-domain", featureName: t("Custom domains", "Domain riêng"), featureDescription: t("Attach domains with auto SSL.", "Gắn domain kèm SSL tự động."), values: { free: no, team: yes, business: yes, proptech26: yes } },
    { id: "cr-registry", featureName: t("Private MCP registry", "Registry MCP riêng"), featureDescription: t("Governed internal registry.", "Registry nội bộ có quản trị."), values: { free: no, team: no, business: yes, proptech26: yes } },
  ] },
  { id: "cg-security", title: t("Security", "Bảo mật"), order: 2, rows: [
    { id: "cr-scopes", featureName: t("Scoped permissions", "Phân quyền theo phạm vi"), featureDescription: t("Consent on every tool call.", "Đồng ý trên mọi lệnh gọi tool."), values: { free: no, team: txt("Basic", "Cơ bản"), business: yes, proptech26: yes } },
    { id: "cr-audit", featureName: t("Audit log", "Nhật ký kiểm toán"), featureDescription: t("Every action recorded.", "Mọi hành động được ghi lại."), values: { free: no, team: no, business: yes, proptech26: yes } },
  ] },
  { id: "cg-support", title: t("Support", "Hỗ trợ"), order: 3, rows: [
    { id: "cr-support", featureName: t("Support level", "Mức hỗ trợ"), featureDescription: t("How you reach us.", "Cách liên hệ với chúng tôi."), values: { free: txt("Community", "Cộng đồng"), team: txt("Email", "Email"), business: txt("Priority", "Ưu tiên"), proptech26: txt("SLA + named contact", "SLA + đầu mối riêng") } },
  ] },
];

const PAGE: PricingPage = {
  id: "pricing-vi", locale: "vi", status: "published",
  trialBanner: { text: t("Try RAI Business free for 14 days — no card required.", "Dùng thử RAI Doanh nghiệp 14 ngày — không cần thẻ."), linkText: t("Learn more", "Tìm hiểu"), linkUrl: "/enterprise/size/enterprise", enabled: true },
  heroTitle: t("Pricing — a plan for every business", "Bảng giá — gói cho mọi doanh nghiệp"),
  heroSubtitle: t("From a free start to a full AI-native program. All prices in VND.", "Từ khởi đầu miễn phí tới chương trình AI-native trọn gói. Mọi mức giá bằng VND."),
  billing: { monthlyLabel: t("Monthly", "Theo tháng"), yearlyLabel: t("Yearly", "Theo năm"), defaultCycle: "monthly", yearlyNote: t("2 months free", "tặng 2 tháng") },
  plans: ALL_PLANS, addOns: ADDONS, comparison: COMPARISON,
  proof: { quote: t("We launched a proptech business on the Proptech AI-native program in one quarter.", "Chúng tôi khởi chạy doanh nghiệp proptech trên chương trình Proptech AI-native trong một quý."), author: "Vo Thanh", role: t("Real-estate developer on RAI OS", "Chủ đầu tư trên RAI OS"), logos: ["RAI Property", "RAI Code", "MCP Registry"] },
  faq: [
    { q: t("Are prices in VND?", "Giá tính bằng VND?"), a: t("Yes — all plans are billed in Vietnamese đồng.", "Có — mọi gói tính bằng đồng Việt Nam.") },
    { q: t("Can I change plans later?", "Có đổi gói sau được không?"), a: t("Yes — upgrade anytime; downgrades apply at the end of the cycle.", "Có — nâng cấp bất cứ lúc nào; hạ cấp áp dụng cuối chu kỳ.") },
    { q: t("What is a program plan?", "Gói chương trình là gì?"), a: t("A themed bundle of AI agents and platforms for a vertical, like Proptech AI-native 2026.", "Bộ trợ lý ảo và nền tảng theo chủ đề cho một ngành, ví dụ Proptech AI-native 2026.") },
  ],
  updatedAt: "2026-06-17T00:00:00Z",
};

const store: PricingPage = PAGE;

/* ============================== queries ================================= */
export function getPricingPage(): PricingPage { return store; }
export function getPlan(key: string): Plan | undefined { return store.plans.find((p) => p.key === key); }
export function getAddOn(id: string): AddOn | undefined { return store.addOns.find((a) => a.id === id); }
export const planKeys = (): string[] => store.plans.map((p) => p.key);
