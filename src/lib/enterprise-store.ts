"use client";

import { useSyncExternalStore } from "react";
import type { BlockData, BlockType, ContentBlock, EnterprisePage, PageStatus } from "@/lib/enterprise";
import { blockTypeLabels, metricValue } from "@/lib/enterprise";

/* ============================================================
   RAI Enterprise — client state (admin edits, review queue,
   versions, contributors, metric overrides). localStorage.
   Production: PostgreSQL + a job queue + an admin auth layer.

   Selectors return stable state slices only — never .filter()/.map()
   inside a selector (it would break useSyncExternalStore). Components
   derive with useMemo.
   ============================================================ */

export type SuggestionType = "new" | "update" | "metric_refresh";
export type SuggestionOrigin = "ai" | "community";
export type SuggestionStatus = "pending" | "approved" | "rejected" | "needs_changes";

export type Suggestion = {
  id: string;
  pageId: string;
  blockId?: string;        // for "update"
  targetType?: BlockType;  // for "new"
  metricKey?: string;      // for "metric_refresh"
  type: SuggestionType;
  origin: SuggestionOrigin;
  proposedData: BlockData | { value: string };
  rationale: string;
  contributorId?: string;
  status: SuggestionStatus;
  reviewNote?: string;
  createdAt: string;
};

export type Version = { id: string; pageId: string; snapshot: ContentBlock[]; createdBy: string; note: string; createdAt: string };
export type Contributor = { id: string; name: string; type: "user" | "partner" | "opc"; reputationScore: number; contributionsApproved: number; contributionsRejected: number };
export type PageOverride = { blocks?: ContentBlock[]; status?: PageStatus; updatedAt: string };

type State = {
  overrides: Record<string, PageOverride>;
  suggestions: Suggestion[];
  versions: Version[];
  contributors: Contributor[];
  metricOverrides: Record<string, string>;
  seq: number;
};
const KEY = "rai-enterprise-v1";
const EMPTY: State = { overrides: {}, suggestions: [], versions: [], contributors: [], metricOverrides: {}, seq: 0 };

let state: State = EMPTY;
let hydrated = false;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
function persist() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {} }
function set(next: Partial<State>) { state = { ...state, ...next, seq: state.seq + 1 }; persist(); emit(); }

export function hydrateStore() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try { const raw = localStorage.getItem(KEY); if (raw) { state = { ...EMPTY, ...JSON.parse(raw) }; emit(); } } catch {}
}

const now = () => new Date().toISOString();
let _idc = 0;
const sid = (p: string) => p + "-" + (state.seq + 1).toString(36) + (++_idc).toString(36);

/* ----------------------------- effective merge -------------------------- */
/** Seed page + admin overrides → the page actually rendered. */
export function effectivePage(seed: EnterprisePage): EnterprisePage {
  const o = state.overrides[seed.id];
  if (!o) return seed;
  return {
    ...seed,
    status: o.status ?? seed.status,
    blocks: o.blocks ? [...o.blocks].sort((a, b) => a.order - b.order) : seed.blocks,
    updatedAt: o.updatedAt,
  };
}
function effectiveBlocks(seed: EnterprisePage): ContentBlock[] {
  return (state.overrides[seed.id]?.blocks ?? seed.blocks).map((b) => ({ ...b }));
}
function setOverride(pageId: string, patch: Partial<PageOverride>) {
  const prev = state.overrides[pageId] ?? { updatedAt: now() };
  set({ overrides: { ...state.overrides, [pageId]: { ...prev, ...patch, updatedAt: now() } } });
}
function reindex(blocks: ContentBlock[]): ContentBlock[] {
  return blocks.map((b, i) => ({ ...b, order: i }));
}

/* ----------------------------- versioning ------------------------------- */
function snapshot(seed: EnterprisePage, note: string, by = "admin") {
  const v: Version = { id: sid("ver"), pageId: seed.id, snapshot: effectiveBlocks(seed), createdBy: by, note, createdAt: now() };
  set({ versions: [v, ...state.versions] });
}
export function saveVersion(seed: EnterprisePage, note: string) { snapshot(seed, note || "Manual snapshot"); }
export function rollback(seed: EnterprisePage, versionId: string) {
  const v = state.versions.find((x) => x.id === versionId);
  if (!v) return;
  snapshot(seed, "Before rollback");
  setOverride(seed.id, { blocks: reindex(v.snapshot) });
}

/* ----------------------------- block editing ---------------------------- */
function emptyBlockData(type: BlockType): BlockData {
  const TT = (en: string) => ({ en, vi: en });
  switch (type) {
    case "hero": return { title: TT("New headline"), subhead: TT("Subhead"), ctaLabel: TT("Get started"), ctaHref: "/enterprise" };
    case "metric_strip": return { keys: [] };
    case "pain_solution": return { items: [{ pain: TT("Pain"), solution: TT("Solution") }] };
    case "feature_grid": return { items: [{ icon: "sparkles", title: TT("Feature"), body: TT("Description") }] };
    case "use_case_steps": return { steps: [{ title: TT("Step"), body: TT("Description") }] };
    case "proof": return { quote: TT("Quote"), author: "Name", role: TT("Role"), logos: [] };
    case "comparison": return { columns: [TT("A"), TT("B")], rows: [{ label: TT("Row"), cells: ["✓", "—"] }] };
    case "faq": return { items: [{ q: TT("Question"), a: TT("Answer") }] };
    case "cta_band": return { title: TT("Call to action"), body: TT("Body"), ctaLabel: TT("Contact"), ctaHref: "/enterprise/contribute" };
  }
}
export function addBlock(seed: EnterprisePage, type: BlockType) {
  const blocks = effectiveBlocks(seed);
  blocks.push({ id: sid("blk"), type, order: blocks.length, data: emptyBlockData(type), status: "draft", source: "manual", lastUpdatedBy: "admin", updatedAt: now() });
  setOverride(seed.id, { blocks: reindex(blocks) });
}
export function removeBlock(seed: EnterprisePage, blockId: string) {
  setOverride(seed.id, { blocks: reindex(effectiveBlocks(seed).filter((b) => b.id !== blockId)) });
}
export function moveBlock(seed: EnterprisePage, blockId: string, dir: -1 | 1) {
  const blocks = effectiveBlocks(seed).sort((a, b) => a.order - b.order);
  const i = blocks.findIndex((b) => b.id === blockId);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= blocks.length) return;
  [blocks[i], blocks[j]] = [blocks[j], blocks[i]];
  setOverride(seed.id, { blocks: reindex(blocks) });
}
export function updateBlockData(seed: EnterprisePage, blockId: string, data: BlockData) {
  setOverride(seed.id, { blocks: effectiveBlocks(seed).map((b) => (b.id === blockId ? { ...b, data, status: "published", lastUpdatedBy: "admin", updatedAt: now() } : b)) });
}
export function setBlockStatus(seed: EnterprisePage, blockId: string, status: "published" | "draft") {
  setOverride(seed.id, { blocks: effectiveBlocks(seed).map((b) => (b.id === blockId ? { ...b, status, updatedAt: now() } : b)) });
}
export function setPageStatus(seed: EnterprisePage, status: PageStatus) {
  if (status === "published") snapshot(seed, "Publish");
  setOverride(seed.id, { status });
}

/* ----------------------------- suggestions ------------------------------ */
export function addSuggestions(list: Omit<Suggestion, "id" | "status" | "createdAt">[]) {
  const created = list.map((s) => ({ ...s, id: sid("sug"), status: "pending" as SuggestionStatus, createdAt: now() }));
  set({ suggestions: [...created, ...state.suggestions] });
  return created.map((c) => c.id);
}
export function approveSuggestion(seed: EnterprisePage, id: string) {
  const s = state.suggestions.find((x) => x.id === id);
  if (!s || s.status !== "pending") return;
  if (s.type === "metric_refresh" && s.metricKey) {
    const value = (s.proposedData as { value: string }).value;
    set({ metricOverrides: { ...state.metricOverrides, [s.metricKey]: value } });
  } else {
    snapshot(seed, `Apply ${s.origin} suggestion`);
    const blocks = effectiveBlocks(seed);
    if (s.type === "update" && s.blockId) {
      const idx = blocks.findIndex((b) => b.id === s.blockId);
      if (idx >= 0) blocks[idx] = { ...blocks[idx], data: s.proposedData as BlockData, source: s.origin, status: "published", lastUpdatedBy: s.origin, updatedAt: now() };
    } else if (s.type === "new" && s.targetType) {
      blocks.push({ id: sid("blk"), type: s.targetType, order: blocks.length, data: s.proposedData as BlockData, status: "published", source: s.origin, lastUpdatedBy: s.origin, updatedAt: now() });
    }
    setOverride(seed.id, { blocks: reindex(blocks) });
  }
  bumpContributor(s.contributorId, true);
  set({ suggestions: state.suggestions.map((x) => (x.id === id ? { ...x, status: "approved" as SuggestionStatus } : x)) });
}
export function rejectSuggestion(id: string, note?: string) {
  const s = state.suggestions.find((x) => x.id === id);
  if (s) bumpContributor(s.contributorId, false);
  set({ suggestions: state.suggestions.map((x) => (x.id === id ? { ...x, status: "rejected" as SuggestionStatus, reviewNote: note } : x)) });
}

/* ----------------------------- contributors ----------------------------- */
function bumpContributor(id: string | undefined, approved: boolean) {
  if (!id) return;
  set({ contributors: state.contributors.map((c) => (c.id === id ? { ...c, reputationScore: Math.max(0, c.reputationScore + (approved ? 5 : -2)), contributionsApproved: c.contributionsApproved + (approved ? 1 : 0), contributionsRejected: c.contributionsRejected + (approved ? 0 : 1) } : c)) });
}
export function submitContribution(p: { pageId: string; blockType: BlockType; name: string; contributorType: Contributor["type"]; content: string; rationale: string }) {
  let contributor = state.contributors.find((c) => c.name.toLowerCase() === p.name.toLowerCase());
  if (!contributor) {
    contributor = { id: sid("con"), name: p.name, type: p.contributorType, reputationScore: 0, contributionsApproved: 0, contributionsRejected: 0 };
    set({ contributors: [contributor, ...state.contributors] });
  }
  const TT = (en: string) => ({ en, vi: en });
  // Community submissions arrive as a single text body wrapped into the block schema.
  const proposed: BlockData = p.blockType === "proof"
    ? { quote: TT(p.content), author: p.name, role: TT(p.contributorType), logos: [] }
    : p.blockType === "faq"
    ? { items: [{ q: TT(p.content.split("?")[0] + "?"), a: TT(p.content) }] }
    : { items: [{ pain: TT("Community-reported"), solution: TT(p.content) }] };
  return addSuggestions([{ pageId: p.pageId, type: "new", origin: "community", targetType: p.blockType, proposedData: proposed, rationale: p.rationale || "Community contribution", contributorId: contributor.id }]);
}

/* ----------------------------- metric refresh --------------------------- */
/** Compute the current system value; if it differs from what's displayed, queue a metric_refresh suggestion. */
export function queueMetricRefresh(metricKey: string) {
  const current = metricValue(metricKey, state.metricOverrides);
  const fresh = metricValue(metricKey); // ignores overrides → live system value
  if (current === fresh) return { changed: false as const };
  const ids = addSuggestions([{ pageId: "__metrics__", metricKey, type: "metric_refresh", origin: "ai", proposedData: { value: fresh }, rationale: `System query returned ${fresh} (was ${current}).` }]);
  return { changed: true as const, from: current, to: fresh, id: ids[0] };
}

/* ----------------------------- hooks ------------------------------------ */
function useStore<S>(sel: (s: State) => S): S {
  return useSyncExternalStore((cb) => { listeners.add(cb); return () => listeners.delete(cb); }, () => sel(state), () => sel(EMPTY));
}
export const useOverride = (pageId: string) => useStore((s) => s.overrides[pageId]);
export const useOverrides = () => useStore((s) => s.overrides);
export const useSuggestions = () => useStore((s) => s.suggestions);
export const useVersions = () => useStore((s) => s.versions);
export const useContributors = () => useStore((s) => s.contributors);
export const useMetricOverrides = () => useStore((s) => s.metricOverrides);
export { blockTypeLabels };
