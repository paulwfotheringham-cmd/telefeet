import { NextResponse } from "next/server";
import { handleStoreError } from "@/lib/funquiz/api";
import { addPlayer, toClientState } from "@/lib/funquiz/game-logic";
import { isValidRoomCode, normalizeRoomCode } from "@/lib/funquiz/room-code";
import { loadRoom, mutateRoomPersisted } from "@/lib/funquiz/store";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      code?: string;
      playerId?: string;
      playerName?: string;
    };
    const code = normalizeRoomCode(body.code ?? "");
    const playerId = body.playerId?.trim();
    const playerName = body.playerName?.trim();
    if (!playerId || !playerName) {
      return NextResponse.json(
        { error: "code, playerId and playerName required" },
        { status: 400 },
      );
    }
    if (!isValidRoomCode(code)) {
      return NextResponse.json(
        {
          error:
            "Invalid room code. Enter 6 letters or numbers (spaces are OK — we strip them automatically).",
        },
        { status: 400 },
      );
    }

    const exists = await loadRoom(code);
    if (!exists) {
      return NextResponse.json(
        {
          error:
            "Room not found. Check the code with your friend, or ask them to create a new room.",
        },
        { status: 404 },
      );
    }

    const room = await mutateRoomPersisted(code, (room) =>
      addPlayer(room, playerId, playerName),
    );
    return NextResponse.json({ state: toClientState(room, playerId) });
  } catch (err) {
    return handleStoreError(err);
  }
}
