import { NextResponse } from "next/server";
import { handleTuneStoreError } from "@/lib/name-that-tune/api";
import { addTunePlayer, toTuneClientState } from "@/lib/name-that-tune/room";
import { isValidRoomCode, normalizeRoomCode } from "@/lib/funquiz/room-code";
import { loadTuneRoom, mutateTuneRoom } from "@/lib/name-that-tune/store";

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
    const exists = await loadTuneRoom(code);
    if (!exists) {
      return NextResponse.json(
        { error: "Room not found. Check the code with your friend, or ask them to create a new room." },
        { status: 404 },
      );
    }
    const room = await mutateTuneRoom(code, (current) => addTunePlayer(current, playerId, playerName));
    return NextResponse.json({ state: toTuneClientState(room, playerId) });
  } catch (err) {
    return handleTuneStoreError(err);
  }
}
