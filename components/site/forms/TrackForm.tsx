"use client";
import { AnimatePresence, motion } from "framer-motion";
import { useState, useTransition } from "react";
import { LoaderCircle, Search } from "lucide-react";
import { cancelAppointment, trackAppointment } from "@/app/actions";
import { cn, timeLabel } from "@/lib/utils";

type Res = Awaited<ReturnType<typeof trackAppointment>>;

const STATUS: Record<string, { label: string; cls: string }> = {
  pending: { label: "Awaiting confirmation", cls: "bg-amber-100 text-amber-800" },
  confirmed: { label: "Confirmed", cls: "bg-accent-soft text-accent-deep" },
  completed: { label: "Completed", cls: "bg-ink/10 text-ink" },
  cancelled: { label: "Cancelled", cls: "bg-coral/15 text-coral" },
  "no-show": { label: "Missed", cls: "bg-coral/15 text-coral" },
};

export function TrackForm({ initialRef = "", initialPhone = "" }: { initialRef?: string; initialPhone?: string }) {
  const [ref, setRef] = useState(initialRef);
  const [phone, setPhone] = useState(initialPhone);
  const [res, setRes] = useState<Res | null>(null);
  const [msg, setMsg] = useState("");
  const [pending, start] = useTransition();

  const lookup = () => start(async () => { setMsg(""); setRes(await trackAppointment(ref, phone)); });
  const cancel = () =>
    start(async () => {
      if (!confirm("Cancel this appointment?")) return;
      const r = await cancelAppointment(ref, phone);
      setMsg(r.ok ? r.message ?? "Cancelled" : r.error);
      setRes(await trackAppointment(ref, phone));
    });

  const data = res?.ok ? res.data : undefined;
  const st = data ? STATUS[data.status] ?? STATUS.pending : null;

  return (
    <div className="mx-auto max-w-xl">
      <form onSubmit={(e) => { e.preventDefault(); lookup(); }} className="grid gap-3 rounded-[var(--radius)] bg-white p-4 hairline md:p-6">
        <input className="field font-mono uppercase tracking-wider" placeholder="SOL-XXXXX" value={ref} onChange={(e) => setRef(e.target.value)} required />
        <input className="field" placeholder="Mobile number used for booking" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required />
        <button className="btn btn-primary h-14" disabled={pending}>
          {pending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />} Find my booking
        </button>
      </form>

      <AnimatePresence mode="wait">
        {res && !res.ok && (
          <motion.p key="err" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-4 rounded-2xl bg-coral/10 p-4 text-[14px] text-coral">
            {res.error}
          </motion.p>
        )}
        {data && st && (
          <motion.div key={data.ref + data.status} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }} className="mt-4 rounded-[var(--radius)] bg-ink p-6 text-bg md:p-8">
            <div className="flex items-center justify-between">
              <span className="font-mono text-lg tracking-wider">{data.ref}</span>
              <span className={cn("rounded-full px-3 py-1 text-[12px] font-medium", st.cls)}>{st.label}</span>
            </div>
            <p className="mt-6 text-3xl font-medium tracking-[-0.03em]">{data.service}</p>
            <p className="mt-1 text-bg/60">with {data.doctor}</p>
            <div className="mt-6 grid grid-cols-2 gap-4 border-t border-bg/10 pt-5 text-[14px]">
              <p><span className="block text-bg/50">Date</span>{new Date(data.date + "T00:00:00").toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}</p>
              <p><span className="block text-bg/50">Time</span>{timeLabel(data.time)}</p>
              <p><span className="block text-bg/50">Patient</span>{data.name}</p>
              <p><span className="block text-bg/50">Visit</span>{data.type === "video" ? "Video" : "In clinic"}</p>
            </div>
            {(data.status === "pending" || data.status === "confirmed") && (
              <button onClick={cancel} disabled={pending} className="mt-6 text-[14px] text-coral underline-offset-4 hover:underline">
                Cancel appointment
              </button>
            )}
            {msg && <p className="mt-3 text-[14px] text-bg/70">{msg}</p>}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
