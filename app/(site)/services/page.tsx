import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { readDb } from "@/lib/db";
import { PageHeader } from "@/components/site/PageHeader";
import { Img } from "@/components/site/Img";
import { Icon } from "@/components/site/Icon";
import { Reveal } from "@/components/motion/Reveal";
import { money } from "@/lib/utils";

export const metadata: Metadata = { title: "Services", description: "Every specialty you need, under one calm roof." };

export default async function ServicesPage() {
  const db = await readDb();
  const services = [...db.services].sort((a, b) => a.order - b.order);
  return (
    <>
      <PageHeader
        eyebrow={`${services.length} specialties`}
        title="Specialist care,"
        accent="without the runaround."
        description="From a nagging cough to a complex cardiac workup, our specialists work as one team — sharing notes, reports and a single care plan built around you."
      />
      <section className="container-x pb-24 md:pb-36">
        <ul className="border-t border-line">
          {services.map((s, i) => (
            <Reveal as="li" key={s.id} delay={Math.min(i, 4) * 0.05} className="border-b border-line">
              <Link
                href={`/services/${s.slug}`}
                className="group grid grid-cols-[auto_1fr_auto] items-center gap-4 py-6 md:grid-cols-[80px_1.2fr_1.4fr_180px_auto] md:gap-8 md:py-8"
              >
                <span className="hidden font-mono text-[12px] text-muted md:block">{String(i + 1).padStart(2, "0")}</span>
                <span className="grid h-14 w-14 place-items-center rounded-2xl bg-accent-soft text-accent transition-all duration-500 group-hover:rotate-[-8deg] group-hover:bg-accent group-hover:text-accent-ink md:hidden">
                  <Icon name={s.icon} className="h-6 w-6" />
                </span>
                <span>
                  <span className="block text-[clamp(1.5rem,3.2vw,2.6rem)] font-medium leading-none tracking-[-0.028em] transition-transform duration-500 group-hover:translate-x-2">
                    {s.name}
                  </span>
                  <span className="mt-2 block text-[14px] text-muted md:hidden">From {money(s.priceFrom, db.settings.currency)}</span>
                </span>
                <span className="hidden text-[15px] leading-relaxed text-muted md:block">{s.short}</span>
                <span className="relative hidden h-24 overflow-hidden rounded-2xl md:block">
                  <Img src={s.image} alt="" fill sizes="180px" className="object-cover transition-transform duration-700 group-hover:scale-110" />
                </span>
                <span className="grid h-11 w-11 place-items-center rounded-full border border-line transition-all duration-500 group-hover:border-ink group-hover:bg-ink group-hover:text-bg">
                  <ArrowUpRight className="h-4 w-4 transition-transform duration-500 group-hover:rotate-45" />
                </span>
              </Link>
            </Reveal>
          ))}
        </ul>
      </section>
    </>
  );
}
