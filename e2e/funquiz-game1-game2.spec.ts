import { test, expect, type BrowserContext, type Page } from "@playwright/test";

const BASE_URL = process.env.FUNQUIZ_E2E_BASE_URL ?? "http://127.0.0.1:3000";

async function healthReady(): Promise<boolean> {
  try {
    const res = await fetch(`${BASE_URL}/api/funquiz/health`);
    if (!res.ok) return false;
    const h = (await res.json()) as { ok?: boolean };
    return Boolean(h.ok);
  } catch {
    return false;
  }
}

async function fillName(page: Page, name: string) {
  await page.getByPlaceholder("Enter your name").fill(name);
}

test.describe("Game 1 and Game 2 multiplayer", () => {
  test.beforeEach(async () => {
    test.skip(!(await healthReady()), "Supabase FunQuiz storage not configured (see /api/funquiz/health)");
  });

  test("Game 1 turn-based feedback and reveal", async ({ browser }) => {
    test.setTimeout(120_000);
    const hostCtx = await browser.newContext();
    const guestCtx = await browser.newContext();
    const host = await hostCtx.newPage();
    const guest = await guestCtx.newPage();
    try {
      await host.goto(`${BASE_URL}/funquiz`);
      await guest.goto(`${BASE_URL}/funquiz`);
      await fillName(host, "G1Host");
      await host.getByRole("button", { name: "Game 1 — Take turns" }).click();
      await host.getByRole("button", { name: "Intermediate", exact: true }).click();
      await host.getByRole("button", { name: "Space", exact: true }).click();
      await host.getByRole("button", { name: "Create room" }).click();
      await expect(host.getByText("Waiting room")).toBeVisible({ timeout: 20_000 });
      const code = (await host.locator("span.font-mono.text-lg").first().textContent())!.trim();
      await fillName(guest, "G1Guest");
      await guest.getByPlaceholder("ABC123").fill(code);
      await guest.getByRole("button", { name: "Join room" }).click();
      await expect(guest.getByText("Waiting room")).toBeVisible({ timeout: 20_000 });
      await host.getByRole("button", { name: /Start Take turns/i }).click();
      await expect(host.getByText(/Turn 1\//)).toBeVisible({ timeout: 20_000 });
      const firstOption = host.locator('button[type="button"]').filter({ hasText: /^A\./ }).first();
      await firstOption.click();
      await expect(host.getByText("Correct!").or(host.getByText("Incorrect"))).toBeVisible({
        timeout: 15_000,
      });
    } finally {
      await hostCtx.close();
      await guestCtx.close();
    }
  });

  test("Game 2 shared team score header", async ({ browser }) => {
    test.setTimeout(120_000);
    const hostCtx = await browser.newContext();
    const guestCtx = await browser.newContext();
    const host = await hostCtx.newPage();
    const guest = await guestCtx.newPage();
    try {
      await host.goto(`${BASE_URL}/funquiz`);
      await guest.goto(`${BASE_URL}/funquiz`);
      await fillName(host, "G2Host");
      await host.getByRole("button", { name: "Game 2 — Play together" }).click();
      await host.getByRole("button", { name: "Intermediate", exact: true }).click();
      await host.getByRole("button", { name: "Geography", exact: true }).click();
      await host.getByRole("button", { name: "Create room" }).click();
      await expect(host.getByText("Waiting room")).toBeVisible({ timeout: 20_000 });
      const code = (await host.locator("span.font-mono.text-lg").first().textContent())!.trim();
      await fillName(guest, "G2Guest");
      await guest.getByPlaceholder("ABC123").fill(code);
      await guest.getByRole("button", { name: "Join room" }).click();
      await host.getByRole("button", { name: /Start Play together/i }).click();
      await expect(host.getByText("Team score")).toBeVisible({ timeout: 20_000 });
      await expect(guest.getByText("Team score")).toBeVisible({ timeout: 20_000 });
    } finally {
      await hostCtx.close();
      await guestCtx.close();
    }
  });
});
