"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowDown, ArrowUp, ExternalLink, Pencil, Plus, Search, Trash2 } from "lucide-react";
import type { CollectionKey } from "@/lib/types";
import { deleteCollectionItem, reorderCollection, saveCollectionItem } from "@/app/admin/actions";
import { Icon } from "@/components/site/Icon";
import { cn } from "@/lib/utils";
import { COLLECTION_CONFIG, type Ctx } from "./collections";
import { FormFields } from "./fields";
import { ConfirmButton, Drawer, Empty, PageHeader, Spinner, useAction } from "./ui";

type Item = Record<string, unknown> & { id: string };

function thumb(url: string) {
  return url.includes("images.unsplash.com") && !url.includes("?") ? `${url}?w=200&h=200&fit=crop&q=60` : url;
}

export function CollectionManager({ collection, items: initial, ctx }: { collection: CollectionKey; items: Item[]; ctx: Ctx }) {
  const cfg = COLLECTION_CONFIG[collection];
  const router = useRouter();
  const { pending, run } = useAction();
  const [items, setItems] = useState(initial);
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);

  // keep in sync after router.refresh()
  const [prev, setPrev] = useState(initial);
  if (prev !== initial) {
    setPrev(initial);
    setItems(initial);
  }

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter((i) => JSON.stringify(i).toLowerCase().includes(s));
  }, [items, q]);

  const move = (idx: number, d: number) => {
    const j = idx + d;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[idx], next[j]] = [next[j], next[idx]];
    setItems(next);
    run(() => reorderCollection(collection, next.map((i) => i.id)));
  };

  const save = () => {
    if (!editing) return;
    run(
      () => saveCollectionItem(collection, editing),
      () => {
        setEditing(null);
        router.refresh();
      },
    );
  };

  return (
    <div>
      <PageHeader
        eyebrow="Content"
        title={cfg.label}
        description={cfg.description}
        actions={
          <button className="btn btn-primary" onClick={() => setEditing(cfg.blank(ctx))}>
            <Plus className="size-4" /> New {cfg.singular}
          </button>
        }
      />

      <div className="mb-5 flex items-center gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Search ${cfg.label.toLowerCase()}…`} className="field h-11 pl-11 text-[15px]" />
        </div>
        <span className="eyebrow">{filtered.length} items</span>
      </div>

      {filtered.length === 0 ? (
        <Empty title={`No ${cfg.label.toLowerCase()} yet`} text={`Create your first ${cfg.singular} to see it here.`} icon={<Plus className="size-5" />} />
      ) : (
        <motion.ul layout className="overflow-hidden rounded-[22px] bg-white hairline">
          <AnimatePresence initial={false}>
            {filtered.map((item) => {
              const idx = items.findIndex((x) => x.id === item.id);
              const img = cfg.image?.(item);
              const ic = cfg.icon?.(item);
              const badge = cfg.badge?.(item);
              const href = cfg.previewHref?.(item);
              return (
                <motion.li
                  layout
                  key={item.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, height: 0 }}
                  className="group flex items-center gap-4 border-b border-line px-4 py-3.5 last:border-0 md:px-5"
                >
                  {img ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={thumb(img)} alt="" className="size-12 shrink-0 rounded-2xl object-cover md:size-14" />
                  ) : ic ? (
                    <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-accent-soft text-accent md:size-14">
                      <Icon name={ic} className="size-5" />
                    </span>
                  ) : (
                    <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-black/[0.04] font-mono text-xs text-muted md:size-14">{String(idx + 1).padStart(2, "0")}</span>
                  )}
                  <button className="min-w-0 flex-1 text-left" onClick={() => setEditing(structuredClone(item))}>
                    <div className="flex items-center gap-2">
                      <p className="truncate font-medium tracking-[-0.01em]">{cfg.title(item) || "Untitled"}</p>
                      {badge && <span className="shrink-0 rounded-full bg-accent-soft px-2 py-0.5 text-[10px] font-medium text-accent-deep">{badge}</span>}
                    </div>
                    <p className="mt-0.5 truncate text-sm text-muted">{cfg.subtitle(item, ctx)}</p>
                  </button>
                  <div className="flex shrink-0 items-center gap-0.5">
                    {cfg.sortable && !q && (
                      <div className="hidden items-center sm:flex">
                        <button onClick={() => move(idx, -1)} disabled={idx === 0} className="grid size-8 place-items-center rounded-full text-muted hover:bg-black/5 hover:text-ink disabled:opacity-20" aria-label="Move up">
                          <ArrowUp className="size-3.5" />
                        </button>
                        <button onClick={() => move(idx, 1)} disabled={idx === items.length - 1} className="grid size-8 place-items-center rounded-full text-muted hover:bg-black/5 hover:text-ink disabled:opacity-20" aria-label="Move down">
                          <ArrowDown className="size-3.5" />
                        </button>
                      </div>
                    )}
                    {href && (
                      <a href={href} target="_blank" className="hidden size-8 place-items-center rounded-full text-muted hover:bg-black/5 hover:text-ink sm:grid" aria-label="View on site">
                        <ExternalLink className="size-3.5" />
                      </a>
                    )}
                    <button onClick={() => setEditing(structuredClone(item))} className="grid size-9 place-items-center rounded-full text-muted hover:bg-black/5 hover:text-ink" aria-label="Edit">
                      <Pencil className="size-4" />
                    </button>
                  </div>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </motion.ul>
      )}

      <Drawer
        open={!!editing}
        onClose={() => setEditing(null)}
        wide
        title={editing?.id ? `Edit ${cfg.singular}` : `New ${cfg.singular}`}
        subtitle={editing?.id ? cfg.title(editing) : "Fill in the details below"}
        footer={
          <>
            {!!editing?.id && (
              <ConfirmButton
                className="btn btn-ghost mr-auto h-11 text-rose-600"
                confirmLabel="Tap again to delete"
                onConfirm={() =>
                  run(
                    () => deleteCollectionItem(collection, String(editing!.id)),
                    () => {
                      setEditing(null);
                      router.refresh();
                    },
                  )
                }
              >
                <Trash2 className="size-4" /> Delete
              </ConfirmButton>
            )}
            <button className="btn btn-ghost h-11" onClick={() => setEditing(null)}>
              Cancel
            </button>
            <button className={cn("btn btn-primary h-11")} onClick={save} disabled={pending}>
              {pending && <Spinner />} Save {cfg.singular}
            </button>
          </>
        }
      >
        {editing && <FormFields fields={cfg.fields(ctx)} values={editing} onChange={setEditing} />}
      </Drawer>
    </div>
  );
}
