import { NextResponse } from "next/server";
import { handleStoreError } from "@/lib/funquiz/api";
import { startGame, tickRoom, toClientState } from "@/lib/funquiz/game-logic";
import { loadRoom, saveRoom } from "@/lib/funquiz/store";

export const dynamic = "force-dynamic";

type Params = { params: { code: string } };

export async function POST(request: Request, { params }: Params) {
  try {
    const code = params.code?.trim().toUpperCase();
    const body = (await request.json()) as { playerId?: string };
    const playerId = body.playerId?.trim();
    if (!code || !playerId) {
      return NextResponse.json({ error: "playerId required" }, { status: 400 });
    }

    let room = await loadRoom(code);
    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }
    room = tickRoom(room);
    room = startGame(room, playerId);
    await saveRoom(room);
    return NextResponse.json({ state: toClientState(room, playerId) });
  } catch (err) {
    return handleStoreError(err);
  }
}
