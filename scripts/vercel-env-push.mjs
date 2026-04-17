/**
 * Pushes .env.local keys into Vercel (production + preview) for CI/GitHub deploys.
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

for (const envName of ["production", "preview"]) {
  for (const k of keys) {
    const v = process.env[k];
    if (!v) {
      console.error(`Missing ${k}`);
      process.exit(1);
    }
    const r = spawnSync(
      "npx",
      ["vercel", "env", "add", k, envName, "--yes"],
      {
        cwd: root,
        input: `${v}\n`,
        encoding: "utf8",
        shell: true,
      },
    );
    if (r.status !== 0) {
      console.error(r.stderr || r.stdout);
      process.exit(r.status ?? 1);
    }
    console.log(`[vercel-env] ${envName} ${k}`);
  }
}

console.log("[vercel-env] done");
