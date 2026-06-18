// Venture Builder orchestration — server-side. Each engine = one LLM call with
// structured JSON output; output of earlier steps feeds later ones.
// Provider order (all read at request time): RAI LLMs gateway → Anthropic direct
// → deterministic mock (generateVenture) so the pipeline always completes.
import {
  generateVenture, type EngineKey, type Venture,
} from "@/lib/workspace";

export type StepContext = {
  sector?: string; region?: string;
  opportunity?: string; valueProposition?: string;
};

type LLMResult = string | null;

/** Call the RAI LLMs gateway (OpenAI-compatible) if configured. */
async function viaGateway(system: string, user: string): Promise<LLMResult> {
  const base = (process.env.RAI_LLMS_BASE || "").replace(/\/$/, "");
  const key = process.env.RAI_LLMS_API_KEY || "";
  if (!base || !key) return null;
  try {
    const res = await fetch(`${base}/chat/completions`, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: process.env.RAI_LLMS_MODEL || "anthropic/claude-sonnet-4.6",
        messages: [{ role: "system", content: system }, { role: "user", content: user }],
        response_format: { type: "json_object" },
        provider: { sort: "price", allow_fallbacks: true },
      }),
      signal: AbortSignal.timeout(45_000),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.choices?.[0]?.message?.content ?? null;
  } catch { return null; }
}

/** Call Anthropic Messages API directly if a key is present. */
async function viaAnthropic(system: string, user: string): Promise<LLMResult> {
  const key = process.env.ANTHROPIC_API_KEY || "";
  if (!key) return null;
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1500,
        system: system + "\nReturn ONLY valid minified JSON, no prose, no markdown fences.",
        messages: [{ role: "user", content: user }],
      }),
      signal: AbortSignal.timeout(45_000),
    });
    if (!res.ok) return null;
    const json = await res.json();
    const text = Array.isArray(json.content) ? json.content.map((b: { text?: string }) => b.text ?? "").join("") : "";
    return text || null;
  } catch { return null; }
}

function parseJSON<T>(raw: LLMResult): T | null {
  if (!raw) return null;
  const m = raw.match(/\{[\s\S]*\}/);
  if (!m) return null;
  try { return JSON.parse(m[0]) as T; } catch { return null; }
}

async function llmJSON<T>(system: string, user: string): Promise<T | null> {
  return parseJSON<T>((await viaGateway(system, user)) ?? (await viaAnthropic(system, user)));
}

export function llmConfigured(): boolean {
  return !!(process.env.RAI_LLMS_API_KEY && process.env.RAI_LLMS_BASE) || !!process.env.ANTHROPIC_API_KEY;
}

const SYS = "Bạn là một AI venture builder của RAI OS. Trả lời bằng tiếng Việt, súc tích, thực tế cho thị trường Việt Nam. Tuyệt đối KHÔNG bịa số liệu cụ thể (vốn, doanh thu, thị phần) — nếu không có cơ sở thì để '—' hoặc ghi 'ước tính'. Chỉ trả JSON đúng schema yêu cầu.";

/**
 * Run one engine. Returns the structured slice for that engine. Falls back to the
 * deterministic mock for any field the LLM doesn't (or can't) provide.
 */
export async function runEngine(engine: EngineKey, idea: string, ctx: StepContext): Promise<{ data: unknown; ctx: StepContext; source: "llm" | "mock" }> {
  const mock: Venture = generateVenture("org", idea, "tmp", 1_770_000_000);
  const ctxLine = `Ý tưởng: "${idea}". Bối cảnh đã có: ${JSON.stringify(ctx)}.`;

  switch (engine) {
    case "observe": {
      const r = await llmJSON<{ sector: string; region: string; signals: { source: string; content: string }[] }>(
        SYS, `${ctxLine}\nXác định lĩnh vực (sector) + khu vực (region) và 3 tín hiệu thị trường (signals: source, content). JSON: {"sector","region","signals":[{"source","content"}]}.`,
      );
      const sector = r?.sector || mock.sector;
      const region = r?.region || mock.region;
      const signals = (r?.signals?.length ? r.signals : mock.signals).map((s, i) => ({ id: `s${i}`, source: s.source, content: s.content }));
      return { data: signals, ctx: { ...ctx, sector, region }, source: r ? "llm" : "mock" };
    }
    case "knowledge": {
      const r = await llmJSON<{ knowledge: { topic: string; insight: string; confidence: number }[] }>(
        SYS, `${ctxLine}\nTổng hợp 2-3 hiểu biết then chốt (knowledge: topic, insight, confidence 0-100). JSON: {"knowledge":[{"topic","insight","confidence"}]}.`,
      );
      const k = (r?.knowledge?.length ? r.knowledge : mock.knowledge).map((x, i) => ({ id: `k${i}`, topic: x.topic, insight: x.insight, confidence: Number(x.confidence) || 70 }));
      return { data: k, ctx, source: r ? "llm" : "mock" };
    }
    case "opportunity": {
      const r = await llmJSON<{ opportunities: { title: string; marketSize: string; demandScore: number; competitionScore: number; confidenceScore: number }[] }>(
        SYS, `${ctxLine}\nĐề xuất & chấm điểm 2 cơ hội (demandScore/competitionScore/confidenceScore 0-100; marketSize có thể '—'). JSON: {"opportunities":[{"title","marketSize","demandScore","competitionScore","confidenceScore"}]}.`,
      );
      const o = (r?.opportunities?.length ? r.opportunities : mock.opportunities).map((x, i) => ({ id: `o${i}`, title: x.title, marketSize: x.marketSize || "—", demandScore: Number(x.demandScore) || 60, competitionScore: Number(x.competitionScore) || 50, confidenceScore: Number(x.confidenceScore) || 60 }));
      return { data: o, ctx: { ...ctx, opportunity: o[0]?.title }, source: r ? "llm" : "mock" };
    }
    case "design": {
      const r = await llmJSON<{ customerSegment: string; valueProposition: string; pricing: string; channelStrategy: string[]; revenueModel: string }>(
        SYS, `${ctxLine}\nThiết kế mô hình kinh doanh (blueprint). JSON: {"customerSegment","valueProposition","pricing","channelStrategy":[...],"revenueModel"}.`,
      );
      const b = r ?? mock.blueprint;
      return { data: b, ctx: { ...ctx, valueProposition: b.valueProposition }, source: r ? "llm" : "mock" };
    }
    case "simulation": {
      const r = await llmJSON<{ revenuePotential: string; cac: string; ltv: string; conversionRate: string; breakEven: string }>(
        SYS, `${ctxLine}\nMô phỏng kinh tế (để '—' nếu chưa đủ cơ sở). JSON: {"revenuePotential","cac","ltv","conversionRate","breakEven"}.`,
      );
      return { data: r ?? mock.simulation, ctx, source: r ? "llm" : "mock" };
    }
    case "experiment": {
      const r = await llmJSON<{ experiments: { hypothesis: string; budget: string; targetMetric: string }[] }>(
        SYS, `${ctxLine}\nĐề xuất 2 thử nghiệm xác thực nhu cầu (budget VND). JSON: {"experiments":[{"hypothesis","budget","targetMetric"}]}.`,
      );
      const e = (r?.experiments?.length ? r.experiments : mock.experiments).map((x, i) => ({ id: `e${i}`, hypothesis: x.hypothesis, budget: x.budget, targetMetric: x.targetMetric, result: "—", status: "planned" as const }));
      return { data: e, ctx, source: r ? "llm" : "mock" };
    }
    case "revenue":
      // Pipeline stages are structural — keep the deterministic 7-stage funnel.
      return { data: mock.revenue, ctx, source: "mock" };
    case "learning": {
      const r = await llmJSON<{ learning: { outcome: string; lessons: string }[] }>(
        SYS, `${ctxLine}\n1-2 ghi chú học hỏi / bước tiếp theo. JSON: {"learning":[{"outcome","lessons"}]}.`,
      );
      const l = (r?.learning?.length ? r.learning : mock.learning).map((x, i) => ({ id: `l${i}`, outcome: x.outcome, lessons: x.lessons }));
      return { data: l, ctx, source: r ? "llm" : "mock" };
    }
  }
}
