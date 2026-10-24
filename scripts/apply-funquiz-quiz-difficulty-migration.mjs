/**
 * Applies supabase/migrations/20251024260000_funquiz_quiz_difficulty.sql (idempotent).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pg from "pg";
import { loadEnvLocal } from "./load-env.mjs";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
loadEnvLocal();

const sql = fs.readFileSync(
  path.join(root, "supabase/migrations/20251024260000_funquiz_quiz_difficulty.sql"),
  "utf8",
);

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
  console.log("[quiz-difficulty-migrate] OK (DATABASE_URL)");
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
    console.error("[quiz-difficulty-migrate] Management API error:", res.status, text);
    process.exit(1);
  }
  console.log("[quiz-difficulty-migrate] OK (Management API)");
  return true;
}

async function main() {
  if (await applyViaPg()) return;
  if (await applyViaManagementApi()) return;
  console.error(
    "Set DATABASE_URL or SUPABASE_ACCESS_TOKEN + NEXT_PUBLIC_SUPABASE_URL to apply migration.",
  );
  process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
