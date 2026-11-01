import clsx, { type ClassValue } from "clsx";
import type { OpeningHour } from "./types";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function uid(prefix = "") {
  return prefix + Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-4);
}

export function bookingRef() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 5; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return `SOL-${s}`;
}

export function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function img(url: string, w = 1600) {
  if (!url) return url;
  if (url.includes("images.unsplash.com") && !url.includes("?")) return `${url}?auto=format&fit=crop&w=${w}&q=75`;
  return url;
}

export function money(n: number, currency = "₹") {
  return `${currency}${n.toLocaleString("en-IN")}`;
}

export function formatDate(iso: string, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" }) {
  if (!iso) return "";
  const d = new Date(iso.length === 10 ? iso + "T00:00:00" : iso);
  return d.toLocaleDateString("en-IN", opts);
}

export function toISODate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function timeLabel(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  const ap = h >= 12 ? "PM" : "AM";
  const hh = h % 12 || 12;
  return `${hh}:${String(m).padStart(2, "0")} ${ap}`;
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function openStatus(hours: OpeningHour[], now = new Date()) {
  const today = hours.find((h) => h.day === DAYS[now.getDay()]);
  if (!today || today.closed) return { open: false, label: "Closed today" };
  const mins = now.getHours() * 60 + now.getMinutes();
  const [oh, om] = today.open.split(":").map(Number);
  const [ch, cm] = today.close.split(":").map(Number);
  const o = oh * 60 + om;
  const c = ch * 60 + cm;
  if (mins < o) return { open: false, label: `Opens ${timeLabel(today.open)}` };
  if (mins >= c) return { open: false, label: "Closed now" };
  return { open: true, label: `Open · till ${timeLabel(today.close)}` };
}

/** Generate HH:mm slots between start and end. */
export function buildSlots(start: string, end: string, step: number) {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  const out: string[] = [];
  for (let t = sh * 60 + sm; t + step <= eh * 60 + em; t += step) {
    out.push(`${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`);
  }
  return out;
}

export function initials(name: string) {
  return name
    .replace(/^Dr\.?\s+/i, "")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
