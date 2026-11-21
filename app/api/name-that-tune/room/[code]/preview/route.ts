import { NextResponse } from "next/server";
import { handleTuneStoreError } from "@/lib/name-that-tune/api";
import { currentTuneQuestion } from "@/lib/name-that-tune/room";
import { lookupTunePreview } from "@/lib/name-that-tune/preview";
import { isValidRoomCode, normalizeRoomCode } from "@/lib/funquiz/room-code";
import { loadTuneRoom } from "@/lib/name-that-tune/store";

export const dynamic = "force-dynamic";

type Params = { params: { code: string } };

export async function GET(request: Request, { params }: Params) {
  try {
    const code = normalizeRoomCode(params.code ?? "");
    const playerId = new URL(request.url).searchParams.get("playerId")?.trim();
    if (!isValidRoomCode(code) || !playerId) {
      return NextResponse.json({ error: "code and playerId required" }, { status: 400 });
    }
    const room = await loadTuneRoom(code);
    if (!room || !room.players.some((player) => player.id === playerId)) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }
    const question = currentTuneQuestion(room);
    if (!question) {
      return NextResponse.json(
        { previewUrl: null, turnIndex: room.turnIndex },
        { headers: { "Cache-Control": "no-store" } },
      );
    }
    const previewUrl = await lookupTunePreview(question.id);
    return NextResponse.json(
      { previewUrl, turnIndex: room.turnIndex },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (err) {
    return handleTuneStoreError(err);
  }
}
