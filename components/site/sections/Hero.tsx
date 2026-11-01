"use client";
import { AnimatePresence, animate, motion, useMotionValue, useScroll, useTransform, type AnimationPlaybackControls } from "framer-motion";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, CalendarClock, Star } from "lucide-react";
import type { Doctor, HomeContent, Service } from "@/lib/types";
import { useIntroDone } from "@/components/motion/Intro";
import { useSite } from "../SiteContext";
import { Img } from "../Img";
import { cn, openStatus, timeLabel } from "@/lib/utils";

const ease = [0.22, 1, 0.36, 1] as const;
const slatEase = [0.76, 0, 0.24, 1] as const;
const SLATS = 7;
const DURATION = 6; // seconds per specialty

export type HeroSlide = {
  service: Service;
  doctor: Doctor | null;
  next: { date: string; time: string } | null;
};

function nextLabel(next: HeroSlide["next"]) {
  if (!next) return "Call to book";
  const d = new Date(next.date + "T00:00:00");
  const t = new Date();
  const today = new Date(t.getFullYear(), t.getMonth(), t.getDate());
  const diff = Math.round((d.getTime() - today.getTime()) / 864e5);
  const day = diff === 0 ? "Today" : diff === 1 ? "Tomorrow" : d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
  return `${day} · ${timeLabel(next.time)}`;
}

/** New image arrives through vertical "window-blind" slats. */
function Blinds({ src, first }: { src: string; first: boolean }) {
  if (first) {
    return (
      <motion.div className="absolute inset-0" initial={{ scale: 1.12 }} animate={{ scale: 1 }} transition={{ duration: DURATION + 2, ease: "linear" }}>
        <Img src={src} alt="" fill priority sizes="100vw" className="object-cover" />
      </motion.div>
    );
  }
  return (
    <div className="absolute inset-0">
      {Array.from({ length: SLATS }).map((_, i) => {
        const l = (i * 100) / SLATS;
        const r = 100 - ((i + 1) * 100) / SLATS;
        return (
          <motion.div
            key={i}
            className="absolute inset-0"
            initial={{ clipPath: `inset(100% ${r}% 0% ${l}%)` }}
            animate={{ clipPath: `inset(0% ${r - 0.05}% 0% ${l}%)` }}
            transition={{ duration: 1.15, ease: slatEase, delay: i * 0.055 }}
          >
            <motion.div className="absolute inset-0" initial={{ scale: 1.18 }} animate={{ scale: 1 }} transition={{ duration: DURATION + 2, ease: "linear" }}>
              <Img src={src} alt="" fill sizes="100vw" className="object-cover" />
            </motion.div>
          </motion.div>
        );
      })}
    </div>
  );
}

function LiveStatus() {
  const { settings } = useSite();
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 20_000);
    return () => clearInterval(id);
  }, []);
  if (!now) return null;
  const st = openStatus(settings.hours, now);
  return (
    <span className="flex items-center gap-2.5">
      <span className={cn("pulse-dot relative h-1.5 w-1.5 rounded-full", st.open ? "bg-highlight text-highlight" : "bg-coral text-coral")} />
      <span>{st.open ? "Open now" : st.label}</span>
      <span className="h-3 w-px bg-white/25" />
      <span className="tabular-nums">{now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false })} IST</span>
    </span>
  );
}

export function Hero({ hero, slides, stats }: { hero: HomeContent["hero"]; slides: HeroSlide[]; stats: HomeContent["stats"] }) {
  const go = useIntroDone();
  const [i, setI] = useState(0);
  const [history, setHistory] = useState<{ n: number; id: number }[]>([{ n: 0, id: 0 }]);
  const [paused, setPaused] = useState(false);
  const progress = useMotionValue(0);
  const ctrl = useRef<AnimationPlaybackControls | null>(null);
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  const frameScale = useTransform(scrollYProgress, [0, 1], [1, 0.92]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 140]);
  const dim = useTransform(scrollYProgress, [0, 0.9], [0, 0.6]);

  const select = (n: number) => {
    if (n === i) return;
    setI(n);
    setHistory((h) => [...h.slice(-1), { n, id: h[h.length - 1].id + 1 }]);
  };

  // auto-advance with a visible progress bar, pausable on hover
  useEffect(() => {
    if (!go || slides.length < 2) return;
    progress.set(0);
    ctrl.current = animate(progress, 1, {
      duration: DURATION,
      ease: "linear",
      onComplete: () => select((i + 1) % slides.length),
    });
    return () => ctrl.current?.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i, go, slides.length]);

  useEffect(() => {
    if (paused) ctrl.current?.pause();
    else ctrl.current?.play();
  }, [paused]);

  const slide = slides[i];
  const bar = useTransform(progress, (v) => `${v * 100}%`);
  if (!slide) return null;

  return (
    <section ref={sectionRef} className="relative px-2 md:px-3">
      <motion.div
        style={{ scale: frameScale }}
        className="relative h-[calc(100svh-12rem)] min-h-[600px] origin-top overflow-hidden rounded-[calc(var(--radius)*1.15)] bg-ink text-white md:h-[calc(100svh-7.75rem)] lg:min-h-[640px]"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* image stack: last two stay mounted so slats reveal over the previous photo */}
        <div className="absolute inset-0 isolate">
          {history.map((h) => (
            <div key={h.id} className="absolute inset-0" style={{ zIndex: h.id }}>
              <Blinds src={slides[h.n].service.image} first={h.id === 0} />
            </div>
          ))}
        </div>

        {/* legibility */}
        <div className="pointer-events-none absolute inset-0 bg-[#080a12]/35" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(8,9,14,0.55)_0%,rgba(8,9,14,0.05)_28%,rgba(8,9,14,0.15)_55%,rgba(8,9,14,0.92)_100%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(8,9,14,0.6)_0%,rgba(8,9,14,0)_55%,rgba(8,9,14,0.45)_100%)]" />
        <motion.div style={{ opacity: dim }} className="pointer-events-none absolute inset-0 bg-ink" />

        {/* curtain-up on load */}
        <motion.div
          className="pointer-events-none absolute inset-0 z-30 origin-top bg-bg"
          initial={{ scaleY: 1 }}
          animate={go ? { scaleY: 0 } : undefined}
          transition={{ duration: 1.2, ease: slatEase }}
        />

        <motion.div style={{ y: contentY }} className="relative z-20 flex h-full flex-col px-5 pb-5 pt-5 md:px-10 md:pb-8 md:pt-7">
          {/* meta */}
          <motion.div
            className="flex items-center justify-between text-[12px] font-medium text-white/75"
            initial={{ opacity: 0, y: -10 }}
            animate={go ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.9, ease, delay: 0.7 }}
          >
            <span className="hidden sm:block">{hero.eyebrow}</span>
            <LiveStatus />
          </motion.div>

          <div className="mt-auto grid gap-8 lg:grid-cols-12 lg:items-end lg:gap-10">
            {/* left: message */}
            <div className="lg:col-span-7">
              <div className="mb-5 flex items-center gap-3 overflow-hidden text-[13px] font-medium">
                <span className="rounded-full bg-white/12 px-3 py-1 text-white/70 backdrop-blur-md">Now viewing</span>
                <AnimatePresence mode="wait">
                  <motion.span
                    key={slide.service.id}
                    initial={{ y: 18, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -18, opacity: 0 }}
                    transition={{ duration: 0.5, ease }}
                    className="text-highlight"
                  >
                    {slide.service.name}
                  </motion.span>
                </AnimatePresence>
              </div>

              <h1 className="font-display text-[clamp(2.9rem,7.2vw,7.4rem)] font-semibold leading-[0.93] tracking-[-0.035em]">
                {[hero.titleLine1, hero.titleAccent, hero.titleLine2].map((line, k) => (
                  <span key={k} className="block overflow-hidden pb-[0.05em]">
                    <motion.span
                      className={cn("block", k === 1 && "serif-accent text-highlight")}
                      initial={{ y: "105%" }}
                      animate={go ? { y: "0%" } : undefined}
                      transition={{ duration: 1.2, ease, delay: 0.45 + k * 0.09 }}
                    >
                      {line}
                    </motion.span>
                  </span>
                ))}
              </h1>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={go ? { opacity: 1, y: 0 } : undefined}
                transition={{ duration: 1, ease, delay: 0.85 }}
                className="mt-6 flex flex-col gap-6 xl:flex-row xl:items-end xl:gap-10"
              >
                <p className="max-w-[38ch] text-[16px] leading-relaxed text-white/75 md:text-[17px]">{hero.subtitle}</p>
                <div className="flex shrink-0 gap-2">
                  <Link href={hero.primaryCta.href} className="btn h-13 bg-white px-6 text-ink hover:bg-highlight">
                    {hero.primaryCta.label} <ArrowUpRight className="h-4 w-4" />
                  </Link>
                  <Link href={hero.secondaryCta.href} className="btn hidden h-13 bg-white/10 px-6 text-white backdrop-blur-md hover:bg-white/20 sm:inline-flex">
                    {hero.secondaryCta.label}
                  </Link>
                </div>
              </motion.div>
            </div>

            {/* right: doctor on duty + specialty index */}
            <motion.div
              className="lg:col-span-4 lg:col-start-9"
              initial={{ opacity: 0, x: 30 }}
              animate={go ? { opacity: 1, x: 0 } : undefined}
              transition={{ duration: 1.1, ease, delay: 0.95 }}
            >
              <AnimatePresence mode="wait">
                {slide.doctor && (
                  <motion.div
                    key={slide.doctor.id + slide.service.id}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.5, ease }}
                  >
                    <Link
                      href={`/book?doctor=${slide.doctor.id}&service=${slide.service.id}`}
                      className="group flex items-center gap-3.5 rounded-[calc(var(--radius)*0.8)] bg-white/10 p-2.5 pr-4 ring-1 ring-white/15 backdrop-blur-xl transition-colors hover:bg-white/15"
                    >
                      <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-[calc(var(--radius)*0.55)]">
                        <Img src={slide.doctor.image} alt={slide.doctor.name} fill sizes="56px" className="object-cover" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-1.5 text-[15px] font-semibold">
                          <span className="truncate">{slide.doctor.name}</span>
                          <Star className="h-3 w-3 shrink-0 fill-highlight text-highlight" />
                          <span className="text-[12px] font-medium text-white/70">{slide.doctor.rating.toFixed(1)}</span>
                        </span>
                        <span className="mt-0.5 flex min-w-0 items-center gap-1.5 whitespace-nowrap text-[12.5px] text-white/65">
                          <CalendarClock className="h-3.5 w-3.5 shrink-0" /> <span className="lg:hidden xl:inline">Next free ·</span> <span className="truncate text-white">{nextLabel(slide.next)}</span>
                        </span>
                      </span>
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-highlight text-ink transition-transform duration-500 group-hover:rotate-45">
                        <ArrowUpRight className="h-4 w-4" />
                      </span>
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* index — vertical on desktop, horizontal chips on mobile */}
              <ol className="no-scrollbar -mx-5 mt-4 flex gap-2 overflow-x-auto px-5 lg:mx-0 lg:mt-6 lg:block lg:space-y-0 lg:overflow-visible lg:px-0">
                {slides.map((s, n) => {
                  const active = n === i;
                  return (
                    <li key={s.service.id} className="shrink-0 lg:border-t lg:border-white/15">
                      <button
                        onClick={() => select(n)}
                        className={cn(
                          "group relative flex w-full items-center gap-3 rounded-full px-4 py-2 text-left text-[14px] transition-colors lg:rounded-none lg:px-0 lg:py-3 lg:text-[15px]",
                          active ? "bg-white text-ink lg:bg-transparent lg:text-white" : "bg-white/10 text-white/60 backdrop-blur-md hover:text-white lg:bg-transparent lg:backdrop-blur-none",
                        )}
                      >
                        <span className={cn("hidden w-6 text-[11px] font-semibold tabular-nums lg:block", active ? "text-highlight" : "text-white/40")}>
                          {String(n + 1).padStart(2, "0")}
                        </span>
                        <span className="whitespace-nowrap font-medium">{s.service.name}</span>
                        <span className={cn("ml-auto hidden text-[12px] tabular-nums transition-opacity lg:block", active ? "opacity-70" : "opacity-0 group-hover:opacity-50")}>
                          from ₹{s.service.priceFrom.toLocaleString("en-IN")}
                        </span>
                        {active && (
                          <motion.span style={{ width: bar }} className="absolute -top-px left-0 hidden h-[2px] bg-highlight lg:block" />
                        )}
                      </button>
                    </li>
                  );
                })}
              </ol>
            </motion.div>
          </div>

          {/* stats rail */}
          <motion.dl
            className="mt-7 hidden grid-cols-4 border-t border-white/15 pt-5 md:grid"
            initial={{ opacity: 0 }}
            animate={go ? { opacity: 1 } : undefined}
            transition={{ duration: 1, delay: 1.15 }}
          >
            {stats.slice(0, 3).map((s) => (
              <div key={s.label} className="flex items-baseline gap-3">
                <dt className="order-2 text-[12.5px] text-white/60">{s.label}</dt>
                <dd className="font-display text-[22px] font-semibold tracking-[-0.02em]">
                  {s.value.toLocaleString("en-IN")}
                  {s.suffix}
                </dd>
              </div>
            ))}
            <div className="flex items-baseline justify-end gap-3">
              <dd className="font-display text-[22px] font-semibold tracking-[-0.02em]">{hero.rating}★</dd>
              <dt className="text-[12.5px] text-white/60">{hero.ratingLabel}</dt>
            </div>
          </motion.dl>
        </motion.div>
      </motion.div>
    </section>
  );
}
