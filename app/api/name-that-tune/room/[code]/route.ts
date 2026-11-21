import { NextResponse } from "next/server";
import { handleTuneStoreError } from "@/lib/name-that-tune/api";
import { toTuneClientState } from "@/lib/name-that-tune/room";
import { isValidRoomCode, normalizeRoomCode } from "@/lib/funquiz/room-code";
import { TuneRoomConflictError, loadTuneRoom, saveTickedTuneRoom } from "@/lib/name-that-tune/store";

export const dynamic = "force-dynamic";

type Params = { params: { code: string } };

export async function GET(request: Request, { params }: Params) {
  try {
    const code = normalizeRoomCode(params.code ?? "");
    const playerId = new URL(request.url).searchParams.get("playerId")?.trim();
    if (!isValidRoomCode(code) || !playerId) {
      return NextResponse.json({ error: "code and playerId required" }, { status: 400 });
    }
    const initial = await loadTuneRoom(code);
    if (!initial) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }
    let room = initial;
    try {
      room = await saveTickedTuneRoom(code);
    } catch (err) {
      if (!(err instanceof TuneRoomConflictError)) throw err;
      const latest = await loadTuneRoom(code);
      if (!latest) {
        return NextResponse.json({ error: "Room not found" }, { status: 404 });
      }
      room = latest;
    }
    return NextResponse.json(
      { state: toTuneClientState(room, playerId) },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (err) {
    return handleTuneStoreError(err);
  }
}
