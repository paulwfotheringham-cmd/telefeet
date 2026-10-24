/** Shared concurrent host-poll / guest-join scenario for regression tests. */

export async function runConcurrentJoinOnce(baseUrl: string): Promise<boolean> {
  const hostId = crypto.randomUUID();
  const guestId = crypto.randomUUID();
  const create = await fetch(`${baseUrl}/api/funquiz/room`, {
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
        `${baseUrl}/api/funquiz/room/${encodeURIComponent(code)}?playerId=${encodeURIComponent(hostId)}`,
        { cache: "no-store" },
      );
    })(),
  );

  await Promise.all([
    fetch(`${baseUrl}/api/funquiz/room/join`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, playerId: guestId, playerName: "Guest" }),
    }),
    ...polls,
  ]);

  const final = await fetch(
    `${baseUrl}/api/funquiz/room/${encodeURIComponent(code)}?playerId=${encodeURIComponent(hostId)}`,
    { cache: "no-store" },
  ).then((r) => r.json());

  return final.state?.players?.length === 2;
}
