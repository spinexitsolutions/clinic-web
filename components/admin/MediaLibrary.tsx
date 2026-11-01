"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, ImagePlus, Trash2, Upload } from "lucide-react";
import { deleteMedia } from "@/app/admin/actions";
import { cn } from "@/lib/utils";
import { ConfirmButton, Empty, PageHeader, Spinner, useAction, useToast } from "./ui";
import { uploadImage } from "./fields";

type File_ = { name: string; url: string; size: number; at: string };

export function MediaLibrary({ files }: { files: File_[] }) {
  const router = useRouter();
  const toast = useToast();
  const { run } = useAction();
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [drag, setDrag] = useState(false);

  const upload = async (list: FileList | null) => {
    if (!list?.length) return;
    setBusy(true);
    let ok = 0;
    for (const f of Array.from(list)) {
      try {
        await uploadImage(f);
        ok++;
      } catch (e) {
        toast("error", `${f.name}: ${e instanceof Error ? e.message : "failed"}`);
      }
    }
    setBusy(false);
    if (ok) toast("ok", `${ok} image${ok > 1 ? "s" : ""} uploaded`);
    router.refresh();
  };

  return (
    <div>
      <PageHeader
        eyebrow="Content"
        title="Media"
        description="Upload images once and reuse them anywhere — paste the URL into any image field."
        actions={
          <button className="btn btn-primary" onClick={() => ref.current?.click()} disabled={busy}>
            {busy ? <Spinner /> : <Upload className="size-4" />} Upload images
          </button>
        }
      />
      <input ref={ref} type="file" accept="image/*" multiple hidden onChange={(e) => upload(e.target.files)} />

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          upload(e.dataTransfer.files);
        }}
        className={cn("mb-6 grid place-items-center rounded-[22px] border-2 border-dashed px-6 py-10 text-center transition", drag ? "border-accent bg-accent-soft" : "border-line")}
      >
        <ImagePlus className="mb-2 size-6 text-muted" />
        <p className="text-sm font-medium">Drop images here</p>
        <p className="text-xs text-muted">JPG, PNG, WebP, GIF, AVIF or SVG · up to 5MB each</p>
      </div>

      {files.length === 0 ? (
        <Empty title="No uploads yet" text="Stock imagery is loaded from Unsplash. Upload your own clinic photos to replace it." />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {files.map((f) => (
            <figure key={f.name} className="group overflow-hidden rounded-[20px] bg-white hairline">
              <div className="relative aspect-square bg-black/[0.03]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={f.url} alt="" className="absolute inset-0 size-full object-cover" loading="lazy" />
                <div className="absolute inset-x-2 bottom-2 flex gap-1.5 opacity-100 transition md:opacity-0 md:group-hover:opacity-100">
                  <button
                    onClick={() => {
                      navigator.clipboard?.writeText(f.url);
                      toast("ok", "URL copied");
                    }}
                    className="glass flex h-9 flex-1 items-center justify-center gap-1.5 rounded-full text-xs font-medium"
                  >
                    <Copy className="size-3.5" /> Copy URL
                  </button>
                  <ConfirmButton className="glass grid h-9 min-w-9 place-items-center rounded-full px-2 text-xs text-rose-600" confirmLabel="Delete?" onConfirm={() => run(() => deleteMedia(f.name), () => router.refresh())}>
                    <Trash2 className="size-3.5" />
                  </ConfirmButton>
                </div>
              </div>
              <figcaption className="px-3 py-2">
                <p className="truncate text-xs font-medium">{f.name}</p>
                <p className="font-mono text-[10px] text-muted">{(f.size / 1024).toFixed(0)} KB</p>
              </figcaption>
            </figure>
          ))}
        </div>
      )}
    </div>
  );
}
