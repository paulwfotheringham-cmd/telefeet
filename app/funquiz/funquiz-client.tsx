"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { CoverTile, WideChoice } from "@/components/funquiz/picture-board";
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
  GAME_MODE_SINGLE,
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
  if (mode === GAME_MODE_SINGLE) return "Single player";
  if (mode === GAME_MODE_TAKE_TURNS) return "Play separate";
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


type FunQuizTile = { id: string; title: string; href?: string; image: string };
type BoardStep = "board" | "difficulty" | "play";

const QUIZ_HOME: { id: QuizCategoryId; title: string; image: string }[] = [
  { id: QUIZ_CATEGORY_GENERAL_KNOWLEDGE, title: "General Knowledge", image: "/funquiz/covers/cover-general-knowledge.jpg" },
  { id: QUIZ_CATEGORY_SPACE, title: "Space", image: "/funquiz/covers/cover-space.jpg" },
  { id: QUIZ_CATEGORY_HISTORY, title: "History", image: "/funquiz/covers/cover-history.jpg" },
  { id: QUIZ_CATEGORY_MILITARY_BATTLES, title: "Military Battles", image: "/funquiz/covers/cover-military-battles.jpg" },
  { id: QUIZ_CATEGORY_GENERAL_MILITARY, title: "General Military", image: "/funquiz/covers/cover-general-military.jpg" },
  { id: QUIZ_CATEGORY_CAPITAL_CITIES, title: "Capital Cities", image: "/funquiz/covers/cover-capital-cities.jpg" },
  { id: QUIZ_CATEGORY_COUNTRY_OUTLINES, title: "Country Outlines", image: "/funquiz/covers/cover-country-outlines.jpg" },
  { id: QUIZ_CATEGORY_GEOGRAPHY, title: "Geography", image: "/funquiz/covers/cover-geography.jpg" },
  { id: QUIZ_CATEGORY_MOVIES_POP_CULTURE, title: "Movies", image: "/funquiz/covers/cover-movies.jpg" },
  { id: QUIZ_CATEGORY_WORLD_FLAGS, title: "Flags of the world", image: "/funquiz/covers/cover-flags.jpg" },
];

const GAME_TILES: FunQuizTile[] = [
  { id: "millionaire", title: "Who wants to be a Millionaire", image: "/funquiz/covers/cover-millionaire.jpg" },
  { id: "holdem", title: "Texas Hold-em", image: "/funquiz/covers/cover-holdem.jpg" },
  { id: "catchphrase", title: "Catchphrase", image: "/funquiz/covers/cover-catchphrase.jpg" },
  { id: "blockbusters", title: "Blockbusters", image: "/funquiz/covers/cover-blockbusters.jpg" },
];

const NAME_THAT_TILES: FunQuizTile[] = [
  { id: "movie", title: "Movie", href: "/name-that-movie", image: "/funquiz/covers/cover-name-movie.jpg" },
  { id: "show", title: "UK Game show", href: "/name-that-show", image: "/funquiz/covers/cover-name-show.jpg" },
  { id: "computer", title: "Computer game", href: "/name-that-game", image: "/funquiz/covers/cover-name-game.jpg" },
  { id: "tune", title: "80-90's tunes", href: "/name-that-tune", image: "/funquiz/covers/cover-name-tune.jpg" },
];

const DRAW_THAT_TILES: FunQuizTile[] = [
  { id: "organ", title: "Human Body", href: "/draw-the-organ", image: "/funquiz/covers/cover-draw-organ.jpg" },
  { id: "animal", title: "Animals", href: "/draw-the-animal", image: "/funquiz/covers/cover-draw-animal.jpg" },
  { id: "country", title: "Country", href: "/draw-the-country", image: "/funquiz/covers/cover-draw-country.jpg" },
  { id: "myth", title: "Myth", href: "/draw-the-myth", image: "/funquiz/covers/cover-draw-myth.jpg" },
  { id: "landmark", title: "Landmark", href: "/draw-the-landmark", image: "/funquiz/covers/cover-draw-landmark.jpg" },
];

const DIFFICULTY_ART: Record<QuizDifficulty, { image: string; detail: string }> = {
  easy: { image: "/funquiz/covers/cover-easy.jpg", detail: "Familiar facts and well-known answers." },
  intermediate: { image: "/funquiz/covers/cover-intermediate.jpg", detail: "A balanced mix of known facts and harder ones." },
  hard: { image: "/funquiz/covers/cover-hard.jpg", detail: "Specialist knowledge and less familiar facts." },
};

const INSTANT_GAME_MODES: Record<string, GameMode> = {
  holdem: GAME_MODE_TEXAS_HOLDEM,
  catchphrase: GAME_MODE_CATCHPHRASE,
  blockbusters: GAME_MODE_BLOCKBUSTERS,
};

function JoinByCode({
  code,
  busy,
  onChange,
  onJoin,
}: {
  code: string;
  busy: boolean;
  onChange: (value: string) => void;
  onJoin: () => void;
}) {
  return (
    <div className="mx-auto mt-10 w-full max-w-xl pb-6">
      <div className="my-2 flex items-center gap-3 text-xs uppercase tracking-[0.18em] text-slate-500">
        <span className="h-px flex-1 bg-white/10" />
        or join with a code
        <span className="h-px flex-1 bg-white/10" />
      </div>
      <label className="mt-4 block text-sm font-medium text-slate-200">
        Room code
        <input
          className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-center font-mono text-lg tracking-[0.35em] text-white uppercase outline-none focus:ring-2 focus:ring-amber-200/70"
          value={code}
          onChange={(e) => onChange(normalizeRoomCode(e.target.value))}
          onPaste={(e) => {
            e.preventDefault();
            onChange(normalizeRoomCode(e.clipboardData.getData("text")));
          }}
          placeholder="ABC123"
          maxLength={18}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              onJoin();
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
        onClick={onJoin}
        className="mt-4 w-full rounded-2xl bg-white/10 py-3.5 text-sm font-semibold text-white ring-1 ring-white/15 transition hover:bg-white/15 disabled:opacity-60"
      >
        Join room
      </button>
    </div>
  );
}

export function FunQuizClient() {
  const [screen, setScreen] = useState<Screen>("home");
  const [playerId, setPlayerId] = useState(readPlayerId);
  const [name, setName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [selectedMode] = useState<GameMode | null>(null);
  const [pickedGame, setPickedGame] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<QuizDifficulty | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<QuizCategoryId | null>(null);
  const [boardStep, setBoardStep] = useState<BoardStep>("board");
  const [pickedTitle, setPickedTitle] = useState("");
  const [newGameMode, setNewGameMode] = useState<GameMode | null>(null);
  const [newGameDifficulty, setNewGameDifficulty] = useState<QuizDifficulty | null>(null);
  const [newGameCategory, setNewGameCategory] = useState<QuizCategoryId | null>(null);
  const [roomState, setRoomState] = useState<ClientRoomState | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [storeWarning, setStoreWarning] = useState<string | null>(null);
  const [account, setAccount] = useState<ClubSession | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [boardStep]);

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

  const createRoom = async (choice?: {
    mode: GameMode;
    difficulty?: QuizDifficulty | null;
    category?: QuizCategoryId | null;
  }) => {
    const mode = choice?.mode ?? selectedMode;
    const difficulty = choice ? (choice.difficulty ?? QUIZ_DIFFICULTY_INTERMEDIATE) : selectedDifficulty;
    const category = choice ? (choice.category ?? QUIZ_CATEGORY_GENERAL_KNOWLEDGE) : selectedCategory;
    setError(null);
    const playerName = (account?.name || name).trim() || "Player";
    if (!mode) {
      setError("Select a game mode before creating a room.");
      return;
    }
    const isStandalone = isStandaloneGameMode(mode);
    if (!isStandalone && !difficulty) {
      setError("Select a difficulty before creating a room.");
      return;
    }
    if (!isStandalone && !category) {
      setError("Choose a quiz category before creating a room.");
      return;
    }
    const activePlayerId = resolvePlayerId();
    if (!playerId) setPlayerId(activePlayerId);
    persistName(playerName);
    setBusy(true);
    try {
      const res = await fetch("/api/funquiz/room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerId: activePlayerId,
          playerName,
          gameMode: mode,
          quizDifficulty: isStandalone ? QUIZ_DIFFICULTY_INTERMEDIATE : difficulty,
          quizCategory: isStandalone ? QUIZ_CATEGORY_GENERAL_KNOWLEDGE : category,
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
    const playerName = (account?.name || name).trim() || "Player";
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
    persistName(playerName);
    setBusy(true);
    try {
      const res = await fetch("/api/funquiz/room/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: normalizedJoin,
          playerId: activePlayerId,
          playerName,
        }),
      });
      const state = await parseState(res);
      if (state) {
        setRoomState(state);
        setScreen("game");
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : "Could not join room";
      if (await openRoomByCode(normalizedJoin, playerName, "/funquiz")) return;
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
    if (!token) return;
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
      });
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

  const goBack = () => {
    setError(null);
    if (boardStep === "play" && pickedGame === "quiz") {
      setBoardStep("difficulty");
      return;
    }
    setBoardStep("board");
    setPickedGame(null);
    setSelectedCategory(null);
    setSelectedDifficulty(null);
    setPickedTitle("");
  };

  const openQuiz = (id: QuizCategoryId, title: string) => {
    setPickedGame("quiz");
    setSelectedCategory(id);
    setPickedTitle(title);
    setSelectedDifficulty(null);
    setBoardStep("difficulty");
    setError(null);
  };

  if (screen === "home") {
    const difficultyTitle = QUIZ_DIFFICULTIES.find((item) => item.id === selectedDifficulty)?.title;
    const instantMode = pickedGame ? INSTANT_GAME_MODES[pickedGame] : undefined;
    const instantCover = GAME_TILES.find((tile) => tile.id === pickedGame)?.image;
    return (
      <div className="mx-auto flex min-h-[100dvh] max-w-6xl flex-col px-4 py-8 sm:py-10">
        <h1 className="text-center text-4xl font-bold tracking-tight text-white sm:text-5xl">
          A Selection of Games
        </h1>
        <div className="mx-auto mt-3 flex w-full max-w-3xl flex-col items-end gap-2">
            <div className="flex flex-wrap justify-end gap-2">
              <Link
                href="/funquiz/podcasts"
                className="rounded-full border border-amber-300/40 bg-amber-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-100 hover:bg-amber-400/20"
              >
                Podcasts
              </Link>
              <Link
                href="/funquiz/music"
                className="rounded-full border border-amber-300/40 bg-amber-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-100 hover:bg-amber-400/20"
              >
                Music
              </Link>
              <Link
                href="/funquiz/books"
                className="rounded-full border border-amber-300/40 bg-amber-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-100 hover:bg-amber-400/20"
              >
                Books
              </Link>
              <Link
                href="/funquiz/movies"
                className="rounded-full border border-amber-300/40 bg-amber-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-100 hover:bg-amber-400/20"
              >
                Movies
              </Link>
              <Link
                href="/funquiz/tv"
                className="rounded-full border border-amber-300/40 bg-amber-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-100 hover:bg-amber-400/20"
              >
                TV series
              </Link>
            </div>
        </div>

        {storeWarning ? (
          <p className="mx-auto mt-4 max-w-3xl rounded-xl border border-amber-500/40 bg-amber-950/40 px-3 py-2 text-xs text-amber-100">
            {storeWarning}
          </p>
        ) : null}

        {boardStep === "board" ? (
          <div className="space-y-10">
            <section>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-200/90">Quiz</p>
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                {QUIZ_HOME.map((cat) => (
                  <CoverTile
                    key={cat.id}
                    image={cat.image}
                    title={cat.title}
                    onClick={() => openQuiz(cat.id, cat.title)}
                  />
                ))}
              </div>
            </section>

            <section>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-200/90">Games</p>
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {GAME_TILES.map((tile) => (
                  <CoverTile
                    key={tile.id}
                    image={tile.image}
                    title={tile.title}
                    onClick={() => {
                      setPickedGame(tile.id);
                      setPickedTitle(tile.title);
                      setSelectedCategory(null);
                      setSelectedDifficulty(null);
                      setBoardStep("play");
                      setError(null);
                    }}
                  />
                ))}
              </div>
            </section>

            <section>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-200/90">Name That</p>
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {NAME_THAT_TILES.map((tile) => (
                  <CoverTile key={tile.id} image={tile.image} title={tile.title} href={tile.href ?? "/funquiz"} />
                ))}
              </div>
            </section>

            <section>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-200/90">Draw That</p>
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                {DRAW_THAT_TILES.map((tile) => (
                  <CoverTile key={tile.id} image={tile.image} title={tile.title} href={tile.href ?? "/funquiz"} />
                ))}
              </div>
            </section>
          </div>
        ) : (
          <div className="mx-auto mt-8 w-full max-w-3xl">
            <button
              type="button"
              onClick={goBack}
              className="rounded-full border border-white/15 px-4 py-1.5 text-sm text-slate-200 transition hover:bg-white/10"
            >
              Back
            </button>
            <p className="mt-6 text-sm font-medium text-amber-200/90">
              {pickedTitle}
              {boardStep === "play" && difficultyTitle ? ` · ${difficultyTitle}` : ""}
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              {boardStep === "difficulty" ? "Choose a difficulty" : "Choose how to play"}
            </h2>
            <div className={`mt-6 grid gap-4 ${boardStep === "difficulty" ? "" : "sm:grid-cols-3"}`}>
              {boardStep === "difficulty"
                ? QUIZ_DIFFICULTIES.map((item) => (
                    <WideChoice
                      key={item.id}
                      image={DIFFICULTY_ART[item.id].image}
                      title={item.title}
                      detail={DIFFICULTY_ART[item.id].detail}
                      onClick={() => {
                        setSelectedDifficulty(item.id);
                        setBoardStep("play");
                        setError(null);
                      }}
                    />
                  ))
                : null}
              {boardStep === "play" && pickedGame === "quiz" && selectedDifficulty && selectedCategory ? (
                <>
                  <WideChoice
                    image="/funquiz/covers/cover-together.jpg"
                    title="Single player"
                    detail="Answer on your own. No second player."
                    disabled={busy}
                    onClick={() =>
                      void createRoom({
                        mode: GAME_MODE_SINGLE,
                        difficulty: selectedDifficulty,
                        category: selectedCategory,
                      })
                    }
                  />
                  <WideChoice
                    image="/funquiz/covers/cover-together.jpg"
                    title="Play together"
                    detail="Answer as one team and share the score."
                    disabled={busy}
                    onClick={() =>
                      void createRoom({
                        mode: GAME_MODE_PLAY_TOGETHER,
                        difficulty: selectedDifficulty,
                        category: selectedCategory,
                      })
                    }
                  />
                  <WideChoice
                    image="/funquiz/covers/cover-separate.jpg"
                    title="Play separate"
                    detail="Take turns and keep your own score."
                    disabled={busy}
                    onClick={() =>
                      void createRoom({
                        mode: GAME_MODE_TAKE_TURNS,
                        difficulty: selectedDifficulty,
                        category: selectedCategory,
                      })
                    }
                  />
                </>
              ) : null}
              {boardStep === "play" && pickedGame === "millionaire" ? (
                <>
                  <WideChoice
                    image="/funquiz/covers/cover-together.jpg"
                    title="Single player"
                    detail="Climb the prize ladder on your own."
                    disabled={busy}
                    onClick={() => void createRoom({ mode: GAME_MODE_SHARED_MILLIONAIRE })}
                  />
                  <WideChoice
                    image="/funquiz/covers/cover-together.jpg"
                    title="Play together"
                    detail="Share one hot seat and climb the prize ladder."
                    disabled={busy}
                    onClick={() => void createRoom({ mode: GAME_MODE_SHARED_MILLIONAIRE })}
                  />
                  <WideChoice
                    image="/funquiz/covers/cover-separate.jpg"
                    title="Play separate"
                    detail="Each player runs their own ladder."
                    disabled={busy}
                    onClick={() => void createRoom({ mode: GAME_MODE_PARALLEL_MILLIONAIRE })}
                  />
                </>
              ) : null}
              {boardStep === "play" && instantMode && instantCover ? (
                <>
                  <WideChoice
                    image={instantCover}
                    title="Single player"
                    detail="Open a table. A second player still joins before it starts."
                    disabled={busy}
                    onClick={() => void createRoom({ mode: instantMode })}
                  />
                  <WideChoice
                    image={instantCover}
                    title="Play together"
                    detail="Share one table."
                    disabled={busy}
                    onClick={() => void createRoom({ mode: instantMode })}
                  />
                  <WideChoice
                    image={instantCover}
                    title="Play separate"
                    detail="Each of you plays your own hand."
                    disabled={busy}
                    onClick={() => void createRoom({ mode: instantMode })}
                  />
                </>
              ) : null}
            </div>
            <JoinByCode
              code={joinCode}
              busy={busy}
              onChange={setJoinCode}
              onJoin={() => void joinRoom()}
            />
          </div>
        )}

        {error ? (
          <p className="mt-4 text-center text-sm text-red-300" role="alert">
            {error}
          </p>
        ) : null}
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
    gameMode === GAME_MODE_SHARED_MILLIONAIRE || gameMode === GAME_MODE_SINGLE
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

      {!isMillionaire && !isHoldem && !isCatchphrase && !isBlockbusters && (gameMode === GAME_MODE_PLAY_TOGETHER || gameMode === GAME_MODE_SINGLE) ? (
        <div className="mt-4 rounded-2xl border border-violet-400/50 bg-violet-950/40 px-5 py-4">
          <p className="text-sm font-semibold text-violet-200">Team score</p>
          <p className="mt-1 text-3xl font-bold tabular-nums text-white">
            {roomState.jointScore ?? 0}{" "}
            <span className="text-lg font-medium text-violet-300/90">/ 50</span>
          </p>
          <p className="mt-2 text-xs text-slate-400">
            {gameMode === GAME_MODE_SINGLE
              ? `${you.name} · single player`
              : `${you.name} & ${opponent?.name ?? "Partner"} · play together`}
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
            {!canStartGame ? <li className="text-slate-500">Waiting for player 2…</li> : null}
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
          {gameMode === GAME_MODE_PLAY_TOGETHER || gameMode === GAME_MODE_SINGLE ? (
            <p className="mt-4 text-sm text-slate-200">
              {gameMode === GAME_MODE_SINGLE ? "Score" : "Team score"}: {roomState.jointScore ?? 0} out of {roomState.questionIndex + 1}{" "}
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
          {gameMode === GAME_MODE_PLAY_TOGETHER || gameMode === GAME_MODE_SINGLE ? (
            <p className="mt-2 text-violet-100">
              {gameMode === GAME_MODE_SINGLE ? "Score" : "Joint score"}: {roomState.jointScore ?? 0} / 50 (
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
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setNewGameMode(GAME_MODE_SINGLE)}
                  className={`rounded-lg border px-2 py-2 text-xs ${
                    newGameMode === GAME_MODE_SINGLE
                      ? "border-violet-400 bg-violet-950/50"
                      : "border-white/10"
                  }`}
                >
                  Single player
                </button>
                <button
                  type="button"
                  onClick={() => setNewGameMode(GAME_MODE_TAKE_TURNS)}
                  className={`rounded-lg border px-2 py-2 text-xs ${
                    newGameMode === GAME_MODE_TAKE_TURNS
                      ? "border-violet-400 bg-violet-950/50"
                      : "border-white/10"
                  }`}
                >
                  Play separate
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
