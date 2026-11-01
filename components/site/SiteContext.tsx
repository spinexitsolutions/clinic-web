"use client";
import { createContext, useContext } from "react";
import type { Appearance, SiteSettings } from "@/lib/types";

const Ctx = createContext<{ settings: SiteSettings; appearance: Appearance } | null>(null);

export function SiteProvider({ value, children }: { value: { settings: SiteSettings; appearance: Appearance }; children: React.ReactNode }) {
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSite() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useSite outside SiteProvider");
  return v;
}
