import type { Metadata } from "next";
import { Check, Home, FileText, Clock } from "lucide-react";
import { readDb } from "@/lib/db";
import { PageHeader } from "@/components/site/PageHeader";
import { PackageGrid } from "@/components/site/sections/Packages";
import { Reveal } from "@/components/motion/Reveal";

export const metadata: Metadata = { title: "Health packages", description: "Preventive health checkups, priced honestly." };

export default async function PackagesPage() {
  const db = await readDb();
  const perks = [
    { icon: Home, t: "Free home sample collection", d: "A phlebotomist visits at a time you choose, 6am onwards." },
    { icon: Clock, t: "Reports in 6 hours", d: "Most results land on your phone the same day." },
    { icon: FileText, t: "Doctor-reviewed", d: "Every report is explained in a consultation — not just emailed." },
    { icon: Check, t: "No hidden costs", d: "The price you see is the price you pay. GST included." },
  ];
  return (
    <>
      <PageHeader eyebrow="Preventive care" title="Know your body" accent="before it tells you." description="Thoughtfully designed checkups that catch what matters early — with a doctor to walk you through every number." />
      <section className="container-x pb-20 md:pb-28">
        <PackageGrid packages={[...db.packages].sort((a, b) => a.order - b.order)} currency={db.settings.currency} steps={db.home.proof.packageSteps} />
      </section>
      <section className="container-x pb-24 md:pb-36">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {perks.map((p, i) => (
            <Reveal key={p.t} delay={i * 0.06} className="rounded-[var(--radius)] bg-card p-6 hairline">
              <p.icon className="h-6 w-6 text-accent" strokeWidth={1.6} />
              <p className="mt-10 text-[19px] font-medium tracking-[-0.02em]">{p.t}</p>
              <p className="mt-2 text-[15px] text-muted">{p.d}</p>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
