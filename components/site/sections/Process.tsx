"use client";
import { motion, useMotionValueEvent, useScroll, useSpring, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import type { HomeContent } from "@/lib/types";
import { Img } from "../Img";
import { SplitWords } from "@/components/motion/Reveal";
import { cn } from "@/lib/utils";

const ease = [0.22, 1, 0.36, 1] as const;
const MOMENTS = ["Before you arrive", "At the door", "In the room", "After you leave"];
const TIMES = ["30 sec", "< 7 min", "20–50 min", "7-day check-in"];

/** Builds an ECG-style path with a heartbeat spike at each step position. */
function ecgPath(n: number, w = 1000, h = 120) {
  const mid = h / 2;
  let d = `M0 ${mid}`;
  for (let i = 0; i < n; i++) {
    const cx = ((i + 0.5) / n) * w;
    d += ` L${cx - 34} ${mid} L${cx - 24} ${mid - 12} L${cx - 14} ${mid + 14} L${cx - 4} ${mid - 46} L${cx + 6} ${mid + 40} L${cx + 16} ${mid} L${cx + 26} ${mid - 8} L${cx + 36} ${mid}`;
  }
  return `${d} L${w} ${mid}`;
}

/**
 * Patient journey — pinned on desktop. Scrolling draws a live ECG trace across
 * the screen; each heartbeat lights up a step of the visit.
 */
export function Process({ steps }: { steps: HomeContent["process"] }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const p = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });
  const draw = useTransform(p, [0.04, 0.92], [0, 1]);
  const [reached, setReached] = useState(0);
  useMotionValueEvent(draw, "change", (v) => {
    const r = Math.min(steps.length, Math.floor(v * steps.length + 0.42));
    setReached(r);
  });

  // mobile: vertical line
  const mref = useRef<HTMLOListElement>(null);
  const { scrollYProgress: mp } = useScroll({ target: mref, offset: ["start 0.7", "end 0.6"] });
  const mline = useSpring(mp, { stiffness: 120, damping: 30 });

  const header = (
    <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
      <div className="lg:col-span-7">
        <p className="eyebrow flex items-center gap-3">
          <span className="text-accent">03</span> <span className="h-px w-8 bg-line" /> Your visit
        </p>
        <h2 className="mt-5 text-[clamp(2.4rem,5.6vw,5rem)] font-semibold leading-[0.95] tracking-[-0.035em]">
          <SplitWords text="One visit," /> <span className="serif-accent text-accent"><SplitWords text="four heartbeats." delay={0.1} /></span>
        </h2>
      </div>
      <p className="max-w-sm text-[16px] leading-relaxed text-muted lg:col-span-4 lg:col-start-9">
        We designed every minute of a Solace visit — from the moment you book to the call a week later.
      </p>
    </div>
  );

  return (
    <section className="relative">
      {/* desktop: pinned journey */}
      <div ref={ref} className="relative hidden lg:block" style={{ height: `${100 + steps.length * 70}vh` }}>
        <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
          <div className="container-x">{header}</div>

          <div className="relative mt-12">
            {/* trace */}
            <div className="container-x">
            <svg viewBox="0 0 1000 120" preserveAspectRatio="none" className="h-[120px] w-full" aria-hidden>
              <path d={ecgPath(steps.length)} fill="none" stroke="var(--line)" strokeWidth="2" vectorEffect="non-scaling-stroke" />
              <motion.path
                d={ecgPath(steps.length)}
                fill="none"
                stroke="var(--accent)"
                strokeWidth="2.5"
                strokeLinejoin="round"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
                style={{ pathLength: draw }}
              />
            </svg>
            </div>

            {/* steps */}
            <div className="container-x mt-6 grid gap-5" style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}>
              {steps.map((s, i) => {
                const on = i < reached;
                return (
                  <motion.article
                    key={i}
                    animate={{ opacity: on ? 1 : 0.28, y: on ? 0 : 18 }}
                    transition={{ duration: 0.7, ease }}
                    className="relative"
                  >
                    <div className="flex items-center gap-3">
                      <motion.span
                        animate={{ scale: on ? 1 : 0.8, backgroundColor: on ? "var(--accent)" : "rgba(0,0,0,0)" }}
                        transition={{ duration: 0.5, ease }}
                        className={cn("grid h-9 w-9 place-items-center rounded-full border text-[12px] font-semibold tabular-nums", on ? "border-accent text-accent-ink" : "border-line text-muted")}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </motion.span>
                      <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">{MOMENTS[i] ?? `Step ${i + 1}`}</span>
                    </div>
                    <div className="relative mt-5 aspect-[16/10] overflow-hidden rounded-[calc(var(--radius)*0.8)] bg-accent-soft">
                      <motion.div className="absolute inset-0" animate={{ scale: on ? 1 : 1.15 }} transition={{ duration: 1.2, ease }}>
                        <Img src={s.image} alt={s.title} fill sizes="25vw" className="object-cover" />
                      </motion.div>
                      <span className="absolute bottom-3 left-3 rounded-full bg-white/90 px-2.5 py-1 text-[11.5px] font-semibold text-ink backdrop-blur">{TIMES[i] ?? ""}</span>
                    </div>
                    <h3 className="mt-5 font-display text-[24px] font-semibold leading-tight tracking-[-0.025em]">{s.title}</h3>
                    <p className="mt-2 text-[15px] leading-relaxed text-muted">{s.text}</p>
                  </motion.article>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* mobile / tablet: vertical journey */}
      <div className="container-x py-20 lg:hidden">
        {header}
        <ol ref={mref} className="relative mt-12 pl-12">
          <span className="absolute bottom-2 left-[17px] top-2 w-[2px] bg-line" aria-hidden />
          <motion.span className="absolute left-[17px] top-2 w-[2px] origin-top bg-accent" style={{ scaleY: mline, bottom: 8 }} aria-hidden />
          {steps.map((s, i) => (
            <motion.li
              key={i}
              className="relative pb-12 last:pb-0"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "0px 0px -20% 0px" }}
              transition={{ duration: 0.8, ease }}
            >
              <span className="absolute -left-12 top-0 grid h-9 w-9 place-items-center rounded-full bg-accent text-[12px] font-semibold text-accent-ink ring-4 ring-bg">
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="pt-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
                {MOMENTS[i] ?? `Step ${i + 1}`} · <span className="text-accent">{TIMES[i]}</span>
              </p>
              <h3 className="mt-2 font-display text-[26px] font-semibold leading-tight tracking-[-0.025em]">{s.title}</h3>
              <p className="mt-2 text-[15.5px] leading-relaxed text-muted">{s.text}</p>
              <div className="relative mt-4 aspect-[16/10] overflow-hidden rounded-[var(--radius)]">
                <Img src={s.image} alt={s.title} fill sizes="90vw" className="object-cover" />
              </div>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}
