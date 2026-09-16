import { NextResponse } from "next/server";
import { generateBriefingForDate } from "@/lib/ingestion/generateBriefing";

export async function POST() {
  try {
    const result = await generateBriefingForDate(new Date());
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
