/**
 * RAI Pricing — AI editing pipeline (server-only).
 *
 * Proposes pricing-page updates for the review queue. NEVER publishes and NEVER
 * fabricates a price: guardrails block any number not traceable to system data,
 * and a price change always goes through review + a new version (SPEC §6, §9).
 *
 * Real generation uses the Anthropic Messages API (`claude-sonnet-4-6`) when
 * ANTHROPIC_API_KEY is set; otherwise a deterministic, system-data-aware
 * template keeps the pipeline demonstrable offline.
 */
import { systemMetricValue } from "@/lib/enterprise";
import { getPlan, getPricingPage } from "@/lib/pricing";

type LT = { en: string; vi: string };
export type DraftSuggestion = {
  target: "feature" | "plan";
  planKey: string;
  origin: "ai";
  proposedData: { title: LT; description: LT; valueLabel?: LT };
  rationale: string;
};
type SystemData = { appsLive: string; reposLive: string; listings: string };

function buildSystemData(): SystemData {
  return { appsLive: systemMetricValue("apps.count"), reposLive: systemMetricValue("code.repos.live"), listings: systemMetricValue("marketplace.listings") };
}

/** Allowed numeric tokens = those in system data; block all other numbers (esp. invented prices). */
function guardrailOk(proposed: unknown, sys: SystemData): { ok: boolean; reason?: string } {
  const allowed = new Set(Object.values(sys).flatMap((v) => v.match(/\d+/g) ?? []));
  const nums = JSON.stringify(proposed).match(/\d{2,}/g) ?? [];
  const bad = nums.find((n) => !allowed.has(n));
  if (bad) return { ok: false, reason: `Number "${bad}" has no traceable data source — blocked (no fabricated prices).` };
  return { ok: true };
}

function templateDrafts(planKey: string, sys: SystemData): DraftSuggestion[] {
  return [
    {
      target: "feature", planKey, origin: "ai",
      proposedData: {
        title: { en: "Live platform footprint", vi: "Quy mô nền tảng hiện tại" },
        description: { en: `Includes access to ${sys.appsLive} AI apps and ${sys.reposLive} live deployment slots on RAI OS.`, vi: `Bao gồm quyền dùng ${sys.appsLive} app AI và ${sys.reposLive} chỗ triển khai đang chạy trên RAI OS.` },
      },
      rationale: `Adds a feature line backed by live system data (apps=${sys.appsLive}, deploys=${sys.reposLive}). No price invented.`,
    },
    {
      target: "feature", planKey, origin: "ai",
      proposedData: {
        title: { en: "Marketplace distribution", vi: "Phân phối qua marketplace" },
        description: { en: `Distribute through the marketplace alongside ${sys.listings} existing listings.`, vi: `Phân phối qua marketplace cùng ${sys.listings} listing hiện có.` },
      },
      rationale: `Normalized a distribution feature referencing the live listing count (${sys.listings}).`,
    },
  ];
}

async function anthropicDrafts(planKey: string, sys: SystemData): Promise<DraftSuggestion[] | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const plan = getPlan(planKey);
  if (!apiKey || !plan) return null;
  const system =
    "Bạn là biên tập trang giá của RAI OS. Giữ brand + locked vocabulary, giá bằng VND. " +
    "CHỈ dùng dữ liệu trong systemData, KHÔNG bịa số/giá. " +
    'Trả JSON: {"title":{"en","vi"},"description":{"en","vi"}} cho một featureItem, không kèm chữ ngoài JSON.';
  const payload = { plan: { key: plan.key, name: plan.name, kind: plan.kind }, systemData: sys };
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 1500, system, messages: [{ role: "user", content: JSON.stringify(payload) }] }),
    });
    if (!res.ok) return null;
    const json = await res.json();
    const parsed = JSON.parse(json?.content?.[0]?.text ?? "") as { title: LT; description: LT };
    if (!parsed?.title || !parsed?.description) return null;
    return [{ target: "feature", planKey, origin: "ai", proposedData: parsed, rationale: "Drafted by claude-sonnet-4-6 from plan + system data." }];
  } catch {
    return null;
  }
}

export async function runDraftJob(planKey?: string): Promise<{ drafts: DraftSuggestion[]; source: "anthropic" | "template"; blocked: string[] }> {
  const key = planKey ?? getPricingPage().plans.find((p) => p.recommended)?.key ?? getPricingPage().plans[0]?.key;
  if (!key) return { drafts: [], source: "template", blocked: [] };
  const sys = buildSystemData();
  const ai = await anthropicDrafts(key, sys);
  const source: "anthropic" | "template" = ai ? "anthropic" : "template";
  const raw = ai ?? templateDrafts(key, sys);
  const drafts: DraftSuggestion[] = [];
  const blocked: string[] = [];
  for (const d of raw) {
    const g = guardrailOk(d.proposedData, sys);
    if (g.ok) drafts.push(d); else blocked.push(g.reason!);
  }
  return { drafts, source, blocked };
}
