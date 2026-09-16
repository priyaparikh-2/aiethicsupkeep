"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function NoteComposer({
  type,
  developmentId,
  highlightId,
  placeholder = "Write a note…",
}: {
  type: "ARTICLE" | "HIGHLIGHT" | "RESEARCH";
  developmentId?: string;
  highlightId?: string;
  placeholder?: string;
}) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (!content.trim()) return;
    setBusy(true);
    try {
      await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, content, developmentId, highlightId }),
      });
      setContent("");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex gap-2 items-start">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        rows={2}
        className="flex-1 text-sm border border-ink/15 rounded p-2 bg-transparent"
      />
      <button onClick={submit} disabled={busy} className="text-xs underline mt-2">
        Add
      </button>
    </div>
  );
}
