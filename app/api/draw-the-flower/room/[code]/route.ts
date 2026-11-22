import { NextResponse } from "next/server";
import { handleDrawStoreError } from "@/lib/draw-the-flower/api";
import { toDrawClientState } from "@/lib/draw-the-flower/room";
import { isValidRoomCode, normalizeRoomCode } from "@/lib/funquiz/room-code";
import { DrawRoomConflictError, loadDrawRoom, saveTickedDrawRoom } from "@/lib/draw-the-flower/store";

export const dynamic = "force-dynamic";

type Params = { params: { code: string } };

export async function GET(request: Request, { params }: Params) {
  try {
    const code = normalizeRoomCode(params.code ?? "");
    const playerId = new URL(request.url).searchParams.get("playerId")?.trim();
    if (!isValidRoomCode(code) || !playerId) {
      return NextResponse.json({ error: "code and playerId required" }, { status: 400 });
    }
    const initial = await loadDrawRoom(code);
    if (!initial) return NextResponse.json({ error: "Room not found" }, { status: 404 });
    let room = initial;
    try {
      room = await saveTickedDrawRoom(code);
    } catch (err) {
      if (!(err instanceof DrawRoomConflictError)) throw err;
      const latest = await loadDrawRoom(code);
      if (!latest) return NextResponse.json({ error: "Room not found" }, { status: 404 });
      room = latest;
    }
    return NextResponse.json(
      { state: toDrawClientState(room, playerId) },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (err) {
    return handleDrawStoreError(err);
  }
}
