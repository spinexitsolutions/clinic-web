import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { readDb } from "@/lib/db";
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
import { FAQList } from "@/components/site/sections/FAQ";
import { CTA } from "@/components/site/sections/CTA";
import { SplitWords } from "@/components/motion/Reveal";
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
  const faqs = byOrder(db.faqs).slice(0, 5);

  const render: Record<HomeSectionKey, React.ReactNode> = {
    hero: <Hero hero={home.hero} doctors={featuredDoctors} />,
    marquee: <Marquee items={home.marquee} />,
    statement: <Statement text={home.statement} />,
    services: <Services services={services} currency={settings.currency} />,
    stats: <Stats stats={home.stats} />,
    process: <Process steps={home.process} />,
    doctors: <Doctors doctors={featuredDoctors} />,
    packages: <Packages packages={byOrder(db.packages)} currency={settings.currency} />,
    testimonials: <Testimonials items={db.testimonials.filter((t) => t.visible)} />,
    blog: <Journal posts={posts} />,
    faq: (
      <section className="container-x grid gap-10 py-20 md:grid-cols-[1fr_1.4fr] md:gap-20 md:py-32">
        <div>
          <p className="eyebrow">Questions</p>
          <h2 className="mt-4 text-[clamp(2.4rem,5vw,4.4rem)] font-medium leading-[0.98] tracking-[-0.045em]">
            <SplitWords text="Good to" /> <span className="serif-accent text-accent"><SplitWords text="know." delay={0.1} /></span>
          </h2>
          <Link href="/faq" className="btn btn-ghost mt-8">
            All FAQs <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
        <FAQList faqs={faqs} />
      </section>
    ),
    cta: <CTA cta={home.cta} insurers={db.insurers} />,
  };

  return <>{home.sections.filter((s) => s.visible).map((s) => <div key={s.key}>{render[s.key]}</div>)}</>;
}
