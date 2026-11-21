import { NextResponse } from "next/server";
import { handleShowStoreError } from "@/lib/name-that-show/api";
import { submitShowAnswer, toShowClientState } from "@/lib/name-that-show/room";
import { isValidRoomCode, normalizeRoomCode } from "@/lib/funquiz/room-code";
import { mutateShowRoom } from "@/lib/name-that-show/store";

export const dynamic = "force-dynamic";

type Params = { params: { code: string } };

export async function POST(request: Request, { params }: Params) {
  try {
    const code = normalizeRoomCode(params.code ?? "");
    const body = (await request.json()) as { playerId?: string; choiceIndex?: unknown };
    const playerId = body.playerId?.trim();
    if (!isValidRoomCode(code) || !playerId) {
      return NextResponse.json({ error: "code and playerId required" }, { status: 400 });
    }
    const room = await mutateShowRoom(code, (current) =>
      submitShowAnswer(current, playerId, body.choiceIndex),
    );
    return NextResponse.json({ state: toShowClientState(room, playerId) });
  } catch (err) {
    return handleShowStoreError(err);
  }
}
