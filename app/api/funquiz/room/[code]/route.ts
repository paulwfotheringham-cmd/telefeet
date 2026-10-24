import { NextResponse } from "next/server";
import { handleStoreError } from "@/lib/funquiz/api";
import { tickRoom, toClientState } from "@/lib/funquiz/game-logic";
import { loadRoom, mutateRoomPersisted } from "@/lib/funquiz/store";

export const dynamic = "force-dynamic";

type Params = { params: { code: string } };

export async function GET(request: Request, { params }: Params) {
  try {
    const code = params.code?.trim().toUpperCase();
    const { searchParams } = new URL(request.url);
    const playerId = searchParams.get("playerId")?.trim();
    if (!code || !playerId) {
      return NextResponse.json({ error: "code and playerId required" }, { status: 400 });
    }

    const initial = await loadRoom(code);
    if (!initial) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }
    let room = initial;
    if (initial.phase !== "lobby") {
      room = await mutateRoomPersisted(code, (r) => tickRoom(r));
    } else {
      room = tickRoom(room);
    }
    return NextResponse.json(
      { state: toClientState(room, playerId) },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (err) {
    return handleStoreError(err);
  }
}
