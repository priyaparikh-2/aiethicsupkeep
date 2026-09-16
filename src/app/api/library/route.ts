import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ensureLibraryItem } from "@/lib/library";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const tag = searchParams.get("tag");

  const items = await prisma.libraryItem.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(tag
        ? { development: { tags: { some: { tag: { name: tag } } } } }
        : {}),
    },
    include: {
      development: {
        include: {
          tags: { include: { tag: true } },
          articles: { include: { source: true } },
        },
      },
      highlights: true,
      notes: true,
    },
    orderBy: { savedAt: "desc" },
  });

  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { developmentId } = body;
  if (!developmentId) {
    return NextResponse.json({ error: "developmentId is required" }, { status: 400 });
  }
  const item = await ensureLibraryItem(developmentId);
  return NextResponse.json(item, { status: 201 });
}
