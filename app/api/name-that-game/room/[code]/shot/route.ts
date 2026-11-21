import { NextResponse } from "next/server";
import { handleGameStoreError } from "@/lib/name-that-game/api";
import { currentGameQuestion } from "@/lib/name-that-game/room";
import { loadGameShot } from "@/lib/name-that-game/shot";
import { isValidRoomCode, normalizeRoomCode } from "@/lib/funquiz/room-code";
import { loadGameRoom } from "@/lib/name-that-game/store";

export const dynamic = "force-dynamic";
export const maxDuration = 20;

type Params = { params: { code: string } };

export async function GET(request: Request, { params }: Params) {
  try {
    const code = normalizeRoomCode(params.code ?? "");
    const url = new URL(request.url);
    const playerId = url.searchParams.get("playerId")?.trim();
    const turn = Number(url.searchParams.get("turn"));
    if (!isValidRoomCode(code) || !playerId) {
      return NextResponse.json({ error: "code and playerId required" }, { status: 400 });
    }
    const room = await loadGameRoom(code);
    if (!room || !room.players.some((player) => player.id === playerId)) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }
    const question = currentGameQuestion(room);
    if (!question || !Number.isInteger(turn) || turn !== room.turnIndex) {
      return NextResponse.json({ error: "No screenshot for this turn" }, { status: 404 });
    }
    const shot = await loadGameShot(question.id);
    if ("error" in shot) {
      console.error(`name-that-game shot ${question.id}: ${shot.error}`);
      return NextResponse.json({ error: "Screenshot unavailable" }, { status: 404 });
    }
    return new NextResponse(Buffer.from(shot.bytes), {
      headers: {
        "Content-Type": shot.mime,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (err) {
    return handleGameStoreError(err);
  }
}
