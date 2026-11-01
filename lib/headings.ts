import type { HeadingKey, MegaMenuContent, SectionHeading } from "./types";

/** Default section headings — used by the seed and as fallbacks in components. */
export const DEFAULT_HEADINGS: Record<HeadingKey, SectionHeading> = {
  marquee: { eyebrow: "Specialties", title: "", accent: "", intro: "under one roof", link: "" },
  statement: { number: "01", eyebrow: "Philosophy", title: "", accent: "", intro: "", link: "" },
  services: {
    number: "02",
    eyebrow: "Specialties",
    title: "Every specialty,",
    accent: "one calm roof.",
    intro: "{count} departments that share one record, one care team and one plan — so you never repeat your story twice.",
    link: "Browse all specialties",
  },
  stats: { eyebrow: "In numbers", title: "The quiet", accent: "proof.", intro: "A decade of measurable, patient-first care — tracked honestly and published openly.", link: "" },
  process: { number: "03", eyebrow: "Your visit", title: "One visit,", accent: "four heartbeats.", intro: "We designed every minute of a Solace visit — from the moment you book to the call a week later.", link: "" },
  doctors: {
    number: "04",
    eyebrow: "Care team",
    title: "Specialists who",
    accent: "make time.",
    intro: "Availability below is live — pulled from each doctor’s calendar as you load the page.",
    link: "Meet everyone",
  },
  packages: {
    eyebrow: "Health checkups",
    title: "Prevention,",
    accent: "priced honestly.",
    intro: "Compare our checkups side by side. Every package includes a doctor who walks you through the results.",
    link: "",
  },
  testimonials: { eyebrow: "Patient stories", title: "Heard,", accent: "not hurried.", intro: "", link: "" },
  blog: { eyebrow: "The journal", title: "Notes from", accent: "our doctors.", intro: "", link: "Read the journal" },
  faq: { eyebrow: "Questions", title: "Good to", accent: "know.", intro: "", link: "Browse all FAQs" },
  cta: { eyebrow: "Your next step", title: "", accent: "", intro: "", link: "" },
};

/** Which fields each section actually renders (drives the admin form). */
export const HEADING_FIELDS: Record<HeadingKey, (keyof SectionHeading)[]> = {
  marquee: ["eyebrow", "intro"],
  statement: ["number", "eyebrow"],
  services: ["number", "eyebrow", "title", "accent", "intro", "link"],
  stats: ["eyebrow", "title", "accent", "intro"],
  process: ["number", "eyebrow", "title", "accent", "intro"],
  doctors: ["number", "eyebrow", "title", "accent", "intro", "link"],
  packages: ["eyebrow", "title", "accent", "intro"],
  testimonials: ["eyebrow", "title", "accent"],
  blog: ["eyebrow", "title", "accent", "link"],
  faq: ["eyebrow", "title", "accent", "link"],
  cta: ["eyebrow"],
};

export const DEFAULT_MEGA: MegaMenuContent = {
  servicesBadge: "Same-day slots",
  servicesTitle: "Not sure where to start?",
  servicesText: "Book a general consult — we’ll route you to the right specialist.",
  servicesHref: "/book",
  servicesLink: "View all",
  doctorsTitle: "Talk to our care team",
  doctorsText: "Tell us your symptoms — we’ll match you with the right doctor.",
  doctorsLink: "All doctors",
};

export function heading(key: HeadingKey, h?: Partial<SectionHeading>): SectionHeading {
  return { ...DEFAULT_HEADINGS[key], ...h };
}
