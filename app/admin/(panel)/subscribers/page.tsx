import { Download, Mail } from "lucide-react";
import { readDb } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { Empty, PageHeader } from "@/components/admin/ui";
import { DeleteSubscriber } from "@/components/admin/DeleteSubscriber";

export const dynamic = "force-dynamic";

export default async function SubscribersPage() {
  const db = await readDb();
  const subs = [...db.subscribers].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const thisMonth = subs.filter((s) => s.createdAt.slice(0, 7) === new Date().toISOString().slice(0, 7)).length;
  return (
    <div>
      <PageHeader
        eyebrow="CRM"
        title="Subscribers"
        description="People who joined the newsletter from the website footer."
        actions={<a href="/api/admin/export/subscribers" className="btn btn-ghost"><Download className="size-4" /> Export CSV</a>}
      />
      <div className="mb-6 grid max-w-md grid-cols-2 gap-3">
        <div className="rounded-[20px] bg-white p-4 hairline"><p className="text-2xl font-medium tracking-[-0.03em]">{subs.length}</p><p className="text-xs text-muted">Total</p></div>
        <div className="rounded-[20px] bg-white p-4 hairline"><p className="text-2xl font-medium tracking-[-0.03em]">+{thisMonth}</p><p className="text-xs text-muted">This month</p></div>
      </div>
      {subs.length === 0 ? (
        <Empty title="No subscribers yet" icon={<Mail className="size-5" />} />
      ) : (
        <ul className="overflow-hidden rounded-[22px] bg-white hairline">
          {subs.map((s) => (
            <li key={s.id} className="flex items-center gap-3 border-b border-line px-5 py-3.5 last:border-0">
              <span className="grid size-9 place-items-center rounded-full bg-accent-soft text-accent"><Mail className="size-4" /></span>
              <span className="min-w-0 flex-1 truncate">{s.email}</span>
              <span className="hidden text-sm text-muted sm:block">{formatDate(s.createdAt)}</span>
              <DeleteSubscriber id={s.id} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
