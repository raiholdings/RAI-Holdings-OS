// Apply sql/schema.sql to $DATABASE_URL. Plain Node ESM — no tsx/TS at runtime.
import pg from "pg";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const schema = readFileSync(join(here, "..", "sql", "schema.sql"), "utf8");

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("migrate: DATABASE_URL not set");
  process.exit(1);
}

const client = new pg.Client({ connectionString: url });
try {
  await client.connect();
  await client.query(schema);
  console.log("migrate: schema applied ✓");
} catch (e) {
  console.error("migrate failed:", e instanceof Error ? e.message : e);
  process.exitCode = 1;
} finally {
  await client.end().catch(() => {});
}
