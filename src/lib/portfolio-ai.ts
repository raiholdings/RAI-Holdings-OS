/**
 * RAI Portfolio (v2) — AI content generation (server-only).
 *
 * Drafts an entry profile (block set) from minimal input, or refreshes the
 * overview of an existing entry. NEVER publishes; NEVER fabricates legal/pricing
 * figures (guardrail blocks numbers not present in the input). Real generation
 * uses the Anthropic Messages API (`claude-sonnet-4-6`) when ANTHROPIC_API_KEY is
 * set; otherwise a deterministic template keeps it demonstrable offline.
 */
import { getEntry, type ContentBlock, type Pillar, type PortfolioTab } from "@/lib/portfolio";

type LT = { en: string; vi: string };
export type NewProfileInput = { name: string; sector: string; pillar: Pillar; tab: PortfolioTab; domain?: string; notes: string };
export type DraftResult = {
  suggestions: { type: "new_profile" | "update_block"; entryId?: string; slug?: string; blockId?: string; source: "ai"; proposedData: unknown; rationale: string }[];
  source: "anthropic" | "template"; blocked: string[];
};

function guardrailOk(proposed: unknown, inputText: string): { ok: boolean; reason?: string } {
  const allowed = new Set(inputText.match(/\d+/g) ?? []);
  const bad = (JSON.stringify(proposed).match(/\d{2,}/g) ?? []).find((n) => !allowed.has(n));
  return bad ? { ok: false, reason: `Number "${bad}" has no source in the input — blocked (no fabricated figures).` } : { ok: true };
}

const bl = (i: number, type: ContentBlock["type"], data: ContentBlock["data"]): ContentBlock => ({ id: `ai-blk-${i}`, type, order: i, data, status: "draft", source: "ai" });

function templateBlocks(input: NewProfileInput, overview: LT): ContentBlock[] {
  return [
    bl(0, "overview", { body: overview }),
    bl(1, "models", { items: [{ en: `${input.sector} platform — subscription tiers`, vi: `Nền tảng ${input.sector} — gói thuê bao` }] }),
    bl(2, "ecosystem_links", { items: [{ label: { en: "Pricing", vi: "Bảng giá" }, href: "/pricing" }, { label: { en: "About RAI", vi: "Về RAI Holdings" }, href: "/about" }] }),
    bl(3, "status", { stage: "building", note: { en: "Estimated pricing — subject to change.", vi: "Giá dự kiến — có thể thay đổi." } }),
    bl(4, "contact_cta", { title: { en: `Partner with ${input.name}`, vi: `Hợp tác với ${input.name}` }, ctaLabel: { en: "Contact", vi: "Liên hệ" }, ctaHref: "/about/contact" }),
  ];
}

async function anthropicOverview(name: string, sector: string, notes: string): Promise<LT | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;
  const system =
    "Bạn là biên tập hồ sơ nền tảng cho hệ sinh thái RAI Holdings. Viết phần tổng quan chuyên nghiệp, trung thực, giữ brand + locked vocabulary. " +
    "KHÔNG bịa số liệu (vốn, nhân sự, giá). Trả JSON {\"en\",\"vi\"}, không kèm chữ ngoài JSON.";
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 1800, system, messages: [{ role: "user", content: JSON.stringify({ name, sector, notes }) }] }),
    });
    if (!res.ok) return null;
    const json = await res.json();
    const parsed = JSON.parse(json?.content?.[0]?.text ?? "") as LT;
    return parsed?.en ? parsed : null;
  } catch { return null; }
}

export async function runNewProfileJob(input: NewProfileInput): Promise<DraftResult> {
  const inputText = JSON.stringify(input);
  const ai = await anthropicOverview(input.name, input.sector, input.notes);
  const overview: LT = ai ?? { en: input.notes || `${input.name} is a ${input.sector} platform in the RAI ecosystem.`, vi: input.notes || `${input.name} là nền tảng ${input.sector} trong hệ sinh thái RAI.` };
  const blocks = templateBlocks(input, overview).filter((b) => {
    const g = guardrailOk(b.data, inputText);
    return g.ok;
  });
  const meta = { name: input.name, sector: input.sector, pillar: input.pillar, tab: input.tab, domain: input.domain, tagline: input.notes.slice(0, 100) || `${input.sector} platform` };
  return { suggestions: [{ type: "new_profile", source: "ai", proposedData: { meta, blocks }, rationale: `AI-drafted profile for ${input.name} (${ai ? "anthropic" : "template"}). No fabricated figures.` }], source: ai ? "anthropic" : "template", blocked: [] };
}

export async function runUpdateJob(slug: string, notes: string): Promise<DraftResult> {
  const entry = getEntry(slug);
  if (!entry) return { suggestions: [], source: "template", blocked: [] };
  const overview = entry.blocks.find((b) => b.type === "overview");
  const ai = await anthropicOverview(entry.name, entry.sector, notes || JSON.stringify(overview?.data));
  const data = ai ?? { body: { en: notes || `${entry.name} — updated overview.`, vi: notes || `${entry.name} — tổng quan cập nhật.` } };
  const proposed = ai ? { body: ai } : data;
  const g = guardrailOk(proposed, JSON.stringify({ notes, name: entry.name }));
  if (!g.ok) return { suggestions: [], source: ai ? "anthropic" : "template", blocked: [g.reason!] };
  return { suggestions: [{ type: "update_block", entryId: entry.id, slug, blockId: overview?.id, source: "ai", proposedData: proposed, rationale: `AI-refreshed overview for ${entry.name}.` }], source: ai ? "anthropic" : "template", blocked: [] };
}
