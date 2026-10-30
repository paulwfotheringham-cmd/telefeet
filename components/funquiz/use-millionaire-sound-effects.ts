"use client";

import { useEffect, useRef } from "react";
import { playMillionaireSound } from "@/lib/funquiz/millionaire/millionaire-sounds";
import type { ClientRoomState } from "@/lib/funquiz/types";

const MUTE_KEY = "funquiz-millionaire-sound-muted";

export function readMillionaireSoundMuted(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(MUTE_KEY) === "1";
}

export function writeMillionaireSoundMuted(muted: boolean): void {
  localStorage.setItem(MUTE_KEY, muted ? "1" : "0");
}

/** React to server-driven phase / reveal changes (poll + realtime). */
export function useMillionaireSoundEffects(
  roomState: ClientRoomState,
  muted: boolean,
): void {
  const mv = roomState.millionaireView;
  const prevPhase = useRef<string | null>(null);
  const prevQuestion = useRef<number | null>(null);
  const prevOutcome = useRef<string | null>(null);
  const revealKey = useRef<string | null>(null);

  useEffect(() => {
    if (!mv) return;

    if (prevQuestion.current !== null && mv.questionNumber !== prevQuestion.current) {
      if (mv.phase === "question") {
        playMillionaireSound("question", muted);
      }
    }
    prevQuestion.current = mv.questionNumber;

    if (prevPhase.current !== mv.phase) {
      if (mv.phase === "walkaway") {
        playMillionaireSound("walkaway", muted);
      }
      if (
        (mv.phase === "won" || mv.outcome === "won") &&
        prevOutcome.current !== "won"
      ) {
        playMillionaireSound("win", muted);
      }
      prevPhase.current = mv.phase;
    }
    prevOutcome.current = mv.outcome;

    if (mv.phase === "reveal" && roomState.answerFeedback) {
      const key = `${roomState.questionIndex}-${roomState.answerFeedback.choiceIndex}-${roomState.answerFeedback.correct}`;
      if (revealKey.current !== key) {
        revealKey.current = key;
        playMillionaireSound(
          roomState.answerFeedback.correct ? "reveal_correct" : "reveal_wrong",
          muted,
        );
      }
    }
  }, [mv, muted, roomState.answerFeedback, roomState.questionIndex]);
}
