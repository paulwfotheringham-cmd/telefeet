import { NextResponse } from "next/server";
import { handleBlackjackStoreError } from "@/lib/blackjack/room-api";
import { applyBlackjackRoomAction, toBlackjackClientState } from "@/lib/blackjack/room";
import type { BlackjackAction } from "@/lib/blackjack/types";
import { isValidRoomCode, normalizeRoomCode } from "@/lib/funquiz/room-code";
import { mutateBlackjackRoom } from "@/lib/blackjack/room-store";

export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: { params: { code: string } }) {
  try {
    const code = normalizeRoomCode(params.code ?? "");
    const body = (await request.json()) as {
      playerId?: string;
      action?: BlackjackAction;
      chip?: number;
    };
    const playerId = body.playerId?.trim();
    if (!playerId || !body.action) {
      return NextResponse.json({ error: "playerId and action required" }, { status: 400 });
    }
    if (!isValidRoomCode(code)) {
      return NextResponse.json({ error: "Invalid room code" }, { status: 400 });
    }
    // SELECT_CHIP is client-local; ignore if sent, or apply via setSelectedChipGlobal on server.
    if (body.action.type === "SELECT_CHIP" && typeof body.action.amount === "number") {
      const { setSelectedChipGlobal } = await import("@/lib/blackjack/engine");
      setSelectedChipGlobal(body.action.amount);
    }
    if (typeof body.chip === "number") {
      const { setSelectedChipGlobal } = await import("@/lib/blackjack/engine");
      setSelectedChipGlobal(body.chip);
    }
    const room = await mutateBlackjackRoom(code, (current) =>
      applyBlackjackRoomAction(current, playerId, body.action!),
    );
    return NextResponse.json({ state: toBlackjackClientState(room, playerId) });
  } catch (err) {
    return handleBlackjackStoreError(err);
  }
}
