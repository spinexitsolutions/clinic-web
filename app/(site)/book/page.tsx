import type { Metadata } from "next";
import { readDb } from "@/lib/db";
import { BookingFlow } from "@/components/site/BookingFlow";
import { SplitWords } from "@/components/motion/Reveal";

export const metadata: Metadata = { title: "Book an appointment", description: "Book a same-day appointment in under a minute." };

type Props = { searchParams: Promise<{ service?: string; doctor?: string; package?: string }> };

export default async function BookPage({ searchParams }: Props) {
  const sp = await searchParams;
  const db = await readDb();
  const services = [...db.services].sort((a, b) => a.order - b.order);
  const doctors = [...db.doctors].sort((a, b) => a.order - b.order);
  const pkg = db.packages.find((p) => p.id === sp.package);
  const serviceId = services.some((s) => s.id === sp.service) ? sp.service : pkg ? services.find((s) => s.slug === "diagnostics-lab")?.id ?? services[0]?.id : undefined;
  return (
    <section className="container-x pb-24 pt-32 md:pb-36 md:pt-44">
      <div className="mb-10 md:mb-16">
        <p className="eyebrow flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-accent" /> Takes about 40 seconds</p>
        <h1 className="display mt-5 text-[clamp(2.8rem,8vw,7rem)]">
          <SplitWords text="Book a" /> <span className="serif-accent text-accent"><SplitWords text="visit." delay={0.1} /></span>
        </h1>
      </div>
      <BookingFlow services={services} doctors={doctors} init={{ serviceId, doctorId: sp.doctor, pkg }} />
    </section>
  );
}
