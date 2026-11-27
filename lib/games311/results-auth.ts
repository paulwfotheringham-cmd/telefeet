import { createHash, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export const RESULTS_COOKIE = "games311_results_auth";

export function resultsPasswordConfigured(): boolean {
  return Boolean(process.env.GAMES311_RESULTS_PASSWORD?.trim());
}

export function resultsAuthToken(password = process.env.GAMES311_RESULTS_PASSWORD || ""): string {
  const secret = process.env.GAMES311_RESULTS_SECRET?.trim() || password;
  return createHash("sha256").update(`games311-results-v1:${password}:${secret}`).digest("hex");
}

export function verifyResultsPassword(candidate: string): boolean {
  const expected = process.env.GAMES311_RESULTS_PASSWORD?.trim() || "";
  if (!expected || !candidate) return false;
  const a = Buffer.from(candidate);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function verifyResultsCookie(value: string | undefined | null): boolean {
  if (!value || !resultsPasswordConfigured()) return false;
  const expected = resultsAuthToken();
  try {
    const a = Buffer.from(value);
    const b = Buffer.from(expected);
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function isResultsAuthenticated(): boolean {
  const jar = cookies();
  return verifyResultsCookie(jar.get(RESULTS_COOKIE)?.value);
}
