import { NextResponse } from "next/server";
import { handleStoreError } from "@/lib/funquiz/api";
import { tickRoom, toClientState } from "@/lib/funquiz/game-logic";
import { isValidRoomCode, normalizeRoomCode } from "@/lib/funquiz/room-code";
import { QuizRoomConflictError, loadRoom, mutateRoomPersisted } from "@/lib/funquiz/store";

export const dynamic = "force-dynamic";

type Params = { params: { code: string } };

export async function GET(request: Request, { params }: Params) {
  try {
    const code = normalizeRoomCode(params.code ?? "");
    const { searchParams } = new URL(request.url);
    const playerId = searchParams.get("playerId")?.trim();
    if (!isValidRoomCode(code) || !playerId) {
      return NextResponse.json({ error: "code and playerId required" }, { status: 400 });
    }

    const initial = await loadRoom(code);
    if (!initial) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }
    // Idle polls must not write. Two players refreshing every second otherwise
    // lose the optimistic lock, the poll returns 409, and the screen sticks.
    const ticked = tickRoom(initial);
    let room = ticked;
    if (ticked !== initial) {
      try {
        room = await mutateRoomPersisted(code, (current) => tickRoom(current));
      } catch (err) {
        if (!(err instanceof QuizRoomConflictError)) throw err;
        const latest = await loadRoom(code);
        if (!latest) {
          return NextResponse.json({ error: "Room not found" }, { status: 404 });
        }
        room = latest;
      }
    }
    return NextResponse.json(
      { state: toClientState(room, playerId) },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (err) {
    return handleStoreError(err);
  }
}
