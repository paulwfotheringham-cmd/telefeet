import { NextResponse } from "next/server";
import { handleStoreError } from "@/lib/funquiz/api";
import { tickRoom, toClientState } from "@/lib/funquiz/game-logic";
import { loadRoom, saveRoom } from "@/lib/funquiz/store";

export const dynamic = "force-dynamic";

type Params = { params: { code: string } };

export async function GET(request: Request, { params }: Params) {
  try {
    const code = params.code?.trim().toUpperCase();
    const { searchParams } = new URL(request.url);
    const playerId = searchParams.get("playerId")?.trim();
    if (!code || !playerId) {
      return NextResponse.json({ error: "code and playerId required" }, { status: 400 });
    }

    let room = await loadRoom(code);
    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }
    const phaseBefore = room.phase;
    const indexBefore = room.questionIndex;
    room = tickRoom(room);
    if (room.phase !== phaseBefore || room.questionIndex !== indexBefore) {
      await saveRoom(room);
    }
    return NextResponse.json({ state: toClientState(room, playerId) });
  } catch (err) {
    return handleStoreError(err);
  }
}
