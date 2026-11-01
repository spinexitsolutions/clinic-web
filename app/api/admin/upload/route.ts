import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { UPLOAD_DIR } from "@/lib/db";

const TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
  "image/svg+xml": "svg",
};

export async function POST(req: Request) {
  if (!(await getSession())) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "No file" }, { status: 400 });
  const ext = TYPES[file.type];
  if (!ext) return NextResponse.json({ error: "Only JPG, PNG, WebP, GIF, AVIF or SVG images" }, { status: 400 });
  if (file.size > 5 * 1024 * 1024) return NextResponse.json({ error: "Max file size is 5MB" }, { status: 400 });
  const base =
    path
      .basename(file.name, path.extname(file.name))
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "image";
  const name = `${base}-${Date.now().toString(36)}.${ext}`;
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  await fs.writeFile(path.join(UPLOAD_DIR, name), Buffer.from(await file.arrayBuffer()));
  return NextResponse.json({ url: `/api/media/${name}`, name });
}
