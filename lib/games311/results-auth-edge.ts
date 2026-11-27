/** Edge-safe cookie verification (Web Crypto). Keep in sync with results-auth.ts token formula. */

export const RESULTS_COOKIE = "games311_results_auth";

export async function resultsAuthTokenEdge(
  password = process.env.GAMES311_RESULTS_PASSWORD || "",
): Promise<string> {
  const secret = process.env.GAMES311_RESULTS_SECRET?.trim() || password;
  const data = new TextEncoder().encode(`games311-results-v1:${password}:${secret}`);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(hash)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function verifyResultsCookieEdge(value: string | undefined | null): Promise<boolean> {
  const password = process.env.GAMES311_RESULTS_PASSWORD?.trim() || "";
  if (!password || !value) return false;
  const expected = await resultsAuthTokenEdge(password);
  if (expected.length !== value.length) return false;
  let ok = 0;
  for (let i = 0; i < expected.length; i++) {
    ok |= expected.charCodeAt(i) ^ value.charCodeAt(i);
  }
  return ok === 0;
}
