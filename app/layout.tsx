import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { readDb } from "@/lib/db";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist", display: "swap" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono", display: "swap" });
const instrument = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument",
  display: "swap",
});

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { settings } = await readDb();
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return {
    metadataBase: new URL(base),
    title: { default: `${settings.name} — ${settings.tagline}`, template: `%s · ${settings.name}` },
    description: settings.description,
    openGraph: { title: settings.name, description: settings.description, type: "website", siteName: settings.name },
    twitter: { card: "summary_large_image", title: settings.name, description: settings.description },
  };
}

export async function generateViewport(): Promise<Viewport> {
  const { appearance } = await readDb();
  return { themeColor: appearance.background, width: "device-width", initialScale: 1, viewportFit: "cover" };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { appearance } = await readDb();
  const hex = (v: string, fallback: string) => (/^#[0-9a-f]{3,8}$/i.test(v) ? v : fallback);
  const radius = Math.max(0, Math.min(48, Number(appearance.radius) || 28));
  const vars = `:root{--accent:${hex(appearance.accent, "#0E7C66")};--accent-ink:${hex(appearance.accentInk, "#FFFFFF")};--bg:${hex(appearance.background, "#F5F4F0")};--ink:${hex(appearance.ink, "#0B0D0C")};--radius:${radius}px}`;
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable} ${instrument.variable}`} suppressHydrationWarning>
      <head>
        <style dangerouslySetInnerHTML={{ __html: vars }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
