"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import type { HomeMetrics } from "@/lib/home";

type Ctx = { metrics: HomeMetrics; updatedAt: Date; stale: boolean };
const LiveContext = createContext<Ctx | null>(null);

/**
 * Fetches /api/home/metrics once (seeded with SSR data to avoid layout shift),
 * then polls every 20s. On error it keeps the last good payload and flags stale —
 * the page never breaks (SPEC §3.3 fallback).
 */
export function LiveProvider({ initial, children }: { initial: HomeMetrics; children: ReactNode }) {
  const [metrics, setMetrics] = useState<HomeMetrics>(initial);
  const [updatedAt, setUpdatedAt] = useState<Date>(() => new Date(initial.generatedAt));
  const [stale, setStale] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let alive = true;
    async function poll() {
      try {
        const res = await fetch("/api/home/metrics", { cache: "no-store" });
        if (!res.ok) throw new Error("bad status");
        const data = (await res.json()) as HomeMetrics;
        if (!alive) return;
        setMetrics(data); setUpdatedAt(new Date(data.generatedAt)); setStale(false);
      } catch {
        if (alive) setStale(true); // keep last good metrics
      }
    }
    timer.current = setInterval(poll, 20000);
    return () => { alive = false; if (timer.current) clearInterval(timer.current); };
  }, []);

  return <LiveContext.Provider value={{ metrics, updatedAt, stale }}>{children}</LiveContext.Provider>;
}

export function useHomeMetrics(): Ctx {
  const ctx = useContext(LiveContext);
  if (!ctx) throw new Error("useHomeMetrics must be used within LiveProvider");
  return ctx;
}
