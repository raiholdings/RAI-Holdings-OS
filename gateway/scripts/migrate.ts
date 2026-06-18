// RAI LLMs Gateway — DB migration runner.
// Reads sql/schema.sql and applies it to $DATABASE_URL.
// Run: npm run migrate   (= node --import tsx scripts/migrate.ts)
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import pg from "pg";

const __dirname = dirname(fileURLToPath(import.meta.url));
const schemaPath = join(__dirname, "..", "sql", "schema.sql");

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("[migrate] DATABASE_URL is not set. Aborting.");
    process.exit(1);
  }

  const sql = readFileSync(schemaPath, "utf8");
  const client = new pg.Client({ connectionString: databaseUrl });

  try {
    await client.connect();
    console.log(`[migrate] connected. applying ${schemaPath} ...`);
    await client.query(sql);
    console.log("[migrate] schema applied successfully.");
  } catch (err) {
    console.error("[migrate] failed:", err instanceof Error ? err.message : err);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error("[migrate] unexpected error:", err);
  process.exit(1);
});
