import assert from "node:assert/strict";
import {
  QUIZ_CATEGORIES,
  QUIZ_CATEGORY_COUNTRY_OUTLINES,
  QUIZ_CATEGORY_GENERAL_KNOWLEDGE,
  isQuizCategoryId,
} from "../lib/funquiz/categories";
import {
  GAME_MODE_PLAY_TOGETHER,
  GAME_MODE_TAKE_TURNS,
  QUESTIONS_PER_GAME,
  TAKE_TURNS_QUESTIONS_PER_PLAYER,
} from "../lib/funquiz/constants";
import {
  addPlayer,
  allocateQuestionsForGame,
  createRoom,
  resetRoomForNewGame,
  startGame,
  toClientState,
} from "../lib/funquiz/game-logic";
import { getOutlineSvg } from "../lib/funquiz/outline-paths";
import {
  InsufficientQuestionsError,
  categoryCapacity,
  selectQuestionIdsForCategory,
} from "../lib/funquiz/question-selection";
import { getQuestionByBankId, toPublicQuestion } from "../lib/funquiz/questions";
import type { GeneralKnowledgeSubject } from "../lib/funquiz/question-bank/types";
import { QUIZ_QUESTIONS } from "../lib/funquiz/question-bank";

function runCategoryIds() {
  for (const cat of QUIZ_CATEGORIES) {
    assert.ok(isQuizCategoryId(cat.id));
  }
}

function runPersistOnCreateAndJoinView() {
  const cat = QUIZ_CATEGORIES[2]!.id;
  let room = createRoom("h", "Host", "CAT001", GAME_MODE_PLAY_TOGETHER, cat);
  assert.equal(room.quizCategoryId, cat);
  const guestView = toClientState(room, "guest");
  assert.equal(guestView.quizCategoryId, cat);
  assert.equal(guestView.quizCategoryTitle, QUIZ_CATEGORIES[2]!.title);
}

function runCategoryQuestionSets() {
  for (const cat of QUIZ_CATEGORIES) {
    const ids = selectQuestionIdsForCategory(cat.id);
    assert.equal(ids.length, QUESTIONS_PER_GAME);
    assert.equal(new Set(ids).size, QUESTIONS_PER_GAME);
    if (cat.id === QUIZ_CATEGORY_GENERAL_KNOWLEDGE) {
      const subjects = new Set<GeneralKnowledgeSubject>();
      for (const id of ids) {
        const q = getQuestionByBankId(id);
        for (const s of q.generalKnowledgeSubjects ?? []) subjects.add(s);
      }
      assert.ok(subjects.size >= 5, "GK should span multiple subjects");
    } else {
      for (const id of ids) {
        assert.equal(getQuestionByBankId(id).categoryId, cat.id);
      }
    }
  }
}

function runTakeTurnsDisjoint() {
  const { hostQuestionOrder, guestQuestionOrder } = allocateQuestionsForGame(
    QUIZ_CATEGORY_GENERAL_KNOWLEDGE,
  );
  const guestSet = new Set(guestQuestionOrder);
  for (const id of hostQuestionOrder) {
    assert.ok(!guestSet.has(id));
  }
  assert.equal(hostQuestionOrder.length, TAKE_TURNS_QUESTIONS_PER_PLAYER);
}

function runPlayTogetherSameSequence() {
  const a = allocateQuestionsForGame(QUIZ_CATEGORIES[1]!.id);
  const b = allocateQuestionsForGame(QUIZ_CATEGORIES[1]!.id);
  assert.notDeepEqual(a.questionOrder, b.questionOrder);
  assert.equal(a.questionOrder.length, QUESTIONS_PER_GAME);
}

function runCountryOutlinesNoLeak() {
  const outlineQs = QUIZ_QUESTIONS.filter((q) => q.categoryId === QUIZ_CATEGORY_COUNTRY_OUTLINES);
  assert.ok(outlineQs.length >= 50);
  for (const q of outlineQs.slice(0, 10)) {
    assert.ok(q.outlineAssetId);
    assert.ok(getOutlineSvg(q.outlineAssetId!));
    const pub = toPublicQuestion(q);
    assert.ok(pub.outlineImageUrl?.includes(q.outlineAssetId!));
    assert.ok(!pub.outlineImageUrl?.toLowerCase().includes("italy"));
    for (const opt of q.options) {
      assert.ok(!pub.outlineImageUrl?.includes(opt.replace(/\s/g, "")));
    }
  }
}

function runInsufficientCategoryFails() {
  assert.throws(
    () => selectQuestionIdsForCategory("not_a_category" as never),
    InsufficientQuestionsError,
  );
  assert.ok(categoryCapacity(QUIZ_CATEGORY_COUNTRY_OUTLINES) >= QUESTIONS_PER_GAME);
}

function runNewGameCategoryChange() {
  let room = createRoom(
    "h",
    "H",
    "NEWCAT",
    GAME_MODE_TAKE_TURNS,
    QUIZ_CATEGORY_GENERAL_KNOWLEDGE,
  );
  room = { ...room, phase: "finished" as const };
  room = resetRoomForNewGame(room, "h", GAME_MODE_PLAY_TOGETHER, QUIZ_CATEGORY_COUNTRY_OUTLINES);
  assert.equal(room.quizCategoryId, QUIZ_CATEGORY_COUNTRY_OUTLINES);
  assert.equal(room.gameMode, GAME_MODE_PLAY_TOGETHER);
}

function runStartUsesRoomCategory() {
  let room = createRoom("h", "H", "ST001", GAME_MODE_PLAY_TOGETHER, QUIZ_CATEGORIES[4]!.id);
  room = addPlayer(room, "g", "G");
  room = startGame(room, "h");
  for (const id of room.questionOrder) {
    assert.equal(getQuestionByBankId(id).categoryId, QUIZ_CATEGORIES[4]!.id);
  }
}

runCategoryIds();
runPersistOnCreateAndJoinView();
runCategoryQuestionSets();
runTakeTurnsDisjoint();
runPlayTogetherSameSequence();
runCountryOutlinesNoLeak();
runInsufficientCategoryFails();
runNewGameCategoryChange();
runStartUsesRoomCategory();
console.log("funquiz-categories.test.ts OK");
