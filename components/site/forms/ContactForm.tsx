"use client";
import { AnimatePresence, motion } from "framer-motion";
import { useActionState, useState } from "react";
import { ArrowUpRight, Check, LoaderCircle } from "lucide-react";
import { submitInquiry, type ActionResult } from "@/app/actions";
import { cn } from "@/lib/utils";

const TOPICS = ["General enquiry", "Appointments", "Health packages", "Insurance & billing", "Corporate wellness", "Feedback"];

export function ContactForm() {
  const [topic, setTopic] = useState(TOPICS[0]);
  const [state, action, pending] = useActionState<ActionResult | null, FormData>((_, fd) => submitInquiry(fd), null);

  return (
    <AnimatePresence mode="wait">
      {state?.ok ? (
        <motion.div key="ok" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="flex min-h-[460px] flex-col items-center justify-center rounded-[var(--radius)] bg-accent p-10 text-center text-accent-ink">
          <span className="grid h-16 w-16 place-items-center rounded-full bg-accent-ink text-accent"><Check className="h-7 w-7" /></span>
          <p className="mt-6 text-3xl font-medium tracking-[-0.03em]">Message received.</p>
          <p className="mt-2 max-w-sm text-accent-ink/80">{state.message}</p>
        </motion.div>
      ) : (
        <motion.form key="form" action={action} className="rounded-[var(--radius)] bg-white p-5 hairline md:p-8">
          <input type="hidden" name="subject" value={topic} />
          <input name="company" className="hidden" tabIndex={-1} autoComplete="off" />
          <p className="mb-3 text-[13px] text-muted">What can we help with?</p>
          <div className="mb-6 flex flex-wrap gap-2">
            {TOPICS.map((t) => (
              <button type="button" key={t} onClick={() => setTopic(t)} className={cn("h-9 rounded-full px-4 text-[13px] transition-colors", topic === t ? "bg-ink text-bg" : "bg-bg hover:bg-ink/10")}>
                {t}
              </button>
            ))}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <input className="field" name="name" placeholder="Your name" required autoComplete="name" />
            <input className="field" name="phone" placeholder="Phone" inputMode="tel" autoComplete="tel" />
            <input className="field sm:col-span-2" name="email" type="email" placeholder="Email" autoComplete="email" />
            <textarea className="field sm:col-span-2" name="message" rows={5} placeholder="Tell us a little about what you need…" />
          </div>
          {state && !state.ok && <p className="mt-3 text-[14px] text-coral">{state.error}</p>}
          <button disabled={pending} className="btn btn-primary mt-6 h-14 w-full text-base sm:w-auto sm:px-8">
            {pending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <ArrowUpRight className="h-4 w-4" />} Send message
          </button>
        </motion.form>
      )}
    </AnimatePresence>
  );
}

export function CallbackForm() {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>((_, fd) => submitInquiry(fd), null);
  if (state?.ok) return <p className="flex items-center gap-2 text-[15px]"><Check className="h-4 w-4" /> We&apos;ll call you shortly.</p>;
  return (
    <form action={action} className="flex flex-col gap-2 sm:flex-row">
      <input type="hidden" name="kind" value="callback" />
      <input type="hidden" name="subject" value="Callback request" />
      <input name="name" required placeholder="Name" className="h-12 min-w-0 flex-1 rounded-full bg-white/15 px-5 text-[15px] text-white outline-none placeholder:text-white/60" />
      <input name="phone" required placeholder="Phone" inputMode="tel" className="h-12 min-w-0 flex-1 rounded-full bg-white/15 px-5 text-[15px] text-white outline-none placeholder:text-white/60" />
      <button disabled={pending} className="h-12 shrink-0 rounded-full bg-white px-6 text-[15px] font-medium text-ink">
        {pending ? "…" : "Call me"}
      </button>
      {state && !state.ok && <p className="text-[13px] text-white/80">{state.error}</p>}
    </form>
  );
}
