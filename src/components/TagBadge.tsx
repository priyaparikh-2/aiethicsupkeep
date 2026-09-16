export function TagBadge({ name }: { name: string }) {
  return (
    <span className="inline-block text-xs border border-ink/20 rounded-full px-2 py-0.5 text-ink/70 mr-1 mb-1">
      {name}
    </span>
  );
}

export function SourceCategoryBadge({ label }: { label: string }) {
  return (
    <span className="text-xs uppercase tracking-wide text-ink/50">{label}</span>
  );
}
