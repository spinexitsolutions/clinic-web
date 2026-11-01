"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, Download, Plus, Search, Trash2, Users } from "lucide-react";
import type { Patient } from "@/lib/types";
import { deletePatient, savePatient } from "@/app/admin/actions";
import { cn, formatDate } from "@/lib/utils";
import { Avatar, ConfirmButton, Drawer, Empty, PageHeader, Spinner, useAction } from "./ui";
import { Label, StringList } from "./fields";

type Row = Patient & { visits: number; lastVisit: string };

export function PatientsList({ patients }: { patients: Row[] }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [tag, setTag] = useState("all");
  const [editing, setEditing] = useState<Partial<Patient> | null>(null);
  const tags = useMemo(() => [...new Set(patients.flatMap((p) => p.tags))].sort(), [patients]);
  const rows = patients.filter((p) => (tag === "all" || p.tags.includes(tag)) && `${p.name} ${p.phone} ${p.email}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <div>
      <PageHeader
        eyebrow="CRM"
        title="Patients"
        description="A single record for every person you care for — visits, notes and tags."
        actions={
          <>
            <a href="/api/admin/export/patients" className="btn btn-ghost">
              <Download className="size-4" /> Export
            </a>
            <button className="btn btn-primary" onClick={() => setEditing({ name: "", phone: "", email: "", gender: "", dob: "", bloodGroup: "", tags: [], notes: "" })}>
              <Plus className="size-4" /> Add patient
            </button>
          </>
        }
      />
      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name, phone or email" className="field h-11 pl-11 text-[15px]" />
        </div>
        <div className="no-scrollbar flex gap-1.5 overflow-x-auto">
          {["all", ...tags].map((t) => (
            <button key={t} onClick={() => setTag(t)} className={cn("h-11 shrink-0 rounded-full px-4 text-sm capitalize transition", tag === t ? "bg-ink text-bg" : "bg-white text-muted hairline hover:text-ink")}>
              {t}
            </button>
          ))}
        </div>
      </div>
      <p className="eyebrow mb-3">{rows.length} patients</p>
      {rows.length === 0 ? (
        <Empty title="No patients found" icon={<Users className="size-5" />} />
      ) : (
        <div className="overflow-hidden rounded-[22px] bg-white hairline">
          <div className="hidden grid-cols-[2fr_1.4fr_0.8fr_1fr_1fr_24px] gap-4 border-b border-line px-5 py-3 font-mono text-[10px] uppercase tracking-[0.12em] text-muted md:grid">
            <span>Patient</span>
            <span>Contact</span>
            <span>Visits</span>
            <span>Last visit</span>
            <span>Tags</span>
            <span />
          </div>
          {rows.map((p) => (
            <Link key={p.id} href={`/admin/patients/${p.id}`} className="grid grid-cols-[1fr_auto] items-center gap-4 border-b border-line px-4 py-3.5 transition last:border-0 hover:bg-black/[0.015] md:grid-cols-[2fr_1.4fr_0.8fr_1fr_1fr_24px] md:px-5">
              <div className="flex min-w-0 items-center gap-3">
                <Avatar name={p.name} />
                <div className="min-w-0">
                  <p className="truncate font-medium">{p.name}</p>
                  <p className="truncate text-xs text-muted md:hidden">
                    {p.phone} · {p.visits} visits
                  </p>
                  <p className="hidden text-xs text-muted md:block">
                    {[p.gender, p.bloodGroup].filter(Boolean).join(" · ") || "—"}
                  </p>
                </div>
              </div>
              <div className="hidden min-w-0 text-sm md:block">
                <p className="truncate">{p.phone}</p>
                <p className="truncate text-xs text-muted">{p.email}</p>
              </div>
              <span className="hidden font-mono text-sm md:block">{p.visits}</span>
              <span className="hidden text-sm text-muted md:block">{p.lastVisit ? formatDate(p.lastVisit) : "—"}</span>
              <div className="hidden flex-wrap gap-1 md:flex">
                {p.tags.map((t) => (
                  <span key={t} className="rounded-full bg-accent-soft px-2 py-0.5 text-[11px] text-accent-deep">
                    {t}
                  </span>
                ))}
              </div>
              <ChevronRight className="size-4 text-muted" />
            </Link>
          ))}
        </div>
      )}
      <PatientDrawer patient={editing} onClose={() => setEditing(null)} onSaved={(id) => router.push(`/admin/patients/${id}`)} />
    </div>
  );
}

export function PatientDrawer({ patient, onClose, onSaved }: { patient: Partial<Patient> | null; onClose: () => void; onSaved?: (id: string) => void }) {
  const router = useRouter();
  const { pending, run } = useAction();
  const [f, setF] = useState<Partial<Patient> | null>(patient);
  const [prev, setPrev] = useState(patient);
  if (prev !== patient) {
    setPrev(patient);
    setF(patient);
  }
  const set = (k: keyof Patient, v: unknown) => setF((x) => ({ ...x, [k]: v }));
  return (
    <Drawer
      open={!!patient}
      onClose={onClose}
      title={patient?.id ? "Edit patient" : "New patient"}
      footer={
        <>
          {patient?.id && (
            <ConfirmButton
              className="btn btn-ghost mr-auto h-11 text-rose-600"
              confirmLabel="Tap again"
              onConfirm={() =>
                run(
                  () => deletePatient(patient.id!),
                  () => router.push("/admin/patients"),
                )
              }
            >
              <Trash2 className="size-4" /> Delete
            </ConfirmButton>
          )}
          <button
            className="btn btn-primary h-11"
            disabled={pending}
            onClick={() =>
              f &&
              run(
                () => savePatient(f as Patient),
                (r) => {
                  onClose();
                  if (onSaved && r.id) onSaved(r.id);
                  router.refresh();
                },
              )
            }
          >
            {pending && <Spinner />} Save patient
          </button>
        </>
      }
    >
      {f && (
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Label>Full name</Label>
            <input value={f.name ?? ""} onChange={(e) => set("name", e.target.value)} className="field" />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <Label>Phone</Label>
            <input value={f.phone ?? ""} onChange={(e) => set("phone", e.target.value)} className="field" inputMode="tel" />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <Label>Email</Label>
            <input value={f.email ?? ""} onChange={(e) => set("email", e.target.value)} className="field" type="email" />
          </div>
          <div>
            <Label>Gender</Label>
            <select value={f.gender ?? ""} onChange={(e) => set("gender", e.target.value)} className="field">
              <option value="">—</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <Label>Blood group</Label>
            <select value={f.bloodGroup ?? ""} onChange={(e) => set("bloodGroup", e.target.value)} className="field">
              <option value="">—</option>
              {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((b) => (
                <option key={b}>{b}</option>
              ))}
            </select>
          </div>
          <div className="col-span-2">
            <Label>Date of birth</Label>
            <input type="date" value={f.dob ?? ""} onChange={(e) => set("dob", e.target.value)} className="field" />
          </div>
          <div className="col-span-2">
            <Label>Tags</Label>
            <StringList value={f.tags ?? []} onChange={(v) => set("tags", v)} placeholder="e.g. VIP, Chronic care" />
          </div>
          <div className="col-span-2">
            <Label hint="Staff only">Notes</Label>
            <textarea rows={5} value={f.notes ?? ""} onChange={(e) => set("notes", e.target.value)} className="field" placeholder="Allergies, history, preferences…" />
          </div>
        </div>
      )}
    </Drawer>
  );
}
