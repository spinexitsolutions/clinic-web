import type { MetadataRoute } from "next";
import { readDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const db = await readDb();
  const pages = ["", "/services", "/doctors", "/packages", "/about", "/blog", "/contact", "/faq", "/book", "/track"];
  return [
    ...pages.map((p) => ({ url: `${base}${p}`, changeFrequency: "weekly" as const, priority: p === "" ? 1 : 0.7 })),
    ...db.services.map((s) => ({ url: `${base}/services/${s.slug}`, priority: 0.8 })),
    ...db.doctors.map((d) => ({ url: `${base}/doctors/${d.slug}`, priority: 0.7 })),
    ...db.posts.filter((p) => p.published).map((p) => ({ url: `${base}/blog/${p.slug}`, lastModified: p.publishedAt, priority: 0.6 })),
  ];
}
