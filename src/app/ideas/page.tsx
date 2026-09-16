import Link from "next/link";
import { prisma } from "@/lib/db";
import { TriggerButton } from "@/components/TriggerButton";

export const dynamic = "force-dynamic";

export default async function IdeasPage() {
  const constellations = await prisma.ideaConstellation.findMany({
    orderBy: { updatedAt: "desc" },
  });

  const developmentTitles = new Map<string, string>();
  const devLibrary = new Map<string, string | undefined>();
  const allIds = constellations.flatMap((c) => JSON.parse(c.evidenceIds) as string[]);
  if (allIds.length) {
    const devs = await prisma.development.findMany({
      where: { id: { in: allIds } },
      include: { libraryItems: true },
    });
    for (const d of devs) {
      developmentTitles.set(d.id, d.title);
      devLibrary.set(d.id, d.libraryItems[0]?.id);
    }
  }

  return (
    <div>
      <div className="flex items-baseline justify-between mb-4">
        <h1 className="text-2xl">Ideas</h1>
        <TriggerButton
          endpoint="/api/ideas/generate"
          label="Find idea constellations"
          busyLabel="Analyzing your library…"
        />
      </div>
      <p className="text-ink/60 text-sm mb-8">
        Themes gradually emerging from what you've saved, highlighted, and noted — not a daily
        prompt, but research memory.
      </p>

      {constellations.length === 0 && (
        <p className="text-ink/60">
          Nothing yet. Save a few developments to your library and tag them, then run &ldquo;Find
          idea constellations.&rdquo;
        </p>
      )}

      <div className="space-y-10">
        {constellations.map((c) => {
          const evidenceIds = JSON.parse(c.evidenceIds) as string[];
          const themeTags = JSON.parse(c.themeTags) as string[];
          return (
            <article key={c.id} className="border-t border-ink/10 pt-6">
              <h2 className="text-xl mb-1 uppercase tracking-tight">{c.centralQuestion}</h2>
              <p className="text-xs text-ink/50 mb-4">
                {evidenceIds.length} saved source{evidenceIds.length === 1 ? "" : "s"} · themes:{" "}
                {themeTags.join(", ")}
              </p>
              {c.possibleArgument && (
                <p className="mb-2">
                  <strong>Possible argument.</strong> {c.possibleArgument}
                </p>
              )}
              {c.whyNow && (
                <p className="mb-2">
                  <strong>Why now.</strong> {c.whyNow}
                </p>
              )}
              {c.missingResearch && (
                <p className="mb-2">
                  <strong>What&apos;s missing.</strong> {c.missingResearch}
                </p>
              )}
              {c.counterargument && (
                <p className="mb-2">
                  <strong>Counterargument.</strong> {c.counterargument}
                </p>
              )}
              {c.openingQuestion && (
                <p className="mb-3">
                  <strong>Possible opening question.</strong> {c.openingQuestion}
                </p>
              )}
              <div className="flex flex-wrap gap-2 text-sm">
                {evidenceIds.map((id) => {
                  const libId = devLibrary.get(id);
                  return libId ? (
                    <Link key={id} href={`/library/${libId}`} className="underline">
                      {developmentTitles.get(id) ?? id}
                    </Link>
                  ) : (
                    <span key={id} className="text-ink/50">
                      {developmentTitles.get(id) ?? id}
                    </span>
                  );
                })}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
