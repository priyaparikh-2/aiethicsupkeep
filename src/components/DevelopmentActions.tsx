"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LIBRARY_STATUS_LABELS } from "@/lib/types";

const STATUS_OPTIONS = Object.keys(LIBRARY_STATUS_LABELS);

export function DevelopmentActions({
  developmentId,
  libraryItemId,
  status,
  primaryArticleUrl,
  primaryArticleSourceLabel,
}: {
  developmentId: string;
  libraryItemId?: string;
  status?: string;
  primaryArticleUrl?: string;
  primaryArticleSourceLabel?: string;
}) {
  const router = useRouter();
  const [savedItemId, setSavedItemId] = useState(libraryItemId);
  const [currentStatus, setCurrentStatus] = useState(status ?? "SAVED");
  const [showHighlight, setShowHighlight] = useState(false);
  const [showNote, setShowNote] = useState(false);
  const [passage, setPassage] = useState("");
  const [annotation, setAnnotation] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSave() {
    setBusy(true);
    try {
      const res = await fetch("/api/library", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ developmentId }),
      });
      const item = await res.json();
      setSavedItemId(item.id);
      setCurrentStatus(item.status);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function handleStatusChange(next: string) {
    setBusy(true);
    try {
      let id = savedItemId;
      if (!id) {
        const res = await fetch("/api/library", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ developmentId }),
        });
        id = (await res.json()).id;
        setSavedItemId(id);
      }
      await fetch(`/api/library/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      setCurrentStatus(next);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function submitHighlight() {
    if (!passage.trim()) return;
    setBusy(true);
    try {
      await fetch("/api/highlights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          developmentId,
          exactPassage: passage,
          annotation: annotation || null,
          sourceUrl: primaryArticleUrl || "",
          sourceLabel: primaryArticleSourceLabel || "Unknown source",
        }),
      });
      setPassage("");
      setAnnotation("");
      setShowHighlight(false);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function submitNote() {
    if (!noteContent.trim()) return;
    setBusy(true);
    try {
      await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "ARTICLE", content: noteContent, developmentId }),
      });
      setNoteContent("");
      setShowNote(false);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-3 text-sm">
      <div className="flex flex-wrap items-center gap-3">
        {!savedItemId ? (
          <button onClick={handleSave} disabled={busy} className="underline">
            Save
          </button>
        ) : (
          <select
            value={currentStatus}
            onChange={(e) => handleStatusChange(e.target.value)}
            disabled={busy}
            className="bg-transparent border border-ink/20 rounded px-2 py-1 text-xs"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {LIBRARY_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        )}
        <button onClick={() => setShowHighlight((v) => !v)} className="underline">
          Highlight
        </button>
        <button onClick={() => setShowNote((v) => !v)} className="underline">
          Add note
        </button>
        {primaryArticleUrl && (
          <a href={primaryArticleUrl} target="_blank" rel="noreferrer" className="underline">
            Open article
          </a>
        )}
      </div>

      {showHighlight && (
        <div className="mt-2 border border-ink/15 rounded p-3 space-y-2 bg-white/40">
          <textarea
            placeholder="Paste the exact passage you're highlighting…"
            value={passage}
            onChange={(e) => setPassage(e.target.value)}
            className="w-full text-sm border border-ink/15 rounded p-2 bg-transparent"
            rows={3}
          />
          <input
            placeholder="Optional note on this highlight"
            value={annotation}
            onChange={(e) => setAnnotation(e.target.value)}
            className="w-full text-sm border border-ink/15 rounded p-2 bg-transparent"
          />
          <button onClick={submitHighlight} disabled={busy} className="text-xs underline">
            Save highlight
          </button>
        </div>
      )}

      {showNote && (
        <div className="mt-2 border border-ink/15 rounded p-3 space-y-2 bg-white/40">
          <textarea
            placeholder="What are you thinking?"
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            className="w-full text-sm border border-ink/15 rounded p-2 bg-transparent"
            rows={3}
          />
          <button onClick={submitNote} disabled={busy} className="text-xs underline">
            Save note
          </button>
        </div>
      )}
    </div>
  );
}
