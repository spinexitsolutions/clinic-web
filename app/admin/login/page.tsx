import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { readDb } from "@/lib/db";
import { IMAGES } from "@/lib/seed";
import { LoginForm } from "@/components/admin/LoginForm";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin login", robots: { index: false, follow: false } };

export default async function LoginPage() {
  if (await getSession()) redirect("/admin");
  const { settings } = await readDb();
  return (
    <div className="grid min-h-dvh bg-bg lg:grid-cols-[1.1fr_1fr]">
      <div className="relative h-[34dvh] overflow-hidden lg:h-auto">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`${IMAGES.surgeonsCircle}?auto=format&fit=crop&w=1600&q=75`} alt="" className="absolute inset-0 size-full scale-105 object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-ink/10" />
        <div className="absolute inset-x-0 bottom-0 p-6 text-white md:p-10 lg:p-14">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/70">{settings.name} · Control room</p>
          <h1 className="mt-3 max-w-lg text-3xl font-medium leading-[1] tracking-[-0.045em] md:text-5xl lg:text-6xl">
            Everything your clinic runs on, <span className="serif-accent">in one calm place.</span>
          </h1>
          <div className="mt-6 hidden gap-6 text-sm text-white/75 md:flex">
            <span>Appointments</span><span>·</span><span>Patients</span><span>·</span><span>Leads</span><span>·</span><span>Website</span>
          </div>
        </div>
      </div>
      <div className="flex items-start justify-center px-5 py-10 sm:items-center lg:px-16">
        <div className="w-full max-w-sm">
          <div className="mb-10 flex items-center gap-2.5">
            <span className="grid size-10 place-items-center rounded-[13px] bg-ink text-bg">
              <span className="serif-accent text-2xl leading-none">{settings.name.charAt(0)}</span>
            </span>
            <span className="text-lg font-medium tracking-[-0.02em]">{settings.name}</span>
          </div>
          <h2 className="text-3xl font-medium tracking-[-0.04em]">Welcome back</h2>
          <p className="mt-2 text-muted">Sign in to manage bookings, patients and your website.</p>
          <LoginForm />
          <div className="mt-8 rounded-2xl border border-dashed border-line p-4 text-sm">
            <p className="eyebrow mb-1.5 !text-[10px]">Demo access</p>
            <p className="font-mono text-[13px]">admin@solace.clinic</p>
            <p className="font-mono text-[13px]">solace@123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
