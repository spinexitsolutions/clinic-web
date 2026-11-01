"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Download, Mail, Phone, Plus, Trash2, UserPlus } from "lucide-react";
import type { Lead, LeadStage } from "@/lib/types";
import { addLeadNote, convertLeadToPatient, createLead, deleteLead, moveLead, updateLead } from "@/app/admin/actions";
import { cn, formatDate, money } from "@/lib/utils";
import { Avatar, ConfirmButton, Drawer, PageHeader, Spinner, useAction } from "./ui";
import { Label } from "./fields";

const STAGES: { key: LeadStage; label: string; dot: string }[] = [
  { key: "new", label: "New", dot: "bg-sky-500" },
  { key: "contacted", label: "Contacted", dot: "bg-violet-500" },
  { key: "qualified", label: "Qualified", dot: "bg-amber-500" },
  { key: "converted", label: "Converted", dot: "bg-accent" },
  { key: "lost", label: "Lost", dot: "bg-zinc-400" },
];

function ago(iso: string) {
  const d = (Date.now() - new Date(iso).getTime()) / 1000;
  if (d < 3600) return `${Math.max(1, Math.round(d / 60))}m ago`;
  if (d < 86400) return `${Math.round(d / 3600)}h ago`;
  return `${Math.round(d / 86400)}d ago`;
}

export function LeadsBoard({ leads: initial, currency }: { leads: Lead[]; currency: string }) {
  const router = useRouter();
  const { run } = useAction();
  const [leads, setLeads] = useState(initial);
  const [prev, setPrev] = useState(initial);
  if (prev !== initial) {
    setPrev(initial);
    setLeads(initial);
  }
  const [dragId, setDragId] = useState<string | null>(null);
  const [over, setOver] = useState<LeadStage | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const move = (id: string, stage: LeadStage) => {
    const l = leads.find((x) => x.id === id);
    if (!l || l.stage === stage) return;
    setLeads((ls) => ls.map((x) => (x.id === id ? { ...x, stage } : x)));
    run(() => moveLead(id, stage), () => router.refresh());
  };

  const open = leads.find((l) => l.id === openId) ?? null;
  const openValue = leads.filter((l) => !["converted", "lost"].includes(l.stage)).reduce((s, l) => s + l.value, 0);
  const won = leads.filter((l) => l.stage === "converted").length;
  const closed = leads.filter((l) => ["converted", "lost"].includes(l.stage)).length;

  return (
    <div>
      <PageHeader
        eyebrow="CRM"
        title="Leads pipeline"
        description="Enquiries from the contact form, callbacks and campaigns. Drag cards between stages."
        actions={
          <>
            <a href="/api/admin/export/leads" className="btn btn-ghost">
              <Download className="size-4" /> Export
            </a>
            <button className="btn btn-primary" onClick={() => setCreating(true)}>
              <Plus className="size-4" /> Add lead
            </button>
          </>
        }
      />

      <div className="mb-6 grid grid-cols-3 gap-3">
        {[
          ["Open pipeline", money(openValue, currency)],
          ["Active leads", String(leads.filter((l) => !["converted", "lost"].includes(l.stage)).length)],
          ["Win rate", closed ? `${Math.round((won / closed) * 100)}%` : "—"],
        ].map(([l, v]) => (
          <div key={l} className="rounded-[20px] bg-white p-4 hairline">
            <p className="text-xl font-medium tracking-[-0.03em] md:text-2xl">{v}</p>
            <p className="text-xs text-muted">{l}</p>
          </div>
        ))}
      </div>

      <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-4 md:-mx-8 md:px-8">
        {STAGES.map((st) => {
          const list = leads.filter((l) => l.stage === st.key);
          const total = list.reduce((s, l) => s + l.value, 0);
          return (
            <div
              key={st.key}
              onDragOver={(e) => {
                e.preventDefault();
                setOver(st.key);
              }}
              onDragLeave={() => setOver((o) => (o === st.key ? null : o))}
              onDrop={(e) => {
                e.preventDefault();
                const id = e.dataTransfer.getData("text/plain") || dragId;
                if (id) move(id, st.key);
                setOver(null);
                setDragId(null);
              }}
              className={cn(
                "flex w-[82vw] shrink-0 snap-start flex-col rounded-[22px] bg-black/[0.03] p-2.5 transition-colors sm:w-[300px]",
                over === st.key && "bg-accent-soft ring-2 ring-accent/30",
              )}
            >
              <div className="flex items-center justify-between px-2 pb-3 pt-1.5">
                <div className="flex items-center gap-2">
                  <span className={cn("size-2 rounded-full", st.dot)} />
                  <span className="text-sm font-medium">{st.label}</span>
                  <span className="font-mono text-[11px] text-muted">{list.length}</span>
                </div>
                <span className="font-mono text-[11px] text-muted">{total ? money(total, currency) : ""}</span>
              </div>
              <div className="flex min-h-24 flex-1 flex-col gap-2">
                {list.map((l) => (
                  <motion.div
                    layout
                    layoutId={l.id}
                    key={l.id}
                    draggable
                    onDragStartCapture={(e: React.DragEvent) => {
                      e.dataTransfer.setData("text/plain", l.id);
                      e.dataTransfer.effectAllowed = "move";
                      setDragId(l.id);
                    }}
                    onDragEndCapture={() => setDragId(null)}
                    onClick={() => setOpenId(l.id)}
                    className={cn("cursor-grab rounded-[18px] bg-white p-3.5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] hairline transition-shadow hover:shadow-md active:cursor-grabbing", dragId === l.id && "opacity-40")}
                  >
                    <div className="flex items-start gap-2.5">
                      <Avatar name={l.name} className="size-8 text-[10px]" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{l.name}</p>
                        <p className="text-[11px] text-muted">{ago(l.createdAt)} · {l.source.replace("-", " ")}</p>
                      </div>
                    </div>
                    <p className="mt-2.5 line-clamp-2 text-[13px] leading-snug text-ink/75">{l.subject}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="font-mono text-xs">{l.value ? money(l.value, currency) : "—"}</span>
                      {l.assignee && <span className="rounded-full bg-black/[0.04] px-2 py-0.5 text-[10px] text-muted">{l.assignee}</span>}
                    </div>
                    {/* mobile fallback for drag & drop */}
                    <select
                      value={l.stage}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => move(l.id, e.target.value as LeadStage)}
                      className="mt-3 h-8 w-full rounded-xl bg-black/[0.03] px-2 text-xs md:hidden"
                    >
                      {STAGES.map((s) => (
                        <option key={s.key} value={s.key}>
                          Move to {s.label}
                        </option>
                      ))}
                    </select>
                  </motion.div>
                ))}
                {list.length === 0 && <div className="grid flex-1 place-items-center rounded-[18px] border border-dashed border-black/10 py-8 text-xs text-muted">Drop here</div>}
              </div>
            </div>
          );
        })}
      </div>

      <LeadDrawer key={open?.id} lead={open} currency={currency} onClose={() => setOpenId(null)} onMove={move} />

      <NewLeadDrawer open={creating} onClose={() => setCreating(false)} />
    </div>
  );
}

function LeadDrawer({ lead, currency, onClose, onMove }: { lead: Lead | null; currency: string; onClose: () => void; onMove: (id: string, s: LeadStage) => void }) {
  const router = useRouter();
  const { pending, run } = useAction();
  const [note, setNote] = useState("");
  const [value, setValue] = useState(lead?.value ?? 0);
  const [assignee, setAssignee] = useState(lead?.assignee ?? "");
  if (!lead) return <Drawer open={false} onClose={onClose} title="">{null}</Drawer>;
  return (
    <Drawer
      open
      onClose={onClose}
      title={lead.name}
      subtitle={lead.subject}
      footer={
        <>
          <ConfirmButton className="btn btn-ghost mr-auto h-11 text-rose-600" confirmLabel="Tap again" onConfirm={() => run(() => deleteLead(lead.id), () => (onClose(), router.refresh()))}>
            <Trash2 className="size-4" />
          </ConfirmButton>
          <button className="btn btn-ghost h-11" disabled={pending} onClick={() => run(() => convertLeadToPatient(lead.id), (r) => router.push(`/admin/patients/${r.id}`))}>
            <UserPlus className="size-4" /> Convert to patient
          </button>
          <button className="btn btn-primary h-11" disabled={pending} onClick={() => run(() => updateLead(lead.id, { value, assignee }), () => router.refresh())}>
            {pending && <Spinner />} Save
          </button>
        </>
      }
    >
      <div className="mb-6 flex flex-wrap gap-2">
        {lead.phone && (
          <a href={`tel:${lead.phone}`} className="btn btn-ghost h-10 text-sm">
            <Phone className="size-4" /> Call
          </a>
        )}
        {lead.email && (
          <a href={`mailto:${lead.email}?subject=${encodeURIComponent("Re: " + lead.subject)}`} className="btn btn-ghost h-10 text-sm">
            <Mail className="size-4" /> Email
          </a>
        )}
        {lead.phone && (
          <a href={`https://wa.me/${lead.phone.replace(/\D/g, "")}`} target="_blank" className="btn btn-ghost h-10 text-sm">
            WhatsApp
          </a>
        )}
      </div>

      <Label>Stage</Label>
      <div className="mb-6 flex flex-wrap gap-1.5">
        {STAGES.map((s) => (
          <button key={s.key} onClick={() => onMove(lead.id, s.key)} className={cn("flex items-center gap-2 rounded-full px-3.5 py-2 text-sm transition", lead.stage === s.key ? "bg-ink text-bg" : "bg-white text-muted hairline hover:text-ink")}>
            <span className={cn("size-1.5 rounded-full", s.dot)} />
            {s.label}
          </button>
        ))}
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4">
        <div>
          <Label hint={money(value, currency)}>Estimated value</Label>
          <input type="number" value={value} onChange={(e) => setValue(Number(e.target.value))} className="field" />
        </div>
        <div>
          <Label>Assignee</Label>
          <input value={assignee} onChange={(e) => setAssignee(e.target.value)} className="field" placeholder="Front desk" />
        </div>
      </div>

      {lead.message && (
        <div className="mb-6 rounded-2xl bg-white p-4 text-sm leading-relaxed hairline">
          <p className="eyebrow mb-2 !text-[10px]">Message</p>
          {lead.message}
        </div>
      )}

      <Label>Activity</Label>
      <div className="mb-4 flex gap-2">
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && note.trim() && run(() => addLeadNote(lead.id, note), () => (setNote(""), router.refresh()))}
          placeholder="Log a call, note or follow-up…"
          className="field h-11 flex-1"
        />
        <button className="btn btn-primary h-11" disabled={!note.trim() || pending} onClick={() => run(() => addLeadNote(lead.id, note), () => (setNote(""), router.refresh()))}>
          Add
        </button>
      </div>
      <ol className="relative space-y-4 pl-5">
        <span className="absolute bottom-1 left-[5px] top-1 w-px bg-line" />
        {lead.activity.map((a, i) => (
          <li key={i} className="relative">
            <span className="absolute -left-5 top-1.5 size-[11px] rounded-full bg-white ring-2 ring-accent" />
            <p className="text-sm">{a.text}</p>
            <p className="text-[11px] text-muted">{formatDate(a.at, { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}</p>
          </li>
        ))}
      </ol>
    </Drawer>
  );
}

function NewLeadDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const { pending, run } = useAction();
  const blank = { name: "", phone: "", email: "", subject: "", value: 0 };
  const [f, setF] = useState(blank);
  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Add lead"
      footer={
        <button className="btn btn-primary h-11" disabled={pending} onClick={() => run(() => createLead(f), () => (setF(blank), onClose(), router.refresh()))}>
          {pending && <Spinner />} Create lead
        </button>
      }
    >
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Label>Name</Label>
          <input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} className="field" />
        </div>
        <div>
          <Label>Phone</Label>
          <input value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} className="field" />
        </div>
        <div>
          <Label>Email</Label>
          <input value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} className="field" />
        </div>
        <div className="col-span-2">
          <Label>Interested in</Label>
          <input value={f.subject} onChange={(e) => setF({ ...f, subject: e.target.value })} className="field" placeholder="e.g. Corporate health checks" />
        </div>
        <div className="col-span-2">
          <Label>Estimated value</Label>
          <input type="number" value={f.value} onChange={(e) => setF({ ...f, value: Number(e.target.value) })} className="field" />
        </div>
      </div>
    </Drawer>
  );
}
