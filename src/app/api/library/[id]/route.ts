import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const item = await prisma.libraryItem.findUnique({
    where: { id: params.id },
    include: {
      development: {
        include: {
          tags: { include: { tag: true } },
          articles: { include: { source: true } },
        },
      },
      highlights: { include: { notes: true }, orderBy: { createdAt: "desc" } },
      notes: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(item);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const { status } = body;
  const item = await prisma.libraryItem.update({
    where: { id: params.id },
    data: { ...(status ? { status } : {}) },
  });
  return NextResponse.json(item);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await prisma.libraryItem.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
