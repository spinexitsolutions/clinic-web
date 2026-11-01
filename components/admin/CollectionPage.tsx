import { readDb } from "@/lib/db";
import type { CollectionKey } from "@/lib/types";
import { CollectionManager } from "./CollectionManager";

export async function CollectionPage({ collection }: { collection: CollectionKey }) {
  const db = await readDb();
  let items = [...(db[collection] as unknown as (Record<string, unknown> & { id: string })[])];
  if (collection === "posts") items.sort((a, b) => String(b.publishedAt).localeCompare(String(a.publishedAt)));
  else if (items.some((i) => "order" in i)) items = items.sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
  return <CollectionManager collection={collection} items={items} ctx={{ services: db.services.map((s) => ({ id: s.id, name: s.name })), currency: db.settings.currency }} />;
}
