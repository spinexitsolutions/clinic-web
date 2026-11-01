"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { useRef } from "react";
import { ArrowUpRight, Star } from "lucide-react";
import type { Doctor, HomeContent } from "@/lib/types";
import { useIntroDone } from "@/components/motion/Intro";
import { Magnetic } from "@/components/motion/Magnetic";
import { Img } from "../Img";

const ease = [0.22, 1, 0.36, 1] as const;

function Line({ children, delay, go }: { children: React.ReactNode; delay: number; go: boolean }) {
  return (
    <span className="block overflow-hidden pb-[0.08em]">
      <motion.span
        className="block"
        initial={{ y: "110%", rotate: 3 }}
        animate={go ? { y: "0%", rotate: 0 } : undefined}
        transition={{ duration: 1.2, ease, delay }}
      >
        {children}
      </motion.span>
    </span>
  );
}

export function Hero({ hero, doctors }: { hero: HomeContent["hero"]; doctors: Doctor[] }) {
  const go = useIntroDone();
  const zoomRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: zoomRef, offset: ["start end", "end end"] });
  const width = useTransform(scrollYProgress, [0, 0.75], ["86%", "100%"]);
  const radius = useTransform(scrollYProgress, [0, 0.75], [40, 0]);
  const imgScale = useTransform(scrollYProgress, [0, 1], [1.25, 1]);
  const overlay = useTransform(scrollYProgress, [0.45, 0.9], [0, 1]);
  const overlayY = useTransform(scrollYProgress, [0.45, 0.9], [60, 0]);

  const avatars = doctors.slice(0, 4);

  return (
    <section className="relative">
      {/* soft aurora */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[90vh] overflow-hidden">
        <motion.div
          className="absolute -right-[20%] -top-[30%] h-[80vh] w-[80vh] rounded-full opacity-60 blur-[100px]"
          style={{ background: "radial-gradient(circle, var(--accent-soft), transparent 70%)" }}
          animate={{ x: [0, -40, 0], y: [0, 30, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="container-x relative pt-32 md:pt-44">
        {/* rotating badge */}
        <motion.div
          className="absolute right-10 top-52 hidden xl:block"
          initial={{ opacity: 0, scale: 0.6, rotate: -40 }}
          animate={go ? { opacity: 1, scale: 1, rotate: 0 } : undefined}
          transition={{ duration: 1.4, ease, delay: 0.4 }}
        >
          <Link href="/book" data-cursor="Book" className="group relative grid h-44 w-44 place-items-center">
            <motion.svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full" animate={{ rotate: 360 }} transition={{ duration: 22, repeat: Infinity, ease: "linear" }}>
              <defs>
                <path id="badge-circle" d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0" />
              </defs>
              <text className="fill-ink font-mono text-[13px] uppercase" style={{ letterSpacing: "0.32em" }}>
                <textPath href="#badge-circle" textLength="486" lengthAdjust="spacing">Same-day appointments · Book now ·</textPath>
              </text>
            </motion.svg>
            <span className="grid h-20 w-20 place-items-center rounded-full bg-accent text-accent-ink transition-transform duration-500 group-hover:scale-110">
              <ArrowUpRight className="h-7 w-7 transition-transform duration-500 group-hover:rotate-45" />
            </span>
          </Link>
        </motion.div>

        <motion.p
          className="eyebrow flex items-center gap-2"
          initial={{ opacity: 0, y: 10 }}
          animate={go ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.8, ease }}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-accent" /> {hero.eyebrow}
        </motion.p>

        <h1 className="display mt-6 text-[clamp(3.1rem,11vw,10.5rem)]">
          <Line go={go} delay={0.05}>{hero.titleLine1}</Line>
          <Line go={go} delay={0.15}>
            <span className="serif-accent pr-[0.06em] text-accent">{hero.titleAccent}</span>
          </Line>
          <Line go={go} delay={0.25}>{hero.titleLine2}</Line>
        </h1>

        <div className="mt-10 grid gap-10 md:mt-14 md:grid-cols-[1fr_auto] md:items-end">
          <motion.p
            className="max-w-md text-[17px] leading-relaxed text-muted md:text-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={go ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 1, ease, delay: 0.5 }}
          >
            {hero.subtitle}
          </motion.p>

          <motion.div
            className="flex flex-col gap-3 sm:flex-row sm:items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={go ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 1, ease, delay: 0.6 }}
          >
            <Magnetic>
              <Link href={hero.primaryCta.href} className="btn btn-primary h-14 w-full px-7 text-base sm:w-auto">
                {hero.primaryCta.label}
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Magnetic>
            <Link href={hero.secondaryCta.href} className="btn btn-ghost h-14 px-7 text-base">
              {hero.secondaryCta.label}
            </Link>
          </motion.div>
        </div>

        {/* social proof row */}
        <motion.div
          className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-4 border-t border-line pt-6"
          initial={{ opacity: 0 }}
          animate={go ? { opacity: 1 } : undefined}
          transition={{ duration: 1, delay: 0.8 }}
        >
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2.5">
              {avatars.map((d) => (
                <span key={d.id} className="relative h-9 w-9 overflow-hidden rounded-full ring-2 ring-bg">
                  <Img src={d.image} alt={d.name} fill sizes="36px" className="object-cover" />
                </span>
              ))}
            </div>
            <p className="text-sm text-muted">
              <span className="font-medium text-ink">24 specialists</span> on call today
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="flex text-[#F5A524]">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-current" strokeWidth={0} />
              ))}
            </span>
            <span className="font-medium">{hero.rating}</span>
            <span className="text-muted">{hero.ratingLabel}</span>
          </div>
        </motion.div>
      </div>

      {/* scroll-zoom image */}
      <div ref={zoomRef} className="relative mt-14 h-[150vh] md:mt-20 md:h-[190vh]">
        <div className="sticky top-0 flex h-[100svh] items-center justify-center overflow-hidden">
          <motion.div style={{ width, borderRadius: radius }} className="relative h-[78svh] overflow-hidden md:h-[100svh]">
            <motion.div style={{ scale: imgScale }} className="absolute inset-0">
              <Img src={hero.image} alt="Inside the clinic" fill priority sizes="100vw" className="object-cover" />
            </motion.div>
            <motion.div style={{ opacity: overlay }} className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-transparent" />

            {/* floating chips */}
            <motion.div
              className="glass absolute left-4 top-4 flex items-center gap-3 rounded-2xl p-2.5 pr-4 shadow-lg md:left-8 md:top-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease, delay: 0.2 }}
            >
              <span className="relative h-10 w-10 overflow-hidden rounded-xl">
                <Img src={doctors[1]?.image ?? hero.image} alt="" fill sizes="40px" className="object-cover" />
              </span>
              <span className="text-[12px] leading-tight">
                <span className="block text-muted">Next available</span>
                <span className="font-medium">Today · 4:30 PM</span>
              </span>
            </motion.div>

            <motion.div
              className="glass absolute right-4 top-4 hidden items-center gap-2 rounded-full px-4 py-2.5 text-[12px] font-medium shadow-lg sm:flex md:right-8 md:top-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease, delay: 0.35 }}
            >
              <span className="pulse-dot relative h-2 w-2 rounded-full bg-accent text-accent" /> Avg. wait under 7 min
            </motion.div>

            <motion.div style={{ opacity: overlay, y: overlayY }} className="absolute inset-x-0 bottom-0 p-6 text-white md:p-14">
              <p className="eyebrow !text-white/60">Welcome to Solace</p>
              <p className="mt-3 max-w-3xl text-[clamp(1.8rem,5vw,4.5rem)] font-medium leading-[1] tracking-[-0.04em]">
                Sunlit rooms. <span className="serif-accent">On-time</span> doctors. Zero clinic smell.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
