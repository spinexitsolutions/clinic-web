"use client";
import { motion, useInView, type Variants } from "framer-motion";
import { useRef } from "react";
import { cn } from "@/lib/utils";

const ease = [0.22, 1, 0.36, 1] as const;

/** Fade + rise when scrolled into view. */
export function Reveal({
  children,
  delay = 0,
  y = 28,
  className,
  as = "div",
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  as?: "div" | "li" | "section" | "span";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -12% 0px" });
  const M = motion[as] as typeof motion.div;
  return (
    <M
      ref={ref}
      className={className}
      initial={{ opacity: 0, y, filter: "blur(6px)" }}
      animate={inView ? { opacity: 1, y: 0, filter: "blur(0px)" } : undefined}
      transition={{ duration: 1, ease, delay }}
    >
      {children}
    </M>
  );
}

const wordVariants: Variants = {
  hidden: { y: "110%" },
  show: (i: number) => ({ y: "0%", transition: { duration: 0.9, ease, delay: i * 0.045 } }),
};

/** Mask-reveal each word, line by line. */
export function SplitWords({
  text,
  className,
  delay = 0,
  wordClassName,
  immediate = false,
}: {
  text: string;
  className?: string;
  delay?: number;
  wordClassName?: string;
  immediate?: boolean;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const words = text.split(" ");
  return (
    <span ref={ref} className={cn("inline", className)} aria-label={text}>
      {words.map((w, i) => (
        <span key={i} className="inline-block overflow-hidden pb-[0.12em] -mb-[0.12em] align-bottom" aria-hidden>
          <motion.span
            className={cn("inline-block will-change-transform", wordClassName)}
            variants={wordVariants}
            initial="hidden"
            animate={immediate || inView ? "show" : "hidden"}
            custom={i + delay * 20}
          >
            {w}
            {i < words.length - 1 ? " " : ""}
          </motion.span>
        </span>
      ))}
    </span>
  );
}
