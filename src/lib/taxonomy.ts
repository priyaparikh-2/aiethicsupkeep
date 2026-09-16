// Subject taxonomy from PRD §5.

export const CORE_TAGS = [
  "AI filmmaking",
  "Film / television",
  "Moving-image media",
  "Synthetic media",
  "AI ethics",
  "Copyright",
  "Authorship",
  "Likeness / digital replicas",
  "Performer rights",
  "Artist rights",
  "Consent",
  "Creative agency",
  "Labor",
  "Union agreements",
  "AI regulation",
  "AI policy",
  "AI literacy / education",
] as const;

export const RESEARCH_TAGS = [
  "Spectatorship",
  "Embodiment",
  "Performance",
  "Presence",
  "Human / machine authorship",
  "Indexicality",
  "Authenticity",
  "Deepfakes",
  "Digital doubles",
  "Synthetic actors",
  "Voice cloning",
  "Training data",
  "Dataset consent",
  "Cultural ownership",
  "Creative autonomy",
  "Film aesthetics",
  "Emerging cinematic forms",
  "XR / VR",
  "Interactive / generative moving images",
] as const;

export const NEW_MEDIA_FORM_TAG = "NEW MEDIA FORM";

export type CoreTag = (typeof CORE_TAGS)[number];
export type ResearchTag = (typeof RESEARCH_TAGS)[number];
export type AnyTag = CoreTag | ResearchTag;

export const ALL_TAGS: { name: string; tier: "CORE" | "RESEARCH" }[] = [
  ...CORE_TAGS.map((name) => ({ name, tier: "CORE" as const })),
  ...RESEARCH_TAGS.map((name) => ({ name, tier: "RESEARCH" as const })),
];

// Source registry from PRD §6. `rssUrl` is best-effort; ingestion should
// degrade gracefully (skip + log) when a feed is unavailable rather than
// failing the whole run.
export const SOURCE_REGISTRY: {
  name: string;
  sourceCategory:
    | "PRIMARY"
    | "TRADE_PRESS"
    | "GENERAL_NEWS"
    | "ACADEMIC"
    | "LEGAL_POLICY";
  homepageUrl: string;
  rssUrl?: string;
}[] = [
  // Primary sources
  { name: "SAG-AFTRA", sourceCategory: "PRIMARY", homepageUrl: "https://www.sagaftra.org", rssUrl: "https://www.sagaftra.org/rss.xml" },
  { name: "WGA", sourceCategory: "PRIMARY", homepageUrl: "https://www.wga.org" },
  { name: "DGA", sourceCategory: "PRIMARY", homepageUrl: "https://www.dga.org" },
  { name: "U.S. Copyright Office", sourceCategory: "PRIMARY", homepageUrl: "https://www.copyright.gov" },
  { name: "SSRN", sourceCategory: "ACADEMIC", homepageUrl: "https://www.ssrn.com" },

  // Trade press
  { name: "Variety", sourceCategory: "TRADE_PRESS", homepageUrl: "https://variety.com", rssUrl: "https://variety.com/feed/" },
  { name: "The Hollywood Reporter", sourceCategory: "TRADE_PRESS", homepageUrl: "https://www.hollywoodreporter.com", rssUrl: "https://www.hollywoodreporter.com/feed/" },
  { name: "Deadline", sourceCategory: "TRADE_PRESS", homepageUrl: "https://deadline.com", rssUrl: "https://deadline.com/feed/" },
  { name: "Screen International", sourceCategory: "TRADE_PRESS", homepageUrl: "https://www.screendaily.com" },
  { name: "IndieWire", sourceCategory: "TRADE_PRESS", homepageUrl: "https://www.indiewire.com", rssUrl: "https://www.indiewire.com/feed/" },

  // General news
  { name: "Reuters", sourceCategory: "GENERAL_NEWS", homepageUrl: "https://www.reuters.com" },
  { name: "Associated Press", sourceCategory: "GENERAL_NEWS", homepageUrl: "https://apnews.com" },
  { name: "BBC", sourceCategory: "GENERAL_NEWS", homepageUrl: "https://www.bbc.com/news", rssUrl: "http://feeds.bbci.co.uk/news/technology/rss.xml" },
  { name: "Financial Times", sourceCategory: "GENERAL_NEWS", homepageUrl: "https://www.ft.com" },
  { name: "The New York Times", sourceCategory: "GENERAL_NEWS", homepageUrl: "https://www.nytimes.com" },
  { name: "The Washington Post", sourceCategory: "GENERAL_NEWS", homepageUrl: "https://www.washingtonpost.com" },
  { name: "The Guardian", sourceCategory: "GENERAL_NEWS", homepageUrl: "https://www.theguardian.com", rssUrl: "https://www.theguardian.com/film/rss" },

  // Academic / research
  { name: "AI & Society", sourceCategory: "ACADEMIC", homepageUrl: "https://link.springer.com/journal/146" },
  { name: "New Media & Society", sourceCategory: "ACADEMIC", homepageUrl: "https://journals.sagepub.com/home/nms" },
  { name: "Convergence", sourceCategory: "ACADEMIC", homepageUrl: "https://journals.sagepub.com/home/con" },
  { name: "Screen", sourceCategory: "ACADEMIC", homepageUrl: "https://academic.oup.com/screen" },
  { name: "Film-Philosophy", sourceCategory: "ACADEMIC", homepageUrl: "https://www.euppublishing.com/loi/film" },
  { name: "Journal of Cinema and Media Studies", sourceCategory: "ACADEMIC", homepageUrl: "https://www.cmstudies.org/page/jcms" },
  { name: "NECSUS", sourceCategory: "ACADEMIC", homepageUrl: "https://necsus-ejms.org" },

  // Legal / policy
  { name: "JD Supra (Entertainment & Media)", sourceCategory: "LEGAL_POLICY", homepageUrl: "https://www.jdsupra.com" },
];

export const EXCLUDED_SOURCE_PATTERNS = [
  "medium.com",
  "linkedin.com",
  "reddit.com",
  "substack.com/p", // generic newsletters are reviewed case-by-case, not auto-included
];
