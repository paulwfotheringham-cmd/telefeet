import { NextResponse } from "next/server";
import { handleMovieStoreError } from "@/lib/name-that-movie/api";
import { submitMovieAnswer, toMovieClientState } from "@/lib/name-that-movie/room";
import { isValidRoomCode, normalizeRoomCode } from "@/lib/funquiz/room-code";
import { mutateMovieRoom } from "@/lib/name-that-movie/store";

export const dynamic = "force-dynamic";

type Params = { params: { code: string } };

export async function POST(request: Request, { params }: Params) {
  try {
    const code = normalizeRoomCode(params.code ?? "");
    const body = (await request.json()) as { playerId?: string; choiceIndex?: unknown };
    const playerId = body.playerId?.trim();
    if (!isValidRoomCode(code) || !playerId) {
      return NextResponse.json({ error: "code and playerId required" }, { status: 400 });
    }
    const room = await mutateMovieRoom(code, (current) =>
      submitMovieAnswer(current, playerId, body.choiceIndex),
    );
    return NextResponse.json({ state: toMovieClientState(room, playerId) });
  } catch (err) {
    return handleMovieStoreError(err);
  }
}
