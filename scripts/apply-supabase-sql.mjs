/**
 * Apply one or more SQL files via DATABASE_URL or Supabase Management API.
 * Usage: node scripts/apply-supabase-sql.mjs path/to/a.sql path/to/b.sql
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pg from "pg";
import { loadEnvLocal } from "./load-env.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
loadEnvLocal();

const files = process.argv.slice(2).map((f) => (path.isAbsolute(f) ? f : path.join(root, f)));
if (files.length === 0) {
  console.error("Usage: node scripts/apply-supabase-sql.mjs <migration.sql> [...]");
  process.exit(1);
}

function projectRefFromUrl() {
  const u = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const m = u.match(/https?:\/\/([^.]+)\.supabase\.co/);
  return m ? m[1] : null;
}

async function runQuery(sql) {
  const databaseUrl = process.env.DATABASE_URL;
  if (databaseUrl) {
    const client = new pg.Client({
      connectionString: databaseUrl,
      ssl: databaseUrl.includes("supabase") ? { rejectUnauthorized: false } : undefined,
    });
    await client.connect();
    try {
      await client.query(sql);
    } finally {
      await client.end();
    }
    return "DATABASE_URL";
  }
  const token = process.env.SUPABASE_ACCESS_TOKEN;
  const ref = projectRefFromUrl();
  if (token && ref) {
    const res = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: sql, read_only: false }),
    });
    const text = await res.text();
    if (!res.ok) {
      throw new Error(`Management API ${res.status}: ${text}`);
    }
    return "SUPABASE_ACCESS_TOKEN";
  }
  throw new Error("Set DATABASE_URL or SUPABASE_ACCESS_TOKEN + NEXT_PUBLIC_SUPABASE_URL");
}

for (const file of files) {
  const sql = fs.readFileSync(file, "utf8");
  const via = await runQuery(sql);
  console.log(`[apply-sql] OK ${path.basename(file)} (${via})`);
}
