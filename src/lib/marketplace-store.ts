"use client";

import { useSyncExternalStore } from "react";
import type { Listing, PricingPlan, Publisher } from "@/lib/marketplace";

/* ============================================================
   RAI Marketplace — client state (publisher, listings, subs, billing).
   localStorage-backed. Production: backend + payment gateway.
   ============================================================ */

export type Sub = {
  id: string;
  slug: string;
  listingName: string;
  planId: string;
  planName: string;
  planType: PricingPlan["type"];
  status: "active" | "trialing" | "canceled" | "past_due";
  billingCycle: "monthly" | "yearly";
  priceMonthly: number;
  priceYearly: number;
  seats?: number;
  startedAt: string;
  currentPeriodEnd: string;
  pendingChange?: { planId: string; planName: string; billingCycle: "monthly" | "yearly"; effectiveDate: string };
};

export type BillingEvent = {
  seq: number;
  action: "purchased" | "changed" | "cancelled" | "pending_change";
  listingName: string;
  planName: string;
  effectiveDate: string;
  detail: string;
};

type State = { publisher: Publisher | null; listings: Listing[]; subs: Sub[]; events: BillingEvent[]; seq: number };

const KEY = "rai-marketplace-v1";
const EMPTY: State = { publisher: null, listings: [], subs: [], events: [], seq: 0 };

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

const days = (n: number) => { const d = new Date(); d.setDate(d.getDate() + n); return d.toISOString(); };
function logEvent(e: Omit<BillingEvent, "seq">) {
  set({ events: [{ ...e, seq: state.seq + 1 }, ...state.events].slice(0, 100) });
}

/* ----------------------------- publisher (Phase 4) ---------------------- */
export function registerPublisher(name: string, type: "individual" | "organization") {
  set({ publisher: { id: "pub-me", name, type, verified: false } });
}
export function verifyPublisher() {
  if (state.publisher) set({ publisher: { ...state.publisher, verified: true } });
}

/* ----------------------------- listings (Phase 4) ----------------------- */
export function publishListing(listing: Listing) {
  set({ listings: [{ ...listing, status: "submitted" }, ...state.listings] });
}
export function updateListing(id: string, patch: Partial<Listing>) {
  set({ listings: state.listings.map((l) => (l.id === id ? { ...l, ...patch } : l)) });
}

/* ----------------------------- billing (Phase 5) ------------------------ */
export function subscribe(listing: Listing, plan: PricingPlan, billingCycle: "monthly" | "yearly", seats?: number) {
  const existing = state.subs.find((s) => s.slug === listing.slug && s.status !== "canceled");
  if (existing) return existing.id;
  const trialing = plan.hasFreeTrial && plan.type !== "free";
  const sub: Sub = {
    id: "sub-" + (state.seq + 1), slug: listing.slug, listingName: listing.name, planId: plan.id,
    planName: typeof plan.name === "object" ? plan.name.en : String(plan.name), planType: plan.type,
    status: trialing ? "trialing" : "active", billingCycle, priceMonthly: plan.priceMonthly, priceYearly: plan.priceYearly,
    seats, startedAt: new Date().toISOString(), currentPeriodEnd: trialing ? days(plan.trialDays) : days(billingCycle === "yearly" ? 365 : 30),
  };
  set({ subs: [sub, ...state.subs] });
  logEvent({ action: "purchased", listingName: listing.name, planName: sub.planName, effectiveDate: sub.startedAt, detail: trialing ? `trial ${plan.trialDays}d → ${plan.type}` : plan.type === "free" ? "free install" : "paid" });
  return sub.id;
}

/** Upgrade applies immediately; downgrade applies at period end. */
export function changeSub(subId: string, toPlan: PricingPlan, billingCycle: "monthly" | "yearly") {
  const sub = state.subs.find((s) => s.id === subId);
  if (!sub) return;
  const curPrice = sub.billingCycle === "yearly" ? sub.priceYearly : sub.priceMonthly;
  const newPrice = billingCycle === "yearly" ? toPlan.priceYearly : toPlan.priceMonthly;
  const planName = typeof toPlan.name === "object" ? toPlan.name.en : String(toPlan.name);
  const isUpgrade = newPrice >= curPrice;
  if (isUpgrade) {
    set({ subs: state.subs.map((s) => s.id === subId ? { ...s, planId: toPlan.id, planName, planType: toPlan.type, billingCycle, priceMonthly: toPlan.priceMonthly, priceYearly: toPlan.priceYearly, status: "active", pendingChange: undefined } : s) });
    logEvent({ action: "changed", listingName: sub.listingName, planName, effectiveDate: new Date().toISOString(), detail: "upgrade · effective now" });
  } else {
    const eff = sub.currentPeriodEnd;
    set({ subs: state.subs.map((s) => s.id === subId ? { ...s, pendingChange: { planId: toPlan.id, planName, billingCycle, effectiveDate: eff } } : s) });
    logEvent({ action: "pending_change", listingName: sub.listingName, planName, effectiveDate: eff, detail: "downgrade · end of cycle" });
  }
}

export function cancelSub(subId: string) {
  const sub = state.subs.find((s) => s.id === subId);
  if (!sub) return;
  set({ subs: state.subs.map((s) => s.id === subId ? { ...s, status: "canceled" } : s) });
  logEvent({ action: "cancelled", listingName: sub.listingName, planName: sub.planName, effectiveDate: sub.currentPeriodEnd, detail: "access until period end" });
}

/* ----------------------------- hooks ------------------------------------ */
function useStore<T>(sel: (s: State) => T): T {
  return useSyncExternalStore((cb) => { listeners.add(cb); return () => listeners.delete(cb); }, () => sel(state), () => sel(EMPTY));
}
export const usePublisher = () => useStore((s) => s.publisher);
export const useMyListings = () => useStore((s) => s.listings);
export const useSubscriptions = () => useStore((s) => s.subs);
export const useBillingEvents = () => useStore((s) => s.events);
export const useSubFor = (slug: string) => useStore((s) => s.subs.find((x) => x.slug === slug && x.status !== "canceled"));

export function snapshotPublisher() { return state.publisher; }
