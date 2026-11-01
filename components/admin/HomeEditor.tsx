"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, Eye, EyeOff, Plus, X } from "lucide-react";
import type { HomeContent } from "@/lib/types";
import { saveHome } from "@/app/admin/actions";
import { cn } from "@/lib/utils";
import { Card, PageHeader, SaveBar, SectionTitle, Segmented, useAction } from "./ui";
import { FormFields, ImageInput, Label, StringList, type FieldDef } from "./fields";

const HERO: FieldDef[] = [
  { key: "hero.eyebrow", label: "Eyebrow", type: "text" },
  { key: "hero.titleLine1", label: "Title — first line", type: "text", half: true },
  { key: "hero.titleAccent", label: "Accent word (highlighted)", type: "text", half: true },
  { key: "hero.titleLine2", label: "Title — last line", type: "text" },
  { key: "hero.subtitle", label: "Subtitle", type: "textarea", rows: 3 },
  { key: "hero.image", label: "Social share image (link previews)", type: "image" },
  { key: "hero.primaryCta.label", label: "Primary button", type: "text", half: true },
  { key: "hero.primaryCta.href", label: "Primary link", type: "text", half: true },
  { key: "hero.secondaryCta.label", label: "Secondary button", type: "text", half: true },
  { key: "hero.secondaryCta.href", label: "Secondary link", type: "text", half: true },
  { key: "hero.rating", label: "Rating", type: "text", half: true },
  { key: "hero.ratingLabel", label: "Rating label", type: "text", half: true },
];

const CTA: FieldDef[] = [
  { key: "cta.title", label: "Title", type: "text" },
  { key: "cta.subtitle", label: "Subtitle", type: "textarea", rows: 2 },
  { key: "cta.image", label: "Background image", type: "image" },
];

type Tab = "layout" | "hero" | "story" | "proof" | "process" | "cta";

export function HomeEditor({ home, doctors = [] }: { home: HomeContent; doctors?: { id: string; name: string }[] }) {
  const router = useRouter();
  const { pending, run } = useAction();
  const [h, setH] = useState(home);
  const [tab, setTab] = useState<Tab>("layout");
  const dirty = JSON.stringify(h) !== JSON.stringify(home);
  const vals = h as unknown as Record<string, unknown>;
  const onChange = (v: Record<string, unknown>) => setH(v as unknown as HomeContent);

  const moveSection = (i: number, d: number) => {
    const s = [...h.sections];
    const j = i + d;
    if (j < 0 || j >= s.length) return;
    [s[i], s[j]] = [s[j], s[i]];
    setH({ ...h, sections: s });
  };

  return (
    <div>
      <PageHeader eyebrow="Website" title="Homepage" description="Choose which sections appear, in what order, and edit their content." actions={<a href="/" target="_blank" className="btn btn-ghost">Open homepage</a>} />
      <div className="mb-5">
        <Segmented<Tab>
          value={tab}
          onChange={setTab}
          options={[
            { value: "layout", label: "Sections" },
            { value: "hero", label: "Hero" },
            { value: "story", label: "Statement & numbers" },
            { value: "proof", label: "Proof & details" },
            { value: "process", label: "How it works" },
            { value: "cta", label: "Final CTA" },
          ]}
        />
      </div>

      {tab === "layout" && (
        <Card className="max-w-2xl">
          <SectionTitle hint="Hidden sections are skipped on the homepage.">Section order</SectionTitle>
          <ul className="space-y-2">
            {h.sections.map((s, i) => (
              <li key={s.key} className={cn("flex items-center gap-3 rounded-2xl p-2 pl-4 transition hairline", s.visible ? "bg-white" : "bg-black/[0.02] text-muted")}>
                <span className="w-6 font-mono text-xs text-muted">{String(i + 1).padStart(2, "0")}</span>
                <span className={cn("flex-1 text-[15px]", !s.visible && "line-through decoration-black/20")}>{s.label}</span>
                <button onClick={() => moveSection(i, -1)} disabled={i === 0} className="grid size-9 place-items-center rounded-full hover:bg-black/5 disabled:opacity-20" aria-label="Up">
                  <ArrowUp className="size-4" />
                </button>
                <button onClick={() => moveSection(i, 1)} disabled={i === h.sections.length - 1} className="grid size-9 place-items-center rounded-full hover:bg-black/5 disabled:opacity-20" aria-label="Down">
                  <ArrowDown className="size-4" />
                </button>
                <button
                  onClick={() => setH({ ...h, sections: h.sections.map((x, k) => (k === i ? { ...x, visible: !x.visible } : x)) })}
                  className={cn("grid size-9 place-items-center rounded-full transition", s.visible ? "bg-accent-soft text-accent" : "hover:bg-black/5")}
                  aria-label="Toggle visibility"
                >
                  {s.visible ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                </button>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {tab === "hero" && (
        <Card className="max-w-3xl">
          <FormFields fields={HERO} values={vals} onChange={onChange} />
        </Card>
      )}

      {tab === "story" && (
        <div className="grid gap-4 xl:grid-cols-2">
          <Card>
            <SectionTitle hint="Revealed word-by-word as visitors scroll.">Scroll statement</SectionTitle>
            <textarea rows={6} value={h.statement} onChange={(e) => setH({ ...h, statement: e.target.value })} className="field text-lg leading-relaxed" />
            <div className="mt-6">
              <Label>Specialty marquee</Label>
              <StringList value={h.marquee} onChange={(v) => setH({ ...h, marquee: v })} />
            </div>
          </Card>
          <Card>
            <SectionTitle hint="Numbers count up when they scroll into view.">Stats</SectionTitle>
            <div className="space-y-2">
              {h.stats.map((st, i) => (
                <div key={i} className="grid grid-cols-[1fr_70px_1.4fr_36px] items-center gap-2">
                  <input type="number" value={st.value} onChange={(e) => setH({ ...h, stats: h.stats.map((x, k) => (k === i ? { ...x, value: Number(e.target.value) } : x)) })} className="field h-11 text-sm" aria-label="Value" />
                  <input value={st.suffix} onChange={(e) => setH({ ...h, stats: h.stats.map((x, k) => (k === i ? { ...x, suffix: e.target.value } : x)) })} className="field h-11 text-sm" placeholder="+" aria-label="Suffix" />
                  <input value={st.label} onChange={(e) => setH({ ...h, stats: h.stats.map((x, k) => (k === i ? { ...x, label: e.target.value } : x)) })} className="field h-11 text-sm" aria-label="Label" />
                  <button onClick={() => setH({ ...h, stats: h.stats.filter((_, k) => k !== i) })} className="grid size-9 place-items-center rounded-full text-muted hover:bg-rose-50 hover:text-rose-600" aria-label="Remove">
                    <X className="size-4" />
                  </button>
                </div>
              ))}
            </div>
            <button onClick={() => setH({ ...h, stats: [...h.stats, { value: 100, suffix: "+", label: "New stat" }] })} className="btn btn-ghost mt-3 h-10 text-sm">
              <Plus className="size-4" /> Add stat
            </button>
          </Card>
        </div>
      )}

      {tab === "proof" && <ProofEditor proof={h.proof} doctors={doctors} onChange={(proof) => setH({ ...h, proof })} />}

      {tab === "process" && (
        <div className="grid gap-4 md:grid-cols-2">
          {h.process.map((p, i) => (
            <Card key={i}>
              <div className="mb-4 flex items-center justify-between">
                <span className="font-mono text-xs text-muted">STEP {String(i + 1).padStart(2, "0")}</span>
                <button onClick={() => setH({ ...h, process: h.process.filter((_, k) => k !== i) })} className="grid size-8 place-items-center rounded-full text-muted hover:bg-rose-50 hover:text-rose-600" aria-label="Remove step">
                  <X className="size-4" />
                </button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <input value={p.moment ?? ""} onChange={(e) => setH({ ...h, process: h.process.map((x, k) => (k === i ? { ...x, moment: e.target.value } : x)) })} className="field h-11 text-sm" placeholder="Moment (e.g. At the door)" aria-label="Moment" />
                  <input value={p.time ?? ""} onChange={(e) => setH({ ...h, process: h.process.map((x, k) => (k === i ? { ...x, time: e.target.value } : x)) })} className="field h-11 text-sm" placeholder="Time badge (e.g. < 7 min)" aria-label="Time badge" />
                </div>
                <input value={p.title} onChange={(e) => setH({ ...h, process: h.process.map((x, k) => (k === i ? { ...x, title: e.target.value } : x)) })} className="field" placeholder="Title" />
                <textarea rows={3} value={p.text} onChange={(e) => setH({ ...h, process: h.process.map((x, k) => (k === i ? { ...x, text: e.target.value } : x)) })} className="field" placeholder="Description" />
                <ImageInput value={p.image} onChange={(v) => setH({ ...h, process: h.process.map((x, k) => (k === i ? { ...x, image: v } : x)) })} />
              </div>
            </Card>
          ))}
          <button onClick={() => setH({ ...h, process: [...h.process, { title: "New step", text: "", image: "" }] })} className="grid min-h-40 place-items-center rounded-[22px] border border-dashed border-line text-muted transition hover:border-ink hover:text-ink">
            <span className="flex items-center gap-2 text-sm">
              <Plus className="size-4" /> Add step
            </span>
          </button>
        </div>
      )}

      {tab === "cta" && (
        <Card className="max-w-3xl">
          <FormFields fields={CTA} values={vals} onChange={onChange} />
        </Card>
      )}

      <SaveBar pending={pending} dirty={dirty} onSave={() => run(() => saveHome(h), () => router.refresh())} />
    </div>
  );
}

function ProofEditor({ proof, doctors, onChange }: { proof: HomeContent["proof"]; doctors: { id: string; name: string }[]; onChange: (p: HomeContent["proof"]) => void }) {
  const set = <K extends keyof HomeContent["proof"]>(k: K, v: HomeContent["proof"][K]) => onChange({ ...proof, [k]: v });
  const rows = <T extends { [k: string]: string }>(key: "principles" | "packageSteps", list: T[], a: keyof T & string, b: keyof T & string, pa: string, pb: string, max: number) => (
    <div className="space-y-2">
      {list.map((row, i) => (
        <div key={i} className="grid grid-cols-[1fr_1.6fr_36px] items-center gap-2">
          <input value={row[a]} onChange={(e) => set(key, list.map((x, k) => (k === i ? { ...x, [a]: e.target.value } : x)) as never)} className="field h-11 text-sm" placeholder={pa} aria-label={pa} />
          <input value={row[b]} onChange={(e) => set(key, list.map((x, k) => (k === i ? { ...x, [b]: e.target.value } : x)) as never)} className="field h-11 text-sm" placeholder={pb} aria-label={pb} />
          <button onClick={() => set(key, list.filter((_, k) => k !== i) as never)} className="grid size-9 place-items-center rounded-full text-muted hover:bg-rose-50 hover:text-rose-600" aria-label="Remove">
            <X className="size-4" />
          </button>
        </div>
      ))}
      {list.length < max && (
        <button onClick={() => set(key, [...list, { [a]: "", [b]: "" }] as never)} className="btn btn-ghost h-10 text-sm">
          <Plus className="size-4" /> Add
        </button>
      )}
    </div>
  );
  const stars = ["5★", "4★", "3★", "2★", "1★"];
  const total = proof.ratingBreakdown.reduce((s, n) => s + (Number(n) || 0), 0);

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <Card>
        <SectionTitle hint="Signature and three small stats under the philosophy statement.">Philosophy</SectionTitle>
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <Label>Signed by</Label>
            <select value={proof.signatureDoctorId} onChange={(e) => set("signatureDoctorId", e.target.value)} className="field h-11 text-sm">
              <option value="">— No signature —</option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <Label>Their role</Label>
            <input value={proof.signatureRole} onChange={(e) => set("signatureRole", e.target.value)} className="field h-11 text-sm" placeholder="Medical Director" />
          </label>
        </div>
        <div className="mt-5">
          <Label>Principles (value + label)</Label>
          {rows("principles", proof.principles, "value", "label", "20–50", "minute consultations, never rushed", 3)}
        </div>
      </Card>

      <Card>
        <SectionTitle hint="Small details on the numbers tiles.">Numbers tiles</SectionTitle>
        <div className="grid grid-cols-2 gap-3">
          <label className="col-span-2 block">
            <Label>Patients tile badge</Label>
            <input value={proof.growthBadge} onChange={(e) => set("growthBadge", e.target.value)} className="field h-11 text-sm" placeholder="+18% this year (leave empty to hide)" />
          </label>
          <label className="block">
            <Label>Average wait (minutes)</Label>
            <input type="number" min={0} value={proof.waitMinutes} onChange={(e) => set("waitMinutes", Number(e.target.value))} className="field h-11 text-sm" />
          </label>
          <label className="block">
            <Label>City average wait (minutes)</Label>
            <input type="number" min={1} value={proof.cityAvgWait} onChange={(e) => set("cityAvgWait", Number(e.target.value))} className="field h-11 text-sm" />
          </label>
          <label className="col-span-2 block">
            <Label>Caption under “would recommend”</Label>
            <input value={proof.recommendSource} onChange={(e) => set("recommendSource", e.target.value)} className="field h-11 text-sm" />
          </label>
        </div>
      </Card>

      <Card>
        <SectionTitle hint="Rating summary beside the patient stories.">Reviews</SectionTitle>
        <label className="block">
          <Label>Review count</Label>
          <input value={proof.reviewCount} onChange={(e) => set("reviewCount", e.target.value)} className="field h-11 text-sm" placeholder="3,200+" />
        </label>
        <div className="mt-5">
          <Label hint={`total ${Math.round(total * 10) / 10}%`}>Star breakdown (%)</Label>
          <div className="grid grid-cols-5 gap-2">
            {stars.map((st, i) => (
              <label key={st} className="block">
                <span className="mb-1 block text-center text-xs text-muted">{st}</span>
                <input
                  type="number"
                  min={0}
                  max={100}
                  step={0.1}
                  value={proof.ratingBreakdown[i] ?? 0}
                  onChange={(e) => set("ratingBreakdown", stars.map((_, k) => (k === i ? Number(e.target.value) : Number(proof.ratingBreakdown[k]) || 0)))}
                  className="field h-11 text-center text-sm"
                />
              </label>
            ))}
          </div>
        </div>
      </Card>

      <Card>
        <SectionTitle hint="The 3-step strip inside the packages explorer.">Packages · what happens next</SectionTitle>
        {rows("packageSteps", proof.packageSteps, "title", "text", "Home collection", "From 6 AM, at your door", 3)}
        <label className="mt-6 block">
          <Label>Insurers label (final section)</Label>
          <input value={proof.insurersLabel} onChange={(e) => set("insurersLabel", e.target.value)} className="field h-11 text-sm" placeholder="30+ insurers" />
        </label>
      </Card>
    </div>
  );
}
