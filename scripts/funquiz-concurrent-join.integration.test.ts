/**
 * Concurrent host-poll / guest-join regression (requires FUNQUIZ_E2E_BASE_URL).
 */
import assert from "node:assert/strict";
import { runConcurrentJoinOnce } from "./funquiz-concurrent-join.harness";

const BASE = process.env.FUNQUIZ_E2E_BASE_URL;
if (!BASE) {
  console.log("funquiz concurrent join integration: skipped (set FUNQUIZ_E2E_BASE_URL)");
  process.exit(0);
}

async function main() {
  const runs = 5;
  let passed = 0;
  for (let i = 0; i < runs; i++) {
    if (await runConcurrentJoinOnce(BASE)) passed++;
  }
  assert.equal(
    passed,
    runs,
    `Concurrent join regression: expected ${runs}/${runs}, got ${passed}/${runs}`,
  );
  console.log(`funquiz concurrent join integration: ${passed}/${runs} OK`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
