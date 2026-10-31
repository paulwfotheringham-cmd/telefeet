"use client";

import { useState } from "react";
import { CatchphraseScene } from "@/lib/funquiz/catchphrase/scenes";
import type { ClientRoomState } from "@/lib/funquiz/types";

type Props = {
  roomState: ClientRoomState;
  playerId: string;
  busy: boolean;
  setBusy: (b: boolean) => void;
  onRefreshState: (s: ClientRoomState) => void;
  onError: (msg: string) => void;
};

export function CatchphraseStage({
  roomState,
  playerId,
  busy,
  setBusy,
  onRefreshState,
  onError,
}: Props) {
  const cv = roomState.catchphraseView;
  const [guess, setGuess] = useState("");

  if (!cv) return null;

  const post = async (body: Record<string, unknown>) => {
    setBusy(true);
    onError("");
    try {
      const res = await fetch(
        `/api/funquiz/room/${encodeURIComponent(roomState.code)}/catchphrase`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ playerId, ...body }),
        },
      );
      const data = (await res.json()) as { state?: ClientRoomState; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Request failed");
      if (data.state) onRefreshState(data.state);
      if (body.action === "guess") setGuess("");
    } catch (e) {
      onError(e instanceof Error ? e.message : "Request failed");
    } finally {
      setBusy(false);
    }
  };

  const totalTiles = cv.gridCols * cv.gridRows;
  const hidden = new Set(cv.hiddenTileIndices);

  return (
    <div className="mt-4 overflow-hidden rounded-3xl border-4 border-[#ffcc00] bg-gradient-to-b from-[#0047ab] to-[#001a4d] p-4 shadow-[0_0_40px_rgba(255,204,0,0.25)] md:p-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#ffcc00]">
            Catchphrase
          </p>
          <p className="text-sm text-blue-100">
            Round {cv.roundNumber} of {cv.totalRounds}
          </p>
        </div>
        <div className="rounded-full bg-[#ffcc00] px-4 py-1 text-sm font-black text-[#0047ab]">
          SAY WHAT YOU SEE
        </div>
      </header>

      <div className="mt-4 grid grid-cols-2 gap-2">
        {roomState.players.map((p) => (
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
            <p className="text-lg font-black tabular-nums text-[#ffcc00]">{p.score}</p>
          </div>
        ))}
      </div>

      {cv.statusMessage ? (
        <p className="mt-4 rounded-xl border border-[#ffcc00]/40 bg-black/30 px-4 py-3 text-center text-sm font-medium text-white">
          {cv.statusMessage}
        </p>
      ) : null}

      <div className="relative mx-auto mt-6 aspect-[4/3] max-w-lg overflow-hidden rounded-2xl border-4 border-white/20 shadow-inner">
        <div className="absolute inset-0">
          <CatchphraseScene sceneKey={cv.sceneKey} />
        </div>
        <div
          className="absolute inset-0 grid gap-0.5 p-0.5"
          style={{
            gridTemplateColumns: `repeat(${cv.gridCols}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${cv.gridRows}, minmax(0, 1fr))`,
          }}
        >
          {Array.from({ length: totalTiles }, (_, i) => (
            <div
              key={i}
              className={`rounded-sm transition-all duration-300 ${
                hidden.has(i)
                  ? "bg-gradient-to-br from-[#0047ab] to-[#002266] shadow-[inset_0_0_8px_rgba(0,0,0,0.5)]"
                  : "bg-transparent pointer-events-none"
              }`}
            />
          ))}
        </div>
      </div>

      {roomState.phase === "reveal" && cv.revealedAnswer ? (
        <div className="mt-6 animate-pulse rounded-2xl border-2 border-[#ffcc00] bg-black/40 px-6 py-5 text-center">
          <p className="text-xs uppercase tracking-widest text-[#ffcc00]">The catchphrase was</p>
          <p className="mt-2 text-2xl font-black text-white md:text-3xl">{cv.revealedAnswer}</p>
        </div>
      ) : null}

      {roomState.phase === "question" ? (
        <div className="mt-6 flex flex-col items-stretch gap-3">
          {cv.canBuzz ? (
            <button
              type="button"
              disabled={busy}
              onClick={() => void post({ action: "buzz" })}
              className="rounded-2xl bg-gradient-to-r from-[#ffcc00] to-[#ff9500] py-4 text-xl font-black uppercase tracking-wide text-[#1a1a2e] shadow-lg transition hover:brightness-110 disabled:opacity-50"
            >
              Buzz in!
            </button>
          ) : null}

          {cv.canGuess ? (
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                type="text"
                value={guess}
                onChange={(e) => setGuess(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && guess.trim()) {
                    void post({ action: "guess", guess: guess.trim() });
                  }
                }}
                placeholder="Type the catchphrase…"
                className="flex-1 rounded-xl border-2 border-white/20 bg-white/10 px-4 py-3 text-white placeholder:text-blue-200/60"
                autoFocus
              />
              <button
                type="button"
                disabled={busy || !guess.trim()}
                onClick={() => void post({ action: "guess", guess: guess.trim() })}
                className="rounded-xl bg-emerald-500 px-6 py-3 font-bold text-white disabled:opacity-50"
              >
                Submit
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => void post({ action: "pass" })}
                className="rounded-xl border border-white/30 px-4 py-3 text-sm text-blue-100"
              >
                Pass
              </button>
            </div>
          ) : null}

          {cv.buzzPlayerId && cv.buzzPlayerId !== playerId ? (
            <p className="text-center text-sm text-blue-200">
              <strong className="text-[#ffcc00]">{cv.buzzPlayerName}</strong> is guessing…
            </p>
          ) : null}
        </div>
      ) : null}

      {roomState.phase === "finished" ? (
        <div className="mt-6 text-center">
          <p className="text-lg font-bold text-[#ffcc00]">Final scores</p>
          <ul className="mt-3 space-y-2">
            {roomState.players.map((p) => (
              <li key={p.id} className="text-white">
                {p.name}
                {p.id === playerId ? " (you)" : ""}:{" "}
                <span className="font-bold text-[#ffcc00]">{p.score}</span>
              </li>
            ))}
          </ul>
          {roomState.winnerIds.includes(playerId) ? (
            <p className="mt-4 text-xl font-black text-emerald-300">You win!</p>
          ) : roomState.winnerIds.length > 0 ? (
            <p className="mt-4 text-sm text-blue-200">Better luck next time!</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
