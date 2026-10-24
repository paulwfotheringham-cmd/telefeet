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

async function runOnce(): Promise<boolean> {
  const hostId = crypto.randomUUID();
  const guestId = crypto.randomUUID();
  const create = await fetch(`${BASE}/api/funquiz/room`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ playerId: hostId, playerName: "Host" }),
  }).then((r) => r.json());
  const code = create.state?.code as string | undefined;
  if (!code) return false;

  const polls = Array.from({ length: 12 }, (_, i) =>
    (async () => {
      await new Promise((r) => setTimeout(r, i * 100));
      await fetch(
        `${BASE}/api/funquiz/room/${encodeURIComponent(code)}?playerId=${encodeURIComponent(hostId)}`,
        { cache: "no-store" },
      );
    })(),
  );

  const join = fetch(`${BASE}/api/funquiz/room/join`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, playerId: guestId, playerName: "Guest" }),
  });

  await Promise.all([join, ...polls]);

  const final = await fetch(
    `${BASE}/api/funquiz/room/${encodeURIComponent(code)}?playerId=${encodeURIComponent(hostId)}`,
    { cache: "no-store" },
  ).then((r) => r.json());

  return final.state?.players?.length === 2;
}

let passed = 0;
const runs = 8;
for (let i = 0; i < runs; i++) {
  if (await runOnce()) passed++;
}

assert.ok(
  passed >= runs - 1,
  `Expected at least ${runs - 1}/${runs} join+poll races to keep 2 players, got ${passed}`,
);
console.log(`funquiz join race: ${passed}/${runs} OK`);
