import { mkdir, readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { PGlite } from "@electric-sql/pglite";
import pg from "pg";

const databaseUrl = process.env.DATABASE_URL?.trim() ?? "";
/** Local file DB so `npm run collect` and `npm run dev` share the same data. */
const localDataDir =
  process.env.PGLITE_DATA_DIR?.trim() ||
  path.join(process.cwd(), ".data", "pglite");

let pool: pg.Pool | undefined;
let local: Promise<PGlite> | undefined;

export async function sql<T = Record<string, unknown>>(
  text: string,
  params: unknown[] = [],
): Promise<T[]> {
  if (databaseUrl !== "") {
    pool ??= new pg.Pool({ connectionString: databaseUrl, max: 5 });
    return (await pool.query(text, params)).rows as T[];
  }
  local ??= startLocal().catch((error: unknown) => {
    local = undefined;
    throw error;
  });
  return (await (await local).query<T>(text, params)).rows;
}

async function startLocal(): Promise<PGlite> {
  await mkdir(localDataDir, { recursive: true });
  const db = new PGlite(localDataDir);
  const migrationsDir = path.join(process.cwd(), "migrations");
  const files = (await readdir(migrationsDir).catch(() => []))
    .filter((f) => f.endsWith(".sql"))
    .sort();
  for (const file of files) {
    await db.exec(await readFile(path.join(migrationsDir, file), "utf8"));
  }
  return db;
}
