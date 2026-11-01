"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { useRef } from "react";
import { ArrowUpRight, CalendarCheck, MessageCircle, Siren } from "lucide-react";
import type { HomeContent, Insurance } from "@/lib/types";
import { useSite } from "../SiteContext";
import { Img } from "../Img";

const ease = [0.22, 1, 0.36, 1] as const;

/** Final stage: one dark panel, three ways to reach care. */
export function CTA({ cta, insurers, insurersLabel = "30+ insurers" }: { cta: HomeContent["cta"]; insurers: Insurance[]; insurersLabel?: string }) {
  const { settings } = useSite();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "start 0.25"] });
  const scale = useTransform(scrollYProgress, [0, 1], [0.94, 1]);
  const imgY = useTransform(scrollYProgress, [0, 1], ["12%", "0%"]);

  const words = cta.title.split(" ");
  const last = words.pop();
  const wa = `https://wa.me/${settings.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(`Hi ${settings.shortName}, I'd like to book an appointment.`)}`;

  const channels = [
    {
      href: "/book",
      external: false,
      icon: CalendarCheck,
      kicker: "Online · 40 seconds",
      title: "Book a visit",
      sub: "Pick a doctor and a live slot",
      cls: "bg-highlight text-ink",
      iconCls: "bg-ink text-highlight",
    },
    {
      href: wa,
      external: true,
      icon: MessageCircle,
      kicker: "WhatsApp · replies in minutes",
      title: "Chat with us",
      sub: settings.phone,
      cls: "bg-bg/[0.07] text-bg hover:bg-bg/[0.12]",
      iconCls: "bg-[#25D366] text-white",
    },
    {
      href: `tel:${settings.emergencyPhone.replace(/\s/g, "")}`,
      external: false,
      icon: Siren,
      kicker: "Emergency · 24 × 7",
      title: settings.emergencyPhone,
      sub: "Ambulance & urgent care",
      cls: "bg-coral text-white",
      iconCls: "bg-white text-coral",
    },
  ];

  return (
    <section className="pb-16 pt-6 md:pb-24">
      {insurers.length > 0 && (
        <div className="container-x mb-12 flex items-center gap-6 md:mb-16">
          <p className="shrink-0 text-[12px] font-semibold uppercase leading-tight tracking-[0.14em] text-muted">
            Cashless with
            <span className="block text-ink">{insurersLabel}</span>
          </p>
          <div className="flex min-w-0 flex-1 overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_10%,black_90%,transparent)]">
            <div className="animate-marquee flex shrink-0 items-center gap-10 pr-10" style={{ ["--marquee-duration" as string]: "32s" }}>
              {[...insurers, ...insurers].map((x, i) => (
                <span key={i} className="whitespace-nowrap font-display text-[22px] font-semibold tracking-[-0.025em] text-ink/30">
                  {x.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      <div ref={ref} className="px-2 md:px-3">
        <motion.div
          style={{ scale }}
          className="relative overflow-hidden rounded-[calc(var(--radius)*1.15)] bg-ink text-bg"
        >
          {/* side photo */}
          <motion.div style={{ y: imgY }} className="absolute inset-y-0 right-0 hidden w-[46%] lg:block">
            <Img src={cta.image} alt="" fill sizes="45vw" className="object-cover opacity-70" />
            <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/40 to-transparent" />
          </motion.div>
          <div aria-hidden className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-accent/40 blur-[120px]" />

          <div className="relative px-6 py-14 md:px-12 md:py-20 lg:px-16 lg:py-24">
            <motion.p
              className="eyebrow !text-bg/50"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              Your next step
            </motion.p>
            <h2 className="mt-5 max-w-[11ch] text-[clamp(3rem,9vw,8.4rem)] font-semibold leading-[0.88] tracking-[-0.045em]">
              {words.map((w, i) => (
                <span key={i} className="inline-block overflow-hidden pb-[0.06em] align-bottom">
                  <motion.span
                    className="inline-block"
                    initial={{ y: "105%" }}
                    whileInView={{ y: "0%" }}
                    viewport={{ once: true, margin: "0px 0px -10% 0px" }}
                    transition={{ duration: 1.1, ease, delay: i * 0.07 }}
                  >
                    {w}&nbsp;
                  </motion.span>
                </span>
              ))}
              <span className="inline-block overflow-hidden pb-[0.06em] align-bottom">
                <motion.span
                  className="serif-accent inline-block text-highlight"
                  initial={{ y: "105%" }}
                  whileInView={{ y: "0%" }}
                  viewport={{ once: true, margin: "0px 0px -10% 0px" }}
                  transition={{ duration: 1.1, ease, delay: words.length * 0.07 }}
                >
                  {last}
                </motion.span>
              </span>
            </h2>
            <p className="mt-6 max-w-md text-[17px] leading-relaxed text-bg/65">{cta.subtitle}</p>

            <div className="mt-12 grid gap-3 md:grid-cols-3 lg:max-w-[920px]">
              {channels.map((c, i) => {
                const inner = (
                  <>
                    <div className="flex items-start justify-between">
                      <span className={`grid h-11 w-11 place-items-center rounded-full ${c.iconCls}`}>
                        <c.icon className="h-5 w-5" />
                      </span>
                      <ArrowUpRight className="h-5 w-5 opacity-60 transition-transform duration-500 group-hover:rotate-45 group-hover:opacity-100" />
                    </div>
                    <div className="mt-10">
                      <p className="text-[11.5px] font-semibold uppercase tracking-[0.12em] opacity-70">{c.kicker}</p>
                      <p className="mt-1.5 font-display text-[22px] font-semibold leading-tight tracking-[-0.02em]">{c.title}</p>
                      <p className="mt-1 text-[13px] opacity-70">{c.sub}</p>
                    </div>
                  </>
                );
                const cls = `group flex h-full flex-col rounded-[calc(var(--radius)*0.8)] p-5 transition-all duration-500 hover:-translate-y-1 ${c.cls}`;
                return (
                  <motion.div
                    key={c.title}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "0px 0px -10% 0px" }}
                    transition={{ duration: 0.9, ease, delay: 0.25 + i * 0.08 }}
                  >
                    {c.external ? (
                      <a href={c.href} target="_blank" rel="noreferrer" className={cls}>{inner}</a>
                    ) : c.href.startsWith("/") ? (
                      <Link href={c.href} className={cls}>{inner}</Link>
                    ) : (
                      <a href={c.href} className={cls}>{inner}</a>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
