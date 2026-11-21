import { NextResponse } from "next/server";
import { handleGameStoreError } from "@/lib/name-that-game/api";
import { createGameRoom, generateGameRoomCode, toGameClientState } from "@/lib/name-that-game/room";
import { loadGameRoom, persistNewGameRoom } from "@/lib/name-that-game/store";
import { isGameEra, isGameLevel, isGamePlayMode } from "@/lib/name-that-game/types";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      playerId?: string;
      playerName?: string;
      era?: string;
      mode?: string;
      level?: string;
    };
    const playerId = body.playerId?.trim();
    const playerName = body.playerName?.trim();
    const era = body.era?.trim() ?? "";
    const mode = body.mode?.trim() ?? "";
    const level = body.level?.trim() ?? "";
    if (!playerId || !playerName) {
      return NextResponse.json({ error: "playerId and playerName required" }, { status: 400 });
    }
    if (!isGameEra(era)) {
      return NextResponse.json({ error: "era required" }, { status: 400 });
    }
    if (!isGamePlayMode(mode)) {
      return NextResponse.json({ error: "mode required" }, { status: 400 });
    }
    if (!isGameLevel(level)) {
      return NextResponse.json({ error: "level required" }, { status: 400 });
    }

    let code = generateGameRoomCode();
    for (let attempt = 0; attempt < 8; attempt++) {
      const existing = await loadGameRoom(code);
      if (!existing) break;
      code = generateGameRoomCode();
    }

    const room = await persistNewGameRoom(createGameRoom(playerId, playerName, code, era, mode, level));
    return NextResponse.json({ state: toGameClientState(room, playerId) });
  } catch (err) {
    return handleGameStoreError(err);
  }
}
