"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CalendarDays, CircleHelp, ExternalLink, House, Image as ImageIcon, Info, Kanban, LayoutDashboard, LayoutGrid, LogOut, Mail,
  MessageSquareQuote, Navigation, Newspaper, Package, Palette, PanelLeft, Settings, ShieldCheck, Stethoscope, UserRound, Users, X,
  type LucideIcon,
} from "lucide-react";
import { logoutAction } from "@/app/admin/actions";
import { cn } from "@/lib/utils";
import { ToastProvider } from "./ui";

type NavItem = { href: string; label: string; icon: LucideIcon; badge?: number };

export function AdminShell({ children, clinicName, email, counts }: { children: React.ReactNode; clinicName: string; email: string; counts: { pending: number; leads: number } }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [sheet, setSheet] = useState(false);

  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem("solace-admin-collapsed") === "1");
    } catch {}
  }, []);
  useEffect(() => setSheet(false), [pathname]);

  const groups: { title: string; items: NavItem[] }[] = [
    { title: "Overview", items: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard }] },
    {
      title: "CRM",
      items: [
        { href: "/admin/appointments", label: "Appointments", icon: CalendarDays, badge: counts.pending },
        { href: "/admin/patients", label: "Patients", icon: Users },
        { href: "/admin/leads", label: "Leads pipeline", icon: Kanban, badge: counts.leads },
        { href: "/admin/subscribers", label: "Subscribers", icon: Mail },
      ],
    },
    {
      title: "Website",
      items: [
        { href: "/admin/settings", label: "Site settings", icon: Settings },
        { href: "/admin/appearance", label: "Appearance & intro", icon: Palette },
        { href: "/admin/navigation", label: "Navigation", icon: Navigation },
        { href: "/admin/homepage", label: "Homepage", icon: House },
        { href: "/admin/about", label: "About page", icon: Info },
      ],
    },
    {
      title: "Content",
      items: [
        { href: "/admin/services", label: "Services", icon: Stethoscope },
        { href: "/admin/doctors", label: "Doctors", icon: UserRound },
        { href: "/admin/posts", label: "Journal", icon: Newspaper },
        { href: "/admin/testimonials", label: "Testimonials", icon: MessageSquareQuote },
        { href: "/admin/faqs", label: "FAQs", icon: CircleHelp },
        { href: "/admin/packages", label: "Packages", icon: Package },
        { href: "/admin/insurers", label: "Insurers", icon: ShieldCheck },
        { href: "/admin/media", label: "Media", icon: ImageIcon },
      ],
    },
  ];

  const isActive = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));
  const toggle = () => {
    setCollapsed((c) => {
      try {
        localStorage.setItem("solace-admin-collapsed", c ? "0" : "1");
      } catch {}
      return !c;
    });
  };

  const NavList = ({ compact, onNavigate }: { compact?: boolean; onNavigate?: () => void }) => (
    <nav className="space-y-6">
      {groups.map((g) => (
        <div key={g.title}>
          {!compact && <p className="eyebrow mb-2 px-3 !text-[10px]">{g.title}</p>}
          <ul className="space-y-0.5">
            {g.items.map((it) => {
              const active = isActive(it.href);
              return (
                <li key={it.href}>
                  <Link
                    href={it.href}
                    onClick={onNavigate}
                    title={compact ? it.label : undefined}
                    className={cn(
                      "relative flex items-center gap-3 rounded-xl px-3 py-2 text-[14px] transition-colors",
                      compact && "justify-center px-0",
                      active ? "text-ink" : "text-muted hover:text-ink",
                    )}
                  >
                    {active && <motion.span layoutId={compact ? "nav-active-c" : "nav-active"} className="absolute inset-0 rounded-xl bg-white shadow-[0_1px_2px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.04]" transition={{ type: "spring", stiffness: 500, damping: 40 }} />}
                    <it.icon className={cn("relative size-[18px] shrink-0", active && "text-accent")} strokeWidth={1.7} />
                    {!compact && <span className="relative flex-1 truncate">{it.label}</span>}
                    {!!it.badge && (
                      <span className={cn("relative grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1.5 text-[10px] font-semibold text-accent-ink", compact && "absolute -right-0.5 -top-0.5 h-4 min-w-4 px-1")}>{it.badge}</span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );

  const Brand = ({ compact }: { compact?: boolean }) => (
    <Link href="/admin" className="flex items-center gap-2.5">
      <span className="grid size-9 place-items-center rounded-[12px] bg-ink text-bg">
        <span className="serif-accent text-xl leading-none">{clinicName.charAt(0)}</span>
      </span>
      {!compact && (
        <span className="leading-tight">
          <span className="block text-[15px] font-medium tracking-[-0.02em]">{clinicName}</span>
          <span className="block font-mono text-[10px] uppercase tracking-[0.14em] text-muted">Admin</span>
        </span>
      )}
    </Link>
  );

  const tabs: NavItem[] = [
    { href: "/admin", label: "Home", icon: LayoutDashboard },
    { href: "/admin/appointments", label: "Bookings", icon: CalendarDays, badge: counts.pending },
    { href: "/admin/leads", label: "Leads", icon: Kanban },
    { href: "/admin/patients", label: "Patients", icon: Users },
  ];

  return (
    <ToastProvider>
      <div className="min-h-dvh bg-[color-mix(in_oklab,var(--bg)_70%,#e9e8e3)]">
        {/* Desktop sidebar */}
        <aside className={cn("fixed inset-y-0 left-0 z-40 hidden flex-col border-r border-line bg-bg/80 backdrop-blur-xl transition-[width] duration-500 [transition-timing-function:var(--ease-out)] lg:flex", collapsed ? "w-[76px]" : "w-[264px]")}>
          <div className={cn("flex h-16 items-center justify-between px-4", collapsed && "justify-center")}>
            <Brand compact={collapsed} />
            {!collapsed && (
              <button onClick={toggle} className="grid size-8 place-items-center rounded-lg text-muted hover:bg-black/5 hover:text-ink" aria-label="Collapse sidebar">
                <PanelLeft className="size-4" />
              </button>
            )}
          </div>
          <div data-lenis-prevent className="no-scrollbar flex-1 overflow-y-auto px-3 pb-4 pt-2">
            {collapsed && (
              <button onClick={toggle} className="mb-4 grid h-9 w-full place-items-center rounded-xl text-muted hover:bg-black/5 hover:text-ink" aria-label="Expand sidebar">
                <PanelLeft className="size-4 rotate-180" />
              </button>
            )}
            <NavList compact={collapsed} />
          </div>
          <div className={cn("border-t border-line p-3", collapsed && "px-2")}>
            <a href="/" target="_blank" className={cn("flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-muted hover:bg-black/5 hover:text-ink", collapsed && "justify-center px-0")}>
              <ExternalLink className="size-4" /> {!collapsed && "View website"}
            </a>
            <form action={logoutAction}>
              <button className={cn("flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-muted hover:bg-black/5 hover:text-ink", collapsed && "justify-center px-0")}>
                <LogOut className="size-4" />
                {!collapsed && (
                  <span className="flex min-w-0 flex-1 items-center justify-between gap-2">
                    Log out <span className="truncate text-[11px]">{email}</span>
                  </span>
                )}
              </button>
            </form>
          </div>
        </aside>

        {/* Mobile top bar */}
        <header className="glass sticky top-0 z-40 flex h-14 items-center justify-between border-b border-line px-4 lg:hidden">
          <Brand />
          <a href="/" target="_blank" className="btn btn-ghost h-9 px-3 text-xs">
            <ExternalLink className="size-3.5" /> Site
          </a>
        </header>

        <main className={cn("transition-[padding] duration-500 [transition-timing-function:var(--ease-out)]", collapsed ? "lg:pl-[76px]" : "lg:pl-[264px]")}>
          <motion.div key={pathname} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }} className="mx-auto max-w-[1240px] px-4 pb-32 pt-6 md:px-8 md:pt-10 lg:pb-16">
            {children}
          </motion.div>
        </main>

        {/* Mobile bottom tab bar */}
        <nav className="glass fixed inset-x-3 bottom-3 z-50 flex items-center justify-around rounded-[22px] border border-line px-2 py-1.5 shadow-xl shadow-black/5 lg:hidden" style={{ paddingBottom: "max(0.375rem, env(safe-area-inset-bottom))" }}>
          {tabs.map((t) => {
            const active = isActive(t.href);
            return (
              <Link key={t.href} href={t.href} className={cn("relative flex flex-1 flex-col items-center gap-0.5 rounded-2xl py-1.5 text-[10px] font-medium", active ? "text-ink" : "text-muted")}>
                {active && <motion.span layoutId="tab-active" className="absolute inset-0 rounded-2xl bg-white shadow-sm" transition={{ type: "spring", stiffness: 500, damping: 40 }} />}
                <span className="relative">
                  <t.icon className={cn("size-5", active && "text-accent")} strokeWidth={1.7} />
                  {!!t.badge && <span className="absolute -right-2 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-accent px-1 text-[9px] text-accent-ink">{t.badge}</span>}
                </span>
                <span className="relative">{t.label}</span>
              </Link>
            );
          })}
          <button onClick={() => setSheet(true)} className="flex flex-1 flex-col items-center gap-0.5 py-1.5 text-[10px] font-medium text-muted">
            <LayoutGrid className="size-5" strokeWidth={1.7} />
            More
          </button>
        </nav>

        {/* Mobile sheet */}
        <AnimatePresence>
          {sheet && (
            <div className="fixed inset-0 z-[60] lg:hidden">
              <motion.div className="absolute inset-0 bg-ink/30 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSheet(false)} />
              <motion.div
                data-lenis-prevent
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", stiffness: 380, damping: 40 }}
                drag="y"
                dragConstraints={{ top: 0, bottom: 0 }}
                dragElastic={{ top: 0, bottom: 0.6 }}
                onDragEnd={(_, i) => i.offset.y > 120 && setSheet(false)}
                className="absolute inset-x-0 bottom-0 max-h-[86dvh] overflow-y-auto rounded-t-[28px] bg-bg px-4 pb-10 pt-3"
              >
                <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-black/15" />
                <div className="mb-5 flex items-center justify-between px-2">
                  <Brand />
                  <button onClick={() => setSheet(false)} className="grid size-9 place-items-center rounded-full bg-white hairline" aria-label="Close">
                    <X className="size-4" />
                  </button>
                </div>
                <NavList onNavigate={() => setSheet(false)} />
                <form action={logoutAction} className="mt-6 px-1">
                  <button className="btn btn-ghost w-full">
                    <LogOut className="size-4" /> Log out
                  </button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </ToastProvider>
  );
}
