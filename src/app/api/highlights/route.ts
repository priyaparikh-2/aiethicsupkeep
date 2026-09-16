import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ensureLibraryItem } from "@/lib/library";

// A highlight always preserves exact passage + provenance (PRD §16): the
// request must include the passage, the source article's URL/label, and
// optionally the surrounding context and an inline annotation.
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { developmentId, exactPassage, surroundingContext, sourceUrl, sourceLabel, annotation } = body;

  if (!developmentId || !exactPassage || !sourceUrl || !sourceLabel) {
    return NextResponse.json(
      { error: "developmentId, exactPassage, sourceUrl, and sourceLabel are required" },
      { status: 400 }
    );
  }

  const libraryItem = await ensureLibraryItem(developmentId);

  const highlight = await prisma.highlight.create({
    data: {
      libraryItemId: libraryItem.id,
      exactPassage,
      surroundingContext: surroundingContext ?? null,
      sourceUrl,
      sourceLabel,
      annotation: annotation ?? null,
    },
  });

  return NextResponse.json(highlight, { status: 201 });
}
