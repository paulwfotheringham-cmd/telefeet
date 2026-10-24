import assert from "node:assert/strict";
import dns from "node:dns/promises";
import { checkSupabaseHostReachable } from "../lib/funquiz/supabase-host-check";

const originalFetch = globalThis.fetch;
const originalLookup = dns.lookup;

async function withMocks(
  lookupImpl: typeof dns.lookup,
  fetchImpl: typeof fetch,
  fn: () => Promise<void>,
) {
  (dns as { lookup: typeof dns.lookup }).lookup = lookupImpl;
  globalThis.fetch = fetchImpl;
  try {
    await fn();
  } finally {
    (dns as { lookup: typeof dns.lookup }).lookup = originalLookup;
    globalThis.fetch = originalFetch;
  }
}

async function run() {
  await withMocks(
    async () => ({ address: "127.0.0.1", family: 4 }),
    async () => new Response("ok", { status: 200 }),
    async () => {
      const r = await checkSupabaseHostReachable("https://abc123.supabase.co");
      assert.equal(r.ok, true);
      assert.equal(r.ref, "abc123");
    },
  );

  await withMocks(
    async () => ({ address: "127.0.0.1", family: 4 }),
    async () => new Response(JSON.stringify({ message: "No API key" }), { status: 401 }),
    async () => {
      const r = await checkSupabaseHostReachable("https://abc123.supabase.co");
      assert.equal(r.ok, true, "401 without apikey means host is live");
    },
  );

  await withMocks(
    async () => ({ address: "127.0.0.1", family: 4 }),
    async () => new Response("missing", { status: 404 }),
    async () => {
      const r = await checkSupabaseHostReachable("https://abc123.supabase.co");
      assert.equal(r.ok, false);
      assert.equal(r.reason, "health_http_404");
    },
  );

  await withMocks(
    async () => ({ address: "127.0.0.1", family: 4 }),
    async () => new Response("error", { status: 503 }),
    async () => {
      const r = await checkSupabaseHostReachable("https://abc123.supabase.co");
      assert.equal(r.ok, false);
      assert.equal(r.reason, "health_http_503");
    },
  );

  await withMocks(
    async () => {
      const err = new Error("getaddrinfo ENOTFOUND deadref.supabase.co");
      (err as NodeJS.ErrnoException).code = "ENOTFOUND";
      throw err;
    },
    async () => new Response("ok", { status: 200 }),
    async () => {
      const r = await checkSupabaseHostReachable("https://deadref.supabase.co");
      assert.equal(r.ok, false);
      assert.equal(r.reason, "project_host_not_found");
    },
  );
}

run()
  .then(() => console.log("supabase-host-check mock tests OK"))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
