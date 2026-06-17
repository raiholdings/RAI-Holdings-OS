"use client";

import { useSyncExternalStore } from "react";
import type { AddOn, ComparisonGroup, EntryStatus, Plan, PlanFeatureItem, PricingPage } from "@/lib/pricing";

/* ============================================================
   RAI Pricing — client state (admin edits, review queue, versions,
   contributors). localStorage. Mirrors enterprise-store.

   Selectors return stable state slices only — never filter/map inside
   a selector. The whole page is one editable draft override.
   ============================================================ */

export type SuggestionTarget = "plan" | "feature" | "comparison" | "price" | "addon";
export type SuggestionOrigin = "ai" | "community";
export type SuggestionStatus = "pending" | "approved" | "rejected" | "needs_changes";
export type Suggestion = {
  id: string;
  target: SuggestionTarget;
  planKey?: string;
  origin: SuggestionOrigin;
  proposedData: unknown;
  rationale: string;
  contributorId?: string;
  status: SuggestionStatus;
  reviewNote?: string;
  createdAt: string;
};
export type Version = { id: string; snapshot: PricingPage; createdBy: string; note: string; createdAt: string };
export type Contributor = { id: string; name: string; type: "user" | "partner" | "opc"; reputationScore: number; contributionsApproved: number; contributionsRejected: number };

type State = { draft?: PricingPage; suggestions: Suggestion[]; versions: Version[]; contributors: Contributor[]; seq: number };
const KEY = "rai-pricing-v1";
const EMPTY: State = { suggestions: [], versions: [], contributors: [], seq: 0 };

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
const clone = <T>(x: T): T => JSON.parse(JSON.stringify(x));

/** Seed page + admin draft → the page actually rendered. */
export function effectivePricing(seed: PricingPage): PricingPage {
  return state.draft ?? seed;
}
function workingCopy(seed: PricingPage): PricingPage {
  return clone(state.draft ?? seed);
}
function commit(page: PricingPage) { set({ draft: { ...page, updatedAt: now() } }); }

/* ----------------------------- versioning ------------------------------- */
function snapshot(seed: PricingPage, note: string, by = "admin") {
  const v: Version = { id: sid("ver"), snapshot: workingCopy(seed), createdBy: by, note, createdAt: now() };
  set({ versions: [v, ...state.versions] });
}
export function saveVersion(seed: PricingPage, note: string) { snapshot(seed, note || "Manual snapshot"); }
export function rollback(seed: PricingPage, versionId: string) {
  const v = state.versions.find((x) => x.id === versionId);
  if (!v) return;
  snapshot(seed, "Before rollback");
  commit(clone(v.snapshot));
}

/* ----------------------------- page edits ------------------------------- */
export function updateBanner(seed: PricingPage, banner: PricingPage["trialBanner"]) { const p = workingCopy(seed); p.trialBanner = banner; commit(p); }
export function updateHero(seed: PricingPage, heroTitle: PricingPage["heroTitle"], heroSubtitle: PricingPage["heroSubtitle"]) { const p = workingCopy(seed); p.heroTitle = heroTitle; p.heroSubtitle = heroSubtitle; commit(p); }
export function setPageStatus(seed: PricingPage, status: EntryStatus) { if (status === "published") snapshot(seed, "Publish"); const p = workingCopy(seed); p.status = status; commit(p); }

/* ----------------------------- plan edits ------------------------------- */
export function updatePlan(seed: PricingPage, key: string, patch: Partial<Plan>) {
  const p = workingCopy(seed);
  p.plans = p.plans.map((pl) => (pl.key === key ? { ...pl, ...patch } : pl));
  commit(p);
}
export function setRecommended(seed: PricingPage, key: string) {
  const p = workingCopy(seed);
  p.plans = p.plans.map((pl) => ({ ...pl, recommended: pl.key === key }));
  commit(p);
}
export function movePlan(seed: PricingPage, key: string, dir: -1 | 1) {
  const p = workingCopy(seed);
  const i = p.plans.findIndex((pl) => pl.key === key);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= p.plans.length) return;
  [p.plans[i], p.plans[j]] = [p.plans[j], p.plans[i]];
  commit(p);
}
export function removePlan(seed: PricingPage, key: string) {
  const p = workingCopy(seed);
  p.plans = p.plans.filter((pl) => pl.key !== key);
  commit(p);
}
export function addPlan(seed: PricingPage) {
  const p = workingCopy(seed);
  const TT = (en: string) => ({ en, vi: en });
  const key = "plan-" + (state.seq + 1).toString(36);
  p.plans.push({ id: sid("plan"), key, name: TT("New plan"), tagline: TT("Tagline"), kind: "subscription", recommended: false, priceModel: "flat", priceMonthly: 0, priceYearly: 0, priceUnit: TT("/month"), ctas: [{ label: TT("Choose"), url: "/marketplace", style: "primary" }], featureItems: [], featuredAddOnIds: [], highlightGroups: [], status: "draft", source: "manual" });
  commit(p);
}
export function addFeatureItem(seed: PricingPage, key: string, item: { title: { en: string; vi: string }; description: { en: string; vi: string }; valueLabel?: { en: string; vi: string }; source?: PlanFeatureItem["source"] }) {
  const p = workingCopy(seed);
  p.plans = p.plans.map((pl) => (pl.key === key ? { ...pl, featureItems: [...pl.featureItems, { id: sid("fi"), source: item.source ?? "manual", ...item }] } : pl));
  commit(p);
}

/* ----------------------------- comparison / addons ---------------------- */
export function updateComparison(seed: PricingPage, comparison: ComparisonGroup[]) { const p = workingCopy(seed); p.comparison = comparison; commit(p); }
export function updateAddOns(seed: PricingPage, addOns: AddOn[]) { const p = workingCopy(seed); p.addOns = addOns; commit(p); }

/* ----------------------------- suggestions ------------------------------ */
export function addSuggestions(list: Omit<Suggestion, "id" | "status" | "createdAt">[]) {
  const created = list.map((s) => ({ ...s, id: sid("sug"), status: "pending" as SuggestionStatus, createdAt: now() }));
  set({ suggestions: [...created, ...state.suggestions] });
  return created.map((c) => c.id);
}
export function approveSuggestion(seed: PricingPage, id: string) {
  const s = state.suggestions.find((x) => x.id === id);
  if (!s || s.status !== "pending") return;
  snapshot(seed, `Apply ${s.origin} ${s.target} suggestion`);
  if ((s.target === "feature" || s.target === "plan") && s.planKey) {
    if (s.target === "feature") {
      const item = s.proposedData as { title: { en: string; vi: string }; description: { en: string; vi: string }; valueLabel?: { en: string; vi: string } };
      addFeatureItem(seed, s.planKey, { ...item, source: s.origin });
    } else {
      updatePlan(seed, s.planKey, s.proposedData as Partial<Plan>);
    }
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
export function submitContribution(p: { planKey: string; name: string; contributorType: Contributor["type"]; title: string; content: string; rationale: string }) {
  let contributor = state.contributors.find((c) => c.name.toLowerCase() === p.name.toLowerCase());
  if (!contributor) {
    contributor = { id: sid("con"), name: p.name, type: p.contributorType, reputationScore: 0, contributionsApproved: 0, contributionsRejected: 0 };
    set({ contributors: [contributor, ...state.contributors] });
  }
  const TT = (en: string) => ({ en, vi: en });
  return addSuggestions([{ target: "feature", planKey: p.planKey, origin: "community", proposedData: { title: TT(p.title || "Community suggestion"), description: TT(p.content) }, rationale: p.rationale || "Community contribution", contributorId: contributor.id }]);
}

/* ----------------------------- hooks ------------------------------------ */
function useStore<S>(sel: (s: State) => S): S {
  return useSyncExternalStore((cb) => { listeners.add(cb); return () => listeners.delete(cb); }, () => sel(state), () => sel(EMPTY));
}
export const useDraft = () => useStore((s) => s.draft);
export const useSuggestions = () => useStore((s) => s.suggestions);
export const useVersions = () => useStore((s) => s.versions);
export const useContributors = () => useStore((s) => s.contributors);
