import { NextResponse } from "next/server";
import { handleStoreError } from "@/lib/funquiz/api";
import { toClientState } from "@/lib/funquiz/game-logic";
import {
  dealNewHand,
  holdemApplyAction,
  type HoldemAction,
} from "@/lib/funquiz/holdem/logic";
import { normalizeRoomCode } from "@/lib/funquiz/room-code";
import { mutateRoomPersisted } from "@/lib/funquiz/store";

export const dynamic = "force-dynamic";

type Params = { params: { code: string } };

type Body = {
  playerId?: string;
  action?: string;
  raiseTo?: number;
};

function isAction(value: string): value is HoldemAction | "deal" {
  return (
    value === "fold" ||
    value === "check" ||
    value === "call" ||
    value === "raise" ||
    value === "all_in" ||
    value === "deal"
  );
}

export async function POST(request: Request, { params }: Params) {
  try {
    const code = normalizeRoomCode(params.code ?? "");
    const body = (await request.json()) as Body;
    const playerId = body.playerId?.trim();
    const action = body.action?.trim() ?? "";
    if (!code || !playerId || !isAction(action)) {
      return NextResponse.json({ error: "playerId and valid action required" }, { status: 400 });
    }

    const room = await mutateRoomPersisted(code, (room) => {
      if (action === "deal") {
        if (playerId !== room.hostId) {
          throw new Error("Only the host can deal");
        }
        if (!room.holdem || room.holdem.street !== "hand_over") {
          throw new Error("Deal is only available between hands");
        }
        return dealNewHand(room);
      }
      return holdemApplyAction(room, playerId, action, body.raiseTo);
    });

    return NextResponse.json({ state: toClientState(room, playerId) });
  } catch (err) {
    return handleStoreError(err);
  }
}
