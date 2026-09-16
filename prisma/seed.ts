import { PrismaClient } from "@prisma/client";
import { ALL_TAGS, SOURCE_REGISTRY } from "../src/lib/taxonomy";

const prisma = new PrismaClient();

// Seed data is illustrative/demo content so the app is usable before
// ANTHROPIC_API_KEY-powered live ingestion is configured (see README).
// One development below (SAG-AFTRA digital replica terms) reflects
// well-documented public record; the others are explicitly marked as
// example placeholders and should not be read as verified reporting.
async function main() {
  console.log("Seeding tags…");
  for (const t of ALL_TAGS) {
    await prisma.tag.upsert({ where: { name: t.name }, update: {}, create: t });
  }

  console.log("Seeding sources…");
  for (const s of SOURCE_REGISTRY) {
    await prisma.source.upsert({
      where: { name: s.name },
      update: {},
      create: {
        name: s.name,
        sourceCategory: s.sourceCategory,
        homepageUrl: s.homepageUrl,
        rssUrl: s.rssUrl,
      },
    });
  }

  await prisma.settings.upsert({ where: { id: 1 }, update: {}, create: { id: 1 } });

  const variety = await prisma.source.findUniqueOrThrow({ where: { name: "Variety" } });
  const sagAftra = await prisma.source.findUniqueOrThrow({ where: { name: "SAG-AFTRA" } });
  const indieWire = await prisma.source.findUniqueOrThrow({ where: { name: "IndieWire" } });

  async function tagIdsFor(names: string[]) {
    const tags = await prisma.tag.findMany({ where: { name: { in: names } } });
    return tags.map((t) => t.id);
  }

  console.log("Seeding example developments…");

  // Development 1 — grounded in well-documented public record.
  const dev1 = await prisma.development.create({
    data: {
      title: "SAG-AFTRA's 2023 agreement set consent and compensation terms for digital replicas",
      whatHappened:
        "SAG-AFTRA's 2023 TV/Theatrical agreement, ratified after the union's strike, introduced provisions requiring informed consent and compensation before a struck company creates or uses a 'digital replica' of a performer, and requires disclosure when a synthetic performer is generated from a combination of human likenesses.",
      whyItMatters:
        "It is one of the first major entertainment-labor agreements to define digital replicas contractually and tie their use to consent and pay, rather than leaving it to individual negotiation or silence in existing contracts.",
      whereConversationStands:
        "There is broad agreement that the agreement was a meaningful first step. Performers and legal commentators differ on how well 'informed consent' is defined in practice, and on whether background/day-player performers have the bargaining leverage to decline scans even when consent is formally required.",
      whoIsAffected: JSON.stringify(["actors", "background performers", "studios", "casting directors"]),
      researchLens:
        "Analysis, not settled fact: the agreement treats consent as a discrete, contractual event at the moment of scanning, but says little about consent to *future, unspecified* re-uses of a digital replica. That gap is worth watching: does a performer who consents to a scan for Film A meaningfully consent to however that replica is repurposed years later?",
      questionUnderneath:
        "At what point does contractual consent to a digital scan stop tracking the performer's actual understanding of how that likeness may be reused?",
      newMediaForm: false,
      scoreResearchRelevance: 92,
      scoreConsequence: 85,
      scoreNovelty: 60,
      scoreEvidenceQuality: 90,
      scoreOriginalReporting: 70,
      scoreIntellectualGenerativity: 88,
      scoreTotal: 84,
      tags: { create: (await tagIdsFor(["Likeness / digital replicas", "Consent", "Performer rights", "Union agreements", "Labor"])).map((tagId) => ({ tagId })) },
      articles: {
        create: [
          {
            headline: "Inside SAG-AFTRA's AI Protections: What the New Contract Actually Says",
            url: "https://variety.com/feature/sag-aftra-ai-contract-explainer",
            sourceId: variety.id,
            primarySourceUrl: "https://www.sagaftra.org",
            primarySourceLabel: "SAG-AFTRA — 2023 TV/Theatrical Agreement summary",
            publicationDate: new Date("2023-12-05"),
          },
          {
            headline: "SAG-AFTRA 2023 TV/Theatrical Agreement — Digital Replica Provisions",
            url: "https://www.sagaftra.org/sagaftra-2023-contract",
            sourceId: sagAftra.id,
            publicationDate: new Date("2023-11-14"),
          },
        ],
      },
    },
  });

  // Development 2 — explicitly marked as an illustrative example, not tied
  // to one verified event.
  const dev2 = await prisma.development.create({
    data: {
      title: "[Example] Studios weigh AI-generated background performers to cut production costs",
      whatHappened:
        "Trade coverage this quarter has described several productions piloting AI-generated crowd and background performers instead of hiring background actors for select shots, citing cost and scheduling flexibility.",
      whyItMatters:
        "Background work has historically been an entry point into the industry and a meaningful, if lower-paid, source of union income; a shift toward synthetic crowds would remove that entry point without a clear replacement.",
      whereConversationStands:
        "Studios describe this as a supplement for large-crowd or hazardous shots, not a wholesale replacement. Background actors and SAG-AFTRA representatives describe it as the leading edge of a broader substitution. Independent data on how often this is actually used industry-wide is not yet available.",
      whoIsAffected: JSON.stringify(["background performers", "studios", "casting directors", "VFX artists"]),
      researchLens:
        "Analysis, not settled fact: 'supplement, not replacement' is a company framing repeated across coverage — worth tracking whether it holds up as a pattern of use, or functions as a way to introduce the practice gradually while resistance is lowest.",
      questionUnderneath:
        "If background performance is where dispensability is first normalized, what does that predict about where the argument moves next?",
      newMediaForm: false,
      verificationNote:
        "This is an illustrative example entry for demo purposes — it is not tied to one verified, dated news event. Replace with live ingestion output.",
      scoreResearchRelevance: 78,
      scoreConsequence: 70,
      scoreNovelty: 55,
      scoreEvidenceQuality: 40,
      scoreOriginalReporting: 35,
      scoreIntellectualGenerativity: 75,
      scoreTotal: 62,
      tags: { create: (await tagIdsFor(["Synthetic actors", "Labor", "Performer rights", "AI filmmaking"])).map((tagId) => ({ tagId })) },
      articles: {
        create: [
          {
            headline: "[Example] The Quiet Rise of the Synthetic Extra",
            url: "https://www.indiewire.com/example/synthetic-background-performers",
            sourceId: indieWire.id,
            publicationDate: new Date(),
          },
        ],
      },
    },
  });

  // Development 3 — new media form example.
  const dev3 = await prisma.development.create({
    data: {
      title: "[Example] Generative 'adaptive' shorts experiment with per-viewer narrative variation",
      whatHappened:
        "A small number of festival-circuit experiments have used generative video models to alter minor narrative details (pacing, background detail, ambient dialogue) per viewing session, while keeping the core story fixed.",
      whyItMatters:
        "This is a genuinely new mode of moving-image experience — not a cheaper production method, but a change in what a 'film' is: no longer a single fixed sequence of frames every viewer sees identically.",
      whereConversationStands:
        "Framed largely as experimental/art-context work rather than commercial narrative filmmaking so far; no consensus yet on how criticism, authorship credit, or exhibition norms should adapt.",
      whoIsAffected: JSON.stringify(["independent filmmakers", "audiences", "film critics", "festival programmers"]),
      researchLens:
        "Analysis, not settled fact: when the image a viewer sees is no longer identical to what any other viewer saw, the indexical claim classical film theory makes — that the image is a trace of something that was actually in front of a camera at a moment in time — weakens further. Worth asking what remains of 'spectatorship' as shared experience when the object of address is no longer fixed.",
      questionUnderneath:
        "If no two viewings of a film are the same sequence of images, in what sense is it still one film?",
      newMediaForm: true,
      verificationNote:
        "This is an illustrative example entry for demo purposes — it is not tied to one verified, dated news event. Replace with live ingestion output.",
      scoreResearchRelevance: 95,
      scoreConsequence: 55,
      scoreNovelty: 90,
      scoreEvidenceQuality: 45,
      scoreOriginalReporting: 40,
      scoreIntellectualGenerativity: 95,
      scoreTotal: 72,
      tags: { create: (await tagIdsFor(["Interactive / generative moving images", "Spectatorship", "Emerging cinematic forms", "Indexicality"])).map((tagId) => ({ tagId })) },
      articles: {
        create: [
          {
            headline: "[Example] When Every Screening Is a Different Film",
            url: "https://www.indiewire.com/example/adaptive-generative-shorts",
            sourceId: indieWire.id,
            publicationDate: new Date(),
          },
        ],
      },
    },
  });

  console.log("Seeding today's briefing…");
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const briefing = await prisma.briefing.create({
    data: {
      date: today,
      stateOfConversation:
        "This is seed/demo content, not a live editorial synthesis. Once ANTHROPIC_API_KEY and RSS ingestion are configured, running `npm run brief:generate` will replace this with a real daily synthesis grounded in that day's sources.",
      signalBeyondHeadlines: JSON.stringify([
        {
          category: "A language shift",
          text: "[Example] Coverage increasingly says 'digital replica' where it once said 'AI actor' — worth tracking whether that shift reflects a real change in how the industry understands what's being licensed.",
        },
      ]),
      researchProvocations: JSON.stringify([
        {
          category: "PHILOSOPHICAL",
          text: "[Example] If a digital replica can perform independently of the body it was scanned from, what exactly is being licensed when a studio pays for its use — likeness, labor, or authorship?",
        },
      ]),
      developments: {
        create: [
          { developmentId: dev1.id, rank: 1 },
          { developmentId: dev2.id, rank: 2 },
          { developmentId: dev3.id, rank: 3 },
        ],
      },
    },
  });

  console.log("Seeding library, highlights, and notes…");
  const lib1 = await prisma.libraryItem.create({
    data: { developmentId: dev1.id, status: "USE_FOR_RESEARCH" },
  });
  const lib2 = await prisma.libraryItem.create({
    data: { developmentId: dev2.id, status: "SAVED" },
  });

  const highlight1 = await prisma.highlight.create({
    data: {
      libraryItemId: lib1.id,
      exactPassage:
        "requiring informed consent and compensation before a struck company creates or uses a 'digital replica' of a performer",
      surroundingContext: "From the agreement summary describing digital replica provisions.",
      sourceUrl: "https://www.sagaftra.org",
      sourceLabel: "SAG-AFTRA, 2023 TV/Theatrical Agreement summary",
      annotation:
        "The word doing the work here is 'informed' — that's the part nobody has operationalized yet.",
    },
  });

  await prisma.note.create({
    data: {
      type: "HIGHLIGHT",
      content: "Compare this to GDPR's 'informed consent' standard — is there a workable analogue for performance data?",
      highlightId: highlight1.id,
    },
  });

  await prisma.note.create({
    data: {
      type: "ARTICLE",
      content: "Follow up: how many background performers actually understood the scan-consent form they signed, versus just signing to get the job?",
      libraryItemId: lib2.id,
    },
  });

  const researchNoteTagIds = await tagIdsFor(["Consent", "Labor"]);
  const researchNote = await prisma.note.create({
    data: {
      type: "RESEARCH",
      content:
        "Recurring pattern across both the SAG-AFTRA terms and the background-performer piece: consent is being treated as a single point-in-time transaction (sign the form, do the scan) rather than an ongoing relationship to how the resulting data gets used. That's the throughline I keep coming back to.",
      tags: { create: researchNoteTagIds.map((tagId) => ({ tagId })) },
      developmentLinks: { create: [{ developmentId: dev1.id }, { developmentId: dev2.id }] },
    },
  });

  console.log(`Seed complete. Briefing: ${briefing.id}, research note: ${researchNote.id}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
