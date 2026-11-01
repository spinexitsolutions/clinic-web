import type { Metadata } from "next";
import { PageHeader } from "@/components/site/PageHeader";
import { TrackForm } from "@/components/site/forms/TrackForm";

export const metadata: Metadata = { title: "Track your booking" };

export default async function TrackPage({ searchParams }: { searchParams: Promise<{ ref?: string; phone?: string }> }) {
  const sp = await searchParams;
  return (
    <>
      <PageHeader eyebrow="Manage booking" title="Your visit," accent="at a glance." description="Enter your booking reference and phone number to check status, see details or cancel." />
      <section className="container-x pb-24 md:pb-36">
        <TrackForm initialRef={sp.ref ?? ""} initialPhone={sp.phone ?? ""} />
      </section>
    </>
  );
}
