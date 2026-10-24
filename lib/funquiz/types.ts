import type { QuizCategoryId } from "./categories";
import type { QuizDifficulty } from "./difficulties";

export type GameMode = "take_turns" | "play_together";

export type QuizOptionList =
  | readonly [string, string, string]
  | readonly [string, string, string, string];

export type QuizPhase = "lobby" | "question" | "reveal" | "finished";

export type QuizPlayer = {
  id: string;
  name: string;
  score: number;
  /** Selected option index for current question, or null if not yet answered */
  answer: number | null;
};

export type AnswerLogEntry = {
  sessionId: string;
  turnIndex: number;
  bankId: number;
  playerId: string;
  choiceIndex: number;
  correct: boolean;
};

export type QuizRoom = {
  code: string;
  hostId: string;
  gameMode: GameMode;
  quizCategoryId: QuizCategoryId;
  quizDifficulty: QuizDifficulty;
  sessionId: string;
  phase: QuizPhase;
  questionIndex: number;
  /** Shuffled order of 50 question bank ids (play_together authoritative list) */
  questionOrder: number[];
  hostQuestionOrder: number[];
  guestQuestionOrder: number[];
  turnIndex: number;
  activePlayerId: string | null;
  jointScore: number;
  answerLog: AnswerLogEntry[];
  players: QuizPlayer[];
  revealStartedAt: number | null;
  createdAt: number;
  updatedAt: number;
};

export type PublicQuizQuestion = {
  id: number;
  prompt: string;
  options: QuizOptionList;
  category: string;
  outlineImageUrl?: string;
};

export type ResultRow = {
  turnIndex: number;
  bankId: number;
  playerId: string;
  playerName: string;
  choiceIndex: number | null;
  correctIndex: number;
  correct: boolean;
  prompt: string;
  options: QuizOptionList;
  chosenLabel: string | null;
  correctLabel: string;
};

export type ClientRoomState = {
  code: string;
  hostId: string;
  gameMode: GameMode;
  quizCategoryId: QuizCategoryId;
  quizCategoryTitle: string;
  quizDifficulty: QuizDifficulty;
  quizDifficultyTitle: string;
  phase: QuizPhase;
  questionIndex: number;
  totalQuestions: number;
  turnIndex: number;
  activePlayerId: string | null;
  isYourTurn: boolean;
  canSubmitAnswer: boolean;
  statusMessage: string | null;
  scoresHidden: boolean;
  jointScore: number | null;
  players: Array<{
    id: string;
    name: string;
    score: number;
    hasAnswered: boolean;
    answerIndex: number | null;
    wasCorrect: boolean | null;
  }>;
  question: PublicQuizQuestion | null;
  correctIndex: number | null;
  revealEndsAt: number | null;
  winnerIds: string[];
  you: { id: string; name: string; score: number; answer: number | null };
  results: ResultRow[] | null;
  error?: string;
};
