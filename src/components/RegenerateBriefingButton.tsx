"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function RegenerateBriefingButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/briefing/generate", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate briefing");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="text-right">
      <button onClick={handleClick} disabled={busy} className="text-xs underline text-ink/60">
        {busy ? "Generating…" : "Regenerate today's briefing"}
      </button>
      {error && <p className="text-xs text-red-700 mt-1 max-w-xs">{error}</p>}
    </div>
  );
}
