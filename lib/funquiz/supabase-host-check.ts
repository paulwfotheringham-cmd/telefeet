import dns from "node:dns/promises";

export function supabaseProjectRefFromUrl(url: string | undefined): string | null {
  if (!url) return null;
  const m = url.match(/https?:\/\/([^.]+)\.supabase\.co/);
  return m ? m[1] : null;
}

export async function checkSupabaseHostReachable(
  url: string | undefined,
): Promise<{ ok: boolean; ref: string | null; reason?: string }> {
  const ref = supabaseProjectRefFromUrl(url);
  if (!ref) {
    return { ok: false, ref: null, reason: "invalid_supabase_url" };
  }
  const host = `${ref}.supabase.co`;
  try {
    await dns.lookup(host);
    const res = await fetch(`https://${host}/auth/v1/health`, {
      signal: AbortSignal.timeout(8000),
    });
    // Live Supabase projects return 401 here without an apikey; edge is still up.
    if (res.status === 401 || res.ok) {
      return { ok: true, ref };
    }
    if (res.status === 404 || res.status >= 500) {
      return { ok: false, ref, reason: `health_http_${res.status}` };
    }
    return { ok: false, ref, reason: `health_http_${res.status}` };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "lookup_failed";
    if (msg.includes("ENOTFOUND") || msg.includes("getaddrinfo")) {
      return { ok: false, ref, reason: "project_host_not_found" };
    }
    return { ok: false, ref, reason: msg };
  }
}
