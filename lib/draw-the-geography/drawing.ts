export type Stroke = {
  color: string;
  size: number;
  points: number[];
};

const COLORS = new Set(["#0f172a", "#dc2626", "#2563eb", "#16a34a", "#7c3aed", "#f8fafc"]);
const SIZES = new Set([4, 8, 14, 22]);

export function cleanStrokes(input: unknown): Stroke[] {
  if (!Array.isArray(input)) {
    throw new Error("Draw something before you submit");
  }
  const strokes: Stroke[] = [];
  for (const raw of input.slice(0, 80)) {
    if (!raw || typeof raw !== "object") continue;
    const record = raw as { color?: unknown; size?: unknown; points?: unknown };
    const color = typeof record.color === "string" && COLORS.has(record.color) ? record.color : "#0f172a";
    const size = typeof record.size === "number" && SIZES.has(record.size) ? record.size : 8;
    if (!Array.isArray(record.points)) continue;
    const points: number[] = [];
    for (const value of record.points.slice(0, 600)) {
      const rounded = Math.round(Number(value));
      if (!Number.isFinite(rounded)) continue;
      points.push(Math.max(0, Math.min(1000, rounded)));
    }
    if (points.length % 2 === 1) points.pop();
    if (points.length >= 2) strokes.push({ color, size, points });
  }
  if (strokes.length === 0) {
    throw new Error("Draw something before you submit");
  }
  return strokes;
}
