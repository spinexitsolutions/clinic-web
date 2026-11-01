"use client";

import type { CollectionKey } from "@/lib/types";
import { Icon, ICON_NAMES } from "@/components/site/Icon";
import type { FieldDef } from "./fields";

type Item = Record<string, unknown>;
export interface Ctx {
  services: { id: string; name: string }[];
  currency: string;
}

export interface CollectionConfig {
  label: string;
  singular: string;
  description: string;
  sortable: boolean;
  fields: (ctx: Ctx) => FieldDef[];
  blank: (ctx: Ctx) => Item;
  title: (i: Item) => string;
  subtitle: (i: Item, ctx: Ctx) => string;
  image?: (i: Item) => string;
  icon?: (i: Item) => string;
  badge?: (i: Item) => string | null;
  previewHref?: (i: Item) => string | null;
}

const money = (n: unknown, c: string) => `${c}${Number(n || 0).toLocaleString("en-IN")}`;

export const COLLECTION_CONFIG: Record<CollectionKey, CollectionConfig> = {
  services: {
    label: "Services",
    singular: "service",
    description: "Specialties shown on the homepage, services page and booking flow.",
    sortable: true,
    title: (i) => String(i.name),
    subtitle: (i, c) => `From ${money(i.priceFrom, c.currency)} · ${i.duration} min`,
    image: (i) => String(i.image ?? ""),
    icon: (i) => String(i.icon ?? ""),
    badge: (i) => (i.featured ? "Featured" : null),
    previewHref: (i) => `/services/${i.slug}`,
    blank: () => ({ name: "", slug: "", short: "", description: "", icon: "Stethoscope", image: "", priceFrom: 1000, duration: 30, features: [], featured: false }),
    fields: () => [
      { key: "name", label: "Name", type: "text", half: true },
      { key: "slug", label: "URL slug", type: "text", half: true, hint: "auto from name" },
      { key: "short", label: "Short line", type: "textarea", rows: 2 },
      { key: "description", label: "Description", type: "textarea", rows: 5 },
      { key: "icon", label: "Icon", type: "select", options: ICON_NAMES.map((n) => ({ value: n, label: n })), renderOption: (v) => <Icon name={v} className="size-4" /> },
      { key: "image", label: "Cover image", type: "image" },
      { key: "priceFrom", label: "Price from", type: "number", half: true },
      { key: "duration", label: "Duration (min)", type: "number", half: true },
      { key: "features", label: "Highlights", type: "list", placeholder: "e.g. Same-day appointments" },
      { key: "featured", label: "Featured on homepage", type: "toggle", placeholder: "Show in homepage highlights" },
    ],
  },
  doctors: {
    label: "Doctors",
    singular: "doctor",
    description: "Profiles, fees and weekly availability used to generate bookable slots.",
    sortable: true,
    title: (i) => String(i.name),
    subtitle: (i, c) => `${i.specialty} · ${money(i.fee, c.currency)}`,
    image: (i) => String(i.image ?? ""),
    badge: (i) => (i.featured ? "Featured" : null),
    previewHref: (i) => `/doctors/${i.slug}`,
    blank: (c) => ({
      name: "Dr. ",
      slug: "",
      title: "",
      specialty: "",
      serviceIds: c.services[0] ? [c.services[0].id] : [],
      image: "",
      bio: "",
      experience: 5,
      education: [],
      languages: ["English", "Hindi"],
      fee: 1000,
      rating: 4.8,
      availability: { days: [1, 2, 3, 4, 5], start: "10:00", end: "17:00", slotMinutes: 30 },
      featured: true,
    }),
    fields: (c) => [
      { key: "name", label: "Full name", type: "text", half: true },
      { key: "slug", label: "URL slug", type: "text", half: true, hint: "auto from name" },
      { key: "specialty", label: "Specialty", type: "text", half: true, placeholder: "Cardiologist" },
      { key: "title", label: "Qualifications", type: "text", half: true, placeholder: "MD, DM (Cardiology)" },
      { key: "image", label: "Portrait", type: "image" },
      { key: "serviceIds", label: "Services offered", type: "multiselect", options: c.services.map((s) => ({ value: s.id, label: s.name })) },
      { key: "bio", label: "Bio", type: "textarea", rows: 4 },
      { key: "experience", label: "Years of experience", type: "number", half: true },
      { key: "fee", label: "Consultation fee", type: "number", half: true },
      { key: "rating", label: "Rating", type: "number", half: true, min: 0, max: 5, step: 0.1 },
      { key: "availability.slotMinutes", label: "Slot length (min)", type: "number", half: true },
      { key: "availability.days", label: "Working days", type: "days" },
      { key: "availability.start", label: "Starts at", type: "text", half: true, placeholder: "10:00" },
      { key: "availability.end", label: "Ends at", type: "text", half: true, placeholder: "17:00" },
      { key: "education", label: "Education", type: "list" },
      { key: "languages", label: "Languages", type: "list" },
      { key: "featured", label: "Featured", type: "toggle", placeholder: "Show on homepage" },
    ],
  },
  posts: {
    label: "Journal",
    singular: "article",
    description: "Health articles for the journal. Unpublished posts stay hidden.",
    sortable: false,
    title: (i) => String(i.title),
    subtitle: (i) => `${i.category} · ${i.author} · ${i.readMinutes} min`,
    image: (i) => String(i.cover ?? ""),
    badge: (i) => (i.published ? null : "Draft"),
    previewHref: (i) => (i.published ? `/blog/${i.slug}` : null),
    blank: () => ({ title: "", slug: "", excerpt: "", content: "", cover: "", category: "Wellness", author: "", readMinutes: 4, published: false, publishedAt: new Date().toISOString() }),
    fields: () => [
      { key: "title", label: "Title", type: "text" },
      { key: "slug", label: "URL slug", type: "text", half: true, hint: "auto from title" },
      { key: "category", label: "Category", type: "text", half: true },
      { key: "author", label: "Author", type: "text", half: true },
      { key: "readMinutes", label: "Read time (min)", type: "number", half: true },
      { key: "excerpt", label: "Excerpt", type: "textarea", rows: 2 },
      { key: "cover", label: "Cover image", type: "image" },
      { key: "content", label: "Content", type: "markdown", rows: 16 },
      { key: "publishedAt", label: "Publish date", type: "text", half: true, hint: "ISO date" },
      { key: "published", label: "Published", type: "toggle", half: true, placeholder: "Visible on site" },
    ],
  },
  testimonials: {
    label: "Testimonials",
    singular: "testimonial",
    description: "Patient stories shown in the testimonials carousel.",
    sortable: true,
    title: (i) => String(i.name),
    subtitle: (i) => `“${String(i.quote).slice(0, 70)}…”`,
    image: (i) => String(i.image ?? ""),
    badge: (i) => (i.visible ? null : "Hidden"),
    blank: () => ({ name: "", role: "Patient", quote: "", image: "", rating: 5, visible: true }),
    fields: () => [
      { key: "name", label: "Name", type: "text", half: true },
      { key: "role", label: "Role", type: "text", half: true, placeholder: "Patient, Cardiology" },
      { key: "quote", label: "Quote", type: "textarea", rows: 4 },
      { key: "image", label: "Photo", type: "image" },
      { key: "rating", label: "Rating (1–5)", type: "number", half: true, min: 1, max: 5 },
      { key: "visible", label: "Visible", type: "toggle", half: true, placeholder: "Show on site" },
    ],
  },
  faqs: {
    label: "FAQs",
    singular: "question",
    description: "Answers shown on the FAQ page and homepage accordion.",
    sortable: true,
    title: (i) => String(i.question),
    subtitle: (i) => String(i.category),
    blank: () => ({ question: "", answer: "", category: "General" }),
    fields: () => [
      { key: "question", label: "Question", type: "text" },
      { key: "answer", label: "Answer", type: "textarea", rows: 5 },
      { key: "category", label: "Category", type: "text", half: true },
    ],
  },
  packages: {
    label: "Packages",
    singular: "package",
    description: "Health checkup packages on the pricing page.",
    sortable: true,
    title: (i) => String(i.name),
    subtitle: (i, c) => `${money(i.price, c.currency)} · ${(i.features as string[])?.length ?? 0} inclusions`,
    badge: (i) => (i.highlighted ? "Most popular" : null),
    previewHref: () => "/packages",
    blank: () => ({ name: "", price: 2999, compareAt: 3999, tagline: "", features: [], highlighted: false }),
    fields: () => [
      { key: "name", label: "Name", type: "text" },
      { key: "tagline", label: "Tagline", type: "text" },
      { key: "price", label: "Price", type: "number", half: true },
      { key: "compareAt", label: "Compare-at price", type: "number", half: true },
      { key: "features", label: "Inclusions", type: "list" },
      { key: "highlighted", label: "Highlight", type: "toggle", placeholder: "Mark as most popular" },
    ],
  },
  insurers: {
    label: "Insurers",
    singular: "insurer",
    description: "Cashless insurance partners shown on the site.",
    sortable: true,
    title: (i) => String(i.name),
    subtitle: () => "Cashless partner",
    blank: () => ({ name: "" }),
    fields: () => [{ key: "name", label: "Insurer name", type: "text" }],
  },
};
