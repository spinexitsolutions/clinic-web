"use client";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight, Clock, Plus } from "lucide-react";
import type { Doctor, Service } from "@/lib/types";
import { cn, money } from "@/lib/utils";
import { Img } from "../Img";
import { Icon } from "../Icon";
import { Reveal, SplitWords } from "@/components/motion/Reveal";
import { heading as headingFor } from "@/lib/headings";
import type { SectionHeading } from "@/lib/types";

const ease = [0.22, 1, 0.36, 1] as const;
const wipe = [0.76, 0, 0.24, 1] as const;

/**
 * Specialty explorer — an index of specialties on the left drives a sticky,
 * image-led detail panel on the right (desktop). On phones each row expands
 * in place into an image card.
 */
export function Services({ services, currency, doctors = [], heading }: { services: Service[]; currency: string; doctors?: Doctor[]; heading?: Partial<SectionHeading> }) {
  const H = headingFor("services", heading);
  const [active, setActiveRaw] = useState(0);
  const [layers, setLayers] = useState<{ id: number; i: number }[]>([{ id: 0, i: 0 }]);
  const setActive = (i: number) => {
    if (i === active) return;
    setActiveRaw(i);
    setLayers((l) => [...l.slice(-1), { id: l[l.length - 1].id + 1, i }]);
  };
  const [openMobile, setOpenMobile] = useState<number | null>(0);
  const s = services[active];
  const docsFor = (id: string) => doctors.filter((d) => d.serviceIds.includes(id));

  return (
    <section id="services" className="container-x py-20 md:py-32">
      {/* header */}
      <div className="mb-12 grid gap-6 md:mb-16 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-7">
          <p className="eyebrow flex items-center gap-3">
            <span className="text-accent">02</span> <span className="h-px w-8 bg-line" /> {H.eyebrow}
          </p>
          <h2 className="mt-5 text-[clamp(2.4rem,5.6vw,5rem)] font-semibold leading-[0.95] tracking-[-0.035em]">
            <SplitWords text={H.title} /> <span className="serif-accent text-accent"><SplitWords text={H.accent} delay={0.12} /></span>
          </h2>
        </div>
        <Reveal delay={0.15} className="lg:col-span-4 lg:col-start-9">
          <p className="text-[16px] leading-relaxed text-muted">
            {H.intro.replace("{count}", String(services.length))}
          </p>
          <Link href="/services" className="mt-5 inline-flex items-center gap-2 text-[14px] font-semibold text-accent">
            {H.link} <ArrowUpRight className="h-4 w-4" />
          </Link>
        </Reveal>
      </div>

      {/* desktop explorer */}
      <div className="hidden gap-14 lg:grid lg:grid-cols-[1fr_1.05fr]">
        <ol className="border-t border-line">
          {services.map((x, i) => {
            const on = i === active;
            const n = docsFor(x.id).length;
            return (
              <li key={x.id} className="relative border-b border-line" onMouseEnter={() => setActive(i)}>
                {on && <motion.span layoutId="svc-bar" className="absolute -left-5 top-0 h-full w-[3px] rounded-full bg-accent" transition={{ duration: 0.45, ease }} />}
                <Link href={`/services/${x.slug}`} onFocus={() => setActive(i)} className="group flex items-center gap-6 py-5">
                  <span className={cn("w-7 text-[12px] font-semibold tabular-nums transition-colors", on ? "text-accent" : "text-ink/30")}>{String(i + 1).padStart(2, "0")}</span>
                  <span className={cn("font-display text-[clamp(1.6rem,2.4vw,2.2rem)] font-semibold leading-none tracking-[-0.03em] transition-all duration-500", on ? "translate-x-1 text-ink" : "text-ink/30")}>
                    {x.name}
                  </span>
                  <span className={cn("ml-auto flex items-center gap-4 text-[13px] transition-opacity duration-500", on ? "opacity-100" : "opacity-0")}>
                    <span className="text-muted">{n ? `${n} doctor${n > 1 ? "s" : ""}` : "Care team"}</span>
                    <span className="font-semibold">from {money(x.priceFrom, currency)}</span>
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-ink text-bg transition-transform duration-500 group-hover:rotate-45">
                      <ArrowUpRight className="h-4 w-4" />
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>

        {/* sticky detail */}
        <div className="relative">
          <div className="sticky top-24">
            <div className="relative aspect-[4/5] max-h-[78vh] w-full overflow-hidden rounded-[calc(var(--radius)*1.1)] bg-ink">
              {layers.map((l) => (
                <motion.div
                  key={l.id}
                  className="absolute inset-0"
                  initial={l.id === 0 ? false : { clipPath: "inset(100% 0% 0% 0%)" }}
                  animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
                  transition={{ duration: 0.9, ease: wipe }}
                >
                  <motion.div className="absolute inset-0" initial={l.id === 0 ? false : { scale: 1.25, y: 40 }} animate={{ scale: 1.04, y: 0 }} transition={{ duration: 1.4, ease }}>
                    <Img src={services[l.i].image} alt={services[l.i].name} fill sizes="45vw" className="object-cover" />
                  </motion.div>
                </motion.div>
              ))}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/10 to-ink/30" />

              <div className="absolute left-5 right-5 top-5 flex items-center justify-between text-white">
                <span className="glass-dark flex h-11 items-center gap-2.5 rounded-full pl-1.5 pr-4 text-[13px] font-medium">
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-highlight text-ink">
                    <Icon name={s.icon} className="h-4 w-4" strokeWidth={2} />
                  </span>
                  {s.name}
                </span>
                <span className="font-display text-[13px] font-semibold tabular-nums text-white/70">
                  {String(active + 1).padStart(2, "0")} / {String(services.length).padStart(2, "0")}
                </span>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={s.id}
                  className="absolute inset-x-0 bottom-0 p-6 text-white xl:p-8"
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0, transition: { duration: 0.6, ease, delay: 0.25 } }}
                  exit={{ opacity: 0, y: -10, transition: { duration: 0.2 } }}
                >
                  <p className="max-w-md text-[17px] leading-relaxed text-white/85">{s.short}</p>
                  <div className="mt-5 flex flex-wrap gap-1.5">
                    {s.features.slice(0, 4).map((f) => (
                      <span key={f} className="rounded-full bg-white/12 px-3 py-1.5 text-[12.5px] backdrop-blur-md">{f}</span>
                    ))}
                  </div>
                  <div className="mt-6 flex items-center justify-between gap-4 border-t border-white/15 pt-5">
                    <div className="flex items-center gap-3">
                      <div className="flex -space-x-2">
                        {docsFor(s.id).slice(0, 3).map((d) => (
                          <span key={d.id} className="relative h-9 w-9 overflow-hidden rounded-full ring-2 ring-ink">
                            <Img src={d.image} alt={d.name} fill sizes="36px" className="object-cover" />
                          </span>
                        ))}
                      </div>
                      <span className="flex items-center gap-1.5 text-[13px] text-white/70">
                        <Clock className="h-3.5 w-3.5" /> {s.duration} min · from <span className="font-semibold text-white">{money(s.priceFrom, currency)}</span>
                      </span>
                    </div>
                    <Link href={`/book?service=${s.id}`} className="btn h-11 shrink-0 bg-white px-5 text-ink hover:bg-highlight">
                      Book <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* mobile accordion */}
      <ol className="border-t border-line lg:hidden">
        {services.map((x, i) => {
          const on = openMobile === i;
          return (
            <li key={x.id} className="border-b border-line">
              <button onClick={() => setOpenMobile(on ? null : i)} aria-expanded={on} className="flex w-full items-center gap-4 py-4 text-left">
                <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-xl transition-colors", on ? "bg-accent text-accent-ink" : "bg-accent-soft text-accent")}>
                  <Icon name={x.icon} className="h-[18px] w-[18px]" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-[21px] font-semibold leading-tight tracking-[-0.02em]">{x.name}</span>
                  <span className="text-[12.5px] text-muted">from {money(x.priceFrom, currency)} · {x.duration} min</span>
                </span>
                <motion.span animate={{ rotate: on ? 45 : 0 }} transition={{ duration: 0.35, ease }} className="grid h-9 w-9 place-items-center rounded-full border border-line">
                  <Plus className="h-4 w-4" />
                </motion.span>
              </button>
              <AnimatePresence initial={false}>
                {on && (
                  <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} transition={{ duration: 0.5, ease }} className="overflow-hidden">
                    <div className="relative mb-4 aspect-[4/3] overflow-hidden rounded-[var(--radius)]">
                      <Img src={x.image} alt={x.name} fill sizes="100vw" className="object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-ink/85 to-transparent" />
                      <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                        <p className="text-[14.5px] leading-snug text-white/85">{x.short}</p>
                        <div className="mt-3 flex gap-2">
                          <Link href={`/book?service=${x.id}`} className="btn h-10 bg-white px-4 text-[14px] text-ink">Book</Link>
                          <Link href={`/services/${x.slug}`} className="btn h-10 bg-white/15 px-4 text-[14px] text-white backdrop-blur-md">Details</Link>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
