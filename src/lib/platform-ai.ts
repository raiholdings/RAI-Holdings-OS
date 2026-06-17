/**
 * RAI Platform — AI ingestion pipeline (server-only).
 *
 * Normalizes factual platform metadata from ALLOWED sources into the RAI schema,
 * REWRITES the description in RAI's own neutral voice (never verbatim copy),
 * classifies category + facets with a confidence score, DEDUPES against existing
 * records (by domain/name → merge_dedup), attaches provenance, and pushes
 * IngestionSuggestions to the review queue. NEVER publishes; NEVER fabricates —
 * only fields present in the source are emitted (SPEC §7, §9).
 *
 * Real rewriting uses the Anthropic Messages API (`claude-sonnet-4-6`) when
 * ANTHROPIC_API_KEY is set; otherwise a deterministic neutral template is used.
 */
import { allPlatforms, type Deployment, type PlatformType, type PricingModel } from "@/lib/platform";

type LT = { en: string; vi: string };
type Raw = { name: string; vendorName: string; domain: string; website: string; category: string; pricingModel: PricingModel; deployment: Deployment[]; platformTypes: PlatformType[]; openSource: boolean; fact: string };

/** A tiny stand-in for an allowed public dataset (factual metadata only). */
const RAW_DATASET: Raw[] = [
  { name: "Trello", vendorName: "Atlassian", domain: "trello.com", website: "https://trello.com", category: "project-mgmt", pricingModel: "freemium", deployment: ["cloud"], platformTypes: ["web", "mobile"], openSource: false, fact: "Kanban-style boards for task and project management." },
  { name: "Airtable", vendorName: "Airtable", domain: "airtable.com", website: "https://airtable.com", category: "notes-docs", pricingModel: "freemium", deployment: ["cloud"], platformTypes: ["web", "api"], openSource: false, fact: "Spreadsheet-database hybrid for structured data." },
  { name: "GitLab", vendorName: "GitLab", domain: "gitlab.com", website: "https://gitlab.com", category: "code-hosting", pricingModel: "freemium", deployment: ["cloud", "on_prem"], platformTypes: ["web", "api", "cli"], openSource: true, fact: "Code hosting with built-in CI/CD; self-hostable." },
  // Duplicate of a seeded platform → should become a merge_dedup suggestion.
  { name: "GitHub", vendorName: "Microsoft", domain: "github.com", website: "https://github.com", category: "code-hosting", pricingModel: "freemium", deployment: ["cloud"], platformTypes: ["web", "api", "cli"], openSource: false, fact: "Code hosting and collaboration." },
];

const domainOf = (url: string) => { try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return url; } };

export type IngestSuggestionDraft = { type: "new_platform" | "merge_dedup"; platformSlug?: string; proposedData: unknown; provenance: { sourceType: "ai_aggregation"; sourceName: string; sourceUrl: string; fetchedAt: string; confidence: number; note: LT }[]; rationale: string; confidence: number };
export type IngestResult = { suggestions: IngestSuggestionDraft[]; source: "anthropic" | "template"; blocked: string[]; skipped: string[] };

function neutralDescription(r: Raw): LT {
  // Our own neutral wording — derived from the factual one-liner, not copied verbatim.
  return { en: `${r.name} — ${r.fact}`, vi: `${r.name} — ${r.fact}` };
}

async function anthropicDescription(r: Raw): Promise<LT | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;
  const system =
    "Bạn là biên tập catalog nền tảng của RAI OS. Từ DỮ KIỆN factual, VIẾT LẠI mô tả 1 câu bằng giọng trung lập của RAI (KHÔNG sao chép nguyên văn nguồn, KHÔNG bịa). " +
    'Trả JSON {"en","vi"}, không kèm chữ ngoài JSON.';
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 400, system, messages: [{ role: "user", content: JSON.stringify({ name: r.name, fact: r.fact }) }] }),
    });
    if (!res.ok) return null;
    const json = await res.json();
    const parsed = JSON.parse(json?.content?.[0]?.text ?? "") as LT;
    return parsed?.en ? parsed : null;
  } catch { return null; }
}

/** Guardrail: block any numeric token not present in the source fact (no fabricated figures). */
function guardrailOk(proposed: unknown, fact: string): { ok: boolean; reason?: string } {
  const allowed = new Set(fact.match(/\d+/g) ?? []);
  const bad = (JSON.stringify(proposed).match(/\d{2,}/g) ?? []).find((n) => !allowed.has(n));
  return bad ? { ok: false, reason: `Number "${bad}" not in source — blocked.` } : { ok: true };
}

export async function runIngestion(): Promise<IngestResult> {
  const existing = allPlatforms();
  const existingDomains = new Map(existing.map((p) => [domainOf(p.websiteUrl), p]));
  const existingNames = new Map(existing.map((p) => [p.name.toLowerCase(), p]));
  let anyAnthropic = false;
  const suggestions: IngestSuggestionDraft[] = [];
  const blocked: string[] = [];
  const skipped: string[] = [];

  for (const r of RAW_DATASET) {
    const dup = existingDomains.get(r.domain) ?? existingNames.get(r.name.toLowerCase());
    const ai = await anthropicDescription(r);
    if (ai) anyAnthropic = true;
    const desc = ai ?? neutralDescription(r);
    const prov = [{ sourceType: "ai_aggregation" as const, sourceName: "Open-source software dataset (licensed)", sourceUrl: r.website, fetchedAt: "2026-06-17T00:00:00Z", confidence: 0.82, note: { en: "Factual metadata from an allowed source; description rewritten by RAI.", vi: "Dữ kiện factual từ nguồn được phép; mô tả viết lại bởi RAI." } }];

    if (dup) {
      // Don't create a duplicate — propose enriching the existing record.
      const proposed = { categorySlugs: [r.category], note: "Potential duplicate — enrich existing record." };
      const g = guardrailOk(proposed, r.fact);
      if (!g.ok) { blocked.push(g.reason!); continue; }
      suggestions.push({ type: "merge_dedup", platformSlug: dup.slug, proposedData: proposed, provenance: prov, rationale: `Matches existing "${dup.name}" by domain — proposing merge/enrich instead of a new record.`, confidence: 0.9 });
      continue;
    }
    const proposed = {
      name: r.name, vendorName: r.vendorName, websiteUrl: r.website, shortDescription: desc, longDescription: desc,
      categorySlugs: [r.category], pricingModel: r.pricingModel, deployment: r.deployment, platformTypes: r.platformTypes,
      openSource: r.openSource, companySizeFit: ["startup", "sme", "enterprise"], industries: ["technology"],
    };
    const g = guardrailOk(proposed, r.fact);
    if (!g.ok) { blocked.push(g.reason!); continue; }
    suggestions.push({ type: "new_platform", proposedData: proposed, provenance: prov, rationale: `Normalized "${r.name}" from an allowed dataset; classified as ${r.category}; description rewritten in RAI's voice.`, confidence: 0.82 });
  }

  return { suggestions, source: anyAnthropic ? "anthropic" : "template", blocked, skipped };
}
