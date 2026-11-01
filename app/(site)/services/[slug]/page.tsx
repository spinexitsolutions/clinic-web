import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, Check, Clock, IndianRupee } from "lucide-react";
import { readDb } from "@/lib/db";
import { ParallaxImage } from "@/components/motion/Parallax";
import { Reveal, SplitWords } from "@/components/motion/Reveal";
import { DoctorCard } from "@/components/site/sections/Doctors";
import { FAQList } from "@/components/site/sections/FAQ";
import { Icon } from "@/components/site/Icon";
import { money } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const s = (await readDb()).services.find((x) => x.slug === slug);
  return s ? { title: s.name, description: s.short } : {};
}

export default async function ServicePage({ params }: Props) {
  const { slug } = await params;
  const db = await readDb();
  const s = db.services.find((x) => x.slug === slug);
  if (!s) notFound();
  const doctors = db.doctors.filter((d) => d.serviceIds.includes(s.id));
  const others = db.services.filter((x) => x.id !== s.id).sort((a, b) => a.order - b.order).slice(0, 3);

  return (
    <>
      <section className="container-x pt-36 md:pt-48">
        <Reveal>
          <Link href="/services" className="eyebrow inline-flex items-center gap-2 hover:text-ink">
            ← All services
          </Link>
        </Reveal>
        <div className="mt-8 grid gap-10 md:grid-cols-[1.3fr_1fr] md:items-end">
          <div>
            <Reveal>
              <span className="grid h-16 w-16 place-items-center rounded-[20px] bg-accent text-accent-ink">
                <Icon name={s.icon} className="h-7 w-7" />
              </span>
            </Reveal>
            <h1 className="display mt-6 text-[clamp(3rem,9vw,8rem)]">
              <SplitWords text={s.name} />
            </h1>
          </div>
          <Reveal delay={0.2}>
            <p className="text-[18px] leading-relaxed text-muted">{s.description}</p>
          </Reveal>
        </div>
      </section>

      <section className="px-3 pt-12 md:px-5 md:pt-16">
        <ParallaxImage src={s.image} alt={s.name} priority className="h-[60svh] rounded-[var(--radius)] md:h-[80vh]" />
      </section>

      <section className="container-x grid gap-12 py-20 md:grid-cols-[1fr_1.3fr] md:gap-20 md:py-28">
        <div className="space-y-3">
          <Reveal className="flex items-center justify-between rounded-[calc(var(--radius)*0.7)] bg-card p-6 hairline">
            <span className="flex items-center gap-3 text-muted"><IndianRupee className="h-5 w-5" /> Starting from</span>
            <span className="text-2xl font-medium tracking-tight">{money(s.priceFrom, db.settings.currency)}</span>
          </Reveal>
          <Reveal delay={0.08} className="flex items-center justify-between rounded-[calc(var(--radius)*0.7)] bg-card p-6 hairline">
            <span className="flex items-center gap-3 text-muted"><Clock className="h-5 w-5" /> Consultation</span>
            <span className="text-2xl font-medium tracking-tight">{s.duration} min</span>
          </Reveal>
          <Reveal delay={0.16}>
            <Link href={`/book?service=${s.id}`} className="btn btn-accent mt-3 h-16 w-full text-base">
              Book {s.name} <ArrowUpRight className="h-5 w-5" />
            </Link>
          </Reveal>
        </div>
        <div>
          <p className="eyebrow">What's included</p>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {s.features.map((f, i) => (
              <Reveal as="li" key={f} delay={i * 0.06} className="flex items-center gap-4 rounded-[calc(var(--radius)*0.7)] bg-accent-soft p-5">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-accent text-accent-ink">
                  <Check className="h-4 w-4" strokeWidth={2.5} />
                </span>
                <span className="text-[16px] font-medium tracking-[-0.01em]">{f}</span>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {doctors.length > 0 && (
        <section className="container-x pb-20 md:pb-28">
          <h2 className="text-[clamp(2rem,5vw,4rem)] font-semibold tracking-[-0.025em]">
            Your <span className="serif-accent text-accent">specialists</span>
          </h2>
          <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
            {doctors.map((d, i) => (
              <Reveal key={d.id} delay={i * 0.08}><DoctorCard d={d} /></Reveal>
            ))}
          </div>
        </section>
      )}

      <section className="container-x grid gap-10 pb-20 md:grid-cols-[1fr_1.4fr] md:gap-20 md:pb-28">
        <h2 className="text-[clamp(2rem,5vw,4rem)] font-semibold leading-none tracking-[-0.025em]">
          Common <span className="serif-accent text-accent">questions</span>
        </h2>
        <FAQList faqs={[...db.faqs].sort((a, b) => a.order - b.order).slice(0, 4)} />
      </section>

      <section className="container-x pb-24 md:pb-36">
        <p className="eyebrow mb-6">Explore more</p>
        <div className="grid gap-3 md:grid-cols-3">
          {others.map((o) => (
            <Link key={o.id} href={`/services/${o.slug}`} className="group flex items-center justify-between rounded-[var(--radius)] bg-card p-6 hairline transition-colors hover:bg-ink hover:text-bg">
              <span className="flex items-center gap-4">
                <Icon name={o.icon} className="h-6 w-6 text-accent" />
                <span className="text-xl font-medium tracking-tight">{o.name}</span>
              </span>
              <ArrowUpRight className="h-5 w-5 transition-transform group-hover:rotate-45" />
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
