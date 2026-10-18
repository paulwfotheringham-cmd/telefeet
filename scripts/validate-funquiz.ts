import { validateQuestionBank } from "../lib/funquiz/validate";

const errors = validateQuestionBank();
if (errors.length) {
  console.error("Fun quiz validation failed:");
  for (const e of errors) console.error(" -", e);
  process.exit(1);
}
console.log("Fun quiz: 50 questions OK");
