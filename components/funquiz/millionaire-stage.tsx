"use client";

import { useEffect, useMemo, useState } from "react";
import {
  lifelineSoundId,
  playMillionaireSound,
} from "@/lib/funquiz/millionaire/millionaire-sounds";
import {
  readMillionaireSoundMuted,
  useMillionaireSoundEffects,
  writeMillionaireSoundMuted,
} from "@/components/funquiz/use-millionaire-sound-effects";
import { FunQuizScorecardGraph } from "@/components/funquiz/scorecard-graph";
import {
  MILLIONAIRE_LIFELINE_LABELS,
  MILLIONAIRE_LIFELINES,
} from "@/lib/funquiz/millionaire/config";
import type { ClientRoomState } from "@/lib/funquiz/types";

type Props = {
  roomState: ClientRoomState;
  playerId: string;
  isHost: boolean;
  busy: boolean;
  onRefreshState: (state: ClientRoomState) => void;
  onError: (message: string) => void;
  setBusy: (busy: boolean) => void;
  onPlayAgain?: () => void;
  onLeaveLobby?: () => void;
};

function formatMoney(n: number): string {
  return `$${n.toLocaleString("en-US")}`;
}

export function MillionaireStage({
  roomState,
  playerId,
  isHost,
  busy,
  onRefreshState,
  onError,
  setBusy,
  onPlayAgain,
  onLeaveLobby,
}: Props) {
  const mv = roomState.millionaireView;
  const question = roomState.question;
  const lockedChoiceOptions = useMemo(() => {
    const indices = new Set<number>();
    for (const p of mv?.playerLocks ?? []) {
      if (p.locked && p.choiceIndex !== null) indices.add(p.choiceIndex);
    }
    return [...indices].sort((a, b) => a - b);
  }, [mv?.playerLocks]);
  const [finalizeChoice, setFinalizeChoice] = useState<number | null>(null);
  const [soundMuted, setSoundMuted] = useState(true);
  useEffect(() => {
    setSoundMuted(readMillionaireSoundMuted());
  }, []);
  useMillionaireSoundEffects(roomState, soundMuted);
  useEffect(() => {
    if (!mv?.canFinalizeTeam) {
      setFinalizeChoice(null);
      return;
    }
    setFinalizeChoice((prev) => {
      if (prev !== null && lockedChoiceOptions.includes(prev)) return prev;
      return lockedChoiceOptions[0] ?? roomState.you.answer;
    });
  }, [mv?.canFinalizeTeam, lockedChoiceOptions, roomState.you.answer]);

  if (!mv) return null;

  const postAction = async (body: Record<string, unknown>) => {
    setBusy(true);
    onError("");
    try {
      const res = await fetch(
        `/api/funquiz/room/${encodeURIComponent(roomState.code)}/millionaire`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ playerId, ...body }),
        },
      );
      const data = (await res.json()) as { state?: ClientRoomState; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Request failed");
      if (data.state) onRefreshState(data.state);
      if (body.action === "lock") playMillionaireSound("lock", soundMuted);
      if (body.action === "lifeline" && typeof body.lifeline === "string") {
        playMillionaireSound(lifelineSoundId(body.lifeline), soundMuted);
      }
    } catch (e) {
      onError(e instanceof Error ? e.message : "Request failed");
    } finally {
      setBusy(false);
    }
  };

  const selectAnswer = async (idx: number) => {
    setBusy(true);
    onError("");
    try {
      const res = await fetch(
        `/api/funquiz/room/${encodeURIComponent(roomState.code)}/answer`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ playerId, choiceIndex: idx }),
        },
      );
      const data = (await res.json()) as { state?: ClientRoomState; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Request failed");
      if (data.state) onRefreshState(data.state);
      playMillionaireSound("select", soundMuted);
    } catch (e) {
      onError(e instanceof Error ? e.message : "Request failed");
    } finally {
      setBusy(false);
    }
  };

  const eliminated = new Set(mv.eliminatedOptionIndices);
  const phase = mv.phase;
  const feedback = roomState.answerFeedback;
  const reducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  return (
    <div className="millionaire-stage relative min-h-[70vh] overflow-hidden rounded-3xl border border-amber-500/20 bg-[#050818] p-4 shadow-2xl shadow-indigo-950/80 md:p-6">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(56,189,248,0.12),_transparent_55%),radial-gradient(ellipse_at_bottom,_rgba(234,179,8,0.08),_transparent_50%)]"
        aria-hidden
      />

      <div
        className={`relative grid gap-6 ${
          mv.playStyle === "parallel" ? "xl:grid-cols-[1fr_280px_220px]" : "lg:grid-cols-[1fr_220px]"
        }`}
      >
        <div>
          <header className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-200/90">
                {mv.playStyle === "parallel" ? "Dual Millionaire" : "Shared Millionaire"}
              </p>
              <h2 className="text-xl font-bold text-white md:text-2xl">
                {mv.playStyle === "parallel"
                  ? "Your ladder — play side by side"
                  : "Work together. Beat the ladder."}
              </h2>
            </div>
            <div className="flex flex-wrap items-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setSoundMuted((m) => {
                    const next = !m;
                    writeMillionaireSoundMuted(next);
                    if (!next) playMillionaireSound("select", false);
                    return next;
                  });
                }}
                className="rounded-lg border border-white/15 px-3 py-2 text-xs text-slate-200 hover:bg-white/5"
                aria-pressed={!soundMuted}
              >
                {soundMuted ? "Sound off" : "Sound on"}
              </button>
              <div className="rounded-xl border border-amber-400/30 bg-black/40 px-4 py-2 text-right">
                <p className="text-[10px] uppercase tracking-wider text-slate-400">
                  {mv.playStyle === "parallel" ? "Your prize" : "Team prize"}
                </p>
                <p className="text-lg font-bold tabular-nums text-amber-100">
                  {formatMoney(mv.securedPrize)}
                  <span className="text-xs font-normal text-slate-400"> secured</span>
                </p>
              </div>
            </div>
          </header>

          {roomState.statusMessage ? (
            <p className="mb-4 rounded-xl border border-cyan-500/25 bg-cyan-950/30 px-3 py-2 text-sm text-cyan-100">
              {roomState.statusMessage}
            </p>
          ) : null}

          {(phase === "won" || phase === "lost" || phase === "walkaway") && (
            <section className="mb-6 rounded-2xl border border-violet-400/40 bg-violet-950/40 p-6 text-center">
              <h3 className="text-2xl font-bold text-white">
                {phase === "won"
                  ? "You won the million!"
                  : phase === "walkaway"
                    ? "You walked away"
                    : "Game over"}
              </h3>
              <p className="mt-2 text-sm text-slate-300">
                {roomState.players.map((p) => p.name).join(" · ")}
              </p>
              <p className="mt-2 text-amber-100">
                Final virtual prize:{" "}
                <strong>{formatMoney(mv.finalAwardedPrize ?? mv.securedPrize)}</strong>
              </p>
              {phase === "won" ? (
                <p className="mt-1 text-xs text-slate-400">
                  All {mv.totalQuestions} questions answered correctly.
                </p>
              ) : null}
              {roomState.scorecard ? (
                <div className="mt-5 text-left">
                  <FunQuizScorecardGraph scorecard={roomState.scorecard} />
                </div>
              ) : null}
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                {isHost && onPlayAgain ? (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => onPlayAgain()}
                    className="rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 px-5 py-2.5 text-sm font-semibold text-black disabled:opacity-50"
                  >
                    Play again
                  </button>
                ) : null}
                {onLeaveLobby ? (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => onLeaveLobby()}
                    className="rounded-xl border border-white/20 px-5 py-2.5 text-sm text-slate-200"
                  >
                    Leave room
                  </button>
                ) : null}
              </div>
            </section>
          )}

          {question && phase !== "won" && phase !== "lost" && phase !== "walkaway" && (
            <>
              <p className="text-sm font-medium text-cyan-200/90">
                Question {mv.questionNumber} of {mv.totalQuestions} · Next:{" "}
                {formatMoney(mv.targetPrize)}
              </p>
              <h3 className="mt-3 text-lg font-semibold leading-snug text-white md:text-2xl">
                {question.prompt}
              </h3>

              <ul className="mt-6 grid gap-3" role="listbox" aria-label="Answer choices">
                {question.options.map((opt, idx) => {
                  if (eliminated.has(idx)) return null;
                  const selected = roomState.you.answer === idx;
                  const letter = String.fromCharCode(65 + idx);
                  const locked = mv.playerLocks.find((p) => p.id === playerId)?.locked;
                  return (
                    <li key={`${question.id}-${idx}`}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={selected}
                        disabled={busy || !mv.canSelectAnswer || locked}
                        onClick={() => void selectAnswer(idx)}
                        className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-4 text-left transition ${
                          selected
                            ? "border-cyan-400 bg-cyan-950/50 shadow-lg shadow-cyan-900/30"
                            : "border-white/10 bg-slate-950/80 hover:border-cyan-400/40"
                        } disabled:opacity-60`}
                      >
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-black/50 font-mono text-lg font-bold text-amber-200">
                          {letter}
                        </span>
                        <span className="text-sm font-medium text-slate-100 md:text-base">
                          {opt}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={
                    busy || !mv.canLockAnswer || roomState.you.answer === null
                  }
                  onClick={() =>
                    void postAction({
                      action: "lock",
                      choiceIndex: roomState.you.answer as number,
                    })
                  }
                  className="rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 px-4 py-2 text-sm font-semibold text-black disabled:opacity-50"
                >
                  Lock in answer
                </button>
                {mv.canWalkAway && (mv.playStyle === "parallel" || isHost) ? (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void postAction({ action: "walkaway" })}
                    className="rounded-xl border border-amber-400/50 px-4 py-2 text-sm text-amber-100"
                  >
                    Walk away
                  </button>
                ) : null}
                {mv.canFinalizeTeam && lockedChoiceOptions.length > 0 ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-violet-200">Host finalises:</span>
                    {lockedChoiceOptions.map((idx) => {
                      const letter = String.fromCharCode(65 + idx);
                      return (
                        <button
                          key={idx}
                          type="button"
                          disabled={busy}
                          onClick={() => setFinalizeChoice(idx)}
                          className={`rounded-lg border px-2 py-1 text-xs ${
                            finalizeChoice === idx
                              ? "border-violet-300 bg-violet-800 text-white"
                              : "border-white/15 text-slate-300"
                          }`}
                        >
                          {letter}
                        </button>
                      );
                    })}
                    <button
                      type="button"
                      disabled={busy || finalizeChoice === null}
                      onClick={() =>
                        void postAction({
                          action: "finalize",
                          choiceIndex: finalizeChoice as number,
                        })
                      }
                      className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                    >
                      Finalise team answer
                    </button>
                  </div>
                ) : null}
              </div>

              {mv.phoneFriendHint ? (
                <div
                  className="mt-6 rounded-2xl border border-sky-400/35 bg-sky-950/40 px-4 py-4"
                  role="status"
                >
                  <p className="text-xs font-semibold uppercase tracking-wider text-sky-200">
                    Phone a Friend
                  </p>
                  <p className="mt-2 text-sm text-slate-100">{mv.phoneFriendHint.message}</p>
                </div>
              ) : null}

              {mv.audiencePercents && question ? (
                <div
                  className="mt-6 rounded-2xl border border-violet-400/35 bg-violet-950/40 px-4 py-4"
                  role="status"
                >
                  <p className="text-xs font-semibold uppercase tracking-wider text-violet-200">
                    Ask the Audience
                  </p>
                  <ul className="mt-3 space-y-2">
                    {question.options.map((opt, idx) => {
                      if (eliminated.has(idx)) return null;
                      const pct = mv.audiencePercents![idx] ?? 0;
                      const letter = String.fromCharCode(65 + idx);
                      return (
                        <li key={`aud-${idx}`}>
                          <div className="flex items-center justify-between gap-2 text-xs text-slate-300">
                            <span>
                              {letter}: {opt}
                            </span>
                            <span className="tabular-nums font-semibold text-violet-100">
                              {pct}%
                            </span>
                          </div>
                          <div className="mt-1 h-2 overflow-hidden rounded-full bg-black/40">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-400"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ) : null}

              {phase === "reveal" && feedback ? (
                <div
                  className={`mt-6 rounded-2xl border px-4 py-4 ${
                    feedback.correct
                      ? "border-emerald-400/40 bg-emerald-950/40"
                      : "border-red-400/40 bg-red-950/40"
                  } ${reducedMotion ? "" : "animate-pulse"}`}
                >
                  <p className="font-semibold text-white">
                    {feedback.correct ? "Correct!" : "Incorrect"}
                  </p>
                  {!feedback.correct ? (
                    <p className="mt-1 text-sm text-emerald-100">
                      Correct: {feedback.correctLabel}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </>
          )}

          <div className="mt-6 flex flex-wrap gap-2">
            {MILLIONAIRE_LIFELINES.map((id) => {
              const available = mv.lifelinesAvailable[id];
              const label = MILLIONAIRE_LIFELINE_LABELS[id];
              return (
                <button
                  key={id}
                  type="button"
                  disabled={busy || !mv.canUseLifelines || !available}
                  onClick={() => void postAction({ action: "lifeline", lifeline: id })}
                  className="rounded-lg border border-amber-400/30 bg-black/30 px-3 py-2 text-xs font-medium text-amber-100 disabled:opacity-40"
                >
                  {label}
                </button>
              );
            })}
          </div>
          {!isHost && mv.playStyle === "shared" && phase === "question" ? (
            <p className="mt-2 text-[11px] text-slate-500">
              Lifelines are used by the room host.
            </p>
          ) : null}

          {mv.playStyle === "shared" ? (
            <ul className="mt-4 flex flex-wrap gap-3 text-xs text-slate-300">
              {mv.playerLocks.map((p) => (
                <li key={p.id} className="rounded-lg bg-black/40 px-2 py-1">
                  {p.name}
                  {p.id === playerId ? " (you)" : ""}:{" "}
                  {p.locked ? "locked" : p.choiceIndex !== null ? "selected" : "—"}
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        {mv.playStyle === "parallel" && mv.opponentWatch ? (
          <aside
            className="rounded-2xl border border-cyan-500/25 bg-black/40 p-3"
            aria-label="Friend's question (spectator)"
          >
            <p className="text-center text-xs font-semibold uppercase tracking-widest text-cyan-200">
              {mv.opponentWatch.name}&apos;s run
            </p>
            <p className="mt-2 text-center text-[11px] text-slate-400">
              Q {mv.opponentWatch.questionNumber} · {formatMoney(mv.opponentWatch.securedPrize)}{" "}
              secured
            </p>
            {mv.opponentWatch.question ? (
              <>
                <p className="mt-3 text-sm font-medium leading-snug text-slate-200">
                  {mv.opponentWatch.question.prompt}
                </p>
                <ul className="mt-3 space-y-2">
                  {mv.opponentWatch.question.options.map((opt, idx) => {
                    if (mv.opponentWatch!.eliminatedOptionIndices.includes(idx)) return null;
                    const letter = String.fromCharCode(65 + idx);
                    return (
                      <li
                        key={`opp-${idx}`}
                        className="rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2 text-xs text-slate-400"
                      >
                        <span className="font-mono text-cyan-300/80">{letter}</span> {opt}
                      </li>
                    );
                  })}
                </ul>
              </>
            ) : (
              <p className="mt-4 text-center text-xs text-slate-500">
                {mv.opponentWatch.phase === "won" ||
                mv.opponentWatch.phase === "lost" ||
                mv.opponentWatch.phase === "walkaway"
                  ? "Run finished"
                  : "Waiting…"}
              </p>
            )}
            <p className="mt-3 text-center text-[10px] text-slate-500">
              Spectator view — you cannot answer
            </p>
          </aside>
        ) : null}

        <aside
          className="rounded-2xl border border-amber-500/25 bg-black/50 p-3"
          aria-label="Prize ladder"
        >
          <p className="mb-2 text-center text-xs font-semibold uppercase tracking-widest text-amber-200">
            Prize ladder
          </p>
          <ol className="space-y-1">
            {[...mv.ladder].reverse().map((prize, revIdx) => {
              const idx = mv.ladder.length - 1 - revIdx;
              const isCurrent =
                idx === roomState.questionIndex &&
                (phase === "question" || phase === "discussion" || phase === "reveal");
              const isPassed = idx < roomState.questionIndex || mv.outcome === "won";
              const isSafety = mv.safetyNetIndices.includes(idx);
              return (
                <li
                  key={prize}
                  className={`rounded-lg px-2 py-1 text-right text-sm tabular-nums ${
                    isCurrent
                      ? "bg-cyan-500/20 font-bold text-cyan-100 ring-1 ring-cyan-400/50"
                      : isPassed
                        ? "text-amber-200"
                        : "text-slate-500"
                  }`}
                >
                  {formatMoney(prize)}
                  {isSafety ? (
                    <span className="ml-1 text-[10px] text-amber-400/80">safe</span>
                  ) : null}
                </li>
              );
            })}
          </ol>
        </aside>
      </div>
    </div>
  );
}
