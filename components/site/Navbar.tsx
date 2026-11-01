"use client";
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useSpring } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, ChevronDown, Phone, Search, Star } from "lucide-react";
import { useSite } from "./SiteContext";
import { Img } from "./Img";
import { Icon } from "./Icon";
import { CommandPalette } from "./nav/CommandPalette";
import { MobileDock } from "./nav/MobileDock";
import type { NavData } from "./nav/types";
import { cn, money, openStatus } from "@/lib/utils";

const ease = [0.22, 1, 0.36, 1] as const;
type Mega = "services" | "doctors" | null;
const MEGA_ORDER: Mega[] = ["services", "doctors"];

/**
 * Clinic header — a calm, sticky bar with:
 *  • a morphing mega-menu (one panel that reshapes between Services and Doctors)
 *  • ⌘K search across specialties, doctors and articles
 *  • hide-on-scroll-down / reveal-on-scroll-up, with a reading-progress hairline
 *  • an app-style bottom dock on phones (see MobileDock)
 */
export function Navbar({ data }: { data: NavData }) {
  const { settings, appearance } = useSite();
  const pathname = usePathname();
  const [mega, setMega] = useState<Mega>(null);
  const [dir, setDir] = useState(1);
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [search, setSearch] = useState(false);
  const [status, setStatus] = useState<{ open: boolean; label: string } | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { scrollY, scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 200, damping: 40 });

  const links = appearance.nav.filter((l) => l.visible);

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setScrolled(y > 8);
    if (mega || y < 220) return setHidden(false);
    if (y > prev + 6) setHidden(true);
    else if (y < prev - 6) setHidden(false);
  });

  useEffect(() => {
    const tick = () => setStatus(openStatus(settings.hours));
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, [settings.hours]);

  useEffect(() => setMega(null), [pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearch((s) => !s);
      }
      if (e.key === "Escape") setMega(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const openMega = (m: Mega) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setDir(MEGA_ORDER.indexOf(m) >= MEGA_ORDER.indexOf(mega) ? 1 : -1);
    setMega(m);
  };
  const scheduleClose = () => {
    closeTimer.current = setTimeout(() => setMega(null), 140);
  };

  const megaFor = (href: string): Mega => (href === "/services" ? "services" : href === "/doctors" ? "doctors" : null);

  return (
    <>
      <motion.header
        animate={{ y: hidden ? "-100%" : "0%" }}
        transition={{ duration: 0.45, ease }}
        className={cn(
          "sticky top-0 z-50 transition-[background-color,box-shadow] duration-500",
          scrolled || mega ? "bg-bg/85 shadow-[0_1px_0_var(--line)] backdrop-blur-xl backdrop-saturate-150" : "bg-bg",
        )}
        onMouseLeave={scheduleClose}
      >
        <div className="mx-auto flex h-14 max-w-[1440px] items-center gap-3 px-4 md:px-6 lg:h-[68px] lg:px-8">
          {/* brand */}
          <Link href="/" className="group flex shrink-0 items-center gap-3" aria-label={`${settings.name} home`}>
            <Logo className="transition-transform duration-500 group-hover:rotate-[-8deg]" />
            <span className="font-display text-[19px] font-semibold tracking-[-0.03em]">{settings.shortName}</span>
            <span className="hidden h-7 w-px bg-line xl:block" />
            <span className="hidden text-[10.5px] font-semibold uppercase leading-[1.25] tracking-[0.12em] text-muted xl:block">
              Multi-specialty
              <br />
              clinic · {settings.city.split(",")[0]}
            </span>
          </Link>

          {/* desktop links */}
          <nav aria-label="Main" className="ml-6 hidden lg:block xl:ml-10">
            <ul className="flex items-center" onMouseLeave={() => setHover(null)}>
              {links.slice(0, 6).map((l) => {
                const m = megaFor(l.href);
                const active = pathname.startsWith(l.href);
                return (
                  <li key={l.id} onMouseEnter={() => { setHover(l.id); if (m) openMega(m); else scheduleClose(); }}>
                    <Link
                      href={l.href}
                      aria-expanded={m ? mega === m : undefined}
                      className={cn("relative flex h-10 items-center gap-1 rounded-full px-3.5 text-[14.5px] font-medium transition-colors", active || mega === m ? "text-ink" : "text-ink/60 hover:text-ink")}
                    >
                      {hover === l.id && <motion.span layoutId="nav-hover" className="absolute inset-0 rounded-full bg-ink/[0.05]" transition={{ duration: 0.35, ease }} />}
                      <span className="relative">{l.label}</span>
                      {m && <ChevronDown className={cn("relative h-3.5 w-3.5 transition-transform duration-300", mega === m && "rotate-180")} />}
                      {active && <span className="absolute -bottom-[13px] left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-accent" />}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* right cluster */}
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => setSearch(true)}
              className="group hidden h-10 w-[210px] items-center gap-2.5 rounded-full bg-white pl-3.5 pr-2 text-[13.5px] text-muted shadow-[inset_0_0_0_1px_var(--line)] transition-shadow hover:shadow-[inset_0_0_0_1px_var(--ink)] md:flex xl:w-[200px] 2xl:w-[240px]"
            >
              <Search className="h-4 w-4" />
              <span className="flex-1 text-left">Search care…</span>
              <kbd className="rounded-md bg-bg px-1.5 py-0.5 text-[11px] font-medium text-ink/60">⌘K</kbd>
            </button>
            <button onClick={() => setSearch(true)} aria-label="Search" className="grid h-10 w-10 place-items-center rounded-full bg-white shadow-[inset_0_0_0_1px_var(--line)] md:hidden">
              <Search className="h-4 w-4" />
            </button>

            <a href={`tel:${settings.phone.replace(/\s/g, "")}`} className="hidden items-center gap-2.5 rounded-full py-1 pl-1 pr-3 transition-colors hover:bg-ink/[0.04] xl:flex">
              <span className="relative grid h-9 w-9 place-items-center rounded-full bg-accent-soft text-accent">
                <Phone className="h-4 w-4" />
                {status?.open && <span className="absolute right-0.5 top-0.5 h-2 w-2 rounded-full bg-highlight ring-2 ring-bg" />}
              </span>
              <span className="leading-tight">
                <span className="block text-[11px] text-muted">{status?.open ? "Lines open now" : status?.label ?? "Call us"}</span>
                <span className="block whitespace-nowrap text-[13.5px] font-semibold tabular-nums">{settings.phone}</span>
              </span>
            </a>

            <a href={`tel:${settings.phone.replace(/\s/g, "")}`} aria-label="Call" className="grid h-10 w-10 place-items-center rounded-full bg-white shadow-[inset_0_0_0_1px_var(--line)] lg:hidden">
              <Phone className="h-4 w-4" />
            </a>

            <Link href={appearance.navCta.href} className="btn btn-accent hidden h-11 px-5 lg:inline-flex">
              {appearance.navCta.label}
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* reading progress */}
        <motion.div className="absolute inset-x-0 bottom-0 h-[2px] origin-left bg-accent" style={{ scaleX: progress }} />

        {/* morphing mega panel */}
        <AnimatePresence>
          {mega && (
            <motion.div
              key="mega"
              className="absolute inset-x-0 top-full hidden px-8 pt-2 lg:block"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8, transition: { duration: 0.2 } }}
              transition={{ duration: 0.35, ease }}
              onMouseEnter={() => closeTimer.current && clearTimeout(closeTimer.current)}
              onMouseLeave={scheduleClose}
            >
              <motion.div
                layout
                transition={{ layout: { duration: 0.45, ease } }}
                style={{ borderRadius: 28 }}
                className="mx-auto max-w-[1080px] overflow-hidden bg-white shadow-[0_40px_100px_-40px_rgba(12,13,18,0.45),0_0_0_1px_var(--line)]"
              >
                <AnimatePresence mode="popLayout" initial={false} custom={dir}>
                  <motion.div
                    key={mega}
                    custom={dir}
                    initial={{ opacity: 0, x: dir * 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: dir * -40 }}
                    transition={{ duration: 0.35, ease }}
                  >
                    {mega === "services" ? <ServicesMega data={data} currency={settings.currency} /> : <DoctorsMega data={data} phone={settings.phone} />}
                  </motion.div>
                </AnimatePresence>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* dim page under the mega menu */}
      <AnimatePresence>
        {mega && (
          <motion.div className="fixed inset-0 z-40 hidden bg-ink/20 backdrop-blur-[2px] lg:block" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseEnter={scheduleClose} />
        )}
      </AnimatePresence>

      <CommandPalette open={search} onClose={() => setSearch(false)} data={data} />
      <MobileDock data={data} onSearch={() => setSearch(true)} />
    </>
  );
}

function ServicesMega({ data, currency }: { data: NavData; currency: string }) {
  const feature = data.services.find((s) => s.featured) ?? data.services[0];
  return (
    <div className="grid grid-cols-[1fr_300px] gap-2 p-2">
      <div className="p-4">
        <div className="mb-3 flex items-center justify-between px-2">
          <p className="eyebrow">Specialties · {data.services.length}</p>
          <Link href="/services" className="text-[13px] font-medium text-accent hover:underline">View all →</Link>
        </div>
        <ul className="grid grid-cols-3 gap-1">
          {data.services.map((s, i) => (
            <motion.li key={s.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.025, duration: 0.4, ease }}>
              <Link href={`/services/${s.slug}`} className="group flex items-center gap-3 rounded-2xl p-2.5 transition-colors hover:bg-bg">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent transition-colors duration-300 group-hover:bg-accent group-hover:text-accent-ink">
                  <Icon name={s.icon} className="h-[18px] w-[18px]" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-[14.5px] font-semibold tracking-[-0.01em]">{s.name}</span>
                  <span className="block text-[12px] text-muted">from {money(s.priceFrom, currency)}</span>
                </span>
              </Link>
            </motion.li>
          ))}
        </ul>
      </div>
      {feature && (
        <Link href="/book" className="group relative min-h-[280px] overflow-hidden rounded-[22px]">
          <Img src={feature.image} alt="" fill sizes="300px" className="object-cover transition-transform duration-[1.2s] group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/30 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-5 text-white">
            <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-highlight px-2.5 py-1 text-[11px] font-semibold text-ink">
              <span className="h-1.5 w-1.5 rounded-full bg-ink" /> Same-day slots
            </span>
            <p className="font-display text-[22px] font-semibold leading-tight tracking-[-0.02em]">Not sure where to start?</p>
            <p className="mt-1 text-[13px] text-white/70">Book a general consult — we’ll route you to the right specialist.</p>
          </div>
        </Link>
      )}
    </div>
  );
}

function DoctorsMega({ data, phone }: { data: NavData; phone: string }) {
  return (
    <div className="grid grid-cols-[1fr_300px] gap-2 p-2">
      <div className="p-4">
        <div className="mb-3 flex items-center justify-between px-2">
          <p className="eyebrow">Our specialists</p>
          <Link href="/doctors" className="text-[13px] font-medium text-accent hover:underline">All doctors →</Link>
        </div>
        <ul className="grid grid-cols-2 gap-1">
          {data.doctors.slice(0, 6).map((d, i) => (
            <motion.li key={d.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03, duration: 0.4, ease }}>
              <Link href={`/doctors/${d.slug}`} className="group flex items-center gap-3 rounded-2xl p-2.5 transition-colors hover:bg-bg">
                <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-[14px]">
                  <Img src={d.image} alt={d.name} fill sizes="48px" className="object-cover" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[14.5px] font-semibold tracking-[-0.01em]">{d.name}</span>
                  <span className="block truncate text-[12px] text-muted">{d.specialty}</span>
                </span>
                <span className="flex items-center gap-1 text-[12px] font-medium">
                  <Star className="h-3 w-3 fill-accent text-accent" /> {d.rating.toFixed(1)}
                </span>
              </Link>
            </motion.li>
          ))}
        </ul>
      </div>
      <div className="flex flex-col justify-between rounded-[22px] bg-ink p-5 text-bg">
        <div className="flex -space-x-2">
          {data.doctors.slice(0, 5).map((d) => (
            <span key={d.id} className="relative h-10 w-10 overflow-hidden rounded-full ring-2 ring-ink">
              <Img src={d.image} alt="" fill sizes="40px" className="object-cover" />
            </span>
          ))}
        </div>
        <div>
          <p className="font-display text-[22px] font-semibold leading-tight tracking-[-0.02em]">Talk to our care team</p>
          <p className="mt-1 text-[13px] text-bg/60">Tell us your symptoms — we’ll match you with the right doctor.</p>
          <a href={`tel:${phone.replace(/\s/g, "")}`} className="mt-4 flex h-11 items-center justify-between rounded-full bg-highlight pl-4 pr-1.5 text-[14px] font-semibold text-ink">
            {phone}
            <span className="grid h-8 w-8 place-items-center rounded-full bg-ink text-highlight"><Phone className="h-3.5 w-3.5" /></span>
          </a>
        </div>
      </div>
    </div>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("relative grid h-9 w-9 place-items-center rounded-[12px] bg-accent", className)} aria-hidden>
      <svg viewBox="0 0 24 24" className="h-[19px] w-[19px]" fill="none">
        <path d="M2 12h5l2-4 3 9 2.5-6 1.5 3H22" stroke="var(--accent-ink)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-highlight ring-2 ring-bg" />
    </span>
  );
}
