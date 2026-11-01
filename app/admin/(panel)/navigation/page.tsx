import { readDb } from "@/lib/db";
import { NavigationEditor } from "@/components/admin/NavigationEditor";

export const dynamic = "force-dynamic";

export default async function Page() {
  const db = await readDb();
  return <NavigationEditor nav={db.appearance.nav} navCta={db.appearance.navCta} />;
}
