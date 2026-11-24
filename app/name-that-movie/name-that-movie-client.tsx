"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useMatchScore } from "@/lib/funquiz/use-match-score";
import { createClient } from "@/lib/supabase/client";
import { isValidRoomCode, normalizeRoomCode, formatRoomCodeSpaced } from "@/lib/funquiz/room-code";
import type { MovieClientState } from "@/lib/name-that-movie/room";
import {
  MOVIE_DIFFICULTY_OPTIONS,
  MOVIE_PLAY_MODES,
  type MovieDifficulty,
  type MoviePlayMode,
} from "@/lib/name-that-movie/types";
import { openRoomByCode } from "@/lib/room-directory";

const PLAYER_ID_KEY = "name-that-movie-player-id";
const PLAYER_NAME_KEY = "name-that-movie-player-name";

function getOrCreatePlayerId(): string {
  let id = localStorage.getItem(PLAYER_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(PLAYER_ID_KEY, id);
  }
  return id;
}

function optionLetter(index: number): string {
  return String.fromCharCode(65 + index);
}

async function parseState(res: Response): Promise<MovieClientState | null> {
  const body = (await res.json()) as { state?: MovieClientState; error?: string };
  if (!res.ok || !body.state) {
    throw new Error(body.error || "Something went wrong");
  }
  if (body.state.error) {
    throw new Error(body.state.error);
  }
  return body.state;
}

function keepNewerState(prev: MovieClientState | null, next: MovieClientState): MovieClientState {
  if (prev && prev.code === next.code && next.revision < prev.revision) {
    return prev;
  }
  return next;
}

export function NameThatMovieClient() {
  const [screen, setScreen] = useState<"home" | "game">("home");
  const [playerId, setPlayerId] = useState("");
  const [name, setName] = useState("");
  const [difficulty, setDifficulty] = useState<MovieDifficulty | null>(null);
  const [mode, setMode] = useState<MoviePlayMode | null>(null);
  const [joinCode, setJoinCode] = useState("");
  const [roomState, setRoomState] = useState<MovieClientState | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorScope, setErrorScope] = useState<"create" | "join" | null>(null);

  useEffect(() => {
    const id = getOrCreatePlayerId();
    setPlayerId(id);
    const saved = localStorage.getItem(PLAYER_NAME_KEY)?.trim() ?? "";
    if (saved) setName(saved);
    const params = new URLSearchParams(window.location.search);
    const join = params.get("join");
    const room = params.get("room");
    const incoming = normalizeRoomCode(join || room || "");
    if (!isValidRoomCode(incoming)) return;
    setJoinCode(incoming);

    async function joinFromLink(code: string) {
      if (!saved) {
        setErrorScope("join");
        setError("Enter your name, then press Join room.");
        requestAnimationFrame(() => {
          document.getElementById("movie-name")?.scrollIntoView({ behavior: "smooth", block: "center" });
        });
        return;
      }
      try {
        const res = await fetch("/api/name-that-movie/room/join", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code, playerId: id, playerName: saved }),
        });
        const state = await parseState(res);
        if (!state) return;
        setRoomState(state);
        const url = new URL(window.location.href);
        url.searchParams.set("room", state.code);
        url.searchParams.delete("join");
        window.history.replaceState(null, "", `${url.pathname}?${url.searchParams.toString()}`);
        setScreen("game");
      } catch (err) {
        const message = err instanceof Error ? err.message : "Could not join room";
        if (await openRoomByCode(code, saved, "/name-that-movie")) return;
        setErrorScope("join");
        setError(message);
        requestAnimationFrame(() => {
          document.getElementById("movie-join")?.scrollIntoView({ behavior: "smooth", block: "center" });
        });
      }
    }

    if (!room) {
      void joinFromLink(incoming);
      return;
    }
    const code = normalizeRoomCode(room);
    void fetch(`/api/name-that-movie/room/${code}?playerId=${encodeURIComponent(id)}`, {
      cache: "no-store",
    })
      .then(parseState)
      .then((state) => {
        if (!state) return;
        setRoomState(state);
        setScreen("game");
      })
      .catch((err) => {
        const message = err instanceof Error ? err.message : "";
        if (message === "You are not in this room") void joinFromLink(code);
      });
  }, []);

  const code = roomState?.code ?? "";

  const poll = useCallback(async () => {
    if (!code || !playerId || screen !== "game") return;
    try {
      const res = await fetch(
        `/api/name-that-movie/room/${encodeURIComponent(code)}?playerId=${encodeURIComponent(playerId)}`,
        { cache: "no-store" },
      );
      const state = await parseState(res);
      if (state) setRoomState((prev) => keepNewerState(prev, state));
    } catch {
      /* ignore transient poll errors */
    }
  }, [code, playerId, screen]);

  useEffect(() => {
    if (screen !== "game" || !code) return;
    void poll();
    const pollMs = roomState?.phase === "lobby" || roomState?.phase === "finished" ? 2000 : 1000;
    const id = setInterval(() => void poll(), pollMs);
    return () => clearInterval(id);
  }, [screen, code, poll, roomState?.phase]);

  useEffect(() => {
    if (screen !== "game" || !code) return;
    try {
      const supabase = createClient();
      const channel = supabase
        .channel(`name-that-movie:${code}`)
        .on("broadcast", { event: "sync" }, () => {
          void poll();
        })
        .subscribe();
      return () => {
        void supabase.removeChannel(channel);
      };
    } catch {
      return;
    }
  }, [screen, code, poll]);

  function rememberRoom(nextCode: string) {
    const url = new URL(window.location.href);
    url.searchParams.set("room", nextCode);
    url.searchParams.delete("join");
    window.history.replaceState(null, "", `${url.pathname}?${url.searchParams.toString()}`);
  }

  function clearRoomQuery() {
    window.history.replaceState(null, "", window.location.pathname);
  }

  function showSetupError(elementId: string, message: string, scope: "create" | "join" = "create") {
    setErrorScope(scope);
    setError(message);
    requestAnimationFrame(() => {
      document.getElementById(elementId)?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }

  async function createRoom() {
    setError(null);
    setErrorScope(null);
    if (!name.trim()) {
      showSetupError("movie-name", "Enter your name first.");
      return;
    }
    if (!mode) {
      showSetupError("movie-mode", "Choose single player, play together, or play separate.");
      return;
    }
    if (!difficulty) {
      showSetupError("movie-difficulty", "Choose a difficulty.");
      return;
    }
    const activePlayerId = playerId || getOrCreatePlayerId();
    if (!playerId) setPlayerId(activePlayerId);
    localStorage.setItem(PLAYER_NAME_KEY, name.trim());
    setBusy(true);
    try {
      const res = await fetch("/api/name-that-movie/room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerId: activePlayerId,
          playerName: name.trim(),
          difficulty,
          mode,
        }),
      });
      const state = await parseState(res);
      if (state) {
        setRoomState(state);
        rememberRoom(state.code);
        setScreen("game");
      }
    } catch (err) {
      setErrorScope("create");
      setError(err instanceof Error ? err.message : "Could not create room");
    } finally {
      setBusy(false);
    }
  }

  async function joinRoom() {
    setError(null);
    setErrorScope(null);
    if (!name.trim()) {
      showSetupError("movie-name", "Enter your name, then press Join room.", "join");
      return;
    }
    const normalized = normalizeRoomCode(joinCode);
    if (!isValidRoomCode(normalized)) {
      showSetupError("movie-join", "Room code must be 6 letters or numbers.", "join");
      return;
    }
    const activePlayerId = playerId || getOrCreatePlayerId();
    if (!playerId) setPlayerId(activePlayerId);
    localStorage.setItem(PLAYER_NAME_KEY, name.trim());
    setBusy(true);
    try {
      const res = await fetch("/api/name-that-movie/room/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: normalized,
          playerId: activePlayerId,
          playerName: name.trim(),
        }),
      });
      const state = await parseState(res);
      if (state) {
        setRoomState(state);
        rememberRoom(state.code);
        setScreen("game");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not join room";
      if (await openRoomByCode(normalized, name, "/name-that-movie")) return;
      showSetupError("movie-join", message, "join");
    } finally {
      setBusy(false);
    }
  }

  async function startGame() {
    if (!roomState) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/name-that-movie/room/${roomState.code}/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId }),
      });
      const state = await parseState(res);
      if (state) setRoomState(state);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start");
    } finally {
      setBusy(false);
    }
  }

  async function submitAnswer(choiceIndex: number) {
    if (!roomState?.canSubmitAnswer) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/name-that-movie/room/${roomState.code}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId, choiceIndex }),
      });
      const state = await parseState(res);
      if (state) setRoomState(state);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit answer");
    } finally {
      setBusy(false);
    }
  }

  async function playAgain() {
    if (!roomState || roomState.hostId !== playerId) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/name-that-movie/room/${roomState.code}/new-game`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId }),
      });
      const state = await parseState(res);
      if (state) setRoomState(state);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start a new game");
    } finally {
      setBusy(false);
    }
  }

  function leaveRoom() {
    setScreen("home");
    setRoomState(null);
    setError(null);
    clearRoomQuery();
  }

  useMatchScore({
    game: "Name That Movie",
    roomCode: roomState?.code,
    phase: roomState?.phase,
    score: roomState ? (roomState.jointScore ?? roomState.you.score) : undefined,
    won: !!roomState && (roomState.winnerIds.includes(playerId) || (roomState.jointScore !== null && roomState.winnerIds.length !== 1)),
  });

  if (screen === "home") {
    return (
      <div className="mx-auto flex min-h-[100dvh] max-w-lg flex-col justify-center px-4 py-10">
        <div className="rounded-3xl border border-violet-400/25 bg-gradient-to-b from-slate-900/95 to-indigo-950/90 p-6 shadow-2xl shadow-violet-900/40 sm:p-8">
          <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-violet-300">
            TeleFeet
          </p>
          <h1 className="mt-3 text-center text-4xl font-bold tracking-tight text-white">
            Name That Movie!
          </h1>
          <p className="mt-3 text-center text-sm leading-relaxed text-slate-300">
            Two players, one room. Play together on the same lines, or take turns and compare
            scores.
          </p>

          <label
            id="movie-name"
            className={`mt-6 block rounded-2xl text-sm font-medium text-slate-200 ${error === "Enter your name first." || error === "Enter your name, then press Join room." ? "ring-2 ring-red-400" : ""}`}
          >
            Your name
            <input
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-violet-400/60"
              value={name}
              maxLength={24}
              onChange={(event) => {
                setName(event.target.value);
                setError(null);
                setErrorScope(null);
              }}
              placeholder="Alex"
              autoComplete="nickname"
            />
          </label>

          <div
            id="movie-mode"
            className={`mt-6 rounded-2xl p-1 ${error === "Choose single player, play together, or play separate." ? "ring-2 ring-red-400" : ""}`}
          >
            <p className="text-sm font-medium text-slate-200">How to play</p>
            <div className="mt-3 grid gap-3">
              {MOVIE_PLAY_MODES.map((option) => {
                const selected = mode === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => {
                      setMode(option.id);
                      setError(null);
                    }}
                    className={`rounded-2xl border p-4 text-left transition ${
                      selected
                        ? "border-violet-400 bg-violet-950/50 ring-1 ring-violet-400/40"
                        : "border-white/10 bg-black/30 hover:border-violet-400/40"
                    }`}
                  >
                    <p className="text-sm font-semibold text-violet-200">{option.title}</p>
                    <p className="mt-1 text-xs leading-relaxed text-slate-400">{option.description}</p>
                  </button>
                );
              })}
            </div>
            {error === "Choose single player, play together, or play separate." ? (
              <p className="mt-3 text-center text-sm text-red-300">{error}</p>
            ) : null}
          </div>

          <div
            id="movie-difficulty"
            className={`mt-6 rounded-2xl p-1 ${error === "Choose a difficulty." ? "ring-2 ring-red-400" : ""}`}
          >
            <p className="text-sm font-medium text-slate-200">Difficulty</p>
            <div className="mt-3 grid gap-3">
              {MOVIE_DIFFICULTY_OPTIONS.map((option) => {
                const selected = difficulty === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => {
                      setDifficulty(option.id);
                      setError(null);
                    }}
                    className={`rounded-2xl border p-4 text-left transition ${
                      selected
                        ? "border-violet-400 bg-violet-950/50 ring-1 ring-violet-400/40"
                        : "border-white/10 bg-black/30 hover:border-violet-400/40"
                    }`}
                  >
                    <p className="text-sm font-semibold text-violet-200">{option.title}</p>
                    <p className="mt-1 text-xs leading-relaxed text-slate-400">{option.description}</p>
                  </button>
                );
              })}
            </div>
            {error === "Choose a difficulty." ? (
              <p className="mt-3 text-center text-sm text-red-300">{error}</p>
            ) : null}
          </div>

          <button
            type="button"
            disabled={busy}
            onClick={() => void createRoom()}
            className="mt-6 w-full rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-700/30 transition hover:brightness-110 disabled:opacity-60"
          >
            Create room
          </button>
          {error && errorScope !== "join" ? (
            <p className="mt-4 text-center text-sm text-red-300" role="alert">
              {error}
            </p>
          ) : null}

          <div className="my-6 flex items-center gap-3 text-xs text-slate-500">
            <span className="h-px flex-1 bg-white/10" />
            or join with code
            <span className="h-px flex-1 bg-white/10" />
          </div>

          <div
            id="movie-join"
            className={`rounded-2xl p-1 ${errorScope === "join" ? "ring-2 ring-red-400" : ""}`}
          >
            <label className="block text-sm font-medium text-slate-200">
              Room code
              <input
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-center font-mono text-lg tracking-[0.35em] text-white uppercase outline-none focus:ring-2 focus:ring-violet-400/60"
                value={joinCode}
                onChange={(event) => setJoinCode(normalizeRoomCode(event.target.value))}
                placeholder="ABC123"
                maxLength={12}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    void joinRoom();
                  }
                }}
                autoCapitalize="characters"
                autoCorrect="off"
                spellCheck={false}
              />
            </label>
            <button
              type="button"
              disabled={busy}
              onClick={() => void joinRoom()}
              className="mt-4 w-full rounded-xl border border-violet-400/50 bg-violet-950/50 py-3.5 text-sm font-semibold text-violet-100 transition hover:bg-violet-900/60 disabled:opacity-60"
            >
              Join room
            </button>
            {errorScope === "join" && error ? (
              <p className="mt-3 text-center text-sm text-red-300" role="alert">
                {error}
              </p>
            ) : null}
          </div>

          <p className="mt-6 text-center text-xs text-slate-500">
            <Link href="/funquiz" className="text-violet-300 hover:text-violet-200">
              Fun Quiz
            </Link>
          </p>
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

  const opponent = roomState.players.find((player) => player.id !== playerId);
  const bothIn = roomState.mode === "single" || roomState.players.length >= 2;
  const isHost = roomState.hostId === playerId;
  const progressPct =
    roomState.phase === "finished"
      ? 100
      : Math.round(((roomState.turnIndex + 1) / roomState.totalTurns) * 100);

  return (
    <div className="mx-auto flex min-h-[100dvh] max-w-2xl flex-col px-4 py-6 pb-10">
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-violet-300">
            Room {roomState.code} · {roomState.modeTitle} · {roomState.difficultyTitle}
          </p>
          <h1 className="text-2xl font-bold text-white">Name That Movie!</h1>
        </div>
        <button
          type="button"
          onClick={leaveRoom}
          className="rounded-lg border border-white/15 px-3 py-1.5 text-xs text-slate-300 hover:bg-white/5"
        >
          Leave
        </button>
      </header>

      {roomState.jointScore !== null ? (
        <div className="mt-4 rounded-2xl border border-violet-400/50 bg-violet-950/40 px-5 py-4">
          <p className="text-sm font-semibold text-violet-200">Team score</p>
          <p className="mt-1 text-3xl font-bold tabular-nums text-white">
            {roomState.jointScore}{" "}
            <span className="text-lg font-medium text-violet-300/90">/ {roomState.totalTurns}</span>
          </p>
          <p className="mt-2 text-xs text-slate-400">
            {roomState.you.name} & {opponent?.name ?? "Partner"} · play together
          </p>
        </div>
      ) : (
      <div className="mt-4 grid grid-cols-2 gap-3">
        {[roomState.you, opponent].filter(Boolean).map((player) => (
          <div
            key={player!.id}
            className={`rounded-2xl border px-4 py-3 ${
              player!.id === playerId
                ? "border-violet-400/50 bg-violet-950/40"
                : "border-white/10 bg-slate-900/60"
            }`}
          >
            <p className="truncate text-sm font-semibold text-white">
              {player!.name}
              {player!.id === playerId ? " (you)" : ""}
            </p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-violet-200">
              {player!.score}{" "}
              <span className="text-base font-medium text-violet-300/80">
                / {roomState.questionsPerPlayer}
              </span>
            </p>
          </div>
        ))}
      </div>
      )}

      {roomState.phase === "lobby" ? (
        <section className="mt-8 flex flex-1 flex-col rounded-3xl border border-white/10 bg-slate-900/70 p-6">
          <h2 className="text-lg font-semibold text-white">Waiting room</h2>
          <p className="mt-2 text-sm text-slate-300">
            Mode: <strong className="text-violet-200">{roomState.modeTitle}</strong>
          </p>
          <p className="mt-1 text-sm text-slate-300">
            Difficulty: <strong className="text-violet-200">{roomState.difficultyTitle}</strong>
          </p>
          <p className="mt-2 text-sm text-slate-300">
            Share code{" "}
            <span className="select-none font-mono text-lg tracking-[0.2em] text-violet-200">
              {formatRoomCodeSpaced(roomState.code)}
            </span>
            <button
              type="button"
              className="ml-2 rounded-lg border border-violet-400/40 px-2 py-0.5 text-xs text-violet-200"
              onClick={() => {
                const link = `${window.location.origin}/name-that-movie?join=${roomState.code}`;
                void navigator.clipboard?.writeText(link);
              }}
            >
              Copy link
            </button>
          </p>
          <ul className="mt-4 space-y-2 text-sm text-slate-200">
            {roomState.players.map((player) => (
              <li key={player.id} className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                {player.name}
              </li>
            ))}
            {!bothIn ? <li className="text-slate-500">Waiting for player 2…</li> : null}
          </ul>
          {isHost ? (
            <button
              type="button"
              disabled={busy || !bothIn}
              onClick={() => void startGame()}
              className="mt-auto rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 py-3.5 text-sm font-semibold text-white disabled:opacity-50"
            >
              Start game
            </button>
          ) : (
            <p className="mt-auto text-center text-sm text-slate-400">Waiting for host to start…</p>
          )}
          {error ? (
            <p className="mt-4 text-center text-sm text-red-300" role="alert">
              {error}
            </p>
          ) : null}
        </section>
      ) : null}

      {roomState.phase === "finished" ? (
        <section className="mt-6 flex flex-1 flex-col rounded-3xl border border-violet-400/30 bg-slate-950/80 p-5 sm:p-6">
          <h2 className="text-2xl font-bold text-white">Results</h2>
          <p className="mt-2 text-lg text-violet-100">
            {roomState.jointScore !== null
              ? `Team score: ${roomState.jointScore} / ${roomState.totalTurns} (${
                  roomState.totalTurns === 0
                    ? 0
                    : Math.round((roomState.jointScore / roomState.totalTurns) * 100)
                }%)`
              : roomState.winnerIds.length === 2
                ? "It's a tie."
                : roomState.winnerIds.includes(playerId)
                  ? "You win."
                  : `${opponent?.name ?? "Your opponent"} wins.`}
          </p>
          <div className="mt-5 max-h-80 overflow-y-auto rounded-xl border border-white/10">
            <table className="w-full text-left text-xs text-slate-200">
              <thead className="sticky top-0 bg-slate-900 text-slate-400">
                <tr>
                  <th className="p-2">#</th>
                  <th className="p-2">Player</th>
                  <th className="p-2">Answer</th>
                  <th className="p-2">Film</th>
                </tr>
              </thead>
              <tbody>
                {roomState.results?.map((row) => (
                  <tr key={row.turnIndex} className="border-t border-white/5 align-top">
                    <td className="p-2">{row.turnIndex + 1}</td>
                    <td className="p-2">{row.playerName}</td>
                    <td className="p-2">{row.chosenLabel}</td>
                    <td className={`p-2 ${row.correct ? "text-emerald-300" : "text-red-300"}`}>
                      {row.correctLabel} {row.correct ? "✓" : "✗"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {isHost ? (
            <button
              type="button"
              disabled={busy}
              onClick={() => void playAgain()}
              className="mt-6 w-full rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-700/30 transition hover:brightness-110 disabled:opacity-60"
            >
              Play again
            </button>
          ) : (
            <p className="mt-6 text-center text-sm text-slate-400">
              Waiting for the host to start a new game…
            </p>
          )}
        </section>
      ) : null}

      {roomState.phase !== "lobby" && roomState.phase !== "finished" && roomState.question ? (
        <section className="mt-6 flex flex-1 flex-col">
          <div className="mb-3 flex items-center justify-between text-xs text-slate-400">
            <span>
              {roomState.phase === "reveal"
                ? "Answer revealed"
                : roomState.jointScore !== null
                  ? roomState.isYourTurn
                    ? "Submit for the team"
                    : "Discuss"
                  : roomState.isYourTurn
                    ? "Your turn"
                    : "Watch along"}
            </span>
            <span>
              {roomState.jointScore !== null ? "Question" : "Turn"}{" "}
              {Math.min(roomState.turnIndex + 1, roomState.totalTurns)} / {roomState.totalTurns}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-400 transition-all"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          {roomState.statusMessage ? (
            <p className="mt-4 text-center text-sm text-slate-300">{roomState.statusMessage}</p>
          ) : null}
          <h2 className="mt-6 text-lg font-semibold leading-snug text-white sm:text-2xl">
            <span className="text-violet-300" aria-hidden="true">
              “
            </span>
            {roomState.question.quote}
            <span className="text-violet-300" aria-hidden="true">
              ”
            </span>
          </h2>
          <div className="mt-6 flex flex-col gap-3">
            {roomState.question.options.map((option, optionIndex) => {
              const feedback = roomState.feedback;
              const revealed = roomState.phase === "reveal" && feedback !== null;
              const picked = feedback?.choiceIndex === optionIndex;
              const isAnswer = feedback?.correctIndex === optionIndex;
              let tone =
                "border-white/10 bg-slate-900/80 text-slate-100 hover:border-violet-400/40 hover:bg-slate-800/80";
              if (revealed && isAnswer) {
                tone = "border-emerald-400 bg-emerald-900/50 text-white";
              } else if (revealed && picked) {
                tone = "border-red-400 bg-red-950/50 text-white";
              } else if (revealed) {
                tone = "border-white/10 bg-slate-900/50 text-slate-300 opacity-70";
              }
              return (
                <button
                  key={`${roomState.turnIndex}-${option}`}
                  type="button"
                  disabled={!roomState.canSubmitAnswer || busy}
                  onClick={() => void submitAnswer(optionIndex)}
                  className={`rounded-2xl border px-4 py-4 text-left text-sm font-medium transition sm:text-base disabled:opacity-100 ${tone}`}
                >
                  <span className="mr-2 font-mono text-violet-300">{optionLetter(optionIndex)}.</span>
                  {option}
                </button>
              );
            })}
          </div>
          {roomState.feedback ? (
            <div className="mt-6 rounded-3xl border border-amber-400/30 bg-amber-950/20 p-5" role="status">
              <p
                className={`rounded-xl px-4 py-3 text-sm font-semibold ${
                  roomState.feedback.correct
                    ? "bg-emerald-900/50 text-emerald-100"
                    : "bg-red-950/50 text-red-100"
                }`}
              >
                {roomState.feedback.correct ? "Correct!" : "Incorrect"}
              </p>
              <p className="mt-3 rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-slate-200">
                {roomState.feedback.playerName} chose{" "}
                <strong>
                  {optionLetter(roomState.feedback.choiceIndex)}. {roomState.feedback.chosenLabel}
                </strong>
              </p>
              <p className="mt-3 rounded-xl bg-emerald-900/40 px-4 py-3 text-sm text-emerald-100">
                Correct answer:{" "}
                <strong>
                  {optionLetter(roomState.feedback.correctIndex)}. {roomState.feedback.correctLabel}
                </strong>
              </p>
            </div>
          ) : null}
        </section>
      ) : null}

      {error && roomState.phase !== "lobby" ? (
        <p className="mt-4 text-center text-sm text-red-300" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
