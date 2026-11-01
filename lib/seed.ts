import type { Appointment, AppointmentStatus, Database, Lead, LeadStage, Patient } from "./types";

const U = (id: string) => `https://images.unsplash.com/photo-${id}`;

export const IMAGES = {
  reception: U("1519494026892-80bbd2d6fd0d"),
  consult: U("1631217868264-e5b90bb7e133"),
  surgeonsCircle: U("1579684385127-1ef15d508118"),
  screens: U("1666214280557-f1b5022eb634"),
  screens2: U("1666214280391-8ff5bd3c0bf0"),
  ward: U("1538108149393-fbbd81895907"),
  bedside: U("1581056771107-24ca5f033842"),
  stethoscope: U("1505751172876-fa1923c5c528"),
  stethoscopeWhite: U("1638202993928-7267aad84c31"),
  stethoscopeFlat: U("1603398938378-e54eab446dde"),
  xray: U("1530497610245-94d3c16cda28"),
  dentalRoom: U("1629909615184-74f495363b67"),
  dentalChair: U("1598256989800-fe5f95da9787"),
  dental: U("1629909613654-28e377c37b09"),
  elderly: U("1576765608535-5f04d1e3f289"),
  lab: U("1527613426441-4da17471b66d"),
  pipette: U("1532187863486-abf9dbad1b69"),
  bp: U("1631815588090-d4bfec5b1ccb"),
  brain: U("1559757148-5c350d0d3c56"),
  physio: U("1571019613454-1cb2f99b2d8b"),
  pediatric: U("1624727828489-a1e03b79bba8"),
  skin: U("1554151228-14d9def656e4"),
  mind: U("1506126613408-eca07ce68773"),
  food: U("1490645935967-10de6ba17061"),
  hands: U("1584515933487-779824d29309"),
  pharmacy: U("1580281657527-47f249e8f4df"),
  yoga: U("1545205597-3d9d02c29597"),
  // people
  drArjun: U("1612349317150-e413f6a5b16d"),
  drMeera: U("1559839734-2b71ea197ec2"),
  drRahul: U("1622253692010-333f2da6031d"),
  drAisha: U("1594824476967-48c8b964273f"),
  drKabir: U("1612531386530-97286d97c2d2"),
  drNaina: U("1651008376811-b90baee60c1f"),
  p1: U("1573496359142-b8d87734a5a2"),
  p2: U("1500648767791-00dcc994a43e"),
  p3: U("1494790108377-be9c29b29330"),
  p4: U("1507003211169-0a1dd7228f2d"),
  p5: U("1438761681033-6461ffad8d80"),
  p6: U("1560250097-0b93528c311a"),
};

const weekdays = [1, 2, 3, 4, 5, 6];

function iso(d: Date) {
  return d.toISOString();
}
function dateOnly(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function addDays(n: number) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
}

// deterministic pseudo-random so the demo data is stable per seed
function rng(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

export function createSeed(): Database {
  const services = [
    {
      id: "svc-general",
      slug: "general-medicine",
      name: "General Medicine",
      short: "Unhurried consultations for everyday health — and the not-so-everyday.",
      description:
        "Your first stop for fevers, infections, chronic conditions and everything in between. Our physicians take the time to listen, examine thoroughly and explain clearly — so you leave with answers, not more questions.",
      icon: "Stethoscope",
      image: IMAGES.consult,
      priceFrom: 800,
      duration: 30,
      features: ["Same-day appointments", "Chronic care plans", "Home sample collection", "Digital prescriptions"],
      featured: true,
      order: 1,
    },
    {
      id: "svc-cardio",
      slug: "cardiology",
      name: "Cardiology",
      short: "Heart care that pairs precise diagnostics with a human pace.",
      description:
        "From ECG and 2D-echo to stress tests and long-term rhythm monitoring, our cardiac team helps you understand your heart and protect it for decades to come.",
      icon: "HeartPulse",
      image: IMAGES.bp,
      priceFrom: 1500,
      duration: 45,
      features: ["ECG & 2D Echo", "TMT stress test", "Holter monitoring", "Preventive heart check"],
      featured: true,
      order: 2,
    },
    {
      id: "svc-dental",
      slug: "dental-care",
      name: "Dental Care",
      short: "Bright, pain-aware dentistry in a studio that feels nothing like a clinic.",
      description:
        "Cleanings, aligners, implants and smile design — delivered with digital scans, gentle techniques and transparent pricing.",
      icon: "Smile",
      image: IMAGES.dentalRoom,
      priceFrom: 600,
      duration: 40,
      features: ["Clear aligners", "Implants", "Root canal (single sitting)", "Teeth whitening"],
      featured: true,
      order: 3,
    },
    {
      id: "svc-peds",
      slug: "pediatrics",
      name: "Pediatrics",
      short: "Calm, playful care for little ones — and reassurance for parents.",
      description:
        "Vaccinations, growth tracking, nutrition guidance and sick visits, delivered by pediatricians who know how to make children feel safe.",
      icon: "Baby",
      image: IMAGES.pediatric,
      priceFrom: 900,
      duration: 30,
      features: ["Vaccination schedule", "Growth & development", "Newborn care", "Lactation support"],
      featured: true,
      order: 4,
    },
    {
      id: "svc-neuro",
      slug: "neurology",
      name: "Neurology",
      short: "Clarity for headaches, sleep, memory and nerve conditions.",
      description:
        "Specialist evaluation for migraines, epilepsy, neuropathy, sleep disorders and memory concerns, backed by in-house EEG and nerve conduction studies.",
      icon: "Brain",
      image: IMAGES.brain,
      priceFrom: 1800,
      duration: 45,
      features: ["Migraine clinic", "EEG & NCV", "Sleep assessment", "Memory clinic"],
      featured: false,
      order: 5,
    },
    {
      id: "svc-ortho",
      slug: "orthopedics-physio",
      name: "Orthopedics & Physio",
      short: "Move freely again with bone, joint and sports-injury care.",
      description:
        "Orthopedic consults paired with an in-house physiotherapy studio for back pain, sports injuries, arthritis and post-surgical rehab.",
      icon: "Bone",
      image: IMAGES.physio,
      priceFrom: 1200,
      duration: 45,
      features: ["Sports injury clinic", "Spine care", "Post-op rehab", "Posture correction"],
      featured: true,
      order: 6,
    },
    {
      id: "svc-derm",
      slug: "dermatology",
      name: "Dermatology",
      short: "Evidence-based skin, hair and nail care. No gimmicks.",
      description:
        "Acne, pigmentation, eczema, hair loss and skin checks — with treatment plans grounded in medicine rather than trends.",
      icon: "Sparkles",
      image: IMAGES.skin,
      priceFrom: 1000,
      duration: 30,
      features: ["Acne & scar care", "Hair-loss clinic", "Mole mapping", "Chemical peels"],
      featured: false,
      order: 7,
    },
    {
      id: "svc-diag",
      slug: "diagnostics-lab",
      name: "Diagnostics & Lab",
      short: "NABL-accredited lab with reports on your phone in hours.",
      description:
        "Blood work, imaging and full-body screenings with home sample collection and doctor-reviewed digital reports.",
      icon: "Microscope",
      image: IMAGES.lab,
      priceFrom: 399,
      duration: 20,
      features: ["Home collection", "Reports in 6 hours", "Digital X-ray", "Ultrasound"],
      featured: false,
      order: 8,
    },
    {
      id: "svc-mind",
      slug: "mental-wellness",
      name: "Mental Wellness",
      short: "Therapy and psychiatry in a space that feels safe.",
      description:
        "Confidential sessions with psychologists and psychiatrists for anxiety, depression, stress and relationships — in person or by video.",
      icon: "Leaf",
      image: IMAGES.mind,
      priceFrom: 1500,
      duration: 50,
      features: ["Individual therapy", "Couples counselling", "Psychiatric care", "Video sessions"],
      featured: false,
      order: 9,
    },
  ];

  const doctors = [
    {
      id: "doc-arjun",
      slug: "dr-arjun-mehta",
      name: "Dr. Arjun Mehta",
      title: "MD, DM (Cardiology)",
      specialty: "Cardiologist",
      serviceIds: ["svc-cardio", "svc-general"],
      image: IMAGES.drArjun,
      bio: "Arjun has spent 14 years helping people understand their hearts. He trained at AIIMS New Delhi and believes the best cardiology starts with a long conversation, not a long list of tests.",
      experience: 14,
      education: ["MBBS — AIIMS, New Delhi", "MD Internal Medicine — PGIMER", "DM Cardiology — AIIMS"],
      languages: ["English", "Hindi", "Gujarati"],
      fee: 1500,
      rating: 4.9,
      availability: { days: [1, 2, 3, 4, 5], start: "10:00", end: "17:00", slotMinutes: 30 },
      featured: true,
      order: 1,
    },
    {
      id: "doc-meera",
      slug: "dr-meera-iyer",
      name: "Dr. Meera Iyer",
      title: "MD (General Medicine)",
      specialty: "Family Physician",
      serviceIds: ["svc-general", "svc-diag"],
      image: IMAGES.drMeera,
      bio: "Meera leads our primary-care team. Patients describe her as the doctor who remembers everything — from your last blood report to your daughter's exam dates.",
      experience: 11,
      education: ["MBBS — Madras Medical College", "MD General Medicine — CMC Vellore"],
      languages: ["English", "Tamil", "Hindi", "Kannada"],
      fee: 800,
      rating: 4.9,
      availability: { days: weekdays, start: "09:00", end: "18:00", slotMinutes: 20 },
      featured: true,
      order: 2,
    },
    {
      id: "doc-rahul",
      slug: "dr-rahul-sen",
      name: "Dr. Rahul Sen",
      title: "MS (Ortho), Sports Medicine",
      specialty: "Orthopedic Surgeon",
      serviceIds: ["svc-ortho"],
      image: IMAGES.drRahul,
      bio: "A former state-level footballer, Rahul specialises in sports injuries and keyhole joint surgery — and in getting people back to the things they love.",
      experience: 9,
      education: ["MBBS — KMC Manipal", "MS Orthopedics — KEM Mumbai", "Fellowship Sports Medicine — Sydney"],
      languages: ["English", "Hindi", "Bengali"],
      fee: 1200,
      rating: 4.8,
      availability: { days: [1, 3, 5, 6], start: "11:00", end: "19:00", slotMinutes: 30 },
      featured: true,
      order: 3,
    },
    {
      id: "doc-aisha",
      slug: "dr-aisha-khan",
      name: "Dr. Aisha Khan",
      title: "BDS, MDS (Orthodontics)",
      specialty: "Dental Surgeon",
      serviceIds: ["svc-dental"],
      image: IMAGES.drAisha,
      bio: "Aisha designs smiles with digital scans and a very gentle hand. She's our go-to for aligners, and for anyone who is nervous about the dentist.",
      experience: 8,
      education: ["BDS — Manipal College of Dental Sciences", "MDS Orthodontics — Nair Hospital"],
      languages: ["English", "Hindi", "Urdu"],
      fee: 600,
      rating: 5.0,
      availability: { days: weekdays, start: "10:00", end: "18:00", slotMinutes: 40 },
      featured: true,
      order: 4,
    },
    {
      id: "doc-kabir",
      slug: "dr-kabir-rao",
      name: "Dr. Kabir Rao",
      title: "MD, DM (Neurology)",
      specialty: "Neurologist",
      serviceIds: ["svc-neuro", "svc-mind"],
      image: IMAGES.drKabir,
      bio: "Kabir runs our migraine and sleep clinics. He's known for explaining complex neurology with sketches on whatever paper is nearby.",
      experience: 12,
      education: ["MBBS — JIPMER", "MD Medicine — JIPMER", "DM Neurology — NIMHANS"],
      languages: ["English", "Telugu", "Hindi"],
      fee: 1800,
      rating: 4.8,
      availability: { days: [2, 4, 6], start: "10:00", end: "16:00", slotMinutes: 45 },
      featured: false,
      order: 5,
    },
    {
      id: "doc-naina",
      slug: "dr-naina-kapoor",
      name: "Dr. Naina Kapoor",
      title: "MD (Pediatrics), MD (DVL)",
      specialty: "Pediatrician & Dermatologist",
      serviceIds: ["svc-peds", "svc-derm"],
      image: IMAGES.drNaina,
      bio: "Naina is dual-trained in pediatrics and dermatology, which makes her the favourite of both parents dealing with eczema and teenagers dealing with acne.",
      experience: 10,
      education: ["MBBS — LHMC Delhi", "MD Pediatrics — MAMC", "MD Dermatology — PGIMER"],
      languages: ["English", "Hindi", "Punjabi"],
      fee: 1000,
      rating: 4.9,
      availability: { days: weekdays, start: "09:30", end: "15:30", slotMinutes: 30 },
      featured: true,
      order: 6,
    },
  ];

  // ── CRM demo data ──────────────────────────────────────────
  const r = rng(42);
  const pick = <T,>(arr: T[]) => arr[Math.floor(r() * arr.length)];
  const firstNames = ["Ananya", "Rohan", "Priya", "Vikram", "Sneha", "Aditya", "Kavya", "Arnav", "Isha", "Karan", "Neha", "Siddharth", "Pooja", "Rahul", "Tanvi", "Manish", "Riya", "Dev", "Simran", "Aman", "Diya", "Harsh", "Meghna", "Nikhil"];
  const lastNames = ["Sharma", "Patel", "Reddy", "Nair", "Gupta", "Desai", "Joshi", "Menon", "Bose", "Malhotra", "Kulkarni", "Chopra", "Shetty", "Agarwal"];

  const patients: Patient[] = [];
  for (let i = 0; i < 24; i++) {
    const name = `${firstNames[i]} ${pick(lastNames)}`;
    const created = addDays(-Math.floor(r() * 120) - 5);
    patients.push({
      id: `pat-${i + 1}`,
      name,
      phone: `+91 9${Math.floor(100000000 + r() * 899999999)}`,
      email: `${name.split(" ")[0].toLowerCase()}.${name.split(" ")[1].toLowerCase()}@gmail.com`,
      gender: pick(["female", "male"] as const),
      dob: dateOnly(new Date(1965 + Math.floor(r() * 40), Math.floor(r() * 12), 1 + Math.floor(r() * 27))),
      bloodGroup: pick(["A+", "B+", "O+", "AB+", "O-", "A-"]),
      tags: r() > 0.6 ? [pick(["VIP", "Chronic care", "Insurance", "Follow-up", "Corporate"])] : [],
      notes: "",
      createdAt: iso(created),
    });
  }

  const appointments: Appointment[] = [];
  const times = ["09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "14:00", "14:30", "15:00", "16:00", "16:30", "17:00"];
  for (let i = 0; i < 64; i++) {
    const offset = Math.floor(r() * 34) - 24; // past 24 days .. next 10 days
    const doc = pick(doctors);
    const p = pick(patients);
    const date = addDays(offset);
    let status: AppointmentStatus;
    if (offset < 0) status = r() > 0.85 ? "cancelled" : r() > 0.92 ? "no-show" : "completed";
    else if (offset === 0) status = r() > 0.3 ? "confirmed" : "pending";
    else status = r() > 0.45 ? "confirmed" : "pending";
    appointments.push({
      id: `apt-${i + 1}`,
      ref: `SOL-${(10000 + i * 37).toString(36).toUpperCase()}`,
      patientId: p.id,
      name: p.name,
      phone: p.phone,
      email: p.email,
      serviceId: doc.serviceIds[0],
      doctorId: doc.id,
      date: dateOnly(date),
      time: pick(times),
      type: r() > 0.8 ? "video" : "in-clinic",
      notes: r() > 0.7 ? pick(["Follow-up for last month's reports", "Persistent headache for 2 weeks", "Routine check-up", "Knee pain after running", "Child vaccination due"]) : "",
      status,
      source: pick(["website", "website", "website", "phone", "walk-in"] as const),
      fee: doc.fee,
      createdAt: iso(addDays(offset - 1 - Math.floor(r() * 5))),
      internalNotes: "",
    });
  }
  appointments.sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));

  const stages: LeadStage[] = ["new", "new", "new", "contacted", "contacted", "qualified", "qualified", "converted", "lost"];
  const subjects = [
    ["Corporate health check for 40 employees", 120000],
    ["Aligners consultation", 85000],
    ["Senior citizen annual package", 18000],
    ["Physiotherapy for ACL rehab", 24000],
    ["Second opinion on angiography", 3000],
    ["Insurance cashless query", 0],
    ["Pre-employment medicals", 45000],
    ["Child vaccination schedule", 9000],
    ["Full-body checkup for parents", 12000],
    ["Hair loss treatment cost", 15000],
  ] as const;
  const leads: Lead[] = subjects.map(([subject, value], i) => {
    const name = `${pick(firstNames)} ${pick(lastNames)}`;
    const created = addDays(-Math.floor(r() * 20));
    return {
      id: `lead-${i + 1}`,
      name,
      phone: `+91 8${Math.floor(100000000 + r() * 899999999)}`,
      email: `${name.split(" ")[0].toLowerCase()}@outlook.com`,
      subject,
      message: `Hi, I wanted to know more about: ${subject.toLowerCase()}. Please call me back.`,
      source: pick(["contact-form", "contact-form", "callback", "booking"] as const),
      stage: stages[i % stages.length],
      value,
      assignee: pick(["Front desk", "Meera", "Care team"]),
      activity: [{ at: iso(created), text: "Lead created from website" }],
      createdAt: iso(created),
    };
  });

  return {
    version: 1,
    settings: {
      name: "Solace Clinic",
      shortName: "Solace",
      tagline: "Medicine, made human.",
      description:
        "Solace is a multi-specialty clinic in Bengaluru where world-class doctors take the time to listen. Book same-day appointments for general medicine, cardiology, dental, pediatrics and more.",
      phone: "+91 80 4567 8900",
      emergencyPhone: "+91 98450 00108",
      whatsapp: "919845000108",
      email: "care@solace.clinic",
      address: "42, 80 Feet Road, Koramangala 4th Block",
      city: "Bengaluru, Karnataka 560034",
      mapEmbedUrl: "https://www.google.com/maps?q=Koramangala+4th+Block+Bengaluru&output=embed",
      hours: [
        { day: "Mon", open: "08:00", close: "21:00", closed: false },
        { day: "Tue", open: "08:00", close: "21:00", closed: false },
        { day: "Wed", open: "08:00", close: "21:00", closed: false },
        { day: "Thu", open: "08:00", close: "21:00", closed: false },
        { day: "Fri", open: "08:00", close: "21:00", closed: false },
        { day: "Sat", open: "09:00", close: "18:00", closed: false },
        { day: "Sun", open: "10:00", close: "14:00", closed: false },
      ],
      socials: {
        instagram: "https://instagram.com",
        facebook: "https://facebook.com",
        x: "https://x.com",
        linkedin: "https://linkedin.com",
        youtube: "https://youtube.com",
      },
      announcement: { enabled: true, text: "Monsoon wellness week — full-body checkups at 30% off", href: "/packages" },
      showWhatsappButton: true,
      currency: "₹",
    },
    appearance: {
      accent: "#0E7C66",
      accentInk: "#FFFFFF",
      background: "#F5F4F0",
      ink: "#0B0D0C",
      radius: 28,
      intro: {
        enabled: true,
        style: "pulse",
        word: "Solace",
        tagline: "Medicine, made human.",
        durationMs: 2600,
        oncePerSession: true,
      },
      smoothScroll: true,
      cursorFollower: true,
      nav: [
        { id: "n1", label: "Services", href: "/services", visible: true },
        { id: "n2", label: "Doctors", href: "/doctors", visible: true },
        { id: "n3", label: "Packages", href: "/packages", visible: true },
        { id: "n4", label: "About", href: "/about", visible: true },
        { id: "n5", label: "Journal", href: "/blog", visible: true },
        { id: "n6", label: "Contact", href: "/contact", visible: true },
        { id: "n7", label: "FAQ", href: "/faq", visible: false },
      ],
      navCta: { label: "Book a visit", href: "/book" },
    },
    home: {
      sections: [
        { key: "hero", label: "Hero", visible: true },
        { key: "marquee", label: "Specialty marquee", visible: true },
        { key: "statement", label: "Scroll statement", visible: true },
        { key: "services", label: "Services", visible: true },
        { key: "stats", label: "Numbers", visible: true },
        { key: "process", label: "How it works", visible: true },
        { key: "doctors", label: "Doctors", visible: true },
        { key: "packages", label: "Health packages", visible: true },
        { key: "testimonials", label: "Testimonials", visible: true },
        { key: "blog", label: "Journal", visible: true },
        { key: "faq", label: "FAQ", visible: true },
        { key: "cta", label: "Final call-to-action", visible: true },
      ],
      hero: {
        eyebrow: "Multi-specialty clinic · Koramangala",
        titleLine1: "Care that",
        titleAccent: "listens",
        titleLine2: "before it treats.",
        subtitle:
          "Twelve specialties, one calm place. Same-day appointments with doctors who have the time to actually hear you.",
        image: IMAGES.reception,
        primaryCta: { label: "Book an appointment", href: "/book" },
        secondaryCta: { label: "Explore services", href: "/services" },
        rating: "4.9",
        ratingLabel: "from 3,200+ Google reviews",
      },
      marquee: ["Cardiology", "Dental Studio", "Pediatrics", "Neurology", "Dermatology", "Physiotherapy", "Diagnostics", "Mental Wellness", "Family Medicine"],
      statement:
        "We built Solace around a simple idea: the most advanced thing a clinic can offer is time. Time to listen, time to explain, and time to get it right — the first time.",
      stats: [
        { value: 48000, suffix: "+", label: "Patients cared for" },
        { value: 24, suffix: "", label: "Specialist doctors" },
        { value: 12, suffix: "", label: "Medical specialties" },
        { value: 98, suffix: "%", label: "Would recommend us" },
      ],
      process: [
        { title: "Book in 30 seconds", text: "Pick a specialty, a doctor and a slot that suits you — online, on WhatsApp or by phone.", image: IMAGES.screens },
        { title: "Arrive to no queue", text: "Check in with a QR code. Average waiting time at Solace is under 7 minutes.", image: IMAGES.reception },
        { title: "A real conversation", text: "Consultations are scheduled long enough to listen properly, examine carefully and explain clearly.", image: IMAGES.consult },
        { title: "Care that follows up", text: "Digital prescriptions, reports on your phone and a care team that checks in after your visit.", image: IMAGES.hands },
      ],
      cta: {
        title: "Feel better, sooner.",
        subtitle: "Same-day appointments across every specialty. Most visits start on time.",
        image: IMAGES.stethoscopeWhite,
      },
    },
    about: {
      title: "A clinic designed around people, not paperwork.",
      intro:
        "Solace opened in 2014 with four doctors and one belief: that healthcare should feel calm, clear and kind. A decade later we're 24 specialists strong — and still booking longer appointments than anyone else in the city.",
      story:
        "Every detail of Solace — from our sunlit waiting lounge to our 7-minute average wait — is designed to remove the anxiety from visiting a doctor. We invest in technology so our doctors can spend less time on screens and more time with you. We publish our prices. We call you back. And we never rush a consultation.",
      image: IMAGES.ward,
      gallery: [IMAGES.reception, IMAGES.dentalRoom, IMAGES.lab, IMAGES.screens2],
      values: [
        { title: "Time is treatment", text: "Appointments are 20–50 minutes long, because good medicine starts with listening." },
        { title: "Radically transparent", text: "Prices are published. Reports are explained. Options are laid out honestly." },
        { title: "Evidence first", text: "Every protocol we follow is grounded in current clinical guidelines — never trends." },
        { title: "Care continues", text: "A dedicated care team follows up after every visit, so nothing falls through the cracks." },
      ],
      milestones: [
        { year: "2014", text: "Opened in Koramangala with four doctors" },
        { year: "2017", text: "NABL-accredited diagnostic lab launched" },
        { year: "2019", text: "Dental studio and physiotherapy wing open" },
        { year: "2021", text: "Video consultations across all specialties" },
        { year: "2024", text: "NABH accreditation & 40,000th patient" },
      ],
      accreditations: ["NABH Accredited", "NABL Certified Lab", "ISO 9001:2015", "Green OT Certified"],
    },
    services,
    doctors,
    testimonials: [
      { id: "t1", name: "Ritika Sharma", role: "Patient, Cardiology", quote: "Dr. Mehta spent forty minutes explaining my father's reports with drawings. We walked out calmer than we walked in. That never happens.", image: IMAGES.p1, rating: 5, visible: true },
      { id: "t2", name: "Aditya Nair", role: "Patient, Orthopedics", quote: "Tore my ACL playing football. Six months of rehab with the Solace physio team and I'm back on the pitch. They genuinely cared.", image: IMAGES.p2, rating: 5, visible: true },
      { id: "t3", name: "Sneha Patel", role: "Parent, Pediatrics", quote: "My daughter actually looks forward to her check-ups. The pediatric room is lovely and Dr. Kapoor is endlessly patient.", image: IMAGES.p3, rating: 5, visible: true },
      { id: "t4", name: "Karan Malhotra", role: "Patient, Dental", quote: "I've avoided dentists for a decade. Dr. Khan made aligners feel effortless and the pricing was exactly what was quoted.", image: IMAGES.p4, rating: 5, visible: true },
      { id: "t5", name: "Isha Menon", role: "Patient, General Medicine", quote: "Booked at 9am, seen at 11am, reports on my phone by evening. This is what healthcare should feel like.", image: IMAGES.p5, rating: 5, visible: true },
      { id: "t6", name: "Ramesh Kulkarni", role: "Patient, Neurology", quote: "Years of migraines and finally a doctor who looked at the whole picture. My episodes have dropped by more than half.", image: IMAGES.p6, rating: 5, visible: true },
    ],
    faqs: [
      { id: "f1", question: "Do I need an appointment, or can I walk in?", answer: "Walk-ins are always welcome for general medicine, but booking online guarantees your slot and usually means zero waiting.", category: "Appointments", order: 1 },
      { id: "f2", question: "Which insurance providers do you accept?", answer: "We offer cashless treatment with 30+ insurers including Star Health, HDFC Ergo, ICICI Lombard, Niva Bupa and Care Health. Our front desk handles all paperwork.", category: "Billing", order: 2 },
      { id: "f3", question: "Can I consult a doctor by video?", answer: "Yes. Every specialty offers video consultations. Choose 'Video' while booking and you'll receive a secure link by SMS and email.", category: "Appointments", order: 3 },
      { id: "f4", question: "How quickly will I get my lab reports?", answer: "Most routine reports arrive on your phone within 6 hours. Specialised tests may take 24–48 hours.", category: "Diagnostics", order: 4 },
      { id: "f5", question: "Is parking available?", answer: "Yes — free valet parking for all patients, plus a dedicated drop-off bay for seniors and wheelchair users.", category: "Visiting", order: 5 },
      { id: "f6", question: "What should I bring to my first visit?", answer: "A photo ID, any previous prescriptions or reports, and a list of current medicines. If you're insured, bring your policy card too.", category: "Visiting", order: 6 },
      { id: "f7", question: "How do I reschedule or cancel?", answer: "Use the link in your confirmation message, call us, or message us on WhatsApp. There's no fee for changes made 4+ hours in advance.", category: "Appointments", order: 7 },
    ],
    packages: [
      { id: "pk1", name: "Essential", price: 1999, compareAt: 2999, tagline: "A smart annual baseline for adults under 35.", features: ["Complete blood count", "Blood sugar (fasting)", "Lipid profile", "Thyroid (TSH)", "Physician consultation"], highlighted: false, order: 1 },
      { id: "pk2", name: "Complete", price: 4999, compareAt: 7499, tagline: "Our most-booked full-body checkup.", features: ["Everything in Essential", "Liver & kidney panels", "HbA1c & Vitamin D/B12", "ECG + chest X-ray", "Dietitian session", "Doctor review of all reports"], highlighted: true, order: 2 },
      { id: "pk3", name: "Executive", price: 9999, compareAt: 14999, tagline: "Deep preventive screening for 40+.", features: ["Everything in Complete", "2D Echo + TMT", "Ultrasound abdomen", "Cancer markers", "Cardiology & physician consult", "Priority lounge access"], highlighted: false, order: 3 },
    ],
    posts: [
      {
        id: "post1",
        slug: "how-to-read-your-lipid-profile",
        title: "How to actually read your lipid profile",
        excerpt: "LDL, HDL, triglycerides — what the numbers mean, which ones matter most, and when to worry.",
        content:
          "Your lipid profile is one of the most useful — and most misunderstood — tests you'll ever take.\n\n## The four numbers\n\n- **LDL** is the cholesterol that builds up in arteries. Lower is better.\n- **HDL** helps clear cholesterol. Higher is protective.\n- **Triglycerides** reflect recent diet and metabolic health.\n- **Total cholesterol** is the sum — and by itself, not that useful.\n\n## What matters most\n\nFor most people, LDL is the number to watch. But context matters: your age, blood pressure, sugar levels and family history all change what a 'good' LDL is for you.\n\n## When to see a doctor\n\nIf your LDL is above 160 mg/dL, or if you have diabetes or a family history of early heart disease, book a preventive heart check. It takes 45 minutes and could add decades.",
        cover: IMAGES.bp,
        category: "Heart health",
        author: "Dr. Arjun Mehta",
        readMinutes: 5,
        published: true,
        publishedAt: iso(addDays(-6)),
      },
      {
        id: "post2",
        slug: "migraine-or-headache",
        title: "Migraine or just a headache? Here's how to tell",
        excerpt: "Not every headache is a migraine. A neurologist explains the signs, triggers and when it's time to get help.",
        content:
          "Almost everyone gets headaches. But migraines are a different condition entirely — a neurological event, not just a bad headache.\n\n## The tell-tale signs\n\n- Throbbing pain, often on one side\n- Sensitivity to light and sound\n- Nausea\n- Visual 'aura' before the pain starts\n\n## Common triggers\n\nSleep changes, skipped meals, dehydration, stress and hormonal shifts are the usual suspects. A simple headache diary for two weeks often reveals a pattern.\n\n## Getting help\n\nIf headaches affect your work or happen more than four days a month, it's worth seeing a neurologist. Modern preventive treatments are remarkably effective.",
        cover: IMAGES.brain,
        category: "Neurology",
        author: "Dr. Kabir Rao",
        readMinutes: 4,
        published: true,
        publishedAt: iso(addDays(-14)),
      },
      {
        id: "post3",
        slug: "aligners-vs-braces",
        title: "Clear aligners vs braces: an honest comparison",
        excerpt: "Cost, comfort, speed and results. What an orthodontist would tell a friend.",
        content:
          "Clear aligners have become hugely popular — but they aren't right for everyone.\n\n## Where aligners shine\n\n- Nearly invisible\n- Removable for meals and brushing\n- Fewer clinic visits\n\n## Where braces still win\n\n- Complex rotations and bite corrections\n- No discipline required — they work 24/7\n- Often more affordable\n\n## The bottom line\n\nA digital scan and a 30-minute consultation will tell you which option suits your teeth. We show you a 3D preview of the result before you commit.",
        cover: IMAGES.dental,
        category: "Dental",
        author: "Dr. Aisha Khan",
        readMinutes: 6,
        published: true,
        publishedAt: iso(addDays(-25)),
      },
      {
        id: "post4",
        slug: "monsoon-health-checklist",
        title: "Your monsoon health checklist",
        excerpt: "Five simple habits that keep the season's most common infections away.",
        content:
          "The monsoon brings relief from the heat — and a spike in infections.\n\n## Five habits that help\n\n- Drink boiled or filtered water only\n- Keep feet dry; change wet socks immediately\n- Use mosquito repellent at dawn and dusk\n- Avoid street food that isn't freshly cooked\n- Get your flu shot if you're 50+ or have a chronic condition\n\n## When to see a doctor\n\nFever lasting more than two days, rashes, or severe body aches deserve a check-up — early testing for dengue and malaria makes treatment much simpler.",
        cover: IMAGES.hands,
        category: "Wellness",
        author: "Dr. Meera Iyer",
        readMinutes: 3,
        published: true,
        publishedAt: iso(addDays(-40)),
      },
    ],
    insurers: ["Star Health", "HDFC Ergo", "ICICI Lombard", "Niva Bupa", "Care Health", "Aditya Birla", "Tata AIG", "Bajaj Allianz"].map((name, i) => ({ id: `ins-${i}`, name })),
    appointments,
    patients,
    leads,
    subscribers: [
      { id: "sub1", email: "ananya.s@gmail.com", createdAt: iso(addDays(-3)) },
      { id: "sub2", email: "rohan.p@yahoo.com", createdAt: iso(addDays(-9)) },
      { id: "sub3", email: "priya.reddy@outlook.com", createdAt: iso(addDays(-15)) },
    ],
  };
}
