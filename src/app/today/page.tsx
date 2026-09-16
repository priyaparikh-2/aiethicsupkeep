import { getLatestBriefing } from "@/lib/briefing";
import { DevelopmentCard } from "@/components/DevelopmentCard";
import { RegenerateBriefingButton } from "@/components/RegenerateBriefingButton";

export const dynamic = "force-dynamic";

export default async function TodayPage() {
  const briefing = await getLatestBriefing();

  if (!briefing) {
    return (
      <div>
        <h1 className="text-2xl mb-3">No briefing yet</h1>
        <p className="text-ink/70 mb-4">
          Run <code className="bg-black/5 px-1 rounded">npm run brief:generate</code> (requires
          <code className="bg-black/5 px-1 rounded mx-1">ANTHROPIC_API_KEY</code>) or load the
          seed data with <code className="bg-black/5 px-1 rounded">npm run db:seed</code>.
        </p>
        <RegenerateBriefingButton />
      </div>
    );
  }

  const dateLabel = briefing.date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <div className="text-xs uppercase tracking-wide text-ink/50">AI × Moving Image</div>
        <RegenerateBriefingButton />
      </div>
      <h1 className="text-2xl mb-4">{dateLabel}</h1>
      <p className="text-[15px] leading-relaxed mb-8">{briefing.stateOfConversation}</p>

      <h2 className="text-xs uppercase tracking-wide text-ink/60 mb-2">
        {briefing.developments.length === 5
          ? "The five things worth knowing"
          : briefing.developments.length === 1
            ? "The one thing worth knowing"
            : `${briefing.developments.length} things worth knowing`}
      </h2>

      {briefing.developments.length === 0 && (
        <p className="text-ink/60 py-6">No developments met the relevance bar today.</p>
      )}

      {briefing.developments.map((dev) => (
        <DevelopmentCard key={dev.id} development={dev} rank={dev.rank} />
      ))}

      {briefing.signalBeyondHeadlines.length > 0 && (
        <section className="mt-10 pt-8 border-t-2 border-ink">
          <h2 className="text-lg mb-3">Signal Beyond the Headlines</h2>
          <ul className="space-y-2 list-disc pl-5">
            {briefing.signalBeyondHeadlines.map((s, i) => (
              <li key={i}>
                <strong>{s.category}.</strong> {s.text}
              </li>
            ))}
          </ul>
        </section>
      )}

      {briefing.researchProvocations.length > 0 && (
        <section className="mt-8">
          <h2 className="text-lg mb-3">What Should Priya Be Thinking About?</h2>
          <ul className="space-y-2 list-disc pl-5">
            {briefing.researchProvocations.map((p, i) => (
              <li key={i}>
                <strong>
                  {p.category}
                  {p.newMediaForm ? " · NEW MEDIA FORM" : ""}.
                </strong>{" "}
                {p.text}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
