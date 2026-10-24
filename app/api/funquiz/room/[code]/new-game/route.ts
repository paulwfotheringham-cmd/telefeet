import { NextResponse } from "next/server";
import { handleStoreError } from "@/lib/funquiz/api";
import {
  GAME_MODE_PLAY_TOGETHER,
  GAME_MODE_TAKE_TURNS,
} from "@/lib/funquiz/constants";
import { isQuizCategoryId } from "@/lib/funquiz/categories";
import { isQuizDifficulty } from "@/lib/funquiz/difficulties";
import { resetRoomForNewGame, toClientState } from "@/lib/funquiz/game-logic";
import type { GameMode } from "@/lib/funquiz/types";
import { loadRoom, saveRoom } from "@/lib/funquiz/store";

export const dynamic = "force-dynamic";

type Params = { params: { code: string } };

export async function POST(request: Request, { params }: Params) {
  try {
    const code = params.code?.trim().toUpperCase();
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
    if (gameModeRaw !== GAME_MODE_TAKE_TURNS && gameModeRaw !== GAME_MODE_PLAY_TOGETHER) {
      return NextResponse.json({ error: "Invalid gameMode" }, { status: 400 });
    }
    const gameMode = gameModeRaw as GameMode;

    let room = await loadRoom(code);
    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }
    room = resetRoomForNewGame(room, playerId, gameMode, quizCategoryRaw, quizDifficultyRaw);
    await saveRoom(room);
    return NextResponse.json({ state: toClientState(room, playerId) });
  } catch (err) {
    return handleStoreError(err);
  }
}
