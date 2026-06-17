"use client";

import { useLang, type T } from "@/lib/i18n";

export type DonutSlice = { label: T; value: number; tone: string };

export function Donut({ data, unit = "" }: { data: DonutSlice[]; unit?: string }) {
  const { tr } = useLang();
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const r = 56;
  const c = 2 * Math.PI * r;
  let offset = 0;

  return (
    <div className="flex flex-wrap items-center gap-6">
      <svg viewBox="0 0 140 140" className="size-[140px] flex-none -rotate-90">
        <circle cx="70" cy="70" r={r} fill="none" stroke="var(--color-border)" strokeWidth="14" />
        {data.map((d) => {
          const dash = (d.value / total) * c;
          const seg = (
            <circle key={tr(d.label)} cx="70" cy="70" r={r} fill="none" stroke={d.tone} strokeWidth="14" strokeDasharray={`${dash} ${c - dash}`} strokeDashoffset={-offset} />
          );
          offset += dash;
          return seg;
        })}
        <text x="70" y="66" textAnchor="middle" transform="rotate(90 70 70)" fill="var(--color-text)" fontSize="20" fontWeight="500" fontFamily="var(--font-display)">
          {total.toLocaleString("en-US")}
        </text>
        <text x="70" y="84" textAnchor="middle" transform="rotate(90 70 70)" fill="var(--color-text-2)" fontSize="9" fontFamily="var(--font-mono)">
          {unit}
        </text>
      </svg>
      <ul className="grid flex-1 gap-2.5">
        {data.map((d) => (
          <li key={tr(d.label)} className="flex items-center gap-2.5 text-[0.84rem]">
            <span className="size-2.5 flex-none rounded-[1px]" style={{ background: d.tone }} />
            <span className="text-text-2">{tr(d.label)}</span>
            <span className="mono ml-auto text-text">{d.value.toLocaleString("en-US")} {unit}</span>
            <span className="mono w-10 text-right text-[0.74rem] text-text-2">{Math.round((d.value / total) * 100)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
