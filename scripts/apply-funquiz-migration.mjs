/**
 * Applies supabase/migrations/20251018230000_funquiz.sql
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
  "20251018230000_funquiz.sql",
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
    ssl: databaseUrl.includes("supabase") ? { rejectUnauthorized: false } : undefined,
  });
  await client.connect();
  try {
    await client.query(sql);
  } finally {
    await client.end();
  }
  console.log("[funquiz-migrate] OK (DATABASE_URL)");
  return true;
}

async function applyViaManagementApi() {
  const token = process.env.SUPABASE_ACCESS_TOKEN;
  const ref = projectRefFromUrl();
  if (!token || !ref) return false;
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
    console.error("[funquiz-migrate] Management API error:", res.status, text);
    process.exit(1);
  }
  console.log("[funquiz-migrate] OK (SUPABASE_ACCESS_TOKEN)");
  return true;
}

if (await applyViaPg()) process.exit(0);
if (await applyViaManagementApi()) process.exit(0);

console.error(`
[funquiz-migrate] Cannot apply SQL automatically.

Run ${migrationFile} in the Supabase SQL editor for your TeleFeet project, or add DATABASE_URL or SUPABASE_ACCESS_TOKEN to .env.local and re-run:

  npm run db:migrate:funquiz
`);
process.exit(1);
