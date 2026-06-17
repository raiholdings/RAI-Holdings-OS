"use client";

import type { Kpi } from "@/lib/dashboard";
import { toneVar } from "./tone";
import { useLang } from "@/lib/i18n";
import { cn } from "@/lib/cn";

export function KpiCard({ kpi }: { kpi: Kpi }) {
  const { tr } = useLang();
  const color = toneVar[kpi.tone ?? "holdings"];
  return (
    <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[0.82rem] text-text-2">{tr(kpi.label)}</p>
        {kpi.trend && (
          <span
            className={cn("mono rounded-[var(--radius-sm)] px-1.5 py-0.5 text-[0.68rem]")}
            style={{ color: kpi.trend.positive ? "var(--color-ok)" : "var(--color-err)" }}
          >
            {kpi.trend.positive ? "▲" : "▼"} {kpi.trend.delta}
          </span>
        )}
      </div>
      <div className="mt-2 font-[family-name:var(--font-display)] text-[1.9rem] font-medium leading-none" style={{ color }}>
        {kpi.value}
      </div>
      {kpi.sub && <p className="mt-2 text-[0.78rem] text-text-2">{tr(kpi.sub)}</p>}
    </div>
  );
}
