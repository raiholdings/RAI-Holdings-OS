/**
 * RAI brandmark — geometric R with an embedded upward arrow + diagonal slash,
 * pointing up-and-right. Wordmark: "RAI" always ALL CAPS.
 */
export function Logo({ wordmark = true, size = 28 }: { wordmark?: boolean; size?: number }) {
  return (
    <span className="flex items-center gap-2.5">
      <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" className="flex-none">
        <rect width="32" height="32" rx="2" fill="var(--color-accent)" />
        {/* geometric R + upward arrow, in white */}
        <g fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="square">
          <path d="M11 24V8h6.5a4 4 0 0 1 0 8H11" />
          <path d="M15.5 16L23 24" />
          {/* embedded up-right arrow */}
          <path d="M19 9h4v4" strokeWidth="2" />
          <path d="M16.5 13.5L23 9" strokeWidth="2" />
        </g>
      </svg>
      {wordmark && (
        <span className="flex flex-col leading-none">
          <span className="font-[family-name:var(--font-display)] text-[0.95rem] font-medium tracking-tight text-text">
            <span className="tracking-[0.02em]">RAI</span> Holdings
          </span>
          <span className="mono mt-0.5 text-[0.6rem] text-text-2">OPERATING SYSTEM</span>
        </span>
      )}
    </span>
  );
}
