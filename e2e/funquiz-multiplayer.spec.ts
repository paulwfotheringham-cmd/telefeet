import { test, expect, type BrowserContext, type Page } from "@playwright/test";

const BASE_URL = process.env.FUNQUIZ_E2E_BASE_URL ?? "http://127.0.0.1:3000";

async function fillNameAndCreate(page: Page, name: string) {
  await page.getByPlaceholder("e.g. Alex").fill(name);
  await page.getByRole("button", { name: "Create room" }).click();
  await expect(page.getByText("Waiting room")).toBeVisible({ timeout: 15_000 });
}

async function fillNameAndJoin(page: Page, name: string, code: string) {
  await page.getByPlaceholder("e.g. Alex").fill(name);
  await page.getByPlaceholder("ABC123").fill(code);
  await page.getByRole("button", { name: "Join room" }).click();
  await expect(page.getByText("Waiting room")).toBeVisible({ timeout: 15_000 });
}

test("two browsers see both players and host can start", async ({ browser }) => {
  test.setTimeout(90_000);

  const hostContext: BrowserContext = await browser.newContext();
  const guestContext: BrowserContext = await browser.newContext();
  const host = await hostContext.newPage();
  const guest = await guestContext.newPage();

  try {
    await host.goto(`${BASE_URL}/funquiz`);
    await guest.goto(`${BASE_URL}/funquiz`);

    await fillNameAndCreate(host, "HostE2E");
    const codeText = await host.locator("span.font-mono.text-lg").first().textContent();
    assertRoomCode(codeText);
    const code = codeText!.trim();

    await fillNameAndJoin(guest, "GuestE2E", code);

    const hostLobbyList = host.locator("section ul");
    await expect(host.getByText("HostE2E (you)")).toBeVisible({ timeout: 15_000 });
    await expect(hostLobbyList.getByText("GuestE2E", { exact: true })).toBeVisible({
      timeout: 25_000,
    });
    await expect(guest.getByRole("button", { name: /Start quiz/i })).toHaveCount(0);
    await expect(guest.getByText("GuestE2E (you)")).toBeVisible({ timeout: 15_000 });
    await expect(guest.locator("section ul").getByText("HostE2E", { exact: true })).toBeVisible({
      timeout: 15_000,
    });

    const startBtn = host.getByRole("button", { name: /Start quiz/i });
    await expect(startBtn).toBeEnabled({ timeout: 15_000 });
    await startBtn.click();
    await expect(host.getByText(/Q 1\//)).toBeVisible({ timeout: 15_000 });
    await expect(guest.getByText(/Q 1\//)).toBeVisible({ timeout: 20_000 });
  } finally {
    await hostContext.close();
    await guestContext.close();
  }
});

function assertRoomCode(code: string | null) {
  if (!code || !/^[A-Z0-9]{6}$/.test(code.trim())) {
    throw new Error(`Expected 6-char room code, got ${code ?? "null"}`);
  }
}
