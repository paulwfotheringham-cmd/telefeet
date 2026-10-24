import { countQuestionsByCategory } from "../lib/funquiz/questions";
import { validateQuestionBank } from "../lib/funquiz/validate";

const errors = validateQuestionBank();
const counts = countQuestionsByCategory();
if (errors.length) {
  console.error("Fun quiz validation failed:");
  for (const e of errors) console.error(" -", e);
  console.error("Category counts:", counts);
  process.exit(1);
}
console.log("Fun quiz: question bank OK");
console.log("Category counts:", counts);
