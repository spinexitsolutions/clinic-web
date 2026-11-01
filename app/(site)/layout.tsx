import { readDb } from "@/lib/db";
import { SiteProvider } from "@/components/site/SiteContext";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { AnnouncementBar, WhatsAppButton } from "@/components/site/Chrome";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { Intro, IntroGate } from "@/components/motion/Intro";
import { Cursor } from "@/components/motion/Cursor";

export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const db = await readDb();
  const { settings, appearance } = db;
  const services = [...db.services].sort((a, b) => a.order - b.order);
  const navData = {
    services: services.map(({ id, slug, name, icon, priceFrom, short, image, featured }) => ({ id, slug, name, icon, priceFrom, short, image, featured })),
    doctors: [...db.doctors].sort((a, b) => a.order - b.order).map(({ id, slug, name, specialty, image, rating }) => ({ id, slug, name, specialty, image, rating })),
    posts: db.posts.filter((p) => p.published).map(({ slug, title, category }) => ({ slug, title, category })),
  };
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MedicalClinic",
    name: settings.name,
    description: settings.description,
    telephone: settings.phone,
    email: settings.email,
    address: { "@type": "PostalAddress", streetAddress: settings.address, addressLocality: settings.city },
    medicalSpecialty: services.map((s) => s.name),
    openingHoursSpecification: settings.hours
      .filter((h) => !h.closed)
      .map((h) => ({ "@type": "OpeningHoursSpecification", dayOfWeek: h.day, opens: h.open, closes: h.close })),
  };

  return (
    <SiteProvider value={{ settings, appearance, labels: db.home.labels }}>
      <IntroGate cfg={appearance.intro} />
      <Intro cfg={appearance.intro} />
      <SmoothScroll enabled={appearance.smoothScroll} />
      {appearance.cursorFollower && <Cursor />}
      <AnnouncementBar />
      <Navbar data={navData} />
      <main className="relative">{children}</main>
      <Footer settings={settings} appearance={appearance} services={services} />
      <div className="h-24 bg-ink lg:hidden" aria-hidden />
      <WhatsAppButton />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
    </SiteProvider>
  );
}
