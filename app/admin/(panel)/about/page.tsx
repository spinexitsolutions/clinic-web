import { readDb } from "@/lib/db";
import { AboutEditor } from "@/components/admin/AboutEditor";

export const dynamic = "force-dynamic";

export default async function Page() {
  const db = await readDb();
  return <AboutEditor about={db.about} />;
}
