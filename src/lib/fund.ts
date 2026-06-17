/**
 * RAI FUND — capital profile (/fund).
 * Content extracted from "5. RAI-FUND-Profile-v1.0.0.pdf" (RAI Holdings).
 * Bilingual EN/VI. Entity color = Steel Blue (--color-fund).
 */
import { t, type T } from "@/lib/i18n-core";

export const FUND = "var(--color-fund)";

export const fundHero = {
  docId: "RAI-ENT-FUND-01 // v1.0.0",
  eyebrow: t("RAI FUND · Capital", "RAI FUND · Vốn"),
  title: t("The capital engine for the next generation of solo founders.", "Cỗ máy vốn cho thế hệ Solo Founder tiếp theo."),
  subtitle: t(
    "A set of four thematic funds running in parallel, investing in AI-native ventures led by solo founders — backing them with capital, infrastructure, and network.",
    "Tổ hợp bốn quỹ chuyên đề vận hành song song, đầu tư vào các AI-native venture do Solo Founder dẫn dắt — đồng hành bằng vốn, hạ tầng và mạng lưới.",
  ),
  quote: t(
    "We believe the solo founder — with the right AI workforce and infrastructure — will be the dominant economic unit of the coming decade.",
    "Chúng tôi tin rằng nhà sáng lập đơn lẻ — với AI workforce và hạ tầng phù hợp — sẽ là đơn vị kinh tế chiếm ưu thế của thập kỷ tới.",
  ),
  ctaPrimary: t("For LPs & investors", "Dành cho LP & nhà đầu tư"),
  ctaSecondary: t("Solo founders apply", "Solo Founder ứng tuyển"),
};

export type FundMetric = { value: string; label: T };
export const fundMetrics: FundMetric[] = [
  { value: "$75M", label: t("AUM target 2028", "AUM mục tiêu 2028") },
  { value: "30+", label: t("Active portfolio", "Portfolio đang hoạt động") },
  { value: "37%", label: t("Net IRR target", "Net IRR mục tiêu") },
  { value: "4", label: t("Funds in parallel", "Quỹ song song") },
];

/* ----------------------------- Investment thesis ------------------------ */
export type Pillar = { n: string; title: T; body: T };
export const thesis: Pillar[] = [
  { n: "01", title: t("Invest in solo founders, not headcount", "Đầu tư vào Solo Founder, không vào headcount"), body: t("Each venture runs a lean team of ≤5 + an AI workforce. Burn under $80K/mo. Time-to-revenue under 6 months.", "Mỗi venture đội tinh gọn ≤5 người + AI workforce. Burn dưới $80K/tháng. Time-to-revenue dưới 6 tháng.") },
  { n: "02", title: t("Capital + infrastructure", "Capital + Infrastructure"), body: t("Each portfolio gets capital plus 24 months free RAI LAB & RAI ONE — about $300K–500K in infrastructure savings.", "Mỗi portfolio nhận vốn cùng 24 tháng miễn phí RAI LAB & RAI ONE — tương đương $300K–500K tiết kiệm hạ tầng.") },
  { n: "03", title: t("Operational partnership", "Đồng hành vận hành"), body: t("Each portfolio has an Operating Partner on a monthly cadence — go-to-market, hiring, next-round fundraising.", "Mỗi portfolio có một Operating Partner đồng hành hằng tháng — go-to-market, tuyển dụng, gọi vốn vòng sau.") },
  { n: "04", title: t("Concentration over diversification", "Concentration over diversification"), body: t("Max 12–15 deals per fund. Max 15% NAV per deal. Conviction-based, not spray-and-pray.", "Mỗi quỹ tối đa 12–15 deal. Tối đa 15% NAV cho một deal. Conviction-based, không spray-and-pray.") },
];

/* ----------------------------- 4 funds ---------------------------------- */
export type Fund = { code: string; name: string; size: string; stage: T; ticket: string; deals: string; hold: T; strategy: T };
export const funds: Fund[] = [
  { code: "01", name: "RAI Seed Fund", size: "$10M", stage: t("Pre-seed → Seed", "Pre-seed → Seed"), ticket: "$50K – $300K", deals: "30–40", hold: t("5–7 years", "5–7 năm"),
    strategy: t("Earliest entry — idea + founder. Fast 2–4 week diligence, SAFE/notes. Leads 60%, 1:1 follow-on reserve.", "Vào sớm nhất — ý tưởng + Founder. Diligence 2–4 tuần, SAFE/note. Lead 60%, reserve 1:1 cho follow-on.") },
  { code: "02", name: "RAI AI Fund", size: "$30M", stage: t("Series A → B", "Series A → B"), ticket: "$500K – $3M", deals: "10–15", hold: t("6–8 years", "6–8 năm"),
    strategy: t("Concentration into proven PMF (>$500K ARR). Lead position, board seat option, Series B support.", "Concentration vào winners đã có PMF (>$500K ARR). Lead bắt buộc, board seat option, hỗ trợ Series B.") },
  { code: "03", name: "RAI PropTech Fund", size: "$20M", stage: t("Seed → Series A", "Seed → Series A"), ticket: "$300K – $2M", deals: "8–12", hold: t("7–10 years", "7–10 năm"),
    strategy: t("Thematic deep-dive into real-estate tech — vertical SaaS, marketplace, property AI. Pre-built developer & broker network.", "Deep-dive vào real estate tech — vertical SaaS, marketplace, property AI. Mạng lưới developer & broker dựng sẵn.") },
  { code: "04", name: "RAI Venture Studio Fund", size: "$15M", stage: t("Studio-incubated", "Studio ấp ủ"), ticket: "$200K – $800K", deals: "15–20", hold: t("5–8 years", "5–8 năm"),
    strategy: t("Invests in ventures RAI itself incubates and recruits solo founders into. High equity (30–50%), deep ops for 18 months, spin-out at $1M+ ARR.", "Đầu tư vào venture do RAI ấp ủ & tuyển Solo Founder. Equity cao (30–50%), vận hành sâu 18 tháng, spin-out khi đạt $1M+ ARR.") },
];

/* ----------------------------- Criteria --------------------------------- */
export type CriteriaGroup = { group: T; items: { k: T; v: T }[] };
export const criteria: CriteriaGroup[] = [
  { group: t("Founder", "Founder"), items: [
    { k: t("Domain expertise", "Domain expertise"), v: t("≥3 years directly in the target industry", "≥3 năm trực tiếp trong ngành venture nhắm tới") },
    { k: t("Track record", "Track record"), v: t("Shipped a product or reached $500K+ revenue", "Đã ship sản phẩm hoặc đạt $500K+ doanh thu") },
    { k: t("AI fluency", "AI fluency"), v: t("Can command AI agents (no code needed)", "Có thể chỉ huy AI agents (không cần code)") },
    { k: t("Commitment", "Cam kết"), v: t("Full-time, ≥3 years, 4-year vesting", "Full-time, ≥3 năm, vesting 4 năm") },
  ]},
  { group: t("Market", "Thị trường"), items: [
    { k: t("TAM", "TAM"), v: t("≥$500M in VN or ≥$5B in SEA", "≥$500M tại VN hoặc ≥$5B khu vực ĐNÁ") },
    { k: t("Growth", "Tăng trưởng"), v: t("≥20% CAGR over the next 5 years", "≥20% CAGR trong 5 năm tới") },
    { k: t("AI gap", "Khoảng trống AI"), v: t("No dominant AI player yet", "Chưa có dominant AI player") },
    { k: t("Regulatory", "Pháp lý"), v: t("No major regulatory risk in 24 months", "Không có regulatory risk lớn trong 24 tháng") },
  ]},
  { group: t("Business model", "Mô hình kinh doanh"), items: [
    { k: t("Revenue", "Doanh thu"), v: t("Recurring (SaaS, subscription, transaction)", "Định kỳ (SaaS, subscription, transaction)") },
    { k: t("LTV / CAC", "LTV / CAC"), v: t("≥3 within 18 months", "≥3 đạt trong 18 tháng") },
    { k: t("Gross margin", "Biên gộp"), v: t("≥60% after RAI infrastructure", "≥60% sau chi phí hạ tầng RAI") },
    { k: t("Moat", "Moat"), v: t("Data, network effect, or distribution moat", "Data, network effect, hoặc distribution moat") },
  ]},
];

/* ----------------------------- Process ---------------------------------- */
export type Stage = { when: T; title: T; body: T; pass?: string };
export const process: Stage[] = [
  { when: t("Week 1", "Tuần 1"), title: t("Sourcing & initial screen", "Sourcing & sàng lọc"), body: t("Application or referral. 1-hour screen with an Associate.", "Ứng tuyển hoặc referral. Screen 1 giờ với Associate."), pass: "~30%" },
  { when: t("Week 2", "Tuần 2"), title: t("Partner meeting", "Gặp Partner"), body: t("60-min pitch with 2 Partners — model, founder, competition.", "Pitch 60 phút với 2 Partner — mô hình, founder, cạnh tranh."), pass: "~50%" },
  { when: t("Week 3–4", "Tuần 3–4"), title: t("Due diligence", "Due diligence"), body: t("Market validation, 5+ customer interviews, technical review via RAI LAB, references.", "Validate thị trường, phỏng vấn 5+ khách, technical review qua RAI LAB, reference."), pass: "~60%" },
  { when: t("Week 5", "Tuần 5"), title: t("Investment Committee", "Investment Committee"), body: t("Present to the 5-member IC. Needs ≥4/5 to approve.", "Trình bày trước IC 5 thành viên. Cần ≥4/5 đồng ý."), pass: "~70%" },
  { when: t("Week 6", "Tuần 6"), title: t("Term sheet", "Term sheet"), body: t("Negotiate terms — SAFE/note or priced round, pro-rata, board seat if lead.", "Đàm phán term — SAFE/note hoặc priced round, pro-rata, board seat nếu lead."), },
  { when: t("Week 7–8", "Tuần 7–8"), title: t("Closing", "Closing"), body: t("Legal docs, KYC, wire. Onboard into RAI (LAB & ONE), assign Operating Partner.", "Pháp lý, KYC, wire. Onboard vào RAI (LAB & ONE), assign Operating Partner."), },
];

/* ----------------------------- Founder value (comparison) --------------- */
export type CompareRow = { item: T; vc: string; rai: string };
export const founderCompare: CompareRow[] = [
  { item: t("Infrastructure setup (first 12mo)", "Chi phí hạ tầng (12T đầu)"), vc: "$300K–500K", rai: "$0" },
  { item: t("Time to MVP", "Time-to-MVP"), vc: "6–9 mo", rai: "4–8 wk" },
  { item: t("Time to first customer", "Time-to-first-customer"), vc: "9–12 mo", rai: "2–4 mo" },
  { item: t("Avg monthly burn", "Burn rate/tháng"), vc: "$200K–500K", rai: "$30K–80K" },
  { item: t("Post-investment support", "Hỗ trợ sau đầu tư"), vc: "Quarterly", rai: "Monthly + weekly" },
  { item: t("Customer pipeline", "Pipeline khách hàng"), vc: "Build from scratch", rai: "10K+ SME via RAI ONE" },
];

/* ----------------------------- Returns (4 streams) ---------------------- */
export type Stream = { code: string; name: T; pct: string; body: T };
export const streams: Stream[] = [
  { code: "01", name: t("Capital gain", "Capital gain"), pct: "~40%", body: t("Exit profits (IPO, M&A) of portfolio companies. Horizon 5–8 years.", "Lợi nhuận từ exit (IPO, M&A) của portfolio. Thu hồi 5–8 năm.") },
  { code: "02", name: t("Equity dividend", "Equity dividend"), pct: "~10%", body: t("Dividends from equity in profitable portfolio. From years 3–5.", "Cổ tức từ cổ phần tại portfolio đã có lãi. Từ năm 3–5.") },
  { code: "03", name: t("Revenue share", "Revenue share"), pct: "~35%", body: t("Infrastructure fees via RAI LAB & RAI ONE — recurring, even without an exit.", "Phí hạ tầng từ RAI LAB & RAI ONE — định kỳ, ngay cả khi không có exit.") },
  { code: "04", name: t("Ecosystem value", "Ecosystem value"), pct: "~15%", body: t("Growth in total ecosystem value over time — reflected in NAV.", "Tăng giá trị tổng hệ sinh thái theo thời gian — phản ánh trong NAV.") },
];

/* ----------------------------- LP terms --------------------------------- */
export type Term = { k: T; v: T };
export const lpTerms: Term[] = [
  { k: t("Management fee", "Management fee"), v: t("2% AUM/yr (5y commitment) · 1% after", "2% AUM/năm (5 năm) · 1% sau commitment") },
  { k: t("Carried interest", "Carried interest"), v: t("20% over an 8% IRR hurdle", "20% trên hurdle 8% IRR") },
  { k: t("Hurdle rate", "Hurdle rate"), v: t("8% IRR (preferred return)", "8% IRR (preferred return)") },
  { k: t("GP commitment", "GP commitment"), v: t("≥2% of fund capital", "≥2% vốn quỹ") },
  { k: t("Commitment period", "Commitment period"), v: t("5 years", "5 năm") },
  { k: t("Fund life", "Fund life"), v: t("8 years + 2-year extension", "8 năm + 2 năm gia hạn") },
  { k: t("LP reporting", "Báo cáo LP"), v: t("Quarterly NAV · annual audit · K-1", "NAV quý · audit năm · K-1") },
  { k: t("Co-investment", "Co-investment"), v: t("Rights for LPs committing ≥$3M", "Quyền cho LP commit ≥$3M") },
];

export const fundContact = {
  title: t("Partner with the capital engine.", "Hợp tác cùng cỗ máy vốn."),
  body: t("Whether you're an LP or a solo founder — let's talk.", "Dù bạn là LP hay Solo Founder — hãy trao đổi với chúng tôi."),
  email: "hello@raifund.vn",
  cta: t("Contact RAI FUND", "Liên hệ RAI FUND"),
};
