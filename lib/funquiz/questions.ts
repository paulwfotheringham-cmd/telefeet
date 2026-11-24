import type { PublicQuizQuestion } from "./types";
import type { QuizQuestionBankItem } from "./question-bank/types";

export {
  QUIZ_QUESTIONS,
  QUIZ_QUESTION_COUNT,
  getQuestionByBankId,
  countQuestionsByCategory,
} from "./question-bank/index";
export type { QuizQuestionBankItem } from "./question-bank/types";

export function toPublicQuestion(item: QuizQuestionBankItem): PublicQuizQuestion {
  if (item.estimate) {
    return {
      id: item.id,
      prompt: item.prompt,
      options: [],
      category: item.category,
      input: item.estimate.scoring === "closest" ? "closest" : "population",
    };
  }
  return {
    id: item.id,
    prompt: item.prompt,
    options: [...item.options],
    category: item.category,
    input: "choice",
    outlineImageUrl: item.outlineAssetId
      ? `/api/funquiz/outline/${item.outlineAssetId}`
      : undefined,
    flagImageUrl: item.flagIso2 ? `/api/funquiz/flag/${item.flagIso2}` : undefined,
  };
}
