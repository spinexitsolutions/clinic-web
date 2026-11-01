"use client";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { useRef } from "react";
import type { HomeContent } from "@/lib/types";
import { Img } from "../Img";
import { SplitWords } from "@/components/motion/Reveal";

type Step = HomeContent["process"][number];

function StackCard({ step, i, total, progress }: { step: Step; i: number; total: number; progress: MotionValue<number> }) {
  const start = i / total;
  const scale = useTransform(progress, [start, 1], [1, 1 - (total - i) * 0.04]);
  const dim = useTransform(progress, [start, Math.min(1, start + 1 / total)], [0, i === total - 1 ? 0 : 0.35]);
  return (
    <div className="sticky top-24 h-[78svh] md:top-28 md:h-[72vh]" style={{ paddingTop: i * 18 }}>
      <motion.article
        style={{ scale, transformOrigin: "top center" }}
        className="relative grid h-full overflow-hidden rounded-[var(--radius)] bg-ink text-bg md:grid-cols-2"
      >
        <div className="relative z-10 flex flex-col justify-between p-7 md:p-12">
          <span className="font-mono text-[13px] text-bg/50">
            Step {String(i + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </span>
          <div>
            <h3 className="text-[clamp(2rem,4.5vw,3.8rem)] font-semibold leading-[0.92] tracking-[-0.025em]">{step.title}</h3>
            <p className="mt-5 max-w-sm text-[16px] leading-relaxed text-bg/65 md:text-lg">{step.text}</p>
          </div>
        </div>
        <div className="relative min-h-[38%] md:min-h-0">
          <Img src={step.image} alt={step.title} fill sizes="(max-width:768px) 100vw, 50vw" className="object-cover" />
        </div>
        <motion.div style={{ opacity: dim }} className="pointer-events-none absolute inset-0 bg-black" />
      </motion.article>
    </div>
  );
}

export function Process({ steps }: { steps: HomeContent["process"] }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  return (
    <section className="container-x py-20 md:py-32">
      <div className="mb-12 grid gap-6 md:mb-20 md:grid-cols-2 md:items-end">
        <div>
          <p className="eyebrow">How it works</p>
          <h2 className="mt-4 text-[clamp(2.4rem,6vw,5.2rem)] font-semibold leading-[0.92] tracking-[-0.025em]">
            <SplitWords text="A visit, " />
            <span className="serif-accent text-accent"><SplitWords text="reimagined." delay={0.1} /></span>
          </h2>
        </div>
        <p className="max-w-md text-[17px] leading-relaxed text-muted md:justify-self-end">
          We obsessed over every minute of your visit — from the moment you book to the follow-up call a week later.
        </p>
      </div>
      <div ref={ref} className="relative">
        {steps.map((s, i) => (
          <StackCard key={i} step={s} i={i} total={steps.length} progress={scrollYProgress} />
        ))}
      </div>
    </section>
  );
}
