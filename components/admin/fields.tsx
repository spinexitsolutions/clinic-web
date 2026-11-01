"use client";

import { useRef, useState } from "react";
import { ArrowDown, ArrowUp, ImagePlus, Plus, Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Spinner, useToast } from "./ui";

export type FieldType =
  | "text"
  | "textarea"
  | "markdown"
  | "number"
  | "toggle"
  | "select"
  | "multiselect"
  | "color"
  | "image"
  | "list"
  | "images"
  | "days"
  | "date";

export interface FieldDef {
  key: string;
  label: string;
  type: FieldType;
  hint?: string;
  placeholder?: string;
  options?: { value: string; label: string }[];
  rows?: number;
  half?: boolean;
  min?: number;
  max?: number;
  step?: number;
  renderOption?: (value: string) => React.ReactNode;
}

type Values = Record<string, unknown>;

export function Label({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <div className="mb-2 flex items-baseline justify-between gap-3">
      <span className="text-[13px] font-medium text-ink/80">{children}</span>
      {hint && <span className="text-right text-[11px] text-muted">{hint}</span>}
    </div>
  );
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className="inline-flex items-center gap-3 text-sm">
      <span className={cn("relative h-[30px] w-[50px] rounded-full transition-colors duration-300", checked ? "bg-accent" : "bg-black/15")}>
        <span className={cn("absolute top-[3px] size-6 rounded-full bg-white shadow-md transition-all duration-300 [transition-timing-function:var(--ease-out)]", checked ? "left-[23px]" : "left-[3px]")} />
      </span>
      {label && <span>{label}</span>}
    </button>
  );
}

export function ColorInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex h-[3.25rem] items-center gap-3 rounded-2xl border border-line bg-white px-2.5">
      <label className="relative size-9 shrink-0 cursor-pointer overflow-hidden rounded-xl ring-1 ring-black/10" style={{ background: value }}>
        <input type="color" value={/^#[0-9a-f]{6}$/i.test(value) ? value : "#000000"} onChange={(e) => onChange(e.target.value.toUpperCase())} className="absolute inset-0 cursor-pointer opacity-0" />
      </label>
      <input value={value} onChange={(e) => onChange(e.target.value)} className="w-full bg-transparent font-mono text-sm uppercase outline-none" maxLength={9} />
    </div>
  );
}

export async function uploadImage(file: File): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Upload failed");
  return json.url as string;
}

function preview(url: string, w = 600) {
  if (!url) return "";
  return url.includes("images.unsplash.com") && !url.includes("?") ? `${url}?w=${w}&q=60&auto=format&fit=crop` : url;
}

export function ImageInput({ value, onChange, compact }: { value: string; onChange: (v: string) => void; compact?: boolean }) {
  const toast = useToast();
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const onFile = async (f?: File) => {
    if (!f) return;
    setBusy(true);
    try {
      onChange(await uploadImage(f));
      toast("ok", "Image uploaded");
    } catch (e) {
      toast("error", e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  };
  return (
    <div
      className={cn("flex gap-3 rounded-2xl border border-line bg-white p-2.5", compact ? "items-center" : "flex-col sm:flex-row sm:items-center")}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        onFile(e.dataTransfer.files?.[0]);
      }}
    >
      <div className={cn("relative shrink-0 overflow-hidden rounded-xl bg-black/[0.04]", compact ? "size-14" : "aspect-[16/10] w-full sm:w-36")}>
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview(value)} alt="" className="absolute inset-0 size-full object-cover" />
        ) : (
          <div className="absolute inset-0 grid place-items-center text-muted">
            <ImagePlus className="size-5" />
          </div>
        )}
      </div>
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <input value={value} onChange={(e) => onChange(e.target.value)} placeholder="Paste image URL or upload →" className="min-w-0 flex-1 bg-transparent px-1 text-sm outline-none" />
        <button type="button" onClick={() => ref.current?.click()} className="btn btn-ghost h-9 shrink-0 px-3 text-xs">
          {busy ? <Spinner className="size-3.5" /> : <Upload className="size-3.5" />}
          Upload
        </button>
        <input ref={ref} type="file" accept="image/*" hidden onChange={(e) => onFile(e.target.files?.[0])} />
      </div>
    </div>
  );
}

export function StringList({ value, onChange, placeholder, image }: { value: string[]; onChange: (v: string[]) => void; placeholder?: string; image?: boolean }) {
  const [draft, setDraft] = useState("");
  const move = (i: number, d: number) => {
    const n = [...value];
    const j = i + d;
    if (j < 0 || j >= n.length) return;
    [n[i], n[j]] = [n[j], n[i]];
    onChange(n);
  };
  const add = () => {
    if (!draft.trim() && !image) return;
    onChange([...value, draft.trim()]);
    setDraft("");
  };
  return (
    <div className="space-y-2">
      {value.map((v, i) => (
        <div key={i} className="group flex items-center gap-2">
          <div className="min-w-0 flex-1">
            {image ? (
              <ImageInput compact value={v} onChange={(nv) => onChange(value.map((x, k) => (k === i ? nv : x)))} />
            ) : (
              <input value={v} onChange={(e) => onChange(value.map((x, k) => (k === i ? e.target.value : x)))} className="field h-11 text-[15px]" />
            )}
          </div>
          <div className="flex shrink-0 items-center">
            <IconBtn onClick={() => move(i, -1)} disabled={i === 0} label="Move up"><ArrowUp className="size-3.5" /></IconBtn>
            <IconBtn onClick={() => move(i, 1)} disabled={i === value.length - 1} label="Move down"><ArrowDown className="size-3.5" /></IconBtn>
            <IconBtn onClick={() => onChange(value.filter((_, k) => k !== i))} label="Remove" danger><X className="size-3.5" /></IconBtn>
          </div>
        </div>
      ))}
      {image ? (
        <button type="button" onClick={() => onChange([...value, ""])} className="btn btn-ghost h-10 text-sm">
          <Plus className="size-4" /> Add image
        </button>
      ) : (
        <div className="flex gap-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                add();
              }
            }}
            placeholder={placeholder ?? "Add item and press Enter"}
            className="field h-11 flex-1 text-[15px]"
          />
          <button type="button" onClick={add} className="btn btn-ghost h-11 w-11 px-0" aria-label="Add">
            <Plus className="size-4" />
          </button>
        </div>
      )}
    </div>
  );
}

export function IconBtn({ children, onClick, disabled, label, danger }: { children: React.ReactNode; onClick: () => void; disabled?: boolean; label: string; danger?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={cn("grid size-8 place-items-center rounded-full text-muted transition hover:bg-black/5 hover:text-ink disabled:opacity-25", danger && "hover:!bg-rose-50 hover:!text-rose-600")}
    >
      {children}
    </button>
  );
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function DayPicker({ value, onChange }: { value: number[]; onChange: (v: number[]) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {DAYS.map((d, i) => {
        const on = value.includes(i);
        return (
          <button
            key={d}
            type="button"
            onClick={() => onChange(on ? value.filter((x) => x !== i) : [...value, i].sort())}
            className={cn("h-10 w-12 rounded-xl text-sm font-medium transition", on ? "bg-ink text-bg" : "bg-white text-muted hairline hover:text-ink")}
          >
            {d}
          </button>
        );
      })}
    </div>
  );
}

export function FieldControl({ def, value, onChange }: { def: FieldDef; value: unknown; onChange: (v: unknown) => void }) {
  switch (def.type) {
    case "text":
    case "date":
      return <input type={def.type === "date" ? "date" : "text"} value={String(value ?? "")} placeholder={def.placeholder} onChange={(e) => onChange(e.target.value)} className="field" />;
    case "number":
      return <input type="number" inputMode="decimal" value={value === undefined || value === null ? "" : String(value)} min={def.min} max={def.max} step={def.step ?? "any"} onChange={(e) => onChange(e.target.value === "" ? 0 : Number(e.target.value))} className="field" />;
    case "textarea":
    case "markdown":
      return (
        <textarea
          value={String(value ?? "")}
          rows={def.rows ?? (def.type === "markdown" ? 12 : 3)}
          placeholder={def.placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={cn("field", def.type === "markdown" && "font-mono text-[13px] leading-relaxed")}
        />
      );
    case "toggle":
      return <Toggle checked={!!value} onChange={onChange} label={def.placeholder} />;
    case "select":
      return (
        <div className="space-y-2">
          <select value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} className="field appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%2212%22 fill=%22none%22 stroke=%22%23777%22 stroke-width=%222%22><path d=%22M2 4l4 4 4-4%22/></svg>')] bg-[right_1rem_center] bg-no-repeat pr-10">
            {def.options?.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          {def.renderOption && (
            <div className="flex flex-wrap gap-1.5">
              {def.options?.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  title={o.label}
                  onClick={() => onChange(o.value)}
                  className={cn("grid size-10 place-items-center rounded-xl transition", value === o.value ? "bg-ink text-bg" : "bg-white text-muted hairline hover:text-ink")}
                >
                  {def.renderOption!(o.value)}
                </button>
              ))}
            </div>
          )}
        </div>
      );
    case "multiselect": {
      const arr = (value as string[]) ?? [];
      return (
        <div className="flex flex-wrap gap-1.5">
          {def.options?.map((o) => {
            const on = arr.includes(o.value);
            return (
              <button
                key={o.value}
                type="button"
                onClick={() => onChange(on ? arr.filter((x) => x !== o.value) : [...arr, o.value])}
                className={cn("rounded-full px-3.5 py-2 text-sm transition", on ? "bg-ink text-bg" : "bg-white text-muted hairline hover:text-ink")}
              >
                {o.label}
              </button>
            );
          })}
        </div>
      );
    }
    case "color":
      return <ColorInput value={String(value ?? "")} onChange={onChange} />;
    case "image":
      return <ImageInput value={String(value ?? "")} onChange={onChange} />;
    case "list":
      return <StringList value={(value as string[]) ?? []} onChange={onChange} placeholder={def.placeholder} />;
    case "images":
      return <StringList image value={(value as string[]) ?? []} onChange={onChange} />;
    case "days":
      return <DayPicker value={(value as number[]) ?? []} onChange={onChange} />;
  }
}

/** Reads/writes nested keys like "availability.start". */
export function getPath(obj: Values, path: string): unknown {
  return path.split(".").reduce<unknown>((o, k) => (o && typeof o === "object" ? (o as Values)[k] : undefined), obj);
}
export function setPath<T extends Values>(obj: T, path: string, value: unknown): T {
  const keys = path.split(".");
  const clone: Values = Array.isArray(obj) ? ([...obj] as unknown as Values) : { ...obj };
  let cur = clone;
  keys.slice(0, -1).forEach((k) => {
    cur[k] = Array.isArray(cur[k]) ? [...(cur[k] as unknown[])] : { ...((cur[k] as Values) ?? {}) };
    cur = cur[k] as Values;
  });
  cur[keys[keys.length - 1]] = value;
  return clone as T;
}

export function FormFields({ fields, values, onChange }: { fields: FieldDef[]; values: Values; onChange: (next: Values) => void }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-5">
      {fields.map((f) => (
        <div key={f.key} className={f.half ? "col-span-2 sm:col-span-1" : "col-span-2"}>
          <Label hint={f.hint ?? (f.type === "markdown" ? "## Heading · - list · **bold** · blank line = paragraph" : undefined)}>{f.label}</Label>
          <FieldControl def={f} value={getPath(values, f.key)} onChange={(v) => onChange(setPath(values, f.key, v))} />
        </div>
      ))}
    </div>
  );
}
