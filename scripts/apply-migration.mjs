/**
 * Applies supabase/migrations/20250417000000_profiles.sql using either:
 * 1) DATABASE_URL + pg (Settings → Database → connection string), or
 * 2) SUPABASE_ACCESS_TOKEN (https://supabase.com/dashboard/account/tokens) + Management API
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pg from "pg";
import { loadEnvLocal } from "./load-env.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

loadEnvLocal();

const migrationFile = path.join(
  root,
  "supabase",
  "migrations",
  "20250417000000_profiles.sql",
);

const sql = fs.readFileSync(migrationFile, "utf8");

function projectRefFromUrl() {
  const u = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const m = u.match(/https?:\/\/([^.]+)\.supabase\.co/);
  return m ? m[1] : null;
}

async function applyViaPg() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) return false;
  const client = new pg.Client({
    connectionString: databaseUrl,
    ssl: databaseUrl.includes("supabase")
      ? { rejectUnauthorized: false }
      : undefined,
  });
  await client.connect();
  try {
    await client.query(sql);
  } finally {
    await client.end();
  }
  console.log("[apply-migration] OK (DATABASE_URL):", migrationFile);
  return true;
}

async function applyViaManagementApi() {
  const token = process.env.SUPABASE_ACCESS_TOKEN;
  const ref = projectRefFromUrl();
  if (!token || !ref) return false;

  const res = await fetch(
    `https://api.supabase.com/v1/projects/${ref}/database/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: sql, read_only: false }),
    },
  );

  const text = await res.text();
  if (!res.ok) {
    console.error("[apply-migration] Management API error:", res.status, text);
    process.exit(1);
  }
  console.log("[apply-migration] OK (SUPABASE_ACCESS_TOKEN):", migrationFile);
  return true;
}

if (await applyViaPg()) {
  process.exit(0);
}
if (await applyViaManagementApi()) {
  process.exit(0);
}

console.error(`
[apply-migration] No way to run SQL automatically.

Add ONE of these to .env.local:

  A) DATABASE_URL=postgresql://postgres.[ref]:[YOUR-DB-PASSWORD]@...  (Supabase → Settings → Database → URI)

  B) SUPABASE_ACCESS_TOKEN=sbp_...  (https://supabase.com/dashboard/account/tokens)

Then run: npm run db:migrate

Or run the SQL file manually:
  https://supabase.com/dashboard/project/${projectRefFromUrl() || "YOUR_REF"}/sql/new
`);
process.exit(1);
