"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Check, RefreshCw } from "lucide-react";
import type { Appearance } from "@/lib/types";
import { resetDemoData, saveAppearance } from "@/app/admin/actions";
import { cn } from "@/lib/utils";
import { Card, ConfirmButton, PageHeader, SaveBar, SectionTitle, Segmented, useAction } from "./ui";
import { ColorInput, Label, Toggle } from "./fields";

const PRESETS: { name: string; accent: string; accentInk: string; background: string; ink: string }[] = [
  { name: "Solace", accent: "#0E7C66", accentInk: "#FFFFFF", background: "#F5F4F0", ink: "#0B0D0C" },
  { name: "Ocean", accent: "#1D4ED8", accentInk: "#FFFFFF", background: "#F4F6FA", ink: "#0A0F1C" },
  { name: "Coral", accent: "#E8553B", accentInk: "#FFFFFF", background: "#FBF6F1", ink: "#1A1210" },
  { name: "Lavender", accent: "#6D4AFF", accentInk: "#FFFFFF", background: "#F6F5FB", ink: "#100D1C" },
  { name: "Sage", accent: "#5B7A5A", accentInk: "#FFFFFF", background: "#F2F1EA", ink: "#141712" },
  { name: "Midnight", accent: "#C8F169", accentInk: "#0B0D0C", background: "#F3F3EF", ink: "#0B0D0C" },
];

export function AppearanceEditor({ appearance, clinicName }: { appearance: Appearance; clinicName: string }) {
  const router = useRouter();
  const { pending, run } = useAction();
  const [a, setA] = useState(appearance);
  const [replay, setReplay] = useState(0);
  const dirty = JSON.stringify(a) !== JSON.stringify(appearance);
  const intro = a.intro;
  const setIntro = (patch: Partial<Appearance["intro"]>) => setA({ ...a, intro: { ...intro, ...patch } });
  const vars = { "--accent": a.accent, "--accent-ink": a.accentInk, "--bg": a.background, "--ink": a.ink, "--radius": `${a.radius}px` } as React.CSSProperties;

  return (
    <div>
      <PageHeader eyebrow="Website" title="Appearance & intro" description="Brand colours, corner radius, motion and the opening animation — previewed live." />

      <div className="grid gap-4 xl:grid-cols-[1.25fr_1fr]">
        <div className="space-y-4">
          <Card>
            <SectionTitle hint="One tap applies a complete, tested palette.">Palette presets</SectionTitle>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
              {PRESETS.map((p) => {
                const on = p.accent === a.accent && p.background === a.background;
                return (
                  <button key={p.name} onClick={() => setA({ ...a, accent: p.accent, accentInk: p.accentInk, background: p.background, ink: p.ink })} className={cn("group rounded-2xl p-2 text-left transition hairline", on ? "ring-2 ring-ink" : "hover:-translate-y-0.5")}>
                    <div className="relative h-14 overflow-hidden rounded-xl" style={{ background: p.background }}>
                      <span className="absolute bottom-2 left-2 size-6 rounded-full" style={{ background: p.accent }} />
                      <span className="absolute bottom-2 left-6 size-6 rounded-full ring-2" style={{ background: p.ink, ["--tw-ring-color" as string]: p.background }} />
                      {on && <Check className="absolute right-2 top-2 size-4" style={{ color: p.ink }} />}
                    </div>
                    <p className="mt-1.5 px-0.5 text-xs font-medium">{p.name}</p>
                  </button>
                );
              })}
            </div>
          </Card>

          <Card>
            <SectionTitle>Colours & shape</SectionTitle>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 sm:col-span-1"><Label>Accent</Label><ColorInput value={a.accent} onChange={(v) => setA({ ...a, accent: v })} /></div>
              <div className="col-span-2 sm:col-span-1"><Label>Text on accent</Label><ColorInput value={a.accentInk} onChange={(v) => setA({ ...a, accentInk: v })} /></div>
              <div className="col-span-2 sm:col-span-1"><Label>Background</Label><ColorInput value={a.background} onChange={(v) => setA({ ...a, background: v })} /></div>
              <div className="col-span-2 sm:col-span-1"><Label>Ink (text)</Label><ColorInput value={a.ink} onChange={(v) => setA({ ...a, ink: v })} /></div>
              <div className="col-span-2">
                <Label hint={`${a.radius}px`}>Corner radius</Label>
                <input type="range" min={0} max={48} value={a.radius} onChange={(e) => setA({ ...a, radius: Number(e.target.value) })} className="w-full accent-[var(--accent)]" />
              </div>
            </div>
          </Card>

          <Card>
            <SectionTitle>Motion</SectionTitle>
            <div className="space-y-4">
              <Row title="Smooth scrolling" text="Buttery inertia scrolling powered by Lenis.">
                <Toggle checked={a.smoothScroll} onChange={(v) => setA({ ...a, smoothScroll: v })} />
              </Row>
              <Row title="Cursor follower" text="A soft accent cursor that reacts to links (desktop only).">
                <Toggle checked={a.cursorFollower} onChange={(v) => setA({ ...a, cursorFollower: v })} />
              </Row>
            </div>
          </Card>

          <Card>
            <SectionTitle hint="The cinematic opening shown when someone lands on the site.">Intro animation</SectionTitle>
            <div className="space-y-5">
              <Row title="Enable intro" text="Turn off for instant page load.">
                <Toggle checked={intro.enabled} onChange={(v) => setIntro({ enabled: v })} />
              </Row>
              <div>
                <Label>Style</Label>
                <Segmented
                  value={intro.style}
                  onChange={(v) => {
                    setIntro({ style: v });
                    setReplay((r) => r + 1);
                  }}
                  options={[
                    { value: "pulse", label: "Heartbeat" },
                    { value: "letters", label: "Letters" },
                    { value: "curtain", label: "Curtain" },
                  ]}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1"><Label>Word</Label><input value={intro.word} onChange={(e) => setIntro({ word: e.target.value })} className="field" /></div>
                <div className="col-span-2 sm:col-span-1"><Label>Tagline</Label><input value={intro.tagline} onChange={(e) => setIntro({ tagline: e.target.value })} className="field" /></div>
                <div className="col-span-2">
                  <Label hint={`${(intro.durationMs / 1000).toFixed(1)}s`}>Duration</Label>
                  <input type="range" min={1000} max={6000} step={100} value={intro.durationMs} onChange={(e) => setIntro({ durationMs: Number(e.target.value) })} className="w-full accent-[var(--accent)]" />
                </div>
              </div>
              <Row title="Once per session" text="Returning visitors in the same tab skip the intro.">
                <Toggle checked={intro.oncePerSession} onChange={(v) => setIntro({ oncePerSession: v })} />
              </Row>
            </div>
          </Card>
        </div>

        {/* Live preview */}
        <div className="xl:sticky xl:top-8 xl:self-start">
          <div className="mb-3 flex items-center justify-between">
            <p className="eyebrow">Live preview</p>
            <button onClick={() => setReplay((r) => r + 1)} className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-ink">
              <RefreshCw className="size-3.5" /> Replay intro
            </button>
          </div>
          <div style={vars} className="relative overflow-hidden rounded-[28px] shadow-2xl shadow-black/10 ring-1 ring-black/5">
            <div className="relative bg-[var(--bg)] p-5 text-[var(--ink)]">
              <div className="mx-auto flex w-fit items-center gap-3 rounded-full bg-[var(--ink)] py-1.5 pl-1.5 pr-4 text-[var(--bg)]">
                <span className="grid size-7 place-items-center rounded-full bg-[var(--accent)] text-[var(--accent-ink)] font-serif italic">{clinicName.charAt(0)}</span>
                <span className="text-xs">{clinicName}</span>
                <span className="size-1.5 rounded-full bg-[var(--accent)]" />
              </div>
              <p className="mt-8 font-mono text-[9px] uppercase tracking-[0.16em] opacity-50">Multi-specialty clinic</p>
              <h3 className="mt-2 text-[2.1rem] font-medium leading-[0.95] tracking-[-0.05em]">
                Care that <span className="font-serif italic text-[var(--accent)]">listens</span> before it treats.
              </h3>
              <div className="mt-5 flex gap-2">
                <span className="rounded-full bg-[var(--ink)] px-4 py-2 text-xs text-[var(--bg)]">Book a visit</span>
                <span className="rounded-full px-4 py-2 text-xs ring-1 ring-[color-mix(in_oklab,var(--ink)_15%,transparent)]">Services</span>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-2">
                <div className="h-24 bg-[var(--accent)] p-3 text-[var(--accent-ink)]" style={{ borderRadius: "var(--radius)" }}>
                  <p className="text-xs opacity-80">Cardiology</p>
                  <p className="mt-6 text-lg font-medium leading-none">4.9★</p>
                </div>
                <div className="h-24 bg-white p-3" style={{ borderRadius: "var(--radius)" }}>
                  <p className="text-xs opacity-60">Next slot</p>
                  <p className="mt-6 text-lg font-medium leading-none">10:30</p>
                </div>
              </div>
            </div>

            <AnimatePresence>
              {intro.enabled && <IntroPreview key={replay + intro.style + intro.durationMs} word={intro.word} tagline={intro.tagline} style={intro.style} duration={intro.durationMs} />}
            </AnimatePresence>
          </div>

          <Card className="mt-6 border-rose-200 !bg-rose-50/40">
            <p className="font-medium">Reset demo data</p>
            <p className="mt-1 text-sm text-muted">Restores every page, setting and CRM record to the original demo content. This can't be undone.</p>
            <ConfirmButton className="btn btn-ghost mt-4 h-10 text-sm text-rose-600" confirmLabel="Tap again to reset everything" onConfirm={() => run(() => resetDemoData(), () => router.refresh())}>
              <RefreshCw className="size-4" /> Reset all data
            </ConfirmButton>
          </Card>
        </div>
      </div>

      <SaveBar pending={pending} dirty={dirty} onSave={() => run(() => saveAppearance(a), () => router.refresh())} />
    </div>
  );
}

function Row({ title, text, children }: { title: string; text: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-6">
      <div>
        <p className="text-[15px] font-medium">{title}</p>
        <p className="text-sm text-muted">{text}</p>
      </div>
      {children}
    </div>
  );
}

function IntroPreview({ word, tagline, style, duration }: { word: string; tagline: string; style: Appearance["intro"]["style"]; duration: number }) {
  const d = duration / 1000;
  return (
    <motion.div
      className="absolute inset-0 z-10 grid place-items-center overflow-hidden bg-[var(--ink)] text-[var(--bg)]"
      initial={{ opacity: 1 }}
      animate={style === "curtain" ? { clipPath: ["inset(0 0 0 0)", "inset(0 0 0 0)", "inset(0 0 100% 0)"] } : { opacity: [1, 1, 0] }}
      transition={{ duration: d, times: [0, 0.8, 1], ease: [0.83, 0, 0.17, 1] }}
      style={{ pointerEvents: "none" }}
    >
      <div className="text-center">
        {style === "pulse" && (
          <svg viewBox="0 0 200 40" className="mx-auto mb-3 w-40">
            <motion.path
              d="M0 20 H70 L80 6 L92 34 L102 12 L110 20 H200"
              fill="none"
              stroke="var(--accent)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: d * 0.6, ease: "easeInOut" }}
            />
          </svg>
        )}
        <div className="flex justify-center overflow-hidden text-4xl font-medium tracking-[-0.05em]">
          {(style === "letters" ? word.split("") : [word]).map((ch, i) => (
            <motion.span key={i} initial={{ y: "110%" }} animate={{ y: 0 }} transition={{ delay: 0.15 + i * 0.06, duration: 0.7, ease: [0.22, 1, 0.36, 1] }} className="inline-block">
              {ch}
            </motion.span>
          ))}
        </div>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 0.6 }} transition={{ delay: d * 0.35 }} className="mt-2 font-serif text-sm italic">
          {tagline}
        </motion.p>
      </div>
    </motion.div>
  );
}
