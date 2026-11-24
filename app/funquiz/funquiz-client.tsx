"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { FriendsClub } from "@/components/funquiz/friends-club";
import { LoginScreen } from "@/components/funquiz/login-screen";
import { clubToken, type ClubSession } from "@/lib/funquiz/club-browser";
import { useMatchScore } from "@/lib/funquiz/use-match-score";
import { createClient } from "@/lib/supabase/client";
import { openRoomByCode } from "@/lib/room-directory";
import {
  QUIZ_CATEGORIES,
  QUIZ_CATEGORY_CAPITAL_CITIES,
  QUIZ_CATEGORY_COUNTRY_OUTLINES,
  QUIZ_CATEGORY_GENERAL_KNOWLEDGE,
  QUIZ_CATEGORY_GENERAL_MILITARY,
  QUIZ_CATEGORY_GEOGRAPHY,
  QUIZ_CATEGORY_HISTORY,
  QUIZ_CATEGORY_MILITARY_BATTLES,
  QUIZ_CATEGORY_MOVIES_POP_CULTURE,
  QUIZ_CATEGORY_SPACE,
  QUIZ_CATEGORY_WORLD_FLAGS,
} from "@/lib/funquiz/categories";
import type { QuizCategoryId } from "@/lib/funquiz/categories";
import { QUIZ_DIFFICULTIES, QUIZ_DIFFICULTY_INTERMEDIATE } from "@/lib/funquiz/difficulties";
import type { QuizDifficulty } from "@/lib/funquiz/difficulties";
import { BlockbustersStage } from "@/components/funquiz/blockbusters-stage";
import { CatchphraseStage } from "@/components/funquiz/catchphrase-stage";
import { HoldemStage } from "@/components/funquiz/holdem-stage";
import { MillionaireStage } from "@/components/funquiz/millionaire-stage";
import { FunQuizScorecardGraph } from "@/components/funquiz/scorecard-graph";
import {
  GAME_MODE_PLAY_TOGETHER,
  GAME_MODE_PARALLEL_MILLIONAIRE,
  GAME_MODE_SHARED_MILLIONAIRE,
  GAME_MODE_CATCHPHRASE,
  GAME_MODE_BLOCKBUSTERS,
  GAME_MODE_TAKE_TURNS,
  GAME_MODE_TEXAS_HOLDEM,
} from "@/lib/funquiz/constants";
import {
  formatRoomCodeSpaced,
  isValidRoomCode,
  normalizeRoomCode,
} from "@/lib/funquiz/room-code";
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
  if (mode === GAME_MODE_PARALLEL_MILLIONAIRE) return "Dual Millionaire";
  if (mode === GAME_MODE_TEXAS_HOLDEM) return "Texas Hold'em";
  if (mode === GAME_MODE_CATCHPHRASE) return "Catchphrase";
  if (mode === GAME_MODE_BLOCKBUSTERS) return "Blockbusters";
  return "Play together";
}

function isHoldemGameMode(mode: GameMode | null): boolean {
  return mode === GAME_MODE_TEXAS_HOLDEM;
}

function isCatchphraseGameMode(mode: GameMode | null): boolean {
  return mode === GAME_MODE_CATCHPHRASE;
}

function isBlockbustersGameMode(mode: GameMode | null): boolean {
  return mode === GAME_MODE_BLOCKBUSTERS;
}

function isStandaloneGameMode(mode: GameMode | null): boolean {
  return isHoldemGameMode(mode) || isCatchphraseGameMode(mode);
}

function isMillionaireGameMode(mode: GameMode | null): boolean {
  return mode === GAME_MODE_SHARED_MILLIONAIRE || mode === GAME_MODE_PARALLEL_MILLIONAIRE;
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


type FunQuizTile = { id: string; title: string; href?: string };

const HOME_TILE = "flex min-h-14 items-center justify-center border border-[#0e5570] bg-[#1b7596] px-2 py-2 text-center text-xs font-medium leading-tight text-white transition hover:bg-[#2188ad] sm:min-h-16 sm:text-sm";

const HOME_LABEL = `${HOME_TILE} font-semibold uppercase tracking-wide`;

const QUIZ_HOME: { id: QuizCategoryId; title: string }[] = [
  { id: QUIZ_CATEGORY_GENERAL_KNOWLEDGE, title: "General Knowledge" },
  { id: QUIZ_CATEGORY_SPACE, title: "Space" },
  { id: QUIZ_CATEGORY_HISTORY, title: "History" },
  { id: QUIZ_CATEGORY_MILITARY_BATTLES, title: "Military Battles" },
  { id: QUIZ_CATEGORY_GENERAL_MILITARY, title: "General Military" },
  { id: QUIZ_CATEGORY_CAPITAL_CITIES, title: "Capital Cities" },
  { id: QUIZ_CATEGORY_COUNTRY_OUTLINES, title: "Country Outlines" },
  { id: QUIZ_CATEGORY_GEOGRAPHY, title: "Geography" },
  { id: QUIZ_CATEGORY_MOVIES_POP_CULTURE, title: "Movies" },
  { id: QUIZ_CATEGORY_WORLD_FLAGS, title: "Flags of the world" },
];

const GAME_TILES: FunQuizTile[] = [
  { id: "millionaire", title: "Who wants to be a Millionaire" },
  { id: "holdem", title: "Texas Hold-em" },
  { id: "catchphrase", title: "Catchphrase" },
  { id: "blockbusters", title: "Blockbusters" },
];

const NAME_THAT_TILES: FunQuizTile[] = [
  { id: "movie", title: "Movie", href: "/name-that-movie" },
  { id: "show", title: "UK Game show", href: "/name-that-show" },
  { id: "computer", title: "Computer game", href: "/name-that-game" },
  { id: "tune", title: "80-90's tunes", href: "/name-that-tune" },
];

const DRAW_THAT_TILES: FunQuizTile[] = [
  { id: "organ", title: "Human Body", href: "/draw-the-organ" },
  { id: "animal", title: "Animals", href: "/draw-the-animal" },
  { id: "country", title: "Country", href: "/draw-the-country" },
  { id: "myth", title: "Myth", href: "/draw-the-myth" },
  { id: "landmark", title: "Landmark", href: "/draw-the-landmark" },
];

function homeTileClass(selected = false): string {
  return `${HOME_TILE} ${selected ? "outline outline-2 outline-offset-2 outline-[#0e5570]" : ""}`;
}

function chooseFunQuizGame(id: string, setPickedGame: (id: string) => void, setSelectedMode: (mode: GameMode | null) => void, selectedMode: GameMode | null) {
  setPickedGame(id);
  if (id === "quiz") {
    setSelectedMode(null);
    return;
  }
  if (id === "millionaire") {
    setSelectedMode(isMillionaireGameMode(selectedMode) ? selectedMode : null);
    return;
  }
  if (id === "holdem") {
    setSelectedMode(GAME_MODE_TEXAS_HOLDEM);
    return;
  }
  if (id === "catchphrase") {
    setSelectedMode(GAME_MODE_CATCHPHRASE);
    return;
  }
  if (id === "blockbusters") {
    setSelectedMode(GAME_MODE_BLOCKBUSTERS);
    return;
  }
  setSelectedMode(null);
}

export function FunQuizClient() {
  const [screen, setScreen] = useState<Screen>("home");
  const [playerId, setPlayerId] = useState(readPlayerId);
  const [name, setName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [selectedMode, setSelectedMode] = useState<GameMode | null>(null);
  const [pickedGame, setPickedGame] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<QuizDifficulty | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<QuizCategoryId | null>(null);
  const [newGameMode, setNewGameMode] = useState<GameMode | null>(null);
  const [newGameDifficulty, setNewGameDifficulty] = useState<QuizDifficulty | null>(null);
  const [newGameCategory, setNewGameCategory] = useState<QuizCategoryId | null>(null);
  const [roomState, setRoomState] = useState<ClientRoomState | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [storeWarning, setStoreWarning] = useState<string | null>(null);
  const [account, setAccount] = useState<ClubSession | null>(null);
  const [accountReady, setAccountReady] = useState(false);

  useEffect(() => {
    const id = getOrCreatePlayerId();
    setPlayerId(id);
    const saved = localStorage.getItem(PLAYER_NAME_KEY);
    if (saved) setName(saved);
    if (typeof window !== "undefined") {
      const fromUrl = new URLSearchParams(window.location.search).get("join");
      if (fromUrl) setJoinCode(normalizeRoomCode(fromUrl));
    }
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

  const code = roomState?.code ?? normalizeRoomCode(joinCode);

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
    const inActiveRound =
      roomState?.phase === "question" ||
      roomState?.phase === "reveal" ||
      roomState?.phase === "discussion";
    const pollMs = inActiveRound ? 1000 : 3000;
    const id = setInterval(poll, pollMs);
    return () => clearInterval(id);
  }, [screen, code, poll, roomState?.phase]);

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
    const isStandalone = isStandaloneGameMode(selectedMode);
    if (!isStandalone && !selectedDifficulty) {
      setError("Select a difficulty before creating a room.");
      return;
    }
    if (!isStandalone && !selectedCategory) {
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
          quizDifficulty: isStandalone ? QUIZ_DIFFICULTY_INTERMEDIATE : selectedDifficulty,
          quizCategory: isStandalone ? QUIZ_CATEGORY_GENERAL_KNOWLEDGE : selectedCategory,
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
    const normalizedJoin = normalizeRoomCode(joinCode);
    if (!normalizedJoin) {
      setError("Enter a room code.");
      return;
    }
    if (!isValidRoomCode(normalizedJoin)) {
      setError("Room code must be 6 letters or numbers.");
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
          code: normalizedJoin,
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
      const message = e instanceof Error ? e.message : "Could not join room";
      if (await openRoomByCode(normalizedJoin, name, "/funquiz")) return;
      setError(message);
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

  useEffect(() => {
    const token = clubToken();
    if (!token) {
      setAccountReady(true);
      return;
    }
    void fetch("/api/club/session", { headers: { Authorization: `Bearer ${token}` } })
      .then(async (res) => {
        if (!res.ok) {
          setAccount(null);
          return;
        }
        const data = (await res.json()) as { account?: { id: string; email: string; name: string } };
        if (!data.account) return;
        const session = { ...data.account, token };
        setAccount(session);
        setName(data.account.name);
      })
      .finally(() => setAccountReady(true));
  }, []);

  useMatchScore({
    game: roomState ? `Fun Quiz · ${gameModeLabel(roomState.gameMode)}` : "Fun Quiz",
    roomCode: roomState?.code,
    phase: roomState?.phase,
    score: roomState ? (roomState.jointScore ?? roomState.you.score) : undefined,
    won: !!roomState && (roomState.winnerIds.includes(playerId) || (roomState.jointScore !== null && roomState.winnerIds.length !== 1)),
  });

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

  if (screen === "home" && !accountReady) {
    return <div className="flex min-h-[100dvh] items-center justify-center text-slate-300">Loading…</div>;
  }

  if (screen === "home" && !account) {
    return (
      <LoginScreen
        onSuccess={(session) => {
          setAccount(session);
          setName(session.name);
          const next = new URLSearchParams(window.location.search).get("next");
          if (next && next.startsWith("/") && !next.startsWith("//") && !next.includes("://")) window.location.assign(next);
        }}
      />
    );
  }

  if (screen === "home") {
    return (
      <div className="mx-auto flex min-h-[100dvh] max-w-5xl flex-col justify-center px-4 py-10">
        <div className="rounded-3xl border border-violet-400/25 bg-gradient-to-b from-slate-900/95 to-indigo-950/90 p-8 shadow-2xl shadow-violet-900/40">
          <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-violet-300">
            Two-player quiz
          </p>
          <h1 className="mt-3 text-center font-bold tracking-tight text-white text-4xl">
            Fun Quiz
          </h1>
          <p className="mt-3 text-center text-sm leading-relaxed text-slate-300">
            Pick a quiz subject, then Easy, Intermediate, or Hard, then play separate or together.
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

          <div className="mt-6 bg-white p-4 sm:p-5">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-6 sm:gap-3">
              <div className={`${HOME_LABEL} col-span-2 sm:col-span-1`}>Quiz</div>
              {QUIZ_HOME.slice(0, 5).map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setPickedGame("quiz");
                    setSelectedCategory(cat.id);
                    setSelectedMode(null);
                    setSelectedDifficulty(null);
                  }}
                  className={homeTileClass(selectedCategory === cat.id)}
                >
                  {cat.title}
                </button>
              ))}
              <div className="hidden sm:block" />
              {QUIZ_HOME.slice(5).map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setPickedGame("quiz");
                    setSelectedCategory(cat.id);
                    setSelectedMode(null);
                    setSelectedDifficulty(null);
                  }}
                  className={homeTileClass(selectedCategory === cat.id)}
                >
                  {cat.title}
                </button>
              ))}
            </div>

            <div className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-6 sm:gap-3">
              <div className={`${HOME_LABEL} col-span-2 sm:col-span-1`}>Games</div>
              {GAME_TILES.map((tile) => (
                <button
                  key={tile.id}
                  type="button"
                  onClick={() => {
                    chooseFunQuizGame(tile.id, setPickedGame, setSelectedMode, selectedMode);
                    setSelectedCategory(null);
                    setSelectedDifficulty(null);
                  }}
                  className={homeTileClass(pickedGame === tile.id)}
                >
                  {tile.title}
                </button>
              ))}
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-6 sm:gap-3">
              <div className={`${HOME_LABEL} col-span-2 sm:col-span-1`}>Name That</div>
              {NAME_THAT_TILES.map((tile) => (
                <Link key={tile.id} href={tile.href ?? "/funquiz"} className={homeTileClass()}>
                  {tile.title}
                </Link>
              ))}
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-6 sm:gap-3">
              <div className={`${HOME_LABEL} col-span-2 sm:col-span-1`}>Draw That</div>
              {DRAW_THAT_TILES.map((tile) => (
                <Link key={tile.id} href={tile.href ?? "/funquiz"} className={homeTileClass()}>
                  {tile.title}
                </Link>
              ))}
            </div>
          </div>

          {selectedCategory ? (
            <>
              <div className="mt-3 grid grid-cols-3 gap-2 sm:gap-3">
                {QUIZ_DIFFICULTIES.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => {
                      setSelectedDifficulty(d.id);
                      setSelectedMode(null);
                    }}
                    className={`flex min-h-16 items-center justify-center rounded-xl border bg-black/30 p-2 text-center text-xs font-semibold transition sm:min-h-20 sm:text-sm ${
                      selectedDifficulty === d.id
                        ? "border-violet-300 text-violet-100 ring-2 ring-white"
                        : "border-violet-400/40 text-violet-100 hover:bg-violet-950/40"
                    }`}
                  >
                    {d.title}
                  </button>
                ))}
              </div>
              {selectedDifficulty ? (
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setSelectedMode(GAME_MODE_TAKE_TURNS)}
                    className={`rounded-2xl border p-4 text-left transition ${
                      selectedMode === GAME_MODE_TAKE_TURNS
                        ? "border-violet-400 bg-violet-950/50"
                        : "border-white/10 bg-black/30 hover:border-violet-400/40"
                    }`}
                  >
                    <p className="text-sm font-semibold text-violet-200">Play separate</p>
                    <p className="mt-2 text-xs leading-relaxed text-slate-300">
                      Answer 25 different questions each. Take turns answering. Compare scores at the end.
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
                    <p className="text-sm font-semibold text-violet-200">Play together</p>
                    <p className="mt-2 text-xs leading-relaxed text-slate-300">
                      Answer 50 shared questions together. The room creator submits the agreed answer.
                    </p>
                  </button>
                </div>
              ) : null}
            </>
          ) : null}

          {pickedGame === "millionaire" ? (
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setSelectedMode(GAME_MODE_SHARED_MILLIONAIRE)}
                className={`rounded-2xl border p-4 text-left transition ${
                  selectedMode === GAME_MODE_SHARED_MILLIONAIRE
                    ? "border-amber-400 bg-amber-950/50"
                    : "border-white/10 bg-black/30 hover:border-amber-400/40"
                }`}
              >
                <p className="text-sm font-semibold text-amber-100">1 — Play together</p>
                <p className="mt-2 text-xs leading-relaxed text-slate-300">
                  One shared question, one team ladder, lock in together, shared lifelines.
                </p>
              </button>
              <button
                type="button"
                onClick={() => setSelectedMode(GAME_MODE_PARALLEL_MILLIONAIRE)}
                className={`rounded-2xl border p-4 text-left transition ${
                  selectedMode === GAME_MODE_PARALLEL_MILLIONAIRE
                    ? "border-amber-400 bg-amber-950/50"
                    : "border-white/10 bg-black/30 hover:border-amber-400/40"
                }`}
              >
                <p className="text-sm font-semibold text-amber-100">2 — Same room, separate ladders</p>
                <p className="mt-2 text-xs leading-relaxed text-slate-300">
                  Your own questions and prize bar. Your friend&apos;s question stays read-only.
                </p>
              </button>
            </div>
          ) : null}

          {pickedGame !== "quiz" && selectedMode && !isStandaloneGameMode(selectedMode) ? (
            <>
              <p className="mt-6 text-sm font-medium text-slate-200">Difficulty</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {QUIZ_DIFFICULTIES.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setSelectedDifficulty(d.id)}
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

          {selectedMode && !isStandaloneGameMode(selectedMode) && selectedDifficulty && pickedGame !== "quiz" ? (
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
            disabled={
              busy ||
              !selectedMode ||
              (isStandaloneGameMode(selectedMode)
                ? false
                : !selectedDifficulty || !selectedCategory)
            }
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
              onChange={(e) => setJoinCode(normalizeRoomCode(e.target.value))}
              onPaste={(e) => {
                e.preventDefault();
                const text = e.clipboardData.getData("text");
                setJoinCode(normalizeRoomCode(text));
              }}
              placeholder="ABC123"
              maxLength={18}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  void joinRoom();
                }
              }}
              inputMode="text"
              autoCapitalize="characters"
              autoCorrect="off"
              spellCheck={false}
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
          {account ? <FriendsClub account={account} onLogout={() => setAccount(null)} /> : null}
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
    gameMode === GAME_MODE_SHARED_MILLIONAIRE
      ? players.length >= 1
      : bothIn;
  const isMillionaire = isMillionaireGameMode(gameMode);
  const isHoldem = isHoldemGameMode(gameMode);
  const isCatchphrase = isCatchphraseGameMode(gameMode);
  const isBlockbusters = isBlockbustersGameMode(gameMode);

  return (
    <div
      className={`mx-auto flex min-h-[100dvh] flex-col px-4 py-6 pb-10 ${isMillionaire || isHoldem || isCatchphrase || isBlockbusters ? "max-w-5xl" : "max-w-2xl"}`}
    >
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-violet-300">
            Room {roomState.code}
            {isHoldem || isCatchphrase || isBlockbusters ? null : (
              <>
                {" "}
                · {roomState.quizDifficultyTitle} · {roomState.quizCategoryTitle}
              </>
            )}{" "}
            · {gameModeLabel(gameMode)}
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

      {isCatchphrase && phase !== "lobby" ? (
        <CatchphraseStage
          roomState={roomState}
          playerId={playerId}
          busy={busy}
          setBusy={setBusy}
          onRefreshState={setRoomState}
          onError={setError}
        />
      ) : null}

      {isBlockbusters && phase !== "lobby" ? (
        <BlockbustersStage
          roomState={roomState}
          playerId={playerId}
          busy={busy}
          setBusy={setBusy}
          onRefreshState={setRoomState}
          onError={setError}
        />
      ) : null}

      {isHoldem && phase !== "lobby" ? (
        <HoldemStage
          roomState={roomState}
          playerId={playerId}
          busy={busy}
          setBusy={setBusy}
          onRefreshState={setRoomState}
          onError={setError}
          onLeaveLobby={leaveRoom}
        />
      ) : null}

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

      {!isMillionaire && !isHoldem && !isCatchphrase && !isBlockbusters && gameMode === GAME_MODE_PLAY_TOGETHER ? (
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
      ) : !isMillionaire && !isCatchphrase && !isBlockbusters ? (
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
                {gameMode === GAME_MODE_TAKE_TURNS
                  ? `${p!.score} / 25`
                  : roomState.scoresHidden
                    ? "—"
                    : `${p!.score} / 25`}
              </p>
            </div>
          ))}
        </div>
      ) : null}

      {phase === "lobby" ? (
        <section className="mt-8 flex flex-1 flex-col rounded-3xl border border-white/10 bg-slate-900/70 p-6">
          <h2 className="text-lg font-semibold text-white">Waiting room</h2>
          {isHoldem || isCatchphrase ? (
            <p className="mt-2 text-sm text-slate-300">
              {isCatchphrase
                ? "Picture clues reveal square by square — buzz in and guess the hidden phrase (+2 per correct answer)."
                : "Heads-up poker with rotating dealer and blinds."}
            </p>
          ) : isBlockbusters ? (
            <>
              <p className="mt-2 text-sm text-slate-300">
                Pick a hex, answer from your quiz, and link your side of the board. Wrong answers
                can be stolen!
              </p>
              <p className="mt-2 text-sm text-slate-300">
                Difficulty:{" "}
                <strong className="text-violet-200">{roomState.quizDifficultyTitle}</strong>
              </p>
              <p className="mt-1 text-sm text-slate-300">
                Quiz:{" "}
                <strong className="text-violet-200">{roomState.quizCategoryTitle}</strong>
              </p>
            </>
          ) : (
            <>
              <p className="mt-2 text-sm text-slate-300">
                Difficulty:{" "}
                <strong className="text-violet-200">{roomState.quizDifficultyTitle}</strong>
              </p>
              <p className="mt-1 text-sm text-slate-300">
                Quiz:{" "}
                <strong className="text-violet-200">{roomState.quizCategoryTitle}</strong>
              </p>
            </>
          )}
          <p className="mt-1 text-sm text-slate-300">
            Mode: <strong className="text-violet-200">{gameModeLabel(gameMode)}</strong>
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
                void navigator.clipboard?.writeText(roomState.code);
              }}
            >
              Copy code
            </button>
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

      {!isMillionaire && !isCatchphrase && !isBlockbusters && phase === "question" && !question && roomState.statusMessage ? (
        <section className="mt-8 flex flex-1 flex-col items-center justify-center rounded-3xl border border-white/10 bg-slate-900/70 p-8 text-center">
          <p className="text-lg text-slate-200">{roomState.statusMessage}</p>
          {you.answer !== null ? (
            <p className="mt-4 text-sm text-emerald-300/90">Answer submitted.</p>
          ) : null}
        </section>
      ) : null}

      {!isMillionaire && !isCatchphrase && !isBlockbusters && phase === "question" && question ? (
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
          {question.flagImageUrl ? (
            <div className="mt-6 flex justify-center rounded-2xl border border-white/10 bg-slate-950/80 p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={question.flagImageUrl}
                alt="Country flag"
                className="max-h-40 w-full max-w-md rounded-md object-contain shadow-lg"
              />
            </div>
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

      {!isMillionaire && !isCatchphrase && !isBlockbusters && phase === "reveal" && roomState.answerFeedback ? (
        <section className="mt-6 flex flex-1 flex-col rounded-3xl border border-amber-400/30 bg-amber-950/20 p-6">
          <h2 className="text-lg font-semibold text-amber-100">Answer reveal</h2>
          {question?.flagImageUrl ? (
            <div className="mt-3 flex justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={question.flagImageUrl}
                alt="Country flag"
                className="max-h-32 max-w-sm rounded object-contain"
              />
            </div>
          ) : null}
          {question?.outlineImageUrl ? (
            <div className="mt-3 flex justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={question.outlineImageUrl}
                alt="Country outline"
                className="max-h-36 max-w-xs object-contain"
              />
            </div>
          ) : null}
          {question ? (
            <p className="mt-2 text-sm text-slate-300">{question.prompt}</p>
          ) : null}
          <p
            className={`mt-4 rounded-xl px-4 py-3 text-sm font-semibold ${
              roomState.answerFeedback.correct
                ? "bg-emerald-900/50 text-emerald-100"
                : "bg-red-950/50 text-red-100"
            }`}
          >
            {gameMode === GAME_MODE_TAKE_TURNS
              ? roomState.answerFeedback.correct
                ? "Correct answer!"
                : "Incorrect answer"
              : roomState.answerFeedback.correct
                ? "Correct!"
                : "Incorrect"}
          </p>
          <p className="mt-3 rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-slate-200">
            Choice:{" "}
            <strong>
              {String.fromCharCode(65 + roomState.answerFeedback.choiceIndex)}.{" "}
              {roomState.answerFeedback.chosenLabel}
            </strong>
          </p>
          {!roomState.answerFeedback.correct || gameMode === GAME_MODE_TAKE_TURNS ? (
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
          ) : gameMode === GAME_MODE_TAKE_TURNS ? (
            <p className="mt-4 text-sm text-slate-200">Next turn in a moment…</p>
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

      {!isMillionaire && !isCatchphrase && !isBlockbusters && phase === "finished" && roomState.results ? (
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
          {roomState.scorecard ? (
            <div className="mt-5">
              <FunQuizScorecardGraph scorecard={roomState.scorecard} />
            </div>
          ) : null}
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
