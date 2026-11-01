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
  { key: "hero.titleAccent", label: "Accent word (serif italic)", type: "text", half: true },
  { key: "hero.titleLine2", label: "Title — last line", type: "text" },
  { key: "hero.subtitle", label: "Subtitle", type: "textarea", rows: 3 },
  { key: "hero.image", label: "Hero image", type: "image" },
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

type Tab = "layout" | "hero" | "story" | "process" | "cta";

export function HomeEditor({ home }: { home: HomeContent }) {
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
