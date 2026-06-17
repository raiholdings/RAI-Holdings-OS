/**
 * RAI LAB — AI infrastructure profile (/lab).
 * Content extracted from "6. RAI-LAB-Profile-v1.0.0.pdf" (RAI Holdings).
 * Bilingual EN/VI. RAI LAB is the AI infrastructure / PaaS layer of the
 * ecosystem — entity color = Tech Teal (--color-lab).
 */
import { t, type T } from "@/lib/i18n-core";

export const LAB = "var(--color-lab)";

export const labHero = {
  docId: "RAI-ENT-LAB-01 // v1.0.0",
  eyebrow: t("RAI LAB · AI Infrastructure", "RAI LAB · Hạ tầng AI"),
  title: t("The AI brain of the ecosystem.", "Bộ não AI của hệ sinh thái."),
  subtitle: t(
    "Proprietary AI infrastructure — from foundation models to agent orchestration, data platform to automation. Delivered to portfolio companies and enterprises as platform-as-a-service.",
    "Hạ tầng công nghệ AI proprietary — từ foundation models đến agent orchestration, data platform đến automation. Cung cấp cho portfolio companies và doanh nghiệp dưới dạng platform-as-a-service.",
  ),
  quote: t(
    "We don't build AI to sell APIs. We build AI to run a new generation of companies.",
    "Chúng tôi không xây dựng AI để bán API. Chúng tôi xây dựng AI để vận hành một thế hệ doanh nghiệp mới.",
  ),
  ctaPrimary: t("Read the docs", "Xem tài liệu"),
  ctaSecondary: t("Talk to engineering", "Liên hệ kỹ thuật"),
};

export type LabMetric = { value: string; label: T };
export const labMetrics: LabMetric[] = [
  { value: "12+", label: t("AI products in production", "Sản phẩm AI production") },
  { value: "$15M", label: t("ARR target 2028", "ARR mục tiêu 2028") },
  { value: "100+", label: t("Enterprise customers", "Khách hàng doanh nghiệp") },
  { value: "99.9%", label: t("Platform uptime SLA", "Uptime SLA nền tảng") },
];

/* ----------------------------- 4 core layers ---------------------------- */
export type LabProduct = { name: string; role: T; status: "production" | "beta" | "alpha" | "roadmap" };
export type LabLayer = { code: string; name: T; icon: string; desc: T; products: LabProduct[] };

export const statusMeta: Record<LabProduct["status"], { label: T; tone: string }> = {
  production: { label: t("Production", "Production"), tone: "var(--color-ok)" },
  beta: { label: t("Beta", "Beta"), tone: "var(--color-warn)" },
  alpha: { label: t("Alpha", "Alpha"), tone: "var(--color-holdings)" },
  roadmap: { label: t("Roadmap", "Lộ trình"), tone: "var(--color-text-2)" },
};

// Ordered top → bottom as presented (Layer 04 on top, 01 at the core).
export const labLayers: LabLayer[] = [
  {
    code: "L04", name: t("Automation & Workflow", "Tự động hóa & Quy trình"), icon: "bolt",
    desc: t("Turn every business workflow into an automated pipeline.", "Biến mọi business workflow thành automated pipeline."),
    products: [
      { name: "RAI n8n", role: t("Low-code workflow automation with embedded AI nodes.", "Tự động hóa quy trình low-code, AI node tích hợp."), status: "beta" },
      { name: "RAI Platform", role: t("Multi-tenant SaaS hosting with strict data isolation.", "Hosting SaaS multi-tenant, data isolation chặt."), status: "roadmap" },
    ],
  },
  {
    code: "L03", name: t("Data Platform", "Nền tảng dữ liệu"), icon: "database",
    desc: t("Where data becomes knowledge — unified, real-time, AI-ready.", "Nơi data trở thành tri thức — hợp nhất, real-time, sẵn cho AI."),
    products: [
      { name: "RAI CDP", role: t("Customer Data Platform with AI identity resolution.", "Customer Data Platform, hợp nhất danh tính bằng AI."), status: "beta" },
      { name: "RAI Data", role: t("Petabyte-scale warehouse + AI feature store.", "Kho dữ liệu petabyte + feature store cho AI."), status: "alpha" },
    ],
  },
  {
    code: "L02", name: t("Agent Orchestration", "Điều phối Agent"), icon: "robot",
    desc: t("Production multi-agent framework — sequential, parallel, swarm.", "Multi-agent framework production — sequential, parallel, swarm."),
    products: [
      { name: "RAI Agent", role: t("Multi-agent framework: memory, tools, observability, guardrails.", "Framework multi-agent: memory, tools, observability, guardrails."), status: "production" },
      { name: "RAI Bot", role: t("No-code chatbot builder, multi-channel, Zalo-first.", "Chatbot builder no-code, đa kênh, Zalo-first."), status: "beta" },
    ],
  },
  {
    code: "L01", name: t("Foundation Models", "Mô hình nền tảng"), icon: "sparkles",
    desc: t("The core — Vietnamese LLMs and embeddings, enterprise-grade.", "Lớp lõi — LLM và embedding tiếng Việt, enterprise-grade."),
    products: [
      { name: "RAI GPT", role: t("Vietnamese LLM (7B/13B/70B), 128K context, beats GPT-4 +30% on VN tasks.", "LLM tiếng Việt (7B/13B/70B), context 128K, vượt GPT-4 +30% tác vụ VN."), status: "production" },
      { name: "RAI Embed", role: t("Bilingual embedding (1536-dim) for search, RAG, recommendation.", "Embedding song ngữ (1536-dim) cho search, RAG, gợi ý."), status: "production" },
    ],
  },
];

export const roadmapProducts: { name: string; role: T }[] = [
  { name: "RAI Voice", role: t("Vietnamese TTS / STT", "TTS / STT tiếng Việt") },
  { name: "RAI Vision", role: t("Computer vision for retail & PropTech", "Thị giác máy tính cho retail & PropTech") },
  { name: "RAI Code", role: t("Code-gen agent for dev teams", "Agent sinh code cho đội dev") },
  { name: "RAI Compliance", role: t("AI for audit & regulatory reporting", "AI cho audit & báo cáo tuân thủ") },
];

/* ----------------------------- Principles ------------------------------- */
export type Principle = { n: string; title: T; body: T };
export const principles: Principle[] = [
  { n: "01", title: t("Model-agnostic, infrastructure-opinionated", "Trung lập về model, sở hữu hạ tầng"), body: t("Use best-in-class or self-built models, but we own orchestration, data, and security 100%.", "Dùng model tốt nhất hoặc tự xây, nhưng orchestration, data, security là lớp sở hữu 100%.") },
  { n: "02", title: t("Multi-tenant from day one", "Multi-tenant từ ngày đầu"), body: t("Every system serves N customers concurrently with enterprise-grade data isolation.", "Mọi hệ thống phục vụ N khách hàng đồng thời với data isolation chuẩn enterprise.") },
  { n: "03", title: t("Vietnamese-first, regional-ready", "Ưu tiên tiếng Việt, sẵn sàng khu vực"), body: t("Optimized for Vietnamese + regional business context. Data residency per Decree 13/2023.", "Tối ưu tiếng Việt + ngữ cảnh khu vực. Data residency tuân thủ Nghị định 13/2023.") },
  { n: "04", title: t("Production-grade from v1", "Production-grade từ phiên bản đầu"), body: t("99.9% uptime SLA, multi-region failover, full observability. No demo-only features.", "99.9% uptime SLA, multi-region failover, quan trắc đầy đủ. Không có tính năng demo-only.") },
];

/* ----------------------------- Pricing ---------------------------------- */
export type PriceTier = { name: string; price: T; blurb: T; featured?: boolean; specs: { k: T; v: string }[] };
export const pricing: PriceTier[] = [
  {
    name: "Developer", price: t("Free", "Miễn phí"), blurb: t("For developers and early-stage startups.", "Cho developer, startup early-stage."),
    specs: [{ k: t("RAI GPT", "RAI GPT"), v: "10K tokens/mo" }, { k: t("Rate limit", "Giới hạn tần suất"), v: "10 req/min" }, { k: t("Support", "Hỗ trợ"), v: "Community" }, { k: t("SLA", "SLA"), v: "Best-effort" }],
  },
  {
    name: "Starter", price: t("from $99/mo", "từ $99/tháng"), blurb: t("Small teams, SMEs, portfolio companies (free first 24mo).", "Team nhỏ, SME, portfolio (free 24 tháng đầu)."),
    specs: [{ k: t("RAI GPT", "RAI GPT"), v: "500K tokens/mo" }, { k: t("Rate limit", "Giới hạn tần suất"), v: "100 req/min" }, { k: t("Support", "Hỗ trợ"), v: "Email · 24h" }, { k: t("SLA", "SLA"), v: "99.5%" }],
  },
  {
    name: "Business", price: t("from $999/mo", "từ $999/tháng"), blurb: t("Mid-market, agencies, dev shops.", "Mid-market, agency, dev shop."), featured: true,
    specs: [{ k: t("RAI GPT", "RAI GPT"), v: "10M tokens/mo" }, { k: t("Rate limit", "Giới hạn tần suất"), v: "1,000 req/min" }, { k: t("Support", "Hỗ trợ"), v: "Slack · 4h" }, { k: t("SLA", "SLA"), v: "99.9% · CSM" }],
  },
  {
    name: "Enterprise", price: t("Custom · from $50K/yr", "Custom · từ $50K/năm"), blurb: t("Large enterprises, banks, government.", "Doanh nghiệp lớn, ngân hàng, chính phủ."),
    specs: [{ k: t("Volume", "Lưu lượng"), v: "Unlimited" }, { k: t("Deployment", "Triển khai"), v: "Dedicated / on-prem" }, { k: t("Support", "Hỗ trợ"), v: "24/7 · 1h" }, { k: t("SLA", "SLA"), v: "99.95% + credits" }],
  },
];

/* ----------------------------- Use cases -------------------------------- */
export type UseCase = { name: T; stack: string; roi: T };
export const useCases: UseCase[] = [
  { name: t("AI Customer Support", "Hỗ trợ khách hàng AI"), stack: "RAI GPT + Agent + Bot", roi: t("60–80% fewer tickets · CSAT +0.5", "Giảm 60–80% ticket · CSAT +0.5") },
  { name: t("Sales Lead Qualification", "Chấm điểm lead bán hàng"), stack: "RAI Agent + CDP", roi: t("Qualified leads +40% · velocity +30%", "Lead chuẩn +40% · tốc độ +30%") },
  { name: t("Content Production", "Sản xuất nội dung"), stack: "RAI GPT + Agent", roi: t("5–10× output · 70% lower cost", "Sản lượng 5–10× · chi phí ↓70%") },
  { name: t("Document Processing", "Xử lý tài liệu"), stack: "RAI GPT + Embed", roi: t("10× faster · 95%+ accuracy", "Nhanh 10× · chính xác 95%+") },
  { name: t("Personalization at Scale", "Cá nhân hóa quy mô lớn"), stack: "RAI CDP + Agent", roi: t("Conversion +25–40%", "Chuyển đổi +25–40%") },
  { name: t("Internal Knowledge Bot", "Trợ lý tri thức nội bộ"), stack: "RAI Bot + Embed + Data", roi: t("Productivity +20% · onboarding −50%", "Năng suất +20% · onboarding −50%") },
];

/* ----------------------------- Verticals -------------------------------- */
export type LabVertical = { name: T; caps: T };
export const labVerticals: LabVertical[] = [
  { name: t("Finance & Banking", "Tài chính - Ngân hàng"), caps: t("Risk scoring · KYC · fraud detection · regulatory reporting", "Risk scoring · KYC · phát hiện gian lận · báo cáo tuân thủ") },
  { name: t("Retail & E-commerce", "Bán lẻ - E-commerce"), caps: t("Recommendation · dynamic pricing · inventory forecasting", "Gợi ý · định giá động · dự báo tồn kho") },
  { name: t("Real Estate (PropTech)", "Bất động sản (PropTech)"), caps: t("Property matching · price prediction · contract automation", "Khớp BĐS · dự báo giá · tự động hợp đồng") },
  { name: t("Healthcare", "Y tế (HealthTech)"), caps: t("Clinical docs · scheduling · patient triage · medical Q&A", "Hồ sơ lâm sàng · lịch hẹn · phân loại bệnh nhân · hỏi đáp y tế") },
  { name: t("Education", "Giáo dục (EdTech)"), caps: t("AI tutor · adaptive learning · automated grading", "Gia sư AI · học thích ứng · chấm điểm tự động") },
  { name: t("Travel & Hospitality", "Du lịch - Khách sạn"), caps: t("Booking assistant · itinerary · dynamic pricing · review analysis", "Trợ lý đặt chỗ · lịch trình · định giá động · phân tích đánh giá") },
];

/* ----------------------------- Security --------------------------------- */
export const security = {
  items: [
    t("AES-256 at rest · TLS 1.3 in transit", "Mã hóa AES-256 at rest · TLS 1.3 in transit"),
    t("OAuth 2.0 · SAML SSO · mandatory MFA for admin", "OAuth 2.0 · SAML SSO · MFA bắt buộc cho admin"),
    t("Granular RBAC · immutable audit logs", "RBAC chi tiết · audit log bất biến"),
    t("24/7 SOC · MTTR <4h for P0 · pen-test every 6 months", "SOC 24/7 · MTTR <4h cho P0 · pen-test 6 tháng/lần"),
  ] as T[],
  certs: [
    { name: "SOC 2 Type II", status: t("Target Q4 2026", "Mục tiêu Q4 2026") },
    { name: "ISO 27001", status: t("Certification 2027", "Chứng nhận 2027") },
    { name: "Decree 13/2023", status: t("Fully compliant", "Tuân thủ đầy đủ") },
    { name: "GDPR", status: t("Aligned", "Phù hợp") },
  ],
};

export const labContact = {
  title: t("Run RAI LAB as your AI infrastructure.", "Vận hành RAI LAB như hạ tầng AI của bạn."),
  body: t("Talk to us about how RAI LAB can power your organization.", "Trao đổi về cách RAI LAB vận hành cho tổ chức của bạn."),
  email: "hello@railab.vn",
  cta: t("Contact RAI LAB", "Liên hệ RAI LAB"),
};
