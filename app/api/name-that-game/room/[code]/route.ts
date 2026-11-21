import { NextResponse } from "next/server";
import { handleGameStoreError } from "@/lib/name-that-game/api";
import { toGameClientState } from "@/lib/name-that-game/room";
import { isValidRoomCode, normalizeRoomCode } from "@/lib/funquiz/room-code";
import { GameRoomConflictError, loadGameRoom, saveTickedGameRoom } from "@/lib/name-that-game/store";

export const dynamic = "force-dynamic";

type Params = { params: { code: string } };

export async function GET(request: Request, { params }: Params) {
  try {
    const code = normalizeRoomCode(params.code ?? "");
    const playerId = new URL(request.url).searchParams.get("playerId")?.trim();
    if (!isValidRoomCode(code) || !playerId) {
      return NextResponse.json({ error: "code and playerId required" }, { status: 400 });
    }
    const initial = await loadGameRoom(code);
    if (!initial) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }
    let room = initial;
    try {
      room = await saveTickedGameRoom(code);
    } catch (err) {
      if (!(err instanceof GameRoomConflictError)) throw err;
      const latest = await loadGameRoom(code);
      if (!latest) {
        return NextResponse.json({ error: "Room not found" }, { status: 404 });
      }
      room = latest;
    }
    return NextResponse.json(
      { state: toGameClientState(room, playerId) },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (err) {
    return handleGameStoreError(err);
  }
}
