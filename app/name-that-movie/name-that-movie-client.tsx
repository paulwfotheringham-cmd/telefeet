"use client";

import Link from "next/link";
import { useState } from "react";
import {
  isCorrectChoice,
  selectGameQuestions,
  tallyScore,
} from "@/lib/name-that-movie/game";
import {
  MOVIE_DIFFICULTY_OPTIONS,
  QUESTIONS_PER_GAME,
  difficultyTitle,
  type MovieDifficulty,
  type PresentedQuestion,
} from "@/lib/name-that-movie/types";

type Phase = "menu" | "play" | "results";

type AnswerRecord = {
  question: PresentedQuestion;
  choiceIndex: number;
  correct: boolean;
};

function optionLetter(index: number): string {
  return String.fromCharCode(65 + index);
}

export function NameThatMovieClient() {
  const [phase, setPhase] = useState<Phase>("menu");
  const [difficulty, setDifficulty] = useState<MovieDifficulty | null>(null);
  const [questions, setQuestions] = useState<PresentedQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [choice, setChoice] = useState<number | null>(null);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);

  const question = questions[index];
  const revealed = choice !== null && question !== undefined;
  const score = tallyScore(answers.map((answer) => answer.correct));
  const progressPct = questions.length
    ? Math.round(((index + 1) / questions.length) * 100)
    : 0;

  function startGame(nextDifficulty: MovieDifficulty) {
    setDifficulty(nextDifficulty);
    setQuestions(selectGameQuestions(nextDifficulty));
    setIndex(0);
    setChoice(null);
    setAnswers([]);
    setPhase("play");
  }

  function choose(optionIndex: number) {
    if (!question || choice !== null) return;
    const correct = isCorrectChoice(question, optionIndex);
    setChoice(optionIndex);
    setAnswers((prev) => [...prev, { question, choiceIndex: optionIndex, correct }]);
  }

  function goNext() {
    if (index + 1 >= questions.length) {
      setPhase("results");
      return;
    }
    setIndex((current) => current + 1);
    setChoice(null);
  }

  function backToMenu() {
    setPhase("menu");
    setChoice(null);
  }

  if (phase === "menu") {
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
            A famous line appears. Four film titles follow. One is correct.
            Ten questions, one point each.
          </p>

          <p className="mt-6 text-sm font-medium text-slate-200">Difficulty</p>
          <div className="mt-3 grid gap-3">
            {MOVIE_DIFFICULTY_OPTIONS.map((option) => {
              const selected = difficulty === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setDifficulty(option.id)}
                  className={`rounded-2xl border p-4 text-left transition ${
                    selected
                      ? "border-violet-400 bg-violet-950/50 ring-1 ring-violet-400/40"
                      : "border-white/10 bg-black/30 hover:border-violet-400/40"
                  }`}
                >
                  <p className="text-sm font-semibold text-violet-200">{option.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-400">
                    {option.description}
                  </p>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            disabled={!difficulty}
            onClick={() => {
              if (difficulty) startGame(difficulty);
            }}
            className="mt-6 w-full rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-700/30 transition hover:brightness-110 disabled:opacity-60"
          >
            Start game
          </button>

          <p className="mt-6 text-center text-xs text-slate-500">
            <Link href="/funquiz" className="text-violet-300 hover:text-violet-200">
              Fun Quiz
            </Link>
          </p>
        </div>
      </div>
    );
  }

  if (phase === "results") {
    return (
      <div className="mx-auto flex min-h-[100dvh] max-w-2xl flex-col px-4 py-6 pb-10">
        <header className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-violet-300">
              {difficulty ? difficultyTitle(difficulty) : "Quiz"} · {QUESTIONS_PER_GAME} questions
            </p>
            <h1 className="text-2xl font-bold text-white">Name That Movie!</h1>
          </div>
          <button
            type="button"
            onClick={backToMenu}
            className="rounded-lg border border-white/15 px-3 py-1.5 text-xs text-slate-300 hover:bg-white/5"
          >
            Leave
          </button>
        </header>

        <section className="mt-6 flex flex-1 flex-col rounded-3xl border border-violet-400/30 bg-slate-950/80 p-5 sm:p-6">
          <h2 className="text-2xl font-bold text-white">Results</h2>
          <p className="mt-2 text-violet-100">
            Score: {score.score} / {score.total}
          </p>
          <p className="mt-1 text-3xl font-bold tabular-nums text-white">{score.percentage}%</p>
          <p className="mt-1 text-sm text-slate-400">
            {score.score} correct out of {score.total}.
          </p>

          <div className="mt-5 max-h-80 overflow-y-auto rounded-xl border border-white/10">
            <table className="w-full text-left text-xs text-slate-200">
              <thead className="sticky top-0 bg-slate-900 text-slate-400">
                <tr>
                  <th className="p-2">#</th>
                  <th className="p-2">Your answer</th>
                  <th className="p-2">Film</th>
                </tr>
              </thead>
              <tbody>
                {answers.map((answer, answerIndex) => (
                  <tr key={answer.question.id} className="border-t border-white/5 align-top">
                    <td className="p-2">{answerIndex + 1}</td>
                    <td className="p-2">{answer.question.options[answer.choiceIndex]}</td>
                    <td className={`p-2 ${answer.correct ? "text-emerald-300" : "text-red-300"}`}>
                      {answer.question.film} {answer.correct ? "✓" : "✗"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            type="button"
            onClick={() => {
              if (difficulty) startGame(difficulty);
            }}
            className="mt-6 w-full rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-700/30 transition hover:brightness-110"
          >
            Play again
          </button>
          <button
            type="button"
            onClick={backToMenu}
            className="mt-3 w-full rounded-xl border border-white/15 py-3 text-sm text-slate-300"
          >
            Change difficulty
          </button>
        </section>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center text-slate-300">
        Loading question…
      </div>
    );
  }

  const lastQuestion = index + 1 >= questions.length;

  return (
    <div className="mx-auto flex min-h-[100dvh] max-w-2xl flex-col px-4 py-6 pb-10">
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-violet-300">
            {difficulty ? difficultyTitle(difficulty) : "Quiz"}
          </p>
          <h1 className="text-2xl font-bold text-white">Name That Movie!</h1>
        </div>
        <button
          type="button"
          onClick={backToMenu}
          className="rounded-lg border border-white/15 px-3 py-1.5 text-xs text-slate-300 hover:bg-white/5"
        >
          Leave
        </button>
      </header>

      <div className="mt-4 rounded-2xl border border-violet-400/50 bg-violet-950/40 px-5 py-4">
        <p className="text-sm font-semibold text-violet-200">Score</p>
        <p className="mt-1 text-3xl font-bold tabular-nums text-white">
          {score.score}{" "}
          <span className="text-lg font-medium text-violet-300/90">/ {questions.length}</span>
        </p>
      </div>

      <section className="mt-6 flex flex-1 flex-col">
        <div className="mb-3 flex items-center justify-between text-xs text-slate-400">
          <span>Name the film</span>
          <span>
            Question {index + 1} / {questions.length}
          </span>
        </div>
        <div
          className="h-2 overflow-hidden rounded-full bg-white/10"
          role="progressbar"
          aria-valuenow={index + 1}
          aria-valuemin={1}
          aria-valuemax={questions.length}
          aria-label={`Question ${index + 1} of ${questions.length}`}
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-400 transition-all"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        <h2 className="mt-6 text-lg font-semibold leading-snug text-white sm:text-2xl">
          <span className="text-violet-300" aria-hidden="true">
            “
          </span>
          {question.quote}
          <span className="text-violet-300" aria-hidden="true">
            ”
          </span>
        </h2>

        <div className="mt-6 flex flex-col gap-3">
          {question.options.map((option, optionIndex) => {
            const picked = choice === optionIndex;
            const isAnswer = optionIndex === question.correctIndex;
            let tone =
              "border-white/10 bg-slate-900/80 text-slate-100 hover:border-violet-400/40 hover:bg-slate-800/80";
            if (revealed && isAnswer) {
              tone = "border-emerald-400 bg-emerald-900/50 text-white";
            } else if (revealed && picked) {
              tone = "border-red-400 bg-red-950/50 text-white";
            } else if (revealed) {
              tone = "border-white/10 bg-slate-900/50 text-slate-300 opacity-70";
            } else if (picked) {
              tone = "border-violet-400 bg-violet-900/50 text-white";
            }
            return (
              <button
                key={`${question.id}-${option}`}
                type="button"
                disabled={revealed}
                onClick={() => choose(optionIndex)}
                className={`rounded-2xl border px-4 py-4 text-left text-sm font-medium transition sm:text-base disabled:opacity-100 ${tone}`}
              >
                <span className="mr-2 font-mono text-violet-300">{optionLetter(optionIndex)}.</span>
                {option}
              </button>
            );
          })}
        </div>

        {choice !== null ? (
          <div className="mt-6 rounded-3xl border border-amber-400/30 bg-amber-950/20 p-5" role="status">
            <p
              className={`rounded-xl px-4 py-3 text-sm font-semibold ${
                isCorrectChoice(question, choice)
                  ? "bg-emerald-900/50 text-emerald-100"
                  : "bg-red-950/50 text-red-100"
              }`}
            >
              {isCorrectChoice(question, choice) ? "Correct!" : "Incorrect"}
            </p>
            <p className="mt-3 rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-slate-200">
              Your choice:{" "}
              <strong>
                {optionLetter(choice)}. {question.options[choice]}
              </strong>
            </p>
            <p className="mt-3 rounded-xl bg-emerald-900/40 px-4 py-3 text-sm text-emerald-100">
              Correct answer:{" "}
              <strong>
                {optionLetter(question.correctIndex)}. {question.film}
              </strong>
            </p>
            <button
              type="button"
              onClick={goNext}
              className="mt-5 w-full rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-700/30 transition hover:brightness-110"
            >
              {lastQuestion ? "See results" : "Next question"}
            </button>
          </div>
        ) : null}
      </section>
    </div>
  );
}
