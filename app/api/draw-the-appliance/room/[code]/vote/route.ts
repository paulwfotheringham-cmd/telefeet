import { NextResponse } from "next/server";
import { handleDrawStoreError } from "@/lib/draw-the-appliance/api";
import { submitVote, toDrawClientState } from "@/lib/draw-the-appliance/room";
import { isValidRoomCode, normalizeRoomCode } from "@/lib/funquiz/room-code";
import { mutateDrawRoom } from "@/lib/draw-the-appliance/store";

export const dynamic = "force-dynamic";

type Params = { params: { code: string } };

export async function POST(request: Request, { params }: Params) {
  try {
    const code = normalizeRoomCode(params.code ?? "");
    const body = (await request.json()) as { playerId?: string; choice?: string };
    const playerId = body.playerId?.trim();
    const choice = body.choice?.trim() ?? "";
    if (!isValidRoomCode(code) || !playerId || !choice) {
      return NextResponse.json({ error: "code, playerId and choice required" }, { status: 400 });
    }
    const room = await mutateDrawRoom(code, (current) => submitVote(current, playerId, choice));
    return NextResponse.json({ state: toDrawClientState(room, playerId) });
  } catch (err) {
    return handleDrawStoreError(err);
  }
}
