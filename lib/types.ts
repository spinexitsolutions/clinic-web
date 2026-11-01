// ─────────────────────────────────────────────────────────────
//  Domain model — everything the site renders and the admin edits
// ─────────────────────────────────────────────────────────────

export type ID = string;

export interface OpeningHour {
  day: string; // "Mon"
  open: string; // "09:00"
  close: string; // "20:00"
  closed: boolean;
}

export interface NavLink {
  id: ID;
  label: string;
  href: string;
  visible: boolean;
}

export interface SiteSettings {
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  phone: string;
  emergencyPhone: string;
  whatsapp: string; // digits only incl. country code
  email: string;
  address: string;
  city: string;
  mapEmbedUrl: string;
  hours: OpeningHour[];
  socials: { instagram: string; facebook: string; x: string; linkedin: string; youtube: string };
  announcement: { enabled: boolean; text: string; href: string };
  showWhatsappButton: boolean;
  currency: string;
}

export interface Appearance {
  accent: string; // hex
  accentInk: string; // text colour used on top of accent
  highlight: string; // secondary pop colour (small details)
  background: string;
  ink: string;
  radius: number; // px
  intro: {
    enabled: boolean;
    style: "pulse" | "letters" | "curtain";
    word: string;
    tagline: string;
    durationMs: number;
    oncePerSession: boolean;
  };
  smoothScroll: boolean;
  cursorFollower: boolean;
  nav: NavLink[];
  navCta: { label: string; href: string };
}

export type HomeSectionKey =
  | "hero"
  | "marquee"
  | "statement"
  | "services"
  | "stats"
  | "process"
  | "doctors"
  | "packages"
  | "testimonials"
  | "blog"
  | "faq"
  | "cta";

export interface HomeSection {
  key: HomeSectionKey;
  label: string;
  visible: boolean;
}

export interface HomeContent {
  sections: HomeSection[];
  hero: {
    eyebrow: string;
    titleLine1: string;
    titleAccent: string; // rendered in serif italic
    titleLine2: string;
    subtitle: string;
    image: string;
    primaryCta: { label: string; href: string };
    secondaryCta: { label: string; href: string };
    rating: string;
    ratingLabel: string;
  };
  marquee: string[];
  statement: string;
  stats: { value: number; suffix: string; label: string }[];
  process: { title: string; text: string; image: string }[];
  cta: { title: string; subtitle: string; image: string };
}

export interface AboutContent {
  title: string;
  intro: string;
  story: string;
  image: string;
  gallery: string[];
  values: { title: string; text: string }[];
  milestones: { year: string; text: string }[];
  accreditations: string[];
}

export interface Service {
  id: ID;
  slug: string;
  name: string;
  short: string;
  description: string;
  icon: string; // lucide icon name
  image: string;
  priceFrom: number;
  duration: number; // minutes
  features: string[];
  featured: boolean;
  order: number;
}

export interface Doctor {
  id: ID;
  slug: string;
  name: string;
  title: string;
  specialty: string;
  serviceIds: ID[];
  image: string;
  bio: string;
  experience: number;
  education: string[];
  languages: string[];
  fee: number;
  rating: number;
  availability: { days: number[]; start: string; end: string; slotMinutes: number };
  featured: boolean;
  order: number;
}

export interface Testimonial {
  id: ID;
  name: string;
  role: string;
  quote: string;
  image: string;
  rating: number;
  visible: boolean;
}

export interface FAQ {
  id: ID;
  question: string;
  answer: string;
  category: string;
  order: number;
}

export interface Package {
  id: ID;
  name: string;
  price: number;
  compareAt: number;
  tagline: string;
  features: string[];
  highlighted: boolean;
  order: number;
}

export interface Post {
  id: ID;
  slug: string;
  title: string;
  excerpt: string;
  content: string; // light markdown: paragraphs, ## headings, - lists
  cover: string;
  category: string;
  author: string;
  readMinutes: number;
  published: boolean;
  publishedAt: string; // ISO
}

export interface Insurance {
  id: ID;
  name: string;
}

// ── CRM ──────────────────────────────────────────────────────

export type AppointmentStatus = "pending" | "confirmed" | "completed" | "cancelled" | "no-show";

export interface Appointment {
  id: ID;
  ref: string; // human readable e.g. SOL-4F7K2
  patientId: ID;
  name: string;
  phone: string;
  email: string;
  serviceId: ID;
  doctorId: ID;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  type: "in-clinic" | "video";
  notes: string;
  status: AppointmentStatus;
  source: "website" | "phone" | "walk-in" | "admin";
  fee: number;
  createdAt: string;
  internalNotes: string;
}

export interface Patient {
  id: ID;
  name: string;
  phone: string;
  email: string;
  gender: "" | "female" | "male" | "other";
  dob: string;
  bloodGroup: string;
  tags: string[];
  notes: string;
  createdAt: string;
}

export type LeadStage = "new" | "contacted" | "qualified" | "converted" | "lost";

export interface Lead {
  id: ID;
  name: string;
  phone: string;
  email: string;
  subject: string;
  message: string;
  source: "contact-form" | "newsletter" | "callback" | "admin" | "booking";
  stage: LeadStage;
  value: number;
  assignee: string;
  activity: { at: string; text: string }[];
  createdAt: string;
}

export interface Subscriber {
  id: ID;
  email: string;
  createdAt: string;
}

export interface Database {
  version: number;
  settings: SiteSettings;
  appearance: Appearance;
  home: HomeContent;
  about: AboutContent;
  services: Service[];
  doctors: Doctor[];
  testimonials: Testimonial[];
  faqs: FAQ[];
  packages: Package[];
  posts: Post[];
  insurers: Insurance[];
  appointments: Appointment[];
  patients: Patient[];
  leads: Lead[];
  subscribers: Subscriber[];
}

export type CollectionKey =
  | "services"
  | "doctors"
  | "testimonials"
  | "faqs"
  | "packages"
  | "posts"
  | "insurers";
