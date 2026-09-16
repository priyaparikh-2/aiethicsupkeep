"use client";

import { useState } from "react";

type Settings = {
  deliveryTime: string;
  timezone: string;
  recipientEmail: string | null;
  weeklyReviewDay: string;
};

export function SettingsForm({ initial }: { initial: Settings }) {
  const [form, setForm] = useState(initial);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    setSaved(false);
    try {
      await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setSaved(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4 max-w-sm">
      <div>
        <label className="block text-xs uppercase tracking-wide text-ink/50 mb-1">
          Delivery time (24h, local)
        </label>
        <input
          type="time"
          value={form.deliveryTime}
          onChange={(e) => setForm({ ...form, deliveryTime: e.target.value })}
          className="border border-ink/20 rounded px-3 py-2 text-sm bg-transparent w-full"
        />
      </div>
      <div>
        <label className="block text-xs uppercase tracking-wide text-ink/50 mb-1">Timezone</label>
        <input
          value={form.timezone}
          onChange={(e) => setForm({ ...form, timezone: e.target.value })}
          placeholder="America/New_York"
          className="border border-ink/20 rounded px-3 py-2 text-sm bg-transparent w-full"
        />
      </div>
      <div>
        <label className="block text-xs uppercase tracking-wide text-ink/50 mb-1">
          Recipient email
        </label>
        <input
          type="email"
          value={form.recipientEmail ?? ""}
          onChange={(e) => setForm({ ...form, recipientEmail: e.target.value })}
          placeholder="you@example.com"
          className="border border-ink/20 rounded px-3 py-2 text-sm bg-transparent w-full"
        />
      </div>
      <div>
        <label className="block text-xs uppercase tracking-wide text-ink/50 mb-1">
          Weekly review day
        </label>
        <select
          value={form.weeklyReviewDay}
          onChange={(e) => setForm({ ...form, weeklyReviewDay: e.target.value })}
          className="border border-ink/20 rounded px-3 py-2 text-sm bg-transparent w-full"
        >
          {["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"].map((d) => (
            <option key={d} value={d}>
              {d[0] + d.slice(1).toLowerCase()}
            </option>
          ))}
        </select>
      </div>
      <button onClick={save} disabled={busy} className="text-sm underline">
        {busy ? "Saving…" : "Save settings"}
      </button>
      {saved && <span className="text-xs text-ink/50 ml-2">Saved.</span>}
    </div>
  );
}
