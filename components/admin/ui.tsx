"use client";

import { createContext, useCallback, useContext, useEffect, useState, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, CircleAlert, LoaderCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AdminResult } from "@/app/admin/actions";

// ── Toasts ─────────────────────────────────────────────────

type Toast = { id: number; kind: "ok" | "error"; text: string };
const ToastCtx = createContext<(kind: Toast["kind"], text: string) => void>(() => {});

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const push = useCallback((kind: Toast["kind"], text: string) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t.slice(-2), { id, kind, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }, []);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[100] flex flex-col items-center gap-2 px-4 lg:bottom-6">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 420, damping: 32 }}
              className="pointer-events-auto flex items-center gap-2.5 rounded-full bg-ink py-2.5 pl-3 pr-5 text-sm text-bg shadow-2xl shadow-black/20"
            >
              <span className={cn("grid size-6 place-items-center rounded-full", t.kind === "ok" ? "bg-accent text-accent-ink" : "bg-coral text-white")}>
                {t.kind === "ok" ? <Check className="size-3.5" /> : <CircleAlert className="size-3.5" />}
              </span>
              {t.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastCtx.Provider>
  );
}

export const useToast = () => useContext(ToastCtx);

/** Run a server action and toast the result. */
export function useAction() {
  const toast = useToast();
  const [pending, start] = useTransition();
  const run = useCallback(
    (fn: () => Promise<AdminResult>, onOk?: (r: AdminResult & { ok: true }) => void) =>
      start(async () => {
        try {
          const r = await fn();
          if (r.ok) {
            if (r.message) toast("ok", r.message);
            onOk?.(r);
          } else toast("error", r.error);
        } catch (e) {
          toast("error", e instanceof Error ? e.message : "Something went wrong");
        }
      }),
    [toast],
  );
  return { pending, run };
}

// ── Layout bits ────────────────────────────────────────────

export function PageHeader({ eyebrow, title, description, actions }: { eyebrow?: string; title: string; description?: string; actions?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
      <div>
        {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
        <h1 className="text-3xl font-medium tracking-[-0.04em] md:text-[2.6rem] md:leading-none">{title}</h1>
        {description && <p className="mt-3 max-w-xl text-[0.95rem] text-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Card({ className, children, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("rounded-[22px] bg-white p-5 shadow-[0_1px_0_rgba(0,0,0,0.03)] hairline md:p-6", className)} {...rest}>
      {children}
    </div>
  );
}

export function SectionTitle({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <div className="mb-5">
      <h2 className="text-lg font-medium tracking-[-0.02em]">{children}</h2>
      {hint && <p className="mt-1 text-sm text-muted">{hint}</p>}
    </div>
  );
}

const BADGE: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 ring-amber-200",
  confirmed: "bg-accent-soft text-accent-deep ring-accent/20",
  completed: "bg-zinc-100 text-zinc-700 ring-zinc-200",
  cancelled: "bg-rose-50 text-rose-600 ring-rose-200",
  "no-show": "bg-orange-50 text-orange-600 ring-orange-200",
  new: "bg-sky-50 text-sky-700 ring-sky-200",
  contacted: "bg-violet-50 text-violet-700 ring-violet-200",
  qualified: "bg-amber-50 text-amber-700 ring-amber-200",
  converted: "bg-accent-soft text-accent-deep ring-accent/20",
  lost: "bg-zinc-100 text-zinc-500 ring-zinc-200",
};

export function Badge({ value, className }: { value: string; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium capitalize ring-1 ring-inset", BADGE[value] ?? "bg-zinc-100 text-zinc-600 ring-zinc-200", className)}>
      <span className="size-1.5 rounded-full bg-current opacity-70" />
      {value}
    </span>
  );
}

export function Spinner({ className }: { className?: string }) {
  return <LoaderCircle className={cn("size-4 animate-spin", className)} />;
}

export function SaveBar({ pending, onSave, dirty = true, label = "Save changes" }: { pending: boolean; onSave: () => void; dirty?: boolean; label?: string }) {
  return (
    <div className="sticky bottom-20 z-30 mt-8 flex justify-end lg:bottom-6">
      <button
        onClick={onSave}
        disabled={pending || !dirty}
        className="btn btn-primary h-12 px-6 shadow-xl shadow-black/10 disabled:opacity-50"
      >
        {pending ? <Spinner /> : <Check className="size-4" />}
        {label}
      </button>
    </div>
  );
}

// ── Drawer (slide-over) ────────────────────────────────────

export function Drawer({ open, onClose, title, subtitle, children, footer, wide }: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[80]">
          <motion.div
            className="absolute inset-0 bg-ink/30 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            data-lenis-prevent
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 40 }}
            className={cn(
              "absolute inset-y-0 right-0 flex w-full flex-col bg-bg shadow-2xl sm:rounded-l-[28px]",
              wide ? "sm:max-w-2xl" : "sm:max-w-lg",
            )}
          >
            <header className="flex items-start justify-between gap-4 border-b border-line px-6 py-5">
              <div>
                <h3 className="text-xl font-medium tracking-[-0.03em]">{title}</h3>
                {subtitle && <p className="mt-0.5 text-sm text-muted">{subtitle}</p>}
              </div>
              <button onClick={onClose} className="grid size-9 shrink-0 place-items-center rounded-full bg-white hairline transition hover:bg-ink hover:text-bg" aria-label="Close">
                <X className="size-4" />
              </button>
            </header>
            <div className="flex-1 overflow-y-auto px-6 py-6">{children}</div>
            {footer && <footer className="flex items-center justify-end gap-2 border-t border-line bg-white/60 px-6 py-4">{footer}</footer>}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}

// ── Confirm ────────────────────────────────────────────────

export function ConfirmButton({ onConfirm, children, className, confirmLabel = "Confirm?" }: { onConfirm: () => void; children: React.ReactNode; className?: string; confirmLabel?: string }) {
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    if (!armed) return;
    const t = setTimeout(() => setArmed(false), 3000);
    return () => clearTimeout(t);
  }, [armed]);
  return (
    <button
      type="button"
      onClick={() => (armed ? (setArmed(false), onConfirm()) : setArmed(true))}
      className={cn(className, armed && "!bg-coral !text-white")}
    >
      {armed ? confirmLabel : children}
    </button>
  );
}

export function Empty({ title, text, icon }: { title: string; text?: string; icon?: React.ReactNode }) {
  return (
    <div className="grid place-items-center rounded-[22px] border border-dashed border-line px-6 py-16 text-center">
      {icon && <div className="mb-4 grid size-12 place-items-center rounded-2xl bg-accent-soft text-accent">{icon}</div>}
      <p className="font-medium">{title}</p>
      {text && <p className="mt-1 max-w-sm text-sm text-muted">{text}</p>}
    </div>
  );
}

export function Segmented<T extends string>({ value, options, onChange }: { value: T; options: { value: T; label: string }[]; onChange: (v: T) => void }) {
  return (
    <div className="no-scrollbar inline-flex max-w-full overflow-x-auto rounded-full bg-black/[0.04] p-1">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={cn("relative whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm transition-colors", value === o.value ? "text-ink" : "text-muted hover:text-ink")}
        >
          {value === o.value && <motion.span layoutId={`seg-${options.map((x) => x.value).join("")}`} className="absolute inset-0 rounded-full bg-white shadow-sm" transition={{ type: "spring", stiffness: 500, damping: 38 }} />}
          <span className="relative">{o.label}</span>
        </button>
      ))}
    </div>
  );
}

export function Avatar({ name, src, className }: { name: string; src?: string; className?: string }) {
  const ini = name.replace(/^Dr\.?\s+/i, "").split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
  if (src)
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src.includes("unsplash") && !src.includes("?") ? `${src}?w=120&h=120&fit=crop&q=60` : src} alt="" className={cn("size-9 shrink-0 rounded-full object-cover", className)} />;
  const hue = [...name].reduce((h, c) => h + c.charCodeAt(0), 0) % 360;
  return (
    <span className={cn("grid size-9 shrink-0 place-items-center rounded-full text-[11px] font-semibold", className)} style={{ background: `hsl(${hue} 60% 92%)`, color: `hsl(${hue} 45% 30%)` }}>
      {ini}
    </span>
  );
}
