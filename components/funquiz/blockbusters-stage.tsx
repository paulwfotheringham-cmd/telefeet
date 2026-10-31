"use client";

import { useBlockbustersSoundEffects, readBlockbustersSoundMuted, writeBlockbustersSoundMuted } from "@/components/funquiz/use-blockbusters-sound-effects";
import { playBlockbustersSound } from "@/lib/funquiz/blockbusters/blockbusters-sounds";
import type { BlockbustersClientCell } from "@/lib/funquiz/blockbusters/client-state";
import type { ClientRoomState } from "@/lib/funquiz/types";
import { useState } from "react";

type Props = {
  roomState: ClientRoomState;
  playerId: string;
  busy: boolean;
  setBusy: (b: boolean) => void;
  onRefreshState: (s: ClientRoomState) => void;
  onError: (msg: string) => void;
};

function hexStyle(cell: BlockbustersClientCell, playerId: string): string {
  const owned = cell.ownerId;
  const base =
    "relative flex h-[3.25rem] w-[3.75rem] items-center justify-center text-xl font-black transition md:h-[3.75rem] md:w-[4.25rem]";
  if (owned === playerId) {
    return `${base} bg-gradient-to-br from-emerald-400 to-teal-600 text-white shadow-[0_0_12px_rgba(52,211,153,0.5)]`;
  }
  if (owned) {
    return `${base} bg-gradient-to-br from-sky-500 to-blue-800 text-white shadow-[0_0_10px_rgba(56,189,248,0.35)]`;
  }
  if (cell.selectable) {
    return `${base} cursor-pointer bg-gradient-to-br from-[#ffcc00] to-[#e6a800] text-[#1a2744] hover:brightness-110 hover:scale-105`;
  }
  return `${base} bg-gradient-to-br from-slate-600 to-slate-800 text-slate-200`;
}

export function BlockbustersStage({
  roomState,
  playerId,
  busy,
  setBusy,
  onRefreshState,
  onError,
}: Props) {
  const bv = roomState.blockbustersView;
  const [muted, setMuted] = useState(readBlockbustersSoundMuted);
  useBlockbustersSoundEffects(roomState, muted);

  if (!bv) return null;

  const post = async (body: Record<string, unknown>) => {
    setBusy(true);
    onError("");
    try {
      const res = await fetch(
        `/api/funquiz/room/${encodeURIComponent(roomState.code)}/blockbusters`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ playerId, ...body }),
        },
      );
      const data = (await res.json()) as { state?: ClientRoomState; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Request failed");
      if (data.state) onRefreshState(data.state);
    } catch (e) {
      onError(e instanceof Error ? e.message : "Request failed");
    } finally {
      setBusy(false);
    }
  };

  const rows: BlockbustersClientCell[][] = [[], [], [], []];
  for (const c of bv.cells) {
    rows[c.row]!.push(c);
  }
  for (const r of rows) {
    r.sort((a, b) => a.col - b.col);
  }

  const q = roomState.question;

  return (
    <div className="mt-4 overflow-hidden rounded-3xl border-4 border-[#ffcc00] bg-gradient-to-b from-[#003399] via-[#0047ab] to-[#001a4d] p-4 shadow-[0_0_40px_rgba(0,100,255,0.35)] md:p-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#ffcc00]">
            Blockbusters
          </p>
          <p className="text-sm text-blue-100">
            {roomState.quizCategoryTitle} · {roomState.quizDifficultyTitle}
          </p>
        </div>
        <button
          type="button"
          className="rounded-full border border-white/30 px-3 py-1 text-xs text-white"
          onClick={() => {
            const next = !muted;
            setMuted(next);
            writeBlockbustersSoundMuted(next);
            if (!next) playBlockbustersSound("pick", false);
          }}
        >
          {muted ? "Sound off" : "Sound on"}
        </button>
      </header>

      <div className="mt-3 grid grid-cols-2 gap-2">
        {roomState.players.map((p) => {
          const role =
            p.id === bv.horizontalPlayerId
              ? "Gold · left → right"
              : "Blue · top ↓ bottom";
          return (
            <div
              key={p.id}
              className={`rounded-xl border px-3 py-2 ${
                p.id === playerId ? "border-[#ffcc00] bg-black/30" : "border-white/15 bg-black/20"
              }`}
            >
              <p className="truncate text-xs font-semibold text-white">
                {p.name}
                {p.id === playerId ? " (you)" : ""}
              </p>
              <p className="text-[10px] text-blue-200">{role}</p>
              <p className="text-lg font-black tabular-nums text-[#ffcc00]">{p.score} hex</p>
            </div>
          );
        })}
      </div>

      {bv.statusMessage ? (
        <p className="mt-4 rounded-xl border border-[#ffcc00]/40 bg-black/30 px-4 py-3 text-center text-sm font-medium text-white">
          {bv.statusMessage}
        </p>
      ) : null}

      <div className="relative mx-auto mt-6 max-w-xl px-2">
        <span className="absolute -left-1 top-1/2 -translate-y-1/2 -rotate-90 text-[10px] font-bold tracking-widest text-[#ffcc00]">
          GOLD
        </span>
        <span className="absolute -right-1 top-1/2 -translate-y-1/2 rotate-90 text-[10px] font-bold tracking-widest text-sky-300">
          GOLD
        </span>
        <span className="absolute left-1/2 -top-1 -translate-x-1/2 text-[10px] font-bold tracking-widest text-sky-300">
          BLUE
        </span>
        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-4 text-[10px] font-bold tracking-widest text-sky-300">
          BLUE
        </span>

        <div className="flex flex-col items-center gap-1 py-4">
          {rows.map((rowCells, rowIdx) => (
            <div
              key={rowIdx}
              className={`flex gap-1 ${rowCells[0]?.wide ? "" : "ml-8 md:ml-10"}`}
            >
              {rowCells.map((cell) => (
                <button
                  key={cell.id}
                  type="button"
                  disabled={busy || !cell.selectable}
                  className={`${hexStyle(cell, playerId)} clip-hex`}
                  style={{
                    clipPath:
                      "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)",
                  }}
                  onClick={() => {
                    if (!cell.selectable) return;
                    playBlockbustersSound("pick", muted);
                    void post({ action: "pick", cellId: cell.id });
                  }}
                >
                  {cell.letter}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>

      {q && (bv.step === "answer" || bv.step === "steal" || roomState.phase === "reveal") ? (
        <div className="mt-6 rounded-2xl border border-white/20 bg-black/35 p-4 md:p-5">
          <p className="text-sm font-semibold text-[#ffcc00]">
            {bv.step === "steal" ? "Steal!" : "Question"}
          </p>
          <p className="mt-2 text-base font-medium text-white md:text-lg">{q.prompt}</p>
          {q.flagImageUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={q.flagImageUrl}
              alt=""
              className="mx-auto mt-3 max-h-24 rounded-lg border border-white/20"
            />
          ) : null}
          {q.outlineImageUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={q.outlineImageUrl}
              alt=""
              className="mx-auto mt-3 max-h-32 rounded-lg border border-white/20 bg-white/10"
            />
          ) : null}
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {q.options.map((opt, idx) => {
              const reveal = roomState.phase === "reveal";
              const feedback = roomState.answerFeedback;
              let extra = "border-white/15 bg-white/10 hover:bg-white/15";
              if (reveal && feedback) {
                if (idx === feedback.correctIndex) {
                  extra = "border-emerald-400 bg-emerald-900/50";
                } else if (idx === feedback.choiceIndex && !feedback.correct) {
                  extra = "border-red-400 bg-red-900/40";
                }
              }
              return (
                <button
                  key={idx}
                  type="button"
                  disabled={busy || !bv.canAnswer || reveal}
                  onClick={() => void post({ action: "answer", choiceIndex: idx })}
                  className={`rounded-xl border px-3 py-3 text-left text-sm text-white disabled:opacity-70 ${extra}`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {roomState.phase === "finished" ? (
        <div className="mt-6 text-center">
          {roomState.winnerIds.includes(playerId) ? (
            <p className="text-2xl font-black text-[#ffcc00]">Can I have a P please, Bob? You win!</p>
          ) : (
            <p className="text-lg text-blue-100">Your opponent completed the chain!</p>
          )}
        </div>
      ) : null}
    </div>
  );
}
