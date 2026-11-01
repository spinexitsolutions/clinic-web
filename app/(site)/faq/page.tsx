import type { Metadata } from "next";
import Link from "next/link";
import { readDb } from "@/lib/db";
import { PageHeader } from "@/components/site/PageHeader";
import { FAQList } from "@/components/site/sections/FAQ";

export const metadata: Metadata = { title: "FAQ" };

export default async function FAQPage() {
  const db = await readDb();
  const faqs = [...db.faqs].sort((a, b) => a.order - b.order);
  const groups = Array.from(new Set(faqs.map((f) => f.category)));
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })),
  };
  return (
    <>
      <PageHeader eyebrow="Help centre" title="Answers," accent="before you ask." description="Can't find what you need? Our care team is a call or a WhatsApp away.">
        <Link href="/contact" className="btn btn-primary">Contact us</Link>
      </PageHeader>
      <section className="container-x space-y-16 pb-24 md:pb-36">
        {groups.map((g) => (
          <div key={g} className="grid gap-6 md:grid-cols-[1fr_2.2fr] md:gap-16">
            <h2 className="text-[28px] font-medium tracking-[-0.03em] md:sticky md:top-28 md:self-start">{g}</h2>
            <FAQList faqs={faqs.filter((f) => f.category === g)} />
          </div>
        ))}
      </section>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
    </>
  );
}
