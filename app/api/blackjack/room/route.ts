import { NextResponse } from "next/server";
import { handleBlackjackStoreError } from "@/lib/blackjack/room-api";
import {
  createBlackjackRoom,
  generateBlackjackRoomCode,
  toBlackjackClientState,
} from "@/lib/blackjack/room";
import { loadBlackjackRoom, persistNewBlackjackRoom } from "@/lib/blackjack/room-store";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      playerId?: string;
      playerName?: string;
    };
    const playerId = body.playerId?.trim();
    const playerName = body.playerName?.trim();
    if (!playerId || !playerName) {
      return NextResponse.json({ error: "playerId and playerName required" }, { status: 400 });
    }

    let code = generateBlackjackRoomCode();
    for (let attempt = 0; attempt < 8; attempt++) {
      const existing = await loadBlackjackRoom(code);
      if (!existing) break;
      code = generateBlackjackRoomCode();
    }

    const room = await persistNewBlackjackRoom(createBlackjackRoom(playerId, playerName, code));
    return NextResponse.json({ state: toBlackjackClientState(room, playerId) });
  } catch (err) {
    return handleBlackjackStoreError(err);
  }
}
