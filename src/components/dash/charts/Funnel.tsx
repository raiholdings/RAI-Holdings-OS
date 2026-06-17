"use client";

import type { FunnelStage } from "@/lib/dashboard";
import { useLang } from "@/lib/i18n";

export function Funnel({ stages }: { stages: FunnelStage[] }) {
  const { tr } = useLang();
  const max = Math.max(...stages.map((s) => s.count), 1);
  return (
    <ul className="grid gap-2">
      {stages.map((s) => {
        const pct = (s.count / max) * 100;
        return (
          <li key={tr(s.stage)} className="flex items-center gap-3">
            <span className="w-28 flex-none text-[0.82rem] text-text-2">{tr(s.stage)}</span>
            <div className="relative h-8 flex-1 overflow-hidden rounded-[var(--radius-sm)] bg-bg">
              <div className="flex h-full items-center rounded-[var(--radius-sm)] bg-accent px-3 text-[0.78rem] font-medium text-white" style={{ width: `${Math.max(pct, 14)}%` }}>
                {s.count}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
