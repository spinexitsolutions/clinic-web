import { readDb } from "@/lib/db";
import { AppearanceEditor } from "@/components/admin/AppearanceEditor";

export const dynamic = "force-dynamic";

export default async function Page() {
  const db = await readDb();
  return <AppearanceEditor appearance={db.appearance} clinicName={db.settings.shortName || db.settings.name} />;
}
