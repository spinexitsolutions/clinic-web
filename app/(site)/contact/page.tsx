import type { Metadata } from "next";
import { Clock, Mail, MapPin, Phone, Siren } from "lucide-react";
import { readDb } from "@/lib/db";
import { PageHeader } from "@/components/site/PageHeader";
import { ContactForm, CallbackForm } from "@/components/site/forms/ContactForm";
import { Reveal } from "@/components/motion/Reveal";
import { timeLabel } from "@/lib/utils";

export const metadata: Metadata = { title: "Contact", description: "Visit, call or message Solace Clinic." };

export default async function ContactPage() {
  const { settings } = await readDb();
  const cards = [
    { icon: Phone, label: "Call us", value: settings.phone, href: `tel:${settings.phone.replace(/\s/g, "")}` },
    { icon: Mail, label: "Email", value: settings.email, href: `mailto:${settings.email}` },
    { icon: MapPin, label: "Visit", value: `${settings.address}, ${settings.city}`, href: `https://maps.google.com/?q=${encodeURIComponent(settings.address + " " + settings.city)}` },
  ];
  return (
    <>
      <PageHeader eyebrow="Get in touch" title="We're here," accent="every step of the way." description="Questions about a treatment, a bill or a booking? Our care team answers within two working hours — usually much sooner." />
      <section className="container-x grid gap-4 pb-6 md:grid-cols-3">
        {cards.map((c, i) => (
          <Reveal key={c.label} delay={i * 0.08}>
            <a href={c.href} target={c.label === "Visit" ? "_blank" : undefined} rel="noreferrer" className="group flex h-full flex-col justify-between gap-10 rounded-[var(--radius)] bg-card p-6 hairline transition-colors hover:bg-ink hover:text-bg">
              <c.icon className="h-6 w-6 text-accent" strokeWidth={1.6} />
              <span>
                <span className="block text-[13px] opacity-60">{c.label}</span>
                <span className="mt-1 block text-[19px] font-medium leading-snug tracking-[-0.02em]">{c.value}</span>
              </span>
            </a>
          </Reveal>
        ))}
      </section>

      <section className="container-x grid gap-4 pb-6 lg:grid-cols-[1.4fr_1fr]">
        <Reveal><ContactForm /></Reveal>
        <div className="grid gap-4">
          <Reveal delay={0.1} className="rounded-[var(--radius)] bg-card p-6 hairline">
            <p className="flex items-center gap-2 text-[13px] text-muted"><Clock className="h-4 w-4" /> Opening hours</p>
            <ul className="mt-4 divide-y divide-line">
              {settings.hours.map((h) => (
                <li key={h.day} className="flex justify-between py-2.5 text-[15px]">
                  <span>{h.day}</span>
                  <span className="tabular-nums text-muted">{h.closed ? "Closed" : `${timeLabel(h.open)} – ${timeLabel(h.close)}`}</span>
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={0.15} className="rounded-[var(--radius)] bg-accent p-6 text-accent-ink">
            <p className="text-[22px] font-medium tracking-[-0.03em]">Rather we call you?</p>
            <p className="mb-5 mt-1 text-[14px] opacity-75">Leave your number — we&apos;ll ring back within 15 minutes during opening hours.</p>
            <CallbackForm />
          </Reveal>
          <Reveal delay={0.2}>
            <a href={`tel:${settings.emergencyPhone.replace(/\s/g, "")}`} className="flex items-center gap-4 rounded-[var(--radius)] bg-coral p-6 text-white">
              <Siren className="h-7 w-7" />
              <span><span className="block text-[13px] opacity-80">Emergency · 24×7</span><span className="text-xl font-medium">{settings.emergencyPhone}</span></span>
            </a>
          </Reveal>
        </div>
      </section>

      {settings.mapEmbedUrl && (
        <section className="container-x pb-24 md:pb-36">
          <Reveal className="overflow-hidden rounded-[var(--radius)] hairline">
            <iframe src={settings.mapEmbedUrl} title="Map" className="h-[420px] w-full grayscale-[60%] contrast-[1.05]" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
          </Reveal>
        </section>
      )}
    </>
  );
}
