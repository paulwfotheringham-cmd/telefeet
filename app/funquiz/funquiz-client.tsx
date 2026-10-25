"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { QUIZ_CATEGORIES } from "@/lib/funquiz/categories";
import type { QuizCategoryId } from "@/lib/funquiz/categories";
import { QUIZ_DIFFICULTIES } from "@/lib/funquiz/difficulties";
import type { QuizDifficulty } from "@/lib/funquiz/difficulties";
import { MillionaireStage } from "@/components/funquiz/millionaire-stage";
import {
  GAME_MODE_PLAY_TOGETHER,
  GAME_MODE_SHARED_MILLIONAIRE,
  GAME_MODE_TAKE_TURNS,
} from "@/lib/funquiz/constants";
import type { ClientRoomState, GameMode } from "@/lib/funquiz/types";

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

function gameModeLabel(mode: GameMode): string {
  if (mode === GAME_MODE_TAKE_TURNS) return "Take turns";
  if (mode === GAME_MODE_SHARED_MILLIONAIRE) return "Shared Millionaire";
  return "Play together";
}

async function parseState(res: Response): Promise<ClientRoomState | null> {
  const data = (await res.json()) as { state?: ClientRoomState; error?: string };
  if (!res.ok) {
    throw new Error(data.error ?? "Request failed");
  }
  return data.state ?? null;
}

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
  return {
    ...next,
    players,
    you,
    error: players.some((p) => p.id === next.you.id) ? undefined : next.error,
  };
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
  const [selectedMode, setSelectedMode] = useState<GameMode | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<QuizDifficulty | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<QuizCategoryId | null>(null);
  const [newGameMode, setNewGameMode] = useState<GameMode | null>(null);
  const [newGameDifficulty, setNewGameDifficulty] = useState<QuizDifficulty | null>(null);
  const [newGameCategory, setNewGameCategory] = useState<QuizCategoryId | null>(null);
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
      .then((h: { ok?: boolean; store?: string; missingEnv?: string[]; hint?: string }) => {
        if (!h.ok || h.store === "none") {
          const missing =
            h.missingEnv && h.missingEnv.length > 0
              ? ` Missing: ${h.missingEnv.join(", ")}.`
              : "";
          setStoreWarning(
            (h.hint ??
              "Multiplayer storage is unavailable. Supabase must be configured on the server.") +
              missing,
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
    if (!selectedMode) {
      setError("Select a game mode before creating a room.");
      return;
    }
    if (!selectedDifficulty) {
      setError("Select a difficulty before creating a room.");
      return;
    }
    if (!selectedCategory) {
      setError("Choose a quiz category before creating a room.");
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
        body: JSON.stringify({
          playerId: activePlayerId,
          playerName: name.trim(),
          gameMode: selectedMode,
          quizDifficulty: selectedDifficulty,
          quizCategory: selectedCategory,
        }),
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
    if (!roomState?.code || !roomState.canSubmitAnswer) return;
    setBusy(true);
    setError(null);
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

  const playAgainSameSettings = async () => {
    if (!roomState?.code || roomState.hostId !== playerId) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/funquiz/room/${roomState.code}/new-game`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerId,
          gameMode: roomState.gameMode,
          quizCategory: roomState.quizCategoryId,
          quizDifficulty: roomState.quizDifficulty,
        }),
      });
      const state = await parseState(res);
      if (state) setRoomState(state);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not start new game");
    } finally {
      setBusy(false);
    }
  };

  const startNewGame = async () => {
    if (!roomState?.code || !newGameMode || !newGameDifficulty || !newGameCategory) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/funquiz/room/${roomState.code}/new-game`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerId,
          gameMode: newGameMode,
          quizDifficulty: newGameDifficulty,
          quizCategory: newGameCategory,
        }),
      });
      const state = await parseState(res);
      if (state) {
        setRoomState(state);
        setNewGameMode(null);
        setNewGameCategory(null);
        setNewGameDifficulty(null);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not start new game");
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
    setNewGameMode(null);
    setNewGameCategory(null);
    setNewGameDifficulty(null);
  };

  if (screen === "home") {
    return (
      <div className="mx-auto flex min-h-[100dvh] max-w-lg flex-col justify-center px-4 py-10">
        <div className="rounded-3xl border border-violet-400/25 bg-gradient-to-b from-slate-900/95 to-indigo-950/90 p-8 shadow-2xl shadow-violet-900/40">
          <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-violet-300">
            Two-player quiz
          </p>
          <h1 className="mt-3 text-center font-bold tracking-tight text-white text-4xl">
            Fun Quiz
          </h1>
          <p className="mt-3 text-center text-sm leading-relaxed text-slate-300">
            Choose a mode, create a room, and share the code with a friend.
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
              placeholder="Enter your name"
              maxLength={24}
              autoComplete="nickname"
            />
          </label>

          <p className="mt-6 text-sm font-medium text-slate-200">Game mode</p>
          <div className="mt-3 grid gap-3">
            <button
              type="button"
              onClick={() => setSelectedMode(GAME_MODE_TAKE_TURNS)}
              className={`rounded-2xl border p-4 text-left transition ${
                selectedMode === GAME_MODE_TAKE_TURNS
                  ? "border-violet-400 bg-violet-950/50"
                  : "border-white/10 bg-black/30 hover:border-violet-400/40"
              }`}
            >
              <p className="text-sm font-semibold text-violet-200">Game 1 — Take turns</p>
              <p className="mt-2 text-xs leading-relaxed text-slate-300">
                Answer 25 different questions each. Take turns answering. See the correct
                answers and compare your scores at the end.
              </p>
            </button>
            <button
              type="button"
              onClick={() => setSelectedMode(GAME_MODE_PLAY_TOGETHER)}
              className={`rounded-2xl border p-4 text-left transition ${
                selectedMode === GAME_MODE_PLAY_TOGETHER
                  ? "border-violet-400 bg-violet-950/50"
                  : "border-white/10 bg-black/30 hover:border-violet-400/40"
              }`}
            >
              <p className="text-sm font-semibold text-violet-200">Game 2 — Play together</p>
              <p className="mt-2 text-xs leading-relaxed text-slate-300">
                Answer 50 shared questions together. Discuss each question and let the room
                creator submit the agreed answer. See whether you are correct after every
                question.
              </p>
            </button>
            <button
              type="button"
              onClick={() => setSelectedMode(GAME_MODE_SHARED_MILLIONAIRE)}
              className={`rounded-2xl border p-4 text-left transition ${
                selectedMode === GAME_MODE_SHARED_MILLIONAIRE
                  ? "border-amber-400 bg-amber-950/30"
                  : "border-white/10 bg-black/30 hover:border-amber-400/40"
              }`}
            >
              <p className="text-sm font-semibold text-amber-200">Game 3 — Shared Millionaire</p>
              <p className="mt-2 text-xs leading-relaxed text-slate-300">
                Work together. Beat the ladder. Win the million. Lock in answers together,
                use shared lifelines, and climb ten prize milestones.
              </p>
            </button>
          </div>

          {selectedMode ? (
            <>
              <p className="mt-6 text-sm font-medium text-slate-200">Difficulty</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {QUIZ_DIFFICULTIES.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => {
                      setSelectedDifficulty(d.id);
                      setSelectedCategory(null);
                    }}
                    className={`rounded-xl border p-3 text-left transition ${
                      selectedDifficulty === d.id
                        ? "border-violet-400 bg-violet-950/50 ring-1 ring-violet-400/40"
                        : "border-white/10 bg-black/30 hover:border-violet-400/40"
                    }`}
                  >
                    <p className="text-xs font-semibold text-violet-200">{d.title}</p>
                    <p className="mt-1 text-[11px] leading-snug text-slate-400">{d.description}</p>
                  </button>
                ))}
              </div>
            </>
          ) : null}

          {selectedMode && selectedDifficulty ? (
            <>
              <p className="mt-6 text-sm font-medium text-slate-200">Choose your quiz</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {QUIZ_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`rounded-xl border p-3 text-left transition ${
                      selectedCategory === cat.id
                        ? "border-violet-400 bg-violet-950/50 ring-1 ring-violet-400/40"
                        : "border-white/10 bg-black/30 hover:border-violet-400/40"
                    }`}
                  >
                    <p className="text-xs font-semibold text-violet-200">{cat.title}</p>
                    <p className="mt-1 text-[11px] leading-snug text-slate-400">{cat.description}</p>
                  </button>
                ))}
              </div>
            </>
          ) : null}

          <button
            type="button"
            disabled={busy || !selectedMode || !selectedDifficulty || !selectedCategory}
            onClick={createRoom}
            className="mt-6 w-full rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-700/30 transition hover:brightness-110 disabled:opacity-60"
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

  const { phase, question, players, you, gameMode } = roomState;
  const opponent = players.find((p) => p.id !== playerId);
  const bothIn = players.length >= 2;
  const canStartGame =
    gameMode === GAME_MODE_SHARED_MILLIONAIRE ? players.length >= 1 : bothIn;
  const isMillionaire = gameMode === GAME_MODE_SHARED_MILLIONAIRE;

  return (
    <div
      className={`mx-auto flex min-h-[100dvh] flex-col px-4 py-6 pb-10 ${isMillionaire ? "max-w-5xl" : "max-w-2xl"}`}
    >
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-violet-300">
            Room {roomState.code} · {roomState.quizDifficultyTitle} · {roomState.quizCategoryTitle} ·{" "}
            {gameModeLabel(gameMode)}
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

      {isMillionaire && phase !== "lobby" ? (
        <MillionaireStage
          roomState={roomState}
          playerId={playerId}
          isHost={isHost}
          busy={busy}
          setBusy={setBusy}
          onRefreshState={setRoomState}
          onError={setError}
          onPlayAgain={isHost ? () => void playAgainSameSettings() : undefined}
          onLeaveLobby={leaveRoom}
        />
      ) : null}

      {!isMillionaire && gameMode === GAME_MODE_PLAY_TOGETHER ? (
        <div className="mt-4 rounded-2xl border border-violet-400/50 bg-violet-950/40 px-5 py-4">
          <p className="text-sm font-semibold text-violet-200">Team score</p>
          <p className="mt-1 text-3xl font-bold tabular-nums text-white">
            {roomState.jointScore ?? 0}{" "}
            <span className="text-lg font-medium text-violet-300/90">/ 50</span>
          </p>
          <p className="mt-2 text-xs text-slate-400">
            {you.name} & {opponent?.name ?? "Partner"} · play together
          </p>
        </div>
      ) : !isMillionaire ? (
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
              <p className="mt-1 text-2xl font-bold tabular-nums text-violet-200">
                {roomState.scoresHidden ? "—" : `${p!.score} / 25`}
              </p>
            </div>
          ))}
        </div>
      ) : null}

      {phase === "lobby" ? (
        <section className="mt-8 flex flex-1 flex-col rounded-3xl border border-white/10 bg-slate-900/70 p-6">
          <h2 className="text-lg font-semibold text-white">Waiting room</h2>
          <p className="mt-2 text-sm text-slate-300">
            Difficulty:{" "}
            <strong className="text-violet-200">{roomState.quizDifficultyTitle}</strong>
          </p>
          <p className="mt-1 text-sm text-slate-300">
            Quiz:{" "}
            <strong className="text-violet-200">{roomState.quizCategoryTitle}</strong>
          </p>
          <p className="mt-1 text-sm text-slate-300">
            Mode: <strong className="text-violet-200">{gameModeLabel(gameMode)}</strong>
          </p>
          <p className="mt-2 text-sm text-slate-300">
            Share code <span className="font-mono text-lg text-violet-200">{roomState.code}</span>
          </p>
          <ul className="mt-4 space-y-2 text-sm text-slate-200">
            {players.map((p) => (
              <li key={p.id} className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                {p.name}
              </li>
            ))}
            {!bothIn ? <li className="text-slate-500">Waiting for player 2…</li> : null}
          </ul>
          {isHost ? (
            <button
              type="button"
              disabled={busy || !canStartGame}
              onClick={startGame}
              className="mt-auto rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 py-3.5 text-sm font-semibold text-white disabled:opacity-50"
            >
              Start {gameModeLabel(gameMode)}
            </button>
          ) : (
            <p className="mt-auto text-center text-sm text-slate-400">
              Waiting for host to start…
            </p>
          )}
        </section>
      ) : null}

      {!isMillionaire && phase === "question" && !question && roomState.statusMessage ? (
        <section className="mt-8 flex flex-1 flex-col items-center justify-center rounded-3xl border border-white/10 bg-slate-900/70 p-8 text-center">
          <p className="text-lg text-slate-200">{roomState.statusMessage}</p>
          {you.answer !== null ? (
            <p className="mt-4 text-sm text-emerald-300/90">Answer submitted.</p>
          ) : null}
        </section>
      ) : null}

      {!isMillionaire && phase === "question" && question ? (
        <section className="mt-6 flex flex-1 flex-col">
          <div className="mb-3 flex items-center justify-between text-xs text-slate-400">
            <span>{question.category}</span>
            <span>
              {gameMode === GAME_MODE_TAKE_TURNS
                ? `Turn ${roomState.turnIndex + 1} / ${roomState.totalQuestions}`
                : `Q ${roomState.questionIndex + 1} / ${roomState.totalQuestions}`}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-400 transition-all"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          {roomState.statusMessage ? (
            <p className="mt-4 text-center text-sm text-slate-400">{roomState.statusMessage}</p>
          ) : null}
          {question.outlineImageUrl ? (
            <div className="mt-6 flex justify-center rounded-2xl border border-white/10 bg-slate-950/80 p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={question.outlineImageUrl}
                alt="Country outline"
                className="max-h-48 w-full max-w-sm object-contain"
              />
            </div>
          ) : null}
          <h2 className="mt-6 text-xl font-semibold leading-snug text-white sm:text-2xl">
            {question.prompt}
          </h2>
          <div className="mt-6 flex flex-col gap-3">
            {question.options.map((opt, idx) => {
              const selected = you.answer === idx;
              const disabled = !roomState.canSubmitAnswer || busy;
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
        </section>
      ) : null}

      {!isMillionaire && phase === "reveal" && question && roomState.answerFeedback ? (
        <section className="mt-6 flex flex-1 flex-col rounded-3xl border border-amber-400/30 bg-amber-950/20 p-6">
          <h2 className="text-lg font-semibold text-amber-100">Answer reveal</h2>
          {question.outlineImageUrl ? (
            <div className="mt-3 flex justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={question.outlineImageUrl}
                alt="Country outline"
                className="max-h-36 max-w-xs object-contain"
              />
            </div>
          ) : null}
          <p className="mt-2 text-sm text-slate-300">{question.prompt}</p>
          <p
            className={`mt-4 rounded-xl px-4 py-3 text-sm font-semibold ${
              roomState.answerFeedback.correct
                ? "bg-emerald-900/50 text-emerald-100"
                : "bg-red-950/50 text-red-100"
            }`}
          >
            {roomState.answerFeedback.correct ? "Correct!" : "Incorrect"}
          </p>
          {!roomState.answerFeedback.correct ? (
            <p className="mt-3 rounded-xl bg-emerald-900/40 px-4 py-3 text-emerald-100">
              Correct answer:{" "}
              <strong>
                {String.fromCharCode(65 + roomState.answerFeedback.correctIndex)}.{" "}
                {roomState.answerFeedback.correctLabel}
              </strong>
            </p>
          ) : null}
          {gameMode === GAME_MODE_PLAY_TOGETHER ? (
            <p className="mt-4 text-sm text-slate-200">
              Team score: {roomState.jointScore ?? 0} out of {roomState.questionIndex + 1}{" "}
              answered.
            </p>
          ) : (
            <p className="mt-4 text-sm text-slate-200">
              {roomState.answerFeedback.correct
                ? "Nice work — next turn in a moment."
                : `You chose ${roomState.answerFeedback.chosenLabel}. Next turn in a moment.`}
            </p>
          )}
          <p className="mt-auto pt-6 text-center text-xs text-slate-500">
            Next question in a moment…
          </p>
        </section>
      ) : null}

      {!isMillionaire && phase === "finished" && roomState.results ? (
        <section className="mt-6 flex flex-1 flex-col rounded-3xl border border-violet-400/30 bg-slate-950/80 p-6">
          <h2 className="text-2xl font-bold text-white">Results</h2>
          <p className="mt-1 text-sm text-slate-400">
            {roomState.quizDifficultyTitle} · {roomState.quizCategoryTitle}
          </p>
          {gameMode === GAME_MODE_PLAY_TOGETHER ? (
            <p className="mt-2 text-violet-100">
              Joint score: {roomState.jointScore ?? 0} / 50 (
              {Math.round(((roomState.jointScore ?? 0) / 50) * 100)}% correct)
            </p>
          ) : (
            <p className="mt-2 text-violet-100">
              {roomState.winnerIds.length > 1
                ? "It's a draw!"
                : `${players.find((p) => p.id === roomState.winnerIds[0])?.name ?? "Winner"} wins`}
            </p>
          )}
          <div className="mt-4 max-h-64 overflow-y-auto rounded-xl border border-white/10">
            <table className="w-full text-left text-xs text-slate-200">
              <thead className="sticky top-0 bg-slate-900 text-slate-400">
                <tr>
                  <th className="p-2">#</th>
                  <th className="p-2">Player</th>
                  <th className="p-2">Answer</th>
                  <th className="p-2">Correct</th>
                </tr>
              </thead>
              <tbody>
                {roomState.results.map((r) => (
                  <tr key={`${r.turnIndex}-${r.playerId}`} className="border-t border-white/5">
                    <td className="p-2">{r.turnIndex + 1}</td>
                    <td className="p-2">{r.playerName}</td>
                    <td className="p-2">{r.chosenLabel ?? "—"}</td>
                    <td className={`p-2 ${r.correct ? "text-emerald-300" : "text-red-300"}`}>
                      {r.correctLabel} {r.correct ? "✓" : "✗"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {isHost ? (
            <div className="mt-6 space-y-3">
              <p className="text-sm text-slate-300">Start a new game (pick mode, difficulty and quiz):</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setNewGameMode(GAME_MODE_TAKE_TURNS)}
                  className={`rounded-lg border px-2 py-2 text-xs ${
                    newGameMode === GAME_MODE_TAKE_TURNS
                      ? "border-violet-400 bg-violet-950/50"
                      : "border-white/10"
                  }`}
                >
                  Take turns
                </button>
                <button
                  type="button"
                  onClick={() => setNewGameMode(GAME_MODE_PLAY_TOGETHER)}
                  className={`rounded-lg border px-2 py-2 text-xs ${
                    newGameMode === GAME_MODE_PLAY_TOGETHER
                      ? "border-violet-400 bg-violet-950/50"
                      : "border-white/10"
                  }`}
                >
                  Play together
                </button>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {QUIZ_DIFFICULTIES.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setNewGameDifficulty(d.id)}
                    className={`rounded-md border px-2 py-1.5 text-left text-[10px] ${
                      newGameDifficulty === d.id
                        ? "border-violet-400 bg-violet-950/50 text-violet-100"
                        : "border-white/5 text-slate-400"
                    }`}
                  >
                    {d.title}
                  </button>
                ))}
              </div>
              <div className="mt-2 max-h-40 overflow-y-auto rounded-lg border border-white/10 p-2">
                <div className="grid grid-cols-2 gap-1">
                  {QUIZ_CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setNewGameCategory(cat.id)}
                      className={`rounded-md border px-2 py-1.5 text-left text-[10px] leading-tight ${
                        newGameCategory === cat.id
                          ? "border-violet-400 bg-violet-950/50 text-violet-100"
                          : "border-white/5 text-slate-400"
                      }`}
                    >
                      {cat.title}
                    </button>
                  ))}
                </div>
              </div>
              <button
                type="button"
                disabled={busy || !newGameMode || !newGameDifficulty || !newGameCategory}
                onClick={startNewGame}
                className="w-full rounded-xl bg-violet-500 py-3 text-sm font-semibold text-white disabled:opacity-50"
              >
                New game
              </button>
            </div>
          ) : (
            <p className="mt-6 text-center text-sm text-slate-400">
              Waiting for host to start a new game…
            </p>
          )}
          <button
            type="button"
            onClick={leaveRoom}
            className="mt-4 w-full rounded-xl border border-white/15 py-3 text-sm text-slate-300"
          >
            Leave room
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
