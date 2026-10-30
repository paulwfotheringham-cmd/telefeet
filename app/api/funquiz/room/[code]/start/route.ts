import { NextResponse } from "next/server";
import { handleStoreError } from "@/lib/funquiz/api";
import { startGame, toClientState } from "@/lib/funquiz/game-logic";
import { normalizeRoomCode } from "@/lib/funquiz/room-code";
import { loadRoom, mutateRoomPersisted } from "@/lib/funquiz/store";

export const dynamic = "force-dynamic";

type Params = { params: { code: string } };

export async function POST(request: Request, { params }: Params) {
  try {
    const code = normalizeRoomCode(params.code ?? "");
    const body = (await request.json()) as { playerId?: string };
    const playerId = body.playerId?.trim();
    if (!code || !playerId) {
      return NextResponse.json({ error: "playerId required" }, { status: 400 });
    }

    const exists = await loadRoom(code);
    if (!exists) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }
    const room = await mutateRoomPersisted(code, (room) => startGame(room, playerId));
    return NextResponse.json({ state: toClientState(room, playerId) });
  } catch (err) {
    return handleStoreError(err);
  }
}
