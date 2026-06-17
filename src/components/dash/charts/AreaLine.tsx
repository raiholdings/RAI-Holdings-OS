/** Lightweight SVG area + line chart (no dependency, brand colors). */
export function AreaLine({ data, labels, height = 160 }: { data: number[]; labels?: string[]; height?: number }) {
  const w = 560;
  const h = height;
  const pad = 24;
  const max = Math.max(...data, 1);
  const stepX = (w - pad * 2) / (data.length - 1 || 1);
  const x = (i: number) => pad + i * stepX;
  const y = (v: number) => h - pad - (v / max) * (h - pad * 2);

  const linePath = data.map((v, i) => `${i === 0 ? "M" : "L"} ${x(i)} ${y(v)}`).join(" ");
  const areaPath = `${linePath} L ${x(data.length - 1)} ${h - pad} L ${x(0)} ${h - pad} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" preserveAspectRatio="none" role="img" aria-label="Trend">
      <defs>
        <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-holdings)" stopOpacity="0.14" />
          <stop offset="100%" stopColor="var(--color-holdings)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 0.5, 1].map((g) => (
        <line key={g} x1={pad} x2={w - pad} y1={pad + g * (h - pad * 2)} y2={pad + g * (h - pad * 2)} stroke="var(--color-border)" strokeWidth="1" />
      ))}
      <path d={areaPath} fill="url(#areaFill)" />
      <path d={linePath} fill="none" stroke="var(--color-holdings)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      {data.map((v, i) => (
        <circle key={i} cx={x(i)} cy={y(v)} r="2.5" fill="var(--color-surface)" stroke="var(--color-holdings)" strokeWidth="1.5" />
      ))}
      {labels &&
        labels.map((l, i) => (
          <text key={l + i} x={x(i)} y={h - 6} textAnchor="middle" fill="var(--color-text-2)" fontSize="9" fontFamily="var(--font-mono)">
            {l}
          </text>
        ))}
    </svg>
  );
}
