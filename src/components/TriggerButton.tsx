"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function TriggerButton({ endpoint, label, busyLabel }: { endpoint: string; label: string; busyLabel: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);

  async function run() {
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(endpoint, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");
      setResult(JSON.stringify(data));
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <button onClick={run} disabled={busy} className="text-xs underline text-ink/60">
        {busy ? busyLabel : label}
      </button>
      {error && <p className="text-xs text-red-700 mt-1 max-w-sm">{error}</p>}
      {result && !error && <p className="text-xs text-ink/40 mt-1">Done.</p>}
    </div>
  );
}
