/**
 * Deploys to Vercel with build-time env from .env.local (-b flags for remote Next.js build).
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
  "NEXT_PUBLIC_ROOT_DOMAIN",
];

const args = ["vercel", "deploy", "--prod", "--yes"];

for (const k of keys) {
  const v = process.env[k];
  if (!v) {
    console.error(`Missing ${k} in .env.local`);
    process.exit(1);
  }
  args.push("-b", `${k}=${v}`);
}

const r = spawnSync("npx", args, {
  stdio: "inherit",
  shell: true,
  cwd: root,
});

process.exit(r.status ?? 1);
