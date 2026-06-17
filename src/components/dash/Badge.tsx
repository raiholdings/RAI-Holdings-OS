import type { Tone } from "@/lib/dashboard";
import { toneVar } from "./tone";

/** Status pill — color from tone, subtle tinted background, brand radius. */
export function Badge({ children, tone = "holdings" }: { children: string; tone?: Tone }) {
  const color = toneVar[tone];
  return (
    <span
      className="mono inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] px-2 py-0.5 text-[0.7rem] uppercase"
      style={{ color, background: `color-mix(in srgb, ${color} 10%, transparent)` }}
    >
      <span className="size-1.5 rounded-full" style={{ background: color }} />
      {children}
    </span>
  );
}
