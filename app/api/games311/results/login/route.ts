import { NextResponse } from "next/server";
import {
  RESULTS_COOKIE,
  resultsAuthToken,
  resultsPasswordConfigured,
  verifyResultsPassword,
} from "@/lib/games311/results-auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!resultsPasswordConfigured()) {
    return NextResponse.json(
      { error: "Results password is not configured (GAMES311_RESULTS_PASSWORD)." },
      { status: 503 },
    );
  }
  const body = (await request.json().catch(() => ({}))) as { password?: string };
  const password = body.password || "";
  if (!verifyResultsPassword(password)) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set({
    name: RESULTS_COOKIE,
    value: resultsAuthToken(password),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  });
  return res;
}
