"use client";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowUpRight, CalendarPlus, CornerDownLeft, FileText, PhoneCall, Search, Siren } from "lucide-react";
import type { NavData } from "./types";
import { useSite } from "../SiteContext";
import { Icon } from "../Icon";
import { Img } from "../Img";
import { cn } from "@/lib/utils";

type Item = { id: string; group: string; label: string; hint?: string; href: string; icon?: React.ReactNode; external?: boolean };

const ease = [0.22, 1, 0.36, 1] as const;

/** ⌘K — search specialties, doctors, articles and quick actions. */
export function CommandPalette({ open, onClose, data }: { open: boolean; onClose: () => void; data: NavData }) {
  const { settings, appearance } = useSite();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const all = useMemo<Item[]>(() => {
    const tel = (n: string) => `tel:${n.replace(/\s/g, "")}`;
    return [
      { id: "a-book", group: "Quick actions", label: "Book an appointment", hint: "Takes 40 seconds", href: "/book", icon: <CalendarPlus className="h-4 w-4" /> },
      { id: "a-call", group: "Quick actions", label: "Call the clinic", hint: settings.phone, href: tel(settings.phone), icon: <PhoneCall className="h-4 w-4" />, external: true },
      { id: "a-sos", group: "Quick actions", label: "Emergency 24×7", hint: settings.emergencyPhone, href: tel(settings.emergencyPhone), icon: <Siren className="h-4 w-4 text-coral" />, external: true },
      ...data.services.map((s) => ({ id: s.id, group: "Specialties", label: s.name, hint: s.short, href: `/services/${s.slug}`, icon: <Icon name={s.icon} className="h-4 w-4" /> })),
      ...data.doctors.map((d) => ({
        id: d.id,
        group: "Doctors",
        label: d.name,
        hint: d.specialty,
        href: `/doctors/${d.slug}`,
        icon: (
          <span className="relative block h-7 w-7 overflow-hidden rounded-full">
            <Img src={d.image} alt="" fill sizes="28px" className="object-cover" />
          </span>
        ),
      })),
      ...data.posts.map((p) => ({ id: p.slug, group: "Journal", label: p.title, hint: p.category, href: `/blog/${p.slug}`, icon: <FileText className="h-4 w-4" /> })),
      ...appearance.nav.filter((n) => n.visible).map((n) => ({ id: n.id, group: "Pages", label: n.label, href: n.href, icon: <ArrowUpRight className="h-4 w-4" /> })),
      { id: "p-track", group: "Pages", label: "Track my booking", href: "/track", icon: <ArrowUpRight className="h-4 w-4" /> },
    ];
  }, [data, settings, appearance.nav]);

  const results = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return all.filter((i) => i.group === "Quick actions" || (i.group === "Specialties" && data.services.find((s) => s.id === i.id)?.featured));
    return all.filter((i) => `${i.label} ${i.hint ?? ""} ${i.group}`.toLowerCase().includes(t)).slice(0, 14);
  }, [q, all, data.services]);

  useEffect(() => {
    if (open) {
      setQ("");
      setActive(0);
      setTimeout(() => inputRef.current?.focus(), 60);
    }
  }, [open]);
  useEffect(() => setActive(0), [q]);

  const go = (it: Item) => {
    onClose();
    if (it.external) window.location.href = it.href;
    else router.push(it.href);
  };

  const groups = Array.from(new Set(results.map((r) => r.group)));

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[80] flex items-start justify-center px-3 pt-[10vh]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            role="dialog"
            aria-label="Search"
            className="relative w-full max-w-[640px] overflow-hidden rounded-[calc(var(--radius)*0.9)] bg-white shadow-[0_40px_120px_-30px_rgba(0,0,0,0.5)]"
            initial={{ y: -16, scale: 0.98 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: -10, scale: 0.98, opacity: 0 }}
            transition={{ duration: 0.35, ease }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(results.length - 1, a + 1)); }
              if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(0, a - 1)); }
              if (e.key === "Enter" && results[active]) go(results[active]);
              if (e.key === "Escape") onClose();
            }}
          >
            <div className="flex items-center gap-3 border-b border-line px-5">
              <Search className="h-5 w-5 text-muted" />
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search specialties, doctors, articles…"
                className="h-16 flex-1 bg-transparent text-[17px] outline-none placeholder:text-ink/35"
              />
              <kbd className="rounded-md border border-line px-1.5 py-0.5 text-[11px] text-muted">esc</kbd>
            </div>
            <div className="max-h-[56vh] overflow-y-auto p-2" data-lenis-prevent>
              {results.length === 0 && <p className="px-4 py-10 text-center text-muted">No matches for “{q}”. Try “heart”, “teeth” or a doctor’s name.</p>}
              {groups.map((g) => (
                <div key={g} className="mb-1">
                  <p className="px-3 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">{g}</p>
                  {results.map((r, idx) =>
                    r.group !== g ? null : (
                      <button
                        key={r.group + r.id}
                        onMouseMove={() => setActive(idx)}
                        onClick={() => go(r)}
                        className={cn("flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors", idx === active ? "bg-accent text-accent-ink" : "hover:bg-bg")}
                      >
                        <span className={cn("grid h-8 w-8 shrink-0 place-items-center rounded-lg", idx === active ? "bg-white/15" : "bg-bg")}>{r.icon}</span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[15px] font-medium">{r.label}</span>
                          {r.hint && <span className={cn("block truncate text-[12.5px]", idx === active ? "text-accent-ink/70" : "text-muted")}>{r.hint}</span>}
                        </span>
                        {idx === active && <CornerDownLeft className="h-4 w-4 shrink-0 opacity-70" />}
                      </button>
                    ),
                  )}
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between border-t border-line bg-bg/60 px-5 py-2.5 text-[11.5px] text-muted">
              <span>↑ ↓ to navigate · ↵ to open</span>
              <span>{settings.name}</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
