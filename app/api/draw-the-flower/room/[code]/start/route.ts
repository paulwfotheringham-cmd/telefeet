import { NextResponse } from "next/server";
import { handleDrawStoreError } from "@/lib/draw-the-flower/api";
import { startDrawGame, toDrawClientState } from "@/lib/draw-the-flower/room";
import { isValidRoomCode, normalizeRoomCode } from "@/lib/funquiz/room-code";
import { mutateDrawRoom } from "@/lib/draw-the-flower/store";

export const dynamic = "force-dynamic";

type Params = { params: { code: string } };

export async function POST(request: Request, { params }: Params) {
  try {
    const code = normalizeRoomCode(params.code ?? "");
    const body = (await request.json()) as { playerId?: string };
    const playerId = body.playerId?.trim();
    if (!isValidRoomCode(code) || !playerId) {
      return NextResponse.json({ error: "code and playerId required" }, { status: 400 });
    }
    const room = await mutateDrawRoom(code, (current) => startDrawGame(current, playerId));
    return NextResponse.json({ state: toDrawClientState(room, playerId) });
  } catch (err) {
    return handleDrawStoreError(err);
  }
}
