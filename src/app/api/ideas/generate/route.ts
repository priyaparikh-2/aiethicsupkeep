import { NextResponse } from "next/server";
import { generateIdeaConstellations } from "@/lib/ideas";

export async function POST() {
  try {
    const result = await generateIdeaConstellations();
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
