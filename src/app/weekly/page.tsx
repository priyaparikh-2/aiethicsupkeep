import { prisma } from "@/lib/db";
import { TriggerButton } from "@/components/TriggerButton";

export const dynamic = "force-dynamic";

export default async function WeeklyPage() {
  const review = await prisma.weeklyReview.findFirst({
    orderBy: { weekStart: "desc" },
    include: { developments: { include: { development: true } } },
  });

  return (
    <div>
      <div className="flex items-baseline justify-between mb-4">
        <h1 className="text-2xl">This Week in AI × Moving Image</h1>
        <TriggerButton
          endpoint="/api/weekly/generate"
          label="Generate this week's review"
          busyLabel="Synthesizing…"
        />
      </div>

      {!review && <p className="text-ink/60">No weekly review yet.</p>}

      {review && (
        <div className="space-y-8">
          <p className="text-xs uppercase tracking-wide text-ink/50">
            Week of {new Date(review.weekStart).toLocaleDateString()}
          </p>

          <section>
            <h2 className="text-lg mb-2">1. What actually changed</h2>
            <ul className="list-disc pl-5 space-y-1">
              {(JSON.parse(review.whatChanged) as string[]).map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-lg mb-2">2. The conversation</h2>
            <p>{review.theConversation}</p>
          </section>

          <section>
            <h2 className="text-lg mb-2">3. Where stakeholders disagree</h2>
            <p>{review.whereStakeholdersDisagree}</p>
          </section>

          <section>
            <h2 className="text-lg mb-2">4. What disappeared from the conversation</h2>
            <p>{review.whatDisappeared}</p>
          </section>

          <section>
            <h2 className="text-lg mb-2">5. Your week of thinking</h2>
            <p className="whitespace-pre-wrap">{review.yourWeekOfThinking}</p>
          </section>

          <section>
            <h2 className="text-lg mb-2">6. Emerging threads</h2>
            <ul className="list-disc pl-5 space-y-1">
              {(JSON.parse(review.emergingThreads) as string[]).map((t, i) => (
                <li key={i}>{t}</li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-lg mb-2">7. Possible article</h2>
            {(() => {
              const a = JSON.parse(review.possibleArticle) as {
                centralQuestion: string;
                whyNow: string;
                strongestSources: string[];
                existingThinking: string;
                missingResearch: string;
              };
              return (
                <div className="space-y-1">
                  <p>
                    <strong>Central question.</strong> {a.centralQuestion}
                  </p>
                  <p>
                    <strong>Why now.</strong> {a.whyNow}
                  </p>
                  <p>
                    <strong>Strongest sources.</strong> {a.strongestSources.join("; ")}
                  </p>
                  <p>
                    <strong>What you've already thought.</strong> {a.existingThinking}
                  </p>
                  <p>
                    <strong>Missing research.</strong> {a.missingResearch}
                  </p>
                </div>
              );
            })()}
          </section>

          <section>
            <h2 className="text-lg mb-2">8. Watch next week</h2>
            <ul className="list-disc pl-5 space-y-1">
              {(JSON.parse(review.watchNextWeek) as string[]).map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          </section>

          {review.developments.length > 0 && (
            <section className="pt-4 border-t border-ink/10">
              <h2 className="text-sm uppercase tracking-wide text-ink/50 mb-2">
                Developments this week
              </h2>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                {review.developments.map((d) => (
                  <li key={d.developmentId}>{d.development.title}</li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
