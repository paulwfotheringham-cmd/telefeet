import { NextResponse } from "next/server";
import { handleStoreError } from "@/lib/funquiz/api";
import { catchphraseApplyAction, type CatchphraseAction } from "@/lib/funquiz/catchphrase/logic";
import { toClientState } from "@/lib/funquiz/game-logic";
import { normalizeRoomCode } from "@/lib/funquiz/room-code";
import { mutateRoomPersisted } from "@/lib/funquiz/store";

export const dynamic = "force-dynamic";

type Params = { params: { code: string } };

type Body = {
  playerId?: string;
  action?: string;
  guess?: string;
};

function isAction(value: string): value is CatchphraseAction {
  return value === "buzz" || value === "guess" || value === "pass";
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
      catchphraseApplyAction(room, playerId, action, body.guess),
    );

    return NextResponse.json({ state: toClientState(room, playerId) });
  } catch (err) {
    return handleStoreError(err);
  }
}
