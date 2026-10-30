import { NextResponse } from "next/server";
import { WORLD_FLAG_ISO2_CODES } from "@/lib/funquiz/question-bank/builders/world-flags";

export const dynamic = "force-dynamic";

type Params = { params: { iso2: string } };

export async function GET(_request: Request, { params }: Params) {
  const iso2 = params.iso2?.trim().toLowerCase();
  if (!iso2 || !/^[a-z]{2}$/.test(iso2) || !WORLD_FLAG_ISO2_CODES.has(iso2)) {
    return new NextResponse("Not found", { status: 404 });
  }
  const url = `https://flagcdn.com/w640/${iso2}.png`;
  return NextResponse.redirect(url, 302);
}
