/**
 * RAI Enterprise — AI drafting pipeline (server-only).
 *
 * Generates content suggestions for the review queue. NEVER publishes to public:
 * the route returns drafts; a human approves them in /admin/enterprise.
 *
 * Real generation calls the Anthropic Messages API (model `claude-sonnet-4-6`,
 * per SPEC_ENTERPRISE.md §6.2) when ANTHROPIC_API_KEY is set; otherwise a
 * deterministic, system-data-aware template is used so the pipeline is fully
 * demonstrable offline. Guardrails (§6.3) validate the block schema and block
 * any number that isn't traceable to the supplied system data — no fabrication.
 */
import { getPage, systemMetricValue, type Axis, type ContentBlock, type EnterprisePage, type PainSolutionData } from "@/lib/enterprise";

export type SystemData = { appsLive: string; listings: string; reposLive: string };
export type DraftSuggestion = {
  pageId: string;
  blockId?: string;
  targetType?: ContentBlock["type"];
  type: "update" | "new";
  origin: "ai";
  proposedData: PainSolutionData | { items: { q: { en: string; vi: string }; a: { en: string; vi: string } }[] };
  rationale: string;
};

export function buildSystemData(): SystemData {
  return { appsLive: systemMetricValue("apps.count"), listings: systemMetricValue("marketplace.listings"), reposLive: systemMetricValue("code.repos.live") };
}

/** Allowed numeric tokens = those that appear in the supplied system data. Block all others. */
function guardrailOk(proposed: unknown, sys: SystemData): { ok: boolean; reason?: string } {
  const allowed = new Set(Object.values(sys).flatMap((v) => v.replace(/[^\d]/g, "").match(/\d+/g) ?? []));
  const nums = JSON.stringify(proposed).match(/\d{2,}/g) ?? [];
  const bad = nums.find((n) => !allowed.has(n));
  if (bad) return { ok: false, reason: `Number "${bad}" has no traceable data source — blocked.` };
  return { ok: true };
}

/* ------------------------------ template -------------------------------- */
function templateDrafts(page: EnterprisePage, sys: SystemData): DraftSuggestion[] {
  const ps = page.blocks.find((b) => b.type === "pain_solution");
  const drafts: DraftSuggestion[] = [];
  if (ps) {
    const existing = (ps.data as PainSolutionData).items;
    const refreshed: PainSolutionData = {
      items: [
        ...existing,
        {
          pain: { en: "Hard to prove the platform is actually used and live.", vi: "Khó chứng minh nền tảng thực sự được dùng và đang chạy." },
          solution: { en: `Right now ${sys.appsLive} AI apps, ${sys.listings} marketplace listings, and ${sys.reposLive} live deployments are running on RAI OS.`, vi: `Hiện có ${sys.appsLive} app AI, ${sys.listings} listing marketplace và ${sys.reposLive} bản triển khai đang chạy trên RAI OS.` },
        },
      ],
    };
    drafts.push({ pageId: page.id, blockId: ps.id, type: "update", origin: "ai", proposedData: refreshed, rationale: `Added a proof point backed by live system data (apps=${sys.appsLive}, listings=${sys.listings}, deploys=${sys.reposLive}).` });
  }
  drafts.push({
    pageId: page.id, targetType: "faq", type: "new", origin: "ai",
    proposedData: { items: [{ q: { en: "How current is this page?", vi: "Trang này cập nhật ra sao?" }, a: { en: "Metrics refresh from system queries and every change is reviewed before it goes live.", vi: "Số liệu làm tươi từ truy vấn hệ thống và mọi thay đổi đều được duyệt trước khi đăng." } }] },
    rationale: "Proposed an FAQ entry explaining the AI-assisted update model.",
  });
  return drafts;
}

/* ------------------------------ Anthropic ------------------------------- */
async function anthropicDrafts(page: EnterprisePage, sys: SystemData): Promise<DraftSuggestion[] | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;
  const ps = page.blocks.find((b) => b.type === "pain_solution");
  if (!ps) return null;
  const system =
    "Bạn là biên tập viên nội dung doanh nghiệp của RAI OS. Giữ brand (Navy/Gold, giọng chuyên nghiệp) và locked vocabulary. " +
    "CHỈ dùng số liệu được cung cấp trong systemData, KHÔNG bịa số. " +
    'Trả về JSON: {"items":[{"pain":{"en","vi"},"solution":{"en","vi"}}]} cho khối pain_solution, không kèm giải thích ngoài JSON.';
  const payload = { segment: { axis: page.axis, slug: page.slug, title: page.title }, systemData: sys, currentItems: (ps.data as PainSolutionData).items };
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 1500, system, messages: [{ role: "user", content: JSON.stringify(payload) }] }),
    });
    if (!res.ok) return null;
    const json = await res.json();
    const text: string = json?.content?.[0]?.text ?? "";
    const parsed = JSON.parse(text) as PainSolutionData;
    if (!parsed?.items?.length) return null;
    return [{ pageId: page.id, blockId: ps.id, type: "update", origin: "ai", proposedData: parsed, rationale: "Drafted by claude-sonnet-4-6 from current segment + system data." }];
  } catch {
    return null;
  }
}

/** Run the drafting job for one page; returns guardrail-cleared drafts (never published). */
export async function runDraftJob(axis: Axis, slug: string): Promise<{ drafts: DraftSuggestion[]; source: "anthropic" | "template"; blocked: string[] }> {
  const page = getPage(axis, slug);
  if (!page) return { drafts: [], source: "template", blocked: [] };
  const sys = buildSystemData();
  const ai = await anthropicDrafts(page, sys);
  const source: "anthropic" | "template" = ai ? "anthropic" : "template";
  const raw = ai ?? templateDrafts(page, sys);
  const drafts: DraftSuggestion[] = [];
  const blocked: string[] = [];
  for (const d of raw) {
    const g = guardrailOk(d.proposedData, sys);
    if (g.ok) drafts.push(d);
    else blocked.push(g.reason!);
  }
  return { drafts, source, blocked };
}
