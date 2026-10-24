import { NextResponse } from "next/server";
import { handleStoreError } from "@/lib/funquiz/api";
import {
  millionaireFinalizeTeamAnswer,
  millionaireLockAnswer,
  millionaireUseLifeline,
  millionaireWalkAway,
} from "@/lib/funquiz/millionaire/logic";
import type { MillionaireLifelineId } from "@/lib/funquiz/millionaire/config";
import { tickRoom, toClientState } from "@/lib/funquiz/game-logic";
import { loadRoom, saveRoom } from "@/lib/funquiz/store";

export const dynamic = "force-dynamic";

type Params = { params: { code: string } };

type Body =
  | { playerId?: string; action: "lock"; choiceIndex?: number }
  | { playerId?: string; action: "finalize"; choiceIndex?: number }
  | { playerId?: string; action: "walkaway" }
  | { playerId?: string; action: "lifeline"; lifeline?: string };

function isLifeline(value: string): value is MillionaireLifelineId {
  return value === "fifty_fifty" || value === "ask_team" || value === "change_question";
}

export async function POST(request: Request, { params }: Params) {
  try {
    const code = params.code?.trim().toUpperCase();
    const body = (await request.json()) as Body;
    const playerId = body.playerId?.trim();
    if (!code || !playerId || !body.action) {
      return NextResponse.json({ error: "playerId and action required" }, { status: 400 });
    }

    let room = await loadRoom(code);
    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }
    room = tickRoom(room);

    switch (body.action) {
      case "lock": {
        if (body.choiceIndex === undefined) {
          return NextResponse.json({ error: "choiceIndex required" }, { status: 400 });
        }
        room = millionaireLockAnswer(room, playerId, body.choiceIndex);
        break;
      }
      case "finalize": {
        if (body.choiceIndex === undefined) {
          return NextResponse.json({ error: "choiceIndex required" }, { status: 400 });
        }
        room = millionaireFinalizeTeamAnswer(room, playerId, body.choiceIndex);
        break;
      }
      case "walkaway":
        room = millionaireWalkAway(room, playerId);
        break;
      case "lifeline": {
        const lifeline = body.lifeline?.trim() ?? "";
        if (!isLifeline(lifeline)) {
          return NextResponse.json({ error: "Invalid lifeline" }, { status: 400 });
        }
        room = millionaireUseLifeline(room, playerId, lifeline);
        break;
      }
      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }

    await saveRoom(room);
    return NextResponse.json({ state: toClientState(room, playerId) });
  } catch (err) {
    return handleStoreError(err);
  }
}
