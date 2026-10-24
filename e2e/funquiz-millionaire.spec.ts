import { test, expect, type Page } from "@playwright/test";

const BASE_URL = process.env.FUNQUIZ_E2E_BASE_URL ?? "http://127.0.0.1:3000";

async function healthReady(): Promise<boolean> {
  const res = await fetch(`${BASE_URL}/api/funquiz/health`);
  const h = (await res.json()) as { ok?: boolean };
  return Boolean(h.ok);
}

test.describe("Game 3 Shared Millionaire", () => {
  test.beforeEach(async () => {
    test.skip(!(await healthReady()), "Supabase FunQuiz storage not configured");
  });

  test("two players see ladder and can lock an answer", async ({ browser }) => {
    test.setTimeout(120_000);
    const hostCtx = await browser.newContext();
    const guestCtx = await browser.newContext();
    const host = await hostCtx.newPage();
    const guest = await guestCtx.newPage();
    try {
      await host.goto(`${BASE_URL}/funquiz`);
      await guest.goto(`${BASE_URL}/funquiz`);
      await host.getByPlaceholder("Enter your name").fill("MHost");
      await host.getByRole("button", { name: "Game 3 — Shared Millionaire" }).click();
      await host.getByRole("button", { name: "Intermediate", exact: true }).click();
      await host.getByRole("button", { name: "Space", exact: true }).click();
      await host.getByRole("button", { name: "Create room" }).click();
      await expect(host.getByText("Waiting room")).toBeVisible({ timeout: 20_000 });
      const code = (await host.locator("span.font-mono.text-lg").first().textContent())!.trim();
      await guest.getByPlaceholder("Enter your name").fill("MGuest");
      await guest.getByPlaceholder("ABC123").fill(code);
      await guest.getByRole("button", { name: "Join room" }).click();
      await host.getByRole("button", { name: /Start Shared Millionaire/i }).click();
      await expect(host.getByText("Prize ladder")).toBeVisible({ timeout: 20_000 });
      await expect(guest.getByText("Prize ladder")).toBeVisible({ timeout: 20_000 });
      await host.getByRole("option").first().click();
      await host.getByRole("button", { name: "Lock in answer" }).click();
      await expect(host.getByText(/locked|Correct|Incorrect/i)).toBeVisible({ timeout: 15_000 });
    } finally {
      await hostCtx.close();
      await guestCtx.close();
    }
  });
});
