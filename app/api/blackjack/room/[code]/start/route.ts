import { NextResponse } from "next/server";
import { handleBlackjackStoreError } from "@/lib/blackjack/room-api";
import { startBlackjackRoom, toBlackjackClientState } from "@/lib/blackjack/room";
import { isValidRoomCode, normalizeRoomCode } from "@/lib/funquiz/room-code";
import { mutateBlackjackRoom } from "@/lib/blackjack/room-store";

export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: { params: { code: string } }) {
  try {
    const code = normalizeRoomCode(params.code ?? "");
    const body = (await request.json()) as { playerId?: string };
    const playerId = body.playerId?.trim();
    if (!playerId) {
      return NextResponse.json({ error: "playerId required" }, { status: 400 });
    }
    if (!isValidRoomCode(code)) {
      return NextResponse.json({ error: "Invalid room code" }, { status: 400 });
    }
    const room = await mutateBlackjackRoom(code, (current) => startBlackjackRoom(current, playerId));
    return NextResponse.json({ state: toBlackjackClientState(room, playerId) });
  } catch (err) {
    return handleBlackjackStoreError(err);
  }
}
