import { NextResponse } from "next/server";
import { handleGameStoreError } from "@/lib/name-that-game/api";
import { startGameGame, toGameClientState } from "@/lib/name-that-game/room";
import { isValidRoomCode, normalizeRoomCode } from "@/lib/funquiz/room-code";
import { mutateGameRoom } from "@/lib/name-that-game/store";

export const dynamic = "force-dynamic";

type Params = { params: { code: string } };

export async function POST(request: Request, { params }: Params) {
  try {
    const code = normalizeRoomCode(params.code ?? "");
    const body = (await request.json()) as { playerId?: string };
    const playerId = body.playerId?.trim();
    if (!isValidRoomCode(code) || !playerId) {
      return NextResponse.json({ error: "code and playerId required" }, { status: 400 });
    }
    const room = await mutateGameRoom(code, (current) => startGameGame(current, playerId));
    return NextResponse.json({ state: toGameClientState(room, playerId) });
  } catch (err) {
    return handleGameStoreError(err);
  }
}
