export type BarItem = { label: string; value: number; max: number; hint?: string };

export function BarRows({ items, tone = "var(--color-holdings)" }: { items: BarItem[]; tone?: string }) {
  return (
    <ul className="grid gap-3.5">
      {items.map((it) => {
        const pct = Math.round((it.value / (it.max || 1)) * 100);
        return (
          <li key={it.label}>
            <div className="mb-1.5 flex items-baseline justify-between gap-3 text-[0.85rem]">
              <span className="text-text">{it.label}</span>
              <span className="mono text-text-2">{it.hint ?? `${it.value}/${it.max}`} · {pct}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-[var(--radius-sm)] bg-bg">
              <div className="h-full rounded-[var(--radius-sm)]" style={{ width: `${pct}%`, background: tone }} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
