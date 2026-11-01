"use client";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowUpRight, MessageCircle, Phone, Plus } from "lucide-react";
import type { FAQ as FAQItem } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useSite } from "../SiteContext";
import { Img } from "../Img";
import { heading as headingFor } from "@/lib/headings";
import type { SectionHeading } from "@/lib/types";

const ease = [0.22, 1, 0.36, 1] as const;

export function FAQList({ faqs }: { faqs: FAQItem[] }) {
  const [open, setOpen] = useState<string | null>(faqs[0]?.id ?? null);
  return (
    <ul className="border-t border-line">
      {faqs.map((f, i) => {
        const isOpen = open === f.id;
        return (
          <li key={f.id} className="relative border-b border-line">
            <motion.span
              aria-hidden
              className="absolute left-0 top-0 h-full w-[3px] origin-top rounded-full bg-accent"
              initial={false}
              animate={{ scaleY: isOpen ? 1 : 0 }}
              transition={{ duration: 0.5, ease }}
            />
            <button
              onClick={() => setOpen(isOpen ? null : f.id)}
              aria-expanded={isOpen}
              className={cn("flex w-full items-start gap-5 py-6 text-left transition-[padding] duration-500 md:py-7", isOpen ? "pl-5 md:pl-7" : "pl-0")}
            >
              <span className={cn("pt-1 font-display text-[14px] font-semibold tabular-nums transition-colors", isOpen ? "text-accent" : "text-muted")}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="flex-1 font-display text-[19px] font-semibold leading-snug tracking-[-0.02em] md:text-[22px]">{f.question}</span>
              <motion.span
                animate={{ rotate: isOpen ? 45 : 0 }}
                transition={{ duration: 0.45, ease }}
                className={cn(
                  "grid h-9 w-9 shrink-0 place-items-center rounded-full transition-colors duration-500",
                  isOpen ? "bg-accent text-accent-ink" : "bg-white text-ink shadow-[inset_0_0_0_1px_var(--line)]",
                )}
              >
                <Plus className="h-4 w-4" />
              </motion.span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ height: { duration: 0.5, ease }, opacity: { duration: 0.35 } }}
                  className="overflow-hidden"
                >
                  <p className="max-w-2xl pb-7 pl-[3.1rem] pr-12 text-[16px] leading-relaxed text-muted md:pl-[3.6rem] md:text-[17px]">{f.answer}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </li>
        );
      })}
    </ul>
  );
}

const TEAM = [
  "https://images.unsplash.com/photo-1559839734-2b71ea197ec2",
  "https://images.unsplash.com/photo-1594824476967-48c8b964273f",
  "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d",
];

/** Home FAQ block: heading, category chips, refined list, and a care-team card. */
export function FAQSection({ faqs, avatars = TEAM, heading }: { faqs: FAQItem[]; avatars?: string[]; heading?: Partial<SectionHeading> }) {
  const H = headingFor("faq", heading);
  const { settings } = useSite();
  const cats = useMemo(() => ["All", ...Array.from(new Set(faqs.map((f) => f.category)))], [faqs]);
  const [cat, setCat] = useState("All");
  const list = faqs.filter((f) => cat === "All" || f.category === cat);
  const wa = `https://wa.me/${settings.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(`Hi ${settings.shortName}, I have a question.`)}`;

  return (
    <section className="container-x grid gap-12 py-20 md:py-32 lg:grid-cols-12 lg:gap-10">
      <div className="min-w-0 lg:col-span-4">
        <div className="lg:sticky lg:top-32">
          <p className="eyebrow">{H.eyebrow}</p>
          <h2 className="mt-4 text-[clamp(2.3rem,5vw,4.2rem)] font-semibold leading-[0.95] tracking-[-0.035em]">
            {H.title} <span className="serif-accent text-accent">{H.accent}</span>
          </h2>

          <div className="mt-10 rounded-[var(--radius)] bg-ink p-6 text-bg">
            <div className="flex -space-x-2.5">
              {avatars.slice(0, 3).map((a) => (
                <span key={a} className="relative h-11 w-11 overflow-hidden rounded-full ring-[3px] ring-ink">
                  <Img src={a} alt="" fill sizes="44px" className="object-cover" />
                </span>
              ))}
              <span className="relative grid h-11 w-11 place-items-center rounded-full bg-highlight ring-[3px] ring-ink">
                <span className="pulse-dot relative h-2 w-2 rounded-full bg-accent text-accent" />
              </span>
            </div>
            <p className="mt-5 font-display text-[22px] font-semibold leading-tight tracking-[-0.02em]">Still have questions?</p>
            <p className="mt-2 text-[14px] leading-relaxed text-bg/60">Our care team replies in minutes during opening hours — no bots.</p>
            <div className="mt-6 grid grid-cols-2 gap-2">
              <a href={`tel:${settings.phone.replace(/\s/g, "")}`} className="flex h-12 items-center justify-center gap-2 rounded-full bg-bg/10 text-[14px] font-semibold transition-colors hover:bg-bg/20">
                <Phone className="h-4 w-4" /> Call
              </a>
              <a href={wa} target="_blank" rel="noreferrer" className="flex h-12 items-center justify-center gap-2 rounded-full bg-[#25D366] text-[14px] font-semibold text-white transition-transform active:scale-95">
                <MessageCircle className="h-4 w-4" /> WhatsApp
              </a>
            </div>
          </div>
          <Link href="/faq" className="mt-5 inline-flex items-center gap-1.5 text-[14px] font-semibold text-accent hover:underline">
            {H.link} <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="min-w-0 lg:col-span-7 lg:col-start-6">
        <div className="no-scrollbar -mx-5 mb-6 flex gap-2 overflow-x-auto px-5 md:mx-0 md:px-0">
          {cats.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={cn("relative h-10 shrink-0 rounded-full px-4 text-[14px] font-medium transition-colors", cat === c ? "text-bg" : "text-ink/70 shadow-[inset_0_0_0_1px_var(--line)] hover:text-ink")}
            >
              {cat === c && <motion.span layoutId="faq-cat" className="absolute inset-0 rounded-full bg-ink" transition={{ duration: 0.5, ease }} />}
              <span className="relative">{c}</span>
            </button>
          ))}
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={cat} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.4, ease }}>
            <FAQList faqs={list} />
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
