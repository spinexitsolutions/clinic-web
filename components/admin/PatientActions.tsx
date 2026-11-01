"use client";

import { useState } from "react";
import Link from "next/link";
import { CalendarDays, Pencil } from "lucide-react";
import type { Patient } from "@/lib/types";
import { PatientDrawer } from "./Patients";

export function PatientActions({ patient }: { patient: Patient }) {
  const [edit, setEdit] = useState<Patient | null>(null);
  return (
    <div className="flex gap-2">
      <a href={`https://wa.me/${patient.phone.replace(/\D/g, "")}`} target="_blank" className="btn btn-ghost">WhatsApp</a>
      <Link href="/admin/appointments?new=1" className="btn btn-ghost"><CalendarDays className="size-4" /> Book</Link>
      <button className="btn btn-primary" onClick={() => setEdit(patient)}><Pencil className="size-4" /> Edit</button>
      <PatientDrawer patient={edit} onClose={() => setEdit(null)} />
    </div>
  );
}
