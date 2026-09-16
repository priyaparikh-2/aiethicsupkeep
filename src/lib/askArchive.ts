import { callClaude, EDITORIAL_SYSTEM_PROMPT } from "@/lib/llm";
import { keywordSearch } from "@/lib/search";

// "Ask My Archive" (PRD §18): retrieves candidate passages from the user's
// own saved developments/notes/highlights by keyword overlap with the
// question, then asks the LLM to answer strictly from that material,
// citing which item each claim comes from. Never invents quotes from the
// user's notes (PRD §23).
export async function askArchive(question: string): Promise<{
  answer: string;
  sources: { title: string; href: string; kind: string }[];
}> {
  const terms = question
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 3);

  const seen = new Map<string, Awaited<ReturnType<typeof keywordSearch>>[number]>();
  for (const term of terms.slice(0, 8)) {
    const results = await keywordSearch({ q: term });
    for (const r of results) seen.set(`${r.kind}:${r.id}`, r);
  }
  // Also try the raw question as a phrase.
  for (const r of await keywordSearch({ q: question })) seen.set(`${r.kind}:${r.id}`, r);

  const candidates = Array.from(seen.values()).slice(0, 25);

  if (candidates.length === 0) {
    return {
      answer:
        "I could not find anything in your saved library, highlights, or notes that matches this question.",
      sources: [],
    };
  }

  const catalog = candidates
    .map((c, i) => `[${i}] (${c.kind}) "${c.title}" — ${c.snippet}`)
    .join("\n");

  const prompt = `The user is asking a question of their own private research archive
(saved developments, highlights, and notes). Below are the candidate
passages retrieved from that archive. Answer ONLY using this material.
Cite passages by their [n] index inline. If the archive doesn't actually
answer the question, say so plainly rather than guessing.

QUESTION: ${question}

ARCHIVE PASSAGES:
${catalog}

Write a concise, direct answer (3-8 sentences), grounded only in the passages above.`;

  const answer = await callClaude({ system: EDITORIAL_SYSTEM_PROMPT, prompt, maxTokens: 1200 });

  return {
    answer,
    sources: candidates.map((c) => ({ title: c.title, href: c.href, kind: c.kind })),
  };
}
