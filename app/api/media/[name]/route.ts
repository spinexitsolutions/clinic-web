import { promises as fs } from "fs";
import path from "path";
import { UPLOAD_DIR } from "@/lib/db";

const MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  avif: "image/avif",
  svg: "image/svg+xml",
};

export async function GET(_: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const safe = path.basename(decodeURIComponent(name));
  const ext = safe.split(".").pop()?.toLowerCase() ?? "";
  if (!MIME[ext]) return new Response("Not found", { status: 404 });
  const file = path.join(UPLOAD_DIR, safe);
  if (!file.startsWith(path.resolve(UPLOAD_DIR) + path.sep)) return new Response("Not found", { status: 404 });
  try {
    const buf = await fs.readFile(file);
    return new Response(new Uint8Array(buf), {
      headers: {
        "Content-Type": MIME[ext],
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
        ...(ext === "svg" ? { "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'" } : {}),
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
