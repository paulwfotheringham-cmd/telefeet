/** Map a pathname to a stable anonymous game id (or null on selection/home). */
export function gameIdFromPath(pathname: string): string | null {
  const path = pathname.split("?")[0] || "/";
  if (path === "/" || path === "/funquiz") return null;
  if (path.startsWith("/funquiz/")) {
    const rest = path.slice("/funquiz/".length).split("/")[0];
    if (!rest || rest === "share-code-preview" || rest === "holdem-motion-preview") return null;
    return `funquiz-${rest}`;
  }
  if (path.startsWith("/draw-the-")) return path.slice(1).replace(/\/$/, "") || null;
  if (path.startsWith("/name-that-")) return path.slice(1).replace(/\/$/, "") || null;
  if (path === "/blackjack" || path.startsWith("/blackjack/")) return "blackjack";
  return null;
}

export function isSelectionSurface(pathname: string, inFunQuizGame: boolean): boolean {
  const path = pathname.split("?")[0] || "/";
  if (path === "/" || path === "/funquiz") return !inFunQuizGame;
  return false;
}
