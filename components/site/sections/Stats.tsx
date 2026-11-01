"use client";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { BadgeCheck, Clock } from "lucide-react";
import { Counter } from "@/components/motion/Counter";
import type { HomeContent } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Img } from "../Img";
import { heading as headingFor } from "@/lib/headings";
import type { SectionHeading } from "@/lib/types";

const ease = [0.22, 1, 0.36, 1] as const;
type Stat = HomeContent["stats"][number];

const DEFAULT_AVATARS = [
  "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d",
  "https://images.unsplash.com/photo-1559839734-2b71ea197ec2",
  "https://images.unsplash.com/photo-1622253692010-333f2da6031d",
  "https://images.unsplash.com/photo-1594824476967-48c8b964273f",
  "https://images.unsplash.com/photo-1651008376811-b90baee60c1f",
];

function Tile({ className, children, delay = 0, go }: { className?: string; children: React.ReactNode; delay?: number; go: boolean }) {
  return (
    <motion.div
      className={cn("relative flex min-h-[220px] flex-col overflow-hidden rounded-[var(--radius)] p-6 md:min-h-[260px] md:p-7", className)}
      initial={{ opacity: 0, y: 28 }}
      animate={go ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 1, ease, delay }}
    >
      {children}
    </motion.div>
  );
}

function Sparkline({ go }: { go: boolean }) {
  const pts = [8, 12, 11, 17, 22, 21, 29, 35, 33, 44, 52, 58, 66, 78, 92];
  const w = 300;
  const h = 100;
  const step = w / (pts.length - 1);
  const line = pts.map((v, i) => `${i === 0 ? "M" : "L"}${(i * step).toFixed(1)} ${(h - v).toFixed(1)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="absolute inset-x-0 bottom-0 h-[55%] w-full" aria-hidden>
      <defs>
        <linearGradient id="spark-fill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.28" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <motion.path
        d={`${line} L${w} ${h} L0 ${h} Z`}
        fill="url(#spark-fill)"
        initial={{ opacity: 0 }}
        animate={go ? { opacity: 1 } : undefined}
        transition={{ duration: 1.2, delay: 1 }}
      />
      <motion.path
        d={line}
        fill="none"
        stroke="var(--accent)"
        strokeWidth="2.5"
        vectorEffect="non-scaling-stroke"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={go ? { pathLength: 1 } : undefined}
        transition={{ duration: 2, ease, delay: 0.3 }}
      />
    </svg>
  );
}

function Gauge({ go, minutes, cityAvg }: { go: boolean; minutes: number; cityAvg: number }) {
  const frac = Math.min(1, minutes / cityAvg);
  return (
    <svg viewBox="0 0 200 110" className="w-full max-w-[220px]" aria-hidden>
      <path d="M20 100 A80 80 0 0 1 180 100" fill="none" stroke="color-mix(in oklab, var(--accent-ink) 18%, transparent)" strokeWidth="14" strokeLinecap="round" />
      <motion.path
        d="M20 100 A80 80 0 0 1 180 100"
        fill="none"
        stroke="var(--highlight)"
        strokeWidth="14"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={go ? { pathLength: frac } : undefined}
        transition={{ duration: 1.8, ease, delay: 0.4 }}
      />
      <motion.line
        x1="100"
        y1="100"
        x2="100"
        y2="34"
        stroke="var(--accent-ink)"
        strokeWidth="3"
        strokeLinecap="round"
        style={{ originX: "100px", originY: "100px" }}
        initial={{ rotate: -90 }}
        animate={go ? { rotate: -90 + frac * 180 } : undefined}
        transition={{ duration: 1.8, ease, delay: 0.4 }}
      />
      <circle cx="100" cy="100" r="7" fill="var(--accent-ink)" />
    </svg>
  );
}

function Ring({ go, pct }: { go: boolean; pct: number }) {
  return (
    <svg viewBox="0 0 120 120" className="h-28 w-28 -rotate-90 md:h-32 md:w-32" aria-hidden>
      <circle cx="60" cy="60" r="50" fill="none" stroke="var(--line)" strokeWidth="10" />
      <motion.circle
        cx="60"
        cy="60"
        r="50"
        fill="none"
        stroke="var(--accent)"
        strokeWidth="10"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={go ? { pathLength: pct / 100 } : undefined}
        transition={{ duration: 2, ease, delay: 0.5 }}
      />
    </svg>
  );
}

/** Data-viz bento: each number gets its own small, honest visual. */
export function Stats({
  stats,
  avatars = DEFAULT_AVATARS,
  waitMinutes = 7,
  cityAvgWait = 35,
  growthBadge = "+18% this year",
  recommendSource = "Post-visit survey, last 12 months",
  accreditations = ["NABH Accredited", "NABL Certified Lab", "ISO 9001:2015"],
  accreditationTitle = { title: "Certified to the", accent: "highest national standards." },
  heading,
}: {
  accreditationTitle?: { title: string; accent: string };
  heading?: Partial<SectionHeading>;
  stats: HomeContent["stats"];
  avatars?: string[];
  waitMinutes?: number;
  cityAvgWait?: number;
  growthBadge?: string;
  recommendSource?: string;
  accreditations?: string[];
}) {
  const H = headingFor("stats", heading);
  const ref = useRef<HTMLDivElement>(null);
  const go = useInView(ref, { once: true, margin: "0px 0px -15% 0px" });

  const pctStat = stats.find((s) => s.suffix.includes("%"));
  const others = stats.filter((s) => s !== pctStat);
  const big: Stat | undefined = others[0];
  const team: Stat | undefined = others[1];
  const specs: Stat | undefined = others[2];

  return (
    <section className="container-x py-20 md:py-32">
      <div className="mb-10 flex flex-col gap-4 md:mb-14 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="eyebrow">{H.eyebrow}</p>
          <h2 className="mt-4 text-[clamp(2.3rem,5.4vw,4.6rem)] font-semibold leading-[0.95] tracking-[-0.035em]">
            {H.title} <span className="serif-accent text-accent">{H.accent}</span>
          </h2>
        </div>
        <p className="max-w-sm text-[16px] leading-relaxed text-muted">{H.intro}</p>
      </div>

      <div ref={ref} className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
        {/* patients + growth */}
        {big && (
          <Tile go={go} className="col-span-2 bg-white shadow-[inset_0_0_0_1px_var(--line)]">
            <div className="relative z-10 flex items-start justify-between gap-4">
              <div>
                <p className="text-[14px] font-medium text-muted">{big.label}</p>
                <Counter value={big.value} suffix={big.suffix} className="mt-2 block font-display text-[clamp(3rem,7vw,5.6rem)] font-semibold leading-none tracking-[-0.045em] tabular-nums" />
              </div>
              {growthBadge && <span className="rounded-full bg-accent-soft px-3 py-1 text-[12px] font-semibold text-accent">{growthBadge}</span>}
            </div>
            <Sparkline go={go} />
            <div className="relative z-10 mt-auto flex justify-between pt-24 text-[11px] font-medium text-muted">
              <span>2014</span>
              <span>Today</span>
            </div>
          </Tile>
        )}

        {/* wait gauge */}
        <Tile go={go} delay={0.08} className="bg-accent text-accent-ink">
          <div className="flex items-center justify-between">
            <p className="text-[14px] font-medium text-accent-ink/80">Average wait</p>
            <Clock className="h-4 w-4 text-accent-ink/70" />
          </div>
          <div className="mt-auto flex flex-col items-center">
            <Gauge go={go} minutes={waitMinutes} cityAvg={Math.max(1, cityAvgWait)} />
            <p className="-mt-2 font-display text-[40px] font-semibold leading-none tracking-[-0.04em]">
              {waitMinutes}
              <span className="text-[18px] font-medium"> min</span>
            </p>
            <p className="mt-1.5 text-[12px] text-accent-ink/70">City average: {cityAvgWait} min</p>
          </div>
        </Tile>

        {/* recommend ring */}
        <Tile go={go} delay={0.16} className="bg-white shadow-[inset_0_0_0_1px_var(--line)]">
          <p className="text-[14px] font-medium text-muted">{pctStat?.label ?? "Would recommend us"}</p>
          <div className="relative mt-auto grid place-items-center">
            <Ring go={go} pct={pctStat?.value ?? 98} />
            <span className="absolute font-display text-[30px] font-semibold tracking-[-0.04em]">
              <Counter value={pctStat?.value ?? 98} suffix="%" />
            </span>
          </div>
          <p className="mt-4 text-center text-[12px] text-muted">{recommendSource}</p>
        </Tile>

        {/* team avatars */}
        {team && (
          <Tile go={go} delay={0.1} className="bg-white shadow-[inset_0_0_0_1px_var(--line)]">
            <p className="text-[14px] font-medium text-muted">{team.label}</p>
            <Counter value={team.value} suffix={team.suffix} className="mt-2 block font-display text-[56px] font-semibold leading-none tracking-[-0.045em]" />
            <div className="mt-auto flex -space-x-3 pt-6">
              {avatars.slice(0, 5).map((a, i) => (
                <motion.span
                  key={a + i}
                  className="relative h-11 w-11 overflow-hidden rounded-full ring-[3px] ring-white"
                  initial={{ opacity: 0, x: -12 }}
                  animate={go ? { opacity: 1, x: 0 } : undefined}
                  transition={{ duration: 0.6, ease, delay: 0.5 + i * 0.07 }}
                >
                  <Img src={a} alt="" fill sizes="44px" className="object-cover" />
                </motion.span>
              ))}
              <span className="relative grid h-11 w-11 place-items-center rounded-full bg-ink text-[12px] font-semibold text-bg ring-[3px] ring-white">
                +{Math.max(0, team.value - Math.min(5, avatars.length))}
              </span>
            </div>
          </Tile>
        )}

        {/* specialties */}
        {specs && (
          <Tile go={go} delay={0.18} className="bg-accent-soft">
            <p className="text-[14px] font-medium text-accent">{specs.label}</p>
            <Counter value={specs.value} suffix={specs.suffix} className="mt-2 block font-display text-[56px] font-semibold leading-none tracking-[-0.045em] text-accent" />
            <div className="mt-auto grid grid-cols-6 gap-1.5 pt-6">
              {Array.from({ length: specs.value }).map((_, i) => (
                <motion.span
                  key={i}
                  className="aspect-square rounded-full bg-accent"
                  initial={{ scale: 0 }}
                  animate={go ? { scale: 1 } : undefined}
                  transition={{ type: "spring", stiffness: 300, damping: 18, delay: 0.5 + i * 0.04 }}
                />
              ))}
            </div>
          </Tile>
        )}

        {/* accreditation */}
        <Tile go={go} delay={0.26} className="col-span-2 bg-ink text-bg">
          <div className="flex items-start justify-between gap-4">
            <p className="max-w-[18ch] font-display text-[26px] font-semibold leading-[1.05] tracking-[-0.03em] md:text-[32px]">
              {accreditationTitle.title} <span className="serif-accent text-highlight">{accreditationTitle.accent}</span>
            </p>
            <BadgeCheck className="h-8 w-8 shrink-0 text-highlight" strokeWidth={1.5} />
          </div>
          <div className="mt-auto flex flex-wrap gap-2 pt-8">
            {accreditations.map((a, i) => (
              <motion.span
                key={a}
                className="rounded-full border border-bg/15 px-4 py-2 text-[13px] font-medium text-bg/85"
                initial={{ opacity: 0, y: 10 }}
                animate={go ? { opacity: 1, y: 0 } : undefined}
                transition={{ duration: 0.6, ease, delay: 0.6 + i * 0.08 }}
              >
                {a}
              </motion.span>
            ))}
          </div>
        </Tile>
      </div>
    </section>
  );
}
