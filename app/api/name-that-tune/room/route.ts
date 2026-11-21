import { NextResponse } from "next/server";
import { handleTuneStoreError } from "@/lib/name-that-tune/api";
import { createTuneRoom, generateTuneRoomCode, toTuneClientState } from "@/lib/name-that-tune/room";
import { loadTuneRoom, persistNewTuneRoom } from "@/lib/name-that-tune/store";
import { isTuneEra, isTunePlayMode } from "@/lib/name-that-tune/types";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      playerId?: string;
      playerName?: string;
      era?: string;
      mode?: string;
    };
    const playerId = body.playerId?.trim();
    const playerName = body.playerName?.trim();
    const era = body.era?.trim() ?? "";
    const mode = body.mode?.trim() ?? "";
    if (!playerId || !playerName) {
      return NextResponse.json({ error: "playerId and playerName required" }, { status: 400 });
    }
    if (!isTuneEra(era)) {
      return NextResponse.json({ error: "era required" }, { status: 400 });
    }
    if (!isTunePlayMode(mode)) {
      return NextResponse.json({ error: "mode required" }, { status: 400 });
    }

    let code = generateTuneRoomCode();
    for (let attempt = 0; attempt < 8; attempt++) {
      const existing = await loadTuneRoom(code);
      if (!existing) break;
      code = generateTuneRoomCode();
    }

    const room = await persistNewTuneRoom(createTuneRoom(playerId, playerName, code, era, mode));
    return NextResponse.json({ state: toTuneClientState(room, playerId) });
  } catch (err) {
    return handleTuneStoreError(err);
  }
}
