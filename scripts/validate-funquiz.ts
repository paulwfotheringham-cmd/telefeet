import { countQuestionsByCategoryAndDifficulty } from "../lib/funquiz/question-selection";
import { validateQuestionBank } from "../lib/funquiz/validate";

const errors = validateQuestionBank();
const counts = countQuestionsByCategoryAndDifficulty();
if (errors.length) {
  console.error("Fun quiz validation failed:");
  for (const e of errors) console.error(" -", e);
  console.error("Category/difficulty counts:", counts);
  process.exit(1);
}
console.log("Fun quiz: question bank OK");
console.log("Category/difficulty counts:", counts);
