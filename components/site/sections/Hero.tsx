"use client";
import { motion, useMotionValue, useScroll, useSpring, useTransform } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, ArrowUpRight, ChevronDown, Star } from "lucide-react";
import type { Doctor, HomeContent, Service } from "@/lib/types";
import { useIntroDone } from "@/components/motion/Intro";
import { Magnetic } from "@/components/motion/Magnetic";
import { useSite } from "../SiteContext";
import { Icon } from "../Icon";
import { Img } from "../Img";
import { cn, openStatus } from "@/lib/utils";

const ease = [0.22, 1, 0.36, 1] as const;
const spring = { type: "spring", stiffness: 70, damping: 16, mass: 0.9 } as const;

/* ── building blocks ─────────────────────────────────────── */

function Words({ text, go, delay, className }: { text: string; go: boolean; delay: number; className?: string }) {
  return (
    <>
      {text.split(" ").map((w, i) => (
        <span key={i} className="inline-block overflow-hidden pb-[0.06em] -mb-[0.06em] align-bottom">
          <motion.span
            className={cn("inline-block", className)}
            initial={{ y: "108%" }}
            animate={go ? { y: "0%" } : undefined}
            transition={{ duration: 1.25, ease, delay: delay + i * 0.07 }}
          >
            {w}
          </motion.span>
        </span>
      ))}
    </>
  );
}

/** Inline capsule that grows out of the headline. */
function Pill({ go, delay, className, children, hover = true }: { go: boolean; delay: number; className?: string; children: React.ReactNode; hover?: boolean }) {
  return (
    <motion.span
      className={cn("relative inline-flex h-[0.74em] shrink-0 items-center overflow-hidden rounded-full align-middle", className)}
      initial={{ width: 0, opacity: 0 }}
      animate={go ? { width: "auto", opacity: 1 } : undefined}
      transition={{ width: { ...spring, delay }, opacity: { duration: 0.3, delay } }}
      whileHover={hover ? { scale: 1.04 } : undefined}
    >
      {children}
    </motion.span>
  );
}

/** Live "patient monitor" — an endless ECG trace. */
function EcgPill({ go, delay }: { go: boolean; delay: number }) {
  return (
    <Pill go={go} delay={delay} className="bg-accent">
      <span className="relative block h-full w-[1.55em] overflow-hidden">
        <span className="absolute inset-y-0 left-0 flex w-[200%] items-center" style={{ animation: "marquee 2.4s linear infinite" }}>
          {[0, 1].map((k) => (
            <svg key={k} viewBox="0 0 120 40" className="h-[70%] w-1/2" preserveAspectRatio="none" aria-hidden>
              <path d="M0 20 H18 L22 14 L26 26 L31 4 L36 34 L40 20 H78 L82 14 L86 26 L91 4 L96 34 L100 20 H120" fill="none" stroke="var(--highlight)" strokeWidth="2.6" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
            </svg>
          ))}
        </span>
        <span className="absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-accent to-transparent" />
      </span>
    </Pill>
  );
}

function ImagePill({ go, delay, src }: { go: boolean; delay: number; src: string }) {
  return (
    <Pill go={go} delay={delay} className="bg-accent-soft">
      <span className="relative block h-full w-[1.9em]">
        <motion.span className="absolute inset-0" initial={{ scale: 1.5 }} animate={go ? { scale: 1 } : undefined} transition={{ duration: 1.8, ease, delay }}>
          <Img src={src} alt="" fill priority sizes="300px" className="object-cover" />
        </motion.span>
      </span>
    </Pill>
  );
}

function AvatarPill({ go, delay, doctors }: { go: boolean; delay: number; doctors: Doctor[] }) {
  return (
    <Pill go={go} delay={delay} className="bg-white shadow-[inset_0_0_0_1px_var(--line)]">
      <span className="flex items-center gap-[0.08em] whitespace-nowrap py-[0.08em] pl-[0.09em] pr-[0.2em]">
        <span className="flex -space-x-[0.16em]">
          {doctors.slice(0, 3).map((d) => (
            <span key={d.id} className="relative block h-[0.56em] w-[0.56em] overflow-hidden rounded-full ring-[0.04em] ring-white">
              <Img src={d.image} alt="" fill sizes="80px" className="object-cover" />
            </span>
          ))}
        </span>
        <span className="pl-[0.08em] text-[0.24em] font-semibold leading-none tracking-[-0.02em] text-ink">
          24<span className="text-accent">+</span>
          <span className="block text-[0.62em] font-medium tracking-normal text-muted">doctors</span>
        </span>
      </span>
    </Pill>
  );
}

function LiveClock() {
  const { settings } = useSite();
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 15_000);
    return () => clearInterval(id);
  }, []);
  if (!now) return <span className="opacity-0">--:--</span>;
  const st = openStatus(settings.hours, now);
  return (
    <span className="inline-flex items-center gap-2">
      <span className="tabular-nums text-ink">{now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false })} IST</span>
      <span className="h-3 w-px bg-line" />
      <span className={cn("pulse-dot relative h-1.5 w-1.5 rounded-full", st.open ? "bg-accent text-accent" : "bg-coral text-coral")} />
      <span>{st.open ? "Open now" : st.label}</span>
    </span>
  );
}

function QuickBook({ services, go }: { services: Service[]; go: boolean }) {
  const router = useRouter();
  const [svc, setSvc] = useState(services[0]?.id ?? "");
  const [when, setWhen] = useState<"today" | "tomorrow" | "week">("today");
  const current = services.find((s) => s.id === svc);
  return (
    <motion.form
      onSubmit={(e) => {
        e.preventDefault();
        router.push(`/book?service=${svc}`);
      }}
      initial={{ opacity: 0, y: 30 }}
      animate={go ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 1.1, ease, delay: 0.75 }}
      className="relative rounded-[calc(var(--radius)*0.9)] bg-white p-2 shadow-[0_30px_60px_-30px_rgba(12,13,18,0.25),inset_0_0_0_1px_var(--line)]"
    >
      <div className="flex items-center justify-between px-3 pb-2 pt-1.5">
        <span className="eyebrow !text-[10px]">Quick booking</span>
        <span className="flex items-center gap-1.5 text-[11px] font-medium text-accent">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" /> 38 slots open today
        </span>
      </div>
      <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
        <label className="relative flex h-14 items-center gap-3 rounded-[calc(var(--radius)*0.6)] bg-bg px-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-accent text-accent-ink">
            <Icon name={current?.icon ?? "Stethoscope"} className="h-4 w-4" strokeWidth={2} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[11px] text-muted">I need help with</span>
            <span className="block truncate text-[15px] font-semibold tracking-[-0.01em]">{current?.name}</span>
          </span>
          <ChevronDown className="h-4 w-4 text-muted" />
          <select aria-label="Specialty" value={svc} onChange={(e) => setSvc(e.target.value)} className="absolute inset-0 cursor-pointer opacity-0">
            {services.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </label>
        <div className="flex h-14 items-center gap-1 rounded-[calc(var(--radius)*0.6)] bg-bg p-1">
          {(["today", "tomorrow", "week"] as const).map((w) => (
            <button
              type="button"
              key={w}
              onClick={() => setWhen(w)}
              className={cn("relative h-full flex-1 whitespace-nowrap rounded-[calc(var(--radius)*0.45)] px-2 text-[12px] font-medium capitalize transition-colors sm:flex-none sm:px-3 sm:text-[13px]", when === w ? "text-ink" : "text-muted hover:text-ink")}
            >
              {when === w && <motion.span layoutId="qb-when" className="absolute inset-0 rounded-[calc(var(--radius)*0.45)] bg-white shadow-sm" transition={{ duration: 0.5, ease }} />}
              <span className="relative">{w === "week" ? "Week" : w}</span>
            </button>
          ))}
        </div>
      </div>
      <button className="group mt-2 flex h-14 w-full items-center justify-between rounded-[calc(var(--radius)*0.6)] bg-ink pl-5 pr-2 text-[15px] font-semibold text-bg transition-colors duration-500 hover:bg-accent">
        Find my slot
        <span className="grid h-10 w-10 place-items-center rounded-full bg-highlight text-ink transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-rotate-45">
          <ArrowRight className="h-4 w-4" />
        </span>
      </button>
    </motion.form>
  );
}

/* ── hero ─────────────────────────────────────────────────── */

export function Hero({ hero, doctors, services }: { hero: HomeContent["hero"]; doctors: Doctor[]; services: Service[] }) {
  const go = useIntroDone();
  const sectionRef = useRef<HTMLElement>(null);

  // cursor spotlight
  const mx = useMotionValue(-1000);
  const my = useMotionValue(-1000);
  const sx = useSpring(mx, { stiffness: 60, damping: 20 });
  const sy = useSpring(my, { stiffness: 60, damping: 20 });

  // gentle exit as you scroll past
  const { scrollYProgress: out } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  const headY = useTransform(out, [0, 1], [0, -120]);
  const headO = useTransform(out, [0, 0.8], [1, 0.2]);

  // scroll-zoom showcase
  const zoomRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: zoomRef, offset: ["start end", "end end"] });
  const width = useTransform(scrollYProgress, [0, 0.75], ["74%", "100%"]);
  const radius = useTransform(scrollYProgress, [0, 0.75], [999, 0]);
  const zoomH = useTransform(scrollYProgress, [0, 0.75], ["38svh", "100svh"]);
  const imgScale = useTransform(scrollYProgress, [0, 1], [1.35, 1]);
  const overlay = useTransform(scrollYProgress, [0.5, 0.9], [0, 1]);
  const overlayY = useTransform(scrollYProgress, [0.5, 0.9], [60, 0]);

  return (
    <>
      <section
        ref={sectionRef}
        onPointerMove={(e) => {
          if (e.pointerType !== "mouse") return;
          const r = e.currentTarget.getBoundingClientRect();
          mx.set(e.clientX - r.left);
          my.set(e.clientY - r.top);
        }}
        className="relative flex min-h-[calc(100svh-2.5rem)] flex-col overflow-hidden pb-5 pt-[104px] md:pb-7 md:pt-[120px]"
      >
        {/* cursor spotlight */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute left-0 top-0 h-[640px] w-[640px] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ x: sx, y: sy, background: "radial-gradient(circle, color-mix(in oklab, var(--accent) 16%, transparent), transparent 62%)" }}
        />

        {/* editorial column guides */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="container-x relative h-full">
            {[0, 25, 50, 75, 100].map((p, i) => (
              <motion.span
                key={p}
                className={cn("absolute top-0 h-full w-px origin-top bg-line", (p === 25 || p === 75) && "hidden md:block")}
                style={{ left: `calc(${p}% ${p === 0 ? "+ 1.25rem" : p === 100 ? "- 1.25rem" : ""})` }}
                initial={{ scaleY: 0 }}
                animate={go ? { scaleY: 1 } : undefined}
                transition={{ duration: 1.6, ease, delay: i * 0.06 }}
              />
            ))}
          </div>
        </div>

        <motion.div style={{ y: headY, opacity: headO }} className="container-x relative flex flex-1 flex-col">
          {/* meta row */}
          <motion.div
            className="grid grid-cols-2 items-center gap-4 border-b border-line pb-4 text-[12px] font-medium text-muted md:grid-cols-4"
            initial={{ opacity: 0 }}
            animate={go ? { opacity: 1 } : undefined}
            transition={{ duration: 1, delay: 0.1 }}
          >
            <span className="flex items-center gap-2">
              <span className="grid h-5 min-w-5 place-items-center rounded-full bg-ink px-1.5 text-[10px] font-semibold text-bg">01</span>
              {hero.eyebrow.split("·")[0].trim()}
            </span>
            <span className="hidden md:block">{hero.eyebrow.split("·")[1]?.trim() ?? "Bengaluru"}</span>
            <span className="hidden md:block">Since 2014 · NABH accredited</span>
            <span className="justify-self-end"><LiveClock /></span>
          </motion.div>

          {/* headline */}
          <h1 className="mt-8 font-display text-[clamp(3rem,14.5vw,10rem)] font-semibold leading-[0.9] tracking-[-0.04em] sm:text-[clamp(3rem,9.4vw,11rem)] md:mt-10">
            <span className="flex flex-wrap items-center gap-x-[0.18em]">
              <Words text={hero.titleLine1} go={go} delay={0.05} />
              <ImagePill go={go} delay={0.7} src={hero.image} />
            </span>
            <span className="flex flex-wrap items-center gap-x-[0.16em] lg:pl-[1.1em]">
              <EcgPill go={go} delay={0.85} />
              <Words text={hero.titleAccent} go={go} delay={0.18} className="serif-accent pr-[0.04em] tracking-[-0.03em] text-accent" />
              <span className="hidden sm:inline-flex">
                <AvatarPill go={go} delay={1} doctors={doctors} />
              </span>
            </span>
            <span className="flex flex-wrap items-center gap-x-[0.2em] lg:justify-end">
              <Words text={hero.titleLine2} go={go} delay={0.3} />
            </span>
          </h1>

          {/* bottom band */}
          <div className="mt-10 grid gap-8 md:mt-auto md:pt-8 lg:grid-cols-12 lg:items-end lg:gap-6">
            <motion.div
              className="lg:col-span-4"
              initial={{ opacity: 0, y: 24 }}
              animate={go ? { opacity: 1, y: 0 } : undefined}
              transition={{ duration: 1.1, ease, delay: 0.6 }}
            >
              <p className="max-w-[34ch] text-[17px] leading-[1.55] text-ink/70">{hero.subtitle}</p>
              <div className="mt-6 flex flex-wrap items-center gap-2">
                <Magnetic>
                  <Link href={hero.primaryCta.href} className="btn btn-accent h-13 px-6">
                    {hero.primaryCta.label} <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </Magnetic>
                <Link href={hero.secondaryCta.href} className="btn btn-ghost h-13 px-6">
                  {hero.secondaryCta.label}
                </Link>
              </div>
            </motion.div>

            <div className="lg:col-span-5 lg:col-start-6">
              <QuickBook services={services} go={go} />
            </div>

            <motion.div
              className="flex items-end justify-between gap-6 lg:col-span-2 lg:col-start-11 lg:flex-col lg:items-end lg:text-right"
              initial={{ opacity: 0, y: 24 }}
              animate={go ? { opacity: 1, y: 0 } : undefined}
              transition={{ duration: 1.1, ease, delay: 0.9 }}
            >
              <div>
                <p className="font-display text-[56px] font-semibold leading-none tracking-[-0.032em]">
                  {hero.rating}
                  <span className="text-accent">★</span>
                </p>
                <p className="mt-2 text-[13px] leading-snug text-muted">{hero.ratingLabel}</p>
              </div>
              <div className="flex gap-0.5 text-ink lg:mt-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-current" strokeWidth={0} />
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* the capsule opens up: scroll-zoom showcase */}
      <div ref={zoomRef} className="relative h-[170vh] md:h-[220vh]">
        <div className="sticky top-0 flex h-[100svh] items-center justify-center overflow-hidden">
          <motion.div style={{ width, borderRadius: radius, height: zoomH }} className="relative overflow-hidden">
            <motion.div style={{ scale: imgScale }} className="absolute inset-0">
              <Img src={hero.image} alt="Inside the clinic" fill sizes="100vw" className="object-cover" />
            </motion.div>
            <motion.div style={{ opacity: overlay }} className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/25 to-transparent" />
            <motion.div style={{ opacity: overlay, y: overlayY }} className="absolute inset-x-0 bottom-0 flex flex-col gap-6 p-6 text-white md:flex-row md:items-end md:justify-between md:p-14">
              <p className="max-w-3xl font-display text-[clamp(2rem,5.4vw,5rem)] font-semibold leading-[0.95] tracking-[-0.025em]">
                Sunlit rooms. <span className="serif-accent text-highlight">On-time</span> doctors. Zero clinic smell.
              </p>
              <div className="flex gap-2 md:mb-2">
                {["7 min avg. wait", "Free valet", "Wheelchair friendly"].map((t) => (
                  <span key={t} className="glass-dark whitespace-nowrap rounded-full px-3.5 py-2 text-[12px] font-medium text-white/90">{t}</span>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
