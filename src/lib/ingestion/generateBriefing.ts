import { prisma } from "@/lib/db";
import { SOURCE_REGISTRY } from "@/lib/taxonomy";
import { fetchCandidates, type CandidateItem } from "./fetchCandidates";
import { synthesizeBriefing } from "./synthesize";
import { weightedTotal } from "./score";

async function upsertSource(sourceName: string) {
  const registryEntry = SOURCE_REGISTRY.find((s) => s.name === sourceName);
  return prisma.source.upsert({
    where: { name: sourceName },
    update: {},
    create: {
      name: sourceName,
      sourceCategory: registryEntry?.sourceCategory ?? "GENERAL_NEWS",
      homepageUrl: registryEntry?.homepageUrl,
      rssUrl: registryEntry?.rssUrl,
    },
  });
}

// Orchestrates: fetch RSS candidates -> LLM cluster/score/tag/synthesize ->
// persist Briefing + Developments + Articles + Tags for `date`.
// Requires ANTHROPIC_API_KEY. Throws if no candidates were found at all
// (likely a network/feed problem) rather than silently producing an empty
// briefing.
export async function generateBriefingForDate(date: Date): Promise<{
  briefingId: string;
  developmentCount: number;
  feedErrors: { source: string; message: string }[];
}> {
  const { candidates, errors: feedErrors } = await fetchCandidates();

  if (candidates.length === 0) {
    throw new Error(
      "No candidate items were retrieved from any configured RSS feed. " +
        `Feed errors: ${JSON.stringify(feedErrors)}`
    );
  }

  const synthesized = await synthesizeBriefing(candidates);

  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);

  const briefing = await prisma.briefing.upsert({
    where: { date: dayStart },
    update: {
      stateOfConversation: synthesized.stateOfConversation,
      signalBeyondHeadlines: JSON.stringify(synthesized.signalBeyondHeadlines),
      researchProvocations: JSON.stringify(synthesized.researchProvocations),
    },
    create: {
      date: dayStart,
      stateOfConversation: synthesized.stateOfConversation,
      signalBeyondHeadlines: JSON.stringify(synthesized.signalBeyondHeadlines),
      researchProvocations: JSON.stringify(synthesized.researchProvocations),
    },
  });

  // Clear any prior slots/articles for a regenerated briefing.
  await prisma.briefingDevelopment.deleteMany({ where: { briefingId: briefing.id } });

  const candidateByUrl = new Map<string, CandidateItem>(candidates.map((c) => [c.url, c]));

  let rank = 0;
  for (const dev of synthesized.developments) {
    rank += 1;
    const scoreTotal = weightedTotal(dev.scores);

    const development = await prisma.development.create({
      data: {
        title: dev.title,
        whatHappened: dev.whatHappened,
        whyItMatters: dev.whyItMatters,
        whereConversationStands: dev.whereConversationStands,
        whoIsAffected: JSON.stringify(dev.whoIsAffected),
        researchLens: dev.researchLens,
        questionUnderneath: dev.questionUnderneath,
        newMediaForm: dev.newMediaForm,
        verificationNote: dev.verificationNote ?? null,
        scoreResearchRelevance: dev.scores.researchRelevance,
        scoreConsequence: dev.scores.consequence,
        scoreNovelty: dev.scores.novelty,
        scoreEvidenceQuality: dev.scores.evidenceQuality,
        scoreOriginalReporting: dev.scores.originalReporting,
        scoreIntellectualGenerativity: dev.scores.intellectualGenerativity,
        scoreTotal,
      },
    });

    for (const tagName of dev.tags) {
      const tag = await prisma.tag.findUnique({ where: { name: tagName } });
      if (!tag) continue;
      await prisma.developmentTag.create({
        data: { developmentId: development.id, tagId: tag.id },
      });
    }

    for (const url of dev.sourceUrls) {
      const candidate = candidateByUrl.get(url);
      if (!candidate) continue;
      const source = await upsertSource(candidate.sourceName);
      await prisma.article.upsert({
        where: { url: candidate.url },
        update: { developmentId: development.id },
        create: {
          headline: candidate.headline,
          url: candidate.url,
          author: candidate.author,
          publicationDate: candidate.publicationDate
            ? new Date(candidate.publicationDate)
            : null,
          sourceId: source.id,
          primarySourceUrl: dev.primarySourceUrl ?? null,
          primarySourceLabel: dev.primarySourceLabel ?? null,
          developmentId: development.id,
        },
      });
    }

    await prisma.briefingDevelopment.create({
      data: { briefingId: briefing.id, developmentId: development.id, rank },
    });
  }

  return {
    briefingId: briefing.id,
    developmentCount: synthesized.developments.length,
    feedErrors,
  };
}
