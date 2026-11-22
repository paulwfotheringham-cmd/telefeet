import { NextResponse } from "next/server";
import { bearerToken, recordScore } from "@/lib/funquiz/club";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = (await request.json()) as { game?: string; roomCode?: string; score?: number; won?: boolean };
  const result = await recordScore(bearerToken(request), {
    game: body.game ?? "",
    roomCode: body.roomCode ?? "",
    score: Number(body.score),
    won: Boolean(body.won),
  });
  if ("error" in result && result.error) return NextResponse.json({ error: result.error }, { status: result.status });
  return NextResponse.json({ ok: true });
}
