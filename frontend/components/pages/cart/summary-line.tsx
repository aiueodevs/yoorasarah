export function SummaryLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="mt-4 flex items-center justify-between gap-4 text-sm">
      <span className="text-ink-soft">{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
