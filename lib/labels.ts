/**
 * Small UI copy ("microcopy") used inside homepage sections.
 * Edited in Admin → Homepage → Labels. Use {n} / {name} placeholders where shown.
 */
export const DEFAULT_LABELS = {
  // shared
  today: "Today",
  tomorrow: "Tomorrow",
  openNow: "Open now",
  nextFree: "Next free",
  // hero
  heroNowViewing: "Now viewing",
  heroCallToBook: "Call to book",
  // specialties explorer
  servicesDoctorCount: "{n} doctors",
  servicesDoctorCountOne: "1 doctor",
  servicesNoDoctors: "Care team",
  servicesBook: "Book",
  servicesDetails: "Details",
  // numbers
  statsToday: "Today",
  statsAvgWait: "Average wait",
  statsMinutes: "min",
  statsCityAvg: "City average: {n} min",
  statsRecommendFallback: "Would recommend us",
  // doctors roster
  boardDoctor: "Doctor",
  boardSpecialty: "Specialty",
  boardExperience: "Experience",
  boardSpeaks: "Speaks",
  boardYears: "{n}+ yrs",
  boardOnRequest: "On request",
  // packages
  pkgMostBooked: "Most booked",
  pkgSave: "Save {n}%",
  pkgInclusions: "{n} inclusions",
  pkgTaxNote: "All taxes included · Pay at visit",
  pkgNextTitle: "What happens next",
  pkgBook: "Book {name}",
  // reviews
  reviewsSource: "Google reviews",
  reviewsNote: "Every review is from a verified visit. We reply to every single one — the good and the hard.",
  // journal
  journalFeatured: "Featured",
  journalMinRead: "{n} min read",
  journalEmpty: "More articles coming soon.",
  // faq card
  faqCardTitle: "Still have questions?",
  faqCardText: "Our care team replies in minutes during opening hours — no bots.",
  faqCall: "Call",
  faqWhatsapp: "WhatsApp",
  faqWhatsappMessage: "Hi {name}, I have a question.",
  // final cta tiles
  ctaBookKicker: "Online · 40 seconds",
  ctaBookTitle: "Book a visit",
  ctaBookSub: "Pick a doctor and a live slot",
  ctaChatKicker: "WhatsApp · replies in minutes",
  ctaChatTitle: "Chat with us",
  ctaEmergencyKicker: "Emergency · 24 × 7",
  ctaEmergencySub: "Ambulance & urgent care",
  ctaWhatsappMessage: "Hi {name}, I'd like to book an appointment.",
};

export type LabelKey = keyof typeof DEFAULT_LABELS;
export type Labels = Record<LabelKey, string>;

/** Groups + human names for the admin form. */
export const LABEL_GROUPS: { title: string; hint?: string; items: [LabelKey, string][] }[] = [
  { title: "Shared", items: [["today", "“Today”"], ["tomorrow", "“Tomorrow”"], ["openNow", "Open status"], ["nextFree", "“Next free” (slot)"]] },
  { title: "Hero", items: [["heroNowViewing", "Specialty chip label"], ["heroCallToBook", "When no slot is free"]] },
  {
    title: "Specialties explorer",
    hint: "{n} = number of doctors",
    items: [["servicesDoctorCount", "Doctor count"], ["servicesDoctorCountOne", "Doctor count (one)"], ["servicesNoDoctors", "When no doctor is linked"], ["servicesBook", "Book button"], ["servicesDetails", "Details button (mobile)"]],
  },
  {
    title: "Numbers",
    hint: "{n} = city average minutes",
    items: [["statsToday", "Graph end label"], ["statsAvgWait", "Wait tile title"], ["statsMinutes", "Minutes unit"], ["statsCityAvg", "City average line"], ["statsRecommendFallback", "Recommend tile (fallback)"]],
  },
  {
    title: "Doctors roster",
    hint: "{n} = years of experience",
    items: [["boardDoctor", "Column · Doctor"], ["boardSpecialty", "Column · Specialty"], ["boardExperience", "Column · Experience"], ["boardSpeaks", "Column · Languages"], ["boardYears", "Experience format"], ["boardOnRequest", "When no slot is free"]],
  },
  {
    title: "Packages",
    hint: "{n} = number · {name} = package name",
    items: [["pkgMostBooked", "Highlighted tag"], ["pkgSave", "Savings badge"], ["pkgInclusions", "Inclusions badge"], ["pkgTaxNote", "Note under price"], ["pkgNextTitle", "Steps heading"], ["pkgBook", "Book button"]],
  },
  { title: "Reviews", items: [["reviewsSource", "Text after review count"], ["reviewsNote", "Note under the rating"]] },
  { title: "Journal", hint: "{n} = minutes", items: [["journalFeatured", "Featured tag"], ["journalMinRead", "Read time"], ["journalEmpty", "When no articles"]] },
  {
    title: "FAQ help card",
    hint: "{name} = clinic short name",
    items: [["faqCardTitle", "Title"], ["faqCardText", "Text"], ["faqCall", "Call button"], ["faqWhatsapp", "WhatsApp button"], ["faqWhatsappMessage", "WhatsApp pre-filled message"]],
  },
  {
    title: "Final call-to-action tiles",
    hint: "{name} = clinic short name",
    items: [
      ["ctaBookKicker", "Book · small label"], ["ctaBookTitle", "Book · title"], ["ctaBookSub", "Book · text"],
      ["ctaChatKicker", "WhatsApp · small label"], ["ctaChatTitle", "WhatsApp · title"],
      ["ctaEmergencyKicker", "Emergency · small label"], ["ctaEmergencySub", "Emergency · text"],
      ["ctaWhatsappMessage", "WhatsApp pre-filled message"],
    ],
  },
];

export function fmt(template: string, vars: Record<string, string | number> = {}) {
  return template.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m));
}
