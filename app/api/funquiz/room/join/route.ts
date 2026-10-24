import { NextResponse } from "next/server";
import { handleStoreError } from "@/lib/funquiz/api";
import { addPlayer, tickRoom, toClientState } from "@/lib/funquiz/game-logic";
import { loadRoom, persistJoinedPlayer } from "@/lib/funquiz/store";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      code?: string;
      playerId?: string;
      playerName?: string;
    };
    const code = body.code?.trim().toUpperCase();
    const playerId = body.playerId?.trim();
    const playerName = body.playerName?.trim();
    if (!code || !playerId || !playerName) {
      return NextResponse.json(
        { error: "code, playerId and playerName required" },
        { status: 400 },
      );
    }

    let room = await loadRoom(code);
    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }
    room = tickRoom(room);
    room = addPlayer(room, playerId, playerName);
    await persistJoinedPlayer(room, playerId);
    return NextResponse.json({ state: toClientState(room, playerId) });
  } catch (err) {
    return handleStoreError(err);
  }
}
