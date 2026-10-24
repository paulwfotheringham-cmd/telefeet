import { NextResponse } from "next/server";
import { getOutlineSvg } from "@/lib/funquiz/outline-paths";

export const dynamic = "force-dynamic";

type Params = { params: { assetId: string } };

export async function GET(_request: Request, { params }: Params) {
  const assetId = params.assetId?.trim();
  if (!assetId || !/^o\d{3}$/.test(assetId)) {
    return new NextResponse("Not found", { status: 404 });
  }
  const svg = getOutlineSvg(assetId);
  if (!svg) {
    return new NextResponse("Not found", { status: 404 });
  }
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="${svg.viewBox}" role="img" aria-label="Country outline">
  <path fill="#c4b5fd" stroke="#ede9fe" stroke-width="2" d="${svg.d}"/>
</svg>`;
  return new NextResponse(body, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
