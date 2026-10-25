import { NextResponse } from "next/server";
import { handleStoreError } from "@/lib/funquiz/api";
import {
  millionaireFinalizeTeamAnswer,
  millionaireLockAnswer,
  millionaireUseLifeline,
  millionaireWalkAway,
} from "@/lib/funquiz/millionaire/logic";
import type { MillionaireLifelineId } from "@/lib/funquiz/millionaire/config";
import { toClientState } from "@/lib/funquiz/game-logic";
import { mutateRoomPersisted } from "@/lib/funquiz/store";

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

    const room = await mutateRoomPersisted(code, (room) => {
      switch (body.action) {
        case "lock": {
          if (body.choiceIndex === undefined) {
            throw new Error("choiceIndex required");
          }
          return millionaireLockAnswer(room, playerId, body.choiceIndex);
        }
        case "finalize": {
          if (body.choiceIndex === undefined) {
            throw new Error("choiceIndex required");
          }
          return millionaireFinalizeTeamAnswer(room, playerId, body.choiceIndex);
        }
        case "walkaway":
          return millionaireWalkAway(room, playerId);
        case "lifeline": {
          const lifeline = body.lifeline?.trim() ?? "";
          if (!isLifeline(lifeline)) {
            throw new Error("Invalid lifeline");
          }
          return millionaireUseLifeline(room, playerId, lifeline);
        }
        default:
          throw new Error("Unknown action");
      }
    });

    return NextResponse.json({ state: toClientState(room, playerId) });
  } catch (err) {
    return handleStoreError(err);
  }
}
