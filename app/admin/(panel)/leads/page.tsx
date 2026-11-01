import { readDb } from "@/lib/db";
import { LeadsBoard } from "@/components/admin/Leads";

export const dynamic = "force-dynamic";

export default async function LeadsPage() {
  const db = await readDb();
  const leads = [...db.leads].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return <LeadsBoard leads={leads} currency={db.settings.currency} />;
}
