// RAI OS Workspace — Venture Builder domain model + mock orchestration.
// P1/P2: deterministic mock generators so the 8-agent pipeline runs end-to-end
// without a backend. Swap generateVenture() for real RAI LLMs calls later.
import { t, type T } from "@/lib/i18n-core";

export type VentureStatus = "draft" | "designing" | "simulating" | "experimenting" | "live" | "archived";

export type MarketSignal = { id: string; source: string; content: string; metadata?: string };
export type KnowledgeObject = { id: string; topic: string; insight: string; confidence: number };
export type Opportunity = { id: string; title: string; marketSize: string; demandScore: number; competitionScore: number; confidenceScore: number };
export type Blueprint = { customerSegment: string; valueProposition: string; pricing: string; channelStrategy: string[]; revenueModel: string };
export type Simulation = { revenuePotential: string; cac: string; ltv: string; conversionRate: string; breakEven: string };
export type Experiment = { id: string; hypothesis: string; budget: string; targetMetric: string; result: string; status: "planned" | "running" | "done" };
export type RevenueStage = { stage: string; count: number; value: string };
export type LearningRecord = { id: string; outcome: string; lessons: string };

export type Venture = {
  id: string;
  orgId: string;
  name: string;
  ideaPrompt: string;
  sector: string;
  region: string;
  status: VentureStatus;
  confidence: number;
  createdAt: number;
  signals: MarketSignal[];
  knowledge: KnowledgeObject[];
  opportunities: Opportunity[];
  blueprint: Blueprint;
  simulation: Simulation;
  experiments: Experiment[];
  revenue: RevenueStage[];
  learning: LearningRecord[];
};

// ---- 8 engines / agents ----------------------------------------------------
export type EngineKey = "observe" | "knowledge" | "opportunity" | "design" | "simulation" | "experiment" | "revenue" | "learning";
export type Engine = { key: EngineKey; label: T; desc: T; icon: string; solution: T };

export const engines: Engine[] = [
  { key: "observe", label: t("Observe", "Quan sát"), desc: t("Scan market signals", "Quét tín hiệu thị trường"), icon: "search", solution: t("Big Data", "Big Data") },
  { key: "knowledge", label: t("Knowledge", "Tri thức"), desc: t("Synthesize insights", "Tổng hợp hiểu biết"), icon: "glasses", solution: t("RAI LLMs", "RAI LLMs") },
  { key: "opportunity", label: t("Opportunity", "Cơ hội"), desc: t("Score & rank opportunities", "Chấm điểm & xếp hạng"), icon: "target", solution: t("RAI LLMs + Big Data", "RAI LLMs + Big Data") },
  { key: "design", label: t("Business Design", "Thiết kế KD"), desc: t("Build the blueprint", "Dựng mô hình kinh doanh"), icon: "layout", solution: t("Marketplace", "Marketplace") },
  { key: "simulation", label: t("Simulation", "Mô phỏng"), desc: t("Model the economics", "Mô phỏng tài chính"), icon: "trending-up", solution: t("RAI LLMs", "RAI LLMs") },
  { key: "experiment", label: t("Experiment", "Thử nghiệm"), desc: t("Generate & run tests", "Sinh & chạy thử nghiệm"), icon: "bolt", solution: t("Code + MCP", "Code + MCP") },
  { key: "revenue", label: t("Revenue", "Doanh thu"), desc: t("Stand up the pipeline", "Dựng pipeline doanh thu"), icon: "coins", solution: t("RAI Apps + Platform", "RAI Apps + Platform") },
  { key: "learning", label: t("Learning", "Học hỏi"), desc: t("Optimize & iterate", "Tối ưu & lặp lại"), icon: "robot", solution: t("RAI LLMs + Langfuse", "RAI LLMs + Langfuse") },
];

export const sampleIdeas: T[] = [
  t("A brokerage for social-housing shophouses in Thanh Hoa", "Sàn môi giới shophouse nhà ở xã hội tại Thanh Hóa"),
  t("An AI tutoring service for high-school students in Vietnam", "Dịch vụ gia sư AI cho học sinh THPT Việt Nam"),
  t("A B2B marketplace for construction materials", "Sàn B2B vật liệu xây dựng"),
  t("A SaaS that automates VAT e-invoicing for SMEs", "SaaS tự động hóa đơn VAT điện tử cho SME"),
];

// ---- deterministic mock generation ----------------------------------------
function hash(s: string): number { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; }
function pick<X>(arr: X[], seed: number): X { return arr[Math.abs(seed) % arr.length]; }

const SECTORS = ["Real estate", "Education", "Construction", "Fintech", "Retail", "Logistics", "Healthcare", "Technology"];
const REGIONS = ["Hà Nội", "TP. Hồ Chí Minh", "Thanh Hóa", "Đà Nẵng", "Bình Dương"];

function deriveSector(idea: string): string {
  const k = idea.toLowerCase();
  if (/bất động sản|shophouse|nhà ở|real estate|property/.test(k)) return "Real estate";
  if (/gia sư|học|edu|tutor|trường/.test(k)) return "Education";
  if (/xây dựng|vật liệu|construct/.test(k)) return "Construction";
  if (/hóa đơn|vat|fintech|thanh toán|tài chính/.test(k)) return "Fintech";
  if (/bán lẻ|retail|shop/.test(k)) return "Retail";
  return pick(SECTORS, hash(idea));
}
function deriveRegion(idea: string): string {
  for (const r of REGIONS) if (idea.toLowerCase().includes(r.toLowerCase())) return r;
  return pick(REGIONS, hash(idea) >> 3);
}

function titleCaseFromIdea(idea: string): string {
  const words = idea.trim().split(/\s+/).slice(0, 4).join(" ");
  return words.length ? `RAI ${words.charAt(0).toUpperCase()}${words.slice(1)}` : "RAI Venture";
}

/** Build the full mock venture graph for an idea (illustrative figures, clearly estimates). */
export function generateVenture(orgId: string, idea: string, id: string, now: number): Venture {
  const seed = hash(idea);
  const sector = deriveSector(idea);
  const region = deriveRegion(idea);
  const demand = 55 + (seed % 40);          // 55..94
  const competition = 30 + ((seed >> 2) % 50);
  const confidence = Math.max(40, Math.min(92, Math.round((demand + (100 - competition)) / 2)));

  return {
    id, orgId, name: titleCaseFromIdea(idea), ideaPrompt: idea, sector, region,
    status: "designing", confidence, createdAt: now,
    signals: [
      { id: id + "-s1", source: "Big Data · raicrm.vn", content: `~${(2 + (seed % 9))}00+ doanh nghiệp cùng ngành ${sector} tại ${region}`, metadata: "ước tính" },
      { id: id + "-s2", source: "Web/News · MCP", content: `Nhu cầu ${sector.toLowerCase()} tăng theo tín hiệu tìm kiếm & tin tức`, metadata: "minh họa" },
      { id: id + "-s3", source: "Big Data · raicrm.vn", content: `Phân mảnh cao, ít người chơi số hóa toàn trình`, metadata: "ước tính" },
    ],
    knowledge: [
      { id: id + "-k1", topic: t("Demand", "Nhu cầu").vi, insight: `Khách mục tiêu tại ${region} ưu tiên tốc độ & minh bạch.`, confidence: demand },
      { id: id + "-k2", topic: t("Competition", "Cạnh tranh").vi, insight: `Đối thủ chủ yếu thủ công; cơ hội cho lớp AI-native.`, confidence: 100 - competition },
    ],
    opportunities: [
      { id: id + "-o1", title: `${sector} AI-native cho ${region}`, marketSize: "— (cần dữ liệu)", demandScore: demand, competitionScore: competition, confidenceScore: confidence },
      { id: id + "-o2", title: `Dịch vụ kèm dữ liệu cho phân khúc ngách`, marketSize: "— (cần dữ liệu)", demandScore: demand - 8, competitionScore: competition - 6, confidenceScore: confidence - 7 },
    ],
    blueprint: {
      customerSegment: `Doanh nghiệp/cá nhân ngành ${sector} tại ${region}`,
      valueProposition: `Nền tảng AI-native rút ngắn quy trình ${sector.toLowerCase()} — nhanh, minh bạch, có dữ liệu.`,
      pricing: "Freemium + gói tháng (VND) — số cụ thể chốt sau",
      channelStrategy: ["SEO/nội dung", "Đối tác ngành", "Quảng cáo hiệu suất", "Giới thiệu"],
      revenueModel: "Subscription + phí giao dịch",
    },
    simulation: {
      revenuePotential: "— (ước lượng sau khi có giá)", cac: "— ", ltv: "— ", conversionRate: `${2 + (seed % 5)}%`, breakEven: `${8 + (seed % 10)} tháng`,
    },
    experiments: [
      { id: id + "-e1", hypothesis: "Landing page + ưu đãi sớm thu được lead chất lượng", budget: "5.000.000₫", targetMetric: "≥ 100 lead / tháng", result: "—", status: "planned" },
      { id: id + "-e2", hypothesis: "Chatbot tư vấn tăng tỉ lệ chuyển đổi", budget: "3.000.000₫", targetMetric: "+20% conversion", result: "—", status: "planned" },
    ],
    revenue: [
      { stage: "Lead", count: 0, value: "—" }, { stage: "Prospect", count: 0, value: "—" },
      { stage: "Appointment", count: 0, value: "—" }, { stage: "Visit", count: 0, value: "—" },
      { stage: "Booking", count: 0, value: "—" }, { stage: "Contract", count: 0, value: "—" },
      { stage: "Revenue", count: 0, value: "—" },
    ],
    learning: [
      { id: id + "-l1", outcome: "Khởi tạo", lessons: "Chạy 2 thử nghiệm đầu để xác thực nhu cầu trước khi mở rộng." },
    ],
  };
}
