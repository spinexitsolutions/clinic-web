import "server-only";
import crypto from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const COOKIE = "solace_admin";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@solace.clinic";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "solace@123";
const SECRET = process.env.SESSION_SECRET || "dev-only-secret-change-me";

function sign(payload: string) {
  return crypto.createHmac("sha256", SECRET).update(payload).digest("base64url");
}

function safeEqual(a: string, b: string) {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && crypto.timingSafeEqual(ba, bb);
}

export function checkCredentials(email: string, password: string) {
  return safeEqual(email.trim().toLowerCase(), ADMIN_EMAIL.toLowerCase()) && safeEqual(password, ADMIN_PASSWORD);
}

export async function createSession(email: string) {
  const exp = Date.now() + MAX_AGE * 1000;
  const payload = Buffer.from(JSON.stringify({ email, exp })).toString("base64url");
  const token = `${payload}.${sign(payload)}`;
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function destroySession() {
  (await cookies()).delete(COOKIE);
}

export async function getSession(): Promise<{ email: string } | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig || !safeEqual(sig, sign(payload))) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString());
    if (typeof data.exp !== "number" || data.exp < Date.now()) return null;
    return { email: data.email };
  } catch {
    return null;
  }
}

/** Use at the top of every admin server action / page. */
export async function requireAdmin() {
  const s = await getSession();
  if (!s) redirect("/admin/login");
  return s;
}
