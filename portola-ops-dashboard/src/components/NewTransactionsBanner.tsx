interface NewTransactionsBannerProps {
  count: number;
  canMerge: boolean;
  onMerge: () => void;
}

export function NewTransactionsBanner({
  count,
  canMerge,
  onMerge,
}: NewTransactionsBannerProps) {
  if (count === 0) return null;

  const label = count >= 100 ? "99+ new transactions" : `${count} new transaction${count === 1 ? "" : "s"}`;

  return (
    <div className="animate-slide-down">
      <button
        onClick={onMerge}
        disabled={!canMerge}
        title={!canMerge ? "Finish pending operations first" : undefined}
        className="w-full rounded-lg border border-blue-200 bg-blue-50 px-4 py-2.5 text-center text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {label} — click to load
      </button>
    </div>
  );
}
