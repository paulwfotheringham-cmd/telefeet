"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ClientRoomState } from "@/lib/funquiz/types";

const PLAYER_ID_KEY = "funquiz-player-id";
const PLAYER_NAME_KEY = "funquiz-player-name";

function getOrCreatePlayerId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem(PLAYER_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(PLAYER_ID_KEY, id);
  }
  return id;
}

type Screen = "home" | "game";

async function parseState(res: Response): Promise<ClientRoomState | null> {
  const data = (await res.json()) as { state?: ClientRoomState; error?: string };
  if (!res.ok) {
    throw new Error(data.error ?? "Request failed");
  }
  return data.state ?? null;
}

/** Avoid flicker when a stale poll omits a player who just joined (read-after-write lag). */
function mergeLobbyPollState(
  prev: ClientRoomState | null,
  next: ClientRoomState,
): ClientRoomState {
  if (!prev || prev.code !== next.code || prev.phase !== "lobby" || next.phase !== "lobby") {
    return next;
  }
  const byId = new Map(next.players.map((p) => [p.id, p]));
  for (const p of prev.players) {
    if (!byId.has(p.id)) {
      byId.set(p.id, p);
    }
  }
  const players = [...byId.values()];
  const mergedYouRow = players.find((p) => p.id === next.you.id);
  const you =
    mergedYouRow && next.you.name
      ? next.you
      : {
          ...next.you,
          name: mergedYouRow?.name ?? prev.you.name ?? next.you.name,
          score: mergedYouRow?.score ?? prev.you.score ?? next.you.score,
        };
  return { ...next, players, you, error: players.some((p) => p.id === next.you.id) ? undefined : next.error };
}

function readPlayerId(): string {
  if (typeof window === "undefined") return "";
  return getOrCreatePlayerId();
}

export function FunQuizClient() {
  const [screen, setScreen] = useState<Screen>("home");
  const [playerId, setPlayerId] = useState(readPlayerId);
  const [name, setName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [roomState, setRoomState] = useState<ClientRoomState | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [storeWarning, setStoreWarning] = useState<string | null>(null);

  useEffect(() => {
    const id = getOrCreatePlayerId();
    setPlayerId(id);
    const saved = localStorage.getItem(PLAYER_NAME_KEY);
    if (saved) setName(saved);
    fetch("/api/funquiz/health")
      .then((r) => r.json())
      .then((h: { ok?: boolean; store?: string }) => {
        if (!h.ok || h.store === "none") {
          setStoreWarning(
            "Multiplayer storage is unavailable. Supabase must be configured on the server.",
          );
        }
      })
      .catch(() => {});
  }, []);

  const code = roomState?.code ?? joinCode.toUpperCase();

  const poll = useCallback(async () => {
    if (!code || !playerId || screen !== "game") return;
    try {
      const res = await fetch(
        `/api/funquiz/room/${encodeURIComponent(code)}?playerId=${encodeURIComponent(playerId)}`,
        { cache: "no-store" },
      );
      const state = await parseState(res);
      if (state) {
        setRoomState((prev) => mergeLobbyPollState(prev, state));
      }
    } catch {
      /* ignore transient poll errors */
    }
  }, [code, playerId, screen]);

  useEffect(() => {
    if (screen !== "game" || !code) return;
    poll();
    const id = setInterval(poll, 3000);
    return () => clearInterval(id);
  }, [screen, code, poll]);

  useEffect(() => {
    if (screen !== "game" || !code) return;
    const supabase = createClient();
    const channel = supabase
      .channel(`funquiz:${code.toUpperCase()}`)
      .on("broadcast", { event: "sync" }, () => {
        void poll();
      })
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [screen, code, poll]);

  const persistName = (n: string) => {
    localStorage.setItem(PLAYER_NAME_KEY, n);
  };

  const resolvePlayerId = () => playerId || getOrCreatePlayerId();

  const createRoom = async () => {
    setError(null);
    if (!name.trim()) {
      setError("Enter your name first.");
      return;
    }
    const activePlayerId = resolvePlayerId();
    if (!playerId) setPlayerId(activePlayerId);
    persistName(name.trim());
    setBusy(true);
    try {
      const res = await fetch("/api/funquiz/room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId: activePlayerId, playerName: name.trim() }),
      });
      const state = await parseState(res);
      if (state) {
        setRoomState(state);
        setJoinCode(state.code);
        setScreen("game");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not create room");
    } finally {
      setBusy(false);
    }
  };

  const joinRoom = async () => {
    setError(null);
    if (!name.trim()) {
      setError("Enter your name first.");
      return;
    }
    if (!joinCode.trim()) {
      setError("Enter a room code.");
      return;
    }
    const activePlayerId = resolvePlayerId();
    if (!playerId) setPlayerId(activePlayerId);
    persistName(name.trim());
    setBusy(true);
    try {
      const res = await fetch("/api/funquiz/room/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: joinCode.trim().toUpperCase(),
          playerId: activePlayerId,
          playerName: name.trim(),
        }),
      });
      const state = await parseState(res);
      if (state) {
        setRoomState(state);
        setScreen("game");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not join room");
    } finally {
      setBusy(false);
    }
  };

  const startGame = async () => {
    if (!roomState?.code) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/funquiz/room/${roomState.code}/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId }),
      });
      const state = await parseState(res);
      if (state) setRoomState(state);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not start");
    } finally {
      setBusy(false);
    }
  };

  const submitAnswer = async (choiceIndex: number) => {
    if (!roomState?.code || roomState.you.answer !== null) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/funquiz/room/${roomState.code}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId, choiceIndex }),
      });
      const state = await parseState(res);
      if (state) setRoomState(state);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not submit answer");
    } finally {
      setBusy(false);
    }
  };

  const isHost = roomState?.hostId === playerId;

  const progressPct = roomState
    ? Math.round(((roomState.questionIndex + 1) / roomState.totalQuestions) * 100)
    : 0;

  const leaveRoom = () => {
    setScreen("home");
    setRoomState(null);
    setError(null);
  };

  if (screen === "home") {
    return (
      <div className="mx-auto flex min-h-[100dvh] max-w-lg flex-col justify-center px-4 py-10">
        <div className="rounded-3xl border border-violet-400/25 bg-gradient-to-b from-slate-900/95 to-indigo-950/90 p-8 shadow-2xl shadow-violet-900/40">
          <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-violet-300">
            Two-player battle
          </p>
          <h1 className="mt-3 text-center font-bold tracking-tight text-white text-4xl">
            Fun Quiz
          </h1>
          <p className="mt-3 text-center text-sm leading-relaxed text-slate-300">
            50 international general-knowledge questions. Create a room, share the code, and
            play head-to-head from anywhere.
          </p>

          {storeWarning ? (
            <p className="mt-4 rounded-xl border border-amber-500/40 bg-amber-950/40 px-3 py-2 text-xs text-amber-100">
              {storeWarning}
            </p>
          ) : null}

          <label className="mt-6 block text-sm font-medium text-slate-200">
            Your name
            <input
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none ring-violet-400/0 transition focus:ring-2 focus:ring-violet-400/60"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alex"
              maxLength={24}
              autoComplete="nickname"
            />
          </label>

          <button
            type="button"
            disabled={busy}
            onClick={createRoom}
            className="mt-4 w-full rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-700/30 transition hover:brightness-110 disabled:opacity-60"
          >
            Create room
          </button>

          <div className="my-6 flex items-center gap-3 text-xs text-slate-500">
            <span className="h-px flex-1 bg-white/10" />
            or join with code
            <span className="h-px flex-1 bg-white/10" />
          </div>

          <label className="block text-sm font-medium text-slate-200">
            Room code
            <input
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-center font-mono text-lg tracking-[0.35em] text-white uppercase outline-none focus:ring-2 focus:ring-violet-400/60"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
              placeholder="ABC123"
              maxLength={6}
            />
          </label>

          <button
            type="button"
            disabled={busy}
            onClick={joinRoom}
            className="mt-4 w-full rounded-xl border border-violet-400/50 bg-violet-950/50 py-3.5 text-sm font-semibold text-violet-100 transition hover:bg-violet-900/60 disabled:opacity-60"
          >
            Join room
          </button>

          {error ? (
            <p className="mt-4 text-center text-sm text-red-300" role="alert">
              {error}
            </p>
          ) : null}
        </div>
      </div>
    );
  }

  if (!roomState) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center text-slate-300">
        Loading room…
      </div>
    );
  }

  const { phase, question, players, you } = roomState;
  const opponent = players.find((p) => p.id !== playerId);
  const bothIn = players.length >= 2;

  return (
    <div className="mx-auto flex min-h-[100dvh] max-w-2xl flex-col px-4 py-6 pb-10">
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-violet-300">
            Room {roomState.code}
          </p>
          <h1 className="text-2xl font-bold text-white">Fun Quiz</h1>
        </div>
        <button
          type="button"
          onClick={leaveRoom}
          className="rounded-lg border border-white/15 px-3 py-1.5 text-xs text-slate-300 hover:bg-white/5"
        >
          Leave
        </button>
      </header>

      <div className="mt-4 grid grid-cols-2 gap-3">
        {[you, opponent].filter(Boolean).map((p) => (
          <div
            key={p!.id}
            className={`rounded-2xl border px-4 py-3 ${
              p!.id === playerId
                ? "border-violet-400/50 bg-violet-950/40"
                : "border-white/10 bg-slate-900/60"
            }`}
          >
            <p className="truncate text-sm font-semibold text-white">
              {p!.name}
              {p!.id === playerId ? " (you)" : ""}
            </p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-violet-200">{p!.score}</p>
          </div>
        ))}
      </div>

      {phase === "lobby" ? (
        <section className="mt-8 flex flex-1 flex-col rounded-3xl border border-white/10 bg-slate-900/70 p-6">
          <h2 className="text-lg font-semibold text-white">Waiting room</h2>
          <p className="mt-2 text-sm text-slate-300">
            Share code <span className="font-mono text-lg text-violet-200">{roomState.code}</span>{" "}
            with your opponent.
          </p>
          <ul className="mt-4 space-y-2 text-sm text-slate-200">
            {players.map((p) => (
              <li key={p.id} className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                {p.name}
              </li>
            ))}
            {!bothIn ? (
              <li className="text-slate-500">Waiting for player 2…</li>
            ) : null}
          </ul>
          {isHost ? (
            <button
              type="button"
              disabled={busy || !bothIn}
              onClick={startGame}
              className="mt-auto rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 py-3.5 text-sm font-semibold text-white disabled:opacity-50"
            >
              Start quiz ({roomState.totalQuestions} questions)
            </button>
          ) : (
            <p className="mt-auto text-center text-sm text-slate-400">
              Waiting for host to start…
            </p>
          )}
        </section>
      ) : null}

      {phase === "question" && question ? (
        <section className="mt-6 flex flex-1 flex-col">
          <div className="mb-3 flex items-center justify-between text-xs text-slate-400">
            <span>{question.category}</span>
            <span>
              Q {roomState.questionIndex + 1} / {roomState.totalQuestions}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-400 transition-all"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <h2 className="mt-6 text-xl font-semibold leading-snug text-white sm:text-2xl">
            {question.prompt}
          </h2>
          <div className="mt-6 flex flex-col gap-3">
            {question.options.map((opt, idx) => {
              const selected = you.answer === idx;
              const disabled = you.answer !== null || busy;
              return (
                <button
                  key={opt}
                  type="button"
                  disabled={disabled}
                  onClick={() => submitAnswer(idx)}
                  className={`rounded-2xl border px-4 py-4 text-left text-sm font-medium transition sm:text-base ${
                    selected
                      ? "border-violet-400 bg-violet-900/50 text-white"
                      : "border-white/10 bg-slate-900/80 text-slate-100 hover:border-violet-400/40 hover:bg-slate-800/80"
                  } disabled:opacity-70`}
                >
                  <span className="mr-2 font-mono text-violet-300">
                    {String.fromCharCode(65 + idx)}.
                  </span>
                  {opt}
                </button>
              );
            })}
          </div>
          {you.answer !== null && opponent && !opponent.hasAnswered ? (
            <p className="mt-4 text-center text-sm text-slate-400">
              Answer locked in — waiting for {opponent.name}…
            </p>
          ) : null}
        </section>
      ) : null}

      {phase === "reveal" && question && roomState.correctIndex !== null ? (
        <section className="mt-6 flex flex-1 flex-col rounded-3xl border border-amber-400/30 bg-amber-950/20 p-6">
          <h2 className="text-lg font-semibold text-amber-100">Answer reveal</h2>
          <p className="mt-2 text-sm text-slate-300">{question.prompt}</p>
          <p className="mt-4 rounded-xl bg-emerald-900/40 px-4 py-3 text-emerald-100">
            Correct:{" "}
            <strong>
              {String.fromCharCode(65 + roomState.correctIndex)}.{" "}
              {question.options[roomState.correctIndex]}
            </strong>
          </p>
          <ul className="mt-4 space-y-2 text-sm">
            {players.map((p) => (
              <li key={p.id} className="text-slate-200">
                {p.name}:{" "}
                {p.answerIndex === null ? (
                  <span className="text-slate-500">No answer</span>
                ) : (
                  <span className={p.wasCorrect ? "text-emerald-300" : "text-red-300"}>
                    {p.wasCorrect ? "Correct (+1)" : "Wrong"}
                  </span>
                )}
              </li>
            ))}
          </ul>
          <p className="mt-auto pt-6 text-center text-xs text-slate-500">
            Next question in a moment…
          </p>
        </section>
      ) : null}

      {phase === "finished" ? (
        <section className="mt-8 flex flex-1 flex-col items-center justify-center rounded-3xl border border-violet-400/30 bg-gradient-to-b from-violet-950/60 to-slate-950 p-8 text-center">
          <h2 className="text-3xl font-bold text-white">Game over</h2>
          <div className="mt-6 w-full space-y-3">
            {players
              .slice()
              .sort((a, b) => b.score - a.score)
              .map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between rounded-xl bg-black/30 px-4 py-3"
                >
                  <span className="font-medium text-white">{p.name}</span>
                  <span className="text-xl font-bold tabular-nums text-violet-200">
                    {p.score} / {roomState.totalQuestions}
                  </span>
                </div>
              ))}
          </div>
          <p className="mt-6 text-lg text-violet-100">
            {roomState.winnerIds.length > 1
              ? "It's a tie!"
              : roomState.winnerIds[0] === playerId
                ? "You win!"
                : `${players.find((p) => p.id === roomState.winnerIds[0])?.name ?? "Opponent"} wins!`}
          </p>
          <button
            type="button"
            onClick={leaveRoom}
            className="mt-8 rounded-xl bg-violet-500 px-6 py-3 text-sm font-semibold text-white"
          >
            Play again
          </button>
        </section>
      ) : null}

      {error ? (
        <p className="mt-4 text-center text-sm text-red-300" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
