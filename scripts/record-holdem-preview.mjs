import { chromium } from "playwright";
import { readdirSync, writeFileSync } from "fs";
import { execSync } from "child_process";

const OUT = "/opt/cursor/artifacts/holdem-animations-preview.mp4";
const TMP_DIR = "/opt/cursor/artifacts/holdem-preview-capture";
const FRAME_DIR = "/opt/cursor/artifacts/holdem-preview-frames";
const run = Date.now();
const url = `http://127.0.0.1:3456/funquiz/holdem-motion-preview?run=${run}`;

const browser = await chromium.launch({
  headless: false,
  args: ["--no-sandbox", "--disable-dev-shm-usage", "--force-prefers-reduced-motion=false"],
});
const context = await browser.newContext({
  viewport: { width: 1280, height: 720 },
  recordVideo: { dir: TMP_DIR, size: { width: 1280, height: 720 } },
  reducedMotion: "no-preference",
});
const page = await context.newPage();
await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
await page.waitForSelector(".holdem-gnd-plate img", { state: "visible", timeout: 30000 });
await page.waitForTimeout(6200);
await context.close();
await browser.close();

const webm = readdirSync(TMP_DIR)
  .filter((f) => f.endsWith(".webm"))
  .sort()
  .at(-1);
if (!webm) throw new Error("No webm from playwright");

execSync(
  `ffmpeg -y -i "${TMP_DIR}/${webm}" -t 6 -c:v libx264 -pix_fmt yuv420p -movflags +faststart "${OUT}"`,
  { stdio: "inherit" }
);

execSync(`rm -rf "${FRAME_DIR}" && mkdir -p "${FRAME_DIR}"`);
for (const t of [0.4, 1.3, 2.6, 3.8, 5.0]) {
  execSync(
    `ffmpeg -y -ss ${t} -i "${OUT}" -frames:v 1 "${FRAME_DIR}/t-${String(t).replace(".", "_")}.png"`,
    { stdio: "pipe" }
  );
}

const meanDiff = execSync(
  `python3 -c "from PIL import ImageChops, Image; a=Image.open('${FRAME_DIR}/t-0_4.png').convert('RGB'); b=Image.open('${FRAME_DIR}/t-2_6.png').convert('RGB'); d=ImageChops.difference(a,b); print(sum(d.getdata())//3)"`,
  { encoding: "utf8" }
).trim();
const motionDetected = Number.parseFloat(meanDiff) > 50000;

const report = {
  output: OUT,
  durationSeconds: 6,
  frameSampleTimes: [0.4, 1.3, 2.6, 3.8, 5.0],
  absolutePixelDiff_t0_4_vs_t2_6: meanDiff,
  motionDetected,
};
writeFileSync("/opt/cursor/artifacts/holdem-preview-motion-report.json", JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
if (!motionDetected) {
  process.exit(2);
}