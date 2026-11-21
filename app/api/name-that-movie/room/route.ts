import { NextResponse } from "next/server";
import { handleMovieStoreError } from "@/lib/name-that-movie/api";
import {
  createMovieRoom,
  generateMovieRoomCode,
  toMovieClientState,
} from "@/lib/name-that-movie/room";
import { loadMovieRoom, persistNewMovieRoom } from "@/lib/name-that-movie/store";
import { isMovieDifficulty } from "@/lib/name-that-movie/types";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      playerId?: string;
      playerName?: string;
      difficulty?: string;
    };
    const playerId = body.playerId?.trim();
    const playerName = body.playerName?.trim();
    const difficulty = body.difficulty?.trim() ?? "";
    if (!playerId || !playerName) {
      return NextResponse.json({ error: "playerId and playerName required" }, { status: 400 });
    }
    if (!isMovieDifficulty(difficulty)) {
      return NextResponse.json({ error: "difficulty required" }, { status: 400 });
    }

    let code = generateMovieRoomCode();
    for (let attempt = 0; attempt < 8; attempt++) {
      const existing = await loadMovieRoom(code);
      if (!existing) break;
      code = generateMovieRoomCode();
    }

    const room = await persistNewMovieRoom(createMovieRoom(playerId, playerName, code, difficulty));
    return NextResponse.json({ state: toMovieClientState(room, playerId) });
  } catch (err) {
    return handleMovieStoreError(err);
  }
}
