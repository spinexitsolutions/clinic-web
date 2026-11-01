"use client";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowUpRight, CalendarPlus, House, LayoutGrid, Menu, Phone, Search, Siren, UserRound, X } from "lucide-react";
import { getLenis } from "@/components/motion/SmoothScroll";
import { useSite } from "../SiteContext";
import type { NavData } from "./types";
import { cn } from "@/lib/utils";

const ease = [0.22, 1, 0.36, 1] as const;

/** App-style bottom dock for phones, with a pull-up menu sheet. */
export function MobileDock({ data, onSearch }: { data: NavData; onSearch: () => void }) {
  const { settings, appearance } = useSite();
  const pathname = usePathname();
  const [sheet, setSheet] = useState(false);
  const [compact, setCompact] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    if (y > prev + 8 && y > 300) setCompact(true);
    else if (y < prev - 8) setCompact(false);
  });

  useEffect(() => setSheet(false), [pathname]);
  useEffect(() => {
    const lenis = getLenis();
    if (sheet) lenis?.stop();
    else lenis?.start();
    document.documentElement.style.overflow = sheet ? "hidden" : "";
  }, [sheet]);

  const items = [
    { href: "/", label: "Home", icon: House },
    { href: "/services", label: "Care", icon: LayoutGrid },
    { href: "/book", label: "Book", icon: CalendarPlus, primary: true },
    { href: "/doctors", label: "Doctors", icon: UserRound },
  ];
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
  const wa = `https://wa.me/${settings.whatsapp.replace(/\D/g, "")}`;

  return (
    <div className="lg:hidden">
      <AnimatePresence>
        {sheet && (
          <>
            <motion.div className="fixed inset-0 z-[55] bg-ink/40 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSheet(false)} />
            <motion.div
              className="fixed inset-x-2 bottom-2 z-[56] max-h-[86svh] overflow-y-auto rounded-[30px] bg-bg p-3 pb-24 shadow-2xl"
              initial={{ y: "105%" }}
              animate={{ y: 0 }}
              exit={{ y: "105%" }}
              transition={{ duration: 0.55, ease }}
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.4 }}
              onDragEnd={(_, i) => i.offset.y > 90 && setSheet(false)}
              data-lenis-prevent
            >
              <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-ink/15" />
              <button onClick={() => { setSheet(false); onSearch(); }} className="mb-3 flex h-12 w-full items-center gap-3 rounded-2xl bg-white px-4 text-[15px] text-muted shadow-[inset_0_0_0_1px_var(--line)]">
                <Search className="h-4 w-4" /> Search specialties, doctors…
              </button>
              <ul>
                {[...appearance.nav.filter((n) => n.visible), { id: "trk", label: "Track booking", href: "/track", visible: true }].map((l, i) => (
                  <motion.li key={l.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.04, duration: 0.5, ease }}>
                    <Link href={l.href} className="flex items-center justify-between border-b border-line px-2 py-3.5">
                      <span className={cn("font-display text-[28px] font-semibold tracking-[-0.03em]", isActive(l.href) && "text-accent")}>{l.label}</span>
                      <ArrowUpRight className="h-5 w-5 text-muted" />
                    </Link>
                  </motion.li>
                ))}
              </ul>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <a href={`tel:${settings.phone.replace(/\s/g, "")}`} className="rounded-2xl bg-white p-4 shadow-[inset_0_0_0_1px_var(--line)]">
                  <Phone className="mb-5 h-4 w-4 text-accent" />
                  <span className="block text-[11px] text-muted">Call the clinic</span>
                  <span className="text-[13.5px] font-semibold">{settings.phone}</span>
                </a>
                <a href={wa} target="_blank" rel="noreferrer" className="rounded-2xl bg-[#25D366] p-4 text-white">
                  <svg viewBox="0 0 24 24" className="mb-5 h-4 w-4" fill="currentColor" aria-hidden><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Z" /></svg>
                  <span className="block text-[11px] text-white/80">WhatsApp</span>
                  <span className="text-[13.5px] font-semibold">Chat with us</span>
                </a>
                <a href={`tel:${settings.emergencyPhone.replace(/\s/g, "")}`} className="col-span-2 flex items-center gap-3 rounded-2xl bg-coral p-4 text-white">
                  <Siren className="h-5 w-5" />
                  <span className="flex-1"><span className="block text-[11px] text-white/80">Emergency · 24×7</span><span className="text-[15px] font-semibold">{settings.emergencyPhone}</span></span>
                  <ArrowUpRight className="h-5 w-5" />
                </a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <motion.nav
        aria-label="Quick navigation"
        className="fixed inset-x-3 bottom-3 z-[57] mx-auto max-w-[440px]"
        animate={{ y: compact && !sheet ? 8 : 0, scale: compact && !sheet ? 0.94 : 1 }}
        transition={{ duration: 0.4, ease }}
      >
        <div className="grid h-[64px] grid-cols-5 items-center rounded-[24px] bg-ink px-1.5 text-bg shadow-[0_20px_50px_-15px_rgba(12,13,18,0.6)]">
          {items.map((it) =>
            it.primary ? (
              <Link key={it.href} href={it.href} className="flex justify-center" aria-label="Book an appointment">
                <span className="-mt-7 grid h-[58px] w-[58px] place-items-center rounded-[20px] bg-accent text-accent-ink shadow-[0_12px_30px_-8px_var(--accent)] ring-[5px] ring-bg transition-transform active:scale-90">
                  <it.icon className="h-6 w-6" />
                </span>
              </Link>
            ) : (
              <Link key={it.href} href={it.href} className="relative flex flex-col items-center gap-1 py-2">
                <it.icon className={cn("h-[19px] w-[19px] transition-colors", isActive(it.href) ? "text-highlight" : "text-bg/55")} />
                <span className={cn("text-[10.5px] font-medium", isActive(it.href) ? "text-bg" : "text-bg/50")}>{it.label}</span>
                {isActive(it.href) && <motion.span layoutId="dock-dot" className="absolute -bottom-0.5 h-1 w-1 rounded-full bg-highlight" />}
              </Link>
            ),
          )}
          <button onClick={() => setSheet((s) => !s)} className="flex flex-col items-center gap-1 py-2" aria-expanded={sheet} aria-label="Menu">
            {sheet ? <X className="h-[19px] w-[19px] text-highlight" /> : <Menu className="h-[19px] w-[19px] text-bg/55" />}
            <span className="text-[10.5px] font-medium text-bg/50">Menu</span>
          </button>
        </div>
      </motion.nav>
    </div>
  );
}
