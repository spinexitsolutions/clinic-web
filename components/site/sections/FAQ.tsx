"use client";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { Plus } from "lucide-react";
import type { FAQ as FAQItem } from "@/lib/types";

export function FAQList({ faqs }: { faqs: FAQItem[] }) {
  const [open, setOpen] = useState<string | null>(faqs[0]?.id ?? null);
  return (
    <ul className="border-t border-line">
      {faqs.map((f) => {
        const isOpen = open === f.id;
        return (
          <li key={f.id} className="border-b border-line">
            <button
              onClick={() => setOpen(isOpen ? null : f.id)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-6 py-6 text-left md:py-7"
            >
              <span className="text-[19px] font-medium leading-snug tracking-[-0.02em] md:text-[22px]">{f.question}</span>
              <motion.span
                animate={{ rotate: isOpen ? 45 : 0, backgroundColor: isOpen ? "var(--accent)" : "rgba(0,0,0,0)", color: isOpen ? "var(--accent-ink)" : "var(--ink)" }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-line"
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
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <p className="max-w-2xl pb-7 pr-14 text-[16px] leading-relaxed text-muted md:text-[17px]">{f.answer}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </li>
        );
      })}
    </ul>
  );
}
