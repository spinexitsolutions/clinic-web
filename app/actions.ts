"use server";

import { readDb, mutate } from "@/lib/db";
import { bookingRef, buildSlots, uid } from "@/lib/utils";
import type { Appointment, Patient } from "@/lib/types";

export type ActionResult<T = undefined> = { ok: true; data?: T; message?: string } | { ok: false; error: string };

const str = (v: unknown, max = 500) => String(v ?? "").trim().slice(0, max);
const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
const isPhone = (s: string) => s.replace(/\D/g, "").length >= 10;

/** Available HH:mm slots for a doctor on a given date (YYYY-MM-DD). */
export async function getAvailableSlots(doctorId: string, date: string): Promise<string[]> {
  const db = await readDb();
  const doc = db.doctors.find((d) => d.id === doctorId);
  if (!doc || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return [];
  const d = new Date(date + "T00:00:00");
  if (!doc.availability.days.includes(d.getDay())) return [];
  const taken = new Set(
    db.appointments
      .filter((a) => a.doctorId === doctorId && a.date === date && a.status !== "cancelled")
      .map((a) => a.time),
  );
  let slots = buildSlots(doc.availability.start, doc.availability.end, doc.availability.slotMinutes).filter((s) => !taken.has(s));
  // hide past slots for today
  const now = new Date();
  const todayIso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  if (date === todayIso) {
    const mins = now.getHours() * 60 + now.getMinutes() + 30;
    slots = slots.filter((s) => {
      const [h, m] = s.split(":").map(Number);
      return h * 60 + m > mins;
    });
  }
  if (date < todayIso) return [];
  return slots;
}

export async function bookAppointment(input: {
  serviceId: string;
  doctorId: string;
  date: string;
  time: string;
  type: "in-clinic" | "video";
  name: string;
  phone: string;
  email: string;
  notes: string;
}): Promise<ActionResult<{ ref: string }>> {
  const name = str(input.name, 80);
  const phone = str(input.phone, 20);
  const email = str(input.email, 120).toLowerCase();
  const notes = str(input.notes, 1000);
  if (name.length < 2) return { ok: false, error: "Please enter your full name." };
  if (!isPhone(phone)) return { ok: false, error: "Please enter a valid phone number." };
  if (email && !isEmail(email)) return { ok: false, error: "That email doesn't look right." };

  const slots = await getAvailableSlots(input.doctorId, input.date);
  if (!slots.includes(input.time)) return { ok: false, error: "That slot was just taken — please pick another time." };

  return mutate((db) => {
    const doctor = db.doctors.find((d) => d.id === input.doctorId);
    const service = db.services.find((s) => s.id === input.serviceId);
    if (!doctor || !service) return { ok: false as const, error: "Please choose a service and doctor." };

    const digits = phone.replace(/\D/g, "").slice(-10);
    let patient = db.patients.find((p) => p.phone.replace(/\D/g, "").slice(-10) === digits);
    if (!patient) {
      patient = {
        id: uid("pat-"),
        name,
        phone,
        email,
        gender: "",
        dob: "",
        bloodGroup: "",
        tags: ["New"],
        notes: "",
        createdAt: new Date().toISOString(),
      } satisfies Patient;
      db.patients.unshift(patient);
    } else if (email && !patient.email) {
      patient.email = email;
    }

    let ref = bookingRef();
    while (db.appointments.some((a) => a.ref === ref)) ref = bookingRef();
    const appt: Appointment = {
      id: uid("apt-"),
      ref,
      patientId: patient.id,
      name,
      phone,
      email,
      serviceId: service.id,
      doctorId: doctor.id,
      date: input.date,
      time: input.time,
      type: input.type === "video" ? "video" : "in-clinic",
      notes,
      status: "pending",
      source: "website",
      fee: doctor.fee,
      createdAt: new Date().toISOString(),
      internalNotes: "",
    };
    db.appointments.push(appt);
    return { ok: true as const, data: { ref } };
  });
}

export async function submitInquiry(formData: FormData): Promise<ActionResult> {
  const name = str(formData.get("name"), 80);
  const phone = str(formData.get("phone"), 20);
  const email = str(formData.get("email"), 120).toLowerCase();
  const subject = str(formData.get("subject"), 140) || "General enquiry";
  const message = str(formData.get("message"), 2000);
  const kind = str(formData.get("kind"), 20);
  if (str(formData.get("company"))) return { ok: true }; // honeypot
  if (name.length < 2) return { ok: false, error: "Please tell us your name." };
  if (!isPhone(phone) && !isEmail(email)) return { ok: false, error: "Add a phone number or email so we can reach you." };

  await mutate((db) => {
    const now = new Date().toISOString();
    db.leads.unshift({
      id: uid("lead-"),
      name,
      phone,
      email,
      subject,
      message,
      source: kind === "callback" ? "callback" : "contact-form",
      stage: "new",
      value: 0,
      assignee: "",
      activity: [{ at: now, text: kind === "callback" ? "Callback requested on website" : "Contact form submitted" }],
      createdAt: now,
    });
  });
  return { ok: true, message: "Thank you — our care team will reach out within 2 working hours." };
}

export async function subscribe(formData: FormData): Promise<ActionResult> {
  const email = str(formData.get("email"), 120).toLowerCase();
  if (!isEmail(email)) return { ok: false, error: "Enter a valid email." };
  await mutate((db) => {
    if (!db.subscribers.some((s) => s.email === email)) {
      db.subscribers.unshift({ id: uid("sub-"), email, createdAt: new Date().toISOString() });
    }
  });
  return { ok: true, message: "You're in. Expect one thoughtful email a month." };
}

export async function trackAppointment(
  ref: string,
  phone: string,
): Promise<ActionResult<{ ref: string; status: string; date: string; time: string; doctor: string; service: string; type: string; name: string }>> {
  const db = await readDb();
  const r = str(ref, 20).toUpperCase();
  const digits = str(phone, 20).replace(/\D/g, "").slice(-10);
  const a = db.appointments.find((x) => x.ref.toUpperCase() === r && x.phone.replace(/\D/g, "").slice(-10) === digits);
  if (!a) return { ok: false, error: "We couldn't find a booking with that reference and phone number." };
  return {
    ok: true,
    data: {
      ref: a.ref,
      status: a.status,
      date: a.date,
      time: a.time,
      type: a.type,
      name: a.name,
      doctor: db.doctors.find((d) => d.id === a.doctorId)?.name ?? "—",
      service: db.services.find((s) => s.id === a.serviceId)?.name ?? "—",
    },
  };
}

export async function cancelAppointment(ref: string, phone: string): Promise<ActionResult> {
  const digits = str(phone, 20).replace(/\D/g, "").slice(-10);
  return mutate((db) => {
    const a = db.appointments.find((x) => x.ref.toUpperCase() === str(ref, 20).toUpperCase() && x.phone.replace(/\D/g, "").slice(-10) === digits);
    if (!a) return { ok: false as const, error: "Booking not found." };
    if (a.status === "completed") return { ok: false as const, error: "This visit is already completed." };
    a.status = "cancelled";
    a.internalNotes = `${a.internalNotes}\nCancelled by patient online on ${new Date().toLocaleString("en-IN")}`.trim();
    return { ok: true as const, message: "Your appointment has been cancelled." };
  });
}
