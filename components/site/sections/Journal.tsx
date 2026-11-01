"use client";
import { AnimatePresence, motion, useMotionValue, useSpring } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import type { Post } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { Img } from "../Img";
import { Reveal, SplitWords } from "@/components/motion/Reveal";
import { heading as headingFor } from "@/lib/headings";
import type { SectionHeading } from "@/lib/types";
import { useLabels } from "../SiteContext";

const ease = [0.22, 1, 0.36, 1] as const;

export function PostCard({ p, large }: { p: Post; large?: boolean }) {
  const t = useLabels();
  return (
    <Link href={`/blog/${p.slug}`} data-cursor="Read" className="group block">
      <div className={`relative overflow-hidden rounded-[var(--radius)] bg-accent-soft ${large ? "aspect-[4/3] md:aspect-[16/11]" : "aspect-[4/3]"}`}>
        <Img src={p.cover} alt={p.title} fill sizes="(max-width:768px) 100vw, 40vw" className="object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-105" />
        <span className="glass absolute left-4 top-4 rounded-full px-3 py-1 text-[12px] font-medium">{p.category}</span>
      </div>
      <div className="mt-5 flex items-center gap-3 text-[12px] font-medium uppercase tracking-[0.1em] text-muted">
        <span>{formatDate(p.publishedAt)}</span>
        <span className="h-1 w-1 rounded-full bg-muted" />
        <span>{t("journalMinRead", { n: p.readMinutes })}</span>
      </div>
      <h3 className={`mt-3 font-semibold leading-[1.08] tracking-[-0.025em] transition-colors group-hover:text-accent ${large ? "text-[clamp(1.6rem,3vw,2.4rem)]" : "text-[22px]"}`}>
        {p.title}
      </h3>
      {large && <p className="mt-3 max-w-lg text-[16px] leading-relaxed text-muted">{p.excerpt}</p>}
    </Link>
  );
}

function Featured({ p }: { p: Post }) {
  const t = useLabels();
  return (
    <Link href={`/blog/${p.slug}`} data-cursor="Read" className="group relative block h-full min-h-[460px] overflow-hidden rounded-[var(--radius)] bg-ink text-white md:min-h-[600px]">
      <Img src={p.cover} alt={p.title} fill sizes="(max-width:1024px) 100vw, 55vw" className="object-cover opacity-90 transition-transform duration-[1.4s] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.04]" />
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/35 to-ink/10" />
      <div className="absolute left-5 right-5 top-5 flex items-center justify-between md:left-7 md:right-7 md:top-7">
        <span className="rounded-full bg-highlight px-3 py-1 text-[12px] font-semibold text-ink">{t("journalFeatured")} · {p.category}</span>
        <span className="grid h-11 w-11 place-items-center rounded-full bg-white/15 backdrop-blur-md transition-transform duration-500 group-hover:rotate-45">
          <ArrowUpRight className="h-4 w-4" />
        </span>
      </div>
      <div className="absolute inset-x-0 bottom-0 p-6 md:p-9">
        <p className="text-[12px] font-medium uppercase tracking-[0.12em] text-white/60">
          {formatDate(p.publishedAt)} · {t("journalMinRead", { n: p.readMinutes })} · {p.author}
        </p>
        <h3 className="mt-3 max-w-[20ch] text-[clamp(1.8rem,3.4vw,3rem)] font-semibold leading-[1.02] tracking-[-0.03em]">{p.title}</h3>
        <p className="mt-4 max-w-md text-[15px] leading-relaxed text-white/70">{p.excerpt}</p>
      </div>
    </Link>
  );
}

/** Editorial journal: one featured story, a numbered index with a cursor-follow preview. */
export function Journal({ posts, heading }: { posts: Post[]; heading?: Partial<SectionHeading> }) {
  const H = headingFor("blog", heading);
  const t = useLabels();
  const [hover, setHover] = useState<Post | null>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 260, damping: 28, mass: 0.6 });
  const sy = useSpring(y, { stiffness: 260, damping: 28, mass: 0.6 });

  if (!posts.length) return null;
  const [first, ...rest] = posts;
  const list = rest.slice(0, 4);

  return (
    <section className="container-x py-20 md:py-32">
      <div className="mb-10 flex flex-col gap-6 md:mb-14 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="eyebrow">{H.eyebrow}</p>
          <h2 className="mt-4 text-[clamp(2.3rem,5.4vw,4.6rem)] font-semibold leading-[0.95] tracking-[-0.035em]">
            <SplitWords text={H.title} /> <span className="serif-accent text-accent"><SplitWords text={H.accent} delay={0.1} /></span>
          </h2>
        </div>
        <Link href="/blog" className="btn btn-ghost self-start md:self-auto">
          {H.link} <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-12 lg:gap-10">
        <Reveal className="lg:col-span-7">
          <Featured p={first} />
        </Reveal>

        <div
          className="relative lg:col-span-5"
          onPointerMove={(e) => {
            if (e.pointerType !== "mouse") return;
            const r = e.currentTarget.getBoundingClientRect();
            x.set(e.clientX - r.left);
            y.set(e.clientY - r.top);
          }}
          onMouseLeave={() => setHover(null)}
        >
          <ol className="border-t border-line">
            {list.map((p, i) => (
              <Reveal as="li" key={p.id} delay={0.08 * i} className="border-b border-line">
                <Link href={`/blog/${p.slug}`} onMouseEnter={() => setHover(p)} className="group grid grid-cols-[auto_1fr_auto] items-start gap-5 py-6 md:py-7">
                  <span className="pt-1 font-display text-[15px] font-semibold tabular-nums text-accent">{String(i + 2).padStart(2, "0")}</span>
                  <span>
                    <span className="text-[11.5px] font-semibold uppercase tracking-[0.12em] text-muted">
                      {p.category} · {p.readMinutes} min
                    </span>
                    <span className="mt-2 block font-display text-[21px] font-semibold leading-[1.15] tracking-[-0.02em] transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)] group-hover:translate-x-1.5 md:text-[24px]">
                      {p.title}
                    </span>
                  </span>
                  <span className="mt-1 grid h-9 w-9 place-items-center rounded-full border border-line transition-colors duration-500 group-hover:border-ink group-hover:bg-ink group-hover:text-bg">
                    <ArrowUpRight className="h-4 w-4" />
                  </span>
                </Link>
              </Reveal>
            ))}
          </ol>
          {list.length === 0 && <p className="text-muted">{t("journalEmpty")}</p>}

          {/* cursor-follow preview (desktop) */}
          <motion.div
            aria-hidden
            className="pointer-events-none absolute left-0 top-0 z-20 hidden lg:block"
            style={{ x: sx, y: sy }}
          >
            <AnimatePresence>
              {hover && (
                <motion.div
                  key={hover.id}
                  className="relative -ml-[260px] -mt-[90px] h-[180px] w-[240px] overflow-hidden rounded-[calc(var(--radius)*0.7)] shadow-[0_30px_60px_-20px_rgba(12,13,18,0.45)]"
                  initial={{ opacity: 0, scale: 0.85, rotate: -4 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4, ease }}
                >
                  <Img src={hover.cover} alt="" fill sizes="240px" className="object-cover" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
