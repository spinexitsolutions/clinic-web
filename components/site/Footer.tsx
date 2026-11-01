import Link from "next/link";
import { ArrowUpRight, Siren } from "lucide-react";
import type { Appearance, Service, SiteSettings } from "@/lib/types";
import { Newsletter } from "./forms/Newsletter";
import { Logo } from "./Navbar";
import { timeLabel } from "@/lib/utils";

export function Footer({ settings, appearance, services }: { settings: SiteSettings; appearance: Appearance; services: Service[] }) {
  const socials = Object.entries(settings.socials).filter(([, v]) => v);
  return (
    <footer className="relative overflow-hidden rounded-t-[calc(var(--radius)*1.4)] bg-ink text-bg">
      <div className="container-x pt-16 md:pt-24">
        {/* top: newsletter + emergency */}
        <div className="grid gap-10 border-b border-bg/10 pb-14 md:grid-cols-[1.4fr_1fr] md:gap-16">
          <div>
            <p className="eyebrow !text-bg/50">The Solace Letter</p>
            <h3 className="mt-4 max-w-xl text-[clamp(1.9rem,4.5vw,3.2rem)] font-medium leading-[1.02] tracking-[-0.04em]">
              Honest health advice, <span className="serif-accent text-accent">once a month.</span>
            </h3>
            <div className="mt-8 max-w-md">
              <Newsletter dark />
            </div>
          </div>
          <a
            href={`tel:${settings.emergencyPhone.replace(/\s/g, "")}`}
            className="group relative flex flex-col justify-between overflow-hidden rounded-[var(--radius)] bg-coral p-6 text-white md:p-8"
          >
            <div className="flex items-center justify-between">
              <Siren className="h-6 w-6" />
              <span className="font-mono text-[11px] uppercase tracking-[0.14em]">24 × 7</span>
            </div>
            <div className="mt-12">
              <p className="text-sm text-white/80">Medical emergency? Call now</p>
              <p className="mt-1 text-[clamp(1.6rem,3vw,2.25rem)] font-medium tracking-[-0.03em]">{settings.emergencyPhone}</p>
            </div>
            <ArrowUpRight className="absolute right-6 top-1/2 h-10 w-10 -translate-y-1/2 opacity-0 transition-all duration-500 group-hover:translate-x-1 group-hover:opacity-100" />
          </a>
        </div>

        {/* columns */}
        <div className="grid grid-cols-2 gap-10 py-14 md:grid-cols-4">
          <div>
            <p className="eyebrow !text-bg/40">Explore</p>
            <ul className="mt-5 space-y-3 text-[15px] text-bg/75">
              {appearance.nav.filter((n) => n.visible).map((n) => (
                <li key={n.id}><Link className="transition-colors hover:text-accent" href={n.href}>{n.label}</Link></li>
              ))}
              <li><Link className="transition-colors hover:text-accent" href="/track">Track booking</Link></li>
              <li><Link className="transition-colors hover:text-accent" href="/faq">FAQ</Link></li>
            </ul>
          </div>
          <div>
            <p className="eyebrow !text-bg/40">Specialties</p>
            <ul className="mt-5 space-y-3 text-[15px] text-bg/75">
              {services.slice(0, 7).map((s) => (
                <li key={s.id}><Link className="transition-colors hover:text-accent" href={`/services/${s.slug}`}>{s.name}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <p className="eyebrow !text-bg/40">Hours</p>
            <ul className="mt-5 space-y-2 text-[14px] text-bg/75">
              {settings.hours.map((h) => (
                <li key={h.day} className="flex justify-between gap-3">
                  <span className="text-bg/50">{h.day}</span>
                  <span className="tabular-nums">{h.closed ? "Closed" : `${timeLabel(h.open)} – ${timeLabel(h.close)}`}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="eyebrow !text-bg/40">Visit</p>
            <address className="mt-5 space-y-3 text-[15px] not-italic text-bg/75">
              <p>{settings.address}<br />{settings.city}</p>
              <p><a className="hover:text-accent" href={`tel:${settings.phone.replace(/\s/g, "")}`}>{settings.phone}</a></p>
              <p><a className="hover:text-accent" href={`mailto:${settings.email}`}>{settings.email}</a></p>
            </address>
            <div className="mt-6 flex flex-wrap gap-2">
              {socials.map(([k, v]) => (
                <a key={k} href={v} target="_blank" rel="noreferrer" className="rounded-full border border-bg/15 px-3 py-1.5 text-[12px] capitalize text-bg/70 transition-colors hover:border-accent hover:text-accent">
                  {k}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* giant wordmark */}
      <div className="container-x">
        <div className="flex items-end justify-between gap-6 border-t border-bg/10 py-6 text-[12px] text-bg/45">
          <p>© {new Date().getFullYear()} {settings.name}. All rights reserved.</p>
          <p className="hidden sm:block">Made with care in {settings.city.split(",")[0]}</p>
        </div>
      </div>
      <div className="pointer-events-none select-none overflow-hidden" aria-hidden>
        <p className="flex items-center justify-center gap-[2vw] whitespace-nowrap text-center text-[24vw] font-medium leading-[0.75] tracking-[-0.07em] text-bg/[0.06]">
          <Logo className="h-[14vw] w-[14vw] opacity-30 [&_svg]:h-[8vw] [&_svg]:w-[8vw]" />
          {settings.shortName}
        </p>
      </div>
    </footer>
  );
}
