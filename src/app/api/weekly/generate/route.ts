import { NextResponse } from "next/server";
import { generateWeeklyReview } from "@/lib/weeklyReview";

export async function POST() {
  try {
    const result = await generateWeeklyReview(new Date());
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
