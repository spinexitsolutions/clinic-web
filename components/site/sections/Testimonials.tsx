"use client";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Star } from "lucide-react";
import type { Testimonial } from "@/lib/types";
import { Img } from "../Img";
import { cn } from "@/lib/utils";

const ease = [0.22, 1, 0.36, 1] as const;

export function Testimonials({ items }: { items: Testimonial[] }) {
  const [i, setI] = useState(0);
  const [dir, setDir] = useState(1);
  const [paused, setPaused] = useState(false);
  const t = items[i];

  const go = (d: number) => {
    setDir(d);
    setI((p) => (p + d + items.length) % items.length);
  };

  useEffect(() => {
    if (paused || items.length < 2) return;
    const id = setTimeout(() => go(1), 6500);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i, paused, items.length]);

  if (!t) return null;

  return (
    <section className="py-20 md:py-32" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="container-x">
        <div className="relative overflow-hidden rounded-[calc(var(--radius)*1.2)] bg-accent px-6 py-12 text-accent-ink md:px-16 md:py-20">
          <div aria-hidden className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
          <div className="flex items-center justify-between">
            <p className="font-mono text-[12px] uppercase tracking-[0.14em] text-accent-ink/70">Patient stories</p>
            <p className="font-mono text-[12px] tabular-nums text-accent-ink/70">
              {String(i + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
            </p>
          </div>

          <div className="relative mt-10 min-h-[300px] md:min-h-[260px]">
            <AnimatePresence mode="wait" custom={dir}>
              <motion.figure
                key={t.id}
                custom={dir}
                initial={{ opacity: 0, x: dir * 60, filter: "blur(8px)" }}
                animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, x: dir * -60, filter: "blur(8px)" }}
                transition={{ duration: 0.7, ease }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={(_, info) => {
                  if (info.offset.x < -60) go(1);
                  else if (info.offset.x > 60) go(-1);
                }}
                className="cursor-grab active:cursor-grabbing"
              >
                <div className="mb-6 flex gap-1">
                  {Array.from({ length: t.rating }).map((_, k) => (
                    <Star key={k} className="h-4 w-4 fill-current" strokeWidth={0} />
                  ))}
                </div>
                <blockquote className="max-w-4xl text-[clamp(1.6rem,3.8vw,3.2rem)] font-medium leading-[1.12] tracking-[-0.025em]">
                  <span className="serif-accent">“</span>
                  {t.quote}
                  <span className="serif-accent">”</span>
                </blockquote>
                <figcaption className="mt-10 flex items-center gap-4">
                  <span className="relative h-12 w-12 overflow-hidden rounded-full ring-2 ring-white/30">
                    <Img src={t.image} alt={t.name} fill sizes="48px" className="object-cover" />
                  </span>
                  <span>
                    <span className="block font-medium">{t.name}</span>
                    <span className="text-[14px] text-accent-ink/70">{t.role}</span>
                  </span>
                </figcaption>
              </motion.figure>
            </AnimatePresence>
          </div>

          <div className="mt-10 flex items-center justify-between gap-4">
            <div className="flex gap-1.5">
              {items.map((x, k) => (
                <button
                  key={x.id}
                  onClick={() => {
                    setDir(k > i ? 1 : -1);
                    setI(k);
                  }}
                  aria-label={`Show story ${k + 1}`}
                  className={cn("h-1.5 rounded-full bg-accent-ink transition-all duration-500", k === i ? "w-8 opacity-100" : "w-1.5 opacity-30")}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={() => go(-1)} aria-label="Previous" className="grid h-12 w-12 place-items-center rounded-full border border-accent-ink/25 transition-colors hover:bg-accent-ink hover:text-accent">
                <ArrowLeft className="h-4 w-4" />
              </button>
              <button onClick={() => go(1)} aria-label="Next" className="grid h-12 w-12 place-items-center rounded-full border border-accent-ink/25 transition-colors hover:bg-accent-ink hover:text-accent">
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
