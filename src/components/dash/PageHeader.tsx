"use client";

import type { ReactNode } from "react";
import { useLang, type T } from "@/lib/i18n";

export function PageHeader({
  label,
  title,
  desc,
  action,
}: {
  label: T;
  title: T;
  desc?: T;
  action?: ReactNode;
}) {
  const { tr } = useLang();
  return (
    <header className="mb-7 flex flex-wrap items-end justify-between gap-4">
      <div className="max-[1024px]:pl-12">
        <span className="accent-rule mb-3 text-accent" />
        <span className="label text-text-2">{tr(label)}</span>
        <h1 className="mt-1.5 font-[family-name:var(--font-display)] text-[clamp(1.4rem,3vw,1.9rem)] font-medium text-text">{tr(title)}</h1>
        {desc && <p className="mt-1.5 max-w-2xl text-[0.9rem] text-text-2">{tr(desc)}</p>}
      </div>
      {action && <div className="flex items-center gap-2">{action}</div>}
    </header>
  );
}

export function PeriodPill() {
  return <span className="mono rounded-[var(--radius-md)] border border-border bg-surface px-3.5 py-2 text-[0.74rem] text-text-2">Q1 // 2026</span>;
}
