"use client";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useMemo, useState, useTransition } from "react";
import { ArrowLeft, ArrowRight, Building, CalendarPlus, Check, LoaderCircle, MessageCircle, Star, Video } from "lucide-react";
import type { Doctor, Package, Service } from "@/lib/types";
import { bookAppointment, getAvailableSlots } from "@/app/actions";
import { cn, money, timeLabel, toISODate } from "@/lib/utils";
import { Icon } from "./Icon";
import { Img } from "./Img";
import { useSite } from "./SiteContext";

const ease = [0.22, 1, 0.36, 1] as const;
const STEPS = ["Specialty", "Doctor", "Date & time", "Your details"];

type Init = { serviceId?: string; doctorId?: string; pkg?: Package };

export function BookingFlow({ services, doctors, init }: { services: Service[]; doctors: Doctor[]; init: Init }) {
  const { settings } = useSite();
  const initDoctor = doctors.find((d) => d.id === init.doctorId);
  const [step, setStep] = useState(initDoctor ? 2 : init.serviceId ? 1 : 0);
  const [dir, setDir] = useState(1);
  const [serviceId, setServiceId] = useState(init.serviceId ?? initDoctor?.serviceIds[0] ?? "");
  const [doctorId, setDoctorId] = useState(initDoctor?.id ?? "");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [type, setType] = useState<"in-clinic" | "video">("in-clinic");
  const [form, setForm] = useState({ name: "", phone: "", email: "", notes: init.pkg ? `Health package: ${init.pkg.name}` : "" });
  const [slots, setSlots] = useState<string[] | null>(null);
  const [error, setError] = useState("");
  const [done, setDone] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const service = services.find((s) => s.id === serviceId);
  const doctor = doctors.find((d) => d.id === doctorId);
  const docOptions = doctors.filter((d) => !serviceId || d.serviceIds.includes(serviceId));

  const days = useMemo(() => {
    const out: { iso: string; d: Date }[] = [];
    const now = new Date();
    for (let i = 0; i < 21; i++) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
      out.push({ iso: toISODate(d), d });
    }
    return out;
  }, []);

  // pick first available date when doctor changes
  useEffect(() => {
    if (!doctor) return;
    const first = days.find((x) => doctor.availability.days.includes(x.d.getDay()));
    setDate((cur) => (cur && doctor.availability.days.includes(new Date(cur + "T00:00:00").getDay()) ? cur : first?.iso ?? ""));
    setTime("");
  }, [doctor, days]);

  useEffect(() => {
    if (!doctorId || !date) return;
    let live = true;
    setSlots(null);
    getAvailableSlots(doctorId, date).then((s) => live && setSlots(s));
    return () => {
      live = false;
    };
  }, [doctorId, date]);

  const go = (n: number) => {
    setDir(n > step ? 1 : -1);
    setError("");
    setStep(n);
  };

  const canNext = [!!serviceId, !!doctorId, !!date && !!time, form.name.trim().length > 1 && form.phone.replace(/\D/g, "").length >= 10][step];

  const submit = () =>
    start(async () => {
      const res = await bookAppointment({ serviceId, doctorId, date, time, type, ...form });
      if (res.ok && res.data) setDone(res.data.ref);
      else if (!res.ok) {
        setError(res.error);
        if (res.error.includes("slot")) {
          setTime("");
          getAvailableSlots(doctorId, date).then(setSlots);
          go(2);
        }
      }
    });

  if (done && doctor && service) {
    return <Confirmation refCode={done} doctor={doctor} service={service} date={date} time={time} type={type} name={form.name} phone={form.phone} clinic={settings} />;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px] lg:gap-10">
      <div className="min-w-0">
        {/* progress */}
        <div className="mb-8 flex items-center gap-2">
          {STEPS.map((s, i) => (
            <button
              key={s}
              disabled={i > step}
              onClick={() => go(i)}
              className="group flex min-w-0 flex-1 flex-col gap-2 text-left disabled:cursor-default"
            >
              <span className="h-1 overflow-hidden rounded-full bg-ink/10">
                <motion.span className="block h-full bg-accent" initial={false} animate={{ width: i <= step ? "100%" : "0%" }} transition={{ duration: 0.6, ease }} />
              </span>
              <span className={cn("truncate text-[12px] transition-colors md:text-[13px]", i === step ? "font-medium text-ink" : "text-muted")}>
                <span className="font-mono">0{i + 1}</span> <span className="hidden sm:inline">{s}</span>
              </span>
            </button>
          ))}
        </div>

        <div className="relative min-h-[420px]">
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={step}
              custom={dir}
              initial={{ opacity: 0, x: dir * 40, filter: "blur(6px)" }}
              animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, x: dir * -40, filter: "blur(6px)" }}
              transition={{ duration: 0.45, ease }}
            >
              {step === 0 && (
                <>
                  <StepTitle n={1} title="What do you need help with?" />
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                    {services.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => {
                          setServiceId(s.id);
                          if (doctor && !doctor.serviceIds.includes(s.id)) setDoctorId("");
                          go(1);
                        }}
                        className={cn(
                          "group flex flex-col items-start gap-6 rounded-[calc(var(--radius)*0.75)] p-5 text-left transition-all duration-300",
                          serviceId === s.id ? "bg-ink text-bg" : "bg-white hairline hover:-translate-y-1 hover:shadow-[0_20px_40px_-20px_rgba(0,0,0,0.25)]",
                        )}
                      >
                        <span className={cn("grid h-11 w-11 place-items-center rounded-full", serviceId === s.id ? "bg-accent text-accent-ink" : "bg-accent-soft text-accent")}>
                          <Icon name={s.icon} className="h-5 w-5" />
                        </span>
                        <span>
                          <span className="block text-[17px] font-medium leading-tight tracking-[-0.02em]">{s.name}</span>
                          <span className={cn("mt-1 block text-[13px]", serviceId === s.id ? "text-bg/60" : "text-muted")}>From {money(s.priceFrom, settings.currency)}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                </>
              )}

              {step === 1 && (
                <>
                  <StepTitle n={2} title="Choose your doctor" sub={service ? `Specialists for ${service.name}` : undefined} />
                  <div className="grid gap-3 sm:grid-cols-2">
                    {docOptions.map((d) => (
                      <button
                        key={d.id}
                        onClick={() => {
                          setDoctorId(d.id);
                          go(2);
                        }}
                        className={cn(
                          "flex items-center gap-4 rounded-[calc(var(--radius)*0.75)] p-3 pr-5 text-left transition-all duration-300",
                          doctorId === d.id ? "bg-ink text-bg" : "bg-white hairline hover:-translate-y-0.5 hover:shadow-[0_20px_40px_-20px_rgba(0,0,0,0.25)]",
                        )}
                      >
                        <span className="relative h-20 w-20 shrink-0 overflow-hidden rounded-[18px]">
                          <Img src={d.image} alt={d.name} fill sizes="80px" className="object-cover" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[17px] font-medium tracking-[-0.02em]">{d.name}</span>
                          <span className={cn("block truncate text-[13px]", doctorId === d.id ? "text-bg/60" : "text-muted")}>{d.specialty}</span>
                          <span className="mt-2 flex items-center gap-3 text-[13px]">
                            <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-[#F5A524] text-[#F5A524]" />{d.rating.toFixed(1)}</span>
                            <span>{money(d.fee, settings.currency)}</span>
                          </span>
                        </span>
                      </button>
                    ))}
                  </div>
                </>
              )}

              {step === 2 && doctor && (
                <>
                  <StepTitle n={3} title="Pick a time that suits you" sub={`${doctor.name} · ${doctor.availability.slotMinutes}-minute appointments`} />
                  <div className="mb-5 inline-flex rounded-full bg-white p-1 hairline">
                    {(["in-clinic", "video"] as const).map((t) => (
                      <button key={t} onClick={() => setType(t)} className={cn("relative flex h-10 items-center gap-2 rounded-full px-4 text-[14px]", type === t ? "text-bg" : "text-ink/70")}>
                        {type === t && <motion.span layoutId="visit-type" className="absolute inset-0 rounded-full bg-ink" transition={{ duration: 0.4, ease }} />}
                        <span className="relative flex items-center gap-2">
                          {t === "video" ? <Video className="h-4 w-4" /> : <Building className="h-4 w-4" />}
                          {t === "video" ? "Video call" : "In clinic"}
                        </span>
                      </button>
                    ))}
                  </div>

                  <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-2" data-lenis-prevent>
                    {days.map(({ iso, d }) => {
                      const avail = doctor.availability.days.includes(d.getDay());
                      const sel = date === iso;
                      return (
                        <button
                          key={iso}
                          disabled={!avail}
                          onClick={() => {
                            setDate(iso);
                            setTime("");
                          }}
                          className={cn(
                            "flex h-[84px] w-[64px] shrink-0 flex-col items-center justify-center rounded-[18px] transition-all",
                            sel ? "bg-accent text-accent-ink" : avail ? "bg-white hairline hover:border-ink" : "bg-transparent text-ink/25 line-through",
                          )}
                        >
                          <span className="text-[11px] uppercase tracking-wider opacity-70">{d.toLocaleDateString("en-IN", { weekday: "short" })}</span>
                          <span className="text-[24px] font-medium leading-tight tracking-tight">{d.getDate()}</span>
                          <span className="text-[11px] opacity-70">{d.toLocaleDateString("en-IN", { month: "short" })}</span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-6">
                    {slots === null ? (
                      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
                        {Array.from({ length: 10 }).map((_, i) => <div key={i} className="h-12 animate-pulse rounded-2xl bg-ink/5" />)}
                      </div>
                    ) : slots.length === 0 ? (
                      <p className="rounded-2xl bg-white p-6 text-center text-muted hairline">No free slots on this day — try another date.</p>
                    ) : (
                      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
                        {slots.map((s, i) => (
                          <motion.button
                            key={s}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.02, duration: 0.3 }}
                            onClick={() => setTime(s)}
                            className={cn("h-12 rounded-2xl text-[14px] font-medium tabular-nums transition-colors", time === s ? "bg-ink text-bg" : "bg-white hairline hover:border-ink")}
                          >
                            {timeLabel(s)}
                          </motion.button>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}

              {step === 3 && (
                <>
                  <StepTitle n={4} title="Almost there" sub="We'll send your confirmation by SMS and email." />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Full name">
                      <input className="field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoComplete="name" placeholder="Ananya Sharma" />
                    </Field>
                    <Field label="Mobile number">
                      <input className="field" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} inputMode="tel" autoComplete="tel" placeholder="+91 98xxx xxxxx" />
                    </Field>
                    <Field label="Email (optional)" className="sm:col-span-2">
                      <input className="field" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} autoComplete="email" placeholder="you@email.com" />
                    </Field>
                    <Field label="Anything we should know? (optional)" className="sm:col-span-2">
                      <textarea className="field" rows={4} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Symptoms, previous reports, accessibility needs…" />
                    </Field>
                  </div>
                  <p className="mt-4 text-[13px] text-muted">By booking you agree to receive appointment updates. No spam, ever.</p>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {error && <p className="mt-4 rounded-2xl bg-coral/10 p-4 text-[14px] text-coral">{error}</p>}

        <div className="mt-8 flex items-center justify-between gap-3 border-t border-line pt-6">
          <button onClick={() => go(Math.max(0, step - 1))} disabled={step === 0} className="btn btn-ghost disabled:opacity-0">
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          {step < 3 ? (
            <button onClick={() => go(step + 1)} disabled={!canNext} className="btn btn-primary disabled:opacity-30">
              Continue <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button onClick={submit} disabled={!canNext || pending} className="btn btn-accent h-14 px-8 disabled:opacity-40">
              {pending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Confirm booking
            </button>
          )}
        </div>
      </div>

      {/* summary */}
      <aside className="lg:sticky lg:top-28 lg:self-start">
        <div className="overflow-hidden rounded-[var(--radius)] bg-ink text-bg">
          <div className="relative h-36 overflow-hidden">
            <AnimatePresence mode="popLayout">
              <motion.div key={doctor?.id ?? service?.id ?? "none"} className="absolute inset-0" initial={{ opacity: 0, scale: 1.1 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6, ease }}>
                <Img src={doctor?.image ?? service?.image ?? services[0]?.image ?? ""} alt="" fill sizes="380px" className="object-cover" />
              </motion.div>
            </AnimatePresence>
            <div className="absolute inset-0 bg-gradient-to-t from-ink to-ink/10" />
            <p className="absolute bottom-4 left-5 eyebrow !text-bg/60">Your visit</p>
          </div>
          <dl className="space-y-4 p-5 text-[14px]">
            {init.pkg && <Row k="Package" v={`${init.pkg.name} · ${money(init.pkg.price, settings.currency)}`} />}
            <Row k="Specialty" v={service?.name} />
            <Row k="Doctor" v={doctor?.name} />
            <Row k="Date" v={date ? new Date(date + "T00:00:00").toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "long" }) : undefined} />
            <Row k="Time" v={time ? timeLabel(time) : undefined} />
            <Row k="Visit" v={type === "video" ? "Video consultation" : "At the clinic"} />
            <div className="flex items-baseline justify-between border-t border-bg/10 pt-4">
              <dt className="text-bg/50">Consultation fee</dt>
              <dd className="text-2xl font-medium tracking-tight">{doctor ? money(doctor.fee, settings.currency) : "—"}</dd>
            </div>
            <p className="text-[12px] text-bg/40">Pay at the clinic. Free cancellation up to 4 hours before.</p>
          </dl>
        </div>
      </aside>
    </div>
  );
}

function Row({ k, v }: { k: string; v?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="text-bg/50">{k}</dt>
      <dd className={cn("text-right", v ? "text-bg" : "text-bg/25")}>{v ?? "—"}</dd>
    </div>
  );
}

function StepTitle({ n, title, sub }: { n: number; title: string; sub?: string }) {
  return (
    <div className="mb-6">
      <h2 className="text-[clamp(1.8rem,4vw,2.8rem)] font-medium leading-[1.02] tracking-[-0.028em]">
        <span className="serif-accent text-accent">{n}.</span> {title}
      </h2>
      {sub && <p className="mt-2 text-muted">{sub}</p>}
    </div>
  );
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-2 block text-[13px] text-muted">{label}</span>
      {children}
    </label>
  );
}

function Confirmation({
  refCode, doctor, service, date, time, type, name, phone, clinic,
}: {
  refCode: string; doctor: Doctor; service: Service; date: string; time: string; type: string; name: string; phone: string;
  clinic: { name: string; address: string; city: string; whatsapp: string };
}) {
  const ics = () => {
    const [y, m, d] = date.split("-").map(Number);
    const [h, mi] = time.split(":").map(Number);
    const startD = new Date(y, m - 1, d, h, mi);
    const endD = new Date(startD.getTime() + doctor.availability.slotMinutes * 60000);
    const f = (x: Date) => x.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
    const body = [
      "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Solace//Booking//EN", "BEGIN:VEVENT",
      `UID:${refCode}@solace`, `DTSTAMP:${f(new Date())}`, `DTSTART:${f(startD)}`, `DTEND:${f(endD)}`,
      `SUMMARY:${service.name} with ${doctor.name}`, `LOCATION:${type === "video" ? "Video consultation" : `${clinic.address}, ${clinic.city}`}`,
      `DESCRIPTION:Booking ref ${refCode}`, "END:VEVENT", "END:VCALENDAR",
    ].join("\r\n");
    const url = URL.createObjectURL(new Blob([body], { type: "text/calendar" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `solace-${refCode}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  };
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);
  const wa = `https://wa.me/${clinic.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(`Hi, I just booked ${refCode} (${service.name} with ${doctor.name} on ${date} at ${timeLabel(time)}).`)}`;

  return (
    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease }} className="mx-auto max-w-2xl text-center">
      <motion.div
        className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-accent text-accent-ink"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 16, delay: 0.15 }}
      >
        <svg viewBox="0 0 24 24" className="h-11 w-11" fill="none">
          <motion.path d="M5 12.5l4.5 4.5L19 7.5" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6, delay: 0.45, ease }} />
        </svg>
      </motion.div>
      <h2 className="mt-8 text-[clamp(2.2rem,6vw,4rem)] font-semibold leading-none tracking-[-0.025em]">
        You&apos;re booked, <span className="serif-accent text-accent">{name.split(" ")[0]}.</span>
      </h2>
      <p className="mt-4 text-lg text-muted">We&apos;ll confirm by SMS shortly. Please arrive 10 minutes early.</p>

      <div className="mt-10 rounded-[var(--radius)] bg-white p-6 text-left hairline md:p-8">
        <div className="flex items-center justify-between border-b border-line pb-5">
          <span className="eyebrow">Booking reference</span>
          <span className="font-mono text-2xl font-medium tracking-wider text-accent">{refCode}</span>
        </div>
        <div className="grid gap-4 pt-5 text-[15px] sm:grid-cols-2">
          <p><span className="block text-[12px] text-muted">Doctor</span>{doctor.name}</p>
          <p><span className="block text-[12px] text-muted">Specialty</span>{service.name}</p>
          <p><span className="block text-[12px] text-muted">When</span>{new Date(date + "T00:00:00").toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })} · {timeLabel(time)}</p>
          <p><span className="block text-[12px] text-muted">Where</span>{type === "video" ? "Video link via SMS" : clinic.address}</p>
        </div>
      </div>

      <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
        <button onClick={ics} className="btn btn-primary"><CalendarPlus className="h-4 w-4" /> Add to calendar</button>
        <a href={wa} target="_blank" rel="noreferrer" className="btn btn-ghost"><MessageCircle className="h-4 w-4" /> Share on WhatsApp</a>
        <Link href={`/track?ref=${refCode}&phone=${encodeURIComponent(phone)}`} className="btn btn-ghost">Manage booking</Link>
      </div>
    </motion.div>
  );
}
