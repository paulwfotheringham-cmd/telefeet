export type QuizPhase = "lobby" | "question" | "reveal" | "finished";

export type QuizPlayer = {
  id: string;
  name: string;
  score: number;
  /** Selected option index for current question, or null if not yet answered */
  answer: number | null;
};

export type QuizRoom = {
  code: string;
  hostId: string;
  phase: QuizPhase;
  questionIndex: number;
  /** Shuffled order of question ids (0..49) for this match */
  questionOrder: number[];
  players: QuizPlayer[];
  /** When reveal phase started (ms since epoch) */
  revealStartedAt: number | null;
  createdAt: number;
  updatedAt: number;
};

export type PublicQuizQuestion = {
  id: number;
  prompt: string;
  options: [string, string, string];
  category: string;
};

export type ClientRoomState = {
  code: string;
  hostId: string;
  phase: QuizPhase;
  questionIndex: number;
  totalQuestions: number;
  players: Array<{
    id: string;
    name: string;
    score: number;
    hasAnswered: boolean;
    /** Present during reveal for this question */
    answerIndex: number | null;
    wasCorrect: boolean | null;
  }>;
  question: PublicQuizQuestion | null;
  /** Correct index; only sent during reveal/finished for current or past reveal */
  correctIndex: number | null;
  revealEndsAt: number | null;
  winnerIds: string[];
  you: { id: string; name: string; score: number; answer: number | null };
  error?: string;
};
