"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import type { AboutContent } from "@/lib/types";
import { saveAbout } from "@/app/admin/actions";
import { Card, PageHeader, SaveBar, SectionTitle, useAction } from "./ui";
import { FormFields, StringList, type FieldDef } from "./fields";

const MAIN: FieldDef[] = [
  { key: "title", label: "Headline", type: "text" },
  { key: "intro", label: "Intro", type: "textarea", rows: 3 },
  { key: "story", label: "Our story", type: "textarea", rows: 6 },
  { key: "image", label: "Feature image", type: "image" },
];

export function AboutEditor({ about }: { about: AboutContent }) {
  const router = useRouter();
  const { pending, run } = useAction();
  const [a, setA] = useState(about);
  const dirty = JSON.stringify(a) !== JSON.stringify(about);

  return (
    <div>
      <PageHeader eyebrow="Website" title="About page" description="Your story, values, milestones and accreditations." actions={<a href="/about" target="_blank" className="btn btn-ghost">Open page</a>} />
      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <SectionTitle>Story</SectionTitle>
          <FormFields fields={MAIN} values={a as unknown as Record<string, unknown>} onChange={(v) => setA(v as unknown as AboutContent)} />
        </Card>
        <div className="space-y-4">
          <Card>
            <SectionTitle>Values</SectionTitle>
            <div className="space-y-3">
              {a.values.map((v, i) => (
                <div key={i} className="relative rounded-2xl bg-black/[0.02] p-3 pr-12">
                  <input value={v.title} onChange={(e) => setA({ ...a, values: a.values.map((x, k) => (k === i ? { ...x, title: e.target.value } : x)) })} className="field mb-2 h-11" placeholder="Title" />
                  <textarea rows={2} value={v.text} onChange={(e) => setA({ ...a, values: a.values.map((x, k) => (k === i ? { ...x, text: e.target.value } : x)) })} className="field" placeholder="Description" />
                  <button onClick={() => setA({ ...a, values: a.values.filter((_, k) => k !== i) })} className="absolute right-2 top-3 grid size-8 place-items-center rounded-full text-muted hover:bg-rose-50 hover:text-rose-600" aria-label="Remove">
                    <X className="size-4" />
                  </button>
                </div>
              ))}
            </div>
            <button onClick={() => setA({ ...a, values: [...a.values, { title: "", text: "" }] })} className="btn btn-ghost mt-3 h-10 text-sm">
              <Plus className="size-4" /> Add value
            </button>
          </Card>
          <Card>
            <SectionTitle>Milestones</SectionTitle>
            <div className="space-y-2">
              {a.milestones.map((m, i) => (
                <div key={i} className="grid grid-cols-[80px_1fr_36px] gap-2">
                  <input value={m.year} onChange={(e) => setA({ ...a, milestones: a.milestones.map((x, k) => (k === i ? { ...x, year: e.target.value } : x)) })} className="field h-11 font-mono text-sm" />
                  <input value={m.text} onChange={(e) => setA({ ...a, milestones: a.milestones.map((x, k) => (k === i ? { ...x, text: e.target.value } : x)) })} className="field h-11 text-sm" />
                  <button onClick={() => setA({ ...a, milestones: a.milestones.filter((_, k) => k !== i) })} className="grid size-9 place-items-center self-center rounded-full text-muted hover:bg-rose-50 hover:text-rose-600" aria-label="Remove">
                    <X className="size-4" />
                  </button>
                </div>
              ))}
            </div>
            <button onClick={() => setA({ ...a, milestones: [...a.milestones, { year: String(new Date().getFullYear()), text: "" }] })} className="btn btn-ghost mt-3 h-10 text-sm">
              <Plus className="size-4" /> Add milestone
            </button>
          </Card>
          <Card>
            <SectionTitle>Accreditations</SectionTitle>
            <StringList value={a.accreditations} onChange={(v) => setA({ ...a, accreditations: v })} />
          </Card>
          <Card>
            <SectionTitle>Gallery</SectionTitle>
            <StringList image value={a.gallery} onChange={(v) => setA({ ...a, gallery: v })} />
          </Card>
        </div>
      </div>
      <SaveBar pending={pending} dirty={dirty} onSave={() => run(() => saveAbout(a), () => router.refresh())} />
    </div>
  );
}
