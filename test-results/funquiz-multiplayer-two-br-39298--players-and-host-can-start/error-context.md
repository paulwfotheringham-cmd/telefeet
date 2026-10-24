# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: funquiz-multiplayer.spec.ts >> two browsers see both players and host can start
- Location: e2e/funquiz-multiplayer.spec.ts:18:5

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('section ul').getByText('GuestE2E', { exact: true })
Expected: visible
Timeout: 15000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" locator('section ul').getByText('GuestE2E', { exact: true }) with timeout 15000ms
  - waiting for locator('section ul').getByText('GuestE2E', { exact: true })

```

```yaml
- banner:
  - paragraph: Room 3PZMFJ
  - heading "Fun Quiz" [level=1]
  - button "Leave"
- paragraph: HostE2E (you)
- paragraph: "0"
- heading "Waiting room" [level=2]
- paragraph: Share code 3PZMFJ with your opponent.
- list:
  - listitem: HostE2E
  - listitem: Waiting for player 2…
- button "Start quiz (50 questions)" [disabled]
- alert
```

# Test source

```ts
  1  | import { test, expect, type BrowserContext, type Page } from "@playwright/test";
  2  | 
  3  | const BASE_URL = process.env.FUNQUIZ_E2E_BASE_URL ?? "http://127.0.0.1:3000";
  4  | 
  5  | async function fillNameAndCreate(page: Page, name: string) {
  6  |   await page.getByPlaceholder("e.g. Alex").fill(name);
  7  |   await page.getByRole("button", { name: "Create room" }).click();
  8  |   await expect(page.getByText("Waiting room")).toBeVisible({ timeout: 15_000 });
  9  | }
  10 | 
  11 | async function fillNameAndJoin(page: Page, name: string, code: string) {
  12 |   await page.getByPlaceholder("e.g. Alex").fill(name);
  13 |   await page.getByPlaceholder("ABC123").fill(code);
  14 |   await page.getByRole("button", { name: "Join room" }).click();
  15 |   await expect(page.getByText("Waiting room")).toBeVisible({ timeout: 15_000 });
  16 | }
  17 | 
  18 | test("two browsers see both players and host can start", async ({ browser }) => {
  19 |   test.setTimeout(90_000);
  20 | 
  21 |   const hostContext: BrowserContext = await browser.newContext();
  22 |   const guestContext: BrowserContext = await browser.newContext();
  23 |   const host = await hostContext.newPage();
  24 |   const guest = await guestContext.newPage();
  25 | 
  26 |   try {
  27 |     await host.goto(`${BASE_URL}/funquiz`);
  28 |     await guest.goto(`${BASE_URL}/funquiz`);
  29 | 
  30 |     await fillNameAndCreate(host, "HostE2E");
  31 |     const codeText = await host.locator("span.font-mono.text-lg").first().textContent();
  32 |     assertRoomCode(codeText);
  33 |     const code = codeText!.trim();
  34 | 
  35 |     await fillNameAndJoin(guest, "GuestE2E", code);
  36 | 
  37 |     const hostLobbyList = host.locator("section ul");
  38 |     await expect(host.getByText("HostE2E (you)")).toBeVisible({ timeout: 15_000 });
> 39 |     await expect(hostLobbyList.getByText("GuestE2E", { exact: true })).toBeVisible({
     |                                                                        ^ Error: expect(locator).toBeVisible() failed
  40 |       timeout: 15_000,
  41 |     });
  42 |     await expect(guest.getByText("GuestE2E (you)")).toBeVisible({ timeout: 15_000 });
  43 |     await expect(guest.locator("section ul").getByText("HostE2E", { exact: true })).toBeVisible({
  44 |       timeout: 15_000,
  45 |     });
  46 | 
  47 |     const startBtn = host.getByRole("button", { name: /Start quiz/i });
  48 |     await expect(startBtn).toBeEnabled({ timeout: 15_000 });
  49 |     await startBtn.click();
  50 |     await expect(host.getByText(/Q 1\//)).toBeVisible({ timeout: 15_000 });
  51 |     await expect(guest.getByText(/Q 1\//)).toBeVisible({ timeout: 20_000 });
  52 |   } finally {
  53 |     await hostContext.close();
  54 |     await guestContext.close();
  55 |   }
  56 | });
  57 | 
  58 | function assertRoomCode(code: string | null) {
  59 |   if (!code || !/^[A-Z0-9]{6}$/.test(code.trim())) {
  60 |     throw new Error(`Expected 6-char room code, got ${code ?? "null"}`);
  61 |   }
  62 | }
  63 | 
```