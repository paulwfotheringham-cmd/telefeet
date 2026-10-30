import { NextResponse } from "next/server";
import { handleStoreError } from "@/lib/funquiz/api";
import {
  GAME_MODE_PLAY_TOGETHER,
  GAME_MODE_PARALLEL_MILLIONAIRE,
  GAME_MODE_SHARED_MILLIONAIRE,
  GAME_MODE_TAKE_TURNS,
  GAME_MODE_TEXAS_HOLDEM,
} from "@/lib/funquiz/constants";
import { isQuizCategoryId } from "@/lib/funquiz/categories";
import { isQuizDifficulty } from "@/lib/funquiz/difficulties";
import { resetRoomForNewGame, toClientState } from "@/lib/funquiz/game-logic";
import type { GameMode } from "@/lib/funquiz/types";
import { normalizeRoomCode } from "@/lib/funquiz/room-code";
import { loadRoom, mutateRoomPersisted } from "@/lib/funquiz/store";

export const dynamic = "force-dynamic";

type Params = { params: { code: string } };

export async function POST(request: Request, { params }: Params) {
  try {
    const code = normalizeRoomCode(params.code ?? "");
    const body = (await request.json()) as {
      playerId?: string;
      gameMode?: string;
      quizCategory?: string;
      quizDifficulty?: string;
    };
    const playerId = body.playerId?.trim();
    const gameModeRaw = body.gameMode?.trim();
    const quizCategoryRaw = body.quizCategory?.trim();
    const quizDifficultyRaw = body.quizDifficulty?.trim();
    if (!code || !playerId || !gameModeRaw || !quizCategoryRaw || !quizDifficultyRaw) {
      return NextResponse.json(
        { error: "playerId, gameMode, quizCategory and quizDifficulty required" },
        { status: 400 },
      );
    }
    if (!isQuizCategoryId(quizCategoryRaw)) {
      return NextResponse.json({ error: "Invalid quizCategory" }, { status: 400 });
    }
    if (!isQuizDifficulty(quizDifficultyRaw)) {
      return NextResponse.json({ error: "Invalid quizDifficulty" }, { status: 400 });
    }
    if (
      gameModeRaw !== GAME_MODE_TAKE_TURNS &&
      gameModeRaw !== GAME_MODE_PLAY_TOGETHER &&
      gameModeRaw !== GAME_MODE_SHARED_MILLIONAIRE &&
      gameModeRaw !== GAME_MODE_PARALLEL_MILLIONAIRE &&
      gameModeRaw !== GAME_MODE_TEXAS_HOLDEM
    ) {
      return NextResponse.json({ error: "Invalid gameMode" }, { status: 400 });
    }
    const gameMode = gameModeRaw as GameMode;

    const exists = await loadRoom(code);
    if (!exists) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }
    const room = await mutateRoomPersisted(code, (room) =>
      resetRoomForNewGame(room, playerId, gameMode, quizCategoryRaw, quizDifficultyRaw),
    );
    return NextResponse.json({ state: toClientState(room, playerId) });
  } catch (err) {
    return handleStoreError(err);
  }
}
