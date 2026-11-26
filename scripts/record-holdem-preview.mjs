import { chromium } from "playwright";
import { renameSync, readdirSync } from "fs";
import { execSync } from "child_process";

const OUT = "/opt/cursor/artifacts/holdem-animations-preview.mp4";
const TMP_DIR = "/opt/cursor/artifacts/holdem-preview-capture";

const browser = await chromium.launch({
  headless: false,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
const context = await browser.newContext({
  viewport: { width: 1280, height: 720 },
  recordVideo: { dir: TMP_DIR, size: { width: 1280, height: 720 } },
});
const page = await context.newPage();
await page.goto("http://127.0.0.1:3456/funquiz/holdem-motion-preview", {
  waitUntil: "load",
  timeout: 60000,
});
await page.waitForSelector(".holdem-gnd-plate img", { state: "visible", timeout: 30000 });
await page.evaluate(() =>
  Promise.all(
    Array.from(document.images).map((img) =>
      img.complete
        ? Promise.resolve()
        : new Promise((r) => {
            img.onload = r;
            img.onerror = r;
          })
    )
  )
);
await page.waitForTimeout(4500);
await context.close();
await browser.close();

const webm = readdirSync(TMP_DIR).find((f) => f.endsWith(".webm"));
if (!webm) throw new Error("No webm from playwright");
execSync(
  `ffmpeg -y -i "${TMP_DIR}/${webm}" -c:v libx264 -pix_fmt yuv420p -movflags +faststart "${OUT}"`,
  { stdio: "inherit" }
);
console.log("Wrote", OUT);