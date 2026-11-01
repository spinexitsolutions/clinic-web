"use client";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Quote, Star } from "lucide-react";
import type { Testimonial } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Img } from "../Img";
import { heading as headingFor } from "@/lib/headings";
import type { SectionHeading } from "@/lib/types";

const ease = [0.22, 1, 0.36, 1] as const;

const KEYFRAMES = `
@keyframes solace-vup { from { transform: translateY(0) } to { transform: translateY(-50%) } }
@keyframes solace-vdown { from { transform: translateY(-50%) } to { transform: translateY(0) } }
@keyframes solace-hleft { from { transform: translateX(0) } to { transform: translateX(-50%) } }
.solace-wall:hover .solace-track { animation-play-state: paused }
`;

function Card({ t }: { t: Testimonial }) {
  return (
    <figure className="rounded-[calc(var(--radius)*0.8)] bg-white p-6 shadow-[inset_0_0_0_1px_var(--line)]">
      <div className="flex items-center justify-between">
        <div className="flex gap-0.5 text-[#F5A524]">
          {Array.from({ length: t.rating }).map((_, k) => (
            <Star key={k} className="h-3.5 w-3.5 fill-current" strokeWidth={0} />
          ))}
        </div>
        <Quote className="h-5 w-5 text-accent/25" />
      </div>
      <blockquote className="mt-4 font-sans text-[16px] leading-relaxed text-ink/85">{t.quote}</blockquote>
      <figcaption className="mt-6 flex items-center gap-3">
        <span className="relative h-10 w-10 overflow-hidden rounded-full">
          <Img src={t.image} alt={t.name} fill sizes="40px" className="object-cover" />
        </span>
        <span className="leading-tight">
          <span className="block text-[14px] font-semibold">{t.name}</span>
          <span className="text-[12.5px] text-muted">{t.role}</span>
        </span>
      </figcaption>
    </figure>
  );
}

function Column({ items, dir, duration }: { items: Testimonial[]; dir: "up" | "down"; duration: number }) {
  const list = [...items, ...items];
  return (
    <div className="relative h-full overflow-hidden">
      <div className="solace-track flex flex-col gap-4" style={{ animation: `${dir === "up" ? "solace-vup" : "solace-vdown"} ${duration}s linear infinite` }}>
        {list.map((t, i) => (
          <Card key={`${t.id}-${i}`} t={t} />
        ))}
      </div>
    </div>
  );
}

const DEFAULT_BREAKDOWN = [89, 8, 2, 0.6, 0.4];

/** Wall of voices: rating summary + endlessly drifting review columns. */
export function Testimonials({
  items,
  rating = "4.9",
  reviewCount = "3,200+",
  breakdown = DEFAULT_BREAKDOWN,
  heading,
}: {
  heading?: Partial<SectionHeading>;
  items: Testimonial[];
  rating?: string;
  reviewCount?: string;
  /** percentages for 5★ → 1★ */
  breakdown?: number[];
}) {
  const H = headingFor("testimonials", heading);
  const DIST = [5, 4, 3, 2, 1].map((stars, i) => ({ stars, pct: Math.max(0, Math.min(100, Number(breakdown[i]) || 0)) }));
  const ref = useRef<HTMLDivElement>(null);
  const go = useInView(ref, { once: true, margin: "0px 0px -15% 0px" });
  if (!items.length) return null;

  // spread items into columns; repeat when there are few
  const pool = items.length < 6 ? [...items, ...items] : items;
  const cols: Testimonial[][] = [[], [], []];
  pool.forEach((t, i) => cols[i % 3].push(t));

  return (
    <section className="py-20 md:py-32">
      <style>{KEYFRAMES}</style>
      <div ref={ref} className="container-x grid gap-12 lg:grid-cols-12 lg:gap-10">
        {/* rating summary */}
        <div className="lg:col-span-4">
          <p className="eyebrow">{H.eyebrow}</p>
          <h2 className="mt-4 text-[clamp(2.3rem,5vw,4.2rem)] font-semibold leading-[0.95] tracking-[-0.035em]">
            {H.title} <span className="serif-accent text-accent">{H.accent}</span>
          </h2>

          <div className="mt-10 rounded-[var(--radius)] bg-ink p-6 text-bg md:p-8">
            <div className="flex items-end gap-4">
              <span className="font-display text-[84px] font-semibold leading-[0.8] tracking-[-0.05em]">{rating}</span>
              <span className="pb-1">
                <span className="flex gap-0.5 text-highlight">
                  {Array.from({ length: 5 }).map((_, k) => (
                    <Star key={k} className="h-4 w-4 fill-current" strokeWidth={0} />
                  ))}
                </span>
                <span className="mt-1.5 block text-[13px] text-bg/60">{reviewCount} Google reviews</span>
              </span>
            </div>
            <ul className="mt-8 space-y-2.5">
              {DIST.map((d, i) => (
                <li key={d.stars} className="flex items-center gap-3 text-[12px] tabular-nums text-bg/60">
                  <span className="w-3">{d.stars}</span>
                  <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-bg/10">
                    <motion.span
                      className="block h-full origin-left rounded-full bg-highlight"
                      style={{ width: `${Math.max(d.pct, 1.5)}%` }}
                      initial={{ scaleX: 0 }}
                      animate={go ? { scaleX: 1 } : undefined}
                      transition={{ duration: 1.4, ease, delay: 0.2 + i * 0.08 }}
                    />
                  </span>
                  <span className="w-9 text-right">{d.pct}%</span>
                </li>
              ))}
            </ul>
            <p className="mt-8 border-t border-bg/10 pt-5 text-[13px] leading-relaxed text-bg/55">
              Every review is from a verified visit. We reply to every single one — the good and the hard.
            </p>
          </div>
        </div>

        {/* wall — desktop */}
        <div className="solace-wall relative hidden h-[680px] grid-cols-3 gap-4 [mask-image:linear-gradient(180deg,transparent,black_12%,black_88%,transparent)] lg:col-span-8 lg:grid">
          <Column items={cols[0]} dir="up" duration={38} />
          <Column items={cols[1]} dir="down" duration={44} />
          <Column items={cols[2]} dir="up" duration={41} />
        </div>
      </div>

      {/* wall — mobile/tablet */}
      <div className="solace-wall mt-10 overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_6%,black_94%,transparent)] lg:hidden">
        <div className="solace-track flex w-max gap-4 px-5" style={{ animation: `solace-hleft ${items.length * 8}s linear infinite` }}>
          {[...items, ...items].map((t, i) => (
            <div key={`${t.id}-${i}`} className={cn("w-[82vw] max-w-[360px] shrink-0")}>
              <Card t={t} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
