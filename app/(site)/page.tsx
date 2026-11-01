import { readDb } from "@/lib/db";
import { getAvailableSlots } from "@/app/actions";
import { toISODate } from "@/lib/utils";
import type { HeroSlide } from "@/components/site/sections/Hero";
import { Hero } from "@/components/site/sections/Hero";
import { Marquee } from "@/components/site/sections/Marquee";
import { Statement } from "@/components/site/sections/Statement";
import { Services } from "@/components/site/sections/Services";
import { Stats } from "@/components/site/sections/Stats";
import { Process } from "@/components/site/sections/Process";
import { Doctors } from "@/components/site/sections/Doctors";
import { Packages } from "@/components/site/sections/Packages";
import { Testimonials } from "@/components/site/sections/Testimonials";
import { Journal } from "@/components/site/sections/Journal";
import { FAQSection } from "@/components/site/sections/FAQ";
import { CTA } from "@/components/site/sections/CTA";
import type { HomeSectionKey } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function Home() {
  const db = await readDb();
  const { home, settings } = db;
  const byOrder = <T extends { order: number }>(a: T[]) => [...a].sort((x, y) => x.order - y.order);
  const services = byOrder(db.services);
  const doctors = byOrder(db.doctors);
  const featuredDoctors = doctors.filter((d) => d.featured).concat(doctors.filter((d) => !d.featured));
  const posts = db.posts.filter((p) => p.published).sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  const faqs = byOrder(db.faqs).slice(0, 6);
  const medDirector = doctors.find((d) => d.slug === "dr-meera-iyer") ?? doctors[0];

  // real next free slot per doctor (from their schedule minus booked appointments)
  const nextSlots: Record<string, { date: string; time: string } | null> = {};
  await Promise.all(
    doctors.map(async (doc) => {
      nextSlots[doc.id] = null;
      for (let k = 0; k < 10; k++) {
        const d = new Date();
        d.setDate(d.getDate() + k);
        const iso = toISODate(d);
        const slots = await getAvailableSlots(doc.id, iso);
        if (slots.length) {
          nextSlots[doc.id] = { date: iso, time: slots[0] };
          break;
        }
      }
    }),
  );

  // hero: featured specialties, each with its lead doctor
  const featured = services.filter((s) => s.featured).slice(0, 6);
  const slides: HeroSlide[] = (featured.length ? featured : services.slice(0, 5)).map((service) => {
    const doctor = doctors.find((d) => d.serviceIds[0] === service.id) ?? doctors.find((d) => d.serviceIds.includes(service.id)) ?? null;
    return { service, doctor, next: doctor ? nextSlots[doctor.id] : null };
  });

  const render: Record<HomeSectionKey, React.ReactNode> = {
    hero: <Hero hero={home.hero} slides={slides} stats={home.stats} />,
    marquee: <Marquee items={home.marquee} />,
    statement: <Statement text={home.statement} signature={medDirector ? { name: medDirector.name, role: "Medical Director", image: medDirector.image } : undefined} />,
    services: <Services services={services} currency={settings.currency} doctors={doctors} />,
    stats: <Stats stats={home.stats} avatars={featuredDoctors.map((d) => d.image)} accreditations={db.about.accreditations} />,
    process: <Process steps={home.process} />,
    doctors: <Doctors doctors={featuredDoctors} nextSlots={nextSlots} currency={settings.currency} />,
    packages: <Packages packages={byOrder(db.packages)} currency={settings.currency} />,
    testimonials: <Testimonials items={db.testimonials.filter((t) => t.visible)} rating={home.hero.rating} />,
    blog: <Journal posts={posts} />,
    faq: <FAQSection faqs={faqs} avatars={featuredDoctors.map((d) => d.image)} />,
    cta: <CTA cta={home.cta} insurers={db.insurers} />,
  };

  return <>{home.sections.filter((s) => s.visible).map((s) => <div key={s.key}>{render[s.key]}</div>)}</>;
}
