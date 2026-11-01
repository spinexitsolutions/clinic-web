export function BarChart({ data }: { data: { label: string; value: number; highlight?: boolean }[] }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const W = 560;
  const H = 180;
  const gap = 8;
  const bw = (W - gap * (data.length - 1)) / data.length;
  return (
    <svg viewBox={`0 0 ${W} ${H + 26}`} className="h-auto w-full" role="img" aria-label="Appointments per day">
      {[0.25, 0.5, 0.75, 1].map((t) => (
        <line key={t} x1="0" x2={W} y1={H - H * t} y2={H - H * t} stroke="currentColor" className="text-black/[0.06]" strokeDasharray="3 5" />
      ))}
      {data.map((d, i) => {
        const h = Math.max(4, (d.value / max) * (H - 18));
        const x = i * (bw + gap);
        return (
          <g key={i}>
            <rect x={x} y={H - h} width={bw} height={h} rx={Math.min(8, bw / 2)} className={d.highlight ? "fill-accent" : "fill-[color-mix(in_oklab,var(--accent)_22%,white)]"}>
              <title>{`${d.label}: ${d.value}`}</title>
            </rect>
            {d.value > 0 && (
              <text x={x + bw / 2} y={H - h - 6} textAnchor="middle" className="fill-ink/60 font-mono text-[10px]">
                {d.value}
              </text>
            )}
            <text x={x + bw / 2} y={H + 18} textAnchor="middle" className="fill-ink/40 font-mono text-[9px]">
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function Donut({ segments, centerLabel, centerValue }: { segments: { label: string; value: number; color: string }[]; centerLabel: string; centerValue: string }) {
  const total = Math.max(1, segments.reduce((s, x) => s + x.value, 0));
  const r = 52;
  const c = 2 * Math.PI * r;
  let acc = 0;
  return (
    <div className="flex items-center gap-6">
      <svg viewBox="0 0 140 140" className="size-36 shrink-0 -rotate-90">
        <circle cx="70" cy="70" r={r} fill="none" stroke="currentColor" strokeWidth="14" className="text-black/[0.05]" />
        {segments.map((s) => {
          const len = (s.value / total) * c;
          const el = (
            <circle key={s.label} cx="70" cy="70" r={r} fill="none" stroke={s.color} strokeWidth="14" strokeDasharray={`${Math.max(0, len - 3)} ${c}`} strokeDashoffset={-acc} strokeLinecap="round">
              <title>{`${s.label}: ${s.value}`}</title>
            </circle>
          );
          acc += len;
          return el;
        })}
        <g className="rotate-90" style={{ transformOrigin: "70px 70px" }}>
          <text x="70" y="68" textAnchor="middle" className="fill-ink text-[24px] font-medium tracking-tight">{centerValue}</text>
          <text x="70" y="86" textAnchor="middle" className="fill-ink/45 font-mono text-[8px] uppercase tracking-widest">{centerLabel}</text>
        </g>
      </svg>
      <ul className="space-y-2 text-sm">
        {segments.map((s) => (
          <li key={s.label} className="flex items-center gap-2.5">
            <span className="size-2.5 rounded-full" style={{ background: s.color }} />
            <span className="capitalize text-muted">{s.label}</span>
            <span className="ml-auto pl-4 font-mono text-xs">{s.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Sparkline({ values }: { values: number[] }) {
  const max = Math.max(1, ...values);
  const pts = values.map((v, i) => `${(i / Math.max(1, values.length - 1)) * 100},${30 - (v / max) * 26}`).join(" ");
  return (
    <svg viewBox="0 0 100 32" preserveAspectRatio="none" className="h-8 w-full">
      <polyline points={pts} fill="none" stroke="var(--accent)" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
