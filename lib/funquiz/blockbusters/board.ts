/** Classic staggered Blockbusters-style 20-hex layout (5-4-5-4). */

export type BoardCellDef = {
  id: number;
  row: number;
  col: number;
  wide: boolean;
};

const ROWS: { wide: boolean; count: number }[] = [
  { wide: true, count: 5 },
  { wide: false, count: 4 },
  { wide: true, count: 5 },
  { wide: false, count: 4 },
];

function buildDefs(): BoardCellDef[] {
  const defs: BoardCellDef[] = [];
  for (let row = 0; row < ROWS.length; row++) {
    const { wide, count } = ROWS[row]!;
    for (let col = 0; col < count; col++) {
      defs.push({ id: defs.length, row, col, wide });
    }
  }
  return defs;
}

export const BOARD_CELL_DEFS = buildDefs();

const DEF_BY_ID = new Map(BOARD_CELL_DEFS.map((d) => [d.id, d]));
const DEF_BY_POS = new Map(BOARD_CELL_DEFS.map((d) => [`${d.row}:${d.col}`, d]));

function neighborCoords(row: number, col: number, wide: boolean): [number, number][] {
  if (wide) {
    return [
      [row - 1, col - 1],
      [row - 1, col],
      [row, col - 1],
      [row, col + 1],
      [row + 1, col - 1],
      [row + 1, col],
    ];
  }
  return [
    [row - 1, col],
    [row - 1, col + 1],
    [row, col - 1],
    [row, col + 1],
    [row + 1, col],
    [row + 1, col + 1],
  ];
}

export function boardNeighbors(cellId: number): number[] {
  const def = DEF_BY_ID.get(cellId);
  if (!def) return [];
  const out: number[] = [];
  for (const [r, c] of neighborCoords(def.row, def.col, def.wide)) {
    const n = DEF_BY_POS.get(`${r}:${c}`);
    if (n) out.push(n.id);
  }
  return out;
}

function isLeftEdge(def: BoardCellDef): boolean {
  return def.col === 0;
}

function isRightEdge(def: BoardCellDef): boolean {
  return def.wide ? def.col === 4 : def.col === 3;
}

function isTopEdge(def: BoardCellDef): boolean {
  return def.row === 0;
}

function isBottomEdge(def: BoardCellDef): boolean {
  return def.row === 3;
}

function hasPath(
  owned: Set<number>,
  startIds: number[],
  goal: (def: BoardCellDef) => boolean,
): boolean {
  const queue = startIds.filter((id) => owned.has(id));
  const seen = new Set(queue);
  while (queue.length > 0) {
    const id = queue.shift()!;
    const def = DEF_BY_ID.get(id)!;
    if (goal(def)) return true;
    for (const n of boardNeighbors(id)) {
      if (!owned.has(n) || seen.has(n)) continue;
      seen.add(n);
      queue.push(n);
    }
  }
  return false;
}

/** Host-side player connects any left hex to any right hex. */
export function horizontalPlayerWins(ownedCellIds: number[]): boolean {
  const owned = new Set(ownedCellIds);
  const starts = BOARD_CELL_DEFS.filter(isLeftEdge).map((d) => d.id);
  return hasPath(owned, starts, isRightEdge);
}

/** Guest connects any top hex to any bottom hex. */
export function verticalPlayerWins(ownedCellIds: number[]): boolean {
  const owned = new Set(ownedCellIds);
  const starts = BOARD_CELL_DEFS.filter(isTopEdge).map((d) => d.id);
  return hasPath(owned, starts, isBottomEdge);
}
