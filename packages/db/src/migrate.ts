import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import pg from "pg";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs/promises";

const { Pool } = pg;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const defaultMigrationsFolder = path.resolve(__dirname, "../migrations");

export async function runMigrations(migrationsFolder = defaultMigrationsFolder): Promise<void> {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL must be set to run migrations");
  }
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool);

  // Apply raw .sql files in lexical order. This avoids needing the drizzle-kit
  // metadata snapshots and works for the simple init migration shipped here.
  const files = (await fs.readdir(migrationsFolder))
    .filter((f) => f.endsWith(".sql"))
    .sort();

  await db.execute(`
    CREATE TABLE IF NOT EXISTS __cphub_migrations (
      id serial PRIMARY KEY,
      name text NOT NULL UNIQUE,
      applied_at timestamptz NOT NULL DEFAULT now()
    );
  `);

  for (const file of files) {
    const { rows } = await pool.query(
      "SELECT 1 FROM __cphub_migrations WHERE name = $1",
      [file],
    );
    if (rows.length > 0) continue;
    const sql = await fs.readFile(path.join(migrationsFolder, file), "utf8");
    await pool.query("BEGIN");
    try {
      await pool.query(sql);
      await pool.query("INSERT INTO __cphub_migrations(name) VALUES ($1)", [file]);
      await pool.query("COMMIT");
      console.log(`[migrate] applied ${file}`);
    } catch (err) {
      await pool.query("ROLLBACK");
      throw err;
    }
  }

  await pool.end();
}

// Allow running this file directly: `tsx src/migrate.ts`
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigrations().then(
    () => {
      console.log("[migrate] complete");
      process.exit(0);
    },
    (err) => {
      console.error("[migrate] failed", err);
      process.exit(1);
    },
  );
}
