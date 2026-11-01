"use client";
import { AnimatePresence, motion, useMotionValue, useSpring } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight, Languages, Star } from "lucide-react";
import type { Doctor } from "@/lib/types";
import { Img } from "../Img";
import { useLabels } from "../SiteContext";
import { Reveal, SplitWords } from "@/components/motion/Reveal";
import { cn, money, timeLabel } from "@/lib/utils";
import { heading as headingFor } from "@/lib/headings";
import type { SectionHeading } from "@/lib/types";

const ease = [0.22, 1, 0.36, 1] as const;
export type NextSlots = Record<string, { date: string; time: string } | null>;

function whenLabel(n: { date: string; time: string } | null | undefined, t: ReturnType<typeof useLabels>) {
  if (!n) return { day: t("boardOnRequest"), time: "", today: false };
  const d = new Date(n.date + "T00:00:00");
  const now = new Date();
  const diff = Math.round((d.getTime() - new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()) / 864e5);
  return {
    day: diff === 0 ? t("today") : diff === 1 ? t("tomorrow") : d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric" }),
    time: timeLabel(n.time),
    today: diff === 0,
  };
}

/**
 * "On duty" board — the care team as a live roster with real next-free
 * slots. A portrait card trails the cursor across rows on desktop.
 */
export function DoctorsBoard({ doctors, nextSlots = {}, currency = "₹", heading }: { doctors: Doctor[]; nextSlots?: NextSlots; currency?: string; heading?: Partial<SectionHeading> }) {
  const H = headingFor("doctors", heading);
  const t = useLabels();
  const [hover, setHover] = useState<Doctor | null>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 260, damping: 28, mass: 0.6 });
  const sy = useSpring(y, { stiffness: 260, damping: 28, mass: 0.6 });
  const list = doctors.slice(0, 6);

  return (
    <section className="container-x py-20 md:py-32">
      <div className="mb-10 grid gap-6 md:mb-14 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-7">
          <p className="eyebrow flex items-center gap-3">
            {H.number && <span className="text-accent">{H.number}</span>} {H.number && <span className="h-px w-8 bg-line" />} {H.eyebrow}
          </p>
          <h2 className="mt-5 text-[clamp(2.4rem,5.6vw,5rem)] font-semibold leading-[0.95] tracking-[-0.035em]">
            <SplitWords text={H.title} /> <span className="serif-accent text-accent"><SplitWords text={H.accent} delay={0.12} /></span>
          </h2>
        </div>
        <Reveal delay={0.1} className="flex items-center justify-between gap-6 lg:col-span-4 lg:col-start-9 lg:flex-col lg:items-start">
          <p className="max-w-sm text-[16px] leading-relaxed text-muted">{H.intro}</p>
          <Link href="/doctors" className="btn btn-ghost shrink-0">
            {H.link} <ArrowUpRight className="h-4 w-4" />
          </Link>
        </Reveal>
      </div>

      {/* desktop board */}
      <div
        className="relative hidden lg:block"
        onPointerMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          x.set(e.clientX - r.left);
          y.set(e.clientY - r.top);
        }}
        onMouseLeave={() => setHover(null)}
      >
        <div className="grid grid-cols-[2.2fr_1.3fr_0.8fr_1.4fr_1.3fr_auto] gap-6 border-b border-ink px-4 pb-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
          <span>{t("boardDoctor")}</span>
          <span>{t("boardSpecialty")}</span>
          <span>{t("boardExperience")}</span>
          <span>{t("boardSpeaks")}</span>
          <span className="flex items-center gap-2">
            <span className="pulse-dot relative h-1.5 w-1.5 rounded-full bg-accent text-accent" /> {t("nextFree")}
          </span>
          <span className="w-[120px]" />
        </div>
        <ul>
          {list.map((d, i) => {
            const w = whenLabel(nextSlots[d.id], t);
            return (
              <Reveal as="li" key={d.id} delay={i * 0.05} y={16}>
                <Link
                  href={`/doctors/${d.slug}`}
                  onMouseEnter={() => setHover(d)}
                  className="group grid grid-cols-[2.2fr_1.3fr_0.8fr_1.4fr_1.3fr_auto] items-center gap-6 border-b border-line px-4 py-4 transition-colors duration-300 hover:bg-white"
                >
                  <span className="flex items-center gap-4">
                    <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-[14px] bg-accent-soft">
                      <Img src={d.image} alt={d.name} fill sizes="48px" className="object-cover" />
                    </span>
                    <span>
                      <span className="block font-display text-[20px] font-semibold leading-tight tracking-[-0.02em] transition-colors group-hover:text-accent">{d.name}</span>
                      <span className="block text-[12.5px] text-muted">{d.title}</span>
                    </span>
                  </span>
                  <span className="text-[14.5px]">{d.specialty}</span>
                  <span className="text-[14.5px] tabular-nums">{t("boardYears", { n: d.experience })}</span>
                  <span className="truncate text-[14px] text-muted">{d.languages.join(", ")}</span>
                  <span className="flex items-center gap-2">
                    <span className={cn("rounded-full px-2.5 py-1 text-[12px] font-semibold", w.today ? "bg-highlight text-ink" : "bg-accent-soft text-accent-deep")}>{w.day}</span>
                    <span className="text-[14px] font-medium tabular-nums">{w.time}</span>
                  </span>
                  <span className="flex w-[120px] items-center justify-end gap-3">
                    <span className="text-[13px] text-muted">{money(d.fee, currency)}</span>
                    <span className="grid h-10 w-10 place-items-center rounded-full bg-ink text-bg transition-all duration-500 group-hover:rotate-45 group-hover:bg-accent">
                      <ArrowUpRight className="h-4 w-4" />
                    </span>
                  </span>
                </Link>
              </Reveal>
            );
          })}
        </ul>

        {/* cursor-trailing portrait */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute left-0 top-0 z-10 h-[300px] w-[230px]"
          style={{ x: sx, y: sy, translateX: "40px", translateY: "-50%" }}
        >
          <AnimatePresence>
            {hover && (
              <motion.div
                key={hover.id}
                className="absolute inset-0 overflow-hidden rounded-[22px] shadow-[0_30px_60px_-20px_rgba(12,13,18,0.45)]"
                initial={{ opacity: 0, scale: 0.85, rotate: -4 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.35, ease }}
              >
                <Img src={hover.image} alt="" fill sizes="230px" className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/80 to-transparent" />
                <span className="absolute bottom-3 left-3 flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-semibold text-ink">
                  <Star className="h-3 w-3 fill-accent text-accent" /> {hover.rating.toFixed(1)}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* mobile roster */}
      <ul className="grid gap-3 sm:grid-cols-2 lg:hidden">
        {list.map((d, i) => {
          const w = whenLabel(nextSlots[d.id], t);
          return (
            <Reveal as="li" key={d.id} delay={i * 0.05}>
              <Link href={`/doctors/${d.slug}`} className="flex gap-4 rounded-[var(--radius)] bg-white p-3 shadow-[inset_0_0_0_1px_var(--line)]">
                <span className="relative h-[104px] w-[86px] shrink-0 overflow-hidden rounded-[calc(var(--radius)*0.7)]">
                  <Img src={d.image} alt={d.name} fill sizes="86px" className="object-cover" />
                </span>
                <span className="flex min-w-0 flex-1 flex-col py-1">
                  <span className="font-display text-[19px] font-semibold leading-tight tracking-[-0.02em]">{d.name}</span>
                  <span className="text-[13px] text-muted">{d.specialty} · {t("boardYears", { n: d.experience })}</span>
                  <span className="mt-1 flex items-center gap-1 text-[12px] text-muted"><Languages className="h-3 w-3" /> <span className="truncate">{d.languages.slice(0, 3).join(", ")}</span></span>
                  <span className="mt-auto flex items-center gap-2 pt-2">
                    <span className={cn("rounded-full px-2 py-0.5 text-[11.5px] font-semibold", w.today ? "bg-highlight text-ink" : "bg-accent-soft text-accent-deep")}>{w.day}</span>
                    <span className="text-[13px] font-medium">{w.time}</span>
                    <ArrowUpRight className="ml-auto h-4 w-4 text-muted" />
                  </span>
                </span>
              </Link>
            </Reveal>
          );
        })}
      </ul>
    </section>
  );
}
