import Parser from "rss-parser";
import { SOURCE_REGISTRY } from "@/lib/taxonomy";

export type CandidateItem = {
  headline: string;
  url: string;
  sourceName: string;
  author?: string;
  publicationDate?: string; // ISO
  snippet?: string;
};

const parser = new Parser({ timeout: 15000 });

// Best-effort RSS ingestion across the registered trade/news/academic
// sources. A feed that fails to fetch (dead URL, blocked, timeout) is
// skipped rather than failing the whole run — the PRD's source list is
// aspirational and many outlets don't expose a public feed at all, which
// is expected and not an error condition.
export async function fetchCandidates(): Promise<{
  candidates: CandidateItem[];
  errors: { source: string; message: string }[];
}> {
  const candidates: CandidateItem[] = [];
  const errors: { source: string; message: string }[] = [];

  const feedSources = SOURCE_REGISTRY.filter((s) => s.rssUrl);

  await Promise.all(
    feedSources.map(async (source) => {
      try {
        const feed = await parser.parseURL(source.rssUrl!);
        for (const item of feed.items.slice(0, 15)) {
          if (!item.link || !item.title) continue;
          candidates.push({
            headline: item.title,
            url: item.link,
            sourceName: source.name,
            author: item.creator || (item as { author?: string }).author,
            publicationDate: item.isoDate || item.pubDate,
            snippet: (item.contentSnippet || item.content || "").slice(0, 600),
          });
        }
      } catch (err) {
        errors.push({
          source: source.name,
          message: err instanceof Error ? err.message : String(err),
        });
      }
    })
  );

  return { candidates, errors };
}
