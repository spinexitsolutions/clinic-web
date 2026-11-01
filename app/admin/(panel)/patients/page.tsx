import { readDb } from "@/lib/db";
import { PatientsList } from "@/components/admin/Patients";

export const dynamic = "force-dynamic";

export default async function PatientsPage() {
  const db = await readDb();
  const rows = db.patients.map((p) => {
    const visits = db.appointments.filter((a) => a.patientId === p.id && a.status !== "cancelled");
    const past = visits.filter((a) => a.status === "completed").map((a) => a.date).sort();
    return { ...p, visits: visits.length, lastVisit: past[past.length - 1] ?? "" };
  });
  return <PatientsList patients={rows} />;
}
