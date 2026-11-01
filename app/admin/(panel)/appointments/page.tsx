import { readDb } from "@/lib/db";
import { AppointmentsBoard } from "@/components/admin/Appointments";

export const dynamic = "force-dynamic";

export default async function AppointmentsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const db = await readDb();
  return (
    <AppointmentsBoard
      appointments={db.appointments}
      doctors={db.doctors}
      services={db.services}
      patients={db.patients}
      currency={db.settings.currency}
      initial={{
        status: sp.status,
        range: sp.range ?? (sp.status || sp.open ? "all" : undefined),
        open: sp.open,
        create: sp.new === "1",
      }}
    />
  );
}
