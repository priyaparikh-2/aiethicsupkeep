export type SignalItem = {
  category:
    | "An assumption no one is questioning"
    | "An under-covered stakeholder"
    | "A language shift"
    | "An emerging contradiction"
    | "Something that changed quietly";
  text: string;
};

export type ProvocationItem = {
  category: "ETHICAL" | "PHILOSOPHICAL" | "INDUSTRY" | "CINEMATIC";
  text: string;
  newMediaForm?: boolean;
};

export type PossibleArticle = {
  centralQuestion: string;
  whyNow: string;
  strongestSources: string[];
  existingThinking: string;
  missingResearch: string;
};

export const LIBRARY_STATUS_LABELS: Record<string, string> = {
  SAVED: "Saved",
  READ: "Read",
  IMPORTANT: "Important",
  USE_FOR_ARTICLE: "Use for article",
  USE_FOR_RESEARCH: "Use for research",
  ARCHIVED: "Archived",
};

export const SOURCE_CATEGORY_LABELS: Record<string, string> = {
  PRIMARY: "Primary source",
  TRADE_PRESS: "Trade press",
  GENERAL_NEWS: "General news",
  ACADEMIC: "Academic",
  LEGAL_POLICY: "Legal / policy analysis",
};
