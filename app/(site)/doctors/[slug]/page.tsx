import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, Award, Clock, GraduationCap, Languages, Star } from "lucide-react";
import { readDb } from "@/lib/db";
import { Img } from "@/components/site/Img";
import { Reveal, SplitWords } from "@/components/motion/Reveal";
import { DoctorCard } from "@/components/site/sections/Doctors";
import { money, timeLabel } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };
const DAY = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const d = (await readDb()).doctors.find((x) => x.slug === slug);
  return d ? { title: `${d.name} — ${d.specialty}`, description: d.bio } : {};
}

export default async function DoctorPage({ params }: Props) {
  const { slug } = await params;
  const db = await readDb();
  const d = db.doctors.find((x) => x.slug === slug);
  if (!d) notFound();
  const services = db.services.filter((s) => d.serviceIds.includes(s.id));
  const others = db.doctors.filter((x) => x.id !== d.id).slice(0, 4);

  return (
    <>
      <section className="container-x grid gap-10 pt-32 md:grid-cols-[1fr_1.1fr] md:gap-16 md:pt-44">
        <Reveal className="relative">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[var(--radius)] bg-accent-soft md:sticky md:top-28">
            <Img src={d.image} alt={d.name} fill priority sizes="(max-width:768px) 100vw, 45vw" className="object-cover" />
            <div className="glass absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-[20px] p-4">
              <span className="flex items-center gap-2 text-[15px] font-medium">
                <Star className="h-4 w-4 fill-[#F5A524] text-[#F5A524]" /> {d.rating.toFixed(1)} rating
              </span>
              <span className="text-[14px] text-muted">{d.experience}+ years</span>
            </div>
          </div>
        </Reveal>

        <div className="md:pt-6">
          <Reveal>
            <Link href="/doctors" className="eyebrow hover:text-ink">← All doctors</Link>
            <p className="mt-8 font-mono text-[12px] uppercase tracking-[0.14em] text-accent">{d.specialty}</p>
          </Reveal>
          <h1 className="display mt-4 text-[clamp(2.8rem,7vw,6rem)]">
            <SplitWords text={d.name} />
          </h1>
          <Reveal delay={0.1}><p className="mt-3 text-lg text-muted">{d.title}</p></Reveal>
          <Reveal delay={0.15}><p className="mt-8 text-[19px] leading-relaxed">{d.bio}</p></Reveal>

          <Reveal delay={0.2} className="mt-10 grid grid-cols-2 gap-3">
            <div className="rounded-[calc(var(--radius)*0.7)] bg-card p-5 hairline">
              <p className="text-[13px] text-muted">Consultation fee</p>
              <p className="mt-2 text-2xl font-medium tracking-tight">{money(d.fee, db.settings.currency)}</p>
            </div>
            <div className="rounded-[calc(var(--radius)*0.7)] bg-card p-5 hairline">
              <p className="text-[13px] text-muted">Slot length</p>
              <p className="mt-2 text-2xl font-medium tracking-tight">{d.availability.slotMinutes} min</p>
            </div>
          </Reveal>

          <Reveal delay={0.25} className="mt-3 rounded-[calc(var(--radius)*0.7)] bg-card p-5 hairline">
            <p className="flex items-center gap-2 text-[13px] text-muted"><Clock className="h-4 w-4" /> Weekly availability · {timeLabel(d.availability.start)} – {timeLabel(d.availability.end)}</p>
            <div className="mt-4 grid grid-cols-7 gap-1.5">
              {[1, 2, 3, 4, 5, 6, 0].map((n) => {
                const on = d.availability.days.includes(n);
                return (
                  <span key={n} className={`grid h-11 place-items-center rounded-xl text-[13px] font-medium ${on ? "bg-accent text-accent-ink" : "bg-ink/5 text-ink/30"}`}>
                    {DAY[n].slice(0, 2)}
                  </span>
                );
              })}
            </div>
          </Reveal>

          <Reveal delay={0.3}>
            <Link href={`/book?doctor=${d.id}`} className="btn btn-primary mt-6 h-16 w-full text-base">
              Book with {d.name.split(" ").slice(0, 2).join(" ")} <ArrowUpRight className="h-5 w-5" />
            </Link>
          </Reveal>

          <div className="mt-14 space-y-10">
            <Reveal>
              <h2 className="flex items-center gap-2 text-[13px] font-medium uppercase tracking-[0.12em] text-muted"><GraduationCap className="h-4 w-4" /> Education</h2>
              <ul className="mt-4 divide-y divide-line border-y border-line">
                {d.education.map((e) => <li key={e} className="py-4 text-[17px]">{e}</li>)}
              </ul>
            </Reveal>
            <Reveal>
              <h2 className="flex items-center gap-2 text-[13px] font-medium uppercase tracking-[0.12em] text-muted"><Languages className="h-4 w-4" /> Speaks</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {d.languages.map((l) => <span key={l} className="rounded-full bg-accent-soft px-4 py-2 text-[15px]">{l}</span>)}
              </div>
            </Reveal>
            <Reveal>
              <h2 className="flex items-center gap-2 text-[13px] font-medium uppercase tracking-[0.12em] text-muted"><Award className="h-4 w-4" /> Specialties</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {services.map((s) => (
                  <Link key={s.id} href={`/services/${s.slug}`} className="rounded-full border border-line px-4 py-2 text-[15px] transition-colors hover:border-ink hover:bg-ink hover:text-bg">{s.name}</Link>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="container-x py-24 md:py-36">
        <h2 className="text-[clamp(2rem,5vw,4rem)] font-medium tracking-[-0.045em]">
          Other <span className="serif-accent text-accent">specialists</span>
        </h2>
        <div className="mt-10 grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
          {others.map((o, i) => <Reveal key={o.id} delay={i * 0.06}><DoctorCard d={o} /></Reveal>)}
        </div>
      </section>
    </>
  );
}
