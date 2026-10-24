/**
 * Regression: concurrent host polls during guest join must not drop the guest row.
 * Requires network; skips when FUNQUIZ_E2E_BASE_URL is unset.
 */
import assert from "node:assert/strict";

const BASE = process.env.FUNQUIZ_E2E_BASE_URL;
if (!BASE) {
  console.log("funquiz join race: skipped (set FUNQUIZ_E2E_BASE_URL)");
  process.exit(0);
}

import { runConcurrentJoinOnce } from "./funquiz-concurrent-join.harness";

async function main() {
  let passed = 0;
  const runs = 8;
  for (let i = 0; i < runs; i++) {
    if (await runConcurrentJoinOnce(BASE)) passed++;
  }

  assert.ok(
    passed >= runs - 1,
    `Expected at least ${runs - 1}/${runs} join+poll races to keep 2 players, got ${passed}`,
  );
  console.log(`funquiz join race: ${passed}/${runs} OK`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
