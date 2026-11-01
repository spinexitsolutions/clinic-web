import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { readDb } from "@/lib/db";
import { AdminShell } from "@/components/admin/Shell";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin();
  const db = await readDb();
  const counts = {
    pending: db.appointments.filter((a) => a.status === "pending").length,
    leads: db.leads.filter((l) => l.stage === "new").length,
  };
  return (
    <AdminShell clinicName={db.settings.shortName || db.settings.name} email={session.email} counts={counts}>
      {children}
    </AdminShell>
  );
}
