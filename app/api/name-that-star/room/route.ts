import { NextResponse } from "next/server";
import { handleMovieStoreError } from "@/lib/name-that-star/api";
import {
  createMovieRoom,
  generateMovieRoomCode,
  toMovieClientState,
} from "@/lib/name-that-star/room";
import { loadMovieRoom, persistNewMovieRoom } from "@/lib/name-that-star/store";
import { isMovieDifficulty, isMoviePlayMode } from "@/lib/name-that-star/types";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      playerId?: string;
      playerName?: string;
      difficulty?: string;
      mode?: string;
    };
    const playerId = body.playerId?.trim();
    const playerName = body.playerName?.trim();
    const difficulty = body.difficulty?.trim() ?? "";
    const mode = body.mode?.trim() ?? "";
    if (!playerId || !playerName) {
      return NextResponse.json({ error: "playerId and playerName required" }, { status: 400 });
    }
    if (!isMovieDifficulty(difficulty)) {
      return NextResponse.json({ error: "difficulty required" }, { status: 400 });
    }
    if (!isMoviePlayMode(mode)) {
      return NextResponse.json({ error: "mode required" }, { status: 400 });
    }

    let code = generateMovieRoomCode();
    for (let attempt = 0; attempt < 8; attempt++) {
      const existing = await loadMovieRoom(code);
      if (!existing) break;
      code = generateMovieRoomCode();
    }

    const room = await persistNewMovieRoom(
      createMovieRoom(playerId, playerName, code, difficulty, mode),
    );
    return NextResponse.json({ state: toMovieClientState(room, playerId) });
  } catch (err) {
    return handleMovieStoreError(err);
  }
}
