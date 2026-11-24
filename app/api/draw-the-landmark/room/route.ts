import { NextResponse } from "next/server";
import { handleDrawStoreError } from "@/lib/draw-the-landmark/api";
import { createDrawRoom, generateDrawRoomCode, toDrawClientState } from "@/lib/draw-the-landmark/room";
import { loadDrawRoom, persistNewDrawRoom } from "@/lib/draw-the-landmark/store";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { playerId?: string; playerName?: string; mode?: string };
    const playerId = body.playerId?.trim();
    const playerName = body.playerName?.trim();
    if (!playerId || !playerName) {
      return NextResponse.json({ error: "playerId and playerName required" }, { status: 400 });
    }
    let code = generateDrawRoomCode();
    for (let attempt = 0; attempt < 8; attempt++) {
      if (!(await loadDrawRoom(code))) break;
      code = generateDrawRoomCode();
    }
    const mode = body.mode === "single" || body.mode === "together" ? body.mode : "separate";
    const room = await persistNewDrawRoom(createDrawRoom(playerId, playerName, code, mode));
    return NextResponse.json({ state: toDrawClientState(room, playerId) });
  } catch (err) {
    return handleDrawStoreError(err);
  }
}
