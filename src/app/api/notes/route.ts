import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ensureLibraryItem } from "@/lib/library";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const notes = await prisma.note.findMany({
    where: type ? { type } : {},
    include: {
      tags: { include: { tag: true } },
      developmentLinks: { include: { development: true } },
      libraryItem: { include: { development: true } },
      highlight: true,
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(notes);
}

// Notes exist at three levels (PRD §17): ARTICLE (attached to one
// development), HIGHLIGHT (attached to one passage), RESEARCH (independent,
// may link several developments).
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { type, content, developmentId, highlightId, developmentIds, tags } = body;

  if (!type || !content) {
    return NextResponse.json({ error: "type and content are required" }, { status: 400 });
  }

  let libraryItemId: string | null = null;
  if (type === "ARTICLE") {
    if (!developmentId) {
      return NextResponse.json({ error: "developmentId is required for ARTICLE notes" }, { status: 400 });
    }
    const item = await ensureLibraryItem(developmentId);
    libraryItemId = item.id;
  }

  if (type === "HIGHLIGHT" && !highlightId) {
    return NextResponse.json({ error: "highlightId is required for HIGHLIGHT notes" }, { status: 400 });
  }

  const note = await prisma.note.create({
    data: {
      type,
      content,
      libraryItemId,
      highlightId: type === "HIGHLIGHT" ? highlightId : null,
    },
  });

  const links: string[] = type === "RESEARCH" ? developmentIds ?? [] : [];
  for (const devId of links) {
    await prisma.noteDevelopmentLink.create({ data: { noteId: note.id, developmentId: devId } });
  }

  for (const tagName of (tags as string[] | undefined) ?? []) {
    const tag = await prisma.tag.findUnique({ where: { name: tagName } });
    if (!tag) continue;
    await prisma.noteTag.create({ data: { noteId: note.id, tagId: tag.id } });
  }

  return NextResponse.json(note, { status: 201 });
}
