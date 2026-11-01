"use client";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { useRef } from "react";

function Word({ children, progress, range }: { children: string; progress: MotionValue<number>; range: [number, number] }) {
  const opacity = useTransform(progress, range, [0.12, 1]);
  const blur = useTransform(progress, range, ["blur(4px)", "blur(0px)"]);
  return (
    <motion.span style={{ opacity, filter: blur }} className="inline-block">
      {children}&nbsp;
    </motion.span>
  );
}

/** Apple-style statement: words light up as you scroll through. */
export function Statement({ text }: { text: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.45"] });
  const words = text.split(" ");
  return (
    <section ref={ref} className="container-x py-24 md:py-40">
      <p className="eyebrow mb-8 flex items-center gap-2">
        <span className="h-px w-8 bg-ink/30" /> Our philosophy
      </p>
      <p className="max-w-[22ch] text-[clamp(2rem,5.6vw,5rem)] font-medium leading-[1.04] tracking-[-0.045em] md:max-w-[24ch]">
        {words.map((w, i) => {
          const start = i / words.length;
          return (
            <Word key={i} progress={scrollYProgress} range={[start, Math.min(1, start + 1.5 / words.length)]}>
              {w}
            </Word>
          );
        })}
      </p>
    </section>
  );
}
