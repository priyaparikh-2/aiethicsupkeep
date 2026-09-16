import { z } from "zod";
import { callClaude, EDITORIAL_SYSTEM_PROMPT } from "@/lib/llm";
import { CORE_TAGS, RESEARCH_TAGS } from "@/lib/taxonomy";
import type { CandidateItem } from "./fetchCandidates";

const scoreSchema = z.object({
  researchRelevance: z.number().min(0).max(100),
  consequence: z.number().min(0).max(100),
  novelty: z.number().min(0).max(100),
  evidenceQuality: z.number().min(0).max(100),
  originalReporting: z.number().min(0).max(100),
  intellectualGenerativity: z.number().min(0).max(100),
});

const developmentSchema = z.object({
  title: z.string(),
  sourceUrls: z.array(z.string()).min(1), // subset of input candidate urls belonging to this cluster
  primarySourceUrl: z.string().nullable().optional(),
  primarySourceLabel: z.string().nullable().optional(),
  whatHappened: z.string(),
  whyItMatters: z.string(),
  whereConversationStands: z.string(),
  whoIsAffected: z.array(z.string()),
  researchLens: z.string(),
  questionUnderneath: z.string(),
  tags: z.array(z.string()),
  newMediaForm: z.boolean().default(false),
  verificationNote: z.string().nullable().optional(),
  scores: scoreSchema,
});

const briefingSchema = z.object({
  stateOfConversation: z.string(),
  developments: z.array(developmentSchema).max(5),
  signalBeyondHeadlines: z
    .array(
      z.object({
        category: z.string(),
        text: z.string(),
      })
    )
    .max(3),
  researchProvocations: z
    .array(
      z.object({
        category: z.enum(["ETHICAL", "PHILOSOPHICAL", "INDUSTRY", "CINEMATIC"]),
        text: z.string(),
        newMediaForm: z.boolean().optional(),
      })
    )
    .max(3),
});

export type SynthesizedBriefing = z.infer<typeof briefingSchema>;

function buildPrompt(candidates: CandidateItem[]): string {
  const allowedTags = [...CORE_TAGS, ...RESEARCH_TAGS].join(", ");
  const catalog = candidates
    .map(
      (c, i) =>
        `[${i}] "${c.headline}" — ${c.sourceName} — ${c.publicationDate ?? "date unknown"}\nURL: ${c.url}\nSnippet: ${c.snippet ?? "(none)"}`
    )
    .join("\n\n");

  return `Below is a catalog of candidate items pulled from RSS feeds of film/TV trade press,
general news, and academic sources today. Most of these are NOT relevant to this
product — the taxonomy below defines what counts.

ALLOWED TOPIC TAGS (a development must plausibly connect to at least one):
${allowedTags}

Exclude general AI product/model news with no clear connection to moving-image
culture, artists, rights, authorship, labor, regulation, or spectatorship
(e.g. a new benchmark score, a chip-company earnings call).

CANDIDATE ITEMS:
${catalog || "(no candidate items were retrieved this run)"}

TASK:
1. Cluster candidates that cover the same underlying event/development into a
   single "development" (do not create 5 slots just because 5 outlets covered
   one story).
2. Select at most 5 developments, ranked by relevance. It is correct to
   return fewer than 5, or zero, if fewer materially matter today — do not
   pad.
3. For each development, write ONLY from the headlines/snippets/sources given
   above. If the snippet doesn't give you enough to state a fact confidently,
   say so in verificationNote rather than inventing detail.
4. Separate the neutral "what happened / why it matters / where the
   conversation stands / who is affected" layer from the "researchLens"
   layer (explicitly analysis/questions connecting to authorship, consent,
   agency, labor, spectatorship, embodiment, indexicality etc. per this
   product's research interests). questionUnderneath should be one specific,
   non-generic question.
5. Tag each development with 1-4 tags from the allowed list only.
6. Set newMediaForm=true only if the development is about a genuinely new
   mode of moving-image experience (adaptive/generative/interactive/
   personalized cinema, synthetic performers as a form not just a
   production shortcut), not ordinary production-cost stories.
7. Score each development 0-100 on: researchRelevance, consequence, novelty,
   evidenceQuality, originalReporting, intellectualGenerativity.
8. Write a 3-5 sentence "stateOfConversation" synthesis that is SPECIFIC to
   what these particular developments have in common today — never a
   generic statement like "AI continues to transform Hollywood."
9. Write up to 3 "signalBeyondHeadlines" items, each with one of these
   categories: "An assumption no one is questioning", "An under-covered
   stakeholder", "A language shift", "An emerging contradiction",
   "Something that changed quietly". Only include ones actually supported
   by today's candidates.
10. Write 1-3 "researchProvocations", each tagged ETHICAL, PHILOSOPHICAL,
    INDUSTRY, or CINEMATIC, bridging today's news to longer themes. Avoid
    generic prompts like "what does this mean for the future of AI?".

Respond with ONLY valid JSON matching this shape, no markdown fences, no
commentary:
{
  "stateOfConversation": string,
  "developments": [{
    "title": string,
    "sourceUrls": string[],
    "primarySourceUrl": string | null,
    "primarySourceLabel": string | null,
    "whatHappened": string,
    "whyItMatters": string,
    "whereConversationStands": string,
    "whoIsAffected": string[],
    "researchLens": string,
    "questionUnderneath": string,
    "tags": string[],
    "newMediaForm": boolean,
    "verificationNote": string | null,
    "scores": {
      "researchRelevance": number, "consequence": number, "novelty": number,
      "evidenceQuality": number, "originalReporting": number,
      "intellectualGenerativity": number
    }
  }],
  "signalBeyondHeadlines": [{ "category": string, "text": string }],
  "researchProvocations": [{ "category": "ETHICAL"|"PHILOSOPHICAL"|"INDUSTRY"|"CINEMATIC", "text": string, "newMediaForm": boolean }]
}`;
}

export async function synthesizeBriefing(
  candidates: CandidateItem[]
): Promise<SynthesizedBriefing> {
  const raw = await callClaude({
    system: EDITORIAL_SYSTEM_PROMPT,
    prompt: buildPrompt(candidates),
    maxTokens: 8000,
  });

  let parsed: unknown;
  try {
    const jsonText = raw.trim().replace(/^```(json)?/i, "").replace(/```$/, "");
    parsed = JSON.parse(jsonText);
  } catch {
    throw new Error(
      `Briefing synthesis did not return valid JSON. Raw response:\n${raw.slice(0, 2000)}`
    );
  }

  return briefingSchema.parse(parsed);
}
