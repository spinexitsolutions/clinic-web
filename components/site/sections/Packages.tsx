"use client";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight, Check, FileText, Home, Stethoscope } from "lucide-react";
import type { Package } from "@/lib/types";
import { cn, money } from "@/lib/utils";
import { SplitWords } from "@/components/motion/Reveal";
import { heading as headingFor } from "@/lib/headings";
import type { SectionHeading } from "@/lib/types";

const ease = [0.22, 1, 0.36, 1] as const;

const STEP_ICONS = [Home, FileText, Stethoscope];
const DEFAULT_STEPS = [
  { title: "Home collection", text: "From 6 AM, at your door" },
  { title: "Reports in 6 hrs", text: "Straight to your phone" },
  { title: "Doctor review", text: "Every number explained" },
];

/** "Compare checkups" explorer: tabs + one morphing detail panel. */
export function PackageGrid({ packages, currency, steps = DEFAULT_STEPS }: { packages: Package[]; currency: string; steps?: { title: string; text: string }[] }) {
  const sorted = [...packages].sort((a, b) => a.order - b.order);
  const initial = sorted.find((p) => p.highlighted)?.id ?? sorted[0]?.id;
  const [active, setActive] = useState(initial);
  const p = sorted.find((x) => x.id === active) ?? sorted[0];
  if (!p) return null;
  const save = p.compareAt > p.price ? Math.round(((p.compareAt - p.price) / p.compareAt) * 100) : 0;

  return (
    <LayoutGroup>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,380px)_1fr] lg:gap-6">
        {/* tabs */}
        <div role="tablist" className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 lg:mx-0 lg:flex-col lg:gap-3 lg:overflow-visible lg:px-0">
          {sorted.map((x, i) => {
            const on = x.id === p.id;
            return (
              <button
                key={x.id}
                role="tab"
                aria-selected={on}
                onClick={() => setActive(x.id)}
                className={cn(
                  "relative shrink-0 rounded-[calc(var(--radius)*0.8)] p-4 text-left transition-colors duration-500 lg:p-6",
                  on ? "text-bg" : "bg-white text-ink shadow-[inset_0_0_0_1px_var(--line)] hover:bg-accent-soft",
                )}
              >
                {on && <motion.span layoutId="pkg-tab" className="absolute inset-0 rounded-[calc(var(--radius)*0.8)] bg-ink" transition={{ duration: 0.6, ease }} />}
                <span className="relative flex items-center gap-4 lg:justify-between">
                  <span>
                    <span className={cn("block text-[11px] font-semibold uppercase tracking-[0.14em]", on ? "text-highlight" : "text-muted")}>
                      0{i + 1}
                      {x.highlighted ? " · Most booked" : ""}
                    </span>
                    <span className="mt-1 block whitespace-nowrap font-display text-[20px] font-semibold tracking-[-0.025em] lg:text-[26px]">{x.name}</span>
                  </span>
                  <span className={cn("whitespace-nowrap font-display text-[17px] font-semibold tabular-nums lg:text-[22px]", on ? "text-bg" : "text-ink/70")}>
                    {money(x.price, currency)}
                  </span>
                </span>
                <span className={cn("relative mt-2 hidden text-[14px] leading-snug lg:block", on ? "text-bg/60" : "text-muted")}>{x.tagline}</span>
              </button>
            );
          })}
        </div>

        {/* detail panel */}
        <motion.div layout transition={{ layout: { duration: 0.6, ease } }} className="relative overflow-hidden rounded-[var(--radius)] bg-white shadow-[inset_0_0_0_1px_var(--line)]">
          <AnimatePresence mode="wait">
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.45, ease }}
              className="grid gap-8 p-6 md:p-10 xl:grid-cols-[1fr_1.1fr] xl:gap-12"
            >
              <div className="flex flex-col">
                <div className="flex flex-wrap items-center gap-2">
                  {save > 0 && <span className="rounded-full bg-highlight px-3 py-1 text-[12px] font-semibold text-ink">Save {save}%</span>}
                  <span className="rounded-full bg-accent-soft px-3 py-1 text-[12px] font-semibold text-accent">{p.features.length} inclusions</span>
                </div>
                <h3 className="mt-6 text-[clamp(2rem,4vw,3.2rem)] font-semibold leading-none tracking-[-0.035em]">{p.name}</h3>
                <p className="mt-3 max-w-sm text-[16px] leading-relaxed text-muted">{p.tagline}</p>
                <div className="mt-8 flex items-end gap-3">
                  <span className="font-display text-[clamp(3.2rem,6vw,4.8rem)] font-semibold leading-[0.85] tracking-[-0.045em]">{money(p.price, currency)}</span>
                  {p.compareAt > p.price && <span className="pb-1 text-[16px] text-muted line-through">{money(p.compareAt, currency)}</span>}
                </div>
                <p className="mt-2 text-[13px] text-muted">All taxes included · Pay at visit</p>
                <Link href={`/book?package=${p.id}`} className="btn btn-accent mt-8 h-14 self-start px-7">
                  Book {p.name} <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="flex flex-col gap-8">
                <ul className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-1">
                  {p.features.map((f, i) => (
                    <motion.li
                      key={f}
                      className="flex items-center gap-3 rounded-2xl bg-bg px-4 py-3 text-[15px] font-medium"
                      initial={{ opacity: 0, x: 14 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, ease, delay: 0.1 + i * 0.05 }}
                    >
                      <motion.span
                        className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-accent text-accent-ink"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 400, damping: 18, delay: 0.2 + i * 0.05 }}
                      >
                        <Check className="h-3.5 w-3.5" strokeWidth={3} />
                      </motion.span>
                      {f}
                    </motion.li>
                  ))}
                </ul>

                <div>
                  <p className="eyebrow mb-4">What happens next</p>
                  <ol className="relative grid grid-cols-3 gap-2">
                    <span aria-hidden className="absolute left-[16%] right-[16%] top-5 h-px bg-line" />
                    <motion.span
                      aria-hidden
                      className="absolute left-[16%] top-5 h-px origin-left bg-accent"
                      style={{ right: "16%" }}
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: 1.2, ease, delay: 0.3 }}
                    />
                    {steps.slice(0, 3).map((s, k) => {
                      const StepIcon = STEP_ICONS[k] ?? Stethoscope;
                      return (
                      <li key={s.title + k} className="relative flex flex-col items-center text-center">
                        <span className="grid h-10 w-10 place-items-center rounded-full bg-white text-accent shadow-[inset_0_0_0_1px_var(--line)]">
                          <StepIcon className="h-4 w-4" />
                        </span>
                        <span className="mt-3 text-[13px] font-semibold leading-tight">{s.title}</span>
                        <span className="mt-1 text-[12px] leading-tight text-muted">{s.text}</span>
                      </li>
                      );
                    })}
                  </ol>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </LayoutGroup>
  );
}

export function Packages({ packages, currency, steps, heading }: { packages: Package[]; currency: string; steps?: { title: string; text: string }[]; heading?: Partial<SectionHeading> }) {
  const H = headingFor("packages", heading);
  return (
    <section className="container-x py-20 md:py-32">
      <div className="mb-10 flex flex-col gap-4 md:mb-14 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="eyebrow">{H.eyebrow}</p>
          <h2 className="mt-4 max-w-[16ch] text-[clamp(2.3rem,5.4vw,4.6rem)] font-semibold leading-[0.95] tracking-[-0.035em]">
            <SplitWords text={H.title} /> <span className="serif-accent text-accent"><SplitWords text={H.accent} delay={0.1} /></span>
          </h2>
        </div>
        <p className="max-w-sm text-[16px] leading-relaxed text-muted">{H.intro}</p>
      </div>
      <PackageGrid packages={packages} currency={currency} steps={steps} />
    </section>
  );
}
