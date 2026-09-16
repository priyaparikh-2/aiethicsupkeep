import { z } from "zod";
import { prisma } from "@/lib/db";
import { callClaude, EDITORIAL_SYSTEM_PROMPT } from "@/lib/llm";

const reviewSchema = z.object({
  whatChanged: z.array(z.string()).min(0).max(7),
  theConversation: z.string(),
  whereStakeholdersDisagree: z.string(),
  whatDisappeared: z.string(),
  yourWeekOfThinking: z.string(),
  emergingThreads: z.array(z.string()).max(4),
  possibleArticle: z.object({
    centralQuestion: z.string(),
    whyNow: z.string(),
    strongestSources: z.array(z.string()),
    existingThinking: z.string(),
    missingResearch: z.string(),
  }),
  watchNextWeek: z.array(z.string()).max(5),
});

function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0 = Sunday
  const diff = day === 0 ? -6 : 1 - day; // Monday as week start
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

// Weekly Research Review (PRD §21). Synthesizes the week's developments
// and the user's own notes/highlights into a structured review. The
// "Your week of thinking" section is instructed to quote the user's own
// notes verbatim rather than paraphrase — never put words in her mouth.
export async function generateWeeklyReview(referenceDate: Date): Promise<{ id: string }> {
  const weekStart = startOfWeek(referenceDate);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const developments = await prisma.development.findMany({
    where: { createdAt: { gte: weekStart, lt: weekEnd } },
    include: { tags: { include: { tag: true } }, articles: { include: { source: true } } },
  });

  const notes = await prisma.note.findMany({
    where: { createdAt: { gte: weekStart, lt: weekEnd } },
  });

  const highlights = await prisma.highlight.findMany({
    where: { createdAt: { gte: weekStart, lt: weekEnd } },
  });

  const devText = developments
    .map(
      (d) =>
        `- "${d.title}" [${d.tags.map((t) => t.tag.name).join(", ")}]: ${d.whatHappened} ${d.whyItMatters}`
    )
    .join("\n");

  const notesText = notes.map((n) => `- (${n.type}) "${n.content}"`).join("\n");
  const highlightsText = highlights.map((h) => `- "${h.exactPassage}"${h.annotation ? ` — user note: "${h.annotation}"` : ""}`).join("\n");

  const prompt = `Write this week's research review for the period ${weekStart.toDateString()} to
${new Date(weekEnd.getTime() - 86400000).toDateString()}.

DEVELOPMENTS SURFACED THIS WEEK:
${devText || "(none recorded)"}

USER'S NOTES WRITTEN THIS WEEK:
${notesText || "(none)"}

USER'S HIGHLIGHTS SAVED THIS WEEK:
${highlightsText || "(none)"}

Produce:
- whatChanged: 3-7 items, each a CHANGE (not just a story) — what is
  actually different now versus before. Empty array if nothing material
  changed.
- theConversation: what themes dominated coverage this week
- whereStakeholdersDisagree: studios / artists / unions / regulators /
  researchers, where relevant; say plainly if there wasn't real disagreement
- whatDisappeared: important questions that received little attention
- yourWeekOfThinking: synthesize the user's notes/highlights above. Quote
  her own words directly using quotation marks when doing so; do not
  invent or paraphrase claims she didn't make. If she wrote nothing this
  week, say so plainly rather than inventing reflection.
- emergingThreads: 2-4 short phrases naming research themes becoming visible
- possibleArticle: ONE article idea (not ten) with centralQuestion, whyNow,
  strongestSources (list development titles from above), existingThinking
  (reference her notes if any exist, otherwise say none yet), missingResearch
- watchNextWeek: up to 5 concrete things to watch (court decisions,
  regulatory proceedings, union negotiations, conferences, deployments) —
  only if grounded in what's in front of you; otherwise leave sparse

Respond with ONLY valid JSON matching:
{ "whatChanged": string[], "theConversation": string, "whereStakeholdersDisagree": string,
  "whatDisappeared": string, "yourWeekOfThinking": string, "emergingThreads": string[],
  "possibleArticle": { "centralQuestion": string, "whyNow": string, "strongestSources": string[],
  "existingThinking": string, "missingResearch": string }, "watchNextWeek": string[] }`;

  const raw = await callClaude({ system: EDITORIAL_SYSTEM_PROMPT, prompt, maxTokens: 4000 });
  const jsonText = raw.trim().replace(/^```(json)?/i, "").replace(/```$/, "");
  const parsed = reviewSchema.parse(JSON.parse(jsonText));

  const review = await prisma.weeklyReview.upsert({
    where: { weekStart },
    update: {
      whatChanged: JSON.stringify(parsed.whatChanged),
      theConversation: parsed.theConversation,
      whereStakeholdersDisagree: parsed.whereStakeholdersDisagree,
      whatDisappeared: parsed.whatDisappeared,
      yourWeekOfThinking: parsed.yourWeekOfThinking,
      emergingThreads: JSON.stringify(parsed.emergingThreads),
      possibleArticle: JSON.stringify(parsed.possibleArticle),
      watchNextWeek: JSON.stringify(parsed.watchNextWeek),
    },
    create: {
      weekStart,
      whatChanged: JSON.stringify(parsed.whatChanged),
      theConversation: parsed.theConversation,
      whereStakeholdersDisagree: parsed.whereStakeholdersDisagree,
      whatDisappeared: parsed.whatDisappeared,
      yourWeekOfThinking: parsed.yourWeekOfThinking,
      emergingThreads: JSON.stringify(parsed.emergingThreads),
      possibleArticle: JSON.stringify(parsed.possibleArticle),
      watchNextWeek: JSON.stringify(parsed.watchNextWeek),
    },
  });

  await prisma.weeklyReviewDevelopment.deleteMany({ where: { weeklyReviewId: review.id } });
  for (const d of developments) {
    await prisma.weeklyReviewDevelopment.create({
      data: { weeklyReviewId: review.id, developmentId: d.id },
    });
  }

  return { id: review.id };
}
