import { NextResponse } from "next/server";
import { isValidRoomCode, normalizeRoomCode } from "@/lib/funquiz/room-code";
import { loadRoom } from "@/lib/funquiz/store";
import { loadDrawRoom } from "@/lib/draw-the-organ/store";
import { loadGameRoom } from "@/lib/name-that-game/store";
import { loadMovieRoom } from "@/lib/name-that-movie/store";
import { loadShowRoom } from "@/lib/name-that-show/store";
import { loadTuneRoom } from "@/lib/name-that-tune/store";
import { ROOM_DIRECTORIES } from "@/lib/room-directory";

export const dynamic = "force-dynamic";

type Params = { params: { code: string } };

const LOADERS = {
  funquiz: loadRoom,
  movie: loadMovieRoom,
  tune: loadTuneRoom,
  show: loadShowRoom,
  game: loadGameRoom,
  organ: loadDrawRoom,
} as const;

export async function GET(_request: Request, { params }: Params) {
  const code = normalizeRoomCode(params.code ?? "");
  if (!isValidRoomCode(code)) {
    return NextResponse.json({ error: "Room code must be 6 letters or numbers." }, { status: 400 });
  }
  for (const entry of ROOM_DIRECTORIES) {
    try {
      const room = await LOADERS[entry.id](code);
      if (room) {
        return NextResponse.json(
          { id: entry.id, path: entry.path, nameKey: entry.nameKey },
          { headers: { "Cache-Control": "no-store" } },
        );
      }
    } catch {
      /* Try the next game. A missing store should not hide a room that exists elsewhere. */
    }
  }
  return NextResponse.json(
    { error: "Room not found. Check the code with your friend, or ask them to create a new room." },
    { status: 404, headers: { "Cache-Control": "no-store" } },
  );
}
