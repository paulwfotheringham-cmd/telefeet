import { writeFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { chromium } from "@playwright/test";
import { FOODS } from "../lib/draw-the-fast-food/foods";
import { FastFoodPicture } from "../app/draw-the-fast-food/fast-food-picture";

const WIDTH = 120;
const HEIGHT = 80;

function pack(bits: number[]): string {
  const bytes = Buffer.alloc(Math.ceil(bits.length / 8));
  bits.forEach((bit, index) => {
    if (bit) bytes[index >> 3] |= 1 << (index & 7);
  });
  return bytes.toString("base64");
}

async function main() {
  const browser = await chromium.launch({ headless: true, channel: "chrome" });
  const page = await browser.newPage();
  const foods: Record<string, string> = {};

  for (const food of FOODS) {
    const svg = renderToStaticMarkup(createElement(FastFoodPicture, { name: food.title }));
    if (!svg.includes("<svg")) throw new Error(`No picture for ${food.title}`);
    await page.setContent(`<!doctype html><body style="margin:0;background:#f8fafc">${svg}</body>`);
    const bits = await page.evaluate(({ width, height }) => {
      const source = document.querySelector("svg");
      if (!source) throw new Error("missing svg");
      source.setAttribute("width", String(width));
      source.setAttribute("height", String(height));
      const xml = new XMLSerializer().serializeToString(source);
      const image = new Image();
      const url = URL.createObjectURL(new Blob([xml], { type: "image/svg+xml" }));
      return new Promise<number[]>((resolve, reject) => {
        image.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const context = canvas.getContext("2d");
          if (!context) {
            reject(new Error("no canvas"));
            return;
          }
          context.fillStyle = "#f8fafc";
          context.fillRect(0, 0, width, height);
          context.drawImage(image, 0, 0, width, height);
          const data = context.getImageData(0, 0, width, height).data;
          const next: number[] = [];
          for (let index = 0; index < data.length; index += 4) {
            const red = data[index] ?? 255;
            const green = data[index + 1] ?? 255;
            const blue = data[index + 2] ?? 255;
            next.push(red > 245 && green > 245 && blue > 245 ? 0 : 1);
          }
          URL.revokeObjectURL(url);
          resolve(next);
        };
        image.onerror = () => reject(new Error("svg failed"));
        image.src = url;
      });
    }, { width: WIDTH, height: HEIGHT });
    const filled = bits.reduce((sum, bit) => sum + bit, 0);
    if (filled < 80) throw new Error(`${food.title} mask is almost empty (${filled})`);
    foods[food.id] = pack(bits);
    console.log(food.id, filled);
  }

  await browser.close();
  writeFileSync(
    "lib/draw-the-fast-food/masks.json",
    JSON.stringify({ width: WIDTH, height: HEIGHT, foods }),
  );
  console.log("wrote masks", Object.keys(foods).length);
}

main();
