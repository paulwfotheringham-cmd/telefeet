import assert from "node:assert/strict";
import { MOVIE_QUESTIONS } from "../lib/name-that-movie/question-bank";
import {
  isCorrectChoice,
  selectGameQuestions,
  tallyScore,
} from "../lib/name-that-movie/game";
import {
  MOVIE_CATEGORIES,
  MOVIE_DIFFICULTIES,
  QUESTIONS_PER_GAME,
  type MovieDifficulty,
} from "../lib/name-that-movie/types";

function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const EXCLUDED_ROMANCE_FILMS = [
  "Casablanca",
  "Gone with the Wind",
  "When Harry Met Sally...",
  "When Harry Met Sally",
  "Jerry Maguire",
  "The Notebook",
  "Love Actually",
  "Notting Hill",
  "Pretty Woman",
  "The Graduate",
  "Sleepless in Seattle",
  "You've Got Mail",
  "Four Weddings and a Funeral",
  "Bridget Jones's Diary",
  "Pride & Prejudice",
  "Pride and Prejudice",
];

function assertBankShape() {
  assert.ok(MOVIE_QUESTIONS.length >= 100, `bank has ${MOVIE_QUESTIONS.length}`);
  const ids = new Set<string>();
  const quotes = new Set<string>();
  for (const question of MOVIE_QUESTIONS) {
    assert.ok(question.id.length > 0);
    assert.ok(!ids.has(question.id), `duplicate id ${question.id}`);
    ids.add(question.id);
    assert.ok(question.quote.trim().length > 0, question.id);
    assert.ok(!quotes.has(question.quote), `duplicate quote ${question.id}`);
    quotes.add(question.quote);
    assert.ok(question.film.trim().length > 0, question.id);
    assert.equal(question.distractors.length, 3, question.id);
    const titles = question.distractors.map((title) => title.trim().toLowerCase());
    assert.equal(new Set(titles).size, 3, `distractors repeat on ${question.id}`);
    assert.ok(
      !titles.includes(question.film.trim().toLowerCase()),
      `answer used as distractor on ${question.id}`,
    );
    assert.ok(
      (MOVIE_DIFFICULTIES as readonly string[]).includes(question.difficulty),
      question.id,
    );
    assert.ok(
      (MOVIE_CATEGORIES as readonly string[]).includes(question.category),
      `${question.id} category ${question.category}`,
    );
    assert.ok(!/romance/i.test(question.category), question.id);
    assert.ok(
      !EXCLUDED_ROMANCE_FILMS.some(
        (film) => film.toLowerCase() === question.film.toLowerCase(),
      ),
      `${question.id} uses excluded film ${question.film}`,
    );
  }
}

function assertCoverage() {
  for (const difficulty of MOVIE_DIFFICULTIES) {
    const count = MOVIE_QUESTIONS.filter((q) => q.difficulty === difficulty).length;
    assert.ok(count >= QUESTIONS_PER_GAME, `${difficulty} has ${count}`);
  }
  for (const category of MOVIE_CATEGORIES) {
    assert.ok(
      MOVIE_QUESTIONS.some((q) => q.category === category),
      `missing category ${category}`,
    );
  }
  const films = MOVIE_QUESTIONS.map((q) => q.film);
  const required = [
    "The Godfather",
    "Jaws",
    "Star Wars",
    "The Terminator",
    "Back to the Future",
    "Jurassic Park",
    "The Matrix",
    "Forrest Gump",
    "Pulp Fiction",
    "Titanic",
    "Gladiator",
    "Rocky",
    "Die Hard",
    "Ghostbusters",
    "Dirty Dancing",
  ];
  for (const film of required) {
    assert.ok(films.includes(film), `missing ${film}`);
  }
  assert.ok(films.some((film) => film.startsWith("Harry Potter")));
  assert.ok(films.some((film) => film.startsWith("The Lord of the Rings")));
  assert.ok(
    films.some((film) =>
      ["Dr. No", "Goldfinger", "Skyfall", "Casino Royale"].includes(film),
    ),
    "missing a James Bond film",
  );
}

function assertSelection(difficulty: MovieDifficulty) {
  const round = selectGameQuestions(difficulty, QUESTIONS_PER_GAME, mulberry32(7));
  assert.equal(round.length, QUESTIONS_PER_GAME);
  assert.equal(new Set(round.map((q) => q.id)).size, QUESTIONS_PER_GAME);
  for (const question of round) {
    assert.equal(question.difficulty, difficulty);
    assert.equal(question.options.length, 4);
    assert.equal(new Set(question.options).size, 4);
    assert.equal(question.options[question.correctIndex], question.film);
    assert.ok(question.correctIndex >= 0 && question.correctIndex < 4);
  }
  const positions = new Set<number>();
  for (let seed = 1; seed <= 12; seed += 1) {
    for (const question of selectGameQuestions(difficulty, QUESTIONS_PER_GAME, mulberry32(seed))) {
      positions.add(question.correctIndex);
    }
  }
  assert.ok(positions.size > 1, "correct answer should not stay in one slot");
}

function assertRoundsDiffer() {
  const first = selectGameQuestions("easy", QUESTIONS_PER_GAME, mulberry32(1)).map((q) => q.id);
  const second = selectGameQuestions("easy", QUESTIONS_PER_GAME, mulberry32(2)).map((q) => q.id);
  assert.ok(first.some((id, index) => id !== second[index]));
}

function assertScoring() {
  const [question] = selectGameQuestions("medium", 1, mulberry32(4));
  assert.ok(question);
  assert.equal(isCorrectChoice(question, question.correctIndex), true);
  const wrong = (question.correctIndex + 1) % 4;
  assert.equal(isCorrectChoice(question, wrong), false);
  const flags = [true, false, true, true, false, false, true, false, true, false];
  const result = tallyScore(flags);
  assert.equal(result.score, 5);
  assert.equal(result.total, 10);
  assert.equal(result.percentage, 50);
  assert.deepEqual(tallyScore([true, true, true, true, true, true, true, true, true, true]), {
    score: 10,
    total: 10,
    percentage: 100,
  });
  assert.deepEqual(tallyScore([false, false, false, false, false, false, false, false, false, false]), {
    score: 0,
    total: 10,
    percentage: 0,
  });
  assert.equal(tallyScore([true, false, false]).percentage, 33);
}

assertBankShape();
assertCoverage();
for (const difficulty of MOVIE_DIFFICULTIES) {
  assertSelection(difficulty);
}
assertRoundsDiffer();
assertScoring();
console.log(
  `name-that-movie.test.ts OK (${MOVIE_QUESTIONS.length} questions)`,
);
