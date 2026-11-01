"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import type { Service } from "@/lib/types";
import { money } from "@/lib/utils";
import { Img } from "../Img";
import { Icon } from "../Icon";
import { SplitWords } from "@/components/motion/Reveal";

function Card({ s, i, currency }: { s: Service; i: number; currency: string }) {
  return (
    <Link
      href={`/services/${s.slug}`}
      data-cursor="Explore"
      className="group relative flex h-[min(68svh,560px)] w-[82vw] shrink-0 snap-start flex-col overflow-hidden rounded-[var(--radius)] bg-card hairline sm:w-[380px] md:w-[420px]"
    >
      <div className="relative h-[58%] overflow-hidden">
        <Img src={s.image} alt={s.name} fill sizes="(max-width:768px) 82vw, 420px" className="object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.06]" />
        <span className="glass absolute left-4 top-4 grid h-11 w-11 place-items-center rounded-full">
          <Icon name={s.icon} className="h-5 w-5" />
        </span>
        <span className="absolute right-4 top-4 font-mono text-[11px] text-white/90 mix-blend-difference">{String(i + 1).padStart(2, "0")}</span>
      </div>
      <div className="flex flex-1 flex-col p-6">
        <h3 className="text-[26px] font-medium leading-none tracking-[-0.025em]">{s.name}</h3>
        <p className="mt-3 line-clamp-2 text-[15px] leading-relaxed text-muted">{s.short}</p>
        <div className="mt-auto flex items-center justify-between pt-5">
          <span className="text-sm">
            <span className="text-muted">From </span>
            <span className="font-medium">{money(s.priceFrom, currency)}</span>
          </span>
          <span className="grid h-10 w-10 place-items-center rounded-full bg-ink text-bg transition-all duration-500 group-hover:rotate-45 group-hover:bg-accent">
            <ArrowUpRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}

/** Pinned horizontal gallery on desktop, swipeable snap carousel on mobile. */
export function Services({ services, currency }: { services: Service[]; currency: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [distance, setDistance] = useState(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, [0, 1], [0, -distance]);
  const bar = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  useEffect(() => {
    const measure = () => {
      if (!trackRef.current) return;
      setDistance(Math.max(0, trackRef.current.scrollWidth - window.innerWidth + 80));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [services.length]);

  const header = (
    <div className="container-x flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="eyebrow">Specialties · {services.length}</p>
        <h2 className="mt-4 max-w-[14ch] text-[clamp(2.4rem,6vw,5.2rem)] font-semibold leading-[0.92] tracking-[-0.025em]">
          <SplitWords text="Everything you need," /> <span className="serif-accent text-accent"><SplitWords text="under one roof." delay={0.15} /></span>
        </h2>
      </div>
      <Link href="/services" className="btn btn-ghost self-start md:self-auto">
        All services <ArrowUpRight className="h-4 w-4" />
      </Link>
    </div>
  );

  return (
    <section id="services" className="relative">
      {/* mobile / tablet */}
      <div className="py-20 lg:hidden">
        {header}
        <div className="no-scrollbar mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-pl-5 px-5 pb-4 md:scroll-pl-10 md:px-10">
          {services.map((s, i) => (
            <Card key={s.id} s={s} i={i} currency={currency} />
          ))}
        </div>
      </div>

      {/* desktop pinned */}
      <div ref={ref} className="relative hidden lg:block" style={{ height: `calc(100vh + ${distance}px)` }}>
        <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
          {header}
          <motion.div ref={trackRef} style={{ x }} className="mt-12 flex gap-5 pl-10 pr-10 xl:pl-[max(2.5rem,calc((100vw-1320px)/2+2.5rem))]">
            {services.map((s, i) => (
              <Card key={s.id} s={s} i={i} currency={currency} />
            ))}
          </motion.div>
          <div className="container-x mt-10">
            <div className="h-px w-full bg-line">
              <motion.div className="h-px bg-ink" style={{ width: bar }} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
