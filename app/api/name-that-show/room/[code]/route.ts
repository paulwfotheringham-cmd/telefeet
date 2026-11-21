import { NextResponse } from "next/server";
import { handleShowStoreError } from "@/lib/name-that-show/api";
import { toShowClientState } from "@/lib/name-that-show/room";
import { isValidRoomCode, normalizeRoomCode } from "@/lib/funquiz/room-code";
import { ShowRoomConflictError, loadShowRoom, saveTickedShowRoom } from "@/lib/name-that-show/store";

export const dynamic = "force-dynamic";

type Params = { params: { code: string } };

export async function GET(request: Request, { params }: Params) {
  try {
    const code = normalizeRoomCode(params.code ?? "");
    const playerId = new URL(request.url).searchParams.get("playerId")?.trim();
    if (!isValidRoomCode(code) || !playerId) {
      return NextResponse.json({ error: "code and playerId required" }, { status: 400 });
    }
    const initial = await loadShowRoom(code);
    if (!initial) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }
    let room = initial;
    try {
      room = await saveTickedShowRoom(code);
    } catch (err) {
      if (!(err instanceof ShowRoomConflictError)) throw err;
      const latest = await loadShowRoom(code);
      if (!latest) {
        return NextResponse.json({ error: "Room not found" }, { status: 404 });
      }
      room = latest;
    }
    return NextResponse.json(
      { state: toShowClientState(room, playerId) },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (err) {
    return handleShowStoreError(err);
  }
}
