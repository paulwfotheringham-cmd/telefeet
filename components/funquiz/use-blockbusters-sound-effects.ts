"use client";

import { useEffect, useRef } from "react";
import { playBlockbustersSound } from "@/lib/funquiz/blockbusters/blockbusters-sounds";
import type { ClientRoomState } from "@/lib/funquiz/types";

const MUTE_KEY = "funquiz-blockbusters-sound-muted";

export function readBlockbustersSoundMuted(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(MUTE_KEY) === "1";
}

export function writeBlockbustersSoundMuted(muted: boolean): void {
  localStorage.setItem(MUTE_KEY, muted ? "1" : "0");
}

export function useBlockbustersSoundEffects(roomState: ClientRoomState, muted: boolean): void {
  const bv = roomState.blockbustersView;
  const prevToken = useRef<string | null>(null);
  const prevStep = useRef<string | null>(null);

  useEffect(() => {
    if (!bv) return;

    if (prevToken.current !== bv.soundToken) {
      if (roomState.phase === "reveal" && roomState.answerFeedback) {
        playBlockbustersSound(
          roomState.answerFeedback.correct ? "correct" : "wrong",
          muted,
        );
      }
      if (roomState.phase === "finished" && roomState.winnerIds.length > 0) {
        playBlockbustersSound("win", muted);
      }
      prevToken.current = bv.soundToken;
    }

    if (prevStep.current !== bv.step) {
      if (bv.step === "steal") {
        playBlockbustersSound("steal", muted);
      }
      prevStep.current = bv.step;
    }
  }, [bv, muted, roomState.answerFeedback, roomState.phase, roomState.winnerIds]);
}
