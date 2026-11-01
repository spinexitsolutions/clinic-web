"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Reorder, useDragControls } from "framer-motion";
import { GripVertical, Plus, X } from "lucide-react";
import type { Appearance, NavLink } from "@/lib/types";
import { saveNavigation } from "@/app/admin/actions";
import { uid } from "@/lib/utils";
import { Card, PageHeader, SaveBar, SectionTitle, useAction } from "./ui";
import { Label, Toggle } from "./fields";

export function NavigationEditor({ nav, navCta, mega }: { nav: NavLink[]; navCta: Appearance["navCta"]; mega: Appearance["mega"] }) {
  const router = useRouter();
  const { pending, run } = useAction();
  const [links, setLinks] = useState(nav);
  const [cta, setCta] = useState(navCta);
  const [mm, setMm] = useState(mega);
  const dirty = JSON.stringify([links, cta, mm]) !== JSON.stringify([nav, navCta, mega]);
  const update = (id: string, patch: Partial<NavLink>) => setLinks((ls) => ls.map((l) => (l.id === id ? { ...l, ...patch } : l)));

  return (
    <div>
      <PageHeader eyebrow="Website" title="Navigation" description="Links in the header, mobile dock menu and footer. Drag to reorder." />
      <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <Card>
          <SectionTitle>Menu links</SectionTitle>
          <Reorder.Group axis="y" values={links} onReorder={setLinks} className="space-y-2">
            {links.map((l) => (
              <LinkRow key={l.id} link={l} onChange={(p) => update(l.id, p)} onRemove={() => setLinks((ls) => ls.filter((x) => x.id !== l.id))} />
            ))}
          </Reorder.Group>
          <button onClick={() => setLinks([...links, { id: uid("n"), label: "New link", href: "/", visible: true }])} className="btn btn-ghost mt-4 h-10 text-sm">
            <Plus className="size-4" /> Add link
          </button>
          <p className="mt-4 text-xs text-muted">
            Available pages: / · /services · /doctors · /packages · /about · /blog · /contact · /faq · /book · /track
          </p>
        </Card>
        <div className="space-y-4">
          <Card>
            <SectionTitle hint="The pill button on the right of the navbar.">Call-to-action</SectionTitle>
            <div className="space-y-4">
              <div>
                <Label>Label</Label>
                <input value={cta.label} onChange={(e) => setCta({ ...cta, label: e.target.value })} className="field" />
              </div>
              <div>
                <Label>Link</Label>
                <input value={cta.href} onChange={(e) => setCta({ ...cta, href: e.target.value })} className="field" />
              </div>
            </div>
          </Card>
          <Card>
            <SectionTitle hint="Text on the cards inside the Services and Doctors dropdowns.">Mega menu</SectionTitle>
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">Services dropdown</p>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Badge</Label><input value={mm.servicesBadge} onChange={(e) => setMm({ ...mm, servicesBadge: e.target.value })} className="field h-11 text-sm" /></div>
                <div><Label>“View all” link text</Label><input value={mm.servicesLink} onChange={(e) => setMm({ ...mm, servicesLink: e.target.value })} className="field h-11 text-sm" /></div>
              </div>
              <div><Label>Card title</Label><input value={mm.servicesTitle} onChange={(e) => setMm({ ...mm, servicesTitle: e.target.value })} className="field h-11 text-sm" /></div>
              <div><Label>Card text</Label><textarea rows={2} value={mm.servicesText} onChange={(e) => setMm({ ...mm, servicesText: e.target.value })} className="field text-sm" /></div>
              <div><Label>Card link</Label><input value={mm.servicesHref} onChange={(e) => setMm({ ...mm, servicesHref: e.target.value })} className="field h-11 text-sm" placeholder="/book" /></div>
              <p className="pt-2 text-xs font-semibold uppercase tracking-wider text-muted">Doctors dropdown</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 sm:col-span-1"><Label>Card title</Label><input value={mm.doctorsTitle} onChange={(e) => setMm({ ...mm, doctorsTitle: e.target.value })} className="field h-11 text-sm" /></div>
                <div className="col-span-2 sm:col-span-1"><Label>“All doctors” link text</Label><input value={mm.doctorsLink} onChange={(e) => setMm({ ...mm, doctorsLink: e.target.value })} className="field h-11 text-sm" /></div>
              </div>
              <div><Label>Card text</Label><textarea rows={2} value={mm.doctorsText} onChange={(e) => setMm({ ...mm, doctorsText: e.target.value })} className="field text-sm" /></div>
              <p className="text-xs text-muted">The doctors card always shows the clinic phone number from Site settings.</p>
            </div>
          </Card>
          <Card>
            <p className="eyebrow mb-4">Preview</p>
            <div className="glass-dark flex flex-wrap items-center gap-1 rounded-[22px] p-1.5 text-bg">
              <span className="grid size-8 place-items-center rounded-full bg-accent font-serif italic text-accent-ink">S</span>
              {links.filter((l) => l.visible).map((l) => (
                <span key={l.id} className="rounded-full px-2.5 py-1 text-xs text-bg/70">
                  {l.label}
                </span>
              ))}
              <span className="ml-auto rounded-full bg-bg px-3 py-1.5 text-xs text-ink">{cta.label}</span>
            </div>
          </Card>
        </div>
      </div>
      <SaveBar pending={pending} dirty={dirty} onSave={() => run(() => saveNavigation(links, cta, mm), () => router.refresh())} />
    </div>
  );
}

function LinkRow({ link, onChange, onRemove }: { link: NavLink; onChange: (p: Partial<NavLink>) => void; onRemove: () => void }) {
  const controls = useDragControls();
  return (
    <Reorder.Item value={link} dragListener={false} dragControls={controls} className="flex items-center gap-2 rounded-2xl bg-white p-2 hairline">
      <button onPointerDown={(e) => controls.start(e)} className="grid size-9 shrink-0 cursor-grab touch-none place-items-center rounded-xl text-muted hover:bg-black/5 active:cursor-grabbing" aria-label="Drag">
        <GripVertical className="size-4" />
      </button>
      <input value={link.label} onChange={(e) => onChange({ label: e.target.value })} className="field h-10 min-w-0 flex-1 text-sm" />
      <input value={link.href} onChange={(e) => onChange({ href: e.target.value })} className="field hidden h-10 min-w-0 flex-1 font-mono text-xs sm:block" />
      <Toggle checked={link.visible} onChange={(v) => onChange({ visible: v })} />
      <button onClick={onRemove} className="grid size-9 shrink-0 place-items-center rounded-full text-muted hover:bg-rose-50 hover:text-rose-600" aria-label="Remove">
        <X className="size-4" />
      </button>
    </Reorder.Item>
  );
}
