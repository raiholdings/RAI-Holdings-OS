/**
 * RAI Holdings OS — console data layer (VOS positioning, bilingual).
 * Typed mock data. Replace with real queries (Postgres/Supabase/Prisma) —
 * the component layer only depends on the exported types.
 */
import { t, type T } from "@/lib/i18n-core";

export type Trend = { delta: number; positive: boolean };
export type Tone = "holdings" | "fund" | "lab" | "one" | "ok" | "warn";

export type Kpi = {
  key: string;
  label: T;
  value: string;
  sub?: T;
  trend?: Trend;
  tone?: Tone;
};

/* ----------------------------- Overview --------------------------------- */
export const overviewKpis: Kpi[] = [
  { key: "ventures", label: t("Active ventures", "Doanh nghiệp đang chạy"), value: "12", sub: t("live across 8 verticals", "đang chạy trên 8 ngành"), trend: { delta: 4, positive: true }, tone: "holdings" },
  { key: "burn", label: t("Avg burn reduction", "Giảm vốn đốt TB"), value: "70%", sub: t("vs. industry baseline", "so với mặt bằng ngành"), trend: { delta: 6, positive: true }, tone: "ok" },
  { key: "ttm", label: t("Time to market", "Ra thị trường"), value: "3–5×", sub: t("faster, Day-1 ready", "nhanh hơn, sẵn sàng Ngày 1"), tone: "lab" },
  { key: "auto", label: t("Ops automated", "Vận hành tự động"), value: "80%+", sub: t("AI workforce coverage", "lực lượng AI phụ trách"), trend: { delta: 9, positive: true }, tone: "one" },
];

/* ----------------------------- Ventures (BIAB) -------------------------- */
export type VentureStatus = "live" | "deploying" | "onboarding" | "pipeline";
export const statusLabel: Record<VentureStatus, T> = {
  live: t("Live", "Đang chạy"),
  deploying: t("Deploying", "Đang triển khai"),
  onboarding: t("Onboarding", "Onboarding"),
  pipeline: t("Pipeline", "Tiềm năng"),
};
export const statusTone: Record<VentureStatus, Tone> = {
  live: "ok",
  deploying: "lab",
  onboarding: "holdings",
  pipeline: "warn",
};

export type Venture = {
  id: string;
  name: string;
  vertical: string; // BIAB code
  stack: string; // layers in use, e.g. "L1–L4"
  status: VentureStatus;
  day: number; // 0..365 on the OS
  burn: number; // % burn reduction
  arr: number; // $K ARR
};

export const ventures: Venture[] = [
  { id: "VEN-001", name: "Mekong Kitchen", vertical: "F&B", stack: "L1–L5", status: "live", day: 248, burn: 72, arr: 1840 },
  { id: "VEN-002", name: "Saigon Retail Co", vertical: "RTL", stack: "L1–L5", status: "live", day: 201, burn: 64, arr: 1320 },
  { id: "VEN-003", name: "RAI Property One", vertical: "RE", stack: "L1–L6", status: "live", day: 168, burn: 58, arr: 2110 },
  { id: "VEN-004", name: "Northwind Agency", vertical: "AGY", stack: "L1–L4", status: "live", day: 142, burn: 61, arr: 690 },
  { id: "VEN-005", name: "EduSphere", vertical: "EDU", stack: "L1–L4", status: "deploying", day: 64, burn: 41, arr: 380 },
  { id: "VEN-006", name: "CareGrid Health", vertical: "HLT", stack: "L1–L6", status: "deploying", day: 38, burn: 33, arr: 210 },
  { id: "VEN-007", name: "FreightOS Logistics", vertical: "LOG", stack: "L2–L5", status: "onboarding", day: 14, burn: 0, arr: 0 },
  { id: "VEN-008", name: "Hanoi Makerworks", vertical: "MFG", stack: "L3–L6", status: "onboarding", day: 8, burn: 0, arr: 0 },
  { id: "VEN-009", name: "Coastline F&B", vertical: "F&B", stack: "L1–L5", status: "pipeline", day: 0, burn: 0, arr: 0 },
  { id: "VEN-010", name: "Delta Retail Group", vertical: "RTL", stack: "L1–L5", status: "pipeline", day: 0, burn: 0, arr: 0 },
];

/* ----------------------------- Venture funnel --------------------------- */
export type FunnelStage = { stage: T; count: number };
export const ventureFunnel: FunnelStage[] = [
  { stage: t("Sourced", "Tiếp cận"), count: 64 },
  { stage: t("Qualified", "Đánh giá"), count: 31 },
  { stage: t("Funded", "Cấp vốn"), count: 18 },
  { stage: t("Deploying", "Triển khai"), count: 6 },
  { stage: t("Live", "Đang chạy"), count: 12 },
];

/* ----------------------------- Deployment health ------------------------ */
export type Deployment = { venture: string; layer: T; status: VentureStatus; health: number };
export const deployments: Deployment[] = [
  { venture: "Mekong Kitchen", layer: t("Full stack + AI workforce", "Toàn stack + lực lượng AI"), status: "live", health: 99 },
  { venture: "Saigon Retail Co", layer: t("Commerce + Enterprise data", "Thương mại + Dữ liệu DN"), status: "live", health: 98 },
  { venture: "RAI Property One", layer: t("Business + Enterprise", "Doanh nghiệp + DN lớn"), status: "live", health: 97 },
  { venture: "EduSphere", layer: t("Venture + AI workforce", "Khởi nghiệp + lực lượng AI"), status: "deploying", health: 72 },
  { venture: "CareGrid Health", layer: t("Provisioning instance", "Đang khởi tạo instance"), status: "deploying", health: 54 },
];

/* ----------------------------- Metrics ---------------------------------- */
export type MetricRow = { tier: T; metric: T; value: string; meaning: T };
export const metricsTower: MetricRow[] = [
  { tier: t("North Star", "Bắc Đẩu"), metric: t("Active ventures on the OS (cumulative)", "Doanh nghiệp chạy trên OS (lũy kế)"), value: "12 / 50", meaning: t("Ultimate measure — 2028 target", "Thước đo tối thượng — mục tiêu 2028") },
  { tier: t("Impact", "Tác động"), metric: t("Burn reduction · Ops automated", "Giảm vốn đốt · Tự động hóa"), value: "70% · 80%+", meaning: t("Is the OS delivering the proof?", "OS có tạo ra giá trị thật không") },
  { tier: t("Growth", "Tăng trưởng"), metric: t("New ventures / quarter · CAC", "Doanh nghiệp mới / quý · CAC"), value: "4 · ↓18%", meaning: t("Speed of the deployment engine", "Tốc độ cỗ máy triển khai") },
  { tier: t("Finance", "Tài chính"), metric: t("Cash ARR · Net IRR target", "ARR tiền mặt · Net IRR mục tiêu"), value: "$14.9M · 37.4%", meaning: t("Sustainability of the model", "Tính bền vững của mô hình") },
  { tier: t("RAI LAB", "RAI LAB"), metric: t("Products shipped · build-once reuse", "Sản phẩm · tái dùng build-once"), value: "35 · 92%", meaning: t("Factory leverage", "Đòn bẩy nhà máy") },
  { tier: t("RAI ONE", "RAI ONE"), metric: t("Avg deploy time / venture", "Thời gian triển khai / DN"), value: "26d ↓24%", meaning: t("Repeatability & efficiency", "Khả năng lặp lại & hiệu quả") },
];

export type Slice = { label: T; value: number; tone: string };
export const revenueByEntity: Slice[] = [
  { label: t("RAI ONE (commerce)", "RAI ONE (thương mại)"), value: 7.4, tone: "var(--color-one)" },
  { label: t("RAI LAB (technology)", "RAI LAB (công nghệ)"), value: 4.8, tone: "var(--color-lab)" },
  { label: t("RAI FUND (capital)", "RAI FUND (vốn)"), value: 2.7, tone: "var(--color-fund)" },
];

export const ventureTrend: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
export const trendLabels: string[] = ["Q1·26", "", "", "Q2", "", "", "Q3", "", "", "Q4", "", "Q1·27"];

/* ----------------------------- Capital (FUND) --------------------------- */
export const capitalKpis: Kpi[] = [
  { key: "aum", label: t("Capital deployed", "Vốn đã giải ngân"), value: "$28.5M", sub: t("across 12 ventures", "qua 12 doanh nghiệp"), tone: "fund" },
  { key: "irr", label: t("Target Net IRR", "Net IRR mục tiêu"), value: "37.4%", sub: t("portfolio model", "mô hình danh mục"), tone: "ok" },
  { key: "arr", label: t("Cash ARR — 2028 target", "ARR tiền mặt — mục tiêu 2028"), value: "$93M", sub: t("current $14.9M", "hiện tại $14.9M"), tone: "holdings" },
  { key: "follow", label: t("Follow-on ready", "Sẵn sàng rót thêm"), value: "6", sub: t("ventures qualified", "doanh nghiệp đạt chuẩn"), tone: "warn" },
];

/* ----------------------------- Activity --------------------------------- */
export type Activity = { when: T; text: T; tone?: Tone };
export const activity: Activity[] = [
  { when: t("Today", "Hôm nay"), text: t("Mekong Kitchen crossed $1.8M ARR — 72% burn reduction sustained.", "Mekong Kitchen vượt $1.8M ARR — duy trì giảm 72% vốn đốt."), tone: "ok" },
  { when: t("Yesterday", "Hôm qua"), text: t("CareGrid Health entered deploy phase on the L1–L6 stack.", "CareGrid Health vào pha triển khai trên stack L1–L6."), tone: "lab" },
  { when: t("2 days ago", "2 ngày trước"), text: t("RAI FUND committed follow-on capital to RAI Property One.", "RAI FUND cam kết rót thêm vốn cho RAI Property One."), tone: "fund" },
  { when: t("This week", "Tuần này"), text: t("RAI LAB shipped RAI Agent Enterprise to the product stack.", "RAI LAB phát hành RAI Agent Enterprise vào tầng sản phẩm."), tone: "holdings" },
  { when: t("This week", "Tuần này"), text: t("Two new ventures sourced in F&B and Retail verticals.", "Hai doanh nghiệp mới tiếp cận ở ngành F&B và Bán lẻ."), tone: "warn" },
];
