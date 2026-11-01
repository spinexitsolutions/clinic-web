import Link from "next/link";
import { ArrowRight, CalendarDays, Clock, IndianRupee, Kanban, Users, Video } from "lucide-react";
import { readDb } from "@/lib/db";
import { formatDate, money, timeLabel, toISODate } from "@/lib/utils";
import { Badge, Card, PageHeader, Avatar } from "@/components/admin/ui";
import { BarChart, Donut, Sparkline } from "@/components/admin/charts";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const db = await readDb();
  const now = new Date();
  const today = toISODate(now);
  const weekAgo = new Date(now.getTime() - 7 * 864e5).toISOString();
  const monthAgo = toISODate(new Date(now.getTime() - 30 * 864e5));

  const todays = db.appointments.filter((a) => a.date === today && a.status !== "cancelled");
  const pending = db.appointments.filter((a) => a.status === "pending");
  const newLeads = db.leads.filter((l) => l.createdAt >= weekAgo);
  const revenue = db.appointments.filter((a) => a.status === "completed" && a.date >= monthAgo && a.date <= today).reduce((s, a) => s + a.fee, 0);
  const pipeline = db.leads.filter((l) => !["converted", "lost"].includes(l.stage)).reduce((s, l) => s + l.value, 0);

  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - 13 + i);
    const iso = toISODate(d);
    return {
      label: i === 13 ? "Today" : d.toLocaleDateString("en-IN", { day: "numeric" }),
      value: db.appointments.filter((a) => a.date === iso && a.status !== "cancelled").length,
      highlight: i === 13,
    };
  });

  const statusColors: Record<string, string> = { completed: "#0B0D0C", confirmed: "var(--accent)", pending: "#F5B544", cancelled: "#F06A6A", "no-show": "#FF9A5A" };
  const statusSeg = Object.entries(statusColors).map(([k, color]) => ({ label: k, color, value: db.appointments.filter((a) => a.status === k).length }));

  const upcoming = db.appointments
    .filter((a) => `${a.date}T${a.time}` >= `${today}T${String(now.getHours()).padStart(2, "0")}:00` && ["pending", "confirmed"].includes(a.status))
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
    .slice(0, 6);

  const topDocs = db.doctors
    .map((d) => ({ d, n: db.appointments.filter((a) => a.doctorId === d.id && a.status !== "cancelled").length }))
    .sort((a, b) => b.n - a.n)
    .slice(0, 5);
  const topMax = Math.max(1, ...topDocs.map((t) => t.n));

  const doc = (id: string) => db.doctors.find((d) => d.id === id);
  const svc = (id: string) => db.services.find((s) => s.id === id)?.name ?? "";
  const hour = now.getHours();
  const greet = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const kpis = [
    { label: "Today's visits", value: String(todays.length), sub: `${todays.filter((a) => a.status === "confirmed").length} confirmed`, icon: CalendarDays, href: "/admin/appointments?range=today", spark: days.map((d) => d.value) },
    { label: "Awaiting confirmation", value: String(pending.length), sub: "tap to review", icon: Clock, href: "/admin/appointments?status=pending" },
    { label: "New leads · 7 days", value: String(newLeads.length), sub: `${money(pipeline, db.settings.currency)} open pipeline`, icon: Kanban, href: "/admin/leads" },
    { label: "Revenue · 30 days", value: money(revenue, db.settings.currency), sub: "from completed visits", icon: IndianRupee, href: "/admin/appointments?status=completed" },
    { label: "Patients", value: db.patients.length.toLocaleString("en-IN"), sub: `${db.patients.filter((p) => p.createdAt >= weekAgo).length} new this week`, icon: Users, href: "/admin/patients" },
  ];

  return (
    <div>
      <PageHeader
        eyebrow={now.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
        title={`${greet}.`}
        description={`Here's what's happening at ${db.settings.name} today.`}
        actions={
          <>
            <Link href="/admin/appointments?new=1" className="btn btn-primary">New appointment</Link>
            <a href="/" target="_blank" className="btn btn-ghost">View site</a>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:gap-4 xl:grid-cols-5">
        {kpis.map((k, i) => (
          <Link key={k.label} href={k.href} className={`group rounded-[22px] p-4 hairline transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/[0.04] md:p-5 ${i === 0 ? "col-span-2 bg-ink text-bg xl:col-span-1" : "bg-white"}`}>
            <div className="flex items-center justify-between">
              <span className={`grid size-9 place-items-center rounded-xl ${i === 0 ? "bg-white/10 text-white" : "bg-accent-soft text-accent"}`}>
                <k.icon className="size-[18px]" strokeWidth={1.7} />
              </span>
              <ArrowRight className="size-4 -translate-x-1 opacity-0 transition group-hover:translate-x-0 group-hover:opacity-50" />
            </div>
            <p className="mt-5 text-[1.7rem] font-medium leading-none tracking-[-0.04em] md:text-3xl">{k.value}</p>
            <p className={`mt-2 text-[13px] ${i === 0 ? "text-white/60" : "text-muted"}`}>{k.label}</p>
            <p className={`mt-0.5 text-[11px] ${i === 0 ? "text-white/40" : "text-muted/70"}`}>{k.sub}</p>
            {k.spark && <div className="mt-3 opacity-80"><Sparkline values={k.spark} /></div>}
          </Link>
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <Card>
          <div className="mb-4 flex items-end justify-between">
            <div>
              <p className="eyebrow">Last 14 days</p>
              <h2 className="mt-1 text-lg font-medium tracking-[-0.02em]">Appointments</h2>
            </div>
            <p className="text-2xl font-medium tracking-[-0.03em]">{days.reduce((s, d) => s + d.value, 0)}</p>
          </div>
          <BarChart data={days} />
        </Card>
        <Card>
          <p className="eyebrow">All time</p>
          <h2 className="mb-5 mt-1 text-lg font-medium tracking-[-0.02em]">Booking status</h2>
          <Donut segments={statusSeg} centerValue={String(db.appointments.length)} centerLabel="Bookings" />
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <Card className="!p-0">
          <div className="flex items-center justify-between px-5 pb-2 pt-5 md:px-6">
            <h2 className="text-lg font-medium tracking-[-0.02em]">Up next</h2>
            <Link href="/admin/appointments" className="text-sm text-accent">All bookings →</Link>
          </div>
          <ul>
            {upcoming.length === 0 && <li className="px-6 py-10 text-center text-sm text-muted">No upcoming appointments.</li>}
            {upcoming.map((a) => (
              <li key={a.id}>
                <Link href={`/admin/appointments?open=${a.id}`} className="flex items-center gap-4 border-t border-line px-5 py-3.5 transition hover:bg-black/[0.015] md:px-6">
                  <div className="w-14 shrink-0 text-center">
                    <p className="font-mono text-[10px] uppercase text-muted">{a.date === today ? "Today" : formatDate(a.date, { day: "numeric", month: "short" })}</p>
                    <p className="text-sm font-medium">{timeLabel(a.time).replace(" ", " ")}</p>
                  </div>
                  <Avatar name={a.name} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[15px] font-medium">{a.name}</p>
                    <p className="flex items-center gap-1.5 truncate text-[13px] text-muted">
                      {a.type === "video" && <Video className="size-3.5 shrink-0" />}
                      {svc(a.serviceId)} · {doc(a.doctorId)?.name}
                    </p>
                  </div>
                  <Badge value={a.status} className="hidden sm:inline-flex" />
                </Link>
              </li>
            ))}
          </ul>
        </Card>

        <div className="grid gap-4">
          <Card>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-medium tracking-[-0.02em]">Newest leads</h2>
              <Link href="/admin/leads" className="text-sm text-accent">Pipeline →</Link>
            </div>
            <ul className="space-y-3">
              {db.leads.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 4).map((l) => (
                <li key={l.id} className="flex items-center gap-3">
                  <Avatar name={l.name} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{l.name}</p>
                    <p className="truncate text-xs text-muted">{l.subject}</p>
                  </div>
                  <Badge value={l.stage} />
                </li>
              ))}
            </ul>
          </Card>
          <Card>
            <h2 className="mb-4 text-lg font-medium tracking-[-0.02em]">Top doctors</h2>
            <ul className="space-y-3.5">
              {topDocs.map(({ d, n }) => (
                <li key={d.id} className="flex items-center gap-3">
                  <Avatar name={d.name} src={d.image} />
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between text-sm">
                      <span className="truncate font-medium">{d.name}</span>
                      <span className="font-mono text-xs text-muted">{n}</span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-black/[0.05]">
                      <div className="h-full rounded-full bg-accent" style={{ width: `${(n / topMax) * 100}%` }} />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
