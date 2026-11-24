import masksFile from "./masks.json";
import { INSTRUMENTS } from "./instruments";
import type { Stroke } from "./drawing";

const WIDTH = masksFile.width;
const HEIGHT = masksFile.height;
const REACH = 4;

const titles = new Map(INSTRUMENTS.map((organ) => [organ.title, organ.id]));

type Prepared = {
  edge: number[];
  nearInside: Uint8Array;
};

function unpack(packed: string): Uint8Array {
  const bytes = Buffer.from(packed, "base64");
  const bits = new Uint8Array(WIDTH * HEIGHT);
  for (let index = 0; index < bits.length; index++) {
    bits[index] = (bytes[index >> 3]! >> (index & 7)) & 1;
  }
  return bits;
}

function dilate(source: Uint8Array, radius: number): Uint8Array {
  const next = new Uint8Array(source.length);
  const radiusSquared = radius * radius;
  for (let y = 0; y < HEIGHT; y++) {
    for (let x = 0; x < WIDTH; x++) {
      if (!source[y * WIDTH + x]) continue;
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          if (dx * dx + dy * dy > radiusSquared) continue;
          const nx = x + dx;
          const ny = y + dy;
          if (nx >= 0 && ny >= 0 && nx < WIDTH && ny < HEIGHT) next[ny * WIDTH + nx] = 1;
        }
      }
    }
  }
  return next;
}

function prepare(bits: Uint8Array): Prepared {
  const edge: number[] = [];
  for (let y = 0; y < HEIGHT; y++) {
    for (let x = 0; x < WIDTH; x++) {
      const index = y * WIDTH + x;
      if (!bits[index]) continue;
      const border =
        x === 0 ||
        y === 0 ||
        x === WIDTH - 1 ||
        y === HEIGHT - 1 ||
        !bits[index - 1] ||
        !bits[index + 1] ||
        !bits[index - WIDTH] ||
        !bits[index + WIDTH];
      if (border) edge.push(index);
    }
  }
  return { edge, nearInside: dilate(bits, REACH) };
}

const prepared = new Map<string, Prepared>();
for (const [id, packed] of Object.entries(masksFile.instruments)) {
  prepared.set(id, prepare(unpack(packed)));
}

function stamp(grid: Uint8Array, x: number, y: number, radius: number, value: number) {
  const radiusSquared = radius * radius;
  for (let dy = -radius; dy <= radius; dy++) {
    for (let dx = -radius; dx <= radius; dx++) {
      if (dx * dx + dy * dy > radiusSquared) continue;
      const nx = x + dx;
      const ny = y + dy;
      if (nx >= 0 && ny >= 0 && nx < WIDTH && ny < HEIGHT) grid[ny * WIDTH + nx] = value;
    }
  }
}

function rasterize(strokes: Stroke[]): Uint8Array {
  const grid = new Uint8Array(WIDTH * HEIGHT);
  for (const stroke of strokes) {
    const value = stroke.color.toLowerCase() === "#f8fafc" ? 0 : 1;
    const radius = Math.max(1, Math.round((stroke.size / 1000) * WIDTH));
    for (let index = 0; index + 1 < stroke.points.length; index += 2) {
      const x = Math.round((stroke.points[index]! / 1000) * (WIDTH - 1));
      const y = Math.round((stroke.points[index + 1]! / 1000) * (HEIGHT - 1));
      if (index >= 2) {
        const previousX = Math.round((stroke.points[index - 2]! / 1000) * (WIDTH - 1));
        const previousY = Math.round((stroke.points[index - 1]! / 1000) * (HEIGHT - 1));
        const steps = Math.max(Math.abs(x - previousX), Math.abs(y - previousY));
        for (let step = 0; step <= steps; step++) {
          const t = steps === 0 ? 0 : step / steps;
          stamp(
            grid,
            Math.round(previousX + (x - previousX) * t),
            Math.round(previousY + (y - previousY) * t),
            radius,
            value,
          );
        }
      } else {
        stamp(grid, x, y, radius, value);
      }
    }
  }
  return grid;
}

export function scoreDrawing(organTitle: string, strokes: Stroke[]): number {
  const id = titles.get(organTitle as (typeof INSTRUMENTS)[number]["title"]);
  const mask = id ? prepared.get(id) : undefined;
  if (!mask || mask.edge.length === 0) return 0;
  const ink = rasterize(strokes);
  let inkCount = 0;
  let precise = 0;
  const nearInk = dilate(ink, REACH);
  for (let index = 0; index < ink.length; index++) {
    if (!ink[index]) continue;
    inkCount += 1;
    if (mask.nearInside[index]) precise += 1;
  }
  if (inkCount === 0) return 0;
  let covered = 0;
  for (const index of mask.edge) {
    if (nearInk[index]) covered += 1;
  }
  const coverage = covered / mask.edge.length;
  const precision = precise / inkCount;
  return coverage * 0.7 + precision * 0.3;
}

export function compareDrawings(organTitle: string, drawings: Array<{ playerId: string; strokes: Stroke[] }>) {
  const scores = drawings.map((drawing) => ({
    playerId: drawing.playerId,
    score: scoreDrawing(organTitle, drawing.strokes),
  }));
  const best = Math.max(0, ...scores.map((entry) => entry.score));
  const winnerIds =
    best <= 0.02 ? [] : scores.filter((entry) => best - entry.score <= 0.05).map((entry) => entry.playerId);
  return { scores, winnerIds };
}
