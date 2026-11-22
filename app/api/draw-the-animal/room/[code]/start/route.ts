import { NextResponse } from "next/server";
import { markWeeklyRoom } from "@/lib/funquiz/club";
import { mulberry32, weekSeed, weeklyGame } from "@/lib/funquiz/weekly";
import { handleDrawStoreError } from "@/lib/draw-the-animal/api";
import { startDrawGame, toDrawClientState } from "@/lib/draw-the-animal/room";
import { isValidRoomCode, normalizeRoomCode } from "@/lib/funquiz/room-code";
import { mutateDrawRoom } from "@/lib/draw-the-animal/store";

export const dynamic = "force-dynamic";

type Params = { params: { code: string } };

export async function POST(request: Request, { params }: Params) {
  try {
    const code = normalizeRoomCode(params.code ?? "");
    const body = (await request.json()) as { playerId?: string; weekly?: boolean };
    const playerId = body.playerId?.trim();
    if (!isValidRoomCode(code) || !playerId) {
      return NextResponse.json({ error: "code and playerId required" }, { status: 400 });
    }
    const weekly = body.weekly === true && weeklyGame().path === "/draw-the-animal";
    const rng = weekly ? mulberry32(weekSeed("/draw-the-animal")) : Math.random;
    const room = await mutateDrawRoom(code, (current) => startDrawGame(current, playerId, rng));
    if (weekly) await markWeeklyRoom(code, weeklyGame().title);
    return NextResponse.json({ state: toDrawClientState(room, playerId) });
  } catch (err) {
    return handleDrawStoreError(err);
  }
}
