import { NextResponse } from "next/server";
import { handleStoreError } from "@/lib/funquiz/api";
import {
  blockbustersApplyAction,
  type BlockbustersAction,
} from "@/lib/funquiz/blockbusters/logic";
import { toClientState } from "@/lib/funquiz/game-logic";
import { normalizeRoomCode } from "@/lib/funquiz/room-code";
import { mutateRoomPersisted } from "@/lib/funquiz/store";

export const dynamic = "force-dynamic";

type Params = { params: { code: string } };

type Body = {
  playerId?: string;
  action?: string;
  cellId?: number;
  choiceIndex?: number;
};

function isAction(value: string): value is BlockbustersAction {
  return value === "pick" || value === "answer";
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

    const room = await mutateRoomPersisted(code, (room) =>
      blockbustersApplyAction(
        room,
        playerId,
        action,
        body.cellId,
        body.choiceIndex,
      ),
    );

    return NextResponse.json({ state: toClientState(room, playerId) });
  } catch (err) {
    return handleStoreError(err);
  }
}
