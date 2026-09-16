import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { DevelopmentCard } from "@/components/DevelopmentCard";
import { NoteComposer } from "@/components/NoteComposer";
import { LIBRARY_STATUS_LABELS } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function LibraryItemPage({ params }: { params: { id: string } }) {
  const item = await prisma.libraryItem.findUnique({
    where: { id: params.id },
    include: {
      development: {
        include: {
          tags: { include: { tag: true } },
          articles: { include: { source: true } },
          libraryItems: true,
        },
      },
      highlights: { include: { notes: true }, orderBy: { createdAt: "desc" } },
      notes: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!item) return notFound();

  const articleNotes = item.notes.filter((n) => n.type === "ARTICLE");

  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-ink/50 mb-2">
        {LIBRARY_STATUS_LABELS[item.status]} · saved {new Date(item.savedAt).toLocaleDateString()}
      </div>

      <DevelopmentCard development={item.development} />

      <section className="mt-8 pt-6 border-t border-ink/10">
        <h2 className="text-lg mb-3">Highlights</h2>
        {item.highlights.length === 0 && <p className="text-ink/60 text-sm">No highlights yet.</p>}
        <div className="space-y-4">
          {item.highlights.map((h) => (
            <div key={h.id} className="border-l-2 border-ink/20 pl-4">
              <p className="italic">&ldquo;{h.exactPassage}&rdquo;</p>
              <p className="text-xs text-ink/50 mt-1">
                {h.sourceLabel} ·{" "}
                <a href={h.sourceUrl} target="_blank" rel="noreferrer" className="underline">
                  source
                </a>
              </p>
              {h.annotation && <p className="text-sm mt-1">{h.annotation}</p>}
              {h.notes.map((n) => (
                <p key={n.id} className="text-sm mt-1 bg-black/5 rounded p-2">
                  {n.content}
                </p>
              ))}
              <div className="mt-2">
                <NoteComposer type="HIGHLIGHT" highlightId={h.id} placeholder="Add a note on this highlight…" />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8 pt-6 border-t border-ink/10">
        <h2 className="text-lg mb-3">Notes on this development</h2>
        <div className="space-y-2 mb-4">
          {articleNotes.map((n) => (
            <p key={n.id} className="text-sm bg-black/5 rounded p-2">
              {n.content}
              <span className="block text-xs text-ink/40 mt-1">
                {new Date(n.createdAt).toLocaleString()}
              </span>
            </p>
          ))}
        </div>
        <NoteComposer type="ARTICLE" developmentId={item.developmentId} />
      </section>
    </div>
  );
}
