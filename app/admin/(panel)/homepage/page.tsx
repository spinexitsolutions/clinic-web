import { readDb } from "@/lib/db";
import { HomeEditor } from "@/components/admin/HomeEditor";

export const dynamic = "force-dynamic";

export default async function Page() {
  const db = await readDb();
  return <HomeEditor home={db.home} />;
}
