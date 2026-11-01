import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail, Phone, Video } from "lucide-react";
import { readDb } from "@/lib/db";
import { formatDate, money, timeLabel } from "@/lib/utils";
import { Avatar, Badge, Card } from "@/components/admin/ui";
import { PatientActions } from "@/components/admin/PatientActions";

export const dynamic = "force-dynamic";

export default async function PatientProfile({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = await readDb();
  const p = db.patients.find((x) => x.id === id);
  if (!p) notFound();
  const visits = db.appointments.filter((a) => a.patientId === p.id).sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));
  const spent = visits.filter((v) => v.status === "completed").reduce((s, v) => s + v.fee, 0);
  const age = p.dob ? Math.floor((Date.now() - new Date(p.dob).getTime()) / (365.25 * 864e5)) : null;
  const doc = (i: string) => db.doctors.find((d) => d.id === i)?.name ?? "—";
  const svc = (i: string) => db.services.find((d) => d.id === i)?.name ?? "—";

  return (
    <div>
      <Link href="/admin/patients" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink">
        <ArrowLeft className="size-4" /> All patients
      </Link>
      <div className="mb-8 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Avatar name={p.name} className="size-16 text-lg md:size-20" />
          <div>
            <h1 className="text-3xl font-medium tracking-[-0.04em] md:text-4xl">{p.name}</h1>
            <p className="mt-1 text-muted">
              {[p.gender && p.gender[0].toUpperCase() + p.gender.slice(1), age !== null && `${age} yrs`, p.bloodGroup].filter(Boolean).join(" · ") || "Profile incomplete"}
            </p>
            <div className="mt-2 flex flex-wrap gap-1">
              {p.tags.map((t) => (
                <span key={t} className="rounded-full bg-accent-soft px-2.5 py-0.5 text-xs text-accent-deep">{t}</span>
              ))}
            </div>
          </div>
        </div>
        <PatientActions patient={p} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_1.7fr]">
        <div className="space-y-4">
          <Card>
            <p className="eyebrow mb-4">Contact</p>
            <a href={`tel:${p.phone}`} className="flex items-center gap-3 py-1.5 text-sm"><Phone className="size-4 text-muted" />{p.phone}</a>
            {p.email && <a href={`mailto:${p.email}`} className="flex items-center gap-3 py-1.5 text-sm"><Mail className="size-4 text-muted" />{p.email}</a>}
            <p className="mt-4 text-xs text-muted">Patient since {formatDate(p.createdAt)}</p>
          </Card>
          <div className="grid grid-cols-3 gap-3">
            {[
              ["Visits", String(visits.filter((v) => v.status === "completed").length)],
              ["Upcoming", String(visits.filter((v) => ["pending", "confirmed"].includes(v.status)).length)],
              ["Billed", money(spent, db.settings.currency)],
            ].map(([l, v]) => (
              <Card key={l} className="!p-4">
                <p className="text-xl font-medium tracking-[-0.03em]">{v}</p>
                <p className="text-xs text-muted">{l}</p>
              </Card>
            ))}
          </div>
          <Card>
            <p className="eyebrow mb-3">Notes</p>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink/80">{p.notes || <span className="text-muted">No notes yet.</span>}</p>
          </Card>
        </div>

        <Card className="!p-0">
          <div className="flex items-center justify-between px-6 pb-3 pt-5">
            <h2 className="text-lg font-medium tracking-[-0.02em]">Visit history</h2>
            <span className="font-mono text-xs text-muted">{visits.length}</span>
          </div>
          {visits.length === 0 && <p className="px-6 pb-8 text-sm text-muted">No visits yet.</p>}
          <ol className="relative px-6 pb-6">
            <span className="absolute bottom-8 left-[33px] top-2 w-px bg-line" />
            {visits.map((v) => (
              <li key={v.id} className="relative flex gap-4 py-3">
                <span className={`relative z-10 mt-1.5 size-[11px] shrink-0 rounded-full ring-4 ring-white ${v.status === "completed" ? "bg-ink" : v.status === "cancelled" ? "bg-rose-400" : "bg-accent"}`} />
                <Link href={`/admin/appointments?open=${v.id}`} className="min-w-0 flex-1 rounded-2xl p-3 -m-3 transition hover:bg-black/[0.02]">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-medium">{svc(v.serviceId)}</p>
                    <Badge value={v.status} />
                  </div>
                  <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted">
                    {formatDate(v.date)} · {timeLabel(v.time)} · {doc(v.doctorId)} {v.type === "video" && <Video className="size-3.5" />}
                  </p>
                  {v.notes && <p className="mt-1.5 text-sm text-ink/70">“{v.notes}”</p>}
                  {v.internalNotes && <p className="mt-1.5 rounded-xl bg-amber-50/70 px-3 py-2 text-xs text-amber-900">{v.internalNotes}</p>}
                </Link>
              </li>
            ))}
          </ol>
        </Card>
      </div>
    </div>
  );
}
