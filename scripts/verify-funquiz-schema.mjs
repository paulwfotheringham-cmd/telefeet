/**
 * Read-only check that Fun Quiz tables exist (Management API or pg).
 */
import pg from "pg";
import { loadEnvLocal } from "./load-env.mjs";

loadEnvLocal();

const verifySql = `
SELECT
  to_regclass('public.funquiz_rooms') AS funquiz_rooms,
  to_regclass('public.funquiz_players') AS funquiz_players;
`;

function projectRefFromUrl() {
  const u = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const m = u.match(/https?:\/\/([^.]+)\.supabase\.co/);
  return m ? m[1] : null;
}

async function viaPg() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) return null;
  const client = new pg.Client({
    connectionString: databaseUrl,
    ssl: databaseUrl.includes("supabase") ? { rejectUnauthorized: false } : undefined,
  });
  await client.connect();
  try {
    return await client.query(verifySql);
  } finally {
    await client.end();
  }
}

async function viaApi() {
  const token = process.env.SUPABASE_ACCESS_TOKEN;
  const ref = projectRefFromUrl();
  if (!token || !ref) return null;
  const res = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: verifySql, read_only: true }),
  });
  const text = await res.text();
  if (!res.ok) {
    console.error("[verify-funquiz-schema] API error:", res.status, text.slice(0, 200));
    process.exit(1);
  }
  const body = JSON.parse(text);
  const row = Array.isArray(body) ? body[0] : body?.result?.[0] ?? body?.[0];
  return { rows: [row] };
}

const pgResult = await viaPg();
const result = pgResult ?? (await viaApi());
if (!result?.rows?.[0]) {
  console.error(
    "[verify-funquiz-schema] Need DATABASE_URL or SUPABASE_ACCESS_TOKEN + NEXT_PUBLIC_SUPABASE_URL",
  );
  process.exit(1);
}

const row = result.rows[0];
const ok = Boolean(row.funquiz_rooms && row.funquiz_players);
console.log("[verify-funquiz-schema]", {
  funquiz_rooms: row.funquiz_rooms ? "present" : "missing",
  funquiz_players: row.funquiz_players ? "present" : "missing",
});
process.exit(ok ? 0 : 1);
