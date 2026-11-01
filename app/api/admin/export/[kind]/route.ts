import { getSession } from "@/lib/auth";
import { readDb } from "@/lib/db";

function csv(rows: Record<string, unknown>[]) {
  if (!rows.length) return "";
  const cols = Object.keys(rows[0]);
  const esc = (v: unknown) => {
    let s = Array.isArray(v) ? v.join("; ") : String(v ?? "");
    if (/^[=+\-@]/.test(s)) s = `'${s}`; // spreadsheet formula injection guard
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [cols.join(","), ...rows.map((r) => cols.map((c) => esc(r[c])).join(","))].join("\n");
}

export async function GET(_: Request, { params }: { params: Promise<{ kind: string }> }) {
  if (!(await getSession())) return new Response("Unauthorised", { status: 401 });
  const { kind } = await params;
  const db = await readDb();
  const doc = (id: string) => db.doctors.find((d) => d.id === id)?.name ?? "";
  const svc = (id: string) => db.services.find((d) => d.id === id)?.name ?? "";
  let rows: Record<string, unknown>[];
  switch (kind) {
    case "appointments":
      rows = db.appointments.map((a) => ({
        ref: a.ref, date: a.date, time: a.time, patient: a.name, phone: a.phone, email: a.email,
        service: svc(a.serviceId), doctor: doc(a.doctorId), type: a.type, status: a.status, source: a.source, fee: a.fee, notes: a.notes, createdAt: a.createdAt,
      }));
      break;
    case "patients":
      rows = db.patients.map((p) => ({
        name: p.name, phone: p.phone, email: p.email, gender: p.gender, dob: p.dob, bloodGroup: p.bloodGroup, tags: p.tags,
        visits: db.appointments.filter((a) => a.patientId === p.id).length, createdAt: p.createdAt,
      }));
      break;
    case "leads":
      rows = db.leads.map((l) => ({ name: l.name, phone: l.phone, email: l.email, subject: l.subject, stage: l.stage, value: l.value, source: l.source, assignee: l.assignee, createdAt: l.createdAt }));
      break;
    case "subscribers":
      rows = db.subscribers.map((s) => ({ email: s.email, createdAt: s.createdAt }));
      break;
    default:
      return new Response("Not found", { status: 404 });
  }
  return new Response(csv(rows), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="solace-${kind}-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
