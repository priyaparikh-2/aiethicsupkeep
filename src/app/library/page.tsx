import Link from "next/link";
import { prisma } from "@/lib/db";
import { LIBRARY_STATUS_LABELS } from "@/lib/types";
import { TagBadge } from "@/components/TagBadge";

export const dynamic = "force-dynamic";

export default async function LibraryPage({
  searchParams,
}: {
  searchParams: { status?: string; tag?: string };
}) {
  const items = await prisma.libraryItem.findMany({
    where: {
      ...(searchParams.status ? { status: searchParams.status } : {}),
      ...(searchParams.tag
        ? { development: { tags: { some: { tag: { name: searchParams.tag } } } } }
        : {}),
    },
    include: {
      development: { include: { tags: { include: { tag: true } } } },
      highlights: true,
      notes: true,
    },
    orderBy: { savedAt: "desc" },
  });

  const statuses = Object.keys(LIBRARY_STATUS_LABELS);

  return (
    <div>
      <h1 className="text-2xl mb-4">Library</h1>

      <div className="flex flex-wrap gap-2 mb-6 text-sm">
        <Link
          href="/library"
          className={!searchParams.status ? "font-semibold" : "text-ink/60 underline"}
        >
          All
        </Link>
        {statuses.map((s) => (
          <Link
            key={s}
            href={`/library?status=${s}`}
            className={searchParams.status === s ? "font-semibold" : "text-ink/60 underline"}
          >
            {LIBRARY_STATUS_LABELS[s]}
          </Link>
        ))}
      </div>

      {items.length === 0 && <p className="text-ink/60">Nothing saved yet.</p>}

      <div className="divide-y divide-ink/10">
        {items.map((item) => (
          <Link
            href={`/library/${item.id}`}
            key={item.id}
            className="block py-5 hover:bg-black/[0.02] -mx-2 px-2 rounded"
          >
            <div className="text-xs uppercase tracking-wide text-ink/50 flex justify-between">
              <span>{LIBRARY_STATUS_LABELS[item.status]}</span>
              <span>{new Date(item.savedAt).toLocaleDateString()}</span>
            </div>
            <h2 className="text-lg mt-1">{item.development.title}</h2>
            <div className="mt-1 text-xs text-ink/50">
              {item.highlights.length} highlight{item.highlights.length === 1 ? "" : "s"} ·{" "}
              {item.notes.length} note{item.notes.length === 1 ? "" : "s"}
            </div>
            <div className="mt-2">
              {item.development.tags.map((t) => (
                <TagBadge key={t.tagId} name={t.tag.name} />
              ))}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
