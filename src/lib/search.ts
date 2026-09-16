import { prisma } from "@/lib/db";

export type SearchFilters = {
  q?: string;
  tag?: string;
  source?: string;
  from?: string; // ISO date
  to?: string; // ISO date
};

export type SearchResult = {
  kind: "development" | "note" | "highlight";
  id: string;
  title: string;
  snippet: string;
  href: string;
  date: Date;
};

// Keyword search across developments, notes, and highlights (PRD §18).
// "Semantic search" and "Ask My Archive" are handled by askArchive() below,
// which retrieves via the same keyword approach and lets the LLM reason
// over the retrieved passages rather than pretending to do vector search
// without an embeddings store.
export async function keywordSearch(filters: SearchFilters): Promise<SearchResult[]> {
  const { q, tag, source, from, to } = filters;
  const dateFilter =
    from || to
      ? {
          ...(from ? { gte: new Date(from) } : {}),
          ...(to ? { lte: new Date(to) } : {}),
        }
      : undefined;

  const developments = await prisma.development.findMany({
    where: {
      ...(dateFilter ? { createdAt: dateFilter } : {}),
      ...(tag ? { tags: { some: { tag: { name: tag } } } } : {}),
      ...(source ? { articles: { some: { source: { name: source } } } } : {}),
      ...(q
        ? {
            OR: [
              { title: { contains: q } },
              { whatHappened: { contains: q } },
              { whyItMatters: { contains: q } },
              { researchLens: { contains: q } },
              { questionUnderneath: { contains: q } },
            ],
          }
        : {}),
    },
    include: { libraryItems: true },
    take: 40,
  });

  const notes = await prisma.note.findMany({
    where: {
      ...(dateFilter ? { createdAt: dateFilter } : {}),
      ...(tag ? { tags: { some: { tag: { name: tag } } } } : {}),
      ...(q ? { content: { contains: q } } : {}),
    },
    include: { libraryItem: { include: { development: true } } },
    take: 40,
  });

  const highlights = await prisma.highlight.findMany({
    where: {
      ...(dateFilter ? { createdAt: dateFilter } : {}),
      ...(q
        ? { OR: [{ exactPassage: { contains: q } }, { annotation: { contains: q } }] }
        : {}),
    },
    include: { libraryItem: { include: { development: true } } },
    take: 40,
  });

  const results: SearchResult[] = [
    ...developments.map((d) => ({
      kind: "development" as const,
      id: d.id,
      title: d.title,
      snippet: d.whatHappened,
      href: d.libraryItems[0] ? `/library/${d.libraryItems[0].id}` : "/today",
      date: d.createdAt,
    })),
    ...notes.map((n) => ({
      kind: "note" as const,
      id: n.id,
      title: n.libraryItem?.development.title ?? "Research note",
      snippet: n.content,
      href: n.libraryItem ? `/library/${n.libraryItem.id}` : "/notes",
      date: n.createdAt,
    })),
    ...highlights.map((h) => ({
      kind: "highlight" as const,
      id: h.id,
      title: h.libraryItem.development.title,
      snippet: h.exactPassage,
      href: `/library/${h.libraryItem.id}`,
      date: h.createdAt,
    })),
  ];

  return results.sort((a, b) => b.date.getTime() - a.date.getTime());
}
