"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CORE_TAGS, RESEARCH_TAGS } from "@/lib/taxonomy";

export function ResearchNoteComposer({
  libraryOptions,
}: {
  libraryOptions: { developmentId: string; title: string }[];
}) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [linked, setLinked] = useState<Set<string>>(new Set());
  const [tags, setTags] = useState<Set<string>>(new Set());
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  function toggle(set: Set<string>, setter: (s: Set<string>) => void, value: string) {
    const next = new Set(set);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    setter(next);
  }

  async function submit() {
    if (!content.trim()) return;
    setBusy(true);
    try {
      await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "RESEARCH",
          content,
          developmentIds: Array.from(linked),
          tags: Array.from(tags),
        }),
      });
      setContent("");
      setLinked(new Set());
      setTags(new Set());
      setOpen(false);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="text-sm underline mb-6">
        + New research note
      </button>
    );
  }

  return (
    <div className="border border-ink/15 rounded-lg p-4 mb-6 bg-white/40 space-y-3">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="An independent thought — may link to several sources…"
        rows={4}
        className="w-full border border-ink/20 rounded p-2 text-sm bg-transparent"
      />

      {libraryOptions.length > 0 && (
        <div>
          <div className="text-xs uppercase tracking-wide text-ink/50 mb-1">Link to saved developments</div>
          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
            {libraryOptions.map((opt) => (
              <label key={opt.developmentId} className="text-xs flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={linked.has(opt.developmentId)}
                  onChange={() => toggle(linked, setLinked, opt.developmentId)}
                />
                {opt.title}
              </label>
            ))}
          </div>
        </div>
      )}

      <div>
        <div className="text-xs uppercase tracking-wide text-ink/50 mb-1">Tags</div>
        <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
          {[...CORE_TAGS, ...RESEARCH_TAGS].map((t) => (
            <label key={t} className="text-xs flex items-center gap-1">
              <input type="checkbox" checked={tags.has(t)} onChange={() => toggle(tags, setTags, t)} />
              {t}
            </label>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={submit} disabled={busy} className="text-sm underline">
          Save note
        </button>
        <button onClick={() => setOpen(false)} className="text-sm text-ink/50">
          Cancel
        </button>
      </div>
    </div>
  );
}
