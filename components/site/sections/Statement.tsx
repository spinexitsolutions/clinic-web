"use client";
import { motion, useInView, useScroll, useTransform, type MotionValue } from "framer-motion";
import { useRef } from "react";
import { Img } from "../Img";

const ease = [0.22, 1, 0.36, 1] as const;

function Word({ children, progress, range }: { children: string; progress: MotionValue<number>; range: [number, number] }) {
  const opacity = useTransform(progress, range, [0.14, 1]);
  return (
    <motion.span style={{ opacity }} className="inline-block">
      {children}&nbsp;
    </motion.span>
  );
}

export type StatementSignature = { name: string; role: string; image: string };
export type StatementPrinciple = { value: string; label: string };

const DEFAULT_SIGNATURE: StatementSignature = {
  name: "Dr. Meera Iyer",
  role: "Medical Director",
  image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2",
};

const DEFAULT_PRINCIPLES: StatementPrinciple[] = [
  { value: "20–50", label: "minute consultations, never rushed" },
  { value: "7 min", label: "average wait from check-in" },
  { value: "100%", label: "of our prices published upfront" },
];

/** Editorial manifesto — words light up as you scroll through. */
export function Statement({
  text,
  index = "01",
  label = "Philosophy",
  signature = DEFAULT_SIGNATURE,
  principles = DEFAULT_PRINCIPLES,
}: {
  text: string;
  index?: string;
  label?: string;
  signature?: StatementSignature | null;
  principles?: StatementPrinciple[];
}) {
  const ref = useRef<HTMLDivElement>(null);
  const footRef = useRef<HTMLDivElement>(null);
  const footIn = useInView(footRef, { once: true, margin: "0px 0px -10% 0px" });
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.8", "end 0.5"] });
  const rule = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  const words = text.split(" ");

  return (
    <section className="container-x py-24 md:py-36">
      <div className="grid gap-10 md:grid-cols-12 md:gap-8">
        {/* index column */}
        <div className="md:col-span-3">
          <div className="flex items-baseline gap-3 md:sticky md:top-32 md:flex-col md:gap-2">
            <span className="font-display text-[56px] font-semibold leading-none tracking-[-0.04em] text-accent md:text-[96px]">{index}</span>
            <span className="eyebrow">— {label}</span>
            <div className="hidden h-px w-full max-w-[180px] overflow-hidden bg-line md:mt-6 md:block">
              <motion.div className="h-full bg-ink" style={{ width: rule }} />
            </div>
          </div>
        </div>

        <div className="md:col-span-9">
          <p ref={ref} className="font-display text-[clamp(1.9rem,4.4vw,4.1rem)] font-semibold leading-[1.06] tracking-[-0.032em]">
            {words.map((w, i) => {
              const start = i / words.length;
              return (
                <Word key={i} progress={scrollYProgress} range={[start, Math.min(1, start + 1.5 / words.length)]}>
                  {w}
                </Word>
              );
            })}
          </p>

          <div ref={footRef} className="mt-12 md:mt-16">
            {signature && (
              <motion.div
                className="flex items-center gap-4"
                initial={{ opacity: 0, y: 16 }}
                animate={footIn ? { opacity: 1, y: 0 } : undefined}
                transition={{ duration: 0.9, ease }}
              >
                <span className="relative h-14 w-14 overflow-hidden rounded-full ring-4 ring-accent-soft">
                  <Img src={signature.image} alt={signature.name} fill sizes="56px" className="object-cover" />
                </span>
                <span>
                  <span className="block font-display text-[19px] font-semibold tracking-[-0.02em]">{signature.name}</span>
                  <span className="text-[14px] text-muted">{signature.role}</span>
                </span>
                <svg viewBox="0 0 160 40" className="ml-2 hidden h-10 w-36 text-ink/70 sm:block" fill="none" aria-hidden>
                  <motion.path
                    d="M4 28c10-14 18-20 22-14s-6 18 2 16 12-22 20-20-4 20 4 18 10-14 16-12 0 10 6 9 14-10 22-10 12 6 22 4 18-8 34-6"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={footIn ? { pathLength: 1 } : undefined}
                    transition={{ duration: 1.6, ease, delay: 0.3 }}
                  />
                </svg>
              </motion.div>
            )}

            {principles.length > 0 && (
              <dl className="mt-10 grid gap-px overflow-hidden rounded-[var(--radius)] bg-line sm:grid-cols-3">
                {principles.map((p, i) => (
                  <motion.div
                    key={p.label}
                    className="bg-bg p-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={footIn ? { opacity: 1, y: 0 } : undefined}
                    transition={{ duration: 0.9, ease, delay: 0.15 + i * 0.08 }}
                  >
                    <dt className="font-display text-[34px] font-semibold leading-none tracking-[-0.035em]">{p.value}</dt>
                    <dd className="mt-3 text-[14px] leading-snug text-muted">{p.label}</dd>
                  </motion.div>
                ))}
              </dl>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
