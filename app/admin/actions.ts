"use server";

import { DEFAULT_LABELS } from "@/lib/labels";
import { promises as fs } from "fs";
import path from "path";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { mutate, resetDb, UPLOAD_DIR } from "@/lib/db";
import { checkCredentials, createSession, destroySession, requireAdmin } from "@/lib/auth";
import { bookingRef, slugify, uid } from "@/lib/utils";
import type {
  AboutContent,
  Appearance,
  Appointment,
  AppointmentStatus,
  CollectionKey,

  HomeContent,
  Lead,
  LeadStage,
  Patient,
  SiteSettings,
} from "@/lib/types";

export type AdminResult = { ok: true; message?: string; id?: string } | { ok: false; error: string };

const HEX = /^#[0-9a-f]{3,8}$/i;
const COLLECTIONS: CollectionKey[] = ["services", "doctors", "testimonials", "faqs", "packages", "posts", "insurers"];
const STATUSES: AppointmentStatus[] = ["pending", "confirmed", "completed", "cancelled", "no-show"];
const STAGES: LeadStage[] = ["new", "contacted", "qualified", "converted", "lost"];

function done(message = "Saved"): AdminResult {
  revalidatePath("/", "layout");
  return { ok: true, message };
}

const s = (v: unknown, max = 5000) => String(v ?? "").trim().slice(0, max);

// ── Auth ────────────────────────────────────────────────────

export async function loginAction(_: unknown, formData: FormData): Promise<{ error?: string }> {
  const email = s(formData.get("email"), 200);
  const password = String(formData.get("password") ?? "");
  if (!checkCredentials(email, password)) {
    await new Promise((r) => setTimeout(r, 400));
    return { error: "Those credentials don't match. Try again." };
  }
  await createSession(email);
  const next = s(formData.get("next"), 200);
  redirect(next.startsWith("/admin") ? next : "/admin");
}

export async function logoutAction() {
  await destroySession();
  redirect("/admin/login");
}

// ── CMS: singletons ─────────────────────────────────────────

export async function saveSettings(settings: SiteSettings): Promise<AdminResult> {
  await requireAdmin();
  await mutate((db) => {
    db.settings = { ...db.settings, ...settings, whatsapp: s(settings.whatsapp, 20).replace(/\D/g, "") };
  });
  return done("Site settings saved");
}

export async function saveAppearance(appearance: Appearance): Promise<AdminResult> {
  await requireAdmin();
  for (const k of ["accent", "accentInk", "highlight", "background", "ink"] as const) {
    if (!HEX.test(appearance[k])) return { ok: false, error: `“${k}” must be a hex colour like #0E7C66` };
  }
  await mutate((db) => {
    db.appearance = {
      ...db.appearance,
      ...appearance,
      radius: Math.max(0, Math.min(48, Math.round(Number(appearance.radius) || 0))),
      intro: {
        ...appearance.intro,
        durationMs: Math.max(800, Math.min(8000, Number(appearance.intro.durationMs) || 2600)),
        style: (["pulse", "letters", "curtain"] as const).includes(appearance.intro.style) ? appearance.intro.style : "pulse",
      },
    };
  });
  return done("Appearance updated");
}

export async function saveNavigation(nav: Appearance["nav"], navCta: Appearance["navCta"], mega?: Appearance["mega"]): Promise<AdminResult> {
  await requireAdmin();
  await mutate((db) => {
    db.appearance.nav = nav
      .filter((n) => n.label.trim())
      .map((n) => ({ id: n.id || uid("n"), label: s(n.label, 40), href: s(n.href, 200) || "/", visible: !!n.visible }));
    db.appearance.navCta = { label: s(navCta.label, 40), href: s(navCta.href, 200) || "/book" };
    if (mega) {
      db.appearance.mega = {
        servicesBadge: s(mega.servicesBadge, 40),
        servicesTitle: s(mega.servicesTitle, 80),
        servicesText: s(mega.servicesText, 200),
        servicesHref: s(mega.servicesHref, 200) || "/book",
        servicesLink: s(mega.servicesLink, 30) || "View all",
        doctorsTitle: s(mega.doctorsTitle, 80),
        doctorsText: s(mega.doctorsText, 200),
        doctorsLink: s(mega.doctorsLink, 30) || "All doctors",
      };
    }
  });
  return done("Navigation saved");
}

export async function saveHome(home: HomeContent): Promise<AdminResult> {
  await requireAdmin();
  await mutate((db) => {
    db.home = {
      ...home,
      stats: home.stats.map((st) => ({ ...st, value: Number(st.value) || 0 })),
      marquee: home.marquee.filter(Boolean),
      labels: Object.fromEntries(
        (Object.keys(DEFAULT_LABELS) as (keyof typeof DEFAULT_LABELS)[]).map((k) => [k, s(home.labels?.[k] ?? DEFAULT_LABELS[k], 300) || DEFAULT_LABELS[k]]),
      ) as HomeContent["labels"],
      proof: {
        ...home.proof,
        waitMinutes: Math.max(0, Number(home.proof.waitMinutes) || 0),
        cityAvgWait: Math.max(1, Number(home.proof.cityAvgWait) || 1),
        ratingBreakdown: [0, 1, 2, 3, 4].map((i) => Math.max(0, Math.min(100, Number(home.proof.ratingBreakdown?.[i]) || 0))),
        principles: (home.proof.principles ?? []).filter((p) => p.value || p.label),
        packageSteps: (home.proof.packageSteps ?? []).filter((p) => p.title || p.text).slice(0, 3),
      },
    };
  });
  return done("Homepage saved");
}

export async function saveAbout(about: AboutContent): Promise<AdminResult> {
  await requireAdmin();
  await mutate((db) => {
    db.about = about;
  });
  return done("About page saved");
}

export async function resetDemoData(): Promise<AdminResult> {
  await requireAdmin();
  await resetDb();
  return done("Demo data restored");
}

// ── CMS: collections ────────────────────────────────────────

type AnyItem = Record<string, unknown> & { id?: string };

export async function saveCollectionItem(collection: CollectionKey, item: AnyItem): Promise<AdminResult> {
  await requireAdmin();
  if (!COLLECTIONS.includes(collection)) return { ok: false, error: "Unknown collection" };
  const label = s(item.name ?? item.title ?? item.question, 200);
  if (!label) return { ok: false, error: "Please fill in the name / title first." };

  const id = await mutate((db) => {
    const list = db[collection] as unknown as AnyItem[];
    const clean: AnyItem = { ...item };
    if ("slug" in clean || collection === "services" || collection === "doctors" || collection === "posts") {
      let slug = slugify(s(clean.slug) || label) || uid();
      while (list.some((x) => x.slug === slug && x.id !== clean.id)) slug = `${slug}-${Math.floor(Math.random() * 90 + 10)}`;
      clean.slug = slug;
    }
    for (const k of ["priceFrom", "duration", "experience", "fee", "rating", "price", "compareAt", "readMinutes", "order"]) {
      if (k in clean) clean[k] = Number(clean[k]) || 0;
    }
    const idx = clean.id ? list.findIndex((x) => x.id === clean.id) : -1;
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...clean };
      return clean.id as string;
    }
    clean.id = uid(collection.slice(0, 3) + "-");
    if ("order" in clean || list.some((x) => "order" in x)) {
      clean.order = list.reduce((m, x) => Math.max(m, Number(x.order) || 0), 0) + 1;
    }
    list.push(clean);
    return clean.id as string;
  });
  revalidatePath("/", "layout");
  return { ok: true, message: "Saved", id };
}

export async function deleteCollectionItem(collection: CollectionKey, id: string): Promise<AdminResult> {
  await requireAdmin();
  if (!COLLECTIONS.includes(collection)) return { ok: false, error: "Unknown collection" };
  await mutate((db) => {
    (db as unknown as Record<string, AnyItem[]>)[collection] = (db[collection] as unknown as AnyItem[]).filter((x) => x.id !== id);
  });
  return done("Deleted");
}

export async function reorderCollection(collection: CollectionKey, ids: string[]): Promise<AdminResult> {
  await requireAdmin();
  if (!COLLECTIONS.includes(collection)) return { ok: false, error: "Unknown collection" };
  await mutate((db) => {
    const list = db[collection] as unknown as AnyItem[];
    ids.forEach((id, i) => {
      const it = list.find((x) => x.id === id);
      if (it) it.order = i + 1;
    });
    const pos = new Map(ids.map((id, i) => [id, i]));
    list.sort((a, b) => (pos.get(a.id as string) ?? 999) - (pos.get(b.id as string) ?? 999));
  });
  return done("Order updated");
}

// ── CRM: appointments ───────────────────────────────────────

export async function setAppointmentStatus(id: string, status: AppointmentStatus): Promise<AdminResult> {
  await requireAdmin();
  if (!STATUSES.includes(status)) return { ok: false, error: "Invalid status" };
  await mutate((db) => {
    const a = db.appointments.find((x) => x.id === id);
    if (a) a.status = status;
  });
  return done(`Marked ${status}`);
}

export async function updateAppointment(id: string, patch: Partial<Appointment>): Promise<AdminResult> {
  await requireAdmin();
  await mutate((db) => {
    const a = db.appointments.find((x) => x.id === id);
    if (!a) return;
    const allowed: (keyof Appointment)[] = ["date", "time", "doctorId", "serviceId", "type", "notes", "internalNotes", "status", "fee"];
    for (const k of allowed) if (k in patch) (a as unknown as Record<string, unknown>)[k] = patch[k];
    a.fee = Number(a.fee) || 0;
  });
  return done("Appointment updated");
}

export async function deleteAppointment(id: string): Promise<AdminResult> {
  await requireAdmin();
  await mutate((db) => {
    db.appointments = db.appointments.filter((x) => x.id !== id);
  });
  return done("Appointment deleted");
}

export async function createAppointment(input: {
  patientId: string;
  name: string;
  phone: string;
  email: string;
  serviceId: string;
  doctorId: string;
  date: string;
  time: string;
  type: "in-clinic" | "video";
  notes: string;
  status: AppointmentStatus;
  source: Appointment["source"];
}): Promise<AdminResult> {
  await requireAdmin();
  if (!input.doctorId || !input.serviceId) return { ok: false, error: "Choose a doctor and service." };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date) || !/^\d{2}:\d{2}$/.test(input.time)) return { ok: false, error: "Pick a date and time." };
  return mutate((db) => {
    let patient = db.patients.find((p) => p.id === input.patientId);
    if (!patient) {
      if (s(input.name).length < 2 || s(input.phone).replace(/\D/g, "").length < 10)
        return { ok: false as const, error: "Enter the new patient's name and phone." };
      patient = {
        id: uid("pat-"),
        name: s(input.name, 80),
        phone: s(input.phone, 20),
        email: s(input.email, 120),
        gender: "",
        dob: "",
        bloodGroup: "",
        tags: [],
        notes: "",
        createdAt: new Date().toISOString(),
      };
      db.patients.unshift(patient);
    }
    const doctor = db.doctors.find((d) => d.id === input.doctorId);
    let ref = bookingRef();
    while (db.appointments.some((a) => a.ref === ref)) ref = bookingRef();
    db.appointments.push({
      id: uid("apt-"),
      ref,
      patientId: patient.id,
      name: patient.name,
      phone: patient.phone,
      email: patient.email,
      serviceId: input.serviceId,
      doctorId: input.doctorId,
      date: input.date,
      time: input.time,
      type: input.type,
      notes: s(input.notes, 1000),
      status: STATUSES.includes(input.status) ? input.status : "confirmed",
      source: input.source || "admin",
      fee: doctor?.fee ?? 0,
      createdAt: new Date().toISOString(),
      internalNotes: "",
    });
    revalidatePath("/", "layout");
    return { ok: true as const, message: `Booked · ${ref}` };
  });
}

// ── CRM: patients ───────────────────────────────────────────

export async function savePatient(p: Partial<Patient> & { name: string; phone: string }): Promise<AdminResult> {
  await requireAdmin();
  if (s(p.name).length < 2) return { ok: false, error: "Name is required." };
  const id = await mutate((db) => {
    const existing = p.id ? db.patients.find((x) => x.id === p.id) : undefined;
    const clean: Patient = {
      id: existing?.id ?? uid("pat-"),
      name: s(p.name, 80),
      phone: s(p.phone, 20),
      email: s(p.email, 120),
      gender: (p.gender ?? "") as Patient["gender"],
      dob: s(p.dob, 10),
      bloodGroup: s(p.bloodGroup, 4),
      tags: (p.tags ?? []).map((t) => s(t, 30)).filter(Boolean),
      notes: s(p.notes, 5000),
      createdAt: existing?.createdAt ?? new Date().toISOString(),
    };
    if (existing) {
      Object.assign(existing, clean);
      db.appointments.forEach((a) => {
        if (a.patientId === existing.id) {
          a.name = clean.name;
          a.phone = clean.phone;
          a.email = clean.email;
        }
      });
    } else db.patients.unshift(clean);
    return clean.id;
  });
  revalidatePath("/", "layout");
  return { ok: true, message: "Patient saved", id };
}

export async function deletePatient(id: string): Promise<AdminResult> {
  await requireAdmin();
  await mutate((db) => {
    db.patients = db.patients.filter((x) => x.id !== id);
  });
  return done("Patient removed");
}

// ── CRM: leads ──────────────────────────────────────────────

export async function moveLead(id: string, stage: LeadStage): Promise<AdminResult> {
  await requireAdmin();
  if (!STAGES.includes(stage)) return { ok: false, error: "Invalid stage" };
  await mutate((db) => {
    const l = db.leads.find((x) => x.id === id);
    if (l && l.stage !== stage) {
      l.activity.unshift({ at: new Date().toISOString(), text: `Moved from ${l.stage} to ${stage}` });
      l.stage = stage;
    }
  });
  return done(`Moved to ${stage}`);
}

export async function updateLead(id: string, patch: Partial<Pick<Lead, "value" | "assignee" | "subject" | "name" | "phone" | "email">>): Promise<AdminResult> {
  await requireAdmin();
  await mutate((db) => {
    const l = db.leads.find((x) => x.id === id);
    if (!l) return;
    if (patch.value !== undefined) l.value = Number(patch.value) || 0;
    for (const k of ["assignee", "subject", "name", "phone", "email"] as const) if (patch[k] !== undefined) l[k] = s(patch[k], 200);
  });
  return done("Lead updated");
}

export async function addLeadNote(id: string, text: string): Promise<AdminResult> {
  await requireAdmin();
  if (!s(text)) return { ok: false, error: "Write a note first." };
  await mutate((db) => {
    db.leads.find((x) => x.id === id)?.activity.unshift({ at: new Date().toISOString(), text: s(text, 1000) });
  });
  return done("Note added");
}

export async function createLead(input: { name: string; phone: string; email: string; subject: string; value: number }): Promise<AdminResult> {
  await requireAdmin();
  if (s(input.name).length < 2) return { ok: false, error: "Name is required." };
  await mutate((db) => {
    const now = new Date().toISOString();
    db.leads.unshift({
      id: uid("lead-"),
      name: s(input.name, 80),
      phone: s(input.phone, 20),
      email: s(input.email, 120),
      subject: s(input.subject, 140) || "New enquiry",
      message: "",
      source: "admin",
      stage: "new",
      value: Number(input.value) || 0,
      assignee: "",
      activity: [{ at: now, text: "Lead added manually" }],
      createdAt: now,
    });
  });
  return done("Lead created");
}

export async function deleteLead(id: string): Promise<AdminResult> {
  await requireAdmin();
  await mutate((db) => {
    db.leads = db.leads.filter((x) => x.id !== id);
  });
  return done("Lead deleted");
}

export async function convertLeadToPatient(id: string): Promise<AdminResult> {
  await requireAdmin();
  const res = await mutate((db) => {
    const l = db.leads.find((x) => x.id === id);
    if (!l) return null;
    const digits = l.phone.replace(/\D/g, "").slice(-10);
    let p = digits ? db.patients.find((x) => x.phone.replace(/\D/g, "").slice(-10) === digits) : undefined;
    if (!p) {
      p = { id: uid("pat-"), name: l.name, phone: l.phone, email: l.email, gender: "", dob: "", bloodGroup: "", tags: ["From lead"], notes: l.message, createdAt: new Date().toISOString() };
      db.patients.unshift(p);
    }
    l.stage = "converted";
    l.activity.unshift({ at: new Date().toISOString(), text: `Converted to patient ${p.name}` });
    return p.id;
  });
  if (!res) return { ok: false, error: "Lead not found" };
  revalidatePath("/", "layout");
  return { ok: true, message: "Converted to patient", id: res };
}

// ── Subscribers ─────────────────────────────────────────────

export async function deleteSubscriber(id: string): Promise<AdminResult> {
  await requireAdmin();
  await mutate((db) => {
    db.subscribers = db.subscribers.filter((x) => x.id !== id);
  });
  return done("Subscriber removed");
}

// ── Media ───────────────────────────────────────────────────

export async function deleteMedia(name: string): Promise<AdminResult> {
  await requireAdmin();
  const safe = path.basename(name);
  try {
    await fs.unlink(path.join(UPLOAD_DIR, safe));
  } catch {
    return { ok: false, error: "File not found" };
  }
  revalidatePath("/admin/media");
  return { ok: true, message: "File deleted" };
}

