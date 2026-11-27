import { NextResponse } from "next/server";
import { handleBlackjackStoreError } from "@/lib/blackjack/room-api";
import { toBlackjackClientState } from "@/lib/blackjack/room";
import { isValidRoomCode, normalizeRoomCode } from "@/lib/funquiz/room-code";
import { loadBlackjackRoom } from "@/lib/blackjack/room-store";

export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: { code: string } }) {
  try {
    const code = normalizeRoomCode(params.code ?? "");
    const url = new URL(request.url);
    const playerId = url.searchParams.get("playerId")?.trim();
    if (!playerId) {
      return NextResponse.json({ error: "playerId required" }, { status: 400 });
    }
    if (!isValidRoomCode(code)) {
      return NextResponse.json({ error: "Invalid room code" }, { status: 400 });
    }
    const room = await loadBlackjackRoom(code);
    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }
    return NextResponse.json({ state: toBlackjackClientState(room, playerId) });
  } catch (err) {
    return handleBlackjackStoreError(err);
  }
}
