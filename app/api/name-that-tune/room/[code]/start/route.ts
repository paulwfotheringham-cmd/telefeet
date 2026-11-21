import { NextResponse } from "next/server";
import { handleTuneStoreError } from "@/lib/name-that-tune/api";
import { startTuneGame, toTuneClientState } from "@/lib/name-that-tune/room";
import { isValidRoomCode, normalizeRoomCode } from "@/lib/funquiz/room-code";
import { mutateTuneRoom } from "@/lib/name-that-tune/store";

export const dynamic = "force-dynamic";

type Params = { params: { code: string } };

export async function POST(request: Request, { params }: Params) {
  try {
    const code = normalizeRoomCode(params.code ?? "");
    const body = (await request.json()) as { playerId?: string };
    const playerId = body.playerId?.trim();
    if (!isValidRoomCode(code) || !playerId) {
      return NextResponse.json({ error: "code and playerId required" }, { status: 400 });
    }
    const room = await mutateTuneRoom(code, (current) => startTuneGame(current, playerId));
    return NextResponse.json({ state: toTuneClientState(room, playerId) });
  } catch (err) {
    return handleTuneStoreError(err);
  }
}
