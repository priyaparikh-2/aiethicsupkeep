import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client";
import type { SignalItem, ProvocationItem } from "@/lib/types";

const developmentInclude = {
  articles: { include: { source: true } },
  tags: { include: { tag: true } },
  libraryItems: true,
} satisfies Prisma.DevelopmentInclude;

export type HydratedDevelopment = Prisma.DevelopmentGetPayload<{
  include: typeof developmentInclude;
}>;

export type HydratedBriefing = {
  id: string;
  date: Date;
  stateOfConversation: string;
  signalBeyondHeadlines: SignalItem[];
  researchProvocations: ProvocationItem[];
  sentAt: Date | null;
  developments: (HydratedDevelopment & { rank: number })[];
};

function hydrate(briefing: {
  id: string;
  date: Date;
  stateOfConversation: string;
  signalBeyondHeadlines: string;
  researchProvocations: string;
  sentAt: Date | null;
  developments: { rank: number; development: HydratedDevelopment }[];
}): HydratedBriefing {
  return {
    id: briefing.id,
    date: briefing.date,
    stateOfConversation: briefing.stateOfConversation,
    signalBeyondHeadlines: JSON.parse(briefing.signalBeyondHeadlines || "[]"),
    researchProvocations: JSON.parse(briefing.researchProvocations || "[]"),
    sentAt: briefing.sentAt,
    developments: briefing.developments
      .sort((a, b) => a.rank - b.rank)
      .map((bd) => ({ ...bd.development, rank: bd.rank })),
  };
}

export async function getLatestBriefing(): Promise<HydratedBriefing | null> {
  const briefing = await prisma.briefing.findFirst({
    orderBy: { date: "desc" },
    include: {
      developments: {
        include: { development: { include: developmentInclude } },
      },
    },
  });
  if (!briefing) return null;
  return hydrate(briefing);
}

export async function getBriefingByDate(date: Date): Promise<HydratedBriefing | null> {
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  const briefing = await prisma.briefing.findUnique({
    where: { date: dayStart },
    include: {
      developments: {
        include: { development: { include: developmentInclude } },
      },
    },
  });
  if (!briefing) return null;
  return hydrate(briefing);
}

export function parseWhoIsAffected(json: string): string[] {
  try {
    return JSON.parse(json);
  } catch {
    return [];
  }
}
