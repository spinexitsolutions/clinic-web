import { promises as fs } from "fs";
import path from "path";
import { UPLOAD_DIR } from "@/lib/db";
import { MediaLibrary } from "@/components/admin/MediaLibrary";

export const dynamic = "force-dynamic";

export default async function MediaPage() {
  let names: string[] = [];
  try {
    names = await fs.readdir(UPLOAD_DIR);
  } catch {}
  const files = (
    await Promise.all(
      names
        .filter((n) => /\.(jpe?g|png|webp|gif|avif|svg)$/i.test(n))
        .map(async (name) => {
          const st = await fs.stat(path.join(UPLOAD_DIR, name));
          return { name, url: `/api/media/${name}`, size: st.size, at: st.mtime.toISOString() };
        }),
    )
  ).sort((a, b) => b.at.localeCompare(a.at));
  return <MediaLibrary files={files} />;
}
