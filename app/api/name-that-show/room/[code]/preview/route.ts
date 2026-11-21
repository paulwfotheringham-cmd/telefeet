import { NextResponse } from "next/server";
import { handleShowStoreError } from "@/lib/name-that-show/api";
import { currentShowQuestion } from "@/lib/name-that-show/room";
import { lookupShowPreview } from "@/lib/name-that-show/preview";
import { isValidRoomCode, normalizeRoomCode } from "@/lib/funquiz/room-code";
import { loadShowRoom } from "@/lib/name-that-show/store";

export const dynamic = "force-dynamic";

type Params = { params: { code: string } };

export async function GET(request: Request, { params }: Params) {
  try {
    const code = normalizeRoomCode(params.code ?? "");
    const playerId = new URL(request.url).searchParams.get("playerId")?.trim();
    if (!isValidRoomCode(code) || !playerId) {
      return NextResponse.json({ error: "code and playerId required" }, { status: 400 });
    }
    const room = await loadShowRoom(code);
    if (!room || !room.players.some((player) => player.id === playerId)) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }
    const question = currentShowQuestion(room);
    if (!question) {
      return NextResponse.json(
        { previewUrl: null, turnIndex: room.turnIndex },
        { headers: { "Cache-Control": "no-store" } },
      );
    }
    const previewUrl = await lookupShowPreview(question.id);
    return NextResponse.json(
      { previewUrl, turnIndex: room.turnIndex },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (err) {
    return handleShowStoreError(err);
  }
}
