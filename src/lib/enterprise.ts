/**
 * RAI Enterprise — content layer (content-as-data, block-based landing pages).
 *
 * The Enterprise tab is the content / GTM layer of RAI OS. Three segmentation
 * axes — BY COMPANY SIZE / BY USE CASE / BY INDUSTRY — each resolving to a
 * block-based BOFU landing page. Content is structured data (not hard HTML) so
 * the admin CMS and the AI drafting pipeline can edit it safely.
 *
 * This module is server-safe (no fs / node-only deps) and client-importable:
 * the seed catalog + queries are read by the public API and SSR landing pages;
 * metric `system_query` values are computed from the in-memory catalogs of the
 * other layers (/apps, /marketplace, /code). Production = PostgreSQL + a job
 * queue (see SPEC_ENTERPRISE.md §4, §10).
 */
import { t, type T } from "@/lib/i18n-core";
import { apps } from "@/lib/apps";
import { listListings } from "@/lib/marketplace";
import { listRepos } from "@/lib/code";

/* ============================== axes & segments ========================== */
export type Axis = "size" | "use_case" | "industry";

/** URL uses "use-case"; the model uses "use_case". */
export const axisToUrl = (a: Axis): string => (a === "use_case" ? "use-case" : a);
export const axisFromUrl = (s: string): Axis | undefined =>
  s === "use-case" ? "use_case" : s === "size" || s === "industry" ? (s as Axis) : undefined;

export const axisLabels: Record<Axis, T> = {
  size: t("By company size", "Theo quy mô công ty"),
  use_case: t("By use case", "Theo tình huống sử dụng"),
  industry: t("By industry", "Theo ngành"),
};
export const axisColor: Record<Axis, string> = {
  size: "#2E75B6",
  use_case: "#0F6E56",
  industry: "#C9A227",
};

/* ============================== block schema ============================= */
export type BlockType =
  | "hero"
  | "metric_strip"
  | "pain_solution"
  | "feature_grid"
  | "use_case_steps"
  | "proof"
  | "comparison"
  | "faq"
  | "cta_band";

export type BlockStatus = "published" | "draft";
export type BlockSource = "manual" | "ai" | "community";

export type HeroData = { eyebrow?: T; title: T; subhead: T; ctaLabel: T; ctaHref: string; secondaryLabel?: T; secondaryHref?: string };
export type MetricStripData = { keys: string[] };
export type PainSolutionData = { items: { pain: T; solution: T }[] };
export type FeatureGridData = { items: { icon: string; title: T; body: T; href?: string }[] };
export type UseCaseStepsData = { steps: { title: T; body: T }[] };
export type ProofData = { quote: T; author: string; role: T; logos: string[] };
export type ComparisonData = { columns: T[]; rows: { label: T; cells: string[] }[] };
export type FaqData = { items: { q: T; a: T }[] };
export type CtaBandData = { title: T; body: T; ctaLabel: T; ctaHref: string };

export type BlockData =
  | HeroData | MetricStripData | PainSolutionData | FeatureGridData
  | UseCaseStepsData | ProofData | ComparisonData | FaqData | CtaBandData;

export type ContentBlock = {
  id: string;
  type: BlockType;
  order: number;
  data: BlockData;
  status: BlockStatus;
  source: BlockSource;
  lastUpdatedBy: string;
  updatedAt: string;
};

export const blockTypeLabels: Record<BlockType, T> = {
  hero: t("Hero", "Hero"),
  metric_strip: t("Metric strip", "Dải số liệu"),
  pain_solution: t("Pain → solution", "Vấn đề → giải pháp"),
  feature_grid: t("Feature grid", "Lưới tính năng"),
  use_case_steps: t("Use-case steps", "Các bước kịch bản"),
  proof: t("Proof", "Bằng chứng"),
  comparison: t("Comparison", "So sánh"),
  faq: t("FAQ", "FAQ"),
  cta_band: t("CTA band", "Dải CTA"),
};

/* ============================== metrics ================================= */
export type DataSource = "system_query" | "manual" | "community";
export type Metric = {
  id: string;
  key: string;
  label: T;
  value: string;
  unit?: T;
  dataSource: DataSource;
  query?: string; // for system_query: a resolver key (see systemMetricValue)
  lastRefreshedAt: string;
  verified: boolean;
};

/** Compute a system_query metric from the live in-memory catalogs. No fabrication. */
export function systemMetricValue(query: string): string {
  switch (query) {
    case "apps.count":
      return String(apps.length);
    case "marketplace.listings":
      return String(listListings({}).count);
    case "code.repos":
      return String(listRepos({}).length);
    case "code.repos.live":
      return String(listRepos({ status: "live" }).length);
    default:
      return "—";
  }
}

export const metrics: Metric[] = [
  { id: "m-apps", key: "apps_live", label: t("AI apps in the host", "App AI trong host"), value: "", unit: t("apps", "app"), dataSource: "system_query", query: "apps.count", lastRefreshedAt: "2026-06-16T00:00:00Z", verified: true },
  { id: "m-listings", key: "listings", label: t("Marketplace listings", "Listing trên marketplace"), value: "", unit: t("listings", "listing"), dataSource: "system_query", query: "marketplace.listings", lastRefreshedAt: "2026-06-16T00:00:00Z", verified: true },
  { id: "m-repos", key: "repos_live", label: t("Live deployments", "Bản triển khai chạy"), value: "", unit: t("deploys", "deploy"), dataSource: "system_query", query: "code.repos.live", lastRefreshedAt: "2026-06-16T00:00:00Z", verified: true },
  { id: "m-ent", key: "enterprises", label: t("Businesses on RAI OS", "Doanh nghiệp dùng RAI OS"), value: "1,200+", dataSource: "manual", lastRefreshedAt: "2026-06-01T00:00:00Z", verified: true },
  { id: "m-labs", key: "labs", label: t("Provincial labs", "Lab cấp tỉnh"), value: "30", dataSource: "manual", lastRefreshedAt: "2026-06-01T00:00:00Z", verified: true },
  { id: "m-opc", key: "opc", label: t("OPC partners", "Đối tác OPC"), value: "180+", dataSource: "manual", lastRefreshedAt: "2026-06-01T00:00:00Z", verified: true },
  { id: "m-uptime", key: "uptime", label: t("Platform uptime", "Thời gian hoạt động"), value: "99.95", unit: t("%", "%"), dataSource: "manual", lastRefreshedAt: "2026-06-01T00:00:00Z", verified: true },
];

export const getMetric = (key: string) => metrics.find((m) => m.key === key);

/** Resolved display value (computes system_query metrics live). */
export function metricValue(key: string, overrides?: Record<string, string>): string {
  if (overrides && overrides[key] != null) return overrides[key];
  const m = getMetric(key);
  if (!m) return "—";
  if (m.dataSource === "system_query" && m.query) return systemMetricValue(m.query);
  return m.value;
}

/* ============================== pages =================================== */
export type PageStatus = "draft" | "published" | "archived";
export type EnterprisePage = {
  id: string;
  axis: Axis;
  slug: string;
  segmentKey: string;
  title: T;
  seoTitle: T;
  seoDescription: T;
  ogImage?: string;
  status: PageStatus;
  blocks: ContentBlock[];
  createdAt: string;
  updatedAt: string;
};

/* ---- block builders (reduce repetition across seed pages) -------------- */
let _bseq = 0;
const block = (slug: string, type: BlockType, order: number, data: BlockData, source: BlockSource = "manual"): ContentBlock => ({
  id: `${slug}-${type}-${++_bseq}`,
  type, order, data, status: "published", source,
  lastUpdatedBy: "seed", updatedAt: "2026-06-16T00:00:00Z",
});

type SeedInput = {
  axis: Axis; slug: string; segmentKey: string; title: T; seoDescription: T;
  hero: HeroData; metricKeys: string[];
  pains: { pain: T; solution: T }[];
  features: { icon: string; title: T; body: T; href?: string }[];
  steps: { title: T; body: T }[];
  proof: ProofData;
  faq: { q: T; a: T }[];
  cta: CtaBandData;
};

function mkPage(s: SeedInput): EnterprisePage {
  const blocks: ContentBlock[] = [
    block(s.slug, "hero", 0, s.hero),
    block(s.slug, "metric_strip", 1, { keys: s.metricKeys }),
    block(s.slug, "pain_solution", 2, { items: s.pains }),
    block(s.slug, "feature_grid", 3, { items: s.features }),
    block(s.slug, "use_case_steps", 4, { steps: s.steps }),
    block(s.slug, "proof", 5, s.proof),
    block(s.slug, "faq", 6, { items: s.faq }),
    block(s.slug, "cta_band", 7, s.cta),
  ];
  return {
    id: `${s.axis}-${s.slug}`, axis: s.axis, slug: s.slug, segmentKey: s.segmentKey,
    title: s.title, seoTitle: t(`${s.title.en} — RAI OS for Enterprise`, `${s.title.vi} — RAI OS cho doanh nghiệp`),
    seoDescription: s.seoDescription, status: "published", blocks,
    createdAt: "2026-06-01T00:00:00Z", updatedAt: "2026-06-16T00:00:00Z",
  };
}

const CTA_CONTACT: CtaBandData = {
  title: t("Talk to the RAI enterprise team", "Nói chuyện với đội doanh nghiệp RAI"),
  body: t("See how RAI OS fits your stack. Book a working session with a solutions architect.", "Xem RAI OS hợp với hệ thống của bạn ra sao. Đặt buổi làm việc với kiến trúc sư giải pháp."),
  ctaLabel: t("Contact enterprise sales", "Liên hệ tư vấn doanh nghiệp"), ctaHref: "/enterprise/contribute",
};

/* ============================== seed catalog ============================ */
const SEED: EnterprisePage[] = [
  /* ---------- BY COMPANY SIZE ---------- */
  mkPage({
    axis: "size", slug: "startup-opc", segmentKey: "startup-opc",
    title: t("Startups & one-person companies", "Startup & công ty một thành viên"),
    seoDescription: t("Launch an AI-native business on RAI OS — apps, deploy, and marketplace from day one.", "Khởi chạy doanh nghiệp AI-native trên RAI OS — app, deploy và marketplace ngay từ đầu."),
    hero: {
      eyebrow: t("For startups & OPCs", "Cho startup & OPC"),
      title: t("Run your whole company on one operating system", "Vận hành cả công ty trên một hệ điều hành"),
      subhead: t("From idea to live product without stitching ten tools together. Build with RAI apps, ship with RAI Code, sell on the marketplace.", "Từ ý tưởng đến sản phẩm chạy thật mà không phải ghép mười công cụ. Xây bằng RAI apps, ship bằng RAI Code, bán trên marketplace."),
      ctaLabel: t("Start building", "Bắt đầu xây"), ctaHref: "/apps",
      secondaryLabel: t("Browse the marketplace", "Xem marketplace"), secondaryHref: "/marketplace",
    },
    metricKeys: ["apps_live", "repos_live", "opc"],
    pains: [
      { pain: t("Too many disconnected SaaS tools to afford and maintain.", "Quá nhiều SaaS rời rạc, tốn kém và khó duy trì."), solution: t("One platform spanning capital, technology, and commerce — pay for what you use.", "Một nền tảng phủ vốn, công nghệ và thương mại — trả theo mức dùng.") },
      { pain: t("No engineering team to deploy and operate software.", "Không có đội kỹ thuật để deploy và vận hành phần mềm."), solution: t("Instant deploy on RAI Code: pick a template, attach a domain, it runs.", "Deploy tức thì trên RAI Code: chọn mẫu, gắn domain, là chạy.") },
    ],
    features: [
      { icon: "robot", title: t("RAI Apps", "RAI Apps"), body: t("AI apps that run inside the conversation.", "App AI chạy ngay trong hội thoại."), href: "/apps" },
      { icon: "bolt", title: t("Instant deploy", "Deploy tức thì"), body: t("From repo to a live URL in minutes.", "Từ repo tới URL chạy thật trong vài phút."), href: "/code" },
      { icon: "cart", title: t("Sell on day one", "Bán ngay ngày đầu"), body: t("List your app or template on the marketplace.", "Đăng app hoặc mẫu lên marketplace."), href: "/marketplace" },
    ],
    steps: [
      { title: t("Pick a template", "Chọn một mẫu"), body: t("Start from a React, Node, or MCP-server template.", "Bắt đầu từ mẫu React, Node hoặc MCP-server.") },
      { title: t("Build with AI apps", "Xây bằng app AI"), body: t("Compose property, design, and workflow apps.", "Kết hợp app bất động sản, thiết kế và workflow.") },
      { title: t("Deploy & sell", "Deploy & bán"), body: t("Ship to a live domain and list on the marketplace.", "Đưa lên domain chạy thật và đăng bán trên marketplace.") },
    ],
    proof: { quote: t("We went from idea to a paying product in three weeks — without hiring a dev team.", "Chúng tôi đi từ ý tưởng tới sản phẩm có doanh thu trong ba tuần — không cần thuê đội dev."), author: "Linh Pham", role: t("Founder, an OPC on RAI OS", "Nhà sáng lập, một OPC trên RAI OS"), logos: ["RAI ONE", "RAI Code", "Marketplace"] },
    faq: [
      { q: t("Do I need to code?", "Tôi có cần biết code không?"), a: t("No — templates and AI apps cover most cases; the editor is there when you want it.", "Không — mẫu và app AI lo phần lớn; trình soạn có sẵn khi bạn cần.") },
      { q: t("What does it cost to start?", "Bắt đầu tốn bao nhiêu?"), a: t("Free tiers across apps and code; pay as you grow.", "Có gói miễn phí ở apps và code; trả thêm khi mở rộng.") },
    ],
    cta: CTA_CONTACT,
  }),
  mkPage({
    axis: "size", slug: "sme", segmentKey: "sme",
    title: t("Small & medium businesses", "Doanh nghiệp vừa & nhỏ"),
    seoDescription: t("Standardize operations and grow with AI across your SME on RAI OS.", "Chuẩn hóa vận hành và tăng trưởng bằng AI cho SME trên RAI OS."),
    hero: {
      eyebrow: t("For SMEs", "Cho SME"),
      title: t("Standardize operations, then scale them with AI", "Chuẩn hóa vận hành, rồi mở rộng bằng AI"),
      subhead: t("Replace spreadsheets and ad-hoc tools with workflows, data, and apps that share one source of truth.", "Thay bảng tính và công cụ chắp vá bằng workflow, dữ liệu và app dùng chung một nguồn sự thật."),
      ctaLabel: t("See the platform", "Xem nền tảng"), ctaHref: "/marketplace",
      secondaryLabel: t("Explore apps", "Khám phá app"), secondaryHref: "/apps",
    },
    metricKeys: ["enterprises", "listings", "uptime"],
    pains: [
      { pain: t("Data scattered across tools nobody fully trusts.", "Dữ liệu rải rác khắp các công cụ, không ai tin trọn."), solution: t("A shared data and workflow layer keeps everyone on the same numbers.", "Lớp dữ liệu & workflow dùng chung giữ mọi người trên cùng con số.") },
      { pain: t("Manual reporting eats management time.", "Báo cáo thủ công ngốn thời gian quản lý."), solution: t("Automated dashboards and AI summaries refresh on schedule.", "Dashboard tự động và tóm tắt AI làm tươi theo lịch.") },
    ],
    features: [
      { icon: "database", title: t("Shared data layer", "Lớp dữ liệu chung"), body: t("One source of truth across departments.", "Một nguồn sự thật cho các phòng ban."), href: "/marketplace" },
      { icon: "robot", title: t("Workflow automation", "Tự động hóa workflow"), body: t("Automate repetitive operations with AI apps.", "Tự động hóa thao tác lặp bằng app AI."), href: "/apps" },
      { icon: "trending-up", title: t("Growth analytics", "Phân tích tăng trưởng"), body: t("Track the metrics that move the business.", "Theo dõi chỉ số tác động tới kinh doanh.") },
    ],
    steps: [
      { title: t("Map your processes", "Vẽ lại quy trình"), body: t("Capture current operations as workflows.", "Ghi lại vận hành hiện tại thành workflow.") },
      { title: t("Connect your data", "Kết nối dữ liệu"), body: t("Bring tools into one shared layer.", "Đưa các công cụ về một lớp chung.") },
      { title: t("Automate & measure", "Tự động hóa & đo lường"), body: t("Let AI handle the repetitive parts.", "Để AI lo phần lặp đi lặp lại.") },
    ],
    proof: { quote: t("Monthly closing went from five days to one. Everyone reads the same dashboard now.", "Chốt sổ hàng tháng từ năm ngày còn một. Giờ ai cũng đọc cùng một dashboard."), author: "Tran Hoa", role: t("Operations lead, an SME on RAI OS", "Trưởng vận hành, một SME trên RAI OS"), logos: ["RAI LAB", "Workflow", "Data"] },
    faq: [
      { q: t("Can we migrate existing data?", "Có chuyển dữ liệu cũ được không?"), a: t("Yes — import tools bring existing data into the shared layer.", "Có — công cụ nhập đưa dữ liệu sẵn có vào lớp chung.") },
      { q: t("Is it secure for business data?", "Có an toàn cho dữ liệu doanh nghiệp không?"), a: t("Scoped permissions and audit logs apply across the platform.", "Phân quyền theo phạm vi và nhật ký kiểm toán áp toàn nền tảng.") },
    ],
    cta: CTA_CONTACT,
  }),
  mkPage({
    axis: "size", slug: "enterprise", segmentKey: "enterprise",
    title: t("Large enterprises", "Doanh nghiệp lớn"),
    seoDescription: t("Govern AI at scale across business units with RAI OS — security, audit, and a private registry.", "Quản trị AI ở quy mô lớn cho các đơn vị kinh doanh với RAI OS — bảo mật, kiểm toán và registry riêng."),
    hero: {
      eyebrow: t("For enterprises", "Cho doanh nghiệp lớn"),
      title: t("Govern AI across every business unit", "Quản trị AI trên mọi đơn vị kinh doanh"),
      subhead: t("A private app host, an internal MCP registry, scoped permissions, and full audit — so teams move fast under one policy.", "Host app riêng, registry MCP nội bộ, phân quyền theo phạm vi và kiểm toán đầy đủ — để các đội chạy nhanh dưới một chính sách."),
      ctaLabel: t("See the registry", "Xem registry"), ctaHref: "/mcp",
      secondaryLabel: t("Review governance", "Xem quản trị"), secondaryHref: "/apps",
    },
    metricKeys: ["enterprises", "apps_live", "uptime"],
    pains: [
      { pain: t("Shadow AI tools spread without oversight.", "Công cụ AI ngầm lan rộng, thiếu giám sát."), solution: t("A private registry + scoped tokens put every integration under policy.", "Registry riêng + token theo phạm vi đưa mọi tích hợp vào chính sách.") },
      { pain: t("Compliance needs a full audit trail.", "Tuân thủ cần dấu vết kiểm toán đầy đủ."), solution: t("Every tool call is consented, scoped, and logged.", "Mọi lệnh gọi tool đều được đồng ý, giới hạn phạm vi và ghi log.") },
    ],
    features: [
      { icon: "shield", title: t("Scoped permissions", "Phân quyền theo phạm vi"), body: t("OAuth-style consent enforced on every tool call.", "Đồng ý kiểu OAuth được áp trên mọi lệnh gọi tool."), href: "/apps" },
      { icon: "server", title: t("Private MCP registry", "Registry MCP riêng"), body: t("Connect models to internal systems, governed.", "Kết nối model với hệ thống nội bộ, có quản trị."), href: "/mcp" },
      { icon: "file-text", title: t("Audit & metering", "Kiểm toán & đo lường"), body: t("Usage metered per app, team, and tool.", "Đo lường theo từng app, đội và tool.") },
    ],
    steps: [
      { title: t("Set policy", "Đặt chính sách"), body: t("Define scopes and approval gates centrally.", "Định nghĩa phạm vi và cổng duyệt tập trung.") },
      { title: t("Onboard units", "Lên các đơn vị"), body: t("Each unit publishes to the private registry.", "Mỗi đơn vị publish lên registry riêng.") },
      { title: t("Audit continuously", "Kiểm toán liên tục"), body: t("Review metered usage and access logs.", "Soát usage đo lường và nhật ký truy cập.") },
    ],
    proof: { quote: t("We finally see — and control — every AI integration across twelve subsidiaries.", "Cuối cùng chúng tôi nhìn thấy — và kiểm soát — mọi tích hợp AI trên mười hai công ty con."), author: "Nguyen Quang", role: t("CIO, an enterprise group on RAI OS", "CIO, một tập đoàn trên RAI OS"), logos: ["MCP Registry", "Apps", "Audit"] },
    faq: [
      { q: t("Can we self-host the registry?", "Có thể tự host registry không?"), a: t("The registry API is compatible with the official MCP registry and can run privately.", "API registry tương thích registry MCP chính thức và có thể chạy riêng.") },
      { q: t("How is access controlled?", "Kiểm soát truy cập thế nào?"), a: t("Namespace auth, scoped tokens, and per-tool consent.", "Xác thực namespace, token theo phạm vi và đồng ý theo từng tool.") },
    ],
    cta: CTA_CONTACT,
  }),

  /* ---------- BY USE CASE ---------- */
  mkPage({
    axis: "use_case", slug: "automation", segmentKey: "automation",
    title: t("Automation", "Tự động hóa"),
    seoDescription: t("Automate repetitive operations with AI workflows on RAI OS.", "Tự động hóa thao tác lặp bằng workflow AI trên RAI OS."),
    hero: {
      eyebrow: t("Use case: automation", "Tình huống: tự động hóa"),
      title: t("Turn repetitive work into automated workflows", "Biến việc lặp lại thành workflow tự động"),
      subhead: t("Connect models to your tools and let AI run the steps — with consent and an audit trail on every action.", "Kết nối model với công cụ của bạn và để AI chạy các bước — có đồng ý và dấu vết kiểm toán trên mọi hành động."),
      ctaLabel: t("Explore workflow apps", "Khám phá app workflow"), ctaHref: "/apps",
      secondaryLabel: t("Browse connectors", "Xem connector"), secondaryHref: "/mcp",
    },
    metricKeys: ["apps_live", "listings", "uptime"],
    pains: [
      { pain: t("Staff spend hours on copy-paste between systems.", "Nhân sự mất hàng giờ copy-paste giữa các hệ thống."), solution: t("Workflow apps move data and trigger actions automatically.", "App workflow tự chuyển dữ liệu và kích hoạt hành động.") },
      { pain: t("Automations break silently and nobody notices.", "Tự động hóa hỏng âm thầm, không ai biết."), solution: t("Each run is logged with steps, inputs, and outcomes.", "Mỗi lần chạy được ghi log kèm bước, đầu vào và kết quả.") },
    ],
    features: [
      { icon: "robot", title: t("RAI Workflow", "RAI Workflow"), body: t("n8n-style runs inside the conversation.", "Chạy kiểu n8n ngay trong hội thoại."), href: "/apps" },
      { icon: "server", title: t("MCP connectors", "Connector MCP"), body: t("Connect models to real systems.", "Kết nối model với hệ thống thật."), href: "/mcp" },
      { icon: "file-text", title: t("Run audit", "Kiểm toán lần chạy"), body: t("Every step recorded for review.", "Mọi bước được ghi lại để soát.") },
    ],
    steps: [
      { title: t("Pick a trigger", "Chọn trigger"), body: t("Schedule, event, or message.", "Theo lịch, sự kiện hoặc tin nhắn.") },
      { title: t("Connect tools", "Kết nối công cụ"), body: t("Use MCP connectors for your systems.", "Dùng connector MCP cho hệ thống của bạn.") },
      { title: t("Run with consent", "Chạy có đồng ý"), body: t("Approve scopes; the host enforces them.", "Duyệt phạm vi; host sẽ thực thi.") },
    ],
    proof: { quote: t("A nightly workflow now reconciles three systems that used to need a person each morning.", "Một workflow chạy đêm giờ đối soát ba hệ thống vốn cần người làm mỗi sáng."), author: "Le Minh", role: t("Ops automation lead", "Trưởng tự động hóa vận hành"), logos: ["Workflow", "MCP", "Audit"] },
    faq: [
      { q: t("Can automations call our internal APIs?", "Tự động hóa có gọi API nội bộ không?"), a: t("Yes — via MCP connectors with scoped credentials.", "Có — qua connector MCP với thông tin xác thực theo phạm vi.") },
      { q: t("What if a step fails?", "Nếu một bước lỗi thì sao?"), a: t("The run log shows the failing step for quick recovery.", "Nhật ký lần chạy chỉ rõ bước lỗi để khôi phục nhanh.") },
    ],
    cta: CTA_CONTACT,
  }),
  mkPage({
    axis: "use_case", slug: "data-analytics", segmentKey: "data-analytics",
    title: t("Data & analytics", "Dữ liệu & phân tích"),
    seoDescription: t("Turn operational data into decisions with AI analytics on RAI OS.", "Biến dữ liệu vận hành thành quyết định bằng phân tích AI trên RAI OS."),
    hero: {
      eyebrow: t("Use case: data & analytics", "Tình huống: dữ liệu & phân tích"),
      title: t("From raw operations data to clear decisions", "Từ dữ liệu vận hành thô tới quyết định rõ ràng"),
      subhead: t("Bring your data into one layer, then let AI summarize, chart, and surface what changed — sourced, never invented.", "Đưa dữ liệu về một lớp, rồi để AI tóm tắt, vẽ biểu đồ và nêu điều đã đổi — có nguồn, không bịa."),
      ctaLabel: t("See data apps", "Xem app dữ liệu"), ctaHref: "/apps",
      secondaryLabel: t("Browse the marketplace", "Xem marketplace"), secondaryHref: "/marketplace",
    },
    metricKeys: ["listings", "repos_live", "enterprises"],
    pains: [
      { pain: t("Reports are stale by the time they're read.", "Báo cáo cũ ngay khi vừa đọc xong."), solution: t("Dashboards refresh from system queries on schedule.", "Dashboard làm tươi từ truy vấn hệ thống theo lịch.") },
      { pain: t("AI summaries can't be trusted without sources.", "Tóm tắt AI khó tin nếu thiếu nguồn."), solution: t("Every metric is traceable to a data source — no fabricated numbers.", "Mỗi số liệu truy được về nguồn — không bịa số.") },
    ],
    features: [
      { icon: "database", title: t("Unified data", "Dữ liệu hợp nhất"), body: t("One layer across your tools.", "Một lớp chung cho các công cụ."), href: "/marketplace" },
      { icon: "trending-up", title: t("Live dashboards", "Dashboard trực tiếp"), body: t("Refresh from system queries.", "Làm tươi từ truy vấn hệ thống.") },
      { icon: "sparkles", title: t("AI summaries", "Tóm tắt AI"), body: t("Sourced narratives, not guesses.", "Diễn giải có nguồn, không phỏng đoán.") },
    ],
    steps: [
      { title: t("Connect sources", "Kết nối nguồn"), body: t("Bring data into the shared layer.", "Đưa dữ liệu vào lớp chung.") },
      { title: t("Define metrics", "Định nghĩa số liệu"), body: t("Each metric gets a data source.", "Mỗi số liệu gắn một nguồn dữ liệu.") },
      { title: t("Review insights", "Soát insight"), body: t("AI surfaces changes for a human to confirm.", "AI nêu thay đổi để người xác nhận.") },
    ],
    proof: { quote: t("Our weekly review is now a single sourced dashboard instead of six spreadsheets.", "Buổi review hàng tuần giờ là một dashboard có nguồn thay vì sáu bảng tính."), author: "Pham Anh", role: t("Head of analytics", "Trưởng phân tích"), logos: ["Data", "Dashboards", "AI"] },
    faq: [
      { q: t("Where do the numbers come from?", "Số liệu lấy từ đâu?"), a: t("System queries or verified manual sources — every metric carries its source.", "Truy vấn hệ thống hoặc nguồn thủ công đã xác minh — mỗi số liệu mang theo nguồn.") },
      { q: t("Can AI invent figures?", "AI có bịa số không?"), a: t("No — guardrails block any metric without a data source.", "Không — guardrail chặn mọi số liệu không có nguồn.") },
    ],
    cta: CTA_CONTACT,
  }),

  /* ---------- BY INDUSTRY ---------- */
  mkPage({
    axis: "industry", slug: "real-estate", segmentKey: "real-estate",
    title: t("Real estate", "Bất động sản"),
    seoDescription: t("Run listings, projects, and customers on RAI OS — built with the RAI property stack.", "Vận hành listing, dự án và khách hàng trên RAI OS — xây bằng bộ sản phẩm bất động sản RAI."),
    hero: {
      eyebrow: t("Industry: real estate", "Ngành: bất động sản"),
      title: t("A real-estate business in one operating system", "Một doanh nghiệp bất động sản trong một hệ điều hành"),
      subhead: t("Interactive property maps, project portals, and customer workflows — built on the RAI property apps and deployed in minutes.", "Bản đồ bất động sản tương tác, cổng dự án và workflow khách hàng — xây trên app bất động sản RAI và deploy trong vài phút."),
      ctaLabel: t("See RAI Property", "Xem RAI Property"), ctaHref: "/apps",
      secondaryLabel: t("Deploy a portal", "Deploy một cổng"), secondaryHref: "/code",
    },
    metricKeys: ["apps_live", "repos_live", "enterprises"],
    pains: [
      { pain: t("Listings live in spreadsheets and chat threads.", "Listing nằm trong bảng tính và tin nhắn."), solution: t("An interactive property app keeps maps, cards, and details in sync.", "App bất động sản tương tác giữ bản đồ, thẻ và chi tiết đồng bộ.") },
      { pain: t("Each project needs a new website fast.", "Mỗi dự án cần một website mới thật nhanh."), solution: t("Deploy a project portal from a template in minutes.", "Deploy cổng dự án từ mẫu trong vài phút.") },
    ],
    features: [
      { icon: "home", title: t("RAI Property", "RAI Property"), body: t("Interactive map, cards, and detail view.", "Bản đồ tương tác, thẻ và xem chi tiết."), href: "/apps" },
      { icon: "bolt", title: t("Project portals", "Cổng dự án"), body: t("Deploy a site per project, instantly.", "Deploy một site cho mỗi dự án, tức thì."), href: "/code" },
      { icon: "cart", title: t("Listing marketplace", "Marketplace listing"), body: t("Distribute listings and tools.", "Phân phối listing và công cụ."), href: "/marketplace" },
    ],
    steps: [
      { title: t("Import listings", "Nhập listing"), body: t("Bring properties into the property app.", "Đưa bất động sản vào app property.") },
      { title: t("Launch a portal", "Khởi chạy cổng"), body: t("Deploy a project site from a template.", "Deploy site dự án từ mẫu.") },
      { title: t("Engage customers", "Tương tác khách"), body: t("Run customer workflows with AI apps.", "Chạy workflow khách hàng bằng app AI.") },
    ],
    proof: { quote: t("Our NOXH portal went live the same week — buyers explore units on an interactive map now.", "Cổng NOXH của chúng tôi chạy ngay trong tuần — người mua xem căn trên bản đồ tương tác."), author: "Vo Thanh", role: t("Sales director, a property developer on RAI OS", "Giám đốc bán hàng, một chủ đầu tư trên RAI OS"), logos: ["RAI Property", "RAI Code", "RAI ONE"] },
    faq: [
      { q: t("Can buyers explore on a map?", "Người mua xem trên bản đồ được không?"), a: t("Yes — the RAI Property app renders an interactive map with detail cards.", "Có — app RAI Property hiển thị bản đồ tương tác kèm thẻ chi tiết.") },
      { q: t("How fast can a project site launch?", "Site dự án chạy nhanh thế nào?"), a: t("From a template, a portal can be live the same day.", "Từ mẫu, một cổng có thể chạy ngay trong ngày.") },
    ],
    cta: CTA_CONTACT,
  }),
  mkPage({
    axis: "industry", slug: "finance", segmentKey: "finance",
    title: t("Finance", "Tài chính"),
    seoDescription: t("Operate financial services on RAI OS with governance, audit, and a private registry.", "Vận hành dịch vụ tài chính trên RAI OS với quản trị, kiểm toán và registry riêng."),
    hero: {
      eyebrow: t("Industry: finance", "Ngành: tài chính"),
      title: t("AI for finance, under full governance", "AI cho tài chính, dưới quản trị đầy đủ"),
      subhead: t("Automate analysis and operations while every model interaction stays scoped, consented, and audited.", "Tự động hóa phân tích và vận hành trong khi mọi tương tác model luôn giới hạn phạm vi, có đồng ý và được kiểm toán."),
      ctaLabel: t("See governance", "Xem quản trị"), ctaHref: "/mcp",
      secondaryLabel: t("Explore apps", "Khám phá app"), secondaryHref: "/apps",
    },
    metricKeys: ["enterprises", "uptime", "apps_live"],
    pains: [
      { pain: t("Regulators require traceable AI usage.", "Cơ quan quản lý yêu cầu dùng AI truy vết được."), solution: t("Scoped tokens and per-tool consent give a complete audit trail.", "Token theo phạm vi và đồng ý theo tool tạo dấu vết kiểm toán đầy đủ.") },
      { pain: t("Analysts repeat the same reconciliations.", "Chuyên viên lặp lại cùng các đối soát."), solution: t("Workflows automate reconciliation with sourced numbers.", "Workflow tự động đối soát với số liệu có nguồn.") },
    ],
    features: [
      { icon: "shield", title: t("Governed AI", "AI có quản trị"), body: t("Consent and scopes on every call.", "Đồng ý và phạm vi trên mọi lệnh gọi."), href: "/apps" },
      { icon: "trending-up", title: t("Sourced analytics", "Phân tích có nguồn"), body: t("Numbers traceable to a source.", "Số liệu truy được về nguồn.") },
      { icon: "server", title: t("Private registry", "Registry riêng"), body: t("Connect to core systems under policy.", "Kết nối hệ thống lõi theo chính sách."), href: "/mcp" },
    ],
    steps: [
      { title: t("Define policy", "Định nghĩa chính sách"), body: t("Set scopes and approval gates.", "Đặt phạm vi và cổng duyệt.") },
      { title: t("Automate analysis", "Tự động hóa phân tích"), body: t("Reconcile and report with sourced data.", "Đối soát và báo cáo bằng dữ liệu có nguồn.") },
      { title: t("Prove compliance", "Chứng minh tuân thủ"), body: t("Export the full audit trail.", "Xuất dấu vết kiểm toán đầy đủ.") },
    ],
    proof: { quote: t("Audit prep dropped from weeks to a single export — every model call is already logged.", "Chuẩn bị kiểm toán giảm từ vài tuần còn một lần xuất — mọi lệnh gọi model đã được ghi log."), author: "Dang Khoa", role: t("Risk & compliance lead", "Trưởng rủi ro & tuân thủ"), logos: ["Audit", "MCP", "Apps"] },
    faq: [
      { q: t("Is every AI action logged?", "Mọi hành động AI có được ghi log không?"), a: t("Yes — consent, scope, and outcome are recorded per call.", "Có — đồng ý, phạm vi và kết quả được ghi theo từng lệnh gọi.") },
      { q: t("Can we restrict which models run?", "Có thể giới hạn model nào được chạy không?"), a: t("Policy controls which connectors and scopes are permitted.", "Chính sách kiểm soát connector và phạm vi nào được phép.") },
    ],
    cta: CTA_CONTACT,
  }),
];

const store: EnterprisePage[] = [...SEED];

/* ============================== queries ================================= */
export function listPages(axis?: Axis): EnterprisePage[] {
  const rows = axis ? store.filter((p) => p.axis === axis) : store;
  return [...rows].sort((a, b) => a.slug.localeCompare(b.slug));
}
export function getPage(axis: Axis, slug: string): EnterprisePage | undefined {
  return store.find((p) => p.axis === axis && p.slug === slug);
}
/** Lightweight nav/hub descriptor (no blocks) for menus and the hub grid. */
export type PageRef = { axis: Axis; slug: string; url: string; title: T; seoDescription: T };
export function pageRefs(axis?: Axis): PageRef[] {
  return listPages(axis).map((p) => ({ axis: p.axis, slug: p.slug, url: `/enterprise/${axisToUrl(p.axis)}/${p.slug}`, title: p.title, seoDescription: p.seoDescription }));
}
export const allAxes: Axis[] = ["size", "use_case", "industry"];

/** Planned segments shown (muted) in the hub but not yet live. */
export const plannedSegments: Record<Axis, T[]> = {
  size: [t("Corporations", "Tập đoàn"), t("Public sector", "Khối công")],
  use_case: [t("AI customer support", "CSKH bằng AI"), t("Project management", "Quản lý dự án"), t("Design", "Thiết kế"), t("Software development", "Phát triển phần mềm")],
  industry: [t("Retail", "Bán lẻ"), t("Manufacturing", "Sản xuất"), t("Education", "Giáo dục"), t("Healthcare / Logistics", "Y tế / Logistics")],
};
