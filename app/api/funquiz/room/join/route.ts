import { NextResponse } from "next/server";
import { handleStoreError } from "@/lib/funquiz/api";
import { addPlayer, toClientState } from "@/lib/funquiz/game-logic";
import { loadRoom, mutateRoomPersisted } from "@/lib/funquiz/store";

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

    const exists = await loadRoom(code);
    if (!exists) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    const room = await mutateRoomPersisted(code, (room) =>
      addPlayer(room, playerId, playerName),
    );
    return NextResponse.json({ state: toClientState(room, playerId) });
  } catch (err) {
    return handleStoreError(err);
  }
}
