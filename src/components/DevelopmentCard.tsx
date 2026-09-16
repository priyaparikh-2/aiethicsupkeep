import type { HydratedDevelopment } from "@/lib/briefing";
import { parseWhoIsAffected } from "@/lib/briefing";
import { SOURCE_CATEGORY_LABELS } from "@/lib/types";
import { TagBadge } from "@/components/TagBadge";
import { DevelopmentActions } from "@/components/DevelopmentActions";

export function DevelopmentCard({
  development,
  rank,
}: {
  development: HydratedDevelopment;
  rank?: number;
}) {
  const primary = development.articles[0];
  const who = parseWhoIsAffected(development.whoIsAffected);
  const libraryItem = development.libraryItems?.[0];

  return (
    <article className="py-7 border-t border-ink/10 first:border-t-0 first:pt-0">
      <div className="text-xs uppercase tracking-wide text-ink/50">
        {primary && `${SOURCE_CATEGORY_LABELS[primary.source.sourceCategory]} · ${primary.source.name}`}
        {primary?.publicationDate &&
          ` · ${new Date(primary.publicationDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`}
      </div>
      <h2 className="text-xl mt-1 mb-3">
        {rank ? `${rank}. ` : ""}
        {development.title}
      </h2>
      {development.newMediaForm && (
        <span className="inline-block text-[11px] bg-ink text-paper px-2 py-0.5 rounded mb-3">
          NEW MEDIA FORM
        </span>
      )}

      <p className="mb-2">
        <strong>What happened.</strong> {development.whatHappened}
      </p>
      <p className="mb-2">
        <strong>Why it matters.</strong> {development.whyItMatters}
      </p>
      <p className="mb-2">
        <strong>Where the conversation stands.</strong> {development.whereConversationStands}
      </p>
      {development.verificationNote && (
        <p className="mb-2 text-amber-800 text-sm italic">{development.verificationNote}</p>
      )}
      <p className="mb-3">
        <strong>Who is affected.</strong> {who.join(", ")}
      </p>

      {development.researchLens && (
        <div className="bg-black/5 rounded p-3 mb-3">
          <div className="text-[11px] uppercase tracking-wide text-ink/50 mb-1">
            Research lens — analysis, not settled fact
          </div>
          <p className="text-sm">{development.researchLens}</p>
        </div>
      )}

      {development.questionUnderneath && (
        <p className="mb-2">
          <strong>The question underneath it.</strong> {development.questionUnderneath}
        </p>
      )}

      <div className="mt-2">
        {development.tags.map((t) => (
          <TagBadge key={t.tagId} name={t.tag.name} />
        ))}
      </div>

      <div className="mt-2 flex gap-3 text-sm">
        {primary && (
          <a href={primary.url} target="_blank" rel="noreferrer" className="underline">
            Read →
          </a>
        )}
        {primary?.primarySourceUrl && (
          <a href={primary.primarySourceUrl} target="_blank" rel="noreferrer" className="underline">
            Primary evidence →
          </a>
        )}
      </div>

      <DevelopmentActions
        developmentId={development.id}
        libraryItemId={libraryItem?.id}
        status={libraryItem?.status}
        primaryArticleUrl={primary?.url}
        primaryArticleSourceLabel={primary ? `${primary.source.name}, ${primary.headline}` : undefined}
      />
    </article>
  );
}
