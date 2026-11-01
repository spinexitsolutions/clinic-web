import { readDb } from "@/lib/db";
import { SettingsEditor } from "@/components/admin/SettingsEditor";

export const dynamic = "force-dynamic";

export default async function Page() {
  const db = await readDb();
  return <SettingsEditor settings={db.settings} />;
}
