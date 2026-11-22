import { NextResponse } from "next/server";
import { bearerToken, touchPresence } from "@/lib/funquiz/club";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = (await request.json()) as { path?: string; roomCode?: string };
  const result = await touchPresence(bearerToken(request), body.path ?? "", body.roomCode ?? "");
  if ("error" in result && result.error) return NextResponse.json({ error: result.error }, { status: result.status });
  return NextResponse.json({ ok: true });
}
