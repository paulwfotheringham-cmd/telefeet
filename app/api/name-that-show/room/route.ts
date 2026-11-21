import { NextResponse } from "next/server";
import { handleShowStoreError } from "@/lib/name-that-show/api";
import { createShowRoom, generateShowRoomCode, toShowClientState } from "@/lib/name-that-show/room";
import { loadShowRoom, persistNewShowRoom } from "@/lib/name-that-show/store";
import { isShowEra, isShowPlayMode } from "@/lib/name-that-show/types";

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
    if (!isShowEra(era)) {
      return NextResponse.json({ error: "era required" }, { status: 400 });
    }
    if (!isShowPlayMode(mode)) {
      return NextResponse.json({ error: "mode required" }, { status: 400 });
    }

    let code = generateShowRoomCode();
    for (let attempt = 0; attempt < 8; attempt++) {
      const existing = await loadShowRoom(code);
      if (!existing) break;
      code = generateShowRoomCode();
    }

    const room = await persistNewShowRoom(createShowRoom(playerId, playerName, code, era, mode));
    return NextResponse.json({ state: toShowClientState(room, playerId) });
  } catch (err) {
    return handleShowStoreError(err);
  }
}
