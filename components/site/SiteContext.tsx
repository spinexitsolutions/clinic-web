"use client";
import { createContext, useCallback, useContext } from "react";
import type { Appearance, SiteSettings } from "@/lib/types";
import { DEFAULT_LABELS, fmt, type LabelKey, type Labels } from "@/lib/labels";

type SiteValue = { settings: SiteSettings; appearance: Appearance; labels?: Labels };

const Ctx = createContext<SiteValue | null>(null);

export function SiteProvider({ value, children }: { value: SiteValue; children: React.ReactNode }) {
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSite() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useSite outside SiteProvider");
  return v;
}

/** t("pkgSave", { n: 30 }) → "Save 30%" — copy comes from Admin → Homepage → Labels. */
export function useLabels() {
  const v = useContext(Ctx);
  const labels = v?.labels;
  return useCallback(
    (key: LabelKey, vars?: Record<string, string | number>) => fmt(labels?.[key] ?? DEFAULT_LABELS[key], vars),
    [labels],
  );
}
