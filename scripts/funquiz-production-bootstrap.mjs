/**
 * Provisions (or reuses) a dedicated Supabase project for Fun Quiz, applies the
 * funquiz migration, sets Vercel production/preview env on abstractartscouse, and
 * triggers a production deployment.
 *
 * Requires: SUPABASE_ACCESS_TOKEN, VERCEL_TOKEN
 * Does not print secret values.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { spawnSync } from "child_process";
import crypto from "crypto";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const FUNQUIZ_PROJECT_NAME = "telefeet-funquiz";
const VERCEL_PROJECT_NAME = "abstractartscouse";
const VERCEL_TEAM_SLUG = "paul-fs-projects-9f603a39";
const GIT_REPO = "paulwfotheringham-cmd/telefeet";
const GIT_REF = "main";

const migrationFile = path.join(
  root,
  "supabase",
  "migrations",
  "20251018230000_funquiz.sql",
);
const migrationSql = fs.readFileSync(migrationFile, "utf8");

const supabaseToken = process.env.SUPABASE_ACCESS_TOKEN;
const vercelToken = process.env.VERCEL_TOKEN;

function fail(msg) {
  console.error(`[funquiz-bootstrap] ${msg}`);
  process.exit(1);
}

if (!supabaseToken) fail("Missing SUPABASE_ACCESS_TOKEN");
if (!vercelToken) fail("Missing VERCEL_TOKEN");

async function supabaseApi(pathname, init = {}) {
  const res = await fetch(`https://api.supabase.com/v1${pathname}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${supabaseToken}`,
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });
  const text = await res.text();
  let body;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }
  if (!res.ok) {
    console.error(
      `[funquiz-bootstrap] Supabase API ${pathname} failed:`,
      res.status,
      typeof body === "string" ? body.slice(0, 200) : JSON.stringify(body).slice(0, 400),
    );
    process.exit(1);
  }
  return body;
}

async function vercelApi(pathname, init = {}) {
  const url = pathname.includes("?")
    ? `https://api.vercel.com${pathname}&teamId=${encodeURIComponent(VERCEL_TEAM_SLUG)}`
    : `https://api.vercel.com${pathname}?teamId=${encodeURIComponent(VERCEL_TEAM_SLUG)}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${vercelToken}`,
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });
  const text = await res.text();
  let body;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }
  if (!res.ok) {
    console.error(
      `[funquiz-bootstrap] Vercel API failed:`,
      res.status,
      typeof body === "string" ? body.slice(0, 200) : JSON.stringify(body).slice(0, 400),
    );
    process.exit(1);
  }
  return body;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function pickOrCreateSupabaseProject() {
  const projects = await supabaseApi("/projects");
  const list = Array.isArray(projects) ? projects : projects?.projects || [];
  const dedicated = list.find(
    (p) =>
      p.name === FUNQUIZ_PROJECT_NAME ||
      p.name?.toLowerCase()?.includes("funquiz"),
  );
  if (dedicated?.id) {
    console.log("[funquiz-bootstrap] Using existing Supabase project:", dedicated.name);
    return dedicated;
  }

  const orgs = await supabaseApi("/organizations");
  const orgList = Array.isArray(orgs) ? orgs : orgs?.organizations || [];
  if (!orgList.length) fail("No Supabase organizations on this account");
  const orgId = orgList[0].id;

  const dbPass = crypto.randomBytes(24).toString("base64url");
  console.log("[funquiz-bootstrap] Creating Supabase project:", FUNQUIZ_PROJECT_NAME);
  const created = await supabaseApi("/projects", {
    method: "POST",
    body: JSON.stringify({
      organization_id: orgId,
      name: FUNQUIZ_PROJECT_NAME,
      db_pass: dbPass,
      region: "eu-west-2",
    }),
  });
  return created;
}

async function waitForSupabaseReady(ref, attempts = 60) {
  for (let i = 0; i < attempts; i++) {
    const p = await supabaseApi(`/projects/${ref}`);
    const status = p.status || p.project?.status;
    if (status === "ACTIVE_HEALTHY" || status === "ACTIVE") {
      console.log("[funquiz-bootstrap] Supabase project ready:", ref);
      return;
    }
    await sleep(5000);
  }
  fail(`Supabase project ${ref} did not become healthy in time`);
}

async function getSupabaseKeys(ref) {
  const keys = await supabaseApi(`/projects/${ref}/api-keys`);
  const list = Array.isArray(keys) ? keys : keys?.api_keys || keys || [];
  const anon = list.find((k) => k.name === "anon" || k.name === "anon key");
  const service = list.find((k) => k.name === "service_role" || k.name === "service_role key");
  if (!anon?.api_key || !service?.api_key) {
    fail("Could not read Supabase anon/service_role API keys from Management API");
  }
  const url = `https://${ref}.supabase.co`;
  return { url, anonKey: anon.api_key, serviceKey: service.api_key };
}

async function applyMigration(ref) {
  const res = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${supabaseToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: migrationSql, read_only: false }),
  });
  const text = await res.text();
  if (!res.ok) {
    console.error("[funquiz-bootstrap] Migration failed:", res.status, text.slice(0, 300));
    process.exit(1);
  }
  console.log("[funquiz-bootstrap] Migration applied on", ref);
}

async function findVercelProject() {
  const data = await vercelApi(`/v9/projects?search=${encodeURIComponent(VERCEL_PROJECT_NAME)}`);
  const projects = data.projects || [];
  const match =
    projects.find((p) => p.name === VERCEL_PROJECT_NAME) ||
    projects.find((p) => p.name?.includes("abstractartscouse"));
  if (!match?.id) fail(`Vercel project ${VERCEL_PROJECT_NAME} not found on team ${VERCEL_TEAM_SLUG}`);
  return match;
}

async function upsertVercelEnv(projectId, key, value, targets) {
  const existing = await vercelApi(`/v9/projects/${projectId}/env`);
  const envs = existing.envs || [];
  for (const e of envs.filter((x) => x.key === key)) {
    await vercelApi(`/v9/projects/${projectId}/env/${e.id}`, { method: "DELETE" });
  }
  await vercelApi(`/v10/projects/${projectId}/env`, {
    method: "POST",
    body: JSON.stringify({
      key,
      value,
      type: "encrypted",
      target: targets,
    }),
  });
  console.log("[funquiz-bootstrap] Vercel env set:", key, targets.join(","));
}

async function triggerProductionDeploy(projectId) {
  const body = {
    name: VERCEL_PROJECT_NAME,
    project: projectId,
    target: "production",
    gitSource: {
      type: "github",
      ref: GIT_REF,
      repo: GIT_REPO,
    },
  };
  try {
    const dep = await vercelApi("/v13/deployments", {
      method: "POST",
      body: JSON.stringify(body),
    });
    console.log("[funquiz-bootstrap] Deployment triggered:", dep.id || dep.url || "ok");
    return dep;
  } catch {
    /* fall through */
  }
  console.log("[funquiz-bootstrap] Falling back to empty git commit to trigger GitHub deploy");
  const r = spawnSync("git", ["commit", "--allow-empty", "-m", "chore: redeploy after Fun Quiz Supabase env"], {
    cwd: root,
    encoding: "utf8",
  });
  if (r.status !== 0 && !r.stderr?.includes("nothing to commit")) {
    console.error(r.stderr || r.stdout);
    process.exit(1);
  }
  const push = spawnSync("git", ["push", "origin", GIT_REF], { cwd: root, encoding: "utf8" });
  if (push.status !== 0) {
    console.error(push.stderr || push.stdout);
    process.exit(1);
  }
}

async function waitForHealth(url, attempts = 40) {
  const healthUrl = `${url.replace(/\/$/, "")}/api/funquiz/health`;
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(healthUrl, { cache: "no-store" });
      const json = await res.json();
      if (json.ok && json.db === "ready") {
        console.log("[funquiz-bootstrap] Production health ready");
        return true;
      }
      console.log("[funquiz-bootstrap] Health:", JSON.stringify({ ok: json.ok, db: json.db, hint: json.hint }));
    } catch (e) {
      console.log("[funquiz-bootstrap] Health fetch error:", e instanceof Error ? e.message : "unknown");
    }
    await sleep(15000);
  }
  return false;
}

async function main() {
  let project = await pickOrCreateSupabaseProject();
  const ref = project.ref || project.id;
  if (!ref) fail("Supabase project missing ref");
  await waitForSupabaseReady(ref);
  await applyMigration(ref);
  const { url, anonKey, serviceKey } = await getSupabaseKeys(ref);

  const vercelProject = await findVercelProject();
  const targets = ["production", "preview"];
  await upsertVercelEnv(vercelProject.id, "NEXT_PUBLIC_SUPABASE_URL", url, targets);
  await upsertVercelEnv(vercelProject.id, "NEXT_PUBLIC_SUPABASE_ANON_KEY", anonKey, targets);
  await upsertVercelEnv(vercelProject.id, "SUPABASE_SERVICE_ROLE_KEY", serviceKey, targets);
  await upsertVercelEnv(
    vercelProject.id,
    "NEXT_PUBLIC_ROOT_DOMAIN",
    "abstractartscouse.vercel.app",
    targets,
  );

  await triggerProductionDeploy(vercelProject.id);

  const ok = await waitForHealth("https://abstractartscouse.vercel.app");
  if (!ok) {
    console.error("[funquiz-bootstrap] Health did not report db:ready — check Vercel deployment logs");
    process.exit(1);
  }
  console.log("[funquiz-bootstrap] Done. Run two-browser E2E on /funquiz.");
}

main().catch((e) => {
  console.error("[funquiz-bootstrap]", e instanceof Error ? e.message : e);
  process.exit(1);
});
