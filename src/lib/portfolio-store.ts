"use client";

import { useSyncExternalStore } from "react";
import type { ContentBlock, Pillar, PortfolioEntry, PortfolioTab, ProfileBlock } from "@/lib/portfolio";
import { blockTypeLabels, pillarColor } from "@/lib/portfolio";

/* ============================================================
   RAI Portfolio (v2) — client state: admin edits, AI-created entries,
   review queue, versions. localStorage. Mirrors the review-queue pattern.
   Selectors return stable slices only — filter/map in components.
   ============================================================ */

export type SuggestionType = "new_profile" | "update_block";
export type SuggestionStatus = "pending" | "approved" | "rejected" | "needs_changes";
export type Suggestion = {
  id: string; entryId?: string; slug?: string; blockId?: string;
  type: SuggestionType; source: "ai"; proposedData: unknown; rationale: string;
  status: SuggestionStatus; reviewNote?: string; createdAt: string;
};
export type Version = { id: string; entryId: string; snapshot: ContentBlock[]; createdBy: string; note: string; createdAt: string };
export type EntryOverride = { blocks?: ContentBlock[]; status?: PortfolioEntry["status"]; featured?: boolean; updatedAt: string };

type State = { overrides: Record<string, EntryOverride>; entries: PortfolioEntry[]; suggestions: Suggestion[]; versions: Version[]; seq: number };
const KEY = "rai-portfolio-v2";
const EMPTY: State = { overrides: {}, entries: [], suggestions: [], versions: [], seq: 0 };

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
const slugify = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const isNew = (id: string) => state.entries.some((e) => e.id === id);

/* ----------------------------- effective -------------------------------- */
export function effectiveEntry(seed: PortfolioEntry): PortfolioEntry {
  const o = state.overrides[seed.id];
  if (!o) return seed;
  return { ...seed, status: o.status ?? seed.status, featured: o.featured ?? seed.featured, blocks: o.blocks ? [...o.blocks].sort((a, b) => a.order - b.order) : seed.blocks, updatedAt: o.updatedAt };
}
export function effectiveList(seedList: PortfolioEntry[]): PortfolioEntry[] {
  return [...seedList.map(effectiveEntry), ...state.entries].sort((a, b) => a.order - b.order);
}
export const newEntryBySlug = (slug: string) => state.entries.find((e) => e.slug === slug);

function reindex(blocks: ContentBlock[]): ContentBlock[] { return blocks.map((b, i) => ({ ...b, order: i })); }
function currentBlocks(entry: PortfolioEntry): ContentBlock[] {
  if (isNew(entry.id)) return state.entries.find((e) => e.id === entry.id)!.blocks.map((b) => ({ ...b }));
  return (state.overrides[entry.id]?.blocks ?? entry.blocks).map((b) => ({ ...b }));
}
function setBlocks(entry: PortfolioEntry, blocks: ContentBlock[]) {
  const reixed = reindex(blocks);
  if (isNew(entry.id)) set({ entries: state.entries.map((e) => (e.id === entry.id ? { ...e, blocks: reixed, updatedAt: now() } : e)) });
  else set({ overrides: { ...state.overrides, [entry.id]: { ...(state.overrides[entry.id] ?? {}), blocks: reixed, updatedAt: now() } } });
}
function patchMeta(entry: PortfolioEntry, patch: Partial<Pick<PortfolioEntry, "status" | "featured">>) {
  if (isNew(entry.id)) set({ entries: state.entries.map((e) => (e.id === entry.id ? { ...e, ...patch, updatedAt: now() } : e)) });
  else set({ overrides: { ...state.overrides, [entry.id]: { ...(state.overrides[entry.id] ?? {}), ...patch, updatedAt: now() } } });
}

/* ----------------------------- versioning ------------------------------- */
function snapshot(entry: PortfolioEntry, note: string, by = "admin") {
  set({ versions: [{ id: sid("ver"), entryId: entry.id, snapshot: currentBlocks(entry), createdBy: by, note, createdAt: now() }, ...state.versions] });
}
export function saveVersion(entry: PortfolioEntry, note: string) { snapshot(entry, note || "Manual snapshot"); }
export function rollback(entry: PortfolioEntry, versionId: string) {
  const v = state.versions.find((x) => x.id === versionId);
  if (!v) return;
  snapshot(entry, "Before rollback");
  setBlocks(entry, v.snapshot);
}

/* ----------------------------- block editing ---------------------------- */
function emptyBlockData(type: ProfileBlock["type"]): ProfileBlock["data"] {
  const TT = (en: string) => ({ en, vi: en });
  switch (type) {
    case "overview": return { body: TT("Overview text") };
    case "models": return { items: [TT("Business model")] };
    case "pricing_table": return { estimated: true, tiers: [{ name: TT("Tier"), price: TT("—") }] };
    case "use_cases": return { items: [{ title: TT("Use case"), description: TT("Description") }] };
    case "ecosystem_links": return { items: [{ label: TT("Pricing"), href: "/pricing" }] };
    case "status": return { stage: "building" };
    case "contact_cta": return { title: TT("Contact"), ctaLabel: TT("Contact"), ctaHref: "/about/contact" };
  }
}
export function addBlock(entry: PortfolioEntry, type: ProfileBlock["type"]) {
  const blocks = currentBlocks(entry);
  blocks.push({ id: sid("blk"), type, order: blocks.length, data: emptyBlockData(type), status: "draft", source: "manual" });
  setBlocks(entry, blocks);
}
export function removeBlock(entry: PortfolioEntry, blockId: string) { setBlocks(entry, currentBlocks(entry).filter((b) => b.id !== blockId)); }
export function moveBlock(entry: PortfolioEntry, blockId: string, dir: -1 | 1) {
  const blocks = currentBlocks(entry).sort((a, b) => a.order - b.order);
  const i = blocks.findIndex((b) => b.id === blockId); const j = i + dir;
  if (i < 0 || j < 0 || j >= blocks.length) return;
  [blocks[i], blocks[j]] = [blocks[j], blocks[i]];
  setBlocks(entry, blocks);
}
export function updateBlockData(entry: PortfolioEntry, blockId: string, data: ProfileBlock["data"]) {
  setBlocks(entry, currentBlocks(entry).map((b) => (b.id === blockId ? { ...b, data, status: "published" } : b)));
}
export function setBlockStatus(entry: PortfolioEntry, blockId: string, status: "published" | "draft") {
  setBlocks(entry, currentBlocks(entry).map((b) => (b.id === blockId ? { ...b, status } : b)));
}
export function setEntryStatus(entry: PortfolioEntry, status: PortfolioEntry["status"]) { if (status === "published") snapshot(entry, "Publish"); patchMeta(entry, { status }); }
export function setFeatured(entry: PortfolioEntry, featured: boolean) { patchMeta(entry, { featured }); }

/* ----------------------------- create entry ----------------------------- */
export type CreateMeta = { name: string; sector: string; pillar: Pillar; tab: PortfolioTab; domain?: string; tagline: string };
export function createEntry(meta: CreateMeta, blocks?: ContentBlock[]): string {
  const slug = slugify(meta.name);
  const TT = (en: string) => ({ en, vi: en });
  const entry: PortfolioEntry = {
    id: sid("pe"), slug, name: meta.name, domain: meta.domain, monogram: meta.name.replace(/[^A-Za-z]/g, "").slice(0, 2).toUpperCase() || "RAI",
    accent: pillarColor[meta.pillar], tagline: TT(meta.tagline), sector: meta.sector,
    entryType: meta.tab === "companies" ? "company" : meta.tab === "investments" ? "investment" : "platform",
    pillar: meta.pillar, portfolioTab: meta.tab, models: [], pricingTiers: [], pricingStatus: "estimated",
    stage: "building", status: "draft", blocks: (blocks ?? []).map((b, i) => ({ ...b, order: i })), featured: false, order: 200 + state.entries.length,
    createdAt: now(), updatedAt: now(),
  };
  set({ entries: [entry, ...state.entries] });
  return slug;
}

/* ----------------------------- suggestions ------------------------------ */
export function addSuggestions(list: Omit<Suggestion, "id" | "status" | "createdAt">[]) {
  const created = list.map((s) => ({ ...s, id: sid("sug"), status: "pending" as SuggestionStatus, createdAt: now() }));
  set({ suggestions: [...created, ...state.suggestions] });
  return created.map((c) => c.id);
}
export function approveSuggestion(id: string, seed?: PortfolioEntry) {
  const s = state.suggestions.find((x) => x.id === id);
  if (!s || s.status !== "pending") return;
  if (s.type === "update_block" && s.blockId && seed) {
    snapshot(seed, "Apply AI suggestion");
    setBlocks(seed, currentBlocks(seed).map((b) => (b.id === s.blockId ? { ...b, data: s.proposedData as ProfileBlock["data"], source: "ai", status: "published" } : b)));
  } else if (s.type === "new_profile") {
    const pd = s.proposedData as { meta: CreateMeta; blocks: ContentBlock[] };
    createEntry(pd.meta, pd.blocks);
  }
  set({ suggestions: state.suggestions.map((x) => (x.id === id ? { ...x, status: "approved" as SuggestionStatus } : x)) });
}
export function rejectSuggestion(id: string, note?: string) {
  set({ suggestions: state.suggestions.map((x) => (x.id === id ? { ...x, status: "rejected" as SuggestionStatus, reviewNote: note } : x)) });
}

/* ----------------------------- hooks ------------------------------------ */
function useStore<S>(sel: (s: State) => S): S {
  return useSyncExternalStore((cb) => { listeners.add(cb); return () => listeners.delete(cb); }, () => sel(state), () => sel(EMPTY));
}
export const useOverride = (entryId: string) => useStore((s) => s.overrides[entryId]);
export const useOverridesMap = () => useStore((s) => s.overrides);
export const useNewEntries = () => useStore((s) => s.entries);
export const useSuggestions = () => useStore((s) => s.suggestions);
export const useVersions = () => useStore((s) => s.versions);
export { blockTypeLabels };
