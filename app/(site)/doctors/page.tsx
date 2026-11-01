import type { Metadata } from "next";
import { readDb } from "@/lib/db";
import { PageHeader } from "@/components/site/PageHeader";
import { DoctorsDirectory } from "@/components/site/DoctorsDirectory";

export const metadata: Metadata = { title: "Our doctors", description: "Meet the specialists at Solace." };

export default async function DoctorsPage() {
  const db = await readDb();
  const doctors = [...db.doctors].sort((a, b) => a.order - b.order);
  const services = [...db.services].sort((a, b) => a.order - b.order);
  return (
    <>
      <PageHeader
        eyebrow="The care team"
        title="Brilliant doctors."
        accent="Better listeners."
        description="Trained at India's finest institutions, chosen for how well they explain things. Every Solace doctor books fewer patients a day — on purpose."
      />
      <DoctorsDirectory doctors={doctors} services={services} />
    </>
  );
}
