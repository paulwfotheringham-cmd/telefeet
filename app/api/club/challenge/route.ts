import { NextResponse } from "next/server";
import { bearerToken, createChallenge } from "@/lib/funquiz/club";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = (await request.json()) as { toId?: string; game?: string; path?: string; roomCode?: string };
  const result = await createChallenge(bearerToken(request), {
    toId: body.toId ?? "",
    game: body.game ?? "",
    path: body.path ?? "",
    roomCode: body.roomCode ?? "",
  });
  if ("error" in result && result.error) return NextResponse.json({ error: result.error }, { status: result.status });
  return NextResponse.json({ ok: true, roomCode: result.roomCode });
}
