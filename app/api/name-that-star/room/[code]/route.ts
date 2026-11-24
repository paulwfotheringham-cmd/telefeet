import { NextResponse } from "next/server";
import { handleMovieStoreError } from "@/lib/name-that-star/api";
import { toMovieClientState } from "@/lib/name-that-star/room";
import { isValidRoomCode, normalizeRoomCode } from "@/lib/funquiz/room-code";
import { MovieRoomConflictError, loadMovieRoom, saveTickedMovieRoom } from "@/lib/name-that-star/store";

export const dynamic = "force-dynamic";

type Params = { params: { code: string } };

export async function GET(request: Request, { params }: Params) {
  try {
    const code = normalizeRoomCode(params.code ?? "");
    const playerId = new URL(request.url).searchParams.get("playerId")?.trim();
    if (!isValidRoomCode(code) || !playerId) {
      return NextResponse.json({ error: "code and playerId required" }, { status: 400 });
    }
    const initial = await loadMovieRoom(code);
    if (!initial) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }
    let room = initial;
    try {
      room = await saveTickedMovieRoom(code);
    } catch (err) {
      if (!(err instanceof MovieRoomConflictError)) throw err;
      const latest = await loadMovieRoom(code);
      if (!latest) {
        return NextResponse.json({ error: "Room not found" }, { status: 404 });
      }
      room = latest;
    }
    return NextResponse.json(
      { state: toMovieClientState(room, playerId) },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (err) {
    return handleMovieStoreError(err);
  }
}
