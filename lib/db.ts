import "server-only";
import { promises as fs } from "fs";
import path from "path";
import type { Database } from "./types";
import { createSeed } from "./seed";

/**
 * Tiny JSON document store.
 *
 * - Lives at $DATA_DIR/db.json (default ./data/db.json), seeded on first run.
 * - Writes are serialised through a promise queue and written atomically
 *   (tmp file + rename) so a crash never leaves half-written JSON.
 *
 * It is intentionally isolated behind `readDb` / `mutate` so it can be
 * swapped for Postgres / Supabase / Mongo without touching any UI code.
 */

export const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "db.json");
export const UPLOAD_DIR = path.join(DATA_DIR, "uploads");

let cache: { db: Database; mtime: number } | null = null;
let queue: Promise<unknown> = Promise.resolve();

async function ensure(): Promise<void> {
  try {
    await fs.access(DB_FILE);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await write(createSeed());
  }
}

async function write(db: Database) {
  const tmp = `${DB_FILE}.${process.pid}.${Date.now()}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(db, null, 2), "utf8");
  await fs.rename(tmp, DB_FILE);
  const stat = await fs.stat(DB_FILE);
  cache = { db, mtime: stat.mtimeMs };
}

export async function readDb(): Promise<Database> {
  await ensure();
  const stat = await fs.stat(DB_FILE);
  if (cache && cache.mtime === stat.mtimeMs) return cache.db;
  const raw = await fs.readFile(DB_FILE, "utf8");
  const parsed = JSON.parse(raw) as Database;
  // forward-fill any keys added to the seed after the file was created
  const seed = createSeed();
  const db = { ...seed, ...parsed } as Database;
  db.appearance = { ...seed.appearance, ...parsed.appearance, intro: { ...seed.appearance.intro, ...parsed.appearance?.intro } };
  db.settings = { ...seed.settings, ...parsed.settings };
  db.home = { ...seed.home, ...parsed.home, proof: { ...seed.home.proof, ...parsed.home?.proof } };
  cache = { db, mtime: stat.mtimeMs };
  return db;
}

/** Run a mutation against the database. Mutations are serialised. */
export function mutate<T>(fn: (db: Database) => T | Promise<T>): Promise<T> {
  const run = queue.then(async () => {
    const db = structuredClone(await readDb());
    const result = await fn(db);
    await write(db);
    return result;
  });
  queue = run.catch(() => undefined);
  return run;
}

export async function resetDb() {
  return mutate((db) => {
    Object.assign(db, createSeed());
  });
}
