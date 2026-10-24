import { NextResponse } from "next/server";
import { handleStoreError } from "@/lib/funquiz/api";
import { createRoom, generateRoomCode, toClientState } from "@/lib/funquiz/game-logic";
import { loadRoom, persistNewRoom } from "@/lib/funquiz/store";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { playerId?: string; playerName?: string };
    const playerId = body.playerId?.trim();
    const playerName = body.playerName?.trim();
    if (!playerId || !playerName) {
      return NextResponse.json({ error: "playerId and playerName required" }, { status: 400 });
    }

    let code = generateRoomCode();
    for (let attempt = 0; attempt < 8; attempt++) {
      const existing = await loadRoom(code);
      if (!existing) break;
      code = generateRoomCode();
    }

    const room = createRoom(playerId, playerName, code);
    await persistNewRoom(room);
    return NextResponse.json({ state: toClientState(room, playerId) });
  } catch (err) {
    return handleStoreError(err);
  }
}
