import type { Metadata } from "next";
import { BadgeCheck } from "lucide-react";
import { readDb } from "@/lib/db";
import { PageHeader } from "@/components/site/PageHeader";
import { ParallaxImage } from "@/components/motion/Parallax";
import { Reveal } from "@/components/motion/Reveal";
import { Statement } from "@/components/site/sections/Statement";
import { Stats } from "@/components/site/sections/Stats";
import { Img } from "@/components/site/Img";

export const metadata: Metadata = { title: "About us" };

export default async function AboutPage() {
  const db = await readDb();
  const a = db.about;
  const proof = db.home.proof;
  const signer = db.doctors.find((d) => d.id === proof.signatureDoctorId);
  return (
    <>
      <PageHeader eyebrow={`About ${db.settings.shortName}`} title={a.title} description={a.intro} />
      <section className="px-3 md:px-5">
        <ParallaxImage src={a.image} alt="Inside Solace" priority className="h-[60svh] rounded-[var(--radius)] md:h-[85vh]" />
      </section>
      <Statement text={a.story} label="Our story" signature={signer ? { name: signer.name, role: proof.signatureRole, image: signer.image } : null} principles={proof.principles} />
      <section className="container-x pb-20 md:pb-32">
        <p className="eyebrow mb-8">What we stand for</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {a.values.map((v, i) => (
            <Reveal key={v.title} delay={i * 0.07} className="flex min-h-[260px] flex-col justify-between rounded-[var(--radius)] bg-card p-6 hairline">
              <span className="font-mono text-[12px] text-accent">0{i + 1}</span>
              <div>
                <h3 className="text-[24px] font-medium leading-tight tracking-[-0.03em]">{v.title}</h3>
                <p className="mt-3 text-[15px] leading-relaxed text-muted">{v.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
      <section className="container-x pb-20 md:pb-32">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {a.gallery.map((g, i) => (
            <Reveal key={i} delay={i * 0.08} className={`relative overflow-hidden rounded-[var(--radius)] ${i % 2 ? "aspect-[3/4] md:translate-y-12" : "aspect-[3/4]"}`}>
              <Img src={g} alt="" fill sizes="25vw" className="object-cover" />
            </Reveal>
          ))}
        </div>
      </section>
      <Stats stats={db.home.stats} avatars={db.doctors.map((d) => d.image)} accreditations={a.accreditations} waitMinutes={proof.waitMinutes} cityAvgWait={proof.cityAvgWait} growthBadge={proof.growthBadge} recommendSource={proof.recommendSource} />
      <section className="container-x grid gap-12 pb-24 md:grid-cols-[1fr_1.4fr] md:gap-20 md:pb-36">
        <div>
          <p className="eyebrow">Milestones</p>
          <h2 className="mt-4 text-[clamp(2.2rem,5vw,4rem)] font-semibold leading-[0.95] tracking-[-0.025em]">
            A decade of <span className="serif-accent text-accent">doing it right.</span>
          </h2>
          <div className="mt-10 flex flex-wrap gap-2">
            {a.accreditations.map((x) => (
              <span key={x} className="flex items-center gap-2 rounded-full bg-accent-soft px-4 py-2 text-[14px] text-accent-deep"><BadgeCheck className="h-4 w-4" /> {x}</span>
            ))}
          </div>
        </div>
        <ol className="relative border-l border-line pl-8">
          {a.milestones.map((m, i) => (
            <Reveal as="li" key={m.year} delay={i * 0.06} className="relative pb-10 last:pb-0">
              <span className="absolute -left-[37px] top-1.5 h-3 w-3 rounded-full bg-accent ring-4 ring-bg" />
              <p className="font-mono text-[13px] text-accent">{m.year}</p>
              <p className="mt-1 text-[22px] font-medium leading-snug tracking-[-0.02em]">{m.text}</p>
            </Reveal>
          ))}
        </ol>
      </section>
    </>
  );
}
