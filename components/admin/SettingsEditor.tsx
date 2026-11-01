"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { SiteSettings } from "@/lib/types";
import { saveSettings } from "@/app/admin/actions";
import { cn } from "@/lib/utils";
import { Card, PageHeader, SaveBar, SectionTitle, useAction } from "./ui";
import { FormFields, Toggle, type FieldDef } from "./fields";

const IDENTITY: FieldDef[] = [
  { key: "name", label: "Clinic name", type: "text", half: true },
  { key: "shortName", label: "Short name", type: "text", half: true, hint: "used in navbar & intro" },
  { key: "tagline", label: "Tagline", type: "text" },
  { key: "description", label: "SEO description", type: "textarea", rows: 3, hint: "~155 characters" },
  { key: "currency", label: "Currency symbol", type: "text", half: true },
];

const CONTACT: FieldDef[] = [
  { key: "phone", label: "Main phone", type: "text", half: true },
  { key: "emergencyPhone", label: "Emergency line", type: "text", half: true },
  { key: "whatsapp", label: "WhatsApp number", type: "text", half: true, hint: "digits incl. country code" },
  { key: "email", label: "Email", type: "text", half: true },
  { key: "address", label: "Street address", type: "text" },
  { key: "city", label: "City, state & PIN", type: "text" },
  { key: "mapEmbedUrl", label: "Google Maps embed URL", type: "text", hint: "maps?q=…&output=embed" },
  { key: "showWhatsappButton", label: "Floating WhatsApp button", type: "toggle", placeholder: "Show on every page" },
];

const SOCIAL: FieldDef[] = [
  { key: "socials.instagram", label: "Instagram", type: "text", half: true },
  { key: "socials.facebook", label: "Facebook", type: "text", half: true },
  { key: "socials.x", label: "X / Twitter", type: "text", half: true },
  { key: "socials.linkedin", label: "LinkedIn", type: "text", half: true },
  { key: "socials.youtube", label: "YouTube", type: "text", half: true },
];

const ANNOUNCE: FieldDef[] = [
  { key: "announcement.enabled", label: "Show announcement bar", type: "toggle", placeholder: "Visible above the navbar" },
  { key: "announcement.text", label: "Message", type: "text" },
  { key: "announcement.href", label: "Link", type: "text", placeholder: "/packages" },
];

export function SettingsEditor({ settings }: { settings: SiteSettings }) {
  const router = useRouter();
  const { pending, run } = useAction();
  const [s, setS] = useState(settings);
  const dirty = JSON.stringify(s) !== JSON.stringify(settings);
  const vals = s as unknown as Record<string, unknown>;
  const onChange = (v: Record<string, unknown>) => setS(v as unknown as SiteSettings);

  return (
    <div>
      <PageHeader eyebrow="Website" title="Site settings" description="Clinic identity, contact details, opening hours and social links used across the whole site." />
      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <SectionTitle>Identity</SectionTitle>
          <FormFields fields={IDENTITY} values={vals} onChange={onChange} />
        </Card>
        <Card>
          <SectionTitle>Contact & location</SectionTitle>
          <FormFields fields={CONTACT} values={vals} onChange={onChange} />
        </Card>
        <Card>
          <SectionTitle hint="Drives the live “Open now” indicator in the navbar.">Opening hours</SectionTitle>
          <div className="space-y-2">
            {s.hours.map((h, i) => (
              <div key={h.day} className={cn("flex items-center gap-3 rounded-2xl px-3 py-2 transition", h.closed ? "bg-black/[0.02]" : "bg-white hairline")}>
                <span className="w-10 font-mono text-sm">{h.day}</span>
                <input type="time" disabled={h.closed} value={h.open} onChange={(e) => setS({ ...s, hours: s.hours.map((x, k) => (k === i ? { ...x, open: e.target.value } : x)) })} className="field h-10 flex-1 text-sm disabled:opacity-30" />
                <span className="text-muted">–</span>
                <input type="time" disabled={h.closed} value={h.close} onChange={(e) => setS({ ...s, hours: s.hours.map((x, k) => (k === i ? { ...x, close: e.target.value } : x)) })} className="field h-10 flex-1 text-sm disabled:opacity-30" />
                <Toggle checked={!h.closed} onChange={(v) => setS({ ...s, hours: s.hours.map((x, k) => (k === i ? { ...x, closed: !v } : x)) })} />
              </div>
            ))}
          </div>
        </Card>
        <div className="grid gap-4">
          <Card>
            <SectionTitle>Announcement bar</SectionTitle>
            <FormFields fields={ANNOUNCE} values={vals} onChange={onChange} />
          </Card>
          <Card>
            <SectionTitle>Social links</SectionTitle>
            <FormFields fields={SOCIAL} values={vals} onChange={onChange} />
          </Card>
        </div>
      </div>
      <SaveBar pending={pending} dirty={dirty} onSave={() => run(() => saveSettings(s), () => router.refresh())} />
    </div>
  );
}
