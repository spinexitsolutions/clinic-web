"use client";
import { AnimatePresence, LayoutGroup, motion, useMotionValueEvent, useScroll, useSpring, useTransform } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowUpRight, Phone, Siren } from "lucide-react";
import { getLenis } from "@/components/motion/SmoothScroll";
import { useSite } from "./SiteContext";
import { Img } from "./Img";
import { cn, openStatus } from "@/lib/utils";

const ease = [0.22, 1, 0.36, 1] as const;

const PREVIEW: Record<string, string> = {
  "/services": "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133",
  "/doctors": "https://images.unsplash.com/photo-1559839734-2b71ea197ec2",
  "/packages": "https://images.unsplash.com/photo-1527613426441-4da17471b66d",
  "/about": "https://images.unsplash.com/photo-1631248055158-edec7a3c072b",
  "/blog": "https://images.unsplash.com/photo-1506126613408-eca07ce68773",
  "/contact": "https://images.unsplash.com/photo-1584515933487-779824d29309",
  "/faq": "https://images.unsplash.com/photo-1638202993928-7267aad84c31",
  "/book": "https://images.unsplash.com/photo-1666214280557-f1b5022eb634",
  "/track": "https://images.unsplash.com/photo-1666214280391-8ff5bd3c0bf0",
};

/**
 * "Clinical Island" — a floating capsule that compacts while you read,
 * re-expands when you scroll up, and morphs into a full menu sheet.
 */
export function Navbar({ hasAnnouncement }: { hasAnnouncement: boolean }) {
  const { settings, appearance } = useSite();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [compact, setCompact] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const [status, setStatus] = useState<{ open: boolean; label: string } | null>(null);
  const { scrollY, scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 200, damping: 40 });
  const top = useTransform(scrollY, [0, 44], [hasAnnouncement ? 52 : 14, 14]);

  const links = appearance.nav.filter((l) => l.visible);

  useEffect(() => {
    const tick = () => setStatus(openStatus(settings.hours));
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, [settings.hours]);

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    if (y < 120) setCompact(false);
    else if (y > prev + 4) setCompact(true);
    else if (y < prev - 8) setCompact(false);
  });

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    const lenis = getLenis();
    if (open) {
      lenis?.stop();
      document.documentElement.style.overflow = "hidden";
    } else {
      lenis?.start();
      document.documentElement.style.overflow = "";
    }
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const current = links.find((l) => l.href !== "/" && pathname.startsWith(l.href));

  return (
    <>
      {/* dim backdrop when the island expands */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-40 bg-ink/30 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>

      <motion.header style={{ top }} className="fixed inset-x-0 z-50 flex justify-center px-3 pointer-events-none">
        <LayoutGroup>
          <motion.nav
            layout
            aria-label="Main"
            transition={{ layout: { duration: 0.65, ease } }}
            style={{ borderRadius: open ? 32 : 999 }}
            className={cn(
              "pointer-events-auto relative overflow-hidden bg-ink text-bg shadow-[0_20px_60px_-20px_rgba(0,0,0,0.45)]",
              open ? "w-full max-w-[760px]" : "w-auto",
            )}
          >
            {/* bar row */}
            <motion.div layout="position" className="flex h-14 items-center gap-1 pl-2 pr-2 md:h-[60px]">
              <Link href="/" className="group flex items-center gap-2.5 rounded-full py-2 pl-2 pr-3" aria-label={`${settings.name} home`}>
                <Logo />
                <span className="font-display text-[16px] font-semibold tracking-[-0.03em]">{settings.shortName}</span>
              </Link>

              {/* desktop links — hide while compact */}
              <AnimatePresence initial={false} mode="popLayout">
                {!compact && !open && (
                  <motion.ul
                    key="links"
                    className="hidden items-center lg:flex"
                    initial={{ opacity: 0, filter: "blur(6px)" }}
                    animate={{ opacity: 1, filter: "blur(0px)" }}
                    exit={{ opacity: 0, filter: "blur(6px)", transition: { duration: 0.2 } }}
                    transition={{ duration: 0.45, ease }}
                  >
                    {links.slice(0, 6).map((l) => {
                      const active = pathname.startsWith(l.href);
                      return (
                        <li key={l.id}>
                          <Link href={l.href} className="relative block rounded-full px-3.5 py-2 text-[14px] text-bg/70 transition-colors hover:text-bg">
                            {active && (
                              <motion.span layoutId="nav-active" className="absolute inset-0 rounded-full bg-bg/10" transition={{ duration: 0.5, ease }} />
                            )}
                            <span className="relative">{l.label}</span>
                          </Link>
                        </li>
                      );
                    })}
                  </motion.ul>
                )}
              </AnimatePresence>

              {/* compact: current page label */}
              <AnimatePresence initial={false} mode="popLayout">
                {(compact || open) && current && !open && (
                  <motion.span
                    key="cur"
                    className="hidden px-2 text-[13px] text-bg/60 sm:block"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                  >
                    / {current.label}
                  </motion.span>
                )}
              </AnimatePresence>

              {/* live open status */}
              {status && (
                <motion.span
                  layout="position"
                  className={cn("ml-1 hidden items-center gap-2 rounded-full bg-bg/[0.07] px-3 py-1.5 text-[12px] text-bg/75 sm:flex", open && "sm:hidden")}
                >
                  <span className={cn("pulse-dot relative h-1.5 w-1.5 rounded-full", status.open ? "text-highlight bg-highlight" : "text-coral bg-coral")} />
                  {status.label}
                </motion.span>
              )}

              <div className="ml-auto flex items-center gap-1 pl-2">
                {!open && (
                  <Link
                    href={appearance.navCta.href}
                    className="hidden h-10 items-center gap-1.5 rounded-full bg-accent px-4 text-[14px] font-medium text-accent-ink transition-transform active:scale-95 sm:inline-flex"
                  >
                    {appearance.navCta.label}
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                )}
                <button
                  onClick={() => setOpen((o) => !o)}
                  aria-expanded={open}
                  aria-label={open ? "Close menu" : "Open menu"}
                  className={cn("relative grid h-10 w-10 place-items-center rounded-full bg-bg/10 transition-colors hover:bg-bg/20", !compact && !open && "lg:hidden")}
                >
                  <span className="relative block h-3 w-4">
                    <motion.span
                      className="absolute left-0 top-0 block h-[1.5px] w-4 rounded bg-bg"
                      animate={open ? { top: 5, rotate: 45 } : { top: 1, rotate: 0 }}
                      transition={{ duration: 0.4, ease }}
                    />
                    <motion.span
                      className="absolute left-0 block h-[1.5px] w-4 rounded bg-bg"
                      animate={open ? { top: 5, rotate: -45, width: 16 } : { top: 9, rotate: 0, width: 10 }}
                      transition={{ duration: 0.4, ease }}
                    />
                  </span>
                </button>
              </div>
            </motion.div>

            {/* scroll progress hairline */}
            {!open && (
              <motion.div className="absolute bottom-0 left-6 right-6 h-[1.5px] origin-left bg-accent" style={{ scaleX: progress }} />
            )}

            {/* expanded sheet */}
            <AnimatePresence>
              {open && (
                <motion.div
                  key="sheet"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, transition: { delay: 0.2 } }}
                  exit={{ opacity: 0, transition: { duration: 0.15 } }}
                  className="max-h-[calc(100svh-6rem)] overflow-y-auto px-3 pb-3 no-scrollbar"
                  data-lenis-prevent
                >
                  <div className="grid gap-3 md:grid-cols-[1.25fr_1fr]">
                    <ul className="py-2">
                      {[...links, { id: "track", label: "Track booking", href: "/track", visible: true }].map((l, i) => (
                        <motion.li
                          key={l.id}
                          initial={{ opacity: 0, y: 24 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.18 + i * 0.045, duration: 0.6, ease }}
                          onMouseEnter={() => setHovered(l.href)}
                        >
                          <Link
                            href={l.href}
                            className="group flex items-baseline justify-between gap-4 rounded-2xl px-3 py-2.5 transition-colors hover:bg-bg/[0.06]"
                          >
                            <span className="font-display text-[34px] font-semibold leading-none tracking-[-0.032em] md:text-[40px]">
                              {l.label}
                            </span>
                            <span className="font-mono text-[11px] text-bg/40 transition-colors group-hover:text-accent">
                              0{i + 1}
                            </span>
                          </Link>
                        </motion.li>
                      ))}
                    </ul>

                    <motion.div
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.25, duration: 0.7, ease }}
                      className="flex flex-col gap-3"
                    >
                      <div className="relative hidden aspect-[4/3] overflow-hidden rounded-[24px] md:block">
                        <AnimatePresence mode="popLayout">
                          <motion.div
                            key={hovered ?? "default"}
                            className="absolute inset-0"
                            initial={{ opacity: 0, scale: 1.08 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.6, ease }}
                          >
                            <Img src={PREVIEW[hovered ?? "/about"] ?? PREVIEW["/about"]} alt="" fill sizes="320px" className="object-cover" />
                          </motion.div>
                        </AnimatePresence>
                        <div className="absolute inset-0 bg-gradient-to-t from-ink/60 to-transparent" />
                        <p className="absolute bottom-4 left-4 right-4 serif-accent text-2xl leading-tight text-white">{settings.tagline}</p>
                      </div>

                      <Link
                        href={appearance.navCta.href}
                        className="flex h-14 items-center justify-between rounded-[20px] bg-accent px-5 text-[16px] font-medium text-accent-ink"
                      >
                        {appearance.navCta.label}
                        <ArrowUpRight className="h-5 w-5" />
                      </Link>
                      <div className="grid grid-cols-2 gap-3">
                        <a href={`tel:${settings.phone.replace(/\s/g, "")}`} className="rounded-[20px] bg-bg/[0.07] p-4 transition-colors hover:bg-bg/[0.12]">
                          <Phone className="mb-6 h-4 w-4 text-bg/60" />
                          <span className="block text-[11px] uppercase tracking-wider text-bg/50">Call</span>
                          <span className="text-[13px]">{settings.phone}</span>
                        </a>
                        <a href={`tel:${settings.emergencyPhone.replace(/\s/g, "")}`} className="rounded-[20px] bg-coral/15 p-4 transition-colors hover:bg-coral/25">
                          <Siren className="mb-6 h-4 w-4 text-coral" />
                          <span className="block text-[11px] uppercase tracking-wider text-coral/80">Emergency 24×7</span>
                          <span className="text-[13px]">{settings.emergencyPhone}</span>
                        </a>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.nav>
        </LayoutGroup>
      </motion.header>
    </>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("relative grid h-8 w-8 place-items-center rounded-full bg-accent", className)} aria-hidden>
      <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none">
        <path d="M2 12h5l2-4 3 9 2.5-6 1.5 3H22" stroke="var(--accent-ink)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}
