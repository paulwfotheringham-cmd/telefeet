import { NextResponse } from "next/server";
import { handleGameStoreError } from "@/lib/name-that-game/api";
import { addGamePlayer, toGameClientState } from "@/lib/name-that-game/room";
import { isValidRoomCode, normalizeRoomCode } from "@/lib/funquiz/room-code";
import { loadGameRoom, mutateGameRoom } from "@/lib/name-that-game/store";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      code?: string;
      playerId?: string;
      playerName?: string;
    };
    const code = normalizeRoomCode(body.code ?? "");
    const playerId = body.playerId?.trim();
    const playerName = body.playerName?.trim();
    if (!playerId || !playerName) {
      return NextResponse.json({ error: "code, playerId and playerName required" }, { status: 400 });
    }
    if (!isValidRoomCode(code)) {
      return NextResponse.json(
        { error: "Invalid room code. Enter 6 letters or numbers." },
        { status: 400 },
      );
    }
    const exists = await loadGameRoom(code);
    if (!exists) {
      return NextResponse.json(
        { error: "Room not found. Check the code with your friend, or ask them to create a new room." },
        { status: 404 },
      );
    }
    const room = await mutateGameRoom(code, (current) => addGamePlayer(current, playerId, playerName));
    return NextResponse.json({ state: toGameClientState(room, playerId) });
  } catch (err) {
    return handleGameStoreError(err);
  }
}
