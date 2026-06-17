"use client";

import { useSyncExternalStore } from "react";
import type { CompanySize, Deployment, Platform, PricingModel, Provenance } from "@/lib/platform";

/* ============================================================
   RAI Platform — client state: community reviews, user submissions,
   AI ingestion queue, ingestion sources, approved (published) records.
   localStorage. Mirrors the established review-queue pattern.

   Selectors return stable slices only — filter/map in components.
   ============================================================ */

export type Review = { id: string; platformSlug: string; rating: number; title: string; pros: string; cons: string; companySize: CompanySize; industry: string; role: string; createdAt: string; status: "published" | "flagged" };
export type SubmissionInput = { name: string; vendorName: string; websiteUrl: string; shortDescription: string; categorySlug: string; pricingModel: PricingModel; deployment: Deployment };
export type Submission = { id: string; data: SubmissionInput; status: "pending" | "approved" | "rejected"; reviewNote?: string; createdAt: string };
export type IngestionType = "new_platform" | "enrich_field" | "merge_dedup";
export type IngestionSuggestion = { id: string; type: IngestionType; platformSlug?: string; proposedData: unknown; provenance: Provenance[]; rationale: string; confidence: number; status: "pending" | "approved" | "rejected"; reviewNote?: string; createdAt: string };
export type IngestionSource = { id: string; name: string; baseUrl: string; method: "official_api" | "public_dataset" | "fetch_allowed"; allowed: boolean };

type State = { reviews: Review[]; approved: Platform[]; submissions: Submission[]; ingestion: IngestionSuggestion[]; sources: IngestionSource[]; seq: number };
const KEY = "rai-platform-v1";
const SEED_SOURCES: IngestionSource[] = [
  { id: "src-oss", name: "Open-source software dataset (licensed)", baseUrl: "https://example.org/oss-dataset", method: "public_dataset", allowed: true },
  { id: "src-vendor", name: "Vendor official sites (factual metadata)", baseUrl: "https://vendors.example", method: "fetch_allowed", allowed: true },
  { id: "src-thirdparty", name: "Third-party catalog (terms not vetted)", baseUrl: "https://thirdparty.example", method: "fetch_allowed", allowed: false },
];
const EMPTY: State = { reviews: [], approved: [], submissions: [], ingestion: [], sources: SEED_SOURCES, seq: 0 };

let state: State = EMPTY;
let hydrated = false;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
function persist() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {} }
function set(next: Partial<State>) { state = { ...state, ...next, seq: state.seq + 1 }; persist(); emit(); }

export function hydrateStore() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try { const raw = localStorage.getItem(KEY); if (raw) { const p = JSON.parse(raw); state = { ...EMPTY, ...p, sources: p.sources?.length ? p.sources : SEED_SOURCES }; emit(); } } catch {}
}

const now = () => new Date().toISOString();
let _idc = 0;
const sid = (p: string) => p + "-" + (state.seq + 1).toString(36) + (++_idc).toString(36);
const slugify = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/* ----------------------------- effective rating ------------------------- */
export function effectiveRating(p: Platform, reviews: Review[]): { ratingAvg: number; reviewCount: number } {
  const rs = reviews.filter((r) => r.platformSlug === p.slug && r.status === "published");
  if (rs.length === 0) return { ratingAvg: p.ratingAvg, reviewCount: p.reviewCount };
  const seedCount = p.reviewCount, seedSum = p.ratingAvg * p.reviewCount;
  const sum = seedSum + rs.reduce((s, r) => s + r.rating, 0);
  const count = seedCount + rs.length;
  return { ratingAvg: Math.round((sum / count) * 10) / 10, reviewCount: count };
}

/* ----------------------------- reviews ---------------------------------- */
export function addReview(platformSlug: string, r: Omit<Review, "id" | "platformSlug" | "createdAt" | "status">) {
  set({ reviews: [{ ...r, id: sid("rev"), platformSlug, createdAt: now(), status: "published" }, ...state.reviews] });
}

/* ----------------------------- submissions ------------------------------ */
export function submitPlatform(data: SubmissionInput) {
  set({ submissions: [{ id: sid("sub"), data, status: "pending", createdAt: now() }, ...state.submissions] });
}
function platformFromSubmission(s: Submission): Platform {
  const d = s.data;
  return {
    id: sid("pf"), slug: slugify(d.name), name: d.name, vendorName: d.vendorName, websiteUrl: d.websiteUrl,
    monogram: d.name.replace(/[^A-Za-z]/g, "").slice(0, 2).toUpperCase() || "PF", accent: "#378add",
    shortDescription: { en: d.shortDescription, vi: d.shortDescription }, longDescription: { en: d.shortDescription, vi: d.shortDescription },
    categorySlugs: [d.categorySlug], useCases: [], features: [], integrations: [], deployment: [d.deployment], platformTypes: ["web"],
    openSource: false, pricingModel: d.pricingModel, pricingTiers: [], companySizeFit: ["sme"], industries: [], regions: ["global"],
    isRaiPlatform: false, raiRefs: [], ratingAvg: 0, reviewCount: 0, status: "published",
    provenance: [{ sourceType: "community", sourceName: "Community submission", sourceUrl: d.websiteUrl, fetchedAt: now() }],
    createdAt: now(), updatedAt: now(),
  };
}
export function approveSubmission(id: string) {
  const s = state.submissions.find((x) => x.id === id);
  if (!s || s.status !== "pending") return;
  set({ approved: [platformFromSubmission(s), ...state.approved], submissions: state.submissions.map((x) => (x.id === id ? { ...x, status: "approved" as const } : x)) });
}
export function rejectSubmission(id: string, note?: string) {
  set({ submissions: state.submissions.map((x) => (x.id === id ? { ...x, status: "rejected" as const, reviewNote: note } : x)) });
}

/* ----------------------------- ingestion -------------------------------- */
export function addIngestionSuggestions(list: Omit<IngestionSuggestion, "id" | "status" | "createdAt">[]) {
  const created = list.map((s) => ({ ...s, id: sid("ing"), status: "pending" as const, createdAt: now() }));
  set({ ingestion: [...created, ...state.ingestion] });
  return created.map((c) => c.id);
}
export function approveIngestion(id: string) {
  const s = state.ingestion.find((x) => x.id === id);
  if (!s || s.status !== "pending") return;
  if (s.type === "new_platform") {
    const pd = s.proposedData as Partial<Platform> & { name: string; shortDescription: { en: string; vi: string } };
    const platform: Platform = {
      id: sid("pf"), slug: slugify(pd.name), name: pd.name, vendorName: pd.vendorName ?? pd.name, websiteUrl: pd.websiteUrl ?? "",
      monogram: pd.name.replace(/[^A-Za-z]/g, "").slice(0, 2).toUpperCase() || "PF", accent: "#7A5CFF",
      shortDescription: pd.shortDescription, longDescription: pd.longDescription ?? pd.shortDescription,
      categorySlugs: pd.categorySlugs ?? [], useCases: pd.useCases ?? [], features: pd.features ?? [], integrations: [],
      deployment: pd.deployment ?? ["cloud"], platformTypes: pd.platformTypes ?? ["web"], openSource: pd.openSource ?? false,
      pricingModel: pd.pricingModel ?? "freemium", pricingTiers: [], companySizeFit: pd.companySizeFit ?? ["sme"], industries: pd.industries ?? [], regions: ["global"],
      isRaiPlatform: false, raiRefs: [], ratingAvg: 0, reviewCount: 0, status: "published",
      provenance: s.provenance, createdAt: now(), updatedAt: now(),
    };
    set({ approved: [platform, ...state.approved] });
  }
  set({ ingestion: state.ingestion.map((x) => (x.id === id ? { ...x, status: "approved" as const } : x)) });
}
export function rejectIngestion(id: string, note?: string) {
  set({ ingestion: state.ingestion.map((x) => (x.id === id ? { ...x, status: "rejected" as const, reviewNote: note } : x)) });
}

/* ----------------------------- sources ---------------------------------- */
export function toggleSource(id: string) {
  set({ sources: state.sources.map((s) => (s.id === id ? { ...s, allowed: !s.allowed } : s)) });
}

/* ----------------------------- hooks ------------------------------------ */
function useStore<S>(sel: (s: State) => S): S {
  return useSyncExternalStore((cb) => { listeners.add(cb); return () => listeners.delete(cb); }, () => sel(state), () => sel(EMPTY));
}
export const useReviews = () => useStore((s) => s.reviews);
export const useApprovedPlatforms = () => useStore((s) => s.approved);
export const useSubmissions = () => useStore((s) => s.submissions);
export const useIngestion = () => useStore((s) => s.ingestion);
export const useSources = () => useStore((s) => s.sources);
