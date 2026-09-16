"use client";

import { useState } from "react";
import Link from "next/link";

type SearchResult = { kind: string; id: string; title: string; snippet: string; href: string };

export function ArchiveExplorer() {
  const [mode, setMode] = useState<"search" | "ask">("ask");
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [answer, setAnswer] = useState<string | null>(null);
  const [answerSources, setAnswerSources] = useState<SearchResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    if (!query.trim()) return;
    setBusy(true);
    setError(null);
    setAnswer(null);
    setResults([]);
    try {
      if (mode === "search") {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        setResults(await res.json());
      } else {
        const res = await fetch("/api/ask-archive", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: query }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setAnswer(data.answer);
        setAnswerSources(data.sources);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="border border-ink/15 rounded-lg p-4 mb-8 bg-white/40">
      <div className="flex gap-3 mb-3 text-xs">
        <button
          onClick={() => setMode("ask")}
          className={mode === "ask" ? "font-semibold underline" : "text-ink/50"}
        >
          Ask My Archive
        </button>
        <button
          onClick={() => setMode("search")}
          className={mode === "search" ? "font-semibold underline" : "text-ink/50"}
        >
          Keyword search
        </button>
      </div>
      <div className="flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && run()}
          placeholder={
            mode === "ask"
              ? "e.g. What have I saved about performer consent?"
              : "e.g. digital replica"
          }
          className="flex-1 border border-ink/20 rounded px-3 py-2 text-sm bg-transparent"
        />
        <button onClick={run} disabled={busy} className="text-sm underline px-2">
          {busy ? "…" : "Go"}
        </button>
      </div>

      {error && <p className="text-sm text-red-700 mt-3">{error}</p>}

      {answer && (
        <div className="mt-4">
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{answer}</p>
          {answerSources.length > 0 && (
            <div className="mt-2 text-xs text-ink/50">
              Sources: {answerSources.map((s, i) => (
                <Link key={i} href={s.href} className="underline mr-2">
                  {s.title}
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {results.length > 0 && (
        <ul className="mt-4 space-y-2">
          {results.map((r) => (
            <li key={`${r.kind}-${r.id}`} className="text-sm">
              <Link href={r.href} className="underline">
                {r.title}
              </Link>{" "}
              <span className="text-ink/50">({r.kind})</span> — {r.snippet.slice(0, 140)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
