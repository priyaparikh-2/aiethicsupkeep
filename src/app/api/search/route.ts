import { NextRequest, NextResponse } from "next/server";
import { keywordSearch } from "@/lib/search";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const results = await keywordSearch({
    q: searchParams.get("q") ?? undefined,
    tag: searchParams.get("tag") ?? undefined,
    source: searchParams.get("source") ?? undefined,
    from: searchParams.get("from") ?? undefined,
    to: searchParams.get("to") ?? undefined,
  });
  return NextResponse.json(results);
}
