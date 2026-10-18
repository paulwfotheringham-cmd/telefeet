import { NextResponse } from "next/server";
import { handleStoreError } from "@/lib/funquiz/api";
import { submitAnswer, tickRoom, toClientState } from "@/lib/funquiz/game-logic";
import { loadRoom, saveRoom } from "@/lib/funquiz/store";

export const dynamic = "force-dynamic";

type Params = { params: { code: string } };

export async function POST(request: Request, { params }: Params) {
  try {
    const code = params.code?.trim().toUpperCase();
    const body = (await request.json()) as { playerId?: string; choiceIndex?: number };
    const playerId = body.playerId?.trim();
    const choiceIndex = body.choiceIndex;
    if (!code || !playerId || choiceIndex === undefined) {
      return NextResponse.json(
        { error: "playerId and choiceIndex required" },
        { status: 400 },
      );
    }

    let room = await loadRoom(code);
    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }
    room = tickRoom(room);
    room = submitAnswer(room, playerId, choiceIndex);
    await saveRoom(room);
    return NextResponse.json({ state: toClientState(room, playerId) });
  } catch (err) {
    return handleStoreError(err);
  }
}
