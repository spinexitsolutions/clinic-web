"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { useRef } from "react";
import { ArrowUpRight } from "lucide-react";
import type { HomeContent, Insurance } from "@/lib/types";
import { Img } from "../Img";
import { Magnetic } from "@/components/motion/Magnetic";

export function CTA({ cta, insurers }: { cta: HomeContent["cta"]; insurers: Insurance[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });
  const clip = useTransform(scrollYProgress, [0, 0.8], ["inset(18% 10% 18% 10% round 48px)", "inset(0% 0% 0% 0% round 32px)"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1.3, 1]);
  return (
    <section className="pb-20 pt-10 md:pb-28">
      {insurers.length > 0 && (
        <div className="container-x mb-16 md:mb-24">
          <p className="eyebrow mb-6 text-center">Cashless with 30+ insurers</p>
          <div className="flex overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_10%,black_90%,transparent)]">
            <div className="animate-marquee flex shrink-0 gap-12 pr-12" style={{ ["--marquee-duration" as string]: "30s" }}>
              {[...insurers, ...insurers].map((x, i) => (
                <span key={i} className="whitespace-nowrap text-[22px] font-medium tracking-[-0.03em] text-ink/35">{x.name}</span>
              ))}
            </div>
          </div>
        </div>
      )}
      <div ref={ref} className="px-3 md:px-5">
        <motion.div style={{ clipPath: clip }} className="relative h-[86svh] overflow-hidden">
          <motion.div style={{ scale }} className="absolute inset-0">
            <Img src={cta.image} alt="" fill sizes="100vw" className="object-cover" />
          </motion.div>
          <div className="absolute inset-0 bg-ink/45" />
          <div className="relative flex h-full flex-col items-center justify-center px-6 text-center text-white">
            <h2 className="max-w-[12ch] text-[clamp(3rem,10vw,9rem)] font-medium leading-[0.9] tracking-[-0.032em]">
              {cta.title.split(" ").slice(0, -1).join(" ")} <span className="serif-accent">{cta.title.split(" ").slice(-1)}</span>
            </h2>
            <p className="mt-6 max-w-md text-[17px] text-white/80">{cta.subtitle}</p>
            <Magnetic className="mt-10">
              <Link href="/book" className="btn h-16 bg-white px-8 text-[17px] text-ink hover:bg-accent hover:text-accent-ink">
                Book your visit <ArrowUpRight className="h-5 w-5" />
              </Link>
            </Magnetic>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
