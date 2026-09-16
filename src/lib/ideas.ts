import { z } from "zod";
import { prisma } from "@/lib/db";
import { callClaude, EDITORIAL_SYSTEM_PROMPT } from "@/lib/llm";

const MIN_EVIDENCE_ITEMS = 2; // minimum saved developments sharing a tag before it's worth surfacing as a constellation

const constellationSchema = z.object({
  centralQuestion: z.string(),
  possibleArgument: z.string(),
  whyNow: z.string(),
  missingResearch: z.string(),
  counterargument: z.string(),
  openingQuestion: z.string(),
});

// Idea Development Engine + Idea Constellations (PRD §19-20).
// Groups saved developments by recurring tag co-occurrence, then for each
// cluster with enough evidence, asks the LLM to synthesize a specific
// argument grounded ONLY in the user's own saved material (developments,
// highlights, notes) — never a generic "AI and the future of film" title.
export async function generateIdeaConstellations(): Promise<{ created: number; skipped: string[] }> {
  const libraryItems = await prisma.libraryItem.findMany({
    include: {
      development: { include: { tags: { include: { tag: true } } } },
      highlights: true,
      notes: true,
    },
  });

  const tagGroups = new Map<string, typeof libraryItems>();
  for (const item of libraryItems) {
    for (const dt of item.development.tags) {
      const list = tagGroups.get(dt.tag.name) ?? [];
      list.push(item);
      tagGroups.set(dt.tag.name, list);
    }
  }

  const candidateTags = Array.from(tagGroups.entries()).filter(
    ([, items]) => items.length >= MIN_EVIDENCE_ITEMS
  );

  let created = 0;
  const skipped: string[] = [];

  // Cap how many constellations we synthesize per run to keep this a
  // deliberate, high-signal feature rather than a firehose.
  for (const [tagName, items] of candidateTags.slice(0, 5)) {
    const evidenceIds = items.map((i) => i.developmentId);
    const existing = await prisma.ideaConstellation.findFirst({
      where: { themeTags: { contains: tagName } },
    });

    const evidenceText = items
      .map(
        (item) =>
          `Development: "${item.development.title}"\n` +
          `  What happened: ${item.development.whatHappened}\n` +
          `  Research lens: ${item.development.researchLens ?? "(none)"}\n` +
          (item.notes.length
            ? `  User notes: ${item.notes.map((n) => `"${n.content}"`).join(" / ")}\n`
            : "") +
          (item.highlights.length
            ? `  User highlights: ${item.highlights
                .map((h) => `"${h.exactPassage}"${h.annotation ? ` (note: ${h.annotation})` : ""}`)
                .join(" / ")}\n`
            : "")
      )
      .join("\n");

    const prompt = `The user's research library contains ${items.length} saved developments tagged
"${tagName}", along with their own notes and highlights on them. Ground
everything below ONLY in this material — do not introduce outside facts,
and do not produce a generic title like "AI and the Future of Film".

EVIDENCE:
${evidenceText}

Produce:
- centralQuestion: a specific, provocative question this cluster of
  evidence is circling (used as the constellation's title, e.g. "WHO OWNS
  A PERFORMANCE AFTER THE BODY LEAVES THE SET?")
- possibleArgument: a specific claim or tension (not a generic statement)
- whyNow: what about the current material makes this contemporaneous
- missingResearch: what the user would need to investigate before writing
- counterargument: the strongest credible challenge to the emerging argument
- openingQuestion: one question an essay could grow from

Respond with ONLY valid JSON: { "centralQuestion": string, "possibleArgument": string,
"whyNow": string, "missingResearch": string, "counterargument": string, "openingQuestion": string }`;

    try {
      const raw = await callClaude({ system: EDITORIAL_SYSTEM_PROMPT, prompt, maxTokens: 1500 });
      const jsonText = raw.trim().replace(/^```(json)?/i, "").replace(/```$/, "");
      const parsedResult = constellationSchema.parse(JSON.parse(jsonText));

      const data = {
        centralQuestion: parsedResult.centralQuestion,
        themeTags: JSON.stringify([tagName]),
        possibleArgument: parsedResult.possibleArgument,
        whyNow: parsedResult.whyNow,
        evidenceIds: JSON.stringify(evidenceIds),
        missingResearch: parsedResult.missingResearch,
        counterargument: parsedResult.counterargument,
        openingQuestion: parsedResult.openingQuestion,
      };

      if (existing) {
        await prisma.ideaConstellation.update({ where: { id: existing.id }, data });
      } else {
        await prisma.ideaConstellation.create({ data });
      }
      created += 1;
    } catch (err) {
      skipped.push(`${tagName}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  return { created, skipped };
}
