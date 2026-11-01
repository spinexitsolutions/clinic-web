"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, Download, Phone, Plus, Search, Trash2, Video } from "lucide-react";
import type { Appointment, AppointmentStatus, Doctor, Patient, Service } from "@/lib/types";
import { createAppointment, deleteAppointment, setAppointmentStatus, updateAppointment } from "@/app/admin/actions";
import { cn, formatDate, money, timeLabel, toISODate } from "@/lib/utils";
import { Avatar, Badge, ConfirmButton, Drawer, Empty, PageHeader, Segmented, Spinner, useAction } from "./ui";
import { Label } from "./fields";

const STATUSES: AppointmentStatus[] = ["pending", "confirmed", "completed", "cancelled", "no-show"];

type Range = "all" | "today" | "upcoming" | "past";

export function AppointmentsBoard({
  appointments,
  doctors,
  services,
  patients,
  currency,
  initial,
}: {
  appointments: Appointment[];
  doctors: Doctor[];
  services: Service[];
  patients: Patient[];
  currency: string;
  initial: { status?: string; range?: string; open?: string; create?: boolean };
}) {
  const router = useRouter();
  const { pending, run } = useAction();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>(initial.status ?? "all");
  const [range, setRange] = useState<Range>((initial.range as Range) ?? "upcoming");
  const [doctor, setDoctor] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [openId, setOpenId] = useState<string | null>(initial.open ?? null);
  const [creating, setCreating] = useState(!!initial.create);

  const today = toISODate(new Date());
  const docName = (id: string) => doctors.find((d) => d.id === id)?.name ?? "—";
  const svcName = (id: string) => services.find((s) => s.id === id)?.name ?? "—";

  const rows = useMemo(() => {
    const s = q.trim().toLowerCase();
    let list = appointments.filter((a) => {
      if (status !== "all" && a.status !== status) return false;
      if (doctor !== "all" && a.doctorId !== doctor) return false;
      if (range === "today" && a.date !== today) return false;
      if (range === "upcoming" && a.date < today) return false;
      if (range === "past" && a.date >= today) return false;
      if (from && a.date < from) return false;
      if (to && a.date > to) return false;
      if (s && !`${a.name} ${a.phone} ${a.email} ${a.ref}`.toLowerCase().includes(s)) return false;
      return true;
    });
    list = list.sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
    if (range === "past" || range === "all") list.reverse();
    return list;
  }, [appointments, q, status, doctor, range, from, to, today]);

  const open = appointments.find((a) => a.id === openId) ?? null;

  const changeStatus = (id: string, s: AppointmentStatus) => run(() => setAppointmentStatus(id, s), () => router.refresh());

  // group by date for nicer scanning
  const groups = useMemo(() => {
    const m = new Map<string, Appointment[]>();
    rows.forEach((r) => m.set(r.date, [...(m.get(r.date) ?? []), r]));
    return [...m.entries()];
  }, [rows]);

  return (
    <div>
      <PageHeader
        eyebrow="CRM"
        title="Appointments"
        description="Every booking from the website, phone and walk-ins — confirm, reschedule and keep notes."
        actions={
          <>
            <a href="/api/admin/export/appointments" className="btn btn-ghost">
              <Download className="size-4" /> Export CSV
            </a>
            <button className="btn btn-primary" onClick={() => setCreating(true)}>
              <Plus className="size-4" /> New booking
            </button>
          </>
        }
      />

      <div className="mb-4 flex flex-col gap-3 xl:flex-row xl:items-center">
        <Segmented<Range>
          value={range}
          onChange={setRange}
          options={[
            { value: "upcoming", label: "Upcoming" },
            { value: "today", label: "Today" },
            { value: "past", label: "Past" },
            { value: "all", label: "All" },
          ]}
        />
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, phone, ref…" className="field h-11 pl-11 text-[15px]" />
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex">
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="field h-11 text-sm sm:w-40">
            <option value="all">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <select value={doctor} onChange={(e) => setDoctor(e.target.value)} className="field h-11 text-sm sm:w-48">
            <option value="all">All doctors</option>
            {doctors.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="field h-11 text-sm sm:w-40" aria-label="From date" />
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="field h-11 text-sm sm:w-40" aria-label="To date" />
        </div>
      </div>

      <p className="eyebrow mb-3">{rows.length} bookings</p>

      {rows.length === 0 ? (
        <Empty title="No appointments match" text="Try a different filter or date range." icon={<CalendarDays className="size-5" />} />
      ) : (
        <div className="space-y-6">
          {groups.map(([date, list]) => (
            <section key={date}>
              <h3 className="mb-2 flex items-center gap-2 px-1 text-sm font-medium">
                {date === today ? <span className="rounded-full bg-accent px-2 py-0.5 text-[11px] text-accent-ink">Today</span> : null}
                {formatDate(date, { weekday: "long", day: "numeric", month: "long" })}
                <span className="font-mono text-[11px] text-muted">· {list.length}</span>
              </h3>
              <div className="overflow-hidden rounded-[22px] bg-white hairline">
                {/* desktop table */}
                <table className="hidden w-full text-sm md:table">
                  <tbody>
                    {list.map((a) => (
                      <tr key={a.id} className="cursor-pointer border-b border-line transition last:border-0 hover:bg-black/[0.015]" onClick={() => setOpenId(a.id)}>
                        <td className="w-24 py-3.5 pl-5 font-medium">{timeLabel(a.time)}</td>
                        <td className="py-3.5">
                          <div className="flex items-center gap-3">
                            <Avatar name={a.name} />
                            <div>
                              <p className="font-medium">{a.name}</p>
                              <p className="text-xs text-muted">{a.phone}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5">
                          <p>{svcName(a.serviceId)}</p>
                          <p className="text-xs text-muted">{docName(a.doctorId)}</p>
                        </td>
                        <td className="py-3.5 text-muted">
                          <span className="inline-flex items-center gap-1.5">
                            {a.type === "video" ? <Video className="size-3.5" /> : null}
                            {a.type === "video" ? "Video" : "In clinic"}
                          </span>
                        </td>
                        <td className="py-3.5 font-mono text-xs text-muted">{a.ref}</td>
                        <td className="py-3.5 pr-5 text-right" onClick={(e) => e.stopPropagation()}>
                          <StatusSelect value={a.status} onChange={(s) => changeStatus(a.id, s)} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {/* mobile cards */}
                <ul className="md:hidden">
                  {list.map((a) => (
                    <li key={a.id} className="flex items-center gap-3 border-b border-line px-4 py-3.5 last:border-0" onClick={() => setOpenId(a.id)}>
                      <div className="w-14 shrink-0">
                        <p className="text-sm font-medium">{timeLabel(a.time)}</p>
                        {a.type === "video" && <Video className="mt-1 size-3.5 text-muted" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">{a.name}</p>
                        <p className="truncate text-xs text-muted">
                          {svcName(a.serviceId)} · {docName(a.doctorId)}
                        </p>
                      </div>
                      <Badge value={a.status} />
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          ))}
        </div>
      )}

      <AppointmentDrawer
        key={open?.id}
        appt={open}
        onClose={() => setOpenId(null)}
        doctors={doctors}
        services={services}
        currency={currency}
        pending={pending}
        onSave={(patch) => run(() => updateAppointment(open!.id, patch), () => router.refresh())}
        onDelete={() =>
          run(
            () => deleteAppointment(open!.id),
            () => {
              setOpenId(null);
              router.refresh();
            },
          )
        }
      />

      <CreateDrawer
        open={creating}
        onClose={() => setCreating(false)}
        doctors={doctors}
        services={services}
        patients={patients}
        onCreated={() => {
          setCreating(false);
          router.refresh();
        }}
      />
    </div>
  );
}

function StatusSelect({ value, onChange }: { value: AppointmentStatus; onChange: (s: AppointmentStatus) => void }) {
  const tone: Record<AppointmentStatus, string> = {
    pending: "bg-amber-50 text-amber-700",
    confirmed: "bg-accent-soft text-accent-deep",
    completed: "bg-zinc-100 text-zinc-700",
    cancelled: "bg-rose-50 text-rose-600",
    "no-show": "bg-orange-50 text-orange-600",
  };
  return (
    <select value={value} onChange={(e) => onChange(e.target.value as AppointmentStatus)} className={cn("h-8 cursor-pointer appearance-none rounded-full px-3 text-xs font-medium capitalize outline-none", tone[value])}>
      {STATUSES.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  );
}

function AppointmentDrawer({
  appt,
  onClose,
  doctors,
  services,
  currency,
  pending,
  onSave,
  onDelete,
}: {
  appt: Appointment | null;
  onClose: () => void;
  doctors: Doctor[];
  services: Service[];
  currency: string;
  pending: boolean;
  onSave: (patch: Partial<Appointment>) => void;
  onDelete: () => void;
}) {
  const [form, setForm] = useState<Appointment | null>(appt);
  if (!appt || !form) return <Drawer open={false} onClose={onClose} title="">{null}</Drawer>;
  const set = <K extends keyof Appointment>(k: K, v: Appointment[K]) => setForm({ ...form, [k]: v });
  return (
    <Drawer
      open
      onClose={onClose}
      title={appt.name}
      subtitle={`${appt.ref} · booked ${formatDate(appt.createdAt)} via ${appt.source}`}
      footer={
        <>
          <ConfirmButton className="btn btn-ghost mr-auto h-11 text-rose-600" confirmLabel="Tap again" onConfirm={onDelete}>
            <Trash2 className="size-4" /> Delete
          </ConfirmButton>
          <button className="btn btn-primary h-11" disabled={pending} onClick={() => onSave(form)}>
            {pending && <Spinner />} Save changes
          </button>
        </>
      }
    >
      <div className="mb-6 flex flex-wrap gap-2">
        <a href={`tel:${appt.phone}`} className="btn btn-ghost h-10 text-sm">
          <Phone className="size-4" /> Call
        </a>
        <a href={`https://wa.me/${appt.phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Hi ${appt.name.split(" ")[0]}, this is regarding your appointment ${appt.ref}.`)}`} target="_blank" className="btn btn-ghost h-10 text-sm">
          WhatsApp
        </a>
        <a href={`/admin/patients/${appt.patientId}`} className="btn btn-ghost h-10 text-sm">
          Patient profile →
        </a>
      </div>

      <Label>Status</Label>
      <div className="mb-6 flex flex-wrap gap-1.5">
        {STATUSES.map((s) => (
          <button key={s} onClick={() => set("status", s)} className={cn("rounded-full px-3.5 py-2 text-sm capitalize transition", form.status === s ? "bg-ink text-bg" : "bg-white text-muted hairline hover:text-ink")}>
            {s}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Date</Label>
          <input type="date" value={form.date} onChange={(e) => set("date", e.target.value)} className="field" />
        </div>
        <div>
          <Label>Time</Label>
          <input type="time" value={form.time} onChange={(e) => set("time", e.target.value)} className="field" />
        </div>
        <div className="col-span-2 sm:col-span-1">
          <Label>Doctor</Label>
          <select value={form.doctorId} onChange={(e) => set("doctorId", e.target.value)} className="field">
            {doctors.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
        <div className="col-span-2 sm:col-span-1">
          <Label>Service</Label>
          <select value={form.serviceId} onChange={(e) => set("serviceId", e.target.value)} className="field">
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label>Visit type</Label>
          <select value={form.type} onChange={(e) => set("type", e.target.value as Appointment["type"])} className="field">
            <option value="in-clinic">In clinic</option>
            <option value="video">Video</option>
          </select>
        </div>
        <div>
          <Label hint={money(form.fee, currency)}>Fee</Label>
          <input type="number" value={form.fee} onChange={(e) => set("fee", Number(e.target.value))} className="field" />
        </div>
        <div className="col-span-2">
          <Label>Patient's note</Label>
          <textarea rows={3} value={form.notes} onChange={(e) => set("notes", e.target.value)} className="field" />
        </div>
        <div className="col-span-2">
          <Label hint="Only visible to staff">Internal notes</Label>
          <textarea rows={4} value={form.internalNotes} onChange={(e) => set("internalNotes", e.target.value)} className="field bg-amber-50/40" placeholder="Allergies, reminders, follow-up instructions…" />
        </div>
      </div>
      <dl className="mt-6 grid grid-cols-2 gap-3 rounded-2xl bg-white p-4 text-sm hairline">
        <dt className="text-muted">Phone</dt>
        <dd className="text-right">{appt.phone}</dd>
        <dt className="text-muted">Email</dt>
        <dd className="truncate text-right">{appt.email || "—"}</dd>
      </dl>
    </Drawer>
  );
}

function CreateDrawer({ open, onClose, doctors, services, patients, onCreated }: { open: boolean; onClose: () => void; doctors: Doctor[]; services: Service[]; patients: Patient[]; onCreated: () => void }) {
  const { pending, run } = useAction();
  const blank = {
    patientId: "",
    name: "",
    phone: "",
    email: "",
    serviceId: services[0]?.id ?? "",
    doctorId: doctors.find((d) => d.serviceIds.includes(services[0]?.id ?? ""))?.id ?? doctors[0]?.id ?? "",
    date: toISODate(new Date()),
    time: "10:00",
    type: "in-clinic" as const,
    notes: "",
    status: "confirmed" as AppointmentStatus,
    source: "phone" as Appointment["source"],
  };
  const [f, setF] = useState<typeof blank & { type: "in-clinic" | "video" }>(blank);
  const [mode, setMode] = useState<"existing" | "new">("existing");
  const [pq, setPq] = useState("");
  const matches = patients.filter((p) => `${p.name} ${p.phone}`.toLowerCase().includes(pq.toLowerCase())).slice(0, 6);
  const set = (k: keyof typeof f, v: string) => setF((x) => ({ ...x, [k]: v }));
  const docs = doctors.filter((d) => d.serviceIds.includes(f.serviceId));

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="New booking"
      subtitle="For phone, walk-in or WhatsApp bookings"
      footer={
        <button
          className="btn btn-primary h-11"
          disabled={pending}
          onClick={() =>
            run(
              () => createAppointment({ ...f, patientId: mode === "existing" ? f.patientId : "" }),
              () => {
                setF(blank);
                onCreated();
              },
            )
          }
        >
          {pending && <Spinner />} Create booking
        </button>
      }
    >
      <div className="mb-4">
        <Segmented
          value={mode}
          onChange={setMode}
          options={[
            { value: "existing", label: "Existing patient" },
            { value: "new", label: "New patient" },
          ]}
        />
      </div>
      {mode === "existing" ? (
        <div className="mb-6">
          <input value={pq} onChange={(e) => setPq(e.target.value)} placeholder="Search patient by name or phone" className="field mb-2" />
          <div className="space-y-1">
            {matches.map((p) => (
              <button key={p.id} onClick={() => set("patientId", p.id)} className={cn("flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-left transition", f.patientId === p.id ? "bg-ink text-bg" : "hover:bg-black/[0.03]")}>
                <Avatar name={p.name} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{p.name}</span>
                  <span className={cn("block text-xs", f.patientId === p.id ? "text-bg/60" : "text-muted")}>{p.phone}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="mb-6 grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Label>Full name</Label>
            <input value={f.name} onChange={(e) => set("name", e.target.value)} className="field" />
          </div>
          <div>
            <Label>Phone</Label>
            <input value={f.phone} onChange={(e) => set("phone", e.target.value)} className="field" inputMode="tel" />
          </div>
          <div>
            <Label>Email</Label>
            <input value={f.email} onChange={(e) => set("email", e.target.value)} className="field" type="email" />
          </div>
        </div>
      )}
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 sm:col-span-1">
          <Label>Service</Label>
          <select
            value={f.serviceId}
            onChange={(e) => {
              const sid = e.target.value;
              setF((x) => ({ ...x, serviceId: sid, doctorId: doctors.find((d) => d.serviceIds.includes(sid))?.id ?? x.doctorId }));
            }}
            className="field"
          >
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <div className="col-span-2 sm:col-span-1">
          <Label>Doctor</Label>
          <select value={f.doctorId} onChange={(e) => set("doctorId", e.target.value)} className="field">
            {(docs.length ? docs : doctors).map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label>Date</Label>
          <input type="date" value={f.date} onChange={(e) => set("date", e.target.value)} className="field" />
        </div>
        <div>
          <Label>Time</Label>
          <input type="time" value={f.time} onChange={(e) => set("time", e.target.value)} className="field" />
        </div>
        <div>
          <Label>Type</Label>
          <select value={f.type} onChange={(e) => set("type", e.target.value)} className="field">
            <option value="in-clinic">In clinic</option>
            <option value="video">Video</option>
          </select>
        </div>
        <div>
          <Label>Source</Label>
          <select value={f.source} onChange={(e) => set("source", e.target.value)} className="field">
            <option value="phone">Phone</option>
            <option value="walk-in">Walk-in</option>
            <option value="admin">Admin</option>
            <option value="website">Website</option>
          </select>
        </div>
        <div className="col-span-2">
          <Label>Status</Label>
          <select value={f.status} onChange={(e) => set("status", e.target.value)} className="field">
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div className="col-span-2">
          <Label>Notes</Label>
          <textarea rows={3} value={f.notes} onChange={(e) => set("notes", e.target.value)} className="field" />
        </div>
      </div>
    </Drawer>
  );
}
