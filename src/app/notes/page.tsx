import Link from "next/link";
import { prisma } from "@/lib/db";
import { ArchiveExplorer } from "@/components/ArchiveExplorer";
import { ResearchNoteComposer } from "@/components/ResearchNoteComposer";

export const dynamic = "force-dynamic";

export default async function NotesPage() {
  const [notes, libraryItems] = await Promise.all([
    prisma.note.findMany({
      include: {
        tags: { include: { tag: true } },
        developmentLinks: { include: { development: true } },
        libraryItem: { include: { development: true } },
        highlight: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.libraryItem.findMany({ include: { development: true } }),
  ]);

  const libraryOptions = libraryItems.map((li) => ({
    developmentId: li.developmentId,
    title: li.development.title,
  }));

  return (
    <div>
      <h1 className="text-2xl mb-4">Notes</h1>
      <ArchiveExplorer />
      <ResearchNoteComposer libraryOptions={libraryOptions} />

      <div className="space-y-4">
        {notes.length === 0 && <p className="text-ink/60">No notes yet.</p>}
        {notes.map((note) => (
          <div key={note.id} className="border-t border-ink/10 pt-4">
            <div className="text-xs uppercase tracking-wide text-ink/50">
              {note.type === "ARTICLE"
                ? "Article note"
                : note.type === "HIGHLIGHT"
                  ? "Highlight note"
                  : "Research note"}{" "}
              · {new Date(note.createdAt).toLocaleDateString()}
            </div>
            <p className="mt-1">{note.content}</p>
            <div className="mt-1 text-xs text-ink/50 flex flex-wrap gap-2">
              {note.libraryItem && (
                <Link href={`/library/${note.libraryItem.id}`} className="underline">
                  {note.libraryItem.development.title}
                </Link>
              )}
              {note.developmentLinks.map((link) => (
                <span key={link.developmentId}>{link.development.title}</span>
              ))}
              {note.tags.map((t) => (
                <span key={t.tagId}>#{t.tag.name}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
