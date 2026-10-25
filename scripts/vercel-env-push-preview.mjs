/**
 * Push FunQuiz Supabase env vars to Vercel Preview only (from process.env or .env.local).
 * Requires: VERCEL_TOKEN or logged-in `npx vercel`, and Supabase keys in environment.
 */
import { spawnSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import { loadEnvLocal } from "./load-env.mjs";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
loadEnvLocal();

const keys = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
];

for (const k of keys) {
  const v = process.env[k];
  if (!v) {
    console.error(`Missing ${k} (set in environment or .env.local)`);
    process.exit(1);
  }
}

for (const k of keys) {
  const v = process.env[k];
  const r = spawnSync("npx", ["vercel", "env", "add", k, "preview", "--force", "--yes"], {
    cwd: root,
    input: `${v}\n`,
    encoding: "utf8",
    shell: true,
    env: process.env,
  });
  if (r.status !== 0) {
    console.error(r.stderr || r.stdout);
    process.exit(r.status ?? 1);
  }
  console.log(`[vercel-env] preview ${k}`);
}

console.log("[vercel-env] Preview vars set. Redeploy the PR preview in Vercel for them to take effect.");
